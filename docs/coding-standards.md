# Coding Standards

## Baseline

- TypeScript is strict. Avoid `any`, unsafe type assertions, unbounded `unknown` propagation, and implicit nullable states.
- Runtime data at a process/API/event/provider boundary is validated with a schema. TypeScript types alone are not validation.
- Use formatting and lint rules as CI-enforced standards; no manual style debates in review.
- Keep functions cohesive, name effects explicitly, and prefer simple code over framework abstraction. Document the _why_ for security, policy, or non-obvious reliability decisions.

## Module layout and dependencies

```text
modules/<module>/
  routes/         HTTP boundary and request/response schema binding
  application/    commands, queries, transaction coordination
  domain/         invariants, value types, state transitions
  infrastructure/ scoped repository and provider adapters
  tests/          module-focused tests and fixtures
```

Routes do authentication/context binding and input/output serialization; they do not implement business decisions. Repositories do data access; they do not make provider calls. Provider adapters do transport translation; they do not own policy. Worker handlers are thin idempotent entry points that call application services.

Dependency direction is inward: route/worker → application → domain; infrastructure implements ports defined by the application/domain. Shared contracts are allowed across apps; importing source from another app is prohibited.

## API and error conventions

- Use `/v1` JSON endpoints, RFC 9457 Problem Details errors, ISO 8601 UTC timestamps, UUID IDs, and cursor pagination.
- Require `Idempotency-Key` for mutations that create work or external side effects.
- Return `202 Accepted` for work that exceeds a normal request budget. Do not hide a long synchronous wait behind a request timeout.
- Use stable machine-readable error codes. Do not return provider internals, stack traces, token values, or cross-tenant existence information.
- Respect optimistic concurrency with `If-Match`/version for reviewed state transitions.

## Data and privacy conventions

- Pass `workspaceId` explicitly through application and repository calls. A missing workspace scope is a design error.
- Store source media and raw payloads in private object storage, not JSON blobs or logs. Store their hashes, keys, classification, retention, and lineage in PostgreSQL.
- Do not store OAuth tokens in the database. Use secret references or KMS-enveloped ciphertext only where approved.
- Use append-only audit events for privileged actions and immutable evidence metadata for provenance. Do not update history to “clean it up.”
- Treat data deletion, retention, legal hold, and exports as explicit workflows with audit trails.

## Async and external-effect conventions

- Write the domain change and outbox event in the same transaction. Consumers must be safe under duplicate delivery.
- Include a stable idempotency key, correlation ID, attempt policy, and timeout in each job/external action.
- Categorize failures as retryable, non-retryable, or operator-action-required. Use bounded exponential backoff and a dead-letter path.
- Never perform platform reports, takedowns, bans, public communication, or legal submission from an AI agent. Workers submit only a previously approved immutable action.

## AI-specific conventions

- Prompt/tool inputs and outputs are contracts, versioned and schema validated.
- Preserve provider/model/prompt/policy versions, input fingerprints, evidence references, output artifact references, cost, and limitations.
- Keep deterministic policy/scoring logic separate from language-model narration.
- Use `INCONCLUSIVE` when evidence is insufficient. Do not force a classification or state an unverified accusation as fact.
- No model/provider is enabled without evaluation, privacy review, budget/quota controls, rollout flag, and rollback plan.

## Naming and tests

- Use clear domain names (`ThreatCluster`, `EvidenceItem`, `EnforcementAction`), not generic `data`, `handler`, or `utils` buckets.
- Name commands as verbs (`openCase`, `approveEnforcementAction`); name queries for the result (`listOpenThreats`).
- Tests describe behavior and state: `denies_evidence_access_outside_workspace`, not `test1`.
- Fixtures use synthetic identities/media and clearly mark any approved test data. No production exports in source control.

## Review standards

Every PR must be reviewable in isolation, include tests proportional to risk, and identify its security/privacy/operational effect. Changes to authorization, RLS, evidence lifecycle, cryptography, model routing, external enforcement, or production infrastructure require designated security/architecture review.
