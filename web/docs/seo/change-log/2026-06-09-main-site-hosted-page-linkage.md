---
node_id: SEO-20260609-0915
date: 2026-06-09
scope: gsc-main-site-remediation-hosted-page-linkage
---

# Main-Site GSC Remediation + Hosted Page Linkage

## Summary

Addressed 78 main-site GSC issues (excluding 407 `/page/` entries) by fixing EN-only duplicate canonical signals and adding first-class HTML internal links from the marketing site to the AnyCap Page hosted content hub.

## Changes

### 1. Canonical and internal-link locale fallback

- `web/src/lib/site.ts` — `localizePublicPath()` now links to the default-locale URL when the current locale is not in the route's SEO rollout.
- `web/src/lib/localized-metadata.ts` — non-indexable localized pages canonicalize and set Open Graph `url` to the default-locale path instead of the localized shell URL.

### 2. Hosted page linkage module

- `web/src/lib/seo/hosted-pages.ts` — maps site locales to hosted CMS locales and exposes hub links for `/ai`, `/blog`, `/news`.

### 3. Sitewide internal links to `/page/`

- `web/src/components/layout/Footer.tsx` — new **Published on AnyCap** column with hosted hub links; grid expanded to 6 columns.
- `web/src/app/(seo)/learn/content.ts` — hosted hubs added to `adjacentHubs` for en/pt-br/id/de.
- `web/src/app/(seo)/capabilities/content.ts` — related card pointing to hosted blog index per locale.

### 4. Discovered leaf-page reinforcement

- `web/src/app/(seo)/for/claude-code/content.ts` (EN capability cards) — link to:
  - `/for/claude-code/image-generation`
  - `/for/claude-code/video-generation`
  - `/for/claude-code/opus-4-7`

Note: these are IA children of `for-claude-code`, not direct `/for` hub items. Adding them to `hubItemCopyEn["/for"]` breaks `validateHubItemCoverage()` and fails `next build`.

### 5. Legacy slug cleanup

- `web/src/middleware.ts` — 308 redirect `/glossary/agent-capability-runtime` → `/glossary/agent-harness`.
- `web/public/llms.txt` and `web/public/pt-br/llms.txt` — link target updated to `/glossary/agent-harness`.

## Verification

- `pnpm exec tsc --noEmit` — passes.
- `pnpm run check:seo-locale-rollout` — passes.
- `pnpm run check:seo-ia` — passes.
- `pnpm run check:seo-breadcrumbs` — passes.

## Not addressed (hosted `/page/` — out of scope)

407 GSC issues under `/page/*` remain in CMS/Page runtime. Main-site changes above improve discovery paths but do not fix hosted-page indexation directly.
