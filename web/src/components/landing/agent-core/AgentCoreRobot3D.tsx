"use client";

import { RoundedBox } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useRef, useState } from "react";
import type { Group, MeshStandardMaterial } from "three";

import {
  mapCoreInstallPose,
  mapHeadTarget,
  smoothAgentCoreValue,
  type AgentCore3DBridge,
} from "./agent-core-3d-state";

const IVORY = "#e7e5da";
const IVORY_SHADOW = "#c8c8bd";
const CHARCOAL = "#181b17";
const OLIVE = "#6b7d3a";
const OLIVE_DARK = "#344021";

type AgentCoreRobot3DProps = {
  bridge: AgentCore3DBridge;
};

type AgentCoreCanvasLeafProps = AgentCoreRobot3DProps & {
  fallback: React.ReactNode;
  dprCap: number;
};

function ShellMaterial({ color = IVORY }: { color?: string }) {
  return <meshStandardMaterial color={color} roughness={0.82} metalness={0.04} />;
}

function JointMaterial() {
  return <meshStandardMaterial color={CHARCOAL} roughness={0.74} metalness={0.12} />;
}

function Torso() {
  return (
    <group name="Torso">
      <RoundedBox args={[2.55, 2.55, 0.92]} radius={0.42} smoothness={5} position={[0, -0.72, 0]}>
        <ShellMaterial />
      </RoundedBox>
      <RoundedBox
        args={[3.35, 0.78, 0.86]}
        radius={0.36}
        smoothness={5}
        position={[0, 0.18, -0.02]}
      >
        <ShellMaterial color={IVORY_SHADOW} />
      </RoundedBox>
      <mesh position={[-1.55, -0.7, -0.08]} rotation={[0, 0, -0.12]}>
        <capsuleGeometry args={[0.4, 1.25, 8, 18]} />
        <ShellMaterial />
      </mesh>
      <mesh position={[1.55, -0.7, -0.08]} rotation={[0, 0, 0.12]}>
        <capsuleGeometry args={[0.4, 1.25, 8, 18]} />
        <ShellMaterial />
      </mesh>
      <mesh position={[0, 0.76, -0.05]}>
        <cylinderGeometry args={[0.42, 0.5, 0.75, 20]} />
        <JointMaterial />
      </mesh>
      <mesh position={[0, -0.54, 0.49]}>
        <boxGeometry args={[0.018, 1.64, 0.018]} />
        <meshStandardMaterial color={OLIVE_DARK} roughness={0.75} />
      </mesh>
    </group>
  );
}

function Head({ visorMaterialRef }: { visorMaterialRef: React.RefObject<MeshStandardMaterial | null> }) {
  return (
    <group name="Head" position={[0, 1.47, 0]}>
      <mesh scale={[0.8, 0.98, 0.72]}>
        <sphereGeometry args={[0.94, 40, 28]} />
        <ShellMaterial />
      </mesh>
      <RoundedBox args={[1.38, 0.3, 0.18]} radius={0.12} smoothness={5} position={[0, 0.08, 0.69]}>
        <JointMaterial />
      </RoundedBox>
      <group name="Visor" position={[0, 0.08, 0.79]}>
        {Array.from({ length: 11 }, (_, index) => (
          <mesh key={index} position={[(index - 5) * 0.104, 0, 0]}>
            <boxGeometry args={[0.065, 0.095, 0.025]} />
            <meshStandardMaterial
              ref={index === 5 ? visorMaterialRef : undefined}
              color={index > 3 && index < 7 ? OLIVE : "#252923"}
              emissive={OLIVE}
              emissiveIntensity={0.04}
              roughness={0.58}
            />
          </mesh>
        ))}
      </group>
      <mesh position={[0.35, 0.46, 0.62]} rotation={[0.08, 0.2, -0.52]}>
        <boxGeometry args={[0.012, 0.72, 0.012]} />
        <meshStandardMaterial color={OLIVE_DARK} roughness={0.78} />
      </mesh>
    </group>
  );
}

function ChestSocket({ layersRef }: { layersRef: React.RefObject<Group | null> }) {
  return (
    <group name="ChestSocket" position={[0, -0.34, 0.62]}>
      <RoundedBox args={[1.12, 1.12, 0.22]} radius={0.14} smoothness={5}>
        <meshStandardMaterial color={IVORY_SHADOW} roughness={0.78} metalness={0.08} />
      </RoundedBox>
      <group ref={layersRef} position={[0, 0, 0.14]}>
        {[0.82, 0.62, 0.42].map((size, index) => (
          <RoundedBox
            key={size}
            args={[size, size, 0.13]}
            radius={0.08}
            smoothness={4}
            position={[0, 0, index * 0.045]}
          >
            <meshStandardMaterial
              color={index === 2 ? OLIVE_DARK : CHARCOAL}
              roughness={0.68}
              metalness={0.14}
            />
          </RoundedBox>
        ))}
      </group>
    </group>
  );
}

