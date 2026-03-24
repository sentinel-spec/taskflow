import type { ReactNode } from "react";
import type { EntityId } from "./issue.types";
import type { TIssueGroupByOptions } from "./view.types";

export interface IBaseLayoutsKanbanItem {
  id: EntityId;
}

export interface IBaseLayoutsKanbanGroup {
  id: string;
  name: string;
  icon?: ReactNode;
  color?: string;
  payload?: Record<string, unknown>;
  isDropDisabled?: boolean;
  dropErrorMessage?: string;
}

export interface IGroupByColumn {
  id: string;
  name: string;
  icon?: ReactNode;
  color?: string;
}

export interface TGroupedIssues {
  [groupId: string]: EntityId[];
}

export interface TSubGroupedIssues {
  [groupId: string]: {
    [subGroupId: string]: EntityId[];
  };
}

export interface TIssueKanbanFilters {
  group_by?: string[];
  sub_group_by?: string[];
}

export interface IKanbanGroupingConfig {
  group_by: TIssueGroupByOptions;
  sub_group_by: TIssueGroupByOptions;
}
