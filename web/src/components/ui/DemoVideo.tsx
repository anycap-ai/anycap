"use client";

import { useRef, useState, useEffect, useCallback } from "react";

interface DemoVideoProps {
  src: string;
  title: string;
  description?: string;
  autoLoop?: boolean;
  poster?: string;
  aspectRatio?: string;
}

export function DemoVideo({
  src,
  title,
  description,
  autoLoop,
  poster,
  aspectRatio = "16 / 9",
}: DemoVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

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
    if (!isVisible) return;
    setIsLoaded(false);
    setHasError(false);
  }, [isVisible, src]);

  const handleLoadedData = useCallback(() => {
    setIsLoaded(true);
  }, []);
  const handleError = useCallback(() => setHasError(true), []);

  return (
    <div>
      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-xl border border-[#d4dbb8]"
        style={{ aspectRatio }}
      >
        {!isLoaded && !hasError && !poster && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#eaecdf]">
            <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#d4dbb8] border-t-[#6b7d3a]" />
          </div>
        )}

        <video
          key={src}
          className={`h-full w-full object-cover transition-opacity duration-500 ${isLoaded ? "opacity-100" : "opacity-0"}`}
          src={isVisible ? src : undefined}
          poster={poster}
          autoPlay={autoLoop && isVisible}
          playsInline
          muted={autoLoop}
          loop={autoLoop}
          preload={isVisible ? "metadata" : "none"}
          aria-label={title}
          onLoadedData={handleLoadedData}
          onError={handleError}
          controls={isVisible && (!autoLoop || hasError)}
        />
      </div>
      {description ? (
        <p className="mt-3 text-sm leading-6 text-[#4d5145]">{description}</p>
      ) : null}
    </div>
  );
}
