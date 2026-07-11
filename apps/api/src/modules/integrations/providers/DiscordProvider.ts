import crypto from "crypto";
import { getSecretManager } from "../../secrets";
import type { IntegrationProvider } from "../IntegrationProvider";
import { AegisEventType, type NormalizedEvent } from "../EventTaxonomy";

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID ?? "";
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET ?? "";
const DISCORD_REDIRECT_URI =
  process.env.DISCORD_REDIRECT_URI ?? "http://localhost:4000/v1/integrations/discord/callback";
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN ?? "";

const DISCORD_SCOPES = ["identify", "guilds", "bot"].join(" ");
const DISCORD_BOT_PERMISSIONS = "8"; // Administrator — scope-down in production

const MOCK_MODE = !DISCORD_CLIENT_ID || !DISCORD_CLIENT_SECRET;

/**
 * DiscordProvider — OAuth2 + Interactions endpoint (Ed25519) webhook verification.
 *
 * Discord uses Ed25519 public-key signatures for webhook validation.
 * Every interaction POST must be verified before processing.
 */
export class DiscordProvider implements IntegrationProvider {
  async getAuthorizationUrl(workspaceId: string, state: string): Promise<string> {
    if (MOCK_MODE) {
      return `http://localhost:4000/v1/integrations/discord/mock-callback?state=${state}&workspace=${workspaceId}`;
    }

    const params = new URLSearchParams({
      client_id: DISCORD_CLIENT_ID,
      redirect_uri: DISCORD_REDIRECT_URI,
      response_type: "code",
      scope: DISCORD_SCOPES,
      permissions: DISCORD_BOT_PERMISSIONS,
      state,
    });

    return `https://discord.com/api/oauth2/authorize?${params.toString()}`;
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
      const secretReference = `ws:${workspaceId}:platform:DISCORD`;
      const sm = getSecretManager();
      await sm.storeSecret(`${secretReference}:accessToken`, "mock_discord_access_token");
      await sm.storeSecret(`${secretReference}:refreshToken`, "mock_discord_refresh_token");
      return {
        externalAccountId: "discord_mock_guild_id",
        displayHandle: "Mock Discord Server",
        secretReference,
        scopes: DISCORD_SCOPES.split(" "),
      };
    }

