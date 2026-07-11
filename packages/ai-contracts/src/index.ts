import { z } from "zod";

export const agentRunInputSchema = z.object({
  runId: z.string().uuid(),
  workspaceId: z.string().uuid(),
  caseId: z.string().uuid().optional(),
  sourceItemIds: z.array(z.string().uuid()),
  evidenceIds: z.array(z.string().uuid()),
  policyVersion: z.string(),
  traceId: z.string(),
});

export type AgentRunInput = z.infer<typeof agentRunInputSchema>;

export const agentFindingSchema = z.object({
  findingType: z.string(),
  verdict: z.enum(["POSITIVE", "NEGATIVE", "INCONCLUSIVE"]),
  confidence: z.number().min(0).max(1),
  evidenceIds: z.array(z.string().uuid()),
  rationale: z.string(),
  limitations: z.array(z.string()),
  model: z.object({
    provider: z.string(),
    name: z.string(),
    version: z.string(),
  }),
});

export type AgentFinding = z.infer<typeof agentFindingSchema>;

// AI Providers, Context, Prompts, Managers & Usage Telemetry
export * from "./providers/AIProvider";
export * from "./providers/MockAIProvider";
export * from "./providers/OpenAIProvider";
export * from "./providers/GeminiProvider";
export * from "./providers/ClaudeProvider";
export * from "./providers/ProviderRegistry";
export * from "./context/ContextBuilder";
export * from "./prompts/PromptManager";
export * from "./manager/AIProviderManager";
export * from "./telemetry/UsageTracker";
