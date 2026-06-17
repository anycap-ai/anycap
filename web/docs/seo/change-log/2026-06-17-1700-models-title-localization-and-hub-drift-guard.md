---
node_id: SEO-20260617-1700
date: 2026-06-17
type: change-log
status: done
scope: main-site localized titles + rollout drift guard (follow-up to Finding 2)
related:
  - analyze/2026-06-17-1623-gsc-livetest-cross-validation-main-site.md
  - change-log/2026-06-17-1640-locale-rollout-untranslated-hub-noindex.md
---

# [SEO-20260617-1700] Models hub title localization + hub-locale drift guard

Follow-up to the Finding 2 fix. Two items:

## (1) Localized `<title>` for indexable pages that fell back to English

### models hub
The `/models` body is fully localized (en/pt-br/id/de) but the `metadata`
export hard-coded an English title/description, and `lib/localized-page.ts` had
no `models` resolver, so `/{locale}/models` served the English `<title>` across
all locales.

- `web/src/app/(seo)/models/metadata.ts` (new): `getModelsMetadata(locale)` with
  localized title + description + openGraph for en/pt-br/id/de.
- `web/src/app/(seo)/models/page.tsx`: `export const metadata` now builds from
  `getModelsMetadata(defaultLocale)` (single source).
- `web/src/lib/localized-page.ts`: registered `models: getModelsMetadata`.

### for-gemini-cli
`getForGeminiCliMetadata(locale)` already returns localized titles (pt-br/id/de)
but was never registered, so `/{locale}/for/gemini-cli` served the English
title. Registered `"for-gemini-cli": getForGeminiCliMetadata` in
`lib/localized-page.ts`.

### Not done (tracked) — leaf pages with inline English metadata
These render localized bodies but English `<title>` because metadata is inlined
in `page.tsx` with no locale-aware function (needs real translated title strings,
content work, lower priority — localized-body pages, not duplicates):
`/for/manus`, `/for/claude-code/image-generation`,
`/for/claude-code/video-generation`, `/for/claude-code/opus-4-7`,
`/guides/what-is-agent-harness`, `/guides/how-to-add-video-generation-to-ai-agent`,
`/guides/how-to-add-vision-to-ai-agent`,
`/guides/claude-opus-4-7-image-video-workflow`.

## (2) Reverse drift guard: rollout locale must have a translation

The existing `check-seo-locale-rollout.mjs` reverse path
(`rolloutWithoutTranslation`) is unreliable for shared-module content: it greps
each route's own `content.ts` for a `de: {` style signal and produces pure false
positives for hub pages (e.g. it flags `/id/glossary` as untranslated even
though it renders Indonesian, because hub copy lives in `seo/hub-pages.ts`). That
is why it is gated to `id` only and not run in the build.

Added a separate, source-of-truth guard instead:

- `web/scripts/check-seo-hub-locale-rollout.mjs` (new):
  - Hubs (`for`/`guides`/`glossary`/`compare`): rollout locales must be a subset
    of the locales present in `hubBaseDefinitionsByLocale` (seo/hub-pages.ts).
  - `home`/`agent`: must stay English-only (their metadata uses locale-invariant
    `siteConfig` titles; landing/agent body is not localized).
  - Refuses to pass silently if it parses nothing.
- `web/package.json`: new `check:seo-hub-locale-rollout` script, added to `build`
  and `build:cf` after `check:seo-locale-rollout`.

Verified the guard fails (exit 1, clear message) when `de` is re-added to a hub
rollout, and passes on the current state.

## Verification

- `pnpm run check:seo-hub-locale-rollout` — pass (and fails on injected regression).
- `pnpm run check:seo-locale-rollout` / `check:seo-ia` / `check:seo-breadcrumbs` — pass.
- `pnpm exec tsc --noEmit` — pass.
- `pnpm run sync:seo-locales` — base=101 created=0 updated=0 removed=0.
- No linter errors.

Pending (requires deploy): live recheck that `/de/models`, `/pt-br/models`,
`/id/models`, `/{locale}/for/gemini-cli` emit localized `<title>`.
