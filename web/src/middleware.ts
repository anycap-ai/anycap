import { NextRequest, NextResponse } from "next/server";
import { auth0 } from "@/lib/auth/auth0";
import { isInternalDefaultLocaleRewrite } from "@/lib/default-locale-routing";
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
const passthroughPrefixes = ["/auth", "/dashboard", "/boutique-main-site-preview"];
const globalUiPrefixes = ["/auth", "/dashboard", "/boutique-main-site-preview"];
const globalUiPaths = new Set(["/"]);
const metadataRoutePaths = new Set(["/twitter-image"]);

// Paths that always require a per-request response (auth session work, dashboards, API).
// We never attach edge-cache headers to these regardless of cookie state.
const noCachePathPrefixes = ["/dashboard", "/auth", "/api"];

// CF Edge cache directive for SEO HTML.
//   browser → always revalidate (max-age=0, must-revalidate)
//   CF Edge → cache 1h, serve stale up to 24h while revalidating
const seoBrowserCacheControl = "public, max-age=0, must-revalidate";
const seoEdgeCdnCacheControl = "public, s-maxage=3600, stale-while-revalidate=86400";

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
  "media-src 'self' https://cdn.anycap.ai",
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
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  "Content-Security-Policy": cspDirectives,
};
const legacyRouteRedirects = new Map<string, string>([
  ["/for-human", "/"],
  ["/capabilities/image-read", "/capabilities/image-understanding"],
  ["/glossary/agent-capability-runtime", "/glossary/agent-harness"],
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

function internalDefaultLocalePath(pathname: string): string {
  const normalizedPath = normalizePublicPath(pathname);
  return normalizedPath === "/" ? `/${defaultLocale}` : `/${defaultLocale}${normalizedPath}`;
}

function isPubliclyCacheablePath(rawPathname: string, strippedPathname: string): boolean {
  // Auth/dashboard/API routes must never be edge-cached even if they happen to
  // return no Set-Cookie on a given request.
  for (const prefix of noCachePathPrefixes) {
    if (rawPathname === prefix || rawPathname.startsWith(`${prefix}/`)) {
      return false;
    }
    if (strippedPathname === prefix || strippedPathname.startsWith(`${prefix}/`)) {
      return false;
    }
  }
  return true;
}

// Opportunistically attach CF Edge cache headers. Only safe when:
//   - request path is a public SEO/marketing route
//   - response does NOT set cookies (Auth0 session refresh would invalidate caching)
//   - response is not a redirect (CF caches redirects on its own defaults)
//   - response is not an explicit error status from middleware (e.g., 404 rewrite)
// In every other case we leave headers untouched -- same behavior as today.
function maybeApplyEdgeCacheHeaders(
  target: NextResponse,
  rawPathname: string,
  strippedPathname: string,
) {
  if (!isPubliclyCacheablePath(rawPathname, strippedPathname)) {
    return target;
  }
  if (target.headers.has("set-cookie")) {
    return target;
  }
  // Skip non-2xx middleware responses (redirects, 404 rewrites). The downstream
  // page may still return its own non-2xx status; cache headers we set here will
  // ride along, which is acceptable for static SEO 404s.
  if (target.status >= 300) {
    return target;
  }

  target.headers.set("Cache-Control", seoBrowserCacheControl);
  target.headers.set("CDN-Cache-Control", seoEdgeCdnCacheControl);
  target.headers.set("Cloudflare-CDN-Cache-Control", seoEdgeCdnCacheControl);
  return target;
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
  const response = await runMiddleware(req);
  const normalizedPath = normalizePublicPath(req.nextUrl.pathname);
  const { pathname } = stripLocalePrefix(normalizedPath);
  return maybeApplyEdgeCacheHeaders(response, req.nextUrl.pathname, pathname);
}

async function runMiddleware(req: NextRequest): Promise<NextResponse> {
  const authResponse = await auth0.middleware(req);
  const normalizedPath = normalizePublicPath(req.nextUrl.pathname);
  const { locale, pathname } = stripLocalePrefix(normalizedPath);
  const internalDefaultLocaleRewrite = isInternalDefaultLocaleRewrite({
    locale,
    defaultLocale,
    forwardedLocale: req.headers.get(localeHeaderName),
    forwardedPathname: req.headers.get(requestPathnameHeaderName),
    pathname,
  });

  if (req.nextUrl.pathname !== "/" && req.nextUrl.pathname.endsWith("/")) {
    return applyAuthResponse(redirectToPath(req, normalizedPath), authResponse);
  }

  if (
    req.nextUrl.pathname.startsWith("/api/auth/") ||
    req.nextUrl.pathname === "/auth/access-token" ||
    req.nextUrl.pathname === "/auth/profile"
  ) {
    return authResponse;
  }

  if (
    protectedPaths.some(
      (path) =>
        (locale ? pathname : normalizedPath) === path ||
        (locale ? pathname : normalizedPath).startsWith(`${path}/`),
    )
  ) {
    const session = await auth0.getSession(req);
    if (!session) {
      const loginURL = new URL("/auth/login", req.nextUrl.origin);
      loginURL.searchParams.set("return_to", `${normalizedPath}${req.nextUrl.search}`);
      return applyAuthResponse(NextResponse.redirect(loginURL), authResponse);
    }
  }

  const legacyRedirectPath = legacyRouteRedirects.get(pathname);
  if (legacyRedirectPath) {
    const redirectURL = req.nextUrl.clone();
    redirectURL.pathname = buildLocalizedPath(locale ?? defaultLocale, legacyRedirectPath);
    return applyAuthResponse(NextResponse.redirect(redirectURL, 308), authResponse);
  }

  if (locale === defaultLocale && !internalDefaultLocaleRewrite) {
    return applyAuthResponse(redirectToPath(req, pathname), authResponse);
  }

  if (locale) {
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set(localeHeaderName, locale);
    requestHeaders.set(
      requestPathnameHeaderName,
      internalDefaultLocaleRewrite ? pathname : normalizedPath,
    );
    requestHeaders.set(
      "x-anycap-global-ui",
      globalUiPaths.has(pathname) ||
        globalUiPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
        ? "1"
        : "0",
    );

    if (metadataRoutePaths.has(pathname)) {
      const rewriteURL = req.nextUrl.clone();
      rewriteURL.pathname = pathname;
      return applyAuthResponse(
        NextResponse.rewrite(rewriteURL, {
          request: {
            headers: requestHeaders,
          },
        }),
        authResponse,
      );
    }

    if (getPublicRouteByPath(pathname)) {
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
      passthroughPrefixes.some(
        (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
      )
    ) {
      const rewriteURL = req.nextUrl.clone();
      rewriteURL.pathname = pathname;
      return applyAuthResponse(
        NextResponse.rewrite(rewriteURL, {
          request: {
            headers: requestHeaders,
          },
        }),
        authResponse,
      );
    }

    const notFoundUrl = new URL("/_not-found", req.nextUrl.origin);
    return applyAuthResponse(
      NextResponse.rewrite(notFoundUrl, {
        status: 404,
        request: {
          headers: requestHeaders,
        },
      }),
      authResponse,
    );
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
      const rewriteURL = req.nextUrl.clone();
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

      // Cloudflare keeps only the localized worker function for duplicated
      // public routes. Forwarded locale/path headers distinguish this internal
      // rewrite from a visitor explicitly requesting /en/..., which redirects.
      rewriteURL.pathname = internalDefaultLocalePath(normalizedPath);
      return applyAuthResponse(
        NextResponse.rewrite(rewriteURL, {
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
