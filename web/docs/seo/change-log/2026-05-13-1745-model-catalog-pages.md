---
node_id: SEO-20260513-1745
type: change-log
topic: model catalog SEO pages
date: 2026-05-13
---

# Model Catalog SEO Pages

## Changes

- Added a CLI-backed model catalog for active AnyCap image, video, and music models.
- Added reusable catalog model detail page rendering with model ID, supported modes, CLI examples, FAQ schema, and TechArticle schema.
- Added static SEO pages and localized wrappers for active models that did not previously have detail pages.
- Expanded the models hub and pricing inventory tables to include the current active CLI catalog.
- Updated stale model copy and CLI examples to avoid unsupported external claims and use current file parameter syntax.
- Added IA route entries and manual route definitions for the new model pages.

## Research

- Saved CLI catalog output and grounded search research under `web/docs/seo/analyze/2026-05-13-1730-model-pages-grounded-research/`.
- Treated AnyCap CLI catalog as the source of truth for availability, model IDs, operations, and modes.
- Used grounded search only for high-level positioning because returned sources included a mix of official, vendor, marketplace, and secondary SEO pages.

## Verification

- `pnpm run sync:seo-locales`
- `pnpm run check:seo-ia`
- `pnpm run check:seo-locale-rollout`
- `pnpm run build`
