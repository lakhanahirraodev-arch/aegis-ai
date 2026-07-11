export interface RichContext {
  workspaceId: string;
  platform: string;
  channelName: string;
  historicalInfractionsCount: number;
  previousIncidentsCount: number;
  communityReputationScore: number;
  policyConfig: Record<string, any>;
  language: string;
  metadata: Record<string, any>;
}

/**
 * ContextBuilder consolidates signals and metadata about the workspace, channel,
 * and user history to construct a rich prompt context.
 */
export class ContextBuilder {
  /**
   * Combines input parameters to return a structured context payload.
   */
  public static build(
    workspaceId: string,
    platform: string,
    channelName: string,
    overrides?: Partial<RichContext>,
  ): RichContext {
    return {
      workspaceId,
      platform,
      channelName,
      historicalInfractionsCount: overrides?.historicalInfractionsCount ?? 0,
      previousIncidentsCount: overrides?.previousIncidentsCount ?? 0,
      communityReputationScore: overrides?.communityReputationScore ?? 100,
      policyConfig: overrides?.policyConfig ?? {},
      language: overrides?.language ?? "en",
      metadata: overrides?.metadata ?? {},
    };
  }
}