    const { code } = queryParams;
    const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        client_secret: DISCORD_CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: DISCORD_REDIRECT_URI,
      }),
    });

    if (!tokenRes.ok) throw new Error(`Discord token exchange failed: ${tokenRes.statusText}`);

    const tokens = (await tokenRes.json()) as {
      access_token: string;
      refresh_token: string;
      expires_in: number;
      scope: string;
      guild?: { id: string; name: string };
    };

    const sm = getSecretManager();
    const guildId = tokens.guild?.id ?? "unknown";
    const guildName = tokens.guild?.name ?? "Unknown Server";
    const secretReference = `ws:${workspaceId}:platform:DISCORD:${guildId}`;

    await sm.storeSecret(`${secretReference}:accessToken`, tokens.access_token);
    await sm.storeSecret(`${secretReference}:refreshToken`, tokens.refresh_token);

    return {
      externalAccountId: guildId,
      displayHandle: guildName,
      secretReference,
      scopes: tokens.scope.split(" "),
    };
  }

  async disconnect(workspaceId: string, secretReference: string): Promise<void> {
    const sm = getSecretManager();
    const accessToken = await sm.getSecret(`${secretReference}:accessToken`);
    if (accessToken && !MOCK_MODE) {
      await fetch("https://discord.com/api/oauth2/token/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: DISCORD_CLIENT_ID,
          client_secret: DISCORD_CLIENT_SECRET,
          token: accessToken,
        }),
      }).catch(() => void 0);
    }
    await sm.deleteSecret(`${secretReference}:accessToken`);
    await sm.deleteSecret(`${secretReference}:refreshToken`);
  }

  async refreshToken(secretReference: string): Promise<{ accessToken: string; expiresAt?: Date }> {
    if (MOCK_MODE) {
      return {
        accessToken: "mock_discord_refreshed",
        expiresAt: new Date(Date.now() + 604_800_000),
      };
    }

    const sm = getSecretManager();
    const refreshToken = await sm.getSecret(`${secretReference}:refreshToken`);
    if (!refreshToken) throw new Error("No Discord refresh token");

    const res = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        client_secret: DISCORD_CLIENT_SECRET,
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    });

    if (!res.ok) throw new Error(`Discord token refresh failed: ${res.statusText}`);

    const data = (await res.json()) as { access_token: string; expires_in?: number };
    await sm.storeSecret(`${secretReference}:accessToken`, data.access_token);

    return {
      accessToken: data.access_token,
      expiresAt: data.expires_in ? new Date(Date.now() + data.expires_in * 1000) : undefined,
    };
  }

  /**
   * Discord uses Ed25519 signatures for Interactions Endpoint webhooks.
   * Headers: X-Signature-Ed25519 and X-Signature-Timestamp
   *
   * Verification: ed25519.verify(timestamp + rawBody, sig, PUBLIC_KEY)
   *
   * Note: Ed25519 is not natively available in Node < 22 crypto verify.
   * We implement it using the `crypto` module's subtle interface (available in Node 18+).
   */
  async validateWebhook(
    headers: Record<string, string>,
    rawBody: string,
    _webhookSecret?: string,
  ): Promise<boolean> {
    const publicKey = process.env.DISCORD_PUBLIC_KEY;
    if (!publicKey) {
      // In mock mode, accept all webhooks
      return true;
    }

    const signature = headers["x-signature-ed25519"] ?? "";
    const timestamp = headers["x-signature-timestamp"] ?? "";

    try {
      const publicKeyBuffer = Buffer.from(publicKey, "hex");
      const signatureBuffer = Buffer.from(signature, "hex");
      const messageBuffer = Buffer.from(timestamp + rawBody);

      const cryptoKey = await crypto.subtle.importKey(
        "raw",
        publicKeyBuffer,
        { name: "Ed25519" },
        false,
        ["verify"],
      );

      return await crypto.subtle.verify("Ed25519", cryptoKey, signatureBuffer, messageBuffer);
    } catch {
      return false;
    }
  }

  async normalizeEvent(rawPayload: unknown, _eventType?: string): Promise<NormalizedEvent | null> {
    const payload = rawPayload as Record<string, unknown>;

    // Discord Gateway events via bot
    const type = payload.t as string | undefined;
    const data = payload.d as Record<string, unknown> | undefined;

    if (!type || !data) return null;

    switch (type) {
      case "MESSAGE_CREATE":
        return {
          eventType: AegisEventType.CHAT_MESSAGE,
          externalId: `discord_msg_${data.id}`,
          payload: {
            messageId: data.id,
            channelId: data.channel_id,
            guildId: data.guild_id,
            authorId: (data.author as Record<string, unknown>)?.id,
            authorName: (data.author as Record<string, unknown>)?.username,
            content: "[encrypted]", // Never store plaintext content directly
            hasAttachments:
              Array.isArray(data.attachments) && (data.attachments as unknown[]).length > 0,
            timestamp: data.timestamp,
          },
        };

      case "GUILD_BAN_ADD":
        return {
          eventType: AegisEventType.CHAT_BAN,
          externalId: `discord_ban_${(data.user as Record<string, unknown>)?.id}_${data.guild_id}`,
          payload: {
            guildId: data.guild_id,
            bannedUserId: (data.user as Record<string, unknown>)?.id,
            bannedUserName: (data.user as Record<string, unknown>)?.username,
          },
        };

      case "GUILD_MEMBER_ADD":
        return {
          eventType: AegisEventType.FOLLOWER_GAINED,
          externalId: `discord_member_join_${(data.user as Record<string, unknown>)?.id}_${data.guild_id}`,
          payload: {
            guildId: data.guild_id,
            userId: (data.user as Record<string, unknown>)?.id,
            joinedAt: data.joined_at,
          },
        };

      default:
        return null;
    }
  }

  async healthCheck(_secretReference: string): Promise<{
    status: "HEALTHY" | "DEGRADED" | "ERROR";
    message?: string;
  }> {
    if (MOCK_MODE) return { status: "HEALTHY", message: "Mock mode" };
    if (!DISCORD_BOT_TOKEN) return { status: "DEGRADED", message: "No bot token configured" };

    const res = await fetch("https://discord.com/api/v10/users/@me", {
      headers: { Authorization: `Bot ${DISCORD_BOT_TOKEN}` },
    });

    if (res.ok) return { status: "HEALTHY" };
    if (res.status === 401) return { status: "DEGRADED", message: "Invalid bot token" };
    return { status: "ERROR", message: `Discord API error: ${res.status}` };
  }
}
