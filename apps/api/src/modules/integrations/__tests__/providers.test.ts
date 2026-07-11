import { describe, it, expect } from "vitest";
import { TwitchProvider } from "../providers/TwitchProvider";
import { YouTubeProvider } from "../providers/YouTubeProvider";
import crypto from "crypto";

// ─── TwitchProvider webhook validation ────────────────────────────────────

describe("TwitchProvider.validateWebhook", () => {
  const provider = new TwitchProvider();
  const secret = "test_webhook_secret";

  function buildTwitchHeaders(
    msgId: string,
    timestamp: string,
    body: string,
    secret: string,
  ): Record<string, string> {
    const hmacMessage = msgId + timestamp + body;
    const sig = crypto.createHmac("sha256", secret).update(hmacMessage).digest("hex");
    return {
      "twitch-eventsub-message-id": msgId,
      "twitch-eventsub-message-timestamp": timestamp,
      "twitch-eventsub-message-signature": `sha256=${sig}`,
    };
  }

  it("should return true for a valid Twitch HMAC signature", async () => {
    const body = JSON.stringify({ subscription: { type: "stream.online" }, event: { id: "123" } });
    const headers = buildTwitchHeaders("msg-id-001", "2024-01-01T00:00:00Z", body, secret);
    const result = await provider.validateWebhook(headers, body, secret);
    expect(result).toBe(true);
  });

  it("should return false for an invalid Twitch HMAC signature", async () => {
    const body = JSON.stringify({ test: "data" });
    const headers = buildTwitchHeaders("msg-id-002", "2024-01-01T00:00:00Z", body, secret);
    // Tamper with signature
    headers["twitch-eventsub-message-signature"] =
      "sha256=invalidhexvalue000000000000000000000000000000000000000000000000000";
    const result = await provider.validateWebhook(headers, body, secret);
    expect(result).toBe(false);
  });

  it("should return false when body is tampered after signing", async () => {
    const originalBody = JSON.stringify({ event: "stream.online" });
    const headers = buildTwitchHeaders("msg-id-003", "2024-01-01T00:00:00Z", originalBody, secret);
    const tamperedBody = JSON.stringify({ event: "stream.offline" });
    const result = await provider.validateWebhook(headers, tamperedBody, secret);
    expect(result).toBe(false);
  });
});

// ─── TwitchProvider.normalizeEvent ────────────────────────────────────────

describe("TwitchProvider.normalizeEvent", () => {
  const provider = new TwitchProvider();

  it("should normalize stream.online to LIVE_STARTED", async () => {
    const payload = {
      subscription: { type: "stream.online" },
      event: {
        id: "stream-001",
        broadcaster_user_id: "user-123",
        broadcaster_user_name: "TestStreamer",
        type: "live",
        started_at: "2024-01-01T00:00:00Z",
      },
    };
    const result = await provider.normalizeEvent(payload);
    expect(result).not.toBeNull();
    expect(result?.eventType).toBe("LIVE_STARTED");
    expect(result?.externalId).toContain("twitch_stream_online");
    expect(result?.payload.broadcasterId).toBe("user-123");
  });

  it("should normalize stream.offline to LIVE_ENDED", async () => {
    const payload = {
      subscription: { type: "stream.offline" },
      event: { broadcaster_user_id: "user-123", broadcaster_user_name: "TestStreamer" },
    };
    const result = await provider.normalizeEvent(payload);
    expect(result?.eventType).toBe("LIVE_ENDED");
  });

  it("should normalize channel.ban to CHAT_BAN", async () => {
    const payload = {
      subscription: { type: "channel.ban" },
      event: {
        user_id: "banned-user",
        user_name: "BadActor",
        broadcaster_user_id: "broadcaster",
        reason: "TOS violation",
        ends_at: null,
      },
    };
    const result = await provider.normalizeEvent(payload);
    expect(result?.eventType).toBe("CHAT_BAN");
    expect(result?.payload.isPermanent).toBe(true);
  });

  it("should normalize channel.follow to FOLLOWER_GAINED", async () => {
    const payload = {
      subscription: { type: "channel.follow" },
      event: {
        user_id: "new-follower",
        user_name: "NewFan",
        broadcaster_user_id: "broadcaster",
        followed_at: "2024-01-01T00:00:00Z",
      },
    };
    const result = await provider.normalizeEvent(payload);
    expect(result?.eventType).toBe("FOLLOWER_GAINED");
  });

  it("should return null for unrecognized event types", async () => {
    const payload = {
      subscription: { type: "channel.subscribe" },
      event: { some: "data" },
    };
    const result = await provider.normalizeEvent(payload);
    expect(result).toBeNull();
  });

  it("should return null when subscription or event is missing", async () => {
    const result = await provider.normalizeEvent({});
    expect(result).toBeNull();
  });
});

// ─── YouTubeProvider.handleYouTubeChallenge ────────────────────────────────

describe("YouTubeProvider.normalizeEvent (video upload)", () => {
  const provider = new YouTubeProvider();

  it("should normalize feed payload to VIDEO_UPLOADED", async () => {
    const payload = {
      feed: {
        "yt:videoId": "dQw4w9WgXcQ",
        "yt:channelId": "UC_channel_123",
        title: "Test Video Title",
        published: "2024-01-01T00:00:00Z",
      },
    };
    const result = await provider.normalizeEvent(payload);
    expect(result?.eventType).toBe("VIDEO_UPLOADED");
    expect(result?.externalId).toContain("yt_video_dQw4w9WgXcQ");
    expect(result?.payload.channelId).toBe("UC_channel_123");
  });

  it("should return null for unknown YouTube payloads", async () => {
    const result = await provider.normalizeEvent({ unknown: "format" });
    expect(result).toBeNull();
  });
});

// ─── EventBus idempotency (lightweight integration test) ──────────────────
// Full integration test requires Redis + DB — test the normalization path only.

describe("ProviderRegistry", () => {
  it("should have all 7 platforms registered", async () => {
    const { providerRegistry } = await import("../ProviderRegistry");
    const platforms = providerRegistry.platforms();
    expect(platforms).toContain("YOUTUBE");
    expect(platforms).toContain("TWITCH");
    expect(platforms).toContain("DISCORD");
    expect(platforms).toContain("TIKTOK");
    expect(platforms).toContain("INSTAGRAM");
    expect(platforms).toContain("KICK");
    expect(platforms).toContain("X");
  });

  it("should return a provider for each registered platform", async () => {
    const { providerRegistry } = await import("../ProviderRegistry");
    for (const platform of providerRegistry.platforms()) {
      const provider = providerRegistry.get(platform);
      expect(provider).toBeDefined();
      expect(typeof provider.validateWebhook).toBe("function");
      expect(typeof provider.normalizeEvent).toBe("function");
    }
  });

  it("should throw for unregistered platform", async () => {
    const { providerRegistry } = await import("../ProviderRegistry");
    expect(() => providerRegistry.get("SNAPCHAT" as any)).toThrow();
  });
});
