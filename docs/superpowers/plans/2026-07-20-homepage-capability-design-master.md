# Homepage Capability Design Master Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce and review one near-1:1 final design master, five motion keyframes, and one component breakdown for the AnyCap homepage capability section before production implementation begins.

**Architecture:** Treat the approved image-two reference as a strict 16:9 art-direction target. Store a canonical scene manifest beside the visual assets, validate every raster and structural deliverable with a dependency-free Node contract, and expose the reference, master, storyboard, and component diagram through one local browser review page. The current procedural demo remains frozen and production `web/` remains unchanged.

**Tech Stack:** OpenAI image generation and editing, local PNG assets, SVG, HTML/CSS, dependency-free Node.js verification, in-app browser review.

## Global Constraints

- Stay on `codex/doubao-audio-positioning`; create no branch or worktree.
- Do not modify `web/` or the existing particle-demo source/build.
- Use image two as a strict composition target, not loose inspiration.
- Every canonical raster is exactly `1672 × 941`.
- Preserve image two's tunnel, flow, artifact hierarchy, crop, and perspective while adapting the content to AnyCap.
- Use `#f4f5f0`, `#1c1f17`, `#6b7d3a`, `#4d5145`, `#c8d4a0`, GeistPixelSquare, system sans-serif, and restrained Inter/mono chrome.
- Keep exactly fourteen artifacts: Research, Editorial image, Screenshot analysis, Vision crop, Published page, Cinematic video, Audio, Transcript, Share link, Music track, Search result, Generated variants, Code snippet, and Delivered.
- Keep model, capability, and delivery names secondary inside the flow.
- Add no provider logos, hero chrome, CTA, neon, glow, blue field, glassmorphism, or browser frame.
- Do not choose or implement the production renderer in this plan.
- Stop after design approval; production integration requires a separate cycle.

## File Structure

```text
docs/superpowers/design-masters/homepage-capability/
├── reference-target.png
├── final-master.png
├── keyframes/
│   ├── 01-limited.png
│   ├── 02-install.png
│   ├── 03-portal.png
│   ├── 04-avalanche.png
│   └── 05-delivered.png
├── scene-manifest.json
├── component-breakdown.svg
├── review.html
└── README.md

docs/superpowers/demos/
└── verify-homepage-capability-design-master.mjs
```

The manifest owns canonical data. PNGs are approval artifacts. The SVG explains ownership. The HTML is the only browser review surface. The verifier owns structural and dimension checks.

---

### Task 1: Scene Manifest And Design Contract

**Files:**
- Create: `docs/superpowers/demos/verify-homepage-capability-design-master.mjs`
- Create: `docs/superpowers/design-masters/homepage-capability/scene-manifest.json`

**Interfaces:**
- Consumes: `docs/superpowers/specs/2026-07-20-homepage-capability-design-master-design.md`.
- Produces: verifier modes `manifest`, `final`, `keyframes`, `breakdown`, `all`; canonical manifest data used by every later task.

- [ ] **Step 1: Write the failing verifier**

Create `verify-homepage-capability-design-master.mjs` with this complete content:

