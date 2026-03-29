import { respondWithCache } from "./cache";
import type { EdgeConfig } from "./config";
import { getKVJSON } from "./kv";
import { verifyPBKDF2Password } from "./password";
import { hitRateLimit } from "./rate_limit";
import { createSessionCookie, isSessionValid } from "./session";
import type { Env, PageHostRecord } from "./types";
import { notFoundPage } from "./response";
import { renderErrorPage, renderPasswordPage } from "./ui";

const PAGE_SESSION_COOKIE = "ac_page_auth";

function normalizePathname(pathname: string): string {
	if (!pathname || pathname === "/") {
		return "/";
	}
	try {
		return decodeURIComponent(pathname);
	} catch {
		return pathname;
	}
}

function sanitizeRedirectPath(value: FormDataEntryValue | null): string {
	if (typeof value !== "string") {
		return "/";
	}
	const trimmed = value.trim();
	if (!trimmed.startsWith("/")) {
		return "/";
	}
	if (trimmed.startsWith("//")) {
		return "/";
	}
	return trimmed;
}

function getClientIP(req: Request): string {
	return req.headers.get("cf-connecting-ip") || req.headers.get("x-forwarded-for") || "unknown";
}

function joinAssetKey(prefix: string, relativePath: string): string {
	const normalizedPrefix = prefix.replace(/\/+$/, "");
	const normalizedRelative = relativePath.replace(/^\/+/, "");
	return `${normalizedPrefix}/${normalizedRelative}`;
}

function listCandidates(pathname: string, spaFallback: boolean): string[] {
	const normalized = normalizePathname(pathname);
	if (normalized === "/") {
		return ["index.html"];
	}
	const clean = normalized.replace(/^\/+/, "").replace(/\/+$/, "");
	const out = new Set<string>();
	if (clean !== "") {
		out.add(clean);
		out.add(`${clean}/index.html`);
		out.add(`${clean}.html`);
	}
	if (spaFallback) {
		out.add("index.html");
	}
	return [...out];
}

function guessContentType(path: string): string {
	const lower = path.toLowerCase();
	if (lower.endsWith(".html") || lower.endsWith(".htm")) return "text/html; charset=utf-8";
	if (lower.endsWith(".css")) return "text/css; charset=utf-8";
	if (lower.endsWith(".js")) return "application/javascript; charset=utf-8";
	if (lower.endsWith(".json")) return "application/json; charset=utf-8";
	if (lower.endsWith(".png")) return "image/png";
	if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
	if (lower.endsWith(".svg")) return "image/svg+xml";
	if (lower.endsWith(".webp")) return "image/webp";
	if (lower.endsWith(".gif")) return "image/gif";
	if (lower.endsWith(".ico")) return "image/x-icon";
	if (lower.endsWith(".txt")) return "text/plain; charset=utf-8";
	if (lower.endsWith(".woff2")) return "font/woff2";
	if (lower.endsWith(".woff")) return "font/woff";
	if (lower.endsWith(".ttf")) return "font/ttf";
	if (lower.endsWith(".xml")) return "application/xml; charset=utf-8";
	if (lower.endsWith(".pdf")) return "application/pdf";
	return "application/octet-stream";
}

async function fetchPageHost(env: Env, hostname: string): Promise<PageHostRecord | null> {
	return getKVJSON<PageHostRecord>(env, `page:host:${hostname}`);
}

async function handlePasswordSubmit(
	request: Request,
	env: Env,
	config: EdgeConfig,
	hostname: string,
	hostConfig: PageHostRecord,
): Promise<Response> {
	const form = await request.formData();
	const password = String(form.get("password") || "");
	const redirectPath = sanitizeRedirectPath(form.get("redirect"));

	if (hostConfig.access_mode !== "password" || !hostConfig.password_hash || !hostConfig.password_salt) {
		return Response.redirect(new URL(redirectPath, request.url).toString(), 302);
	}

	const blocked = await hitRateLimit(env, {
		scope: "page_password",
		key: hostname,
		ip: getClientIP(request),
		windowSeconds: config.pagePasswordRateLimitWindowSeconds,
		maxAttempts: config.pagePasswordRateLimitMaxAttempts,
	});
	if (blocked) {
		return renderPasswordPage({
			title: "Too many attempts",
			description: "Please wait and try again.",
			actionPath: "/__auth/password",
			redirectPath,
			errorMessage: "Rate limit exceeded.",
		});
	}

	const ok = await verifyPBKDF2Password(env, password, hostConfig.password_hash, hostConfig.password_salt);
	if (!ok) {
		return renderPasswordPage({
			title: "Password required",
			description: "This site is password protected.",
			actionPath: "/__auth/password",
			redirectPath,
			errorMessage: "Incorrect password.",
		});
	}

	const setCookie = await createSessionCookie(
		env,
		PAGE_SESSION_COOKIE,
		"page",
		hostname,
		config.pagePasswordSessionTTLSeconds,
	);
	const response = Response.redirect(new URL(redirectPath, request.url).toString(), 302);
	response.headers.set("set-cookie", setCookie);
	return response;
}

async function servePageAsset(
	request: Request,
	env: Env,
	config: EdgeConfig,
	host: PageHostRecord,
): Promise<Response> {
	const url = new URL(request.url);
	const candidates = listCandidates(url.pathname, host.spa_fallback);
	return respondWithCache(request, config.pageAssetCacheTTLSeconds, async () => {
		for (const relativePath of candidates) {
			const objectKey = joinAssetKey(host.asset_prefix, relativePath);
			const object = await env.ANYCAP_CLOUD_R2.get(objectKey);
			if (!object || !object.body) {
				continue;
			}
			const headers = new Headers();
			headers.set("content-type", object.httpMetadata?.contentType || guessContentType(relativePath));
			if (object.httpEtag) {
				headers.set("etag", object.httpEtag);
			}
			if (object.size >= 0) {
				headers.set("content-length", String(object.size));
			}
			return new Response(object.body, { status: 200, headers });
		}
		return notFoundPage("Page asset not found");
	});
}

export async function handlePage(request: Request, env: Env, config: EdgeConfig): Promise<Response> {
	const url = new URL(request.url);
	const hostname = url.hostname.toLowerCase();
	const hostConfig = await fetchPageHost(env, hostname);
	if (!hostConfig || !hostConfig.current_version_id) {
		return renderErrorPage(404, "Not found", "This page is unpublished or does not exist.");
	}

	if (hostConfig.access_mode === "private_reserved") {
		return renderErrorPage(403, "Forbidden", "Private pages are not enabled yet.");
	}

	if (url.pathname === "/__auth/password") {
		if (request.method !== "POST") {
			return renderErrorPage(405, "Method not allowed", "Use POST for password submission.");
		}
		return handlePasswordSubmit(request, env, config, hostname, hostConfig);
	}

	if (request.method !== "GET") {
		return renderErrorPage(405, "Method not allowed", "Only GET is supported for this route.");
	}

	if (hostConfig.access_mode === "password") {
		const validSession = await isSessionValid(env, request, PAGE_SESSION_COOKIE, "page", hostname);
		if (!validSession) {
			return renderPasswordPage({
				title: "Password required",
				description: "This page is password protected.",
				actionPath: "/__auth/password",
				redirectPath: `${url.pathname}${url.search}`,
			});
		}
	}

	return servePageAsset(request, env, config, hostConfig);
}
