# Homepage Dense Particle Clusters Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the standalone AnyCap capability-section demo as a dense WebGL2 particle portal whose right side resolves into Latest models, Core capabilities, Delivery layer, and Open horizon clusters.

**Architecture:** Keep production `web/` unchanged. Replace the current Canvas 2D sparse renderer inside the tracked standalone HTML with one WebGL2 point-sprite renderer and retain a DOM overlay for copy, model names, cluster labels, and artifact surfaces. One GSAP ScrollTrigger writes a normalized progress value consumed by both layers; the existing builder produces the self-contained browser companion at `http://localhost:62893/`.

**Tech Stack:** Semantic HTML, CSS, WebGL2/GLSL ES 3.00, vanilla JavaScript, GSAP 3.13, ScrollTrigger 3.13, Node.js contract checks, Chromium browser inspection.

## Global Constraints

- Work only on branch `codex/doubao-audio-positioning`; create no branch or worktree.
- Do not modify production files under `web/`.
- Keep exactly one semantic `<section>`, one transparent `<canvas>`, and one ScrollTrigger.
- Preserve `#f4f5f0`, `#1c1f17`, `#4d5145`, `#6b7d3a`, `#d4dbb8`, the current grain, GeistPixelSquare 500, system sans body, and Inter 500 labels.
- Keep the visible copy exactly `One capability layer.`, `Every way to finish.`, `Human + agent`, and `Create. Understand. Find. Manage. Deliver.`
- Keep the homepage hero, navigation, CTA, footer, and production page untouched.
- The 18,000 to 30,000 particles applies only to WebGL desktop paths, including reduced-motion and low-power WebGL; mobile WebGL may use fewer while retaining thick continuous ribbons. The static fallback reports zero WebGL particles and is validated as a responsive SVG composition instead of claiming particle telemetry.
- The portal uses five to seven depth layers and six to eight broad outgoing ribbons.
- Right-side labels are `Latest models`, `Core capabilities`, `Delivery layer`, and `More models. More capabilities. Continuously added.`
- Recent representative models are Seedance 2.0 Mini, Doubao Seed Audio 1.0, Kling 3.0, Seedance 2.0, and Nano Banana 2 Lite, verified against `web/src/lib/model-hub.ts`.
- Core capabilities are Image, Video, Audio, Music, Understanding, and Search.
- Delivery labels are Drive, Share, Page, Publish, and Delivered.
- Keep only the human and agent figures inside the portal plus the transient `anycap install` proof; remove cursor lanes and the agent-name proof line.
- Keep the canvas, figures, clusters, and artifacts decorative, and provide an always-present visually hidden semantic summary outside that `aria-hidden` visual tree for models, capabilities, delivery, horizon, and representative artifacts.
- In no-JavaScript mode, suppress that always-present semantic summary and expose only the dedicated `<noscript>` proof so assistive technology does not receive duplicate evidence.
- Do not use provider logos, a card grid, radial particle clouds, glow, neon, glassmorphism, remote assets, custom scroll listeners, or one tween per particle.
- Reduced motion renders the final clustered composition without pinning.
- Keep `.capability-field` at `340dvh` on desktop and `240dvh` on mobile. Derive the single ScrollTrigger end dynamically from the positive `field.offsetHeight - window.innerHeight` distance so desktop resolves to about `240vh`, mobile resolves to about `140vh`, and normalized progress reaches `1` at the bottom of either page.

---

### Task 1: Replace The Sparse-Renderer Contract

**Files:**

- Modify: `docs/superpowers/demos/verify-homepage-agent-capability-motion.mjs`
- Test: `docs/superpowers/demos/verify-homepage-agent-capability-motion.mjs`

**Interfaces:**

- Consumes: tracked source and self-contained built companion.
- Produces: structural assertions for `createDenseParticleRenderer(canvas)`, WebGL2 shaders, the WebGL-only 18k desktop minimum, a responsive static fallback, four cluster layers, current model names, accessible semantic evidence, reduced motion, and one ScrollTrigger.

- [ ] **Step 1: Write failing dense-renderer assertions**

Replace the obsolete Canvas 2D geometry assertions with these contracts:

```javascript
for (const contract of [
  "function createDenseParticleRenderer(canvas)",
  'canvas.getContext("webgl2"',
  "#version 300 es",
  "gl.POINTS",
  "const DESKTOP_PARTICLE_MIN = 18000",
  "const DESKTOP_PARTICLE_MAX = 30000",
  "const PORTAL_LAYER_COUNT = 6",
  "const RIBBON_COUNT = 7",
  'class="cluster cluster-latest"',
  'class="cluster cluster-core"',
  'class="cluster cluster-delivery"',
  'class="cluster cluster-horizon"',
  "Latest models",
  "Core capabilities",
  "Delivery layer",
  "More models. More capabilities. Continuously added.",
  "Seedance 2.0 Mini",
  "Doubao Seed Audio 1.0",
  "Kling 3.0",
  "Seedance 2.0",
  "Nano Banana 2 Lite",
  "Image",
  "Video",
  "Audio",
  "Music",
  "Understanding",
  "Search",
  "Drive",
  "Share",
  "Page",
  "Publish",
  "Delivered",
]) assert.ok(source.includes(contract), `source contains ${contract}`);

assert.equal((source.match(/ScrollTrigger\.create\(/g) ?? []).length, 1);
assert.doesNotMatch(source, /getContext\(["']2d["']\)/);
assert.doesNotMatch(source, /window\.addEventListener\(["']scroll["']/);
```

- [ ] **Step 2: Run the contract and confirm failure**

Run:

```bash
node docs/superpowers/demos/verify-homepage-agent-capability-motion.mjs /Users/tyluo/.codex/visualizations/2026/07/19/019f788b-cbe7-7a91-aa82-82e5ed1f1dcd/particle-scroll-demo/.superpowers/brainstorm/89119-1784459419/content/particle-bloom-demo-v3.html
```

Expected: non-zero exit with `source contains function createDenseParticleRenderer(canvas)`.

- [ ] **Step 3: Keep build-integrity assertions**

Retain exact source-to-built derivation, embedded local fonts/runtimes, one section, one canvas, zero remote assets, and GSAP/ScrollTrigger version checks. Change the referenced plan path to `2026-07-20-homepage-dense-particle-clusters.md`.

- [ ] **Step 4: Commit the failing contract**

```bash
git add docs/superpowers/demos/verify-homepage-agent-capability-motion.mjs
git commit -m "test(web): specify dense particle capability clusters"
```

---

### Task 2: Implement The Dense WebGL Portal And Clusters

**Files:**

- Modify: `docs/superpowers/demos/homepage-agent-capability-motion.source.html`
- Test: `docs/superpowers/demos/verify-homepage-agent-capability-motion.mjs`

**Interfaces:**

- Consumes: one canvas, normalized scroll progress, current section copy, existing artifact markup, current model names.
- Produces: `createDenseParticleRenderer(canvas)` returning `{ layout(width, height, reducedMotion), render(progress), destroy(), particleCount }`; four `.cluster` DOM regions; `window.__ANYCAP_DEMO__.renderAt(progress)` for deterministic browser inspection.

- [ ] **Step 1: Replace the right-side DOM hierarchy**

Use this semantic overlay inside `.particle-visual` after the canvas:

```html
<div class="cluster-field" aria-hidden="true">
  <div class="cluster cluster-latest"><span class="cluster-title">Latest models</span><div class="cluster-items latest-items"></div></div>
  <div class="cluster cluster-core"><span class="cluster-title">Core capabilities</span><div class="cluster-items core-items"></div></div>
  <div class="cluster cluster-delivery"><span class="cluster-title">Delivery layer</span><div class="cluster-items delivery-items"></div></div>
  <div class="cluster cluster-horizon"><span>More models. More capabilities. Continuously added.</span></div>
</div>
<div class="artifact-field"></div>
```

Position clusters asymmetrically: latest across the upper-right ribbon, core through the middle and lower-middle, delivery near the far-right convergence, and horizon clipped near the outer edge. Preserve only the portal figures and transient install proof. After `.particle-visual`, add the always-present visually hidden semantic summary so JavaScript and reduced-motion screen-reader users receive the same evidence without exposing decorative visuals.

- [ ] **Step 2: Add deterministic cluster data**

Use these exact definitions:

