import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { EarlyAccessBanner } from "@/components/landing/EarlyAccessBanner";
import { FadeIn } from "@/components/ui/FadeIn";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { createLocalizedMetadataForPath } from "@/lib/localized-metadata";
import { getRequestLocale } from "@/lib/request-locale";
import { defaultLocale } from "@/lib/site";
import {
  ANYCAP_VS_FAL_AI_PATH,
  getAnyCapVsFalAiMetadata,
  getAnyCapVsFalAiPageData,
} from "./content";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

export const metadata: Metadata = createLocalizedMetadataForPath(
  defaultLocale,
  ANYCAP_VS_FAL_AI_PATH,
  getAnyCapVsFalAiMetadata(defaultLocale),
);

function SourceLink({ href, label }: { href: string; label: string }) {
  if (href.startsWith("http")) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[#1c1f17] underline decoration-[#6b7d3a] underline-offset-4"
      >
        {label}
      </a>
    );
  }

  return (
    <Link href={href} className="text-[#1c1f17] underline decoration-[#6b7d3a] underline-offset-4">
      {label}
    </Link>
  );
}

export default async function AnycapVsFalAiPage() {
  const locale = await getRequestLocale();
  const pageData = getAnyCapVsFalAiPageData(locale);

  return (
    <>
      <BreadcrumbJsonLd items={pageData.breadcrumbItems} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageData.articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageData.faqJsonLd) }}
      />

      <article className="px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-[1280px] py-12 md:py-20 lg:py-24">
          <FadeIn>
            <p className="mb-4 text-[11px] tracking-[0.8px] text-[#6b7d3a]" style={mono}>
              {pageData.eyebrow}
            </p>
            <p className="mb-3 text-[11px] tracking-[0.5px] text-[#5a5e52]" style={mono}>
              {pageData.lastUpdatedLabel}
            </p>
            <h1
              className="leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(28px, 5vw, 60px)" }}
            >
              {pageData.heroTitle[0]}
              <br />
              {pageData.heroTitle[1]}
            </h1>
            <p className="mt-6 max-w-[860px] text-base leading-7 text-[#4d5145] md:text-lg">
              {pageData.heroIntro}
            </p>
            <div className="mt-8 max-w-[920px] rounded-2xl border border-[#d4dbb8] bg-[#fbfcf8] p-6 md:p-7">
              <p className="text-[11px] tracking-[0.7px] text-[#6b7d3a]" style={mono}>
                {pageData.answerFirstSummaryLabel}
              </p>
              <p className="mt-3 text-sm leading-6 text-[#4d5145] md:text-[15px]">
                {pageData.answerFirstSummaryBody}
              </p>
            </div>
          </FadeIn>

          <FadeIn className="mt-8">
            <EarlyAccessBanner />
          </FadeIn>

          <FadeIn className="mt-10">
            <section>
              <h2 className="mb-6 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {pageData.comparisonTitle}
              </h2>
              <div className="overflow-hidden rounded-2xl border border-[#d4dbb8] bg-[#fbfcf8]">
                <div className="grid grid-cols-1 border-b border-[#d4dbb8] bg-[#f6f8ef] px-5 py-4 md:grid-cols-[1.1fr_1fr_1fr] md:px-7">
                  <p className="text-[11px] tracking-[0.7px] text-[#6b7d3a]" style={mono}>
                    {pageData.comparisonHeaders.dimension}
                  </p>
                  <p className="mt-2 text-[11px] tracking-[0.7px] text-[#1c1f17] md:mt-0" style={mono}>
                    {pageData.comparisonHeaders.anycap}
                  </p>
                  <p className="mt-2 text-[11px] tracking-[0.7px] text-[#1c1f17] md:mt-0" style={mono}>
                    {pageData.comparisonHeaders.fal}
                  </p>
                </div>
                {pageData.comparisonRows.map((row) => (
                  <div
                    key={row.dimension}
                    className="grid grid-cols-1 gap-4 border-b border-[#d4dbb8] px-5 py-5 last:border-b-0 md:grid-cols-[1.1fr_1fr_1fr] md:gap-6 md:px-7"
                  >
                    <div>
                      <p className="text-sm font-semibold text-[#1c1f17]">{row.dimension}</p>
                    </div>
                    <p className="text-sm leading-6 text-[#4d5145]">{row.anycap}</p>
                    <p className="text-sm leading-6 text-[#4d5145]">{row.fal}</p>
                  </div>
                ))}
              </div>
            </section>
          </FadeIn>

          <FadeIn className="mt-16 md:mt-20">
            <section className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-[#d4dbb8] bg-[#fbfcf8] p-6">
                <p className="mb-3 text-[11px] tracking-[0.7px] text-[#6b7d3a]" style={mono}>
                  {pageData.strengthsTitleLeft}
                </p>
                <div className="space-y-3">
                  {pageData.strengthsLeft.map((item) => (
                    <div key={item} className="border-l-[3px] border-[#6b7d3a] pl-4">
                      <p className="text-sm leading-6 text-[#4d5145]">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-[#d4dbb8] bg-[#fbfcf8] p-6">
                <p className="mb-3 text-[11px] tracking-[0.7px] text-[#6b7d3a]" style={mono}>
                  {pageData.strengthsTitleRight}
                </p>
                <div className="space-y-3">
                  {pageData.strengthsRight.map((item) => (
                    <div key={item} className="border-l-[3px] border-[#1c1f17] pl-4">
                      <p className="text-sm leading-6 text-[#4d5145]">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </FadeIn>

          <FadeIn className="mt-16 md:mt-20">
            <section>
              <h2 className="mb-6 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {pageData.useCasesTitle}
              </h2>
              <div className="grid gap-4 lg:grid-cols-2">
                {pageData.useCases.map((card) => (
                  <div key={card.title} className="rounded-2xl border border-[#d4dbb8] bg-[#fffffc]/70 p-6">
                    <p className="mb-3 text-[11px] tracking-[0.7px] text-[#6b7d3a]" style={mono}>
                      {card.eyebrow}
                    </p>
                    <h3 className="mb-3 text-[16px] font-bold text-[#1c1f17]" style={mono}>
                      {card.title}
                    </h3>
                    <p className="text-sm leading-6 text-[#4d5145]">{card.body}</p>
                  </div>
                ))}
              </div>
            </section>
          </FadeIn>

          <FadeIn className="mt-16 md:mt-20">
            <section>
              <h2 className="mb-6 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {pageData.methodTitle}
              </h2>
              <div className="max-w-[920px] space-y-4">
                {pageData.methodBody.map((paragraph) => (
                  <p key={paragraph} className="text-base leading-7 text-[#4d5145]">
                    {paragraph}
                  </p>
                ))}
              </div>
              <p className="mt-5 text-[12px] leading-5 text-[#7a7e71]" style={mono}>
                {pageData.methodologyNoteLabel}
              </p>
              <p className="mt-2 max-w-[920px] text-sm leading-6 text-[#4d5145]">
                {pageData.methodologyNoteBody}
              </p>
            </section>
          </FadeIn>

          <FadeIn className="mt-16 md:mt-20">
            <section>
              <h2 className="mb-6 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {pageData.sourceTitle}
              </h2>
              <div className="grid gap-4 lg:grid-cols-2">
                {pageData.sourceLinks.map((source) => (
                  <div key={source.label} className="rounded-2xl border border-[#d4dbb8] p-6">
                    <p className="mb-2 text-[11px] tracking-[0.7px] text-[#6b7d3a]" style={mono}>
                      {source.label}
                    </p>
                    <p className="text-sm leading-6 text-[#4d5145]">
                      <SourceLink href={source.href} label={source.label} />
                      {" — "}
                      {source.note}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </FadeIn>

          <FadeIn className="mt-16 md:mt-20">
            <section>
              <h2 className="mb-6 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {pageData.relatedTitle}
              </h2>
              <div className="grid gap-4 lg:grid-cols-2">
                {pageData.relatedPages.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-2xl border border-[#d4dbb8] bg-[#fffffc]/70 p-6 transition-colors hover:border-[#6b7d3a]"
                  >
                    <p className="mb-2 text-[11px] tracking-[0.7px] text-[#6b7d3a]" style={mono}>
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

          <FadeIn className="mt-16 md:mt-20">
            <section>
              <h2 className="mb-6 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {pageData.faqTitle}
              </h2>
              <div className="space-y-4">
                {pageData.faqItems.map((item) => (
                  <div key={item.question} className="rounded-2xl border border-[#d4dbb8] p-6">
                    <h3 className="mb-3 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                      {item.question}
                    </h3>
                    <p className="text-sm leading-6 text-[#4d5145]">{item.answer}</p>
                  </div>
                ))}
              </div>
            </section>
          </FadeIn>

          <FadeIn className="mt-16 md:mt-20">
            <section className="mb-8">
              <div className="grid gap-4 lg:grid-cols-3">
                {pageData.ctas.map((cta) => (
                  <Link
                    key={cta.href}
                    href={cta.href}
                    className={[
                      "rounded-2xl border p-6 transition-colors",
                      cta.variant === "primary"
                        ? "border-[#6b7d3a] bg-[#f7f8ef] hover:border-[#556529]"
                        : "border-[#d4dbb8] bg-[#fffffc]/70 hover:border-[#6b7d3a]",
                    ].join(" ")}
                  >
                    <h3 className="mb-3 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                      {cta.label}
                    </h3>
                    <p className="text-sm leading-6 text-[#4d5145]">
                      {cta.variant === "primary"
                        ? "Instale ou valide o runtime diretamente no seu fluxo de agente."
                        : "Continue explorando o produto e os casos de uso adjacentes."}
                    </p>
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
