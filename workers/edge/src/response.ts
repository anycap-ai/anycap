export function jsonResponse(data: unknown, init?: ResponseInit): Response {
	return new Response(JSON.stringify(data), {
		status: init?.status || 200,
		headers: {
			"content-type": "application/json; charset=utf-8",
			...(init?.headers || {}),
		},
	});
}

export function htmlResponse(html: string, status = 200, headers?: HeadersInit): Response {
	return new Response(html, {
		status,
		headers: {
			"content-type": "text/html; charset=utf-8",
			"cache-control": "no-store",
			...(headers || {}),
		},
	});
}

export function notFoundPage(message = "Not found"): Response {
	return htmlResponse(`<!doctype html><html><head><title>Not found</title></head><body><h1>404</h1><p>${escapeHTML(message)}</p></body></html>`, 404);
}

export function gonePage(message = "Link expired or unavailable"): Response {
	return htmlResponse(`<!doctype html><html><head><title>Unavailable</title></head><body><h1>410</h1><p>${escapeHTML(message)}</p></body></html>`, 410);
}

export function forbiddenPage(message = "Access denied"): Response {
	return htmlResponse(`<!doctype html><html><head><title>Forbidden</title></head><body><h1>403</h1><p>${escapeHTML(message)}</p></body></html>`, 403);
}

export function escapeHTML(value: string): string {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#39;");
}
