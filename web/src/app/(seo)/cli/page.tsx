import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/site";
import { FadeIn } from "@/components/FadeIn";
import { EarlyAccessBanner } from "@/components/EarlyAccessBanner";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

export const metadata: Metadata = {
  title: "AnyCap Agent CLI — One CLI for agent capabilities",
  description:
    "AnyCap CLI is an agent-native command-line interface that lets AI agents install and use image generation, video generation, image understanding, and other capabilities through one install path and one auth flow.",
  alternates: { canonical: "/cli" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/cli",
    siteName: siteConfig.siteName,
    title: "AnyCap Agent CLI — One CLI for agent capabilities",
    description:
      "AnyCap CLI is an agent-native command-line interface that lets AI agents install and use image generation, video generation, image understanding, and other capabilities through one install path and one auth flow.",
  },
};

const capabilities = [
  {
    name: "Image Generation",
    command: "anycap image generate",
    description: "Generate and edit images with Seedream 5, Nano Banana Pro, and more",
    href: "/capabilities/image-generation",
    status: "Early Access",
  },
  {
    name: "Video Generation",
    command: "anycap video generate",
    description: "Generate videos with Veo 3.1",
    href: "/capabilities/video-generation",
    status: "Early Access",
  },
  {
    name: "Image Understanding",
    command: "anycap image understand",
    description: "Analyze images using vision models",
    href: "/capabilities/image-understanding",
    status: "Early Access",
  },
  {
    name: "Video Analysis",
    command: "anycap video read",
    description: "Analyze video content",
    href: "/capabilities/video-analysis",
    status: "Early Access",
  },
];

const ecosystems = [
  { name: "Claude Code", href: "/for/claude-code" },
  { name: "Cursor", href: "/for/cursor" },
  { name: "Codex", href: "/for/codex" },
  { name: "OpenCode", href: null },
  { name: "OpenClaw", href: null },
];

