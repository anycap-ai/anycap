"use client";

import { useFrame, useLoader, useThree } from "@react-three/fiber";
import {
  useEffect,
  useMemo,
  useRef,
  type MutableRefObject,
} from "react";
import {
  Euler,
  LinearFilter,
  LinearMipmapLinearFilter,
  MathUtils,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  Object3D,
  Quaternion,
  Vector2,
} from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { clone } from "three/addons/utils/SkeletonUtils.js";

import modelContract from "../../../../public/visuals/futuristic-robot/model-contract.json";

const MODEL_URL = `/visuals/futuristic-robot/${modelContract.asset.file}`;
const MAX_YAW = MathUtils.degToRad(32);
const MAX_PITCH = MathUtils.degToRad(18);
const HEAD_SCREEN_CENTER = new Vector2(0.05, 0.72);

type FuturisticRobotRigProps = {
  active: boolean;
  pointer: MutableRefObject<Vector2>;
  onReady: () => void;
};

type HeadRig = {
  head: Object3D;
  neck: Object3D;
  headRest: Quaternion;
  neckRest: Quaternion;
};

const SHOWCASE_POSE = [
  ["LeftArm", [0, 0, -12]],
  ["LeftForeArm", [0, 0, 98]],
  ["LeftHand", [20, 0, -10]],
  ["RightArm", [0, 0, 8]],
  ["RightForeArm", [0, 0, -72]],
  ["RightHand", [0, 0, 8]],
] as const;

function applyShowcasePose(scene: Object3D) {
  const poseEuler = new Euler(0, 0, 0, "XYZ");
  const poseDelta = new Quaternion();

  for (const [name, rotation] of SHOWCASE_POSE) {
    const bone = scene.getObjectByName(name);
    if (!bone) continue;
    poseEuler.set(
      MathUtils.degToRad(rotation[0]),
      MathUtils.degToRad(rotation[1]),
      MathUtils.degToRad(rotation[2]),
      "XYZ",
    );
    poseDelta.setFromEuler(poseEuler);
    bone.quaternion.multiply(poseDelta);
  }
}

function polishMaterial(
  material: MeshStandardMaterial,
  anisotropy: number,
): MeshPhysicalMaterial {
  const polished = new MeshPhysicalMaterial();
  polished.copy(material);
  polished.roughness = 0.24;
  polished.metalness = 0.025;
  polished.clearcoat = 0.22;
  polished.clearcoatRoughness = 0.16;
  polished.envMapIntensity = 1.15;
  polished.onBeforeCompile = (shader) => {
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <map_fragment>",
      `#include <map_fragment>
      float anycapLuma = dot(diffuseColor.rgb, vec3(0.2126, 0.7152, 0.0722));
      float anycapGreen = smoothstep(
        0.03,
        0.16,
        diffuseColor.g - max(diffuseColor.r, diffuseColor.b)
      );
      vec3 anycapMonochrome = mix(
        vec3(0.018, 0.021, 0.017),
        vec3(0.945, 0.948, 0.925),
        smoothstep(0.34, 0.68, anycapLuma)
      );
      diffuseColor.rgb = mix(anycapMonochrome, diffuseColor.rgb, anycapGreen);`,
    );
  };
  polished.customProgramCacheKey = () => "anycap-polished-robot-v1";

  for (const texture of [
    polished.map,
    polished.normalMap,
    polished.roughnessMap,
    polished.metalnessMap,
  ]) {
    if (!texture) continue;
    texture.anisotropy = anisotropy;
    texture.magFilter = LinearFilter;
    texture.minFilter = LinearMipmapLinearFilter;
    texture.generateMipmaps = true;
    texture.needsUpdate = true;
  }

  polished.needsUpdate = true;
  return polished;
}

