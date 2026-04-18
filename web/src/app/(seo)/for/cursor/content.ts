import type { Metadata } from "next";
import type { CapabilityGapRow } from "@/components/landing/CapabilityGapTable";
import { createFaqPageJsonLd, createTechArticleJsonLd } from "@/lib/schema";
import { getLocaleConfig, siteConfig, type SiteLocale } from "@/lib/site";

export const FOR_CURSOR_PATH = "/for/cursor";
const CURSOR_POSTER_URL = "https://cdn.anycap.ai/page_resource/seo-images/cursor-capability-flow.png";

const LAST_UPDATED_ISO = "2026-04-05";

type CursorBreadcrumbItem = {
  name: string;
  href?: string;
  unlinkable?: boolean;
};

type CursorInstallStep = {
  title: string;
  subtitle: string;
  code: string;
  note: string;
};

type CursorSectionCard = {
  eyebrow: string;
  title: string;
  href: string;
  summary: string;
  command: string;
};

type CursorModelCard = {
  eyebrow: string;
  title: string;
  href: string;
  summary: string;
  comparison: string;
};

type CursorFaqItem = {
  question: string;
  answer: string;
};

type CursorPageContent = {
  metadata: {
    title: string;
    description: string;
    openGraphTitle: string;
    openGraphDescription: string;
    articleHeadline: string;
    articleDescription: string;
    articleAbout: string[];
    articleKeywords: string[];
  };
  breadcrumbItems: CursorBreadcrumbItem[];
  pageEyebrow: string;
  lastUpdatedLabel: string;
  hero: {
    titleLine1: string;
    titleLine2: string;
    videoDescription: string;
    cursorIntroSuffix: string;
    promptSentence: string;
    promptTagline: string;
    ctas: {
      primary: string;
      secondary: string;
      tertiary: string;
    };
  };
  demo: {
    title: string;
    description: string;
  };
  install: {
    eyebrow: string;
    title: string;
    intro: string;
    whatToTypeLabel: string;
    installPrompt: string;
    afterSetup: string;
    manualToggleLabel: string;
    steps: CursorInstallStep[];
    guideLinkPrefix: string;
    guideLinkLabel: string;
    guideLinkSuffix: string;
  };
  whyItFits: {
    eyebrow: string;
    title: string;
    intro: string;
    cards: {
      title: string;
      description: string;
    }[];
  };
  capabilityGap: {
    eyebrow: string;
    title: string;
    description: string;
    columns: {
      label: string;
      accent?: boolean;
    }[];
    rows: CapabilityGapRow[];
  };
  capabilityCards: {
    title: string;
    cards: CursorSectionCard[];
  };
  modelSelection: {
    title: string;
    introPrefix: string;
    imageModelConnector: string;
    introMiddle: string;
    videoModelConnector: string;
    outro: string;
    cards: CursorModelCard[];
  };
  faq: {
    title: string;
    items: CursorFaqItem[];
  };
  siblingAgents: {
    eyebrow: string;
    labels: {
      label: string;
      href: string;
    }[];
    ctas: {
      primary: string;
      secondary: string;
      tertiary: string;
    };
    footerNote: string;
  };
};

