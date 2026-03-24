export const WORKSPACE_NAME_MAX_LENGTH = 80;
export const WORKSPACE_NAME_MAX_WORDS = 10;
export const WORKSPACE_SLUG_MAX_LENGTH = 48;

type WorkspaceNameValidationMessages = {
  nameRequired: string;
  nameMaxWords: string;
  nameMaxLength: string;
};

export function validateWorkspaceName(
  value: string,
  messages: WorkspaceNameValidationMessages,
) {
  if (!value || value.trim().length === 0) {
    return messages.nameRequired;
  }

  const wordCount = value.trim().split(/\s+/).length;
  if (wordCount > WORKSPACE_NAME_MAX_WORDS) {
    return messages.nameMaxWords;
  }

  if (value.length > WORKSPACE_NAME_MAX_LENGTH) {
    return messages.nameMaxLength;
  }

  return true;
}
