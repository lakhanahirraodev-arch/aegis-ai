import { LiveModerationActionType } from "@aegis/database";

// Re-map additional actions that might not exist in database enum as custom structures
export type AIRecommendationAction =
  "APPROVE" | "WARN" | "DELETE" | "TIMEOUT" | "BAN" | "SHADOW_MUTE" | "ESCALATE" | "HUMAN_REVIEW";

/**
 * RecommendationEngine maps final confidence scores and policy boundaries to standard moderation enforcements.
 */
export class RecommendationEngine {
  /**
   * Resolves the recommended action block.
   */
  public static recommend(
    score: number,
    policyFlags: { autoActionAllowed: boolean; requireReview: boolean; shouldEscalate: boolean },
  ): { action: AIRecommendationAction; dbAction: LiveModerationActionType; explanation: string } {
    if (policyFlags.shouldEscalate && score >= 90) {
      return {
        action: "BAN",
        dbAction: LiveModerationActionType.BAN,
        explanation: "Critical safety threat matched. Automatic ban sequence suggested.",
      };
    }

    if (policyFlags.shouldEscalate && score >= 75) {
      return {
        action: "TIMEOUT",
        dbAction: LiveModerationActionType.TIMEOUT,
        explanation: "High risk policy trigger matched. Timeout suggested.",
      };
    }

    if (policyFlags.requireReview) {
      return {
        action: "HUMAN_REVIEW",
        dbAction: LiveModerationActionType.NOTIFY_MODERATOR,
        explanation: "Content risk is borderline. Queue for manual moderator audit.",
      };
    }

    if (score >= 45) {
      return {
        action: "DELETE",
        dbAction: LiveModerationActionType.DELETE_MESSAGE,
        explanation: "Message contains harassment or profanity. Removal suggested.",
      };
    }

    if (score >= 20) {
      return {
        action: "WARN",
        dbAction: LiveModerationActionType.WARN,
        explanation: "Minor spam or keyword warnings matched. Warn user.",
      };
    }

    return {
      action: "APPROVE",
      dbAction: LiveModerationActionType.NOTIFY_MODERATOR, // safe list
      explanation: "No policy infractions detected.",
    };
  }
}
