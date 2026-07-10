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

## Standards

| Concern | Convention |
| --- | --- |
| Pagination | Cursor: `?limit=25&cursor=...`, with `page.nextCursor` |
| Filtering | Explicit parameters: `status`, `category`, `creatorProfileId`, `from`, `to` |
| Dates and IDs | ISO 8601 UTC, UUID |
| Errors | RFC 9457 Problem Details: `{ type, title, status, detail, instance, code }` |
| Concurrency | `If-Match` or resource version for workflow edits |
| Async command | `202` with `{ data: { jobId, statusUrl } }` |

## Resource endpoints

| Method | Path | Required role | Purpose |
| --- | --- | --- | --- |
| `GET` | `/me` | authenticated | User, memberships, capabilities. |
| `GET, PATCH` | `/workspaces/:workspaceId` | member / admin | Workspace settings. |
| `GET, POST` | `/creator-profiles` | viewer / analyst | List/create protected profiles. |
| `GET, PATCH, DELETE` | `/creator-profiles/:id` | viewer / analyst | Manage creator metadata. |
| `GET, POST` | `/creator-profiles/:id/identities` | viewer / analyst | Manage handles, domains, asset refs. |
| `GET, POST` | `/connected-accounts` | viewer / admin | List connections/initiate OAuth. |
| `DELETE` | `/connected-accounts/:id` | admin | Revoke connection and secret ref. |
| `GET, POST` | `/monitoring-rules` | viewer / analyst | Manage scan definitions. |
| `POST` | `/monitoring-rules/:id/runs` | analyst | Start a scan (`202`). |
| `GET` | `/scan-runs` and `/scan-runs/:id` | viewer | Inspect run status and failures. |
| `GET` | `/detections` and `/detections/:id` | viewer | Search evidence-backed detections. |
| `POST` | `/detections/:id/triage` | analyst | Apply human triage decision. |
| `GET` | `/threat-clusters` and `/threat-clusters/:id` | viewer | View grouped threats/risk breakdown. |
| `GET, POST` | `/cases` | viewer / analyst | List cases/open case from cluster. |
| `GET, PATCH` | `/cases/:id` | viewer / assigned analyst | Manage assignment, priority, status. |
| `POST` | `/cases/:id/evidence` | analyst | Link immutable evidence. |
| `GET, POST` | `/cases/:id/enforcement-actions` | viewer / reviewer | List/create draft response. |
| `POST` | `/enforcement-actions/:id/approve` | reviewer | Approve and queue allowed submission. |
| `POST` | `/enforcement-actions/:id/cancel` | reviewer | Cancel unsubmitted action. |
| `GET` | `/evidence/:id/access-url` | authorized member | Audited, short-lived signed URL. |
| `GET` | `/jobs/:id` | requester or admin | Job state/safe failure detail. |
| `GET` | `/audit-logs` | admin | Workspace audit query. |

## Operational endpoints

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/healthz` | load balancer | Liveness only. |
| `GET` | `/readyz` | load balancer | Dependency readiness. |
| `GET` | `/metrics` | observability | Metrics endpoint. |
| `POST` | `/webhooks/clerk` | Clerk signature | Sync user/org lifecycle. |
| `POST` | `/webhooks/:provider` | provider signature | Receive platform/report updates. |

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

Initial topics: `scan.requested.v1`, `source.collected.v1`, `evidence.captured.v1`, `analysis.requested.v1`, `detection.created.v1`, `detection.triaged.v1`, `case.opened.v1`, `enforcement.approved.v1`, `notification.requested.v1`.

Define schemas in `packages/contracts`, validate them at runtime, and generate OpenAPI from the same source. Add only compatible fields within a version; version breaking semantic changes. Contract-test routes, event producers/consumers, and connector adapters in CI.
