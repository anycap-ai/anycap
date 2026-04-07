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
  title: "Learn - Buyer guides, SaaS assistant explainers, and workflow essays",
  description:
    "Browse AnyCap Learn for coding-agent buyer guides, SaaS assistant architecture explainers, capability strategy, and workflow essays tied to real tasks.",
  alternates: { canonical: "/learn" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/learn",
    siteName: siteConfig.siteName,
    title: "Learn - Buyer guides, SaaS assistant explainers, and workflow essays",
    description:
      "Use Learn as the editorial hub for coding-agent buyer guides, SaaS assistant architecture, and workflow pages that connect readers to AnyCap capabilities.",
  },
};

const featuredArticle = {
  label: "Featured buyer guide",
  title: "Best AI for Coding Agents: choose the right model and capability stack",
  href: "/learn/best-ai-for-coding-agents",
  description:
    "A high-intent evaluation page that reframes model ranking as a stack decision across reasoning, media work, and the capability layer around Claude Code, Cursor, and Codex.",
  updated: "Updated Apr 7, 2026",
  cta: "Read the buyer guide",
  tags: ["Coding agents", "Buyer guide", "Capabilities"],
} as const;

const learnArticles = [
  {
    title: "Best AI for Coding Agents: choose the right model and capability stack",
    href: "/learn/best-ai-for-coding-agents",
    description:
      "A practical guide to choosing the best AI setup for coding agents when the workflow expands beyond pure code generation.",
    label: "Buyer guide",
    updated: "Apr 7, 2026",
    tags: ["Coding agents", "AI models", "Capabilities"],
  },
  {
    title: "Best AI for Claude Code: the right setup is usually Claude Code plus capabilities",
    href: "/learn/best-ai-for-claude-code",
    description:
      "A Claude Code specific guide to deciding when pure coding is enough and when you need image, video, and vision capabilities around the agent.",
    label: "Buyer guide",
    updated: "Apr 7, 2026",
    tags: ["Claude Code", "Capabilities", "Agent workflow"],
  },
  {
    title: "Best AI for Cursor: the right setup is usually Cursor plus capabilities",
    href: "/learn/best-ai-for-cursor",
    description:
      "A Cursor specific guide to deciding when pure coding is enough and when you need image, video, and vision capabilities around the editor workflow.",
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
      "An honest explainer on why advanced AI depends on reasoning, multimodal output, and the capability layer around the model.",
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

const topicClusters = [
  {
    title: "Buyer guides for agent stacks",
    description:
      "Capture commercial-intent evaluation queries around coding agents, agent shells, and the best setup once capabilities start to matter.",
    links: [
      { label: "Best AI for Coding Agents", href: "/learn/best-ai-for-coding-agents" },
      { label: "Best AI for Claude Code", href: "/learn/best-ai-for-claude-code" },
      { label: "Best AI for Cursor", href: "/learn/best-ai-for-cursor" },
    ],
  },
  {
    title: "SaaS assistant architecture",
    description:
      "Capture SaaS chatbot and copilot queries when the product shifts from answering in chat to multimodal execution and richer output delivery.",
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
      "Use broader explainers to teach where model comparisons stop being enough and why a capability runtime matters in practical work.",
    links: [
      { label: "What Is the Most Advanced AI?", href: "/learn/what-is-the-most-advanced-ai" },
      { label: "What Agents Can't Do", href: "/learn/what-agents-cant-do" },
      { label: "Agent Capability Runtime", href: "/glossary/agent-capability-runtime" },
    ],
  },
  {
    title: "Research-backed workflows",
    description:
      "Publish workflow pages that prove the runtime is useful in a real task instead of only describing the architecture in theory.",
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
    description: "Use Guides when the reader already knows the task and wants hands-on setup steps.",
  },
  {
    title: "Glossary",
    href: "/glossary",
    description: "Use Glossary when the reader needs shared language for harnesses, context, and capability runtimes.",
  },
  {
    title: "Capabilities",
    href: "/capabilities",
    description: "Use Capabilities when the intent shifts from education into product and feature evaluation.",
  },
  {
    title: "Compare",
    href: "/compare",
    description: "Use Compare when the search starts from adjacent vendors, alternatives, or evaluation queries.",
  },
] as const;

const faqItems = [
  {
    question: "Is Learn the AnyCap blog?",
    answer:
      "Yes. Learn now acts as the editorial blog-style hub for explainers, workflow essays, and broader search-intent pages instead of creating a separate /blog directory.",
  },
  {
    question: "Should category pages go live before there are many articles?",
    answer:
      "No. Thin category pages usually add crawl noise without adding much ranking value. Publish strong articles first, then add category landing pages only after each cluster has enough depth.",
  },
  {
    question: "What should each Learn article link to?",
    answer:
      "Each article should link to at least one related Learn page and one higher-intent destination such as Guides, Capabilities, or agent-specific pages.",
  },
] as const;

const faqJsonLd = createFaqPageJsonLd(faqItems);

const collectionJsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "AnyCap Learn",
  description:
    "Editorial hub for AnyCap buyer guides, SaaS assistant architecture explainers, and workflow pages about capability runtimes.",
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
              Buyer guides, explainers,
              <br />
              and workflow essays
            </h1>
            <p className="mt-6 max-w-[820px] text-base leading-7 text-[#4d5145] md:text-lg">
              Learn now carries four clear intent tracks: buyer guides for coding-agent stacks,
              architecture explainers for SaaS assistants, foundational pages about capability
              gaps, and workflow essays that prove the runtime in real use. Instead of launching
              thin taxonomies, the goal is to turn each strong page into a cluster anchor with
              internal links to Guides, Capabilities, Compare, and agent-specific paths.
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
                  Editorial strategy
                </p>
                <h2 className="mt-4 text-[22px] leading-8 text-[#1c1f17]" style={pixel}>
                  Build intent clusters, not empty taxonomies
                </h2>
                <p className="mt-4 text-sm leading-6 text-[#4d5145] md:text-[15px]">
                  The Learn IA is now organized around four jobs-to-be-done: evaluate the best
                  agent stack, understand SaaS assistant architecture, learn the capability gap, and
                  see a real workflow proof. That keeps new pages additive instead of letting the
                  hub become a flat list of unrelated articles.
                </p>
                <div className="mt-8 space-y-3">
                  {adjacentHubs.slice(0, 2).map((hub) => (
                    <Link
                      key={hub.href}
                      href={hub.href}
                      className="block rounded-2xl border border-[#d4dbb8] bg-[#fffffc]/70 p-4 transition-colors hover:border-[#6b7d3a]"
                    >
                      <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                        Adjacent hub
                      </p>
                      <h3 className="mt-2 text-base text-[#1c1f17]" style={mono}>
                        {hub.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-[#4d5145]">{hub.description}</p>
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
                    Start with the cluster that matches your question
                  </h2>
                </div>
                <Link
                  href="/guides"
                  className="text-sm text-[#6b7d3a] underline decoration-[#a7b57b] underline-offset-4"
                  style={mono}
                >
                  Need hands-on setup instead? Browse Guides
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
                Topic clusters
              </p>
              <h2 className="mt-3 max-w-[760px] text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                Organize Learn around evaluation, architecture, foundations, and workflow proofs
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
                Learn should feed the rest of the information architecture
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
                How to use this blog-style Learn hub for SEO
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
