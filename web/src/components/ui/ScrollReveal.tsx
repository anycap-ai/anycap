"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { ReactNode } from "react";
import { useRef } from "react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  from?: "bottom" | "left" | "right";
  delay?: number;
}

const offsetByDirection = {
  bottom: { x: 0, y: 28 },
  left: { x: -32, y: 0 },
  right: { x: 32, y: 0 },
} as const;

export function ScrollReveal({
  children,
  className = "",
  from = "bottom",
  delay = 0,
}: ScrollRevealProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const element = rootRef.current;
      if (!element) {
        return;
      }

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(element, { clearProps: "all" });
        return;
      }

      const offset = offsetByDirection[from];
      gsap.fromTo(
        element,
        {
          autoAlpha: 0,
          x: offset.x,
          y: offset.y,
          willChange: "transform,opacity",
        },
        {
          autoAlpha: 1,
          x: 0,
          y: 0,
          duration: 0.78,
          delay: Math.min(delay, 240) / 1000,
          ease: "power3.out",
          clearProps: "transform,opacity,visibility,willChange",
          scrollTrigger: {
            trigger: element,
            start: "top 88%",
            once: true,
          },
        },
      );
    },
    { scope: rootRef, dependencies: [delay, from] },
  );

  return (
    <div ref={rootRef} className={className} data-scroll-reveal={from}>
      {children}
    </div>
  );
}
