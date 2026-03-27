"use client";

import { useState } from "react";
import { anycapPost } from "@/lib/auth/anycap-api";
import { ProcessingOverlay } from "@/components/ui/ProcessingOverlay";

type LoginResponse = {
  login_session_id: string;
  authorize_url: string;
};

type Props = {
  returnTo?: string;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
};

export function LoginButton({ returnTo = "/dashboard", className, style, children }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    try {
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
        }),
      );
      window.location.assign(data.authorize_url);
    } catch {
      window.location.assign("/for-human?tip=login_failed");
    }
  }

  return (
    <>
      <button type="button" onClick={handleLogin} className={className} style={style}>
        {children ?? "Login"}
      </button>
      {loading && <ProcessingOverlay message="Redirecting to login" />}
    </>
  );
}
