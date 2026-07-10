# API Design

## API style

The Fastify API is JSON-first, versioned under `/v1`, and documented by an OpenAPI 3.1 contract generated from typed route schemas. It uses resource reads and explicit command endpoints for workflow transitions. Long-running work returns `202 Accepted` with a job resource.

**Base URL:** `https://api.aegis.example/v1`

## Authentication and authorization

- The web app sends `Authorization: Bearer <Clerk session token>`.
- Fastify verifies signature, issuer, audience, expiry, and authorized party through Clerk JWKS. A client workspace ID is accepted only when Clerk organization membership and local role permit it.
- `X-Workspace-Id` chooses the active workspace; a personal workspace is resolved server-side if none is active.
- Service calls use separate short-lived workload identity/service tokens.
- Writes require `Idempotency-Key`; logs carry `X-Request-Id` or W3C trace context.
- Live Guardian subscriptions use a separate short-lived, channel-scoped token. A browser can subscribe only to sessions/channels the resolved workspace role and live moderator assignment permit.

## Standards

| Concern       | Convention                                                                  |
| ------------- | --------------------------------------------------------------------------- |
| Pagination    | Cursor: `?limit=25&cursor=...`, with `page.nextCursor`                      |
| Filtering     | Explicit parameters: `status`, `category`, `creatorProfileId`, `from`, `to` |
| Dates and IDs | ISO 8601 UTC, UUID                                                          |
| Errors        | RFC 9457 Problem Details: `{ type, title, status, detail, instance, code }` |
| Concurrency   | `If-Match` or resource version for workflow edits                           |
| Async command | `202` with `{ data: { jobId, statusUrl } }`                                 |

## Resource endpoints

| Method               | Path                                          | Required role             | Purpose                               |
| -------------------- | --------------------------------------------- | ------------------------- | ------------------------------------- |
| `GET`                | `/me`                                         | authenticated             | User, memberships, capabilities.      |
| `GET, PATCH`         | `/workspaces/:workspaceId`                    | member / admin            | Workspace settings.                   |
| `GET, POST`          | `/creator-profiles`                           | viewer / analyst          | List/create protected profiles.       |
| `GET, PATCH, DELETE` | `/creator-profiles/:id`                       | viewer / analyst          | Manage creator metadata.              |
| `GET, POST`          | `/creator-profiles/:id/identities`            | viewer / analyst          | Manage handles, domains, asset refs.  |
| `GET, POST`          | `/connected-accounts`                         | viewer / admin            | List connections/initiate OAuth.      |
| `DELETE`             | `/connected-accounts/:id`                     | admin                     | Revoke connection and secret ref.     |
| `GET, POST`          | `/monitoring-rules`                           | viewer / analyst          | Manage scan definitions.              |
| `POST`               | `/monitoring-rules/:id/runs`                  | analyst                   | Start a scan (`202`).                 |
| `GET`                | `/scan-runs` and `/scan-runs/:id`             | viewer                    | Inspect run status and failures.      |
| `GET`                | `/detections` and `/detections/:id`           | viewer                    | Search evidence-backed detections.    |
| `POST`               | `/detections/:id/triage`                      | analyst                   | Apply human triage decision.          |
| `GET`                | `/threat-clusters` and `/threat-clusters/:id` | viewer                    | View grouped threats/risk breakdown.  |
| `GET, POST`          | `/cases`                                      | viewer / analyst          | List cases/open case from cluster.    |
| `GET, PATCH`         | `/cases/:id`                                  | viewer / assigned analyst | Manage assignment, priority, status.  |
| `POST`               | `/cases/:id/evidence`                         | analyst                   | Link immutable evidence.              |
| `GET, POST`          | `/cases/:id/enforcement-actions`              | viewer / reviewer         | List/create draft response.           |
| `POST`               | `/enforcement-actions/:id/approve`            | reviewer                  | Approve and queue allowed submission. |
| `POST`               | `/enforcement-actions/:id/cancel`             | reviewer                  | Cancel unsubmitted action.            |
| `GET`                | `/evidence/:id/access-url`                    | authorized member         | Audited, short-lived signed URL.      |
| `GET`                | `/jobs/:id`                                   | requester or admin        | Job state/safe failure detail.        |
| `GET`                | `/audit-logs`                                 | admin                     | Workspace audit query.                |

