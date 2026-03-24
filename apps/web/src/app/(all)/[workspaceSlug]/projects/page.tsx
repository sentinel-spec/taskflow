"use client";

import { ArrowRight, Hash, Plus, Users } from "lucide-react";
import { observer } from "mobx-react";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import React from "react";
import { Button } from "@/components/ui/button";
import { CoverImage } from "@/core/components/common/cover-image";
import {
  Logo,
  type TLogoProps,
} from "@/core/components/project/emoji-icon-picker";
import { ProjectsHeaderActions } from "@/core/components/workspace/projects-header-actions";
import { STATIC_COVER_IMAGES } from "@/core/helpers/cover-image.helper";
import { useWorkspace } from "@/core/lib/store-context";
import { projectService } from "@/core/services/project.service";
import type { IProject } from "@/core/store/workspace.store";
import type { ProjectDto } from "@/core/types/dto/project.dto";
import {
  useAuthTranslations,
  useNavigationTranslations,
  useWorkspaceTranslations,
  useProjectTranslations,
} from "@/i18n/hooks";

type ProjectDetails = ProjectDto & {
  states?: Array<{ id: number; name: string; color?: string }>;
};

const CreateProjectModal = dynamic(
  () =>
    import("@/core/components/project/create-project-modal").then(
      (module) => module.CreateProjectModal,
    ),
  { ssr: false },
);

const LazyProjectDetailsDrawer = dynamic(
  () =>
    import("@/core/components/workspace/project-details-drawer").then(
      (module) => module.ProjectDetailsDrawer,
    ),
  { ssr: false },
);

const ProjectLogo = ({ logo }: { logo?: TLogoProps }) => {
  if (logo?.in_use) {
    return (
      <span className="grid h-10 w-10 place-items-center rounded-md bg-black/50 text-white">
        <Logo logo={logo} size={18} />
      </span>
    );
  }

  return (
    <span className="grid h-10 w-10 place-items-center rounded-md bg-black/50 text-white">
      <Hash size={16} />
    </span>
  );
};

const resolveProjectCover = (project: IProject) => {
  const staticCovers = Object.values(STATIC_COVER_IMAGES);
  const uniqueFallbackCover = staticCovers[project.id % staticCovers.length];
  const projectWithLegacyCover = project as IProject & {
    cover_image?: string | null;
    cover_image_url?: string | null;
    coverImageUrl?: string | null;
    cover?: string | null;
  };

  return (
    project.coverImage ??
    projectWithLegacyCover.cover_image_url ??
    projectWithLegacyCover.coverImageUrl ??
    projectWithLegacyCover.cover_image ??
    projectWithLegacyCover.cover ??
    uniqueFallbackCover
  );
};

const ProjectCard = ({
  project,
  onClick,
}: {
  project: IProject;
  onClick: (project: IProject) => void;
}) => {
  const t = useProjectTranslations();
  const membersCount = project.membersCount ?? project.members?.length ?? 0;
  const description =
    project.description?.trim() || t("noDescriptionProject");

  return (
    <button
      type="button"
      onClick={() => onClick(project)}
      className="group flex h-full w-full flex-col overflow-hidden rounded-xl border border-border-subtle bg-bg-surface-1 text-left hover:shadow-sm"
    >
      <div className="relative h-28 w-full">
        <CoverImage
          src={resolveProjectCover(project)}
          alt={project.name}
          showDefaultWhenEmpty={false}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/15 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">
              {project.name}
            </p>
          </div>
          <ProjectLogo logo={project.logo_props} />
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between gap-4 p-4">
        <p className="line-clamp-2 text-sm text-txt-secondary">{description}</p>
        <div className="flex items-center justify-between text-xs text-txt-tertiary">
          <span className="inline-flex items-center gap-1.5">
            <Users size={13} />
            {membersCount}
          </span>
          <span className="inline-flex items-center gap-1 text-txt-accent-primary">
            {t("moreDetails")}
            <ArrowRight size={13} />
          </span>
        </div>
      </div>
    </button>
  );
};

