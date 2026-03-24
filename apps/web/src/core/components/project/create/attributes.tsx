"use client";

import { Check, ChevronDown } from "lucide-react";
import { useState } from "react";
import { type Control, Controller } from "react-hook-form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ProjectNetworkIcon } from "@/core/components/project/project-network-icon";
import { NETWORK_CHOICES } from "@/core/constants/project";
import { cn } from "@/core/lib/utils";
import { useUser } from "@/core/lib/store-context";
import { useProjectTranslations, useCommonTranslations } from "@/i18n/hooks";
import type { ProjectFormData } from "./types";

type Props = {
  control: Control<ProjectFormData>;
  isMobile?: boolean;
};

export function ProjectAttributes({ control }: Props) {
  const userStore = useUser();
  const user = userStore.currentUser;
  const currentUserLeadId = user?.id ? String(user.id) : "me";

  const t = useProjectTranslations();
  const tc = useCommonTranslations();

  const [showNetworkDropdown, setShowNetworkDropdown] = useState(false);
  const [showLeadPopover, setShowLeadPopover] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Network Selector */}
      <Controller
        name="network"
        control={control}
        render={({ field: { onChange, value } }) => {
          const currentNetwork = NETWORK_CHOICES.find((n) => n.key === value);

          return (
            <Popover
              open={showNetworkDropdown}
              onOpenChange={setShowNetworkDropdown}
            >
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="inline-flex h-7 items-center gap-1.5 rounded-md border border-border-subtle bg-bg-surface-1 px-2.5 text-[11px] font-medium text-txt-secondary transition-colors hover:bg-bg-surface-2 hover:text-txt-primary"
                >
                  {currentNetwork && (
                    <ProjectNetworkIcon
                      iconKey={currentNetwork.iconKey}
                      className="h-3.5 w-3.5"
                    />
                  )}
                  <span>{currentNetwork ? t(currentNetwork.key) : t("selectVisibility")}</span>
                  <ChevronDown className="h-3 w-3 opacity-60 shrink-0" />
                </button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-64 p-1.5">
                {NETWORK_CHOICES.map((opt) => (
                  <button
                    type="button"
                    key={opt.key}
                    onClick={() => {
                      onChange(opt.key);
                      setShowNetworkDropdown(false);
                    }}
                    className={cn(
                      "flex w-full items-start justify-between gap-2 rounded-md p-2 text-left transition-colors hover:bg-bg-surface-2",
                      value === opt.key && "bg-bg-surface-2",
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <ProjectNetworkIcon
                        iconKey={opt.iconKey}
                        className="mt-0.5 h-3.5 w-3.5 text-txt-secondary"
                      />
                      <div>
                        <div className="text-sm font-medium text-txt-primary">
                          {t(opt.key)}
                        </div>
                        <div className="text-[11px] text-txt-tertiary">
                          {t(`${opt.key}Description`)}
                        </div>
                      </div>
                    </div>
                    {value === opt.key && (
                      <Check className="mt-0.5 h-3.5 w-3.5 text-txt-primary" />
                    )}
                  </button>
                ))}
              </PopoverContent>
            </Popover>
          );
        }}
      />

      {/* Project Lead Selector */}
      <Controller
        name="projectLead"
        control={control}
        render={({ field: { onChange, value } }) => (
          <Popover open={showLeadPopover} onOpenChange={setShowLeadPopover}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="inline-flex h-7 items-center gap-1.5 rounded-md border border-border-subtle bg-bg-surface-1 px-2.5 text-[11px] font-medium text-txt-secondary transition-colors hover:bg-bg-surface-2 hover:text-txt-primary"
              >
                {value ? (
                  <>
                    <div className="flex h-4 w-4 items-center justify-center rounded bg-custom-primary-100 text-[9px] text-white">
                      {user?.firstName?.[0] || user?.email?.[0] || "U"}
                    </div>
                    <span>{tc("you")}</span>
                  </>
                ) : (
                  <span>{t("lead")}</span>
                )}
                <ChevronDown className="h-3 w-3 opacity-60 shrink-0" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-56 p-1.5">
              <button
                type="button"
                onClick={() => {
                  onChange(currentUserLeadId);
                  setShowLeadPopover(false);
                }}
                className="flex w-full items-center justify-between gap-2 rounded-md p-2 text-left transition-colors hover:bg-bg-surface-2"
              >
                <div className="flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded bg-custom-primary-100 text-[10px] text-white">
                    {user?.firstName?.[0] || user?.email?.[0] || "U"}
                  </div>
                  <div className="text-sm font-medium text-txt-primary">
                    {t("assignToMe")}
                  </div>
                </div>
                {value === currentUserLeadId && (
                  <Check className="h-3.5 w-3.5 text-txt-primary" />
                )}
              </button>
              {value && (
                <button
                  type="button"
                  onClick={() => {
                    onChange(null);
                    setShowLeadPopover(false);
                  }}
                  className="mt-1 flex w-full items-center rounded-md p-2 text-left text-xs text-txt-secondary transition-colors hover:bg-bg-surface-2"
                >
                  {t("clearLead")}
                </button>
              )}
            </PopoverContent>
          </Popover>
        )}
      />
    </div>
  );
}
