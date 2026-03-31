import { respondWithCache } from "./cache";
import type { EdgeConfig } from "./config";
import { getKVJSON } from "./kv";
import { verifyPBKDF2Password } from "./password";
import { hitRateLimit } from "./rate_limit";
import { createSessionCookie, isSessionValid } from "./session";
import type { Env, PageHostRecord } from "./types";
import { notFoundPage } from "./response";
import { renderErrorPage, renderPasswordPage } from "./ui";
import { guessContentType } from "./mime";
import { injectPageBadge } from "./ui/badge";

const PAGE_SESSION_COOKIE = "ac_page_auth";

function applyPrivateNoStore(response: Response): Response {
	const wrapped = new Response(response.body, response);
	wrapped.headers.set("cache-control", "private, no-store");
	return wrapped;
}

function redactHostname(hostname: string): string {
	const lower = hostname.toLowerCase();
	if (!lower.startsWith("preview-page-")) {
		return hostname;
	}
	const dot = lower.indexOf(".");
	const suffix = dot >= 0 ? hostname.slice(dot) : "";
	return `preview-page-***${suffix}`;
}

function isExpiredAt(expiresAtRaw?: string | null): boolean {
	if (!expiresAtRaw) {
		return false;
	}
	const expiresAt = Date.parse(expiresAtRaw);
	if (Number.isNaN(expiresAt)) {
		return false;
	}
	return Date.now() > expiresAt;
}

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
	return new Response(null, {
		status: 302,
		headers: {
			location: new URL(redirectPath, request.url).toString(),
			"set-cookie": setCookie,
		},
	});
}

async function servePageAsset(
	request: Request,
	env: Env,
	config: EdgeConfig,
	host: PageHostRecord,
	ctx?: ExecutionContext,
): Promise<Response> {
	const url = new URL(request.url);
	const candidates = listCandidates(url.pathname, host.spa_fallback);
	console.log("[page] asset_prefix=%s candidates=%s", host.asset_prefix, JSON.stringify(candidates));
	return respondWithCache(request, config.pageAssetCacheTTLSeconds, async () => {
		for (const relativePath of candidates) {
			const objectKey = joinAssetKey(host.asset_prefix, relativePath);
			const object = await env.ANYCAP_CLOUD_R2.get(objectKey);
			console.log("[page] try r2 key=%s found=%s", objectKey, !!(object && object.body));
			if (!object || !object.body) {
				continue;
			}
			const contentType = object.httpMetadata?.contentType || guessContentType(relativePath);
			const isHTML = contentType.startsWith("text/html");
			const headers = new Headers();
			headers.set("content-type", contentType);
			if (object.httpEtag) {
				headers.set("etag", object.httpEtag);
			}
			if (isHTML) {
				const html = await new Response(object.body).text();
				const shouldInjectBadge = host.show_badge !== false;
				const finalHTML = shouldInjectBadge ? injectPageBadge(html) : html;
				headers.set("content-length", String(new TextEncoder().encode(finalHTML).byteLength));
				return new Response(finalHTML, { status: 200, headers });
			}
			if (object.size >= 0) {
				headers.set("content-length", String(object.size));
			}
			return new Response(object.body, { status: 200, headers });
		}
		return notFoundPage("Page asset not found");
	}, ctx);
}

export async function handlePage(request: Request, env: Env, config: EdgeConfig, ctx?: ExecutionContext): Promise<Response> {
	const url = new URL(request.url);
	const hostname = url.hostname.toLowerCase();
	console.log("[page] hostname=%s pathname=%s kv_key=%s", redactHostname(hostname), url.pathname, `page:host:${redactHostname(hostname)}`);
	const hostConfig = await fetchPageHost(env, hostname);
	if (!hostConfig || !hostConfig.current_version_id) {
		console.log("[page] host not found or no current_version_id, hostConfig=%s", JSON.stringify(hostConfig));
		return renderErrorPage(404, "Not found", "This page is unpublished or does not exist.");
	}
	if (hostConfig.preview && isExpiredAt(hostConfig.expires_at)) {
		return applyPrivateNoStore(renderErrorPage(410, "Preview expired", "This preview URL has expired."));
	}
	console.log("[page] hostConfig loaded (preview=%s)", Boolean(hostConfig.preview));

	const isPreviewHost = hostConfig.preview === true;
	if (!isPreviewHost && hostConfig.access_mode === "private_reserved") {
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

	if (!isPreviewHost && hostConfig.access_mode === "password") {
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

	const response = await servePageAsset(request, env, config, hostConfig, ctx);
	if (isPreviewHost) {
		return applyPrivateNoStore(response);
	}
	return response;
}
