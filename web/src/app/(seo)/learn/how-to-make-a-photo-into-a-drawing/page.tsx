import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { EarlyAccessBanner } from "@/components/landing/EarlyAccessBanner";
import { FadeIn } from "@/components/ui/FadeIn";
import { CommandCodeCard } from "@/components/ui/CommandCodeCard";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { createLocalizedMetadataForPath } from "@/lib/localized-metadata";
import { defaultLocale } from "@/lib/site";
import { getRequestLocale } from "@/lib/request-locale";
import {
  getPhotoToDrawingMetadata,
  HOW_TO_MAKE_A_PHOTO_INTO_A_DRAWING_PATH,
  getPhotoToDrawingPageData,
} from "@/app/(seo)/learn/how-to-make-a-photo-into-a-drawing/content";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

export const metadata: Metadata = createLocalizedMetadataForPath(
  defaultLocale,
  HOW_TO_MAKE_A_PHOTO_INTO_A_DRAWING_PATH,
  getPhotoToDrawingMetadata(defaultLocale),
);

export default async function PhotoToDrawingPage() {
  const locale = await getRequestLocale();
  const content = getPhotoToDrawingPageData(locale);

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
            <p className="mt-6 max-w-[840px] text-base leading-7 text-[#4d5145] md:text-lg">
              {content.hero.intro}
            </p>
            <div className="mt-8 max-w-[900px] rounded-xl border border-[#d4dbb8] bg-[#f9faf5]/80 p-6">
              <p className="mb-3 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                {content.hero.summaryLabel}
              </p>
              <p className="text-sm leading-6 text-[#4d5145]">{content.hero.summaryText}</p>
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
              <h2 className="mb-8 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {content.styleFamiliesTitle}
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {content.styleFamilies.map((card) => (
                  <div key={card.title} className="rounded-xl border border-[#d4dbb8] bg-[#fffffc]/70 p-6">
                    <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
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

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-8 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {content.workflowTitle}
              </h2>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                {content.workflowSteps.map((step, index) => (
                  <div key={step.title} className="rounded-xl border border-[#d4dbb8] bg-[#fffffc]/70 p-5">
                    <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                      Step {index + 1}
                    </p>
                    <h3 className="text-[16px] leading-6 text-[#1c1f17]" style={mono}>
                      {step.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-[#4d5145]">{step.body}</p>
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
                {content.comparisonTitle}
              </h2>
              <div className="overflow-x-auto rounded-xl border border-[#d4dbb8]">
                <table className="w-full text-left">
                  <thead className="bg-[#f9faf5]">
                    <tr className="border-b border-[#d4dbb8]">
                      <th className="px-5 py-3 text-[11px] tracking-[0.5px] text-[#5a5e52]" style={mono}>
                        Lens
                      </th>
                      <th className="px-5 py-3 text-[11px] tracking-[0.5px] text-[#5a5e52]" style={mono}>
                        Shallow default
                      </th>
                      <th className="px-5 py-3 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                        AnyCap workflow
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {content.comparisonRows.map((row) => (
                      <tr key={row.lens} className="border-b border-[#d4dbb8]/70 align-top last:border-b-0">
                        <td className="px-5 py-4 text-sm font-medium text-[#1c1f17]">{row.lens}</td>
                        <td className="px-5 py-4 text-sm leading-6 text-[#4d5145]">{row.shallow}</td>
                        <td className="px-5 py-4 text-sm leading-6 text-[#4d5145]">{row.workflow}</td>
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
                {content.modelChoiceTitle}
              </h2>
              <div className="grid gap-4 md:grid-cols-3">
                {content.modelCards.map((card) => (
                  <Link
                    key={card.href}
                    href={card.href}
                    className="rounded-xl border border-[#d4dbb8] bg-[#fffffc]/70 p-6 transition-colors hover:border-[#6b7d3a]"
                  >
                    <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                      {card.label}
                    </p>
                    <h3 className="mt-3 text-[18px] leading-7 text-[#1c1f17]" style={pixel}>
                      {card.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-[#4d5145]">{card.body}</p>
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
              <h2 className="mb-6 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {content.cliTitle}
              </h2>
              <div className="grid gap-4 xl:grid-cols-3">
                {content.cliExamples.map((example) => (
                  <CommandCodeCard key={example.title} title={example.title} code={example.code} />
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
              <div className="space-y-4 max-w-[920px]">
                {content.faqItems.map((item) => (
                  <div key={item.question} className="rounded-xl border border-[#d4dbb8] bg-[#fffffc]/70 p-6">
                    <h3 className="text-[16px] font-bold text-[#1c1f17]" style={mono}>
                      {item.question}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-[#4d5145]">{item.answer}</p>
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
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {content.nextStepCards.map((card) => (
                  <Link
                    key={card.href}
                    href={card.href}
                    className="rounded-xl border border-[#d4dbb8] bg-[#fffffc]/70 p-5 transition-colors hover:border-[#6b7d3a]"
                  >
                    <h3 className="text-[16px] leading-7 text-[#1c1f17]" style={mono}>
                      {card.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-[#4d5145]">{card.body}</p>
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
