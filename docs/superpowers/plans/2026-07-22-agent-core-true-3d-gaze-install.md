# Agent Core True-3D Gaze and Autonomous Installation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace only the approved Agent Core robot stage with a high-fidelity rigged 3D upper body that follows the pointer naturally and autonomously reaches for, carries, and installs the AnyCap Core.

**Architecture:** Keep the homepage layout, copy, telemetry, background, grain, fonts, and current WebP scene as the loading/error fallback. Add a local custom rigged GLB in a transparent demand-rendered React Three Fiber stage; pure TypeScript modules own gaze mapping and installation state, Three.js owns bones and IK, and GSAP owns the one-shot narrative plus DOM telemetry.

**Tech Stack:** Next.js 15, React 19, TypeScript 5, Three.js 0.185.1, React Three Fiber 9.6.1, Drei 10.7.7, GSAP 3.15, Blender local authoring/export, Node test runner with `tsx`, Codex in-app browser.

## Global Constraints

- Work only on `codex/doubao-audio-positioning`; create no branch or worktree.
- Do not touch unrelated Go provider edits, Audio Generation work, model-hub edits, capability SEO edits, SEO audit files, or `.superpowers/` files outside task-owned QA artifacts.
- Preserve the homepage hero, surrounding sections, visible copy, DOM telemetry, paper surface, grain, fonts, three-zone layout, and source-backed values `04 / 03 / 03 / 01 / 01`.
- Preserve the approved 1672-by-941 composition and the selected 2229-by-1255 reference capture as the visual source of truth.
- The robot stays a matte ivory upper body with black segmented neck, horizontal pixel visor, olive seams, square chest socket, physical dock, and seated tabletop Core.
- Horizontal gaze is clamped to approximately `±70°`, vertical gaze to `±25°`, and roll to `±3°`; the head must not spin continuously.
- Selecting the Core makes the robot reach, grasp, carry, install, release, and return. The Core must not self-fly during the primary 3D path.
- Use a local custom rigged GLB. The user-supplied Tripo GLB is authorized only as an offline high-poly reference; never ship it directly or call a remote model service at runtime. A new credit-consuming generation is a separate route and requires explicit user authorization. Do not use runtime primitive robot construction, Meshy, Spline, remote model URLs, remote HDRs, or a physics engine.
- Keep the current WebP composition visible until the first correct 3D frame and on every load, model, bone-validation, WebGL, or context-recovery failure.
- Use `frameloop="demand"`, DPR caps of 1.5 desktop and 1.25 mobile, no post-processing, no camera controls, and no perpetual animation.
- Do not make the 3D runtime primary until isolated turntable and installation-keyframe visual review passes.
- Follow TDD: record RED, make the smallest complete implementation, verify GREEN, then commit each task.

## File and Responsibility Map

### Asset and contract

- Create `web/public/visuals/agent-core-3d/model-contract.json` — canonical node, bone, anchor, camera, material, gaze, size, and performance contract.
- Create `web/public/visuals/agent-core-3d/agent-core-upper-body.glb` — approved optimized production asset.
- Create `web/scripts/agent-core-3d-contract.test.mjs` — validates JSON and binary GLB structure without rendering.
- Create `tools/agent-core-3d/README.md` — exact Blender authoring, naming, export, and review instructions.
- Create local review artifacts under `.superpowers/design-qa/agent-core-3d/` — model sheet, turntable, keyframes, and comparisons; never stage them.

### Pure behavior

- Create `web/src/components/landing/agent-core/agent-core-gaze.ts` — pointer-to-world mapping, yaw/pitch limits, neck/head split, and shortest-path helpers.
- Create `web/src/components/landing/agent-core/agent-core-install-state.ts` — one-shot installation reducer, Core ownership, and authored phase timing.
- Create `web/scripts/agent-core-3d-gaze.test.mjs` — direct behavior tests for nine pointer targets and angle limits.
- Create `web/scripts/agent-core-3d-install.test.mjs` — state, ownership, phase, and reduced-motion tests.

### Runtime

- Create `web/src/components/landing/agent-core/agent-core-3d-bridge.ts` — mutable bridge between DOM/GSAP and R3F without per-frame React state.
- Create `web/src/components/landing/agent-core/AgentCoreStage3D.tsx` — lazy transparent Canvas, fallback readiness, context handling, DPR, and demand rendering.
- Create `web/src/components/landing/agent-core/AgentCoreRig3D.tsx` — GLB load/validation, semantic bones, camera-ready pose, lights, materials, and 3D Core ownership.
- Create `web/src/components/landing/agent-core/useAgentCoreGaze3D.ts` — section pointer ownership and narrative gaze targets.
- Create `web/src/components/landing/agent-core/useAgentCoreInstall3D.ts` — GSAP phase timeline, IK target waypoints, Core reparenting, and completion.
- Modify `web/src/components/landing/agent-core/AgentCoreInstallSection.tsx` — owns phase, bridge, fallback/canvas composition, accessible trigger, and live status.
- Modify `web/src/components/landing/agent-core/AgentCoreScene.tsx` — becomes the unchanged approved fallback scene rather than the primary successful runtime.
- Modify `web/src/components/landing/agent-core/AnyCapCoreControl.tsx` — native click/tap/keyboard trigger aligned to the 3D dock; no primary drag narrative.
- Modify `web/src/components/landing/agent-core/useAgentCoreTimeline.ts` — DOM entrance and telemetry only; remove primary Core self-flight and 2D head tracking after the 3D stage is ready.
- Modify `web/src/components/landing/agent-core/agent-core.module.css` — transparent stage/fallback layering, readiness transitions, focus outline, and responsive scene slots.
- Modify `web/scripts/agent-core-section.test.mjs` and `web/scripts/agent-core-motion.test.mjs` — update master-preservation contracts for approved custom GLB and autonomous installation.
- Modify `web/package.json` and `web/pnpm-lock.yaml` — add exact compatible Three/R3F dependencies and focused script coverage.

