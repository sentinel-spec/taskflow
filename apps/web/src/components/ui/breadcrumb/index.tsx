"use client";

import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { cn } from "@/core/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  homeLabel?: string;
  className?: string;
}

export function Breadcrumb({
  items = [],
  homeLabel: _homeLabel = "Home",
  className,
}: BreadcrumbProps) {
  const pathname = usePathname();

  // Auto-generate items from pathname if not provided
  const autoItems: BreadcrumbItem[] = React.useMemo(() => {
    if (!pathname) return [];

    const segments = pathname
      .split("/")
      .filter((segment) => segment.length > 0);

    return segments.map((segment, index, arr) => {
      const label = decodeURIComponent(segment)
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      const href = `/${arr.slice(0, index + 1).join("/")}`;

      return { label, href };
    });
  }, [pathname]);

  const breadcrumbItems = items.length > 0 ? items : autoItems;

  if (breadcrumbItems.length === 0) {
    return null;
  }

  return (
    <nav className={cn("flex items-center gap-2 text-xs", className)}>
      {/* Home icon */}
      <Link
        href="/"
        className="flex items-center justify-center rounded p-1 text-txt-tertiary hover:bg-bg-surface-2 hover:text-txt-primary transition-colors"
      >
        <Home size={14} />
      </Link>

      {/* Breadcrumb items */}
      {breadcrumbItems.map((item, index) => (
        <React.Fragment key={item.href || index}>
          <ChevronRight size={14} className="text-txt-tertiary shrink-0" />
          {item.href && index < breadcrumbItems.length - 1 ? (
            <Link
              href={item.href}
              className="rounded px-2 py-0.5 text-txt-secondary hover:bg-bg-surface-2 hover:text-txt-primary transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="px-2 py-0.5 font-medium text-txt-primary">
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
