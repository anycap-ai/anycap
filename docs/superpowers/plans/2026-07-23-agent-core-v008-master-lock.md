# Agent Core v008 Master Lock Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish and ship a master-locked full-3D Agent Core upper body whose tabletop hand installs the Core and whose rigged head follows the pointer.

**Architecture:** Correct the existing local v007 Blender/PBR pipeline into a v008 production candidate, gate it with four native-size renders and structural validation, then promote that one GLB into the existing guarded R3F runtime. Keep the current WebP composition as loading/error fallback and do not change the homepage layout or copy.

**Tech Stack:** Blender 5.2 LTS, Python authoring scripts, glTF/GLB, Next.js 15, React 19, Three.js, React Three Fiber, GSAP, TypeScript, Node test runner, Codex in-app browser.

## Global Constraints

- Work only on `codex/doubao-audio-positioning`; create no branch or worktree.
- The selected 2229-by-1255 reference is the sole visual target.
- Preserve the homepage hero, layout, copy, telemetry, paper surface, grain, fonts, and source-backed values.
- One arm rests on the tabletop in awaiting and that same hand performs the Core installation.
- Use real head/neck and right-arm bones; do not use flat-card head rotation, DOM Core flight, debug geometry, or runtime primitive robot construction.
- Keep the WebP fallback primary until v008 passes visual and structural gates.
- Do not stage unrelated dirty Go, SEO, header, or audit changes.

---

### Task 1: Build and visually approve the v008 Blender asset

**Files:**
- Create: `.superpowers/design-qa/agent-core-3d/production-v008/build-production-v008.py`
- Create: `.superpowers/design-qa/agent-core-3d/production-v008/agent-core-production-candidate-v008.blend`
- Create: `.superpowers/design-qa/agent-core-3d/production-v008/agent-core-upper-body-candidate-v008.glb`
- Create: `.superpowers/design-qa/agent-core-3d/production-v008/runtime-like-{awaiting,reach,grasp,install}.png`
- Create: `.superpowers/design-qa/agent-core-3d/production-v008/{build-audit,glb-structural-audit,fresh-reopen-verification}.json`
- Reuse: `.superpowers/design-qa/agent-core-3d/production-v007/`

**Interfaces:**
- Consumes: approved master, v007 Blender/PBR source, component-ID audit, existing model contract.
- Produces: one visually approved v008 GLB with the existing semantic node/bone contract.

- [ ] Copy the reproducible v007 scripts into a new v008 directory and correct the component traversal/normalization defects documented by the source-rig audit.
- [ ] Remove the neck tear, temporary collar/debug frames, gray world/floor band, and all render helpers from exported collections.
- [ ] Author the right-arm awaiting pose with forearm and palm resting naturally on the tabletop beside the Core; preserve the opposite relaxed arm.
- [ ] Author reach, grasp, carry, dock, and return poses with rigid semantic ownership and unmistakable palm support in grasp.
- [ ] Render awaiting, reach, grasp, and install at exactly 1672-by-941 with one fixed camera and warm-paper presentation.
- [ ] Run `validate-glb-v007.py`-equivalent structural checks and a fresh Blender reopen verification against the v008 outputs.
- [ ] Compare the four frames at original detail against the approved master and fix every P0/P1 issue before reporting DONE.

Expected gate: no neck tear, no debug block/frame, no floating Core, clean tabletop contact, correct silhouette/material/camera, structural audits pass.

---

### Task 2: Promote v008 and enable the guarded R3F runtime

**Files:**
- Replace: `web/public/visuals/agent-core-3d/agent-core-upper-body.glb`
- Modify: `web/src/components/landing/agent-core/AgentCoreInstallSection.tsx`
- Modify only if required by verified model contract: `web/src/components/landing/agent-core/AgentCoreRig3D.tsx`
- Test: `web/scripts/agent-core-*.test.mjs`
- Create local QA: `.superpowers/design-qa/agent-core-live-v008/`

**Interfaces:**
- Consumes: Task 1 visually approved GLB and existing bridge/gaze/install runtime.
- Produces: default full-3D stage with fallback recovery and verified pointer/install behavior.

- [ ] Record the existing opt-in/fallback behavior, then copy only the approved v008 GLB to the public contract path.
- [ ] Make the guarded 3D stage the default while retaining explicit fallback on load, validation, WebGL, and context failure.
- [ ] Verify real pointer gaze across center, corners, and horizontal extremes; verify no full spin and no torso drift.
- [ ] Verify one-shot click, keyboard activation, dock-to-hand-to-socket ownership, telemetry completion, and return to tabletop pose.
- [ ] Run `pnpm --dir web test:agent-core`, `pnpm --dir web exec tsc --noEmit`, and `git diff --check`.
- [ ] Capture awaiting and connected localhost frames at the same viewport as the approved reference, build a side-by-side comparison, and do not keep 3D primary if the visual gate fails.

Expected gate: focused tests and TypeScript pass, localhost uses v008, pointer gaze is visibly real, the hand installs the Core, and same-viewport visual review has no P0/P1 mismatch.
