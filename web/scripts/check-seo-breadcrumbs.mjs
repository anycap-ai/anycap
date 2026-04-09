import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const seoAppDir = path.join(rootDir, "src", "app", "(seo)");
const pageFileName = "page.tsx";

function collectPageFiles(dir) {
  const entries = readdirSync(dir, { withFileTypes: true }).sort((left, right) =>
    left.name.localeCompare(right.name),
  );
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...collectPageFiles(fullPath));
      continue;
    }

    if (entry.isFile() && entry.name === pageFileName) {
      files.push(fullPath);
    }
  }

  return files;
}

function hasBreadcrumbCoverage(content) {
  return content.includes("BreadcrumbJsonLd") || content.includes("HubIndexPage");
}

const missingBreadcrumbs = collectPageFiles(seoAppDir)
  .filter((filePath) => !hasBreadcrumbCoverage(readFileSync(filePath, "utf8")))
  .map((filePath) => path.relative(rootDir, filePath));

if (missingBreadcrumbs.length > 0) {
  console.error("Missing breadcrumb coverage in SEO routes:");
  for (const filePath of missingBreadcrumbs) {
    console.error(`- ${filePath}`);
  }
  process.exit(1);
}

console.log(`SEO breadcrumb check passed for ${path.relative(rootDir, seoAppDir)}.`);
