"use client";

import {
  FormProvider,
  type SubmitHandler,
  type UseFormReturn,
} from "react-hook-form";
import { ProjectAttributes } from "./attributes";
import { ProjectCommonAttributes } from "./common-attributes";
import { ProjectCreateHeader } from "./header";
import { ProjectCreateButtons } from "./project-create-buttons";
import type { ProjectFormData } from "./types";

type Props = {
  methods: UseFormReturn<ProjectFormData>;
  handleClose: () => void;
  onSubmit: SubmitHandler<ProjectFormData>;
  isSubmitting: boolean;
  workspaceSlug?: string;
};

export function ProjectCreateFormContent({
  methods,
  handleClose,
  onSubmit,
  isSubmitting,
  workspaceSlug,
}: Props) {
  const {
    handleSubmit,
    watch,
    control,
    setValue,
    getValues,
    formState: { errors },
  } = methods;

  return (
    <FormProvider {...methods}>
      <ProjectCreateHeader
        handleClose={handleClose}
        watch={watch}
        control={control}
        isMobile={false}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-4">
        <div className="space-y-6 pb-5">
          <ProjectCommonAttributes
            workspaceSlug={workspaceSlug}
            control={control}
            setValue={setValue}
            getValues={getValues}
            errors={errors}
          />
          <ProjectAttributes control={control} isMobile={false} />
        </div>
        <ProjectCreateButtons
          handleClose={handleClose}
          isSubmitting={isSubmitting}
        />
      </form>
    </FormProvider>
  );
}
