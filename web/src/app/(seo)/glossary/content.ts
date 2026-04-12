import type { Metadata } from "next";
import { hubPages } from "@/lib/hub-pages";
import { getLocaleConfig, getLocalizedRouteUrl, siteConfig, type SiteLocale } from "@/lib/site";

export const GLOSSARY_PATH = "/glossary";

type GlossaryHubPageData = typeof hubPages.glossary & {
  breadcrumbItems: readonly { name: string; href: string }[];
};

type GlossaryEntryPageData = {
  metadata: {
    title: string;
    description: string;
    openGraphTitle: string;
    openGraphDescription: string;
  };
  breadcrumbItems: readonly { name: string; href: string }[];
  eyebrow: string;
  heroTitle: [string, string];
  intro: string;
  definitionJsonLd: Record<string, unknown>;
  whyTitle: string;
  whyBody: [string, string];
  relatedLinks: readonly { label: string; href: string; variant: "primary" | "secondary" }[];
};

const glossaryHubContentEn: GlossaryHubPageData = {
  ...hubPages.glossary,
  breadcrumbItems: [
    { name: "Home", href: "/" },
    { name: "Glossary", href: GLOSSARY_PATH },
  ],
};

const glossaryHubContentPtBr: GlossaryHubPageData = {
  ...hubPages.glossary,
  title: "Glossário — conceitos centrais por trás do AnyCap e de ferramentas para agentes",
  description:
    "Leia definições concisas de conceitos centrais do AnyCap e de ferramentas para agentes, como engenharia de contexto, agent harness e runtimes de capacidades.",
  eyebrow: "Glossário",
  heroLines: ["Linguagem compartilhada", "para sistemas de agentes."],
  intro:
    "Use estas entradas do glossário para alinhar equipes sobre os termos por trás de runtimes de capacidades, harnesses e desenho de contexto.",
  items: [
    {
      title: "Engenharia de Contexto",
      href: "/glossary/context-engineering",
      description: "A prática de moldar entradas, arquivos e memória para que um agente trabalhe com confiabilidade.",
    },
    {
      title: "Agent Harness",
      href: "/glossary/agent-harness",
      description: "O ambiente de execução que gerencia ferramentas, arquivos, prompts e travas de segurança do agente.",
    },
    {
      title: "Runtime de Capacidade do Agente",
      href: "/glossary/agent-capability-runtime",
      description: "Uma camada de runtime que dá aos agentes uma forma estável de chamar capacidades entre provedores.",
    },
  ],
  breadcrumbItems: [
    { name: "Início", href: "/" },
    { name: "Glossário", href: GLOSSARY_PATH },
  ],
};

const contextEngineeringContentEn: GlossaryEntryPageData = {
  metadata: {
    title: "What is context engineering? How AI agents use context",
    description:
      "Context engineering is the practice of shaping what an AI agent sees, remembers, and can do during execution. Learn how it affects capability calls, workspace behavior, and multimodal workflows.",
    openGraphTitle: "What is context engineering? How AI agents use context",
    openGraphDescription:
      "Learn what context engineering means for AI agents and how it affects capability calls, workspace behavior, and multimodal workflows.",
  },
  breadcrumbItems: [
    { name: "Home", href: "/" },
    { name: "Glossary", href: GLOSSARY_PATH },
    { name: "Context Engineering", href: "/glossary/context-engineering" },
  ],
  eyebrow: "Glossary",
  heroTitle: ["What is", "context engineering?"],
  intro:
    "Context engineering is the practice of shaping the information and action space an AI agent uses during execution. It includes prompts, workspace files, tool definitions, runtime state, permissions, and prior steps.",
  definitionJsonLd: {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: "Context Engineering",
    description:
      "The practice of shaping the information, tools, constraints, and runtime state an AI agent uses during execution so it can make better decisions.",
    url: getLocalizedRouteUrl(siteConfig.defaultLocale, "/glossary/context-engineering"),
  },
  whyTitle: "Why it matters",
  whyBody: [
    "A capable agent needs more than a strong model. It also needs the right context to know what tools exist, what files matter, and what actions are allowed. Without that, it may miss the right tool call or act at the wrong time.",
    "For AnyCap, context engineering matters because it determines when an agent should invoke image generation, video generation, image read, or video analysis through the capability runtime.",
  ],
  relatedLinks: [
    { label: "Context Guide", href: "/guides/context-engineering-for-agents", variant: "primary" },
    { label: "Workspace Context", href: "/guides/workspace-context-engineering", variant: "secondary" },
    { label: "Capability Runtime", href: "/glossary/agent-capability-runtime", variant: "secondary" },
  ],
};

