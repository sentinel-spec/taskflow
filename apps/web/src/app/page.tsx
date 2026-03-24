import { AuthRoot } from "@/core/components/account/auth-forms/auth-root";
import { EAuthModes } from "@/core/constants/auth";
import AuthLayout from "@/core/layouts/auth-layout";

export default function HomePage() {
  return (
    <AuthLayout>
      <AuthRoot initialAuthMode={EAuthModes.SIGN_IN} />
    </AuthLayout>
  );
}
