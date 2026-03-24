"use client";

import { Calendar, X } from "lucide-react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { CoverImage } from "@/core/components/common/cover-image";
import { STATIC_COVER_IMAGES } from "@/core/helpers/cover-image.helper";
import type {
  ProjectDto,
  ProjectMemberDto,
} from "@/core/types/dto/project.dto";
import { useProjectTranslations, useCommonTranslations } from "@/i18n/hooks";

type ProjectForDrawer = ProjectDto & {
  cover_image?: string | null;
  cover_image_url?: string | null;
  coverImageUrl?: string | null;
  cover?: string | null;
  members?: ProjectMemberDto[];
};

type ProjectDetailsDrawerProps = {
  workspaceSlug: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: ProjectForDrawer | null;
  members: ProjectMemberDto[];
  membersCount: number;
  isLoading: boolean;
  error: string | null;
};

const resolveProjectCover = (project: ProjectForDrawer) => {
  const staticCovers = Object.values(STATIC_COVER_IMAGES);
  const uniqueFallbackCover = staticCovers[project.id % staticCovers.length];

  return (
    project.coverImage ??
    project.cover_image_url ??
    project.coverImageUrl ??
    project.cover_image ??
    project.cover ??
    uniqueFallbackCover
  );
};

export function ProjectDetailsDrawer({
  workspaceSlug,
  open,
  onOpenChange,
  project,
  members,
  membersCount,
  isLoading,
  error,
}: ProjectDetailsDrawerProps) {
  const t = useProjectTranslations();
  const tc = useCommonTranslations();
  const locale = useLocale();

  const formatDate = (value?: string | null) => {
    if (!value) return tc("na");
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return tc("na");
    return date.toLocaleDateString(locale, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <Drawer direction="right" open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <div className="space-y-1">
            <DrawerTitle>{project?.name ?? t("projectDetails")}</DrawerTitle>
            <DrawerDescription>
              {project?.identifier ?? t("projectDetails")}
            </DrawerDescription>
          </div>
          <DrawerClose asChild>
            <Button type="button" variant="ghost" size="icon-sm">
              <X size={16} />
            </Button>
          </DrawerClose>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto p-5">
          {project ? (
            <div className="space-y-5">
              <div className="overflow-hidden rounded-xl border border-border-subtle">
                <CoverImage
                  src={resolveProjectCover(project)}
                  alt={project.name}
                  showDefaultWhenEmpty={false}
                  className="h-40 w-full object-cover"
                />
              </div>

              <div className="rounded-lg border border-border-subtle bg-bg-surface-2 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-txt-tertiary">
                  {t("description")}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-txt-secondary">
                  {project.description?.trim() || t("noDescription")}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg border border-border-subtle p-3">
                  <p className="text-xs text-txt-tertiary">{tc("members")}</p>
                  <p className="mt-1 font-medium text-txt-primary">
                    {membersCount}
                  </p>
                </div>
                <div className="rounded-lg border border-border-subtle p-3">
                  <p className="text-xs text-txt-tertiary">{tc("created")}</p>
                  <p className="mt-1 inline-flex items-center gap-1.5 font-medium text-txt-primary">
                    <Calendar size={13} />
                    {formatDate(project.createdAt)}
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-border-subtle bg-bg-surface-2 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-txt-tertiary">
                  {tc("team")}
                </p>
                {members.length > 0 ? (
                  <div className="mt-3 space-y-2">
                    {members.map((member) => {
                      const name =
                        `${member.user.firstName ?? ""} ${member.user.lastName ?? ""}`.trim() ||
                        member.user.email;
                      return (
                        <div
                          key={member.id}
                          className="flex items-center gap-2 rounded-md bg-bg-surface-1 px-2 py-1.5"
                        >
                          <Avatar
                            src={member.user.avatarUrl}
                            fallback={name}
                            className="size-7"
                          />
                          <div className="min-w-0">
                            <p className="truncate text-sm text-txt-primary">
                              {name}
                            </p>
                            <p className="truncate text-xs text-txt-tertiary">
                              {member.user.email}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-txt-tertiary">
                    {t("noParticipants")}
                  </p>
                )}
              </div>

              {isLoading && (
                <p className="text-sm text-txt-tertiary">
                  {t("loadingProjectDetails")}
                </p>
              )}
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
          ) : (
            <p className="text-sm text-txt-tertiary">
              {t("selectProjectToSeeDetails")}
            </p>
          )}
        </div>

        <DrawerFooter>
          {project && (
            <Link href={`/${workspaceSlug}/projects/${project.identifier}`}>
              <Button className="w-full">{t("goToProject")}</Button>
            </Link>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
