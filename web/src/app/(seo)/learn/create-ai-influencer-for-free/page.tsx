import Image from "next/image";
import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { EarlyAccessBanner } from "@/components/landing/EarlyAccessBanner";
import { LearnProofShowcase } from "@/components/seo/LearnProofShowcase";
import { FadeIn } from "@/components/ui/FadeIn";
import { CommandCodeCard } from "@/components/ui/CommandCodeCard";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { createLocalizedMetadataForPath } from "@/lib/localized-metadata";
import { getRequestLocale } from "@/lib/request-locale";
import { defaultLocale } from "@/lib/site";
import {
  getCreateAIInfluencerForFreeMetadata,
  CREATE_AI_INFLUENCER_FOR_FREE_PATH,
  getCreateAIInfluencerForFreePageData,
} from "@/app/(seo)/learn/create-ai-influencer-for-free/content";

export const runtime = "edge";
export const metadata: Metadata = createLocalizedMetadataForPath(
  defaultLocale,
  CREATE_AI_INFLUENCER_FOR_FREE_PATH,
  getCreateAIInfluencerForFreeMetadata(defaultLocale),
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

export default async function CreateAIInfluencerForFreePage() {
  const locale = await getRequestLocale();
  const content = getCreateAIInfluencerForFreePageData(locale);

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
              {content.hero.titleLine1}
              <br />
              {content.hero.titleLine2}
            </h1>
            <p className="mt-6 max-w-[820px] text-base leading-7 text-[#4d5145] md:text-lg">
              {content.hero.introBeforeLink}{" "}
              <Link
                href="/capabilities/image-generation"
                className="underline decoration-[#d4dbb8] underline-offset-2 transition-colors hover:text-[#6b7d3a] hover:decoration-[#6b7d3a]"
              >
                {content.hero.linkLabel}
              </Link>{" "}
              {content.hero.afterLink}
            </p>
            <div className="mt-8 max-w-[860px] rounded-xl border border-[#d4dbb8] bg-[#f9faf5]/80 p-6">
              <p className="mb-3 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                {content.hero.summaryLabel}
              </p>
              <p className="text-sm leading-6 text-[#4d5145]">{content.hero.summaryText}</p>
            </div>
          </FadeIn>

          <FadeIn className="mt-8">
            <EarlyAccessBanner />
          </FadeIn>

          <FadeIn className="mt-6">
            <section className="max-w-[900px] rounded-[24px] border border-[#bcc99a] bg-[linear-gradient(135deg,rgba(107,125,58,0.10),rgba(255,255,252,0.96))] p-6 shadow-[0_1px_2px_rgba(28,31,23,0.04)]">
              <p className="text-[11px] tracking-[0.7px] text-[#6b7d3a]" style={mono}>
                {content.creditNote.eyebrow}
              </p>
              <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div className="max-w-[700px]">
                  <h2 className="text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                    {content.creditNote.title}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-[#4d5145] md:text-[15px]">
                    {content.creditNote.body}
                  </p>
                </div>
                <Link
                  href={content.creditNote.href}
                  className="inline-flex shrink-0 items-center text-sm text-[#6b7d3a] underline decoration-[#a7b57b] underline-offset-4 transition-colors hover:text-[#4f5d2a] hover:decoration-[#6b7d3a]"
                  style={mono}
                >
                  {content.creditNote.ctaLabel}
                </Link>
              </div>
            </section>
          </FadeIn>

          <FadeIn className="mt-10">
            <div className="overflow-hidden rounded-xl border border-[#d8dcd0] bg-[#fbfcf8]">
              <Image
                src={content.heroImage.src}
                alt={content.hero.imageAlt}
                width={content.heroImage.width}
                height={content.heroImage.height}
                unoptimized
                className="h-auto w-full"
                priority
              />
            </div>
            <p className="mt-4 max-w-[760px] text-sm leading-6 text-[#4d5145]">
              {content.hero.imageCaption}
            </p>
          </FadeIn>

          <FadeIn className="mt-16 md:mt-24">
            <LearnProofShowcase
              eyebrow={content.proof.eyebrow}
              title={content.proof.title}
              intro={content.proof.intro}
              promptLabel={content.proof.promptLabel}
              prompt={content.proof.prompt}
              signalsLabel={content.proof.signalsLabel}
              signals={content.proof.signals}
              caption={content.proof.caption}
              images={content.proof.images}
            />
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24 max-w-[920px]">
              <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                {content.quickAnswer.label}
              </p>
              <h2 className="mt-3 text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                {content.quickAnswer.title}
              </h2>
              <p className="mt-6 text-base leading-7 text-[#4d5145]">{content.quickAnswer.body}</p>
              <div className="mt-8 rounded-[24px] border border-[#d4dbb8] bg-[#f7f8ef]/70 p-6">
                <BulletList items={content.quickAnswer.takeaways} />
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                {content.workflow.label}
              </p>
              <h2 className="mt-3 text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                {content.workflow.title}
              </h2>
              <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                {content.workflow.steps.map((step, index) => (
                  <div
                    key={step.title}
                    className="rounded-[24px] border border-[#d4dbb8] bg-[#fffffc]/70 p-5"
                  >
                    <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                      {content.workflow.stepLabelPrefix} {index + 1}
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
              <div className="grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.25fr)]">
                <div>
                  <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                    {content.costDiscipline.label}
                  </p>
                  <h2 className="mt-3 text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                    {content.costDiscipline.titleLine1}
                    <br />
                    {content.costDiscipline.titleLine2}
                  </h2>
                </div>
                <div className="rounded-[24px] border border-[#d4dbb8] bg-[#f7f8ef]/70 p-6">
                  <BulletList items={content.costDiscipline.rules} />
                </div>
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                {content.validation.label}
              </p>
              <h2 className="mt-3 text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                {content.validation.title}
              </h2>
              <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {content.validation.cards.map((card) => (
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
                {content.modelChoice.label}
              </p>
              <h2 className="mt-3 text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                {content.modelChoice.title}
              </h2>
              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {content.modelChoice.cards.map((card) => (
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
                {content.comparison.label}
              </p>
              <h2 className="mt-3 text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                {content.comparison.title}
              </h2>
              <div className="mt-8 overflow-x-auto rounded-xl border border-[#d4dbb8]">
                <table className="w-full text-left">
                  <thead className="bg-[#f9faf5]">
                    <tr className="border-b border-[#d4dbb8]">
                      <th className="px-5 py-3 text-[11px] tracking-[0.5px] text-[#5a5e52]" style={mono}>
                        {content.comparison.columns.lens}
                      </th>
                      <th className="px-5 py-3 text-[11px] tracking-[0.5px] text-[#5a5e52]" style={mono}>
                        {content.comparison.columns.generic}
                      </th>
                      <th className="px-5 py-3 text-[11px] tracking-[0.5px] text-[#5a5e52]" style={mono}>
                        {content.comparison.columns.workflow}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {content.comparison.rows.map((row) => (
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
                    {content.commands.label}
                  </p>
                  <h2 className="mt-3 text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                    {content.commands.title}
                  </h2>
                </div>
                <Link
                  href="/capabilities/image-generation"
                  className="text-sm text-[#6b7d3a] underline decoration-[#a7b57b] underline-offset-4"
                  style={mono}
                >
                  {content.commands.ctaLabel}
                </Link>
              </div>
              <div className="mt-8 grid gap-4 xl:grid-cols-3">
                {content.commands.examples.map((example) => (
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
                {content.faq.label}
              </p>
              <h2 className="mt-3 text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                {content.faq.title}
              </h2>
              <div className="mt-8 space-y-4">
                {content.faq.items.map((item) => (
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
                {content.nextStep.label}
              </p>
              <h2 className="mt-3 text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                {content.nextStep.title}
              </h2>
              <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {content.nextStep.cards.map((card) => (
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
