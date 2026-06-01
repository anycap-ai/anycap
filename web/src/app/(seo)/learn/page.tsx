import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { FadeIn } from "@/components/ui/FadeIn";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { getLearnHubContent, type LearnHubArticle, type LearnHubLink, type LearnHubSection } from "@/lib/seo/learn-hub";
import { createLocalizedMetadataForPath } from "@/lib/localized-metadata";
import { createFaqPageJsonLd } from "@/lib/schema";
import { getRequestLocale } from "@/lib/request-locale";
import { defaultLocale, getLocalizedRouteUrl, type SiteLocale } from "@/lib/site";
import { LEARN_PATH, getLearnMetadata, getLearnPageData } from "./content";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

type LearnPageContent = ReturnType<typeof getLearnPageData>;

const learnHubContent = getLearnHubContent();

export const metadata: Metadata = createLocalizedMetadataForPath(
  defaultLocale,
  LEARN_PATH,
  getLearnMetadata(defaultLocale),
);

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

function formatArticleCount(count: number, locale: SiteLocale) {
  if (locale === "pt-br") {
    return `${count} artigo${count === 1 ? "" : "s"}`;
  }

  if (locale === "de") {
    return `${count} Artikel`;
  }

  return `${count} article${count === 1 ? "" : "s"}`;
}