---

### Task 1: Lock the custom-model contract before asset work

**Files:**
- Create: `web/public/visuals/agent-core-3d/model-contract.json`
- Create: `web/scripts/agent-core-3d-contract.test.mjs`

**Interfaces:**
- Consumes: approved `web/public/visuals/agent-core/asset-manifest.json` anchors and the written design specification.
- Produces: `AgentCore3DContract` JSON with stable node names, arm bones, camera, materials, anchors, limits, and asset budgets used by every later task.

- [ ] **Step 1: Write the contract JSON**

Create the file with these exact top-level values and names:

```json
{
  "version": 1,
  "artboard": { "width": 1672, "height": 941 },
  "asset": {
    "file": "agent-core-upper-body.glb",
    "maxBytes": 3145728,
    "maxTextureDimension": 2048,
    "maxDrawCalls": 45,
    "maxTriangles": 100000,
    "maxVertices": 75000,
    "maxBones": 32,
    "maxSkinInfluences": 4
  },
  "camera": {
    "type": "perspective",
    "fovRange": [28, 34],
    "controls": false
  },
  "requiredNodes": [
    "AgentRoot", "torso", "chest_socket", "head", "visor",
    "core", "core_dock", "core_grip_R"
  ],
  "requiredBones": [
    "clavicle_R", "upper_arm_R", "forearm_R", "hand_R",
    "neck_lower", "neck_upper", "ik_target_R"
  ],
  "requiredHierarchy": {
    "torso": "AgentRoot",
    "chest_socket": "torso",
    "clavicle_R": "AgentRoot",
    "upper_arm_R": "clavicle_R",
    "forearm_R": "upper_arm_R",
    "hand_R": "forearm_R",
    "ik_target_R": "AgentRoot",
    "neck_lower": "AgentRoot",
    "neck_upper": "neck_lower",
    "head": "neck_upper",
    "visor": "head",
    "core_grip_R": "hand_R",
    "core": "AgentRoot",
    "core_dock": "AgentRoot"
  },
  "anchors": {
    "socketScreen": { "x": 0.697, "y": 0.625 },
    "dockScreen": { "x": 0.637, "y": 0.898 }
  },
  "gazeLimitsDegrees": {
    "yaw": [-70, 70],
    "pitch": [-25, 25],
    "roll": [-3, 3],
    "neckShare": 0.3,
    "headShare": 0.7
  },
  "materials": ["ivory_shell", "black_joint", "olive_detail", "socket_dark", "core_shell"],
  "forbidden": ["tripo", "meshy", "spline", "http://", "https://"]
}
```

- [ ] **Step 2: Write the focused contract test**

The test must import the JSON, compare the artboard and legacy anchors, verify
all names are unique, check the exact gaze limits, and reject remote/forbidden
strings:

```js
test("locks the approved custom-rig contract", () => {
  assert.deepEqual(contract.artboard, { width: 1672, height: 941 });
  assert.deepEqual(contract.anchors.socketScreen, legacy.anchors.socketCenter);
  assert.deepEqual(contract.anchors.dockScreen, legacy.anchors.dockCenter);
  assert.deepEqual(contract.gazeLimitsDegrees.yaw, [-70, 70]);
  assert.deepEqual(contract.gazeLimitsDegrees.pitch, [-25, 25]);
  assert.deepEqual(contract.gazeLimitsDegrees.roll, [-3, 3]);
  assert.equal(new Set([...contract.requiredNodes, ...contract.requiredBones]).size,
    contract.requiredNodes.length + contract.requiredBones.length);
  assert.doesNotMatch(JSON.stringify(contract).toLowerCase(), /tripo|meshy|spline|https?:\/\//);
});
```

- [ ] **Step 3: Verify the existing focused glob discovers the RED test**

Do not change `web/package.json`: its existing
`node --import tsx --test ./scripts/agent-core-*.test.mjs` glob already discovers
`agent-core-3d-contract.test.mjs`. Run:

```bash
cd web && pnpm run test:agent-core
```

Expected: the new test fails until imports/paths and the exact contract exist;
the existing 34 tests still execute.

- [ ] **Step 4: Finish the contract implementation and verify GREEN**

Run:

```bash
cd web && pnpm run test:agent-core
git diff --check
```

Expected: all tests pass and the diff check is clean.

- [ ] **Step 5: Commit the contract**

```bash
git add web/public/visuals/agent-core-3d/model-contract.json \
  web/scripts/agent-core-3d-contract.test.mjs
git commit -m "test(web): lock agent core 3d model contract"
```

---

### Task 2: Author, validate, and visually approve the rigged GLB