const englishContent: CursorPageContent = {
  metadata: {
    title: "Cursor tools for image, video, and vision | AnyCap",
    description:
      "Tell Cursor \u2018help me install anycap.ai\u2019 and it handles the rest \u2014 skill discovery, CLI install, and immediate access to image generation, video generation, and vision.",
    openGraphTitle: "Cursor tools for image, video, and vision | AnyCap",
    openGraphDescription:
      "Tell Cursor \u2018help me install anycap.ai\u2019 and it handles the rest \u2014 skill discovery, CLI install, and immediate access to image generation, video generation, and vision.",
    articleHeadline: "Cursor tools for image, video, and vision | AnyCap",
    articleDescription:
      "Guide to adding image generation, video generation, image understanding, and video analysis to Cursor through one capability runtime.",
    articleAbout: ["Cursor", "AnyCap CLI", "agent skills", "capability runtime"],
    articleKeywords: [
      "cursor tools",
      "add tools to cursor",
      "cursor capabilities",
      "cursor image generation",
      "cursor video generation",
      "cursor image understanding",
      "cursor video analysis",
    ],
  },
  breadcrumbItems: [
    { name: "Home", href: "/" },
    { name: "Equip Agents", href: "/for", unlinkable: true },
    { name: "Cursor" },
  ],
  pageEyebrow: "For Cursor",
  lastUpdatedLabel: "Last updated April 5, 2026",
  hero: {
    titleLine1: "Cursor is strong at code and workspace edits.",
    titleLine2: "It still needs image, video, and vision capabilities.",
    videoDescription:
      "Watch Cursor install AnyCap from a natural-language prompt — skill discovery, CLI setup, authentication, and first image generation in one uninterrupted flow.",
    cursorIntroSuffix:
      " is excellent at code generation, refactors, and workspace-aware edits. The gap appears when the workflow needs product visuals, walkthrough videos, screenshot understanding, or recording review — none of those are Cursor tools today.",
    promptSentence:
      'Just tell Cursor what you need — like "help me install anycap.ai". It discovers the skill, installs the CLI, authenticates, and calls the right capability — all inside the same editor and terminal flow, without forcing you into separate provider setups.',
    promptTagline: "Natural language. Zero manual steps. Immediate capabilities.",
    ctas: {
      primary: "Get Started",
      secondary: "Image Generation",
      tertiary: "Video Generation",
    },
  },
  demo: {
    title: "Install and use AnyCap with Cursor",
    description:
      "Watch Cursor install AnyCap from a natural-language prompt — skill discovery, CLI setup, authentication, and first image generation in one uninterrupted flow.",
  },
  install: {
    eyebrow: "Get started",
    title: 'Tell Cursor "help me install anycap.ai". Done.',
    intro:
      "Cursor can discover the AnyCap skill, install the CLI, authenticate, and invoke capabilities on its own. Just describe the task in natural language — Cursor runs the setup and starts delivering results in the same workspace flow. No multi-provider wiring required.",
    whatToTypeLabel: "What to type in Cursor",
    installPrompt: "help me install anycap.ai",
    afterSetup:
      'After setup, tell Cursor something like "generate a product mockup image" — it will call anycap image generate automatically. If you want direct command control instead, open the manual install steps below.',
    manualToggleLabel: "Prefer to install manually? Here are the three steps.",
    steps: [
      {
        title: "Install the skill",
        subtitle: "Step 1",
        code: "npx -y skills add anycap-ai/anycap -a cursor -y",
        note:
          "This teaches Cursor how to discover and call the AnyCap runtime without changing the way you already work.",
      },
      {
        title: "Install the CLI",
        subtitle: "Step 2",
        code: "curl -fsSL https://anycap.ai/install.sh | sh",
        note:
          "The CLI is a single binary with no runtime dependencies, so it runs cleanly inside Cursor's integrated terminal.",
      },
      {
        title: "Log in and verify",
        subtitle: "Step 3",
        code: "anycap login && anycap status",
        note:
          "After authentication, Cursor can move across image, video, and vision capabilities without new credentials or dashboard detours.",
      },
    ],
    guideLinkPrefix: "For a full walkthrough, see the ",
    guideLinkLabel: "install guide",
    guideLinkSuffix: ".",
  },
  whyItFits: {
    eyebrow: "Why it fits",
    title: "Built for the way Cursor already works",
    intro:
      "AnyCap installs cleanly into Cursor because it was designed for the same constraints: editor-driven workflows, integrated terminal execution, and project-based context.",
    cards: [
      {
        title: "Integrated terminal execution",
        description:
          "Cursor already works through code plus terminal. The AnyCap CLI is a dependency-free binary that installs and authenticates in that same terminal session, so capabilities are available without leaving the editor flow.",
      },
      {
        title: "Workspace-aware outputs",
        description:
          "Cursor has direct access to your repo and surrounding files. AnyCap returns file paths and CDN URLs that Cursor can save into project directories, thread into docs, or pass to downstream scripts and build steps.",
      },
      {
        title: "One credential, every capability",
        description:
          "Without a runtime layer, adding image generation, video generation, and vision means separate provider credentials inside the same project workflow. AnyCap consolidates them into one login that covers the full stack.",
      },
    ],
  },
  capabilityGap: {
    eyebrow: "Capability gap",
    title: "What you get after one skill install",
    description:
      "Cursor stays focused on code and workspace edits while AnyCap fills the generation, analysis, search, storage, and publishing gaps that sit outside its built-in surface area.",
    columns: [
      { label: "Cursor alone" },
      { label: "Add with AnyCap", accent: true },
      { label: "Best next step" },
    ],
    rows: [
      {
        capability: "Image generation",
        cells: [
          { label: "No image output from terminal", tone: "muted" },
          { label: "Generate visuals and mockups via anycap image generate", tone: "accent" },
          { label: "Image Generation page", href: "/capabilities/image-generation" },
        ],
      },
      {
        capability: "Video generation",
        cells: [
          { label: "No video tooling in CLI workflow", tone: "muted" },
          { label: "Create walkthroughs and clips via anycap video generate", tone: "accent" },
          { label: "Video Generation page", href: "/capabilities/video-generation" },
        ],
      },
      {
        capability: "Music generation",
        cells: [
          { label: "No music generation in CLI workflow", tone: "muted" },
          { label: "Create background tracks through the AnyCap music runtime", tone: "accent" },
          { label: "Music Generation page", href: "/capabilities/music-generation" },
        ],
      },
      {
        capability: "Image understanding",
        cells: [
          { label: "No unified vision runtime", tone: "muted" },
          { label: "Read screenshots, diagrams, and visual references", tone: "accent" },
          { label: "Image Understanding page", href: "/capabilities/image-understanding" },
        ],
      },
      {
        capability: "Video analysis",
        cells: [
          { label: "Requires separate provider setup", tone: "muted" },
          { label: "Inspect recordings from the same CLI", tone: "accent" },
          { label: "Video Analysis page", href: "/capabilities/video-analysis" },
        ],
      },
      {
        capability: "Audio understanding",
        cells: [
          { label: "No unified audio analysis runtime", tone: "muted" },
          { label: "Transcribe and analyze audio through one runtime", tone: "accent" },
          { label: "Audio Understanding page", href: "/capabilities/audio-understanding" },
        ],
      },
      {
        capability: "Web search",
        cells: [
          { label: "Search depends on external tooling", tone: "muted" },
          { label: "Search the web from the same capability layer", tone: "accent" },
          { label: "Web Search page", href: "/capabilities/web-search" },
        ],
      },
      {
        capability: "Grounded web search",
        cells: [
          { label: "No grounded search flow in task loop", tone: "muted" },
          { label: "Run grounded search when the answer needs citations", tone: "accent" },
          { label: "Grounded Web Search page", href: "/capabilities/grounded-web-search" },
        ],
      },
      {
        capability: "Web crawl",
        cells: [
          { label: "No reusable crawl runtime", tone: "muted" },
          { label: "Crawl pages and extract content from one CLI", tone: "accent" },
          { label: "Web Crawl page", href: "/capabilities/web-crawl" },
        ],
      },
      {
        capability: "Drive storage",
        cells: [
          { label: "No shared asset storage layer", tone: "muted" },
          { label: "Store outputs with public URLs in AnyCap Drive", tone: "accent" },
          { label: "Pricing page", href: "/pricing" },
        ],
      },
      {
        capability: "Page hosting",
        cells: [
          { label: "No built-in page publishing surface", tone: "muted" },
          { label: "Publish simple pages through AnyCap Page", tone: "accent" },
          { label: "Pricing page", href: "/pricing" },
        ],
      },
      {
        capability: "One auth flow",
        cells: [
          { label: "Per-provider credential management", tone: "muted" },
          { label: "One login across the capability stack", tone: "accent" },
          { label: "Get Started page", href: "/start" },
        ],
      },
    ],
  },
  capabilityCards: {
    title: "Start with the first missing capability",
    cards: [
      {
        eyebrow: "Creative output",
        title: "Image Generation",
        href: "/capabilities/image-generation",
        summary: "Best next page when Cursor needs visuals, mockups, launch assets, or other image output.",
        command: "anycap image generate",
      },
      {
        eyebrow: "Motion output",
        title: "Video Generation",
        href: "/capabilities/video-generation",
        summary: "Best next page when Cursor needs demos, walkthroughs, or short-form video output.",
        command: "anycap video generate",
      },
      {
        eyebrow: "Vision",
        title: "Image Understanding",
        href: "/capabilities/image-understanding",
        summary: "Best next page when Cursor needs to interpret screenshots, diagrams, OCR, or design feedback.",
        command: "anycap image read",
      },
      {
        eyebrow: "Analysis",
        title: "Video Analysis",
        href: "/capabilities/video-analysis",
        summary: "Best next page when Cursor needs to inspect recordings and extract structured details.",
        command: "anycap video read",
      },
    ],
  },
  modelSelection: {
    title: "Then pick the model, not just the capability",
    introPrefix:
      "Cursor users often search for model comparisons, not just capabilities. The image choice is usually ",
    imageModelConnector: " vs ",
    introMiddle: ", while video choice is often ",
    videoModelConnector: " vs ",
    outro: ". These guides help Cursor pick the right model before it calls the CLI.",
    cards: [
      {
        eyebrow: "Image model",
        title: "Seedream 5",
        href: "/models/seedream-5",
        summary: "Best first-pass image model for polished Cursor mockups, launch visuals, and cleaner visual concepts.",
        comparison: "Compare with Nano Banana 2 when the question is speed vs polish.",
      },
      {
        eyebrow: "Image model",
        title: "Nano Banana 2",
        href: "/models/nano-banana-2",
        summary: "Best for fast iteration when Cursor needs many visual variants or repeated content generation.",
        comparison: "Compare with Seedream 5 and Nano Banana Pro for workflow fit.",
      },
      {
        eyebrow: "Video model",
        title: "Veo 3.1",
        href: "/models/veo-3-1",
        summary: "Best premium video model for Cursor when the task needs high-end cinematic output.",
        comparison: "Compare with Kling 3.0 and Seedance 1.5 Pro for motion style and workflow tradeoffs.",
      },
    ],
  },
  faq: {
    title: "FAQ",
    items: [
      {
        question: "Can Cursor generate images on its own?",
        answer:
          "No. Cursor is excellent at coding, refactoring, and workspace-aware edits, but it does not ship with a built-in image generation runtime. AnyCap adds that capability through one skill install and one CLI, so Cursor can produce visuals without leaving the editor and terminal workflow you already use.",
      },
      {
        question: "Why use AnyCap instead of wiring providers directly?",
        answer:
          "Wiring a separate image API, a video API, and a vision API into Cursor means managing multiple SDKs, credentials, and prompts across the same project. AnyCap consolidates those into one CLI and one login, so Cursor gets one capability layer instead of several disconnected provider setups.",
      },
      {
        question: "Does AnyCap replace Cursor?",
        answer:
          "No. AnyCap is not an IDE or coding agent. It is a capability runtime that runs alongside Cursor. You keep Cursor for code, planning, and editing, and add the image, video, and vision tools it does not ship with.",
      },
      {
        question: "What is the fastest path to add tools to Cursor?",
        answer:
          'Just tell Cursor what you need in natural language, such as "help me install anycap.ai". It can discover the skill, install the CLI, authenticate, and call the right capability automatically. If you prefer manual control, you can still use the three-step install path below.',
      },
      {
        question: "Does AnyCap work inside the Cursor workflow?",
        answer:
          "Yes. The AnyCap CLI is a single binary with no external dependencies. It runs in Cursor's integrated terminal, sends API requests to the AnyCap server, and returns file paths or URLs that Cursor can use in follow-up steps, save into your project, or pass to downstream tooling.",
      },
      {
        question: "Which image model fits Cursor best: Seedream 5, Nano Banana 2, or Nano Banana Pro?",
        answer:
          "For Cursor workflows, Seedream 5 is the stronger first-pass image model, Nano Banana 2 is the faster option for high-volume iteration, and Nano Banana Pro is the better fit when the workflow starts from an existing image and needs targeted revisions.",
      },
      {
        question: "Which video model fits Cursor best: Veo 3.1, Kling 3.0, or Seedance 1.5 Pro?",
        answer:
          "For Cursor, Veo 3.1 is the premium default, Kling 3.0 is a good fit for more cinematic motion, and Seedance 1.5 Pro is a dependable choice for steady image-to-video and production-friendly workflows.",
      },
    ],
  },
  siblingAgents: {
    eyebrow: "Also available for",
    labels: [
      { label: "Claude Code", href: "/for/claude-code" },
      { label: "Codex", href: "/for/codex" },
      { label: "Manus", href: "/for/manus" },
    ],
    ctas: {
      primary: "Get Started",
      secondary: "Why One CLI Matters",
      tertiary: "How Skills Fit",
    },
    footerNote: "Last updated Apr 2026",
  },
};

