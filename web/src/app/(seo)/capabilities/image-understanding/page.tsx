import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { EarlyAccessBanner } from "@/components/landing/EarlyAccessBanner";
import { ImageReadDemo } from "@/components/landing/ImageReadDemo";
import { FadeIn } from "@/components/ui/FadeIn";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { createLocalizedMetadataForPath } from "@/lib/localized-metadata";
import { defaultLocale } from "@/lib/site";
import { getRequestLocale } from "@/lib/request-locale";
import {
  getImageUnderstandingMetadata,
  IMAGE_UNDERSTANDING_PATH,
  getImageUnderstandingPageData,
} from "@/app/(seo)/capabilities/image-understanding/content";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

export const metadata: Metadata = createLocalizedMetadataForPath(
  defaultLocale,
  IMAGE_UNDERSTANDING_PATH,
  getImageUnderstandingMetadata(defaultLocale),
);

export default async function ImageUnderstandingPage() {
  const locale = await getRequestLocale();
  const content = getImageUnderstandingPageData(locale);

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
              {content.eyebrow}
            </p>
            <p className="mb-3 text-[11px] tracking-[0.5px] text-[#5a5e52]" style={mono}>
              {content.lastUpdatedLabel}
            </p>
            <h1
              className="leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(32px, 6vw, 72px)" }}
            >
              {content.hero.title}
            </h1>
            <p className="mt-6 max-w-[760px] text-base leading-7 text-[#4d5145] md:text-lg">
              {content.hero.intro}
            </p>
            <div className="mt-8 max-w-[800px] rounded-xl border border-[#d4dbb8] bg-[#f9faf5]/80 p-6">
              <p className="mb-1 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                {content.namingNote.label}
              </p>
              <p className="text-sm leading-6 text-[#4d5145]">{content.namingNote.text}</p>
            </div>
            <div className="mt-8 max-w-[860px] border border-[#d4dbb8] bg-[#f9faf5]/80 p-6">
              <p className="mb-3 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                {content.hero.summaryLabel}
              </p>
              <p className="text-sm leading-6 text-[#4d5145]">{content.hero.summaryText}</p>
            </div>
          </FadeIn>

          <FadeIn className="mt-8">
            <EarlyAccessBanner />
          </FadeIn>

          <FadeIn className="mt-10">
            <ImageReadDemo />
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-6 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {content.usageTitle}
              </h2>
              <div className="space-y-6 max-w-[820px]">
                {content.usageExamples.map((example) => (
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
                {content.useCasesTitle}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 max-w-[920px]">
                {content.useCases.map((useCase) => (
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
                {content.relatedTitle}
              </h2>
              <div className="grid gap-4 sm:grid-cols-3 max-w-[1100px]">
                {content.relatedCards.map((card) => (
                  <Link
                    key={card.title}
                    href={card.href}
                    className="rounded-xl border border-[#d4dbb8] p-5 transition-colors hover:border-[#6b7d3a]"
                  >
                    <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                      {card.eyebrow}
                    </p>
                    <h3 className="mb-2 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                      {card.title}
                    </h3>
                    <p className="text-sm leading-6 text-[#4d5145]">{card.description}</p>
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
              <div className="space-y-6 max-w-[860px]">
                {content.faqItems.map((item) => (
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
              <h2 className="mb-6 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {content.nextStepsTitle}
              </h2>
              <div className="flex flex-wrap gap-4">
                {content.nextActions.map((action) => {
                  const isExternal = "external" in action && action.external;
                  const isPrimary = "primary" in action && action.primary;

                  return isExternal ? (
                    <a
                      key={action.label}
                      href={action.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-block rounded-lg px-8 py-3 text-[11px] font-bold tracking-[0.8px] transition-colors ${
                        isPrimary
                          ? "bg-[#6b7d3a] text-[#f4f5f0] hover:bg-[#1c1f17]"
                          : "border border-[#1c1f17] text-[#1c1f17] hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
                      }`}
                      style={mono}
                    >
                      {action.label}
                    </a>
                  ) : (
                    <Link
                      key={action.label}
                      href={action.href}
                      className={`inline-block rounded-lg px-8 py-3 text-[11px] font-bold tracking-[0.8px] transition-colors ${
                        isPrimary
                          ? "bg-[#6b7d3a] text-[#f4f5f0] hover:bg-[#1c1f17]"
                          : "border border-[#1c1f17] text-[#1c1f17] hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
                      }`}
                      style={mono}
                    >
                      {action.label}
                    </Link>
                  );
                })}
              </div>
            </section>
          </FadeIn>
        </div>
      </article>
    </>
  );
}
