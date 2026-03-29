import type { Metadata } from "next";
import { LocalizedLink as Link } from "@/components/LocalizedLink";
import { siteConfig } from "@/lib/site";
import { EarlyAccessBanner } from "@/components/EarlyAccessBanner";
import { FadeIn } from "@/components/FadeIn";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace" } as const;

export const metadata: Metadata = {
  title: "AnyCap vs Composio — Agent capability comparison",
  description:
    "Compare AnyCap and Composio for giving AI agents capabilities. AnyCap is an agent-native capability runtime with one CLI; Composio is a tool integration platform. See how they differ in approach, scope, and agent workflow fit.",
  alternates: { canonical: "/compare/anycap-vs-composio" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/compare/anycap-vs-composio",
    siteName: siteConfig.siteName,
    title: "AnyCap vs Composio — Agent capability comparison",
    description:
      "Compare AnyCap and Composio for giving AI agents capabilities. AnyCap is an agent-native capability runtime with one CLI; Composio is a tool integration platform.",
  },
};

const comparisons = [
  {
    dimension: "Core concept",
    anycap: "Agent-native capability runtime — one CLI, one auth, every capability",
    composio: "Tool integration platform — connect agents to 250+ third-party tools and APIs",
  },
  {
    dimension: "Install experience",
    anycap: "One skill file + one CLI binary. Install in under 5 minutes.",
    composio: "SDK integration into your application code. Requires API key management per tool.",
  },
  {
    dimension: "Multimodal capabilities",
    anycap: "Built-in image generation (Seedream 5, Nano Banana Pro), video generation (Veo 3.1), image understanding, video analysis",
    composio: "Connects to external multimodal APIs as tool integrations",
  },
  {
    dimension: "Agent compatibility",
    anycap: "Works across Claude Code, Cursor, Codex, OpenCode, OpenClaw via skill files",
    composio: "Works with various LLM frameworks (LangChain, CrewAI, etc.) via SDK",
  },
  {
    dimension: "Auth model",
    anycap: "Single login for all capabilities",
    composio: "Per-tool OAuth and API key management",
  },
  {
    dimension: "Design philosophy",
    anycap: "Built for agents from day one. CLI-first, agent-native.",
    composio: "Integration platform designed for developers building agent applications",
  },
];

