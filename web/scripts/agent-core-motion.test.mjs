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
  assert.match(hook, /capture-touch/);
  assert.match(hook, /prefers-reduced-motion: reduce/);
  assert.match(hook, /ScrollTrigger\.create/);
  assert.match(hook, /cancelAnimationFrame/);
  assert.match(hook, /IntersectionObserver/);
});

test("gates one install and tears down every long-lived browser resource", () => {
  const source = readFileSync(hookPath, "utf8");
  assert.match(
    source,
    /phaseRef\.current !== "awaiting"[\s\S]*phaseRef\.current !== "dragging"/,
  );
  assert.match(source, /gsap\.timeline\(\{\s*paused:\s*true/);
  assert.match(source, /removeEventListener\("pointermove"/);
  assert.match(source, /observer\.disconnect\(\)/);
  assert.match(source, /entranceTrigger\.kill\(\)/);
  assert.match(source, /releasePointerCapture/);
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
});

test("keeps rejected drag input closed until the measured dock return completes", () => {
  const source = readFileSync(hookPath, "utf8");
  const rejectedDrop = source.slice(
    source.indexOf("const rejectDrop"),
    source.indexOf("const onPointerUp"),
  );
  assert.match(rejectedDrop, /isReturning\s*=\s*true/);
  assert.match(rejectedDrop, /ease:\s*"back\.out\(1\.35\)"[\s\S]*onComplete:[\s\S]*setPhase\("drop-rejected"\)/);
});

test("scopes idle head tracking to the full section surface", () => {
  const source = readFileSync(hookPath, "utf8");
  assert.match(source, /section\.addEventListener\("pointermove",\s*onScenePointerMove\)/);
  assert.match(source, /section\.removeEventListener\("pointermove",\s*onScenePointerMove\)/);
});

test("consumes the pure pointer reducer through one finalization path", () => {
  const hook = readFileSync(hookPath, "utf8");
  const section = readFileSync(sectionPath, "utf8");
  assert.match(hook, /beginAgentCorePointerSession/);
  assert.match(hook, /finishAgentCorePointerSession/);
  assert.match(hook, /any-pointer:\s*fine/);
  assert.match(hook, /const finalizePointerSession = contextSafe/);
  assert.match(hook, /finalizePointerSession\(event, "up"\)/);
  assert.match(hook, /finalizePointerSession\(event, "cancel"\)/);
  assert.match(hook, /finalizePointerSession\(event, "lost-capture"\)/);
  assert.match(section, /onLostPointerCapture/);
});
