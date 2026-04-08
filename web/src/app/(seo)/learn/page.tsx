import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { FadeIn } from "@/components/ui/FadeIn";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { createFaqPageJsonLd } from "@/lib/schema";
import { siteConfig } from "@/lib/site";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

export const metadata: Metadata = {
  title: "Learn - choose the right agent guide, architecture explainer, or workflow example",
  description:
    "Start with buyer guides for coding-agent stacks, SaaS assistant architecture explainers, capability-gap primers, and workflow examples that lead into AnyCap capabilities.",
  alternates: { canonical: "/learn" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/learn",
    siteName: siteConfig.siteName,
    title: "Learn - choose the right agent guide, architecture explainer, or workflow example",
    description:
      "Use Learn when you are choosing a coding-agent stack, designing a SaaS assistant, mapping capability gaps, or looking for a real workflow example.",
  },
};

const featuredArticle = {
  label: "Featured buyer guide",
  title: "Best AI for Coding Agents: choose the right model and capability stack",
  href: "/learn/best-ai-for-coding-agents",
  description:
    "Use this as the category guide when you are comparing coding-agent setups before you drill into Claude Code, Cursor, and capability-layer decisions.",
  updated: "Updated Apr 7, 2026",
  cta: "Start with the category guide",
  tags: ["Coding agents", "Decision guide", "Capabilities"],
} as const;

const learnArticles = [
  {
    title: "Best AI for Coding Agents: choose the right model and capability stack",
    href: "/learn/best-ai-for-coding-agents",
    description:
      "A category guide for teams deciding whether the real question is model quality, platform fit, or the capability layer around a coding agent.",
    label: "Buyer guide",
    updated: "Apr 7, 2026",
    tags: ["Coding agents", "AI models", "Capabilities"],
  },
  {
    title: "Best AI for Claude Code: the right setup is usually Claude Code plus capabilities",
    href: "/learn/best-ai-for-claude-code",
    description:
      "A Claude Code specific buyer guide for teams deciding when pure repo work is enough and when capability gaps start to matter.",
    label: "Buyer guide",
    updated: "Apr 7, 2026",
    tags: ["Claude Code", "Capabilities", "Agent workflow"],
  },
  {
    title: "Best AI for Cursor: the right setup is usually Cursor plus capabilities",
    href: "/learn/best-ai-for-cursor",
    description:
      "A Cursor specific buyer guide for teams deciding when the editor loop is enough and when they need image, video, or vision workflows around it.",
    label: "Buyer guide",
    updated: "Apr 7, 2026",
    tags: ["Cursor", "Capabilities", "Agent workflow"],
  },
  {
    title: "AI Chatbot SaaS vs AI Agent for SaaS: when a chatbot stops being enough",
    href: "/learn/ai-chatbot-vs-ai-agent-for-saas",
    description:
      "A practical architecture guide for SaaS teams deciding when a chatbot is enough and when the workflow really needs an agent plus a capability layer.",
    label: "Explainer",
    updated: "Apr 7, 2026",
    tags: ["AI chatbot", "SaaS", "Capabilities"],
  },
  {
    title: "How to add multimodal capabilities to a SaaS chatbot",
    href: "/learn/add-multimodal-capabilities-to-saas-chatbot",
    description:
      "A practical implementation guide for extending a SaaS chatbot with image, video, web, and delivery workflows without rebuilding the whole stack.",
    label: "Implementation",
    updated: "Apr 7, 2026",
    tags: ["Multimodal", "SaaS", "Implementation"],
  },
  {
    title: "What AI agents can't do out of the box - and how to add capabilities",
    href: "/learn/what-agents-cant-do",
    description:
      "Map the recurring gaps in modern coding agents and connect each missing capability to the shortest AnyCap path.",
    label: "Foundations",
    updated: "Evergreen",
    tags: ["AI agents", "Capabilities", "Strategy"],
  },
  {
    title: "What Is the Most Advanced AI? Why the real answer is not one model",
    href: "/learn/what-is-the-most-advanced-ai",
    description:
      "A broad explainer on when advanced AI is really a model question and when it becomes a system and capability question.",
    label: "Explainer",
    updated: "Apr 7, 2026",
    tags: ["AI models", "Agent strategy", "Capabilities"],
  },
  {
    title: "AI SMART Goal Generator for Codex, Cursor, and Claude Code",
    href: "/learn/smart-goal-generator",
    description:
      "Turn rough quarterly goals into research-backed SMART goals with citations, structured notes, and publishable output.",
    label: "Workflow",
    updated: "Apr 7, 2026",
    tags: ["Deep research", "Planning", "Agent workflow"],
  },
] as const;

