"use client";

import { useState } from "react";
import { ProcessingOverlay } from "@/components/ui/ProcessingOverlay";

type Props = {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
};

export function LogoutButton({ className, style, children }: Props) {
  const [loading, setLoading] = useState(false);

  function handleLogout() {
    setLoading(true);
    sessionStorage.removeItem("anycap_login");
    window.location.assign("/api/auth/logout?returnTo=/for-human");
  }

  return (
    <>
      <button type="button" onClick={handleLogout} className={className} style={style}>
        {children ?? "Logout"}
      </button>
      {loading && <ProcessingOverlay message="Logging out" />}
    </>
  );
}
