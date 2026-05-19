import type { Metadata } from "next";
import { createFaqPageJsonLd, createTechArticleJsonLd } from "@/lib/schema";
import { getLocaleConfig, siteConfig, type SiteLocale } from "@/lib/site";

export const ANYCAP_VS_TOGETHER_AI_PATH = "/compare/anycap-vs-together-ai";

type ComparePageData = {
  breadcrumbItems: readonly { name: string; href?: string; unlinkable?: boolean }[];
  eyebrow: string;
  metadata: {
    title: string;
    description: string;
    openGraphTitle: string;
    openGraphDescription: string;
  };
  articleJsonLd: Record<string, unknown>;
  faqJsonLd: Record<string, unknown>;
  lastUpdatedLabel: string;
  heroTitle: [string, string];
  heroIntro: string;
  answerFirstSummaryLabel: string;
  answerFirstSummaryBody: string;
  comparisonTitle: string;
  comparisonHeaders: { dimension: string; anycap: string; together: string };
  comparisonRows: readonly { dimension: string; anycap: string; together: string }[];
  strengthsTitleLeft: string;
  strengthsTitleRight: string;
  strengthsLeft: readonly string[];
  strengthsRight: readonly string[];
  useCasesTitle: string;
  useCases: readonly { eyebrow: string; title: string; body: string }[];
  methodTitle: string;
  methodBody: readonly string[];
  methodologyNoteLabel: string;
  methodologyNoteBody: string;
  sourceTitle: string;
  sourceLinks: readonly { label: string; href: string; note: string }[];
  relatedTitle: string;
  relatedPages: readonly { href: string; eyebrow: string; title: string; body: string }[];
  faqTitle: string;
  faqItems: readonly { question: string; answer: string }[];
  ctas: readonly { href: string; label: string; variant: "primary" | "secondary" }[];
};

const lastUpdatedIso = "2026-04-20";

