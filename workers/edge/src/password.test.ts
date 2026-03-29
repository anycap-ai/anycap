import { describe, expect, it } from "vitest";

import { verifyPBKDF2Password } from "./password";
import { createEnv } from "./test_helpers";

const encoder = new TextEncoder();

function toBase64(bytes: Uint8Array): string {
	let binary = "";
	for (const b of bytes) {
		binary += String.fromCharCode(b);
	}
	return btoa(binary);
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
	return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

async function buildPBKDF2Hash(params: {
	password: string;
	pepper: string;
	pepperVersion: string;
	iterations: number;
	salt: Uint8Array;
	length: number;
}): Promise<{ passwordHash: string; passwordSalt: string }> {
	const keyMaterial = await crypto.subtle.importKey(
		"raw",
		encoder.encode(params.password + params.pepper),
		"PBKDF2",
		false,
		["deriveBits"],
	);
	const derived = await crypto.subtle.deriveBits(
		{
			name: "PBKDF2",
			hash: "SHA-256",
			salt: toArrayBuffer(params.salt),
			iterations: params.iterations,
		},
		keyMaterial,
		params.length * 8,
	);
	const hashBytes = new Uint8Array(derived);
	return {
		passwordHash: `pbkdf2_sha256$${params.iterations}$${params.pepperVersion}$${toBase64(hashBytes)}`,
		passwordSalt: toBase64(params.salt),
	};
}

describe("verifyPBKDF2Password", () => {
	it("verifies password with v1 pepper", async () => {
		const env = createEnv({
			ANYCAP_PASSWORD_PEPPER: "pepper_v1_value",
		});
		const password = "pass-1234";
		const built = await buildPBKDF2Hash({
			password,
			pepper: "pepper_v1_value",
			pepperVersion: "v1",
			iterations: 1200,
			salt: new Uint8Array([11, 22, 33, 44, 55, 66, 77, 88]),
			length: 32,
		});

		await expect(verifyPBKDF2Password(env, password, built.passwordHash, built.passwordSalt)).resolves.toBe(true);
		await expect(verifyPBKDF2Password(env, "wrong-pass", built.passwordHash, built.passwordSalt)).resolves.toBe(false);
	});

	it("supports dynamic pepper version env key", async () => {
		const env = createEnv() as ReturnType<typeof createEnv> & Record<string, string>;
		env.ANYCAP_PASSWORD_PEPPER_V2_2026 = "pepper_v2_2026";
		const password = "my-password";
		const built = await buildPBKDF2Hash({
			password,
			pepper: "pepper_v2_2026",
			pepperVersion: "v2-2026",
			iterations: 2000,
			salt: new Uint8Array([90, 91, 92, 93, 94, 95, 96, 97]),
			length: 32,
		});

		await expect(verifyPBKDF2Password(env, password, built.passwordHash, built.passwordSalt)).resolves.toBe(true);
	});

	it("returns false for invalid format or missing pepper", async () => {
		const env = createEnv({
			ANYCAP_PASSWORD_PEPPER: "",
		});
		await expect(verifyPBKDF2Password(env, "pw", "pbkdf2_sha256$100$v1$abcd", "bad**salt")).resolves.toBe(false);
		await expect(verifyPBKDF2Password(env, "pw", "scrypt$100$v1$abcd", "YWJjZA==")).resolves.toBe(false);
		await expect(verifyPBKDF2Password(env, "pw", "pbkdf2_sha256$bad$v1$abcd", "YWJjZA==")).resolves.toBe(false);
		await expect(verifyPBKDF2Password(env, "pw", "pbkdf2_sha256$100$v2$abcd", "YWJjZA==")).resolves.toBe(false);
	});
});
