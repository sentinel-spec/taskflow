import type { FieldErrors, FieldValues, Resolver } from "react-hook-form";
import type { z } from "zod";

function issuePathToKey(path: PropertyKey[]): string {
  return path
    .filter(
      (segment): segment is string | number =>
        typeof segment === "string" || typeof segment === "number",
    )
    .map(String)
    .join(".");
}

export function createZodResolver<TFieldValues extends FieldValues>(
  schema: z.ZodTypeAny,
): Resolver<TFieldValues> {
  return async (values) => {
    const parsed = schema.safeParse(values);

    if (parsed.success) {
      return {
        values: parsed.data as TFieldValues,
        errors: {},
      };
    }

    const errors = parsed.error.issues.reduce(
      (acc, issue) => {
        const key = issuePathToKey(issue.path);
        if (!key || acc[key]) return acc;
        acc[key] = {
          type: issue.code,
          message: issue.message,
        };
        return acc;
      },
      {} as Record<string, { type: string; message: string }>,
    );

    return {
      values: {},
      errors: errors as unknown as FieldErrors<TFieldValues>,
    };
  };
}
