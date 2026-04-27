"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { savePendingLogin, savePendingLoginCookie } from "@/lib/auth/session";
import { ProcessingOverlay } from "@/components/ui/ProcessingOverlay";

export function CLILoginClient() {
  const params = useSearchParams();

  useEffect(() => {
    const browserToken = params.get("browser_token") || "";

    if (!browserToken) {
      window.location.assign("/?tip=login_callback_invalid");
      return;
    }

    const loginState = {
      returnTo: "/auth/device/complete" as const,
      mode: "cli_login" as const,
      browserToken,
    };
    savePendingLogin(loginState);
    savePendingLoginCookie(loginState);

    const callbackWithToken = `/auth/callback?browser_token=${encodeURIComponent(browserToken)}&mode=cli_login`;
    const sdkLoginURL = `/api/auth/login?returnTo=${encodeURIComponent(callbackWithToken)}&prompt=${encodeURIComponent("login")}`;
    window.location.assign(sdkLoginURL);
  }, [params]);

  return <ProcessingOverlay message="Redirecting to CLI login" />;
}
