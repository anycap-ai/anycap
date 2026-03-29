import { escapeHTML, htmlResponse } from "../response";
import { pageHead, topbar } from "./layout";

export function renderErrorPage(status: number, title: string, message: string): Response {
	const html = `${pageHead(title)}
<body>
<div class="wrapper">
${topbar({ name: title })}
<main class="content">
<div style="max-width:520px;width:100%;border:1px solid var(--border-default);background:var(--surface-raised);padding:20px;border-radius:12px;">
<h1 style="margin:0 0 8px;font-size:26px;">${status}</h1>
<p style="margin:0 0 6px;font-size:18px;">${escapeHTML(title)}</p>
<p style="margin:0;color:var(--text-secondary);">${escapeHTML(message)}</p>
</div>
</main>
</div>
</body>
</html>`;
	return htmlResponse(html, status);
}
