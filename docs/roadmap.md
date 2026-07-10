# Development Roadmap

This sequence reduces risk before feature breadth. Dates are intentionally deferred until team size, platforms, and compliance requirements are agreed.

## Phase 0 — Architecture and foundations (current)

- Establish Turborepo workspace, documents, environment taxonomy, Docker development scaffold, CI baseline, and ADR process.
- Define domain vocabulary, contracts, migration standards, security model, and AI governance.

**Exit:** documentation and scaffold are reviewed by product, engineering, security, and legal.

## Phase 1 — Secure platform foundation

- Bootstrap Next.js, Fastify, Prisma, Tailwind, shadcn/ui, Clerk, typed config, logging/tracing.
- Implement Clerk lifecycle sync, workspace roles/scoping, audit trail, migrations, object-storage abstraction.
- Implement OpenAPI/error/idempotency/health contracts, queue/outbox foundation, and CI quality gates.

**Exit:** users can access only their own workspaces; authorization, migration, and audit tests pass; Docker development stack works.

## Phase 2 — Creator onboarding and evidence foundation

- Build creator profiles, verified identity references, monitoring rules, and connected accounts.
- Build secure URL acquisition, artifact capture, hashes/provenance, private storage, retention, signed access.
- Add scan-run dashboard and job observability.

**Exit:** an authorized user can configure a bounded scan and inspect immutable evidence with full audit history.

## Phase 3 — Detection MVP

- Start with two high-value, legally reviewed signals: account impersonation and near-duplicate/stolen content.
- Add source normalization, deterministic matching, specialist contracts, risk scoring, human triage, feedback capture.
- Establish evaluation dataset, thresholds, registry, spend controls, and false-positive review.

**Exit:** test corpus metrics meet agreed targets; findings are evidence-backed, reviewable, and platform scoped.

## Phase 4 — Case management and response

- Build clustering, assignment, evidence bundles, case timeline, notifications, and enforcement drafts.
- Add reviewer approval and one platform report-status integration.
- Add data export and retention/legal-hold controls.

**Exit:** reviewers complete an audited, human-approved response lifecycle without external automated action.

## Phase 5 — Broader protection coverage

- Introduce deepfake/audio-video analysis only after privacy, consent, evaluation, and quality gates.
- Add harassment/doxxing/scam analysis with reviewed policy and escalation paths.
- Expand connectors, locales, report flows, team roles, analytics.

**Exit:** every modality has passed the agent release gate and has operational ownership.

## Phase 6 — Production hardening and scale

- Complete load, chaos, security, accessibility, and disaster-recovery tests.
- Enforce RLS, secret-manager integration, WAF/rate limit, SIEM/export, restore drills, SLOs/alerts/runbooks.
- Establish data-processing agreements, privacy workflows, red-team cadence, penetration test, launch review.

**Exit:** engineering, security, privacy/legal, support, and product sign the launch checklist.

## Continuous workstreams

| Workstream | Continuous responsibility |
| --- | --- |
| Trust & safety | Policy updates, reviewer training, quality sampling, abuse escalation. |
| AI quality | Dataset governance, calibration, drift detection, provider evaluation, rollback drills. |
| Security/privacy | Threat modeling, patching, access reviews, deletion requests, incident exercises. |
| Reliability | SLO review, capacity/cost planning, restore tests, vendor resiliency. |
| Developer experience | Contract tests, local stack, templates, docs, ADRs. |
