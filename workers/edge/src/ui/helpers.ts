export type RenderMode = "image" | "video" | "audio" | "pdf" | "html" | "markdown" | "text" | "download";

export function getRenderMode(mime: string): RenderMode {
	const m = mime.toLowerCase().split(";")[0].trim();
	if (m.startsWith("image/")) return "image";
	if (m.startsWith("video/")) return "video";
	if (m.startsWith("audio/")) return "audio";
	if (m === "application/pdf") return "pdf";
	if (m === "text/html") return "html";
	if (m === "text/markdown" || m === "text/x-markdown") return "markdown";
	if (m.startsWith("text/") || m === "application/json" || m === "application/xml" || m === "application/javascript") return "text";
	return "download";
}

export function formatFileSize(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
	if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(1)} MB`;
	return `${(bytes / 1073741824).toFixed(1)} GB`;
}
