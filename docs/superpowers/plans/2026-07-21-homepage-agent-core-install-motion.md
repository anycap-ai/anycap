# Homepage Agent Core Install Motion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add one production homepage section where an attentive matte agent tracks the user, accepts an AnyCap Core from its tabletop dock, and changes from zero capability values to current source-backed capability totals.

**Architecture:** Preserve the existing homepage and insert one client-side `AgentCoreInstallSection` after the `NOW IT CAN.` transition. The visual is a 2.5D composition made from four real transparent raster layers, while a small pure interaction state module and one scoped GSAP hook own pointer tracking, drag/drop installation, activation, telemetry, and reduced-motion behavior. The existing capability inventory remains the numeric source of truth.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS plus one scoped CSS module, `next/image`, GSAP 3.15.0, `@gsap/react` 2.1.2, ScrollTrigger, Node's built-in test runner, ImageGen-produced WebP assets, the Codex in-app browser.

## Global Constraints

- Work only on branch `codex/doubao-audio-positioning`; create no branch or worktree.
- Preserve the current hero, header, navigation, footer, metadata, routes, and every existing landing section.
- Insert the new section after `NOW IT CAN.` and before the existing `Any capability your agent was missing.` section.
- Reuse the existing `#f4f5f0` page background and fixed grain overlay; do not add a second background or grain layer.
- Reuse `--font-geist-pixel-square`, `--font-mono`, `--font-logo`, and the current system body stack for their existing roles.
- Visible copy is exactly the copy in `docs/superpowers/specs/2026-07-21-homepage-agent-core-install-motion-design.md`.
- Connected totals are `04`, `03`, `03`, `01`, and `01`, derived from the current capability inventory rather than hard-coded inside animation code.
- The Core begins upright on a physical tabletop dock; it never begins floating.
- Head motion is rotation around a fixed neck pivot. Do not translate the robot or detach the head.
- Desktop supports pointer tracking and drag-to-install. Touch supports tap-to-install. Keyboard supports Enter and Space.
- Use one scoped GSAP install timeline and one once-only entrance ScrollTrigger. Do not pin the section.
- With reduced motion, create no ScrollTrigger and no pointer tracking; render the connected state statically.
- Use no Three.js, WebGL scene, smooth-scroll library, inline SVG, handcrafted CSS robot art, provider logo, gradient wash, neon, or perpetual animation.
- Animate transforms and opacity. Cache layout reads and use `gsap.quickTo()` for pointer-driven head rotation.
- Keep all unrelated working-tree changes untouched and out of task commits.

---

### Task 1: Approved Master And Layered Asset Contract

**Files:**

- Create: `docs/superpowers/design-masters/homepage-agent-core/approved-master.png`
- Create: `web/public/visuals/agent-core/robot-body.webp`
- Create: `web/public/visuals/agent-core/robot-head.webp`
- Create: `web/public/visuals/agent-core/anycap-core.webp`
- Create: `web/public/visuals/agent-core/core-dock.webp`
- Create: `web/public/visuals/agent-core/asset-manifest.json`
- Create: `web/scripts/agent-core-assets.test.mjs`

**Interfaces:**

- Consumes: approved raster `/Users/tyluo/.codex/generated_images/019f788b-cbe7-7a91-aa82-82e5ed1f1dcd/exec-424ad8bf-c14c-4f7a-9e83-751d77226890.png`.
- Produces: four transparent WebP layers and `asset-manifest.json` with exact intrinsic dimensions used by `AgentCoreScene`.

- [ ] **Step 1: Write the failing asset test**

Create `web/scripts/agent-core-assets.test.mjs`:

```javascript
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { fileURLToPath } from "node:url";

const assetDirectory = fileURLToPath(new URL("../public/visuals/agent-core/", import.meta.url));
const manifestPath = `${assetDirectory}asset-manifest.json`;

function parseExtendedWebP(bytes, file) {
  assert.equal(bytes.subarray(0, 4).toString("ascii"), "RIFF", `${file}: RIFF`);
  assert.equal(bytes.subarray(8, 12).toString("ascii"), "WEBP", `${file}: WEBP`);
  const vp8x = bytes.indexOf(Buffer.from("VP8X"));
  assert.notEqual(vp8x, -1, `${file}: VP8X metadata`);
  const flags = bytes[vp8x + 8];
  const width = 1 + bytes.readUIntLE(vp8x + 12, 3);
  const height = 1 + bytes.readUIntLE(vp8x + 15, 3);
  return { hasAlpha: Boolean(flags & 0x10), width, height };
}

test("ships the four transparent agent-core layers", async () => {
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  assert.deepEqual(Object.keys(manifest.assets), ["body", "head", "core", "dock"]);
  for (const [key, entry] of Object.entries(manifest.assets)) {
    const bytes = await readFile(`${assetDirectory}${entry.file}`);
    const parsed = parseExtendedWebP(bytes, entry.file);
    assert.equal(parsed.hasAlpha, true, `${key}: transparent`);
    assert.deepEqual(
      { width: parsed.width, height: parsed.height },
      { width: entry.width, height: entry.height },
      `${key}: dimensions match manifest`,
    );
    assert.ok(bytes.byteLength < entry.maxBytes, `${key}: below byte budget`);
  }
});

test("records the stable scene anchors", async () => {
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  assert.deepEqual(manifest.artboard, { width: 1672, height: 941 });
  for (const key of ["headPivot", "socketCenter", "dockCenter"]) {
    assert.equal(typeof manifest.anchors[key].x, "number", `${key}.x`);
    assert.equal(typeof manifest.anchors[key].y, "number", `${key}.y`);
    assert.ok(manifest.anchors[key].x >= 0 && manifest.anchors[key].x <= 1, `${key}.x normalized`);
    assert.ok(manifest.anchors[key].y >= 0 && manifest.anchors[key].y <= 1, `${key}.y normalized`);
  }
});
```

