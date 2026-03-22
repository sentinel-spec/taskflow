import { BadRequestException, Injectable } from '@nestjs/common';
import { SystemSettings } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import {
  SystemSettingsDto,
  UpdateSystemSettingsDto,
} from './dto/update-system-settings.dto';
import {
  decryptValue,
  encryptValue,
  isEncryptedValue,
  maskSecret,
} from './crypto';

@Injectable()
export class SystemSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAiRuntimeSettings(): Promise<{
    enabled: boolean;
    provider: 'openrouter';
    model: string;
    baseUrl: string;
    apiKey: string | null;
  }> {
    const settings = await this.getOrCreateSettings();
    const apiKey = settings.aiApiKey
      ? this.resolvePlainApiKey(settings.aiApiKey)
      : null;

    return {
      enabled: settings.aiEnabled,
      provider: 'openrouter',
      model: settings.aiModel,
      baseUrl: settings.aiBaseUrl,
      apiKey,
    };
  }

  private getEncryptionSecret(): string {
    return process.env.SYSTEM_SETTINGS_SECRET || '';
  }

  private resolvePlainApiKey(storedValue: string): string | null {
    if (!storedValue) {
      return null;
    }

    if (!isEncryptedValue(storedValue)) {
      return storedValue;
    }

    const secret = this.getEncryptionSecret();
    if (!secret) {
      return null;
    }

    try {
      return decryptValue(storedValue, secret);
    } catch {
      return null;
    }
  }

  private getDefaultValues() {
    return {
      timezone: process.env.SYSTEM_TIMEZONE || process.env.TZ || 'UTC',
      locale: process.env.SYSTEM_LOCALE || 'en-US',
      mailEnabled: process.env.MAIL_ENABLED === 'true',
      mailFromEmail: process.env.MAIL_FROM_EMAIL || '',
      mailFromName: process.env.MAIL_FROM_NAME || '',
      aiEnabled: process.env.AI_ENABLED !== 'false',
      aiProvider: 'openrouter',
      aiModel: process.env.AI_MODEL || 'nemotron-3-super-120b-a12b:free',
      aiBaseUrl: process.env.AI_BASE_URL || 'https://openrouter.ai/api/v1',
      aiApiKey: process.env.AI_API_KEY || null,
    };
  }

  private toDto(settings: SystemSettings): SystemSettingsDto {
    return {
      timezone: settings.timezone,
      locale: settings.locale,
      mail: {
        enabled: settings.mailEnabled,
        fromEmail: settings.mailFromEmail,
        fromName: settings.mailFromName,
      },
      ai: {
        enabled: settings.aiEnabled,
        provider: 'openrouter',
        model: settings.aiModel,
        baseUrl: settings.aiBaseUrl,
        apiKeyConfigured: Boolean(settings.aiApiKey),
        apiKeyMasked: settings.aiApiKey
          ? maskSecret(
              this.resolvePlainApiKey(settings.aiApiKey) || 'configured',
            )
          : null,
      },
    };
  }

  private async getOrCreateSettings(): Promise<SystemSettings> {
    const defaults = this.getDefaultValues();

    return this.prisma.systemSettings.upsert({
      where: { key: 'default' },
      create: {
        key: 'default',
        ...defaults,
      },
      update: {},
    });
  }

  async getSettings(): Promise<SystemSettingsDto> {
    const settings = await this.getOrCreateSettings();
    return this.toDto(settings);
  }

  async updateSettings(
    payload: UpdateSystemSettingsDto,
  ): Promise<SystemSettingsDto> {
    await this.getOrCreateSettings();

    const aiApiKeyData =
      payload.ai?.apiKey !== undefined
        ? (() => {
            if (payload.ai.apiKey.length === 0) {
              return { aiApiKey: null };
            }

            const secret = this.getEncryptionSecret();
            if (!secret) {
              throw new BadRequestException(
                'SYSTEM_SETTINGS_SECRET is required to store AI API key securely',
              );
            }

            return { aiApiKey: encryptValue(payload.ai.apiKey, secret) };
          })()
        : {};

    const updated = await this.prisma.systemSettings.update({
      where: { key: 'default' },
      data: {
        ...(payload.timezone !== undefined
          ? { timezone: payload.timezone }
          : {}),
        ...(payload.locale !== undefined ? { locale: payload.locale } : {}),
        ...(payload.mail?.enabled !== undefined
          ? { mailEnabled: payload.mail.enabled }
          : {}),
        ...(payload.mail?.fromEmail !== undefined
          ? { mailFromEmail: payload.mail.fromEmail }
          : {}),
        ...(payload.mail?.fromName !== undefined
          ? { mailFromName: payload.mail.fromName }
          : {}),
        ...(payload.ai?.enabled !== undefined
          ? { aiEnabled: payload.ai.enabled }
          : {}),
        ...(payload.ai?.provider !== undefined
          ? { aiProvider: payload.ai.provider }
          : {}),
        ...(payload.ai?.model !== undefined
          ? { aiModel: payload.ai.model }
          : {}),
        ...(payload.ai?.baseUrl !== undefined
          ? { aiBaseUrl: payload.ai.baseUrl }
          : {}),
        ...aiApiKeyData,
      },
    });

    return this.toDto(updated);
  }
}
