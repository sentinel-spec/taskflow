"use client";

import { CircleDot, Layers, LayoutGrid, RefreshCcw, Star } from "lucide-react";
import { useNavigationTranslations } from "@/i18n/hooks";
import { SidebarItem } from "./sidebar-item";

type GlobalNavigationProps = {
  workspaceSlug: string;
  pathname: string;
};

export function GlobalNavigation({
  workspaceSlug,
  pathname,
}: GlobalNavigationProps) {
  const t = useNavigationTranslations();

  return (
    <div className="flex flex-col gap-1">
      <SidebarItem
        icon={LayoutGrid}
        label={t("dashboard")}
        href={`/${workspaceSlug}`}
        isActive={pathname === `/${workspaceSlug}`}
      />
      <SidebarItem
        icon={CircleDot}
        label={t("issues")}
        href={`/${workspaceSlug}/issues`}
        isActive={pathname.includes("/issues")}
      />
      <SidebarItem
        icon={RefreshCcw}
        label={t("cycles")}
        href={`/${workspaceSlug}/cycles`}
        isActive={pathname.includes("/cycles")}
      />
      <SidebarItem
        icon={Layers}
        label={t("modules")}
        href={`/${workspaceSlug}/modules`}
        isActive={pathname.includes("/modules")}
      />
      <SidebarItem
        icon={Star}
        label={t("views")}
        href={`/${workspaceSlug}/views`}
        isActive={pathname.includes("/views")}
      />
    </div>
  );
}
