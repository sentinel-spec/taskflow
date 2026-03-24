"use client";

import { observer } from "mobx-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { logger } from "@/core/lib/logger";
import { useWorkspace } from "@/core/lib/store-context";
import { LogoSpinner } from "../common/logo-spinner";
import { InviteMembers } from "./invite-members";
import { ProfileSetup } from "./profile-setup";
import { WorkspaceSetup } from "./workspace-setup";

export enum EOnboardingSteps {
  PROFILE = "PROFILE",
  WORKSPACE = "WORKSPACE",
  INVITE = "INVITE",
}

export const OnboardingRoot = observer(function OnboardingRoot() {
  const [step, setStep] = useState<EOnboardingSteps>(EOnboardingSteps.PROFILE);
  const [isFinishing, setIsFinishing] = useState(false);
  const router = useRouter();
  const workspaceStore = useWorkspace();
  const stepOrder: EOnboardingSteps[] = [
    EOnboardingSteps.PROFILE,
    EOnboardingSteps.WORKSPACE,
    EOnboardingSteps.INVITE,
  ];
  const activeStepIndex = stepOrder.indexOf(step);

  const handleStepChange = (nextStep: EOnboardingSteps) => {
    setStep(nextStep);
  };

  useEffect(() => {
    if (isFinishing) {
      const completeOnboarding = async () => {
        try {
          // Fetch workspaces to get the latest one
          const workspaces = await workspaceStore.fetchWorkspaces();
          if (workspaces && workspaces.length > 0) {
            // Redirect to the first (newly created) workspace
            router.push(`/${workspaces[0].slug}`);
          } else {
            // Fallback to home if no workspace found
            router.push("/");
          }
        } catch (error) {
          logger.error("Failed to complete onboarding", error);
          router.push("/");
        }
      };

      // Add a small delay for visual feedback
      const timer = setTimeout(completeOnboarding, 1500);
      return () => clearTimeout(timer);
    }
  }, [isFinishing, workspaceStore, router]);

  if (isFinishing) {
    return (
      <div className="flex flex-col items-center justify-center p-12 gap-4 h-screen">
        <LogoSpinner />
        <p className="text-sm font-medium text-(--txt-secondary)">
          Wrapping things up...
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center px-6 py-8 sm:px-12">
      <div className="mb-5 flex w-full max-w-[460px] items-center gap-2">
        {stepOrder.map((stepItem, index) => (
          <div
            key={stepItem}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              index <= activeStepIndex
                ? "bg-bg-accent-primary"
                : "bg-bg-surface-2"
            }`}
          />
        ))}
      </div>
      <div className="w-full max-w-[460px]">
        {step === EOnboardingSteps.PROFILE && (
          <ProfileSetup
            onComplete={() => handleStepChange(EOnboardingSteps.WORKSPACE)}
          />
        )}
        {step === EOnboardingSteps.WORKSPACE && (
          <WorkspaceSetup
            onComplete={() => handleStepChange(EOnboardingSteps.INVITE)}
          />
        )}
        {step === EOnboardingSteps.INVITE && (
          <InviteMembers onComplete={() => setIsFinishing(true)} />
        )}
      </div>
    </div>
  );
});
