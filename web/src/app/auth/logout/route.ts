export const runtime = 'edge';

import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/session";

export function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/for-human", request.nextUrl.origin));
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
