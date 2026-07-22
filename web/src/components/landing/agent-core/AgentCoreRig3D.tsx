"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import {
  Euler,
  MathUtils,
  Quaternion,
  Vector3,
  type Material,
  type Object3D,
  type SkinnedMesh,
} from "three";
import { clone } from "three/addons/utils/SkeletonUtils.js";

import modelContract from "../../../../public/visuals/agent-core-3d/model-contract.json";
import type { AgentCore3DBridge } from "./agent-core-3d-bridge";
import {
  clampGaze,
  mapPointerToGaze,
  splitGazeRotation,
  type GazeAngles,
} from "./agent-core-gaze";
import { useAgentCoreInstall3D } from "./useAgentCoreInstall3D";

// Approved local asset: agent-core-upper-body.glb. The runtime path stays contract-derived.
const LOCAL_MODEL_URL = `/visuals/agent-core-3d/${modelContract.asset.file}`;
const NORMALIZED_POINTER_BOUNDS = { left: -1, top: -1, width: 2, height: 2 };
const TARGET_DISTANCE = 2;
const DAMPING_RESPONSE = 16;
const MAX_ANGULAR_SPEED = MathUtils.degToRad(540);
const CONVERGENCE_EPSILON = MathUtils.degToRad(0.08);

type AgentCoreRig3DProps = {
  bridge: AgentCore3DBridge;
  onReady: () => void;
};

function materialList(material: Material | Material[]): Material[] {
  return Array.isArray(material) ? material : [material];
}

function validateAndPrepareModel(source: Object3D): Object3D {
  const scene = clone(source);
  const names = new Map<string, Object3D[]>();
  const materialNames = new Set<string>();

  scene.traverse((object) => {
    const matches = names.get(object.name) ?? [];
    matches.push(object);
    names.set(object.name, matches);

    if ("material" in object) {
      const mesh = object as Object3D & { material: Material | Material[] };
      for (const material of materialList(mesh.material)) {
        materialNames.add(material.name);
        material.needsUpdate = true;
      }
    }

    if ("isSkinnedMesh" in object && object.isSkinnedMesh) {
      (object as SkinnedMesh).skeleton.pose();
    }
  });

  for (const name of [...modelContract.requiredNodes, ...modelContract.requiredBones]) {
    const matches = names.get(name) ?? [];
    if (matches.length !== 1) {
      throw new Error(`Agent Core model requires exactly one semantic object named ${name}`);
    }
  }

  for (const boneName of modelContract.requiredBones) {
    const bone = names.get(boneName)?.[0];
    if (!bone || !("isBone" in bone) || bone.isBone !== true) {
      throw new Error(`Agent Core semantic object ${boneName} must be a bone`);
    }
  }

  for (const [childName, parentName] of Object.entries(modelContract.requiredHierarchy)) {
    const child = names.get(childName)?.[0];
    if (child?.parent?.name !== parentName) {
      throw new Error(`Agent Core hierarchy requires ${parentName} > ${childName}`);
    }
  }

  for (const materialName of modelContract.materials) {
    if (!materialNames.has(materialName)) {
      throw new Error(`Agent Core model is missing material ${materialName}`);
    }
  }

  scene.updateMatrixWorld(true);
  return scene;
}

type GazeJoint = {
  object: Object3D;
  rest: Quaternion;
  target: Quaternion;
};

type GazeRig = {
  neckLower: GazeJoint;
  neckUpper: GazeJoint;
  head: Object3D;
  core: Object3D;
  socket: Object3D;
  origin: Vector3;
  worldTarget: Vector3;
  direction: Vector3;
  euler: Euler;
  deltaQuaternion: Quaternion;
};

function requireSemanticObject(scene: Object3D, name: string): Object3D {
  const object = scene.getObjectByName(name);
  if (!object) throw new Error(`Agent Core model is missing semantic object ${name}`);
  return object;
}

function gazeJoint(object: Object3D): GazeJoint {
  return {
    object,
    rest: object.quaternion.clone(),
    target: object.quaternion.clone(),
  };
}

function prepareGazeRig(scene: Object3D): GazeRig {
  const neckLower = scene.getObjectByName("neck_lower");
  const neckUpper = scene.getObjectByName("neck_upper");
  const head = scene.getObjectByName("head");
  if (!neckLower || !neckUpper || !head) {
    throw new Error("Agent Core model is missing the semantic gaze chain");
  }

  return {
    neckLower: gazeJoint(neckLower),
    neckUpper: gazeJoint(neckUpper),
    head,
    core: requireSemanticObject(scene, "core"),
    socket: requireSemanticObject(scene, "chest_socket"),
    origin: new Vector3(),
    worldTarget: new Vector3(),
    direction: new Vector3(),
    euler: new Euler(0, 0, 0, "YXZ"),
    deltaQuaternion: new Quaternion(),
  };
}

