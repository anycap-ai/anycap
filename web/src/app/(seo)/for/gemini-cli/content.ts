import type { Metadata } from "next";
import { createFaqPageJsonLd, createTechArticleJsonLd } from "@/lib/schema";
import { getLocaleConfig, siteConfig, type SiteLocale } from "@/lib/site";

export const FOR_GEMINI_CLI_PATH = "/for/gemini-cli";

const LAST_UPDATED_ISO = "2026-04-20";

type GapRow = {
  capability: string;
  geminiGap: string;
  anycapValue: string;
};

type InstallStep = {
  title: string;
  code: string;
  note: string;
};

type CommandCard = {
  eyebrow: string;
  title: string;
  command: string;
  description: string;
};

type FaqItem = {
  question: string;
  answer: string;
};

type ForGeminiCliPageData = {
  metadata: {
    title: string;
    description: string;
    openGraphTitle: string;
    openGraphDescription: string;
  };
  breadcrumbItems: readonly { name: string; href?: string; unlinkable?: boolean }[];
  articleJsonLd: Record<string, unknown>;
  faqJsonLd: Record<string, unknown>;
  hero: {
    eyebrow: string;
    lastUpdatedLabel: string;
    titleLine1: string;
    titleLine2: string;
    intro: string;
    ctaPrimary: string;
    ctaPrimaryHref: string;
    ctaSecondary: string;
    ctaSecondaryHref: string;
  };
  gapTitle: string;
  gapIntro: string;
  gapHeaders: { capability: string; gemini: string; anycap: string };
  gapRows: readonly GapRow[];
  installTitle: string;
  installIntro: string;
  installSteps: readonly InstallStep[];
  commandsTitle: string;
  commandsIntro: string;
  commandCards: readonly CommandCard[];
  patternTitle: string;
  patternSteps: readonly string[];
  whyTitle: string;
  whyBody: readonly string[];
  faqTitle: string;
  faqItems: readonly FaqItem[];
  relatedTitle: string;
  relatedLinks: readonly { label: string; href: string; description: string }[];
};

