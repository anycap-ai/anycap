import type { Metadata } from "next";
import {
  buildLocalizedPath,
  defaultLocale,
  getLocaleConfig,
  getLocalizedAlternates,
  isSeoIndexablePathForLocale,
  getPublicRouteByKey,
  normalizePublicPath,
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

function hasValues<T>(value: T | T[] | null | undefined): value is T | T[] {
  return Array.isArray(value) ? value.length > 0 : Boolean(value);
}

function resolveStringTitle(title: Metadata["title"]): string | undefined {
  return typeof title === "string" ? title : undefined;
}

export function createLocalizedMetadataForPath(
  locale: SiteLocale,
  pathname: string,
  baseMetadata: Metadata
): Metadata {
  const normalizedPath = normalizePublicPath(pathname);
  const isIndexablePathForLocale = isSeoIndexablePathForLocale(normalizedPath, locale);
  const canonicalLocale = isIndexablePathForLocale ? locale : defaultLocale;
  const localizedPath = buildLocalizedPath(locale, normalizedPath);
  const canonicalPath = buildLocalizedPath(canonicalLocale, normalizedPath);
  const localeDetails = getLocaleConfig(locale);
  const openGraph = cloneOpenGraph(baseMetadata.openGraph);
  const twitter = cloneTwitterCard(baseMetadata.twitter);
  const { languages: _baseLanguages, ...baseAlternates } =
    baseMetadata.alternates ?? {};
  const twitterTitle =
    twitter && typeof twitter === "object" && "title" in twitter ? twitter.title ?? undefined : undefined;
  const twitterDescription =
    twitter && typeof twitter === "object" && "description" in twitter
      ? twitter.description ?? undefined
      : undefined;
  const twitterImages =
    twitter && typeof twitter === "object" && "images" in twitter ? twitter.images : undefined;
  const twitterCard =
    twitter && typeof twitter === "object" && "card" in twitter ? twitter.card ?? undefined : undefined;
  const socialTitle = openGraph?.title ?? twitterTitle ?? resolveStringTitle(baseMetadata.title);
  const socialDescription =
    openGraph?.description ??
    twitterDescription ??
    baseMetadata.description ??
    siteConfig.defaultDescription;
  const languageAlternates = isIndexablePathForLocale
    ? {
        ...(baseMetadata.alternates?.languages ?? {}),
        ...getLocalizedAlternates(normalizedPath),
      }
    : undefined;

  return {
    ...baseMetadata,
    metadataBase: new URL(siteConfig.url),
    alternates: {
      ...baseAlternates,
      canonical: canonicalPath,
      ...(languageAlternates ? { languages: languageAlternates } : {}),
    },
    openGraph: openGraph
      ? {
          ...openGraph,
          locale: localeDetails.ogLocale,
          url: canonicalPath,
          siteName: openGraph.siteName ?? siteConfig.siteName,
          title: openGraph.title ?? socialTitle,
          description: openGraph.description ?? socialDescription,
          images: hasValues(openGraph.images) ? openGraph.images : [defaultSocialImage],
        }
      : undefined,
    twitter: {
      ...twitter,
      card: twitterCard ?? "summary_large_image",
      title: twitterTitle ?? socialTitle,
      description: twitterDescription ?? socialDescription,
      images: hasValues(twitterImages) ? twitterImages : [defaultSocialImage.url],
    } as Metadata["twitter"],
    robots: createRobotsMetadata({
      allowIndexing: isIndexablePathForLocale,
    }),
  };
}

export function createLocalizedMetadata(
  locale: SiteLocale,
  routeKey: PublicRouteKey,
  baseMetadata: Metadata
): Metadata {
  const route = getPublicRouteByKey(routeKey);
  return createLocalizedMetadataForPath(locale, route.path, baseMetadata);
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
