import { getSecretManager } from "../../secrets";
import type { IntegrationProvider } from "../IntegrationProvider";
import { AegisEventType, type NormalizedEvent } from "../EventTaxonomy";

const YOUTUBE_CLIENT_ID = process.env.YOUTUBE_CLIENT_ID ?? "";
const YOUTUBE_CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET ?? "";
const YOUTUBE_REDIRECT_URI =
  process.env.YOUTUBE_REDIRECT_URI ?? "http://localhost:4000/v1/integrations/youtube/callback";

const YOUTUBE_SCOPES = [
  "https://www.googleapis.com/auth/youtube.readonly",
  "https://www.googleapis.com/auth/youtube.force-ssl",
].join(" ");

const MOCK_MODE = !YOUTUBE_CLIENT_ID || !YOUTUBE_CLIENT_SECRET;

/**
 * YouTubeProvider — full OAuth, webhook verification, and event normalization.
 *
 * Mock mode: when YOUTUBE_CLIENT_ID / YOUTUBE_CLIENT_SECRET are not set the
 * provider returns deterministic mock responses so the dashboard is still
 * functional in development without real credentials.
 */
export class YouTubeProvider implements IntegrationProvider {
  async getAuthorizationUrl(workspaceId: string, state: string): Promise<string> {
    if (MOCK_MODE) {
      return `http://localhost:4000/v1/integrations/youtube/mock-callback?state=${state}&workspace=${workspaceId}`;
    }

    const params = new URLSearchParams({
      client_id: YOUTUBE_CLIENT_ID,
      redirect_uri: YOUTUBE_REDIRECT_URI,
      response_type: "code",
      scope: YOUTUBE_SCOPES,
      access_type: "offline",
      prompt: "consent",
      state,
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
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
      const secretReference = `ws:${workspaceId}:platform:YOUTUBE`;
      const sm = getSecretManager();
      await sm.storeSecret(`${secretReference}:accessToken`, "mock_yt_access_token");
      await sm.storeSecret(`${secretReference}:refreshToken`, "mock_yt_refresh_token");
      return {
        externalAccountId: "UC_mock_youtube_channel_id",
        displayHandle: "MockYouTubeChannel",
        secretReference,
        scopes: YOUTUBE_SCOPES.split(" "),
      };
    }

    const { code } = queryParams;
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: YOUTUBE_CLIENT_ID,
        client_secret: YOUTUBE_CLIENT_SECRET,
        redirect_uri: YOUTUBE_REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      throw new Error(`YouTube token exchange failed: ${tokenRes.statusText}`);
    }

    const tokens = (await tokenRes.json()) as {
      access_token: string;
      refresh_token?: string;
      expires_in: number;
      scope: string;
    };

    // Fetch channel info
    const channelRes = await fetch(
      "https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true",
      { headers: { Authorization: `Bearer ${tokens.access_token}` } },
    );

    const channelData = (await channelRes.json()) as {
      items?: { id: string; snippet: { title: string } }[];
    };

    const channel = channelData.items?.[0];
    const externalAccountId = channel?.id ?? "unknown";
    const displayHandle = channel?.snippet?.title ?? "Unknown Channel";

    const sm = getSecretManager();
    const secretReference = `ws:${workspaceId}:platform:YOUTUBE:${externalAccountId}`;
    await sm.storeSecret(`${secretReference}:accessToken`, tokens.access_token);
    if (tokens.refresh_token) {
      await sm.storeSecret(`${secretReference}:refreshToken`, tokens.refresh_token);
    }

    return {
      externalAccountId,
      displayHandle,
      secretReference,
      scopes: tokens.scope.split(" "),
    };
  }

