import type { Metadata } from "next";
import { LocalizedLink as Link } from "@/components/LocalizedLink";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import {
  CapabilityGapTable,
  type CapabilityGapRow,
} from "@/components/CapabilityGapTable";
import { EarlyAccessBanner } from "@/components/EarlyAccessBanner";
import { FadeIn } from "@/components/FadeIn";
import { createTechArticleJsonLd } from "@/lib/schema";
import { siteConfig } from "@/lib/site";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

export const metadata: Metadata = {
  title: "Cursor tools and capabilities — Add image, video, and vision with AnyCap",
  description:
    "Cursor is strong at coding and workspace-aware edits, but it still needs image generation, video generation, image understanding, and video analysis. AnyCap adds those capabilities through one skill, one login, and one CLI.",
  alternates: { canonical: "/for/cursor" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/for/cursor",
    siteName: siteConfig.siteName,
    title: "Cursor tools and capabilities — Add image, video, and vision with AnyCap",
    description:
      "Add image, video, and vision capabilities to Cursor without switching agents or stitching together separate provider workflows.",
  },
};

const integrationGuideJsonLd = createTechArticleJsonLd({
  headline: "Cursor tools and capabilities — Add image, video, and vision with AnyCap",
  description:
    "Guide to adding image generation, video generation, image understanding, and video analysis to Cursor through one capability runtime.",
  path: "/for/cursor",
  about: ["Cursor", "AnyCap CLI", "Agent skills", "Capability runtime"],
  keywords: [
    "cursor tools",
    "add tools to cursor",
    "cursor skills",
    "cursor image generation",
    "cursor mcp tools",
  ],
});

