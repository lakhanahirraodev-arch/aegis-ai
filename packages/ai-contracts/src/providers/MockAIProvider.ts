import { AIProvider, AIProviderAnalysis } from "./AIProvider";

/**
 * High-fidelity offline MockAIProvider for local development and testing.
 * Runs regex pattern checks against key phrases to provide realistic categorizations.
 */
export class MockAIProvider implements AIProvider {
  public name = "MOCK";

  public async analyzeText(text: string, _options?: any): Promise<AIProviderAnalysis[]> {
    const clean = text.toLowerCase();
    const findings: AIProviderAnalysis[] = [];

    // 1. Spam check
    if (
      /(.)\1{4,}/.test(clean) ||
      clean.includes("free followers") ||
      clean.includes("visit free")
    ) {
      findings.push({
        score: 0.85,
        confidence: 0.9,
        reason: "Message matches repetitive flood or promotion templates.",
        tags: ["SPAM"],
      });
    }

    // 2. Profanity check
    const badWords = ["fuck", "shit", "bitch", "asshole", "dick"];
    const matchedBad = badWords.filter((w) => clean.includes(w));
    if (matchedBad.length > 0) {
      findings.push({
        score: 0.95,
        confidence: 0.98,
        reason: `Vulgar vocabulary match: ${matchedBad.join(", ")}.`,
        tags: ["PROFANITY"],
      });
    }

    // 3. Toxicity & Harassment
    if (clean.includes("you suck") || clean.includes("idiot") || clean.includes("loser")) {
      findings.push({
        score: 0.72,
        confidence: 0.92,
        reason: "Insulting or derogatory language targetted at chat participants.",
        tags: ["TOXICITY", "HARASSMENT"],
      });
    }

    // 4. Hate Speech
    if (clean.includes("retard") || clean.includes("kill yourself")) {
      findings.push({
        score: 0.9,
        confidence: 0.96,
        reason: "Slurs or high-severity abuse violating community guidelines.",
        tags: ["HATE_SPEECH"],
      });
    }

    // 5. Scam
    if (
      clean.includes("free crypto") ||
      clean.includes("airdrop") ||
      clean.includes("double your money")
    ) {
      findings.push({
        score: 0.94,
        confidence: 0.95,
        reason: "Inbound payload matches cryptocurrency financial phishing scam profiles.",
        tags: ["SCAM"],
      });
    }

    // 6. Threat & Violence
    if (clean.includes("bomb") || clean.includes("shoot you") || clean.includes("kill everyone")) {
      findings.push({
        score: 0.98,
        confidence: 0.99,
        reason: "Severe threat containing violent acts or self-harm warnings.",
        tags: ["VIOLENCE", "THREAT"],
      });
    }

    // 7. Self Harm
    if (clean.includes("suicide") || clean.includes("cut myself")) {
      findings.push({
        score: 0.95,
        confidence: 0.97,
        reason: "Indicators of intentional self-harm or emotional distress.",
        tags: ["SELF_HARM"],
      });
    }

    // 8. Sexual Content
    if (clean.includes("porn") || clean.includes("nsfw link") || clean.includes("sex video")) {
      findings.push({
        score: 0.88,
        confidence: 0.94,
        reason: "Explicit keywords matching adult/sexual content policy filters.",
        tags: ["SEXUAL_CONTENT"],
      });
    }

    // 9. Misinformation
    if (clean.includes("covid is fake") || clean.includes("flat earth conspiracy")) {
      findings.push({
        score: 0.75,
        confidence: 0.82,
        reason: "Matches verified health or science denial profiles.",
        tags: ["MISINFORMATION"],
      });
    }

    // 10. Copyright Abuse
    if (clean.includes("download full movie") || clean.includes("leak track mp3")) {
      findings.push({
        score: 0.8,
        confidence: 0.88,
        reason: "Unlicensed distribution or file share links detected.",
        tags: ["COPYRIGHT_ABUSE"],
      });
    }

    // 11. Impersonation & Deepfake
    if (clean.includes("i am the stream admin") || clean.includes("cloned voice check")) {
      findings.push({
        score: 0.65,
        confidence: 0.8,
        reason: "Attempts to mimic system identities or use deepfaked audio structures.",
        tags: ["IMPERSONATION", "DEEPFAKE_PLACEHOLDER"],
      });
    }

    // 12. Reputation Abuse & Coordinated Attacks
    if (clean.includes("raid now") || clean.includes("report this stream coordinator")) {
      findings.push({
        score: 0.82,
        confidence: 0.89,
        reason: "Coordinated bot swarm or raid commands matched.",
        tags: ["REPUTATION_ABUSE", "COORDINATED_ATTACK", "RAID_DETECTION"],
      });
    }

    return findings;
  }

  public async analyzeImage(imageUrl: string, _options?: any): Promise<AIProviderAnalysis[]> {
    return [
      {
        score: imageUrl.includes("unsafe") ? 0.85 : 0.05,
        confidence: 0.9,
        reason: "Mock visual analysis completed.",
        tags: imageUrl.includes("unsafe") ? ["SEXUAL_CONTENT"] : [],
      },
    ];
  }

  public async analyzeVideo(videoUrl: string, _options?: any): Promise<AIProviderAnalysis[]> {
    return [
      {
        score: videoUrl.includes("copyrighted") ? 0.9 : 0.02,
        confidence: 0.92,
        reason: "Mock video frame sequence analysis finalized.",
        tags: videoUrl.includes("copyrighted") ? ["COPYRIGHT_ABUSE"] : [],
      },
    ];
  }

  public async analyzeAudio(audioUrl: string, _options?: any): Promise<AIProviderAnalysis[]> {
    return [
      {
        score: audioUrl.includes("fake") ? 0.88 : 0.01,
        confidence: 0.85,
        reason: "Mock audio wave pattern comparison completed.",
        tags: audioUrl.includes("fake") ? ["DEEPFAKE_PLACEHOLDER"] : [],
      },
    ];
  }

  public async healthCheck(): Promise<{
    status: "HEALTHY" | "DEGRADED" | "ERROR";
    message?: string;
  }> {
    return { status: "HEALTHY", message: "Mock provider active and offline." };
  }
}
