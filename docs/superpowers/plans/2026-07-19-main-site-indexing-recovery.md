# Main-Site Indexing Recovery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> `superpowers:subagent-driven-development` to implement this plan task by task.
> Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make main-site metadata available in the initial HTML `<head>` for every
crawler and replace the stale Kling guide soft-404 with a permanent redirect to
the maintained video-agent guide.

**Architecture:** Keep the existing App Router pages, locale rewrites, and public
route inventory. Disable Next.js streaming metadata through its supported
`htmlLimitedBots` setting, extract legacy redirects into a small pure module that
middleware consumes, and enforce both behaviors with Node tests included in the
existing SEO foundation/build gate. Verify the built server at the HTTP/HTML
boundary before recording evidence.

**Tech Stack:** Next.js 15.5, React 19, TypeScript 5, Node.js `node:test`, pnpm.

## Global Constraints

- Scope is the AnyCap main site only. Do not modify hosted-site `/page/**`
  behavior, hosted content, or hosted-site SEO.
- Do not change landing-page copy or `web/src/lib/landing-content.ts`.
- Do not add or remove an indexed public route or a sitemap entry.
- Preserve query strings and locale prefixes when redirecting legacy routes.
- The stale `/guides/how-to-use-kling-in-ai-agent` URL must permanently redirect
  to `/guides/how-to-add-video-generation-to-ai-agent`.
- The initial HTTP response must place title, robots, canonical, and hreflang
  metadata before `</head>` for normal browsers and Googlebot. Do not rely on
  client-side DOM repair.
- Add focused tests to `test:seo-foundation`, which is already executed by both
  production build chains.
- Do not run `pnpm run build:cf`; it publishes IndexNow.
- Do not deploy, push, or submit URLs to Google Search Console.
- Work only in the existing isolated `codex/seo-main-site-p0` worktree. Starting
  commit for this addendum: `b737f5bad779ea069f4d83811254a25cd305e57c`.

## File Map

**Create**

- `web/scripts/next-metadata-head.test.mjs`
- `web/scripts/legacy-route-redirects.test.mjs`
- `web/src/lib/legacy-route-redirects.ts`
- `web/docs/seo/change-log/2026-07-19-main-site-indexing-recovery.md`

**Modify**

- `web/next.config.ts`
- `web/package.json`
- `web/src/middleware.ts`

---

### Task 8: Disable streamed metadata and lock the Next.js configuration

**Files:**

- Create: `web/scripts/next-metadata-head.test.mjs`
- Modify: `web/next.config.ts`
- Modify: `web/package.json`

**Behavior:**

- `nextConfig.htmlLimitedBots` is a `RegExp` that matches every non-empty user
  agent, which makes Next.js wait for metadata and emit it in `<head>`.
- The regression test is part of `pnpm run test:seo-foundation`.

- [ ] **Step 1: Write the failing configuration test**

Create `web/scripts/next-metadata-head.test.mjs`:

```js
import assert from "node:assert/strict";
import test from "node:test";

import nextConfig from "../next.config.ts";

test("blocks streamed metadata for browsers and Googlebot", () => {
  assert.ok(nextConfig.htmlLimitedBots instanceof RegExp);
  assert.equal(
    nextConfig.htmlLimitedBots.test(
      "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    ),
    true,
  );
  assert.equal(
    nextConfig.htmlLimitedBots.test(
      "Mozilla/5.0 AppleWebKit/537.36 Chrome/136.0 Safari/537.36",
    ),
    true,
  );
});
```

- [ ] **Step 2: Run the focused test and confirm RED**

```bash
cd web
node --test ./scripts/next-metadata-head.test.mjs
```

Expected: FAIL because `htmlLimitedBots` is undefined.

- [ ] **Step 3: Configure blocking metadata for every user agent**

Add this top-level property to `nextConfig` in `web/next.config.ts`, with a short
comment explaining the crawler-facing reason:

```ts
htmlLimitedBots: /.*/,
```

