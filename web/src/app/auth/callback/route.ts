import { NextRequest, NextResponse } from "next/server";
import { anycapPost } from "@/lib/auth/anycap-api";
import {
  clearDeviceCodeCookie,
  clearLoginCookie,
  readDeviceCodeCookie,
  readLoginCookie,
  setSessionCookie,
} from "@/lib/auth/session";

type CallbackData = {
  api_key: string;
  user: {
    id: string;
    email?: string;
    name?: string;
  };
};

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code") || "";
  const state = request.nextUrl.searchParams.get("state") || "";
  const callbackURL = new URL("/auth/callback", request.nextUrl.origin).toString();

  const login = readLoginCookie(request.cookies);
  if (!login || !code || !state) {
    return NextResponse.redirect(new URL("/for-human?tip=login_callback_invalid", request.nextUrl.origin));
  }

  try {
    if (login.mode === "browser_poll") {
      if (!login.browserToken) {
        return NextResponse.redirect(new URL("/for-human?tip=login_callback_invalid", request.nextUrl.origin));
      }

      await anycapPost<{ status: string }>("/v1/auth/browser-complete", {
        login_session_id: login.loginSessionID,
        browser_token: login.browserToken,
        code,
        state,
        redirect_uri: callbackURL,
      });

      const response = NextResponse.redirect(new URL(login.returnTo || "/device/complete", request.nextUrl.origin));
      clearLoginCookie(response.cookies);
      return response;
    }

    const data = await anycapPost<CallbackData>("/v1/auth/callback", {
      login_session_id: login.loginSessionID,
      code,
      state,
      redirect_uri: callbackURL,
    });

    let redirectTarget = login.returnTo || "/dashboard";
    const response = NextResponse.redirect(new URL(redirectTarget, request.nextUrl.origin));
    setSessionCookie(response.cookies, {
      apiKey: data.api_key,
      user: {
        id: data.user?.id || "",
        email: data.user?.email,
        name: data.user?.name,
      },
      issuedAt: Date.now(),
    });
    clearLoginCookie(response.cookies);

    const deviceCode = readDeviceCodeCookie(request.cookies);
    if (deviceCode?.userCode) {
      try {
        await anycapPost<{ message: string }>(
          "/v1/auth/device-verify",
          { user_code: deviceCode.userCode },
          { apiKey: data.api_key },
        );
      } catch {
        redirectTarget = "/device?error=verify_failed";
        response.headers.set("Location", new URL(redirectTarget, request.nextUrl.origin).toString());
      }
      clearDeviceCodeCookie(response.cookies);
    }

    return response;
  } catch {
    return NextResponse.redirect(new URL("/for-human?tip=login_callback_failed", request.nextUrl.origin));
  }
}
