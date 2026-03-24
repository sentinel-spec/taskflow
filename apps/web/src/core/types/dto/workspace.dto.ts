import type { ProjectDto } from "./project.dto";

export interface WorkspaceDto {
  id: number;
  name: string;
  slug: string;
  logoUrl?: string;
  projects?: ProjectDto[];
}

export interface WorkspaceInvitationDto {
  id: string;
  email: string;
  token?: string;
  role?: string;
  accepted?: boolean;
  responded_at?: string | null;
  respondedAt?: string | null;
  workspace: Pick<WorkspaceDto, "id" | "name" | "slug"> & {
    logo_url?: string | null;
    logoUrl?: string | null;
  };
}

export interface WorkspaceMemberUserDto {
  id: number;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
}

export interface WorkspaceMemberDto {
  id: number;
  role: "OWNER" | "MEMBER";
  createdAt: string;
  updatedAt: string;
  user: WorkspaceMemberUserDto;
}

export interface InviteWorkspaceMembersDto {
  emails: string[];
  role?: "OWNER" | "MEMBER";
}

export interface CreateWorkspaceDto {
  name: string;
  slug: string;
  teamSize?: string;
  useCase?: string;
}

export interface CheckSlugResponseDto {
  available: boolean;
}
