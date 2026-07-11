import {
  LiveModerationCategory,
  LiveModerationActionType,
  DetectionSeverity,
} from "@aegis/database";

export interface ModerationFinding {
  category: LiveModerationCategory;
  severity: DetectionSeverity;
  confidence: number;
  rationale: string;
}

export interface ModerationResult {
  riskScore: number;
  findings: ModerationFinding[];
  recommendedAction: LiveModerationActionType;
  reason: string;
}

/**
 * Platform-independent, abstract Moderation Pipeline.
 *
 * Runs raw text through specific detection heuristics:
 *  - Spam Detection
 *  - Profanity Detection
 *  - Toxicity Detection
 *  - Scam Detection
 *  - Threat Detection
 *
 * Returns overall risk score, categorical findings, and recommended action.
 */
export class ModerationPipeline {
  // Simple heuristic checks for mock AI analysis
  private checkSpam(text: string): ModerationFinding | null {
    const cleanText = text.toLowerCase();

    // Check for repetitive characters (e.g. AAAAAAAA) or spam keywords
    const repeats = /(.)\1{4,}/.test(cleanText);
    const spamKeywords = [
      "free cash",
      "earn money",
      "visit website",
      "check out my channel",
      "follow back",
    ];
    const matchesSpam = spamKeywords.some((keyword) => cleanText.includes(keyword));

    if (repeats || matchesSpam) {
      return {
        category: LiveModerationCategory.SPAM,
        severity: repeats ? DetectionSeverity.LOW : DetectionSeverity.MEDIUM,
        confidence: 0.9,
        rationale: repeats
          ? "Excessive repeating characters indicative of chat flood spam."
          : "Matches known advertising and promotion spam patterns.",
      };
    }
    return null;
  }

  private checkProfanity(text: string): ModerationFinding | null {
    const cleanText = text.toLowerCase();
    const profanities = ["fuck", "shit", "bitch", "asshole", "crap", "bastard", "dick"];
    const matched = profanities.filter((word) => cleanText.includes(word));

    if (matched.length > 0) {
      return {
        category: LiveModerationCategory.OTHER, // Profanity mapped to OTHER keyword trigger
        severity: matched.length > 2 ? DetectionSeverity.HIGH : DetectionSeverity.MEDIUM,
        confidence: 0.98,
        rationale: `Detected profane terms: ${matched.join(", ")}.`,
      };
    }
    return null;
  }

  private checkToxicity(text: string): ModerationFinding | null {
    const cleanText = text.toLowerCase();
    const toxicPhrases = [
      "you suck",
      "idiot",
      "loser",
      "hate you",
      "die",
      "kill yourself",
      "retard",
      "moron",
    ];
    const matched = toxicPhrases.filter((phrase) => cleanText.includes(phrase));

    if (matched.length > 0) {
      const isExtreme = cleanText.includes("kill yourself") || cleanText.includes("retard");
      return {
        category: isExtreme ? LiveModerationCategory.HATE_SPEECH : LiveModerationCategory.TOXICITY,
        severity: isExtreme ? DetectionSeverity.CRITICAL : DetectionSeverity.HIGH,
        confidence: 0.95,
        rationale: `Violates community standards. Detected harassment: ${matched.join(", ")}.`,
      };
    }
    return null;
  }

  private checkScam(text: string): ModerationFinding | null {
    const cleanText = text.toLowerCase();

    // Check for links/scams (bit.ly, t.co, crypto gifts, free coins)
    const hasLink =
      /https?:\/\/[^\s]+/.test(cleanText) ||
      /www\.[^\s]+/.test(cleanText) ||
      /\.com\b/.test(cleanText);
    const scamPhrases = [
      "free crypto",
      "airdrop",
      "double your money",
      "claim prize",
      "gift card",
      "clck.ru",
    ];
    const matchedScam = scamPhrases.some((phrase) => cleanText.includes(phrase));

    if (hasLink && matchedScam) {
      return {
        category: LiveModerationCategory.SCAM_LINK,
        severity: DetectionSeverity.HIGH,
        confidence: 0.96,
        rationale:
          "Ingested link matching high-probability financial cryptocurrency phishing scam template.",
      };
    } else if (hasLink) {
      return {
        category: LiveModerationCategory.SCAM_LINK,
        severity: DetectionSeverity.LOW,
        confidence: 0.8,
        rationale: "Unverified external link published in broadcast chat.",
      };
    }
    return null;
  }

