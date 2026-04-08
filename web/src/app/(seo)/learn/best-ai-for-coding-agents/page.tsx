import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { FadeIn } from "@/components/ui/FadeIn";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { createFaqPageJsonLd, createTechArticleJsonLd } from "@/lib/schema";
import { siteConfig } from "@/lib/site";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;
const lastUpdatedLabel = "April 7, 2026";
const lastUpdatedIso = "2026-04-07";

export const metadata: Metadata = {
  title: "Best AI for Coding Agents: choose the right model and capability stack",
  description:
    "Use this page as the category guide for choosing a coding-agent stack, then drill into model quality, platform-specific workflows, and the capability layer around the agent.",
  alternates: { canonical: "/learn/best-ai-for-coding-agents" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/learn/best-ai-for-coding-agents",
    siteName: siteConfig.siteName,
    title: "Best AI for Coding Agents: choose the right model and capability stack",
    description:
      "A category guide for teams deciding whether the best coding-agent setup is a model choice, a platform-specific workflow choice, or a capability-layer choice.",
  },
};

const articleJsonLd = createTechArticleJsonLd({
  headline: "Best AI for Coding Agents: choose the right model and capability stack",
  description:
    "A category guide for teams deciding whether the best coding-agent setup is a model choice, a platform-specific workflow choice, or a capability-layer choice.",
  path: "/learn/best-ai-for-coding-agents",
  about: [
    "Coding agents",
    "AI models",
    "Claude Code",
    "Cursor",
    "Codex",
    "Agent capability runtime",
  ],
  keywords: [
    "best ai for coding agents",
    "best ai coding agent",
    "coding agent stack",
    "coding agent capabilities",
    "ai tools for coding teams",
  ],
  datePublished: lastUpdatedIso,
  dateModified: lastUpdatedIso,
});

const quickTakeaways = [
  "Most teams mix up three decisions: the best base model, the best platform-specific workflow, and the best capability layer around the agent.",
  "If the job stays inside code, model quality and editing experience matter most.",
  "If the work crosses into screenshots, recordings, media generation, or deliverables, the best setup becomes a stack decision instead of a simple ranking question.",
] as const;

const evaluationCards = [
  {
    title: "Base model quality",
    body: "Start here when the work is mostly planning, reading code, writing diffs, debugging, and staying coherent inside a real repository.",
  },
  {
    title: "Platform-specific workflow fit",
    body: "If you already know you are on Claude Code or Cursor, the better question is often what the best setup looks like inside that environment rather than across the whole market.",
  },
  {
    title: "How much of the task leaves code",
    body: "Many software workflows spill into screenshots, launch assets, demos, recordings, and visual QA. That is where the best setup stops being only a coding-model question.",
  },
  {
    title: "Capability and integration overhead",
    body: "A theoretically strong stack loses value when every new workflow requires separate providers, credentials, and brittle glue code around the agent.",
  },
] as const;

const stackCards = [
  {
    title: "Best model inside a coding loop",
    label: "Use when the work is mostly code",
    body: "This is the right frame when the workflow mostly stays inside prompts, diffs, tests, and files. The main question is which model reasons best inside the coding environment you already trust.",
  },
  {
    title: "Platform-specific setup guide",
    label: "Use when you are already on Claude Code or Cursor",
    body: "Once the agent surface is already chosen, the best answer usually becomes narrower. You need the page that explains what the strongest setup looks like inside that specific workflow.",
  },
  {
    title: "Agent plus capability runtime",
    label: "Best when tasks cross media and output layers",
    body: "This is where AnyCap fits. You keep Claude Code, Cursor, or Codex, and add the missing capability layer for image generation, video generation, image understanding, and video analysis through one surface.",
  },
] as const;

const drillDownCards = [
  {
    label: "Platform-specific buyer guide",
    title: "Best AI for Claude Code",
    href: "/learn/best-ai-for-claude-code",
    body: "Use this when you already know Claude Code is the core workflow and want the narrower recommendation inside that environment.",
  },
  {
    label: "Platform-specific buyer guide",
    title: "Best AI for Cursor",
    href: "/learn/best-ai-for-cursor",
    body: "Use this when Cursor is the main environment and the question is how far the editor loop can go before capability gaps matter.",
  },
  {
    label: "Agent-specific path",
    title: "Codex workflows",
    href: "/for/codex",
    body: "Use this when the category question is already settled and you want the Codex specific path into AnyCap.",
  },
  {
    label: "Capability-gap path",
    title: "What agents still cannot do",
    href: "/learn/what-agents-cant-do",
    body: "Use this when the real blocker is not choosing an agent at all, but identifying the missing capabilities around one you already like.",
  },
] as const;

const capabilityCards = [
  {
    title: "Image generation",
    href: "/capabilities/image-generation",
    body: "Generate product visuals, concepts, and launch assets instead of only drafting instructions for a human designer.",
  },
  {
    title: "Video generation",
    href: "/capabilities/video-generation",
    body: "Create short demos and motion assets when a coding task needs an actual artifact instead of another paragraph.",
  },
  {
    title: "Image understanding",
    href: "/capabilities/image-understanding",
    body: "Read screenshots, references, and visual QA inputs through the same workflow as code reasoning.",
  },
  {
    title: "Video analysis",
    href: "/capabilities/video-analysis",
    body: "Inspect recordings and explain what happened when the bug or workflow issue lives inside a video.",
  },
] as const;

