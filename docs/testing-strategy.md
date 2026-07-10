# Testing Strategy

## Quality philosophy

Trust & safety software must prove more than “the endpoint returned 200.” Aegis tests correctness, tenant isolation, evidence integrity, reliability under retries, policy behavior, and AI quality. The test suite uses synthetic or explicitly approved data; sensitive production media is not a default fixture.

## Test layers

| Layer | Scope | Runs | Examples |
| --- | --- | --- | --- |
| Static | types, format, lint, dependency boundaries, secret patterns | every commit | strict TS, import rules, formatting, SBOM. |
| Unit | pure domain/policy functions | every commit | risk-breakdown calculation, action state transition, cursor encoding. |
| Component | module/application service with fakes | every commit | command writes aggregate + outbox atomically. |
| Integration | real PostgreSQL/Redis/object-store emulator | pull request | RLS denial, migration, idempotent job retry, signed access audit. |
| Contract | HTTP/event/provider schemas | pull request and provider change | OpenAPI compatibility, event consumer against producer fixture. |
| End-to-end | browser → API → worker happy/negative paths | staging candidate | triage to reviewed draft; no automatic external action. |
| Performance/resilience | capacity and injected fault behavior | scheduled/release | queue backlog, provider timeout, DB failover, restore drill. |
| Security | SAST, dependency/container/IaC scanning, DAST/pentest | CI/scheduled/release | SSRF block, auth bypass, sensitive-log regression. |
| AI evaluation | benchmark, safety, calibration, regression | every model/prompt/policy change | false-positive rate, grounding, jailbreak/injection resistance. |

## Required invariants

These are non-negotiable tests for all relevant modules:

- A user in workspace A cannot list, mutate, infer the existence of, or obtain an access URL for a resource in workspace B.
- An outbox event is committed with the successful command, and duplicate event/job delivery creates no duplicate state or external side effect.
- An enforcement action cannot be submitted without a current valid approval and cannot be submitted twice.
- An evidence hash/manifest mismatch quarantines the object; an artifact on legal hold cannot be purged.
- A provider error/timeout produces a bounded retry or visible failure state—not a silent success.
- AI output that is invalid, ungrounded, over budget, policy-blocked, or low confidence becomes `INCONCLUSIVE`/blocked and does not trigger an external action.

## Test environments and fixtures

Local and CI integration tests run against disposable PostgreSQL with pgvector, Redis, and MinIO (or compatible emulator). Test isolation uses unique workspace IDs and cleans up only test-scoped resources. Staging uses separate cloud accounts/projects and providers’ sandbox endpoints where available.

Create fixture builders for users, memberships, creator profiles, source items, evidence manifests, and provider responses. Keep adversarial corpus manifests/version metadata under controlled access; record why a test sample is included and its data classification.

## Migration and database tests

- Apply every migration from an empty database and from the previous release schema.
- Validate RLS policies with direct low-privilege connections, not only application mocks.
- Run `EXPLAIN` checks/benchmarks for new critical indexes and large-table queries.
- Test backfill restartability, rate limits, and concurrent application compatibility.
- Rehearse restore to an isolated environment and verify evidence-hash readability and audit continuity.

## AI evaluation gates

Each supported task has a versioned evaluation dataset split by modality, platform, language/locale, and adversarial scenario. Measure precision, recall, false-positive/false-negative rates, calibration error, abstention rate, latency, cost, and human-override rate. Thresholds are task/policy-specific and owned by Trust & Safety—not guessed in code.

Before any model, prompt, tool, threshold, or provider change reaches production: run regression benchmarks; test structured-output validity and citations; test prompt-injection/tool misuse; examine high-severity false positives; review privacy/data use; shadow the change; and keep a rollback flag.

## Release gates

| Change | Minimum gate |
| --- | --- |
| UI-only | static, component, accessibility, visual regression where applicable. |
| API/domain | unit, integration, contract, authorization negative tests. |
| Schema/RLS | migration/rehearsal, RLS integration, query review, rollback plan. |
| Connector/evidence | SSRF/malware/size tests, sandbox integration, idempotency/retry tests. |
| AI/policy | evaluation suite, safety review, shadow rollout, feature flag. |
| Enforcement | separation-of-duties, approval-state, provider sandbox, audit tests. |
| Infrastructure | IaC policy/plan, security scan, staging smoke, rollback rehearsal. |
