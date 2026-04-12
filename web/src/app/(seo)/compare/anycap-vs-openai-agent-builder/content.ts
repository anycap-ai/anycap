import type { Metadata } from "next";
import { createFaqPageJsonLd, createTechArticleJsonLd } from "@/lib/schema";
import { getLocaleConfig, siteConfig, type SiteLocale } from "@/lib/site";

export const ANYCAP_VS_OPENAI_AGENT_BUILDER_PATH = "/compare/anycap-vs-openai-agent-builder";

type ComparePageData = {
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
  heroTitle: [string, string, string];
  heroIntro: string;
  answerFirstSummaryLabel: string;
  answerFirstSummaryBody: string;
  imageAlt: string;
  imageCaption: string;
  comparisonTitle: string;
  comparisonHeaders: { dimension: string; anycap: string; builder: string };
  comparisonRows: readonly { dimension: string; anycap: string; builder: string }[];
  comparisonReviewLabel: string;
  comparisonReviewBody: string;
  framingTitle: string;
  framingBody: readonly string[];
  framingCards: readonly { title: string; label: string; body: string }[];
  strengthsTitleLeft: string;
  strengthsTitleRight: string;
  strengthsLeft: readonly string[];
  strengthsRight: readonly string[];
  useCasesTitle: string;
  useCases: readonly { eyebrow: string; title: string; body: string }[];
  methodTitle: string;
  methodBody: readonly string[];
  methodologyNoteLabel: string;
  methodologyNoteBody: string;
  sourceTitle: string;
  sourceLinks: readonly { label: string; href: string; note: string }[];
  relatedTitle: string;
  relatedPages: readonly { href: string; eyebrow: string; title: string; body: string }[];
  faqTitle: string;
  faqItems: readonly { question: string; answer: string }[];
  ctas: readonly { href: string; label: string; variant: "primary" | "secondary" }[];
};

const lastUpdatedIso = "2026-04-06";

