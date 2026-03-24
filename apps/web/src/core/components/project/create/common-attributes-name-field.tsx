"use client";

import {
  type Control,
  Controller,
  type UseFormSetValue,
} from "react-hook-form";
import { Input } from "@/components/ui/input";
import { cn } from "@/core/lib/utils";
import { generateSlug } from "@/core/utils/slug";
import type { ProjectFormData } from "./types";

type Props = {
  control: Control<ProjectFormData>;
  setValue: UseFormSetValue<ProjectFormData>;
  hasNameError: boolean;
  nameErrorMessage?: string;
};

export function ProjectCommonNameField({
  control,
  setValue,
  hasNameError,
  nameErrorMessage,
}: Props) {
  return (
    <div className="md:col-span-4">
      <Controller
        control={control}
        name="name"
        rules={{
          required: "Project name is required",
          maxLength: {
            value: 255,
            message: "Title should be less than 255 characters",
          },
        }}
        render={({ field: { value, onChange } }) => (
          <Input
            id="name"
            name="name"
            type="text"
            value={value}
            onChange={(event) => {
              const nextName = event.target.value;
              onChange(nextName);
              setValue("identifier", generateSlug(nextName), {
                shouldDirty: true,
                shouldValidate: true,
              });
            }}
            placeholder="Project Name"
            className={cn("w-full", hasNameError && "border-red-500")}
          />
        )}
      />
      {nameErrorMessage && (
        <span className="text-xs text-red-600">{nameErrorMessage}</span>
      )}
    </div>
  );
}
