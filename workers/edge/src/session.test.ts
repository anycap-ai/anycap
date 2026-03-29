import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createSessionCookie, isSessionValid } from "./session";
import { createEnv, extractCookiePair } from "./test_helpers";

describe("session", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-03-29T00:00:00Z"));
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("creates and validates a signed session cookie", async () => {
		const env = createEnv({
			EDGE_SESSION_SECRET: "edge_session_secret",
		});
		const setCookie = await createSessionCookie(env, "ac_drive_auth", "drive", "share_token", 60);
		const req = new Request("https://drive.anycap.cloud/s/share_token", {
			headers: {
				cookie: extractCookiePair(setCookie),
			},
		});

		await expect(isSessionValid(env, req, "ac_drive_auth", "drive", "share_token")).resolves.toBe(true);
		await expect(isSessionValid(env, req, "ac_drive_auth", "drive", "another")).resolves.toBe(false);
		await expect(isSessionValid(env, req, "ac_drive_auth", "page", "share_token")).resolves.toBe(false);
	});

	it("rejects tampered cookie signatures", async () => {
		const env = createEnv();
		const setCookie = await createSessionCookie(env, "ac_page_auth", "page", "site.anycap.cloud", 120);
		const pair = extractCookiePair(setCookie);
		const tampered = pair.slice(0, -1) + (pair.endsWith("a") ? "b" : "a");
		const req = new Request("https://page-site.anycap.cloud", {
			headers: {
				cookie: tampered,
			},
		});

		await expect(isSessionValid(env, req, "ac_page_auth", "page", "site.anycap.cloud")).resolves.toBe(false);
	});

	it("rejects expired cookie", async () => {
		const env = createEnv();
		const setCookie = await createSessionCookie(env, "ac_drive_auth", "drive", "share_token", 1);
		const req = new Request("https://drive.anycap.cloud/s/share_token", {
			headers: {
				cookie: extractCookiePair(setCookie),
			},
		});

		vi.setSystemTime(Date.now() + 2_000);
		await expect(isSessionValid(env, req, "ac_drive_auth", "drive", "share_token")).resolves.toBe(false);
	});

	it("uses ANYCAP_PASSWORD_PEPPER as secret fallback", async () => {
		const env = createEnv({
			EDGE_SESSION_SECRET: "",
			ANYCAP_PASSWORD_PEPPER: "pepper_only_secret",
		});
		const setCookie = await createSessionCookie(env, "ac_page_auth", "page", "page-site.anycap.cloud", 30);
		const req = new Request("https://page-site.anycap.cloud", {
			headers: {
				cookie: extractCookiePair(setCookie),
			},
		});

		await expect(isSessionValid(env, req, "ac_page_auth", "page", "page-site.anycap.cloud")).resolves.toBe(true);
	});

	it("throws when no session secret is available", async () => {
		const env = createEnv({
			EDGE_SESSION_SECRET: "",
			ANYCAP_PASSWORD_PEPPER: "",
		});
		await expect(createSessionCookie(env, "ac_page_auth", "page", "page-site.anycap.cloud", 60)).rejects.toThrow(
			"missing EDGE_SESSION_SECRET",
		);
	});
});
