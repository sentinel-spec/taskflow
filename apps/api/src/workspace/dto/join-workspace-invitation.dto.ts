import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class JoinWorkspaceInvitationDto {
  @IsBoolean()
  accepted: boolean;

  @IsOptional()
  @IsString()
  token?: string;
}