- [ ] **Step 2: Run the asset test and verify RED**

Run:

```bash
cd web && node --test scripts/agent-core-assets.test.mjs
```

Expected: FAIL with `ENOENT` for `asset-manifest.json`.

- [ ] **Step 3: Preserve the approved master**

Copy the exact approved raster to
`docs/superpowers/design-masters/homepage-agent-core/approved-master.png`.
Do not resample or regenerate it. Record its SHA-256 before and after the copy
and require the two hashes to match.

- [ ] **Step 4: Generate the four isolated layers**

Use the built-in ImageGen tool, one call per asset. Attach the approved master
as the reference every time. Generate each asset on a perfectly flat solid
`#ff00ff` background for local removal, preserve the approved camera, material,
panel seams, olive accents, light direction, and scale, and add no text or
shadow outside the named object.

Prompts:

```text
robot-body: Isolate the exact approved matte upper torso, segmented neck, arms, and empty square chest socket. Remove the head completely while leaving a natural neck pivot. Keep the three-quarter camera and lighting. No Core, no dock, no table, no text.

robot-head: Isolate only the exact approved helmet/head and horizontal segmented perception strip. Keep the three-quarter camera and the neck-facing lower edge needed for rotation. No torso, no neck, no Core, no text.

anycap-core: Isolate only the exact approved upright square AnyCap Core module, front facing, including its layered olive/cream/black inset construction. No dock, no hand, no cursor, no text.

core-dock: Isolate only the exact approved low-profile physical tabletop dock/base, empty and front facing. No Core, no table, no text.
```

For every generated PNG:

1. inspect it with `view_image`;
2. remove the flat key with
   `/Users/tyluo/.codex/skills/.system/imagegen/scripts/remove_chroma_key.py`
   using `--auto-key border --soft-matte --transparent-threshold 12 --opaque-threshold 220 --despill`;
3. normalize transparent canvases with ImageMagick: body to `1024x1024`, head
   to `768x768`, Core to `512x512`, and dock to `640x320`; use `-trim +repage`,
   proportional resize, centered transparent extent, and no stretching;
4. convert with `cwebp -quiet -q 92 -alpha_q 100`;
5. inspect the final WebP against the approved master;
6. reject any layer with a magenta fringe, wrong camera, moved seam, cropped edge,
   or changed character design.

- [ ] **Step 5: Add the manifest**

Create `asset-manifest.json` with the normalized canvases and the approved
artboard anchors:

```json
{
  "version": 1,
  "artboard": { "width": 1672, "height": 941 },
  "assets": {
    "body": { "file": "robot-body.webp", "width": 1024, "height": 1024, "maxBytes": 900000 },
    "head": { "file": "robot-head.webp", "width": 768, "height": 768, "maxBytes": 420000 },
    "core": { "file": "anycap-core.webp", "width": 512, "height": 512, "maxBytes": 240000 },
    "dock": { "file": "core-dock.webp", "width": 640, "height": 320, "maxBytes": 180000 }
  },
  "anchors": {
    "headPivot": { "x": 0.706, "y": 0.468 },
    "socketCenter": { "x": 0.697, "y": 0.625 },
    "dockCenter": { "x": 0.637, "y": 0.898 }
  }
}
```

If visual comparison moves an anchor by more than two canonical pixels, update
the normalized coordinate from the corrected 1672-by-941 screenshot and add a
one-pixel raster-reproduction assertion to the asset test.

- [ ] **Step 6: Run GREEN and inspect assets**

Run:

```bash
cd web && node --test scripts/agent-core-assets.test.mjs
```

Expected: two passing tests and zero failures. Inspect the approved master and
all four final WebPs together with `view_image`.

- [ ] **Step 7: Commit Task 1**

```bash
git add docs/superpowers/design-masters/homepage-agent-core web/public/visuals/agent-core web/scripts/agent-core-assets.test.mjs
git commit -m "design(web): add agent core visual layers"
```

---

### Task 2: Source-Backed Capability Telemetry

**Files:**

- Modify: `web/src/lib/capability-inventory.ts`
- Create: `web/src/components/landing/agent-core/agent-core-stats.ts`
- Create: `web/scripts/agent-core-stats.test.mjs`
- Modify: `web/package.json`
- Create: `web/pnpm-lock.yaml`

