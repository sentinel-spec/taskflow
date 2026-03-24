"use client";

import * as React from "react";
import { cn } from "@/core/lib/utils";

export enum EHeaderVariant {
  PRIMARY = "primary",
  SECONDARY = "secondary",
  TERNARY = "ternary",
}

export type THeaderVariant =
  | EHeaderVariant.PRIMARY
  | EHeaderVariant.SECONDARY
  | EHeaderVariant.TERNARY;

export interface HeaderProps {
  variant?: THeaderVariant;
  className?: string;
  children: React.ReactNode;
}

const headerStyle: Record<EHeaderVariant, string> = {
  [EHeaderVariant.PRIMARY]:
    "relative flex w-full flex-shrink-0 flex-row items-center justify-between gap-2 bg-bg-surface-1 z-[18]",
  [EHeaderVariant.SECONDARY]:
    "!py-0 overflow-y-hidden border-b border-border-subtle justify-between bg-bg-surface-1 z-[15]",
  [EHeaderVariant.TERNARY]:
    "flex flex-wrap justify-between py-2 border-b border-border-subtle gap-2 bg-bg-surface-1 z-[12]",
};

const HeaderContext = React.createContext<THeaderVariant | null>(null);

export function Header({
  variant = EHeaderVariant.PRIMARY,
  className = "",
  children,
}: HeaderProps) {
  return (
    <HeaderContext.Provider value={variant}>
      <div className={cn(headerStyle[variant], className)}>{children}</div>
    </HeaderContext.Provider>
  );
}

export function HeaderLeftItem({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex max-w-[80%] flex-grow flex-wrap items-center gap-2 overflow-ellipsis whitespace-nowrap",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function HeaderRightItem({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const variant = React.useContext(HeaderContext);

  return (
    <div
      className={cn(
        "flex w-auto items-center justify-end gap-2",
        {
          "items-baseline": variant === EHeaderVariant.TERNARY,
        },
        className,
      )}
    >
      {children}
    </div>
  );
}