const en: ComparePageData = {
  breadcrumbItems: [
    { name: "Home", href: "/" },
    { name: "Compare", href: "/compare", unlinkable: true },
    { name: "AnyCap vs Together.ai" },
  ],
  eyebrow: "Compare",
  metadata: {
    title: "AnyCap vs Together.ai, Agent Capability Runtime vs Multi-Model Inference API",
    description:
      "AnyCap is a cross-agent capability runtime for Codex, Cursor, Claude Code, and Manus. Together.ai is a multi-model inference API with 50+ open-source models. Compare architecture, capability scope, and use cases.",
    openGraphTitle: "AnyCap vs Together.ai, agent runtime vs multi-model inference API",
    openGraphDescription:
      "See when Together.ai is the right multi-model API layer and when AnyCap is the stronger runtime for agent-facing capability execution.",
  },
  articleJsonLd: createTechArticleJsonLd({
    headline: "AnyCap vs Together.ai, agent capability runtime vs multi-model inference API",
    description:
      "Comparison guide for teams deciding between Together.ai's multi-model inference API and AnyCap's cross-agent capability runtime.",
    path: ANYCAP_VS_TOGETHER_AI_PATH,
    about: [
      "AnyCap",
      "Together.ai",
      "Agent capability runtime",
      "Multi-model inference",
      "Open-source model API",
    ],
    keywords: [
      "anycap vs together ai",
      "together ai alternative for agents",
      "together.ai vs anycap",
      "multi-model api vs capability runtime",
      "together ai for coding agents",
    ],
    datePublished: lastUpdatedIso,
    dateModified: lastUpdatedIso,
  }),
  faqJsonLd: createFaqPageJsonLd([
    {
      question: "Is Together.ai a direct AnyCap replacement?",
      answer:
        "No. Together.ai is a multi-model inference API that gives developers direct access to 50+ open-source language and image models. AnyCap is an agent capability runtime that packages multimodal execution, storage, and publishing into a CLI for coding agents. Different layers, different use cases.",
    },
    {
      question: "When should I choose Together.ai over AnyCap?",
      answer:
        "Choose Together.ai when you need programmatic access to a wide range of open-source models for text, code, or image tasks, especially when your application stack manages the request lifecycle directly.",
    },
    {
      question: "When is AnyCap the right choice?",
      answer:
        "AnyCap is the right choice when coding agents like Claude Code, Cursor, or Codex need to invoke media generation, vision, web search, storage, and publishing through one CLI without your team building a new API integration project.",
    },
  ]),
  lastUpdatedLabel: "April 20, 2026",
  heroTitle: ["AnyCap vs", "Together.ai"],
  heroIntro:
    "AnyCap vs Together.ai comes down to who is making the API call and why. Together.ai provides a unified inference API across 50+ open-source models, language models, image models, embedding models, behind a single API key. Teams use it to add flexible model access to backend services, research pipelines, and application code when they want fast inference on open-source models without the operational cost of hosting. AnyCap solves a different problem: it gives coding agents a persistent capability runtime. Instead of your team integrating model APIs into application code, AnyCap packages those capabilities into CLI commands that agents can invoke directly. The scope goes beyond generation to include vision, grounded web search, Drive storage, and Page publishing, the full lifecycle of what an agent might need to complete a multimodal task. The decision is usually clear in practice: if your application backend needs multi-model API access and owns the request lifecycle, Together.ai is the right fit. If your agents need to invoke capabilities inside existing agent workflows without a new integration project, AnyCap is the right runtime. Both can coexist: a backend service calling Together.ai for LLM inference could sit alongside an agent runtime using AnyCap for media and search. Understanding which bottleneck your team is actually solving prevents choosing the wrong abstraction layer and rebuilding it later.",
  answerFirstSummaryLabel: "Answer-first summary",
  answerFirstSummaryBody:
    "Choose Together.ai when your application or backend service needs programmatic multi-model inference, LLMs, open-source image models, embedding models, through a unified API. Choose AnyCap when your coding agents need media generation, vision, web search, storage, and publishing through one portable CLI runtime. The practical rule: if the request is made from application code, Together.ai fits. If the request is made by an agent, AnyCap fits. Teams often use both at different layers of the same product.",
  comparisonTitle: "Side-by-side comparison",
  comparisonHeaders: { dimension: "Dimension", anycap: "AnyCap", together: "Together.ai" },
  comparisonRows: [
    {
      dimension: "Primary job",
      anycap:
        "Agent capability runtime that gives coding agents a shared execution layer for image, video, vision, web search, storage, and publishing.",
      together:
        "Multi-model inference API that provides fast access to 50+ open-source LLMs and image models through a single REST endpoint and API key.",
    },
    {
      dimension: "Integration target",
      anycap:
        "Coding agents: Codex, Cursor, Claude Code, Manus, and other agent surfaces that need portable multimodal capability access.",
      together:
        "Backend services, research pipelines, and application code that need flexible model selection and fast inference on open-source models.",
    },
    {
      dimension: "Model access",
      anycap:
        "Curated production-ready models for image, video, music, vision, and audio, accessible through CLI commands, not raw API calls.",
      together:
        "50+ open-source models including Llama, Mistral, FLUX, and others, accessible through a unified inference API with per-model routing.",
    },
    {
      dimension: "Capability scope",
      anycap:
        "Image generation, video generation, music generation, image understanding, audio understanding, grounded web search, Drive storage, and Page publishing.",
      together:
        "Text generation, code generation, image generation, and embedding via open-source models. Request lifecycle managed by the calling application.",
    },
    {
      dimension: "Invocation pattern",
      anycap:
        "CLI commands invoked by agent inside agent shell. `anycap image generate`, `anycap video generate`. Output routed to agent context or Drive.",
      together:
        "REST API calls from application code. Compatible with OpenAI SDK format for drop-in model switching in existing integrations.",
    },
    {
      dimension: "Best fit",
      anycap: "Best when agents need capabilities delivered through a stable runtime with artifact handling.",
      together:
        "Best when backend code needs flexible, cost-efficient multi-model inference on open-source models without hosting overhead.",
    },
  ],
  strengthsTitleLeft: "Why teams choose AnyCap",
  strengthsTitleRight: "Why teams choose Together.ai",
  strengthsLeft: [
    "One CLI and one login equips multiple agent environments without rebuilding model integrations for each shell.",
    "Capabilities extend beyond generation to understanding, web retrieval, storage, and publishing, the full task completion cycle.",
    "No model selection required. AnyCap routes to the best production model for each capability, so agents focus on tasks, not model IDs.",
  ],
  strengthsRight: [
    "50+ open-source models behind a single API key, including FLUX image models, Llama language models, and fast embedding models.",
    "OpenAI-compatible API format makes it easy to switch models in existing integrations without changing application code structure.",
    "Competitive inference pricing on open-source models, especially for high-volume LLM and embedding workloads where cost per token matters.",
  ],
  useCasesTitle: "Best fit by use case",
  useCases: [
    {
      eyebrow: "Choose AnyCap if",
      title: "Coding agents need to generate or analyze media.",
      body:
        "AnyCap is stronger when Cursor, Claude Code, or Codex needs to invoke image generation, video generation, or vision inside an agent workflow, especially when the output needs to go to storage or a share link immediately.",
    },
    {
      eyebrow: "Choose Together.ai if",
      title: "Your backend needs flexible multi-model LLM access.",
      body:
        "Together.ai is the right fit when your application code needs to call Llama, Mistral, or other open-source LLMs at scale with cost-efficient inference and OpenAI-compatible API compatibility.",
    },
    {
      eyebrow: "Choose AnyCap if",
      title: "The workflow includes delivery, not just generation.",
      body:
        "AnyCap is stronger when generated content must become a hosted link or a Drive file right after creation, not just a JSON response that your application must then route and store manually.",
    },
    {
      eyebrow: "Choose Together.ai if",
      title: "You need open-source FLUX image generation in your backend.",
      body:
        "Together.ai gives direct access to FLUX and similar open-source image models via API. This is the right choice when your product stack needs raw model access rather than an agent-facing CLI abstraction.",
    },
  ],
  methodTitle: "How this comparison was reviewed",
  methodBody: [
    "The Together.ai side was reviewed against public Together.ai documentation available on April 20, 2026. Claims are intentionally narrow: Together.ai provides 50+ open-source models through a unified inference API, supports OpenAI-compatible format, and includes FLUX image generation among available models.",
    "The AnyCap side is based on published AnyCap pages for the CLI, capabilities, Drive, and pricing. Only public claims visible on the product surface are used.",
  ],
  methodologyNoteLabel: "Methodology note",
  methodologyNoteBody:
    "This page compares primary use cases and integration patterns, not total product breadth. Together.ai and AnyCap both add capabilities over time. If significant overlaps emerge, this page should be updated.",
  sourceTitle: "Source notes",
  sourceLinks: [
    {
      label: "Together.ai inference API",
      href: "https://docs.together.ai/docs/inference-models",
      note: "Model catalog and API format for Together.ai inference endpoints.",
    },
    {
      label: "Together.ai image generation",
      href: "https://docs.together.ai/docs/image-generation",
      note: "FLUX and other image models available through Together.ai inference API.",
    },
    {
      label: "AnyCap image generation",
      href: "/capabilities/image-generation",
      note: "The public image generation surface exposed through the AnyCap runtime.",
    },
    {
      label: "AnyCap video generation",
      href: "/capabilities/video-generation",
      note: "Video generation capability accessible to agents through one CLI command.",
    },
    {
      label: "Install AnyCap",
      href: "/start",
      note: "Setup flow for agent environments that need a portable capability runtime.",
    },
  ],
  relatedTitle: "Related pages",
  relatedPages: [
    {
      href: "/compare/anycap-vs-fal-ai",
      eyebrow: "Compare",
      title: "AnyCap vs fal.ai",
      body: "Compare AnyCap to a generative media API with queue-backed inference and webhook support.",
    },
    {
      href: "/compare/anycap-vs-replicate",
      eyebrow: "Compare",
      title: "AnyCap vs Replicate",
      body: "Compare AnyCap to a model hosting and inference platform with a large open-source model catalog.",
    },
    {
      href: "/capabilities/image-generation",
      eyebrow: "Product",
      title: "Image Generation",
      body: "See how AnyCap exposes image generation to agents through one CLI command.",
    },
    {
      href: "/start",
      eyebrow: "Start here",
      title: "Install AnyCap",
      body: "Validate the runtime directly in your agent workflow instead of staying in comparison mode.",
    },
  ],
  faqTitle: "FAQ",
  faqItems: [
    {
      question: "Is Together.ai a direct AnyCap replacement?",
      answer:
        "No. Together.ai is a multi-model inference API for application developers who need flexible, cost-efficient access to open-source LLMs and image models. AnyCap is an agent capability runtime for teams whose coding agents need media, vision, web search, storage, and publishing through one CLI. The integration targets are different: Together.ai is called from application code, AnyCap is invoked by agents inside agent shells. Teams with both needs often use both at separate layers.",
    },
    {
      question: "Does Together.ai support FLUX image generation?",
      answer:
        "Yes. Together.ai's public model catalog includes FLUX image generation models accessible through its unified inference API. This makes Together.ai a strong option when your backend stack needs direct, flexible access to FLUX without a separate model hosting contract. AnyCap also supports production image models but abstracts the model selection behind a CLI command rather than exposing raw API routing.",
    },
    {
      question: "Can I use Together.ai through AnyCap?",
      answer:
        "AnyCap manages its own model routing infrastructure and does not expose a direct Together.ai integration path. AnyCap's value is a curated, agent-facing CLI that selects the best production model for each capability, not a passthrough to a specific inference API. If you need raw Together.ai model access for backend code, call Together.ai directly.",
    },
    {
      question: "When is AnyCap the cleaner choice?",
      answer:
        "AnyCap is cleaner when coding agents already exist and the goal is extending those agents with media, vision, search, and publishing capabilities without building a new API integration project. One runtime installs once, authenticates once, and gives every agent shell access to the same capability surface. Together.ai requires application code to own the model selection, request lifecycle, and output handling — which adds integration work when agents are the primary consumers.",
    },
    {
      question: "What is the simplest rule of thumb?",
      answer:
        "If your application code needs multi-model LLM or open-source image access with full control over model selection, use Together.ai. If your coding agents need media generation, vision, web search, and storage through one portable CLI, use AnyCap. Both products can coexist at separate layers of the same workflow.",
    },
  ],
  ctas: [
    { href: "/start", label: "Install AnyCap", variant: "primary" },
    { href: "/capabilities/image-generation", label: "Image Generation", variant: "secondary" },
    { href: "/capabilities/video-generation", label: "Video Generation", variant: "secondary" },
  ],
};

