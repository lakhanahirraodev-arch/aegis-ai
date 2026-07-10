# ADR 0001: Modular monolith in a Turborepo

- **Status:** Accepted
- **Date:** 2026-07-10

## Context

Aegis needs a web experience, authenticated API, asynchronous collection, evidence processing, and AI analysis. Premature microservices increase operational/data-consistency burden, while putting all work in the web process makes media analysis and connector reliability unsafe.

## Decision

Use a pnpm/Turborepo monorepo with three deployable applications: `web`, `api`, and `worker`. Keep the business domain modular and communicate asynchronous work through transactional outbox and versioned events. Share only contracts, configuration, UI, and database ownership packages. The API and worker are the only database clients.

## Consequences

- A small team deploys each workload independently against a coherent data model.
- The worker is isolated from user-facing latency and can have stricter network/compute controls.
- Future extraction has an event and aggregate seam.
- Database coordination remains a risk; modules must preserve ownership and avoid hidden cross-module writes.
