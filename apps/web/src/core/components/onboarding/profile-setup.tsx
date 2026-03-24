"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { logger } from "@/core/lib/logger";
import { useUser } from "@/core/lib/store-context";
import { useOnboardingTranslations, useCommonTranslations } from "@/i18n/hooks";

type ProfileSetupFormData = {
  firstName: string;
  lastName?: string;
};

export function ProfileSetup({ onComplete }: { onComplete: () => void }) {
  const t = useOnboardingTranslations();
  const tc = useCommonTranslations();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileSetupFormData>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const userStore = useUser();

  const onSubmit = async (data: ProfileSetupFormData) => {
    setIsSubmitting(true);
    try {
      await userStore.updateMe({
        firstName: data.firstName,
        lastName: data.lastName,
      });
      onComplete();
    } catch (error) {
      logger.error("Failed to update profile", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-txt-primary">
          {t("profileTitle")}
        </h1>
        <p className="text-sm text-txt-secondary">
          {t("profileSubtitle")}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <label
            htmlFor="firstName"
            className="text-xs font-medium text-txt-tertiary uppercase"
          >
            {t("firstName")}
          </label>
          <input
            id="firstName"
            {...register("firstName", { required: tc("required") })}
            placeholder={t("firstNamePlaceholder")}
            className="input-base h-10"
          />
          {errors.firstName && (
            <span className="text-xs text-red-500">
              {errors.firstName.message}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="lastName"
            className="text-xs font-medium text-txt-tertiary uppercase"
          >
            {t("lastName")}
          </label>
          <input
            id="lastName"
            {...register("lastName")}
            placeholder={t("lastNamePlaceholder")}
            className="input-base h-10"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary mt-2 w-full shadow-sm disabled:opacity-50"
        >
          {isSubmitting ? tc("saving") : tc("continue")}
        </button>
      </form>
    </div>
  );
}
