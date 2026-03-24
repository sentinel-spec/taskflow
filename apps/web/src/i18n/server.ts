import { useTranslations } from "next-intl";

export function getAuthTranslations() {
  return useTranslations("auth");
}

export function getWorkspaceTranslations() {
  return useTranslations("workspace");
}

export function getCommonTranslations() {
  return useTranslations("common");
}
