import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { FadeIn } from "@/components/ui/FadeIn";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { createFaqPageJsonLd } from "@/lib/schema";
import { getLocalizedRouteUrl, siteConfig } from "@/lib/site";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

export const metadata: Metadata = {
  title: "Learn | AI Agent Guides, Workflows, and Explainers",
  description:
    "Start with coding-agent stack guides, AI product explainers, capability-gap primers, and real workflows that lead into AnyCap capabilities.",
  alternates: { canonical: "/learn" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/learn",
    siteName: siteConfig.siteName,
    title: "Learn | AI Agent Guides, Workflows, and Explainers",
    description:
      "Use Learn when you are choosing a coding-agent stack, extending an AI product, mapping capability gaps, or browsing a real workflow example.",
  },
};

type LearnArticle = {
  title: string;
  href: string;
  description: string;
  label: string;
  updated: string;
  tags: readonly string[];
};

type LearnLink = {
  label: string;
  href: string;
};

type LearnSupportingCluster = {
  eyebrow: string;
  title: string;
  description: string;
  items: readonly LearnArticle[];
};

type LearnSection = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  entryTitle: string;
  entryHref: string;
  entryDescription: string;
  articles: readonly LearnArticle[];
  relatedLinks?: readonly LearnLink[];
  supportingCluster?: LearnSupportingCluster;
};

const bestAiForCodingAgents = {
  title: "Best AI for Coding Agents: choose the right model and capability stack",
  href: "/learn/best-ai-for-coding-agents",
  description:
    "A category guide for teams deciding whether the real question is model quality, platform fit, or the capability layer around a coding agent.",
  label: "Buyer guide",
  updated: "Apr 7, 2026",
  tags: ["Coding agents", "AI models", "Capabilities"],
} as const satisfies LearnArticle;

const bestAiForClaudeCode = {
  title: "Best AI for Claude Code: the right setup is usually Claude Code plus capabilities",
  href: "/learn/best-ai-for-claude-code",
  description:
    "A Claude Code specific buyer guide for teams deciding when pure repo work is enough and when capability gaps start to matter.",
  label: "Buyer guide",
  updated: "Apr 7, 2026",
  tags: ["Claude Code", "Capabilities", "Agent workflow"],
} as const satisfies LearnArticle;

const bestAiForCursor = {
  title: "Best AI for Cursor: the right setup is usually Cursor plus capabilities",
  href: "/learn/best-ai-for-cursor",
  description:
    "A Cursor specific buyer guide for teams deciding when the editor loop is enough and when they need image, video, or vision workflows around it.",
  label: "Buyer guide",
  updated: "Apr 7, 2026",
  tags: ["Cursor", "Capabilities", "Agent workflow"],
} as const satisfies LearnArticle;

const aiChatbotVsAgent = {
  title: "AI Chatbot SaaS vs AI Agent for SaaS: when a chatbot stops being enough",
  href: "/learn/ai-chatbot-vs-ai-agent-for-saas",
  description:
    "A practical architecture guide for SaaS teams deciding when a chatbot is enough and when the workflow really needs an agent plus a capability layer.",
  label: "Explainer",
  updated: "Apr 7, 2026",
  tags: ["AI chatbot", "SaaS", "Capabilities"],
} as const satisfies LearnArticle;

const addMultimodalToSaas = {
  title: "How to add multimodal capabilities to a SaaS chatbot",
  href: "/learn/add-multimodal-capabilities-to-saas-chatbot",
  description:
    "A practical implementation guide for extending a SaaS chatbot with image, video, web, and delivery workflows without rebuilding the whole stack.",
  label: "Implementation",
  updated: "Apr 7, 2026",
  tags: ["Multimodal", "SaaS", "Implementation"],
} as const satisfies LearnArticle;

