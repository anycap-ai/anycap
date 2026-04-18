import { readFileSync, statSync } from "node:fs";
import path from "node:path";
import { collectFiles } from "./seo-tree.mjs";

const appDir = path.join(process.cwd(), "src", "app");
const routeEntryNames = new Set(["page.tsx", "layout.tsx", "not-found.tsx", "route.ts"]);
const edgeRuntimePattern = /export const runtime\s*=\s*["']edge["']/;

const entryFiles = collectFiles(appDir)
  .filter((filePath) => routeEntryNames.has(path.basename(filePath)))
  .sort();

const invalidRuntimePlacement = [];

for (const filePath of entryFiles) {
  const content = readFileSync(filePath, "utf8");

  const useClientIndex = content.indexOf("\"use client\"");
  const runtimeIndex = content.search(edgeRuntimePattern);
  if (useClientIndex !== -1 && runtimeIndex !== -1 && runtimeIndex < useClientIndex) {
    invalidRuntimePlacement.push(path.relative(process.cwd(), filePath));
  }
}

if (invalidRuntimePlacement.length > 0) {
  console.error("`use client` must appear before `export const runtime = \"edge\";` in:");
  for (const filePath of invalidRuntimePlacement) {
    console.error(`- ${filePath}`);
  }
  process.exit(1);
}

console.log(`Edge runtime check passed for ${appDir}.`);
