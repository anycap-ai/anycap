import type { Metadata } from "next";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { siteConfig } from "@/lib/site";
import { EarlyAccessBanner } from "@/components/landing/EarlyAccessBanner";
import { FadeIn } from "@/components/ui/FadeIn";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { createTechArticleJsonLd } from "@/lib/schema";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

export const metadata: Metadata = {
  title: "Install AnyCap — Setup guide for AI agents",
  description:
    "Install AnyCap CLI and skill files to give AI agents image generation, video generation, image read, and video analysis capabilities. Works with Claude Code, Cursor, Codex, and more.",
  alternates: { canonical: "/guides/install-anycap" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/guides/install-anycap",
    siteName: siteConfig.siteName,
    title: "Install AnyCap — Setup guide for AI agents",
    description:
      "Install AnyCap CLI and skill files to give AI agents image generation, video generation, image read, and video analysis capabilities. Works with Claude Code, Cursor, Codex, and more.",
  },
};

const guideJsonLd = createTechArticleJsonLd({
  headline: "Install AnyCap — Setup guide for AI agents",
  description:
    "Guide to installing the AnyCap CLI and skill files so AI agents can use capabilities through one install path and one auth flow.",
  path: "/guides/install-anycap",
  about: ["AnyCap CLI", "AI agents", "Agent skills", "Capability runtime"],
  keywords: ["install anycap", "anycap cli", "agent skills", "ai agent setup"],
});

