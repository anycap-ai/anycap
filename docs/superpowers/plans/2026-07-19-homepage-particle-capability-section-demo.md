# Homepage Particle Capability Section Demo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current visual companion page with one AnyCap-native, scroll-pinned particle capability section for user review.

**Architecture:** Keep production web code unchanged. Rewrite the existing standalone `particle-bloom-demo-v3.html` as a single semantic section, use one transparent canvas renderer driven by one GSAP ScrollTrigger timeline, and load copied local font assets plus existing local GSAP bundles. A small source-contract script provides the failing-first structural check; browser inspection verifies computed styles, motion states, reduced motion, and console health.

**Tech Stack:** Semantic HTML, CSS, Canvas 2D, vanilla JavaScript, GSAP 3.13, ScrollTrigger, Node.js source-contract assertions, Codex in-app browser.

## User Correction: Rich Artifact Composition

This correction supersedes any simplified, label-only geometry or code sample
later in this historical plan. The approved demo is still one middle section
with no production integration, but its final frame must restore the supplied
rich composition: a thick hollow particle portal, human and agent figures,
Human and Agent cursor lanes, particle beams, and 13 restrained artifact
micro-compositions. Those artifacts are endpoint evidence, not an interactive
dashboard. The homepage hero, navigation, CTA, background, fonts, and other
sections remain untouched.

## Global Constraints

- Work only on branch `codex/doubao-audio-positioning`; create no branch or worktree.
- Do not modify production files under `web/`.
- The demo contains exactly one semantic `<section>` and no hero, navigation, footer, terminal, bridge, or extra call to action.
- Use background `#f4f5f0`, primary text `#1c1f17`, supporting text `#4d5145`, accent `#6b7d3a`, and divider `#d4dbb8`.
- Use the real GeistPixelSquare weight-500 font for display copy, the homepage system sans-serif stack for body copy, and the real Inter weight-500 font for capability labels.
- Use horizontal padding of 32px below 768px, 64px from 768px, and 96px from 1024px.
- Reproduce the global grain as a fixed 200px canvas-generated grayscale tile at opacity `0.07` with `mix-blend-mode: multiply`.
- Keep the particle canvas transparent; introduce no independent color field, glow, gradient wash, or theme inversion.
- Visible copy is exactly `One capability layer.`, `Every way to finish.`, `Human + agent`, and `Create. Understand. Find. Manage. Deliver.`
- Artifact endpoints are `Research`, `Editorial image`, `Screenshot analysis`, `Vision crop`, `Cinematic video`, `Audio`, `Transcript`, `Share link`, `Music track`, `Search result`, `Generated variants`, `Code snippet`, and `Delivered`.
- Use one canvas, one ScrollTrigger, `start: "top top"`, `pin: true`, `scrub: 0.8`, and a desktop section height of `320dvh`.
- Use no `window.addEventListener("scroll", ...)`, remote image, remote font, smooth-scroll library, cursor effect, parallax, or perpetual animation.
- Cap canvas device pixel ratio at 2 and perform no layout reads inside the render loop.
- Under `prefers-reduced-motion: reduce`, disable pinning and render the static final connected state.
- At widths below 768px, use a single-column layout, a shorter scroll range, and a reduced particle count.
- Do not show em-dash or en-dash characters in visible page copy.

---

### Task 1: Build And Verify The Section-Only Particle Demo

**Files:**

- Modify: `/Users/tyluo/.codex/visualizations/2026/07/19/019f788b-cbe7-7a91-aa82-82e5ed1f1dcd/particle-scroll-demo/.superpowers/brainstorm/89119-1784459419/content/particle-bloom-demo-v3.html`
- Create: `/Users/tyluo/.codex/visualizations/2026/07/19/019f788b-cbe7-7a91-aa82-82e5ed1f1dcd/particle-scroll-demo/.superpowers/brainstorm/89119-1784459419/content/verify-particle-section.mjs`
- Create binary copy: `/Users/tyluo/.codex/visualizations/2026/07/19/019f788b-cbe7-7a91-aa82-82e5ed1f1dcd/particle-scroll-demo/.superpowers/brainstorm/89119-1784459419/content/vendor/geist-pixel-square.woff2`
- Create binary copy: `/Users/tyluo/.codex/visualizations/2026/07/19/019f788b-cbe7-7a91-aa82-82e5ed1f1dcd/particle-scroll-demo/.superpowers/brainstorm/89119-1784459419/content/vendor/inter-latin.woff2`

