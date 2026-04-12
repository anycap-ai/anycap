import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const seoAppDir = path.join(rootDir, "src", "app", "(seo)");
const siteFilePath = path.join(rootDir, "src", "lib", "site.ts");
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

function walk(dir) {
  const entries = readdirSync(dir, { withFileTypes: true }).sort((a, b) =>
    a.name.localeCompare(b.name),
  );
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(fullPath));
      continue;
    }
    files.push(fullPath);
  }

  return files;
}

function extractRouteMapFromSite(source) {
  const map = new Map();
  const pairRegex =
    /key:\s*"([^"]+)"[\s\S]*?path:\s*"([^"]+)"/g;

  let match = pairRegex.exec(source);
  while (match) {
    const [, key, routePath] = match;
    if (key && routePath) {
      map.set(routePath, key);
    }
    match = pairRegex.exec(source);
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
  const relative = path.relative(seoAppDir, contentFilePath);
  const routeDir = path.dirname(relative).split(path.sep).join("/");
  return routeDir ? `/${routeDir}` : "/";
}

function main() {
  const targetLocales = parseTargetLocales(process.argv.slice(2));
  const siteSource = readFileSync(siteFilePath, "utf8");
  const rolloutSource = readFileSync(rolloutFilePath, "utf8");

  const routeMap = extractRouteMapFromSite(siteSource);
  const rolloutByRouteKey = extractRolloutLocalesByRouteKey(rolloutSource);
  const contentFiles = walk(seoAppDir).filter((filePath) =>
    filePath.endsWith("/content.ts"),
  );

  const missing = [];

  for (const contentFilePath of contentFiles) {
    const content = readFileSync(contentFilePath, "utf8");
    const translatedLocales = detectTranslatedLocales(content, targetLocales);
    if (translatedLocales.length === 0) {
      continue;
    }

    const routePath = toRoutePathFromContentFile(contentFilePath);
    const routeKey = routeMap.get(routePath);
    if (!routeKey) {
      continue;
    }

    const configuredLocales = rolloutByRouteKey.get(routeKey) ?? [];
    for (const locale of translatedLocales) {
      if (!configuredLocales.includes(locale)) {
        missing.push({
          routeKey,
          routePath,
          locale,
        });
      }
    }
  }

  if (missing.length === 0) {
    console.log(
      `SEO locale rollout check passed for locales=${targetLocales.join(",")}: no translated pages are missing rollout.`,
    );
    return;
  }

  console.error(
    `SEO locale rollout check failed for locales=${targetLocales.join(",")}: translated pages missing rollout.`,
  );
  for (const item of missing) {
    console.error(
      `- routeKey=${item.routeKey} routePath=${item.routePath} missingLocale=${item.locale}`,
    );
  }
  process.exitCode = 1;
}

main();
