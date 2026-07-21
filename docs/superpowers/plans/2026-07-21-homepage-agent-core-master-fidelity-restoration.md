# Homepage Agent Core Master-Fidelity Restoration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the production Agent Core homepage section render the approved 2229-by-1255 design master as its primary visual composition instead of replacing it with the lower-fidelity procedural robot.

**Architecture:** Restore the approved four-layer 2.5D composition (`robot-body.webp`, `robot-head.webp`, `anycap-core.webp`, and `core-dock.webp`) as the only visible robot surface. Keep the existing DOM copy, source-backed telemetry, GSAP installation choreography, pointer/head tracking, keyboard/touch paths, reduced-motion state, and bounded activation canvas. Remove the full-robot R3F runtime and its dependencies because the approved raster layers already contain the exact shell geometry, camera, materials, lighting, and proportions required by the master.

**Tech Stack:** Next.js 15, React 19, TypeScript, `next/image`, CSS Modules, GSAP 3.15, `@gsap/react` 2.1, dependency-free Node contract tests.

## Global Constraints

- The selected design target is `/Users/tyluo/.codex/attachments/ed59bf85-9416-4ba6-bb01-754206c753e5/image-1.png` at 2229 by 1255 pixels.
- The canonical section artboard and anchors remain `web/public/visuals/agent-core/asset-manifest.json` at 1672 by 941 pixels.
- The visible robot must use the approved `robot-body.webp` and `robot-head.webp` assets; primitive Three.js geometry must not cover them.
- The Core must use `anycap-core.webp` and begin in `core-dock.webp` on the table before installation.
- Preserve the exact copy, telemetry labels, values `04`, `03`, `03`, `01`, `01`, main-site background, grain, and font variables from the approved install-motion specification.
- Preserve pointer head tracking, drag/drop, touch tap, Enter/Space activation, rejected-drop return, reduced-motion connected state, and one-shot GSAP sequencing.
- Preserve the homepage hero and surrounding sections.
- Do not add Tripo, Meshy, Spline, GLB assets, remote model services, a second background, gradients, glass cards, or perpetual animation.
- Keep all work on `codex/doubao-audio-positioning`; create no branch or worktree.
- Do not touch unrelated Go provider changes or unrelated SEO audit files in the dirty worktree.

---

### Task 1: Restore the master-first visual runtime

**Files:**
- Modify: `web/scripts/agent-core-section.test.mjs`
- Modify: `web/scripts/agent-core-motion.test.mjs`
- Delete: `web/scripts/agent-core-3d.test.mjs`
- Modify: `web/src/components/landing/agent-core/AgentCoreInstallSection.tsx`
- Modify: `web/src/components/landing/agent-core/AgentCoreScene.tsx`
- Modify: `web/src/components/landing/agent-core/AnyCapCoreControl.tsx`
- Modify: `web/src/components/landing/agent-core/useAgentCoreTimeline.ts`
- Modify: `web/src/components/landing/agent-core/agent-core.module.css`
- Delete: `web/src/components/landing/agent-core/AgentCoreCanvas.tsx`
- Delete: `web/src/components/landing/agent-core/AgentCoreRobot3D.tsx`
- Delete: `web/src/components/landing/agent-core/agent-core-3d-state.ts`
- Modify: `web/package.json`
- Modify: `web/pnpm-lock.yaml`

**Interfaces:**
- Consumes: `asset-manifest.json`, `AgentHeadTracker`, `AnyCapCoreControl`, `CapabilityTelemetry`, and the existing `useAgentCoreTimeline` pointer/keyboard handlers.
- Produces: `AgentCoreScene` with direct approved image layers and no R3F bridge or fallback visibility state.

- [ ] **Step 1: Write the failing master-first source contracts**

Add focused assertions equivalent to:

```js
test("renders the approved master layers as the primary robot surface", () => {
  assert.match(scene, /robot-body\.webp/);
  assert.match(scene, /<AgentHeadTracker\s+headRef=\{headRef\}/);
  assert.match(scene, /core-dock\.webp/);
  assert.match(coreControl, /anycap-core\.webp/);
  assert.doesNotMatch(scene, /AgentCoreCanvas|fallbackHidden|canvasReady/);
  assert.doesNotMatch(section, /createAgentCore3DBridge|bridge=/);
});

test("does not ship a lower-fidelity full-robot WebGL replacement", () => {
  assert.equal(existsSync(agentCoreCanvasPath), false);
  assert.equal(existsSync(agentCoreRobot3DPath), false);
  assert.equal(existsSync(agentCore3DStatePath), false);
  assert.doesNotMatch(packageJson, /@react-three|\"three\"|@types\/three/);
});
```

- [ ] **Step 2: Run the focused tests and verify RED**

Run:

```bash
cd web && pnpm exec node --import tsx --test --test-reporter=spec \
  scripts/agent-core-section.test.mjs scripts/agent-core-motion.test.mjs
```

Expected: the new primary-layer and no-full-robot-WebGL assertions fail against the current procedural runtime; existing interaction assertions continue to execute.

- [ ] **Step 3: Restore direct layer composition**

Implement `AgentCoreScene` with this visible ordering:

```tsx
<div className={styles.table} aria-hidden="true" />
<div className={styles.body} aria-hidden="true">
  <Image src="/visuals/agent-core/robot-body.webp" alt="" width={1024} height={1024} />
</div>
<AgentHeadTracker headRef={headRef} />
<div ref={socketRef} className={styles.socket} aria-hidden="true" />
<canvas ref={activationCanvasRef} className={styles.activationCanvas} width={160} height={160} aria-hidden="true" />
<div ref={dockRef} className={styles.dock} aria-hidden="true">
  <Image src="/visuals/agent-core/core-dock.webp" alt="" width={640} height={320} />
</div>
<AnyCapCoreControl {...interactionProps} />
```

