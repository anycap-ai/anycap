import type { Metadata } from "next";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { EarlyAccessBanner } from "@/components/landing/EarlyAccessBanner";
import { FadeIn } from "@/components/ui/FadeIn";
import { createTechArticleJsonLd } from "@/lib/schema";
import { siteConfig } from "@/lib/site";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

export const metadata: Metadata = {
  title: "Image Understanding — Vision for AI agents",
  description:
    "Give AI agents image understanding through AnyCap. Analyze screenshots, diagrams, photos, and charts through one CLI command without wiring a separate vision stack for every workflow.",
  alternates: { canonical: "/capabilities/image-understanding" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/capabilities/image-understanding",
    siteName: siteConfig.siteName,
    title: "Image Understanding — Vision for AI agents",
    description:
      "Add image understanding to AI agents with one CLI and one capability runtime.",
  },
};

const capabilityGuideJsonLd = createTechArticleJsonLd({
  headline: "Image Understanding — Vision for AI agents",
  description:
    "Capability guide for adding image understanding to AI agents through AnyCap, including screenshots, diagrams, OCR, and chart analysis.",
  path: "/capabilities/image-understanding",
  about: ["Image understanding", "Vision for AI agents", "OCR", "AnyCap"],
  keywords: ["image understanding for ai agents", "vision api for agents", "image recognition api", "ocr for agents"],
});

const usageExamples = [
  {
    title: "Analyze a remote screenshot",
    code: "anycap image read --url https://example.com/screenshot.png",
  },
  {
    title: "Inspect a local diagram",
    code: "anycap image read --file ./architecture-diagram.png",
  },
  {
    title: "Ask a focused question",
    code: "anycap image read --url https://example.com/chart.png --prompt \"What trend changes after Q2?\"",
  },
];

const useCases = [
  "Understand UI states and bug screenshots without leaving the agent workflow.",
  "Read architecture diagrams and flowcharts before generating code or docs.",
  "Extract structured detail from charts, tables, or screenshots with embedded text.",
  "Review visual assets, product images, and design references through one runtime.",
];

export default function ImageUnderstandingPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Capabilities", href: "/capabilities" },
          { name: "Image Understanding" },
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
              Image Understanding
            </h1>
            <p className="mt-6 max-w-[760px] text-base leading-7 text-[#4d5145] md:text-lg">
              AnyCap gives agents a consistent image understanding layer for screenshots,
              diagrams, charts, and visual references. Instead of wiring a different vision API
              for each workflow, the agent gets one command surface for visual analysis, OCR, and
              context extraction across Claude Code, Cursor, Codex, and the rest of your agent
              stack.
            </p>
            <div className="mt-6 max-w-[800px] rounded-xl border border-[#d4dbb8] bg-[#f9faf5] px-5 py-4">
              <p className="mb-1 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                Naming note
              </p>
              <p className="text-sm leading-6 text-[#4d5145]">
                The page uses market language that matches search intent. The CLI command stays{" "}
                <code className="text-[12px] text-[#6b7d3a]" style={mono}>
                  anycap image read
                </code>
                .
              </p>
            </div>
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
                CLI usage
              </h2>
              <div className="space-y-6 max-w-[820px]">
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
                When agents need image understanding
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 max-w-[920px]">
                {useCases.map((useCase) => (
                  <div key={useCase} className="border-l-[3px] border-[#6b7d3a] pl-5">
                    <p className="text-sm leading-6 text-[#4d5145]">{useCase}</p>
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
              <h2 className="mb-8 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                Related pages
              </h2>
              <div className="grid gap-4 sm:grid-cols-3 max-w-[1100px]">
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
                    See how image understanding fits into the broader Claude Code capability story.
                  </p>
                </Link>
                <Link
                  href="/learn/what-agents-cant-do"
                  className="rounded-xl border border-[#d4dbb8] p-5 transition-colors hover:border-[#6b7d3a]"
                >
                  <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                    Learn
                  </p>
                  <h3 className="mb-2 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                    What agents can&apos;t do
                  </h3>
                  <p className="text-sm leading-6 text-[#4d5145]">
                    Move up one level if you want the full deficiency narrative and page map.
                  </p>
                </Link>
                <Link
                  href="/capabilities/video-analysis"
                  className="rounded-xl border border-[#d4dbb8] p-5 transition-colors hover:border-[#6b7d3a]"
                >
                  <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                    Related capability
                  </p>
                  <h3 className="mb-2 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                    Video Analysis
                  </h3>
                  <p className="text-sm leading-6 text-[#4d5145]">
                    Pair image and video understanding when the workflow spans screenshots and recordings.
                  </p>
                </Link>
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24 mb-8">
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/capabilities"
                  className="inline-block rounded-lg bg-[#6b7d3a] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#f4f5f0] transition-colors hover:bg-[#1c1f17]"
                  style={mono}
                >
                  All Capabilities
                </Link>
                <Link
                  href="/start"
                  className="inline-block rounded-lg border border-[#1c1f17] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] transition-colors hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
                  style={mono}
                >
                  Get Started
                </Link>
              </div>
            </section>
          </FadeIn>
        </div>
      </article>
    </>
  );
}
