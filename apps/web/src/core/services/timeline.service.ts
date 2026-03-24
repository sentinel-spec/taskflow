"use client";

import type {
  ITimelineData,
  ITimelineParams,
  IUpdateTimelineBlockData,
} from "@/core/types/timeline.types";
import { API } from "./api.service";

function timelineParamsToQuery(params?: ITimelineParams): string {
  if (!params) return "";

  const query = new URLSearchParams();

  if (params.viewMode) query.set("view_mode", params.viewMode);
  if (params.dateFrom) query.set("date_from", params.dateFrom);
  if (params.dateTo) query.set("date_to", params.dateTo);
  if (params.includeDependencies !== undefined) {
    query.set("include_dependencies", String(params.includeDependencies));
  }

  const serialized = query.toString();
  return serialized.length > 0 ? `?${serialized}` : "";
}

export class TimelineService {
  async fetchTimelineData(
    workspaceId: number,
    projectId: number,
    params?: ITimelineParams,
  ): Promise<ITimelineData[]> {
    const response = await API.get<ITimelineData[]>(
      `/workspace/${workspaceId}/project/${projectId}/timeline${timelineParamsToQuery(params)}`,
    );
    return response.data;
  }

  async updateBlockPosition(
    workspaceId: number,
    projectId: number,
    blockId: number,
    data: IUpdateTimelineBlockData,
  ): Promise<ITimelineData> {
    const response = await API.patch<ITimelineData>(
      `/workspace/${workspaceId}/project/${projectId}/timeline/${blockId}`,
      data,
    );
    return response.data;
  }
}

export const timelineService = new TimelineService();
