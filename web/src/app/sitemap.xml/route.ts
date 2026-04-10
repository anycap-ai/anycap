import { NextResponse } from "next/server";
import { getSitemapIndexEntries } from "@/lib/sitemap-routes";
import { renderSitemapIndexXml } from "@/lib/sitemap-xml";

export const runtime = "edge";

const XML_HEADERS = {
  "Content-Type": "application/xml; charset=utf-8",
  "Cache-Control": "public, max-age=0, must-revalidate",
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
