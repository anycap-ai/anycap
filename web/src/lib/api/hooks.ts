"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { getSession } from "@/lib/auth/session";
import { createFetcher } from "./client";
import type { User } from "./types";

/** Read apiKey from cookie after mount (avoids hydration mismatch) */
function useApiKey() {
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
  return { ...swr, data: swr.data ?? sessionUser as User | undefined };
}
