import { NextRequest, NextResponse } from "next/server";
import { anycapPost } from "@/lib/auth/anycap-api";
import {
  normalizeReturnTo,
  normalizeUserCode,
  setDeviceCodeCookie,
  setLoginCookie,
} from "@/lib/auth/session";

type LoginInitData = {
  login_session_id: string;
  authorize_url: string;
};

export async function GET(request: NextRequest) {
  const returnTo = normalizeReturnTo(request.nextUrl.searchParams.get("return_to"));
  const deviceCode = normalizeUserCode(request.nextUrl.searchParams.get("device_code"));
  const callbackURL = new URL("/auth/callback", request.nextUrl.origin).toString();

  try {
    const data = await anycapPost<LoginInitData>("/v1/auth/login", {
      method: "web",
      redirect_url: callbackURL,
    });

    const response = NextResponse.redirect(data.authorize_url);
    setLoginCookie(response.cookies, {
      loginSessionID: data.login_session_id,
      returnTo,
      issuedAt: Date.now(),
    });
    if (deviceCode) {
      setDeviceCodeCookie(response.cookies, {
        userCode: deviceCode,
        issuedAt: Date.now(),
      });
    }
    return response;
  } catch (error) {
    const reason = error instanceof Error ? error.message : "";
    const fallback = new URL("/for-human", request.nextUrl.origin);
    const tip = reason.includes("invalid request") ? "login_web_not_enabled" : "login_failed";
    fallback.searchParams.set("tip", tip);
    return NextResponse.redirect(fallback);
  }
}
