"use client";

import { Hash, Pin } from "lucide-react";
import Link from "next/link";
import {
  Logo,
  type TLogoProps,
} from "@/core/components/project/emoji-icon-picker";
import { cn } from "@/core/lib/utils";
import type { IProject } from "@/core/store/workspace.store";

type ProjectListItemProps = {
  workspaceSlug: string;
  pathname: string;
  project: IProject;
  isPinned: boolean;
  pinTitle: string;
  unpinTitle: string;
  onTogglePin: (projectId: number) => void;
};

const ProjectIcon = ({ logo }: { logo?: TLogoProps }) => {
  if (logo?.in_use) {
    return (
      <span className="flex items-center justify-center text-center text-txt-tertiary">
        <Logo logo={logo} size={14} />
      </span>
    );
  }

  return <Hash size={14} className="text-txt-tertiary" />;
};

export function ProjectListItem({
  workspaceSlug,
  pathname,
  project,
  isPinned,
  pinTitle,
  unpinTitle,
  onTogglePin,
}: ProjectListItemProps) {
  const isActive = pathname.includes(
    `/${workspaceSlug}/projects/${project.identifier}`,
  );

  return (
    <div
      className={cn(
        "group flex items-center gap-1 rounded-md transition-all",
        isActive ? "bg-bg-surface-2 text-txt-primary" : "hover:bg-bg-surface-2",
      )}
    >
      <Link
        href={`/${workspaceSlug}/projects/${project.identifier}`}
        className="flex min-w-0 flex-1 items-center gap-2 px-3 py-1.5"
      >
        <ProjectIcon logo={project.logo_props} />
        <span className="truncate">{project.name}</span>
      </Link>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onTogglePin(project.id);
        }}
        className={cn(
          "mr-1 rounded p-1 transition-colors",
          isPinned
            ? "text-txt-accent-primary"
            : "text-txt-placeholder hover:text-txt-tertiary",
        )}
        title={isPinned ? unpinTitle : pinTitle}
        aria-label={isPinned ? unpinTitle : pinTitle}
      >
        <Pin size={12} className={cn(isPinned && "fill-current")} />
      </button>
    </div>
  );
}