**Interfaces:**

- Consumes: local `vendor/gsap.min.js`, local `vendor/ScrollTrigger.min.js`, main-site font assets `web/.next/static/media/GeistPixel_Square.p.31e87829.woff2` and `web/.next/static/media/e4af272ccee01ff0-s.p.woff2`.
- Produces: one standalone HTML section served at the existing `http://localhost:62893/` companion URL; exposes `window.__ANYCAP_DEMO__` with `{ progress, reducedMotion, particleCount, active, renderAt(progress) }` for deterministic browser verification.

- [ ] **Step 1: Create the failing source-contract check**

Create `verify-particle-section.mjs` with Node built-ins only:

```javascript
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));
const html = await readFile(`${root}/particle-bloom-demo-v3.html`, "utf8");

assert.equal((html.match(/<section\b/g) ?? []).length, 1, "exactly one section");
assert.equal((html.match(/<canvas\b/g) ?? []).length, 1, "exactly one canvas");
assert.doesNotMatch(html, /<(nav|footer|img)\b/i);
assert.doesNotMatch(html, /https?:\/\//i);
assert.doesNotMatch(html, /[—–]/u);

for (const token of ["#f4f5f0", "#1c1f17", "#4d5145", "#6b7d3a", "#d4dbb8"]) {
  assert.ok(html.includes(token), `contains ${token}`);
}

for (const text of [
  "One capability layer.",
  "Every way to finish.",
  "Human + agent",
  "Create. Understand. Find. Manage. Deliver.",
  "Research", "Editorial image", "Screenshot analysis", "Vision crop",
  "Cinematic video", "Audio", "Transcript", "Share link", "Music track",
  "Search result", "Generated variants", "Code snippet", "Delivered",
]) {
  assert.ok(html.includes(text), `contains ${text}`);
}

for (const contract of [
  "geist-pixel-square.woff2",
  "inter-latin.woff2",
  "prefers-reduced-motion: reduce",
  "gsap.registerPlugin(ScrollTrigger)",
  'start: "top top"',
  "pin: true",
  "scrub: 0.8",
  "320dvh",
  "window.__ANYCAP_DEMO__",
]) {
  assert.ok(html.includes(contract), `contains ${contract}`);
}

console.log("particle section source contract: pass");
```

- [ ] **Step 2: Run the contract and verify the existing demo fails**

Run:

```bash
node /Users/tyluo/.codex/visualizations/2026/07/19/019f788b-cbe7-7a91-aa82-82e5ed1f1dcd/particle-scroll-demo/.superpowers/brainstorm/89119-1784459419/content/verify-particle-section.mjs
```

Expected: FAIL at `exactly one section` because the current full-page prototype still contains multiple sections.

- [ ] **Step 3: Copy the exact local font assets**

Run these binary asset copies:

```bash
cp /Users/tyluo/go/src/engineering/anycap/web/.next/static/media/GeistPixel_Square.p.31e87829.woff2 /Users/tyluo/.codex/visualizations/2026/07/19/019f788b-cbe7-7a91-aa82-82e5ed1f1dcd/particle-scroll-demo/.superpowers/brainstorm/89119-1784459419/content/vendor/geist-pixel-square.woff2
cp /Users/tyluo/go/src/engineering/anycap/web/.next/static/media/e4af272ccee01ff0-s.p.woff2 /Users/tyluo/.codex/visualizations/2026/07/19/019f788b-cbe7-7a91-aa82-82e5ed1f1dcd/particle-scroll-demo/.superpowers/brainstorm/89119-1784459419/content/vendor/inter-latin.woff2
```

Expected: both destination files exist and are non-empty.

- [ ] **Step 4: Replace the full-page prototype with the minimal semantic shell**

