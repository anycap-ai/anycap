// Template variables injected by Go backend via <script> block in index.html.
// They are set as global vars before this module loads.

declare global {
  interface Window {
    CSRF_TOKEN: string;
    MEDIA_TYPE: string;
    TARGET_URL: string;
    SESSION_ID: string;
  }
  var CSRF_TOKEN: string;
  var MEDIA_TYPE: string;
  var TARGET_URL: string;
  var SESSION_ID: string;
}

export const csrfToken = (): string => CSRF_TOKEN;
export const mediaType = (): string => MEDIA_TYPE;
export const targetUrl = (): string => TARGET_URL;
export const sessionId = (): string => SESSION_ID;
