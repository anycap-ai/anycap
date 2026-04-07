"use client";

import { useEffect } from "react";
import { buildLogoutURL } from "@/lib/auth/logout";
import { ProcessingOverlay } from "@/components/ui/ProcessingOverlay";

export const runtime = "edge";

export default function LogoutPage() {
  useEffect(() => {
    sessionStorage.removeItem("anycap_login");
    window.location.assign(buildLogoutURL("/"));
  }, []);

  return <ProcessingOverlay message="Logging out" />;
}
