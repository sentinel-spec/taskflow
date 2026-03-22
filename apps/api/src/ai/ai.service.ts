import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { SystemSettingsService } from '@/system-settings/system-settings.service';
import { OpenRouterProvider } from './openrouter.provider';

type GenerateTextInput = {
  prompt: string;
  systemPrompt?: string;
};

@Injectable()
export class AiService {
  private static readonly MAX_PROMPT_LENGTH = 2000;
  private readonly logger = new Logger(AiService.name);

  constructor(
    private readonly systemSettingsService: SystemSettingsService,
    private readonly openRouterProvider: OpenRouterProvider,
  ) {}

  private buildFallbackText(prompt: string): string {
    const summary = prompt.length > 280 ? `${prompt.slice(0, 280)}...` : prompt;

    return [
      'Project description draft',
      '',
      `Summary: ${summary}`,
      '',
      'Scope:',
      '- Clarify the core user problem',
      '- Define MVP goals and priorities',
      '- Align implementation milestones and ownership',
    ].join('\n');
  }

  async generateText(input: GenerateTextInput): Promise<string> {
    const { prompt, systemPrompt } = input;
    const trimmedPrompt = prompt.trim();

    if (!trimmedPrompt) {
      throw new BadRequestException('Prompt must not be empty');
    }

    if (trimmedPrompt.length > AiService.MAX_PROMPT_LENGTH) {
      throw new BadRequestException(
        `Prompt is too long. Max length is ${AiService.MAX_PROMPT_LENGTH} characters`,
      );
    }

    const startedAt = Date.now();
    const settings = await this.systemSettingsService.getAiRuntimeSettings();

    if (!settings.enabled) {
      this.logger.warn(
        `AI disabled in system settings, fallback used (latency=${Date.now() - startedAt}ms)`,
      );
      return this.buildFallbackText(trimmedPrompt);
    }

    if (!settings.apiKey) {
      this.logger.warn(
        `AI API key missing, fallback used (latency=${Date.now() - startedAt}ms)`,
      );
      return this.buildFallbackText(trimmedPrompt);
    }

    try {
      const generatedText = await this.openRouterProvider.generateText({
        apiKey: settings.apiKey,
        baseUrl: settings.baseUrl,
        model: settings.model,
        prompt: trimmedPrompt,
        systemPrompt,
      });

      this.logger.debug(
        `AI text generated in ${Date.now() - startedAt}ms using model ${settings.model}`,
      );

      return generatedText;
    } catch {
      this.logger.error(
        `AI provider failed, fallback used (latency=${Date.now() - startedAt}ms)`,
      );
      return this.buildFallbackText(trimmedPrompt);
    }
  }
}
