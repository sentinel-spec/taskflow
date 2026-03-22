import { BadGatewayException, Injectable, Logger } from '@nestjs/common';
import axios, { AxiosError } from 'axios';

type OpenRouterGenerateParams = {
  apiKey: string;
  baseUrl: string;
  model: string;
  prompt: string;
  systemPrompt?: string;
};

type OpenRouterContentPart = {
  type?: string;
  text?: string;
};

type OpenRouterChatResponse = {
  choices?: Array<{
    message?: {
      content?: string | OpenRouterContentPart[];
    };
  }>;
};

@Injectable()
export class OpenRouterProvider {
  private readonly logger = new Logger(OpenRouterProvider.name);
  private static readonly FALLBACK_MODEL = 'openrouter/auto';
  private static readonly REQUEST_TIMEOUT_MS = 10000;

  private extractText(content: unknown): string | null {
    if (typeof content === 'string') {
      return content;
    }

    if (Array.isArray(content)) {
      const text = content
        .map((item) => {
          if (
            item &&
            typeof item === 'object' &&
            'type' in item &&
            'text' in item &&
            (item as { type: unknown }).type === 'text' &&
            typeof (item as { text: unknown }).text === 'string'
          ) {
            return (item as { text: string }).text;
          }
          return '';
        })
        .join('')
        .trim();

      return text || null;
    }

    return null;
  }

  private isRetryableError(error: unknown): boolean {
    if (!axios.isAxiosError(error)) {
      return false;
    }

    const status = error.response?.status;
    if (!status) {
      return true;
    }

    return status === 429 || status >= 500;
  }

  private buildModelCandidates(model: string): string[] {
    const trimmedModel = model.trim();
    if (!trimmedModel) {
      return [OpenRouterProvider.FALLBACK_MODEL];
    }

    if (trimmedModel === OpenRouterProvider.FALLBACK_MODEL) {
      return [trimmedModel];
    }

    // OpenRouter model ids are typically namespaced (provider/model).
    // If a short non-namespaced model is provided, prefer safe auto-routing first.
    if (!trimmedModel.includes('/')) {
      return [OpenRouterProvider.FALLBACK_MODEL, trimmedModel];
    }

    return [trimmedModel, OpenRouterProvider.FALLBACK_MODEL];
  }

  async generateText({
    apiKey,
    baseUrl,
    model,
    prompt,
    systemPrompt,
  }: OpenRouterGenerateParams): Promise<string> {
    const startedAt = Date.now();
    const endpoint = `${baseUrl.replace(/\/$/, '')}/chat/completions`;
    const modelCandidates = this.buildModelCandidates(model);
    const messages = [
      ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
      { role: 'user', content: prompt },
    ];

    const maxAttempts = 1;
    let lastError: unknown;

    for (const candidateModel of modelCandidates) {
      for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        try {
          const response = await axios.post<OpenRouterChatResponse>(
            endpoint,
            {
              model: candidateModel,
              messages,
              temperature: 0.7,
            },
            {
              timeout: OpenRouterProvider.REQUEST_TIMEOUT_MS,
              headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
              },
            },
          );

          const content = response.data.choices?.[0]?.message?.content;
          const text = this.extractText(content);

          if (!text) {
            throw new BadGatewayException(
              'OpenRouter returned an empty generation result',
            );
          }

          this.logger.debug(
            `OpenRouter generation succeeded in ${Date.now() - startedAt}ms using model=${candidateModel}`,
          );

          return text.trim();
        } catch (error) {
          lastError = error;

          if (attempt < maxAttempts && this.isRetryableError(error)) {
            await new Promise((resolve) => setTimeout(resolve, 350));
            continue;
          }

          if (axios.isAxiosError(error)) {
            const status = error.response?.status;
            const details =
              error.response?.data &&
              typeof error.response.data === 'object' &&
              'error' in error.response.data
                ? (error.response.data as { error?: { message?: string } }).error
                    ?.message
                : error.message;
            this.logger.warn(
              `OpenRouter request failed: model=${candidateModel} status=${status ?? 'network'} attempt=${attempt} latency=${Date.now() - startedAt}ms details=${details ?? 'n/a'}`,
            );
          }

          break;
        }
      }
    }

    if (axios.isAxiosError(lastError)) {
      const err = lastError as AxiosError<{ error?: { message?: string } }>;
      const status = err.response?.status;
      const details = err.response?.data?.error?.message || err.message;
      throw new BadGatewayException(
        `OpenRouter request failed${status ? ` (${status})` : ''}: ${details}`,
      );
    }

    throw new BadGatewayException(
      'OpenRouter request failed due to an unexpected error',
    );
  }
}
