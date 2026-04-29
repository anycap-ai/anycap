import type { Metadata } from "next";
import { getLocalizedRouteUrl, getLocaleConfig, siteConfig, type SiteLocale } from "@/lib/site";
import type { SkillDetailPageData } from "../anycap-media-production/content";

export { type SkillDetailPageData };
export const SKILL_PATH = "/skills/anycap-deepresearch";
const GITHUB_URL = "https://github.com/anycap-ai/anycap/tree/main/skills/anycap-deepresearch";
const DATE_PUBLISHED = "2026-04-18";

const contentEn: SkillDetailPageData = {
  metadata: {
    title: "Deep Research Skill for Claude Code & Cursor | AnyCap",
    description:
      "Give Claude Code and Cursor a multi-source research workflow: plan, gather, synthesize, and cite findings using live web search and crawl.",
    openGraphTitle: "anycap-deepresearch — Multi-source deep research for Claude Code",
    openGraphDescription:
      "Multi-source research workflow for Claude Code and Cursor. Query planning, live web search, crawl-depth analysis, and cited synthesis.",
  },
  breadcrumbItems: [
    { name: "Home", href: "/" },
    { name: "Skills", href: "/skills" },
    { name: "anycap-deepresearch", href: SKILL_PATH },
  ],
  eyebrow: "Skills",
  heroTitle: ["Multi-source deep research", "for Claude Code and Cursor"],
  intro:
    "anycap-deepresearch is an installable skill that gives Claude Code, Cursor, Codex, and similar coding agents a structured research workflow backed by live web data. Without this skill, an agent conducting research is limited to its training knowledge and cannot efficiently plan a search query strategy, gather from multiple live sources, deduplicate findings, and produce a structured output with source attribution. With the skill installed, the agent knows how to invoke AnyCap web search and web crawl at each stage of a research task: planning the query set, pulling full-page content from relevant URLs, filtering and cross-referencing sources, and assembling a synthesized deliverable. The workflow handles source attribution automatically so downstream documents or reports can reference original URLs. This is valuable for competitive research, technical documentation, market analysis, and any agent workflow that needs grounded, citable findings rather than model hallucination. The skill is compatible with Claude Code, Cursor, and Codex and installs in one command.",
  trustSignals: [
    { label: "Install time", value: "< 5 min" },
    { label: "Supported agents", value: "Claude Code · Cursor · Codex" },
    { label: "Platform", value: "macOS · Linux · Windows" },
  ],
  definitionJsonLd: {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "anycap-deepresearch",
    applicationCategory: "DeveloperApplication",
    description:
      "An installable AI agent skill that covers multi-source deep research: plan, gather, analyze, synthesize, and deliver findings using web search and web crawl with source attribution.",
    url: getLocalizedRouteUrl("en", SKILL_PATH),
    operatingSystem: "Any",
    datePublished: DATE_PUBLISHED,
    dateModified: DATE_PUBLISHED,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  },
  howToJsonLd: {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to install and use anycap-deepresearch",
    description: "Add a multi-source deep research workflow to Claude Code or Cursor.",
    totalTime: "PT5M",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Install the skill",
        text: "Run: npx -y skills add anycap-ai/anycap -s 'anycap-deepresearch' -g -y",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "Start a new agent session",
        text: "The skill is auto-detected at session start. Ensure the AnyCap CLI is authenticated with `anycap login`.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "Ask the agent to research a topic",
        text: "The agent will plan 5–8 search queries, run them via AnyCap web search, crawl top URLs for depth, and deliver a synthesized report with citations.",
      },
    ],
  },
  faqJsonLd: {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What does anycap-deepresearch do that direct prompting doesn't?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Direct prompting relies on Claude's training data. anycap-deepresearch teaches the agent to plan a multi-query search strategy, pull live results from the web, crawl full pages for depth, and synthesize findings with source citations — all within one session.",
        },
      },
      {
        "@type": "Question",
        name: "Can Claude Code already search the web without this skill?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Claude Code can use MCP tools or custom integrations for web search, but it doesn't have a structured research workflow by default. This skill provides the query planning, crawl depth, deduplication, and citation formatting that turn raw search access into a reliable research pipeline.",
        },
      },
      {
        "@type": "Question",
        name: "What citation format does the research output use?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The skill outputs source URLs inline with each finding. The format can be adapted to markdown, JSON, or plain text depending on how you prompt the agent to structure the final deliverable.",
        },
      },
      {
        "@type": "Question",
        name: "Do I need an AnyCap account to use this skill?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. The skill uses AnyCap web search and web crawl. Install the CLI and run `anycap login` before your first session.",
        },
      },
    ],
  },
  installTitle: "Install this skill",
  installCode: "npx -y skills add anycap-ai/anycap -s 'anycap-deepresearch' -g -y",
  githubUrl: GITHUB_URL,
  workflowTitle: "How the workflow changes after install",
  workflowBefore:
    "Agent answers from training knowledge only. No live sources. No citations. Findings may be outdated or hallucinated.",
  workflowAfter:
    "Agent plans queries, searches the live web, crawls full pages, cross-references sources, and delivers a cited report — all within one session.",
  workflowSteps: [
    {
      label: "Plan the query set",
      detail: "Agent breaks the research brief into 5–8 targeted search queries, each covering a different angle: definitions, statistics, comparisons, critiques, and recent developments. Distributing queries across angles prevents the single-query blind spot that misses counter-evidence and outlier findings.",
    },
    {
      label: "Run web search",
      detail: "Agent runs `anycap web search` for each query in sequence and records titles, snippets, and URLs from live results. Running 6–8 queries ensures coverage across source types — official documentation, independent analysis, and community discussion — without over-relying on any single perspective.",
    },
    {
      label: "Crawl top sources",
      detail: "Agent calls `anycap web crawl` on the top 2–3 URLs per query to pull full page content for analysis. Crawling moves beyond SERP snippets to retrieve full arguments, data tables, and contextual evidence — the kind of detail that search result previews never surface.",
    },
    {
      label: "Cross-reference and deduplicate",
      detail: "Agent compares findings across all crawled pages, removes duplicate claims, and flags contradictions — preserving cases where credible sources disagree so the human reviewer can make the final judgment rather than having the agent silently resolve the conflict.",
    },
    {
      label: "Synthesize with citations",
      detail: "Agent assembles a structured deliverable: findings grouped by theme, each claim attributed to a source URL. The output format adapts to the brief — Markdown for documentation, JSON for downstream processing, or prose for editorial use.",
    },
  ],
  sampleOutput:
`Research complete: "context engineering for AI agents"
├── Queries run: 7
├── Sources gathered: 14 URLs
├── Full pages crawled: 9
├── Deduplicated findings: 22
└── Output: research-report.md
    ├── Word count: 2,840
    ├── Citations: 14 inline
    └── Contradictions flagged: 2`,
  capabilitiesTitle: "Capabilities used by this skill",
  capabilities: [
    {
      name: "Web Search",
      href: "/capabilities/web-search",
      summary: "Run structured queries across the live web to gather sources at each research stage.",
    },
    {
      name: "Web Crawl",
      href: "/capabilities/web-crawl",
      summary: "Pull full page content from specific URLs for deeper source analysis.",
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
        "Direct prompting uses training data. This skill teaches the agent to plan a query strategy, pull live results, crawl full pages, and synthesize with citations — turning Claude into a grounded researcher rather than a text predictor.",
    },
    {
      question: "Can Claude Code already search the web without this skill?",
      answer:
        "Claude Code can use MCP tools for web search, but it lacks a structured research pipeline by default. This skill adds query planning, crawl depth, deduplication, and citation formatting.",
    },
    {
      question: "What citation format does the output use?",
      answer:
        "Source URLs are embedded inline with each finding. You can instruct the agent to format the final output as markdown, JSON, or plain text.",
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