const whatAgentsCantDo = {
  title: "What AI agents can't do out of the box - and how to add capabilities",
  href: "/learn/what-agents-cant-do",
  description:
    "Map the recurring gaps in modern coding agents and connect each missing capability to the shortest AnyCap path.",
  label: "Foundations",
  updated: "Evergreen",
  tags: ["AI agents", "Capabilities", "Strategy"],
} as const satisfies LearnArticle;

const whatIsMostAdvancedAi = {
  title: "What Is the Most Advanced AI? Why the real answer is not one model",
  href: "/learn/what-is-the-most-advanced-ai",
  description:
    "A broad explainer on when advanced AI is really a model question and when it becomes a system and capability question.",
  label: "Explainer",
  updated: "Apr 7, 2026",
  tags: ["AI models", "Agent strategy", "Capabilities"],
} as const satisfies LearnArticle;

const smartGoalGenerator = {
  title: "AI SMART Goal Generator for Codex, Cursor, and Claude Code",
  href: "/learn/smart-goal-generator",
  description:
    "Turn rough quarterly goals into research-backed SMART goals with citations, structured notes, and publishable output.",
  label: "Workflow",
  updated: "Apr 7, 2026",
  tags: ["Deep research", "Planning", "Agent workflow"],
} as const satisfies LearnArticle;

const howToMakeMemesOnline = {
  title: "How to Make Memes Online with an AI Agent",
  href: "/learn/how-to-make-memes-online",
  description:
    "Use AnyCap to generate or edit the base visual, keep the caption exact, and deliver a meme-style image without switching between separate tools.",
  label: "Workflow anchor",
  updated: "Apr 8, 2026",
  tags: ["Image generation", "Social visuals", "Agent workflow"],
} as const satisfies LearnArticle;

const funnyMemeDrawings = {
  title: "Funny Meme Drawings with an AI Agent",
  href: "/learn/funny-meme-drawings",
  description:
    "Use Nano Banana 2 and AnyCap to generate classic doodle memes, bad-drawing variants, and other low-fi humorous visuals that still fit a repeatable workflow.",
  label: "Style variant",
  updated: "Apr 8, 2026",
  tags: ["Funny meme drawings", "Image generation", "Agent workflow"],
} as const satisfies LearnArticle;

const easyMemesToDraw = {
  title: "Easy Memes to Draw with an AI Agent",
  href: "/learn/easy-memes-to-draw",
  description:
    "Use AnyCap to generate simple doodle character sheets, easy meme ideas, and beginner-friendly reaction drawings that still map to a real workflow.",
  label: "Style variant",
  updated: "Apr 8, 2026",
  tags: ["Easy memes to draw", "Doodle memes", "Agent workflow"],
} as const satisfies LearnArticle;

const badDrawingMemes = {
  title: "How to Make Bad Drawing Memes with an AI Agent",
  href: "/learn/how-to-make-bad-drawing-memes",
  description:
    "Use AnyCap to generate intentionally awkward meme drawings, keep the ugly style readable, and turn badly drawn joke ideas into repeatable visuals.",
  label: "Style variant",
  updated: "Apr 8, 2026",
  tags: ["Bad drawing meme", "Poorly drawn meme", "Agent workflow"],
} as const satisfies LearnArticle;

