import { escapeHTML, htmlResponse } from "../response";
import { pageHead, topbar } from "./layout";

export type PasswordPageOptions = {
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
	const html = `${pageHead(options.title)}
<body>
<div class="wrapper">
${topbar({ name: options.title })}
<main class="content">
<div style="max-width:480px;width:100%;border:1px solid var(--border-default);background:var(--surface-raised);padding:20px;border-radius:12px;">
<h1 style="margin:0 0 8px;font-size:20px;">${escapeHTML(options.title)}</h1>
<p style="margin:0 0 16px;color:var(--text-secondary);font-size:14px;">${escapeHTML(options.description)}</p>
${errorBlock}
<form method="post" action="${escapeHTML(options.actionPath)}" style="display:grid;gap:10px;">
<input type="hidden" name="redirect" value="${escapeHTML(options.redirectPath)}" />
<input type="password" name="password" required placeholder="Enter password" style="border:1px solid rgba(199,207,173,0.7);background:var(--surface-raised);border-radius:8px;padding:10px;font-size:14px;" />
<button type="submit" style="border:none;background:var(--olive);color:var(--surface);border-radius:8px;padding:10px;cursor:pointer;font:13px var(--font-mono);letter-spacing:0.8px;transition:background 200ms ease">Unlock</button>
</form>
</div>
</main>
</div>
</body>
</html>`;
	return htmlResponse(html, 200);
}
