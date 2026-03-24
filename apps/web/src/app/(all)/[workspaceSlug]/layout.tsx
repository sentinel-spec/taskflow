"use client";

import { X } from "lucide-react";
import { observer } from "mobx-react";
import { useParams } from "next/navigation";
import type React from "react";
import { useEffect, useState } from "react";
import { AppRail } from "@/core/components/navigation/app-rail";
import { TopNavigation } from "@/core/components/navigation/top-navigation";
import { WorkspaceSidebar } from "@/core/components/navigation/workspace-sidebar";
import { PageHeader } from "@/core/components/workspace/page-header";
import { PageHeaderProvider } from "@/core/components/workspace/page-header-context";
import { logger } from "@/core/lib/logger";
import { useWorkspace } from "@/core/lib/store-context";
import { cn } from "@/core/lib/utils";

export default observer(function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { workspaceSlug } = useParams();
  const workspaceStore = useWorkspace();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (workspaceSlug) {
      void workspaceStore
        .getWorkspaceBySlug(workspaceSlug.toString())
        .catch((error) => {
          logger.error("Failed to load workspace in layout", error);
        });
    }
  }, [workspaceSlug, workspaceStore]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, []);

  return (
    <PageHeaderProvider>
      <div className="flex h-screen w-full flex-col overflow-hidden bg-bg-canvas">
        {/* Top Header - Fixed height, sticky */}
        <div className="shrink-0">
          <TopNavigation
            onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            showMenuButton={true}
          />
        </div>

        <div className="relative flex flex-1 overflow-hidden">
          {/* App Rail - Fixed width, sticky, hidden on mobile */}
          <div className="hidden md:block shrink-0">
            <AppRail />
          </div>

          {/* Main Content Area */}
          <div className="relative flex flex-1 overflow-hidden rounded-tl-xl border-l border-t border-border-subtle bg-bg-surface-1 shadow-[0_-2px_10px_rgba(0,0,0,0.02)]">
            {/* Workspace Sidebar - Fixed width, sticky, hidden on mobile */}
            <div className="hidden lg:block shrink-0">
              <WorkspaceSidebar />
            </div>

            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
              <button
                type="button"
                aria-label="Close mobile navigation overlay"
                className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                onClick={() => setIsMobileMenuOpen(false)}
              />
            )}

            {/* Mobile Sidebar */}
            <div
              className={cn(
                "fixed inset-y-0 left-0 z-50 w-72 transform bg-bg-surface-1 shadow-xl transition-transform duration-300 ease-in-out lg:hidden",
                isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
              )}
            >
              <div className="flex h-full flex-col">
                {/* Mobile sidebar header */}
                <div className="flex items-center justify-between border-b border-border-subtle px-4 py-3">
                  <h2 className="text-sm font-semibold text-txt-primary">
                    Navigation
                  </h2>
                  <button
                    type="button"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="rounded p-1 text-txt-tertiary hover:bg-bg-surface-2 hover:text-txt-primary"
                  >
                    <X size={20} />
                  </button>
                </div>
                {/* Mobile sidebar content */}
                <div className="flex-1 overflow-y-auto p-4">
                  <WorkspaceSidebar />
                </div>
              </div>
            </div>

            {/* Scrollable Content Area */}
            <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
              {/* Page Header - Sticky within content area */}
              <div className="shrink-0">
                <PageHeader />
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-auto">
                <div className="min-w-full p-4 md:p-6 lg:p-8">{children}</div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </PageHeaderProvider>
  );
});
