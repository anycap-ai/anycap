import { NextRequest, NextResponse } from "next/server";
import { getLandingContent, toMarkdown } from "@/lib/landing-content";
import { SESSION_COOKIE } from "@/lib/auth/session";
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

function redirectToLocalizedPath(req: NextRequest, pathname: string) {
  const redirectUrl = req.nextUrl.clone();
  redirectUrl.pathname = buildLocalizedPath(defaultLocale, pathname);
  return NextResponse.redirect(redirectUrl);
}

export function middleware(req: NextRequest) {
  const normalizedPath = normalizePublicPath(req.nextUrl.pathname);

  if (
    protectedPaths.some(
      (path) => normalizedPath === path || normalizedPath.startsWith(`${path}/`)
    )
  ) {
    const hasSession = Boolean(req.cookies.get(SESSION_COOKIE)?.value);
    if (!hasSession) {
      const loginURL = new URL("/auth/login", req.nextUrl.origin);
      const returnTo = `${normalizedPath}${req.nextUrl.search}`;
      loginURL.searchParams.set("return_to", returnTo);
      return NextResponse.redirect(loginURL);
    }
  }

  if (normalizedPath === "/") {
    const accept = req.headers.get("accept") ?? "";
    if (!accept.includes("text/html")) {
      return new NextResponse(markdown, {
        headers: { "content-type": "text/plain; charset=utf-8" },
      });
    }

    return redirectToLocalizedPath(req, "/");
  }

  const { locale } = stripLocalePrefix(normalizedPath);
  if (!locale) {
    const matchedPublicRoute = getPublicRouteByPath(normalizedPath);
    if (matchedPublicRoute) {
      return redirectToLocalizedPath(req, matchedPublicRoute.path);
    }
  }

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set(localeHeaderName, locale ?? defaultLocale);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ["/", "/dashboard/:path*"],
};
