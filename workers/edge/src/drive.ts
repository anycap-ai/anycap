import { respondWithCache } from "./cache";
import type { EdgeConfig } from "./config";
import { getKVJSON } from "./kv";
import { verifyPBKDF2Password } from "./password";
import { forbiddenPage, notFoundPage } from "./response";
import { hitRateLimit } from "./rate_limit";
import { clearSessionCookie, createSessionCookie, isSessionValid } from "./session";
import type { DriveDirChildrenRecord, DriveDirMetaRecord, DriveFileRecord, DriveShareRecord, Env } from "./types";
import { renderDriveDirectoryPage, renderErrorPage, renderFilePreviewPage, renderPasswordPage } from "./ui";

const DRIVE_SESSION_COOKIE = "ac_drive_auth";

function parseDriveRoute(pathname: string): { token: string; rest: string } | null {
	const parts = pathname.split("/").filter((item) => item !== "");
	if (parts.length < 2 || parts[0] !== "s") {
		return null;
	}
	let token = "";
	try {
		token = decodeURIComponent(parts[1] || "").trim();
	} catch {
		return null;
	}
	if (!token) {
		return null;
	}
	const rest = parts.slice(2).join("/");
	return { token, rest };
}

function parsePositiveInt(value: string): number | null {
	if (!/^[0-9]+$/.test(value)) {
		return null;
	}
	const parsed = Number.parseInt(value, 10);
	if (!Number.isInteger(parsed) || parsed <= 0) {
		return null;
	}
	return parsed;
}

function getClientIP(req: Request): string {
	return req.headers.get("cf-connecting-ip") || req.headers.get("x-forwarded-for") || "unknown";
}

function isExpired(share: DriveShareRecord): boolean {
	if (!share.expires_at) {
		return false;
	}
	const expiresAt = Date.parse(share.expires_at);
	if (Number.isNaN(expiresAt)) {
		return false;
	}
	return Date.now() > expiresAt;
}

function sanitizeRedirectPath(token: string, value: FormDataEntryValue | null): string {
	const fallback = `/s/${encodeURIComponent(token)}`;
	if (typeof value !== "string") {
		return fallback;
	}
	const trimmed = value.trim();
	if (!trimmed.startsWith("/s/")) {
		return fallback;
	}
	if (!trimmed.startsWith(`/s/${encodeURIComponent(token)}`) && !trimmed.startsWith(`/s/${token}`)) {
		return fallback;
	}
	return trimmed;
}

function shouldInline(mime: string): boolean {
	const normalized = mime.toLowerCase();
	return normalized.startsWith("text/") || normalized.startsWith("image/") || normalized === "application/pdf";
}

function guessMimeFromFilename(name: string): string {
	const lower = name.toLowerCase();
	if (lower.endsWith(".html") || lower.endsWith(".htm")) return "text/html; charset=utf-8";
	if (lower.endsWith(".css")) return "text/css; charset=utf-8";
	if (lower.endsWith(".js")) return "application/javascript; charset=utf-8";
	if (lower.endsWith(".json")) return "application/json; charset=utf-8";
	if (lower.endsWith(".xml")) return "application/xml; charset=utf-8";
	if (lower.endsWith(".md") || lower.endsWith(".markdown")) return "text/markdown; charset=utf-8";
	if (lower.endsWith(".txt")) return "text/plain; charset=utf-8";
	if (lower.endsWith(".png")) return "image/png";
	if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
	if (lower.endsWith(".gif")) return "image/gif";
	if (lower.endsWith(".svg")) return "image/svg+xml";
	if (lower.endsWith(".webp")) return "image/webp";
	if (lower.endsWith(".pdf")) return "application/pdf";
	if (lower.endsWith(".mp4")) return "video/mp4";
	if (lower.endsWith(".webm")) return "video/webm";
	if (lower.endsWith(".mov")) return "video/quicktime";
	if (lower.endsWith(".mp3")) return "audio/mpeg";
	if (lower.endsWith(".wav")) return "audio/wav";
	if (lower.endsWith(".ogg")) return "audio/ogg";
	if (lower.endsWith(".flac")) return "audio/flac";
	return "application/octet-stream";
}

async function isDirWithinRoot(env: Env, dirID: number, rootDirID: number): Promise<boolean> {
	if (dirID === rootDirID) {
		return true;
	}
	const seen = new Set<number>();
	let current = dirID;
	for (let i = 0; i < 128; i += 1) {
		if (seen.has(current)) {
			return false;
		}
		seen.add(current);
		const meta = await getKVJSON<DriveDirMetaRecord>(env, `drive:dir:${current}:meta`);
		if (!meta || meta.parent_id == null || meta.parent_id <= 0) {
			return false;
		}
		if (meta.parent_id === rootDirID) {
			return true;
		}
		current = meta.parent_id;
	}
	return false;
}

