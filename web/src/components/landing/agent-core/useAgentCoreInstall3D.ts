import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  Euler,
  MathUtils,
  Quaternion,
  Vector3,
  type Bone,
  type Object3D,
  type SkinnedMesh,
} from "three";
import {
  CCDIKSolver,
  type IK,
} from "three/addons/animation/CCDIKSolver.js";

import type { AgentCore3DBridge } from "./agent-core-3d-bridge";
import {
  INSTALL_WAYPOINTS,
  type AgentCoreInstallPhase,
  type CoreOwner,
  type InstallWaypoint,
} from "./agent-core-install-state";

const INSTALL_DURATION_SECONDS = 3;
const R3F_ROOT_POSITION = { x: -0.1, y: 0, z: 0 } as const;
const ARM_CHAIN_NAMES = ["hand_R", "forearm_R", "upper_arm_R", "clavicle_R"] as const;
const IK_PHASES = new Set<AgentCoreInstallPhase>([
  "reaching",
  "grasping",
  "carrying",
  "docking",
  "returning",
]);

type RestJoint = {
  bone: Bone;
  quaternion: Quaternion;
};

type ArmIKRig = {
  solver: CCDIKSolver;
  ikTarget: Bone;
  ikTargetRestPosition: Vector3;
  ikTargetRestQuaternion: Quaternion;
  restQuaternions: RestJoint[];
  core: Object3D;
  coreOriginalParent: Object3D;
  dock: Object3D;
  grip: Object3D;
  socket: Object3D;
};

function semanticObject(scene: Object3D, name: string): Object3D {
  const object = scene.getObjectByName(name);
  if (!object) throw new Error(`Agent Core model is missing semantic object ${name}`);
  return object;
}

function semanticBone(scene: Object3D, name: string): Bone {
  const object = semanticObject(scene, name);
  if (!("isBone" in object) || object.isBone !== true) {
    throw new Error(`Agent Core semantic object ${name} must be a bone`);
  }
  return object as Bone;
}

function findArmSkinnedMesh(scene: Object3D): SkinnedMesh {
  let armMesh: SkinnedMesh | null = null;

  scene.traverse((object) => {
    if (armMesh || !("isSkinnedMesh" in object) || object.isSkinnedMesh !== true) return;
    const mesh = object as SkinnedMesh;
    const boneNames = new Set(mesh.skeleton.bones.map((bone) => bone.name));
    if ([...ARM_CHAIN_NAMES, "ik_target_R"].every((name) => boneNames.has(name))) {
      armMesh = mesh;
    }
  });

  if (!armMesh) {
    throw new Error("Agent Core model requires one SkinnedMesh containing the semantic arm chain");
  }
  return armMesh;
}

function restRelativeLimits(
  bone: Bone,
  minimumDegrees: [number, number, number],
  maximumDegrees: [number, number, number],
) {
  const rest = new Euler().setFromQuaternion(bone.quaternion, "XYZ");
  return {
    rotationMin: new Vector3(
      rest.x + MathUtils.degToRad(minimumDegrees[0]),
      rest.y + MathUtils.degToRad(minimumDegrees[1]),
      rest.z + MathUtils.degToRad(minimumDegrees[2]),
    ),
    rotationMax: new Vector3(
      rest.x + MathUtils.degToRad(maximumDegrees[0]),
      rest.y + MathUtils.degToRad(maximumDegrees[1]),
      rest.z + MathUtils.degToRad(maximumDegrees[2]),
    ),
  };
}

function requireBoneIndex(mesh: SkinnedMesh, bone: Bone): number {
  const index = mesh.skeleton.bones.indexOf(bone);
  if (index < 0) {
    throw new Error(`Agent Core SkinnedMesh is not bound to semantic bone ${bone.name}`);
  }
  return index;
}

