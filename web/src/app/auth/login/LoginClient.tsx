"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { anycapPost } from "@/lib/auth/anycap-api";
import { normalizeReturnTo, normalizeUserCode } from "@/lib/auth/session";

type LoginResponse = {
  login_session_id: string;
  authorize_url: string;
};

export function LoginClient() {
  const params = useSearchParams();

  useEffect(() => {
    const returnTo = normalizeReturnTo(params.get("return_to"));
    const deviceCode = normalizeUserCode(params.get("device_code"));
    const browserToken = params.get("browser_token") || "";

    (async () => {
      try {
        if (browserToken) {
          const data = await anycapPost<LoginResponse>("/v1/auth/browser-bind", {
            browser_token: browserToken,
          });
          sessionStorage.setItem(
            "anycap_login",
            JSON.stringify({
              loginSessionID: data.login_session_id,
              returnTo: "/device/complete",
              mode: "browser_poll",
              browserToken,
            }),
          );
          window.location.assign(data.authorize_url);
          return;
        }

        const callbackURL = `${window.location.origin}/auth/callback`;
        const data = await anycapPost<LoginResponse>("/v1/auth/login", {
          method: "web",
          redirect_url: callbackURL,
        });
        sessionStorage.setItem(
          "anycap_login",
          JSON.stringify({
            loginSessionID: data.login_session_id,
            returnTo,
            mode: "web",
            deviceCode,
          }),
        );
        window.location.assign(data.authorize_url);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "";
        const tip = msg.includes("invalid request") ? "login_web_not_enabled" : "login_failed";
        window.location.assign(`/for-human?tip=${tip}`);
      }
    })();
  }, [params]);

  return <p style={{ padding: "2rem", color: "#707468" }}>Redirecting to login…</p>;
}
