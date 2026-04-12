import type { Metadata } from "next";
import Image from "next/image";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { EarlyAccessBanner } from "@/components/landing/EarlyAccessBanner";
import { FadeIn } from "@/components/ui/FadeIn";
import { ArticleByline } from "@/components/seo/ArticleByline";
import { getSeoPageChrome } from "@/lib/seo-ia";
import { createFaqPageJsonLd, createTechArticleJsonLd } from "@/lib/schema";
import { siteConfig } from "@/lib/site";

const CDN_BASE = "https://cdn.anycap.ai/page_resource/use-case";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;
const lastUpdatedLabel = "April 7, 2026";
const lastUpdatedIso = "2026-04-07";

export const metadata: Metadata = {
  title: "AI SMART Goal Generator for Codex, Cursor, and Claude Code",
  description:
    "Use AnyCap with Codex, Cursor, or Claude Code to turn rough quarterly goals into research-backed SMART goals with citations, structured notes, and publishable output.",
  alternates: { canonical: "/learn/smart-goal-generator" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/learn/smart-goal-generator",
    siteName: siteConfig.siteName,
    title: "AI SMART Goal Generator for Codex, Cursor, and Claude Code",
    description:
      "See how AnyCap turns coding agents into a deep-research SMART goal writer through grounded search, crawl, and publish workflows.",
  },
};

const articleJsonLd = createTechArticleJsonLd({
  headline: "AI SMART Goal Generator for Codex, Cursor, and Claude Code",
  description:
    "A practical workflow for turning rough goals into better SMART goals by combining AI agents with AnyCap search, crawl, and publishing capabilities.",
  path: "/learn/smart-goal-generator",
  about: [
    "SMART goals",
    "AI agents",
    "Claude Code",
    "Cursor",
    "Codex",
    "Grounded web search",
  ],
  keywords: [
    "smart goal generator",
    "smart goal writer",
    "ai smart goal generator",
    "ai goal generator",
    "deep research smart goal writer",
  ],
  datePublished: lastUpdatedIso,
  dateModified: lastUpdatedIso,
});

const faqItems = [
  {
    question: "Is this a normal web form SMART goal generator?",
    answer:
      "No. This workflow is for people who already use an AI agent like Codex, Cursor, or Claude Code. The agent handles the writing, while AnyCap gives it grounded search, crawl, storage, and publishing capabilities.",
  },
  {
    question: "Why is this better than a generic AI goal writer?",
    answer:
      "Generic generators often produce shallow goals because they work from a short prompt alone. With AnyCap, your agent can search for real examples, crawl source pages into notes, and then write goals with better context, metrics, and constraints.",
  },
  {
    question: "What parts does AnyCap handle in this workflow?",
    answer:
      "AnyCap handles the capability layer around the agent: search, grounded search, crawl, drive, and page publishing. The agent decides how to use those capabilities to research, structure, and deliver the final SMART goals.",
  },
  {
    question: "Which agent is this best for?",
    answer:
      "The workflow fits Codex, Cursor, and Claude Code because all three can work from natural-language instructions and benefit from a stable capability runtime for web retrieval and output delivery.",
  },
];

const faqJsonLd = createFaqPageJsonLd(faqItems);

const pageChrome = getSeoPageChrome("/learn/smart-goal-generator");

const workflowSteps = [
  {
    title: "Ask your agent for the outcome",
    body: "Start with a plain-language request like a quarterly plan, role goal, or performance review objective.",
  },
  {
    title: "Use AnyCap search for examples",
    body: "Let the agent search for strong SMART goal examples, benchmarks, and role-specific success metrics before drafting anything.",
  },
  {
    title: "Crawl useful source pages into notes",
    body: "Turn the best pages into clean Markdown so the agent can compare patterns, extract language, and keep the research grounded.",
  },
  {
    title: "Write goals, KPIs, and milestones",
    body: "From there, the agent can draft SMART goals, define measurement criteria, and attach milestones and action steps.",
  },
  {
    title: "Publish or share the result",
    body: "Save templates to Drive or publish the final brief through Page so the plan is easy to review, share, and reuse.",
  },
];

const outputCards = [
  {
    title: "Founder planning",
    body: "Turn a rough Q2 growth target into a SMART goal with measurable traffic, conversion, and content production milestones.",
  },
  {
    title: "Marketing execution",
    body: "Generate role-specific goals for newsletter growth, SEO traffic, or campaign output using examples pulled from live sources.",
  },
  {
    title: "Operator workflows",
    body: "Draft goals that include realistic constraints, owners, review cadence, and team-ready action plans instead of generic platitudes.",
  },
];

