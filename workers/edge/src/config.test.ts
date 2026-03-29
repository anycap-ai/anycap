import { describe, expect, it } from "vitest";

import { resolveConfig } from "./config";
import { createEnv } from "./test_helpers";

describe("resolveConfig", () => {
	it("uses defaults when values are missing", () => {
		const config = resolveConfig(createEnv());
		expect(config).toEqual({
			cdnHost: "cdn.anycap.cloud",
			driveHost: "drive.anycap.cloud",
			pageHostPrefix: "page-",
			driveAssetCacheTTLSeconds: 60,
			pageAssetCacheTTLSeconds: 60,
			drivePasswordRateLimitWindowSeconds: 300,
			drivePasswordRateLimitMaxAttempts: 10,
			pagePasswordRateLimitWindowSeconds: 300,
			pagePasswordRateLimitMaxAttempts: 10,
			drivePasswordSessionTTLSeconds: 3600,
			pagePasswordSessionTTLSeconds: 3600,
		});
	});

	it("normalizes hosts and parses positive integer values", () => {
		const config = resolveConfig(
			createEnv({
				CDN_HOST: " CDN.EXAMPLE.COM ",
				DRIVE_HOST: " DRIVE.EXAMPLE.COM ",
				PAGE_HOST_PREFIX: "pages",
				DRIVE_STATIC_ASSET_CACHE_TTL_SECONDS: "120",
				PAGE_STATIC_ASSET_CACHE_TTL_SECONDS: "-1",
				DRIVE_PASSWORD_RATE_LIMIT_WINDOW_SECONDS: "900",
				DRIVE_PASSWORD_RATE_LIMIT_MAX_ATTEMPTS: "abc",
				PAGE_PASSWORD_RATE_LIMIT_WINDOW_SECONDS: " 75 ",
				PAGE_PASSWORD_RATE_LIMIT_MAX_ATTEMPTS: "0",
				DRIVE_PASSWORD_SESSION_TTL_SECONDS: "7200",
				PAGE_PASSWORD_SESSION_TTL_SECONDS: "x",
			}),
		);

		expect(config.cdnHost).toBe("cdn.example.com");
		expect(config.driveHost).toBe("drive.example.com");
		expect(config.pageHostPrefix).toBe("pages-");
		expect(config.driveAssetCacheTTLSeconds).toBe(120);
		expect(config.pageAssetCacheTTLSeconds).toBe(60);
		expect(config.drivePasswordRateLimitWindowSeconds).toBe(900);
		expect(config.drivePasswordRateLimitMaxAttempts).toBe(10);
		expect(config.pagePasswordRateLimitWindowSeconds).toBe(75);
		expect(config.pagePasswordRateLimitMaxAttempts).toBe(10);
		expect(config.drivePasswordSessionTTLSeconds).toBe(7200);
		expect(config.pagePasswordSessionTTLSeconds).toBe(3600);
	});
});
