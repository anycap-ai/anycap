import type { Env } from "./types";

export type RateLimitOptions = {
	scope: "drive_password" | "page_password";
	key: string;
	ip: string;
	windowSeconds: number;
	maxAttempts: number;
};

export async function hitRateLimit(env: Env, options: RateLimitOptions): Promise<boolean> {
	if (options.maxAttempts <= 0 || options.windowSeconds <= 0) {
		return false;
	}

	const nowSeconds = Math.floor(Date.now() / 1000);
	const bucket = Math.floor(nowSeconds / options.windowSeconds);
	const counterKey = `rl:${options.scope}:${options.key}:${options.ip}:${bucket}`;
	const raw = await env.EDGE_KV.get(counterKey);
	const current = raw ? Number.parseInt(raw, 10) : 0;
	if (Number.isInteger(current) && current >= options.maxAttempts) {
		return true;
	}

	const next = Number.isInteger(current) ? current + 1 : 1;
	await env.EDGE_KV.put(counterKey, String(next), {
		expirationTtl: options.windowSeconds + 5,
	});
	return false;
}
