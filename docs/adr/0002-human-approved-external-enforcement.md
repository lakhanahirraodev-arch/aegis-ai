# ADR 0002: Human approval is required for external enforcement

- **Status:** Accepted
- **Date:** 2026-07-10

## Context

Aegis can detect suspicious activity and draft platform reports, takedown requests, statements, and other responses. Incorrect external action can harm a target, violate platform rules, create legal exposure, and destroy customer trust. Model output and automated matching can be uncertain or adversarially manipulated.

## Decision

Agents and detection pipelines may collect evidence, produce structured findings, calculate transparent risk, notify users, and generate drafts. They may not publish, report, delete, ban, contact a third party, or submit a legal/enforcement action.

An `OWNER` or `REVIEWER` explicitly approves an immutable version of an enforcement action. Only then does the response worker receive an idempotent `enforcement.approved.v1` event. The worker validates the current action version and approval state before one permitted provider call. All transitions and provider results are audited.

## Consequences

- A human review step adds latency but prevents an unsafe automation boundary.
- Product must make triage, evidence, limitations, and approval workflows fast enough that teams will use them.
- Future narrowly scoped automation would require a separate ADR, legal/security review, clear opt-in, measurable quality threshold, reversible control, and a kill switch.
