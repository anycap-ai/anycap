export async function respondWithCache(
	request: Request,
	ttlSeconds: number,
	loader: () => Promise<Response>,
	ctx?: ExecutionContext,
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
	const tc1 = Date.now();
	const cached = await defaultCache.match(request);
	console.log(`[cache] match: ${Date.now() - tc1}ms, hit=${!!cached}`);
	if (cached) {
		return cached;
	}

	const tc2 = Date.now();
	const response = await loader();
	console.log(`[cache] loader: ${Date.now() - tc2}ms`);
	if (response.status >= 200 && response.status < 300 && !response.headers.get("set-cookie")) {
		const cacheable = new Response(response.body, response);
		cacheable.headers.set("cache-control", `public, max-age=${ttlSeconds}`);
		const tc3 = Date.now();
		const cacheWrite = defaultCache.put(request, cacheable.clone());
		if (ctx) {
			ctx.waitUntil(cacheWrite);
		} else {
			await cacheWrite;
			console.log(`[cache] put (blocking): ${Date.now() - tc3}ms`);
		}
		return cacheable;
	}
	return response;
}