const ptBrContent: CursorPageContent = {
  metadata: {
    title: "Ferramentas do Cursor para imagem, vídeo e visão | AnyCap",
    description:
      'Diga ao Cursor "help me install anycap.ai" e ele cuida do resto — descoberta da skill, instalação da CLI, autenticação e acesso imediato a geração de imagem, geração de vídeo, entendimento de imagem e análise de vídeo por meio de linguagem natural.',
    openGraphTitle: "Ferramentas do Cursor para imagem, vídeo e visão | AnyCap",
    openGraphDescription:
      'Diga ao Cursor "help me install anycap.ai" e ele cuida do resto — descoberta da skill, instalação da CLI, autenticação e acesso imediato a geração de imagem, geração de vídeo, entendimento de imagem e análise de vídeo por meio de linguagem natural.',
    articleHeadline: "Ferramentas do Cursor para imagem, vídeo e visão | AnyCap",
    articleDescription:
      "Guia de capability para adicionar geração de imagem, geração de vídeo, entendimento de imagem e análise de vídeo ao Cursor por meio de um único runtime de capacidades.",
    articleAbout: ["Cursor", "CLI do AnyCap", "skills de agente", "runtime de capacidades"],
    articleKeywords: [
      "ferramentas do cursor",
      "adicionar ferramentas ao cursor",
      "capacidades do cursor",
      "geracao de imagem cursor",
      "geracao de video cursor",
      "entendimento de imagem cursor",
      "analise de video cursor",
    ],
  },
  breadcrumbItems: [
    { name: "Início", href: "/" },
    { name: "Equipar agentes", href: "/for", unlinkable: true },
    { name: "Cursor" },
  ],
  pageEyebrow: "Para Cursor",
  lastUpdatedLabel: "Atualizado em 5 de abril de 2026",
  hero: {
    titleLine1: "O Cursor é forte em código e edições no workspace.",
    titleLine2: "Mas ainda precisa de capacidades de imagem, vídeo e visão.",
    videoDescription:
      "Veja o Cursor instalar o AnyCap a partir de um prompt em linguagem natural — descoberta da skill, configuração da CLI, autenticação e primeira geração de imagem em um fluxo contínuo.",
    cursorIntroSuffix:
      " é excelente em geração de código, refatorações e edições com contexto do workspace. A lacuna aparece quando o fluxo precisa de visuais de produto, vídeos de walkthrough, entendimento de screenshots ou revisão de gravações — e nenhum desses recursos vem pronto no Cursor hoje.",
    promptSentence:
      'Basta dizer ao Cursor o que você precisa — como "help me install anycap.ai". Ele descobre a skill, instala a CLI, autentica e chama a capability certa — tudo dentro do mesmo fluxo de editor e terminal, sem obrigar você a montar setups separados de provedores.',
    promptTagline: "Linguagem natural. Zero passos manuais. Capacidades imediatas.",
    ctas: {
      primary: "Começar",
      secondary: "Geração de imagem",
      tertiary: "Geração de vídeo",
    },
  },
  demo: {
    title: "Instale e use o AnyCap com o Cursor",
    description:
      "Veja o Cursor instalar o AnyCap a partir de um prompt em linguagem natural — descoberta da skill, configuração da CLI, autenticação e primeira geração de imagem em um fluxo contínuo.",
  },
  install: {
    eyebrow: "Começar",
    title: 'Diga ao Cursor "help me install anycap.ai". Pronto.',
    intro:
      "O Cursor consegue descobrir a skill do AnyCap, instalar a CLI, autenticar e invocar capabilities por conta própria. Basta descrever a tarefa em linguagem natural — o Cursor executa a configuração e começa a entregar resultados no mesmo fluxo de workspace. Sem precisar conectar vários provedores.",
    whatToTypeLabel: "O que digitar no Cursor",
    installPrompt: "help me install anycap.ai",
    afterSetup:
      'Depois da configuração, diga algo como "generate a product mockup image" — o Cursor vai chamar anycap image generate automaticamente. Se você quiser controle direto por comando, abra as etapas manuais abaixo.',
    manualToggleLabel: "Prefere instalar manualmente? Aqui estão os três passos.",
    steps: [
      {
        title: "Instalar a skill",
        subtitle: "Passo 1",
        code: "npx -y skills add anycap-ai/anycap -a cursor -y",
        note:
          "Isso ensina o Cursor a descobrir e chamar o runtime do AnyCap sem mudar a forma como você já trabalha.",
      },
      {
        title: "Instalar a CLI",
        subtitle: "Passo 2",
        code: "curl -fsSL https://anycap.ai/install.sh | sh",
        note:
          "A CLI é um binário único, sem dependências de runtime, então roda com limpeza no terminal integrado do Cursor.",
      },
      {
        title: "Fazer login e verificar",
        subtitle: "Passo 3",
        code: "anycap login && anycap status",
        note:
          "Depois da autenticação, o Cursor consegue circular entre capacidades de imagem, vídeo e visão sem novas credenciais ou desvios para painel.",
      },
    ],
    guideLinkPrefix: "Para ver o passo a passo completo, consulte o ",
    guideLinkLabel: "guia de instalação",
    guideLinkSuffix: ".",
  },
  whyItFits: {
    eyebrow: "Por que funciona",
    title: "Feito para a forma como o Cursor já funciona",
    intro:
      "O AnyCap se instala bem no Cursor porque foi projetado para as mesmas restrições: fluxos guiados pelo editor, execução integrada no terminal e contexto baseado no projeto.",
    cards: [
      {
        title: "Execução integrada no terminal",
        description:
          "O Cursor já trabalha através de código + terminal. A CLI do AnyCap é um binário sem dependências que instala e autentica na mesma sessão do terminal, então as capacidades ficam disponíveis sem sair do fluxo do editor.",
      },
      {
        title: "Saídas com contexto do workspace",
        description:
          "O Cursor já tem acesso direto ao seu repositório e aos arquivos ao redor. O AnyCap devolve caminhos de arquivo e URLs de CDN que o Cursor pode salvar em diretórios do projeto, amarrar em docs ou repassar para scripts e etapas seguintes.",
      },
      {
        title: "Uma credencial, todas as capacidades",
        description:
          "Sem uma camada de runtime, adicionar geração de imagem, geração de vídeo e visão significa lidar com credenciais separadas de provedores dentro do mesmo fluxo de projeto. O AnyCap consolida tudo em um único login que cobre a pilha inteira.",
      },
    ],
  },
  capabilityGap: {
    eyebrow: "Lacuna de capacidades",
    title: "O que você ganha após uma instalação de skill",
    description:
      "O Cursor continua focado em código e edições no workspace enquanto o AnyCap cobre as lacunas de geração, análise, busca, armazenamento e publicação que ficam fora da superfície nativa dele.",
    columns: [
      { label: "Cursor sozinho" },
      { label: "Adicione com o AnyCap", accent: true },
      { label: "Melhor próximo passo" },
    ],
    rows: [
      {
        capability: "Geração de imagem",
        cells: [
          { label: "Sem saída de imagem no terminal", tone: "muted" },
          { label: "Gere visuais e mockups com anycap image generate", tone: "accent" },
          { label: "Página de geração de imagem", href: "/capabilities/image-generation" },
        ],
      },
      {
        capability: "Geração de vídeo",
        cells: [
          { label: "Sem ferramentas de vídeo no fluxo da CLI", tone: "muted" },
          { label: "Crie walkthroughs e clipes com anycap video generate", tone: "accent" },
          { label: "Página de geração de vídeo", href: "/capabilities/video-generation" },
        ],
      },
      {
        capability: "Geração de música",
        cells: [
          { label: "Sem geração de música no fluxo da CLI", tone: "muted" },
          { label: "Crie trilhas de fundo com o runtime de música do AnyCap", tone: "accent" },
          { label: "Página de geração de música", href: "/capabilities/music-generation" },
        ],
      },
      {
        capability: "Entendimento de imagem",
        cells: [
          { label: "Sem runtime unificado de visão", tone: "muted" },
          { label: "Leia screenshots, diagramas e referências visuais", tone: "accent" },
          { label: "Página de entendimento de imagem", href: "/capabilities/image-understanding" },
        ],
      },
      {
        capability: "Análise de vídeo",
        cells: [
          { label: "Precisa de configuração separada de provedor", tone: "muted" },
          { label: "Inspecione gravações a partir da mesma CLI", tone: "accent" },
          { label: "Página de análise de vídeo", href: "/capabilities/video-analysis" },
        ],
      },
      {
        capability: "Entendimento de áudio",
        cells: [
          { label: "Sem runtime unificado de análise de áudio", tone: "muted" },
          { label: "Transcreva e analise áudio por meio de um único runtime", tone: "accent" },
          { label: "Página de entendimento de áudio", href: "/capabilities/audio-understanding" },
        ],
      },
      {
        capability: "Busca na web",
        cells: [
          { label: "A busca depende de ferramentas externas", tone: "muted" },
          { label: "Pesquise a web a partir da mesma camada de capability", tone: "accent" },
          { label: "Página de busca na web", href: "/capabilities/web-search" },
        ],
      },
      {
        capability: "Busca na web com grounding",
        cells: [
          { label: "Sem fluxo de busca com grounding no loop da tarefa", tone: "muted" },
          { label: "Execute grounded search quando a resposta precisar de citações", tone: "accent" },
          { label: "Página de busca na web com grounding", href: "/capabilities/grounded-web-search" },
        ],
      },
      {
        capability: "Crawling da web",
        cells: [
          { label: "Sem runtime reutilizável de crawl", tone: "muted" },
          { label: "Faça crawl de páginas e extraia conteúdo por meio de uma única CLI", tone: "accent" },
          { label: "Página de crawling da web", href: "/capabilities/web-crawl" },
        ],
      },
      {
        capability: "Armazenamento no Drive",
        cells: [
          { label: "Sem camada compartilhada de armazenamento de assets", tone: "muted" },
          { label: "Guarde saídas com URLs públicas no AnyCap Drive", tone: "accent" },
          { label: "Página de preços", href: "/pricing" },
        ],
      },
      {
        capability: "Hospedagem de páginas",
        cells: [
          { label: "Sem superfície nativa para publicar páginas", tone: "muted" },
          { label: "Publique páginas simples por meio do AnyCap Page", tone: "accent" },
          { label: "Página de preços", href: "/pricing" },
        ],
      },
      {
        capability: "Um fluxo de autenticação",
        cells: [
          { label: "Gerenciamento de credenciais por provedor", tone: "muted" },
          { label: "Um login para toda a pilha de capacidades", tone: "accent" },
          { label: "Página de começar", href: "/start" },
        ],
      },
    ],
  },
  capabilityCards: {
    title: "Comece pela primeira capacidade que falta",
    cards: [
      {
        eyebrow: "Saída criativa",
        title: "Geração de imagem",
        href: "/capabilities/image-generation",
        summary: "Melhor próxima página quando o Cursor precisa de visuais, mockups, assets de lançamento ou qualquer outra saída de imagem.",
        command: "anycap image generate",
      },
      {
        eyebrow: "Saída em movimento",
        title: "Geração de vídeo",
        href: "/capabilities/video-generation",
        summary: "Melhor próxima página quando o Cursor precisa de demos, walkthroughs ou saída de vídeo curta.",
        command: "anycap video generate",
      },
      {
        eyebrow: "Visão",
        title: "Entendimento de imagem",
        href: "/capabilities/image-understanding",
        summary: "Melhor próxima página quando o Cursor precisa interpretar screenshots, diagramas, OCR ou feedback de design.",
        command: "anycap image read",
      },
      {
        eyebrow: "Análise",
        title: "Análise de vídeo",
        href: "/capabilities/video-analysis",
        summary: "Melhor próxima página quando o Cursor precisa inspecionar gravações e extrair detalhes estruturados.",
        command: "anycap video read",
      },
    ],
  },
  modelSelection: {
    title: "Depois escolha o modelo, não apenas a capacidade",
    introPrefix:
      "Usuários do Cursor costumam procurar comparações de modelos, não apenas capabilities. A escolha de imagem costuma ser ",
    imageModelConnector: " vs ",
    introMiddle: ", enquanto a escolha de vídeo costuma ser ",
    videoModelConnector: " vs ",
    outro: ". Esses guias ajudam o Cursor a escolher o modelo certo antes de chamar a CLI.",
    cards: [
      {
        eyebrow: "Modelo de imagem",
        title: "Seedream 5",
        href: "/models/seedream-5",
        summary: "Melhor modelo de imagem para primeira passagem, com mockups polidos, visuais de lançamento e conceitos visuais mais limpos.",
        comparison: "Compare com Nano Banana 2 quando a dúvida for velocidade versus acabamento.",
      },
      {
        eyebrow: "Modelo de imagem",
        title: "Nano Banana 2",
        href: "/models/nano-banana-2",
        summary: "Melhor para iteração rápida quando o Cursor precisa de muitas variantes visuais ou geração repetida de conteúdo.",
        comparison: "Compare com Seedream 5 e Nano Banana Pro para avaliar o encaixe no fluxo.",
      },
      {
        eyebrow: "Modelo de vídeo",
        title: "Veo 3.1",
        href: "/models/veo-3-1",
        summary: "Melhor modelo de vídeo premium para o Cursor quando a tarefa exige saída cinematográfica de alto nível.",
        comparison: "Compare com Kling 3.0 e Seedance 1.5 Pro para estilo de movimento e trade-offs de workflow.",
      },
    ],
  },
  faq: {
    title: "Perguntas frequentes",
    items: [
      {
        question: "O Cursor consegue gerar imagens sozinho?",
        answer:
          "Não. O Cursor é excelente em código, refatoração e edições com contexto do workspace, mas não vem com um runtime nativo de geração de imagem. O AnyCap adiciona essa capability com uma instalação de skill e uma CLI, então o Cursor consegue produzir visuais sem sair do editor e do terminal que você já usa.",
      },
      {
        question: "Por que usar o AnyCap em vez de ligar os provedores diretamente?",
        answer:
          "Ligar uma API separada de imagem, uma API de vídeo e uma API de visão ao Cursor significa gerenciar vários SDKs, credenciais e prompts no mesmo projeto. O AnyCap consolida tudo em uma CLI e um login, então o Cursor ganha uma única camada de capabilities em vez de vários setups desconectados de provedor.",
      },
      {
        question: "O AnyCap substitui o Cursor?",
        answer:
          "Não. O AnyCap não é um IDE nem um agente de código. Ele é um runtime de capabilities que roda ao lado do Cursor. Você continua usando o Cursor para código, planejamento e edição, e adiciona as ferramentas de imagem, vídeo e visão que ele não traz pronto.",
      },
      {
        question: "Qual é o caminho mais rápido para adicionar tools ao Cursor?",
        answer:
          'Basta dizer ao Cursor o que você precisa em linguagem natural, como "help me install anycap.ai". Ele pode descobrir a skill, instalar a CLI, autenticar e chamar a capability certa automaticamente. Se você preferir controle manual, o caminho em três etapas continua disponível logo abaixo.',
      },
      {
        question: "O AnyCap funciona dentro do workflow do Cursor?",
        answer:
          "Sim. A CLI do AnyCap é um binário único, sem dependências externas. Ela roda no terminal integrado do Cursor, envia solicitações de API ao servidor AnyCap e devolve caminhos de arquivo ou URLs que o Cursor pode usar nas próximas etapas, salvar no projeto ou passar para ferramentas seguintes.",
      },
      {
        question: "Qual modelo de imagem combina melhor com o Cursor: Seedream 5, Nano Banana 2 ou Nano Banana Pro?",
        answer:
          "Para fluxos no Cursor, o Seedream 5 é o modelo de imagem mais forte para a primeira passagem, o Nano Banana 2 é a opção mais rápida para iteração em volume alto, e o Nano Banana Pro é a melhor escolha quando o fluxo começa com uma imagem existente e precisa de revisões direcionadas.",
      },
      {
        question: "Qual modelo de vídeo combina melhor com o Cursor: Veo 3.1, Kling 3.0 ou Seedance 1.5 Pro?",
        answer:
          "Para o Cursor, o Veo 3.1 é o padrão premium, o Kling 3.0 se encaixa bem em movimento mais cinematográfico, e o Seedance 1.5 Pro é uma opção confiável para image-to-video estável e fluxos mais amigáveis à produção.",
      },
    ],
  },
  siblingAgents: {
    eyebrow: "Também disponível para",
    labels: [
      { label: "Claude Code", href: "/for/claude-code" },
      { label: "Codex", href: "/for/codex" },
      { label: "Manus", href: "/for/manus" },
    ],
    ctas: {
      primary: "Começar",
      secondary: "Por que uma CLI importa",
      tertiary: "Como as skills se encaixam",
    },
    footerNote: "Atualizado em abr. de 2026",
  },
};

