import type { Metadata } from "next";
import { createTechArticleJsonLd } from "@/lib/schema";
import { getLocaleConfig, getLocalizedRouteUrl, siteConfig, type SiteLocale } from "@/lib/site";

export const START_PATH = "/start";

type StartAgentOption = {
  name: string;
  href: string;
  command: string;
  description: string;
};

type StartStep = {
  title: string;
  code: string;
  note: string;
};

type StartGapEntrance = {
  eyebrow: string;
  title: string;
  href: string;
  summary: string;
};

type StartPageContent = {
  metadata: {
    title: string;
    description: string;
    openGraphTitle: string;
    openGraphDescription: string;
    pageName: string;
    pageDescription: string;
  };
  breadcrumbItems: readonly { name: string; href: string }[];
  hero: {
    eyebrow: string;
    titleLine1: string;
    titleLine2: string;
    intro: string;
    lastUpdatedLabel: string;
    naturalLanguageEyebrow: string;
    naturalLanguageLead: string;
    naturalLanguageNote: string;
  };
  video: {
    sectionEyebrow: string;
    title: string;
    description: string;
    alt: string;
  };
  overviewTitle: string;
  overviewParagraphs: string[];
  sectionTitles: {
    agents: string;
    naturalLanguageStartPath: string;
    gapEntrances: string;
    watch: string;
  };
  cardEyebrow: string;
  agentOptions: readonly StartAgentOption[];
  universalSteps: readonly StartStep[];
  gapEntrances: readonly StartGapEntrance[];
  ctas: {
    startWithClaudeCode: string;
    universalInstallGuide: string;
    seeCapabilityGaps: string;
    installAnycap: string;
    viewCapabilities: string;
    forClaudeCode: string;
  };
  pageJsonLd: ReturnType<typeof createTechArticleJsonLd>;
  videoJsonLd: {
    "@context": "https://schema.org";
    "@type": "VideoObject";
    name: string;
    description: string;
    contentUrl: string;
    uploadDate: string;
    duration: string;
    thumbnailUrl: string;
  };
};

const CDN_BASE = "https://cdn.anycap.ai/page_resource/start";
const START_VIDEO_SRC = `${CDN_BASE}/start-hero.mp4`;
const START_VIDEO_POSTER = `${CDN_BASE}/start-hero-poster.jpg`;
const START_VIDEO_THUMBNAIL_URL = START_VIDEO_POSTER;
const lastUpdatedIso = "2026-04-10";

const agentOptions: readonly Omit<StartAgentOption, "description">[] = [
  {
    name: "Claude Code",
    href: "/for/claude-code",
    command: "npx -y skills add anycap-ai/anycap -a claude-code -y",
  },
  {
    name: "Cursor",
    href: "/for/cursor",
    command: "npx -y skills add anycap-ai/anycap -a cursor -y",
  },
  {
    name: "Codex",
    href: "/for/codex",
    command: "npx -y skills add anycap-ai/anycap -a codex -y",
  },
];

const universalSteps: readonly Omit<StartStep, "note">[] = [
  {
    title: "Ask your agent to get you started",
    code: "help me install AnyCap and generate a launch image",
  },
  {
    title: "Install the CLI",
    code: "curl -fsSL https://anycap.ai/install.sh | sh",
  },
  {
    title: "Log in once",
    code: "anycap login",
  },
];

const gapEntrances: readonly Omit<StartGapEntrance, "summary">[] = [
  {
    eyebrow: "Claude Code",
    title: "Add image generation to Claude Code",
    href: "/for/claude-code/image-generation",
  },
  {
    eyebrow: "Claude Code",
    title: "Add video generation to Claude Code",
    href: "/for/claude-code/video-generation",
  },
  {
    eyebrow: "Problem intent",
    title: "What agents still can't do",
    href: "/learn/what-agents-cant-do",
  },
  {
    eyebrow: "Capability hub",
    title: "Browse any capability",
    href: "/capabilities",
  },
];

