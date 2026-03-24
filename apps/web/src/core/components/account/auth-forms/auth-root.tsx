"use client";

import { observer } from "mobx-react";
import { useState } from "react";
import { EAuthModes, EAuthSteps } from "@/core/constants/auth";
import { useAuthTranslations } from "@/i18n/hooks";
import { AuthFormRoot } from "./form-root";

type TAuthRoot = {
  initialAuthMode?: EAuthModes;
};

export const AuthRoot = observer(function AuthRoot({
  initialAuthMode = EAuthModes.SIGN_IN,
}: TAuthRoot) {
  const [authMode, setAuthMode] = useState<EAuthModes>(initialAuthMode);
  const [authStep, setAuthStep] = useState<EAuthSteps>(EAuthSteps.EMAIL);
  const [email, setEmail] = useState("");
  const t = useAuthTranslations();

  return (
    <div className="flex w-full grow flex-col items-center justify-center py-12 px-6">
      <div className="relative flex w-full max-w-[360px] flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-(--txt-primary)">
            {authMode === EAuthModes.SIGN_UP
              ? t("signUpTitle")
              : t("signInTitle")}
          </h1>
          <p className="text-sm text-(--txt-secondary)">
            {authMode === EAuthModes.SIGN_UP
              ? t("signUpSubtitle")
              : t("signInSubtitle")}
          </p>
        </div>

        {/* Form Root */}
        <AuthFormRoot
          authStep={authStep}
          authMode={authMode}
          email={email}
          setEmail={setEmail}
          setAuthMode={setAuthMode}
          setAuthStep={setAuthStep}
        />

        {/* Footer Link */}
        <div className="text-center text-xs text-(--txt-tertiary)">
          {authMode === EAuthModes.SIGN_IN ? (
            <p>
              {t("dontHaveAccount")}{" "}
              <button
                type="button"
                onClick={() => {
                  setAuthMode(EAuthModes.SIGN_UP);
                  setAuthStep(EAuthSteps.EMAIL);
                }}
                className="text-(--txt-link-primary) font-medium hover:underline"
              >
                {t("signUpLink")}
              </button>
            </p>
          ) : (
            <p>
              {t("alreadyHaveAccount")}{" "}
              <button
                type="button"
                onClick={() => {
                  setAuthMode(EAuthModes.SIGN_IN);
                  setAuthStep(EAuthSteps.EMAIL);
                }}
                className="text-(--txt-link-primary) font-medium hover:underline"
              >
                {t("signInLink")}
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
});
