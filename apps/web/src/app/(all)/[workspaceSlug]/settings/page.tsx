"use client";

import { observer } from "mobx-react";
import { useWorkspace } from "@/core/lib/store-context";
import { useWorkspaceTranslations, useSettingsTranslations, useCommonTranslations } from "@/i18n/hooks";

export default observer(function WorkspaceGeneralSettingsPage() {
  const workspaceStore = useWorkspace();
  const workspace = workspaceStore.currentWorkspace;
  const t = useWorkspaceTranslations();
  const ts = useSettingsTranslations();
  const tc = useCommonTranslations();

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6 md:p-8">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-txt-tertiary">
          {ts("title")}
        </p>
        <h1 className="text-2xl font-semibold text-txt-primary">
          {t("workspaceSettings", { workspaceName: workspace?.name || "Workspace" })}
        </h1>
        <p className="text-sm text-txt-secondary">
          {t("workspaceSettingsSubtitle")}
        </p>
      </header>

      <section className="rounded-2xl border border-border-subtle bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-txt-primary">{ts("general")}</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-border-subtle bg-bg-surface-2 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-txt-tertiary">
              {t("workspaceId")}
            </p>
            <p className="mt-1 text-base font-semibold text-txt-primary">
              {workspace?.id ?? "—"}
            </p>
          </div>
          <div className="rounded-xl border border-border-subtle bg-bg-surface-2 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-txt-tertiary">
              {tc("slug")}
            </p>
            <p className="mt-1 text-base font-semibold text-txt-primary">
              {workspace?.slug ?? "—"}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
});
