import "server-only";

import sitemapLastmodManifest from "@/generated/sitemap-lastmod.json";
import {
  getAllSeoIndexedLocales,
  getLocalizedRouteUrl,
  isSeoIndexedPathForLocale,
  publicRouteDefinitions,
  siteConfig,
  type SiteLocale,
} from "@/lib/site";

type SitemapLastmodManifest = Record<string, string>;

type SitemapSourceRoute = {
  path: string;
  priority: number;
  lastModified: Date;
};

export type LocalizedSitemapRoute = SitemapSourceRoute & {
  url: string;
  locale: SiteLocale;
};

export type SitemapIndexEntry = {
  url: string;
  lastModified: Date;
  locale: SiteLocale;
};

const lastmodManifest = sitemapLastmodManifest as SitemapLastmodManifest;

function compareDates(left: Date, right: Date) {
  return left.getTime() - right.getTime();
}

function parseLastModified(value?: string): Date | null {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getRouteManifestPaths(routePath: string): string[] {
  if (routePath === "/") {
    return [
      "src/app/page.tsx",
      "src/app/[locale]/page.tsx",
    ];
  }

  if (routePath === "/agent") {
    return [
      "src/app/agent/page.tsx",
      "src/app/[locale]/agent/page.tsx",
    ];
  }

  return [
    `src/app/(seo)${routePath}/page.tsx`,
    `src/app/[locale]/(seo)${routePath}/page.tsx`,
  ];
}

function getRouteLastModified(routePath: string): Date {
  const dates = getRouteManifestPaths(routePath)
    .map((manifestPath) => parseLastModified(lastmodManifest[manifestPath]))
    .filter((value): value is Date => value instanceof Date);

  if (dates.length === 0) {
    return new Date();
  }

  return dates.reduce((latest, current) =>
    compareDates(latest, current) < 0 ? current : latest,
  );
}

function getSitemapSourceRoutes(): SitemapSourceRoute[] {
  return [...publicRouteDefinitions]
    .map((route) => ({
      path: route.path,
      priority: route.priority,
      lastModified: getRouteLastModified(route.path),
    }))
    .sort(
      (left, right) =>
        right.priority - left.priority || left.path.localeCompare(right.path),
    );
}

function getSitemapCollectionLastModified(routes: SitemapSourceRoute[]): Date {
  if (routes.length === 0) {
    return new Date();
  }

  return routes.slice(1).reduce(
    (latest, route) =>
      compareDates(latest, route.lastModified) < 0 ? route.lastModified : latest,
    routes[0].lastModified,
  );
}

export function getLocaleSitemapPath(locale: SiteLocale): string {
  return `/sitemap/${locale}.xml`;
}

export function getLocaleSitemapRoutes(locale: SiteLocale): LocalizedSitemapRoute[] {
  return getSitemapSourceRoutes()
    .filter((route) => isSeoIndexedPathForLocale(route.path, locale))
    .map((route) => ({
      ...route,
      locale,
      url: getLocalizedRouteUrl(locale, route.path),
    }));
}

export function getSitemapIndexEntries(): SitemapIndexEntry[] {
  return getAllSeoIndexedLocales()
    .map((locale) => {
      const routes = getLocaleSitemapRoutes(locale);

      if (routes.length === 0) {
        return null;
      }

      return {
        locale,
        lastModified: getSitemapCollectionLastModified(routes),
        url: `${siteConfig.url}${getLocaleSitemapPath(locale)}`,
      };
    })
    .filter((entry): entry is SitemapIndexEntry => entry !== null);
}
