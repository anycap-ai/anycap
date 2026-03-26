export const SESSION_COOKIE_NAME = "anycap_session";
export const LOGIN_COOKIE_NAME = "anycap_login";
export const DEVICE_CODE_COOKIE_NAME = "device_user_code";

const sessionMaxAge = 60 * 60 * 24 * 30;
const loginMaxAge = 60 * 15;
const deviceCodeMaxAge = 60 * 10;

const defaultCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

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

export type LoginPayload = {
  loginSessionID: string;
  returnTo: string;
  mode?: "web" | "browser_poll";
  browserToken?: string;
  issuedAt: number;
};

export type DeviceCodePayload = {
  userCode: string;
  issuedAt: number;
};

function cookieSecret(): string {
  return process.env.ANYCAP_WEB_COOKIE_SECRET || "anycap-dev-cookie-secret";
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function toBase64URL(value: string): string {
  const bytes = encoder.encode(value);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64URL(value: string): string {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return decoder.decode(bytes);
}

async function getSigningKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(cookieSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
}

async function sign(input: string): Promise<string> {
  const key = await getSigningKey();
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(input));
  let binary = "";
  for (const b of new Uint8Array(sig)) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function encodeSignedJSON<T>(payload: T): Promise<string> {
  const body = toBase64URL(JSON.stringify(payload));
  const signature = await sign(body);
  return `${body}.${signature}`;
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

async function decodeSignedJSON<T>(raw: string | undefined): Promise<T | null> {
  if (!raw) {
    return null;
  }
  const parts = raw.split(".");
  if (parts.length !== 2) {
    return null;
  }
  const [body, signature] = parts;
  if (!body || !signature) {
    return null;
  }

  const expected = await sign(body);
  if (!timingSafeEqual(expected, signature)) {
    return null;
  }

  try {
    return JSON.parse(fromBase64URL(body)) as T;
  } catch {
    return null;
  }
}

function getCookieValue(cookies: CookieReadStore, name: string): string | undefined {
  return cookies.get(name)?.value;
}

export async function setSessionCookie(cookies: CookieWriteStore, session: SessionPayload): Promise<void> {
  cookies.set(SESSION_COOKIE_NAME, await encodeSignedJSON(session), {
    ...defaultCookieOptions,
    maxAge: sessionMaxAge,
  });
}

export async function setLoginCookie(cookies: CookieWriteStore, login: LoginPayload): Promise<void> {
  cookies.set(LOGIN_COOKIE_NAME, await encodeSignedJSON(login), {
    ...defaultCookieOptions,
    maxAge: loginMaxAge,
  });
}

export async function setDeviceCodeCookie(cookies: CookieWriteStore, payload: DeviceCodePayload): Promise<void> {
  cookies.set(DEVICE_CODE_COOKIE_NAME, await encodeSignedJSON(payload), {
    ...defaultCookieOptions,
    maxAge: deviceCodeMaxAge,
  });
}

export function clearAuthCookies(cookies: CookieWriteStore): void {
  cookies.delete(SESSION_COOKIE_NAME);
  cookies.delete(LOGIN_COOKIE_NAME);
  cookies.delete(DEVICE_CODE_COOKIE_NAME);
}

export function clearLoginCookie(cookies: CookieWriteStore): void {
  cookies.delete(LOGIN_COOKIE_NAME);
}

export function clearDeviceCodeCookie(cookies: CookieWriteStore): void {
  cookies.delete(DEVICE_CODE_COOKIE_NAME);
}

export function readSessionCookie(cookies: CookieReadStore): Promise<SessionPayload | null> {
  return decodeSignedJSON<SessionPayload>(getCookieValue(cookies, SESSION_COOKIE_NAME));
}

export function readLoginCookie(cookies: CookieReadStore): Promise<LoginPayload | null> {
  return decodeSignedJSON<LoginPayload>(getCookieValue(cookies, LOGIN_COOKIE_NAME));
}

export function readDeviceCodeCookie(cookies: CookieReadStore): Promise<DeviceCodePayload | null> {
  return decodeSignedJSON<DeviceCodePayload>(getCookieValue(cookies, DEVICE_CODE_COOKIE_NAME));
}

export function normalizeReturnTo(raw: string | null | undefined, fallback = "/dashboard"): string {
  if (!raw) {
    return fallback;
  }
  if (!raw.startsWith("/") || raw.startsWith("//")) {
    return fallback;
  }
  if (raw.startsWith("/auth/")) {
    return fallback;
  }
  return raw;
}

export function normalizeUserCode(raw: string | null | undefined): string {
  if (!raw) {
    return "";
  }
  return raw.trim().toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 32);
}
type CookieReadStore = {
  get(name: string): { value: string } | undefined;
};

type CookieWriteStore = {
  set(
    name: string,
    value: string,
    options: {
      httpOnly: boolean;
      secure: boolean;
      sameSite: "lax" | "strict" | "none";
      path: string;
      maxAge: number;
    },
  ): void;
  delete(name: string): void;
};
