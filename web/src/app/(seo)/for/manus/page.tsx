import type { Metadata } from "next";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { CapabilityGapTable } from "@/components/landing/CapabilityGapTable";
import { EarlyAccessBanner } from "@/components/landing/EarlyAccessBanner";
import { FadeIn } from "@/components/ui/FadeIn";
import { buildAgentCapabilityGapRows } from "@/lib/capability-inventory";
import { createFaqPageJsonLd, createTechArticleJsonLd } from "@/lib/schema";
import { siteConfig } from "@/lib/site";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

export const metadata: Metadata = {
  title: "Manus tools and capabilities - Add image, video, and vision with AnyCap",
  description:
    "Manus is strong at autonomous workflows, but teams still need a dedicated runtime for image generation, video generation, image understanding, and video analysis. AnyCap adds those capabilities through one skill, one login, and one CLI.",
  alternates: { canonical: "/for/manus" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/for/manus",
    siteName: siteConfig.siteName,
    title: "Manus tools and capabilities - Add image, video, and vision with AnyCap",
    description:
      "Add a dedicated image, video, and vision runtime to Manus without replacing the agent workflow you already use.",
  },
};

const integrationGuideJsonLd = createTechArticleJsonLd({
  headline: "Manus tools and capabilities - Add image, video, and vision with AnyCap",
  description:
    "Guide to adding image generation, video generation, image understanding, and video analysis to Manus through one capability runtime.",
  path: "/for/manus",
  about: ["Manus", "AnyCap CLI", "Agent skills", "Capability runtime"],
  keywords: [
    "manus tools",
    "manus skills",
    "manus capabilities",
    "manus image generation",
    "manus agent skills",
  ],
});

const faqItems = [
  {
    question: "Why add AnyCap to Manus?",
    answer:
      "Manus is strong at autonomous, end-to-end execution. AnyCap adds a dedicated runtime for image, video, and vision workloads so those capabilities stay reusable, predictable, and easier to route across tasks.",
  },
  {
    question: "Does AnyCap replace Manus?",
    answer:
      "No. The point is to keep Manus and add a stable capability layer for image generation, video generation, image understanding, and video analysis.",
  },
  {
    question: "Can Manus use AnyCap through a skill?",
    answer:
      "Yes. Install the AnyCap skill, install the CLI, log in once, and then Manus can invoke the same capability layer across multiple workflows.",
  },
  {
    question: "What should I start with for Manus workflows?",
    answer:
      "Most teams start with the first missing capability in the workflow: image generation for assets, image understanding for screenshots, video generation for demos, or video analysis for recordings.",
  },
];

const faqJsonLd = createFaqPageJsonLd(faqItems);

const gapRows = buildAgentCapabilityGapRows("manus");

const installSteps = [
  {
    title: "Install the skill",
    subtitle: "Step 1",
    code: "npx -y skills add anycap-ai/anycap -y",
    note: "Manus supports reusable skills. This gives Manus a durable entry point into the AnyCap runtime instead of re-explaining the same capability stack in every task.",
  },
  {
    title: "Install the CLI",
    subtitle: "Step 2",
    code: "curl -fsSL https://anycap.ai/install.sh | sh",
    note: "The CLI becomes the stable execution surface for image, video, and vision workloads across Manus tasks.",
  },
  {
    title: "Log in and verify",
    subtitle: "Step 3",
    code: "anycap login && anycap status",
    note: "After authentication, Manus can reuse the same capability runtime without fresh provider setup every time a task expands.",
  },
];

const howToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "Add image, video, and vision capabilities to Manus",
  description:
    "Install the AnyCap skill and CLI to give Manus access to image generation, video generation, image understanding, and video analysis.",
  step: [
    {
      "@type": "HowToStep",
      name: "Install the skill",
      text: "Run npx -y skills add anycap-ai/anycap -y to give Manus a durable entry point into the AnyCap runtime.",
    },
    {
      "@type": "HowToStep",
      name: "Install the CLI",
      text: "Run curl -fsSL https://anycap.ai/install.sh | sh to install the AnyCap CLI.",
    },
    {
      "@type": "HowToStep",
      name: "Log in and verify",
      text: "Run anycap login && anycap status to authenticate and confirm the setup.",
    },
  ],
};

const capabilityCards = [
  {
    eyebrow: "Creative output",
    title: "Image Generation",
    href: "/capabilities/image-generation",
    summary: "Best next page when Manus needs visuals, mockups, launch assets, or other repeatable image output.",
    command: "anycap image generate",
  },
  {
    eyebrow: "Motion output",
    title: "Video Generation",
    href: "/capabilities/video-generation",
    summary: "Best next page when the workflow needs demos, explainers, walkthrough clips, or motion output.",
    command: "anycap video generate",
  },
  {
    eyebrow: "Vision",
    title: "Image Understanding",
    href: "/capabilities/image-understanding",
    summary: "Best next page when Manus needs to inspect screenshots, diagrams, OCR, or visual QA inputs.",
    command: "anycap image read",
  },
  {
    eyebrow: "Analysis",
    title: "Video Analysis",
    href: "/capabilities/video-analysis",
    summary: "Best next page when Manus needs to review recordings and extract structured detail from video.",
    command: "anycap video read",
  },
];

export default function ForManusPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Equip Agents", href: "/for", unlinkable: true },
          { name: "Manus" },
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }}
      />

      <article className="px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-[1280px] py-12 md:py-20 lg:py-24">
          <FadeIn>
            <p className="mb-4 text-[11px] tracking-[0.8px] text-[#6b7d3a]" style={mono}>
              For Manus
            </p>
            <h1
              className="max-w-[960px] leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(32px, 5vw, 64px)", textWrap: "balance" } as React.CSSProperties}
            >
              Manus can plan, browse, and deliver work.
              <br />
              It still needs a dedicated capability runtime.
            </h1>
            <p className="mt-6 max-w-[800px] text-base leading-7 text-[#4d5145] md:text-lg">
              Manus is excellent at autonomous, browser-driven, multi-step execution. The gap
              appears when a workflow needs repeatable image generation, video generation, image
              understanding, or video analysis without turning every task into fresh provider setup.
              AnyCap adds that missing runtime through one skill, one login, and one CLI, so you
              keep Manus and expand what it can reliably deliver.
            </p>
            <p className="mt-4 text-sm leading-6 text-[#6b7d3a]" style={mono}>
              Keep Manus. Standardize the capability layer.
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
                href="/capabilities/video-analysis"
                className="inline-block rounded-lg border border-[#1c1f17] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] transition-colors hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
                style={mono}
              >
                Video Analysis
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
                title="Where Manus still benefits from a dedicated runtime"
                description="Manus can stay focused on autonomous execution while AnyCap standardizes generation, analysis, search, storage, and publishing across tasks."
                columns={[
                  { label: "Manus alone" },
                  { label: "Add with AnyCap", accent: true },
                  { label: "Best next step" },
                ]}
                rows={gapRows}
                footnote="This page is the Manus hub. Until more Manus-specific deep pages exist, the next steps route to the capability pages or pricing page that closes each gap fastest."
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
            <section className="mb-8 mt-16 md:mt-24">
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
