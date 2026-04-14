import type { Metadata } from "next";
import { getLocaleConfig, siteConfig, type SiteLocale } from "@/lib/site";

export const WEB_CRAWL_PATH = "/capabilities/web-crawl";

type WebCrawlMetadataContent = {
  title: string;
  description: string;
  openGraphTitle: string;
  openGraphDescription: string;
};

const metadataByLocale: Record<SiteLocale, WebCrawlMetadataContent> = {
  en: {
    title: "Web Crawl API for AI agents - Content extraction and Markdown conversion",
    description:
      "Give AI agents web crawl through AnyCap. Convert web pages to clean Markdown and content-ready output through one CLI instead of wiring a separate crawl or extraction API.",
    openGraphTitle: "Web Crawl API for AI agents - Content extraction and Markdown conversion",
    openGraphDescription:
      "Add web crawl and content extraction to AI agents with one CLI and one capability runtime.",
  },
  "pt-br": {
    title: "API de web crawl para agentes de IA - Extração de conteúdo e conversão para Markdown",
    description:
      "Dê web crawl a agentes de IA com o AnyCap. Converta páginas da web em Markdown limpo e conteúdo pronto para uso com uma única CLI, sem precisar integrar uma API separada de crawl ou extração.",
    openGraphTitle:
      "API de web crawl para agentes de IA - Extração de conteúdo e conversão para Markdown",
    openGraphDescription:
      "Adicione web crawl e extração de conteúdo a agentes de IA com uma única CLI e um único runtime de capacidades.",
  },
  id: {
    title: "Web Crawl API for AI agents - Content extraction and Markdown conversion",
    description:
      "Give AI agents web crawl through AnyCap. Convert web pages to clean Markdown and content-ready output through one CLI instead of wiring a separate crawl or extraction API.",
    openGraphTitle: "Web Crawl API for AI agents - Content extraction and Markdown conversion",
    openGraphDescription:
      "Add web crawl and content extraction to AI agents with one CLI and one capability runtime.",
  },
};

export function getWebCrawlMetadata(locale: SiteLocale): Metadata {
  const content = metadataByLocale[locale] ?? metadataByLocale.en;

  return {
    title: content.title,
    description: content.description,
    openGraph: {
      type: "website",
      locale: getLocaleConfig(locale).ogLocale,
      url: WEB_CRAWL_PATH,
      siteName: siteConfig.siteName,
      title: content.openGraphTitle,
      description: content.openGraphDescription,
    },
  };
}
