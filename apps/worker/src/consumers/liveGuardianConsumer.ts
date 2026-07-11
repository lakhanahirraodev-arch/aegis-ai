import crypto from "crypto";
import { prisma } from "@aegis/database";
import { moderationPipeline } from "../agents/moderationPipeline";

export interface ChatMessagePayload {
  messageId?: string;
  authorId?: string;
  authorName?: string;
  text?: string;
  isModerator?: boolean;
}

/**
 * liveGuardianConsumer - Ingests chat messages, executes the moderation pipeline,
 * and handles database updates for enforcements, timeline entries, evidence capturing, and risk scoring.
 */
export async function processLiveChatMessage(
  workspaceId: string,
  platform: string,
  payload: ChatMessagePayload,
): Promise<string> {
  const upperPlatform = platform.toUpperCase();

  // 1. Resolve or create LiveChannel
  let liveChannel = await prisma.liveChannel.findFirst({
    where: {
      workspaceId,
      platform: upperPlatform as any,
    },
  });

  if (!liveChannel) {
    liveChannel = await prisma.liveChannel.create({
      data: {
        workspaceId,
        platform: upperPlatform as any,
        externalChannelId: `${platform.toLowerCase()}_channel_default`,
        displayName: `${platform.charAt(0) + platform.slice(1).toLowerCase()}Streamer`,
        status: "ACTIVE",
      },
    });
  }

  // 2. Resolve or create LiveSession
  let liveSession = await prisma.liveSession.findFirst({
    where: {
      workspaceId,
      liveChannelId: liveChannel.id,
      status: "LIVE",
    },
  });

  if (!liveSession) {
    liveSession = await prisma.liveSession.create({
      data: {
        workspaceId,
        liveChannelId: liveChannel.id,
        title: "Live Aegis Shield Protection Stream",
        status: "LIVE",
        startedAt: new Date(),
      },
    });
  }

  // 3. Create LiveChatMessage
  const rawText = payload.text ?? "";
  const authorName = payload.authorName ?? "Anonymous";
  const authorId = payload.authorId ?? "unknown";
  const platformMessageId =
    payload.messageId ?? `msg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

  const authorHash = crypto.createHash("sha256").update(authorId).digest("hex");
  const contentHash = crypto
    .createHash("sha256")
    .update(rawText.trim().toLowerCase())
    .digest("hex");

  const liveMessage = await prisma.liveChatMessage.create({
    data: {
      workspaceId,
      liveSessionId: liveSession.id,
      platformMessageId,
      authorExternalIdHash: authorHash,
      authorDisplayEncrypted: authorName, // Simple text representation
      contentEncrypted: rawText,
      normalizedContentHash: contentHash,
      isModerator: payload.isModerator ?? false,
      status: "RECEIVED",
      receivedAt: new Date(),
      metadata: {
        authorName,
        text: rawText,
        riskScore: 0,
      },
    },
  });

  // 4. Run the Moderation Pipeline
  const analysis = moderationPipeline.analyze(rawText);

  // 5. Create LiveModerationFindings
  for (const finding of analysis.findings) {
    await prisma.liveModerationFinding.create({
      data: {
        workspaceId,
        liveSessionId: liveSession.id,
        liveChatMessageId: liveMessage.id,
        category: finding.category,
        status: "OPEN",
        severity: finding.severity,
        confidence: finding.confidence,
        rationale: finding.rationale,
        policyVersion: "1.0.0",
      },
    });
  }

  // 6. Create recommended LiveModerationAction
  await prisma.liveModerationAction.create({
    data: {
      workspaceId,
      liveSessionId: liveSession.id,
      liveChatMessageId: liveMessage.id,
      actionType: analysis.recommendedAction as any,
      source: "POLICY_AUTOMATION",
      status: "SUGGESTED",
      reasonCode: "AI_SUGGESTION",
      explanation: analysis.reason,
      policyVersion: "1.0.0",
      idempotencyKey: crypto.randomUUID(),
    },
  });

  // 7. Evidence capturing (riskScore >= 45)
  if (analysis.riskScore >= 45) {
    const evidenceItem = await prisma.evidenceItem.create({
      data: {
        workspaceId,
        kind: "METADATA",
        status: "CAPTURED",
        objectKey: `evidence/live_messages/${liveMessage.id}`,
        contentType: "application/json",
        captureManifest: {
          originalMessage: rawText,
          platform: upperPlatform,
          user: authorName,
          timestamp: new Date().toISOString(),
          riskScore: analysis.riskScore,
          reason: analysis.reason,
          aiRecommendation: analysis.recommendedAction,
        },
        capturedAt: new Date(),
      },
    });

    await prisma.liveMessageEvidence.create({
      data: {
        workspaceId,
        liveChatMessageId: liveMessage.id,
        evidenceItemId: evidenceItem.id,
        purpose: "MODERATION_RECORD",
      },
    });
  }

  // 8. Incident creation (riskScore >= 75)
  if (analysis.riskScore >= 75) {
    const severity = analysis.riskScore >= 90 ? "CRITICAL" : "HIGH";
    const primaryCategory = analysis.findings[0]?.category ?? "OTHER";

    const incident = await prisma.liveIncident.create({
      data: {
        workspaceId,
        liveSessionId: liveSession.id,
        category: primaryCategory,
        status: "OPEN",
        severity: severity as any,
        title: `High Risk Chat Event: ${primaryCategory}`,
        summary: `User @${authorName} posted a high-risk chat message: "${rawText}".`,
        riskScore: analysis.riskScore,
      },
    });

    await prisma.liveIncidentTimelineEntry.create({
      data: {
        workspaceId,
        liveIncidentId: incident.id,
        eventType: "INCIDENT_OPENED",
        summary: `Threat Alert flagged by AI with risk score ${analysis.riskScore}%`,
        metadata: {
          messageId: liveMessage.id,
          author: authorName,
          text: rawText,
        },
      },
    });
  }

  // 9. Update live chat message to CLASSIFIED
  await prisma.liveChatMessage.update({
    where: { id: liveMessage.id },
    data: {
      status: "CLASSIFIED",
      metadata: {
        authorName,
        text: rawText,
        riskScore: analysis.riskScore,
        recommendedAction: analysis.recommendedAction,
        reason: analysis.reason,
      },
    },
  });

  // 10. Update Community Health Snapshot
  const lastMessages = await prisma.liveChatMessage.findMany({
    where: {
      liveSessionId: liveSession.id,
      status: "CLASSIFIED",
    },
    take: 20,
    orderBy: { receivedAt: "desc" },
    select: { metadata: true },
  });

  let avgRisk = 0;
  if (lastMessages.length > 0) {
    const sum = lastMessages.reduce((acc, msg) => {
      const meta = msg.metadata as Record<string, any>;
      return acc + (meta?.riskScore ?? 0);
    }, 0);
    avgRisk = sum / lastMessages.length;
  }

  const healthScore = Math.max(0, Math.min(100, 100 - avgRisk));

  // Upsert community health snapshot for the session
  await prisma.communityHealthSnapshot.create({
    data: {
      workspaceId,
      liveChannelId: liveChannel.id,
      liveSessionId: liveSession.id,
      score: healthScore,
      windowStartedAt: new Date(Date.now() - 60_000),
      windowEndedAt: new Date(),
    },
  });

  return liveMessage.id;
}
