import seoRouteManifest from "@/generated/seo-route-manifest.json";
import {
  defaultSeoIndexedLocaleCodes,
  seoIndexedLocaleCodesByRouteKey,
} from "@/lib/seo-locale-rollout";
import { isNoIndexSeoPath } from "@/lib/seo/noindex-paths";
import { manualSeoRouteDefinitions } from "@/lib/seo/routes";

const ROOT_PATH = "/";
const LOCALE_HEADER = "x-anycap-locale";
const REQUEST_PATHNAME_HEADER = "x-anycap-pathname";
const DEFAULT_LOCALE = "en";

export const supportedLocales = [DEFAULT_LOCALE, "pt-br", "id", "de"] as const;

export type SiteLocale = (typeof supportedLocales)[number];

export const defaultLocale: SiteLocale = DEFAULT_LOCALE;
export const localeHeaderName = LOCALE_HEADER;
export const requestPathnameHeaderName = REQUEST_PATHNAME_HEADER;

function isConfiguredSeoLocale(value: string): value is SiteLocale {
  return supportedLocales.includes(value as SiteLocale);
}

function normalizeSeoIndexedLocaleCodes(
  localeCodes: readonly string[],
  configLabel: string,
): readonly SiteLocale[] {
  const invalidLocaleCodes = localeCodes.filter(
    (localeCode) => !isConfiguredSeoLocale(localeCode),
  );

  if (invalidLocaleCodes.length > 0) {
    throw new Error(
      `${configLabel} includes unsupported locales: ${invalidLocaleCodes.join(", ")}`,
    );
  }

  const uniqueLocales = [...new Set(localeCodes)] as SiteLocale[];

  if (uniqueLocales.length === 0) {
    return [defaultLocale];
  }

  if (uniqueLocales.includes(defaultLocale)) {
    return uniqueLocales;
  }

  return [defaultLocale, ...uniqueLocales];
}

/**
 * Default locales exposed in sitemap/hreflang for routes that do not define an
 * explicit override in `seo-locale-rollout.ts`.
 */
const defaultSeoIndexedLocales: readonly SiteLocale[] =
  normalizeSeoIndexedLocaleCodes(
    defaultSeoIndexedLocaleCodes,
    "default SEO locale rollout",
  );

export const localeConfig = {
  en: {
    htmlLang: "en",
    ogLocale: "en_US",
    label: "English",
  },
  "pt-br": {
    htmlLang: "pt-BR",
    ogLocale: "pt_BR",
    label: "Português (Brasil)",
  },
  id: {
    htmlLang: "id",
    ogLocale: "id_ID",
    label: "Bahasa Indonesia",
  },
  de: {
    htmlLang: "de",
    ogLocale: "de_DE",
    label: "Deutsch",
  },
} as const satisfies Record<
  SiteLocale,
  {
    htmlLang: string;
    ogLocale: string;
    label: string;
  }
>;

export const capabilitySummary =
  "media generation, media understanding, web retrieval, cloud storage, and static page publishing";

export const publicCapabilityLabel = "AI agent capabilities";

export const publicCapabilitySummary =
  "image, video, audio, web, storage, and publishing workflows";

export const adjacentWorkflowSummary =
  "drive storage, page publishing, and other delivery workflows";

export const roadmapCapabilitySummary = "speech, sandbox, and browser automation";

export const defaultSiteDescription =
  "AnyCap gives agent users one install path, one auth flow, and one CLI for image generation, video generation, vision, search, storage, and publishing workflows.";

export const defaultSocialImageAlt =
  "AnyCap adds image, video, vision, search, storage, and publishing capabilities to AI agents.";

export const siteConfig = {
  name: "AnyCap",
  siteName: "AnyCap",
  url: "https://anycap.ai",
  locale: localeConfig[defaultLocale].ogLocale,
  defaultLocale,
  supportedLocales,
  defaultTitle: "AnyCap | AI Agent Capabilities Through One CLI",
  defaultDescription: defaultSiteDescription,
  agentTitle: "AnyCap for Agents — AI Agent Capabilities Through One CLI",
  agentDescription:
    `Agent entry for AnyCap. Install once, authenticate once, and access ${publicCapabilitySummary} through one command surface.`,
} as const;

export type PublicRouteKind = "home" | "agent" | "seo";

type BasePublicRouteDefinition = {
  key: string;
  kind: PublicRouteKind;
  path: string;
  priority: number;
};

export type PublicRouteDefinition = BasePublicRouteDefinition;
export type PublicRouteKey = PublicRouteDefinition["key"];
export type SeoRouteDefinition = PublicRouteDefinition & { kind: "seo" };
export type SeoRouteKey = SeoRouteDefinition["key"];

type SeoRouteManifest = {
  routes?: string[];
};

function normalizeSitePath(pathname: string): string {
  if (!pathname || pathname === ROOT_PATH) {
    return ROOT_PATH;
  }

  return pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}

