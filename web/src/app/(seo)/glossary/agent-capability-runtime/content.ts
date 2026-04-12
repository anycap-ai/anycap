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
      title: "What is an Agent Capability Runtime? Definition, Architecture, and Why It Matters",
      description:
        "An agent capability runtime is a software layer that gives AI agents installable capabilities through one interface, one auth flow, and one install path. Learn how it differs from agent frameworks, tool platforms, and direct API integrations.",
      openGraphTitle: "What is an Agent Capability Runtime? Definition, Architecture, and Why It Matters",
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
      "An agent capability runtime is a software layer that gives AI agents installable capabilities through a single interface. Instead of requiring separate SDKs, authentication flows, and APIs for each capability, a capability runtime provides one install path, one auth flow, and one command surface for everything the agent needs beyond its built-in reasoning loop.",
      "The term describes a specific architectural layer in the agent stack. An agent handles reasoning, planning, and code execution. A harness manages the agent lifecycle. A capability runtime sits below both and supplies the actual capabilities: generation, understanding, retrieval, storage, and publishing.",
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
      "An agent stack has multiple layers. Each layer has a distinct responsibility. A capability runtime occupies the layer between the harness and the model/provider APIs. It unifies capabilities that would otherwise be scattered across providers.",
    architectureTable: baseArchitectureRows,
    architectureClosing:
      "The key insight is that capabilities are not the same as the agent, and they are not the same as the model API. A capability runtime is a dedicated layer that bridges the gap between what the agent can do natively and what the workflow actually requires.",
    motivationHeading: "The problem a capability runtime solves",
    motivationIntro:
      "Without a capability runtime, adding each new capability to an agent workflow means a separate integration. The table below shows what changes when a runtime absorbs that integration work.",
    problemSignals: problemSignalsEn,
    comparisonHeading: "How it differs from other approaches",
    comparisonIntro:
      "A capability runtime is not the only way to give agents new abilities. Each approach below solves a different slice of the problem. The right choice depends on how many capabilities the workflow needs, how many providers it spans, and how much integration overhead the team can absorb.",
    approachComparisons: baseApproachComparisons,
    scopeHeading: "What capabilities a runtime typically includes",
    scopeIntro:
      "A capability runtime covers capabilities that sit outside the agent's built-in reasoning loop but are frequently needed inside agent workflows. These typically fall into four categories.",
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
      title: "O que é um runtime de capacidade do agente? Definição, arquitetura e por que isso importa",
      description:
        "Um runtime de capacidade do agente é uma camada de software que dá aos agentes de IA capacidades instaláveis por meio de uma interface única, um fluxo único de autenticação e um único caminho de instalação. Veja como ele difere de frameworks de agentes, plataformas de ferramentas e integrações diretas com APIs.",
      openGraphTitle: "O que é um runtime de capacidade do agente? Definição, arquitetura e por que isso importa",
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
      "Um runtime de capacidade do agente é uma camada de software que dá aos agentes de IA capacidades instaláveis por meio de uma interface única. Em vez de exigir SDKs, fluxos de autenticação e APIs separados para cada capacidade, o runtime oferece um caminho de instalação, um fluxo de autenticação e uma superfície de comandos para tudo o que o agente precisa além do seu loop de raciocínio nativo.",
      "O termo descreve uma camada arquitetural específica na stack de agentes. Um agente lida com raciocínio, planejamento e execução de código. Um harness gerencia o ciclo de vida do agente. Um runtime de capacidades fica abaixo dos dois e fornece as capacidades reais: geração, entendimento, recuperação, armazenamento e publicação.",
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
      "Uma stack de agentes tem várias camadas. Cada camada tem uma responsabilidade distinta. Um runtime de capacidades ocupa a camada entre o harness e as APIs do modelo/provedor. Ele unifica capacidades que, de outra forma, ficariam espalhadas por vários provedores.",
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
      "Um runtime de capacidades não é a única forma de dar novas habilidades aos agentes. Cada abordagem abaixo resolve uma fatia diferente do problema. A escolha certa depende de quantas capacidades o fluxo precisa, quantos provedores ele atravessa e quanto overhead de integração o time consegue absorver.",
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
      "Um runtime de capacidades cobre capacidades que ficam fora do loop de raciocínio nativo do agente, mas que são frequentemente necessárias em fluxos com agentes. Normalmente elas se dividem em quatro categorias.",
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
};

export function getAgentCapabilityRuntimeMetadata(locale: SiteLocale): Metadata {
  const content = contentByLocale[locale] ?? contentByLocale.en;

  return buildMetadata(locale, content.metadata.title, content.metadata.description);
}

export function getAgentCapabilityRuntimePageData(locale: SiteLocale) {
  return contentByLocale[locale] ?? contentByLocale.en;
}
