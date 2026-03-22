import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class GenerateProjectDescriptionDto {
  @IsString()
  @MinLength(3)
  @MaxLength(2000)
  prompt: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  projectName?: string;
}
