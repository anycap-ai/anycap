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

		const response = await handlePublic(new Request("https://cdn.anycap.ai/assets/logo.svg"), env);
		expect(response.status).toBe(200);
		expect(response.headers.get("content-type")).toContain("image/svg+xml");
		expect(response.headers.get("cache-control")).toBe("public, max-age=31536000, immutable");
	});

	it("redirects the CDN root to the marketing site", async () => {
		const response = await handlePublic(new Request("https://cdn.anycap.ai/"), createEnv());
		expect(response.status).toBe(308);
		expect(response.headers.get("location")).toBe("https://anycap.ai/");
	});

	it("rejects non-GET/HEAD methods", async () => {
		const response = await handlePublic(new Request("https://cdn.anycap.ai/assets/logo.svg", { method: "POST" }), createEnv());
		expect(response.status).toBe(405);
	});

	it("blocks path traversal", async () => {
		const response = await handlePublic(new Request("https://cdn.anycap.ai/../secrets.txt"), createEnv());
		expect(response.status).toBe(404);
	});
});
