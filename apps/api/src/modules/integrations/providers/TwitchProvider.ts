import crypto from "crypto";
import { getSecretManager } from "../../secrets";
import type { IntegrationProvider } from "../IntegrationProvider";
import { AegisEventType, type NormalizedEvent } from "../EventTaxonomy";

const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID ?? "";
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET ?? "";
const TWITCH_REDIRECT_URI =
  process.env.TWITCH_REDIRECT_URI ?? "http://localhost:4000/v1/integrations/twitch/callback";

const TWITCH_SCOPES = [
  "chat:read",
  "chat:edit",
  "moderator:read:chatters",
  "channel:read:stream_key",
].join(" ");

const MOCK_MODE = !TWITCH_CLIENT_ID || !TWITCH_CLIENT_SECRET;

/**
 * TwitchProvider — full OAuth, EventSub HMAC webhook verification, and event normalization.
 *
 * Twitch uses the Eventsub subscription model:
 *   POST /eventsub/subscriptions to register hooks.
 *   Twitch sends a verification challenge (type = "webhook_callback_verification").
 *   Subsequent notifications are HMAC-signed with the webhook secret.
 */
export class TwitchProvider implements IntegrationProvider {
  async getAuthorizationUrl(workspaceId: string, state: string): Promise<string> {
    if (MOCK_MODE) {
      return `http://localhost:4000/v1/integrations/twitch/mock-callback?state=${state}&workspace=${workspaceId}`;
    }

    const params = new URLSearchParams({
      client_id: TWITCH_CLIENT_ID,
      redirect_uri: TWITCH_REDIRECT_URI,
      response_type: "code",
      scope: TWITCH_SCOPES,
      state,
    });

    return `https://id.twitch.tv/oauth2/authorize?${params.toString()}`;
  }

  async handleCallback(
    workspaceId: string,
    queryParams: Record<string, string>,
  ): Promise<{
    externalAccountId: string;
    displayHandle: string;
    secretReference: string;
    scopes: string[];
  }> {
    if (MOCK_MODE) {
      const secretReference = `ws:${workspaceId}:platform:TWITCH`;
      const sm = getSecretManager();
      await sm.storeSecret(`${secretReference}:accessToken`, "mock_twitch_access_token");
      await sm.storeSecret(`${secretReference}:refreshToken`, "mock_twitch_refresh_token");
      return {
        externalAccountId: "twitch_mock_user_id",
        displayHandle: "MockTwitchStreamer",
        secretReference,
        scopes: TWITCH_SCOPES.split(" "),
      };
    }

    const { code } = queryParams;
    const tokenRes = await fetch("https://id.twitch.tv/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: TWITCH_CLIENT_ID,
        client_secret: TWITCH_CLIENT_SECRET,
        redirect_uri: TWITCH_REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) throw new Error(`Twitch token exchange failed: ${tokenRes.statusText}`);

    const tokens = (await tokenRes.json()) as {
      access_token: string;
      refresh_token: string;
      scope: string[];
    };

    // Validate and get user info
    const userRes = await fetch("https://api.twitch.tv/helix/users", {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
        "Client-Id": TWITCH_CLIENT_ID,
      },
    });

    const userData = (await userRes.json()) as { data: { id: string; display_name: string }[] };
    const user = userData.data?.[0];
    const externalAccountId = user?.id ?? "unknown";
    const displayHandle = user?.display_name ?? "Unknown";

    const sm = getSecretManager();
    const secretReference = `ws:${workspaceId}:platform:TWITCH:${externalAccountId}`;
    await sm.storeSecret(`${secretReference}:accessToken`, tokens.access_token);
    await sm.storeSecret(`${secretReference}:refreshToken`, tokens.refresh_token);

