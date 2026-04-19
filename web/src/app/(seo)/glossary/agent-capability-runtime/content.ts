import type { Metadata } from "next";
import { getLocaleConfig, getLocalizedRouteUrl, siteConfig, type SiteLocale } from "@/lib/site";
import { createFaqPageJsonLd, createTechArticleJsonLd } from "@/lib/schema";

export const AGENT_CAPABILITY_RUNTIME_PATH = "/glossary/agent-capability-runtime";

type AgentCapabilityRuntimePageData = {
  breadcrumbItems: readonly { name: string; href: string; unlinkable?: boolean }[];
  metadata: {
    title: string;
    description: string;
    openGraphTitle: string;
    openGraphDescription: string;
  };
  definitionJsonLd: Record<string, unknown>;
  articleJsonLd: Record<string, unknown>;
  faqJsonLd: Record<string, unknown>;
  eyebrow: string;
  lastUpdatedLabel: string;
  heroTitle: [string, string];
  heroBody: [string, string];
  sectionLabels: {
    architecture: string;
    motivation: string;
    comparison: string;
    scope: string;
    design: string;
    example: string;
  };
  architectureHeading: string;
  architectureIntro: string;
  architectureTable: readonly {
    layer: string;
    role: string;
    examples: string;
  }[];
  architectureClosing: string;
  motivationHeading: string;
  motivationIntro: string;
  problemSignals: readonly {
    signal: string;
    without: string;
    with: string;
  }[];
  comparisonHeading: string;
  comparisonIntro: string;
  approachComparisons: readonly {
    approach: string;
    what: string;
    install: string;
    auth: string;
    tradeoff: string;
    bestFor: string;
  }[];
  scopeHeading: string;
  scopeIntro: string;
  capabilityCategories: readonly {
    category: string;
    capabilities: string;
    agentUse: string;
  }[];
  designHeading: string;
  designPrinciples: readonly {
    title: string;
    body: string;
  }[];
  exampleHeading: string;
  exampleBody: [string, string];
  exampleCallout: string;
  examplePostscript: string;
  faqHeading: string;
  faqItems: readonly { question: string; answer: string }[];
  relatedHeading: string;
  relatedPages: readonly {
    eyebrow: string;
    title: string;
    href: string;
    summary: string;
  }[];
  ctas: {
    primary: string;
    secondary: string;
    tertiary: string;
    github: string;
  };
};

const faqItemsEn = [
  {
    question: "What is an agent capability runtime?",
    answer:
      "An agent capability runtime is a software layer that gives AI agents installable capabilities such as image generation, video generation, image understanding, video analysis, web search, and web crawl through a single interface. It provides one install path, one authentication flow, and one command surface for every capability the agent needs, instead of requiring separate provider integrations.",
  },
  {
    question: "How does a capability runtime differ from an agent framework?",
    answer:
      "An agent framework like LangChain, CrewAI, or AutoGen provides the reasoning loop, memory, and orchestration for building agents. A capability runtime does not replace the framework. It supplies the actual capabilities that the framework's agents can invoke. They operate at different layers of the stack.",
  },
  {
    question: "How does a capability runtime differ from a tool integration platform?",
    answer:
      "A tool integration platform like Composio or Zapier connects agents to hundreds of third-party services via SDK-level integrations and per-tool OAuth. A capability runtime focuses on delivering curated, high-quality capabilities through one CLI and one auth flow. The trade-off is breadth versus depth.",
  },
  {
    question: "Why not just call provider APIs directly?",
    answer:
      "Direct API integration gives full control but requires separate authentication, error handling, rate limiting, and response normalization per provider. When an agent needs image generation from one provider, video generation from another, and vision from a third, the integration burden multiplies. A capability runtime absorbs that complexity into one interface.",
  },
  {
    question: "What capabilities does an agent capability runtime typically include?",
    answer:
      "Common capabilities include image generation, video generation, image understanding, video analysis, audio understanding, web search, web crawl, cloud storage, and static page publishing. The exact set depends on the runtime.",
  },
  {
    question: "Is AnyCap the only agent capability runtime?",
    answer:
      "AnyCap is the first product to use the term agent capability runtime as its primary category. Other products solve parts of the same problem, but none combine one install, one auth, and one CLI across the full capability stack the way a dedicated capability runtime does.",
  },
  {
    question: "Does a capability runtime replace the AI agent?",
    answer:
      "No. A capability runtime is not an agent. It runs alongside the agent and provides the capabilities the agent does not ship with. The agent handles reasoning, planning, and code execution. The runtime handles everything outside the agent's built-in surface area.",
  },
  {
    question: "How does MCP relate to a capability runtime?",
    answer:
      "MCP is a communication protocol that standardizes how agents discover and invoke tools. A capability runtime can expose its capabilities via MCP, but MCP alone does not provide the capabilities themselves. It provides the wiring, while the runtime bundles the implementations, authentication, and delivery.",
  },
] as const;

const faqItemsPtBr = [
  {
    question: "O que é um runtime de capacidade do agente?",
    answer:
      "Um runtime de capacidade do agente é uma camada de software que dá aos agentes de IA capacidades instaláveis, como geração de imagem, geração de vídeo, entendimento de imagem, análise de vídeo, busca na web e web crawl, por meio de uma interface única. Ele oferece um caminho de instalação, um fluxo de autenticação e uma superfície de comandos para tudo o que o agente precisa além do ciclo de raciocínio.",
  },
  {
    question: "Como um runtime de capacidades difere de um framework de agentes?",
    answer:
      "Um framework de agentes como LangChain, CrewAI ou AutoGen fornece o loop de raciocínio, a memória e a orquestração para construir agentes. Um runtime de capacidades não substitui esse framework. Ele fornece as capacidades reais que os agentes do framework podem invocar. Eles operam em camadas diferentes da stack.",
  },
  {
    question: "Como um runtime de capacidades difere de uma plataforma de integração de ferramentas?",
    answer:
      "Uma plataforma de integração de ferramentas como Composio ou Zapier conecta agentes a centenas de serviços de terceiros por meio de integrações em nível de SDK e OAuth por ferramenta. Um runtime de capacidades foca em entregar capacidades curadas e de alta qualidade por meio de uma CLI e um fluxo de autenticação. O trade-off é amplitude versus profundidade.",
  },
  {
    question: "Por que não chamar as APIs dos provedores diretamente?",
    answer:
      "A integração direta via API dá controle total, mas exige autenticação separada, tratamento de erros, rate limiting e normalização de respostas por provedor. Quando um agente precisa de geração de imagem de um provedor, geração de vídeo de outro e visão de um terceiro, o esforço de integração cresce muito. Um runtime de capacidades absorve essa complexidade em uma única interface.",
  },
  {
    question: "Quais capacidades um runtime de capacidades normalmente inclui?",
    answer:
      "As capacidades comuns incluem geração de imagem, geração de vídeo, entendimento de imagem, análise de vídeo, entendimento de áudio, busca na web, web crawl, armazenamento em nuvem e publicação de páginas estáticas. O conjunto exato depende do runtime.",
  },
  {
    question: "O AnyCap é o único runtime de capacidade do agente?",
    answer:
      "O AnyCap é o primeiro produto a usar o termo runtime de capacidade do agente como categoria principal. Outros produtos resolvem partes do mesmo problema, mas nenhum combina uma instalação, uma autenticação e uma CLI para toda a stack de capacidades da forma como um runtime dedicado faz.",
  },
  {
    question: "Um runtime de capacidades substitui o agente de IA?",
    answer:
      "Não. Um runtime de capacidades não é um agente. Ele roda ao lado do agente e fornece as capacidades que o agente não traz nativamente. O agente cuida de raciocínio, planejamento e execução de código. O runtime cuida de tudo o que fica fora da superfície nativa do agente.",
  },
  {
    question: "Como o MCP se relaciona com um runtime de capacidades?",
    answer:
      "O MCP é um protocolo de comunicação que padroniza como os agentes descobrem e invocam ferramentas. Um runtime de capacidades pode expor suas capacidades via MCP, mas o MCP sozinho não fornece as capacidades. Ele fornece a conexão, enquanto o runtime reúne as implementações, a autenticação e a entrega.",
  },
] as const;

