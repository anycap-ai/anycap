import type { MetadataRoute } from "next";
import { defaultLocale, getLocalizedPublicRoutes } from "@/lib/site";
import { shouldAllowIndexing } from "@/lib/seo-metadata";

export default function sitemap(): MetadataRoute.Sitemap {
  if (!shouldAllowIndexing()) {
    return [];
  }

  try {
    const lastModified = new Date();
    const localizedRoutes = getLocalizedPublicRoutes(defaultLocale);

    return localizedRoutes.map((route) => ({
      url: route.url,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: route.priority,
    }));
  } catch (error) {
    console.error("Failed to generate sitemap", error);
    return [];
  }
}