export default function AnycapVsComposioPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: "Home", href: "/" },
        { name: "AnyCap vs Composio" },
      ]} />
      <article className="px-6 md:px-12 lg:px-20">
      <div className="mx-auto max-w-[1280px] py-12 md:py-20 lg:py-24">
        <FadeIn>
          <p className="text-[11px] text-[#6b7d3a] tracking-[0.8px] mb-4" style={mono}>Compare</p>
          <h1
            className="leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
            style={{ ...pixel, fontSize: "clamp(28px, 5vw, 60px)" }}
          >
            AnyCap vs Composio
          </h1>
          <p className="mt-6 max-w-[700px] text-base leading-7 text-[#4d5145] md:text-lg">
            AnyCap and Composio both help AI agents do more, but they take fundamentally
            different approaches. AnyCap is an agent-native capability runtime that gives
            agents one CLI and one auth flow for multimodal capabilities like image generation
            and video analysis. Composio is a tool integration platform that connects agents
            to hundreds of third-party services through SDK integrations. The right choice
            depends on whether you need deep multimodal capabilities through a consistent
            agent interface, or broad third-party tool access through a developer SDK.
          </p>
        </FadeIn>

        <FadeIn className="mt-8">
          <EarlyAccessBanner />
        </FadeIn>

        <div className="mt-16 md:mt-24"><hr className="border-t border-[#d4dbb8]" /></div>

        <FadeIn>
          <section className="mt-16 md:mt-24">
            <h2 className="text-lg md:text-xl text-[#1c1f17] mb-8" style={{ ...pixel }}>
              Side-by-Side Comparison
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[#d4dbb8]">
                    <th className="pb-3 pr-6 text-[11px] text-[#5a5e52] tracking-[0.5px] w-[160px]" style={mono}>Dimension</th>
                    <th className="pb-3 pr-6 text-[11px] text-[#6b7d3a] tracking-[0.5px]" style={mono}>AnyCap</th>
                    <th className="pb-3 text-[11px] text-[#5a5e52] tracking-[0.5px]" style={mono}>Composio</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisons.map((row) => (
                    <tr key={row.dimension} className="border-b border-[#d4dbb8]/50">
                      <td className="py-4 pr-6 text-sm font-medium text-[#1c1f17] align-top">{row.dimension}</td>
                      <td className="py-4 pr-6 text-sm text-[#4d5145] leading-6 align-top">{row.anycap}</td>
                      <td className="py-4 text-sm text-[#4d5145] leading-6 align-top">{row.composio}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </FadeIn>

        <div className="mt-16 md:mt-24"><hr className="border-t border-[#d4dbb8]" /></div>

        <FadeIn>
          <section className="mt-16 md:mt-24">
            <h2 className="text-lg md:text-xl text-[#1c1f17] mb-6" style={{ ...pixel }}>
              When to choose AnyCap
            </h2>
            <ul className="space-y-3 max-w-[700px]">
              <li className="flex items-start gap-3 text-sm text-[#4d5145] leading-6">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#6b7d3a] shrink-0" />
                You want agents to generate images, create videos, or analyze visual content
              </li>
              <li className="flex items-start gap-3 text-sm text-[#4d5145] leading-6">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#6b7d3a] shrink-0" />
                You use Claude Code, Cursor, or similar agent products and want one install for all capabilities
              </li>
              <li className="flex items-start gap-3 text-sm text-[#4d5145] leading-6">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#6b7d3a] shrink-0" />
                You prefer a CLI-first, agent-native interface over SDK integration
              </li>
              <li className="flex items-start gap-3 text-sm text-[#4d5145] leading-6">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#6b7d3a] shrink-0" />
                You want single auth for all capabilities instead of per-tool OAuth
              </li>
            </ul>
          </section>
        </FadeIn>

        <div className="mt-16 md:mt-24"><hr className="border-t border-[#d4dbb8]" /></div>

        <FadeIn>
          <section className="mt-16 md:mt-24">
            <h2 className="text-lg md:text-xl text-[#1c1f17] mb-8" style={{ ...pixel }}>
              Related Comparisons and Guides
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 max-w-[960px]">
              <Link
                href="/compare/anycap-vs-openai-agent-builder"
                className="border border-[#d4dbb8] p-5 hover:border-[#6b7d3a] transition-colors"
              >
                <p className="text-[11px] text-[#6b7d3a] tracking-[0.5px] mb-2" style={mono}>
                  Compare
                </p>
                <h3 className="text-[15px] font-bold text-[#1c1f17] mb-2" style={mono}>
                  AnyCap vs OpenAI Agent Builder
                </h3>
                <p className="text-sm text-[#4d5145] leading-6">
                  See how a capability runtime differs from a builder platform inside the agent stack.
                </p>
              </Link>
              <Link
                href="/guides/what-is-agent-harness"
                className="border border-[#d4dbb8] p-5 hover:border-[#6b7d3a] transition-colors"
              >
                <p className="text-[11px] text-[#6b7d3a] tracking-[0.5px] mb-2" style={mono}>
                  Guide
                </p>
                <h3 className="text-[15px] font-bold text-[#1c1f17] mb-2" style={mono}>
                  What is an Agent Harness?
                </h3>
                <p className="text-sm text-[#4d5145] leading-6">
                  Understand where AnyCap fits between the model, the harness, and the capability layer.
                </p>
              </Link>
            </div>
          </section>
        </FadeIn>

        <div className="mt-16 md:mt-24"><hr className="border-t border-[#d4dbb8]" /></div>

        <FadeIn>
          <section className="mt-16 md:mt-24 mb-8">
            <div className="flex flex-wrap gap-4">
              <a
                href="https://github.com/anycap-ai/anycap"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#f4f5f0] bg-[#6b7d3a] hover:bg-[#1c1f17] transition-colors rounded-lg"
                style={mono}
              >
                Request Early Access
              </a>
              <Link href="/capabilities" className="inline-block px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] border border-[#1c1f17] hover:bg-[#1c1f17] hover:text-[#f4f5f0] transition-colors rounded-lg" style={mono}>All Capabilities</Link>
            </div>
          </section>
        </FadeIn>
      </div>
    </article>
    </>
  );
}
