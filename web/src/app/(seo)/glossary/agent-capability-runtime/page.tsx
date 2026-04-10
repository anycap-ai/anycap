import type { Metadata } from "next";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { getLocalizedRouteUrl, siteConfig } from "@/lib/site";
import { createFaqPageJsonLd, createTechArticleJsonLd } from "@/lib/schema";
import { EarlyAccessBanner } from "@/components/landing/EarlyAccessBanner";
import { FadeIn } from "@/components/ui/FadeIn";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;
const lastUpdatedLabel = "April 10, 2026";
const lastUpdatedIso = "2026-04-10";

export const metadata: Metadata = {
  title: "What is an Agent Capability Runtime? Definition, Architecture, and Why It Matters",
  description:
    "An agent capability runtime is a software layer that gives AI agents installable capabilities — image generation, video generation, vision, web search — through one interface, one auth flow, and one install path. Learn how it differs from agent frameworks, tool platforms, and direct API integrations.",
  alternates: { canonical: "/glossary/agent-capability-runtime" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/glossary/agent-capability-runtime",
    siteName: siteConfig.siteName,
    title: "What is an Agent Capability Runtime? Definition, Architecture, and Why It Matters",
    description:
      "An agent capability runtime gives AI agents installable capabilities through one interface. Learn how it differs from agent frameworks, tool integration platforms, and direct API integrations.",
  },
};

const definitionJsonLd = {
  "@context": "https://schema.org",
  "@type": "DefinedTerm",
  name: "Agent Capability Runtime",
  description:
    "A software layer that gives AI agents installable capabilities such as image generation, video generation, image understanding, video analysis, web search, and web crawl through a single interface, rather than requiring separate integrations for each capability.",
  url: getLocalizedRouteUrl(siteConfig.defaultLocale, "/glossary/agent-capability-runtime"),
};

const articleJsonLd = createTechArticleJsonLd({
  headline: "What is an Agent Capability Runtime? Definition, Architecture, and Why It Matters",
  description:
    "Deep guide to agent capability runtimes: what they are, how they differ from agent frameworks and tool platforms, what architecture problems they solve, and when teams should adopt one.",
  path: "/glossary/agent-capability-runtime",
  about: [
    "Agent Capability Runtime",
    "AI agents",
    "Multimodal AI",
    "Agent architecture",
    "Tool integration",
  ],
  keywords: [
    "agent capability runtime",
    "ai capability runtime",
    "ai agent runtime",
    "agent tools",
    "agent capabilities",
    "multimodal agent",
    "agent architecture",
  ],
  datePublished: "2026-04-03",
  dateModified: lastUpdatedIso,
});

const faqItems = [
  {
    question: "What is an agent capability runtime?",
    answer:
      "An agent capability runtime is a software layer that gives AI agents installable capabilities — such as image generation, video generation, image understanding, video analysis, web search, and web crawl — through a single interface. It provides one install path, one authentication flow, and one command surface for every capability the agent needs, instead of requiring separate provider integrations.",
  },
  {
    question: "How does a capability runtime differ from an agent framework?",
    answer:
      "An agent framework (like LangChain, CrewAI, or AutoGen) provides the reasoning loop, memory, and orchestration for building agents. A capability runtime does not replace the framework — it supplies the actual capabilities (image generation, video generation, vision) that the framework's agents can invoke. They operate at different layers of the stack.",
  },
  {
    question: "How does a capability runtime differ from a tool integration platform?",
    answer:
      "A tool integration platform (like Composio or Zapier) connects agents to hundreds of third-party services via SDK-level integrations and per-tool OAuth. A capability runtime focuses on delivering curated, high-quality capabilities through one CLI and one auth flow. The trade-off is breadth (many integrations) versus depth (consistent, agent-native experience for each capability).",
  },
  {
    question: "Why not just call provider APIs directly?",
    answer:
      "Direct API integration gives full control but requires separate authentication, error handling, rate limiting, and response normalization per provider. When an agent needs image generation from one provider, video generation from another, and vision from a third, the integration burden multiplies. A capability runtime absorbs that complexity into one interface.",
  },
  {
    question: "What capabilities does an agent capability runtime typically include?",
    answer:
      "Common capabilities include image generation (text-to-image, image editing), video generation, image understanding (screenshot analysis, OCR, diagram reading), video analysis, audio understanding, web search, web crawl, cloud storage (drive), and static page publishing. The exact set depends on the runtime.",
  },
  {
    question: "Is AnyCap the only agent capability runtime?",
    answer:
      "AnyCap is the first product to use the term 'agent capability runtime' as its primary category. Other products solve parts of the same problem — model APIs provide individual capabilities, tool platforms provide integrations, MCP servers provide protocol-level tool access — but none combine one install, one auth, and one CLI across the full capability stack the way a dedicated capability runtime does.",
  },
  {
    question: "Does a capability runtime replace the AI agent?",
    answer:
      "No. A capability runtime is not an agent. It runs alongside the agent (Claude Code, Cursor, Codex, or any other agent product) and provides the capabilities the agent does not ship with. The agent handles reasoning, planning, and code execution. The runtime handles everything that sits outside the agent's built-in surface area.",
  },
  {
    question: "How does MCP relate to a capability runtime?",
    answer:
      "MCP (Model Context Protocol) is a communication protocol that standardizes how agents discover and invoke tools. A capability runtime can expose its capabilities via MCP, but MCP alone does not provide the capabilities themselves — it provides the wiring. A capability runtime bundles the actual capability implementations, authentication, and delivery behind that wiring.",
  },
] as const;

