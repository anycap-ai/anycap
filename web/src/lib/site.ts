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

export const siteConfig = {
  name: "AnyCap",
  siteName: "AnyCap",
  url: "https://anycap.ai",
  locale: localeConfig[defaultLocale].ogLocale,
  defaultLocale,
  supportedLocales,
  defaultTitle: "AnyCap | Every capability your agent needs. One command.",
  defaultDescription:
    "AnyCap gives AI agents the capabilities they're missing — image, video, music, speech, search — through a single CLI and a single credential. Built for agents, not adapted from human tools.",
  humanTitle: "Built for agents",
  humanDescription:
    "Agents can think, but they can't act. AnyCap gives them every capability through one command — no SDKs, no dashboards, no friction.",
} as const;

export type PublicRouteKind = "home" | "human" | "seo";

export const publicRouteDefinitions = [
  { key: "home", kind: "home", path: ROOT_PATH, priority: 1 },
  { key: "for-human", kind: "human", path: "/for-human", priority: 0.8 },
  { key: "cli", kind: "seo", path: "/cli", priority: 0.9 },
  { key: "capabilities", kind: "seo", path: "/capabilities", priority: 0.8 },
  { key: "models", kind: "seo", path: "/models", priority: 0.75 },
  {
    key: "capabilities-image-generation",
    kind: "seo",
    path: "/capabilities/image-generation",
    priority: 0.7,
  },
  {
    key: "capabilities-video-generation",
    kind: "seo",
    path: "/capabilities/video-generation",
    priority: 0.7,
  },
  {
    key: "capabilities-image-understanding",
    kind: "seo",
    path: "/capabilities/image-understanding",
    priority: 0.7,
  },
  {
    key: "capabilities-video-analysis",
    kind: "seo",
    path: "/capabilities/video-analysis",
    priority: 0.7,
  },
  { key: "for-claude-code", kind: "seo", path: "/for/claude-code", priority: 0.9 },
  { key: "for-cursor", kind: "seo", path: "/for/cursor", priority: 0.8 },
  { key: "for-codex", kind: "seo", path: "/for/codex", priority: 0.8 },
  {
    key: "guides-install-anycap",
    kind: "seo",
    path: "/guides/install-anycap",
    priority: 0.7,
  },
  {
    key: "guides-add-tools-to-claude-code",
    kind: "seo",
    path: "/guides/add-tools-to-claude-code",
    priority: 0.6,
  },
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
    priority: 0.6,
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
  "/billing",
  "/usage",
  "/logs",
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
