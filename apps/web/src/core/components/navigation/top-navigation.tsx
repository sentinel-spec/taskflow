"use client";

import { Bell, HelpCircle, Menu } from "lucide-react";
import { observer } from "mobx-react";
import dynamic from "next/dynamic";
import { LanguageDropdown } from "@/components/language-dropdown";
import { useUser } from "@/core/lib/store-context";
import { useNavigationTranslations } from "@/i18n/hooks";
import { WorkspaceDropdown } from "./workspace-dropdown";

const PowerK = dynamic(
  () => import("@/components/ui/power-k").then((module) => module.PowerK),
  { ssr: false },
);

interface TopNavigationProps {
  onMenuClick?: () => void;
  showMenuButton?: boolean;
}

export const TopNavigation = observer(function TopNavigation({
  onMenuClick,
  showMenuButton = false,
}: TopNavigationProps) {
  const userStore = useUser();
  const user = userStore.currentUser;
  const tNav = useNavigationTranslations();

  return (
    <header className="z-30 flex h-12 w-full items-center justify-between bg-bg-canvas px-4">
      <div className="flex items-center gap-3">
        {/* Mobile Menu Button */}
        {showMenuButton && (
          <button
            type="button"
            onClick={onMenuClick}
            className="flex h-8 w-8 items-center justify-center rounded-md text-txt-secondary hover:bg-bg-surface-2 lg:hidden"
            aria-label={tNav("openSidebarMenu")}
          >
            <Menu size={18} />
          </button>
        )}
        <WorkspaceDropdown />
      </div>

      {/* PowerK Search / Command Palette - Hidden on mobile */}
      <div className="hidden sm:block">
        <PowerK />
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="hidden sm:flex h-8 w-8 items-center justify-center rounded-md text-txt-secondary hover:bg-bg-surface-2 transition-colors"
          aria-label={tNav("notifications")}
        >
          <Bell size={18} />
        </button>
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-md text-txt-secondary hover:bg-bg-surface-2 transition-colors"
          aria-label={tNav("help")}
        >
          <HelpCircle size={18} />
        </button>
        <LanguageDropdown />
        <div className="h-6 w-px bg-border-subtle mx-1" />
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-bg-accent-primary text-xs font-medium text-white ring-2 ring-bg-canvas">
          {user?.firstName?.[0] || user?.email?.[0] || "U"}
        </div>
      </div>
    </header>
  );
});
