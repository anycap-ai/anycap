export type CatalogModelCapability = "image" | "video" | "music";

export type CatalogModel = {
  slug: string;
  path: string;
  modelId: string;
  displayName: string;
  provider: string;
  capability: CatalogModelCapability;
  capabilityLabel: string;
  operation: "generate";
  modes: readonly string[];
  status: "active";
  creditEstimate: string;
  description: string;
  bestFor: string;
  tradeoff: string;
  evidenceNote: string;
  examplePrompt: string;
  outputFile: string;
};

const imageModels = [
  {
    slug: "flux-kontext-max",
    modelId: "flux-kontext-max",
    displayName: "FLUX.1 Kontext Max",
    provider: "Black Forest Labs",
    creditEstimate: "Varies by catalog pricing",
    description:
      "FLUX.1 Kontext Max is exposed in AnyCap as an active image generation and editing model for text-to-image and image-to-image workflows.",
    bestFor:
      "Design-heavy image generation and contextual edits where prompt adherence, visual richness, and iterative refinement matter.",
    tradeoff:
      "Use it when creative control is more important than choosing the lowest-cost image model in the catalog.",
    evidenceNote:
      "Availability, model ID, operations, and modes are verified from the AnyCap CLI catalog; external positioning is kept high-level unless official sources are available.",
    examplePrompt: "editorial product scene with precise packaging updates and clean studio lighting",
    outputFile: "flux-kontext-max.png",
  },
  {
    slug: "gpt-image-2",
    modelId: "gpt-image-2",
    displayName: "GPT Image 2",
    provider: "OpenAI",
    creditEstimate: "Varies by catalog pricing",
    description:
      "GPT Image 2 is exposed in AnyCap as an active image generation and prompt-driven editing model.",
    bestFor:
      "General-purpose image generation and image edits when the workflow benefits from OpenAI's multimodal image model family.",
    tradeoff:
      "Use it as a broad creative default; compare against specialized models when the job is mainly speed, cost, typography, or brand-style iteration.",
    evidenceNote:
      "AnyCap CLI verifies the active model ID and supported modes. Avoid hard claims about release dates, benchmark rank, or exact resolution unless backed by an official OpenAI source.",
    examplePrompt: "clean SaaS product hero image with interface cards and warm off-white lighting",
    outputFile: "gpt-image-2.png",
  },
  {
    slug: "nano-banana-2",
    modelId: "nano-banana-2",
    displayName: "Nano Banana 2",
    provider: "Google",
    creditEstimate: "~4 credits / call",
    description:
      "Nano Banana 2 is an active AnyCap image model for fast, large-scale visual creation and conversational image editing.",
    bestFor:
      "High-volume visual iteration, product mockups, storyboards, marketing variants, and fast image-to-image refinement.",
    tradeoff:
      "Choose a more polish-oriented model when the first pass needs maximum finish more than throughput.",
    evidenceNote:
      "Existing hand-written page contains first-party generated examples; CLI catalog verifies current model ID and modes.",
    examplePrompt: "three visual directions for the same matte graphite laptop product hero",
    outputFile: "nano-banana-2.png",
  },
  {
    slug: "nano-banana-pro",
    modelId: "nano-banana-pro",
    displayName: "Nano Banana Pro",
    provider: "Google",
    creditEstimate: "~7 credits / call",
    description:
      "Nano Banana Pro is an active AnyCap image model for higher-fidelity text-to-image and image-to-image creation.",
    bestFor:
      "Revision loops, commercial visuals, and image edits where stronger visual fidelity and prompt alignment matter.",
    tradeoff:
      "Use Nano Banana 2 when speed and throughput matter more than peak visual fidelity.",
    evidenceNote:
      "Existing hand-written page contains first-party generated examples; CLI catalog verifies current model ID and modes.",
    examplePrompt: "refine this campaign visual with cleaner shadows and stronger composition",
    outputFile: "nano-banana-pro.png",
  },
  {
    slug: "qwen-image",
    modelId: "qwen-image",
    displayName: "Qwen Image",
    provider: "Alibaba",
    creditEstimate: "Varies by catalog pricing",
    description:
      "Qwen Image is exposed in AnyCap as an active image generation and editing model with strong prompt adherence across text-to-image and image-to-image workflows.",
    bestFor:
      "Bilingual or instruction-heavy visual work, especially when an agent needs a model associated with the Qwen multimodal family.",
    tradeoff:
      "Validate text rendering and brand-specific details on real outputs before using it for production assets.",
    evidenceNote:
      "AnyCap CLI verifies availability and modes; external grounded results support broad positioning but not exact benchmark claims.",
    examplePrompt: "bilingual product launch poster with clean layout and no readable text artifacts",
    outputFile: "qwen-image.png",
  },
  {
    slug: "seedream-4-5",
    modelId: "seedream-4.5",
    displayName: "Seedream 4.5",
    provider: "ByteDance",
    creditEstimate: "Varies by catalog pricing",
    description:
      "Seedream 4.5 is exposed in AnyCap as an active image generation and transformation model for text-to-image and image-to-image tasks.",
    bestFor:
      "Everyday image generation, image transformation, and iterative editing where stable structure preservation matters.",
    tradeoff:
      "Use Seedream 5 when the workflow should start from the newer Seedream entry in the AnyCap catalog.",
    evidenceNote:
      "AnyCap CLI verifies model ID, active status, and supported generation modes.",
    examplePrompt: "transform this product photo into a cleaner launch-ready visual",
    outputFile: "seedream-4-5.png",
  },
  {
    slug: "seedream-5",
    modelId: "seedream-5",
    displayName: "Seedream 5",
    provider: "ByteDance",
    creditEstimate: "~2 credits / call",
    description:
      "Seedream 5 is an active AnyCap image model for text-to-image generation and image-to-image refinement.",
    bestFor:
      "Polished first-pass image generation, controlled visual modifications, style transfer, and creative refinement.",
    tradeoff:
      "Pair or compare it with Nano Banana Pro when the workflow is more about targeted editing than first-pass generation.",
    evidenceNote:
      "Existing hand-written page contains first-party generated examples; CLI catalog verifies current model ID and modes.",
    examplePrompt: "premium SaaS product hero scene with warm studio lighting and no readable text",
    outputFile: "seedream-5.png",
  },
] as const satisfies readonly Omit<CatalogModel, "path" | "capability" | "capabilityLabel" | "operation" | "modes" | "status">[];

