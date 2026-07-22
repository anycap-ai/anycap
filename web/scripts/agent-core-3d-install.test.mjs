import assert from "node:assert/strict";
import test from "node:test";
import {
  initialInstallState,
  INSTALL_PHASES,
  INSTALL_WAYPOINTS,
  nextInstallState,
} from "../src/components/landing/agent-core/agent-core-install-state.ts";

function stateAt(phase) {
  const events = {
    awaiting: [],
    targeting: ["activate"],
    reaching: ["activate", "targeted"],
    grasping: ["activate", "targeted", "reached"],
    carrying: ["activate", "targeted", "reached", "grasped"],
    docking: ["activate", "targeted", "reached", "grasped", "carried"],
    activating: ["activate", "targeted", "reached", "grasped", "carried", "docked"],
    returning: ["activate", "targeted", "reached", "grasped", "carried", "docked", "activated"],
    connected: ["activate", "targeted", "reached", "grasped", "carried", "docked", "activated", "returned"],
  };
  return events[phase].reduce(nextInstallState, initialInstallState());
}

test("runs one autonomous install in the required order", () => {
  let state = initialInstallState();
  for (const event of [
    "activate", "targeted", "reached", "grasped", "carried",
    "docked", "activated", "returned",
  ]) state = nextInstallState(state, event);
  assert.equal(state.phase, "connected");
  assert.equal(state.coreOwner, "socket");
});

test("moves Core ownership exactly once per boundary", () => {
  assert.equal(nextInstallState(stateAt("reaching"), "reached").coreOwner, "dock");
  assert.equal(nextInstallState(stateAt("grasping"), "grasped").coreOwner, "hand");
  assert.equal(nextInstallState(stateAt("docking"), "docked").coreOwner, "socket");
});

test("never leaves the Core free while carrying", () => {
  for (const phase of ["carrying", "docking"]) {
    assert.equal(stateAt(phase).coreOwner, "hand");
  }
});

test("ignores a second activation and invalid out-of-order events", () => {
  const targeting = nextInstallState(initialInstallState(), "activate");
  assert.deepEqual(nextInstallState(targeting, "activate"), targeting);
  assert.deepEqual(nextInstallState(initialInstallState(), "grasped"), initialInstallState());
  assert.deepEqual(nextInstallState(targeting, "docked"), targeting);
});

test("reduced motion connects deterministically without articulated phases", () => {
  const connected = nextInstallState(initialInstallState(), "activate", { reducedMotion: true });
  assert.deepEqual(connected, { phase: "connected", coreOwner: "socket", started: true });
  assert.deepEqual(nextInstallState(connected, "returned"), connected);
});

test("a reload receives a new awaiting state", () => {
  const completed = stateAt("connected");
  assert.notDeepEqual(initialInstallState(), completed);
  assert.deepEqual(initialInstallState(), { phase: "awaiting", coreOwner: "dock", started: false });
});

test("uses the authored phase timing and world-space waypoints", () => {
  assert.deepEqual(INSTALL_PHASES, [
    { phase: "targeting", start: 0, end: 0.25 },
    { phase: "reaching", start: 0.18, end: 0.85 },
    { phase: "grasping", start: 0.78, end: 1.05 },
    { phase: "carrying", start: 1, end: 1.75 },
    { phase: "docking", start: 1.68, end: 2.05 },
    { phase: "activating", start: 2, end: 2.45 },
    { phase: "returning", start: 2.35, end: 3 },
  ]);
  assert.ok(INSTALL_PHASES.at(-1).end >= 2.6 && INSTALL_PHASES.at(-1).end <= 3);
  assert.deepEqual(Object.keys(INSTALL_WAYPOINTS), [
    "dock", "preGrip", "grip", "carryApex", "preSocket", "socket", "rest",
  ]);
  for (const point of Object.values(INSTALL_WAYPOINTS)) {
    assert.deepEqual(Object.keys(point), ["x", "y", "z"]);
    assert.ok(Object.values(point).every(Number.isFinite));
  }
});