const faqItems = [
  {
    question: "Can Cursor generate images on its own?",
    answer:
      "Not as a built-in capability layer. AnyCap adds image generation to Cursor through one skill install and one CLI.",
  },
  {
    question: "Can Cursor read screenshots and recordings through one runtime?",
    answer:
      "Not consistently by default. AnyCap gives Cursor one runtime for image understanding and video analysis, so those workflows do not turn into separate provider setups.",
  },
  {
    question: "Does AnyCap replace Cursor?",
    answer:
      "No. The point is to keep Cursor and add the image, video, and vision capabilities it still needs.",
  },
  {
    question: "What is the fastest way to add capabilities to Cursor?",
    answer:
      "Install the AnyCap skill, install the CLI, run anycap login, and then call the missing capability from the same command surface.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

const gapRows: CapabilityGapRow[] = [
  {
    capability: "Image generation",
    cells: [
      { label: "Not built in", tone: "muted" },
      { label: "Generate visuals and mockups through one runtime", tone: "accent" },
      "Image Generation page",
    ],
  },
  {
    capability: "Video generation",
    cells: [
      { label: "Not built in", tone: "muted" },
      { label: "Create walkthroughs and motion output through one CLI", tone: "accent" },
      "Video Generation page",
    ],
  },
  {
    capability: "Image understanding",
    cells: [
      { label: "No unified runtime", tone: "muted" },
      { label: "Read screenshots, diagrams, and visual QA inputs", tone: "accent" },
      "Image Understanding page",
    ],
  },
  {
    capability: "Video analysis",
    cells: [
      { label: "Separate provider work", tone: "muted" },
      { label: "Inspect recordings from the same command surface", tone: "accent" },
      "Video Analysis page",
    ],
  },
  {
    capability: "One auth flow",
    cells: [
      { label: "Per-provider setup", tone: "muted" },
      { label: "One login for every capability", tone: "accent" },
      "Get Started page",
    ],
  },
];

const installSteps = [
  {
    title: "Install the skill",
    subtitle: "Step 1",
    code: "npx -y skills add anycap-ai/anycap -a cursor -y",
    note: "This teaches Cursor how to discover and invoke the AnyCap capability runtime inside its existing workflow.",
  },
  {
    title: "Install the CLI",
    subtitle: "Step 2",
    code: "curl -fsSL https://anycap.ai/install.sh | sh",
    note: "Once the CLI is installed, Cursor gets one stable command surface instead of a new SDK or script for every missing capability.",
  },
  {
    title: "Log in and verify",
    subtitle: "Step 3",
    code: "anycap login && anycap status",
    note: "After authentication, Cursor can move across image, video, and vision workflows without changing tools.",
  },
];

const capabilityCards = [
  {
    eyebrow: "Creative output",
    title: "Image Generation",
    href: "/capabilities/image-generation",
    summary: "Best next page when Cursor needs product visuals, marketing assets, UI mockups, or creative output.",
    command: "anycap image generate",
  },
  {
    eyebrow: "Motion output",
    title: "Video Generation",
    href: "/capabilities/video-generation",
    summary: "Best next page when the workflow needs demos, walkthroughs, or motion prototypes.",
    command: "anycap video generate",
  },
  {
    eyebrow: "Vision",
    title: "Image Understanding",
    href: "/capabilities/image-understanding",
    summary: "Best next page when Cursor needs to read screenshots, diagrams, OCR, or design feedback.",
    command: "anycap image read",
  },
  {
    eyebrow: "Analysis",
    title: "Video Analysis",
    href: "/capabilities/video-analysis",
    summary: "Best next page when Cursor needs to inspect recordings and extract structured details.",
    command: "anycap video read",
  },
];

export default function ForCursorPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "AnyCap for Cursor" },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(integrationGuideJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <article className="px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-[1280px] py-12 md:py-20 lg:py-24">
          <FadeIn>
            <p className="mb-4 text-[11px] tracking-[0.8px] text-[#6b7d3a]" style={mono}>
              For Cursor
            </p>
            <h1
              className="leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(32px, 6vw, 72px)" }}
            >
              Cursor can edit code fast.
              <br />
              It still needs image, video, and vision capabilities.
            </h1>
            <p className="mt-6 max-w-[780px] text-base leading-7 text-[#4d5145] md:text-lg">
              Cursor is excellent at workspace-aware edits, refactors, and code navigation. The
              gap appears when the workflow leaves pure code and needs product visuals, walkthrough
              videos, screenshot understanding, or recording review. AnyCap adds that missing
              capability layer through one skill, one login, and one CLI, so you keep Cursor and
              extend what it can actually do.
            </p>
            <p className="mt-4 text-sm leading-6 text-[#6b7d3a]" style={mono}>
              Don&apos;t switch agents. Add capabilities immediately.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/start"
                className="inline-block rounded-lg bg-[#6b7d3a] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#f4f5f0] transition-colors hover:bg-[#1c1f17]"
                style={mono}
              >
                Get Started
              </Link>
              <Link
                href="/capabilities/image-generation"
                className="inline-block rounded-lg border border-[#1c1f17] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] transition-colors hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
                style={mono}
              >
                Image Generation
              </Link>
              <Link
                href="/capabilities/image-understanding"
                className="inline-block rounded-lg border border-[#1c1f17] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] transition-colors hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
                style={mono}
              >
                Image Understanding
              </Link>
            </div>
          </FadeIn>

          <FadeIn className="mt-8">
            <EarlyAccessBanner />
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <div className="mt-16 md:mt-24">
              <CapabilityGapTable
                eyebrow="Capability gap"
                title="Where Cursor still needs help"
                description="Cursor can stay excellent at coding while AnyCap fills the workflows that need image, video, and vision capabilities."
                columns={[
                  { label: "Cursor alone" },
                  { label: "Add with AnyCap", accent: true },
                  { label: "Best next step" },
                ]}
                rows={gapRows}
                footnote="This page is the Cursor hub. Until Cursor-specific deep pages exist, the next steps route directly to the capability pages that close each gap fastest."
              />
            </div>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-8 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                Install in 3 steps
              </h2>
              <div className="grid gap-6 lg:grid-cols-3">
                {installSteps.map((step) => (
                  <div key={step.title} className="border-l-[3px] border-[#6b7d3a] pl-6">
                    <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                      {step.subtitle}
                    </p>
                    <h3 className="mb-3 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                      {step.title}
                    </h3>
                    <div className="bg-[#1c1f17] px-5 py-4">
                      <p className="break-all text-[13px] text-[#d4e0a4]" style={mono}>
                        {step.code}
                      </p>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-[#4d5145]">{step.note}</p>
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
                Start with the first missing capability
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {capabilityCards.map((card) => (
                  <Link
                    key={card.href}
                    href={card.href}
                    className="rounded-xl border border-[#d4dbb8] bg-[#fffffc]/70 p-6 transition-colors hover:border-[#6b7d3a]"
                  >
                    <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                      {card.eyebrow}
                    </p>
                    <h3 className="mb-3 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                      {card.title}
                    </h3>
                    <p className="text-sm leading-6 text-[#4d5145]">{card.summary}</p>
                    <p className="mt-4 text-[12px] text-[#6b7d3a]" style={mono}>
                      {card.command}
                    </p>
                  </Link>
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
                FAQ
              </h2>
              <div className="max-w-[860px] space-y-6">
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
                  href="/start"
                  className="inline-block rounded-lg bg-[#6b7d3a] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#f4f5f0] transition-colors hover:bg-[#1c1f17]"
                  style={mono}
                >
                  Get Started
                </Link>
                <Link
                  href="/cli"
                  className="inline-block rounded-lg border border-[#1c1f17] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] transition-colors hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
                  style={mono}
                >
                  Why One CLI Matters
                </Link>
                <Link
                  href="/skills"
                  className="inline-block rounded-lg border border-[#1c1f17] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] transition-colors hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
                  style={mono}
                >
                  How Skills Fit
                </Link>
              </div>
            </section>
          </FadeIn>
        </div>
      </article>
    </>
  );
}