This is the supported Next.js opt-out from streaming metadata. The installed
Next.js implementation creates a blocking-user-agent regex from this setting;
when it matches, metadata is awaited before the HTML head closes.

- [ ] **Step 4: Add the test to the SEO foundation gate and confirm GREEN**

Append `./scripts/next-metadata-head.test.mjs` to the files passed to `node
--test` by `test:seo-foundation` in `web/package.json`, then run:

```bash
cd web
node --test ./scripts/next-metadata-head.test.mjs
pnpm run test:seo-foundation
pnpm exec tsc --noEmit --incremental false
```

Expected: the focused test, the complete SEO foundation suite, and TypeScript
all pass.

- [ ] **Step 5: Commit the metadata fix**

```bash
git add web/next.config.ts web/package.json \
  web/scripts/next-metadata-head.test.mjs
git commit -m "fix(web): keep SEO metadata in document head"
```

---

### Task 9: Permanently redirect the stale Kling guide

**Files:**

- Create: `web/src/lib/legacy-route-redirects.ts`
- Create: `web/scripts/legacy-route-redirects.test.mjs`
- Modify: `web/src/middleware.ts`
- Modify: `web/package.json`

**Behavior:**

- The three existing legacy redirects keep their exact destinations.
- `/guides/how-to-use-kling-in-ai-agent` maps to the maintained guide.
- Middleware continues to issue status 308 after localizing the destination and
  preserves the original query string through its cloned URL.

- [ ] **Step 1: Write the failing redirect contract**

Create `web/scripts/legacy-route-redirects.test.mjs`:

```js
import assert from "node:assert/strict";
import test from "node:test";

import { legacyRouteRedirects } from "../src/lib/legacy-route-redirects.ts";

test("redirects the stale Kling guide to the maintained video-agent guide", () => {
  assert.equal(
    legacyRouteRedirects.get("/guides/how-to-use-kling-in-ai-agent"),
    "/guides/how-to-add-video-generation-to-ai-agent",
  );
});

test("preserves the existing legacy redirect contracts", () => {
  assert.deepEqual(
    [...legacyRouteRedirects],
    [
      ["/for-human", "/"],
      ["/capabilities/image-read", "/capabilities/image-understanding"],
      ["/glossary/agent-capability-runtime", "/glossary/agent-harness"],
      [
        "/guides/how-to-use-kling-in-ai-agent",
        "/guides/how-to-add-video-generation-to-ai-agent",
      ],
    ],
  );
});
```

- [ ] **Step 2: Run the focused test and confirm RED**

```bash
cd web
node --test ./scripts/legacy-route-redirects.test.mjs
```

Expected: FAIL because the pure redirect module does not exist.

- [ ] **Step 3: Extract and extend the redirect map**

Create `web/src/lib/legacy-route-redirects.ts` with the four-entry exported map.
Remove the local map from `web/src/middleware.ts` and import the exported map
from `@/lib/legacy-route-redirects`. Do not alter the existing middleware order,
308 status, localization call, or URL-cloning behavior.

- [ ] **Step 4: Add the test to the SEO foundation gate and confirm GREEN**

Append `./scripts/legacy-route-redirects.test.mjs` to `test:seo-foundation`, then
run:

```bash
cd web
node --test ./scripts/legacy-route-redirects.test.mjs
pnpm run test:seo-foundation
pnpm run check:edge-runtime
pnpm exec tsc --noEmit --incremental false
```

Expected: all commands pass.

- [ ] **Step 5: Commit the redirect fix**

```bash
git add web/src/lib/legacy-route-redirects.ts \
  web/src/middleware.ts web/package.json \
  web/scripts/legacy-route-redirects.test.mjs
git commit -m "fix(web): redirect stale Kling guide"
```

---

### Task 10: Verify the built HTTP behavior and record evidence

**Files:**

- Create: `web/docs/seo/change-log/2026-07-19-main-site-indexing-recovery.md`

**Verification matrix:**

- Existing P0 SEO tests and source contracts.
- Edge-runtime check and non-incremental TypeScript check.
- Full `pnpm run build` without IndexNow publication.
- Built-server HTML for `/`, `/for/codex`, `/for/claude-code`, and
  `/compare/fal-ai-vs-replicate`, using browser and Googlebot user agents.