The document body must follow this structure and contain no sibling page sections:

```html
<body>
  <main>
    <section class="capability-field" aria-labelledby="capability-title">
      <div class="capability-stage">
        <div class="capability-copy">
          <h2 id="capability-title">
            <span>One capability layer.</span>
            <span>Every way to finish.</span>
          </h2>
          <p>Human and agent work through the same capability field.</p>
        </div>
        <div class="particle-visual" aria-hidden="true">
          <canvas></canvas>
          <div class="capability-labels"></div>
        </div>
      </div>
    </section>
  </main>
  <div class="grain" aria-hidden="true"></div>
</body>
```

Define `@font-face` rules for `AnyCap Pixel` and `AnyCap Inter` from the copied files. Use CSS custom properties for the five source colors and the three responsive page paddings. Use `min-height: 100dvh` on the pinned stage and `height: 320dvh` on the desktop section. The desktop grid is `minmax(260px, 0.72fr) minmax(0, 1.55fr)`; below 768px it becomes one column.

- [ ] **Step 5: Implement deterministic particle geometry and drawing**

Use one seeded pseudo-random generator and precompute all positions during `layout()`:

```javascript
const clamp01 = (value) => Math.min(1, Math.max(0, value));
const mix = (from, to, amount) => from + (to - from) * amount;
const smoothstep = (from, to, value) => {
  const amount = clamp01((value - from) / (to - from));
  return amount * amount * (3 - 2 * amount);
};

const endpointDefinitions = [
  { label: "Image", x: 0.16, y: 0.17, curve: -48, radius: 34, aspect: 1.25 },
  { label: "Video", x: 0.49, y: 0.10, curve: 42, radius: 31, aspect: 1.55 },
  { label: "Music", x: 0.82, y: 0.20, curve: -44, radius: 29, aspect: 1.35 },
  { label: "Voice", x: 0.91, y: 0.48, curve: 38, radius: 28, aspect: 1.15 },
  { label: "Search", x: 0.80, y: 0.78, curve: -46, radius: 32, aspect: 1.45 },
  { label: "Vision", x: 0.50, y: 0.88, curve: 44, radius: 34, aspect: 1.25 },
  { label: "Storage", x: 0.19, y: 0.79, curve: -38, radius: 31, aspect: 1.4 },
  { label: "Pages", x: 0.08, y: 0.53, curve: 44, radius: 29, aspect: 1.2 },
  { label: "Share", x: 0.30, y: 0.37, curve: -34, radius: 26, aspect: 1.3 },
];

let particles = [];
let endpoints = [];
let center = { x: 0, y: 0 };

function mulberry32(seed) {
  return function random() {
    let value = seed += 0x6d2b79f5;
    value = Math.imul(value ^ value >>> 15, value | 1);
    value ^= value + Math.imul(value ^ value >>> 7, value | 61);
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  };
}

function buildLoosePoint(bounds, random) {
  return {
    x: random() * bounds.width,
    y: random() * bounds.height,
    radius: 0.55 + random() * 1.35,
    olive: random() > 0.18,
    alpha: 0.34 + random() * 0.56,
  };
}

function buildCorePoint(index, count, center, scale) {
  const side = index % 4;
  const position = Math.floor(index / 4) / Math.max(1, Math.ceil(count / 4) - 1);
  const half = scale / 2;
  const edge = mix(-half, half, position);
  const jitter = Math.sin(index * 12.9898) * scale * 0.012;

  if (side === 0) return { x: center.x + edge, y: center.y - half + jitter };
  if (side === 1) return { x: center.x + half + jitter, y: center.y + edge };
  if (side === 2) return { x: center.x - edge, y: center.y + half + jitter };
  return { x: center.x - half + jitter, y: center.y - edge };
}

function quadraticPoint(from, control, to, amount) {
  const inverse = 1 - amount;
  return {
    x: inverse * inverse * from.x + 2 * inverse * amount * control.x + amount * amount * to.x,
    y: inverse * inverse * from.y + 2 * inverse * amount * control.y + amount * amount * to.y,
  };
}

function buildFinalPoint(index, count, center, endpoints) {
  const group = index % endpoints.length;
  const endpoint = endpoints[group];
  const groupSize = Math.ceil(count / endpoints.length);
  const local = Math.floor(index / endpoints.length);
  const pathSize = Math.max(8, Math.floor(groupSize * 0.48));

  if (local < pathSize) {
    const amount = local / Math.max(1, pathSize - 1);
    const direction = group % 2 === 0 ? 1 : -1;
    const control = {
      x: mix(center.x, endpoint.x, 0.52),
      y: mix(center.y, endpoint.y, 0.52) + direction * endpoint.curve,
    };
    return quadraticPoint(center, control, endpoint, amount);
  }

  const clusterIndex = local - pathSize;
  const angle = clusterIndex * 2.399963229728653;
  const radius = Math.min(endpoint.radius, Math.sqrt(clusterIndex + 1) * 2.65);
  return {
    x: endpoint.x + Math.cos(angle) * radius * endpoint.aspect,
    y: endpoint.y + Math.sin(angle) * radius,
  };
}

function drawConnections(amount) {
  if (amount <= 0) return;
  context.save();
  context.globalAlpha = amount * 0.16;
  context.strokeStyle = "#6b7d3a";
  context.lineWidth = 1;
  for (let index = 0; index < endpoints.length; index += 1) {
    const endpoint = endpoints[index];
    const direction = index % 2 === 0 ? 1 : -1;
    context.beginPath();
    context.moveTo(center.x, center.y);
    context.quadraticCurveTo(
      mix(center.x, endpoint.x, 0.52),
      mix(center.y, endpoint.y, 0.52) + direction * endpoint.curve,
      mix(center.x, endpoint.x, amount),
      mix(center.y, endpoint.y, amount),
    );
    context.stroke();
  }
  context.restore();
}

function layout() {
  const bounds = visual.getBoundingClientRect();
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(bounds.width * pixelRatio);
  canvas.height = Math.round(bounds.height * pixelRatio);
  canvas.style.width = `${bounds.width}px`;
  canvas.style.height = `${bounds.height}px`;
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

  const particleCount = bounds.width < 768 ? 560 : bounds.width < 1100 ? 900 : 1440;
  const random = mulberry32(0x414e5943);
  center = { x: bounds.width * 0.5, y: bounds.height * 0.52 };
  const coreScale = Math.min(bounds.width, bounds.height) * 0.19;
  endpoints = endpointDefinitions.map((endpoint) => ({
    ...endpoint,
    x: endpoint.x * bounds.width,
    y: endpoint.y * bounds.height,
  }));

  particles = Array.from({ length: particleCount }, (_, index) => ({
    ...buildLoosePoint(bounds, random),
    core: buildCorePoint(index, particleCount, center, coreScale),
    final: buildFinalPoint(index, particleCount, center, endpoints),
  }));
}

function renderAt(progress) {
  const converge = smoothstep(0, 0.24, progress);
  const open = smoothstep(0.28, 0.72, progress);
  context.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
  drawConnections(open);

  for (const particle of particles) {
    const coreX = mix(particle.x, particle.core.x, converge);
    const coreY = mix(particle.y, particle.core.y, converge);
    const x = mix(coreX, particle.final.x, open);
    const y = mix(coreY, particle.final.y, open);
    context.globalAlpha = particle.alpha;
    context.fillStyle = particle.olive ? "#6b7d3a" : "#1c1f17";
    context.fillRect(x, y, particle.radius, particle.radius);
  }
  context.globalAlpha = 1;
}
```

