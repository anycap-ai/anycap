import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { collectFiles } from "./seo-tree.mjs";

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const routesFilePath = path.join(rootDir, "src", "lib", "seo", "routes.ts");
const rolloutFilePath = path.join(rootDir, "src", "lib", "seo-locale-rollout.ts");

const SUPPORTED_CHECK_LOCALES = ["pt-br", "id"];

function parseTargetLocales(argv) {
  const arg = argv.find((item) => item.startsWith("--locales="));
  if (!arg) {
    return ["pt-br"];
  }

  const values = arg
    .slice("--locales=".length)
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  const invalid = values.filter((value) => !SUPPORTED_CHECK_LOCALES.includes(value));
  if (invalid.length > 0) {
    throw new Error(
      `Unsupported locale(s): ${invalid.join(", ")}. Allowed: ${SUPPORTED_CHECK_LOCALES.join(", ")}`,
    );
  }

  return values.length > 0 ? values : ["pt-br"];
}

function extractRouteMapFromRoutes(source) {
  const routesBlockMatch = source.match(
    /manualSeoRouteDefinitions\s*=\s*\[([\s\S]*?)\]\s*as const/,
  );

  if (!routesBlockMatch) {
    throw new Error("Unable to extract manual SEO routes from routes.ts.");
  }

  const [, routesBlock] = routesBlockMatch;
  const map = new Map();
  const pairRegex = /key:\s*"([^"]+)"[\s\S]*?path:\s*"([^"]+)"/g;

  let match = pairRegex.exec(routesBlock);
  while (match) {
    const [, key, routePath] = match;
    if (key && routePath) {
      if (map.has(routePath)) {
        throw new Error(`Duplicate manual SEO route path detected: ${routePath}`);
      }
      map.set(routePath, key);
    }
    match = pairRegex.exec(routesBlock);
  }

  if (map.size === 0) {
    throw new Error("Parsed zero manual SEO routes from routes.ts.");
  }

  return map;
}

function extractRolloutLocalesByRouteKey(source) {
  const routeKeyToAlias = new Map();
  const aliasLocales = new Map();

  const aliasRegex = /^const\s+([a-zA-Z0-9_]+)\s*=\s*\[([^\]]+)\]/gm;
  let aliasMatch = aliasRegex.exec(source);
  while (aliasMatch) {
    const [, alias, body] = aliasMatch;
    const locales = SUPPORTED_CHECK_LOCALES.filter((locale) =>
      new RegExp(`["']${locale}["']`).test(body),
    );
    aliasLocales.set(alias, locales);
    aliasMatch = aliasRegex.exec(source);
  }

  const routeRegex = /"([^"]+)":\s*([a-zA-Z0-9_]+)/g;
  let routeMatch = routeRegex.exec(source);
  while (routeMatch) {
    const [, routeKey, alias] = routeMatch;
    routeKeyToAlias.set(routeKey, alias);
    routeMatch = routeRegex.exec(source);
  }

  const rolloutByRouteKey = new Map();
  for (const [routeKey, alias] of routeKeyToAlias) {
    rolloutByRouteKey.set(routeKey, aliasLocales.get(alias) ?? []);
  }

  return rolloutByRouteKey;
}

function detectTranslatedLocales(content, targetLocales) {
  return targetLocales.filter(
    (locale) =>
      new RegExp(`["']${locale}["']\\s*:`).test(content) ||
      new RegExp(`\\b${locale.replace("-", "\\-")}\\s*:`).test(content),
  );
}

function toRoutePathFromContentFile(contentFilePath) {
  const relative = path.relative(path.join(rootDir, "src", "app", "(seo)"), contentFilePath);
  const routeDir = path.dirname(relative).split(path.sep).join("/");
  return routeDir ? `/${routeDir}` : "/";
}

function main() {
  const targetLocales = parseTargetLocales(process.argv.slice(2));
  const routesSource = readFileSync(routesFilePath, "utf8");
  const rolloutSource = readFileSync(rolloutFilePath, "utf8");

  const routeMap = extractRouteMapFromRoutes(routesSource);
  const rolloutByRouteKey = extractRolloutLocalesByRouteKey(rolloutSource);
  const contentFiles = collectFiles(path.join(rootDir, "src", "app", "(seo)")).filter((filePath) =>
    filePath.endsWith("/content.ts"),
  );

  const missingManualRoutes = [];
  const missingRollout = [];

  for (const contentFilePath of contentFiles) {
    const content = readFileSync(contentFilePath, "utf8");
    const translatedLocales = detectTranslatedLocales(content, targetLocales);
    if (translatedLocales.length === 0) {
      continue;
    }

    const routePath = toRoutePathFromContentFile(contentFilePath);
    const routeKey = routeMap.get(routePath);
    if (!routeKey) {
      missingManualRoutes.push({
        routePath,
        locales: translatedLocales,
      });
      continue;
    }

    const configuredLocales = rolloutByRouteKey.get(routeKey) ?? [];
    for (const locale of translatedLocales) {
      if (!configuredLocales.includes(locale)) {
        missingRollout.push({
          routeKey,
          routePath,
          locale,
        });
      }
    }
  }

  if (missingManualRoutes.length === 0 && missingRollout.length === 0) {
    console.log(
      `SEO locale rollout check passed for locales=${targetLocales.join(",")}: no translated pages are missing rollout.`,
    );
    return;
  }

  console.error(
    `SEO locale rollout check failed for locales=${targetLocales.join(",")}: translated pages missing rollout.`,
  );

  if (missingManualRoutes.length > 0) {
    console.error("Translated routes missing manual SEO route definitions:");
    for (const item of missingManualRoutes) {
      console.error(
        `- routePath=${item.routePath} locales=${item.locales.join(",")} (add this route to src/lib/seo/routes.ts first)`,
      );
    }
  }

  if (missingRollout.length > 0) {
    console.error("Translated routes missing locale rollout configuration:");
    for (const item of missingRollout) {
      console.error(
        `- routeKey=${item.routeKey} routePath=${item.routePath} missingLocale=${item.locale}`,
      );
    }
  }
  process.exitCode = 1;
}

main();
