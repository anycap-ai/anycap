# [SEO-20260719-1536] Main-site indexing recovery

- Time: 2026-07-19 15:36 Asia/Shanghai
- Node: `SEO-20260719-1536`
- Type: `change-log`
- Status: `done`
- Scope: AnyCap main site metadata delivery and one legacy guide redirect
- Related:
  - `docs/superpowers/plans/2026-07-19-main-site-indexing-recovery.md`
  - baseline `b737f5bad779ea069f4d83811254a25cd305e57c`
  - implementation commits `3b0760f0`, `785de03d`, and `0ca60bd7`
- Touched:
  - `web/next.config.ts`
  - `web/package.json`
  - `web/pnpm-lock.yaml`
  - `web/patches/next@15.5.14.patch`
  - `web/scripts/next-metadata-head.test.mjs`
  - `web/scripts/legacy-route-redirects.test.mjs`
  - `web/src/lib/legacy-route-redirects.ts`
  - `web/src/middleware.ts`

## Root causes and fixes

### Metadata left the initial document head

The main site uses Edge runtime App Router routes for Cloudflare Pages. Next.js
15.5.14's Edge SSR app template hard-coded
`serveStreamingMetadata: true`, so the generated Edge handler ignored the
application's `htmlLimitedBots` setting. The first built-server verification
therefore failed all eight browser/Googlebot cases: 0/8 responses placed title,
robots, canonical, and hreflang metadata in the initial document head. That run
was retained as diagnostic evidence, not completion evidence. Its redirect
checks passed 2/2, and no success changelog was written from that run.

The application now sets `htmlLimitedBots: /.*/` so metadata is blocking for
browser and crawler user agents. Because the installed Edge template did not
honor that supported setting, both CommonJS and ESM copies of Next.js 15.5.14's
`edge-ssr-app` template are patched to read the request user agent once and use
`shouldServeStreamingMetadata(userAgent, nextConfig.htmlLimitedBots)`. The pnpm
`patchedDependencies` registration and lockfile patch hash make that dependency
fix reproducible without committing `node_modules`, generated `.next` output,
or Cloudflare build output. Focused tests reject a return to the hard-coded
`serveStreamingMetadata: true` render option.

### Stale Kling guide URL had no maintained destination

`/guides/how-to-use-kling-in-ai-agent` was not a current page and was absent
from the legacy redirect map, leaving an obsolete search-facing URL without a
permanent path to the maintained guide. The legacy redirects are now defined in
the testable `legacy-route-redirects.ts` module consumed by middleware, with the
Kling path mapped to
`/guides/how-to-add-video-generation-to-ai-agent`. Existing middleware behavior
continues to localize the destination, preserve the cloned URL's query string,
and return 308.

## Verification

All commands below were run from `web/` on 2026-07-19 after the Edge-template
patch was installed.

- `pnpm run check:seo-p0` exited 0. The SEO foundation suite passed 15/15,
  strict rollout passed for `pt-br`, `id`, and `de` on the four P0 paths, and
  the main-site P0 source-contract check passed.
- `pnpm run check:edge-runtime` exited 0 for `web/src/app`.
- `pnpm exec tsc --noEmit --incremental false` exited 0 with no diagnostics.
- `pnpm run build` exited 0. It regenerated 102 SEO routes with
  `created=0`, `updated=0`, `removed=0`, and `manual=81`; the information
  architecture check covered 102 routes and 112 nodes; sitemap-lastmod
  generation produced 229 entries.
- Representative production artifacts for both
  `.next/server/app/(seo)/for/codex/page.js.map` and
  `.next/server/app/[locale]/(seo)/for/codex/page.js.map` each contained one
  config-aware metadata-streaming decision and zero hard-coded
  `serveStreamingMetadata: true` render options.

### Built-server HTTP matrix

The production server was started with
`pnpm start --hostname 127.0.0.1 -p 3137`. Requests used a 10-second bound.
For both a current Chrome user agent and Googlebot, each of `/`, `/for/codex`,
`/for/claude-code`, and `/compare/fal-ai-vs-replicate` returned 200. All eight
responses placed title, robots, canonical, and hreflang before `</head>`, with
none of those tags after the head: 8/8 passed.

Both legacy requests passed after normalizing the local absolute `Location`
header to pathname plus query:

- `/guides/how-to-use-kling-in-ai-agent?source=gsc` returned 308 to
  `/guides/how-to-add-video-generation-to-ai-agent?source=gsc`.
- `/de/guides/how-to-use-kling-in-ai-agent` returned 308 to
  `/de/guides/how-to-add-video-generation-to-ai-agent`.

The built-server redirect result was 2/2. The server was stopped and port 3137
was confirmed clear.

### Cloudflare-oriented verification

`node ./scripts/pages-build.mjs` was run directly and exited 0. `build:cf` was
not run because it also publishes IndexNow. The build produced 232 Edge
function routes, one prerendered route, and 309 other static assets. Both the
localized Vercel function
`.vercel/output/functions/[locale]/for/codex.func/index.js` and its final
Cloudflare worker copy contained one config-aware call using
`htmlLimitedBots`, with zero hard-coded `serveStreamingMetadata: true` render
options.

Wrangler 4.80.0 was already installed, so a credential-free local Pages runtime
was started on `127.0.0.1:3138` without publishing or changing external state.
A bounded Googlebot request to `/de/for/codex` returned 200 and placed title,
robots, canonical, and hreflang in the head with no copies after it. Wrangler
was then stopped and port 3138 was confirmed clear.

## Non-fatal warnings and workarounds

- Node reported `MODULE_TYPELESS_PACKAGE_JSON` performance warnings while
  loading the TypeScript redirect module and `next.config.ts` in tests.
- Next/Webpack reported a large-string cache serialization warning. The build
  also repeated existing Auth0/Jose Edge compatibility warnings for `crypto`,
  `CompressionStream`, and `DecompressionStream`, plus the notice that Edge
  runtime disables static generation for those pages.
- Local requests reported missing Auth0 configuration. Public SEO responses
  still completed, and no credentials were supplied or printed.
- The Cloudflare build retried one npm registry `ECONNRESET`, reported slow
  package requests, one deprecated `tar` subdependency, and Vercel's pnpm
  version-detection notice.
- The first `next-on-pages` conversion rejected the generated dynamic
  `/_not-found` function. `pages-build.mjs` applied its existing workaround,
  removed that function, reran conversion with `--skip-build`, and completed
  successfully.

These warnings were not treated as failures because every required command and
HTTP assertion reached its specified successful result.

## Scope and measurement boundaries

This recovery is limited to the AnyCap main site. It does not modify hosted
`/page/**` content or hosted-site SEO, landing-page copy, the 102-route SEO
inventory, or the 229-entry sitemap-lastmod inventory. No deployment, push,
IndexNow publication, or Google Search Console submission was performed.

The work improves the HTML and redirect signals available to crawlers. Local
build and runtime evidence does not prove production deployment, recrawling,
reindexing, ranking recovery, or traffic lift. Those outcomes require a later
authorized deployment and measured Search Console/analytics follow-up.
