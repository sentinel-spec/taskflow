"use client";

import {
  action,
  computed,
  makeObservable,
  observable,
  runInAction,
} from "mobx";
import { issueService } from "@/core/services/issue.service";
import type {
  CreateIssueDto,
  IIssue,
  IIssueFilter,
  IIssueMap,
  UpdateIssueDto,
} from "@/core/types/issue.types";
import type { ICoreRootStore } from "../root.store";

export class IssueStore {
  issues: IIssueMap = {};
  issueIds: number[] = [];
  isLoading = false;
  filters: IIssueFilter = {};

  constructor(public readonly rootStore: ICoreRootStore) {
    makeObservable(this, {
      issues: observable,
      issueIds: observable,
      isLoading: observable,
      filters: observable,
      setIssues: action,
      setFilters: action,
      addIssue: action,
      replaceIssue: action,
      removeIssue: action,
      fetchIssues: action,
      createIssue: action,
      updateIssue: action,
      deleteIssue: action,
      clear: action,
      allIssues: computed,
      filteredIssues: computed,
    });
  }

  setIssues(issues: IIssue[]) {
    const nextMap: IIssueMap = {};
    const nextIds: number[] = [];

    issues.forEach((issue) => {
      nextMap[issue.id] = issue;
      nextIds.push(issue.id);
    });

    this.issues = nextMap;
    this.issueIds = nextIds;
  }

  setFilters(filters: IIssueFilter) {
    this.filters = filters;
  }

  addIssue(issue: IIssue) {
    this.issues[issue.id] = issue;
    if (!this.issueIds.includes(issue.id)) {
      this.issueIds.push(issue.id);
    }
  }

  replaceIssue(issueId: number, patch: Partial<IIssue>) {
    const current = this.issues[issueId];
    if (!current) return;

    this.issues[issueId] = {
      ...current,
      ...patch,
    };
  }

  removeIssue(issueId: number) {
    delete this.issues[issueId];
    this.issueIds = this.issueIds.filter((id) => id !== issueId);
  }

  clear() {
    this.issues = {};
    this.issueIds = [];
    this.filters = {};
    this.isLoading = false;
  }

  async fetchIssues(
    workspaceId: number,
    projectId: number,
    filters?: IIssueFilter,
  ) {
    this.isLoading = true;
    try {
      const issues = await issueService.list(workspaceId, projectId, filters);

      runInAction(() => {
        this.setIssues(issues);
        if (filters) {
          this.filters = filters;
        }
      });

      return issues;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async createIssue(
    workspaceId: number,
    projectId: number,
    data: CreateIssueDto,
  ) {
    const issue = await issueService.create(workspaceId, projectId, data);
    runInAction(() => {
      this.addIssue(issue);
    });
    return issue;
  }

  async updateIssue(
    workspaceId: number,
    projectId: number,
    issueId: number,
    data: UpdateIssueDto,
  ) {
    const issue = await issueService.update(
      workspaceId,
      projectId,
      issueId,
      data,
    );
    runInAction(() => {
      this.addIssue(issue);
    });
    return issue;
  }

  async deleteIssue(workspaceId: number, projectId: number, issueId: number) {
    await issueService.delete(workspaceId, projectId, issueId);
    runInAction(() => {
      this.removeIssue(issueId);
    });
  }

  getIssueById(issueId: number): IIssue | undefined {
    return this.issues[issueId];
  }

  get allIssues(): IIssue[] {
    return this.issueIds
      .map((id) => this.issues[id])
      .filter((issue): issue is IIssue => issue !== undefined);
  }

  get filteredIssues(): IIssue[] {
    const { state, priority, assignees, labels, cycle, module, search } =
      this.filters;

    return this.allIssues.filter((issue) => {
      if (state && state.length > 0) {
        if (issue.state_id === null || !state.includes(issue.state_id))
          return false;
      }

      if (priority && priority.length > 0) {
        if (issue.priority === null || !priority.includes(issue.priority))
          return false;
      }

      if (assignees && assignees.length > 0) {
        const isAssigneeMatch = issue.assignee_ids.some((id) =>
          assignees.includes(id),
        );
        if (!isAssigneeMatch) return false;
      }

      if (labels && labels.length > 0) {
        const isLabelMatch = issue.label_ids.some((id) => labels.includes(id));
        if (!isLabelMatch) return false;
      }

      if (cycle !== undefined && issue.cycle_id !== cycle) return false;

      if (module !== undefined && issue.module_id !== module) return false;

      if (search && search.trim().length > 0) {
        const normalizedSearch = search.trim().toLowerCase();
        const title = issue.name.toLowerCase();
        const description = issue.description?.toLowerCase() ?? "";
        if (
          !title.includes(normalizedSearch) &&
          !description.includes(normalizedSearch)
        ) {
          return false;
        }
      }

      return true;
    });
  }
}