const faqJsonLd = createFaqPageJsonLd(faqItems);

const approachComparisons = [
  {
    approach: "Direct API integration",
    what: "Call each provider's REST or SDK API directly for image generation, video generation, vision, etc.",
    install: "Per-provider SDK install and API key setup",
    auth: "Separate credentials per provider",
    tradeoff: "Full control over each provider, but integration burden multiplies with each new capability",
    bestFor: "Teams that only need one capability from one provider and want maximum control",
  },
  {
    approach: "Agent framework",
    what: "Provide the reasoning loop, memory, tool orchestration, and agent lifecycle management",
    install: "Framework-level install (pip, npm, etc.)",
    auth: "Framework manages tool invocation; tools still need their own auth",
    tradeoff: "Strong orchestration, but the framework does not supply the actual capabilities — it calls them",
    bestFor: "Teams building custom agent architectures from scratch",
  },
  {
    approach: "Tool integration platform",
    what: "Connect agents to 100+ third-party services via SDK integrations and managed OAuth",
    install: "SDK integration into application code",
    auth: "Managed per-tool OAuth and API key storage",
    tradeoff: "Very broad coverage, but each tool is still a separate integration surface behind the platform",
    bestFor: "Teams that need CRM, email, calendar, and SaaS tool access for their agents",
  },
  {
    approach: "MCP server",
    what: "Expose a single tool or set of tools via the Model Context Protocol standard",
    install: "MCP server setup per tool or capability",
    auth: "Varies per MCP server implementation",
    tradeoff: "Protocol-level standard for agent-tool communication, but each server is a separate process",
    bestFor: "Teams extending agent products that support MCP natively (Claude Desktop, Cursor, etc.)",
  },
  {
    approach: "Capability runtime",
    what: "One install, one auth, every capability through a consistent agent-native interface",
    install: "One skill file + one CLI binary",
    auth: "Single login covers the full capability stack",
    tradeoff: "Agent-native and consistent, but capabilities are curated rather than open-ended",
    bestFor: "Teams that need multimodal capabilities (image, video, vision, search) inside agent workflows",
  },
] as const;

const architectureLayerRows = [
  {
    layer: "Agent (reasoning layer)",
    role: "Plans, reasons, writes code, executes shell commands, manages conversation",
    examples: "Claude Code, Cursor, Codex, OpenCode, custom LangChain agents",
  },
  {
    layer: "Harness (execution layer)",
    role: "Manages the agent lifecycle: tool routing, permissions, context window, skill discovery",
    examples: "Claude Code's built-in harness, Cursor's agent mode, OpenAI Codex sandbox",
  },
  {
    layer: "Capability runtime",
    role: "Supplies installable capabilities (generation, understanding, search, storage) through one interface",
    examples: "AnyCap",
  },
  {
    layer: "Model / provider APIs",
    role: "Serve individual model inference endpoints for specific tasks",
    examples: "OpenAI API, Google Gemini API, Replicate, fal.ai, ElevenLabs",
  },
] as const;

