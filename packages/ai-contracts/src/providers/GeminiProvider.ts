import { AIProvider, AIProviderAnalysis } from "./AIProvider";

/**
 * Pluggable Gemini provider placeholder.
 * Resolves credential configurations from environment variables.
 */
export class GeminiProvider implements AIProvider {
  public name = "GEMINI";
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY ?? "";
  }

  public async analyzeText(text: string, _options?: any): Promise<AIProviderAnalysis[]> {
    if (!this.apiKey) {
      throw new Error("Gemini API key missing in environment settings.");
    }
    return [
      {
        score: text.toLowerCase().includes("bad") ? 0.7 : 0.05,
        confidence: 0.85,
        reason: "Gemini mock fallback analyze completed successfully.",
        tags: text.toLowerCase().includes("bad") ? ["TOXICITY"] : [],
      },
    ];
  }

  public async analyzeImage(_imageUrl: string, _options?: any): Promise<AIProviderAnalysis[]> {
    if (!this.apiKey) throw new Error("Gemini API key missing.");
    return [];
  }

  public async analyzeVideo(_videoUrl: string, _options?: any): Promise<AIProviderAnalysis[]> {
    if (!this.apiKey) throw new Error("Gemini API key missing.");
    return [];
  }

  public async analyzeAudio(_audioUrl: string, _options?: any): Promise<AIProviderAnalysis[]> {
    if (!this.apiKey) throw new Error("Gemini API key missing.");
    return [];
  }

  public async healthCheck(): Promise<{
    status: "HEALTHY" | "DEGRADED" | "ERROR";
    message?: string;
  }> {
    if (!this.apiKey) {
      return { status: "DEGRADED", message: "API key not configured." };
    }
    return { status: "HEALTHY", message: "API Key active." };
  }
}
