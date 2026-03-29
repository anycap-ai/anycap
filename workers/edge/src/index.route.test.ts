import { describe, expect, it } from "vitest";

import worker from "./index";
import { createEnv, createMockKV, createMockR2, setKVJSON } from "./test_helpers";

describe("worker host routing", () => {
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

	it("routes page subdomain to page handler", async () => {
		const kv = createMockKV();
		const r2 = createMockR2({
			"page/spaces/1/sites/9/versions/2/index.html": {
				body: "<h1>ok</h1>",
				contentType: "text/html; charset=utf-8",
			},
		});
		setKVJSON(kv.store, "page:host:docs.page.anycap.cloud", {
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
		const response = await worker.fetch(new Request("https://docs.page.anycap.cloud/"), env);
		expect(response.status).toBe(200);
	});

	it("returns 404 for unknown host", async () => {
		const env = createEnv();
		const response = await worker.fetch(new Request("https://unknown.anycap.cloud/"), env);
		expect(response.status).toBe(404);
	});
});
