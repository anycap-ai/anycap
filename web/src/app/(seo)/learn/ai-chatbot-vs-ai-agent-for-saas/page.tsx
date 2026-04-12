import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { FadeIn } from "@/components/ui/FadeIn";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { createLocalizedMetadataForPath } from "@/lib/localized-metadata";
import { getRequestLocale } from "@/lib/request-locale";
import { defaultLocale } from "@/lib/site";
import {
  AI_CHATBOT_VS_AI_AGENT_FOR_SAAS_PATH,
  getAIChatbotVsAIAgentForSaaSMetadata,
  getAIChatbotVsAIAgentForSaaSPageData,
} from "./content";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

export const metadata: Metadata = createLocalizedMetadataForPath(
  defaultLocale,
  AI_CHATBOT_VS_AI_AGENT_FOR_SAAS_PATH,
  getAIChatbotVsAIAgentForSaaSMetadata(defaultLocale),
);

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

export default async function AIChatbotVsAIAgentForSaaSPage() {
  const locale = await getRequestLocale();
  const content = getAIChatbotVsAIAgentForSaaSPageData(locale);

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
              style={{ ...pixel, fontSize: "clamp(30px, 5.4vw, 68px)" }}
            >
              {content.heroTitle[0]}
              <br />
              {content.heroTitle[1]}
              <br />
              {content.heroTitle[2]}
            </h1>
            <p className="mt-6 max-w-[860px] text-base leading-7 text-[#4d5145] md:text-lg">
              {content.heroIntro}
            </p>
          </FadeIn>

          <FadeIn className="mt-10">
            <section className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.9fr)]">
              <div className="rounded-[28px] border border-[#d4dbb8] bg-[#fffffc]/80 p-8 md:p-10">
                <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                  {content.quickAnswerLabel}
                </p>
                <h2 className="mt-4 text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                  {content.quickAnswerTitle}
                </h2>
                <p className="mt-5 max-w-[740px] text-sm leading-6 text-[#4d5145] md:text-[15px]">
                  {content.quickAnswerBody}
                </p>
              </div>

              <div className="rounded-[28px] border border-[#d4dbb8] bg-[#f7f8ef]/80 p-6 md:p-8">
                <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                  {content.quickTakeawaysLabel}
                </p>
                <div className="mt-5">
                  <BulletList items={content.quickTakeaways} />
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
                {content.comparisonLabel}
              </p>
              <h2 className="mt-3 max-w-[860px] text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                {content.comparisonTitle}
              </h2>
              <p className="mt-5 max-w-[900px] text-sm leading-6 text-[#4d5145] md:text-[15px]">
                {content.comparisonIntro}
              </p>
              <div className="mt-8 overflow-x-auto rounded-xl border border-[#d4dbb8]">
                <table className="w-full text-left">
                  <thead className="bg-[#f9faf5]">
                    <tr className="border-b border-[#d4dbb8]">
                      <th className="px-5 py-3 pr-6 text-[11px] tracking-[0.5px] text-[#5a5e52]" style={mono}>
                        {content.comparisonHeaders.dimension}
                      </th>
                      <th className="px-5 py-3 pr-6 text-[11px] tracking-[0.5px] text-[#5a5e52]" style={mono}>
                        {content.comparisonHeaders.chatbot}
                      </th>
                      <th className="px-5 py-3 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                        {content.comparisonHeaders.agent}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {content.comparisonRows.map((row) => (
                      <tr key={row.dimension} className="border-b border-[#d4dbb8]/50 last:border-b-0">
                        <td className="px-5 py-4 pr-6 align-top text-sm font-medium text-[#1c1f17]">
                          {row.dimension}
                        </td>
                        <td className="px-5 py-4 pr-6 align-top text-sm leading-6 text-[#4d5145]">
                          {row.chatbot}
                        </td>
                        <td className="px-5 py-4 align-top text-sm leading-6 text-[#4d5145]">
                          {row.agent}
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
              <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                {content.chatbotLabel}
              </p>
              <h2 className="mt-3 max-w-[860px] text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                {content.chatbotTitle}
              </h2>
              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {content.chatbotCards.map((card) => (
                  <div key={card.title} className="rounded-[24px] border border-[#d4dbb8] bg-[#fffffc]/70 p-6">
                    <h3 className="text-[18px] leading-7 text-[#1c1f17]" style={mono}>
                      {card.title}
                    </h3>
                    <p className="mt-4 text-sm leading-6 text-[#4d5145] md:text-[15px]">
                      {card.body}
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
              <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                {content.triggerLabel}
              </p>
              <h2 className="mt-3 max-w-[860px] text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                {content.triggerTitle}
              </h2>
              <p className="mt-5 max-w-[840px] text-sm leading-6 text-[#4d5145] md:text-[15px]">
                {content.triggerIntro}
              </p>
              <div className="mt-8 grid gap-4 md:grid-cols-2">
                {content.triggerCards.map((card) => (
                  <div key={card.title} className="rounded-[24px] border border-[#d4dbb8] bg-[#f7f8ef]/70 p-6">
                    <h3 className="text-[18px] leading-7 text-[#1c1f17]" style={mono}>
                      {card.title}
                    </h3>
                    <p className="mt-4 text-sm leading-6 text-[#4d5145] md:text-[15px]">
                      {card.body}
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
              <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                {content.capabilityLabel}
              </p>
              <h2 className="mt-3 max-w-[860px] text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                {content.capabilityTitle}
              </h2>
              <p className="mt-5 max-w-[840px] text-sm leading-6 text-[#4d5145] md:text-[15px]">
                {content.capabilityIntro}
              </p>
              <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                {content.capabilityCards.map((card) => (
                  <Link
                    key={card.href}
                    href={card.href}
                    className="rounded-[24px] border border-[#d4dbb8] bg-[#fffffc]/70 p-5 transition-colors hover:border-[#6b7d3a]"
                  >
                    <h3 className="text-base text-[#1c1f17]" style={mono}>
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
              <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                {content.architectureLabel}
              </p>
              <h2 className="mt-3 max-w-[860px] text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                {content.architectureTitle}
              </h2>
              <div className="mt-8 grid gap-4 lg:grid-cols-3">
                {content.architectureCards.map((card) => (
                  <div key={card.title} className="rounded-[24px] border border-[#d4dbb8] bg-[#fffffc]/70 p-6">
                    <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                      {card.label}
                    </p>
                    <h3 className="mt-3 text-[18px] leading-7 text-[#1c1f17]" style={mono}>
                      {card.title}
                    </h3>
                    <p className="mt-4 text-sm leading-6 text-[#4d5145] md:text-[15px]">
                      {card.body}
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
              <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                {content.selectionLabel}
              </p>
              <h2 className="mt-3 max-w-[860px] text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                {content.selectionTitle}
              </h2>
              <div className="mt-8 space-y-4">
                {content.selectionRows.map((row) => (
                  <div key={row.question} className="rounded-[24px] border border-[#d4dbb8] bg-[#fffffc]/70 p-6">
                    <h3 className="text-base text-[#1c1f17]" style={mono}>
                      {row.question}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-[#4d5145] md:text-[15px]">
                      {row.answer}
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
              <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                {content.nextMoveLabel}
              </p>
              <h2 className="mt-3 max-w-[860px] text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                {content.nextMoveTitle}
              </h2>
              <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                {content.nextMoveCards.map((card) => (
                  <Link
                    key={card.href}
                    href={card.href}
                    className="rounded-[24px] border border-[#d4dbb8] bg-[#f7f8ef]/70 p-5 transition-colors hover:border-[#6b7d3a]"
                  >
                    <h3 className="text-base text-[#1c1f17]" style={mono}>
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
              <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                {content.faqLabel}
              </p>
              <h2 className="mt-3 text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                {content.faqTitle}
              </h2>
              <div className="mt-8 space-y-4">
                {content.faqItems.map((item) => (
                  <div key={item.question} className="rounded-[24px] border border-[#d4dbb8] bg-[#fffffc]/70 p-6">
                    <h3 className="text-base text-[#1c1f17]" style={mono}>
                      {item.question}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-[#4d5145] md:text-[15px]">
                      {item.answer}
                    </p>
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