function createIKDefinition(
  mesh: SkinnedMesh,
  target: Bone,
  hand: Bone,
  forearm: Bone,
  upperArm: Bone,
  clavicle: Bone,
): IK {
  return {
    target: requireBoneIndex(mesh, target),
    effector: requireBoneIndex(mesh, hand),
    iteration: 8,
    minAngle: MathUtils.degToRad(0.05),
    maxAngle: MathUtils.degToRad(18),
    links: [
      {
        index: requireBoneIndex(mesh, forearm),
        ...restRelativeLimits(forearm, [-145, -38, -50], [18, 38, 50]),
      },
      {
        index: requireBoneIndex(mesh, upperArm),
        ...restRelativeLimits(upperArm, [-105, -72, -82], [105, 72, 82]),
      },
      {
        index: requireBoneIndex(mesh, clavicle),
        ...restRelativeLimits(clavicle, [-28, -34, -30], [28, 34, 30]),
      },
    ],
  };
}

function prepareArmIK(scene: Object3D): ArmIKRig {
  const mesh = findArmSkinnedMesh(scene);
  const target = semanticBone(scene, "ik_target_R");
  const hand = semanticBone(scene, "hand_R");
  const forearm = semanticBone(scene, "forearm_R");
  const upperArm = semanticBone(scene, "upper_arm_R");
  const clavicle = semanticBone(scene, "clavicle_R");
  const ik = createIKDefinition(mesh, target, hand, forearm, upperArm, clavicle);
  const solver = new CCDIKSolver(mesh, [ik]);
  const core = semanticObject(scene, "core");
  const coreOriginalParent = core.parent;
  if (!coreOriginalParent) throw new Error("Agent Core semantic Core requires an authored parent");

  return {
    solver,
    ikTarget: target,
    ikTargetRestPosition: target.position.clone(),
    ikTargetRestQuaternion: target.quaternion.clone(),
    restQuaternions: [clavicle, upperArm, forearm, hand].map((bone) => ({
      bone,
      quaternion: bone.quaternion.clone(),
    })),
    core,
    coreOriginalParent,
    dock: semanticObject(scene, "core_dock"),
    grip: semanticObject(scene, "core_grip_R"),
    socket: semanticObject(scene, "chest_socket"),
  };
}

export function attachCoreToDock(core: Object3D, dock: Object3D) {
  dock.attach(core);
}

export function attachCoreToGrip(core: Object3D, grip: Object3D) {
  grip.attach(core);
  core.position.set(0, 0, 0);
  core.quaternion.identity();
}

export function attachCoreToSocket(core: Object3D, socket: Object3D) {
  socket.attach(core);
  core.position.set(0, 0, 0);
  core.quaternion.identity();
}

export function isIKPhase(phase: AgentCoreInstallPhase): boolean {
  return IK_PHASES.has(phase);
}

function copyWaypoint(target: Vector3, waypoint: InstallWaypoint): Vector3 {
  return target.set(waypoint.x, waypoint.y, waypoint.z);
}

function mixWaypoint(
  target: Vector3,
  from: InstallWaypoint,
  to: InstallWaypoint,
  progress: number,
): Vector3 {
  const eased = MathUtils.smoothstep(progress, 0, 1);
  return target.set(
    MathUtils.lerp(from.x, to.x, eased),
    MathUtils.lerp(from.y, to.y, eased),
    MathUtils.lerp(from.z, to.z, eased),
  );
}

function segmentProgress(time: number, start: number, end: number): number {
  return MathUtils.clamp((time - start) / (end - start), 0, 1);
}

// INSTALL_WAYPOINTS are locked in Blender narrative axes. glTF exports them as
// (x, z, -y); the fixed Task 6A R3F group offset is outside AgentRoot, so IK
// consumes this rig-local conversion without the stage translation.
export function installWaypointToRigLocal(
  waypoint: InstallWaypoint,
  target = new Vector3(),
): Vector3 {
  return target.set(waypoint.x, waypoint.z, -waypoint.y);
}

export function installWaypointToStageWorld(
  waypoint: InstallWaypoint,
  target = new Vector3(),
): Vector3 {
  const worldTarget = installWaypointToRigLocal(waypoint, target);
  worldTarget.x += R3F_ROOT_POSITION.x;
  worldTarget.y += R3F_ROOT_POSITION.y;
  worldTarget.z += R3F_ROOT_POSITION.z;
  return worldTarget;
}

