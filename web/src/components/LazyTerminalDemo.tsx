"use client";

import type { CSSProperties } from "react";
import dynamic from "next/dynamic";

const staticDemoLines = [
  "# Install the AnyCap skill",
  "npx -y skills add anycap-ai/anycap -a claude-code -y",
  "",
  "# Install the CLI and connect your account",
  "curl -fsSL https://anycap.ai/install.sh | sh",
  "anycap login",
  "",
  "# Call a capability from your workflow",
  "anycap image understand --url https://example.com/photo.jpg",
].join("\n");

function StaticTerminalDemo({ style }: { style?: CSSProperties }) {
  return (
    <pre
      className="max-w-[800px] overflow-x-auto whitespace-pre-wrap text-[13px] leading-relaxed text-[#b8cc6e] md:text-sm"
      style={style}
    >
      {staticDemoLines}
    </pre>
  );
}

const TerminalDemo = dynamic(
  () => import("./TerminalDemo").then((mod) => mod.TerminalDemo),
  {
    ssr: false,
    loading: () => <StaticTerminalDemo />,
  }
);

export function LazyTerminalDemo({
  style,
}: {
  style?: CSSProperties;
}) {
  return (
    <div className="min-h-20">
      <TerminalDemo />
      <noscript>
        <StaticTerminalDemo style={style} />
      </noscript>
    </div>
  );
}