**Interfaces:**

- Consumes: `pricingGenerationGroups`, `pricingActionRows`, and the existing private capability-gap catalog.
- Produces: `getAgentCoreStats(): readonly AgentCoreStat[]`, where each item is `{ id, label, value, capabilities }`.

- [ ] **Step 1: Add the TypeScript test loader**

Run:

```bash
cd web && pnpm add --save-exact -D tsx@4.23.1
```

Expected: `package.json` records exact `tsx` version `4.23.1` and
`web/pnpm-lock.yaml` is created.

- [ ] **Step 2: Write the failing telemetry test**

Create `web/scripts/agent-core-stats.test.mjs`:

```javascript
import assert from "node:assert/strict";
import test from "node:test";

async function loadStats() {
  try {
    return await import("../src/components/landing/agent-core/agent-core-stats.ts");
  } catch (error) {
    assert.fail(`agent core stats must exist: ${error.message}`);
  }
}

test("derives the five connected values from the public capability inventory", async () => {
  const { getAgentCoreStats } = await loadStats();
  const stats = getAgentCoreStats();
  assert.deepEqual(
    stats.map(({ id, label, value }) => ({ id, label, value })),
    [
      { id: "create", label: "Create", value: 4 },
      { id: "understand", label: "Understand", value: 3 },
      { id: "search", label: "Search", value: 3 },
      { id: "manage", label: "Manage", value: 1 },
      { id: "deliver", label: "Deliver", value: 1 },
    ],
  );
  assert.equal(stats.flatMap((entry) => entry.capabilities).length, 12);
});

test("formats values as stable two-digit telemetry", async () => {
  const { formatAgentCoreValue } = await loadStats();
  assert.equal(formatAgentCoreValue(0), "00");
  assert.equal(formatAgentCoreValue(4), "04");
  assert.equal(formatAgentCoreValue(12), "12");
});
```

- [ ] **Step 3: Run RED**

Run:

```bash
cd web && node --import tsx --test scripts/agent-core-stats.test.mjs
```

Expected: FAIL with `agent core stats must exist`.

- [ ] **Step 4: Expose inventory groups without changing public rows**

In `capability-inventory.ts`, add an `agentCoreGroup` field only to the existing
non-generation catalog entries and export one immutable grouped view:

```typescript
export type AgentCoreCapabilityGroupId =
  | "create"
  | "understand"
  | "search"
  | "manage"
  | "deliver";

type GapCatalogEntry = {
  // existing fields remain unchanged
  agentCoreGroup?: Exclude<AgentCoreCapabilityGroupId, "create">;
};

export const agentCoreCapabilityGroups = [
  {
    id: "create",
    capabilities: pricingGenerationGroups.map((group) => group.title),
  },
  ...(["understand", "search", "manage", "deliver"] as const).map((id) => ({
    id,
    capabilities: pricingCapabilityGapCatalog
      .filter((entry) => entry.agentCoreGroup === id)
      .map((entry) => entry.capability),
  })),
] as const;
```

Set `agentCoreGroup` to `understand` on Image understanding, Video analysis,
and Audio understanding; `search` on Web search, Grounded web search, and Web
crawl; `manage` on Drive storage; and `deliver` on Page hosting. Do not assign
`One auth flow`.

- [ ] **Step 5: Implement the adapter**

Create `agent-core-stats.ts`:

```typescript
import {
  agentCoreCapabilityGroups,
  type AgentCoreCapabilityGroupId,
} from "@/lib/capability-inventory";

export type AgentCoreStat = {
  id: AgentCoreCapabilityGroupId;
  label: "Create" | "Understand" | "Search" | "Manage" | "Deliver";
  value: number;
  capabilities: readonly string[];
};

const labels: Record<AgentCoreCapabilityGroupId, AgentCoreStat["label"]> = {
  create: "Create",
  understand: "Understand",
  search: "Search",
  manage: "Manage",
  deliver: "Deliver",
};

export function getAgentCoreStats(): readonly AgentCoreStat[] {
  return agentCoreCapabilityGroups.map((group) => ({
    id: group.id,
    label: labels[group.id],
    value: group.capabilities.length,
    capabilities: group.capabilities,
  }));
}

export function formatAgentCoreValue(value: number): string {
  return String(value).padStart(2, "0");
}
```

- [ ] **Step 6: Add a focused test script and run GREEN**

Add to `web/package.json`:

```json
"test:agent-core": "node --import tsx --test ./scripts/agent-core-*.test.mjs"
```

Run:

```bash
cd web && pnpm run test:agent-core
```

Expected: asset and telemetry tests pass with zero failures.

- [ ] **Step 7: Commit Task 2**

```bash
git add web/src/lib/capability-inventory.ts web/src/components/landing/agent-core/agent-core-stats.ts web/scripts/agent-core-stats.test.mjs web/package.json web/pnpm-lock.yaml
git commit -m "feat(web): derive agent core telemetry"
```

---

### Task 3: Pure Interaction Geometry And State

**Files:**

- Create: `web/src/components/landing/agent-core/agent-core-state.ts`
- Create: `web/scripts/agent-core-state.test.mjs`

