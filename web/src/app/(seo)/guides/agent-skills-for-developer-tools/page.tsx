import type { Metadata } from "next";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { siteConfig } from "@/lib/site";
import { EarlyAccessBanner } from "@/components/landing/EarlyAccessBanner";
import { FadeIn } from "@/components/ui/FadeIn";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { ArticleByline } from "@/components/seo/ArticleByline";
import { getSeoPageChrome } from "@/lib/seo-ia";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

export const metadata: Metadata = {
  title: "Agent skills for developer tools — How capabilities are distributed",
  description:
    "Agent skills teach tools like Claude Code, Cursor, and Codex how to discover and use capabilities. Learn how skill files work, why they matter, and how AnyCap uses them to distribute multimodal capabilities across developer agents.",
  alternates: { canonical: "/guides/agent-skills-for-developer-tools" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/guides/agent-skills-for-developer-tools",
    siteName: siteConfig.siteName,
    title: "Agent skills for developer tools — How capabilities are distributed",
    description:
      "Learn how skill files work and how AnyCap uses them to distribute multimodal capabilities across developer agents.",
  },
};

const agentTargets = ["Claude Code", "Cursor", "Codex", "OpenCode", "OpenClaw"];

const pageChrome = getSeoPageChrome("/guides/agent-skills-for-developer-tools");

export default function AgentSkillsForDeveloperToolsPage() {
  return (
    <>
      <BreadcrumbJsonLd items={pageChrome?.breadcrumbItems} />
      <article className="px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-[1280px] py-12 md:py-20 lg:py-24">
          <FadeIn>
            <p className="text-[11px] text-[#6b7d3a] tracking-[0.8px] mb-4" style={mono}>
              {pageChrome?.eyebrow ?? "Guide"}
            </p>
            <ArticleByline className="mb-3" author={pageChrome?.authorLabel} />
            <h1
              className="leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(32px, 6vw, 72px)" }}
            >
              Agent skills
              <br />
              for developer tools
            </h1>
            <p className="mt-6 max-w-[760px] text-base leading-7 text-[#4d5145] md:text-lg">
              Agent skills are instruction files that teach an AI agent how to discover,
              install, authenticate, and invoke a capability. They matter because developer
              agents do not just need tools. They need a reliable description of how to use
              those tools inside the execution environment. AnyCap uses skills to distribute
              one capability runtime across Claude Code, Cursor, Codex, and similar products.
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
              <h2 className="text-lg md:text-xl text-[#1c1f17] mb-6" style={{ ...pixel }}>
                What a skill actually does
              </h2>
              <div className="space-y-4 max-w-[780px]">
                <p className="text-base leading-7 text-[#4d5145]">
                  A skill is not only metadata. It gives the agent a working model of how a
                  capability fits into its workflow. That includes installation steps, auth
                  flow, command examples, and the situations where the agent should call the
                  capability instead of staying in text.
                </p>
                <p className="text-base leading-7 text-[#4d5145]">
                  That is why skills are a strong distribution mechanism for AnyCap. The same
                  runtime can be installed once, then described consistently to multiple agent
                  products without rewriting the capability interface every time.
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
                Where skills fit
              </h2>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="border border-[#d4dbb8] p-5">
                  <h3 className="text-[14px] font-bold text-[#1c1f17] mb-2" style={mono}>
                    Discovery
                  </h3>
                  <p className="text-sm text-[#4d5145] leading-6">
                    The agent learns that a capability exists and what outcomes it enables.
                  </p>
                </div>
                <div className="border border-[#d4dbb8] p-5">
                  <h3 className="text-[14px] font-bold text-[#1c1f17] mb-2" style={mono}>
                    Installation
                  </h3>
                  <p className="text-sm text-[#4d5145] leading-6">
                    The skill explains how to install the runtime and how authentication works.
                  </p>
                </div>
                <div className="border border-[#d4dbb8] p-5">
                  <h3 className="text-[14px] font-bold text-[#1c1f17] mb-2" style={mono}>
                    Invocation
                  </h3>
                  <p className="text-sm text-[#4d5145] leading-6">
                    The agent sees examples and usage patterns it can reuse during execution.
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
              <h2 className="text-lg md:text-xl text-[#1c1f17] mb-6" style={{ ...pixel }}>
                AnyCap distribution pattern
              </h2>
              <div className="bg-[#1c1f17] px-6 py-5 md:px-8 md:py-6 max-w-[820px]">
                <p className="text-[13px] text-[#6b7d3a] mb-1" style={mono}>
                  # Install through skills.sh
                </p>
                <p className="text-[13px] text-[#d4e0a4] mb-4" style={mono}>
                  npx -y skills add anycap-ai/anycap -a claude-code -y
                </p>
                <p className="text-[13px] text-[#6b7d3a] mb-1" style={mono}>
                  # Or switch the agent target
                </p>
                <p className="text-[13px] text-[#d4e0a4]" style={mono}>
                  npx -y skills add anycap-ai/anycap -a codex -y
                </p>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                {agentTargets.map((target) => (
                  <span
                    key={target}
                    className="border border-[#d4dbb8] px-4 py-2 text-[12px] text-[#1c1f17] tracking-[1px]"
                    style={mono}
                  >
                    {target}
                  </span>
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
                  href="/guides/install-anycap"
                  className="inline-block px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#f4f5f0] bg-[#6b7d3a] hover:bg-[#1c1f17] transition-colors rounded-lg"
                  style={mono}
                >
                  Install AnyCap
                </Link>
                <Link
                  href="/for/claude-code"
                  className="inline-block px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] border border-[#1c1f17] hover:bg-[#1c1f17] hover:text-[#f4f5f0] transition-colors rounded-lg"
                  style={mono}
                >
                  For Claude Code
                </Link>
                <Link
                  href="/for/codex"
                  className="inline-block px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] border border-[#1c1f17] hover:bg-[#1c1f17] hover:text-[#f4f5f0] transition-colors rounded-lg"
                  style={mono}
                >
                  For Codex
                </Link>
              </div>
            </section>
          </FadeIn>
        </div>
      </article>
    </>
  );
}
