import type { Env } from "./types";

const encoder = new TextEncoder();

type SessionPayload = {
	scope: "drive" | "page";
	key: string;
	exp: number;
};

function getSessionSecret(env: Env): string {
	const explicit = (env.EDGE_SESSION_SECRET || "").trim();
	if (explicit) {
		return explicit;
	}
	const fallback = (env.ANYCAP_PASSWORD_PEPPER || "").trim();
	if (fallback) {
		return fallback;
	}
	throw new Error("missing EDGE_SESSION_SECRET (or ANYCAP_PASSWORD_PEPPER fallback)");
}

function toBase64URL(bytes: Uint8Array): string {
	let binary = "";
	for (const b of bytes) {
		binary += String.fromCharCode(b);
	}
	return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function fromBase64URL(value: string): Uint8Array | null {
	try {
		const padded = value.replaceAll("-", "+").replaceAll("_", "/") + "=".repeat((4 - (value.length % 4 || 4)) % 4);
		const binary = atob(padded);
		const bytes = new Uint8Array(binary.length);
		for (let i = 0; i < binary.length; i += 1) {
			bytes[i] = binary.charCodeAt(i);
		}
		return bytes;
	} catch {
		return null;
	}
}

async function sign(env: Env, content: string): Promise<string> {
	const key = await crypto.subtle.importKey(
		"raw",
		encoder.encode(getSessionSecret(env)),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"],
	);
	const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(content));
	return toBase64URL(new Uint8Array(signature));
}

function parseCookie(cookieHeader: string | null, cookieName: string): string | null {
	if (!cookieHeader) {
		return null;
	}
	const parts = cookieHeader.split(";");
	for (const part of parts) {
		const trimmed = part.trim();
		if (trimmed.startsWith(`${cookieName}=`)) {
			return trimmed.slice(cookieName.length + 1);
		}
	}
	return null;
}

export async function createSessionCookie(
	env: Env,
	cookieName: string,
	scope: "drive" | "page",
	key: string,
	ttlSeconds: number,
): Promise<string> {
	const payload: SessionPayload = {
		scope,
		key,
		exp: Math.floor(Date.now() / 1000) + ttlSeconds,
	};
	const rawPayload = JSON.stringify(payload);
	const encodedPayload = toBase64URL(encoder.encode(rawPayload));
	const signature = await sign(env, encodedPayload);
	const value = `${encodedPayload}.${signature}`;
	return `${cookieName}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${ttlSeconds}`;
}

export async function clearSessionCookie(cookieName: string): Promise<string> {
	return `${cookieName}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

export async function isSessionValid(
	env: Env,
	req: Request,
	cookieName: string,
	scope: "drive" | "page",
	key: string,
): Promise<boolean> {
	const cookieValue = parseCookie(req.headers.get("cookie"), cookieName);
	if (!cookieValue) {
		return false;
	}
	const parts = cookieValue.split(".");
	if (parts.length !== 2) {
		return false;
	}
	const [encodedPayload, actualSignature] = parts;
	const expectedSignature = await sign(env, encodedPayload);
	if (actualSignature !== expectedSignature) {
		return false;
	}
	const payloadBytes = fromBase64URL(encodedPayload);
	if (!payloadBytes) {
		return false;
	}
	try {
		const payload = JSON.parse(new TextDecoder().decode(payloadBytes)) as SessionPayload;
		const now = Math.floor(Date.now() / 1000);
		return payload.scope === scope && payload.key === key && payload.exp > now;
	} catch {
		return false;
	}
}