const learnSections: readonly LearnSection[] = [
  {
    id: "coding-agent-stacks",
    eyebrow: "Choose a coding-agent stack",
    title: "Compare the stack before you compare only the model",
    description:
      "Start here when the real decision is how a coding agent should work day to day, then narrow into the Claude Code or Cursor specific path when you know the workflow you care about.",
    entryTitle: "Choosing a coding-agent stack",
    entryHref: bestAiForCodingAgents.href,
    entryDescription:
      "Start here if you are comparing broad setup options before you narrow into Claude Code, Cursor, or another agent surface.",
    articles: [bestAiForCodingAgents, bestAiForClaudeCode, bestAiForCursor],
    relatedLinks: [
      { label: "Claude Code setup", href: "/for/claude-code" },
      { label: "Cursor setup", href: "/for/cursor" },
    ],
  },
  {
    id: "ai-product-design",
    eyebrow: "Design or extend an AI product",
    title: "Move from chat-first product ideas into capability-aware architecture",
    description:
      "Use this path when a SaaS assistant, copilot, or internal AI feature has to move from answering in chat to inspecting, generating, and delivering richer outputs.",
    entryTitle: "Designing or extending an AI product",
    entryHref: aiChatbotVsAgent.href,
    entryDescription:
      "Start here if your product began as chat and now needs tools, media workflows, or richer output delivery.",
    articles: [aiChatbotVsAgent, addMultimodalToSaas],
    relatedLinks: [
      { label: "Agent capability runtime", href: "/glossary/agent-capability-runtime" },
      { label: "Browse capabilities", href: "/capabilities" },
    ],
  },
  {
    id: "limits-and-evaluation",
    eyebrow: "Understand limits and evaluation",
    title: "Use the gap map before you decide what to add next",
    description:
      "This section works best when the agent mostly succeeds already, but breaks on screenshots, recordings, generation, or delivery and you need to separate model hype from real missing capability.",
    entryTitle: "Understanding agent limits",
    entryHref: whatAgentsCantDo.href,
    entryDescription:
      "Start here if the agent mostly works already but breaks on screenshots, recordings, generation, or delivery.",
    articles: [whatAgentsCantDo, whatIsMostAdvancedAi],
    relatedLinks: [
      { label: "Agent Harness", href: "/glossary/agent-harness" },
      { label: "Capabilities hub", href: "/capabilities" },
    ],
  },
  {
    id: "real-workflows",
    eyebrow: "See real workflows",
    title: "Start with a concrete workflow, then branch into variants",
    description:
      "These pages are the best fit when you want to see one full AnyCap workflow in action instead of another abstract explainer. Start with the anchor workflow, then only branch into supporting variants if the intent really narrows.",
    entryTitle: "Trying a creative workflow",
    entryHref: howToMakeMemesOnline.href,
    entryDescription:
      "Start here if you want a real workflow example and prefer a concrete creative task over another abstract architecture page.",
    articles: [smartGoalGenerator, howToMakeMemesOnline],
    relatedLinks: [
      { label: "Image Generation", href: "/capabilities/image-generation" },
      { label: "Skills", href: "/skills" },
      { label: "Install AnyCap", href: "/guides/install-anycap" },
    ],
    supportingCluster: {
      eyebrow: "Creative workflow variants",
      title: "Keep the meme cluster under one workflow anchor",
      description:
        "Start with How to Make Memes Online when you need the full workflow. The pages below are narrower style variants for doodle, easy-draw, and intentionally awkward meme looks.",
      items: [funnyMemeDrawings, easyMemesToDraw, badDrawingMemes],
    },
  },
];

const learnArticles = learnSections.flatMap((section) => [
  ...section.articles,
  ...(section.supportingCluster?.items ?? []),
]);

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
    question: "Why are the meme pages grouped together instead of listed as separate top-level paths?",
    answer:
      "Because How to Make Memes Online is the anchor workflow. Funny Meme Drawings, Easy Memes to Draw, and Bad Drawing Memes are narrower style variants that make more sense after the core workflow already fits your use case.",
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
    "Learn hub for choosing coding-agent setups, designing AI products, mapping capability gaps, and seeing real workflow examples.",
  url: getLocalizedRouteUrl(siteConfig.defaultLocale, "/learn"),
  hasPart: learnArticles.map((article) => ({
    "@type": "TechArticle",
    headline: article.title,
    description: article.description,
    url: getLocalizedRouteUrl(siteConfig.defaultLocale, article.href),
  })),
} as const;

const itemListJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  itemListElement: learnArticles.map((article, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: article.title,
    url: getLocalizedRouteUrl(siteConfig.defaultLocale, article.href),
  })),
} as const;

function getPrimaryArticle(section: LearnSection): LearnArticle {
  return section.articles.find((article) => article.href === section.entryHref) ?? section.articles[0];
}

