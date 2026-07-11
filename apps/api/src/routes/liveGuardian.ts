import type { FastifyPluginAsync } from "fastify";
import { prisma } from "@aegis/database";
import { eventBus } from "../modules/integrations/EventBus";
import crypto from "crypto";

/**
 * Live Guardian endpoints for Sprint 5 MVP.
 */
const liveGuardianRoutes: FastifyPluginAsync = async (fastify) => {
  const auth = [async (req: any, rep: any) => await fastify.authenticate(req, rep)];

  // ─── GET /v1/live/sessions ────────────────────────────────────────────────
  fastify.get("/v1/live/sessions", { preValidation: auth }, async (request) => {
    const workspaceId = request.actor.workspaceId;
    if (!workspaceId) return { sessions: [] };

    const sessions = await prisma.liveSession.findMany({
      where: { workspaceId },
      include: {
        liveChannel: {
          select: {
            platform: true,
            displayName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { sessions };
  });

  // ─── GET /v1/live/sessions/:sessionId/messages ────────────────────────────
  fastify.get<{ Params: { sessionId: string } }>(
    "/v1/live/sessions/:sessionId/messages",
    { preValidation: auth },
    async (request, reply) => {
      const { sessionId } = request.params;
      const workspaceId = request.actor.workspaceId;
      if (!workspaceId) return reply.code(400).send({ error: "Workspace context required" });

      const messages = await prisma.liveChatMessage.findMany({
        where: {
          workspaceId,
          liveSessionId: sessionId,
        },
        include: {
          findings: true,
          actions: true,
        },
        orderBy: { receivedAt: "desc" },
        take: 100,
      });

      return { messages };
    },
  );

  // ─── GET /v1/live/sessions/:sessionId/stats ───────────────────────────────
  fastify.get<{ Params: { sessionId: string } }>(
    "/v1/live/sessions/:sessionId/stats",
    { preValidation: auth },
    async (request, reply) => {
      const { sessionId } = request.params;
      const workspaceId = request.actor.workspaceId;
      if (!workspaceId) return reply.code(400).send({ error: "Workspace context required" });

      // Fetch community health score
      const health = await prisma.communityHealthSnapshot.findFirst({
        where: { workspaceId, liveSessionId: sessionId },
        orderBy: { createdAt: "desc" },
      });

      // Count active incident count
      const activeIncidents = await prisma.liveIncident.count({
        where: {
          workspaceId,
          liveSessionId: sessionId,
          status: "OPEN",
        },
      });

      // Fetch messages per minute (last 5m average)
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const recentMessagesCount = await prisma.liveChatMessage.count({
        where: {
          workspaceId,
          liveSessionId: sessionId,
          receivedAt: { gte: fiveMinutesAgo },
        },
      });

      const messagesPerMinute = parseFloat((recentMessagesCount / 5).toFixed(1));

      // Mock viewer count based on platform
      const session = await prisma.liveSession.findUnique({
        where: { id: sessionId },
        include: { liveChannel: true },
      });

      const viewers = session?.liveChannel?.platform === "YOUTUBE" ? 4500 : 1200;

      return {
        messagesPerMinute,
        viewers,
        communityHealth: health ? parseFloat(health.score.toString()) : 100,
        activeIncidents,
        aiStatus: "ACTIVE",
        moderatorStatus: "CONNECTED",
      };
    },
  );

  // ─── POST /v1/live/actions ────────────────────────────────────────────────
  fastify.post<{
    Body: {
      messageId: string;
      actionType: "WARN" | "DELETE_MESSAGE" | "TIMEOUT" | "BAN" | "NOTIFY_MODERATOR";
      reason?: string;
    };
  }>(
    "/v1/live/actions",
    {
      preValidation: [
        async (req, rep) => await fastify.authenticate(req, rep),
        async (req, rep) => await fastify.requirePermission("TRIAGE_DETECTIONS")(req, rep),
      ],
    },
    async (request, reply) => {
      const { messageId, actionType, reason } = request.body;
      const workspaceId = request.actor.workspaceId;
      if (!workspaceId) return reply.code(400).send({ error: "Workspace context required" });

      const message = await prisma.liveChatMessage.findUnique({
        where: { id: messageId },
      });

      if (!message || message.workspaceId !== workspaceId) {
        return reply.code(404).send({ error: "Chat message not found" });
      }

      // Update message status
      await prisma.liveChatMessage.update({
        where: { id: messageId },
        data: { status: "ACTIONED" },
      });

      // Create LiveModerationAction
      const appliedAction = await prisma.liveModerationAction.create({
        data: {
          workspaceId,
          liveSessionId: message.liveSessionId,
          liveChatMessageId: messageId,
          actionType: actionType as any,
          source: "HUMAN_MODERATOR",
          status: "APPLIED",
          reasonCode: "MANUAL_MODERATION",
          explanation: reason ?? "Moderator manual intervention",
          policyVersion: "1.0.0",
          idempotencyKey: crypto.randomUUID(),
          requestedById: request.actor.id,
        },
      });

      // Acknowledge findings associated with the message
      await prisma.liveModerationFinding.updateMany({
        where: {
          workspaceId,
          liveChatMessageId: messageId,
        },
        data: { status: "CONFIRMED" },
      });

      // Log to workspace AuditLog
      await request.logAudit({
        action: `LIVE_MODERATION_${actionType}`,
        resourceType: "LIVE_CHAT_MESSAGE",
        resourceId: messageId,
        outcome: "SUCCESS",
      });

      // Create timeline entries in live incidents if there are active incidents for this session
      const activeInc = await prisma.liveIncident.findFirst({
        where: {
          workspaceId,
          liveSessionId: message.liveSessionId,
          status: "OPEN",
        },
        orderBy: { createdAt: "desc" },
      });

      if (activeInc) {
        await prisma.liveIncidentTimelineEntry.create({
          data: {
            workspaceId,
            liveIncidentId: activeInc.id,
            moderationActionId: appliedAction.id,
            eventType: "ACTION_APPLIED",
            summary: `Moderator manually applied enforcement: ${actionType}`,
            metadata: {
              reason,
              operator: request.actor.id,
            },
          },
        });
      }

      return { success: true, actionId: appliedAction.id };
    },
  );

  // ─── POST /v1/live/simulate (Simulation Endpoint) ─────────────────────────
  fastify.post<{
    Body: {
      platform: "TWITCH" | "YOUTUBE";
      authorName: string;
      text: string;
      isModerator?: boolean;
    };
  }>("/v1/live/simulate", { preValidation: auth }, async (request, reply) => {
    const { platform, authorName, text, isModerator } = request.body;
    const workspaceId = request.actor.workspaceId;
    if (!workspaceId) return reply.code(400).send({ error: "Workspace context required" });

    // Create a mock Eventsub body representation
    const messageId = `mock_msg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const authorId = `mock_author_${authorName.toLowerCase()}`;

    let rawBody = "";
    let headers: Record<string, string> = {};

    if (platform === "TWITCH") {
      rawBody = JSON.stringify({
        subscription: { type: "channel.chat.message" },
        event: {
          message_id: messageId,
          broadcaster_user_id: "twitch_mock_user_id",
          chatter_user_id: authorId,
          chatter_user_name: authorName,
          message: { text },
          broadcaster_user_login: "mocktwitchstreamer",
        },
      });

      // Computed hash signature for mock secret
      const computedSig = require("crypto")
        .createHmac("sha256", "mock-webhook-secret")
        .update(messageId + "timestamp" + rawBody)
        .digest("hex");

      headers = {
        "twitch-eventsub-message-id": messageId,
        "twitch-eventsub-message-timestamp": "timestamp",
        "twitch-eventsub-message-signature": `sha256=${computedSig}`,
      };
    } else {
      // Fallback or YouTube: simulate publishing directly into eventBus
      const eventId = await eventBus
        .publish(
          workspaceId,
          platform,
          JSON.stringify({
            feed: {
              title: "YouTube Mock Message Ingest",
            },
          }),
          {},
          "mock-webhook-secret",
        )
        .catch(() => null);

      // YouTube live chat works via EventBus simulation manually
      const {
        processLiveChatMessage,
      } = require("../../../worker/src/consumers/liveGuardianConsumer");
      const chatMsgId = await processLiveChatMessage(workspaceId, platform, {
        messageId,
        authorId,
        authorName,
        text,
        isModerator,
      });

      return { success: true, eventId: chatMsgId };
    }

    // Publish Twitch mock events through the full platform signature endpoint
    const eventId = await eventBus.publish(
      workspaceId,
      "TWITCH",
      rawBody,
      headers,
      "mock-webhook-secret",
    );
    return { success: true, eventId };
  });
};

export default liveGuardianRoutes;
