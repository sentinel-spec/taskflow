"use client";

import { Plus } from "lucide-react";
import { observer } from "mobx-react";
import { useParams, usePathname } from "next/navigation";
import { ProjectListItem } from "@/core/components/workspace/project-list-item";
import { usePinnedProjects } from "@/core/hooks/use-pinned-projects";
import { useWorkspace } from "@/core/lib/store-context";
import type { IProject } from "@/core/store/workspace.store";
import { useAuthTranslations, useNavigationTranslations } from "@/i18n/hooks";

interface ProjectSidebarProps {
  onOpenAllProjects: () => void;
  onCreateProject: () => void;
}

interface ProjectListProps {
  workspaceSlug: string;
  pathname: string;
  projects: IProject[];
  onOpenAllProjects?: () => void;
  maxVisibleProjects?: number;
  showShowAllButton?: boolean;
}

const ProjectList = observer(function ProjectList({
  workspaceSlug,
  pathname,
  projects,
  onOpenAllProjects,
  maxVisibleProjects = projects.length,
  showShowAllButton = false,
}: ProjectListProps) {
  const { orderedProjects, pinnedProjectIds, togglePin } = usePinnedProjects({
    workspaceSlug,
    projects,
  });

  const visibleProjects = orderedProjects.slice(0, maxVisibleProjects);
  const hasMoreProjects =
    showShowAllButton && orderedProjects.length > visibleProjects.length;
  const t = useAuthTranslations();
  const tNav = useNavigationTranslations();

  return (
    <div className="flex flex-col gap-1 text-sm font-medium text-txt-secondary font-sans leading-relaxed">
      {visibleProjects.length > 0 ? (
        <>
          {visibleProjects.map((project: IProject) => {
            const isPinned = pinnedProjectIds.includes(project.id);

            return (
              <ProjectListItem
                key={project.id}
                workspaceSlug={workspaceSlug}
                pathname={pathname}
                project={project}
                isPinned={isPinned}
                pinTitle={tNav("pinProject")}
                unpinTitle={tNav("unpinProject")}
                onTogglePin={togglePin}
              />
            );
          })}

          {hasMoreProjects && onOpenAllProjects && (
            <button
              type="button"
              onClick={onOpenAllProjects}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md text-txt-accent-primary hover:bg-bg-surface-2 transition-all text-sm font-medium"
            >
              <span>
                {t("showAll")} ({orderedProjects.length})
              </span>
            </button>
          )}
        </>
      ) : (
        <div className="px-3 py-2 text-xs text-txt-placeholder italic">
          {t("noProjectsYet")}
        </div>
      )}
    </div>
  );
});

export const ProjectSidebar = observer(function ProjectSidebar({
  onOpenAllProjects,
  onCreateProject,
}: ProjectSidebarProps) {
  const { workspaceSlug } = useParams();
  const pathname = usePathname();
  const workspaceStore = useWorkspace();
  const workspace = workspaceStore.currentWorkspace;
  const projects = workspace?.projects || [];
  const t = useAuthTranslations();
  const tNav = useNavigationTranslations();

  if (!workspaceSlug) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-bold text-txt-tertiary uppercase tracking-wider font-mono">
          {t("myProjects")}
        </span>
        <button
          type="button"
          onClick={onCreateProject}
          className="text-txt-tertiary hover:text-txt-primary transition-colors"
          title={tNav("createNewProject")}
          aria-label={tNav("createNewProject")}
        >
          <Plus size={14} />
        </button>
      </div>

      <ProjectList
        workspaceSlug={workspaceSlug.toString()}
        pathname={pathname}
        projects={projects}
        maxVisibleProjects={5}
        showShowAllButton={true}
        onOpenAllProjects={onOpenAllProjects}
      />
    </div>
  );
});

export { ProjectList };
