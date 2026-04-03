import type { Metadata } from "next";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { FadeIn } from "@/components/ui/FadeIn";
import { WebCrawlDemo } from "@/components/landing/WebCrawlDemo";
import { createTechArticleJsonLd } from "@/lib/schema";
import { siteConfig } from "@/lib/site";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

export const metadata: Metadata = {
  title: "Web Crawl API for AI agents - Content extraction and Markdown conversion",
  description:
    "Give AI agents web crawl through AnyCap. Convert web pages to clean Markdown and content-ready output through one CLI instead of wiring a separate crawl or extraction API.",
  alternates: { canonical: "/capabilities/web-crawl" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/capabilities/web-crawl",
    siteName: siteConfig.siteName,
    title: "Web Crawl API for AI agents - Content extraction and Markdown conversion",
    description:
      "Add web crawl and content extraction to AI agents with one CLI and one capability runtime.",
  },
};

const usageExamples = [
  {
    title: "Read a known URL",
    code: "anycap crawl https://example.com",
  },
  {
    title: "Get the page title only",
    code: "anycap crawl https://go.dev | jq -r '.data.title'",
  },
  {
    title: "Extract Markdown content",
    code: "anycap crawl https://docs.go.dev/ref/spec | jq -r '.data.markdown'",
  },
] as const;

const useCases = [
  "Convert known URLs into clean Markdown for downstream summarization or analysis.",
  "Extract documentation pages without maintaining a separate scraping stack.",
  "Fetch content directly when search has already identified the right source page.",
  "Normalize web page content before feeding it into a research, writing, or coding workflow.",
] as const;

const faqItems = [
  {
    question: "What does AnyCap web crawl let agents do?",
    answer:
      "It lets agents take a known URL and convert the page into clean Markdown through one CLI command. That makes web crawl a practical content extraction layer for documentation, articles, and reference pages.",
  },
  {
    question: "Why not just call this scraping?",
    answer:
      "Scraping, crawl API, web data API, and content extraction API are all adjacent market terms. Web crawl is the capability label, but the page should also serve the broader content extraction intent because that is how demand usually appears.",
  },
  {
    question: "When should teams use crawl instead of search?",
    answer:
      "Use crawl when the target URL is already known and the agent needs the page content itself. Use search when the workflow still needs discovery or source selection.",
  },
  {
    question: "Why is Markdown conversion useful for AI agents?",
    answer:
      "Because Markdown is easier for downstream tools and models to process consistently. It reduces the amount of HTML cleanup or extraction logic teams need to maintain on their own.",
  },
] as const;

const capabilityGuideJsonLd = createTechArticleJsonLd({
  headline: "Web Crawl API for AI agents - Content extraction and Markdown conversion",
  description:
    "Capability guide for adding web crawl to AI agents through AnyCap, including URL-to-Markdown extraction and content retrieval workflows.",
  path: "/capabilities/web-crawl",
  about: ["Web crawl", "Content extraction API", "Crawl API", "AnyCap"],
  keywords: [
    "web crawl api",
    "content extraction api",
    "crawl api ai agents",
    "web scraping api ai agents",
  ],
});

export default function WebCrawlPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Capabilities", href: "/capabilities" },
          { name: "Web Crawl" },
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
              Web Crawl
            </h1>
            <p className="mt-6 max-w-[780px] text-base leading-7 text-[#4d5145] md:text-lg">
              AnyCap web crawl gives agents a direct URL-to-Markdown extraction path through one
              CLI. Instead of wiring a separate crawling, scraping, or content extraction API, the
              agent can fetch a known page, normalize the content, and move it into the rest of the
              workflow through the same capability runtime used for search, generation, and analysis.
            </p>
          </FadeIn>

          <FadeIn className="mt-10">
            <WebCrawlDemo />
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
                When agents need web crawl
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
                    Search helps discover candidate pages before crawl extracts the content of the chosen URL.
                  </p>
                </Link>
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
                    Use grounded search when the workflow needs a synthesized answer with citations.
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
                    See crawl pricing alongside search and the rest of the capability stack.
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
