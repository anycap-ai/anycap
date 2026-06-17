import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Reliable, source-of-truth drift guard for shared-content SEO surfaces.
//
// The generic content.ts pattern check (check-seo-locale-rollout.mjs) cannot see
// translations that live in shared modules, so it cannot reliably validate the
// reverse direction (rollout locale -> has translation) for hub / home / agent
// pages. This guard validates exactly those surfaces against their real source
// of truth:
//   - Hub index pages (for/guides/glossary/compare): hub copy comes from
//     `hubBaseDefinitionsByLocale` in src/lib/seo/hub-pages.ts. A locale in
//     rollout but absent from that map renders English -> same-language
//     duplicate. Rollout locales must be a subset of the hub-copy locales.
//   - home / agent: their metadata uses locale-invariant `siteConfig` titles
//     (see createRootMetadata / createAgentMetadata) and the landing/agent body
//     is not localized, so these must stay English-only.

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const rolloutFilePath = path.join(rootDir, "src", "lib", "seo-locale-rollout.ts");
const hubPagesFilePath = path.join(rootDir, "src", "lib", "seo", "hub-pages.ts");

const NON_DEFAULT_LOCALES = ["pt-br", "id", "de"];
const HUB_ROUTE_KEYS = ["for", "guides", "glossary", "compare"];
const LOCALE_INVARIANT_ROUTE_KEYS = ["home", "agent"];

function stripQuotes(value) {
  return value.replace(/^["']|["']$/g, "");
}

function parseRolloutAliasLocales(source) {
  const aliasLocales = new Map();
  const aliasRegex = /^const\s+([A-Za-z0-9_]+)\s*=\s*\[([^\]]+)\]/gm;
  let match = aliasRegex.exec(source);
  while (match) {
    const [, alias, body] = match;
    const locales = [...body.matchAll(/["']([a-z-]+)["']/g)].map((m) => m[1]);
    aliasLocales.set(alias, locales);
    match = aliasRegex.exec(source);
  }
  return aliasLocales;
}

function parseRolloutByRouteKey(source) {
  const aliasLocales = parseRolloutAliasLocales(source);

  // Only parse inside the rollout object to avoid matching the alias defs.
  const objectMatch = source.match(
    /seoIndexedLocaleCodesByRouteKey\s*=\s*\{([\s\S]*?)\n\}\s*as const/,
  );
  if (!objectMatch) {
    throw new Error("Unable to locate seoIndexedLocaleCodesByRouteKey object.");
  }

  const rolloutByRouteKey = new Map();
  const entryRegex = /"([^"]+)":\s*([A-Za-z0-9_]+)/g;
  let entry = entryRegex.exec(objectMatch[1]);
  while (entry) {
    const [, routeKey, alias] = entry;
    rolloutByRouteKey.set(routeKey, aliasLocales.get(alias) ?? []);
    entry = entryRegex.exec(objectMatch[1]);
  }
  return rolloutByRouteKey;
}

function parseHubCopyLocales(source) {
  const objectMatch = source.match(
    /hubBaseDefinitionsByLocale[^=]*=\s*\{([\s\S]*?)\n\};/,
  );
  if (!objectMatch) {
    throw new Error(
      "Unable to locate hubBaseDefinitionsByLocale in seo/hub-pages.ts.",
    );
  }

  const locales = new Set();
  const keyRegex = /^\s*("?[A-Za-z][A-Za-z0-9-]*"?)\s*:/gm;
  let match = keyRegex.exec(objectMatch[1]);
  while (match) {
    locales.add(stripQuotes(match[1]));
    match = keyRegex.exec(objectMatch[1]);
  }
  return locales;
}

function main() {
  const rolloutSource = readFileSync(rolloutFilePath, "utf8");
  const hubPagesSource = readFileSync(hubPagesFilePath, "utf8");

  const rolloutByRouteKey = parseRolloutByRouteKey(rolloutSource);
  const hubCopyLocales = parseHubCopyLocales(hubPagesSource);

  const violations = [];

  for (const routeKey of HUB_ROUTE_KEYS) {
    const configured = rolloutByRouteKey.get(routeKey) ?? [];
    for (const locale of configured) {
      if (locale === "en") {
        continue;
      }
      if (!hubCopyLocales.has(locale)) {
        violations.push(
          `routeKey="${routeKey}" rolled out for locale="${locale}" but hub copy is missing in seo/hub-pages.ts (hubBaseDefinitionsByLocale has: ${[...hubCopyLocales].join(", ")}). Add the locale's hub copy or remove it from rollout.`,
        );
      }
    }
  }

  for (const routeKey of LOCALE_INVARIANT_ROUTE_KEYS) {
    const configured = rolloutByRouteKey.get(routeKey) ?? [];
    const nonEn = configured.filter((locale) => locale !== "en");
    if (nonEn.length > 0) {
      violations.push(
        `routeKey="${routeKey}" rolled out for locale(s)=${nonEn.join(", ")} but its metadata uses locale-invariant siteConfig titles and is not localized. Localize it first or keep it English-only.`,
      );
    }
  }

  // Sanity: ensure we actually parsed something, otherwise the guard is a no-op.
  if (rolloutByRouteKey.size === 0 || hubCopyLocales.size === 0) {
    console.error(
      "SEO hub locale rollout check could not parse rollout or hub copy; refusing to pass silently.",
    );
    process.exitCode = 1;
    return;
  }

  if (violations.length === 0) {
    console.log(
      `SEO hub locale rollout check passed: hub/home/agent rollout matches translated coverage (locales checked: ${NON_DEFAULT_LOCALES.join(", ")}).`,
    );
    return;
  }

  console.error("SEO hub locale rollout check failed:");
  for (const violation of violations) {
    console.error(`- ${violation}`);
  }
  process.exitCode = 1;
}

main();
