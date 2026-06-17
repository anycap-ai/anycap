---
node_id: SEO-20260617-1640
date: 2026-06-17
type: change-log
status: done
scope: main-site locale rollout (Finding 2 of cross-validation audit)
related:
  - analyze/2026-06-17-1623-gsc-livetest-cross-validation-main-site.md
---

# [SEO-20260617-1640] Stop indexing untranslated locale hub/home pages

## Why

Cross-validation (analyze/2026-06-17-1623) found locale-prefixed pages that
render English content but were still `index,follow` + self-canonical and listed
in the locale sitemaps, producing same-language duplicates that Google folds into
the EN canonical (`DUPLICATE_GOOGLE_CHOSE_DIFFERENT_CANONICAL`).

Ground truth for coverage:
- `home` / `agent`: English for all of pt-br/id/de (landing copy and the agent
  page are not localized). Live + landing source.
- `for` / `guides` / `glossary` / `compare` hub *index* pages: `de` hub copy is
  absent in `hubBaseDefinitionsByLocale` (seo/hub-pages.ts) → `/de/{hub}` falls
  back to English. pt-br/id hub copy exists. Their leaf pages (e.g.
  `/de/for/codex`, `/de/glossary/agent-harness`, `/de/compare/anycap-vs-fal-ai`)
  ARE translated and keep their own broader rollout keys.

## Change

`web/src/lib/seo-locale-rollout.ts` (single file):

| Route key | Before | After |
|---|---|---|
| `home` | en,pt-br,id,de | `en` |
| `agent` | en,pt-br,id,de | `en` |
| `for` | en,pt-br,id,de | en,pt-br,id |
| `guides` | en,pt-br,id,de | en,pt-br,id |
| `glossary` | en,pt-br,id,de | en,pt-br,id |
| `compare` | en,pt-br,id,de | en,pt-br,id |

Added a guiding comment that rollout must track actual translation coverage.

## Cascade (no other files needed)

`isSeoIndexablePathForLocale()` is the single lever read at runtime by all of:
- metadata (`localized-metadata.ts`): non-indexable locale → `noindex,nofollow`
  + canonical to the EN URL + drops the locale from hreflang.
- sitemap (`sitemap-routes.ts:getLocaleSitemapRoutes`): filters by the same
  predicate → these URLs leave the locale child sitemaps.
- internal links (`site.ts:localizePublicPath`): links to the EN path for
  non-indexed locales.

Net effect after deploy: `/de`, `/pt-br`, `/id` (home), `/{de,pt-br,id}/agent`,
and `/de/{for,guides,glossary,compare}` become `noindex` + canonical→EN and drop
out of the locale sitemaps. Translated leaf pages are unaffected.

Not changed: `models` hub (body is localized; only its `<title>` is still
English — tracked separately as an on-page title-translation task, not a
duplicate).

## Verification

- `pnpm run check:seo-locale-rollout` — pass (note: this check is one-directional;
  it only asserts translated pt-br pages are in rollout, it does NOT catch
  rollout locales that lack translations — that is how this drift went unnoticed).
- `pnpm run check:seo-ia` — pass (101 routes / 111 IA nodes).
- `pnpm run check:seo-breadcrumbs` — pass.
- `pnpm exec tsc --noEmit` — pass.
- `pnpm run sync:seo-locales` — base=101 created=0 updated=0 removed=0; manifest
  regenerated with no diff (rollout is read at runtime, not baked into manifest).

Pending (requires deploy): live recheck with commands in the analyze doc to
confirm `/de/glossary` etc. emit `noindex` and drop from `sitemap/de.xml`.

## Follow-ups (not in this change)

- Consider a second, reverse check: assert every (route, locale) in rollout has
  real translated content, to prevent future drift.
- Translate `models` hub `<title>` per locale, or accept English title.
- Untranslated leaf `<title>`s (e.g. `/de/for/manus`, several `/de/guides/*`)
  render localized bodies but English titles — on-page polish, low priority.
