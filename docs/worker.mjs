const catalogCapabilities = new Set(['image', 'video', 'music', 'audio']);
const catalogPath = /^\/api\/model-catalog\/([a-z-]+)\/?$/;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const match = catalogPath.exec(url.pathname);

    if (request.method === 'GET' && match && catalogCapabilities.has(match[1])) {
      const capability = match[1];
      const upstream = await fetch(`https://api.anycap.ai/v1/${capability}/models`, {
        headers: { Accept: 'application/json' },
      });
      const headers = new Headers(upstream.headers);

      headers.set('Cache-Control', 'public, max-age=300, s-maxage=300, stale-while-revalidate=600');
      headers.set('Content-Type', 'application/json; charset=utf-8');
      headers.delete('Set-Cookie');

      return new Response(upstream.body, { status: upstream.status, headers });
    }

    return env.ASSETS.fetch(request);
  },
};