- 308 redirects for the default-locale and `/de` Kling legacy URLs, including a
  request with a query string.

- [ ] **Step 1: Run the full static and build gates**

```bash
cd web
pnpm run check:seo-p0
pnpm run check:edge-runtime
pnpm exec tsc --noEmit --incremental false
pnpm run build
```

Expected: every command exits 0. Record route and sitemap counts emitted by the
checks/build. Existing non-fatal Next/Auth0 warnings may be documented but must
not be described as failures.

- [ ] **Step 2: Start the built server and verify metadata placement**

Start `pnpm start -- --hostname 127.0.0.1 -p 3137` and request each path in the
verification matrix with a current browser UA and Googlebot UA. For every 200
response, assert that `<title>`, robots, canonical, and hreflang occur before
`</head>` and that none of those tags occurs between `</head>` and `<body>`.

- [ ] **Step 3: Verify permanent redirects**

Request:

```text
/guides/how-to-use-kling-in-ai-agent?source=gsc
/de/guides/how-to-use-kling-in-ai-agent
```

Expected: both return 308. The first location is
`/guides/how-to-add-video-generation-to-ai-agent?source=gsc`; the second is
`/de/guides/how-to-add-video-generation-to-ai-agent`.

- [ ] **Step 4: Record measured evidence**

Create `web/docs/seo/change-log/2026-07-19-main-site-indexing-recovery.md` with:

- the two root causes and exact fixes;
- test/build commands and outcomes;
- HTTP metadata and redirect checks;
- the scope boundary (main site only, no hosted SEO changes);
- the measurement boundary: this improves crawl/indexing inputs but does not
  prove reindexing, ranking recovery, or traffic lift before deployment and GSC
  follow-up.

- [ ] **Step 5: Commit the verification record**

```bash
git add web/docs/seo/change-log/2026-07-19-main-site-indexing-recovery.md
git commit -m "docs(web): record main-site indexing recovery"
```

---

### Task 11: Make the Next.js Edge SSR handler honor `htmlLimitedBots`

> Added after Task 10 exposed a production-render mismatch. The installed
> Next.js 15.5.14 Node handler uses `shouldServeStreamingMetadata`, but its Edge
> SSR template hard-codes `serveStreamingMetadata: true`. Every public app route
> inherits `runtime = "edge"` for Cloudflare Pages, so the original Task 8
> configuration cannot affect the real route handler without this patch.

**Files:**

- Modify: `web/scripts/next-metadata-head.test.mjs`
- Modify: `web/package.json`
- Modify: `web/pnpm-lock.yaml`
- Create: `web/patches/next@15.5.14.patch`

**Behavior:**

- Both CommonJS and ESM copies of Next's `edge-ssr-app` build template read the
  request user agent once and call
  `shouldServeStreamingMetadata(userAgent, nextConfig.htmlLimitedBots)`.
- The template must not hard-code `serveStreamingMetadata: true`.
- The patch is installed deterministically through pnpm's
  `patchedDependencies`; do not edit checked-in application output or commit
  `node_modules`.

- [ ] **Step 1: Extend the focused test and confirm RED**

Update `web/scripts/next-metadata-head.test.mjs` to resolve the installed Next
package root and inspect both files:

```text
dist/build/templates/edge-ssr-app.js
dist/esm/build/templates/edge-ssr-app.js
```

For each file, assert that it contains a call to
`shouldServeStreamingMetadata` with `userAgent` and
`nextConfig.htmlLimitedBots`, and does not contain
`serveStreamingMetadata: true`. Keep the existing config/UA assertions.

Run:

```bash
cd web
node --test ./scripts/next-metadata-head.test.mjs
```

Expected: the existing config assertion passes and the new Edge-template
assertion fails because both installed templates hard-code `true`.

- [ ] **Step 2: Patch the installed Next.js templates through pnpm**