Use the manifest placements directly:

```ts
const corePlacement = getPlacement(assets.core);
const socketCenterX = ((anchors.socketCenter.x * artboard.width - sceneLeft) / sceneWidth) * 100;
const socketCenterY = anchors.socketCenter.y * 100;
```

Expose `--agent-core-left`, `--agent-core-top`, `--agent-core-width`, and the existing body/head/dock/socket variables. Remove `canvasLayer`, `fallbackVisual`, `fallbackRobot`, `fallbackDock`, `fallbackCore`, and all fallback shifts.

- [ ] **Step 4: Remove the full-robot R3F bridge without changing interaction semantics**

Remove the bridge from `AgentCoreInstallSection` and `useAgentCoreTimeline`. Keep DOM Core motion based on the measured `coreRef`, `dockRef`, and `socketRef`; retain the six labels `scene-in`, `pickup`, `dock`, `activate`, `capabilities`, and `hold`; retain all cleanup and reduced-motion behavior.

Delete the three procedural runtime files and their dedicated test. Remove `three`, `@types/three`, `@react-three/fiber`, and `@react-three/drei` only after confirming no other `web/` source imports them. Regenerate the lockfile with:

```bash
cd web && pnpm install --lockfile-only
```

- [ ] **Step 5: Verify GREEN and commit**

Run:

```bash
cd web && pnpm run test:agent-core
cd web && pnpm exec tsc --noEmit
git diff --check
```

Expected: all retained Agent Core tests pass, TypeScript exits zero, and the diff check is clean.

Commit only the scoped web source, tests, package manifest, and lockfile:

```bash
git commit -m "fix(web): restore agent core design master"
```

---

### Task 2: Lock the master geometry and complete visual QA

**Files:**
- Modify: `web/scripts/agent-core-section.test.mjs`
- Modify: `docs/anycap-current-status.md`
- Create or modify: `design-qa.md`
- Create: `.superpowers/design-qa/agent-core-master-restored-2229.png` (ignored QA artifact)
- Create: `.superpowers/design-qa/agent-core-master-restored-comparison.png` (ignored QA artifact)

**Interfaces:**
- Consumes: the direct-layer scene from Task 1 and `asset-manifest.json` canonical placements.
- Produces: a same-viewport master comparison and a passing or explicitly blocked `design-qa.md`.

- [ ] **Step 1: Lock and verify the canonical geometry contract**

Add assertions that read the manifest and lock:

```js
assert.deepEqual(manifest.artboard, { width: 1672, height: 941 });
assert.deepEqual(manifest.anchors.socketCenter, { x: 0.697, y: 0.625 });
assert.deepEqual(manifest.anchors.dockCenter, { x: 0.637, y: 0.898 });
assert.match(css, /grid-template-areas:\s*"copy telemetry scene"/);
assert.match(css, /grid-template-columns:\s*minmax\(290px, 0\.78fr\)\s+minmax\(260px, 0\.58fr\)\s+minmax\(520px, 1\.28fr\)/);
assert.match(css, /font-family:\s*var\(--font-geist-pixel-square\), monospace/);
```

Also assert that no `.canvasLayer`, `.fallbackVisual`, or `.fallbackHidden` selector remains. These are regression locks over Task 1 and are expected to pass immediately because their RED/GREEN cycle was recorded there.

- [ ] **Step 2: Run the geometry regression test**

Run:

```bash
cd web && pnpm exec node --import tsx --test --test-reporter=spec scripts/agent-core-section.test.mjs
```

Expected: PASS. If a later screenshot comparison reveals a measurable CSS defect, add one focused assertion for that exact invariant, run it to record RED, make the smallest CSS correction, and rerun to GREEN before capturing again.

- [ ] **Step 3: Capture the exact target state in the chosen in-app browser**

Run the existing app on port `3010`, open the homepage in the Codex in-app browser, and capture the awaiting state at exactly 2229 by 1255. The capture must show the same header state and scroll position as the selected target. Do not use HTTP health or an old screenshot as visual proof.

- [ ] **Step 4: Compare target and implementation**

Open both the selected target and fresh capture. Create one side-by-side comparison. Fix P0/P1/P2 differences in:

- section vertical position below navigation;
- left copy baseline and line breaks;
- telemetry X/Y placement, width, row gaps, and cell sizes;
- robot head/body scale, crop, and stable neck pivot;
- chest socket, table line, Core, and dock positions;
- background color, grain continuity, font family, weight, and color.

Repeat capture and comparison until `design-qa.md` says `final result: passed`. If the chosen browser cannot capture localhost, record `final result: blocked` and do not claim visual completion.

- [ ] **Step 5: Verify production and update status**

Update the homepage sentence in `docs/anycap-current-status.md` to describe the approved layered upper-body Agent and Core installation, without calling it a procedural 3D robot.

Run:

```bash
cd web && pnpm run test:agent-core
cd web && pnpm exec tsc --noEmit
cd web && pnpm run build
git diff --check
curl -sS -o /dev/null -w '%{http_code}\n' http://localhost:3010/
```

Expected: Agent Core tests pass, TypeScript and build exit zero, diff check is clean, and localhost returns `200`.

- [ ] **Step 6: Commit the verified fidelity pass**

Commit only the geometry test, status document, and `design-qa.md`:

```bash
git commit -m "docs(web): verify agent core master fidelity"
```

The ignored screenshots stay local as QA evidence. Do not stage unrelated Go provider work, `.superpowers/`, or unrelated SEO audit files.
