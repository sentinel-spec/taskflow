"use client";

import { CloudSun, Moon, Sun, Sunset } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { cn } from "@/core/lib/utils";

type TimeOfDay = "morning" | "afternoon" | "evening" | "night";

interface GreetingProps {
  userName?: string;
  className?: string;
}

// Helper to get time of day
const getTimeOfDay = (hour: number): TimeOfDay => {
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 22) return "evening";
  return "night";
};

// Icon mapping
const TimeIcon = {
  morning: Sun,
  afternoon: CloudSun,
  evening: Sunset,
  night: Moon,
};

// Color mapping for icons
const IconColor = {
  morning: "text-orange-500",
  afternoon: "text-yellow-500",
  evening: "text-orange-400",
  night: "text-txt-accent-primary",
};

export function Greeting({ userName, className }: GreetingProps) {
  const t = useTranslations("greeting");
  const locale = useLocale();
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // Initialize on mount to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
    setCurrentTime(new Date());

    // Update time every minute
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Prevent SSR/CSR mismatch
  if (!mounted) {
    return (
      <div className={cn("flex items-center gap-3", className)}>
        <div className="h-10 w-10 rounded-lg bg-bg-surface-2" />
        <div className="flex flex-col gap-1">
          <div className="h-5 w-32 rounded bg-bg-surface-2" />
          <div className="h-4 w-24 rounded bg-bg-surface-2" />
        </div>
      </div>
    );
  }

  const hour = currentTime.getHours();
  const timeOfDay = getTimeOfDay(hour);
  const Icon = TimeIcon[timeOfDay];
  const iconColor = IconColor[timeOfDay];

  // Format date with locale: Friday, Mar 20 / пятница, 20 мар.
  const dateFormatter = new Intl.DateTimeFormat(locale, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  // Format time with locale: 17:02
  const timeFormatter = new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const greetingKey = timeOfDay; // morning, afternoon, evening, night

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {/* Icon */}
      <div
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-lg bg-bg-surface-2 transition-colors",
          iconColor,
        )}
      >
        <Icon size={20} />
      </div>

      {/* Text */}
      <div className="flex flex-col">
        <h2 className="font-semibold text-txt-primary text-xl">
          {t(greetingKey)}, {userName || t("user")}
        </h2>
        <p className="text-xs text-txt-tertiary">
          {dateFormatter.format(currentTime)},{" "}
          {timeFormatter.format(currentTime)}
        </p>
      </div>
    </div>
  );
}
