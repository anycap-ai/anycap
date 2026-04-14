import type { Metadata } from "next";
import {
  getHubPageDefinition,
  type HubPageDefinition,
} from "@/lib/seo/hub-pages";
import { getLocaleConfig, siteConfig, type SiteLocale } from "@/lib/site";

export const COMPARE_PATH = "/compare";

type ComparePageData = HubPageDefinition & {
  breadcrumbItems: readonly { name: string; href: string }[];
};

const contentByLocale: Record<SiteLocale, ComparePageData> = {
  en: {
    ...getHubPageDefinition("en", "compare"),
    breadcrumbItems: [
      { name: "Home", href: "/" },
      { name: "Compare", href: COMPARE_PATH },
    ],
  },
  "pt-br": {
    ...getHubPageDefinition("pt-br", "compare"),
    breadcrumbItems: [
      { name: "Início", href: "/" },
      { name: "Comparar", href: COMPARE_PATH },
    ],
  },
  id: {
    ...getHubPageDefinition("id", "compare"),
    breadcrumbItems: [
      { name: "Home", href: "/" },
      { name: "Compare", href: COMPARE_PATH },
    ],
  },
};

export function getCompareMetadata(locale: SiteLocale): Metadata {
  const content = contentByLocale[locale] ?? contentByLocale.en;

  return {
    title: content.title,
    description: content.description,
    openGraph: {
      title: content.title,
      description: content.description,
      locale: getLocaleConfig(locale).ogLocale,
      siteName: siteConfig.siteName,
    },
  };
}

export function getComparePageData(locale: SiteLocale) {
  return contentByLocale[locale] ?? contentByLocale.en;
}