  private checkThreat(text: string): ModerationFinding | null {
    const cleanText = text.toLowerCase();

    // Check for extreme threats (bomb, shoot, murder, weapon, kill)
    const violentPhrases = [
      "bomb the",
      "shoot you",
      "murder",
      "kill everyone",
      "weapon",
      "commit suicide",
    ];
    const matchedThreat = violentPhrases.filter((phrase) => cleanText.includes(phrase));

    if (matchedThreat.length > 0) {
      return {
        category: LiveModerationCategory.THREAT,
        severity: DetectionSeverity.CRITICAL,
        confidence: 0.99,
        rationale: `Severe violence or self-harm threat detected: ${matchedThreat.join(", ")}.`,
      };
    }
    return null;
  }

  /**
   * Run the moderation pipeline checks.
   */
  public analyze(text: string): ModerationResult {
    const findings: ModerationFinding[] = [];

    const threat = this.checkThreat(text);
    if (threat) findings.push(threat);

    const scam = this.checkScam(text);
    if (scam) findings.push(scam);

    const toxicity = this.checkToxicity(text);
    if (toxicity) findings.push(toxicity);

    const profanity = this.checkProfanity(text);
    if (profanity) findings.push(profanity);

    const spam = this.checkSpam(text);
    if (spam) findings.push(spam);

    // 1. Calculate overall risk score (max score is bounded at 100)
    let riskScore = 0;
    if (findings.length > 0) {
      // Base risk on the highest severity finding
      const severities = findings.map((f) => f.severity);
      if (severities.includes(DetectionSeverity.CRITICAL)) {
        riskScore = 95 + Math.random() * 4; // 95 - 99
      } else if (severities.includes(DetectionSeverity.HIGH)) {
        riskScore = 75 + Math.random() * 15; // 75 - 90
      } else if (severities.includes(DetectionSeverity.MEDIUM)) {
        riskScore = 45 + Math.random() * 25; // 45 - 70
      } else {
        riskScore = 15 + Math.random() * 25; // 15 - 40
      }
    } else {
      // Baseline noise (0 - 8)
      riskScore = Math.random() * 8;
    }

    riskScore = Math.min(100, Math.max(0, parseFloat(riskScore.toFixed(2))));

    // 2. Recommendation engine
    let recommendedAction: LiveModerationActionType = LiveModerationActionType.WARN;
    let reason = "Message contains standard content.";

    if (riskScore >= 90) {
      recommendedAction = LiveModerationActionType.BAN;
      reason = "Severe policy infraction. Critical safety threat identified.";
    } else if (riskScore >= 75) {
      recommendedAction = LiveModerationActionType.TIMEOUT;
      reason = "Toxicity or scam link detected. Violation threshold reached.";
    } else if (riskScore >= 45) {
      recommendedAction = LiveModerationActionType.DELETE_MESSAGE;
      reason = "Profanity or harassment detected. Message flagged for removal.";
    } else if (riskScore >= 20) {
      recommendedAction = LiveModerationActionType.WARN;
      reason = "Spam or minor keyword matches. Inform author of rules.";
    } else {
      recommendedAction = LiveModerationActionType.NOTIFY_MODERATOR; // Treated as approved/safe but monitored
      reason = "Message verified clear of core policy violations.";
    }

    return {
      riskScore,
      findings,
      recommendedAction,
      reason,
    };
  }
}

export const moderationPipeline = new ModerationPipeline();
