"use client";

import { Check, Globe } from "lucide-react";
import { useLocale } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { type Locale, localeCookieName, localeNames, locales } from "@/i18n";

export function LanguageDropdown() {
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLocaleChange = (newLocale: Locale) => {
    // Set cookie to store locale preference
    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + 1);
    const cookieStore = (
      window as Window & {
        cookieStore?: { set: (cookie: unknown) => Promise<void> };
      }
    ).cookieStore;
    void cookieStore?.set({
      name: localeCookieName,
      value: newLocale,
      path: "/",
      expires,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    // Force reload to apply new locale
    window.location.reload();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-8 w-8 items-center justify-center rounded-md text-txt-secondary hover:bg-bg-surface-2 transition-colors"
        title="Change language"
      >
        <Globe size={18} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 min-w-35 rounded-md border border-border-subtle bg-bg-surface-1 py-1 shadow-lg z-50">
          <div className="px-3 py-2 text-xs font-medium text-txt-tertiary uppercase tracking-wider border-b border-border-subtle mb-1">
            Language
          </div>
          {locales.map((loc) => (
            <button
              type="button"
              key={loc}
              onClick={() => handleLocaleChange(loc)}
              className={`w-full px-4 py-2 text-left text-sm hover:bg-bg-surface-2 transition-colors flex items-center justify-between ${
                locale === loc
                  ? "text-txt-primary font-medium"
                  : "text-txt-secondary"
              }`}
            >
              <span>{localeNames[loc]}</span>
              {locale === loc && (
                <Check size={14} className="text-txt-accent-primary" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
