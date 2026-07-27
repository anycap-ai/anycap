"use client";

import {
  ContactShadows,
  Environment,
  Lightformer,
  RoundedBox,
} from "@react-three/drei";
import { type MutableRefObject } from "react";
import { Vector2 } from "three";

import { FuturisticRobotRig } from "./FuturisticRobotRig";

type FuturisticRobotCinematicProps = {
  active: boolean;
  reduceMotion: boolean;
  pointer: MutableRefObject<Vector2>;
  onReady: () => void;
};

function CoreDevice() {
  return (
    <group
      position={[0.5, 0.44, 0.9]}
      rotation={[-0.04, 0, 0]}
      scale={0.62}
    >
      <RoundedBox args={[0.46, 0.46, 0.12]} radius={0.055} smoothness={6}>
        <meshPhysicalMaterial
          color="#f7f7f2"
          roughness={0.2}
          metalness={0.08}
          clearcoat={0.35}
          clearcoatRoughness={0.12}
        />
      </RoundedBox>
      <RoundedBox
        args={[0.35, 0.35, 0.135]}
        radius={0.045}
        smoothness={6}
        position={[0, 0, 0.015]}
      >
        <meshPhysicalMaterial
          color="#141711"
          roughness={0.22}
          metalness={0.32}
          clearcoat={0.28}
        />
      </RoundedBox>
      <RoundedBox
        args={[0.245, 0.245, 0.15]}
        radius={0.034}
        smoothness={6}
        position={[0, 0, 0.03]}
      >
        <meshPhysicalMaterial
          color="#eef1df"
          emissive="#aebe6a"
          emissiveIntensity={0.34}
          roughness={0.16}
          metalness={0.06}
          clearcoat={0.38}
        />
      </RoundedBox>
      <RoundedBox
        args={[0.115, 0.115, 0.165]}
        radius={0.022}
        smoothness={6}
        position={[0, 0, 0.045]}
      >
        <meshPhysicalMaterial
          color="#718044"
          emissive="#8fa34e"
          emissiveIntensity={0.24}
          roughness={0.36}
        />
      </RoundedBox>
      <RoundedBox
        args={[0.56, 0.055, 0.26]}
        radius={0.025}
        smoothness={5}
        position={[0, -0.27, -0.01]}
      >
        <meshPhysicalMaterial
          color="#f8f8f4"
          roughness={0.22}
          metalness={0.05}
          clearcoat={0.25}
        />
      </RoundedBox>
    </group>
  );
}

function StudioSet() {
  return (
    <>
      <RoundedBox
        args={[4.2, 0.09, 1.5]}
        radius={0.035}
        smoothness={5}
        position={[0.82, -0.12, 0.22]}
      >
        <meshPhysicalMaterial
          color="#f7f7f3"
          roughness={0.18}
          metalness={0.035}
          clearcoat={0.32}
          clearcoatRoughness={0.1}
        />
      </RoundedBox>
      <CoreDevice />
      <ContactShadows
        position={[0.82, -0.065, 0.22]}
        opacity={0.18}
        scale={4}
        blur={2.7}
        far={2}
        resolution={512}
        color="#8f9188"
      />
    </>
  );
}

export function FuturisticRobotCinematic({
  active,
  pointer,
  onReady,
}: FuturisticRobotCinematicProps) {
  return (
    <>
      <ambientLight intensity={0.2} />
      <hemisphereLight args={["#fffefa", "#3a3e35", 0.68]} />
      <rectAreaLight
        position={[-2.8, 4.8, 4.5]}
        rotation={[-0.55, -0.45, 0]}
        intensity={2.1}
        width={4.5}
        height={4.5}
        color="#fffdf8"
      />
      <directionalLight
        position={[-4.5, 5.5, 4]}
        intensity={0.82}
        color="#fffdf8"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0004}
      />
      <directionalLight
        position={[4.5, 2.5, 3.5]}
        intensity={0.38}
        color="#e9eddc"
      />
      <directionalLight
        position={[1.5, 4.5, -4]}
        intensity={0.58}
        color="#ffffff"
      />
      <Environment resolution={128}>
        <Lightformer
          form="rect"
          intensity={0.9}
          color="#fffdf8"
          position={[-3, 3, 3]}
          scale={[3, 3, 1]}
        />
        <Lightformer
          form="rect"
          intensity={0.48}
          color="#e9eddc"
          position={[4, 1, 2]}
          scale={[2, 4, 1]}
        />
        <Lightformer
          form="ring"
          intensity={0.42}
          color="#ffffff"
          position={[0, 4, -4]}
          scale={3}
        />
      </Environment>
      <StudioSet />
      <FuturisticRobotRig
        active={active}
        pointer={pointer}
        onReady={onReady}
      />
    </>
  );
}
