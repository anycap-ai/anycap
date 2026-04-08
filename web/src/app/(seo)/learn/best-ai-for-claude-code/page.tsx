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
  title: "Best AI for Claude Code: the right setup is usually Claude Code plus capabilities",
  description:
    "The best AI for Claude Code is usually the setup that keeps Claude Code's terminal-native workflow intact while adding the image, video, and vision capabilities it lacks.",
  alternates: { canonical: "/learn/best-ai-for-claude-code" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/learn/best-ai-for-claude-code",
    siteName: siteConfig.siteName,
    title: "Best AI for Claude Code: the right setup is usually Claude Code plus capabilities",
    description:
      "A buyer guide for teams deciding whether the best Claude Code setup is Claude Code alone, Claude Code plus ad hoc tools, or Claude Code plus one capability runtime.",
  },
};

const articleJsonLd = createTechArticleJsonLd({
  headline: "Best AI for Claude Code: the right setup is usually Claude Code plus capabilities",
  description:
    "A buyer guide for teams deciding whether the best Claude Code setup is Claude Code alone, Claude Code plus ad hoc tools, or Claude Code plus one capability runtime.",
  path: "/learn/best-ai-for-claude-code",
  about: [
    "Claude Code",
    "Coding agents",
    "AI capabilities",
    "Image generation",
    "Video generation",
    "Agent capability runtime",
  ],
  keywords: [
    "best ai for claude code",
    "best ai tools for claude code",
    "claude code capabilities",
    "add tools to claude code",
    "claude code terminal workflow",
  ],
  datePublished: lastUpdatedIso,
  dateModified: lastUpdatedIso,
});

const quickTakeaways = [
  "Claude Code already covers the core terminal loop for planning, editing, shell execution, and repo work.",
  "The first real breakpoint is usually not coding quality. It is when the workflow must produce or inspect images, video, screenshots, or recordings.",
  "For most teams, the best move is to keep Claude Code and add one capability runtime instead of replacing the agent.",
] as const;

const evaluationCards = [
  {
    title: "How terminal-native the work still is",
    body: "If the workflow is mostly code planning, diffing, debugging, test fixing, and shell execution, the core question is whether Claude Code is already strong enough for your team. Often it is.",
  },
  {
    title: "How often visual inputs show up",
    body: "The shape changes when software work starts from screenshots, diagrams, recordings, or visual QA evidence. That is where the best AI for Claude Code stops being only a model question.",
  },
  {
    title: "How often the result must leave the terminal",
    body: "A stack that only edits code is not enough when the final result must become an artifact a human can review, share, publish, or hand to another team.",
  },
  {
    title: "How much setup sprawl you can tolerate",
    body: "The best theoretical stack is not always the best practical stack. Separate providers, credentials, and helper scripts can turn into a maintenance burden around Claude Code very quickly.",
  },
] as const;

const stackCards = [
  {
    title: "Claude Code only",
    label: "Best when the work stays terminal-native",
    body: "This is the simplest path when the work stays close to code, tests, logs, files, and shell commands. The value comes from strong reasoning inside the terminal-driven coding loop.",
  },
  {
    title: "Claude Code plus ad hoc provider scripts",
    label: "Works, but operational debt grows",
    body: "You can bolt on an image API here, a video API there, and a visual analysis script later. The problem is that the workflow starts to fragment across keys, providers, and setup surfaces.",
  },
  {
    title: "Claude Code plus a capability runtime",
    label: "Best when the terminal needs outside capabilities",
    body: "This is the setup AnyCap is built for. You keep Claude Code for code, planning, and terminal execution, then add image generation, video generation, image understanding, and video analysis through one runtime.",
  },
] as const;

const capabilityCards = [
  {
    title: "Claude Code image generation",
    href: "/for/claude-code/image-generation",
    body: "Use this path when Claude Code needs to produce visuals, product mockups, or launch assets instead of only describing them.",
  },
  {
    title: "Claude Code video generation",
    href: "/for/claude-code/video-generation",
    body: "Use this path when the workflow needs demos, walkthroughs, or short motion assets inside the same agent setup.",
  },
  {
    title: "Image understanding",
    href: "/capabilities/image-understanding",
    body: "Use this when Claude Code needs to inspect screenshots, diagrams, references, or visual QA inputs.",
  },
  {
    title: "Video analysis",
    href: "/capabilities/video-analysis",
    body: "Use this when the bug, product issue, or workflow evidence lives in a recording rather than a text log.",
  },
] as const;

