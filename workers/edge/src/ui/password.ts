import { escapeHTML, htmlResponse } from "../response";
import { MARK_SVG_SOLID } from "./icons";
import { pageHead, topbar } from "./layout";

const PASSWORD_STYLES = `
.pw-card{max-width:480px;width:100%;text-align:center;padding:40px 32px;background:var(--surface-raised);border:1px solid var(--border-default);border-radius:12px;box-shadow:0 18px 50px rgba(28,31,23,0.06)}
.pw-card .mark{margin-bottom:20px}
.pw-card h1{font-size:20px;color:var(--text-primary);margin-bottom:8px}
.pw-card .desc{color:var(--text-secondary);font-size:14px;margin-bottom:16px}
.pw-card .error{color:#a83f32;font:13px var(--font-mono,monospace);margin-bottom:12px}
.pw-card form{display:grid;gap:10px;text-align:left}
.pw-card input[type="password"]{border:1px solid rgba(199,207,173,0.7);background:var(--surface-raised);border-radius:8px;padding:10px;font-size:14px;transition:border 200ms ease,box-shadow 200ms ease}
.pw-card input[type="password"]:focus{outline:none;border-color:var(--olive);box-shadow:0 0 0 4px rgba(107,125,58,0.12)}
.pw-card button{border:none;background:var(--olive);color:var(--surface);border-radius:8px;padding:10px;cursor:pointer;font:13px var(--font-mono);letter-spacing:0.8px;transition:background 200ms ease}
.pw-card button:hover{background:var(--navy)}`;

export type PasswordPageOptions = {
	title: string;
	description: string;
	actionPath: string;
	redirectPath: string;
	errorMessage?: string;
};

export function renderPasswordPage(options: PasswordPageOptions): Response {
	const errorBlock = options.errorMessage
		? `<p class="error">${escapeHTML(options.errorMessage)}</p>`
		: "";
	const html = `${pageHead(options.title, PASSWORD_STYLES)}
<body>
<div class="wrapper">
${topbar({ name: options.title })}
<main class="content">
<div class="pw-card">
<div class="mark">${MARK_SVG_SOLID}</div>
<h1>${escapeHTML(options.title)}</h1>
<p class="desc">${escapeHTML(options.description)}</p>
${errorBlock}
<form method="post" action="${escapeHTML(options.actionPath)}">
<input type="hidden" name="redirect" value="${escapeHTML(options.redirectPath)}" />
<input type="password" name="password" required placeholder="Enter password" />
<button type="submit">Unlock</button>
</form>
</div>
</main>
</div>
</body>
</html>`;
	return htmlResponse(html, 200);
}
