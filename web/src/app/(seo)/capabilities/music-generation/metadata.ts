import type { Metadata } from "next";
import { defaultLocale, getLocaleConfig, siteConfig, type SiteLocale } from "@/lib/site";

const metadataByLocale: Record<
  SiteLocale,
  { title: string; description: string; openGraphTitle: string; openGraphDescription: string }
> = {
  en: {
    title: "Music Generation API for AI agents - Text-to-music through one CLI",
    description:
      "Give AI agents music generation through AnyCap. Generate instrumental tracks and custom music prompts through one CLI instead of wiring a separate music generation API.",
    openGraphTitle: "Music Generation API for AI agents - Text-to-music through one CLI",
    openGraphDescription:
      "Add music generation to AI agents with one CLI, one auth flow, and one capability runtime.",
  },
  "pt-br": {
    title: "API de geração de música para agentes de IA - Texto para música em uma única CLI",
    description:
      "Dê geração de música para agentes de IA com AnyCap. Gere faixas instrumentais e prompts musicais personalizados por uma única CLI, sem integrar uma API separada de geração de música.",
    openGraphTitle: "API de geração de música para agentes de IA - Texto para música em uma única CLI",
    openGraphDescription:
      "Adicione geração de música a agentes de IA com uma CLI, um fluxo de autenticação e um runtime de capacidades.",
  },
  id: {
    title: "API generasi musik untuk agen AI - teks-ke-musik lewat satu CLI",
    description:
      "Tambahkan generasi musik ke agen AI lewat AnyCap. Buat track instrumental dan prompt musik kustom melalui satu CLI tanpa perlu merangkai API generasi musik terpisah.",
    openGraphTitle: "API generasi musik untuk agen AI - teks-ke-musik lewat satu CLI",
    openGraphDescription:
      "Tambahkan generasi musik ke agen AI dengan satu CLI, satu alur autentikasi, dan satu runtime kapabilitas.",
  },
};

export function getPageMetadata(locale: SiteLocale): Metadata {
  const localizedMetadata = metadataByLocale[locale] ?? metadataByLocale[defaultLocale];
  return {
    title: localizedMetadata.title,
    description: localizedMetadata.description,
    alternates: { canonical: "/capabilities/music-generation" },
    openGraph: {
      type: "website",
      locale: getLocaleConfig(locale).ogLocale,
      url: "/capabilities/music-generation",
      siteName: siteConfig.siteName,
      title: localizedMetadata.openGraphTitle,
      description: localizedMetadata.openGraphDescription,
    },
  };
}

export const metadata: Metadata = getPageMetadata(defaultLocale);
