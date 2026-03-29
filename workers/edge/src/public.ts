import { notFoundPage } from "./response";
import type { Env } from "./types";
import { guessContentType } from "./mime";

const PUBLIC_CACHE_CONTROL = "public, max-age=31536000, immutable";

function normalizePublicObjectKey(pathname: string): string | null {
	if (!pathname || pathname === "/") {
		return null;
	}

	let decodedPath = pathname;
	try {
		decodedPath = decodeURIComponent(pathname);
	} catch {
		return null;
	}

	const parts = decodedPath.split("/").filter((part) => part !== "");
	if (parts.length === 0) {
		return null;
	}
	for (const part of parts) {
		if (part === "." || part === "..") {
			return null;
		}
	}

	return `public/${parts.join("/")}`;
}

export async function handlePublic(request: Request, env: Env): Promise<Response> {
	if (request.method !== "GET" && request.method !== "HEAD") {
		return new Response("Method not allowed", {
			status: 405,
			headers: { "cache-control": "no-store" },
		});
	}

	const url = new URL(request.url);
	const objectKey = normalizePublicObjectKey(url.pathname);
	if (!objectKey) {
		return notFoundPage("Public asset not found");
	}

	const object = await env.ANYCAP_CLOUD_R2.get(objectKey);
	if (!object || !object.body) {
		return notFoundPage("Public asset not found");
	}

	const headers = new Headers();
	headers.set("content-type", object.httpMetadata?.contentType || guessContentType(url.pathname));
	headers.set("cache-control", PUBLIC_CACHE_CONTROL);
	if (object.httpEtag) {
		headers.set("etag", object.httpEtag);
	}
	if (object.size >= 0) {
		headers.set("content-length", String(object.size));
	}

	if (request.method === "HEAD") {
		return new Response(null, { status: 200, headers });
	}
	return new Response(object.body, { status: 200, headers });
}
