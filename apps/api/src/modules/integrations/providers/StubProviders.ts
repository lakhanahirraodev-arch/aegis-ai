import type { IntegrationProvider } from "../IntegrationProvider";
import type { NormalizedEvent } from "../EventTaxonomy";

/**
 * Stub provider base for platforms not yet fully implemented.
 *
 * Provides correct interface compliance, deterministic mock responses,
 * and a clear extension path. Override individual methods as each
 * platform's OAuth is activated.
 */
abstract class StubProvider implements IntegrationProvider {
  abstract readonly platformName: string;

  async getAuthorizationUrl(workspaceId: string, state: string): Promise<string> {
    return `http://localhost:4000/v1/integrations/${this.platformName.toLowerCase()}/mock-callback?state=${state}&workspace=${workspaceId}`;
  }

  async handleCallback(
    workspaceId: string,
    _queryParams: Record<string, string>,
  ): Promise<{
    externalAccountId: string;
    displayHandle: string;
    secretReference: string;
    scopes: string[];
  }> {
    return {
      externalAccountId: `${this.platformName.toLowerCase()}_mock_id`,
      displayHandle: `Mock ${this.platformName} Account`,
      secretReference: `ws:${workspaceId}:platform:${this.platformName.toUpperCase()}`,
      scopes: [],
    };
  }

  async disconnect(_workspaceId: string, _secretReference: string): Promise<void> {
    // No-op for stub providers
  }

  async refreshToken(_secretReference: string): Promise<{ accessToken: string; expiresAt?: Date }> {
    return {
      accessToken: `mock_${this.platformName.toLowerCase()}_refreshed`,
      expiresAt: new Date(Date.now() + 3600_000),
    };
  }

  async validateWebhook(
    _headers: Record<string, string>,
    _rawBody: string,
    _webhookSecret?: string,
  ): Promise<boolean> {
    // Stub: accept all webhooks in mock mode
    return true;
  }

  async normalizeEvent(_rawPayload: unknown, _eventType?: string): Promise<NormalizedEvent | null> {
    // Stub: no events to normalize yet
    return null;
  }

  async healthCheck(_secretReference: string): Promise<{
    status: "HEALTHY" | "DEGRADED" | "ERROR";
    message?: string;
  }> {
    return {
      status: "HEALTHY",
      message: `${this.platformName} provider is a stub — not yet implemented`,
    };
  }
}

// ─── Concrete stub providers ───────────────────────────────────────────────

/** TikTok — stub. Full implementation in a future sprint. */
export class TikTokProvider extends StubProvider {
  readonly platformName = "TikTok";
}

/** Instagram — stub. Full implementation in a future sprint. */
export class InstagramProvider extends StubProvider {
  readonly platformName = "Instagram";
}

/** Kick — stub. Full implementation in a future sprint. */
export class KickProvider extends StubProvider {
  readonly platformName = "Kick";
}

/** X (Twitter) — stub. Full implementation in a future sprint. */
export class TwitterProvider extends StubProvider {
  readonly platformName = "X";
}
