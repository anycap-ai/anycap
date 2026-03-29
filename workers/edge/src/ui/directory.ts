import { escapeHTML, htmlResponse } from "../response";
import { FILE_ICON, FOLDER_ICON } from "./icons";
import { formatFileSize } from "./helpers";
import { pageHead, topbar } from "./layout";
import { DIR_STYLES } from "./styles";

export function renderDriveDirectoryPage(params: {
	title: string;
	token: string;
	dirID: number;
	entries: Array<{ id: number; kind: "file" | "folder"; name: string; size?: number }>;
	parentDirID?: number | null;
	atRoot: boolean;
}): Response {
	const base = `/s/${encodeURIComponent(params.token)}`;
	const parentRow = !params.atRoot && params.parentDirID != null
		? `<li><a href="${base}/dir/${params.parentDirID}">${FOLDER_ICON}<span class="entry-name">..</span><span class="entry-size"></span></a></li>`
		: "";
	const rows = params.entries
		.map((e) => {
			const href = e.kind === "folder" ? `${base}/dir/${e.id}` : `${base}/file/${e.id}`;
			const icon = e.kind === "folder" ? FOLDER_ICON : FILE_ICON;
			const size = e.kind === "file" && e.size != null ? formatFileSize(e.size) : "";
			return `<li><a href="${href}">${icon}<span class="entry-name">${escapeHTML(e.name)}</span><span class="entry-size">${size}</span></a></li>`;
		})
		.join("\n");

	const html = `${pageHead(`${params.title} - AnyCap Drive`, DIR_STYLES)}
<body>
<div class="wrapper">
${topbar({ name: params.title })}
<main class="content" style="align-items:flex-start;padding-top:80px">
<div class="dir-listing">
<div class="dir-header"><h2>${escapeHTML(params.title)}</h2></div>
<ul class="dir-list">
${parentRow}
${rows || `<li style="padding:10px 20px;color:var(--text-neutral);font-family:var(--font-mono);font-size:13px">Empty directory</li>`}
</ul>
</div>
</main>
</div>
</body>
</html>`;
	return htmlResponse(html, 200);
}