function FeaturedArticle({ article }: { article: LearnHubArticle }) {
  return (
    <div className="border border-[#dce0d2] bg-[#fffffc] p-6 md:p-8">
      <Link href={article.href} className="group block">
        <h4
          className="text-[22px] leading-8 text-[#1c1f17] transition-colors group-hover:text-[#36401f] md:text-[28px] md:leading-9"
          style={pixel}
        >
          {article.title}
        </h4>
        <p className="mt-3 max-w-[68ch] text-[15px] leading-7 text-[#4d5145]">
          {article.description}
        </p>
      </Link>

      {article.children.length > 0 ? (
        <div className="mt-5 flex flex-wrap gap-2">
          {article.children.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              className="rounded-full border border-[#d8dcd0] bg-[#f4f5f0] px-3 py-1.5 text-[12px] tracking-[0.2px] text-[#1c1f17] transition-colors hover:border-[#6b7d3a] hover:text-[#36401f]"
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

function SupportingArticle({ article }: { article: LearnHubArticle }) {
  return (
    <div>
      <Link href={article.href} className="group block">
        <h4
          className="text-[17px] leading-7 text-[#1c1f17] transition-colors group-hover:text-[#36401f]"
          style={mono}
        >
          {article.title}
        </h4>
        <p className="mt-1.5 max-w-[68ch] text-[14px] leading-6 text-[#4d5145]">
          {article.description}
        </p>
      </Link>

      {article.children.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {article.children.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              className="rounded-full border border-[#d8dcd0] bg-[#f4f5f0] px-2.5 py-1 text-[11px] tracking-[0.2px] text-[#3a3e32] transition-colors hover:border-[#6b7d3a] hover:text-[#36401f]"
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

function ShortcutLinks({ links }: { links: readonly LearnHubLink[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="inline-flex items-center gap-1.5 text-[13px] tracking-[0.1px] text-[#4d5145] underline decoration-[#c7cfad] decoration-1 underline-offset-[5px] transition-colors hover:text-[#36401f] hover:decoration-[#6b7d3a]"
          style={mono}
        >
          {link.label}
          <span aria-hidden="true" className="text-[#6b7d3a]">›</span>
        </Link>
      ))}
    </div>
  );
}

function SectionRow({
  section,
  index,
  locale,
  totalCount,
}: {
  section: LearnHubSection;
  index: number;
  locale: SiteLocale;
  totalCount: number;
}) {
  const articleCount = countSectionArticles(section);

  return (
    <details
      id={section.id}
      open={index === 0}
      className="group border-t border-[#dce0d2] [&[open]_.learn-section-chevron]:rotate-180 [&[open]_.learn-section-title]:text-[#36401f] [&_summary::-webkit-details-marker]:hidden last:border-b last:border-[#dce0d2]"
    >
      <summary className="list-none cursor-pointer py-7 md:py-9">
        <div className="flex items-start gap-6 md:gap-10">
          <div className="min-w-0 flex-1">
            <h3
              className="learn-section-title text-[26px] leading-9 text-[#1c1f17] transition-colors md:text-[34px] md:leading-[1.15]"
              style={pixel}
            >
              {section.title}
            </h3>
            <p className="mt-3 max-w-[64ch] text-[15px] leading-7 text-[#4d5145]">
              {section.summary}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-5 pt-2">
            <span className="hidden text-[12px] tracking-[0.2px] text-[#6b7068] md:inline" style={mono}>
              {formatArticleCount(articleCount, locale)}
            </span>
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="learn-section-chevron h-5 w-5 text-[#6b7d3a] transition-transform duration-200"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 9.5L12 15.5L18 9.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </summary>

      <div className="pb-10 md:pb-14">
        <div className="grid gap-8 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] md:gap-12">
          <div>
            <FeaturedArticle article={section.featuredArticle} />

            {section.relatedLinks.length > 0 ? (
              <div className="mt-5">
                <ShortcutLinks links={section.relatedLinks} />
              </div>
            ) : null}
          </div>

          {section.supportingArticles.length > 0 ? (
            <div className="md:pt-2">
              <ol className="space-y-6">
                {section.supportingArticles.map((article) => (
                  <li key={article.href} className="list-none">
                    <SupportingArticle article={article} />
                  </li>
                ))}
              </ol>
            </div>
          ) : null}
        </div>
      </div>
    </details>
  );
}

export default async function LearnIndexPage() {
  const locale = await getRequestLocale();
  const learnPageContent = getLearnPageData(locale);
  const { sections, allArticles } = learnHubContent;
  const { adjacentHubs, faqItems } = learnPageContent;
  const faqJsonLd = createFaqPageJsonLd(learnPageContent.faqItems);
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: learnPageContent.metadata.title,
    description: learnPageContent.metadata.description,
    url: getLocalizedRouteUrl(locale, "/learn"),
    hasPart: learnHubContent.allArticles.map((article) => ({
      "@type": "WebPage",
      name: article.title,
      description: article.description,
      url: getLocalizedRouteUrl(locale, article.href),
    })),
  } as const;
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: learnHubContent.allArticles.map((article, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: article.title,
      url: getLocalizedRouteUrl(locale, article.href),
    })),
  } as const;

  const heroTitle = `${learnPageContent.hero.titleLines[0]} ${learnPageContent.hero.titleLines[1]}`;

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
        <div className="mx-auto max-w-[1180px] py-16 md:py-24 lg:py-28">
          <FadeIn>
            <p className="mb-5 text-[11px] tracking-[0.8px] text-[#6b7d3a]" style={mono}>
              {learnPageContent.eyebrow}
            </p>
            <h1
              className="max-w-[20ch] leading-[1.05] tracking-[-0.02em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(34px, 5.6vw, 64px)" }}
            >
              {heroTitle}
            </h1>
            <p className="mt-7 max-w-[64ch] text-[17px] leading-8 text-[#3a3e32] md:text-[18px]">
              {learnPageContent.hero.intro}
            </p>
          </FadeIn>

          <FadeIn className="mt-16 md:mt-20">
            <section>
              <h2
                className="max-w-[26ch] text-[24px] leading-9 text-[#1c1f17] md:text-[30px]"
                style={pixel}
              >
                {learnPageContent.orientation.title}
              </h2>
              <p className="mt-4 max-w-[64ch] text-[15px] leading-7 text-[#4d5145]">
                {learnPageContent.orientation.description}
              </p>

              <ol className="mt-10 grid gap-y-8 gap-x-10 md:grid-cols-3">
                {learnPageContent.orientation.steps.map((step) => (
                  <li
                    key={step.step}
                    className="list-none border-t border-[#6b7d3a] pt-5"
                  >
                    <h3
                      className="text-[17px] leading-7 text-[#1c1f17]"
                      style={mono}
                    >
                      {step.title}
                    </h3>
                    <p className="mt-2.5 text-[14px] leading-6 text-[#4d5145]">
                      {step.description}
                    </p>
                  </li>
                ))}
              </ol>
            </section>
          </FadeIn>

          <FadeIn className="mt-20 md:mt-28">
            <section>
              <div className="flex items-end justify-between gap-6">
                <h2
                  className="max-w-[22ch] text-[26px] leading-9 text-[#1c1f17] md:text-[34px] md:leading-[1.15]"
                  style={pixel}
                >
                  {learnPageContent.pathSectionIntro.title}
                </h2>
                <span
                  className="hidden whitespace-nowrap pb-2 text-[12px] tracking-[0.2px] text-[#6b7068] md:inline"
                  style={mono}
                >
                  {sections.length} {locale === "pt-br" ? "caminhos" : locale === "de" ? "Pfade" : "paths"} · {allArticles.length} {locale === "pt-br" ? "artigos" : locale === "de" ? "Artikel" : "articles"}
                </span>
              </div>
              <p className="mt-4 max-w-[64ch] text-[15px] leading-7 text-[#4d5145]">
                {learnPageContent.pathSectionIntro.description}
              </p>
            </section>
          </FadeIn>

          <div className="mt-10 md:mt-14">
            {sections.map((section, index) => (
              <SectionRow
                key={section.id}
                section={section}
                index={index}
                locale={locale}
                totalCount={sections.length}
              />
            ))}
          </div>

          <FadeIn>
            <section className="mt-24 md:mt-32">
              <h2
                className="max-w-[26ch] text-[24px] leading-9 text-[#1c1f17] md:text-[30px]"
                style={pixel}
              >
                {learnPageContent.sectionLabels.differentTypeTitle}
              </h2>
              <p className="mt-4 max-w-[64ch] text-[15px] leading-7 text-[#4d5145]">
                {learnPageContent.sectionLabels.differentTypeBody}
              </p>
              <div className="mt-8 border-t border-[#dce0d2]">
                {adjacentHubs.map((hub) => (
                  <Link
                    key={hub.href}
                    href={hub.href}
                    className="group block border-b border-[#dce0d2] py-6 transition-colors hover:bg-[#fffffc] md:py-7"
                  >
                    <div className="grid gap-2 md:grid-cols-[200px_minmax(0,1fr)_auto] md:gap-8 md:items-baseline">
                      <h3
                        className="text-[18px] text-[#1c1f17] transition-colors group-hover:text-[#36401f]"
                        style={pixel}
                      >
                        {hub.title}
                      </h3>
                      <p className="max-w-[64ch] text-[14px] leading-6 text-[#4d5145]">
                        {hub.description}
                      </p>
                      <span
                        aria-hidden="true"
                        className="hidden text-[16px] text-[#6b7d3a] transition-transform duration-200 group-hover:translate-x-1 md:inline"
                      >
                        →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </FadeIn>

          <FadeIn>
            <section className="mt-24 md:mt-32">
              <p className="text-[11px] tracking-[0.8px] text-[#6b7d3a]" style={mono}>
                {learnPageContent.sectionLabels.faqEyebrow}
              </p>
              <h2
                className="mt-4 max-w-[26ch] text-[26px] leading-9 text-[#1c1f17] md:text-[34px] md:leading-[1.15]"
                style={pixel}
              >
                {learnPageContent.sectionLabels.faqTitle}
              </h2>
              <div className="mt-10 border-t border-[#dce0d2]">
                {faqItems.map((item, index) => (
                  <details
                    key={item.question}
                    open={index === 0}
                    className="group border-b border-[#dce0d2] py-6 [&[open]_.learn-faq-chevron]:rotate-180 [&_summary::-webkit-details-marker]:hidden md:py-7"
                  >
                    <summary
                      className="list-none cursor-pointer marker:content-none"
                    >
                      <div className="flex items-start justify-between gap-6">
                        <span
                          className="text-[17px] leading-7 text-[#1c1f17] md:text-[18px]"
                          style={pixel}
                        >
                          {item.question}
                        </span>
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 24 24"
                          className="learn-faq-chevron mt-1 h-5 w-5 shrink-0 text-[#6b7d3a] transition-transform duration-200"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M6 9.5L12 15.5L18 9.5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </summary>
                    <p className="mt-4 max-w-[68ch] text-[15px] leading-7 text-[#4d5145]">
                      {item.answer}
                    </p>
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
