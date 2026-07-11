import type { NormalizedEvent } from "./EventTaxonomy";

/**
 * IntegrationProvider — the contract every platform adapter must fulfill.
 *
 * New providers (LinkedIn, Patreon, Slack, …) are added by implementing
 * this interface and registering in ProviderRegistry. No existing code changes.
 */
export interface IntegrationProvider {
  /**
   * Initiate the OAuth connection flow.
   * Returns an authorization URL the user is redirected to.
   */
  getAuthorizationUrl(workspaceId: string, state: string): Promise<string>;

  /**
   * Exchange the OAuth callback code for tokens.
   * Stores credentials via SecretManager; returns the account reference.
   */
  handleCallback(
    workspaceId: string,
    queryParams: Record<string, string>,
  ): Promise<{
    externalAccountId: string;
    displayHandle: string;
    secretReference: string;
    scopes: string[];
  }>;

  /**
   * Revoke tokens and remove stored credentials.
   */
  disconnect(workspaceId: string, secretReference: string): Promise<void>;

  /**
   * Refresh an access token using the stored refresh token.
   * Persists the rotated token via SecretManager.
   */
  refreshToken(secretReference: string): Promise<{
    accessToken: string;
    expiresAt?: Date;
  }>;

  /**
   * Verify that an incoming webhook was genuinely sent by the platform.
   * Returns `true` if the signature is valid, `false` otherwise.
   */
  validateWebhook(
    headers: Record<string, string>,
    rawBody: string,
    webhookSecret?: string,
  ): Promise<boolean>;

  /**
   * Translate a raw platform webhook payload into a platform-agnostic NormalizedEvent.
   * May return `null` if the event is unrecognised or should be skipped.
   */
  normalizeEvent(rawPayload: unknown, eventType?: string): Promise<NormalizedEvent | null>;

  /**
   * Verify connectivity and token validity for a connected account.
   */
  healthCheck(secretReference: string): Promise<{
    status: "HEALTHY" | "DEGRADED" | "ERROR";
    message?: string;
  }>;
}
