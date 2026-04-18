import type { Metadata } from "next";
import { createLocalizedMetadataForPath } from "@/lib/localized-metadata";
import { defaultLocale, getLocaleConfig, siteConfig, type SiteLocale } from "@/lib/site";

const PATH = "/guides/how-to-add-image-generation-to-ai-agent";

const metadataByLocale: Record<
  SiteLocale,
  { title: string; description: string; openGraphTitle: string; openGraphDescription: string }
> = {
  en: {
    title: "How to Add Image Generation to an AI Agent — Step-by-Step Guide",
    description:
      "Step-by-step guide to adding image generation capabilities to any AI agent — Claude Code, Cursor, or Codex — using AnyCap CLI and models like Seedream 5 and Nano Banana Pro.",
    openGraphTitle: "How to Add Image Generation to an AI Agent — Step-by-Step Guide",
    openGraphDescription:
      "Step-by-step guide to adding image generation capabilities to any AI agent — Claude Code, Cursor, or Codex — using AnyCap CLI and models like Seedream 5 and Nano Banana Pro.",
  },
  "pt-br": {
    title: "How to Add Image Generation to an AI Agent — Step-by-Step Guide",
    description:
      "Step-by-step guide to adding image generation capabilities to any AI agent — Claude Code, Cursor, or Codex — using AnyCap CLI and models like Seedream 5 and Nano Banana Pro.",
    openGraphTitle: "How to Add Image Generation to an AI Agent — Step-by-Step Guide",
    openGraphDescription:
      "Step-by-step guide to adding image generation capabilities to any AI agent — Claude Code, Cursor, or Codex — using AnyCap CLI and models like Seedream 5 and Nano Banana Pro.",
  },
  id: {
    title: "Cara menambahkan generasi gambar ke agen AI — panduan langkah demi langkah",
    description:
      "Panduan langkah demi langkah untuk menambahkan kapabilitas generasi gambar ke agen AI apa pun menggunakan AnyCap CLI serta model seperti Seedream 5 dan Nano Banana Pro.",
    openGraphTitle: "Cara menambahkan generasi gambar ke agen AI — panduan langkah demi langkah",
    openGraphDescription:
      "Pelajari setup AnyCap CLI, pemilihan model, dan workflow praktis agar agen AI dapat membuat gambar secara konsisten.",
  },
  de: {
    title: "Bildgenerierung zu einem KI-Agenten hinzufügen — Schritt-für-Schritt-Anleitung",
    description:
      "Schritt-für-Schritt-Anleitung zum Hinzufügen von Bildgenerierungs-Capabilities zu jedem KI-Agenten — Claude Code, Cursor oder Codex — mit der AnyCap CLI und Modellen wie Seedream 5 und Nano Banana Pro.",
    openGraphTitle: "Bildgenerierung zu einem KI-Agenten hinzufügen — Schritt-für-Schritt-Anleitung",
    openGraphDescription:
      "Lernen Sie das AnyCap-CLI-Setup, die Modellauswahl und praktische Workflows kennen, damit KI-Agenten Bilder konsistent generieren können.",
  },
};

export function getPageMetadata(locale: SiteLocale): Metadata {
  const localizedMetadata = metadataByLocale[locale] ?? metadataByLocale[defaultLocale];

  return createLocalizedMetadataForPath(locale, PATH, {
    title: localizedMetadata.title,
    description: localizedMetadata.description,
    alternates: { canonical: PATH },
    openGraph: {
      type: "website",
      locale: getLocaleConfig(locale).ogLocale,
      url: PATH,
      siteName: siteConfig.siteName,
      title: localizedMetadata.openGraphTitle,
      description: localizedMetadata.openGraphDescription,
    },
  });
}

export const metadata: Metadata = getPageMetadata(defaultLocale);
