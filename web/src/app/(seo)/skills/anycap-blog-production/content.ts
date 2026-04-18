import type { Metadata } from "next";
import { getLocalizedRouteUrl, getLocaleConfig, siteConfig, type SiteLocale } from "@/lib/site";
import type { SkillDetailPageData } from "../anycap-media-production/content";

export { type SkillDetailPageData };
export const SKILL_PATH = "/skills/anycap-blog-production";
const GITHUB_URL = "https://github.com/anycap-ai/anycap/tree/main/skills/anycap-blog-production";
const DATE_PUBLISHED = "2026-04-18";

const contentEn: SkillDetailPageData = {
  metadata: {
    title: "anycap-blog-production skill | Blog post generation for AI coding agents",
    description:
      "Install anycap-blog-production to let Claude Code and Cursor turn notes, research, and product facts into structured blog posts with first-party evidence blocks, web-sourced data, and consistent editorial voice.",
    openGraphTitle: "anycap-blog-production skill | Blog generation for Claude Code",
    openGraphDescription:
      "Blog post production workflow skill for Claude Code and Cursor. Turns notes and research into structured posts with first-party evidence and editorial voice.",
  },
  breadcrumbItems: [
    { name: "Home", href: "/" },
    { name: "Skills", href: "/skills" },
    { name: "anycap-blog-production", href: SKILL_PATH },
  ],
  eyebrow: "Skills",
  heroTitle: ["Structured blog post production", "from agent notes to editorial voice"],
  intro:
    "anycap-blog-production is an installable skill that teaches Claude Code, Cursor, Codex, and similar coding agents how to produce structured, publication-ready blog posts from raw input. Without this skill, an agent generating a blog post cannot look up current statistics, verify product claims against live sources, or maintain a consistent editorial structure across long outputs. With the skill installed, the agent gains access to a production workflow that starts from user-provided notes or briefs, enriches them with web search and web crawl data for first-party evidence, and formats the result into structured sections with a consistent AnyCap editorial voice. The workflow also supports image generation for featured visuals, making it useful for teams producing content pipelines where both the text and the visual assets need to come out of the same agent session. This is particularly valuable for developer marketing teams, content operations, and any team that wants repeatable blog production quality without manual copy editing after every run. The skill installs through skills.sh or the AnyCap CLI.",
  trustSignals: [
    { label: "Install time", value: "< 5 min" },
    { label: "Supported agents", value: "Claude Code · Cursor · Codex" },
    { label: "Platform", value: "macOS · Linux · Windows" },
  ],
  definitionJsonLd: {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "anycap-blog-production",
    applicationCategory: "DeveloperApplication",
    description:
      "An installable AI agent skill that turns user-provided notes, research, and product facts into structured blog posts with first-party evidence blocks and consistent editorial voice.",
    url: getLocalizedRouteUrl(siteConfig.defaultLocale, SKILL_PATH),
    operatingSystem: "Any",
    datePublished: DATE_PUBLISHED,
    dateModified: DATE_PUBLISHED,
  },
  howToJsonLd: {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to install and use anycap-blog-production",
    description: "Add a structured blog post production workflow to Claude Code or Cursor.",
    totalTime: "PT5M",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Install the skill",
        text: "Run: npx -y skills add anycap-ai/anycap -s 'anycap-blog-production' -g -y",
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
        name: "Provide notes or a brief",
        text: "Give the agent your notes, product facts, or a topic brief. It will search for supporting evidence, structure the post, and output a publication-ready draft with citations.",
      },
    ],
  },
  faqJsonLd: {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What does anycap-blog-production do that direct prompting doesn't?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Direct prompting produces text from training data. This skill teaches the agent to search for current statistics, crawl reference pages for first-party evidence, structure the post in a defined editorial format, and optionally generate a featured image — all in one run.",
        },
      },
      {
        "@type": "Question",
        name: "What blog format does it output?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The skill outputs structured markdown with H2/H3 headings, evidence blocks with citations, and a consistent editorial voice. The format follows AnyCap's blog template but can be adjusted by providing a format spec in the brief.",
        },
      },
      {
        "@type": "Question",
        name: "Can it also generate the featured image?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. The skill includes an optional image generation step for featured visuals and in-post images using AnyCap image generation.",
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
  installCode: "npx -y skills add anycap-ai/anycap -s 'anycap-blog-production' -g -y",
  githubUrl: GITHUB_URL,
  workflowTitle: "How the workflow changes after install",
  workflowBefore:
    "Agent writes a blog post from training data alone. No live sources, no citations, no consistent structure. Output quality varies per run.",
  workflowAfter:
    "Agent starts from your notes, searches for current evidence, structures the post in a defined editorial format, and delivers a publication-ready draft with citations.",
  workflowSteps: [
    {
      label: "Receive brief",
      detail: "User provides notes, a topic, product facts, or a rough outline. Brief quality directly affects output quality — a paragraph of context produces a significantly better post than a single topic phrase. Include target audience, publication, and tone guidelines where available.",
    },
    {
      label: "Gather live evidence",
      detail: "Agent calls `anycap web search` to find current statistics, recent publications, and reference sources that support the post's claims. The skill runs 3–5 targeted queries covering different evidence angles — statistics, case studies, and expert opinions — to avoid building the post on a single narrow source.",
    },
    {
      label: "Crawl reference pages",
      detail: "Agent calls `anycap web crawl` on the 2–4 most authoritative reference URLs to pull full article content. This step surfaces specific numbers, methodology details, and quotable passages that live inside articles but never appear in search snippets.",
    },
    {
      label: "Structure the post",
      detail: "Agent assembles content into H2/H3 sections following AnyCap's editorial template: intro with hook, 3–5 body sections with evidence blocks, and a conclusion with CTA. Each claim is attributed to a crawled source. The post ships as structured Markdown, ready for CMS import or review.",
    },
    {
      label: "Generate featured image (optional)",
      detail: "If configured, agent calls `anycap image generate` to produce a featured visual aligned with the post topic, with dimensions pre-set for the target publication — 1200×630 for blog header, 1200×675 for social sharing preview.",
    },
  ],
  sampleOutput:
`Blog post complete: "Why AI agents need structured memory"
├── Evidence gathered: 5 sources (live, 2026-04-18)
├── Word count: 1,920
├── Citations: 5 inline
├── Sections: intro + 4 body + conclusion
└── Featured image: blog-hero.png (1200×630)`,
  capabilitiesTitle: "Capabilities used by this skill",
  capabilities: [
    {
      name: "Web Search",
      href: "/capabilities/web-search",
      summary: "Look up current data and statistics to ground blog claims in live sources.",
    },
    {
      name: "Web Crawl",
      href: "/capabilities/web-crawl",
      summary: "Pull full content from reference pages for deeper evidence blocks.",
    },
    {
      name: "Image Generation",
      href: "/capabilities/image-generation",
      summary: "Generate featured images and in-post visuals as part of the production run.",
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
        "Direct prompting writes from training data. This skill adds live evidence gathering, consistent editorial structure, and optional image generation — turning Claude into a repeatable content production pipeline.",
    },
    {
      question: "What format does the output use?",
      answer:
        "Structured markdown with H2/H3 headings, evidence blocks with citations, and a consistent editorial voice. You can provide a custom format spec in the brief.",
    },
    {
      question: "Can it generate the featured image too?",
      answer:
        "Yes. The skill includes an optional image generation step using AnyCap image generation.",
    },
    {
      question: "Do I need an AnyCap account?",
      answer: "Yes. Install the CLI and run `anycap login` before your first session.",
    },
  ],
  relatedLinks: [
    { label: "View all skills", href: "/skills", variant: "primary" },
    { label: "Web Search", href: "/capabilities/web-search", variant: "secondary" },
    { label: "Image Generation", href: "/capabilities/image-generation", variant: "secondary" },
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
