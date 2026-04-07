import type { Metadata } from "next";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { siteConfig } from "@/lib/site";
import { FadeIn } from "@/components/ui/FadeIn";
import { EarlyAccessBanner } from "@/components/landing/EarlyAccessBanner";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { createSoftwareSourceCodeJsonLd } from "@/lib/schema";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

export const metadata: Metadata = {
  title: "AnyCap CLI — One command surface for the capabilities your agent still needs",
  description:
    "Your agent can plan the work, but it still needs a command surface for image generation, video generation, image understanding, and video analysis. AnyCap CLI gives that capability layer one install path, one auth flow, and one interface.",
  alternates: { canonical: "/cli" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/cli",
    siteName: siteConfig.siteName,
    title: "AnyCap CLI — One command surface for the capabilities your agent still needs",
    description:
      "One CLI for image, video, and vision workflows across Claude Code, Cursor, Codex, and similar agent environments.",
  },
};

const capabilities = [
  {
    name: "Image Generation",
    command: "anycap image generate",
    description: "Generate and edit visuals with Seedream 5, Nano Banana Pro, and more.",
    href: "/capabilities/image-generation",
    status: "Available",
  },
  {
    name: "Video Generation",
    command: "anycap video generate",
    description: "Generate walkthroughs, clips, and motion output with Veo 3.1.",
    href: "/capabilities/video-generation",
    status: "Available",
  },
  {
    name: "Image Understanding",
    command: "anycap actions image-read",
    description: "Analyze screenshots, diagrams, OCR, and visual references through one runtime.",
    href: "/capabilities/image-understanding",
    status: "Available",
  },
  {
    name: "Video Analysis",
    command: "anycap actions video-read",
    description: "Inspect recordings, summarize scenes, and extract structured video intelligence.",
    href: "/capabilities/video-analysis",
    status: "Available",
  },
];

const ecosystems = [
  { name: "Claude Code", href: "/for/claude-code" },
  { name: "Cursor", href: "/for/cursor" },
  { name: "Codex", href: "/for/codex" },
  { name: "OpenCode", href: null },
  { name: "OpenClaw", href: null },
];

const reasons = [
  {
    title: "Keep the command surface stable",
    description:
      "Without a unified CLI, every new capability becomes a new SDK, dashboard, or shell script. AnyCap keeps the execution layer consistent.",
  },
  {
    title: "Log in once",
    description:
      "Authentication happens once and carries across image, video, and vision workflows instead of fragmenting across providers.",
  },
  {
    title: "Move across agents without re-learning the runtime",
    description:
      "The same commands can sit under Claude Code, Cursor, Codex, and similar agent environments without forcing a new mental model each time.",
  },
];

const nextPages = [
  {
    eyebrow: "Capabilities",
    title: "Image Generation",
    href: "/capabilities/image-generation",
    summary: "Go deeper on text-to-image, image editing, supported models, and the real CLI workflow.",
  },
  {
    eyebrow: "Capabilities",
    title: "Video Generation",
    href: "/capabilities/video-generation",
    summary: "See how text-to-video and image-to-video fit into the same agent command surface.",
  },
  {
    eyebrow: "Learn",
    title: "What agents can't do",
    href: "/learn/what-agents-cant-do",
    summary: "Start here if you want the deficiency-first narrative and the shortest page for each missing capability.",
  },
  {
    eyebrow: "Learn",
    title: "How skills fit",
    href: "/skills",
    summary: "Use this when you want to understand how the instruction layer connects the agent to the CLI and runtime.",
  },
  {
    eyebrow: "Guides",
    title: "Context Engineering",
    href: "/guides/context-engineering-for-agents",
    summary: "Use this when you want to understand when the agent should call a capability instead of staying inside the prompt.",
  },
];

const cliSoftwareJsonLd = createSoftwareSourceCodeJsonLd({
  name: "AnyCap CLI",
  description:
    "Agent-native CLI that gives AI agents one install path and one interface for capabilities like image generation, video generation, image understanding, and video analysis.",
  path: "/cli",
  codeRepository: "https://github.com/anycap-ai/anycap",
});

