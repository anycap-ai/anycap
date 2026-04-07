import type { Metadata } from "next";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { FadeIn } from "@/components/ui/FadeIn";
import { capabilitySummary, roadmapCapabilitySummary, siteConfig } from "@/lib/site";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

export const metadata: Metadata = {
  title: "About AnyCap — Agent-native capability infrastructure",
  description:
    `AnyCap builds capability infrastructure for agents. We focus on the missing runtime layer between a reasoning agent and ${capabilitySummary}.`,
  alternates: { canonical: "/about" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/about",
    siteName: siteConfig.siteName,
    title: "About AnyCap — Agent-native capability infrastructure",
    description:
      "Why AnyCap exists, what it is, what it is not, and the principles behind an agent-native capability runtime.",
  },
};

const aboutPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  name: "About AnyCap",
  description:
    `About page for AnyCap, an agent-native capability runtime that adds ${capabilitySummary} to AI agents through one interface.`,
  url: `${siteConfig.url}/about`,
  mainEntity: {
    "@type": "Organization",
    name: siteConfig.siteName,
    url: siteConfig.url,
    sameAs: ["https://github.com/anycap-ai/anycap"],
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteConfig.siteName,
  url: siteConfig.url,
  sameAs: ["https://github.com/anycap-ai/anycap"],
  description:
    `AnyCap builds agent-native capability infrastructure that lets AI agents use ${capabilitySummary} through one runtime.`,
};

const whyCards = [
  {
    title: "Reasoning is not enough",
    body:
      "Modern agents can plan and code, but they still fail the moment a workflow needs image generation, video generation, or a consistent vision layer.",
  },
  {
    title: "Tooling is too fragmented",
    body:
      "Every missing capability usually means another SDK, another auth flow, another provider-specific integration, and another way for the agent to fail.",
  },
  {
    title: "Agents deserve first-class products",
    body:
      "We think the capability layer should be built for agents from the start, not adapted from human dashboards or stitched together after the fact.",
  },
];

const notCards = [
  {
    title: "Not a human dashboard product",
    body:
      "AnyCap is not built around clicking through admin panels. The primary interface is the runtime, the CLI, and the install path the agent can actually use.",
  },
  {
    title: "Not provider glue code",
    body:
      "We are not optimizing for custom one-off integrations per model vendor. The goal is one capability surface that stays consistent across providers.",
  },
  {
    title: "Not a replacement for your agent",
    body:
      "You keep Claude Code, Cursor, Codex, or another agent. AnyCap exists to add the capability layer they still need.",
  },
];

const principles = [
  "One install path instead of one install per provider",
  "One auth flow instead of fragmented credentials across the stack",
  "One command surface instead of capability-specific interfaces",
  "Built for agents first, then made understandable for humans",
];

const trustSignals = [
  {
    label: "Open distribution",
    detail: "Skill files and release artifacts are published through public GitHub paths.",
  },
  {
    label: "Portable runtime",
    detail: "The same capability layer is designed to work across Claude Code, Cursor, Codex, and adjacent agent products.",
  },
  {
    label: "Explicit capability model",
    detail: "We separate the runtime, the CLI, the skill file, and the capabilities so teams can reason about the stack clearly.",
  },
];

const companyFacts = [
  { label: "Company", value: "AnyCap" },
  { label: "Product", value: "Agent-native capability runtime" },
  { label: "Primary interface", value: "CLI + skill files" },
  { label: "Official repository", value: "github.com/anycap-ai/anycap" },
  { label: "License", value: "MIT" },
  { label: "Last updated", value: "2026-04-03" },
] as const;

export default function AboutPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Home", href: "/" }, { name: "About" }]} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutPageJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />

      <article className="px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-[1280px] py-12 md:py-20 lg:py-24">
          <FadeIn>
            <p className="mb-4 text-[11px] tracking-[0.8px] text-[#6b7d3a]" style={mono}>
              About
            </p>
            <h1
              className="leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(32px, 6vw, 72px)" }}
            >
              AnyCap builds capability
              <br />
              infrastructure for agents.
            </h1>
            <p className="mt-6 max-w-[780px] text-base leading-7 text-[#4d5145] md:text-lg">
              We focus on the layer between a reasoning agent and the capabilities it still needs
              to do real work: {capabilitySummary}. The idea is simple. Keep the agent you already
              use. Add the missing capability runtime around it. {roadmapCapabilitySummary} remain
              on the roadmap.
            </p>
            <p className="mt-4 text-[11px] text-[#5a5e52]" style={mono}>
              Last updated 2026-04-03
            </p>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-8 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                Company facts
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {companyFacts.map((fact) => (
                  <div key={fact.label} className="rounded-xl border border-[#d4dbb8] p-6">
                    <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                      {fact.label}
                    </p>
                    <p className="text-sm leading-6 text-[#4d5145]">{fact.value}</p>
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
                What AnyCap is
              </h2>
              <div className="max-w-[820px] space-y-5">
                <p className="text-base leading-7 text-[#4d5145]">
                  AnyCap is an agent-native capability runtime. It gives AI agents a consistent
                  way to install, authenticate, and use capabilities that do not belong inside the
                  base reasoning model.
                </p>
                <p className="text-base leading-7 text-[#4d5145]">
                  We care about the capability layer because that is where real workflows usually
                  break. The agent can decide what to do, but it still cannot render the image,
                  generate the video, inspect the screenshot, or move between those workflows
                  through one stable interface.
                </p>
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-8 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                Why it exists
              </h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {whyCards.map((card) => (
                  <div key={card.title} className="rounded-xl border border-[#d4dbb8] p-6">
                    <h3 className="mb-3 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                      {card.title}
                    </h3>
                    <p className="text-sm leading-6 text-[#4d5145]">{card.body}</p>
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
                What AnyCap is not
              </h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {notCards.map((card) => (
                  <div key={card.title} className="rounded-xl border border-[#d4dbb8] p-6">
                    <h3 className="mb-3 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                      {card.title}
                    </h3>
                    <p className="text-sm leading-6 text-[#4d5145]">{card.body}</p>
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
                Principles behind the product
              </h2>
              <div className="max-w-[900px] space-y-4">
                {principles.map((principle) => (
                  <div key={principle} className="border-l-[3px] border-[#6b7d3a] pl-5">
                    <p className="text-sm leading-6 text-[#4d5145]">{principle}</p>
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
                Trust signals
              </h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {trustSignals.map((signal) => (
                  <div key={signal.label} className="rounded-xl border border-[#d4dbb8] p-6">
                    <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                      {signal.label}
                    </p>
                    <p className="text-sm leading-6 text-[#4d5145]">{signal.detail}</p>
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
                  href="/"
                  className="inline-block rounded-lg border border-[#1c1f17] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] transition-colors hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
                  style={mono}
                >
                  Homepage
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
