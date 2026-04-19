import type { Metadata } from "next";
import { getLocalizedRouteUrl, getLocaleConfig, siteConfig, type SiteLocale } from "@/lib/site";
import type { SkillDetailPageData } from "../anycap-media-production/content";

export { type SkillDetailPageData };
export const SKILL_PATH = "/skills/anycap-ai-tool-seo";
const GITHUB_URL = "https://github.com/anycap-ai/anycap/tree/main/skills/anycap-ai-tool-seo";
const DATE_PUBLISHED = "2026-04-18";

const contentEn: SkillDetailPageData = {
  metadata: {
    title: "SEO Audit Skill for AI Tool Sites | AnyCap",
    description:
      "Run live SERP-backed SEO audits for AI tools and SaaS sites with Claude Code and Cursor. Inspect SERPs, crawl competitors, surface keyword gaps.",
    openGraphTitle: "anycap-ai-tool-seo — SEO auditing for AI tool websites",
    openGraphDescription:
      "SEO planning and auditing for Claude Code and Cursor. Live SERP inspection, competitor page crawl, and structured keyword opportunity reports for AI tools.",
  },
  breadcrumbItems: [
    { name: "Home", href: "/" },
    { name: "Skills", href: "/skills" },
    { name: "anycap-ai-tool-seo", href: SKILL_PATH },
  ],
  eyebrow: "Skills",
  heroTitle: ["SEO planning and auditing", "for AI tool and SaaS websites"],
  intro:
    "anycap-ai-tool-seo is an installable skill that gives Claude Code, Cursor, Codex, and similar coding agents a structured SEO workflow for AI tool and SaaS websites. Without this skill, an agent performing an SEO audit cannot inspect live SERPs to understand which page types rank for a given keyword, cannot crawl competitor pages to analyze their on-page structure and content depth, and cannot cross-reference multiple signals to produce a keyword opportunity list grounded in current data. With the skill installed, the agent uses AnyCap web search to retrieve live SERP data for target keywords and web crawl to analyze the full content of ranking competitor pages. It produces structured recommendations for page type alignment, content gap coverage, and internal linking improvements. This skill is particularly useful for developer-focused marketing teams, SEO practitioners who want to run audits inside an agent workflow, and engineering teams building content pipelines that need programmatic SEO analysis. The skill is compatible with Claude Code, Cursor, and Codex.",
  trustSignals: [
    { label: "Install time", value: "< 5 min" },
    { label: "Supported agents", value: "Claude Code · Cursor · Codex" },
    { label: "Platform", value: "macOS · Linux · Windows" },
  ],
  definitionJsonLd: {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "anycap-ai-tool-seo",
    applicationCategory: "DeveloperApplication",
    description:
      "An installable AI agent skill for SEO planning and auditing of AI tool and SaaS websites. Uses web search and crawl to inspect live SERPs, analyze competitor pages, and surface keyword opportunities.",
    url: getLocalizedRouteUrl(siteConfig.defaultLocale, SKILL_PATH),
    operatingSystem: "Any",
    datePublished: DATE_PUBLISHED,
    dateModified: DATE_PUBLISHED,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  },
  howToJsonLd: {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to install and use anycap-ai-tool-seo",
    description: "Add a live SERP-backed SEO audit workflow to Claude Code or Cursor.",
    totalTime: "PT5M",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Install the skill",
        text: "Run: npx -y skills add anycap-ai/anycap -s 'anycap-ai-tool-seo' -g -y",
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
        name: "Provide a target URL and keyword",
        text: "Give the agent the page you want to audit and the target keyword. It will pull live SERP data, crawl competitor pages, and output structured recommendations.",
      },
    ],
  },
  faqJsonLd: {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What does anycap-ai-tool-seo do that direct prompting doesn't?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Direct prompting can't access live SERPs or crawl competitor pages. This skill teaches the agent to retrieve current SERP data, pull full competitor page content for analysis, and generate recommendations grounded in what Google is actually ranking right now.",
        },
      },
      {
        "@type": "Question",
        name: "What SERP features does it analyze?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The skill analyzes organic result page types, content depth, schema markup signals, People Also Ask questions, featured snippets, and related search patterns for the target keyword.",
        },
      },
      {
        "@type": "Question",
        name: "Is this only for AI tool websites?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The skill works for any SaaS or software product website. It is optimized for AI tool SEO patterns — keyword intent fragmentation, low-competition emerging queries, and GEO (generative engine optimization) signals.",
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
  installCode: "npx -y skills add anycap-ai/anycap -s 'anycap-ai-tool-seo' -g -y",
  githubUrl: GITHUB_URL,
  workflowTitle: "How the workflow changes after install",
  workflowBefore:
    "Agent gives SEO recommendations from training knowledge. No live SERP data. No competitor page analysis. Recommendations may be outdated or generic.",
  workflowAfter:
    "Agent pulls live SERP data for the target keyword, crawls ranking competitor pages, and delivers structured recommendations based on what Google is rewarding right now.",
  workflowSteps: [
    {
      label: "Receive target URL and keyword",
      detail: "User provides the page to audit and the primary target keyword.",
    },
    {
      label: "Pull live SERP data",
      detail: "Agent calls `anycap web search` for the target keyword to retrieve current ranking pages, features, and patterns.",
    },
    {
      label: "Crawl top competitor pages",
      detail: "Agent calls `anycap web crawl` on the top 5 ranking URLs to analyze content depth, heading structure, schema, and page type.",
    },
    {
      label: "Compare target page",
      detail: "Agent compares the target page against SERP consensus across 7 dimensions: page type, content depth, schema, media, UX, authority, and freshness.",
    },
    {
      label: "Output recommendations",
      detail: "Agent delivers a structured report: gaps ranked by impact, specific fixes for schema and content, and keyword opportunities the SERP shows but the target page misses.",
    },
  ],
  sampleOutput:
`SEO audit: anycap.ai/capabilities/image-generation
Target keyword: "AI image generation API"
├── SERP consensus: Tool / product page (8/10 results)
├── Your page type: Tool ✓ (aligned)
├── Content gap: 840 words below SERP median
├── Missing schema: FAQPage, HowTo
├── PAA signals: 4 unanswered questions on page
└── Top opportunity: Add comparison block vs. Midjourney API`,
  comparisonTable: {
    title: "What changes after installing the skill",
    rows: [
      {
        label: "SERP data source",
        without: "Claude training data (may be months old)",
        with: "Live Google results fetched at run time",
      },
      {
        label: "Competitor analysis",
        without: "Generic observations from training",
        with: "Full page crawl of top 5 ranking URLs",
      },
      {
        label: "Keyword gap detection",
        without: "Not available",
        with: "PAA + related searches cross-referenced against your page",
      },
      {
        label: "Schema audit",
        without: "Not available",
        with: "Auto-detected from live SERP features and competitor markup",
      },
      {
        label: "Report format",
        without: "Free-form text, quality varies",
        with: "Structured: gaps ranked by impact, schema fixes, keyword opportunities",
      },
    ],
  },
  capabilitiesTitle: "Capabilities used by this skill",
  capabilities: [
    {
      name: "Web Search",
      href: "/capabilities/web-search",
      summary: "Retrieve live SERP data for target keywords to understand what page types rank.",
    },
    {
      name: "Web Crawl",
      href: "/capabilities/web-crawl",
      summary: "Pull full competitor page content for on-page analysis and content gap detection.",
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
        "Direct prompting gives SEO advice from training data. This skill pulls live SERP data and crawls real competitor pages, so recommendations reflect what Google is ranking right now — not what it ranked 18 months ago.",
    },
    {
      question: "What SERP features does it analyze?",
      answer:
        "Organic page types, content depth, schema markup signals, People Also Ask questions, featured snippets, and related search patterns.",
    },
    {
      question: "Is this only for AI tool websites?",
      answer:
        "It works for any SaaS or software product website, but is optimized for AI tool SEO patterns — emerging queries, intent fragmentation, and GEO signals.",
    },
    {
      question: "Do I need an AnyCap account?",
      answer: "Yes. Install the CLI and run `anycap login` before your first session.",
    },
  ],
  relatedLinks: [
    { label: "View all skills", href: "/skills", variant: "primary" },
    { label: "Web Search", href: "/capabilities/web-search", variant: "secondary" },
    { label: "Web Crawl", href: "/capabilities/web-crawl", variant: "secondary" },
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
