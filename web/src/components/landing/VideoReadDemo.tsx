"use client";

import { CapabilityDemo, type DemoLine } from "./CapabilityDemo";

const lines: DemoLine[] = [
  { type: "header", delay: 0 },
  {
    type: "prompt",
    content: "Summarize this bug recording and identify the reproduction steps",
    delay: 500,
  },
  {
    type: "text",
    content: "I'll analyze the recording using AnyCap's video analysis.",
    delay: 800,
  },
  {
    type: "tool",
    content: `run("anycap actions video-read --file ./bug-report.mp4 --instruction 'Summarize key events and identify bug reproduction steps'")`,
    delay: 600,
  },
  {
    type: "text",
    content: "Analysis complete — 12s recording, 4 key events detected.",
    sub: "✓",
    delay: 1800,
  },
  {
    type: "analysis",
    delay: 300,
    analysisLines: [
      "0:00 – User opens Settings panel from the sidebar.",
      "0:03 – Clicks \"Theme\" toggle to switch to dark mode.",
      "0:05 – Modal flashes white for ~200ms before applying the dark background.",
      "0:08 – User closes and reopens Settings — flash repeats on every toggle.",
      "",
      "Bug: theme transition applies to the page before the modal backdrop, causing a visible white flash.",
      "Root cause: likely CSS transition ordering — backdrop delay is longer than content swap.",
    ],
  },
  {
    type: "text",
    content: "The flash happens on every toggle. Looks like a CSS transition ordering issue.",
    delay: 600,
  },
  { type: "cursor", delay: 500 },
];

export function VideoReadDemo() {
  return <CapabilityDemo lines={lines} />;
}
