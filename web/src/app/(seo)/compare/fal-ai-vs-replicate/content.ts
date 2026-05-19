import type { Metadata } from "next";
import { createFaqPageJsonLd, createTechArticleJsonLd } from "@/lib/schema";
import { getLocaleConfig, siteConfig, type SiteLocale } from "@/lib/site";

export const FAL_AI_VS_REPLICATE_PATH = "/compare/fal-ai-vs-replicate";

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
  comparisonHeaders: { dimension: string; fal: string; replicate: string };
  comparisonRows: readonly { dimension: string; fal: string; replicate: string }[];
  anycapAlternativeTitle: string;
  anycapAlternativeBody: string;
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
    { name: "fal.ai vs Replicate" },
  ],
  eyebrow: "Compare",
  metadata: {
    title: "fal.ai vs Replicate, Which Generative Media API Is Right for Your Agent?",
    description:
      "fal.ai vs Replicate: compare queue-backed async inference and webhook control (fal.ai) against a broad open-source model catalog with versioned API endpoints (Replicate). Plus: when AnyCap is the agent-native alternative to both.",
    openGraphTitle: "fal.ai vs Replicate, generative media API comparison for agents",
    openGraphDescription:
      "Compare fal.ai and Replicate for agent workflows. See the differences in inference model, model catalog, and lifecycle control, and when AnyCap is the better fit.",
  },
  articleJsonLd: createTechArticleJsonLd({
    headline: "fal.ai vs Replicate, which generative media API fits your agent workflow?",
    description:
      "Comparison guide for teams choosing between fal.ai and Replicate for media generation in AI agent workflows, with AnyCap as an agent-native alternative.",
    path: FAL_AI_VS_REPLICATE_PATH,
    about: [
      "fal.ai",
      "Replicate",
      "AnyCap",
      "Generative media API",
      "Agent capability runtime",
      "Image generation API",
      "Video generation API",
    ],
    keywords: [
      "fal ai vs replicate",
      "fal.ai or replicate for agents",
      "best generative media api",
      "replicate alternative",
      "fal ai alternative",
    ],
    datePublished: lastUpdatedIso,
    dateModified: lastUpdatedIso,
  }),
  faqJsonLd: createFaqPageJsonLd([
    {
      question: "Is fal.ai better than Replicate for image generation?",
      answer:
        "fal.ai offers lower latency on select models and stronger async primitives with webhook support, making it better for production pipelines that need queue-backed inference. Replicate has a broader versioned model catalog and simpler per-model pricing, which is better when model variety matters more than latency optimization.",
    },
    {
      question: "When should I use neither fal.ai nor Replicate?",
      answer:
        "When your team uses coding agents like Claude Code, Cursor, or Codex, a direct API integration with either fal.ai or Replicate requires your team to build and maintain the request lifecycle in application code. AnyCap packages these capabilities into a CLI that agents invoke directly, removing the integration overhead for agent-first workflows.",
    },
    {
      question: "What is AnyCap and how does it relate to fal.ai and Replicate?",
      answer:
        "AnyCap is an agent capability runtime. It packages image generation, video generation, vision, web search, storage, and publishing into CLI commands that coding agents invoke directly. Teams who previously integrated fal.ai or Replicate for agent workflows often find AnyCap removes the request lifecycle management they were maintaining themselves.",
    },
  ]),
  lastUpdatedLabel: "April 20, 2026",
  heroTitle: ["fal.ai vs", "Replicate"],
  heroIntro:
    "fal.ai vs Replicate is a practical question about which generative media API fits your workflow better. Both expose image and video generation through REST APIs, but they make different architectural choices around inference model, lifecycle control, and model catalog breadth. fal.ai emphasizes low-latency inference, queue-backed async execution, webhook-driven lifecycle control, and a curated catalog of high-performance models including FLUX. Replicate emphasizes a broader versioned model catalog, hundreds of open-source models from the community, with per-model endpoints, predictable per-second GPU billing, and a simpler integration model for teams that do not need queue-backed infrastructure. For most teams choosing between the two, the decision hinges on whether you need queue and webhook control (fal.ai wins) or the broadest possible model selection at predictable GPU cost (Replicate wins). There is a third path worth knowing: if your team uses coding agents, neither fal.ai nor Replicate is built for that workflow. Both expect your application code to own the request lifecycle, model selection, and artifact routing. AnyCap packages those decisions into a single CLI that agents invoke directly, with storage and publishing included. Understanding all three options prevents teams from building the wrong integration layer for their actual workflow.",
  answerFirstSummaryLabel: "Answer-first summary",
  answerFirstSummaryBody:
    "Choose fal.ai when your backend needs low-latency inference on select high-performance models, queue-backed async execution, and webhook-driven lifecycle control for production media pipelines. Choose Replicate when you need the broadest versioned model catalog, predictable per-second GPU billing, and a simpler integration model with less infrastructure overhead. Consider AnyCap when your team operates through coding agents like Claude Code, Cursor, or Codex and wants to skip building a custom API integration, AnyCap packages image, video, vision, and search into CLI commands agents invoke directly.",
  comparisonTitle: "fal.ai vs Replicate: side-by-side",
  comparisonHeaders: { dimension: "Dimension", fal: "fal.ai", replicate: "Replicate" },
  comparisonRows: [
    {
      dimension: "Inference model",
      fal:
        "Queue-backed async inference with explicit job-state tracking, webhooks for completion, and synchronous calls for low-latency models. Strong async primitives for production pipelines.",
      replicate:
        "Per-model versioned endpoints with synchronous and async prediction support. Polling-based status or webhook callbacks. Simpler lifecycle model for teams that don't need queue depth visibility.",
    },
    {
      dimension: "Model catalog",
      fal:
        "Curated high-performance models with emphasis on speed: FLUX image generation, video models, real-time audio. Fewer models than Replicate, but optimized for low latency.",
      replicate:
        "Broad versioned open-source model catalog with hundreds of community models. More variety in model types, sizes, and specializations. Easier to find niche models.",
    },
    {
      dimension: "Pricing model",
      fal:
        "Per-request pricing based on model and output size. Competitive on high-throughput workloads for supported models.",
      replicate:
        "Per-second GPU billing on model-specific hardware. Predictable cost for teams that profile GPU time carefully. Cold starts can add latency on less popular models.",
    },
    {
      dimension: "Webhook support",
      fal:
        "Detailed webhook documentation including retry behavior and signature verification. Good for teams building production pipelines that need reliable completion callbacks.",
      replicate:
        "Webhook support available. Less detailed documentation on retry and verification behavior compared to fal.ai.",
    },
    {
      dimension: "Integration complexity",
      fal:
        "Queue management adds complexity for teams that only need simple synchronous calls. Better justified when async depth and webhook reliability matter.",
      replicate:
        "Simpler integration for teams that just need a prediction and a result. Per-model versioned endpoints reduce drift risk from model updates.",
    },
    {
      dimension: "Best fit",
      fal:
        "Best for production pipelines needing queue-backed async inference, low latency on select models, and webhook-driven lifecycle control.",
      replicate:
        "Best for teams needing broad model variety, predictable GPU billing, and a simpler integration model without queue infrastructure.",
    },
  ],
  anycapAlternativeTitle: "When AnyCap is the right choice instead",
  anycapAlternativeBody:
    "Both fal.ai and Replicate expect your application code to own the request lifecycle: model selection, job tracking, artifact routing, and retry logic. For teams building traditional backend services, that ownership is normal. For teams operating through coding agents like Claude Code, Cursor, or Codex, it is unnecessary overhead. AnyCap packages image generation, video generation, vision, web search, Drive storage, and Page publishing into CLI commands that agents invoke directly. One install, one login, and agents gain media and search capabilities without a new API integration project. AnyCap is not a replacement for fal.ai or Replicate at the infrastructure layer, it is an alternative architecture for agent-centric teams that do not need raw API access.",
  strengthsTitleLeft: "Why teams choose fal.ai",
  strengthsTitleRight: "Why teams choose Replicate",
  strengthsLeft: [
    "Queue-backed async inference with explicit job state visibility is better for high-volume production media pipelines.",
    "FLUX image generation with low latency is one of the fastest options for teams that have committed to the FLUX model family.",
    "Detailed webhook documentation with retry and signature verification makes fal.ai more robust for teams building their own completion callback pipelines.",
  ],
  strengthsRight: [
    "Hundreds of versioned community models cover a broader range of specializations, making Replicate better when model variety or niche model access matters.",
    "Per-second GPU billing with versioned model pinning gives teams predictable cost and stability without worrying about model updates breaking integrations.",
    "Simpler integration model for teams that only need a prediction and a result without queue infrastructure overhead.",
  ],
  useCasesTitle: "Best fit by use case",
  useCases: [
    {
      eyebrow: "Choose fal.ai if",
      title: "Your production pipeline needs queue-backed async inference.",
      body:
        "fal.ai is stronger when your backend manages high-volume media generation jobs and needs explicit queue depth, webhook completion callbacks, and retry handling with signature verification.",
    },
    {
      eyebrow: "Choose Replicate if",
      title: "You need the broadest versioned model catalog.",
      body:
        "Replicate is the right choice when model variety matters, community models, niche specializations, or models that are not available on fal.ai, with predictable per-second GPU billing.",
    },
    {
      eyebrow: "Choose AnyCap if",
      title: "Your team operates through coding agents.",
      body:
        "AnyCap is the right fit when Claude Code, Cursor, Codex, or Manus is doing the work and you want those agents to access image, video, vision, and search through one CLI, without building an API integration layer for agents.",
    },
    {
      eyebrow: "Choose fal.ai if",
      title: "You need FLUX with the lowest latency available.",
      body:
        "fal.ai has optimized FLUX image generation endpoints with low cold-start times and fast inference. For FLUX-heavy workloads in production backends, fal.ai is the leading option in the public API market as of April 2026.",
    },
  ],
  methodTitle: "How this comparison was reviewed",
  methodBody: [
    "Both fal.ai and Replicate sides were reviewed against public documentation available on April 20, 2026. Claims are intentionally narrow and verifiable: fal.ai queue behavior, webhook documentation, and FLUX support; Replicate versioned model catalog, per-second pricing, and prediction API.",
    "The AnyCap section is based on published AnyCap pages. AnyCap is not positioned as a direct replacement for either platform at the infrastructure layer, the comparison is about which architecture fits agent-centric workflows.",
  ],
  methodologyNoteLabel: "Methodology note",
  methodologyNoteBody:
    "This comparison focuses on agent workflow fit. It is not a comprehensive performance benchmark. Both fal.ai and Replicate continue to add models and features. Verify current model availability and pricing on each platform's documentation before making a final decision.",
  sourceTitle: "Source notes",
  sourceLinks: [
    {
      label: "fal.ai queue inference",
      href: "https://fal.ai/docs/model-apis/model-endpoints/queue",
      note: "Queue-backed request handling and async inference for production workloads.",
    },
    {
      label: "fal.ai webhooks",
      href: "https://fal.ai/docs/model-endpoints/webhooks",
      note: "Webhook delivery, retries, and signature verification.",
    },
    {
      label: "Replicate predictions API",
      href: "https://replicate.com/docs/reference/http#predictions.create",
      note: "Core prediction API including async and sync modes.",
    },
    {
      label: "Replicate model catalog",
      href: "https://replicate.com/explore",
      note: "Community and official models available on Replicate.",
    },
    {
      label: "AnyCap image generation",
      href: "/capabilities/image-generation",
      note: "Image generation accessible to agents through the AnyCap runtime.",
    },
    {
      label: "AnyCap vs fal.ai",
      href: "/compare/anycap-vs-fal-ai",
      note: "Detailed AnyCap vs fal.ai comparison for agent-centric teams.",
    },
    {
      label: "AnyCap vs Replicate",
      href: "/compare/anycap-vs-replicate",
      note: "Detailed AnyCap vs Replicate comparison for agent-centric teams.",
    },
  ],
  relatedTitle: "Related pages",
  relatedPages: [
    {
      href: "/compare/anycap-vs-fal-ai",
      eyebrow: "Compare",
      title: "AnyCap vs fal.ai",
      body: "Full comparison of AnyCap and fal.ai for agent teams that need more than a media API.",
    },
    {
      href: "/compare/anycap-vs-replicate",
      eyebrow: "Compare",
      title: "AnyCap vs Replicate",
      body: "Full comparison of AnyCap and Replicate for agent teams deciding on their media runtime.",
    },
    {
      href: "/compare/fal-ai-alternatives-for-agents",
      eyebrow: "Compare",
      title: "fal.ai Alternatives for Agents",
      body: "Explore the full landscape of fal.ai alternatives for agent-first development teams.",
    },
    {
      href: "/start",
      eyebrow: "Start here",
      title: "Install AnyCap",
      body: "Try the agent capability runtime directly in your agent workflow.",
    },
  ],
  faqTitle: "FAQ",
  faqItems: [
    {
      question: "Is fal.ai better than Replicate for image generation?",
      answer:
        "fal.ai offers lower latency on select high-performance models like FLUX and stronger async primitives with webhook support, making it better for production pipelines where speed and reliability matter most. Replicate has a much broader versioned model catalog with hundreds of community models and predictable per-second GPU billing, making it better when model variety or cost predictability matter more than raw latency. Neither is universally better, the right choice depends on your specific workload requirements.",
    },
    {
      question: "What is the biggest technical difference between fal.ai and Replicate?",
      answer:
        "The core difference is in the inference model. fal.ai uses queue-backed async inference with explicit job state, webhooks with retry and signature verification, and a curated catalog of optimized models. Replicate uses per-model versioned endpoints with polling or webhook callbacks and a much broader community model catalog. fal.ai optimizes for throughput and latency on its supported models; Replicate optimizes for model variety and integration simplicity.",
    },
    {
      question: "When should I use neither fal.ai nor Replicate?",
      answer:
        "When your team primarily works through coding agents like Claude Code, Cursor, or Codex, both fal.ai and Replicate require you to build and maintain an API integration layer in application code, model selection, request lifecycle, artifact routing. AnyCap packages those decisions into CLI commands that agents invoke directly. For agent-first teams, AnyCap removes the integration overhead that fal.ai and Replicate both require.",
    },
    {
      question: "Does AnyCap use fal.ai or Replicate under the hood?",
      answer:
        "AnyCap manages its own routing infrastructure. The specific model providers powering each capability are implementation details. Agents interact with AnyCap's CLI surface — they do not need to know which provider handles a given request.",
    },
    {
      question: "Can I use both fal.ai and AnyCap at the same time?",
      answer:
        "Yes. fal.ai and AnyCap operate at different layers. A backend service calling fal.ai for media generation can coexist with coding agents using AnyCap for the same capabilities. The layers do not conflict — they solve different parts of the same workflow for different actors.",
    },
  ],
  ctas: [
    { href: "/start", label: "Install AnyCap", variant: "primary" },
    { href: "/compare/anycap-vs-fal-ai", label: "AnyCap vs fal.ai", variant: "secondary" },
    { href: "/compare/anycap-vs-replicate", label: "AnyCap vs Replicate", variant: "secondary" },
  ],
};

