import type { Env } from "./types";

const encoder = new TextEncoder();

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
	if (a.length !== b.length) {
		return false;
	}
	let diff = 0;
	for (let i = 0; i < a.length; i += 1) {
		diff |= a[i] ^ b[i];
	}
	return diff === 0;
}

function decodeBase64(value: string): Uint8Array | null {
	try {
		const binary = atob(value);
		const out = new Uint8Array(binary.length);
		for (let i = 0; i < binary.length; i += 1) {
			out[i] = binary.charCodeAt(i);
		}
		return out;
	} catch {
		return null;
	}
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
	return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

function resolvePepper(env: Env, pepperVersion: string): string {
	if (pepperVersion === "v1" && (env.ANYCAP_PASSWORD_PEPPER || "").trim() !== "") {
		return String(env.ANYCAP_PASSWORD_PEPPER);
	}
	const dynamicKey = `ANYCAP_PASSWORD_PEPPER_${pepperVersion.toUpperCase().replaceAll(/[^A-Z0-9]/g, "_")}`;
	const dynamicValue = (env as Record<string, unknown>)[dynamicKey];
	if (typeof dynamicValue === "string" && dynamicValue.trim() !== "") {
		return dynamicValue;
	}
	return "";
}

export async function verifyPBKDF2Password(
	env: Env,
	password: string,
	passwordHash: string,
	passwordSalt: string,
): Promise<boolean> {
	const parts = passwordHash.split("$");
	if (parts.length !== 4) {
		return false;
	}
	const [algo, iterRaw, pepperVersion, hashB64] = parts;
	if (algo !== "pbkdf2_sha256") {
		return false;
	}
	const iterations = Number.parseInt(iterRaw, 10);
	if (!Number.isInteger(iterations) || iterations <= 0) {
		return false;
	}

	const pepper = resolvePepper(env, pepperVersion);
	if (!pepper) {
		return false;
	}

	const saltBytes = decodeBase64(passwordSalt);
	const expectedHash = decodeBase64(hashB64);
	if (!saltBytes || !expectedHash) {
		return false;
	}

	const keyMaterial = await crypto.subtle.importKey(
		"raw",
		encoder.encode(password + pepper),
		"PBKDF2",
		false,
		["deriveBits"],
	);

	const derived = await crypto.subtle.deriveBits(
		{
			name: "PBKDF2",
			hash: "SHA-256",
			salt: toArrayBuffer(saltBytes),
			iterations,
		},
		keyMaterial,
		expectedHash.length * 8,
	);
	const actualHash = new Uint8Array(derived);
	return timingSafeEqual(actualHash, expectedHash);
}
