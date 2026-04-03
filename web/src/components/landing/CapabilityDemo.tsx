"use client";

import React, { useEffect, useRef, useState } from "react";

const mono = { fontFamily: "var(--font-logo), monospace" } as const;

export interface DemoLine {
  type: "header" | "prompt" | "text" | "tool" | "image" | "video" | "music" | "analysis" | "drive" | "cursor";
  content?: string;
  sub?: string;
  delay: number;
  analysisLines?: string[];
  driveFiles?: { name: string; size: string; date: string; shared?: boolean }[];
}

function ProcessingDot() {
  return (
    <span className="inline-block h-3 w-3 rounded-full border-[1.5px] border-[#808080] border-t-[#8fa34e] animate-spin" />
  );
}

function TypeWriter({ text, speed = 18 }: { text: string; speed?: number }) {
  const [displayed, setDisplayed] = useState("");
  const indexRef = useRef(0);

  useEffect(() => {
    indexRef.current = 0;
    setDisplayed("");
    const timer = setInterval(() => {
      indexRef.current++;
      setDisplayed(text.slice(0, indexRef.current));
      if (indexRef.current >= text.length) clearInterval(timer);
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);

  return <>{displayed}</>;
}

function HighlightAnycap({ text, base }: { text: string; base: string }) {
  const parts = text.split(/(anycap)/g);
  return (
    <>
      {parts.map((part, i) =>
        part === "anycap" ? (
          <span key={i} className="text-[#8fa34e]">
            {part}
          </span>
        ) : (
          <span key={i} style={{ color: base }}>
            {part}
          </span>
        ),
      )}
    </>
  );
}

function ToolCall({ text, base }: { text: string; base: string }) {
  const match = text.match(/^(\w+)(\()(.*)(\))$/);
  if (!match) return <HighlightAnycap text={text} base={base} />;
  const [, func, open, inner, close] = match;
  return (
    <>
      <span className="font-bold" style={{ color: base }}>
        {func}
        {open}
      </span>
      <HighlightAnycap text={inner} base={base} />
      <span className="font-bold" style={{ color: base }}>
        {close}
      </span>
    </>
  );
}

function RevealBlock({ children }: { children: React.ReactNode }) {
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setRevealed(true), 100);
    return () => clearTimeout(timer);
  }, []);
  return (
    <div
      className={`transition-all duration-700 ease-out ${
        revealed ? "opacity-100 max-h-[400px]" : "opacity-0 max-h-0"
      } overflow-hidden`}
    >
      {children}
    </div>
  );
}

function GeneratedImage() {
  return (
    <RevealBlock>
      <div className="my-3 relative aspect-square max-h-[300px] w-full max-w-[300px] overflow-hidden rounded-lg">
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 60% 50% at 50% 55%, #f0ece4 0%, transparent 70%),
              radial-gradient(ellipse 35% 30% at 35% 45%, rgba(107,125,58,0.12) 0%, transparent 60%),
              radial-gradient(ellipse 25% 25% at 65% 50%, rgba(143,163,78,0.08) 0%, transparent 50%),
              linear-gradient(170deg, #f5f2ea 0%, #ede8dc 40%, #e8e2d4 70%, #f0ece4 100%)
            `,
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <div
              className="h-28 w-20 rounded-xl"
              style={{
                background: "linear-gradient(145deg, #1c1f17 0%, #2a2e22 50%, #3a3e32 100%)",
                boxShadow: "0 20px 40px rgba(28,31,23,0.25), 0 8px 16px rgba(28,31,23,0.15)",
              }}
            />
            <div
              className="absolute -bottom-1 left-1/2 h-3 w-16 -translate-x-1/2 rounded-full"
              style={{
                background: "radial-gradient(ellipse, rgba(28,31,23,0.12) 0%, transparent 70%)",
              }}
            />
          </div>
        </div>
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(0deg, #1c1f17 1px, transparent 1px),
              linear-gradient(90deg, #1c1f17 1px, transparent 1px)
            `,
            backgroundSize: "20px 20px",
          }}
        />
      </div>
    </RevealBlock>
  );
}

