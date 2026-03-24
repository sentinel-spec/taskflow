"use client";

import { observer } from "mobx-react";
import { usePathname, useRouter } from "next/navigation";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { LogoSpinner } from "@/core/components/common/logo-spinner"; // Assuming a shared spinner
import { logger } from "@/core/lib/logger";
import { useUser, useWorkspace } from "@/core/lib/store-context";
import type { IWorkspace } from "@/core/store/workspace.store";

export const AuthStatusWrapper = observer(function AuthStatusWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const userStore = useUser();
  const workspaceStore = useWorkspace();
  const router = useRouter();
  const pathname = usePathname();
  const requestIdRef = useRef(0);
  const isPublicInvitationPath = pathname === "/workspace-invitations";

  const [hasCheckedStatus, setHasCheckedStatus] = useState(false);

  useEffect(() => {
    const requestId = ++requestIdRef.current;
    let isCancelled = false;

    const checkAuthAndOnboarding = async () => {
      try {
        // Fetch current user
        await userStore.fetchCurrentUser();
        if (isCancelled || requestId !== requestIdRef.current) return;

        // If user is not logged in after fetchCurrentUser, handle redirection
        if (!userStore.isLoggedIn) {
          if (
            pathname !== "/" &&
            pathname !== "/sign-up" &&
            !isPublicInvitationPath
          ) {
            router.push("/");
          }
          return;
        }

        // If logged in, proceed to fetch workspaces and other checks
        const fetchedWorkspaces = await workspaceStore.fetchWorkspaces();
        if (isCancelled || requestId !== requestIdRef.current) return;

        // Logged-in users should not stay on auth input pages.
        if (pathname === "/" || pathname === "/sign-up") {
          const redirectPath =
            fetchedWorkspaces && fetchedWorkspaces.length > 0
              ? `/${fetchedWorkspaces[0].slug}`
              : "/onboarding";
          router.push(redirectPath);
          return;
        }

        // --- Logic to set currentWorkspace based on URL ---
        const workspaceSlugMatch = pathname.match(/^\/([^/]+)/);
        const urlWorkspaceSlug = workspaceSlugMatch
          ? workspaceSlugMatch[1]
          : null;

        if (urlWorkspaceSlug && fetchedWorkspaces) {
          if (
            !workspaceStore.currentWorkspace ||
            workspaceStore.currentWorkspace.slug !== urlWorkspaceSlug
          ) {
            const matchedWorkspace = fetchedWorkspaces.find(
              (ws: IWorkspace) => ws.slug === urlWorkspaceSlug,
            );
            workspaceStore.setCurrentWorkspace(matchedWorkspace || null);
          }
        } else {
          workspaceStore.setCurrentWorkspace(null); // Explicitly clear if no slug in URL
        }
        // --- End of currentWorkspace logic ---
      } catch (error) {
        logger.error("Auth status check failed", error);
      } finally {
        if (!isCancelled && requestId === requestIdRef.current) {
          setHasCheckedStatus(true);
        }
      }
    };

    if (!hasCheckedStatus) {
      checkAuthAndOnboarding();
      return () => {
        isCancelled = true;
      };
    }

    const syncWorkspaceFromPath = () => {
      const workspaceSlugMatch = pathname.match(/^\/([^/]+)/);
      const urlWorkspaceSlug = workspaceSlugMatch
        ? workspaceSlugMatch[1]
        : null;

      if (!urlWorkspaceSlug) {
        workspaceStore.setCurrentWorkspace(null);
        return;
      }

      if (
        !workspaceStore.currentWorkspace ||
        workspaceStore.currentWorkspace.slug !== urlWorkspaceSlug
      ) {
        const matchedWorkspace = workspaceStore.workspaces.find(
          (ws: IWorkspace) => ws.slug === urlWorkspaceSlug,
        );
        workspaceStore.setCurrentWorkspace(matchedWorkspace || null);
      }
    };

    syncWorkspaceFromPath();

    return () => {
      isCancelled = true;
    };
  }, [
    hasCheckedStatus,
    isPublicInvitationPath,
    pathname,
    router,
    userStore,
    workspaceStore,
    workspaceStore.currentWorkspace,
    workspaceStore.workspaces,
  ]);

  // Show a loading spinner until the auth and onboarding status has been checked
  if (!hasCheckedStatus) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LogoSpinner />
      </div>
    );
  }

  return <>{children}</>;
});