## Live Guardian endpoints

All paths below are under `/v1`. Live ingestion is performed only by authenticated platform adapters/workloads, never by a browser client. Platform support and allowed action types are returned from the channel capability resource; a client must not assume that every platform supports timeout, mute, shadow mute, ban, or slow mode.

| Method       | Path                                        | Required role           | Purpose                                                                                                     |
| ------------ | ------------------------------------------- | ----------------------- | ----------------------------------------------------------------------------------------------------------- |
| `GET, POST`  | `/live-channels`                            | viewer / admin          | List protected live channels or configure an authorized channel.                                            |
| `GET, PATCH` | `/live-channels/:id`                        | assigned viewer / admin | Inspect/update channel state, capabilities, and settings.                                                   |
| `GET, POST`  | `/live-channels/:id/moderators`             | assigned lead / admin   | List/assign channel-scoped lead, moderator, or observer.                                                    |
| `DELETE`     | `/live-channels/:id/moderators/:userId`     | assigned lead / admin   | Remove a moderator assignment.                                                                              |
| `GET, POST`  | `/live-channels/:id/moderation-policies`    | assigned lead / admin   | List/create versioned keyword, automation, threshold, escalation, and retention policies.                   |
| `GET, PATCH` | `/live-moderation-policies/:id`             | assigned lead / admin   | Inspect or update a policy with optimistic versioning.                                                      |
| `POST`       | `/live-moderation-policies/:id/activate`    | admin                   | Activate a reviewed policy version.                                                                         |
| `GET`        | `/live-sessions` and `/live-sessions/:id`   | assigned observer       | List/inspect current and historical live sessions.                                                          |
| `GET`        | `/live-sessions/:id/messages`               | assigned moderator      | Cursor-query retained normalized messages; content access follows retention/evidence rules.                 |
| `GET`        | `/live-sessions/:id/findings`               | assigned moderator      | Query moderation signals, confidence, limitations, and related action.                                      |
| `GET, POST`  | `/live-sessions/:id/moderation-actions`     | assigned moderator      | List or issue a human moderation action. `POST` is idempotent and returns `202` if provider work is needed. |
| `POST`       | `/live-moderation-actions/:id/approve`      | assigned lead / admin   | Approve a suggested action when policy requires human approval.                                             |
| `POST`       | `/live-moderation-actions/:id/cancel`       | assigned moderator      | Cancel an unsubmitted proposed action.                                                                      |
| `POST`       | `/live-moderation-actions/:id/reverse`      | assigned lead / admin   | Request permitted reversal/unban/restore action; provider support is checked.                               |
| `GET`        | `/live-incidents` and `/live-incidents/:id` | assigned observer       | View live incident risk, evidence links, and ordered timeline.                                              |
| `POST`       | `/live-incidents/:id/acknowledge`           | assigned moderator      | Record ownership/acknowledgement.                                                                           |
| `POST`       | `/live-incidents/:id/resolve`               | assigned lead / analyst | Close with an audited resolution reason.                                                                    |
| `GET`        | `/live-channels/:id/community-health`       | assigned observer       | Read health/sentiment snapshots and coverage context.                                                       |
| `GET`        | `/live-moderator-appeals`                   | assigned moderator      | Review appeals scoped to assigned channels.                                                                 |
| `POST`       | `/live-moderator-appeals/:id/resolve`       | assigned lead / analyst | Accept/reject an appeal and trigger allowed reversal path.                                                  |

### Real-time subscription contract

