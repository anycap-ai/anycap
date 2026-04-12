import type { Metadata } from "next";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import {
  CapabilityGapTable,
  type CapabilityGapRow,
} from "@/components/landing/CapabilityGapTable";
import { EarlyAccessBanner } from "@/components/landing/EarlyAccessBanner";
import { FadeIn } from "@/components/ui/FadeIn";
import { ArticleByline } from "@/components/seo/ArticleByline";
import { getSeoPageChrome } from "@/lib/seo-ia";
import { createFaqPageJsonLd, createTechArticleJsonLd } from "@/lib/schema";
import { siteConfig } from "@/lib/site";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;
const lastUpdatedLabel = "April 7, 2026";
const lastUpdatedIso = "2026-04-07";

export const metadata: Metadata = {
  title: "What AI agents can't do out of the box — and how to add capabilities",
  description:
    "AI agents can reason, but out of the box they still struggle with image generation, video generation, screenshot understanding, recording analysis, and shareable output workflows.",
  alternates: { canonical: "/learn/what-agents-cant-do" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/learn/what-agents-cant-do",
    siteName: siteConfig.siteName,
    title: "What AI agents can't do out of the box — and how to add capabilities",
    description:
      "See the most common capability gaps in modern AI agents and the shortest AnyCap path to close each one.",
  },
};

const articleJsonLd = createTechArticleJsonLd({
  headline: "What AI agents can't do out of the box — and how to add capabilities",
  description:
    "Problem-intent guide covering the capability gaps that appear when coding agents need image, video, and vision workflows.",
  path: "/learn/what-agents-cant-do",
  about: ["AI agents", "Coding agents", "Image generation", "Video generation", "Image understanding", "Video analysis"],
  keywords: [
    "what ai agents can't do",
    "coding agent limitations",
    "ai agent capability gaps",
    "ai agent can't generate video",
    "extend ai agent capabilities",
  ],
  datePublished: lastUpdatedIso,
  dateModified: lastUpdatedIso,
});

const faqItems = [
  {
    question: "What do AI agents usually miss first?",
    answer:
      "The first missing pieces are usually image generation, video generation, screenshot understanding, and recording analysis. The agent can plan the work, but it cannot finish those tasks through a consistent runtime.",
  },
  {
    question: "Can coding agents generate images or videos on their own?",
    answer:
      "Not as a built-in capability layer. Some agents can call custom tools, but most teams still need to add a consistent runtime for image generation, video generation, and media understanding.",
  },
  {
    question: "Do I need to switch agents to get those capabilities?",
    answer:
      "No. The point of AnyCap is to keep the agent you already use and add the missing capability layer around it.",
  },
  {
    question: "Where should I start if I already like my current agent?",
    answer:
      "Start with the capability page that matches the missing task, such as image generation, video generation, image understanding, or video analysis. If you need the agent-specific entry first, use the Equip Agents pages.",
  },
];

const faqJsonLd = createFaqPageJsonLd(faqItems);

const pageChrome = getSeoPageChrome("/learn/what-agents-cant-do");

const gapRows: CapabilityGapRow[] = [
  {
    capability: "Image generation",
    cells: [
      { label: "Not built in", tone: "muted" },
      { label: "Generate mockups, thumbnails, and creative assets", tone: "accent" },
      "Use the Image Generation capability page",
    ],
  },
  {
    capability: "Video generation",
    cells: [
      { label: "Not built in", tone: "muted" },
      { label: "Create demos, walkthroughs, and short clips", tone: "accent" },
      "Use the Video Generation capability page",
    ],
  },
  {
    capability: "Image understanding",
    cells: [
      { label: "No consistent agent runtime", tone: "muted" },
      { label: "Read screenshots, diagrams, and visual references", tone: "accent" },
      "Use the Image Understanding capability page",
    ],
  },
  {
    capability: "Video analysis",
    cells: [
      { label: "Separate provider work", tone: "muted" },
      { label: "Analyze recordings through the same CLI", tone: "accent" },
      "Use the Video Analysis capability page",
    ],
  },
];

const intentCards = [
  {
    eyebrow: "Image gap",
    title: "Image Generation",
    href: "/capabilities/image-generation",
    summary: "Best page when the missing capability is product visuals, marketing assets, mockups, or creative output.",
  },
  {
    eyebrow: "Video gap",
    title: "Video Generation",
    href: "/capabilities/video-generation",
    summary: "Best page when the missing capability is demos, walkthroughs, motion assets, or short clips.",
  },
  {
    eyebrow: "Vision gap",
    title: "Image Understanding",
    href: "/capabilities/image-understanding",
    summary: "Best page when the workflow starts from screenshots, diagrams, OCR, or visual QA.",
  },
  {
    eyebrow: "Analysis gap",
    title: "Video Analysis",
    href: "/capabilities/video-analysis",
    summary: "Best page when the problem lives in a recording instead of a text log or static screenshot.",
  },
] as const;

export default function WhatAgentsCantDoPage() {
  return (
    <>
      <BreadcrumbJsonLd items={pageChrome?.breadcrumbItems} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <article className="px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-[1280px] py-12 md:py-20 lg:py-24">
          <FadeIn>
            <p className="mb-4 text-[11px] tracking-[0.8px] text-[#6b7d3a]" style={mono}>
              {pageChrome?.eyebrow ?? "Learn"}
            </p>
            <ArticleByline
              className="mb-3"
              author={pageChrome?.authorLabel}
              updatedLabel={`Last updated ${lastUpdatedLabel}`}
            />
            <h1
              className="leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(32px, 6vw, 72px)" }}
            >
              AI agents can reason.
              <br />
              They still need capabilities.
            </h1>
            <p className="mt-6 max-w-[780px] text-base leading-7 text-[#4d5145] md:text-lg">
              The gap usually appears the same way every time: the agent can plan the work, but it
              cannot generate the image, create the video, read the screenshot, or inspect the
              recording through a consistent runtime. Whether you use Claude Code, Cursor, Codex,
              or another assistant shell, the fix is usually not a brand-new agent. It is the
              missing capability layer around the one you already like.
            </p>
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
                eyebrow="Common breakpoints"
                title="Where agents hit the wall first"
                description="These are the common workflows where coding agents hit a hard boundary and need an external capability layer."
                columns={[
                  { label: "Without AnyCap" },
                  { label: "Add with AnyCap", accent: true },
                  { label: "Best next move" },
                ]}
                rows={gapRows}
                footnote="Use the rightmost column to jump to the shortest next page for the exact missing capability."
              />
            </div>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-8 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                Choose the shortest page for the missing capability
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {intentCards.map((card) => (
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
                  href="/start"
                  className="inline-block rounded-lg bg-[#6b7d3a] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#f4f5f0] transition-colors hover:bg-[#1c1f17]"
                  style={mono}
                >
                  Get Started
                </Link>
                <Link
                  href="/for"
                  className="inline-block rounded-lg border border-[#1c1f17] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] transition-colors hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
                  style={mono}
                >
                  Equip Agents
                </Link>
                <Link
                  href="/capabilities"
                  className="inline-block rounded-lg border border-[#1c1f17] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] transition-colors hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
                  style={mono}
                >
                  Browse Capabilities
                </Link>
              </div>
            </section>
          </FadeIn>
        </div>
      </article>
    </>
  );
}
