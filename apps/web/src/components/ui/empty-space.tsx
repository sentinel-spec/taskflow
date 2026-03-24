"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type React from "react";

type EmptySpaceProps = {
  title: string;
  description: string;
  children: React.ReactNode;
  Icon?: React.ComponentType<{ className?: string }>;
  link?: { text: string; href: string };
};

export function EmptySpace({
  title,
  description,
  children,
  Icon,
  link,
}: EmptySpaceProps) {
  return (
    <div className="w-full max-w-2xl rounded-2xl border border-border-subtle bg-bg-surface-1 p-6 shadow-sm md:p-8">
      {Icon ? (
        <div className="mb-4">
          <Icon className="h-10 w-10 text-txt-tertiary" />
        </div>
      ) : null}

      <h2 className="text-lg font-semibold text-txt-primary">{title}</h2>
      <p className="mt-2 text-sm text-txt-secondary">{description}</p>

      <ul className="mt-6 divide-y divide-border-subtle border-y border-border-subtle">
        {children}
      </ul>

      {link ? (
        <div className="mt-6">
          <Link
            href={link.href}
            className="text-sm font-medium text-txt-accent-primary hover:opacity-80"
          >
            {link.text} <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      ) : null}
    </div>
  );
}

type EmptySpaceItemProps = {
  title: string;
  description?: React.ReactNode;
  Icon: React.ComponentType<{ className?: string }>;
  action?: () => void;
  href?: string;
};

export function EmptySpaceItem({
  title,
  description,
  Icon,
  action,
  href,
}: EmptySpaceItemProps) {
  const item = (
    <div
      className={`group relative flex ${description ? "items-start" : "items-center"} gap-3 py-4`}
    >
      <div className="shrink-0">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-bg-accent-primary text-white">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-txt-secondary group-hover:text-txt-primary">
          {title}
        </div>
        {description ? (
          <div className="text-sm text-txt-tertiary">{description}</div>
        ) : null}
      </div>
      <div className="shrink-0 self-center">
        <ChevronRight
          className="h-5 w-5 text-txt-tertiary group-hover:text-txt-primary"
          aria-hidden="true"
        />
      </div>
    </div>
  );

  if (href) {
    return (
      <li className="cursor-pointer">
        <Link href={href} className="block">
          {item}
        </Link>
      </li>
    );
  }

  return (
    <li>
      <button
        type="button"
        onClick={action}
        className="block w-full cursor-pointer text-left"
      >
        {item}
      </button>
    </li>
  );
}
