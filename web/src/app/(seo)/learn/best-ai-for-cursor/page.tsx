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
  title: "Best AI for Cursor: the right setup is usually Cursor plus capabilities",
  description:
    "The best AI for Cursor is usually the setup that keeps Cursor's editor-native workflow intact while adding the visual, video, and model-choice layer it lacks.",
  alternates: { canonical: "/learn/best-ai-for-cursor" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/learn/best-ai-for-cursor",
    siteName: siteConfig.siteName,
    title: "Best AI for Cursor: the right setup is usually Cursor plus capabilities",
    description:
      "A buyer guide for teams deciding whether the best Cursor setup is Cursor alone, Cursor plus scattered provider tabs, or Cursor plus one capability runtime with model choice.",
  },
};

const articleJsonLd = createTechArticleJsonLd({
  headline: "Best AI for Cursor: the right setup is usually Cursor plus capabilities",
  description:
    "A buyer guide for teams deciding whether the best Cursor setup is Cursor alone, Cursor plus scattered provider tabs, or Cursor plus one capability runtime with model choice.",
  path: "/learn/best-ai-for-cursor",
  about: [
    "Cursor",
    "Coding agents",
    "AI capabilities",
    "Image generation",
    "Video generation",
    "Agent capability runtime",
  ],
  keywords: [
    "best ai for cursor",
    "best ai tools for cursor",
    "cursor capabilities",
    "cursor visual workflow",
    "cursor mockup generation",
  ],
  datePublished: lastUpdatedIso,
  dateModified: lastUpdatedIso,
});

const quickTakeaways = [
  "Cursor is already strong when the work stays inside the edit-run-review loop.",
  "The first breakpoint usually shows up in visual product work: mockups, screenshots, demos, and recordings.",
  "For Cursor users, the next decision is often which capability or model to add, not which new agent to adopt.",
] as const;

const evaluationCards = [
  {
    title: "How much of the work stays in the editor",
    body: "When the job is mostly code navigation, edits, diffs, debugging, and local execution, the main question is whether Cursor already gives your team the right coding loop. Often it does.",
  },
  {
    title: "How visual the workflow has become",
    body: "The answer changes when the work needs product mockups, launch visuals, demo clips, screenshot inspection, or recording analysis. At that point, the best AI for Cursor is not only a coding-model question.",
  },
  {
    title: "How often the output becomes a shareable artifact",
    body: "A stack that only edits code is not enough when the result must turn into an artifact a teammate or stakeholder can review, share, or publish.",
  },
  {
    title: "How much model choice and tooling control matters",
    body: "The best practical setup is often the one that avoids provider sprawl while still giving you the right image and video model for the task. Separate services can turn into integration debt around Cursor surprisingly fast.",
  },
] as const;

const stackCards = [
  {
    title: "Cursor only",
    label: "Best when code and local execution are the job",
    body: "This is the simplest path when the workflow stays inside repository work, local execution, and code iteration. The value comes from the coding environment itself, not from external media or analysis tasks.",
  },
  {
    title: "Cursor plus scattered provider tabs",
    label: "Works, but the workflow leaves the editor",
    body: "You can wire image, video, and analysis providers separately, but each added task increases credential sprawl, prompt drift, and maintenance around the editor workflow.",
  },
  {
    title: "Cursor plus a capability runtime",
    label: "Best when the workflow becomes visual or multimedia",
    body: "This is where AnyCap fits. You keep Cursor for code, editing, and integrated-terminal workflows, then add image generation, video generation, image understanding, and video analysis through one runtime.",
  },
] as const;

const capabilityCards = [
  {
    title: "Launch visuals and mockups",
    href: "/capabilities/image-generation",
    body: "Use this path when Cursor needs polished product visuals, landing-page concepts, or mockups instead of only describing what a designer should make.",
  },
  {
    title: "Demo clips and walkthroughs",
    href: "/capabilities/video-generation",
    body: "Use this path when the workflow needs demos, walkthroughs, or short motion assets from the same editor-centered process.",
  },
  {
    title: "Screenshot debugging and visual QA",
    href: "/capabilities/image-understanding",
    body: "Use this when Cursor needs to interpret screenshots, diagrams, OCR inputs, or visual QA evidence inside the same debugging loop.",
  },
  {
    title: "Recording review and issue analysis",
    href: "/capabilities/video-analysis",
    body: "Use this when the bug, usability issue, or workflow evidence lives in a recording rather than a text log.",
  },
] as const;

const modelCards = [
  {
    title: "Seedream 5",
    href: "/models/seedream-5",
    body: "Best first-pass image model when Cursor needs polished mockups, launch visuals, or cleaner visual concepts.",
  },
  {
    title: "Nano Banana 2",
    href: "/models/nano-banana-2",
    body: "Best when Cursor needs faster iteration across many visual variants and lighter-weight creative loops.",
  },
  {
    title: "Veo 3.1",
    href: "/models/veo-3-1",
    body: "Best premium video model for Cursor when the workflow needs polished demo clips or cinematic motion output.",
  },
  {
    title: "Kling 3.0",
    href: "/models/kling-3-0",
    body: "Best when the motion needs to feel more stylized or cinematic than a standard product walkthrough.",
  },
] as const;

