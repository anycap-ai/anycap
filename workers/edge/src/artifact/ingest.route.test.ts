import { afterEach, describe, expect, it, vi } from "vitest";

import { handleArtifactIngest } from "./ingest";
import { createEnv, createMockR2 } from "../test_helpers";

afterEach(() => {
	vi.restoreAllMocks();
});

function buildIngestRequest(body: unknown, token = "ingest-token"): Request {
	return new Request("https://artifact-ingest.anycap.cloud/v1/internal/artifacts/ingest", {
		method: "POST",
		headers: {
			"content-type": "application/json",
			authorization: `Bearer ${token}`,
		},
		body: JSON.stringify(body),
	});
}

describe("artifact ingest route", () => {
	it("rejects invalid bearer token", async () => {
		const env = createEnv({
			ANYCAP_ARTIFACT_INGEST_TOKEN: "ingest-token",
			ARTIFACT_SOURCE_HOST_ALLOWLIST: "provider.example.com",
		});

		const response = await handleArtifactIngest(
			buildIngestRequest(
				{
					source_url: "https://provider.example.com/demo.png",
					object_key: "caps/outputs/o/ca_demo",
					media_type: "image",
					max_bytes: 1024,
				},
				"wrong-token",
			),
			env,
		);
		expect(response.status).toBe(401);
	});

	it("rejects source url outside allowlist", async () => {
		const fetchMock = vi.fn();
		vi.stubGlobal("fetch", fetchMock);

		const env = createEnv({
			ANYCAP_ARTIFACT_INGEST_TOKEN: "ingest-token",
			ARTIFACT_SOURCE_HOST_ALLOWLIST: "provider.example.com",
		});
		const response = await handleArtifactIngest(
			buildIngestRequest({
				source_url: "https://evil.example.com/demo.png",
				object_key: "caps/outputs/o/ca_demo",
				media_type: "image",
				max_bytes: 1024,
			}),
			env,
		);
		expect(response.status).toBe(403);
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it("re-validates redirects with source policy", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn(async () => new Response(null, { status: 302, headers: { location: "https://127.0.0.1/private.png" } })),
		);

		const env = createEnv({
			ANYCAP_ARTIFACT_INGEST_TOKEN: "ingest-token",
			ARTIFACT_SOURCE_HOST_ALLOWLIST: "provider.example.com",
		});
		const response = await handleArtifactIngest(
			buildIngestRequest({
				source_url: "https://provider.example.com/demo.png",
				object_key: "caps/outputs/o/ca_demo",
				media_type: "image",
				max_bytes: 1024,
			}),
			env,
		);
		expect(response.status).toBe(403);
	});

	it("rejects oversized source file", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn(async () =>
				new Response("abcdef", {
					status: 200,
					headers: {
						"content-type": "image/png",
						"content-length": "6",
					},
				}),
			),
		);

		const env = createEnv({
			ANYCAP_ARTIFACT_INGEST_TOKEN: "ingest-token",
			ARTIFACT_SOURCE_HOST_ALLOWLIST: "provider.example.com",
		});
		const response = await handleArtifactIngest(
			buildIngestRequest({
				source_url: "https://provider.example.com/demo.png",
				object_key: "caps/outputs/o/ca_demo",
				media_type: "image",
				max_bytes: 5,
			}),
			env,
		);
		expect(response.status).toBe(413);
	});

	it("ingests source file and stores to R2 when allowlist is empty", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn(async () =>
				new Response("hello-artifact", {
					status: 200,
					headers: {
						"content-type": "image/png",
					},
				}),
			),
		);

		const mockR2 = createMockR2();
		const env = createEnv({
			ANYCAP_CLOUD_R2: mockR2.bucket,
			ANYCAP_ARTIFACT_INGEST_TOKEN: "ingest-token",
			ARTIFACT_SOURCE_HOST_ALLOWLIST: "",
		});
		const response = await handleArtifactIngest(
			buildIngestRequest({
				source_url: "https://provider.example.com/demo.png",
				object_key: "caps/outputs/o/ca_demo",
				media_type: "image",
				max_bytes: 1024,
			}),
			env,
		);

		expect(response.status).toBe(200);
		expect(mockR2.putCalls.length).toBe(1);
		expect(mockR2.putCalls[0]?.key).toBe("caps/outputs/o/ca_demo");
		expect(mockR2.putCalls[0]?.contentType).toBe("image/png");
	});

	it("ingests generated audio and stores it in R2", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn(async () =>
				new Response("generated-audio", {
					status: 200,
					headers: {
						"content-type": "audio/mpeg",
					},
				}),
			),
		);

		const mockR2 = createMockR2();
		const env = createEnv({
			ANYCAP_CLOUD_R2: mockR2.bucket,
			ANYCAP_ARTIFACT_INGEST_TOKEN: "ingest-token",
			ARTIFACT_SOURCE_HOST_ALLOWLIST: "",
		});
		const response = await handleArtifactIngest(
			buildIngestRequest({
				source_url: "https://provider.example.com/generated.mp3",
				object_key: "caps/outputs/o/ca_audio",
				media_type: "audio",
				max_bytes: 1024,
			}),
			env,
		);

		expect(response.status).toBe(200);
		expect(mockR2.putCalls).toEqual([
			{
				key: "caps/outputs/o/ca_audio",
				contentType: "audio/mpeg",
				size: 15,
			},
		]);
	});
});
