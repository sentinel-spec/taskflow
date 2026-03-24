"use client";

import type { AxiosError } from "axios";
import { Mail } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useUser } from "@/core/lib/store-context";
import { createZodResolver } from "@/core/lib/zod-resolver";
import {
  type AuthEmailInput,
  AuthEmailSchema,
} from "@/core/validators/auth.validator";
import { useAuthTranslations, useCommonTranslations } from "@/i18n/hooks";

type TEmailForm = {
  onSubmit: (email: string, exists: boolean) => void;
  initialEmail?: string;
};

export function AuthEmailForm({ onSubmit, initialEmail }: TEmailForm) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthEmailInput>({
    defaultValues: { email: initialEmail || "" },
    resolver: createZodResolver<AuthEmailInput>(AuthEmailSchema),
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const userStore = useUser();
  const t = useAuthTranslations();
  const tc = useCommonTranslations();

  const onFormSubmit = async (data: AuthEmailInput) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const response = await userStore.checkEmail(data.email);
      onSubmit(data.email, Boolean(response?.exists));
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string | string[] }>;
      const backendMessage = axiosError.response?.data?.message;
      const message = Array.isArray(backendMessage)
        ? backendMessage.join(", ")
        : backendMessage;

      setSubmitError(
        message || tc("serverConnectionError"),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label
          htmlFor="auth-email"
          className="text-xs font-medium text-(--txt-tertiary) uppercase"
        >
          {t("emailAddress")}
        </label>
        <div className="relative flex items-center">
          <Mail
            className="absolute left-3 text-(--txt-placeholder)"
            size={16}
          />
          <input
            {...register("email")}
            id="auth-email"
            type="email"
            placeholder={t("emailPlaceholder")}
            className="input-base w-full pl-10"
          />
        </div>
        {errors.email && (
          <span className="text-xs text-red-500">{errors.email.message}</span>
        )}
        {submitError && (
          <span className="text-xs text-red-500">{submitError}</span>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary w-full shadow-sm disabled:opacity-50"
      >
        {isSubmitting ? tc("checking") : tc("continue")}
      </button>
    </form>
  );
}
