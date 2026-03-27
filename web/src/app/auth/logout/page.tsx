"use client";

import { useEffect } from "react";
import { clearSessionCookie } from "@/lib/auth/session";
import { ProcessingOverlay } from "@/components/ui/ProcessingOverlay";

export default function LogoutPage() {
  useEffect(() => {
    clearSessionCookie();
    sessionStorage.removeItem("anycap_login");
    window.location.assign("/for-human");
  }, []);

  return <ProcessingOverlay message="Logging out" />;
}
