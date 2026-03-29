export async function respondWithCache(
	request: Request,
	ttlSeconds: number,
	loader: () => Promise<Response>,
): Promise<Response> {
	if (request.method !== "GET" || ttlSeconds <= 0) {
		return loader();
	}
	if (typeof caches === "undefined") {
		return loader();
	}

	const defaultCache = (caches as unknown as { default: Cache }).default;
	if (!defaultCache) {
		return loader();
	}
	const cached = await defaultCache.match(request);
	if (cached) {
		return cached;
	}

	const response = await loader();
	if (response.status >= 200 && response.status < 300 && !response.headers.get("set-cookie")) {
		const cacheable = new Response(response.body, response);
		cacheable.headers.set("cache-control", `public, max-age=${ttlSeconds}`);
		await defaultCache.put(request, cacheable.clone());
		return cacheable;
	}
	return response;
}
