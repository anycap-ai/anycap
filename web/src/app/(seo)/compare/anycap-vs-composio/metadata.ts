import type { Metadata } from "next";
import type { SiteLocale } from "@/lib/site";

export const ANYCAP_VS_COMPOSIO_PATH = "/compare/anycap-vs-composio";

const metadataByLocale: Record<
  SiteLocale,
  { title: string; description: string }
> = {
  en: {
    title: "AnyCap vs Composio — Agent capability comparison",
    description:
      "Compare AnyCap and Composio for giving AI agents capabilities. AnyCap is an agent-native capability runtime with one CLI; Composio is a tool integration platform.",
  },
  "pt-br": {
    title: "AnyCap vs Composio — Comparação de capacidades para agentes",
    description:
      "Compare AnyCap e Composio para dar capacidades a agentes de IA. AnyCap é um runtime de capacidades nativo para agentes com uma CLI; Composio é uma plataforma de integração de ferramentas.",
  },
  id: {
    title: "AnyCap vs Composio — Perbandingan kapabilitas agen",
    description:
      "Bandingkan AnyCap dan Composio untuk memberi kapabilitas ke agen AI. AnyCap adalah capability runtime agent-native dengan satu CLI; Composio adalah platform integrasi tools.",
  },
  de: {
    title: "AnyCap vs Composio – Vergleich der Agent-Capabilities",
    description:
      "Vergleichen Sie AnyCap und Composio, um KI-Agenten Capabilities zu geben. AnyCap ist eine agent-native Capability-Runtime mit einer CLI; Composio ist eine Tool-Integrationsplattform.",
  },
};

export function getAnyCapVsComposioMetadata(locale: SiteLocale): Metadata {
  const copy = metadataByLocale[locale];

  return {
    title: copy.title,
    description: copy.description,
    openGraph: {
      type: "website",
      title: copy.title,
      description: copy.description,
    },
  };
}