**Files:**
- Create: `web/public/visuals/agent-core-3d/agent-core-upper-body.glb`
- Create: `tools/agent-core-3d/README.md`
- Modify: `web/scripts/agent-core-3d-contract.test.mjs`
- Local only: `.superpowers/design-qa/agent-core-3d/model-sheet.png`
- Local only: `.superpowers/design-qa/agent-core-3d/turntable-*.png`
- Local only: `.superpowers/design-qa/agent-core-3d/install-keyframe-*.png`

**Interfaces:**
- Consumes: `model-contract.json`, approved front master, current four WebP layers.
- Produces: a local GLB whose node/bone/material names and visual turntable have passed independent review.

- [ ] **Step 1: Establish the Blender authoring runtime**

Run the read-only probe first:

```bash
command -v blender || find /Applications -maxdepth 2 -iname 'Blender.app' -print
```

If absent and Homebrew exists, install the official Blender cask. If both
Blender and Homebrew are absent, stop Task 2 and report the missing local DCC
runtime; do not substitute a remote modeling service.

```bash
command -v brew
brew install --cask blender
```

Resolve the binary explicitly and record its exact path and version in
`tools/agent-core-3d/README.md`:

```bash
BLENDER_BIN="$(command -v blender || true)"
if [ -z "$BLENDER_BIN" ] && [ -x /Applications/Blender.app/Contents/MacOS/Blender ]; then
  BLENDER_BIN=/Applications/Blender.app/Contents/MacOS/Blender
fi
test -x "$BLENDER_BIN"
"$BLENDER_BIN" --version
```

Expected: a stable Blender version prints and no runtime dependency is added to
the web application.

- [ ] **Step 2: Produce the modeling reference sheet**

Use the image-generation skill with the approved master attached and this
art direction:

```text
Create one neutral orthographic product-design turnaround sheet for the exact
AnyCap upper-body robot in the reference. Preserve the matte ivory shell,
black segmented neck and joints, horizontal black pixel visor with restrained
olive cells, thin olive seams, nested square chest socket, shoulder width, and
premium industrial proportions. Show front, left 70-degree, right 70-degree,
side, and back-head views plus the right arm in rest, reach, grasp, carry, dock,
and return poses. Plain transparent or paper-white background, no text except
small technical view labels, no redesign, no weapons, no Iron Man styling.
```

Save and open the resulting sheet beside the approved master. Reject any sheet
that changes the helmet, visor, neck, socket, shell finish, or proportions.
This sheet guides unseen surfaces; the approved front master remains primary.

- [ ] **Step 3: Author the model and rig in Blender**

Choose exactly one source route before authoring:

- **Route A — user-supplied reference:** retain the existing high-poly GLB only
  as a proportion/material reference and manually author a clean production
  shell in Blender. Do not run another automated remesh on its overlapping open
  patches.
- **Route B — new clean low-poly generation:** only after explicit user
  authorization for the credit-consuming call, generate a neutral multiview
  A-pose source with open hands and no fused Core/dock/socket. It must pass the
  incoming silhouette/topology gate in `tools/agent-core-3d/README.md` before
  semantic modeling or rigging begins.

For Route B, prepare generated geometry before Blender rigging in this exact
order:

1. retopology / Smart LowPoly with a web-oriented face budget;
2. export the unrigged low-poly result with textures;
3. rebuild semantic hard-surface parts in Blender;
4. create and weight the final custom rig in Blender;
5. export and validate the production GLB.

Do not rig before retopology. Mesh-editing and remeshing operations reconstruct
geometry and strip bones, skin weights, and animation bindings. Tripo auto-rig
may be used only as a diagnostic reference; it cannot replace the custom
`neck_lower` / `neck_upper` / right-arm / `ik_target_R` rig required by the
autonomous hand-to-socket narrative.

Create a cropped upper-body product model with these enforced properties:

- front camera silhouette overlays the approved robot ROI without material
  shape drift;
- arm is a skinned chain containing `clavicle_R`, `upper_arm_R`, `forearm_R`,
  `hand_R`, and helper `ik_target_R`;
- `core_grip_R` is a transform under `hand_R`;
- `chest_socket`, `core`, and `core_dock` are separate named objects;
- neck/head chain contains `neck_lower`, `neck_upper`, and `head`;
- Core fits the socket without scale animation after final docking;
- materials use the exact names from the contract;
- the rest pose matches the approved awaiting image.

Export with GLB, embedded local textures, `+Y` up, `-Z` forward, applied object
transforms, skinning enabled, no cameras/lights exported, and no external URI.

- [ ] **Step 4: Add dependency-free GLB structural validation**

Extend the test with a binary JSON-chunk reader:

```js
function readGlbJson(path) {
  const buffer = readFileSync(path);
  assert.equal(buffer.readUInt32LE(0), 0x46546c67, "glTF magic");
  assert.equal(buffer.readUInt32LE(4), 2, "glTF version");
  const jsonLength = buffer.readUInt32LE(12);
  assert.equal(buffer.readUInt32LE(16), 0x4e4f534a, "JSON chunk");
  return JSON.parse(buffer.subarray(20, 20 + jsonLength).toString("utf8").trim());
}

test("ships one local validated rigged GLB", () => {
  const stat = statSync(glbPath);
  const gltf = readGlbJson(glbPath);
  const names = (gltf.nodes ?? []).map((node) => node.name).filter(Boolean);
  const nameCounts = new Map(names.map((name) => [name, names.filter((item) => item === name).length]));
  assert.ok(stat.size <= contract.asset.maxBytes);
  for (const name of [...contract.requiredNodes, ...contract.requiredBones]) {
    assert.equal(nameCounts.get(name), 1, `${name} must exist exactly once`);
  }
  // Resolve node indices and assert every required parent/child edge.
  // Count mesh primitive triangles/vertices, skins/joints, materials, cameras,
  // lights, accessors, and texture dimensions against the exact contract
  // limits. Reject JOINTS_1/WEIGHTS_1 (or any higher-index influence set), and
  // verify no vertex has more than four nonzero WEIGHTS_0 entries. Count draw
  // calls per rendered node instance, not only unique primitive definitions.
  // Reject every external buffer/image URI and every unapproved material name.
  for (const image of gltf.images ?? []) assert.equal(image.uri, undefined);
  for (const buffer of gltf.buffers ?? []) assert.equal(buffer.uri, undefined);
  assert.equal((gltf.cameras ?? []).length, 0);
  assert.equal(gltf.extensions?.KHR_lights_punctual?.lights?.length ?? 0, 0);
});
```

- [ ] **Step 5: Record RED, then validate GREEN**

Before copying the final GLB, run the focused test and record the missing/invalid
asset failure. After export, run:

```bash
cd web && pnpm exec node --test scripts/agent-core-3d-contract.test.mjs
```

Expected: all contract and GLB structure checks pass.

- [ ] **Step 6: Render the isolated visual gate**

Render the fixed front camera, five yaw positions, three pitch positions, and
five installation key poses into `.superpowers/design-qa/agent-core-3d/`.
Create side-by-side front, turntable, and keyframe comparisons and open them at
original detail. Do not proceed while any P0/P1/P2 issue remains in silhouette,
visor, neck, material, socket, camera, grip, arm intersection, or crop.

- [ ] **Step 7: Commit only the approved asset package**

```bash
git add web/public/visuals/agent-core-3d/agent-core-upper-body.glb \
  web/scripts/agent-core-3d-contract.test.mjs tools/agent-core-3d/README.md
git commit -m "feat(web): add approved rigged agent core asset"
```

Do not stage `.superpowers/` review images.

---

### Task 3: Implement pure true-3D gaze math

**Files:**
- Create: `web/src/components/landing/agent-core/agent-core-gaze.ts`
- Create: `web/scripts/agent-core-3d-gaze.test.mjs`

**Interfaces:**
- Consumes: pointer coordinates, section bounds, mode, and limits from the model contract.
- Produces: `mapPointerToGaze`, `splitGazeRotation`, `clampGaze`, and `shortestAngleDelta` with no DOM or Three.js dependency.

- [ ] **Step 1: Write the failing nine-position gaze tests**

Import the TypeScript functions under `node --import tsx` and assert:

```js
const bounds = { left: 100, top: 50, width: 1000, height: 600 };

test("maps the section edges to natural gaze limits", () => {
  assert.deepEqual(mapPointerToGaze({ x: 100, y: 350 }, bounds), { yaw: -70, pitch: 0 });
  assert.deepEqual(mapPointerToGaze({ x: 1100, y: 350 }, bounds), { yaw: 70, pitch: 0 });
  assert.deepEqual(mapPointerToGaze({ x: 600, y: 50 }, bounds), { yaw: 0, pitch: -25 });
  assert.deepEqual(mapPointerToGaze({ x: 600, y: 650 }, bounds), { yaw: 0, pitch: 25 });
});

test("splits rotation across neck and head", () => {
  assert.deepEqual(splitGazeRotation({ yaw: 70, pitch: 20 }), {
    neck: { yaw: 21, pitch: 6 },
    head: { yaw: 49, pitch: 14 }
  });
});

test("never chooses a full-spin path", () => {
  assert.equal(shortestAngleDelta(170, -170), 20);
  assert.equal(shortestAngleDelta(-170, 170), -20);
});
```

Also cover center, four corners, dead-zone behavior, clamping outside bounds,
connected amplitude, and finite output for zero-size bounds.

- [ ] **Step 2: Run the test and verify RED**

```bash
cd web && node --import tsx --test scripts/agent-core-3d-gaze.test.mjs
```

Expected: FAIL because the module/functions do not yet exist.

- [ ] **Step 3: Implement the pure gaze API**

Use these exact exports:

```ts
export type GazeAngles = { yaw: number; pitch: number; roll?: number };
export type Bounds = { left: number; top: number; width: number; height: number };

export function clampGaze(angles: GazeAngles): Required<GazeAngles>;
export function mapPointerToGaze(point: { x: number; y: number }, bounds: Bounds,
  amplitude?: number): GazeAngles;
export function splitGazeRotation(angles: GazeAngles): {
  neck: Required<GazeAngles>;
  head: Required<GazeAngles>;
};
export function shortestAngleDelta(fromDegrees: number, toDegrees: number): number;
```

Map normalized X and Y into the exact limits, apply a three-percent central
dead zone, clamp amplitude to `[0, 1]`, split 30/70, and normalize angle deltas
into `[-180, 180]`.

- [ ] **Step 4: Verify GREEN and regression safety**

