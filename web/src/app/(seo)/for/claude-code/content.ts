import type { Metadata } from "next";
import { createFaqPageJsonLd, createTechArticleJsonLd } from "@/lib/schema";
import { siteConfig, type SiteLocale } from "@/lib/site";
import {
  buildAgentCapabilityGapRows,
  type AgentCapabilityGapAgent,
} from "@/lib/capability-inventory";
import type { CapabilityGapRow } from "@/components/landing/CapabilityGapTable";

export const FOR_CLAUDE_CODE_PATH = "/for/claude-code";

const CDN_BASE = "https://cdn.anycap.ai/page_resource/for_agent";
const LAST_UPDATED_ISO = "2026-04-17";
const DATE_PUBLISHED_ISO = "2026-04-03";
const CLAUDE_CODE_POSTER_URL = "https://cdn.anycap.ai/page_resource/seo-images/claude-code-capability-stack.png";

type GapDefinition = {
  capability: string;
  agentGap: Record<AgentCapabilityGapAgent, string>;
  anycapValue: string;
  nextStepLabel: string;
  nextStepHref: string;
};

type ForClaudeCodeCopy = {
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
  breadcrumbHome: string;
  heroEyebrow: string;
  heroLastUpdatedLabel: string;
  heroTitleLine1: string;
  heroTitleLine2: string;
  heroIntroLinkText: string;
  heroIntroAfterLink: string;
  heroCalloutPrefix: string;
  heroCalloutExample: string;
  heroCalloutSuffix: string;
  heroMicrocopy: string;
  heroCtas: {
    primary: string;
    imageGeneration: string;
    videoGeneration: string;
  };
  demoVideoTitle: string;
  demoVideoCaption: string;
  installEyebrow: string;
  installTitle: string;
  installIntro: string;
  installPromptLabel: string;
  installPromptText: string;
  installPromptExplanation: string;
  installManualSummary: string;
  installSteps: readonly {
    subtitle: string;
    title: string;
    code: string;
    note: string;
  }[];
  installWalkthroughPrefix: string;
  installWalkthroughLinkLabel: string;
  whyEyebrow: string;
  whyTitle: string;
  whyIntro: string;
  whyCards: readonly {
    title: string;
    body: string;
  }[];
  realEyebrow: string;
  realTitle: string;
  realIntro: string;
  realWorkflowExamples: readonly {
    title: string;
    command: string;
    outputLines: readonly string[];
  }[];
  gapEyebrow: string;
  gapTitle: string;
  gapDescription: string;
  gapColumns: readonly {
    label: string;
    accent?: boolean;
  }[];
  gapRows: readonly CapabilityGapRow[];
  capabilityCardsTitle: string;
  capabilityCards: readonly {
    eyebrow: string;
    title: string;
    href: string;
    summary: string;
    command: string;
  }[];
  faqTitle: string;
  faqItems: readonly {
    question: string;
    answer: string;
  }[];
  siblingEyebrow: string;
  siblingAgents: readonly {
    label: string;
    href: string;
  }[];
  footerCtas: {
    addToolsToClaudeCode: string;
    getStarted: string;
    whyOneCliMatters: string;
    howSkillsFit: string;
  };
  footerLastUpdatedLabel: string;
};

type ForClaudeCodePageContent = ForClaudeCodeCopy & {
  breadcrumbItems: readonly { name: string; href?: string; unlinkable?: boolean }[];
  hero: {
    eyebrow: string;
    lastUpdatedLabel: string;
    titleLine1: string;
    titleLine2: string;
    introLinkText: string;
    introAfterLink: string;
    calloutPrefix: string;
    calloutExample: string;
    calloutSuffix: string;
    microcopy: string;
    ctas: {
      primary: string;
      imageGeneration: string;
      videoGeneration: string;
    };
  };
  demoVideo: {
    src: string;
    poster: string;
    title: string;
    caption: string;
  };
  install: ForClaudeCodeCopy["installEyebrow"] extends string
    ? {
        eyebrow: string;
        title: string;
        intro: string;
        promptLabel: string;
        promptText: string;
        promptExplanation: string;
        manualSummary: string;
        steps: readonly {
          subtitle: string;
          title: string;
          code: string;
          note: string;
        }[];
        walkthroughPrefix: string;
        walkthroughLinkLabel: string;
      }
    : never;
  whyItFits: {
    eyebrow: string;
    title: string;
    intro: string;
    cards: readonly {
      title: string;
      body: string;
    }[];
  };
  realWorkflow: {
    eyebrow: string;
    title: string;
    intro: string;
    examples: readonly {
      title: string;
      command: string;
      outputLines: readonly string[];
    }[];
  };
  gapTable: {
    eyebrow: string;
    title: string;
    description: string;
    columns: readonly {
      label: string;
      accent?: boolean;
    }[];
    rows: readonly CapabilityGapRow[];
  };
  integrationGuideJsonLd: Record<string, unknown>;
  videoObjectJsonLd: Record<string, unknown>;
  faqJsonLd: Record<string, unknown>;
};

function createGapRows(definitions: readonly GapDefinition[]): CapabilityGapRow[] {
  return definitions.map((definition) => ({
    capability: definition.capability,
    cells: [
      { label: definition.agentGap["claude-code"], tone: "muted" },
      { label: definition.anycapValue, tone: "accent" },
      { label: definition.nextStepLabel, href: definition.nextStepHref },
    ],
  }));
}

function createPageContent(
  copy: ForClaudeCodeCopy,
  locale: SiteLocale,
): ForClaudeCodePageContent {
  const integrationGuideJsonLd = createTechArticleJsonLd({
    headline: copy.metadata.articleHeadline,
    description: copy.metadata.articleDescription,
    path: FOR_CLAUDE_CODE_PATH,
    locale,
    about: [...copy.metadata.articleAbout],
    keywords: [...copy.metadata.articleKeywords],
    datePublished: DATE_PUBLISHED_ISO,
    dateModified: LAST_UPDATED_ISO,
  });

  const faqJsonLd = createFaqPageJsonLd(copy.faqItems);

  return {
    ...copy,
    breadcrumbItems: [
      { name: copy.breadcrumbHome, href: "/" },
      { name: "Equip Agents", href: "/for", unlinkable: true },
      { name: "Claude Code" },
    ],
    hero: {
      eyebrow: copy.heroEyebrow,
      lastUpdatedLabel: copy.heroLastUpdatedLabel,
      titleLine1: copy.heroTitleLine1,
      titleLine2: copy.heroTitleLine2,
      introLinkText: copy.heroIntroLinkText,
      introAfterLink: copy.heroIntroAfterLink,
      calloutPrefix: copy.heroCalloutPrefix,
      calloutExample: copy.heroCalloutExample,
      calloutSuffix: copy.heroCalloutSuffix,
      microcopy: copy.heroMicrocopy,
      ctas: copy.heroCtas,
    },
    demoVideo: {
      src: `${CDN_BASE}/for_claude_code2.mp4`,
      poster: CLAUDE_CODE_POSTER_URL,
      title: copy.demoVideoTitle,
      caption: copy.demoVideoCaption,
    },
    install: {
      eyebrow: copy.installEyebrow,
      title: copy.installTitle,
      intro: copy.installIntro,
      promptLabel: copy.installPromptLabel,
      promptText: copy.installPromptText,
      promptExplanation: copy.installPromptExplanation,
      manualSummary: copy.installManualSummary,
      steps: copy.installSteps,
      walkthroughPrefix: copy.installWalkthroughPrefix,
      walkthroughLinkLabel: copy.installWalkthroughLinkLabel,
    },
    whyItFits: {
      eyebrow: copy.whyEyebrow,
      title: copy.whyTitle,
      intro: copy.whyIntro,
      cards: copy.whyCards,
    },
    realWorkflow: {
      eyebrow: copy.realEyebrow,
      title: copy.realTitle,
      intro: copy.realIntro,
      examples: copy.realWorkflowExamples,
    },
    gapTable: {
      eyebrow: copy.gapEyebrow,
      title: copy.gapTitle,
      description: copy.gapDescription,
      columns: copy.gapColumns,
      rows: copy.gapRows,
    },
    integrationGuideJsonLd,
    videoObjectJsonLd: {
      "@context": "https://schema.org",
      "@type": "VideoObject",
      name: copy.demoVideoTitle,
      description: copy.demoVideoCaption,
      contentUrl: `${CDN_BASE}/for_claude_code2.mp4`,
      uploadDate: DATE_PUBLISHED_ISO,
      duration: "PT48S",
      thumbnailUrl: CLAUDE_CODE_POSTER_URL,
    },
    faqJsonLd,
  };
}

