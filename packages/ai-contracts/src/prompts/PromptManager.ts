import { RichContext } from "../context/ContextBuilder";

/**
 * PromptManager manages prompt templates, template versioning, localization keys,
 * and interpolates dynamic context values.
 */
export class PromptManager {
  private templates: Record<string, { version: string; template: string }> = {
    moderation_text: {
      version: "1.2.0",
      template: `You are an AI Trust & Safety moderator.
Analyze the following text: "{{TEXT}}"

Context metadata:
- Channel: {{CHANNEL}} on {{PLATFORM}}
- User Infraction History: {{INFRACTIONS}} warnings
- Language: {{LANGUAGE}}

Determine if the content violates community policies. Return appropriate tags and score ratings.`,
    },
  };

  /**
   * Loads and builds the prompt by replacing bracket placeholders with context values.
   */
  public compile(
    templateKey: string,
    text: string,
    context: RichContext,
  ): { prompt: string; version: string } {
    const templateObj = this.templates[templateKey];
    if (!templateObj) {
      throw new Error(`Prompt template ${templateKey} is not registered.`);
    }

    let prompt = templateObj.template;
    prompt = prompt.replace("{{TEXT}}", text);
    prompt = prompt.replace("{{CHANNEL}}", context.channelName);
    prompt = prompt.replace("{{PLATFORM}}", context.platform);
    prompt = prompt.replace("{{INFRACTIONS}}", context.historicalInfractionsCount.toString());
    prompt = prompt.replace("{{LANGUAGE}}", context.language);

    return {
      prompt,
      version: templateObj.version,
    };
  }

  public register(key: string, version: string, template: string): void {
    this.templates[key] = { version, template };
  }
}

export const promptManager = new PromptManager();
