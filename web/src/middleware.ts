import { NextRequest, NextResponse } from "next/server";
import { auth0 } from "@/lib/auth/auth0";
import { getLandingContent, toMarkdown } from "@/lib/landing-content";
import {
  buildLocalizedPath,
  defaultLocale,
  getPublicRouteByPath,
  localeHeaderName,
  normalizePublicPath,
  stripLocalePrefix,
} from "@/lib/site";

const markdown = toMarkdown(getLandingContent());
const protectedPaths = ["/dashboard"];
const legacyRouteRedirects = new Map<string, string>([
  ["/capabilities/image-read", "/capabilities/image-understanding"],
]);

function redirectToLocalizedPath(req: NextRequest, pathname: string) {
  const redirectURL = req.nextUrl.clone();
  redirectURL.pathname = buildLocalizedPath(defaultLocale, pathname);
  return NextResponse.redirect(redirectURL);
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

  return target;
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

  if (normalizedPath === "/") {
    const accept = req.headers.get("accept") ?? "";
    if (!accept.includes("text/html")) {
      return applyAuthResponse(
        new NextResponse(markdown, {
          headers: { "content-type": "text/plain; charset=utf-8" },
        }),
        authResponse,
      );
    }
  }

  if (!locale) {
    const matchedPublicRoute = getPublicRouteByPath(normalizedPath);
    if (matchedPublicRoute) {
      return applyAuthResponse(
        redirectToLocalizedPath(req, matchedPublicRoute.path),
        authResponse,
      );
    }
  }

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set(localeHeaderName, locale ?? defaultLocale);

  return applyAuthResponse(
    NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    }),
    authResponse,
  );
}

export const config = {
  matcher: [
    "/((?!api|_next|.*\\..*).*)",
    "/api/auth/:path*",
  ],
};
