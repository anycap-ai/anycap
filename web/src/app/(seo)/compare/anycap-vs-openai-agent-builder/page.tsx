import type { Metadata } from "next";
import Image from "next/image";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { siteConfig } from "@/lib/site";
import { EarlyAccessBanner } from "@/components/landing/EarlyAccessBanner";
import { FadeIn } from "@/components/ui/FadeIn";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { createFaqPageJsonLd, createTechArticleJsonLd } from "@/lib/schema";

export const runtime = "edge";

const CDN_BASE = "https://cdn.anycap.ai/page_resource/compare";
const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;
const lastUpdatedLabel = "April 6, 2026";
const lastUpdatedIso = "2026-04-06";

const comparisons = [
  {
    dimension: "Primary job",
    anycap: "Agent-native capability runtime that existing agents call during execution.",
    builder: "Visual workflow builder for designing, previewing, versioning, and deploying OpenAI-based agent workflows.",
  },
  {
    dimension: "Best fit",
    anycap:
      "Teams already using Codex, Cursor, Claude Code, OpenCode, OpenClaw, or custom harnesses that need one shared capability layer.",
    builder:
      "Teams building customer-facing or internal agent workflows directly on the OpenAI platform.",
  },
  {
    dimension: "Workflow model",
    anycap:
      "One CLI and one auth flow focused on capabilities such as image, video, vision, search, storage, and publishing.",
    builder:
      "A node-based canvas with agents, tools, logic, state, typed edges, and preview runs.",
  },
  {
    dimension: "Deployment path",
    anycap: "Install once, log in once, and reuse the same runtime from multiple agent shells.",
    builder:
      "Publish workflow versions, then embed with ChatKit or export workflow code for an Agents SDK integration.",
  },
  {
    dimension: "Tooling scope",
    anycap: "Curated capability layer with one credential and one command surface.",
    builder:
      "Compose agent nodes with file search, guardrails, MCP, human approval, and control-flow logic.",
  },
  {
    dimension: "Vendor alignment",
    anycap:
      "Designed to travel across agent environments instead of anchoring the team to one builder UI.",
    builder: "Strongest when the workflow, model, and deployment path stay inside the OpenAI stack.",
  },
  {
    dimension: "Output handling",
    anycap:
      "Pairs execution with Drive storage and web publishing so artifacts can be kept, shared, and reused.",
    builder:
      "Focuses on workflow orchestration and app deployment rather than a cross-agent capability runtime.",
  },
  {
    dimension: "Decision lens",
    anycap: "Choose when the question is: how do my existing agents gain capabilities?",
    builder: "Choose when the question is: how do I design and ship an OpenAI agent workflow?",
  },
] as const;

const builderStrengths = [
  "OpenAI describes Agent Builder as a visual canvas for multi-step workflows, so it is the better fit when the workflow itself is what you are designing.",
  "The node system covers agent nodes, file search, guardrails, MCP, logic, human approval, and state management in one place.",
  "Published workflows become versioned objects, which is helpful when the team needs stable releases and rollback points.",
  "There is a direct path into ChatKit, which OpenAI positions as the recommended way to embed agentic chat experiences.",
] as const;

const anycapStrengths = [
  "AnyCap is the better fit when the agent shell is already chosen and the missing layer is execution capability rather than workflow design.",
  "One CLI and one auth flow can travel across Codex, Cursor, Claude Code, OpenClaw, and similar environments without rebuilding the stack each time.",
  "The product is optimized around capability access such as image generation, video generation, image understanding, search, Drive storage, and publishing.",
  "This makes AnyCap more useful for teams that operate across several agent products and want one runtime surface instead of one builder per vendor.",
] as const;

const useCases = [
  {
    eyebrow: "Choose OpenAI Agent Builder if",
    title: "The workflow itself is the product.",
    body:
      "You need to map multi-step behavior visually, test nodes with live data, add guardrails and approvals, then publish versions for a deployed chat or app flow.",
  },
  {
    eyebrow: "Choose AnyCap if",
    title: "The agent is already chosen and the missing layer is capability access.",
    body:
      "You want Codex, Cursor, Claude Code, OpenClaw, or a custom harness to gain image, video, vision, search, storage, and publishing through one shared runtime.",
  },
  {
    eyebrow: "Choose OpenAI Agent Builder if",
    title: "You want a tight OpenAI-stack deployment path.",
    body:
      "Agent Builder is a stronger match when you want versions, OpenAI-hosted workflow execution, and a direct ChatKit path into an embedded customer-facing chat experience.",
  },
  {
    eyebrow: "Choose AnyCap if",
    title: "You care more about portability than builder UX.",
    body:
      "AnyCap is stronger when the same capability surface needs to move with the team across multiple agent shells rather than being attached to one workflow canvas.",
  },
] as const;

