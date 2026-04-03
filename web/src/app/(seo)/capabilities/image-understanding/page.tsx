import type { Metadata } from "next";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { EarlyAccessBanner } from "@/components/landing/EarlyAccessBanner";
import { ImageReadDemo } from "@/components/landing/ImageReadDemo";
import { FadeIn } from "@/components/ui/FadeIn";
import { createTechArticleJsonLd } from "@/lib/schema";
import { siteConfig } from "@/lib/site";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

export const metadata: Metadata = {
  title: "Image Understanding API for AI agents - Vision, OCR, and image analysis",
  description:
    "Give AI agents image understanding through AnyCap. Analyze screenshots, diagrams, photos, charts, and OCR-heavy visuals through one CLI command without wiring a separate vision or image analysis stack.",
  alternates: { canonical: "/capabilities/image-understanding" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/capabilities/image-understanding",
    siteName: siteConfig.siteName,
    title: "Image Understanding API for AI agents - Vision, OCR, and image analysis",
    description:
      "Add image understanding, OCR, and image analysis to AI agents with one CLI and one capability runtime.",
  },
};

const capabilityGuideJsonLd = createTechArticleJsonLd({
  headline: "Image Understanding API for AI agents - Vision, OCR, and image analysis",
  description:
    "Capability guide for adding image understanding to AI agents through AnyCap, including screenshots, diagrams, OCR, and chart analysis.",
  path: "/capabilities/image-understanding",
  about: ["Image understanding", "Vision for AI agents", "OCR", "AnyCap"],
  keywords: [
    "image understanding for ai agents",
    "vision api for agents",
    "image analysis api",
    "image recognition api",
    "ocr api",
  ],
});

const usageExamples = [
  {
    title: "Analyze a remote screenshot",
    code: "anycap actions image-read --url https://example.com/screenshot.png",
  },
  {
    title: "Inspect a local diagram",
    code: "anycap actions image-read --file ./architecture-diagram.png",
  },
  {
    title: "Ask a focused question",
    code:
      'anycap actions image-read --url https://example.com/chart.png --instruction "What trend changes after Q2?"',
  },
];

const useCases = [
  "Understand UI states and bug screenshots without leaving the agent workflow.",
  "Read architecture diagrams and flowcharts before generating code or docs.",
  "Extract structured detail from charts, tables, or screenshots with embedded text.",
  "Review visual assets, product images, and design references through one runtime.",
];

const faqItems = [
  {
    question: "What does AnyCap image understanding let agents do?",
    answer:
      "It gives agents one interface for visual analysis across screenshots, diagrams, product images, charts, and scanned text. In practice that means one vision API surface for description, OCR, comparison, and focused question answering.",
  },
  {
    question: "Why is the page called image understanding when the CLI command is image-read?",
    answer:
      "The page uses search-friendly language that matches how teams describe the problem, while the CLI keeps the more compact command name `anycap actions image-read`.",
  },
  {
    question: "When should teams think of this as a vision API or image analysis API?",
    answer:
      "Both phrases are valid. Image understanding is the capability name, while vision API and image analysis API are the market terms people often use when they want OCR, screenshot interpretation, chart reading, or visual reasoning in agent workflows.",
  },
  {
    question: "Does this also work as an OCR API for agent workflows?",
    answer:
      "Yes. OCR is one of the practical jobs inside the image understanding capability, especially for screenshots, scanned text, diagrams, dashboards, and charts that agents need to read before acting.",
  },
] as const;

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
              Capabilities
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
              or image analysis API for each workflow, the agent gets one command surface for
              visual analysis, OCR, and context extraction across Claude Code, Cursor, Codex, and
              the rest of your agent stack.
            </p>
            <div className="mt-6 max-w-[800px] rounded-xl border border-[#d4dbb8] bg-[#f9faf5] px-5 py-4">
              <p className="mb-1 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                Naming note
              </p>
              <p className="text-sm leading-6 text-[#4d5145]">
                The page uses market language that matches search intent. The CLI command stays{" "}
                <code className="text-[12px] text-[#6b7d3a]" style={mono}>
                  anycap actions image-read
                </code>
                .
              </p>
            </div>
          </FadeIn>

          <FadeIn className="mt-8">
            <EarlyAccessBanner />
          </FadeIn>

          <FadeIn className="mt-10">
            <ImageReadDemo />
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
                <Link
                  href="/capabilities"
                  className="inline-block rounded-lg bg-[#6b7d3a] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#f4f5f0] transition-colors hover:bg-[#1c1f17]"
                  style={mono}
                >
                  Any Capability
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