export default function CliPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: "Home", href: "/" },
        { name: "CLI" },
      ]} />
      <article className="px-6 md:px-12 lg:px-20">
      <div className="mx-auto max-w-[1280px] py-12 md:py-20 lg:py-24">
        {/* Hero */}
        <FadeIn>
          <h1
            className="leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
            style={{ ...pixel, fontSize: "clamp(32px, 6vw, 72px)" }}
          >
            AnyCap Agent CLI
          </h1>
          <p className="mt-6 max-w-[700px] text-base leading-7 text-[#4d5145] md:text-lg">
            AnyCap CLI is an agent-native command-line interface that lets AI agents install
            and use capabilities such as image generation, video generation, image understanding,
            and video analysis through one install path and one auth flow. It works across agent
            products like Claude Code, Cursor, Codex, OpenCode, and OpenClaw, so teams can give
            agents real-world capabilities without rebuilding separate integrations for each
            environment. One CLI. One login. Every capability.
          </p>
        </FadeIn>
        <FadeIn className="mt-8">
          <EarlyAccessBanner />
        </FadeIn>

        {/* Install */}
        <FadeIn>
          <section className="mt-16 md:mt-24">
            <h2
              className="text-lg md:text-xl text-[#1c1f17] mb-6"
              style={{ ...pixel }}
            >
              Install
            </h2>
            <p className="max-w-[800px] text-sm text-[#4d5145] leading-6 mb-4">
              CLI installation will be available when AnyCap launches publicly. Preview the
              install experience below.
            </p>
            <div className="bg-[#1c1f17] px-6 py-5 md:px-8 md:py-6 max-w-[800px]">
              <p className="text-[13px] text-[#6b7d3a] mb-2" style={mono}>
                # macOS / Linux / Windows (Git Bash)
              </p>
              <p className="text-[13px] text-[#d4e0a4]" style={mono}>
                curl -fsSL https://anycap.ai/install.sh | sh
              </p>
              <div className="my-4 border-t border-[#333]" />
              <p className="text-[13px] text-[#6b7d3a] mb-2" style={mono}>
                # npm (all platforms)
              </p>
              <p className="text-[13px] text-[#d4e0a4]" style={mono}>
                npm install -g @anycap/cli
              </p>
              <div className="my-4 border-t border-[#333]" />
              <p className="text-[13px] text-[#6b7d3a] mb-2" style={mono}>
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

        {/* Capabilities */}
        <FadeIn>
          <section className="mt-16 md:mt-24">
            <h2
              className="text-lg md:text-xl text-[#1c1f17] mb-8"
              style={{ ...pixel }}
            >
              Capabilities
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {capabilities.map((cap) => (
                <Link
                  key={cap.name}
                  href={cap.href}
                  className="group border border-[#d4dbb8] p-5 hover:border-[#6b7d3a] transition-colors"
                >
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="inline-block w-2 h-2 rounded-full bg-[#6b7d3a]" />
                    <h3 className="text-[13px] font-bold text-[#1c1f17] tracking-[1px]" style={mono}>
                      {cap.name}
                    </h3>
                    <span
                      className="text-[11px] text-[#6b7d3a] tracking-[1px]"
                      style={mono}
                    >
                      {cap.status}
                    </span>
                  </div>
                  <p className="text-sm text-[#4d5145] leading-6 mb-3">
                    {cap.description}
                  </p>
                  <code className="text-[12px] text-[#6b7d3a]" style={mono}>
                    {cap.command}
                  </code>
                </Link>
              ))}
            </div>
            <div className="mt-6">
              <Link
                href="/capabilities"
                className="text-[11px] text-[#6b7d3a] hover:text-[#1c1f17] tracking-[0.5px] transition-colors"
                style={mono}
              >
                View all capabilities →
              </Link>
            </div>
          </section>
        </FadeIn>

        <div className="mt-16 md:mt-24">
          <hr className="border-t border-[#d4dbb8]" />
        </div>

        {/* Works Across */}
        <FadeIn>
          <section className="mt-16 md:mt-24">
            <h2
              className="text-lg md:text-xl text-[#1c1f17] mb-6"
              style={{ ...pixel }}
            >
              Works Across Agent Products
            </h2>
            <p className="max-w-[700px] text-base leading-7 text-[#4d5145] mb-8">
              Install once, then give multiple agent environments a consistent capability
              interface. AnyCap is designed for agent workflows, not adapted from human-first
              software.
            </p>
            <div className="flex flex-wrap gap-3">
              {ecosystems.map((eco) =>
                eco.href ? (
                  <Link
                    key={eco.name}
                    href={eco.href}
                    className="border border-[#d4dbb8] px-4 py-2 text-[12px] text-[#1c1f17] hover:border-[#6b7d3a] hover:text-[#6b7d3a] tracking-[1px] transition-colors"
                    style={mono}
                  >
                    {eco.name}
                  </Link>
                ) : (
                  <span
                    key={eco.name}
                    className="border border-[#d4dbb8] px-4 py-2 text-[12px] text-[#5a5e52] tracking-[1px]"
                    style={mono}
                  >
                    {eco.name}
                  </span>
                )
              )}
            </div>
          </section>
        </FadeIn>

        <div className="mt-16 md:mt-24">
          <hr className="border-t border-[#d4dbb8]" />
        </div>

        <FadeIn>
          <section className="mt-16 md:mt-24">
            <h2
              className="text-lg md:text-xl text-[#1c1f17] mb-8"
              style={{ ...pixel }}
            >
              Related Guides
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 max-w-[960px]">
              <Link
                href="/guides/context-engineering-for-agents"
                className="border border-[#d4dbb8] p-5 hover:border-[#6b7d3a] transition-colors"
              >
                <p className="text-[11px] text-[#6b7d3a] tracking-[0.5px] mb-2" style={mono}>
                  Guide
                </p>
                <h3 className="text-[15px] font-bold text-[#1c1f17] mb-2" style={mono}>
                  Context Engineering for Agents
                </h3>
                <p className="text-sm text-[#4d5145] leading-6">
                  Learn how agent context determines when to call capabilities instead of
                  staying inside the prompt.
                </p>
              </Link>
              <Link
                href="/guides/agent-skills-for-developer-tools"
                className="border border-[#d4dbb8] p-5 hover:border-[#6b7d3a] transition-colors"
              >
                <p className="text-[11px] text-[#6b7d3a] tracking-[0.5px] mb-2" style={mono}>
                  Guide
                </p>
                <h3 className="text-[15px] font-bold text-[#1c1f17] mb-2" style={mono}>
                  Agent Skills for Developer Tools
                </h3>
                <p className="text-sm text-[#4d5145] leading-6">
                  See how skill files distribute AnyCap capabilities across Claude Code,
                  Cursor, Codex, and similar agent products.
                </p>
              </Link>
            </div>
          </section>
        </FadeIn>

        <div className="mt-16 md:mt-24">
          <hr className="border-t border-[#d4dbb8]" />
        </div>

        {/* Get Started CTA */}
        <FadeIn>
          <section className="mt-16 md:mt-24 mb-8">
            <h2
              className="text-lg md:text-xl text-[#1c1f17] mb-6"
              style={{ ...pixel }}
            >
              Get Started
            </h2>
            <div className="flex flex-wrap gap-4">
              <a
                href="https://github.com/anycap-ai/anycap"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#f4f5f0] bg-[#6b7d3a] hover:bg-[#1c1f17] transition-colors rounded-lg"
                style={mono}
              >
                Request Early Access
              </a>
              <Link
                href="/for/claude-code"
                className="inline-block px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] border border-[#1c1f17] hover:bg-[#1c1f17] hover:text-[#f4f5f0] transition-colors rounded-lg"
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
