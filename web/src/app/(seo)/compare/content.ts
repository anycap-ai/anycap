import type { Metadata } from "next";
import { hubPages } from "@/lib/hub-pages";
import { getLocaleConfig, siteConfig, type SiteLocale } from "@/lib/site";

export const COMPARE_PATH = "/compare";

type ComparePageData = typeof hubPages.compare & {
  breadcrumbItems: readonly { name: string; href: string }[];
};

const contentByLocale: Record<SiteLocale, ComparePageData> = {
  en: {
    ...hubPages.compare,
    breadcrumbItems: [
      { name: "Home", href: "/" },
      { name: "Compare", href: COMPARE_PATH },
    ],
  },
  "pt-br": {
    ...hubPages.compare,
    title: "Comparar — AnyCap vs ferramentas de agente e plataformas de API de mídia",
    description:
      "Compare o AnyCap com ferramentas de agente adjacentes, APIs de modelos e plataformas de mídia para que as equipes escolham a camada certa da stack.",
    eyebrow: "Comparar",
    heroLines: ["Compare o AnyCap", "com a camada certa da stack."],
    intro:
      "Estas comparações ajudam as equipes a decidir quando um runtime de capacidades é uma opção melhor do que juntar APIs de modelos, construtores hospedados ou superfícies de ferramentas voltadas para humanos.",
    items: [
      {
        title: "AnyCap vs Composio",
        href: "/compare/anycap-vs-composio",
        description: "Compare o design de runtime de capacidades com integrações no estilo conectores de aplicativos.",
      },
      {
        title: "AnyCap vs OpenAI Agent Builder",
        href: "/compare/anycap-vs-openai-agent-builder",
        description: "Veja onde o AnyCap se encaixa ao lado de fluxos hospedados de construção de agentes.",
      },
      {
        title: "AnyCap vs Replicate",
        href: "/compare/anycap-vs-replicate",
        description: "Compare um runtime de capacidades para agentes com uma API de inferência de modelos e uma plataforma de deploy.",
      },
      {
        title: "AnyCap vs fal.ai",
        href: "/compare/anycap-vs-fal-ai",
        description: "Compare acesso a capacidades entre agentes com uma stack de API generativa de mídia orientada a fila.",
      },
      {
        title: "AnyCap vs OpenClaw (Imagem)",
        href: "/compare/anycap-vs-openclaw-image-generation",
        description: "Compare geração de imagem nativa de agente com uma interface de edição de imagem de IA voltada para humanos.",
      },
      {
        title: "AnyCap vs OpenClaw (Vídeo)",
        href: "/compare/anycap-vs-openclaw-video-generation",
        description: "Compare geração de vídeo nativa de agente com uma interface de criação de vídeo de IA voltada para humanos.",
      },
    ],
    breadcrumbItems: [
      { name: "Início", href: "/" },
      { name: "Comparar", href: COMPARE_PATH },
    ],
  },
  id: {
    ...hubPages.compare,
    breadcrumbItems: [
      { name: "Home", href: "/" },
      { name: "Compare", href: COMPARE_PATH },
    ],
  },
};

export function getCompareMetadata(locale: SiteLocale): Metadata {
  const content = contentByLocale[locale] ?? contentByLocale.en;

  return {
    title: content.title,
    description: content.description,
    openGraph: {
      title: content.title,
      description: content.description,
      locale: getLocaleConfig(locale).ogLocale,
      siteName: siteConfig.siteName,
    },
  };
}

export function getComparePageData(locale: SiteLocale) {
  return contentByLocale[locale] ?? contentByLocale.en;
}