    return {
      externalAccountId,
      displayHandle,
      secretReference,
      scopes: tokens.scope,
    };
  }

  async disconnect(workspaceId: string, secretReference: string): Promise<void> {
    const sm = getSecretManager();
    const accessToken = await sm.getSecret(`${secretReference}:accessToken`);
    if (accessToken && !MOCK_MODE) {
      await fetch("https://id.twitch.tv/oauth2/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ client_id: TWITCH_CLIENT_ID, token: accessToken }),
      }).catch(() => void 0);
    }
    await sm.deleteSecret(`${secretReference}:accessToken`);
    await sm.deleteSecret(`${secretReference}:refreshToken`);
  }

  async refreshToken(secretReference: string): Promise<{ accessToken: string; expiresAt?: Date }> {
    if (MOCK_MODE) {
      return { accessToken: "mock_twitch_refreshed", expiresAt: new Date(Date.now() + 3600_000) };
    }

    const sm = getSecretManager();
    const refreshToken = await sm.getSecret(`${secretReference}:refreshToken`);
    if (!refreshToken) throw new Error("No refresh token available");

    const res = await fetch("https://id.twitch.tv/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: TWITCH_CLIENT_ID,
        client_secret: TWITCH_CLIENT_SECRET,
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    });

    if (!res.ok) throw new Error(`Twitch token refresh failed: ${res.statusText}`);

    const data = (await res.json()) as { access_token: string; expires_in?: number };
    await sm.storeSecret(`${secretReference}:accessToken`, data.access_token);

    return {
      accessToken: data.access_token,
      expiresAt: data.expires_in ? new Date(Date.now() + data.expires_in * 1000) : undefined,
    };
  }

  /**
   * Twitch EventSub uses HMAC-SHA256 to sign payloads.
   * Header: Twitch-Eventsub-Message-Signature: sha256={hex_digest}
   * Message = message_id + message_timestamp + raw_body
   */
  async validateWebhook(
    headers: Record<string, string>,
    rawBody: string,
    webhookSecret?: string,
  ): Promise<boolean> {
    const secret = webhookSecret ?? process.env.TWITCH_WEBHOOK_SECRET ?? "mock-webhook-secret";
    const msgId = headers["twitch-eventsub-message-id"] ?? "";
    const msgTimestamp = headers["twitch-eventsub-message-timestamp"] ?? "";
    const msgSignature = headers["twitch-eventsub-message-signature"] ?? "";

    const hmacMessage = msgId + msgTimestamp + rawBody;
    const computed = crypto.createHmac("sha256", secret).update(hmacMessage).digest("hex");
    const expected = `sha256=${computed}`;

    const expectedBuffer = Buffer.from(expected);
    const signatureBuffer = Buffer.from(msgSignature);

    if (expectedBuffer.length !== signatureBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
  }

  async normalizeEvent(rawPayload: unknown, _eventType?: string): Promise<NormalizedEvent | null> {
    const payload = rawPayload as Record<string, unknown>;
    const subscription = payload.subscription as Record<string, unknown> | undefined;
    const event = payload.event as Record<string, unknown> | undefined;
    const type = subscription?.type as string | undefined;

    if (!type || !event) return null;

    switch (type) {
      case "stream.online":
        return {
          eventType: AegisEventType.LIVE_STARTED,
          externalId: `twitch_stream_online_${event.id}`,
          payload: {
            broadcasterId: event.broadcaster_user_id,
            broadcasterName: event.broadcaster_user_name,
            streamType: event.type,
            startedAt: event.started_at,
          },
        };

      case "stream.offline":
        return {
          eventType: AegisEventType.LIVE_ENDED,
          externalId: `twitch_stream_offline_${event.broadcaster_user_id}_${Date.now()}`,
          payload: {
            broadcasterId: event.broadcaster_user_id,
            broadcasterName: event.broadcaster_user_name,
          },
        };

      case "channel.chat.message":
        return {
          eventType: AegisEventType.CHAT_MESSAGE,
          externalId: `twitch_chat_${event.message_id}`,
          payload: {
            messageId: event.message_id,
            broadcasterId: event.broadcaster_user_id,
            authorId: event.chatter_user_id,
            authorName: event.chatter_user_name,
            text: (event.message as Record<string, unknown>)?.text,
            sentAt: event.broadcaster_user_login,
          },
        };

      case "channel.ban":
        return {
          eventType: AegisEventType.CHAT_BAN,
          externalId: `twitch_ban_${event.user_id}_${event.broadcaster_user_id}`,
          payload: {
            broadcasterId: event.broadcaster_user_id,
            bannedUserId: event.user_id,
            bannedUserName: event.user_name,
            reason: event.reason,
            endsAt: event.ends_at ?? null,
            isPermanent: !event.ends_at,
          },
        };

      case "channel.follow":
        return {
          eventType: AegisEventType.FOLLOWER_GAINED,
          externalId: `twitch_follow_${event.user_id}_${event.broadcaster_user_id}`,
          payload: {
            userId: event.user_id,
            userName: event.user_name,
            broadcasterId: event.broadcaster_user_id,
            followedAt: event.followed_at,
          },
        };

      case "channel.raid":
        return {
          eventType: AegisEventType.CHAT_RAID,
          externalId: `twitch_raid_${event.from_broadcaster_user_id}_${event.to_broadcaster_user_id}`,
          payload: {
            fromBroadcasterId: event.from_broadcaster_user_id,
            fromBroadcasterName: event.from_broadcaster_user_name,
            toBroadcasterId: event.to_broadcaster_user_id,
            viewerCount: event.viewers,
          },
        };

      default:
        return null;
    }
  }

  async healthCheck(secretReference: string): Promise<{
    status: "HEALTHY" | "DEGRADED" | "ERROR";
    message?: string;
  }> {
    if (MOCK_MODE) return { status: "HEALTHY", message: "Mock mode" };

    const sm = getSecretManager();
    const accessToken = await sm.getSecret(`${secretReference}:accessToken`);
    if (!accessToken) return { status: "ERROR", message: "No access token" };

    const res = await fetch("https://id.twitch.tv/oauth2/validate", {
      headers: { Authorization: `OAuth ${accessToken}` },
    });

    if (res.ok) return { status: "HEALTHY" };
    if (res.status === 401)
      return { status: "DEGRADED", message: "Token invalid — reauth required" };
    return { status: "ERROR", message: `Twitch API error: ${res.status}` };
  }
}
