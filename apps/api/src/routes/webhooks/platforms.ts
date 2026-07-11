import type { FastifyPluginAsync, FastifyRequest } from "fastify";
import { eventBus } from "../../modules/integrations/EventBus";
import { providerRegistry, type PlatformKey } from "../../modules/integrations/ProviderRegistry";
import { prisma } from "@aegis/database";

/**
 * Platform webhook ingestion routes.
 *
 * POST /v1/webhooks/platforms/:platform   — receive signed platform events
 * GET  /v1/webhooks/platforms/youtube     — YouTube PubSubHubbub challenge
 *
 * All routes validate the webhook signature before processing.
 * The raw body is forwarded to the EventBus for normalization and dispatch.
 */
const platformWebhookRoutes: FastifyPluginAsync = async (fastify) => {
  // ─── YouTube PubSubHubbub challenge (GET) ─────────────────────────────────
  fastify.get<{ Querystring: Record<string, string> }>(
    "/v1/webhooks/platforms/youtube",
    async (request, reply) => {
      const challenge = eventBus.handleYouTubeChallenge(request.query);
      if (!challenge) {
        return reply.code(400).send({ error: "Missing hub.challenge" });
      }
      // YouTube expects plain-text challenge response
      return reply.type("text/plain").send(challenge);
    },
  );

  // ─── Generic platform webhook POST ────────────────────────────────────────
  fastify.post<{
    Params: { platform: string };
    Querystring: { workspaceId?: string };
  }>(
    "/v1/webhooks/platforms/:platform",
    {
      config: {
        // Disable body parsing — we need the raw body for HMAC verification
        rawBody: true,
      },
    },
    async (request, reply) => {
      const { platform } = request.params;
      const upperPlatform = platform.toUpperCase() as PlatformKey;

      if (!providerRegistry.has(upperPlatform)) {
        return reply.code(400).send({ error: `Unknown platform: ${platform}` });
      }

      // Resolve workspaceId from query param, header, or first matching account
      let workspaceId: string | null =
        (request.query.workspaceId as string) ??
        (request.headers["x-workspace-id"] as string) ??
        null;

      if (!workspaceId) {
        // Attempt to resolve via platform header identifiers
        const account = await prisma.connectedAccount.findFirst({
          where: {
            platform: upperPlatform as any,
            status: "ACTIVE",
          },
          select: { workspaceId: true, secretReference: true },
          orderBy: { createdAt: "asc" },
        });
        workspaceId = account?.workspaceId ?? null;
      }

      if (!workspaceId) {
        return reply.code(400).send({ error: "Cannot resolve workspace for webhook" });
      }

      // Get the raw body as string for signature verification
      const rawBody =
        (request as FastifyRequest & { rawBody?: string }).rawBody ??
        JSON.stringify(request.body) ??
        "";

      const headers = Object.fromEntries(
        Object.entries(request.headers).map(([k, v]) => [k, String(v ?? "")]),
      );

      try {
        // Dispatch the event through the full pipeline
        const eventId = await eventBus.publish(workspaceId, upperPlatform, rawBody, headers);

        if (!eventId) {
          // Event was skipped (unknown type) — return 200 to prevent platform retries
          return reply.code(200).send({ received: true, skipped: true });
        }

        return reply.code(200).send({ received: true, eventId });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);

        if (message.includes("signature")) {
          return reply.code(401).send({ error: "Webhook signature verification failed" });
        }

        fastify.log.error(err, `Webhook processing failed for ${platform}`);
        return reply.code(500).send({ error: "Internal processing error" });
      }
    },
  );
};

export default platformWebhookRoutes;
