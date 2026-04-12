import { NextRequest, NextResponse } from "next/server";
import { getIndexNowKey } from "@/lib/indexnow";

export const runtime = "edge";

function buildHeaders() {
  return new Headers({
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "public, max-age=0, s-maxage=3600",
    "X-Content-Type-Options": "nosniff",
  });
}

function buildNotFoundResponse() {
  return new NextResponse("Not Found", {
    status: 404,
    headers: buildHeaders(),
  });
}

function getIndexNowKeyFromPathname(pathname: string) {
  const lastSegment = pathname.split("/").filter(Boolean).pop();
  if (!lastSegment || !lastSegment.endsWith(".txt")) {
    return null;
  }

  return lastSegment.slice(0, -4);
}

export async function GET(request: NextRequest) {
  const indexnowKey = getIndexNowKeyFromPathname(request.nextUrl.pathname);
  const key = getIndexNowKey();

  if (!key || indexnowKey !== key) {
    return buildNotFoundResponse();
  }

  return new NextResponse(key, {
    headers: buildHeaders(),
  });
}

export async function HEAD(request: NextRequest) {
  const indexnowKey = getIndexNowKeyFromPathname(request.nextUrl.pathname);
  const key = getIndexNowKey();

  if (!key || indexnowKey !== key) {
    return buildNotFoundResponse();
  }

  return new NextResponse(null, {
    headers: buildHeaders(),
  });
}
