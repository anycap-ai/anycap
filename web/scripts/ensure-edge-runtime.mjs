import { readFileSync, statSync } from "node:fs";
import path from "node:path";
import { collectFiles } from "./seo-tree.mjs";

const appDir = path.join(process.cwd(), "src", "app");
const routeEntryNames = new Set(["page.tsx", "layout.tsx", "not-found.tsx", "route.ts"]);
const edgeRuntimePattern = /export const runtime\s*=\s*["']edge["']/;
const ignoredSegments = new Set(["(seo)"]);

const entryFiles = collectFiles(appDir)
  .filter((filePath) => routeEntryNames.has(path.basename(filePath)))
  .sort();

const invalidRuntimePlacement = [];
const missingRuntimeSegments = [];

function routeSegmentsFor(filePath) {
  return path
    .relative(appDir, path.dirname(filePath))
    .split(path.sep)
    .filter((segment) => segment && !ignoredSegments.has(segment));
}

function segmentLayoutPath(segments) {
  return path.join(appDir, ...segments, "layout.tsx");
}

function hasEdgeRuntime(filePath) {
  try {
    return edgeRuntimePattern.test(readFileSync(filePath, "utf8"));
  } catch {
    return false;
  }
}

function nearestEdgeRuntimePath(filePath) {
  const segments = routeSegmentsFor(filePath);

  for (let index = segments.length; index >= 0; index -= 1) {
    const layoutPath = segmentLayoutPath(segments.slice(0, index));
    if (hasEdgeRuntime(layoutPath)) {
      return layoutPath;
    }
  }

  return null;
}

for (const filePath of entryFiles) {
  const content = readFileSync(filePath, "utf8");

  const useClientIndex = content.indexOf("\"use client\"");
  const runtimeIndex = content.search(edgeRuntimePattern);
  if (useClientIndex !== -1 && runtimeIndex !== -1 && runtimeIndex < useClientIndex) {
    invalidRuntimePlacement.push(path.relative(process.cwd(), filePath));
  }

  if (path.basename(filePath) === "page.tsx" && !edgeRuntimePattern.test(content) && !nearestEdgeRuntimePath(filePath)) {
    missingRuntimeSegments.push(path.relative(process.cwd(), filePath));
  }
}

if (invalidRuntimePlacement.length > 0) {
  console.error("`use client` must appear before `export const runtime = \"edge\";` in:");
  for (const filePath of invalidRuntimePlacement) {
    console.error(`- ${filePath}`);
  }
  process.exit(1);
}

if (missingRuntimeSegments.length > 0) {
  console.error("Every app route must inherit or export `runtime = \"edge\"` for Cloudflare Pages:");
  for (const filePath of missingRuntimeSegments) {
    console.error(`- ${filePath}`);
  }
  process.exit(1);
}

console.log(`Edge runtime check passed for ${appDir}.`);
