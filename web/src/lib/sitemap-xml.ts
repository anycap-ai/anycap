import "server-only";

type SitemapUrlEntry = {
  url: string;
  lastModified?: Date;
};

type SitemapIndexEntry = {
  url: string;
  lastModified?: Date;
};

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function formatLastModified(value?: Date): string | null {
  if (!value) {
    return null;
  }

  return value.toISOString();
}

function renderLastModifiedTag(value?: Date): string {
  const lastModified = formatLastModified(value);
  return lastModified ? `\n    <lastmod>${escapeXml(lastModified)}</lastmod>` : "";
}

export function renderSitemapUrlSetXml(entries: SitemapUrlEntry[]): string {
  const body = entries
    .map(
      (entry) =>
        `  <url>\n    <loc>${escapeXml(entry.url)}</loc>${renderLastModifiedTag(entry.lastModified)}\n  </url>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

export function renderSitemapIndexXml(entries: SitemapIndexEntry[]): string {
  const body = entries
    .map(
      (entry) =>
        `  <sitemap>\n    <loc>${escapeXml(entry.url)}</loc>${renderLastModifiedTag(entry.lastModified)}\n  </sitemap>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</sitemapindex>\n`;
}
