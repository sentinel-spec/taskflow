"use client";

import {
  type Control,
  Controller,
  type FieldError,
  type UseFormRegisterReturn,
} from "react-hook-form";
import type { OnboardingWorkspaceInput } from "@/core/validators/workspace.validator";

const TEAM_SIZES = ["1-10", "11-50", "51-200", "200+"] as const;
const USE_CASES = [
  { label: "Work", value: "WORK" },
  { label: "Personal", value: "PERSONAL" },
  { label: "Study", value: "STUDY" },
  { label: "Other", value: "OTHER" },
] as const;

type NameFieldProps = {
  nameField: UseFormRegisterReturn<"name">;
  error?: FieldError;
  onNameChange: (value: string) => void;
};

type SlugFieldProps = {
  slugField: UseFormRegisterReturn<"slug">;
  error?: FieldError;
  workspaceSlug: string;
  isCheckingSlug: boolean;
  onSlugInput: (value: string) => void;
};

type TeamSizeFieldProps = {
  teamSizeField: UseFormRegisterReturn<"teamSize">;
};

type UseCaseFieldProps = {
  control: Control<OnboardingWorkspaceInput>;
};

type SubmitButtonProps = {
  isSubmitting: boolean;
  disabled: boolean;
};

export function WorkspaceSetupIntro() {
  return (
    <div className="flex flex-col gap-2 text-center">
      <h1 className="text-2xl font-semibold tracking-tight text-txt-primary">
        Create a workspace
      </h1>
      <p className="text-sm text-txt-secondary">
        Workspaces are where your team collaborates.
      </p>
    </div>
  );
}

export function WorkspaceNameField({
  nameField,
  error,
  onNameChange,
}: NameFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor="workspace-name"
        className="text-xs font-medium text-txt-tertiary uppercase"
      >
        Workspace name
      </label>
      <input
        id="workspace-name"
        {...nameField}
        placeholder="Acme Corp"
        className="input-base h-10"
        onChange={(event) => {
          nameField.onChange(event);
          onNameChange(event.target.value);
        }}
      />
      {error && <span className="text-xs text-red-500">{error.message}</span>}
    </div>
  );
}

export function WorkspaceSlugField({
  slugField,
  error,
  workspaceSlug,
  isCheckingSlug,
  onSlugInput,
}: SlugFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor="workspace-slug"
        className="text-xs font-medium text-txt-tertiary uppercase"
      >
        Workspace URL
      </label>
      <div className="flex items-center">
        <div className="bg-bg-surface-2 border border-r-0 border-border-subtle rounded-l-md px-3 py-2 text-xs text-txt-placeholder font-medium h-[38px] flex items-center">
          sensata.app/
        </div>
        <input
          {...slugField}
          id="workspace-slug"
          placeholder="acme-corp"
          className={`input-base h-10 rounded-l-none grow ${error ? "border-red-500 focus:border-red-500" : ""}`}
          onChange={(event) => {
            onSlugInput(event.target.value);
          }}
        />
      </div>
      <p className="text-[11px] text-txt-tertiary">
        URL preview: sensata.app/{workspaceSlug || "your-workspace"}
      </p>
      <p className="text-[11px] text-txt-tertiary">
        3-50 chars, transliteration works for Cyrillic and Unicode.
      </p>
      {isCheckingSlug && (
        <span className="text-xs text-txt-tertiary">
          Checking availability...
        </span>
      )}
      {error && <span className="text-xs text-red-500">{error.message}</span>}
    </div>
  );
}

export function WorkspaceTeamSizeField({ teamSizeField }: TeamSizeFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor="workspace-team-size"
        className="text-xs font-medium text-txt-tertiary uppercase"
      >
        How large is your team?
      </label>
      <select
        id="workspace-team-size"
        {...teamSizeField}
        className="input-base h-10"
      >
        <option value="">Select size</option>
        {TEAM_SIZES.map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </select>
    </div>
  );
}

export function WorkspaceUseCaseField({ control }: UseCaseFieldProps) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-medium text-txt-tertiary uppercase tracking-wider">
        How are you planning to use Sensata?
      </p>
      <Controller
        name="useCase"
        control={control}
        render={({ field }) => (
          <div className="grid grid-cols-2 gap-2">
            {USE_CASES.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => field.onChange(item.value)}
                className={`flex items-center justify-center rounded-md border py-2.5 text-sm font-medium transition-all ${
                  field.value === item.value
                    ? "border-border-accent-strong bg-bg-surface-1 text-txt-primary shadow-sm"
                    : "border-border-strong text-txt-secondary hover:bg-bg-surface-2"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      />
    </div>
  );
}

export function WorkspaceSubmitButton({
  isSubmitting,
  disabled,
}: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="btn-primary mt-2 w-full shadow-sm disabled:opacity-50"
    >
      {isSubmitting ? "Creating..." : "Create Workspace"}
    </button>
  );
}