async function loadDirectoryPage(
	env: Env,
	token: string,
	requestedDirID: number,
	rootDirID: number,
): Promise<Response> {
	if (!(await isDirWithinRoot(env, requestedDirID, rootDirID))) {
		return forbiddenPage("Directory is outside shared subtree");
	}

	const children = await getKVJSON<DriveDirChildrenRecord>(env, `drive:dir:${requestedDirID}:children`);
	if (!children) {
		return notFoundPage("Directory not found");
	}
	const meta = await getKVJSON<DriveDirMetaRecord>(env, `drive:dir:${requestedDirID}:meta`);
	const entries = [...children.items]
		.sort((a, b) => {
			if (a.kind !== b.kind) {
				return a.kind === "folder" ? -1 : 1;
			}
			return a.name.localeCompare(b.name);
		})
		.map((item) => ({ id: item.id, kind: item.kind, name: item.name }));

	let parentDirID: number | null = null;
	if (requestedDirID !== rootDirID && meta?.parent_id != null && meta.parent_id > 0) {
		if (meta.parent_id === rootDirID || (await isDirWithinRoot(env, meta.parent_id, rootDirID))) {
			parentDirID = meta.parent_id;
		}
	}

	return renderDriveDirectoryPage({
		title: meta?.name || `Directory ${requestedDirID}`,
		token,
		dirID: requestedDirID,
		entries,
		parentDirID,
		atRoot: requestedDirID === rootDirID,
	});
}

async function loadFileRecordForFolderShare(
	env: Env,
	fileID: number,
	rootDirID: number,
): Promise<DriveFileRecord | null> {
	const file = await getKVJSON<DriveFileRecord>(env, `drive:file:${fileID}`);
	if (!file || file.parent_id == null || file.parent_id <= 0) {
		return null;
	}
	if (file.parent_id === rootDirID) {
		return file;
	}
	if (await isDirWithinRoot(env, file.parent_id, rootDirID)) {
		return file;
	}
	return null;
}

async function serveFileRaw(
	request: Request,
	env: Env,
	config: EdgeConfig,
	file: DriveFileRecord,
	ctx?: ExecutionContext,
): Promise<Response> {
	return respondWithCache(request, config.driveAssetCacheTTLSeconds, async () => {
		const tr2 = Date.now();
		const object = await env.ANYCAP_CLOUD_R2.get(file.object_key);
		console.log(`[drive] r2:get ${file.object_key}: ${Date.now() - tr2}ms`);
		if (!object || !object.body) {
			return notFoundPage("File object not found");
		}

		const mime = object.httpMetadata?.contentType || file.mime || guessMimeFromFilename(file.name);
		const headers = new Headers();
		headers.set("content-type", mime);
		if (object.httpEtag) {
			headers.set("etag", object.httpEtag);
		}
		if (object.size >= 0) {
			headers.set("content-length", String(object.size));
		}
		const contentDisposition = shouldInline(mime)
			? "inline"
			: `attachment; filename*=UTF-8''${encodeURIComponent(file.name)}`;
		headers.set("content-disposition", contentDisposition);
		return new Response(object.body, { status: 200, headers });
	}, ctx);
}

async function serveFile(
	request: Request,
	env: Env,
	config: EdgeConfig,
	file: DriveFileRecord,
	ctx?: ExecutionContext,
): Promise<Response> {
	const url = new URL(request.url);
	if (url.searchParams.get("raw") === "1") {
		return serveFileRaw(request, env, config, file, ctx);
	}
	const guessed = guessMimeFromFilename(file.name);
	const mime = guessed !== "application/octet-stream" ? guessed : (file.mime || guessed);
	const rawUrl = `${url.pathname}?raw=1`;
	return renderFilePreviewPage({
		fileName: file.name,
		fileSize: file.size ?? undefined,
		rawUrl,
		mime,
	});
}

async function handleDrivePasswordSubmit(
	request: Request,
	env: Env,
	config: EdgeConfig,
	token: string,
	share: DriveShareRecord,
): Promise<Response> {
	if (request.method !== "POST") {
		return renderErrorPage(405, "Method not allowed", "Use POST for password submission.");
	}

	const form = await request.formData();
	const password = String(form.get("password") || "");
	const redirectPath = sanitizeRedirectPath(token, form.get("redirect"));

	if (!share.has_password || !share.password_hash || !share.password_salt) {
		const redirectURL = new URL(redirectPath, request.url);
		return Response.redirect(redirectURL.toString(), 302);
	}

	const blocked = await hitRateLimit(env, {
		scope: "drive_password",
		key: token,
		ip: getClientIP(request),
		windowSeconds: config.drivePasswordRateLimitWindowSeconds,
		maxAttempts: config.drivePasswordRateLimitMaxAttempts,
	});
	if (blocked) {
		return renderPasswordPage({
			title: "Too many attempts",
			description: "Please wait and try again.",
			actionPath: `/s/${encodeURIComponent(token)}/password`,
			redirectPath,
			errorMessage: "Rate limit exceeded.",
		});
	}

	const ok = await verifyPBKDF2Password(env, password, share.password_hash, share.password_salt);
	if (!ok) {
		return renderPasswordPage({
			title: "Password required",
			description: "This shared resource is password protected.",
			actionPath: `/s/${encodeURIComponent(token)}/password`,
			redirectPath,
			errorMessage: "Incorrect password.",
		});
	}

	const setCookie = await createSessionCookie(
		env,
		DRIVE_SESSION_COOKIE,
		"drive",
		token,
		config.drivePasswordSessionTTLSeconds,
	);
	const redirectURL = new URL(redirectPath, request.url);
	return new Response(null, {
		status: 302,
		headers: {
			location: redirectURL.toString(),
			"set-cookie": setCookie,
		},
	});
}