function ProjectsPage() {
  const { workspaceSlug } = useParams();
  const workspaceStore = useWorkspace();
  const workspace = workspaceStore.currentWorkspace;
  const projects = workspace?.projects ?? [];
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] =
    React.useState(false);
  const [isProjectDrawerOpen, setIsProjectDrawerOpen] = React.useState(false);
  const [selectedProject, setSelectedProject] = React.useState<IProject | null>(
    null,
  );
  const [detailsCache, setDetailsCache] = React.useState<
    Record<number, ProjectDetails>
  >({});
  const [isDetailsLoading, setIsDetailsLoading] = React.useState(false);
  const [detailsError, setDetailsError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [visibilityFilter, setVisibilityFilter] = React.useState<
    "all" | "public" | "private"
  >("all");
  const [sortBy, setSortBy] = React.useState<
    "recent" | "name-asc" | "name-desc"
  >("recent");

  const tAuth = useAuthTranslations();
  const tNav = useNavigationTranslations();
  const tWorkspace = useWorkspaceTranslations();
  const tProject = useProjectTranslations();

  const filteredProjects = React.useMemo(() => {
    let nextProjects = [...projects];

    const normalizedSearch = searchQuery.trim().toLowerCase();
    if (normalizedSearch.length > 0) {
      nextProjects = nextProjects.filter((project) => {
        const byName = project.name.toLowerCase().includes(normalizedSearch);
        const byIdentifier = project.identifier
          .toLowerCase()
          .includes(normalizedSearch);
        return byName || byIdentifier;
      });
    }

    if (visibilityFilter === "public") {
      nextProjects = nextProjects.filter((project) =>
        Boolean(project.isPublic),
      );
    } else if (visibilityFilter === "private") {
      nextProjects = nextProjects.filter((project) => !project.isPublic);
    }

    if (sortBy === "name-asc") {
      nextProjects.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "name-desc") {
      nextProjects.sort((a, b) => b.name.localeCompare(a.name));
    } else {
      nextProjects.sort((a, b) => {
        const aTime = new Date(a.createdAt ?? 0).getTime();
        const bTime = new Date(b.createdAt ?? 0).getTime();
        return bTime - aTime;
      });
    }

    return nextProjects;
  }, [projects, searchQuery, sortBy, visibilityFilter]);

  const handleOpenProjectDrawer = React.useCallback(
    async (project: IProject) => {
      setSelectedProject(project);
      setIsProjectDrawerOpen(true);
      setDetailsError(null);

      if (detailsCache[project.id]) {
        return;
      }

      setIsDetailsLoading(true);
      try {
        const details = (await projectService.get(
          project.id,
        )) as ProjectDetails;
        setDetailsCache((prev) => ({ ...prev, [project.id]: details }));
      } catch (_error) {
        setDetailsError(tProject("loadDetailsError"));
      } finally {
        setIsDetailsLoading(false);
      }
    },
    [detailsCache, tProject],
  );

  const selectedProjectDetails = selectedProject
    ? detailsCache[selectedProject.id]
    : null;

  const drawerProject = selectedProjectDetails ?? selectedProject;
  const drawerMembers =
    selectedProjectDetails?.members ?? selectedProject?.members ?? [];
  const drawerMembersCount =
    selectedProjectDetails?.membersCount ??
    selectedProject?.membersCount ??
    drawerMembers.length;

  if (!workspaceSlug) {
    return null;
  }

  return (
    <div className="mx-auto w-full space-y-6">
      <ProjectsHeaderActions
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        visibilityFilter={visibilityFilter}
        onVisibilityFilterChange={setVisibilityFilter}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        onCreateProject={() => setIsCreateProjectModalOpen(true)}
      />

      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-txt-primary">
            {tNav("projects")}
          </h1>
          <p className="text-sm text-txt-tertiary">
            {filteredProjects.length > 0
              ? tWorkspace("projectsOf", { count: filteredProjects.length, total: projects.length })
              : tAuth("noProjectsYet")}
          </p>
        </div>
      </div>

      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={handleOpenProjectDrawer}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border-subtle bg-bg-surface-1 p-8 text-center">
          <p className="text-base font-medium text-txt-primary">
            {projects.length === 0
              ? tAuth("noProjectsYet")
              : tWorkspace("noProjectsMatchFilters")}
          </p>
          <p className="mt-2 text-sm text-txt-tertiary">
            {projects.length === 0
              ? tWorkspace("createFirstProject")
              : tWorkspace("tryChangingSearch")}
          </p>
          {projects.length === 0 && (
            <Button
              type="button"
              className="mt-4 inline-flex items-center gap-2"
              onClick={() => setIsCreateProjectModalOpen(true)}
            >
              <Plus size={14} />
              {tWorkspace("newProject")}
            </Button>
          )}
        </div>
      )}

      {(isProjectDrawerOpen || Boolean(drawerProject)) && (
        <LazyProjectDetailsDrawer
          workspaceSlug={workspaceSlug.toString()}
          open={isProjectDrawerOpen}
          onOpenChange={setIsProjectDrawerOpen}
          project={drawerProject}
          members={drawerMembers}
          membersCount={drawerMembersCount}
          isLoading={isDetailsLoading}
          error={detailsError}
        />
      )}

      <CreateProjectModal
        isOpen={isCreateProjectModalOpen}
        onClose={() => setIsCreateProjectModalOpen(false)}
        workspaceSlug={workspaceSlug.toString()}
        onSuccess={() => setIsCreateProjectModalOpen(false)}
      />
    </div>
  );
}

export default observer(ProjectsPage);