Create `web/patches/next@15.5.14.patch` with equivalent CommonJS and ESM
changes:

1. Import `shouldServeStreamingMetadata` from
   `../../server/lib/streaming-metadata`.
2. Store `req.headers.get('User-Agent') || ''` in `userAgent` and pass it to the
   existing `getBotType` call.
3. Replace `serveStreamingMetadata: true` with
   `shouldServeStreamingMetadata(userAgent, nextConfig.htmlLimitedBots)`.

Register the patch in `web/package.json` under `pnpm.patchedDependencies` and
refresh only the corresponding `web/pnpm-lock.yaml` patch metadata. Keep the
application's Next version and all unrelated dependencies unchanged.

- [ ] **Step 3: Reinstall and confirm the patch is reproducible**

Run a frozen install from `web/`, then confirm both installed template copies
contain the patched call and the focused test passes:

```bash
cd web
pnpm install --frozen-lockfile
node --test ./scripts/next-metadata-head.test.mjs
pnpm run test:seo-foundation
pnpm run check:edge-runtime
pnpm exec tsc --noEmit --incremental false
```

Expected: focused metadata tests, all SEO foundation tests, Edge runtime, and
TypeScript pass. `git diff --check` must also pass.

- [ ] **Step 4: Commit the Edge metadata fix**

```bash
git add web/scripts/next-metadata-head.test.mjs web/package.json \
  web/pnpm-lock.yaml web/patches/next@15.5.14.patch
git commit -m "fix(web): block streamed metadata in edge routes"
```

---

### Task 12: Re-run production and Cloudflare-oriented verification

**Files:**

- Create: `web/docs/seo/change-log/2026-07-19-main-site-indexing-recovery.md`

- [ ] **Step 1: Re-run the full static and production-build matrix**

Run the four Task 10 commands again. The failed Task 10 run is diagnostic
evidence, not completion evidence.

- [ ] **Step 2: Inspect the generated Edge route artifact**

After `pnpm run build`, inspect representative generated Edge page bundles for
the config-aware `shouldServeStreamingMetadata` call and confirm they no longer
hard-code `serveStreamingMetadata: true` in the render options.

- [ ] **Step 3: Re-run the exact built-server HTTP matrix**

Start the production server with the syntax supported by the installed pnpm:

```bash
pnpm start --hostname 127.0.0.1 -p 3137
```

Re-run every browser/Googlebot metadata assertion and both redirect assertions
from Task 10 with bounded request timeouts. Completion requires 8/8 metadata
responses and 2/2 redirects to pass. Stop the server and confirm the port is
clear.

- [ ] **Step 4: Verify the Cloudflare build without publishing IndexNow**

Run `node ./scripts/pages-build.mjs` directly. Do not run `build:cf`. Confirm the
build succeeds and a representative localized Edge function contains the
config-aware metadata-streaming decision. If a local Cloudflare Pages runtime
can be started without credentials or external state changes, repeat one
Googlebot head-placement request; otherwise record the artifact verification
boundary explicitly.

- [ ] **Step 5: Record and commit measured evidence**

Create the Task 10 changelog, adding the Edge-template root cause, the failed
first HTTP matrix, the package-patch rationale, successful replacement matrix,
Cloudflare build/artifact evidence, redirect evidence, warnings, scope, and
measurement boundaries. Commit only the changelog:

```bash
git add web/docs/seo/change-log/2026-07-19-main-site-indexing-recovery.md
git commit -m "docs(web): record main-site indexing recovery"
```

---

## Final Review and Handoff

- Generate a review package from `b737f5bad779ea069f4d83811254a25cd305e57c`
  through the Task 12 commit and dispatch a final whole-addendum reviewer.
- Fix and re-review every Critical or Important finding before completion.
- Re-run `pnpm run check:seo-p0`, `pnpm exec tsc --noEmit --incremental false`,
  `pnpm run build`, and the built-server HTTP assertions after review fixes.
- Confirm `git status --short` is empty.
- Do not merge, push, deploy, publish IndexNow, or request GSC indexing without
  explicit user authorization.
