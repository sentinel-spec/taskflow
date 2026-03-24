import type { EntityId, IIssueFilter } from "./issue.types";

export type TViewType = "kanban" | "list" | "gantt" | "calendar";

export type TIssueGroupByOptions =
  | "state"
  | "priority"
  | "labels"
  | "assignees"
  | "created_by"
  | "cycle"
  | "module"
  | null;

export type TIssueOrderByOptions =
  | "sort_order"
  | "created_at"
  | "updated_at"
  | "priority"
  | "start_date"
  | "target_date"
  | null;

export interface IIssueDisplayProperties {
  start_date?: boolean;
  target_date?: boolean;
  priority?: boolean;
  labels?: boolean;
  assignee?: boolean;
  estimate?: boolean;
  key?: boolean;
  sub_issues_count?: boolean;
}

export type TViewFilterProps = IIssueFilter;

export interface IView {
  id: EntityId;
  name: string;
  description?: string | null;
  type: TViewType;
  filters: TViewFilterProps;
  group_by: TIssueGroupByOptions;
  sub_group_by: TIssueGroupByOptions;
  order_by: TIssueOrderByOptions;
  display_properties: IIssueDisplayProperties;
  is_default: boolean;
  project_id: EntityId;
  workspace_id: EntityId;
  created_by: EntityId;
  created_at: string;
  updated_at: string;
}

export interface IViewMap {
  [viewId: EntityId]: IView;
}

export interface CreateViewDto {
  name: string;
  description?: string | null;
  type: TViewType;
  filters?: TViewFilterProps;
  group_by?: TIssueGroupByOptions;
  sub_group_by?: TIssueGroupByOptions;
  order_by?: TIssueOrderByOptions;
  display_properties?: IIssueDisplayProperties;
  is_default?: boolean;
}

export type UpdateViewDto = Partial<Omit<CreateViewDto, "type">>;

export interface IViewContext {
  workspaceId: number;
  projectId: number;
}
