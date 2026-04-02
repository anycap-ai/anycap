import { loadArtifactLinkRecord } from "./link_kv";
import { logArtifactEvent, redactTokenForLog } from "./log";
import { gonePage, notFoundPage } from "../response";
import type { Env } from "../types";
import { guessContentType } from "../mime";

const ARTIFACT_CACHE_CONTROL = "public, max-age=31536000, immutable";

type ByteRange = {
	start: number;
	end: number;
};

function extractArtifactToken(pathname: string): string | null {
	const matched = /^\/a\/([^/]+)$/.exec(pathname);
	if (!matched || !matched[1]) {
		return null;
	}
	try {
		return decodeURIComponent(matched[1]).trim() || null;
	} catch {
		return null;
	}
}

function parseRangeHeader(rawHeader: string | null, size: number): ByteRange | "invalid" | null {
	if (!rawHeader) {
		return null;
	}
	const header = rawHeader.trim().toLowerCase();
	if (!header.startsWith("bytes=")) {
		return "invalid";
	}
	const spec = header.slice("bytes=".length).trim();
	if (!spec || spec.includes(",")) {
		return "invalid";
	}
	const [startRaw, endRaw] = spec.split("-", 2);
	if (typeof startRaw === "undefined" || typeof endRaw === "undefined") {
		return "invalid";
	}

	if (startRaw === "") {
		const suffixLength = Number.parseInt(endRaw, 10);
		if (!Number.isInteger(suffixLength) || suffixLength <= 0) {
			return "invalid";
		}
		const start = Math.max(0, size - suffixLength);
		return { start, end: size - 1 };
	}

	const start = Number.parseInt(startRaw, 10);
	if (!Number.isInteger(start) || start < 0 || start >= size) {
		return "invalid";
	}

	let end = size - 1;
	if (endRaw !== "") {
		end = Number.parseInt(endRaw, 10);
		if (!Number.isInteger(end) || end < start) {
			return "invalid";
		}
		if (end >= size) {
			end = size - 1;
		}
	}
	return { start, end };
}

function matchesIfNoneMatch(rawIfNoneMatch: string | null, etag: string): boolean {
	if (!rawIfNoneMatch || !etag) {
		return false;
	}
	return rawIfNoneMatch
		.split(",")
		.map((item) => item.trim())
		.some((item) => item === "*" || item === etag);
}

function contentTypeFromRecord(recordMime: string | undefined, objectKey: string): string {
	const mime = (recordMime || "").trim();
	if (mime) {
		return mime;
	}
	return guessContentType(objectKey);
}

export async function handleArtifactPublic(request: Request, env: Env): Promise<Response> {
	if (request.method !== "GET" && request.method !== "HEAD") {
		logArtifactEvent("artifact-public", "warn", request, {
			status: 405,
			error_message: "method not allowed",
		});
		return new Response("Method not allowed", {
			status: 405,
			headers: { "cache-control": "no-store" },
		});
	}

	const url = new URL(request.url);
	const token = extractArtifactToken(url.pathname);
	if (!token) {
		logArtifactEvent("artifact-public", "warn", request, {
			status: 404,
			error_message: "artifact token is missing or invalid",
		});
		return notFoundPage("Artifact not found");
	}

	const record = await loadArtifactLinkRecord(env, token);
	if (!record) {
		logArtifactEvent("artifact-public", "warn", request, {
			status: 410,
			error_message: "artifact link expired or unavailable",
			token: redactTokenForLog(token),
		});
		return gonePage("Artifact link expired or unavailable");
	}

	let size = typeof record.size === "number" && record.size > 0 ? record.size : 0;
	let object: R2ObjectBody | null = null;
	if (size <= 0) {
		object = await env.ANYCAP_CLOUD_R2.get(record.object_key);
		if (!object || !object.body) {
			logArtifactEvent("artifact-public", "warn", request, {
				status: 404,
				error_message: "artifact object missing in r2",
				token: redactTokenForLog(token),
				object_key: record.object_key,
			});
			return notFoundPage("Artifact not found");
		}
		size = object.size;
	}

	const requestedRange = parseRangeHeader(request.headers.get("range"), size);
	if (requestedRange === "invalid") {
		logArtifactEvent("artifact-public", "warn", request, {
			status: 416,
			error_message: "invalid range header",
			token: redactTokenForLog(token),
			range: request.headers.get("range") || "",
			size,
		});
		return new Response(null, {
			status: 416,
			headers: {
				"accept-ranges": "bytes",
				"content-range": `bytes */${size}`,
				"cache-control": "no-store",
			},
		});
	}

	if (!object) {
		if (requestedRange) {
			object = await env.ANYCAP_CLOUD_R2.get(record.object_key, {
				range: {
					offset: requestedRange.start,
					length: requestedRange.end - requestedRange.start + 1,
				},
			});
		} else {
			object = await env.ANYCAP_CLOUD_R2.get(record.object_key);
		}
		if (!object || !object.body) {
			logArtifactEvent("artifact-public", "warn", request, {
				status: 404,
				error_message: "artifact object missing in r2",
				token: redactTokenForLog(token),
				object_key: record.object_key,
			});
			return notFoundPage("Artifact not found");
		}
	}

	const etag = (record.etag || object.httpEtag || "").trim();
	if (!requestedRange && etag && matchesIfNoneMatch(request.headers.get("if-none-match"), etag)) {
		return new Response(null, {
			status: 304,
			headers: {
				etag,
				"cache-control": ARTIFACT_CACHE_CONTROL,
				"accept-ranges": "bytes",
			},
		});
	}

	const headers = new Headers();
	headers.set("content-type", contentTypeFromRecord(record.mime, record.object_key));
	headers.set("cache-control", ARTIFACT_CACHE_CONTROL);
	headers.set("accept-ranges", "bytes");
	if (etag) {
		headers.set("etag", etag);
	}

	let status = 200;
	if (requestedRange) {
		status = 206;
		const length = requestedRange.end - requestedRange.start + 1;
		headers.set("content-length", String(length));
		headers.set("content-range", `bytes ${requestedRange.start}-${requestedRange.end}/${size}`);
	} else {
		headers.set("content-length", String(size));
	}

	if (request.method === "HEAD") {
		return new Response(null, { status, headers });
	}
	return new Response(object.body, { status, headers });
}
