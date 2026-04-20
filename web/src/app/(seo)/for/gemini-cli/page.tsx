import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { EarlyAccessBanner } from "@/components/landing/EarlyAccessBanner";
import { FadeIn } from "@/components/ui/FadeIn";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { createLocalizedMetadataForPath } from "@/lib/localized-metadata";
import { getRequestLocale } from "@/lib/request-locale";
import { defaultLocale } from "@/lib/site";
import {
  FOR_GEMINI_CLI_PATH,
  getForGeminiCliMetadata,
  getForGeminiCliPageData,
} from "./content";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

export const metadata: Metadata = createLocalizedMetadataForPath(
  defaultLocale,
  FOR_GEMINI_CLI_PATH,
  getForGeminiCliMetadata(defaultLocale),
);

export default async function ForGeminiCliPage() {
  const locale = await getRequestLocale();
  const content = getForGeminiCliPageData(locale);

  return (
    <>
      <BreadcrumbJsonLd items={content.breadcrumbItems} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(content.articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(content.faqJsonLd) }}
      />

      <article className="px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-[1280px] py-12 md:py-20 lg:py-24">
          <FadeIn>
            <p className="mb-4 text-[11px] tracking-[0.8px] text-[#6b7d3a]" style={mono}>
              {content.hero.eyebrow}
            </p>
            <p className="mb-3 text-[11px] tracking-[0.5px] text-[#5a5e52]" style={mono}>
              {content.hero.lastUpdatedLabel}
            </p>
            <h1
              className="leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(32px, 6vw, 72px)" }}
            >
              {content.hero.titleLine1}
              <br />
              {content.hero.titleLine2}
            </h1>
            <p className="mt-6 max-w-[780px] text-base leading-7 text-[#4d5145] md:text-lg">
              {content.hero.intro}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href={content.hero.ctaPrimaryHref}
                className="inline-block rounded-lg bg-[#6b7d3a] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#f4f5f0] transition-colors hover:bg-[#1c1f17]"
                style={mono}
              >
                {content.hero.ctaPrimary}
              </Link>
              <Link
                href={content.hero.ctaSecondaryHref}
                className="inline-block rounded-lg border border-[#1c1f17] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] transition-colors hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
                style={mono}
              >
                {content.hero.ctaSecondary}
              </Link>
            </div>
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
                {content.gapTitle}
              </h2>
              <p className="mb-8 max-w-[760px] text-sm leading-6 text-[#4d5145] md:text-[15px]">
                {content.gapIntro}
              </p>
              <div className="overflow-hidden rounded-2xl border border-[#d4dbb8] bg-[#fbfcf8]">
                <div className="grid grid-cols-1 border-b border-[#d4dbb8] bg-[#f6f8ef] px-5 py-4 md:grid-cols-[1fr_1fr_1fr] md:px-7">
                  <p className="text-[11px] tracking-[0.7px] text-[#6b7d3a]" style={mono}>
                    {content.gapHeaders.capability}
                  </p>
                  <p className="mt-2 text-[11px] tracking-[0.7px] text-[#5a5e52] md:mt-0" style={mono}>
                    {content.gapHeaders.gemini}
                  </p>
                  <p className="mt-2 text-[11px] tracking-[0.7px] text-[#1c1f17] md:mt-0" style={mono}>
                    {content.gapHeaders.anycap}
                  </p>
                </div>
                {content.gapRows.map((row) => (
                  <div
                    key={row.capability}
                    className="grid grid-cols-1 gap-2 border-b border-[#d4dbb8] px-5 py-5 last:border-b-0 md:grid-cols-[1fr_1fr_1fr] md:gap-6 md:px-7"
                  >
                    <p className="text-sm font-semibold text-[#1c1f17]">{row.capability}</p>
                    <p className="text-sm leading-6 text-[#7a7e71]">{row.geminiGap}</p>
                    <p className="text-sm leading-6 text-[#4d5145]">{row.anycapValue}</p>
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
              <h2 className="mb-4 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {content.installTitle}
              </h2>
              <p className="mb-8 max-w-[760px] text-sm leading-6 text-[#4d5145] md:text-[15px]">
                {content.installIntro}
              </p>
              <div className="space-y-6">
                {content.installSteps.map((step, index) => (
                  <div key={step.title} className="grid gap-4 md:grid-cols-[32px_1fr]">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#6b7d3a] bg-[#f7f8ef]">
                      <span className="text-[12px] font-bold text-[#6b7d3a]" style={mono}>
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <h3 className="mb-3 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                        {step.title}
                      </h3>
                      <div className="max-w-[820px] bg-[#1c1f17] px-5 py-4">
                        <p className="text-[13px] text-[#d4e0a4]" style={mono}>
                          {step.code}
                        </p>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-[#7a7e71]">{step.note}</p>
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
              <h2 className="mb-4 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {content.commandsTitle}
              </h2>
              <p className="mb-8 max-w-[760px] text-sm leading-6 text-[#4d5145] md:text-[15px]">
                {content.commandsIntro}
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                {content.commandCards.map((card) => (
                  <div key={card.title} className="rounded-2xl border border-[#d4dbb8] bg-[#fbfcf8] p-5">
                    <p className="mb-2 text-[11px] tracking-[0.7px] text-[#6b7d3a]" style={mono}>
                      {card.eyebrow}
                    </p>
                    <h3 className="mb-3 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                      {card.title}
                    </h3>
                    <div className="mb-3 bg-[#1c1f17] px-4 py-3">
                      <p className="text-[12px] text-[#d4e0a4]" style={mono}>
                        {card.command}
                      </p>
                    </div>
                    <p className="text-sm leading-6 text-[#4d5145]">{card.description}</p>
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
                {content.patternTitle}
              </h2>
              <div className="max-w-[820px] bg-[#1c1f17] px-6 py-5 md:px-8 md:py-6">
                {content.patternSteps.map((step) => (
                  <p key={step} className="mb-3 text-[13px] text-[#d4e0a4]" style={mono}>
                    {step}
                  </p>
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
                {content.whyTitle}
              </h2>
              <div className="max-w-[780px] space-y-6">
                {content.whyBody.map((paragraph) => (
                  <p key={paragraph} className="text-base leading-7 text-[#4d5145]">
                    {paragraph}
                  </p>
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
                {content.faqTitle}
              </h2>
              <div className="space-y-4">
                {content.faqItems.map((item) => (
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

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24 mb-8">
              <h2 className="mb-6 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {content.relatedTitle}
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {content.relatedLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-2xl border border-[#d4dbb8] bg-[#fffffc]/70 p-5 transition-colors hover:border-[#6b7d3a]"
                  >
                    <h3 className="mb-2 text-[14px] font-bold text-[#1c1f17]" style={mono}>
                      {item.label}
                    </h3>
                    <p className="text-sm leading-6 text-[#4d5145]">{item.description}</p>
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