**Interfaces:**

- Produces: `AgentCorePhase`, `clampHeadRotation`, `isCoreDropAccepted`, and `nextAgentCorePhase`; these functions contain no DOM or GSAP calls.

- [ ] **Step 1: Write the failing state tests**

Create `web/scripts/agent-core-state.test.mjs`:

```javascript
import assert from "node:assert/strict";
import test from "node:test";

async function loadState() {
  try {
    return await import("../src/components/landing/agent-core/agent-core-state.ts");
  } catch (error) {
    assert.fail(`agent core state must exist: ${error.message}`);
  }
}

test("clamps head rotation around a fixed pivot", async () => {
  const { clampHeadRotation } = await loadState();
  assert.deepEqual(
    clampHeadRotation({ x: 2000, y: -500 }, { left: 0, top: 0, width: 1000, height: 500 }),
    { yaw: 9, pitch: -5 },
  );
  assert.deepEqual(
    clampHeadRotation({ x: 500, y: 250 }, { left: 0, top: 0, width: 1000, height: 500 }),
    { yaw: 0, pitch: 0 },
  );
});

test("accepts a drop only when the Core center is inside the socket tolerance", async () => {
  const { isCoreDropAccepted } = await loadState();
  const socket = { left: 400, top: 200, width: 120, height: 120 };
  assert.equal(isCoreDropAccepted({ x: 460, y: 260 }, socket), true);
  assert.equal(isCoreDropAccepted({ x: 520, y: 260 }, socket), false);
});

test("commits installation once and ignores later drag events", async () => {
  const { nextAgentCorePhase } = await loadState();
  assert.equal(nextAgentCorePhase("awaiting", "drag-start"), "dragging");
  assert.equal(nextAgentCorePhase("dragging", "drop-rejected"), "awaiting");
  assert.equal(nextAgentCorePhase("dragging", "drop-accepted"), "installing");
  assert.equal(nextAgentCorePhase("installing", "install-complete"), "connected");
  assert.equal(nextAgentCorePhase("connected", "drag-start"), "connected");
});
```

- [ ] **Step 2: Run RED**

Run: `cd web && node --import tsx --test scripts/agent-core-state.test.mjs`

Expected: FAIL with `agent core state must exist`.

- [ ] **Step 3: Implement the pure module**

Create `agent-core-state.ts`:

```typescript
export type AgentCorePhase = "awaiting" | "dragging" | "installing" | "connected";
export type AgentCoreEvent =
  | "drag-start"
  | "drop-rejected"
  | "drop-accepted"
  | "install-complete";

type Point = { x: number; y: number };
type Rect = { left: number; top: number; width: number; height: number };

export function clampHeadRotation(point: Point, bounds: Rect) {
  const normalizedX = ((point.x - bounds.left) / bounds.width - 0.5) * 2;
  const normalizedY = ((point.y - bounds.top) / bounds.height - 0.5) * 2;
  return {
    yaw: Math.max(-9, Math.min(9, normalizedX * 9)),
    pitch: Math.max(-5, Math.min(5, normalizedY * 5)),
  };
}

export function isCoreDropAccepted(point: Point, socket: Rect): boolean {
  const centerX = socket.left + socket.width / 2;
  const centerY = socket.top + socket.height / 2;
  return (
    Math.abs(point.x - centerX) <= socket.width * 0.42 &&
    Math.abs(point.y - centerY) <= socket.height * 0.42
  );
}

export function nextAgentCorePhase(
  phase: AgentCorePhase,
  event: AgentCoreEvent,
): AgentCorePhase {
  if (phase === "connected") return "connected";
  if (phase === "awaiting" && event === "drag-start") return "dragging";
  if (phase === "dragging" && event === "drop-rejected") return "awaiting";
  if (phase === "dragging" && event === "drop-accepted") return "installing";
  if (phase === "installing" && event === "install-complete") return "connected";
  return phase;
}
```

- [ ] **Step 4: Run GREEN**

Run: `cd web && pnpm run test:agent-core`

Expected: all agent-core tests pass.

- [ ] **Step 5: Commit Task 3**

```bash
git add web/src/components/landing/agent-core/agent-core-state.ts web/scripts/agent-core-state.test.mjs
git commit -m "feat(web): define agent core interaction state"
```

---

### Task 4: Static Section, Responsive Layout, And Homepage Integration

**Files:**

- Create: `web/src/components/landing/agent-core/AgentCoreInstallSection.tsx`
- Create: `web/src/components/landing/agent-core/AgentCoreScene.tsx`
- Create: `web/src/components/landing/agent-core/AgentHeadTracker.tsx`
- Create: `web/src/components/landing/agent-core/AnyCapCoreControl.tsx`
- Create: `web/src/components/landing/agent-core/CapabilityTelemetry.tsx`
- Create: `web/src/components/landing/agent-core/agent-core.module.css`
- Modify: `web/src/components/landing/HumanHomePage.tsx`
- Create: `web/scripts/agent-core-section.test.mjs`

**Interfaces:**

