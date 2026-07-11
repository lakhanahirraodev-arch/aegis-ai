export interface AIProviderAnalysis {
  score: number; // 0 to 1
  confidence: number; // 0 to 1
  reason: string;
  tags: string[];
  evidence?: Record<string, any>;
}

/**
 * Common AI provider interface for modular text, image, video, and audio evaluation.
 */
export interface AIProvider {
  name: string;
  analyzeText(text: string, options?: any): Promise<AIProviderAnalysis[]>;
  analyzeImage(imageUrl: string, options?: any): Promise<AIProviderAnalysis[]>;
  analyzeVideo(videoUrl: string, options?: any): Promise<AIProviderAnalysis[]>;
  analyzeAudio(audioUrl: string, options?: any): Promise<AIProviderAnalysis[]>;
  healthCheck(): Promise<{ status: "HEALTHY" | "DEGRADED" | "ERROR"; message?: string }>;
}