const startingPoints = [
  {
    title: "Choosing a coding-agent stack",
    href: "/learn/best-ai-for-coding-agents",
    description:
      "Start here if you are comparing broad setup options before you narrow into Claude Code, Cursor, or another agent surface.",
  },
  {
    title: "Designing a SaaS assistant",
    href: "/learn/ai-chatbot-vs-ai-agent-for-saas",
    description:
      "Start here if your product began as chat and now needs tools, media workflows, or richer output delivery.",
  },
  {
    title: "Finding the missing capability",
    href: "/learn/what-agents-cant-do",
    description:
      "Start here if the agent mostly works already but breaks on screenshots, recordings, generation, or delivery.",
  },
  {
    title: "Seeing a real workflow example",
    href: "/learn/smart-goal-generator",
    description:
      "Start here if you want one concrete example of AnyCap making an agent more useful on a real task.",
  },
] as const;

const topicClusters = [
  {
    title: "Buyer guides for agent stacks",
    description:
      "Start here when the real question is how to choose a coding-agent setup before you narrow into a specific platform.",
    links: [
      { label: "Best AI for Coding Agents", href: "/learn/best-ai-for-coding-agents" },
      { label: "Best AI for Claude Code", href: "/learn/best-ai-for-claude-code" },
      { label: "Best AI for Cursor", href: "/learn/best-ai-for-cursor" },
    ],
  },
  {
    title: "SaaS assistant architecture",
    description:
      "Start here when a SaaS chatbot or copilot has to move from answering in chat to inspecting, generating, and delivering outputs.",
    links: [
      { label: "AI Chatbot SaaS vs AI Agent", href: "/learn/ai-chatbot-vs-ai-agent-for-saas" },
      {
        label: "Add Multimodal Capabilities to a SaaS Chatbot",
        href: "/learn/add-multimodal-capabilities-to-saas-chatbot",
      },
      { label: "Agent Capability Runtime", href: "/glossary/agent-capability-runtime" },
    ],
  },
  {
    title: "Foundations and capability gaps",
    description:
      "Start here when you need the broad explanation for where model comparisons stop being enough and capability gaps begin.",
    links: [
      { label: "What Is the Most Advanced AI?", href: "/learn/what-is-the-most-advanced-ai" },
      { label: "What Agents Can't Do", href: "/learn/what-agents-cant-do" },
      { label: "Agent Harness", href: "/glossary/agent-harness" },
    ],
  },
  {
    title: "Research-backed workflows",
    description:
      "Start here when you want a concrete workflow example instead of another abstract page about architecture or tooling.",
    links: [
      { label: "SMART Goal Generator", href: "/learn/smart-goal-generator" },
      { label: "Web Search capability", href: "/capabilities/web-search" },
      { label: "Install AnyCap", href: "/guides/install-anycap" },
    ],
  },
] as const;