function AnyCapCore({
  coreRef,
  accentMaterialRef,
}: {
  coreRef: React.RefObject<Group | null>;
  accentMaterialRef: React.RefObject<MeshStandardMaterial | null>;
}) {
  return (
    <group name="AnyCapCore" ref={coreRef}>
      <RoundedBox args={[0.92, 0.92, 0.24]} radius={0.14} smoothness={5}>
        <meshStandardMaterial color={IVORY} roughness={0.72} metalness={0.08} />
      </RoundedBox>
      {[0.68, 0.48, 0.28].map((size, index) => (
        <RoundedBox
          key={size}
          args={[size, size, 0.18]}
          radius={0.08}
          smoothness={4}
          position={[0, 0, 0.15 + index * 0.06]}
        >
          <meshStandardMaterial
            ref={index === 2 ? accentMaterialRef : undefined}
            color={index === 2 ? OLIVE : index === 1 ? IVORY_SHADOW : CHARCOAL}
            emissive={index === 2 ? OLIVE : CHARCOAL}
            emissiveIntensity={0.02}
            roughness={0.62}
            metalness={0.1}
          />
        </RoundedBox>
      ))}
    </group>
  );
}

export function AgentCoreRobot3D({ bridge }: AgentCoreRobot3DProps) {
  const neckPivotRef = useRef<Group>(null);
  const socketLayersRef = useRef<Group>(null);
  const coreRef = useRef<Group>(null);
  const coreAccentMaterialRef = useRef<MeshStandardMaterial>(null);
  const visorMaterialRef = useRef<MeshStandardMaterial>(null);
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    bridge.sceneActive = true;
    bridge.invalidate = invalidate;
    invalidate();

    return () => {
      bridge.sceneActive = false;
      if (bridge.invalidate === invalidate) bridge.invalidate = null;
    };
  }, [bridge, invalidate]);

  useFrame((_, delta) => {
    const target = mapHeadTarget(bridge.pointerTarget);
    const nextYaw = smoothAgentCoreValue(bridge.pointerCurrent.yaw, target.yaw, delta);
    const nextPitch = smoothAgentCoreValue(bridge.pointerCurrent.pitch, target.pitch, delta);
    const pose = mapCoreInstallPose(bridge.installProgress);

    bridge.pointerCurrent.yaw = nextYaw;
    bridge.pointerCurrent.pitch = nextPitch;

    if (neckPivotRef.current) {
      neckPivotRef.current.rotation.y = nextYaw;
      neckPivotRef.current.rotation.x = nextPitch;
    }
    if (coreRef.current) {
      coreRef.current.position.set(
        pose.position[0] + bridge.dragOffset.x,
        pose.position[1] + bridge.dragOffset.y,
        pose.position[2] + bridge.dragOffset.z,
      );
      coreRef.current.rotation.set(...pose.rotation);
      coreRef.current.scale.setScalar(pose.scale);
    }

    const activation = Math.max(bridge.installProgress, bridge.connected ? 1 : 0);
    if (socketLayersRef.current) {
      socketLayersRef.current.scale.setScalar(1 - activation * 0.08);
    }
    if (coreAccentMaterialRef.current) {
      coreAccentMaterialRef.current.emissiveIntensity = 0.02 + activation * 1.1;
    }
    if (visorMaterialRef.current) {
      visorMaterialRef.current.emissiveIntensity = 0.04 + activation * 0.72;
    }

    const headIsMoving =
      Math.abs(nextYaw - target.yaw) > 0.0002 || Math.abs(nextPitch - target.pitch) > 0.0002;
    if (headIsMoving || (bridge.installProgress > 0 && bridge.installProgress < 1)) invalidate();
  });

  return (
    <group name="RobotRoot" position={[0, 0.08, 0]}>
      <Torso />
      <group name="NeckPivot" ref={neckPivotRef} position={[0, 0.08, 0]}>
        <Head visorMaterialRef={visorMaterialRef} />
      </group>
      <ChestSocket layersRef={socketLayersRef} />
      <AnyCapCore coreRef={coreRef} accentMaterialRef={coreAccentMaterialRef} />
    </group>
  );
}

export function AgentCoreCanvasLeaf({ bridge, fallback, dprCap }: AgentCoreCanvasLeafProps) {
  const [ready, setReady] = useState(false);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {!ready ? (
        <div style={{ position: "absolute", inset: 0 }} aria-hidden="true">
          {fallback}
        </div>
      ) : null}
      <Canvas
        orthographic
        camera={{ position: [0, 0.08, 8], zoom: 104, near: 0.1, far: 30 }}
        frameloop="demand"
        dpr={[1, dprCap]}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        resize={{ debounce: { resize: 0, scroll: 50 } }}
        fallback={fallback}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
          setReady(true);
        }}
        style={{ position: "absolute", inset: 0, background: "transparent" }}
      >
        <ambientLight intensity={1.1} />
        <directionalLight position={[-4, 6, 7]} intensity={2.3} color="#fffdf2" />
        <directionalLight position={[4, 1, 5]} intensity={0.75} color="#c8d4a0" />
        <pointLight position={[0, -0.5, 4]} intensity={0.34} color="#6b7d3a" />
        <Suspense fallback={null}>
          <AgentCoreRobot3D bridge={bridge} />
        </Suspense>
      </Canvas>
    </div>
  );
}