const englishCopy: ForClaudeCodeCopy = {
  metadata: {
    title: "Claude Code Image, Video & Vision Tools | AnyCap",
    description:
      "Claude Code on Opus 4.7 + AnyCap is insane. Add image generation, video generation, vision, and audio to Claude Code through one skill, one CLI, and one login.",
    openGraphTitle: "Claude Code Opus 4.7 + AnyCap — Image, Video, and Vision in One Agent",
    openGraphDescription:
      "Opus 4.7 brings Anthropic's strongest reasoning. AnyCap fills every modality gap — image, video, vision, audio — through one CLI Opus 4.7 already controls.",
    articleHeadline: "Claude Code Opus 4.7 + AnyCap — Image, Video, and Vision in One Agent",
    articleDescription:
      "Guide to pairing Claude Code on Claude Opus 4.7 with AnyCap for image generation, video generation, vision, and audio workflows through one capability runtime.",
    articleAbout: ["Claude Code", "Claude Opus 4.7", "AnyCap CLI", "agent skills", "capability runtime"],
    articleKeywords: [
      "claude code opus 4.7",
      "claude opus 4.7 tools",
      "claude code tools",
      "add tools to claude code",
      "claude code capabilities",
      "claude code image generation",
      "claude code video generation",
      "claude code vision",
    ],
  },
  breadcrumbHome: "Home",
  heroEyebrow: "For Claude Code",
  heroLastUpdatedLabel: "Last updated April 17, 2026 — Updated for Claude Opus 4.7",
  heroTitleLine1: "Claude Code on Opus 4.7 + AnyCap is insane.",
  heroTitleLine2: "One agent, every modality, zero glue code.",
  heroIntroLinkText: "Claude Code",
  heroIntroAfterLink:
    " — now powered by Claude Opus 4.7 — is the strongest reasoning and coding agent Anthropic has shipped. It plans long, edits surgically, and runs tools without losing the thread. What it still cannot do is generate an image, render a video, or look at a screenshot. That is the entire gap. AnyCap fills it through one skill, one CLI, and one login — image generation (Seedream 5, Nano Banana Pro), video generation (Veo 3.1, Seedance 1.5 Pro, Kling 3.0), image understanding, video analysis, and audio transcription, all behind the same agent surface Opus 4.7 already controls. The result feels insane: ask for a launch visual, a walkthrough video, or a screenshot review in plain English, and Opus 4.7 chains the right capability without you ever leaving the terminal.",
  heroCalloutPrefix: "Just tell Claude Code what you need — like ",
  heroCalloutExample: "help me install anycap.ai",
  heroCalloutSuffix:
    ". It discovers the skill, installs the CLI, authenticates, and calls the right capability — all inside your terminal session, without any manual commands from you.",
  heroMicrocopy: "Natural language. Zero manual steps. Immediate capabilities.",
  heroCtas: {
    primary: "Get Started",
    imageGeneration: "Image Generation",
    videoGeneration: "Video Generation",
  },
  demoVideoTitle: "Install and use AnyCap with Claude Code",
  demoVideoCaption:
    "Watch Claude Code install AnyCap from a natural-language prompt — skill discovery, CLI setup, authentication, and first image generation in one uninterrupted flow.",
  installEyebrow: "Get started",
  installTitle: "Just ask. Claude Code does the rest.",
  installIntro:
    "No commands to memorize, no manual setup. Tell Claude Code what you need in natural language and it discovers the AnyCap skill, installs the CLI, authenticates, and starts delivering results — all in the same terminal session.",
  installPromptLabel: "What you say to Claude Code",
  installPromptText: "Help me install anycap.ai",
  installPromptExplanation:
    "Claude Code reads the prompt, discovers the AnyCap skill, installs the CLI, authenticates, and is ready to call anycap image generate, anycap video generate, or any other capability — automatically.",
  installManualSummary: "Prefer to install manually? Here are the three steps.",
  installSteps: [
    {
      subtitle: "Step 1",
      title: "Install the skill",
      code: "npx -y skills add anycap-ai/anycap -a claude-code -y",
      note: "This teaches Claude Code how to discover and invoke the AnyCap capability runtime.",
    },
    {
      subtitle: "Step 2",
      title: "Install the CLI",
      code: "curl -fsSL https://anycap.ai/install.sh | sh",
      note: "The CLI is a single binary with no runtime dependencies — it runs directly in Claude Code's terminal session.",
    },
    {
      subtitle: "Step 3",
      title: "Log in and verify",
      code: "anycap login && anycap status",
      note: "After authentication, Claude Code can move across image, video, and vision capabilities without new credentials or dashboard detours.",
    },
  ],
  installWalkthroughPrefix: "For a full walkthrough, see the",
  installWalkthroughLinkLabel: "install guide",
  whyEyebrow: "Why it fits",
  whyTitle: "Built for the way Claude Code already works",
  whyIntro:
    "AnyCap installs cleanly into Claude Code because it was designed for the same constraints: local terminal execution, filesystem access, and skill-based discovery.",
  whyCards: [
    {
      title: "Local terminal execution",
      body:
        "Claude Code runs directly in your terminal alongside your codebase. The AnyCap CLI is a dependency-free binary that installs and authenticates in the same session, so capabilities are available without leaving the terminal.",
    },
    {
      title: "Filesystem integration",
      body:
        "Claude Code has direct access to your project files. AnyCap returns file paths and CDN URLs that Claude Code can save into project directories, embed in markdown, or hand off to downstream tooling.",
    },
    {
      title: "One credential, every capability",
      body:
        "Without a runtime layer, adding image generation, video generation, and vision means three separate provider credentials. AnyCap consolidates them into one login that covers the full stack.",
    },
  ],
  realEyebrow: "Real workflow",
  realTitle: "What a Claude Code + AnyCap session looks like",
  realIntro:
    "These are real CLI commands and outputs. Each example runs directly inside the Claude Code terminal session — no external tools, dashboards, or browser tabs.",
  realWorkflowExamples: [
    {
      title: "Image generation — text-to-image",
      command:
        'anycap image generate --model seedream-5 --prompt "a minimal SaaS dashboard on a light background, clean UI, rounded corners" -o dashboard-hero.png',
      outputLines: [
        "Generating image with seedream-5...",
        "Image saved to dashboard-hero.png (1024x1024, 487KB)",
        "CDN URL: https://cdn.anycap.ai/...",
      ],
    },
    {
      title: "Image understanding — screenshot analysis",
      command:
        'anycap image read --file ./bug-screenshot.png --prompt "What UI issue do you see?"',
      outputLines: [
        "The modal overlay clips the submit button at viewport widths below 640px. The button is partially hidden behind the bottom edge of the dialog container. This appears to be a CSS overflow issue on the parent .modal-body element.",
      ],
    },
    {
      title: "Video generation — demo clip",
      command:
        'anycap video generate --model veo-3-1 --prompt "a developer typing in a dark terminal, smooth camera push-in, ambient desk lighting"',
      outputLines: [
        "Generating video with veo-3-1...",
        "Video ready (8s, 1080p, 12.4MB)",
        "CDN URL: https://cdn.anycap.ai/...",
      ],
    },
  ],
  gapEyebrow: "Capability gap",
  gapTitle: "What you get after one conversation",
  gapDescription:
    "Claude Code stays focused on code and terminal execution while AnyCap fills the generation, analysis, search, storage, and publishing gaps that sit outside its built-in surface area.",
  gapColumns: [
    { label: "Claude Code alone" },
    { label: "Add with AnyCap", accent: true },
    { label: "Best next step" },
  ],
  gapRows: buildAgentCapabilityGapRows("claude-code"),
  capabilityCardsTitle: "Start with the first missing capability",
  capabilityCards: [
    {
      eyebrow: "Setup guide",
      title: "Image Generation in Claude Code",
      href: "/for/claude-code/image-generation",
      summary: "Install path, model choices, and prompt patterns for image generation inside Claude Code.",
      command: "anycap image generate",
    },
    {
      eyebrow: "Setup guide",
      title: "Video Generation in Claude Code",
      href: "/for/claude-code/video-generation",
      summary: "Add text-to-video and image-to-video workflows to Claude Code through AnyCap.",
      command: "anycap video generate",
    },
    {
      eyebrow: "Model workflow",
      title: "Claude Opus 4.7",
      href: "/for/claude-code/opus-4-7",
      summary: "Capability patterns for image and video production inside Claude Opus 4.7.",
      command: "anycap image generate",
    },
    {
      eyebrow: "Vision",
      title: "Image Understanding",
      href: "/capabilities/image-understanding",
      summary: "Best next page when Claude Code needs to interpret screenshots, diagrams, OCR, or design feedback.",
      command: "anycap image read",
    },
    {
      eyebrow: "Analysis",
      title: "Video Analysis",
      href: "/capabilities/video-analysis",
      summary: "Best next page when Claude Code needs to inspect recordings and extract structured details.",
      command: "anycap video read",
    },
  ],
  faqTitle: "FAQ",
  faqItems: [
    {
      question: "Can Claude Code generate images on its own?",
      answer:
        "No. Claude Code focuses on code reasoning, planning, and terminal execution. It has no built-in image generation runtime. AnyCap adds that capability through one skill install and one CLI, so Claude Code can produce visuals without leaving your terminal session or wiring a separate image provider.",
    },
    {
      question: "Why use AnyCap instead of wiring providers directly?",
      answer:
        "Wiring a separate image API, a video API, and a vision API means managing three sets of credentials, SDKs, and authentication flows. AnyCap consolidates those into one CLI and one login that Claude Code can invoke directly from your terminal. One skill install replaces multiple provider integrations.",
    },
    {
      question: "Does AnyCap replace Claude Code?",
      answer:
        "No. AnyCap is not an agent. It is a capability runtime that runs alongside Claude Code. You keep Claude Code for code, planning, and terminal execution, and add the image, video, and vision tools it does not ship with. AnyCap extends Claude Code — it never competes with it.",
    },
    {
      question: "What is the fastest path to add tools to Claude Code?",
      answer:
        "Just tell Claude Code 'help me install anycap.ai' in natural language. It discovers the skill, installs the CLI, authenticates, and is ready to generate images or video immediately. No commands to memorize. If you prefer manual control, you can also install the skill and CLI yourself in three steps.",
    },
    {
      question: "Does AnyCap work inside the Claude Code terminal?",
      answer:
        "Yes. The AnyCap CLI is a single binary with no external dependencies. It runs directly in Claude Code's terminal session, sends API requests to the AnyCap server, and returns file paths or URLs that Claude Code can use in subsequent steps, embed in code, or save to your project directory.",
    },
  ],
  siblingEyebrow: "Also available for",
  siblingAgents: [
    { label: "Codex", href: "/for/codex" },
    { label: "Cursor", href: "/for/cursor" },
    { label: "Manus", href: "/for/manus" },
  ],
  footerCtas: {
    addToolsToClaudeCode: "Add Tools to Claude Code",
    getStarted: "Get Started",
    whyOneCliMatters: "Why One CLI Matters",
    howSkillsFit: "How Skills Fit",
  },
  footerLastUpdatedLabel: "Last updated April 5, 2026",
};