const ptBr: ComparePageData = {
  ...en,
  breadcrumbItems: [
    { name: "Início", href: "/" },
    { name: "Comparar", href: "/compare", unlinkable: true },
    { name: "fal.ai vs Replicate" },
  ],
  eyebrow: "Comparar",
  metadata: {
    title: "fal.ai vs Replicate — Qual API de mídia generativa é certa para seu agente?",
    description:
      "fal.ai vs Replicate: compare inferência async com fila e controle por webhook (fal.ai) versus catálogo amplo de modelos open-source com endpoints versionados (Replicate). Mais: quando o AnyCap é a alternativa nativa para agentes.",
    openGraphTitle: "fal.ai vs Replicate — comparação de APIs de mídia para agentes",
    openGraphDescription:
      "Compare fal.ai e Replicate para workflows de agente e veja quando o AnyCap é a escolha mais adequada.",
  },
  lastUpdatedLabel: "20 de abril de 2026",
  comparisonHeaders: { dimension: "Dimensão", fal: "fal.ai", replicate: "Replicate" },
  ctas: [
    { href: "/start", label: "Instalar o AnyCap", variant: "primary" },
    { href: "/compare/anycap-vs-fal-ai", label: "AnyCap vs fal.ai", variant: "secondary" },
    { href: "/compare/anycap-vs-replicate", label: "AnyCap vs Replicate", variant: "secondary" },
  ],
};

