import dotenv from "dotenv";
import path from "path";

// Load environment variables from root or local workspace
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

import fastify from "fastify";
import { Worker, Queue } from "bullmq";
import { validateEnv } from "@aegis/config";
import { prisma } from "@aegis/database";

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

const REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";
const PLATFORM_EVENTS_QUEUE = "platform-events";
const RAW_PAYLOAD_RETENTION_DAYS = 30;
const MAX_DEAD_LETTER_ATTEMPTS = 5;

// ─── BullMQ Platform Events Worker ────────────────────────────────────────

const platformEventsWorker = new Worker(
  PLATFORM_EVENTS_QUEUE,
  async (job) => {
    const { ingestedEventId, platform, eventType } = job.data;

    console.log(
      `[worker] Processing job ${job.id}: ${platform}/${eventType} (event: ${ingestedEventId})`,
    );

    // Mark event as PROCESSING
    await prisma.ingestedEvent.update({
      where: { id: ingestedEventId },
      data: { status: "PROCESSING" },
    });

    try {
      // Execute the Live Guardian MVP moderation pipeline for chat events
      if (eventType === "CHAT_MESSAGE") {
        const { workspaceId, payload } = job.data;
        const { processLiveChatMessage } = require("./consumers/liveGuardianConsumer");
        await processLiveChatMessage(workspaceId, platform, payload);
      }

      await prisma.ingestedEvent.update({
        where: { id: ingestedEventId },
        data: {
          status: "PROCESSED",
          processedAt: new Date(),
          errorMessage: null,
        },
      });

      console.log(`[worker] ✅ Event ${ingestedEventId} processed successfully`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      const attempts = (job.attemptsMade ?? 0) + 1;

      // After max attempts, move to dead-letter
      const newStatus = attempts >= MAX_DEAD_LETTER_ATTEMPTS ? "DEAD_LETTER" : "FAILED";

      await prisma.ingestedEvent.update({
        where: { id: ingestedEventId },
        data: {
          status: newStatus,
          errorMessage: message,
        },
      });

      if (newStatus === "DEAD_LETTER") {
        console.error(
          `[worker] ☠️  Event ${ingestedEventId} moved to dead-letter after ${attempts} attempts`,
        );
      }

      throw err; // Re-throw so BullMQ handles retry backoff
    }
  },
  {
    connection: { url: REDIS_URL },
    concurrency: 10,
  },
);

platformEventsWorker.on("completed", (job) => {
  console.log(`[worker] Job ${job.id} completed`);
});

platformEventsWorker.on("failed", (job, err) => {
  console.error(`[worker] Job ${job?.id} failed:`, err.message);
});

// ─── Retention Pruning (daily cron) ───────────────────────────────────────
// Remove raw payloads from events older than 30 days (GDPR compliance).
// Full record is retained; only the rawPayload JSON column is nulled.

const retentionQueue = new Queue("retention", {
  connection: { url: REDIS_URL },
});

const retentionWorker = new Worker(
  "retention",
  async (_job) => {
    const cutoffDate = new Date(Date.now() - RAW_PAYLOAD_RETENTION_DAYS * 24 * 60 * 60 * 1000);

    const result = await prisma.ingestedEvent.updateMany({
      where: {
        createdAt: { lt: cutoffDate },
        rawPayload: { not: null as any },
      },
      data: { rawPayload: null as any },
    });

    console.log(
      `[worker] Retention pruning: cleared rawPayload from ${result.count} events older than ${RAW_PAYLOAD_RETENTION_DAYS} days`,
    );
  },
  {
    connection: { url: REDIS_URL },
    concurrency: 1,
  },
);

retentionWorker.on("failed", (job, err) => {
  console.error(`[worker] Retention job ${job?.id} failed:`, err.message);
});

// Schedule daily pruning job using repeatable BullMQ job
async function scheduleDailyRetention() {
  await retentionQueue.add(
    "daily-raw-payload-pruning",
    {},
    {
      repeat: {
        pattern: "0 3 * * *", // 03:00 UTC every day
      },
      jobId: "daily-raw-payload-pruning",
    },
  );
  console.log("[worker] Scheduled daily retention pruning at 03:00 UTC");
}

// ─── Fastify health server ─────────────────────────────────────────────────

const server = fastify({
  logger: {
    level: env.NODE_ENV === "development" ? "debug" : "info",
  },
});

server.get("/healthz", async () => {
  return { status: "OK", service: "worker" };
});

server.get("/readyz", async () => {
  const workerRunning = !platformEventsWorker.closing;
  return {
    status: workerRunning ? "READY" : "NOT_READY",
    service: "worker",
    workers: {
      platformEvents: workerRunning ? "running" : "closed",
    },
  };
});

const start = async () => {
  try {
    await scheduleDailyRetention();

    const port = parseInt(process.env.WORKER_PORT || "4001", 10);
    await server.listen({ port, host: "0.0.0.0" });
    server.log.info(`⚙️ Aegis Background Worker running on port ${port}`);
    server.log.info(`✅ BullMQ worker listening on queue: ${PLATFORM_EVENTS_QUEUE}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
