"use client";

import { useRef, useState, useEffect, useCallback } from "react";

interface DemoVideoProps {
  src: string;
  title: string;
  description?: string;
  autoLoop?: boolean;
  poster?: string;
}

export function DemoVideo({ src, title, description, autoLoop, poster }: DemoVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!isVisible || !video) return;

    video.src = src;
    video.load();

    if (autoLoop) {
      video.play().catch(() => {});
    }
  }, [isVisible, src, autoLoop]);

  const handleCanPlay = useCallback(() => setIsLoaded(true), []);

  return (
    <div>
      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-xl border border-[#d4dbb8]"
        style={{ aspectRatio: "16 / 9" }}
      >
        {poster && !isLoaded && (
          <img
            src={poster}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}

        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#eaecdf]">
            <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#d4dbb8] border-t-[#6b7d3a]" />
          </div>
        )}

        <video
          ref={videoRef}
          className={`w-full transition-opacity duration-500 ${isLoaded ? "opacity-100" : "opacity-0"}`}
          playsInline
          muted={autoLoop}
          loop={autoLoop}
          preload="none"
          aria-label={title}
          onCanPlay={handleCanPlay}
          {...(!autoLoop && isVisible ? { controls: true } : {})}
        />
      </div>
      {description ? (
        <p className="mt-3 text-sm leading-6 text-[#4d5145]">{description}</p>
      ) : null}
    </div>
  );
}
