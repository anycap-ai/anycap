import { NextRequest, NextResponse } from "next/server";
import { content, toMarkdown } from "@/lib/landing-content";

const markdown = toMarkdown(content);

export function middleware(req: NextRequest) {
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
  matcher: "/",
};
