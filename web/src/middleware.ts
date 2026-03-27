import { NextRequest, NextResponse } from "next/server";
import { content, toMarkdown } from "@/lib/landing-content";
import { auth0 } from "@/lib/auth/auth0";

const markdown = toMarkdown(content);
const protectedPaths = ["/dashboard", "/billing", "/usage", "/logs"];

export async function middleware(req: NextRequest) {
  const authResponse = await auth0.middleware(req);

  if (req.nextUrl.pathname.startsWith("/api/auth/") || req.nextUrl.pathname === "/auth/access-token") {
    return authResponse;
  }

  if (protectedPaths.some((path) => req.nextUrl.pathname === path || req.nextUrl.pathname.startsWith(`${path}/`))) {
    const session = await auth0.getSession(req);
    if (!session) {
      const loginURL = new URL("/auth/login", req.nextUrl.origin);
      const returnTo = `${req.nextUrl.pathname}${req.nextUrl.search}`;
      loginURL.searchParams.set("return_to", returnTo);
      return NextResponse.redirect(loginURL);
    }
  }

  if (req.nextUrl.pathname === "/") {
    const accept = req.headers.get("accept") ?? "";
    if (!accept.includes("text/html")) {
      return new NextResponse(markdown, {
        headers: { "content-type": "text/plain; charset=utf-8" },
      });
    }
  }
  return authResponse;
}

export const config = {
  matcher: [
    "/",
    "/auth/:path*",
    "/api/auth/:path*",
    "/dashboard/:path*",
    "/billing/:path*",
    "/usage/:path*",
    "/logs/:path*",
  ],
};