Use a desktop particle budget between 1,200 and 1,600, a tablet budget between 800 and 1,000, and a mobile budget between 480 and 640. Cap `devicePixelRatio` with `Math.min(window.devicePixelRatio || 1, 2)`.

Map progress as follows:

```javascript
const converge = smoothstep(0.00, 0.24, progress);
const open = smoothstep(0.28, 0.72, progress);
const labelReveal = smoothstep(0.48, 0.78, progress);
const hold = smoothstep(0.78, 1.00, progress);
```

Interpolate loose points to the hollow square with `converge`, then the square to final branch and endpoint positions with `open`. Draw cached connection paths with alpha derived from `open`. Render particles in only the source olive and primary text colors.

- [ ] **Step 6: Add the single GSAP ScrollTrigger and accessibility fallback**

Register ScrollTrigger once and drive one state object from one timeline:

```javascript
gsap.registerPlugin(ScrollTrigger);

const state = { progress: 0 };
const media = gsap.matchMedia();
media.add(
  {
    reduceMotion: "(prefers-reduced-motion: reduce)",
    mobile: "(max-width: 767px)",
  },
  ({ conditions }) => {
    if (conditions.reduceMotion) {
      state.progress = 1;
      renderAt(1);
      return;
    }

    const timeline = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: ".capability-field",
        start: "top top",
        end: () => conditions.mobile ? "+=150%" : "+=220%",
        pin: true,
        scrub: 0.8,
        invalidateOnRefresh: true,
      },
    });
    timeline.to(state, { progress: 1, duration: 1, onUpdate: () => renderAt(state.progress) });
  },
);
```