const en: ForGeminiCliPageData = {
  metadata: {
    title: "AnyCap for Gemini CLI, Add Image & Video Generation to Google's AI Agent CLI",
    description:
      "Gemini CLI can reason, code, and search. AnyCap adds image generation, video generation, and visual understanding, giving Gemini CLI the full multimodal capability layer it needs for production agent workflows.",
    openGraphTitle: "AnyCap for Gemini CLI, Multimodal capabilities in one runtime",
    openGraphDescription:
      "Add image generation, video generation, and image understanding to Gemini CLI in minutes. AnyCap is the capability runtime that closes the visual gap.",
  },
  breadcrumbItems: [
    { name: "Home", href: "/" },
    { name: "Equip Agents", href: "/for", unlinkable: true },
    { name: "Gemini CLI" },
  ],
  articleJsonLd: createTechArticleJsonLd({
    headline: "AnyCap for Gemini CLI, Add Image & Video Generation to Google's AI Agent CLI",
    description:
      "How to add image generation, video generation, and visual understanding to Gemini CLI using AnyCap as the capability runtime.",
    path: FOR_GEMINI_CLI_PATH,
    about: ["Gemini CLI", "AnyCap", "Image generation", "Video generation", "AI agents"],
    keywords: [
      "gemini cli image generation",
      "gemini cli video generation",
      "gemini cli capabilities",
      "anycap gemini cli",
      "gemini cli multimodal",
      "google gemini cli",
    ],
    datePublished: LAST_UPDATED_ISO,
    dateModified: LAST_UPDATED_ISO,
  }),
  faqJsonLd: createFaqPageJsonLd([
    {
      question: "Can Gemini CLI generate images?",
      answer:
        "Not natively. Gemini CLI is built for reasoning, code generation, and web search. Adding AnyCap as a skill gives Gemini CLI access to image generation, video generation, and image understanding through the AnyCap capability runtime.",
    },
    {
      question: "How do I add image generation to Gemini CLI?",
      answer:
        "Install AnyCap (curl -fsSL https://anycap.ai/install.sh | sh), then add the AnyCap skill to Gemini CLI. Once the skill is active, Gemini CLI can call anycap image generate as part of any workflow.",
    },
    {
      question: "Which image and video models does AnyCap provide for Gemini CLI?",
      answer:
        "AnyCap routes image generation through Seedream 5, Nano Banana Pro, and Nano Banana 2. Video generation runs through Veo 3.1, Kling 3.0, and Seedance 1.5 Pro. The agent picks the model per task through a single CLI interface.",
    },
    {
      question: "Does AnyCap work with Google's Gemini models?",
      answer:
        "AnyCap is a capability runtime, not a model provider. It adds production capabilities (image generation, video generation, visual understanding) to agent CLIs including Gemini CLI. Gemini CLI still uses its own Gemini models for reasoning and text tasks.",
    },
  ]),
  hero: {
    eyebrow: "Equip Agents",
    lastUpdatedLabel: "Updated April 20, 2026",
    titleLine1: "Close the capability gap",
    titleLine2: "in Gemini CLI",
    intro:
      "Gemini CLI is Google's open-source AI agent CLI, it reasons with Gemini models, runs code, searches the web, and reads files. What it can't do natively: generate images, generate video, or understand visual inputs at the capability-call level. AnyCap fills that gap. Install it once, add it as a skill to Gemini CLI, and the agent gains access to image generation, video generation, and image understanding through a single runtime with no additional provider integrations.",
    ctaPrimary: "Install AnyCap",
    ctaPrimaryHref: "/start",
    ctaSecondary: "View capabilities",
    ctaSecondaryHref: "/capabilities",
  },
  gapTitle: "What Gemini CLI can't do without AnyCap",
  gapIntro:
    "Gemini CLI handles reasoning and code-centric tasks well. The gap is in production multimodal capabilities, the kind an agent needs to complete real-world tasks that involve creating or understanding visual content.",
  gapHeaders: {
    capability: "Capability",
    gemini: "Gemini CLI alone",
    anycap: "With AnyCap",
  },
  gapRows: [
    {
      capability: "Image generation",
      geminiGap: "No. Gemini CLI can't generate images natively.",
      anycapValue: "Yes. Seedream 5, Nano Banana Pro, Nano Banana 2, routed through one command.",
    },
    {
      capability: "Video generation",
      geminiGap: "No. Video generation isn't available in Gemini CLI.",
      anycapValue: "Yes. Veo 3.1, Kling 3.0, Seedance 1.5 Pro, async with predictable polling.",
    },
    {
      capability: "Image understanding",
      geminiGap: "Limited. Text-based description only via chat.",
      anycapValue: "Yes. Read any image file or URL and get structured output for the agent to act on.",
    },
    {
      capability: "Video analysis",
      geminiGap: "Limited. Not built into CLI capability calls.",
      anycapValue: "Yes. Analyze video files or URLs and extract structured insights.",
    },
    {
      capability: "Multi-provider routing",
      geminiGap: "N/A. No generative media routing.",
      anycapValue: "Yes. One credential, one CLI, routes across all supported models by task.",
    },
  ],
  installTitle: "Add AnyCap to Gemini CLI in three steps",
  installIntro:
    "Installing AnyCap and connecting it to Gemini CLI takes about two minutes. Once the skill is active, Gemini CLI can discover and call any AnyCap capability as part of an agentic workflow.",
  installSteps: [
    {
      title: "Install the AnyCap CLI",
      code: "curl -fsSL https://anycap.ai/install.sh | sh",
      note: "Installs the anycap binary. Verify with: anycap --version",
    },
    {
      title: "Authenticate",
      code: "anycap login",
      note: "Opens a browser auth flow. Free tier available.",
    },
    {
      title: "Add the AnyCap skill to Gemini CLI",
      code: "npx -y skills add anycap-ai/anycap -a gemini-cli -y",
      note: "Registers the AnyCap skill in Gemini CLI's skill context. Gemini CLI will discover it on next run.",
    },
  ],
  commandsTitle: "What Gemini CLI can do with AnyCap",
  commandsIntro:
    "Once the AnyCap skill is active, Gemini CLI can invoke any of these capability commands as part of an agentic workflow, directly or as part of a multi-step task.",
  commandCards: [
    {
      eyebrow: "Image generation",
      title: "Generate images",
      command: 'anycap image generate --prompt "a product photo on a clean white surface"',
      description: "Routes to Seedream 5, Nano Banana Pro, or Nano Banana 2. Returns a URL.",
    },
    {
      eyebrow: "Video generation",
      title: "Generate video",
      command: 'anycap video generate --model kling-3-0 --prompt "a product rotating slowly"',
      description: "Async job with polling. Returns video URL when complete.",
    },
    {
      eyebrow: "Image understanding",
      title: "Read and analyze images",
      command: "anycap image read --input https://example.com/screenshot.png",
      description: "Returns structured description the agent can act on.",
    },
    {
      eyebrow: "Video analysis",
      title: "Analyze video",
      command: "anycap video read --input https://example.com/recording.mp4",
      description: "Extracts structured insights from a video file or URL.",
    },
  ],
  patternTitle: "How Gemini CLI decides what to call",
  patternSteps: [
    "Need text reasoning? → Gemini CLI handles it natively",
    "Need to generate an image? → anycap image generate",
    "Need to generate a video? → anycap video generate",
    "Need to analyze a screenshot? → anycap image read",
    "Need to review a recording? → anycap video read",
  ],
  whyTitle: "Why a capability runtime, not a direct API",
  whyBody: [
    "Each generative media provider has its own SDK, credential path, rate-limit surface, and error vocabulary. Adding Veo 3.1, Kling 3.0, and Seedream 5 directly to a Gemini CLI workflow means five separate integrations that each need maintenance. When one provider changes its response schema, the workflow breaks.",
    "AnyCap normalizes all of this. The agent authenticates once. The CLI interface is identical across all models. Async job handling, retry logic, and credential resolution happen inside the runtime, not in the agent's prompt or tool code. When a new model is added to AnyCap, Gemini CLI gets access to it without any changes to the workflow.",
  ],
  faqTitle: "Frequently asked questions",
  faqItems: [
    {
      question: "Can Gemini CLI generate images?",
      answer:
        "Not natively. Gemini CLI is built for reasoning, code generation, and web search. Adding AnyCap as a skill gives Gemini CLI access to image generation through Seedream 5, Nano Banana Pro, and Nano Banana 2.",
    },
    {
      question: "How do I add image generation to Gemini CLI?",
      answer:
        "Install AnyCap (curl -fsSL https://anycap.ai/install.sh | sh), authenticate with anycap login, then add the skill with npx -y skills add anycap-ai/anycap -a gemini-cli -y. Gemini CLI will discover the capability on its next run.",
    },
    {
      question: "Which video models are available for Gemini CLI through AnyCap?",
      answer:
        "Veo 3.1 (Google DeepMind), Kling 3.0 (Kuaishou), and Seedance 1.5 Pro (ByteDance) are all available through AnyCap. The agent selects the model with a --model flag or lets AnyCap route based on the task.",
    },
    {
      question: "Does AnyCap replace Gemini's built-in capabilities?",
      answer:
        "No. AnyCap adds generative media capabilities that Gemini CLI doesn't have natively. Gemini CLI still uses its own Gemini models for reasoning, coding, and text tasks. AnyCap handles the visual and media layer.",
    },
  ],
  relatedTitle: "Learn more",
  relatedLinks: [
    {
      label: "Image Generation",
      href: "/capabilities/image-generation",
      description: "See which image models are available through AnyCap.",
    },
    {
      label: "Video Generation",
      href: "/capabilities/video-generation",
      description: "See which video models are available through AnyCap.",
    },
    {
      label: "Install AnyCap",
      href: "/start",
      description: "Step-by-step installation and authentication guide.",
    },
    {
      label: "AnyCap for Claude Code",
      href: "/for/claude-code",
      description: "The same capability runtime for Claude Code workflows.",
    },
  ],
};

