import { mkdirSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const seoAppDir = path.join(rootDir, "src", "app", "(seo)");
const outputDir = path.join(rootDir, "src", "generated");
const outputFile = path.join(outputDir, "seo-route-manifest.json");
const pageFileName = "page.tsx";

function collectPageRoutes(dir, prefix = "") {
  const entries = readdirSync(dir, { withFileTypes: true }).sort((left, right) =>
    left.name.localeCompare(right.name),
  );
  const routes = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      const nextPrefix = path.posix.join(prefix, entry.name);
      routes.push(...collectPageRoutes(fullPath, nextPrefix));
      continue;
    }

    if (!entry.isFile() || entry.name !== pageFileName) {
      continue;
    }

    const normalizedPrefix = prefix ? `/${prefix}` : "/";
    routes.push(normalizedPrefix);
  }

  return routes;
}

const routes = [...new Set(collectPageRoutes(seoAppDir))].sort();

mkdirSync(outputDir, { recursive: true });
writeFileSync(outputFile, `${JSON.stringify({ routes }, null, 2)}\n`);

console.log(
  `Generated SEO route manifest with ${routes.length} routes at ${path.relative(rootDir, outputFile)}`,
);
