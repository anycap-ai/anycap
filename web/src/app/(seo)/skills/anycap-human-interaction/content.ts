import type { Metadata } from "next";
import { getLocalizedRouteUrl, getLocaleConfig, siteConfig, type SiteLocale } from "@/lib/site";
import type { SkillDetailPageData } from "../anycap-media-production/content";

export { type SkillDetailPageData };
export const SKILL_PATH = "/skills/anycap-human-interaction";
const GITHUB_URL = "https://github.com/anycap-ai/anycap/tree/main/skills/anycap-human-interaction";
const DATE_PUBLISHED = "2026-04-18";

const contentEn: SkillDetailPageData = {
  metadata: {
    title: "Human Interaction & Feedback Skill | AnyCap",
    description:
      "Let Claude Code and Cursor collect structured visual feedback: image annotation, screen recording, video review, and interactive Excalidraw diagramming.",
    openGraphTitle: "anycap-human-interaction — Visual feedback for Claude Code",
    openGraphDescription:
      "Collect structured visual feedback from humans inside your agent session. Image annotation, screen recording, video review, and Excalidraw diagramming.",
  },
  breadcrumbItems: [
    { name: "Home", href: "/" },
    { name: "Skills", href: "/skills" },
    { name: "anycap-human-interaction", href: SKILL_PATH },
  ],
  eyebrow: "Skills",
  heroTitle: ["Collect structured visual feedback from humans", "directly inside your agent session"],
  intro:
    "anycap-human-interaction is an installable skill that teaches Claude Code, Cursor, Codex, and similar coding agents how to bring humans into a running workflow for visual review and feedback. Without this skill, agents must rely on text descriptions alone when a task requires a human to annotate an image, review a screen recording, examine a video output, or sketch a diagram. With the skill installed, the agent knows how to invoke AnyCap's capture and annotation capabilities at the right moment and how to incorporate the resulting structured feedback into the next step. The skill covers image annotation workflows, screen and audio recording, video review checkpoints, and interactive Excalidraw diagramming sessions. This is particularly useful for design review loops, UX testing pipelines, and any workflow where visual sign-off is a required gate before the agent continues. The install path works through skills.sh or the AnyCap CLI and is compatible with Claude Code, Cursor, and Codex.",
  trustSignals: [
    { label: "Install time", value: "< 5 min" },
    { label: "Supported agents", value: "Claude Code · Cursor · Codex" },
    { label: "Platform", value: "macOS · Linux · Windows" },
  ],
  definitionJsonLd: {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "anycap-human-interaction",
    applicationCategory: "DeveloperApplication",
    description:
      "An installable AI agent skill that teaches coding agents how to collect structured visual feedback from humans via image annotation, screen recording, video review, and audio capture.",
    url: getLocalizedRouteUrl("en", SKILL_PATH),
    operatingSystem: "Any",
    datePublished: DATE_PUBLISHED,
    dateModified: DATE_PUBLISHED,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  },
  howToJsonLd: {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to install and use anycap-human-interaction",
    description: "Add structured human visual feedback collection to Claude Code, Cursor, or Codex.",
    totalTime: "PT5M",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Install the skill",
        text: "Run: npx -y skills add anycap-ai/anycap -s 'anycap-human-interaction' -g -y",
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
        name: "Trigger a human review checkpoint",
        text: "When the agent reaches a step requiring human judgment, it captures the screen or uploads the asset, presents it for annotation, reads the structured feedback, and continues.",
      },
    ],
  },
  faqJsonLd: {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What does anycap-human-interaction do that direct prompting doesn't?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Direct prompting can't pause a workflow for a human to annotate a specific image or sketch a diagram and pass that back to the agent as structured data. This skill teaches the agent exactly when and how to invoke visual capture and feedback collection, and how to parse the result.",
        },
      },
      {
        "@type": "Question",
        name: "Does this skill require a separate annotation tool?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. The annotation and capture interface is provided through AnyCap. The agent opens the review session; the human interacts directly in the AnyCap interface.",
        },
      },
      {
        "@type": "Question",
        name: "Which agents support anycap-human-interaction?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Claude Code, Cursor, and Codex are fully supported.",
        },
      },
      {
        "@type": "Question",
        name: "Do I need an AnyCap account to use this skill?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Install the AnyCap CLI and run `anycap login` before your first session.",
        },
      },
    ],
  },
  installTitle: "Install this skill",
  installCode: "npx -y skills add anycap-ai/anycap -s 'anycap-human-interaction' -g -y",
  githubUrl: GITHUB_URL,
  workflowTitle: "How the workflow changes after install",
  workflowBefore:
    "Agent can only ask for feedback in text. Human must describe what they see and hope the agent interprets it correctly.",
  workflowAfter:
    "Agent pauses at a defined checkpoint, captures the visual, and presents it for structured annotation. Human marks up the image directly. Agent reads the annotation as structured data and continues.",
  workflowSteps: [
    {
      label: "Reach review checkpoint",
      detail: "Agent identifies a step that requires human visual judgment — a design, screenshot, or generated output.",
    },
    {
      label: "Capture or upload visual",
      detail: "Agent uses AnyCap to capture the current screen or upload the relevant image/video for review.",
    },
    {
      label: "Human annotates",
      detail: "Human opens the AnyCap review interface, marks up the visual, adds comments, or sketches revisions in Excalidraw.",
    },
    {
      label: "Agent reads feedback",
      detail: "Agent uses AnyCap image read or video analysis to parse the annotated output as structured data.",
    },
    {
      label: "Continue workflow",
      detail: "Agent incorporates the feedback into the next step — revising the design, adjusting code, or updating the brief.",
    },
  ],
  sampleOutput:
`[Agent] Capturing screen for human review...
→ Review URL: https://anycap.ai/review/r_abc123
[Human] Annotated 3 points on screenshot:
  1. "Move CTA above fold"
  2. "Reduce padding on mobile"
  3. "Change button color to #6b7d3a"
[Agent] Parsed 3 structured annotations. Applying changes...`,
  capabilitiesTitle: "Capabilities used by this skill",
  capabilities: [
    {
      name: "Image Understanding",
      href: "/capabilities/image-understanding",
      summary: "Read and parse annotated images returned by human reviewers.",
    },
    {
      name: "Video Analysis",
      href: "/capabilities/video-analysis",
      summary: "Analyze screen recordings and video feedback from human reviewers.",
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
        "Direct prompting can't pause a workflow for a human to annotate a specific image and return that as structured data. This skill teaches the agent exactly when and how to invoke visual capture and how to parse the annotation result.",
    },
    {
      question: "Does this skill require a separate annotation tool?",
      answer:
        "No. The annotation interface is built into AnyCap. The agent opens the session; the human reviews directly in the AnyCap interface.",
    },
    {
      question: "Do I need an AnyCap account?",
      answer: "Yes. Install the AnyCap CLI and run `anycap login` before your first session.",
    },
    {
      question: "How is this different from MCP?",
      answer:
        "MCP is a communication protocol. This skill is an instruction file that tells the agent when to trigger human review checkpoints and how to read the structured output. They serve different layers of the stack.",
    },
  ],
  relatedLinks: [
    { label: "View all skills", href: "/skills", variant: "primary" },
    { label: "Image Understanding", href: "/capabilities/image-understanding", variant: "secondary" },
    { label: "Video Analysis", href: "/capabilities/video-analysis", variant: "secondary" },
    { label: "Install AnyCap", href: "/start", variant: "secondary" },
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
