import "server-only";

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import {
  getLocalizedRouteUrl,
  publicRouteDefinitions,
  supportedLocales,
} from "@/lib/site";

const PAGE_FILE_NAME = "page.tsx";
const APP_DIRECTORY = path.join(process.cwd(), "src", "app");
const SEO_DIRECTORY = path.join(APP_DIRECTORY, "(seo)");
const LOCALIZED_APP_DIRECTORY = path.join(APP_DIRECTORY, "[locale]");
const LOCALIZED_SEO_DIRECTORY = path.join(LOCALIZED_APP_DIRECTORY, "(seo)");
const SITEMAP_LASTMOD_MANIFEST_PATH = path.join(
  process.cwd(),
  "src",
  "generated",
  "sitemap-lastmod.json",
);
const EXPLICIT_LOCALIZED_PAGE_FILES = [
  path.join(LOCALIZED_APP_DIRECTORY, PAGE_FILE_NAME),
  path.join(LOCALIZED_APP_DIRECTORY, "agent", PAGE_FILE_NAME),
] as const;
const ROUTE_GROUP_SEGMENT_PATTERN = /^\(.*\)$/;
const DYNAMIC_SEGMENT_PATTERN = /^\[.*\]$/;
const DEFAULT_SITEMAP_PRIORITY = 0.6;

const priorityByKnownPath = new Map<string, number>(
  publicRouteDefinitions.map((route) => [route.path, route.priority]),
);

const exactFallbackPriorities = new Map<string, number>([
  ["/", 1],
  ["/agent", 0.6],
  ["/start", 0.96],
  ["/about", 0.72],
  ["/cli", 0.78],
  ["/skills", 0.72],
  ["/capabilities", 0.8],
  ["/models", 0.72],
]);

const prefixFallbackPriorities = [
  { prefix: "/learn/", priority: 0.84 },
  { prefix: "/for/", priority: 0.8 },
  { prefix: "/guides/", priority: 0.7 },
  { prefix: "/capabilities/", priority: 0.74 },
  { prefix: "/compare/", priority: 0.65 },
  { prefix: "/models/", priority: 0.65 },
  { prefix: "/glossary/", priority: 0.55 },
] as const;

type SitemapSourceRoute = {
  path: string;
  priority: number;
  lastModified: Date;
};

type RouteFileRecord = {
  filePath: string;
  routeBaseDirectory: string;
  lastModified: Date;
};

type SitemapLastmodManifest = Record<string, string>;

let sitemapLastmodManifest: SitemapLastmodManifest | null | undefined;

function getSitemapLastmodManifest(): SitemapLastmodManifest | null {
  if (sitemapLastmodManifest !== undefined) {
    return sitemapLastmodManifest;
  }

  if (!existsSync(SITEMAP_LASTMOD_MANIFEST_PATH)) {
    sitemapLastmodManifest = null;
    return sitemapLastmodManifest;
  }

  try {
    sitemapLastmodManifest = JSON.parse(
      readFileSync(SITEMAP_LASTMOD_MANIFEST_PATH, "utf8"),
    ) as SitemapLastmodManifest;
  } catch (error) {
    console.warn("Failed to load sitemap lastmod manifest", error);
    sitemapLastmodManifest = null;
  }

  return sitemapLastmodManifest;
}

function getFileLastModified(filePath: string): Date {
  const manifestKey = path.relative(process.cwd(), filePath);
  const storedLastModified = getSitemapLastmodManifest()?.[manifestKey];

  if (storedLastModified) {
    const parsedDate = new Date(storedLastModified);
    if (!Number.isNaN(parsedDate.getTime())) {
      return parsedDate;
    }
  }

  return statSync(filePath).mtime;
}

function walkPageFiles(dir: string, routeBaseDirectory: string): RouteFileRecord[] {
  if (!existsSync(dir)) {
    return [];
  }

  const entries = readdirSync(dir, { withFileTypes: true }).sort((left, right) =>
    left.name.localeCompare(right.name),
  );
  const files: RouteFileRecord[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...walkPageFiles(fullPath, routeBaseDirectory));
      continue;
    }

    if (entry.isFile() && entry.name === PAGE_FILE_NAME) {
      files.push({
        filePath: fullPath,
        routeBaseDirectory,
        lastModified: getFileLastModified(fullPath),
      });
    }
  }

  return files;
}

function toDiscoveredRoutePath(routeFile: RouteFileRecord): string | null {
  const relativePath = path.relative(routeFile.routeBaseDirectory, routeFile.filePath);
  const segments = relativePath
    .split(path.sep)
    .slice(0, -1)
    .filter(Boolean)
    .filter((segment) => !ROUTE_GROUP_SEGMENT_PATTERN.test(segment));

  if (segments.some((segment) => DYNAMIC_SEGMENT_PATTERN.test(segment))) {
    return null;
  }

  if (segments.length === 0) {
    return "/";
  }

  return `/${segments.join("/")}`;
}

function resolveSitemapPriority(routePath: string): number {
  const knownPriority = priorityByKnownPath.get(routePath);
  if (knownPriority !== undefined) {
    return knownPriority;
  }

  const exactFallbackPriority = exactFallbackPriorities.get(routePath);
  if (exactFallbackPriority !== undefined) {
    return exactFallbackPriority;
  }

  const prefixFallbackPriority = prefixFallbackPriorities.find(({ prefix }) =>
    routePath.startsWith(prefix),
  );

  return prefixFallbackPriority?.priority ?? DEFAULT_SITEMAP_PRIORITY;
}

function getDiscoveredRouteFiles(): RouteFileRecord[] {
  const explicitFiles = EXPLICIT_LOCALIZED_PAGE_FILES.filter((filePath) =>
    existsSync(filePath),
  ).map((filePath) => ({
    filePath,
    routeBaseDirectory: LOCALIZED_APP_DIRECTORY,
    lastModified: getFileLastModified(filePath),
  }));

  return [
    ...explicitFiles,
    ...walkPageFiles(SEO_DIRECTORY, APP_DIRECTORY),
    ...walkPageFiles(LOCALIZED_SEO_DIRECTORY, LOCALIZED_APP_DIRECTORY),
  ];
}

function compareDates(left: Date, right: Date) {
  return left.getTime() - right.getTime();
}

function getSitemapSourceRoutes(): SitemapSourceRoute[] {
  const routesByPath = new Map<string, SitemapSourceRoute>();

  for (const routeFile of getDiscoveredRouteFiles()) {
    const routePath = toDiscoveredRoutePath(routeFile);
    if (!routePath) {
      continue;
    }

    const nextRoute: SitemapSourceRoute = {
      path: routePath,
      priority: resolveSitemapPriority(routePath),
      lastModified: routeFile.lastModified,
    };

    const existingRoute = routesByPath.get(routePath);
    if (!existingRoute || compareDates(existingRoute.lastModified, nextRoute.lastModified) < 0) {
      routesByPath.set(routePath, nextRoute);
    }
  }

  return [...routesByPath.values()].sort(
    (left, right) => right.priority - left.priority || left.path.localeCompare(right.path),
  );
}

export function getLocalizedSitemapRoutes() {
  const sourceRoutes = getSitemapSourceRoutes();

  return supportedLocales.flatMap((locale) =>
    sourceRoutes.map((route) => ({
      url: getLocalizedRouteUrl(locale, route.path),
      lastModified: route.lastModified,
      priority: route.priority,
    })),
  );
}