const adjacentHubs = [
  {
    title: "Guides",
    href: "/guides",
    description: "Use Guides when you already know what you want to set up and need step-by-step implementation.",
  },
  {
    title: "Glossary",
    href: "/glossary",
    description: "Use Glossary when the main blocker is vocabulary and you need shared language for harnesses, context, and runtimes.",
  },
  {
    title: "Capabilities",
    href: "/capabilities",
    description: "Use Capabilities when you are past the explainer stage and want the exact product surfaces AnyCap adds.",
  },
  {
    title: "Compare",
    href: "/compare",
    description: "Use Compare when the question starts from an alternative vendor, adjacent product, or replacement decision.",
  },
] as const;

const faqItems = [
  {
    question: "Which page should I start with if I am choosing a coding-agent setup?",
    answer:
      "Start with Best AI for Coding Agents if you are still framing the category question. From there, move into the Claude Code or Cursor specific page once you know which workflow you care about.",
  },
  {
    question: "What if I am building a SaaS assistant instead of using a coding agent?",
    answer:
      "Start with AI Chatbot SaaS vs AI Agent for SaaS if you are deciding what kind of system you need. Then move into Add Multimodal Capabilities to a SaaS Chatbot when the question becomes implementation.",
  },
  {
    question: "When should I move from Learn into Guides or Capabilities?",
    answer:
      "Move into Guides when you are ready to set something up step by step. Move into Capabilities when you already understand the problem and want the exact surface, such as image generation, video analysis, or web crawl.",
  },
] as const;

const faqJsonLd = createFaqPageJsonLd(faqItems);

const collectionJsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "AnyCap Learn",
  description:
    "Learn hub for choosing coding-agent setups, understanding SaaS assistant architecture, mapping capability gaps, and seeing real workflow examples.",
  url: `${siteConfig.url}/learn`,
  hasPart: learnArticles.map((article) => ({
    "@type": "TechArticle",
    headline: article.title,
    description: article.description,
    url: `${siteConfig.url}${article.href}`,
  })),
} as const;

const itemListJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  itemListElement: learnArticles.map((article, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: article.title,
    url: `${siteConfig.url}${article.href}`,
  })),
} as const;

