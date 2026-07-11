import { AIProvider } from "./AIProvider";
import { MockAIProvider } from "./MockAIProvider";
import { OpenAIProvider } from "./OpenAIProvider";
import { GeminiProvider } from "./GeminiProvider";
import { ClaudeProvider } from "./ClaudeProvider";

/**
 * ProviderRegistry manages and instantiates available AI Provider adapters.
 */
export class ProviderRegistry {
  private registry = new Map<string, AIProvider>();

  constructor() {
    this.register(new MockAIProvider());
    this.register(new OpenAIProvider());
    this.register(new GeminiProvider());
    this.register(new ClaudeProvider());
  }

  public register(provider: AIProvider): void {
    this.registry.set(provider.name.toUpperCase(), provider);
  }

  public has(name: string): boolean {
    return this.registry.has(name.toUpperCase());
  }

  public get(name: string): AIProvider {
    const provider = this.registry.get(name.toUpperCase());
    if (!provider) {
      throw new Error(`AI Provider ${name} is not registered in the system.`);
    }
    return provider;
  }

  public providers(): string[] {
    return Array.from(this.registry.keys());
  }
}

export const providerRegistry = new ProviderRegistry();