const videoModels = [
  {
    slug: "hailuo-2-3",
    modelId: "hailuo-2.3",
    displayName: "Hailuo 2.3",
    provider: "MiniMax",
    creditEstimate: "Varies by catalog pricing",
    description:
      "Hailuo 2.3 is exposed in AnyCap as an active video model for text-to-video and image-to-video generation.",
    bestFor:
      "Short narrative clips, expressive character motion, visual storytelling, and reference-image animation.",
    tradeoff:
      "Compare against Seedance or Veo models when the job needs a different balance of speed, polish, or cinematic control.",
    evidenceNote:
      "AnyCap CLI verifies availability, active status, and supported modes.",
    examplePrompt: "a short cinematic product reveal with expressive human motion and soft camera movement",
    outputFile: "hailuo-2-3.mp4",
  },
  {
    slug: "kling-3-0",
    modelId: "kling-3.0",
    displayName: "Kling 3.0",
    provider: "Kuaishou",
    creditEstimate: "~9 credits / second",
    description:
      "Kling 3.0 is an active AnyCap video model for text-to-video and image-to-video generation.",
    bestFor:
      "Cinematic motion, realistic scene animation, and image-to-video workflows that need controllable camera dynamics.",
    tradeoff:
      "Use a faster or lower-cost video model when preview speed matters more than cinematic motion.",
    evidenceNote:
      "Existing hand-written page contains model guidance; CLI catalog verifies current model ID and modes.",
    examplePrompt: "a cinematic street scene in the rain with neon reflections and slow camera movement",
    outputFile: "kling-3-0.mp4",
  },
  {
    slug: "kling-o1",
    modelId: "kling-o1",
    displayName: "Kling O1",
    provider: "Kuaishou",
    creditEstimate: "Varies by catalog pricing",
    description:
      "Kling O1 is exposed in AnyCap as an active image-to-video model for animating reference images.",
    bestFor:
      "Product demos, stylized motion design, and image-conditioned clips where the source frame should drive the video.",
    tradeoff:
      "It is image-to-video only in the current AnyCap catalog, so choose Kling 3.0 when the task needs text-to-video support.",
    evidenceNote:
      "AnyCap CLI verifies that the active operation supports image-to-video mode.",
    examplePrompt: "animate this hero frame with a slow push-in and subtle atmospheric motion",
    outputFile: "kling-o1.mp4",
  },
  {
    slug: "seedance-1-5-pro",
    modelId: "seedance-1.5-pro",
    displayName: "Seedance 1.5 Pro",
    provider: "ByteDance",
    creditEstimate: "~14 credits / second",
    description:
      "Seedance 1.5 Pro is an active AnyCap video model for production-friendly text-to-video and image-to-video generation.",
    bestFor:
      "Repeatable product videos, smooth image-to-video jobs, and production workflows that need a steady default.",
    tradeoff:
      "Compare with Seedance 2.0 when the workflow should use the newer Seedance entry.",
    evidenceNote:
      "Existing hand-written page contains model guidance; CLI catalog verifies current model ID and modes.",
    examplePrompt: "a clean product reveal with subtle camera motion and stable temporal consistency",
    outputFile: "seedance-1-5-pro.mp4",
  },
  {
    slug: "seedance-2",
    modelId: "seedance-2",
    displayName: "Seedance 2.0",
    provider: "ByteDance",
    creditEstimate: "Varies by catalog pricing",
    description:
      "Seedance 2.0 is exposed in AnyCap as an active video generation model for text-to-video and image-to-video workflows.",
    bestFor:
      "High-quality cinematic and product video workflows where agents need the newer Seedance model entry.",
    tradeoff:
      "Use Seedance 2.0 Fast when turnaround speed matters more than peak output quality.",
    evidenceNote:
      "AnyCap CLI verifies the active model ID and modes; external claims about advanced reference systems are not used unless official sources are confirmed.",
    examplePrompt: "cinematic product video with precise camera movement and polished lighting",
    outputFile: "seedance-2.mp4",
  },
  {
    slug: "seedance-2-fast",
    modelId: "seedance-2-fast",
    displayName: "Seedance 2.0 Fast",
    provider: "ByteDance",
    creditEstimate: "Varies by catalog pricing",
    description:
      "Seedance 2.0 Fast is exposed in AnyCap as the faster Seedance 2.0 variant for text-to-video and image-to-video generation.",
    bestFor:
      "Previewing, ideation, and high-volume video iteration when an agent needs faster turnaround.",
    tradeoff:
      "Use Seedance 2.0 or another premium model when the job is more quality-sensitive than latency-sensitive.",
    evidenceNote:
      "AnyCap CLI verifies availability and modes; page copy avoids unverified quality-percentage claims.",
    examplePrompt: "fast preview of a product walkthrough with smooth camera movement",
    outputFile: "seedance-2-fast.mp4",
  },
  {
    slug: "sora-2-pro",
    modelId: "sora-2-pro",
    displayName: "Sora 2 Pro",
    provider: "OpenAI",
    creditEstimate: "Varies by catalog pricing",
    description:
      "Sora 2 Pro is exposed in AnyCap as an active video generation model for text-to-video and image-to-video workflows.",
    bestFor:
      "High-end narrative, cinematic, product, and realistic video generation when teams want an OpenAI video model through the same CLI.",
    tradeoff:
      "Because public availability details can change quickly, treat AnyCap CLI active status as the operational source of truth.",
    evidenceNote:
      "Grounded search produced conflicting external availability claims, so this page only states AnyCap catalog availability and avoids broader platform-status claims.",
    examplePrompt: "cinematic product launch clip with realistic motion and coherent scene lighting",
    outputFile: "sora-2-pro.mp4",
  },
  {
    slug: "veo-3-1",
    modelId: "veo-3.1",
    displayName: "Veo 3.1",
    provider: "Google",
    creditEstimate: "~20 credits / second",
    description:
      "Veo 3.1 is an active AnyCap video model for premium text-to-video and image-to-video generation.",
    bestFor:
      "Premium video output, polished motion, and story-driven clips where the first pass needs to look strong.",
    tradeoff:
      "Use Veo 3.1 Fast when iteration speed matters more than maximum polish.",
    evidenceNote:
      "Existing hand-written page contains model guidance; CLI catalog verifies current model ID and modes.",
    examplePrompt: "premium cinematic AI agent workflow video with realistic motion and polished lighting",
    outputFile: "veo-3-1.mp4",
  },
  {
    slug: "veo-3-1-fast",
    modelId: "veo-3.1-fast",
    displayName: "Veo 3.1 Fast",
    provider: "Google",
    creditEstimate: "Varies by catalog pricing",
    description:
      "Veo 3.1 Fast is exposed in AnyCap as a faster Veo 3.1 variant for text-to-video and image-to-video workflows.",
    bestFor:
      "Rapid creative iteration and preview generation when an agent wants the Veo family with faster turnaround.",
    tradeoff:
      "Use Veo 3.1 when the job is more polish-sensitive than latency-sensitive.",
    evidenceNote:
      "AnyCap CLI verifies active status and modes; page copy avoids exact speed or quality delta claims unless officially sourced.",
    examplePrompt: "quick cinematic preview of a SaaS product scene with smooth camera movement",
    outputFile: "veo-3-1-fast.mp4",
  },
] as const satisfies readonly Omit<CatalogModel, "path" | "capability" | "capabilityLabel" | "operation" | "modes" | "status">[];

