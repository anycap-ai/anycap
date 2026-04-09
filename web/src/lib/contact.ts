export const contactEmail = "admin@anycap.ai";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function buildMailtoHref(
  email: string = contactEmail,
  options?: { subject?: string }
) {
  const params = new URLSearchParams();

  if (options?.subject) {
    params.set("subject", options.subject);
  }

  const query = params.toString();
  return query ? `mailto:${email}?${query}` : `mailto:${email}`;
}

export function buildProtectedEmailHtml(email: string = contactEmail) {
  return `<!--email_off-->${escapeHtml(email)}<!--/email_off-->`;
}