```js
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const directory = dirname(fileURLToPath(import.meta.url));
const packageDirectory = resolve(directory, "../design-masters/homepage-capability");
const mode = process.argv[2] ?? "all";
const validModes = new Set(["manifest", "final", "keyframes", "breakdown", "all"]);
assert.ok(validModes.has(mode), `mode must be one of ${[...validModes].join(", ")}`);

async function pngDimensions(path) {
  const bytes = await readFile(path);
  assert.equal(bytes.subarray(1, 4).toString("ascii"), "PNG", `${path} is a PNG`);
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

async function assertCanonicalPng(relativePath) {
  const dimensions = await pngDimensions(resolve(packageDirectory, relativePath));
  assert.deepEqual(dimensions, { width: 1672, height: 941 }, `${relativePath} is 1672×941`);
}

async function verifyManifest() {
  const manifest = JSON.parse(await readFile(resolve(packageDirectory, "scene-manifest.json"), "utf8"));
  assert.equal(manifest.version, 1);
  assert.deepEqual(manifest.artboard, { width: 1672, height: 941, aspect: "16:9" });
  assert.deepEqual(manifest.layerOrder, ["background", "copy", "backgroundParticles", "portalTunnel", "humanAgentPair", "artifactSurfaces", "capabilityAnnotations", "foregroundParticles", "atmosphere"]);
  assert.deepEqual(manifest.components, ["CapabilityScene", "PortalTunnel", "HumanAgentPair", "ParticleFlow", "ArtifactSurface", "CapabilityAnnotations", "SceneAtmosphere"]);
  assert.equal(manifest.artifacts.length, 14);
  assert.equal(new Set(manifest.artifacts).size, 14);
  assert.deepEqual(manifest.keyframes.map((frame) => frame.id), ["limited", "install", "portal", "avalanche", "delivered"]);
  assert.equal(manifest.finalMaster, "final-master.png");
  return manifest;
}

async function verifyFinal() {
  await assertCanonicalPng("reference-target.png");
  await assertCanonicalPng("final-master.png");
}

async function verifyKeyframes() {
  const manifest = await verifyManifest();
  for (const frame of manifest.keyframes) await assertCanonicalPng(frame.file);
}

async function verifyBreakdown() {
  const svg = await readFile(resolve(packageDirectory, "component-breakdown.svg"), "utf8");
  const review = await readFile(resolve(packageDirectory, "review.html"), "utf8");
  for (const component of ["CapabilityScene", "PortalTunnel", "HumanAgentPair", "ParticleFlow", "ArtifactSurface", "CapabilityAnnotations", "SceneAtmosphere"]) assert.ok(svg.includes(component), `component diagram includes ${component}`);
  for (const section of ["Reference target", "Final master", "Motion keyframes", "Component breakdown"]) assert.ok(review.includes(section), `review page includes ${section}`);
  assert.equal((review.match(/<img\b/g) ?? []).length, 8, "review page exposes eight images");
}

if (mode === "manifest" || mode === "all") await verifyManifest();
if (mode === "final" || mode === "all") await verifyFinal();
if (mode === "keyframes" || mode === "all") await verifyKeyframes();
if (mode === "breakdown" || mode === "all") await verifyBreakdown();
console.log(`homepage capability design master ${mode}: pass`);
```

- [ ] **Step 2: Verify the test fails for the missing manifest**

Run: `node docs/superpowers/demos/verify-homepage-capability-design-master.mjs manifest`

Expected: non-zero exit with `ENOENT` for `scene-manifest.json`.

- [ ] **Step 3: Create the canonical scene manifest**

Create `scene-manifest.json` with this complete content:

```json
{
  "version": 1,
  "artboard": { "width": 1672, "height": 941, "aspect": "16:9" },
  "reference": "reference-target.png",
  "finalMaster": "final-master.png",
  "brand": { "surface": "#f4f5f0", "primary": "#1c1f17", "olive": "#6b7d3a", "secondary": "#4d5145", "paleSage": "#c8d4a0" },
  "layerOrder": ["background", "copy", "backgroundParticles", "portalTunnel", "humanAgentPair", "artifactSurfaces", "capabilityAnnotations", "foregroundParticles", "atmosphere"],
  "components": ["CapabilityScene", "PortalTunnel", "HumanAgentPair", "ParticleFlow", "ArtifactSurface", "CapabilityAnnotations", "SceneAtmosphere"],
  "artifacts": ["Research", "Editorial image", "Screenshot analysis", "Vision crop", "Published page", "Cinematic video", "Audio", "Transcript", "Share link", "Music track", "Search result", "Generated variants", "Code snippet", "Delivered"],
  "keyframes": [
    { "id": "limited", "progress": 0.08, "file": "keyframes/01-limited.png" },
    { "id": "install", "progress": 0.24, "file": "keyframes/02-install.png" },
    { "id": "portal", "progress": 0.44, "file": "keyframes/03-portal.png" },
    { "id": "avalanche", "progress": 0.72, "file": "keyframes/04-avalanche.png" },
    { "id": "delivered", "progress": 1, "file": "keyframes/05-delivered.png" }
  ]
}
```

- [ ] **Step 4: Verify the manifest passes**

Run: `node docs/superpowers/demos/verify-homepage-capability-design-master.mjs manifest`

Expected: `homepage capability design master manifest: pass`.

- [ ] **Step 5: Commit**

```bash
git add docs/superpowers/demos/verify-homepage-capability-design-master.mjs docs/superpowers/design-masters/homepage-capability/scene-manifest.json
git commit -m "test(web): define capability design master contract"
```

---

### Task 2: Canonical Final Master

**Files:**
- Create: `docs/superpowers/design-masters/homepage-capability/reference-target.png`
- Create: `docs/superpowers/design-masters/homepage-capability/final-master.png`

