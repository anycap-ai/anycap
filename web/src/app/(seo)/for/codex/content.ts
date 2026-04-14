import type { Metadata } from "next";
import type { CapabilityGapRow } from "@/components/landing/CapabilityGapTable";
import { createFaqPageJsonLd, createTechArticleJsonLd } from "@/lib/schema";
import { getLocaleConfig, siteConfig, type SiteLocale } from "@/lib/site";

export const FOR_CODEX_PATH = "/for/codex";

const LAST_UPDATED_ISO = "2026-04-05";
const CODEX_DOCS_URL = "https://developers.openai.com/codex/use-cases";
const VIDEO_SRC = "https://cdn.anycap.ai/page_resource/for_agent/for_codex.mp4";
const VIDEO_POSTER_URL = `${siteConfig.url}/opengraph-image.png`;
const SKILL_INSTALL_COMMAND = "npx -y skills add anycap-ai/anycap -a codex -y";
const CLI_INSTALL_COMMAND = "curl -fsSL https://anycap.ai/install.sh | sh";
const VERIFY_COMMAND = "anycap login && anycap status";

type BreadcrumbItem = {
  name: string;
  href?: string;
};

type GapRowSource = {
  capability: string;
  codexGap: string;
  anycapValue: string;
  nextStepLabel: string;
  nextStepHref: string;
};

type InstallStep = {
  title: string;
  subtitle: string;
  code: string;
  note: string;
};

type Card = {
  eyebrow: string;
  title: string;
  href: string;
  summary: string;
  command: string;
};

type ModelCard = {
  eyebrow: string;
  title: string;
  href: string;
  summary: string;
  comparison: string;
};

type FaqItem = {
  question: string;
  answer: string;
};

type WorkflowPanel = {
  title: string;
  command: string;
  outputLines: readonly string[];
};

type PageContent = {
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
  breadcrumbItems: readonly BreadcrumbItem[];
  hero: {
    eyebrow: string;
    lastUpdatedLabel: string;
    titleLine1: string;
    titleLine2: string;
    videoSrc: string;
    videoPosterUrl: string;
    videoTitle: string;
    videoDescription: string;
    introPrefix: string;
    introLinkLabel: string;
    introSuffix: string;
    followupParagraph: string;
    valueLine: string;
    docsUrl: string;
    ctas: {
      getStarted: string;
      imageGeneration: string;
      videoAnalysis: string;
    };
  };
  install: {
    eyebrow: string;
    titleLine1: string;
    titleLine2: string;
    description: string;
    runOnceLabel: string;
    code: string;
    note: string;
    detailsSummary: string;
    steps: readonly InstallStep[];
    guideLeadIn: string;
    guideLinkLabel: string;
    guideUrl: string;
  };
  whyItFits: {
    eyebrow: string;
    title: string;
    description: string;
    cards: readonly { title: string; description: string }[];
  };
  workflow: {
    eyebrow: string;
    title: string;
    description: string;
    panels: readonly WorkflowPanel[];
  };
  gapTable: {
    eyebrow: string;
    title: string;
    description: string;
    columns: {
      capability: string;
      codexAlone: string;
      addWithAnyCap: string;
      bestNextStep: string;
    };
    rows: readonly CapabilityGapRow[];
  };
  capabilityCardsTitle: string;
  capabilityCards: readonly Card[];
  modelSection: {
    title: string;
    introLead: string;
    imageModelLinkText: string;
    imageModelVsText: string;
    imageModelSecondLinkText: string;
    videoLead: string;
    videoVsText: string;
    videoSecondLinkText: string;
    introSuffix: string;
    cards: readonly ModelCard[];
  };
  faqTitle: string;
  faqItems: readonly FaqItem[];
  siblingAgents: {
    eyebrow: string;
    agents: readonly { label: string; href: string }[];
  };
  ctaButtons: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  footerNote: string;
  videoObject: {
    name: string;
    description: string;
  };
  howTo: {
    name: string;
    description: string;
    steps: readonly { name: string; text: string }[];
  };
};

function makeGapRows(rows: readonly GapRowSource[]): readonly CapabilityGapRow[] {
  return rows.map((row) => ({
    capability: row.capability,
    cells: [
      { label: row.codexGap, tone: "muted" as const },
      { label: row.anycapValue, tone: "accent" as const },
      { label: row.nextStepLabel, href: row.nextStepHref },
    ],
  }));
}

