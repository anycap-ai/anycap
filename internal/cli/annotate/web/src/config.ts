// Template variables injected by Go backend via <script> block in index.html.
// They are set as global vars before this module loads.

declare global {
  interface Window {
    CSRF_TOKEN: string;
    MEDIA_TYPE: string;
    TARGET_URL: string;
    SESSION_ID: string;
    AUTO_CLOSE: boolean;
  }
  var CSRF_TOKEN: string;
  var MEDIA_TYPE: string;
  var TARGET_URL: string;
  var SESSION_ID: string;
  var AUTO_CLOSE: boolean;
}

export const csrfToken = (): string => CSRF_TOKEN;
export const mediaType = (): string => MEDIA_TYPE;
export const targetUrl = (): string => TARGET_URL;
export const sessionId = (): string => SESSION_ID;
export const autoClose = (): boolean => AUTO_CLOSE;

// --- URL resolution for proxy compatibility ---
// When the annotate page is served behind a path-prefix proxy
// (e.g., /api/v1/sandbox/.../proxy/?token=...), root-relative paths like
// "/image" resolve to the proxy host's root, bypassing the proxy.
// These helpers resolve paths relative to the current page URL and preserve
// query parameters (which may contain proxy auth tokens).

/**
 * Resolve an internal server path relative to the page URL.
 * Preserves query string from the page (e.g., ?token=...).
 *   resolveUrl('/image') on https://host/prefix/proxy/?token=abc
 *   => https://host/prefix/proxy/image?token=abc
 */
export function resolveUrl(path: string): string {
  const rel = path.startsWith('/') ? '.' + path : path;
  const url = new URL(rel, location.href);
  // Preserve the original query string (may contain proxy auth token).
  if (location.search) {
    url.search = location.search;
  }
  return url.toString();
}

/**
 * Resolve an internal WebSocket path relative to the page URL.
 * Converts http(s) to ws(s) and preserves query params.
 */
export function resolveWsUrl(path: string): string {
  const rel = path.startsWith('/') ? '.' + path : path;
  const url = new URL(rel, location.href);
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  if (location.search) {
    url.search = location.search;
  }
  return url.toString();
}
