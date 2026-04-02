import { describe, expect, it } from "vitest";

import worker from "./index";
import { createEnv, createMockKV, createMockR2, setKVJSON } from "./test_helpers";

describe("worker host routing", () => {
	it("routes cdn host to public handler", async () => {
		const env = createEnv({
			ANYCAP_CLOUD_R2: createMockR2({
				"public/fonts/demo.woff2": {
					body: "font-data",
					contentType: "font/woff2",
				},
			}).bucket,
		});
		const response = await worker.fetch(new Request("https://cdn.anycap.cloud/fonts/demo.woff2"), env);
		expect(response.status).toBe(200);
		expect(response.headers.get("cache-control")).toBe("public, max-age=31536000, immutable");
	});

	it("routes drive host to drive handler", async () => {
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
			items: [],
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
		const response = await worker.fetch(new Request("https://drive.anycap.cloud/s/token-a"), env);
		expect(response.status).toBe(200);
	});

	it("routes artifact host to artifact public handler", async () => {
		const kv = createMockKV();
		const r2 = createMockR2({
			"caps/outputs/o/ca_demo": {
				body: "artifact-bytes",
				contentType: "image/png",
				etag: "etag-a",
			},
		});
		setKVJSON(kv.store, "artifact:link:art_demo", {
			object_key: "caps/outputs/o/ca_demo",
			mime: "image/png",
			size: 14,
			etag: "etag-a",
		});

		const env = createEnv({
			EDGE_KV: kv.namespace,
			ANYCAP_CLOUD_R2: r2.bucket,
		});
		const response = await worker.fetch(new Request("https://artifact.anycap.cloud/a/art_demo"), env);
		expect(response.status).toBe(200);
		expect(response.headers.get("cache-control")).toBe("public, max-age=31536000, immutable");
	});

	it("routes artifact ingest host to ingest handler", async () => {
		const env = createEnv({
			ANYCAP_ARTIFACT_INGEST_TOKEN: "ingest-token",
		});
		const response = await worker.fetch(new Request("https://artifact-ingest.anycap.cloud/v1/internal/artifacts/ingest", { method: "POST" }), env);
		expect(response.status).toBe(401);
	});

	it("routes page subdomain to page handler", async () => {
		const kv = createMockKV();
		const r2 = createMockR2({
			"page/spaces/1/sites/9/versions/2/index.html": {
				body: "<h1>ok</h1>",
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
		const response = await worker.fetch(new Request("https://page-docs.anycap.cloud/"), env);
		expect(response.status).toBe(200);
	});

	it("routes preview-page subdomain to page handler", async () => {
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
			access_mode: "public",
			preview: true,
			expires_at: "2099-01-01T00:00:00Z",
		});

		const env = createEnv({
			EDGE_KV: kv.namespace,
			ANYCAP_CLOUD_R2: r2.bucket,
		});
		const response = await worker.fetch(new Request("https://preview-page-pprv-abc.anycap.cloud/"), env);
		expect(response.status).toBe(200);
	});

	it("returns 404 for unknown host", async () => {
		const env = createEnv();
		const response = await worker.fetch(new Request("https://unknown.anycap.cloud/"), env);
		expect(response.status).toBe(404);
	});
});
