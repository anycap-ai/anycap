"use client";

import { useEffect, type RefObject } from "react";

import type { AgentCore3DBridge } from "./agent-core-3d-bridge";

const clampNormalized = (value: number) => Math.max(-1, Math.min(1, value));

function normalizedCoordinate(value: number, origin: number, size: number): number {
  if (!Number.isFinite(value) || !Number.isFinite(size) || size <= 0) return 0;
  return clampNormalized(((value - origin) / size - 0.5) * 2);
}

export function useAgentCoreGaze3D(
  sectionRef: RefObject<HTMLElement | null>,
  bridge: AgentCore3DBridge,
  enabled: boolean,
) {
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !enabled) {
      bridge.pointer.active = false;
      return;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) {
      bridge.pointer.active = false;
      bridge.invalidate?.();
      return;
    }

    const finePointer = window.matchMedia("(any-pointer: fine)");
    let bounds = section.getBoundingClientRect();
    let sectionIsVisible = false;

    const deactivatePointer = () => {
      if (!bridge.pointer.active) return;
      bridge.pointer.active = false;
      bridge.invalidate?.();
    };

    const refreshBounds = () => {
      bounds = section.getBoundingClientRect();
    };

    const onPointerMove = (event: PointerEvent) => {
      const { phase, gazeMode } = bridge;
      const isFinePointerEvent =
        event.isPrimary && (event.pointerType === "mouse" || event.pointerType === "pen");
      if (
        !sectionIsVisible ||
        !finePointer.matches ||
        !isFinePointerEvent ||
        gazeMode !== "user"
      ) {
        if (gazeMode !== "user") deactivatePointer();
        return;
      }

      const amplitude = phase === "connected" ? 0.6 : 1;
      bridge.pointer.x = normalizedCoordinate(event.clientX, bounds.left, bounds.width) * amplitude;
      bridge.pointer.y = normalizedCoordinate(event.clientY, bounds.top, bounds.height) * amplitude;
      bridge.pointer.active = true;
      bridge.invalidate?.();
    };

    const onPointerLeave = () => deactivatePointer();
    const observer = new IntersectionObserver(
      ([entry]) => {
        sectionIsVisible = entry?.isIntersecting ?? false;
        if (sectionIsVisible) refreshBounds();
        else deactivatePointer();
      },
      { threshold: 0.08 },
    );

    observer.observe(section);
    section.addEventListener("pointermove", onPointerMove, { passive: true });
    section.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("resize", refreshBounds, { passive: true });

    return () => {
      section.removeEventListener("pointermove", onPointerMove);
      section.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("resize", refreshBounds);
      observer.disconnect();
      deactivatePointer();
    };
  }, [bridge, enabled, sectionRef]);
}