const idContent: CursorPageContent = {
  metadata: {
    title: "Alat Cursor untuk gambar, video, dan visi | AnyCap",
    description:
      'Katakan pada Cursor "help me install anycap.ai" dan sisanya ditangani — penemuan skill, instalasi CLI, autentikasi, serta akses langsung ke pembuatan gambar, pembuatan video, pemahaman gambar, dan analisis video lewat bahasa alami.',
    openGraphTitle: "Alat Cursor untuk gambar, video, dan visi | AnyCap",
    openGraphDescription:
      'Katakan pada Cursor "help me install anycap.ai" dan sisanya ditangani — penemuan skill, instalasi CLI, autentikasi, serta akses langsung ke pembuatan gambar, pembuatan video, pemahaman gambar, dan analisis video lewat bahasa alami.',
    articleHeadline: "Alat Cursor untuk gambar, video, dan visi | AnyCap",
    articleDescription:
      "Panduan menambahkan pembuatan gambar, pembuatan video, pemahaman gambar, dan analisis video ke Cursor melalui satu runtime kemampuan.",
    articleAbout: ["Cursor", "CLI AnyCap", "skill agen", "runtime kemampuan"],
    articleKeywords: [
      "alat cursor",
      "menambahkan alat ke cursor",
      "kemampuan cursor",
      "cursor pembuatan gambar",
      "cursor pembuatan video",
      "cursor pemahaman gambar",
      "cursor analisis video",
    ],
  },
  breadcrumbItems: [
    { name: "Beranda", href: "/" },
    { name: "Lengkapi agen", href: "/for", unlinkable: true },
    { name: "Cursor" },
  ],
  pageEyebrow: "Untuk Cursor",
  lastUpdatedLabel: "Terakhir diperbarui 5 April 2026",
  hero: {
    titleLine1: "Cursor kuat untuk kode dan pengeditan workspace.",
    titleLine2: "Namun masih membutuhkan kemampuan gambar, video, dan visi.",
    videoDescription:
      "Lihat Cursor memasang AnyCap dari perintah bahasa alami — penemuan skill, pengaturan CLI, autentikasi, dan pembuatan gambar pertama dalam satu alur tanpa putus.",
    cursorIntroSuffix:
      " unggul dalam pembuatan kode, refaktor, dan pengeditan yang memahami workspace. Celah muncul saat alur kerja butuh visual produk, video panduan, pemahaman tangkapan layar, atau tinjauan rekaman — semuanya belum menjadi alat bawaan Cursor hari ini.",
    promptSentence:
      'Cukup katakan ke Cursor apa yang dibutuhkan — misalnya "help me install anycap.ai". Cursor menemukan skill, memasang CLI, mengautentikasi, dan memanggil kemampuan yang tepat — semuanya dalam alur editor dan terminal yang sama, tanpa memaksa pengaturan terpisah per penyedia.',
    promptTagline: "Bahasa alami. Tanpa langkah manual. Kemampuan langsung siap.",
    ctas: {
      primary: "Mulai",
      secondary: "Pembuatan gambar",
      tertiary: "Pembuatan video",
    },
  },
  demo: {
    title: "Pasang dan gunakan AnyCap dengan Cursor",
    description:
      "Lihat Cursor memasang AnyCap dari perintah bahasa alami — penemuan skill, pengaturan CLI, autentikasi, dan pembuatan gambar pertama dalam satu alur tanpa putus.",
  },
  install: {
    eyebrow: "Memulai",
    title: 'Katakan pada Cursor "help me install anycap.ai". Selesai.',
    intro:
      "Cursor dapat menemukan skill AnyCap, memasang CLI, mengautentikasi, dan memanggil kemampuan sendiri. Cukup jelaskan tugas dalam bahasa alami — Cursor menjalankan pengaturan dan mulai mengirimkan hasil dalam alur workspace yang sama. Tidak perlu menyambungkan banyak penyedia.",
    whatToTypeLabel: "Yang diketik di Cursor",
    installPrompt: "help me install anycap.ai",
    afterSetup:
      'Setelah pengaturan, katakan pada Cursor misalnya "generate a product mockup image" — Cursor akan memanggil anycap image generate secara otomatis. Jika ingin kendali perintah langsung, buka langkah pemasangan manual di bawah.',
    manualToggleLabel: "Lebih suka memasang manual? Berikut tiga langkahnya.",
    steps: [
      {
        title: "Pasang skill",
        subtitle: "Langkah 1",
        code: "npx -y skills add anycap-ai/anycap -a cursor -y",
        note:
          "Ini mengajarkan Cursor cara menemukan dan memanggil runtime AnyCap tanpa mengubah cara kerja yang sudah biasa digunakan.",
      },
      {
        title: "Pasang CLI",
        subtitle: "Langkah 2",
        code: "curl -fsSL https://anycap.ai/install.sh | sh",
        note:
          "CLI adalah satu biner tanpa dependensi runtime, sehingga berjalan rapi di terminal terintegrasi Cursor.",
      },
      {
        title: "Masuk dan verifikasi",
        subtitle: "Langkah 3",
        code: "anycap login && anycap status",
        note:
          "Setelah autentikasi, Cursor dapat berpindah antar kemampuan gambar, video, dan visi tanpa kredensial baru atau putar ke dasbor.",
      },
    ],
    guideLinkPrefix: "Untuk panduan lengkap, lihat ",
    guideLinkLabel: "panduan pemasangan",
    guideLinkSuffix: ".",
  },
  whyItFits: {
    eyebrow: "Mengapa cocok",
    title: "Dirancang untuk cara Cursor bekerja",
    intro:
      "AnyCap terpasang rapi di Cursor karena dirancang untuk batasan yang sama: alur berbasis editor, eksekusi di terminal terintegrasi, dan konteks berbasis proyek.",
    cards: [
      {
        title: "Eksekusi di terminal terintegrasi",
        description:
          "Cursor sudah bekerja lewat kode plus terminal. CLI AnyCap adalah biner tanpa dependensi yang terpasang dan terautentikasi di sesi terminal yang sama, sehingga kemampuan tersedia tanpa keluar dari alur editor.",
      },
      {
        title: "Keluaran yang memahami workspace",
        description:
          "Cursor punya akses langsung ke repositori dan file sekitarnya. AnyCap mengembalikan path file dan URL CDN yang bisa disimpan ke folder proyek, dirangkai ke dokumentasi, atau diteruskan ke skrip dan langkah build berikutnya.",
      },
      {
        title: "Satu kredensial, semua kemampuan",
        description:
          "Tanpa lapisan runtime, menambahkan pembuatan gambar, video, dan visi berarti mengelola kredensial penyedia terpisah dalam alur proyek yang sama. AnyCap menyatukannya dalam satu login yang mencakup seluruh tumpukan.",
      },
    ],
  },
  capabilityGap: {
    eyebrow: "Celah kemampuan",
    title: "Yang didapat setelah satu pemasangan skill",
    description:
      "Cursor tetap fokus pada kode dan pengeditan workspace sementara AnyCap mengisi celah pembuatan, analisis, pencarian, penyimpanan, dan publikasi di luar area bawaannya.",
    columns: [
      { label: "Cursor saja" },
      { label: "Tambah dengan AnyCap", accent: true },
      { label: "Langkah berikutnya terbaik" },
    ],
    rows: [
      {
        capability: "Pembuatan gambar",
        cells: [
          { label: "Tidak ada keluaran gambar dari terminal", tone: "muted" },
          { label: "Buat visual dan mockup lewat anycap image generate", tone: "accent" },
          { label: "Halaman pembuatan gambar", href: "/capabilities/image-generation" },
        ],
      },
      {
        capability: "Pembuatan video",
        cells: [
          { label: "Tidak ada alat video di alur CLI", tone: "muted" },
          { label: "Buat panduan dan klip lewat anycap video generate", tone: "accent" },
          { label: "Halaman pembuatan video", href: "/capabilities/video-generation" },
        ],
      },
      {
        capability: "Pembuatan musik",
        cells: [
          { label: "Tidak ada pembuatan musik di alur CLI", tone: "muted" },
          { label: "Buat trek latar melalui runtime musik AnyCap", tone: "accent" },
          { label: "Halaman pembuatan musik", href: "/capabilities/music-generation" },
        ],
      },
      {
        capability: "Pemahaman gambar",
        cells: [
          { label: "Tidak ada runtime visi terpadu", tone: "muted" },
          { label: "Baca tangkapan layar, diagram, dan referensi visual", tone: "accent" },
          { label: "Halaman pemahaman gambar", href: "/capabilities/image-understanding" },
        ],
      },
      {
        capability: "Analisis video",
        cells: [
          { label: "Perlu pengaturan penyedia terpisah", tone: "muted" },
          { label: "Periksa rekaman dari CLI yang sama", tone: "accent" },
          { label: "Halaman analisis video", href: "/capabilities/video-analysis" },
        ],
      },
      {
        capability: "Pemahaman audio",
        cells: [
          { label: "Tidak ada runtime analisis audio terpadu", tone: "muted" },
          { label: "Transkrip dan analisis audio lewat satu runtime", tone: "accent" },
          { label: "Halaman pemahaman audio", href: "/capabilities/audio-understanding" },
        ],
      },
      {
        capability: "Pencarian web",
        cells: [
          { label: "Pencarian bergantung pada alat eksternal", tone: "muted" },
          { label: "Cari web dari lapisan kemampuan yang sama", tone: "accent" },
          { label: "Halaman pencarian web", href: "/capabilities/web-search" },
        ],
      },
      {
        capability: "Pencarian web berbasis bukti",
        cells: [
          { label: "Tidak ada alur pencarian berbasis bukti di loop tugas", tone: "muted" },
          { label: "Jalankan grounded search saat jawaban butuh kutipan sumber", tone: "accent" },
          { label: "Halaman pencarian web berbasis bukti", href: "/capabilities/grounded-web-search" },
        ],
      },
      {
        capability: "Perayapan web",
        cells: [
          { label: "Tidak ada runtime crawl yang dapat dipakai ulang", tone: "muted" },
          { label: "Crawl halaman dan ekstrak konten dari satu CLI", tone: "accent" },
          { label: "Halaman perayapan web", href: "/capabilities/web-crawl" },
        ],
      },
      {
        capability: "Penyimpanan Drive",
        cells: [
          { label: "Tidak ada lapisan penyimpanan aset bersama", tone: "muted" },
          { label: "Simpan keluaran dengan URL publik di AnyCap Drive", tone: "accent" },
          { label: "Halaman harga", href: "/pricing" },
        ],
      },
      {
        capability: "Hosting halaman",
        cells: [
          { label: "Tidak ada permukaan publikasi halaman bawaan", tone: "muted" },
          { label: "Terbitkan halaman sederhana lewat AnyCap Page", tone: "accent" },
          { label: "Halaman harga", href: "/pricing" },
        ],
      },
      {
        capability: "Satu alur autentikasi",
        cells: [
          { label: "Kredensial per penyedia terpisah", tone: "muted" },
          { label: "Satu login untuk seluruh tumpukan kemampuan", tone: "accent" },
          { label: "Halaman memulai", href: "/start" },
        ],
      },
    ],
  },
  capabilityCards: {
    title: "Mulai dari kemampuan pertama yang belum ada",
    cards: [
      {
        eyebrow: "Keluaran kreatif",
        title: "Pembuatan gambar",
        href: "/capabilities/image-generation",
        summary:
          "Halaman berikutnya terbaik saat Cursor butuh visual, mockup, aset peluncuran, atau keluaran gambar lainnya.",
        command: "anycap image generate",
      },
      {
        eyebrow: "Keluaran gerak",
        title: "Pembuatan video",
        href: "/capabilities/video-generation",
        summary: "Halaman berikutnya terbaik saat Cursor butuh demo, panduan, atau keluaran video pendek.",
        command: "anycap video generate",
      },
      {
        eyebrow: "Visi",
        title: "Pemahaman gambar",
        href: "/capabilities/image-understanding",
        summary:
          "Halaman berikutnya terbaik saat Cursor perlu menafsirkan tangkapan layar, diagram, OCR, atau umpan balik desain.",
        command: "anycap image read",
      },
      {
        eyebrow: "Analisis",
        title: "Analisis video",
        href: "/capabilities/video-analysis",
        summary: "Halaman berikutnya terbaik saat Cursor perlu memeriksa rekaman dan mengekstrak detail terstruktur.",
        command: "anycap video read",
      },
    ],
  },
  modelSelection: {
    title: "Lalu pilih modelnya, bukan hanya kemampuannya",
    introPrefix:
      "Pengguna Cursor sering mencari perbandingan model, bukan sekadar kemampuan. Pilihan gambar biasanya ",
    imageModelConnector: " vs ",
    introMiddle: ", sementara pilihan video biasanya ",
    videoModelConnector: " vs ",
    outro: ". Panduan ini membantu Cursor memilih model yang tepat sebelum memanggil CLI.",
    cards: [
      {
        eyebrow: "Model gambar",
        title: "Seedream 5",
        href: "/models/seedream-5",
        summary:
          "Model gambar babak pertama terbaik untuk mockup Cursor yang halus, visual peluncuran, dan konsep visual yang lebih bersih.",
        comparison: "Bandingkan dengan Nano Banana 2 saat pertanyaannya kecepatan vs polesan akhir.",
      },
      {
        eyebrow: "Model gambar",
        title: "Nano Banana 2",
        href: "/models/nano-banana-2",
        summary: "Terbaik untuk iterasi cepat saat Cursor butuh banyak varian visual atau pembuatan konten berulang.",
        comparison: "Bandingkan dengan Seedream 5 dan Nano Banana Pro untuk kesesuaian alur kerja.",
      },
      {
        eyebrow: "Model video",
        title: "Veo 3.1",
        href: "/models/veo-3-1",
        summary: "Model video premium terbaik untuk Cursor saat tugas membutuhkan keluaran sinematik kelas atas.",
        comparison: "Bandingkan dengan Kling 3.0 dan Seedance 1.5 Pro untuk gaya gerak dan pertimbangan alur kerja.",
      },
    ],
  },
  faq: {
    title: "Pertanyaan umum",
    items: [
      {
        question: "Apakah Cursor bisa membuat gambar sendiri?",
        answer:
          "Tidak. Cursor sangat baik untuk pengodean, refaktor, dan pengeditan yang memahami workspace, tetapi tidak dilengkapi runtime pembuatan gambar bawaan. AnyCap menambahkan kemampuan itu lewat satu pemasangan skill dan satu CLI, sehingga Cursor dapat menghasilkan visual tanpa keluar dari alur editor dan terminal yang sudah dipakai.",
      },
      {
        question: "Mengapa memakai AnyCap alih-alih menyambungkan penyedia secara langsung?",
        answer:
          "Menyambungkan API gambar, video, dan visi terpisah ke Cursor berarti mengelola banyak SDK, kredensial, dan perintah di proyek yang sama. AnyCap menyatukannya dalam satu CLI dan satu login, sehingga Cursor mendapat satu lapisan kemampuan alih-alih beberapa pengaturan penyedia yang terpisah.",
      },
      {
        question: "Apakah AnyCap menggantikan Cursor?",
        answer:
          "Tidak. AnyCap bukan IDE atau agen pengodean. Ini adalah runtime kemampuan yang berjalan bersama Cursor. Cursor tetap untuk kode, perencanaan, dan pengeditan, sementara alat gambar, video, dan visi yang tidak dibawa Cursor ditambahkan lewat AnyCap.",
      },
      {
        question: "Jalur tercepat untuk menambahkan alat ke Cursor?",
        answer:
          'Cukup katakan ke Cursor apa yang dibutuhkan dalam bahasa alami, misalnya "help me install anycap.ai". Cursor dapat menemukan skill, memasang CLI, mengautentikasi, dan memanggil kemampuan yang tepat secara otomatis. Jika lebih suka kendali manual, jalur tiga langkah di bawah tetap tersedia.',
      },
      {
        question: "Apakah AnyCap berjalan di dalam alur kerja Cursor?",
        answer:
          "Ya. CLI AnyCap adalah satu biner tanpa dependensi eksternal. CLI berjalan di terminal terintegrasi Cursor, mengirim permintaan API ke server AnyCap, dan mengembalikan path file atau URL yang bisa dipakai Cursor di langkah berikutnya, disimpan ke proyek, atau diteruskan ke alat lain.",
      },
      {
        question: "Model gambar mana yang paling cocok untuk Cursor: Seedream 5, Nano Banana 2, atau Nano Banana Pro?",
        answer:
          "Untuk alur di Cursor, Seedream 5 adalah model gambar babak pertama yang lebih kuat, Nano Banana 2 lebih cepat untuk iterasi volume tinggi, dan Nano Banana Pro lebih pas saat alur dimulai dari gambar yang ada dan butuh revisi terarah.",
      },
      {
        question: "Model video mana yang paling cocok untuk Cursor: Veo 3.1, Kling 3.0, atau Seedance 1.5 Pro?",
        answer:
          "Untuk Cursor, Veo 3.1 adalah pilihan premium default, Kling 3.0 cocok untuk gerak yang lebih sinematik, dan Seedance 1.5 Pro andal untuk image-to-video yang stabil dan alur kerja yang ramah produksi.",
      },
    ],
  },
  siblingAgents: {
    eyebrow: "Juga tersedia untuk",
    labels: [
      { label: "Claude Code", href: "/for/claude-code" },
      { label: "Codex", href: "/for/codex" },
      { label: "Manus", href: "/for/manus" },
    ],
    ctas: {
      primary: "Mulai",
      secondary: "Mengapa satu CLI penting",
      tertiary: "Bagaimana skill cocok",
    },
    footerNote: "Terakhir diperbarui Apr 2026",
  },
};