function deriveSeoRouteKey(pathname: string): string {
  const normalizedPath = normalizeSitePath(pathname);
  if (normalizedPath === ROOT_PATH) {
    return "home";
  }

  return normalizedPath.slice(1).replaceAll("/", "-");
}

function getGeneratedSeoRoutePriority(pathname: string): number {
  const segmentCount = normalizeSitePath(pathname).split("/").filter(Boolean).length;
  return segmentCount <= 1 ? 0.68 : 0.64;
}

const manualPublicRouteDefinitions = [
  { key: "home", kind: "home", path: ROOT_PATH, priority: 1 },
  { key: "agent", kind: "agent", path: "/agent", priority: 0.6 },
  ...manualSeoRouteDefinitions,
] as const satisfies readonly PublicRouteDefinition[];

export type ManualPublicRouteKey =
  (typeof manualPublicRouteDefinitions)[number]["key"];

const seoRouteManifestEntries = ((seoRouteManifest as SeoRouteManifest).routes ?? [])
  .map((routePath) => normalizeSitePath(routePath))
  .filter((routePath) => routePath !== ROOT_PATH && routePath !== "/agent");

const manualPublicRoutePaths = new Set<string>(
  manualPublicRouteDefinitions.map((route) => route.path)
);

const generatedSeoRouteDefinitions: SeoRouteDefinition[] = [
  ...new Set(seoRouteManifestEntries),
]
  .filter((routePath) => !manualPublicRoutePaths.has(routePath))
  .sort((left, right) => left.localeCompare(right))
  .map((routePath) => ({
    key: deriveSeoRouteKey(routePath),
    kind: "seo",
    path: routePath,
    priority: getGeneratedSeoRoutePriority(routePath),
  }));

export const publicRouteDefinitions: readonly PublicRouteDefinition[] = [
  ...manualPublicRouteDefinitions,
  ...generatedSeoRouteDefinitions,
];

export const publicSiteRoutes = publicRouteDefinitions.map((route) => route.path);

export const seoRouteDefinitions = publicRouteDefinitions.filter(
  (route): route is SeoRouteDefinition => route.kind === "seo"
);

export const seoRoutes = seoRouteDefinitions.map(({ path, priority }) => ({
  path,
  priority,
}));

export const blockedSiteRoutes = [
  "/dashboard",
] as const;

const publicRouteByKey = Object.fromEntries(
  publicRouteDefinitions.map((route) => [route.key, route])
) as Record<PublicRouteKey, PublicRouteDefinition>;

const publicRouteByPath = Object.fromEntries(
  publicRouteDefinitions.map((route) => [route.path, route])
) as Record<string, PublicRouteDefinition>;

const seoRouteByPath = Object.fromEntries(
  seoRouteDefinitions.map((route) => [route.path, route])
) as Record<string, SeoRouteDefinition>;

const seoIndexedLocalesByRouteKey = Object.fromEntries(
  Object.entries(seoIndexedLocaleCodesByRouteKey).map(
    ([routeKey, localeCodes]) => {
      if (!Object.prototype.hasOwnProperty.call(publicRouteByKey, routeKey)) {
        throw new Error(
          `SEO locale rollout references unknown route key: ${routeKey}`,
        );
      }

      return [
        routeKey,
        normalizeSeoIndexedLocaleCodes(
          localeCodes,
          `SEO locale rollout for route "${routeKey}"`,
        ),
      ];
    },
  ),
) as Partial<Record<ManualPublicRouteKey, readonly SiteLocale[]>>;

const allSeoIndexedLocales = normalizeSeoIndexedLocaleCodes(
  [
    ...defaultSeoIndexedLocales,
    ...Object.values(seoIndexedLocalesByRouteKey).flat(),
  ],
  "combined SEO locale rollout",
);

export function getLocaleConfig(locale: SiteLocale) {
  return localeConfig[locale];
}

export function isSupportedLocale(value: string): value is SiteLocale {
  return supportedLocales.includes(value as SiteLocale);
}

export function getSeoIndexedLocalesForRouteKey(
  routeKey: PublicRouteKey,
): readonly SiteLocale[] {
  return (
    seoIndexedLocalesByRouteKey[routeKey as ManualPublicRouteKey] ??
    defaultSeoIndexedLocales
  );
}

export function getSeoIndexedLocalesForPath(
  pathname: string,
): readonly SiteLocale[] {
  const route = getPublicRouteByPath(pathname);

  if (!route) {
    return defaultSeoIndexedLocales;
  }

  return getSeoIndexedLocalesForRouteKey(route.key);
}

export function getAllSeoIndexedLocales(): readonly SiteLocale[] {
  return allSeoIndexedLocales;
}

export function isSeoIndexedPathForLocale(
  pathname: string,
  locale: SiteLocale,
): boolean {
  return getSeoIndexedLocalesForPath(pathname).includes(locale);
}

