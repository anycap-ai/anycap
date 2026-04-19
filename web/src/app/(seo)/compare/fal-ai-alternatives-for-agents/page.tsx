import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { EarlyAccessBanner } from "@/components/landing/EarlyAccessBanner";
import { FadeIn } from "@/components/ui/FadeIn";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { createLocalizedMetadataForPath } from "@/lib/localized-metadata";
import { createTechArticleJsonLd } from "@/lib/schema";
import { getRequestLocale } from "@/lib/request-locale";
import { defaultLocale } from "@/lib/site";
import {
  FAL_AI_ALTERNATIVES_PATH,
  getFalAiAlternativesMetadata,
  getFalAiAlternativesPageData,
} from "./content";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

export const metadata: Metadata = createLocalizedMetadataForPath(
  defaultLocale,
  FAL_AI_ALTERNATIVES_PATH,
  getFalAiAlternativesMetadata(defaultLocale),
);

export default async function FalAiAlternativesPage() {
  const locale = await getRequestLocale();
  const content = getFalAiAlternativesPageData(locale);

  const articleJsonLd = createTechArticleJsonLd({
    headline: content.metadata.title,
    description: content.metadata.description,
    path: FAL_AI_ALTERNATIVES_PATH,
    about: ["fal.ai", "AnyCap", "AI agents", "Image generation API", "Serverless inference"],
    keywords: [
      "fal ai alternative",
      "fal.ai alternative",
      "fal ai alternative for agents",
      "best fal ai alternative 2026",
    ],
    datePublished: "2026-04-10",
    dateModified: "2026-04-10",
  });
  return (
    <>
      <BreadcrumbJsonLd items={content.breadcrumbItems} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />

      <article className="px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-[1280px] py-12 md:py-20 lg:py-24">
          <FadeIn>
            <p className="mb-4 text-[11px] tracking-[0.8px] text-[#6b7d3a]" style={mono}>
              {content.eyebrow}
            </p>
            <p className="mb-3 text-[11px] tracking-[0.5px] text-[#5a5e52]" style={mono}>
              {content.lastUpdatedLabel}
            </p>
            <h1
              className="max-w-[960px] leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(28px, 5vw, 60px)" }}
            >
              {content.heroTitle[0]}
              <br />
              {content.heroTitle[1]}
            </h1>
            <p className="mt-6 max-w-[700px] text-base leading-7 text-[#4d5145] md:text-lg">
              {content.heroIntro}
            </p>
          </FadeIn>

          <FadeIn className="mt-8">
            <EarlyAccessBanner />
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-4 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {content.tableTitle}
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[#d4dbb8]">
                      <th className="w-[180px] pb-3 pr-6 text-[11px] tracking-[0.5px] text-[#5a5e52]" style={mono}>
                        {content.tableColumns.dimension}
                      </th>
                      <th className="pb-3 pr-6 text-[11px] tracking-[0.5px] text-[#5a5e52]" style={mono}>
                        {content.tableColumns.falai}
                      </th>
                      <th className="pb-3 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                        {content.tableColumns.anycap}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {content.comparisonDimensions.map((row) => (
                      <tr key={row.dimension} className="border-b border-[#d4dbb8]/50">
                        <td className="py-4 pr-6 align-top text-sm font-medium text-[#1c1f17]">
                          {row.dimension}
                        </td>
                        <td className="py-4 pr-6 align-top text-sm leading-6 text-[#4d5145]">
                          {row.falai}
                        </td>
                        <td className="py-4 align-top text-sm leading-6 text-[#4d5145]">
                          {row.anycap}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-8 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {content.alternativesTitle}
              </h2>
              <div className="space-y-6">
                {content.alternatives.map((alt) => (
                  <div
                    key={alt.name}
                    className={`rounded-xl border p-6 ${alt.name === "AnyCap" ? "border-[#6b7d3a] bg-[#f7f8ef]/80" : "border-[#d4dbb8] bg-[#fffffc]/70"}`}
                  >
                    <h3
                      className={`text-[18px] font-bold ${alt.name === "AnyCap" ? "text-[#6b7d3a]" : "text-[#1c1f17]"}`}
                      style={mono}
                    >
                      {alt.name}
                    </h3>
                    <p className="mt-1 text-[11px] tracking-[0.5px] text-[#5a5e52]" style={mono}>
                      {alt.category}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-[#4d5145]">{alt.focus}</p>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                          Strengths
                        </p>
                        <ul className="space-y-2">
                          {alt.strengths.map((item) => (
                            <li key={item} className="flex items-start gap-2 text-sm leading-6 text-[#4d5145]">
                              <span className="mt-[8px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#6b7d3a]" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="mb-2 text-[11px] tracking-[0.5px] text-[#5a5e52]" style={mono}>
                          Considerations
                        </p>
                        <ul className="space-y-2">
                          {alt.considerations.map((item) => (
                            <li key={item} className="flex items-start gap-2 text-sm leading-6 text-[#4d5145]">
                              <span className="mt-[8px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#d4dbb8]" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <p className="mt-4 text-sm leading-6 text-[#5a5e52]">
                      <span className="text-[11px] tracking-[0.5px]" style={mono}>
                        Best for:{" "}
                      </span>
                      {alt.bestFor}
                    </p>
                    {alt.href ? (
                      <div className="mt-4">
                        <Link
                          href={alt.href}
                          className="inline-block rounded-lg border border-[#d4dbb8] px-5 py-2 text-[12px] text-[#1c1f17] transition-colors hover:border-[#6b7d3a] hover:text-[#6b7d3a]"
                          style={mono}
                        >
                          {alt.cta}
                        </Link>
                      </div>
                    ) : null}
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
                {content.faqTitle}
              </h2>
              <div className="max-w-[860px] space-y-4">
                {content.faqItems.map((item) => (
                  <div key={item.question} className="rounded-xl border border-[#d4dbb8] bg-[#fffffc]/70 p-5">
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
            <section className="mt-16 md:mt-24">
              <h2 className="mb-8 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {content.relatedTitle}
              </h2>
              <div className="grid max-w-[960px] gap-4 sm:grid-cols-2">
                {content.relatedComparisons.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-xl border border-[#d4dbb8] p-5 transition-colors hover:border-[#6b7d3a]"
                  >
                    <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                      {item.eyebrow}
                    </p>
                    <h3 className="mb-2 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                      {item.title}
                    </h3>
                    <p className="text-sm leading-6 text-[#4d5145]">{item.body}</p>
                  </Link>
                ))}
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24 mb-8">
              <div className="flex flex-wrap gap-4">
                {content.cta.map((item, index) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={
                      index === 0
                        ? "inline-block rounded-lg bg-[#6b7d3a] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#f4f5f0] transition-colors hover:bg-[#1c1f17]"
                        : "inline-block rounded-lg border border-[#1c1f17] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] transition-colors hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
                    }
                    style={mono}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </section>
          </FadeIn>
        </div>
      </article>
    </>
  );
}
