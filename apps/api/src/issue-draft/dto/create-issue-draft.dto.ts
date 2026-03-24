import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { IssuePriority } from '@prisma/client';

export class CreateIssueDraftDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(IssuePriority)
  @IsOptional()
  priority?: IssuePriority;

  @IsInt()
  @IsOptional()
  stateId?: number;
}
