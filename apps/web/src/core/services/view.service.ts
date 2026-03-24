"use client";

import type {
  CreateViewDto,
  IView,
  UpdateViewDto,
} from "@/core/types/view.types";
import { API } from "./api.service";

export class ViewService {
  async list(workspaceId: number, projectId: number): Promise<IView[]> {
    const response = await API.get<IView[]>(
      `/workspace/${workspaceId}/project/${projectId}/views`,
    );
    return response.data;
  }

  async get(
    workspaceId: number,
    projectId: number,
    viewId: number,
  ): Promise<IView> {
    const response = await API.get<IView>(
      `/workspace/${workspaceId}/project/${projectId}/views/${viewId}`,
    );
    return response.data;
  }

  async create(
    workspaceId: number,
    projectId: number,
    data: CreateViewDto,
  ): Promise<IView> {
    const response = await API.post<IView>(
      `/workspace/${workspaceId}/project/${projectId}/views`,
      data,
    );
    return response.data;
  }

  async update(
    workspaceId: number,
    projectId: number,
    viewId: number,
    data: UpdateViewDto,
  ): Promise<IView> {
    const response = await API.patch<IView>(
      `/workspace/${workspaceId}/project/${projectId}/views/${viewId}`,
      data,
    );
    return response.data;
  }

  async delete(
    workspaceId: number,
    projectId: number,
    viewId: number,
  ): Promise<void> {
    await API.delete(
      `/workspace/${workspaceId}/project/${projectId}/views/${viewId}`,
    );
  }
}

export const viewService = new ViewService();