```bash
cd web && node --import tsx --test scripts/agent-core-3d-gaze.test.mjs
cd web && pnpm run test:agent-core
cd web && pnpm exec tsc --noEmit
```

Expected: all gaze tests and existing Agent Core tests pass; TypeScript exits zero.

- [ ] **Step 5: Commit**

```bash
git add web/src/components/landing/agent-core/agent-core-gaze.ts \
  web/scripts/agent-core-3d-gaze.test.mjs
git commit -m "feat(web): add bounded agent gaze model"
```

---

### Task 4: Implement the autonomous installation state and ownership model

**Files:**
- Create: `web/src/components/landing/agent-core/agent-core-install-state.ts`
- Create: `web/scripts/agent-core-3d-install.test.mjs`

**Interfaces:**
- Consumes: one activation event and named phase-completion events.
- Produces: `AgentCoreInstallPhase`, `CoreOwner`, `nextInstallState`, `INSTALL_PHASES`, and `INSTALL_WAYPOINTS` for GSAP/R3F.

- [ ] **Step 1: Write the failing state and ownership tests**

```js
test("runs one autonomous install in the required order", () => {
  let state = initialInstallState();
  for (const event of [
    "activate", "targeted", "reached", "grasped", "carried",
    "docked", "activated", "returned"
  ]) state = nextInstallState(state, event);
  assert.equal(state.phase, "connected");
  assert.equal(state.coreOwner, "socket");
});

test("moves Core ownership exactly once per boundary", () => {
  assert.equal(nextInstallState(stateAt("reaching"), "reached").coreOwner, "dock");
  assert.equal(nextInstallState(stateAt("grasping"), "grasped").coreOwner, "hand");
  assert.equal(nextInstallState(stateAt("docking"), "docked").coreOwner, "socket");
});

test("ignores a second activation", () => {
  const targeting = nextInstallState(initialInstallState(), "activate");
  assert.deepEqual(nextInstallState(targeting, "activate"), targeting);
});
```

Cover invalid/out-of-order events, reduced-motion direct connection, reload
reset, exact phase timing within 2.6–3.0 seconds, and no `free` ownership during
carrying.

- [ ] **Step 2: Run the test and verify RED**

```bash
cd web && node --import tsx --test scripts/agent-core-3d-install.test.mjs
```

Expected: FAIL because the state module is absent.

- [ ] **Step 3: Implement the exact state types**

```ts
export type AgentCoreInstallPhase =
  | "awaiting" | "targeting" | "reaching" | "grasping" | "carrying"
  | "docking" | "activating" | "returning" | "connected";

export type CoreOwner = "dock" | "hand" | "socket";

export type AgentCoreInstallState = {
  phase: AgentCoreInstallPhase;
  coreOwner: CoreOwner;
  started: boolean;
};
```

Export a closed transition table, deterministic phase timestamps matching the
specification, and world-space waypoint names `dock`, `preGrip`, `grip`,
`carryApex`, `preSocket`, `socket`, and `rest`.

- [ ] **Step 4: Verify GREEN**

```bash
cd web && node --import tsx --test scripts/agent-core-3d-install.test.mjs
cd web && pnpm run test:agent-core
cd web && pnpm exec tsc --noEmit
```

Expected: all tests pass and TypeScript exits zero.

- [ ] **Step 5: Commit**

```bash
git add web/src/components/landing/agent-core/agent-core-install-state.ts \
  web/scripts/agent-core-3d-install.test.mjs
git commit -m "feat(web): model autonomous core installation"
```

---

### Task 5: Add the transparent R3F stage with master fallback

**Files:**
- Create: `web/src/components/landing/agent-core/agent-core-3d-bridge.ts`
- Create: `web/src/components/landing/agent-core/AgentCoreStage3D.tsx`
- Create: `web/src/components/landing/agent-core/AgentCoreRig3D.tsx`
- Modify: `web/src/components/landing/agent-core/AgentCoreInstallSection.tsx`
- Modify: `web/src/components/landing/agent-core/AgentCoreScene.tsx`
- Modify: `web/src/components/landing/agent-core/agent-core.module.css`
- Modify: `web/scripts/agent-core-section.test.mjs`
- Modify: `web/package.json`
- Modify: `web/pnpm-lock.yaml`

**Interfaces:**
- Consumes: approved GLB, model contract, existing WebP scene, section phase.
- Produces: `AgentCoreStage3D`, `AgentCore3DBridge`, `createAgentCore3DBridge`, readiness/error callbacks, and an always-safe fallback.

- [ ] **Step 1: Write failing stage source contracts**

First remove the obsolete assertions that forbid `three`,
`@react-three/fiber`, GLB loading, or a WebGL stage; those assertions described
the rejected lower-fidelity prototype and now conflict with the approved custom
rig. Replace them with contracts that require the local approved GLB and forbid
runtime primitive construction. Update section tests to require:

```js
assert.match(section, /dynamic\(.*AgentCoreStage3D/);
assert.match(stage, /frameloop="demand"/);
assert.match(stage, /alpha:\s*true/);
assert.match(stage, /dpr=\{isMobile \? \[1, 1\.25\] : \[1, 1\.5\]\}/);
assert.match(rig, /agent-core-upper-body\.glb/);
assert.match(rig, /useGLTF/);
assert.doesNotMatch(rig, /boxGeometry|sphereGeometry|capsuleGeometry|cylinderGeometry/);
assert.match(section, /AgentCoreScene/);
assert.match(styles, /\.stageReady[\s\S]*\.fallbackVisual/);
```

