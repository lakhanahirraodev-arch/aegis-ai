import {
  aiProviderManager,
  ContextBuilder,
  promptManager,
  UsageTracker,
} from "@aegis/ai-contracts";
import { ConfidenceEngine } from "./confidenceEngine";
import { PolicyEngine, DEFAULT_POLICY } from "./policyEngine";
import { RecommendationEngine, AIRecommendationAction } from "./recommendationEngine";
import {
  LiveModerationCategory,
  LiveModerationActionType,
  DetectionSeverity,
} from "@aegis/database";
import crypto from "crypto";

export interface IntelligenceAnalysisResult {
  riskScore: number;
  confidence: number;
  recommendedAction: AIRecommendationAction;
  dbAction: LiveModerationActionType;
  explanation: string;
  findings: Array<{
    category: LiveModerationCategory;
    severity: DetectionSeverity;
    confidence: number;
    rationale: string;
  }>;
  aiProviderName: string;
}

/**
 * AI Intelligence Engine — Orchestrator for rule matches, AI multi-model queries,
 * confidence consolidation, policy checking, and explainable recommendations.
 */
export class IntelligenceEngine {
  /**
   * Evaluates text through the full Trust & Safety engine stack.
   */
  public static async analyze(
    workspaceId: string,
    text: string,
    platform: string,
    channelName: string,
    userHistoryOverrides?: { historicalInfractionsCount: number; previousIncidentsCount: number },
  ): Promise<IntelligenceAnalysisResult> {
    const startTime = Date.now();
    const requestId = crypto.randomUUID();

    // 1. Context Builder & Prompt compilation
    const context = ContextBuilder.build(workspaceId, platform, channelName, {
      historicalInfractionsCount: userHistoryOverrides?.historicalInfractionsCount ?? 0,
      previousIncidentsCount: userHistoryOverrides?.previousIncidentsCount ?? 0,
    });

    const { prompt, version } = promptManager.compile("moderation_text", text, context);

    // 2. Rule Engine (Pre-checks)
    let ruleScore = 0;
    let ruleConfidence = 0.5;
    const clean = text.toLowerCase();

    // Quick rule matches
    if (clean.includes("bomb") || clean.includes("kill yourself")) {
      ruleScore = 0.95;
      ruleConfidence = 0.99;
    } else if (clean.includes("shit") || clean.includes("fuck")) {
      ruleScore = 0.6;
      ruleConfidence = 0.95;
    }

    // 3. AI Provider Manager selection and text execution (with failover/retry limits)
    let aiProviderName = "MOCK";
    let aiFindings: any[] = [];
    try {
      const { providerName, results } = await aiProviderManager.analyzeTextWithFailover(
        workspaceId,
        prompt,
      );
      aiProviderName = providerName;
      aiFindings = results;
    } catch (err) {
      console.error(
        `IntelligenceEngine: All AI Providers failed. Falling back to MOCK heuristics.`,
      );
      aiFindings = [
        {
          score: ruleScore,
          confidence: 0.8,
          reason: "Fallback heuristic match completed.",
          tags: ["TOXICITY"],
        },
      ];
    }

    // 4. Token & Telemetry Usage Tracking
    const latency = Date.now() - startTime;
    await UsageTracker.log({
      workspaceId,
      provider: aiProviderName,
      model: aiProviderName === "MOCK" ? "local-heuristic" : "gpt-4o-placeholder",
      requestId,
      inputTokens: Math.ceil(prompt.length / 4),
      outputTokens: 25,
      latencyMs: latency,
      status: "SUCCESS",
    });

    // 5. Confidence Engine Consolidation
    const maxAiScore = aiFindings.reduce((max, f) => Math.max(max, f.score), 0);
    const avgAiConf =
      aiFindings.length > 0
        ? aiFindings.reduce((sum, f) => sum + f.confidence, 0) / aiFindings.length
        : 0.5;

    const agreement = aiFindings.length > 1 ? 0.9 : 0.6;

    const confidence = ConfidenceEngine.calculate({
      ruleScore,
      aiScore: maxAiScore,
      ruleConfidence,
      aiConfidence: avgAiConf,
      historicalInfractionsCount: context.historicalInfractionsCount,
      communityReputationScore: context.communityReputationScore,
      previousIncidentsCount: context.previousIncidentsCount,
      platformTrust: platform.toUpperCase() === "TWITCH" ? 0.9 : 0.85,
      providerConfidence: aiProviderName === "MOCK" ? 0.8 : 0.95,
      classifierAgreement: agreement,
    });

    // Final consolidated risk score
    const finalRiskScore = Math.min(
      100,
      Math.max(0, parseFloat((Math.max(ruleScore, maxAiScore) * 100).toFixed(2))),
    );

    // 6. Policy Engine Evaluation
    const policyFlags = PolicyEngine.evaluate(finalRiskScore, platform, DEFAULT_POLICY);

    // 7. Recommendation Engine mapping
    const recommendation = RecommendationEngine.recommend(finalRiskScore, policyFlags);

    // 8. Structured findings return mapping to database categories
    const mappedFindings = aiFindings.flatMap((f) =>
      f.tags.map((tag: string) => {
        let category: LiveModerationCategory = LiveModerationCategory.OTHER;
        if (tag === "SPAM") category = LiveModerationCategory.SPAM;
        else if (tag === "PROFANITY") category = LiveModerationCategory.OTHER;
        else if (tag === "TOXICITY") category = LiveModerationCategory.TOXICITY;
        else if (tag === "HATE_SPEECH") category = LiveModerationCategory.HATE_SPEECH;
        else if (tag === "SCAM") category = LiveModerationCategory.SCAM_LINK;
        else if (tag === "VIOLENCE" || tag === "THREAT") category = LiveModerationCategory.THREAT;
        else if (tag === "SELF_HARM") category = LiveModerationCategory.SELF_HARM;
        else if (tag === "SEXUAL_CONTENT") category = LiveModerationCategory.NSFW;
        else if (tag === "MISINFORMATION") category = LiveModerationCategory.OTHER;
        else if (tag === "COPYRIGHT_ABUSE") category = LiveModerationCategory.OTHER;
        else if (tag === "IMPERSONATION") category = LiveModerationCategory.OTHER;
        else if (tag === "REPUTATION_ABUSE") category = LiveModerationCategory.OTHER;

        let severity: DetectionSeverity = DetectionSeverity.LOW;
        if (f.score >= 0.9) severity = DetectionSeverity.CRITICAL;
        else if (f.score >= 0.75) severity = DetectionSeverity.HIGH;
        else if (f.score >= 0.45) severity = DetectionSeverity.MEDIUM;

        return {
          category,
          severity,
          confidence: f.confidence,
          rationale: f.reason,
        };
      }),
    );

    return {
      riskScore: finalRiskScore,
      confidence,
      recommendedAction: recommendation.action,
      dbAction: recommendation.dbAction,
      explanation: recommendation.explanation,
      findings: mappedFindings,
      aiProviderName,
    };
  }
}
