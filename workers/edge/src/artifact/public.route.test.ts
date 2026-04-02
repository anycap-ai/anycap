import { describe, expect, it } from "vitest";

import { handleArtifactPublic } from "./public";
import { createEnv, createMockKV, createMockR2, setKVJSON } from "../test_helpers";

describe("artifact public route", () => {
	it("serves artifact via short link token", async () => {
		const kv = createMockKV();
		const r2 = createMockR2({
			"caps/outputs/o/ca_demo": {
				body: "hello-artifact",
				contentType: "image/png",
				etag: "etag-1",
			},
		});
		setKVJSON(kv.store, "artifact:link:art_demo", {
			object_key: "caps/outputs/o/ca_demo",
			mime: "image/png",
			size: 14,
			etag: "etag-1",
		});

		const env = createEnv({
			EDGE_KV: kv.namespace,
			ANYCAP_CLOUD_R2: r2.bucket,
		});
			const response = await handleArtifactPublic(new Request("https://artifact.anycap.cloud/a/art_demo"), env);
			expect(response.status).toBe(200);
			expect(response.headers.get("content-type")).toContain("image/png");
			expect(response.headers.get("accept-ranges")).toBe("bytes");
			expect(response.headers.get("cache-control")).toBe("private, max-age=15, must-revalidate");
		});

	it("supports range requests", async () => {
		const kv = createMockKV();
		const r2 = createMockR2({
			"caps/outputs/o/ca_demo": {
				body: "0123456789",
				contentType: "video/mp4",
				etag: "etag-2",
			},
		});
		setKVJSON(kv.store, "artifact:link:art_range", {
			object_key: "caps/outputs/o/ca_demo",
			mime: "video/mp4",
			size: 10,
			etag: "etag-2",
		});

		const env = createEnv({
			EDGE_KV: kv.namespace,
			ANYCAP_CLOUD_R2: r2.bucket,
		});
		const response = await handleArtifactPublic(
			new Request("https://artifact.anycap.cloud/a/art_range", {
				headers: {
					range: "bytes=2-5",
				},
			}),
			env,
		);
		expect(response.status).toBe(206);
		expect(response.headers.get("content-range")).toBe("bytes 2-5/10");
		expect(await response.text()).toBe("2345");
	});

	it("returns 304 for matching if-none-match", async () => {
		const kv = createMockKV();
		const r2 = createMockR2({
			"caps/outputs/o/ca_demo": {
				body: "hello",
				contentType: "image/png",
				etag: "etag-3",
			},
		});
		setKVJSON(kv.store, "artifact:link:art_etag", {
			object_key: "caps/outputs/o/ca_demo",
			mime: "image/png",
			size: 5,
			etag: "etag-3",
		});

		const env = createEnv({
			EDGE_KV: kv.namespace,
			ANYCAP_CLOUD_R2: r2.bucket,
		});
			const response = await handleArtifactPublic(
				new Request("https://artifact.anycap.cloud/a/art_etag", {
					headers: {
						"if-none-match": "etag-3",
					},
				}),
				env,
			);
			expect(response.status).toBe(304);
		});

	it("returns 416 for invalid range", async () => {
		const kv = createMockKV();
		const r2 = createMockR2({
			"caps/outputs/o/ca_demo": {
				body: "hello",
				contentType: "image/png",
				etag: "etag-4",
			},
		});
		setKVJSON(kv.store, "artifact:link:art_invalid_range", {
			object_key: "caps/outputs/o/ca_demo",
			mime: "image/png",
			size: 5,
			etag: "etag-4",
		});

		const env = createEnv({
			EDGE_KV: kv.namespace,
			ANYCAP_CLOUD_R2: r2.bucket,
		});
		const response = await handleArtifactPublic(
			new Request("https://artifact.anycap.cloud/a/art_invalid_range", {
				headers: {
					range: "bytes=10-20",
				},
			}),
			env,
		);
		expect(response.status).toBe(416);
		expect(response.headers.get("content-range")).toBe("bytes */5");
	});
});