const musicModels = [
  {
    slug: "elevenlabs-music",
    modelId: "elevanlabs-music",
    displayName: "ElevenLabs Music",
    provider: "ElevenLabs",
    creditEstimate: "~1 credit / second",
    description:
      "ElevenLabs Music is an active AnyCap text-to-music model for prompt-based soundtrack generation.",
    bestFor:
      "Background tracks, soundtrack drafts, and music generation inside the same runtime as image and video production.",
    tradeoff:
      "Use Suno or Mureka entries when the workflow emphasizes song structure, vocals, or genre-specific songwriting experiments.",
    evidenceNote:
      "Existing page documents the current AnyCap model ID spelling; CLI catalog verifies active status and text-to-music mode.",
    examplePrompt: "uplifting ambient soundtrack with soft synths and a steady pulse",
    outputFile: "elevenlabs-music.mp3",
  },
  {
    slug: "mureka-v8",
    modelId: "mureka-v8",
    displayName: "Mureka V8",
    provider: "Mureka",
    creditEstimate: "Varies by catalog pricing",
    description:
      "Mureka V8 is exposed in AnyCap as an active text-to-music model for vocal and instrumental composition from prompts.",
    bestFor:
      "Songwriting, vocal-oriented drafts, and audio content production when an agent needs an alternative to Suno or ElevenLabs Music.",
    tradeoff:
      "Validate lyrics, vocal style, and commercial fit on actual outputs before production use.",
    evidenceNote:
      "AnyCap CLI verifies model ID and mode; external grounded results are treated as positioning support, not hard benchmark evidence.",
    examplePrompt: "energetic indie pop song with clear chorus, warm drums, and optimistic vocals",
    outputFile: "mureka-v8.mp3",
  },
  {
    slug: "suno-v5",
    modelId: "suno-v5",
    displayName: "Suno V5",
    provider: "Suno",
    creditEstimate: "Varies by catalog pricing",
    description:
      "Suno V5 is exposed in AnyCap as an active text-to-music model for complete songs and audio tracks from prompts.",
    bestFor:
      "Structured songs, vocal demos, and full-track concepts that need lyrics, mood, and arrangement guidance.",
    tradeoff:
      "Use Suno V5.5 when the workflow should start from the latest Suno entry available in AnyCap.",
    evidenceNote:
      "AnyCap CLI verifies active status and text-to-music mode.",
    examplePrompt: "cinematic synth-pop song about shipping software at midnight, anthemic chorus",
    outputFile: "suno-v5.mp3",
  },
  {
    slug: "suno-v5-5",
    modelId: "suno-v5.5",
    displayName: "Suno V5.5",
    provider: "Suno",
    creditEstimate: "Varies by catalog pricing",
    description:
      "Suno V5.5 is exposed in AnyCap as an active text-to-music model and the newer Suno entry in the current catalog.",
    bestFor:
      "Current Suno music generation workflows, complete track drafts, vocal concepts, and high-iteration song ideas.",
    tradeoff:
      "Use a different music model when the workflow has a provider preference or needs a different sound profile.",
    evidenceNote:
      "AnyCap CLI verifies active status and model ID; avoid unsupported claims about personalization features unless verified from Suno sources.",
    examplePrompt: "driving electronic launch soundtrack with confident vocals and a memorable chorus",
    outputFile: "suno-v5-5.mp3",
  },
] as const satisfies readonly Omit<CatalogModel, "path" | "capability" | "capabilityLabel" | "operation" | "modes" | "status">[];

