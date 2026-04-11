import type { Metadata } from "next";
import type { CapabilityGapRow } from "@/components/landing/CapabilityGapTable";
import { createTechArticleJsonLd } from "@/lib/schema";
import { getLocaleConfig, siteConfig, type SiteLocale } from "@/lib/site";

export const CAPABILITIES_PATH = "/capabilities";

interface Capability {
  name: string;
  category: string;
  status: "available" | "coming_soon";
  description: string;
  models?: string;
  href: string | null;
}

interface RelatedCard {
  eyebrow: string;
  title: string;
  href: string;
  summary: string;
}

interface ModelGuideCard {
  eyebrow: string;
  title: string;
  href: string;
  body: string;
}

type CapabilitiesPageContent = {
  metadata: {
    title: string;
    description: string;
    openGraphTitle: string;
    openGraphDescription: string;
    articleHeadline: string;
    articleDescription: string;
    articleAbout: readonly string[];
    articleKeywords: readonly string[];
  };
  breadcrumbItems: readonly { name: string; href: string }[];
  heroEyebrow: string;
  heroTitleLine1: string;
  heroTitleLine2: string;
  heroParagraph: string;
  gapTable: {
    eyebrow: string;
    title: string;
    description: string;
    addWithAnycapLabel: string;
    footnote: string;
  };
  gapCellLabels: {
    builtIn: string;
    notBuiltIn: string;
    noUnifiedRuntime: string;
    noUnifiedAudioRuntime: string;
    available: string;
    externalTooling: string;
    noGroundedFlow: string;
    noReusableCrawlRuntime: string;
    noSharedAssetLayer: string;
    comingSoon: string;
  };
  capabilityNames: {
    imageGeneration: string;
    videoGeneration: string;
    musicGeneration: string;
    imageUnderstanding: string;
    videoAnalysis: string;
    audioUnderstanding: string;
    webSearch: string;
    groundedWebSearch: string;
    webCrawl: string;
    drive: string;
    speech: string;
  };
  capabilityDescriptions: {
    imageGeneration: string;
    videoGeneration: string;
    musicGeneration: string;
    imageUnderstanding: string;
    videoAnalysis: string;
    audioUnderstanding: string;
    webSearch: string;
    groundedWebSearch: string;
    webCrawl: string;
    drive: string;
    speech: string;
  };
  sectionTitles: {
    browseInventory: string;
    modelsBehind: string;
    relatedEntryPages: string;
    comingSoon: string;
    getStarted: string;
  };
  modelGuideCards: readonly ModelGuideCard[];
  relatedCards: readonly RelatedCard[];
  buttonLabels: {
    getStarted: string;
    whatAgentsCantDo: string;
    forClaudeCode: string;
  };
  itemListJsonLd: {
    name: string;
    description: string;
  };
};

