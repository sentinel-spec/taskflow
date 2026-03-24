export type ProjectLogoPropsDto = {
  in_use?: "emoji" | "icon" | null;
  emoji?: { value?: string | null } | null;
  icon?: { name?: string | null; color?: string | null } | null;
};

export interface ProjectUserDto {
  id: number;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
}

export interface ProjectMemberDto {
  id: number;
  userId: number;
  projectId: number;
  createdAt: string;
  updatedAt: string;
  user: ProjectUserDto;
}

export interface ProjectDto {
  id: number;
  name: string;
  identifier: string;
  description?: string;
  coverImage?: string | null;
  isPublic?: boolean;
  isArchived?: boolean;
  createdAt?: string;
  updatedAt?: string;
  workspaceId?: number;
  members?: ProjectMemberDto[];
  membersCount?: number;
  author?: ProjectUserDto | null;
  logo_props?: ProjectLogoPropsDto;
}

export interface CreateProjectDto {
  name: string;
  identifier?: string;
  description?: string;
  coverImage?: string;
  logo_props?: ProjectLogoPropsDto;
  isPublic?: boolean;
}

export interface GenerateDescriptionDraftDto {
  prompt: string;
  projectName?: string;
}

export interface GenerateDescriptionDraftResponseDto {
  generatedText: string;
}
