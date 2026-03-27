"use client";

import { getAccessToken } from "@auth0/nextjs-auth0/client";
import useSWR from "swr";
import { anycapGet } from "./client";
import type { User } from "./types";

async function fetchWithAccessToken<T>(path: string): Promise<T> {
  const bearerToken = await getAccessToken();
  return anycapGet<T>(path, { bearerToken });
}

/** Fetch current user profile from GET /v1/me using Auth0 access token */
export function useUser() {
  return useSWR<User>("/v1/me", fetchWithAccessToken);
}
