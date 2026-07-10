# Database package

Owns the Prisma data model, reviewed SQL migrations, database client, and scoped repository conventions. The authoritative starting schema is [prisma/schema.prisma](prisma/schema.prisma); it models workspace isolation, monitoring, evidence provenance, detections, cases, agent runs, operations, and audit records.

Only `apps/api` and `apps/worker` access the database. Every tenant-owned query must require a `workspaceId`; production additionally enforces this at PostgreSQL row-level security. Prisma migrations handle portable relational changes, while reviewed SQL migrations add `pgcrypto`, `vector`, RLS policies, immutable-audit triggers, partial indexes, and vector indexes.

See [the data model](../../docs/database.md), [authorization design](../../docs/permissions.md), and [migration protocol](../../docs/developer-guide.md#database-migration-protocol).
