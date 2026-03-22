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

  async generateText({
    apiKey,
    baseUrl,
    model,
    prompt,
    systemPrompt,
  }: OpenRouterGenerateParams): Promise<string> {
    const startedAt = Date.now();
    const endpoint = `${baseUrl.replace(/\/$/, '')}/chat/completions`;
    const messages = [
      ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
      { role: 'user', content: prompt },
    ];

    const maxAttempts = 2;
    let lastError: unknown;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        const response = await axios.post<OpenRouterChatResponse>(
          endpoint,
          {
            model,
            messages,
            temperature: 0.7,
          },
          {
            timeout: 15000,
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
          `OpenRouter generation succeeded in ${Date.now() - startedAt}ms`,
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
          this.logger.warn(
            `OpenRouter request failed: status=${status ?? 'network'} attempt=${attempt} latency=${Date.now() - startedAt}ms`,
          );
        }

        break;
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
