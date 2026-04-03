import type { Metadata } from "next";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { FadeIn } from "@/components/ui/FadeIn";
import { WebSearchDemo } from "@/components/landing/WebSearchDemo";
import { createTechArticleJsonLd } from "@/lib/schema";
import { siteConfig } from "@/lib/site";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

export const metadata: Metadata = {
  title: "Web Search API for AI agents - Structured search through one CLI",
  description:
    "Give AI agents web search through AnyCap. Run structured web search with domain filters, recency controls, and optional page crawling through one CLI instead of wiring a separate search API.",
  alternates: { canonical: "/capabilities/web-search" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/capabilities/web-search",
    siteName: siteConfig.siteName,
    title: "Web Search API for AI agents - Structured search through one CLI",
    description:
      "Add web search to AI agents with one CLI, one auth flow, and one capability runtime.",
  },
};

const usageExamples = [
  {
    title: "General web search",
    code: 'anycap search --query "AI agent framework"',
  },
  {
    title: "Fast titles and URLs only",
    code: 'anycap search --query "AI agent framework" --no-crawl',
  },
  {
    title: "Constrain domains",
    code: 'anycap search --query "Go context" --include github.com --include go.dev',
  },
  {
    title: "Recent results only",
    code: 'anycap search --query "Claude Code release" --time-range month',
  },
] as const;

const useCases = [
  "Find relevant pages, docs, or references before an agent writes or updates code.",
  "Search the web with structured results instead of opening a browser-based search workflow.",
  "Constrain searches to trusted domains when teams need more predictable retrieval.",
  "Pull page content directly into the workflow when the agent needs more than just URLs and snippets.",
] as const;

const faqItems = [
  {
    question: "What does AnyCap web search let agents do?",
    answer:
      "It gives agents a structured web search API through the CLI. Teams can search by query, filter by domain or date, and optionally fetch full page content without stitching together separate browser tools or search providers.",
  },
  {
    question: "Why is web search its own capability page?",
    answer:
      "Because the market language here is API-shaped. Search demand is usually phrased as web search API, search API for AI agents, or real-time web search API rather than a generic capability term.",
  },
  {
    question: "How is this different from grounded web search?",
    answer:
      "Web search returns structured search results. Grounded web search synthesizes an answer with citations. The two capabilities share the same command family but solve different jobs.",
  },
  {
    question: "When should teams use standard web search first?",
    answer:
      "When the goal is discovery, retrieval, or collecting a result set. If the agent needs to inspect candidate pages itself, standard search is the cleaner starting point.",
  },
] as const;

const capabilityGuideJsonLd = createTechArticleJsonLd({
  headline: "Web Search API for AI agents - Structured search through one CLI",
  description:
    "Capability guide for adding web search to AI agents through AnyCap, including general search, domain filters, recency filters, and optional crawling.",
  path: "/capabilities/web-search",
  about: ["Web search API", "Search API for AI agents", "Real-time web search", "AnyCap"],
  keywords: [
    "web search api",
    "search api for ai agents",
    "real time web search api",
    "web search api ai agents",
  ],
});

export default function WebSearchPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Capabilities", href: "/capabilities" },
          { name: "Web Search" },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(capabilityGuideJsonLd) }}
      />

      <article className="px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-[1280px] py-12 md:py-20 lg:py-24">
          <FadeIn>
            <p className="mb-4 text-[11px] tracking-[0.8px] text-[#6b7d3a]" style={mono}>
              Capability
            </p>
            <h1
              className="leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(32px, 6vw, 72px)" }}
            >
              Web Search
            </h1>
            <p className="mt-6 max-w-[780px] text-base leading-7 text-[#4d5145] md:text-lg">
              AnyCap web search gives agents a structured web search API through one CLI. Agents
              can retrieve result sets, constrain trusted domains, filter by recency, and pull page
              content into the workflow without relying on a separate browser extension or
              provider-specific search integration. That makes web search easier to combine with the
              rest of the AnyCap runtime.
            </p>
          </FadeIn>

          <FadeIn className="mt-10">
            <WebSearchDemo />
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-6 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                CLI usage
              </h2>
              <div className="max-w-[860px] space-y-6">
                {usageExamples.map((example) => (
                  <div key={example.title}>
                    <p className="mb-3 text-[11px] tracking-[0.5px] text-[#5a5e52]" style={mono}>
                      {example.title}
                    </p>
                    <div className="bg-[#1c1f17] px-5 py-4">
                      <p className="break-all text-[13px] text-[#d4e0a4]" style={mono}>
                        {example.code}
                      </p>
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
              <h2 className="mb-6 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                When agents need web search
              </h2>
              <div className="grid max-w-[920px] gap-4 sm:grid-cols-2">
                {useCases.map((useCase) => (
                  <div key={useCase} className="border-l-[3px] border-[#6b7d3a] pl-5">
                    <p className="text-sm leading-6 text-[#4d5145]">{useCase}</p>
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
              <div className="grid max-w-[1100px] gap-4 sm:grid-cols-3">
                <Link
                  href="/capabilities/grounded-web-search"
                  className="rounded-xl border border-[#d4dbb8] p-5 transition-colors hover:border-[#6b7d3a]"
                >
                  <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                    Related capability
                  </p>
                  <h3 className="mb-2 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                    Grounded Web Search
                  </h3>
                  <p className="text-sm leading-6 text-[#4d5145]">
                    Move up to citation-backed answers when the workflow needs synthesis instead of retrieval.
                  </p>
                </Link>
                <Link
                  href="/capabilities/web-crawl"
                  className="rounded-xl border border-[#d4dbb8] p-5 transition-colors hover:border-[#6b7d3a]"
                >
                  <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                    Related capability
                  </p>
                  <h3 className="mb-2 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                    Web Crawl
                  </h3>
                  <p className="text-sm leading-6 text-[#4d5145]">
                    Use crawl when the URL is already known and the agent just needs the page content.
                  </p>
                </Link>
                <Link
                  href="/pricing"
                  className="rounded-xl border border-[#d4dbb8] p-5 transition-colors hover:border-[#6b7d3a]"
                >
                  <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                    Pricing
                  </p>
                  <h3 className="mb-2 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                    Pricing
                  </h3>
                  <p className="text-sm leading-6 text-[#4d5145]">
                    See the credit model for web search, grounded answers, and crawl requests.
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
              <div className="max-w-[860px] space-y-6">
                {faqItems.map((item) => (
                  <div key={item.question} className="rounded-xl border border-[#d4dbb8] p-5">
                    <h3 className="mb-2 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                      {item.question}
                    </h3>
                    <p className="text-sm leading-6 text-[#4d5145]">{item.answer}</p>
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
