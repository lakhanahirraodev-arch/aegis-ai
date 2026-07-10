import dotenv from "dotenv";
import path from "path";

// Load environment variables from root or local workspace
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

import fastify from "fastify";
import cors from "@fastify/cors";
import { validateEnv } from "@aegis/config";

// Validate env vars
let env: any;
try {
  env = validateEnv(process.env);
} catch (err) {
  console.warn("⚠️ Environment validation failed. Falling back to dev defaults.");
  env = {
    NODE_ENV: "development",
    DATABASE_URL:
      process.env.DATABASE_URL || "postgresql://aegis:aegis@localhost:5432/aegis?schema=public",
    REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379",
  };
}

const server = fastify({
  logger: {
    level: env.NODE_ENV === "development" ? "debug" : "info",
  },
});

server.register(cors, {
  origin: "*",
});

// Health check endpoints as documented in docs/api.md
server.get("/healthz", async () => {
  return { status: "OK" };
});

server.get("/readyz", async () => {
  // Return operational readiness
  return { status: "READY" };
});

// Me endpoint contract verification path
server.get("/v1/me", async () => {
  return {
    id: "scaffold-user-id",
    displayName: "Aegis OS Operator",
    email: "operator@aegis.example",
    capabilities: ["READ_AUDIT", "MANAGE_WORKSPACE"],
  };
});

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
