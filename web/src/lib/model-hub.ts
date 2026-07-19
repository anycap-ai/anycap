export type ModelHubCapability = "image" | "video" | "music" | "audio";

export type ModelHubModel = {
  modelId: string;
  model: string;
  capability: ModelHubCapability;
  modes: readonly string[];
  credits: string;
  updatedAt: string;
  href: string;
  bestFor: string;
};

export function sortModelHubModels<T extends Pick<ModelHubModel, "model" | "updatedAt">>(
  models: readonly T[],
): T[] {
  return [...models].sort(
    (left, right) =>
      right.updatedAt.localeCompare(left.updatedAt) || left.model.localeCompare(right.model),
  );
}

export function getModelHubModels(capability: ModelHubCapability): ModelHubModel[] {
  return sortModelHubModels(modelHubModels.filter((model) => model.capability === capability));
}

export const modelHubModels = [
  { modelId: "nano-banana-lite", model: "Nano Banana 2 Lite", capability: "image", modes: ["text-to-image", "image-to-image"], credits: "varies", updatedAt: "2026-07-04", href: "/capabilities/image-generation", bestFor: "Fast, cost-efficient drafts, variants, and high-volume visual iteration." },
  { modelId: "flux-kontext-max", model: "FLUX.1 Kontext Max", capability: "image", modes: ["text-to-image", "image-to-image"], credits: "varies", updatedAt: "2026-05-12", href: "/models/flux-kontext-max", bestFor: "Design-heavy generation and contextual edits with strong creative control." },
  { modelId: "gpt-image-2", model: "GPT Image 2", capability: "image", modes: ["text-to-image", "image-to-image"], credits: "varies", updatedAt: "2026-05-12", href: "/models/gpt-image-2", bestFor: "General-purpose image generation and prompt-driven edits." },
  { modelId: "qwen-image", model: "Qwen Image", capability: "image", modes: ["text-to-image", "image-to-image"], credits: "varies", updatedAt: "2026-05-12", href: "/models/qwen-image", bestFor: "Bilingual and instruction-heavy visual generation and editing." },
  { modelId: "nano-banana-2", model: "Nano Banana 2", capability: "image", modes: ["text-to-image", "image-to-image"], credits: "~4", updatedAt: "2026-03-30", href: "/models/nano-banana-2", bestFor: "Fast, scalable image generation and high-volume iteration." },
  { modelId: "nano-banana-pro", model: "Nano Banana Pro", capability: "image", modes: ["text-to-image", "image-to-image"], credits: "~7", updatedAt: "2026-03-30", href: "/models/nano-banana-pro", bestFor: "Higher-fidelity revision loops and commercial image edits." },
  { modelId: "seedream-4.5", model: "Seedream 4.5", capability: "image", modes: ["text-to-image", "image-to-image"], credits: "varies", updatedAt: "2026-03-30", href: "/models/seedream-4-5", bestFor: "Stable everyday image generation, transformation, and refinement." },
  { modelId: "seedream-5", model: "Seedream 5", capability: "image", modes: ["text-to-image", "image-to-image"], credits: "~2", updatedAt: "2026-03-30", href: "/models/seedream-5", bestFor: "Polished first-pass generation and controlled visual refinement." },

  { modelId: "seedance-2-mini", model: "Seedance 2.0 Mini", capability: "video", modes: ["text-to-video", "image-to-video", "first-last-frame-to-video", "multi-modal-reference"], credits: "varies", updatedAt: "2026-07-18", href: "/capabilities/video-generation", bestFor: "Efficient video drafts with text, image, first/last-frame, or multimodal references." },
  { modelId: "kling-3.0", model: "Kling 3.0", capability: "video", modes: ["text-to-video", "image-to-video", "first-last-frame-to-video", "multi-shot-video"], credits: "~9", updatedAt: "2026-07-14", href: "/models/kling-3-0", bestFor: "Cinematic motion, first/last-frame transitions, and multi-shot video workflows." },
  { modelId: "seedance-2", model: "Seedance 2.0", capability: "video", modes: ["text-to-video", "image-to-video", "first-last-frame-to-video", "multi-modal-reference"], credits: "varies", updatedAt: "2026-07-14", href: "/models/seedance-2", bestFor: "High-quality video with first/last-frame and multimodal-reference control." },
  { modelId: "gemini-omni-flash-preview", model: "Gemini Omni Flash Preview", capability: "video", modes: ["edit-video"], credits: "varies", updatedAt: "2026-07-04", href: "/models/gemini-omni-flash-preview", bestFor: "Natural-language editing and refinement of existing footage." },
  { modelId: "seedance-2-fast", model: "Seedance 2.0 Fast", capability: "video", modes: ["text-to-video", "image-to-video", "multi-modal-reference"], credits: "varies", updatedAt: "2026-06-25", href: "/models/seedance-2-fast", bestFor: "Fast previews and multimodal-reference video iteration." },
  { modelId: "kling-3.0-omni", model: "Kling 3.0 Omni", capability: "video", modes: ["text-to-video", "image-to-video", "multi-shot-video"], credits: "varies", updatedAt: "2026-06-24", href: "/capabilities/video-generation", bestFor: "Flexible text, image, and multi-shot video generation." },
  { modelId: "hailuo-2.3", model: "Hailuo 2.3", capability: "video", modes: ["text-to-video", "image-to-video"], credits: "varies", updatedAt: "2026-05-12", href: "/models/hailuo-2-3", bestFor: "Short narrative clips, character motion, and reference-image animation." },
  { modelId: "kling-o1", model: "Kling O1", capability: "video", modes: ["image-to-video"], credits: "varies", updatedAt: "2026-05-12", href: "/models/kling-o1", bestFor: "Animating a source image when the reference frame should drive the clip." },
  { modelId: "seedance-1.5-pro", model: "Seedance 1.5 Pro", capability: "video", modes: ["text-to-video", "image-to-video"], credits: "~14", updatedAt: "2026-05-12", href: "/models/seedance-1-5-pro", bestFor: "Repeatable production-friendly text-to-video and image-to-video work." },
  { modelId: "sora-2-pro", model: "Sora 2 Pro", capability: "video", modes: ["text-to-video", "image-to-video"], credits: "varies", updatedAt: "2026-05-12", href: "/models/sora-2-pro", bestFor: "High-end narrative, cinematic, and realistic video generation." },
  { modelId: "veo-3.1", model: "Veo 3.1", capability: "video", modes: ["text-to-video", "image-to-video"], credits: "~20", updatedAt: "2026-05-12", href: "/models/veo-3-1", bestFor: "Premium story-driven video when the first pass needs strong polish." },
  { modelId: "veo-3.1-fast", model: "Veo 3.1 Fast", capability: "video", modes: ["text-to-video", "image-to-video"], credits: "varies", updatedAt: "2026-05-12", href: "/models/veo-3-1-fast", bestFor: "Faster Veo-family previews and creative iteration." },

  { modelId: "mureka-v8", model: "Mureka V8", capability: "music", modes: ["text-to-music"], credits: "varies", updatedAt: "2026-05-12", href: "/models/mureka-v8", bestFor: "Vocal-oriented songwriting and instrumental composition." },
  { modelId: "suno-v5.5", model: "Suno V5.5", capability: "music", modes: ["text-to-music"], credits: "varies", updatedAt: "2026-05-12", href: "/models/suno-v5-5", bestFor: "Current Suno track drafts, vocal concepts, and song iteration." },
  { modelId: "elevanlabs-music", model: "ElevenLabs Music", capability: "music", modes: ["text-to-music"], credits: "~1", updatedAt: "2026-03-30", href: "/models/elevenlabs-music", bestFor: "Prompt-based background tracks and soundtrack drafts." },
  { modelId: "suno-v5", model: "Suno V5", capability: "music", modes: ["text-to-music"], credits: "varies", updatedAt: "2026-03-30", href: "/models/suno-v5", bestFor: "Structured song and vocal-demo concepts from prompts." },

  { modelId: "doubao-seed-audio-1-0", model: "Doubao Seed Audio 1.0", capability: "audio", modes: ["text-to-audio", "audio-to-audio", "image-to-audio"], credits: "varies", updatedAt: "2026-07-18", href: "/capabilities", bestFor: "Speech, dialogue, sound effects, and complete audio scenes from text, audio, or image input." },
] as const satisfies readonly ModelHubModel[];