function getSecondaryArticles(section: LearnSection): readonly LearnArticle[] {
  const primaryArticle = getPrimaryArticle(section);
  return section.articles.filter((article) => article.href !== primaryArticle.href);
}

function LearnArticleCard({ article }: { article: LearnArticle }) {
  return (
    <Link
      href={article.href}
      className="block rounded-[24px] border border-[#d4dbb8] bg-[#fffffc]/70 p-5 transition-colors hover:border-[#6b7d3a] md:p-6"
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
      <p className="mt-3 text-sm leading-6 text-[#4d5145] md:text-[15px]">{article.description}</p>
    </Link>
  );
}

function QuickPathCard({ section }: { section: LearnSection }) {
  return (
    <li className="list-none">
      <Link
        href={`#${section.id}`}
        className="block h-full rounded-2xl border border-[#d4dbb8] bg-[#fffffc]/70 p-4 transition-colors hover:border-[#6b7d3a]"
      >
        <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
          {section.eyebrow}
        </p>
        <h3 className="mt-3 text-base text-[#1c1f17]" style={mono}>
          {section.entryTitle}
        </h3>
        <p className="mt-2 text-sm leading-6 text-[#4d5145]">{section.entryDescription}</p>
        <p className="mt-3 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
          Open this path
        </p>
      </Link>
    </li>
  );
}

function CompactArticleLink({ article }: { article: LearnArticle }) {
  return (
    <li className="list-none">
      <Link
        href={article.href}
        className="block rounded-2xl px-1 py-3 transition-colors hover:text-[#1c1f17]"
      >
        <h5 className="text-[15px] leading-6 text-[#1c1f17]" style={mono}>
          {article.title}
        </h5>
        <p className="mt-1 text-sm leading-6 text-[#4d5145]">{article.description}</p>
      </Link>
    </li>
  );
}

