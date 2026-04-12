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
const LAST_UPDATED_ISO = "2026-04-05";
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
  howToJsonLd: Record<string, unknown>;
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
    howToJsonLd: {
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: copy.installTitle,
      description: copy.installIntro,
      step: copy.installSteps.map((step) => ({
        "@type": "HowToStep",
        name: step.title,
        text: `${step.title}: ${step.note}`,
      })),
    },
    faqJsonLd,
  };
}

const englishCopy: ForClaudeCodeCopy = {
  metadata: {
    title: "Claude Code Tools — Add Image, Video, and Vision with AnyCap",
    description:
      "Add image generation, video generation, and vision to Claude Code through one skill install, one CLI, and one auth flow with AnyCap.",
    openGraphTitle: "Claude Code Tools — Add Image, Video, and Vision with AnyCap",
    openGraphDescription:
      "Give Claude Code one install path for image, video, and vision workflows through AnyCap.",
    articleHeadline: "Claude Code Tools — Add Image, Video, and Vision with AnyCap",
    articleDescription:
      "Guide to adding image generation, video generation, and vision workflows to Claude Code through one capability runtime.",
    articleAbout: ["Claude Code", "AnyCap CLI", "agent skills", "capability runtime"],
    articleKeywords: [
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
  heroLastUpdatedLabel: "Last updated April 5, 2026",
  heroTitleLine1: "Claude Code can code.",
  heroTitleLine2: "It still needs image, video, and vision capabilities.",
  heroIntroLinkText: "Claude Code",
  heroIntroAfterLink:
    " is excellent at planning, refactoring, and code execution. The gap appears when the workflow needs image, video, audio, or visual-analysis capabilities, like product visuals, walkthrough videos, screenshot understanding, or recording review — none of those are Claude Code tools today.",
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
      eyebrow: "Creative output",
      title: "Image Generation",
      href: "/capabilities/image-generation",
      summary: "Best next page when Claude Code needs visuals, mockups, launch assets, or other image output.",
      command: "anycap image generate",
    },
    {
      eyebrow: "Motion output",
      title: "Video Generation",
      href: "/capabilities/video-generation",
      summary: "Best next page when Claude Code needs demos, walkthroughs, or short-form video output.",
      command: "anycap video generate",
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
    title: "Ferramentas para Claude Code — Adicione imagem, vídeo e visão com o AnyCap",
    description:
      "Adicione geração de imagem, geração de vídeo e visão ao Claude Code por meio de uma única instalação de skill, uma única CLI e um único fluxo de autenticação com o AnyCap.",
    openGraphTitle: "Ferramentas para Claude Code — Adicione imagem, vídeo e visão com o AnyCap",
    openGraphDescription:
      "Dê ao Claude Code um único caminho de instalação para fluxos de imagem, vídeo e visão por meio do AnyCap.",
    articleHeadline: "Ferramentas para Claude Code — Adicione imagem, vídeo e visão com o AnyCap",
    articleDescription:
      "Guia de capability para adicionar fluxos de geração de imagem, geração de vídeo e visão ao Claude Code por meio de um único runtime.",
    articleAbout: ["Claude Code", "AnyCap CLI", "skills de agente", "runtime de capabilities"],
    articleKeywords: [
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
  heroLastUpdatedLabel: "Atualizado em 5 de abril de 2026",
  heroTitleLine1: "O Claude Code programa.",
  heroTitleLine2: "Mas ainda precisa de capacidades de imagem, vídeo e visão.",
  heroIntroLinkText: "Claude Code",
  heroIntroAfterLink:
    " é excelente em planejamento, refatoração e execução de código. A lacuna aparece quando o fluxo precisa de capacidades de imagem, vídeo ou análise visual, como visuais de produto, vídeos de walkthrough, compreensão de screenshots ou revisão de gravações — nenhuma dessas são ferramentas do Claude Code hoje.",
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

const contentByLocale = {
  en: createPageContent(englishCopy, "en"),
  "pt-br": createPageContent(ptBrCopy, "pt-br"),
  id: createPageContent(englishCopy, "id"),
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
