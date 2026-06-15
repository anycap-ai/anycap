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
  // Headless device login needs to land on a trusted auth-hosted completion page.
  if (raw === "/auth/device/complete" || raw.startsWith("/auth/device/complete?")) {
    return raw;
  }
  if (raw.startsWith("/auth/")) return fallback;
  return raw;
}

export function normalizeUserCode(raw: string | null | undefined): string {
  if (!raw) return "";
  return raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
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

const COOKIE_KEY = "anycap_pending_login";

export function savePendingLoginCookie(state: PendingLoginState): void {
  if (typeof document === "undefined") return;
  const encoded = encodeURIComponent(JSON.stringify(state));
  document.cookie = `${COOKIE_KEY}=${encoded}; path=/; max-age=900; samesite=lax`;
}

export function consumePendingLoginCookie(): PendingLoginState | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${COOKIE_KEY}=([^;]+)`),
  );
  if (!match) return null;
  document.cookie = `${COOKIE_KEY}=; path=/; max-age=0`;
  try {
    return JSON.parse(decodeURIComponent(match[1])) as PendingLoginState;
  } catch {
    return null;
  }
}
