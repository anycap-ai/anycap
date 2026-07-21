import type { Metadata } from "next";
import { createLocalizedMetadataForPath } from "@/lib/localized-metadata";
import { defaultLocale, type SiteLocale } from "@/lib/site";
import { VIDEO_AGENT_GUIDE_PATH } from "./content";

const metadataByLocale: Record<SiteLocale, { title: string; description: string }> = {
  en: {
    title: "How to Add Video Generation to an AI Agent — Step-by-Step Setup Guide",
    description:
      "Step-by-step guide to adding video generation to Claude Code, Cursor, and Codex with the AnyCap CLI, including model and schema discovery plus practical workflow examples.",
  },
  "pt-br": {
    title: "Como adicionar geração de vídeo a um agente de IA — guia passo a passo",
    description:
      "Guia passo a passo para adicionar geração de vídeo ao Claude Code, Cursor e Codex com a CLI do AnyCap, incluindo descoberta de modelos e schemas e exemplos práticos de fluxo.",
  },
  id: {
    title: "Cara menambahkan generasi video ke agen AI — panduan langkah demi langkah",
    description:
      "Panduan langkah demi langkah untuk menambahkan generasi video ke Claude Code, Cursor, dan Codex dengan AnyCap CLI, termasuk penemuan model dan skema serta contoh alur praktis.",
  },
  de: {
    title: "Videogenerierung zu einem KI-Agenten hinzufügen — Einrichtungsanleitung",
    description:
      "Einrichtungsanleitung für Videogenerierung in Claude Code, Cursor und Codex mit der AnyCap CLI, einschließlich Modell- und Schemaermittlung sowie praktischer Workflow-Beispiele.",
  },
};

export function getPageMetadata(locale: SiteLocale): Metadata {
  const copy = metadataByLocale[locale];

  return createLocalizedMetadataForPath(locale, VIDEO_AGENT_GUIDE_PATH, {
    ...copy,
    openGraph: {
      type: "article",
      title: copy.title,
      description: copy.description,
    },
  });
}

export const metadata: Metadata = getPageMetadata(defaultLocale);
