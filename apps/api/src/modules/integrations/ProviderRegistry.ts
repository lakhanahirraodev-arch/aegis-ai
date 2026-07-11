import type { IntegrationProvider } from "./IntegrationProvider";
import { YouTubeProvider } from "./providers/YouTubeProvider";
import { TwitchProvider } from "./providers/TwitchProvider";
import { DiscordProvider } from "./providers/DiscordProvider";
import {
  TikTokProvider,
  InstagramProvider,
  KickProvider,
  TwitterProvider,
} from "./providers/StubProviders";

/**
 * Platform strings as used in the DB Platform enum.
 * This type mirrors `Platform` from the Prisma schema so no enum import is needed.
 */
export type PlatformKey =
  | "YOUTUBE"
  | "TWITCH"
  | "DISCORD"
  | "TIKTOK"
  | "INSTAGRAM"
  | "KICK"
  | "X"
  | "FACEBOOK"
  | "LINKEDIN"
  | "TELEGRAM"
  | "REDDIT";

/**
 * ProviderRegistry — single source of truth for platform adapters.
 *
 * To add a new platform:
 *   1. Implement `IntegrationProvider`.
 *   2. Import and add it to `registry` below.
 *   No other files need to change.
 */
class ProviderRegistry {
  private readonly registry = new Map<PlatformKey, IntegrationProvider>();

  constructor() {
    this.register("YOUTUBE", new YouTubeProvider());
    this.register("TWITCH", new TwitchProvider());
    this.register("DISCORD", new DiscordProvider());
    this.register("TIKTOK", new TikTokProvider());
    this.register("INSTAGRAM", new InstagramProvider());
    this.register("KICK", new KickProvider());
    this.register("X", new TwitterProvider());
  }

  register(platform: PlatformKey, provider: IntegrationProvider): void {
    this.registry.set(platform, provider);
  }

  get(platform: PlatformKey): IntegrationProvider {
    const provider = this.registry.get(platform);
    if (!provider) {
      throw new Error(`No provider registered for platform: ${platform}`);
    }
    return provider;
  }

  has(platform: string): platform is PlatformKey {
    return this.registry.has(platform as PlatformKey);
  }

  /** All registered platform keys. */
  platforms(): PlatformKey[] {
    return Array.from(this.registry.keys());
  }
}

// Singleton — instantiated once at startup
export const providerRegistry = new ProviderRegistry();
