---
node_id: SEO-20260425-2308
date: 2026-04-25 23:08 UTC+8
scope: action-plan-v25-confirmed-fixes
---

# Action Plan v25 Confirmed SEO Fixes

## Summary

Reviewed `anycap-ACTION-PLAN-2026-04-25-v25.md` against the current `web` source and the live affected pages. Applied the fixes that were confirmed and directly controlled by this repo.

## Confirmed and Fixed

- Expanded SEO locale rollout for the two OpenClaw compare pages from `en`, `pt-br` to `en`, `pt-br`, `id`, `de`:
  - `/compare/anycap-vs-openclaw-image-generation`
  - `/compare/anycap-vs-openclaw-video-generation`
- Added the 15 missing `/page/en-US` entries from the plan to `web/public/llms.txt`:
  - `/page/en-US/ai`
  - `/page/en-US/blog`
  - `/page/en-US/news`
  - `/page/en-US/ai/deepseek-v4-complete-developer-guide`
  - `/page/en-US/ai/deepseek-v4-release-date-what-we-know`
  - `/page/en-US/ai/gpt-5-5-what-developers-need-to-know`
  - `/page/en-US/ai/seedance-1-5-pro-complete-guide`
  - `/page/en-US/blog/best-ai-video-models-for-agents-2026`
  - `/page/en-US/news/claude-mythos-preview-too-dangerous-to-ship`
  - `/page/en-US/news/deepseek-v4-engram-explained`
  - `/page/en-US/news/deepseek-v4-now-live-weights-benchmarks`
  - `/page/en-US/news/deepseek-v4-research-papers-architecture`
  - `/page/en-US/news/google-gemini-enterprise-agent-platform-2026`
  - `/page/en-US/news/gpt-5-5-api-available-pricing-quick-start`
  - `/page/en-US/news/what-ai-agents-cant-do-in-2026`

## Not Confirmed in Repo

- The six listed compare URLs with `hl=0` were not found as source routes in this repo:
  - `/compare/anycap-vs-e2b`
  - `/compare/anycap-vs-fal`
  - `/compare/anycap-vs-fireworks-ai`
  - `/compare/anycap-vs-piapi`
  - `/compare/anycap-vs-eden-ai`
  - `/compare/anycap-vs-portkey`
- Live `/page/en-US/blog/`, `/page/en-US/ai/`, and `/page/en-US/news/` titles rendered with a normal UTF-8 dash during verification, not the `â` encoding artifact reported in the plan.
- The `/page/en-US/*` index metadata is not represented as static Next.js source in `web/src/app`; it appears to come from the AnyCap Page/CMS system. Repo-side changes were limited to `llms.txt`.
- The DE sitemap count gap is mostly controlled by `seo-locale-rollout.ts`. Some `learn` workflow pages are intentionally indexed for `en`, `pt-br`, and `id` only, or `en` and `pt-br` only, so they should not be expanded to `de` without German content review.

## Verification

- Live fetched:
  - `https://anycap.ai/page/en-US/blog/`
  - `https://anycap.ai/page/en-US/ai/`
  - `https://anycap.ai/page/en-US/news/`
  - `https://anycap.ai/compare/anycap-vs-openclaw-image-generation`
  - `https://anycap.ai/compare/anycap-vs-e2b`
- `pnpm run check:seo-locale-rollout`
- `pnpm run check:seo-breadcrumbs`
- `pnpm run check:seo-ia`
- `pnpm exec tsc --noEmit`
