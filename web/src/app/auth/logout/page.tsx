"use client";

import { useEffect } from "react";
import { ProcessingOverlay } from "@/components/ui/ProcessingOverlay";

export const runtime = "edge";

export default function LogoutPage() {
  useEffect(() => {
    sessionStorage.removeItem("anycap_login");
    window.location.assign("/api/auth/logout?returnTo=/for-human");
  }, []);

  return <ProcessingOverlay message="Logging out" />;
}