const faqItems = [
  {
    question: "Is AnyCap an agent builder?",
    answer:
      "No. AnyCap is an agent-native capability runtime. It gives existing agents a shared execution layer for image, video, vision, search, storage, and publishing instead of acting as a workflow builder.",
  },
  {
    question: "Is OpenAI Agent Builder better for customer-facing agent apps?",
    answer:
      "Usually yes. OpenAI positions Agent Builder around visually designing workflows, publishing versioned builds, and deploying them with ChatKit or exported workflow code, which makes it a stronger fit when the workflow itself needs to become part of a product.",
  },
  {
    question: "When should a team compare AnyCap to OpenAI Agent Builder?",
    answer:
      "Compare them when the team is deciding between two layers of the stack: a workflow builder on the OpenAI platform versus a shared runtime that equips already-chosen agents with capabilities during execution.",
  },
  {
    question: "Can AnyCap replace OpenAI Agent Builder?",
    answer:
      "Not if you specifically need a visual workflow canvas, node-level control flow, versioned workflow publishing, or ChatKit deployment. AnyCap replaces capability wiring work, not the builder category itself.",
  },
  {
    question: "What is the simplest rule of thumb?",
    answer:
      "If you need to design and ship an OpenAI workflow, choose Agent Builder. If you already have agents and need them to do more, choose AnyCap.",
  },
] as const;

const sourceLinks = [
  {
    label: "OpenAI Agent Builder guide",
    href: "https://developers.openai.com/api/docs/guides/agent-builder",
    note: "Visual canvas, typed inputs and outputs, templates, preview, workflow publishing, ChatKit, and exported code.",
  },
  {
    label: "OpenAI node reference",
    href: "https://developers.openai.com/api/docs/guides/node-reference",
    note: "Agent, file search, guardrails, MCP, logic, human approval, transform, and state nodes.",
  },
  {
    label: "OpenAI safety in building agents",
    href: "https://developers.openai.com/api/docs/guides/agent-builder-safety",
    note: "Prompt injection, data leakage, structured outputs, tool approvals, and guardrails guidance.",
  },
  {
    label: "AnyCap CLI overview",
    href: "/cli",
    note: "One CLI, one auth flow, and one capability surface across multiple agent environments.",
  },
  {
    label: "Install AnyCap",
    href: "/guides/install-anycap",
    note: "Published setup flow for Codex, Cursor, OpenClaw, and similar agent products.",
  },
  {
    label: "Agent capability runtime",
    href: "/glossary/agent-capability-runtime",
    note: "Definition of the category AnyCap is trying to own.",
  },
  {
    label: "AnyCap Drive",
    href: "/capabilities/drive",
    note: "Shared storage and public URLs for outputs that need to survive beyond one run.",
  },
] as const;

const articleJsonLd = createTechArticleJsonLd({
  headline: "AnyCap vs OpenAI Agent Builder — capability runtime vs workflow builder",
  description:
    "Comparison guide for teams deciding whether they need OpenAI Agent Builder's workflow canvas or AnyCap's cross-agent capability runtime.",
  path: "/compare/anycap-vs-openai-agent-builder",
  about: [
    "AnyCap",
    "OpenAI Agent Builder",
    "Agent capability runtime",
    "Agent workflow builder",
    "ChatKit",
  ],
  keywords: [
    "anycap vs openai agent builder",
    "openai agent builder alternative",
    "agent builder vs capability runtime",
    "openai workflow builder",
    "capability runtime for agents",
  ],
  datePublished: "2026-04-06",
  dateModified: lastUpdatedIso,
});

const faqJsonLd = createFaqPageJsonLd(faqItems);

