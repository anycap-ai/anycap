import type { Metadata } from "next";
import { createFaqPageJsonLd, createTechArticleJsonLd } from "@/lib/schema";
import { getLocaleConfig, siteConfig, type SiteLocale } from "@/lib/site";

export const BEST_VIDEO_GEN_API_FOR_AGENTS_PATH =
  "/learn/best-video-generation-api-for-ai-agents-2026";

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

type BestVideoGenApiPageData = {
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

const lastUpdatedIso = "2026-04-20";

const en: BestVideoGenApiPageData = {
  breadcrumbItems: [
    { name: "Home", href: "/" },
    { name: "Learn", href: "/learn", unlinkable: true },
    { name: "Best video generation API for AI agents (2026)" },
  ],
  eyebrow: "Learn",
  metadata: {
    title: "Best Video Generation API for AI Agents (2026)",
    description:
      "Agent-first ranking of the top video generation APIs in 2026, Veo 3.1, Kling 3.0, Seedance 1.5 Pro, Wan 2.1, Runway Gen-4, and more. Scored for agent runtime fit, async reliability, and per-call cost.",
    openGraphTitle: "Best Video Generation API for AI Agents (2026)",
    openGraphDescription:
      "Most listicles rank video APIs for human creators. This one ranks them for agents: per-call cost, async job handling, schema stability, and one-runtime routing.",
  },
  articleJsonLd: createTechArticleJsonLd({
    headline: "Best Video Generation API for AI Agents (2026)",
    description:
      "An agent-first buyer guide to video generation APIs in 2026, comparing leading models on per-call cost, async reliability, schema stability, and runtime fit for autonomous agent workflows.",
    path: BEST_VIDEO_GEN_API_FOR_AGENTS_PATH,
    about: [
      "Video generation APIs",
      "AI agents",
      "Agent capability runtime",
      "Veo 3.1",
      "Kling 3.0",
      "Seedance 1.5 Pro",
      "Wan 2.1",
      "Runway Gen-4",
      "AnyCap",
    ],
    keywords: [
      "best video generation api 2026",
      "best video generation api for agents",
      "video generation api for ai agents",
      "video generation api comparison",
      "ai agent video generation",
      "veo 3.1 api",
      "kling 3.0 api",
      "seedance api",
      "agent capability runtime",
      "video generation agent",
    ],
    datePublished: lastUpdatedIso,
    dateModified: lastUpdatedIso,
  }),
  faqJsonLd: createFaqPageJsonLd([
    {
      question: "What is the best video generation API for AI agents in 2026?",
      answer:
        "There's no single best answer, it depends on the use case. Veo 3.1 leads for cinematic realism and text-to-video quality. Kling 3.0 leads for motion smoothness and image-to-video. Seedance 1.5 Pro leads for cost efficiency at scale. The best agent setup routes across all three from a single runtime rather than locking to one provider.",
    },
    {
      question: "Why do agents need a different shortlist than human video creators?",
      answer:
        "Agents care about per-call cost predictability, async job reliability, schema-stable JSON outputs, and the overhead of managing multiple provider SDKs. Human creators care about UI quality and prompt feel. The two shortlists don't match.",
    },
    {
      question: "Which video model is best for image-to-video workflows?",
      answer:
        "Kling 3.0 is the strongest image-to-video model in 2026, with excellent character consistency across frames and strong motion quality. It supports camera direction prompts (pan, zoom, crane), which is useful for programmatic agent control.",
    },
    {
      question: "Which video model has the best quality for cinematic output?",
      answer:
        "Veo 3.1 (Google DeepMind) currently leads for cinematic realism, temporal coherence, and physical plausibility. It's the strongest model when quality is the primary constraint.",
    },
    {
      question: "Do I need to integrate all video APIs myself?",
      answer:
        "No. AnyCap routes Veo 3.1, Kling 3.0, and Seedance 1.5 Pro through one capability runtime. An agent calls one CLI or HTTP endpoint instead of managing separate credentials and SDKs for each provider.",
    },
    {
      question: "How does async job handling work for video generation in an agent?",
      answer:
        "Video generation jobs take 30–120 seconds depending on model and clip length. The right pattern is: submit the job, get a job ID, poll for completion, then retrieve the video URL. AnyCap normalizes this pattern across all video models so the agent doesn't need provider-specific polling logic.",
    },
  ]),
  lastUpdatedLabel: "Updated April 20, 2026",
  heroTitle: ["Best video generation API", "for AI agents (2026)"],
  heroIntro:
    "Most 2026 video-API listicles rank models for human creators in consumer UIs. Agents have a different set of requirements: per-call cost predictability, async job reliability, schema-stable JSON outputs, and the overhead of integrating multiple provider SDKs into a single agent loop. This guide ranks the leading video APIs from that lens, which model an autonomous agent should reach for, and how to avoid wiring five separate clients to do it.",
  quickAnswerLabel: "Quick answer",
  quickAnswerTitle: "There's no single best video API for agents. The right move is one runtime that routes the three that matter.",
  quickAnswerBody:
    "Veo 3.1 wins cinematic realism and text-to-video quality. Kling 3.0 wins image-to-video and motion smoothness. Seedance 1.5 Pro wins cost efficiency at scale. Locking an agent to any one of them gives up the others. The best agent setup routes through a single capability runtime, one CLI, one auth path, one response schema, and picks the right model per task. That's what AnyCap provides.",
  comparisonLabel: "Comparison table",
  comparisonTitle: "Top video generation APIs ranked for agent use, April 2026",
  comparisonIntro:
    "Agent fit means a combination of per-call cost predictability, schema-stable JSON outputs, async job reliability, and how cleanly the model is reachable without standing up its own SDK. AnyCap support means the model is reachable today through the AnyCap capability runtime.",
  comparisonHeaders: {
    model: "Model",
    provider: "Provider",
    bestFor: "Best for",
    agentFit: "Agent fit",
    anycap: "AnyCap",
  },
  comparisonRows: [
    {
      model: "Veo 3.1",
      provider: "Google DeepMind",
      bestFor: "Cinematic realism, temporal coherence",
      agentFit: "Strong. Vertex AI, predictable async",
      anycap: "Yes",
    },
    {
      model: "Kling 3.0",
      provider: "Kuaishou",
      bestFor: "Image-to-video, motion quality, camera control",
      agentFit: "Strong. Clean image-to-video semantics",
      anycap: "Yes",
    },
    {
      model: "Seedance 1.5 Pro",
      provider: "ByteDance",
      bestFor: "Cost-efficient batch generation at scale",
      agentFit: "Strong. Predictable per-clip pricing",
      anycap: "Yes",
    },
    {
      model: "Wan 2.1",
      provider: "Alibaba",
      bestFor: "Open-weights option, self-host flexibility",
      agentFit: "Strong. Works through Replicate or fal.ai",
      anycap: "Coming",
    },
    {
      model: "Runway Gen-4",
      provider: "Runway",
      bestFor: "Creative control, director-style prompt",
      agentFit: "Medium. Strong but async-first, proprietary",
      anycap: "—",
    },
    {
      model: "Hailuo MiniMax",
      provider: "MiniMax",
      bestFor: "Character consistency, story-driven video",
      agentFit: "Medium. Good API surface, limited throughput",
      anycap: "—",
    },
    {
      model: "Luma Dream Machine 2",
      provider: "Luma AI",
      bestFor: "Fluid physics, smooth motion loops",
      agentFit: "Medium. REST API, reasonable latency",
      anycap: "—",
    },
    {
      model: "Pika 2.2",
      provider: "Pika Labs",
      bestFor: "Lip sync, audio-driven video",
      agentFit: "Weak. Consumer-focused, limited API",
      anycap: "—",
    },
  ],
  criteriaLabel: "How we ranked",
  criteriaTitle: "Four things to evaluate before wiring a video API into an agent",
  criteriaCards: [
    {
      title: "Async job reliability",
      body:
        "Video generation is always async. Jobs take 30–120 seconds. An API that returns a stable job ID, a predictable polling endpoint, idempotent retries, and clear terminal-state semantics (succeeded, failed, cancelled) prevents the agent loop from getting stuck or losing results silently.",
    },
    {
      title: "Per-call cost predictability",
      body:
        "Agents fan out. A single pipeline task can trigger five clips, three edits, and two retries. Models with flat per-second or per-clip pricing, and no surprise billing on cancelled jobs, win the long-run cost race even when the headline price looks higher.",
    },
    {
      title: "Schema-stable JSON outputs",
      body:
        "Agents don't watch the video. They parse the response. APIs that return predictable fields (video URL, duration, job status) survive prompt drift. APIs that change response shape across versions or bury the URL in a nested polling endpoint break agent loops in subtle ways.",
    },
    {
      title: "Cost of integrating five SDKs",
      body:
        "Every additional video provider is another credential path, another error vocabulary, another rate-limit surface, and another polling implementation. The best video API for agents in 2026 isn't a single API. It's a runtime that routes the right model per task, so the agent integrates one surface instead of five.",
    },
  ],
  modelsLabel: "Per-model breakdown",
  modelsTitle: "What each model is actually good at, from an agent's point of view",
  modelsIntro:
    "Brief, opinionated notes on the top models in the comparison table, when an agent should reach for which one, and where the integration friction shows up.",
  modelCards: [
    {
      name: "Veo 3.1",
      provider: "Google DeepMind",
      positioning:
        "The current quality leader for cinematic video. Veo 3.1 produces physically plausible scenes with strong temporal coherence, objects don't flicker or drift between frames the way older models do. It's the right choice when quality is the primary constraint and the workflow can absorb the Vertex AI credential overhead.",
      agentNotes:
        "Veo 3.1 runs through Google's Vertex AI, which requires separate GCP credential management. AnyCap normalizes this into the standard video generate interface, the agent doesn't need to know it's hitting Vertex.",
      href: "/models/veo-3-1",
    },
    {
      name: "Kling 3.0",
      provider: "Kuaishou",
      positioning:
        "The strongest image-to-video model in 2026. Kling 3.0 maintains character and subject identity across frames better than any other model in this class. It also supports camera direction prompts (pan, zoom, crane shot) that give agents programmatic cinematographic control.",
      agentNotes:
        "Image-to-video is Kling's highest-value use case in agent pipelines. The agent generates or retrieves a reference image, then passes it as a reference URL to Kling for animation. Both steps can run through AnyCap with the same credential.",
      href: "/models/kling-3-0",
    },
    {
      name: "Seedance 1.5 Pro",
      provider: "ByteDance",
      positioning:
        "The cost-efficiency leader. Seedance 1.5 Pro produces strong quality at a lower per-clip cost than Veo or Kling, making it the right choice for high-volume pipelines where cost per output is the binding constraint rather than maximum quality.",
      agentNotes:
        "Seedance is the best default for batch workflows where the agent is generating many clips in parallel. The cost structure makes it viable at volumes where Veo 3.1 or Kling 3.0 would exceed budget.",
      href: "/models/seedance-1-5-pro",
    },
    {
      name: "Wan 2.1",
      provider: "Alibaba",
      positioning:
        "The strongest open-weights option. Wan 2.1 is available for self-hosting inside a private VPC, which matters for regulated workloads or latency-sensitive pipelines where cloud roundtrips are too slow. It can also be reached via Replicate or fal.ai without self-hosting.",
      agentNotes:
        "Use Wan 2.1 when the workload must stay inside a private VPC or when open-weights flexibility is required for fine-tuning. Not yet supported directly by AnyCap.",
    },
    {
      name: "Runway Gen-4",
      provider: "Runway",
      positioning:
        "The creative control leader. Runway Gen-4 provides the most fine-grained director-style control over shot composition and style. It's the best choice for workflows where a human creative director is in the loop and needs nuanced prompt adherence.",
      agentNotes:
        "Runway's API is async-first and the response schema has changed between versions. It's a strong model but integration friction is higher than the top three for fully autonomous agent workflows.",
    },
    {
      name: "Hailuo MiniMax",
      provider: "MiniMax",
      positioning:
        "Strong for story-driven or character-consistent video sequences. MiniMax maintains character identity across multiple clips better than most models, making it useful for agents building serialized content like multi-episode sequences.",
      agentNotes:
        "API throughput can be limited at scale. Best suited for lower-volume, higher-quality-per-clip workflows. Not yet supported directly by AnyCap.",
    },
  ],
  decisionLabel: "Decision guide",
  decisionTitle: "Which video model should your agent reach for?",
  decisionRows: [
    {
      question: "Quality is the primary constraint — you need the most realistic output",
      answer:
        "Reach for Veo 3.1. It's the quality leader for cinematic realism and temporal coherence. The Vertex AI credential overhead is worth it when the output standard is high.",
    },
    {
      question: "You're animating a reference image or product photo",
      answer:
        "Reach for Kling 3.0. Image-to-video is its strongest use case, and it maintains character consistency across the clip better than the other models.",
    },
    {
      question: "You're generating many clips in a batch pipeline and cost is the constraint",
      answer:
        "Reach for Seedance 1.5 Pro. It produces strong quality at lower per-clip cost, making it the right choice when volume and cost matter more than maximum quality.",
    },
    {
      question: "The workload must stay inside a private VPC",
      answer:
        "Reach for Wan 2.1. It's the strongest open-weights option and can be self-hosted. Alternatively, route it through Replicate or fal.ai if self-hosting isn't needed.",
    },
    {
      question: "You want a single integration point for multiple models",
      answer:
        "Use AnyCap. It routes Veo 3.1, Kling 3.0, and Seedance 1.5 Pro through one capability runtime — one CLI, one credential, one response schema. The agent picks the model per task without managing separate provider SDKs.",
    },
  ],
  anycapLabel: "AnyCap",
  anycapTitle: "One runtime for all three video models",
  anycapBody:
    "Instead of integrating separate SDKs for Veo 3.1 (Vertex AI), Kling 3.0 (Kuaishou API), and Seedance 1.5 Pro (ByteDance), AnyCap exposes all three through a single capability runtime. The agent calls anycap video generate with a model flag and gets back a predictable JSON response with the video URL. Credential management, async polling, and error normalization happen inside the runtime.",
  anycapBullets: [
    "Veo 3.1 — supported",
    "Kling 3.0 — supported",
    "Seedance 1.5 Pro — supported",
    "One CLI command for all models",
    "Predictable JSON response schema",
    "No separate provider SDKs",
  ],
  nextMoveLabel: "Next steps",
  nextMoveTitle: "Where to go from here",
  nextMoveCards: [
    {
      title: "Veo 3.1 model page",
      href: "/models/veo-3-1",
      body: "Specs, pricing, and supported parameters for Veo 3.1.",
    },
    {
      title: "Kling 3.0 model page",
      href: "/models/kling-3-0",
      body: "Specs, pricing, and image-to-video workflow for Kling 3.0.",
    },
    {
      title: "How to use Veo 3.1 in an agent",
      href: "/guides/how-to-use-veo-3-in-ai-agent",
      body: "Step-by-step guide to integrating Veo 3.1 via AnyCap.",
    },
    {
      title: "How to use Kling 3.0 in an agent",
      href: "/guides/how-to-use-kling-in-ai-agent",
      body: "Step-by-step guide to integrating Kling 3.0 via AnyCap.",
    },
  ],
  faqLabel: "FAQ",
  faqTitle: "Frequently asked questions",
  faqItems: [
    {
      question: "What is the best video generation API for AI agents in 2026?",
      answer:
        "There's no single winner — it depends on the use case. Veo 3.1 leads for cinematic quality, Kling 3.0 leads for image-to-video, and Seedance 1.5 Pro leads for cost efficiency. The best agent setup routes across all three from one runtime.",
    },
    {
      question: "How do I handle async video jobs in an agent loop?",
      answer:
        "The standard pattern is: submit the job, receive a job ID, poll the status endpoint until the job completes, then retrieve the video URL. AnyCap normalizes this pattern across all supported video models — the agent uses the same polling interface regardless of provider.",
    },
    {
      question: "Can I use image-to-video in an agent pipeline?",
      answer:
        "Yes. Kling 3.0 supports image-to-video generation by accepting a reference image URL. The upstream step generates or retrieves the image (AnyCap image generate), and the next step passes it to Kling for animation — both through the same AnyCap runtime.",
    },
    {
      question: "Is Runway Gen-4 good for autonomous agent workflows?",
      answer:
        "Runway Gen-4 is an excellent model for creative control and prompt adherence, but its API surface has more integration friction than Veo, Kling, or Seedance for fully autonomous agent workflows. It's better suited for human-in-the-loop creative workflows.",
    },
    {
      question: "What is Seedance 1.5 Pro best for?",
      answer:
        "Seedance 1.5 Pro is ByteDance's cost-efficient video model. It produces strong quality at lower per-clip cost than Veo 3.1 or Kling 3.0, making it the right choice for high-volume batch pipelines.",
    },
  ],
};

const contentByLocale: Record<SiteLocale, BestVideoGenApiPageData> = {
  en,
  "pt-br": en,
  id: en,
  de: en,
};

export function getBestVideoGenApiMetadata(locale: SiteLocale): Metadata {
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

export function getBestVideoGenApiPageData(locale: SiteLocale) {
  return contentByLocale[locale] ?? contentByLocale.en;
}