const capabilityCategories = [
  {
    category: "Generation",
    capabilities: "Image generation (text-to-image, image editing), video generation, music generation",
    agentUse: "Create visuals, demos, product mockups, marketing assets, background tracks",
  },
  {
    category: "Understanding",
    capabilities: "Image understanding (OCR, diagram reading, screenshot analysis), video analysis, audio transcription",
    agentUse: "Interpret screenshots, analyze recordings, read diagrams, extract structured data from media",
  },
  {
    category: "Web retrieval",
    capabilities: "Web search (general and grounded with citations), web crawl (page content extraction)",
    agentUse: "Research, fact-checking, competitive analysis, documentation lookup, evidence gathering",
  },
  {
    category: "Delivery",
    capabilities: "Cloud storage (Drive with shareable URLs), static page publishing (Page)",
    agentUse: "Share generated assets with humans, publish results as web pages, store artifacts for downstream use",
  },
] as const;

const problemSignals = [
  {
    signal: "The agent needs to produce an image, video, or audio artifact",
    without: "Requires a separate image API integration, separate credentials, and custom error handling",
    with: "One CLI command: anycap image generate, anycap video generate, or anycap music generate",
  },
  {
    signal: "The agent needs to interpret a screenshot, diagram, or recording",
    without: "Requires a vision API, possibly a transcription API, each with their own auth and SDK",
    with: "One CLI command: anycap image read, anycap video read, or anycap audio read",
  },
  {
    signal: "The workflow spans three or more capability providers",
    without: "Three sets of API keys, three SDKs, three error-handling patterns, three billing dashboards",
    with: "One login, one CLI, one billing surface",
  },
  {
    signal: "A new agent product needs the same capabilities the old one had",
    without: "Re-integrate each provider for the new agent, rewrite glue code, re-test auth flows",
    with: "Install the same skill file and CLI — capabilities transfer to the new agent immediately",
  },
] as const;

const relatedPages = [
  {
    eyebrow: "Glossary",
    title: "What is context engineering?",
    href: "/glossary/context-engineering",
    summary: "How agents manage the information they feed to the model at inference time.",
  },
  {
    eyebrow: "Glossary",
    title: "What is an agent harness?",
    href: "/glossary/agent-harness",
    summary: "The execution layer that manages tool routing, permissions, and agent lifecycle.",
  },
  {
    eyebrow: "Guide",
    title: "Context engineering for agents",
    href: "/guides/context-engineering-for-agents",
    summary: "Practical strategies for curating the right context inside agent workflows.",
  },
  {
    eyebrow: "Guide",
    title: "Agent skills for developer tools",
    href: "/guides/agent-skills-for-developer-tools",
    summary: "How skill files let agents discover and invoke capabilities without manual configuration.",
  },
  {
    eyebrow: "Compare",
    title: "AnyCap vs Composio",
    href: "/compare/anycap-vs-composio",
    summary: "How a capability runtime compares to a tool integration platform.",
  },
  {
    eyebrow: "Compare",
    title: "AnyCap vs Replicate",
    href: "/compare/anycap-vs-replicate",
    summary: "How a capability runtime compares to a model inference platform.",
  },
] as const;

