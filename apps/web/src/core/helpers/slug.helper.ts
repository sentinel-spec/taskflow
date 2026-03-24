import { generateSlug, isValidSlug } from "@/core/utils/slug";

export const WORKSPACE_SLUG_INPUT_REGEX = /^[a-z0-9-]*$/;

export function generateWorkspaceSlug(name: string): string {
  return generateSlug(name);
}

export function isWorkspaceSlugInputValid(value: string): boolean {
  return WORKSPACE_SLUG_INPUT_REGEX.test(value);
}

export function isWorkspaceSlugValid(slug: string): boolean {
  return isValidSlug(slug);
}
