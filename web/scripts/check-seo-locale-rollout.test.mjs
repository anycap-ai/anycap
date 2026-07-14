import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  hasConcreteLocaleTranslation,
  parseTargetLocales,
  parseTargetPaths,
} from "./check-seo-locale-rollout.mjs";

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));

test("accepts every indexed non-default P0 locale", () => {
  assert.deepEqual(
    parseTargetLocales(["--locales=pt-br,id,de"]),
    ["pt-br", "id", "de"],
  );
});

test("parses an explicit P0 path filter", () => {
  assert.deepEqual(
    [...parseTargetPaths([
      "--paths=/for/codex,/capabilities/video-generation",
    ])],
    ["/for/codex", "/capabilities/video-generation"],
  );
});

test("detects a locale bound through a named content object", () => {
  const source = `
    const indonesianContent = { title: "Untuk Codex" };
    const contentByLocale = { en: englishContent, id: indonesianContent };
  `;

  assert.equal(hasConcreteLocaleTranslation(source, "id"), true);
});

test("rejects an explicit English fallback", () => {
  const source = `
    const contentByLocale = { en: englishContent, id: englishContent };
  `;

  assert.equal(hasConcreteLocaleTranslation(source, "id"), false);
});

test("rejects a locale bound to the short English constant", () => {
  const source = `
    const en = { title: "English" };
    const contentByLocale = { en, "pt-br": en };
  `;

  assert.equal(hasConcreteLocaleTranslation(source, "pt-br"), false);
});

test("rejects a partial locale object that spreads English content", () => {
  const source = `
    const en = { title: "English", body: "English body" };
    const ptBr = { ...en, title: "Português" };
    const contentByLocale = { en, "pt-br": ptBr };
  `;

  assert.equal(hasConcreteLocaleTranslation(source, "pt-br"), false);
});

test("requires rollout for concrete locale copy in a page-only route", (context) => {
  const fixtureDir = mkdtempSync(path.join(tmpdir(), "seo-locale-rollout-"));
  context.after(() => rmSync(fixtureDir, { recursive: true, force: true }));

  const fixtureWebDir = path.join(fixtureDir, "web");
  const fixtureScriptsDir = path.join(fixtureWebDir, "scripts");
  const fixtureLibDir = path.join(fixtureWebDir, "src", "lib");
  const fixtureSeoLibDir = path.join(fixtureLibDir, "seo");
  const fixtureRouteDir = path.join(
    fixtureWebDir,
    "src",
    "app",
    "(seo)",
    "guides",
    "page-only",
  );

  for (const directory of [
    fixtureScriptsDir,
    fixtureSeoLibDir,
    fixtureRouteDir,
  ]) {
    mkdirSync(directory, { recursive: true });
  }

  const fixtureCheckerPath = path.join(
    fixtureScriptsDir,
    "check-seo-locale-rollout.mjs",
  );
  copyFileSync(
    path.join(scriptsDir, "check-seo-locale-rollout.mjs"),
    fixtureCheckerPath,
  );
  copyFileSync(
    path.join(scriptsDir, "seo-tree.mjs"),
    path.join(fixtureScriptsDir, "seo-tree.mjs"),
  );
  writeFileSync(
    path.join(fixtureSeoLibDir, "routes.ts"),
    `export const manualSeoRouteDefinitions = [
      { key: "page-only", path: "/guides/page-only" },
    ] as const;`,
  );
  writeFileSync(
    path.join(fixtureLibDir, "seo-locale-rollout.ts"),
    `const englishOnly = ["en"];
    export const seoLocaleRollout = { "page-only": englishOnly };`,
  );
  writeFileSync(
    path.join(fixtureSeoLibDir, "noindex-paths.ts"),
    "export const noIndexSeoPaths = new Set<string>([]);",
  );
  writeFileSync(
    path.join(fixtureRouteDir, "page.tsx"),
    `const contentByLocale = {
      en: { title: "English" },
      de: { title: "Deutsch" },
    };`,
  );
  const fixtureRunnerPath = path.join(fixtureScriptsDir, "run-check.mjs");
  writeFileSync(
    fixtureRunnerPath,
    `import { main } from "./check-seo-locale-rollout.mjs";
    main(process.argv.slice(2));`,
  );

  const result = spawnSync(
    process.execPath,
    [
      fixtureRunnerPath,
      "--locales=de",
      "--paths=/guides/page-only",
      "--strict",
    ],
    { encoding: "utf8" },
  );

  assert.equal(result.status, 1, result.stderr || result.stdout);
  assert.match(result.stderr, /routePath=\/guides\/page-only missingLocale=de/);
});
