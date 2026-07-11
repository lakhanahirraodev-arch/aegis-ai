export interface ConfidenceMetrics {
  ruleScore: number;
  aiScore: number;
  ruleConfidence: number;
  aiConfidence: number;
  historicalInfractionsCount: number;
  communityReputationScore: number;
  previousIncidentsCount: number;
  platformTrust: number; // 0 to 1
  providerConfidence: number; // 0 to 1
  classifierAgreement: number; // 0 to 1
}

/**
 * ConfidenceEngine combines multiple signals to compute a robust consensus confidence score.
 */
export class ConfidenceEngine {
  /**
   * Computes an overall confidence score from 0.00 to 100.00.
   */
  public static calculate(metrics: ConfidenceMetrics): number {
    // 1. Base weights
    const wRule = 0.2;
    const wAI = 0.35;
    const wAgreement = 0.15;
    const wPlatform = 0.1;
    const wProvider = 0.1;
    const wReputation = 0.1;

    // 2. Score calculations
    const ruleWeighted = metrics.ruleScore * metrics.ruleConfidence * wRule;
    const aiWeighted = metrics.aiScore * metrics.aiConfidence * wAI;
    const agreementWeighted = metrics.classifierAgreement * wAgreement;
    const platformWeighted = metrics.platformTrust * wPlatform;
    const providerWeighted = metrics.providerConfidence * wProvider;
    const reputationWeighted = (metrics.communityReputationScore / 100) * wReputation;

    let baseConfidence =
      (ruleWeighted +
        aiWeighted +
        agreementWeighted +
        platformWeighted +
        providerWeighted +
        reputationWeighted) *
      100;

    // 3. Heuristic adjustments
    // If the user has a long history of infractions, raise the urgency adjustment
    if (metrics.historicalInfractionsCount > 2) {
      baseConfidence += 5;
    }

    // If there is active critical incidents going on, adjust confidence bounds
    if (metrics.previousIncidentsCount > 0) {
      baseConfidence += 3;
    }

    // Ensure bounded within 0 - 100
    return Math.max(0, Math.min(100, parseFloat(baseConfidence.toFixed(2))));
  }
}
