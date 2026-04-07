import type { Metadata } from "next";
import {
  buildLocalizedPath,
  getLocaleConfig,
  getLocalizedAlternates,
  getPublicRouteByKey,
  siteConfig,
  type PublicRouteKey,
  type SiteLocale,
} from "@/lib/site";
import { createRobotsMetadata, defaultSocialImage } from "@/lib/seo-metadata";

function cloneOpenGraph(openGraph: Metadata["openGraph"]): Metadata["openGraph"] {
  if (!openGraph) {
    return undefined;
  }

  return {
    ...openGraph,
  };
}

function cloneTwitterCard(twitter: Metadata["twitter"]): Metadata["twitter"] {
  if (!twitter) {
    return undefined;
  }

  return {
    ...twitter,
  };
}

export function createLocalizedMetadata(
  locale: SiteLocale,
  routeKey: PublicRouteKey,
  baseMetadata: Metadata
): Metadata {
  const route = getPublicRouteByKey(routeKey);
  const localizedPath = buildLocalizedPath(locale, route.path);
  const localeDetails = getLocaleConfig(locale);
  const openGraph = cloneOpenGraph(baseMetadata.openGraph);
  const languageAlternates = {
    ...(baseMetadata.alternates?.languages ?? {}),
    ...getLocalizedAlternates(route.path),
  };

  return {
    ...baseMetadata,
    metadataBase: new URL(siteConfig.url),
    alternates: {
      ...baseMetadata.alternates,
      canonical: localizedPath,
      languages: languageAlternates,
    },
    openGraph: openGraph
      ? {
          ...openGraph,
          locale: localeDetails.ogLocale,
          url: localizedPath,
          siteName: openGraph.siteName ?? siteConfig.siteName,
        }
      : undefined,
    twitter: cloneTwitterCard(baseMetadata.twitter),
    robots: baseMetadata.robots ?? createRobotsMetadata(),
  };
}

export function createRootMetadata(locale: SiteLocale): Metadata {
  return createLocalizedMetadata(locale, "home", {
    title: {
      default: siteConfig.defaultTitle,
      template: "%s",
    },
    description: siteConfig.defaultDescription,
    openGraph: {
      type: "website",
      locale: getLocaleConfig(locale).ogLocale,
      url: buildLocalizedPath(locale, "/"),
      siteName: siteConfig.siteName,
      title: siteConfig.defaultTitle,
      description: siteConfig.defaultDescription,
      images: [defaultSocialImage],
    },
    twitter: {
      card: "summary_large_image",
      title: siteConfig.defaultTitle,
      description: siteConfig.defaultDescription,
      images: [defaultSocialImage.url],
    },
    robots: createRobotsMetadata(),
  });
}

export function createAgentMetadata(locale: SiteLocale): Metadata {
  return createLocalizedMetadata(locale, "agent", {
    title: siteConfig.agentTitle,
    description: siteConfig.agentDescription,
    openGraph: {
      type: "website",
      locale: getLocaleConfig(locale).ogLocale,
      url: buildLocalizedPath(locale, "/agent"),
      siteName: siteConfig.siteName,
      title: siteConfig.agentTitle,
      description: siteConfig.agentDescription,
      images: [defaultSocialImage],
    },
    twitter: {
      card: "summary_large_image",
      title: siteConfig.agentTitle,
      description: siteConfig.agentDescription,
      images: [defaultSocialImage.url],
    },
  });
}