**Interfaces:**
- Consumes: the user reference at `/var/folders/yk/ddd_bcj540s4v3310qkpjdq9t9nnn9/T/codex-clipboard-d1f2f15e-7fef-4346-8b95-25894180faa2.png` and `scene-manifest.json`.
- Produces: the stable reference and clean master used as the camera/composition authority for every keyframe.

- [ ] **Step 1: Verify the final-image contract fails**

Run: `node docs/superpowers/demos/verify-homepage-capability-design-master.mjs final`

Expected: non-zero exit with `ENOENT` for `reference-target.png`.

- [ ] **Step 2: Preserve the approved reference**

Copy only the user-provided image-two reference into `reference-target.png`. Normalize it to `1672 × 941` with a center crop and proportional resampling; do not stretch one axis.

- [ ] **Step 3: Generate a final-master candidate**

Use the `imagegen` skill with `reference-target.png` and this exact prompt:

```text
Create a strict near-1:1 AnyCap adaptation of this reference. Preserve the exact 16:9 camera, tunnel position and proportions, tall inner doorway, particle-floor perspective, particle avalanche directions, artifact distribution, card scale, depth, crop, and hierarchy.

Use warm off-white #f4f5f0 with subtle analog grain; near-black #1c1f17, olive #6b7d3a, supporting #4d5145, and pale sage #c8d4a0. Preserve exactly two left headline lines: “One capability layer.” and “Every way to finish.” Add “Human + agent” and “Create. Understand. Find. Manage. Deliver.” below.

The center-left must be a genuinely deep rectangular particle tunnel with heavy walls, seven to nine receding slices, a tall doorway, visible floor, large foreground cubes, fine interior dust, one human, and one smaller olive agent on the same floor plane.

The right must be one dense exit trunk separating into six to eight broad overlapping three-dimensional streams with shaped white channels, foreground cubes, middle olive particles, far pale dust, and crop beyond the top, right, and bottom. Never use uniform noise, thin lines, circular clouds, or a card grid.

Preserve fourteen artifact positions and relative scales while adapting them to coherent AnyCap evidence: Research, Editorial image, Screenshot analysis, Vision crop, Published page, Cinematic video, Audio waveform, Transcript, Share link, Music track, Search result, Generated variants, Code snippet, and Delivered. Use coherent editorial nature imagery and real functional UI detail, not gradient placeholders. Keep cards partially occluded while readable.

Keep model and capability names as tiny secondary annotations inside the streams. Add no logos, hero navigation, CTA, neon, glow, glass, blue field, guide lines, or storyboard labels. Output one clean final-state master.
```

- [ ] **Step 4: Apply four visual gates**

Use `view_image` on reference and candidate. Reject and regenerate unless all pass:

1. Tunnel reads as depth before particles; tall doorway, floor, and slices are distinct.
2. Flow reads as six-to-eight directional volumes with shaped channels, not noise.
3. Fourteen artifacts contain designed content and retain the reference hierarchy.
4. Read order is copy → tunnel → avalanche → artifacts → annotations.

- [ ] **Step 5: Save and normalize the approved candidate**

Save it as `final-master.png`, center-cropped and proportionally resampled to `1672 × 941`.

- [ ] **Step 6: Verify final images pass**

Run: `node docs/superpowers/demos/verify-homepage-capability-design-master.mjs final`

Expected: `homepage capability design master final: pass`.

- [ ] **Step 7: Commit**

```bash
git add docs/superpowers/design-masters/homepage-capability/reference-target.png docs/superpowers/design-masters/homepage-capability/final-master.png
git commit -m "design(web): add capability final master"
```

---

### Task 3: Five Motion Keyframes

**Files:**
- Create: `docs/superpowers/design-masters/homepage-capability/keyframes/01-limited.png`
- Create: `docs/superpowers/design-masters/homepage-capability/keyframes/02-install.png`
- Create: `docs/superpowers/design-masters/homepage-capability/keyframes/03-portal.png`
- Create: `docs/superpowers/design-masters/homepage-capability/keyframes/04-avalanche.png`
- Create: `docs/superpowers/design-masters/homepage-capability/keyframes/05-delivered.png`

**Interfaces:**
- Consumes: `final-master.png` as the sole camera/composition authority and manifest progress values.
- Produces: five same-camera storyboard frames for motion approval.

- [ ] **Step 1: Verify the keyframe contract fails**

Run: `node docs/superpowers/demos/verify-homepage-capability-design-master.mjs keyframes`

