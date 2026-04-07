import type { MetadataRoute } from "next";
import { getLocalizedSitemapRoutes } from "@/lib/sitemap-routes";

export const runtime = "nodejs";

export default function sitemap(): MetadataRoute.Sitemap {
  try {
    const localizedRoutes = getLocalizedSitemapRoutes();

    return localizedRoutes.map((route) => ({
      url: route.url,
      lastModified: route.lastModified,
    }));
  } catch (error) {
    console.error("Failed to generate sitemap", error);
    return [];
  }
}