const decisionRows = [
  {
    question: "When is Claude Code already enough on its own?",
    answer:
      "Claude Code is often enough when the workflow stays inside the codebase and the main job is reasoning, editing, testing, and terminal execution.",
  },
  {
    question: "When do I need more than Claude Code?",
    answer:
      "You need more than Claude Code when the task requires image output, video output, screenshot interpretation, visual QA, recording analysis, or a result that needs to leave the terminal as an artifact.",
  },
  {
    question: "Should I replace Claude Code or extend it?",
    answer:
      "Usually extend it. For many teams, the better move is to keep Claude Code and add the capabilities it does not ship with rather than introducing a new agent surface and retraining the workflow.",
  },
  {
    question: "What is the fastest way to test the better setup?",
    answer:
      "Start with the Add Tools to Claude Code guide or jump straight into Claude Code image generation or video generation. That lets you test the capability gap without changing your core agent.",
  },
] as const;

const nextMoveCards = [
  {
    title: "Add tools to Claude Code",
    href: "/guides/add-tools-to-claude-code",
    body: "Use this when you are ready to test the shorter setup path instead of reading another explainer.",
  },
  {
    title: "Start with image generation",
    href: "/for/claude-code/image-generation",
    body: "Best next move when the first missing output is visuals, concept images, or product mockups.",
  },
  {
    title: "Start with video generation",
    href: "/for/claude-code/video-generation",
    body: "Best next move when the first missing output is a demo clip, walkthrough, or motion asset.",
  },
  {
    title: "See the Claude Code hub",
    href: "/for/claude-code",
    body: "Move here when you want the primary Claude Code landing page instead of a Learn-style buyer guide.",
  },
] as const;

const faqItems = [
  {
    question: "What is the best AI for Claude Code right now?",
    answer:
      "If you mean terminal-native coding work, Claude Code may already be the right foundation. If you mean the full workflow around coding, the best setup is often Claude Code plus the capabilities it still lacks.",
  },
  {
    question: "Is the best AI for Claude Code always a different model?",
    answer:
      "Not always. Sometimes the bigger gain comes from adding media and vision capabilities around Claude Code rather than changing the core agent itself.",
  },
  {
    question: "What usually breaks first in a Claude Code workflow?",
    answer:
      "The first breakpoint is usually not reasoning quality. It is when the workflow must inspect screenshots, analyze recordings, or generate images and video that Claude Code does not provide as a built-in runtime.",
  },
  {
    question: "Does AnyCap replace Claude Code?",
    answer:
      "No. AnyCap extends Claude Code. Its role is to add image generation, video generation, image understanding, and video analysis around the agent you already use.",
  },
  {
    question: "What is the fastest way to try Claude Code plus capabilities?",
    answer:
      "Start with the Add Tools to Claude Code guide, then test one concrete path like Claude Code image generation or Claude Code video generation. That gives you a real workflow check without switching agents.",
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

export default function BestAIForClaudeCodePage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Learn", href: "/learn", unlinkable: true },
          { name: "Best AI for Claude Code" },
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
              Claude Code
            </h1>
            <p className="mt-6 max-w-[820px] text-base leading-7 text-[#4d5145] md:text-lg">
              The best AI for Claude Code is usually not a question about replacing Claude Code at
              all. It is a question about whether your workflow still fits a terminal-native loop or
              whether the job has started to depend on screenshots, recordings, media output, and
              artifacts that Claude Code does not provide on its own.
            </p>
          </FadeIn>

          <FadeIn className="mt-10">
            <section className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.9fr)]">
              <div className="rounded-[28px] border border-[#d4dbb8] bg-[#fffffc]/80 p-8 md:p-10">
                <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                  Quick answer
                </p>
                <h2 className="mt-4 text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                  The best Claude Code setup usually keeps Claude Code as the terminal-native core.
                </h2>
                <p className="mt-5 max-w-[720px] text-sm leading-6 text-[#4d5145] md:text-[15px]">
                  This keeps the reasoning and coding loop intact while expanding what the workflow
                  can actually finish. For many teams, that is more practical than introducing a new
                  agent surface just because the task briefly leaves the terminal and becomes
                  multimodal.
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
                Start by asking whether the workflow still fits a terminal-native loop
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
                Three setup patterns
              </p>
              <h2 className="mt-3 max-w-[820px] text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                Most teams evaluating Claude Code are really choosing how much to extend the terminal
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
                First capabilities to add
              </p>
              <h2 className="mt-3 max-w-[820px] text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                These are usually the first gaps that appear after pure repo work
              </h2>
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
                How to decide
              </p>
              <h2 className="mt-3 max-w-[820px] text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                Ask these questions before replacing a workflow you already like
              </h2>
              <div className="mt-8 space-y-4">
                {decisionRows.map((row) => (
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
                Move from this buyer guide into the exact Claude Code path you need
              </h2>
              <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
