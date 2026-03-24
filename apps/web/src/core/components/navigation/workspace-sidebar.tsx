"use client";

import {
  ArrowLeft,
  Building2,
  Cable,
  Crown,
  Users,
  Webhook,
} from "lucide-react";
import { observer } from "mobx-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import React from "react";
import { GlobalNavigation } from "@/core/components/navigation/global-navigation";
import { ProjectNavigation } from "@/core/components/navigation/project-navigation";
import { SidebarDivider } from "@/core/components/navigation/sidebar-divider";
import { SidebarItem } from "@/core/components/navigation/sidebar-item";
import { SidebarNewIssueButton } from "@/core/components/navigation/sidebar-new-issue-button";
import { ProjectSidebar } from "@/core/components/workspace/project-sidebar";
import { useWorkspace } from "@/core/lib/store-context";
import { useNavigationTranslations } from "@/i18n/hooks";

const normalizeProjectSlug = (value?: string | string[] | undefined) =>
  value && Array.isArray(value) ? value[0] : value;

const CreateProjectModal = dynamic(
  () =>
    import("@/core/components/project/create-project-modal").then(
      (module) => module.CreateProjectModal,
    ),
  { ssr: false },
);

const AllProjectsPanel = dynamic(
  () =>
    import("@/core/components/navigation/all-projects-panel").then(
      (module) => module.AllProjectsPanel,
    ),
  { ssr: false },
);

export const WorkspaceSidebar = observer(function WorkspaceSidebar() {
  const { workspaceSlug, projectSlug } = useParams();
  const pathname = usePathname();
  const workspaceStore = useWorkspace();
  const workspace = workspaceStore.currentWorkspace;
  const tNav = useNavigationTranslations();
  const projects = workspace?.projects || [];
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] =
    React.useState(false);
  const [isAllProjectsPanelOpen, setIsAllProjectsPanelOpen] =
    React.useState(false);

  const activeProjectSlug = React.useMemo(() => {
    const normalizedParam = normalizeProjectSlug(projectSlug);
    if (!pathname) return normalizedParam;
    const segments = pathname.split("/").filter(Boolean);
    if (segments[1] === "projects" && segments[2]) {
      return segments[2];
    }
    return normalizedParam;
  }, [pathname, projectSlug]);

  const normalizedActiveProjectSlug = activeProjectSlug
    ? activeProjectSlug.toLowerCase()
    : undefined;
  const normalizedWorkspaceSlug = workspaceSlug?.toString();
  const isWorkspaceSettingsRoute = Boolean(
    normalizedWorkspaceSlug &&
      pathname.startsWith(`/${normalizedWorkspaceSlug}/settings`),
  );

  const currentProject = normalizedActiveProjectSlug
    ? projects.find(
        (p) =>
          p.identifier &&
          p.identifier.toLowerCase() === normalizedActiveProjectSlug,
      )
    : null;

  React.useEffect(() => {
    if (activeProjectSlug) {
      setIsAllProjectsPanelOpen(false);
    }
  }, [activeProjectSlug]);

  return (
    <aside className="relative flex h-full w-[250px] flex-col bg-bg-surface-1 shrink-0 border-r border-border-subtle">
      {/* Scrollable content */}
      <div className="flex flex-col gap-6 p-4 overflow-y-auto flex-1">
        {isWorkspaceSettingsRoute && normalizedWorkspaceSlug ? (
          <div className="flex flex-col gap-1">
            <Link
              href={`/${normalizedWorkspaceSlug}`}
              className="mb-2 flex items-center gap-2 px-3 py-2 text-xs font-medium text-txt-tertiary transition-colors hover:text-txt-primary"
            >
              <ArrowLeft size={14} />
              <span>{tNav("backToWorkspace")}</span>
            </Link>
            <SidebarItem
              icon={Building2}
              label={tNav("general")}
              href={`/${normalizedWorkspaceSlug}/settings`}
              isActive={pathname === `/${normalizedWorkspaceSlug}/settings`}
            />
            <SidebarItem
              icon={Users}
              label={tNav("members")}
              href={`/${normalizedWorkspaceSlug}/settings/members`}
              isActive={
                pathname === `/${normalizedWorkspaceSlug}/settings/members`
              }
            />
            <SidebarItem
              icon={Cable}
              label={tNav("integrations")}
              href={`/${normalizedWorkspaceSlug}/settings/integrations`}
              isActive={
                pathname === `/${normalizedWorkspaceSlug}/settings/integrations`
              }
            />
            <SidebarItem
              icon={Webhook}
              label={tNav("webhooks")}
              href={`/${normalizedWorkspaceSlug}/settings/webhooks`}
              isActive={
                pathname === `/${normalizedWorkspaceSlug}/settings/webhooks`
              }
            />
            <SidebarItem
              icon={Crown}
              label={tNav("billing")}
              href={`/${normalizedWorkspaceSlug}/settings/billing`}
              isActive={
                pathname === `/${normalizedWorkspaceSlug}/settings/billing`
              }
            />
          </div>
        ) : activeProjectSlug && currentProject && workspaceSlug ? (
          <ProjectNavigation
            workspaceSlug={workspaceSlug.toString()}
            projectSlug={activeProjectSlug.toString()}
            pathname={pathname}
            projectName={currentProject.name}
          />
        ) : (
          <>
            <div className="flex flex-col gap-1 mb-2">
              <SidebarNewIssueButton />
            </div>
            {workspaceSlug && (
              <GlobalNavigation
                workspaceSlug={workspaceSlug.toString()}
                pathname={pathname}
              />
            )}
          </>
        )}

        {!isWorkspaceSettingsRoute && <SidebarDivider />}

        {/* Projects list */}
        {!isWorkspaceSettingsRoute && workspaceSlug && (
          <ProjectSidebar
            onOpenAllProjects={() => setIsAllProjectsPanelOpen(true)}
            onCreateProject={() => setIsCreateProjectModalOpen(true)}
          />
        )}

        {/* Create Project Modal */}
        {workspaceSlug && (
          <CreateProjectModal
            isOpen={isCreateProjectModalOpen}
            onClose={() => setIsCreateProjectModalOpen(false)}
            workspaceSlug={workspaceSlug.toString()}
            onSuccess={() => {
              setIsCreateProjectModalOpen(false);
            }}
          />
        )}
      </div>
      {workspaceSlug && isAllProjectsPanelOpen && (
        <AllProjectsPanel
          workspaceSlug={workspaceSlug.toString()}
          pathname={pathname}
          projects={projects}
          onClose={() => setIsAllProjectsPanelOpen(false)}
          onCreateProject={() => {
            setIsAllProjectsPanelOpen(false);
            setIsCreateProjectModalOpen(true);
          }}
        />
      )}
    </aside>
  );
});
