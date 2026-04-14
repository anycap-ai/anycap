import { execFileSync } from "node:child_process";
import { mkdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { collectPageFiles } from "./seo-tree.mjs";

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const appDir = path.join(rootDir, "src", "app");
const outputDir = path.join(rootDir, "src", "generated");
const outputFile = path.join(outputDir, "sitemap-lastmod.json");

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

const manifest = Object.fromEntries(
  collectPageFiles(appDir).map((filePath) => [
    path.relative(rootDir, filePath),
    getGitLastModified(filePath),
  ]),
);

mkdirSync(outputDir, { recursive: true });
writeFileSync(outputFile, `${JSON.stringify(manifest, null, 2)}\n`);

console.log(
  `Generated sitemap lastmod manifest with ${Object.keys(manifest).length} entries at ${path.relative(rootDir, outputFile)}`,
);
