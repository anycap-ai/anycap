"use client";

import { CapabilityDemo, type DemoLine } from "./CapabilityDemo";

const lines: DemoLine[] = [
  { type: "header", delay: 0 },
  {
    type: "prompt",
    content: "Create a 5-second drone shot flying over mountains at sunset",
    delay: 500,
  },
  {
    type: "text",
    content: "I'll generate a video clip using AnyCap.",
    delay: 800,
  },
  {
    type: "tool",
    content: `run("anycap video generate --prompt 'drone shot flying over mountain range at golden hour sunset' --model veo-3.1 -o mountains.mp4")`,
    delay: 600,
  },
  {
    type: "text",
    content: "Video generated — mountains.mp4 (5s, 1080p, 4.2 MB)",
    sub: "✓",
    delay: 2000,
  },
  { type: "video", delay: 400 },
  {
    type: "text",
    content: "Here's the clip. Smooth camera movement with warm sunset tones.",
    delay: 600,
  },
  { type: "cursor", delay: 500 },
];

export function VideoGenDemo() {
  return <CapabilityDemo lines={lines} />;
}
