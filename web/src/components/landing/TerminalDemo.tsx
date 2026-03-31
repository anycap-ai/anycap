"use client";

import React, { useEffect, useRef, useState } from "react";

const mono = { fontFamily: "var(--font-logo), monospace" } as const;

interface Line {
  type: "header" | "prompt" | "text" | "tool" | "result" | "cursor";
  content?: string;
  sub?: string;
  delay: number; // ms after previous line
  parallel?: boolean; // part of a parallel tool group
}

const lines: Line[] = [
  { type: "header", delay: 0 },
  { type: "prompt", content: "Create a 30-second launch video for AnyCap from scratch", delay: 500 },
  { type: "text", content: "On it. I'll generate art, produce clips, score it, and publish.", delay: 1000 },
  { type: "tool", content: 'load_skill("anycap")', sub: "image · video · music · vision · drive", delay: 700 },

  { type: "text", content: "Generating 3 concept images in parallel.", delay: 600 },
  { type: "tool", parallel: true, content: `run("anycap image generate --prompt 'product hero, minimalist'")`, sub: "✓ cdn.anycap.cloud/img/a3f…", delay: 300 },
  { type: "tool", parallel: true, content: `run("anycap image generate --prompt 'agent workflow, clean lines'")`, sub: "✓ cdn.anycap.cloud/img/b7e…", delay: 200 },
  { type: "tool", parallel: true, content: `run("anycap image generate --prompt 'capability unlock, before-after'")`, sub: "✓ cdn.anycap.cloud/img/c9d…", delay: 200 },

  { type: "text", content: "Analyzing compositions to pick the best shots.", delay: 700 },
  { type: "tool", parallel: true, content: `run("anycap actions image-read --file a3f.png --instruction 'rate composition'")`, sub: '✓ "Clean depth, strong focus — 9/10"', delay: 300 },
  { type: "tool", parallel: true, content: `run("anycap actions image-read --file b7e.png --instruction 'rate composition'")`, sub: '✓ "Busy background — 6/10"', delay: 200 },
  { type: "tool", parallel: true, content: `run("anycap actions image-read --file c9d.png --instruction 'rate composition'")`, sub: '✓ "Dynamic layout, vivid color — 8/10"', delay: 200 },

  { type: "text", content: "Top 2 selected. Generating video clips.", delay: 700 },
  { type: "tool", parallel: true, content: `run("anycap video generate --prompt 'zoom into product hero' --file a3f.png")`, sub: "✓ cdn.anycap.cloud/vid/d4a…", delay: 300 },
  { type: "tool", parallel: true, content: `run("anycap video generate --prompt 'diagram comes alive' --file c9d.png")`, sub: "✓ cdn.anycap.cloud/vid/e8b…", delay: 200 },

  { type: "text", content: "Reviewing clips for pacing.", delay: 700 },
  { type: "tool", parallel: true, content: `run("anycap actions video-read --file d4a.mp4 --instruction 'check pacing'")`, sub: '✓ "Smooth 4s zoom, clean transition"', delay: 300 },
  { type: "tool", parallel: true, content: `run("anycap actions video-read --file e8b.mp4 --instruction 'check pacing'")`, sub: '✓ "Fluid 6s motion, good rhythm"', delay: 200 },

  { type: "text", content: "Generating background music.", delay: 700 },
  { type: "tool", content: `run("anycap music generate --prompt 'upbeat minimal tech, 30s' --tags electronic")`, sub: "✓ cdn.anycap.cloud/music/f2c…", delay: 900 },

  { type: "text", content: "Composing final cut with ffmpeg.", delay: 600 },
  { type: "tool", content: `run("ffmpeg -i d4a.mp4 -i e8b.mp4 -i f2c.mp3 -filter_complex concat out.mp4")`, sub: "✓ launch.mp4 — 30s, 1080p, 24.8 MB", delay: 900 },

  { type: "text", content: "Uploading and sharing.", delay: 600 },
  { type: "tool", content: `run("anycap drive upload launch.mp4")`, sub: "✓ dn_xKmP… uploaded", delay: 500 },
  { type: "tool", content: `run("anycap drive share dn_xKmP…")`, sub: "✓ https://drive.anycap.cloud/s/Qr7t…", delay: 500 },

  { type: "text", content: "Your launch video is live. Share link copied.", delay: 700 },
  { type: "cursor", delay: 500 },
];

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

