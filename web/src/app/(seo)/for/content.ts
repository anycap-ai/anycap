import type { Metadata } from "next";
import { hubPages } from "@/lib/hub-pages";
import { getLocaleConfig, siteConfig, type SiteLocale } from "@/lib/site";

export const FOR_PATH = "/for";

type ForPageData = typeof hubPages.for & {
  breadcrumbItems: readonly { name: string; href: string }[];
};

const contentByLocale: Record<SiteLocale, ForPageData> = {
  en: {
    ...hubPages.for,
    breadcrumbItems: [
      { name: "Home", href: "/" },
      { name: "Equip Agents", href: FOR_PATH },
    ],
  },
  "pt-br": {
    ...hubPages.for,
    title: "Equipar agentes | Adicione capacidades ausentes aos agentes de IA",
    description:
      "Escolha seu agente e adicione a camada de capacidades que ele não traz de fábrica. Equipe Claude Code, Cursor, Codex e Manus com fluxos de imagem, vídeo, visão e recuperação por meio do AnyCap.",
    eyebrow: "Equipar agentes",
    heroLines: ["Mantenha o agente que você já usa.", "Adicione as capacidades que faltam."],
    intro:
      "Estas páginas mostram o caminho mais curto para equipar Claude Code, Cursor, Codex e Manus com geração de imagem, geração de vídeo, entendimento de imagem, análise de vídeo e fluxos de capacidades relacionadas por meio de um único runtime.",
    items: [
      {
        title: "Claude Code",
        href: "/for/claude-code",
        description: "Adicione fluxos de imagem, vídeo e visão ao Claude Code por meio de um único caminho de instalação.",
      },
      {
        title: "Cursor",
        href: "/for/cursor",
        description: "Equipe o Cursor com geração de imagem, geração de vídeo e capacidades de análise visual.",
      },
      {
        title: "Codex",
        href: "/for/codex",
        description: "Adicione capacidades multimodais ao Codex sem conectar SDKs de provedor separados.",
      },
      {
        title: "Manus",
        href: "/for/manus",
        description: "Dê ao Manus um runtime de capacidades unificado para tarefas de imagem, vídeo e visão.",
      },
    ],
    breadcrumbItems: [
      { name: "Início", href: "/" },
      { name: "Equipar agentes", href: FOR_PATH },
    ],
  },
  id: {
    ...hubPages.for,
    breadcrumbItems: [
      { name: "Home", href: "/" },
      { name: "Equip Agents", href: FOR_PATH },
    ],
  },
};

export function getForMetadata(locale: SiteLocale): Metadata {
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

export function getForPageData(locale: SiteLocale) {
  return contentByLocale[locale] ?? contentByLocale.en;
}
