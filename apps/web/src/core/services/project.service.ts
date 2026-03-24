"use client";

import type {
  CreateProjectDto,
  GenerateDescriptionDraftDto,
  GenerateDescriptionDraftResponseDto,
  ProjectDto,
} from "@/core/types/dto/project.dto";
import { API } from "./api.service";

export class ProjectService {
  async create(
    workspaceId: number,
    data: CreateProjectDto,
  ): Promise<ProjectDto> {
    const response = await API.post<ProjectDto>(
      `/projects/${workspaceId}`,
      data,
    );
    return response.data;
  }

  async list(workspaceId: number): Promise<ProjectDto[]> {
    const response = await API.get<ProjectDto[]>(`/projects/${workspaceId}`);
    return response.data;
  }

  async get(projectId: number): Promise<ProjectDto> {
    const response = await API.get<ProjectDto>(
      `/projects/details/${projectId}`,
    );
    return response.data;
  }

  async delete(projectId: number): Promise<void> {
    const response = await API.delete(`/projects/${projectId}`);
    return response.data;
  }

  async generateDescriptionDraft(
    workspaceId: number,
    data: GenerateDescriptionDraftDto,
  ): Promise<GenerateDescriptionDraftResponseDto> {
    const response = await API.post<GenerateDescriptionDraftResponseDto>(
      `/projects/${workspaceId}/generate-description`,
      data,
    );
    return response.data;
  }
}

export const projectService = new ProjectService();
