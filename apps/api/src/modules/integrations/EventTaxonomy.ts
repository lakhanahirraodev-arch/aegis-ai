/**
 * Platform-independent event taxonomy for Aegis AI.
 *
 * All provider-specific webhook payloads are normalized to these event types
 * before being written to IngestedEvent and dispatched to BullMQ.
 *
 * DO NOT add provider-specific event names here — keep this taxonomy
 * platform-agnostic so consumers (AI agents, workers) never depend
 * on a single platform's API shape.
 */
export const AegisEventType = {
  // ─── OAuth lifecycle ───────────────────────────────────────────────────
  ACCOUNT_CONNECTED: "ACCOUNT_CONNECTED",
  ACCOUNT_DISCONNECTED: "ACCOUNT_DISCONNECTED",
  ACCOUNT_REAUTH_REQUIRED: "ACCOUNT_REAUTH_REQUIRED",

  // ─── Live broadcasts ───────────────────────────────────────────────────
  LIVE_STARTED: "LIVE_STARTED",
  LIVE_ENDED: "LIVE_ENDED",

  // ─── Chat telemetry ────────────────────────────────────────────────────
  CHAT_MESSAGE: "CHAT_MESSAGE",
  CHAT_EDITED: "CHAT_EDITED",
  CHAT_DELETED: "CHAT_DELETED",
  CHAT_TIMEOUT: "CHAT_TIMEOUT",
  CHAT_BAN: "CHAT_BAN",
  CHAT_WARNING: "CHAT_WARNING",
  CHAT_RAID: "CHAT_RAID",
  CHAT_SPAM: "CHAT_SPAM",
  CHAT_SCAM: "CHAT_SCAM",
  CHAT_TOXIC: "CHAT_TOXIC",

  // ─── Content management ────────────────────────────────────────────────
  VIDEO_UPLOADED: "VIDEO_UPLOADED",
  VIDEO_UPDATED: "VIDEO_UPDATED",
  COMMENT_CREATED: "COMMENT_CREATED",
  COMMENT_UPDATED: "COMMENT_UPDATED",
  COMMENT_DELETED: "COMMENT_DELETED",
  CONTENT_FLAGGED: "CONTENT_FLAGGED",

  // ─── Community & mentions ──────────────────────────────────────────────
  FOLLOWER_GAINED: "FOLLOWER_GAINED",
  FOLLOWER_LOST: "FOLLOWER_LOST",
  MENTION_CREATED: "MENTION_CREATED",
  REPORT_RECEIVED: "REPORT_RECEIVED",
  MODERATION_ACTION: "MODERATION_ACTION",
} as const;

export type AegisEventTypeValue = (typeof AegisEventType)[keyof typeof AegisEventType];

/** Normalized event shape emitted by every provider. */
export interface NormalizedEvent {
  /** Maps to AegisEventType constant. */
  eventType: AegisEventTypeValue;
  /** Provider-assigned unique identifier for deduplication. */
  externalId: string;
  /** Platform-agnostic metadata. Raw provider fields should NOT appear here. */
  payload: Record<string, unknown>;
}
