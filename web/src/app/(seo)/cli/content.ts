import type { Metadata } from "next";
import { getLocaleConfig, getLocalizedRouteUrl, siteConfig, type SiteLocale } from "@/lib/site";

export const CLI_PATH = "/cli";

const githubHref = "https://github.com/anycap-ai/anycap";

type CliPageData = {
  metadata: {
    title: string;
    description: string;
    openGraphTitle: string;
    openGraphDescription: string;
  };
  eyebrow: string;
  heroTitle: [string, string];
  heroIntro: string;
  heroTagline: string;
  overviewTitle: string;
  overviewParagraphs: string[];
  installTitle: string;
  installIntro: string;
  commandsTitle: string;
  capabilities: { name: string; command: string; description: string; href: string; status: string }[];
  capabilitiesCta: string;
  reasonsTitle: string;
  reasons: { title: string; description: string }[];
  ecosystemsLabel: string;
  ecosystems: { name: string; href: string | null }[];
  stackTitle: string;
  nextPages: { eyebrow: string; title: string; href: string; summary: string }[];
  ctas: { label: string; href?: string; external?: string }[];
  pageJsonLd: Record<string, unknown>;
};

const capabilities = [
  {
    command: "anycap image generate",
    href: "/capabilities/image-generation",
  },
  {
    command: "anycap video generate",
    href: "/capabilities/video-generation",
  },
  {
    command: "anycap actions image-read",
    href: "/capabilities/image-understanding",
  },
  {
    command: "anycap actions video-read",
    href: "/capabilities/video-analysis",
  },
] as const;

const ecosystems = [
  { name: "Claude Code", href: "/for/claude-code" },
  { name: "Cursor", href: "/for/cursor" },
  { name: "Codex", href: "/for/codex" },
  { name: "OpenCode", href: null },
  { name: "OpenClaw", href: null },
] as const;

function buildCliPageJsonLd(locale: SiteLocale, name: string, description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name,
    url: getLocalizedRouteUrl(locale, CLI_PATH),
    description,
    isPartOf: {
      "@id": `${siteConfig.url}#website`,
    },
    about: [
      { "@type": "Thing", name: "AI agents" },
      { "@type": "Thing", name: "CLI tools" },
      { "@type": "Thing", name: "Agent capabilities" },
      { "@type": "Thing", name: "Developer tools" },
    ],
    publisher: {
      "@id": `${siteConfig.url}#organization`,
    },
    mainEntity: {
      "@type": "SoftwareSourceCode",
      name: locale === "pt-br" ? "CLI do AnyCap" : "AnyCap CLI",
      codeRepository: githubHref,
      programmingLanguage: "TypeScript",
      runtimePlatform: "macOS, Linux, Windows",
    },
  };
}

