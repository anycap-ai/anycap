import { readdirSync } from "node:fs";
import path from "node:path";

function readSortedDirectory(dir) {
  return readdirSync(dir, { withFileTypes: true }).sort((left, right) =>
    left.name.localeCompare(right.name),
  );
}

function walkDirectory(dir, visitor, relativeSegments = []) {
  const entries = readSortedDirectory(dir);

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const nextRelativeSegments = [...relativeSegments, entry.name];

    if (entry.isDirectory()) {
      walkDirectory(fullPath, visitor, nextRelativeSegments);
      continue;
    }

    visitor({ entry, fullPath, relativeSegments: nextRelativeSegments });
  }
}

export function collectFiles(dir) {
  const files = [];

  walkDirectory(dir, ({ fullPath }) => {
    files.push(fullPath);
  });

  return files;
}

export function collectPageFiles(dir, pageFileName = "page.tsx") {
  const files = [];

  walkDirectory(dir, ({ entry, fullPath }) => {
    if (entry.isFile() && entry.name === pageFileName) {
      files.push(fullPath);
    }
  });

  return files;
}

export function collectPageRoutes(dir, pageFileName = "page.tsx") {
  const routes = [];

  walkDirectory(dir, ({ entry, relativeSegments }) => {
    if (!entry.isFile() || entry.name !== pageFileName) {
      return;
    }

    const routeSegments = relativeSegments.slice(0, -1);
    routes.push(routeSegments.length > 0 ? `/${routeSegments.join("/")}` : "/");
  });

  return routes;
}
