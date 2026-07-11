import { prisma } from "@aegis/database";

export interface UsageRecord {
  workspaceId: string;
  provider: string;
  model: string;
  requestId: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  status: string;
}

/**
 * UsageTracker calculates API costs and logs tokens, latency, and status in the DB.
 */
export class UsageTracker {
  // Estimated costs per 1K tokens
  private static PRICE_PER_1K: Record<string, { input: number; output: number }> = {
    OPENAI: { input: 0.0015, output: 0.002 },
    GEMINI: { input: 0.0005, output: 0.0015 },
    CLAUDE: { input: 0.003, output: 0.015 },
    MOCK: { input: 0.0, output: 0.0 },
  };

  /**
   * Log the transaction to PG using Prisma.
   */
  public static async log(record: UsageRecord): Promise<void> {
    const prov = record.provider.toUpperCase();
    const pricing = this.PRICE_PER_1K[prov] ?? { input: 0.0, output: 0.0 };

    const estCost =
      (record.inputTokens / 1000) * pricing.input + (record.outputTokens / 1000) * pricing.output;

    try {
      await prisma.aIUsageLog.create({
        data: {
          workspaceId: record.workspaceId,
          provider: record.provider,
          model: record.model,
          requestId: record.requestId,
          inputTokens: record.inputTokens,
          outputTokens: record.outputTokens,
          estimatedCost: estCost,
          latencyMs: record.latencyMs,
          status: record.status,
        },
      });
    } catch (err: any) {
      console.error(`UsageTracker failed to persist usage log: ${err.message}`);
    }
  }
}
