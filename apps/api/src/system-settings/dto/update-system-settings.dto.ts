import {
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class MailSettingsDto {
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  fromEmail?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  fromName?: string;
}

class AiSettingsDto {
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsIn(['openrouter'])
  provider?: 'openrouter';

  @IsOptional()
  @IsString()
  @MaxLength(255)
  model?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  baseUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1024)
  apiKey?: string;
}

export class UpdateSystemSettingsDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  timezone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  locale?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => MailSettingsDto)
  mail?: MailSettingsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => AiSettingsDto)
  ai?: AiSettingsDto;
}

export type SystemSettingsDto = {
  timezone: string;
  locale: string;
  mail: {
    enabled: boolean;
    fromEmail: string;
    fromName: string;
  };
  ai: {
    enabled: boolean;
    provider: 'openrouter';
    model: string;
    baseUrl: string;
    apiKeyConfigured: boolean;
    apiKeyMasked: string | null;
  };
};
