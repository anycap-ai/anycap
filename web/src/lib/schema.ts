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

type SoftwareApplicationSchemaInput = {
  name: string;
  description: string;
  path: string;
  locale?: SiteLocale;
  applicationCategory?: string;
  operatingSystem?: string;
  downloadUrl?: string;
  installUrl?: string;
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
    ...(datePublished ? { datePublished } : {}),
    ...(dateModified ? { dateModified } : {}),
  };
}

export function createFaqPageJsonLd(items: readonly FaqPageItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.question,
      description: item.answer,
    })),
  };
}

export function createSoftwareApplicationJsonLd({
  name,
  description,
  path,
  locale,
  applicationCategory = "DeveloperApplication",
  operatingSystem = "macOS, Linux, Windows",
  downloadUrl,
  installUrl,
}: SoftwareApplicationSchemaInput) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name,
    applicationCategory,
    operatingSystem,
    url: buildAbsoluteUrl(path, locale),
    description,
    author: organizationReference,
    publisher: organizationReference,
    ...(downloadUrl ? { downloadUrl } : {}),
    ...(installUrl ? { installUrl } : {}),
    offers: {
      "@type": "Offer",
      price: 0,
      priceCurrency: "USD",
    },
  };
}
