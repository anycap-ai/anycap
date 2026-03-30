import type { Metadata } from "next";
import { LocalizedLink as Link } from "@/components/LocalizedLink";
import { siteConfig } from "@/lib/site";
import { FadeIn } from "@/components/FadeIn";
import { EarlyAccessBanner } from "@/components/EarlyAccessBanner";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { createTechArticleJsonLd } from "@/lib/schema";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

export const metadata: Metadata = {
  title: "AnyCap for Claude Code — Add capabilities to Claude Code",
  description:
    "Give Claude Code image generation, video generation, image read, and video analysis capabilities through AnyCap. Install once with a skill file and access every capability through one CLI.",
  alternates: { canonical: "/for/claude-code" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/for/claude-code",
    siteName: siteConfig.siteName,
    title: "AnyCap for Claude Code — Add capabilities to Claude Code",
    description:
      "Give Claude Code image generation, video generation, image read, and video analysis capabilities through AnyCap. Install once with a skill file and access every capability through one CLI.",
  },
};

const integrationGuideJsonLd = createTechArticleJsonLd({
  headline: "AnyCap for Claude Code — Add capabilities to Claude Code",
  description:
    "Guide to giving Claude Code a consistent capability layer with AnyCap, including install flow, CLI usage, and available capabilities.",
  path: "/for/claude-code",
  about: ["Claude Code", "AnyCap CLI", "Agent skills", "Capability runtime"],
  keywords: ["anycap for claude code", "claude code tools", "claude code skills", "agent capabilities"],
});

const capabilities = [
  {
    name: "Image Generation",
    command: "anycap image generate",
    models: "Seedream 5, Seedream 4.5, Nano Banana Pro, Nano Banana 2",
    status: "Early Access",
    href: "/capabilities/image-generation",
  },
  {
    name: "Video Generation",
    command: "anycap video generate",
    models: "Veo 3.1",
    status: "Early Access",
    href: "/capabilities/video-generation",
  },
  {
    name: "Image Read",
    command: "anycap image read",
    models: "Vision models",
    status: "Early Access",
    href: "/capabilities/image-read",
  },
  {
    name: "Video Analysis",
    command: "anycap video read",
    models: "Vision models",
    status: "Early Access",
    href: "/capabilities/video-analysis",
  },
];