export default function AgentCapabilityRuntimePage() {
  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: "Home", href: "/" },
        { name: "Glossary", href: "/glossary", unlinkable: true },
        { name: "Agent Capability Runtime", href: "/glossary/agent-capability-runtime" },
      ]} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(definitionJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <article className="px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-[1280px] py-12 md:py-20 lg:py-24">
          {/* ── Hero ── */}
          <FadeIn>
            <p className="text-[11px] text-[#6b7d3a] tracking-[0.8px] mb-4" style={mono}>Glossary</p>
            <p className="mb-3 text-[11px] tracking-[0.5px] text-[#5a5e52]" style={mono}>
              Last updated {lastUpdatedLabel}
            </p>
            <h1
              className="leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(28px, 5vw, 60px)" }}
            >
              What is an agent
              <br />
              capability runtime?
            </h1>
          </FadeIn>

          <FadeIn>
            <div className="mt-8 border-l-[3px] border-[#6b7d3a] pl-6 max-w-[700px]">
              <p className="text-base leading-7 text-[#4d5145] md:text-lg">
                An <strong>agent capability runtime</strong> is a software layer that gives AI agents
                installable capabilities — such as image generation, video generation, image
                understanding, video analysis, web search, and web crawl — through a single
                interface. Instead of requiring agents to integrate separate SDKs, manage
                multiple authentication flows, and learn different APIs for each capability, a
                capability runtime provides one install path, one auth flow, and one command
                surface for everything the agent needs beyond its built-in reasoning loop.
              </p>
            </div>
          </FadeIn>

          <FadeIn className="mt-6">
            <div className="max-w-[700px] space-y-4">
              <p className="text-base leading-7 text-[#4d5145]">
                The term describes a specific architectural layer in the agent stack. An agent
                handles reasoning, planning, and code execution. A harness manages the agent
                lifecycle — tool routing, permissions, and context. A capability runtime sits
                below both and supplies the actual capabilities: generation, understanding,
                retrieval, storage, and publishing. It abstracts away provider differences so
                agents can focus on <em>using</em> capabilities rather than configuring them.
              </p>
              <p className="text-base leading-7 text-[#4d5145]">
                The concept emerged because modern AI agents — Claude Code, Cursor, Codex, and
                others — are increasingly expected to do more than reason and generate text.
                They need to create images, produce videos, understand screenshots, analyze
                recordings, search the web, and deliver results that humans can see and use.
                Each of these capabilities traditionally requires its own API integration,
                authentication, error handling, and billing relationship. A capability runtime
                consolidates that into one layer.
              </p>
            </div>
          </FadeIn>

          <FadeIn className="mt-8">
            <EarlyAccessBanner />
          </FadeIn>

          <div className="mt-16 md:mt-24"><hr className="border-t border-[#d4dbb8]" /></div>

          {/* ── Where it fits in the agent stack ── */}
          <FadeIn>
            <section className="mt-16 md:mt-24">
              <p className="text-[11px] text-[#6b7d3a] tracking-[0.8px] mb-4" style={mono}>Architecture</p>
              <h2 className="text-lg md:text-xl text-[#1c1f17] mb-4" style={pixel}>
                Where a capability runtime fits in the agent stack
              </h2>
              <p className="max-w-[700px] text-base leading-7 text-[#4d5145] mb-8">
                An agent stack has multiple layers. Each layer has a distinct responsibility.
                A capability runtime occupies the layer between the harness (which manages the
                agent) and the model/provider APIs (which serve individual endpoints). It
                unifies capabilities that would otherwise be scattered across providers.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[#d4dbb8]">
                      <th className="pb-3 pr-6 text-[11px] text-[#5a5e52] tracking-[0.5px] w-[200px]" style={mono}>Layer</th>
                      <th className="pb-3 pr-6 text-[11px] text-[#5a5e52] tracking-[0.5px]" style={mono}>Responsibility</th>
                      <th className="pb-3 text-[11px] text-[#5a5e52] tracking-[0.5px]" style={mono}>Examples</th>
                    </tr>
                  </thead>
                  <tbody>
                    {architectureLayerRows.map((row) => (
                      <tr key={row.layer} className="border-b border-[#d4dbb8]/50">
                        <td className={`py-4 pr-6 text-sm font-medium align-top ${row.layer === "Capability runtime" ? "text-[#6b7d3a]" : "text-[#1c1f17]"}`}>
                          {row.layer}
                        </td>
                        <td className="py-4 pr-6 text-sm text-[#4d5145] leading-6 align-top">{row.role}</td>
                        <td className="py-4 text-sm text-[#4d5145] leading-6 align-top">{row.examples}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-6 max-w-[700px] text-sm leading-6 text-[#5a5e52]">
                The key insight is that capabilities are not the same as the agent, and they are
                not the same as the model API. A capability runtime is a dedicated layer that
                bridges the gap between what the agent can do natively (reasoning, code) and
                what the workflow actually requires (images, video, vision, search, storage).
              </p>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24"><hr className="border-t border-[#d4dbb8]" /></div>

          {/* ── Why it matters ── */}
          <FadeIn>
            <section className="mt-16 md:mt-24">
              <p className="text-[11px] text-[#6b7d3a] tracking-[0.8px] mb-4" style={mono}>Motivation</p>
              <h2 className="text-lg md:text-xl text-[#1c1f17] mb-4" style={pixel}>
                The problem a capability runtime solves
              </h2>
              <p className="max-w-[700px] text-base leading-7 text-[#4d5145] mb-8">
                Without a capability runtime, adding each new capability to an agent workflow
                means a separate integration. The table below shows what changes when a runtime
                absorbs that integration work.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[#d4dbb8]">
                      <th className="pb-3 pr-6 text-[11px] text-[#5a5e52] tracking-[0.5px]" style={mono}>Signal</th>
                      <th className="pb-3 pr-6 text-[11px] text-[#5a5e52] tracking-[0.5px]" style={mono}>Without a runtime</th>
                      <th className="pb-3 text-[11px] text-[#6b7d3a] tracking-[0.5px]" style={mono}>With a runtime</th>
                    </tr>
                  </thead>
                  <tbody>
                    {problemSignals.map((row) => (
                      <tr key={row.signal} className="border-b border-[#d4dbb8]/50">
                        <td className="py-4 pr-6 text-sm font-medium text-[#1c1f17] align-top">{row.signal}</td>
                        <td className="py-4 pr-6 text-sm text-[#4d5145] leading-6 align-top">{row.without}</td>
                        <td className="py-4 text-sm text-[#4d5145] leading-6 align-top">{row.with}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24"><hr className="border-t border-[#d4dbb8]" /></div>

          {/* ── How it differs from other approaches ── */}
          <FadeIn>
            <section className="mt-16 md:mt-24">
              <p className="text-[11px] text-[#6b7d3a] tracking-[0.8px] mb-4" style={mono}>Comparison</p>
              <h2 className="text-lg md:text-xl text-[#1c1f17] mb-4" style={pixel}>
                How it differs from other approaches
              </h2>
              <p className="max-w-[700px] text-base leading-7 text-[#4d5145] mb-8">
                A capability runtime is not the only way to give agents new abilities. Each
                approach below solves a different slice of the problem. The right choice
                depends on how many capabilities the workflow needs, how many providers it
                spans, and how much integration overhead the team can absorb.
              </p>
              <div className="space-y-4">
                {approachComparisons.map((row) => (
                  <div
                    key={row.approach}
                    className={`rounded-xl border p-6 ${row.approach === "Capability runtime" ? "border-[#6b7d3a] bg-[#f7f8ef]/80" : "border-[#d4dbb8] bg-[#fffffc]/70"}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <h3
                        className={`text-[15px] font-bold ${row.approach === "Capability runtime" ? "text-[#6b7d3a]" : "text-[#1c1f17]"}`}
                        style={mono}
                      >
                        {row.approach}
                      </h3>
                      <span className="shrink-0 text-[11px] text-[#5a5e52] tracking-[0.5px]" style={mono}>
                        {row.bestFor}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-[#4d5145]">{row.what}</p>
                    <div className="mt-4 grid gap-4 sm:grid-cols-3">
                      <div>
                        <p className="text-[11px] text-[#5a5e52] tracking-[0.5px] mb-1" style={mono}>Install</p>
                        <p className="text-sm text-[#4d5145] leading-6">{row.install}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-[#5a5e52] tracking-[0.5px] mb-1" style={mono}>Auth</p>
                        <p className="text-sm text-[#4d5145] leading-6">{row.auth}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-[#5a5e52] tracking-[0.5px] mb-1" style={mono}>Trade-off</p>
                        <p className="text-sm text-[#4d5145] leading-6">{row.tradeoff}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24"><hr className="border-t border-[#d4dbb8]" /></div>

          {/* ── What capabilities a runtime typically includes ── */}
          <FadeIn>
            <section className="mt-16 md:mt-24">
              <p className="text-[11px] text-[#6b7d3a] tracking-[0.8px] mb-4" style={mono}>Scope</p>
              <h2 className="text-lg md:text-xl text-[#1c1f17] mb-4" style={pixel}>
                What capabilities a runtime typically includes
              </h2>
              <p className="max-w-[700px] text-base leading-7 text-[#4d5145] mb-8">
                A capability runtime covers capabilities that sit outside the agent&apos;s
                built-in reasoning loop but are frequently needed inside agent workflows. These
                typically fall into four categories.
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                {capabilityCategories.map((cat) => (
                  <div key={cat.category} className="rounded-xl border border-[#d4dbb8] bg-[#fffffc]/70 p-6">
                    <h3 className="text-[15px] font-bold text-[#1c1f17] mb-3" style={mono}>
                      {cat.category}
                    </h3>
                    <p className="text-sm leading-6 text-[#4d5145] mb-3">{cat.capabilities}</p>
                    <p className="text-[11px] text-[#5a5e52] tracking-[0.5px]" style={mono}>
                      Agent use: {cat.agentUse}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24"><hr className="border-t border-[#d4dbb8]" /></div>

          {/* ── Key design principles ── */}
          <FadeIn>
            <section className="mt-16 md:mt-24">
              <p className="text-[11px] text-[#6b7d3a] tracking-[0.8px] mb-4" style={mono}>Design</p>
              <h2 className="text-lg md:text-xl text-[#1c1f17] mb-4" style={pixel}>
                Key design principles of a capability runtime
              </h2>
              <div className="space-y-6 max-w-[700px]">
                <div className="border-l-[3px] border-[#6b7d3a] pl-6">
                  <h3 className="text-[15px] font-bold text-[#1c1f17] mb-2" style={mono}>One install path</h3>
                  <p className="text-sm leading-6 text-[#4d5145]">
                    Agents should not need to discover, download, and configure a separate
                    package for each capability. A capability runtime installs once and makes
                    every capability available through the same binary or skill file.
                  </p>
                </div>
                <div className="border-l-[3px] border-[#6b7d3a] pl-6">
                  <h3 className="text-[15px] font-bold text-[#1c1f17] mb-2" style={mono}>One auth flow</h3>
                  <p className="text-sm leading-6 text-[#4d5145]">
                    Authentication should happen once and carry across every capability. Agents
                    should not manage separate API keys, OAuth tokens, or billing accounts per
                    provider.
                  </p>
                </div>
                <div className="border-l-[3px] border-[#6b7d3a] pl-6">
                  <h3 className="text-[15px] font-bold text-[#1c1f17] mb-2" style={mono}>Agent-native interface</h3>
                  <p className="text-sm leading-6 text-[#4d5145]">
                    The interface should match how agents already work. For terminal-native
                    agents, that means a CLI. For SDK-based agents, that might mean a library.
                    The key constraint is that the agent can invoke any capability without
                    leaving its native execution environment.
                  </p>
                </div>
                <div className="border-l-[3px] border-[#6b7d3a] pl-6">
                  <h3 className="text-[15px] font-bold text-[#1c1f17] mb-2" style={mono}>Provider abstraction</h3>
                  <p className="text-sm leading-6 text-[#4d5145]">
                    The runtime abstracts away provider differences. If the image generation
                    model changes from Seedream 5 to Nano Banana Pro, the agent&apos;s
                    invocation pattern stays the same. Model selection is a parameter, not a
                    re-integration.
                  </p>
                </div>
                <div className="border-l-[3px] border-[#6b7d3a] pl-6">
                  <h3 className="text-[15px] font-bold text-[#1c1f17] mb-2" style={mono}>Portability across agents</h3>
                  <p className="text-sm leading-6 text-[#4d5145]">
                    Capabilities should transfer when teams switch agents. If a team moves from
                    Claude Code to Cursor or Codex, the same capability runtime should work
                    without re-integrating providers.
                  </p>
                </div>
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24"><hr className="border-t border-[#d4dbb8]" /></div>

          {/* ── AnyCap as a capability runtime ── */}
          <FadeIn>
            <section className="mt-16 md:mt-24">
              <p className="text-[11px] text-[#6b7d3a] tracking-[0.8px] mb-4" style={mono}>Example</p>
              <h2 className="text-lg md:text-xl text-[#1c1f17] mb-4" style={pixel}>
                AnyCap as a capability runtime
              </h2>
              <div className="space-y-4 max-w-[700px]">
                <p className="text-base leading-7 text-[#4d5145]">
                  <Link href="/" className="underline decoration-[#d4dbb8] underline-offset-2 transition-colors hover:text-[#6b7d3a] hover:decoration-[#6b7d3a]">AnyCap</Link> is
                  an agent-native capability runtime built from day one for agent workflows.
                  It implements the design principles above: one skill file install, one CLI
                  binary, one login, and one command surface for every capability.
                </p>
                <p className="text-base leading-7 text-[#4d5145]">
                  Today AnyCap provides image generation
                  (<Link href="/models/seedream-5" className="underline decoration-[#d4dbb8] underline-offset-2 transition-colors hover:text-[#6b7d3a] hover:decoration-[#6b7d3a]">Seedream 5</Link>,{" "}
                  <Link href="/models/nano-banana-pro" className="underline decoration-[#d4dbb8] underline-offset-2 transition-colors hover:text-[#6b7d3a] hover:decoration-[#6b7d3a]">Nano Banana Pro</Link>),
                  video generation
                  (<Link href="/models/veo-3-1" className="underline decoration-[#d4dbb8] underline-offset-2 transition-colors hover:text-[#6b7d3a] hover:decoration-[#6b7d3a]">Veo 3.1</Link>,{" "}
                  <Link href="/models/kling-3-0" className="underline decoration-[#d4dbb8] underline-offset-2 transition-colors hover:text-[#6b7d3a] hover:decoration-[#6b7d3a]">Kling 3.0</Link>),
                  music generation, image understanding, video analysis, audio understanding,
                  web search, grounded web search, web crawl, Drive storage, and Page
                  publishing. It works across Claude Code, Cursor, Codex, and other agent
                  products via skill files.
                </p>
                <div className="bg-[#1c1f17] px-5 py-4 rounded-lg">
                  <p className="text-[13px] text-[#d4e0a4]" style={mono}>
                    curl -fsSL https://anycap.ai/install.sh | sh && anycap login
                  </p>
                </div>
                <p className="text-sm leading-6 text-[#5a5e52]">
                  After this, every capability is available through <span className="text-[#6b7d3a]" style={mono}>anycap &lt;capability&gt; &lt;operation&gt;</span> in
                  any supported agent product.
                </p>
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24"><hr className="border-t border-[#d4dbb8]" /></div>

          {/* ── FAQ ── */}
          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="text-lg md:text-xl text-[#1c1f17] mb-8" style={pixel}>
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

          {/* ── Related pages ── */}
          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="text-lg md:text-xl text-[#1c1f17] mb-8" style={pixel}>
                Related pages
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-[1060px]">
                {relatedPages.map((page) => (
                  <Link
                    key={page.href}
                    href={page.href}
                    className="border border-[#d4dbb8] p-5 hover:border-[#6b7d3a] transition-colors rounded-xl"
                  >
                    <p className="text-[11px] text-[#6b7d3a] tracking-[0.5px] mb-2" style={mono}>
                      {page.eyebrow}
                    </p>
                    <h3 className="text-[15px] font-bold text-[#1c1f17] mb-2" style={mono}>
                      {page.title}
                    </h3>
                    <p className="text-sm text-[#4d5145] leading-6">{page.summary}</p>
                  </Link>
                ))}
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24"><hr className="border-t border-[#d4dbb8]" /></div>

          {/* ── CTAs ── */}
          <FadeIn>
            <section className="mt-16 md:mt-24 mb-8">
              <div className="flex flex-wrap gap-4">
                <Link href="/capabilities" className="inline-block px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#f4f5f0] bg-[#6b7d3a] hover:bg-[#1c1f17] transition-colors rounded-lg" style={mono}>See Capabilities</Link>
                <Link href="/cli" className="inline-block px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] border border-[#1c1f17] hover:bg-[#1c1f17] hover:text-[#f4f5f0] transition-colors rounded-lg" style={mono}>CLI Overview</Link>
                <Link href="/start" className="inline-block px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] border border-[#1c1f17] hover:bg-[#1c1f17] hover:text-[#f4f5f0] transition-colors rounded-lg" style={mono}>Get Started</Link>
                <a
                  href="https://github.com/anycap-ai/anycap"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] border border-[#1c1f17] hover:bg-[#1c1f17] hover:text-[#f4f5f0] transition-colors rounded-lg"
                  style={mono}
                >
                  View on GitHub
                </a>
              </div>
            </section>
          </FadeIn>
        </div>
      </article>
    </>
  );
}
