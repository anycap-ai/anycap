import { describe, expect, it } from "vitest";

import { handlePublic } from "./public";
import { createEnv, createMockR2 } from "./test_helpers";

describe("public route", () => {
	it("serves object under public prefix", async () => {
		const env = createEnv({
			ANYCAP_CLOUD_R2: createMockR2({
				"public/assets/logo.svg": {
					body: "<svg></svg>",
					contentType: "image/svg+xml",
					etag: "etag-1",
				},
			}).bucket,
		});

		const response = await handlePublic(new Request("https://cdn.anycap.cloud/assets/logo.svg"), env);
		expect(response.status).toBe(200);
		expect(response.headers.get("content-type")).toContain("image/svg+xml");
		expect(response.headers.get("cache-control")).toBe("public, max-age=31536000, immutable");
	});

	it("rejects non-GET/HEAD methods", async () => {
		const response = await handlePublic(new Request("https://cdn.anycap.cloud/assets/logo.svg", { method: "POST" }), createEnv());
		expect(response.status).toBe(405);
	});

	it("blocks path traversal", async () => {
		const response = await handlePublic(new Request("https://cdn.anycap.cloud/../secrets.txt"), createEnv());
		expect(response.status).toBe(404);
	});
});
