import dotenv from "dotenv";
import path from "path";

// Load environment variables from root or local workspace
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

import fastify, { FastifyRequest, FastifyReply } from "fastify";
import cors from "@fastify/cors";
import { validateEnv } from "@aegis/config";

// Validate env vars
let env: any;
try {
  env = validateEnv(process.env);
} catch (_err) {
  console.warn("⚠️ Environment validation failed. Falling back to dev defaults.");
  env = {
    NODE_ENV: "development",
    DATABASE_URL:
      process.env.DATABASE_URL || "postgresql://aegis:aegis@localhost:5432/aegis?schema=public",
    REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379",
  };
}

import authPlugin from "./plugins/auth";
import permissionsPlugin from "./plugins/permissions";
import featureFlagsPlugin from "./plugins/featureFlags";
import auditPlugin from "./plugins/audit";
import clerkWebhookRoutes from "./routes/webhooks/clerk";
import integrationRoutes from "./routes/integrations";
import platformWebhookRoutes from "./routes/webhooks/platforms";

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

const server = fastify({
  logger: {
    level: env.NODE_ENV === "development" ? "debug" : "info",
  },
});

server.register(cors, {
  origin: "*",
});

// Register future-proof authorization plugins
server.register(authPlugin);
server.register(permissionsPlugin);
server.register(featureFlagsPlugin);
server.register(auditPlugin);

// Register Clerk synchronization webhook routes
server.register(clerkWebhookRoutes);

// Register platform integration routes (OAuth, connect/disconnect, health)
server.register(integrationRoutes);

// Register platform webhook ingestion routes
server.register(platformWebhookRoutes);

// Health check endpoints as documented in docs/api.md
server.get("/healthz", async () => {
  return { status: "OK" };
});

server.get("/readyz", async () => {
  // Return operational readiness
  return { status: "READY" };
});

// Me endpoint protected by authentication and capability-based RBAC
server.get(
  "/v1/me",
  {
    preValidation: [
      async (req, rep) => await server.authenticate(req, rep),
      async (req, rep) => await server.requirePermission("VIEW_DASHBOARD")(req, rep),
    ],
  },
  async (request) => {
    // Log successful access to audit log
    await request.logAudit({
      action: "ACCESS_ME",
      resourceType: "USER",
      resourceId: request.actor.id,
      outcome: "SUCCESS",
    });

    return {
      id: request.actor.id,
      type: request.actor.type,
      workspaceId: request.actor.workspaceId,
      role: request.workspaceRole,
    };
  },
);

const start = async () => {
  try {
    const port = parseInt(process.env.PORT || "4000", 10);
    await server.listen({ port, host: "0.0.0.0" });
    server.log.info(`🚀 Fastify backend running on port ${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
