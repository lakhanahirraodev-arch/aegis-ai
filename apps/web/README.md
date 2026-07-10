# Web application boundary

Reserved for the Next.js 15 / React 19 application.

```text
src/
  app/             route groups and layouts
  components/      application-specific components
  features/        feature modules composed from UI and API contracts
  lib/             browser/server adapters
  styles/          Tailwind entrypoint and theme extensions
```

Use Clerk's Next.js integration at the route boundary. Do not put domain authorization, direct Prisma calls, or crawler/AI work in this application.
