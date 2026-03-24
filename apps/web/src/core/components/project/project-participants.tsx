"use client";

import { Avatar } from "@/components/ui/avatar";
import type { ProjectMemberDto } from "@/core/types/dto/project.dto";

type ProjectParticipantsProps = {
  members: ProjectMemberDto[];
  maxVisible?: number;
  className?: string;
};

const formatDate = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const formatUserName = (member: ProjectMemberDto) => {
  const user = member.user;
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");
  return fullName || user.email;
};

export function ProjectParticipants({
  members,
  maxVisible = 5,
  className,
}: ProjectParticipantsProps) {
  if (!members.length) {
    return null;
  }

  const visibleMembers = members.slice(0, maxVisible);
  const hasHiddenMembers = members.length > maxVisible;

  return (
    <div className={className}>
      <div className="flex items-center -space-x-2">
        {visibleMembers.map((member) => {
          const displayName = formatUserName(member);
          return (
            <div key={member.id} className="group relative">
              <Avatar
                src={member.user.avatarUrl}
                fallback={displayName}
                alt={displayName}
                className="size-9 border-2 border-white bg-bg-surface-2 text-[11px] shadow-sm"
              />

              <div className="pointer-events-none absolute bottom-[calc(100%+10px)] left-1/2 z-30 hidden w-56 -translate-x-1/2 rounded-md border border-border-subtle bg-bg-surface-1 p-3 text-left shadow-xl group-hover:block">
                <p className="text-sm font-semibold text-txt-primary">
                  {displayName}
                </p>
                <p className="text-xs text-txt-secondary">
                  {member.user.email}
                </p>
                <p className="mt-1 text-xs text-txt-tertiary">
                  В проекте с {formatDate(member.createdAt)}
                </p>
              </div>
            </div>
          );
        })}

        {hasHiddenMembers ? (
          <div className="ml-2 flex h-9 min-w-11 items-center justify-center rounded-full border border-border-subtle bg-bg-surface-2 px-2 text-xs font-semibold text-txt-secondary">
            +...
          </div>
        ) : null}
      </div>
    </div>
  );
}
