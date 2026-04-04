"use client";

import { SWRConfig } from "swr";

// Build-time gate: when env var is unset, bundler eliminates the require and
// the entire mock module is excluded from the production bundle.
const MOCK_BUILD =
  process.env.NEXT_PUBLIC_ENABLE_MOCK === "1" ||
  process.env.NEXT_PUBLIC_ENABLE_MOCK === "true";

const mockModule = MOCK_BUILD ? require("@/lib/api/mock") : null;

export function SWRProvider({ children }: { children: React.ReactNode }) {
  const mock = MOCK_BUILD && mockModule?.isMockEnabled();

  return (
    <SWRConfig
      value={{
        revalidateOnFocus: !mock,
        revalidateOnReconnect: !mock,
        dedupingInterval: 5000,
        errorRetryCount: mock ? 0 : 2,
        ...(mock ? { use: [mockModule.mockMiddleware] } : {}),
        onError(err) {
          if (!mock && (err as any)?.status === 401) {
            window.location.assign("/auth/login?return_to=" + encodeURIComponent(window.location.pathname));
          }
        },
      }}
    >
      {children}
    </SWRConfig>
  );
}
