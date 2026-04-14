import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { collectPageRoutes } from "./seo-tree.mjs";

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const seoAppDir = path.join(rootDir, "src", "app", "(seo)");
const outputDir = path.join(rootDir, "src", "generated");
const outputFile = path.join(outputDir, "seo-route-manifest.json");

const routes = [...new Set(collectPageRoutes(seoAppDir))].sort();

mkdirSync(outputDir, { recursive: true });
writeFileSync(outputFile, `${JSON.stringify({ routes }, null, 2)}\n`);

console.log(
  `Generated SEO route manifest with ${routes.length} routes at ${path.relative(rootDir, outputFile)}`,
);
