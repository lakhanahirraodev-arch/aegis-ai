# Developer Guide

## What this repository contains

This is an architecture-first monorepo. The folders, contracts, database model, local infrastructure, and engineering standards are intentionally in place before product business logic. Phase 1 turns these boundaries into running applications; feature code must preserve the rules described in the architecture and security documents.

## Prerequisites

- Node.js 22 LTS and pnpm 9+
- Docker Desktop for PostgreSQL/pgvector, Redis, and MinIO
- A Clerk development instance for authenticated app work
- Approved development credentials for object storage and model/provider sandboxes only

## Local bootstrap target

```bash
cp .env.example .env
docker compose up -d postgres redis minio
pnpm install
pnpm --filter @aegis/database prisma:migrate
pnpm dev
```

These are the Phase 1 operational targets; package manifests and application code are not yet implemented in this documentation-only foundation. Never place production credentials in `.env`, fixtures, screenshots, test recordings, or shell history.

## Repository navigation

| Location | Purpose | Dependency rule |
| --- | --- | --- |
| `apps/web` | Next.js presentation and Clerk UI integration | Uses API/contracts; never Prisma or worker code. |
| `apps/api` | Fastify routes, authorization, domain commands/queries | Does not import another app. |
| `apps/worker` | Queue consumers, collection, evidence, analysis, delivery | Does not expose public HTTP business endpoints. |
| `packages/contracts` | Versioned DTOs, event schemas, errors | No application-package imports. |
| `packages/ai-contracts` | Agent inputs/outputs and policy-gate contracts | Depends only on contracts. |
| `packages/database` | Prisma schema, reviewed migrations, scoped data access | No UI or provider SDKs. |
| `packages/ui` | Presentational design system | No auth/domain/data dependencies. |
| `packages/config` | Shared tooling and typed configuration | No runtime secrets. |

## How to add a domain capability

1. Write a short ADR or module note if it changes a boundary, privacy posture, or external action.
2. Define/extend runtime-validated request, response, and event contracts in `packages/contracts`. Version breaking changes.
3. Add only module-owned schema/migration changes. Include tenant index/RLS, retention, and audit implications in the pull request.
4. Implement the API command/query behind server-side capability and workspace authorization.
5. Place slow, third-party, media, or AI work behind an outbox event and idempotent worker handler.
6. Add unit, integration, authorization, and contract tests; add an evaluation suite for AI-derived behavior.
7. Add telemetry, dashboard metrics, alert thresholds, runbook changes, feature flag/rollback plan, and documentation before enabling production traffic.

## Configuration rules

Use typed per-app environment parsing at startup. Fail fast for missing required production configuration. Classify every new variable:

| Class | Example | Rule |
| --- | --- | --- |
| Public build-time | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Safe for client bundle only after deliberate review. |
| Runtime non-secret | `REDIS_URL`, feature-flag environment | Runtime injection; document default/owner. |
| Secret | `CLERK_SECRET_KEY`, provider key | Secret manager only; never log or commit. |
| Reference | `secret://…`, KMS key ARN | May live in config only when it grants no secret value. |

Every external provider has a sandbox/development configuration, timeouts, rate limits, failure policy, and owner. Development cannot silently call a production moderation/reporting endpoint.

## Database migration protocol

- Use Prisma migrations for compatible relational changes; add reviewed SQL for extensions, RLS, partial indexes, triggers, vector indexes, and retention controls.
- Follow **expand → migrate/backfill → switch reads/writes → contract**. Never deploy a migration that immediately destroys data or assumes all app instances upgraded simultaneously.
- Test migrations against a production-like copy/schema in staging. Measure lock time and query plans for large tables.
- A migration PR includes forward steps, rollback/containment guidance, data classification, RLS policy impact, backfill rate limits, and verification query.

## Working with external/untrusted content

Do not use a user-supplied URL or media path directly. Collection must use the evidence pipeline: canonicalization, DNS/IP/redirect validation, content-type and size limits, sandboxed fetch, malware scan, hash/manifest creation, private storage, then derivative analysis. Consult [security architecture](security.md) before adding a connector or media tool.

## Observability conventions

- Generate/propagate W3C trace context and a correlation ID from HTTP command to outbox event to job to external request.
- Emit structured logs with stable event names, safe identifiers, duration, outcome, retry count, and error code. Redact content, tokens, legal names, URLs with sensitive query values, and raw provider payloads.
- Every queue has depth, oldest-job age, success/failure, retry, dead-letter, and provider quota metrics.
- Every AI run has provider/model/prompt/policy version, input fingerprint, cost, latency, status, and reviewer outcome—not raw sensitive prompts by default.

## Pull request checklist

- [ ] Scope and module ownership are clear; no forbidden dependency introduced.
- [ ] Request, event, and persisted-data changes are versioned and documented.
- [ ] Workspace authorization and RLS test coverage includes a negative cross-tenant test.
- [ ] Sensitive data is classified; logs, queues, and telemetry are redacted.
- [ ] External effects are idempotent, asynchronous where required, and human-approved where applicable.
- [ ] Tests, migrations, metrics, docs, and rollback/feature-flag plan are included.