const ptBr: ComparePageData = {
  ...en,
  breadcrumbItems: [
    { name: "Início", href: "/" },
    { name: "Comparar", href: "/compare", unlinkable: true },
    { name: "AnyCap vs Together.ai" },
  ],
  eyebrow: "Comparar",
  metadata: {
    title: "AnyCap vs Together.ai — runtime de agente vs API de inferência multi-modelo",
    description:
      "AnyCap é um runtime de capacidades para agentes para Codex, Cursor, Claude Code e Manus. Together.ai é uma API de inferência multi-modelo com mais de 50 modelos open-source. Compare arquitetura e casos de uso.",
    openGraphTitle: "AnyCap vs Together.ai — runtime de agente vs API de inferência multi-modelo",
    openGraphDescription:
      "Veja quando o Together.ai é a camada certa de API multi-modelo e quando o AnyCap é o runtime mais forte para execução de capacidades orientado por agente.",
  },
  lastUpdatedLabel: "20 de abril de 2026",
  comparisonHeaders: { dimension: "Dimensão", anycap: "AnyCap", together: "Together.ai" },
  ctas: [
    { href: "/start", label: "Instalar o AnyCap", variant: "primary" },
    { href: "/capabilities/image-generation", label: "Geração de imagem", variant: "secondary" },
    { href: "/capabilities/video-generation", label: "Geração de vídeo", variant: "secondary" },
  ],
};

