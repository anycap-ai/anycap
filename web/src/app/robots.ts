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

  const explicitAiCrawlerRules = [
    "GPTBot",
    "OAI-SearchBot",
    "ChatGPT-User",
    "ClaudeBot",
    "PerplexityBot",
  ].map((userAgent) => ({
    userAgent,
    allow: "/",
    disallow: [...blockedSiteRoutes],
  }));

  return {
    rules: [
      ...explicitAiCrawlerRules,
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