Expected: non-zero exit with `ENOENT` for `keyframes/01-limited.png`.

- [ ] **Step 2: Generate Limited**

Edit `final-master.png` with this exact prompt and save as `01-limited.png`:

```text
Keep the exact 1672×941 camera, crop, background, copy, and future object anchors. Show the limited pre-install state: human and olive agent on a short sparse path; faint distant dust indicates the future tunnel; no resolved wall; no readable artifact; right side mostly empty with subtle directional traces. Do not move or restyle the copy. This is a motion keyframe, not a new composition.
```

- [ ] **Step 3: Generate Install**

Edit `final-master.png` with this exact prompt and save as `02-install.png`:

```text
Keep the exact camera, crop, background, copy, tunnel position, and future artifact anchors. Show a restrained “anycap install” proof reaching the olive agent. Fine particles contract toward the doorway; deepest tunnel slices are visible; heavy outer walls are 25–35 percent assembled; model and capability surfaces remain unreadable silhouettes. Preserve final perspective and add no new UI.
```

- [ ] **Step 4: Generate Portal**

Edit `final-master.png` with this exact prompt and save as `03-portal.png`:

```text
Keep the exact camera, crop, background, copy, tunnel, subjects, and artifact anchors. Show the full deep tunnel and floor resolved, with human and olive agent inside. Upper incoming streams carry faint latest-model annotations through the doorway; only earliest upper artifact silhouettes begin resolving; the capability avalanche has not expanded. Preserve wall depth and final hierarchy.
```

- [ ] **Step 5: Generate Avalanche**

Edit `final-master.png` with this exact prompt and save as `04-avalanche.png`:

```text
Keep the exact camera, crop, background, copy, tunnel, subjects, and artifact anchors. Show the scene near 72 percent: the shared trunk expands into six to eight broad directional streams; Image, Video, Audio, Music, Understanding, and Search surfaces become readable after particles reach them; far-right delivery remains lower contrast; foreground particles begin crossing artifact edges. Avoid uniform noise.
```

- [ ] **Step 6: Create Delivered from the approved master**

Copy the exact `final-master.png` pixel content to `05-delivered.png`; do not regenerate it.

- [ ] **Step 7: Normalize and align**

Center-crop and proportionally resample all five frames to `1672 × 941`. Confirm identical headline baseline, tunnel center, doorway, human, and agent coordinates in every frame.

- [ ] **Step 8: Verify keyframes pass**

Run: `node docs/superpowers/demos/verify-homepage-capability-design-master.mjs keyframes`

Expected: `homepage capability design master keyframes: pass`.

- [ ] **Step 9: Commit**

```bash
git add docs/superpowers/design-masters/homepage-capability/keyframes
git commit -m "design(web): add capability motion keyframes"
```

---

### Task 4: Component And Layer Breakdown

**Files:**
- Create: `docs/superpowers/design-masters/homepage-capability/component-breakdown.svg`
- Create: `docs/superpowers/design-masters/homepage-capability/review.html`

**Interfaces:**
- Consumes: exact component names and `layerOrder` from `scene-manifest.json`.
- Produces: a 1600×900 ownership diagram and a minimal eight-image review stub.

- [ ] **Step 1: Verify breakdown mode fails**

Run: `node docs/superpowers/demos/verify-homepage-capability-design-master.mjs breakdown`

Expected: non-zero exit with `ENOENT` for `component-breakdown.svg`.

- [ ] **Step 2: Create the component diagram**

Create a warm off-white 1600×900 SVG with:

- a left depth stack ordered `background`, `copy`, `backgroundParticles`, `portalTunnel`, `humanAgentPair`, `artifactSurfaces`, `capabilityAnnotations`, `foregroundParticles`, `atmosphere`;
- a central node labeled `scene-manifest.json + canonical camera + normalized progress`;
- right ownership nodes labeled `CapabilityScene`, `PortalTunnel`, `HumanAgentPair`, `ParticleFlow`, `ArtifactSurface`, `CapabilityAnnotations`, `SceneAtmosphere`;
- connectors: CapabilityScene to all layers; PortalTunnel to portalTunnel; HumanAgentPair to humanAgentPair; ParticleFlow to both particle passes; ArtifactSurface to artifactSurfaces; CapabilityAnnotations to copy and capabilityAnnotations; SceneAtmosphere to background and atmosphere.

Use `#f4f5f0` background, `#1c1f17` text, `#6b7d3a` borders, `#c8d4a0` connectors, and no decorative gradients.

