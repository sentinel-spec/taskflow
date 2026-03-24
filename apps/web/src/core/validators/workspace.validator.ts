import { z } from "zod";
import { isWorkspaceSlugInputValid } from "@/core/helpers/slug.helper";
import { isValidSlug } from "@/core/utils/slug";

const WORKSPACE_SLUG_MIN_LENGTH = 3;
const WORKSPACE_SLUG_MAX_LENGTH = 50;
const WORKSPACE_NAME_MAX_LENGTH = 80;

export const CreateWorkspaceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Required")
    .max(WORKSPACE_NAME_MAX_LENGTH, "Name must be less than 80 characters"),
  slug: z
    .string()
    .trim()
    .min(1, "Required")
    .min(WORKSPACE_SLUG_MIN_LENGTH, "At least 3 characters")
    .max(WORKSPACE_SLUG_MAX_LENGTH, "No more than 50 characters")
    .refine((value) => isWorkspaceSlugInputValid(value), {
      message: "Use lowercase letters, numbers and hyphens only",
    }),
  teamSize: z.string().min(1, "Required"),
});

export const OnboardingWorkspaceSchema = z.object({
  name: z.string().trim().min(1, "Required"),
  slug: z
    .string()
    .trim()
    .min(1, "Required")
    .min(WORKSPACE_SLUG_MIN_LENGTH, "At least 3 characters")
    .max(WORKSPACE_SLUG_MAX_LENGTH, "No more than 50 characters")
    .refine((value) => isValidSlug(value), {
      message: "Use lowercase letters, numbers and hyphens only",
    }),
  teamSize: z.string(),
  useCase: z.string().min(1),
});

export type CreateWorkspaceInput = z.infer<typeof CreateWorkspaceSchema>;
export type OnboardingWorkspaceInput = z.infer<
  typeof OnboardingWorkspaceSchema
>;
