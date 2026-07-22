"use client";

import { useEffect, type RefObject } from "react";

import type { AgentCore3DBridge } from "./agent-core-3d-bridge";

const clampNormalized = (value: number) => Math.max(-1, Math.min(1, value));

type Bounds = { left: number; top: number; width: number; height: number };
type Point = { x: number; y: number };

function normalizedCoordinate(value: number, origin: number, size: number): number {
  if (!Number.isFinite(value) || !Number.isFinite(size) || size <= 0) return 0;
  return clampNormalized(((value - origin) / size - 0.5) * 2);
}

export function toAgentCoreDocumentBounds(bounds: Bounds, scroll: Point): Bounds {
  return {
    left: bounds.left + scroll.x,
    top: bounds.top + scroll.y,
    width: bounds.width,
    height: bounds.height,
  };
}

export function normalizeAgentCorePointer(point: Point, bounds: Bounds): Point {
  return {
    x: normalizedCoordinate(point.x, bounds.left, bounds.width),
    y: normalizedCoordinate(point.y, bounds.top, bounds.height),
  };
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
    let bounds = toAgentCoreDocumentBounds(section.getBoundingClientRect(), {
      x: window.scrollX,
      y: window.scrollY,
    });
    let sectionIsVisible = false;

    const deactivatePointer = () => {
      if (!bridge.pointer.active) return;
      bridge.pointer.active = false;
      bridge.invalidate?.();
    };

    const refreshBounds = () => {
      bounds = toAgentCoreDocumentBounds(section.getBoundingClientRect(), {
        x: window.scrollX,
        y: window.scrollY,
      });
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
      const pointer = normalizeAgentCorePointer({ x: event.pageX, y: event.pageY }, bounds);
      bridge.pointer.x = pointer.x * amplitude;
      bridge.pointer.y = pointer.y * amplitude;
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
