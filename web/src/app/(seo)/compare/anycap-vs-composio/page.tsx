import type { Metadata } from "next";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { siteConfig } from "@/lib/site";
import { createFaqPageJsonLd, createTechArticleJsonLd } from "@/lib/schema";
import { EarlyAccessBanner } from "@/components/landing/EarlyAccessBanner";
import { FadeIn } from "@/components/ui/FadeIn";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

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
    anycap: "Built-in image generation (Seedream 5, Nano Banana Pro), video generation (Veo 3.1), image read, video analysis",
    composio: "Connects to external multimodal APIs as tool integrations",
  },
  {
    dimension: "Agent compatibility",
    anycap: "Works across Claude Code, Cursor, Codex, OpenCode, OpenClaw via skill files",
    composio: "Works with various LLM frameworks (LangChain, CrewAI, etc.) via SDK",
  },
  {
    dimension: "Auth model",
    anycap: "Single login for any capability",
    composio: "Per-tool OAuth and API key management",
  },
  {
    dimension: "Design philosophy",
    anycap: "Built for agents from day one. CLI-first, agent-native.",
    composio: "Integration platform designed for developers building agent applications",
  },
];

const articleJsonLd = createTechArticleJsonLd({
  headline: "AnyCap vs Composio — Agent capability comparison",
  description:
    "Compare AnyCap and Composio for giving AI agents capabilities. AnyCap is an agent-native capability runtime with one CLI; Composio is a tool integration platform.",
  path: "/compare/anycap-vs-composio",
  about: ["AnyCap", "Composio", "AI agent capabilities", "Tool integration"],
  keywords: [
    "anycap vs composio",
    "composio alternative",
    "ai agent tools comparison",
    "agent capability runtime vs tool platform",
  ],
  datePublished: "2026-04-03",
  dateModified: "2026-04-10",
});

const faqItems = [
  {
    question: "What is the main difference between AnyCap and Composio?",
    answer:
      "AnyCap is a capability runtime that gives agents multimodal capabilities (image generation, video generation, vision, web search) through one CLI and one auth flow. Composio is a tool integration platform that connects agents to 250+ third-party services (CRM, email, calendar, SaaS tools) through SDK-level integrations. AnyCap focuses on depth of multimodal capabilities; Composio focuses on breadth of service integrations.",
  },
  {
    question: "Can I use both AnyCap and Composio together?",
    answer:
      "Yes. They solve different problems and do not conflict. You can use AnyCap for multimodal capabilities (image, video, vision, search) and Composio for SaaS tool integrations (Gmail, Slack, Notion, etc.) in the same agent workflow.",
  },
  {
    question: "Which is better for image and video generation?",
    answer:
      "AnyCap. Image and video generation are built-in capabilities with curated models (Seedream 5, Nano Banana Pro, Veo 3.1, Kling 3.0). Composio can connect to external image APIs as tool integrations, but each integration requires separate configuration.",
  },
  {
    question: "Which is better for connecting to SaaS tools like Gmail or Slack?",
    answer:
      "Composio. It specializes in connecting agents to hundreds of third-party services with managed OAuth. AnyCap does not provide SaaS tool integrations — it focuses on multimodal capabilities and web retrieval.",
  },
  {
    question: "How does authentication differ between AnyCap and Composio?",
    answer:
      "AnyCap uses a single login that covers every capability. Composio manages per-tool OAuth flows and API keys, which gives fine-grained control over each integration but requires more setup as the number of connected tools grows.",
  },
] as const;

const faqJsonLd = createFaqPageJsonLd(faqItems);

