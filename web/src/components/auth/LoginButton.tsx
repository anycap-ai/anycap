"use client";

import { useState } from "react";
import { savePendingLogin } from "@/lib/auth/session";
import { ProcessingOverlay } from "@/components/ui/ProcessingOverlay";

type Props = {
  returnTo?: string;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
};

export function LoginButton({ returnTo = "/dashboard", className, style, children }: Props) {
  const [loading, setLoading] = useState(false);

  function handleLogin() {
    setLoading(true);
    savePendingLogin({
      returnTo,
      mode: "web",
    });
    window.location.assign(`/api/auth/login?returnTo=${encodeURIComponent("/auth/callback")}`);
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
