import { defaultLocale, localizePublicPath, siteConfig, type SiteLocale } from "@/lib/site";

type ArticleSchemaInput = {
  headline: string;
  description: string;
  path: string;
  locale?: SiteLocale;
  about?: string[];
  keywords?: string[];
  datePublished?: string;
  dateModified?: string;
};

type FaqPageItem = {
  question: string;
  answer: string;
};

const organizationReference = {
  "@type": "Organization",
  name: siteConfig.siteName,
  url: siteConfig.url,
} as const;

function buildAbsoluteUrl(path: string, locale: SiteLocale = defaultLocale) {
  if (/^https?:\/\//.test(path)) {
    return path;
  }

  return `${siteConfig.url}${localizePublicPath(locale, path)}`;
}

export function createTechArticleJsonLd({
  headline,
  description,
  path,
  locale,
  about = [],
  keywords = [],
  datePublished,
  dateModified,
}: ArticleSchemaInput) {
  const resolvedDatePublished = datePublished ?? dateModified;

  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline,
    description,
    url: buildAbsoluteUrl(path, locale),
    mainEntityOfPage: buildAbsoluteUrl(path, locale),
    author: organizationReference,
    publisher: organizationReference,
    ...(about.length > 0
      ? {
          about: about.map((name) => ({
            "@type": "Thing",
            name,
          })),
        }
      : {}),
    ...(keywords.length > 0
      ? {
          keywords: keywords.join(", "),
        }
      : {}),
    ...(resolvedDatePublished ? { datePublished: resolvedDatePublished } : {}),
    ...(dateModified ? { dateModified } : {}),
  };
}

export function createFaqPageJsonLd(items: readonly FaqPageItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}
