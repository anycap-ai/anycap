export function buildLogoutURL(pathname = "/"): string {
  if (typeof window === "undefined") {
    return `/api/auth/logout?returnTo=${encodeURIComponent(pathname)}`;
  }

  const returnTo = new URL(pathname, window.location.origin).toString();
  return `/api/auth/logout?returnTo=${encodeURIComponent(returnTo)}`;
}
