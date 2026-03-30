import type { Metadata } from "next";
import { LocalizedLink as Link } from "@/components/LocalizedLink";
import { siteConfig } from "@/lib/site";
import { EarlyAccessBanner } from "@/components/EarlyAccessBanner";
import { FadeIn } from "@/components/FadeIn";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

const comparisons = [
  {
    dimension: "Primary role",
    anycap: "Capability runtime for agents",
    builder: "Builder platform for creating agent systems and workflows",
  },
  {
    dimension: "Best fit",
    anycap: "Teams that want one CLI and one capability layer across agent products",
    builder: "Teams that want a vendor-specific environment for building agents end-to-end",
  },
  {
    dimension: "Multimodal execution",
    anycap: "Expose image generation, video generation, image read, and video analysis through one runtime",
    builder: "Depends on what the builder platform exposes and how it is configured",
  },
  {
    dimension: "How it enters the stack",
    anycap: "Installed as a capability layer the harness can call",
    builder: "Acts as the environment or platform where agents are created",
  },
];

const faqItems = [
  {
    question: "Is AnyCap an agent builder?",
    answer:
      "No. AnyCap is positioned as an agent-native capability runtime. It gives existing agents access to multimodal capabilities through one interface.",
  },
  {
    question: "When should I compare AnyCap to OpenAI Agent Builder?",
    answer:
      "Compare them when you are deciding whether you need a builder platform or a runtime layer that gives agents capabilities during execution.",
  },
  {
    question: "Can AnyCap work alongside another agent platform?",
    answer:
      "Yes. AnyCap is designed to sit inside the broader agent stack as the capability layer, so it can complement a harness or platform rather than replace it.",
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

export const metadata: Metadata = {
  title: "AnyCap vs OpenAI Agent Builder — Runtime vs builder platform",
  description:
    "Compare AnyCap and OpenAI Agent Builder. AnyCap is an agent-native capability runtime; Agent Builder is a builder platform. Learn when each one fits and why they solve different layers of the agent stack.",
  alternates: { canonical: "/compare/anycap-vs-openai-agent-builder" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/compare/anycap-vs-openai-agent-builder",
    siteName: siteConfig.siteName,
    title: "AnyCap vs OpenAI Agent Builder — Runtime vs builder platform",
    description:
      "Compare AnyCap and OpenAI Agent Builder and understand why they solve different layers of the agent stack.",
  },
};

export default function AnycapVsOpenAIAgentBuilderPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[{ name: "Home", href: "/" }, { name: "AnyCap vs OpenAI Agent Builder" }]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <article className="px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-[1280px] py-12 md:py-20 lg:py-24">
          <FadeIn>
            <p className="text-[11px] text-[#6b7d3a] tracking-[0.8px] mb-4" style={mono}>
              Compare
            </p>
            <h1
              className="leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(28px, 5vw, 60px)" }}
            >
              AnyCap vs
              <br />
              OpenAI Agent Builder
            </h1>
            <p className="mt-6 max-w-[760px] text-base leading-7 text-[#4d5145] md:text-lg">
              These products sit at different layers. OpenAI Agent Builder is about building
              and operating agents in a platform environment. AnyCap is about giving agents a
              consistent capability runtime they can use across tools such as Claude Code,
              Cursor, Codex, and similar harnesses.
            </p>
          </FadeIn>

          <FadeIn className="mt-8">
            <EarlyAccessBanner />
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="text-lg md:text-xl text-[#1c1f17] mb-8" style={{ ...pixel }}>
                Side-by-side
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[#d4dbb8]">
                      <th className="pb-3 pr-6 text-[11px] text-[#5a5e52] tracking-[0.5px]" style={mono}>Dimension</th>
                      <th className="pb-3 pr-6 text-[11px] text-[#6b7d3a] tracking-[0.5px]" style={mono}>AnyCap</th>
                      <th className="pb-3 text-[11px] text-[#5a5e52] tracking-[0.5px]" style={mono}>OpenAI Agent Builder</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisons.map((row) => (
                      <tr key={row.dimension} className="border-b border-[#d4dbb8]/50">
                        <td className="py-4 pr-6 text-sm font-medium text-[#1c1f17] align-top">{row.dimension}</td>
                        <td className="py-4 pr-6 text-sm text-[#4d5145] leading-6 align-top">{row.anycap}</td>
                        <td className="py-4 text-sm text-[#4d5145] leading-6 align-top">{row.builder}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="text-lg md:text-xl text-[#1c1f17] mb-6" style={{ ...pixel }}>
                The important framing
              </h2>
              <div className="space-y-6 max-w-[780px]">
                <p className="text-base leading-7 text-[#4d5145]">
                  If you are choosing a place to design and host an agent, a builder platform
                  may be the right comparison. If you already have agents and need them to gain
                  multimodal capabilities through a clean runtime layer, AnyCap is the more
                  relevant category.
                </p>
                <p className="text-base leading-7 text-[#4d5145]">
                  This is why AnyCap describes itself as an agent-native capability runtime
                  rather than an agent builder. It focuses on the capability layer agents call
                  during execution.
                </p>
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="text-lg md:text-xl text-[#1c1f17] mb-8" style={{ ...pixel }}>
                Related Comparisons and Definitions
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 max-w-[960px]">
                <Link
                  href="/compare/anycap-vs-composio"
                  className="border border-[#d4dbb8] p-5 hover:border-[#6b7d3a] transition-colors"
                >
                  <p className="text-[11px] text-[#6b7d3a] tracking-[0.5px] mb-2" style={mono}>
                    Compare
                  </p>
                  <h3 className="text-[15px] font-bold text-[#1c1f17] mb-2" style={mono}>
                    AnyCap vs Composio
                  </h3>
                  <p className="text-sm text-[#4d5145] leading-6">
                    Compare a capability runtime with a broader tool integration platform.
                  </p>
                </Link>
                <Link
                  href="/glossary/agent-capability-runtime"
                  className="border border-[#d4dbb8] p-5 hover:border-[#6b7d3a] transition-colors"
                >
                  <p className="text-[11px] text-[#6b7d3a] tracking-[0.5px] mb-2" style={mono}>
                    Glossary
                  </p>
                  <h3 className="text-[15px] font-bold text-[#1c1f17] mb-2" style={mono}>
                    Agent Capability Runtime
                  </h3>
                  <p className="text-sm text-[#4d5145] leading-6">
                    Get the core definition for the category AnyCap is trying to own.
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
              <h2 className="text-lg md:text-xl text-[#1c1f17] mb-8" style={{ ...pixel }}>
                FAQ
              </h2>
              <div className="space-y-6 max-w-[860px]">
                {faqItems.map((item) => (
                  <div key={item.question} className="border border-[#d4dbb8] p-5">
                    <h3 className="text-[14px] font-bold text-[#1c1f17] mb-2" style={mono}>
                      {item.question}
                    </h3>
                    <p className="text-sm text-[#4d5145] leading-6">{item.answer}</p>
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
                  href="/cli"
                  className="inline-block px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#f4f5f0] bg-[#6b7d3a] hover:bg-[#1c1f17] transition-colors rounded-lg"
                  style={mono}
                >
                  CLI Overview
                </Link>
                <Link
                  href="/guides/what-is-agent-harness"
                  className="inline-block px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] border border-[#1c1f17] hover:bg-[#1c1f17] hover:text-[#f4f5f0] transition-colors rounded-lg"
                  style={mono}
                >
                  Agent Harness Guide
                </Link>
                <Link
                  href="/compare/anycap-vs-composio"
                  className="inline-block px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] border border-[#1c1f17] hover:bg-[#1c1f17] hover:text-[#f4f5f0] transition-colors rounded-lg"
                  style={mono}
                >
                  Compare with Composio
                </Link>
              </div>
            </section>
          </FadeIn>
        </div>
      </article>
    </>
  );
}