export function isSeoIndexablePathForLocale(
  pathname: string,
  locale: SiteLocale,
): boolean {
  const normalizedPath = normalizePublicPath(pathname);
  return isSeoIndexedPathForLocale(normalizedPath, locale) && !isNoIndexSeoPath(normalizedPath);
}

export function getLocaleFromHeader(value?: string | null): SiteLocale {
  if (value && isSupportedLocale(value)) {
    return value;
  }
  return defaultLocale;
}

export function normalizePublicPath(pathname: string): string {
  return normalizeSitePath(pathname);
}

export function buildLocalizedPath(locale: SiteLocale, pathname: string): string {
  const normalizedPath = normalizePublicPath(pathname);
  // Keep the default locale on the historical unprefixed URLs.
  if (locale === defaultLocale) {
    return normalizedPath;
  }

  if (normalizedPath === ROOT_PATH) {
    return `/${locale}`;
  }
  return `/${locale}${normalizedPath}`;
}

/** In-app link target for the public home page for a given locale. */
export function localizedHomePath(locale: SiteLocale): string {
  return buildLocalizedPath(locale, ROOT_PATH);
}

/** In-app link target for the agent entry page for a given locale. */
export function localizedAgentPath(locale: SiteLocale): string {
  return buildLocalizedPath(locale, "/agent");
}

/**
 * Default-locale home path for client components (no request locale).
 * Keep in sync with `localizedHomePath(defaultLocale)`.
 */
export const defaultPublicHomePath = localizedHomePath(defaultLocale);

/**
 * Default-locale agent entry path for client components (no request locale).
 * Keep in sync with `localizedAgentPath(defaultLocale)`.
 */
export const defaultAgentEntryPath = localizedAgentPath(defaultLocale);

export function hasLocalePrefix(pathname: string): boolean {
  const [, maybeLocale] = normalizePublicPath(pathname).split("/");
  return Boolean(maybeLocale && isSupportedLocale(maybeLocale));
}

export function stripLocalePrefix(pathname: string): {
  locale: SiteLocale | null;
  pathname: string;
} {
  const normalizedPath = normalizePublicPath(pathname);
  if (normalizedPath === ROOT_PATH) {
    return { locale: null, pathname: ROOT_PATH };
  }

  const segments = normalizedPath.split("/").filter(Boolean);
  const [maybeLocale, ...rest] = segments;

  if (!maybeLocale || !isSupportedLocale(maybeLocale)) {
    return { locale: null, pathname: normalizedPath };
  }

  const remainingPath = rest.length === 0 ? ROOT_PATH : `/${rest.join("/")}`;
  return { locale: maybeLocale, pathname: remainingPath };
}

export function getPublicRouteByKey(key: PublicRouteKey): PublicRouteDefinition {
  return publicRouteByKey[key];
}

export function getPublicRouteByPath(pathname: string): PublicRouteDefinition | null {
  return publicRouteByPath[normalizePublicPath(pathname)] ?? null;
}

export function getSeoRouteByPath(pathname: string): SeoRouteDefinition | null {
  return seoRouteByPath[normalizePublicPath(pathname)] ?? null;
}

export function getSeoRouteBySegments(segments: string[]): SeoRouteDefinition | null {
  return getSeoRouteByPath(`/${segments.join("/")}`);
}

export function localizePublicPath(locale: SiteLocale, pathname: string): string {
  if (!pathname.startsWith("/")) {
    return pathname;
  }

  if (hasLocalePrefix(pathname)) {
    return pathname;
  }

  const matchedRoute = getPublicRouteByPath(pathname);
  if (!matchedRoute) {
    return pathname;
  }

  return buildLocalizedPath(locale, matchedRoute.path);
}

export function getLocalizedRouteUrl(locale: SiteLocale, pathname: string): string {
  return `${siteConfig.url}${buildLocalizedPath(locale, pathname)}`;
}

export function getLocalizedPublicRoutes(locale: SiteLocale) {
  return publicRouteDefinitions.map((route) => ({
    ...route,
    localizedPath: buildLocalizedPath(locale, route.path),
    url: getLocalizedRouteUrl(locale, route.path),
  }));
}

export function getAllLocalizedPublicRoutes() {
  return supportedLocales.flatMap((locale) => getLocalizedPublicRoutes(locale));
}

export function getLocalizedAlternates(pathname: string): Record<string, string> {
  const normalizedPath = normalizePublicPath(pathname);
  if (isNoIndexSeoPath(normalizedPath)) {
    return {};
  }

  const alternates = Object.fromEntries(
    getSeoIndexedLocalesForPath(normalizedPath).map((locale) => [
      getLocaleConfig(locale).htmlLang,
      buildLocalizedPath(locale, normalizedPath),
    ])
  ) as Record<string, string>;

  alternates["x-default"] = buildLocalizedPath(defaultLocale, normalizedPath);

  return alternates;
}
