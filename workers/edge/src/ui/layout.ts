import { escapeHTML } from "../response";
import { DL_ICON, FAVICON_LINK, MARK_SVG } from "./icons";
import { BASE_STYLES } from "./styles";

export function pageHead(title: string, extraStyles = "", extraHead = ""): string {
	return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHTML(title)}</title>
${FAVICON_LINK}
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />${extraHead}
<style>${BASE_STYLES}${extraStyles}</style>
</head>`;
}

export function topbar(options: { name: string; size?: string; rawUrl?: string; downloadName?: string }): string {
	const sizeSpan = options.size ? `<span class="file-size">${escapeHTML(options.size)}</span>` : "";
	const dlBtn = options.rawUrl
		? `<a href="${escapeHTML(options.rawUrl)}" download="${escapeHTML(options.downloadName || options.name)}" class="btn-dl">${DL_ICON}<span>Download</span></a>`
		: "";
	return `<nav class="topbar">
<a href="https://anycap.ai" target="_blank" rel="noopener" class="badge">${MARK_SVG}<span class="badge-wm"><span class="a">any</span><span class="c">cap</span></span></a>
<div class="sep"></div>
<div class="file-info"><span class="file-name">${escapeHTML(options.name)}</span>${sizeSpan}</div>
${dlBtn}
</nav>`;
}
