# SEO Guidelines

## Purpose

Use this when changing SEO pages, metadata, sitemap generation, robots,
`llms.txt`, public navigation, localized SEO routes, or SEO documentation.

## Source of Truth

- SEO routes and priorities:
  `web/src/lib/site.ts`,
  `web/src/lib/seo/routes.ts`,
  `web/src/generated/seo-route-manifest.json`
- Sitemap generation: `web/src/lib/sitemap-routes.ts`,
  `web/src/lib/sitemap-xml.ts`
- Metadata helpers: `web/src/lib/seo-metadata.ts`,
  `web/src/lib/localized-metadata.ts`
- Navigation: `web/src/lib/seo-navigation.ts`,
  `web/src/components/layout/Header.tsx`,
  `web/src/components/layout/Footer.tsx`
- AI crawler entry point: `web/public/llms.txt`
- Robots: `web/src/app/robots.ts`
- SEO workspace docs: `web/docs/seo/`
- Web build checks: `web/package.json`

## Route Rules

- SEO pages live under `(seo)` route groups for non-localized and localized
  routes.
- Localized SEO pages are generated/synchronized by web scripts. Do not hand
  edit generated localized route files without understanding the sync flow.
- Public route definitions are partly manual and partly generated. Do not
  assume every route must be manually listed in one file.

## Public Navigation

Keep public navigation terminology consistent across header, footer, and SEO
pages. Product navigation should stay aligned with current source files rather
than stale docs.

Do not rename established SEO slugs just to match navigation labels.

## Capability Claims

- Capability availability must be taken from current web source files.
- If a page introduces or changes a capability claim, update the relevant
  central source and `llms.txt` when appropriate.
- Do not describe roadmap capabilities as available unless current product and
  web source files say they are available.

## Landing Page Boundary

The agent landing page and `web/src/lib/landing-content.ts` are not part of
routine SEO copy work. Do not rewrite, reorder, or partially tune landing copy
for SEO unless the user explicitly requests landing changes.

## SEO Documentation Workspace

Use `web/docs/seo/` for SEO work records:

- `analyze/`: reasoning, research, diagnostics, evidence
- `todo/`: deduplicated actionable tasks
- `change-log/`: actual code/config/content changes and verification

Do not put changelog entries into analysis files. Do not copy full analysis
content into todo files.

## Verification

For route, metadata, or `llms.txt` changes, run the relevant scripts from
`web/package.json` when feasible. At minimum, report which checks were run and
which were not.
