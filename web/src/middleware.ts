import { NextRequest, NextResponse } from "next/server";
import { auth0 } from "@/lib/auth/auth0";
import {
  buildLocalizedPath,
  defaultLocale,
  getPublicRouteByPath,
  localeHeaderName,
  normalizePublicPath,
  requestPathnameHeaderName,
  stripLocalePrefix,
} from "@/lib/site";

const protectedPaths = ["/dashboard"];
const passthroughPrefixes = ["/auth", "/dashboard"];
const globalUiPrefixes = ["/auth", "/dashboard"];
const globalUiPaths = new Set(["/"]);
const metadataRoutePaths = new Set(["/opengraph-image", "/twitter-image"]);

const anycapApiOrigin = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_ANYCAP_API_URL || "").origin;
  } catch {
    return "";
  }
})();

const cspDirectives = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  `connect-src 'self' ${anycapApiOrigin} https://www.google-analytics.com https://www.googletagmanager.com https://region1.google-analytics.com`.trim(),
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const securityHeaders: Record<string, string> = {
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "SAMEORIGIN",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Content-Security-Policy": cspDirectives,
};
const legacyRouteRedirects = new Map<string, string>([
  ["/for-human", "/"],
  ["/capabilities/image-read", "/capabilities/image-understanding"],
]);

function applySecurityHeaders(response: NextResponse): NextResponse {
  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value);
  }
  return response;
}

function redirectToPath(req: NextRequest, pathname: string) {
  const redirectURL = req.nextUrl.clone();
  redirectURL.pathname = pathname;
  return NextResponse.redirect(redirectURL, 308);
}

function applyAuthResponse(target: NextResponse, authResponse: NextResponse) {
  for (const cookie of authResponse.cookies.getAll()) {
    target.cookies.set(cookie);
  }

  authResponse.headers.forEach((value, key) => {
    if (key.toLowerCase() === "set-cookie" || target.headers.has(key)) {
      return;
    }
    target.headers.set(key, value);
  });

  return applySecurityHeaders(target);
}

export async function middleware(req: NextRequest) {
  const authResponse = await auth0.middleware(req);
  const normalizedPath = normalizePublicPath(req.nextUrl.pathname);

  if (
    req.nextUrl.pathname.startsWith("/api/auth/") ||
    req.nextUrl.pathname === "/auth/access-token" ||
    req.nextUrl.pathname === "/auth/profile"
  ) {
    return authResponse;
  }

  if (
    protectedPaths.some(
      (path) => normalizedPath === path || normalizedPath.startsWith(`${path}/`),
    )
  ) {
    const session = await auth0.getSession(req);
    if (!session) {
      const loginURL = new URL("/auth/login", req.nextUrl.origin);
      loginURL.searchParams.set("return_to", `${normalizedPath}${req.nextUrl.search}`);
      return applyAuthResponse(NextResponse.redirect(loginURL), authResponse);
    }
  }

  const { locale, pathname } = stripLocalePrefix(normalizedPath);

  const legacyRedirectPath = legacyRouteRedirects.get(pathname);
  if (legacyRedirectPath) {
    const redirectURL = req.nextUrl.clone();
    redirectURL.pathname = buildLocalizedPath(locale ?? defaultLocale, legacyRedirectPath);
    return applyAuthResponse(NextResponse.redirect(redirectURL, 308), authResponse);
  }

  if (locale === defaultLocale) {
    return applyAuthResponse(redirectToPath(req, pathname), authResponse);
  }

  if (!locale) {
    if (metadataRoutePaths.has(normalizedPath)) {
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set(localeHeaderName, defaultLocale);
      requestHeaders.set(requestPathnameHeaderName, normalizedPath);
      requestHeaders.set("x-anycap-global-ui", "0");

      return applyAuthResponse(
        NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        }),
        authResponse,
      );
    }

    const matchedPublicRoute = getPublicRouteByPath(normalizedPath);
    if (matchedPublicRoute) {
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set(localeHeaderName, defaultLocale);
      requestHeaders.set(requestPathnameHeaderName, normalizedPath);
      requestHeaders.set(
        "x-anycap-global-ui",
        globalUiPaths.has(normalizedPath) ||
          globalUiPrefixes.some(
            (prefix) => normalizedPath === prefix || normalizedPath.startsWith(`${prefix}/`),
          )
          ? "1"
          : "0",
      );

      return applyAuthResponse(
        NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        }),
        authResponse,
      );
    }

    if (
      normalizedPath !== "/" &&
      !passthroughPrefixes.some(
        (prefix) => normalizedPath === prefix || normalizedPath.startsWith(`${prefix}/`),
      )
    ) {
      const notFoundUrl = new URL("/_not-found", req.nextUrl.origin);
      return applyAuthResponse(
        NextResponse.rewrite(notFoundUrl, { status: 404 }),
        authResponse,
      );
    }
  }

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set(localeHeaderName, locale ?? defaultLocale);
  requestHeaders.set(requestPathnameHeaderName, normalizedPath);
  requestHeaders.set(
    "x-anycap-global-ui",
    globalUiPaths.has(pathname) ||
      globalUiPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
      ? "1"
      : "0"
  );

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  return applyAuthResponse(
    response,
    authResponse,
  );
}

export const config = {
  matcher: [
    "/((?!api|_next|.*\\..*).*)",
    "/api/auth/:path*",
  ],
};
