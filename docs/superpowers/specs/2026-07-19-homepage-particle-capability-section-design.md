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

The motion tells one before-and-after sequence:

1. an agent enters with a narrow, visibly limited capability path;
2. `anycap install` docks an AnyCap module onto the agent and ignites the
   central portal;
3. current mainstream model anchors connect into the portal as one model
   layer;
4. model input crosses the AnyCap layer and bursts outward as creation,
   understanding, retrieval, storage, and delivery capabilities;
5. finished artifacts resolve from those streams while additional unlabeled
   routes continue beyond the frame, showing that more models and capabilities
   will keep joining the same layer.

The visible copy remains concise:

- `One capability layer.`
- `Every way to finish.`
- `Human + agent`
- `Create. Understand. Find. Manage. Deliver.`

The motion may also show three short, non-interactive proof lines:

- `anycap install` during the docking beat;
- `Codex · Claude Code · Cursor · any agent` beside the incoming agent lane;
- `More models. More capabilities. Continuously added.` in the final extension
  field.

These lines are evidence inside the narrative, not buttons, badges, or a second
headline.

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

The visual combines one canvas-based particle field with restrained DOM
artifact micro-compositions. It is not a dashboard or a card grid: the portal,
particle routes, and sense of one capability layer remain the dominant image.

Particles use the existing olive and near-black colors with restrained alpha.
They form a central AnyCap square and fan out into asymmetric branches. Each
branch represents a real capability family already expressed on the public
site:

- create: image, video, music, and voice;
- understand: image and video analysis;
- find: search and retrieval;
- manage: upload and storage;
- deliver: pages and shareable outputs.

Thirteen small artifacts make the endpoint story tangible: Research, Editorial
image, Screenshot analysis, Vision crop, Cinematic video, Audio, Transcript,
Share link, Music track, Search result, Generated variants, Code snippet, and
Delivered. They are visual evidence of what humans and agents can finish, not
interactive fake application windows. Their labels use Inter and remain
secondary to the particle portal and streams.

The final frame is intentionally more expansive than the previous demo. It
shows many outputs around one stable center, with enough empty space to preserve
the homepage's restrained density.

The center resolves as a thick, hollow particle portal containing one human
figure and one agent figure. Two understated cursor lanes enter from the copy
side and reinforce that both actors use the same capability layer.

## Agent, Model, And Capability Layers

The agent is the protagonist of the transition, not just another decorative
cursor. Before installation, its route is thin, dim, and terminates early. A
small AnyCap square then travels along the command lane, docks beside the agent,
and expands into the central portal. The portal must feel assembled from
particles with weight and suction; it must not simply fade or scale into view.

The model layer sits visually behind and upstream of the portal. Desktop shows
six to eight text-only model anchors selected from the current sorted inventory
in `web/src/lib/model-hub.ts` at implementation time. Selection should cover
image, video, music, and audio rather than overrepresenting one family. Model
names use restrained Inter text and particle halos; provider logos, trademark
marks, colorful brand treatments, and a logo wall are not used. Mobile shows
three representative anchors.

Model streams travel inward toward AnyCap before capability streams travel
outward. This direction reversal is essential: it makes AnyCap read as the
layer that converts model access into usable agent capability. The existing 13
artifact micro-compositions remain the proof of what the connected agent can
finish.

The final extension field contains additional faint branches, partial clusters,
and clipped paths that continue past the viewport. Only the closest few receive
small generic labels such as `More models` or `More capabilities`; distant
nodes remain unlabeled. This produces an open system rather than a finite list
of 13 features.

## Motion Choreography

The section wrapper provides approximately 320 dynamic viewport heights of
scroll range. Its inner stage pins at `top top` for one viewport height. The
pinned element itself remains static; GSAP animates its children and drives a
single normalized progress value for the canvas renderer.

The progress range is divided into five overlapping acts. Percentages describe
the normalized scroll timeline and are allowed to overlap at the boundaries.

### 0-18%: Limited Agent

Loose particles drift with a slight directional bias rather than random noise.
The agent enters from the copy side on one narrow route. The route stops before
the wider capability field, making the initial limitation legible without an
error state or negative copy. The human lane remains present at lower emphasis.

### 18-36%: Install And Ignite

The transient `anycap install` command resolves, sends a compact AnyCap square
along the agent route, and docks it beside the agent. Nearby particles
accelerate inward, overshoot by no more than 3 percent of the portal width, and
settle into the thick hollow frame. A single restrained compression-and-release
pulse gives the portal weight. The command then recedes so it cannot be read as
a CTA.

### 36-62%: Model Layer Connects

