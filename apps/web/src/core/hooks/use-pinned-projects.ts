"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { IProject } from "@/core/store/workspace.store";

const parsePinnedIds = (value: string | null): number[] => {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((id) => Number(id))
      .filter((id) => Number.isInteger(id) && id > 0);
  } catch {
    return [];
  }
};

type UsePinnedProjectsParams = {
  workspaceSlug: string;
  projects: IProject[];
};

export function usePinnedProjects({
  workspaceSlug,
  projects,
}: UsePinnedProjectsParams) {
  const pinnedStorageKey = `sensata:pinned-projects:${workspaceSlug}`;
  const [pinnedProjectIds, setPinnedProjectIds] = useState<number[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const raw = localStorage.getItem(pinnedStorageKey);
    setPinnedProjectIds(parsePinnedIds(raw));
  }, [pinnedStorageKey]);

  useEffect(() => {
    // Do not prune pinned ids until projects are loaded,
    // otherwise we can accidentally wipe localStorage on initial empty render.
    if (projects.length === 0) {
      return;
    }

    const existingIds = new Set(projects.map((project) => project.id));
    const filtered = pinnedProjectIds.filter((id) => existingIds.has(id));
    if (filtered.length === pinnedProjectIds.length) {
      return;
    }

    setPinnedProjectIds(filtered);
    if (typeof window !== "undefined") {
      localStorage.setItem(pinnedStorageKey, JSON.stringify(filtered));
    }
  }, [projects, pinnedProjectIds, pinnedStorageKey]);

  const togglePin = useCallback(
    (projectId: number) => {
      setPinnedProjectIds((prev) => {
        const next = prev.includes(projectId)
          ? prev.filter((id) => id !== projectId)
          : [...prev, projectId];

        if (typeof window !== "undefined") {
          localStorage.setItem(pinnedStorageKey, JSON.stringify(next));
        }

        return next;
      });
    },
    [pinnedStorageKey],
  );

  const orderedProjects = useMemo(() => {
    if (pinnedProjectIds.length === 0) {
      return projects;
    }

    const orderMap = new Map(pinnedProjectIds.map((id, index) => [id, index]));
    const pinned = projects
      .filter((project) => orderMap.has(project.id))
      .sort((a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0));
    const regular = projects.filter((project) => !orderMap.has(project.id));
    return [...pinned, ...regular];
  }, [projects, pinnedProjectIds]);

  return {
    pinnedProjectIds,
    orderedProjects,
    togglePin,
  };
}