Also assert that the fallback cannot be hidden by load start alone and that no
remote URL appears in the stage, rig, contract, package, or lockfile.

- [ ] **Step 2: Run focused tests and verify RED**

```bash
cd web && node --import tsx --test \
  scripts/agent-core-section.test.mjs scripts/agent-core-3d-contract.test.mjs
```

Expected: FAIL because stage, rig, bridge, and dependencies are absent.

- [ ] **Step 3: Add exact compatible dependencies**

```bash
cd web && pnpm add --save-exact three@0.185.1 @react-three/fiber@9.6.1 \
  @react-three/drei@10.7.7 && pnpm add --save-exact -D @types/three@0.185.1
```

Verify no unrelated manifest entry changes.

- [ ] **Step 4: Implement the mutable bridge**

Use one stable object, not frame-by-frame React state:

```ts
export type GazeMode = "user" | "core" | "socket" | "neutral";

export type AgentCore3DBridge = {
  phase: AgentCoreInstallPhase;
  coreOwner: CoreOwner;
  gazeMode: GazeMode;
  pointer: { x: number; y: number; active: boolean };
  progress: number;
  invalidate: (() => void) | null;
};

export function createAgentCore3DBridge(): AgentCore3DBridge {
  return {
    phase: "awaiting", coreOwner: "dock", gazeMode: "user",
    pointer: { x: 0, y: 0, active: false }, progress: 0, invalidate: null
  };
}
```

- [ ] **Step 5: Implement the safe stage shell**

`AgentCoreInstallSection` keeps `AgentCoreScene` mounted as the approved
fallback. Dynamically load `AgentCoreStage3D` with `ssr: false`; render Canvas
with alpha, fixed camera, local lights, demand loop, and capped DPR. Set
`stageReady` only from `AgentCoreRig3D` after GLB validation, material binding,
camera pose, lights, and first render. On error or context loss, make fallback
visible before clearing readiness.

- [ ] **Step 6: Implement rig loading and semantic validation**

Load the local GLB with `useGLTF`, index nodes/bones by name, compare every
required name from the contract, apply the authored rest pose, and throw a
recoverable error if validation fails. Do not create robot mesh primitives.

- [ ] **Step 7: Verify GREEN and lifecycle safety**

```bash
cd web && pnpm run test:agent-core
cd web && pnpm exec tsc --noEmit
git diff --check
```

Expected: tests and TypeScript pass; fallback remains the visible pre-ready path.

- [ ] **Step 8: Commit**

```bash
git add web/src/components/landing/agent-core/AgentCoreStage3D.tsx \
  web/src/components/landing/agent-core/AgentCoreRig3D.tsx \
  web/src/components/landing/agent-core/agent-core-3d-bridge.ts \
  web/src/components/landing/agent-core/AgentCoreInstallSection.tsx \
  web/src/components/landing/agent-core/AgentCoreScene.tsx \
  web/src/components/landing/agent-core/agent-core.module.css \
  web/scripts/agent-core-section.test.mjs web/package.json web/pnpm-lock.yaml
git commit -m "feat(web): add guarded agent core 3d stage"
```

---

### Task 6: Drive true 3D gaze through the real head and neck bones

**Files:**
- Create: `web/src/components/landing/agent-core/useAgentCoreGaze3D.ts`
- Modify: `web/src/components/landing/agent-core/AgentCoreRig3D.tsx`
- Modify: `web/src/components/landing/agent-core/AgentCoreInstallSection.tsx`
- Modify: `web/scripts/agent-core-3d-gaze.test.mjs`
- Modify: `web/scripts/agent-core-motion.test.mjs`

**Interfaces:**
- Consumes: `AgentCore3DBridge`, section bounds, `neck_lower`, `neck_upper`, `head`, and pure gaze functions.
- Produces: section pointer listeners, narrative gaze arbitration, damped bone quaternions, and bounded demand invalidation.

- [ ] **Step 1: Add failing runtime ownership contracts**

Assert that pointer input is attached to the full section, updates only bridge
values, suspends during installation, resumes at 0.6 amplitude when connected,
removes listeners on cleanup, and never sets per-frame React state.

```js
assert.match(gazeHook, /section\.addEventListener\("pointermove"/);
assert.match(gazeHook, /phase === "connected" \? 0\.6 : 1/);
assert.match(gazeHook, /gazeMode !== "user"/);
assert.match(gazeHook, /section\.removeEventListener\("pointermove"/);
assert.doesNotMatch(gazeHook, /setState|setRotation|requestAnimationFrame/);
```

- [ ] **Step 2: Run focused tests and verify RED**

```bash
cd web && node --import tsx --test \
  scripts/agent-core-3d-gaze.test.mjs scripts/agent-core-motion.test.mjs
```

Expected: runtime ownership assertions fail because the hook is absent.

- [ ] **Step 3: Implement DOM-side gaze ownership**

Cache section bounds, normalize fine-pointer events, write pointer values into
the bridge, and call bridge invalidation. Pointer leave sets `active=false`.
Narrative modes `core`, `socket`, and `neutral` ignore raw pointer updates.
IntersectionObserver disables updates outside the viewport.