const deContent: CursorPageContent = {
  metadata: {
    title: "Cursor-Tools für Bild, Video und Vision | AnyCap",
    description:
      'Sagen Sie Cursor "hilf mir, anycap.ai zu installieren" und der Rest passiert automatisch – Skill-Discovery, CLI-Installation und sofortiger Zugriff auf Bildgenerierung, Videogenerierung und Vision.',
    openGraphTitle: "Cursor-Tools für Bild, Video und Vision | AnyCap",
    openGraphDescription:
      'Sagen Sie Cursor "hilf mir, anycap.ai zu installieren" und der Rest passiert automatisch – Skill-Discovery, CLI-Installation und sofortiger Zugriff auf Bildgenerierung, Videogenerierung und Vision.',
    articleHeadline: "Cursor-Tools für Bild, Video und Vision | AnyCap",
    articleDescription:
      "Leitfaden, um Bildgenerierung, Videogenerierung, Bildverständnis und Videoanalyse über eine einzige Capability-Runtime zu Cursor hinzuzufügen.",
    articleAbout: ["Cursor", "AnyCap CLI", "Agent-Skills", "Capability-Runtime"],
    articleKeywords: [
      "cursor tools",
      "tools zu cursor hinzufügen",
      "cursor capabilities",
      "cursor bildgenerierung",
      "cursor videogenerierung",
      "cursor bildverständnis",
      "cursor videoanalyse",
    ],
  },
  breadcrumbItems: [
    { name: "Startseite", href: "/" },
    { name: "Agenten ausstatten", href: "/for", unlinkable: true },
    { name: "Cursor" },
  ],
  pageEyebrow: "Für Cursor",
  lastUpdatedLabel: "Zuletzt aktualisiert am 5. April 2026",
  hero: {
    titleLine1: "Cursor ist stark bei Code und Workspace-Edits.",
    titleLine2: "Es fehlen weiterhin Bild-, Video- und Vision-Capabilities.",
    videoDescription:
      "Sehen Sie, wie Cursor AnyCap aus einem Prompt in natürlicher Sprache installiert – Skill-Discovery, CLI-Setup, Authentifizierung und erste Bildgenerierung in einem ununterbrochenen Flow.",
    cursorIntroSuffix:
      " ist hervorragend in Code-Generierung, Refactorings und workspace-bewussten Edits. Die Lücke zeigt sich, sobald der Workflow Produkt-Visuals, Walkthrough-Videos, Screenshot-Verständnis oder Recording-Reviews benötigt – nichts davon ist heute ein Cursor-Tool.",
    promptSentence:
      'Sagen Sie Cursor einfach, was Sie brauchen – etwa "hilf mir, anycap.ai zu installieren". Es findet den Skill, installiert die CLI, authentifiziert sich und ruft die richtige Capability auf – alles im selben Editor- und Terminal-Flow, ohne Sie zu separaten Provider-Setups zu zwingen.',
    promptTagline: "Natürliche Sprache. Keine manuellen Schritte. Sofortige Capabilities.",
    ctas: {
      primary: "Loslegen",
      secondary: "Bildgenerierung",
      tertiary: "Videogenerierung",
    },
  },
  demo: {
    title: "AnyCap mit Cursor installieren und nutzen",
    description:
      "Sehen Sie, wie Cursor AnyCap aus einem Prompt in natürlicher Sprache installiert – Skill-Discovery, CLI-Setup, Authentifizierung und erste Bildgenerierung in einem ununterbrochenen Flow.",
  },
  install: {
    eyebrow: "Loslegen",
    title: 'Sagen Sie Cursor "hilf mir, anycap.ai zu installieren". Fertig.',
    intro:
      "Cursor kann den AnyCap-Skill finden, die CLI installieren, sich authentifizieren und Capabilities eigenständig aufrufen. Beschreiben Sie die Aufgabe einfach in natürlicher Sprache – Cursor führt das Setup aus und liefert Ergebnisse im selben Workspace-Flow. Keine Multi-Provider-Verkabelung nötig.",
    whatToTypeLabel: "Was Sie in Cursor eingeben",
    installPrompt: "hilf mir, anycap.ai zu installieren",
    afterSetup:
      'Nach dem Setup sagen Sie Cursor etwas wie "generiere ein Produkt-Mockup-Bild" – es ruft anycap image generate automatisch auf. Wenn Sie stattdessen direkte Befehlskontrolle möchten, öffnen Sie unten die manuellen Installationsschritte.',
    manualToggleLabel: "Lieber manuell installieren? Hier sind die drei Schritte.",
    steps: [
      {
        title: "Skill installieren",
        subtitle: "Schritt 1",
        code: "npx -y skills add anycap-ai/anycap -a cursor -y",
        note:
          "Damit lernt Cursor, wie es die AnyCap-Runtime entdeckt und aufruft, ohne Ihre Arbeitsweise zu ändern.",
      },
      {
        title: "CLI installieren",
        subtitle: "Schritt 2",
        code: "curl -fsSL https://anycap.ai/install.sh | sh",
        note:
          "Die CLI ist eine einzelne Binary ohne Runtime-Abhängigkeiten und läuft sauber im integrierten Terminal von Cursor.",
      },
      {
        title: "Anmelden und prüfen",
        subtitle: "Schritt 3",
        code: "anycap login && anycap status",
        note:
          "Nach der Authentifizierung kann Cursor zwischen Bild-, Video- und Vision-Capabilities wechseln, ohne neue Credentials oder Dashboard-Umwege.",
      },
    ],
    guideLinkPrefix: "Eine vollständige Anleitung finden Sie im ",
    guideLinkLabel: "Installations-Guide",
    guideLinkSuffix: ".",
  },
  whyItFits: {
    eyebrow: "Warum es passt",
    title: "Gebaut für die Art, wie Cursor bereits arbeitet",
    intro:
      "AnyCap fügt sich sauber in Cursor ein, weil es für dieselben Rahmenbedingungen entworfen wurde: editor-getriebene Workflows, integrierte Terminal-Ausführung und projektbasierten Kontext.",
    cards: [
      {
        title: "Integrierte Terminal-Ausführung",
        description:
          "Cursor arbeitet bereits über Code plus Terminal. Die AnyCap CLI ist eine abhängigkeitsfreie Binary, die in derselben Terminal-Sitzung installiert und authentifiziert wird, sodass Capabilities verfügbar sind, ohne den Editor-Flow zu verlassen.",
      },
      {
        title: "Workspace-bewusste Outputs",
        description:
          "Cursor hat direkten Zugriff auf Ihr Repo und die umliegenden Dateien. AnyCap liefert Dateipfade und CDN-URLs zurück, die Cursor in Projektverzeichnisse speichern, in Dokumente einbetten oder an nachgelagerte Skripte und Build-Schritte weitergeben kann.",
      },
      {
        title: "Ein Credential, alle Capabilities",
        description:
          "Ohne Runtime-Schicht bedeutet das Hinzufügen von Bildgenerierung, Videogenerierung und Vision separate Provider-Credentials im selben Projekt-Workflow. AnyCap konsolidiert sie zu einem einzigen Login, der den gesamten Stack abdeckt.",
      },
    ],
  },
  capabilityGap: {
    eyebrow: "Capability-Lücke",
    title: "Was Sie nach einer einzigen Skill-Installation erhalten",
    description:
      "Cursor bleibt auf Code und Workspace-Edits fokussiert, während AnyCap die Generierungs-, Analyse-, Such-, Speicher- und Publishing-Lücken außerhalb seiner nativen Oberfläche schließt.",
    columns: [
      { label: "Cursor allein" },
      { label: "Mit AnyCap ergänzen", accent: true },
      { label: "Bester nächster Schritt" },
    ],
    rows: [
      {
        capability: "Bildgenerierung",
        cells: [
          { label: "Keine Bildausgabe aus dem Terminal", tone: "muted" },
          { label: "Visuals und Mockups via anycap image generate erzeugen", tone: "accent" },
          { label: "Seite Bildgenerierung", href: "/capabilities/image-generation" },
        ],
      },
      {
        capability: "Videogenerierung",
        cells: [
          { label: "Kein Video-Tooling im CLI-Workflow", tone: "muted" },
          { label: "Walkthroughs und Clips via anycap video generate erstellen", tone: "accent" },
          { label: "Seite Videogenerierung", href: "/capabilities/video-generation" },
        ],
      },
      {
        capability: "Musikgenerierung",
        cells: [
          { label: "Keine Musikgenerierung im CLI-Workflow", tone: "muted" },
          { label: "Hintergrundtracks über die AnyCap-Musik-Runtime erstellen", tone: "accent" },
          { label: "Seite Musikgenerierung", href: "/capabilities/music-generation" },
        ],
      },
      {
        capability: "Bildverständnis",
        cells: [
          { label: "Keine einheitliche Vision-Runtime", tone: "muted" },
          { label: "Screenshots, Diagramme und visuelle Referenzen lesen", tone: "accent" },
          { label: "Seite Bildverständnis", href: "/capabilities/image-understanding" },
        ],
      },
      {
        capability: "Videoanalyse",
        cells: [
          { label: "Erfordert separates Provider-Setup", tone: "muted" },
          { label: "Recordings aus derselben CLI inspizieren", tone: "accent" },
          { label: "Seite Videoanalyse", href: "/capabilities/video-analysis" },
        ],
      },
      {
        capability: "Audioverständnis",
        cells: [
          { label: "Keine einheitliche Audioanalyse-Runtime", tone: "muted" },
          { label: "Audio über eine Runtime transkribieren und analysieren", tone: "accent" },
          { label: "Seite Audioverständnis", href: "/capabilities/audio-understanding" },
        ],
      },
      {
        capability: "Web-Suche",
        cells: [
          { label: "Suche hängt von externem Tooling ab", tone: "muted" },
          { label: "Das Web aus derselben Capability-Schicht durchsuchen", tone: "accent" },
          { label: "Seite Web-Suche", href: "/capabilities/web-search" },
        ],
      },
      {
        capability: "Grounded Web-Suche",
        cells: [
          { label: "Kein Grounded-Search-Flow im Task-Loop", tone: "muted" },
          { label: "Grounded Search ausführen, wenn die Antwort Quellenangaben braucht", tone: "accent" },
          { label: "Seite Grounded Web-Suche", href: "/capabilities/grounded-web-search" },
        ],
      },
      {
        capability: "Web-Crawl",
        cells: [
          { label: "Keine wiederverwendbare Crawl-Runtime", tone: "muted" },
          { label: "Seiten crawlen und Inhalte über eine CLI extrahieren", tone: "accent" },
          { label: "Seite Web-Crawl", href: "/capabilities/web-crawl" },
        ],
      },
      {
        capability: "Drive-Speicher",
        cells: [
          { label: "Keine gemeinsame Asset-Speicherschicht", tone: "muted" },
          { label: "Outputs mit öffentlichen URLs in AnyCap Drive ablegen", tone: "accent" },
          { label: "Preisseite", href: "/pricing" },
        ],
      },
      {
        capability: "Page-Hosting",
        cells: [
          { label: "Keine native Oberfläche zum Veröffentlichen von Seiten", tone: "muted" },
          { label: "Einfache Seiten über AnyCap Page veröffentlichen", tone: "accent" },
          { label: "Preisseite", href: "/pricing" },
        ],
      },
      {
        capability: "Ein Auth-Flow",
        cells: [
          { label: "Credential-Verwaltung pro Provider", tone: "muted" },
          { label: "Ein Login für den gesamten Capability-Stack", tone: "accent" },
          { label: "Loslegen-Seite", href: "/start" },
        ],
      },
    ],
  },
  capabilityCards: {
    title: "Beginnen Sie mit der ersten fehlenden Capability",
    cards: [
      {
        eyebrow: "Kreative Ausgabe",
        title: "Bildgenerierung",
        href: "/capabilities/image-generation",
        summary: "Beste Folgeseite, wenn Cursor Visuals, Mockups, Launch-Assets oder andere Bildausgaben braucht.",
        command: "anycap image generate",
      },
      {
        eyebrow: "Bewegte Ausgabe",
        title: "Videogenerierung",
        href: "/capabilities/video-generation",
        summary: "Beste Folgeseite, wenn Cursor Demos, Walkthroughs oder kurze Videoausgaben benötigt.",
        command: "anycap video generate",
      },
      {
        eyebrow: "Vision",
        title: "Bildverständnis",
        href: "/capabilities/image-understanding",
        summary: "Beste Folgeseite, wenn Cursor Screenshots, Diagramme, OCR oder Design-Feedback interpretieren soll.",
        command: "anycap image read",
      },
      {
        eyebrow: "Analyse",
        title: "Videoanalyse",
        href: "/capabilities/video-analysis",
        summary: "Beste Folgeseite, wenn Cursor Recordings inspizieren und strukturierte Details extrahieren soll.",
        command: "anycap video read",
      },
    ],
  },
  modelSelection: {
    title: "Wählen Sie dann das Modell, nicht nur die Capability",
    introPrefix:
      "Cursor-Nutzer suchen häufig nach Modellvergleichen, nicht nur nach Capabilities. Bei Bildern lautet die Wahl meist ",
    imageModelConnector: " vs ",
    introMiddle: ", bei Videos ist es oft ",
    videoModelConnector: " vs ",
    outro: ". Diese Guides helfen Cursor, vor dem CLI-Aufruf das richtige Modell auszuwählen.",
    cards: [
      {
        eyebrow: "Bildmodell",
        title: "Seedream 5",
        href: "/models/seedream-5",
        summary: "Bestes First-Pass-Bildmodell für polierte Cursor-Mockups, Launch-Visuals und sauberere visuelle Konzepte.",
        comparison: "Vergleichen Sie mit Nano Banana 2, wenn die Frage Geschwindigkeit vs Politur lautet.",
      },
      {
        eyebrow: "Bildmodell",
        title: "Nano Banana 2",
        href: "/models/nano-banana-2",
        summary: "Beste Wahl für schnelle Iteration, wenn Cursor viele visuelle Varianten oder wiederholte Content-Generierung braucht.",
        comparison: "Vergleichen Sie mit Seedream 5 und Nano Banana Pro für die Workflow-Eignung.",
      },
      {
        eyebrow: "Videomodell",
        title: "Veo 3.1",
        href: "/models/veo-3-1",
        summary: "Bestes Premium-Videomodell für Cursor, wenn die Aufgabe hochwertige cinematische Ausgabe erfordert.",
        comparison: "Vergleichen Sie mit Kling 3.0 und Seedance 1.5 Pro hinsichtlich Bewegungsstil und Workflow-Trade-offs.",
      },
    ],
  },
  faq: {
    title: "FAQ",
    items: [
      {
        question: "Kann Cursor von sich aus Bilder generieren?",
        answer:
          "Nein. Cursor ist hervorragend in Coding, Refactoring und workspace-bewussten Edits, bringt aber keine native Bildgenerierungs-Runtime mit. AnyCap ergänzt diese Capability über eine Skill-Installation und eine CLI, sodass Cursor Visuals erzeugen kann, ohne den Editor- und Terminal-Workflow zu verlassen, den Sie bereits nutzen.",
      },
      {
        question: "Warum AnyCap statt direkter Provider-Anbindung?",
        answer:
          "Eine separate Bild-API, eine Video-API und eine Vision-API in Cursor zu verkabeln bedeutet, mehrere SDKs, Credentials und Prompts im selben Projekt zu verwalten. AnyCap konsolidiert das in eine CLI und ein Login, sodass Cursor eine einzige Capability-Schicht erhält statt mehrerer disjunkter Provider-Setups.",
      },
      {
        question: "Ersetzt AnyCap Cursor?",
        answer:
          "Nein. AnyCap ist weder eine IDE noch ein Coding-Agent. Es ist eine Capability-Runtime, die neben Cursor läuft. Sie behalten Cursor für Code, Planung und Editing und ergänzen die Bild-, Video- und Vision-Tools, die nicht mitgeliefert werden.",
      },
      {
        question: "Was ist der schnellste Weg, Tools zu Cursor hinzuzufügen?",
        answer:
          'Sagen Sie Cursor einfach in natürlicher Sprache, was Sie brauchen, etwa "hilf mir, anycap.ai zu installieren". Cursor kann den Skill finden, die CLI installieren, sich authentifizieren und automatisch die richtige Capability aufrufen. Wenn Sie manuelle Kontrolle bevorzugen, steht der dreistufige Installationspfad weiterhin zur Verfügung.',
      },
      {
        question: "Funktioniert AnyCap im Cursor-Workflow?",
        answer:
          "Ja. Die AnyCap CLI ist eine einzelne Binary ohne externe Abhängigkeiten. Sie läuft im integrierten Terminal von Cursor, sendet API-Requests an den AnyCap-Server und liefert Dateipfade oder URLs zurück, die Cursor in Folgeschritten verwenden, im Projekt speichern oder an nachgelagertes Tooling weitergeben kann.",
      },
      {
        question: "Welches Bildmodell passt am besten zu Cursor: Seedream 5, Nano Banana 2 oder Nano Banana Pro?",
        answer:
          "Für Cursor-Workflows ist Seedream 5 das stärkere First-Pass-Bildmodell, Nano Banana 2 die schnellere Option für hochvolumige Iteration und Nano Banana Pro die bessere Wahl, wenn der Workflow von einem bestehenden Bild ausgeht und gezielte Revisionen braucht.",
      },
      {
        question: "Welches Videomodell passt am besten zu Cursor: Veo 3.1, Kling 3.0 oder Seedance 1.5 Pro?",
        answer:
          "Für Cursor ist Veo 3.1 die Premium-Default-Wahl, Kling 3.0 passt gut zu cinematischer Bewegung, und Seedance 1.5 Pro ist eine zuverlässige Option für stabile Bild-zu-Video-Generierung und produktionsfreundliche Workflows.",
      },
    ],
  },
  siblingAgents: {
    eyebrow: "Auch verfügbar für",
    labels: [
      { label: "Claude Code", href: "/for/claude-code" },
      { label: "Codex", href: "/for/codex" },
      { label: "Manus", href: "/for/manus" },
    ],
    ctas: {
      primary: "Loslegen",
      secondary: "Warum eine CLI zählt",
      tertiary: "Wie Skills passen",
    },
    footerNote: "Zuletzt aktualisiert Apr 2026",
  },
};

