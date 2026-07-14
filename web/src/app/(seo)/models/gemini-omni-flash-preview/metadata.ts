import type { Metadata } from "next";
import { createLocalizedMetadataForPath } from "@/lib/localized-metadata";
import { getCatalogModelForLocale } from "@/lib/seo/model-catalog";
import type { SiteLocale } from "@/lib/site";

const MODEL_SLUG = "gemini-omni-flash-preview";

export function getGeminiOmniFlashPreviewMetadata(
  locale: SiteLocale,
): Metadata {
  const localizedModel = getCatalogModelForLocale(MODEL_SLUG, locale);
  const metadataByLocale: Record<
    SiteLocale,
    { title: string; description: string; openGraphTitle: string }
  > = {
    en: {
      title: `${localizedModel.displayName} for AI agents - ${localizedModel.capabilityLabel} through AnyCap`,
      description: `${localizedModel.displayName} is available through AnyCap as ${localizedModel.modelId}. See supported modes, best-fit workflows, and exact CLI commands for agent use.`,
      openGraphTitle: `${localizedModel.displayName} for AI agents - AnyCap model guide`,
    },
    "pt-br": {
      title: `${localizedModel.displayName} para agentes de IA - ${localizedModel.capabilityLabel} via AnyCap`,
      description: `${localizedModel.displayName} esta disponivel no AnyCap como ${localizedModel.modelId}. Veja modos suportados, workflows recomendados e comandos CLI exatos para agentes.`,
      openGraphTitle: `${localizedModel.displayName} para agentes de IA - guia de modelo AnyCap`,
    },
    id: {
      title: `${localizedModel.displayName} untuk agen AI - ${localizedModel.capabilityLabel} lewat AnyCap`,
      description: `${localizedModel.displayName} tersedia di AnyCap sebagai ${localizedModel.modelId}. Lihat mode yang didukung, workflow terbaik, dan command CLI yang tepat untuk agen.`,
      openGraphTitle: `${localizedModel.displayName} untuk agen AI - panduan model AnyCap`,
    },
    de: {
      title: `${localizedModel.displayName} fuer KI-Agenten - ${localizedModel.capabilityLabel} ueber AnyCap`,
      description: `${localizedModel.displayName} ist in AnyCap als ${localizedModel.modelId} verfuegbar. Sehen Sie unterstuetzte Modi, passende Workflows und exakte CLI-Befehle fuer Agenten.`,
      openGraphTitle: `${localizedModel.displayName} fuer KI-Agenten - AnyCap Modellguide`,
    },
  };
  const localizedMetadata = metadataByLocale[locale];

  return createLocalizedMetadataForPath(locale, localizedModel.path, {
    title: localizedMetadata.title,
    description: localizedMetadata.description,
    openGraph: {
      type: "website",
      title: localizedMetadata.openGraphTitle,
      description: localizedModel.description,
    },
    other: {
      "article:published_time": "2026-07-04",
      "article:modified_time": "2026-07-04",
    },
  });
}
