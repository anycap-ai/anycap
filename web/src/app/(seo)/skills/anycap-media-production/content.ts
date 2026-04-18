import type { Metadata } from "next";
import { getLocalizedRouteUrl, getLocaleConfig, siteConfig, type SiteLocale } from "@/lib/site";

export const SKILL_PATH = "/skills/anycap-media-production";
const GITHUB_URL = "https://github.com/anycap-ai/anycap/tree/main/skills/anycap-media-production";
const DATE_PUBLISHED = "2026-04-18";

export type SkillDetailPageData = {
  metadata: {
    title: string;
    description: string;
    openGraphTitle: string;
    openGraphDescription: string;
  };
  breadcrumbItems: readonly { name: string; href: string }[];
  eyebrow: string;
  heroTitle: [string, string];
  intro: string;
  trustSignals: readonly { label: string; value: string }[];
  definitionJsonLd: Record<string, unknown>;
  howToJsonLd: Record<string, unknown>;
  faqJsonLd: Record<string, unknown>;
  installTitle: string;
  installCode: string;
  githubUrl: string;
  workflowTitle: string;
  workflowBefore: string;
  workflowAfter: string;
  workflowSteps: readonly { label: string; detail: string }[];
  sampleOutput: string;
  comparisonTable?: {
    title: string;
    rows: readonly { label: string; without: string; with: string }[];
  };
  capabilitiesTitle: string;
  capabilities: readonly { name: string; href: string; summary: string }[];
  agentsTitle: string;
  agents: readonly { name: string; href: string | null }[];
  faqTitle: string;
  faqs: readonly { question: string; answer: string }[];
  relatedLinks: readonly { label: string; href: string; variant: "primary" | "secondary" }[];
};

const contentEn: SkillDetailPageData = {
  metadata: {
    title: "anycap-media-production skill | Full media production for AI agents",
    description:
      "Install anycap-media-production to give Claude Code, Cursor, and Codex a full media production workflow: iterative image and video generation, AI-powered refinement, and structured human annotation feedback loops.",
    openGraphTitle: "anycap-media-production skill | Full media production for AI agents",
    openGraphDescription:
      "Full media production workflow skill for Claude Code and Cursor. Covers iterative generation, refinement, and human annotation feedback loops for images, videos, and music.",
  },
  breadcrumbItems: [
    { name: "Home", href: "/" },
    { name: "Skills", href: "/skills" },
    { name: "anycap-media-production", href: SKILL_PATH },
  ],
  eyebrow: "Skills",
  heroTitle: ["Full media production workflow", "for Claude Code, Cursor, and Codex"],
  intro:
    "anycap-media-production is an installable skill that extends Claude Code, Cursor, Codex, and similar coding agents with a structured media production workflow. It covers iterative image generation, video generation, AI-driven refinement, and human annotation feedback loops so the agent can move from a rough visual brief to a polished output without leaving the coding environment. The skill teaches the agent when to call AnyCap for generation, when to request a refinement pass, and how to collect structured feedback from a human reviewer before continuing. This is useful for teams building media-heavy products, content pipelines, or any automated creative workflow where iteration quality and review checkpoints matter. The install path works through skills.sh, the AnyCap CLI, or manual placement. Once installed, the agent treats media production as a first-class workflow step rather than an ad-hoc prompt experiment. It knows the right command flags, understands the refinement loop structure, and can integrate human feedback before committing a final asset.",
  trustSignals: [
    { label: "Install time", value: "< 5 min" },
    { label: "Supported agents", value: "Claude Code · Cursor · Codex" },
    { label: "Platform", value: "macOS · Linux · Windows" },
  ],
  definitionJsonLd: {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "anycap-media-production",
    applicationCategory: "DeveloperApplication",
    description:
      "An installable AI agent skill that covers full media production workflows: iterative image and video generation, AI-powered refinement, and structured human annotation feedback loops.",
    url: getLocalizedRouteUrl(siteConfig.defaultLocale, SKILL_PATH),
    operatingSystem: "Any",
    datePublished: DATE_PUBLISHED,
    dateModified: DATE_PUBLISHED,
  },
  howToJsonLd: {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to install and use anycap-media-production",
    description: "Add a full iterative media production workflow to Claude Code, Cursor, or Codex.",
    totalTime: "PT5M",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Install the skill",
        text: "Run: npx -y skills add anycap-ai/anycap -s 'anycap-media-production' -g -y",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "Start a new agent session",
        text: "The skill is auto-detected at session start. No additional configuration needed.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "Ask the agent to produce a visual asset",
        text: "The agent will generate a base image or video, review it using AnyCap image read, and iterate with refined prompts until the output meets the brief.",
      },
    ],
  },
  faqJsonLd: {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What does anycap-media-production do that direct prompting doesn't?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Direct prompting gives you one-shot generation. anycap-media-production teaches the agent to run a full loop: generate a base asset, review it with AnyCap image understanding, refine the prompt based on the analysis, and repeat until the output meets the brief — all without manual back-and-forth.",
        },
      },
      {
        "@type": "Question",
        name: "Can this skill generate video as well as images?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. The skill covers image generation, video generation, and iterative refinement for both. It also supports music generation as part of a broader media production run.",
        },
      },
      {
        "@type": "Question",
        name: "Which agents support anycap-media-production?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Claude Code, Cursor, and Codex are fully supported. Any agent that reads skill files from the local filesystem will also work.",
        },
      },
      {
        "@type": "Question",
        name: "Do I need an AnyCap account to use this skill?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. The skill uses the AnyCap CLI as its execution layer. You need an AnyCap account and the CLI installed. Run `anycap login` after installing the CLI.",
        },
      },
    ],
  },
  installTitle: "Install this skill",
  installCode: "npx -y skills add anycap-ai/anycap -s 'anycap-media-production' -g -y",
  githubUrl: GITHUB_URL,
  workflowTitle: "How the workflow changes after install",
  workflowBefore:
    "Agent generates one image per prompt. No review loop. No refinement. Human must re-prompt manually to iterate.",
  workflowAfter:
    "Agent generates, reviews with AnyCap image read, refines prompt, regenerates — and repeats until the brief is met. Human feedback can be injected at any checkpoint.",
  workflowSteps: [
    {
      label: "Receive brief",
      detail: "User describes the visual goal — style, subject, format, intended platform.",
    },
    {
      label: "Generate base asset",
      detail: "Agent calls `anycap image generate` or `anycap video generate` with an initial prompt derived from the brief.",
    },
    {
      label: "Review output",
      detail: "Agent calls `anycap image read` to analyze the generated asset against the brief criteria.",
    },
    {
      label: "Refine and regenerate",
      detail: "If the review identifies gaps, agent adjusts the prompt and generates again. Continues until quality criteria are met.",
    },
    {
      label: "Human checkpoint (optional)",
      detail: "If human annotation is configured, agent pauses and requests sign-off before delivering the final asset.",
    },
  ],
  sampleOutput:
`$ anycap image generate "product hero, dark minimal, no text"
✓ Generated: hero-v1.png (1920×1080)
[Agent] Reviewing output against brief...
→ Gap: composition too centered, shadow too heavy
[Agent] Refining prompt and regenerating...
✓ Refined: hero-v2.png
✓ Committed: hero-v2.png → ./output/`,
  capabilitiesTitle: "Capabilities used by this skill",
  capabilities: [
    {
      name: "Image Generation",
      href: "/capabilities/image-generation",
      summary: "Generate and iteratively refine images through the AnyCap runtime.",
    },
    {
      name: "Video Generation",
      href: "/capabilities/video-generation",
      summary: "Generate videos as part of a structured production loop.",
    },
    {
      name: "Image Understanding",
      href: "/capabilities/image-understanding",
      summary: "Read and analyze generated outputs to inform the next refinement step.",
    },
  ],
  agentsTitle: "Supported agents",
  agents: [
    { name: "Claude Code", href: "/for/claude-code" },
    { name: "Cursor", href: "/for/cursor" },
    { name: "Codex", href: "/for/codex" },
  ],
  faqTitle: "Frequently asked questions",
  faqs: [
    {
      question: "What does anycap-media-production do that direct prompting doesn't?",
      answer:
        "Direct prompting gives you one-shot generation. This skill teaches the agent to run a full review-refine loop: generate, analyze the output with AnyCap image understanding, adjust the prompt, and regenerate — repeating until the brief is met.",
    },
    {
      question: "Can this skill generate video as well as images?",
      answer:
        "Yes. The skill covers image generation, video generation, and iterative refinement for both asset types.",
    },
    {
      question: "Do I need an AnyCap account?",
      answer:
        "Yes. The skill uses the AnyCap CLI as its execution layer. Install the CLI and run `anycap login` before your first session.",
    },
    {
      question: "How is this different from MCP?",
      answer:
        "MCP is a protocol that describes how agents communicate with tools. This skill is an instruction file that tells the agent how to use AnyCap's specific commands, flags, and workflow patterns. You can use both together.",
    },
  ],
  relatedLinks: [
    { label: "View all skills", href: "/skills", variant: "primary" },
    { label: "Image Generation", href: "/capabilities/image-generation", variant: "secondary" },
    { label: "Video Generation", href: "/capabilities/video-generation", variant: "secondary" },
    { label: "Install AnyCap", href: "/guides/install-anycap", variant: "secondary" },
  ],
};

export function getSkillMetadata(locale: SiteLocale): Metadata {
  const content = contentEn;
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

export function getSkillPageData(_locale: SiteLocale): SkillDetailPageData {
  return contentEn;
}
