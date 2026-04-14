import type { Metadata } from "next";
import {
  getHubPageDefinition,
  type HubPageDefinition,
} from "@/lib/seo/hub-pages";
import { getLocaleConfig, siteConfig, type SiteLocale } from "@/lib/site";

export const FOR_PATH = "/for";

type ForPageData = HubPageDefinition & {
  breadcrumbItems: readonly { name: string; href: string }[];
};

const contentByLocale: Record<SiteLocale, ForPageData> = {
  en: {
    ...getHubPageDefinition("en", "for"),
    breadcrumbItems: [
      { name: "Home", href: "/" },
      { name: "Equip Agents", href: FOR_PATH },
    ],
  },
  "pt-br": {
    ...getHubPageDefinition("pt-br", "for"),
    breadcrumbItems: [
      { name: "Início", href: "/" },
      { name: "Equipar agentes", href: FOR_PATH },
    ],
  },
  id: {
    ...getHubPageDefinition("id", "for"),
    breadcrumbItems: [
      { name: "Home", href: "/" },
      { name: "Equip Agents", href: FOR_PATH },
    ],
  },
};

export function getForMetadata(locale: SiteLocale): Metadata {
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

export function getForPageData(locale: SiteLocale) {
  return contentByLocale[locale] ?? contentByLocale.en;
}