Populate label elements from the fixed endpoint array, position them during `layout()`, and animate only their transform and opacity through the timeline progress. Create the grain tile with the same 200px grayscale canvas algorithm as `GrainOverlay.tsx`.

Expose the deterministic inspection interface:

```javascript
window.__ANYCAP_DEMO__ = {
  get progress() { return state.progress; },
  get reducedMotion() { return matchMedia("(prefers-reduced-motion: reduce)").matches; },
  get particleCount() { return particles.length; },
  get active() { return Boolean(ScrollTrigger.getAll()[0]?.isActive); },
  renderAt,
};
```

- [ ] **Step 7: Run the source contract and verify it passes**

Run the Step 2 command again.

Expected:

```text
particle section source contract: pass
```

- [ ] **Step 8: Verify the live desktop experience**

Open the existing localhost companion and inspect at a desktop viewport. Verify through browser evaluation:

```javascript
({
  sections: document.querySelectorAll("section").length,
  canvases: document.querySelectorAll("canvas").length,
  background: getComputedStyle(document.body).backgroundColor,
  titleFont: getComputedStyle(document.querySelector("h2")).fontFamily,
  labelsFont: getComputedStyle(document.querySelector(".capability-label")).fontFamily,
  triggers: ScrollTrigger.getAll().length,
  particleCount: window.__ANYCAP_DEMO__.particleCount,
  overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
})
```

Expected: one section, one canvas, `rgb(244, 245, 240)`, GeistPixelSquare display font, Inter labels, one trigger, desktop particle count in the planned range, and overflow `0`.

Capture and inspect the initial, middle, and final scroll states. The initial state shows loose particles converging on the center; the middle state opens the thick hollow portal and extends the branches; the final desktop state shows the human and agent figures, cursor lanes, and all 13 artifacts connected to one stable center. The final mobile state shows Cinematic video, Transcript, and Delivered without colliding with the copy.

- [ ] **Step 9: Verify mobile and reduced motion**

At a viewport below 768px, verify the copy and visual form one column, horizontal padding is 32px, overflow is zero, particle count is in the mobile range, and the pinned distance is shorter than desktop.

With reduced motion emulated, reload and verify:

```javascript
({
  triggers: ScrollTrigger.getAll().length,
  progress: window.__ANYCAP_DEMO__.progress,
  reducedMotion: window.__ANYCAP_DEMO__.reducedMotion,
})
```

Expected: zero triggers, progress `1`, and reduced motion `true`.

- [ ] **Step 10: Inspect runtime health and preserve repository cleanliness**

Verify the browser console has no runtime errors and the page makes no remote requests. Run:

```bash
git status --short
```

Expected: the standalone demo files do not appear in repository status; only an intentional plan commit may differ from the branch baseline.

- [ ] **Step 11: Record completion**

No production-code commit is created because the implemented demo lives in the external visual companion. The task report must include the source-contract output, computed-style inspection, motion-state inspection, mobile result, reduced-motion result, and console error count.
