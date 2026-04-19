import type { Metadata } from "next";
import { createFaqPageJsonLd, createTechArticleJsonLd } from "@/lib/schema";
import { getLocaleConfig, siteConfig, type SiteLocale } from "@/lib/site";

export const BEST_IMAGE_GEN_API_FOR_AGENTS_PATH =
  "/learn/best-image-generation-api-for-ai-agents-2026";

type ComparisonRow = {
  model: string;
  provider: string;
  bestFor: string;
  agentFit: string;
  anycap: "Yes" | "Coming" | "—";
};

type ModelCard = {
  name: string;
  provider: string;
  positioning: string;
  agentNotes: string;
  href?: string;
  hrefLabel?: string;
};

type BestImageGenApiPageData = {
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
  quickAnswerLabel: string;
  quickAnswerTitle: string;
  quickAnswerBody: string;
  comparisonLabel: string;
  comparisonTitle: string;
  comparisonIntro: string;
  comparisonHeaders: { model: string; provider: string; bestFor: string; agentFit: string; anycap: string };
  comparisonRows: readonly ComparisonRow[];
  criteriaLabel: string;
  criteriaTitle: string;
  criteriaCards: readonly { title: string; body: string }[];
  modelsLabel: string;
  modelsTitle: string;
  modelsIntro: string;
  modelCards: readonly ModelCard[];
  decisionLabel: string;
  decisionTitle: string;
  decisionRows: readonly { question: string; answer: string }[];
  anycapLabel: string;
  anycapTitle: string;
  anycapBody: string;
  anycapBullets: readonly string[];
  nextMoveLabel: string;
  nextMoveTitle: string;
  nextMoveCards: readonly { title: string; href: string; body: string }[];
  faqLabel: string;
  faqTitle: string;
  faqItems: readonly { question: string; answer: string }[];
};

const lastUpdatedIso = "2026-04-19";

