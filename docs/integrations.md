# Integrations — Platform Connectivity

Aegis AI supports secure, event-driven integrations with major creator platforms.

---

## Architecture

```
Creator Platform  →  Webhook POST  →  /v1/webhooks/platforms/:platform
                                             ↓
                                       EventBus.publish()
                                             ↓
                                    Signature Verification
                                             ↓
                                    Event Normalization
                                             ↓
                               DB Write (IngestedEvent, QUEUED)
                                             ↓
                                     BullMQ Queue Dispatch
                                             ↓
                                    platform-events Worker
                                             ↓
                                  IngestedEvent → PROCESSED
                                             ↓
                                    Future AI Agents
```

Providers never communicate directly with BullMQ. The EventBus is the sole gateway.

---

## Supported Platforms

| Platform    | Status | OAuth | Webhooks                | Event Normalization                                                    |
| ----------- | ------ | ----- | ----------------------- | ---------------------------------------------------------------------- |
| YouTube     | Full   | ✅    | ✅ PubSubHubbub         | VIDEO_UPLOADED, LIVE_STARTED, LIVE_ENDED                               |
| Twitch      | Full   | ✅    | ✅ EventSub HMAC-SHA256 | LIVE_STARTED/ENDED, CHAT_MESSAGE, CHAT_BAN, FOLLOWER_GAINED, CHAT_RAID |
| Discord     | Full   | ✅    | ✅ Ed25519              | CHAT_MESSAGE, CHAT_BAN, FOLLOWER_GAINED                                |
| TikTok      | Stub   | 🔜    | 🔜                      | —                                                                      |
| Instagram   | Stub   | 🔜    | 🔜                      | —                                                                      |
| Kick        | Stub   | 🔜    | 🔜                      | —                                                                      |
| X (Twitter) | Stub   | 🔜    | 🔜                      | —                                                                      |

---

## OAuth Flow

### Connect

```
GET /v1/integrations/:platform/connect
Authorization: Bearer <jwt>
X-Workspace-Id: <workspaceId>
```

Redirects to the platform's OAuth consent page.

### Callback

```
GET /v1/integrations/:platform/callback?code=...&state=...
```

Exchanges the code for tokens, stores encrypted credentials via SecretManager, and upserts a `ConnectedAccount` row. Redirects to `NEXT_PUBLIC_APP_URL/settings/integrations?connected=:platform&status=success`.

### Disconnect

```
POST /v1/integrations/:platform/disconnect
Authorization: Bearer <jwt>
```

Revokes tokens on the platform, deletes stored secrets, and marks the `ConnectedAccount` as `REVOKED`.

### Reconnect

```
POST /v1/integrations/:platform/reconnect
Authorization: Bearer <jwt>
```

Returns a fresh OAuth URL. The flow is identical to Connect.

### List

```
GET /v1/integrations
Authorization: Bearer <jwt>
```

Returns all `ConnectedAccount` records for the workspace. `secretReference` is never exposed.

---

## Webhook Ingestion

### Endpoint

```
POST /v1/webhooks/platforms/:platform
```

### Security

| Platform | Verification                                              |
| -------- | --------------------------------------------------------- |
| Twitch   | HMAC-SHA256 (`twitch-eventsub-message-signature`)         |
| Discord  | Ed25519 (`x-signature-ed25519` + `x-signature-timestamp`) |
| YouTube  | HTTPS subscription + `hub.secret`                         |

### YouTube Challenge (GET)

```
GET /v1/webhooks/platforms/youtube?hub.challenge=...
```

Returns the raw `hub.challenge` value as plaintext to complete PubSubHubbub subscription.

---

## Event Taxonomy

All platform-specific events are normalized to a common taxonomy before persistence:

| Event Type             | Meaning                     |
| ---------------------- | --------------------------- |
| `ACCOUNT_CONNECTED`    | OAuth connected             |
| `ACCOUNT_DISCONNECTED` | Token revoked               |
| `LIVE_STARTED`         | Broadcast went live         |
| `LIVE_ENDED`           | Broadcast ended             |
| `CHAT_MESSAGE`         | Chat message received       |
| `CHAT_BAN`             | User banned                 |
| `CHAT_TIMEOUT`         | User timed out              |
| `CHAT_RAID`            | Raid received               |
| `FOLLOWER_GAINED`      | New follower/member         |
| `VIDEO_UPLOADED`       | New video published         |
| `CONTENT_FLAGGED`      | Content flagged by platform |
| `MENTION_CREATED`      | Brand/creator mention       |
| `MODERATION_ACTION`    | Moderation event            |

---

## Secrets Management

All OAuth tokens and credentials are encrypted at rest using AES-256-GCM before database persistence.

### Environment Variables

```
ENCRYPTION_KEY=<64 hex chars>  # Required — AES-256-GCM key
YOUTUBE_CLIENT_ID=
YOUTUBE_CLIENT_SECRET=
TWITCH_CLIENT_ID=
TWITCH_CLIENT_SECRET=
TWITCH_WEBHOOK_SECRET=
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=
DISCORD_BOT_TOKEN=
DISCORD_PUBLIC_KEY=
```

### SecretManager Interface

```typescript
interface SecretManager {
  encrypt(plaintext: string): Promise<string>;
  decrypt(ciphertext: string): Promise<string>;
  storeSecret(key: string, value: string): Promise<void>;
  getSecret(key: string): Promise<string | null>;
  deleteSecret(key: string): Promise<void>;
  rotateSecret(key: string, newValue: string): Promise<void>;
}
```

**Key format:** `ws:{workspaceId}:platform:{PLATFORM}:{externalAccountId}:{field}`

### Future Providers

Swap `LocalSecretManager` for:

- `AwsSecretManager` (AWS Secrets Manager)
- `AzureKeyVaultSecretManager`
- `VaultSecretManager` (HashiCorp Vault)

No other code changes are needed.

---

## Data Retention

| Data                                        | Retention                  |
| ------------------------------------------- | -------------------------- |
| Raw webhook payloads (`rawPayload` column)  | 30 days, then nulled       |
| Processed event metadata (`payload` column) | 1 year                     |
| Evidence & audit logs                       | Configurable per workspace |

The daily pruning job runs at 03:00 UTC via BullMQ repeatable job.

---

## Adding a New Platform

1. Create `apps/api/src/modules/integrations/providers/NewProvider.ts` implementing `IntegrationProvider`.
2. Import and register in `ProviderRegistry.ts`:
   ```typescript
   this.register("NEWPLATFORM", new NewProvider());
   ```
3. Add the new enum value to the `Platform` enum in `schema.prisma`.
4. Add OAuth credentials to `.env`.
5. Done — no other code changes needed.
