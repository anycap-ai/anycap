"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import type { Material, Object3D, SkinnedMesh } from "three";
import { clone } from "three/addons/utils/SkeletonUtils.js";

import modelContract from "../../../../public/visuals/agent-core-3d/model-contract.json";
import type { AgentCore3DBridge } from "./agent-core-3d-bridge";

// Approved local asset: agent-core-upper-body.glb. The runtime path stays contract-derived.
const LOCAL_MODEL_URL = `/visuals/agent-core-3d/${modelContract.asset.file}`;

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

export function AgentCoreRig3D({ bridge, onReady }: AgentCoreRig3DProps) {
  const gltf = useGLTF(LOCAL_MODEL_URL);
  const scene = useMemo(() => validateAndPrepareModel(gltf.scene), [gltf.scene]);
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

  useFrame(() => {
    if (firstFrame.current) return;
    firstFrame.current = true;
    readyFrame.current = requestAnimationFrame(() => {
      readyFrame.current = null;
      onReady();
    });
  });

  return <primitive object={scene} dispose={null} />;
}

useGLTF.preload(LOCAL_MODEL_URL);
