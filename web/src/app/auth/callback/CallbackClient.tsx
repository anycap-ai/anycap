"use client";

import { getAccessToken } from "@auth0/nextjs-auth0/client";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { anycapPost } from "@/lib/auth/anycap-api";
import { consumePendingLogin, consumePendingLoginCookie, type PendingLoginState } from "@/lib/auth/session";
import { ProcessingOverlay } from "@/components/ui/ProcessingOverlay";

export type AuthProfile = {
  email?: string;
  name?: string;
  picture?: string;
};

export function CallbackClient({ initialProfile }: { initialProfile?: AuthProfile | null }) {
  const params = useSearchParams();

  useEffect(() => {
    (async () => {
      let login = consumePendingLogin();
      if (!login) {
        login = consumePendingLoginCookie();
      }
      if (!login) {
        login = recoverFromURLParams(params);
      }

      if (!login) {
        window.location.assign("/?tip=login_no_state");
        return;
      }

      try {
        const profile = initialProfile ?? (await loadAuthProfile());

        if (login.mode === "browser_poll" || login.mode === "cli_login") {
          if (!login.browserToken) {
            window.location.assign("/?tip=login_no_token");
            return;
          }
          const accessToken = await getAccessToken();
          if (!accessToken) {
            window.location.assign("/?tip=login_no_access_token");
            return;
          }
          await anycapPost<{ message: string }>("/v1/auth/browser-verify", {
            browser_token: login.browserToken,
            ...(profile ? { user: profile } : {}),
          }, {
            bearerToken: accessToken,
          });
          window.location.assign(login.returnTo || "/auth/device/complete");
          return;
        }

        const accessToken = await getAccessToken();
        if (!accessToken) {
          window.location.assign("/?tip=login_no_access_token");
          return;
        }

        let redirectTarget = login.returnTo || "/dashboard";

        if (login.deviceCode) {
          try {
            await anycapPost<{ message: string }>(
              "/v1/auth/device-verify",
              {
                user_code: login.deviceCode,
                ...(profile ? { user: profile } : {}),
              },
              { bearerToken: accessToken },
            );
          } catch {
            redirectTarget = "/auth/device?error=verify_failed";
          }
        }

        window.location.assign(redirectTarget);
      } catch {
        window.location.assign("/?tip=login_verify_failed");
      }
    })();
  }, [initialProfile, params]);

  return <ProcessingOverlay message="Processing login" />;
}

function recoverFromURLParams(params: URLSearchParams): PendingLoginState | null {
  const browserToken = params.get("browser_token");
  const mode = params.get("mode");
  if (!browserToken || (mode !== "cli_login" && mode !== "browser_poll")) {
    return null;
  }
  return {
    returnTo: "/auth/device/complete",
    mode,
    browserToken,
  };
}

async function loadAuthProfile(): Promise<AuthProfile | null> {
  for (const path of ["/auth/profile", "/api/auth/profile"]) {
    const resp = await fetch(path, {
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
    });
    if (!resp.ok) {
      continue;
    }

    const data = (await resp.json()) as AuthProfile;
    return {
      email: data.email || "",
      name: data.name || "",
      picture: data.picture || "",
    };
  }

  return null;
}
