"use client";

import {
  CapabilityDemo,
  type CapabilityDemoLabels,
  type DemoLine,
} from "./CapabilityDemo";

const defaultLines: DemoLine[] = [
  { type: "header", delay: 0 },
  {
    type: "prompt",
    content: "Generate a minimalist product hero image on a cream background",
    delay: 500,
  },
  {
    type: "text",
    content: "I'll generate that image using AnyCap.",
    delay: 800,
  },
  {
    type: "tool",
    content: `run("anycap image generate --prompt 'minimalist product hero, cream background' --model seedream-5 -o hero.png")`,
    delay: 600,
  },
  {
    type: "text",
    content: "Image generated — hero.png (1024 × 1024)",
    sub: "✓",
    delay: 1400,
  },
  { type: "image", delay: 400 },
  {
    type: "text",
    content: "Here's the product hero. Clean and ready for your landing page.",
    delay: 600,
  },
  { type: "cursor", delay: 500 },
];

const defaultLabels: CapabilityDemoLabels = {
  header: "agent with anycap",
  name: "Name",
  size: "Size",
  date: "Date",
  link: "Link",
};

export function ImageGenDemo({
  lines = defaultLines,
  labels = defaultLabels,
}: {
  lines?: readonly DemoLine[];
  labels?: Partial<CapabilityDemoLabels>;
}) {
  return <CapabilityDemo lines={lines} labels={labels} />;
}
