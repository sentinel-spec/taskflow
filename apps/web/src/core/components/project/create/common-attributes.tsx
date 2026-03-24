"use client";

import type { AxiosError } from "axios";
import { useState } from "react";
import type {
  Control,
  FieldErrors,
  UseFormGetValues,
  UseFormSetValue,
} from "react-hook-form";
import { logger } from "@/core/lib/logger";
import { useWorkspace } from "@/core/lib/store-context";
import { setToast, TOAST_TYPE } from "@/core/lib/toast";
import { projectService } from "@/core/services/project.service";
import { ProjectCommonDescriptionField } from "./common-attributes-description-field";
import { ProjectCommonNameField } from "./common-attributes-name-field";
import type { ProjectFormData } from "./types";

type ProjectCommonAttributesProps = {
  workspaceSlug?: string;
  control: Control<ProjectFormData>;
  setValue: UseFormSetValue<ProjectFormData>;
  getValues: UseFormGetValues<ProjectFormData>;
  errors: FieldErrors<ProjectFormData>;
};

const normalizeParam = (value?: string | string[]) =>
  Array.isArray(value) ? value[0] : value;

export function ProjectCommonAttributes({
  workspaceSlug,
  control,
  setValue,
  getValues,
  errors,
}: ProjectCommonAttributesProps) {
  const workspaceStore = useWorkspace();
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const resolveWorkspaceId = async () => {
    if (workspaceStore.currentWorkspace?.id) {
      return workspaceStore.currentWorkspace.id;
    }

    const normalizedSlug = normalizeParam(workspaceSlug)?.trim();
    if (!normalizedSlug) {
      return null;
    }

    try {
      const workspace = await workspaceStore.getWorkspaceBySlug(normalizedSlug);
      return workspace?.id ?? null;
    } catch (error) {
      logger.error("Failed to resolve workspace for AI generation", error);
      return null;
    }
  };

  const runGeneration = async (sourcePrompt: string) => {
    const normalizedPrompt = sourcePrompt.trim();
    if (!normalizedPrompt || isGenerating) return;

    setIsGenerating(true);

    try {
      const workspaceId = await resolveWorkspaceId();
      if (!workspaceId) {
        setToast({
          type: TOAST_TYPE.ERROR,
          title: "Workspace not found",
          message: "Reload the page and try again.",
        });
        return;
      }

      const projectName = getValues("name")?.trim() || undefined;
      const result = await projectService.generateDescriptionDraft(
        workspaceId,
        {
          prompt: normalizedPrompt,
          projectName,
        },
      );

      setValue("description", result.generatedText, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });

      setToast({
        type: TOAST_TYPE.SUCCESS,
        title: "Description Generated",
        message: "Draft has been inserted into the description field.",
      });

      setAiPrompt("");
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string | string[] }>;
      const axiosMessage = axiosError.response?.data?.message;
      const message = Array.isArray(axiosMessage)
        ? axiosMessage.join(", ")
        : axiosMessage ||
          axiosError.message ||
          "Failed to generate description. Please try again.";

      setToast({
        type: TOAST_TYPE.ERROR,
        title: "AI Generation Failed",
        message: String(message),
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateDescription = async () => {
    setIsAiOpen(false);
    await runGeneration(aiPrompt);
    setAiPrompt("");
  };

  const handleAiQuickAction = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    if (isGenerating) {
      e.preventDefault();
      return;
    }

    const descriptionPrompt = getValues("description")?.trim();
    if (!descriptionPrompt) {
      return;
    }

    e.preventDefault();
    setIsAiOpen(false);
    await runGeneration(descriptionPrompt);
  };

  return (
    <div className="grid grid-cols-1 gap-x-2 gap-y-3 md:grid-cols-4">
      <ProjectCommonNameField
        control={control}
        setValue={setValue}
        hasNameError={Boolean(errors?.name)}
        nameErrorMessage={
          errors?.name?.message ? String(errors.name.message) : undefined
        }
      />

      <ProjectCommonDescriptionField
        control={control}
        isAiOpen={isAiOpen}
        setIsAiOpen={setIsAiOpen}
        isGenerating={isGenerating}
        aiPrompt={aiPrompt}
        setAiPrompt={setAiPrompt}
        onGenerateDescription={handleGenerateDescription}
        onAiQuickAction={handleAiQuickAction}
      />
    </div>
  );
}
