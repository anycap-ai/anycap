# Main-site-aligned documentation theme

## Goal

Make the Astro Starlight documentation site share the visual language of the AnyCap main
site while preserving Starlight navigation, accessibility, responsive behavior, and
content structure. The existing light and dark theme controls remain available.

## Source of truth

The visual source is `/Users/tyluo/go/src/engineering/anycap/web`:

- `src/app/layout.tsx` defines Inter, Space Mono, and Geist Pixel Square usage.
- Landing and SEO components define the light palette and component treatment.
- The documentation site must not copy the main site's component CSS wholesale. It owns
  its Starlight-specific implementation and uses the main site only as a token and
  typographic reference.

## Typography

- Body text and standard interface text use Inter, matching the main site.
- Display headings, section headings, and the documentation site title use Geist Pixel
  Square, matching the main site's branded display treatment.
- Code blocks, inline code, and data-dense controls use Space Mono.
- Typography remains responsive and readable: prose line length and Starlight's existing
  semantic hierarchy are preserved.

## Color system

### Light theme

| Purpose | Token/value |
| --- | --- |
| Page background | `#f9faf5` |
| Sidebar and secondary surface | `#f4f5f0` |
| Raised surface | `#fbfcf8` |
| Primary text | `#1c1f17` |
| Secondary text | `#4d5145` |
| Brand accent | `#6b7d3a` |
| Hairline/border | `#d4dbb8` |

### Dark theme

The dark theme is a deliberate olive-charcoal extension of the main-site palette, not a
literal inversion. Its page and sidebar surfaces are dark olive-charcoal; text is a warm,
high-contrast pale green; borders and accent states use muted olive values. Token contrast
must preserve readable prose, code, tables, and interactive controls.

## Component treatment

- Header and sidebar use the matched surfaces, restrained hairlines, and translucent
  backdrop treatment appropriate to their theme.
- Buttons, current navigation states, links, cards, tables, and code blocks use the same
  olive accent and border language as the main site.
- Cards retain Starlight semantics but use the main site's restrained rounded-corner,
  hover, focus-ring, and shadow behavior.
- The documentation hero retains its content and layout; only its typography, spacing,
  background, and visual treatments change.

## Technical approach

1. Add the `geist` package at the version compatible with the main site, so Geist Pixel
   Square is loaded from the same package rather than approximated with a fallback.
2. Define the main-site font stacks and palette as CSS custom properties in
   `docs/src/styles/custom.css`.
3. Map those properties to Starlight theme tokens separately for light and dark themes.
4. Apply narrow component overrides for Starlight chrome, prose headings, cards, buttons,
   tables, code blocks, hover states, focus rings, and reduced-motion behavior.
5. Do not change documentation content, routes, metadata, sitemap behavior, or deployment
   configuration.

## Acceptance criteria

- Light mode uses the specified main-site palette and the three matching font roles.
- Dark mode remains selectable and uses an accessible olive-charcoal counterpart.
- No heading falls back to the previous Space Mono display style.
- Starlight navigation, search, table overflow, focus indicators, and mobile behavior
  remain usable.
- `make docs-check`, `make docs-audit`, and `git diff --check` pass after implementation.
