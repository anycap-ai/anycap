# Homepage Particle Capability Section Demo Design

## Purpose

Create a section-only visual demo for the AnyCap homepage that communicates one
idea: installing AnyCap gives humans and agents one capability layer for the
full path from creation to delivery.

This demo is for visual and motion approval. It does not modify the production
homepage, hero, navigation, footer, models hub, or capability data.

## Approved Direction

Preserve the existing AnyCap homepage design language exactly and redesign only
the selected particle section.

The demo contains one scroll-pinned section and nothing else. It removes the
standalone demo hero, page chrome, bridge copy, terminal-style call to action,
extra sections, and the blue-grey prototype background.

The motion tells a single sequence:

1. fragmented particles converge into one AnyCap capability core;
2. the core opens into multiple connected capability paths;
3. those paths resolve into creation, understanding, retrieval, storage, and
   delivery outcomes;
4. the final composition keeps every outcome visibly connected to the same
   center.

The visible copy remains concise:

- `One capability layer.`
- `Every way to finish.`
- `Human and agent work through the same capability field.`

## Brand And Layout Fidelity

The standalone demo reproduces the current homepage source tokens rather than
approximating them:

- page background: `#f4f5f0`;
- primary text: `#1c1f17`;
- supporting text: `#4d5145`;
- accent: `#6b7d3a`;
- divider: `#d4dbb8`;
- display type: GeistPixelSquare at weight 500;
- body type: the homepage system sans-serif stack;
- small capability labels: Inter at weight 500;
- horizontal page padding: 32px on mobile, 64px on tablet, and 96px on desktop;
- grain: the same fixed multiply layer at 7 percent opacity used by the main
  site.

The pinned stage inherits the page background. The canvas is transparent. No
independent color field, glow, gradient wash, or theme inversion is introduced.

The desktop composition uses the same left edge as the homepage. Copy occupies
the left portion of the section and the particle field expands through the
remaining width. The headline uses the same clamp-based display scale and line
height as the current capability opener.

The section uses the homepage divider color at its boundaries so it can later
replace the existing large capability list without looking like an embedded
microsite.

## Particle Composition

The visual is a canvas-based particle field, not a collection of fake product
cards.

Particles use the existing olive and near-black colors with restrained alpha.
They form a central AnyCap square and fan out into asymmetric branches. Each
branch represents a real capability family already expressed on the public
site:

- create: image, video, music, and voice;
- understand: image and video analysis;
- find: search and retrieval;
- manage: upload and storage;
- deliver: pages and shareable outputs.

Small Inter labels clarify the branch endpoints. Labels remain secondary to the
particle motion and never become badges, pills, or fake application windows.

The final frame is intentionally more expansive than the previous demo. It
shows many outputs around one stable center, with enough empty space to preserve
the homepage's restrained density.

## Motion Choreography

The section wrapper provides approximately 320 dynamic viewport heights of
scroll range. Its inner stage pins at `top top` for one viewport height. The
pinned element itself remains static; GSAP animates its children and drives a
single normalized progress value for the canvas renderer.

The progress range is divided into four overlapping phases:

### Converge

Loose particles move inward and resolve into the AnyCap square. The headline is
already visible so the section does not begin as an empty screen.

### Open

The center breathes once, then particle streams extend outward. The movement
communicates that one installation unlocks multiple capability families.

### Resolve

Streams settle into distinct endpoint constellations. Capability labels enter
with short transform and opacity transitions as their constellations become
legible.

### Hold

The center, connecting paths, and all endpoints remain visible long enough to
read before the pin releases. There is no loop, scroll cue, or unrelated
continuous motion.

GSAP ScrollTrigger uses `start: "top top"`, `pin: true`, `scrub: 0.8`, and an
end distance derived from the section scroll range. The animation timeline uses
linear scroll mapping. Rendering interpolates particle positions to avoid
abrupt state changes.

## Responsive And Accessibility Behavior

At widths below 768px the composition becomes a single column. Copy remains at
the top and the particle field uses the available width beneath it.

Mobile keeps the same narrative but shortens the pinned distance and reduces
particle count. This prevents the section from feeling like a full-page scroll
trap.

When `prefers-reduced-motion: reduce` is active, pinning and scrubbing are
disabled. The section renders the final connected composition as a static
frame. All copy and capability labels remain readable without JavaScript.

## Performance Boundaries

- Use one canvas and one ScrollTrigger for the section.
- Cap device pixel ratio at 2.
- Scale particle count by viewport width and reduced-motion preference.
- Cache particle source and target positions after layout.
- Animate DOM elements only with transforms and opacity.
- Avoid scroll event listeners, layout reads inside the render loop, and one
  tween per particle.
- Pause canvas rendering when the section is not active.
- Refresh ScrollTrigger only after fonts are ready and after meaningful layout
  changes.

## Demo Architecture

The visual companion continues to serve a standalone HTML document from the
existing particle demo directory. The document embeds the local GSAP and
ScrollTrigger scripts already used by the companion and loads the same local
font assets as the current Next.js development build.

The demo is intentionally isolated from production code. After visual approval,
the same composition can be implemented as a page-specific client leaf under a
role-based homepage component directory. That production component will inherit
the real Next.js font variables, global grain, and page background instead of
duplicating tokens.

## Verification

Because this deliverable is a throwaway visual companion rather than production
application code, verification is browser-behavior based instead of adding a
repository test harness for the standalone HTML.

Verification covers:

- the demo contains exactly one semantic section;
- the background, fonts, grain, colors, and horizontal padding match the source
  homepage tokens;
- desktop and mobile layouts have no horizontal overflow;
- ScrollTrigger creates one pinned sequence and releases cleanly;
- the first, middle, and final scroll states match the approved narrative;
- reduced motion displays the static final composition;
- the canvas remains transparent and correctly resizes;
- the browser console contains no runtime errors;
- the page does not request remote images or unrelated visual assets.

## Non-Goals

- changing the homepage hero or any other production section;
- changing production copy, routes, metadata, structured data, or analytics;
- adding model logos, agent logos, provider branding, or a logo wall;
- building fake dashboard, terminal, media, or delivery cards;
- adding dark mode, theme switching, cursor effects, parallax, or smooth-scroll
  libraries;
- adding an install button or another conversion call to action;
- integrating the section into the production homepage before the user approves
  the visual demo;
- creating another git branch.
