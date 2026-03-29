import { escapeHTML, htmlResponse } from "../response";
import { formatFileSize, getRenderMode, type RenderMode } from "./helpers";
import { pageHead, topbar } from "./layout";
import { FILE_PREVIEW_STYLES } from "./styles";

const HLJS_CSS = `\n<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/highlight.js@11/styles/github.min.css" />`;

function previewContent(mode: RenderMode, rawUrl: string, fileName: string): string {
	const url = escapeHTML(rawUrl);
	const name = escapeHTML(fileName);
	switch (mode) {
		case "image":
			return `<div class="preview-frame"><img src="${url}" alt="${name}" /></div>`;
		case "video":
			return `<div class="preview-frame"><video controls preload="metadata" src="${url}"></video></div>`;
		case "audio":
			return `<div class="audio-card"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-neutral)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg><div class="audio-name">${name}</div><audio controls preload="metadata" src="${url}"></audio></div>`;
		case "pdf":
			return `<iframe src="${url}" class="pdf-frame" title="${name}"></iframe>`;
		case "html":
			return `<iframe src="${url}" class="html-frame" sandbox="allow-same-origin" title="${name}"></iframe>`;
		case "markdown":
			return `<article class="md-content" id="md"></article>`;
		case "text":
			return `<pre class="text-content" id="txt"></pre>`;
		case "download":
			return `<div class="dl-card"><svg width="48" height="48" viewBox="0 0 16 16" fill="none" stroke="var(--text-neutral)" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M4 2v12h8V6l-4-4H4z"/><path d="M8 2v4h4"/></svg><div class="dl-name">${name}</div></div>`;
	}
}

function previewScripts(mode: RenderMode, rawUrl: string): string {
	const safe = rawUrl.replaceAll("\\", "\\\\").replaceAll("`", "\\`").replaceAll("$", "\\$");
	if (mode === "markdown") {
		// markdown-it handles GFM + syntax highlighting via highlight callback.
		// Mermaid fenced blocks are emitted as <div class="mermaid"> by the same callback,
		// so mermaid.run() picks them up with no manual DOM surgery.
		return `<script type="module">
import markdownit from"https://cdn.jsdelivr.net/npm/markdown-it@14/+esm";
import hljs from"https://cdn.jsdelivr.net/npm/highlight.js@11/+esm";
import mermaid from"https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs";
mermaid.initialize({startOnLoad:false,theme:"neutral",fontFamily:"sans-serif"});
const md=markdownit({html:false,linkify:true,typographer:true,highlight(str,lang){
  if(lang==="mermaid")return'<div class="mermaid">'+md.utils.escapeHtml(str)+"</div>";
  if(lang&&hljs.getLanguage(lang))try{return hljs.highlight(str,{language:lang}).value}catch{}
  return"";
}});
const r=await fetch(\`${safe}\`);
document.getElementById("md").innerHTML=md.render(await r.text());
await mermaid.run({nodes:document.querySelectorAll(".mermaid")});
</script>`;
	}
	if (mode === "text") {
		return `<script>
fetch(\`${safe}\`).then(r=>r.text()).then(t=>{document.getElementById("txt").textContent=t});
</script>`;
	}
	return "";
}

export function renderFilePreviewPage(options: {
	fileName: string;
	fileSize?: number;
	rawUrl: string;
	mime: string;
}): Response {
	const mode = getRenderMode(options.mime);
	const sizeStr = options.fileSize != null && options.fileSize >= 0 ? formatFileSize(options.fileSize) : undefined;
	const extraHead = mode === "markdown" ? HLJS_CSS : "";
	const html = `${pageHead(`${options.fileName} - AnyCap Drive`, FILE_PREVIEW_STYLES, extraHead)}
<body>
<div class="wrapper">
${topbar({ name: options.fileName, size: sizeStr, rawUrl: options.rawUrl, downloadName: options.fileName })}
<main class="content">
${previewContent(mode, options.rawUrl, options.fileName)}
</main>
</div>
${previewScripts(mode, options.rawUrl)}
</body>
</html>`;
	return htmlResponse(html, 200);
}
