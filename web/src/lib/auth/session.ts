export const SESSION_COOKIE = "anycap_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export type SessionUser = {
  id: string;
  email?: string;
  name?: string;
};

export type SessionPayload = {
  apiKey: string;
  user: SessionUser;
  issuedAt: number;
};

/* ---- encoding ---- */

function toBase64URL(str: string): string {
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64URL(str: string): string {
  return atob(str.replace(/-/g, "+").replace(/_/g, "/"));
}

function encodePayload(payload: SessionPayload): string {
  return toBase64URL(JSON.stringify(payload));
}

function decodePayload(raw: string | undefined): SessionPayload | null {
  if (!raw) return null;
  try {
    return JSON.parse(fromBase64URL(raw)) as SessionPayload;
  } catch {
    return null;
  }
}

/* ---- client-side (browser) ---- */

export function getSession(): SessionPayload | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${SESSION_COOKIE}=([^;]*)`));
  return match ? decodePayload(match[1]) : null;
}

export function setSessionCookie(session: SessionPayload): void {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${SESSION_COOKIE}=${encodePayload(session)}; Path=/; Max-Age=${SESSION_MAX_AGE}; SameSite=Lax${secure}`;
}

export function clearSessionCookie(): void {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${SESSION_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax${secure}`;
}

/* ---- server-side (middleware, server components) ---- */

type CookieStore = {
  get(name: string): { value: string } | undefined;
};

export function readSessionFromStore(cookies: CookieStore): SessionPayload | null {
  return decodePayload(cookies.get(SESSION_COOKIE)?.value);
}

/* ---- helpers ---- */

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
