const ROOT_PATH = "/";
const LOCALE_HEADER = "x-anycap-locale";
const DEFAULT_LOCALE = "en";

export const supportedLocales = [DEFAULT_LOCALE] as const;

export type SiteLocale = (typeof supportedLocales)[number];

export const defaultLocale: SiteLocale = DEFAULT_LOCALE;
export const localeHeaderName = LOCALE_HEADER;

export const localeConfig = {
  en: {
    htmlLang: "en",
    ogLocale: "en_US",
    label: "English",
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
  "image generation, video generation, music generation, image understanding, video analysis, audio understanding, web search, grounded search, and web crawl";

export const roadmapCapabilitySummary = "speech and sandbox";

export const defaultSiteDescription =
  `AnyCap gives AI agents one CLI and one credential for ${capabilitySummary} — plus cloud storage and web publishing. Built for agents, not adapted from human tools.`;

export const defaultSocialImageAlt =
  `AnyCap gives AI agents ${capabilitySummary} through one command.`;

export const siteConfig = {
  name: "AnyCap",
  siteName: "AnyCap",
  url: "https://anycap.ai",
  locale: localeConfig[defaultLocale].ogLocale,
  defaultLocale,
  supportedLocales,
  defaultTitle: "Any Capability, Instantly",
  defaultDescription: defaultSiteDescription,
  humanTitle: "Any Capability, Instantly",
  humanDescription:
    `See how AnyCap gives agents ${capabilitySummary} through one install path, one auth flow, and one command surface.`,
} as const;

export type PublicRouteKind = "home" | "human" | "seo";

export const publicRouteDefinitions = [
  { key: "home", kind: "home", path: ROOT_PATH, priority: 1 },
  { key: "for-human", kind: "human", path: "/for-human", priority: 0.8 },
  { key: "about", kind: "seo", path: "/about", priority: 0.72 },
  { key: "pricing", kind: "seo", path: "/pricing", priority: 0.9 },
  { key: "start", kind: "seo", path: "/start", priority: 0.96 },
  { key: "for", kind: "seo", path: "/for", priority: 0.84 },
  { key: "guides", kind: "seo", path: "/guides", priority: 0.68 },
  { key: "glossary", kind: "seo", path: "/glossary", priority: 0.58 },
  { key: "compare", kind: "seo", path: "/compare", priority: 0.66 },
  { key: "learn", kind: "seo", path: "/learn", priority: 0.68 },
  { key: "for-claude-code", kind: "seo", path: "/for/claude-code", priority: 0.95 },
  {
    key: "for-claude-code-image-generation",
    kind: "seo",
    path: "/for/claude-code/image-generation",
    priority: 0.88,
  },
  {
    key: "for-claude-code-video-generation",
    kind: "seo",
    path: "/for/claude-code/video-generation",
    priority: 0.86,
  },
  {
    key: "learn-what-agents-cant-do",
    kind: "seo",
    path: "/learn/what-agents-cant-do",
    priority: 0.84,
  },
  { key: "guides-add-tools-to-claude-code", kind: "seo", path: "/guides/add-tools-to-claude-code", priority: 0.84 },
  {
    key: "guides-install-anycap",
    kind: "seo",
    path: "/guides/install-anycap",
    priority: 0.82,
  },
  { key: "for-cursor", kind: "seo", path: "/for/cursor", priority: 0.82 },
  { key: "for-manus", kind: "seo", path: "/for/manus", priority: 0.8 },
  { key: "capabilities", kind: "seo", path: "/capabilities", priority: 0.8 },
  { key: "cli", kind: "seo", path: "/cli", priority: 0.78 },
  { key: "for-codex", kind: "seo", path: "/for/codex", priority: 0.78 },
  { key: "capabilities-image-generation", kind: "seo", path: "/capabilities/image-generation", priority: 0.78 },
  { key: "capabilities-video-generation", kind: "seo", path: "/capabilities/video-generation", priority: 0.76 },
  { key: "capabilities-music-generation", kind: "seo", path: "/capabilities/music-generation", priority: 0.74 },
  {
    key: "capabilities-image-understanding",
    kind: "seo",
    path: "/capabilities/image-understanding",
    priority: 0.74,
  },
  {
    key: "capabilities-audio-understanding",
    kind: "seo",
    path: "/capabilities/audio-understanding",
    priority: 0.72,
  },
  {
    key: "capabilities-video-analysis",
    kind: "seo",
    path: "/capabilities/video-analysis",
    priority: 0.74,
  },
  { key: "capabilities-web-search", kind: "seo", path: "/capabilities/web-search", priority: 0.72 },
  {
    key: "capabilities-grounded-web-search",
    kind: "seo",
    path: "/capabilities/grounded-web-search",
    priority: 0.7,
  },
  { key: "capabilities-web-crawl", kind: "seo", path: "/capabilities/web-crawl", priority: 0.72 },
  { key: "capabilities-drive", kind: "seo", path: "/capabilities/drive", priority: 0.7 },
  { key: "skills", kind: "seo", path: "/skills", priority: 0.72 },
  { key: "models", kind: "seo", path: "/models", priority: 0.72 },
  {
    key: "guides-context-engineering-for-agents",
    kind: "seo",
    path: "/guides/context-engineering-for-agents",
    priority: 0.7,
  },
  {
    key: "guides-agent-skills-for-developer-tools",
    kind: "seo",
    path: "/guides/agent-skills-for-developer-tools",
    priority: 0.7,
  },
  {
    key: "guides-workspace-context-engineering",
    kind: "seo",
    path: "/guides/workspace-context-engineering",
    priority: 0.7,
  },
  {
    key: "guides-what-is-agent-harness",
    kind: "seo",
    path: "/guides/what-is-agent-harness",
    priority: 0.7,
  },
  {
    key: "compare-anycap-vs-composio",
    kind: "seo",
    path: "/compare/anycap-vs-composio",
    priority: 0.62,
  },
  {
    key: "compare-anycap-vs-openai-agent-builder",
    kind: "seo",
    path: "/compare/anycap-vs-openai-agent-builder",
    priority: 0.65,
  },
  {
    key: "models-seedream-5",
    kind: "seo",
    path: "/models/seedream-5",
    priority: 0.65,
  },
  {
    key: "models-nano-banana-pro",
    kind: "seo",
    path: "/models/nano-banana-pro",
    priority: 0.65,
  },
  {
    key: "models-veo-3-1",
    kind: "seo",
    path: "/models/veo-3-1",
    priority: 0.65,
  },
  {
    key: "glossary-context-engineering",
    kind: "seo",
    path: "/glossary/context-engineering",
    priority: 0.55,
  },
  {
    key: "glossary-agent-harness",
    kind: "seo",
    path: "/glossary/agent-harness",
    priority: 0.55,
  },
  {
    key: "glossary-agent-capability-runtime",
    kind: "seo",
    path: "/glossary/agent-capability-runtime",
    priority: 0.5,
  },
] as const;

export type PublicRouteDefinition = (typeof publicRouteDefinitions)[number];
export type PublicRouteKey = PublicRouteDefinition["key"];
export type SeoRouteDefinition = Extract<PublicRouteDefinition, { kind: "seo" }>;
export type SeoRouteKey = SeoRouteDefinition["key"];

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

export function getLocaleConfig(locale: SiteLocale) {
  return localeConfig[locale];
}

export function isSupportedLocale(value: string): value is SiteLocale {
  return supportedLocales.includes(value as SiteLocale);
}

export function getLocaleFromHeader(value?: string | null): SiteLocale {
  if (value && isSupportedLocale(value)) {
    return value;
  }
  return defaultLocale;
}

export function normalizePublicPath(pathname: string): string {
  if (!pathname || pathname === ROOT_PATH) {
    return ROOT_PATH;
  }
  return pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}

export function buildLocalizedPath(locale: SiteLocale, pathname: string): string {
  const normalizedPath = normalizePublicPath(pathname);
  if (normalizedPath === ROOT_PATH) {
    return `/${locale}`;
  }
  return `/${locale}${normalizedPath}`;
}

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
  const alternates = Object.fromEntries(
    supportedLocales.map((locale) => [
      getLocaleConfig(locale).htmlLang,
      buildLocalizedPath(locale, pathname),
    ])
  ) as Record<string, string>;

  alternates["x-default"] = buildLocalizedPath(defaultLocale, pathname);

  return alternates;
}
