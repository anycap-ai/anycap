import type { Metadata } from "next";
import { createTechArticleJsonLd } from "@/lib/schema";
import { getLocaleConfig, siteConfig, type SiteLocale } from "@/lib/site";

export const HOW_TO_USE_VEO_3_IN_AI_AGENT_PATH = "/guides/how-to-use-veo-3-in-ai-agent";

const LAST_UPDATED_ISO = "2026-04-20";

type Veo3GuidePageData = {
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

const en: Veo3GuidePageData = {
  metadata: {
    title: "How to Use Veo 3.1 in an AI Agent, Workflow Guide",
    description:
      "Step-by-step guide to adding Google DeepMind's Veo 3.1 video generation to an AI agent. Learn how AnyCap routes Veo 3.1 through a single capability runtime so Claude Code, Cursor, Codex, or any agent can generate video with one command.",
    openGraphTitle: "How to Use Veo 3.1 in an AI Agent",
    openGraphDescription:
      "Add Veo 3.1 video generation to any AI agent in minutes using AnyCap. One CLI command, no provider SDK required.",
  },
  breadcrumbItems: [
    { name: "Home", href: "/" },
    { name: "Guides", href: "/guides", unlinkable: true },
    { name: "How to Use Veo 3.1 in an AI Agent" },
  ],
  eyebrow: "Guide",
  lastUpdatedLabel: "Updated April 20, 2026",
  heroTitle: "How to use Veo 3.1 in an AI agent",
  heroIntro:
    "Veo 3.1 is Google DeepMind's latest video generation model. It produces high-fidelity, physics-consistent video clips from text prompts or image references, with strong temporal coherence across scenes. Adding it directly to an agent means integrating a Google Cloud credential path, managing async job polling, and parsing a separate response schema. AnyCap solves this by exposing Veo 3.1 through the same capability runtime an agent already uses for image generation, one command, one auth path, one response format.",
  articleJsonLd: createTechArticleJsonLd({
    headline: "How to Use Veo 3.1 in an AI Agent, Workflow Guide",
    description:
      "Step-by-step guide to adding Google DeepMind's Veo 3.1 video generation to an AI agent using AnyCap as the capability runtime.",
    path: HOW_TO_USE_VEO_3_IN_AI_AGENT_PATH,
    about: ["Veo 3.1", "AI agents", "Video generation", "AnyCap", "Google DeepMind"],
    keywords: [
      "veo 3.1 api",
      "veo 3 ai agent",
      "how to use veo 3 in agent",
      "video generation agent",
      "anycap video generate",
      "google deepmind veo",
    ],
    datePublished: LAST_UPDATED_ISO,
    dateModified: LAST_UPDATED_ISO,
  }),
  pillarsTitle: "Three things that matter when adding video generation to an agent",
  pillars: [
    {
      title: "Async job handling",
      body: "Video generation takes 30–120 seconds. The agent needs a job ID, a stable polling surface, and clear completion semantics. A missing polling loop causes the agent to either block or lose the result.",
    },
    {
      title: "Consistent response schema",
      body: "The agent doesn't watch the video. It parses the response. An API that returns the video URL in a predictable field survives prompt drift. One that changes response shape across API versions breaks the loop.",
    },
    {
      title: "Single auth surface",
      body: "Every additional provider credential is another secret to rotate, another error vocabulary, and another rate-limit surface. Routing Veo 3.1 through AnyCap means the agent authenticates once and routes multiple video models without separate SDK integrations.",
    },
  ],
  whyItMattersTitle: "Why Veo 3.1 matters for agent video workflows",
  whyItMatters: [
    "Veo 3.1 is currently the strongest model for cinematic quality, temporal coherence, and text-to-video prompting with physical plausibility. In agent workflows, automated content pipelines, product demo generation, code-driven video creation, these properties translate into more reliable outputs with fewer retry loops. An agent that generates a 5-second product clip from a structured prompt needs the output to land well consistently, not occasionally.",
    "The integration challenge is the real constraint. Veo 3.1 runs through Google's Vertex AI infrastructure, which requires separate credential management, a different job-polling pattern, and a different response envelope than the image generation APIs most agents already use. AnyCap normalizes all of this: the agent calls anycap video generate with a model flag, and the runtime handles credential resolution, job submission, polling, and the final URL return. The workflow pattern for Veo 3.1 is identical to Kling or Seedance, the agent doesn't need to know which provider is running.",
  ],
  patternTitle: "Decision pattern for video in an agent",
  patternSteps: [
    "Need text only? → stay in the prompt",
    "Need a new video clip? → anycap video generate",
    "Specify the model? → anycap video generate --model veo-3-1",
    "Need to analyze a video? → anycap video read",
  ],
  stepsTitle: "How to add Veo 3.1 to your agent",
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
      title: "Generate a video with Veo 3.1",
      body: "Run a video generation job targeting Veo 3.1. The runtime submits the job to Google DeepMind infrastructure, polls until complete, and returns the video URL.",
      code: 'anycap video generate --model veo-3-1 --prompt "a timelapse of a cityscape at dusk"',
    },
    {
      title: "Use the result in the agent loop",
      body: "The response is JSON with a predictable video URL field. The agent can store it, forward it, or chain it with the next task, no provider-specific parsing needed.",
    },
  ],
  cta: [
    { label: "Veo 3.1 Model Page", href: "/models/veo-3-1" },
    { label: "Video Generation", href: "/capabilities/video-generation" },
    { label: "Install AnyCap", href: "/guides/install-anycap" },
  ],
};

