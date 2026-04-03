"use client";

import { CapabilityDemo, type DemoLine } from "./CapabilityDemo";

const lines: DemoLine[] = [
  { type: "header", delay: 0 },
  {
    type: "prompt",
    content: "Find the latest Go 1.25 release notes and changelog",
    delay: 500,
  },
  {
    type: "text",
    content: "I'll search the web using AnyCap.",
    delay: 800,
  },
  {
    type: "tool",
    content: `run("anycap search --query 'Go 1.25 release notes changelog' --include go.dev --time-range month")`,
    delay: 600,
  },
  {
    type: "text",
    content: "Search complete — 5 results from go.dev.",
    sub: "✓",
    delay: 1200,
  },
  {
    type: "analysis",
    delay: 300,
    analysisLines: [
      "1. go.dev/doc/go1.25 — Go 1.25 Release Notes",
      "   New range-over-func iterators, improved build caching, updated net/http defaults.",
      "",
      "2. go.dev/blog/go1.25 — Go 1.25 is released",
      "   Official announcement with migration guide and breaking change summary.",
      "",
      "3. go.dev/ref/spec — The Go Programming Language Specification",
      "   Updated spec reflecting 1.25 language changes.",
    ],
  },
  {
    type: "text",
    content: "The release notes and migration guide are the best starting points.",
    delay: 600,
  },
  { type: "cursor", delay: 500 },
];

export function WebSearchDemo() {
  return <CapabilityDemo lines={lines} />;
}
