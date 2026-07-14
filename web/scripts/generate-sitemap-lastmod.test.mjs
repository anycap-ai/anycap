import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";

import {
  collectRouteDependencyFiles,
  getLatestLastModified,
} from "./generate-sitemap-lastmod.mjs";

test("video generation includes co-located content and its dedicated view", () => {
  const pagePath = path.resolve(
    "src/app/(seo)/capabilities/video-generation/page.tsx",
  );
  const names = collectRouteDependencyFiles(pagePath)
    .map((filePath) => path.basename(filePath))
    .sort();

  assert.ok(names.includes("page.tsx"));
  assert.ok(names.includes("content.ts"));
  assert.ok(names.includes("VideoGenerationPageView.tsx"));
});

test("the evergreen guide includes co-located metadata", () => {
  const pagePath = path.resolve(
    "src/app/(seo)/guides/how-to-add-video-generation-to-ai-agent/page.tsx",
  );
  const names = collectRouteDependencyFiles(pagePath)
    .map((filePath) => path.basename(filePath));

  assert.ok(names.includes("metadata.ts"));
});

test("uses the newest dependency timestamp", () => {
  const values = new Map([
    ["page.tsx", "2026-04-01T00:00:00.000Z"],
    ["content.ts", "2026-07-11T00:00:00.000Z"],
    ["metadata.ts", "2026-06-01T00:00:00.000Z"],
  ]);

  assert.equal(
    getLatestLastModified([...values.keys()], (filePath) => values.get(filePath)),
    "2026-07-11T00:00:00.000Z",
  );
});
