import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  clampGaze,
  mapPointerToGaze,
  shortestAngleDelta,
  splitGazeRotation,
} from "../src/components/landing/agent-core/agent-core-gaze.ts";

const bounds = { left: 100, top: 50, width: 1000, height: 600 };
const gazeHookPath = fileURLToPath(new URL("../src/components/landing/agent-core/useAgentCoreGaze3D.ts", import.meta.url));
const rigPath = fileURLToPath(new URL("../src/components/landing/agent-core/AgentCoreRig3D.tsx", import.meta.url));

test("maps the section edges to natural gaze limits", () => {
  assert.deepEqual(mapPointerToGaze({ x: 100, y: 350 }, bounds), { yaw: -70, pitch: 0 });
  assert.deepEqual(mapPointerToGaze({ x: 1100, y: 350 }, bounds), { yaw: 70, pitch: 0 });
  assert.deepEqual(mapPointerToGaze({ x: 600, y: 50 }, bounds), { yaw: 0, pitch: -25 });
  assert.deepEqual(mapPointerToGaze({ x: 600, y: 650 }, bounds), { yaw: 0, pitch: 25 });
});

test("maps the center and four corners across all nine pointer targets", () => {
  assert.deepEqual(mapPointerToGaze({ x: 600, y: 350 }, bounds), { yaw: 0, pitch: 0 });
  assert.deepEqual(mapPointerToGaze({ x: 100, y: 50 }, bounds), { yaw: -70, pitch: -25 });
  assert.deepEqual(mapPointerToGaze({ x: 1100, y: 50 }, bounds), { yaw: 70, pitch: -25 });
  assert.deepEqual(mapPointerToGaze({ x: 100, y: 650 }, bounds), { yaw: -70, pitch: 25 });
  assert.deepEqual(mapPointerToGaze({ x: 1100, y: 650 }, bounds), { yaw: 70, pitch: 25 });
});

test("uses a three-percent central dead zone", () => {
  assert.deepEqual(mapPointerToGaze({ x: 615, y: 341 }, bounds), { yaw: 0, pitch: 0 });
  assert.deepEqual(mapPointerToGaze({ x: 616, y: 350 }, bounds), { yaw: 2.24, pitch: 0 });
});

test("clamps points and connected amplitude to bounded gaze", () => {
  assert.deepEqual(mapPointerToGaze({ x: -500, y: 1000 }, bounds, 2), { yaw: -70, pitch: 25 });
  assert.deepEqual(mapPointerToGaze({ x: 1100, y: 650 }, bounds, 0.5), { yaw: 35, pitch: 12.5 });
  assert.deepEqual(mapPointerToGaze({ x: 1100, y: 650 }, bounds, -1), { yaw: 0, pitch: 0 });
  assert.deepEqual(clampGaze({ yaw: 100, pitch: -30, roll: 5 }), { yaw: 70, pitch: -25, roll: 3 });
});

test("keeps zero-size bounds finite", () => {
  const gaze = mapPointerToGaze({ x: 600, y: 350 }, { left: 100, top: 50, width: 0, height: 0 });
  assert.deepEqual(gaze, { yaw: 0, pitch: 0 });
  assert.ok(Number.isFinite(gaze.yaw));
  assert.ok(Number.isFinite(gaze.pitch));
});

test("splits rotation across neck and head", () => {
  assert.deepEqual(splitGazeRotation({ yaw: 70, pitch: 20 }), {
    neck: { yaw: 21, pitch: 6, roll: 0 },
    head: { yaw: 49, pitch: 14, roll: 0 },
  });
});

test("never chooses a full-spin path", () => {
  assert.equal(shortestAngleDelta(170, -170), 20);
  assert.equal(shortestAngleDelta(-170, 170), -20);
  assert.equal(shortestAngleDelta(720, 0), 0);
  assert.equal(shortestAngleDelta(0, 720), 0);
});