function prepareRobot(source: Object3D, anisotropy: number): Object3D {
  const scene = clone(source);
  const materialCache = new Map<MeshStandardMaterial, MeshPhysicalMaterial>();

  for (const name of modelContract.requiredNodes) {
    if (!scene.getObjectByName(name)) {
      throw new Error(`Futuristic robot is missing ${name}`);
    }
  }

  for (const decoration of ["Cube", "Icosphere"]) {
    const object = scene.getObjectByName(decoration);
    if (object) object.visible = false;
  }

  scene.traverse((object) => {
    if (!(object instanceof Mesh)) return;
    object.castShadow = true;
    object.receiveShadow = true;
    const materials = Array.isArray(object.material)
      ? object.material
      : [object.material];
    const polished = materials.map((material) => {
      if (!(material instanceof MeshStandardMaterial)) return material;
      const cached = materialCache.get(material);
      if (cached) return cached;
      const next = polishMaterial(material, anisotropy);
      materialCache.set(material, next);
      return next;
    });
    object.material = Array.isArray(object.material) ? polished : polished[0];
  });

  applyShowcasePose(scene);
  scene.updateMatrixWorld(true);
  return scene;
}

function prepareHeadRig(scene: Object3D): HeadRig {
  const head = scene.getObjectByName("Head");
  const neck = scene.getObjectByName("neck");
  if (!head || !neck) {
    throw new Error("Futuristic robot requires Head and neck bones");
  }
  return {
    head,
    neck,
    headRest: head.quaternion.clone(),
    neckRest: neck.quaternion.clone(),
  };
}

export function FuturisticRobotRig({
  active,
  pointer,
  onReady,
}: FuturisticRobotRigProps) {
  const gltf = useLoader(GLTFLoader, MODEL_URL);
  const gl = useThree((state) => state.gl);
  const anisotropy = gl.capabilities.getMaxAnisotropy();
  const scene = useMemo(
    () => prepareRobot(gltf.scene, anisotropy),
    [anisotropy, gltf.scene],
  );
  const rig = useMemo(() => prepareHeadRig(scene), [scene]);
  const invalidate = useThree((state) => state.invalidate);
  const euler = useRef(new Euler(0, 0, 0, "YXZ"));
  const deltaRotation = useRef(new Quaternion());
  const headTarget = useRef(new Quaternion());
  const neckTarget = useRef(new Quaternion());
  const ready = useRef(false);

  useEffect(() => {
    invalidate();
  }, [invalidate]);

  useFrame((_state, delta) => {
    const tracked = pointer.current;
    const inside = active && tracked.x > -1.5;
    const yaw = inside
      ? MathUtils.clamp(
          (tracked.x - HEAD_SCREEN_CENTER.x) / 0.5,
          -1,
          1,
        ) * MAX_YAW
      : 0;
    const pitch = inside
      ? MathUtils.clamp(
          (tracked.y - HEAD_SCREEN_CENTER.y) / 0.62,
          -1,
          1,
        ) * MAX_PITCH
      : 0;

    euler.current.set(pitch * 0.8, yaw * 0.82, 0, "YXZ");
    deltaRotation.current.setFromEuler(euler.current);
    headTarget.current.copy(rig.headRest).multiply(deltaRotation.current);

    euler.current.set(pitch * 0.2, yaw * 0.18, 0, "YXZ");
    deltaRotation.current.setFromEuler(euler.current);
    neckTarget.current.copy(rig.neckRest).multiply(deltaRotation.current);

    const alpha = 1 - Math.exp(-10 * Math.min(delta, 1 / 20));
    rig.head.quaternion.slerp(headTarget.current, alpha);
    rig.neck.quaternion.slerp(neckTarget.current, alpha);

    const unsettled =
      rig.head.quaternion.angleTo(headTarget.current) > 0.0005 ||
      rig.neck.quaternion.angleTo(neckTarget.current) > 0.0005;
    if (unsettled) invalidate();

    if (!ready.current) {
      ready.current = true;
      onReady();
    }
  });

  return (
    <group
      position={
        modelContract.normalization.offset as [number, number, number]
      }
      scale={modelContract.normalization.scale}
    >
      <primitive object={scene} dispose={null} />
    </group>
  );
}
