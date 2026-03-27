export const PENDING_LOGIN_KEY = "anycap_login";

export type PendingLoginState = {
  returnTo: string;
  mode?: "web" | "browser_poll" | "cli_login";
  browserToken?: string;
  deviceCode?: string;
  loginSessionID?: string;
};

export function normalizeReturnTo(raw: string | null | undefined, fallback = "/dashboard"): string {
  if (!raw) return fallback;
  if (!raw.startsWith("/") || raw.startsWith("//")) return fallback;
  if (raw.startsWith("/auth/")) return fallback;
  return raw;
}

export function normalizeUserCode(raw: string | null | undefined): string {
  if (!raw) return "";
  return raw.trim().toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 32);
}

export function savePendingLogin(state: PendingLoginState): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(PENDING_LOGIN_KEY, JSON.stringify(state));
}

export function consumePendingLogin(): PendingLoginState | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(PENDING_LOGIN_KEY);
  sessionStorage.removeItem(PENDING_LOGIN_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PendingLoginState;
  } catch {
    return null;
  }
}
