import { afterEach, describe, expect, it, vi } from "vitest";

import { respondWithCache } from "./cache";

type CacheAPI = {
	match: ReturnType<typeof vi.fn<(req: Request) => Promise<Response | undefined>>>;
	put: ReturnType<typeof vi.fn<(req: Request, res: Response) => Promise<void>>>;
};

function withMockCache(): { api: CacheAPI; restore: () => void } {
	const store = new Map<string, Response>();
	const api: CacheAPI = {
		match: vi.fn(async (req: Request) => store.get(req.url)),
		put: vi.fn(async (req: Request, res: Response) => {
			store.set(req.url, res);
		}),
	};
	const descriptor = Object.getOwnPropertyDescriptor(globalThis, "caches");
	Object.defineProperty(globalThis, "caches", {
		value: { default: api },
		configurable: true,
		writable: true,
	});
	return {
		api,
		restore() {
			if (descriptor) {
				Object.defineProperty(globalThis, "caches", descriptor);
				return;
			}
			delete (globalThis as Record<string, unknown>).caches;
		},
	};
}

describe("respondWithCache", () => {
	let restore: (() => void) | null = null;

	afterEach(() => {
		if (restore) {
			restore();
			restore = null;
		}
	});

	it("caches GET success response", async () => {
		const mock = withMockCache();
		restore = mock.restore;
		const request = new Request("https://drive.anycap.cloud/s/t/file/1");
		const loader = vi.fn(async () => new Response("ok", { status: 200 }));

		const first = await respondWithCache(request, 90, loader);
		expect(await first.text()).toBe("ok");
		expect(first.headers.get("cache-control")).toBe("public, max-age=90");
		expect(loader).toHaveBeenCalledTimes(1);
		expect(mock.api.put).toHaveBeenCalledTimes(1);

		const second = await respondWithCache(request, 90, loader);
		expect(await second.text()).toBe("ok");
		expect(loader).toHaveBeenCalledTimes(1);
		expect(mock.api.match).toHaveBeenCalledTimes(2);
	});

	it("skips cache for non-GET, non-2xx, or set-cookie responses", async () => {
		const mock = withMockCache();
		restore = mock.restore;

		const postLoader = vi.fn(async () => new Response("post", { status: 200 }));
		await respondWithCache(new Request("https://x.test", { method: "POST" }), 60, postLoader);
		expect(postLoader).toHaveBeenCalledTimes(1);
		expect(mock.api.put).toHaveBeenCalledTimes(0);

		const badLoader = vi.fn(async () => new Response("fail", { status: 500 }));
		await respondWithCache(new Request("https://x.test/a"), 60, badLoader);
		expect(badLoader).toHaveBeenCalledTimes(1);
		expect(mock.api.put).toHaveBeenCalledTimes(0);

		const cookieLoader = vi.fn(
			async () =>
				new Response("cookie", {
					status: 200,
					headers: { "set-cookie": "a=b" },
				}),
		);
		await respondWithCache(new Request("https://x.test/b"), 60, cookieLoader);
		expect(cookieLoader).toHaveBeenCalledTimes(1);
		expect(mock.api.put).toHaveBeenCalledTimes(0);
	});
});
