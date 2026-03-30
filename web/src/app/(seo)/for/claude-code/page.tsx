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
  title: "Claude Code tools and capabilities — Add image, video, and vision with AnyCap",
  description:
    "Claude Code can code, but it still needs image generation, video generation, image understanding, and video analysis. AnyCap adds those capabilities through one install, one login, and one CLI.",
  alternates: { canonical: "/for/claude-code" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/for/claude-code",
    siteName: siteConfig.siteName,
    title: "Claude Code tools and capabilities — Add image, video, and vision with AnyCap",
    description:
      "Add image, video, and vision capabilities to Claude Code without switching agents or wiring provider SDKs.",
  },
};

const integrationGuideJsonLd = createTechArticleJsonLd({
  headline: "Claude Code tools and capabilities — Add image, video, and vision with AnyCap",
  description:
    "Guide to adding image generation, video generation, image understanding, and video analysis to Claude Code through one capability runtime.",
  path: "/for/claude-code",
  about: ["Claude Code", "AnyCap CLI", "Agent skills", "Capability runtime"],
  keywords: [
    "claude code tools",
    "claude code capabilities",
    "add tools to claude code",
    "can claude code generate images",
    "claude code plugins",
  ],
});

const faqItems = [
  {
    question: "Can Claude Code generate images on its own?",
    answer:
      "Not as a built-in capability layer. AnyCap adds image generation to Claude Code through one skill install and one CLI.",
  },
  {
    question: "Can Claude Code generate video on its own?",
    answer:
      "Not as a built-in agent runtime. AnyCap adds video generation through the same install path and auth flow as the rest of the capability stack.",
  },
  {
    question: "Does AnyCap replace Claude Code?",
    answer:
      "No. The point is to keep Claude Code and add the image, video, and vision capabilities it still needs.",
  },
  {
    question: "What is the fastest way to add tools to Claude Code?",
    answer:
      "Install the AnyCap skill, install the CLI, run anycap login, and then use the missing capability from the same command surface.",
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
      { label: "Generate visuals with Seedream 5 and Nano Banana Pro", tone: "accent" },
      "Claude Code image generation",
    ],
  },
  {
    capability: "Video generation",
    cells: [
      { label: "Not built in", tone: "muted" },
      { label: "Create demos and short clips with Veo 3.1", tone: "accent" },
      "Claude Code video generation",
    ],
  },
  {
    capability: "Image understanding",
    cells: [
      { label: "No consistent agent runtime", tone: "muted" },
      { label: "Use anycap image read for screenshots and diagrams", tone: "accent" },
      "Image Understanding page",
    ],
  },
  {
    capability: "Video analysis",
    cells: [
      { label: "Separate provider work", tone: "muted" },
      { label: "Inspect recordings through the same CLI", tone: "accent" },
      "Video Analysis page",
    ],
  },
  {
    capability: "One auth flow",
    cells: [
      { label: "Per-provider setup", tone: "muted" },
      { label: "One login for every capability", tone: "accent" },
      "Start with AnyCap",
    ],
  },
];

const installSteps = [
  {
    title: "Install the skill",
    subtitle: "Step 1",
    code: "npx -y skills add anycap-ai/anycap -a claude-code -y",
    note: "This teaches Claude Code how to discover and invoke the AnyCap capability runtime.",
  },
  {
    title: "Install the CLI",
    subtitle: "Step 2",
    code: "curl -fsSL https://anycap.ai/install.sh | sh",
    note: "Or install via npm if that better matches your workstation setup.",
  },
  {
    title: "Log in and verify",
    subtitle: "Step 3",
    code: "anycap login && anycap status",
    note: "Once authenticated, Claude Code can use the same interface for image, video, and vision workflows.",
  },
];

const capabilityCards = [
  {
    eyebrow: "Highest intent",
    title: "Claude Code image generation",
    href: "/for/claude-code/image-generation",
    summary: "Best page when the missing capability is product visuals, mockups, or creative assets.",
    command: "anycap image generate",
  },
  {
    eyebrow: "Highest intent",
    title: "Claude Code video generation",
    href: "/for/claude-code/video-generation",
    summary: "Best page when the gap is demos, walkthroughs, or short-form video output.",
    command: "anycap video generate",
  },
  {
    eyebrow: "Vision",
    title: "Image Understanding",
    href: "/capabilities/image-understanding",
    summary: "Use this when the workflow starts from screenshots, diagrams, OCR, or visual QA.",
    command: "anycap image read",
  },
  {
    eyebrow: "Analysis",
    title: "Video Analysis",
    href: "/capabilities/video-analysis",
    summary: "Use this when the agent needs to inspect recordings and extract structured details.",
    command: "anycap video read",
  },
];

export default function ForClaudeCodePage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "AnyCap for Claude Code" },
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
              For Claude Code
            </p>
            <h1
              className="leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(32px, 6vw, 72px)" }}
            >
              Claude Code can code.
              <br />
              It still needs image, video, and vision capabilities.
            </h1>
            <p className="mt-6 max-w-[780px] text-base leading-7 text-[#4d5145] md:text-lg">
              Claude Code is great at planning, refactoring, and code execution. What it still
              needs is a consistent capability layer for image generation, video generation, image
              understanding, and video analysis. AnyCap adds those capabilities through one skill,
              one login, and one CLI, so you do not need to switch agents or wire provider SDKs by
              hand.
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
                href="/for/claude-code/image-generation"
                className="inline-block rounded-lg border border-[#1c1f17] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] transition-colors hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
                style={mono}
              >
                Claude Code image generation
              </Link>
              <Link
                href="/for/claude-code/video-generation"
                className="inline-block rounded-lg border border-[#1c1f17] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] transition-colors hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
                style={mono}
              >
                Claude Code video generation
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
                title="Where Claude Code still needs help"
                description="The missing layer is not reasoning. It is access to a unified runtime for image, video, and vision workflows."
                columns={[
                  { label: "Claude Code alone" },
                  { label: "Add with AnyCap", accent: true },
                  { label: "Best next step" },
                ]}
                rows={gapRows}
                footnote="This page is the ecosystem hub. The most specific queries should flow into the targeted Claude Code x capability pages."
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
                  href="/guides/add-tools-to-claude-code"
                  className="inline-block rounded-lg bg-[#6b7d3a] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#f4f5f0] transition-colors hover:bg-[#1c1f17]"
                  style={mono}
                >
                  Add Tools to Claude Code
                </Link>
                <Link
                  href="/start"
                  className="inline-block rounded-lg border border-[#1c1f17] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] transition-colors hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
                  style={mono}
                >
                  Get Started
                </Link>
                <Link
                  href="/capabilities"
                  className="inline-block rounded-lg border border-[#1c1f17] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] transition-colors hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
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
