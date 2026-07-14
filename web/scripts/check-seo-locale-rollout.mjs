import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { collectFiles } from "./seo-tree.mjs";

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const routesFilePath = path.join(rootDir, "src", "lib", "seo", "routes.ts");
const rolloutFilePath = path.join(rootDir, "src", "lib", "seo-locale-rollout.ts");
const noIndexPathsFilePath = path.join(rootDir, "src", "lib", "seo", "noindex-paths.ts");

const SUPPORTED_CHECK_LOCALES = ["pt-br", "id", "de"];

export function parseTargetLocales(argv) {
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

export function parseTargetPaths(argv) {
  const arg = argv.find((item) => item.startsWith("--paths="));
  if (!arg) return null;

  const values = arg
    .slice("--paths=".length)
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  return values.length > 0 ? new Set(values) : null;
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

function extractNoIndexSeoPaths(source) {
  const pathsBlockMatch = source.match(/noIndexSeoPaths\s*=\s*new Set<string>\(\[([\s\S]*?)\]\)/);
  if (!pathsBlockMatch) {
    throw new Error("Unable to extract noindex SEO paths from noindex-paths.ts.");
  }

  const [, pathsBlock] = pathsBlockMatch;
  return new Set(
    [...pathsBlock.matchAll(/["']([^"']+)["']/g)]
      .map((match) => match[1])
      .filter(Boolean),
  );
}

function escapeForRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function hasExplicitEnglishFallback(content, localeObjectLabel) {
  return [
    new RegExp(`${localeObjectLabel}\\s*:\\s*undefined\\b`),
    new RegExp(
      `${localeObjectLabel}\\s*:\\s*(?:localizedContentByLocale|contentByLocale)\\.en\\b`,
    ),
    new RegExp(`${localeObjectLabel}\\s*:\\s*englishContent\\b`),
    new RegExp(`${localeObjectLabel}\\s*:\\s*en\\b`),
  ].some((pattern) => pattern.test(content));
}

function hasNamedLocaleObjectBinding(content, localeObjectLabel) {
  const match = content.match(
    new RegExp(`${localeObjectLabel}\\s*:\\s*([A-Za-z_$][\\w$]*)\\s*[,}]`),
  );
  if (!match || ["englishContent", "en"].includes(match[1])) return false;

  const declarationMatch = content.match(new RegExp(
    `\\bconst\\s+${escapeForRegex(match[1])}(?:\\s*:[^=]+)?\\s*=\\s*\\{`,
  ));
  if (!declarationMatch) return false;

  const objectPrefix = content.slice(
    (declarationMatch.index ?? 0) + declarationMatch[0].length,
    (declarationMatch.index ?? 0) + declarationMatch[0].length + 200,
  );
  if (
    /^\s*\.\.\.(?:en|englishContent|(?:localizedContentByLocale|contentByLocale)\.en)\b/.test(
      objectPrefix,
    )
  ) {
    return false;
  }

  return true;
}

export function hasConcreteLocaleTranslation(content, locale) {
  const escapedLocale = escapeForRegex(locale);
  const localeObjectLabel = locale.includes("-")
    ? `["']${escapedLocale}["']`
    : `(?:["']${escapedLocale}["']|\\b${escapedLocale}\\b)`;
  const localeObjectPattern = new RegExp(`${localeObjectLabel}\\s*:\\s*\\{`);
  const localeSwitchPattern = new RegExp(`locale\\s*===\\s*["']${escapedLocale}["']`);
  const localeFactoryPattern = new RegExp(`\\(\\s*["']${escapedLocale}["']\\s*\\)`);

  if (hasExplicitEnglishFallback(content, localeObjectLabel)) {
    return false;
  }

  const hasLocaleSignal =
    localeObjectPattern.test(content) ||
    hasNamedLocaleObjectBinding(content, localeObjectLabel) ||
    localeSwitchPattern.test(content) ||
    localeFactoryPattern.test(content);

  if (!hasLocaleSignal) {
    return false;
  }

  if (locale === "id") {
    const idFallbackPatterns = [
      /id\s*:\s*undefined\s+as\s+never/,
      /localizedContentByLocale\.id\s*=\s*localizedContentByLocale\.en/,
      /contentByLocale\.id\s*=\s*contentByLocale\.en/,
    ];

    if (idFallbackPatterns.some((pattern) => pattern.test(content))) {
      return false;
    }
  }

  return true;
}

function detectTranslatedLocales(content, targetLocales) {
  return targetLocales.filter((locale) => hasConcreteLocaleTranslation(content, locale));
}

function toRoutePathFromContentFile(contentFilePath) {
  const relative = path.relative(path.join(rootDir, "src", "app", "(seo)"), contentFilePath);
  const routeDir = path.dirname(relative).split(path.sep).join("/");
  return routeDir ? `/${routeDir}` : "/";
}

function readRouteSourceByPath(routePath) {
  const routeDirPath = path.join(rootDir, "src", "app", "(seo)", routePath.replace(/^\//, ""));
  const candidateFiles = ["content.ts", "page.tsx", "metadata.ts"];
  const existingFiles = candidateFiles
    .map((name) => path.join(routeDirPath, name))
    .filter((filePath) => {
      try {
        readFileSync(filePath, "utf8");
        return true;
      } catch {
        return false;
      }
    });

  if (existingFiles.length === 0) {
    return "";
  }

  return existingFiles.map((filePath) => readFileSync(filePath, "utf8")).join("\n");
}

export function main(argv = process.argv.slice(2)) {
  const targetLocales = parseTargetLocales(argv);
  const targetPaths = parseTargetPaths(argv);
  const routesSource = readFileSync(routesFilePath, "utf8");
  const rolloutSource = readFileSync(rolloutFilePath, "utf8");
  const noIndexPathsSource = readFileSync(noIndexPathsFilePath, "utf8");

  const routeMap = extractRouteMapFromRoutes(routesSource);
  const rolloutByRouteKey = extractRolloutLocalesByRouteKey(rolloutSource);
  const noIndexSeoPaths = extractNoIndexSeoPaths(noIndexPathsSource);
  const contentFiles = collectFiles(path.join(rootDir, "src", "app", "(seo)")).filter((filePath) =>
    ["content.ts", "page.tsx"].includes(path.basename(filePath)),
  );

  const missingManualRoutes = [];
  const missingRollout = [];
  const rolloutWithoutTranslation = [];

  for (const contentFilePath of contentFiles) {
    const content = readFileSync(contentFilePath, "utf8");
    const translatedLocales = detectTranslatedLocales(content, targetLocales);
    if (translatedLocales.length === 0) {
      continue;
    }

    const routePath = toRoutePathFromContentFile(contentFilePath);
    if (targetPaths && !targetPaths.has(routePath)) continue;
    if (noIndexSeoPaths.has(routePath)) {
      continue;
    }

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

  const strictTranslationLocales = argv.includes("--strict")
    ? new Set(targetLocales)
    : new Set(["id"]);

  for (const [routePath, routeKey] of routeMap.entries()) {
    if (targetPaths && !targetPaths.has(routePath)) continue;
    if (noIndexSeoPaths.has(routePath)) {
      continue;
    }

    const configuredLocales = rolloutByRouteKey.get(routeKey) ?? [];
    const routeSource = readRouteSourceByPath(routePath);

    for (const locale of targetLocales) {
      if (!configuredLocales.includes(locale)) {
        continue;
      }

      if (!strictTranslationLocales.has(locale)) {
        continue;
      }

      if (!hasConcreteLocaleTranslation(routeSource, locale)) {
        rolloutWithoutTranslation.push({
          routeKey,
          routePath,
          locale,
        });
      }
    }
  }

  if (
    missingManualRoutes.length === 0 &&
    missingRollout.length === 0 &&
    rolloutWithoutTranslation.length === 0
  ) {
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

  if (rolloutWithoutTranslation.length > 0) {
    console.error("Routes rolled out for locale but missing concrete translation:");
    for (const item of rolloutWithoutTranslation) {
      console.error(
        `- routeKey=${item.routeKey} routePath=${item.routePath} missingConcreteLocale=${item.locale}`,
      );
    }
  }
  process.exitCode = 1;
}

const isMainModule =
  Boolean(process.argv[1]) &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMainModule) main();
