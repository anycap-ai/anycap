---
node_id: SEO-20260429-1022
date: 2026-04-29 10:22 UTC+8
scope: gsc-crawled-not-indexed-remediation
---

# Crawled-not-indexed Remediation (April 29 batch)

## Summary

Acted on the GSC "Crawled - currently not indexed" cluster surfaced on 2026-04-28. Root causes were identified directly from the codebase rather than from GSC alone:

1. Five `learn/*` pages were exposed on the German (`de`) rollout while their `content.ts` shipped `de: enContent` — i.e. German URL + `<html lang="de">` + DE metadata, but English body. Google reads this as a near-duplicate of the EN page and refuses to index the DE variant.
2. 47 `getLocalizedRouteUrl(siteConfig.defaultLocale, ...)` calls baked the EN URL into JSON-LD `url` fields across localized pages. Schema URL therefore pointed back to EN even when the page declared a localized `<link rel="canonical">`, contradicting the canonical signal.
3. Several long-tail EN leaf pages (`/compare/claude-opus-4-7-vs-sonnet-4-6`, `/compare/fal-ai-alternatives-for-agents`, `/guides/how-to-add-image-generation-to-ai-agent`) had only a single in-codebase inbound link from another non-hub source page — too sparse to establish authority for indexing.

## Changes

### 1. Fake-DE rollout removed (5 pages) + dead code cleaned (11 files)

`web/src/lib/seo-locale-rollout.ts` — demoted the following keys from `ptBrIdAndDeRolloutSeoLocales` to `ptBrAndIdRolloutSeoLocales` so DE returns `noindex,nofollow` and is dropped from the DE sitemap:

- `learn-what-is-an-ai-influencer`
- `learn-ai-video-generator-from-image`
- `learn-create-ai-influencer-for-free`
- `learn-how-to-make-ai-influencers`
- `learn-how-to-make-ai-influencer-videos`

Cleaned `de: enContent,` dead code from 11 `content.ts` files (5 above plus 6 photo-editing learn pages where DE was already not on the rollout):

- `learn/how-to-brighten-a-photo-online/content.ts`
- `learn/how-to-remove-people-from-photos/content.ts`
- `learn/how-to-make-background-white-for-product-photos/content.ts`
- `learn/what-is-an-ai-influencer/content.ts`
- `learn/how-to-make-ai-influencers/content.ts`
- `learn/ai-video-generator-from-image/content.ts`
- `learn/how-to-make-a-photo-into-a-drawing/content.ts`
- `learn/how-to-make-image-transparent/content.ts`
- `learn/create-ai-influencer-for-free/content.ts`
- `learn/how-to-change-photo-background/content.ts`
- `learn/how-to-make-ai-influencer-videos/content.ts`

For files using `satisfies Record<SiteLocale, X>`, the annotation was relaxed to `satisfies Partial<Record<SiteLocale, X>>` and the `getContent` helpers now fall back to `enContent` directly. For files using `as const` without an annotation, the lookup was changed to `contentByLocale[locale as keyof typeof contentByLocale] ?? enContent`. Unused `defaultLocale` imports were removed from the photo files.

### 2. JSON-LD `url` localized

47 occurrences of `getLocalizedRouteUrl(siteConfig.defaultLocale, ...)` in `(seo)` source files were rewritten to use the actual locale of the surrounding content block:

| File | Edits |
|---|---|
| `glossary/content.ts` | 16 (4 entries × 4 locales) |
| `pricing/content.ts` | 12 (3 schema URLs × 4 locales) |
| `about/content.ts` | 5 (per locale block) |
| `glossary/agent-capability-runtime/content.ts` | 4 |
| `learn/page.tsx` | 3 (CollectionPage + ItemList, threaded `locale` through `getRequestLocale()`) |
| `start/content.ts` | 1 (used `locale` already in scope) |
| `skills/anycap-*/content.ts` | 6 (one per skill page, scoped to EN) |

In each case the substitution preserved meaning: an `aboutContentDe` block now emits a schema `url` of `https://anycap.ai/de/about`, etc. No business logic moved.

### 3. Internal link reinforcement for orphan EN leaf pages

- `capabilities/image-generation/content.ts` (EN block) — added `relatedCards` entries pointing to `/guides/how-to-add-image-generation-to-ai-agent` and `/compare/fal-ai-alternatives-for-agents`.
- `compare/anycap-vs-fal-ai/content.ts` (EN block) — added `/compare/fal-ai-alternatives-for-agents` to the `relatedPages` array.
- `learn/best-ai-for-claude-code/content.ts` (EN block) — added `/compare/claude-opus-4-7-vs-sonnet-4-6` to `nextMoveCards`.
- `for/claude-code/image-generation/page.tsx` — added a footer CTA pointing to `/guides/how-to-add-image-generation-to-ai-agent` with localized labels for en/pt-br/id/de; extended the `footerCtas` content type accordingly.

The non-EN locale blocks of these pages were not touched — the corresponding non-EN compare/guide pages either do not exist or are out of the indexed rollout, so adding more localized cross-links would either link to soft-404s or to noindexed variants.

## Verification

- `pnpm exec tsc --noEmit` — passes.
- `pnpm run check:seo-locale-rollout` — passes.
- `pnpm run check:seo-ia` — passes (102 routes, 112 IA nodes).
- `pnpm run check:seo-breadcrumbs` — passes.
- Pre-change live fetch confirmed `<html lang="de">` + DE metadata + `getLocalizedRouteUrl("en", ...)` schema URLs on the affected DE pages.

## Not Addressed in This Batch

- The `BAILOUT_TO_CLIENT_SIDE_RENDERING` marker on every page (originating from `LoginButton` reading `useSearchParams`). The body still server-renders ~1300 words for content pages, so Google does receive the content. Worth tracking separately if indexing rates do not improve after the fixes above land.
- True German translation for the 5 demoted pages. The decision was to noindex first rather than ship LLM-machine-translated content; reviewer-approved DE content can re-promote them later.
- Locale-aware schema URLs in `_app/(seo)/skills/*` are pinned to `"en"` because the skills pages are currently indexed only in EN. If the skills hub expands to non-EN locales, those calls need to be threaded with the request locale.
