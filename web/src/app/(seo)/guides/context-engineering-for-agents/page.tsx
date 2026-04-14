import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { EarlyAccessBanner } from "@/components/landing/EarlyAccessBanner";
import { ArticleByline } from "@/components/seo/ArticleByline";
import { FadeIn } from "@/components/ui/FadeIn";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { createLocalizedMetadataForPath } from "@/lib/localized-metadata";
import { createTechArticleJsonLd } from "@/lib/schema";
import { getRequestLocale } from "@/lib/request-locale";
import { defaultLocale } from "@/lib/site";
import {
  CONTEXT_ENGINEERING_FOR_AGENTS_PATH,
  getContextEngineeringForAgentsMetadata,
  getContextEngineeringForAgentsPageData,
} from "./content";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

export const metadata: Metadata = createLocalizedMetadataForPath(
  defaultLocale,
  CONTEXT_ENGINEERING_FOR_AGENTS_PATH,
  getContextEngineeringForAgentsMetadata(defaultLocale),
);

export default async function ContextEngineeringForAgentsPage() {
  const locale = await getRequestLocale();
  const content = getContextEngineeringForAgentsPageData(locale);

  const guideJsonLd = createTechArticleJsonLd({
    headline: content.metadata.title,
    description: content.metadata.description,
    path: CONTEXT_ENGINEERING_FOR_AGENTS_PATH,
    about: ["Context engineering", "AI agents", "AnyCap"],
    keywords: ["context engineering", "agent context", "anycap", "multimodal agents"],
    datePublished: "2026-04-13",
    dateModified: "2026-04-13",
  });

  return (
    <>
      <BreadcrumbJsonLd items={content.breadcrumbItems} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(guideJsonLd) }} />

      <article className="px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-[1280px] py-12 md:py-20 lg:py-24">
          <FadeIn>
            <p className="mb-4 text-[11px] tracking-[0.8px] text-[#6b7d3a]" style={mono}>
              {content.eyebrow}
            </p>
            <ArticleByline className="mb-3" />
            <h1
              className="leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(32px, 6vw, 72px)" }}
            >
              {content.heroTitle}
            </h1>
            <p className="mt-6 max-w-[760px] text-base leading-7 text-[#4d5145] md:text-lg">
              {content.heroIntro}
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
                {content.pillarsTitle}
              </h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {content.pillars.map((pillar) => (
                  <div key={pillar.title} className="border border-[#d4dbb8] p-5">
                    <h3 className="mb-2 text-[14px] font-bold text-[#1c1f17]" style={mono}>
                      {pillar.title}
                    </h3>
                    <p className="text-sm leading-6 text-[#4d5145]">{pillar.body}</p>
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
                {content.whyItMattersTitle}
              </h2>
              <div className="max-w-[780px] space-y-6">
                {content.whyItMatters.map((paragraph) => (
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
              <h2 className="mb-6 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {content.patternTitle}
              </h2>
              <div className="max-w-[820px] bg-[#1c1f17] px-6 py-5 md:px-8 md:py-6">
                {content.patternSteps.map((step) => (
                  <p key={step} className="mb-3 text-[13px] text-[#d4e0a4]" style={mono}>
                    {step}
                  </p>
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
                {content.cta.map((item, index) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={
                      index === 0
                        ? "inline-block rounded-lg bg-[#6b7d3a] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#f4f5f0] transition-colors hover:bg-[#1c1f17]"
                        : "inline-block rounded-lg border border-[#1c1f17] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] transition-colors hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
                    }
                    style={mono}
                  >
                    {item.label}
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
