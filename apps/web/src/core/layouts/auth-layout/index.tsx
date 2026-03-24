import type React from "react";
import { LanguageDropdown } from "@/components/language-dropdown";
import DefaultLayout from "@/core/components/layouts/default-layout";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DefaultLayout className="bg-zinc-50 dark:bg-black">
      {/* Language Switcher */}
      <div className="absolute top-4 right-4">
        <LanguageDropdown />
      </div>

      <div className="flex min-h-screen flex-col items-center justify-center">
        {children}
      </div>
    </DefaultLayout>
  );
}
