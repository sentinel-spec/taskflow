import { OnboardingClientWrapper } from "@/core/components/onboarding/onboarding-client-wrapper";
import AuthLayout from "@/core/layouts/auth-layout";

export default function OnboardingPage() {
  return (
    <AuthLayout>
      <div className="flex min-h-[500px] w-full max-w-[480px] flex-col justify-center overflow-hidden rounded-xl border-0 bg-transparent shadow-none">
        <OnboardingClientWrapper />
      </div>
    </AuthLayout>
  );
}
