# Homepage Agent Install Capability Motion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the section-only AnyCap visual companion so the scroll story visibly changes an initially limited agent into an AnyCap-connected agent with mainstream model access, many finished capabilities, and an open horizon of future models and capabilities.

**Architecture:** Keep production `web/` code unchanged. Establish a tracked authored HTML source and Node build/contract scripts under `docs/superpowers/demos/`, then build the self-contained companion HTML into the existing visual-companion directory by inlining its local GSAP and ScrollTrigger runtimes. One canvas renderer and one ScrollTrigger drive five cached particle states; a small number of DOM layers provide the install command, text-only model anchors, artifact surfaces, and continuation copy.

**Tech Stack:** Semantic HTML, CSS, Canvas 2D, vanilla JavaScript, GSAP 3.13, ScrollTrigger 3.13, Node.js built-ins, real Chromium and the Codex in-app browser.

## Global Constraints

- Work only on branch `codex/doubao-audio-positioning`; create no branch or worktree.
- Do not modify production files under `web/`.
- The companion contains exactly one semantic `<section>` and does not duplicate the homepage hero, navigation, footer, or conversion controls.
- Preserve background `#f4f5f0`, primary text `#1c1f17`, supporting text `#4d5145`, accent `#6b7d3a`, divider `#d4dbb8`, production grain, GeistPixelSquare 500, system sans body copy, and Inter 500 labels.
- Visible primary copy remains `One capability layer.`, `Every way to finish.`, `Human + agent`, and `Create. Understand. Find. Manage. Deliver.`
- Motion proof copy is exactly `anycap install`, `Codex · Claude Code · Cursor · any agent`, and `More models. More capabilities. Continuously added.`
- Desktop model anchors are `Nano Banana 2 Lite`, `Seedance 2.0 Mini`, `Kling 3.0`, `Mureka V8`, `Suno V5.5`, `Doubao Seed Audio 1.0`, and `GPT Image 2`, verified against `web/src/lib/model-hub.ts` before implementation. Mobile shows `Nano Banana 2 Lite`, `Seedance 2.0 Mini`, and `Doubao Seed Audio 1.0`.
- Keep the restored central particle portal, human and agent figures, cursor lanes, 13 desktop artifact micro-compositions, and 3 mobile artifacts.
- Use five overlapping acts: limited agent `0-18%`, install and ignite `18-36%`, model layer `36-62%`, capability flood `56-86%`, open horizon `86-100%`.
- Model particles must travel inward before capability particles travel outward. An artifact cannot become legible before its stream arrives.
- Use one transparent canvas, one normalized state object, one GSAP timeline, and one ScrollTrigger attached to `.capability-stage` with `start: "top top"`, `pin: true`, and numeric scrub between `0.65` and `0.9`.
- Use no scroll event listener, remote asset, provider logo, agent logo, logo wall, independent gradient wash, smooth-scroll library, parallax layer, or perpetual animation.
- Cap canvas DPR at 2, precompute path controls during layout, cache canvas dimensions, and animate DOM only through transform and opacity.
- Under `prefers-reduced-motion: reduce`, create zero ScrollTriggers and render the final post-install state statically.
- Mobile must have no horizontal overflow, use 560 or fewer particles, connect three model anchors in one wave, show only Cinematic video, Transcript, and Delivered, and send continuation routes mostly downward.
- The existing user-facing companion remains available at `http://localhost:62893/` after each build.

---

### Task 1: Track And Build The Standalone Companion Source

**Files:**

- Create: `docs/superpowers/demos/homepage-agent-capability-motion.source.html`
- Create: `docs/superpowers/demos/build-homepage-agent-capability-motion.mjs`
- Create: `docs/superpowers/demos/verify-homepage-agent-capability-motion.mjs`
- Read/build output: `/Users/tyluo/.codex/visualizations/2026/07/19/019f788b-cbe7-7a91-aa82-82e5ed1f1dcd/particle-scroll-demo/.superpowers/brainstorm/89119-1784459419/content/particle-bloom-demo-v3.html`

**Interfaces:**

- Consumes: the existing built companion HTML and its sibling `vendor/gsap.min.js` and `vendor/ScrollTrigger.min.js` files.
- Produces: a reviewable tracked source containing `/*__INLINE_GSAP__*/` and `/*__INLINE_SCROLLTRIGGER__*/`; a builder CLI `node build-homepage-agent-capability-motion.mjs extract|build <absolute-path>`; and a contract CLI `node verify-homepage-agent-capability-motion.mjs <absolute-built-path>`.

