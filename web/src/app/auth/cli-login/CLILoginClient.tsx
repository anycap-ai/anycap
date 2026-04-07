"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { savePendingLogin } from "@/lib/auth/session";
import { ProcessingOverlay } from "@/components/ui/ProcessingOverlay";

export function CLILoginClient() {
  const params = useSearchParams();

  useEffect(() => {
    const browserToken = params.get("browser_token") || "";

    if (!browserToken) {
      window.location.assign("/?tip=login_callback_invalid");
      return;
    }

    savePendingLogin({
      returnTo: "/auth/device/complete",
      mode: "cli_login",
      browserToken,
    });

    const sdkLoginURL = `/api/auth/login?returnTo=${encodeURIComponent("/auth/callback")}&connection=${encodeURIComponent("google-oauth2")}&prompt=${encodeURIComponent("login")}`;
    window.location.assign(sdkLoginURL);
  }, [params]);

  return <ProcessingOverlay message="Redirecting to CLI login" />;
}
