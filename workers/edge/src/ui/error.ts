import { escapeHTML, htmlResponse } from "../response";
import { MARK_SVG_SOLID } from "./icons";
import { pageHead, topbar } from "./layout";

const ERROR_STYLES = `
.error-card{max-width:520px;width:100%;text-align:center;padding:40px 32px;background:var(--surface-raised);border:1px solid var(--border-default);border-radius:12px;box-shadow:0 18px 50px rgba(28,31,23,0.06)}
.error-card .mark{margin-bottom:20px}
.error-card .status{font-family:var(--font-mono);font-size:48px;font-weight:700;color:var(--text-primary);line-height:1.1;margin-bottom:8px}
.error-card .title{font-size:16px;color:var(--text-body);margin-bottom:4px}
.error-card .msg{font-size:14px;color:var(--text-label)}`;

export function renderErrorPage(status: number, title: string, message: string): Response {
	const html = `${pageHead(title, ERROR_STYLES)}
<body>
<div class="wrapper">
${topbar({ name: title })}
<main class="content">
<div class="error-card">
<div class="mark">${MARK_SVG_SOLID}</div>
<p class="status">${status}</p>
<p class="title">${escapeHTML(title)}</p>
<p class="msg">${escapeHTML(message)}</p>
</div>
</main>
</div>
</body>
</html>`;
	return htmlResponse(html, status);
}