const contextEngineeringContentPtBr: GlossaryEntryPageData = {
  metadata: {
    title: "O que é engenharia de contexto? Como agentes de IA usam contexto",
    description:
      "Engenharia de contexto é a prática de moldar o que um agente de IA vê, lembra e pode fazer durante a execução. Veja como isso afeta chamadas de capacidade, comportamento do workspace e fluxos multimodais.",
    openGraphTitle: "O que é engenharia de contexto? Como agentes de IA usam contexto",
    openGraphDescription:
      "Entenda o que engenharia de contexto significa para agentes de IA e como isso afeta chamadas de capacidade, comportamento do workspace e fluxos multimodais.",
  },
  breadcrumbItems: [
    { name: "Início", href: "/" },
    { name: "Glossário", href: GLOSSARY_PATH },
    { name: "Engenharia de Contexto", href: "/glossary/context-engineering" },
  ],
  eyebrow: "Glossário",
  heroTitle: ["O que é", "engenharia de contexto?"],
  intro:
    "Engenharia de contexto é a prática de moldar o espaço de informação e de ações que um agente de IA usa durante a execução. Isso inclui prompts, arquivos do workspace, definições de ferramentas, estado do runtime, permissões e passos anteriores.",
  definitionJsonLd: {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: "Engenharia de Contexto",
    description:
      "A prática de moldar as informações, ferramentas, restrições e o estado de runtime que um agente de IA usa durante a execução para tomar decisões melhores.",
    url: getLocalizedRouteUrl(siteConfig.defaultLocale, "/glossary/context-engineering"),
  },
  whyTitle: "Por que isso importa",
  whyBody: [
    "Um agente capaz precisa de mais do que um modelo forte. Ele também precisa do contexto certo para saber quais ferramentas existem, quais arquivos importam e quais ações são permitidas. Sem isso, ele pode deixar de chamar a ferramenta certa ou agir na hora errada.",
    "Para o AnyCap, a engenharia de contexto importa porque determina quando um agente deve invocar geração de imagem, geração de vídeo, leitura de imagem ou análise de vídeo por meio do runtime de capacidades.",
  ],
  relatedLinks: [
    { label: "Guia de Contexto", href: "/guides/context-engineering-for-agents", variant: "primary" },
    { label: "Contexto do Workspace", href: "/guides/workspace-context-engineering", variant: "secondary" },
    { label: "Runtime de Capacidade", href: "/glossary/agent-capability-runtime", variant: "secondary" },
  ],
};

const agentHarnessContentEn: GlossaryEntryPageData = {
  metadata: {
    title: "What is an agent harness? The execution layer around AI agents",
    description:
      "An agent harness is the execution layer around an AI agent that provides tools, files, permissions, and runtime controls. Learn how it relates to the model and where AnyCap fits as a capability runtime.",
    openGraphTitle: "What is an agent harness? The execution layer around AI agents",
    openGraphDescription:
      "Learn what an agent harness is and where AnyCap fits as a capability runtime inside the agent stack.",
  },
  breadcrumbItems: [
    { name: "Home", href: "/" },
    { name: "Glossary", href: GLOSSARY_PATH },
    { name: "Agent Harness", href: "/glossary/agent-harness" },
  ],
  eyebrow: "Glossary",
  heroTitle: ["What is an", "agent harness?"],
  intro:
    "An agent harness is the execution layer around the model. It provides the files, terminals, browser, tools, permissions, and runtime rules that turn a reasoning model into a working agent system.",
  definitionJsonLd: {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: "Agent Harness",
    description:
      "The execution environment around an AI agent that provides tools, files, permissions, runtime state, and policy controls.",
    url: getLocalizedRouteUrl(siteConfig.defaultLocale, "/glossary/agent-harness"),
  },
  whyTitle: "Why it matters",
  whyBody: [
    "The model decides what to do. The harness determines what it can actually do. That includes which tools exist, which files are visible, what permissions are granted, and which actions are allowed in the environment.",
    "AnyCap fits inside that harness as a capability runtime. It gives the harness a clean way to expose multimodal actions to the agent through one interface.",
  ],
  relatedLinks: [
    { label: "Harness Guide", href: "/guides/what-is-agent-harness", variant: "primary" },
    { label: "Capability Runtime", href: "/glossary/agent-capability-runtime", variant: "secondary" },
    { label: "Agent Builder Compare", href: "/compare/anycap-vs-openai-agent-builder", variant: "secondary" },
  ],
};