const baseArchitectureRows = [
  {
    layer: "Agent (reasoning layer)",
    role: "Plans, reasons, writes code, executes shell commands, manages conversation",
    examples: "Claude Code, Cursor, Codex, OpenCode, custom LangChain agents",
  },
  {
    layer: "Harness (execution layer)",
    role: "Manages the agent lifecycle: tool routing, permissions, context window, skill discovery",
    examples: "Claude Code's built-in harness, Cursor's agent mode, OpenAI Codex sandbox",
  },
  {
    layer: "Capability runtime",
    role: "Supplies installable capabilities (generation, understanding, search, storage) through one interface",
    examples: "AnyCap",
  },
  {
    layer: "Model / provider APIs",
    role: "Serve individual model inference endpoints for specific tasks",
    examples: "OpenAI API, Google Gemini API, Replicate, fal.ai, ElevenLabs",
  },
] as const;

const baseApproachComparisons = [
  {
    approach: "Direct API integration",
    what: "Call each provider's REST or SDK API directly for image generation, video generation, vision, etc.",
    install: "Per-provider SDK install and API key setup",
    auth: "Separate credentials per provider",
    tradeoff: "Full control over each provider, but integration burden multiplies with each new capability",
    bestFor: "Teams that only need one capability from one provider and want maximum control",
  },
  {
    approach: "Agent framework",
    what: "Provide the reasoning loop, memory, tool orchestration, and agent lifecycle management",
    install: "Framework-level install (pip, npm, etc.)",
    auth: "Framework manages tool invocation; tools still need their own auth",
    tradeoff: "Strong orchestration, but the framework does not supply the actual capabilities — it calls them",
    bestFor: "Teams building custom agent architectures from scratch",
  },
  {
    approach: "Tool integration platform",
    what: "Connect agents to 100+ third-party services via SDK integrations and managed OAuth",
    install: "SDK integration into application code",
    auth: "Managed per-tool OAuth and API key storage",
    tradeoff: "Very broad coverage, but each tool is still a separate integration surface behind the platform",
    bestFor: "Teams that need CRM, email, calendar, and SaaS tool access for their agents",
  },
  {
    approach: "MCP server",
    what: "Expose a single tool or set of tools via the Model Context Protocol standard",
    install: "MCP server setup per tool or capability",
    auth: "Varies per MCP server implementation",
    tradeoff: "Protocol-level standard for agent-tool communication, but each server is a separate process",
    bestFor: "Teams extending agent products that support MCP natively (Claude Desktop, Cursor, etc.)",
  },
  {
    approach: "Capability runtime",
    what: "One install, one auth, every capability through a consistent agent-native interface",
    install: "One skill file + one CLI binary",
    auth: "Single login covers the full capability stack",
    tradeoff: "Agent-native and consistent, but capabilities are curated rather than open-ended",
    bestFor: "Teams that need multimodal capabilities inside agent workflows",
  },
] as const;

const capabilityCategoriesEn = [
  {
    category: "Generation",
    capabilities: "Image generation, video generation, music generation",
    agentUse: "Create visuals, demos, product mockups, marketing assets, background tracks",
  },
  {
    category: "Understanding",
    capabilities: "Image understanding, video analysis, audio transcription",
    agentUse: "Interpret screenshots, analyze recordings, read diagrams, extract structured data from media",
  },
  {
    category: "Web retrieval",
    capabilities: "Web search, web crawl",
    agentUse: "Research, fact-checking, competitive analysis, documentation lookup, evidence gathering",
  },
  {
    category: "Delivery",
    capabilities: "Cloud storage, static page publishing",
    agentUse: "Share generated assets with humans, publish results as web pages, store artifacts for downstream use",
  },
] as const;

const capabilityCategoriesPtBr = [
  {
    category: "Geração",
    capabilities: "Geração de imagem, geração de vídeo, geração de música",
    agentUse: "Criar visuais, demos, mockups de produto, ativos de marketing e trilhas de fundo",
  },
  {
    category: "Entendimento",
    capabilities: "Entendimento de imagem, análise de vídeo, transcrição de áudio",
    agentUse: "Interpretar capturas de tela, analisar gravações, ler diagramas e extrair dados estruturados de mídia",
  },
  {
    category: "Recuperação web",
    capabilities: "Busca na web, web crawl",
    agentUse: "Pesquisa, checagem de fatos, análise competitiva, consulta de documentação e coleta de evidências",
  },
  {
    category: "Entrega",
    capabilities: "Armazenamento em nuvem, publicação de páginas estáticas",
    agentUse: "Compartilhar ativos gerados com pessoas, publicar resultados como páginas web e armazenar artefatos para uso posterior",
  },
] as const;

const problemSignalsEn = [
  {
    signal: "The agent needs to produce an image, video, or audio artifact",
    without: "Requires a separate image API integration, separate credentials, and custom error handling",
    with: "One CLI command: anycap image generate, anycap video generate, or anycap music generate",
  },
  {
    signal: "The agent needs to interpret a screenshot, diagram, or recording",
    without: "Requires a vision API, possibly a transcription API, each with their own auth and SDK",
    with: "One CLI command: anycap image read, anycap video read, or anycap audio read",
  },
  {
    signal: "The workflow spans three or more capability providers",
    without: "Three sets of API keys, three SDKs, three error-handling patterns, three billing dashboards",
    with: "One login, one CLI, one billing surface",
  },
  {
    signal: "A new agent product needs the same capabilities the old one had",
    without: "Re-integrate each provider for the new agent, rewrite glue code, re-test auth flows",
    with: "Install the same skill file and CLI — capabilities transfer to the new agent immediately",
  },
] as const;

const problemSignalsPtBr = [
  {
    signal: "O agente precisa produzir um artefato de imagem, vídeo ou áudio",
    without: "Exige uma integração separada com API de imagem, credenciais separadas e tratamento de erros customizado",
    with: "Um único comando: anycap image generate, anycap video generate ou anycap music generate",
  },
  {
    signal: "O agente precisa interpretar uma captura de tela, diagrama ou gravação",
    without: "Exige uma API de visão, possivelmente uma API de transcrição, cada uma com sua própria autenticação e SDK",
    with: "Um único comando: anycap image read, anycap video read ou anycap audio read",
  },
  {
    signal: "O fluxo atravessa três ou mais provedores de capacidade",
    without: "Três conjuntos de chaves de API, três SDKs, três padrões de tratamento de erro, três painéis de cobrança",
    with: "Um login, uma CLI, uma única visão de cobrança",
  },
  {
    signal: "Um novo produto de agente precisa das mesmas capacidades do anterior",
    without: "Reintegrar cada provedor para o novo agente, reescrever glue code, retestar fluxos de autenticação",
    with: "Instalar o mesmo arquivo de skill e a mesma CLI - as capacidades transferem para o novo agente imediatamente",
  },
] as const;