- Consumes: Task 1 assets, Task 2 stats, Task 3 phase type.
- Produces: `AgentCoreInstallSection`, the only new symbol imported by `HumanHomePage`.

- [ ] **Step 1: Write the failing section contract**

Create `web/scripts/agent-core-section.test.mjs`:

```javascript
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { fileURLToPath } from "node:url";

const sectionPath = fileURLToPath(new URL("../src/components/landing/agent-core/AgentCoreInstallSection.tsx", import.meta.url));
const scenePath = fileURLToPath(new URL("../src/components/landing/agent-core/AgentCoreScene.tsx", import.meta.url));
const headPath = fileURLToPath(new URL("../src/components/landing/agent-core/AgentHeadTracker.tsx", import.meta.url));
const corePath = fileURLToPath(new URL("../src/components/landing/agent-core/AnyCapCoreControl.tsx", import.meta.url));
const telemetryPath = fileURLToPath(new URL("../src/components/landing/agent-core/CapabilityTelemetry.tsx", import.meta.url));
const homepagePath = fileURLToPath(new URL("../src/components/landing/HumanHomePage.tsx", import.meta.url));

function source(path) {
  return readFileSync(path, "utf8");
}

test("preserves the hero and inserts the agent Core section exactly once", () => {
  const homepage = source(homepagePath);
  assert.match(homepage, /Your agent can do more\./);
  assert.equal((homepage.match(/<AgentCoreInstallSection\s*\/>/g) ?? []).length, 1);
  assert.ok(homepage.indexOf("NOW IT CAN.") < homepage.indexOf("<AgentCoreInstallSection"));
  assert.ok(homepage.indexOf("<AgentCoreInstallSection") < homepage.indexOf("Any capability"));
});

test("keeps text in DOM and visuals in real image assets", () => {
  const section = source(sectionPath);
  const scene = `${source(scenePath)}\n${source(headPath)}\n${source(corePath)}`;
  const telemetry = source(telemetryPath);
  for (const text of [
    "One capability layer.",
    "Every way to finish.",
    "Human + agent",
    "Create. Understand. Find. Manage. Deliver.",
    "anycap install",
  ]) assert.ok(section.includes(text), text);
  for (const file of ["robot-body.webp", "robot-head.webp", "anycap-core.webp", "core-dock.webp"]) {
    assert.ok(scene.includes(file), file);
  }
  assert.match(scene, /from "next\/image"/);
  assert.match(telemetry, /getAgentCoreStats/);
  assert.match(section, /<noscript>/);
});

test("does not duplicate the page surface or draw fake visual assets", () => {
  const combined = `${source(sectionPath)}\n${source(scenePath)}\n${source(headPath)}\n${source(corePath)}`;
  assert.doesNotMatch(combined, /<svg\b|linear-gradient|radial-gradient|background-image/);
  assert.doesNotMatch(combined, /bg-\[#f4f5f0\]/);
});
```

- [ ] **Step 2: Run RED**

Run: `cd web && node --test scripts/agent-core-section.test.mjs`

Expected: FAIL with `ENOENT` for `AgentCoreInstallSection.tsx`.

- [ ] **Step 3: Build the static components**

Create the five components with these exact contracts:

```typescript
// CapabilityTelemetry.tsx
export type CapabilityTelemetryProps = {
  connected: boolean;
  statusRef: React.RefObject<HTMLSpanElement | null>;
  valueRefs: React.MutableRefObject<Array<HTMLSpanElement | null>>;
  fillRefs: React.MutableRefObject<Array<HTMLSpanElement | null>>;
};

// AgentCoreScene.tsx
export type AgentCoreSceneProps = {
  connected: boolean;
  sceneRef: React.RefObject<HTMLDivElement | null>;
  headRef: React.RefObject<HTMLDivElement | null>;
  coreRef: React.RefObject<HTMLButtonElement | null>;
  activationCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  socketRef: React.RefObject<HTMLDivElement | null>;
  dockRef: React.RefObject<HTMLDivElement | null>;
  onPointerDown: React.PointerEventHandler<HTMLButtonElement>;
  onPointerMove: React.PointerEventHandler<HTMLButtonElement>;
  onPointerUp: React.PointerEventHandler<HTMLButtonElement>;
  onKeyDown: React.KeyboardEventHandler<HTMLButtonElement>;
};

// AgentHeadTracker.tsx
export type AgentHeadTrackerProps = {
  headRef: React.RefObject<HTMLDivElement | null>;
};

// AnyCapCoreControl.tsx
export type AnyCapCoreControlProps = {
  coreRef: React.RefObject<HTMLButtonElement | null>;
  onPointerDown: React.PointerEventHandler<HTMLButtonElement>;
  onPointerMove: React.PointerEventHandler<HTMLButtonElement>;
  onPointerUp: React.PointerEventHandler<HTMLButtonElement>;
  onKeyDown: React.KeyboardEventHandler<HTMLButtonElement>;
};
```

`AgentCoreInstallSection.tsx` is a client component. It owns the refs and the
`AgentCorePhase` state, renders all approved copy with the existing font
variables, renders `CapabilityTelemetry`, then renders `AgentCoreScene`.