export async function handleDrive(request: Request, env: Env, config: EdgeConfig, ctx?: ExecutionContext): Promise<Response> {
	const t0 = Date.now();
	const url = new URL(request.url);
	const route = parseDriveRoute(url.pathname);
	if (!route) {
		return notFoundPage("Drive route not found");
	}
	const { token, rest } = route;

	const t1 = Date.now();
	const share = await getKVJSON<DriveShareRecord>(env, `drive:share:${token}`);
	console.log(`[drive] kv:share lookup: ${Date.now() - t1}ms`);
	if (!share) {
		return notFoundPage("Share link not found");
	}
	if (isExpired(share)) {
		const response = renderErrorPage(410, "Link expired", "This share link is expired.");
		response.headers.set("set-cookie", await clearSessionCookie(DRIVE_SESSION_COOKIE));
		return response;
	}

	if (rest === "password") {
		if (request.method === "GET") {
			if (!share.has_password) {
				return Response.redirect(new URL(`/s/${encodeURIComponent(token)}`, request.url).toString(), 302);
			}
			return renderPasswordPage({
				title: "Password required",
				description: "This shared resource is password protected.",
				actionPath: `/s/${encodeURIComponent(token)}/password`,
				redirectPath: `/s/${encodeURIComponent(token)}`,
			});
		}
		return handleDrivePasswordSubmit(request, env, config, token, share);
	}
	if (request.method !== "GET") {
		return renderErrorPage(405, "Method not allowed", "Only GET is supported for this route.");
	}

	if (share.has_password) {
		const t2 = Date.now();
		const validSession = await isSessionValid(env, request, DRIVE_SESSION_COOKIE, "drive", token);
		console.log(`[drive] session validation: ${Date.now() - t2}ms`);
		if (!validSession) {
			return renderPasswordPage({
				title: "Password required",
				description: "This shared resource is password protected.",
				actionPath: `/s/${encodeURIComponent(token)}/password`,
				redirectPath: `${url.pathname}${url.search}`,
			});
		}
	}

	if (share.root_node_kind === "file") {
		if (rest === "") {
			const t3 = Date.now();
			const file = await getKVJSON<DriveFileRecord>(env, `drive:file:${share.root_node_id}`);
			console.log(`[drive] kv:file lookup: ${Date.now() - t3}ms`);
			if (!file) {
				return notFoundPage("Shared file not found");
			}
			console.log(`[drive] total before serve: ${Date.now() - t0}ms`);
			return serveFile(request, env, config, file, ctx);
		}
		if (rest.startsWith("file/")) {
			const fileID = parsePositiveInt(rest.slice("file/".length));
			if (fileID == null || fileID !== share.root_node_id) {
				return forbiddenPage("File is outside shared scope");
			}
			const file = await getKVJSON<DriveFileRecord>(env, `drive:file:${fileID}`);
			if (!file) {
				return notFoundPage("Shared file not found");
			}
			return serveFile(request, env, config, file, ctx);
		}
		return forbiddenPage("Path is outside shared scope");
	}

	if (share.root_node_kind !== "folder") {
		return renderErrorPage(500, "Invalid share payload", "Unknown root node kind.");
	}

	if (rest === "") {
		return loadDirectoryPage(env, token, share.root_node_id, share.root_node_id);
	}
	if (rest.startsWith("dir/")) {
		const dirID = parsePositiveInt(rest.slice("dir/".length));
		if (dirID == null) {
			return notFoundPage("Invalid directory id");
		}
		return loadDirectoryPage(env, token, dirID, share.root_node_id);
	}
	if (rest.startsWith("file/")) {
		const fileID = parsePositiveInt(rest.slice("file/".length));
		if (fileID == null) {
			return notFoundPage("Invalid file id");
		}
		const file = await loadFileRecordForFolderShare(env, fileID, share.root_node_id);
		if (!file) {
			return forbiddenPage("File is outside shared scope");
		}
		return serveFile(request, env, config, file, ctx);
	}

	return notFoundPage("Drive path not found");
}