Model anchors wake in two or three staggered waves. Their particles and thin
routes travel toward the portal, with nearer anchors moving first and distant
anchors following. Each anchor briefly sharpens as its stream reaches AnyCap,
then returns to secondary contrast. No model card scales up independently and
all connection timing remains visibly tied to the portal.

### 56-86%: Capability Flood And Artifact Resolve

As model streams cross the portal, their inward motion changes to outward
capability streams. Capability families do not open simultaneously: Create
opens first, Understand and Find overlap next, then Manage and Deliver complete
the field. For every artifact, particles arrive before the DOM surface becomes
legible. The surface then resolves with opacity, a maximum 14-pixel rise, and a
`0.94` to `1` scale change. This arrival-before-surface rule prevents the final
frame from feeling like unrelated cards fading in.

### 86-100%: Open Horizon And Hold

The 13 artifacts hold while lower-alpha branches continue toward partial
clusters and beyond the viewport. The line `More models. More capabilities.
Continuously added.` resolves only after the primary outputs are readable. All
motion settles into a stable final composition before the pin releases. There
is no loop, scroll cue, ambient orbit, or unrelated continuous motion.

GSAP ScrollTrigger uses `start: "top top"`, `pin: true`, and one numeric scrub
value in the `0.65` to `0.9` range, tuned in the real browser. The animation
timeline keeps linear scroll mapping while the renderer applies phase-local
smoothstep and short overshoot curves. This preserves exact scroll control
without making every object move at the same speed. Rendering interpolates
cached particle positions to avoid abrupt state changes.

## Responsive And Accessibility Behavior

At widths below 768px the composition becomes a single column. Copy remains at
the top and the particle field uses the available width beneath it.

Mobile keeps the same narrative but shortens the pinned distance, reduces
particle count, and shows three representative artifacts: Cinematic video,
Transcript, and Delivered. The remaining particle routes preserve the sense of
the wider capability field without making the viewport unreadable.

On mobile, the install beat remains explicit, three model anchors connect in a
single wave, and capability families collapse into three composite routes. The
open-horizon branches continue mostly downward so they do not create horizontal
overflow.

When `prefers-reduced-motion: reduce` is active, pinning and scrubbing are
disabled. The section renders the final post-install connected composition as a
static frame, including representative model anchors and the open-horizon
extension. All copy and capability labels remain readable without JavaScript.

## Performance Boundaries

- Use one canvas and one ScrollTrigger for the section.
- Use one normalized state object for all five acts; do not create separate
  ScrollTriggers for model anchors, artifacts, or the continuation field.
- Cap device pixel ratio at 2.
- Scale particle count by viewport width and reduced-motion preference.
- Cache particle source and target positions after layout.
- Animate DOM elements only with transforms and opacity.
- Avoid scroll event listeners, layout reads inside the render loop, and one
  tween per particle.
- Pause canvas rendering when the section is not active.
- Refresh ScrollTrigger only after fonts are ready and after meaningful layout
  changes.
- Precompute inward model paths, portal positions, outward capability paths,
  and continuation paths during layout; never calculate bezier controls inside
  the render loop.

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
- the initial frame shows a limited agent path, the installation beat visibly
  docks AnyCap to the agent, and model particles travel inward before
  capability particles travel outward;
- desktop shows six to eight current model anchors sourced from
  `web/src/lib/model-hub.ts`, while mobile shows three;
- each artifact remains hidden until its particle stream reaches the endpoint;
- the final desktop frame contains the particle portal, human and agent figures,
  cursor lanes, and all 13 artifact micro-compositions;
- the final frame contains continuation branches beyond the 13 artifacts and
  the exact line `More models. More capabilities. Continuously added.`;
- the final mobile frame keeps the portal readable and shows the three selected
  artifact micro-compositions without copy collisions;
- reduced motion displays the static final composition;
- the canvas remains transparent and correctly resizes;
- the browser console contains no runtime errors;
- the page does not request remote images or unrelated visual assets.

## Non-Goals

- changing the homepage hero or any other production section;
- changing production copy, routes, metadata, structured data, or analytics;
- adding model or agent logos, provider branding, or a logo wall; restrained
  text-only names from the current model inventory are in scope;
- building an interactive dashboard or duplicating the homepage hero,
  navigation, terminal, or conversion controls;
- adding dark mode, theme switching, cursor effects, parallax, or smooth-scroll
  libraries;
- adding an install button or another conversion call to action; the transient
  `anycap install` command is a motion beat, not an interactive control;
- integrating the section into the production homepage before the user approves
  the visual demo;
- creating another git branch.