const smartCriteria = [
  {
    title: "Specific",
    body: "State the outcome, the scope, and who owns it. Vague goals like 'grow content' are too loose for real execution.",
  },
  {
    title: "Measurable",
    body: "Pick one primary KPI and a small set of supporting metrics so progress is visible and reviewable every week.",
  },
  {
    title: "Achievable",
    body: "The target has to fit your team, baseline, and quarter. A goal that needs perfect conditions is not truly achievable.",
  },
  {
    title: "Relevant",
    body: "A strong goal connects to a bigger priority such as pipeline growth, activation, retention, or launch readiness.",
  },
  {
    title: "Time-bound",
    body: "A deadline alone is not enough. Good SMART goals also define milestones inside the quarter so the work does not pile up at the end.",
  },
] as const;

const researchInputs = [
  "Role-specific SMART goal examples from credible teams and operators",
  "Benchmarks for newsletter growth, content output, or campaign performance",
  "Quarterly planning templates that show how milestones and review cadence are usually structured",
  "Existing internal constraints such as headcount, channel mix, and current baseline performance",
] as const;

const sourceLinks = [
  {
    label: "Stanford SMART goals worksheet",
    href: "https://med.stanford.edu/content/dam/sm/s-spire/documents/How-to-write-SMART-Goals-v2.pdf",
  },
  {
    label: "Asana guide to SMART goals",
    href: "https://asana.com/resources/smart-goals",
  },
  {
    label: "Atlassian quarterly planning playbook",
    href: "https://www.atlassian.com/team-playbook/plays/rolling-4-quarterly-planning",
  },
] as const;

const agentCards = [
  {
    title: "Codex",
    href: "/for/codex",
    body: "Use AnyCap to give Codex grounded search, web crawl, and delivery capabilities around your planning workflow.",
  },
  {
    title: "Cursor",
    href: "/for/cursor",
    body: "Equip Cursor to research examples, compare source pages, and output a shareable SMART goal brief through one runtime.",
  },
  {
    title: "Claude Code",
    href: "/for/claude-code",
    body: "Keep Claude Code as the agent you already use and add the capability layer it needs for deep research goal writing.",
  },
];

