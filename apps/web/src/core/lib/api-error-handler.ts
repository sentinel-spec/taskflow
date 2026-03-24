import { isAxiosError } from "axios";
import { logger } from "./logger";

type ApiErrorOptions = {
  defaultMessage?: string;
};

function normalizeApiMessage(error: unknown): string | null {
  if (!isAxiosError(error)) return null;

  const responseData = error.response?.data as
    | { error?: string; message?: string | string[] }
    | undefined;

  if (Array.isArray(responseData?.message)) {
    return responseData.message.join(", ");
  }
  if (typeof responseData?.message === "string") {
    return responseData.message;
  }
  if (typeof responseData?.error === "string") {
    return responseData.error;
  }
  if (typeof error.message === "string" && error.message.length > 0) {
    return error.message;
  }
  return null;
}

export function toAppError(
  error: unknown,
  options: ApiErrorOptions = {},
): Error {
  const message =
    normalizeApiMessage(error) ??
    options.defaultMessage ??
    "Something went wrong. Please try again.";

  logger.error("API error:", error);
  return new Error(message);
}
