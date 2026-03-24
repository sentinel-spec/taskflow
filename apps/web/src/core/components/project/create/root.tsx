"use client";

import { isAxiosError } from "axios";
import { observer } from "mobx-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useLoading } from "@/components/ui/loading-screen/loading-provider";
import { getRandomCoverImage } from "@/core/helpers/cover-image.helper";
import { logger } from "@/core/lib/logger";
import { useWorkspace } from "@/core/lib/store-context";
import { setToast, TOAST_TYPE } from "@/core/lib/toast";
import { createZodResolver } from "@/core/lib/zod-resolver";
import { generateSlug } from "@/core/utils/slug";
import { ProjectSchema } from "@/core/validators/project.validator";
import { ProjectCreateFormContent } from "./project-create-form-content";
import type { ProjectFormData } from "./types";
import { getProjectCreateErrorMessage } from "./validation";

type TCreateProjectFormProps = {
  onClose: () => void;
  onSuccess?: (projectId: string) => void;
  workspaceSlug?: string;
};

const getProjectFormValues = (): Partial<ProjectFormData> => ({
  cover_image_url: getRandomCoverImage(),
  description: "",
  logo_props: {
    in_use: "icon",
    icon: {
      name: "folder",
      color: "#6d7b8a",
    },
  },
  name: "",
  identifier: "",
  network: "private",
  projectLead: null,
});

export const CreateProjectForm = observer(function CreateProjectForm(
  props: TCreateProjectFormProps,
) {
  const { onClose, onSuccess, workspaceSlug } = props;
  const workspaceStore = useWorkspace();
  const { startLoading, stopLoading } = useLoading();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const methods = useForm<ProjectFormData>({
    defaultValues: {
      ...getProjectFormValues(),
    } as ProjectFormData,
    reValidateMode: "onChange",
    resolver: createZodResolver<ProjectFormData>(ProjectSchema),
  });

  const { reset } = methods;

  // Reset form with new random cover image when modal opens
  useEffect(() => {
    reset({
      ...getProjectFormValues(),
      cover_image_url: getRandomCoverImage(),
    } as ProjectFormData);
  }, [reset]);

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      reset({
        ...getProjectFormValues(),
        cover_image_url: getRandomCoverImage(),
      } as ProjectFormData);
    }, 300);
  };

  const onSubmit = async (data: ProjectFormData) => {
    logger.debug("CreateProjectForm submit started", { workspaceSlug, data });

    if (!workspaceSlug) {
      logger.error("No workspace slug");
      setToast({
        type: TOAST_TYPE.ERROR,
        title: "Error",
        message: "Workspace not found",
      });
      return;
    }

    setIsSubmitting(true);
    startLoading();

    try {
      // Get workspace to get workspaceId
      const workspace = await workspaceStore.getWorkspaceBySlug(
        workspaceSlug.toString(),
      );

      logger.debug("Workspace response for project create", workspace);

      if (!workspace?.id) {
        logger.error("Workspace not found");
        setToast({
          type: TOAST_TYPE.ERROR,
          title: "Error",
          message: "Workspace not found",
        });
        return;
      }

      logger.debug("Workspace found for project create", {
        workspaceId: workspace.id,
      });

      // Include logo props so backend can save emoji/icon
      const safeIdentifier = generateSlug(data.identifier || data.name);
      const projectData = {
        name: data.name.trim(),
        identifier: safeIdentifier || undefined,
        description: data.description || "",
        coverImage: data.cover_image_url,
        logo_props: data.logo_props,
        isPublic: data.network === "public",
      };

      logger.debug("Creating project with payload", projectData);

      // Create project via store
      const project = await workspaceStore.createProject(
        workspace.id,
        projectData,
      );

      logger.info("Project created successfully", project);

      setToast({
        type: TOAST_TYPE.SUCCESS,
        title: "Success",
        message: "Project created successfully",
      });

      if (onSuccess && project?.id) {
        onSuccess(project.id.toString());
      }

      handleClose();
    } catch (error: unknown) {
      logger.error("Failed to create project:", error);
      if (isAxiosError(error)) {
        logger.error("Error details:", {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message,
          url: error.config?.url,
          method: error.config?.method,
        });
      } else if (error instanceof Error) {
        logger.error("Error details:", {
          name: error.name,
          message: error.message,
          stack: error.stack,
        });
      } else {
        logger.error("Error details:", String(error));
      }
      const displayMessage = getProjectCreateErrorMessage(error, data.name);

      setToast({
        type: TOAST_TYPE.ERROR,
        title: "Error",
        message: displayMessage,
      });
    } finally {
      setIsSubmitting(false);
      stopLoading();
    }
  };

  return (
    <ProjectCreateFormContent
      methods={methods}
      handleClose={handleClose}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
      workspaceSlug={workspaceSlug}
    />
  );
});
