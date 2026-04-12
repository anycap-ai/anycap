import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { FadeIn } from "@/components/ui/FadeIn";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { getLearnHubContent, type LearnHubArticle, type LearnHubLink, type LearnHubSection } from "@/lib/learn-hub";
import { createLocalizedMetadataForPath } from "@/lib/localized-metadata";
import { createFaqPageJsonLd } from "@/lib/schema";
import { defaultLocale, getLocalizedRouteUrl, siteConfig } from "@/lib/site";
import { LEARN_PATH, getLearnMetadata, getLearnPageData } from "./content";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

const learnPageContent = getLearnPageData(defaultLocale);
const learnHubContent = getLearnHubContent();
const faqJsonLd = createFaqPageJsonLd(learnPageContent.faqItems);

export const metadata: Metadata = createLocalizedMetadataForPath(
  defaultLocale,
  LEARN_PATH,
  getLearnMetadata(defaultLocale),
);

const collectionJsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: learnPageContent.metadata.title,
  description: learnPageContent.metadata.description,
  url: getLocalizedRouteUrl(siteConfig.defaultLocale, "/learn"),
  hasPart: learnHubContent.allArticles.map((article) => ({
    "@type": "WebPage",
    name: article.title,
    description: article.description,
    url: getLocalizedRouteUrl(siteConfig.defaultLocale, article.href),
  })),
} as const;

const itemListJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  itemListElement: learnHubContent.allArticles.map((article, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: article.title,
    url: getLocalizedRouteUrl(siteConfig.defaultLocale, article.href),
  })),
} as const;

function countSectionArticles(section: LearnHubSection) {
  const seen = new Set<string>();

  const collect = (article: LearnHubArticle) => {
    if (seen.has(article.href)) {
      return;
    }

    seen.add(article.href);

    for (const child of article.children) {
      collect(child);
    }
  };

  collect(section.featuredArticle);

  for (const article of section.supportingArticles) {
    collect(article);
  }

  return seen.size;
}

function formatArticleCount(count: number) {
  return `${count} article${count === 1 ? "" : "s"}`;
}

