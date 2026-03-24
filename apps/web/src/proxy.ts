import { type NextRequest, NextResponse } from "next/server";
import { defaultLocale, localeCookieName } from "./i18n/config";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip API routes and static files
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/_vercel") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const response = NextResponse.next();

  // Get locale from cookie or browser preference
  let locale = defaultLocale;

  const cookieLocale = request.cookies.get(localeCookieName)?.value;
  if (cookieLocale && (cookieLocale === "en" || cookieLocale === "ru")) {
    locale = cookieLocale;
  } else {
    // Try to get locale from Accept-Language header
    const acceptLanguage = request.headers.get("accept-language") || "";
    if (acceptLanguage.includes("ru")) {
      locale = "ru";
    }
  }

  // Set cookie with detected locale
  response.cookies.set(localeCookieName, locale, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 31536000, // 1 year
  });

  return response;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
