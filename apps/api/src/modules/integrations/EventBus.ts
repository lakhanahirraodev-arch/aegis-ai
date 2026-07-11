import { Queue } from "bullmq";
import { prisma } from "@aegis/database";
import { providerRegistry, type PlatformKey } from "./ProviderRegistry";

const PLATFORM_EVENTS_QUEUE = "platform-events";

// BullMQ queue — lazily connected to Redis
let _queue: Queue | null = null;

function getQueue(): Queue {
  if (!_queue) {
    _queue = new Queue(PLATFORM_EVENTS_QUEUE, {
      connection: {
        url: process.env.REDIS_URL ?? "redis://localhost:6379",
      },
      defaultJobOptions: {
        attempts: 5,
        backoff: {
          type: "exponential",
          delay: 2000, // 2s, 4s, 8s, 16s, 32s
        },
        removeOnComplete: { age: 86_400 }, // keep for 24h
        removeOnFail: { age: 604_800 }, // keep failures for 7d
      },
    });
  }
  return _queue;
}

/**
 * EventBus — the single gateway between platform providers and BullMQ.
 *
 * Providers NEVER communicate directly with BullMQ.
 * The flow is:
 *   Provider → EventBus.publish() → DB (IngestedEvent, QUEUED) → BullMQ job
 *
 * Responsibilities:
 *   - Signature validation via provider
 *   - Event normalization via provider
 *   - Idempotency deduplication (unique constraint on workspaceId + platform + externalId + eventType)
 *   - Atomic DB write + BullMQ dispatch
 *   - Dead-letter and error tracking
 *   - Structured logging (never logs plaintext secrets)
 */
export class EventBus {
  /**
   * Publish a raw platform webhook payload through the full pipeline.
   *
   * @param workspaceId  - Workspace that owns this integration
   * @param platform     - Platform key (e.g. "TWITCH")
   * @param rawBody      - Raw request body string (for HMAC verification)
   * @param headers      - Request headers (for signature verification)
   * @param webhookSecret - Optional platform-specific webhook secret
   * @returns The created IngestedEvent id, or null if the event was deduplicated.
   */
  async publish(
    workspaceId: string,
    platform: PlatformKey,
    rawBody: string,
    headers: Record<string, string>,
    webhookSecret?: string,
  ): Promise<string | null> {
    if (!providerRegistry.has(platform)) {
      throw new Error(`Unknown platform: ${platform}`);
    }

    const provider = providerRegistry.get(platform);

    // 1. Validate webhook signature
    const isValid = await provider.validateWebhook(headers, rawBody, webhookSecret);
    if (!isValid) {
      throw new Error(`Webhook signature validation failed for platform: ${platform}`);
    }

    // 2. Parse and normalize payload
    let rawPayload: unknown;
    try {
      rawPayload = JSON.parse(rawBody);
    } catch {
      rawPayload = rawBody;
    }

    const normalized = await provider.normalizeEvent(rawPayload);
    if (!normalized) {
      // Event type not recognized or intentionally skipped
      return null;
    }

    const { eventType, externalId, payload } = normalized;

    // 3. Idempotency check + persistence (upsert to avoid duplicate processing)
    let ingestedEventId: string;
    try {
      const record = await prisma.ingestedEvent.upsert({
        where: {
          workspaceId_platform_externalId_eventType: {
            workspaceId,
            platform: platform as any,
            externalId,
            eventType,
          },
        },
        update: {}, // Already exists — do nothing (idempotent)
        create: {
          workspaceId,
          platform: platform as any,
          eventType,
          externalId,
          payload: payload as any,
          rawPayload: rawPayload as any,
          status: "QUEUED",
        },
        select: { id: true, status: true },
      });

      ingestedEventId = record.id;

      // If already processed/queued, skip re-dispatch
      if (record.status !== "QUEUED") {
        return record.id;
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      throw new Error(`EventBus: DB write failed for ${platform}/${eventType}: ${message}`);
    }

    // 4. Dispatch to BullMQ
    try {
      const queue = getQueue();
      await queue.add(
        `${platform}:${eventType}`,
        {
          ingestedEventId,
          workspaceId,
          platform,
          eventType,
          payload,
        },
        {
          jobId: ingestedEventId, // Ensures BullMQ deduplication at queue level
        },
      );
    } catch (err: unknown) {
      // Mark as FAILED with error message if BullMQ dispatch fails
      const message = err instanceof Error ? err.message : String(err);
      await prisma.ingestedEvent.update({
        where: { id: ingestedEventId },
        data: {
          status: "FAILED",
          errorMessage: `BullMQ dispatch error: ${message}`,
        },
      });
      throw new Error(`EventBus: BullMQ dispatch failed for ${platform}/${eventType}: ${message}`);
    }

    return ingestedEventId;
  }

  /**
   * Handle a YouTube PubSubHubbub hub challenge (GET request for subscription verification).
   * YouTube sends this to verify webhook endpoint ownership.
   */
  handleYouTubeChallenge(queryParams: Record<string, string>): string | null {
    return queryParams["hub.challenge"] ?? null;
  }
}

// Singleton
export const eventBus = new EventBus();
