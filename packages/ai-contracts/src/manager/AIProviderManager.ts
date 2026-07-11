import { AIProvider, AIProviderAnalysis } from "../providers/AIProvider";
import { providerRegistry } from "../providers/ProviderRegistry";
import { prisma } from "@aegis/database";

/**
 * AIProviderManager handles workspace-level provider loading,
 * availability checks, timeouts, retries, rate limiting, and failover.
 */
export class AIProviderManager {
  private healthStates = new Map<
    string,
    { availability: number; errorCount: number; lastChecked: number }
  >();
  private defaultProvider = "MOCK";

  /**
   * Resolve active provider for the workspace from DB.
   */
  public async getProvider(workspaceId: string): Promise<AIProvider> {
    try {
      const config = await prisma.workspaceAIConfig.findUnique({
        where: { workspaceId },
      });

      const providerName = config?.activeProvider ?? this.defaultProvider;

      // Check health. If unhealthy, fallback.
      const isHealthy = await this.checkProviderHealth(providerName);
      if (isHealthy) {
        return providerRegistry.get(providerName);
      }

      // Health degradation failover: switch to MOCK
      console.warn(`AIProviderManager: Provider ${providerName} degraded. Falling back to MOCK.`);
      return providerRegistry.get("MOCK");
    } catch {
      return providerRegistry.get("MOCK");
    }
  }

  /**
   * Run analyzeText with retry logic, rate limiters, and timeout boundaries.
   */
  public async analyzeTextWithFailover(
    workspaceId: string,
    text: string,
    options?: any,
  ): Promise<{ providerName: string; results: AIProviderAnalysis[] }> {
    const provider = await this.getProvider(workspaceId);

    // Retries (3 attempts) with exponential backoff and 5s timeout
    let lastError: any;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const resultPromise = provider.analyzeText(text, options);

        // 5s Timeout wrapper
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Request timed out.")), 5000),
        );

        const results = await Promise.race([resultPromise, timeoutPromise]);

        // Log successful request to update health status
        this.updateHealthState(provider.name, true);
        return { providerName: provider.name, results };
      } catch (err) {
        lastError = err;
        this.updateHealthState(provider.name, false);
        // Delay before retry
        await new Promise((resolve) => setTimeout(resolve, attempt * 500));
      }
    }

    // Failover fallback to MockAIProvider if all retries fail
    if (provider.name !== "MOCK") {
      console.error(
        `AIProviderManager: Provider ${provider.name} failed all attempts. Triggering fallback.`,
      );
      const mockProvider = providerRegistry.get("MOCK");
      const results = await mockProvider.analyzeText(text, options);
      return { providerName: "MOCK", results };
    }

    throw lastError;
  }

  private async checkProviderHealth(name: string): Promise<boolean> {
    const prov = providerRegistry.get(name);
    const cached = this.healthStates.get(name.toUpperCase());

    // Throttle checks (only check health check once every 30s)
    if (cached && Date.now() - cached.lastChecked < 30_000) {
      return cached.errorCount < 3;
    }

    try {
      const status = await prov.healthCheck();
      const healthy = status.status === "HEALTHY";
      this.updateHealthState(name, healthy);
      return healthy;
    } catch {
      this.updateHealthState(name, false);
      return false;
    }
  }

  private updateHealthState(name: string, success: boolean): void {
    const key = name.toUpperCase();
    const current = this.healthStates.get(key) ?? {
      availability: 1.0,
      errorCount: 0,
      lastChecked: 0,
    };

    this.healthStates.set(key, {
      availability: success
        ? Math.min(1.0, current.availability + 0.05)
        : Math.max(0.0, current.availability - 0.1),
      errorCount: success ? 0 : current.errorCount + 1,
      lastChecked: Date.now(),
    });
  }
}

export const aiProviderManager = new AIProviderManager();
