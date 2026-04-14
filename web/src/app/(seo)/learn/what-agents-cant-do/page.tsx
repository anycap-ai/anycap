import type { Metadata } from "next";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { CapabilityGapTable, type CapabilityGapRow } from "@/components/landing/CapabilityGapTable";
import { EarlyAccessBanner } from "@/components/landing/EarlyAccessBanner";
import { FadeIn } from "@/components/ui/FadeIn";
import { ArticleByline } from "@/components/seo/ArticleByline";
import { getSeoPageChrome } from "@/lib/seo/ia";
import { createLocalizedMetadataForPath } from "@/lib/localized-metadata";
import { defaultLocale } from "@/lib/site";
import { getRequestLocale } from "@/lib/request-locale";
import {
  WHAT_AGENTS_CANT_DO_PATH,
  getWhatAgentsCantDoMetadata,
  getWhatAgentsCantDoPageData,
} from "./content";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

export const metadata: Metadata = createLocalizedMetadataForPath(
  defaultLocale,
  WHAT_AGENTS_CANT_DO_PATH,
  getWhatAgentsCantDoMetadata(defaultLocale),
);

const pageChrome = getSeoPageChrome("/learn/what-agents-cant-do");

export default async function WhatAgentsCantDoPage() {
  const locale = await getRequestLocale();
  const pageData = getWhatAgentsCantDoPageData(locale);
  const gapRows: CapabilityGapRow[] = pageData.table.rows.map((row) => ({
    capability: row.capability,
    cells: [...row.cells],
  }));
  const updatedLabel =
    locale === "pt-br" ? "Atualizado em 7 de abril de 2026" : "Last updated April 7, 2026";

  return (
    <>
      <BreadcrumbJsonLd items={pageData.breadcrumbItems} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageData.articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageData.faqJsonLd) }} />

      <article className="px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-[1280px] py-12 md:py-20 lg:py-24">
          <FadeIn>
            <p className="mb-4 text-[11px] tracking-[0.8px] text-[#6b7d3a]" style={mono}>
              {pageData.eyebrow}
            </p>
            <ArticleByline
              className="mb-3"
              author={pageChrome?.authorLabel}
              updatedLabel={updatedLabel}
            />
            <h1
              className="leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(32px, 6vw, 72px)" }}
            >
              {pageData.heroTitle[0]}
              <br />
              {pageData.heroTitle[1]}
            </h1>
            <p className="mt-6 max-w-[780px] text-base leading-7 text-[#4d5145] md:text-lg">
              {pageData.heroIntro}
            </p>
          </FadeIn>

          <FadeIn className="mt-8">
            <EarlyAccessBanner />
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <div className="mt-16 md:mt-24">
              <CapabilityGapTable
                eyebrow={pageData.table.eyebrow}
                title={pageData.table.title}
                description={pageData.table.description}
                columns={pageData.table.columns}
                rows={gapRows}
                footnote={pageData.table.footnote}
              />
            </div>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-8 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {pageData.intentTitle}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {pageData.intentCards.map((card) => (
                  <Link
                    key={card.href}
                    href={card.href}
                    className="rounded-xl border border-[#d4dbb8] bg-[#fffffc]/70 p-6 transition-colors hover:border-[#6b7d3a]"
                  >
                    <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                      {card.eyebrow}
                    </p>
                    <h3 className="mb-3 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                      {card.title}
                    </h3>
                    <p className="text-sm leading-6 text-[#4d5145]">{card.summary}</p>
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
                {pageData.faqTitle}
              </h2>
              <div className="space-y-6 max-w-[860px]">
                {pageData.faqItems.map((item) => (
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
            <section className="mt-16 md:mt-24 mb-8">
              <div className="flex flex-wrap gap-4">
                <Link
                  href={pageData.ctas[0].href}
                  className="inline-block rounded-lg bg-[#6b7d3a] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#f4f5f0] transition-colors hover:bg-[#1c1f17]"
                  style={mono}
                >
                  {pageData.ctas[0].label}
                </Link>
                <Link
                  href={pageData.ctas[1].href}
                  className="inline-block rounded-lg border border-[#1c1f17] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] transition-colors hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
                  style={mono}
                >
                  {pageData.ctas[1].label}
                </Link>
                <Link
                  href={pageData.ctas[2].href}
                  className="inline-block rounded-lg border border-[#1c1f17] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] transition-colors hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
                  style={mono}
                >
                  {pageData.ctas[2].label}
                </Link>
              </div>
            </section>
          </FadeIn>
        </div>
      </article>
    </>
  );
}