export default function SmartGoalGeneratorPage() {
  return (
    <>
      <BreadcrumbJsonLd items={pageChrome?.breadcrumbItems} />
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
              {pageChrome?.eyebrow ?? "Learn"}
            </p>
            <ArticleByline
              className="mb-3"
              author={pageChrome?.authorLabel}
              updatedLabel={`Last updated ${lastUpdatedLabel}`}
            />
            <h1
              className="leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(32px, 6vw, 72px)" }}
            >
              Turn your agent into a
              <br />
              SMART goal generator
            </h1>
            <p className="mt-6 max-w-[780px] text-base leading-7 text-[#4d5145] md:text-lg">
              If you already work through Codex, Cursor, or Claude Code, you do not need a shallow
              web form that spits out generic goals. You need a workflow that lets your agent
              research examples, inspect source pages, and write SMART goals with better context.
              That is the role AnyCap plays.
            </p>
            <div className="mt-8 max-w-[860px] rounded-xl border border-[#d4dbb8] bg-[#f9faf5]/80 p-6">
              <p className="mb-3 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                Answer-first summary
              </p>
              <p className="text-sm leading-6 text-[#4d5145]">
                A useful SMART goal generator does not stop at rewriting your prompt. It should
                produce one clear goal statement, one primary KPI, a baseline, a target, and a
                milestone plan. AnyCap improves that workflow by giving your agent live{" "}
                <Link
                  href="/capabilities/grounded-web-search"
                  className="underline decoration-[#d4dbb8] underline-offset-2 transition-colors hover:text-[#6b7d3a] hover:decoration-[#6b7d3a]"
                >
                  grounded search
                </Link>
                ,{" "}
                <Link
                  href="/capabilities/web-crawl"
                  className="underline decoration-[#d4dbb8] underline-offset-2 transition-colors hover:text-[#6b7d3a] hover:decoration-[#6b7d3a]"
                >
                  web crawl
                </Link>
                , and publishing workflows, so the final goal can be researched, structured,
                shared, and reused.
              </p>
            </div>
          </FadeIn>

          <FadeIn className="mt-8">
            <EarlyAccessBanner />
          </FadeIn>

          <FadeIn className="mt-10">
            <div className="overflow-hidden rounded-xl border border-[#d8dcd0] bg-[#fbfcf8]">
              <Image
                src={`${CDN_BASE}/smart-goal-generator-hero-v2.png`}
                alt="Illustration of an AI agent turning messy quarterly notes into a structured SMART goal dashboard."
                width={2752}
                height={1536}
                className="h-auto w-full"
                priority
              />
            </div>
          </FadeIn>

          <FadeIn>
            <section className="mt-10 max-w-[960px] rounded-xl border border-[#d8dcd0] bg-[#1c1f17] p-6 md:p-8">
              <p className="mb-2 text-[11px] tracking-[0.8px] text-[#8fa34e]" style={mono}>
                Example workflow
              </p>
              <p className="text-[13px] leading-6 text-[#d4e0a4]" style={mono}>
                User: &quot;Write SMART goals for my Q2 content marketing plan.&quot;
              </p>
              <p className="mt-4 text-[13px] leading-6 text-[#b8cc6e]" style={mono}>
                Agent: search for role-specific examples and benchmarks
              </p>
              <p className="text-[13px] leading-6 text-[#b8cc6e]" style={mono}>
                Agent: crawl the strongest source pages into structured notes
              </p>
              <p className="text-[13px] leading-6 text-[#b8cc6e]" style={mono}>
                Agent: draft SMART goals, KPIs, milestones, and action steps
              </p>
              <p className="text-[13px] leading-6 text-[#b8cc6e]" style={mono}>
                Agent: save or publish the final brief through AnyCap
              </p>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24 max-w-[840px]">
              <h2 className="mb-6 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                Quick answer
              </h2>
              <p className="text-base leading-7 text-[#4d5145]">
                A strong SMART goal generator should do more than rewrite your prompt. It should
                help you move from a rough intention to a specific outcome, measurable KPIs,
                realistic constraints, and a deadline that fits the actual job. That is why
                generic AI goal writers often feel thin. They usually do not gather outside context
                first.
              </p>
              <p className="mt-6 text-base leading-7 text-[#4d5145]">
                With AnyCap, your agent can search, crawl, structure, and publish. The result is
                not just a nicer sentence. It is a better-researched goal brief.
              </p>
              <p className="mt-6 text-base leading-7 text-[#4d5145]">
                That distinction matters because searchers looking for a smart goal generator
                usually want more than a definition. They want something they can use in a review,
                a team brief, or a quarterly plan right away. To satisfy that intent, the output
                has to include constraints, metrics, and a realistic execution path, not just a
                polished sentence.
              </p>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-8 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                What makes a goal actually SMART
              </h2>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                {smartCriteria.map((item) => (
                  <div key={item.title} className="rounded-xl border border-[#d4dbb8] bg-[#fffffc]/70 p-5">
                    <h3 className="mb-3 text-[14px] font-bold text-[#1c1f17]" style={mono}>
                      {item.title}
                    </h3>
                    <p className="text-sm leading-6 text-[#4d5145]">{item.body}</p>
                  </div>
                ))}
              </div>
              <p className="mt-8 max-w-[820px] text-base leading-7 text-[#4d5145]">
                This framing is consistent with widely used SMART goal references from Stanford,
                Asana, and Atlassian, all of which emphasize clarity, measurement, and a defined
                timeframe rather than vague ambition alone.
              </p>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-8 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                What a deep research SMART goal writer looks like
              </h2>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                {workflowSteps.map((step) => (
                  <div key={step.title} className="rounded-xl border border-[#d4dbb8] bg-[#fffffc]/70 p-5">
                    <h3 className="mb-3 text-[14px] font-bold text-[#1c1f17]" style={mono}>
                      {step.title}
                    </h3>
                    <p className="text-sm leading-6 text-[#4d5145]">{step.body}</p>
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
                Before research vs after research
              </h2>
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-xl border border-[#d4dbb8] p-6">
                  <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                    Before
                  </p>
                  <h3 className="mb-3 text-[14px] font-bold text-[#1c1f17]" style={mono}>
                    Rough request
                  </h3>
                  <p className="text-sm leading-6 text-[#4d5145]">
                    “Grow our Q2 content program, get more newsletter subscribers, and make the
                    team more consistent.”
                  </p>
                  <p className="mt-4 text-sm leading-6 text-[#4d5145]">
                    This is directionally useful, but it has no baseline, no target, no owner
                    logic, and no milestone structure.
                  </p>
                </div>
                <div className="rounded-xl border border-[#d4dbb8] p-6">
                  <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                    After
                  </p>
                  <h3 className="mb-3 text-[14px] font-bold text-[#1c1f17]" style={mono}>
                    Research-backed SMART goal
                  </h3>
                  <p className="text-sm leading-6 text-[#4d5145]">
                    “By June 30, increase newsletter subscribers by 25% from the current baseline
                    of 8,400 to 10,500 by publishing eight high-intent SEO articles, shipping one
                    weekly newsletter, and refreshing five underperforming pages. Review progress
                    every Friday using subscriber growth, article output, and assisted signup rate.”
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
                What the agent should research before it writes
              </h2>
              <div className="max-w-[860px] rounded-xl border border-[#d4dbb8] bg-[#fffffc]/70 p-6">
                <ul className="space-y-3">
                  {researchInputs.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm leading-6 text-[#4d5145]">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#6b7d3a]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <p className="mt-6 max-w-[820px] text-base leading-7 text-[#4d5145]">
                In practice, this is where AnyCap is better aligned than a generic tool page. A
                coding agent can run the retrieval loop first, then draft the final goal. If you
                need the full setup path, the fastest entry point is still the{" "}
                <Link
                  href="/guides/install-anycap"
                  className="underline decoration-[#d4dbb8] underline-offset-2 transition-colors hover:text-[#6b7d3a] hover:decoration-[#6b7d3a]"
                >
                  install guide
                </Link>
                .
              </p>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-8 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                Better than a one-shot generator
              </h2>
              <div className="mb-8 overflow-hidden rounded-xl border border-[#d8dcd0] bg-[#fbfcf8]">
                <Image
                  src={`${CDN_BASE}/smart-goal-generator-workflow-v2.png`}
                  alt="Illustration of a deep-research workflow that turns search results and crawled notes into SMART goals, KPI checklists, and milestone timelines."
                  width={2400}
                  height={1792}
                  className="h-auto w-full"
                />
              </div>
              <div className="mb-8 rounded-xl border border-[#d4dbb8] bg-[#1c1f17] px-6 py-5 md:px-8 md:py-6">
                <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                  Example output
                </p>
                <p className="text-[13px] leading-6 text-[#d4e0a4]" style={mono}>
                  Goal: increase newsletter subscribers by 25% by June 30
                </p>
                <p className="text-[13px] leading-6 text-[#b8cc6e]" style={mono}>
                  KPI: subscribers, assisted signup rate, article output
                </p>
                <p className="text-[13px] leading-6 text-[#b8cc6e]" style={mono}>
                  Milestone 1: baseline audit and content calendar by week 2
                </p>
                <p className="text-[13px] leading-6 text-[#b8cc6e]" style={mono}>
                  Milestone 2: four articles and four newsletters by mid-quarter
                </p>
                <p className="text-[13px] leading-6 text-[#b8cc6e]" style={mono}>
                  Milestone 3: refresh five legacy pages before quarter end
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {outputCards.map((card) => (
                  <div key={card.title} className="rounded-xl border border-[#d4dbb8] p-6">
                    <h3 className="mb-3 text-[14px] font-bold text-[#1c1f17]" style={mono}>
                      {card.title}
                    </h3>
                    <p className="text-sm leading-6 text-[#4d5145]">{card.body}</p>
                  </div>
                ))}
              </div>
              <p className="mt-8 max-w-[820px] text-base leading-7 text-[#4d5145]">
                This is the real difference between a one-shot generator and a deep-research
                workflow. The goal is no longer isolated from the work. It is connected to
                measurable progress, realistic sequencing, and a shareable artifact your team can
                actually review.
              </p>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-8 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                Use it with the agent you already have
              </h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {agentCards.map((card) => (
                  <Link
                    key={card.href}
                    href={card.href}
                    className="rounded-xl border border-[#d4dbb8] bg-[#fffffc]/70 p-6 transition-colors hover:border-[#6b7d3a]"
                  >
                    <h3 className="mb-3 text-[14px] font-bold text-[#1c1f17]" style={mono}>
                      {card.title}
                    </h3>
                    <p className="text-sm leading-6 text-[#4d5145]">{card.body}</p>
                  </Link>
                ))}
              </div>
              <p className="mt-8 max-w-[820px] text-base leading-7 text-[#4d5145]">
                If your workflow already lives inside one of those tools, the product fit is
                stronger than using a disconnected generator page. Your agent can keep the context
                of the repo, the planning document, the campaign brief, and the retrieval loop in
                one working surface.
              </p>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24 max-w-[860px]">
              <h2 className="mb-8 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                Sources and further reading
              </h2>
              <div className="space-y-3 rounded-xl border border-[#d4dbb8] bg-[#fffffc]/70 p-6">
                {sourceLinks.map((source) => (
                  <p key={source.href} className="text-sm leading-6 text-[#4d5145]">
                    <a
                      href={source.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline decoration-[#d4dbb8] underline-offset-2 transition-colors hover:text-[#6b7d3a] hover:decoration-[#6b7d3a]"
                    >
                      {source.label}
                    </a>
                  </p>
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
                Role-specific SMART goal examples
              </h2>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-[#d4dbb8] p-6">
                  <h3 className="mb-3 text-[14px] font-bold text-[#1c1f17]" style={mono}>
                    Founder
                  </h3>
                  <p className="text-sm leading-6 text-[#4d5145]">
                    A founder usually needs goals tied to growth, revenue, activation, or launch
                    readiness. The agent should research market benchmarks first so the target is
                    ambitious without becoming fantasy planning.
                  </p>
                </div>
                <div className="rounded-xl border border-[#d4dbb8] p-6">
                  <h3 className="mb-3 text-[14px] font-bold text-[#1c1f17]" style={mono}>
                    Marketer
                  </h3>
                  <p className="text-sm leading-6 text-[#4d5145]">
                    A marketer often needs one goal tied to output and another tied to outcome. A
                    good SMART goal should separate activity metrics from business KPIs instead of
                    mashing everything into one vanity target.
                  </p>
                </div>
                <div className="rounded-xl border border-[#d4dbb8] p-6">
                  <h3 className="mb-3 text-[14px] font-bold text-[#1c1f17]" style={mono}>
                    Operator
                  </h3>
                  <p className="text-sm leading-6 text-[#4d5145]">
                    Operators need milestones, owners, and review cadence. That is where a deep
                    research workflow matters most, because implementation details are often more
                    important than the headline metric.
                  </p>
                </div>
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24 max-w-[860px]">
              <h2 className="mb-8 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                When this workflow is a better fit than a generic tool
              </h2>
              <p className="text-base leading-7 text-[#4d5145]">
                If you want a fast sentence and nothing more, a generic generator may be enough.
                But if you need a goal that survives contact with reality, the better path is to
                let an agent gather context first. That is especially true when the goal needs to
                align with a quarter plan, a team baseline, or an existing content strategy.
              </p>
              <p className="mt-6 text-base leading-7 text-[#4d5145]">
                This page is therefore best for users who already work in agent-first tools and
                want a repeatable planning workflow rather than a disposable prompt toy. In that
                context, AnyCap is not replacing the agent. It is making the agent more useful by
                adding the retrieval and delivery layer around the writing step.
              </p>
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
              <div className="max-w-[860px] space-y-6">
                {faqItems.map((item) => (
                  <div key={item.question} className="rounded-xl border border-[#d4dbb8] p-5">
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
            <section className="mt-16 mb-8 md:mt-24">
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/capabilities/grounded-web-search"
                  className="inline-block rounded-lg bg-[#6b7d3a] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#f4f5f0] transition-colors hover:bg-[#1c1f17]"
                  style={mono}
                >
                  Grounded Web Search
                </Link>
                <Link
                  href="/capabilities/web-crawl"
                  className="inline-block rounded-lg border border-[#1c1f17] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] transition-colors hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
                  style={mono}
                >
                  Web Crawl
                </Link>
                <Link
                  href="/capabilities/drive"
                  className="inline-block rounded-lg border border-[#1c1f17] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] transition-colors hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
                  style={mono}
                >
                  Drive
                </Link>
                <Link
                  href="/start"
                  className="inline-block rounded-lg border border-[#1c1f17] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] transition-colors hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
                  style={mono}
                >
                  Get Started
                </Link>
              </div>
            </section>
          </FadeIn>
        </div>
      </article>
    </>
  );
}
