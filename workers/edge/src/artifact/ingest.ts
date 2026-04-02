import { hasValidBearerToken } from "./auth";
import { isValidArtifactObjectKey } from "./object_key";
import { fetchWithSourcePolicy, parseSourceHostAllowlist } from "./source_policy";
import { logArtifactEvent, sanitizeURLForLog } from "./log";
import type { Env } from "../types";
import { jsonResponse } from "../response";

const defaultMaxBytes = 100 * 1024 * 1024;
const absoluteMaxBytes = 1024 * 1024 * 1024;
const maxRedirects = 3;

type IngestRequestPayload = {
	source_url?: string;
	object_key?: string;
	media_type?: string;
	filename_hint?: string;
	content_type_hint?: string;
	max_bytes?: number;
};

function errorJSON(status: number, message: string): Response {
	return jsonResponse(
		{
			code: "ARTIFACT_INGEST_ERROR",
			message,
		},
		{
			status,
			headers: { "cache-control": "no-store" },
		},
	);
}

function ingestError(
	request: Request,
	status: number,
	message: string,
	fields: Record<string, string | number | boolean | null | undefined> = {},
): Response {
	logArtifactEvent("artifact-ingest", "error", request, {
		status,
		error_message: message,
		...fields,
	});
	return errorJSON(status, message);
}

function normalizeMediaType(raw: string | undefined): "image" | "video" | "music" | null {
	const mediaType = (raw || "").trim().toLowerCase();
	if (mediaType === "image" || mediaType === "video" || mediaType === "music") {
		return mediaType;
	}
	return null;
}

function normalizeContentType(raw: string | undefined): string {
	if (!raw) {
		return "";
	}
	const value = raw.split(";")[0]?.trim().toLowerCase() || "";
	return value;
}

function isAllowedMIME(mediaType: "image" | "video" | "music", mime: string): boolean {
	if (!mime) {
		return false;
	}
	if (mediaType === "image") {
		return mime.startsWith("image/");
	}
	if (mediaType === "video") {
		return mime.startsWith("video/");
	}
	return mime.startsWith("audio/");
}

function resolveMaxBytes(raw: number | undefined): number {
	if (!Number.isInteger(raw) || (raw || 0) <= 0) {
		return defaultMaxBytes;
	}
	return Math.min(raw || defaultMaxBytes, absoluteMaxBytes);
}

function extractResponseMIME(response: Response, hint: string | undefined): string {
	const fromHeader = normalizeContentType(response.headers.get("content-type") || undefined);
	if (fromHeader) {
		return fromHeader;
	}
	return normalizeContentType(hint);
}

async function readBodyWithLimit(stream: ReadableStream<Uint8Array>, maxBytes: number): Promise<Uint8Array> {
	const reader = stream.getReader();
	const chunks: Uint8Array[] = [];
	let total = 0;

	while (true) {
		const { done, value } = await reader.read();
		if (done) {
			break;
		}
		if (!value) {
			continue;
		}
		total += value.byteLength;
		if (total > maxBytes) {
			throw new Error("payload_too_large");
		}
		chunks.push(value);
	}

	const merged = new Uint8Array(total);
	let offset = 0;
	for (const chunk of chunks) {
		merged.set(chunk, offset);
		offset += chunk.byteLength;
	}
	return merged;
}

