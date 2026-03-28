const mono = { fontFamily: "var(--font-mono), monospace" } as const;

export function EarlyAccessBanner() {
  return (
    <div className="border border-[#6b7d3a]/40 bg-[#6b7d3a]/5 px-5 py-4 max-w-[800px]">
      <p className="text-[11px] text-[#6b7d3a] tracking-[0.5px] mb-1.5" style={mono}>
        Early Access
      </p>
      <p className="text-sm text-[#4d5145] leading-6">
        AnyCap is currently in early access. Capabilities shown on this page are available
        to early access users.{" "}
        <a
          href="https://github.com/anycap-ai/anycap"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#6b7d3a] hover:underline"
        >
          Request access on GitHub
        </a>{" "}
        to get started.
      </p>
    </div>
  );
}