function ArticleRow({
  article,
  emphasis = "default",
}: {
  article: LearnHubArticle;
  emphasis?: "default" | "featured";
}) {
  const isFeatured = emphasis === "featured";

  return (
    <div>
      <Link href={article.href} className="group block">
        {isFeatured ? (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
              {article.badge}
            </span>
          </div>
        ) : null}
        <h3
          className={
            isFeatured
              ? "mt-3 text-[24px] leading-8 text-[#1c1f17] transition-colors group-hover:text-[#36401f] md:text-[30px] md:leading-9"
              : "text-[16px] leading-6 text-[#1c1f17] transition-colors group-hover:text-[#36401f]"
          }
          style={isFeatured ? pixel : mono}
        >
          {article.title}
        </h3>
        <p className={isFeatured ? "mt-3 text-base leading-7 text-[#4d5145]" : "mt-1.5 text-sm leading-6 text-[#4d5145]"}>
          {article.description}
        </p>
      </Link>

      {article.children.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {article.children.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              className="rounded-full border border-[#d8dcd0] bg-[#f7f9ef] px-3 py-1.5 text-[11px] tracking-[0.35px] text-[#1c1f17] transition-colors hover:border-[#6b7d3a] hover:text-[#36401f]"
              style={mono}
            >
              {child.title}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function SectionLinks({ links }: { links: readonly LearnHubLink[] }) {
  return (
    <div className="mt-3 flex flex-wrap gap-2.5">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="rounded-full border border-[#d8dcd0] bg-[#fbfcf8] px-3.5 py-2 text-[12px] tracking-[0.25px] text-[#1c1f17] transition-colors hover:border-[#6b7d3a] hover:text-[#36401f]"
          style={mono}
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
}

function ArticleGroup({
  title,
  articles,
}: {
  title: string;
  articles: readonly LearnHubArticle[];
}) {
  if (articles.length === 0) {
    return null;
  }

  return (
    <section>
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
          {title}
        </p>
        <span
          className="rounded-full border border-[#d8dcd0] bg-[#fffffc] px-2.5 py-1 text-[10px] tracking-[0.35px] text-[#6b7068]"
          style={mono}
        >
          {formatArticleCount(articles.length)}
        </span>
      </div>
      <ol className="mt-3 divide-y divide-[#e3e7da]">
        {articles.map((article) => (
          <li key={article.href} className="list-none py-4 first:pt-0 last:pb-0">
            <ArticleRow article={article} />
          </li>
        ))}
      </ol>
    </section>
  );
}

function SectionAccordion({
  section,
  index,
}: {
  section: LearnHubSection;
  index: number;
}) {
  const articleCount = countSectionArticles(section);
  const sectionLabel = String(index + 1).padStart(2, "0");

  return (
    <details
      id={section.id}
      open={index === 0}
      className="group rounded-[28px] border border-[#d8dcd0] bg-[#fffffc] shadow-[0_1px_3px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-200 ease-out hover:-translate-y-[1px] hover:border-[#c7cfad] hover:shadow-[0_3px_12px_rgba(0,0,0,0.08)] [&[open]]:border-[#6b7d3a] [&[open]]:bg-[#fcfdf8] [&[open]]:shadow-[0_8px_24px_rgba(107,125,58,0.12)] [&[open]_.learn-accordion-chevron]:rotate-180 [&[open]_.learn-accordion-trigger]:bg-[#fcfdf8] [&_summary::-webkit-details-marker]:hidden"
    >
      <summary className="learn-accordion-trigger list-none cursor-pointer rounded-[28px] px-6 py-5 transition-colors active:scale-[0.998] md:px-8 md:py-6">
        <div className="flex items-start gap-4 md:gap-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#d4dbb8] bg-[#f7f9ef] text-[12px] tracking-[0.6px] text-[#6b7d3a] md:h-14 md:w-14 md:text-[13px]" style={mono}>
            {sectionLabel}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-[11px] tracking-[0.45px] text-[#6b7d3a]" style={mono}>
                {section.eyebrow}
              </span>
              <span
                className="rounded-full border border-[#d8dcd0] bg-[#fbfcf8] px-3 py-1.5 text-[11px] tracking-[0.45px] text-[#5a5e52]"
                style={mono}
              >
                {formatArticleCount(articleCount)}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2.5">
              <h3 className="text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                {section.title}
              </h3>
            </div>
            <p className="mt-3 max-w-[840px] text-base leading-7 text-[#3a3e32]">{section.summary}</p>
          </div>

          <div className="mt-1 hidden h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#d8dcd0] bg-[#fbfcf8] transition-colors duration-200 md:flex">
            <svg
              aria-hidden="true"
              viewBox="0 0 16 16"
              className="learn-accordion-chevron h-4 w-4 text-[#6b7d3a] transition-transform duration-200"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 6.5L8 10L12 6.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </summary>

      <div className="border-t border-[#dce0d2] px-6 py-6 md:px-8 md:py-8">
        <div className="space-y-6">
      <section className="rounded-[24px] border border-[#dce0d2] bg-[#f7f9ef] p-5 md:p-6">
            <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
              {learnPageContent.sectionLabels.startHere}
            </p>
            <div className="mt-4 max-w-[920px]">
              <ArticleRow article={section.featuredArticle} emphasis="featured" />
            </div>

            {section.relatedLinks.length > 0 ? (
              <div className="mt-5 border-t border-[#dce0d2] pt-4">
                <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                  {learnPageContent.sectionLabels.shortcuts}
                </p>
                <SectionLinks links={section.relatedLinks} />
              </div>
            ) : null}
          </section>

          {section.followOnArticles.length > 0 ? (
            <div className="border-t border-[#dce0d2] pt-6">
              <ArticleGroup title={learnPageContent.sectionLabels.goDeeper} articles={section.followOnArticles} />
            </div>
          ) : null}

          {section.supportingArticles.length > 0 ? (
            <div className="border-t border-[#dce0d2] pt-6">
              <ArticleGroup title={learnPageContent.sectionLabels.alsoUseful} articles={section.supportingArticles} />
            </div>
          ) : null}

        </div>
      </div>
    </details>
  );
}

export default function LearnIndexPage() {
  const { sections, allArticles } = learnHubContent;
  const { adjacentHubs, faqItems } = learnPageContent;

  return (
    <>
      <BreadcrumbJsonLd items={learnPageContent.breadcrumbItems} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <article className="px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-[1220px] py-12 md:py-20 lg:py-24">
          <FadeIn>
            <p className="mb-4 text-[11px] tracking-[0.8px] text-[#6b7d3a]" style={mono}>
              {learnPageContent.eyebrow}
            </p>
            <h1
              className="leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(32px, 6vw, 72px)" }}
            >
              {learnPageContent.hero.titleLines[0]}
              <br />
              {learnPageContent.hero.titleLines[1]}
            </h1>
            <p className="mt-6 max-w-[820px] text-base leading-7 text-[#4d5145] md:text-lg">
              {learnPageContent.hero.intro}
            </p>

            <p className="mt-6 text-[12px] tracking-[0.35px] text-[#6b7068]" style={mono}>
              {sections.length} categories. {allArticles.length} curated pages. {learnPageContent.hero.statsSuffix}
            </p>
          </FadeIn>

          <FadeIn className="mt-10">
            <section className="border-y border-[#dce0d2] py-6 md:py-8">
              <div className="max-w-[820px]">
                <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                  {learnPageContent.orientation.eyebrow}
                </p>
                <h2 className="mt-3 text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                  {learnPageContent.pathSectionIntro.title}
                </h2>
                <p className="mt-4 text-sm leading-6 text-[#4d5145] md:text-[15px]">
                  {learnPageContent.orientation.description}
                </p>
              </div>

              <ol className="mt-6 grid gap-4 md:grid-cols-3">
                {learnPageContent.orientation.steps.map((step) => (
                  <li key={step.step} className="list-none">
                    <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                      {step.step}
                    </p>
                    <h3 className="mt-3 text-[14px] leading-6 text-[#1c1f17]" style={mono}>
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-[#4d5145]">{step.description}</p>
                  </li>
                ))}
              </ol>
            </section>
          </FadeIn>

          <FadeIn className="mt-12">
            <section>
              <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                {learnPageContent.pathSectionIntro.eyebrow}
              </p>
              <p className="mt-3 max-w-[760px] text-sm leading-6 text-[#4d5145] md:text-[15px]">
                {learnPageContent.pathSectionIntro.description}
              </p>
            </section>
          </FadeIn>

          <div className="mt-8 space-y-4">
            {sections.map((section, index) => (
              <FadeIn key={section.id}>
                <SectionAccordion section={section} index={index} />
              </FadeIn>
            ))}
          </div>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#dce0d2]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                {learnPageContent.sectionLabels.needDifferentType}
              </p>
              <h2 className="mt-3 text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                {learnPageContent.sectionLabels.differentTypeTitle}
              </h2>
              <p className="mt-4 max-w-[760px] text-sm leading-6 text-[#4d5145] md:text-[15px]">
                {learnPageContent.sectionLabels.differentTypeBody}
              </p>
              <div className="mt-6 divide-y divide-[#dce0d2] border-y border-[#dce0d2]">
                {adjacentHubs.map((hub) => (
                  <Link
                    key={hub.href}
                    href={hub.href}
                    className="block py-5 transition-colors hover:text-[#1c1f17]"
                  >
                    <div className="grid gap-2 md:grid-cols-[190px_minmax(0,1fr)] md:gap-6">
                      <h3 className="text-base text-[#1c1f17]" style={mono}>
                        {hub.title}
                      </h3>
                      <p className="text-sm leading-6 text-[#4d5145]">{hub.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#dce0d2]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                {learnPageContent.sectionLabels.faqEyebrow}
              </p>
              <h2 className="mt-3 text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                {learnPageContent.sectionLabels.faqTitle}
              </h2>
              <div className="mt-6 divide-y divide-[#dce0d2] border-y border-[#dce0d2]">
                {faqItems.map((item, index) => (
                  <details
                    key={item.question}
                    open={index === 0}
                    className="group py-5 [&[open]_.learn-faq-chevron]:rotate-180 [&_summary::-webkit-details-marker]:hidden"
                  >
                    <summary
                      className="list-none cursor-pointer text-base text-[#1c1f17] marker:content-none"
                      style={mono}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <span>{item.question}</span>
                        <span className="mt-0.5 hidden h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#d8dcd0] bg-[#fffffc] md:flex">
                          <svg
                            aria-hidden="true"
                            viewBox="0 0 16 16"
                            className="learn-faq-chevron h-4 w-4 text-[#6b7d3a] transition-transform duration-200"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M4 6.5L8 10L12 6.5"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                      </div>
                    </summary>
                    <p className="mt-3 max-w-[760px] text-sm leading-6 text-[#4d5145]">{item.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          </FadeIn>
        </div>
      </article>
    </>
  );
}
