# Main-Site SEO P0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the four approved Codex-and-video P0 routes into an accurate, localized, mutually linked conversion cluster and open a verified local preview for the user.

**Architecture:** Keep all existing public routes and localized wrappers. Store product facts once in CLI/catalog-backed constants, merge them with typed locale copy at page-data factories, render through the current page/view components, and enforce the result with focused source contracts, strict P0 locale checks, dependency-aware sitemap dates, typechecking, and a production build.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript 5, Tailwind CSS 4, Node.js ESM checks with `node:test`, Go CLI tests, pnpm.

## Global Constraints

- Only these public routes are in scope: `/for/codex`, `/capabilities/video-generation`, `/capabilities/video-analysis`, and `/guides/how-to-add-video-generation-to-ai-agent`.
- Do not add, rename, redirect, or remove a public route.
- Do not edit generated files under `web/src/app/[locale]/(seo)/` by hand; use the existing sync flow.
- Product commands and output shapes come from `internal/cli/command/`, `internal/cli/output/`, `skills/anycap-cli/references/`, and `docs/anycap-current-status.md`.
- Video model IDs, availability, modes, and cost estimates come from `web/src/lib/seo/model-catalog.ts`; page-local copy may translate best-fit and trade-off guidance but may not redefine availability, modes, or prices.
- `reference-based` is an input pattern within generation, not a separate operation.
- Video analysis exposes a JSON envelope with a `content` string; do not promise typed scene/event fields.
- Every new visible field must be complete for `en`, `pt-br`, `id`, and `de`; commands, JSON keys, model IDs, and product names remain literal code facts.
- Each P0 page must include contextual body links to the other three P0 pages.
- Preserve original publication dates and use `2026-07-11` as this release's modification date.
- Do not add HowTo schema or re-enable FAQPage schema. Do not render empty JSON-LD scripts.
- Do not modify the homepage, `web/src/lib/landing-content.ts`, analytics attribution, provider APIs, server behavior, or CLI behavior.
- Do not use `pnpm run build:cf` for verification because it publishes IndexNow.
- Preserve the untracked `anycap.ai-audit/` directory; never stage or commit it.
- Execute in an isolated `codex/seo-main-site-p0` worktree created from the commit containing this plan.
- Completion requires a passing production build and an in-app browser opened to the local `/for/codex` preview.

---

## File Map

**Create**

- `web/scripts/check-seo-locale-rollout.test.mjs` — unit tests for strict locale/path parsing and named locale bindings.
- `web/scripts/generate-sitemap-lastmod.test.mjs` — unit tests for route-local dependency dates.
- `web/scripts/check-main-site-seo-p0.mjs` — incremental source contract for the four P0 routes.
- `web/src/app/(seo)/guides/how-to-add-video-generation-to-ai-agent/content.ts` — typed four-locale guide content and fact/data factories.
- `web/docs/seo/change-log/2026-07-11-main-site-seo-p0.md` — implementation and verification record.

**Modify**

- `web/scripts/check-seo-locale-rollout.mjs`
- `web/scripts/generate-sitemap-lastmod.mjs`
- `web/package.json`
- `web/src/generated/sitemap-lastmod.json` (regenerated only)
- `web/src/app/(seo)/for/codex/content.ts`
- `web/src/app/(seo)/for/codex/page.tsx`
- `web/src/app/(seo)/capabilities/video-generation/content.ts`
- `web/src/app/(seo)/capabilities/video-generation/VideoGenerationPageView.tsx`
- `web/src/app/(seo)/capabilities/video-analysis/content.ts`
- `web/src/app/(seo)/capabilities/video-analysis/page.tsx`
- `web/src/components/seo/CapabilityDetailPage.tsx`
- `web/src/app/(seo)/guides/how-to-add-video-generation-to-ai-agent/page.tsx`
- `web/src/app/(seo)/guides/how-to-add-video-generation-to-ai-agent/metadata.ts`

**Read but do not modify**

- `internal/cli/command/cap/video.go`
- `internal/cli/command/cap/actions.go`
- `internal/cli/output/json.go`
- `skills/anycap-cli/references/video-generation.md`
- `skills/anycap-cli/references/actions.md`
- `web/src/lib/schema.ts`
- `web/src/lib/localized-metadata.ts`
- `web/src/lib/sitemap-routes.ts`
- generated localized P0 wrappers under `web/src/app/[locale]/(seo)/`

---

## Execution Preflight

Before Task 1, the controller must use `superpowers:using-git-worktrees` to
create `codex/seo-main-site-p0` from the commit containing this plan. In the new
worktree, confirm that `git status --short` is empty and that
`anycap.ai-audit/` is absent. Record the worktree's starting commit for later
review-package generation.

Run these baseline checks before edits:

```bash
go test ./internal/cli/command ./internal/cli/output \
  -run 'Test(VideoModels|VideoModelSchema|VideoGenerate|VideoRead|WriteServerContent)' \
  -count=1

cd web
node ./scripts/check-seo-breadcrumbs.mjs
node ./scripts/check-seo-information-architecture.mjs
node ./scripts/check-seo-locale-rollout.mjs
node ./scripts/check-seo-hub-locale-rollout.mjs
node ./scripts/ensure-edge-runtime.mjs
```

Expected: all commands exit 0. The strict three-locale P0 check is introduced
by Task 1 and is not part of the baseline.

---

### Task 1: Add a strict, path-scoped P0 locale gate

**Files:**

- Create: `web/scripts/check-seo-locale-rollout.test.mjs`
- Modify: `web/scripts/check-seo-locale-rollout.mjs`

**Interfaces:**

- Produces: `parseTargetLocales(argv)`, `parseTargetPaths(argv)`, `hasConcreteLocaleTranslation(content, locale)`, and `main(argv)` exports.
- Produces CLI flags: `--locales=pt-br,id,de`, `--paths=<comma-separated routes>`, and `--strict`.
- Preserves the current no-argument behavior: the existing build still performs its default `pt-br` check.

- [ ] **Step 1: Write the failing locale-checker tests**

Create `web/scripts/check-seo-locale-rollout.test.mjs`:

```js
import assert from "node:assert/strict";
import test from "node:test";

import {
  hasConcreteLocaleTranslation,
  parseTargetLocales,
  parseTargetPaths,
} from "./check-seo-locale-rollout.mjs";

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
```

- [ ] **Step 2: Run the tests and confirm RED**

Run:

```bash
cd web
node --test ./scripts/check-seo-locale-rollout.test.mjs
```

Expected: FAIL because `check-seo-locale-rollout.mjs` exports none of the requested functions.

Also run:

```bash
node ./scripts/check-seo-locale-rollout.mjs \
  --locales=pt-br,id,de \
  --paths=/for/codex,/capabilities/video-generation,/capabilities/video-analysis,/guides/how-to-add-video-generation-to-ai-agent \
  --strict
```

Expected: FAIL with `Unsupported locale(s): de`.

- [ ] **Step 3: Export the pure functions and add strict path filtering**

In `check-seo-locale-rollout.mjs`:

```js
const SUPPORTED_CHECK_LOCALES = ["pt-br", "id", "de"];

export function parseTargetPaths(argv) {
  const arg = argv.find((item) => item.startsWith("--paths="));
  if (!arg) return null;

  const values = arg
    .slice("--paths=".length)
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  return values.length > 0 ? new Set(values) : null;
}

function hasExplicitEnglishFallback(content, localeObjectLabel) {
  return [
    new RegExp(`${localeObjectLabel}\\s*:\\s*undefined\\b`),
    new RegExp(
      `${localeObjectLabel}\\s*:\\s*(?:localizedContentByLocale|contentByLocale)\\.en\\b`,
    ),
    new RegExp(`${localeObjectLabel}\\s*:\\s*englishContent\\b`),
  ].some((pattern) => pattern.test(content));
}

function hasNamedLocaleObjectBinding(content, localeObjectLabel) {
  const match = content.match(
    new RegExp(`${localeObjectLabel}\\s*:\\s*([A-Za-z_$][\\w$]*)\\s*[,}]`),
  );
  if (!match || match[1] === "englishContent") return false;

  return new RegExp(
    `\\bconst\\s+${escapeForRegex(match[1])}(?:\\s*:[^=]+)?\\s*=\\s*\\{`,
  ).test(content);
}
```

Export `parseTargetLocales` and `hasConcreteLocaleTranslation`. Update
`hasConcreteLocaleTranslation` so it rejects explicit English fallbacks before
accepting either an inline locale object or `hasNamedLocaleObjectBinding(...)`.

Change `main` to `export function main(argv = process.argv.slice(2))`, parse
`targetPaths`, and skip a route in both validation loops when:

```js
if (targetPaths && !targetPaths.has(routePath)) continue;
```

Use all requested locales for reverse validation only when strict mode is set:

```js
const strictTranslationLocales = argv.includes("--strict")
  ? new Set(targetLocales)
  : new Set(["id"]);
```

Prevent execution on import:

```js
const isMainModule =
  Boolean(process.argv[1]) &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMainModule) main();
```

- [ ] **Step 4: Run the unit and focused locale checks**

```bash
cd web
node --test ./scripts/check-seo-locale-rollout.test.mjs
node ./scripts/check-seo-locale-rollout.mjs \
  --locales=pt-br,id,de \
  --paths=/for/codex,/capabilities/video-generation,/capabilities/video-analysis,/guides/how-to-add-video-generation-to-ai-agent \
  --strict
```

Expected: four tests pass and the focused command prints a locale-rollout pass
for `pt-br,id,de`.

- [ ] **Step 5: Commit the locale gate**

```bash
git add web/scripts/check-seo-locale-rollout.mjs \
  web/scripts/check-seo-locale-rollout.test.mjs
git commit -m "test(web): add strict P0 locale coverage"
```

---

### Task 2: Make sitemap `lastmod` follow route-local content

**Files:**

- Create: `web/scripts/generate-sitemap-lastmod.test.mjs`
- Modify: `web/scripts/generate-sitemap-lastmod.mjs`
- Regenerate: `web/src/generated/sitemap-lastmod.json`

**Interfaces:**

- Produces: `collectRouteDependencyFiles(pageFilePath)`, `getLatestLastModified(filePaths, getLastModified)`, and `buildSitemapLastmodManifest(pageFiles, getLastModified)`.
- Preserves the manifest type `Record<"src/app/**/page.tsx", ISO8601String>`, so `web/src/lib/sitemap-routes.ts` does not change.

- [ ] **Step 1: Write the failing dependency-date tests**

Create `web/scripts/generate-sitemap-lastmod.test.mjs`:

```js
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
```

- [ ] **Step 2: Run the tests and confirm RED**

```bash
cd web
node --test ./scripts/generate-sitemap-lastmod.test.mjs
```

Expected: FAIL because the imported functions do not exist.

- [ ] **Step 3: Implement dependency collection without changing manifest keys**

Add `readdirSync` to the filesystem import, then add:

```js
const routeDependencyExtensions = new Set([".ts", ".tsx", ".json"]);

export function collectRouteDependencyFiles(pageFilePath) {
  const routeDir = path.dirname(pageFilePath);

  return readdirSync(routeDir, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .filter((entry) => routeDependencyExtensions.has(path.extname(entry.name)))
    .filter((entry) => !entry.name.includes(".test."))
    .map((entry) => path.join(routeDir, entry.name))
    .sort();
}

export function getLatestLastModified(
  filePaths,
  getLastModified = getGitLastModified,
) {
  return filePaths
    .map((filePath) => getLastModified(filePath))
    .reduce((latest, current) =>
      new Date(current).getTime() > new Date(latest).getTime()
        ? current
        : latest,
    );
}

export function buildSitemapLastmodManifest(
  pageFiles,
  getLastModified = getGitLastModified,
) {
  return Object.fromEntries(
    pageFiles.map((pageFilePath) => [
      path.relative(rootDir, pageFilePath),
      getLatestLastModified(
        collectRouteDependencyFiles(pageFilePath),
        getLastModified,
      ),
    ]),
  );
}
```

Build the manifest through `buildSitemapLastmodManifest(collectPageFiles(appDir))`
and use the same direct-execution guard as Task 1 so importing the module does
not rewrite generated output.

- [ ] **Step 4: Run the tests and regenerate the manifest**

```bash
cd web
node --test ./scripts/generate-sitemap-lastmod.test.mjs
pnpm run generate:sitemap-lastmod
git diff -- src/generated/sitemap-lastmod.json
```

Expected: three tests pass. Manifest keys remain page-file paths, while values
use the newest co-located route source. Review every generated-date change;
unrelated route/file additions are not acceptable.

- [ ] **Step 5: Commit the dependency-aware dates**

```bash
git add web/scripts/generate-sitemap-lastmod.mjs \
  web/scripts/generate-sitemap-lastmod.test.mjs \
  web/src/generated/sitemap-lastmod.json
git commit -m "fix(web): include SEO content in sitemap lastmod"
```

---

### Task 3: Rebuild `/for/codex` around three video tasks

**Files:**

- Create: `web/scripts/check-main-site-seo-p0.mjs`
- Modify: `web/src/app/(seo)/for/codex/content.ts`
- Modify: `web/src/app/(seo)/for/codex/page.tsx`

**Interfaces:**

- Preserves: `FOR_CODEX_PATH`, `getForCodexMetadata(locale)`, and `getForCodexPageData(locale)`.
- Produces: `CodexTaskPathKey`, `CodexTaskPathCopy`, `CodexTaskPathFact`, `CodexTaskPath`, and `content.taskPaths.items: readonly CodexTaskPath[]`.
- Produces: the first `check-main-site-seo-p0.mjs` contract; Tasks 4–6 extend the same script.

- [ ] **Step 1: Create a failing Codex source contract**

Create `web/scripts/check-main-site-seo-p0.mjs` with reusable assertions and a
Codex check:

```js
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const errors = [];

function read(relativePath) {
  return readFileSync(path.join(rootDir, relativePath), "utf8");
}

function requireTokens(label, source, tokens) {
  for (const token of tokens) {
    if (!source.includes(token)) errors.push(`${label}: missing ${token}`);
  }
}

function forbidPattern(label, source, pattern) {
  if (pattern.test(source)) errors.push(`${label}: forbidden ${pattern}`);
}

function checkCodex() {
  const content = read("src/app/(seo)/for/codex/content.ts");
  const page = read("src/app/(seo)/for/codex/page.tsx");

  requireTokens("for/codex content", content, [
    '"generate-video"',
    '"image-to-video"',
    '"analyze-video"',
    "--mode text-to-video",
    "--mode image-to-video",
    "--param images=./product-frame.png",
    "anycap actions video-read",
    '"/capabilities/video-generation"',
    '"/capabilities/video-analysis"',
    '"/guides/how-to-add-video-generation-to-ai-agent"',
  ]);
  forbidPattern("for/codex content", content, /\banycap (?:image|video) read\b/);
  requireTokens("for/codex page", page, [
    "content.taskPaths.items.map",
    "task.authorityHref",
    "task.installHref",
  ]);
}

checkCodex();

if (errors.length > 0) {
  console.error("Main-site SEO P0 contract check failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Main-site SEO P0 contract check passed.");
```

- [ ] **Step 2: Run the contract and confirm RED**

```bash
cd web
node ./scripts/check-main-site-seo-p0.mjs
```

Expected: FAIL with missing task-path keys and stale `anycap image read` /
`anycap video read` findings.

- [ ] **Step 3: Add fact/copy types and code-fact constants**

Replace the old `WorkflowPanel` contract in `content.ts` with:

```ts
type CodexTaskPathKey = "generate-video" | "image-to-video" | "analyze-video";

type CodexTaskPathCopy = {
  title: string;
  description: string;
  fit: string;
  limitation: string;
  authorityCtaLabel: string;
  installCtaLabel: string;
};

type CodexTaskPathFact = {
  key: CodexTaskPathKey;
  command: string;
  outputLines: readonly string[];
  authorityHref:
    | "/capabilities/video-generation"
    | "/capabilities/video-analysis"
    | "/guides/how-to-add-video-generation-to-ai-agent";
  installHref: "/start";
};

type CodexTaskPath = CodexTaskPathFact & CodexTaskPathCopy;
```

Use one ordered fact map; no locale repeats commands, JSON keys, or hrefs:

```ts
const CODEX_TASK_PATH_ORDER: readonly CodexTaskPathKey[] = [
  "generate-video",
  "image-to-video",
  "analyze-video",
];

const CODEX_TASK_PATH_FACTS: Record<CodexTaskPathKey, CodexTaskPathFact> = {
  "generate-video": {
    key: "generate-video",
    command:
      'anycap video generate --model <model-id> --mode text-to-video --prompt "a short product walkthrough with a slow camera push-in" -o codex-demo.mp4',
    outputLines: [
      "{",
      '  "status": "success",',
      '  "local_path": "/workspace/codex-demo.mp4",',
      '  "model": "<model-id>",',
      '  "credits_used": 20,',
      '  "request_id": "req_abc123"',
      "}",
    ],
    authorityHref: "/capabilities/video-generation",
    installHref: "/start",
  },
  "image-to-video": {
    key: "image-to-video",
    command:
      'anycap video generate --model <model-id> --mode image-to-video --prompt "animate this product frame with subtle camera movement" --param images=./product-frame.png -o animated-frame.mp4',
    outputLines: [
      "{",
      '  "status": "success",',
      '  "local_path": "/workspace/animated-frame.mp4",',
      '  "model": "<model-id>",',
      '  "credits_used": 20,',
      '  "request_id": "req_def456"',
      "}",
    ],
    authorityHref: "/guides/how-to-add-video-generation-to-ai-agent",
    installHref: "/start",
  },
  "analyze-video": {
    key: "analyze-video",
    command:
      'anycap actions video-read --file ./recording.mp4 --instruction "Summarize the key events, QA findings, and recommended next action"',
    outputLines: [
      "{",
      '  "status": "success",',
      '  "content": "The recording shows the checkout modal clipping its submit button on a narrow viewport.",',
      '  "credit_cost": 10,',
      '  "request_id": "req_ghi789"',
      "}",
    ],
    authorityHref: "/capabilities/video-analysis",
    installHref: "/start",
  },
};

function buildCodexTaskPaths(
  copy: Record<CodexTaskPathKey, CodexTaskPathCopy>,
): readonly CodexTaskPath[] {
  return CODEX_TASK_PATH_ORDER.map((key) => ({
    ...CODEX_TASK_PATH_FACTS[key],
    ...copy[key],
  }));
}
```

Add this field to `PageContent`:

```ts
taskPaths: {
  eyebrow: string;
  title: string;
  description: string;
  commandLabel: string;
  outputLabel: string;
  fitLabel: string;
  limitationLabel: string;
  items: Record<CodexTaskPathKey, CodexTaskPathCopy>;
};
```

- [ ] **Step 4: Add complete locale copy and metadata**

Use these exact section labels:

| Locale | Eyebrow | Title | Command | Result | Best fit | Limitation |
|---|---|---|---|---|---|---|
| `en` | Choose a video task | What should Codex do next? | Command | Result | Best when | Not a fit when |
| `pt-br` | Escolha uma tarefa de vídeo | O que o Codex deve fazer agora? | Comando | Resultado | Melhor quando | Não é ideal quando |
| `id` | Pilih tugas video | Apa yang harus Codex lakukan selanjutnya? | Perintah | Hasil | Cocok saat | Tidak cocok saat |
| `de` | Videoaufgabe auswählen | Was soll Codex als Nächstes tun? | Befehl | Ergebnis | Am besten wenn | Nicht geeignet wenn |

The three locale items must convey these fixed meanings:

| Key | Title meaning | Fit meaning | Limitation meaning | Authority CTA |
|---|---|---|---|---|
| `generate-video` | Generate video from a text brief | A new clip should start from a described scene | A manual timeline editor or deterministic frame-level control is required | Open video generation |
| `image-to-video` | Turn an image into video | Composition or identity must begin with an existing still | The selected model lacks `image-to-video` or the still is not ready | Open the image-to-video guide |
| `analyze-video` | Analyze an existing video | A recording must become QA notes, extracted content, or a next action | A fixed typed scene/event schema is required | Open video analysis |

Translate those meanings naturally into all four locale objects. Use the
locale's equivalent of `Install AnyCap` for every install CTA. TypeScript must
enforce all keys through `Record<SiteLocale, PageContent>`.

Update each locale's metadata to focus on the three tasks:

| Locale | Title | Description |
|---|---|---|
| `en` | Codex Video Generation & Analysis with AnyCap | Add video generation, image-to-video, and video analysis to Codex through one skill and CLI. See real commands, outputs, limits, and setup. |
| `pt-br` | Geração e análise de vídeo no Codex com AnyCap | Adicione geração de vídeo, image-to-video e análise de vídeo ao Codex com uma skill e uma CLI, incluindo comandos, resultados, limites e setup. |
| `id` | Generasi dan analisis video di Codex dengan AnyCap | Tambahkan generasi video, image-to-video, dan analisis video ke Codex melalui satu skill dan CLI dengan command, output, batasan, dan setup nyata. |
| `de` | Videogenerierung und Videoanalyse in Codex mit AnyCap | Ergänzen Sie Codex über einen Skill und eine CLI um Videogenerierung, Image-to-Video und Videoanalyse samt Befehlen, Ergebnissen, Grenzen und Setup. |

Set `LAST_UPDATED_ISO = "2026-07-11"`, preserve `datePublished: "2026-04-05"`
in TechArticle JSON-LD, and update all visible localized last-updated labels.
Replace all locale occurrences of `anycap image read` and `anycap video read`
with `anycap actions image-read` and `anycap actions video-read`.
Remove the obsolete `workflow` field and its three old panels from the
`PageContent` type and all four locale objects; do not keep hidden duplicate
task content. Use each locale's title/description above for its Open Graph and
TechArticle headline/description fields as well.

- [ ] **Step 5: Merge facts into localized page data**

In `getForCodexPageData(locale)`, return:

```ts
return {
  ...content,
  taskPaths: {
    ...content.taskPaths,
    items: buildCodexTaskPaths(content.taskPaths.items),
  },
  capabilityGuideJsonLd,
  faqJsonLd: createFaqPageJsonLd(content.faqItems),
  videoObjectJsonLd: {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: content.videoObject.name,
    description: content.videoObject.description,
    contentUrl: content.hero.videoSrc,
    uploadDate: "2026-04-03",
    duration: "PT48S",
    thumbnailUrl: content.hero.videoPosterUrl,
  },
};
```

The `credits_used` values in the visible JSON are explicitly illustrative;
adjacent localized copy must say the billed total varies by selected model and
output settings. Do not present `20` as a fixed price.

- [ ] **Step 6: Replace the old workflow renderer with three task cards**

Render immediately after the early-access banner and remove the old
`content.workflow.panels` section:

```tsx
<section className="mt-16 md:mt-24">
  <p className="mb-4 text-[11px] tracking-[0.8px] text-[#6b7d3a]" style={mono}>
    {content.taskPaths.eyebrow}
  </p>
  <h2 className="text-[#1c1f17] leading-[1.1] tracking-[-0.02em]" style={pixel}>
    {content.taskPaths.title}
  </h2>
  <p className="mt-5 max-w-[760px] text-base leading-7 text-[#4d5145]">
    {content.taskPaths.description}
  </p>
  <div className="mt-8 grid gap-6 lg:grid-cols-3">
    {content.taskPaths.items.map((task) => (
      <article key={task.key} className="flex flex-col rounded-xl border border-[#d4dbb8] bg-[#fffffc]/70 p-6">
        <h3 className="text-lg text-[#1c1f17]" style={pixel}>{task.title}</h3>
        <p className="mt-3 text-sm leading-6 text-[#4d5145]">{task.description}</p>
        <p className="mt-6 text-[11px] text-[#6b7d3a]" style={mono}>{content.taskPaths.commandLabel}</p>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-[#1c1f17] p-4 text-[12px] leading-5 text-[#d4e0a4]">{task.command}</pre>
        <p className="mt-5 text-[11px] text-[#6b7d3a]" style={mono}>{content.taskPaths.outputLabel}</p>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-[#1c1f17] p-4 text-[12px] leading-5 text-[#b8cc6e]">{task.outputLines.join("\n")}</pre>
        <dl className="mt-5 space-y-3 text-sm leading-6">
          <div><dt className="font-medium text-[#1c1f17]">{content.taskPaths.fitLabel}</dt><dd className="text-[#4d5145]">{task.fit}</dd></div>
          <div><dt className="font-medium text-[#1c1f17]">{content.taskPaths.limitationLabel}</dt><dd className="text-[#4d5145]">{task.limitation}</dd></div>
        </dl>
        <div className="mt-auto flex flex-wrap gap-3 pt-6">
          <Link href={task.authorityHref}>{task.authorityCtaLabel}</Link>
          <Link href={task.installHref}>{task.installCtaLabel}</Link>
        </div>
      </article>
    ))}
  </div>
</section>
```

Apply the existing landing button classes to the two links and preserve the
design tokens from `web/docs/design-guideline.md`.

- [ ] **Step 7: Run the Codex contract and typecheck**

```bash
cd web
node ./scripts/check-main-site-seo-p0.mjs
pnpm exec tsc --noEmit
```

Expected: the P0 contract prints PASS and TypeScript exits 0.

- [ ] **Step 8: Commit the Codex hub**

```bash
git add web/scripts/check-main-site-seo-p0.mjs \
  'web/src/app/(seo)/for/codex/content.ts' \
  'web/src/app/(seo)/for/codex/page.tsx'
git commit -m "feat(web): rebuild Codex video conversion hub"
```

---

### Task 4: Turn video generation into a catalog-backed authority page

**Files:**

- Modify: `web/scripts/check-main-site-seo-p0.mjs`
- Modify: `web/src/app/(seo)/capabilities/video-generation/content.ts`
- Modify: `web/src/app/(seo)/capabilities/video-generation/VideoGenerationPageView.tsx`

**Interfaces:**

- Preserves: `getVideoGenerationMetadata(locale)`, `getVideoGenerationPageData(locale)`, and `VideoGenerationPageData`.
- Produces: locale-owned page chrome, input-mode guidance, failure guidance, final copy, and four catalog-backed decision models.
- Consumes: `getCatalogModelsByCapability("video")` and current `CatalogModel` fields.

- [ ] **Step 1: Extend the P0 contract and confirm RED**

Add a `checkVideoGeneration()` function that requires:

```js
requireTokens("video generation content", content, [
  "inputModes",
  "failureItems",
  "creditEstimate",
  "tradeoff",
  "timingNote",
  '"/for/codex"',
  '"/capabilities/video-analysis"',
  '"/guides/how-to-add-video-generation-to-ai-agent"',
]);
requireTokens("video generation view", view, [
  "content.proofPoints",
  "content.fitSignals",
  "content.usageIntro",
  "content.final.title",
]);
forbidPattern("video generation content", content, /Hot model capture|The page is built for searches/);
forbidPattern("video generation view", view, /Trending now|Search intent|The page must prove|Searchers want|Page fit signals|We believe video generation pages/);
```

Call `checkVideoGeneration()` before the final error block.

Run:

```bash
cd web
node ./scripts/check-main-site-seo-p0.mjs
```

Expected: FAIL on missing localized fields, missing decision facts, and forbidden
editorial copy.

- [ ] **Step 2: Expand the typed content contract**

Keep current metadata, breadcrumb, demo, FAQ, and action types. Change the model
and page presentation types to:

```ts
type VideoGenerationModel = {
  modelId: string;
  name: string;
  href: string;
  modes: string;
  cost: string;
  bestFor: string;
  tradeoff: string;
};

type VideoGenerationFitSignal = { label: string; body: string };
type VideoGenerationFailure = { title: string; body: string };
type VideoGenerationInputMode = {
  title: string;
  body: string;
  mode: "text-to-video" | "image-to-video" | "edit-video";
  limitation: string;
};
```

Add these fields to `VideoGenerationPageContent`:

```ts
hero: {
  title: string;
  accentTitle: string;
  modeLines: readonly [string, string];
  intro: string;
  summaryLabel: string;
  summaryText: string;
};
heroActions: readonly VideoGenerationNextAction[];
demoCallout: { title: string; body: string };
positioning: { lines: readonly [string, string]; summary: string };
contrast: { before: string; after: string };
proofPoints: readonly string[];
inputModesTitle: string;
inputModes: readonly VideoGenerationInputMode[];
variableCostLabel: string;
timingNote: string;
usageIntro: string;
workflowStatement: string;
fitSignalsTitle: string;
fitSignals: readonly VideoGenerationFitSignal[];
failuresTitle: string;
failureItems: readonly VideoGenerationFailure[];
final: { title: string; body: string };
```

Extend each existing localized `decisionCard` with a stable `modelId` and a
localized `tradeoff`. Use the four current featured decisions only:

```ts
type VideoGenerationCard = {
  modelId:
    | "gemini-omni-flash-preview"
    | "seedance-2"
    | "kling-3.0"
    | "veo-3.1";
  eyebrow: string;
  title: string;
  href: string;
  body: string;
  tradeoff: string;
};
```

Remove the four dead static `models` arrays; the returned `models` value is
derived from the four localized decision cards and central catalog facts.
Remove `models` from `VideoGenerationPageContent`; it exists only on the
`VideoGenerationPageData` returned by `getVideoGenerationPageData`.

- [ ] **Step 3: Derive the four model rows from the central catalog**

```ts
const VARIABLE_CATALOG_COST = "Varies by catalog pricing";

function getDecisionModels(
  cards: readonly VideoGenerationCard[],
  variableCostLabel: string,
): VideoGenerationModel[] {
  const catalogById = new Map(
    getCatalogModelsByCapability("video").map((model) => [model.modelId, model]),
  );

  return cards.map((card) => {
    const model = catalogById.get(card.modelId);
    if (!model) throw new Error(`Missing active video catalog model: ${card.modelId}`);

    return {
      modelId: model.modelId,
      name: model.displayName,
      href: model.path,
      modes: model.modes.join(", "),
      cost:
        model.creditEstimate === VARIABLE_CATALOG_COST
          ? variableCostLabel
          : model.creditEstimate,
      bestFor: card.body,
      tradeoff: card.tradeoff,
    };
  });
}
```

In `getVideoGenerationPageData(locale)`, return:

```ts
models: getDecisionModels(content.decisionCards, content.variableCostLabel),
inputModes: getAvailableInputModes(content.inputModes),
```

This keeps modes and costs centralized while allowing localized decision copy.
Present these as featured decisions, not an exhaustive availability list. The
page must direct agents to `anycap video models` for the full live inventory,
and FAQ copy must not hard-code a supposedly complete model list.

Add the mode filter so existing-footage guidance cannot outlive catalog
support:

```ts
function getAvailableInputModes(
  inputModes: readonly VideoGenerationInputMode[],
): readonly VideoGenerationInputMode[] {
  const availableModes = new Set(
    getCatalogModelsByCapability("video").flatMap((model) => model.modes),
  );
  return inputModes.filter((item) => availableModes.has(item.mode));
}
```

- [ ] **Step 4: Complete all four locale presentations**

For every locale, add three input modes in this order:

1. text brief / `text-to-video` / not appropriate when an exact source frame must be preserved;
2. reference image / `image-to-video` / requires a supported model and a prepared source still;
3. existing footage / `edit-video` / available only when the selected live model exposes that mode.

Add these four failure meanings in every locale:

1. selected model does not expose the requested mode — run `anycap video models <model-id> schema --operation generate --mode <mode>`;
2. a local reference parameter is missing or uses the wrong schema key — inspect the live schema and use `--param images=...` or `--param videos=...` only when declared;
3. the job succeeds but the local download fails — use the returned URL/request ID and retry delivery rather than resubmitting blindly;
4. output does not match the brief — review the clip, tighten motion/camera/subject instructions, and retry without claiming deterministic frames.

Use these localized variable-cost labels:

- `en`: `Varies by catalog pricing`
- `pt-br`: `Varia conforme a precificação do catálogo`
- `id`: `Bervariasi sesuai harga katalog`
- `de`: `Variiert je nach Katalogpreis`

Add a localized `timingNote` with this exact meaning: generation time varies by
model, queue state, duration, and settings; the CLI waits for server-side
completion and returns the result when the command finishes; no fixed latency
is promised.

Use sentence case for all new copy. Set all locale primary actions to `/start`,
and make the related cards exactly the P0 links to `/for/codex`,
`/capabilities/video-analysis`, and
`/guides/how-to-add-video-generation-to-ai-agent`.

Set the four featured model trade-offs to these meanings and translate them in
each locale object:

- Gemini Omni Flash Preview: edits existing footage only; use a generation model for a new clip.
- Seedance 2.0: choose the Fast variant when turnaround matters more than peak quality.
- Kling 3.0: choose a lower-cost/faster model when preview speed matters more than cinematic motion.
- Veo 3.1: choose Veo 3.1 Fast when iteration speed matters more than maximum polish.

Set `LAST_UPDATED_ISO = "2026-07-11"`, preserve a TechArticle publication date
of `2026-04-05`, and update each localized visible last-updated label.

- [ ] **Step 5: Render only localized page data**

Delete the module-level `proofPoints` and `fitSignals`. Replace every visible
literal in the custom view with its `content` field. Remove the trending and
search-intent blocks entirely. Render:

- localized hero/action/demo callout;
- localized positioning and sentence-case contrast;
- `content.proofPoints`;
- the three `content.inputModes` before model decisions;
- a five-column model table: model, modes, cost, best fit, trade-off;
- `content.timingNote` beside the decision table without a numeric duration;
- `content.usageIntro` and existing real CLI examples;
- localized workflow/fit signals;
- the four localized failure items;
- P0 related cards;
- localized final title/body/actions.

The table header type becomes:

```ts
tableHeaders: {
  model: string;
  modes: string;
  cost: string;
  bestFit: string;
  tradeoff: string;
};
```

- [ ] **Step 6: Run the page contract and typecheck**

```bash
cd web
node ./scripts/check-main-site-seo-p0.mjs
pnpm exec tsc --noEmit
```

Expected: PASS with no forbidden editorial strings and no missing locale field.

- [ ] **Step 7: Commit the authority page**

```bash
git add web/scripts/check-main-site-seo-p0.mjs \
  'web/src/app/(seo)/capabilities/video-generation/content.ts' \
  'web/src/app/(seo)/capabilities/video-generation/VideoGenerationPageView.tsx'
git commit -m "feat(web): strengthen video generation proof"
```

---

### Task 5: Localize and substantiate video analysis

**Files:**

- Modify: `web/scripts/check-main-site-seo-p0.mjs`
- Modify: `web/src/components/seo/CapabilityDetailPage.tsx`
- Modify: `web/src/app/(seo)/capabilities/video-analysis/content.ts`
- Modify: `web/src/app/(seo)/capabilities/video-analysis/page.tsx`

**Interfaces:**

- Adds optional `chrome?: CapabilityDetailChrome` to the shared component; all other callers retain the existing English fallback.
- Moves P0 schema construction into `getVideoAnalysisPageData(locale)`.
- Preserves `getVideoAnalysisMetadata(locale)` and the generated localized wrapper behavior.

- [ ] **Step 1: Extend the P0 contract and confirm RED**

Require `content.chrome`, `content.responseExample`, locale-aware schema, and the
three P0 links. Forbid page-level English literals:

```js
forbidPattern("video analysis page", page, /Last updated April 13, 2026|Read the recording|The short answer|Let your agent understand video/);
requireTokens("video analysis content", content, [
  "responseExample",
  "capabilityGuideJsonLd",
  "locale,",
  '"/for/codex"',
  '"/capabilities/video-generation"',
  '"/guides/how-to-add-video-generation-to-ai-agent"',
]);
requireTokens("capability detail chrome", sharedView, [
  "chrome.searchIntentLabel",
  "chrome.positioningLines",
  "chrome.positioningSummary",
]);
```

Run the script and expect failure on current hard-coded copy.

- [ ] **Step 2: Add optional localized shared chrome**

In `CapabilityDetailPage.tsx`:

```ts
export type CapabilityDetailChrome = {
  searchIntentLabel: string;
  positioningLines: readonly [string, string];
  positioningSummary: string;
};

const defaultCapabilityDetailChrome: CapabilityDetailChrome = {
  searchIntentLabel: "Search intent",
  positioningLines: [
    "Agents do not need another disconnected tool.",
    "They need the capability inside the workflow.",
  ],
  positioningSummary: "AnyCap turns capability access into agent action.",
};
```

Add `chrome?: CapabilityDetailChrome` to `CapabilityDetailPageProps`, default it
in the component destructuring, and render `chrome.searchIntentLabel`,
`chrome.positioningLines[0]`, `chrome.positioningLines[1]`, and
`chrome.positioningSummary`. Do not modify the other eight callers.

- [ ] **Step 3: Move all analysis presentation into typed locale content**

Rename the internal type to `VideoAnalysisPageContent` and add:

```ts
metadata: {
  title: string;
  description: string;
  openGraphTitle: string;
  openGraphDescription: string;
  articleHeadline: string;
  articleDescription: string;
  articleAbout: readonly string[];
  articleKeywords: readonly string[];
};
lastUpdatedLabel: string;
accentTitle: string;
chrome: CapabilityDetailChrome;
searchIntents: readonly string[];
demoTitle: string;
demoBody: string;
proofPoints: readonly string[];
summaryLabel: string;
summaryText: string;
workflowTitle: string;
workflowSteps: readonly CapabilityWorkflowStep[];
responseExample: { title: string; code: string };
finalTitle: string;
finalBody: string;
```

Import the shared types without creating runtime coupling:

```ts
import type {
  CapabilityDetailChrome,
  CapabilityWorkflowStep,
} from "@/components/seo/CapabilityDetailPage";
```

Use `Common tasks`, `Tarefas comuns`, `Tugas umum`, and `Häufige Aufgaben` as
the four `chrome.searchIntentLabel` values. Translate the two positioning lines,
positioning summary, demo, proof, summary, workflow, and final copy in each
locale object. Commands and JSON keys remain literal.

Use this exact response shape in every locale's `responseExample.code`:

```json
{
  "status": "success",
  "content": "The recording shows the checkout modal clipping its submit button on a narrow viewport.",
  "credit_cost": 10,
  "request_id": "req_abc123"
}
```

Localize the example `content` sentence for `pt-br`, `id`, and `de`; retain the
same JSON keys. Add the response example to `usageExamples` when passing props,
so the existing code-block renderer shows the truthful envelope.

Set related pages exactly to `/for/codex`, `/capabilities/video-generation`,
and `/guides/how-to-add-video-generation-to-ai-agent`. Set the primary CTA to
`/start`. Keep quality review, content extraction, and workflow checkpoint as
the three explicit use-case meanings.

- [ ] **Step 4: Move schema creation into the locale-aware data factory**

Add:

```ts
const VIDEO_ANALYSIS_DATE_PUBLISHED = "2026-04-13";
const VIDEO_ANALYSIS_DATE_MODIFIED = "2026-07-11";
```

Return from `getVideoAnalysisPageData(locale)`:

```ts
return {
  ...content,
  capabilityGuideJsonLd: createTechArticleJsonLd({
    headline: content.metadata.articleHeadline,
    description: content.metadata.articleDescription,
    path: VIDEO_ANALYSIS_PATH,
    locale,
    about: [...content.metadata.articleAbout],
    keywords: [...content.metadata.articleKeywords],
    datePublished: VIDEO_ANALYSIS_DATE_PUBLISHED,
    dateModified: VIDEO_ANALYSIS_DATE_MODIFIED,
  }),
  faqJsonLd: createFaqPageJsonLd(content.faqItems),
};
```

Remove schema construction and all presentation literals from `page.tsx`; pass
only `content.*` fields into `CapabilityDetailPage`. Continue mapping actions
and scenarios in transport-like page code.

- [ ] **Step 5: Run contracts and typecheck**

```bash
cd web
node ./scripts/check-main-site-seo-p0.mjs
pnpm exec tsc --noEmit
```

Expected: PASS; all four locale objects satisfy the expanded content type.

- [ ] **Step 6: Commit video analysis**

```bash
git add web/scripts/check-main-site-seo-p0.mjs \
  web/src/components/seo/CapabilityDetailPage.tsx \
  'web/src/app/(seo)/capabilities/video-analysis/content.ts' \
  'web/src/app/(seo)/capabilities/video-analysis/page.tsx'
git commit -m "fix(web): localize video analysis proof"
```

---

### Task 6: Refactor the evergreen video guide around source decisions

**Files:**

- Create: `web/src/app/(seo)/guides/how-to-add-video-generation-to-ai-agent/content.ts`
- Modify: `web/scripts/check-main-site-seo-p0.mjs`
- Modify: `web/src/app/(seo)/guides/how-to-add-video-generation-to-ai-agent/page.tsx`
- Modify: `web/src/app/(seo)/guides/how-to-add-video-generation-to-ai-agent/metadata.ts`

**Interfaces:**

- Produces from `content.ts`: `VIDEO_AGENT_GUIDE_PATH` and `getVideoGuidePageData(locale)`.
- Keeps the renderer page-specific; no new card component or per-locale files.
- Consumes: `getCatalogModelsByCapability("video")` only to determine whether an edit-video path is currently available.

- [ ] **Step 1: Extend the guide contract and confirm RED**

Require the source decisions, three setup targets, three P0 body links, locale
factory, and absence of inline locale ternaries:

```js
requireTokens("video guide content", content, [
  '"text"', '"image"', '"footage"',
  '"claude-code"', '"cursor"', '"codex"',
  "--operation generate --mode text-to-video",
  "--operation generate --mode image-to-video",
  'modes.includes("edit-video")',
  '"/for/codex"',
  '"/capabilities/video-generation"',
  '"/capabilities/video-analysis"',
]);
requireTokens("video guide page", page, [
  "getVideoGuidePageData(locale)",
  "content.sourceDecision.items.map",
  "content.setupMatrix.rows.map",
  "content.relatedP0.links.map",
  "content.faqItems.map",
]);
forbidPattern("video guide page", page, /const localized(?:FaqItems|Copy)\s*=/);
forbidPattern("video guide", `${content}\n${page}`, /polls until|keep polling|polling loop/i);
```

Run the script and expect failure before the new content module exists.

- [ ] **Step 2: Extract typed content and facts into `content.ts`**

Move the current `PageContent`, four locale objects, localized FAQ, and
localized step copy out of `page.tsx`. Use these exact keys:

```ts
type SourcePathKey = "text" | "image" | "footage";
type SetupTargetKey = "claude-code" | "cursor" | "codex";
type RelatedP0Key = "codex" | "video-generation" | "video-analysis";

type SourceDecisionCopy = {
  title: string;
  body: string;
  fit: string;
  limitation: string;
};

type SourceDecisionFact = {
  key: SourcePathKey;
  mode: "text-to-video" | "image-to-video" | "edit-video";
  schemaCommand: string;
  generateCommand: string;
};

type SourceDecisionItem = SourceDecisionFact & SourceDecisionCopy;

type RelatedP0Link = {
  key: RelatedP0Key;
  label: string;
  href:
    | "/for/codex"
    | "/capabilities/video-generation"
    | "/capabilities/video-analysis";
};

type SetupTarget = {
  key: SetupTargetKey;
  agent: "Claude Code" | "Cursor" | "Codex";
  command: string;
};
```

Add to `PageContent`:

```ts
article: { headline: string; description: string };
sourceDecision: {
  eyebrow: string;
  title: string;
  intro: string;
  items: Record<SourcePathKey, SourceDecisionCopy>;
};
setupMatrix: {
  title: string;
  description: string;
  agentHeader: string;
  commandHeader: string;
};
stepCopy: {
  skillBody: string;
  cliBody: string;
  loginBody: string;
  discoverBody: string;
  schemaBody: string;
  firstVideoBody: string;
  workflowBody: string;
  workflowFooter: string;
};
resultExample: { title: string; description: string; outputLabel: string };
relatedP0: {
  title: string;
  description: string;
  labels: Record<RelatedP0Key, string>;
};
faqItems: readonly { question: string; answer: string }[];
```

Define the merged return type so the renderer never sees locale-copy records:

```ts
export type VideoGuidePageData = Omit<
  PageContent,
  "sourceDecision" | "setupMatrix" | "relatedP0"
> & {
  sourceDecision: Omit<PageContent["sourceDecision"], "items"> & {
    items: readonly SourceDecisionItem[];
  };
  setupMatrix: PageContent["setupMatrix"] & {
    rows: readonly SetupTarget[];
  };
  relatedP0: Omit<PageContent["relatedP0"], "labels"> & {
    links: readonly RelatedP0Link[];
  };
  guideJsonLd: Record<string, unknown>;
};

export function getVideoGuidePageData(
  locale: SiteLocale,
): VideoGuidePageData;
```

The content map must be `Record<SiteLocale, PageContent>`. Portuguese receives
its own step copy and FAQ instead of falling through to English. Existing intro,
needs, prompt, use-case, and mistake copy moves unchanged except every manual
polling statement becomes synchronous CLI wording: the CLI waits for the
server-side job and returns a flat JSON result when the command completes.

- [ ] **Step 3: Add immutable setup and source facts**

```ts
const SETUP_TARGETS: readonly SetupTarget[] = [
  { key: "claude-code", agent: "Claude Code", command: "npx -y skills add anycap-ai/anycap -a claude-code -y" },
  { key: "cursor", agent: "Cursor", command: "npx -y skills add anycap-ai/anycap -a cursor -y" },
  { key: "codex", agent: "Codex", command: "npx -y skills add anycap-ai/anycap -a codex -y" },
];

const SOURCE_FACTS: Record<SourcePathKey, SourceDecisionFact> = {
  text: {
    key: "text",
    mode: "text-to-video",
    schemaCommand: "anycap video models <model-id> schema --operation generate --mode text-to-video",
    generateCommand: 'anycap video generate --model <model-id> --mode text-to-video --prompt "a short product walkthrough" -o product-walkthrough.mp4',
  },
  image: {
    key: "image",
    mode: "image-to-video",
    schemaCommand: "anycap video models <model-id> schema --operation generate --mode image-to-video",
    generateCommand: 'anycap video generate --model <model-id> --mode image-to-video --prompt "animate this still with subtle camera movement" --param images=./source.png -o animated-source.mp4',
  },
  footage: {
    key: "footage",
    mode: "edit-video",
    schemaCommand: "anycap video models <edit-model-id> schema --operation generate --mode edit-video",
    generateCommand: 'anycap video generate --model <edit-model-id> --mode edit-video --prompt "brighten the scene while preserving the subject and camera motion" --param videos=./source.mp4 -o edited-source.mp4',
  },
};
```

Build source items in `getVideoGuidePageData(locale)`. Include `footage` only
when a current catalog model has `modes.includes("edit-video")`; the current
catalog therefore renders all three.

Build related links from fixed href facts:

```ts
const RELATED_P0_FACTS = {
  codex: "/for/codex",
  "video-generation": "/capabilities/video-generation",
  "video-analysis": "/capabilities/video-analysis",
} as const;
```

- [ ] **Step 4: Build localized guide JSON-LD and metadata**

`getVideoGuidePageData(locale)` returns `guideJsonLd` from:

```ts
createTechArticleJsonLd({
  headline: content.article.headline,
  description: content.article.description,
  path: VIDEO_AGENT_GUIDE_PATH,
  locale,
  about: ["AI agent video generation", "AnyCap CLI", "video workflows"],
  keywords: [
    "how to add video generation to ai agent",
    "ai agent video generation",
    "image to video agent workflow",
    "anycap video generate",
  ],
  datePublished: "2026-04-14",
  dateModified: "2026-07-11",
});
```

In `metadata.ts`, import `VIDEO_AGENT_GUIDE_PATH` from `./content` and use a
complete `Record<SiteLocale, { title: string; description: string }>` map. Do
not redeclare the path. The German entry is:

```ts
de: {
  title: "Videogenerierung zu einem KI-Agenten hinzufügen — Einrichtungsanleitung",
  description:
    "Schritt-für-Schritt-Anleitung für Videogenerierung in Claude Code, Cursor, Codex und anderen KI-Agenten mit AnyCap CLI, Modellsuche und Workflow-Beispielen.",
}
```

For every locale, pass title/description and an article Open Graph object into
`createLocalizedMetadataForPath`.

- [ ] **Step 5: Reduce `page.tsx` to localized rendering**

Replace the inline locale branching with:

```ts
const locale = await getRequestLocale();
const content = getVideoGuidePageData(locale);
```

Render `content.guideJsonLd`. Insert the source-decision cards after the callout,
render three setup rows from `content.setupMatrix.rows`, add schema discovery
before generation, show a flat generation result after the first command, and
render `content.relatedP0.links` immediately after the end-to-end workflow.
Render `content.faqItems`; delete `localizedFaqItems`, `localizedCopy`, and the
module-global English JSON-LD.

The result example uses these literal JSON keys:

```json
{
  "status": "success",
  "local_path": "/workspace/product-walkthrough.mp4",
  "model": "<model-id>",
  "credits_used": 20,
  "request_id": "req_abc123"
}
```

Surrounding localized result copy must state that `credits_used: 20` is an
illustrative total and actual credits vary by model, duration, and settings.

- [ ] **Step 6: Run the guide contract and typecheck**

```bash
cd web
node ./scripts/check-main-site-seo-p0.mjs
pnpm exec tsc --noEmit
```

Expected: PASS with no manual-polling language or inline locale fallback.

- [ ] **Step 7: Commit the evergreen guide**

```bash
git add web/scripts/check-main-site-seo-p0.mjs \
  'web/src/app/(seo)/guides/how-to-add-video-generation-to-ai-agent/content.ts' \
  'web/src/app/(seo)/guides/how-to-add-video-generation-to-ai-agent/page.tsx' \
  'web/src/app/(seo)/guides/how-to-add-video-generation-to-ai-agent/metadata.ts'
git commit -m "feat(web): rebuild evergreen video agent guide"
```

---

### Task 7: Gate, document, and verify the integrated P0 cluster

**Files:**

- Modify: `web/package.json`
- Regenerate: `web/src/generated/seo-route-manifest.json`
- Regenerate: `web/src/generated/sitemap-lastmod.json`
- Create: `web/docs/seo/change-log/2026-07-11-main-site-seo-p0.md`

**Interfaces:**

- Produces package scripts `test:seo-foundation`, `check:seo-p0-locales`, `check:seo-p0-contracts`, and `check:seo-p0`.
- Adds the aggregate P0 gate to both build chains without otherwise changing deployment behavior.

- [ ] **Step 1: Add exact package scripts**

Add:

```json
"test:seo-foundation": "node --test ./scripts/check-seo-locale-rollout.test.mjs ./scripts/generate-sitemap-lastmod.test.mjs",
"check:seo-p0-locales": "node ./scripts/check-seo-locale-rollout.mjs --locales=pt-br,id,de --paths=/for/codex,/capabilities/video-generation,/capabilities/video-analysis,/guides/how-to-add-video-generation-to-ai-agent --strict",
"check:seo-p0-contracts": "node ./scripts/check-main-site-seo-p0.mjs",
"check:seo-p0": "pnpm run test:seo-foundation && pnpm run check:seo-p0-locales && pnpm run check:seo-p0-contracts"
```

Insert `pnpm run check:seo-p0` into `build` and `build:cf` immediately before
`pnpm run generate:sitemap-lastmod`. Do not run `build:cf`.

- [ ] **Step 2: Run focused CLI truth tests**

From repository root:

```bash
go test ./internal/cli/command ./internal/cli/output \
  -run 'Test(VideoModels|VideoModelSchema|VideoGenerate|VideoRead|WriteServerContent)' \
  -count=1
```

Expected: PASS. These names match the existing CLI and output test suites.

- [ ] **Step 3: Run generated-route synchronization and all focused gates**

```bash
cd web
pnpm run sync:seo-locales
pnpm run check:seo-p0
pnpm run check:edge-runtime
pnpm run check:seo-breadcrumbs
pnpm run check:seo-ia
pnpm run check:seo-locale-rollout
pnpm run check:seo-hub-locale-rollout
pnpm exec tsc --noEmit
pnpm run generate:sitemap-lastmod
```

Expected: all commands exit 0. Review generated diffs. Localized wrapper changes
must be generator-produced and semantically limited to imports/sync; route
manifest route count must not change.

- [ ] **Step 4: Run the production build**

```bash
pnpm run build
```

Expected: Next.js production build succeeds after rerunning the same SEO gates.

- [ ] **Step 5: Write the SEO changelog with actual evidence**

Create `web/docs/seo/change-log/2026-07-11-main-site-seo-p0.md` with:

```markdown
# Main-site Codex × video P0

## Changed

- Rebuilt `/for/codex` around generate-video, image-to-video, and analyze-video tasks.
- Added catalog-backed modes, cost guidance, limitations, and failure recovery to video generation.
- Localized video-analysis proof and exposed the real `video-read` response envelope.
- Reworked the evergreen video guide around text, image, and existing-footage sources.
- Added contextual body links among all four P0 pages in en, pt-br, id, and de.
- Added strict P0 locale/content contracts and dependency-aware sitemap dates.

## Product facts used

- Generation: `anycap video generate`
- Analysis: `anycap actions video-read`
- Model discovery: `anycap video models` and live schema discovery
- Video-read output: `status`, `content`, optional `credit_cost`, and `request_id`

## Verification

- Focused CLI tests: passed
- SEO foundation tests: passed
- P0 locale and content contracts: passed
- Existing SEO checks: passed
- TypeScript: passed
- Production build: passed

## Measurement boundary

This release improves product evidence and conversion paths. It does not claim installation, activation, or revenue attribution before product analytics is connected.
```

- [ ] **Step 6: Check the final diff and commit integration artifacts**

```bash
cd ..
git diff --check
git status --short
git diff --stat
git diff -- web/src/generated/seo-route-manifest.json
git diff -- web/src/generated/sitemap-lastmod.json
```

Expected: no whitespace errors, no `anycap.ai-audit/` staging, no public-route
addition/removal, and only expected generated changes.

```bash
git add web/package.json \
  web/src/generated/seo-route-manifest.json \
  web/src/generated/sitemap-lastmod.json \
  web/docs/seo/change-log/2026-07-11-main-site-seo-p0.md
git commit -m "build(web): gate main-site SEO P0"
```

If `seo-route-manifest.json` is unchanged, omit it from `git add`.

---

## Controller-Only Final Verification And Preview

Run this only after every task review is clean and the final whole-branch code
review has no Critical or Important findings.

- [ ] Start the production server in a persistent session:

```bash
cd web
pnpm run start -- -H 127.0.0.1 -p 3000
```

Expected: server remains available at `http://127.0.0.1:3000`.

- [ ] Smoke-test every P0 locale route:

```bash
for locale in '' '/pt-br' '/id' '/de'; do
  for route in \
    '/for/codex' \
    '/capabilities/video-generation' \
    '/capabilities/video-analysis' \
    '/guides/how-to-add-video-generation-to-ai-agent'; do
    curl -fsS "http://127.0.0.1:3000${locale}${route}" >/dev/null
  done
done
curl -fsS http://127.0.0.1:3000/robots.txt >/dev/null
curl -fsS http://127.0.0.1:3000/sitemap.xml >/dev/null
curl -fsS http://127.0.0.1:3000/llms.txt >/dev/null
```

Expected: every request returns success.

- [ ] Use the `browser:control-in-app-browser` skill to inspect English and all
  three localized variants at desktop and mobile widths. Verify:

  - three Codex task cards;
  - video-generation input modes, four model decisions, cost/trade-off columns,
    limitations, and failure recovery;
  - video-analysis response envelope and downstream actions;
  - guide source decisions and three-agent setup matrix;
  - contextual links to the other three P0 pages;
  - localized title/H1/chrome/CTA/final copy;
  - no internal SEO/editorial language, manual-polling instruction, stale read
    command, horizontal overflow, clipped table, or empty JSON-LD.

- [ ] Leave the production preview running and navigate the in-app browser to:

```text
http://127.0.0.1:3000/for/codex
```

This browser-visible preview is a required user handoff, not an optional smoke
check.
