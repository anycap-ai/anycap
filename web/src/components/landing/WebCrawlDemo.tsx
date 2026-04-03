"use client";

import { CapabilityDemo, type DemoLine } from "./CapabilityDemo";

const lines: DemoLine[] = [
  { type: "header", delay: 0 },
  {
    type: "prompt",
    content: "Fetch the Go context package docs and summarize the key patterns",
    delay: 500,
  },
  {
    type: "text",
    content: "I'll crawl the page and extract the content using AnyCap.",
    delay: 800,
  },
  {
    type: "tool",
    content: `run("anycap crawl https://pkg.go.dev/context")`,
    delay: 600,
  },
  {
    type: "text",
    content: "Page crawled — 2,340 words extracted as Markdown.",
    sub: "✓",
    delay: 1200,
  },
  {
    type: "analysis",
    delay: 300,
    analysisLines: [
      "# context — Go standard library",
      "",
      "Key patterns:",
      "• context.Background() — top-level root context for main and init.",
      "• context.WithCancel(parent) — returns a derived context that can be canceled.",
      "• context.WithTimeout(parent, d) — auto-cancels after duration d.",
      "• context.WithValue(parent, k, v) — carries request-scoped values (use sparingly).",
      "",
      "Rule: always pass ctx as the first argument, never store it in a struct.",
    ],
  },
  {
    type: "text",
    content: "Content extracted and summarized. The key API surface is above.",
    delay: 600,
  },
  { type: "cursor", delay: 500 },
];

export function WebCrawlDemo() {
  return <CapabilityDemo lines={lines} />;
}
