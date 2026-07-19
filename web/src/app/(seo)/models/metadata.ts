import type { Metadata } from "next";
import { getLocaleConfig, siteConfig, type SiteLocale } from "@/lib/site";

export const MODELS_PATH = "/models";

type ModelsMeta = {
  title: string;
  description: string;
};

// Localized <title>/description for the models hub. The page body is already
// localized in page.tsx; this keeps the metadata title from falling back to
// English on /{locale}/models. Registered in lib/localized-page.ts.
const modelsMetaByLocale: Record<SiteLocale, ModelsMeta> = {
  en: {
    title: "Models — Multimodal models available through AnyCap",
    description:
      "Multimodal models available through AnyCap for AI agent workflows, including active image, video, music, and audio models with CLI IDs, modes, and workflow guidance.",
  },
  "pt-br": {
    title: "Modelos — Modelos multimodais disponíveis no AnyCap",
    description:
      "Modelos multimodais disponíveis no AnyCap para fluxos de agentes de IA, incluindo modelos ativos de imagem, vídeo, música e áudio, com IDs de CLI, modos e orientação de fluxo.",
  },
  id: {
    title: "Model — Model multimodal yang tersedia melalui AnyCap",
    description:
      "Model multimodal yang tersedia melalui AnyCap untuk alur kerja agen AI, termasuk model gambar, video, musik, dan audio aktif, dengan ID CLI, mode, dan panduan alur kerja.",
  },
  de: {
    title: "Modelle – Multimodale Modelle, verfügbar über AnyCap",
    description:
      "Multimodale Modelle über AnyCap für KI-Agenten-Workflows, einschließlich aktiver Bild-, Video-, Musik- und Audiomodelle mit CLI-IDs, Modi und Workflow-Anleitung.",
  },
};

export function getModelsMetadata(locale: SiteLocale): Metadata {
  const meta = modelsMetaByLocale[locale] ?? modelsMetaByLocale.en;
  return {
    title: meta.title,
    description: meta.description,
    openGraph: {
      type: "website",
      locale: getLocaleConfig(locale).ogLocale,
      url: MODELS_PATH,
      siteName: siteConfig.siteName,
      title: meta.title,
      description: meta.description,
    },
  };
}
