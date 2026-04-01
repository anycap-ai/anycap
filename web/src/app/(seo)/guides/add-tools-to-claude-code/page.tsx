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
  title: "Add tools to Claude Code — Install agent capabilities",
  description:
    "Step-by-step guide to adding image generation, video generation, image read, and video analysis tools to Claude Code using AnyCap skills and CLI.",
  alternates: { canonical: "/guides/add-tools-to-claude-code" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/guides/add-tools-to-claude-code",
    siteName: siteConfig.siteName,
    title: "Add tools to Claude Code — Install agent capabilities",
    description:
      "Step-by-step guide to adding image generation, video generation, image read, and video analysis tools to Claude Code using AnyCap skills and CLI.",
  },
};

const guideJsonLd = createTechArticleJsonLd({
  headline: "Add tools to Claude Code — Install agent capabilities",
  description:
    "Guide to adding AnyCap-powered capabilities like image generation, video generation, image understanding, and video analysis to Claude Code.",
  path: "/guides/add-tools-to-claude-code",
  about: ["Claude Code", "AnyCap CLI", "Agent skills", "AI agent capabilities"],
  keywords: ["claude code tools", "add tools to claude code", "anycap", "agent skills"],
});

export default function AddToolsToClaudeCodePage() {
  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: "Home", href: "/" },
        { name: "Guides", href: "/guides", unlinkable: true },
        { name: "Add Tools to Claude Code" },
      ]} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(guideJsonLd) }} />

      <article className="px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-[1280px] py-12 md:py-20 lg:py-24">
          <FadeIn>
            <p className="text-[11px] text-[#6b7d3a] tracking-[0.8px] mb-4" style={mono}>Guide</p>
            <h1
              className="leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(28px, 5vw, 60px)" }}
            >
              Add tools to Claude Code
            </h1>
            <p className="mt-6 max-w-[700px] text-base leading-7 text-[#4d5145] md:text-lg">
              Claude Code is a powerful coding agent, but it cannot generate images, create videos,
              or analyze visual content on its own. AnyCap adds these capabilities through a skill
              file and CLI. This guide walks through the full setup — from installing the skill to
              generating your first image — so Claude Code can access image generation with models
              like Seedream 5 and Nano Banana Pro, video generation with Veo 3.1, image
              understanding, and video analysis through one interface.
            </p>
          </FadeIn>

          <FadeIn className="mt-8">
            <EarlyAccessBanner />
          </FadeIn>

          <div className="mt-16 md:mt-24"><hr className="border-t border-[#d4dbb8]" /></div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="text-lg md:text-xl text-[#1c1f17] mb-6" style={{ ...pixel }}>What you need</h2>
              <ul className="space-y-3 max-w-[700px]">
                <li className="flex items-start gap-3 text-sm text-[#4d5145] leading-6">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#6b7d3a] shrink-0" />
                  Claude Code installed and working
                </li>
                <li className="flex items-start gap-3 text-sm text-[#4d5145] leading-6">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#6b7d3a] shrink-0" />
                  Node.js 18+ (for skills.sh and npm install)
                </li>
                <li className="flex items-start gap-3 text-sm text-[#4d5145] leading-6">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#6b7d3a] shrink-0" />
                  A browser for the login flow
                </li>
              </ul>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24"><hr className="border-t border-[#d4dbb8]" /></div>

          <div className="mt-16 md:mt-24 space-y-10 max-w-[800px]">
            <FadeIn>
              <p className="text-sm text-[#4d5145] leading-6 border border-[#d4dbb8] bg-[#f4f5f0]/50 px-5 py-4 max-w-[800px]">
                The following steps will be available when AnyCap launches publicly. Request
                early access to get started today.
              </p>
            </FadeIn>
            {/* Step 1 */}
            <FadeIn>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-8 flex items-center justify-center text-[13px] font-bold text-[#f4f5f0] bg-[#6b7d3a]" style={mono}>1</span>
                <h2 className="text-lg text-[#1c1f17]" style={{ ...pixel }}>Install the AnyCap skill</h2>
              </div>
              <div className="bg-[#1c1f17] px-5 py-4">
                <p className="text-[13px] text-[#d4e0a4]" style={mono}>npx -y skills add anycap-ai/anycap -a claude-code -y</p>
              </div>
              <p className="mt-3 text-sm text-[#4d5145]">This places the AnyCap SKILL.md file into Claude Code&apos;s skills directory so it can discover available capabilities.</p>
            </FadeIn>

            {/* Step 2 */}
            <FadeIn>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-8 flex items-center justify-center text-[13px] font-bold text-[#f4f5f0] bg-[#6b7d3a]" style={mono}>2</span>
                <h2 className="text-lg text-[#1c1f17]" style={{ ...pixel }}>Install the AnyCap CLI</h2>
              </div>
              <div className="bg-[#1c1f17] px-5 py-4 mb-3">
                <p className="text-[13px] text-[#d4e0a4]" style={mono}>curl -fsSL https://anycap.ai/install.sh | sh</p>
              </div>
              <p className="text-sm text-[#4d5145]">Or: <code className="text-[12px] text-[#6b7d3a]" style={mono}>npm install -g @anycap/cli</code></p>
            </FadeIn>

            {/* Step 3 */}
            <FadeIn>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-8 flex items-center justify-center text-[13px] font-bold text-[#f4f5f0] bg-[#6b7d3a]" style={mono}>3</span>
                <h2 className="text-lg text-[#1c1f17]" style={{ ...pixel }}>Log in</h2>
              </div>
              <div className="bg-[#1c1f17] px-5 py-4">
                <p className="text-[13px] text-[#d4e0a4]" style={mono}>anycap login</p>
              </div>
            </FadeIn>

            {/* Step 4 */}
            <FadeIn>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-8 flex items-center justify-center text-[13px] font-bold text-[#f4f5f0] bg-[#6b7d3a]" style={mono}>4</span>
                <h2 className="text-lg text-[#1c1f17]" style={{ ...pixel }}>Discover available models</h2>
              </div>
              <div className="bg-[#1c1f17] px-5 py-4">
                <p className="text-[13px] text-[#d4e0a4]" style={mono}>anycap image models</p>
              </div>
              <p className="mt-3 text-sm text-[#4d5145]">Lists available image models: Seedream 5, Seedream 4.5, Nano Banana Pro, Nano Banana 2.</p>
            </FadeIn>

            {/* Step 5 */}
            <FadeIn>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-8 flex items-center justify-center text-[13px] font-bold text-[#f4f5f0] bg-[#6b7d3a]" style={mono}>5</span>
                <h2 className="text-lg text-[#1c1f17]" style={{ ...pixel }}>Generate your first image</h2>
              </div>
              <div className="bg-[#1c1f17] px-5 py-4">
                <p className="text-[13px] text-[#d4e0a4]" style={mono}>anycap image generate --model seedream_5 --prompt &quot;a minimalist product mockup&quot;</p>
              </div>
            </FadeIn>

            {/* Step 6 */}
            <FadeIn>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-8 flex items-center justify-center text-[13px] font-bold text-[#f4f5f0] bg-[#6b7d3a]" style={mono}>6</span>
                <h2 className="text-lg text-[#1c1f17]" style={{ ...pixel }}>Try more capabilities</h2>
              </div>
              <div className="bg-[#1c1f17] px-5 py-4 mb-3">
                <p className="text-[13px] text-[#6b7d3a] mb-1" style={mono}># Image read</p>
                <p className="text-[13px] text-[#d4e0a4] mb-3" style={mono}>anycap image read --url https://example.com/screenshot.png</p>
                <p className="text-[13px] text-[#6b7d3a] mb-1" style={mono}># Video analysis</p>
                <p className="text-[13px] text-[#d4e0a4]" style={mono}>anycap video read --url https://example.com/demo.mp4</p>
              </div>
            </FadeIn>
          </div>

          <div className="mt-16 md:mt-24"><hr className="border-t border-[#d4dbb8]" /></div>

          <FadeIn>
            <section className="mt-16 md:mt-24 mb-8">
              <div className="flex flex-wrap gap-4">
                <Link href="/for/claude-code" className="inline-block px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#f4f5f0] bg-[#6b7d3a] hover:bg-[#1c1f17] transition-colors rounded-lg" style={mono}>AnyCap for Claude Code</Link>
                <Link href="/capabilities" className="inline-block px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] border border-[#1c1f17] hover:bg-[#1c1f17] hover:text-[#f4f5f0] transition-colors rounded-lg" style={mono}>Any Capability</Link>
              </div>
            </section>
          </FadeIn>
        </div>
      </article>
    </>
  );
}
