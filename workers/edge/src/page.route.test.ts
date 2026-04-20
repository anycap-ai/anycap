import { describe, expect, it } from "vitest";

import { handlePage } from "./page";
import type { EdgeConfig } from "./config";
import { createEnv, createMockKV, createMockR2, setKVJSON } from "./test_helpers";

function testConfig(): EdgeConfig {
	return {
		driveHost: "drive.anycap.cloud",
		pageHostPrefix: "page-",
		pagePreviewHostPrefix: "preview-page-",
		driveAssetCacheTTLSeconds: 0,
		pageAssetCacheTTLSeconds: 0,
		drivePasswordRateLimitWindowSeconds: 300,
		drivePasswordRateLimitMaxAttempts: 10,
		pagePasswordRateLimitWindowSeconds: 300,
		pagePasswordRateLimitMaxAttempts: 10,
		drivePasswordSessionTTLSeconds: 3600,
		pagePasswordSessionTTLSeconds: 3600,
	};
}

describe("handlePage route", () => {
	it("serves index.html for public page", async () => {
		const kv = createMockKV();
		const r2 = createMockR2({
			"page/spaces/1/sites/9/versions/2/index.html": {
				body: "<h1>home</h1>",
				contentType: "text/html; charset=utf-8",
			},
		});
		setKVJSON(kv.store, "page:host:page-docs.anycap.cloud", {
			page_id: 9,
			space_id: 1,
			current_version_id: 2,
			asset_prefix: "page/spaces/1/sites/9/versions/2",
			spa_fallback: false,
			access_mode: "public",
		});

		const env = createEnv({
			EDGE_KV: kv.namespace,
			ANYCAP_CLOUD_R2: r2.bucket,
		});
		const response = await handlePage(new Request("https://page-docs.anycap.cloud/"), env, testConfig());
		const body = await response.text();

		expect(response.status).toBe(200);
		expect(response.headers.get("content-type")).toContain("text/html");
		expect(body).toContain("home");
	});

	it("uses convention routing for extensionless path", async () => {
		const kv = createMockKV();
		const r2 = createMockR2({
			"page/spaces/1/sites/9/versions/2/about.html": {
				body: "<h1>about</h1>",
				contentType: "text/html; charset=utf-8",
			},
		});
		setKVJSON(kv.store, "page:host:page-docs.anycap.cloud", {
			page_id: 9,
			space_id: 1,
			current_version_id: 2,
			asset_prefix: "page/spaces/1/sites/9/versions/2",
			spa_fallback: false,
			access_mode: "public",
		});

		const env = createEnv({
			EDGE_KV: kv.namespace,
			ANYCAP_CLOUD_R2: r2.bucket,
		});
		const response = await handlePage(new Request("https://page-docs.anycap.cloud/about"), env, testConfig());
		const body = await response.text();

		expect(response.status).toBe(200);
		expect(body).toContain("about");
	});

	it("returns password page for password-protected site without session", async () => {
		const kv = createMockKV();
		const r2 = createMockR2();
		setKVJSON(kv.store, "page:host:page-docs.anycap.cloud", {
			page_id: 9,
			space_id: 1,
			current_version_id: 2,
			asset_prefix: "page/spaces/1/sites/9/versions/2",
			spa_fallback: false,
			access_mode: "password",
			password_hash: "pbkdf2_sha256$1000$v1$hash",
			password_salt: "salt",
		});

		const env = createEnv({
			EDGE_KV: kv.namespace,
			ANYCAP_CLOUD_R2: r2.bucket,
		});
		const response = await handlePage(new Request("https://page-docs.anycap.cloud/"), env, testConfig());
		const body = await response.text();

		expect(response.status).toBe(200);
		expect(body).toContain("Password required");
		expect(body).toContain("/__auth/password");
		expect(body).toContain("data-password-form");
		expect(body).toContain("Unlocking...");
		expect(body).toContain("Verifying password and preparing content...");
	});

	it("returns 404 when site is unpublished", async () => {
		const kv = createMockKV();
		const r2 = createMockR2();
		setKVJSON(kv.store, "page:host:page-docs.anycap.cloud", {
			page_id: 9,
			space_id: 1,
			current_version_id: 0,
			asset_prefix: "page/spaces/1/sites/9/versions/2",
			spa_fallback: false,
			access_mode: "public",
		});

		const env = createEnv({
			EDGE_KV: kv.namespace,
			ANYCAP_CLOUD_R2: r2.bucket,
		});
		const response = await handlePage(new Request("https://page-docs.anycap.cloud/"), env, testConfig());

		expect(response.status).toBe(404);
	});

	it("serves preview host and marks response private no-store", async () => {
		const kv = createMockKV();
		const r2 = createMockR2({
			"page/spaces/1/sites/9/versions/2/index.html": {
				body: "<h1>preview</h1>",
				contentType: "text/html; charset=utf-8",
			},
		});
		setKVJSON(kv.store, "page:host:preview-page-pprv-abc.anycap.cloud", {
			page_id: 9,
			space_id: 1,
			current_version_id: 2,
			asset_prefix: "page/spaces/1/sites/9/versions/2",
			spa_fallback: false,
			show_badge: true,
			access_mode: "public",
			preview: true,
			expires_at: "2099-01-01T00:00:00Z",
		});

		const env = createEnv({
			EDGE_KV: kv.namespace,
			ANYCAP_CLOUD_R2: r2.bucket,
		});
		const response = await handlePage(new Request("https://preview-page-pprv-abc.anycap.cloud/"), env, testConfig());
		const body = await response.text();

		expect(response.status).toBe(200);
		expect(body).toContain("preview");
		expect(response.headers.get("cache-control")).toBe("private, no-store");
	});

	it("returns 410 for expired preview host", async () => {
		const kv = createMockKV();
		const r2 = createMockR2();
		setKVJSON(kv.store, "page:host:preview-page-pprv-expired.anycap.cloud", {
			page_id: 9,
			space_id: 1,
			current_version_id: 2,
			asset_prefix: "page/spaces/1/sites/9/versions/2",
			spa_fallback: false,
			access_mode: "public",
			preview: true,
			expires_at: "2020-01-01T00:00:00Z",
		});

		const env = createEnv({
			EDGE_KV: kv.namespace,
			ANYCAP_CLOUD_R2: r2.bucket,
		});
		const response = await handlePage(new Request("https://preview-page-pprv-expired.anycap.cloud/"), env, testConfig());

		expect(response.status).toBe(410);
		expect(response.headers.get("cache-control")).toBe("private, no-store");
	});
});