```javascript
const latestModels = ["Seedance 2.0 Mini", "Doubao Seed Audio 1.0", "Kling 3.0", "Seedance 2.0", "Nano Banana 2 Lite"];
const coreCapabilities = ["Image", "Video", "Audio", "Music", "Understanding", "Search"];
const deliveryCapabilities = ["Drive", "Share", "Page", "Publish", "Delivered"];
const DESKTOP_PARTICLE_MIN = 18000;
const DESKTOP_PARTICLE_MAX = 30000;
const PORTAL_LAYER_COUNT = 6;
const RIBBON_COUNT = 7;
```

Build label elements from these arrays and use text only. The latest cluster must not claim a popularity rank.

- [ ] **Step 3: Implement `createDenseParticleRenderer`**

Create one WebGL2 program with interleaved source/final position, size, olive mix, alpha, delay, and role attributes. The vertex shader interpolates from the limited path through the six-layer portal and into seven ribbon/cluster targets based on normalized progress. The fragment shader discards pixels outside a square point sprite and mixes `#1c1f17` with `#6b7d3a`.

The public interface is `createDenseParticleRenderer(canvas)`, returning
`layout(width: number, height: number, reducedMotion: boolean): void`,
`render(progress: number): void`, `destroy(): void`, and the read-only numeric
property `particleCount`. `layout` regenerates typed arrays and uploads buffers
only when geometry changes; `render` clamps progress, writes one `uProgress`
uniform, clears transparent pixels, and issues one `gl.drawArrays(gl.POINTS,
0, particleCount)` call; `destroy` deletes every allocated buffer, shader, and
program. If `canvas.getContext("webgl2", { alpha: true, antialias: false,
premultipliedAlpha: true })` returns null, return the static final-state renderer
instead.

Portal target generation assigns 42 percent of desktop WebGL particles across six nested square frames with turbulent edge offsets. Encode normalized portal layer/depth in particle data and consume it in the vertex shader so inner/deeper layers start first and outer layers finish by `0.32`. Around the portal center, apply a short scale pulse bounded to `0.98` compression and `1.03` release overshoot, returning to `1` before the Latest models phase. Ribbon generation assigns 48 percent across seven cubic paths whose thickness increases toward cluster destinations. The remaining 10 percent produces near/far scatter and clipped open-horizon branches. Sizes range from 0.8 to 4.8 CSS pixels with depth-correlated alpha; clamp the shader's effective CSS size to that exact range before DPR scaling. Every desktop WebGL branch, including reduced-motion and low-power WebGL, must report at least `DESKTOP_PARTICLE_MIN`.

The WebGL-null fallback generates its final SVG from the current layout width and height. It contains six nested portal layers and seven broad square-dashed ribbons whose endpoints remain inside both desktop and `390×844` canvases. It reports `particleCount: 0`, because it is not a WebGL particle renderer, and regenerates on meaningful responsive layout changes. Synchronize the renderer type onto `.capability-field` and the document root, then collapse a static field to exactly `100dvh`; static mode creates no ScrollTrigger and must not leave the desktop `240dvh` or mobile `140dvh` narrative remainder blank.

- [ ] **Step 4: Couple DOM reveal to particle arrival**

Use one `renderAt(progress)` function; particle completion must be strictly earlier than the corresponding DOM reveal start, so particle mass is already in place before text or artifacts become perceptibly legible. Latest particles complete at `0.50` before a `0.505–0.53` DOM reveal; core particles complete at `0.74` before a `0.745–0.78` core reveal; delivery particles complete at `0.88` before a `0.885–0.92` reveal; horizon particles complete at `0.97` before a `0.975–1.00` reveal. Apply only opacity and transform.

Every artifact definition carries an explicit `core` or `delivery` narrative role. Core artifacts start at `0.748` and all finish by `0.78`. `Share link` and `Delivered` are delivery evidence: they start only after delivery particle completion, at `0.885` and `0.891`, and finish by `0.92`. Artifact timing is selected from the definition's role rather than applying one core interval to all thirteen surfaces.

- [ ] **Step 5: Preserve one GSAP ScrollTrigger**

Create exactly one controller:

```javascript
ScrollTrigger.create({
  trigger: ".capability-stage",
  start: "top top",
  end: () => `+=${capabilityScrollDistance()}`,
  pin: true,
  scrub: 0.72,
  onUpdate: ({ progress }) => renderAt(progress),
});
```

