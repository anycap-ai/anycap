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

const glossaryHubContentDe: GlossaryHubPageData = {
  ...getHubPageDefinition("de", "glossary"),
  breadcrumbItems: [
    { name: "Startseite", href: "/" },
    { name: "Glossar", href: GLOSSARY_PATH },
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

const contextEngineeringContentDe: GlossaryEntryPageData = {
  metadata: {
    title: "Was ist Context Engineering? Wie KI-Agents Kontext nutzen",
    description:
      "Context Engineering ist die Praxis, das zu gestalten, was ein KI-Agent während der Ausführung sieht, behält und tun kann. Erfahren Sie, wie das Capability-Aufrufe, Workspace-Verhalten und multimodale Workflows beeinflusst.",
    openGraphTitle: "Was ist Context Engineering? Wie KI-Agents Kontext nutzen",
    openGraphDescription:
      "Erfahren Sie, was Context Engineering für KI-Agents bedeutet und wie es Capability-Aufrufe, Workspace-Verhalten und multimodale Workflows beeinflusst.",
  },
  breadcrumbItems: [
    { name: "Startseite", href: "/" },
    { name: "Glossar", href: GLOSSARY_PATH },
    { name: "Context Engineering", href: "/glossary/context-engineering" },
  ],
  eyebrow: "Glossar",
  heroTitle: ["Was ist", "Context Engineering?"],
  intro:
    "Context Engineering ist die Praxis, den Informations- und Aktionsraum zu gestalten, den ein KI-Agent während der Live-Ausführung nutzt — nicht nur während des Prompt-Entwurfs. Dazu gehören Prompts, Workspace-Dateien, Tool-Definitionen, Runtime-State, Berechtigungsgrenzen, vorherige Schritte und operative Einschränkungen, die die Entscheidungsqualität beeinflussen. In Produktiv-Workflows entscheiden diese Signale, ob ein Agent das richtige Tool zum richtigen Zeitpunkt wählt, fehlende Daten anfragt oder im Text weiter-räsoniert. Starkes Context Engineering reduziert vermeidbare Tool-Aufrufe, senkt Fehler-Loops und macht Verhalten über Runs hinweg reproduzierbarer. Ohne das kann selbst ein fähiges Modell schlechte Ausführungsentscheidungen treffen, weil kritischer State fehlt, mehrdeutig ist oder zu spät präsentiert wird.",
  definitionJsonLd: {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: "Context Engineering",
    description:
      "Die Praxis, Informationen, Tools, Constraints und Runtime-State so zu gestalten, dass ein KI-Agent während der Ausführung bessere Entscheidungen treffen kann.",
    url: getLocalizedRouteUrl(siteConfig.defaultLocale, "/glossary/context-engineering"),
  },
  whyTitle: "Warum es zählt",
  whyBody: [
    "Ein fähiger Agent braucht mehr als ein starkes Modell. Er braucht den richtigen Kontext, um zu verstehen, welche Tools existieren, welche Dateien autoritativ sind, welche Aktionen erlaubt sind und wie Erfolg im aktuellen Schritt aussieht. Sind diese Signale schwach, kann der Agent den richtigen Tool-Aufruf überspringen, die falsche Capability wählen oder Aktionen zu früh auslösen. Gutes Context Engineering verbessert Zuverlässigkeit, weil es Modell-Reasoning mit der Ausführungsrealität ausrichtet.",
    "Bei AnyCap beeinflusst Context Engineering direkt die Qualität des Capability-Aufrufs. Es entscheidet, wann ein Agent Image Generation, Video Generation, Image Read oder Video Analysis über den Runtime aufrufen soll und wann er im Text bleiben sollte. Besserer Kontext bedeutet weniger blinde Aufrufe, sauberere multimodale Routings und vorhersehbarere Ergebnisse für Teams in unterschiedlichen Agent-Umgebungen.",
  ],
  relatedLinks: [
    { label: "Context Guide", href: "/guides/context-engineering-for-agents", variant: "primary" },
    { label: "Workspace Context", href: "/guides/workspace-context-engineering", variant: "secondary" },
    { label: "Capability Runtime", href: "/glossary/agent-capability-runtime", variant: "secondary" },
  ],
};

const agentHarnessContentDe: GlossaryEntryPageData = {
  metadata: {
    title: "Was ist ein Agent Harness? Die Ausführungsschicht um KI-Agents",
    description:
      "Ein Agent Harness ist die Ausführungsschicht um einen KI-Agent, die Tools, Dateien, Berechtigungen und Runtime-Steuerung bereitstellt. Erfahren Sie, wie sie zum Modell steht und wo AnyCap als Capability-Runtime einfließt.",
    openGraphTitle: "Was ist ein Agent Harness? Die Ausführungsschicht um KI-Agents",
    openGraphDescription:
      "Erfahren Sie, was ein Agent Harness ist und wo AnyCap als Capability-Runtime im Agent-Stack einfließt.",
  },
  breadcrumbItems: [
    { name: "Startseite", href: "/" },
    { name: "Glossar", href: GLOSSARY_PATH },
    { name: "Agent Harness", href: "/glossary/agent-harness" },
  ],
  eyebrow: "Glossar",
  heroTitle: ["Was ist ein", "Agent Harness?"],
  intro:
    "Ein Agent Harness ist die Ausführungsschicht um das Modell, die Reasoning-Output in reale Operationen verwandelt. Sie stellt Dateien, Terminals, Browser-Steuerung, Tool-Routing, Berechtigungsgrenzen und Runtime-Regeln bereit, die bestimmen, welche Aktionen in jedem Schritt möglich sind. Das Modell entscheidet, was passieren soll; der Harness regelt, was sicher und vorhersehbar in der Umgebung passieren kann. Diese Schicht ist kritisch für produktive Zuverlässigkeit, weil sie Zugriff, Reihenfolge und Fehlerbehandlung über Tool-Aufrufe steuert. Ohne klar definierten Harness wird Agent-Verhalten fragil, schwer auditierbar und schwer reproduzierbar.",
  definitionJsonLd: {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: "Agent Harness",
    description:
      "Die Ausführungsumgebung um einen KI-Agent, die Tools, Dateien, Berechtigungen, Runtime-State und Policy-Kontrollen bereitstellt.",
    url: getLocalizedRouteUrl(siteConfig.defaultLocale, "/glossary/agent-harness"),
  },
  whyTitle: "Warum es zählt",
  whyBody: [
    "Das Modell entscheidet, was zu tun ist, aber der Harness bestimmt, was es in der Praxis tatsächlich tun kann. Dazu gehört, welche Tools auffindbar sind, welche Dateien sichtbar sind, welche Berechtigungen erteilt werden und welche Aktions-Sequenzen in der Ausführungsumgebung erlaubt sind. Diese Trennung macht Policy, Safety und Observability durchsetzbar, ohne die Modell-Flexibilität zu beschneiden.",
    "AnyCap fügt sich in diesen Harness als Capability-Runtime ein. Es gibt dem Harness einen sauberen, konsistenten Weg, multimodale Aktionen über eine Schnittstelle zu exponieren, statt für jeden Workflow separate Provider-Integrationen zusammenzunähen. Das Ergebnis sind klarere operative Grenzen, einfacheres Debugging und schnellere Wiederverwendung über verschiedene Agent-Shells hinweg.",
  ],
  relatedLinks: [
    { label: "Harness Guide", href: "/guides/what-is-agent-harness", variant: "primary" },
    { label: "Capability Runtime", href: "/glossary/agent-capability-runtime", variant: "secondary" },
    { label: "Agent Builder Compare", href: "/compare/anycap-vs-openai-agent-builder", variant: "secondary" },
  ],
};

const glossaryHubContentByLocale: Record<SiteLocale, GlossaryHubPageData> = {
  en: glossaryHubContentEn,
  "pt-br": glossaryHubContentPtBr,
  id: glossaryHubContentEn,
  de: glossaryHubContentDe,
};

const contextEngineeringContentByLocale: Record<SiteLocale, GlossaryEntryPageData> = {
  en: contextEngineeringContentEn,
  "pt-br": contextEngineeringContentPtBr,
  id: contextEngineeringContentEn,
  de: contextEngineeringContentDe,
};

const agentHarnessContentByLocale: Record<SiteLocale, GlossaryEntryPageData> = {
  en: agentHarnessContentEn,
  "pt-br": agentHarnessContentPtBr,
  id: agentHarnessContentEn,
  de: agentHarnessContentDe,
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

// ─── Model Context Protocol ───────────────────────────────────────────────────

const mcpContentEn: GlossaryEntryPageData = {
  metadata: {
    title: "What is the Model Context Protocol (MCP)? How AI agents connect to tools",
    description:
      "The Model Context Protocol (MCP) is an open communication standard that defines how AI agents discover and invoke tools, capabilities, and external services. Learn how MCP works, how it differs from a capability runtime, and where AnyCap fits in the agent stack.",
    openGraphTitle: "What is the Model Context Protocol (MCP)? How AI agents connect to tools",
    openGraphDescription:
      "MCP is an open standard that defines how AI agents discover and call tools. Learn how it differs from a capability runtime and where AnyCap fits.",
  },
  breadcrumbItems: [
    { name: "Home", href: "/" },
    { name: "Glossary", href: GLOSSARY_PATH },
    { name: "Model Context Protocol", href: "/glossary/model-context-protocol" },
  ],
  eyebrow: "Glossary",
  heroTitle: ["What is the", "Model Context Protocol?"],
  intro:
    "The Model Context Protocol (MCP) is an open communication standard that defines how AI agents discover and invoke tools, capabilities, and external services during execution. Released by Anthropic in late 2024, MCP standardizes the message format between an agent host and any conforming server, replacing the previous pattern of building a custom integration for every tool, data source, or capability an agent might need. At its core, MCP establishes a host-client-server architecture: the agent host manages the active model session, MCP clients translate tool calls into protocol messages, and MCP servers expose discrete capabilities through a stable interface. Because the protocol is open, any developer can build an MCP server for a new tool, and any agent product that supports MCP can consume it immediately without custom SDK work. This makes MCP a connectivity standard rather than a capability runtime. It defines how agents talk to tools, not what those tools can actually do. The what is the responsibility of the tool layer — the capability runtime — that sits behind the protocol.",
  definitionJsonLd: {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: "Model Context Protocol (MCP)",
    description:
      "An open communication standard that defines how AI agents discover and invoke tools, capabilities, and external services during execution.",
    url: getLocalizedRouteUrl(siteConfig.defaultLocale, "/glossary/model-context-protocol"),
  },
  whyTitle: "Why it matters",
  whyBody: [
    "MCP changes the economics of tool integration for agent developers. Before MCP, adding a capability to an agent required a custom integration with per-provider authentication, error handling, and response parsing. With MCP, any capability exposed through a conforming server becomes immediately accessible to every agent that supports the standard. This shifts the integration surface from per-tool work to per-server work, and a growing community of MCP server authors does much of that work publicly. The result is that developers who adopt MCP early gain access to an expanding ecosystem of tools without incremental integration cost.",
    "For teams using AnyCap, MCP and the capability runtime operate at different layers. MCP is the communication protocol — it standardizes how the agent calls the runtime. AnyCap is the capability runtime — it provides the actual capabilities (image generation, video generation, image understanding, video analysis, web search, and others) that the protocol routes requests to. These are not competing choices. A team uses MCP as the wire and AnyCap as what runs on that wire. The skill file install path gives the agent the instruction layer it needs to connect the two.",
  ],
  relatedLinks: [
    { label: "MCP vs Skills", href: "/guides/mcp-vs-skills", variant: "primary" },
    { label: "Capability Runtime", href: "/glossary/agent-capability-runtime", variant: "secondary" },
    { label: "AnyCap Capabilities", href: "/capabilities", variant: "secondary" },
  ],
};

const mcpContentPtBr: GlossaryEntryPageData = {
  metadata: {
    title: "O que é o Model Context Protocol (MCP)? Como agentes de IA se conectam a ferramentas",
    description:
      "O Model Context Protocol (MCP) é um padrão de comunicação aberto que define como agentes de IA descobrem e invocam ferramentas, capacidades e serviços externos. Veja como o MCP funciona, como ele difere de um runtime de capacidades e onde o AnyCap entra na stack.",
    openGraphTitle: "O que é o Model Context Protocol (MCP)? Como agentes de IA se conectam a ferramentas",
    openGraphDescription:
      "O MCP é um padrão aberto que define como agentes de IA descobrem e chamam ferramentas. Veja como ele difere de um runtime de capacidades e onde o AnyCap entra.",
  },
  breadcrumbItems: [
    { name: "Início", href: "/" },
    { name: "Glossário", href: GLOSSARY_PATH },
    { name: "Model Context Protocol", href: "/glossary/model-context-protocol" },
  ],
  eyebrow: "Glossário",
  heroTitle: ["O que é o", "Model Context Protocol?"],
  intro:
    "O Model Context Protocol (MCP) é um padrão de comunicação aberto que define como agentes de IA descobrem e invocam ferramentas, capacidades e serviços externos durante a execução. Lançado pela Anthropic no final de 2024, o MCP padroniza o formato de mensagem entre um host de agente e qualquer servidor compatível, substituindo o padrão anterior de construir uma integração personalizada para cada ferramenta ou capacidade que um agente possa precisar. No núcleo, o MCP estabelece uma arquitetura host-client-server: o host gerencia a sessão ativa do modelo, os clientes MCP traduzem chamadas de ferramenta em mensagens de protocolo e os servidores MCP expõem capacidades discretas por meio de uma interface estável. Como o protocolo é aberto, qualquer desenvolvedor pode criar um servidor MCP para uma nova ferramenta, e qualquer produto de agente que suporte MCP pode consumir esse servidor imediatamente, sem trabalho personalizado de SDK. Isso faz do MCP um padrão de conectividade, não um runtime de capacidades. Ele define como agentes falam com ferramentas, não o que essas ferramentas realmente fazem.",
  definitionJsonLd: {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: "Model Context Protocol (MCP)",
    description:
      "Um padrão de comunicação aberto que define como agentes de IA descobrem e invocam ferramentas, capacidades e serviços externos durante a execução.",
    url: getLocalizedRouteUrl(siteConfig.defaultLocale, "/glossary/model-context-protocol"),
  },
  whyTitle: "Por que isso importa",
  whyBody: [
    "O MCP muda a economia da integração de ferramentas para desenvolvedores de agentes. Antes do MCP, adicionar uma capacidade a um agente exigia uma integração personalizada com autenticação, tratamento de erros e parsing de resposta por provedor. Com o MCP, qualquer capacidade exposta por um servidor compatível fica imediatamente acessível para todo agente que suporta o padrão. Isso desloca o esforço de integração de por-ferramenta para por-servidor, e uma comunidade crescente de autores de servidores MCP faz grande parte desse trabalho publicamente.",
    "Para times que usam AnyCap, o MCP e o runtime de capacidades operam em camadas diferentes. O MCP é o protocolo de comunicação — ele define como o agente chama o runtime. O AnyCap é o runtime de capacidades — ele fornece as capacidades reais (geração de imagem, geração de vídeo, entendimento de imagem, análise de vídeo, busca na web e outras) para as quais o protocolo roteia as chamadas. Não são escolhas concorrentes. O time usa o MCP como o fio e o AnyCap como o que roda nesse fio.",
  ],
  relatedLinks: [
    { label: "MCP vs Skills", href: "/guides/mcp-vs-skills", variant: "primary" },
    { label: "Runtime de Capacidade", href: "/glossary/agent-capability-runtime", variant: "secondary" },
    { label: "Capacidades do AnyCap", href: "/capabilities", variant: "secondary" },
  ],
};

const mcpContentByLocale: Record<SiteLocale, GlossaryEntryPageData> = {
  en: mcpContentEn,
  "pt-br": mcpContentPtBr,
  id: mcpContentEn,
  de: mcpContentEn,
};

export function getMcpGlossaryMetadata(locale: SiteLocale): Metadata {
  const content = mcpContentByLocale[locale] ?? mcpContentByLocale.en;
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

export function getMcpGlossaryPageData(locale: SiteLocale) {
  return mcpContentByLocale[locale] ?? mcpContentByLocale.en;
}

// ─── Agentic Workflow ─────────────────────────────────────────────────────────

const agenticWorkflowContentEn: GlossaryEntryPageData = {
  metadata: {
    title: "What is an agentic workflow? How AI agents chain decisions and actions",
    description:
      "An agentic workflow is a goal-directed sequence of model decisions and real-world tool actions that runs to completion without requiring human approval at every step. Learn how agentic workflows work, why capability coverage matters, and where AnyCap fits.",
    openGraphTitle: "What is an agentic workflow? How AI agents chain decisions and actions",
    openGraphDescription:
      "An agentic workflow is a goal-directed sequence of AI decisions and tool actions that runs without per-step human approval. Learn how capability coverage shapes workflow reliability.",
  },
  breadcrumbItems: [
    { name: "Home", href: "/" },
    { name: "Glossary", href: GLOSSARY_PATH },
    { name: "Agentic Workflow", href: "/glossary/agentic-workflow" },
  ],
  eyebrow: "Glossary",
  heroTitle: ["What is an", "agentic workflow?"],
  intro:
    "An agentic workflow is a goal-directed sequence of model decisions and real-world tool actions that runs to completion without requiring human approval at each step. The model decides what to do; the agent harness executes it; the results feed back into the next decision. This loop continues until the goal is met, a stop condition is reached, or the agent requests human input. What distinguishes an agentic workflow from a simple chat session is the combination of autonomy, tool use, and state persistence across steps. The model does not just generate text — it calls tools, reads file contents, generates images, searches the web, runs code, and stores results that subsequent steps build on. Agentic workflows are what make AI systems genuinely useful for multi-step production tasks rather than isolated queries. The reliability of each step depends heavily on which tools are available, how well they are described to the model, and what constraints govern execution. Workflows that cross capability boundaries — generating an image, then analyzing it, then publishing the result — require a runtime that covers all those actions through one consistent interface.",
  definitionJsonLd: {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: "Agentic Workflow",
    description:
      "A goal-directed sequence of AI model decisions and real-world tool actions that runs to completion without requiring human approval at each step.",
    url: getLocalizedRouteUrl(siteConfig.defaultLocale, "/glossary/agentic-workflow"),
  },
  whyTitle: "Why it matters",
  whyBody: [
    "Agentic workflows are where capability gaps become most visible. A well-designed agent with strong reasoning but no access to image generation, vision, or web retrieval will fail at steps that require those actions — regardless of how capable its language understanding is. This means capability coverage is a workflow design question, not just a product selection question. The more diverse the workflow, the more types of capabilities it requires. Teams that plan workflow steps before selecting their capability layer avoid discovering gaps mid-execution, which is the most expensive time to find them.",
    "For teams using AnyCap, the capability runtime is the tool layer that makes agentic workflows with generation, understanding, and retrieval possible. Without it, developers must build and maintain separate integrations for each action type, which adds failure surface and slows iteration. A runtime that covers image, video, vision, web search, web crawl, storage, and publishing in one install path reduces the integration overhead that would otherwise fragment the workflow into disconnected pieces. This is why teams running high-diversity agentic workflows typically benefit most from the runtime architecture.",
  ],
  relatedLinks: [
    { label: "What Agents Can't Do", href: "/learn/what-agents-cant-do", variant: "primary" },
    { label: "Context Engineering", href: "/glossary/context-engineering", variant: "secondary" },
    { label: "AnyCap Capabilities", href: "/capabilities", variant: "secondary" },
  ],
};

const agenticWorkflowContentPtBr: GlossaryEntryPageData = {
  metadata: {
    title: "O que é um fluxo agêntico? Como agentes de IA encadeiam decisões e ações",
    description:
      "Um fluxo agêntico é uma sequência orientada a objetivos de decisões do modelo e ações reais com ferramentas que executa até a conclusão sem exigir aprovação humana a cada etapa. Veja como funcionam os fluxos agênticos e por que a cobertura de capacidades importa.",
    openGraphTitle: "O que é um fluxo agêntico? Como agentes de IA encadeiam decisões e ações",
    openGraphDescription:
      "Um fluxo agêntico é uma sequência de decisões de IA e ações de ferramentas que roda sem aprovação humana por etapa. Veja como cobertura de capacidades molda confiabilidade.",
  },
  breadcrumbItems: [
    { name: "Início", href: "/" },
    { name: "Glossário", href: GLOSSARY_PATH },
    { name: "Fluxo Agêntico", href: "/glossary/agentic-workflow" },
  ],
  eyebrow: "Glossário",
  heroTitle: ["O que é um", "fluxo agêntico?"],
  intro:
    "Um fluxo agêntico é uma sequência orientada a objetivos de decisões do modelo e ações reais com ferramentas que executa até a conclusão sem exigir aprovação humana a cada etapa. O modelo decide o que fazer; o harness do agente executa; os resultados alimentam a próxima decisão. Esse loop continua até que o objetivo seja alcançado, uma condição de parada seja atingida ou o agente solicite entrada humana. O que distingue um fluxo agêntico de uma simples sessão de chat é a combinação de autonomia, uso de ferramentas e persistência de estado entre as etapas. O modelo não apenas gera texto — ele chama ferramentas, lê conteúdo de arquivos, gera imagens, pesquisa na web, executa código e armazena resultados que etapas subsequentes utilizam. Fluxos agênticos são o que torna sistemas de IA genuinamente úteis para tarefas de produção de múltiplas etapas, em vez de consultas isoladas. A confiabilidade de cada etapa depende fortemente de quais ferramentas estão disponíveis e como elas estão descritas ao modelo.",
  definitionJsonLd: {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: "Fluxo Agêntico",
    description:
      "Uma sequência orientada a objetivos de decisões do modelo de IA e ações reais com ferramentas que executa até a conclusão sem exigir aprovação humana a cada etapa.",
    url: getLocalizedRouteUrl(siteConfig.defaultLocale, "/glossary/agentic-workflow"),
  },
  whyTitle: "Por que isso importa",
  whyBody: [
    "Fluxos agênticos são onde as lacunas de capacidade ficam mais visíveis. Um agente bem projetado com raciocínio forte, mas sem acesso a geração de imagem, visão ou recuperação web, vai falhar nas etapas que exigem essas ações — independente de quão boa seja sua compreensão de linguagem. Isso significa que cobertura de capacidades é uma questão de design de fluxo, não apenas de seleção de produto. Quanto mais diverso o fluxo, mais tipos de capacidades ele requer.",
    "Para times que usam AnyCap, o runtime de capacidades é a camada de ferramentas que torna possíveis fluxos agênticos com geração, entendimento e recuperação. Sem ele, os desenvolvedores precisam construir e manter integrações separadas para cada tipo de ação, o que adiciona superfície de falha e desacelera a iteração. Um runtime que cobre imagem, vídeo, visão, busca web, web crawl, armazenamento e publicação em um único caminho de instalação reduz o overhead de integração que, de outra forma, fragmentaria o fluxo em partes desconectadas.",
  ],
  relatedLinks: [
    { label: "O que agentes não conseguem fazer", href: "/learn/what-agents-cant-do", variant: "primary" },
    { label: "Engenharia de Contexto", href: "/glossary/context-engineering", variant: "secondary" },
    { label: "Capacidades do AnyCap", href: "/capabilities", variant: "secondary" },
  ],
};

const agenticWorkflowContentByLocale: Record<SiteLocale, GlossaryEntryPageData> = {
  en: agenticWorkflowContentEn,
  "pt-br": agenticWorkflowContentPtBr,
  id: agenticWorkflowContentEn,
  de: agenticWorkflowContentEn,
};

export function getAgenticWorkflowGlossaryMetadata(locale: SiteLocale): Metadata {
  const content = agenticWorkflowContentByLocale[locale] ?? agenticWorkflowContentByLocale.en;
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

export function getAgenticWorkflowGlossaryPageData(locale: SiteLocale) {
  return agenticWorkflowContentByLocale[locale] ?? agenticWorkflowContentByLocale.en;
}
