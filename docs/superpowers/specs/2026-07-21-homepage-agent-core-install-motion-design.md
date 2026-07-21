# Homepage Agent Core Install Motion Design

## Purpose

Add one interactive section to the existing AnyCap homepage that makes the
product promise tangible: an agent begins with an empty capability socket, the
user installs the AnyCap Core, and the same agent immediately gains the
generation, understanding, retrieval, management, and delivery capabilities
already represented by the current web inventory.

This is a production homepage integration. It does not redesign or replace the
current hero, header, navigation, footer, or later editorial sections. The new
section is inserted in the middle of the current landing narrative, after the
`NOW IT CAN.` transition and before the existing capability statements.

## Approved Visual Direction

The approved composition is a wide 16:9 section with three stable zones:

1. left: the product statement and install command;
2. center-left: a vertical capability status panel;
3. right: a premium matte upper-body agent with an empty square chest socket,
   facing a removable AnyCap Core standing in a dock on a physical tabletop.

The robot is an abstract AnyCap agent, not a character mascot and not a copy of
Iron Man or another existing character. It has an off-white matte shell, a dark
segmented neck, one restrained horizontal perception strip, precise panel
seams, and small olive status pixels. It remains an upper-body composition and
does not drift into a full-body character or a generic sci-fi robot.

The Core starts on the tabletop. It never floats without physical support in
the idle state. The robot looks toward the Core before installation and toward
the user's pointer while idle.

## Brand Fidelity

The section uses the production landing page as the exact source of truth:

- page surface: `#f4f5f0`;
- primary ink: `#1c1f17`;
- body ink: `#3a3e32` and `#4d5145`;
- olive: `#6b7d3a`;
- sage: `#8fa34e`;
- divider: `#dce0d2`;
- display type: `var(--font-geist-pixel-square), monospace`;
- UI labels: `var(--font-mono), monospace` at weight 500;
- terminal copy: `var(--font-logo), monospace`;
- body copy: the current system sans-serif stack;
- desktop horizontal padding: 96px, tablet 64px, mobile 32px;
- background grain: the existing fixed 200-by-200 noise tile at 7 percent
  opacity with multiply blending.

The implementation must reuse the existing page surface and grain overlay. It
must not bake text or the page background into the robot asset. There is no
warm beige studio backdrop, gradient wash, blue glow, glassmorphism, or second
grain layer.

## Copy

Visible copy is fixed to:

- `One capability layer.`
- `Every way to finish.`
- `Human + agent`
- `Create. Understand. Find. Manage. Deliver.`
- `anycap install`
- `Core status / Awaiting`
- `Create`
- `Understand`
- `Search`
- `Manage`
- `Deliver`

After installation, the status header becomes `Core status / Connected`.

The section is product narrative, not a second hero. It contains no logo,
navigation, conversion CTA, provider logo wall, model card grid, or repeated
hero explanation.

## Source-Backed Capability Values

The capability panel begins at `00` in every row. After installation it counts
to values derived from the current public capability inventory:

- Create: `04` — image, video, music, and audio generation;
- Understand: `03` — image, video, and audio understanding;
- Search: `03` — web search, grounded search, and web crawl;
- Manage: `01` — Drive storage;
- Deliver: `01` — page hosting and publishing.

These are capability-surface counts, not performance scores and not marketing
claims. The production implementation must derive them from an exported group
on the existing `web/src/lib/capability-inventory.ts` source, so adding or
removing a public capability updates the section without editing animation
code. This first version does not show a model count; the five source-backed
capability totals are the only numeric product claims in the section.

`One auth flow` remains a system attribute and is not counted in the five
capability rows.

## Interaction States

### 1. Awaiting

- The robot's chest socket is visibly empty.
- The Core rests upright in its tabletop dock.
- All five capability rows show `00` and empty outlined cells.
- The perception strip contains only a few dim olive pixels.
- On fine-pointer devices, the robot head follows the pointer within restrained
  limits: approximately nine degrees of horizontal turn and five degrees of
  vertical tilt.