Reduced motion calls `renderAt(1)` and creates no ScrollTrigger. Define `capabilityScrollDistance()` as `Math.max(1, field.offsetHeight - window.innerHeight)` using the actual `.capability-field` element, and return that relative pixel distance from the dynamic `end` callback. ScrollTrigger reevaluates it on refresh, so both the desktop `340dvh` wrapper and mobile `240dvh` wrapper reach normalized progress `1` and the horizon act at their real bottom scroll. Resize uses a named `window` resize callback plus `ResizeObserver`, coalesces both with `requestAnimationFrame`, and calls renderer layout only when width, height, DPR, or motion preference changes; it never listens for scroll directly. Teardown cancels any queued resize frame and removes the named resize and media-query change listeners before destroying the renderer.

- [ ] **Step 6: Run the contract until it passes**

Run the verification command from Task 1. Expected final line:

```text
homepage dense particle clusters contract: pass
```

- [ ] **Step 7: Commit the renderer and layout**

```bash
git add docs/superpowers/demos/homepage-agent-capability-motion.source.html docs/superpowers/demos/verify-homepage-agent-capability-motion.mjs
git commit -m "feat(web): build dense particle capability clusters"
```

---

### Task 3: Build And Verify The Browser Companion

**Files:**

- Read: `docs/superpowers/demos/homepage-agent-capability-motion.source.html`
- Read: `docs/superpowers/demos/verify-homepage-agent-capability-motion.mjs`
- Build output: `/Users/tyluo/.codex/visualizations/2026/07/19/019f788b-cbe7-7a91-aa82-82e5ed1f1dcd/particle-scroll-demo/.superpowers/brainstorm/89119-1784459419/content/particle-bloom-demo-v3.html`

**Interfaces:**

- Consumes: passing source contract and existing build script.
- Produces: live refreshed preview at `http://localhost:62893/` and captured evidence for initial, middle, final, mobile, and reduced-motion states.

- [ ] **Step 1: Build the self-contained companion**

```bash
node docs/superpowers/demos/build-homepage-agent-capability-motion.mjs build /Users/tyluo/.codex/visualizations/2026/07/19/019f788b-cbe7-7a91-aa82-82e5ed1f1dcd/particle-scroll-demo/.superpowers/brainstorm/89119-1784459419/content/particle-bloom-demo-v3.html
```

Expected: `built standalone companion: /Users/tyluo/.codex/visualizations/2026/07/19/019f788b-cbe7-7a91-aa82-82e5ed1f1dcd/particle-scroll-demo/.superpowers/brainstorm/89119-1784459419/content/particle-bloom-demo-v3.html`.

- [ ] **Step 2: Run source/build contracts**

Run the Task 1 verification command and `git diff --check`. Expected: both pass.

- [ ] **Step 3: Inspect deterministic browser states**

At 1440×900 use `window.__ANYCAP_DEMO__.renderAt(0)`, `.renderAt(0.5)`, and `.renderAt(1)`. Confirm the final WebGL state has a thick portal, seven broad ribbons, four readable clusters, embedded artifacts, no copy collision, and 18,000–30,000 particles. Confirm the middle state shows model streams entering before capability streams leave.

- [ ] **Step 4: Inspect mobile and reduced motion**

At 390×844 confirm no horizontal overflow, the portal remains readable, at least three model names and four core capabilities are visible, and delivery flows downward. Emulate reduced motion and confirm no ScrollTrigger is created and the final composition is static.

- [ ] **Step 5: Inspect runtime health**

Confirm no console errors, no remote requests, WebGL2 is active on supported Chromium, and the fallback final composition appears if WebGL2 creation is forced to return null. At desktop and `390×844`, confirm the fallback's six portal layers and seven broad ribbons remain inside the canvas, its reported WebGL particle count is zero, its field height is exactly one viewport, and no blank narrative scroll remains. With JavaScript disabled, confirm assistive evidence appears only once through the `<noscript>` proof.

- [ ] **Step 6: Commit any verification fixes**

```bash
git add docs/superpowers/demos/homepage-agent-capability-motion.source.html docs/superpowers/demos/verify-homepage-agent-capability-motion.mjs docs/superpowers/plans/2026-07-20-homepage-dense-particle-clusters.md
git commit -m "fix(web): polish dense capability section preview"
```
