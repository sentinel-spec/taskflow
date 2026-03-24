import { getTranslations } from "next-intl/server";

export default async function GlobalLoading() {
  const t = await getTranslations("common");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-canvas/90 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-border-subtle border-t-bg-accent-primary" />
        <p className="text-sm font-medium text-txt-tertiary">{t("loading")}</p>
      </div>
    </div>
  );
}
