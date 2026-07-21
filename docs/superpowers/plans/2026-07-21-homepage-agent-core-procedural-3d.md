# Homepage Agent Core Procedural 3D Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the existing layered robot in the Agent Core homepage section with a true procedural R3F upper-body robot and 3D Core installation, without Tripo or a GLB asset.

**Architecture:** A dynamically loaded transparent R3F client leaf renders the robot from semantic geometry components. A mutable bridge carries pointer and GSAP installation progress into `useFrame`, so the scene animates without per-frame React state. The current DOM button, telemetry, fallback images, state reducer, and single GSAP narrative remain the accessible product shell.

**Tech Stack:** Next.js 15, React 19, TypeScript, CSS Modules, Three.js 0.185.1, React Three Fiber 9.6.1, Drei 10.7.7, GSAP 3.15.0.

## Global Constraints

- Work only on `codex/doubao-audio-positioning`; do not create a branch or worktree.
- Preserve all unrelated Go changes and do not stage or edit them.
- Do not change the homepage hero, navigation, section order, approved copy, fonts, background, or grain.
- Do not use Tripo, Meshy, Spline, GLB, remote model generation, a physics engine, postprocessing, or external HDR assets.
- The R3F canvas is transparent, dynamically client-loaded with `ssr: false`, and has a WebP fallback.
- Continuous pointer and animation values must not update React state per frame.
- The native Core button remains the keyboard, touch, and screen-reader control.
- Reduced motion renders the connected state immediately and disables head tracking.
- Run every behavior change through RED, GREEN, and refactor before committing.

---

### Task 1: Procedural 3D Runtime And Robot

**Files:**
- Modify: `web/package.json`
- Modify: `web/pnpm-lock.yaml`
- Create: `web/src/components/landing/agent-core/agent-core-3d-state.ts`
- Create: `web/src/components/landing/agent-core/AgentCoreRobot3D.tsx`
- Create: `web/src/components/landing/agent-core/AgentCoreCanvas.tsx`
- Create: `web/scripts/agent-core-3d.test.mjs`

**Interfaces:**
- Produces `createAgentCore3DBridge()`, `mapCoreInstallPose(progress)`, and `mapHeadTarget(pointer)`.
- Produces `AgentCoreCanvas` accepting the bridge and a fallback React node.

- [ ] **Step 1: Install exact runtime versions**

Run:

```bash
cd web && pnpm add --save-exact three@0.185.1 @react-three/fiber@9.6.1 @react-three/drei@10.7.7 && pnpm add -D --save-exact @types/three@0.185.1
```

- [ ] **Step 2: Write the failing 3D contract**

Create a Node test that imports the pure 3D state helpers and asserts: pointer
targets clamp to the approved yaw/pitch bounds, install progress clamps to
`0..1`, the table pose is returned at zero, the socket pose at one, and every
bridge begins with awaiting values. The same test reads the scene sources and
asserts the named semantic groups, transparent canvas, DPR caps, demand
frameloop, dynamic `ssr: false`, and absence of `useGLTF`, `.glb`, or `tripo`.

- [ ] **Step 3: Verify RED**

Run `cd web && node --import tsx --test scripts/agent-core-3d.test.mjs` and
confirm failure because the helpers and components do not exist.

- [ ] **Step 4: Implement pure bridge and pose helpers**

Use a mutable object with pointer target/current values, `installProgress`,
`connected`, `dragOffset`, `sceneActive`, and `invalidate`. Implement pure
clamping and eased interpolation helpers without importing React or Three.

- [ ] **Step 5: Implement the semantic procedural robot**

Build `RobotRoot`, `Torso`, `NeckPivot`, `Head`, `Visor`, `ChestSocket`, and
`AnyCapCore` groups from R3F primitives and Drei rounded boxes. Use ivory rough
PBR shell materials, charcoal joint material, and olive emissive accents. The
head pivot alone follows the bridge. The Core follows the table-to-socket pose.

- [ ] **Step 6: Implement the transparent lazy Canvas**

Use a client-only dynamically imported canvas leaf, alpha renderer, restrained
studio lights, orthographic camera, `frameloop="demand"`, capped DPR, resize
support, suspense fallback, and WebGL error fallback.

- [ ] **Step 7: Run GREEN and commit**

Run the focused test and `pnpm exec tsc --noEmit`. Commit only Task 1 files as
`feat(web): add procedural agent core 3d scene`.

---

### Task 2: Accessible GSAP And R3F Interaction Bridge

