"use client";

import type { LucideIcon } from "lucide-react";
import Link from "next/link";

type SidebarItemProps = {
  icon: LucideIcon;
  label: string;
  href: string;
  isActive: boolean;
  count?: number;
};

export function SidebarItem({
  icon: Icon,
  label,
  href,
  isActive,
  count,
}: SidebarItemProps) {
  return (
    <Link
      href={href}
      className={`flex items-center justify-between rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
        isActive
          ? "bg-bg-surface-2 text-txt-primary shadow-sm"
          : "text-txt-secondary hover:bg-bg-surface-2 hover:text-txt-primary"
      }`}
    >
      <div className="flex items-center gap-2 truncate">
        <Icon
          size={16}
          className={isActive ? "text-txt-accent-primary" : "text-txt-tertiary"}
        />
        <span className="truncate">{label}</span>
      </div>
      {count !== undefined && count > 0 && (
        <span className="text-xs text-txt-tertiary">{count}</span>
      )}
    </Link>
  );
}
