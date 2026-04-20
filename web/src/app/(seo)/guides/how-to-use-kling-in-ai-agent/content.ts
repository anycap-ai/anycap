import type { Metadata } from "next";
import { createTechArticleJsonLd } from "@/lib/schema";
import { getLocaleConfig, siteConfig, type SiteLocale } from "@/lib/site";

export const HOW_TO_USE_KLING_IN_AI_AGENT_PATH = "/guides/how-to-use-kling-in-ai-agent";

const LAST_UPDATED_ISO = "2026-04-20";

type KlingGuidePageData = {
  metadata: {
    title: string;
    description: string;
    openGraphTitle: string;
    openGraphDescription: string;
  };
  breadcrumbItems: readonly { name: string; href?: string; unlinkable?: boolean }[];
  eyebrow: string;
  lastUpdatedLabel: string;
  heroTitle: string;
  heroIntro: string;
  articleJsonLd: Record<string, unknown>;
  pillarsTitle: string;
  pillars: readonly { title: string; body: string }[];
  whyItMattersTitle: string;
  whyItMatters: readonly string[];
  patternTitle: string;
  patternSteps: readonly string[];
  stepsTitle: string;
  steps: readonly { title: string; body: string; code?: string }[];
  cta: readonly { label: string; href: string }[];
};

const en: KlingGuidePageData = {
  metadata: {
    title: "How to Use Kling 3.0 in an AI Agent, Workflow Guide",
    description:
      "Step-by-step guide to adding Kuaishou's Kling 3.0 video generation to an AI agent. Learn how AnyCap routes Kling 3.0 through a single capability runtime so Claude Code, Cursor, Codex, or any agent can generate cinematic video with one command.",
    openGraphTitle: "How to Use Kling 3.0 in an AI Agent",
    openGraphDescription:
      "Add Kling 3.0 video generation to any AI agent in minutes using AnyCap. One CLI command, no provider SDK required.",
  },
  breadcrumbItems: [
    { name: "Home", href: "/" },
    { name: "Guides", href: "/guides", unlinkable: true },
    { name: "How to Use Kling 3.0 in an AI Agent" },
  ],
  eyebrow: "Guide",
  lastUpdatedLabel: "Updated April 20, 2026",
  heroTitle: "How to use Kling 3.0 in an AI agent",
  heroIntro:
    "Kling 3.0 is Kuaishou's latest video generation model. It produces smooth, high-motion video with strong character consistency and cinematographic control, image-to-video, text-to-video, and prompt-guided camera movement. Adding Kling directly to an agent means setting up a separate API credential, handling async job polling against a different response schema, and managing retries on a separate rate-limit surface. AnyCap abstracts all of this: the agent calls a single video generate command with a model flag, and the runtime handles the Kling-specific integration underneath.",
  articleJsonLd: createTechArticleJsonLd({
    headline: "How to Use Kling 3.0 in an AI Agent, Workflow Guide",
    description:
      "Step-by-step guide to adding Kuaishou's Kling 3.0 video generation to an AI agent using AnyCap as the capability runtime.",
    path: HOW_TO_USE_KLING_IN_AI_AGENT_PATH,
    about: ["Kling 3.0", "AI agents", "Video generation", "AnyCap", "Kuaishou"],
    keywords: [
      "kling 3.0 api",
      "kling ai agent",
      "how to use kling in agent",
      "video generation agent",
      "anycap video generate",
      "kuaishou kling",
      "kling image to video",
    ],
    datePublished: LAST_UPDATED_ISO,
    dateModified: LAST_UPDATED_ISO,
  }),
  pillarsTitle: "Three things that matter when adding Kling to an agent",
  pillars: [
    {
      title: "Image-to-video capability",
      body: "Kling's strongest use case in agent workflows is image-to-video: the agent generates or retrieves a reference image, then calls Kling to animate it. This chain requires passing a reference URL cleanly, AnyCap handles upload resolution automatically.",
    },
    {
      title: "Camera motion control",
      body: "Kling 3.0 supports prompt-level camera direction (pan, zoom, crane shot). Agents can encode these instructions into structured generation prompts, giving programmatic control over cinematic output without a human director in the loop.",
    },
    {
      title: "Consistent async polling",
      body: "Kling jobs complete in 30–90 seconds depending on clip length and resolution. The agent needs a predictable polling surface. AnyCap normalizes the Kling job lifecycle into the same response schema used by all video models, job submitted, polling, result URL.",
    },
  ],
  whyItMattersTitle: "Why Kling 3.0 matters for agent video workflows",
  whyItMatters: [
    "Kling 3.0 is among the top-ranked video models for motion quality and character consistency. For agents building automated video content, product showcases, social media clips, animated storyboards, Kling's ability to maintain subject identity across frames is a significant advantage over models that produce high-quality single frames but drift across a clip.",
    "The key agent workflow is the image-to-video chain: an upstream step generates a product or character image (using AnyCap image generation), and Kling 3.0 then animates it. Both steps run through the same AnyCap runtime, so the agent only holds one credential and the second step can reference the first output by URL without format conversion. This reduces retry complexity and keeps the chain auditable end-to-end.",
  ],
  patternTitle: "Decision pattern for Kling in an agent",
  patternSteps: [
    "Need text only? → stay in the prompt",
    "Need a new video clip from text? → anycap video generate --model kling-3-0",
    "Need to animate an image? → anycap video generate --model kling-3-0 --image <url>",
    "Need to analyze a video? → anycap video read",
  ],
  stepsTitle: "How to add Kling 3.0 to your agent",
  steps: [
    {
      title: "Install or verify AnyCap",
      body: "If you don't have AnyCap installed, install it with the one-line install script. If you have it, verify it's up to date.",
      code: "curl -fsSL https://anycap.ai/install.sh | sh && anycap login && anycap status",
    },
    {
      title: "Add AnyCap as a skill to your agent",
      body: "For Claude Code, Cursor, or Codex, add the AnyCap skill so the agent can discover and call video generation capabilities from its context.",
      code: "npx -y skills add anycap-ai/anycap -a claude-code -y",
    },
    {
      title: "Generate a video with Kling 3.0",
      body: "Run a video generation job targeting Kling 3.0. For image-to-video, pass an image URL. For text-to-video, pass only a prompt.",
      code: 'anycap video generate --model kling-3-0 --prompt "a product rotating on a minimalist white surface"',
    },
    {
      title: "Use the result in the agent loop",
      body: "The response is JSON with a predictable video URL field. The agent can store it, forward it to a delivery system, or chain it with the next task.",
    },
  ],
  cta: [
    { label: "Kling 3.0 Model Page", href: "/models/kling-3-0" },
    { label: "Video Generation", href: "/capabilities/video-generation" },
    { label: "Install AnyCap", href: "/guides/install-anycap" },
  ],
};

