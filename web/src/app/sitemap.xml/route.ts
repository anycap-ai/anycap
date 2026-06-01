import { NextResponse } from "next/server";
import { getSitemapIndexEntries } from "@/lib/sitemap-routes";
import { renderSitemapIndexXml } from "@/lib/sitemap-xml";

export const runtime = "edge";

const XML_HEADERS = {
  "Content-Type": "application/xml; charset=utf-8",
  // Browser revalidates on every request; CF Edge holds the rendered XML for 24h
  // and serves it stale for up to 7d while revalidating. Sitemap content only
  // changes at build time (generate-sitemap-lastmod runs in CI).
  "Cache-Control": "public, max-age=0, must-revalidate",
  "CDN-Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
  "Cloudflare-CDN-Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
} as const;

export async function GET() {
  try {
    const entries = getSitemapIndexEntries();
    const content = renderSitemapIndexXml(entries);

    return new NextResponse(content, {
      headers: XML_HEADERS,
    });
  } catch (error) {
    console.error("Failed to generate sitemap", error);
    return new NextResponse("Failed to generate sitemap", {
      status: 500,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  }
}
