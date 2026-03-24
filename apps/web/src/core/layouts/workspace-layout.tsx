"use client";

import { observer } from "mobx-react";
import type React from "react";
import { AppRail } from "../components/navigation/app-rail";
import { TopNavigation } from "../components/navigation/top-navigation";

export const WorkspaceLayout = observer(function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-bg-canvas">
      {/* Top Navigation */}
      <TopNavigation />

      <div className="relative flex h-full w-full overflow-hidden">
        {/* App Rail (Left Sidebar) */}
        <AppRail />

        {/* Main Content Area */}
        <main className="relative h-full w-full grow overflow-y-auto p-4 transition-all duration-300 ease-in-out">
          {children}
        </main>
      </div>
    </div>
  );
});