const contentByLocale: Record<SiteLocale, CliPageData> = {
  en: {
    metadata: {
      title: "AnyCap CLI | AI agent capability runtime",
      description:
        "Your agent can plan the work, but it still needs a command surface for image generation, video generation, image understanding, video analysis, search, and publishing. AnyCap CLI gives that capability layer one install path, one auth flow, and one interface.",
      openGraphTitle: "AnyCap CLI | AI agent capability runtime",
      openGraphDescription:
        "One CLI for image, video, vision, search, and publishing workflows across Claude Code, Cursor, Codex, and similar agent environments.",
    },
    eyebrow: "CLI",
    heroTitle: ["One CLI for the capabilities", "your agent still needs."],
    heroIntro:
      "The agent can plan the workflow. The missing layer is usually execution: one command surface for image generation, video generation, image understanding, and video analysis. AnyCap CLI gives that layer one install path, one auth flow, and one interface across Claude Code, Cursor, Codex, and similar agent products.",
    heroTagline: "Don't switch agents. Add capabilities immediately.",
    overviewTitle: "Why the CLI matters beyond installation",
    overviewParagraphs: [
      "A unified CLI matters because it turns capability access into a stable operational surface. Instead of every workflow introducing a new provider SDK, dashboard, or auth pattern, the agent can reuse one predictable command layer across media, search, storage, and analysis tasks.",
      "That also makes documentation and routing easier. Once the agent understands the CLI surface, pages across the site can focus on fit and workflow design instead of re-explaining a different execution model for every capability.",
    ],
    installTitle: "Install once",
    installIntro:
      "CLI installation will be available when AnyCap launches publicly. The install path below is the stable entry to the runtime.",
    commandsTitle: "The first commands most agents need",
    capabilities: [
      {
        name: "Image Generation",
        description: "Generate and edit visuals with Seedream 5, Nano Banana Pro, and more.",
        status: "Available",
        ...capabilities[0],
      },
      {
        name: "Video Generation",
        description: "Generate walkthroughs, clips, and motion output with Veo 3.1.",
        status: "Available",
        ...capabilities[1],
      },
      {
        name: "Image Understanding",
        description: "Analyze screenshots, diagrams, OCR, and visual references through one runtime.",
        status: "Available",
        ...capabilities[2],
      },
      {
        name: "Video Analysis",
        description: "Inspect recordings, summarize scenes, and extract structured video intelligence.",
        status: "Available",
        ...capabilities[3],
      },
    ],
    capabilitiesCta: "View any capability →",
    reasonsTitle: "Why one CLI matters",
    reasons: [
      {
        title: "Keep the command surface stable",
        description:
          "Without a unified CLI, every new capability becomes a new SDK, dashboard, or shell script. AnyCap keeps the execution layer consistent.",
      },
      {
        title: "Log in once",
        description:
          "Authentication happens once and carries across image, video, and vision workflows instead of fragmenting across providers.",
      },
      {
        title: "Move across agents without re-learning the runtime",
        description:
          "The same commands can sit under Claude Code, Cursor, Codex, and similar agent environments without forcing a new mental model each time.",
      },
    ],
    ecosystemsLabel: "Available across agent products",
    ecosystems: [...ecosystems],
    stackTitle: "Understand the rest of the stack",
    nextPages: [
      {
        eyebrow: "Capabilities",
        title: "Image Generation",
        href: "/capabilities/image-generation",
        summary: "Go deeper on text-to-image, image editing, supported models, and the real CLI workflow.",
      },
      {
        eyebrow: "Capabilities",
        title: "Video Generation",
        href: "/capabilities/video-generation",
        summary: "See how text-to-video and image-to-video fit into the same agent command surface.",
      },
      {
        eyebrow: "Learn",
        title: "What agents can't do",
        href: "/learn/what-agents-cant-do",
        summary: "Start here if you want the deficiency-first narrative and the shortest page for each missing capability.",
      },
      {
        eyebrow: "Learn",
        title: "How skills fit",
        href: "/skills",
        summary: "Use this when you want to understand how the instruction layer connects the agent to the CLI and runtime.",
      },
      {
        eyebrow: "Guides",
        title: "MCP vs Skills",
        href: "/guides/mcp-vs-skills",
        summary: "Use this when you want to separate the protocol layer from the instruction layer before you wire in AnyCap.",
      },
      {
        eyebrow: "Guides",
        title: "Context Engineering",
        href: "/guides/context-engineering-for-agents",
        summary: "Use this when you want to understand when the agent should call a capability instead of staying inside the prompt.",
      },
    ],
    ctas: [
      { label: "View on GitHub", external: githubHref },
      { label: "Get Started", href: "/start" },
      { label: "See Capability Gaps", href: "/learn/what-agents-cant-do" },
      { label: "For Claude Code", href: "/for/claude-code" },
    ],
    pageJsonLd: buildCliPageJsonLd(
      "en",
      "AnyCap CLI | AI agent capability runtime",
      "Agent-native CLI that gives AI agents one install path and one interface for capabilities like image generation, video generation, image understanding, and video analysis.",
    ),
  },
  "pt-br": {
    metadata: {
      title: "CLI do AnyCap | Runtime de capacidades para agentes de IA",
      description:
        "Seu agente pode planejar o trabalho, mas ainda precisa de uma superfície de comandos para geração de imagem, geração de vídeo, entendimento de imagem, análise de vídeo, busca e publicação. A CLI do AnyCap dá a essa camada um único caminho de instalação, um único fluxo de autenticação e uma única interface.",
      openGraphTitle: "CLI do AnyCap | Runtime de capacidades para agentes de IA",
      openGraphDescription:
        "Uma única CLI para fluxos de imagem, vídeo, visão, busca e publicação em Claude Code, Cursor, Codex e ambientes de agentes semelhantes.",
    },
    eyebrow: "CLI",
    heroTitle: ["Uma CLI para as capacidades", "que seu agente ainda precisa."],
    heroIntro:
      "O agente consegue planejar o fluxo. A camada que costuma faltar é a execução: uma única superfície de comandos para geração de imagem, geração de vídeo, entendimento de imagem e análise de vídeo. A CLI do AnyCap dá a essa camada um único caminho de instalação, um único fluxo de autenticação e uma única interface em Claude Code, Cursor, Codex e produtos de agentes semelhantes.",
    heroTagline: "Não troque de agente. Adicione capacidades imediatamente.",
    overviewTitle: "Por que a CLI importa além da instalação",
    overviewParagraphs: [
      "Uma CLI unificada importa porque transforma o acesso a capabilities em uma superfície operacional estável. Em vez de cada workflow introduzir um novo SDK de provedor, dashboard ou padrão de autenticação, o agente pode reutilizar uma única camada de comandos em tarefas de mídia, busca, armazenamento e análise.",
      "Isso também facilita documentação e roteamento. Quando o agente entende a superfície da CLI, as páginas do site podem focar em encaixe e desenho de workflow em vez de reexplicar um modelo de execução diferente para cada capability.",
    ],
    installTitle: "Instale uma vez",
    installIntro:
      "A instalação da CLI estará disponível quando o AnyCap for lançado publicamente. O caminho abaixo é a entrada estável para o runtime.",
    commandsTitle: "Os primeiros comandos de que a maioria dos agentes precisa",
    capabilities: [
      {
        ...capabilities[0],
        name: "Geração de Imagem",
        description: "Gere e edite visuais com Seedream 5, Nano Banana Pro e outros modelos.",
        status: "Disponível",
      },
      {
        ...capabilities[1],
        name: "Geração de Vídeo",
        description: "Gere walkthroughs, clipes e saídas em movimento com Veo 3.1.",
        status: "Disponível",
      },
      {
        ...capabilities[2],
        name: "Entendimento de Imagem",
        description: "Analise screenshots, diagramas, OCR e referências visuais através de um único runtime.",
        status: "Disponível",
      },
      {
        ...capabilities[3],
        name: "Análise de Vídeo",
        description: "Inspecione gravações, resuma cenas e extraia inteligência estruturada de vídeo.",
        status: "Disponível",
      },
    ],
    capabilitiesCta: "Ver qualquer capacidade →",
    reasonsTitle: "Por que uma única CLI importa",
    reasons: [
      {
        title: "Mantenha a superfície de comandos estável",
        description:
          "Sem uma CLI unificada, cada nova capacidade vira um novo SDK, dashboard ou script. O AnyCap mantém a camada de execução consistente.",
      },
      {
        title: "Faça login uma vez",
        description:
          "A autenticação acontece uma vez e vale para fluxos de imagem, vídeo e visão em vez de se fragmentar entre provedores.",
      },
      {
        title: "Mude de agente sem reaprender o runtime",
        description:
          "Os mesmos comandos podem ficar por baixo de Claude Code, Cursor, Codex e ambientes semelhantes sem exigir um novo modelo mental toda vez.",
      },
    ],
    ecosystemsLabel: "Disponível em produtos de agentes",
    ecosystems: [...ecosystems],
    stackTitle: "Entenda o restante da stack",
    nextPages: [
      {
        eyebrow: "Capacidades",
        title: "Geração de Imagem",
        href: "/capabilities/image-generation",
        summary: "Veja com mais profundidade texto para imagem, edição de imagem, modelos suportados e o fluxo real da CLI.",
      },
      {
        eyebrow: "Capacidades",
        title: "Geração de Vídeo",
        href: "/capabilities/video-generation",
        summary: "Entenda como texto para vídeo e imagem para vídeo entram na mesma superfície de comandos para agentes.",
      },
      {
        eyebrow: "Aprender",
        title: "O que agentes não conseguem fazer",
        href: "/learn/what-agents-cant-do",
        summary: "Comece aqui se você quiser a narrativa centrada nas limitações e a rota mais curta para cada capacidade que falta.",
      },
      {
        eyebrow: "Aprender",
        title: "Como skills se encaixam",
        href: "/skills",
        summary: "Use isto quando quiser entender como a camada de instrução conecta o agente à CLI e ao runtime.",
      },
      {
        eyebrow: "Guias",
        title: "MCP vs Skills",
        href: "/guides/mcp-vs-skills",
        summary: "Use isto quando quiser separar a camada de protocolo da camada de instrução antes de conectar o AnyCap.",
      },
      {
        eyebrow: "Guias",
        title: "Engenharia de Contexto",
        href: "/guides/context-engineering-for-agents",
        summary: "Use isto quando quiser entender quando o agente deve chamar uma capacidade em vez de ficar apenas no prompt.",
      },
    ],
    ctas: [
      { label: "Ver no GitHub", external: githubHref },
      { label: "Começar", href: "/start" },
      { label: "Ver lacunas de capacidade", href: "/learn/what-agents-cant-do" },
      { label: "Para Claude Code", href: "/for/claude-code" },
    ],
    pageJsonLd: buildCliPageJsonLd(
      "pt-br",
      "CLI do AnyCap | Runtime de capacidades para agentes de IA",
      "CLI nativa para agentes que dá aos agentes de IA um único caminho de instalação e uma única interface para capacidades como geração de imagem, geração de vídeo, entendimento de imagem e análise de vídeo.",
    ),
  },
  id: {} as CliPageData,
};

contentByLocale.id = contentByLocale.en;

export function getCliMetadata(locale: SiteLocale): Metadata {
  const content = contentByLocale[locale] ?? contentByLocale.en;
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

export function getCliPageData(locale: SiteLocale) {
  return contentByLocale[locale] ?? contentByLocale.en;
}
