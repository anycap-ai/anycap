"use client";

import { CapabilityDemo, type DemoLine } from "./CapabilityDemo";

const lines: DemoLine[] = [
  { type: "header", delay: 0 },
  {
    type: "prompt",
    content: "What is context engineering and why does it matter for AI agents?",
    delay: 500,
  },
  {
    type: "text",
    content: "I'll run a grounded search to get a cited answer.",
    delay: 800,
  },
  {
    type: "tool",
    content: `run("anycap search --prompt 'What is context engineering and why does it matter for AI agents?'")`,
    delay: 600,
  },
  {
    type: "text",
    content: "Grounded answer ready — 4 sources cited.",
    sub: "✓",
    delay: 1400,
  },
  {
    type: "analysis",
    delay: 300,
    analysisLines: [
      "Context engineering is the practice of designing the information, tools,",
      "and structure an AI agent receives so it can make better decisions at each",
      "step. Unlike prompt engineering, which optimizes a single instruction,",
      "context engineering shapes the full runtime environment — retrieval,",
      "tool availability, memory, and execution constraints. [1][2]",
      "",
      "Sources:",
      "[1] anycap.ai/guides/context-engineering-for-agents",
      "[2] simonwillison.net/2025/context-engineering",
    ],
  },
  {
    type: "text",
    content: "Answer synthesized with sources. Ready to use in your workflow.",
    delay: 600,
  },
  { type: "cursor", delay: 500 },
];

export function GroundedSearchDemo() {
  return <CapabilityDemo lines={lines} />;
}