export default function AnycapVsComposioPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: "Home", href: "/" },
        { name: "Compare", href: "/compare", unlinkable: true },
        { name: "AnyCap vs Composio" },
      ]} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
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
            <h2 className="text-lg md:text-xl text-[#1c1f17] mb-4" style={{ ...pixel }}>
              Setup experience comparison
            </h2>
            <p className="max-w-[700px] text-base leading-7 text-[#4d5145] mb-8">
              The difference is clearest during initial setup. Here is what each path looks
              like from zero to first capability invocation.
            </p>
            <div className="grid gap-6 md:grid-cols-2 max-w-[960px]">
              <div className="rounded-xl border border-[#6b7d3a] bg-[#f7f8ef]/80 p-6">
                <p className="text-[11px] text-[#6b7d3a] tracking-[0.5px] mb-3" style={mono}>AnyCap setup</p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 text-[11px] text-[#6b7d3a] font-bold w-4 shrink-0" style={mono}>1</span>
                    <p className="text-sm text-[#4d5145] leading-6">Install skill + CLI (2 commands)</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 text-[11px] text-[#6b7d3a] font-bold w-4 shrink-0" style={mono}>2</span>
                    <p className="text-sm text-[#4d5145] leading-6">Login once (1 command)</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 text-[11px] text-[#6b7d3a] font-bold w-4 shrink-0" style={mono}>3</span>
                    <p className="text-sm text-[#4d5145] leading-6">Use any capability immediately</p>
                  </div>
                </div>
                <p className="mt-4 text-[11px] text-[#6b7d3a] tracking-[0.5px]" style={mono}>
                  3 commands &middot; 1 auth flow &middot; all capabilities available
                </p>
              </div>
              <div className="rounded-xl border border-[#d4dbb8] bg-[#fffffc]/70 p-6">
                <p className="text-[11px] text-[#5a5e52] tracking-[0.5px] mb-3" style={mono}>Composio setup</p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 text-[11px] text-[#5a5e52] font-bold w-4 shrink-0" style={mono}>1</span>
                    <p className="text-sm text-[#4d5145] leading-6">Install Composio SDK in your project</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 text-[11px] text-[#5a5e52] font-bold w-4 shrink-0" style={mono}>2</span>
                    <p className="text-sm text-[#4d5145] leading-6">Configure API key for the Composio platform</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 text-[11px] text-[#5a5e52] font-bold w-4 shrink-0" style={mono}>3</span>
                    <p className="text-sm text-[#4d5145] leading-6">Connect each tool individually via OAuth or API key</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 text-[11px] text-[#5a5e52] font-bold w-4 shrink-0" style={mono}>4</span>
                    <p className="text-sm text-[#4d5145] leading-6">Wire tool invocations into your agent framework</p>
                  </div>
                </div>
                <p className="mt-4 text-[11px] text-[#5a5e52] tracking-[0.5px]" style={mono}>
                  SDK integration &middot; per-tool auth &middot; tools added incrementally
                </p>
              </div>
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
                You use Claude Code, Cursor, or similar agent products and want one install for any capability
              </li>
              <li className="flex items-start gap-3 text-sm text-[#4d5145] leading-6">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#6b7d3a] shrink-0" />
                You prefer a CLI-first, agent-native interface over SDK integration
              </li>
              <li className="flex items-start gap-3 text-sm text-[#4d5145] leading-6">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#6b7d3a] shrink-0" />
                You want single auth for any capability instead of per-tool OAuth
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
          <section className="mt-16 md:mt-24">
            <h2 className="text-lg md:text-xl text-[#1c1f17] mb-8" style={{ ...pixel }}>
              FAQ
            </h2>
            <div className="max-w-[860px] space-y-4">
              {faqItems.map((item) => (
                <div key={item.question} className="rounded-xl border border-[#d4dbb8] bg-[#fffffc]/70 p-5">
                  <h3 className="mb-2 text-[14px] font-bold text-[#1c1f17]" style={mono}>
                    {item.question}
                  </h3>
                  <p className="text-sm leading-6 text-[#4d5145]">{item.answer}</p>
                </div>
              ))}
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
                View on GitHub
              </a>
              <Link href="/capabilities" className="inline-block px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] border border-[#1c1f17] hover:bg-[#1c1f17] hover:text-[#f4f5f0] transition-colors rounded-lg" style={mono}>Any Capability</Link>
            </div>
          </section>
        </FadeIn>
      </div>
    </article>
    </>
  );
}