- [ ] **Step 1: Write the failing source/build contract**

Create `docs/superpowers/demos/verify-homepage-agent-capability-motion.mjs` with this complete initial content:

```javascript
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const directory = fileURLToPath(new URL(".", import.meta.url));
const sourcePath = `${directory}/homepage-agent-capability-motion.source.html`;
const builtPath = process.argv[2];

assert.ok(builtPath, "pass the absolute built companion path");

const source = await readFile(sourcePath, "utf8");
const built = await readFile(builtPath, "utf8");
const assetReferences = [
  ...[...built.matchAll(/\b(?:src|href|poster)\s*=\s*["']([^"']+)["']/gi)].map((match) => match[1]),
  ...[...built.matchAll(/url\(\s*["']?([^"')\s]+)["']?\s*\)/gi)].map((match) => match[1]),
];
const remoteAssetReferences = assetReferences.filter((reference) => /^https?:\/\//i.test(reference));

assert.ok(source.includes("/*__INLINE_GSAP__*/"), "tracked source has the GSAP marker");
assert.ok(source.includes("/*__INLINE_SCROLLTRIGGER__*/"), "tracked source has the ScrollTrigger marker");
assert.doesNotMatch(built, /\/\*__INLINE_(?:GSAP|SCROLLTRIGGER)__\*\//, "built file has no vendor markers");
assert.doesNotMatch(built, /<script\b[^>]*\bsrc\s*=/i, "built runtime is self-contained");
assert.equal((built.match(/<section\b/g) ?? []).length, 1, "exactly one section");
assert.equal((built.match(/<canvas\b/g) ?? []).length, 1, "exactly one canvas");
assert.doesNotMatch(built, /<(nav|footer|img)\b/i);
assert.deepEqual(remoteAssetReferences, [], "contains no remote assets");
assert.ok(built.includes("GSAP 3.13.0"), "contains GSAP 3.13.0");
assert.ok(built.includes("ScrollTrigger 3.13.0"), "contains ScrollTrigger 3.13.0");

console.log("homepage agent capability demo build contract: pass");
```

- [ ] **Step 2: Run the contract and verify it fails**

Run:

```bash
node docs/superpowers/demos/verify-homepage-agent-capability-motion.mjs /Users/tyluo/.codex/visualizations/2026/07/19/019f788b-cbe7-7a91-aa82-82e5ed1f1dcd/particle-scroll-demo/.superpowers/brainstorm/89119-1784459419/content/particle-bloom-demo-v3.html
```

Expected: FAIL with `ENOENT` for `homepage-agent-capability-motion.source.html`.

- [ ] **Step 3: Add the extractor and self-contained builder**

Create `docs/superpowers/demos/build-homepage-agent-capability-motion.mjs` with this complete content:

```javascript
import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const directory = fileURLToPath(new URL(".", import.meta.url));
const sourcePath = `${directory}/homepage-agent-capability-motion.source.html`;
const [mode, targetPath] = process.argv.slice(2);
const GSAP_MARKER = "/*__INLINE_GSAP__*/";
const SCROLLTRIGGER_MARKER = "/*__INLINE_SCROLLTRIGGER__*/";

assert.ok(mode === "extract" || mode === "build", "mode must be extract or build");
assert.ok(targetPath?.startsWith("/"), "target path must be absolute");

function replaceRuntimeWithMarker(html, signature, marker) {
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
  const runtime = scripts.find((match) => match[1].includes(signature));
  assert.ok(runtime, `cannot find ${signature}`);
  return `${html.slice(0, runtime.index)}<script>${marker}</script>${html.slice(runtime.index + runtime[0].length)}`;
}

if (mode === "extract") {
  let built = await readFile(targetPath, "utf8");
  built = replaceRuntimeWithMarker(built, "GSAP 3.13.0", GSAP_MARKER);
  built = replaceRuntimeWithMarker(built, "ScrollTrigger 3.13.0", SCROLLTRIGGER_MARKER);
  await writeFile(sourcePath, built);
  console.log(`extracted tracked source: ${sourcePath}`);
} else {
  const outputDirectory = dirname(targetPath);
  const [source, gsap, scrollTrigger] = await Promise.all([
    readFile(sourcePath, "utf8"),
    readFile(`${outputDirectory}/vendor/gsap.min.js`, "utf8"),
    readFile(`${outputDirectory}/vendor/ScrollTrigger.min.js`, "utf8"),
  ]);
  assert.ok(source.includes(GSAP_MARKER), "source is missing GSAP marker");
  assert.ok(source.includes(SCROLLTRIGGER_MARKER), "source is missing ScrollTrigger marker");
  const built = source
    .replace(GSAP_MARKER, gsap)
    .replace(SCROLLTRIGGER_MARKER, scrollTrigger);
  await writeFile(targetPath, built);
  console.log(`built standalone companion: ${targetPath}`);
}
```

