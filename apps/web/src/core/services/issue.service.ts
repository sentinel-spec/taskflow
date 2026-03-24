"use client";

import type {
  CreateIssueDto,
  IIssue,
  IIssueFilter,
  UpdateIssueDto,
} from "@/core/types/issue.types";
import { API } from "./api.service";

function appendIssueFilters(params: URLSearchParams, filters: IIssueFilter) {
  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined) return;

    if (Array.isArray(value)) {
      value.forEach((item) => {
        params.append(key, String(item));
      });
      return;
    }

    params.append(key, String(value));
  });
}

export class IssueService {
  async list(
    workspaceId: number,
    projectId: number,
    filters?: IIssueFilter,
  ): Promise<IIssue[]> {
    const params = new URLSearchParams();

    if (filters) {
      appendIssueFilters(params, filters);
    }

    const query = params.toString();
    const suffix = query.length > 0 ? `?${query}` : "";

    const response = await API.get<IIssue[]>(
      `/workspace/${workspaceId}/project/${projectId}/issues${suffix}`,
    );
    return response.data;
  }

  async get(
    workspaceId: number,
    projectId: number,
    issueId: number,
  ): Promise<IIssue> {
    const response = await API.get<IIssue>(
      `/workspace/${workspaceId}/project/${projectId}/issues/${issueId}`,
    );
    return response.data;
  }

  async create(
    workspaceId: number,
    projectId: number,
    data: CreateIssueDto,
  ): Promise<IIssue> {
    const response = await API.post<IIssue>(
      `/workspace/${workspaceId}/project/${projectId}/issues`,
      data,
    );
    return response.data;
  }

  async update(
    workspaceId: number,
    projectId: number,
    issueId: number,
    data: UpdateIssueDto,
  ): Promise<IIssue> {
    const response = await API.patch<IIssue>(
      `/workspace/${workspaceId}/project/${projectId}/issues/${issueId}`,
      data,
    );
    return response.data;
  }

  async delete(
    workspaceId: number,
    projectId: number,
    issueId: number,
  ): Promise<void> {
    await API.delete(
      `/workspace/${workspaceId}/project/${projectId}/issues/${issueId}`,
    );
  }
}

export const issueService = new IssueService();