const contentByLocale: Record<SiteLocale, CapabilitiesPageContent> = {
  en: {
    metadata: {
      title: "AI Agent Capabilities — Image, video, audio, web, storage, and publishing",
      description:
        "Browse the AI agent capability runtime that adds image, video, audio, web, storage, and publishing workflows through one install path, one auth flow, and one CLI.",
      openGraphTitle: "AI Agent Capabilities — Image, video, audio, web, storage, and publishing",
      openGraphDescription:
        "Start with the live capability inventory for coding agents, then expand into storage and publishing workflows through the same runtime.",
      articleHeadline: "AI Agent Capabilities — Image, video, audio, web, storage, and publishing",
      articleDescription:
        "Hub page for the live AnyCap capability inventory across media, web retrieval, storage, and publishing workflows.",
      articleAbout: ["AI agent capabilities", "Media generation", "Web retrieval", "Drive storage"],
      articleKeywords: [
        "ai agent capabilities",
        "image generation for ai agents",
        "video generation for ai agents",
        "audio understanding for ai agents",
        "web search api for ai agents",
        "web crawl for ai agents",
        "drive for ai agents",
        "page publishing for ai agents",
      ],
    },
    breadcrumbItems: [
      { name: "Home", href: "/" },
      { name: "Capabilities", href: "/capabilities" },
    ],
    heroEyebrow: "AI agent capabilities",
    heroTitleLine1: "Keep the agent you use.",
    heroTitleLine2: "Add the capabilities it lacks.",
    heroParagraph:
      "AnyCap is an AI agent capability runtime for coding agents. Start with the public capability inventory through one CLI, one auth flow, and one install path across Claude Code, Cursor, Codex, and the rest of your agent stack. The same runtime also extends into adjacent workflows as your workflows grow.",
    gapTable: {
      eyebrow: "Comparison",
      title: "What the common coding agents still miss",
      description:
        "This table shows the capability gap across the current agent ecosystem and the layer AnyCap adds on top.",
      addWithAnycapLabel: "Add with AnyCap",
      footnote:
        "This is the fastest way to show the narrative: keep the agent, add the missing capability layer.",
    },
    gapCellLabels: {
      builtIn: "Built in",
      notBuiltIn: "Not built in",
      noUnifiedRuntime: "No unified runtime",
      noUnifiedAudioRuntime: "No unified audio runtime",
      available: "Available",
      externalTooling: "External tooling",
      noGroundedFlow: "No grounded flow",
      noReusableCrawlRuntime: "No reusable crawl runtime",
      noSharedAssetLayer: "No shared asset layer",
      comingSoon: "Coming soon",
    },
    capabilityNames: {
      imageGeneration: "Image Generation",
      videoGeneration: "Video Generation",
      musicGeneration: "Music Generation",
      imageUnderstanding: "Image Understanding",
      videoAnalysis: "Video Analysis",
      audioUnderstanding: "Audio Understanding",
      webSearch: "Web Search",
      groundedWebSearch: "Grounded Web Search",
      webCrawl: "Web Crawl",
      drive: "Drive",
      speech: "Speech",
    },
    capabilityDescriptions: {
      imageGeneration:
        "Generate and edit images through Seedream 5, Seedream 4.5, Nano Banana Pro, and Nano Banana 2.",
      videoGeneration:
        "Generate videos from text prompts and images through Veo 3.1, Seedance 1.5 Pro, and Kling 3.0.",
      musicGeneration:
        "Generate music tracks and instrumental audio through one music runtime.",
      imageUnderstanding:
        "Analyze screenshots, diagrams, photos, and charts through one vision runtime.",
      videoAnalysis:
        "Inspect recordings and extract structured information from video content.",
      audioUnderstanding:
        "Transcribe and analyze meetings, podcasts, and voice clips through one runtime.",
      webSearch: "Search the web for structured results with optional full-page content.",
      groundedWebSearch:
        "Get synthesized answers with citations grounded in live web search.",
      webCrawl: "Convert web pages into clean Markdown for downstream agent workflows.",
      drive: "Store outputs, organize assets, and share public URLs through AnyCap Drive.",
      speech: "Text-to-speech and voice generation.",
    },
    sectionTitles: {
      browseInventory: "Browse the live capability inventory",
      modelsBehind: "Models behind the capabilities",
      relatedEntryPages: "Related entry pages",
      comingSoon: "Coming soon",
      getStarted: "Get Started",
    },
    modelGuideCards: [
      {
        eyebrow: "Hub",
        title: "Model Guide",
        href: "/models",
        body: "Browse the multimodal models available through AnyCap and map them to the right agent workflow.",
      },
      {
        eyebrow: "Guide",
        title: "Context Engineering for Agents",
        href: "/guides/context-engineering-for-agents",
        body: "Understand how agents decide when image, video, and analysis capabilities belong in the workflow.",
      },
    ],
    relatedCards: [
      {
        eyebrow: "Deficiency hub",
        title: "What agents can't do",
        href: "/learn/what-agents-cant-do",
        summary:
          "Start here if you are diagnosing the missing capability before choosing a specific page.",
      },
      {
        eyebrow: "Agent path",
        title: "For Claude Code",
        href: "/for/claude-code",
        summary:
          "Start here if Claude Code is your primary agent and you want the ecosystem-specific install path.",
      },
      {
        eyebrow: "Install path",
        title: "Get Started",
        href: "/start",
        summary:
          "Start here if you want the shortest path from zero setup to first capability call.",
      },
    ],
    buttonLabels: {
      getStarted: "Get Started",
      whatAgentsCantDo: "What agents can\u2019t do",
      forClaudeCode: "For Claude Code",
    },
    itemListJsonLd: {
      name: "AnyCap Capabilities",
      description:
        "Capability hub for the live AnyCap inventory across media, web retrieval, storage, and publishing workflows.",
    },
  },
  "pt-br": {
    metadata: {
      title: "Capacidades para agentes de IA — Imagem, vídeo, áudio, web, armazenamento e publicação",
      description:
        "Navegue pelo runtime de capacidades para agentes de IA que adiciona fluxos de imagem, vídeo, áudio, web, armazenamento e publicação em um único caminho de instalação, um fluxo de autenticação e uma CLI.",
      openGraphTitle: "Capacidades para agentes de IA — Imagem, vídeo, áudio, web, armazenamento e publicação",
      openGraphDescription:
        "Comece com o inventário de capacidades disponíveis para agentes de código e expanda para fluxos de armazenamento e publicação pelo mesmo runtime.",
      articleHeadline: "Capacidades para agentes de IA — Imagem, vídeo, áudio, web, armazenamento e publicação",
      articleDescription:
        "Página hub do inventário de capacidades do AnyCap para mídia, busca na web, armazenamento e fluxos de publicação.",
      articleAbout: ["Capacidades para agentes de IA", "Geração de mídia", "Busca na web", "Armazenamento Drive"],
      articleKeywords: [
        "capacidades para agentes de ia",
        "geração de imagem para agentes de ia",
        "geração de vídeo para agentes de ia",
        "compreensão de áudio para agentes de ia",
        "api de busca na web para agentes de ia",
        "crawl na web para agentes de ia",
        "drive para agentes de ia",
        "publicação para agentes de ia",
      ],
    },
    breadcrumbItems: [
      { name: "Início", href: "/" },
      { name: "Capacidades", href: "/capabilities" },
    ],
    heroEyebrow: "Capacidades para agentes de IA",
    heroTitleLine1: "Mantenha o agente que você usa.",
    heroTitleLine2: "Adicione as capacidades que faltam.",
    heroParagraph:
      "O AnyCap é um runtime de capacidades para agentes de IA voltados a código. Comece com o inventário público de capacidades em uma única CLI, um fluxo de autenticação e um caminho de instalação para Claude Code, Cursor, Codex e o restante da sua stack de agentes. O mesmo runtime também se estende para fluxos adjacentes conforme seus fluxos de trabalho crescem.",
    gapTable: {
      eyebrow: "Comparação",
      title: "O que os agentes de código mais usados ainda não têm",
      description:
        "Esta tabela mostra a lacuna de capacidades no ecossistema atual de agentes e a camada que o AnyCap adiciona por cima.",
      addWithAnycapLabel: "Adicionar com AnyCap",
      footnote:
        "Essa é a forma mais rápida de mostrar a narrativa: mantenha o agente, adicione a camada de capacidade que falta.",
    },
    gapCellLabels: {
      builtIn: "Integrado",
      notBuiltIn: "Não integrado",
      noUnifiedRuntime: "Sem runtime unificado",
      noUnifiedAudioRuntime: "Sem runtime de áudio unificado",
      available: "Disponível",
      externalTooling: "Ferramenta externa",
      noGroundedFlow: "Sem fluxo fundamentado",
      noReusableCrawlRuntime: "Sem runtime de crawl reutilizável",
      noSharedAssetLayer: "Sem camada de ativos compartilhada",
      comingSoon: "Em breve",
    },
    capabilityNames: {
      imageGeneration: "Geração de imagem",
      videoGeneration: "Geração de vídeo",
      musicGeneration: "Geração de música",
      imageUnderstanding: "Compreensão de imagem",
      videoAnalysis: "Análise de vídeo",
      audioUnderstanding: "Compreensão de áudio",
      webSearch: "Busca na web",
      groundedWebSearch: "Busca na web fundamentada",
      webCrawl: "Crawl na web",
      drive: "Drive",
      speech: "Fala",
    },
    capabilityDescriptions: {
      imageGeneration:
        "Gere e edite imagens por meio do Seedream 5, Seedream 4.5, Nano Banana Pro e Nano Banana 2.",
      videoGeneration:
        "Gere vídeos a partir de prompts de texto e imagens por meio do Veo 3.1, Seedance 1.5 Pro e Kling 3.0.",
      musicGeneration:
        "Gere faixas musicais e áudio instrumental em um único runtime de música.",
      imageUnderstanding:
        "Analise screenshots, diagramas, fotos e gráficos em um único runtime de visão.",
      videoAnalysis:
        "Inspecione gravações e extraia informações estruturadas de conteúdo em vídeo.",
      audioUnderstanding:
        "Transcreva e analise reuniões, podcasts e clipes de voz em um único runtime.",
      webSearch: "Busque na web por resultados estruturados com conteúdo opcional de página completa.",
      groundedWebSearch:
        "Obtenha respostas sintetizadas com citações fundamentadas em busca na web em tempo real.",
      webCrawl: "Converta páginas web em Markdown limpo para fluxos de agentes downstream.",
      drive: "Armazene saídas, organize ativos e compartilhe URLs públicas pelo AnyCap Drive.",
      speech: "Conversão de texto em fala e geração de voz.",
    },
    sectionTitles: {
      browseInventory: "Navegue pelo inventário de capacidades disponíveis",
      modelsBehind: "Modelos por trás das capacidades",
      relatedEntryPages: "Páginas de entrada relacionadas",
      comingSoon: "Em breve",
      getStarted: "Comece agora",
    },
    modelGuideCards: [
      {
        eyebrow: "Hub",
        title: "Guia de modelos",
        href: "/models",
        body: "Navegue pelos modelos multimodais disponíveis no AnyCap e mapeie-os para o fluxo de agente certo.",
      },
      {
        eyebrow: "Guia",
        title: "Engenharia de contexto para agentes",
        href: "/guides/context-engineering-for-agents",
        body: "Entenda como os agentes decidem quando as capacidades de imagem, vídeo e análise devem fazer parte do fluxo.",
      },
    ],
    relatedCards: [
      {
        eyebrow: "Hub de deficiências",
        title: "O que os agentes não conseguem fazer",
        href: "/learn/what-agents-cant-do",
        summary:
          "Comece aqui se você está diagnosticando a capacidade ausente antes de escolher uma página específica.",
      },
      {
        eyebrow: "Caminho do agente",
        title: "Para Claude Code",
        href: "/for/claude-code",
        summary:
          "Comece aqui se o Claude Code é o seu agente principal e você quer o caminho de instalação específico do ecossistema.",
      },
      {
        eyebrow: "Caminho de instalação",
        title: "Comece agora",
        href: "/start",
        summary:
          "Comece aqui se você quer o caminho mais curto do zero à primeira chamada de capacidade.",
      },
    ],
    buttonLabels: {
      getStarted: "Comece agora",
      whatAgentsCantDo: "O que os agentes não conseguem fazer",
      forClaudeCode: "Para Claude Code",
    },
    itemListJsonLd: {
      name: "Capacidades AnyCap",
      description:
        "Hub de capacidades do inventário AnyCap para mídia, busca na web, armazenamento e fluxos de publicação.",
    },
  },
  id: {
    metadata: {
      title: "AI Agent Capabilities — Image, video, audio, web, storage, and publishing",
      description:
        "Browse the AI agent capability runtime that adds image, video, audio, web, storage, and publishing workflows through one install path, one auth flow, and one CLI.",
      openGraphTitle: "AI Agent Capabilities — Image, video, audio, web, storage, and publishing",
      openGraphDescription:
        "Start with the live capability inventory for coding agents, then expand into storage and publishing workflows through the same runtime.",
      articleHeadline: "AI Agent Capabilities — Image, video, audio, web, storage, and publishing",
      articleDescription:
        "Hub page for the live AnyCap capability inventory across media, web retrieval, storage, and publishing workflows.",
      articleAbout: ["AI agent capabilities", "Media generation", "Web retrieval", "Drive storage"],
      articleKeywords: [
        "ai agent capabilities",
        "image generation for ai agents",
        "video generation for ai agents",
        "audio understanding for ai agents",
        "web search api for ai agents",
        "web crawl for ai agents",
        "drive for ai agents",
        "page publishing for ai agents",
      ],
    },
    breadcrumbItems: [
      { name: "Home", href: "/" },
      { name: "Capabilities", href: "/capabilities" },
    ],
    heroEyebrow: "AI agent capabilities",
    heroTitleLine1: "Keep the agent you use.",
    heroTitleLine2: "Add the capabilities it lacks.",
    heroParagraph:
      "AnyCap is an AI agent capability runtime for coding agents. Start with the public capability inventory through one CLI, one auth flow, and one install path across Claude Code, Cursor, Codex, and the rest of your agent stack. The same runtime also extends into adjacent workflows as your workflows grow.",
    gapTable: {
      eyebrow: "Comparison",
      title: "What the common coding agents still miss",
      description:
        "This table shows the capability gap across the current agent ecosystem and the layer AnyCap adds on top.",
      addWithAnycapLabel: "Add with AnyCap",
      footnote:
        "This is the fastest way to show the narrative: keep the agent, add the missing capability layer.",
    },
    gapCellLabels: {
      builtIn: "Built in",
      notBuiltIn: "Not built in",
      noUnifiedRuntime: "No unified runtime",
      noUnifiedAudioRuntime: "No unified audio runtime",
      available: "Available",
      externalTooling: "External tooling",
      noGroundedFlow: "No grounded flow",
      noReusableCrawlRuntime: "No reusable crawl runtime",
      noSharedAssetLayer: "No shared asset layer",
      comingSoon: "Coming soon",
    },
    capabilityNames: {
      imageGeneration: "Image Generation",
      videoGeneration: "Video Generation",
      musicGeneration: "Music Generation",
      imageUnderstanding: "Image Understanding",
      videoAnalysis: "Video Analysis",
      audioUnderstanding: "Audio Understanding",
      webSearch: "Web Search",
      groundedWebSearch: "Grounded Web Search",
      webCrawl: "Web Crawl",
      drive: "Drive",
      speech: "Speech",
    },
    capabilityDescriptions: {
      imageGeneration:
        "Generate and edit images through Seedream 5, Seedream 4.5, Nano Banana Pro, and Nano Banana 2.",
      videoGeneration:
        "Generate videos from text prompts and images through Veo 3.1, Seedance 1.5 Pro, and Kling 3.0.",
      musicGeneration:
        "Generate music tracks and instrumental audio through one music runtime.",
      imageUnderstanding:
        "Analyze screenshots, diagrams, photos, and charts through one vision runtime.",
      videoAnalysis:
        "Inspect recordings and extract structured information from video content.",
      audioUnderstanding:
        "Transcribe and analyze meetings, podcasts, and voice clips through one runtime.",
      webSearch: "Search the web for structured results with optional full-page content.",
      groundedWebSearch:
        "Get synthesized answers with citations grounded in live web search.",
      webCrawl: "Convert web pages into clean Markdown for downstream agent workflows.",
      drive: "Store outputs, organize assets, and share public URLs through AnyCap Drive.",
      speech: "Text-to-speech and voice generation.",
    },
    sectionTitles: {
      browseInventory: "Browse the live capability inventory",
      modelsBehind: "Models behind the capabilities",
      relatedEntryPages: "Related entry pages",
      comingSoon: "Coming soon",
      getStarted: "Get Started",
    },
    modelGuideCards: [
      {
        eyebrow: "Hub",
        title: "Model Guide",
        href: "/models",
        body: "Browse the multimodal models available through AnyCap and map them to the right agent workflow.",
      },
      {
        eyebrow: "Guide",
        title: "Context Engineering for Agents",
        href: "/guides/context-engineering-for-agents",
        body: "Understand how agents decide when image, video, and analysis capabilities belong in the workflow.",
      },
    ],
    relatedCards: [
      {
        eyebrow: "Deficiency hub",
        title: "What agents can't do",
        href: "/learn/what-agents-cant-do",
        summary:
          "Start here if you are diagnosing the missing capability before choosing a specific page.",
      },
      {
        eyebrow: "Agent path",
        title: "For Claude Code",
        href: "/for/claude-code",
        summary:
          "Start here if Claude Code is your primary agent and you want the ecosystem-specific install path.",
      },
      {
        eyebrow: "Install path",
        title: "Get Started",
        href: "/start",
        summary:
          "Start here if you want the shortest path from zero setup to first capability call.",
      },
    ],
    buttonLabels: {
      getStarted: "Get Started",
      whatAgentsCantDo: "What agents can\u2019t do",
      forClaudeCode: "For Claude Code",
    },
    itemListJsonLd: {
      name: "AnyCap Capabilities",
      description:
        "Capability hub for the live AnyCap inventory across media, web retrieval, storage, and publishing workflows.",
    },
  },
};

