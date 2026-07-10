# ADR 0003: Defense-in-depth workspace isolation with PostgreSQL RLS

- **Status:** Accepted
- **Date:** 2026-07-10

## Context

Agencies and businesses may protect multiple creators, while the platform holds highly sensitive evidence and identity data. An authorization bug must not create cross-workspace access. Application-only tenant filtering is insufficient for this risk profile.

## Decision

Every tenant-owned record includes a `workspace_id` and is accessed through a repository that requires an explicit workspace scope. Production PostgreSQL enables row-level security for tenant tables. After authentication/worker authorization, the database transaction receives a transaction-local workspace claim; policies permit only matching rows. Association tables also carry a workspace scope. Reviewed SQL triggers validate that linked rows belong to the same workspace where a relational foreign key alone cannot prove it.

Privileged maintenance and migrations use distinct narrowly scoped database roles and documented audited procedures. The web application does not receive database credentials.

## Consequences

- Database queries and tests are more deliberate; cross-tenant reporting needs an explicit privileged aggregate/projection path.
- Schema migrations must include RLS policy and same-workspace trigger review.
- A database connection may not be reused across request scopes without clearing the transaction-local setting.
