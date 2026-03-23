import { WorkspaceRole } from '@prisma/client';
import {
  ArrayNotEmpty,
  IsArray,
  IsEmail,
  IsEnum,
  IsOptional,
} from 'class-validator';

export class InviteWorkspaceMembersDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsEmail({}, { each: true })
  emails: string[];

  @IsOptional()
  @IsEnum(WorkspaceRole)
  role?: WorkspaceRole;
}