const id: ComparePageData = {
  ...en,
  breadcrumbItems: [
    { name: "Beranda", href: "/" },
    { name: "Perbandingan", href: "/compare", unlinkable: true },
    { name: "AnyCap vs Together.ai" },
  ],
  eyebrow: "Perbandingan",
  metadata: {
    title: "AnyCap vs Together.ai — runtime kemampuan agent vs API inferensi multi-model",
    description:
      "AnyCap adalah runtime kemampuan lintas-agent untuk Codex, Cursor, Claude Code, dan Manus. Together.ai adalah API inferensi multi-model dengan 50+ model open-source. Bandingkan arsitektur dan kasus penggunaan.",
    openGraphTitle: "AnyCap vs Together.ai — runtime agent vs API inferensi multi-model",
    openGraphDescription:
      "Lihat kapan Together.ai adalah lapisan API multi-model yang tepat dan kapan AnyCap adalah runtime yang lebih kuat untuk eksekusi kemampuan berbasis agent.",
  },
  lastUpdatedLabel: "20 April 2026",
  comparisonHeaders: { dimension: "Dimensi", anycap: "AnyCap", together: "Together.ai" },
  ctas: [
    { href: "/start", label: "Instal AnyCap", variant: "primary" },
    { href: "/capabilities/image-generation", label: "Pembuatan gambar", variant: "secondary" },
    { href: "/capabilities/video-generation", label: "Pembuatan video", variant: "secondary" },
  ],
};

