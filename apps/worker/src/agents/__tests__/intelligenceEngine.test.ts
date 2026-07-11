import { describe, it, expect, vi } from "vitest";
import { ConfidenceEngine } from "../confidenceEngine";
import { PolicyEngine } from "../policyEngine";
import { RecommendationEngine } from "../recommendationEngine";
import { IntelligenceEngine } from "../intelligenceEngine";
import { aiProviderManager, ContextBuilder, promptManager } from "@aegis/ai-contracts";

vi.mock("@aegis/database", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@aegis/database")>();
  return {
    ...actual,
    prisma: {
      workspaceAIConfig: {
        findUnique: async () => null,
      },
      aIUsageLog: {
        create: async () => ({}),
      },
    },
  };
});

describe("Sprint 6 AI Intelligence Engine Tests", () => {
  describe("ConfidenceEngine", () => {
    it("should compute overall confidence bounded to 0-100", () => {
      const confidence = ConfidenceEngine.calculate({
        ruleScore: 0.9,
        aiScore: 0.8,
        ruleConfidence: 0.9,
        aiConfidence: 0.85,
        historicalInfractionsCount: 0,
        communityReputationScore: 95,
        previousIncidentsCount: 0,
        platformTrust: 0.9,
        providerConfidence: 0.95,
        classifierAgreement: 0.8,
      });

      expect(confidence).toBeGreaterThan(0);
      expect(confidence).toBeLessThanOrEqual(100);
    });

    it("should raise confidence score on high historical infractions", () => {
      const baseConf = ConfidenceEngine.calculate({
        ruleScore: 0.5,
        aiScore: 0.5,
        ruleConfidence: 0.8,
        aiConfidence: 0.8,
        historicalInfractionsCount: 0,
        communityReputationScore: 100,
        previousIncidentsCount: 0,
        platformTrust: 0.8,
        providerConfidence: 0.8,
        classifierAgreement: 0.6,
      });

      const highHistoryConf = ConfidenceEngine.calculate({
        ruleScore: 0.5,
        aiScore: 0.5,
        ruleConfidence: 0.8,
        aiConfidence: 0.8,
        historicalInfractionsCount: 5,
        communityReputationScore: 100,
        previousIncidentsCount: 0,
        platformTrust: 0.8,
        providerConfidence: 0.8,
        classifierAgreement: 0.6,
      });

      expect(highHistoryConf).toBe(baseConf + 5);
    });
  });

  describe("PolicyEngine", () => {
    it("should evaluate thresholds and block autoAction during quiet hours", () => {
      const activePolicy = {
        autoBanThreshold: 90,
        humanReviewThreshold: 45,
        escalationThreshold: 75,
        providerPreference: "MOCK",
        platformRules: {
          TWITCH: { enabled: true, autoAction: true },
        },
        quietHours: { enabled: true, startHour: 0, endHour: 23 }, // Force quiet hours
        notifications: { email: true, slack: true, webhook: true },
      };

      const result = PolicyEngine.evaluate(80, "TWITCH", activePolicy);
      expect(result.autoActionAllowed).toBe(false);
      expect(result.requireReview).toBe(true);
    });

    it("should flag escalation on high scores", () => {
      const result = PolicyEngine.evaluate(95, "TWITCH");
      expect(result.shouldEscalate).toBe(true);
    });
  });

  describe("RecommendationEngine", () => {
    it("should suggest BAN for critical scores", () => {
      const rec = RecommendationEngine.recommend(92, {
        autoActionAllowed: true,
        requireReview: false,
        shouldEscalate: true,
      });
      expect(rec.action).toBe("BAN");
      expect(rec.dbAction).toBe("BAN");
    });

    it("should route to review when policy flags requireReview", () => {
      const rec = RecommendationEngine.recommend(70, {
        autoActionAllowed: false,
        requireReview: true,
        shouldEscalate: false,
      });
      expect(rec.action).toBe("HUMAN_REVIEW");
    });
  });

  describe("PromptManager", () => {
    it("should interpolate context fields correctly", () => {
      const context = ContextBuilder.build("ws-uuid", "TWITCH", "CoolStreamer", {
        historicalInfractionsCount: 2,
        language: "fr",
      });

      const text = "Bonjour a tous";
      const { prompt, version } = promptManager.compile("moderation_text", text, context);

      expect(prompt).toContain(text);
      expect(prompt).toContain("CoolStreamer");
      expect(prompt).toContain("TWITCH");
      expect(prompt).toContain("2 warnings");
      expect(prompt).toContain("fr");
      expect(version).toBe("1.2.0");
    });
  });

  describe("AIProviderManager", () => {
    it("should load provider config and fallback to MOCK on missing keys", async () => {
      const provider = await aiProviderManager.getProvider("non-existent-uuid");
      expect(provider.name).toBe("MOCK");
    });
  });

  describe("IntelligenceEngine", () => {
    it("should process safe greeting content clean of findings", async () => {
      const result = await IntelligenceEngine.analyze(
        "workspace-test-id",
        "Hello stream! Stoked to be hanging out tonight.",
        "TWITCH",
        "TestStreamer",
      );

      expect(result.riskScore).toBeLessThan(15);
      expect(result.recommendedAction).toBe("APPROVE");
      expect(result.findings).toHaveLength(0);
    });

    it("should catch violent threats and trigger violent classifier mapping", async () => {
      const result = await IntelligenceEngine.analyze(
        "workspace-test-id",
        "I am going to plant a bomb in your chat and kill everyone.",
        "TWITCH",
        "TestStreamer",
      );

      expect(result.riskScore).toBeGreaterThanOrEqual(90);
      expect(result.recommendedAction).toBe("BAN");
      const foundThreat = result.findings.some((f) => f.category === "THREAT");
      expect(foundThreat).toBe(true);
    });
  });
});