const contentByLocale: Partial<Record<SiteLocale, StartPageContent>> = {
  en: {
    metadata: {
      title: "Get started with AnyCap — Don't switch agents, add capabilities immediately",
      description:
        "Start with AnyCap in minutes. Pick Claude Code, Cursor, or Codex, then ask in natural language to install one skill and one CLI and add image, video, and vision capabilities without switching agents.",
      openGraphTitle: "Get started with AnyCap — Don't switch agents, add capabilities immediately",
      openGraphDescription:
        "Pick your agent, ask in natural language, and add image, video, and vision capabilities through one CLI.",
      pageName: "Get started with AnyCap",
      pageDescription:
        "Quick start page for installing AnyCap by asking your agent in natural language and choosing the right onboarding path for Claude Code, Cursor, or Codex.",
    },
    breadcrumbItems: [
      { name: "Home", href: "/" },
      { name: "Get Started", href: START_PATH },
    ],
    hero: {
      eyebrow: "Start",
      titleLine1: "Don't switch agents.",
      titleLine2: "Add capabilities immediately.",
      intro:
        "AnyCap is the fastest path from a capable coding agent to a capable multimodal agent. Pick the agent you already use, then tell it what you want in natural language. It can install one skill and one CLI for you, then add image generation, video generation, image understanding, and video analysis through the same command surface.",
      lastUpdatedLabel: "Last updated April 10, 2026",
      naturalLanguageEyebrow: "Natural language first",
      naturalLanguageLead: "Just say what you want, like",
      naturalLanguageNote:
        "The smoother path is to ask in plain language and let the agent carry the setup, login, and capability call from there.",
    },
    video: {
      sectionEyebrow: "Watch",
      title: "See the natural-language workflow in motion",
      description:
        "A short brand video for the start page. It pairs the 'don't switch agents' message with the idea that you can start by describing what you need in natural language.",
      alt: "A short brand video showing the AnyCap start page and natural-language setup path.",
    },
    overviewTitle: "Why this page exists",
    overviewParagraphs: [
      "The start page is designed for the shortest route from intent to working capability. Instead of asking the user to study the whole product structure first, it gives them a natural-language starting point, a simple install path, and clear follow-on pages for the most common gaps.",
      "That makes this page useful both for first-time operators and for teams sending someone else a clean onboarding link. The goal is not only to explain AnyCap. It is to reduce the friction between the first question and the first successful capability call.",
    ],
    sectionTitles: {
      agents: "Pick your agent",
      naturalLanguageStartPath: "Natural-language start path",
      gapEntrances: "Start from the gap you need to close",
      watch: "See the natural-language workflow in motion",
    },
    cardEyebrow: "Agent path",
    agentOptions: agentOptions.map((option) => ({
      ...option,
      description:
        option.name === "Claude Code"
          ? "Best first path if you want the strongest install intent page and the deepest capability onboarding."
          : option.name === "Cursor"
            ? "Use this if your agent workflows already live in Cursor and you want the same capability layer there."
            : "Good fit when you want to add image, video, and vision capabilities to Codex without wiring provider SDKs.",
    })),
    universalSteps: universalSteps.map((step) => ({
      ...step,
      note:
        step.title === "Ask your agent to get you started"
          ? "Claude Code, Cursor, or Codex can take a plain-language request and turn it into the setup flow for you."
          : step.title === "Install the CLI"
            ? "Or install via npm if you prefer a package manager path."
            : "Authentication happens once and carries across every capability, so you can keep asking in natural language after setup.",
    })),
    gapEntrances: gapEntrances.map((entry) => ({
      ...entry,
      summary:
        entry.title === "Add image generation to Claude Code"
          ? "Best next page if the gap is visuals, mockups, or creative assets."
          : entry.title === "Add video generation to Claude Code"
            ? "Best next page if the gap is demos, walkthroughs, or social clips."
            : entry.title === "What agents still can't do"
              ? "Use this when you want the deficiency narrative and the right landing page for each missing capability."
              : "Use this when you already know you want image, video, or vision APIs for your agent.",
    })),
    ctas: {
      startWithClaudeCode: "Start with Claude Code",
      universalInstallGuide: "Universal install guide",
      seeCapabilityGaps: "See capability gaps",
      installAnycap: "Install AnyCap",
      viewCapabilities: "View capabilities",
      forClaudeCode: "For Claude Code",
    },
    pageJsonLd: createTechArticleJsonLd({
      headline: "Get started with AnyCap — Don't switch agents, add capabilities immediately",
      description:
        "Quick start page for installing AnyCap by asking your agent in natural language and choosing the right onboarding path for Claude Code, Cursor, or Codex.",
      path: START_PATH,
      about: ["AnyCap CLI", "AI agents", "Claude Code", "Cursor", "Codex"],
      keywords: [
        "get started with anycap",
        "install anycap",
        "add capabilities to claude code",
        "cursor tools",
        "codex tools",
      ],
      dateModified: lastUpdatedIso,
    }),
    videoJsonLd: {
      "@context": "https://schema.org",
      "@type": "VideoObject",
      name: "Get started with AnyCap",
      description:
        "A 25-second brand video for the start page, showing AnyCap's 'don't switch agents' positioning and the idea that you can get started by asking in natural language.",
      contentUrl: START_VIDEO_SRC,
      uploadDate: lastUpdatedIso,
      duration: "PT25S",
      thumbnailUrl: START_VIDEO_THUMBNAIL_URL,
    },
  },
  "pt-br": {
    metadata: {
      title: "Comece com o AnyCap — Não troque de agente, adicione capacidades na hora",
      description:
        "Comece com o AnyCap em minutos. Escolha Claude Code, Cursor ou Codex e peça em linguagem natural para instalar um skill e um CLI e adicionar capacidades de imagem, vídeo e visão sem trocar de agente.",
      openGraphTitle: "Comece com o AnyCap — Não troque de agente, adicione capacidades na hora",
      openGraphDescription:
        "Escolha seu agente, peça em linguagem natural e adicione capacidades de imagem, vídeo e visão por meio de um único CLI.",
      pageName: "Comece com o AnyCap",
      pageDescription:
        "Página de início rápido para instalar o AnyCap pedindo ao seu agente em linguagem natural e escolhendo o caminho certo de onboarding para Claude Code, Cursor ou Codex.",
    },
    breadcrumbItems: [
      { name: "Início", href: "/" },
      { name: "Comece", href: START_PATH },
    ],
    hero: {
      eyebrow: "Início",
      titleLine1: "Não troque de agente.",
      titleLine2: "Adicione capacidades na hora.",
      intro:
        "O AnyCap é o caminho mais rápido de um agente de código capaz para um agente multimodal capaz. Escolha o agente que você já usa e diga em linguagem natural o que você quer. Ele pode instalar um skill e um CLI para você e depois adicionar geração de imagem, geração de vídeo, entendimento de imagem e análise de vídeo pelo mesmo ponto de comando.",
      lastUpdatedLabel: "Atualizado em 10 de abril de 2026",
      naturalLanguageEyebrow: "Linguagem natural primeiro",
      naturalLanguageLead: "Basta dizer o que você quer, como",
      naturalLanguageNote:
        "O caminho mais fluido é pedir em linguagem simples e deixar o agente cuidar da instalação, do login e da chamada de capacidade.",
    },
    video: {
      sectionEyebrow: "Assistir",
      title: "Veja o fluxo em linguagem natural em movimento",
      description:
        "Um vídeo curto da marca para a página inicial. Ele combina a mensagem de não trocar de agente com a ideia de começar descrevendo o que você precisa em linguagem natural.",
      alt: "Vídeo curto mostrando a página inicial do AnyCap e o caminho de configuração em linguagem natural.",
    },
    overviewTitle: "Por que esta página existe",
    overviewParagraphs: [
      "A página de início foi desenhada para o caminho mais curto entre intenção e capacidade funcionando. Em vez de pedir que a pessoa estude toda a estrutura do produto primeiro, ela oferece um ponto de partida em linguagem natural, um caminho simples de instalação e páginas seguintes para as lacunas mais comuns.",
      "Isso torna a página útil tanto para quem está começando quanto para equipes que querem enviar um link de onboarding mais limpo para outra pessoa. O objetivo não é apenas explicar o AnyCap. É reduzir o atrito entre a primeira pergunta e a primeira chamada de capacidade com sucesso.",
    ],
    sectionTitles: {
      agents: "Escolha seu agente",
      naturalLanguageStartPath: "Caminho de início em linguagem natural",
      gapEntrances: "Comece pela lacuna que você quer fechar",
      watch: "Veja o fluxo em linguagem natural em movimento",
    },
    cardEyebrow: "Caminho do agente",
    agentOptions: agentOptions.map((option) => ({
      ...option,
      description:
        option.name === "Claude Code"
          ? "Melhor caminho inicial se você quer a página de instalação mais forte e o onboarding de capacidades mais profundo."
          : option.name === "Cursor"
            ? "Use este caminho se seus fluxos de agente já vivem no Cursor e você quer a mesma camada de capacidades lá."
            : "Boa opção quando você quer adicionar capacidades de imagem, vídeo e visão ao Codex sem conectar SDKs de provedor.",
    })),
    universalSteps: universalSteps.map((step) => ({
      ...step,
      title:
        step.title === "Ask your agent to get you started"
          ? "Peça ao seu agente para começar"
          : step.title === "Install the CLI"
            ? "Instale o CLI"
            : "Faça login uma vez",
      note:
        step.title === "Ask your agent to get you started"
          ? "Claude Code, Cursor ou Codex podem receber um pedido em linguagem simples e transformá-lo no fluxo de configuração."
          : step.title === "Install the CLI"
            ? "Ou instale via npm se você preferir o caminho por gerenciador de pacotes."
            : "A autenticação acontece uma vez e vale para todas as capacidades, então você pode continuar pedindo em linguagem natural depois da configuração.",
    })),
    gapEntrances: gapEntrances.map((entry) => ({
      ...entry,
      eyebrow:
        entry.eyebrow === "Claude Code"
          ? "Claude Code"
          : entry.eyebrow === "Problem intent"
            ? "Intenção do problema"
            : "Hub de capacidades",
      title:
        entry.title === "Add image generation to Claude Code"
          ? "Adicionar geração de imagem ao Claude Code"
          : entry.title === "Add video generation to Claude Code"
            ? "Adicionar geração de vídeo ao Claude Code"
            : entry.title === "What agents still can't do"
              ? "O que os agentes ainda não conseguem fazer"
              : "Explorar qualquer capacidade",
      summary:
        entry.title === "Add image generation to Claude Code"
          ? "Melhor próxima página se a lacuna for visual, mockup ou material criativo."
          : entry.title === "Add video generation to Claude Code"
            ? "Melhor próxima página se a lacuna for demo, walkthrough ou clipe social."
            : entry.title === "What agents still can't do"
              ? "Use esta página quando quiser a narrativa de lacunas e a landing page certa para cada capacidade ausente."
              : "Use esta página quando você já sabe que quer APIs de imagem, vídeo ou visão para o seu agente.",
    })),
    ctas: {
      startWithClaudeCode: "Começar com Claude Code",
      universalInstallGuide: "Guia de instalação universal",
      seeCapabilityGaps: "Ver lacunas de capacidade",
      installAnycap: "Instalar AnyCap",
      viewCapabilities: "Ver capacidades",
      forClaudeCode: "Para Claude Code",
    },
    pageJsonLd: createTechArticleJsonLd({
      headline: "Comece com o AnyCap — Não troque de agente, adicione capacidades na hora",
      description:
        "Página de início rápido para instalar o AnyCap pedindo ao seu agente em linguagem natural e escolhendo o caminho certo de onboarding para Claude Code, Cursor ou Codex.",
      path: START_PATH,
      about: ["AnyCap CLI", "agentes de IA", "Claude Code", "Cursor", "Codex"],
      keywords: [
        "comece com anycap",
        "instalar anycap",
        "adicionar capacidades ao claude code",
        "ferramentas do cursor",
        "ferramentas do codex",
      ],
      dateModified: lastUpdatedIso,
    }),
    videoJsonLd: {
      "@context": "https://schema.org",
      "@type": "VideoObject",
      name: "Comece com o AnyCap",
      description:
        "Um vídeo de marca de 25 segundos para a página inicial, mostrando o posicionamento de 'não troque de agente' e a ideia de começar pedindo em linguagem natural.",
      contentUrl: START_VIDEO_SRC,
      uploadDate: lastUpdatedIso,
      duration: "PT25S",
      thumbnailUrl: START_VIDEO_THUMBNAIL_URL,
    },
  },
};

export function getStartMetadata(locale: SiteLocale): Metadata {
  const content = contentByLocale[locale] ?? contentByLocale.en!;

  return {
    title: content.metadata.title,
    description: content.metadata.description,
    alternates: { canonical: START_PATH },
    openGraph: {
      type: "website",
      locale: getLocaleConfig(locale).ogLocale,
      url: getLocalizedRouteUrl(siteConfig.defaultLocale, START_PATH),
      siteName: siteConfig.siteName,
      title: content.metadata.openGraphTitle,
      description: content.metadata.openGraphDescription,
    },
  };
}

export function getStartPageData(locale: SiteLocale) {
  return contentByLocale[locale] ?? contentByLocale.en!;
}
