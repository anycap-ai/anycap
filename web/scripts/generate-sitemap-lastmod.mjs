import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { collectPageFiles } from "./seo-tree.mjs";

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const appDir = path.join(rootDir, "src", "app");
const outputDir = path.join(rootDir, "src", "generated");
const outputFile = path.join(outputDir, "sitemap-lastmod.json");
const routeDependencyExtensions = new Set([".ts", ".tsx", ".json"]);

function getGitLastModified(filePath) {
  try {
    const relativeFilePath = path.relative(rootDir, filePath);
    const output = execFileSync(
      "git",
      ["log", "-1", "--format=%cI", "--", relativeFilePath],
      {
        cwd: rootDir,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      },
    ).trim();

    if (output) {
      return output;
    }
  } catch {
    // Fall back to the current filesystem mtime when git metadata is unavailable.
  }

  return statSync(filePath).mtime.toISOString();
}

export function collectRouteDependencyFiles(pageFilePath) {
  const routeDir = path.dirname(pageFilePath);

  return readdirSync(routeDir, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .filter((entry) => routeDependencyExtensions.has(path.extname(entry.name)))
    .filter((entry) => !entry.name.includes(".test."))
    .map((entry) => path.join(routeDir, entry.name))
    .sort();
}

export function getLatestLastModified(
  filePaths,
  getLastModified = getGitLastModified,
) {
  return filePaths
    .map((filePath) => getLastModified(filePath))
    .reduce((latest, current) =>
      new Date(current).getTime() > new Date(latest).getTime()
        ? current
        : latest,
    );
}

export function buildSitemapLastmodManifest(
  pageFiles,
  getLastModified = getGitLastModified,
) {
  return Object.fromEntries(
    pageFiles.map((pageFilePath) => [
      path.relative(rootDir, pageFilePath),
      getLatestLastModified(
        collectRouteDependencyFiles(pageFilePath),
        getLastModified,
      ),
    ]),
  );
}

function main() {
  const manifest = buildSitemapLastmodManifest(collectPageFiles(appDir));

  mkdirSync(outputDir, { recursive: true });
  writeFileSync(outputFile, `${JSON.stringify(manifest, null, 2)}\n`);

  console.log(
    `Generated sitemap lastmod manifest with ${Object.keys(manifest).length} entries at ${path.relative(rootDir, outputFile)}`,
  );
}

const isMainModule =
  Boolean(process.argv[1]) &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMainModule) main();
