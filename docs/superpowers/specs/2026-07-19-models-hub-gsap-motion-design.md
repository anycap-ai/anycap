# Models Hub GSAP Motion Design

## Purpose

Use the refreshed `/models` hub as a contained GSAP pilot. The motion should
make the page hierarchy easier to scan without changing its content, layout,
SEO structure, or visual language.

The page currently applies the shared `FadeIn` CSS animation to most sections.
Those animations start when the page loads, including for content below the
fold. This pilot replaces that behavior on `/models` only with scoped,
viewport-aware GSAP motion.

## Approved Direction

Use a page-specific React client wrapper with GSAP and ScrollTrigger.

The approved motion style is restrained:

- short entrance distances and durations;
- one-time viewport reveals rather than scroll scrubbing;
- a compact stagger for the latest-model cards;
- no parallax, pinning, looping, or decorative motion;
- no motion-driven changes to layout or content order.

The shared `FadeIn` component and every other public page remain unchanged.

## Architecture

The `/models` page remains an Edge Runtime Server Component. It continues to
own localized content, metadata, JSON-LD, model sorting, and semantic markup.

A new client component under `web/src/components/seo/` provides the motion
boundary. It:

- renders a scoped root around the existing server-rendered page content;
- registers `useGSAP` and ScrollTrigger in the client bundle;
- targets only descendants marked with page-specific data attributes;
- creates the hero and viewport-reveal animations after hydration;
- reverts every tween and ScrollTrigger when the component unmounts.

The server page replaces its `/models` uses of the shared CSS `FadeIn` wrapper
with plain semantic wrappers carrying these scoped markers. This prevents CSS
and GSAP from animating the same element while leaving all content visible in
the server-rendered HTML.

No model data moves into the client bundle beyond the already rendered HTML.
The wrapper does not fetch data or change links, headings, structured data, or
locale handling.

## Motion Choreography

### Hero

The hero eyebrow, update date, title, introduction, summary, and early-access
banner enter in document order. On desktop they use `autoAlpha`, `y: 16`, a
500 millisecond duration, a 70 millisecond stagger, and `power2.out` easing.

The hero animation runs once on initial render. The final element sizes and
positions are present before animation, so the animation does not reserve or
remove layout space.

### Content sections

Each marked section reveals once with ScrollTrigger start position
`top 85%`. On desktop a section uses `autoAlpha`, `y: 16`, a 500 millisecond
duration, and `power2.out` easing. Dividers remain static so the page does not
appear to pulse while scrolling.

ScrollTrigger does not use `scrub`, `pin`, or progress-linked transforms. Long
comparison tables animate as a single block; rows do not stagger.

### Latest-model cards

The heading and introduction reveal with their section. The six latest-model
cards then use `autoAlpha`, `y: 12`, a 450 millisecond duration, and a
60 millisecond stagger. Card hover styling remains CSS-based.

### Responsive behavior

At widths below 768 pixels, hero and section offsets become 8 pixels, card
offsets become 6 pixels, and card stagger becomes 40 milliseconds. Durations
and easing remain unchanged. Breakpoint-specific values are managed through
GSAP media conditions rather than separate render paths.

## Accessibility And Resilience

`prefers-reduced-motion: reduce` disables entrance transforms, durations, and
stagger. All marked content is set directly to its final visible state.

The page remains readable and navigable without JavaScript because the server
HTML is visible by default. GSAP establishes start states only after the client
lifecycle begins. Motion does not alter focus order, pointer behavior, link
targets, headings, or assistive-technology labels.

The implementation uses `useGSAP` with a component scope and explicit media
cleanup. It does not run GSAP or ScrollTrigger during server rendering.

## Performance Boundaries

Only transform and opacity-derived properties are animated. Width, height,
top, left, margins, and other layout-heavy properties are excluded.

The client component creates one hero sequence, one trigger per marked content
section, and one card stagger for the latest-model grid. It does not create a
trigger per table row or per FAQ item. Section triggers use `once: true` so
they are released after completion, and all remaining animation state is
reverted on unmount.

`gsap` and `@gsap/react` become direct web dependencies. The pilot does not
load GSAP globally or add it to pages that do not render the models hub.

## Testing And Verification

Implementation follows a failing-test-first cycle. Focused source-contract
tests verify:

- the page-specific client wrapper is used by `/models`;
- hero, section, and latest-card markers are present in the intended order;
- the wrapper registers `useGSAP` and ScrollTrigger;
- animation selectors are scoped to the wrapper;
- reduced-motion handling is present;
- no shared `FadeIn` implementation is changed for this pilot.

Verification also includes:

- the model-hub test suite;
- TypeScript checking;
- the complete production build and existing SEO checks;
- rendered inspection of `/models` at desktop and mobile widths;
- rendered inspection with reduced motion enabled;
- confirmation that content remains visible, no horizontal overflow appears,
  and the browser console has no errors;
- confirmation that localized `/models` routes retain the same behavior and
  visible content.

## Non-Goals

- changing model inventory, dates, descriptions, pricing, or sorting;
- changing metadata, JSON-LD, sitemap behavior, or localized copy;
- redesigning cards, tables, spacing, colors, or typography;
- modifying the shared `FadeIn` component or global animation CSS;
- adding animation to the homepage, capability pages, pricing, or model detail
  pages;
- adding scroll scrubbing, parallax, pinned sections, cursor effects, or
  continuous animation;
- using GSAP for existing CSS hover and color transitions.
