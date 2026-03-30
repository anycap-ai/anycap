"use client";

import React, { useEffect, useRef, useState } from "react";

const mono = { fontFamily: "var(--font-logo), monospace" } as const;

interface Line {
  type: "header" | "prompt" | "text" | "tool" | "result" | "cursor";
  content?: string;
  sub?: string;
  delay: number; // ms after previous line
}

const lines: Line[] = [
  { type: "header", delay: 0 },
  { type: "prompt", content: "Generate an image of a paper crane in morning light", delay: 300 },
  { type: "text", content: "I'll use AnyCap to generate this. Let me load the skill first.", delay: 600 },
  { type: "tool", content: 'load_skill("anycap")', sub: "image gen · video gen · vision · video analysis", delay: 400 },
  { type: "text", content: "Found image capability. Generating now.", delay: 500 },
  { type: "tool", content: `run("anycap image generate --prompt 'paper crane in morning light'")`, sub: '✓ { status: "success", url: "cdn.anycap.cloud/img/a3f…" }', delay: 400 },
  { type: "text", content: "Done. Image generated and saved.", delay: 800 },
  { type: "cursor", delay: 400 },
];

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

/** Render text with "anycap" highlighted in green, rest in base color */
function HighlightAnycap({ text, base }: { text: string; base: string }) {
  const parts = text.split(/(anycap)/g);
  return (
    <>
      {parts.map((part, i) =>
        part === "anycap" ? (
          <span key={i} className="text-[#8fa34e]">{part}</span>
        ) : (
          <span key={i} style={{ color: base }}>{part}</span>
        )
      )}
    </>
  );
}

/** Render tool call: func name + parens bold, quotes and inner content normal, "anycap" green */
function ToolCall({ text, base }: { text: string; base: string }) {
  const match = text.match(/^(\w+)(\()(.*)(\))$/);
  if (!match) return <HighlightAnycap text={text} base={base} />;
  const [, func, open, inner, close] = match;
  return (
    <>
      <span className="font-bold" style={{ color: base }}>{func}{open}</span>
      <HighlightAnycap text={inner} base={base} />
      <span className="font-bold" style={{ color: base }}>{close}</span>
    </>
  );
}

export function TerminalDemo({ headerRight }: { headerRight?: React.ReactNode }) {
  const [visibleCount, setVisibleCount] = useState(0);
  const [started, setStarted] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);

  // Trigger on scroll into view
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) setStarted(true);
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [started]);

  // Reveal lines sequentially
  useEffect(() => {
    if (!started || visibleCount >= lines.length) return;
    const next = lines[visibleCount];
    const timer = setTimeout(() => setVisibleCount((c) => c + 1), next.delay);
    return () => clearTimeout(timer);
  }, [started, visibleCount]);

  const handleClick = () => {
    window.dispatchEvent(new CustomEvent("openEquipModal"));
  };

  return (
    <div
      ref={ref}
      className="relative max-w-[800px] text-sm md:text-base leading-loose cursor-pointer"
      style={mono}
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={(e) => {
        const rect = ref.current?.getBoundingClientRect();
        if (rect) setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      }}
    >
      {/* Hover tooltip — follows mouse, hidden on touch/mobile */}
      <div
        className={`absolute z-10 hidden md:flex items-center gap-2 px-4 py-2 bg-white/95 rounded-full shadow-lg pointer-events-none transition-opacity duration-150 ${
          hovered ? "opacity-100" : "opacity-0"
        }`}
        style={{ left: mousePos.x + 12, top: mousePos.y - 16 }}
      >
        <span className="text-[#6b7d3a] text-xs">✻</span>
        <span className="text-[#1c1f17] text-[11px] tracking-[0.3px] whitespace-nowrap" style={mono}>
          Click to set up with your agent
        </span>
      </div>
      {lines.map((line, i) => {
        const shown = i < visibleCount;
        const hide = shown ? "" : " invisible";
        switch (line.type) {
          case "header":
            return (
              <div key={i} className={`flex items-center gap-2 mb-2 border-b border-[#2a2e22]${hide}`}>
                <span className="text-[#8fa34e]">✻</span>
                <span className="text-[#e0e0dc] text-base tracking-wide font-bold">agent with anycap</span>
                {headerRight && <div className="ml-auto">{headerRight}</div>}
              </div>
            );
          case "prompt":
            return (
              <div key={i} className={`mb-6${hide}`}>
                <span className="text-[#e0e0dc]">❯ </span>
                <span className="text-[#e0e0dc]">
                  {shown ? <TypeWriter text={line.content!} speed={20} /> : line.content}
                </span>
              </div>
            );
          case "text":
            return (
              <p key={i} className={`text-[#a0a09c] mb-6${hide}`}>
                {line.content}
              </p>
            );
          case "tool":
            return (
              <div key={i} className={`mb-6${hide}`}>
                <div className="flex items-start gap-2">
                  <span className="text-[#e0e0dc] mt-[1px]">●</span>
                  <span><ToolCall text={line.content!} base="#e0e0dc" /></span>
                </div>
                {line.sub && (
                  <p className="text-[#808080] ml-5 mt-1">{line.sub}</p>
                )}
              </div>
            );
          case "cursor":
            return (
              <div key={i} className={`flex items-center gap-2${hide}`}>
                <span className="text-[#e0e0dc]">❯</span>
                <span className="inline-block w-[7px] h-[14px] bg-[#e0e0dc] animate-blink" />
              </div>
            );
        }
      })}
    </div>
  );
}
