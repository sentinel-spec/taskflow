import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { logger } from "@/core/lib/logger";
import { defaultLocale, type Locale } from "./config";

export default getRequestConfig(async () => {
  let locale: Locale = defaultLocale;

  try {
    const cookieStore = await cookies();
    const cookieValue = cookieStore.get("NEXT_LOCALE")?.value;
    if (cookieValue === "en" || cookieValue === "ru") {
      locale = cookieValue as Locale;
    }
  } catch (error) {
    logger.error("Failed to read locale cookie:", error);
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
