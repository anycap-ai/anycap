import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { CapabilityGapTable } from "@/components/landing/CapabilityGapTable";
import { EarlyAccessBanner } from "@/components/landing/EarlyAccessBanner";
import { DemoVideo } from "@/components/ui/DemoVideo";
import { FadeIn } from "@/components/ui/FadeIn";
import { createLocalizedMetadataForPath } from "@/lib/localized-metadata";
import { defaultLocale } from "@/lib/site";
import { getRequestLocale } from "@/lib/request-locale";
import {
  FOR_CURSOR_PATH,
  getForCursorMetadata,
  getForCursorPageData,
} from "./content";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;
const CDN_BASE = "https://cdn.anycap.ai/page_resource/for_agent";
const CURSOR_POSTER_URL = "https://cdn.anycap.ai/page_resource/seo-images/cursor-capability-flow.png";

export const metadata: Metadata = createLocalizedMetadataForPath(
  defaultLocale,
  FOR_CURSOR_PATH,
  getForCursorMetadata(defaultLocale),
);

export default async function ForCursorPage() {
  const locale = await getRequestLocale();
  const content = getForCursorPageData(locale);
  const [seedreamCard, nanoCard, veoCard] = content.modelSelection.cards;

  return (
    <>
      <BreadcrumbJsonLd items={content.breadcrumbItems} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(content.integrationGuideJsonLd) }}
      />
      {content.faqJsonLd['@type'] ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(content.faqJsonLd) }}
        />
      ) : null}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(content.videoObjectJsonLd) }}
      />

      <article className="px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-[1280px] py-12 md:py-20 lg:py-24">
          <FadeIn>
            <p className="mb-4 text-[11px] tracking-[0.8px] text-[#6b7d3a]" style={mono}>
              {content.pageEyebrow}
            </p>
            <p className="mb-3 text-[11px] tracking-[0.5px] text-[#5a5e52]" style={mono}>
              {content.lastUpdatedLabel}
            </p>
            <h1
              className="max-w-[960px] leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(32px, 5vw, 64px)", textWrap: "balance" } as CSSProperties}
            >
              {content.hero.titleLine1}
              <br />
              {content.hero.titleLine2}
            </h1>

            <div className="mt-8">
              <DemoVideo
                src={`${CDN_BASE}/for_cursor.mp4`}
                poster={CURSOR_POSTER_URL}
                title={content.demo.title}
                autoLoop
              />
            </div>
            <p className="mt-3 max-w-[780px] text-sm leading-6 text-[#5a5e52]">
              {content.hero.videoDescription}
            </p>

            <p className="mt-6 max-w-[780px] text-base leading-7 text-[#4d5145] md:text-lg">
              <a
                href="https://cursor.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-[#d4dbb8] underline-offset-2 transition-colors hover:text-[#6b7d3a] hover:decoration-[#6b7d3a]"
              >
                Cursor
              </a>
              {content.hero.cursorIntroSuffix}
            </p>
            <p className="mt-4 max-w-[780px] text-base leading-7 text-[#4d5145] md:text-lg">
              {content.hero.promptSentence}
            </p>
            <p className="mt-4 text-sm leading-6 text-[#6b7d3a]" style={mono}>
              {content.hero.promptTagline}
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <Link
                href="/start"
                className="inline-block rounded-lg bg-[#6b7d3a] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#f4f5f0] transition-colors hover:bg-[#1c1f17]"
                style={mono}
              >
                {content.hero.ctas.primary}
              </Link>
              <Link
                href="/capabilities/image-generation"
                className="inline-block rounded-lg border border-[#1c1f17] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] transition-colors hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
                style={mono}
              >
                {content.hero.ctas.secondary}
              </Link>
              <Link
                href="/capabilities/video-generation"
                className="inline-block rounded-lg border border-[#1c1f17] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] transition-colors hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
                style={mono}
              >
                {content.hero.ctas.tertiary}
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
              <p className="mb-4 text-[11px] tracking-[0.8px] text-[#6b7d3a]" style={mono}>
                {content.install.eyebrow}
              </p>
              <h2
                className="text-[#1c1f17] leading-[1.1] tracking-[-0.02em]"
                style={{ ...pixel, fontSize: "clamp(24px, 4vw, 44px)" }}
              >
                {content.install.title}
              </h2>
              <p className="mt-5 max-w-[760px] text-base leading-7 text-[#4d5145]">
                {content.install.intro}
              </p>
              <div className="mt-8 rounded-xl border border-[#d4dbb8] bg-[#fffffc]/70 p-6">
                <p className="mb-3 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                  {content.install.whatToTypeLabel}
                </p>
                <div className="rounded-lg bg-[#1c1f17] px-5 py-4">
                  <p className="text-[13px] text-[#d4e0a4]" style={mono}>
                    {content.install.installPrompt}
                  </p>
                </div>
                <p className="mt-4 text-sm leading-6 text-[#4d5145]">
                  {content.install.afterSetup}
                </p>
              </div>

              <details className="mt-8 group">
                <summary
                  className="cursor-pointer text-[13px] text-[#5a5e52] transition-colors hover:text-[#6b7d3a]"
                  style={mono}
                >
                  {content.install.manualToggleLabel}
                </summary>
                <div className="mt-6 grid gap-6 lg:grid-cols-3">
                  {content.install.steps.map((step) => (
                    <div key={step.title} className="border-l-[3px] border-[#6b7d3a] pl-6">
                      <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                        {step.subtitle}
                      </p>
                      <h3 className="mb-3 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                        {step.title}
                      </h3>
                      <div className="bg-[#1c1f17] px-5 py-4">
                        <p className="break-all text-[13px] text-[#d4e0a4]" style={mono}>
                          {step.code}
                        </p>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-[#4d5145]">{step.note}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-6 text-sm leading-6 text-[#5a5e52]">
                  {content.install.guideLinkPrefix}
                  <Link
                    href="/start"
                    className="underline decoration-[#d4dbb8] underline-offset-2 transition-colors hover:text-[#6b7d3a] hover:decoration-[#6b7d3a]"
                  >
                    {content.install.guideLinkLabel}
                  </Link>
                  {content.install.guideLinkSuffix}
                </p>
              </details>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <p className="mb-4 text-[11px] tracking-[0.8px] text-[#6b7d3a]" style={mono}>
                {content.whyItFits.eyebrow}
              </p>
              <h2
                className="text-[#1c1f17] leading-[1.1] tracking-[-0.02em]"
                style={{ ...pixel, fontSize: "clamp(24px, 4vw, 44px)" }}
              >
                {content.whyItFits.title}
              </h2>
              <p className="mt-5 max-w-[760px] text-base leading-7 text-[#4d5145]">
                {content.whyItFits.intro}
              </p>
              <div className="mt-8 grid gap-6 lg:grid-cols-3">
                {content.whyItFits.cards.map((card) => (
                  <div key={card.title} className="rounded-xl border border-[#d4dbb8] bg-[#fffffc]/70 p-6">
                    <h3 className="mb-3 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                      {card.title}
                    </h3>
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
            <div className="mt-16 md:mt-24">
              <CapabilityGapTable
                eyebrow={content.capabilityGap.eyebrow}
                title={content.capabilityGap.title}
                description={content.capabilityGap.description}
                columns={content.capabilityGap.columns}
                rows={content.capabilityGap.rows}
              />
            </div>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-8 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {content.capabilityCards.title}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {content.capabilityCards.cards.map((card) => (
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
                    <p className="mt-4 text-[12px] text-[#6b7d3a]" style={mono}>
                      {card.command}
                    </p>
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
              <h2 className="mb-4 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {content.modelSelection.title}
              </h2>
              <p className="max-w-[820px] text-sm leading-6 text-[#4d5145]">
                {content.modelSelection.introPrefix}
                <Link
                  href={seedreamCard.href}
                  className="underline decoration-[#d4dbb8] underline-offset-2 hover:text-[#6b7d3a] hover:decoration-[#6b7d3a]"
                >
                  {seedreamCard.title}
                </Link>
                {content.modelSelection.imageModelConnector}
                <Link
                  href={nanoCard.href}
                  className="underline decoration-[#d4dbb8] underline-offset-2 hover:text-[#6b7d3a] hover:decoration-[#6b7d3a]"
                >
                  {nanoCard.title}
                </Link>
                {content.modelSelection.introMiddle}
                <Link
                  href={veoCard.href}
                  className="underline decoration-[#d4dbb8] underline-offset-2 hover:text-[#6b7d3a] hover:decoration-[#6b7d3a]"
                >
                  {veoCard.title}
                </Link>
                {content.modelSelection.videoModelConnector}
                <Link
                  href="/models/kling-3-0"
                  className="underline decoration-[#d4dbb8] underline-offset-2 hover:text-[#6b7d3a] hover:decoration-[#6b7d3a]"
                >
                  Kling 3.0
                </Link>
                {content.modelSelection.outro}
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {content.modelSelection.cards.map((card) => (
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
                    <p className="mt-4 text-[12px] leading-5 text-[#6b7d3a]" style={mono}>
                      {card.comparison}
                    </p>
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
                {content.faq.title}
              </h2>
              <div className="max-w-[860px] space-y-6">
                {content.faq.items.map((item) => (
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
            <section className="mt-16 mb-8 md:mt-24">
              <p className="mb-4 text-[11px] tracking-[0.8px] text-[#6b7d3a]" style={mono}>
                {content.siblingAgents.eyebrow}
              </p>
              <div className="mb-8 flex flex-wrap gap-3">
                {content.siblingAgents.labels.map((agent) => (
                  <Link
                    key={agent.href}
                    href={agent.href}
                    className="rounded-lg border border-[#d4dbb8] px-5 py-2 text-[12px] text-[#1c1f17] transition-colors hover:border-[#6b7d3a] hover:text-[#6b7d3a]"
                    style={mono}
                  >
                    {agent.label}
                  </Link>
                ))}
              </div>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/start"
                  className="inline-block rounded-lg bg-[#6b7d3a] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#f4f5f0] transition-colors hover:bg-[#1c1f17]"
                  style={mono}
                >
                  {content.siblingAgents.ctas.primary}
                </Link>
                <Link
                  href="/cli"
                  className="inline-block rounded-lg border border-[#1c1f17] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] transition-colors hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
                  style={mono}
                >
                  {content.siblingAgents.ctas.secondary}
                </Link>
                <Link
                  href="/skills"
                  className="inline-block rounded-lg border border-[#1c1f17] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] transition-colors hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
                  style={mono}
                >
                  {content.siblingAgents.ctas.tertiary}
                </Link>
              </div>
              <p className="mt-6 text-[11px] text-[#5a5e52]" style={mono}>
                {content.siblingAgents.footerNote}
              </p>
            </section>
          </FadeIn>
        </div>
      </article>
    </>
  );
}