const selectionRows = [
  {
    question: "When is this mostly a model comparison?",
    answer:
      "It is mostly a model comparison when the work stays close to code: planning changes, writing diffs, debugging, reading logs, and updating files. In that case, reasoning quality and editing ergonomics dominate the decision.",
  },
  {
    question: "When should I open the Claude Code or Cursor specific page instead?",
    answer:
      "Open the narrower page once you already know which agent surface you want to keep. At that point, the problem is no longer the whole category. It is the best setup inside a specific workflow.",
  },
  {
    question: "When does capability runtime matter more than another benchmark?",
    answer:
      "Capability runtime matters more once the task must generate visuals, inspect screenshots, analyze recordings, or turn the result into something a human can use outside the code editor.",
  },
] as const;

const nextMoveCards = [
  {
    title: "Best AI for Claude Code",
    href: "/learn/best-ai-for-claude-code",
    body: "Go here when the category question has narrowed to Claude Code specifically.",
  },
  {
    title: "Best AI for Cursor",
    href: "/learn/best-ai-for-cursor",
    body: "Go here when the category question has narrowed to Cursor specifically.",
  },
  {
    title: "What agents still cannot do",
    href: "/learn/what-agents-cant-do",
    body: "Go here when the real issue is capability gaps rather than picking a new agent.",
  },
  {
    title: "See the SaaS assistant version",
    href: "/learn/ai-chatbot-vs-ai-agent-for-saas",
    body: "Go here if the same stack decision is showing up in a SaaS chatbot or copilot instead of a coding workflow.",
  },
  {
    title: "Browse the capability hub",
    href: "/capabilities",
    body: "Go here when you already know the problem and want the exact AnyCap surface that solves it.",
  },
] as const;

const faqItems = [
  {
    question: "What is the best AI for coding agents right now?",
    answer:
      "There is no single permanent answer for every team. The best choice depends on whether your real question is model quality, platform-specific workflow fit, or the capability layer around the agent.",
  },
  {
    question: "When is the best coding agent mostly a benchmark question?",
    answer:
      "It is mostly a benchmark question when the work stays inside code and the main goal is reasoning, editing, debugging, and repository comprehension.",
  },
  {
    question: "When should I jump to the Claude Code or Cursor specific guide?",
    answer:
      "Jump to the narrower guide once you already know which agent surface you want to keep. This page is best used as the category guide before the workflow gets more specific.",
  },
  {
    question: "Does AnyCap replace Claude Code, Cursor, or Codex?",
    answer:
      "No. AnyCap is the capability runtime around those agents. Its role is to expand what they can actually do, especially across image, video, and vision workflows.",
  },
] as const;

const faqJsonLd = createFaqPageJsonLd(faqItems);

