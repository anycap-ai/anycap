"use client";

import { SWRConfig } from "swr";
import { clearSessionCookie } from "@/lib/auth/session";

export function SWRProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
        dedupingInterval: 5000,
        errorRetryCount: 2,
        onError(err) {
          if ((err as any)?.status === 401) {
            clearSessionCookie();
            window.location.assign("/auth/login?return_to=" + encodeURIComponent(window.location.pathname));
          }
        },
      }}
    >
      {children}
    </SWRConfig>
  );
}