/** Lines 0 (header) through PINNED_END-1 are pinned above the scroll area */
const PINNED_END = 4; // header(0) + prompt(1) + text(2) + load_skill(3)

function renderLine(line: Line, i: number, _isLast: boolean, showSpinner: boolean) {
  const nextLine = lines[i + 1];
  const isLastParallel = line.parallel && (!nextLine || !nextLine.parallel);
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
        <p key={i} className="text-[#a0a09c] mb-3">
          {line.content}
        </p>
      );
    case "tool":
      return (
        <div
          key={i}
          className={
            line.parallel
              ? `border-l-2 border-[#3a4a28] pl-3 ${isLastParallel ? "mb-3" : "mb-1"}`
              : "mb-3"
          }
        >
          <div className="flex items-start gap-2">
            <span className="text-[#e0e0dc] mt-[1px]">●</span>
            <span><ToolCall text={line.content!} base="#e0e0dc" /></span>
          </div>
          {!showSpinner && line.sub && (
            <p className="text-[#808080] ml-5 mt-1">{line.sub}</p>
          )}
        </div>
      );
    case "cursor":
      return (
        <div key={i} className="flex items-center gap-2">
          <span className="text-[#e0e0dc]">❯</span>
          <span className="inline-block w-[7px] h-[14px] bg-[#e0e0dc] animate-blink" />
        </div>
      );
    default:
      return null;
  }
}

export function TerminalDemo({ headerRight }: { headerRight?: React.ReactNode }) {
  const [visibleCount, setVisibleCount] = useState(0);
  const [started, setStarted] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

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

  // Auto-scroll to bottom as lines appear
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [visibleCount]);

  const handleClick = () => {
    window.dispatchEvent(new CustomEvent("openEquipModal"));
  };

  return (
    <div
      ref={ref}
      className="relative flex min-h-0 flex-1 flex-col max-w-[800px] text-sm md:text-base leading-loose cursor-pointer"
      style={mono}
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={(e) => {
        const rect = ref.current?.getBoundingClientRect();
        if (rect) setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      }}
    >
      <style>{`
        .terminal-scroll::-webkit-scrollbar { width: 6px; }
        .terminal-scroll::-webkit-scrollbar-track { background: transparent; }
        .terminal-scroll::-webkit-scrollbar-thumb { background: transparent; border-radius: 3px; }
        .terminal-scroll:hover::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.18); }
        .terminal-scroll { scrollbar-width: thin; scrollbar-color: transparent transparent; }
        .terminal-scroll:hover { scrollbar-color: rgba(255,255,255,0.18) transparent; }
      `}</style>
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
      {/* Header — pinned */}
      {visibleCount > 0 && (
        <div className="flex items-center gap-2 mb-2 border-b border-[#2a2e22]">
          <span className="text-[#8fa34e]">✻</span>
          <span className="text-[#e0e0dc] text-base tracking-wide font-bold">agent with anycap</span>
          {headerRight && <div className="ml-auto">{headerRight}</div>}
        </div>
      )}
      {/* Pinned intro: prompt + text + load_skill (lines 1-3) */}
      {visibleCount > 1 && (
        <div className="shrink-0">
          {lines.slice(1, Math.min(visibleCount, PINNED_END)).map((line, idx) => {
            const i = idx + 1;
            const isLast = i === visibleCount - 1;
            const showSpinner = isLast && visibleCount < lines.length;
            return renderLine(line, i, isLast, showSpinner);
          })}
        </div>
      )}
      {/* Scrollable content (everything after pinned lines) */}
      <div ref={scrollRef} className="terminal-scroll min-h-0 flex-1 overflow-y-auto">
        {visibleCount > PINNED_END && lines.slice(PINNED_END, visibleCount).map((line, idx) => {
          const i = idx + PINNED_END;
          const isLast = i === visibleCount - 1;
          const showSpinner = isLast && visibleCount < lines.length;
          return renderLine(line, i, isLast, showSpinner);
        })}
        {visibleCount > 0 && visibleCount < lines.length && (
          <div className="mt-1 mb-3">
            <ProcessingDot />
          </div>
        )}
      </div>
    </div>
  );
}
