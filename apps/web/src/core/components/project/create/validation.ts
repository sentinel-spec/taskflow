export function getProjectCreateErrorMessage(
  error: unknown,
  projectName: string,
): string {
  const errorMessage =
    error instanceof Error ? error.message : "Failed to create project";

  if (
    errorMessage.includes("already exists") ||
    errorMessage.includes("duplicate") ||
    errorMessage.includes("unique")
  ) {
    return `A project with the name "${projectName}" already exists. Please try a different name.`;
  }

  return errorMessage;
}