`GET /v1/realtime/live?token=<short-lived-subscription-token>` upgrades to WebSocket (or an equivalent authenticated server-sent event transport if a deployment requires it). The token contains workspace, permitted channel/session IDs, role, expiry, and audience; it is never a platform credential.

Clients may receive `live.message.redacted.v1`, `live.finding.created.v1`, `live.action.updated.v1`, `live.incident.updated.v1`, `live.health.updated.v1`, and `live.coverage.updated.v1`. Message bodies are redacted unless the caller has the specific moderator/evidence capability. The gateway enforces bounded subscriptions, heartbeat, backpressure, reconnect cursor, and per-user connection limits.

Example action command:

```http
POST /v1/live-sessions/5fa5f60a-6d2a-4a5a-8a39-1ed471f3a00f/moderation-actions
Authorization: Bearer <clerk-session-token>
X-Workspace-Id: 9a995a90-f49d-4fe0-b27f-fa2dfb45d987
Idempotency-Key: 9c97e9d9-b0b8-48a1-b4c9-71399ca0a1c1
Content-Type: application/json

{
  "actionType": "TIMEOUT",
  "liveChatMessageId": "7bc16c83-8ba7-427a-887b-5037c4c1b146",
  "reasonCode": "HARASSMENT",
  "durationSeconds": 600
}
```

The response contains the action state, policy/capability decision, and safe provider outcome reference. It does not expose platform tokens or sensitive raw message data.

## Operational endpoints

| Method | Path                       | Access                                | Purpose                                                    |
| ------ | -------------------------- | ------------------------------------- | ---------------------------------------------------------- |
| `GET`  | `/healthz`                 | load balancer                         | Liveness only.                                             |
| `GET`  | `/readyz`                  | load balancer                         | Dependency readiness.                                      |
| `GET`  | `/metrics`                 | observability                         | Metrics endpoint.                                          |
| `POST` | `/webhooks/clerk`          | Clerk signature                       | Sync user/org lifecycle.                                   |
| `POST` | `/webhooks/:provider`      | provider signature                    | Receive platform/report updates.                           |
| `POST` | `/webhooks/live/:provider` | provider signature + connection match | Receive authorized live-session/chat/moderation callbacks. |

## Command example

```http
POST /v1/monitoring-rules
Authorization: Bearer <clerk-session-token>
X-Workspace-Id: 9a995a90-f49d-4fe0-b27f-fa2dfb45d987
Idempotency-Key: 91d42d4b-1467-46df-aefe-1fc3ce4bebca
Content-Type: application/json

{
  "creatorProfileId": "a3af5f99-ef20-4bb9-8216-cd218b559d3a",
  "ruleType": "IMPERSONATION_SEARCH",
  "schedule": "0 */6 * * *",
  "config": { "platforms": ["INSTAGRAM", "YOUTUBE"], "locales": ["en", "hi"] }
}
```

## Event contract

Events are inserted transactionally into `outbox_events`; consumers are idempotent.

```ts
type DomainEvent<T> = {
  id: string;
  type: string; // e.g. detection.triaged.v1
  occurredAt: string;
  workspaceId: string;
  aggregate: { type: string; id: string; version: number };
  correlationId: string;
  payload: T;
};
```

Initial topics: `scan.requested.v1`, `source.collected.v1`, `evidence.captured.v1`, `analysis.requested.v1`, `detection.created.v1`, `detection.triaged.v1`, `case.opened.v1`, `enforcement.approved.v1`, `notification.requested.v1`, `live.session.started.v1`, `live.message.received.v1`, `live.finding.created.v1`, `live.action.requested.v1`, `live.action.applied.v1`, `live.incident.opened.v1`, `live.appeal.opened.v1`, `community-health.updated.v1`.

Define schemas in `packages/contracts`, validate them at runtime, and generate OpenAPI from the same source. Add only compatible fields within a version; version breaking semantic changes. Contract-test routes, event producers/consumers, and connector adapters in CI.
