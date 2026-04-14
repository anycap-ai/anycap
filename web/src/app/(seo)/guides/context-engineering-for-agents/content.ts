import type { Metadata } from "next";
import { getLocaleConfig, siteConfig, type SiteLocale } from "@/lib/site";

export const CONTEXT_ENGINEERING_FOR_AGENTS_PATH = "/guides/context-engineering-for-agents";

type ContextEngineeringForAgentsPageData = {
  metadata: {
    title: string;
    description: string;
    openGraphTitle: string;
    openGraphDescription: string;
  };
  breadcrumbItems: readonly { name: string; href?: string; unlinkable?: boolean }[];
  eyebrow: string;
  heroTitle: string;
  heroIntro: string;
  pillarsTitle: string;
  pillars: readonly { title: string; body: string }[];
  whyItMattersTitle: string;
  whyItMatters: readonly string[];
  patternTitle: string;
  patternSteps: readonly string[];
  cta: readonly { label: string; href: string }[];
};

const en: ContextEngineeringForAgentsPageData = {
  metadata: {
    title: "Context engineering for agents — How capability calls are decided",
    description:
      "Context engineering shapes what an AI agent sees, remembers, and decides to do. Learn how it affects capability calls, multimodal workflows, and why AnyCap fits as the runtime layer for agent execution.",
    openGraphTitle: "Context engineering for agents — How capability calls are decided",
    openGraphDescription:
      "Learn how context engineering affects capability calls, multimodal workflows, and why AnyCap fits as the runtime layer for agent execution.",
  },
  breadcrumbItems: [
    { name: "Home", href: "/" },
    { name: "Guides", href: "/guides", unlinkable: true },
    { name: "Context Engineering for Agents" },
  ],
  eyebrow: "Guide",
  heroTitle: "Context engineering for agents",
  heroIntro:
    "Context engineering is the practice of shaping what an AI agent sees and how it interprets its environment. It goes beyond prompt wording. The agent also depends on workspace state, tool definitions, capability availability, prior steps, and execution rules. That is what determines whether it stays in text or calls a capability through a runtime like AnyCap.",
  pillarsTitle: "The three practical layers",
  pillars: [
    {
      title: "What the agent can see",
      body: "The system prompt, workspace files, prior messages, tool definitions, and execution constraints all shape the action space.",
    },
    {
      title: "What the agent can do",
      body: "Capabilities are only useful when they are exposed in a way the agent can discover and trust during execution.",
    },
    {
      title: "When the agent should switch from text to action",
      body: "Good context engineering helps the agent decide when reasoning is enough and when it should call image generation, video analysis, or another capability.",
    },
  ],
  whyItMattersTitle: "Why it matters for multimodal agents",
  whyItMatters: [
    "A multimodal agent does not just need a good prompt. It needs enough context to know when to inspect an image, generate a mockup, read a video, or keep reasoning in text.",
    "This is where AnyCap fits. Instead of giving the agent many unrelated APIs, a capability runtime exposes image generation, video generation, image understanding, and video analysis through one interface.",
  ],
  patternTitle: "A simple decision pattern",
  patternSteps: [
    "Need text only? stay in prompt",
    "Need a new image? anycap image generate",
    "Need to inspect a screenshot? anycap image read",
    "Need to review a recording? anycap video read",
  ],
  cta: [
    { label: "Capability Runtime", href: "/glossary/agent-capability-runtime" },
    { label: "Image Generation", href: "/capabilities/image-generation" },
    { label: "Video Analysis", href: "/capabilities/video-analysis" },
  ],
};

const ptBr: ContextEngineeringForAgentsPageData = {
  metadata: {
    title: "Engenharia de contexto para agentes — Como as chamadas de capacidade são decididas",
    description:
      "A engenharia de contexto molda o que um agente de IA vê, lembra e decide fazer. Entenda como ela afeta chamadas de capacidade, fluxos multimodais e por que o AnyCap funciona como a camada de runtime para execução de agentes.",
    openGraphTitle: "Engenharia de contexto para agentes — Como as chamadas de capacidade são decididas",
    openGraphDescription:
      "Entenda como a engenharia de contexto afeta chamadas de capacidade, fluxos multimodais e por que o AnyCap funciona como a camada de runtime para execução de agentes.",
  },
  breadcrumbItems: [
    { name: "Início", href: "/" },
    { name: "Guias", href: "/guides", unlinkable: true },
    { name: "Engenharia de Contexto para Agentes" },
  ],
  eyebrow: "Guia",
  heroTitle: "Engenharia de contexto para agentes",
  heroIntro:
    "Engenharia de contexto é a prática de moldar o que um agente de IA vê e como ele interpreta o ambiente. Isso vai além do texto do prompt. O agente também depende do estado do workspace, das definições de ferramenta, da disponibilidade de capacidades, dos passos anteriores e das regras de execução. É isso que determina se ele fica no texto ou chama uma capacidade através de um runtime como o AnyCap.",
  pillarsTitle: "As três camadas práticas",
  pillars: [
    {
      title: "O que o agente consegue ver",
      body: "O system prompt, os arquivos do workspace, as mensagens anteriores, as definições de ferramenta e as restrições de execução moldam o espaço de ação.",
    },
    {
      title: "O que o agente consegue fazer",
      body: "Capacidades só são úteis quando são expostas de um jeito que o agente consiga descobrir e confiar durante a execução.",
    },
    {
      title: "Quando o agente deve sair do texto para a ação",
      body: "Boa engenharia de contexto ajuda o agente a decidir quando raciocinar basta e quando ele deve chamar geração de imagem, análise de vídeo ou outra capacidade.",
    },
  ],
  whyItMattersTitle: "Por que isso importa para agentes multimodais",
  whyItMatters: [
    "Um agente multimodal não precisa só de um bom prompt. Ele precisa de contexto suficiente para saber quando inspecionar uma imagem, gerar um mockup, ler um vídeo ou continuar raciocinando em texto.",
    "É aqui que o AnyCap entra. Em vez de dar ao agente várias APIs soltas, um runtime de capacidades expõe geração de imagem, geração de vídeo, entendimento de imagem e análise de vídeo por uma única interface.",
  ],
  patternTitle: "Um padrão simples de decisão",
  patternSteps: [
    "Precisa só de texto? continue no prompt",
    "Precisa de uma imagem nova? anycap image generate",
    "Precisa inspecionar uma captura de tela? anycap image read",
    "Precisa revisar uma gravação? anycap video read",
  ],
  cta: [
    { label: "Runtime de capacidade", href: "/glossary/agent-capability-runtime" },
    { label: "Geração de imagem", href: "/capabilities/image-generation" },
    { label: "Análise de vídeo", href: "/capabilities/video-analysis" },
  ],
};

const contentByLocale: Record<SiteLocale, ContextEngineeringForAgentsPageData> = {
  en,
  "pt-br": ptBr,
  id: en,
};

export function getContextEngineeringForAgentsMetadata(locale: SiteLocale): Metadata {
  const content = contentByLocale[locale] ?? contentByLocale.en;
  return {
    title: content.metadata.title,
    description: content.metadata.description,
    openGraph: {
      type: "website",
      locale: getLocaleConfig(locale).ogLocale,
      url: CONTEXT_ENGINEERING_FOR_AGENTS_PATH,
      siteName: siteConfig.siteName,
      title: content.metadata.openGraphTitle,
      description: content.metadata.openGraphDescription,
    },
  };
}

export function getContextEngineeringForAgentsPageData(locale: SiteLocale) {
  return contentByLocale[locale] ?? contentByLocale.en;
}