const contentByLocale: Record<SiteLocale, Veo3GuidePageData> = {
  en,
  "pt-br": {
    ...en,
    metadata: {
      title: "Como usar o Veo 3.1 em um agente de IA — Guia de fluxo",
      description:
        "Guia passo a passo para adicionar a geração de vídeo Veo 3.1 do Google DeepMind a um agente de IA. Aprenda como o AnyCap roteia o Veo 3.1 por um runtime de capacidade único.",
      openGraphTitle: "Como usar o Veo 3.1 em um agente de IA",
      openGraphDescription:
        "Adicione geração de vídeo Veo 3.1 a qualquer agente de IA em minutos usando o AnyCap. Um comando de CLI, sem SDK do fornecedor.",
    },
    breadcrumbItems: [
      { name: "Início", href: "/" },
      { name: "Guias", href: "/guides", unlinkable: true },
      { name: "Como usar o Veo 3.1 em um agente de IA" },
    ],
    eyebrow: "Guia",
    lastUpdatedLabel: "Atualizado em 20 de abril de 2026",
    heroTitle: "Como usar o Veo 3.1 em um agente de IA",
    pillarsTitle: "Três pontos que importam ao adicionar geração de vídeo a um agente",
    whyItMattersTitle: "Por que o Veo 3.1 importa para fluxos de vídeo em agentes",
    patternTitle: "Padrão de decisão para vídeo em um agente",
    stepsTitle: "Como adicionar o Veo 3.1 ao seu agente",
    cta: [
      { label: "Página do modelo Veo 3.1", href: "/models/veo-3-1" },
      { label: "Geração de vídeo", href: "/capabilities/video-generation" },
      { label: "Instalar AnyCap", href: "/guides/install-anycap" },
    ],
  },
  id: {
    ...en,
    metadata: {
      title: "Cara Menggunakan Veo 3.1 di Agen AI — Panduan Workflow",
      description:
        "Panduan langkah demi langkah untuk menambahkan pembuatan video Veo 3.1 Google DeepMind ke agen AI. Pelajari cara AnyCap merutekan Veo 3.1 melalui satu runtime kapabilitas.",
      openGraphTitle: "Cara Menggunakan Veo 3.1 di Agen AI",
      openGraphDescription:
        "Tambahkan pembuatan video Veo 3.1 ke agen AI mana pun dalam hitungan menit menggunakan AnyCap.",
    },
    breadcrumbItems: [
      { name: "Beranda", href: "/" },
      { name: "Panduan", href: "/guides", unlinkable: true },
      { name: "Cara Menggunakan Veo 3.1 di Agen AI" },
    ],
    eyebrow: "Panduan",
    lastUpdatedLabel: "Diperbarui 20 April 2026",
    heroTitle: "Cara menggunakan Veo 3.1 di agen AI",
    pillarsTitle: "Tiga hal yang penting saat menambahkan pembuatan video ke agen",
    whyItMattersTitle: "Mengapa Veo 3.1 penting untuk workflow video di agen",
    patternTitle: "Pola keputusan untuk video di agen",
    stepsTitle: "Cara menambahkan Veo 3.1 ke agen Anda",
    cta: [
      { label: "Halaman model Veo 3.1", href: "/models/veo-3-1" },
      { label: "Pembuatan video", href: "/capabilities/video-generation" },
      { label: "Pasang AnyCap", href: "/guides/install-anycap" },
    ],
  },
  de: {
    ...en,
    metadata: {
      title: "Veo 3.1 in einem KI-Agenten nutzen — Workflow-Anleitung",
      description:
        "Schritt-für-Schritt-Anleitung zum Hinzufügen von Google DeepMinds Veo 3.1 Videogenerierung zu einem KI-Agenten. Erfahren Sie, wie AnyCap Veo 3.1 über eine einzige Capability-Runtime bereitstellt.",
      openGraphTitle: "Veo 3.1 in einem KI-Agenten nutzen",
      openGraphDescription:
        "Veo 3.1-Videogenerierung in Minuten zu jedem KI-Agenten hinzufügen — mit AnyCap, einem CLI-Befehl.",
    },
    breadcrumbItems: [
      { name: "Start", href: "/" },
      { name: "Anleitungen", href: "/guides", unlinkable: true },
      { name: "Veo 3.1 in einem KI-Agenten nutzen" },
    ],
    eyebrow: "Anleitung",
    lastUpdatedLabel: "Aktualisiert am 20. April 2026",
    heroTitle: "Veo 3.1 in einem KI-Agenten nutzen",
    pillarsTitle: "Drei Dinge, die bei der Integration von Videogenerierung in Agenten wichtig sind",
    whyItMattersTitle: "Warum Veo 3.1 für agentische Video-Workflows wichtig ist",
    patternTitle: "Entscheidungsmuster für Video in einem Agenten",
    stepsTitle: "So fügen Sie Veo 3.1 Ihrem Agenten hinzu",
    cta: [
      { label: "Veo 3.1 Modell-Seite", href: "/models/veo-3-1" },
      { label: "Videogenerierung", href: "/capabilities/video-generation" },
      { label: "AnyCap installieren", href: "/guides/install-anycap" },
    ],
  },
};

export function getHowToUseVeo3InAiAgentMetadata(locale: SiteLocale): Metadata {
  const content = contentByLocale[locale] ?? contentByLocale.en;
  return {
    title: content.metadata.title,
    description: content.metadata.description,
    openGraph: {
      type: "website",
      locale: getLocaleConfig(locale).ogLocale,
      url: HOW_TO_USE_VEO_3_IN_AI_AGENT_PATH,
      siteName: siteConfig.siteName,
      title: content.metadata.openGraphTitle,
      description: content.metadata.openGraphDescription,
    },
  };
}

export function getHowToUseVeo3InAiAgentPageData(locale: SiteLocale) {
  return contentByLocale[locale] ?? contentByLocale.en;
}
