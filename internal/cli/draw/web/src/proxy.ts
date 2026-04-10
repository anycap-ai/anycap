/**
 * Resolve a relative path to a full HTTP URL,
 * preserving any proxy query params (e.g. sandbox token).
 *
 * When the draw page is served behind a path-prefix proxy
 * (e.g., /api/v1/sandbox/.../proxy/?token=...), root-relative paths like
 * "/submit" resolve to the proxy host's root, bypassing the proxy.
 * This helper resolves paths relative to the current page URL and preserves
 * query parameters (which may contain proxy auth tokens).
 *
 *   resolveUrl('submit') on https://host/prefix/proxy/?token=abc
 *   => https://host/prefix/proxy/submit?token=abc
 */
export function resolveUrl(path: string): string {
  const rel = path.startsWith('/') ? '.' + path : path;
  const url = new URL(rel, location.href);
  // Preserve the original query string (may contain proxy auth token).
  if (location.search) {
    const existing = new URLSearchParams(location.search);
    existing.forEach((v, k) => {
      if (!url.searchParams.has(k)) url.searchParams.set(k, v);
    });
  }
  return url.toString();
}
