import type { Metadata } from "next";
import { createFaqPageJsonLd, createTechArticleJsonLd } from "@/lib/schema";
import { getLocaleConfig, siteConfig, type SiteLocale } from "@/lib/site";

export const ANYCAP_VS_MODAL_PATH = "/compare/anycap-vs-modal";

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
  comparisonHeaders: { dimension: string; anycap: string; modal: string };
  comparisonRows: readonly { dimension: string; anycap: string; modal: string }[];
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
    { name: "AnyCap vs Modal" },
  ],
  eyebrow: "Compare",
  metadata: {
    title: "AnyCap vs Modal, Agent Capability Runtime vs Serverless GPU Cloud",
    description:
      "AnyCap is a cross-agent capability runtime for Codex, Cursor, Claude Code, and Manus. Modal is a serverless GPU cloud for ML engineers building and deploying models. Compare architecture and use cases.",
    openGraphTitle: "AnyCap vs Modal, agent runtime vs serverless GPU compute",
    openGraphDescription:
      "See when Modal is the right ML infrastructure layer and when AnyCap is the stronger runtime for agent-facing capability access.",
  },
  articleJsonLd: createTechArticleJsonLd({
    headline: "AnyCap vs Modal, agent capability runtime vs serverless GPU cloud",
    description:
      "Comparison guide for teams deciding between Modal's serverless GPU infrastructure and AnyCap's cross-agent capability runtime.",
    path: ANYCAP_VS_MODAL_PATH,
    about: ["AnyCap", "Modal", "Agent capability runtime", "Serverless GPU", "ML infrastructure"],
    keywords: [
      "anycap vs modal",
      "modal alternative for agents",
      "modal vs anycap",
      "serverless gpu vs capability runtime",
      "modal for coding agents",
    ],
    datePublished: lastUpdatedIso,
    dateModified: lastUpdatedIso,
  }),
  faqJsonLd: createFaqPageJsonLd([
    {
      question: "Is Modal a direct AnyCap replacement?",
      answer:
        "No. Modal is a serverless GPU cloud for ML engineers deploying models and running compute-heavy Python workloads. AnyCap is an agent capability runtime that packages multimodal execution into a CLI for agents. The categories are different: one is ML infrastructure, the other is agent execution infrastructure.",
    },
    {
      question: "When should I choose Modal over AnyCap?",
      answer:
        "Choose Modal when you need to run custom ML training or inference jobs, deploy your own model containers, or access serverless GPU compute with Python-native orchestration. Modal is for ML engineers who own the full compute stack.",
    },
    {
      question: "When is AnyCap the right choice?",
      answer:
        "AnyCap is the right choice when your team already uses coding agents like Claude Code, Cursor, or Codex, and you want those agents to access image generation, video generation, vision, and other capabilities through one shared runtime without building custom GPU infrastructure.",
    },
  ]),
  lastUpdatedLabel: "April 20, 2026",
  heroTitle: ["AnyCap vs", "Modal"],
  heroIntro:
    "AnyCap vs Modal is a question about which problem you are actually solving. Modal is a serverless cloud built for ML engineers: you write Python functions, Modal runs them on GPU, and you get fast, scalable compute without managing infrastructure. The target is data scientists, researchers, and backend teams that need to train, fine-tune, or deploy their own models. AnyCap solves a different problem. It packages existing multimodal capabilities, image generation, video generation, vision, web search, storage, and publishing, into a runtime that any coding agent can invoke through a single CLI and a single login. The target is agent operators who want to give their existing agent workflows new capabilities without building GPU infrastructure themselves. These products rarely compete directly. If your team needs custom model execution or wants to fine-tune a model on your own data, Modal provides the compute layer. If your team uses agents and wants those agents to access best-in-class media models without a new infrastructure project, AnyCap is the runtime layer. The clearest overlap is image and video generation, but even there the relationship is complementary: Modal could host a custom model, while AnyCap provides the agent-facing CLI to invoke production-ready models through one interface. Understanding which layer your workflow is actually missing determines which product you need.",
  answerFirstSummaryLabel: "Answer-first summary",
  answerFirstSummaryBody:
    "Choose Modal when your team needs to run custom Python workloads on serverless GPU, deploy proprietary models, or fine-tune foundational models with full compute control. Choose AnyCap when your developers use coding agents and want those agents to access image, video, vision, and search capabilities through one portable runtime without building or managing GPU infrastructure. The practical split: if the gap is custom compute, use Modal. If the gap is agent capability access, use AnyCap. Most teams that use both are solving two separate problems at different layers of the same workflow.",
  comparisonTitle: "Side-by-side comparison",
  comparisonHeaders: { dimension: "Dimension", anycap: "AnyCap", modal: "Modal" },
  comparisonRows: [
    {
      dimension: "Primary job",
      anycap:
        "Agent capability runtime that gives existing agents a shared execution layer for image, video, vision, web, storage, and publishing.",
      modal:
        "Serverless GPU cloud for ML engineers to run custom Python functions, deploy model containers, and scale compute-heavy workloads without managing servers.",
    },
    {
      dimension: "Integration target",
      anycap:
        "Coding agents: Codex, Cursor, Claude Code, Manus, and other agent surfaces that need a portable capability runtime.",
      modal:
        "ML engineers and backend teams writing Python code who need on-demand GPU compute, fine-tuning pipelines, or custom model deployment.",
    },
    {
      dimension: "Capability scope",
      anycap:
        "Image, video, music, media understanding, grounded web retrieval, Drive storage, and Page publishing through one command surface.",
      modal:
        "Serverless compute across GPUs and CPUs, custom containers, persistent volumes, cron-scheduled functions, and Python-native ML pipelines.",
    },
    {
      dimension: "Authentication model",
      anycap:
        "Single login via `anycap login`. Credentials travel with the CLI across all agent environments.",
      modal:
        "Modal token stored in project config. Python SDK handles authentication inside Modal function definitions.",
    },
    {
      dimension: "Invocation pattern",
      anycap:
        "CLI commands invoked by agent: `anycap image generate`, `anycap video generate`. Output goes to agent context or Drive.",
      modal:
        "Python function decorated with `@app.function`. Called like any async Python function from application code or CI.",
    },
    {
      dimension: "Best fit",
      anycap: "Best when agents need multimodal capabilities and artifact delivery without custom infrastructure.",
      modal:
        "Best when teams need custom model hosting, GPU-accelerated Python workloads, or proprietary fine-tuning pipelines.",
    },
  ],
  strengthsTitleLeft: "Why teams choose AnyCap",
  strengthsTitleRight: "Why teams choose Modal",
  strengthsLeft: [
    "One runtime serves multiple agent shells without rebuilding capability integrations for each environment.",
    "Capabilities extend from generation into understanding, web retrieval, storage, and publishing, the full output lifecycle, not just an API call.",
    "No GPU knowledge required. Agents get access to production-grade media models through a CLI that any team member can use.",
  ],
  strengthsRight: [
    "Full control over the compute layer. Teams can run any Python code, use custom containers, and deploy proprietary models at scale.",
    "Modal handles cold start optimization, auto-scaling, and GPU provisioning, making serverless ML viable for production inference workloads.",
    "The Python-native SDK integrates naturally into existing ML pipelines and backend services without introducing a new CLI tool.",
  ],
  useCasesTitle: "Best fit by use case",
  useCases: [
    {
      eyebrow: "Choose AnyCap if",
      title: "Your coding agents need to generate or analyze media.",
      body:
        "AnyCap is stronger when the goal is giving Cursor, Claude Code, or Codex access to image generation, video generation, and vision inside existing agent workflows, without a separate infrastructure project.",
    },
    {
      eyebrow: "Choose Modal if",
      title: "You need to run custom Python on GPUs.",
      body:
        "Modal is the right choice when your team needs to run ML training jobs, custom inference functions, or fine-tuning pipelines on serverless GPU compute with Python-native control.",
    },
    {
      eyebrow: "Choose AnyCap if",
      title: "The workflow includes delivery after generation.",
      body:
        "AnyCap is stronger when generated content needs to become a share link, a hosted page, or a Drive asset right after creation, not just an API response that your application code must then route manually.",
    },
    {
      eyebrow: "Choose Modal if",
      title: "You are building or fine-tuning your own models.",
      body:
        "Modal is the cleaner fit when your product roadmap includes proprietary model development, custom container deployments, or experiments that require iterating on model weights directly.",
    },
  ],
  methodTitle: "How this comparison was reviewed",
  methodBody: [
    "The Modal side of this page was reviewed against public Modal documentation available on April 20, 2026. The claims are intentionally narrow: Modal supports serverless Python functions on GPU, custom containers, persistent storage, cron scheduling, and Python SDK authentication.",
    "The AnyCap side is based on published AnyCap pages for the CLI, installation, capability runtime, Drive, and pricing. Only public claims already visible on the product surface are used.",
  ],
  methodologyNoteLabel: "Methodology note",
  methodologyNoteBody:
    "This page compares primary use cases, not total product breadth. Both products may add overlapping features over time. If Modal launches agent-facing CLI tooling or AnyCap adds serverless compute, this page should be updated.",
  sourceTitle: "Source notes",
  sourceLinks: [
    {
      label: "Modal getting started",
      href: "https://modal.com/docs/guide",
      note: "Core workflow: defining Modal functions, running them, and managing compute.",
    },
    {
      label: "Modal GPU guide",
      href: "https://modal.com/docs/guide/gpu",
      note: "How to request GPU resources in Modal functions.",
    },
    {
      label: "AnyCap image generation",
      href: "/capabilities/image-generation",
      note: "The public image generation surface exposed through the AnyCap runtime.",
    },
    {
      label: "AnyCap video generation",
      href: "/capabilities/video-generation",
      note: "The public video generation workflow available through one CLI command.",
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
      body: "Compare AnyCap to a generative media API platform with queue-backed inference and webhook support.",
    },
    {
      href: "/compare/anycap-vs-replicate",
      eyebrow: "Compare",
      title: "AnyCap vs Replicate",
      body: "Compare AnyCap to another model hosting and inference platform with similar GPU infrastructure semantics.",
    },
    {
      href: "/capabilities/video-generation",
      eyebrow: "Product",
      title: "Video Generation",
      body: "See the public video workflow that an agent gets through AnyCap without any GPU infrastructure.",
    },
    {
      href: "/start",
      eyebrow: "Start here",
      title: "Install AnyCap",
      body: "Validate the runtime directly in your own agent workflow instead of staying in comparison mode.",
    },
  ],
  faqTitle: "FAQ",
  faqItems: [
    {
      question: "Is Modal a direct AnyCap replacement?",
      answer:
        "No. Modal is a serverless GPU cloud built for ML engineers who need custom Python compute, model deployment, and fine-tuning pipelines. AnyCap is a capability runtime built for agent operators who want to give existing coding agents access to image, video, vision, and search through one shared CLI. These products address different layers of the stack. Teams that use both are typically solving two separate problems: custom ML infrastructure on one side and agent capability access on the other.",
    },
    {
      question: "Can I use Modal to power AnyCap capabilities?",
      answer:
        "Technically yes, you could deploy a custom model on Modal and invoke it from an agent workflow. But AnyCap is not a raw compute layer; it is a curated runtime that exposes production-ready models through one CLI. If your goal is simply giving agents access to best-in-class image or video models, AnyCap provides that without needing to manage Modal infrastructure.",
    },
    {
      question: "When should I choose Modal over AnyCap?",
      answer:
        "Choose Modal when you need to run custom Python workloads on GPU, fine-tune your own models, or deploy proprietary containers at scale. Modal is the right choice when your team owns the compute pipeline and needs serverless infrastructure that adapts to ML-specific workloads. AnyCap does not solve custom compute problems, it packages pre-integrated capability access for agents.",
    },
    {
      question: "Does AnyCap use Modal under the hood?",
      answer:
        "AnyCap's capability infrastructure is independent of Modal. AnyCap routes agent requests to the appropriate model providers through its own backend. The specific infrastructure powering each capability is an implementation detail — agents interact only with the CLI surface.",
    },
    {
      question: "What is the simplest rule of thumb?",
      answer:
        "If your team needs to run custom Python on serverless GPU, use Modal. If your agents need to call image generation, video generation, or vision without building GPU infrastructure, use AnyCap. The categories rarely overlap in practice.",
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
    { name: "AnyCap vs Modal" },
  ],
  eyebrow: "Comparar",
  metadata: {
    title: "AnyCap vs Modal — runtime de agente vs nuvem de GPU serverless",
    description:
      "AnyCap é um runtime de capacidades para agentes que equipa Codex, Cursor, Claude Code e Manus. Modal é uma nuvem GPU serverless para engenheiros de ML que constroem e implantam modelos. Compare arquitetura e casos de uso.",
    openGraphTitle: "AnyCap vs Modal — runtime de agente vs computação GPU serverless",
    openGraphDescription:
      "Veja quando o Modal é a camada certa de infraestrutura de ML e quando o AnyCap é o runtime mais forte para acesso a capacidades orientado por agente.",
  },
  lastUpdatedLabel: "20 de abril de 2026",
  comparisonHeaders: { dimension: "Dimensão", anycap: "AnyCap", modal: "Modal" },
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
    { name: "AnyCap vs Modal" },
  ],
  eyebrow: "Perbandingan",
  metadata: {
    title: "AnyCap vs Modal — runtime kemampuan agent vs cloud GPU serverless",
    description:
      "AnyCap adalah runtime kemampuan lintas-agent untuk Codex, Cursor, Claude Code, dan Manus. Modal adalah cloud GPU serverless untuk engineer ML yang membangun dan men-deploy model. Bandingkan arsitektur dan kasus penggunaan.",
    openGraphTitle: "AnyCap vs Modal — runtime agent vs komputasi GPU serverless",
    openGraphDescription:
      "Lihat kapan Modal adalah lapisan infrastruktur ML yang tepat dan kapan AnyCap adalah runtime yang lebih kuat untuk akses kemampuan agent.",
  },
  lastUpdatedLabel: "20 April 2026",
  comparisonHeaders: { dimension: "Dimensi", anycap: "AnyCap", modal: "Modal" },
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
    { name: "AnyCap vs Modal" },
  ],
  eyebrow: "Vergleich",
  metadata: {
    title: "AnyCap vs Modal — Agent-Capability-Runtime vs Serverless-GPU-Cloud",
    description:
      "AnyCap ist eine agentenübergreifende Capability-Runtime für Codex, Cursor, Claude Code und Manus. Modal ist eine Serverless-GPU-Cloud für ML-Engineers. Vergleichen Sie Architektur und Anwendungsfälle.",
    openGraphTitle: "AnyCap vs Modal — Agent-Runtime vs Serverless-GPU-Compute",
    openGraphDescription:
      "Erfahren Sie, wann Modal die richtige ML-Infrastrukturschicht ist und wann AnyCap die stärkere Runtime für agentenorientierten Capability-Zugang darstellt.",
  },
  lastUpdatedLabel: "20. April 2026",
  comparisonHeaders: { dimension: "Dimension", anycap: "AnyCap", modal: "Modal" },
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

export function getAnyCapVsModalMetadata(locale: SiteLocale): Metadata {
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

export function getAnyCapVsModalPageData(locale: SiteLocale) {
  return contentByLocale[locale] ?? contentByLocale.en;
}