const id: ComparePageData = {
  ...en,
  breadcrumbItems: [
    { name: "Beranda", href: "/" },
    { name: "Perbandingan", href: "/compare", unlinkable: true },
    { name: "fal.ai vs Replicate" },
  ],
  eyebrow: "Perbandingan",
  metadata: {
    title: "fal.ai vs Replicate — API media generatif mana yang tepat untuk agent Anda?",
    description:
      "fal.ai vs Replicate: bandingkan inferensi async berbasis antrean dan kontrol webhook (fal.ai) vs katalog model open-source luas dengan endpoint berversi (Replicate). Plus: kapan AnyCap adalah alternatif native untuk agent.",
    openGraphTitle: "fal.ai vs Replicate — perbandingan API media untuk agent",
    openGraphDescription:
      "Bandingkan fal.ai dan Replicate untuk alur kerja agent dan lihat kapan AnyCap adalah pilihan yang lebih sesuai.",
  },
  lastUpdatedLabel: "20 April 2026",
  comparisonHeaders: { dimension: "Dimensi", fal: "fal.ai", replicate: "Replicate" },
  ctas: [
    { href: "/start", label: "Instal AnyCap", variant: "primary" },
    { href: "/compare/anycap-vs-fal-ai", label: "AnyCap vs fal.ai", variant: "secondary" },
    { href: "/compare/anycap-vs-replicate", label: "AnyCap vs Replicate", variant: "secondary" },
  ],
};

