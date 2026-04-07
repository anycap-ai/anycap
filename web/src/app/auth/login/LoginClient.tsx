"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { normalizeReturnTo, normalizeUserCode, savePendingLogin } from "@/lib/auth/session";
import { ProcessingOverlay } from "@/components/ui/ProcessingOverlay";

export function LoginClient() {
  const params = useSearchParams();

  useEffect(() => {
    const returnTo = normalizeReturnTo(params.get("return_to"));
    const deviceCode = normalizeUserCode(params.get("device_code"));
    const browserToken = params.get("browser_token") || "";

    (async () => {
      try {
        if (browserToken) {
          const cliLoginURL = `/auth/cli-login?browser_token=${encodeURIComponent(browserToken)}`;
          window.location.assign(cliLoginURL);
          return;
        }

        savePendingLogin({
          returnTo,
          mode: "web",
          deviceCode,
        });
        const sdkLoginURL = `/api/auth/login?returnTo=${encodeURIComponent("/auth/callback")}`;
        window.location.assign(sdkLoginURL);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "";
        const tip = msg.includes("invalid request") ? "login_web_not_enabled" : "login_failed";
        window.location.assign(`/?tip=${tip}`);
      }
    })();
  }, [params]);

  return <ProcessingOverlay message="Redirecting to login" />;
}