**Files:**
- Modify: `web/src/components/landing/agent-core/AgentCoreInstallSection.tsx`
- Modify: `web/src/components/landing/agent-core/AgentCoreScene.tsx`
- Modify: `web/src/components/landing/agent-core/AnyCapCoreControl.tsx`
- Modify: `web/src/components/landing/agent-core/useAgentCoreTimeline.ts`
- Modify: `web/src/components/landing/agent-core/agent-core.module.css`
- Modify: `web/scripts/agent-core-motion.test.mjs`
- Modify: `web/scripts/agent-core-section.test.mjs`

**Interfaces:**
- Consumes the Task 1 mutable bridge.
- Keeps the existing native button event interface and telemetry refs.

- [ ] **Step 1: Add failing integration assertions**

Assert that the section creates one bridge, passes it to the 3D scene and GSAP
hook, keeps the button and live region, updates bridge pointer values from the
section pointer listener, tweens bridge installation progress inside the six
existing labels, and sets final connected values for reduced motion.

- [ ] **Step 2: Verify RED**

Run the two focused motion/section tests and confirm the bridge assertions fail.

- [ ] **Step 3: Replace the visible 2.5D robot with the 3D canvas**

Keep the existing image layers as the lazy/WebGL fallback. Make the current
Core button visually transparent while retaining its measured table hit area,
focus ring, pointer capture, and accessible name. Keep transparent socket and
dock measurement targets aligned to the 3D composition.

- [ ] **Step 4: Drive R3F from the existing GSAP narrative**

Update the scoped hook so pointer tracking writes normalized targets to the
bridge, drag writes normalized Core offsets, rejected drops restore the table
pose, and the install timeline tweens `bridge.installProgress` from zero to one.
Every write invalidates the demand canvas. Cleanup resets the bridge and removes
all listeners/tweens through the existing `useGSAP` context.

- [ ] **Step 5: Preserve responsive and accessible behavior**

Keep the established desktop/tablet/mobile grid, no-JS telemetry, click/touch/
keyboard convergence, focus outline, aria-live completion, and reduced-motion
instant connected state.

- [ ] **Step 6: Run GREEN and commit**

Run `pnpm run test:agent-core` and `pnpm exec tsc --noEmit`. Commit only Task 2
files as `feat(web): connect agent core 3d installation`.

---

### Task 3: Performance, Visual QA, And Whole-Range Review

**Files:**
- Modify only if QA finds a defect: `web/src/components/landing/agent-core/**`
- Modify: `design-qa.md`
- Modify: `docs/anycap-current-status.md`

**Interfaces:**
- Consumes the complete procedural 3D section.
- Produces verified localhost evidence and final branch review.

- [ ] **Step 1: Run automated verification**

Run `pnpm run test:agent-core`, `pnpm exec tsc --noEmit`, `pnpm run build`, and
`git diff --check`. Do not start visual QA until every command exits zero.

- [ ] **Step 2: Start or reuse the real app on port 3010**

Keep the localhost server live and use only the user's Codex in-app browser.

- [ ] **Step 3: Verify interaction states**

At desktop, confirm the hero is unchanged, canvas has no seam, real head volume
tracks all four pointer corners, torso does not drift, rejected drag returns,
accepted drag installs once, values end at `04/03/03/01/01`, and console is
clean. At mobile, verify tap install and no horizontal overflow. Verify keyboard
Enter and reduced-motion connected state.

- [ ] **Step 4: Compare the same state at the same viewport**

Capture the 1672 by 941 awaiting state. Place it beside
`docs/superpowers/design-masters/homepage-agent-core/approved-master.png` in one
comparison image. Fix every P0, P1, and P2 composition issue and repeat until
only P3 polish notes remain.

- [ ] **Step 5: Verify performance constraints**

Confirm dynamic loading, transparent alpha, demand frameloop, desktop DPR no
greater than 1.5, mobile DPR no greater than 1.25, and no Tripo/GLB/runtime model
network request. Confirm the section pauses when off-screen.

- [ ] **Step 6: Update product status and commit**

Update the current-state web sentence to describe the procedural 3D Core
installation. Commit scoped QA/status fixes as `docs(web): verify procedural agent core 3d`.

- [ ] **Step 7: Independent final review and fresh verification**

Review the full range from the plan commit for spec compliance, visual fidelity,
React/GSAP/R3F cleanup, accessibility, and performance. Fix Critical and
Important findings in one bounded wave, then rerun focused tests, TypeScript,
production build, `git diff --check`, and final browser interaction.
