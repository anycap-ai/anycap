import { NextRequest, NextResponse } from "next/server";
import { auth0 } from "@/lib/auth/auth0";
import {
  appendAgentNegotiationVary,
  isAgentNegotiationPath,
  shouldServeAgentMarkdown,
} from "@/lib/agent-request";
import {
  buildLocalizedPath,
  defaultLocale,
  getPublicRouteByPath,
  localeHeaderName,
  normalizePublicPath,
  stripLocalePrefix,
} from "@/lib/site";

const protectedPaths = ["/dashboard"];
const passthroughPrefixes = ["/auth", "/dashboard"];
const globalUiPrefixes = ["/auth", "/dashboard"];
const globalUiPaths = new Set(["/"]);
const legacyRouteRedirects = new Map<string, string>([
  ["/for-human", "/"],
  ["/capabilities/image-read", "/capabilities/image-understanding"],
]);

function redirectToLocalizedPath(req: NextRequest, pathname: string) {
  const redirectURL = req.nextUrl.clone();
  redirectURL.pathname = buildLocalizedPath(defaultLocale, pathname);
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

  return target;
}

function applyAgentNegotiationHeaders(target: NextResponse) {
  appendAgentNegotiationVary(target.headers);
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
  if (
    shouldServeAgentMarkdown({
      pathname,
      searchParams: req.nextUrl.searchParams,
      userAgent: req.headers.get("user-agent"),
      accept: req.headers.get("accept"),
    })
  ) {
    const rewriteURL = req.nextUrl.clone();
    rewriteURL.pathname = "/llms.txt";
    rewriteURL.search = "";
    return applyAuthResponse(
      applyAgentNegotiationHeaders(NextResponse.rewrite(rewriteURL)),
      authResponse,
    );
  }

  const legacyRedirectPath = legacyRouteRedirects.get(pathname);
  if (legacyRedirectPath) {
    const redirectURL = req.nextUrl.clone();
    redirectURL.pathname = buildLocalizedPath(locale ?? defaultLocale, legacyRedirectPath);
    return applyAuthResponse(NextResponse.redirect(redirectURL, 308), authResponse);
  }

  if (
    locale === defaultLocale &&
    pathname === "/" &&
    normalizedPath === `/${defaultLocale}`
  ) {
    const redirectURL = req.nextUrl.clone();
    redirectURL.pathname = "/";
    return applyAuthResponse(NextResponse.redirect(redirectURL, 308), authResponse);
  }

  if (!locale) {
    const matchedPublicRoute = getPublicRouteByPath(normalizedPath);
    if (matchedPublicRoute && matchedPublicRoute.key !== "home") {
      return applyAuthResponse(
        redirectToLocalizedPath(req, matchedPublicRoute.path),
        authResponse,
      );
    }

    if (
      normalizedPath !== "/" &&
      !passthroughPrefixes.some(
        (prefix) => normalizedPath === prefix || normalizedPath.startsWith(`${prefix}/`),
      )
    ) {
      return applyAuthResponse(
        new NextResponse("Not Found", {
          status: 404,
          headers: { "content-type": "text/plain; charset=utf-8" },
        }),
        authResponse,
      );
    }
  }

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set(localeHeaderName, locale ?? defaultLocale);
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

  if (isAgentNegotiationPath(pathname)) {
    applyAgentNegotiationHeaders(response);
  }

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