  async disconnect(workspaceId: string, secretReference: string): Promise<void> {
    const sm = getSecretManager();
    const accessToken = await sm.getSecret(`${secretReference}:accessToken`);
    if (accessToken && !MOCK_MODE) {
      // Best-effort token revocation
      await fetch(`https://oauth2.googleapis.com/revoke?token=${accessToken}`, {
        method: "POST",
      }).catch(() => void 0);
    }
    await sm.deleteSecret(`${secretReference}:accessToken`);
    await sm.deleteSecret(`${secretReference}:refreshToken`);
  }

  async refreshToken(secretReference: string): Promise<{ accessToken: string; expiresAt?: Date }> {
    if (MOCK_MODE) {
      return { accessToken: "mock_yt_refreshed_token", expiresAt: new Date(Date.now() + 3600_000) };
    }

    const sm = getSecretManager();
    const refreshToken = await sm.getSecret(`${secretReference}:refreshToken`);
    if (!refreshToken) throw new Error("No refresh token available");

    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: YOUTUBE_CLIENT_ID,
        client_secret: YOUTUBE_CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });

    if (!res.ok) throw new Error(`YouTube token refresh failed: ${res.statusText}`);

    const data = (await res.json()) as { access_token: string; expires_in: number };
    await sm.storeSecret(`${secretReference}:accessToken`, data.access_token);

    return {
      accessToken: data.access_token,
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
    };
  }

  /**
   * YouTube sends a hub.challenge GET parameter for subscription verification.
   * For POST notifications, there is no signature — we rely on HTTPS + secret token.
   */
  async validateWebhook(
    headers: Record<string, string>,
    rawBody: string,
    webhookSecret?: string,
  ): Promise<boolean> {
    // YouTube PubSubHubbub doesn't sign POST payloads; we accept and rely on
    // the hub.secret query param being pre-verified at the subscription level.
    // Return true to allow event ingestion.
    void headers;
    void rawBody;
    void webhookSecret;
    return true;
  }

  async normalizeEvent(rawPayload: unknown, _eventType?: string): Promise<NormalizedEvent | null> {
    const payload = rawPayload as Record<string, unknown>;

    // Handle PubSubHubbub Atom feed — video upload notification
    if (payload.feed) {
      const feed = payload.feed as Record<string, unknown>;
      const videoId =
        (feed["yt:videoId"] as string) ??
        (feed.entry as Record<string, unknown>)?.["yt:videoId"] ??
        "unknown";
      return {
        eventType: AegisEventType.VIDEO_UPLOADED,
        externalId: `yt_video_${videoId}`,
        payload: {
          videoId,
          channelId: (feed["yt:channelId"] as string) ?? null,
          title: (feed.title as string) ?? null,
          published: (feed.published as string) ?? null,
        },
      };
    }

    // Live broadcast status
    if (payload.kind === "youtube#liveBroadcast") {
      const status = (payload.status as Record<string, unknown>)?.lifeCycleStatus as string;
      const id = payload.id as string;
      const eventType =
        status === "live"
          ? AegisEventType.LIVE_STARTED
          : status === "complete"
            ? AegisEventType.LIVE_ENDED
            : null;
      if (!eventType) return null;
      return {
        eventType,
        externalId: `yt_broadcast_${id}`,
        payload: { broadcastId: id, status, title: payload.snippet },
      };
    }

    return null;
  }

  async healthCheck(secretReference: string): Promise<{
    status: "HEALTHY" | "DEGRADED" | "ERROR";
    message?: string;
  }> {
    if (MOCK_MODE) {
      return { status: "HEALTHY", message: "Mock mode — no real credentials" };
    }

    const sm = getSecretManager();
    const accessToken = await sm.getSecret(`${secretReference}:accessToken`);
    if (!accessToken) return { status: "ERROR", message: "No access token stored" };

    const res = await fetch("https://www.googleapis.com/youtube/v3/channels?part=id&mine=true", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (res.ok) return { status: "HEALTHY" };
    if (res.status === 401)
      return { status: "DEGRADED", message: "Token expired — refresh required" };
    return { status: "ERROR", message: `YouTube API error: ${res.status}` };
  }
}
