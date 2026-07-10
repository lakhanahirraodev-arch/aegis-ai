# Development Roadmap

This sequence reduces risk before feature breadth. Dates are intentionally deferred until team size, platforms, and compliance requirements are agreed.

## Phase 0 — Architecture and foundations (current)

- Establish Turborepo workspace, documents, environment taxonomy, Docker development scaffold, CI baseline, and ADR process.
- Define domain vocabulary, contracts, migration standards, security model, and AI governance.
- Complete comprehensive CTO architecture review and establish prioritized architecture backlog ([cto-architecture-review.md](file:///c:/Users/Lakha/aegis-ai/docs/cto-architecture-review.md), [prioritized-backlog.md](file:///c:/Users/Lakha/aegis-ai/docs/prioritized-backlog.md)).

**Exit:** documentation, review backlog, and scaffold are reviewed by product, engineering, security, and legal.

## Phase 1 — Secure platform foundation

- Bootstrap Next.js, Fastify, Prisma, Tailwind, shadcn/ui, Clerk, typed config, logging/tracing.
- Implement Clerk lifecycle sync, workspace roles/scoping, audit trail, migrations, object-storage abstraction.
- Enforce critical security/privacy fixes from the architecture review (Prisma RLS context leak fix, biometric consent schemas, Model Gateway PII redaction middleware).
- Implement high-frequency live-chat write-behind buffering in Redis.
- Implement OpenAPI/error/idempotency/health contracts, queue/outbox foundation, and CI quality gates.

**Exit:** users can access only their own workspaces; biometric consent constraints and RLS leakage tests pass; write-behind chat buffer functions under load; Docker development stack works.

## Phase 2 — Creator onboarding and evidence foundation

- Build creator profiles, verified identity references, monitoring rules, and connected accounts.
- Build secure URL acquisition, artifact capture, hashes/provenance, private storage, retention, signed access.
- Implement Evidence Cryptographic TSA Manifest Signing (Sprint 4) to secure chain of custody.
- Add scan-run dashboard and job observability.

**Exit:** an authorized user can configure a bounded scan, inspect cryptographically signed evidence, and track full audit histories.

## Phase 3 — Detection MVP

- Start with two high-value, legally reviewed signals: account impersonation and near-duplicate/stolen content.
- Add source normalization, deterministic matching, specialist contracts, risk scoring, human triage, feedback capture.
- Establish evaluation dataset, thresholds, registry, spend controls, and false-positive review.
- Implement Live Channel "Panic Button" (Shield Mode) API and active policy toggle (Sprint 3).
- Deploy event-driven CDC Outbox Publisher (Sprint 3) to reduce database polling overhead.

**Exit:** test corpus metrics meet agreed targets; findings are evidence-backed, reviewable, and platform scoped; Panic Mode successfully restricts mock stream attacks.

## Phase 4 — Case management and response

- Build clustering, assignment, evidence bundles, case timeline, notifications, and enforcement drafts.
- Add reviewer approval and one platform report-status integration.
- Add data export and retention/legal-hold controls.
- Implement Outbound Webhooks Subscription database tables and configuration APIs (Sprint 4).

**Exit:** reviewers complete an audited, human-approved response lifecycle; outbound webhooks trigger alerts for mock incidents.

## Phase 5 — Broader protection coverage

- Introduce deepfake/audio-video analysis only after privacy, consent, evaluation, and quality gates.
- Add harassment/doxxing/scam analysis with reviewed policy and escalation paths.
- Integrate Natural Language Policy Translation Agent (Sprint 5) to compile creator guidelines.
- Deploy Stateless Gateway Clustering & Connection Lease Ring (Sprint 5) for high-availability stream ingestion.
- Expand connectors, locales, report flows, team roles, analytics.

**Exit:** every modality has passed the agent release gate and has operational ownership; gateway clusters automatically balance stream leases.

## Phase 6 — Production hardening and scale

- Complete load, chaos, security, accessibility, and disaster-recovery tests.
- Enforce RLS context leak safeguards, secret-manager integration, WAF/rate limit, SIEM/export, restore drills, SLOs/alerts/runbooks.
- Enforce dynamic Postgres partitioning (pg_partman) and Fair-Share queue scheduling in BullMQ (Sprints 6/8).
- Establish data-processing agreements, privacy workflows, red-team cadence, penetration test, launch review.

**Exit:** engineering, security, privacy/legal, support, and product sign the launch checklist.

## Continuous workstreams

| Workstream           | Continuous responsibility                                                               |
| -------------------- | --------------------------------------------------------------------------------------- |
| Trust & safety       | Policy updates, reviewer training, quality sampling, abuse escalation.                  |
| AI quality           | Dataset governance, calibration, drift detection, provider evaluation, rollback drills. |
| Security/privacy     | Threat modeling, patching, access reviews, deletion requests, incident exercises.       |
| Reliability          | SLO review, capacity/cost planning, restore tests, vendor resiliency.                   |
| Developer experience | Contract tests, local stack, templates, docs, ADRs.                                     |