- [ ] **Step 4: Extract the current companion into the tracked source**

Run:

```bash
node docs/superpowers/demos/build-homepage-agent-capability-motion.mjs extract /Users/tyluo/.codex/visualizations/2026/07/19/019f788b-cbe7-7a91-aa82-82e5ed1f1dcd/particle-scroll-demo/.superpowers/brainstorm/89119-1784459419/content/particle-bloom-demo-v3.html
```

Expected: `extracted tracked source: .../docs/superpowers/demos/homepage-agent-capability-motion.source.html`.

- [ ] **Step 5: Rebuild and run the contract**

Run:

```bash
node docs/superpowers/demos/build-homepage-agent-capability-motion.mjs build /Users/tyluo/.codex/visualizations/2026/07/19/019f788b-cbe7-7a91-aa82-82e5ed1f1dcd/particle-scroll-demo/.superpowers/brainstorm/89119-1784459419/content/particle-bloom-demo-v3.html
node docs/superpowers/demos/verify-homepage-agent-capability-motion.mjs /Users/tyluo/.codex/visualizations/2026/07/19/019f788b-cbe7-7a91-aa82-82e5ed1f1dcd/particle-scroll-demo/.superpowers/brainstorm/89119-1784459419/content/particle-bloom-demo-v3.html
```

Expected:

```text
built standalone companion: /Users/tyluo/.codex/visualizations/2026/07/19/019f788b-cbe7-7a91-aa82-82e5ed1f1dcd/particle-scroll-demo/.superpowers/brainstorm/89119-1784459419/content/particle-bloom-demo-v3.html
homepage agent capability demo build contract: pass
```

- [ ] **Step 6: Commit the tracked source and build contract**

```bash
git add docs/superpowers/demos/homepage-agent-capability-motion.source.html docs/superpowers/demos/build-homepage-agent-capability-motion.mjs docs/superpowers/demos/verify-homepage-agent-capability-motion.mjs
git commit -m "test(web): track particle capability demo source"
```

---

### Task 2: Implement The Five-Act Install And Capability Motion

**Files:**

- Modify: `docs/superpowers/demos/homepage-agent-capability-motion.source.html`
- Modify: `docs/superpowers/demos/verify-homepage-agent-capability-motion.mjs`
- Build output: `/Users/tyluo/.codex/visualizations/2026/07/19/019f788b-cbe7-7a91-aa82-82e5ed1f1dcd/particle-scroll-demo/.superpowers/brainstorm/89119-1784459419/content/particle-bloom-demo-v3.html`

**Interfaces:**

- Consumes: the Task 1 tracked source/build CLI and the current model names verified from `web/src/lib/model-hub.ts`.
- Produces: `window.__ANYCAP_DEMO__` with existing `progress`, `reducedMotion`, `particleCount`, `active`, and `renderAt(progress)` plus `phaseSnapshot(progress)`; DOM layers `.agent-install-layer`, `.model-field`, and `.horizon-field`; cached particle points `loose`, `limited`, `ready`, `connected`, `final`, and `horizon`.

- [ ] **Step 1: Extend the contract before changing the source**

Append these assertions before the final log line in `verify-homepage-agent-capability-motion.mjs`:

```javascript
for (const text of [
  "One capability layer.",
  "Every way to finish.",
  "Human + agent",
  "Create. Understand. Find. Manage. Deliver.",
  "anycap install",
  "Codex · Claude Code · Cursor · any agent",
  "More models. More capabilities. Continuously added.",
  "Nano Banana 2 Lite",
  "Seedance 2.0 Mini",
  "Kling 3.0",
  "Mureka V8",
  "Suno V5.5",
  "Doubao Seed Audio 1.0",
  "GPT Image 2",
]) assert.ok(source.includes(text), `source contains ${text}`);

for (const contract of [
  'class="agent-install-layer"',
  'class="model-field"',
  'class="horizon-field"',
  "const narrativeRanges",
  "const modelAnchorDefinitions",
  "const capabilityWaveOrder",
  "function phaseProgress",
  "function buildLimitedAgentPoint",
  "function buildContinuationPoint",
  "function resolveParticlePosition",
  "function drawModelConnections",
  "phaseSnapshot",
  'trigger: ".capability-stage"',
  'start: "top top"',
  "pin: true",
  "scrub: 0.72",
  "prefers-reduced-motion: reduce",
]) assert.ok(source.includes(contract), `source contains ${contract}`);

assert.doesNotMatch(source, /<button[^>]*>[\s\S]*?anycap install[\s\S]*?<\/button>/i, "install proof is not a button");
assert.doesNotMatch(source, /Try AnyCap/i, "middle section has no hero CTA");
assert.doesNotMatch(source, /window\.addEventListener\(["']scroll["']/, "no custom scroll listener");
assert.doesNotMatch(source, /radial-gradient/i, "no independent gradient wash");
```

Also change the final console line to:

```javascript
console.log("homepage agent install capability motion contract: pass");
```

- [ ] **Step 2: Run the contract and verify the new narrative fails**

Run:

```bash
node docs/superpowers/demos/verify-homepage-agent-capability-motion.mjs /Users/tyluo/.codex/visualizations/2026/07/19/019f788b-cbe7-7a91-aa82-82e5ed1f1dcd/particle-scroll-demo/.superpowers/brainstorm/89119-1784459419/content/particle-bloom-demo-v3.html
```

Expected: FAIL with `source contains anycap install`.

- [ ] **Step 3: Add the three narrative DOM layers**

Inside `.particle-visual`, before `.artifact-field`, add exactly:

```html
<div class="agent-install-layer" aria-hidden="true">
  <span class="agent-proof">Codex · Claude Code · Cursor · any agent</span>
  <span class="install-command"><b>›</b> anycap install</span>
  <i class="install-module"></i>
</div>
<div class="model-field" aria-hidden="true"></div>
<div class="horizon-field" aria-hidden="true">
  <span>More models. More capabilities. Continuously added.</span>
</div>
```

Style these layers with absolute positioning, main-site colors and fonts, `pointer-events: none`, and `will-change: transform, opacity`. `.install-command` uses the existing dark terminal treatment without hover or focus behavior. `.model-anchor` is text plus a 4-pixel square and never a card, pill, or logo. `.horizon-field` has no background or border.

- [ ] **Step 4: Add exact phase and model definitions**

Add these definitions beside `endpointDefinitions`:

```javascript
const narrativeRanges = Object.freeze({
  limited: [0.00, 0.18],
  ignite: [0.18, 0.36],
  models: [0.36, 0.62],
  flood: [0.56, 0.86],
  horizon: [0.86, 1.00],
});

const modelAnchorDefinitions = [
  { label: "Nano Banana 2 Lite", family: "Image", x: 0.57, y: 0.12, mobile: true },
  { label: "GPT Image 2", family: "Image", x: 0.72, y: 0.17 },
  { label: "Seedance 2.0 Mini", family: "Video", x: 0.84, y: 0.11, mobile: true },
  { label: "Kling 3.0", family: "Video", x: 0.94, y: 0.24 },
  { label: "Mureka V8", family: "Music", x: 0.88, y: 0.39 },
  { label: "Suno V5.5", family: "Music", x: 0.71, y: 0.34 },
  { label: "Doubao Seed Audio 1.0", family: "Voice", x: 0.60, y: 0.27, mobile: true },
];

const capabilityWaveOrder = Object.freeze({
  Image: 0.00,
  Video: 0.00,
  Music: 0.00,
  Voice: 0.00,
  Vision: 0.18,
  Search: 0.28,
  Pages: 0.48,
  Share: 0.48,
  Storage: 0.48,
});

function phaseProgress(name, progress) {
  const [start, end] = narrativeRanges[name];
  return smoothstep(start, end, progress);
}

function phaseSnapshot(progress) {
  const value = clamp01(progress);
  return Object.freeze({
    limited: phaseProgress("limited", value),
    ignite: phaseProgress("ignite", value),
    models: phaseProgress("models", value),
    flood: phaseProgress("flood", value),
    horizon: phaseProgress("horizon", value),
  });
}
```

Build `.model-anchor` elements from `modelAnchorDefinitions`. Below 768 pixels, set `display: none` on anchors without `mobile: true`.

- [ ] **Step 5: Replace the three-state particle geometry with six cached states**