- The head does not translate across the page. Motion comes only from rotation
  around a stable neck pivot and a smaller perception-strip response.

### 2. Core selected

- The Core is an accessible interactive control.
- Pointer users can drag it from the dock toward the chest socket.
- Keyboard users can focus it and press Enter or Space to run the same install
  sequence.
- Touch users tap the Core to install; mobile does not require precision drag.
- While dragging, the robot tracks the Core rather than the raw pointer.
- Releasing outside the socket returns the Core to the dock with a short,
  weighted spring. Releasing within the socket commits the installation.

### 3. Installing

- The Core moves from its actual dock coordinates to the actual chest-socket
  coordinates; no viewport-specific hard-coded travel distance is allowed.
- It follows a restrained shallow arc, scales to the socket, aligns square,
  and snaps inward.
- Socket rings compress in sequence, then settle once. There is no repeated
  pulsing reactor effect.
- A small field of square olive particles is pulled into the socket, followed
  by one subtle outward confirmation wave.
- The perception strip fills from the center outward and the robot raises its
  head slightly, communicating activation rather than surprise.

### 4. Connected

- The header changes to `Core status / Connected`.
- The five row values count from `00` to their source-backed totals.
- Each outlined row fills from left to right with olive cells. The value and
  fill finish together.
- The final robot pose is stable and attentive. The head can resume pointer
  tracking with lower amplitude.
- The state holds. There is no perpetual orbit, glow, or autonomous loop.

The experience resets on page reload. A replay control is intentionally
omitted from this first version to keep the section visually identical to the
approved master.

## Motion Choreography

GSAP owns all sequencing. The page uses a section-scoped client wrapper and one
named timeline with readable labels:

- `scene-in`: copy, status rules, robot, dock, and Core settle into place;
- `pickup`: Core leaves the dock and the robot gaze locks to it;
- `dock`: Core aligns and enters the chest socket;
- `activate`: socket rings compress, perception pixels wake, and particles
  resolve;
- `capabilities`: values count and rows fill in a short stagger;
- `hold`: all elements settle to their connected positions.

The entrance is triggered once with ScrollTrigger when the section reaches the
middle of the viewport. The section is not scroll-pinned. Installation remains
an explicit user action and is never forced merely by scrolling.

Use `@gsap/react` with a scoped `useGSAP` hook. Pointer-created tweens must use
`contextSafe`, `gsap.quickTo`, or explicitly killed scoped tweens. Target real
refs, animate only transforms and opacity where possible, and revert the GSAP
context on unmount.

## Component Architecture

All new components live under `web/src/components/landing/agent-core/`:

- `AgentCoreInstallSection` — semantic section, layout, state ownership, and
  accessibility;
- `AgentCoreScene` — image layers, socket geometry, table, dock, and responsive
  composition;
- `AgentHeadTracker` — normalized pointer/Core target mapping and clamped head
  rotation;
- `AnyCapCoreControl` — pointer capture, drag threshold, hit testing, keyboard
  activation, and return-to-dock behavior;
- `CapabilityTelemetry` — source-backed rows, zero/connected rendering, and
  animation refs;
- `useAgentCoreTimeline` — one page-specific GSAP wrapper for entrance and
  install choreography;
- `agent-core-stats.ts` — adapter from the public capability inventory and
  model catalog into the section's five display rows.

The public homepage imports only `AgentCoreInstallSection`. The component is
inserted without changing existing landing copy or removing existing sections.

## Asset Architecture

The approved master is decomposed into real raster assets rather than rebuilt
with CSS shapes:

- `robot-body.webp` — upper torso, neck, arms, and empty chest socket;
- `robot-head.webp` — isolated helmet/head with the exact approved camera;
- `anycap-core.webp` — isolated Core module;
- `core-dock.webp` — isolated tabletop dock.

