"use client";

import { useLocale } from "next-intl";
import { useTransition } from "react";
import { type Locale, localeCookieName, localeNames, locales } from "@/i18n";

export function LanguageSwitcher() {
  const locale = useLocale();
  const [isPending, startTransition] = useTransition();

  const handleLocaleChange = (newLocale: Locale) => {
    startTransition(() => {
      const cookieStore = (
        window as Window & {
          cookieStore?: { set: (cookie: unknown) => Promise<void> };
        }
      ).cookieStore;
      void cookieStore?.set({
        name: localeCookieName,
        value: newLocale,
        path: "/",
        expires: Date.now() + 31_536_000_000,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
      // Reload page to apply new locale
      window.location.reload();
    });
  };

  return (
    <div className="relative">
      <select
        value={locale}
        onChange={(e) => handleLocaleChange(e.target.value as Locale)}
        disabled={isPending}
        className="h-9 rounded-md border border-border-subtle bg-bg-surface-2 px-3 py-2 text-sm text-txt-primary outline-none focus:border-border-strong focus:ring-1 focus:ring-border-strong transition-colors disabled:opacity-50 cursor-pointer"
      >
        {locales.map((loc) => (
          <option key={loc} value={loc}>
            {localeNames[loc]}
          </option>
        ))}
      </select>
    </div>
  );
}
