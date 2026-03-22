import {
  IsString,
  IsOptional,
  MaxLength,
  Matches,
  IsEnum,
  IsUrl,
} from 'class-validator';
import { WorkspaceUseCase } from '@prisma/client';

export class CreateWorkspaceDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsString()
  @MaxLength(50)
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug can only contain lowercase letters, numbers and hyphens',
  })
  slug: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsString()
  @IsOptional()
  teamSize?: string;

  @IsEnum(WorkspaceUseCase)
  @IsOptional()
  useCase?: WorkspaceUseCase;

  @IsUrl()
  @IsOptional()
  @MaxLength(500)
  coverImage?: string;
}
