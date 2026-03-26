import type { MetadataRoute } from "next";
import { publicSiteRoutes, siteConfig } from "@/lib/site";

const routePriority: Record<(typeof publicSiteRoutes)[number], number> = {
  "/": 1,
  "/for-human": 0.8,
};

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return publicSiteRoutes.map((route) => ({
    url: `${siteConfig.url}${route === "/" ? "" : route}`,
    lastModified,
    changeFrequency: "weekly",
    priority: routePriority[route],
  }));
}
