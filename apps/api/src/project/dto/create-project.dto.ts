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
  @MaxLength(100)
  name: string;

  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => LogoPropsDto)
  logo_props?: LogoPropsDto;
}
