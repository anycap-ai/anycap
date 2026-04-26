import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { EarlyAccessBanner } from "@/components/landing/EarlyAccessBanner";
import { ArticleByline } from "@/components/seo/ArticleByline";
import { FadeIn } from "@/components/ui/FadeIn";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { createTechArticleJsonLd } from "@/lib/schema";
import { createLocalizedMetadataForPath } from "@/lib/localized-metadata";
import { getRequestLocale } from "@/lib/request-locale";
import { defaultLocale } from "@/lib/site";
import {
  ADD_TOOLS_TO_CLAUDE_CODE_PATH,
  getAddToolsToClaudeCodeMetadata,
  getAddToolsToClaudeCodePageData,
} from "./content";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

export const metadata: Metadata = createLocalizedMetadataForPath(
  defaultLocale,
  ADD_TOOLS_TO_CLAUDE_CODE_PATH,
  getAddToolsToClaudeCodeMetadata(defaultLocale),
);

export default async function AddToolsToClaudeCodePage() {
  const locale = await getRequestLocale();
  const content = getAddToolsToClaudeCodePageData(locale);

  const guideJsonLd = createTechArticleJsonLd({
    headline: content.metadata.title,
    description: content.metadata.description,
    path: ADD_TOOLS_TO_CLAUDE_CODE_PATH,
    about: ["Claude Code", "AnyCap CLI", "Agent skills", "AI agent capabilities"],
    keywords: ["claude code tools", "add tools to claude code", "anycap", "agent skills"],
    datePublished: "2026-04-03",
    dateModified: "2026-04-10",
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
              style={{ ...pixel, fontSize: "clamp(28px, 5vw, 60px)" }}
            >
              {content.heroTitle}
            </h1>
            <p className="mt-6 max-w-[700px] text-base leading-7 text-[#4d5145] md:text-lg">
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
              <h2 className="mb-6 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {content.needTitle}
              </h2>
              <ul className="max-w-[700px] space-y-3">
                {content.needItems.map((item) => (
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

          <div className="mt-16 max-w-[800px] space-y-10 md:mt-24">
            <FadeIn>
              <p className="max-w-[800px] border border-[#d4dbb8] bg-[#f4f5f0]/50 px-5 py-4 text-sm leading-6 text-[#4d5145]">
                {content.note}
              </p>
            </FadeIn>

            {content.steps.map((step, index) => (
              <FadeIn key={step.title}>
                <div className="mb-4 flex items-center gap-3">
                  <span
                    className="flex h-8 w-8 items-center justify-center bg-[#6b7d3a] text-[13px] font-bold text-[#f4f5f0]"
                    style={mono}
                  >
                    {index + 1}
                  </span>
                  <h2 className="text-lg text-[#1c1f17]" style={pixel}>
                    {step.title}
                  </h2>
                </div>
                <div className="bg-[#1c1f17] px-5 py-4">
                  <p className="text-[13px] text-[#d4e0a4]" style={mono}>
                    {step.command}
                  </p>
                </div>
                {step.body ? (
                  <p className="mt-3 text-sm leading-6 text-[#4d5145]">
                    {step.body}
                    {step.bodyCommand ? (
                      <>
                        {" "}
                        <code className="text-[12px] text-[#6b7d3a]" style={mono}>
                          {step.bodyCommand}
                        </code>
                      </>
                    ) : null}
                  </p>
                ) : null}
              </FadeIn>
            ))}
          </div>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-8 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {content.faqTitle}
              </h2>
              <div className="max-w-[860px] space-y-4">
                {content.faqItems.map((item) => (
                  <div key={item.question} className="rounded-xl border border-[#d4dbb8] bg-[#fffffc]/70 p-5">
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