function GeneratedVideo() {
  return (
    <RevealBlock>
      <div className="my-3 relative h-[180px] w-full max-w-[380px] overflow-hidden rounded-lg">
        <div
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(135deg, #1a2a10 0%, #2a3a18 30%, #1c2e12 60%, #243520 100%)
            `,
          }}
        />
        {/* Horizon line */}
        <div
          className="absolute left-0 right-0"
          style={{
            top: "45%",
            height: "1px",
            background: "linear-gradient(90deg, transparent 5%, rgba(143,163,78,0.3) 30%, rgba(143,163,78,0.5) 50%, rgba(143,163,78,0.3) 70%, transparent 95%)",
          }}
        />
        {/* Subtle mountain silhouettes */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 320 160" preserveAspectRatio="none">
          <path d="M0,90 Q40,50 80,75 Q120,55 160,70 Q200,45 240,65 Q280,50 320,72 L320,160 L0,160 Z" fill="rgba(28,40,20,0.6)" />
          <path d="M0,100 Q60,70 100,85 Q140,65 180,80 Q220,60 260,78 Q300,65 320,80 L320,160 L0,160 Z" fill="rgba(35,50,25,0.5)" />
        </svg>
        {/* Sunset glow */}
        <div
          className="absolute"
          style={{
            top: "30%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "120px",
            height: "60px",
            background: "radial-gradient(ellipse, rgba(212,224,164,0.25) 0%, transparent 70%)",
          }}
        />
        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-full"
            style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
          >
            <svg width="18" height="20" viewBox="0 0 18 20" fill="none">
              <path d="M2 1.5L16 10L2 18.5V1.5Z" fill="#e0e0dc" />
            </svg>
          </div>
        </div>
        {/* Duration badge */}
        <div
          className="absolute bottom-2 right-2 rounded px-2 py-0.5 text-[10px] text-[#e0e0dc]"
          style={{ background: "rgba(0,0,0,0.5)", ...mono }}
        >
          0:05
        </div>
      </div>
    </RevealBlock>
  );
}

function GeneratedMusic() {
  return (
    <RevealBlock>
      <div className="my-3 relative h-[80px] w-full max-w-[380px] overflow-hidden rounded-lg bg-[#141712] px-4 py-3">
        <div className="flex h-full items-end gap-[3px]">
          {Array.from({ length: 40 }).map((_, i) => {
            const h = 20 + Math.sin(i * 0.7) * 30 + Math.cos(i * 1.3) * 20 + (i % 3 === 0 ? 15 : 0);
            return (
              <div
                key={i}
                className="flex-1 rounded-t-[1px]"
                style={{
                  height: `${Math.max(8, Math.min(h, 90))}%`,
                  background: `linear-gradient(to top, #6b7d3a, #8fa34e)`,
                  opacity: 0.6 + Math.sin(i * 0.5) * 0.4,
                  animation: `pulse ${1.5 + (i % 4) * 0.3}s ease-in-out ${i * 0.05}s infinite alternate`,
                }}
              />
            );
          })}
        </div>
        <div
          className="absolute bottom-2 right-3 rounded px-2 py-0.5 text-[10px] text-[#e0e0dc]"
          style={{ background: "rgba(0,0,0,0.5)", ...mono }}
        >
          0:32
        </div>
      </div>
    </RevealBlock>
  );
}

function AnalysisResult({ lines: resultLines }: { lines: string[] }) {
  return (
    <RevealBlock>
      <div className="my-3 max-w-[560px] rounded-lg border border-[#2a2e22] bg-[#141712] px-4 py-3">
        {resultLines.map((line, i) => (
          <p key={i} className="text-[13px] leading-6 text-[#b8cc6e]">
            {line}
          </p>
        ))}
      </div>
    </RevealBlock>
  );
}

