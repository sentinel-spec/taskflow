export type EntityId = number;

export type IssuePriority = "urgent" | "high" | "medium" | "low" | null;

export interface IIssue {
  id: EntityId;
  name: string;
  description?: string | null;
  priority: IssuePriority;
  state_id: EntityId | null;
  assignee_ids: EntityId[];
  label_ids: EntityId[];
  cycle_id: EntityId | null;
  module_id: EntityId | null;
  start_date: string | null;
  target_date: string | null;
  estimate: number | null;
  sequence_id: number;
  project_id: EntityId;
  workspace_id: EntityId;
  created_by: EntityId;
  created_at: string;
  updated_at: string;
}

export interface IIssueMap {
  [issueId: EntityId]: IIssue;
}

export interface IIssueFilter {
  state?: EntityId[];
  priority?: Exclude<IssuePriority, null>[];
  assignees?: EntityId[];
  labels?: EntityId[];
  cycle?: EntityId | null;
  module?: EntityId | null;
  startDateFrom?: string;
  startDateTo?: string;
  targetDateFrom?: string;
  targetDateTo?: string;
  search?: string;
}

export interface CreateIssueDto {
  name: string;
  description?: string | null;
  priority?: IssuePriority;
  state_id?: EntityId | null;
  assignee_ids?: EntityId[];
  label_ids?: EntityId[];
  cycle_id?: EntityId | null;
  module_id?: EntityId | null;
  start_date?: string | null;
  target_date?: string | null;
  estimate?: number | null;
}

export type UpdateIssueDto = Partial<CreateIssueDto>;
