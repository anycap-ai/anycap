import type { Env } from "./types";

export async function getKVJSON<T>(env: Env, key: string): Promise<T | null> {
	const raw = await env.EDGE_KV.get(key);
	if (!raw) {
		return null;
	}
	try {
		return JSON.parse(raw) as T;
	} catch {
		return null;
	}
}