const de: ComparePageData = {
  ...en,
  breadcrumbItems: [
    { name: "Startseite", href: "/" },
    { name: "Vergleich", href: "/compare", unlinkable: true },
    { name: "AnyCap vs Together.ai" },
  ],
  eyebrow: "Vergleich",
  metadata: {
    title: "AnyCap vs Together.ai — Agent-Capability-Runtime vs Multi-Model-Inferenz-API",
    description:
      "AnyCap ist eine agentenübergreifende Capability-Runtime für Codex, Cursor, Claude Code und Manus. Together.ai ist eine Multi-Model-Inferenz-API mit 50+ Open-Source-Modellen. Vergleichen Sie Architektur und Anwendungsfälle.",
    openGraphTitle: "AnyCap vs Together.ai — Agent-Runtime vs Multi-Model-Inferenz-API",
    openGraphDescription:
      "Erfahren Sie, wann Together.ai die richtige Multi-Model-API-Schicht ist und wann AnyCap die stärkere Runtime für agentenorientierten Capability-Zugang darstellt.",
  },
  lastUpdatedLabel: "20. April 2026",
  comparisonHeaders: { dimension: "Dimension", anycap: "AnyCap", together: "Together.ai" },
  ctas: [
    { href: "/start", label: "AnyCap installieren", variant: "primary" },
    { href: "/capabilities/image-generation", label: "Bildgenerierung", variant: "secondary" },
    { href: "/capabilities/video-generation", label: "Videogenerierung", variant: "secondary" },
  ],
};

const contentByLocale: Record<SiteLocale, ComparePageData> = {
  en,
  "pt-br": ptBr,
  id,
  de,
};

export function getAnyCapVsTogetherAiMetadata(locale: SiteLocale): Metadata {
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

export function getAnyCapVsTogetherAiPageData(locale: SiteLocale) {
  return contentByLocale[locale] ?? contentByLocale.en;
}
