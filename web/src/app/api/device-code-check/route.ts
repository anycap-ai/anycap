export const runtime = 'edge';

import { NextRequest, NextResponse } from "next/server";
import { anycapPost } from "@/lib/auth/anycap-api";
import { normalizeUserCode } from "@/lib/auth/session";

type DeviceCodeCheckData = {
  valid: boolean;
  reason?: string;
};

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as { user_code?: string };
  const userCode = normalizeUserCode(body.user_code);
  if (!userCode) {
    return NextResponse.json<DeviceCodeCheckData>({ valid: false, reason: "invalid" }, { status: 400 });
  }

  try {
    const data = await anycapPost<DeviceCodeCheckData>("/v1/auth/device-code-check", {
      user_code: userCode,
    });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json<DeviceCodeCheckData>({ valid: false, reason: "invalid" }, { status: 200 });
  }
}
