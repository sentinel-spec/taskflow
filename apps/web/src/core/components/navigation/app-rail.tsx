"use client";

import {
  BarChart3,
  FileText,
  Layers,
  LayoutGrid,
  Plus,
  Settings,
  Users,
} from "lucide-react";
import { observer } from "mobx-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useNavigationTranslations } from "@/i18n/hooks";

export const AppRail = observer(function AppRail() {
  const { workspaceSlug } = useParams();
  const pathname = usePathname();
  const t = useNavigationTranslations();

  const navItems = [
    { icon: LayoutGrid, label: t("dashboard"), href: `/${workspaceSlug}` },
    { icon: Layers, label: t("projects"), href: `/${workspaceSlug}/projects` },
    { icon: FileText, label: t("docs"), href: `/${workspaceSlug}/docs` },
    { icon: Users, label: t("members"), href: `/${workspaceSlug}/members` },
    {
      icon: BarChart3,
      label: t("analytics"),
      href: `/${workspaceSlug}/analytics`,
    },
  ];

  return (
    <aside className="z-20 flex w-12 flex-col items-center justify-between bg-bg-canvas py-4 shrink-0">
      <div className="flex flex-col items-center gap-4">
        {/* Quick Action */}
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-white shadow-md bg-bg-accent-primary hover:bg-bg-accent-hover transition-all"
          aria-label={t("createNewProject")}
        >
          <Plus size={20} />
        </button>

        <div className="h-px w-6 bg-border-subtle" />

        {/* Navigation Items */}
        <nav className="flex flex-col gap-3">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all ${
                  isActive
                    ? "bg-bg-surface-1 text-txt-accent-primary shadow-sm"
                    : "text-txt-secondary hover:bg-bg-surface-2 hover:text-txt-primary"
                }`}
                title={item.label}
                aria-label={item.label}
              >
                <item.icon size={20} />
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Actions */}
      <div className="flex flex-col items-center gap-3">
        <Link
          href={`/${workspaceSlug}/settings`}
          className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all ${
            pathname.includes("/settings")
              ? "bg-bg-surface-1 text-txt-accent-primary shadow-sm"
              : "text-txt-secondary hover:bg-bg-surface-2 hover:text-txt-primary"
          }`}
          title={t("settings")}
          aria-label={t("settings")}
        >
          <Settings size={20} />
        </Link>
      </div>
    </aside>
  );
});
