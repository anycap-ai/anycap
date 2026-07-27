"use client";

import { useEffect } from "react";

export function CapabilityMarqueeActivityController() {
  useEffect(() => {
    const cleanups: Array<() => void> = [];

    document
      .querySelectorAll<HTMLElement>("[data-capability-marquee]")
      .forEach((marquee) => {
        const activityObserver = new IntersectionObserver(
          ([entry]) => {
            marquee.dataset.marqueeActive = entry.isIntersecting
              ? "true"
              : "false";
          },
          { rootMargin: "160px 0px", threshold: 0.01 },
        );
        activityObserver.observe(marquee);
        cleanups.push(() => {
          activityObserver.disconnect();
          delete marquee.dataset.marqueeActive;
        });
      });

    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }, []);

  return null;
}
