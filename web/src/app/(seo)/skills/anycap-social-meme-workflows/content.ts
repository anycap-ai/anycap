import type { Metadata } from "next";
import { getLocalizedRouteUrl, getLocaleConfig, siteConfig, type SiteLocale } from "@/lib/site";
import type { SkillDetailPageData } from "../anycap-media-production/content";

export { type SkillDetailPageData };
export const SKILL_PATH = "/skills/anycap-social-meme-workflows";
const GITHUB_URL = "https://github.com/anycap-ai/anycap/tree/main/skills/anycap-social-meme-workflows";
const DATE_PUBLISHED = "2026-04-18";

const contentEn: SkillDetailPageData = {
  metadata: {
    title: "Social & Meme Visual Workflow Skill | AnyCap",
    description:
      "Create memes, captioned photos, and platform-sized social visuals with Claude Code and Cursor. AI generation plus local text overlay in one run.",
    openGraphTitle: "anycap-social-meme-workflows — Social image creation for Claude Code",
    openGraphDescription:
      "Social image and meme creation for Claude Code and Cursor. AI generation plus local text overlay for platform-sized social content batches.",
  },
  breadcrumbItems: [
    { name: "Home", href: "/" },
    { name: "Skills", href: "/skills" },
    { name: "anycap-social-meme-workflows", href: SKILL_PATH },
  ],
  eyebrow: "Skills",
  heroTitle: ["Social image and meme creation", "for Claude Code and Cursor"],
  intro:
    "anycap-social-meme-workflows is an installable skill that teaches Claude Code, Cursor, Codex, and similar coding agents how to produce meme-style images, captioned photos, and social visuals as part of an automated content workflow. Without this skill, an agent tasked with creating social content cannot efficiently combine AI image generation with structured text overlay, does not know the right prompt patterns for meme formats, and cannot batch-produce visual variations for A/B testing across platforms. With the skill installed, the agent uses AnyCap image generation to create a base visual, then applies local text overlay to produce the captioned or annotated format typical of viral social content. The workflow supports single-image production, variation batches, and format-specific output sizing for platforms such as Twitter/X, Instagram, and LinkedIn. This skill is useful for social media teams, content marketers, developer advocates, and any team running automated content pipelines where visual assets need to be produced at volume without manual design tools. The skill is compatible with Claude Code, Cursor, and Codex.",
  trustSignals: [
    { label: "Install time", value: "< 5 min" },
    { label: "Supported agents", value: "Claude Code · Cursor · Codex" },
    { label: "Platform", value: "macOS · Linux · Windows" },
  ],
  definitionJsonLd: {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "anycap-social-meme-workflows",
    applicationCategory: "DeveloperApplication",
    description:
      "An installable AI agent skill for creating meme-style images, captioned photos, and social visuals by combining AI image generation with local text overlay for viral social content workflows.",
    url: getLocalizedRouteUrl(siteConfig.defaultLocale, SKILL_PATH),
    operatingSystem: "Any",
    datePublished: DATE_PUBLISHED,
    dateModified: DATE_PUBLISHED,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  },
  howToJsonLd: {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to install and use anycap-social-meme-workflows",
    description: "Add meme and social image creation to Claude Code or Cursor.",
    totalTime: "PT5M",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Install the skill",
        text: "Run: npx -y skills add anycap-ai/anycap -s 'anycap-social-meme-workflows' -g -y",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "Start a new agent session",
        text: "The skill is auto-detected at session start. Ensure the AnyCap CLI is authenticated.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "Provide a topic or source image",
        text: "Give the agent a theme, meme concept, or source image. It will generate the base visual, apply text overlay, and output platform-specific sizes.",
      },
    ],
  },
  faqJsonLd: {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What does anycap-social-meme-workflows do that direct prompting doesn't?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Direct prompting gives you one image at a time with no format awareness. This skill teaches the agent to generate a base visual, apply structured text overlay in meme format, produce variation batches for A/B testing, and size outputs for specific social platforms — all in one automated run.",
        },
      },
      {
        "@type": "Question",
        name: "Which social platforms does it support?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The skill outputs images sized for Twitter/X, Instagram (square and story), and LinkedIn by default. You can specify custom dimensions in the brief.",
        },
      },
      {
        "@type": "Question",
        name: "Can I use my own source image?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. You can provide a source image and the agent will apply text overlay and styling on top of it. Or you can give a text description and the agent will generate the base image first.",
        },
      },
      {
        "@type": "Question",
        name: "Do I need an AnyCap account?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Install the CLI and run `anycap login` before your first session.",
        },
      },
    ],
  },
  installTitle: "Install this skill",
  installCode: "npx -y skills add anycap-ai/anycap -s 'anycap-social-meme-workflows' -g -y",
  githubUrl: GITHUB_URL,
  workflowTitle: "How the workflow changes after install",
  workflowBefore:
    "Agent generates one image at a time with no format awareness or text overlay. Human must use a separate design tool to add captions or resize for platforms.",
  workflowAfter:
    "Agent generates a base visual, applies structured text overlay in meme format, produces platform-specific sizes, and can batch variations for A/B testing — all in one run.",
  workflowSteps: [
    {
      label: "Receive theme or source image",
      detail: "User provides a meme concept, caption idea, topic, or an existing image to restyle.",
    },
    {
      label: "Generate base visual",
      detail: "Agent calls `anycap image generate` with a prompt optimized for the meme format — composition, style, and focal point aligned with the caption placement.",
    },
    {
      label: "Apply text overlay",
      detail: "Agent applies the caption text in the standard meme format using local text overlay tools. Font, size, and placement follow platform conventions.",
    },
    {
      label: "Produce platform sizes",
      detail: "Agent resizes and crops the output for Twitter/X (1200×675), Instagram square (1080×1080), Instagram story (1080×1920), and LinkedIn (1200×627).",
    },
    {
      label: "Generate variation batch (optional)",
      detail: "Agent produces 3–5 caption variations on the same base image for A/B testing across posts.",
    },
  ],
  sampleOutput:
`Meme batch complete: "launch day announcement"
├── Base image: generated (1600×900, AI)
├── Caption variants: 4
└── Platform exports:
    ├── twitter-x.png        1200×675
    ├── instagram-square.png 1080×1080
    ├── instagram-story.png  1080×1920
    └── linkedin.png         1200×627`,
  capabilitiesTitle: "Capabilities used by this skill",
  capabilities: [
    {
      name: "Image Generation",
      href: "/capabilities/image-generation",
      summary: "Generate base visuals for meme formats and social image templates.",
    },
    {
      name: "Image Understanding",
      href: "/capabilities/image-understanding",
      summary: "Analyze existing images to inform caption placement and visual style matching.",
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
      question: "What does this skill do that direct prompting doesn't?",
      answer:
        "Direct prompting gives one image with no format or text overlay awareness. This skill adds structured caption overlay, platform-specific sizing, and variation batching — turning Claude into a social content production pipeline.",
    },
    {
      question: "Which social platforms does it support?",
      answer:
        "Twitter/X, Instagram (square and story), and LinkedIn by default. Custom dimensions can be specified in the brief.",
    },
    {
      question: "Can I use my own source image?",
      answer:
        "Yes. Provide a source image and the agent applies text overlay and styling on top. Or give a description and the agent generates the base image first.",
    },
    {
      question: "Do I need an AnyCap account?",
      answer: "Yes. Install the CLI and run `anycap login` before your first session.",
    },
  ],
  relatedLinks: [
    { label: "View all skills", href: "/skills", variant: "primary" },
    { label: "Image Generation", href: "/capabilities/image-generation", variant: "secondary" },
    { label: "Claude Code", href: "/for/claude-code", variant: "secondary" },
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
