export function buildLogoutURL(pathname = "/for-human"): string {
  if (typeof window === "undefined") {
    return `/api/auth/logout?returnTo=${encodeURIComponent(pathname)}`;
  }

  const returnTo = new URL(pathname, window.location.origin).toString();
  return `/api/auth/logout?returnTo=${encodeURIComponent(returnTo)}`;
}
