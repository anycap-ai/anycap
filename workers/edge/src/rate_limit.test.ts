import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { hitRateLimit } from "./rate_limit";
import { createEnv, createMockKV } from "./test_helpers";

describe("hitRateLimit", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-03-29T00:00:00Z"));
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("increments counter and blocks after reaching max attempts in one window", async () => {
		const kv = createMockKV();
		const env = createEnv({ EDGE_KV: kv.namespace });
		const options = {
			scope: "drive_password" as const,
			key: "token-a",
			ip: "1.2.3.4",
			windowSeconds: 60,
			maxAttempts: 2,
		};
		const bucket = Math.floor(Math.floor(Date.now() / 1000) / options.windowSeconds);
		const expectedKey = `rl:${options.scope}:${options.key}:${options.ip}:${bucket}`;

		await expect(hitRateLimit(env, options)).resolves.toBe(false);
		await expect(hitRateLimit(env, options)).resolves.toBe(false);
		await expect(hitRateLimit(env, options)).resolves.toBe(true);

		expect(kv.store.get(expectedKey)).toBe("2");
		expect(kv.putCalls).toHaveLength(2);
		expect(kv.putCalls[0]).toEqual({
			key: expectedKey,
			value: "1",
			expirationTtl: options.windowSeconds + 5,
		});
	});

	it("resets in a new time bucket", async () => {
		const kv = createMockKV();
		const env = createEnv({ EDGE_KV: kv.namespace });
		const options = {
			scope: "page_password" as const,
			key: "page.example.com",
			ip: "5.6.7.8",
			windowSeconds: 30,
			maxAttempts: 1,
		};

		await expect(hitRateLimit(env, options)).resolves.toBe(false);
		await expect(hitRateLimit(env, options)).resolves.toBe(true);

		vi.setSystemTime(Date.now() + 31_000);
		await expect(hitRateLimit(env, options)).resolves.toBe(false);
		expect(kv.putCalls).toHaveLength(2);
	});

	it("does nothing when limit configuration is invalid", async () => {
		const kv = createMockKV();
		const env = createEnv({ EDGE_KV: kv.namespace });
		await expect(
			hitRateLimit(env, {
				scope: "drive_password",
				key: "token-b",
				ip: "9.9.9.9",
				windowSeconds: 0,
				maxAttempts: 2,
			}),
		).resolves.toBe(false);
		await expect(
			hitRateLimit(env, {
				scope: "drive_password",
				key: "token-b",
				ip: "9.9.9.9",
				windowSeconds: 60,
				maxAttempts: -1,
			}),
		).resolves.toBe(false);
		expect(kv.putCalls).toHaveLength(0);
	});
});
