"use client";

import { observer } from "mobx-react";
import { useRouter } from "next/navigation";
import { useLoading } from "@/components/ui/loading-screen/loading-provider";
import { AuthEmailForm } from "@/core/components/account/auth-forms/email";
import { AuthPasswordForm } from "@/core/components/account/auth-forms/password";
import { EAuthModes, EAuthSteps } from "@/core/constants/auth";
import { useUser, useWorkspace } from "@/core/lib/store-context";

type TAuthFormRoot = {
  authStep: EAuthSteps;
  authMode: EAuthModes;
  email: string;
  setEmail: (email: string) => void;
  setAuthMode: (authMode: EAuthModes) => void;
  setAuthStep: (authStep: EAuthSteps) => void;
};

export const AuthFormRoot = observer(function AuthFormRoot(
  props: TAuthFormRoot,
) {
  const { authStep, authMode, email, setEmail, setAuthMode, setAuthStep } =
    props;
  const router = useRouter();
  const _userStore = useUser();
  const workspaceStore = useWorkspace();
  const { startLoading, stopLoading } = useLoading();

  const handleEmailSubmit = (email: string, exists: boolean) => {
    setEmail(email);
    setAuthMode(exists ? EAuthModes.SIGN_IN : EAuthModes.SIGN_UP);
    setAuthStep(EAuthSteps.PASSWORD);
  };

  const handleAuthSuccess = async () => {
    startLoading();
    try {
      // After login/register, check if user has workspaces
      const workspaces = await workspaceStore.fetchWorkspaces();

      if (workspaces && workspaces.length > 0) {
        router.push(`/${workspaces[0].slug}`);
      } else {
        router.push("/onboarding");
      }
    } catch (_error) {
      // Fallback to onboarding if workspace fetch fails
      router.push("/onboarding");
    } finally {
      stopLoading();
    }
  };

  if (authStep === EAuthSteps.EMAIL) {
    return <AuthEmailForm onSubmit={handleEmailSubmit} initialEmail={email} />;
  }

  if (authStep === EAuthSteps.PASSWORD) {
    return (
      <AuthPasswordForm
        email={email}
        mode={authMode}
        onSuccess={handleAuthSuccess}
        onBack={() => setAuthStep(EAuthSteps.EMAIL)}
      />
    );
  }

  return null;
});
