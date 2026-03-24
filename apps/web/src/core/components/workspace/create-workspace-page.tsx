"use client";

import { observer } from "mobx-react";
import { useWorkspaceTranslations } from "@/i18n/hooks";
import { CreateWorkspaceForm } from "./create-workspace-form";

export default observer(function CreateWorkspacePageContent() {
  const t = useWorkspaceTranslations();

  return (
    <div className="flex w-full grow flex-col items-center justify-center py-12 px-6">
      <div className="relative flex w-full max-w-[480px] flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-(--txt-primary)">
            {t("createNewWorkspaceTitle")}
          </h1>
          <p className="text-sm text-(--txt-secondary)">
            {t("createNewWorkspaceText")}
          </p>
        </div>

        {/* Form */}
        <div>
          <CreateWorkspaceForm />
        </div>

        {/* Footer info */}
        <div className="text-center">
          <p className="text-xs text-(--txt-tertiary)">
            {t("createNewWorkspaceInfo")}
          </p>
        </div>
      </div>
    </div>
  );
});
