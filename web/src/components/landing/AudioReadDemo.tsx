"use client";

import { CapabilityDemo, type DemoLine } from "./CapabilityDemo";

const lines: DemoLine[] = [
  { type: "header", delay: 0 },
  {
    type: "prompt",
    content: "Summarize this meeting recording and list the action items",
    delay: 500,
  },
  {
    type: "text",
    content: "I'll analyze the recording using AnyCap's audio understanding.",
    delay: 800,
  },
  {
    type: "tool",
    content: `run("anycap actions audio-read --file ./standup-2026-04-03.mp3 --instruction 'Summarize key topics and extract action items'")`,
    delay: 600,
  },
  {
    type: "text",
    content: "Analysis complete — 8m 24s recording, 3 speakers detected.",
    sub: "✓",
    delay: 1600,
  },
  {
    type: "analysis",
    delay: 300,
    analysisLines: [
      "Topics: sprint progress review, staging deploy blocker, design review scheduling.",
      "",
      "Action items:",
      "1. @alex — Fix the Redis connection pool leak before next deploy (due Mon).",
      "2. @maya — Share the updated Figma link for the settings redesign.",
      "3. @team — Async design review in Slack by Thursday EOD.",
    ],
  },
  {
    type: "text",
    content: "Three action items extracted. The Redis leak is the most urgent.",
    delay: 600,
  },
  { type: "cursor", delay: 500 },
];

export function AudioReadDemo() {
  return <CapabilityDemo lines={lines} />;
}
