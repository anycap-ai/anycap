import { defaultLocale, localizePublicPath, siteConfig } from "@/lib/site";

type ArticleSchemaInput = {
  headline: string;
  description: string;
  path: string;
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

function buildAbsoluteUrl(path: string) {
  if (/^https?:\/\//.test(path)) {
    return path;
  }

  return `${siteConfig.url}${localizePublicPath(defaultLocale, path)}`;
}

export function createTechArticleJsonLd({
  headline,
  description,
  path,
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
    url: buildAbsoluteUrl(path),
    mainEntityOfPage: buildAbsoluteUrl(path),
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

export function createSoftwareApplicationJsonLd({
  name,
  description,
  path,
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
    url: buildAbsoluteUrl(path),
    description,
    author: organizationReference,
    publisher: organizationReference,
    ...(downloadUrl ? { downloadUrl } : {}),
    ...(installUrl ? { installUrl } : {}),
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };
}
