import type { Metadata } from "next";
import { createLocalizedMetadataForPath } from "@/lib/localized-metadata";
import { defaultLocale, type SiteLocale } from "@/lib/site";

const PATH = "/guides/how-to-add-vision-to-ai-agent";

export function getPageMetadata(locale: SiteLocale): Metadata {
  if (locale === "pt-br") {
    return createLocalizedMetadataForPath(locale, PATH, {
      title: "Como adicionar capacidades de visao a um agente de IA - imagem e video",
      description:
        "Guia passo a passo para adicionar capacidades de entendimento de imagem e analise de video a qualquer agente de IA usando a CLI do AnyCap. Dê ao seu agente olhos.",
    });
  }

  if (locale === "id") {
    return createLocalizedMetadataForPath(locale, PATH, {
      title: "Cara menambahkan kapabilitas vision ke agen AI - image dan video understanding",
      description:
        "Panduan langkah demi langkah untuk menambahkan image understanding dan video analysis ke agen AI apa pun menggunakan AnyCap CLI, lengkap dengan contoh penggunaan dan pola workflow.",
    });
  }

  return createLocalizedMetadataForPath(locale, PATH, {
    title: "How to Add Vision Capabilities to an AI Agent — Image and Video Understanding Guide",
    description:
      "Learn how to add image understanding and video analysis to Claude Code, Cursor, Codex, and other AI agents using AnyCap CLI, with setup steps, examples, and workflow patterns.",
  });
}

export const metadata: Metadata = getPageMetadata(defaultLocale);
