"use client";

import {
  ArrowLeft,
  CircleDot,
  FileText,
  Layers,
  RefreshCcw,
  Settings,
  Star,
} from "lucide-react";
import Link from "next/link";
import { useNavigationTranslations } from "@/i18n/hooks";
import { SidebarItem } from "./sidebar-item";

type ProjectNavigationProps = {
  workspaceSlug: string;
  projectSlug: string;
  pathname: string;
  projectName: string;
};

export function ProjectNavigation({
  workspaceSlug,
  projectSlug,
  pathname,
  projectName,
}: ProjectNavigationProps) {
  const projectBase = `/${workspaceSlug}/projects/${projectSlug}`;
  const t = useNavigationTranslations();
  return (
    <div className="flex flex-col gap-1">
      <Link
        href={`/${workspaceSlug}`}
        className="mb-2 flex items-center gap-2 px-3 py-2 text-xs font-medium text-txt-tertiary transition-colors hover:text-txt-primary"
      >
        <ArrowLeft size={14} />
        <span>{t("backToWorkspace")}</span>
      </Link>

      <div className="mb-2 px-3 py-2">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-bg-accent-primary text-[10px] font-bold text-white uppercase">
            {projectName[0]}
          </div>
          <span className="truncate text-sm font-semibold text-txt-primary">
            {projectName}
          </span>
        </div>
      </div>

      <SidebarItem
        icon={CircleDot}
        label={t("projectIssues")}
        href={`${projectBase}/issues`}
        isActive={pathname.includes(`${projectBase}/issues`)}
      />
      <SidebarItem
        icon={RefreshCcw}
        label={t("cycles")}
        href={`${projectBase}/cycles`}
        isActive={pathname.includes(`${projectBase}/cycles`)}
      />
      <SidebarItem
        icon={Layers}
        label={t("modules")}
        href={`${projectBase}/modules`}
        isActive={pathname.includes(`${projectBase}/modules`)}
      />
      <SidebarItem
        icon={Star}
        label={t("views")}
        href={`${projectBase}/views`}
        isActive={pathname.includes(`${projectBase}/views`)}
      />
      <SidebarItem
        icon={FileText}
        label={t("pages")}
        href={`${projectBase}/pages`}
        isActive={pathname.includes(`${projectBase}/pages`)}
      />
      <SidebarItem
        icon={Settings}
        label={t("settings")}
        href={`${projectBase}/settings`}
        isActive={pathname.includes(`${projectBase}/settings`)}
      />
    </div>
  );
}
