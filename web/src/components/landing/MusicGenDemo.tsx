"use client";

import { CapabilityDemo, type DemoLine } from "./CapabilityDemo";

const lines: DemoLine[] = [
  { type: "header", delay: 0 },
  {
    type: "prompt",
    content: "Create a lofi background track for a product demo video",
    delay: 500,
  },
  {
    type: "text",
    content: "I'll generate a music track using AnyCap.",
    delay: 800,
  },
  {
    type: "tool",
    content: `run("anycap music generate --prompt 'lofi chill beat, soft piano, warm vinyl texture, relaxed tempo' --model suno-v5 -o lofi-bg.mp3")`,
    delay: 600,
  },
  {
    type: "text",
    content: "Track generated — lofi-bg.mp3 (32s, 1.8 MB)",
    sub: "✓",
    delay: 2000,
  },
  { type: "music", delay: 400 },
  {
    type: "text",
    content: "Here's the track. Soft piano loop with a warm, relaxed feel — ready to layer under your demo.",
    delay: 600,
  },
  { type: "cursor", delay: 500 },
];

export function MusicGenDemo() {
  return <CapabilityDemo lines={lines} />;
}