- [ ] **Step 4: Implement bone-space damping**

In the R3F frame loop:

1. choose user/core/socket/neutral world target;
2. compute clamped total yaw/pitch with pure helpers;
3. split 30 percent to neck and 70 percent to head;
4. construct target quaternions in each bone's rest-parent space;
5. damp toward targets on the shortest path;
6. invalidate again only while angular error exceeds the convergence epsilon.

Keep the robot root and torso transform unchanged. Apply at most `±3°` roll
from authored easing, never direct pointer X.

- [ ] **Step 5: Verify GREEN**

```bash
cd web && pnpm run test:agent-core
cd web && pnpm exec tsc --noEmit
```

Expected: pure and runtime contracts pass; no legacy `±9°/±5°` primary path remains once 3D is ready.

- [ ] **Step 6: Commit**

```bash
git add web/src/components/landing/agent-core/useAgentCoreGaze3D.ts \
  web/src/components/landing/agent-core/AgentCoreRig3D.tsx \
  web/src/components/landing/agent-core/AgentCoreInstallSection.tsx \
  web/scripts/agent-core-3d-gaze.test.mjs web/scripts/agent-core-motion.test.mjs
git commit -m "feat(web): add true 3d agent gaze"
```

---

### Task 7: Animate arm IK, Core ownership, and DOM capability activation

**Files:**
- Create: `web/src/components/landing/agent-core/useAgentCoreInstall3D.ts`
- Modify: `web/src/components/landing/agent-core/AgentCoreRig3D.tsx`
- Modify: `web/src/components/landing/agent-core/AnyCapCoreControl.tsx`
- Modify: `web/src/components/landing/agent-core/AgentCoreInstallSection.tsx`
- Modify: `web/src/components/landing/agent-core/useAgentCoreTimeline.ts`
- Modify: `web/scripts/agent-core-3d-install.test.mjs`
- Modify: `web/scripts/agent-core-motion.test.mjs`

**Interfaces:**
- Consumes: state reducer, model bones/anchors, bridge, native trigger, capability stats, and activation canvas.
- Produces: one 2.6–3.0 second GSAP timeline, IK target updates, exact Core reparenting, telemetry completion, return pose, and cleanup.

- [ ] **Step 1: Replace legacy motion contracts with autonomous-install RED tests**

Require labels and ownership calls:

