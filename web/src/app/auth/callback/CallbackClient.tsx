"use client";

import { getAccessToken } from "@auth0/nextjs-auth0/client";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { anycapPost } from "@/lib/auth/anycap-api";
import { consumePendingLogin } from "@/lib/auth/session";
import { ProcessingOverlay } from "@/components/ui/ProcessingOverlay";

export function CallbackClient() {
  const params = useSearchParams();

  useEffect(() => {
    (async () => {
      const login = consumePendingLogin();

      if (!login) {
        window.location.assign("/for-human?tip=login_callback_invalid");
        return;
      }

      try {
        if (login.mode === "browser_poll" || login.mode === "cli_login") {
          if (!login.browserToken) {
            window.location.assign("/for-human?tip=login_callback_invalid");
            return;
          }
          const accessToken = await getAccessToken();
          if (!accessToken) {
            window.location.assign("/for-human?tip=login_callback_failed");
            return;
          }
          await anycapPost<{ message: string }>("/v1/auth/browser-verify", {
            browser_token: login.browserToken,
          }, {
            bearerToken: accessToken,
          });
          window.location.assign(login.returnTo || "/device/complete");
          return;
        }

        const accessToken = await getAccessToken();
        if (!accessToken) {
          window.location.assign("/for-human?tip=login_callback_failed");
          return;
        }

        let redirectTarget = login.returnTo || "/dashboard";

        if (login.deviceCode) {
          try {
            await anycapPost<{ message: string }>(
              "/v1/auth/device-verify",
              {
                user_code: login.deviceCode,
              },
              { bearerToken: accessToken },
            );
          } catch {
            redirectTarget = "/device?error=verify_failed";
          }
        }

        window.location.assign(redirectTarget);
      } catch {
        window.location.assign("/for-human?tip=login_callback_failed");
      }
    })();
  }, [params]);

  return <ProcessingOverlay message="Processing login" />;
}
