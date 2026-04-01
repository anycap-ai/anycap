import type { Metadata } from "next";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { siteConfig } from "@/lib/site";
import { EarlyAccessBanner } from "@/components/landing/EarlyAccessBanner";
import { VideoReadDemo } from "@/components/landing/VideoReadDemo";
import { FadeIn } from "@/components/ui/FadeIn";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { createTechArticleJsonLd } from "@/lib/schema";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

export const metadata: Metadata = {
  title: "Video Analysis API for AI agents - Video understanding and video intelligence",
  description:
    "Give AI agents video analysis through AnyCap. Analyze recordings, summarize scenes, and extract video intelligence through one CLI command across Claude Code, Cursor, and more.",
  alternates: { canonical: "/capabilities/video-analysis" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/capabilities/video-analysis",
    siteName: siteConfig.siteName,
    title: "Video Analysis API for AI agents - Video understanding and video intelligence",
    description:
      "Give AI agents video analysis through AnyCap. Analyze recordings, summarize scenes, and extract video intelligence through one CLI command across Claude Code, Cursor, and more.",
  },
};

const usageExamples = [
  {
    title: "Analyze a remote video",
    code: "anycap actions video-read --url https://example.com/demo.mp4",
  },
  {
    title: "Analyze a local video",
    code: "anycap actions video-read --file ./recording.mp4",
  },
  {
    title: "Ask for a focused summary",
    code:
      'anycap actions video-read --url https://example.com/demo.mp4 --instruction "Summarize the key events and UI transitions"',
  },
] as const;

const faqItems = [
  {
    question: "What does AnyCap video analysis let agents do?",
    answer:
      "It gives agents one interface for video understanding across screen recordings, product demos, and visual walkthroughs. That includes scene summaries, key event extraction, and focused video intelligence tasks through the same CLI surface.",
  },
  {
    question: "Why does the CLI command use video-read while the page says video analysis?",
    answer:
      "The page uses the market language teams search for, while the CLI uses the concise command name `anycap actions video-read`. Both refer to the same capability surface.",
  },
  {
    question: "When should teams think of this as video understanding or video intelligence?",
    answer:
      "Those phrases describe the same practical need: turning video content into usable context for an agent. Video analysis is the page name, while video understanding and video intelligence are common search and evaluation terms.",
  },
  {
    question: "Is this effectively a video analysis API for agent workflows?",
    answer:
      "Yes. Teams can think of it as a video analysis API exposed through the AnyCap CLI, which makes it easier to use inside agent workflows than wiring a separate provider-specific stack.",
  },
] as const;

const capabilityGuideJsonLd = createTechArticleJsonLd({
  headline: "Video Analysis API for AI agents - Video understanding and video intelligence",
  description:
    "Capability guide for adding video analysis to AI agents through AnyCap, including recordings, walkthroughs, bug reports, and product demos.",
  path: "/capabilities/video-analysis",
  about: ["Video analysis", "Video understanding", "Video intelligence", "AnyCap"],
  keywords: [
    "video analysis for ai agents",
    "video understanding api",
    "ai video analysis api",
    "video intelligence api",
  ],
});

