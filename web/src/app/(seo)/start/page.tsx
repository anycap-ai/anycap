import type { Metadata } from "next";
import { DemoVideo } from "@/components/ui/DemoVideo";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { EarlyAccessBanner } from "@/components/landing/EarlyAccessBanner";
import { FadeIn } from "@/components/ui/FadeIn";
import { createLocalizedMetadataForPath } from "@/lib/localized-metadata";
import { getRequestLocale } from "@/lib/request-locale";
import { defaultLocale } from "@/lib/site";
import { getStartMetadata, getStartPageData, START_PATH } from "./content";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;
export const metadata: Metadata = createLocalizedMetadataForPath(
  defaultLocale,
  START_PATH,
  getStartMetadata(defaultLocale),
);

export default async function StartPage() {
  const locale = await getRequestLocale();
  const content = getStartPageData(locale);

  return (
    <>
      <BreadcrumbJsonLd items={content.breadcrumbItems} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(content.pageJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(content.videoJsonLd) }}
      />

      <article className="px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-[1280px] py-12 md:py-20 lg:py-24">
          <FadeIn>
            <p className="mb-4 text-[11px] tracking-[0.8px] text-[#6b7d3a]" style={mono}>
              {content.hero.eyebrow}
            </p>
            <h1
              className="leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(32px, 6vw, 72px)" }}
            >
              {content.hero.titleLine1}
              <br />
              {content.hero.titleLine2}
            </h1>
            <p className="mt-6 max-w-[760px] text-base leading-7 text-[#4d5145] md:text-lg">
              {content.hero.intro}
            </p>
            <p className="mt-4 text-[11px] text-[#5a5e52]" style={mono}>
              {content.hero.lastUpdatedLabel}
            </p>
            <div className="mt-6 max-w-[760px] rounded-xl border border-[#d4dbb8] bg-[#fffffc]/70 p-5">
              <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                {content.hero.naturalLanguageEyebrow}
              </p>
              <p className="mt-2 text-base leading-7 text-[#1c1f17]">
                {content.hero.naturalLanguageLead}{" "}
                <span style={mono}>help me install AnyCap and generate a launch image</span>.
              </p>
              <p className="mt-2 text-sm leading-6 text-[#4d5145]">
                {content.hero.naturalLanguageNote}
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/for/claude-code"
                className="inline-block rounded-lg bg-[#6b7d3a] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#f4f5f0] transition-colors hover:bg-[#1c1f17]"
                style={mono}
              >
                {content.ctas.startWithClaudeCode}
              </Link>
              <Link
                href="/guides/install-anycap"
                className="inline-block rounded-lg border border-[#1c1f17] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] transition-colors hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
                style={mono}
              >
                {content.ctas.universalInstallGuide}
              </Link>
              <Link
                href="/learn/what-agents-cant-do"
                className="inline-block rounded-lg border border-[#1c1f17] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] transition-colors hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
                style={mono}
              >
                {content.ctas.seeCapabilityGaps}
              </Link>
            </div>
            <div className="mt-10 max-w-[920px]">
              <p className="mb-4 text-[11px] tracking-[0.8px] text-[#6b7d3a]" style={mono}>
                {content.video.sectionEyebrow}
              </p>
              <h2 className="mb-4 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {content.video.title}
              </h2>
              <DemoVideo
                src="https://cdn.anycap.ai/page_resource/start/start-hero.mp4"
                poster="https://cdn.anycap.ai/page_resource/start/start-hero-poster.jpg"
                title={content.video.title}
                description={content.video.description}
                autoLoop
              />
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
                {content.sectionTitles.agents}
              </h2>
              <div className="grid gap-4 lg:grid-cols-3">
                {content.agentOptions.map((option) => (
                  <Link
                    key={option.name}
                    href={option.href}
                    className="rounded-xl border border-[#d4dbb8] bg-[#fffffc]/70 p-6 transition-colors hover:border-[#6b7d3a]"
                  >
                    <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                      {content.cardEyebrow}
                    </p>
                    <h3 className="mb-3 text-[16px] font-bold text-[#1c1f17]" style={mono}>
                      {option.name}
                    </h3>
                    <p className="text-sm leading-6 text-[#4d5145]">{option.description}</p>
                    <div className="mt-5 bg-[#1c1f17] px-4 py-3">
                      <p className="break-all text-[13px] text-[#d4e0a4]" style={mono}>
                        {option.command}
                      </p>
                    </div>
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
                {content.sectionTitles.naturalLanguageStartPath}
              </h2>
              <div className="grid gap-6 lg:grid-cols-3">
                {content.universalSteps.map((step, index) => (
                  <div key={step.title} className="border-l-[3px] border-[#6b7d3a] pl-6">
                    <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                      {locale === "pt-br" ? "Etapa" : "Step"} {index + 1}
                    </p>
                    <h3 className="mb-3 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                      {step.title}
                    </h3>
                    <div className="bg-[#1c1f17] px-4 py-3">
                      <p className="break-all text-[13px] text-[#d4e0a4]" style={mono}>
                        {step.code}
                      </p>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-[#4d5145]">{step.note}</p>
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
                {content.sectionTitles.gapEntrances}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {content.gapEntrances.map((entry) => (
                  <Link
                    key={entry.href}
                    href={entry.href}
                    className="rounded-xl border border-[#d4dbb8] bg-[#fffffc]/70 p-6 transition-colors hover:border-[#6b7d3a]"
                  >
                    <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                      {entry.eyebrow}
                    </p>
                    <h3 className="mb-3 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                      {entry.title}
                    </h3>
                    <p className="text-sm leading-6 text-[#4d5145]">{entry.summary}</p>
                  </Link>
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
                <Link
                  href="/guides/install-anycap"
                  className="inline-block rounded-lg bg-[#6b7d3a] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#f4f5f0] transition-colors hover:bg-[#1c1f17]"
                  style={mono}
                >
                  {content.ctas.installAnycap}
                </Link>
                <Link
                  href="/capabilities"
                  className="inline-block rounded-lg border border-[#1c1f17] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] transition-colors hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
                  style={mono}
                >
                  {content.ctas.viewCapabilities}
                </Link>
                <Link
                  href="/for/claude-code"
                  className="inline-block rounded-lg border border-[#1c1f17] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] transition-colors hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
                  style={mono}
                >
                  {content.ctas.forClaudeCode}
                </Link>
              </div>
            </section>
          </FadeIn>
        </div>
      </article>
    </>
  );
}