export default function InstallAnycapPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: "Home", href: "/" },
        { name: "Install AnyCap" },
      ]} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(guideJsonLd) }}
      />

      <article className="px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-[1280px] py-12 md:py-20 lg:py-24">
          {/* Hero */}
          <FadeIn>
            <p
              className="text-[11px] text-[#6b7d3a] tracking-[0.8px] mb-4"
              style={mono}
            >
              Guide
            </p>
            <h1
              className="leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(32px, 6vw, 72px)" }}
            >
              Install AnyCap
            </h1>
            <p className="mt-6 max-w-[700px] text-base leading-7 text-[#4d5145] md:text-lg">
              AnyCap installs in under five minutes and gives AI agents a consistent capability
              interface. After setup, agents running in Claude Code, Cursor, Codex, OpenCode,
              or OpenClaw can access image generation, video generation, image read,
              video analysis, and other capabilities through one CLI and one auth flow. This
              guide covers the full install path from CLI binary to first capability call.
            </p>
          </FadeIn>

          <FadeIn className="mt-8">
            <EarlyAccessBanner />
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          {/* Prerequisites */}
          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2
                className="text-lg md:text-xl text-[#1c1f17] mb-6"
                style={{ ...pixel }}
              >
                Prerequisites
              </h2>
              <ul className="space-y-3 max-w-[700px]">
                <li className="flex items-start gap-3 text-sm text-[#4d5145] leading-6">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#6b7d3a] shrink-0" />
                  macOS, Linux, or Windows (Git Bash)
                </li>
                <li className="flex items-start gap-3 text-sm text-[#4d5145] leading-6">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#6b7d3a] shrink-0" />
                  Node.js 18+ (if installing via npm)
                </li>
                <li className="flex items-start gap-3 text-sm text-[#4d5145] leading-6">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#6b7d3a] shrink-0" />
                  A browser for the login flow
                </li>
              </ul>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          {/* Steps */}
          <div className="mt-16 md:mt-24 space-y-12 max-w-[800px]">
            <FadeIn>
              <p className="text-sm text-[#4d5145] leading-6 border border-[#d4dbb8] bg-[#f4f5f0]/50 px-5 py-4 max-w-[800px]">
                The following install steps will be available when AnyCap launches publicly.
                Request early access to get started today.
              </p>
            </FadeIn>
            {/* Step 1 */}
            <FadeIn>
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className="w-8 h-8 flex items-center justify-center text-[13px] font-bold text-[#f4f5f0] bg-[#6b7d3a]"
                    style={mono}
                  >
                    1
                  </span>
                  <h2
                    className="text-lg text-[#1c1f17]"
                    style={{ ...pixel }}
                  >
                    Install the CLI
                  </h2>
                </div>
                <div className="bg-[#1c1f17] px-5 py-4 mb-3">
                  <p className="text-[13px] text-[#6b7d3a] mb-1" style={mono}>
                    # Install script (recommended)
                  </p>
                  <p className="text-[13px] text-[#d4e0a4]" style={mono}>
                    curl -fsSL https://anycap.ai/install.sh | sh
                  </p>
                </div>
                <div className="bg-[#1c1f17] px-5 py-4">
                  <p className="text-[13px] text-[#6b7d3a] mb-1" style={mono}>
                    # Or via npm
                  </p>
                  <p className="text-[13px] text-[#d4e0a4]" style={mono}>
                    npm install -g @anycap/cli
                  </p>
                </div>
                <p className="mt-3 text-sm text-[#4d5145]">
                  Binaries are also available on{" "}
                  <a
                    href="https://github.com/anycap-ai/anycap/releases"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#6b7d3a] hover:underline"
                  >
                    GitHub Releases
                  </a>.
                </p>
              </section>
            </FadeIn>

            {/* Step 2 */}
            <FadeIn>
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className="w-8 h-8 flex items-center justify-center text-[13px] font-bold text-[#f4f5f0] bg-[#6b7d3a]"
                    style={mono}
                  >
                    2
                  </span>
                  <h2
                    className="text-lg text-[#1c1f17]"
                    style={{ ...pixel }}
                  >
                    Log In
                  </h2>
                </div>
                <div className="bg-[#1c1f17] px-5 py-4">
                  <p className="text-[13px] text-[#d4e0a4]" style={mono}>
                    anycap login
                  </p>
                </div>
                <p className="mt-3 text-sm text-[#4d5145]">
                  This opens a browser for authentication. After login, credentials are stored
                  securely on your machine.
                </p>
              </section>
            </FadeIn>

            {/* Step 3 */}
            <FadeIn>
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className="w-8 h-8 flex items-center justify-center text-[13px] font-bold text-[#f4f5f0] bg-[#6b7d3a]"
                    style={mono}
                  >
                    3
                  </span>
                  <h2
                    className="text-lg text-[#1c1f17]"
                    style={{ ...pixel }}
                  >
                    Install the Skill File
                  </h2>
                </div>
                <p className="text-sm text-[#4d5145] leading-6 mb-4">
                  Skills teach AI agents how to discover and invoke AnyCap capabilities.
                </p>
                <div className="bg-[#1c1f17] px-5 py-4 mb-3">
                  <p className="text-[13px] text-[#6b7d3a] mb-1" style={mono}>
                    # via skills.sh (recommended)
                  </p>
                  <p className="text-[13px] text-[#d4e0a4]" style={mono}>
                    npx -y skills add anycap-ai/anycap -a claude-code -y
                  </p>
                </div>
                <div className="bg-[#1c1f17] px-5 py-4 mb-3">
                  <p className="text-[13px] text-[#6b7d3a] mb-1" style={mono}>
                    # Or via AnyCap CLI
                  </p>
                  <p className="text-[13px] text-[#d4e0a4]" style={mono}>
                    anycap skill install --target ~/.claude/skills/anycap-cli/
                  </p>
                </div>
                <div className="bg-[#1c1f17] px-5 py-4">
                  <p className="text-[13px] text-[#6b7d3a] mb-1" style={mono}>
                    # Or manually
                  </p>
                  <p className="text-[13px] text-[#d4e0a4] break-all" style={mono}>
                    curl -fsSL https://raw.githubusercontent.com/anycap-ai/anycap/main/skills/anycap-cli/SKILL.md --create-dirs -o ~/.claude/skills/anycap-cli/SKILL.md
                  </p>
                </div>
              </section>
            </FadeIn>

            {/* Step 4 */}
            <FadeIn>
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className="w-8 h-8 flex items-center justify-center text-[13px] font-bold text-[#f4f5f0] bg-[#6b7d3a]"
                    style={mono}
                  >
                    4
                  </span>
                  <h2
                    className="text-lg text-[#1c1f17]"
                    style={{ ...pixel }}
                  >
                    Verify
                  </h2>
                </div>
                <div className="bg-[#1c1f17] px-5 py-4">
                  <p className="text-[13px] text-[#d4e0a4]" style={mono}>
                    anycap status
                  </p>
                </div>
                <p className="mt-3 text-sm text-[#4d5145]">
                  This confirms CLI version, authentication state, and server connection.
                </p>
              </section>
            </FadeIn>

            {/* Step 5 */}
            <FadeIn>
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className="w-8 h-8 flex items-center justify-center text-[13px] font-bold text-[#f4f5f0] bg-[#6b7d3a]"
                    style={mono}
                  >
                    5
                  </span>
                  <h2
                    className="text-lg text-[#1c1f17]"
                    style={{ ...pixel }}
                  >
                    Use Your First Capability
                  </h2>
                </div>
                <div className="bg-[#1c1f17] px-5 py-4 mb-3">
                  <p className="text-[13px] text-[#6b7d3a] mb-1" style={mono}>
                    # Understand an image
                  </p>
                  <p className="text-[13px] text-[#d4e0a4]" style={mono}>
                    anycap image read --url https://example.com/photo.jpg
                  </p>
                </div>
                <div className="bg-[#1c1f17] px-5 py-4">
                  <p className="text-[13px] text-[#6b7d3a] mb-1" style={mono}>
                    # Generate an image
                  </p>
                  <p className="text-[13px] text-[#d4e0a4]" style={mono}>
                    anycap image generate --model seedream_5 --prompt &quot;a sunset over mountains&quot;
                  </p>
                </div>
              </section>
            </FadeIn>
          </div>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          {/* Troubleshooting */}
          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2
                className="text-lg md:text-xl text-[#1c1f17] mb-6"
                style={{ ...pixel }}
              >
                Common Issues
              </h2>
              <div className="space-y-6 max-w-[700px]">
                <div>
                  <p className="text-sm font-medium text-[#1c1f17] mb-1">
                    Install script fails on macOS
                  </p>
                  <p className="text-sm text-[#4d5145] leading-6">
                    Try installing via npm instead: <code className="text-[12px] text-[#6b7d3a]" style={mono}>npm install -g @anycap/cli</code>
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#1c1f17] mb-1">
                    Login does not open a browser
                  </p>
                  <p className="text-sm text-[#4d5145] leading-6">
                    Use device code flow: <code className="text-[12px] text-[#6b7d3a]" style={mono}>anycap login --headless</code>
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#1c1f17] mb-1">
                    Permission denied
                  </p>
                  <p className="text-sm text-[#4d5145] leading-6">
                    Ensure the install directory is writable, or use npm with a user-level global prefix.
                  </p>
                </div>
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          {/* Next Steps */}
          <FadeIn>
            <section className="mt-16 md:mt-24 mb-8">
              <h2
                className="text-lg md:text-xl text-[#1c1f17] mb-6"
                style={{ ...pixel }}
              >
                Next Steps
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
                <Link
                  href="/capabilities"
                  className="inline-block px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] border border-[#1c1f17] hover:bg-[#1c1f17] hover:text-[#f4f5f0] transition-colors rounded-lg"
                  style={mono}
                >
                  Any Capability
                </Link>
                <Link
                  href="/cli"
                  className="inline-block px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] border border-[#1c1f17] hover:bg-[#1c1f17] hover:text-[#f4f5f0] transition-colors rounded-lg"
                  style={mono}
                >
                  CLI Overview
                </Link>
              </div>
            </section>
          </FadeIn>
        </div>
      </article>
    </>
  );
}