const agentHarnessContentPtBr: GlossaryEntryPageData = {
  metadata: {
    title: "O que é um agent harness? A camada de execução ao redor de agentes de IA",
    description:
      "Um agent harness é a camada de execução ao redor de um agente de IA que fornece ferramentas, arquivos, permissões e controles de runtime. Entenda como ele se relaciona com o modelo e onde o AnyCap entra como runtime de capacidades.",
    openGraphTitle: "O que é um agent harness? A camada de execução ao redor de agentes de IA",
    openGraphDescription:
      "Entenda o que é um agent harness e onde o AnyCap se encaixa como runtime de capacidades dentro da stack de agentes.",
  },
  breadcrumbItems: [
    { name: "Início", href: "/" },
    { name: "Glossário", href: GLOSSARY_PATH },
    { name: "Agent Harness", href: "/glossary/agent-harness" },
  ],
  eyebrow: "Glossário",
  heroTitle: ["O que é um", "agent harness?"],
  intro:
    "Um agent harness é a camada de execução ao redor do modelo. Ele fornece arquivos, terminais, navegador, ferramentas, permissões e regras de runtime que transformam um modelo de raciocínio em um sistema de agente em funcionamento.",
  definitionJsonLd: {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: "Agent Harness",
    description:
      "O ambiente de execução ao redor de um agente de IA que fornece ferramentas, arquivos, permissões, estado de runtime e controles de política.",
    url: getLocalizedRouteUrl(siteConfig.defaultLocale, "/glossary/agent-harness"),
  },
  whyTitle: "Por que isso importa",
  whyBody: [
    "O modelo decide o que fazer. O harness determina o que ele realmente pode fazer. Isso inclui quais ferramentas existem, quais arquivos estão visíveis, quais permissões foram concedidas e quais ações são permitidas no ambiente.",
    "O AnyCap entra dentro desse harness como um runtime de capacidades. Ele oferece uma forma limpa de expor ações multimodais ao agente por meio de uma única interface.",
  ],
  relatedLinks: [
    { label: "Guia de Harness", href: "/guides/what-is-agent-harness", variant: "primary" },
    { label: "Runtime de Capacidade", href: "/glossary/agent-capability-runtime", variant: "secondary" },
    { label: "Comparar com Agent Builder", href: "/compare/anycap-vs-openai-agent-builder", variant: "secondary" },
  ],
};

const glossaryHubContentByLocale: Record<SiteLocale, GlossaryHubPageData> = {
  en: glossaryHubContentEn,
  "pt-br": glossaryHubContentPtBr,
  id: glossaryHubContentEn,
};

const contextEngineeringContentByLocale: Record<SiteLocale, GlossaryEntryPageData> = {
  en: contextEngineeringContentEn,
  "pt-br": contextEngineeringContentPtBr,
  id: contextEngineeringContentEn,
};

const agentHarnessContentByLocale: Record<SiteLocale, GlossaryEntryPageData> = {
  en: agentHarnessContentEn,
  "pt-br": agentHarnessContentPtBr,
  id: agentHarnessContentEn,
};

export function getGlossaryMetadata(locale: SiteLocale): Metadata {
  const content = glossaryHubContentByLocale[locale] ?? glossaryHubContentByLocale.en;

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

export function getGlossaryPageData(locale: SiteLocale) {
  return glossaryHubContentByLocale[locale] ?? glossaryHubContentByLocale.en;
}

export function getContextEngineeringGlossaryMetadata(locale: SiteLocale): Metadata {
  const content = contextEngineeringContentByLocale[locale] ?? contextEngineeringContentByLocale.en;

  return {
    title: content.metadata.title,
    description: content.metadata.description,
    openGraph: {
      title: content.metadata.openGraphTitle,
      description: content.metadata.openGraphDescription,
      locale: getLocaleConfig(locale).ogLocale,
      siteName: siteConfig.siteName,
    },
  };
}

export function getContextEngineeringGlossaryPageData(locale: SiteLocale) {
  return contextEngineeringContentByLocale[locale] ?? contextEngineeringContentByLocale.en;
}

export function getAgentHarnessGlossaryMetadata(locale: SiteLocale): Metadata {
  const content = agentHarnessContentByLocale[locale] ?? agentHarnessContentByLocale.en;

  return {
    title: content.metadata.title,
    description: content.metadata.description,
    openGraph: {
      title: content.metadata.openGraphTitle,
      description: content.metadata.openGraphDescription,
      locale: getLocaleConfig(locale).ogLocale,
      siteName: siteConfig.siteName,
    },
  };
}

export function getAgentHarnessGlossaryPageData(locale: SiteLocale) {
  return agentHarnessContentByLocale[locale] ?? agentHarnessContentByLocale.en;
}
