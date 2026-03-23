import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';

export class JoinWorkspacesDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  invitations: string[];
}
