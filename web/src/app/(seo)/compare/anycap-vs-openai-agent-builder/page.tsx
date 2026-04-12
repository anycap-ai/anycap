import type { Metadata } from "next";
import Image from "next/image";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { EarlyAccessBanner } from "@/components/landing/EarlyAccessBanner";
import { FadeIn } from "@/components/ui/FadeIn";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { createLocalizedMetadataForPath } from "@/lib/localized-metadata";
import { getRequestLocale } from "@/lib/request-locale";
import { defaultLocale } from "@/lib/site";
import {
  ANYCAP_VS_OPENAI_AGENT_BUILDER_PATH,
  getAnyCapVsOpenAIAgentBuilderMetadata,
  getAnyCapVsOpenAIAgentBuilderPageData,
} from "./content";

export const runtime = "edge";

const CDN_BASE = "https://cdn.anycap.ai/page_resource/compare";
const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

export const metadata: Metadata = createLocalizedMetadataForPath(
  defaultLocale,
  ANYCAP_VS_OPENAI_AGENT_BUILDER_PATH,
  getAnyCapVsOpenAIAgentBuilderMetadata(defaultLocale),
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

export default async function AnycapVsOpenAIAgentBuilderPage() {
  const locale = await getRequestLocale();
  const pageData = getAnyCapVsOpenAIAgentBuilderPageData(locale);

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
              <br />
              {pageData.heroTitle[2]}
            </h1>
            <p className="mt-6 max-w-[840px] text-base leading-7 text-[#4d5145] md:text-lg">
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
            <section className="max-w-[1120px]">
              <div className="overflow-hidden rounded-[28px] border border-[#d4dbb8] bg-[#fbfcf8] shadow-[0_16px_40px_rgba(28,31,23,0.08)]">
                <Image
                  src={`${CDN_BASE}/anycap-vs-openai-agent-builder.png`}
                  alt={pageData.imageAlt}
                  width={1600}
                  height={900}
                  className="h-auto w-full"
                  unoptimized
                  priority
                />
              </div>
              <p className="mt-4 max-w-[900px] text-sm leading-6 text-[#4d5145]">
                {pageData.imageCaption}
              </p>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-8 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {pageData.comparisonTitle}
              </h2>
              <div className="overflow-x-auto rounded-xl border border-[#d4dbb8]">
                <table className="w-full text-left">
                  <thead className="bg-[#f9faf5]">
                    <tr className="border-b border-[#d4dbb8]">
                      <th className="px-5 py-3 pr-6 text-[11px] tracking-[0.5px] text-[#5a5e52]" style={mono}>
                        {pageData.comparisonHeaders.dimension}
                      </th>
                      <th className="px-5 py-3 pr-6 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                        {pageData.comparisonHeaders.anycap}
                      </th>
                      <th className="px-5 py-3 text-[11px] tracking-[0.5px] text-[#5a5e52]" style={mono}>
                        {pageData.comparisonHeaders.builder}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageData.comparisonRows.map((row) => (
                      <tr key={row.dimension} className="border-b border-[#d4dbb8]/50 last:border-b-0">
                        <td className="px-5 py-4 pr-6 text-sm font-medium text-[#1c1f17] align-top">
                          {row.dimension}
                        </td>
                        <td className="px-5 py-4 pr-6 text-sm leading-6 text-[#4d5145] align-top">
                          {row.anycap}
                        </td>
                        <td className="px-5 py-4 text-sm leading-6 text-[#4d5145] align-top">
                          {row.builder}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-4 max-w-[920px] text-[12px] leading-5 text-[#7a7e71]" style={mono}>
                {pageData.comparisonReviewBody}
              </p>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-6 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {pageData.framingTitle}
              </h2>
              <div className="max-w-[900px] space-y-5">
                {pageData.framingBody.map((paragraph) => (
                  <p key={paragraph} className="text-base leading-7 text-[#4d5145]">
                    {paragraph}
                  </p>
                ))}
              </div>
              <div className="mt-8 grid gap-4 md:grid-cols-3 max-w-[1080px]">
                {pageData.framingCards.map((card) => (
                  <div key={card.title} className="rounded-xl border border-[#d4dbb8] p-5">
                    <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                      {card.label}
                    </p>
                    <h3 className="mb-2 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                      {card.title}
                    </h3>
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
            <section className="mt-16 grid gap-6 md:mt-24 md:grid-cols-2">
              <div className="rounded-xl border border-[#d4dbb8] p-6">
                <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                  {pageData.strengthsTitleLeft}
                </p>
                <ul className="space-y-3">
                  {pageData.strengthsLeft.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm leading-6 text-[#4d5145]">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#6b7d3a]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-[#d4dbb8] p-6">
                <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                  {pageData.strengthsTitleRight}
                </p>
                <ul className="space-y-3">
                  {pageData.strengthsRight.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm leading-6 text-[#4d5145]">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#6b7d3a]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-6 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {pageData.useCasesTitle}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 max-w-[1040px]">
                {pageData.useCases.map((item) => (
                  <div key={item.title} className="border border-[#d4dbb8] p-5">
                    <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                      {item.eyebrow}
                    </p>
                    <h3 className="mb-2 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                      {item.title}
                    </h3>
                    <p className="text-sm leading-6 text-[#4d5145]">{item.body}</p>
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
                {pageData.methodTitle}
              </h2>
              <div className="max-w-[940px] space-y-5">
                {pageData.methodBody.map((paragraph) => (
                  <p key={paragraph} className="text-base leading-7 text-[#4d5145]">
                    {paragraph}
                  </p>
                ))}
                <div className="rounded-xl border border-[#d4dbb8] bg-[#f9faf5] p-5">
                  <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                    {pageData.methodologyNoteLabel}
                  </p>
                  <p className="text-sm leading-6 text-[#4d5145]">{pageData.methodologyNoteBody}</p>
                </div>
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-8 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {pageData.sourceTitle}
              </h2>
              <div className="grid gap-4 max-w-[980px] sm:grid-cols-2">
                {pageData.sourceLinks.map((source) => (
                  <div key={source.label} className="border border-[#d4dbb8] p-5">
                    <SourceLink href={source.href} label={source.label} />
                    <p className="mt-3 text-sm leading-6 text-[#4d5145]">{source.note}</p>
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
                {pageData.relatedTitle}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 max-w-[1040px]">
                {pageData.relatedPages.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="border border-[#d4dbb8] p-5 transition-colors hover:border-[#6b7d3a]"
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
            <section className="mt-16 md:mt-24">
              <h2 className="mb-8 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {pageData.faqTitle}
              </h2>
              <div className="space-y-6 max-w-[900px]">
                {pageData.faqItems.map((item) => (
                  <div key={item.question} className="border border-[#d4dbb8] p-5">
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
                {pageData.ctas.map((cta) => (
                  <Link
                    key={cta.href}
                    href={cta.href}
                    className={
                      cta.variant === "primary"
                        ? "inline-block rounded-lg bg-[#6b7d3a] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#f4f5f0] transition-colors hover:bg-[#1c1f17]"
                        : "inline-block rounded-lg border border-[#1c1f17] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] transition-colors hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
                    }
                    style={mono}
                  >
                    {cta.label}
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
