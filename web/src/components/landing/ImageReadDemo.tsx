"use client";

import { CapabilityDemo, type DemoLine } from "./CapabilityDemo";

const lines: DemoLine[] = [
  { type: "header", delay: 0 },
  {
    type: "prompt",
    content: "Analyze this screenshot and tell me what UI issues you see",
    delay: 500,
  },
  {
    type: "text",
    content: "I'll read the screenshot using AnyCap's image understanding.",
    delay: 800,
  },
  {
    type: "tool",
    content: `run("anycap actions image-read --file ./screenshot.png --instruction 'Identify UI issues and layout problems'")`,
    delay: 600,
  },
  {
    type: "text",
    content: "Analysis complete.",
    sub: "✓",
    delay: 1400,
  },
  {
    type: "analysis",
    delay: 300,
    analysisLines: [
      "1. Nav overlap: hamburger menu overlaps the logo on mobile viewport (< 375px).",
      "2. Text truncation: the CTA button label is clipped on narrow widths — missing 2 characters.",
      "3. Contrast: subtitle text (#9a9a9a) on white fails WCAG AA (ratio 2.8:1, needs 4.5:1).",
      "4. Spacing: 4px gap between card rows — likely should be 16px to match the design grid.",
    ],
  },
  {
    type: "text",
    content: "Four issues flagged. The contrast and nav overlap are the most urgent.",
    delay: 600,
  },
  { type: "cursor", delay: 500 },
];

export function ImageReadDemo() {
  return <CapabilityDemo lines={lines} />;
}
