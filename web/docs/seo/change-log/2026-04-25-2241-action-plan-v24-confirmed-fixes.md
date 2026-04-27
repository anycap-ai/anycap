---
node_id: SEO-20260425-2241
date: 2026-04-25 22:41 UTC+8
scope: action-plan-v24-confirmed-fixes
---

# Action Plan v24 Confirmed SEO Fixes

## Summary

Reviewed `anycap-ACTION-PLAN-2026-04-25-v24.md` against the current `web` source and applied the fixes that were both confirmed and directly controllable in this repo.

## Confirmed and Fixed

- Removed empty FAQ JSON-LD output from the eight listed pages by guarding disabled FAQ schema before rendering:
  - `/pricing`
  - `/capabilities/music-generation`
  - `/capabilities/image-generation`
  - `/capabilities/video-generation`
  - `/capabilities/image-understanding`
  - `/guides/mcp-vs-skills`
  - `/guides/agent-skills-for-developer-tools`
  - `/guides/claude-opus-4-7-image-video-workflow`
- Added TechArticle JSON-LD to:
  - `/guides/what-is-agent-harness`
  - `/guides/workspace-context-engineering`
- Expanded `/guides/agent-skills-for-developer-tools` SEO locale rollout to all currently supported repo locales: `en`, `pt-br`, `id`, `de`.
- Added the ten new AI/orchestration article entries from the plan to `web/public/llms.txt`.

## Not Confirmed in Repo

The `/page/en-US/ai/...` article title, description, hreflang, and sitemap-lastmod issues in the plan were not found as static Next.js source files in this repo. The matching article URLs now appear only as `llms.txt` entries. Those metadata fixes likely live in the AnyCap Page/CMS data source or generated production content rather than `web/src/app`.

The C1 raw literal `<script type="application/ld+json">{}</script>` string did not exist in source. The confirmed repo-side cause was `createFaqPageJsonLd()` intentionally returning `{}` while several pages rendered that value unconditionally.

## Verification

- `pnpm run check:seo-locale-rollout`
- `pnpm run check:seo-breadcrumbs`
- `pnpm run check:seo-ia`
- `pnpm exec tsc --noEmit`
- IDE lints on edited files: no errors
- Source search for literal empty JSON-LD script / `JSON.stringify({})`: no matches
