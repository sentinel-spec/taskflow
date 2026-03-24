"use client";

import { isAxiosError } from "axios";
import { action, makeObservable, observable, runInAction } from "mobx";
import { toAppError } from "@/core/lib/api-error-handler";
import { logger } from "@/core/lib/logger";
import type {
  CreateProjectDto,
  ProjectDto,
} from "@/core/types/dto/project.dto";
import type {
  CreateWorkspaceDto,
  WorkspaceDto,
} from "@/core/types/dto/workspace.dto";
import { projectService } from "../services/project.service";
import { workspaceService } from "../services/workspace.service";
import type { ICoreRootStore } from "./root.store";

export type IProject = ProjectDto;
export type IWorkspace = WorkspaceDto;

export class WorkspaceStore {
  workspaces: IWorkspace[] = [];
  currentWorkspace: IWorkspace | null = null;
  isLoading: boolean = false;
  private fetchWorkspacesPromise: Promise<IWorkspace[]> | null = null;
  private workspaceBySlugPromises = new Map<string, Promise<IWorkspace>>();
  private workspaceBySlugRateLimitUntil = new Map<string, number>();
  private lastWorkspacesFetchedAt = 0;
  private workspacesRateLimitUntil = 0;

  constructor(public readonly rootStore: ICoreRootStore) {
    makeObservable(this, {
      workspaces: observable,
      currentWorkspace: observable,
      isLoading: observable,
      setWorkspaces: action,
      setCurrentWorkspace: action,
      fetchWorkspaces: action,
      createWorkspace: action,
      checkSlug: action,
      createProject: action,
      deleteProject: action,
    });
  }

  async checkSlug(slug: string) {
    try {
      return await workspaceService.checkSlug(slug);
    } catch (error) {
      logger.error("Check slug failed", error);
      throw error;
    }
  }

  setWorkspaces(workspaces: IWorkspace[]) {
    this.workspaces = workspaces;
  }

  setCurrentWorkspace(workspace: IWorkspace | null) {
    this.currentWorkspace = workspace;
  }

  async fetchWorkspaces(options?: { force?: boolean; minAgeMs?: number }) {
    const force = options?.force ?? false;
    const minAgeMs = options?.minAgeMs ?? 15_000;
    const now = Date.now();

    if (
      !force &&
      this.workspaces.length > 0 &&
      now - this.lastWorkspacesFetchedAt < minAgeMs
    ) {
      return this.workspaces;
    }

    if (!force && now < this.workspacesRateLimitUntil) {
      if (this.workspaces.length > 0) {
        return this.workspaces;
      }
      throw new Error("Workspace fetch is temporarily rate-limited");
    }

    if (this.fetchWorkspacesPromise) {
      return this.fetchWorkspacesPromise;
    }

    this.isLoading = true;
    this.fetchWorkspacesPromise = (async () => {
      try {
        const workspaces = await workspaceService.list();
        runInAction(() => {
          this.workspaces = workspaces;
          this.lastWorkspacesFetchedAt = Date.now();
          this.isLoading = false;
        });
        return workspaces;
      } catch (error) {
        // Protect UI from rate-limit storms during rapid route changes.
        if (isAxiosError(error) && error.response?.status === 429) {
          const retryAfterHeader = error.response?.headers?.["retry-after"];
          const retryAfterSeconds = Number.parseInt(
            Array.isArray(retryAfterHeader)
              ? retryAfterHeader[0]
              : ((retryAfterHeader as string) ?? ""),
            10,
          );
          const retryMs =
            Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0
              ? retryAfterSeconds * 1000
              : 10_000;
          this.workspacesRateLimitUntil = Date.now() + retryMs;

          logger.warn(
            "Workspace list is rate-limited (429), using cached workspaces",
          );
          runInAction(() => {
            this.isLoading = false;
          });
          if (this.workspaces.length > 0) {
            return this.workspaces;
          }
        }

        runInAction(() => {
          this.isLoading = false;
        });
        throw error;
      } finally {
        this.fetchWorkspacesPromise = null;
      }
    })();

    return this.fetchWorkspacesPromise;
  }

  async createWorkspace(data: CreateWorkspaceDto) {
    this.isLoading = true;
    try {
      const workspace = await workspaceService.create(data);
      runInAction(() => {
        this.workspaces.push(workspace);
        this.currentWorkspace = workspace;
        this.isLoading = false;
      });
      return workspace;
    } catch (error) {
      runInAction(() => {
        this.isLoading = false;
      });
      throw error;
    }
  }

  private async fetchWorkspaceProjects(workspaceId: number) {
    try {
      const projects = await projectService.list(workspaceId);
      return projects || [];
    } catch (error) {
      logger.error("Failed to load workspace projects", error);
      return [];
    }
  }