function buildCapabilities(content: CapabilitiesPageContent): Capability[] {
  const n = content.capabilityNames;
  const d = content.capabilityDescriptions;
  return [
    { name: n.imageGeneration, category: "Image", status: "available", description: d.imageGeneration, models: "Seedream 5, Seedream 4.5, Nano Banana Pro, Nano Banana 2", href: "/capabilities/image-generation" },
    { name: n.videoGeneration, category: "Video", status: "available", description: d.videoGeneration, models: "Veo 3.1, Seedance 1.5 Pro, Kling 3.0", href: "/capabilities/video-generation" },
    { name: n.musicGeneration, category: "Audio", status: "available", description: d.musicGeneration, models: "ElevenLabs Music", href: "/capabilities/music-generation" },
    { name: n.imageUnderstanding, category: "Vision", status: "available", description: d.imageUnderstanding, models: "Vision models", href: "/capabilities/image-understanding" },
    { name: n.videoAnalysis, category: "Video", status: "available", description: d.videoAnalysis, models: "Vision models", href: "/capabilities/video-analysis" },
    { name: n.audioUnderstanding, category: "Audio", status: "available", description: d.audioUnderstanding, models: "Audio models", href: "/capabilities/audio-understanding" },
    { name: n.webSearch, category: "Web", status: "available", description: d.webSearch, href: "/capabilities/web-search" },
    { name: n.groundedWebSearch, category: "Web", status: "available", description: d.groundedWebSearch, href: "/capabilities/grounded-web-search" },
    { name: n.webCrawl, category: "Web", status: "available", description: d.webCrawl, href: "/capabilities/web-crawl" },
    { name: n.drive, category: "Storage", status: "available", description: d.drive, href: "/capabilities/drive" },
    { name: n.speech, category: "Audio", status: "coming_soon", description: d.speech, href: null },
  ];
}