function DriveFileList({ files }: { files: { name: string; size: string; date: string; shared?: boolean }[] }) {
  return (
    <RevealBlock>
      <div className="my-3 max-w-[560px] overflow-hidden rounded-lg border border-[#2a2e22] bg-[#141712]">
        <div className="flex gap-4 border-b border-[#2a2e22] px-4 py-2 text-[11px] text-[#6b7d3a]" style={mono}>
          <span className="w-[200px]">Name</span>
          <span className="w-[60px] text-right">Size</span>
          <span className="w-[80px] text-right">Date</span>
          <span className="w-[50px] text-right">Link</span>
        </div>
        {files.map((file, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b border-[#1e221a] px-4 py-2 text-[12px] last:border-b-0"
            style={mono}
          >
            <span className="w-[200px] truncate text-[#d4e0a4]">{file.name}</span>
            <span className="w-[60px] text-right text-[#808080]">{file.size}</span>
            <span className="w-[80px] text-right text-[#808080]">{file.date}</span>
            <span className="w-[50px] text-right">
              {file.shared ? (
                <span className="text-[#8fa34e]">●</span>
              ) : (
                <span className="text-[#3a3e32]">—</span>
              )}
            </span>
          </div>
        ))}
      </div>
    </RevealBlock>
  );
}

export function CapabilityDemo({ lines }: { lines: DemoLine[] }) {
  const [visibleCount, setVisibleCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) setStarted(true);
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started || visibleCount >= lines.length) return;
    const next = lines[visibleCount];
    const timer = setTimeout(() => setVisibleCount((c) => c + 1), next.delay);
    return () => clearTimeout(timer);
  }, [started, visibleCount, lines]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [visibleCount]);

  return (
    <div
      ref={ref}
      className="flex max-w-[720px] flex-col overflow-hidden rounded-lg bg-[#1c1f17] px-5 pb-5 pt-0 text-sm leading-loose md:px-6 md:pb-6"
      style={mono}
    >
      {visibleCount > 0 && (
        <div className="flex items-center gap-2 border-b border-[#2a2e22] py-3">
          <span className="text-[#8fa34e]">✻</span>
          <span className="text-base font-bold tracking-wide text-[#e0e0dc]">
            agent with anycap
          </span>
        </div>
      )}

      <div
        ref={scrollRef}
        className="mt-3 min-h-0 flex-1 overflow-y-auto"
        style={{ scrollbarWidth: "thin", scrollbarColor: "transparent transparent" }}
      >
        {lines.slice(1, visibleCount).map((line, idx) => {
          const i = idx + 1;
          const isLast = i === visibleCount - 1;
          const showSpinner = isLast && visibleCount < lines.length;

          switch (line.type) {
            case "prompt":
              return (
                <div key={i} className="mb-3">
                  <span className="text-[#e0e0dc]">❯ </span>
                  <span className="text-[#e0e0dc]">
                    <TypeWriter text={line.content!} speed={20} />
                  </span>
                </div>
              );
            case "text":
              return (
                <p key={i} className="mb-3 text-[#a0a09c]">
                  {line.sub && <span className="mr-1.5 text-[#8fa34e]">{line.sub}</span>}
                  {line.content}
                </p>
              );
            case "tool":
              return (
                <div key={i} className="mb-3">
                  <div className="flex items-start gap-2">
                    <span className="mt-[1px] text-[#e0e0dc]">●</span>
                    <span className="break-all">
                      <ToolCall text={line.content!} base="#e0e0dc" />
                    </span>
                  </div>
                  {showSpinner && (
                    <div className="ml-5 mt-1">
                      <ProcessingDot />
                    </div>
                  )}
                </div>
              );
            case "image":
              return <GeneratedImage key={i} />;
            case "video":
              return <GeneratedVideo key={i} />;
            case "music":
              return <GeneratedMusic key={i} />;
            case "analysis":
              return <AnalysisResult key={i} lines={line.analysisLines ?? []} />;
            case "drive":
              return <DriveFileList key={i} files={line.driveFiles ?? []} />;
            case "cursor":
              return (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-[#e0e0dc]">❯</span>
                  <span className="inline-block h-[14px] w-[7px] animate-blink bg-[#e0e0dc]" />
                </div>
              );
            default:
              return null;
          }
        })}
        {visibleCount > 0 && visibleCount < lines.length && (
          <div className="mb-3 mt-1">
            <ProcessingDot />
          </div>
        )}
      </div>
    </div>
  );
}