const decisionRows = [
  {
    question: "When is Cursor already enough on its own?",
    answer:
      "Cursor is often enough when the workflow stays centered on code, terminal execution, and local repo reasoning. In that case, the main value is inside the editor and coding loop.",
  },
  {
    question: "When should I add capabilities instead of switching environments?",
    answer:
      "Add capabilities when the work needs image output, video output, screenshot interpretation, visual QA, or recording analysis. Those are capability-layer problems, not reasons to abandon the editor loop entirely.",
  },
  {
    question: "When does model choice inside the capability layer matter?",
    answer:
      "Model choice matters once the workflow becomes visual. At that point, you may want one image model for polished mockups, another for fast iteration, and a separate video model for demos or walkthroughs.",
  },
  {
    question: "Should I replace Cursor to solve that gap?",
    answer:
      "Usually not. For many teams, the better move is to keep Cursor and add the capabilities it does not ship with instead of introducing a new agent surface and retraining the workflow.",
  },
] as const;

const nextMoveCards = [
  {
    title: "See the Cursor hub",
    href: "/for/cursor",
    body: "Move here when you want the primary Cursor landing page instead of a Learn-style evaluation guide.",
  },
  {
    title: "Start with screenshot understanding",
    href: "/capabilities/image-understanding",
    body: "Best next move when the first broken workflow is screenshot debugging, visual QA, or design feedback.",
  },
  {
    title: "Compare image models",
    href: "/models/seedream-5",
    body: "Best next move when the real question is which image model fits Cursor mockups and launch visuals.",
  },
  {
    title: "Compare video models",
    href: "/models/veo-3-1",
    body: "Best next move when the real question is which video model fits demos, walkthroughs, or cinematic product motion.",
  },
  {
    title: "What is the most advanced AI?",
    href: "/learn/what-is-the-most-advanced-ai",
    body: "Go here when the question is about the frontier overall, not just Cursor specifically.",
  },
  {
    title: "Install the runtime",
    href: "/guides/install-anycap",
    body: "Use the install guide when you are ready to move from evaluation into actual setup steps.",
  },
] as const;

const faqItems = [
  {
    question: "What is the best AI for Cursor right now?",
    answer:
      "If you mean core coding work, Cursor may already be the right foundation for your team. If you mean the full workflow around coding, the best setup is often Cursor plus the capabilities and model options it still lacks.",
  },
  {
    question: "Is the best AI for Cursor always a different model?",
    answer:
      "Not always. Sometimes the bigger gain comes from adding media and vision capabilities around Cursor rather than changing the core coding environment itself.",
  },
  {
    question: "What usually breaks first around Cursor?",
    answer:
      "The first breakpoint is usually visual product work: mockups, launch visuals, screenshot debugging, demos, or recording analysis. Those are the tasks that pull the workflow beyond what Cursor provides by itself.",
  },
  {
    question: "Which model should I add first for Cursor?",
    answer:
      "If the work starts with polished visuals, start with Seedream 5. If you need faster visual iteration, start with Nano Banana 2. If the work starts with product demos or motion, look at Veo 3.1 or Kling 3.0 first.",
  },
  {
    question: "Does AnyCap replace Cursor?",
    answer:
      "No. AnyCap extends Cursor. Its role is to add image generation, video generation, image understanding, and video analysis around the coding environment you already use.",
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

export default function BestAIForCursorPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Learn", href: "/learn", unlinkable: true },
          { name: "Best AI for Cursor" },
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
              Cursor
            </h1>
            <p className="mt-6 max-w-[820px] text-base leading-7 text-[#4d5145] md:text-lg">
              The best AI for Cursor is usually not a question about leaving Cursor. It is a
              question about whether the editor-native workflow is still enough or whether the work
              has become visual, shareable, and model-sensitive in ways that require a capability
              layer around the editor.
            </p>
          </FadeIn>

          <FadeIn className="mt-10">
            <section className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.9fr)]">
              <div className="rounded-[28px] border border-[#d4dbb8] bg-[#fffffc]/80 p-8 md:p-10">
                <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                  Quick answer
                </p>
                <h2 className="mt-4 text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                  The best Cursor setup usually keeps Cursor as the editor-native core and adds the
                  missing visual layer around it.
                </h2>
                <p className="mt-5 max-w-[720px] text-sm leading-6 text-[#4d5145] md:text-[15px]">
                  This keeps the coding loop intact while expanding what the workflow can actually
                  finish. For many teams, that is more useful than changing the core environment
                  just because the task briefly leaves the editor and becomes visual or multimodal.
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
                Start by asking how much of the work still fits the editor loop
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
                Most teams evaluating Cursor are really choosing how far the editor loop can stretch
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
                First workflows to add
              </p>
              <h2 className="mt-3 max-w-[820px] text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                These are usually the first visual workflows that appear around Cursor
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
                Model choices
              </p>
              <h2 className="mt-3 max-w-[820px] text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                If you are keeping Cursor, the next question is often which model fits the workflow
              </h2>
              <p className="mt-5 max-w-[820px] text-sm leading-6 text-[#4d5145] md:text-[15px]">
                Cursor users often hit a second decision after adding capabilities: which image or
                video model actually fits the work. That is a different problem from choosing the
                editor itself.
              </p>
              <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {modelCards.map((card) => (
                  <Link
                    key={card.href}
                    href={card.href}
                    className="rounded-[24px] border border-[#d4dbb8] bg-[#f7f8ef]/70 p-6 transition-colors hover:border-[#6b7d3a]"
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
                Ask these questions before rebuilding a workflow Cursor already handles well
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
                Move from this buyer guide into the most relevant Cursor workflow or model page
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
