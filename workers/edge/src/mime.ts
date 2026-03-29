export function guessContentType(pathname: string): string {
	const lower = pathname.toLowerCase();
	if (lower.endsWith(".html") || lower.endsWith(".htm")) return "text/html; charset=utf-8";
	if (lower.endsWith(".css")) return "text/css; charset=utf-8";
	if (lower.endsWith(".js")) return "application/javascript; charset=utf-8";
	if (lower.endsWith(".json")) return "application/json; charset=utf-8";
	if (lower.endsWith(".png")) return "image/png";
	if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
	if (lower.endsWith(".svg")) return "image/svg+xml";
	if (lower.endsWith(".webp")) return "image/webp";
	if (lower.endsWith(".gif")) return "image/gif";
	if (lower.endsWith(".ico")) return "image/x-icon";
	if (lower.endsWith(".txt")) return "text/plain; charset=utf-8";
	if (lower.endsWith(".woff2")) return "font/woff2";
	if (lower.endsWith(".woff")) return "font/woff";
	if (lower.endsWith(".ttf")) return "font/ttf";
	if (lower.endsWith(".otf")) return "font/otf";
	if (lower.endsWith(".xml")) return "application/xml; charset=utf-8";
	if (lower.endsWith(".pdf")) return "application/pdf";
	return "application/octet-stream";
}