function withImageDefaults(
  model: (typeof imageModels)[number],
): CatalogModel {
  return {
    ...model,
    path: `/models/${model.slug}`,
    capability: "image",
    capabilityLabel: "Image generation",
    operation: "generate",
    modes: ["text-to-image", "image-to-image"],
    status: "active",
  };
}

function withVideoDefaults(
  model: (typeof videoModels)[number],
): CatalogModel {
  return {
    ...model,
    path: `/models/${model.slug}`,
    capability: "video",
    capabilityLabel: "Video generation",
    operation: "generate",
    modes: model.modelId === "kling-o1" ? ["image-to-video"] : ["text-to-video", "image-to-video"],
    status: "active",
  };
}

function withMusicDefaults(
  model: (typeof musicModels)[number],
): CatalogModel {
  return {
    ...model,
    path: `/models/${model.slug}`,
    capability: "music",
    capabilityLabel: "Music generation",
    operation: "generate",
    modes: ["text-to-music"],
    status: "active",
  };
}

export const catalogModels: readonly CatalogModel[] = [
  ...imageModels.map(withImageDefaults),
  ...videoModels.map(withVideoDefaults),
  ...musicModels.map(withMusicDefaults),
];

export const catalogModelsBySlug = Object.fromEntries(
  catalogModels.map((model) => [model.slug, model]),
) as Record<string, CatalogModel>;

export const handWrittenModelSlugs = new Set([
  "seedream-5",
  "nano-banana-pro",
  "nano-banana-2",
  "veo-3-1",
  "kling-3-0",
  "seedance-1-5-pro",
  "elevenlabs-music",
]);

export const generatedCatalogModelSlugs = catalogModels
  .map((model) => model.slug)
  .filter((slug) => !handWrittenModelSlugs.has(slug));

export function getCatalogModelsByCapability(capability: CatalogModelCapability) {
  return catalogModels.filter((model) => model.capability === capability);
}
