import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { ArticleByline } from "@/components/seo/ArticleByline";
import { FadeIn } from "@/components/ui/FadeIn";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { EarlyAccessBanner } from "@/components/landing/EarlyAccessBanner";
import { getSeoPageChrome } from "@/lib/seo/ia";
import { createLocalizedMetadataForPath } from "@/lib/localized-metadata";
import { getRequestLocale } from "@/lib/request-locale";
import { hasJsonLdContent } from "@/lib/schema";
import { defaultLocale } from "@/lib/site";
import {
  getWhatAgentsCantDoMetadata,
  getWhatAgentsCantDoPageData,
  WHAT_AGENTS_CANT_DO_PATH,
} from "./content";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

export const metadata = createLocalizedMetadataForPath(
  defaultLocale,
  WHAT_AGENTS_CANT_DO_PATH,
  getWhatAgentsCantDoMetadata(defaultLocale),
);

const pageChrome = getSeoPageChrome(WHAT_AGENTS_CANT_DO_PATH);

export default async function WhatAgentsCantDoPage() {
  const locale = await getRequestLocale();
  const content = getWhatAgentsCantDoPageData(locale);

  return (
    <>
      <BreadcrumbJsonLd items={pageChrome?.breadcrumbItems} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(content.articleJsonLd) }}
      />
      {hasJsonLdContent(content.faqJsonLd) ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(content.faqJsonLd) }}
        />
      ) : null}

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
            <p className="mt-6 max-w-[820px] text-base leading-7 text-[#4d5145] md:text-lg">
              {content.heroIntro}
            </p>
            <p className="mt-4 text-sm text-[#6b7d3a]" style={mono}>
              {content.lastUpdatedLabel}
            </p>
          </FadeIn>

          <FadeIn className="mt-8">
            <EarlyAccessBanner />
          </FadeIn>

          <FadeIn className="mt-12">
            <h2 className="mb-4 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
              {content.takeawaysTitle}
            </h2>
            <ul className="max-w-[820px] space-y-3">
              {content.takeaways.map((item) => (
                <li key={item} className="border-l-[3px] border-[#6b7d3a] pl-5 text-sm leading-6 text-[#4d5145]">
                  {item}
                </li>
              ))}
            </ul>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-4 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {content.gapsTitle}
              </h2>
              <p className="max-w-[820px] text-base leading-7 text-[#4d5145]">{content.gapsIntro}</p>
              <div className="mt-8 grid gap-4">
                {content.gaps.map((gap) => (
                  <div key={gap.title} className="rounded-xl border border-[#d4dbb8] bg-[#fffffc]/70 p-6">
                    <h3 className="mb-2 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                      {gap.title}
                    </h3>
                    <p className="mb-3 text-sm leading-6 text-[#4d5145]">{gap.body}</p>
                    <p className="text-sm leading-6 text-[#1c1f17]">
                      <span className="font-bold" style={mono}>
                        Fix:
                      </span>{" "}
                      {gap.fix}{" "}
                      <Link href={gap.href} className="text-[#6b7d3a] underline underline-offset-2">
                        Learn more
                      </Link>
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
              <h2 className="mb-4 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {content.runtimeTitle}
              </h2>
              <p className="max-w-[820px] text-base leading-7 text-[#4d5145]">{content.runtimeIntro}</p>
              <ul className="mt-6 max-w-[820px] space-y-3">
                {content.runtimePoints.map((point) => (
                  <li key={point} className="border-l-[3px] border-[#6b7d3a] pl-5 text-sm leading-6 text-[#4d5145]">
                    {point}
                  </li>
                ))}
              </ul>
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
              <div className="max-w-[820px] space-y-4">
                {content.faqItems.map((item) => (
                  <div key={item.question} className="rounded-xl border border-[#d4dbb8] p-5">
                    <h3 className="mb-2 text-[15px] font-bold text-[#1c1f17]" style={mono}>
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
            <section className="mt-16 md:mt-24">
              <h2 className="mb-8 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {content.nextTitle}
              </h2>
              <div className="grid gap-4 lg:grid-cols-3">
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
                    <p className="text-sm leading-6 text-[#4d5145]">{page.body}</p>
                  </Link>
                ))}
              </div>
            </section>
          </FadeIn>

          <FadeIn className="mt-12 flex flex-wrap gap-3">
            {content.ctas.map((cta) => (
              <Link
                key={cta.href}
                href={cta.href}
                className={
                  cta.primary
                    ? "rounded-full bg-[#1c1f17] px-5 py-2.5 text-sm text-[#f9faf5]"
                    : "rounded-full border border-[#d4dbb8] px-5 py-2.5 text-sm text-[#1c1f17]"
                }
              >
                {cta.label}
              </Link>
            ))}
          </FadeIn>
        </div>
      </article>
    </>
  );
}
