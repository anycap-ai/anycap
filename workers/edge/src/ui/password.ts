import { escapeHTML, htmlResponse } from "../response";
import { MARK_SVG_SOLID } from "./icons";
import { pageHead, topbar } from "./layout";

const PASSWORD_STYLES = `
.pw-card{max-width:480px;width:100%;text-align:center;padding:44px 36px;background:var(--surface-card);border:1px solid var(--border-card);border-radius:16px;box-shadow:var(--shadow-card)}
.pw-card .mark{margin-bottom:24px}
.pw-card h1{font-size:22px;font-weight:600;color:var(--text-primary);margin-bottom:10px}
.pw-card .desc{color:var(--text-secondary);font-size:15px;margin-bottom:20px;line-height:1.5}
.pw-card .error{color:var(--error);font-size:13px;margin-bottom:14px}
.pw-card form{display:flex;flex-direction:column;align-items:center;gap:12px}
.pw-card input[type="password"]{width:240px;border:1px solid var(--border-input);background:var(--surface-input);border-radius:12px;padding:11px 14px;font-size:14px;font-family:var(--font-mono);text-align:center;box-shadow:var(--shadow-input);transition:border 200ms ease,box-shadow 200ms ease}
.pw-card input[type="password"]:focus{outline:none;border-color:var(--olive);box-shadow:0 0 0 3px rgba(107,125,58,0.15)}
.pw-card button{width:240px;border:none;background:var(--olive);color:white;border-radius:12px;padding:11px;cursor:pointer;font-size:13px;font-family:var(--font-mono);font-weight:500;box-shadow:var(--shadow-btn-primary);transition:background 200ms ease}
.pw-card button:hover{background:var(--olive-hover)}
.pw-card button:active{background:var(--olive-active)}`;

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
