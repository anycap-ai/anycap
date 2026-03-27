"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { anycapPost } from "@/lib/auth/anycap-api";
import { setSessionCookie } from "@/lib/auth/session";
import { ProcessingOverlay } from "@/components/ui/ProcessingOverlay";

type CallbackData = {
  api_key: string;
  user: { id: string; email?: string; name?: string };
};

type LoginState = {
  loginSessionID: string;
  returnTo: string;
  mode?: "web" | "browser_poll";
  browserToken?: string;
  deviceCode?: string;
};

export function CallbackClient() {
  const params = useSearchParams();

  useEffect(() => {
    const code = params.get("code") || "";
    const state = params.get("state") || "";

    (async () => {
      const raw = sessionStorage.getItem("anycap_login");
      sessionStorage.removeItem("anycap_login");

      if (!raw || !code || !state) {
        window.location.assign("/for-human?tip=login_callback_invalid");
        return;
      }

      const login: LoginState = JSON.parse(raw);
      const callbackURL = `${window.location.origin}/auth/callback`;

      try {
        if (login.mode === "browser_poll") {
          if (!login.browserToken) {
            window.location.assign("/for-human?tip=login_callback_invalid");
            return;
          }
          await anycapPost<{ status: string }>("/v1/auth/browser-complete", {
            login_session_id: login.loginSessionID,
            browser_token: login.browserToken,
            code,
            state,
            redirect_uri: callbackURL,
          });
          window.location.assign(login.returnTo || "/device/complete");
          return;
        }

        const data = await anycapPost<CallbackData>("/v1/auth/callback", {
          login_session_id: login.loginSessionID,
          code,
          state,
          redirect_uri: callbackURL,
        });

        setSessionCookie({
          apiKey: data.api_key,
          user: { id: data.user?.id || "", email: data.user?.email, name: data.user?.name },
          issuedAt: Date.now(),
        });

        let redirectTarget = login.returnTo || "/dashboard";

        if (login.deviceCode) {
          try {
            await anycapPost<{ message: string }>(
              "/v1/auth/device-verify",
              {
                user_code: login.deviceCode,
                user: {
                  id: data.user?.id || "",
                  email: data.user?.email,
                  name: data.user?.name,
                },
              },
              { apiKey: data.api_key },
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
