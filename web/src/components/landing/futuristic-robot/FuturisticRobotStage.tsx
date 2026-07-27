"use client";

import { Canvas, useThree } from "@react-three/fiber";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  ACESFilmicToneMapping,
  SRGBColorSpace,
  Vector2,
  type PerspectiveCamera,
} from "three";

import modelContract from "../../../../public/visuals/futuristic-robot/model-contract.json";
import { FuturisticRobotCinematic } from "./FuturisticRobotCinematic";
import styles from "./futuristic-robot.module.css";

const REFERENCE_URL = `/visuals/futuristic-robot/${modelContract.asset.reference}`;
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function ContextLossWatcher({ onError }: { onError: () => void }) {
  const gl = useThree((state) => state.gl);

  useEffect(() => {
    const canvas = gl.domElement;
    const handleContextLoss = (event: Event) => {
      event.preventDefault();
      onError();
    };
    canvas.addEventListener("webglcontextlost", handleContextLoss);
    return () => canvas.removeEventListener("webglcontextlost", handleContextLoss);
  }, [gl, onError]);

  return null;
}

export function FuturisticRobotStage({ onError }: { onError: () => void }) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const pointerRef = useRef(new Vector2(-2, 0));
  const invalidateRef = useRef<(() => void) | null>(null);
  const [active, setActive] = useState(false);
  const [ready, setReady] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const handleReady = useCallback(() => setReady(true), []);

  useEffect(() => {
    const media = window.matchMedia(REDUCED_MOTION_QUERY);
    const updatePreference = () => setReduceMotion(media.matches);
    updatePreference();
    media.addEventListener("change", updatePreference);
    return () => media.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const observer = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { rootMargin: "160px 0px", threshold: 0.05 },
    );
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const bounds = event.currentTarget.getBoundingClientRect();
      pointerRef.current.set(
        ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
        -(((event.clientY - bounds.top) / bounds.height) * 2 - 1),
      );
      invalidateRef.current?.();
    },
    [],
  );

  const handlePointerLeave = useCallback(() => {
    pointerRef.current.set(-2, 0);
    invalidateRef.current?.();
  }, []);

  useEffect(() => {
    const updateFromWindowEvent = (event: MouseEvent | PointerEvent) => {
      const stage = stageRef.current;
      if (!stage) return;
      const bounds = stage.getBoundingClientRect();
      const inside =
        event.clientX >= bounds.left &&
        event.clientX <= bounds.right &&
        event.clientY >= bounds.top &&
        event.clientY <= bounds.bottom;
      if (!inside) {
        pointerRef.current.set(-2, 0);
      } else {
        pointerRef.current.set(
          ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
          -(((event.clientY - bounds.top) / bounds.height) * 2 - 1),
        );
      }
      invalidateRef.current?.();
    };

    window.addEventListener("mousemove", updateFromWindowEvent, {
      passive: true,
    });
    window.addEventListener("pointermove", updateFromWindowEvent, {
      passive: true,
    });
    return () => {
      window.removeEventListener("mousemove", updateFromWindowEvent);
      window.removeEventListener("pointermove", updateFromWindowEvent);
    };
  }, []);

  return (
    <div
      ref={stageRef}
      className={styles.stage}
      aria-hidden="true"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <Image
        className={`${styles.fallback}${ready ? ` ${styles.fallbackHidden}` : ""}`}
        src={REFERENCE_URL}
        alt=""
        fill
        sizes="100vw"
      />
      <div className={`${styles.canvas}${ready ? ` ${styles.canvasReady}` : ""}`}>
        <Canvas
          frameloop="demand"
          dpr={[1, 2]}
          shadows
          camera={{ position: [0, 1.08, 3.65], fov: 27, near: 0.01, far: 20 }}
          gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
          onCreated={({ camera, gl, invalidate }) => {
            gl.outputColorSpace = SRGBColorSpace;
            gl.toneMapping = ACESFilmicToneMapping;
            gl.toneMappingExposure = 0.72;
            (camera as PerspectiveCamera).lookAt(0.74, 0.78, 0);
            camera.updateProjectionMatrix();
            invalidateRef.current = invalidate;
          }}
        >
          <ContextLossWatcher onError={onError} />
          <FuturisticRobotCinematic
            active={active}
            reduceMotion={reduceMotion}
            pointer={pointerRef}
            onReady={handleReady}
          />
        </Canvas>
      </div>
    </div>
  );
}
