import type { Metadata } from "next";
import { createLocalizedMetadataForPath } from "@/lib/localized-metadata";
import { defaultLocale, type SiteLocale } from "@/lib/site";

const PATH = "/learn/add-multimodal-capabilities-to-saas-chatbot";

export function getPageMetadata(locale: SiteLocale): Metadata {
  if (locale === "pt-br") {
    return createLocalizedMetadataForPath(locale, PATH, {
      title: "Como adicionar capacidades multimodais a um chatbot SaaS",
      description:
        "Guia pratico para equipes SaaS que estendem um chatbot com fluxos de imagem, video, web e entrega por meio de um runtime de capacidades.",
    });
  }

  if (locale === "id") {
    return createLocalizedMetadataForPath(locale, PATH, {
      title: "Cara menambahkan kapabilitas multimodal ke chatbot SaaS",
      description:
        "Panduan implementasi untuk tim SaaS yang ingin memperluas chatbot dengan workflow gambar, video, web, dan delivery melalui capability runtime.",
    });
  }

  return createLocalizedMetadataForPath(locale, PATH, {
    title: "How to add multimodal capabilities to a SaaS chatbot",
    description:
      "Implementation-focused guide for SaaS teams extending a chatbot with image, video, web, and delivery workflows through a capability runtime.",
  });
}

export const metadata: Metadata = getPageMetadata(defaultLocale);
