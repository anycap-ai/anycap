export const runtime = 'edge';

import { NextRequest, NextResponse } from "next/server";
import { anycapPost } from "@/lib/auth/anycap-api";
import { clearAuthCookies, readSessionCookie } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  const session = await readSessionCookie(request.cookies);

  if (session?.apiKey) {
    try {
      await anycapPost("/v1/auth/logout", {}, { apiKey: session.apiKey });
    } catch {
      // Best effort logout; local cookie cleanup is authoritative for web UI.
    }
  }

  const response = NextResponse.redirect(new URL("/for-human", request.nextUrl.origin));
  clearAuthCookies(response.cookies);
  return response;
}
