import type { Metadata } from "next";
import {
  getHubPageDefinition,
  type HubPageDefinition,
} from "@/lib/seo/hub-pages";
import { getLocaleConfig, getLocalizedRouteUrl, siteConfig, type SiteLocale } from "@/lib/site";

export const GLOSSARY_PATH = "/glossary";

type GlossaryHubPageData = HubPageDefinition & {
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
  ...getHubPageDefinition("en", "glossary"),
  breadcrumbItems: [
    { name: "Home", href: "/" },
    { name: "Glossary", href: GLOSSARY_PATH },
  ],
};

const glossaryHubContentPtBr: GlossaryHubPageData = {
  ...getHubPageDefinition("pt-br", "glossary"),
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
    "Context engineering is the practice of shaping the information and action space an AI agent uses during live execution, not just during prompt drafting. It includes prompts, workspace files, tool definitions, runtime state, permission boundaries, prior steps, and operational constraints that influence decision quality. In production workflows, these signals determine whether an agent selects the right tool at the right time, asks for missing data, or continues reasoning in text. Strong context engineering reduces avoidable tool calls, lowers failure loops, and makes behavior more reproducible across runs. Without it, even a capable model can make poor execution choices because critical state is missing, ambiguous, or presented too late. This is why high-performing agent teams treat context design as core infrastructure rather than copywriting. It functions as execution architecture, not just communication style, especially in multimodal workflows with strict reliability goals.",
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
    "A capable agent needs more than a strong model. It needs the right context to understand what tools exist, which files are authoritative, what actions are allowed, and what success should look like for the current step. If those signals are weak, the agent may skip the right tool call, select the wrong capability, or trigger actions too early. Good context engineering improves reliability because it aligns model reasoning with execution reality.",
    "For AnyCap, context engineering directly affects capability invocation quality. It determines when an agent should call image generation, video generation, image read, or video analysis through the runtime, and when it should remain in text. Better context means fewer blind calls, cleaner multimodal routing, and more predictable outcomes for teams operating across agent environments.",
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
    "Engenharia de contexto é a prática de moldar o espaço de informação e de ação que um agente de IA usa durante a execução real, e não apenas no texto do prompt inicial. Ela inclui prompts, arquivos do workspace, definições de ferramentas, estado do runtime, limites de permissão, passos anteriores e restrições operacionais que influenciam decisões. Em fluxos de produção, esses sinais determinam se o agente escolhe a ferramenta certa no momento certo, pede dados ausentes ou continua no raciocínio textual. Sem esse cuidado, até modelos fortes cometem erros de execução porque o estado crítico aparece incompleto, ambíguo ou tarde demais.",
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
    "Um agente capaz precisa de mais do que um modelo forte. Ele precisa do contexto correto para entender quais ferramentas existem, quais arquivos são fonte de verdade, quais ações estão autorizadas e qual resultado representa sucesso naquela etapa. Quando esses sinais estão fracos, o agente pode ignorar a ferramenta certa, escolher a capacidade errada ou agir cedo demais. Boa engenharia de contexto aumenta previsibilidade porque alinha raciocínio com realidade de execução.",
    "No AnyCap, engenharia de contexto impacta diretamente a qualidade da invocação de capacidades. Ela define quando o agente deve chamar geração de imagem, geração de vídeo, leitura de imagem ou análise de vídeo pelo runtime, e quando deve continuar no texto. Com contexto melhor, há menos chamadas cegas, roteamento multimodal mais limpo e resultados mais reproduzíveis entre diferentes ambientes de agente.",
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
    "An agent harness is the execution layer around the model that turns reasoning output into real operations. It provides files, terminals, browser control, tool routing, permission boundaries, and runtime rules that determine what actions are possible at each step. The model decides what should happen; the harness governs what can happen safely and predictably in the environment. This layer is critical for production reliability because it controls access, sequencing, and failure handling across tool calls. Without a well-defined harness, agent behavior becomes fragile, hard to audit, and difficult to reproduce across teams or runs.",
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
    "The model decides what to do, but the harness determines what it can actually do in practice. That includes which tools are discoverable, which files are visible, what permissions are granted, and which action sequences are allowed in the execution environment. This separation is what makes policy, safety, and observability enforceable without degrading model flexibility.",
    "AnyCap fits inside that harness as a capability runtime. It gives the harness a clean, consistent way to expose multimodal actions through one interface, rather than stitching separate provider integrations into every workflow. The result is clearer operational boundaries, easier debugging, and faster reuse across different agent shells.",
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
    "Um agent harness é a camada de execução ao redor do modelo que transforma raciocínio em operação real. Ele fornece arquivos, terminais, navegador, roteamento de ferramentas, limites de permissão e regras de runtime que definem o que é possível em cada etapa. O modelo decide o que deveria acontecer; o harness governa o que pode acontecer com segurança e previsibilidade no ambiente. Essa camada é essencial para confiabilidade em produção porque controla acesso, sequência e tratamento de falhas entre chamadas de ferramenta. Sem um harness bem definido, o comportamento do agente fica frágil, difícil de auditar e difícil de reproduzir entre equipes.",
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
    "O modelo decide o que fazer, mas o harness determina o que ele realmente pode fazer na prática. Isso inclui quais ferramentas estão descobríveis, quais arquivos estão visíveis, quais permissões foram concedidas e quais sequências de ação são aceitas no ambiente de execução. Essa separação é o que permite aplicar política, segurança e observabilidade sem reduzir a flexibilidade do modelo.",
    "O AnyCap entra nesse harness como runtime de capacidades. Ele oferece um caminho consistente para expor ações multimodais por uma única interface, em vez de costurar integrações separadas por provedor em cada fluxo. O resultado é fronteira operacional mais clara, depuração mais simples e reutilização mais rápida entre diferentes shells de agente.",
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