const faqItemsDe = [
  {
    question: "Was ist ein Agent Capability Runtime?",
    answer:
      "Ein Agent Capability Runtime ist eine Softwareschicht, die KI-Agenten installierbare Capabilities wie Bildgenerierung, Videogenerierung, Bildverständnis, Videoanalyse, Web Search und Web Crawl über eine einzige Schnittstelle bereitstellt. Er bietet einen Installationspfad, einen Auth-Flow und eine Kommando-Oberfläche für jede Capability, die der Agent benötigt, statt separater Provider-Integrationen.",
  },
  {
    question: "Wie unterscheidet sich ein Capability Runtime von einem Agent Framework?",
    answer:
      "Ein Agent Framework wie LangChain, CrewAI oder AutoGen liefert die Reasoning Loop, das Memory und die Orchestrierung zum Bau von Agenten. Ein Capability Runtime ersetzt das Framework nicht. Er stellt die tatsächlichen Capabilities bereit, die die Agenten des Frameworks aufrufen können. Beide arbeiten auf unterschiedlichen Ebenen des Stacks.",
  },
  {
    question: "Wie unterscheidet sich ein Capability Runtime von einer Tool-Integrationsplattform?",
    answer:
      "Eine Tool-Integrationsplattform wie Composio oder Zapier verbindet Agenten über SDK-Integrationen und Per-Tool-OAuth mit Hunderten von Drittdiensten. Ein Capability Runtime konzentriert sich darauf, kuratierte, hochwertige Capabilities über eine CLI und einen Auth-Flow auszuliefern. Der Trade-off ist Breite versus Tiefe.",
  },
  {
    question: "Warum nicht einfach Provider-APIs direkt aufrufen?",
    answer:
      "Direkte API-Integration bietet volle Kontrolle, erfordert aber separate Authentifizierung, Fehlerbehandlung, Rate-Limiting und Response-Normalisierung pro Provider. Wenn ein Agent Bildgenerierung von einem Provider, Videogenerierung von einem anderen und Vision von einem dritten benötigt, multipliziert sich der Integrationsaufwand. Ein Capability Runtime absorbiert diese Komplexität in eine einzige Schnittstelle.",
  },
  {
    question: "Welche Capabilities umfasst ein Agent Capability Runtime typischerweise?",
    answer:
      "Häufige Capabilities sind Bildgenerierung, Videogenerierung, Bildverständnis, Videoanalyse, Audio-Transkription, Web Search, Web Crawl, Cloud-Speicher und statisches Page-Publishing. Der genaue Umfang hängt vom Runtime ab.",
  },
  {
    question: "Ist AnyCap der einzige Agent Capability Runtime?",
    answer:
      "AnyCap ist das erste Produkt, das den Begriff Agent Capability Runtime als primäre Kategorie verwendet. Andere Produkte lösen Teile desselben Problems, aber keines kombiniert ein Install, ein Auth und eine CLI über den gesamten Capability-Stack so wie ein dedizierter Capability Runtime.",
  },
  {
    question: "Ersetzt ein Capability Runtime den KI-Agenten?",
    answer:
      "Nein. Ein Capability Runtime ist kein Agent. Er läuft neben dem Agenten und stellt die Capabilities bereit, die der Agent nicht mitbringt. Der Agent übernimmt Reasoning, Planung und Code-Ausführung. Der Runtime übernimmt alles ausserhalb der eingebauten Oberfläche des Agenten.",
  },
  {
    question: "Wie steht MCP zu einem Capability Runtime?",
    answer:
      "MCP ist ein Kommunikationsprotokoll, das standardisiert, wie Agenten Tools entdecken und aufrufen. Ein Capability Runtime kann seine Capabilities über MCP exponieren, aber MCP allein liefert die Capabilities nicht. Es liefert die Verdrahtung, während der Runtime die Implementierungen, Authentifizierung und Auslieferung bündelt.",
  },
] as const;

const capabilityCategoriesDe = [
  {
    category: "Generierung",
    capabilities: "Bildgenerierung, Videogenerierung, Musikgenerierung",
    agentUse: "Visuals, Demos, Produkt-Mockups, Marketing-Assets und Hintergrund-Tracks erstellen",
  },
  {
    category: "Verständnis",
    capabilities: "Bildverständnis, Videoanalyse, Audio-Transkription",
    agentUse: "Screenshots interpretieren, Aufnahmen analysieren, Diagramme lesen, strukturierte Daten aus Medien extrahieren",
  },
  {
    category: "Web-Retrieval",
    capabilities: "Web Search, Web Crawl",
    agentUse: "Recherche, Faktenprüfung, Wettbewerbsanalyse, Doku-Suche, Evidenzsammlung",
  },
  {
    category: "Auslieferung",
    capabilities: "Cloud-Speicher, statisches Page-Publishing",
    agentUse: "Generierte Assets mit Menschen teilen, Ergebnisse als Webseiten veröffentlichen, Artefakte für die Weiterverarbeitung speichern",
  },
] as const;

const problemSignalsDe = [
  {
    signal: "Der Agent muss ein Bild-, Video- oder Audio-Artefakt erzeugen",
    without: "Erfordert eine separate Image-API-Integration, separate Credentials und individuelle Fehlerbehandlung",
    with: "Ein CLI-Befehl: anycap image generate, anycap video generate oder anycap music generate",
  },
  {
    signal: "Der Agent muss einen Screenshot, ein Diagramm oder eine Aufnahme interpretieren",
    without: "Erfordert eine Vision-API, ggf. eine Transkriptions-API, jede mit eigenem Auth und SDK",
    with: "Ein CLI-Befehl: anycap image read, anycap video read oder anycap audio read",
  },
  {
    signal: "Der Workflow umfasst drei oder mehr Capability-Provider",
    without: "Drei API-Key-Sets, drei SDKs, drei Fehlerbehandlungs-Patterns, drei Billing-Dashboards",
    with: "Ein Login, eine CLI, eine Billing-Oberfläche",
  },
  {
    signal: "Ein neues Agent-Produkt benötigt dieselben Capabilities wie das vorherige",
    without: "Jeden Provider für den neuen Agenten neu integrieren, Glue Code neu schreiben, Auth-Flows neu testen",
    with: "Dieselbe Skill-Datei und CLI installieren - die Capabilities übertragen sich sofort auf den neuen Agenten",
  },
] as const;

const relatedPages = [
  {
    eyebrow: "Glossary",
    title: "What is context engineering?",
    href: "/glossary/context-engineering",
    summary: "How agents manage the information they feed to the model at inference time.",
  },
  {
    eyebrow: "Glossary",
    title: "What is an agent harness?",
    href: "/glossary/agent-harness",
    summary: "The execution layer that manages tool routing, permissions, and agent lifecycle.",
  },
  {
    eyebrow: "Guide",
    title: "Context engineering for agents",
    href: "/guides/context-engineering-for-agents",
    summary: "Practical strategies for curating the right context inside agent workflows.",
  },
  {
    eyebrow: "Guide",
    title: "Agent skills for developer tools",
    href: "/guides/agent-skills-for-developer-tools",
    summary: "How skill files let agents discover and invoke capabilities without manual configuration.",
  },
  {
    eyebrow: "Compare",
    title: "AnyCap vs Composio",
    href: "/compare/anycap-vs-composio",
    summary: "How a capability runtime compares to a tool integration platform.",
  },
  {
    eyebrow: "Compare",
    title: "AnyCap vs Replicate",
    href: "/compare/anycap-vs-replicate",
    summary: "How a capability runtime compares to a model inference platform.",
  },
] as const;

function buildFaqJsonLd(faqItems: readonly { question: string; answer: string }[]) {
  return createFaqPageJsonLd(faqItems);
}

function buildMetadata(locale: SiteLocale, title: string, description: string): Metadata {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      locale: getLocaleConfig(locale).ogLocale,
      siteName: siteConfig.siteName,
    },
  };
}

