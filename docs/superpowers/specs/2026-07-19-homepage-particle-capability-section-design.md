# Homepage Particle Capability Section Design

## Purpose

Create a section-only visual demo for the AnyCap homepage that communicates one
idea: after AnyCap is installed, a human or agent gains access to current model
capabilities and can carry work through creation, understanding, management,
and delivery in one connected flow.

This cycle implements the approved composition in the existing standalone
visual companion. It does not change the production homepage, hero, navigation,
footer, model inventory, routes, metadata, or analytics. Production integration
is a separate step after the browser demo is approved.

## Approved Visual Target

The section uses the current AnyCap homepage background, typography, grain,
page grid, and restrained olive palette. The existing homepage hero remains
untouched.

The final desktop frame has three dominant spatial zones:

1. the left 27 to 30 percent contains the existing concise section narrative;
2. the center-left contains a large, thick, hollow particle portal with a human
   and an agent standing inside;
3. the center and right contain a dense, perspective particle avalanche that
   separates into meaningful clusters rather than a set of thin connection
   lines or an evenly spaced card grid.

The visible section copy is:

- `One capability layer.`
- `Every way to finish.`
- `Human + agent`
- `Create. Understand. Find. Manage. Deliver.`

No logo, navigation, CTA, install button, terminal panel, browser frame, or
standalone-demo chrome appears in the section. A transient `anycap install`
label is allowed only as part of the scroll narrative.

## Brand And Layout Fidelity

The demo reproduces the current homepage tokens:

- page background: `#f4f5f0`;
- primary text and darkest particles: `#1c1f17`;
- supporting text: `#4d5145`;
- primary olive: `#6b7d3a`;
- pale sage: `#d4dbb8`;
- display type: GeistPixelSquare at weight 500;
- body type: the homepage system sans-serif stack;
- labels and model names: Inter at weight 500;
- horizontal page padding: 32px on mobile, 64px on tablet, and 96px on desktop;
- grain: the same fixed multiply layer at 7 percent opacity used by the main
  site.

The stage inherits the page background and the particle surface is transparent.
There is no glow, neon, glassmorphism, gradient wash, blue prototype field, or
theme inversion.

The copy uses the homepage left edge, display scale, line height, and spacing.
The visualization may overlap the copy zone only with very low-alpha distant
particles; the headline and body remain fully readable at every progress state.

## Spatial Composition

### Portal

The portal is the strongest object in the composition. It occupies roughly one
third of the desktop width and is assembled from five to seven nested depth
layers of olive and near-black square particles. Its outer edges are turbulent,
its inner opening remains readable, and its depth layers create the impression
of a heavy tunnel rather than a flat dotted square.

One human figure and one olive agent figure stand inside the portal opening.
They are small enough to preserve the portal's scale but distinct enough to
make the subject of the story unambiguous.

### Particle Field

Six to eight broad volumetric ribbons exit the portal and travel toward the
right edge. Near particles are larger and darker, distant particles are smaller
and lighter, and turbulent edge scatter prevents the streams from reading as
clean vector lines. The final state is approximately 15 to 20 times denser than
the rejected sparse prototype.

The field must read as continuous visual mass. It must not become isolated
circular particle clouds, thin connectors, a constellation diagram, or a
symmetrical network.

### Embedded Surfaces

Small model anchors, capability labels, and output artifacts sit inside the
particle ribbons at varied depth, scale, and rotation. They are partially
occluded by near particles so they feel suspended in the flow rather than
placed above it as a card grid.

Image, video, page, and delivery artifacts use realistic local thumbnails.
Audio, transcript, code, and share artifacts use restrained dark functional
surfaces. The existing artifact set remains available as visual proof:
Research, Editorial image, Screenshot analysis, Vision crop, Cinematic video,
Audio, Transcript, Share link, Music track, Search result, Generated variants,
Code snippet, and Delivered.

## Right-Side Cluster Narrative

The right side separates into four asymmetric but connected clusters. These
clusters communicate the product structure without turning the visual into an
inventory table.

### Cluster 1: Latest Models

This is the earliest and highest-contrast cluster after the portal. It answers
`What current models can my agent use?`

Desktop selects five recent representative names from the current sorted
inventory in `web/src/lib/model-hub.ts`, preserving modality variety rather
than pretending to be a strict popularity ranking. For the current source
state, the intended anchors are:

- Seedance 2.0 Mini;
- Doubao Seed Audio 1.0;
- Kling 3.0;
- Seedance 2.0;
- Nano Banana 2 Lite.

The implementation must derive or verify these names against the source file;
it must not duplicate a new permanent model catalog inside the demo. The label
is `Latest models`, not `Trending`, because the site has update dates but no
real-time popularity metric. Model names use text only, without provider logos,
trademark marks, or colorful brand treatments.

### Cluster 2: Core Capabilities

This is the largest and most stable cluster. It answers `What can I do with
those models?`

It contains six capability anchors:

- Image;
- Video;
- Audio;
- Music;
- Understanding;
- Search.

Each anchor is surrounded by its relevant output particles or artifact surface.
The anchors do not form six equal cards. Image and Video may carry more visual
mass, while Audio, Music, Understanding, and Search remain clearly legible
secondary branches.

### Cluster 3: Delivery Layer

This cluster sits farther along the flow and answers `How does the work get
finished?`

It contains Drive, Share, Page, Publish, and Delivered. Its streams converge
more than the generation streams so the visual direction changes from
expansion to completion. `Delivered` is the final solid artifact, not another
model or generic capability card.

### Cluster 4: Open Horizon

The farthest and lowest-contrast cluster consists of partial particle forms and
clipped paths that continue beyond the viewport. It carries one restrained
line:

`More models. More capabilities. Continuously added.`

