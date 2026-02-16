import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

const protectedPaths = [
  "/dashboard",
  "/instances",
  "/api-docs",
  "/faq",
  "/contact",
  "/messages",
  "/settings",
  "/billing",
];

const authPaths = ["/login", "/signup", "/verify-otp", "/forgot-password", "/reset-password"];

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Strip locale prefix to get the actual path
  const segments = pathname.split("/");
  const locale = segments[1];
  const isValidLocale = routing.locales.includes(locale as "ar" | "en");
  const pathWithoutLocale = isValidLocale
    ? "/" + segments.slice(2).join("/")
    : pathname;

  const token = request.cookies.get("nadba-token")?.value;

  // Check if accessing a protected route without a token
  const isProtectedRoute = protectedPaths.some(
    (p) => pathWithoutLocale === p || pathWithoutLocale.startsWith(p + "/")
  );

  const isAuthRoute = authPaths.some(
    (p) => pathWithoutLocale === p || pathWithoutLocale.startsWith(p + "/")
  );

  if (isProtectedRoute && !token) {
    const loginUrl = new URL(`/${locale || "ar"}/login`, request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && token) {
    const dashboardUrl = new URL(
      `/${locale || "ar"}/dashboard`,
      request.url
    );
    return NextResponse.redirect(dashboardUrl);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
