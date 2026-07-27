import type { CapabilityGapRow } from "@/components/landing/CapabilityGapTable";
import {
  getModelHubModels,
  type ModelHubModel,
} from "@/lib/model-hub";

export type AgentCapabilityGapAgent = "claude-code" | "cursor" | "codex" | "manus";

export type GenerationModel = ModelHubModel;

export type PricingGenerationGroup = {
  title: string;
  description: string;
  unitLabel: string;
  headers: [string, string, string];
  models: GenerationModel[];
};

export const pricingGenerationGroups: PricingGenerationGroup[] = [
  {
    title: "Image generation",
    description: "Charged per call. Supports text-to-image and image-to-image modes.",
    unitLabel: "/call",
    headers: ["Model", "Modes", "Credits / call"],
    models: getModelHubModels("image"),
  },
  {
    title: "Video generation",
    description:
      "Charged per second of generated output. Supports text-to-video and image-to-video modes.",
    unitLabel: "/sec",
    headers: ["Model", "Modes", "Credits / sec"],
    models: getModelHubModels("video"),
  },
  {
    title: "Music generation",
    description: "Charged per second of generated audio.",
    unitLabel: "/sec",
    headers: ["Model", "Modes", "Credits / sec"],
    models: getModelHubModels("music"),
  },
  {
    title: "Audio generation",
    description: "Charged per successful generated output from text, audio, or image input.",
    unitLabel: "/call",
    headers: ["Model", "Modes", "Credits / call"],
    models: getModelHubModels("audio"),
  },
];

export const pricingActionRows = [
  { action: "Image Read", unit: "per request", credits: 5 },
  { action: "Video Read", unit: "per request", credits: 10 },
  { action: "Audio Read", unit: "per request", credits: 10 },
  { action: "Web Search", unit: "per request", credits: 1 },
  { action: "Web Search (AI Grounded)", unit: "per request", credits: 5 },
  { action: "Web Crawl", unit: "per request", credits: 1 },
] as const;

export type AgentCoreCapabilityGroupId =
  | "create"
  | "understand"
  | "search"
  | "manage"
  | "deliver";

export const agentCoreCapabilityPresentation: Record<
  AgentCoreCapabilityGroupId,
  { href: string; summary: string }
> = {
  create: {
    href: "/capabilities",
    summary: "Explore image, video, music, and audio creation",
  },
  understand: {
    href: "/capabilities/image-understanding",
    summary: "Explore image, video, and audio understanding",
  },
  search: {
    href: "/capabilities/web-search",
    summary: "Explore search, grounded answers, and web crawling",
  },
  manage: {
    href: "/capabilities/drive",
    summary: "Explore storage and shareable output URLs",
  },
  deliver: {
    href: "/capabilities",
    summary: "Explore publishing and finished-page delivery",
  },
};

export const homeCapabilityMarqueeItems = [
  {
    label: "Build a launch campaign",
    href: "/capabilities",
    icon: "campaign",
  },
  {
    label: "Turn product shots into video",
    href: "/capabilities/video-generation",
    icon: "video",
  },
  {
    label: "Generate campaign visuals",
    href: "/capabilities/image-generation",
    icon: "image",
  },
  {
    label: "Edit footage with a prompt",
    href: "/models/gemini-omni-flash-preview",
    icon: "edit",
  },
  {
    label: "Create an original soundtrack",
    href: "/capabilities/music-generation",
    icon: "music",
  },
  {
    label: "Read screenshots and diagrams",
    href: "/capabilities/image-understanding",
    icon: "vision",
  },
  {
    label: "Review a screen recording",
    href: "/capabilities/video-analysis",
    icon: "review",
  },
  {
    label: "Transcribe customer interviews",
    href: "/capabilities/audio-understanding",
    icon: "audio",
  },
  {
    label: "Research a market with citations",
    href: "/capabilities/grounded-web-search",
    icon: "research",
  },
  {
    label: "Crawl a competitor site",
    href: "/capabilities/web-crawl",
    icon: "crawl",
  },
  {
    label: "Store and share every output",
    href: "/capabilities/drive",
    icon: "drive",
  },
  {
    label: "Publish a finished page",
    href: "/capabilities",
    icon: "publish",
  },
] as const;

type AgentGapCopy = Record<AgentCapabilityGapAgent, string>;

type GapCatalogEntry = {
  capability: string;
  agentGap: AgentGapCopy;
  anycapValue: string;
  nextStepLabel: string;
  nextStepHref: string;
  includeInPricingSummary?: boolean;
  agentCoreGroup?: Exclude<AgentCoreCapabilityGroupId, "create">;
};

