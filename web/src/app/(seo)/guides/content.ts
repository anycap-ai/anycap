import type { Metadata } from "next";
import { hubPages } from "@/lib/hub-pages";
import { getLocaleConfig, siteConfig, type SiteLocale } from "@/lib/site";

export const GUIDES_PATH = "/guides";

type GuidesPageData = typeof hubPages.guides & {
  breadcrumbItems: readonly { name: string; href: string }[];
};

const contentByLocale: Record<SiteLocale, GuidesPageData> = {
  en: {
    ...hubPages.guides,
    breadcrumbItems: [
      { name: "Home", href: "/" },
      { name: "Guides", href: GUIDES_PATH },
    ],
  },
  "pt-br": {
    ...hubPages.guides,
    title: "Guias — ajuda prática de configuração e implementação para o AnyCap",
    description:
      "Explore os guias do AnyCap para instalação, engenharia de contexto para agentes, integração de ferramentas e padrões de implementação para usuários, criadores e builders.",
    eyebrow: "Guias",
    heroLines: ["Guias práticos", "para equipes e criadores com agentes."],
    intro:
      "Estes guias cobrem configuração, desenho de contexto, integração de ferramentas e padrões de trabalho para equipes e criadores que usam agentes com o AnyCap.",
    items: [
      {
        title: "Instalar o AnyCap",
        href: "/guides/install-anycap",
        description: "Instale a CLI, autentique uma vez e confirme que o runtime de capacidades está pronto.",
      },
      {
        title: "MCP vs Skills",
        href: "/guides/mcp-vs-skills",
        description: "Entenda quando você precisa da camada de protocolo, da camada de instrução, ou das duas em um fluxo com agentes.",
      },
      {
        title: "Adicionar Ferramentas ao Claude Code",
        href: "/guides/add-tools-to-claude-code",
        description: "Conecte o AnyCap ao Claude Code para que agentes possam chamar ferramentas multimodais diretamente.",
      },
      {
        title: "Engenharia de Contexto para Agentes",
        href: "/guides/context-engineering-for-agents",
        description: "Estruture prompts, arquivos e contexto de trabalho para que agentes permaneçam úteis e bem ancorados.",
      },
      {
        title: "Skills de Agente para Ferramentas de Desenvolvimento",
        href: "/guides/agent-skills-for-developer-tools",
        description: "Use skills reutilizáveis para manter fluxos com agentes consistentes entre projetos.",
      },
      {
        title: "Engenharia de Contexto do Workspace",
        href: "/guides/workspace-context-engineering",
        description: "Projete contexto no nível do workspace para que agentes de código de longa duração não percam a orientação.",
      },
      {
        title: "O que é Agent Harness?",
        href: "/guides/what-is-agent-harness",
        description: "Entenda a camada de execução que transforma acesso a ferramentas em comportamento confiável do agente.",
      },
    ],
    breadcrumbItems: [
      { name: "Início", href: "/" },
      { name: "Guias", href: GUIDES_PATH },
    ],
  },
  id: {
    ...hubPages.guides,
    breadcrumbItems: [
      { name: "Home", href: "/" },
      { name: "Guides", href: GUIDES_PATH },
    ],
  },
};

export function getGuidesMetadata(locale: SiteLocale): Metadata {
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

export function getGuidesPageData(locale: SiteLocale) {
  return contentByLocale[locale] ?? contentByLocale.en;
}
