"use client";

import type { AxiosError } from "axios";
import { Eye, EyeOff, XCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { EAuthModes } from "@/core/constants/auth";
import { useUser } from "@/core/lib/store-context";
import { createZodResolver } from "@/core/lib/zod-resolver";
import {
  type AuthPasswordInput,
  AuthPasswordSchema,
} from "@/core/validators/auth.validator";
import { useAuthTranslations, useCommonTranslations } from "@/i18n/hooks";

type TPasswordForm = {
  mode: EAuthModes;
  email: string;
  onSuccess: () => void;
  onBack: () => void;
};

export function AuthPasswordForm({
  mode,
  email,
  onSuccess,
  onBack,
}: TPasswordForm) {
  const schema = useMemo(
    () =>
      AuthPasswordSchema.superRefine((value, context) => {
        if (
          mode === EAuthModes.SIGN_UP &&
          value.confirm_password !== value.password
        ) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["confirm_password"],
            message: "Passwords do not match",
          });
        }
      }),
    [mode],
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthPasswordInput>({
    resolver: createZodResolver<AuthPasswordInput>(schema),
    defaultValues: {
      password: "",
      confirm_password: "",
    },
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const userStore = useUser();
  const t = useAuthTranslations();
  const tc = useCommonTranslations();

  const onSubmit = async (password: string) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      if (mode === EAuthModes.SIGN_UP) {
        await userStore.register({ email, password });
      } else {
        await userStore.login({ email, password });
      }
      onSuccess();
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string | string[] }>;
      const backendMessage = axiosError.response?.data?.message;
      const message = Array.isArray(backendMessage)
        ? backendMessage.join(", ")
        : backendMessage;
      setSubmitError(
        message || "Ошибка авторизации. Проверь данные и попробуй снова.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit((data) => onSubmit(data.password))}
      className="flex flex-col gap-4"
    >
      {/* Email Display */}
      <div className="flex flex-col gap-1">
        <label
          htmlFor="auth-email-readonly"
          className="text-xs font-medium text-txt-tertiary uppercase"
        >
          {t("emailAddress")}
        </label>
        <div className="relative flex items-center">
          <input
            id="auth-email-readonly"
            value={email}
            readOnly
            className="input-base w-full pr-10 opacity-70 bg-bg-surface-2"
          />
          <button
            type="button"
            onClick={onBack}
            className="absolute right-3 text-txt-placeholder hover:text-txt-secondary"
          >
            <XCircle size={16} />
          </button>
        </div>
      </div>

      {/* Password Field */}
      <div className="flex flex-col gap-1">
        <label
          htmlFor="auth-password"
          className="text-xs font-medium text-txt-tertiary uppercase"
        >
          {mode === EAuthModes.SIGN_UP ? t("setPassword") : t("password")}
        </label>
        <div className="relative flex items-center">
          <input
            {...register("password")}
            id="auth-password"
            type={showPassword ? "text" : "password"}
            placeholder={t("passwordPlaceholder")}
            className="input-base w-full pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 text-txt-placeholder hover:text-txt-secondary"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.password && (
          <span className="text-xs text-red-500">
            {String(errors.password.message)}
          </span>
        )}
      </div>

      {/* Confirm Password Field (Sign Up Only) */}
      {mode === EAuthModes.SIGN_UP && (
        <div className="flex flex-col gap-1">
          <label
            htmlFor="auth-confirm-password"
            className="text-xs font-medium text-txt-tertiary uppercase"
          >
            {t("confirmPassword")}
          </label>
          <div className="relative flex items-center">
            <input
              {...register("confirm_password")}
              id="auth-confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              placeholder={t("passwordPlaceholder")}
              className="input-base w-full pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 text-txt-placeholder hover:text-txt-secondary"
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.confirm_password && (
            <span className="text-xs text-red-500">
              {String(errors.confirm_password.message)}
            </span>
          )}
        </div>
      )}

      {submitError && (
        <span className="text-xs text-red-500">{submitError}</span>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary w-full shadow-sm disabled:opacity-50 mt-2"
      >
        {isSubmitting
          ? mode === EAuthModes.SIGN_UP
            ? tc("creating")
            : tc("signingIn")
          : mode === EAuthModes.SIGN_UP
            ? t("createAccount")
            : t("signIn")}
      </button>
    </form>
  );
}