const contentByLocale: Record<SiteLocale, AgentCapabilityRuntimePageData> = {
  en: {
    breadcrumbItems: [
      { name: "Home", href: "/" },
      { name: "Glossary", href: "/glossary", unlinkable: true },
      { name: "Agent Capability Runtime", href: "/glossary/agent-capability-runtime" },
    ],
    metadata: {
      title: "What is an Agent Capability Runtime? | AnyCap",
      description:
        "An agent capability runtime gives AI agents installable capabilities (image, video, vision) through one interface and one auth flow. See how it differs from agent frameworks and tool platforms.",
      openGraphTitle: "What is an Agent Capability Runtime? | AnyCap",
      openGraphDescription:
        "An agent capability runtime gives AI agents installable capabilities through one interface. Learn how it differs from agent frameworks, tool integration platforms, and direct API integrations.",
    },
    definitionJsonLd: {
      "@context": "https://schema.org",
      "@type": "DefinedTerm",
      name: "Agent Capability Runtime",
      description:
        "A software layer that gives AI agents installable capabilities through a single interface, rather than requiring separate integrations for each capability.",
      url: getLocalizedRouteUrl(siteConfig.defaultLocale, AGENT_CAPABILITY_RUNTIME_PATH),
    },
    articleJsonLd: createTechArticleJsonLd({
      headline: "What is an Agent Capability Runtime? Definition, Architecture, and Why It Matters",
      description:
        "Deep guide to agent capability runtimes: what they are, how they differ from agent frameworks and tool platforms, what architecture problems they solve, and when teams should adopt one.",
      path: AGENT_CAPABILITY_RUNTIME_PATH,
      about: ["Agent Capability Runtime", "AI agents", "Multimodal AI", "Agent architecture", "Tool integration"],
      keywords: [
        "agent capability runtime",
        "ai capability runtime",
        "ai agent runtime",
        "agent tools",
        "agent capabilities",
        "multimodal agent",
        "agent architecture",
      ],
      datePublished: "2026-04-03",
      dateModified: "2026-04-10",
    }),
    faqJsonLd: buildFaqJsonLd(faqItemsEn),
    eyebrow: "Glossary",
    lastUpdatedLabel: "April 10, 2026",
    heroTitle: ["What is an agent", "capability runtime?"],
    heroBody: [
      "An agent capability runtime is a software layer that gives AI agents installable capabilities through one consistent interface. Instead of requiring separate SDKs, authentication flows, response formats, and lifecycle handling for every capability, the runtime provides one install path, one auth flow, and one command surface for what the agent needs beyond its built-in reasoning loop. This matters when workflows cross multiple providers, because integration complexity grows faster than model quality improvements. A runtime absorbs that complexity so teams can focus on task completion, not glue code maintenance.",
      "The term names a specific architectural layer in the agent stack. An agent handles reasoning, planning, and code execution. A harness manages lifecycle, permissions, and tool routing. A capability runtime sits below both and supplies concrete actions such as generation, understanding, retrieval, storage, and publishing through an agent-native contract. With this separation, teams can evolve models, prompts, and providers without rewriting execution logic every time capability requirements expand.",
    ],
    sectionLabels: {
      architecture: "Architecture",
      motivation: "Motivation",
      comparison: "Comparison",
      scope: "Scope",
      design: "Design",
      example: "Example",
    },
    architectureHeading: "Where a capability runtime fits in the agent stack",
    architectureIntro:
      "An agent stack has multiple layers, and each layer exists to solve a different class of problems. A capability runtime occupies the layer between the harness and model/provider APIs, where execution consistency matters most. Its role is to unify capabilities that would otherwise be scattered across providers, each with different auth models, request contracts, and failure semantics. By centralizing that layer, teams reduce operational drift and keep agent behavior more predictable as workflows grow in modality and complexity. This is also the layer where teams gain leverage: one runtime update can improve many workflows without touching every agent integration separately. In practical operations, this usually means lower onboarding cost, cleaner incident boundaries, and fewer regressions when provider behavior changes. It also creates a stable contract for platform teams to enforce policy without blocking delivery speed.",
    architectureTable: baseArchitectureRows,
    architectureClosing:
      "The key insight is that capabilities are not the same as the agent, and they are not the same as the model API. A capability runtime is a dedicated layer that bridges the gap between what the agent can do natively and what the workflow actually requires.",
    motivationHeading: "The problem a capability runtime solves",
    motivationIntro:
      "Without a capability runtime, adding each new capability to an agent workflow means a separate integration. The table below shows what changes when a runtime absorbs that integration work.",
    problemSignals: problemSignalsEn,
    comparisonHeading: "How it differs from other approaches",
    comparisonIntro:
      "A capability runtime is not the only way to give agents new abilities, but it solves a specific execution problem that other approaches often leave open. Frameworks orchestrate reasoning loops, tool platforms maximize integration breadth, and direct APIs maximize low-level control. A capability runtime optimizes for consistent operational delivery across multimodal actions in agent environments. The best choice depends on workflow breadth, provider count, and how much integration overhead your team can absorb without slowing product delivery. In practice, teams with high cross-modal repetition usually benefit most from this layer. The value compounds when multiple agent products need the same capabilities with the same reliability expectations. This becomes especially visible when one workflow must run unchanged across different harnesses and release cycles. It is the difference between repeated reintegration and reusable execution infrastructure.",
    approachComparisons: baseApproachComparisons,
    scopeHeading: "What capabilities a runtime typically includes",
    scopeIntro:
      "A capability runtime covers capabilities that sit outside the agent's built-in reasoning loop but are repeatedly required inside real workflows. The goal is not to replace reasoning, but to make non-reasoning actions available through a stable execution layer. In practice, most runtime inventories group naturally into four categories so teams can reason about coverage, identify gaps, and expand capability access without redesigning their orchestration model each time a new task type appears. This category framing also makes roadmap planning clearer because teams can prioritize by workflow impact instead of provider marketing. It helps product and engineering teams align on what to add next based on execution bottlenecks, not hype cycles. As capability count grows, this structure prevents inventory sprawl from degrading agent reliability or slowing cross-team adoption. It also keeps documentation and implementation language aligned across teams.",
    capabilityCategories: capabilityCategoriesEn,
    designHeading: "Key design principles of a capability runtime",
    designPrinciples: [
      {
        title: "One install path",
        body:
          "Agents should not need to discover, download, and configure a separate package for each capability. A capability runtime installs once and makes every capability available through the same binary or skill file.",
      },
      {
        title: "One auth flow",
        body:
          "Authentication should happen once and carry across every capability. Agents should not manage separate API keys, OAuth tokens, or billing accounts per provider.",
      },
      {
        title: "Agent-native interface",
        body:
          "The interface should match how agents already work. For terminal-native agents, that means a CLI. For SDK-based agents, that might mean a library.",
      },
      {
        title: "Provider abstraction",
        body:
          "The runtime abstracts away provider differences. If the image generation model changes, the agent's invocation pattern stays the same. Model selection is a parameter, not a re-integration.",
      },
      {
        title: "Portability across agents",
        body:
          "Capabilities should transfer when teams switch agents. If a team moves from Claude Code to Cursor or Codex, the same capability runtime should work without re-integrating providers.",
      },
    ],
    exampleHeading: "AnyCap as a capability runtime",
    exampleBody: [
      "AnyCap is an agent-native capability runtime built from day one for agent workflows. It implements the design principles above: one skill file install, one CLI binary, one login, and one command surface for every capability.",
      "Today AnyCap provides image generation, video generation, music generation, image understanding, video analysis, audio understanding, web search, grounded web search, web crawl, Drive storage, and Page publishing. It works across Claude Code, Cursor, Codex, and other agent products via skill files.",
    ],
    exampleCallout: "curl -fsSL https://anycap.ai/install.sh | sh && anycap login",
    examplePostscript:
      "After this, every capability is available through anycap <capability> <operation> in any supported agent product.",
    faqHeading: "FAQ",
    faqItems: faqItemsEn as unknown as { question: string; answer: string }[],
    relatedHeading: "Related pages",
    relatedPages,
    ctas: {
      primary: "See Capabilities",
      secondary: "CLI Overview",
      tertiary: "Get Started",
      github: "View on GitHub",
    },
  },
  "pt-br": {
    breadcrumbItems: [
      { name: "Início", href: "/" },
      { name: "Glossário", href: "/glossary", unlinkable: true },
      { name: "Runtime de Capacidade do Agente", href: "/glossary/agent-capability-runtime" },
    ],
    metadata: {
      title: "O que é um runtime de capacidade do agente? | AnyCap",
      description:
        "Um runtime de capacidade do agente é uma camada de software que dá aos agentes de IA capacidades instaláveis por meio de uma interface única, um fluxo único de autenticação e um único caminho de instalação. Veja como ele difere de frameworks de agentes, plataformas de ferramentas e integrações diretas com APIs.",
      openGraphTitle: "O que é um runtime de capacidade do agente? | AnyCap",
      openGraphDescription:
        "Um runtime de capacidade do agente dá aos agentes de IA capacidades instaláveis por meio de uma interface única. Veja como ele difere de frameworks de agentes, plataformas de integração e integrações diretas.",
    },
    definitionJsonLd: {
      "@context": "https://schema.org",
      "@type": "DefinedTerm",
      name: "Runtime de Capacidade do Agente",
      description:
        "Uma camada de software que dá aos agentes de IA capacidades instaláveis por meio de uma interface única, em vez de exigir integrações separadas para cada capacidade.",
      url: getLocalizedRouteUrl(siteConfig.defaultLocale, AGENT_CAPABILITY_RUNTIME_PATH),
    },
    articleJsonLd: createTechArticleJsonLd({
      headline: "O que é um runtime de capacidade do agente? Definição, arquitetura e por que isso importa",
      description:
        "Guia aprofundado sobre runtimes de capacidade do agente: o que são, como diferem de frameworks e plataformas de ferramentas, que problemas de arquitetura resolvem e quando times devem adotá-los.",
      path: AGENT_CAPABILITY_RUNTIME_PATH,
      about: ["Runtime de Capacidade do Agente", "agentes de IA", "IA multimodal", "arquitetura de agentes", "integração de ferramentas"],
      keywords: [
        "runtime de capacidade do agente",
        "runtime de capacidades de ia",
        "runtime de agente ia",
        "ferramentas de agente",
        "capacidades de agente",
        "agente multimodal",
        "arquitetura de agentes",
      ],
      datePublished: "2026-04-03",
      dateModified: "2026-04-10",
    }),
    faqJsonLd: buildFaqJsonLd(faqItemsPtBr),
    eyebrow: "Glossário",
    lastUpdatedLabel: "10 de abril de 2026",
    heroTitle: ["O que é um runtime de", "capacidade do agente?"],
    heroBody: [
      "Um runtime de capacidade do agente é uma camada de software que entrega capacidades instaláveis por uma interface única para agentes de IA. Em vez de exigir SDKs, fluxos de autenticação, formatos de resposta e tratamento de erro separados para cada capability, o runtime oferece um caminho de instalação, um fluxo de autenticação e uma superfície de comandos consistente para tudo o que fica fora do loop nativo de raciocínio. Isso reduz o custo de integração quando o workflow atravessa vários provedores e evita que o time gaste mais energia em glue code do que em resultado.",
      "O termo descreve uma camada arquitetural específica na stack de agentes. O agente cuida de raciocínio, planejamento e execução de código. O harness cuida de ciclo de vida, permissões e roteamento. O runtime de capacidades fica abaixo dos dois e fornece ações concretas como geração, entendimento, recuperação, armazenamento e publicação por um contrato nativo para agentes. Com essa separação, o time consegue evoluir modelo, prompt e provedor sem reescrever a base de execução a cada nova necessidade.",
    ],
    sectionLabels: {
      architecture: "Arquitetura",
      motivation: "Motivação",
      comparison: "Comparação",
      scope: "Escopo",
      design: "Design",
      example: "Exemplo",
    },
    architectureHeading: "Onde um runtime de capacidades se encaixa na stack de agentes",
    architectureIntro:
      "Uma stack de agentes possui várias camadas, cada uma responsável por resolver um tipo diferente de problema. O runtime de capacidades ocupa a faixa entre o harness e as APIs de modelo/provedor, exatamente onde consistência de execução se torna crítica. Sua função é unificar capacidades que normalmente ficam espalhadas em provedores com autenticação, contratos e comportamento de falha diferentes. Ao centralizar essa camada, o time reduz deriva operacional e mantém comportamento do agente mais previsível conforme o workflow cresce em modalidades. Esse também é o ponto de maior alavanca: uma melhoria no runtime pode beneficiar muitos fluxos sem retrabalho em cada integração.",
    architectureTable: baseArchitectureRows.map((row) => {
      if (row.layer === "Agent (reasoning layer)") {
        return {
          layer: "Agente (camada de raciocínio)",
          role: "Planeja, raciocina, escreve código, executa comandos de shell e gerencia a conversa",
          examples: "Claude Code, Cursor, Codex, OpenCode, agentes LangChain personalizados",
        };
      }

      if (row.layer === "Harness (execution layer)") {
        return {
          layer: "Harness (camada de execução)",
          role: "Gerencia o ciclo de vida do agente: roteamento de ferramentas, permissões, janela de contexto, descoberta de skills",
          examples: "Harness nativo do Claude Code, modo agente do Cursor, sandbox do OpenAI Codex",
        };
      }

      if (row.layer === "Capability runtime") {
        return {
          layer: "Runtime de capacidades",
          role: "Fornece capacidades instaláveis (geração, entendimento, busca, armazenamento) por meio de uma interface única",
          examples: "AnyCap",
        };
      }

      return {
        layer: "APIs do modelo / provedor",
        role: "Disponibilizam endpoints individuais de inferência para tarefas específicas",
        examples: "OpenAI API, Google Gemini API, Replicate, fal.ai, ElevenLabs",
      };
    }),
    architectureClosing:
      "O ponto principal é que capacidades não são a mesma coisa que o agente, e também não são a mesma coisa que a API do modelo. Um runtime de capacidades é uma camada dedicada que faz a ponte entre o que o agente consegue fazer nativamente e o que o fluxo realmente exige.",
    motivationHeading: "O problema que um runtime de capacidades resolve",
    motivationIntro:
      "Sem um runtime de capacidades, adicionar cada nova capacidade a um fluxo de agente significa uma integração separada. A tabela abaixo mostra o que muda quando um runtime absorve esse trabalho.",
    problemSignals: problemSignalsPtBr,
    comparisonHeading: "Como ele difere de outras abordagens",
    comparisonIntro:
      "Um runtime de capacidades não é a única forma de ampliar habilidades dos agentes, mas resolve um problema de execução que outras abordagens geralmente deixam em aberto. Frameworks ajudam na orquestração do raciocínio, plataformas de integração ampliam cobertura de ferramentas e APIs diretas dão controle fino de infraestrutura. O runtime de capacidades otimiza entrega operacional consistente de ações multimodais dentro do ambiente do agente. A escolha correta depende da amplitude do fluxo, do número de provedores e do overhead de integração que o time consegue absorver sem desacelerar entrega. Em prática de produto, times com repetição alta de tarefas multimodais tendem a capturar mais valor nessa camada.",
    approachComparisons: baseApproachComparisons.map((row) => {
      if (row.approach === "Direct API integration") {
        return {
          approach: "Integração direta com API",
          what: "Chamar diretamente a API REST ou SDK de cada provedor para geração de imagem, geração de vídeo, visão etc.",
          install: "Instalação de SDK e configuração de chave de API por provedor",
          auth: "Credenciais separadas por provedor",
          tradeoff: "Controle total sobre cada provedor, mas o esforço de integração cresce a cada nova capacidade",
          bestFor: "Times que precisam de uma única capacidade de um único provedor e querem controle máximo",
        };
      }

      if (row.approach === "Agent framework") {
        return {
          approach: "Framework de agentes",
          what: "Fornecer o loop de raciocínio, memória, orquestração de ferramentas e gerenciamento do ciclo de vida do agente",
          install: "Instalação no nível do framework (pip, npm etc.)",
          auth: "O framework gerencia a invocação das ferramentas; as ferramentas ainda precisam de autenticação própria",
          tradeoff: "Boa orquestração, mas o framework não fornece as capacidades reais - ele apenas as chama",
          bestFor: "Times construindo arquiteturas de agentes personalizadas do zero",
        };
      }

      if (row.approach === "Tool integration platform") {
        return {
          approach: "Plataforma de integração de ferramentas",
          what: "Conectar agentes a mais de 100 serviços de terceiros por meio de integrações em SDK e OAuth gerenciado",
          install: "Integração do SDK na aplicação",
          auth: "OAuth gerenciado por ferramenta e armazenamento de chaves de API",
          tradeoff: "Cobertura muito ampla, mas cada ferramenta ainda é uma superfície de integração separada por trás da plataforma",
          bestFor: "Times que precisam de acesso a CRM, email, calendário e serviços SaaS para seus agentes",
        };
      }

      if (row.approach === "MCP server") {
        return {
          approach: "Servidor MCP",
          what: "Expor uma única ferramenta ou um conjunto de ferramentas via o padrão Model Context Protocol",
          install: "Configuração de servidor MCP por ferramenta ou capacidade",
          auth: "Varia conforme a implementação de cada servidor MCP",
          tradeoff: "Padrão em nível de protocolo para comunicação agente-ferramenta, mas cada servidor é um processo separado",
          bestFor: "Times que estendem produtos de agente com suporte nativo a MCP (Claude Desktop, Cursor etc.)",
        };
      }

      return {
        approach: "Runtime de capacidades",
        what: "Uma instalação, uma autenticação, todas as capacidades por meio de uma interface consistente e nativa para agentes",
        install: "Um arquivo de skill + um binário de CLI",
        auth: "Um único login cobre toda a stack de capacidades",
        tradeoff: "Nativo para agentes e consistente, mas as capacidades são curadas em vez de totalmente abertas",
        bestFor: "Times que precisam de capacidades multimodais dentro dos fluxos dos agentes",
      };
    }),
    scopeHeading: "Quais capacidades um runtime normalmente inclui",
    scopeIntro:
      "Um runtime de capacidades cobre ações que ficam fora do loop nativo de raciocínio do agente, mas aparecem com alta frequência em fluxos reais. O objetivo não é substituir raciocínio, e sim tornar ações não nativas acessíveis por uma camada de execução estável e reutilizável. Na prática, o inventário costuma se organizar em quatro categorias, o que ajuda o time a enxergar cobertura, priorizar lacunas e expandir capabilities sem redesenhar a orquestração toda vez que surge um novo tipo de tarefa. Esse enquadramento também facilita priorização de roadmap por impacto operacional, em vez de seguir apenas tendência de provedor.",
    capabilityCategories: capabilityCategoriesPtBr,
    designHeading: "Princípios de design de um runtime de capacidades",
    designPrinciples: [
      {
        title: "Um caminho de instalação",
        body:
          "Os agentes não deveriam precisar descobrir, baixar e configurar um pacote separado para cada capacidade. Um runtime de capacidades instala uma vez e expõe tudo pelo mesmo binário ou arquivo de skill.",
      },
      {
        title: "Um fluxo de autenticação",
        body:
          "A autenticação deve acontecer uma vez e valer para todas as capacidades. Os agentes não deveriam gerenciar chaves de API, tokens OAuth ou contas de cobrança separadas para cada provedor.",
      },
      {
        title: "Interface nativa para agentes",
        body:
          "A interface deve combinar com a forma como os agentes já trabalham. Para agentes nativos de terminal, isso significa uma CLI. Para agentes baseados em SDK, isso pode significar uma biblioteca.",
      },
      {
        title: "Abstração de provedores",
        body:
          "O runtime abstrai diferenças entre provedores. Se o modelo de geração de imagem mudar, o padrão de invocação do agente continua o mesmo. A seleção do modelo é um parâmetro, não uma reintegração.",
      },
      {
        title: "Portabilidade entre agentes",
        body:
          "As capacidades devem acompanhar o time quando ele troca de agente. Se o time migrar de Claude Code para Cursor ou Codex, o mesmo runtime deve continuar funcionando sem reintegrar provedores.",
      },
    ],
    exampleHeading: "AnyCap como runtime de capacidades",
    exampleBody: [
      "O AnyCap é um runtime de capacidades nativo para agentes, construído desde o início para fluxos com agentes. Ele implementa os princípios acima: uma instalação de skill file, uma CLI, um login e uma única superfície de comandos para cada capacidade.",
      "Hoje o AnyCap fornece geração de imagem, geração de vídeo, geração de música, entendimento de imagem, análise de vídeo, entendimento de áudio, busca na web, busca fundamentada, web crawl, armazenamento no Drive e publicação de páginas. Ele funciona com Claude Code, Cursor, Codex e outros produtos de agentes por meio de skill files.",
    ],
    exampleCallout: "curl -fsSL https://anycap.ai/install.sh | sh && anycap login",
    examplePostscript:
      "Depois disso, toda capacidade fica disponível por meio de anycap <capability> <operation> em qualquer produto de agente suportado.",
    faqHeading: "FAQ",
    faqItems: faqItemsPtBr as unknown as { question: string; answer: string }[],
    relatedHeading: "Páginas relacionadas",
    relatedPages: [
      {
        eyebrow: "Glossário",
        title: "O que é engenharia de contexto?",
        href: "/glossary/context-engineering",
        summary: "Como os agentes gerenciam as informações que enviam ao modelo em tempo de inferência.",
      },
      {
        eyebrow: "Glossário",
        title: "O que é um agent harness?",
        href: "/glossary/agent-harness",
        summary: "A camada de execução que gerencia roteamento de ferramentas, permissões e ciclo de vida do agente.",
      },
      {
        eyebrow: "Guia",
        title: "Engenharia de contexto para agentes",
        href: "/guides/context-engineering-for-agents",
        summary: "Estratégias práticas para curar o contexto certo dentro dos fluxos com agentes.",
      },
      {
        eyebrow: "Guia",
        title: "Skills de agente para ferramentas de desenvolvimento",
        href: "/guides/agent-skills-for-developer-tools",
        summary: "Como os arquivos de skill permitem que agentes descubram e invoquem capacidades sem configuração manual.",
      },
      {
        eyebrow: "Comparar",
        title: "AnyCap vs Composio",
        href: "/compare/anycap-vs-composio",
        summary: "Como um runtime de capacidades se compara a uma plataforma de integração de ferramentas.",
      },
      {
        eyebrow: "Comparar",
        title: "AnyCap vs Replicate",
        href: "/compare/anycap-vs-replicate",
        summary: "Como um runtime de capacidades se compara a uma plataforma de inferência de modelos.",
      },
    ],
    ctas: {
      primary: "Ver capacidades",
      secondary: "Visão da CLI",
      tertiary: "Começar",
      github: "Ver no GitHub",
    },
  },
  id: undefined as unknown as AgentCapabilityRuntimePageData,
  de: {
    breadcrumbItems: [
      { name: "Start", href: "/" },
      { name: "Glossar", href: "/glossary", unlinkable: true },
      { name: "Agent Capability Runtime", href: "/glossary/agent-capability-runtime" },
    ],
    metadata: {
      title: "Was ist ein Agent Capability Runtime? | AnyCap",
      description:
        "Ein Agent Capability Runtime ist eine Softwareschicht, die KI-Agenten installierbare Capabilities über eine einzige Schnittstelle, einen Auth-Flow und einen Installationspfad bereitstellt. Erfahren Sie, wie er sich von Agent Frameworks, Tool-Plattformen und direkten API-Integrationen unterscheidet.",
      openGraphTitle: "Was ist ein Agent Capability Runtime? | AnyCap",
      openGraphDescription:
        "Ein Agent Capability Runtime gibt KI-Agenten installierbare Capabilities über eine einzige Schnittstelle. Erfahren Sie, wie er sich von Agent Frameworks, Tool-Integrationsplattformen und direkten API-Integrationen unterscheidet.",
    },
    definitionJsonLd: {
      "@context": "https://schema.org",
      "@type": "DefinedTerm",
      name: "Agent Capability Runtime",
      description:
        "Eine Softwareschicht, die KI-Agenten installierbare Capabilities über eine einzige Schnittstelle bereitstellt, statt separate Integrationen für jede Capability zu erfordern.",
      url: getLocalizedRouteUrl(siteConfig.defaultLocale, AGENT_CAPABILITY_RUNTIME_PATH),
    },
    articleJsonLd: createTechArticleJsonLd({
      headline: "Was ist ein Agent Capability Runtime? Definition, Architektur und warum es wichtig ist",
      description:
        "Tiefgehender Leitfaden zu Agent Capability Runtimes: was sie sind, wie sie sich von Agent Frameworks und Tool-Plattformen unterscheiden, welche Architekturprobleme sie lösen und wann Teams einen einführen sollten.",
      path: AGENT_CAPABILITY_RUNTIME_PATH,
      about: ["Agent Capability Runtime", "KI-Agenten", "Multimodale KI", "Agent-Architektur", "Tool-Integration"],
      keywords: [
        "agent capability runtime",
        "ki capability runtime",
        "ki agent runtime",
        "agent tools",
        "agent capabilities",
        "multimodaler agent",
        "agent-architektur",
      ],
      datePublished: "2026-04-03",
      dateModified: "2026-04-10",
    }),
    faqJsonLd: buildFaqJsonLd(faqItemsDe),
    eyebrow: "Glossar",
    lastUpdatedLabel: "10. April 2026",
    heroTitle: ["Was ist ein Agent", "Capability Runtime?"],
    heroBody: [
      "Ein Agent Capability Runtime ist eine Softwareschicht, die KI-Agenten installierbare Capabilities über eine einheitliche Schnittstelle bereitstellt. Statt für jede Capability separate SDKs, Auth-Flows, Response-Formate und Lifecycle-Handling zu fordern, bietet der Runtime einen Installationspfad, einen Auth-Flow und eine Kommando-Oberfläche für alles, was der Agent jenseits seiner eingebauten Reasoning Loop benötigt. Das ist entscheidend, wenn Workflows mehrere Provider umspannen, weil Integrationskomplexität schneller waechst als Modellqualität. Ein Runtime absorbiert diese Komplexität, damit Teams sich auf Aufgaben statt auf Glue-Code-Pflege konzentrieren können.",
      "Der Begriff benennt eine spezifische Architekturschicht im Agent-Stack. Ein Agent übernimmt Reasoning, Planung und Code-Ausführung. Ein Harness verwaltet Lifecycle, Berechtigungen und Tool-Routing. Ein Capability Runtime liegt unter beiden und liefert konkrete Aktionen wie Generierung, Verständnis, Retrieval, Speicherung und Publishing über einen agent-nativen Vertrag. Mit dieser Trennung können Teams Modelle, Prompts und Provider weiterentwickeln, ohne die Ausführungslogik bei jeder neuen Capability-Anforderung neu zu schreiben.",
    ],
    sectionLabels: {
      architecture: "Architektur",
      motivation: "Motivation",
      comparison: "Vergleich",
      scope: "Umfang",
      design: "Design",
      example: "Beispiel",
    },
    architectureHeading: "Wo ein Capability Runtime im Agent-Stack sitzt",
    architectureIntro:
      "Ein Agent-Stack besteht aus mehreren Schichten, von denen jede eine eigene Problemklasse löst. Ein Capability Runtime besetzt die Schicht zwischen Harness und Modell-/Provider-APIs, also genau dort, wo Ausführungskonsistenz am wichtigsten ist. Seine Aufgabe ist es, Capabilities zu vereinheitlichen, die sonst über Provider mit unterschiedlichen Auth-Modellen, Request-Verträgen und Fehler-Semantiken verstreut wären. Durch die Zentralisierung dieser Schicht reduziert das Team operativen Drift und hält das Agent-Verhalten vorhersagbarer, während Workflows in Modalität und Komplexität wachsen. Hier liegt auch der grösste Hebel: Ein Runtime-Update kann viele Workflows verbessern, ohne jede einzelne Agent-Integration anfassen zu müssen. In der Praxis bedeutet das geringere Onboarding-Kosten, sauberere Incident-Grenzen und weniger Regressionen bei Provider-Änderungen. Es schafft zudem einen stabilen Vertrag, über den Plattform-Teams Policies durchsetzen können, ohne die Auslieferungsgeschwindigkeit zu bremsen.",
    architectureTable: baseArchitectureRows.map((row) => {
      if (row.layer === "Agent (reasoning layer)") {
        return {
          layer: "Agent (Reasoning-Schicht)",
          role: "Plant, schlussfolgert, schreibt Code, führt Shell-Befehle aus, verwaltet die Konversation",
          examples: "Claude Code, Cursor, Codex, OpenCode, individuelle LangChain-Agenten",
        };
      }

      if (row.layer === "Harness (execution layer)") {
        return {
          layer: "Harness (Ausführungsschicht)",
          role: "Verwaltet den Agent-Lifecycle: Tool-Routing, Berechtigungen, Context Window, Skill-Discovery",
          examples: "Eingebauter Harness von Claude Code, Agent-Modus von Cursor, OpenAI Codex Sandbox",
        };
      }

      if (row.layer === "Capability runtime") {
        return {
          layer: "Capability Runtime",
          role: "Liefert installierbare Capabilities (Generierung, Verständnis, Suche, Speicherung) über eine einheitliche Schnittstelle",
          examples: "AnyCap",
        };
      }

      return {
        layer: "Modell- / Provider-APIs",
        role: "Stellen einzelne Modell-Inferenz-Endpoints für spezifische Aufgaben bereit",
        examples: "OpenAI API, Google Gemini API, Replicate, fal.ai, ElevenLabs",
      };
    }),
    architectureClosing:
      "Die zentrale Erkenntnis: Capabilities sind nicht dasselbe wie der Agent, und sie sind nicht dasselbe wie die Modell-API. Ein Capability Runtime ist eine dedizierte Schicht, die die Lücke zwischen den nativen Fähigkeiten des Agenten und dem schließt, was der Workflow tatsaechlich verlangt.",
    motivationHeading: "Welches Problem ein Capability Runtime löst",
    motivationIntro:
      "Ohne einen Capability Runtime bedeutet jede neue Capability in einem Agent-Workflow eine separate Integration. Die folgende Tabelle zeigt, was sich ändert, wenn ein Runtime diese Integrationsarbeit absorbiert.",
    problemSignals: problemSignalsDe,
    comparisonHeading: "Wie er sich von anderen Ansätzen unterscheidet",
    comparisonIntro:
      "Ein Capability Runtime ist nicht der einzige Weg, Agenten neue Fähigkeiten zu geben, aber er löst ein spezifisches Ausführungsproblem, das andere Ansätze oft offen lassen. Frameworks orchestrieren Reasoning Loops, Tool-Plattformen maximieren Integrationsbreite und direkte APIs maximieren Low-Level-Kontrolle. Ein Capability Runtime optimiert konsistente operative Auslieferung über multimodale Aktionen in Agent-Umgebungen. Die richtige Wahl hängt von Workflow-Breite, Provider-Anzahl und dem Integrations-Overhead ab, den Ihr Team absorbieren kann, ohne die Produktauslieferung zu verlangsamen. In der Praxis profitieren Teams mit hoher modalübergreifender Wiederholung am meisten von dieser Schicht. Der Wert verstaerkt sich, wenn mehrere Agent-Produkte dieselben Capabilities mit denselben Zuverlässigkeitserwartungen benötigen. Besonders sichtbar wird das, wenn ein Workflow unverändert über verschiedene Harnesses und Release-Zyklen laufen muss. Es ist der Unterschied zwischen wiederholter Reintegration und wiederverwendbarer Ausführungs-Infrastruktur.",
    approachComparisons: baseApproachComparisons.map((row) => {
      if (row.approach === "Direct API integration") {
        return {
          approach: "Direkte API-Integration",
          what: "Direkter Aufruf der REST- oder SDK-API jedes Providers für Bildgenerierung, Videogenerierung, Vision usw.",
          install: "SDK-Installation und API-Key-Einrichtung pro Provider",
          auth: "Separate Credentials pro Provider",
          tradeoff: "Volle Kontrolle über jeden Provider, aber der Integrationsaufwand multipliziert sich mit jeder neuen Capability",
          bestFor: "Teams, die nur eine Capability von einem Provider benötigen und maximale Kontrolle wollen",
        };
      }

      if (row.approach === "Agent framework") {
        return {
          approach: "Agent Framework",
          what: "Liefert die Reasoning Loop, Memory, Tool-Orchestrierung und Agent-Lifecycle-Verwaltung",
          install: "Framework-Installation (pip, npm usw.)",
          auth: "Das Framework verwaltet Tool-Aufrufe; Tools benötigen weiterhin eigenes Auth",
          tradeoff: "Starke Orchestrierung, aber das Framework liefert die Capabilities nicht selbst - es ruft sie nur auf",
          bestFor: "Teams, die individuelle Agent-Architekturen von Grund auf bauen",
        };
      }

      if (row.approach === "Tool integration platform") {
        return {
          approach: "Tool-Integrationsplattform",
          what: "Verbindet Agenten via SDK-Integrationen und Managed OAuth mit über 100 Drittdiensten",
          install: "SDK-Integration in den Anwendungscode",
          auth: "Managed Per-Tool-OAuth und API-Key-Ablage",
          tradeoff: "Sehr breite Abdeckung, aber jedes Tool bleibt eine separate Integrationsoberflaeche hinter der Plattform",
          bestFor: "Teams, die Zugriff auf CRM, E-Mail, Kalender und SaaS-Tools für ihre Agenten brauchen",
        };
      }

      if (row.approach === "MCP server") {
        return {
          approach: "MCP-Server",
          what: "Stellt ein einzelnes Tool oder Tool-Set über den Model Context Protocol Standard bereit",
          install: "MCP-Server-Setup pro Tool oder Capability",
          auth: "Variiert je nach MCP-Server-Implementierung",
          tradeoff: "Protokoll-Standard für Agent-Tool-Kommunikation, aber jeder Server ist ein separater Prozess",
          bestFor: "Teams, die Agent-Produkte erweitern, die MCP nativ unterstützen (Claude Desktop, Cursor usw.)",
        };
      }

      return {
        approach: "Capability Runtime",
        what: "Eine Installation, ein Auth, jede Capability über eine konsistente, agent-native Schnittstelle",
        install: "Eine Skill-Datei + ein CLI-Binary",
        auth: "Ein Login deckt den gesamten Capability-Stack ab",
        tradeoff: "Agent-nativ und konsistent, aber Capabilities sind kuratiert statt offen",
        bestFor: "Teams, die multimodale Capabilities innerhalb von Agent-Workflows benötigen",
      };
    }),
    scopeHeading: "Welche Capabilities ein Runtime typischerweise umfasst",
    scopeIntro:
      "Ein Capability Runtime deckt Capabilities ab, die ausserhalb der eingebauten Reasoning Loop des Agenten liegen, aber in echten Workflows wiederholt benötigt werden. Ziel ist nicht, Reasoning zu ersetzen, sondern Nicht-Reasoning-Aktionen über eine stabile Ausführungsschicht verfügbar zu machen. In der Praxis gruppieren sich die meisten Runtime-Inventare natuerlich in vier Kategorien, sodass Teams über Abdeckung nachdenken, Lücken erkennen und Capability-Zugriff erweitern können, ohne ihr Orchestrierungsmodell bei jedem neuen Aufgabentyp neu zu entwerfen. Diese Kategorisierung macht auch Roadmap-Planung klarer, weil Teams nach Workflow-Impact statt nach Provider-Marketing priorisieren können. Sie hilft Produkt- und Engineering-Teams, sich darauf zu einigen, was als nächstes hinzugefuegt werden soll - basierend auf Ausführungsengpässen, nicht auf Hype-Zyklen. Mit wachsender Capability-Anzahl verhindert diese Struktur, dass Inventar-Wildwuchs die Agent-Zuverlässigkeit oder die teamübergreifende Adoption beeintraechtigt. Sie hält zudem Dokumentation und Implementierungssprache über Teams hinweg konsistent.",
    capabilityCategories: capabilityCategoriesDe,
    designHeading: "Zentrale Designprinzipien eines Capability Runtimes",
    designPrinciples: [
      {
        title: "Ein Installationspfad",
        body:
          "Agenten sollten nicht für jede Capability ein separates Paket entdecken, herunterladen und konfigurieren müssen. Ein Capability Runtime wird einmal installiert und stellt jede Capability über dasselbe Binary oder dieselbe Skill-Datei bereit.",
      },
      {
        title: "Ein Auth-Flow",
        body:
          "Authentifizierung sollte einmal stattfinden und für jede Capability gelten. Agenten sollten keine separaten API-Keys, OAuth-Tokens oder Billing-Konten pro Provider verwalten.",
      },
      {
        title: "Agent-native Schnittstelle",
        body:
          "Die Schnittstelle sollte zur Arbeitsweise der Agenten passen. Für terminal-native Agenten heißt das eine CLI. Für SDK-basierte Agenten kann es eine Library sein.",
      },
      {
        title: "Provider-Abstraktion",
        body:
          "Der Runtime abstrahiert Provider-Unterschiede weg. Wenn das Bildgenerierungs-Modell wechselt, bleibt das Aufrufmuster des Agenten gleich. Modellauswahl ist ein Parameter, keine Reintegration.",
      },
      {
        title: "Portabilitaet über Agenten hinweg",
        body:
          "Capabilities sollten mitgehen, wenn Teams den Agenten wechseln. Wenn ein Team von Claude Code zu Cursor oder Codex wechselt, sollte derselbe Capability Runtime weiter funktionieren, ohne Provider neu integrieren zu müssen.",
      },
    ],
    exampleHeading: "AnyCap als Capability Runtime",
    exampleBody: [
      "AnyCap ist ein agent-nativer Capability Runtime, von Tag eins für Agent-Workflows gebaut. Er setzt die obigen Designprinzipien um: eine Skill-Datei-Installation, ein CLI-Binary, ein Login und eine Kommando-Oberfläche für jede Capability.",
      "Heute bietet AnyCap Bildgenerierung, Videogenerierung, Musikgenerierung, Bildverständnis, Videoanalyse, Audio-Verständnis, Web Search, grounded Web Search, Web Crawl, Drive-Speicher und Page-Publishing. Es funktioniert über Skill-Dateien mit Claude Code, Cursor, Codex und anderen Agent-Produkten.",
    ],
    exampleCallout: "curl -fsSL https://anycap.ai/install.sh | sh && anycap login",
    examplePostscript:
      "Danach ist jede Capability über anycap <capability> <operation> in jedem unterstützten Agent-Produkt verfügbar.",
    faqHeading: "FAQ",
    faqItems: faqItemsDe as unknown as { question: string; answer: string }[],
    relatedHeading: "Verwandte Seiten",
    relatedPages: [
      {
        eyebrow: "Glossar",
        title: "Was ist Context Engineering?",
        href: "/glossary/context-engineering",
        summary: "Wie Agenten die Informationen verwalten, die sie dem Modell zur Inferenzzeit zuführen.",
      },
      {
        eyebrow: "Glossar",
        title: "Was ist ein Agent Harness?",
        href: "/glossary/agent-harness",
        summary: "Die Ausführungsschicht, die Tool-Routing, Berechtigungen und Agent-Lifecycle verwaltet.",
      },
      {
        eyebrow: "Guide",
        title: "Context Engineering für Agenten",
        href: "/guides/context-engineering-for-agents",
        summary: "Praktische Strategien zur Kuratierung des richtigen Kontexts in Agent-Workflows.",
      },
      {
        eyebrow: "Guide",
        title: "Agent Skills für Developer Tools",
        href: "/guides/agent-skills-for-developer-tools",
        summary: "Wie Skill-Dateien Agenten erlauben, Capabilities ohne manuelle Konfiguration zu entdecken und aufzurufen.",
      },
      {
        eyebrow: "Vergleich",
        title: "AnyCap vs Composio",
        href: "/compare/anycap-vs-composio",
        summary: "Wie sich ein Capability Runtime mit einer Tool-Integrationsplattform vergleicht.",
      },
      {
        eyebrow: "Vergleich",
        title: "AnyCap vs Replicate",
        href: "/compare/anycap-vs-replicate",
        summary: "Wie sich ein Capability Runtime mit einer Modell-Inferenz-Plattform vergleicht.",
      },
    ],
    ctas: {
      primary: "Capabilities ansehen",
      secondary: "CLI-Übersicht",
      tertiary: "Loslegen",
      github: "Auf GitHub ansehen",
    },
  },
};

export function getAgentCapabilityRuntimeMetadata(locale: SiteLocale): Metadata {
  const content = contentByLocale[locale] ?? contentByLocale.en;

  return buildMetadata(locale, content.metadata.title, content.metadata.description);
}

export function getAgentCapabilityRuntimePageData(locale: SiteLocale) {
  return contentByLocale[locale] ?? contentByLocale.en;
}