const en: ComparePageData = {
  breadcrumbItems: [
    { name: "Home", href: "/" },
    { name: "Compare", href: "/compare", unlinkable: true },
    { name: "AnyCap vs OpenAI Agent Builder" },
  ],
  eyebrow: "Compare",
  metadata: {
    title: "AnyCap vs OpenAI Agent Builder — capability runtime vs workflow builder",
    description:
      "Compare AnyCap and OpenAI Agent Builder. OpenAI Agent Builder is a visual workflow builder with typed nodes, guardrails, versioning, and ChatKit deployment. AnyCap is a cross-agent capability runtime for Codex, Cursor, Claude Code, and similar harnesses.",
    openGraphTitle: "AnyCap vs OpenAI Agent Builder — capability runtime vs workflow builder",
    openGraphDescription:
      "See when OpenAI Agent Builder is the right workflow layer and when AnyCap is the better capability layer.",
  },
  articleJsonLd: createTechArticleJsonLd({
    headline: "AnyCap vs OpenAI Agent Builder — capability runtime vs workflow builder",
    description:
      "Comparison guide for teams deciding whether they need OpenAI Agent Builder's workflow canvas or AnyCap's cross-agent capability runtime.",
    path: ANYCAP_VS_OPENAI_AGENT_BUILDER_PATH,
    about: ["AnyCap", "OpenAI Agent Builder", "Agent capability runtime", "Agent workflow builder", "ChatKit"],
    keywords: [
      "anycap vs openai agent builder",
      "openai agent builder alternative",
      "agent builder vs capability runtime",
      "openai workflow builder",
      "capability runtime for agents",
    ],
    datePublished: lastUpdatedIso,
    dateModified: lastUpdatedIso,
  }),
  faqJsonLd: createFaqPageJsonLd([
    {
      question: "Is AnyCap an agent builder?",
      answer:
        "No. AnyCap is an agent-native capability runtime. It gives existing agents a shared execution layer for image, video, vision, search, storage, and publishing instead of acting as a workflow builder.",
    },
    {
      question: "Is OpenAI Agent Builder better for customer-facing agent apps?",
      answer:
        "Usually yes. OpenAI positions Agent Builder around visually designing workflows, publishing versioned builds, and deploying them with ChatKit or exported workflow code, which makes it a stronger fit when the workflow itself needs to become part of a product.",
    },
    {
      question: "When should a team compare AnyCap to OpenAI Agent Builder?",
      answer:
        "Compare them when the team is deciding between two layers of the stack: a workflow builder on the OpenAI platform versus a shared runtime that equips already-chosen agents with capabilities during execution.",
    },
    {
      question: "Can AnyCap replace OpenAI Agent Builder?",
      answer:
        "Not if you specifically need a visual workflow canvas, node-level control flow, versioned workflow publishing, or ChatKit deployment. AnyCap replaces capability wiring work, not the builder category itself.",
    },
    {
      question: "What is the simplest rule of thumb?",
      answer:
        "If you need to design and ship an OpenAI workflow, choose Agent Builder. If you already have agents and need them to do more, choose AnyCap.",
    },
  ]),
  lastUpdatedLabel: "April 6, 2026",
  heroTitle: ["AnyCap vs", "OpenAI Agent", "Builder"],
  heroIntro:
    "AnyCap vs OpenAI Agent Builder is not a same-category comparison. OpenAI Agent Builder is a workflow builder for designing, testing, versioning, and deploying multi-step agent systems on the OpenAI stack. AnyCap is a capability runtime that equips agents you already use with one shared execution layer for image, video, vision, search, storage, and publishing.",
  answerFirstSummaryLabel: "Answer-first summary",
  answerFirstSummaryBody:
    "Choose OpenAI Agent Builder when you want to visually design and ship an OpenAI workflow, especially if the result will become an embedded chat or internal product experience. Choose AnyCap when you already have agents such as Codex, Cursor, Claude Code, or OpenClaw and you want those agents to gain capabilities through one CLI and one auth flow instead of rebuilding capability wiring for every environment.",
  imageAlt:
    "Generated comparison hero showing a workflow-builder layer on the left and multiple coding agents flowing into one shared AnyCap capability runtime on the right.",
  imageCaption:
    "This hero image was generated with AnyCap using Nano Banana 2. The left side represents the workflow-builder layer, and the right side represents a shared capability runtime that multiple coding agents can plug into during execution.",
  comparisonTitle: "Side-by-side comparison",
  comparisonHeaders: { dimension: "Dimension", anycap: "AnyCap", builder: "OpenAI Agent Builder" },
  comparisonRows: [
    {
      dimension: "Primary job",
      anycap: "Agent-native capability runtime that existing agents call during execution.",
      builder: "Visual workflow builder for designing, previewing, versioning, and deploying OpenAI-based agent workflows.",
    },
    {
      dimension: "Best fit",
      anycap:
        "Teams already using Codex, Cursor, Claude Code, OpenCode, OpenClaw, or custom harnesses that need one shared capability layer.",
      builder:
        "Teams building customer-facing or internal agent workflows directly on the OpenAI platform.",
    },
    {
      dimension: "Workflow model",
      anycap:
        "One CLI and one auth flow focused on capabilities such as image, video, vision, search, storage, and publishing.",
      builder:
        "A node-based canvas with agents, tools, logic, state, typed edges, and preview runs.",
    },
    {
      dimension: "Deployment path",
      anycap: "Install once, log in once, and reuse the same runtime from multiple agent shells.",
      builder:
        "Publish workflow versions, then embed with ChatKit or export workflow code for an Agents SDK integration.",
    },
    {
      dimension: "Tooling scope",
      anycap: "Curated capability layer with one credential and one command surface.",
      builder:
        "Compose agent nodes with file search, guardrails, MCP, human approval, and control-flow logic.",
    },
    {
      dimension: "Vendor alignment",
      anycap:
        "Designed to travel across agent environments instead of anchoring the team to one builder UI.",
      builder: "Strongest when the workflow, model, and deployment path stay inside the OpenAI stack.",
    },
    {
      dimension: "Output handling",
      anycap:
        "Pairs execution with Drive storage and web publishing so artifacts can be kept, shared, and reused.",
      builder:
        "Focuses on workflow orchestration and app deployment rather than a cross-agent capability runtime.",
    },
    {
      dimension: "Decision lens",
      anycap: "Choose when the question is: how do my existing agents gain capabilities?",
      builder: "Choose when the question is: how do I design and ship an OpenAI agent workflow?",
    },
  ],
  comparisonReviewLabel: "Comparison reviewed against public OpenAI docs and published AnyCap pages on April 6, 2026.",
  comparisonReviewBody:
    "Comparison reviewed against public OpenAI docs and published AnyCap pages on April 6, 2026.",
  framingTitle: "The real framing: workflow builder vs capability runtime",
  framingBody: [
    "Teams often compare these products because both appear in conversations about agent infrastructure. But they solve different problems. Agent Builder decides how an OpenAI workflow is assembled, routed, reviewed, versioned, and deployed. AnyCap decides how an agent gets capabilities once the agent or harness is already in place.",
    "That difference matters because it changes the buying question. If you are choosing a builder, you are choosing how the workflow itself will be authored and shipped. If you are choosing AnyCap, you are choosing whether to standardize the execution layer that multiple agents can share.",
  ],
  framingCards: [
    {
      title: "Ask this first",
      label: "Do you need to design the workflow?",
      body:
        "If yes, OpenAI Agent Builder is the more relevant product because the visual workflow, node contracts, approvals, and deployment path are the center of the job to be done.",
    },
    {
      title: "Ask this next",
      label: "Or do you need to equip existing agents?",
      body:
        "If the agent shell is already decided and the problem is missing capabilities, AnyCap is the better comparison because it standardizes capability access across existing agent environments.",
    },
    {
      title: "Practical rule",
      label: "Builder on one side, runtime on the other",
      body:
        "This page is strongest when you read it as an architecture comparison rather than a feature checklist. The categories are adjacent, not interchangeable.",
    },
  ],
  strengthsTitleLeft: "Where OpenAI Agent Builder is strong",
  strengthsTitleRight: "Where AnyCap is the better fit",
  strengthsLeft: [
    "OpenAI describes Agent Builder as a visual canvas for multi-step workflows, so it is the better fit when the workflow itself is what you are designing.",
    "The node system covers agent nodes, file search, guardrails, MCP, logic, human approval, and state management in one place.",
    "Published workflows become versioned objects, which is helpful when the team needs stable releases and rollback points.",
    "There is a direct path into ChatKit, which OpenAI positions as the recommended way to embed agentic chat experiences.",
  ],
  strengthsRight: [
    "AnyCap is the better fit when the agent shell is already chosen and the missing layer is capability access rather than workflow design.",
    "One CLI and one auth flow can travel across Codex, Cursor, Claude Code, OpenClaw, and similar environments without rebuilding the stack each time.",
    "The product is optimized around capability access such as image generation, video generation, image understanding, search, Drive storage, and publishing.",
    "This makes AnyCap more useful for teams that operate across several agent products and want one runtime surface instead of one builder per vendor.",
  ],
  useCasesTitle: "Best fit by use case",
  useCases: [
    {
      eyebrow: "Choose OpenAI Agent Builder if",
      title: "The workflow itself is the product.",
      body:
        "You need to map multi-step behavior visually, test nodes with live data, add guardrails and approvals, then publish versions for a deployed chat or app flow.",
    },
    {
      eyebrow: "Choose AnyCap if",
      title: "The agent is already chosen and the missing layer is capability access.",
      body:
        "You want Codex, Cursor, Claude Code, OpenClaw, or a custom harness to gain image, video, vision, search, storage, and publishing through one shared runtime.",
    },
    {
      eyebrow: "Choose OpenAI Agent Builder if",
      title: "You want a tight OpenAI-stack deployment path.",
      body:
        "Agent Builder is a stronger match when you want versions, OpenAI-hosted workflow execution, and a direct ChatKit path into an embedded customer-facing chat experience.",
    },
    {
      eyebrow: "Choose AnyCap if",
      title: "You care more about portability than builder UX.",
      body:
        "AnyCap is stronger when the same capability surface needs to move with the team across multiple agent shells rather than being attached to one workflow canvas.",
    },
  ],
  methodTitle: "How this comparison was reviewed",
  methodBody: [
    "The OpenAI side of this page was reviewed against official OpenAI developer docs available on April 6, 2026. The core claims used here are intentionally narrow and verifiable: Agent Builder is a visual canvas for multi-step workflows; it supports typed inputs and outputs, preview runs, templates, versioned publishing, and deployment through ChatKit or exported workflow code; its node system covers agents, file search, guardrails, MCP, logic, human approval, and state.",
    "The AnyCap side of the comparison is based on published AnyCap pages for the CLI, installation flow, capability-runtime definition, Drive, and pricing. Claims are limited to what those pages already state publicly: one CLI, one auth flow, cross-agent fit, shared capability access, storage, public URLs, and web publishing support.",
  ],
  methodologyNoteLabel: "Methodology note",
  methodologyNoteBody:
    "This page compares layer fit, not which company has more total product surface area. If OpenAI changes Agent Builder deployment options or AnyCap changes its capability inventory later, the page should be updated to stay tied to current public documentation.",
  sourceTitle: "Source notes",
  sourceLinks: [
    {
      label: "OpenAI Agent Builder guide",
      href: "https://developers.openai.com/api/docs/guides/agent-builder",
      note: "Visual canvas, typed inputs and outputs, templates, preview, workflow publishing, ChatKit, and exported code.",
    },
    {
      label: "OpenAI node reference",
      href: "https://developers.openai.com/api/docs/guides/node-reference",
      note: "Agent, file search, guardrails, MCP, logic, human approval, transform, and state nodes.",
    },
    {
      label: "OpenAI safety in building agents",
      href: "https://developers.openai.com/api/docs/guides/agent-builder-safety",
      note: "Prompt injection, data leakage, structured outputs, tool approvals, and guardrails guidance.",
    },
    {
      label: "AnyCap CLI overview",
      href: "/cli",
      note: "One CLI, one auth flow, and one capability surface across multiple agent environments.",
    },
    {
      label: "Install AnyCap",
      href: "/guides/install-anycap",
      note: "Published setup flow for Codex, Cursor, OpenClaw, and similar agent products.",
    },
    {
      label: "Agent capability runtime",
      href: "/glossary/agent-capability-runtime",
      note: "Definition of the category AnyCap is trying to own.",
    },
    {
      label: "AnyCap Drive",
      href: "/capabilities/drive",
      note: "Shared storage and public URLs for outputs that need to survive beyond one run.",
    },
  ],
  relatedTitle: "Related pages",
  relatedPages: [
    {
      href: "/glossary/agent-capability-runtime",
      eyebrow: "Glossary",
      title: "Agent Capability Runtime",
      body: "Read the core definition for the category AnyCap is trying to own.",
    },
    {
      href: "/cli",
      eyebrow: "Product",
      title: "AnyCap CLI",
      body: "See the one-command surface that lets capabilities travel across agent environments.",
    },
    {
      href: "/for/codex",
      eyebrow: "Agent fit",
      title: "AnyCap for Codex",
      body: "See what it looks like when the agent is already chosen and the missing layer is capability access.",
    },
    {
      href: "/compare/anycap-vs-composio",
      eyebrow: "Compare",
      title: "AnyCap vs Composio",
      body: "Compare a capability runtime with a broader tool-integration platform.",
    },
  ],
  faqTitle: "FAQ",
  faqItems: [
    {
      question: "Is AnyCap an agent builder?",
      answer:
        "No. AnyCap is an agent-native capability runtime. It gives existing agents a shared execution layer for image, video, vision, search, storage, and publishing instead of acting as a workflow builder.",
    },
    {
      question: "Is OpenAI Agent Builder better for customer-facing agent apps?",
      answer:
        "Usually yes. OpenAI positions Agent Builder around visually designing workflows, publishing versioned builds, and deploying them with ChatKit or exported workflow code, which makes it a stronger fit when the workflow itself needs to become part of a product.",
    },
    {
      question: "When should a team compare AnyCap to OpenAI Agent Builder?",
      answer:
        "Compare them when the team is deciding between two layers of the stack: a workflow builder on the OpenAI platform versus a shared runtime that equips already-chosen agents with capabilities during execution.",
    },
    {
      question: "Can AnyCap replace OpenAI Agent Builder?",
      answer:
        "Not if you specifically need a visual workflow canvas, node-level control flow, versioned workflow publishing, or ChatKit deployment. AnyCap replaces capability wiring work, not the builder category itself.",
    },
    {
      question: "What is the simplest rule of thumb?",
      answer:
        "If you need to design and ship an OpenAI workflow, choose Agent Builder. If you already have agents and need them to do more, choose AnyCap.",
    },
  ],
  ctas: [
    { href: "/guides/install-anycap", label: "Install AnyCap", variant: "primary" },
    { href: "/cli", label: "CLI Overview", variant: "secondary" },
    { href: "/for/codex", label: "See Agent Use Cases", variant: "secondary" },
  ],
};

const ptBr: ComparePageData = en;

const contentByLocale: Record<SiteLocale, ComparePageData> = {
  en,
  "pt-br": ptBr,
  id: en,
};

export function getAnyCapVsOpenAIAgentBuilderMetadata(locale: SiteLocale): Metadata {
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

export function getAnyCapVsOpenAIAgentBuilderPageData(locale: SiteLocale) {
  return contentByLocale[locale] ?? contentByLocale.en;
}
