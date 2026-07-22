import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { fileURLToPath } from "node:url";

const hookPath = fileURLToPath(new URL("../src/components/landing/agent-core/useAgentCoreTimeline.ts", import.meta.url));
const install3DPath = fileURLToPath(new URL("../src/components/landing/agent-core/useAgentCoreInstall3D.ts", import.meta.url));
const gazeHookPath = fileURLToPath(new URL("../src/components/landing/agent-core/useAgentCoreGaze3D.ts", import.meta.url));
const sectionPath = fileURLToPath(new URL("../src/components/landing/agent-core/AgentCoreInstallSection.tsx", import.meta.url));
const coreControlPath = fileURLToPath(new URL("../src/components/landing/agent-core/AnyCapCoreControl.tsx", import.meta.url));

test("uses one scoped GSAP lifecycle and one unpinned entrance trigger", () => {
  const source = readFileSync(hookPath, "utf8");
  assert.match(source, /useGSAP/);
  assert.match(source, /scope: sectionRef/);
  assert.match(source, /gsap\.registerPlugin\(useGSAP, ScrollTrigger\)/);
  assert.match(source, /once: true/);
  assert.match(source, /start: "top 72%"/);
  assert.doesNotMatch(source, /pin:\s*true|window\.addEventListener\(["']scroll/);
});

test("names the complete autonomous installation narrative without DOM Core flight", () => {
  const source = readFileSync(hookPath, "utf8");
  for (const label of [
    "targeting",
    "reaching",
    "grasping",
    "carrying",
    "docking",
    "activating",
    "capabilities",
    "returning",
    "hold",
  ]) {
    assert.ok(source.includes(`addLabel("${label}"`), label);
  }
  assert.match(source, /INSTALL_DURATION_SECONDS\s*=\s*3/);
  for (const [label, time] of [
    ["targeting", "0"],
    ["reaching", "0\\.18"],
    ["grasping", "0\\.78"],
    ["carrying", "1"],
    ["docking", "1\\.68"],
    ["activating", "2"],
    ["capabilities", "2\\.15"],
    ["returning", "2\\.35"],
  ]) assert.match(source, new RegExp(`addLabel\\("${label}", ${time}\\)`));
  assert.match(source, /addLabel\("hold", INSTALL_DURATION_SECONDS\)/);
  assert.match(source, /\.to\(\s*bridge,/);
  assert.match(source, /getAgentCoreStats/);
  assert.doesNotMatch(source, /\.to\(\s*core,[\s\S]*target\.x/);
  assert.doesNotMatch(source, /isCoreDropAccepted|beginAgentCorePointerSession|setPointerCapture/);
});

test("provides native click, tap, Enter, Space, and reduced-motion paths", () => {
  const hook = readFileSync(hookPath, "utf8");
  const section = readFileSync(sectionPath, "utf8");
  const coreControl = readFileSync(coreControlPath, "utf8");

  assert.match(coreControl, /<button/);
  assert.match(coreControl, /onClick=\{onClick\}/);
  assert.match(coreControl, /onKeyDown=\{onKeyDown\}/);
  assert.doesNotMatch(coreControl, /onPointerMove|setPointerCapture|onLostPointerCapture/);
  assert.match(section, /onClick/);
  assert.match(section, /onKeyDown/);
  assert.match(hook, /event\.key !== "Enter" && event\.key !== " "/);
  assert.match(hook, /prefers-reduced-motion: reduce/);
  assert.match(hook, /ScrollTrigger\.create/);
  assert.match(hook, /cancelAnimationFrame/);
  assert.match(hook, /IntersectionObserver/);
});

test("gates one install and tears down every long-lived browser resource", () => {
  const source = readFileSync(hookPath, "utf8");
  const install3D = readFileSync(install3DPath, "utf8");

  assert.match(source, /stateRef\.current\.started/);
  assert.match(source, /gsap\.timeline\(\{\s*paused:\s*true/);
  assert.match(source, /removeEventListener\("pointermove"/);
  assert.match(source, /observer\.disconnect\(\)/);
  assert.match(source, /entranceTrigger\.kill\(\)/);
  assert.match(source, /installationTimeline\?\.kill\(\)/);
  assert.doesNotMatch(source, /setPointerCapture|releasePointerCapture/);
  assert.match(install3D, /ikHelper\.dispose\(\)/);
});

test("uses only a bounded local square-particle confirmation", () => {
  const source = readFileSync(hookPath, "utf8");
  const particleCount = Number(source.match(/PARTICLE_COUNT\s*=\s*(\d+)/)?.[1]);
  assert.ok(particleCount > 0 && particleCount <= 64, "particle budget");
  assert.match(source, /BURST_DURATION_MS\s*=\s*900/);
  assert.match(source, /fillStyle\s*=\s*"#6b7d3a"/);
  assert.match(source, /fillRect\(/);
  assert.doesNotMatch(source, /\.arc\(|strokeRect\(/);
});

test("finalizes reduced motion before creating observers or ScrollTrigger", () => {
  const source = readFileSync(hookPath, "utf8");
  const reducedBranch = source.indexOf("if (reducedMotion.matches)");
  const reducedReturn = source.indexOf("return;", reducedBranch);
  assert.ok(reducedBranch >= 0 && reducedReturn > reducedBranch, "reduced-motion return");
  assert.ok(reducedReturn < source.indexOf("ScrollTrigger.create"), "no reduced trigger");
  assert.ok(reducedReturn < source.indexOf("new IntersectionObserver"), "no reduced observer");
  assert.match(source.slice(reducedBranch, reducedReturn), /coreOwner:\s*"socket"/);
  assert.match(source.slice(reducedBranch, reducedReturn), /setFinalTelemetry\(\)/);
});

test("scopes idle head tracking to the full section surface", () => {
  const source = readFileSync(hookPath, "utf8");
  assert.match(source, /section\.addEventListener\("pointermove",\s*onScenePointerMove\)/);
  assert.match(source, /section\.removeEventListener\("pointermove",\s*onScenePointerMove\)/);
});

test("hands full-section gaze to the 3D bridge only after stage readiness", () => {
  const gazeHook = readFileSync(gazeHookPath, "utf8");
  const timeline = readFileSync(hookPath, "utf8");
  const section = readFileSync(sectionPath, "utf8");
  assert.match(section, /useAgentCoreGaze3D\(sectionRef, bridge, stageReady\)/);
  assert.match(section, /legacyGazeOwnership\.setStageReady\(true\)/);
  assert.match(section, /legacyGazeOwnership\.setStageReady\(false\)/);
  assert.match(section, /legacyGazeOwnership,/);
  assert.match(timeline, /legacyGazeOwnership: AgentCoreLegacyGazeOwnership/);
  assert.match(timeline, /legacyGazeOwnership\.attach\(/);
  assert.match(timeline, /headYawTo\.tween\.pause\(\)/);
  assert.match(timeline, /headPitchTo\.tween\.pause\(\)/);
  assert.match(timeline, /resolveAgentCoreLegacyInstallGaze/);
  const installTimeline = timeline.slice(
    timeline.indexOf("installationTimeline = gsap.timeline"),
    timeline.indexOf("const onPointerDown"),
  );
  assert.doesNotMatch(installTimeline, /\.to\(\s*head,/);
  assert.match(gazeHook, /section\.addEventListener\("pointermove"/);
  assert.match(gazeHook, /section\.addEventListener\("pointerleave"/);
  assert.match(gazeHook, /section\.removeEventListener\("pointermove"/);
  assert.match(gazeHook, /section\.removeEventListener\("pointerleave"/);
  assert.match(gazeHook, /bridge\.pointer\.active = false/);
  assert.doesNotMatch(gazeHook, /headRef|style\.|gsap|setState|setRotation/);
});

test("drives semantic IK and Core ownership while DOM handles telemetry only", () => {
  const source = readFileSync(hookPath, "utf8");
  const install3D = readFileSync(install3DPath, "utf8");
  const timelineSource = source.slice(
    source.indexOf('addLabel("targeting"'),
    source.indexOf('.play(0)'),
  );

  assert.match(install3D, /CCDIKSolver/);
  assert.match(install3D, /attachCoreToGrip/);
  assert.match(install3D, /attachCoreToSocket/);
  assert.match(source, /const core = coreRef\.current/);
  assert.match(source, /const socket = socketRef\.current/);
  assert.match(source, /socket\.getBoundingClientRect\(\)/);
  assert.match(source, /AgentCore3DBridge|bridge\./);
  assert.doesNotMatch(timelineSource, /\.to\(\s*core,/);
  for (const label of [
    "targeting",
    "reaching",
    "grasping",
    "carrying",
    "docking",
    "activating",
    "capabilities",
    "returning",
    "hold",
  ]) {
    assert.ok(timelineSource.includes(`addLabel("${label}"`), label);
  }
});

test("keeps source-backed telemetry, one live completion announcement, and one-shot completion", () => {
  const hook = readFileSync(hookPath, "utf8");
  const section = readFileSync(sectionPath, "utf8");

  assert.match(hook, /getAgentCoreStats/);
  assert.match(hook, /formatAgentCoreValue/);
  assert.match(hook, /setFinalTelemetry/);
  assert.match(section, /aria-live="polite"/);
  assert.match(section, /AnyCap Core connected\. Twelve capabilities are ready\./);
  assert.match(hook, /stateRef\.current\.started/);
  assert.match(hook, /nextInstallState/);
  const installSource = hook.slice(
    hook.indexOf("const install = contextSafe"),
    hook.indexOf("installationTimeline = gsap.timeline"),
  );
  assert.ok(
    installSource.indexOf('transition("activate")') < installSource.indexOf("getBoundingClientRect"),
    "one-shot state closes synchronously before measurement and timeline creation",
  );
});
