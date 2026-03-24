"use client";

import { observer } from "mobx-react";
import { useWorkspace } from "@/core/lib/store-context";

export default observer(function WorkspaceGeneralSettingsPage() {
  const workspaceStore = useWorkspace();
  const workspace = workspaceStore.currentWorkspace;

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6 md:p-8">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-txt-tertiary">
          Settings
        </p>
        <h1 className="text-2xl font-semibold text-txt-primary">
          {workspace?.name || "Workspace"} settings
        </h1>
        <p className="text-sm text-txt-secondary">
          Manage basic workspace details and access context.
        </p>
      </header>

      <section className="rounded-2xl border border-border-subtle bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-txt-primary">General info</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-border-subtle bg-bg-surface-2 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-txt-tertiary">
              Workspace ID
            </p>
            <p className="mt-1 text-base font-semibold text-txt-primary">
              {workspace?.id ?? "—"}
            </p>
          </div>
          <div className="rounded-xl border border-border-subtle bg-bg-surface-2 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-txt-tertiary">
              Slug
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