- [ ] **Step 3: Create the minimal review stub**

Create `review.html` containing headings `Reference target`, `Final master`, `Motion keyframes`, `Component breakdown`, and exactly eight `<img>` elements referencing the reference, final, five frames, and component SVG. Task 5 replaces the stub with the finished review layout.

- [ ] **Step 4: Verify breakdown mode passes**

Run: `node docs/superpowers/demos/verify-homepage-capability-design-master.mjs breakdown`

Expected: `homepage capability design master breakdown: pass`.

- [ ] **Step 5: Commit**

```bash
git add docs/superpowers/design-masters/homepage-capability/component-breakdown.svg docs/superpowers/design-masters/homepage-capability/review.html
git commit -m "design(web): map capability scene components"
```

---

### Task 5: Browser Review Companion

**Files:**
- Modify: `docs/superpowers/design-masters/homepage-capability/review.html`
- Create: `docs/superpowers/design-masters/homepage-capability/README.md`

**Interfaces:**
- Consumes: all design assets and manifest data.
- Produces: one local comparison page at `http://localhost:62894/review.html` and exact review instructions.

- [ ] **Step 1: Finish the review page**

Replace the stub with a self-contained HTML/CSS page that:

- uses AnyCap surface and text tokens;
- shows reference and master side-by-side at equal rendered size;
- shows five equal keyframe cards ordered Limited, Install, Portal, Avalanche, Delivered;
- shows the component SVG at full width;
- contains exactly eight `<img>` elements;
- uses no remote script, font, image, or stylesheet;
- shows intrinsic aspect ratios without `object-fit: cover`;
- displays a fixed label: `Design review only · production web unchanged`.

- [ ] **Step 2: Create README**

Create `README.md` with these exact commands and the approval boundary:

```markdown
# Homepage Capability Design Master

This package is a design approval surface. It does not modify the production homepage.

## Review

Run `python3 -m http.server 62894 --directory docs/superpowers/design-masters/homepage-capability` and open `http://localhost:62894/review.html`.

## Contract

Run `node docs/superpowers/demos/verify-homepage-capability-design-master.mjs all`.

## Approval Boundary

Do not begin production integration until the final master, five keyframes, and component breakdown are explicitly approved.
```

- [ ] **Step 3: Verify all structural contracts pass**

Run: `node docs/superpowers/demos/verify-homepage-capability-design-master.mjs all`

Expected: `homepage capability design master all: pass`.

- [ ] **Step 4: Start and inspect the review companion**

Run:

```bash
python3 -m http.server 62894 --directory docs/superpowers/design-masters/homepage-capability
```

Open `http://localhost:62894/review.html` without replacing the existing port-62893 demo tab. Verify equal reference/master size, uncropped images, correct keyframe order, readable SVG, no horizontal overflow, and no remote requests.

- [ ] **Step 5: Commit**

```bash
git add docs/superpowers/design-masters/homepage-capability/review.html docs/superpowers/design-masters/homepage-capability/README.md
git commit -m "docs(web): add capability design review companion"
```

---

### Task 6: Visual Approval Gate

**Files:**
- Modify only when corrections are requested: `docs/superpowers/design-masters/homepage-capability/**`

**Interfaces:**
- Consumes: `http://localhost:62894/review.html`.
- Produces: explicit approval or a bounded correction list; never production code.

- [ ] **Step 1: Run fresh final verification**

Run:

```bash
node docs/superpowers/demos/verify-homepage-capability-design-master.mjs all
git diff --check
git status --short --branch
git diff --name-only -- web docs/superpowers/demos/homepage-agent-capability-motion.source.html
```

Expected: all contract passes; diff check exits zero; branch is `codex/doubao-audio-positioning`; final command prints nothing.

- [ ] **Step 2: Request approval of exactly three surfaces**

Ask the user to approve:

1. final-master fidelity against reference;
2. five-frame motion narrative;
3. component/layer boundaries.

Do not combine this with production implementation approval.

- [ ] **Step 3: Apply bounded corrections**

Edit the final master first, regenerate only affected keyframes, update the SVG only when ownership changes, and rerun `all`. Never repair a failed master by changing the current WebGL demo.

- [ ] **Step 4: Commit approved corrections**

```bash
git add docs/superpowers/design-masters/homepage-capability
git commit -m "design(web): finalize capability design master"
```

- [ ] **Step 5: Stop at the design boundary**

Report approved asset paths and commit. Start a separate spec/plan cycle for production integration.
