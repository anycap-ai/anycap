import type { MetadataRoute } from "next";
import { blockedSiteRoutes, siteConfig } from "@/lib/site";
import { shouldAllowIndexing } from "@/lib/seo-metadata";

export default function robots(): MetadataRoute.Robots {
  if (!shouldAllowIndexing()) {
    return {
      rules: [
        {
          userAgent: "*",
          disallow: "/",
        },
      ],
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [...blockedSiteRoutes],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
