"use client";

import { getAccessToken } from "@auth0/nextjs-auth0/client";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { anycapPost } from "@/lib/auth/anycap-api";
import { consumePendingLogin } from "@/lib/auth/session";
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
      const login = consumePendingLogin();

      if (!login) {
        window.location.assign("/for-human?tip=login_callback_invalid");
        return;
      }

      try {
        const profile = initialProfile ?? (await loadAuthProfile());

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
            ...(profile ? { user: profile } : {}),
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
                ...(profile ? { user: profile } : {}),
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
  }, [initialProfile, params]);

  return <ProcessingOverlay message="Processing login" />;
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
