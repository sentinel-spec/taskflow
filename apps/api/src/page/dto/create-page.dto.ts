import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsInt,
  IsJSON,
} from 'class-validator';

export class CreatePageDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  descriptionJson?: any;

  @IsString()
  @IsOptional()
  descriptionHtml?: string;

  @IsString()
  @IsOptional()
  descriptionPlain?: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsInt()
  @IsOptional()
  parentPageId?: number;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}