export default function VideoAnalysisPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Capabilities", href: "/capabilities" },
          { name: "Video Analysis" },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(capabilityGuideJsonLd) }}
      />
      <article className="px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-[1280px] py-12 md:py-20 lg:py-24">
          <FadeIn>
            <p className="mb-4 text-[11px] tracking-[0.8px] text-[#6b7d3a]" style={mono}>
              Capability
            </p>
            <h1
              className="leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(32px, 6vw, 72px)" }}
            >
              Video Analysis
            </h1>
            <p className="mt-6 max-w-[760px] text-base leading-7 text-[#4d5145] md:text-lg">
              AnyCap video analysis lets AI agents understand video content through one CLI
              command. Agents can summarize recordings, extract key events, identify visual
              context, and run video understanding tasks without managing a separate video
              intelligence stack. The capability works across Claude Code, Cursor, Codex, and
              other agent products through the same auth flow and command surface as the rest of
              AnyCap.
            </p>
          </FadeIn>

          <FadeIn className="mt-8">
            <EarlyAccessBanner />
          </FadeIn>

          <FadeIn className="mt-10">
            <VideoReadDemo />
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-6 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                CLI usage
              </h2>
              <div className="space-y-6 max-w-[860px]">
                {usageExamples.map((example) => (
                  <div key={example.title}>
                    <p className="mb-3 text-[11px] tracking-[0.5px] text-[#5a5e52]" style={mono}>
                      {example.title}
                    </p>
                    <div className="bg-[#1c1f17] px-5 py-4">
                      <p className="break-all text-[13px] text-[#d4e0a4]" style={mono}>
                        {example.code}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-6 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                When agents need video analysis
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 max-w-[920px]">
                <div className="border-l-[3px] border-[#6b7d3a] pl-5">
                  <p className="mb-1 text-sm font-medium text-[#1c1f17]">Bug reproduction</p>
                  <p className="text-sm leading-6 text-[#4d5145]">
                    Analyze screen recordings to understand bug reports and reproduction steps.
                  </p>
                </div>
                <div className="border-l-[3px] border-[#6b7d3a] pl-5">
                  <p className="mb-1 text-sm font-medium text-[#1c1f17]">Demo review</p>
                  <p className="text-sm leading-6 text-[#4d5145]">
                    Summarize product demos and walkthrough recordings for docs and handoffs.
                  </p>
                </div>
                <div className="border-l-[3px] border-[#6b7d3a] pl-5">
                  <p className="mb-1 text-sm font-medium text-[#1c1f17]">Content analysis</p>
                  <p className="text-sm leading-6 text-[#4d5145]">
                    Extract key moments, transitions, and visual context from recorded material.
                  </p>
                </div>
                <div className="border-l-[3px] border-[#6b7d3a] pl-5">
                  <p className="mb-1 text-sm font-medium text-[#1c1f17]">QA automation</p>
                  <p className="text-sm leading-6 text-[#4d5145]">
                    Verify UI behavior in recorded test sessions as part of agent-driven QA.
                  </p>
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
                Related pages
              </h2>
              <div className="grid gap-4 sm:grid-cols-3 max-w-[1100px]">
                <Link
                  href="/capabilities/image-understanding"
                  className="rounded-xl border border-[#d4dbb8] p-5 transition-colors hover:border-[#6b7d3a]"
                >
                  <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                    Related capability
                  </p>
                  <h3 className="mb-2 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                    Image Understanding
                  </h3>
                  <p className="text-sm leading-6 text-[#4d5145]">
                    Pair image and video understanding when workflows span screenshots and recorded
                    sessions.
                  </p>
                </Link>
                <Link
                  href="/for/claude-code"
                  className="rounded-xl border border-[#d4dbb8] p-5 transition-colors hover:border-[#6b7d3a]"
                >
                  <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                    Agent page
                  </p>
                  <h3 className="mb-2 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                    For Claude Code
                  </h3>
                  <p className="text-sm leading-6 text-[#4d5145]">
                    See how video analysis fits into the broader Claude Code capability story.
                  </p>
                </Link>
                <Link
                  href="/cli"
                  className="rounded-xl border border-[#d4dbb8] p-5 transition-colors hover:border-[#6b7d3a]"
                >
                  <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                    CLI
                  </p>
                  <h3 className="mb-2 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                    AnyCap CLI
                  </h3>
                  <p className="text-sm leading-6 text-[#4d5145]">
                    Explore how the same CLI surface handles analysis and generation workflows.
                  </p>
                </Link>
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-8 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                FAQ
              </h2>
              <div className="space-y-6 max-w-[860px]">
                {faqItems.map((item) => (
                  <div key={item.question} className="rounded-xl border border-[#d4dbb8] p-5">
                    <h3 className="mb-2 text-[14px] font-bold text-[#1c1f17]" style={mono}>
                      {item.question}
                    </h3>
                    <p className="text-sm leading-6 text-[#4d5145]">{item.answer}</p>
                  </div>
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
                  href="/capabilities"
                  className="inline-block rounded-lg border border-[#1c1f17] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] transition-colors hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
                  style={mono}
                >
                  Any Capability
                </Link>
                <Link
                  href="/cli"
                  className="inline-block rounded-lg border border-[#1c1f17] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] transition-colors hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
                  style={mono}
                >
                  Explore the CLI
                </Link>
              </div>
            </section>
          </FadeIn>
        </div>
      </article>
    </>
  );
}