const englishContent = {
  metadata: {
    title: "Codex tools and capabilities — Add image, video, and vision with AnyCap",
    description:
      "Install one skill, tell Codex what you need, and let AnyCap supply image generation, video generation, image understanding, and video analysis through one CLI.",
    openGraphTitle: "Codex tools and capabilities — Add image, video, and vision with AnyCap",
    openGraphDescription:
      "Install one skill, tell Codex what you need, and let AnyCap supply image generation, video generation, image understanding, and video analysis through one CLI.",
    articleHeadline: "Codex tools and capabilities — Add image, video, and vision with AnyCap",
    articleDescription:
      "Guide for adding image generation, video generation, image understanding, and video analysis to OpenAI Codex through one capability runtime.",
    articleAbout: ["Codex", "AnyCap CLI", "agent skills", "capability runtime"],
    articleKeywords: [
      "codex tools",
      "add tools to codex",
      "codex capabilities",
      "codex image generation",
      "codex cli tools",
      "codex seedream 5 vs nano banana 2",
      "codex veo 3.1 vs kling 3.0",
    ],
  },
  breadcrumbItems: [
    { name: "Home", href: "/" },
    { name: "Equip Agents", href: "/for" },
    { name: "Codex", href: FOR_CODEX_PATH },
  ],
  hero: {
    eyebrow: "For Codex",
    lastUpdatedLabel: "Last updated April 5, 2026",
    titleLine1: "Codex is strong at code and terminal work.",
    titleLine2: "It still needs image, video, and vision tools.",
    videoSrc: VIDEO_SRC,
    videoPosterUrl: VIDEO_POSTER_URL,
    videoTitle: "Install and use AnyCap with Codex",
    videoDescription:
      "Watch Codex install AnyCap from a natural-language prompt — skill discovery, CLI setup, authentication, and first image generation in one uninterrupted flow.",
    introPrefix: "",
    introLinkLabel: "Codex",
    introSuffix:
      " is excellent at code, reasoning, and terminal execution. The gap appears when the workflow needs image, video, audio, or visual-analysis capabilities, like product visuals, walkthrough videos, screenshot understanding, or recording review — none of those are Codex tools today.",
    followupParagraph:
      "After adding the AnyCap skill, just tell Codex what you need in plain language. It reads the skill, installs the CLI, authenticates, and calls the right capability — all inside its own terminal session, without any manual setup from you.",
    valueLine: "One skill. Natural-language install. Immediate capabilities.",
    docsUrl: CODEX_DOCS_URL,
    ctas: {
      getStarted: "Get Started",
      imageGeneration: "Image Generation",
      videoAnalysis: "Video Analysis",
    },
  },
  install: {
    eyebrow: "Get started",
    titleLine1: "Add the skill once.",
    titleLine2: "Then just ask Codex in natural language.",
    description:
      "The only bootstrap step is adding the AnyCap skill. After that, you can just tell Codex what to do in plain language. Codex reads the skill, installs the CLI, authenticates, and starts delivering results in the same terminal session without extra setup from you.",
    runOnceLabel: "Run once",
    code: SKILL_INSTALL_COMMAND,
    note: "This teaches Codex how to discover and call the AnyCap runtime without changing the way you already work.",
    detailsSummary: "Prefer to install manually? Here are the three steps.",
    steps: [
      {
        title: "Install the skill",
        subtitle: "Step 1",
        code: SKILL_INSTALL_COMMAND,
        note: "This teaches Codex how to discover and call the AnyCap runtime.",
      },
      {
        title: "Install the CLI",
        subtitle: "Step 2",
        code: CLI_INSTALL_COMMAND,
        note: "The CLI is a single binary with no runtime dependencies — it runs inside the Codex sandbox as a standard terminal tool.",
      },
      {
        title: "Log in and verify",
        subtitle: "Step 3",
        code: VERIFY_COMMAND,
        note: "After authentication, Codex can move across image, video, and vision capabilities without new credentials or dashboard detours.",
      },
    ],
    guideLeadIn: "For a full walkthrough, see the ",
    guideLinkLabel: "install guide",
    guideUrl: "/guides/install-anycap",
  },
  whyItFits: {
    eyebrow: "Why it fits",
    title: "Built for the way Codex already works",
    description:
      "AnyCap installs cleanly into Codex because it was designed for the same constraints: sandboxed VMs, terminal-only output, and ephemeral task environments.",
    cards: [
      {
        title: "Sandboxed execution",
        description:
          "Codex runs each task in an isolated cloud VM. The AnyCap CLI is a dependency-free binary that installs and authenticates inside that sandbox, so no host-level setup leaks between tasks.",
      },
      {
        title: "Terminal-native output",
        description:
          "Codex has no GUI — every result is text in a terminal. AnyCap returns file paths and CDN URLs that Codex can pass to subsequent steps, embed in markdown, or hand off to downstream tooling.",
      },
      {
        title: "One credential, every capability",
        description:
          "Without a runtime layer, adding image generation, video generation, and vision means three separate provider credentials per sandbox. AnyCap consolidates them into one login that covers the full stack.",
      },
    ],
  },
  workflow: {
    eyebrow: "Real workflow",
    title: "What a Codex + AnyCap session looks like",
    description:
      "These are real CLI commands and outputs. Each example runs directly inside the Codex terminal session — no external tools, dashboards, or browser tabs.",
    panels: [
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
          "The modal overlay clips the submit button at viewport widths below 640px.",
          "The button is partially hidden behind the bottom edge of the dialog container.",
          "This appears to be a CSS overflow issue on the parent .modal-body element.",
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
  },
  gapTable: {
    eyebrow: "Capability gap",
    title: "What you get after those three commands",
    description:
      "Codex stays focused on code and terminal execution while AnyCap fills the generation, analysis, search, storage, and publishing gaps that sit outside its sandboxed surface area.",
    columns: {
      capability: "Capability",
      codexAlone: "Codex alone",
      addWithAnyCap: "Add with AnyCap",
      bestNextStep: "Best next step",
    },
    rows: makeGapRows([
      {
        capability: "Image generation",
        codexGap: "No image output from sandbox",
        anycapValue: "Generate visuals and mockups via anycap image generate",
        nextStepLabel: "Image Generation page",
        nextStepHref: "/capabilities/image-generation",
      },
      {
        capability: "Video generation",
        codexGap: "No video tooling in terminal loop",
        anycapValue: "Create walkthroughs and clips via anycap video generate",
        nextStepLabel: "Video Generation page",
        nextStepHref: "/capabilities/video-generation",
      },
      {
        capability: "Image understanding",
        codexGap: "No unified vision runtime",
        anycapValue: "Read screenshots, diagrams, and visual references",
        nextStepLabel: "Image Understanding page",
        nextStepHref: "/capabilities/image-understanding",
      },
      {
        capability: "Video analysis",
        codexGap: "Requires separate provider per task",
        anycapValue: "Inspect recordings from the same CLI",
        nextStepLabel: "Video Analysis page",
        nextStepHref: "/capabilities/video-analysis",
      },
      {
        capability: "Audio understanding",
        codexGap: "No unified audio analysis runtime",
        anycapValue: "Transcribe and analyze audio through one runtime",
        nextStepLabel: "Audio Understanding page",
        nextStepHref: "/capabilities/audio-understanding",
      },
      {
        capability: "Web search",
        codexGap: "Search depends on external tooling",
        anycapValue: "Search the web from the same capability layer",
        nextStepLabel: "Web Search page",
        nextStepHref: "/capabilities/web-search",
      },
      {
        capability: "Grounded web search",
        codexGap: "No grounded search flow in terminal loop",
        anycapValue: "Run grounded search when the answer needs citations",
        nextStepLabel: "Grounded Web Search page",
        nextStepHref: "/capabilities/grounded-web-search",
      },
      {
        capability: "Web crawl",
        codexGap: "No reusable crawl runtime",
        anycapValue: "Crawl pages and extract content from one CLI",
        nextStepLabel: "Web Crawl page",
        nextStepHref: "/capabilities/web-crawl",
      },
      {
        capability: "Drive storage",
        codexGap: "No shared asset storage layer",
        anycapValue: "Store outputs with public URLs in AnyCap Drive",
        nextStepLabel: "Pricing page",
        nextStepHref: "/pricing",
      },
      {
        capability: "Page hosting",
        codexGap: "No built-in page publishing surface",
        anycapValue: "Publish simple pages through AnyCap Page",
        nextStepLabel: "Pricing page",
        nextStepHref: "/pricing",
      },
      {
        capability: "One auth flow",
        codexGap: "Fresh credential setup per sandbox",
        anycapValue: "One login across the capability stack",
        nextStepLabel: "Get Started page",
        nextStepHref: "/start",
      },
    ]),
  },
  capabilityCardsTitle: "Start with the first missing capability",
  capabilityCards: [
    {
      eyebrow: "Creative output",
      title: "Image Generation",
      href: "/capabilities/image-generation",
      summary: "Best next page when Codex needs visuals, mockups, launch assets, or other image output.",
      command: "anycap image generate",
    },
    {
      eyebrow: "Motion output",
      title: "Video Generation",
      href: "/capabilities/video-generation",
      summary: "Best next page when Codex needs demos, walkthroughs, or short-form video output.",
      command: "anycap video generate",
    },
    {
      eyebrow: "Vision",
      title: "Image Understanding",
      href: "/capabilities/image-understanding",
      summary: "Best next page when Codex needs to interpret screenshots, diagrams, OCR, or design feedback.",
      command: "anycap image read",
    },
    {
      eyebrow: "Analysis",
      title: "Video Analysis",
      href: "/capabilities/video-analysis",
      summary: "Best next page when Codex needs to inspect recordings and extract structured details.",
      command: "anycap video read",
    },
  ],
  modelSection: {
    title: "Then pick the model that matches the terminal job",
    introLead:
      "Codex tasks often turn into model-comparison questions once the capability is in place. The common image decision is ",
    imageModelLinkText: "Seedream 5",
    imageModelVsText: " vs ",
    imageModelSecondLinkText: "Nano Banana 2",
    videoLead: ", while video decisions usually become ",
    videoVsText: " vs ",
    videoSecondLinkText: "Kling 3.0",
    introSuffix: ". These model pages help Codex choose before it generates anything.",
    cards: [
      {
        eyebrow: "Image model",
        title: "Seedream 5",
        href: "/models/seedream-5",
        summary: "Best first-pass image model when Codex needs a polished output from a prompt inside the sandbox.",
        comparison: "Compare with Nano Banana 2 when the task is speed vs polish.",
      },
      {
        eyebrow: "Image model",
        title: "Nano Banana 2",
        href: "/models/nano-banana-2",
        summary: "Best for fast iteration when Codex needs more variants, more drafts, or more throughput from image generation.",
        comparison: "Compare with Seedream 5 and Nano Banana Pro for workflow tradeoffs.",
      },
      {
        eyebrow: "Video model",
        title: "Veo 3.1",
        href: "/models/veo-3-1",
        summary: "Best premium video model for Codex when the workflow needs a cleaner cinematic first pass.",
        comparison: "Compare with Kling 3.0 and Seedance 1.5 Pro for motion style and production fit.",
      },
    ],
  },
  faqTitle: "FAQ",
  faqItems: [
    {
      question: "Can Codex generate images on its own?",
      answer:
        "No. Codex focuses on code reasoning and terminal execution inside a sandboxed VM. It has no built-in image generation runtime. AnyCap adds that capability through one skill install and one CLI, so Codex can produce visuals without leaving its terminal-first workflow.",
    },
    {
      question: "Why use AnyCap instead of wiring providers directly?",
      answer:
        "Codex tasks run in isolated, ephemeral cloud sandboxes. Wiring a separate image API, a video API, and a vision API into every task means repeated credential setup and SDK installation. AnyCap consolidates those into one CLI and one login that persists across Codex sessions.",
    },
    {
      question: "Does AnyCap replace Codex?",
      answer:
        "No. AnyCap is not an agent. It is a capability runtime that runs alongside Codex. You keep Codex for code, planning, and terminal execution, and add the image, video, and vision tools it does not ship with.",
    },
    {
      question: "What is the fastest path to add tools to Codex?",
      answer:
        "Add the AnyCap skill once, then describe what you need in natural language. Codex reads the skill, installs the CLI, authenticates, and calls the right capability automatically. If you prefer manual control, you can also install the CLI and log in yourself in three steps.",
    },
    {
      question: "Does AnyCap work inside the Codex sandbox?",
      answer:
        "Yes. The AnyCap CLI is a single binary with no external dependencies. It runs inside the Codex sandbox, sends API requests to the AnyCap server, and returns file paths or URLs that Codex can use in subsequent terminal steps.",
    },
    {
      question: "Which image model fits Codex best: Seedream 5, Nano Banana 2, or Nano Banana Pro?",
      answer:
        "For Codex, Seedream 5 is the stronger model when the task needs a polished first-pass result, Nano Banana 2 is better for faster iteration and batch-style generation, and Nano Banana Pro is the better fit when Codex needs targeted edits to an existing image.",
    },
    {
      question: "Which video model fits Codex best: Veo 3.1, Kling 3.0, or Seedance 1.5 Pro?",
      answer:
        "For Codex, Veo 3.1 is the premium default, Kling 3.0 is a stronger fit for more cinematic motion, and Seedance 1.5 Pro is a steadier choice for repeatable image-to-video production workflows.",
    },
  ],
  siblingAgents: {
    eyebrow: "Also available for",
    agents: [
      { label: "Claude Code", href: "/for/claude-code" },
      { label: "Cursor", href: "/for/cursor" },
      { label: "Manus", href: "/for/manus" },
    ],
  },
  ctaButtons: {
    primary: "Get Started",
    secondary: "Why One CLI Matters",
    tertiary: "How Skills Fit",
  },
  footerNote: "Last updated Apr 2026",
  videoObject: {
    name: "Install and use AnyCap with Codex",
    description:
      "Watch Codex install AnyCap from a natural-language prompt — skill discovery, CLI setup, authentication, and first image generation in one uninterrupted flow.",
  },
  howTo: {
    name: "Add image, video, and vision capabilities to Codex",
    description:
      "Install the AnyCap skill so Codex can set up the CLI and authenticate automatically through natural language. Manual steps are also available.",
    steps: [
      {
        name: "Install the AnyCap skill",
        text: `Run ${SKILL_INSTALL_COMMAND}. This is the only manual step — after this, Codex can install the CLI and authenticate on its own when you describe a task.`,
      },
      {
        name: "Tell Codex what you need",
        text: "Describe the task in natural language, such as 'help me install AnyCap and generate a product mockup image' or 'generate a product mockup image'. Codex reads the skill, installs the CLI, authenticates, and calls the right AnyCap capability automatically.",
      },
      {
        name: "(Optional) Install manually",
        text: `If you prefer manual control: run ${CLI_INSTALL_COMMAND} to install the CLI, then ${VERIFY_COMMAND} to authenticate.`,
      },
    ],
  },
} satisfies PageContent;

const portugueseContent = {
  metadata: {
    title: "Ferramentas e capacidades para Codex — Adicione imagem, vídeo e visão com o AnyCap",
    description:
      "Adicione uma skill ao Codex, diga o que você precisa em linguagem natural e deixe o AnyCap fornecer geração de imagem, geração de vídeo, compreensão de imagem e análise de vídeo por meio de uma única CLI.",
    openGraphTitle: "Ferramentas e capacidades para Codex — Adicione imagem, vídeo e visão com o AnyCap",
    openGraphDescription:
      "Adicione uma skill ao Codex, diga o que você precisa em linguagem natural e deixe o AnyCap fornecer geração de imagem, geração de vídeo, compreensão de imagem e análise de vídeo por meio de uma única CLI.",
    articleHeadline: "Ferramentas e capacidades para Codex — Adicione imagem, vídeo e visão com o AnyCap",
    articleDescription:
      "Guia para adicionar geração de imagem, geração de vídeo, compreensão de imagem e análise de vídeo ao OpenAI Codex por meio de um único runtime de capacidades.",
    articleAbout: ["Codex", "AnyCap CLI", "skills de agente", "runtime de capacidades"],
    articleKeywords: [
      "ferramentas do codex",
      "adicionar ferramentas ao codex",
      "capacidades do codex",
      "codex geração de imagem",
      "codex cli tools",
      "codex seedream 5 vs nano banana 2",
      "codex veo 3.1 vs kling 3.0",
    ],
  },
  breadcrumbItems: [
    { name: "Início", href: "/" },
    { name: "Equipar agentes", href: "/for" },
    { name: "Codex", href: FOR_CODEX_PATH },
  ],
  hero: {
    eyebrow: "Para Codex",
    lastUpdatedLabel: "Atualizado em 5 de abril de 2026",
    titleLine1: "O Codex é forte em código e trabalho no terminal.",
    titleLine2: "Mas ainda precisa de ferramentas de imagem, vídeo e visão.",
    videoSrc: VIDEO_SRC,
    videoPosterUrl: VIDEO_POSTER_URL,
    videoTitle: "Instale e use o AnyCap com o Codex",
    videoDescription:
      "Veja o Codex instalar o AnyCap a partir de um prompt em linguagem natural — descoberta da skill, configuração da CLI, autenticação e primeira geração de imagem em um fluxo contínuo.",
    introPrefix: "O ",
    introLinkLabel: "Codex",
    introSuffix:
      " é excelente em código, raciocínio e execução no terminal. A lacuna aparece quando o fluxo precisa de recursos de imagem, vídeo, áudio ou análise visual, como visuais de produto, vídeos de demonstração, compreensão de screenshots ou revisão de gravações — nenhum desses recursos faz parte das ferramentas do Codex hoje.",
    followupParagraph:
      "Depois de adicionar a skill do AnyCap, basta dizer ao Codex o que você precisa em linguagem simples. Ele lê a skill, instala a CLI, autentica e chama a capacidade certa — tudo dentro da própria sessão de terminal, sem nenhuma configuração manual da sua parte.",
    valueLine: "Uma skill. Instalação em linguagem natural. Capacidades imediatas.",
    docsUrl: CODEX_DOCS_URL,
    ctas: {
      getStarted: "Começar",
      imageGeneration: "Geração de imagem",
      videoAnalysis: "Análise de vídeo",
    },
  },
  install: {
    eyebrow: "Comece aqui",
    titleLine1: "Adicione a skill uma vez.",
    titleLine2: "Depois, apenas peça ao Codex em linguagem natural.",
    description:
      "A única etapa inicial é adicionar a skill do AnyCap. Depois disso, basta dizer ao Codex o que fazer em linguagem simples. O Codex lê a skill, instala a CLI, autentica e começa a entregar resultados na mesma sessão de terminal, sem configuração extra da sua parte.",
    runOnceLabel: "Execute uma vez",
    code: SKILL_INSTALL_COMMAND,
    note: "Isso ensina o Codex a descobrir e chamar o runtime do AnyCap sem mudar a forma como você já trabalha.",
    detailsSummary: "Prefere instalar manualmente? Aqui estão os três passos.",
    steps: [
      {
        title: "Instale a skill",
        subtitle: "Passo 1",
        code: SKILL_INSTALL_COMMAND,
        note: "Isso ensina o Codex a descobrir e chamar o runtime do AnyCap.",
      },
      {
        title: "Instale a CLI",
        subtitle: "Passo 2",
        code: CLI_INSTALL_COMMAND,
        note: "A CLI é um binário único, sem dependências de runtime — ela roda dentro do sandbox do Codex como uma ferramenta terminal padrão.",
      },
      {
        title: "Faça login e verifique",
        subtitle: "Passo 3",
        code: VERIFY_COMMAND,
        note: "Depois da autenticação, o Codex pode transitar entre capacidades de imagem, vídeo e visão sem novas credenciais ou desvios para dashboards.",
      },
    ],
    guideLeadIn: "Para um passo a passo completo, veja o ",
    guideLinkLabel: "guia de instalação",
    guideUrl: "/guides/install-anycap",
  },
  whyItFits: {
    eyebrow: "Por que combina",
    title: "Feito para a forma como o Codex já funciona",
    description:
      "O AnyCap se integra ao Codex porque foi projetado para as mesmas restrições: VMs em sandbox, saída apenas no terminal e ambientes de tarefa efêmeros.",
    cards: [
      {
        title: "Execução em sandbox",
        description:
          "O Codex executa cada tarefa em uma VM em nuvem isolada. A CLI do AnyCap é um binário sem dependências que instala e autentica dentro desse sandbox, então nenhuma configuração do host vaza entre tarefas.",
      },
      {
        title: "Saída nativa do terminal",
        description:
          "O Codex não tem interface gráfica — todo resultado é texto no terminal. O AnyCap devolve caminhos de arquivo e URLs da CDN que o Codex pode usar em etapas seguintes, inserir em markdown ou repassar para outras ferramentas.",
      },
      {
        title: "Uma credencial, todas as capacidades",
        description:
          "Sem uma camada de runtime, adicionar geração de imagem, geração de vídeo e visão exigiria três credenciais de provedores separadas por sandbox. O AnyCap consolida tudo em um único login que cobre toda a stack.",
      },
    ],
  },
  workflow: {
    eyebrow: "Fluxo real",
    title: "Como é uma sessão de Codex + AnyCap",
    description:
      "Estes são comandos e saídas reais da CLI. Cada exemplo roda diretamente dentro da sessão de terminal do Codex — sem ferramentas externas, dashboards ou abas do navegador.",
    panels: [
      {
        title: "Geração de imagem — text-to-image",
        command:
          'anycap image generate --model seedream-5 --prompt "a minimal SaaS dashboard on a light background, clean UI, rounded corners" -o dashboard-hero.png',
        outputLines: [
          "Gerando imagem com seedream-5...",
          "Imagem salva em dashboard-hero.png (1024x1024, 487KB)",
          "URL da CDN: https://cdn.anycap.ai/...",
        ],
      },
      {
        title: "Compreensão de imagem — análise de screenshot",
        command:
          'anycap image read --file ./bug-screenshot.png --prompt "What UI issue do you see?"',
        outputLines: [
          "A camada modal corta o botão de envio em larguras de viewport abaixo de 640px.",
          "O botão fica parcialmente escondido atrás da borda inferior do contêiner do diálogo.",
          "Isso parece ser um problema de overflow CSS no elemento pai `.modal-body`.",
        ],
      },
      {
        title: "Geração de vídeo — clipe demo",
        command:
          'anycap video generate --model veo-3-1 --prompt "a developer typing in a dark terminal, smooth camera push-in, ambient desk lighting"',
        outputLines: [
          "Gerando vídeo com veo-3-1...",
          "Vídeo pronto (8s, 1080p, 12.4MB)",
          "URL da CDN: https://cdn.anycap.ai/...",
        ],
      },
    ],
  },
  gapTable: {
    eyebrow: "Lacuna de capacidade",
    title: "O que você ganha após esses três comandos",
    description:
      "O Codex continua focado em código e execução no terminal, enquanto o AnyCap preenche as lacunas de geração, análise, busca, armazenamento e publicação que ficam fora da superfície em sandbox.",
    columns: {
      capability: "Capacidade",
      codexAlone: "Só o Codex",
      addWithAnyCap: "Adicione com AnyCap",
      bestNextStep: "Próximo melhor passo",
    },
    rows: makeGapRows([
      {
        capability: "Geração de imagem",
        codexGap: "Sem saída de imagem no sandbox",
        anycapValue: "Gere visuais e mockups com anycap image generate",
        nextStepLabel: "Página de geração de imagem",
        nextStepHref: "/capabilities/image-generation",
      },
      {
        capability: "Geração de vídeo",
        codexGap: "Sem ferramentas de vídeo no loop de terminal",
        anycapValue: "Crie demonstrações e clipes com anycap video generate",
        nextStepLabel: "Página de geração de vídeo",
        nextStepHref: "/capabilities/video-generation",
      },
      {
        capability: "Compreensão de imagem",
        codexGap: "Sem runtime de visão unificado",
        anycapValue: "Leia screenshots, diagramas e referências visuais",
        nextStepLabel: "Página de compreensão de imagem",
        nextStepHref: "/capabilities/image-understanding",
      },
      {
        capability: "Análise de vídeo",
        codexGap: "Exige um provedor separado por tarefa",
        anycapValue: "Inspecione gravações com a mesma CLI",
        nextStepLabel: "Página de análise de vídeo",
        nextStepHref: "/capabilities/video-analysis",
      },
      {
        capability: "Compreensão de áudio",
        codexGap: "Sem runtime unificado de análise de áudio",
        anycapValue: "Transcreva e analise áudio em um único runtime",
        nextStepLabel: "Página de compreensão de áudio",
        nextStepHref: "/capabilities/audio-understanding",
      },
      {
        capability: "Busca na web",
        codexGap: "A busca depende de ferramentas externas",
        anycapValue: "Busque na web pela mesma camada de capacidades",
        nextStepLabel: "Página de busca na web",
        nextStepHref: "/capabilities/web-search",
      },
      {
        capability: "Busca na web com base em fontes",
        codexGap: "Sem fluxo de busca fundamentada no loop de terminal",
        anycapValue: "Execute busca fundamentada quando a resposta precisar de citações",
        nextStepLabel: "Página de busca na web fundamentada",
        nextStepHref: "/capabilities/grounded-web-search",
      },
      {
        capability: "Rastreamento da web",
        codexGap: "Sem runtime de rastreamento reutilizável",
        anycapValue: "Rastreie páginas e extraia conteúdo com uma única CLI",
        nextStepLabel: "Página de rastreamento da web",
        nextStepHref: "/capabilities/web-crawl",
      },
      {
        capability: "Armazenamento no Drive",
        codexGap: "Sem camada compartilhada de armazenamento de ativos",
        anycapValue: "Armazene saídas com URLs públicas no AnyCap Drive",
        nextStepLabel: "Página de preços",
        nextStepHref: "/pricing",
      },
      {
        capability: "Hospedagem de páginas",
        codexGap: "Sem superfície nativa de publicação de páginas",
        anycapValue: "Publique páginas simples com o AnyCap Page",
        nextStepLabel: "Página de preços",
        nextStepHref: "/pricing",
      },
      {
        capability: "Um fluxo de autenticação",
        codexGap: "Configuração de credenciais do zero em cada sandbox",
        anycapValue: "Um login para toda a stack de capacidades",
        nextStepLabel: "Página de início",
        nextStepHref: "/start",
      },
    ]),
  },
  capabilityCardsTitle: "Comece pela primeira capacidade que falta",
  capabilityCards: [
    {
      eyebrow: "Saída criativa",
      title: "Geração de imagem",
      href: "/capabilities/image-generation",
      summary: "Melhor página seguinte quando o Codex precisa de visuais, mockups, assets de lançamento ou outro tipo de saída de imagem.",
      command: "anycap image generate",
    },
    {
      eyebrow: "Saída em movimento",
      title: "Geração de vídeo",
      href: "/capabilities/video-generation",
      summary: "Melhor página seguinte quando o Codex precisa de demos, walkthroughs ou saída de vídeo curta.",
      command: "anycap video generate",
    },
    {
      eyebrow: "Visão",
      title: "Compreensão de imagem",
      href: "/capabilities/image-understanding",
      summary: "Melhor página seguinte quando o Codex precisa interpretar screenshots, diagramas, OCR ou feedback de design.",
      command: "anycap image read",
    },
    {
      eyebrow: "Análise",
      title: "Análise de vídeo",
      href: "/capabilities/video-analysis",
      summary: "Melhor página seguinte quando o Codex precisa inspecionar gravações e extrair detalhes estruturados.",
      command: "anycap video read",
    },
  ],
  modelSection: {
    title: "Depois escolha o modelo que combina com o trabalho no terminal",
    introLead:
      "As tarefas do Codex costumam virar perguntas de comparação de modelos depois que a capacidade já está disponível. A decisão comum de imagem é ",
    imageModelLinkText: "Seedream 5",
    imageModelVsText: " vs ",
    imageModelSecondLinkText: "Nano Banana 2",
    videoLead: ", enquanto as decisões de vídeo normalmente viram ",
    videoVsText: " vs ",
    videoSecondLinkText: "Kling 3.0",
    introSuffix: ". Estas páginas de modelo ajudam o Codex a escolher antes de gerar qualquer coisa.",
    cards: [
      {
        eyebrow: "Modelo de imagem",
        title: "Seedream 5",
        href: "/models/seedream-5",
        summary: "Melhor primeira opção de imagem quando o Codex precisa de uma saída refinada a partir de um prompt dentro do sandbox.",
        comparison: "Compare com Nano Banana 2 quando a tarefa for velocidade versus polimento.",
      },
      {
        eyebrow: "Modelo de imagem",
        title: "Nano Banana 2",
        href: "/models/nano-banana-2",
        summary: "Melhor para iteração rápida quando o Codex precisa de mais variações, mais rascunhos ou mais throughput de geração de imagem.",
        comparison: "Compare com Seedream 5 e Nano Banana Pro para analisar compensações de fluxo.",
      },
      {
        eyebrow: "Modelo de vídeo",
        title: "Veo 3.1",
        href: "/models/veo-3-1",
        summary: "Melhor modelo premium de vídeo para o Codex quando o fluxo precisa de uma primeira passada cinematográfica mais limpa.",
        comparison: "Compare com Kling 3.0 e Seedance 1.5 Pro para estilo de movimento e adequação à produção.",
      },
    ],
  },
  faqTitle: "Perguntas frequentes",
  faqItems: [
    {
      question: "O Codex consegue gerar imagens sozinho?",
      answer:
        "Não. O Codex foca em raciocínio de código e execução no terminal dentro de uma VM em sandbox. Ele não tem runtime nativo de geração de imagem. O AnyCap adiciona essa capability por meio de uma skill e uma CLI, para que o Codex possa produzir visuais sem sair do fluxo terminal-first.",
    },
    {
      question: "Por que usar o AnyCap em vez de conectar provedores diretamente?",
      answer:
        "As tarefas do Codex rodam em sandboxes de nuvem isolados e efêmeros. Conectar uma API de imagem, uma API de vídeo e uma API de visão em cada tarefa significa repetir configuração de credenciais e instalação de SDK. O AnyCap consolida tudo em uma CLI e um login que persistem entre sessões do Codex.",
    },
    {
      question: "O AnyCap substitui o Codex?",
      answer:
        "Não. O AnyCap não é um agente. Ele é um runtime de capabilities que roda ao lado do Codex. Você continua com o Codex para código, planejamento e execução no terminal, e adiciona as ferramentas de imagem, vídeo e visão que ele não traz nativamente.",
    },
    {
      question: "Qual é o caminho mais rápido para adicionar ferramentas ao Codex?",
      answer:
        "Adicione a skill do AnyCap uma vez e então descreva o que você precisa em linguagem natural. O Codex lê a skill, instala a CLI, autentica e chama a capability certa automaticamente. Se preferir controle manual, você também pode instalar a CLI e fazer login por conta própria em três passos.",
    },
    {
      question: "O AnyCap funciona dentro do sandbox do Codex?",
      answer:
        "Sim. A CLI do AnyCap é um binário único, sem dependências externas. Ela roda dentro do sandbox do Codex, envia requisições para o servidor do AnyCap e devolve caminhos de arquivo ou URLs que o Codex pode usar em passos de terminal seguintes.",
    },
    {
      question: "Qual modelo de imagem combina melhor com o Codex: Seedream 5, Nano Banana 2 ou Nano Banana Pro?",
      answer:
        "Para o Codex, o Seedream 5 é o modelo mais forte quando a tarefa precisa de um primeiro resultado polido, o Nano Banana 2 é melhor para iteração mais rápida e geração em lote, e o Nano Banana Pro é a melhor opção quando o Codex precisa de edições direcionadas em uma imagem existente.",
    },
    {
      question: "Qual modelo de vídeo combina melhor com o Codex: Veo 3.1, Kling 3.0 ou Seedance 1.5 Pro?",
      answer:
        "Para o Codex, o Veo 3.1 é o padrão premium, o Kling 3.0 se encaixa melhor em movimento mais cinematográfico e o Seedance 1.5 Pro é uma escolha mais estável para fluxos repetíveis de imagem para vídeo.",
    },
  ],
  siblingAgents: {
    eyebrow: "Também disponível para",
    agents: [
      { label: "Claude Code", href: "/for/claude-code" },
      { label: "Cursor", href: "/for/cursor" },
      { label: "Manus", href: "/for/manus" },
    ],
  },
  ctaButtons: {
    primary: "Começar",
    secondary: "Por que uma única CLI importa",
    tertiary: "Como as skills se encaixam",
  },
  footerNote: "Atualizado em abr. de 2026",
  videoObject: {
    name: "Instale e use o AnyCap com o Codex",
    description:
      "Veja o Codex instalar o AnyCap a partir de um prompt em linguagem natural — descoberta da skill, configuração da CLI, autenticação e primeira geração de imagem em um fluxo contínuo.",
  },
  howTo: {
    name: "Adicione capacidades de imagem, vídeo e visão ao Codex",
    description:
      "Instale a skill do AnyCap para que o Codex configure a CLI e autentique automaticamente usando linguagem natural. Passos manuais também estão disponíveis.",
    steps: [
      {
        name: "Instale a skill do AnyCap",
        text: `Execute ${SKILL_INSTALL_COMMAND}. Esta é a única etapa manual — depois disso, o Codex pode instalar a CLI e autenticar por conta própria quando você descrever uma tarefa.`,
      },
      {
        name: "Diga ao Codex o que você precisa",
        text: "Descreva a tarefa em linguagem natural, como 'me ajude a instalar o AnyCap e gerar um mockup de produto' ou 'gere um mockup de produto'. O Codex lê a skill, instala a CLI, autentica e chama a capability certa do AnyCap automaticamente.",
      },
      {
        name: "(Opcional) Instale manualmente",
        text: `Se preferir controle manual: execute ${CLI_INSTALL_COMMAND} para instalar a CLI e depois ${VERIFY_COMMAND} para autenticar.`,
      },
    ],
  },
} satisfies PageContent;

const contentByLocale: Record<SiteLocale, PageContent> = {
  en: englishContent,
  "pt-br": portugueseContent,
  id: englishContent,
};

function getContent(locale: SiteLocale): PageContent {
  return contentByLocale[locale] ?? englishContent;
}

export function getForCodexMetadata(locale: SiteLocale): Metadata {
  const content = getContent(locale);

  return {
    title: content.metadata.title,
    description: content.metadata.description,
    alternates: {
      canonical: FOR_CODEX_PATH,
    },
    openGraph: {
      type: "website",
      locale: getLocaleConfig(locale).ogLocale,
      url: FOR_CODEX_PATH,
      siteName: siteConfig.siteName,
      title: content.metadata.openGraphTitle,
      description: content.metadata.openGraphDescription,
    },
  };
}

export function getForCodexPageData(locale: SiteLocale) {
  const content = getContent(locale);

  const capabilityGuideJsonLd = createTechArticleJsonLd({
    headline: content.metadata.articleHeadline,
    description: content.metadata.articleDescription,
    path: FOR_CODEX_PATH,
    locale,
    about: [...content.metadata.articleAbout],
    keywords: [...content.metadata.articleKeywords],
    dateModified: LAST_UPDATED_ISO,
  });

  return {
    ...content,
    capabilityGuideJsonLd,
    faqJsonLd: createFaqPageJsonLd(content.faqItems),
    videoObjectJsonLd: {
      "@context": "https://schema.org",
      "@type": "VideoObject",
      name: content.videoObject.name,
      description: content.videoObject.description,
      contentUrl: content.hero.videoSrc,
      uploadDate: "2026-04-03",
      duration: "PT48S",
      thumbnailUrl: content.hero.videoPosterUrl,
    },
    howToJsonLd: {
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: content.howTo.name,
      description: content.howTo.description,
      step: content.howTo.steps.map((step) => ({
        "@type": "HowToStep",
        name: step.name,
        text: step.text,
      })),
    },
  };
}
