import type { Metadata } from "next";
import type { ReactNode } from "react";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { EarlyAccessBanner } from "@/components/landing/EarlyAccessBanner";
import { FadeIn } from "@/components/ui/FadeIn";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { createLocalizedMetadataForPath } from "@/lib/localized-metadata";
import { getRequestLocale } from "@/lib/request-locale";
import { defaultLocale } from "@/lib/site";
import { ArticleByline } from "@/components/seo/ArticleByline";
import {
  getInstallAnyCapMetadata,
  INSTALL_ANYCAP_GUIDE_PATH,
  getInstallAnyCapPageData,
  type RichPart,
} from "@/app/(seo)/guides/install-anycap/content";

export const runtime = "edge";
export const metadata: Metadata = createLocalizedMetadataForPath(
  defaultLocale,
  INSTALL_ANYCAP_GUIDE_PATH,
  getInstallAnyCapMetadata(defaultLocale),
);

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

function renderRichParts(parts: readonly RichPart[], keyPrefix: string): ReactNode {
  return parts.map((part, index) => {
    const key = `${keyPrefix}-${index}`;

    if (part.type === "text") {
      return <span key={key}>{part.text}</span>;
    }

    if (part.type === "code") {
      return (
        <code key={key} className="text-[12px] text-[#6b7d3a]" style={mono}>
          {part.text}
        </code>
      );
    }

    if (part.external) {
      return (
        <a
          key={key}
          href={part.href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#6b7d3a] hover:underline"
        >
          {part.text}
        </a>
      );
    }

    return (
      <Link key={key} href={part.href} className="text-[#6b7d3a] hover:underline">
        {part.text}
      </Link>
    );
  });
}

export default async function InstallAnycapPage() {
  const locale = await getRequestLocale();
  const content = getInstallAnyCapPageData(locale);

  return (
    <>
      <BreadcrumbJsonLd items={content.breadcrumbItems} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(content.guideJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(content.howToJsonLd) }}
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
            <ArticleByline className="mb-3" />
            <h1
              className="leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(32px, 6vw, 72px)" }}
            >
              {content.hero.title}
            </h1>
            <p className="mt-4 max-w-[780px] text-sm leading-6 text-[#5a5e52]">
              {content.hero.fastestPathIntro}{" "}
              <span className="text-[#6b7d3a]" style={mono}>
                {content.hero.prompt}
              </span>
              .
            </p>
            <p className="mt-6 max-w-[700px] text-base leading-7 text-[#4d5145] md:text-lg">
              {renderRichParts(content.hero.intro, "hero-intro")}
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
              <h2 className="mb-6 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {content.prerequisitesTitle}
              </h2>
              <ul className="space-y-3 max-w-[700px]">
                {content.prerequisites.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm leading-6 text-[#4d5145]">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#6b7d3a]" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <div className="mt-16 md:mt-24 space-y-12 max-w-[800px]">
            <FadeIn>
              <p className="text-sm text-[#4d5145] leading-6 border border-[#d4dbb8] bg-[#f4f5f0]/50 px-5 py-4 max-w-[800px]">
                {content.setupNotice}
              </p>
            </FadeIn>
            {content.steps.map((step) => (
              <FadeIn key={step.number}>
                <section>
                  <div className="mb-4 flex items-center gap-3">
                    <span
                      className="flex h-8 w-8 items-center justify-center bg-[#6b7d3a] text-[13px] font-bold text-[#f4f5f0]"
                      style={mono}
                    >
                      {step.number}
                    </span>
                    <h2 className="text-lg text-[#1c1f17]" style={pixel}>
                      {step.title}
                    </h2>
                  </div>
                  {step.codeBlocks.map((block) => (
                    <div key={block.label} className="mb-3 bg-[#1c1f17] px-5 py-4 last:mb-0">
                      <p className="mb-1 text-[13px] text-[#6b7d3a]" style={mono}>
                        {block.label}
                      </p>
                      <p
                        className={`text-[13px] text-[#d4e0a4] ${block.code.includes("http") || block.code.includes("\n") ? "break-all whitespace-pre-wrap" : ""}`}
                        style={mono}
                      >
                        {block.code}
                      </p>
                    </div>
                  ))}
                  {step.description.length > 0 ? (
                    <p className="mt-3 text-sm leading-6 text-[#4d5145]">
                      {renderRichParts(step.description, `step-${step.number}`)}
                    </p>
                  ) : null}
                </section>
              </FadeIn>
            ))}
          </div>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-6 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {content.troubleshootingTitle}
              </h2>
              <div className="space-y-6 max-w-[700px]">
                {content.troubleshootingItems.map((item) => (
                  <div key={item.title}>
                    <p className="mb-1 text-sm font-medium text-[#1c1f17]">{item.title}</p>
                    <p className="text-sm leading-6 text-[#4d5145]">
                      {renderRichParts(item.description, `issue-${item.title}`)}
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
              <h2 className="mb-6 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {content.faqTitle}
              </h2>
              <div className="space-y-6 max-w-[760px]">
                {content.faqItems.map((item) => (
                  <div key={item.question}>
                    <h3 className="text-sm font-medium text-[#1c1f17] mb-2">{item.question}</h3>
                    <p className="text-sm text-[#4d5145] leading-6">{item.answer}</p>
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
              <div className="flex flex-wrap gap-4">
                {content.nextActions.map((action) => {
                  const isExternal = "external" in action && action.external;
                  const isPrimary = "primary" in action && action.primary;

                  return isExternal ? (
                    <a
                      key={action.label}
                      href={action.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-block rounded-lg px-8 py-3 text-[11px] font-bold tracking-[0.8px] transition-colors ${
                        isPrimary
                          ? "bg-[#6b7d3a] text-[#f4f5f0] hover:bg-[#1c1f17]"
                          : "border border-[#1c1f17] text-[#1c1f17] hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
                      }`}
                      style={mono}
                    >
                      {action.label}
                    </a>
                  ) : (
                    <Link
                      key={action.label}
                      href={action.href}
                      className={`inline-block rounded-lg px-8 py-3 text-[11px] font-bold tracking-[0.8px] transition-colors ${
                        isPrimary
                          ? "bg-[#6b7d3a] text-[#f4f5f0] hover:bg-[#1c1f17]"
                          : "border border-[#1c1f17] text-[#1c1f17] hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
                      }`}
                      style={mono}
                    >
                      {action.label}
                    </Link>
                  );
                })}
              </div>
            </section>
          </FadeIn>
        </div>
      </article>
    </>
  );
}
