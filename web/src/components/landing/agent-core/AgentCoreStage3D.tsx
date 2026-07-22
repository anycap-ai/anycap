"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useRef, useState } from "react";
import {
  ACESFilmicToneMapping,
  SRGBColorSpace,
  type PerspectiveCamera,
} from "three";

import type { AgentCore3DBridge } from "./agent-core-3d-bridge";
import { AgentCoreRig3D } from "./AgentCoreRig3D";
import styles from "./agent-core.module.css";

type AgentCoreStage3DProps = {
  bridge: AgentCore3DBridge;
  ready: boolean;
  onReady: () => void;
  onError: () => void;
};

const MOBILE_QUERY = "(max-width: 767px)";

export function AgentCoreStage3D({ bridge, ready, onReady, onError }: AgentCoreStage3DProps) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const stageHealthy = useRef(true);
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.matchMedia(MOBILE_QUERY).matches,
  );

  useEffect(() => {
    const mobileQuery = window.matchMedia(MOBILE_QUERY);
    const updateMobile = () => setIsMobile(mobileQuery.matches);
    updateMobile();
    mobileQuery.addEventListener("change", updateMobile);
    return () => mobileQuery.removeEventListener("change", updateMobile);
  }, []);

  useEffect(() => {
    const canvas = stageRef.current?.querySelector("canvas");
    if (!canvas) {
      stageHealthy.current = false;
      onError();
      return;
    }

    const handleContextLoss = (event: Event) => {
      event.preventDefault();
      stageRef.current?.classList.remove(styles.stageReady);
      stageHealthy.current = false;
      onError();
      bridge.invalidate = null;
    };
    canvas.addEventListener("webglcontextlost", handleContextLoss);
    return () => canvas.removeEventListener("webglcontextlost", handleContextLoss);
  }, [bridge, onError]);

  const handleRigReady = () => {
    if (stageHealthy.current) onReady();
  };

  return (
    <div
      ref={stageRef}
      className={`${styles.stage3D}${ready ? ` ${styles.stageReady}` : ""}`}
      aria-hidden="true"
    >
      <Canvas
        frameloop="demand"
        dpr={isMobile ? [1, 1.25] : [1, 1.5]}
        camera={{ position: [0, 0.51, 2.3], fov: 32, near: 0.01, far: 20 }}
        gl={{ alpha: true, antialias: !isMobile, powerPreference: "high-performance" }}
        onCreated={({ camera, gl }) => {
          gl.outputColorSpace = SRGBColorSpace;
          gl.toneMapping = ACESFilmicToneMapping;
          gl.toneMappingExposure = 0.95;
          (camera as PerspectiveCamera).lookAt(0, 0.5, 0);
          camera.updateProjectionMatrix();
        }}
      >
        <ambientLight intensity={1.35} />
        <hemisphereLight args={["#f4f5f0", "#8f927f", 1.15]} />
        <directionalLight position={[-2.4, 3.2, 3.6]} intensity={2.4} />
        <directionalLight position={[2.8, 1.4, 1.8]} intensity={1.1} />
        <Suspense fallback={null}>
          <AgentCoreRig3D bridge={bridge} onReady={handleRigReady} />
        </Suspense>
      </Canvas>
    </div>
  );
}
