import type { Env } from "./types";

export type MockKV = {
	namespace: KVNamespace;
	store: Map<string, string>;
	putCalls: Array<{
		key: string;
		value: string;
		expirationTtl?: number;
	}>;
};

type MockR2Object = {
	body: Uint8Array;
	contentType?: string;
	etag?: string;
};

export type MockR2 = {
	bucket: R2Bucket;
	objects: Map<string, MockR2Object>;
	getCalls: string[];
	putCalls: Array<{
		key: string;
		contentType?: string;
		size: number;
	}>;
};

export function createMockKV(initial?: Record<string, string>): MockKV {
	const store = new Map<string, string>(Object.entries(initial || {}));
	const putCalls: Array<{ key: string; value: string; expirationTtl?: number }> = [];
	const namespace = {
		async get(key: string): Promise<string | null> {
			return store.get(key) ?? null;
		},
		async put(key: string, value: string, options?: KVNamespacePutOptions): Promise<void> {
			store.set(key, value);
			putCalls.push({
				key,
				value,
				expirationTtl: options?.expirationTtl,
			});
		},
	} as unknown as KVNamespace;
	return {
		namespace,
		store,
		putCalls,
	};
}

function toUint8Array(value: string | Uint8Array): Uint8Array {
	if (typeof value === "string") {
		return new TextEncoder().encode(value);
	}
	return value;
}

export function createMockR2(initial?: Record<string, { body: string | Uint8Array; contentType?: string; etag?: string }>): MockR2 {
	const objects = new Map<string, MockR2Object>();
	if (initial) {
		for (const [key, value] of Object.entries(initial)) {
			objects.set(key, {
				body: toUint8Array(value.body),
				contentType: value.contentType,
				etag: value.etag,
			});
		}
	}

	const getCalls: string[] = [];
	const putCalls: Array<{ key: string; contentType?: string; size: number }> = [];
	const bucket = {
		async get(key: string, options?: unknown): Promise<R2ObjectBody | null> {
			getCalls.push(key);
			const obj = objects.get(key);
			if (!obj) {
				return null;
			}

			let body = obj.body;
			const range = (options as { range?: { offset?: number; length?: number; suffix?: number } } | undefined)?.range;
			if (range) {
				if (Number.isInteger(range.suffix) && (range.suffix || 0) > 0) {
					const suffix = Math.min(range.suffix || 0, body.byteLength);
					body = body.slice(body.byteLength - suffix);
				} else {
					const offset = Math.max(0, range.offset || 0);
					const length = Math.max(0, range.length || 0);
					body = body.slice(offset, offset + length);
				}
			}

			return {
				body: new Response(body).body,
				size: body.byteLength,
				httpEtag: obj.etag,
				httpMetadata: obj.contentType ? { contentType: obj.contentType } : undefined,
			} as unknown as R2ObjectBody;
		},
		async put(key: string, value: string | ArrayBuffer | ArrayBufferView | ReadableStream, options?: unknown): Promise<R2Object> {
			let bytes: Uint8Array;
			if (typeof value === "string") {
				bytes = new TextEncoder().encode(value);
			} else if (value instanceof ReadableStream) {
				const buffer = await new Response(value).arrayBuffer();
				bytes = new Uint8Array(buffer);
			} else if (value instanceof ArrayBuffer) {
				bytes = new Uint8Array(value);
			} else {
				const view = value as ArrayBufferView;
				bytes = new Uint8Array(view.buffer, view.byteOffset, view.byteLength);
			}

			const contentType = (options as { httpMetadata?: { contentType?: string } } | undefined)?.httpMetadata?.contentType;
			const etag = `etag-${objects.size + 1}`;
			objects.set(key, {
				body: bytes,
				contentType,
				etag,
			});
			putCalls.push({
				key,
				contentType,
				size: bytes.byteLength,
			});
			return {
				key,
				etag,
				httpEtag: etag,
				size: bytes.byteLength,
				version: "v1",
				uploaded: new Date(),
			} as unknown as R2Object;
		},
	} as unknown as R2Bucket;

	return {
		bucket,
		objects,
		getCalls,
		putCalls,
	};
}

export function setKVJSON(store: Map<string, string>, key: string, value: unknown): void {
	store.set(key, JSON.stringify(value));
}

export function createEnv(overrides?: Partial<Env>): Env {
	return {
		EDGE_KV: createMockKV().namespace,
		ANYCAP_CLOUD_R2: createMockR2().bucket,
		ANYCAP_PASSWORD_PEPPER: "pepper_v1",
		EDGE_SESSION_SECRET: "session_secret",
		...(overrides || {}),
	};
}

export function extractCookiePair(setCookieHeader: string): string {
	return setCookieHeader.split(";")[0] || "";
}
