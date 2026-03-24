"use client";

import { observer } from "mobx-react";
import { Greeting } from "@/components/ui/greeting";
import { useUser, useWorkspace } from "@/core/lib/store-context";

export default observer(function WorkspaceDashboardPage() {
  const workspaceStore = useWorkspace();
  const userStore = useUser();
  const _workspace = workspaceStore.currentWorkspace;
  const user = userStore.currentUser;

  return (
    <div className="h-full w-full overflow-hidden">
      <div className="relative h-full w-full overflow-x-hidden overflow-y-scroll">
        <div className="px-page-x flex flex-col vertical-scrollbar scrollbar-lg h-full w-full overflow-y-auto py-page-y gap-6 bg-surface-2 mx-auto scrollbar-hide px-page-x py-8!">
          <div className="flex flex-col gap-10 max-w-200 mx-auto w-full">
            {/* Greeting Component */}
            <div className="flex flex-col gap-6">
              <Greeting
                userName={user?.firstName || user?.email?.split("@")[0]}
                className="px-6 py-4"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
