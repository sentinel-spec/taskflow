"use client";

import { Hash, Plus, X } from "lucide-react";
import { observer } from "mobx-react";
import { ProjectList } from "@/core/components/workspace/project-sidebar";
import type { IProject } from "@/core/store/workspace.store";
import { useAuthTranslations, useNavigationTranslations } from "@/i18n/hooks";

type AllProjectsPanelProps = {
  workspaceSlug: string;
  pathname: string;
  projects: IProject[];
  onClose: () => void;
  onCreateProject: () => void;
};

export const AllProjectsPanel = observer(function AllProjectsPanel({
  workspaceSlug,
  pathname,
  projects,
  onClose,
  onCreateProject,
}: AllProjectsPanelProps) {
  const t = useAuthTranslations();
  const tNav = useNavigationTranslations();
  return (
    <div className="absolute inset-y-0 left-full z-50 w-70 border-l border-border-subtle bg-bg-surface-1 shadow-[0_0_24px_rgba(0,0,0,0.08)]">
      <div className="flex items-center justify-between border-b border-border-subtle px-4 py-3">
        <div className="flex items-center gap-2">
          <Hash size={16} className="text-txt-tertiary" />
          <span className="text-[10px] font-bold uppercase tracking-wider font-mono text-txt-tertiary">
            {t("allProjects")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-txt-tertiary transition-colors hover:bg-bg-surface-2"
            aria-label={tNav("closeAllProjectsPanel")}
          >
            <X size={16} />
          </button>
          <button
            type="button"
            onClick={onCreateProject}
            className="rounded-md p-1 text-txt-tertiary transition-colors hover:bg-bg-surface-2"
            title={tNav("createProject")}
            aria-label={tNav("createProject")}
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto px-3 py-4">
        <ProjectList
          workspaceSlug={workspaceSlug}
          pathname={pathname}
          projects={projects}
          maxVisibleProjects={projects.length}
          showShowAllButton={false}
        />
      </div>
    </div>
  );
});
