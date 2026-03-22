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
    const cleanPrompt = prompt.trim();
    const summary =
      cleanPrompt.length > 320
        ? `${cleanPrompt.slice(0, 320)}...`
        : cleanPrompt;
    const isCyrillic = /[А-Яа-яЁё]/.test(cleanPrompt);

    if (isCyrillic) {
      return [
        `🚀 Обзор: Проект основан на идее «${summary}» и нацелен на создание удобного и полезного цифрового продукта.`,
        '🎯 Целевая аудитория: Пользователи, которым нужен простой и быстрый способ решать эту задачу в повседневном сценарии.',
        '⚙️ Ключевые функции: Базовый MVP с понятной навигацией, основными рабочими действиями и стабильной производительностью.',
        '🧩 Дополнительно: В следующих итерациях можно добавить аналитику, персонализацию и интеграции со сторонними сервисами.',
        '📈 Ожидаемый результат: Практичный и масштабируемый продукт с четкими приоритетами и измеримой ценностью для пользователей.',
      ].join('\n');
    }

    return [
      `🚀 Overview: The project is based on the idea "${summary}" and aims to deliver a practical digital product.`,
      '🎯 Target users: People who need a simple, fast way to solve this problem in a daily workflow.',
      '⚙️ Key features: MVP scope with clear navigation, essential core actions, and reliable performance.',
      '🧩 Future improvements: Add analytics, personalization, and integrations to improve retention and product quality.',
      '📈 Expected outcome: A scalable product with clear delivery priorities and measurable user value.',
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
