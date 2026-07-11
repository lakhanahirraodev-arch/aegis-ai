export interface WorkspacePolicy {
  autoBanThreshold: number;
  humanReviewThreshold: number;
  escalationThreshold: number;
  providerPreference: string; // e.g. "MOCK", "OPENAI"
  platformRules: Record<string, { enabled: boolean; autoAction: boolean }>;
  quietHours: { enabled: boolean; startHour: number; endHour: number };
  notifications: { email: boolean; slack: boolean; webhook: boolean };
}

export const DEFAULT_POLICY: WorkspacePolicy = {
  autoBanThreshold: 90,
  humanReviewThreshold: 45,
  escalationThreshold: 75,
  providerPreference: "MOCK",
  platformRules: {
    TWITCH: { enabled: true, autoAction: true },
    YOUTUBE: { enabled: true, autoAction: true },
  },
  quietHours: { enabled: false, startHour: 22, endHour: 6 },
  notifications: { email: true, slack: true, webhook: true },
};

/**
 * PolicyEngine evaluates workspace-specific rules, quiet hours, and thresholds.
 */
export class PolicyEngine {
  /**
   * Determine matching threshold flags for the given workspace policy.
   */
  public static evaluate(
    score: number,
    platform: string,
    policy: WorkspacePolicy = DEFAULT_POLICY,
  ): {
    autoActionAllowed: boolean;
    requireReview: boolean;
    shouldEscalate: boolean;
  } {
    const platformRule = policy.platformRules[platform.toUpperCase()] ?? {
      enabled: true,
      autoAction: true,
    };

    // Check if auto-action is enabled globally for this platform
    const autoActionAllowed = platformRule.enabled && platformRule.autoAction;

    // Check quiet hours (if enabled, we might direct all items to review rather than auto-actioning)
    let isQuietHours = false;
    if (policy.quietHours.enabled) {
      const currentHour = new Date().getHours();
      if (policy.quietHours.startHour > policy.quietHours.endHour) {
        isQuietHours =
          currentHour >= policy.quietHours.startHour || currentHour <= policy.quietHours.endHour;
      } else {
        isQuietHours =
          currentHour >= policy.quietHours.startHour && currentHour <= policy.quietHours.endHour;
      }
    }

    const requireReview =
      score >= policy.humanReviewThreshold && (score < policy.autoBanThreshold || isQuietHours);
    const shouldEscalate = score >= policy.escalationThreshold;

    return {
      autoActionAllowed: autoActionAllowed && !isQuietHours,
      requireReview,
      shouldEscalate,
    };
  }
}
