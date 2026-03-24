"use client";

import { Plus } from "lucide-react";
import { useAuthTranslations } from "@/i18n/hooks";

export function SidebarNewIssueButton() {
  const t = useAuthTranslations();
  return (
    <button
      type="button"
      className="flex w-full items-center justify-between rounded-md border border-border-subtle bg-bg-surface-2 px-3 py-1.5 text-sm font-medium text-txt-secondary transition-all hover:bg-bg-surface-1"
    >
      <div className="flex items-center gap-2">
        <Plus size={14} />
        <span>{t("newIssue")}</span>
      </div>
      <div className="flex items-center gap-1 rounded border border-border-subtle bg-white px-1 py-0.5 text-[10px]">
        C
      </div>
    </button>
  );
}
