"use client";

import { getAccessToken } from "@auth0/nextjs-auth0/client";
import useSWR from "swr";
import { anycapGet } from "./client";
import type { Balance, DashboardSummary, LogsResult, User } from "./types";

async function fetchWithAccessToken<T>(path: string): Promise<T> {
  const bearerToken = await getAccessToken();
  return anycapGet<T>(path, { bearerToken });
}

export function useUser() {
  return useSWR<User>("/v1/me", fetchWithAccessToken);
}

export function useDashboardSummary() {
  return useSWR<DashboardSummary>("/v1/dashboard/summary", fetchWithAccessToken);
}

export function useLogs(limit = 20) {
  return useSWR<LogsResult>(`/v1/logs?limit=${limit}`, fetchWithAccessToken);
}

export function useBalance() {
  return useSWR<Balance>("/v1/credits/balance", fetchWithAccessToken);
}
