import type { Metadata } from "next";
import { createFaqPageJsonLd, createTechArticleJsonLd } from "@/lib/schema";
import { createLocalizedMetadataForPath } from "@/lib/localized-metadata";
import type { SiteLocale } from "@/lib/site";

export type ModelPageMetadataContent = {
  title: string;
  description: string;
  openGraphTitle: string;
  openGraphDescription: string;
  articleHeadline: string;
  articleDescription: string;
  articleAbout: readonly string[];
  articleKeywords: readonly string[];
};

export type ModelPageBaseContent = {
  metadata: ModelPageMetadataContent;
  faqItems: readonly { question: string; answer: string }[];
};

export type ModelPageGeneratedData = {
  modelGuideJsonLd: Record<string, unknown>;
  faqJsonLd: Record<string, unknown>;
};

export function createModelPageMetadata(
  locale: SiteLocale,
  pathname: string,
  metadata: ModelPageMetadataContent,
): Metadata {
  return createLocalizedMetadataForPath(locale, pathname, {
    title: metadata.title,
    description: metadata.description,
    openGraph: {
      type: "website",
      title: metadata.openGraphTitle,
      description: metadata.openGraphDescription,
    },
  });
}

export function createModelPageData<C extends Record<SiteLocale, ModelPageBaseContent>>(
  locale: SiteLocale,
  pathname: string,
  contentByLocale: C,
  lastUpdatedIso: string,
): C[SiteLocale] & ModelPageGeneratedData {
  const content = contentByLocale[locale] ?? contentByLocale.en;

  return {
    ...content,
    modelGuideJsonLd: createTechArticleJsonLd({
      headline: content.metadata.articleHeadline,
      description: content.metadata.articleDescription,
      path: pathname,
      locale,
      about: [...content.metadata.articleAbout],
      keywords: [...content.metadata.articleKeywords],
      dateModified: lastUpdatedIso,
    }),
    faqJsonLd: createFaqPageJsonLd(content.faqItems),
  } as C[SiteLocale] & ModelPageGeneratedData;
}
