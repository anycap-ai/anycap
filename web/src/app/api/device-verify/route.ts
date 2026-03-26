export const runtime = 'edge';

import { NextRequest, NextResponse } from "next/server";
import { anycapPost } from "@/lib/auth/anycap-api";
import { normalizeUserCode, readSessionCookie } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  const session = await readSessionCookie(request.cookies);
  if (!session?.apiKey) {
    return NextResponse.json({ message: "not_authenticated" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as { user_code?: string };
  const userCode = normalizeUserCode(body.user_code);
  if (!userCode) {
    return NextResponse.json({ message: "invalid_code" }, { status: 400 });
  }

  try {
    await anycapPost("/v1/auth/device-verify", { user_code: userCode }, { apiKey: session.apiKey });
    return NextResponse.json({ message: "authorized" });
  } catch {
    return NextResponse.json({ message: "verify_failed" }, { status: 400 });
  }
}
