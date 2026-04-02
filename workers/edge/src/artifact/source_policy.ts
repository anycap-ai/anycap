const localhostHosts = new Set(["localhost", "localhost.localdomain"]);

function parseIPv4Part(part: string): number | null {
	if (!/^\d+$/.test(part)) {
		return null;
	}
	const value = Number.parseInt(part, 10);
	if (!Number.isInteger(value) || value < 0 || value > 255) {
		return null;
	}
	return value;
}

function parseIPv4(hostname: string): number[] | null {
	const parts = hostname.split(".");
	if (parts.length !== 4) {
		return null;
	}
	const bytes: number[] = [];
	for (const part of parts) {
		const value = parseIPv4Part(part);
		if (value === null) {
			return null;
		}
		bytes.push(value);
	}
	return bytes;
}

function isIPv6Literal(hostname: string): boolean {
	const lowered = hostname.toLowerCase();
	return lowered.includes(":");
}

function isIPLiteral(hostname: string): boolean {
	return parseIPv4(hostname) !== null || isIPv6Literal(hostname);
}

function isPrivateOrBlockedIPv4(octets: number[]): boolean {
	const [a, b] = octets;
	if (a === 10 || a === 127 || a === 0) {
		return true;
	}
	if (a === 169 && b === 254) {
		return true;
	}
	if (a === 172 && b >= 16 && b <= 31) {
		return true;
	}
	if (a === 192 && b === 168) {
		return true;
	}
	if (a >= 224) {
		return true;
	}
	return false;
}

function isBlockedIPv6(hostname: string): boolean {
	const lowered = hostname.toLowerCase();
	return lowered === "::1" || lowered.startsWith("fe80:") || lowered.startsWith("fc") || lowered.startsWith("fd");
}

function normalizeAllowlistEntry(raw: string): string {
	return raw.trim().toLowerCase();
}

function hostMatchesAllowlist(hostname: string, allowlist: string[]): boolean {
	for (const item of allowlist) {
		if (!item) {
			continue;
		}
		if (item.startsWith("*.")) {
			const suffix = item.slice(2);
			if (!suffix) {
				continue;
			}
			if (hostname === suffix || hostname.endsWith(`.${suffix}`)) {
				return true;
			}
			continue;
		}
		if (hostname === item) {
			return true;
		}
	}
	return false;
}

export function parseSourceHostAllowlist(raw: string | undefined): string[] {
	if (!raw) {
		return [];
	}
	return raw
		.split(",")
		.map((item) => normalizeAllowlistEntry(item))
		.filter((item) => item.length > 0);
}

export function validateSourceURL(rawURL: string, allowlist: string[]): URL {
	const parsed = new URL(rawURL.trim());
	if (parsed.protocol !== "https:") {
		throw new Error("source_url must use https");
	}
	if (!parsed.hostname) {
		throw new Error("source_url host is required");
	}

	const hostname = parsed.hostname.trim().toLowerCase();
	if (localhostHosts.has(hostname) || hostname.endsWith(".localhost")) {
		throw new Error("source_url localhost is not allowed");
	}

	const ipv4 = parseIPv4(hostname);
	if (ipv4 !== null) {
		if (isPrivateOrBlockedIPv4(ipv4)) {
			throw new Error("source_url private network address is not allowed");
		}
		throw new Error("source_url ip literal is not allowed");
	}
	if (isIPv6Literal(hostname)) {
		if (isBlockedIPv6(hostname)) {
			throw new Error("source_url private network address is not allowed");
		}
		throw new Error("source_url ip literal is not allowed");
	}
	if (isIPLiteral(hostname)) {
		throw new Error("source_url ip literal is not allowed");
	}

	if (allowlist.length > 0 && !hostMatchesAllowlist(hostname, allowlist)) {
		throw new Error("source_url host is not in allowlist");
	}

	return parsed;
}

function isRedirectStatus(status: number): boolean {
	return status === 301 || status === 302 || status === 303 || status === 307 || status === 308;
}

export async function fetchWithSourcePolicy(sourceURL: string, allowlist: string[], maxRedirects: number): Promise<Response> {
	let currentURL = validateSourceURL(sourceURL, allowlist);

	for (let redirectCount = 0; redirectCount <= maxRedirects; redirectCount += 1) {
		const response = await fetch(currentURL.toString(), {
			method: "GET",
			redirect: "manual",
		});
		if (!isRedirectStatus(response.status)) {
			return response;
		}
		if (redirectCount >= maxRedirects) {
			throw new Error("source_url redirect exceeds limit");
		}
		const location = response.headers.get("location");
		if (!location) {
			throw new Error("source_url redirect location is missing");
		}
		const redirected = new URL(location, currentURL);
		currentURL = validateSourceURL(redirected.toString(), allowlist);
	}

	throw new Error("source_url redirect exceeds limit");
}