Assets are generated from the approved visual direction, inspected at desktop
and mobile sizes, and stored under `web/public/visuals/agent-core/`. They have
transparent backgrounds, matching perspective and light direction, no baked
page grain, no baked copy, and no arbitrary background padding.

The tabletop itself is a semantic layout surface using the page background and
a `#dce0d2` hairline. Contact shadows belong to the object assets or one small
CSS shadow directly under the object; there is no studio floor gradient.

## Responsive Behavior

### Desktop, 1280px and wider

- Use the approved three-zone composition.
- The robot occupies the right 44 to 48 percent of the section.
- The capability panel remains between copy and robot.
- Pointer tracking and drag-to-install are enabled.
- The section uses `min-height: 100svh` and does not pin.

### Tablet, 768px to 1279px

- Keep copy on the left and robot on the right.
- Move telemetry below the headline when needed to prevent overlap.
- Reduce head rotation amplitude and Core travel distance through measured
  coordinates, not separate animation constants.

### Mobile, below 768px

- Stack copy, robot scene, and telemetry in that order.
- Show the robot from shoulders upward with the socket and dock visible.
- Tap-to-install replaces drag-to-install.
- Pointer tracking is disabled.
- No horizontal overflow and no important object crop.

## Accessibility And Reduced Motion

- The visual has a concise accessible name describing an agent awaiting the
  AnyCap Core.
- Decorative particles and image layers are hidden from assistive technology.
- The Core uses native button semantics and a visible focus treatment.
- Live status changes are announced politely once, without announcing every
  counting frame.
- With `prefers-reduced-motion: reduce`, create no ScrollTrigger and no pointer
  tracking. Render the connected state statically, with the Core installed and
  the final source-backed values visible.
- The page remains fully understandable when JavaScript is unavailable: the
  server-rendered fallback shows the connected final state and the full copy.

## Performance Constraints

- No Three.js, WebGL scene, smooth-scroll library, or continuous requestAnimationFrame loop.
- Use optimized WebP layers sized to their rendered slots, with a 2x maximum
  source size and explicit intrinsic dimensions.
- Use the default lazy-loading behavior of `next/image` for the section's image
  layers and preserve every intrinsic layout box.
- Pause pointer response when the section is outside the viewport.
- Avoid layout reads during every pointer move. Cache stage bounds and refresh
  on resize or ScrollTrigger refresh.
- The particle confirmation uses a bounded DOM or canvas burst and stops after
  installation.

## Testing And Verification

Implementation follows test-first development.

Automated tests cover:

- the five capability values are derived from the inventory groups;
- awaiting and connected state labels render correctly;
- keyboard activation starts installation;
- failed drag returns the Core to its dock;
- successful drop commits exactly once;
- reduced motion renders the static connected state and creates no
  ScrollTrigger;
- mobile uses tap installation and disables pointer tracking;
- the homepage keeps its original hero copy and renders the new section once.

Browser verification covers:

- current homepage background, grain, and font roles match above and below the
  section without a seam;
- the approved desktop read order is copy, telemetry, robot, Core;
- the head pivot is stable and does not translate or detach;
- the Core starts on the desk, returns correctly, and lands exactly in the
  socket;
- value fills finish at `04`, `03`, `03`, `01`, and `01`;
- no horizontal overflow at 390px, 768px, 1280px, and 1672px;
- reduced-motion behavior is static and legible;
- no console errors, React hydration warnings, or detached GSAP targets.

The final visual review compares a production screenshot of the new section at
1672 by 941 against the approved master. Differences in object position,
background tone, font role, table height, socket position, and crop are fixed
before completion.

## Scope Boundaries

This change does not:

- change the homepage hero;
- remove or rewrite existing landing sections;
- add new capability or model claims;
- change routes, SEO metadata, navigation, pricing, or authentication;
- add a general animation framework for unrelated pages;
- ship the old particle-portal design to production;
- open another branch or worktree.

All work continues on `codex/doubao-audio-positioning`.