const de: ComparePageData = {
  ...en,
  breadcrumbItems: [
    { name: "Startseite", href: "/" },
    { name: "Vergleich", href: "/compare", unlinkable: true },
    { name: "fal.ai vs Replicate" },
  ],
  eyebrow: "Vergleich",
  metadata: {
    title: "fal.ai vs Replicate — Welche generative Media-API passt zu Ihrem Agent?",
    description:
      "fal.ai vs Replicate: Vergleichen Sie queue-basierte asynchrone Inferenz und Webhook-Kontrolle (fal.ai) mit einem breiten versionierten Open-Source-Modellkatalog (Replicate). Plus: Wann ist AnyCap die agentengerechte Alternative?",
    openGraphTitle: "fal.ai vs Replicate — Vergleich generativer Media-APIs für Agents",
    openGraphDescription:
      "Vergleichen Sie fal.ai und Replicate für Agent-Workflows und erfahren Sie, wann AnyCap die bessere Wahl ist.",
  },
  lastUpdatedLabel: "20. April 2026",
  comparisonHeaders: { dimension: "Dimension", fal: "fal.ai", replicate: "Replicate" },
  ctas: [
    { href: "/start", label: "AnyCap installieren", variant: "primary" },
    { href: "/compare/anycap-vs-fal-ai", label: "AnyCap vs fal.ai", variant: "secondary" },
    { href: "/compare/anycap-vs-replicate", label: "AnyCap vs Replicate", variant: "secondary" },
  ],
};

const contentByLocale: Record<SiteLocale, ComparePageData> = {
  en,
  "pt-br": ptBr,
  id,
  de,
};

export function getFalAiVsReplicateMetadata(locale: SiteLocale): Metadata {
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

export function getFalAiVsReplicatePageData(locale: SiteLocale) {
  return contentByLocale[locale] ?? contentByLocale.en;
}