const contentByLocale: Record<SiteLocale, CursorPageContent> = {
  en: englishContent,
  "pt-br": ptBrContent,
  id: idContent,
  de: deContent,
};

function getCursorContent(locale: SiteLocale): CursorPageContent {
  return contentByLocale[locale] ?? contentByLocale.en;
}

export function getForCursorMetadata(locale: SiteLocale): Metadata {
  const content = getCursorContent(locale);

  return {
    title: content.metadata.title,
    description: content.metadata.description,
    alternates: {
      canonical: FOR_CURSOR_PATH,
    },
    openGraph: {
      type: "website",
      locale: getLocaleConfig(locale).ogLocale,
      url: FOR_CURSOR_PATH,
      siteName: siteConfig.siteName,
      title: content.metadata.openGraphTitle,
      description: content.metadata.openGraphDescription,
    },
  };
}

export function getForCursorPageData(locale: SiteLocale) {
  const content = getCursorContent(locale);

  const integrationGuideJsonLd = createTechArticleJsonLd({
    headline: content.metadata.articleHeadline,
    description: content.metadata.articleDescription,
    path: FOR_CURSOR_PATH,
    locale,
    about: [...content.metadata.articleAbout],
    keywords: [...content.metadata.articleKeywords],
    datePublished: "2026-04-03",
    dateModified: LAST_UPDATED_ISO,
  });

  return {
    ...content,
    integrationGuideJsonLd,
    faqJsonLd: createFaqPageJsonLd(content.faq.items),
    videoObjectJsonLd: {
      "@context": "https://schema.org",
      "@type": "VideoObject",
      name: content.demo.title,
      description: content.demo.description,
      contentUrl: "https://cdn.anycap.ai/page_resource/for_agent/for_cursor.mp4",
      uploadDate: "2026-04-03",
      duration: "PT48S",
      thumbnailUrl: CURSOR_POSTER_URL,
    },
  };
}