const en: BestImageGenApiPageData = {
  breadcrumbItems: [
    { name: "Home", href: "/" },
    { name: "Learn", href: "/learn", unlinkable: true },
    { name: "Best image generation API for AI agents (2026)" },
  ],
  eyebrow: "Learn",
  metadata: {
    title: "Best Image Generation API for AI Agents (2026)",
    description:
      "Agent-first ranking of 10 image generation APIs in 2026 — GPT Image 1.5, Nano Banana Pro, Seedream 5, Imagen 4, Flux 2 Pro, and more. Scored for agent runtime fit.",
    openGraphTitle: "Best Image Generation API for AI Agents (2026)",
    openGraphDescription:
      "Most listicles rank image APIs for human prompters. This one ranks them for agents: per-call cost, schema-stable outputs, async job handling, and one-runtime routing.",
  },
  articleJsonLd: createTechArticleJsonLd({
    headline: "Best Image Generation API for AI Agents (2026)",
    description:
      "An agent-first buyer guide to image generation APIs in 2026, comparing 10 models on per-call cost, schema stability, latency, and runtime fit for autonomous agent workflows.",
    path: BEST_IMAGE_GEN_API_FOR_AGENTS_PATH,
    about: [
      "Image generation APIs",
      "AI agents",
      "Agent capability runtime",
      "Seedream 5",
      "Nano Banana Pro",
      "GPT Image 1.5",
      "Imagen 4",
      "Flux 2 Pro",
      "Midjourney",
      "Recraft V4",
      "Ideogram 3.0",
      "AnyCap",
    ],
    keywords: [
      "best image generation api 2026",
      "best image generation api for agents",
      "image generation api for ai agents",
      "image generation api comparison",
      "ai agent image generation",
      "seedream 5 vs nano banana pro",
      "gpt image 1.5 api",
      "imagen 4 api",
      "flux 2 pro api",
      "agent capability runtime",
    ],
    datePublished: lastUpdatedIso,
    dateModified: lastUpdatedIso,
  }),
  faqJsonLd: createFaqPageJsonLd([
    {
      question: "What is the best image generation API for AI agents in 2026?",
      answer:
        "There's no single winner. For most agent workloads the best setup is a routing layer that can call Seedream 5, Nano Banana Pro, GPT Image 1.5, and Imagen 4 from one interface, picking the right model per task instead of locking the agent to one provider.",
    },
    {
      question: "Why do agents need a different shortlist than human prompters?",
      answer:
        "Agents care about per-call cost, latency, schema-stable JSON outputs, async job handling, retry safety, and the cost of integrating ten provider SDKs. Human prompters care about prompt feel and a chat UI. The two shortlists rarely match.",
    },
    {
      question: "Which model has the best prompt adherence in 2026?",
      answer:
        "GPT Image 1.5 currently leads adherence and text rendering in independent leaderboards, with Nano Banana Pro and Imagen 4 close behind on photoreal scenes.",
    },
    {
      question: "Which image API is best for editing rather than fresh generation?",
      answer:
        "Nano Banana Pro is widely cited as the strongest editing-first model in 2026, with multi-image composition and instruction edits that hold structure across passes.",
    },
    {
      question: "Do I need to integrate all ten APIs myself?",
      answer:
        "No. AnyCap routes Seedream 5, Nano Banana Pro, Nano Banana 2, GPT Image 1.5, and other supported models through one capability runtime, so an agent calls one CLI or HTTP endpoint instead of ten provider SDKs.",
    },
  ]),
  lastUpdatedLabel: "Updated April 19, 2026",
  heroTitle: ["Best image generation API", "for AI agents (2026)"],
  heroIntro:
    "Most 2026 image-API listicles rank models for human prompters in chat UIs. Agents care about a different shortlist: per-call cost, schema-stable JSON outputs, async job handling, retry safety, and the cost of integrating ten provider SDKs. This guide ranks the leading image APIs from that lens. It's about what an autonomous agent should reach for, and how to avoid wiring ten clients to do it.",
  quickAnswerLabel: "Quick answer",
  quickAnswerTitle: "There's no single best image API for agents. The best move is one runtime that routes across the four that matter.",
  quickAnswerBody:
    "GPT Image 1.5 wins prompt adherence and in-image text. Nano Banana Pro wins editing and multi-image composition. Imagen 4 wins photoreal scenes. Seedream 5 wins illustrative, stylized fresh generation. Locking an agent to one of them gives up the other three. The best agent setup is a single capability runtime that calls all four through one CLI or HTTP endpoint, with model routing decided per task. That's exactly what AnyCap does.",
  comparisonLabel: "Comparison table",
  comparisonTitle: "Top 10 image generation APIs ranked for agent use, April 2026",
  comparisonIntro:
    "Agent fit means a combination of per-call cost predictability, schema-stable JSON outputs, retry safety on async jobs, and how cleanly the model can be reached without standing up its own SDK. AnyCap support means the model is reachable today through the AnyCap capability runtime.",
  comparisonHeaders: {
    model: "Model",
    provider: "Provider",
    bestFor: "Best for",
    agentFit: "Agent fit",
    anycap: "AnyCap",
  },
  comparisonRows: [
    {
      model: "GPT Image 1.5",
      provider: "OpenAI",
      bestFor: "Prompt adherence, in-image text",
      agentFit: "Strong. Predictable JSON, mature SDK",
      anycap: "Coming",
    },
    {
      model: "Nano Banana Pro",
      provider: "Google",
      bestFor: "Editing, multi-image composition",
      agentFit: "Strong. Clean image edit semantics",
      anycap: "Yes",
    },
    {
      model: "Nano Banana 2",
      provider: "Google",
      bestFor: "Lower-cost edits, batch passes",
      agentFit: "Strong. Pairs with Pro for cost split",
      anycap: "Yes",
    },
    {
      model: "Seedream 5",
      provider: "ByteDance",
      bestFor: "Illustrative, stylized fresh generation",
      agentFit: "Strong. Clean prompt-to-image surface",
      anycap: "Yes",
    },
    {
      model: "Imagen 4",
      provider: "Google DeepMind",
      bestFor: "Photoreal scenes, lighting fidelity",
      agentFit: "Strong. Vertex API, predictable cost",
      anycap: "Coming",
    },
    {
      model: "Flux 2 Pro",
      provider: "Black Forest Labs",
      bestFor: "Open-weights speed, self-host option",
      agentFit: "Strong. Works through Replicate or BFL",
      anycap: "Coming",
    },
    {
      model: "Midjourney v8",
      provider: "Midjourney",
      bestFor: "Aesthetic ceiling, art direction",
      agentFit: "Weak. Async-only, no stable schema",
      anycap: "—",
    },
    {
      model: "Recraft V4",
      provider: "Recraft",
      bestFor: "Vector and brand-consistent assets",
      agentFit: "Medium. Strong for brand workflows",
      anycap: "—",
    },
    {
      model: "Ideogram 3.0",
      provider: "Ideogram",
      bestFor: "Typographic posters, in-scene text",
      agentFit: "Medium. REST API, decent latency",
      anycap: "—",
    },
    {
      model: "Mystic 2.5",
      provider: "Freepik",
      bestFor: "Photorealistic portraits, stock-style",
      agentFit: "Medium. Niche but reliable API",
      anycap: "—",
    },
  ],
  criteriaLabel: "How we ranked",
  criteriaTitle: "Four things to evaluate before wiring an image API into an agent",
  criteriaCards: [
    {
      title: "Per-call cost predictability",
      body:
        "Agents fan out. A single user task can trigger five generations, three edits, and a retry. Models with sharp per-image pricing and no surprise billing on retries (cancelled jobs, polished revisions) win the long-run cost race even when the headline price looks higher.",
    },
    {
      title: "Schema-stable JSON outputs",
      body:
        "Agents don't see the image. They parse the response. APIs that return predictable fields (image URL, mime type, usage stats) survive prompt drift. APIs that bury the URL in a polling endpoint or change response shape across versions break agent loops in subtle ways.",
    },
    {
      title: "Async job handling and retries",
      body:
        "Video and high-res image jobs can't be synchronous. The right API gives a job ID, a stable polling endpoint, idempotent retries, and clear final-state semantics (succeeded, failed, cancelled). Models that only offer fire-and-forget endpoints push that complexity into the agent runtime.",
    },
    {
      title: "Cost of integrating ten SDKs",
      body:
        "Every additional provider is another auth path, another error vocabulary, and another rate-limit surface. The best image API for agents in 2026 isn't a single API at all. It's a runtime that routes the right model per task, so the agent integrates one surface instead of ten.",
    },
  ],
  modelsLabel: "Per-model breakdown",
  modelsTitle: "What each model is actually good at, from an agent's point of view",
  modelsIntro:
    "Brief, opinionated notes on each of the ten models in the comparison table. The goal is to make the per-task routing decision easier — when an agent should reach for which model, and where the integration friction shows up.",
  modelCards: [
    {
      name: "GPT Image 1.5",
      provider: "OpenAI",
      positioning:
        "The current leader on prompt adherence and in-image text rendering. Fresh generation quality is competitive with the best dedicated image models.",
      agentNotes:
        "Mature SDK, predictable JSON, sane error vocabulary. The right default when an agent task contains a long, structured prompt or asks for legible text inside the image.",
    },
    {
      name: "Nano Banana Pro",
      provider: "Google",
      positioning:
        "The strongest editing-first model in 2026. Multi-image composition holds structure across passes, and instruction edits respect the original layout.",
      agentNotes:
        "The right default when the agent already has a base image and needs a precise edit, a refined region, or a composed multi-input result. Pairs well with cheaper models for first-draft generation.",
      href: "/models/nano-banana-pro",
      hrefLabel: "See Nano Banana Pro →",
    },
    {
      name: "Nano Banana 2",
      provider: "Google",
      positioning:
        "The cost-down sibling. Edit quality drops a step from Pro but holds for batch passes, low-stakes refinements, and exploratory loops.",
      agentNotes:
        "Pair with Nano Banana Pro: route cheap exploratory edits to v2, route the final polished pass to Pro. Cuts cost meaningfully on long agent loops without giving up the editing strength.",
      href: "/models/nano-banana-2",
      hrefLabel: "See Nano Banana 2 →",
    },
    {
      name: "Seedream 5",
      provider: "ByteDance",
      positioning:
        "Fresh-generation specialist with a clean, illustrative aesthetic that handles stylized scenes, character work, and concept art well.",
      agentNotes:
        "Clean prompt-to-image surface. Predictable response shape, no hidden polling complexity. Strong default for first-draft generation when the brief is more descriptive than literal.",
      href: "/models/seedream-5",
      hrefLabel: "See Seedream 5 →",
    },
    {
      name: "Imagen 4",
      provider: "Google DeepMind",
      positioning:
        "Photoreal scenes and lighting fidelity continue to be the strong axis. Less hype than the other Google launches but still a serious option for grounded photographic outputs.",
      agentNotes:
        "Reachable through Vertex AI with predictable per-call cost and stable response shape. The right default when the agent needs photoreal output and the user expects something that could pass as a real photograph.",
    },
    {
      name: "Flux 2 Pro",
      provider: "Black Forest Labs",
      positioning:
        "Open-weights lineage gives it a self-host escape hatch. Quality is competitive on most generic prompts, and speed-to-image is a strong axis.",
      agentNotes:
        "Reachable through BFL's hosted API, Replicate, or self-hosted on the team's own GPUs. Useful when latency matters more than the absolute aesthetic ceiling, or when the workload must stay inside a private VPC.",
    },
    {
      name: "Midjourney v8",
      provider: "Midjourney",
      positioning:
        "Still the aesthetic ceiling for art-directed work. Style consistency and reference-driven generation remain best-in-class.",
      agentNotes:
        "API access remains awkward for autonomous agents. It's async-only, has no stable schema, and is designed around the human-in-the-loop chat surface. Best left to human design workflows for now.",
    },
    {
      name: "Recraft V4",
      provider: "Recraft",
      positioning:
        "Specialist for vector outputs and brand-consistent asset generation. Holds a recognizable house style across batches.",
      agentNotes:
        "Strong fit when the agent task is producing logos, icons, or brand-aligned illustrations at volume. Niche but reliable when the workflow needs vector-friendly outputs.",
    },
    {
      name: "Ideogram 3.0",
      provider: "Ideogram",
      positioning:
        "Typographic specialist. Best-in-class for posters, marketing graphics, and any prompt where in-scene text matters as much as the image.",
      agentNotes:
        "REST API with decent latency and clean response shape. Worth routing to when an agent task explicitly involves text inside the image and GPT Image 1.5 isn't available.",
    },
    {
      name: "Mystic 2.5",
      provider: "Freepik",
      positioning:
        "Photorealistic portraits and stock-style imagery. Quietly competitive on a narrow band of use cases.",
      agentNotes:
        "Niche but stable. Useful as a fallback for portrait-heavy generation workflows when the dominant providers throttle or rate-limit.",
    },
  ],
  decisionLabel: "How to decide",
  decisionTitle: "Pick the right model per task instead of one model for the whole workflow",
  decisionRows: [
    {
      question: "When should an agent default to GPT Image 1.5?",
      answer:
        "Default here when prompt adherence matters, when the image must contain legible text, or when the prompt is long and highly structured. Adherence and text rendering are the strongest axes in 2026.",
    },
    {
      question: "When should an agent default to Nano Banana Pro?",
      answer:
        "Default here when the agent already has an input image and needs a precise edit, a multi-image composition, or a refinement that must hold structure. Editing is the axis where Nano Banana Pro is hardest to beat.",
    },
    {
      question: "When should an agent default to Imagen 4?",
      answer:
        "Default here when the result must look photoreal — believable lighting, plausible scene physics, and a finish that could pass as a real photograph. Photoreal fidelity remains Imagen 4's strongest axis.",
    },
    {
      question: "When should an agent default to Seedream 5?",
      answer:
        "Default here for fresh, stylized, illustrative generation where the brief is descriptive rather than literal. Strong aesthetic defaults and a clean API surface make it a low-friction first choice.",
    },
    {
      question: "When does it make sense to integrate every API directly?",
      answer:
        "Almost never. Every additional provider adds an auth surface, an error vocabulary, and a rate-limit window. For most teams the cost-effective move is one capability runtime that routes across the leaders.",
    },
  ],
  anycapLabel: "AnyCap angle",
  anycapTitle: "Skip integrating ten APIs — one AnyCap call hits the ones an agent should be using",
  anycapBody:
    "AnyCap is an agent capability runtime. It exposes image generation, image editing, image understanding, and video capabilities through one CLI and one HTTP endpoint. The agent doesn't need a Google SDK, an OpenAI SDK, a Replicate SDK, and three retry libraries. It calls AnyCap, picks the model, and gets a schema-stable response back.",
  anycapBullets: [
    "Seedream 5, Nano Banana Pro, and Nano Banana 2 are reachable today via one CLI command and one HTTP endpoint.",
    "GPT Image 1.5, Imagen 4, and Flux 2 Pro are on the near-term roadmap. Same surface, additional routes.",
    "Schema-stable response shape across providers, so the agent doesn't break when the underlying model switches.",
    "One auth path, one rate-limit surface, one error vocabulary. No more ten provider integrations to maintain.",
  ],
  nextMoveLabel: "Best next moves",
  nextMoveTitle: "Move from this guide into the exact model page or capability path you need",
  nextMoveCards: [
    {
      title: "See Seedream 5 in detail",
      href: "/models/seedream-5",
      body: "Best next move when the agent task is fresh, stylized, illustrative generation.",
    },
    {
      title: "See Nano Banana Pro in detail",
      href: "/models/nano-banana-pro",
      body: "Best next move when the agent task is editing, refinement, or multi-image composition.",
    },
    {
      title: "Image generation capability",
      href: "/capabilities/image-generation",
      body: "The capability page that explains how AnyCap exposes image generation across providers.",
    },
    {
      title: "Add image generation to Claude Code",
      href: "/for/claude-code/image-generation",
      body: "Concrete agent path: wire image generation into a Claude Code workflow in one CLI install.",
    },
  ],
  faqLabel: "FAQ",
  faqTitle: "Questions behind the keyword",
  faqItems: [
    {
      question: "What is the best image generation API for AI agents in 2026?",
      answer:
        "There's no single winner. For most agent workloads the best setup is a routing layer that can call Seedream 5, Nano Banana Pro, GPT Image 1.5, and Imagen 4 from one interface, picking the right model per task instead of locking the agent to one provider.",
    },
    {
      question: "Why do agents need a different shortlist than human prompters?",
      answer:
        "Agents care about per-call cost, latency, schema-stable JSON outputs, async job handling, retry safety, and the cost of integrating ten provider SDKs. Human prompters care about prompt feel and a chat UI. The two shortlists rarely match.",
    },
    {
      question: "Which model has the best prompt adherence in 2026?",
      answer:
        "GPT Image 1.5 currently leads adherence and text rendering in independent leaderboards, with Nano Banana Pro and Imagen 4 close behind on photoreal scenes.",
    },
    {
      question: "Which image API is best for editing rather than fresh generation?",
      answer:
        "Nano Banana Pro is widely cited as the strongest editing-first model in 2026, with multi-image composition and instruction edits that hold structure across passes.",
    },
    {
      question: "Do I need to integrate all ten APIs myself?",
      answer:
        "No. AnyCap routes Seedream 5, Nano Banana Pro, Nano Banana 2, GPT Image 1.5, and other supported models through one capability runtime, so an agent calls one CLI or HTTP endpoint instead of ten provider SDKs.",
    },
    {
      question: "Where does Midjourney fit in an agent stack?",
      answer:
        "Midjourney v8 still leads on aesthetic ceiling, but its API surface is async-only and not designed for autonomous agents. It's best left to human-in-the-loop design workflows in 2026.",
    },
    {
      question: "Is open-weights still relevant for agent workloads?",
      answer:
        "Yes. Flux 2 Pro is the clearest example. Open-weights matters most when the workload must stay inside a private VPC or when latency dominates the routing decision.",
    },
  ],
};

const contentByLocale: Record<SiteLocale, BestImageGenApiPageData> = {
  en,
  "pt-br": en,
  id: en,
  de: en,
};

export function getBestImageGenApiMetadata(locale: SiteLocale): Metadata {
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

export function getBestImageGenApiPageData(locale: SiteLocale) {
  return contentByLocale[locale] ?? contentByLocale.en;
}
