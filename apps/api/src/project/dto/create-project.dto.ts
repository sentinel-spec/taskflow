import { Type } from 'class-transformer';
import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

class LogoEmojiDto {
  @IsOptional()
  @IsString()
  value?: string;
}

class LogoIconDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  color?: string;
}

export class LogoPropsDto {
  @IsOptional()
  @IsEnum(['emoji', 'icon'])
  in_use?: 'emoji' | 'icon';

  @IsOptional()
  @ValidateNested()
  @Type(() => LogoEmojiDto)
  emoji?: LogoEmojiDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => LogoIconDto)
  icon?: LogoIconDto;
}

export class CreateProjectDto {
  @IsString()
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  identifier?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  coverImage?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => LogoPropsDto)
  logo_props?: LogoPropsDto;
}
