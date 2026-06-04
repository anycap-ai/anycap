# Web Guidelines

## Purpose

Use this when changing the Next.js web app, dashboard, public pages, auth pages,
or web components.

## Source of Truth

- Web design language: `web/docs/design-guideline.md`
- Web app routes: `web/src/app/`
- Components: `web/src/components/`
- Web source libraries: `web/src/lib/`
- Capability copy sources:
  `web/src/lib/site.ts`,
  `web/src/lib/capability-inventory.ts`,
  `web/public/llms.txt`
- Web package scripts: `web/package.json`

## Design Rule

Always read `web/docs/design-guideline.md` before editing `web/`. It defines
the visual language for colors, typography, spacing, backgrounds, borders,
effects, and component patterns.

## Component Organization

Components are organized by role. Do not add loose component files directly
under `web/src/components/`.

Use the existing subdirectories:

- `ui/`: generic reusable primitives with no product-specific business logic
- `layout/`: page chrome, shells, navigation, footer/header, structured layout
- `landing/`: landing and public marketing components
- `auth/`: authentication UI
- `brand/`: logo and brand assets
- `dashboard/`: dashboard-only components
- `providers/`: React context providers
- `agent/`: agent interaction UI
- `seo/`: reusable SEO page components

If a component becomes generic, promote it to `ui/`. If it remains tied to one
product area, keep it in that area's directory.

## Copy and Capability Language

- Do not maintain capability availability lists in AGENTS or guidelines.
- Use the web source files listed above as the source of truth for public
  capability language.
- Keep metadata, page copy, `llms.txt`, and navigation consistent with those
  source files.
- Landing page copy is product-owned. Do not rewrite
  `web/src/lib/landing-content.ts` or landing page structure for SEO work unless
  the task explicitly asks for landing changes.

## Build and Checks

Use `web/package.json` scripts as the source of truth. The production build path
includes SEO route generation and validation checks. If a change affects routes,
metadata, or localized SEO pages, run the relevant web checks or explain why
they were not run.

## Secrets and Auth

Do not commit `.env.*` secrets. Do not print Auth0/session/API secrets in logs,
pages, or error messages.