This cluster suggests future expansion without naming unsupported products or
inventing roadmap commitments.

## Motion Choreography

The wrapper provides approximately 340 dynamic viewport heights of scroll
range. Its inner stage pins for one viewport. One GSAP ScrollTrigger drives a
single normalized progress value used by both the DOM layer and particle
renderer.

### 0–16%: Limited Agent

The agent enters on a thin, dim path that terminates early. Only a small amount
of ambient particulate matter is visible. The human remains present at lower
emphasis.

### 16–32%: Install And Assemble

A transient `anycap install` command sends a compact AnyCap square to the
agent. Surrounding particles accelerate inward and assemble the five-to-seven
layer portal with a restrained compression and release. The portal is built
from depth outward; it does not simply fade or scale into view.

### 32–53%: Latest Models Connect

The five latest-model anchors wake in two staggered waves. Their particles move
toward the portal, establish that AnyCap is the common model access layer, and
then pass through it. This inward-to-outward direction change is essential to
the narrative.

### 48–78%: Capability Avalanche

Particles leaving the portal widen into six to eight volumetric ribbons. Image
and Video open first, Audio and Music overlap next, and Understanding and Search
complete the core field. Particle mass reaches each position before its text or
artifact surface becomes legible.

Surfaces resolve with opacity, a maximum 14-pixel rise, and a `0.94` to `1`
scale change. No artifact performs an independent card-like entrance.

### 72–92%: Delivery Convergence

Capability streams carry representative outputs toward Drive, Share, Page,
Publish, and Delivered. The particle flow narrows slightly around the final
delivery artifacts so the eye reads a completed path instead of endless
generation.

### 90–100%: Open Horizon And Hold

The approved dense final composition holds. Faint outer branches continue past
the frame and the open-horizon sentence resolves last. Ambient movement becomes
nearly imperceptible before the pin releases. There is no loop, orbit, cursor
effect, or unrelated continuous animation.

GSAP ScrollTrigger uses `start: "top top"`, `pin: true`, and a numeric scrub in
the `0.65` to `0.9` range, tuned in the real browser. Progress mapping remains
deterministic; phase-local smoothstep and brief overshoot curves provide weight
without decoupling the animation from scroll.

## Rendering Architecture

The dense field uses a WebGL2 particle renderer with 18,000 to 30,000 square
point sprites on desktop. WebGL owns portal particles, broad ribbons, turbulent
scatter, depth, and progress-based morphing. A DOM overlay owns copy, model
names, capability labels, and artifact surfaces.

The renderer exposes one small progress interface and precomputed layout state.
It does not own product copy or model inventory. The GSAP wrapper owns lifecycle,
ScrollTrigger setup, resize invalidation, reduced-motion handling, and DOM
surface timing.

If WebGL2 is unavailable, the demo renders the approved final state as a static
canvas/DOM composition. It does not fall back to the rejected sparse 2D network.

## Responsive And Accessibility Behavior

Below 768px, copy remains at the top and the portal occupies the next visual
band. The right-side clusters become a vertical sequence beneath and beside the
portal, with three latest models, four core capabilities, and three delivery
artifacts. Particle count drops while preserving thick ribbons and a readable
portal.

Mobile shortens the pinned range and moves open-horizon branches downward so
there is no horizontal overflow. Labels may be abbreviated only where the
meaning remains clear.

With `prefers-reduced-motion: reduce`, pinning and scrubbing are disabled. The
section renders a static final composition containing the portal, representative
latest models, core capabilities, delivery layer, and open-horizon statement.
All text remains accessible as DOM content.

## Performance Boundaries

- Use one WebGL canvas and one section ScrollTrigger.
- Use a single normalized progress state for every motion phase.
- Cap device pixel ratio at 2.
- Generate particle geometry once per meaningful layout change, not per frame.
- Store source and target positions in typed arrays and interpolate in the
  shader or one batched renderer path.
- Animate DOM surfaces only with transforms and opacity.
- Avoid one tween per particle, scroll event listeners, and layout reads in the
  render loop.
- Pause rendering when the section is outside its active scroll range.
- Refresh layout after fonts are ready and after meaningful viewport changes.
- Keep the visible desktop field between 18,000 and 30,000 particles; reduce
  count for mobile, low-power conditions, and reduced motion.

## Verification

Verification is browser-behavior based for the standalone visual companion:

- the demo contains exactly one semantic section;
- background, fonts, grain, color, and horizontal padding match the homepage;
- desktop and mobile have no horizontal overflow;
- one pinned ScrollTrigger sequence starts and releases cleanly;
- the initial frame shows a limited agent path;
- installation visibly assembles a thick five-to-seven-layer portal;
- model particles travel inward before capability particles travel outward;
- the latest-model cluster matches current names in `web/src/lib/model-hub.ts`;
- the core cluster clearly exposes Image, Video, Audio, Music, Understanding,
  and Search;
- the delivery cluster resolves Drive, Share, Page, Publish, and Delivered;
- the final frame has six to eight broad ribbons and dense continuous mass;
- artifact surfaces are embedded at varied depth instead of forming a grid;
- the open-horizon statement appears last and no unsupported model is named;
- reduced motion renders a readable static final composition;
- the browser console contains no runtime errors;
- the page makes no remote image requests.

## Non-Goals

- changing the existing homepage hero or any production section in this cycle;
- changing production copy, routes, model inventory, metadata, or analytics;
- presenting a popularity ranking without a real popularity data source;
- adding model/provider logos or a brand-logo wall;
- creating an interactive model browser or dashboard;
- adding a CTA, install button, terminal, navigation, footer, or browser chrome;
- adding dark mode, smooth-scroll libraries, parallax, cursor effects, or glow;
- naming unshipped models inside the open-horizon cluster;
- creating another git branch.
