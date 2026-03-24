"use client";

import { Globe, Lock } from "lucide-react";
import { cn } from "@/core/lib/utils";

type TNetworkChoiceIconKey = "Lock" | "Globe";

type Props = {
  iconKey: TNetworkChoiceIconKey;
  className?: string;
};

export function ProjectNetworkIcon(props: Props) {
  const { iconKey, className } = props;

  const getProjectNetworkIcon = () => {
    switch (iconKey) {
      case "Lock":
        return Lock;
      case "Globe":
        return Globe;
      default:
        return null;
    }
  };

  const Icon = getProjectNetworkIcon();
  if (!Icon) return null;

  return <Icon className={cn("h-3 w-3", className)} />;
}
