import type { Metadata } from "next";
import { cookies } from "next/headers";
import { NextIntlClientProvider } from "next-intl";
import "@/app/globals.css";
import "@fontsource-variable/inter";
import "@fontsource/ibm-plex-mono";
import "@fontsource/material-symbols-rounded";
import { LoadingProvider } from "@/components/ui/loading-screen/loading-provider";
import { AuthStatusWrapper } from "@/core/components/auth/auth-status-wrapper";
import { logger } from "@/core/lib/logger";
import { StoreProvider } from "@/core/lib/store-context";
import { defaultLocale, type Locale } from "@/i18n";

export const metadata: Metadata = {
  title: "Sensata",
  description: "Modern project management tool",
};

async function getLocale(): Promise<Locale> {
  try {
    const cookieStore = await cookies();
    const cookieValue = cookieStore.get("NEXT_LOCALE")?.value;
    if (cookieValue === "en" || cookieValue === "ru") {
      return cookieValue as Locale;
    }
  } catch (error) {
    logger.error("Failed to read locale cookie", error);
  }
  return defaultLocale;
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = (await import(`../../messages/${locale}.json`)).default;

  return (
    <html lang={locale} className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">
        <NextIntlClientProvider messages={messages}>
          <LoadingProvider>
            <StoreProvider>
              <AuthStatusWrapper>{children}</AuthStatusWrapper>
            </StoreProvider>
          </LoadingProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