const contentByLocale: Record<SiteLocale, KlingGuidePageData> = {
  en,
  "pt-br": {
    ...en,
    metadata: {
      title: "Como usar o Kling 3.0 em um agente de IA — Guia de fluxo",
      description:
        "Guia passo a passo para adicionar a geração de vídeo Kling 3.0 da Kuaishou a um agente de IA. Aprenda como o AnyCap roteia o Kling 3.0 por um runtime de capacidade único.",
      openGraphTitle: "Como usar o Kling 3.0 em um agente de IA",
      openGraphDescription:
        "Adicione geração de vídeo Kling 3.0 a qualquer agente de IA em minutos usando o AnyCap.",
    },
    breadcrumbItems: [
      { name: "Início", href: "/" },
      { name: "Guias", href: "/guides", unlinkable: true },
      { name: "Como usar o Kling 3.0 em um agente de IA" },
    ],
    eyebrow: "Guia",
    lastUpdatedLabel: "Atualizado em 20 de abril de 2026",
    heroTitle: "Como usar o Kling 3.0 em um agente de IA",
    pillarsTitle: "Três pontos que importam ao adicionar o Kling a um agente",
    whyItMattersTitle: "Por que o Kling 3.0 importa para fluxos de vídeo em agentes",
    patternTitle: "Padrão de decisão para o Kling em um agente",
    stepsTitle: "Como adicionar o Kling 3.0 ao seu agente",
    cta: [
      { label: "Página do modelo Kling 3.0", href: "/models/kling-3-0" },
      { label: "Geração de vídeo", href: "/capabilities/video-generation" },
      { label: "Instalar AnyCap", href: "/guides/install-anycap" },
    ],
  },
  id: {
    ...en,
    metadata: {
      title: "Cara Menggunakan Kling 3.0 di Agen AI — Panduan Workflow",
      description:
        "Panduan langkah demi langkah untuk menambahkan pembuatan video Kling 3.0 Kuaishou ke agen AI. Pelajari cara AnyCap merutekan Kling 3.0 melalui satu runtime kapabilitas.",
      openGraphTitle: "Cara Menggunakan Kling 3.0 di Agen AI",
      openGraphDescription:
        "Tambahkan pembuatan video Kling 3.0 ke agen AI mana pun dalam hitungan menit menggunakan AnyCap.",
    },
    breadcrumbItems: [
      { name: "Beranda", href: "/" },
      { name: "Panduan", href: "/guides", unlinkable: true },
      { name: "Cara Menggunakan Kling 3.0 di Agen AI" },
    ],
    eyebrow: "Panduan",
    lastUpdatedLabel: "Diperbarui 20 April 2026",
    heroTitle: "Cara menggunakan Kling 3.0 di agen AI",
    pillarsTitle: "Tiga hal yang penting saat menambahkan Kling ke agen",
    whyItMattersTitle: "Mengapa Kling 3.0 penting untuk workflow video di agen",
    patternTitle: "Pola keputusan untuk Kling di agen",
    stepsTitle: "Cara menambahkan Kling 3.0 ke agen Anda",
    cta: [
      { label: "Halaman model Kling 3.0", href: "/models/kling-3-0" },
      { label: "Pembuatan video", href: "/capabilities/video-generation" },
      { label: "Pasang AnyCap", href: "/guides/install-anycap" },
    ],
  },
  de: {
    ...en,
    metadata: {
      title: "Kling 3.0 in einem KI-Agenten nutzen — Workflow-Anleitung",
      description:
        "Schritt-für-Schritt-Anleitung zum Hinzufügen von Kuaishous Kling 3.0 Videogenerierung zu einem KI-Agenten. Erfahren Sie, wie AnyCap Kling 3.0 über eine einzige Capability-Runtime bereitstellt.",
      openGraphTitle: "Kling 3.0 in einem KI-Agenten nutzen",
      openGraphDescription:
        "Kling 3.0-Videogenerierung in Minuten zu jedem KI-Agenten hinzufügen — mit AnyCap, einem CLI-Befehl.",
    },
    breadcrumbItems: [
      { name: "Start", href: "/" },
      { name: "Anleitungen", href: "/guides", unlinkable: true },
      { name: "Kling 3.0 in einem KI-Agenten nutzen" },
    ],
    eyebrow: "Anleitung",
    lastUpdatedLabel: "Aktualisiert am 20. April 2026",
    heroTitle: "Kling 3.0 in einem KI-Agenten nutzen",
    pillarsTitle: "Drei Dinge, die bei der Integration von Kling in Agenten wichtig sind",
    whyItMattersTitle: "Warum Kling 3.0 für agentische Video-Workflows wichtig ist",
    patternTitle: "Entscheidungsmuster für Kling in einem Agenten",
    stepsTitle: "So fügen Sie Kling 3.0 Ihrem Agenten hinzu",
    cta: [
      { label: "Kling 3.0 Modell-Seite", href: "/models/kling-3-0" },
      { label: "Videogenerierung", href: "/capabilities/video-generation" },
      { label: "AnyCap installieren", href: "/guides/install-anycap" },
    ],
  },
};

export function getHowToUseKlingInAiAgentMetadata(locale: SiteLocale): Metadata {
  const content = contentByLocale[locale] ?? contentByLocale.en;
  return {
    title: content.metadata.title,
    description: content.metadata.description,
    openGraph: {
      type: "website",
      locale: getLocaleConfig(locale).ogLocale,
      url: HOW_TO_USE_KLING_IN_AI_AGENT_PATH,
      siteName: siteConfig.siteName,
      title: content.metadata.openGraphTitle,
      description: content.metadata.openGraphDescription,
    },
  };
}

export function getHowToUseKlingInAiAgentPageData(locale: SiteLocale) {
  return contentByLocale[locale] ?? contentByLocale.en;
}
