"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { getSession } from "@/lib/auth/session";
import { createFetcher } from "./client";
import type { User, Balance, DashboardSummary, LogsResult } from "./types";

/** Read apiKey from cookie after mount (avoids hydration mismatch) */
export function useApiKey() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  useEffect(() => {
    setApiKey(getSession()?.apiKey ?? null);
  }, []);
  return apiKey;
}

/** Read session user as fallback (after mount) */
function useSessionUser(): Partial<User> | undefined {
  const [user, setUser] = useState<Partial<User> | undefined>(undefined);
  useEffect(() => {
    const s = getSession();
    if (s?.user) setUser(s.user);
  }, []);
  return user;
}

/** Fetch current user profile from GET /v1/me, falls back to session data */
export function useUser() {
  const apiKey = useApiKey();
  const sessionUser = useSessionUser();
  const fetcher = apiKey ? createFetcher(apiKey) : null;
  const swr = useSWR<User>(fetcher ? "/v1/me" : null, fetcher!);
  return { ...swr, data: swr.data ?? (sessionUser as User | undefined) };
}

/** Fetch dashboard summary from GET /v1/dashboard/summary */
export function useDashboardSummary() {
  const apiKey = useApiKey();
  const fetcher = apiKey ? createFetcher(apiKey) : null;
  return useSWR<DashboardSummary>(
    fetcher ? "/v1/dashboard/summary" : null,
    fetcher!,
  );
}

/** Fetch activity logs from GET /v1/logs */
export function useLogs(limit = 20) {
  const apiKey = useApiKey();
  const fetcher = apiKey ? createFetcher(apiKey) : null;
  return useSWR<LogsResult>(
    fetcher ? `/v1/logs?limit=${limit}` : null,
    fetcher!,
  );
}

/** Fetch credit balance from GET /v1/credits/balance */
export function useBalance() {
  const apiKey = useApiKey();
  const fetcher = apiKey ? createFetcher(apiKey) : null;
  return useSWR<Balance>(
    fetcher ? "/v1/credits/balance" : null,
    fetcher!,
  );
}
