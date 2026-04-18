import type { Metadata } from "next";
import { defaultLocale, getLocaleConfig, siteConfig, type SiteLocale } from "@/lib/site";

const metadataByLocale: Record<
  SiteLocale,
  { title: string; description: string; openGraphTitle: string; openGraphDescription: string }
> = {
  en: {
    title: "Grounded Web Search for AI agents - Answers with citations through one CLI",
    description:
      "Give AI agents grounded web search through AnyCap. Get synthesized answers with citations from live web search through one CLI instead of building a separate grounded search flow.",
    openGraphTitle: "Grounded Web Search for AI agents - Answers with citations through one CLI",
    openGraphDescription:
      "Add citation-backed grounded web search to AI agents with one CLI and one capability runtime.",
  },
  "pt-br": {
    title: "Busca na web com grounding para agentes de IA - respostas com citacoes em uma CLI",
    description:
      "Dê aos agentes busca na web com grounding com AnyCap. Obtenha respostas sintetizadas com citacoes de pesquisa ao vivo em uma unica CLI.",
    openGraphTitle: "Busca na web com grounding para agentes de IA - respostas com citacoes em uma CLI",
    openGraphDescription:
      "Adicione grounded web search com citacoes aos agentes de IA em uma unica capability runtime.",
  },
  id: {
    title: "Grounded Web Search untuk agen AI - jawaban bersitasi lewat satu CLI",
    description:
      "Berikan grounded web search ke agen AI dengan AnyCap. Dapatkan jawaban sintesis dengan sitasi dari pencarian web live lewat satu CLI tanpa membangun flow terpisah.",
    openGraphTitle: "Grounded Web Search untuk agen AI - jawaban bersitasi lewat satu CLI",
    openGraphDescription:
      "Tambahkan grounded web search berbasis sitasi ke agen AI melalui satu CLI dan satu capability runtime.",
  },
  de: {
    title: "Grounded Web Search für KI-Agenten – Antworten mit Quellenangaben über eine CLI",
    description:
      "Geben Sie KI-Agenten Grounded Web Search über AnyCap. Erhalten Sie synthetisierte Antworten mit Quellenangaben aus der Live-Websuche über eine einzige CLI, statt einen separaten Grounded-Search-Flow zu bauen.",
    openGraphTitle: "Grounded Web Search für KI-Agenten – Antworten mit Quellenangaben über eine CLI",
    openGraphDescription:
      "Statten Sie KI-Agenten mit Grounded Web Search inklusive Quellenbelegen über eine CLI und eine Capability-Runtime aus.",
  },
};

export function getPageMetadata(locale: SiteLocale): Metadata {
  const localizedMetadata = metadataByLocale[locale] ?? metadataByLocale[defaultLocale];
  return {
    title: localizedMetadata.title,
    description: localizedMetadata.description,
    alternates: { canonical: "/capabilities/grounded-web-search" },
    openGraph: {
      type: "website",
      locale: getLocaleConfig(locale).ogLocale,
      url: "/capabilities/grounded-web-search",
      siteName: siteConfig.siteName,
      title: localizedMetadata.openGraphTitle,
      description: localizedMetadata.openGraphDescription,
    },
  };
}

export const metadata: Metadata = getPageMetadata(defaultLocale);
