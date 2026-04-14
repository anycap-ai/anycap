import type { Metadata } from "next";
import { createLocalizedMetadataForPath } from "@/lib/localized-metadata";
import { defaultLocale, type SiteLocale } from "@/lib/site";

const PATH = "/guides/how-to-add-video-generation-to-ai-agent";

export function getPageMetadata(locale: SiteLocale): Metadata {
  const isPtBr = locale === "pt-br";

  return createLocalizedMetadataForPath(locale, PATH, {
    title: isPtBr
      ? "Como adicionar geracao de video a um agente de IA - guia passo a passo"
      : "How to Add Video Generation to an AI Agent — Step-by-Step Guide",
    description: isPtBr
      ? "Guia passo a passo para adicionar capacidades de geracao de video a qualquer agente de IA usando a CLI do AnyCap e modelos como Veo 3.1 e Kling 3.0."
      : "Step-by-step guide to adding video generation capabilities to any AI agent using AnyCap CLI and models like Veo 3.1 and Kling 3.0.",
  });
}

export const metadata: Metadata = getPageMetadata(defaultLocale);
