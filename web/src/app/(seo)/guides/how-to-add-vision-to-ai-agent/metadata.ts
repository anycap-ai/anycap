import type { Metadata } from "next";
import { createLocalizedMetadataForPath } from "@/lib/localized-metadata";
import { defaultLocale, type SiteLocale } from "@/lib/site";

const PATH = "/guides/how-to-add-vision-to-ai-agent";

export function getPageMetadata(locale: SiteLocale): Metadata {
  const isPtBr = locale === "pt-br";

  return createLocalizedMetadataForPath(locale, PATH, {
    title: isPtBr
      ? "Como adicionar capacidades de visao a um agente de IA - imagem e video"
      : "How to Add Vision Capabilities to an AI Agent — Image and Video Understanding Guide",
    description: isPtBr
      ? "Guia passo a passo para adicionar capacidades de entendimento de imagem e analise de video a qualquer agente de IA usando a CLI do AnyCap. Dê ao seu agente olhos."
      : "Learn how to add image understanding and video analysis to Claude Code, Cursor, Codex, and other AI agents using AnyCap CLI, with setup steps, examples, and workflow patterns.",
  });
}

export const metadata: Metadata = getPageMetadata(defaultLocale);
