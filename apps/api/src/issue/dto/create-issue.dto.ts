import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsDateString,
} from 'class-validator';
import { IssuePriority } from '@prisma/client';

export class CreateIssueDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(IssuePriority)
  @IsOptional()
  priority?: IssuePriority;

  @IsInt()
  @IsNotEmpty()
  stateId: number;

  @IsInt()
  @IsOptional()
  cycleId?: number;

  @IsInt()
  @IsOptional()
  moduleId?: number;

  @IsInt()
  @IsOptional()
  estimateId?: number;

  @IsInt()
  @IsOptional()
  assigneeId?: number;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  dueDate?: string;
}
