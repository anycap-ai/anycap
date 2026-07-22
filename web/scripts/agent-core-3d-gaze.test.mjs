import assert from "node:assert/strict";
import test from "node:test";
import {
  clampGaze,
  mapPointerToGaze,
  shortestAngleDelta,
  splitGazeRotation,
} from "../src/components/landing/agent-core/agent-core-gaze.ts";

const bounds = { left: 100, top: 50, width: 1000, height: 600 };

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
    neck: { yaw: 21, pitch: 6 },
    head: { yaw: 49, pitch: 14 },
  });
});

test("never chooses a full-spin path", () => {
  assert.equal(shortestAngleDelta(170, -170), 20);
  assert.equal(shortestAngleDelta(-170, 170), -20);
});