function pointerWorldTarget(rig: GazeRig, bridge: AgentCore3DBridge): Vector3 {
  const pointerGaze = mapPointerToGaze(
    { x: bridge.pointer.x, y: bridge.pointer.y },
    NORMALIZED_POINTER_BOUNDS,
  );
  const yaw = MathUtils.degToRad(pointerGaze.yaw);
  const pitch = MathUtils.degToRad(pointerGaze.pitch);
  const horizontal = Math.cos(pitch);
  rig.direction.set(
    Math.sin(yaw) * horizontal,
    -Math.sin(pitch),
    Math.cos(yaw) * horizontal,
  );
  return rig.worldTarget.copy(rig.origin).addScaledVector(rig.direction, TARGET_DISTANCE);
}

function resolveWorldTarget(rig: GazeRig, bridge: AgentCore3DBridge): Vector3 {
  rig.head.getWorldPosition(rig.origin);
  if (bridge.gazeMode === "core") return rig.core.getWorldPosition(rig.worldTarget);
  if (bridge.gazeMode === "socket") return rig.socket.getWorldPosition(rig.worldTarget);
  if (bridge.gazeMode === "user" && bridge.pointer.active) {
    return pointerWorldTarget(rig, bridge);
  }
  return rig.worldTarget.copy(rig.origin).add(rig.direction.set(0, 0, TARGET_DISTANCE));
}

function worldTargetGaze(rig: GazeRig, bridge: AgentCore3DBridge): Required<GazeAngles> {
  const worldTarget = resolveWorldTarget(rig, bridge);
  const direction = rig.direction.copy(worldTarget).sub(rig.origin).normalize();
  const horizontalDistance = Math.hypot(direction.x, direction.z);
  const progress = Math.max(0, Math.min(1, bridge.progress));
  const authoredRoll =
    bridge.gazeMode === "user" || bridge.gazeMode === "neutral"
      ? 0
      : Math.sin(progress * Math.PI) * (bridge.gazeMode === "core" ? -3 : 3);

  return clampGaze({
    yaw: MathUtils.radToDeg(Math.atan2(direction.x, direction.z)),
    pitch: MathUtils.radToDeg(Math.atan2(-direction.y, horizontalDistance)),
    roll: authoredRoll,
  });
}

function setJointTarget(
  rig: GazeRig,
  joint: GazeJoint,
  angles: Required<GazeAngles>,
  scale = 1,
) {
  rig.euler.set(
    MathUtils.degToRad(angles.pitch * scale),
    MathUtils.degToRad(angles.yaw * scale),
    MathUtils.degToRad(angles.roll * scale),
    "YXZ",
  );
  rig.deltaQuaternion.setFromEuler(rig.euler);
  joint.target.copy(joint.rest).multiply(rig.deltaQuaternion);
}

function dampJoint(joint: GazeJoint, delta: number): number {
  const error = joint.object.quaternion.angleTo(joint.target);
  if (error <= CONVERGENCE_EPSILON) {
    joint.object.quaternion.copy(joint.target);
    return 0;
  }

  const dampedStep = error * (1 - Math.exp(-DAMPING_RESPONSE * delta));
  joint.object.quaternion.rotateTowards(
    joint.target,
    Math.min(dampedStep, MAX_ANGULAR_SPEED * delta),
  );
  return joint.object.quaternion.angleTo(joint.target);
}

export function AgentCoreRig3D({ bridge, onReady }: AgentCoreRig3DProps) {
  const gltf = useGLTF(LOCAL_MODEL_URL);
  const scene = useMemo(() => validateAndPrepareModel(gltf.scene), [gltf.scene]);
  const gazeRig = useMemo(() => prepareGazeRig(scene), [scene]);
  useAgentCoreInstall3D(scene, bridge);
  const invalidate = useThree((state) => state.invalidate);
  const readyFrame = useRef<number | null>(null);
  const firstFrame = useRef(false);

  useEffect(() => {
    bridge.invalidate = invalidate;
    invalidate();
    return () => {
      if (bridge.invalidate === invalidate) bridge.invalidate = null;
      if (readyFrame.current !== null) cancelAnimationFrame(readyFrame.current);
    };
  }, [bridge, invalidate]);

  useFrame((_state, delta) => {
    if (!firstFrame.current) {
      firstFrame.current = true;
      readyFrame.current = requestAnimationFrame(() => {
        readyFrame.current = null;
        onReady();
      });
    }

    scene.updateMatrixWorld(true);
    const gaze = worldTargetGaze(gazeRig, bridge);
    const split = splitGazeRotation(gaze);
    setJointTarget(gazeRig, gazeRig.neckLower, split.neck);
    setJointTarget(gazeRig, gazeRig.neckUpper, split.head);

    const frameDelta = Math.min(delta, 1 / 20);
    let angularError = dampJoint(gazeRig.neckLower, frameDelta);
    angularError = Math.max(angularError, dampJoint(gazeRig.neckUpper, frameDelta));
    if (angularError > CONVERGENCE_EPSILON) invalidate();
  });

  return <primitive object={scene} dispose={null} />;
}

useGLTF.preload(LOCAL_MODEL_URL);