function buildGapRows(content: CapabilitiesPageContent): CapabilityGapRow[] {
  const c = content.gapCellLabels;
  const n = content.capabilityNames;
  return [
    {
      capability: "Code generation",
      cells: [c.builtIn, c.builtIn, c.builtIn, { label: c.builtIn, tone: "accent" }],
    },
    {
      capability: n.imageGeneration.toLowerCase(),
      cells: [
        { label: c.notBuiltIn, tone: "muted" },
        { label: c.notBuiltIn, tone: "muted" },
        { label: c.notBuiltIn, tone: "muted" },
        { label: c.available, tone: "accent" },
      ],
    },
    {
      capability: n.videoGeneration.toLowerCase(),
      cells: [
        { label: c.notBuiltIn, tone: "muted" },
        { label: c.notBuiltIn, tone: "muted" },
        { label: c.notBuiltIn, tone: "muted" },
        { label: c.available, tone: "accent" },
      ],
    },
    {
      capability: n.musicGeneration.toLowerCase(),
      cells: [
        { label: c.notBuiltIn, tone: "muted" },
        { label: c.notBuiltIn, tone: "muted" },
        { label: c.notBuiltIn, tone: "muted" },
        { label: c.available, tone: "accent" },
      ],
    },
    {
      capability: n.imageUnderstanding.toLowerCase(),
      cells: [
        { label: c.noUnifiedRuntime, tone: "muted" },
        { label: c.noUnifiedRuntime, tone: "muted" },
        { label: c.noUnifiedRuntime, tone: "muted" },
        { label: c.available, tone: "accent" },
      ],
    },
    {
      capability: n.videoAnalysis.toLowerCase(),
      cells: [
        { label: c.noUnifiedRuntime, tone: "muted" },
        { label: c.noUnifiedRuntime, tone: "muted" },
        { label: c.noUnifiedRuntime, tone: "muted" },
        { label: c.available, tone: "accent" },
      ],
    },
    {
      capability: n.audioUnderstanding.toLowerCase(),
      cells: [
        { label: c.noUnifiedAudioRuntime, tone: "muted" },
        { label: c.noUnifiedAudioRuntime, tone: "muted" },
        { label: c.noUnifiedAudioRuntime, tone: "muted" },
        { label: c.available, tone: "accent" },
      ],
    },
    {
      capability: n.webSearch.toLowerCase(),
      cells: [
        { label: c.externalTooling, tone: "muted" },
        { label: c.externalTooling, tone: "muted" },
        { label: c.externalTooling, tone: "muted" },
        { label: c.available, tone: "accent" },
      ],
    },
    {
      capability: n.groundedWebSearch.toLowerCase(),
      cells: [
        { label: c.noGroundedFlow, tone: "muted" },
        { label: c.noGroundedFlow, tone: "muted" },
        { label: c.noGroundedFlow, tone: "muted" },
        { label: c.available, tone: "accent" },
      ],
    },
    {
      capability: n.webCrawl.toLowerCase(),
      cells: [
        { label: c.noReusableCrawlRuntime, tone: "muted" },
        { label: c.noReusableCrawlRuntime, tone: "muted" },
        { label: c.noReusableCrawlRuntime, tone: "muted" },
        { label: c.available, tone: "accent" },
      ],
    },
    {
      capability: "Drive storage",
      cells: [
        { label: c.noSharedAssetLayer, tone: "muted" },
        { label: c.noSharedAssetLayer, tone: "muted" },
        { label: c.noSharedAssetLayer, tone: "muted" },
        { label: c.available, tone: "accent" },
      ],
    },
    {
      capability: n.speech,
      cells: [
        { label: c.notBuiltIn, tone: "muted" },
        { label: c.notBuiltIn, tone: "muted" },
        { label: c.notBuiltIn, tone: "muted" },
        { label: c.comingSoon, tone: "accent" },
      ],
    },
  ];
}

