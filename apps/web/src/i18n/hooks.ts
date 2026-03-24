"use client";

import { useTranslations } from "next-intl";

export function useAuthTranslations() {
  return useTranslations("auth");
}

export function useWorkspaceTranslations() {
  return useTranslations("workspace");
}

export function useCommonTranslations() {
  return useTranslations("common");
}

export function useOnboardingTranslations() {
  return useTranslations("onboarding");
}

export function useNavigationTranslations() {
  return useTranslations("navigation");
}

export function useValidationTranslations() {
  return useTranslations("validation");
}
