import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { collectPageFiles } from "./seo-tree.mjs";

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const seoAppDir = path.join(rootDir, "src", "app", "(seo)");

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