const pricingCapabilityGapCatalog: GapCatalogEntry[] = [
  {
    capability: "Image generation",
    agentGap: {
      "claude-code": "No image output from terminal",
      cursor: "No image output from workspace flow",
      codex: "No image output from sandbox",
      manus: "General-purpose workflow",
    },
    anycapValue: "Generate visuals and mockups via anycap image generate",
    nextStepLabel: "Image Generation page",
    nextStepHref: "/capabilities/image-generation",
  },
  {
    capability: "Video generation",
    agentGap: {
      "claude-code": "No video tooling in CLI workflow",
      cursor: "No video tooling in editor loop",
      codex: "No video tooling in terminal loop",
      manus: "Task-by-task setup",
    },
    anycapValue: "Create walkthroughs and clips via anycap video generate",
    nextStepLabel: "Video Generation page",
    nextStepHref: "/capabilities/video-generation",
  },
  {
    capability: "Music generation",
    agentGap: {
      "claude-code": "No music generation in CLI workflow",
      cursor: "No music generation in editor loop",
      codex: "No music generation in terminal loop",
      manus: "Task-by-task provider setup",
    },
    anycapValue: "Create background tracks through the AnyCap music runtime",
    nextStepLabel: "Music Generation page",
    nextStepHref: "/capabilities/music-generation",
  },
  {
    capability: "Image understanding",
    agentGap: {
      "claude-code": "No unified vision runtime",
      cursor: "No unified vision runtime",
      codex: "No unified vision runtime",
      manus: "Ad hoc visual reasoning",
    },
    anycapValue: "Read screenshots, diagrams, and visual references",
    nextStepLabel: "Image Understanding page",
    nextStepHref: "/capabilities/image-understanding",
    agentCoreGroup: "understand",
  },
  {
    capability: "Video analysis",
    agentGap: {
      "claude-code": "Requires separate provider setup",
      cursor: "Requires separate provider setup",
      codex: "Requires separate provider per task",
      manus: "Ad hoc review workflow",
    },
    anycapValue: "Inspect recordings from the same CLI",
    nextStepLabel: "Video Analysis page",
    nextStepHref: "/capabilities/video-analysis",
    agentCoreGroup: "understand",
  },
  {
    capability: "Audio understanding",
    agentGap: {
      "claude-code": "No unified audio analysis runtime",
      cursor: "No unified audio analysis runtime",
      codex: "No unified audio analysis runtime",
      manus: "Ad hoc audio review",
    },
    anycapValue: "Transcribe and analyze audio through one runtime",
    nextStepLabel: "Audio Understanding page",
    nextStepHref: "/capabilities/audio-understanding",
    agentCoreGroup: "understand",
  },
  {
    capability: "Web search",
    agentGap: {
      "claude-code": "Search depends on external tooling",
      cursor: "Search depends on external tooling",
      codex: "Search depends on external tooling",
      manus: "Search behavior varies by task",
    },
    anycapValue: "Search the web from the same capability layer",
    nextStepLabel: "Web Search page",
    nextStepHref: "/capabilities/web-search",
    agentCoreGroup: "search",
  },
  {
    capability: "Grounded web search",
    agentGap: {
      "claude-code": "No grounded search flow in task loop",
      cursor: "No grounded search flow in editor loop",
      codex: "No grounded search flow in terminal loop",
      manus: "Grounded search varies by task",
    },
    anycapValue: "Run grounded search when the answer needs citations",
    nextStepLabel: "Grounded Web Search page",
    nextStepHref: "/capabilities/grounded-web-search",
    agentCoreGroup: "search",
  },
  {
    capability: "Web crawl",
    agentGap: {
      "claude-code": "No reusable crawl runtime",
      cursor: "No reusable crawl runtime",
      codex: "No reusable crawl runtime",
      manus: "Crawl setup varies by task",
    },
    anycapValue: "Crawl pages and extract content from one CLI",
    nextStepLabel: "Web Crawl page",
    nextStepHref: "/capabilities/web-crawl",
    agentCoreGroup: "search",
  },
  {
    capability: "Drive storage",
    agentGap: {
      "claude-code": "No shared asset storage layer",
      cursor: "No shared asset storage layer",
      codex: "No shared asset storage layer",
      manus: "Asset storage depends on each workflow",
    },
    anycapValue: "Store outputs with public URLs in AnyCap Drive",
    nextStepLabel: "Pricing page",
    nextStepHref: "/pricing",
    includeInPricingSummary: false,
    agentCoreGroup: "manage",
  },
  {
    capability: "Page hosting",
    agentGap: {
      "claude-code": "No built-in page publishing surface",
      cursor: "No built-in page publishing surface",
      codex: "No built-in page publishing surface",
      manus: "Publishing setup varies by task",
    },
    anycapValue: "Publish simple pages through AnyCap Page",
    nextStepLabel: "Pricing page",
    nextStepHref: "/pricing",
    includeInPricingSummary: false,
    agentCoreGroup: "deliver",
  },
  {
    capability: "One auth flow",
    agentGap: {
      "claude-code": "Per-provider credential management",
      cursor: "Per-provider credential management",
      codex: "Fresh credential setup per sandbox",
      manus: "Capability access varies by task",
    },
    anycapValue: "One login across the capability stack",
    nextStepLabel: "Get Started page",
    nextStepHref: "/start",
    includeInPricingSummary: false,
  },
];

export const pricingCapabilitySummary = pricingCapabilityGapCatalog
  .filter((entry) => entry.includeInPricingSummary !== false)
  .map((entry) => entry.capability);

export const agentCoreCapabilityGroups = [
  {
    id: "create",
    capabilities: pricingGenerationGroups.map((group) => group.title),
  },
  ...(["understand", "search", "manage", "deliver"] as const).map((id) => ({
    id,
    capabilities: pricingCapabilityGapCatalog
      .filter((entry) => entry.agentCoreGroup === id)
      .map((entry) => entry.capability),
  })),
] as const;

export function buildAgentCapabilityGapRows(
  agent: AgentCapabilityGapAgent,
): CapabilityGapRow[] {
  return pricingCapabilityGapCatalog.map((entry) => ({
    capability: entry.capability,
    cells: [
      { label: entry.agentGap[agent], tone: "muted" },
      { label: entry.anycapValue, tone: "accent" },
      { label: entry.nextStepLabel, href: entry.nextStepHref },
    ],
  }));
}