test("owns ready-stage pointer gaze through the mutable bridge", () => {
  const gazeHook = readFileSync(gazeHookPath, "utf8");
  assert.match(gazeHook, /section\.addEventListener\("pointermove"/);
  assert.match(gazeHook, /section\.getBoundingClientRect\(\)/);
  assert.match(gazeHook, /any-pointer: fine/);
  assert.match(gazeHook, /phase === "connected" \? 0\.6 : 1/);
  assert.match(gazeHook, /gazeMode !== "user"/);
  assert.match(gazeHook, /bridge\.pointer\.(?:x|y|active)\s*=/);
  assert.match(gazeHook, /bridge\.invalidate\?\.\(\)/);
  assert.match(gazeHook, /new IntersectionObserver/);
  assert.match(gazeHook, /section\.removeEventListener\("pointermove"/);
  assert.match(gazeHook, /observer\.disconnect\(\)/);
  assert.doesNotMatch(gazeHook, /setState|setRotation|requestAnimationFrame/);
});

test("keeps normalized gaze stable when scrolling changes only viewport offset", async () => {
  const gaze3D = await import("../src/components/landing/agent-core/useAgentCoreGaze3D.ts");
  assert.equal(typeof gaze3D.toAgentCoreDocumentBounds, "function");
  assert.equal(typeof gaze3D.normalizeAgentCorePointer, "function");

  const beforeScroll = gaze3D.toAgentCoreDocumentBounds(
    { left: 100, top: 50, width: 1000, height: 600 },
    { x: 0, y: 0 },
  );
  const afterScroll = gaze3D.toAgentCoreDocumentBounds(
    { left: 100, top: -250, width: 1000, height: 600 },
    { x: 0, y: 300 },
  );
  assert.deepEqual(afterScroll, beforeScroll);
  assert.deepEqual(
    gaze3D.normalizeAgentCorePointer({ x: 600, y: 350 }, afterScroll),
    { x: 0, y: 0 },
  );
});

test("suspends and reconciles an active pointer tween across readiness", async () => {
  const bridge3D = await import("../src/components/landing/agent-core/agent-core-3d-bridge.ts");
  assert.equal(typeof bridge3D.createAgentCoreLegacyGazeOwnership, "function");
  const ownership = bridge3D.createAgentCoreLegacyGazeOwnership();
  const events = [];
  const detach = ownership.attach({
    suspend: () => events.push("pointer-paused"),
    reconcile: () => events.push("pointer-reconciled"),
  });

  ownership.setStageReady(true);
  ownership.setStageReady(true);
  ownership.setStageReady(false);
  assert.deepEqual(events, ["pointer-paused", "pointer-reconciled"]);

  detach();
  ownership.setStageReady(true);
  assert.deepEqual(events, ["pointer-paused", "pointer-reconciled"]);
});

test("reconciles install gaze in both readiness directions", async () => {
  const bridge3D = await import("../src/components/landing/agent-core/agent-core-3d-bridge.ts");
  assert.equal(typeof bridge3D.resolveAgentCoreLegacyInstallGaze, "function");
  const focus = { yaw: -18, pitch: 12, duration: 0.22 };

  let timelineTime = 0.2;
  const legacyFirst = bridge3D.createAgentCoreLegacyGazeOwnership();
  const legacyFirstEvents = [];
  legacyFirst.attach({
    suspend: () => legacyFirstEvents.push("install-paused"),
    reconcile: () => legacyFirstEvents.push(
      bridge3D.resolveAgentCoreLegacyInstallGaze(timelineTime, 0.6, focus),
    ),
  });
  legacyFirst.setStageReady(true);
  timelineTime = 0.8;
  legacyFirst.setStageReady(false);
  assert.deepEqual(legacyFirstEvents, [
    "install-paused",
    { yaw: 0, pitch: -2, duration: 0.34 },
  ]);

  const readyFirst = bridge3D.createAgentCoreLegacyGazeOwnership();
  const readyFirstEvents = [];
  readyFirst.setStageReady(true);
  readyFirst.attach({
    suspend: () => readyFirstEvents.push("install-paused"),
    reconcile: () => readyFirstEvents.push(
      bridge3D.resolveAgentCoreLegacyInstallGaze(0.2, 0.6, focus),
    ),
  });
  readyFirst.setStageReady(false);
  assert.deepEqual(readyFirstEvents, ["install-paused", focus]);
});

test("damps real neck and head bones without moving the root or torso", () => {
  const rig = readFileSync(rigPath, "utf8");
  for (const boneName of ["neck_lower", "neck_upper", "head"]) {
    assert.match(rig, new RegExp(`getObjectByName\\(\\"${boneName}\\"\\)`));
  }
  assert.match(rig, /useFrame\(\([^)]*delta/);
  assert.match(rig, /splitGazeRotation/);
  assert.match(rig, /clampGaze/);
  assert.match(rig, /Quaternion/);
  assert.match(rig, /rotateTowards/);
  assert.match(rig, /angleTo/);
  assert.match(rig, /CONVERGENCE_EPSILON/);
  assert.match(rig, /setJointTarget\(gazeRig, gazeRig\.neckLower, split\.neck\)/);
  assert.match(rig, /setJointTarget\(gazeRig, gazeRig\.neckUpper, split\.head\)/);
  assert.doesNotMatch(rig, /setJointTarget\(gazeRig, gazeRig\.head/);
  assert.match(rig, /if \(angularError > CONVERGENCE_EPSILON\) invalidate\(\)/);
  assert.doesNotMatch(rig, /getObjectByName\("(?:AgentRoot|torso)"\)[\s\S]{0,120}quaternion/);
  assert.doesNotMatch(rig, /setState|setRotation/);
});
