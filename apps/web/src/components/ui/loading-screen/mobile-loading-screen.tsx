"use client";

import { useEffect, useState } from "react";
import { cn } from "@/core/lib/utils";

interface MobileLoadingScreenProps {
  className?: string;
  showLogo?: boolean;
  message?: string;
}

export function MobileLoadingScreen({
  className,
  showLogo = true,
  message,
}: MobileLoadingScreenProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex flex-col items-center justify-center bg-bg-canvas",
        className,
      )}
    >
      {/* Safe area for notched devices */}
      <div className="flex flex-col items-center gap-6 px-6 py-safe">
        {/* Logo / App Icon */}
        {showLogo && (
          <div className="mb-4">
            <div
              className={cn(
                "flex items-center justify-center rounded-2xl bg-bg-accent-primary/10",
                // Mobile: 64px, Tablet: 80px, Desktop: 96px
                "h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24",
              )}
            >
              {/* Pulsing dot */}
              <div className="relative">
                <div
                  className={cn(
                    "animate-ping absolute inset-0 rounded-full bg-bg-accent-primary/30",
                    "h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6",
                  )}
                />
                <div
                  className={cn(
                    "relative rounded-full bg-bg-accent-primary",
                    "h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6",
                  )}
                />
              </div>
            </div>
          </div>
        )}

        {/* Spinner */}
        <div className="relative">
          {/* Outer ring - responsive sizes */}
          <div
            className={cn(
              "animate-spin rounded-full border-t-bg-accent-primary border-border-subtle",
              // Mobile: 40px, Tablet: 48px, Desktop: 56px
              "h-10 w-10 border-2 sm:h-12 sm:w-12 sm:border-3 md:h-14 md:w-14 md:border-4",
            )}
          />
          {/* Inner dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className={cn(
                "animate-pulse rounded-full bg-bg-accent-primary/30",
                // Mobile: 16px, Tablet: 20px, Desktop: 24px
                "h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6",
              )}
            />
          </div>
        </div>

        {/* Loading message */}
        {message && (
          <p className="animate-pulse text-center text-sm font-medium text-txt-tertiary sm:text-base md:text-lg">
            {message}
          </p>
        )}

        {/* Progress indicator (optional dots) */}
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-bg-accent-primary [animation-delay:-0.3s]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-bg-accent-primary [animation-delay:-0.15s]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-bg-accent-primary" />
        </div>
      </div>
    </div>
  );
}