```js
for (const label of [
  "targeting", "reaching", "grasping", "carrying", "docking",
  "activating", "capabilities", "returning", "hold"
]) assert.ok(source.includes(`addLabel("${label}"`), label);

assert.match(source, /attachCoreToGrip/);
assert.match(source, /attachCoreToSocket/);
assert.match(source, /CCDIKSolver/);
assert.doesNotMatch(source, /\.to\(\s*core,[\s\S]*target\.x/);
assert.doesNotMatch(coreControl, /onPointerMove|setPointerCapture/);
```

Retain click, tap, Enter, Space, reduced-motion, source-backed telemetry, live
announcement, one-shot gating, and cleanup assertions.

- [ ] **Step 2: Run focused tests and verify RED**

```bash
cd web && node --import tsx --test \
  scripts/agent-core-3d-install.test.mjs scripts/agent-core-motion.test.mjs
```

Expected: FAIL against the legacy Core self-flight and drag implementation.

- [ ] **Step 3: Implement the IK controller**

Bind `CCDIKSolver` to the arm SkinnedMesh and the ordered links
`hand_R → forearm_R → upper_arm_R → clavicle_R`, with authored min/max joint
limits. Drive `ik_target_R` along the contract waypoints. Update the solver only
during reaching, grasping, carrying, docking, and returning.

Record rest quaternions before the timeline starts and restore them through the
return waypoint rather than snapping after completion.

- [ ] **Step 4: Implement exact Core parenting**

Use Three.js `Object3D.attach` so world transforms are preserved:

```ts
function attachCoreToGrip(core: Object3D, grip: Object3D) {
  grip.attach(core);
  core.position.set(0, 0, 0);
  core.quaternion.identity();
}

function attachCoreToSocket(core: Object3D, socket: Object3D) {
  socket.attach(core);
  core.position.set(0, 0, 0);
  core.quaternion.identity();
}
```

Before grasping, Core remains under dock ownership. Transfer to hand exactly at
`grasping`, then to socket exactly at `docking`; never expose a free-flight owner.

- [ ] **Step 5: Implement the named GSAP narrative**

The native button activates once. GSAP advances bridge progress and waypoint
targets across exact labels and phase boundaries. Narrative gaze follows Core,
hand, socket, and user. At activating, run the existing bounded olive burst and
begin the source-backed DOM count/fill. At returning, restore the arm; at hold,
set connected and resume user gaze at 0.6 amplitude.

- [ ] **Step 6: Simplify the primary control**

Keep `AnyCapCoreControl` as a native button with click/tap and Enter/Space.
Remove primary drag/pointer-capture props and make its visible image conditional:
visible for fallback, transparent but focusable/aligned when the 3D Core is ready.
The focus outline must remain visible around the projected dock Core.

- [ ] **Step 7: Verify reduced motion and cleanup**

Reduced motion must skip gaze, IK, ScrollTrigger, and articulated travel, render
connected ownership at the socket, and show final telemetry. Cleanup must kill
timelines, remove listeners/observers, stop demand invalidation, dispose IK
helpers, and leave no captured pointer.

- [ ] **Step 8: Verify GREEN**

```bash
cd web && pnpm run test:agent-core
cd web && pnpm exec tsc --noEmit
git diff --check
```

Expected: all Agent Core tests pass, TypeScript exits zero, and no legacy primary Core self-flight remains.

- [ ] **Step 9: Commit**

```bash
git add web/src/components/landing/agent-core/useAgentCoreInstall3D.ts \
  web/src/components/landing/agent-core/AgentCoreRig3D.tsx \
  web/src/components/landing/agent-core/AnyCapCoreControl.tsx \
  web/src/components/landing/agent-core/AgentCoreInstallSection.tsx \
  web/src/components/landing/agent-core/useAgentCoreTimeline.ts \
  web/scripts/agent-core-3d-install.test.mjs web/scripts/agent-core-motion.test.mjs
git commit -m "feat(web): animate autonomous core installation"
```

---

### Task 8: Complete responsive, performance, visual, and production acceptance

**Files:**
- Modify: `web/src/components/landing/agent-core/agent-core.module.css`
- Modify: `web/scripts/agent-core-section.test.mjs`
- Modify: `docs/anycap-current-status.md`
- Modify: `design-qa.md`
- Local only: `.superpowers/design-qa/agent-core-3d/*`

**Interfaces:**
- Consumes: completed runtime, approved GLB, master image, in-app browser, and all focused tests.
- Produces: verified production section, fresh multi-state evidence, updated current-status snapshot, and final independent approval.

- [ ] **Step 1: Add responsive and performance regression contracts**

Assert exact desktop/tablet/mobile stage areas, transparent canvas/fallback
stacking, mobile coarse-pointer behavior, no overflow tokens, demand loop, DPR
caps, context-loss handling, and cleanup. Run the new assertions first and
record RED for any uncovered contract before changing CSS/runtime.

- [ ] **Step 2: Finish responsive stage calibration**

Calibrate fixed camera/scale presets for desktop, tablet, and mobile against
the approved anchors. Preserve the existing DOM grid. Ensure the full head,
socket, active right arm, dock, and Core remain visible; increase mobile scene
height instead of cropping required objects.

- [ ] **Step 3: Run the complete automated gate**

```bash
cd web && pnpm run test:agent-core
cd web && pnpm exec tsc --noEmit
cd web && pnpm run build
git diff --check
```

Expected: all Agent Core tests, TypeScript, production build, and diff check pass.
Restore generated sitemap timestamps if the build changes them without content
changes; do not stage unrelated generated or SEO files.

- [ ] **Step 4: Verify localhost and browser console**

Run the existing dev server on port 3010 or start it with:

```bash
cd web && pnpm dev -- --port 3010
curl -sS -o /dev/null -w '%{http_code}\n' http://localhost:3010/
```

Expected: `200`. Use only the user's Codex in-app browser. Confirm no JavaScript
errors, hydration warnings, WebGL errors, model 404s, or detached GSAP targets.

- [ ] **Step 5: Verify the required interaction states**

Capture and inspect awaiting, left/right/up/down gaze, reach, grasp, carry,
dock, connected, reduced-motion, model-failure fallback, and context recovery.
Measure bone/world state where visual proof alone is weak:

- edge gaze reaches natural limits without exceeding `±70°/±25°/±3°`;
- torso/root transforms remain unchanged;
- hand grip reaches Core before ownership transfer;
- Core stays hand-owned through carrying and socket-owned after docking;
- arm returns to rest; telemetry ends once at `04/03/03/01/01`.

- [ ] **Step 6: Verify responsive widths**

At 390, 768, 1280, and 1672 CSS pixels, inspect fresh screenshots and DOM
measurements. Require no horizontal overflow, no copy/telemetry overlap, no
required-object crop, visible native focus, and correct touch/coarse-pointer behavior.

- [ ] **Step 7: Run the final visual comparison gate**

At exactly 1672 by 941 CSS pixels, capture the awaiting state and create one
side-by-side image with the approved master plus focused robot/Core crops. Open
at original detail. Also open turntable and installation-keyframe sheets.
Iterate until no P0/P1/P2 finding remains in camera, silhouette, crop, material,
lighting, visor, neck, socket, Core, dock, table, background, type, or spacing.

- [ ] **Step 8: Update status and QA evidence**

Update `docs/anycap-current-status.md` to describe the shipped rigged upper-body
agent, true 3D gaze, and autonomous Core installation. Update `design-qa.md`
with fresh current-runtime artifacts, exact viewport, interaction evidence,
responsive evidence, console state, and `final result: passed` only after every
gate above passes.

- [ ] **Step 9: Request independent final review**

Review the complete implementation range against the approved specification.
Fix every Critical, Important, P0, P1, and P2 finding; rerun the affected
automated and browser gates after each correction.

- [ ] **Step 10: Commit the verified acceptance update**

```bash
git add web/src/components/landing/agent-core/agent-core.module.css \
  web/scripts/agent-core-section.test.mjs docs/anycap-current-status.md design-qa.md
git commit -m "docs(web): verify true 3d agent core experience"
```

Do not stage local QA images or unrelated dirty files.