function BulletList({ items }: { items: readonly string[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-sm leading-6 text-[#4d5145] md:text-[15px]">
          <span className="mt-[8px] h-1.5 w-1.5 rounded-full bg-[#6b7d3a]" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function BestAIForCodingAgentsPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Learn", href: "/learn", unlinkable: true },
          { name: "Best AI for coding agents" },
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
            <p className="mb-3 text-[11px] tracking-[0.5px] text-[#5a5e52]" style={mono}>
              Last updated {lastUpdatedLabel}
            </p>
            <h1
              className="leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(32px, 6vw, 72px)" }}
            >
              Best AI for
              <br />
              coding agents
            </h1>
            <p className="mt-6 max-w-[820px] text-base leading-7 text-[#4d5145] md:text-lg">
              The best AI for coding agents is usually not a single leaderboard answer. This page
              is the category guide for a broader decision: are you really choosing a model, a
              platform-specific workflow, or the capability layer around the agent? Use it to frame
              the decision, then drill into Claude Code, Cursor, or capability-gap pages when your
              question gets narrower.
            </p>
          </FadeIn>

          <FadeIn className="mt-10">
            <section className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.9fr)]">
              <div className="rounded-[28px] border border-[#d4dbb8] bg-[#fffffc]/80 p-8 md:p-10">
                <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                  Quick answer
                </p>
                <h2 className="mt-4 text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                  First decide whether you are comparing models, workflows, or capabilities.
                </h2>
                <p className="mt-5 max-w-[720px] text-sm leading-6 text-[#4d5145] md:text-[15px]">
                  Teams often flatten all three into one ranking query. In practice, the right
                  answer changes depending on whether the work stays inside code, already lives in a
                  tool like Claude Code or Cursor, or spills into screenshots, recordings, media
                  generation, and deliverable creation.
                </p>
              </div>

              <div className="rounded-[28px] border border-[#d4dbb8] bg-[#f7f8ef]/80 p-6 md:p-8">
                <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                  Key points
                </p>
                <div className="mt-5">
                  <BulletList items={quickTakeaways} />
                </div>
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                What to evaluate
              </p>
              <h2 className="mt-3 max-w-[820px] text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                Most teams mix up these four buying criteria
              </h2>
              <div className="mt-8 grid gap-4 md:grid-cols-2">
                {evaluationCards.map((card) => (
                  <div
                    key={card.title}
                    className="rounded-[24px] border border-[#d4dbb8] bg-[#fffffc]/70 p-6"
                  >
                    <h3 className="text-[18px] leading-7 text-[#1c1f17]" style={mono}>
                      {card.title}
                    </h3>
                    <p className="mt-4 text-sm leading-6 text-[#4d5145] md:text-[15px]">
                      {card.body}
                    </p>
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
              <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                What people really mean
              </p>
              <h2 className="mt-3 max-w-[820px] text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                This keyword usually hides one of three different decisions
              </h2>
              <div className="mt-8 grid gap-4 lg:grid-cols-3">
                {stackCards.map((card) => (
                  <div
                    key={card.title}
                    className="rounded-[24px] border border-[#d4dbb8] bg-[#f7f8ef]/70 p-6"
                  >
                    <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                      {card.label}
                    </p>
                    <h3 className="mt-3 text-[18px] leading-7 text-[#1c1f17]" style={mono}>
                      {card.title}
                    </h3>
                    <p className="mt-4 text-sm leading-6 text-[#4d5145] md:text-[15px]">
                      {card.body}
                    </p>
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
              <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                Go deeper by stack
              </p>
              <h2 className="mt-3 max-w-[820px] text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                Use this page as the category guide, then open the narrower page that fits your workflow
              </h2>
              <p className="mt-5 max-w-[820px] text-sm leading-6 text-[#4d5145] md:text-[15px]">
                Once you already know which agent surface you want to keep, a platform-specific page
                or capability-gap page will usually give you the better answer.
              </p>
              <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {drillDownCards.map((card) => (
                  <Link
                    key={card.href}
                    href={card.href}
                    className="rounded-[24px] border border-[#d4dbb8] bg-[#fffffc]/70 p-6 transition-colors hover:border-[#6b7d3a]"
                  >
                    <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                      {card.label}
                    </p>
                    <h3 className="mt-3 text-[18px] leading-7 text-[#1c1f17]" style={mono}>
                      {card.title}
                    </h3>
                    <p className="mt-4 text-sm leading-6 text-[#4d5145] md:text-[15px]">
                      {card.body}
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
              <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                Where AnyCap fits
              </p>
              <h2 className="mt-3 max-w-[820px] text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                The capability layer matters after the category question is clear
              </h2>
              <p className="mt-5 max-w-[820px] text-sm leading-6 text-[#4d5145] md:text-[15px]">
                Once you know you want to keep the agent you already use, the next question is what
                the stack still cannot do on its own. For many teams, the answer starts with image,
                video, and vision workflows that are painful to stitch together one by one.
              </p>
              <div className="mt-8 grid gap-4 md:grid-cols-2">
                {capabilityCards.map((card) => (
                  <Link
                    key={card.href}
                    href={card.href}
                    className="rounded-[24px] border border-[#d4dbb8] bg-[#fffffc]/70 p-6 transition-colors hover:border-[#6b7d3a]"
                  >
                    <h3 className="text-[18px] leading-7 text-[#1c1f17]" style={mono}>
                      {card.title}
                    </h3>
                    <p className="mt-4 text-sm leading-6 text-[#4d5145] md:text-[15px]">
                      {card.body}
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
              <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                How to choose
              </p>
              <h2 className="mt-3 max-w-[820px] text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                Ask these questions before you treat this like one ranking problem
              </h2>
              <div className="mt-8 space-y-4">
                {selectionRows.map((row) => (
                  <div
                    key={row.question}
                    className="rounded-[24px] border border-[#d4dbb8] bg-[#fffffc]/70 p-6"
                  >
                    <h3 className="text-base text-[#1c1f17]" style={mono}>
                      {row.question}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-[#4d5145] md:text-[15px]">
                      {row.answer}
                    </p>
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
              <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                Best next moves
              </p>
              <h2 className="mt-3 max-w-[820px] text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                Move from the category guide into the exact workflow you care about
              </h2>
              <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                {nextMoveCards.map((card) => (
                  <Link
                    key={card.href}
                    href={card.href}
                    className="rounded-[24px] border border-[#d4dbb8] bg-[#f7f8ef]/70 p-5 transition-colors hover:border-[#6b7d3a]"
                  >
                    <h3 className="text-base text-[#1c1f17]" style={mono}>
                      {card.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-[#4d5145]">{card.body}</p>
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
              <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                FAQ
              </p>
              <h2 className="mt-3 text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                Questions behind the keyword
              </h2>
              <div className="mt-8 space-y-4">
                {faqItems.map((item) => (
                  <div
                    key={item.question}
                    className="rounded-[24px] border border-[#d4dbb8] bg-[#fffffc]/70 p-6"
                  >
                    <h3 className="text-base text-[#1c1f17]" style={mono}>
                      {item.question}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-[#4d5145] md:text-[15px]">
                      {item.answer}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </FadeIn>
        </div>
      </article>
    </>
  );
}
