import { escapeHTML, htmlResponse } from "./response";

type PasswordPageOptions = {
	title: string;
	description: string;
	actionPath: string;
	redirectPath: string;
	errorMessage?: string;
};

export function renderPasswordPage(options: PasswordPageOptions): Response {
	const errorBlock = options.errorMessage
		? `<p style="color:#a83f32;font:13px var(--font-mono,monospace);margin:0 0 12px">${escapeHTML(options.errorMessage)}</p>`
		: "";
	const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHTML(options.title)}</title>
</head>
<body style="margin:0;background:#f4f5f0;color:#1c1f17;padding:24px;font-family:sans-serif;">
<div style="max-width:480px;margin:36px auto;border:1px solid #d4dbb8;background:#f9faf5;padding:20px;border-radius:8px;">
<h1 style="margin:0 0 8px;font-size:20px;">${escapeHTML(options.title)}</h1>
<p style="margin:0 0 16px;color:#4d5145;font-size:14px;">${escapeHTML(options.description)}</p>
${errorBlock}
<form method="post" action="${escapeHTML(options.actionPath)}" style="display:grid;gap:10px;">
<input type="hidden" name="redirect" value="${escapeHTML(options.redirectPath)}" />
<input type="password" name="password" required placeholder="Enter password" style="border:1px solid #c7cfad;background:#fcfdf8;border-radius:8px;padding:10px;font-size:14px;" />
<button type="submit" style="border:1px solid #d4dbb8;background:#f4f5f0;color:#1c1f17;border-radius:8px;padding:10px;cursor:pointer;font:13px var(--font-mono,monospace)">Unlock</button>
</form>
</div>
</body>
</html>`;
	return htmlResponse(html, 200);
}

export function renderDriveDirectoryPage(params: {
	title: string;
	token: string;
	dirID: number;
	entries: Array<{ id: number; kind: "file" | "folder"; name: string }>;
	parentDirID?: number | null;
	atRoot: boolean;
}): Response {
	const parentLink = !params.atRoot && params.parentDirID != null
		? `<li><a href="/s/${encodeURIComponent(params.token)}/dir/${params.parentDirID}">..</a></li>`
		: "";
	const rows = params.entries
		.map((entry) => {
			const href = entry.kind === "folder"
				? `/s/${encodeURIComponent(params.token)}/dir/${entry.id}`
				: `/s/${encodeURIComponent(params.token)}/file/${entry.id}`;
			const label = entry.kind === "folder" ? "[DIR]" : "[FILE]";
			return `<li><a href="${href}">${label} ${escapeHTML(entry.name)}</a></li>`;
		})
		.join("\n");

	const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHTML(params.title)}</title>
</head>
<body style="margin:0;background:#f4f5f0;color:#1c1f17;padding:24px;font-family:sans-serif;">
<div style="max-width:760px;margin:24px auto;border:1px solid #d4dbb8;background:#f9faf5;padding:20px;border-radius:8px;">
<h1 style="margin:0 0 12px;font-size:20px;">${escapeHTML(params.title)}</h1>
<ul style="margin:0;padding-left:20px;display:grid;gap:8px;">
${parentLink}
${rows || "<li><span style=\"color:#707468\">Empty directory</span></li>"}
</ul>
</div>
</body>
</html>`;
	return htmlResponse(html, 200);
}

export function renderErrorPage(status: number, title: string, message: string): Response {
	const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHTML(title)}</title>
</head>
<body style="margin:0;background:#f4f5f0;color:#1c1f17;padding:24px;font-family:sans-serif;">
<div style="max-width:520px;margin:48px auto;border:1px solid #d4dbb8;background:#f9faf5;padding:20px;border-radius:8px;">
<h1 style="margin:0 0 8px;font-size:26px;">${status}</h1>
<p style="margin:0 0 6px;font-size:18px;">${escapeHTML(title)}</p>
<p style="margin:0;color:#4d5145;">${escapeHTML(message)}</p>
</div>
</body>
</html>`;
	return htmlResponse(html, status);
}
