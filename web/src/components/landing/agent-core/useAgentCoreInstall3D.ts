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

import modelContract from "../../../../public/visuals/agent-core-3d/model-contract.json";
import type { AgentCore3DBridge } from "./agent-core-3d-bridge";
import {
  INSTALL_WAYPOINTS,
  type AgentCoreInstallPhase,
  type CoreOwner,
  type InstallWaypoint,
} from "./agent-core-install-state";

const INSTALL_DURATION_SECONDS = 3;
const ARM_CHAIN_NAMES = ["hand_R", "forearm_R", "upper_arm_R", "clavicle_R"] as const;
const waypointAdapter = modelContract.task7WaypointAdapter;
const IK_PHASES = new Set<AgentCoreInstallPhase>([
  "reaching",
  "grasping",
  "carrying",
  "docking",
  "returning",
]);

export type RestJoint = {
  bone: Bone;
  quaternion: Quaternion;
};

export type ArmRestPose = {
  ikTarget: Object3D;
  ikTargetPosition: Vector3;
  ikTargetQuaternion: Quaternion;
  restQuaternions: RestJoint[];
};

type ArmIKRig = {
  solver: CCDIKSolver;
  ikTarget: Bone;
  restPose: ArmRestPose;
  core: Object3D;
  coreOriginalParent: Object3D;
  dock: Object3D;
  grip: Object3D;
  socket: Object3D;
};

export function captureArmRestPose(
  ikTarget: Object3D,
  bones: readonly Bone[],
): ArmRestPose {
  return {
    ikTarget,
    ikTargetPosition: ikTarget.position.clone(),
    ikTargetQuaternion: ikTarget.quaternion.clone(),
    restQuaternions: bones.map((bone) => ({
      bone,
      quaternion: bone.quaternion.clone(),
    })),
  };
}

export function commitArmRestPose(restPose: ArmRestPose) {
  for (const rest of restPose.restQuaternions) rest.bone.quaternion.copy(rest.quaternion);
  restPose.ikTarget.position.copy(restPose.ikTargetPosition);
  restPose.ikTarget.quaternion.copy(restPose.ikTargetQuaternion);
}

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
    restPose: captureArmRestPose(target, [clavicle, upperArm, forearm, hand]),
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

// Task 7 controller coordinates are not direct Blender or glTF coordinates.
// The v006 asset contract supplies the component-wise affine adapter into the
// semantic AgentRoot space. Task 6A's R3F translation remains outside the rig.
export function installWaypointToRigLocal(
  waypoint: InstallWaypoint,
  target = new Vector3(),
): Vector3 {
  const { scale, offset } = waypointAdapter;
  return target.set(
    waypoint.x * scale[0] + offset[0],
    waypoint.y * scale[1] + offset[1],
    waypoint.z * scale[2] + offset[2],
  );
}

export function installWaypointToStageWorld(
  waypoint: InstallWaypoint,
  target = new Vector3(),
): Vector3 {
  const worldTarget = installWaypointToRigLocal(waypoint, target);
  worldTarget.x += waypointAdapter.r3fRootTranslation[0];
  worldTarget.y += waypointAdapter.r3fRootTranslation[1];
  worldTarget.z += waypointAdapter.r3fRootTranslation[2];
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
    const applyRestPose = () => {
      commitArmRestPose(rig.restPose);
      scene.updateMatrixWorld(true);
    };
    const commitRestPose = () => {
      applyRestPose();
      bridge.invalidate?.();
    };
    scene.updateMatrixWorld(true);
    synchronizeCoreOwner(rig, bridge.coreOwner);
    ownerRef.current = bridge.coreOwner;
    bridge.commitRestPose = commitRestPose;
    bridge.invalidate?.();

    return () => {
      applyRestPose();
      rig.coreOriginalParent.attach(rig.core);
      ikHelper.dispose();
      ownerRef.current = null;
      if (bridge.commitRestPose === commitRestPose) bridge.commitRestPose = null;
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
      for (const { bone, quaternion: restQuaternion } of rig.restPose.restQuaternions) {
        bone.quaternion.slerp(restQuaternion, returnProgress);
      }
    }

    scene.updateMatrixWorld(true);
  });
}
