import type { Metadata } from "next";
import { defaultLocale, getLocaleConfig, siteConfig, type SiteLocale } from "@/lib/site";

const metadataByLocale: Record<
  SiteLocale,
  { title: string; description: string; openGraphTitle: string; openGraphDescription: string }
> = {
  en: {
    title: "Audio Analysis API for AI agents - Audio understanding and transcription",
    description:
      "Give AI agents audio understanding through AnyCap. Analyze recordings, transcribe spoken content, and extract audio context through one CLI command instead of wiring a separate audio analysis stack.",
    openGraphTitle: "Audio Analysis API for AI agents - Audio understanding and transcription",
    openGraphDescription:
      "Add audio understanding, transcription, and audio analysis to AI agents with one CLI.",
  },
  "pt-br": {
    title: "API de analise de audio para agentes de IA - entendimento de audio e transcricao",
    description:
      "Dê entendimento de audio para agentes de IA com AnyCap. Analise gravacoes, transcreva conteudo falado e extraia contexto por um unico comando de CLI, sem montar uma stack separada.",
    openGraphTitle: "API de analise de audio para agentes de IA - entendimento de audio e transcricao",
    openGraphDescription:
      "Adicione entendimento de audio, transcricao e analise de audio a agentes de IA com uma unica CLI.",
  },
  id: {
    title: "API analisis audio untuk agen AI - pemahaman audio dan transkripsi",
    description:
      "Berikan pemahaman audio ke agen AI melalui AnyCap. Analisis rekaman, transkripsikan percakapan, dan ambil konteks audio lewat satu perintah CLI tanpa merangkai stack analisis audio terpisah.",
    openGraphTitle: "API analisis audio untuk agen AI - pemahaman audio dan transkripsi",
    openGraphDescription:
      "Tambahkan pemahaman audio, transkripsi, dan analisis audio ke agen AI lewat satu CLI.",
  },
};

export function getPageMetadata(locale: SiteLocale): Metadata {
  const localizedMetadata = metadataByLocale[locale] ?? metadataByLocale[defaultLocale];
  return {
    title: localizedMetadata.title,
    description: localizedMetadata.description,
    alternates: { canonical: "/capabilities/audio-understanding" },
    openGraph: {
      type: "website",
      locale: getLocaleConfig(locale).ogLocale,
      url: "/capabilities/audio-understanding",
      siteName: siteConfig.siteName,
      title: localizedMetadata.openGraphTitle,
      description: localizedMetadata.openGraphDescription,
    },
  };
}

export const metadata: Metadata = getPageMetadata(defaultLocale);
