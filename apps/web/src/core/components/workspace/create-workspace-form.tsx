"use client";

import { observer } from "mobx-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useLoading } from "@/components/ui/loading-screen/loading-provider";
import { Select } from "@/components/ui/select";
import { TEAM_SIZES } from "@/core/constants/workspace";
import {
  generateWorkspaceSlug,
  isWorkspaceSlugInputValid,
} from "@/core/helpers/slug.helper";
import { logger } from "@/core/lib/logger";
import { useWorkspace } from "@/core/lib/store-context";
import { cn } from "@/core/lib/utils";
import { createZodResolver } from "@/core/lib/zod-resolver";
import { workspaceService } from "@/core/services/workspace.service";
import {
  type CreateWorkspaceInput,
  CreateWorkspaceSchema,
} from "@/core/validators/workspace.validator";
import { useWorkspaceTranslations } from "@/i18n/hooks";

type Props = {
  onSuccess?: () => void;
};

export const CreateWorkspaceForm = observer(function CreateWorkspaceForm(
  _props: Props,
) {
  const [slugError, setSlugError] = useState(false);
  const [invalidSlug, setInvalidSlug] = useState(false);
  const [isManualSlug, setIsManualSlug] = useState(false);

  const router = useRouter();
  const workspaceStore = useWorkspace();
  const { startLoading, stopLoading } = useLoading();
  const t = useWorkspaceTranslations();

  const {
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting, isValid },
  } = useForm<CreateWorkspaceInput>({
    defaultValues: {
      name: "",
      slug: "",
      teamSize: "",
    },
    mode: "onChange",
    resolver: createZodResolver<CreateWorkspaceInput>(CreateWorkspaceSchema),
  });

  const nameValue = watch("name");

  // Auto-generate slug when name changes (only if user hasn't manually edited slug)
  useEffect(() => {
    if (!isManualSlug && nameValue) {
      const generatedSlug = generateWorkspaceSlug(nameValue);
      setValue("slug", generatedSlug, { shouldValidate: true });
    }
  }, [nameValue, isManualSlug, setValue]);

  const handleCreateWorkspace = async (data: CreateWorkspaceInput) => {
    if (isSubmitting) return;
    startLoading();

    try {
      // Check if slug is available
      const slugCheck = await workspaceService.checkSlug(data.slug);

      if (!slugCheck.available) {
        setSlugError(true);
        return;
      }

      setSlugError(false);

      // Create workspace
      const workspace = await workspaceStore.createWorkspace({
        name: data.name,
        slug: data.slug,
        teamSize: data.teamSize,
        useCase: "WORK",
      });

      // Redirect to the new workspace
      if (workspace?.slug) {
        router.push(`/${workspace.slug}`);
      } else {
        // Fallback: fetch workspaces and redirect to the first one
        const workspaces = await workspaceStore.fetchWorkspaces();
        if (workspaces && workspaces.length > 0) {
          router.push(`/${workspaces[0].slug}`);
        }
      }
    } catch (error: unknown) {
      logger.error("Failed to create workspace:", error);
      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as { response?: unknown }).response === "object"
      ) {
        const response = (
          error as { response?: { data?: { statusCode?: number } } }
        ).response;
        if (response?.data?.statusCode === 409) {
          setSlugError(true);
        }
      }
      if (error instanceof Error && error.message.includes("409")) {
        setSlugError(true);
      }
    } finally {
      stopLoading();
    }
  };

  const isButtonDisabled = !isValid || invalidSlug || isSubmitting;

  return (
    <form
      onSubmit={handleSubmit(handleCreateWorkspace)}
      className="flex flex-col gap-6"
    >
      <div className="flex flex-col gap-5">
        {/* Name field */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="name"
            className="text-13 font-medium text-(--txt-tertiary)"
          >
            {t("name")} <span className="text-red-500">*</span>
          </label>
          <Controller
            control={control}
            name="name"
            render={({ field }) => (
              <div className="relative flex items-center">
                <input
                  {...field}
                  id="name"
                  placeholder={t("namePlaceholder")}
                  className={cn(
                    "h-10 w-full rounded-md border border-(--border-strong) bg-bg-surface-1 px-3 py-2 text-sm text-(--txt-secondary) transition-all duration-200 placeholder:text-(--txt-placeholder) focus:border-transparent focus:ring-2 focus:ring-(--border-accent-strong) focus:outline-none",
                    {
                      "border-(--border-strong)": !errors.name,
                      "border-red-500": errors.name,
                    },
                  )}
                  onChange={(e) => {
                    field.onChange(e);
                    setIsManualSlug(false);
                  }}
                />
              </div>
            )}
          />
          {errors.name && (
            <span className="text-13 text-red-500">{errors.name.message}</span>
          )}
        </div>

        {/* Slug field */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="slug"
            className="text-13 font-medium text-(--txt-tertiary)"
          >
            {t("url")} <span className="text-red-500">*</span>
          </label>
          <Controller
            control={control}
            name="slug"
            render={({ field }) => (
              <div
                className={cn(
                  "flex h-10 w-full items-center rounded-md border border-(--border-strong) bg-bg-surface-1 px-3 text-(--txt-secondary) transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-(--border-accent-strong) focus:outline-none",
                  {
                    "border-(--border-strong)": !errors.slug,
                    "border-red-500": errors.slug,
                  },
                )}
              >
                <span className="whitespace-nowrap text-sm text-(--txt-secondary)">
                  {typeof window !== "undefined" && window.location.host}/
                </span>
                <input
                  {...field}
                  id="slug"
                  placeholder={t("urlPlaceholder")}
                  className="h-full w-full border-none bg-transparent text-sm text-(--txt-secondary) outline-none placeholder:text-(--txt-placeholder)"
                  onChange={(e) => {
                    const value = e.target.value;
                    const isValid = isWorkspaceSlugInputValid(value);
                    setInvalidSlug(!isValid);
                    setIsManualSlug(true);
                    field.onChange(value.toLowerCase());
                  }}
                />
              </div>
            )}
          />
          <p className="text-xs text-(--txt-tertiary)">{t("urlDescription")}</p>
          {slugError && (
            <p className="-mt-2 text-xs text-red-500">{t("urlTaken")}</p>
          )}
          {invalidSlug && (
            <p className="text-xs text-red-500">{t("urlInvalid")}</p>
          )}
          {errors.slug && !invalidSlug && !slugError && (
            <span className="text-xs text-red-500">{errors.slug.message}</span>
          )}
        </div>

        {/* Team size field */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="teamSize"
            className="text-13 font-medium text-(--txt-tertiary)"
          >
            {t("teamSize")} <span className="text-red-500">*</span>
          </label>
          <Controller
            control={control}
            name="teamSize"
            render={({ field }) => (
              <Select
                {...field}
                id="teamSize"
                className="h-10 w-full rounded-md border border-(--border-strong) bg-bg-surface-1 px-3 py-2 text-sm text-(--txt-secondary) transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-(--border-accent-strong) focus:outline-none"
              >
                <option value="" disabled className="text-(--txt-placeholder)">
                  {t("selectTeamSize")}
                </option>
                {TEAM_SIZES.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </Select>
            )}
          />
          {errors.teamSize && (
            <span className="text-xs text-red-500">
              {errors.teamSize.message}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={isSubmitting}
          className="flex-1 rounded-md border border-(--border-subtle) bg-bg-surface-1 px-4 py-2 text-sm font-medium text-(--txt-primary) transition-colors hover:bg-bg-surface-2 disabled:opacity-50"
        >
          {t("cancel")}
        </button>
        <button
          type="submit"
          disabled={isButtonDisabled}
          className="flex-1 rounded-md bg-bg-accent-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-bg-accent-primary-hover disabled:opacity-50"
        >
          {isSubmitting ? t("creating") : t("create")}
        </button>
      </div>
    </form>
  );
});