Use these helpers and particle roles during `layout()`:

```javascript
function mixPoint(from, to, amount) {
  return { x: mix(from.x, to.x, amount), y: mix(from.y, to.y, amount) };
}

function buildLimitedAgentPoint(index, count, bounds, center) {
  const amount = index / Math.max(1, count - 1);
  return {
    x: mix(bounds.width * 0.22, center.x - bounds.width * 0.08, amount),
    y: center.y + Math.sin(index * 1.91) * Math.min(12, bounds.height * 0.018),
  };
}

function buildModelClusterPoint(index, anchor) {
  const angle = index * 2.399963229728653;
  const radius = 4 + Math.sqrt(index + 1) * 1.8;
  return {
    x: anchor.x + Math.cos(angle) * radius * 1.4,
    y: anchor.y + Math.sin(angle) * radius,
  };
}

function buildContinuationPoint(index, bounds, endpoint) {
  const downward = bounds.width < 768;
  const spread = 0.08 + (index % 17) / 80;
  return downward
    ? { x: endpoint.x + Math.sin(index * 2.17) * bounds.width * spread, y: bounds.height * (1.04 + (index % 23) / 70) }
    : { x: bounds.width * (1.02 + (index % 29) / 90), y: endpoint.y + Math.sin(index * 1.73) * bounds.height * spread };
}

function resolveParticlePosition(particle, phases) {
  let point = mixPoint(particle.loose, particle.limited, phases.limited);
  point = mixPoint(point, particle.ready, phases.ignite);
  if (particle.role !== "portal") point = mixPoint(point, particle.connected, phases.models);
  if (particle.role !== "portal") point = mixPoint(point, particle.final, phases.flood);
  if (particle.role === "continuation") point = mixPoint(point, particle.horizon, phases.horizon);
  return point;
}
```

Assign roles deterministically: 44 percent `portal`, 46 percent `route`, and the final 10 percent `continuation`. Portal particles cache a limited-agent point and a thick `buildCorePoint` target. Route particles cache a model-cluster `ready` point, a portal-edge `connected` point, and the existing endpoint `final` point. Continuation particles use the same route states plus `buildContinuationPoint()`.

- [ ] **Step 6: Implement directional connections and phase-aware DOM resolution**

Add a cached `modelPaths` array during layout and draw it inward with:

```javascript
function drawPartialQuadratic(from, control, to, amount, alpha) {
  if (amount <= 0) return;
  const steps = 18;
  context.beginPath();
  context.moveTo(from.x, from.y);
  for (let step = 1; step <= steps; step += 1) {
    const progress = amount * step / steps;
    const point = quadraticPoint(from, control, to, progress);
    context.lineTo(point.x, point.y);
  }
  context.globalAlpha = alpha;
  context.stroke();
}

function drawModelConnections(amount) {
  context.save();
  context.strokeStyle = "#6b7d3a";
  context.lineWidth = 1;
  modelPaths.forEach((path, index) => {
    const staggered = smoothstep(index * 0.055, 0.58 + index * 0.035, amount);
    drawPartialQuadratic(path.from, path.control, path.to, staggered, staggered * 0.28);
  });
  context.restore();
}
```

Rewrite `renderAt(progress)` so it obtains `const phases = phaseSnapshot(progress)`, clears the cached canvas, draws inbound model paths before outbound capability paths, resolves every particle through `resolveParticlePosition()`, and then updates DOM only with opacity and transform. Use these exact artifact timings:

```javascript
const familyDelay = capabilityWaveOrder[endpointDefinitions[index].family] ?? 0.48;
const artifactStart = 0.56 + familyDelay * 0.18 + index * 0.006;
const artifactReveal = smoothstep(artifactStart, artifactStart + 0.12, progress);
label.style.opacity = String(artifactReveal);
label.style.transform = `translate(-50%, calc(-50% + ${mix(14, 0, artifactReveal)}px)) scale(${mix(0.94, 1, artifactReveal)})`;
```

The install command reaches full opacity between progress `0.19` and `0.25`, recedes from `0.31` to `0.38`, and the install module travels from `translateX(-48px) scale(0.72)` to `translateX(0) scale(1)`. Model anchors stagger across the model phase. The horizon copy starts at `0.9` and reaches full opacity at `0.98`.

Expose `phaseSnapshot` through `window.__ANYCAP_DEMO__` and set `document.documentElement.dataset.motionAct` to `limited`, `install`, `models`, `capabilities`, or `horizon` for deterministic browser inspection.

