"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useLoading } from "@/components/ui/loading-screen/loading-provider";
import { logger } from "@/core/lib/logger";
import { useWorkspace } from "@/core/lib/store-context";
import { LogoSpinner } from "../common/logo-spinner";
import { OnboardingRoot } from "./onboarding-root";

export function OnboardingClientWrapper() {
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();
  const workspaceStore = useWorkspace();
  const { startLoading, stopLoading } = useLoading();

  useEffect(() => {
    // Check if user is authenticated and has workspaces
    const checkAuth = async () => {
      startLoading();
      const token = localStorage.getItem("access_token");

      if (!token) {
        // Not authenticated, redirect to sign in
        router.push("/sign-in");
        stopLoading();
        return;
      }

      try {
        // Check if user already has workspaces
        const workspaces = await workspaceStore.fetchWorkspaces();
        if (workspaces && workspaces.length > 0) {
          // User already has a workspace, redirect to it
          router.push(`/${workspaces[0].slug}`);
          return;
        }
      } catch (error) {
        logger.error("Failed to check workspaces", error);
      } finally {
        setIsChecking(false);
        stopLoading();
      }
    };

    checkAuth();
  }, [workspaceStore, router, startLoading, stopLoading]);

  if (isChecking) {
    return (
      <div className="flex flex-col items-center justify-center p-12 gap-4">
        <LogoSpinner />
        <p className="text-sm font-medium text-(--txt-secondary)">Loading...</p>
      </div>
    );
  }

  return <OnboardingRoot />;
}
