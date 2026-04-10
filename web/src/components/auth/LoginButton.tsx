"use client";

import { useState } from "react";
import type { ButtonHTMLAttributes } from "react";
import { savePendingLogin } from "@/lib/auth/session";
import { ProcessingOverlay } from "@/components/ui/ProcessingOverlay";

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type" | "onClick"> & {
  returnTo?: string;
};

export function LoginButton({
  returnTo = "/dashboard",
  className,
  style,
  children,
  ...props
}: Props) {
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
      <button
        type="button"
        onClick={handleLogin}
        className={className}
        style={style}
        {...props}
      >
        {children ?? "Login"}
      </button>
      {loading && <ProcessingOverlay message="Redirecting to login" />}
    </>
  );
}
