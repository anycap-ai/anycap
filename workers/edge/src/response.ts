const FAVICON = `<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><g transform='rotate(-5 100 100)'><rect x='15' y='15' width='170' height='170' rx='8' fill='%23d4e0a4' opacity='.18'/></g><g transform='rotate(-3 100 100)'><rect x='28' y='28' width='144' height='144' rx='5' fill='%238fa34e' opacity='.42'/></g><rect x='49' y='49' width='102' height='102' rx='3' fill='%236b7d3a'/><rect x='83' y='83' width='34' height='34' rx='2' fill='%23f4f5f0'/></svg>">`;

const MARK = `<svg width="36" height="36" viewBox="0 0 200 200" fill="none"><g transform="rotate(-5 100 100)"><rect x="15" y="15" width="170" height="170" rx="8" fill="#d4e0a4" opacity=".18"/></g><g transform="rotate(-3 100 100)"><rect x="28" y="28" width="144" height="144" rx="5" fill="#8fa34e" opacity=".42"/></g><rect x="49" y="49" width="102" height="102" rx="3" fill="#6b7d3a"/><rect x="83" y="83" width="34" height="34" rx="2" fill="#f4f5f0"/></svg>`;

function styledErrorPage(status: number, title: string, message: string): string {
	return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${status} - ${escapeHTML(title)}</title>
${FAVICON}
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f4f5f0;font-family:sans-serif;color:#1c1f17}
.card{max-width:420px;width:calc(100% - 48px);text-align:center;padding:40px 32px;background:#f9faf5;border:1px solid rgba(212,219,184,0.7);border-radius:12px;box-shadow:0 18px 50px rgba(28,31,23,0.06)}
.mark{margin-bottom:24px}
.status{font-size:48px;font-weight:700;line-height:1.1;margin-bottom:8px}
.title{font-size:16px;color:#3a3e32;margin-bottom:4px}
.msg{font-size:14px;color:#707468}
</style>
</head>
<body>
<div class="card">
<div class="mark">${MARK}</div>
<p class="status">${status}</p>
<p class="title">${escapeHTML(title)}</p>
<p class="msg">${escapeHTML(message)}</p>
</div>
</body>
</html>`;
}

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
	return htmlResponse(styledErrorPage(404, "Not found", message), 404);
}

export function gonePage(message = "Link expired or unavailable"): Response {
	return htmlResponse(styledErrorPage(410, "Unavailable", message), 410);
}

export function forbiddenPage(message = "Access denied"): Response {
	return htmlResponse(styledErrorPage(403, "Forbidden", message), 403);
}

export function escapeHTML(value: string): string {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#39;");
}
