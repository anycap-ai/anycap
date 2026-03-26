import { NextRequest, NextResponse } from "next/server";
import { content, toMarkdown } from "@/lib/landing-content";

const markdown = toMarkdown(content);
const protectedPaths = ["/dashboard", "/billing", "/usage", "/logs"];
const sessionCookieName = "anycap_session";

export function middleware(req: NextRequest) {
  if (protectedPaths.some((path) => req.nextUrl.pathname === path || req.nextUrl.pathname.startsWith(`${path}/`))) {
    const hasSession = Boolean(req.cookies.get(sessionCookieName)?.value);
    if (!hasSession) {
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
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard/:path*", "/billing/:path*", "/usage/:path*", "/logs/:path*"],
};
