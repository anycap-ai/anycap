import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  createAgentCore3DBridge,
  mapCoreInstallPose,
  mapHeadTarget,
} from "../src/components/landing/agent-core/agent-core-3d-state.ts";

const robotSourceUrl = new URL(
  "../src/components/landing/agent-core/AgentCoreRobot3D.tsx",
  import.meta.url,
);
const canvasSourceUrl = new URL(
  "../src/components/landing/agent-core/AgentCoreCanvas.tsx",
  import.meta.url,
);

test("head targets clamp normalized pointers to the approved rotation bounds", () => {
  assert.deepEqual(mapHeadTarget({ x: 4, y: -3 }), {
    yaw: 0.16,
    pitch: -0.09,
  });
  assert.deepEqual(mapHeadTarget({ x: -4, y: 3 }), {
    yaw: -0.16,
    pitch: 0.09,
  });
  assert.deepEqual(mapHeadTarget({ x: 0.5, y: -0.5 }), {
    yaw: 0.08,
    pitch: -0.045,
  });
});

test("Core installation clamps progress and preserves the approved endpoint poses", () => {
  const tablePose = mapCoreInstallPose(0);
  const socketPose = mapCoreInstallPose(1);

  assert.deepEqual(mapCoreInstallPose(-2), tablePose);
  assert.deepEqual(mapCoreInstallPose(3), socketPose);
  assert.deepEqual(tablePose, {
    position: [0.38, -2.08, 0.72],
    rotation: [-0.12, 0.08, -0.04],
    scale: 0.82,
  });
  assert.deepEqual(socketPose, {
    position: [0, -0.34, 1.18],
    rotation: [0, 0, 0],
    scale: 0.72,
  });
});

test("each 3D bridge begins in the awaiting state without shared mutable values", () => {
  const first = createAgentCore3DBridge();
  const second = createAgentCore3DBridge();

  assert.notEqual(first, second);
  assert.notEqual(first.pointerTarget, second.pointerTarget);
  assert.deepEqual(first.pointerTarget, { x: 0, y: 0 });
  assert.deepEqual(first.pointerCurrent, { yaw: 0, pitch: 0 });
  assert.equal(first.installProgress, 0);
  assert.equal(first.connected, false);
  assert.deepEqual(first.dragOffset, { x: 0, y: 0, z: 0 });
  assert.equal(first.sceneActive, false);
  assert.equal(first.invalidate, null);
});

test("procedural scene exposes semantic groups and contains no model service path", async () => {
  const [robotSource, canvasSource] = await Promise.all([
    readFile(robotSourceUrl, "utf8"),
    readFile(canvasSourceUrl, "utf8"),
  ]);
  const sceneSource = `${robotSource}\n${canvasSource}`;

  for (const groupName of [
    "RobotRoot",
    "Torso",
    "NeckPivot",
    "Head",
    "Visor",
    "ChestSocket",
    "AnyCapCore",
  ]) {
    assert.match(sceneSource, new RegExp(`name=[{]?['\"]${groupName}['\"]`));
  }

  assert.doesNotMatch(sceneSource, /useGLTF|\.glb\b|tripo/i);
});

test("Canvas is lazy, transparent, demand-rendered, and caps desktop and mobile DPR", async () => {
  const [robotSource, canvasSource] = await Promise.all([
    readFile(robotSourceUrl, "utf8"),
    readFile(canvasSourceUrl, "utf8"),
  ]);
  const sceneSource = `${robotSource}\n${canvasSource}`;

  assert.match(canvasSource, /dynamic\s*\(/);
  assert.match(canvasSource, /ssr:\s*false/);
  assert.match(sceneSource, /alpha:\s*true/);
  assert.match(sceneSource, /frameloop=["']demand["']/);
  assert.match(canvasSource, /DESKTOP_DPR_CAP\s*=\s*1\.5/);
  assert.match(canvasSource, /MOBILE_DPR_CAP\s*=\s*1\.25/);
  assert.match(sceneSource, /fallback=/);
});

test("caller keeps its fallback mounted until the suspended R3F scene reports ready", async () => {
  const [robotSource, canvasSource] = await Promise.all([
    readFile(robotSourceUrl, "utf8"),
    readFile(canvasSourceUrl, "utf8"),
  ]);

  assert.match(canvasSource, /const \[ready, setReady\] = useState\(false\)/);
  assert.match(canvasSource, /!ready\s*\?/);
  assert.match(canvasSource, /<LazyAgentCoreCanvas[\s\S]*onReady=\{\(\) => setReady\(true\)\}/);
  assert.match(robotSource, /<Suspense[\s\S]*<AgentCoreRobot3D[\s\S]*<SceneReadyReporter/);
  assert.doesNotMatch(robotSource, /onCreated=\{\([\s\S]{0,160}setReady\(true\)/);
});

test("demand rendering continues only for internal smoothing convergence", async () => {
  const robotSource = await readFile(robotSourceUrl, "utf8");

  assert.match(robotSource, /if \(headIsMoving\) invalidate\(\)/);
  assert.doesNotMatch(robotSource, /installProgress\s*>\s*0\s*&&\s*bridge\.installProgress\s*<\s*1/);
});

test("WebGL context lifecycle restores the fallback and cleans up listeners", async () => {
  const robotSource = await readFile(robotSourceUrl, "utf8");

  assert.match(robotSource, /webglcontextlost/);
  assert.match(robotSource, /webglcontextrestored/);
  assert.match(robotSource, /onUnavailable\(\)/);
  assert.match(robotSource, /removeEventListener\(\s*["']webglcontextlost["']/);
  assert.match(robotSource, /removeEventListener\(\s*["']webglcontextrestored["']/);
});

test("DPR cap follows the mobile breakpoint after mount", async () => {
  const canvasSource = await readFile(canvasSourceUrl, "utf8");

  assert.match(canvasSource, /addEventListener\(\s*["']change["']/);
  assert.match(canvasSource, /removeEventListener\(\s*["']change["']/);
});