const ptBrCopy: ForClaudeCodeCopy = {
  metadata: {
    title: "Claude Code Opus 4.7 + AnyCap — Imagem, vídeo e visão em um só agente",
    description:
      "Claude Code no Opus 4.7 + AnyCap é absurdo. Adicione geração de imagem, geração de vídeo, visão e áudio ao Claude Code por uma skill, uma CLI e um login.",
    openGraphTitle: "Claude Code Opus 4.7 + AnyCap — Imagem, vídeo e visão em um só agente",
    openGraphDescription:
      "Opus 4.7 traz o raciocínio mais forte da Anthropic. AnyCap fecha cada lacuna de modalidade — imagem, vídeo, visão, áudio — por uma CLI que o Opus 4.7 já controla.",
    articleHeadline: "Claude Code Opus 4.7 + AnyCap — Imagem, vídeo e visão em um só agente",
    articleDescription:
      "Guia para usar o Claude Code no Claude Opus 4.7 com AnyCap em fluxos de geração de imagem, geração de vídeo, visão e áudio por um único runtime de capabilities.",
    articleAbout: ["Claude Code", "Claude Opus 4.7", "AnyCap CLI", "skills de agente", "runtime de capabilities"],
    articleKeywords: [
      "claude code opus 4.7",
      "claude opus 4.7 ferramentas",
      "ferramentas para claude code",
      "adicionar ferramentas ao claude code",
      "capabilities do claude code",
      "geração de imagem no claude code",
      "geração de vídeo no claude code",
      "visão no claude code",
    ],
  },
  breadcrumbHome: "Início",
  heroEyebrow: "Para Claude Code",
  heroLastUpdatedLabel: "Atualizado em 17 de abril de 2026 — Atualizado para o Claude Opus 4.7",
  heroTitleLine1: "Claude Code com Opus 4.7 + AnyCap é absurdo.",
  heroTitleLine2: "Um agente, todas as modalidades, zero glue code.",
  heroIntroLinkText: "Claude Code",
  heroIntroAfterLink:
    " — agora com Claude Opus 4.7 — é o agente de raciocínio e código mais forte que a Anthropic já lançou. Planeja em longa duração, edita com precisão cirúrgica e usa ferramentas sem perder o fio da meada. O que ele ainda não faz é gerar imagem, renderizar vídeo ou olhar para uma captura de tela. Essa é toda a lacuna. O AnyCap fecha tudo isso por uma skill, uma CLI e um login: geração de imagem (Seedream 5, Nano Banana Pro), geração de vídeo (Veo 3.1, Seedance 1.5 Pro, Kling 3.0), entendimento de imagem, análise de vídeo e transcrição de áudio, todos atrás da mesma superfície de agente que o Opus 4.7 já controla. O resultado é absurdo: peça em português um visual de lançamento, um vídeo walkthrough ou uma revisão de screenshot e o Opus 4.7 encadeia a capability certa — sem você sair do terminal.",
  heroCalloutPrefix: "Apenas diga ao Claude Code o que você precisa — como ",
  heroCalloutExample: "me ajude a instalar o anycap.ai",
  heroCalloutSuffix:
    ". Ele descobre a skill, instala a CLI, autentica e chama a capability certa — tudo dentro da sua sessão de terminal, sem nenhum comando manual da sua parte.",
  heroMicrocopy: "Linguagem natural. Zero etapas manuais. Capacidades imediatas.",
  heroCtas: {
    primary: "Comece agora",
    imageGeneration: "Geração de imagem",
    videoGeneration: "Geração de vídeo",
  },
  demoVideoTitle: "Instale e use o AnyCap com o Claude Code",
  demoVideoCaption:
    "Veja o Claude Code instalar o AnyCap a partir de um prompt em linguagem natural — descoberta da skill, configuração da CLI, autenticação e primeira geração de imagem em um fluxo contínuo.",
  installEyebrow: "Comece agora",
  installTitle: "Apenas peça. O Claude Code faz o resto.",
  installIntro:
    "Sem comandos para memorizar, sem configuração manual. Diga ao Claude Code o que você precisa em linguagem natural e ele descobre a skill do AnyCap, instala a CLI, autentica e começa a entregar resultados — tudo na mesma sessão do terminal.",
  installPromptLabel: "O que você diz para o Claude Code",
  installPromptText: "Me ajude a instalar o anycap.ai",
  installPromptExplanation:
    "O Claude Code lê o prompt, descobre a skill do AnyCap, instala a CLI, autentica e fica pronto para chamar anycap image generate, anycap video generate ou qualquer outra capability — automaticamente.",
  installManualSummary: "Prefere instalar manualmente? Aqui estão os três passos.",
  installSteps: [
    {
      subtitle: "Passo 1",
      title: "Instale a skill",
      code: "npx -y skills add anycap-ai/anycap -a claude-code -y",
      note: "Isso ensina o Claude Code a descobrir e invocar o runtime de capabilities do AnyCap.",
    },
    {
      subtitle: "Passo 2",
      title: "Instale a CLI",
      code: "curl -fsSL https://anycap.ai/install.sh | sh",
      note: "A CLI é um binário único, sem dependências de runtime — ela roda diretamente na sessão de terminal do Claude Code.",
    },
    {
      subtitle: "Passo 3",
      title: "Faça login e verifique",
      code: "anycap login && anycap status",
      note: "Depois da autenticação, o Claude Code pode transitar entre capacidades de imagem, vídeo e visão sem novas credenciais ou desvios para dashboards.",
    },
  ],
  installWalkthroughPrefix: "Para um passo a passo completo, veja o",
  installWalkthroughLinkLabel: "guia de instalação",
  whyEyebrow: "Por que funciona",
  whyTitle: "Feito para a forma como o Claude Code já funciona",
  whyIntro:
    "O AnyCap se instala limpo no Claude Code porque foi projetado para as mesmas restrições: execução local no terminal, acesso ao sistema de arquivos e descoberta baseada em skills.",
  whyCards: [
    {
      title: "Execução local no terminal",
      body:
        "O Claude Code roda diretamente no seu terminal junto com a base de código. A CLI do AnyCap é um binário sem dependências, que instala e autentica na mesma sessão, então as capacidades ficam disponíveis sem sair do terminal.",
    },
    {
      title: "Integração com o sistema de arquivos",
      body:
        "O Claude Code tem acesso direto aos arquivos do seu projeto. O AnyCap devolve caminhos de arquivo e URLs de CDN que o Claude Code pode salvar em diretórios do projeto, incorporar em markdown ou repassar para ferramentas posteriores.",
    },
    {
      title: "Uma credencial, todas as capacidades",
      body:
        "Sem uma camada de runtime, adicionar geração de imagem, geração de vídeo e visão significa três credenciais separadas de provedor. O AnyCap consolida tudo em um único login que cobre a stack inteira.",
    },
  ],
  realEyebrow: "Fluxo de trabalho real",
  realTitle: "Como é uma sessão de Claude Code + AnyCap",
  realIntro:
    "São comandos e saídas reais da CLI. Cada exemplo roda diretamente dentro da sessão de terminal do Claude Code — sem ferramentas externas, dashboards ou abas de navegador.",
  realWorkflowExamples: [
    {
      title: "Geração de imagem — texto para imagem",
      command:
        'anycap image generate --model seedream-5 --prompt "uma dashboard SaaS minimalista em fundo claro, UI limpa, cantos arredondados" -o dashboard-hero.png',
      outputLines: [
        "Gerando imagem com seedream-5...",
        "Imagem salva em dashboard-hero.png (1024x1024, 487KB)",
        "URL da CDN: https://cdn.anycap.ai/...",
      ],
    },
    {
      title: "Compreensão de imagem — análise de screenshot",
      command:
        'anycap image read --file ./bug-screenshot.png --prompt "Qual problema de UI você vê?"',
      outputLines: [
        "A sobreposição do modal corta o botão de envio em larguras de viewport abaixo de 640px. O botão fica parcialmente escondido atrás da borda inferior do contêiner do diálogo. Isso parece ser um problema de overflow CSS no elemento pai .modal-body.",
      ],
    },
    {
      title: "Geração de vídeo — clipe de demonstração",
      command:
        'anycap video generate --model veo-3-1 --prompt "uma pessoa desenvolvendo em um terminal escuro, câmera avançando suavemente, iluminação ambiente de mesa"',
      outputLines: [
        "Gerando vídeo com veo-3-1...",
        "Vídeo pronto (8s, 1080p, 12.4MB)",
        "URL da CDN: https://cdn.anycap.ai/...",
      ],
    },
  ],
  gapEyebrow: "Lacuna de capacidades",
  gapTitle: "O que você ganha após uma conversa",
  gapDescription:
    "O Claude Code continua focado em código e execução no terminal, enquanto o AnyCap preenche as lacunas de geração, análise, busca, armazenamento e publicação que ficam fora da superfície nativa.",
  gapColumns: [
    { label: "Só o Claude Code" },
    { label: "Adicione com o AnyCap", accent: true },
    { label: "Próximo melhor passo" },
  ],
  gapRows: [
    {
      capability: "Geração de imagem",
      cells: [
        { label: "Sem saída de imagem no fluxo de terminal", tone: "muted" },
        { label: "Gere visuais e mockups com anycap image generate", tone: "accent" },
        { label: "Página de Geração de Imagem", href: "/capabilities/image-generation" },
      ],
    },
    {
      capability: "Geração de vídeo",
      cells: [
        { label: "Sem ferramentas de vídeo na CLI", tone: "muted" },
        { label: "Crie walkthroughs e clipes com anycap video generate", tone: "accent" },
        { label: "Página de Geração de Vídeo", href: "/capabilities/video-generation" },
      ],
    },
    {
      capability: "Geração de música",
      cells: [
        { label: "Sem geração de música no fluxo de terminal", tone: "muted" },
        { label: "Crie trilhas de fundo pelo runtime de música do AnyCap", tone: "accent" },
        { label: "Página de Geração de Música", href: "/capabilities/music-generation" },
      ],
    },
    {
      capability: "Compreensão de imagem",
      cells: [
        { label: "Sem runtime de visão unificado", tone: "muted" },
        { label: "Leia screenshots, diagramas e referências visuais", tone: "accent" },
        { label: "Página de Compreensão de Imagem", href: "/capabilities/image-understanding" },
      ],
    },
    {
      capability: "Análise de vídeo",
      cells: [
        { label: "Exige configuração separada de provedor", tone: "muted" },
        { label: "Inspecione gravações pela mesma CLI", tone: "accent" },
        { label: "Página de Análise de Vídeo", href: "/capabilities/video-analysis" },
      ],
    },
    {
      capability: "Compreensão de áudio",
      cells: [
        { label: "Sem runtime unificado de análise de áudio", tone: "muted" },
        { label: "Transcreva e analise áudio por meio de um único runtime", tone: "accent" },
        { label: "Página de Compreensão de Áudio", href: "/capabilities/audio-understanding" },
      ],
    },
    {
      capability: "Busca na web",
      cells: [
        { label: "A busca depende de tooling externo", tone: "muted" },
        { label: "Pesquise a web a partir da mesma camada de capabilities", tone: "accent" },
        { label: "Página de Busca na Web", href: "/capabilities/web-search" },
      ],
    },
    {
      capability: "Busca na web com grounding",
      cells: [
        { label: "Sem fluxo de busca grounded no loop de tarefa", tone: "muted" },
        { label: "Execute busca grounded quando a resposta precisar de citações", tone: "accent" },
        { label: "Página de Busca Grounded na Web", href: "/capabilities/grounded-web-search" },
      ],
    },
    {
      capability: "Rastreamento da web",
      cells: [
        { label: "Sem runtime reaproveitável de crawl", tone: "muted" },
        { label: "Rastreie páginas e extraia conteúdo de uma única CLI", tone: "accent" },
        { label: "Página de Rastreamento da Web", href: "/capabilities/web-crawl" },
      ],
    },
    {
      capability: "Armazenamento Drive",
      cells: [
        { label: "Sem camada compartilhada de armazenamento de ativos", tone: "muted" },
        { label: "Armazene outputs com URLs públicas no AnyCap Drive", tone: "accent" },
        { label: "Página de Pricing", href: "/pricing" },
      ],
    },
    {
      capability: "Hospedagem de páginas",
      cells: [
        { label: "Sem superfície nativa de publicação de páginas", tone: "muted" },
        { label: "Publique páginas simples pelo AnyCap Page", tone: "accent" },
        { label: "Página de Pricing", href: "/pricing" },
      ],
    },
    {
      capability: "Um fluxo de autenticação",
      cells: [
        { label: "Gerenciamento de credenciais por provedor", tone: "muted" },
        { label: "Uma única conta em toda a stack de capabilities", tone: "accent" },
        { label: "Página Comece Agora", href: "/start" },
      ],
    },
  ],
  capabilityCardsTitle: "Comece pela primeira capacidade que falta",
  capabilityCards: [
    {
      eyebrow: "Saída criativa",
      title: "Geração de imagem",
      href: "/capabilities/image-generation",
      summary: "Melhor próxima página quando o Claude Code precisa de visuais, mockups, assets de lançamento ou outro output de imagem.",
      command: "anycap image generate",
    },
    {
      eyebrow: "Saída de movimento",
      title: "Geração de vídeo",
      href: "/capabilities/video-generation",
      summary: "Melhor próxima página quando o Claude Code precisa de demos, walkthroughs ou output de vídeo curto.",
      command: "anycap video generate",
    },
    {
      eyebrow: "Visão",
      title: "Compreensão de imagem",
      href: "/capabilities/image-understanding",
      summary: "Melhor próxima página quando o Claude Code precisa interpretar screenshots, diagramas, OCR ou feedback de design.",
      command: "anycap image read",
    },
    {
      eyebrow: "Análise",
      title: "Análise de vídeo",
      href: "/capabilities/video-analysis",
      summary: "Melhor próxima página quando o Claude Code precisa inspecionar gravações e extrair detalhes estruturados.",
      command: "anycap video read",
    },
  ],
  faqTitle: "Perguntas frequentes",
  faqItems: [
    {
      question: "O Claude Code consegue gerar imagens sozinho?",
      answer:
        "Não. O Claude Code foca em raciocínio de código, planejamento e execução no terminal. Ele não traz um runtime nativo de geração de imagem. O AnyCap adiciona essa capability por meio de uma única skill e uma única CLI, para que o Claude Code produza visuais sem sair da sessão do terminal ou conectar um provedor de imagem separado.",
    },
    {
      question: "Por que usar o AnyCap em vez de conectar provedores diretamente?",
      answer:
        "Conectar uma API separada de imagem, uma API de vídeo e uma API de visão significa gerenciar três conjuntos de credenciais, SDKs e fluxos de autenticação. O AnyCap consolida tudo em uma única CLI e um único login que o Claude Code pode invocar diretamente do terminal. Uma instalação de skill substitui múltiplas integrações de provedor.",
    },
    {
      question: "O AnyCap substitui o Claude Code?",
      answer:
        "Não. O AnyCap não é um agente. Ele é um runtime de capabilities que roda ao lado do Claude Code. Você continua usando o Claude Code para código, planejamento e execução no terminal, e adiciona as ferramentas de imagem, vídeo e visão que ele não traz nativamente. O AnyCap expande o Claude Code — ele nunca compete com ele.",
    },
    {
      question: "Qual é o caminho mais rápido para adicionar ferramentas ao Claude Code?",
      answer:
        "Basta dizer ao Claude Code 'me ajude a instalar o anycap.ai' em linguagem natural. Ele descobre a skill, instala a CLI, autentica e já fica pronto para gerar imagens ou vídeos. Sem comandos para memorizar. Se você preferir controle manual, também pode instalar a skill e a CLI você mesmo em três passos.",
    },
    {
      question: "O AnyCap funciona dentro do terminal do Claude Code?",
      answer:
        "Sim. A CLI do AnyCap é um binário único, sem dependências externas. Ela roda diretamente na sessão de terminal do Claude Code, envia requisições para o servidor do AnyCap e devolve caminhos de arquivos ou URLs que o Claude Code pode usar nas etapas seguintes, incorporar em código ou salvar no diretório do projeto.",
    },
  ],
  siblingEyebrow: "Também disponível para",
  siblingAgents: [
    { label: "Codex", href: "/for/codex" },
    { label: "Cursor", href: "/for/cursor" },
    { label: "Manus", href: "/for/manus" },
  ],
  footerCtas: {
    addToolsToClaudeCode: "Adicionar ferramentas ao Claude Code",
    getStarted: "Comece agora",
    whyOneCliMatters: "Por que uma única CLI importa",
    howSkillsFit: "Como as Skills funcionam",
  },
  footerLastUpdatedLabel: "Atualizado em 5 de abril de 2026",
};

