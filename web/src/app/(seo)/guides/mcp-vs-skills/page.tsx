import Image from "next/image";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { ArticleByline } from "@/components/seo/ArticleByline";
import { FadeIn } from "@/components/ui/FadeIn";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { EarlyAccessBanner } from "@/components/landing/EarlyAccessBanner";
import { getSeoPageChrome } from "@/lib/seo-ia";
import { createLocalizedMetadataForPath } from "@/lib/localized-metadata";
import { getRequestLocale } from "@/lib/request-locale";
import { defaultLocale } from "@/lib/site";
import { getMcpVsSkillsMetadata, getMcpVsSkillsPageData, MCP_VS_SKILLS_PATH } from "./content";

export const runtime = "edge";

const SEO_IMAGE_BASE = "https://cdn.anycap.ai/page_resource/seo-images";
const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

export const metadata = createLocalizedMetadataForPath(
  defaultLocale,
  MCP_VS_SKILLS_PATH,
  getMcpVsSkillsMetadata(defaultLocale),
);

const pageChrome = getSeoPageChrome(MCP_VS_SKILLS_PATH);

export default async function McpVsSkillsPage() {
  const locale = await getRequestLocale();
  const content = getMcpVsSkillsPageData(locale);

  return (
    <>
      <BreadcrumbJsonLd items={pageChrome?.breadcrumbItems} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(content.guideJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(content.faqJsonLd) }}
      />

      <article className="px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-[1280px] py-12 md:py-20 lg:py-24">
          <FadeIn>
            <p className="mb-4 text-[11px] tracking-[0.8px] text-[#6b7d3a]" style={mono}>
              {content.eyebrow}
            </p>
            <ArticleByline className="mb-3" author={pageChrome?.authorLabel} />
            <h1
              className="leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(32px, 6vw, 72px)" }}
            >
              {content.heroTitle[0]}
              <br />
              {content.heroTitle[1]}
            </h1>
            <p className="mt-6 max-w-[820px] text-base leading-7 text-[#4d5145] md:text-lg">
              {content.heroIntro}
            </p>

            <figure className="mt-10 overflow-hidden rounded-[28px] border border-[#d4dbb8] bg-[#f9faf5]/90 shadow-[0_12px_40px_rgba(28,31,23,0.08)]">
              <Image
                src={`${SEO_IMAGE_BASE}/mcp-vs-skills-hero.png`}
                alt={content.heroImageAlt}
                width={2752}
                height={1536}
                priority
                sizes="(max-width: 768px) 100vw, 1280px"
                className="h-auto w-full"
              />
            </figure>
          </FadeIn>

          <FadeIn className="mt-8">
            <EarlyAccessBanner />
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-8 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {content.comparisonTitle}
              </h2>
              <div className="grid gap-4 lg:grid-cols-3">
                {content.comparisonRows.map((row) => (
                  <div key={row.layer} className="rounded-xl border border-[#d4dbb8] p-5">
                    <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                      {row.layer}
                    </p>
                    <p className="mb-3 text-sm leading-6 text-[#4d5145]">{row.summary}</p>
                    <p className="mb-3 text-sm leading-6 text-[#1c1f17]">
                      <span className="font-bold" style={mono}>
                        Best for:
                      </span>{" "}
                      {row.bestFor}
                    </p>
                    <p className="text-sm leading-6 text-[#4d5145]">
                      <span className="font-bold" style={mono}>
                        For AnyCap:
                      </span>{" "}
                      {row.anyCap}
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
              <h2 className="mb-6 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {content.changeTitle}
              </h2>
              <div className="grid gap-4 lg:grid-cols-2">
                {content.changeCards.map((card) => (
                  <div key={card.title} className="rounded-xl border border-[#d4dbb8] bg-[#fffffc]/70 p-6">
                    <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                      {card.title}
                    </p>
                    {card.paragraphs.map((paragraph) => (
                      <p key={paragraph} className="mb-3 text-sm leading-6 text-[#4d5145] last:mb-0">
                        {paragraph}
                      </p>
                    ))}
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
                {content.decisionTitle}
              </h2>
              <p className="max-w-[820px] text-base leading-7 text-[#4d5145]">{content.decisionIntro}</p>

              <div className="mt-8 grid gap-4 lg:grid-cols-3">
                {content.decisionCards.map((card) => (
                  <div key={card.title} className="rounded-xl border border-[#d4dbb8] bg-[#fffffc]/70 p-5">
                    <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                      {card.title}
                    </p>
                    <p className="text-sm leading-6 text-[#4d5145]">{card.body}</p>
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
                {content.exampleTitle}
              </h2>
              <div className="grid gap-4 lg:grid-cols-3">
                {content.exampleCards.map((card) => (
                  <div key={card.title} className="rounded-xl border border-[#d4dbb8] p-5">
                    <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                      {card.title}
                    </p>
                    <p className="text-sm leading-6 text-[#4d5145]">{card.body}</p>
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
                {content.mistakesTitle}
              </h2>
              <div className="grid max-w-[860px] gap-4">
                {content.mistakes.map((mistake) => (
                  <div key={mistake} className="border-l-[3px] border-[#6b7d3a] pl-5">
                    <p className="text-sm leading-6 text-[#4d5145]">{mistake}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 max-w-[860px] rounded-xl border border-[#d4dbb8] bg-[#f9faf5]/80 p-5">
                <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                  {content.ruleTitle}
                </p>
                <p className="text-sm leading-6 text-[#4d5145]">{content.ruleBody}</p>
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-8 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {content.scenariosTitle}
              </h2>
              <div className="max-w-[820px] space-y-5">
                {content.scenarios.map((scenario) => (
                  <div key={scenario.title} className="rounded-xl border border-[#d4dbb8] bg-[#fffffc]/70 p-5">
                    <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                      {scenario.title}
                    </p>
                    <p className="text-sm leading-6 text-[#4d5145]">{scenario.body}</p>
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
                {content.nextTitle}
              </h2>
              <div className="grid gap-4 lg:grid-cols-3">
                {content.nextPages.map((page) => (
                  <Link
                    key={page.href}
                    href={page.href}
                    className="rounded-xl border border-[#d4dbb8] p-5 transition-colors hover:border-[#6b7d3a]"
                  >
                    <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                      {page.eyebrow}
                    </p>
                    <h3 className="mb-2 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                      {page.title}
                    </h3>
                    <p className="text-sm leading-6 text-[#4d5145]">{page.body}</p>
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
              <h2 className="mb-8 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {content.faqTitle}
              </h2>
              <div className="max-w-[820px] space-y-4">
                {content.faqItems.map((item) => (
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
