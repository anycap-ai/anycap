import type { Metadata } from "next";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { CapabilityGapTable } from "@/components/landing/CapabilityGapTable";
import { FadeIn } from "@/components/ui/FadeIn";
import { createLocalizedMetadataForPath } from "@/lib/localized-metadata";
import { defaultLocale } from "@/lib/site";
import { getRequestLocale } from "@/lib/request-locale";
import {
  CAPABILITIES_PATH,
  getCapabilitiesMetadata,
  getCapabilitiesPageData,
} from "./content";

export { CAPABILITIES_PATH } from "./content";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

export const metadata: Metadata = createLocalizedMetadataForPath(
  defaultLocale,
  CAPABILITIES_PATH,
  getCapabilitiesMetadata(defaultLocale),
);

export default async function CapabilitiesPage() {
  const locale = await getRequestLocale();
  const content = getCapabilitiesPageData(locale);
  const availableCapabilities = content.capabilities.filter((cap) => cap.status === "available");
  const comingSoon = content.capabilities.filter((cap) => cap.status === "coming_soon");

  return (
    <>
      <BreadcrumbJsonLd items={content.breadcrumbItems} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(content.hubArticleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(content.itemListJsonLd) }}
      />

      <article className="px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-[1280px] py-12 md:py-20 lg:py-24">
          <FadeIn>
            <p className="mb-4 text-[11px] tracking-[0.8px] text-[#6b7d3a]" style={mono}>
              {content.heroEyebrow}
            </p>
            <h1
              className="leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(32px, 6vw, 72px)" }}
            >
              {content.heroTitleLine1}
              <br />
              {content.heroTitleLine2}
            </h1>
            <p className="mt-6 max-w-[780px] text-base leading-7 text-[#4d5145] md:text-lg">
              {content.heroParagraph}
            </p>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-6 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {content.overviewTitle}
              </h2>
              <div className="max-w-[860px] space-y-4">
                {content.overviewParagraphs.map((paragraph) => (
                  <p key={paragraph} className="text-base leading-7 text-[#4d5145]">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          </FadeIn>

          <FadeIn>
            <div className="mt-16 md:mt-24">
              <CapabilityGapTable
                eyebrow={content.gapTable.eyebrow}
                title={content.gapTable.title}
                description={content.gapTable.description}
                columns={[
                  { label: "Claude Code" },
                  { label: "Cursor" },
                  { label: "Codex" },
                  { label: content.gapTable.addWithAnycapLabel, accent: true },
                ]}
                rows={content.gapRows}
                footnote={content.gapTable.footnote}
              />
            </div>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-8 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {content.sectionTitles.browseInventory}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {availableCapabilities.map((capability) => {
                  const inner = (
                    <div className="h-full rounded-xl border border-[#d4dbb8] bg-[#fffffc]/70 p-6 transition-colors hover:border-[#6b7d3a]">
                      <div className="mb-3 flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-[#6b7d3a]" />
                        <span className="text-[10px] tracking-[0.5px] text-[#5a5e52]" style={mono}>
                          {capability.category}
                        </span>
                      </div>
                      <h3 className="mb-2 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                        {capability.name}
                      </h3>
                      <p className="mb-3 text-sm leading-6 text-[#4d5145]">{capability.description}</p>
                      {capability.models ? (
                        <p className="text-[12px] text-[#4d5145]" style={mono}>
                          {capability.models}
                        </p>
                      ) : null}
                    </div>
                  );

                  return capability.href ? (
                    <Link key={capability.name} href={capability.href} className="group">
                      {inner}
                    </Link>
                  ) : (
                    <div key={capability.name}>{inner}</div>
                  );
                })}
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-8 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {content.sectionTitles.modelsBehind}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 max-w-[980px]">
                {content.modelGuideCards.map((card) => (
                  <Link
                    key={card.href}
                    href={card.href}
                    className="rounded-xl border border-[#d4dbb8] p-6 transition-colors hover:border-[#6b7d3a]"
                  >
                    <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                      {card.eyebrow}
                    </p>
                    <h3 className="mb-2 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                      {card.title}
                    </h3>
                    <p className="text-sm leading-6 text-[#4d5145]">
                      {card.body}
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
                {content.sectionTitles.relatedEntryPages}
              </h2>
              <div className="grid gap-4 sm:grid-cols-3 max-w-[1120px]">
                {content.relatedCards.map((card) => (
                  <Link
                    key={card.href}
                    href={card.href}
                    className="rounded-xl border border-[#d4dbb8] p-6 transition-colors hover:border-[#6b7d3a]"
                  >
                    <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                      {card.eyebrow}
                    </p>
                    <h3 className="mb-2 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                      {card.title}
                    </h3>
                    <p className="text-sm leading-6 text-[#4d5145]">{card.summary}</p>
                  </Link>
                ))}
              </div>
            </section>
          </FadeIn>

          {comingSoon.length > 0 ? (
            <>
              <div className="mt-16 md:mt-24">
                <hr className="border-t border-[#d4dbb8]" />
              </div>

              <FadeIn>
                <section className="mt-16 md:mt-24">
                  <h2 className="mb-8 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                    {content.sectionTitles.comingSoon}
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {comingSoon.map((capability) => (
                      <div
                        key={capability.name}
                        className="rounded-xl border border-[#d4dbb8]/60 p-5 opacity-70"
                      >
                        <div className="mb-3 flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-[#d4dbb8]" />
                          <span className="text-[10px] tracking-[0.5px] text-[#5a5e52]" style={mono}>
                            {capability.category}
                          </span>
                        </div>
                        <h3 className="mb-2 text-[14px] font-bold text-[#5a5e52]" style={mono}>
                          {capability.name}
                        </h3>
                        <p className="text-sm leading-6 text-[#5a5e52]">{capability.description}</p>
                      </div>
                    ))}
                  </div>
                </section>
              </FadeIn>
            </>
          ) : null}

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24 mb-8">
              <h2 className="mb-6 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {content.sectionTitles.getStarted}
              </h2>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/start"
                  className="inline-block rounded-lg bg-[#6b7d3a] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#f4f5f0] transition-colors hover:bg-[#1c1f17]"
                  style={mono}
                >
                  {content.buttonLabels.getStarted}
                </Link>
                <Link
                  href="/learn/what-agents-cant-do"
                  className="inline-block rounded-lg border border-[#1c1f17] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] transition-colors hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
                  style={mono}
                >
                  {content.buttonLabels.whatAgentsCantDo}
                </Link>
                <Link
                  href="/for/claude-code"
                  className="inline-block rounded-lg border border-[#1c1f17] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] transition-colors hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
                  style={mono}
                >
                  {content.buttonLabels.forClaudeCode}
                </Link>
              </div>
            </section>
          </FadeIn>
        </div>
      </article>
    </>
  );
}
