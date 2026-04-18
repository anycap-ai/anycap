"use client";

import { usePathname } from "next/navigation";
import { LazyGlobalTipToast } from "@/components/ui/LazyGlobalTipToast";
import { GrainOverlay } from "@/components/ui/GrainOverlay";

const LOCALE_PREFIX = /^\/(en|pt-br|id|de)(?=\/|$)/i;

function normalizePathname(pathname: string | null): string {
  if (!pathname) {
    return "/";
  }

  const stripped = pathname.replace(LOCALE_PREFIX, "");
  if (!stripped) {
    return "/";
  }

  return stripped.startsWith("/") ? stripped : `/${stripped}`;
}

function shouldShowGlobalUi(pathname: string): boolean {
  return pathname === "/" || pathname.startsWith("/auth") || pathname.startsWith("/dashboard");
}

export function GlobalUiChrome() {
  const pathname = usePathname();
  const normalizedPathname = normalizePathname(pathname);
  const showGlobalUi = shouldShowGlobalUi(normalizedPathname);

  if (!showGlobalUi) {
    return null;
  }

  return (
    <>
      <LazyGlobalTipToast />
      <GrainOverlay />
    </>
  );
}
