import type { Metadata } from "next";
import {
  getHubPageDefinition,
  type HubPageDefinition,
} from "@/lib/seo/hub-pages";
import { getLocaleConfig, siteConfig, type SiteLocale } from "@/lib/site";

export const GUIDES_PATH = "/guides";

type GuidesPageData = HubPageDefinition & {
  breadcrumbItems: readonly { name: string; href: string }[];
};

const contentByLocale: Record<SiteLocale, GuidesPageData> = {
  en: {
    ...getHubPageDefinition("en", "guides"),
    breadcrumbItems: [
      { name: "Home", href: "/" },
      { name: "Guides", href: GUIDES_PATH },
    ],
  },
  "pt-br": {
    ...getHubPageDefinition("pt-br", "guides"),
    breadcrumbItems: [
      { name: "Início", href: "/" },
      { name: "Guias", href: GUIDES_PATH },
    ],
  },
  id: {
    ...getHubPageDefinition("id", "guides"),
    breadcrumbItems: [
      { name: "Home", href: "/" },
      { name: "Guides", href: GUIDES_PATH },
    ],
  },
  de: {
    ...getHubPageDefinition("de", "guides"),
    breadcrumbItems: [
      { name: "Start", href: "/" },
      { name: "Leitfäden", href: GUIDES_PATH },
    ],
  },
};

export function getGuidesMetadata(locale: SiteLocale): Metadata {
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

export function getGuidesPageData(locale: SiteLocale) {
  return contentByLocale[locale] ?? contentByLocale.en;
}
