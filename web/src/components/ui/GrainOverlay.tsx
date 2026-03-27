"use client";

import { useEffect, useRef } from "react";

/**
 * Generates a canvas-based noise texture and tiles it across the viewport.
 * Creates a visible paper-grain effect — printed, not digital.
 */
export function GrainOverlay({ opacity = 0.07 }: { opacity?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const canvas = document.createElement("canvas");
    const size = 200;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imageData = ctx.createImageData(size, size);
    const d = imageData.data;
    for (let i = 0; i < d.length; i += 4) {
      const v = Math.random() * 255;
      d[i] = v;
      d[i + 1] = v;
      d[i + 2] = v;
      d[i + 3] = 255;
    }
    ctx.putImageData(imageData, 0, 0);

    el.style.backgroundImage = `url(${canvas.toDataURL("image/png")})`;
    el.style.backgroundRepeat = "repeat";
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-50"
      style={{ opacity, mixBlendMode: "multiply" }}
    />
  );
}
