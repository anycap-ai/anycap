import { describe, expect, it } from "vitest";

import { handleDrive } from "./drive";
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

describe("handleDrive route", () => {
	it("renders folder listing for share root", async () => {
		const kv = createMockKV();
		const r2 = createMockR2();
		setKVJSON(kv.store, "drive:share:token-a", {
			root_node_id: 10,
			root_node_kind: "folder",
			has_password: false,
		});
		setKVJSON(kv.store, "drive:dir:10:children", {
			dir_id: 10,
			space_id: 1,
			items: [{ id: 11, kind: "file", name: "hello.txt" }],
		});
		setKVJSON(kv.store, "drive:dir:10:meta", {
			dir_id: 10,
			parent_id: null,
			space_id: 1,
			name: "Root",
		});

		const env = createEnv({
			EDGE_KV: kv.namespace,
			ANYCAP_CLOUD_R2: r2.bucket,
		});
		const response = await handleDrive(new Request("https://drive.anycap.cloud/s/token-a"), env, testConfig());
		const body = await response.text();

		expect(response.status).toBe(200);
		expect(body).toContain("hello.txt");
		expect(body).toContain("/s/token-a/file/11");
	});

	it("serves preview wrapper for file without raw param", async () => {
		const kv = createMockKV();
		const r2 = createMockR2();
		setKVJSON(kv.store, "drive:share:token-b", {
			root_node_id: 10,
			root_node_kind: "folder",
			has_password: false,
		});
		setKVJSON(kv.store, "drive:file:11", {
			id: 11,
			parent_id: 10,
			space_id: 1,
			name: "archive.bin",
			object_key: "drive/file-11.bin",
			mime: "application/octet-stream",
		});

		const env = createEnv({
			EDGE_KV: kv.namespace,
			ANYCAP_CLOUD_R2: r2.bucket,
		});
		const response = await handleDrive(new Request("https://drive.anycap.cloud/s/token-b/file/11"), env, testConfig());
		const body = await response.text();

		expect(response.status).toBe(200);
		expect(response.headers.get("content-type")).toContain("text/html");
		expect(body).toContain("archive.bin");
		expect(body).toContain("?raw=1");
		expect(body).toContain("anycap.ai");
	});

	it("serves raw file content with ?raw=1", async () => {
		const kv = createMockKV();
		const r2 = createMockR2({
			"drive/file-11.bin": {
				body: "binary-content",
				contentType: "application/octet-stream",
				etag: "etag-11",
			},
		});
		setKVJSON(kv.store, "drive:share:token-b", {
			root_node_id: 10,
			root_node_kind: "folder",
			has_password: false,
		});
		setKVJSON(kv.store, "drive:file:11", {
			id: 11,
			parent_id: 10,
			space_id: 1,
			name: "archive.bin",
			object_key: "drive/file-11.bin",
			mime: "application/octet-stream",
		});

		const env = createEnv({
			EDGE_KV: kv.namespace,
			ANYCAP_CLOUD_R2: r2.bucket,
		});
		const response = await handleDrive(new Request("https://drive.anycap.cloud/s/token-b/file/11?raw=1"), env, testConfig());
		const body = await response.text();

		expect(response.status).toBe(200);
		expect(body).toBe("binary-content");
		expect(response.headers.get("content-type")).toContain("application/octet-stream");
		expect(response.headers.get("etag")).toBe("etag-11");
		expect(response.headers.get("content-disposition")).toContain("attachment");
	});

	it("returns password page when share requires auth and session is missing", async () => {
		const kv = createMockKV();
		const r2 = createMockR2();
		setKVJSON(kv.store, "drive:share:token-c", {
			root_node_id: 10,
			root_node_kind: "folder",
			has_password: true,
			password_hash: "pbkdf2_sha256$1000$v1$hash",
			password_salt: "salt",
		});

		const env = createEnv({
			EDGE_KV: kv.namespace,
			ANYCAP_CLOUD_R2: r2.bucket,
		});
		const response = await handleDrive(new Request("https://drive.anycap.cloud/s/token-c"), env, testConfig());
		const body = await response.text();

		expect(response.status).toBe(200);
		expect(body).toContain("Password required");
		expect(body).toContain("/s/token-c/password");
	});

	it("returns 410 for expired share and clears cookie", async () => {
		const kv = createMockKV();
		const r2 = createMockR2();
		setKVJSON(kv.store, "drive:share:token-d", {
			root_node_id: 10,
			root_node_kind: "folder",
			has_password: false,
			expires_at: "2020-01-01T00:00:00Z",
		});

		const env = createEnv({
			EDGE_KV: kv.namespace,
			ANYCAP_CLOUD_R2: r2.bucket,
		});
		const response = await handleDrive(new Request("https://drive.anycap.cloud/s/token-d"), env, testConfig());

		expect(response.status).toBe(410);
		expect(response.headers.get("set-cookie")).toContain("Max-Age=0");
	});

	it("renders preview for access token route", async () => {
		const kv = createMockKV();
		const r2 = createMockR2();
		setKVJSON(kv.store, "drive:access:drvacc_token", {
			node_id: 11,
			space_id: 1,
			name: "hello.txt",
			object_key: "drive/file-11.txt",
			mime: "text/plain; charset=utf-8",
			size: 12,
			expires_at: "2099-01-01T00:00:00Z",
		});

		const env = createEnv({
			EDGE_KV: kv.namespace,
			ANYCAP_CLOUD_R2: r2.bucket,
		});
		const response = await handleDrive(new Request("https://drive.anycap.cloud/o/drvacc_token"), env, testConfig());
		const body = await response.text();

		expect(response.status).toBe(200);
		expect(body).toContain("hello.txt");
		expect(body).toContain("/o/drvacc_token/raw");
		expect(response.headers.get("cache-control")).toBe("private, no-store");
	});

	it("serves raw content for access token route", async () => {
		const kv = createMockKV();
		const r2 = createMockR2({
			"drive/file-11.txt": {
				body: "hello world",
				contentType: "text/plain; charset=utf-8",
				etag: "etag-raw-11",
			},
		});
		setKVJSON(kv.store, "drive:access:drvacc_token", {
			node_id: 11,
			space_id: 1,
			name: "hello.txt",
			object_key: "drive/file-11.txt",
			mime: "text/plain; charset=utf-8",
			size: 11,
			expires_at: "2099-01-01T00:00:00Z",
		});

		const env = createEnv({
			EDGE_KV: kv.namespace,
			ANYCAP_CLOUD_R2: r2.bucket,
		});
		const response = await handleDrive(new Request("https://drive.anycap.cloud/o/drvacc_token/raw?download=1"), env, testConfig());
		const body = await response.text();

		expect(response.status).toBe(200);
		expect(body).toBe("hello world");
		expect(response.headers.get("cache-control")).toBe("private, no-store");
		expect(response.headers.get("content-disposition")).toContain("attachment");
	});
});
