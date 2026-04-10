import { NextResponse } from "next/server";
import { getAllSeoIndexedLocales, type SiteLocale } from "@/lib/site";
import { getLocaleSitemapRoutes } from "@/lib/sitemap-routes";
import { renderSitemapUrlSetXml } from "@/lib/sitemap-xml";

export const runtime = "edge";

const XML_HEADERS = {
  "Content-Type": "application/xml; charset=utf-8",
  "Cache-Control": "public, max-age=0, must-revalidate",
} as const;

function parseLocaleFromSlug(slug: string): SiteLocale | null {
  if (!slug.endsWith(".xml")) {
    return null;
  }

  const locale = slug.slice(0, -4);
  const indexed = getAllSeoIndexedLocales();
  return indexed.includes(locale as SiteLocale) ? (locale as SiteLocale) : null;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const locale = parseLocaleFromSlug(slug);

    if (!locale) {
      return new NextResponse("Not Found", {
        status: 404,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    const routes = getLocaleSitemapRoutes(locale);
    const content = renderSitemapUrlSetXml(routes);

    return new NextResponse(content, { headers: XML_HEADERS });
  } catch (error) {
    console.error("Failed to generate locale sitemap", error);
    return new NextResponse("Failed to generate sitemap", {
      status: 500,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}
