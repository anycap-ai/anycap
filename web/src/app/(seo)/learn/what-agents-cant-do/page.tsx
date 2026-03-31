import type { Metadata } from "next";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import {
  CapabilityGapTable,
  type CapabilityGapRow,
} from "@/components/landing/CapabilityGapTable";
import { EarlyAccessBanner } from "@/components/landing/EarlyAccessBanner";
import { FadeIn } from "@/components/ui/FadeIn";
import { createTechArticleJsonLd } from "@/lib/schema";
import { siteConfig } from "@/lib/site";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

export const metadata: Metadata = {
  title: "What AI agents can't do out of the box — and how to add capabilities",
  description:
    "AI agents can reason, but they still need capabilities for image generation, video generation, image understanding, and video analysis. See the common gaps and the fastest AnyCap pages to close them.",
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
  about: ["AI agents", "Claude Code", "Image generation", "Video generation", "Image understanding"],
  keywords: ["what ai agents can't do", "can claude code generate images", "ai agent can't generate video", "extend ai agent capabilities"],
});

const faqItems = [
  {
    question: "Can Claude Code generate images on its own?",
    answer:
      "Not as a built-in capability layer. AnyCap adds image generation to Claude Code through one install path and one CLI.",
  },
  {
    question: "What do coding agents usually miss first?",
    answer:
      "The biggest missing pieces are usually image generation, video generation, image understanding, and video analysis.",
  },
  {
    question: "Do I need to switch agents to get those capabilities?",
    answer:
      "No. The point of AnyCap is to keep the agent you already use and add the missing capability layer around it.",
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
      { label: "Generate mockups, thumbnails, and creative assets", tone: "accent" },
      "Start with Claude Code image generation",
    ],
  },
  {
    capability: "Video generation",
    cells: [
      { label: "Not built in", tone: "muted" },
      { label: "Create demos, walkthroughs, and short clips", tone: "accent" },
      "Start with Claude Code video generation",
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
    title: "Claude Code image generation",
    href: "/for/claude-code/image-generation",
    summary: "Best page when the problem is product visuals, marketing assets, or creative output.",
  },
  {
    eyebrow: "Video gap",
    title: "Claude Code video generation",
    href: "/for/claude-code/video-generation",
    summary: "Best page when the missing capability is demos, walkthroughs, or video clips.",
  },
  {
    eyebrow: "Vision gap",
    title: "Image Understanding",
    href: "/capabilities/image-understanding",
    summary: "Best page when the workflow starts from screenshots, diagrams, OCR, or visual QA.",
  },
  {
    eyebrow: "Universal install",
    title: "Get Started",
    href: "/start",
    summary: "Best page when you want the quickest install path before choosing specific capability pages.",
  },
];

export default function WhatAgentsCantDoPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "What agents can't do" },
        ]}
      />
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
              Learn
            </p>
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
              recording through a consistent runtime. That is the gap AnyCap closes. You keep the
              agent. You add the missing capability layer.
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
                eyebrow="Problem intent"
                title="Where the gap shows up first"
                description="These are the common workflows where coding agents hit a hard boundary and need an external capability layer."
                columns={[
                  { label: "Without AnyCap" },
                  { label: "Add with AnyCap", accent: true },
                  { label: "Best next move" },
                ]}
                rows={gapRows}
                footnote="The rightmost column maps each problem to the highest-intent page in the current site architecture."
              />
            </div>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-8 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                Choose the shortest page for your missing capability
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
                  href="/for/claude-code"
                  className="inline-block rounded-lg border border-[#1c1f17] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] transition-colors hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
                  style={mono}
                >
                  For Claude Code
                </Link>
                <Link
                  href="/capabilities"
                  className="inline-block rounded-lg border border-[#1c1f17] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] transition-colors hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
                  style={mono}
                >
                  Any Capability
                </Link>
              </div>
            </section>
          </FadeIn>
        </div>
      </article>
    </>
  );
}
