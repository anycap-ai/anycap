import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const appDir = path.join(process.cwd(), "src", "app");
const routeEntryNames = new Set(["page.tsx", "layout.tsx", "not-found.tsx", "route.ts"]);
const edgeRuntimePattern = /export const runtime\s*=\s*["']edge["']/;

function walk(dir) {
  const entries = readdirSync(dir);
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      files.push(...walk(fullPath));
      continue;
    }

    files.push(fullPath);
  }

  return files;
}

const entryFiles = walk(appDir)
  .filter((filePath) => routeEntryNames.has(path.basename(filePath)))
  .sort();

const missingRuntime = [];
const invalidRuntimePlacement = [];

for (const filePath of entryFiles) {
  const content = readFileSync(filePath, "utf8");

  if (!edgeRuntimePattern.test(content)) {
    missingRuntime.push(path.relative(process.cwd(), filePath));
    continue;
  }

  const useClientIndex = content.indexOf("\"use client\"");
  const runtimeIndex = content.search(edgeRuntimePattern);
  if (useClientIndex !== -1 && runtimeIndex !== -1 && runtimeIndex < useClientIndex) {
    invalidRuntimePlacement.push(path.relative(process.cwd(), filePath));
  }
}

if (missingRuntime.length > 0) {
  console.error("Missing `export const runtime = \"edge\";` in:");
  for (const filePath of missingRuntime) {
    console.error(`- ${filePath}`);
  }
  process.exit(1);
}

if (invalidRuntimePlacement.length > 0) {
  console.error("`use client` must appear before `export const runtime = \"edge\";` in:");
  for (const filePath of invalidRuntimePlacement) {
    console.error(`- ${filePath}`);
  }
  process.exit(1);
}

console.log(`Edge runtime check passed for ${appDir}.`);
