"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { logger } from "@/core/lib/logger";
import { useUser } from "@/core/lib/store-context";

type ProfileSetupFormData = {
  firstName: string;
  lastName?: string;
};

export function ProfileSetup({ onComplete }: { onComplete: () => void }) {
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
        // Assume mapping for role or other fields if needed
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
          Set up your profile
        </h1>
        <p className="text-sm text-txt-secondary">
          Tell us a bit about yourself.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <label
            htmlFor="firstName"
            className="text-xs font-medium text-txt-tertiary uppercase"
          >
            First name
          </label>
          <input
            id="firstName"
            {...register("firstName", { required: "Required" })}
            placeholder="Jane"
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
            Last name
          </label>
          <input
            id="lastName"
            {...register("lastName")}
            placeholder="Doe"
            className="input-base h-10"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary mt-2 w-full shadow-sm disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : "Continue"}
        </button>
      </form>
    </div>
  );
}