function TagPills({ tags }: { tags: readonly string[] }) {
  return (
    <div className="mt-6 flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span
          key={tag}
          className="rounded-full border border-[#d4dbb8] bg-[#f7f8ef] px-3 py-1 text-[11px] tracking-[0.4px] text-[#4d5145]"
          style={mono}
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

export default function LearnIndexPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Home", href: "/" }, { name: "Learn" }]} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
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
            <h1
              className="leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(32px, 6vw, 72px)" }}
            >
              Start with the question
              <br />
              you are actually asking
            </h1>
            <p className="mt-6 max-w-[820px] text-base leading-7 text-[#4d5145] md:text-lg">
              Use Learn when you are choosing a coding-agent stack, figuring out whether a SaaS
              assistant needs agent architecture, mapping capability gaps, or looking for a real
              workflow example. Each path is designed to move you from explanation into the next
              step: agent-specific guides, capability pages, or setup documentation.
            </p>
          </FadeIn>

          <FadeIn className="mt-10">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.95fr)]">
              <Link
                href={featuredArticle.href}
                className="rounded-[28px] border border-[#d4dbb8] bg-[#fffffc]/80 p-8 transition-colors hover:border-[#6b7d3a] md:p-10"
              >
                <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                  {featuredArticle.label}
                </p>
                <h2
                  className="mt-4 max-w-[720px] leading-[1.08] tracking-[-0.02em] text-[#1c1f17]"
                  style={{ ...pixel, fontSize: "clamp(26px, 4vw, 48px)" }}
                >
                  {featuredArticle.title}
                </h2>
                <p className="mt-5 max-w-[700px] text-base leading-7 text-[#4d5145] md:text-lg">
                  {featuredArticle.description}
                </p>
                <TagPills tags={featuredArticle.tags} />
                <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[#4d5145]">
                  <span>{featuredArticle.updated}</span>
                  <span className="text-[#6b7d3a]" style={mono}>
                    {featuredArticle.cta}
                  </span>
                </div>
              </Link>

              <div className="rounded-[28px] border border-[#d4dbb8] bg-[#f7f8ef]/80 p-6 md:p-8">
                <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                  Choose your starting point
                </p>
                <h2 className="mt-4 text-[22px] leading-8 text-[#1c1f17]" style={pixel}>
                  Four common ways people enter Learn
                </h2>
                <p className="mt-4 text-sm leading-6 text-[#4d5145] md:text-[15px]">
                  You do not need to read this hub linearly. Pick the shortest path that matches
                  your question, then move into the narrower page when you are ready.
                </p>
                <div className="mt-8 space-y-3">
                  {startingPoints.map((entry) => (
                    <Link
                      key={entry.href}
                      href={entry.href}
                      className="block rounded-2xl border border-[#d4dbb8] bg-[#fffffc]/70 p-4 transition-colors hover:border-[#6b7d3a]"
                    >
                      <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                        Start here if you are
                      </p>
                      <h3 className="mt-2 text-base text-[#1c1f17]" style={mono}>
                        {entry.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-[#4d5145]">{entry.description}</p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div className="max-w-[760px]">
                  <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                    Latest from Learn
                  </p>
                  <h2 className="mt-3 text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                    Browse the full set when you want to see every path
                  </h2>
                </div>
                <Link
                  href="/guides"
                  className="text-sm text-[#6b7d3a] underline decoration-[#a7b57b] underline-offset-4"
                  style={mono}
                >
                  Already know you need setup steps? Browse Guides
                </Link>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-2">
                {learnArticles.map((article) => (
                  <Link
                    key={article.href}
                    href={article.href}
                    className="rounded-[24px] border border-[#d4dbb8] bg-[#fffffc]/70 p-6 transition-colors hover:border-[#6b7d3a] md:p-7"
                  >
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                      <span className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                        {article.label}
                      </span>
                      <span className="text-[11px] tracking-[0.4px] text-[#5a5e52]" style={mono}>
                        {article.updated}
                      </span>
                    </div>
                    <h3 className="mt-4 text-[20px] leading-7 text-[#1c1f17]" style={pixel}>
                      {article.title}
                    </h3>
                    <p className="mt-4 text-sm leading-6 text-[#4d5145] md:text-[15px]">
                      {article.description}
                    </p>
                    <TagPills tags={article.tags} />
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
                Entry paths
              </p>
              <h2 className="mt-3 max-w-[760px] text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                Most readers land here through four different decisions
              </h2>
              <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {topicClusters.map((cluster) => (
                  <div
                    key={cluster.title}
                    className="rounded-[24px] border border-[#d4dbb8] bg-[#f7f8ef]/70 p-6"
                  >
                    <h3 className="text-[18px] leading-7 text-[#1c1f17]" style={mono}>
                      {cluster.title}
                    </h3>
                    <p className="mt-4 text-sm leading-6 text-[#4d5145]">{cluster.description}</p>
                    <div className="mt-6 space-y-3">
                      {cluster.links.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className="block rounded-2xl border border-[#d4dbb8] bg-[#fffffc]/70 px-4 py-3 text-sm text-[#1c1f17] transition-colors hover:border-[#6b7d3a]"
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
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
                Read across the site
              </p>
              <h2 className="mt-3 text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                Move from explanation into evaluation or setup
              </h2>
              <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {adjacentHubs.map((hub) => (
                  <Link
                    key={hub.href}
                    href={hub.href}
                    className="rounded-[24px] border border-[#d4dbb8] bg-[#fffffc]/70 p-5 transition-colors hover:border-[#6b7d3a]"
                  >
                    <h3 className="text-base text-[#1c1f17]" style={mono}>
                      {hub.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-[#4d5145]">{hub.description}</p>
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
                Common questions before you pick a path
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
                    <p className="mt-3 text-sm leading-6 text-[#4d5145]">{item.answer}</p>
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