  async getWorkspaceBySlug(slug: string, options?: { force?: boolean }) {
    const normalizedSlug = slug.trim();
    const force = options?.force ?? false;
    const now = Date.now();

    if (
      !force &&
      this.currentWorkspace?.slug === normalizedSlug &&
      (this.currentWorkspace.projects?.length ?? 0) > 0
    ) {
      return this.currentWorkspace;
    }

    if (!force) {
      const rateLimitUntil =
        this.workspaceBySlugRateLimitUntil.get(normalizedSlug) ?? 0;
      if (now < rateLimitUntil) {
        const cachedWorkspace = this.workspaces.find(
          (workspace) => workspace.slug === normalizedSlug,
        );
        if (cachedWorkspace) {
          const workspaceWithProjects = {
            ...cachedWorkspace,
            projects: cachedWorkspace.projects ?? [],
          };
          runInAction(() => {
            this.currentWorkspace = workspaceWithProjects;
          });
          return workspaceWithProjects;
        }
      }
    }

    const pendingRequest = this.workspaceBySlugPromises.get(normalizedSlug);
    if (pendingRequest) {
      return pendingRequest;
    }

    this.isLoading = true;

    const requestPromise = (async () => {
      try {
        const workspace = await workspaceService.getBySlug(normalizedSlug);
        const projects = await this.fetchWorkspaceProjects(workspace.id);
        const workspaceWithProjects = {
          ...workspace,
          projects,
        };
        runInAction(() => {
          this.currentWorkspace = workspaceWithProjects;
          this.isLoading = false;
        });
        return workspaceWithProjects;
      } catch (error) {
        if (isAxiosError(error) && error.response?.status === 429) {
          const retryAfterHeader = error.response?.headers?.["retry-after"];
          const retryAfterSeconds = Number.parseInt(
            Array.isArray(retryAfterHeader)
              ? retryAfterHeader[0]
              : ((retryAfterHeader as string) ?? ""),
            10,
          );
          const retryMs =
            Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0
              ? retryAfterSeconds * 1000
              : 10_000;
          this.workspaceBySlugRateLimitUntil.set(
            normalizedSlug,
            Date.now() + retryMs,
          );

          const cachedWorkspace = this.workspaces.find(
            (workspace) => workspace.slug === normalizedSlug,
          );
          if (cachedWorkspace) {
            const workspaceWithProjects = {
              ...cachedWorkspace,
              projects: cachedWorkspace.projects ?? [],
            };
            runInAction(() => {
              this.currentWorkspace = workspaceWithProjects;
              this.isLoading = false;
            });
            return workspaceWithProjects;
          }
        }

        runInAction(() => {
          this.isLoading = false;
        });
        throw error;
      } finally {
        this.workspaceBySlugPromises.delete(normalizedSlug);
      }
    })();

    this.workspaceBySlugPromises.set(normalizedSlug, requestPromise);
    return requestPromise;
  }

  async createProject(workspaceId: number, data: CreateProjectDto) {
    try {
      logger.debug("Creating project via API", {
        workspaceId,
        data: JSON.stringify(data, null, 2),
      });

      const project = await projectService.create(workspaceId, data);

      logger.info("Project created successfully in store", project);

      const projectWithLogo = {
        ...project,
        logo_props: data.logo_props || project.logo_props,
      };

      runInAction(() => {
        if (this.currentWorkspace && this.currentWorkspace.id === workspaceId) {
          const updatedProjects = [
            projectWithLogo,
            ...(this.currentWorkspace.projects || []),
          ];
          this.currentWorkspace = {
            ...this.currentWorkspace,
            projects: updatedProjects,
          };
        }
      });
      return project;
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        logger.error("createProject error:", {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message,
        });
      }
      throw toAppError(error, {
        defaultMessage: "Failed to create project. Please try again.",
      });
    }
  }

  async getNextProjectIdentifier(workspaceId: number): Promise<string> {
    try {
      // Get all projects for this workspace
      const projects = await projectService.list(workspaceId);

      // Find the highest PROJ-XXXXX number
      let maxNumber = 0;

      if (projects && Array.isArray(projects)) {
        for (const project of projects) {
          if (project.identifier?.startsWith("PROJ-")) {
            const match = project.identifier.match(/PROJ-(\d+)/);
            if (match) {
              const num = parseInt(match[1], 10);
              if (num > maxNumber) {
                maxNumber = num;
              }
            }
          }
        }
      }

      // Increment and format with leading zeros
      const nextNumber = maxNumber + 1;
      const formattedNumber = String(nextNumber).padStart(5, "0");

      return `PROJ-${formattedNumber}`;
    } catch (error) {
      logger.error("Failed to get next identifier:", error);
      // Fallback to PROJ-00001
      return "PROJ-00001";
    }
  }

  async deleteProject(workspaceId: number, projectId: number) {
    await projectService.delete(projectId);
    runInAction(() => {
      if (this.currentWorkspace && this.currentWorkspace.id === workspaceId) {
        const updatedProjects =
          this.currentWorkspace.projects?.filter((p) => p.id !== projectId) ||
          [];
        this.currentWorkspace = {
          ...this.currentWorkspace,
          projects: updatedProjects,
        };
      }
    });
  }
}
