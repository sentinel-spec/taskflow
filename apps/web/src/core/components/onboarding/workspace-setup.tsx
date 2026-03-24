"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { logger } from "@/core/lib/logger";
import { useWorkspace } from "@/core/lib/store-context";
import { createZodResolver } from "@/core/lib/zod-resolver";
import { generateSlug, isValidSlug } from "@/core/utils/slug";
import {
  type OnboardingWorkspaceInput,
  OnboardingWorkspaceSchema,
} from "@/core/validators/workspace.validator";
import {
  WorkspaceNameField,
  WorkspaceSetupIntro,
  WorkspaceSlugField,
  WorkspaceSubmitButton,
  WorkspaceTeamSizeField,
  WorkspaceUseCaseField,
} from "./workspace-setup-sections";

const WORKSPACE_SLUG_MIN_LENGTH = 3;
const WORKSPACE_SLUG_MAX_LENGTH = 50;

export function WorkspaceSetup({ onComplete }: { onComplete: () => void }) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    clearErrors,
    control,
    formState: { errors },
  } = useForm<OnboardingWorkspaceInput>({
    defaultValues: {
      name: "",
      slug: "",
      teamSize: "",
      useCase: "WORK",
    },
    resolver: createZodResolver<OnboardingWorkspaceInput>(
      OnboardingWorkspaceSchema,
    ),
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [isManualSlug, setIsManualSlug] = useState(false);
  const workspaceStore = useWorkspace();

  const workspaceName = watch("name");
  const workspaceSlug = watch("slug");

  // Auto-generate slug from name
  useEffect(() => {
    if (!isManualSlug && workspaceName) {
      const slug = generateSlug(workspaceName, WORKSPACE_SLUG_MAX_LENGTH);
      setValue("slug", slug, { shouldValidate: true });
    }
  }, [workspaceName, isManualSlug, setValue]);

  // Check slug availability (debounced)
  useEffect(() => {
    const timer = setTimeout(async () => {
      const normalizedSlug = (workspaceSlug || "").trim();
      const hasValidFormat = isValidSlug(normalizedSlug);

      if (normalizedSlug.length === 0) {
        clearErrors("slug");
        return;
      }

      if (!hasValidFormat) {
        setError("slug", {
          type: "manual",
          message: "Use lowercase letters, numbers and hyphens only",
        });
        return;
      }

      if (normalizedSlug.length < WORKSPACE_SLUG_MIN_LENGTH) {
        setError("slug", {
          type: "manual",
          message: `At least ${WORKSPACE_SLUG_MIN_LENGTH} characters`,
        });
        return;
      }

      if (normalizedSlug.length > WORKSPACE_SLUG_MAX_LENGTH) {
        setError("slug", {
          type: "manual",
          message: `No more than ${WORKSPACE_SLUG_MAX_LENGTH} characters`,
        });
        return;
      }

      if (normalizedSlug.length >= WORKSPACE_SLUG_MIN_LENGTH) {
        setIsCheckingSlug(true);
        try {
          const res = await workspaceStore.checkSlug(normalizedSlug);
          if (!res.available) {
            setError("slug", {
              type: "manual",
              message: "This URL is already taken",
            });
          } else {
            clearErrors("slug");
          }
        } catch (error) {
          logger.error("Slug check failed", error);
        } finally {
          setIsCheckingSlug(false);
        }
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [workspaceSlug, workspaceStore, setError, clearErrors]);

  const onSubmit = async (data: OnboardingWorkspaceInput) => {
    setIsSubmitting(true);
    try {
      await workspaceStore.createWorkspace({
        ...data,
        slug: generateSlug(data.slug, WORKSPACE_SLUG_MAX_LENGTH),
      });
      onComplete();
    } catch (error: unknown) {
      const status =
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as { response?: unknown }).response === "object"
          ? (error as { response?: { status?: number } }).response?.status
          : undefined;

      if (status === 409) {
        setError("slug", {
          type: "manual",
          message: "This URL is already taken",
        });
      } else {
        logger.error("Failed to create workspace", error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const nameField = register("name");
  const slugField = register("slug");
  const teamSizeField = register("teamSize");

  return (
    <div className="flex flex-col gap-8">
      <WorkspaceSetupIntro />

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <WorkspaceNameField
          nameField={nameField}
          error={errors.name}
          onNameChange={() => setIsManualSlug(false)}
        />

        <WorkspaceSlugField
          slugField={slugField}
          error={errors.slug}
          workspaceSlug={workspaceSlug || ""}
          isCheckingSlug={isCheckingSlug}
          onSlugInput={(rawValue) => {
            setIsManualSlug(true);
            setValue(
              "slug",
              generateSlug(rawValue, WORKSPACE_SLUG_MAX_LENGTH),
              {
                shouldValidate: true,
                shouldDirty: true,
              },
            );
          }}
        />

        <WorkspaceTeamSizeField teamSizeField={teamSizeField} />
        <WorkspaceUseCaseField control={control} />

        <WorkspaceSubmitButton
          isSubmitting={isSubmitting}
          disabled={isSubmitting || !!errors.slug || isCheckingSlug}
        />
      </form>
    </div>
  );
}