const contentByLocale: Record<SiteLocale, ForGeminiCliPageData> = {
  en,
  "pt-br": {
    ...en,
    metadata: {
      title: "AnyCap para Gemini CLI, Adicione geração de imagem e vídeo ao CLI do Google",
      description:
        "O Gemini CLI pode raciocinar, programar e pesquisar. O AnyCap adiciona geração de imagem, geração de vídeo e entendimento visual, dando ao Gemini CLI a camada de capacidade multimodal que ele precisa para fluxos de agente em produção.",
      openGraphTitle: "AnyCap para Gemini CLI, capacidades multimodais em um runtime",
      openGraphDescription:
        "Adicione geração de imagem, geração de vídeo e entendimento visual ao Gemini CLI em minutos. AnyCap é o runtime de capacidade que fecha a lacuna.",
    },
    breadcrumbItems: [
      { name: "Início", href: "/" },
      { name: "Equipar Agentes", href: "/for", unlinkable: true },
      { name: "Gemini CLI" },
    ],
    hero: {
      ...en.hero,
      eyebrow: "Equipar Agentes",
      lastUpdatedLabel: "Atualizado em 20 de abril de 2026",
      titleLine1: "Feche a lacuna de capacidade",
      titleLine2: "no Gemini CLI",
      intro:
        "O Gemini CLI é o CLI de agente de IA de código aberto do Google, ele raciocina com modelos Gemini, executa código, pesquisa na web e lê arquivos. O que ele não consegue fazer nativamente: gerar imagens, gerar vídeos ou entender entradas visuais no nível de chamada de capacidade. O AnyCap preenche essa lacuna.",
      ctaPrimary: "Instalar AnyCap",
      ctaSecondary: "Ver capacidades",
    },
    gapTitle: "O que o Gemini CLI não consegue fazer sem o AnyCap",
    gapIntro:
      "O Gemini CLI lida bem com raciocínio e tarefas centradas em código. A lacuna está nas capacidades multimodais de produção.",
    gapHeaders: {
      capability: "Capacidade",
      gemini: "Gemini CLI sozinho",
      anycap: "Com AnyCap",
    },
    installTitle: "Adicione o AnyCap ao Gemini CLI em três etapas",
    installIntro:
      "Instalar o AnyCap e conectá-lo ao Gemini CLI leva cerca de dois minutos.",
    commandsTitle: "O que o Gemini CLI pode fazer com o AnyCap",
    commandsIntro:
      "Com o skill AnyCap ativo, o Gemini CLI pode invocar qualquer um desses comandos de capacidade como parte de um fluxo de trabalho de agente.",
    patternTitle: "Como o Gemini CLI decide o que chamar",
    whyTitle: "Por que um runtime de capacidade, não uma API direta",
    faqTitle: "Perguntas frequentes",
    relatedTitle: "Saiba mais",
    relatedLinks: [
      {
        label: "Geração de imagem",
        href: "/capabilities/image-generation",
        description: "Veja quais modelos de imagem estão disponíveis pelo AnyCap.",
      },
      {
        label: "Geração de vídeo",
        href: "/capabilities/video-generation",
        description: "Veja quais modelos de vídeo estão disponíveis pelo AnyCap.",
      },
      {
        label: "Instalar AnyCap",
        href: "/start",
        description: "Guia de instalação e autenticação passo a passo.",
      },
      {
        label: "AnyCap para Claude Code",
        href: "/for/claude-code",
        description: "O mesmo runtime de capacidade para fluxos do Claude Code.",
      },
    ],
  },
  id: {
    ...en,
    metadata: {
      title: "AnyCap untuk Gemini CLI, Tambahkan Pembuatan Gambar & Video ke CLI AI Google",
      description:
        "Gemini CLI bisa bernalar, menulis kode, dan mencari web. AnyCap menambahkan pembuatan gambar, pembuatan video, dan pemahaman visual — memberi Gemini CLI layer kapabilitas multimodal yang dibutuhkan untuk workflow agen produksi.",
      openGraphTitle: "AnyCap untuk Gemini CLI — kapabilitas multimodal dalam satu runtime",
      openGraphDescription:
        "Tambahkan pembuatan gambar, video, dan pemahaman visual ke Gemini CLI dalam hitungan menit.",
    },
    breadcrumbItems: [
      { name: "Beranda", href: "/" },
      { name: "Perlengkapan Agen", href: "/for", unlinkable: true },
      { name: "Gemini CLI" },
    ],
    hero: {
      ...en.hero,
      eyebrow: "Perlengkapan Agen",
      lastUpdatedLabel: "Diperbarui 20 April 2026",
      titleLine1: "Tutup kesenjangan kapabilitas",
      titleLine2: "di Gemini CLI",
      intro:
        "Gemini CLI adalah CLI agen AI open-source Google — ia bernalar dengan model Gemini, menjalankan kode, mencari web, dan membaca file. Yang tidak bisa dilakukan secara native: membuat gambar, membuat video, atau memahami input visual di level capability call. AnyCap mengisi kesenjangan itu.",
      ctaPrimary: "Pasang AnyCap",
      ctaSecondary: "Lihat kapabilitas",
    },
    gapTitle: "Apa yang tidak bisa dilakukan Gemini CLI tanpa AnyCap",
    gapIntro:
      "Gemini CLI menangani tugas penalaran dan kode dengan baik. Kesenjangan ada pada kapabilitas multimodal produksi.",
    gapHeaders: {
      capability: "Kapabilitas",
      gemini: "Gemini CLI saja",
      anycap: "Dengan AnyCap",
    },
    installTitle: "Tambahkan AnyCap ke Gemini CLI dalam tiga langkah",
    installIntro:
      "Menginstal AnyCap dan menghubungkannya ke Gemini CLI membutuhkan sekitar dua menit.",
    commandsTitle: "Apa yang bisa dilakukan Gemini CLI dengan AnyCap",
    commandsIntro:
      "Setelah skill AnyCap aktif, Gemini CLI bisa memanggil perintah kapabilitas ini.",
    patternTitle: "Bagaimana Gemini CLI memutuskan apa yang dipanggil",
    whyTitle: "Mengapa runtime kapabilitas, bukan API langsung",
    faqTitle: "Pertanyaan yang sering diajukan",
    relatedTitle: "Pelajari lebih lanjut",
    relatedLinks: [
      {
        label: "Pembuatan gambar",
        href: "/capabilities/image-generation",
        description: "Lihat model gambar yang tersedia melalui AnyCap.",
      },
      {
        label: "Pembuatan video",
        href: "/capabilities/video-generation",
        description: "Lihat model video yang tersedia melalui AnyCap.",
      },
      {
        label: "Pasang AnyCap",
        href: "/start",
        description: "Panduan instalasi dan autentikasi langkah demi langkah.",
      },
      {
        label: "AnyCap untuk Claude Code",
        href: "/for/claude-code",
        description: "Runtime kapabilitas yang sama untuk workflow Claude Code.",
      },
    ],
  },
  de: {
    ...en,
    metadata: {
      title: "AnyCap für Gemini CLI — Bild- & Videogenerierung zu Googles KI-Agent-CLI hinzufügen",
      description:
        "Gemini CLI kann schlussfolgern, Code schreiben und suchen. AnyCap fügt Bildgenerierung, Videogenerierung und visuelle Verarbeitung hinzu — und gibt Gemini CLI die vollständige multimodale Fähigkeitsschicht für Produktions-Workflows.",
      openGraphTitle: "AnyCap für Gemini CLI — multimodale Fähigkeiten in einer Runtime",
      openGraphDescription:
        "Bildgenerierung, Videogenerierung und Bildverständnis in Minuten zu Gemini CLI hinzufügen.",
    },
    breadcrumbItems: [
      { name: "Start", href: "/" },
      { name: "Agenten ausstatten", href: "/for", unlinkable: true },
      { name: "Gemini CLI" },
    ],
    hero: {
      ...en.hero,
      eyebrow: "Agenten ausstatten",
      lastUpdatedLabel: "Aktualisiert am 20. April 2026",
      titleLine1: "Die Fähigkeitslücke schließen",
      titleLine2: "in Gemini CLI",
      intro:
        "Gemini CLI ist Googles Open-Source-KI-Agent-CLI — es schlussfolgert mit Gemini-Modellen, führt Code aus, durchsucht das Web und liest Dateien. Was es nativ nicht kann: Bilder generieren, Videos generieren oder visuelle Eingaben auf Capability-Call-Ebene verstehen. AnyCap füllt diese Lücke.",
      ctaPrimary: "AnyCap installieren",
      ctaSecondary: "Fähigkeiten ansehen",
    },
    gapTitle: "Was Gemini CLI ohne AnyCap nicht kann",
    gapIntro:
      "Gemini CLI verarbeitet Schlussfolgerungs- und Code-Aufgaben gut. Die Lücke liegt bei produktiven multimodalen Fähigkeiten.",
    gapHeaders: {
      capability: "Fähigkeit",
      gemini: "Gemini CLI allein",
      anycap: "Mit AnyCap",
    },
    installTitle: "AnyCap in drei Schritten zu Gemini CLI hinzufügen",
    installIntro:
      "Die Installation von AnyCap und die Verbindung mit Gemini CLI dauert etwa zwei Minuten.",
    commandsTitle: "Was Gemini CLI mit AnyCap kann",
    commandsIntro:
      "Sobald das AnyCap-Skill aktiv ist, kann Gemini CLI diese Capability-Befehle aufrufen.",
    patternTitle: "Wie Gemini CLI entscheidet, was aufgerufen wird",
    whyTitle: "Warum eine Capability-Runtime und keine direkte API",
    faqTitle: "Häufig gestellte Fragen",
    relatedTitle: "Mehr erfahren",
    relatedLinks: [
      {
        label: "Bildgenerierung",
        href: "/capabilities/image-generation",
        description: "Welche Bildmodelle durch AnyCap verfügbar sind.",
      },
      {
        label: "Videogenerierung",
        href: "/capabilities/video-generation",
        description: "Welche Videomodelle durch AnyCap verfügbar sind.",
      },
      {
        label: "AnyCap installieren",
        href: "/start",
        description: "Schritt-für-Schritt-Installations- und Authentifizierungsanleitung.",
      },
      {
        label: "AnyCap für Claude Code",
        href: "/for/claude-code",
        description: "Dieselbe Capability-Runtime für Claude-Code-Workflows.",
      },
    ],
  },
};

export function getForGeminiCliMetadata(locale: SiteLocale): Metadata {
  const content = contentByLocale[locale] ?? contentByLocale.en;
  return {
    title: content.metadata.title,
    description: content.metadata.description,
    openGraph: {
      type: "website",
      locale: getLocaleConfig(locale).ogLocale,
      url: FOR_GEMINI_CLI_PATH,
      siteName: siteConfig.siteName,
      title: content.metadata.openGraphTitle,
      description: content.metadata.openGraphDescription,
    },
  };
}

export function getForGeminiCliPageData(locale: SiteLocale) {
  return contentByLocale[locale] ?? contentByLocale.en;
}
