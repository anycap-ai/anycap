import Image from "next/image";
import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { EarlyAccessBanner } from "@/components/landing/EarlyAccessBanner";
import { FadeIn } from "@/components/ui/FadeIn";
import { CommandCodeCard } from "@/components/ui/CommandCodeCard";
import { DemoVideo } from "@/components/ui/DemoVideo";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { createLocalizedMetadataForPath } from "@/lib/localized-metadata";
import { getRequestLocale } from "@/lib/request-locale";
import { defaultLocale } from "@/lib/site";
import {
  getHowToMakeAIInfluencerVideosMetadata,
  HOW_TO_MAKE_AI_INFLUENCER_VIDEOS_PATH,
  getHowToMakeAIInfluencerVideosPageData,
} from "@/app/(seo)/learn/how-to-make-ai-influencer-videos/content";

export const runtime = "edge";
export const metadata: Metadata = createLocalizedMetadataForPath(
  defaultLocale,
  HOW_TO_MAKE_AI_INFLUENCER_VIDEOS_PATH,
  getHowToMakeAIInfluencerVideosMetadata(defaultLocale),
);

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

function BulletList({ items }: { items: readonly string[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-sm leading-6 text-[#4d5145] md:text-[15px]">
          <span className="mt-[8px] h-1.5 w-1.5 rounded-full bg-[#6b7d3a]" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default async function HowToMakeAIInfluencerVideosPage() {
  const locale = await getRequestLocale();
  const content = getHowToMakeAIInfluencerVideosPageData(locale);

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
              {content.heroTitleLine1}
              <br />
              {content.heroTitleLine2}
            </h1>
            <p className="mt-6 max-w-[820px] text-base leading-7 text-[#4d5145] md:text-lg">
              {content.introBeforeLink}{" "}
              <Link
                href="/capabilities/video-generation"
                className="underline decoration-[#d4dbb8] underline-offset-2 transition-colors hover:text-[#6b7d3a] hover:decoration-[#6b7d3a]"
              >
                {content.introLinkLabel}
              </Link>
              {content.introAfterLink}
            </p>
            <div className="mt-8 max-w-[860px] rounded-xl border border-[#d4dbb8] bg-[#f9faf5]/80 p-6">
              <p className="mb-3 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                {content.answerSummaryLabel}
              </p>
              <p className="text-sm leading-6 text-[#4d5145]">
                {content.answerSummaryText}
              </p>
            </div>
          </FadeIn>

          <FadeIn className="mt-8">
            <EarlyAccessBanner />
          </FadeIn>

          <FadeIn className="mt-16 md:mt-24">
            <section>
              <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                {content.generatedProofLabel}
              </p>
              <h2 className="mt-3 text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                {content.generatedProofTitle}
              </h2>
              <p className="mt-4 max-w-[840px] text-base leading-7 text-[#4d5145]">
                {content.generatedProofBody}
              </p>

              <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1.6fr)_minmax(300px,0.9fr)] xl:items-start">
                <div className="grid gap-6 md:grid-cols-2">
                  <figure className="flex h-full flex-col overflow-hidden rounded-[24px] border border-[#d4dbb8] bg-[#fffffc]/80">
                    <div className="border-b border-[#d4dbb8] bg-[#f7f8ef] px-5 py-3">
                      <p className="text-[11px] tracking-[0.5px] text-[#5a5e52]" style={mono}>
                        {content.sourceStillLabel}
                      </p>
                    </div>
                    <div className="flex flex-1 flex-col bg-[#f7f8ef] p-4">
                      <Image
                        src={content.sourceStill.src}
                        alt={content.sourceStill.alt}
                        width={content.sourceStill.width}
                        height={content.sourceStill.height}
                        className="h-auto w-full rounded-[18px]"
                        unoptimized
                        priority
                      />
                    </div>
                  </figure>

                  <figure className="flex h-full flex-col overflow-hidden rounded-[24px] border border-[#d4dbb8] bg-[#fffffc]/80">
                    <div className="border-b border-[#d4dbb8] bg-[#f7f8ef] px-5 py-3">
                      <p className="text-[11px] tracking-[0.5px] text-[#5a5e52]" style={mono}>
                        {content.generatedVideoLabel}
                      </p>
                    </div>
                    <div className="flex flex-1 flex-col bg-[#f7f8ef] p-4">
                      <DemoVideo
                        src={content.productDemoVideo.src}
                        title={content.productDemoVideo.title}
                        poster={content.productDemoVideo.poster}
                        description={content.productDemoVideo.description}
                        autoLoop
                        aspectRatio="9 / 16"
                      />
                    </div>
                  </figure>
                </div>

                <div className="overflow-hidden rounded-[24px] border border-[#d4dbb8] bg-[#f9faf5]/90">
                  <div className="border-b border-[#d4dbb8] bg-[#f7f8ef] px-5 py-3">
                    <p className="text-[11px] tracking-[0.5px] text-[#5a5e52]" style={mono}>
                      {content.motionPromptLabel}
                    </p>
                  </div>
                  <div className="p-6">
                    <div className="rounded-xl bg-[#1c1f17] px-4 py-4">
                      <p className="text-[13px] leading-6 break-words text-[#d4e0a4]" style={mono}>
                        {content.proofPrompt}
                      </p>
                    </div>

                    <p className="mt-6 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                      {content.whyProofMattersLabel}
                    </p>
                    <ul className="mt-3 space-y-3">
                      {content.whyProofSignals.map((signal) => (
                        <li key={signal} className="flex items-start gap-3 text-sm leading-6 text-[#4d5145]">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#6b7d3a]" />
                          {signal}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <p className="mt-4 max-w-[900px] text-sm leading-6 text-[#4d5145]">
                {content.proofSectionAfterText}
              </p>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24 max-w-[920px]">
              <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                {content.quickAnswerLabel}
              </p>
              <h2 className="mt-3 text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                {content.quickAnswerTitle}
              </h2>
              <p className="mt-6 text-base leading-7 text-[#4d5145]">
                {content.quickAnswerBody}
              </p>
              <div className="mt-8 rounded-[24px] border border-[#d4dbb8] bg-[#f7f8ef]/70 p-6">
                <BulletList items={content.quickTakeaways} />
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                {content.workflowLabel}
              </p>
              <h2 className="mt-3 text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                {content.workflowTitle}
              </h2>
              <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                {content.workflowSteps.map((step, index) => (
                  <div
                    key={step.title}
                    className="rounded-[24px] border border-[#d4dbb8] bg-[#fffffc]/70 p-5"
                  >
                    <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                      {content.stepLabelPrefix} {index + 1}
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
              <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                {content.validationLabel}
              </p>
              <h2 className="mt-3 text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                {content.validationTitle}
              </h2>
              <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {content.validationCards.map((card) => (
                  <div
                    key={card.title}
                    className="rounded-[24px] border border-[#d4dbb8] bg-[#fffffc]/70 p-5"
                  >
                    <h3 className="text-[16px] leading-6 text-[#1c1f17]" style={mono}>
                      {card.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-[#4d5145]">{card.body}</p>
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
              <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                {content.modelChoiceLabel}
              </p>
              <h2 className="mt-3 text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                {content.modelChoiceTitle}
              </h2>
              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {content.modelCards.map((card) => (
                  <Link
                    key={card.href}
                    href={card.href}
                    className="rounded-[24px] border border-[#d4dbb8] bg-[#fffffc]/70 p-6 transition-colors hover:border-[#6b7d3a]"
                  >
                    <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                      {card.label}
                    </p>
                    <h3 className="mt-3 text-[20px] leading-7 text-[#1c1f17]" style={pixel}>
                      {card.title}
                    </h3>
                    <p className="mt-4 text-sm leading-6 text-[#4d5145]">{card.body}</p>
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
              <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                {content.comparisonLabel}
              </p>
              <h2 className="mt-3 text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                {content.comparisonTitle}
              </h2>
              <div className="mt-8 overflow-x-auto rounded-xl border border-[#d4dbb8]">
                <table className="w-full text-left">
                  <thead className="bg-[#f9faf5]">
                    <tr className="border-b border-[#d4dbb8]">
                      <th className="px-5 py-3 text-[11px] tracking-[0.5px] text-[#5a5e52]" style={mono}>
                        {content.comparisonColumns.lens}
                      </th>
                      <th className="px-5 py-3 text-[11px] tracking-[0.5px] text-[#5a5e52]" style={mono}>
                        {content.comparisonColumns.generic}
                      </th>
                      <th className="px-5 py-3 text-[11px] tracking-[0.5px] text-[#5a5e52]" style={mono}>
                        {content.comparisonColumns.workflow}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {content.comparisonRows.map((row) => (
                      <tr key={row.lens} className="border-b border-[#d4dbb8]/70 align-top last:border-b-0">
                        <td className="px-5 py-4 text-sm text-[#1c1f17]" style={mono}>
                          {row.lens}
                        </td>
                        <td className="px-5 py-4 text-sm leading-6 text-[#4d5145]">{row.generic}</td>
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
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                    {content.commandExamplesLabel}
                  </p>
                  <h2 className="mt-3 text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                    {content.commandExamplesTitle}
                  </h2>
                </div>
                <Link
                  href="/capabilities/video-generation"
                  className="text-sm text-[#6b7d3a] underline decoration-[#a7b57b] underline-offset-4"
                  style={mono}
                >
                  {content.commandExamplesCta}
                </Link>
              </div>
              <div className="mt-8 grid gap-4 xl:grid-cols-3">
                {content.codeExamples.map((example) => (
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
              <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                {content.faqLabel}
              </p>
              <h2 className="mt-3 text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                {content.faqTitle}
              </h2>
              <div className="mt-8 space-y-4">
                {content.faqItems.map((item) => (
                  <div
                    key={item.question}
                    className="rounded-[24px] border border-[#d4dbb8] bg-[#fffffc]/70 p-6"
                  >
                    <h3 className="text-[16px] leading-6 text-[#1c1f17]" style={mono}>
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
            <section className="mt-16 md:mt-24">
              <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                {content.nextStepLabel}
              </p>
              <h2 className="mt-3 text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                {content.nextStepTitle}
              </h2>
              <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {content.nextMoveCards.map((card) => (
                  <Link
                    key={card.href}
                    href={card.href}
                    className="rounded-[24px] border border-[#d4dbb8] bg-[#fffffc]/70 p-6 transition-colors hover:border-[#6b7d3a]"
                  >
                    <h3 className="text-[18px] leading-7 text-[#1c1f17]" style={pixel}>
                      {card.title}
                    </h3>
                    <p className="mt-4 text-sm leading-6 text-[#4d5145]">{card.body}</p>
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
