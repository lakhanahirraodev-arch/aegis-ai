# Detailed Folder Structure

```text
.
├── apps/
│   ├── web/
│   │   └── src/
│   │       ├── app/              Next.js route groups/layouts
│   │       ├── components/       web-only composed components
│   │       ├── features/         vertical UI modules
│   │       ├── lib/              API/Clerk/browser adapters
│   │       └── styles/           Tailwind entrypoint and theme extensions
│   ├── api/
│   │   └── src/
│   │       ├── app/              Fastify composition/plugins
│   │       ├── modules/          routes, schemas, application/domain/infrastructure
│   │       ├── plugins/          auth, context, error, observability
│   │       └── jobs/             outbox publisher adapter
│   └── worker/
│       └── src/
│           ├── consumers/        queue handlers
│           ├── connectors/       platform API/crawler adapters
│           ├── evidence/         capture, hashing, storage pipeline
│           ├── agents/           orchestration and specialist adapters
│           └── notifications/    delivery adapters
├── packages/
│   ├── ai-contracts/             agent I/O and policy contracts
│   ├── config/                   shared lint/TS/Tailwind/env config
│   ├── contracts/                API schemas, events, error vocabulary
│   ├── database/
│   │   └── prisma/               schema and reviewable migrations
│   └── ui/                       shared shadcn/ui primitives/tokens
├── infra/
│   ├── docker/                   Dockerfiles and local infrastructure notes
│   └── iac/                      Phase 1+ AWS/Cloudflare infrastructure code
├── docs/
│   ├── adr/                      durable architecture decisions
│   ├── runbooks/                 operational procedures
│   ├── security.md               threat model and privacy controls
│   ├── deployment.md             production topology and recovery
│   └── testing-strategy.md       quality gates and AI evaluation
├── .github/workflows/            CI and security automation
├── docker-compose.yml            local PostgreSQL, Redis, MinIO
├── pnpm-workspace.yaml
└── turbo.json
```

The empty source folders are intentionally represented by `.gitkeep` placeholders. Add application code only in the implementation phases described in [the roadmap](roadmap.md). The dependency direction and module layout rules are defined in [coding standards](coding-standards.md).