export const metadata: Metadata = {
  title: "AnyCap vs OpenAI Agent Builder — capability runtime vs workflow builder",
  description:
    "Compare AnyCap and OpenAI Agent Builder. OpenAI Agent Builder is a visual workflow builder with typed nodes, guardrails, versioning, and ChatKit deployment. AnyCap is a cross-agent capability runtime for Codex, Cursor, Claude Code, and similar harnesses.",
  alternates: { canonical: "/compare/anycap-vs-openai-agent-builder" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/compare/anycap-vs-openai-agent-builder",
    siteName: siteConfig.siteName,
    title: "AnyCap vs OpenAI Agent Builder — capability runtime vs workflow builder",
    description:
      "See when OpenAI Agent Builder is the right workflow layer and when AnyCap is the better capability layer.",
  },
};

export default function AnycapVsOpenAIAgentBuilderPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Compare", href: "/compare", unlinkable: true },
          { name: "AnyCap vs OpenAI Agent Builder" },
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
              Compare
            </p>
            <p className="mb-3 text-[11px] tracking-[0.5px] text-[#5a5e52]" style={mono}>
              Last updated {lastUpdatedLabel}
            </p>
            <h1
              className="leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(28px, 5vw, 60px)" }}
            >
              AnyCap vs
              <br />
              OpenAI Agent Builder
            </h1>
            <p className="mt-6 max-w-[840px] text-base leading-7 text-[#4d5145] md:text-lg">
              AnyCap vs OpenAI Agent Builder is not a same-category comparison. OpenAI Agent
              Builder is a workflow builder for designing, testing, versioning, and deploying
              multi-step agent systems on the OpenAI stack. AnyCap is a capability runtime that
              equips agents you already use with one shared execution layer for image, video,
              vision, search, storage, and publishing.
            </p>
            <div className="mt-8 max-w-[920px] rounded-2xl border border-[#d4dbb8] bg-[#fbfcf8] p-6 md:p-7">
              <p className="text-[11px] tracking-[0.7px] text-[#6b7d3a]" style={mono}>
                Answer-first summary
              </p>
              <p className="mt-3 text-sm leading-6 text-[#4d5145] md:text-[15px]">
                Choose OpenAI Agent Builder when you want to visually design and ship an OpenAI
                workflow, especially if the result will become an embedded chat or internal product
                experience. Choose AnyCap when you already have agents such as Codex, Cursor,
                Claude Code, or OpenClaw and you want those agents to gain capabilities through
                one CLI and one auth flow instead of rebuilding capability wiring for every
                environment.
              </p>
            </div>
          </FadeIn>

          <FadeIn className="mt-8">
            <EarlyAccessBanner />
          </FadeIn>

          <FadeIn className="mt-10">
            <section className="max-w-[1120px]">
              <div className="overflow-hidden rounded-[28px] border border-[#d4dbb8] bg-[#fbfcf8] shadow-[0_16px_40px_rgba(28,31,23,0.08)]">
                <Image
                  src={`${CDN_BASE}/anycap-vs-openai-agent-builder.png`}
                  alt="Generated comparison hero showing a workflow-builder layer on the left and multiple coding agents flowing into one shared AnyCap capability runtime on the right."
                  width={1600}
                  height={900}
                  className="h-auto w-full"
                  unoptimized
                  priority
                />
              </div>
              <p className="mt-4 max-w-[900px] text-sm leading-6 text-[#4d5145]">
                This hero image was generated with AnyCap using Nano Banana 2. The left side
                represents the workflow-builder layer, and the right side represents a shared
                capability runtime that multiple coding agents can plug into during execution.
              </p>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-8 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                Side-by-side comparison
              </h2>
              <div className="overflow-x-auto rounded-xl border border-[#d4dbb8]">
                <table className="w-full text-left">
                  <thead className="bg-[#f9faf5]">
                    <tr className="border-b border-[#d4dbb8]">
                      <th
                        className="px-5 py-3 pr-6 text-[11px] tracking-[0.5px] text-[#5a5e52]"
                        style={mono}
                      >
                        Dimension
                      </th>
                      <th
                        className="px-5 py-3 pr-6 text-[11px] tracking-[0.5px] text-[#6b7d3a]"
                        style={mono}
                      >
                        AnyCap
                      </th>
                      <th
                        className="px-5 py-3 text-[11px] tracking-[0.5px] text-[#5a5e52]"
                        style={mono}
                      >
                        OpenAI Agent Builder
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisons.map((row) => (
                      <tr
                        key={row.dimension}
                        className="border-b border-[#d4dbb8]/50 last:border-b-0"
                      >
                        <td className="px-5 py-4 pr-6 text-sm font-medium text-[#1c1f17] align-top">
                          {row.dimension}
                        </td>
                        <td className="px-5 py-4 pr-6 text-sm leading-6 text-[#4d5145] align-top">
                          {row.anycap}
                        </td>
                        <td className="px-5 py-4 text-sm leading-6 text-[#4d5145] align-top">
                          {row.builder}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-4 max-w-[920px] text-[12px] leading-5 text-[#7a7e71]" style={mono}>
                Comparison reviewed against public OpenAI docs and published AnyCap pages on
                April 6, 2026.
              </p>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-6 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                The real framing: workflow builder vs capability runtime
              </h2>
              <div className="max-w-[900px] space-y-5">
                <p className="text-base leading-7 text-[#4d5145]">
                  Teams often compare these products because both appear in conversations about
                  agent infrastructure. But they solve different problems. Agent Builder decides
                  how an OpenAI workflow is assembled, routed, reviewed, versioned, and deployed.
                  AnyCap decides how an agent gets capabilities once the agent or harness is
                  already in place.
                </p>
                <p className="text-base leading-7 text-[#4d5145]">
                  That difference matters because it changes the buying question. If you are
                  choosing a builder, you are choosing how the workflow itself will be authored and
                  shipped. If you are choosing AnyCap, you are choosing whether to standardize the
                  execution layer that multiple agents can share.
                </p>
              </div>
              <div className="mt-8 grid gap-4 md:grid-cols-3 max-w-[1080px]">
                <div className="rounded-xl border border-[#d4dbb8] p-5">
                  <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                    Ask this first
                  </p>
                  <h3 className="mb-2 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                    Do you need to design the workflow?
                  </h3>
                  <p className="text-sm leading-6 text-[#4d5145]">
                    If yes, OpenAI Agent Builder is the more relevant product because the visual
                    workflow, node contracts, approvals, and deployment path are the center of the
                    job to be done.
                  </p>
                </div>
                <div className="rounded-xl border border-[#d4dbb8] p-5">
                  <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                    Ask this next
                  </p>
                  <h3 className="mb-2 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                    Or do you need to equip existing agents?
                  </h3>
                  <p className="text-sm leading-6 text-[#4d5145]">
                    If the agent shell is already decided and the problem is missing capabilities,
                    AnyCap is the better comparison because it standardizes capability access
                    across existing agent environments.
                  </p>
                </div>
                <div className="rounded-xl border border-[#d4dbb8] p-5">
                  <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                    Practical rule
                  </p>
                  <h3 className="mb-2 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                    Builder on one side, runtime on the other
                  </h3>
                  <p className="text-sm leading-6 text-[#4d5145]">
                    This page is strongest when you read it as an architecture comparison rather
                    than a feature checklist. The categories are adjacent, not interchangeable.
                  </p>
                </div>
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 grid gap-6 md:mt-24 md:grid-cols-2">
              <div className="rounded-xl border border-[#d4dbb8] p-6">
                <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                  Fair reading
                </p>
                <h2 className="mb-4 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                  Where OpenAI Agent Builder is strong
                </h2>
                <ul className="space-y-3">
                  {builderStrengths.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm leading-6 text-[#4d5145]">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#6b7d3a]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-[#d4dbb8] p-6">
                <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                  Why teams choose AnyCap
                </p>
                <h2 className="mb-4 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                  Where AnyCap is the better fit
                </h2>
                <ul className="space-y-3">
                  {anycapStrengths.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm leading-6 text-[#4d5145]">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#6b7d3a]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-6 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                Best fit by use case
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 max-w-[1040px]">
                {useCases.map((item) => (
                  <div key={item.title} className="border border-[#d4dbb8] p-5">
                    <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                      {item.eyebrow}
                    </p>
                    <h3 className="mb-2 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                      {item.title}
                    </h3>
                    <p className="text-sm leading-6 text-[#4d5145]">{item.body}</p>
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
                How this comparison was reviewed
              </h2>
              <div className="max-w-[940px] space-y-5">
                <p className="text-base leading-7 text-[#4d5145]">
                  The OpenAI side of this page was reviewed against official OpenAI developer docs
                  available on April 6, 2026. The core claims used here are intentionally narrow
                  and verifiable: Agent Builder is a visual canvas for multi-step workflows; it
                  supports typed inputs and outputs, preview runs, templates, versioned publishing,
                  and deployment through ChatKit or exported workflow code; its node system covers
                  agents, file search, guardrails, MCP, logic, human approval, and state.
                </p>
                <p className="text-base leading-7 text-[#4d5145]">
                  The AnyCap side of the comparison is based on published AnyCap pages for the CLI,
                  installation flow, capability-runtime definition, Drive, and pricing. Claims are
                  limited to what those pages already state publicly: one CLI, one auth flow,
                  cross-agent fit, shared capability access, storage, public URLs, and web
                  publishing support.
                </p>
                <div className="rounded-xl border border-[#d4dbb8] bg-[#f9faf5] p-5">
                  <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                    Methodology note
                  </p>
                  <p className="text-sm leading-6 text-[#4d5145]">
                    This page compares layer fit, not which company has more total product surface
                    area. If OpenAI changes Agent Builder deployment options or AnyCap changes its
                    capability inventory later, the page should be updated to stay tied to current
                    public documentation.
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
              <h2 className="mb-8 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                Source notes
              </h2>
              <div className="grid gap-4 max-w-[980px] sm:grid-cols-2">
                {sourceLinks.map((source) => (
                  <div key={source.label} className="border border-[#d4dbb8] p-5">
                    {source.href.startsWith("http") ? (
                      <a
                        href={source.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[14px] font-bold text-[#1c1f17] hover:text-[#6b7d3a]"
                        style={mono}
                      >
                        {source.label}
                      </a>
                    ) : (
                      <Link
                        href={source.href}
                        className="text-[14px] font-bold text-[#1c1f17] hover:text-[#6b7d3a]"
                        style={mono}
                      >
                        {source.label}
                      </Link>
                    )}
                    <p className="mt-3 text-sm leading-6 text-[#4d5145]">{source.note}</p>
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
                Related pages
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 max-w-[1040px]">
                <Link
                  href="/glossary/agent-capability-runtime"
                  className="border border-[#d4dbb8] p-5 transition-colors hover:border-[#6b7d3a]"
                >
                  <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                    Glossary
                  </p>
                  <h3 className="mb-2 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                    Agent Capability Runtime
                  </h3>
                  <p className="text-sm leading-6 text-[#4d5145]">
                    Read the core definition for the category AnyCap is trying to own.
                  </p>
                </Link>
                <Link
                  href="/cli"
                  className="border border-[#d4dbb8] p-5 transition-colors hover:border-[#6b7d3a]"
                >
                  <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                    Product
                  </p>
                  <h3 className="mb-2 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                    AnyCap CLI
                  </h3>
                  <p className="text-sm leading-6 text-[#4d5145]">
                    See the one-command surface that lets capabilities travel across agent
                    environments.
                  </p>
                </Link>
                <Link
                  href="/for/codex"
                  className="border border-[#d4dbb8] p-5 transition-colors hover:border-[#6b7d3a]"
                >
                  <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                    Agent fit
                  </p>
                  <h3 className="mb-2 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                    AnyCap for Codex
                  </h3>
                  <p className="text-sm leading-6 text-[#4d5145]">
                    See what it looks like when the agent is already chosen and the missing layer
                    is capability access.
                  </p>
                </Link>
                <Link
                  href="/compare/anycap-vs-composio"
                  className="border border-[#d4dbb8] p-5 transition-colors hover:border-[#6b7d3a]"
                >
                  <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                    Compare
                  </p>
                  <h3 className="mb-2 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                    AnyCap vs Composio
                  </h3>
                  <p className="text-sm leading-6 text-[#4d5145]">
                    Compare a capability runtime with a broader tool-integration platform.
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
              <h2 className="mb-8 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                FAQ
              </h2>
              <div className="space-y-6 max-w-[900px]">
                {faqItems.map((item) => (
                  <div key={item.question} className="border border-[#d4dbb8] p-5">
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
                  href="/guides/install-anycap"
                  className="inline-block rounded-lg bg-[#6b7d3a] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#f4f5f0] transition-colors hover:bg-[#1c1f17]"
                  style={mono}
                >
                  Install AnyCap
                </Link>
                <Link
                  href="/cli"
                  className="inline-block rounded-lg border border-[#1c1f17] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] transition-colors hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
                  style={mono}
                >
                  CLI Overview
                </Link>
                <Link
                  href="/for/codex"
                  className="inline-block rounded-lg border border-[#1c1f17] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] transition-colors hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
                  style={mono}
                >
                  See Agent Use Cases
                </Link>
              </div>
            </section>
          </FadeIn>
        </div>
      </article>
    </>
  );
}
