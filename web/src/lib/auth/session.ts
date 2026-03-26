import { createHmac, timingSafeEqual } from "crypto";

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
  issuedAt: number;
};

export type DeviceCodePayload = {
  userCode: string;
  issuedAt: number;
};

function cookieSecret(): string {
  return process.env.ANYCAP_WEB_COOKIE_SECRET || "anycap-dev-cookie-secret";
}

function toBase64URL(value: string): string {
  return Buffer.from(value, "utf-8").toString("base64url");
}

function fromBase64URL(value: string): string {
  return Buffer.from(value, "base64url").toString("utf-8");
}

function sign(input: string): string {
  return createHmac("sha256", cookieSecret()).update(input).digest("base64url");
}

function encodeSignedJSON<T>(payload: T): string {
  const body = toBase64URL(JSON.stringify(payload));
  const signature = sign(body);
  return `${body}.${signature}`;
}

function decodeSignedJSON<T>(raw: string | undefined): T | null {
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

  const expected = sign(body);
  const expectedBuf = Buffer.from(expected, "utf-8");
  const actualBuf = Buffer.from(signature, "utf-8");
  if (expectedBuf.length !== actualBuf.length || !timingSafeEqual(expectedBuf, actualBuf)) {
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

export function setSessionCookie(cookies: CookieWriteStore, session: SessionPayload): void {
  cookies.set(SESSION_COOKIE_NAME, encodeSignedJSON(session), {
    ...defaultCookieOptions,
    maxAge: sessionMaxAge,
  });
}

export function setLoginCookie(cookies: CookieWriteStore, login: LoginPayload): void {
  cookies.set(LOGIN_COOKIE_NAME, encodeSignedJSON(login), {
    ...defaultCookieOptions,
    maxAge: loginMaxAge,
  });
}

export function setDeviceCodeCookie(cookies: CookieWriteStore, payload: DeviceCodePayload): void {
  cookies.set(DEVICE_CODE_COOKIE_NAME, encodeSignedJSON(payload), {
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

export function readSessionCookie(cookies: CookieReadStore): SessionPayload | null {
  return decodeSignedJSON<SessionPayload>(getCookieValue(cookies, SESSION_COOKIE_NAME));
}

export function readLoginCookie(cookies: CookieReadStore): LoginPayload | null {
  return decodeSignedJSON<LoginPayload>(getCookieValue(cookies, LOGIN_COOKIE_NAME));
}

export function readDeviceCodeCookie(cookies: CookieReadStore): DeviceCodePayload | null {
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
