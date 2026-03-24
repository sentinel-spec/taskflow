import type { EntityId } from "./issue.types";

export type ITimelineViewMode = "day" | "week" | "month" | "quarter";

export interface ITimelineParams {
  viewMode?: ITimelineViewMode;
  dateFrom?: string;
  dateTo?: string;
  includeDependencies?: boolean;
}

export interface ITimelineData {
  issue_id: EntityId;
  title: string;
  start_date: string | null;
  target_date: string | null;
  dependencies?: EntityId[];
}

export interface ITimelineBlock {
  id: string;
  issueId: EntityId;
  title: string;
  startDate: Date;
  endDate: Date;
  dependencies: EntityId[];
}

export interface IUpdateTimelineBlockData {
  start_date: string;
  target_date: string;
}