function resolveNarrativeWaypoint(
  phase: AgentCoreInstallPhase,
  progress: number,
  target: Vector3,
): Vector3 {
  const time = MathUtils.clamp(progress, 0, 1) * INSTALL_DURATION_SECONDS;

  if (phase === "reaching") {
    if (time < 0.48) {
      return mixWaypoint(
        target,
        INSTALL_WAYPOINTS.dock,
        INSTALL_WAYPOINTS.preGrip,
        segmentProgress(time, 0.18, 0.48),
      );
    }
    return mixWaypoint(
      target,
      INSTALL_WAYPOINTS.preGrip,
      INSTALL_WAYPOINTS.grip,
      segmentProgress(time, 0.48, 0.78),
    );
  }
  if (phase === "grasping") return copyWaypoint(target, INSTALL_WAYPOINTS.grip);
  if (phase === "carrying") {
    if (time < 1.34) {
      return mixWaypoint(
        target,
        INSTALL_WAYPOINTS.grip,
        INSTALL_WAYPOINTS.carryApex,
        segmentProgress(time, 1, 1.34),
      );
    }
    return mixWaypoint(
      target,
      INSTALL_WAYPOINTS.carryApex,
      INSTALL_WAYPOINTS.preSocket,
      segmentProgress(time, 1.34, 1.68),
    );
  }
  if (phase === "docking") {
    return mixWaypoint(
      target,
      INSTALL_WAYPOINTS.preSocket,
      INSTALL_WAYPOINTS.socket,
      segmentProgress(time, 1.68, 2),
    );
  }
  if (phase === "returning") {
    return mixWaypoint(
      target,
      INSTALL_WAYPOINTS.socket,
      INSTALL_WAYPOINTS.rest,
      segmentProgress(time, 2.35, 3),
    );
  }
  return copyWaypoint(target, INSTALL_WAYPOINTS.rest);
}

export function resolveIKWaypoint(
  phase: AgentCoreInstallPhase,
  progress: number,
  target = new Vector3(),
): Vector3 {
  const narrativeWaypoint = resolveNarrativeWaypoint(phase, progress, target);
  return installWaypointToRigLocal(narrativeWaypoint, target);
}

function synchronizeCoreOwner(rig: ArmIKRig, owner: CoreOwner) {
  if (owner === "dock") attachCoreToDock(rig.core, rig.dock);
  else if (owner === "hand") attachCoreToGrip(rig.core, rig.grip);
  else attachCoreToSocket(rig.core, rig.socket);
}

export function useAgentCoreInstall3D(scene: Object3D, bridge: AgentCore3DBridge) {
  const rig = useMemo(() => prepareArmIK(scene), [scene]);
  const ownerRef = useRef<CoreOwner | null>(null);
  const waypoint = useMemo(() => new Vector3(), []);

  useEffect(() => {
    const ikHelper = rig.solver.createHelper(0.01);
    scene.updateMatrixWorld(true);
    synchronizeCoreOwner(rig, bridge.coreOwner);
    ownerRef.current = bridge.coreOwner;
    bridge.invalidate?.();

    return () => {
      for (const rest of rig.restQuaternions) rest.bone.quaternion.copy(rest.quaternion);
      rig.ikTarget.position.copy(rig.ikTargetRestPosition);
      rig.ikTarget.quaternion.copy(rig.ikTargetRestQuaternion);
      rig.coreOriginalParent.attach(rig.core);
      ikHelper.dispose();
      ownerRef.current = null;
    };
  }, [bridge, rig, scene]);

  useFrame(() => {
    if (ownerRef.current !== bridge.coreOwner) {
      scene.updateMatrixWorld(true);
      synchronizeCoreOwner(rig, bridge.coreOwner);
      ownerRef.current = bridge.coreOwner;
    }

    if (!isIKPhase(bridge.phase)) return;

    resolveIKWaypoint(bridge.phase, bridge.progress, waypoint);
    rig.ikTarget.position.copy(waypoint);
    scene.updateMatrixWorld(true);
    rig.solver.update();

    if (bridge.phase === "returning") {
      const returnProgress = segmentProgress(
        bridge.progress * INSTALL_DURATION_SECONDS,
        2.35,
        3,
      );
      for (const { bone, quaternion: restQuaternion } of rig.restQuaternions) {
        bone.quaternion.slerp(restQuaternion, returnProgress);
      }
    }

    scene.updateMatrixWorld(true);
  });
}