- [ ] **Step 7: Tune the single ScrollTrigger and reduced-motion branch**

Keep one timeline, change its ScrollTrigger to `scrub: 0.72`, and make the five acts inspectable through GSAP timeline labels without adding child ScrollTriggers:

```javascript
const timeline = gsap.timeline({
  defaults: { ease: "none" },
  scrollTrigger: {
    trigger: ".capability-stage",
    start: "top top",
    end: () => conditions.mobile ? "+=150%" : "+=220%",
    pin: true,
    scrub: 0.72,
    invalidateOnRefresh: true,
    onUpdate: (trigger) => {
      document.documentElement.dataset.scrollProgress = trigger.progress.toFixed(3);
    },
    onLeave: () => { document.documentElement.dataset.pinReleased = "true"; },
    onEnterBack: () => { document.documentElement.dataset.pinReleased = "false"; },
  },
});

timeline
  .addLabel("limited", 0.00)
  .addLabel("install", 0.18)
  .addLabel("models", 0.36)
  .addLabel("capabilities", 0.56)
  .addLabel("horizon", 0.86)
  .to(state, { progress: 1, duration: 1, onUpdate: () => renderAt(state.progress) }, 0);
```

Desktop end remains `+=220%`; mobile end remains `+=150%`. Reduced motion sets state progress to 1, calls `renderAt(1)`, and creates no timeline or trigger. Do not add a second ScrollTrigger for any DOM layer. Do not use chained `delay` values; act ordering lives in the labels and normalized phase ranges.

- [ ] **Step 8: Build and run all source contracts**

Run:

```bash
node docs/superpowers/demos/build-homepage-agent-capability-motion.mjs build /Users/tyluo/.codex/visualizations/2026/07/19/019f788b-cbe7-7a91-aa82-82e5ed1f1dcd/particle-scroll-demo/.superpowers/brainstorm/89119-1784459419/content/particle-bloom-demo-v3.html
node docs/superpowers/demos/verify-homepage-agent-capability-motion.mjs /Users/tyluo/.codex/visualizations/2026/07/19/019f788b-cbe7-7a91-aa82-82e5ed1f1dcd/particle-scroll-demo/.superpowers/brainstorm/89119-1784459419/content/particle-bloom-demo-v3.html
node /Users/tyluo/.codex/visualizations/2026/07/19/019f788b-cbe7-7a91-aa82-82e5ed1f1dcd/particle-scroll-demo/.superpowers/brainstorm/89119-1784459419/content/verify-particle-section.mjs
```

Expected:

```text
homepage agent install capability motion contract: pass
particle section source contract: pass
```

Update the legacy external contract only where it conflicts with the approved spec: permit the non-interactive `anycap install` proof, require the three new narrative layers, require seven desktop model names, and require the open-horizon line.

- [ ] **Step 9: Verify the five acts in a real browser**

Reload `http://localhost:62893/` after the build and inspect progress near `0.10`, `0.27`, `0.50`, `0.75`, and `0.95` through the actual pinned scroll range.

Required evidence:

- `0.10`: motion act `limited`, no model anchor or artifact above opacity `0.1`, and the agent has only the narrow route;
- `0.27`: motion act `install`, command and traveling AnyCap module visible, portal assembling rather than merely fading;
- `0.50`: motion act `models`, at least four desktop model anchors visible, inbound routes visibly terminate at the portal, and no artifact is fully legible;
- `0.75`: motion act `capabilities`, model anchors are secondary, capability branches move outward, and artifacts appear only after local particle arrival;
- `0.95`: motion act `horizon`, all 13 desktop artifacts visible, continuation branches leave the frame, and exact continuation copy visible;
- desktop 1440x900: no overlaps, clipping, horizontal overflow, runtime warning, or console error; one trigger releases cleanly;
- mobile 375x812: three model anchors, three artifacts, no copy collision or horizontal overflow; one trigger releases cleanly;
- reduced motion 1440x900: final static state, seven model anchors, 13 artifacts, zero triggers, no overflow;
- main-site background, display font, body font, label font, grain, and horizontal padding remain unchanged.

- [ ] **Step 10: Commit the motion implementation**

```bash
git add docs/superpowers/demos/homepage-agent-capability-motion.source.html docs/superpowers/demos/verify-homepage-agent-capability-motion.mjs
git commit -m "feat(web): animate agent capability installation"
```

The external built companion is intentionally not staged; it is reproduced by the tracked builder and source.