export default function ForClaudeCodePage() {
  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: "Home", href: "/" },
        { name: "AnyCap for Claude Code" },
      ]} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(integrationGuideJsonLd) }}
      />

      <article className="px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-[1280px] py-12 md:py-20 lg:py-24">
          {/* Hero */}
          <FadeIn>
            <p
              className="text-[11px] text-[#6b7d3a] tracking-[0.8px] mb-4"
              style={mono}
            >
              For Claude Code
            </p>
            <h1
              className="leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(32px, 6vw, 72px)" }}
            >
              Give Claude Code
              <br />
              real-world capabilities.
            </h1>
            <p className="mt-6 max-w-[700px] text-base leading-7 text-[#4d5145] md:text-lg">
              AnyCap lets Claude Code install and use capabilities such as image generation
              with Seedream 5 and Nano Banana Pro, video generation with Veo 3.1, image
              understanding, and video analysis through one skill file and one CLI. Instead
              of wiring separate SDKs or building custom integrations, teams can give Claude
              Code a consistent capability layer that works out of the box. Install once,
              use every capability through the same interface.
            </p>
          </FadeIn>
          <FadeIn className="mt-8">
            <EarlyAccessBanner />
          </FadeIn>

          {/* Install Steps */}
          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2
                className="text-lg md:text-xl text-[#1c1f17] mb-8"
                style={{ ...pixel }}
              >
                Install in 3 Steps
              </h2>

              <div className="space-y-6 max-w-[800px]">
                {/* Step 1 */}
                <div className="border-l-[3px] border-[#6b7d3a] pl-6">
                  <p className="text-[11px] text-[#6b7d3a] tracking-[0.5px] mb-2" style={mono}>
                    Step 1 — Install the skill
                  </p>
                  <div className="bg-[#1c1f17] px-5 py-4">
                    <p className="text-[13px] text-[#6b7d3a] mb-1" style={mono}>
                      # via skills.sh (recommended)
                    </p>
                    <p className="text-[13px] text-[#d4e0a4]" style={mono}>
                      npx -y skills add anycap-ai/anycap -a claude-code -y
                    </p>
                  </div>
                  <p className="mt-3 text-sm text-[#4d5145]">
                    This installs the AnyCap skill file into Claude Code so it knows how to
                    discover and invoke capabilities.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="border-l-[3px] border-[#6b7d3a] pl-6">
                  <p className="text-[11px] text-[#6b7d3a] tracking-[0.5px] mb-2" style={mono}>
                    Step 2 — Install the CLI
                  </p>
                  <div className="bg-[#1c1f17] px-5 py-4">
                    <p className="text-[13px] text-[#d4e0a4]" style={mono}>
                      curl -fsSL https://anycap.ai/install.sh | sh
                    </p>
                  </div>
                  <p className="mt-3 text-sm text-[#4d5145]">
                    Or install via npm: <code className="text-[12px] text-[#6b7d3a]" style={mono}>npm install -g @anycap/cli</code>
                  </p>
                </div>

                {/* Step 3 */}
                <div className="border-l-[3px] border-[#6b7d3a] pl-6">
                  <p className="text-[11px] text-[#6b7d3a] tracking-[0.5px] mb-2" style={mono}>
                    Step 3 — Log in and verify
                  </p>
                  <div className="bg-[#1c1f17] px-5 py-4">
                    <p className="text-[13px] text-[#d4e0a4] mb-2" style={mono}>
                      anycap login
                    </p>
                    <p className="text-[13px] text-[#d4e0a4]" style={mono}>
                      anycap status
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          {/* Available Capabilities */}
          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2
                className="text-lg md:text-xl text-[#1c1f17] mb-8"
                style={{ ...pixel }}
              >
                Available Capabilities
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[#d4dbb8]">
                      <th className="pb-3 text-[11px] text-[#5a5e52] tracking-[0.5px]" style={mono}>Capability</th>
                      <th className="pb-3 text-[11px] text-[#5a5e52] tracking-[0.5px]" style={mono}>Command</th>
                      <th className="pb-3 text-[11px] text-[#5a5e52] tracking-[0.5px] hidden md:table-cell" style={mono}>Models</th>
                      <th className="pb-3 text-[11px] text-[#5a5e52] tracking-[0.5px]" style={mono}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {capabilities.map((cap) => (
                      <tr key={cap.name} className="border-b border-[#d4dbb8]/50">
                        <td className="py-4">
                          <Link href={cap.href} className="text-sm text-[#1c1f17] hover:text-[#6b7d3a] transition-colors font-medium">
                            {cap.name}
                          </Link>
                        </td>
                        <td className="py-4">
                          <code className="text-[12px] text-[#6b7d3a]" style={mono}>{cap.command}</code>
                        </td>
                        <td className="py-4 text-sm text-[#4d5145] hidden md:table-cell">{cap.models}</td>
                        <td className="py-4">
                          <span className="inline-flex items-center gap-1.5 text-[11px] text-[#6b7d3a] tracking-[1px]" style={mono}>
                            <span className="w-1.5 h-1.5 rounded-full bg-[#6b7d3a]" />
                            {cap.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          {/* Example Workflow */}
          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2
                className="text-lg md:text-xl text-[#1c1f17] mb-6"
                style={{ ...pixel }}
              >
                Example Workflow
              </h2>
              <p className="max-w-[700px] text-base leading-7 text-[#4d5145] mb-6">
                After installing the skill and CLI, Claude Code can use AnyCap capabilities
                directly in its agent workflow:
              </p>
              <div className="bg-[#1c1f17] px-6 py-5 md:px-8 md:py-6 max-w-[800px]">
                <p className="text-[13px] text-[#6b7d3a] mb-1" style={mono}># Generate an image</p>
                <p className="text-[13px] text-[#d4e0a4] mb-4" style={mono}>
                  anycap image generate --model seedream_5 --prompt &quot;product mockup on white background&quot;
                </p>
                <p className="text-[13px] text-[#6b7d3a] mb-1" style={mono}># Read an image</p>
                <p className="text-[13px] text-[#d4e0a4] mb-4" style={mono}>
                  anycap image read --url https://example.com/screenshot.png
                </p>
                <p className="text-[13px] text-[#6b7d3a] mb-1" style={mono}># Analyze a video</p>
                <p className="text-[13px] text-[#d4e0a4]" style={mono}>
                  anycap video read --url https://example.com/demo.mp4
                </p>
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          {/* Why AnyCap */}
          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2
                className="text-lg md:text-xl text-[#1c1f17] mb-6"
                style={{ ...pixel }}
              >
                Why AnyCap for Claude Code
              </h2>
              <div className="grid gap-6 sm:grid-cols-2 max-w-[900px]">
                <div>
                  <p className="text-[11px] text-[#5a5e52] tracking-[0.5px] mb-2" style={mono}>
                    Without AnyCap
                  </p>
                  <ul className="space-y-2 text-sm text-[#4d5145] leading-6">
                    <li>Wire separate API keys for each provider</li>
                    <li>Build custom integrations per capability</li>
                    <li>Manage auth flows for every service</li>
                    <li>Different interfaces for every tool</li>
                  </ul>
                </div>
                <div>
                  <p className="text-[11px] text-[#6b7d3a] tracking-[0.5px] mb-2" style={mono}>
                    With AnyCap
                  </p>
                  <ul className="space-y-2 text-sm text-[#1c1f17] leading-6">
                    <li>One install, one login, every capability</li>
                    <li>Consistent CLI interface across all models</li>
                    <li>Single auth flow for all capabilities</li>
                    <li>Agent-native design, not retrofitted</li>
                  </ul>
                </div>
              </div>
            </section>
          </FadeIn>

          {/* CTA */}
          <FadeIn>
            <section className="mt-16 md:mt-24 mb-8">
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
                  href="/capabilities"
                  className="inline-block px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] border border-[#1c1f17] hover:bg-[#1c1f17] hover:text-[#f4f5f0] transition-colors rounded-lg"
                  style={mono}
                >
                  All Capabilities
                </Link>
              </div>
            </section>
          </FadeIn>
        </div>
      </article>
    </>
  );
}
