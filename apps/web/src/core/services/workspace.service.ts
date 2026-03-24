"use client";

import type {
  CheckSlugResponseDto,
  CreateWorkspaceDto,
  InviteWorkspaceMembersDto,
  WorkspaceDto,
  WorkspaceInvitationDto,
  WorkspaceMemberDto,
} from "@/core/types/dto/workspace.dto";
import { API } from "./api.service";

export class WorkspaceService {
  async create(data: CreateWorkspaceDto): Promise<WorkspaceDto> {
    const response = await API.post<WorkspaceDto>("/workspace", data);
    return response.data;
  }

  async checkSlug(slug: string): Promise<CheckSlugResponseDto> {
    const response = await API.get<CheckSlugResponseDto>(
      `/workspace/check-slug/${slug}`,
    );
    return response.data;
  }

  async list(): Promise<WorkspaceDto[]> {
    const response = await API.get<WorkspaceDto[]>("/workspace");
    return response.data;
  }

  async getBySlug(slug: string): Promise<WorkspaceDto> {
    const response = await API.get<WorkspaceDto>(`/workspace/${slug}`);
    return response.data;
  }

  async getWorkspaceInvitation(
    workspaceSlug: string,
    invitationId: string,
  ): Promise<WorkspaceInvitationDto> {
    const response = await API.get<WorkspaceInvitationDto>(
      `/workspace/${workspaceSlug}/invitations/${invitationId}/join`,
      {
        headers: {},
      },
    );
    return response.data;
  }

  async joinWorkspace(
    workspaceSlug: string,
    invitationId: string,
    data: {
      accepted: boolean;
      token?: string | null;
    },
  ): Promise<WorkspaceInvitationDto> {
    const response = await API.post<WorkspaceInvitationDto>(
      `/workspace/${workspaceSlug}/invitations/${invitationId}/join`,
      data,
      {
        headers: {},
      },
    );
    return response.data;
  }

  async userWorkspaceInvitations(): Promise<WorkspaceInvitationDto[]> {
    const response = await API.get<WorkspaceInvitationDto[]>(
      "/users/me/workspaces/invitations",
    );
    return response.data;
  }

  async joinWorkspaces(data: { invitations: string[] }): Promise<void> {
    await API.post("/users/me/workspaces/invitations", data);
  }

  async listMembers(workspaceSlug: string): Promise<WorkspaceMemberDto[]> {
    const response = await API.get<WorkspaceMemberDto[]>(
      `/workspace/${workspaceSlug}/members`,
    );
    return response.data;
  }

  async inviteMembers(
    workspaceSlug: string,
    data: InviteWorkspaceMembersDto,
  ): Promise<{
    workspace: {
      id: number;
      slug: string;
      name: string;
    };
    invitations: Array<{
      id: string;
      email: string;
      role: "OWNER" | "MEMBER";
      token: string | null;
      invitationUrl: string;
    }>;
  }> {
    const response = await API.post(
      `/workspace/${workspaceSlug}/invitations`,
      data,
    );
    return response.data;
  }
}

export const workspaceService = new WorkspaceService();
