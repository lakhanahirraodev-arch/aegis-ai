# API application boundary

Reserved for the Fastify application.

```text
src/
  app/             server composition and plugins
  modules/         domain modules with routes, services, repositories, schemas
  plugins/         Clerk auth, request context, observability, errors
  jobs/            outbox publishing adapters only
```

Fastify owns the public API contract and authorization. Long-running work is published via the outbox and handled by `apps/worker`.