`AgentCoreScene` composes `AgentHeadTracker` and `AnyCapCoreControl`, and uses
`next/image` for the body and dock with explicit `width`, `height`, `sizes`, and
`draggable={false}`. `AgentHeadTracker` owns the real head image.
`AnyCapCoreControl` owns the real Core image and is a native `<button>` with
`aria-label="Install the AnyCap Core"`, a visible focus ring, and no baked-in
text. The socket is a transparent positioned hit target with
`aria-hidden="true"`. Add one socket-sized `<canvas aria-hidden="true">` for
the bounded activation burst; it remains clear outside installation.

`CapabilityTelemetry` renders all five rows immediately to prevent layout
shift. Awaiting values are `00`; connected values use `formatAgentCoreValue`.
Each row contains exactly twelve outlined cells, of which only `value` cells
receive the connected class.

Add a `<noscript>` final-state block containing the same five connected values
and a scoped `<style>` that hides only the awaiting interactive visual when
JavaScript is unavailable. The approved headline and supporting copy stay
visible in both paths.

- [ ] **Step 4: Implement the responsive CSS module**

Use one three-column desktop grid:

```css
.section { min-height: 100svh; padding: 8rem 6rem; position: relative; }
.layout { display: grid; grid-template-columns: minmax(290px, 0.78fr) minmax(260px, 0.58fr) minmax(520px, 1.28fr); align-items: center; gap: clamp(28px, 3vw, 64px); min-height: calc(100svh - 16rem); }
.scene { aspect-ratio: 0.94; position: relative; align-self: end; min-width: 0; }
.table { position: absolute; inset: auto 0 0; height: 10%; border-top: 1px solid #dce0d2; }
.head { position: absolute; transform-origin: 51% 92%; will-change: transform; }
.core { touch-action: none; cursor: grab; will-change: transform; }
.core:active { cursor: grabbing; }
```

At 768-1279px use two columns and place telemetry below copy. Below 768px use
one column, 32px horizontal padding, copy then scene then telemetry, disable
drag cursor, and guarantee `overflow-x: clip`. Do not set a section background.

- [ ] **Step 5: Integrate without removing existing content**

Import and render `AgentCoreInstallSection` in `HumanHomePage.tsx` after the
existing divider that follows `NOW IT CAN.`. Add one matching
`border-[#d4dbb8]` divider after the new section so the following existing
capability section keeps the original rhythm.

- [ ] **Step 6: Run GREEN and type-check**

Run:

```bash
cd web && pnpm run test:agent-core
cd web && pnpm exec tsc --noEmit
```

Expected: all tests pass and TypeScript exits zero.

- [ ] **Step 7: Commit Task 4**

```bash
git add web/src/components/landing/agent-core web/src/components/landing/HumanHomePage.tsx web/scripts/agent-core-section.test.mjs
git commit -m "feat(web): add agent core install section"
```

---

### Task 5: GSAP Entrance, Head Tracking, Drag, And Install Timeline

**Files:**

- Modify: `web/package.json`
- Modify: the repository package-manager lockfile created by `pnpm add`
- Create: `web/src/components/landing/agent-core/useAgentCoreTimeline.ts`
- Modify: `web/src/components/landing/agent-core/AgentCoreInstallSection.tsx`
- Modify: `web/src/components/landing/agent-core/AgentCoreScene.tsx`
- Modify: `web/src/components/landing/agent-core/CapabilityTelemetry.tsx`
- Create: `web/scripts/agent-core-motion.test.mjs`

**Interfaces:**

- Consumes: the Task 3 geometry/state functions and Task 4 refs.
- Produces: `useAgentCoreTimeline(options)` returning section-scoped pointer handlers and `install()`.

- [ ] **Step 1: Install the declared GSAP versions**

Run:

```bash
cd web && pnpm add --save-exact gsap@3.15.0 @gsap/react@2.1.2
```

Expected: `package.json` records both exact versions and installation exits
zero.

- [ ] **Step 2: Write the failing motion contract**

Create `web/scripts/agent-core-motion.test.mjs`:

```javascript
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { fileURLToPath } from "node:url";

const hookPath = fileURLToPath(new URL("../src/components/landing/agent-core/useAgentCoreTimeline.ts", import.meta.url));
const sectionPath = fileURLToPath(new URL("../src/components/landing/agent-core/AgentCoreInstallSection.tsx", import.meta.url));

test("uses one scoped GSAP lifecycle and one unpinned entrance trigger", () => {
  const source = readFileSync(hookPath, "utf8");
  assert.match(source, /useGSAP/);
  assert.match(source, /scope: sectionRef/);
  assert.match(source, /gsap\.registerPlugin\(useGSAP, ScrollTrigger\)/);
  assert.match(source, /once: true/);
  assert.match(source, /start: "top 72%"/);
  assert.doesNotMatch(source, /pin:\s*true|window\.addEventListener\(["']scroll/);
});

test("names every installation phase and uses measured geometry", () => {
  const source = readFileSync(hookPath, "utf8");
  for (const label of ["scene-in", "pickup", "dock", "activate", "capabilities", "hold"]) {
    assert.ok(source.includes(`addLabel("${label}"`), label);
  }
  assert.match(source, /getBoundingClientRect\(\)/);
  assert.match(source, /isCoreDropAccepted/);
  assert.match(source, /gsap\.quickTo/);
});

test("provides keyboard, pointer, touch, and reduced-motion paths", () => {
  const hook = readFileSync(hookPath, "utf8");
  const section = readFileSync(sectionPath, "utf8");
  assert.match(section, /onPointerDown/);
  assert.match(section, /onPointerMove/);
  assert.match(section, /onPointerUp/);
  assert.match(section, /onKeyDown/);
  assert.match(hook, /pointerType === "touch"/);
  assert.match(hook, /prefers-reduced-motion: reduce/);
  assert.match(hook, /ScrollTrigger\.create/);
  assert.match(hook, /cancelAnimationFrame/);
  assert.match(hook, /IntersectionObserver/);
});
```

- [ ] **Step 3: Run RED**

Run: `cd web && node --test scripts/agent-core-motion.test.mjs`

Expected: FAIL with `ENOENT` for `useAgentCoreTimeline.ts`.

- [ ] **Step 4: Implement the scoped motion hook**

The hook accepts:

```typescript
type UseAgentCoreTimelineOptions = {
  sectionRef: React.RefObject<HTMLElement | null>;
  sceneRef: React.RefObject<HTMLDivElement | null>;
  headRef: React.RefObject<HTMLDivElement | null>;
  coreRef: React.RefObject<HTMLButtonElement | null>;
  socketRef: React.RefObject<HTMLDivElement | null>;
  dockRef: React.RefObject<HTMLDivElement | null>;
  statusRef: React.RefObject<HTMLSpanElement | null>;
  valueRefs: React.MutableRefObject<Array<HTMLSpanElement | null>>;
  fillRefs: React.MutableRefObject<Array<HTMLSpanElement | null>>;
  activationCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  onPhaseChange: (phase: AgentCorePhase) => void;
};
```

Register `useGSAP` and `ScrollTrigger` once. Inside a scoped `useGSAP`:

1. query reduced motion with `matchMedia`;
2. if reduced, set the installed Core, connected status, final values, and
   filled cells immediately and return without creating ScrollTrigger;
3. otherwise create one once-only entrance timeline with
   `ScrollTrigger.create({ trigger: sectionRef.current, start: "top 72%", once: true })`;
4. use one `IntersectionObserver` to pause pointer response outside the section;
5. cache scene bounds and use `gsap.quickTo(headRef.current, "rotationY")` and
   `rotationX` for pointer tracking;
6. on drag start, capture the pointer and enter `dragging`;
7. on pointer move, update Core `x` and `y` transforms and point the head at the
   Core center;
8. on rejected drop, animate Core back to the measured dock center with
   `back.out(1.35)` and return to `awaiting`;
9. on accepted drop, run exactly one paused install timeline with the six named
   labels; compute socket delta from `core.getBoundingClientRect()` and
   `socket.getBoundingClientRect()` before any writes;
10. at `activate`, run a bounded 900ms canvas burst of no more than 64 olive
    square particles, cancel its animation frame after completion, and clear
    the canvas in cleanup;
11. at `capabilities`, tween a plain `{ value: 0 }` object per row, update only
   `textContent`, and fill the row's first `stat.value` cells in the same
   stagger;
12. use `contextSafe` for every event-created tween and remove pointer listeners,
    the observer, and the bounded canvas frame in cleanup.

The Core's click/touch and Enter/Space paths call the same `install()` function.
Ignore all install calls after the phase leaves `awaiting` or `dragging`.

- [ ] **Step 5: Wire handlers and live status**

Pass the hook's handlers into `AgentCoreScene`. Keep `phase` in
`AgentCoreInstallSection`, derive `connected = phase === "connected"`, and add
one visually-hidden `aria-live="polite"` element that changes once to
`AnyCap Core connected. Twelve capabilities are ready.`

- [ ] **Step 6: Run GREEN and type-check**

Run:

```bash
cd web && pnpm run test:agent-core
cd web && pnpm exec tsc --noEmit
```

Expected: all tests and type-check pass.

- [ ] **Step 7: Commit Task 5**

```bash
git add web/package.json web/pnpm-lock.yaml web/src/components/landing/agent-core web/scripts/agent-core-motion.test.mjs
git commit -m "feat(web): animate AnyCap Core installation"
```

---

### Task 6: Production Build, Browser Interaction QA, And Product Status

**Files:**

- Create: `design-qa.md`
- Modify: `docs/anycap-current-status.md`
- Modify only when a blocking visual issue is found: `web/src/components/landing/agent-core/**`

**Interfaces:**

- Consumes: the complete production section and approved master.
- Produces: a running localhost preview, same-state screenshots, and a passing `design-qa.md`.

- [ ] **Step 1: Run the complete automated verification**

Run:

```bash
cd web && pnpm run test:agent-core
cd web && pnpm run check:model-hub
cd web && pnpm exec tsc --noEmit
cd web && pnpm run build
git diff --check
```

Expected: every command exits zero. Do not continue to visual QA on a failed
command.

- [ ] **Step 2: Start the real app without changing the user's existing ports**

Run:

```bash
cd web && pnpm exec next dev --turbopack -p 3010
```

Keep the process running. Use the Codex in-app browser selected by the user.

- [ ] **Step 3: Verify the complete interaction at desktop size**

At 1672 by 941:

1. open `http://localhost:3010/`;
2. scroll the new section into view;
3. verify the hero above is unchanged;
4. verify the section background and grain have no seam;
5. move the pointer to all four corners and confirm head rotation stays attached
   to the fixed neck pivot;
6. drag the Core away and release outside the socket; confirm it returns to the
   dock;
7. drag the Core into the socket; confirm one installation sequence;
8. confirm values finish at `04`, `03`, `03`, `01`, `01`;
9. confirm the connected pose holds and no animation loops;
10. inspect the browser console for errors and hydration warnings.

- [ ] **Step 4: Verify touch, keyboard, and reduced motion**

- At 390 by 844, tap the Core and verify the full install completes without
  horizontal scrolling or cropped socket/Core.
- At desktop size, reload, focus the Core with Tab, and press Enter; verify the
  same install completes.
- Emulate reduced motion, reload, and verify the Core begins installed with the
  final values and no entrance ScrollTrigger or pointer tracking.

- [ ] **Step 5: Run blocking design comparison**

Capture the new section at 1672 by 941 in awaiting state. Open that screenshot
and `docs/superpowers/design-masters/homepage-agent-core/approved-master.png`
together. Write `design-qa.md` with:

```markdown
# Agent Core Section Design QA

Reference: docs/superpowers/design-masters/homepage-agent-core/approved-master.png
Prototype: .superpowers/design-qa/agent-core-awaiting-1672.png
Viewport: 1672 × 941
State: Awaiting

## Findings

- P0: none
- P1: none
- P2: none
- P3: none

final result: passed
```

If any P0/P1/P2 exists, record it, fix it, capture again, and repeat comparison.
Do not change `final result` to `passed` until all P0/P1/P2 findings are gone.

- [ ] **Step 6: Update current product status**

Add a concise current-state sentence under the web/landing section in
`docs/anycap-current-status.md`: the homepage includes an interactive AnyCap
Core installation section with source-backed capability telemetry, pointer and
keyboard interaction, responsive tap behavior, and reduced-motion fallback.
Do not write a changelog entry.

- [ ] **Step 7: Run final branch verification**

Run:

```bash
cd web && pnpm run test:agent-core && pnpm exec tsc --noEmit
git diff --check
git status --short --branch
git diff --name-only HEAD~1 -- web docs/anycap-current-status.md design-qa.md
```

Confirm unrelated Go changes remain unstaged and unchanged.

- [ ] **Step 8: Commit Task 6**

```bash
git add design-qa.md docs/anycap-current-status.md web/src/components/landing/agent-core
git commit -m "docs(web): verify agent core homepage motion"
```

---

### Task 7: Whole-Branch Review And Local Handoff

**Files:**

- Review only: all files changed from the parent of Task 1 through Task 6.
- Modify only for review fixes: files already in scope above.

**Interfaces:**

- Consumes: the complete reviewed task range and `design-qa.md`.
- Produces: final spec-compliance review, final code-quality review, and a live localhost handoff.

- [ ] **Step 1: Generate the complete review range**

Resolve the committed plan as the base and review the complete range:

```bash
BASE=$(git log -1 --format=%H -- docs/superpowers/plans/2026-07-21-homepage-agent-core-install-motion.md)
git diff --name-only "$BASE"..HEAD
git diff --check "$BASE"..HEAD
```

Verify no unrelated Go or server file entered the range.

- [ ] **Step 2: Dispatch final spec and quality review**

The reviewer checks every section of
`docs/superpowers/specs/2026-07-21-homepage-agent-core-install-motion-design.md`,
the Global Constraints above, visual asset fidelity, React/GSAP cleanup,
accessibility, inventory derivation, responsive behavior, and design QA
evidence. Critical and Important findings block handoff.

- [ ] **Step 3: Fix and re-review blocking findings**

Use a fresh fix agent for each bounded correction set. Rerun the smallest
relevant test first, then the complete Task 6 verification. Repeat review until
there are no Critical or Important findings.

- [ ] **Step 4: Final evidence**

Run fresh:

```bash
cd web && pnpm run test:agent-core
cd web && pnpm exec tsc --noEmit
cd web && pnpm run build
git diff --check
git status --short --branch
```

Open `http://localhost:3010/` one final time in the Codex in-app browser and
verify the install interaction. Keep the server alive for the user.

- [ ] **Step 5: Handoff**

Return the localhost URL first, state that the build is ready for tightening or
more functionality, mention the annotation tool in Codex Desktop, and report
the branch, task commits, verification evidence, remaining P3 notes, and the
fact that no new branch/worktree was created.