const idCopy: ForClaudeCodeCopy = {
  metadata: {
    title: "Claude Code Opus 4.7 + AnyCap — Gambar, video, dan visi dalam satu agen",
    description:
      "Claude Code di Opus 4.7 + AnyCap itu gila. Tambahkan pembuatan gambar, pembuatan video, visi, dan audio ke Claude Code lewat satu skill, satu CLI, dan satu login.",
    openGraphTitle: "Claude Code Opus 4.7 + AnyCap — Gambar, video, dan visi dalam satu agen",
    openGraphDescription:
      "Opus 4.7 membawa reasoning paling kuat dari Anthropic. AnyCap menutup setiap celah modalitas — gambar, video, visi, audio — lewat satu CLI yang sudah dikendalikan Opus 4.7.",
    articleHeadline: "Claude Code Opus 4.7 + AnyCap — Gambar, video, dan visi dalam satu agen",
    articleDescription:
      "Panduan memasangkan Claude Code di Claude Opus 4.7 dengan AnyCap untuk alur pembuatan gambar, pembuatan video, visi, dan audio melalui satu runtime kemampuan.",
    articleAbout: ["Claude Code", "Claude Opus 4.7", "AnyCap CLI", "skill agen", "runtime kemampuan"],
    articleKeywords: [
      "claude code opus 4.7",
      "claude opus 4.7 alat",
      "alat claude code",
      "menambahkan alat ke claude code",
      "kemampuan claude code",
      "pembuatan gambar claude code",
      "pembuatan video claude code",
      "visi claude code",
    ],
  },
  breadcrumbHome: "Beranda",
  heroEyebrow: "Untuk Claude Code",
  heroLastUpdatedLabel: "Terakhir diperbarui 17 April 2026 — Diperbarui untuk Claude Opus 4.7",
  heroTitleLine1: "Claude Code di Opus 4.7 + AnyCap itu gila.",
  heroTitleLine2: "Satu agen, semua modalitas, tanpa glue code.",
  heroIntroLinkText: "Claude Code",
  heroIntroAfterLink:
    " — kini ditenagai Claude Opus 4.7 — adalah agen reasoning dan coding terkuat yang pernah dirilis Anthropic. Ia merencanakan jangka panjang, mengedit secara presisi, dan memakai tool tanpa kehilangan alur. Yang masih belum bisa ia lakukan adalah menghasilkan gambar, merender video, atau melihat tangkapan layar. Itulah seluruh celahnya. AnyCap menutup semuanya melalui satu skill, satu CLI, dan satu login: pembuatan gambar (Seedream 5, Nano Banana Pro), pembuatan video (Veo 3.1, Seedance 1.5 Pro, Kling 3.0), pemahaman gambar, analisis video, dan transkripsi audio—semua di balik permukaan agen yang sudah dikendalikan Opus 4.7. Hasilnya benar-benar gila: minta visual peluncuran, video walkthrough, atau review screenshot dalam bahasa alami, dan Opus 4.7 merangkai capability yang tepat tanpa Anda meninggalkan terminal.",
  heroCalloutPrefix: "Cukup katakan ke Claude Code apa yang Anda butuhkan—misalnya ",
  heroCalloutExample: "bantu saya menginstal anycap.ai",
  heroCalloutSuffix:
    ". Claude Code akan menemukan skill, memasang CLI, mengautentikasi, dan memanggil kemampuan yang tepat—semuanya di sesi terminal yang sama, tanpa perintah manual dari Anda.",
  heroMicrocopy: "Bahasa alami. Tanpa langkah manual. Kemampuan langsung siap.",
  heroCtas: {
    primary: "Mulai",
    imageGeneration: "Pembuatan gambar",
    videoGeneration: "Pembuatan video",
  },
  demoVideoTitle: "Pasang dan gunakan AnyCap dengan Claude Code",
  demoVideoCaption:
    "Lihat Claude Code memasang AnyCap dari prompt bahasa alami—penemuan skill, penyiapan CLI, autentikasi, dan pembuatan gambar pertama dalam satu alur tanpa putus.",
  installEyebrow: "Mulai",
  installTitle: "Cukup minta. Claude Code yang menyelesaikan sisanya.",
  installIntro:
    "Tanpa hafalan perintah, tanpa penyiapan manual. Beri tahu Claude Code kebutuhan Anda dalam bahasa alami; Claude Code akan menemukan skill AnyCap, memasang CLI, mengautentikasi, dan mulai mengirimkan hasil—semua di sesi terminal yang sama.",
  installPromptLabel: "Yang Anda katakan ke Claude Code",
  installPromptText: "Bantu saya menginstal anycap.ai",
  installPromptExplanation:
    "Claude Code membaca prompt, menemukan skill AnyCap, memasang CLI, mengautentikasi, dan siap memanggil anycap image generate, anycap video generate, atau kemampuan lain—secara otomatis.",
  installManualSummary: "Lebih suka memasang manual? Berikut tiga langkahnya.",
  installSteps: [
    {
      subtitle: "Langkah 1",
      title: "Pasang skill",
      code: "npx -y skills add anycap-ai/anycap -a claude-code -y",
      note: "Ini mengajarkan Claude Code cara menemukan dan memanggil runtime kemampuan AnyCap.",
    },
    {
      subtitle: "Langkah 2",
      title: "Pasang CLI",
      code: "curl -fsSL https://anycap.ai/install.sh | sh",
      note: "CLI adalah satu binary tanpa dependensi runtime—berjalan langsung di sesi terminal Claude Code.",
    },
    {
      subtitle: "Langkah 3",
      title: "Masuk dan verifikasi",
      code: "anycap login && anycap status",
      note: "Setelah autentikasi, Claude Code dapat berpindah antar kemampuan gambar, video, dan visi tanpa kredensial baru atau bolak-balik ke dashboard.",
    },
  ],
  installWalkthroughPrefix: "Untuk panduan lengkap, lihat",
  installWalkthroughLinkLabel: "panduan pemasangan",
  whyEyebrow: "Mengapa cocok",
  whyTitle: "Dirancang untuk cara kerja Claude Code",
  whyIntro:
    "AnyCap terpasang rapi di Claude Code karena didesain untuk batasan yang sama: eksekusi terminal lokal, akses sistem berkas, dan penemuan berbasis skill.",
  whyCards: [
    {
      title: "Eksekusi terminal lokal",
      body:
        "Claude Code berjalan langsung di terminal Anda di samping basis kode. CLI AnyCap adalah binary tanpa dependensi yang terpasang dan terautentikasi di sesi yang sama, sehingga kemampuan tersedia tanpa meninggalkan terminal.",
    },
    {
      title: "Integrasi sistem berkas",
      body:
        "Claude Code punya akses langsung ke berkas proyek Anda. AnyCap mengembalikan path berkas dan URL CDN yang bisa disimpan Claude Code ke direktori proyek, disematkan di markdown, atau diteruskan ke alat lain.",
    },
    {
      title: "Satu kredensial untuk semua kemampuan",
      body:
        "Tanpa lapisan runtime, menambahkan pembuatan gambar, video, dan visi berarti tiga set kredensial penyedia terpisah. AnyCap menyatukannya dalam satu login yang mencakup seluruh stack.",
    },
  ],
  realEyebrow: "Alur kerja nyata",
  realTitle: "Sesil Claude Code + AnyCap terlihat seperti ini",
  realIntro:
    "Ini perintah dan keluaran CLI yang nyata. Setiap contoh berjalan langsung di sesi terminal Claude Code—tanpa alat eksternal, dashboard, atau tab browser.",
  realWorkflowExamples: [
    {
      title: "Pembuatan gambar — teks ke gambar",
      command:
        'anycap image generate --model seedream-5 --prompt "dashboard SaaS minimal di latar terang, UI bersih, sudut membulat" -o dashboard-hero.png',
      outputLines: [
        "Membuat gambar dengan seedream-5...",
        "Gambar disimpan ke dashboard-hero.png (1024x1024, 487KB)",
        "URL CDN: https://cdn.anycap.ai/...",
      ],
    },
    {
      title: "Pemahaman gambar — analisis tangkapan layar",
      command:
        'anycap image read --file ./bug-screenshot.png --prompt "Masalah UI apa yang Anda lihat?"',
      outputLines: [
        "Overlay modal memotong tombol kirim pada lebar viewport di bawah 640px. Tombol sebagian tersembunyi di balik tepi bawah kontainer dialog. Ini tampak seperti masalah overflow CSS pada elemen induk .modal-body.",
      ],
    },
    {
      title: "Pembuatan video — klip demo",
      command:
        'anycap video generate --model veo-3-1 --prompt "pengembang mengetik di terminal gelap, kamera maju halus, pencahayaan meja ambient"',
      outputLines: [
        "Membuat video dengan veo-3-1...",
        "Video siap (8s, 1080p, 12.4MB)",
        "URL CDN: https://cdn.anycap.ai/...",
      ],
    },
  ],
  gapEyebrow: "Celah kemampuan",
  gapTitle: "Yang Anda dapatkan setelah satu percakapan",
  gapDescription:
    "Claude Code tetap fokus pada kode dan eksekusi terminal sementara AnyCap mengisi celah pembuatan, analisis, pencarian, penyimpanan, dan publikasi di luar permukaan bawaannya.",
  gapColumns: [
    { label: "Claude Code saja" },
    { label: "Tambahkan dengan AnyCap", accent: true },
    { label: "Langkah berikutnya terbaik" },
  ],
  gapRows: [
    {
      capability: "Pembuatan gambar",
      cells: [
        { label: "Tidak ada keluaran gambar dari terminal", tone: "muted" },
        { label: "Hasilkan visual dan mockup lewat anycap image generate", tone: "accent" },
        { label: "Halaman Pembuatan Gambar", href: "/capabilities/image-generation" },
      ],
    },
    {
      capability: "Pembuatan video",
      cells: [
        { label: "Tidak ada alat video di alur CLI", tone: "muted" },
        { label: "Buat walkthrough dan klip lewat anycap video generate", tone: "accent" },
        { label: "Halaman Pembuatan Video", href: "/capabilities/video-generation" },
      ],
    },
    {
      capability: "Pembuatan musik",
      cells: [
        { label: "Tidak ada pembuatan musik di alur CLI", tone: "muted" },
        { label: "Buat trek latar lewat runtime musik AnyCap", tone: "accent" },
        { label: "Halaman Pembuatan Musik", href: "/capabilities/music-generation" },
      ],
    },
    {
      capability: "Pemahaman gambar",
      cells: [
        { label: "Tidak ada runtime visi terpadu", tone: "muted" },
        { label: "Baca tangkapan layar, diagram, dan referensi visual", tone: "accent" },
        { label: "Halaman Pemahaman Gambar", href: "/capabilities/image-understanding" },
      ],
    },
    {
      capability: "Analisis video",
      cells: [
        { label: "Membutuhkan penyiapan penyedia terpisah", tone: "muted" },
        { label: "Periksa rekaman dari CLI yang sama", tone: "accent" },
        { label: "Halaman Analisis Video", href: "/capabilities/video-analysis" },
      ],
    },
    {
      capability: "Pemahaman audio",
      cells: [
        { label: "Tidak ada runtime analisis audio terpadu", tone: "muted" },
        { label: "Transkripsikan dan analisis audio lewat satu runtime", tone: "accent" },
        { label: "Halaman Pemahaman Audio", href: "/capabilities/audio-understanding" },
      ],
    },
    {
      capability: "Pencarian web",
      cells: [
        { label: "Pencarian bergantung pada alat eksternal", tone: "muted" },
        { label: "Cari web dari lapisan kemampuan yang sama", tone: "accent" },
        { label: "Halaman Pencarian Web", href: "/capabilities/web-search" },
      ],
    },
    {
      capability: "Pencarian web dengan grounding",
      cells: [
        { label: "Tidak ada alur pencarian grounded di loop tugas", tone: "muted" },
        { label: "Jalankan pencarian grounded saat jawaban membutuhkan kutipan sumber", tone: "accent" },
        { label: "Halaman Pencarian Web Grounded", href: "/capabilities/grounded-web-search" },
      ],
    },
    {
      capability: "Perayapan web",
      cells: [
        { label: "Tidak ada runtime crawl yang dapat dipakai ulang", tone: "muted" },
        { label: "Jelajahi halaman dan ekstrak konten dari satu CLI", tone: "accent" },
        { label: "Halaman Perayapan Web", href: "/capabilities/web-crawl" },
      ],
    },
    {
      capability: "Penyimpanan Drive",
      cells: [
        { label: "Tidak ada lapisan penyimpanan aset bersama", tone: "muted" },
        { label: "Simpan keluaran dengan URL publik di AnyCap Drive", tone: "accent" },
        { label: "Halaman Harga", href: "/pricing" },
      ],
    },
    {
      capability: "Hosting halaman",
      cells: [
        { label: "Tidak ada permukaan publikasi halaman bawaan", tone: "muted" },
        { label: "Terbitkan halaman sederhana lewat AnyCap Page", tone: "accent" },
        { label: "Halaman Harga", href: "/pricing" },
      ],
    },
    {
      capability: "Satu alur autentikasi",
      cells: [
        { label: "Manajemen kredensial per penyedia", tone: "muted" },
        { label: "Satu akun di seluruh stack kemampuan", tone: "accent" },
        { label: "Halaman Mulai", href: "/start" },
      ],
    },
  ],
  capabilityCardsTitle: "Mulai dari kemampuan pertama yang belum ada",
  capabilityCards: [
    {
      eyebrow: "Keluaran kreatif",
      title: "Pembuatan gambar",
      href: "/capabilities/image-generation",
      summary:
        "Halaman berikutnya yang paling pas ketika Claude Code butuh visual, mockup, aset peluncuran, atau keluaran gambar lain.",
      command: "anycap image generate",
    },
    {
      eyebrow: "Keluaran gerak",
      title: "Pembuatan video",
      href: "/capabilities/video-generation",
      summary:
        "Halaman berikutnya yang paling pas ketika Claude Code butuh demo, walkthrough, atau keluaran video pendek.",
      command: "anycap video generate",
    },
    {
      eyebrow: "Visi",
      title: "Pemahaman gambar",
      href: "/capabilities/image-understanding",
      summary:
        "Halaman berikutnya yang paling pas ketika Claude Code perlu menafsirkan tangkapan layar, diagram, OCR, atau umpan balik desain.",
      command: "anycap image read",
    },
    {
      eyebrow: "Analisis",
      title: "Analisis video",
      href: "/capabilities/video-analysis",
      summary:
        "Halaman berikutnya yang paling pas ketika Claude Code perlu memeriksa rekaman dan mengekstrak detail terstruktur.",
      command: "anycap video read",
    },
  ],
  faqTitle: "FAQ",
  faqItems: [
    {
      question: "Apakah Claude Code bisa membuat gambar sendiri?",
      answer:
        "Tidak. Claude Code berfokus pada penalaran kode, perencanaan, dan eksekusi terminal. Tidak ada runtime pembuatan gambar bawaan. AnyCap menambahkan kemampuan itu lewat satu pemasangan skill dan satu CLI, sehingga Claude Code dapat menghasilkan visual tanpa meninggalkan sesi terminal atau menyambungkan penyedia gambar terpisah.",
    },
    {
      question: "Mengapa memakai AnyCap alih-alih menyambungkan penyedia langsung?",
      answer:
        "Menyambungkan API gambar, video, dan visi secara terpisah berarti mengelola tiga set kredensial, SDK, dan alur autentikasi. AnyCap menyatukannya dalam satu CLI dan satu login yang bisa dipanggil Claude Code langsung dari terminal. Satu pemasangan skill menggantikan banyak integrasi penyedia.",
    },
    {
      question: "Apakah AnyCap menggantikan Claude Code?",
      answer:
        "Tidak. AnyCap bukan agen. Ini runtime kemampuan yang berjalan di samping Claude Code. Anda tetap memakai Claude Code untuk kode, perencanaan, dan eksekusi terminal, dan menambahkan alat gambar, video, dan visi yang tidak dibawa bawaan. AnyCap memperluas Claude Code—bukan bersaing dengannya.",
    },
    {
      question: "Apa jalur tercepat untuk menambahkan alat ke Claude Code?",
      answer:
        "Cukup katakan ke Claude Code 'Bantu saya menginstal anycap.ai' dalam bahasa alami. Claude Code akan menemukan skill, memasang CLI, mengautentikasi, dan siap membuat gambar atau video segera. Tanpa hafalan perintah. Jika Anda lebih suka kontrol manual, Anda juga bisa memasang skill dan CLI sendiri dalam tiga langkah.",
    },
    {
      question: "Apakah AnyCap berjalan di dalam terminal Claude Code?",
      answer:
        "Ya. CLI AnyCap adalah satu binary tanpa dependensi eksternal. CLI berjalan langsung di sesi terminal Claude Code, mengirim permintaan ke server AnyCap, dan mengembalikan path berkas atau URL yang bisa dipakai Claude Code di langkah berikutnya, disematkan ke kode, atau disimpan ke direktori proyek.",
    },
  ],
  siblingEyebrow: "Juga tersedia untuk",
  siblingAgents: [
    { label: "Codex", href: "/for/codex" },
    { label: "Cursor", href: "/for/cursor" },
    { label: "Manus", href: "/for/manus" },
  ],
  footerCtas: {
    addToolsToClaudeCode: "Tambahkan alat ke Claude Code",
    getStarted: "Mulai",
    whyOneCliMatters: "Mengapa satu CLI penting",
    howSkillsFit: "Cara skill cocok",
  },
  footerLastUpdatedLabel: "Terakhir diperbarui 5 April 2026",
};