export async function handleArtifactIngest(request: Request, env: Env): Promise<Response> {
	if (request.method !== "POST") {
		return ingestError(request, 405, "method not allowed");
	}
	if (new URL(request.url).protocol !== "https:") {
		return ingestError(request, 400, "https is required");
	}
	if (!hasValidBearerToken(request, env.ANYCAP_ARTIFACT_INGEST_TOKEN)) {
		return ingestError(request, 401, "invalid ingest token");
	}

	let payload: IngestRequestPayload;
	try {
		payload = (await request.json()) as IngestRequestPayload;
	} catch {
		return ingestError(request, 400, "invalid json body");
	}

	const sourceURL = (payload.source_url || "").trim();
	const objectKey = (payload.object_key || "").trim();
	const mediaType = normalizeMediaType(payload.media_type);
	const maxBytes = resolveMaxBytes(payload.max_bytes);

	if (!sourceURL) {
		return ingestError(request, 400, "source_url is required");
	}
	if (!isValidArtifactObjectKey(objectKey)) {
		return ingestError(request, 400, "object_key is invalid", {
			source_url: sanitizeURLForLog(sourceURL),
			object_key: objectKey,
		});
	}
	if (!mediaType) {
		return ingestError(request, 400, "media_type is invalid", {
			source_url: sanitizeURLForLog(sourceURL),
			object_key: objectKey,
			media_type: (payload.media_type || "").trim(),
		});
	}

	const allowlist = parseSourceHostAllowlist(env.ARTIFACT_SOURCE_HOST_ALLOWLIST);

	let sourceResponse: Response;
	try {
		sourceResponse = await fetchWithSourcePolicy(sourceURL, allowlist, maxRedirects);
	} catch (err) {
		const message = err instanceof Error ? err.message : "source policy rejected";
		return ingestError(request, 403, message, {
			source_url: sanitizeURLForLog(sourceURL),
			object_key: objectKey,
			media_type: mediaType,
		});
	}
	if (!sourceResponse.ok) {
		return ingestError(request, 502, `source fetch failed with status ${sourceResponse.status}`, {
			source_url: sanitizeURLForLog(sourceURL),
			object_key: objectKey,
			media_type: mediaType,
			source_status: sourceResponse.status,
		});
	}
	if (!sourceResponse.body) {
		return ingestError(request, 502, "source response body is empty", {
			source_url: sanitizeURLForLog(sourceURL),
			object_key: objectKey,
			media_type: mediaType,
		});
	}

	const contentLength = Number.parseInt(sourceResponse.headers.get("content-length") || "0", 10);
	if (Number.isInteger(contentLength) && contentLength > maxBytes) {
		return ingestError(request, 413, "source file exceeds max_bytes", {
			source_url: sanitizeURLForLog(sourceURL),
			object_key: objectKey,
			media_type: mediaType,
			content_length: contentLength,
			max_bytes: maxBytes,
		});
	}

	const mime = extractResponseMIME(sourceResponse, payload.content_type_hint);
	if (!isAllowedMIME(mediaType, mime)) {
		return ingestError(request, 415, "source mime is not allowed for media_type", {
			source_url: sanitizeURLForLog(sourceURL),
			object_key: objectKey,
			media_type: mediaType,
			source_mime: mime,
		});
	}

	let bytes: Uint8Array;
	try {
		bytes = await readBodyWithLimit(sourceResponse.body, maxBytes);
	} catch (err) {
		if (err instanceof Error && err.message === "payload_too_large") {
			return ingestError(request, 413, "source file exceeds max_bytes", {
				source_url: sanitizeURLForLog(sourceURL),
				object_key: objectKey,
				media_type: mediaType,
				max_bytes: maxBytes,
			});
		}
		return ingestError(request, 502, "failed to read source body", {
			source_url: sanitizeURLForLog(sourceURL),
			object_key: objectKey,
			media_type: mediaType,
		});
	}

	let putResult: R2Object;
	try {
		putResult = await env.ANYCAP_CLOUD_R2.put(objectKey, bytes, {
			httpMetadata: {
				contentType: mime,
			},
		});
	} catch (err) {
		logArtifactEvent("artifact-ingest", "error", request, {
			status: 502,
			error_message: "failed to store artifact object",
			source_url: sanitizeURLForLog(sourceURL),
			object_key: objectKey,
			media_type: mediaType,
			source_mime: mime,
			size: bytes.byteLength,
			r2_error: err instanceof Error ? err.message : String(err),
		});
		return errorJSON(502, "failed to store artifact object");
	}

	const etag = (putResult.httpEtag || putResult.etag || "").trim();
	logArtifactEvent("artifact-ingest", "info", request, {
		status: 200,
		source_url: sanitizeURLForLog(sourceURL),
		object_key: objectKey,
		media_type: mediaType,
		source_mime: mime,
		size: bytes.byteLength,
		etag,
	});
	return jsonResponse(
		{
			etag,
			mime,
			size: bytes.byteLength,
		},
		{
			status: 200,
			headers: { "cache-control": "no-store" },
		},
	);
}
