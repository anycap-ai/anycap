import type { Metadata } from "next";
import { createLocalizedMetadataForPath } from "@/lib/localized-metadata";
import { defaultLocale, type SiteLocale } from "@/lib/site";

const PATH = "/guides/how-to-add-video-generation-to-ai-agent";

export function getPageMetadata(locale: SiteLocale): Metadata {
  if (locale === "pt-br") {
    return createLocalizedMetadataForPath(locale, PATH, {
      title: "Como adicionar geracao de video a um agente de IA - guia passo a passo",
      description:
        "Guia passo a passo para adicionar capacidades de geracao de video a qualquer agente de IA usando a CLI do AnyCap e modelos como Veo 3.1 e Kling 3.0.",
    });
  }

  if (locale === "id") {
    return createLocalizedMetadataForPath(locale, PATH, {
      title: "Cara menambahkan generasi video ke agen AI - panduan langkah demi langkah",
      description:
        "Panduan langkah demi langkah untuk menambahkan kapabilitas generasi video ke agen AI apa pun menggunakan AnyCap CLI, discovery model, struktur prompt, dan contoh workflow asinkron.",
    });
  }

  return createLocalizedMetadataForPath(locale, PATH, {
    title: "How to Add Video Generation to an AI Agent — Step-by-Step Setup Guide",
    description:
      "Step-by-step guide to adding video generation to Claude Code, Cursor, Codex, and other AI agents with AnyCap CLI, model discovery, prompt tips, and workflow examples.",
  });
}

export const metadata: Metadata = getPageMetadata(defaultLocale);
