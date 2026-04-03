import type { Metadata } from "next";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { FadeIn } from "@/components/ui/FadeIn";
import { GroundedSearchDemo } from "@/components/landing/GroundedSearchDemo";
import { createTechArticleJsonLd } from "@/lib/schema";
import { siteConfig } from "@/lib/site";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

export const metadata: Metadata = {
  title: "Grounded Web Search for AI agents - Answers with citations through one CLI",
  description:
    "Give AI agents grounded web search through AnyCap. Get synthesized answers with citations from live web search through one CLI instead of building a separate grounded search flow.",
  alternates: { canonical: "/capabilities/grounded-web-search" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/capabilities/grounded-web-search",
    siteName: siteConfig.siteName,
    title: "Grounded Web Search for AI agents - Answers with citations through one CLI",
    description:
      "Add citation-backed grounded web search to AI agents with one CLI and one capability runtime.",
  },
};

const usageExamples = [
  {
    title: "Grounded question answering",
    code: 'anycap search --prompt "What are the latest changes in Go 1.25?"',
  },
  {
    title: "Comparison with citations",
    code: 'anycap search --prompt "Compare React vs Vue in terms of performance"',
  },
  {
    title: "Extract the answer text",
    code: 'anycap search --prompt "What is context engineering?" | jq -r \'.data.content\'',
  },
  {
    title: "List cited sources",
    code:
      'anycap search --prompt "latest Go releases" | jq -r \'.data.search_metadata.sources[] | "\\(.title): \\(.uri)"\'',
  },
] as const;

const useCases = [
  "Answer research questions when the workflow needs synthesized output instead of a raw result list.",
  "Return citations and source attribution for research, reporting, and high-trust workflows.",
  "Use grounded search inside an agent loop without hand-building retrieval plus answer synthesis.",
  "Handle freshness-sensitive questions where teams need both an answer and visible source backing.",
] as const;

const faqItems = [
  {
    question: "What does grounded web search let agents do?",
    answer:
      "It lets agents ask a question and receive a synthesized answer grounded in live web search results with citations. That is different from standard search, which returns a list of pages for the agent to inspect itself.",
  },
  {
    question: "What search language should this page target?",
    answer:
      "The best supporting language is grounded web search, AI grounded search, search with citations, and grounded search API. These phrases map better to the actual job than a generic search label.",
  },
  {
    question: "When should teams prefer grounded search over standard web search?",
    answer:
      "Use grounded search when the agent needs a direct answer with citations. Use standard web search when the agent needs to inspect a result set, choose sources, or perform downstream extraction itself.",
  },
  {
    question: "Why is this valuable for AI agents specifically?",
    answer:
      "Because grounded search collapses retrieval and answer generation into a single runtime step while preserving source attribution. That is a strong fit for research, audit, and decision-support workflows.",
  },
] as const;

const capabilityGuideJsonLd = createTechArticleJsonLd({
  headline: "Grounded Web Search for AI agents - Answers with citations through one CLI",
  description:
    "Capability guide for adding grounded web search to AI agents through AnyCap, including citation-backed answers and live web search synthesis.",
  path: "/capabilities/grounded-web-search",
  about: ["Grounded search", "Search with citations", "AI grounded search", "AnyCap"],
  keywords: [
    "grounded web search",
    "ai grounded search",
    "search with citations",
    "grounded search api",
  ],
});

export default function GroundedWebSearchPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Capabilities", href: "/capabilities" },
          { name: "Grounded Web Search" },
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
              Capabilities
            </p>
            <h1
              className="leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(32px, 6vw, 72px)" }}
            >
              Grounded Web Search
            </h1>
            <p className="mt-6 max-w-[780px] text-base leading-7 text-[#4d5145] md:text-lg">
              AnyCap grounded web search gives agents citation-backed answers through one CLI.
              Instead of assembling a separate retrieval pipeline and answer layer, teams can ask a
              question, get a synthesized response, and preserve source attribution in the same
              runtime. That makes grounded search especially useful for research, audit, and
              freshness-sensitive agent workflows.
            </p>
          </FadeIn>

          <FadeIn className="mt-10">
            <GroundedSearchDemo />
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
                When agents need grounded web search
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
                  href="/capabilities/web-search"
                  className="rounded-xl border border-[#d4dbb8] p-5 transition-colors hover:border-[#6b7d3a]"
                >
                  <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                    Related capability
                  </p>
                  <h3 className="mb-2 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                    Web Search
                  </h3>
                  <p className="text-sm leading-6 text-[#4d5145]">
                    Start there when the workflow needs retrieval and result selection before synthesis.
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
                    Use crawl when the source URL is known and the workflow only needs the page content.
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
                    Compare standard search and grounded search credit costs on the pricing page.
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
