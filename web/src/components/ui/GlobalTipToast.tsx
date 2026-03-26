"use client";

import { useEffect, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { resolveTipMessage } from "@/lib/tip";
import { TipToast } from "./TipToast";

export function GlobalTipToast() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const message = useMemo(() => resolveTipMessage(searchParams), [searchParams]);

  useEffect(() => {
    if (!message) {
      return;
    }
    const next = new URLSearchParams(searchParams.toString());
    next.delete("tip");
    next.delete("auth_error");
    const query = next.toString();
    const nextURL = query ? `${pathname}?${query}` : pathname;
    router.replace(nextURL, { scroll: false });
  }, [message, pathname, router, searchParams]);

  return <TipToast message={message} />;
}
