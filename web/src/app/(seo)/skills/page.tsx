import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { EarlyAccessBanner } from "@/components/landing/EarlyAccessBanner";
import { FadeIn } from "@/components/ui/FadeIn";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { ArticleByline } from "@/components/seo/ArticleByline";
import { getSeoPageChrome } from "@/lib/seo/ia";
import { createLocalizedMetadataForPath } from "@/lib/localized-metadata";
import { getRequestLocale } from "@/lib/request-locale";
import { defaultLocale } from "@/lib/site";
import { getSkillsMetadata, getSkillsPageData, SKILLS_PATH } from "./content";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

export const metadata = createLocalizedMetadataForPath(
  defaultLocale,
  SKILLS_PATH,
  getSkillsMetadata(defaultLocale),
);

const pageChrome = getSeoPageChrome("/skills");

export default async function SkillsPage() {
  const locale = await getRequestLocale();
  const content = getSkillsPageData(locale);

  return (
    <>
      <BreadcrumbJsonLd items={pageChrome?.breadcrumbItems} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(content.skillsHubJsonLd) }}
      />
      <article className="px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-[1280px] py-12 md:py-20 lg:py-24">
          <FadeIn>
            <p className="mb-4 text-[11px] tracking-[0.8px] text-[#6b7d3a]" style={mono}>
              {content.eyebrow}
            </p>
            <ArticleByline className="mb-3" author={pageChrome?.authorLabel} />
            <h1
              className="leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(32px, 6vw, 72px)" }}
            >
              {content.heroTitle[0]}
              <br />
              {content.heroTitle[1]}
            </h1>
            <p className="mt-6 max-w-[780px] text-base leading-7 text-[#4d5145] md:text-lg">
              {content.heroIntro}
            </p>
            <p className="mt-4 text-sm leading-6 text-[#6b7d3a]" style={mono}>
              {content.heroTagline}
            </p>
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
                {content.relationshipTitle}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {content.relationshipRows.map((row) => (
                  <div key={row.label} className="border border-[#d4dbb8] p-5">
                    <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                      {row.label}
                    </p>
                    <p className="text-sm leading-6 text-[#4d5145]">{row.summary}</p>
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
              <div className="grid gap-4 sm:grid-cols-3">
                {content.nextPages.map((page) => (
                  <Link
                    key={page.href}
                    href={page.href}
                    className="rounded-xl border border-[#d4dbb8] p-5 transition-colors hover:border-[#6b7d3a]"
                  >
                    <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                      {page.eyebrow}
                    </p>
                    <h3 className="mb-2 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                      {page.title}
                    </h3>
                    <p className="text-sm leading-6 text-[#4d5145]">{page.summary}</p>
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
                {content.supportedTitle}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {content.supportedTargets.map((target) =>
                  target.href ? (
                    <Link
                      key={target.name}
                      href={target.href}
                      className="border border-[#d4dbb8] p-5 transition-colors hover:border-[#6b7d3a]"
                    >
                      <p className="mb-2 text-[12px] tracking-[0.8px] text-[#6b7d3a]" style={mono}>
                        {content.supportedLabel}
                      </p>
                      <h3 className="text-[15px] font-bold text-[#1c1f17]" style={mono}>
                        {target.name}
                      </h3>
                    </Link>
                  ) : (
                    <div key={target.name} className="border border-[#d4dbb8]/70 p-5 opacity-80">
                      <p className="mb-2 text-[12px] tracking-[0.8px] text-[#5a5e52]" style={mono}>
                        {content.plannedLabel}
                      </p>
                      <h3 className="text-[15px] font-bold text-[#1c1f17]" style={mono}>
                        {target.name}
                      </h3>
                    </div>
                  ),
                )}
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-8 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {content.installTitle}
              </h2>
              <div className="max-w-[920px] space-y-6">
                {content.installPatterns.map((pattern) => (
                  <div key={pattern.title} className="border border-[#d4dbb8] p-5">
                    <h3 className="mb-2 text-[14px] font-bold text-[#1c1f17]" style={mono}>
                      {pattern.title}
                    </h3>
                    <p className="mb-4 text-sm leading-6 text-[#4d5145]">{pattern.note}</p>
                    <div className="bg-[#1c1f17] px-5 py-4">
                      <p className="break-all text-[13px] text-[#d4e0a4]" style={mono}>
                        {pattern.code}
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
                {content.notTitle}
              </h2>
              <div className="max-w-[760px] space-y-4">
                {content.notParagraphs.map((paragraph) => (
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
              <h2 className="mb-8 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {content.nextTitle}
              </h2>
              <div className="grid gap-4 lg:grid-cols-3">
                {content.nextPages.map((page) => (
                  <Link
                    key={page.href}
                    href={page.href}
                    className="rounded-xl border border-[#d4dbb8] bg-[#fffffc]/70 p-6 transition-colors hover:border-[#6b7d3a]"
                  >
                    <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                      {page.eyebrow}
                    </p>
                    <h3 className="mb-3 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                      {page.title}
                    </h3>
                    <p className="text-sm leading-6 text-[#4d5145]">{page.summary}</p>
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
                {content.ctas.map((cta, index) => (
                  <Link
                    key={cta.href}
                    href={cta.href}
                    className={
                      index === 0
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
