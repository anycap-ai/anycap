import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { Object3D, Vector3 } from "three";
import {
  initialInstallState,
  INSTALL_PHASES,
  INSTALL_WAYPOINTS,
  nextInstallState,
} from "../src/components/landing/agent-core/agent-core-install-state.ts";

const install3DPath = fileURLToPath(
  new URL("../src/components/landing/agent-core/useAgentCoreInstall3D.ts", import.meta.url),
);
const rigPath = fileURLToPath(
  new URL("../src/components/landing/agent-core/AgentCoreRig3D.tsx", import.meta.url),
);
const stagePath = fileURLToPath(
  new URL("../src/components/landing/agent-core/AgentCoreStage3D.tsx", import.meta.url),
);

function source(path) {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

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

test("binds CCD IK to the approved semantic arm chain and authored limits", () => {
  const install3D = source(install3DPath);
  const rig = source(rigPath);

  assert.equal(existsSync(install3DPath), true, "3D install hook exists");
  assert.match(install3D, /CCDIKSolver/);
  assert.match(
    install3D,
    /\["hand_R",\s*"forearm_R",\s*"upper_arm_R",\s*"clavicle_R"\]/,
  );
  for (const name of [
    "ik_target_R",
    "hand_R",
    "forearm_R",
    "upper_arm_R",
    "clavicle_R",
  ]) assert.ok(install3D.includes(`"${name}"`), name);
  assert.match(install3D, /rotationMin/);
  assert.match(install3D, /rotationMax/);
  assert.match(install3D, /restRelativeLimits/);
  assert.match(install3D, /restQuaternions/);
  assert.match(install3D, /INSTALL_WAYPOINTS/);
  assert.match(install3D, /installWaypointToRigLocal/);
  assert.match(install3D, /solver\.update\(\)/);
  assert.match(rig, /useAgentCoreInstall3D\(scene, bridge\)/);
  assert.match(source(stagePath), /<group position=\{\[-0\.1, 0, 0\]\}>/);
});

test("keeps the Core under one exact semantic parent for the whole narrative", () => {
  const install3D = source(install3DPath);

  assert.match(install3D, /function attachCoreToDock/);
  assert.match(install3D, /function attachCoreToGrip/);
  assert.match(install3D, /function attachCoreToSocket/);
  assert.match(install3D, /dock\.attach\(core\)/);
  assert.match(install3D, /grip\.attach\(core\)/);
  assert.match(install3D, /socket\.attach\(core\)/);
  assert.match(install3D, /core\.position\.set\(0, 0, 0\)/);
  assert.match(install3D, /core\.quaternion\.identity\(\)/);
  assert.doesNotMatch(install3D, /scene\.attach\(core\)|core\.parent\?\.remove\(core\)/);
});

test("solves only articulated travel and restores the authored arm through returning", () => {
  const install3D = source(install3DPath);

  for (const phase of ["reaching", "grasping", "carrying", "docking", "returning"]) {
    assert.ok(install3D.includes(`"${phase}"`), phase);
  }
  assert.match(install3D, /isIKPhase/);
  assert.match(install3D, /returnProgress/);
  assert.match(install3D, /\.slerp\([^,]+,\s*returnProgress\)/);
  assert.match(install3D, /ikHelper\.dispose\(\)/);
});

test("performs real Three.js parenting and deterministic waypoint resolution", async () => {
  const install3D = await import(
    "../src/components/landing/agent-core/useAgentCoreInstall3D.ts"
  );
  const root = new Object3D();
  const dock = new Object3D();
  const grip = new Object3D();
  const socket = new Object3D();
  const core = new Object3D();
  root.add(dock, grip, socket, core);
  dock.position.set(1, 0, 0);
  grip.position.set(2, 1, 0);
  socket.position.set(-1, 2, 0);
  core.position.set(3, 0, 0);
  root.updateMatrixWorld(true);

  const beforeDock = core.getWorldPosition(new Vector3());
  install3D.attachCoreToDock(core, dock);
  assert.equal(core.parent, dock);
  assert.deepEqual(core.getWorldPosition(new Vector3()).toArray(), beforeDock.toArray());

  install3D.attachCoreToGrip(core, grip);
  assert.equal(core.parent, grip);
  assert.deepEqual(core.position.toArray(), [0, 0, 0]);
  assert.deepEqual(core.quaternion.toArray(), [0, 0, 0, 1]);

  install3D.attachCoreToSocket(core, socket);
  assert.equal(core.parent, socket);
  assert.deepEqual(core.position.toArray(), [0, 0, 0]);
  assert.deepEqual(core.quaternion.toArray(), [0, 0, 0, 1]);

  assert.deepEqual(
    ["awaiting", "targeting", "reaching", "grasping", "carrying", "docking", "activating", "returning", "connected"]
      .filter(install3D.isIKPhase),
    ["reaching", "grasping", "carrying", "docking", "returning"],
  );
  assert.deepEqual(
    install3D.installWaypointToRigLocal({ x: 0.92, y: -0.72, z: 0.38 }).toArray(),
    [0.92, 0.38, 0.72],
  );
  const stageWorld = install3D
    .installWaypointToStageWorld({ x: 0.92, y: -0.72, z: 0.38 })
    .toArray();
  assert.ok(Math.abs(stageWorld[0] - 0.82) < Number.EPSILON);
  assert.deepEqual(stageWorld.slice(1), [0.38, 0.72]);
  assert.deepEqual(
    install3D.resolveIKWaypoint("reaching", 0.78 / 3).toArray(),
    [INSTALL_WAYPOINTS.grip.x, INSTALL_WAYPOINTS.grip.z, -INSTALL_WAYPOINTS.grip.y],
  );
  assert.deepEqual(
    install3D.resolveIKWaypoint("carrying", 1.68 / 3).toArray(),
    [
      INSTALL_WAYPOINTS.preSocket.x,
      INSTALL_WAYPOINTS.preSocket.z,
      -INSTALL_WAYPOINTS.preSocket.y,
    ],
  );
  assert.deepEqual(
    install3D.resolveIKWaypoint("docking", 2 / 3).toArray(),
    [INSTALL_WAYPOINTS.socket.x, INSTALL_WAYPOINTS.socket.z, -INSTALL_WAYPOINTS.socket.y],
  );
  assert.deepEqual(
    install3D.resolveIKWaypoint("returning", 1).toArray(),
    [INSTALL_WAYPOINTS.rest.x, INSTALL_WAYPOINTS.rest.z, -INSTALL_WAYPOINTS.rest.y],
  );
});
