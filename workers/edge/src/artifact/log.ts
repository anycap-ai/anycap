type ArtifactLogValue = string | number | boolean | null | undefined;

type ArtifactLogFields = Record<string, ArtifactLogValue>;

function resolveRequestID(request: Request): string {
	const xRequestID = (request.headers.get("x-request-id") || "").trim();
	if (xRequestID) {
		return xRequestID;
	}
	const cfRay = (request.headers.get("cf-ray") || "").trim();
	if (cfRay) {
		return cfRay;
	}
	return "";
}

function resolvePathname(rawURL: string): string {
	try {
		return new URL(rawURL).pathname;
	} catch {
		return "";
	}
}

export function sanitizeURLForLog(rawURL: string): string {
	const trimmed = rawURL.trim();
	if (!trimmed) {
		return "";
	}
	try {
		const parsed = new URL(trimmed);
		return `${parsed.protocol}//${parsed.host}${parsed.pathname}`;
	} catch {
		return trimmed;
	}
}

export function redactTokenForLog(token: string): string {
	const trimmed = token.trim();
	if (!trimmed) {
		return "";
	}
	if (trimmed.length <= 12) {
		return trimmed;
	}
	return `${trimmed.slice(0, 8)}...${trimmed.slice(-4)}`;
}

export function logArtifactEvent(
	scope: "artifact-ingest" | "artifact-public",
	level: "info" | "warn" | "error",
	request: Request,
	fields: ArtifactLogFields,
): void {
	const payload: ArtifactLogFields = {
		request_id: resolveRequestID(request),
		method: request.method,
		path: resolvePathname(request.url),
		...fields,
	};
	const line = `[${scope}] ${JSON.stringify(payload)}`;
	if (level === "error") {
		console.error(line);
		return;
	}
	if (level === "warn") {
		console.warn(line);
		return;
	}
	console.log(line);
}