function SectionLinks({ links }: { links: readonly LearnLink[] }) {
  return (
    <div className="mt-4 flex flex-wrap gap-3">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="rounded-2xl border border-[#d4dbb8] bg-[#fffffc]/70 px-4 py-3 text-sm text-[#1c1f17] transition-colors hover:border-[#6b7d3a]"
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
}

export default function LearnIndexPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Home", href: "/" }, { name: "Learn", href: "/learn" }]} />
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
              Use Learn when you are choosing a coding-agent stack, extending an AI product,
              mapping capability gaps, or looking for a real workflow example. Each path is
              grouped by intent so you can move from explanation into the next step without sorting
              through unrelated page types first.
            </p>
          </FadeIn>

          <FadeIn className="mt-10">
            <section className="mx-auto max-w-[980px] rounded-[28px] border border-[#d4dbb8] bg-[#fffffc]/80 p-6 md:p-8">
              <div className="max-w-[760px]">
                <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                  Path overview
                </p>
                <h2 className="mt-4 text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                  Choose one path and ignore the rest for now
                </h2>
                <p className="mt-4 text-sm leading-6 text-[#4d5145] md:text-[15px]">
                  Each path has one main page and a few supporting reads. Start with the path that
                  matches your question, then only open the narrower pages if you need them.
                </p>
              </div>

              <nav className="mt-6" aria-label="Learn path map">
                <ol className="grid gap-3 md:grid-cols-2">
                  {learnSections.map((section) => (
                    <QuickPathCard key={section.id} section={section} />
                  ))}
                </ol>
              </nav>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mx-auto mt-16 max-w-[980px] md:mt-24">
              <div className="max-w-[760px]">
                <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                  Paths
                </p>
                <h2 className="mt-3 text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                  Start with the main page, then go narrower only if needed
                </h2>
              </div>

              <div className="mt-8 space-y-6">
                {learnSections.map((section) => {
                  const primaryArticle = getPrimaryArticle(section);
                  const secondaryArticles = getSecondaryArticles(section);

                  return (
                    <div
                      key={section.id}
                      id={section.id}
                      className="rounded-[28px] border border-[#d4dbb8] bg-[#fffffc]/75 p-6 md:p-8"
                    >
                      <div className="max-w-[760px]">
                        <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                          {section.eyebrow}
                        </p>
                        <h3 className="mt-3 text-[22px] leading-8 text-[#1c1f17] md:text-[28px]" style={pixel}>
                          {section.title}
                        </h3>
                        <p className="mt-4 text-sm leading-6 text-[#4d5145] md:text-[15px]">
                          {section.description}
                        </p>

                        {section.relatedLinks ? (
                          <div className="mt-6">
                            <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                              Useful next steps
                            </p>
                            <SectionLinks links={section.relatedLinks} />
                          </div>
                        ) : null}
                      </div>

                      <div className="mt-8">
                        <p className="mb-4 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                          Main page
                        </p>
                        <LearnArticleCard article={primaryArticle} />
                      </div>

                      {secondaryArticles.length > 0 ? (
                        <div className="mt-6 border-t border-[#d4dbb8] pt-5">
                          <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                            Supporting pages
                          </p>
                          <ol className="mt-3 divide-y divide-[#d4dbb8]">
                            {secondaryArticles.map((article) => (
                              <CompactArticleLink key={article.href} article={article} />
                            ))}
                          </ol>
                        </div>
                      ) : null}

                      {section.supportingCluster ? (
                        <div className="mt-6 border-t border-[#d4dbb8] pt-5">
                          <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                            {section.supportingCluster.eyebrow}
                          </p>
                          <p className="mt-3 max-w-[760px] text-sm leading-6 text-[#4d5145]">
                            {section.supportingCluster.description}
                          </p>
                          <ol className="mt-3 divide-y divide-[#d4dbb8]">
                            {section.supportingCluster.items.map((article) => (
                              <CompactArticleLink key={article.href} article={article} />
                            ))}
                          </ol>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mx-auto mt-16 max-w-[980px] rounded-[28px] border border-[#d4dbb8] bg-[#fffffc]/80 p-6 md:mt-24 md:p-8">
              <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                Need a different page type?
              </p>
              <h2 className="mt-3 text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                Switch to setup, vocabulary, capabilities, or comparison
              </h2>
              <p className="mt-4 max-w-[760px] text-sm leading-6 text-[#4d5145] md:text-[15px]">
                If the question is no longer exploratory, move to the page type that matches the
                next step instead of scanning more Learn articles.
              </p>
              <div className="mt-6 divide-y divide-[#d4dbb8]">
                {adjacentHubs.map((hub) => (
                  <Link
                    key={hub.href}
                    href={hub.href}
                    className="block py-4 transition-colors hover:text-[#1c1f17] first:pt-0 last:pb-0"
                  >
                    <div className="grid gap-2 md:grid-cols-[160px_minmax(0,1fr)] md:gap-6">
                      <h3 className="text-base text-[#1c1f17]" style={mono}>
                        {hub.title}
                      </h3>
                      <p className="text-sm leading-6 text-[#4d5145]">{hub.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mx-auto mt-16 max-w-[980px] rounded-[28px] border border-[#d4dbb8] bg-[#fffffc]/80 p-6 md:mt-24 md:p-8">
              <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                FAQ
              </p>
              <h2 className="mt-3 text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                Common questions before you pick a path
              </h2>
              <div className="mt-6 divide-y divide-[#d4dbb8]">
                {faqItems.map((item) => (
                  <details key={item.question} className="group py-4 first:pt-0 last:pb-0">
                    <summary
                      className="list-none cursor-pointer text-base text-[#1c1f17] marker:content-none"
                      style={mono}
                    >
                      {item.question}
                    </summary>
                    <p className="mt-3 max-w-[760px] text-sm leading-6 text-[#4d5145]">{item.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          </FadeIn>
        </div>
      </article>
    </>
  );
}