export function getCapabilitiesMetadata(locale: SiteLocale): Metadata {
  const content = contentByLocale[locale] ?? contentByLocale.en;

  return {
    title: content.metadata.title,
    description: content.metadata.description,
    openGraph: {
      type: "website",
      locale: getLocaleConfig(locale).ogLocale,
      url: CAPABILITIES_PATH,
      siteName: siteConfig.siteName,
      title: content.metadata.openGraphTitle,
      description: content.metadata.openGraphDescription,
    },
  };
}

export function getCapabilitiesPageData(locale: SiteLocale) {
  const content = contentByLocale[locale] ?? contentByLocale.en;
  const capabilities = buildCapabilities(content);
  const gapRows = buildGapRows(content);

  const hubArticleJsonLd = createTechArticleJsonLd({
    headline: content.metadata.articleHeadline,
    description: content.metadata.articleDescription,
    path: CAPABILITIES_PATH,
    locale,
    about: [...content.metadata.articleAbout],
    keywords: [...content.metadata.articleKeywords],
  });

  const availableCapabilities = capabilities.filter((cap) => cap.status === "available");

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: content.itemListJsonLd.name,
    description: content.itemListJsonLd.description,
    numberOfItems: availableCapabilities.length,
    itemListElement: availableCapabilities.map((cap, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: cap.name,
      description: cap.description,
      ...(cap.href ? { url: `${siteConfig.url}${cap.href}` } : {}),
    })),
  };

  return {
    ...content,
    capabilities,
    gapRows,
    hubArticleJsonLd,
    itemListJsonLd,
  };
}