export default function CliPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "CLI" },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(cliSoftwareJsonLd) }}
      />

      <article className="px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-[1280px] py-12 md:py-20 lg:py-24">
          <FadeIn>
            <p className="mb-4 text-[11px] tracking-[0.8px] text-[#6b7d3a]" style={mono}>
              CLI
            </p>
            <h1
              className="leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(32px, 6vw, 72px)" }}
            >
              One CLI for the capabilities
              <br />
              your agent still needs.
            </h1>
            <p className="mt-6 max-w-[760px] text-base leading-7 text-[#4d5145] md:text-lg">
              The agent can plan the workflow. The missing layer is usually execution: one command
              surface for image generation, video generation, image understanding, and video
              analysis. AnyCap CLI gives that layer one install path, one auth flow, and one
              interface across Claude Code, Cursor, Codex, and similar agent products.
            </p>
            <p className="mt-4 text-sm leading-6 text-[#6b7d3a]" style={mono}>
              Don&apos;t switch agents. Add capabilities immediately.
            </p>
          </FadeIn>

          <FadeIn className="mt-8">
            <EarlyAccessBanner />
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-6 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                Install once
              </h2>
              <p className="mb-4 max-w-[800px] text-sm leading-6 text-[#4d5145]">
                CLI installation will be available when AnyCap launches publicly. The install path
                below is the stable entry to the runtime.
              </p>
              <div className="max-w-[800px] bg-[#1c1f17] px-6 py-5 md:px-8 md:py-6">
                <p className="mb-2 text-[13px] text-[#6b7d3a]" style={mono}>
                  # macOS / Linux / Windows (Git Bash)
                </p>
                <p className="text-[13px] text-[#d4e0a4]" style={mono}>
                  curl -fsSL https://anycap.ai/install.sh | sh
                </p>
                <div className="my-4 border-t border-[#333]" />
                <p className="mb-2 text-[13px] text-[#6b7d3a]" style={mono}>
                  # npm (all platforms)
                </p>
                <p className="text-[13px] text-[#d4e0a4]" style={mono}>
                  npm install -g @anycap/cli
                </p>
                <div className="my-4 border-t border-[#333]" />
                <p className="mb-2 text-[13px] text-[#6b7d3a]" style={mono}>
                  # Verify
                </p>
                <p className="text-[13px] text-[#d4e0a4]" style={mono}>
                  anycap status
                </p>
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-8 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                The first commands most agents need
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {capabilities.map((capability) => (
                  <Link
                    key={capability.name}
                    href={capability.href}
                    className="group border border-[#d4dbb8] p-5 transition-colors hover:border-[#6b7d3a]"
                  >
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="inline-block h-2 w-2 rounded-full bg-[#6b7d3a]" />
                      <h3 className="text-[13px] font-bold tracking-[1px] text-[#1c1f17]" style={mono}>
                        {capability.name}
                      </h3>
                      <span className="text-[11px] tracking-[1px] text-[#6b7d3a]" style={mono}>
                        {capability.status}
                      </span>
                    </div>
                    <p className="mb-3 text-sm leading-6 text-[#4d5145]">{capability.description}</p>
                    <code className="text-[12px] text-[#6b7d3a]" style={mono}>
                      {capability.command}
                    </code>
                  </Link>
                ))}
              </div>
              <div className="mt-6">
                <Link
                  href="/capabilities"
                  className="text-[11px] tracking-[0.5px] text-[#6b7d3a] transition-colors hover:text-[#1c1f17]"
                  style={mono}
                >
                  View any capability →
                </Link>
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-6 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                Why one CLI matters
              </h2>
              <div className="grid gap-4 lg:grid-cols-3">
                {reasons.map((reason) => (
                  <div key={reason.title} className="rounded-xl border border-[#d4dbb8] bg-[#fffffc]/70 p-6">
                    <h3 className="mb-3 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                      {reason.title}
                    </h3>
                    <p className="text-sm leading-6 text-[#4d5145]">{reason.description}</p>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <p className="mb-3 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                  Available across agent products
                </p>
                <div className="flex flex-wrap gap-3">
                  {ecosystems.map((ecosystem) =>
                    ecosystem.href ? (
                      <Link
                        key={ecosystem.name}
                        href={ecosystem.href}
                        className="border border-[#d4dbb8] px-4 py-2 text-[12px] tracking-[1px] text-[#1c1f17] transition-colors hover:border-[#6b7d3a] hover:text-[#6b7d3a]"
                        style={mono}
                      >
                        {ecosystem.name}
                      </Link>
                    ) : (
                      <span
                        key={ecosystem.name}
                        className="border border-[#d4dbb8] px-4 py-2 text-[12px] tracking-[1px] text-[#5a5e52]"
                        style={mono}
                      >
                        {ecosystem.name}
                      </span>
                    ),
                  )}
                </div>
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-8 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                Understand the rest of the stack
              </h2>
              <div className="grid gap-4 lg:grid-cols-3">
                {nextPages.map((page) => (
                  <Link
                    key={page.href}
                    href={page.href}
                    className="rounded-xl border border-[#d4dbb8] bg-[#fffffc]/70 p-6 transition-colors hover:border-[#6b7d3a]"
                  >
                    <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                      {page.eyebrow}
                    </p>
                    <h3 className="mb-3 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                      {page.title}
                    </h3>
                    <p className="text-sm leading-6 text-[#4d5145]">{page.summary}</p>
                  </Link>
                ))}
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24 mb-8">
              <div className="flex flex-wrap gap-4">
                <a
                  href="https://github.com/anycap-ai/anycap"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block rounded-lg bg-[#6b7d3a] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#f4f5f0] transition-colors hover:bg-[#1c1f17]"
                  style={mono}
                >
                  View on GitHub
                </a>
                <Link
                  href="/start"
                  className="inline-block rounded-lg border border-[#1c1f17] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] transition-colors hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
                  style={mono}
                >
                  Get Started
                </Link>
                <Link
                  href="/learn/what-agents-cant-do"
                  className="inline-block rounded-lg border border-[#1c1f17] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] transition-colors hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
                  style={mono}
                >
                  See Capability Gaps
                </Link>
                <Link
                  href="/for/claude-code"
                  className="inline-block rounded-lg border border-[#1c1f17] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] transition-colors hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
                  style={mono}
                >
                  For Claude Code
                </Link>
              </div>
            </section>
          </FadeIn>
        </div>
      </article>
    </>
  );
}