const deCopy: ForClaudeCodeCopy = {
  metadata: {
    title: "Claude Code Opus 4.7 + AnyCap – Bild, Video und Vision in einem Agent",
    description:
      "Claude Code auf Opus 4.7 + AnyCap – die starke Kombination. Erweitern Sie Claude Code um Bildgenerierung, Videogenerierung, Vision und Audio über einen Skill, eine CLI und ein Login.",
    openGraphTitle: "Claude Code Opus 4.7 + AnyCap – Bild, Video und Vision in einem Agent",
    openGraphDescription:
      "Opus 4.7 bringt Anthropics stärkstes Reasoning. AnyCap schließt jede Modalitätslücke – Bild, Video, Vision, Audio – über eine CLI, die Opus 4.7 bereits steuert.",
    articleHeadline: "Claude Code Opus 4.7 + AnyCap – Bild, Video und Vision in einem Agent",
    articleDescription:
      "Anleitung, um Claude Code auf Claude Opus 4.7 mit AnyCap für Bildgenerierung, Videogenerierung, Vision und Audio-Workflows über eine einzige Capability-Runtime zu kombinieren.",
    articleAbout: ["Claude Code", "Claude Opus 4.7", "AnyCap CLI", "Agent-Skills", "Capability-Runtime"],
    articleKeywords: [
      "claude code opus 4.7",
      "claude opus 4.7 tools",
      "claude code tools",
      "tools zu claude code hinzufügen",
      "claude code capabilities",
      "claude code bildgenerierung",
      "claude code videogenerierung",
      "claude code vision",
    ],
  },
  breadcrumbHome: "Startseite",
  heroEyebrow: "Für Claude Code",
  heroLastUpdatedLabel: "Zuletzt aktualisiert am 17. April 2026 – Aktualisiert für Claude Opus 4.7",
  heroTitleLine1: "Claude Code auf Opus 4.7 + AnyCap – die starke Kombination.",
  heroTitleLine2: "Ein Agent, jede Modalität, kein Glue-Code.",
  heroIntroLinkText: "Claude Code",
  heroIntroAfterLink:
    " – jetzt angetrieben von Claude Opus 4.7 – ist der stärkste Reasoning- und Coding-Agent, den Anthropic je veröffentlicht hat. Er plant langfristig, editiert chirurgisch präzise und nutzt Tools, ohne den roten Faden zu verlieren. Was er noch immer nicht kann: ein Bild generieren, ein Video rendern oder einen Screenshot betrachten. Genau das ist die Lücke. AnyCap schließt sie über einen Skill, eine CLI und ein Login – Bildgenerierung (Seedream 5, Nano Banana Pro), Videogenerierung (Veo 3.1, Seedance 1.5 Pro, Kling 3.0), Bildverständnis, Videoanalyse und Audio-Transkription, alles hinter derselben Agent-Oberfläche, die Opus 4.7 bereits steuert. Das Ergebnis ist beeindruckend: Bitten Sie in einfacher Sprache um ein Launch-Visual, ein Walkthrough-Video oder ein Screenshot-Review, und Opus 4.7 verkettet die richtige Capability – ohne dass Sie das Terminal verlassen.",
  heroCalloutPrefix: "Sagen Sie Claude Code einfach, was Sie brauchen – etwa ",
  heroCalloutExample: "hilf mir, anycap.ai zu installieren",
  heroCalloutSuffix:
    ". Es findet den Skill, installiert die CLI, authentifiziert sich und ruft die richtige Capability auf – alles innerhalb Ihrer Terminal-Sitzung, ohne manuelle Befehle von Ihnen.",
  heroMicrocopy: "Natürliche Sprache. Null manuelle Schritte. Sofortige Capabilities.",
  heroCtas: {
    primary: "Loslegen",
    imageGeneration: "Bildgenerierung",
    videoGeneration: "Videogenerierung",
  },
  demoVideoTitle: "AnyCap mit Claude Code installieren und nutzen",
  demoVideoCaption:
    "Sehen Sie, wie Claude Code AnyCap aus einem Prompt in natürlicher Sprache installiert – Skill-Discovery, CLI-Setup, Authentifizierung und erste Bildgenerierung in einem ununterbrochenen Ablauf.",
  installEyebrow: "Loslegen",
  installTitle: "Fragen Sie einfach. Claude Code erledigt den Rest.",
  installIntro:
    "Keine Befehle zum Auswendiglernen, kein manuelles Setup. Sagen Sie Claude Code in natürlicher Sprache, was Sie brauchen, und es findet den AnyCap-Skill, installiert die CLI, authentifiziert sich und liefert Ergebnisse — alles in derselben Terminal-Sitzung.",
  installPromptLabel: "Was Sie zu Claude Code sagen",
  installPromptText: "Hilf mir, anycap.ai zu installieren",
  installPromptExplanation:
    "Claude Code liest den Prompt, findet den AnyCap-Skill, installiert die CLI, authentifiziert sich und ist bereit, anycap image generate, anycap video generate oder jede andere capability aufzurufen — automatisch.",
  installManualSummary: "Lieber manuell installieren? Hier sind die drei Schritte.",
  installSteps: [
    {
      subtitle: "Schritt 1",
      title: "Skill installieren",
      code: "npx -y skills add anycap-ai/anycap -a claude-code -y",
      note: "Damit lernt Claude Code, wie es die AnyCap-Capability-Runtime findet und aufruft.",
    },
    {
      subtitle: "Schritt 2",
      title: "CLI installieren",
      code: "curl -fsSL https://anycap.ai/install.sh | sh",
      note: "Die CLI ist eine einzelne Binary ohne Runtime-Abhängigkeiten – sie läuft direkt in der Terminal-Sitzung von Claude Code.",
    },
    {
      subtitle: "Schritt 3",
      title: "Anmelden und verifizieren",
      code: "anycap login && anycap status",
      note: "Nach der Authentifizierung kann Claude Code zwischen Bild-, Video- und Vision-Capabilities wechseln, ohne neue Anmeldedaten oder Dashboard-Umwege.",
    },
  ],
  installWalkthroughPrefix: "Eine vollständige Anleitung finden Sie im",
  installWalkthroughLinkLabel: "Installationsleitfaden",
  whyEyebrow: "Warum es passt",
  whyTitle: "Gebaut für die Art, wie Claude Code bereits arbeitet",
  whyIntro:
    "AnyCap installiert sich sauber in Claude Code, weil es für dieselben Rahmenbedingungen entworfen wurde: lokale Terminal-Ausführung, Dateisystem-Zugriff und skill-basierte Discovery.",
  whyCards: [
    {
      title: "Lokale Terminal-Ausführung",
      body:
        "Claude Code läuft direkt in Ihrem Terminal neben Ihrer Codebasis. Die AnyCap CLI ist eine abhängigkeitsfreie Binary, die sich in derselben Sitzung installiert und authentifiziert, sodass Capabilities verfügbar sind, ohne das Terminal zu verlassen.",
    },
    {
      title: "Dateisystem-Integration",
      body:
        "Claude Code hat direkten Zugriff auf Ihre Projektdateien. AnyCap liefert Dateipfade und CDN-URLs zurück, die Claude Code in Projektverzeichnissen speichern, in Markdown einbetten oder an nachgelagertes Tooling übergeben kann.",
    },
    {
      title: "Ein Credential, jede Capability",
      body:
        "Ohne eine Runtime-Schicht bedeutet das Hinzufügen von Bildgenerierung, Videogenerierung und Vision drei separate Provider-Credentials. AnyCap konsolidiert sie zu einem Login, der den gesamten Stack abdeckt.",
    },
  ],
  realEyebrow: "Realer Workflow",
  realTitle: "Wie eine Sitzung mit Claude Code + AnyCap aussieht",
  realIntro:
    "Das sind echte CLI-Befehle und Ausgaben. Jedes Beispiel läuft direkt innerhalb der Claude-Code-Terminal-Sitzung – ohne externe Tools, Dashboards oder Browser-Tabs.",
  realWorkflowExamples: [
    {
      title: "Bildgenerierung – Text zu Bild",
      command:
        'anycap image generate --model seedream-5 --prompt "a minimal SaaS dashboard on a light background, clean UI, rounded corners" -o dashboard-hero.png',
      outputLines: [
        "Generating image with seedream-5...",
        "Image saved to dashboard-hero.png (1024x1024, 487KB)",
        "CDN URL: https://cdn.anycap.ai/...",
      ],
    },
    {
      title: "Bildverständnis – Screenshot-Analyse",
      command:
        'anycap image read --file ./bug-screenshot.png --prompt "What UI issue do you see?"',
      outputLines: [
        "The modal overlay clips the submit button at viewport widths below 640px. The button is partially hidden behind the bottom edge of the dialog container. This appears to be a CSS overflow issue on the parent .modal-body element.",
      ],
    },
    {
      title: "Videogenerierung – Demo-Clip",
      command:
        'anycap video generate --model veo-3-1 --prompt "a developer typing in a dark terminal, smooth camera push-in, ambient desk lighting"',
      outputLines: [
        "Generating video with veo-3-1...",
        "Video ready (8s, 1080p, 12.4MB)",
        "CDN URL: https://cdn.anycap.ai/...",
      ],
    },
  ],
  gapEyebrow: "Capability-Lücke",
  gapTitle: "Was Sie nach einer Konversation bekommen",
  gapDescription:
    "Claude Code bleibt auf Code und Terminal-Ausführung fokussiert, während AnyCap die Lücken in Generierung, Analyse, Suche, Speicherung und Veröffentlichung schließt, die außerhalb seiner eingebauten Oberfläche liegen.",
  gapColumns: [
    { label: "Claude Code allein" },
    { label: "Mit AnyCap hinzufügen", accent: true },
    { label: "Bester nächster Schritt" },
  ],
  gapRows: buildAgentCapabilityGapRows("claude-code"),
  capabilityCardsTitle: "Beginnen Sie mit der ersten fehlenden Capability",
  capabilityCards: [
    {
      eyebrow: "Kreative Ausgabe",
      title: "Bildgenerierung",
      href: "/capabilities/image-generation",
      summary: "Beste nächste Seite, wenn Claude Code Visuals, Mockups, Launch-Assets oder andere Bildausgaben benötigt.",
      command: "anycap image generate",
    },
    {
      eyebrow: "Bewegungsausgabe",
      title: "Videogenerierung",
      href: "/capabilities/video-generation",
      summary: "Beste nächste Seite, wenn Claude Code Demos, Walkthroughs oder Kurzvideos benötigt.",
      command: "anycap video generate",
    },
    {
      eyebrow: "Vision",
      title: "Bildverständnis",
      href: "/capabilities/image-understanding",
      summary: "Beste nächste Seite, wenn Claude Code Screenshots, Diagramme, OCR oder Design-Feedback interpretieren muss.",
      command: "anycap image read",
    },
    {
      eyebrow: "Analyse",
      title: "Videoanalyse",
      href: "/capabilities/video-analysis",
      summary: "Beste nächste Seite, wenn Claude Code Aufnahmen prüfen und strukturierte Details extrahieren muss.",
      command: "anycap video read",
    },
  ],
  faqTitle: "FAQ",
  faqItems: [
    {
      question: "Kann Claude Code von sich aus Bilder generieren?",
      answer:
        "Nein. Claude Code konzentriert sich auf Code-Reasoning, Planung und Terminal-Ausführung. Es hat keine eingebaute Bildgenerierungs-Runtime. AnyCap fügt diese Capability über eine Skill-Installation und eine CLI hinzu, sodass Claude Code Visuals erzeugen kann, ohne die Terminal-Sitzung zu verlassen oder einen separaten Bild-Provider anzubinden.",
    },
    {
      question: "Warum AnyCap statt Provider direkt anbinden?",
      answer:
        "Eine separate Bild-API, Video-API und Vision-API anzubinden bedeutet, drei Sätze von Anmeldedaten, SDKs und Authentifizierungsabläufen zu verwalten. AnyCap konsolidiert das in einer CLI und einem Login, das Claude Code direkt aus Ihrem Terminal aufrufen kann. Eine Skill-Installation ersetzt mehrere Provider-Integrationen.",
    },
    {
      question: "Ersetzt AnyCap Claude Code?",
      answer:
        "Nein. AnyCap ist kein Agent. Es ist eine Capability-Runtime, die neben Claude Code läuft. Sie behalten Claude Code für Code, Planung und Terminal-Ausführung und ergänzen die Bild-, Video- und Vision-Tools, die nicht mitgeliefert werden. AnyCap erweitert Claude Code – es konkurriert nie mit ihm.",
    },
    {
      question: "Was ist der schnellste Weg, Tools zu Claude Code hinzuzufügen?",
      answer:
        "Sagen Sie Claude Code einfach in natürlicher Sprache 'hilf mir, anycap.ai zu installieren'. Es findet den Skill, installiert die CLI, authentifiziert sich und ist sofort bereit, Bilder oder Videos zu erzeugen. Keine Befehle zum Auswendiglernen. Wenn Sie manuelle Kontrolle bevorzugen, können Sie den Skill und die CLI auch in drei Schritten selbst installieren.",
    },
    {
      question: "Funktioniert AnyCap im Claude Code Terminal?",
      answer:
        "Ja. Die AnyCap CLI ist eine einzelne Binary ohne externe Abhängigkeiten. Sie läuft direkt in der Terminal-Sitzung von Claude Code, sendet API-Anfragen an den AnyCap-Server und liefert Dateipfade oder URLs zurück, die Claude Code in nachfolgenden Schritten nutzen, in Code einbetten oder in Ihrem Projektverzeichnis speichern kann.",
    },
  ],
  siblingEyebrow: "Auch verfügbar für",
  siblingAgents: [
    { label: "Codex", href: "/for/codex" },
    { label: "Cursor", href: "/for/cursor" },
    { label: "Manus", href: "/for/manus" },
  ],
  footerCtas: {
    addToolsToClaudeCode: "Tools zu Claude Code hinzufügen",
    getStarted: "Loslegen",
    whyOneCliMatters: "Warum eine CLI zählt",
    howSkillsFit: "Wie Skills passen",
  },
  footerLastUpdatedLabel: "Zuletzt aktualisiert am 5. April 2026",
};

const contentByLocale = {
  en: createPageContent(englishCopy, "en"),
  "pt-br": createPageContent(ptBrCopy, "pt-br"),
  id: createPageContent(idCopy, "id"),
  de: createPageContent(deCopy, "de"),
} as const satisfies Record<SiteLocale, ForClaudeCodePageContent>;

export function getForClaudeCodeMetadata(locale: SiteLocale): Metadata {
  const content = contentByLocale[locale] ?? contentByLocale.en;

  return {
    title: content.metadata.title,
    description: content.metadata.description,
    openGraph: {
      type: "website",
      url: FOR_CLAUDE_CODE_PATH,
      siteName: siteConfig.siteName,
      title: content.metadata.openGraphTitle,
      description: content.metadata.openGraphDescription,
    },
  };
}

export function getForClaudeCodePageData(locale: SiteLocale): ForClaudeCodePageContent {
  return contentByLocale[locale] ?? contentByLocale.en;
}
