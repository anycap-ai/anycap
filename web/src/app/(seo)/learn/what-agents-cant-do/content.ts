import type { Metadata } from "next";
import { createFaqPageJsonLd, createTechArticleJsonLd } from "@/lib/schema";
import { getLocaleConfig, siteConfig, type SiteLocale } from "@/lib/site";

export const WHAT_AGENTS_CANT_DO_PATH = "/learn/what-agents-cant-do";

type GapCard = {
  title: string;
  body: string;
  fix: string;
  href: string;
};

type WhatAgentsCantDoPageData = {
  metadata: {
    title: string;
    description: string;
    openGraphTitle: string;
    openGraphDescription: string;
  };
  eyebrow: string;
  heroTitle: [string, string];
  heroIntro: string;
  lastUpdatedLabel: string;
  takeawaysTitle: string;
  takeaways: string[];
  gapsTitle: string;
  gapsIntro: string;
  gaps: GapCard[];
  runtimeTitle: string;
  runtimeIntro: string;
  runtimePoints: string[];
  faqTitle: string;
  faqItems: { question: string; answer: string }[];
  nextTitle: string;
  nextPages: { eyebrow: string; title: string; href: string; body: string }[];
  ctas: { label: string; href: string; primary?: boolean }[];
  articleJsonLd: Record<string, unknown>;
  faqJsonLd: Record<string, unknown>;
};

const lastUpdatedIso = "2026-06-01";

const enGaps: GapCard[] = [
  {
    title: "See what humans share",
    body:
      "Most coding agents can read text files in the repo, but they cannot reliably inspect screenshots, product photos, UI captures, or video recordings without a vision capability.",
    fix: "Add image understanding and video analysis through one CLI instead of wiring separate vision APIs per workflow.",
    href: "/capabilities/image-understanding",
  },
  {
    title: "Generate media humans can use",
    body:
      "Agents can describe an image or video in text, but they cannot produce the asset itself without a generation runtime behind the model.",
    fix: "Use image and video generation commands that return shareable outputs, not just markdown descriptions.",
    href: "/capabilities/video-generation",
  },
  {
    title: "Search and read the live web",
    body:
      "Model knowledge goes stale. Agents need grounded search and crawl workflows when the task depends on current pages, pricing, docs, or news.",
    fix: "Add web search and web crawl as first-class capabilities instead of asking the model to guess from training data.",
    href: "/capabilities/web-search",
  },
  {
    title: "Persist and share deliverables",
    body:
      "Even when an agent produces a file locally, it often has no stable way to hand a durable link back to a human reviewer or teammate.",
    fix: "Use Drive for shareable file links and Page when the deliverable should be a hosted web page.",
    href: "/capabilities/drive",
  },
  {
    title: "Finish jobs without custom glue code",
    body:
      "Teams often patch each missing capability with a one-off SDK, dashboard, or script. That works once, then becomes maintenance debt across every new workflow.",
    fix: "Install one capability runtime so the agent reuses the same command surface across media, search, storage, and publishing.",
    href: "/guides/install-anycap",
  },
];

const enFaqItems = [
  {
    question: "What can AI agents not do by default?",
    answer:
      "Most agents cannot generate images or video, inspect screenshots or recordings, search the live web reliably, or deliver durable shareable outputs without extra capability layers around the model.",
  },
  {
    question: "Is this a model problem or a system problem?",
    answer:
      "Often both, but many production failures are system failures. The model may be strong while the agent still lacks the runtime needed to see, generate, retrieve, or deliver results.",
  },
  {
    question: "How does AnyCap fix agent capability gaps?",
    answer:
      "AnyCap gives agents one install path, one auth flow, and one CLI for image, video, vision, search, storage, and publishing workflows instead of separate provider integrations per task.",
  },
  {
    question: "Where should I start if my agent already codes well but fails on media tasks?",
    answer:
      "Start with the capability gap map on this page, then install AnyCap and add the first missing capability that blocks your current workflow.",
  },
];

function buildPageData(
  overrides: Partial<WhatAgentsCantDoPageData> & Pick<WhatAgentsCantDoPageData, "metadata">,
): WhatAgentsCantDoPageData {
  const page: WhatAgentsCantDoPageData = {
    eyebrow: "Learn",
    heroTitle: ["What agents can't do", "and how to close the gaps"],
    heroIntro:
      "Strong coding agents still fail on real work when the task needs sight, media generation, live web access, or deliverable handoff. This page maps the common capability gaps and the runtime layer that closes them without switching agents.",
    lastUpdatedLabel: "Last updated June 1, 2026",
    takeawaysTitle: "Key points",
    takeaways: [
      "Most agent failures on media and delivery tasks are capability gaps, not reasoning gaps.",
      "Vision, generation, search, storage, and publishing need execution layers beyond the base model.",
      "The fastest fix is usually one runtime with one CLI, not a new provider integration for every workflow.",
    ],
    gapsTitle: "The capability gaps that show up first",
    gapsIntro:
      "These are the gaps teams hit after the agent already plans well in code. If your workflow stops at description instead of output, start here.",
    gaps: enGaps,
    runtimeTitle: "Why a capability runtime matters",
    runtimeIntro:
      "AnyCap is not another model. It is the execution layer that lets the agent you already use finish multimodal jobs through predictable commands.",
    runtimePoints: [
      "One skill teaches the agent how to install, authenticate, and invoke capabilities.",
      "One CLI exposes generation, analysis, search, storage, and publishing workflows.",
      "One auth flow covers the full capability surface instead of separate logins per provider.",
    ],
    faqTitle: "FAQ",
    faqItems: enFaqItems,
    nextTitle: "Next pages",
    nextPages: [
      {
        eyebrow: "Install",
        title: "Install AnyCap",
        href: "/guides/install-anycap",
        body: "Canonical install path for the CLI and agent skill.",
      },
      {
        eyebrow: "Capabilities",
        title: "Capability inventory",
        href: "/capabilities",
        body: "See which gaps AnyCap closes today and what is on the roadmap.",
      },
      {
        eyebrow: "Start",
        title: "Get started",
        href: "/start",
        body: "Natural-language onboarding if you want the agent to handle setup.",
      },
    ],
    ctas: [
      { label: "Install AnyCap", href: "/guides/install-anycap", primary: true },
      { label: "Browse capabilities", href: "/capabilities" },
      { label: "Get started", href: "/start" },
    ],
    articleJsonLd: createTechArticleJsonLd({
      headline: overrides.metadata.openGraphTitle,
      description: overrides.metadata.description,
      path: WHAT_AGENTS_CANT_DO_PATH,
      about: ["AI agents", "Agent capability gaps", "Multimodal AI", "AnyCap"],
      keywords: [
        "what ai agents can't do",
        "ai agent limitations",
        "agent capability gaps",
        "multimodal agent workflows",
      ],
      datePublished: lastUpdatedIso,
      dateModified: lastUpdatedIso,
    }),
    faqJsonLd: createFaqPageJsonLd([]),
    ...overrides,
  };
  page.faqJsonLd = createFaqPageJsonLd(page.faqItems);
  return page;
}

const contentByLocale: Record<SiteLocale, WhatAgentsCantDoPageData> = {
  en: buildPageData({
    metadata: {
      title: "What AI Agents Can't Do in 2026 — Capability Gaps and Fixes",
      description:
        "Most AI agents cannot generate media, inspect screenshots, search the live web, or deliver shareable outputs by default. See the common capability gaps and how to close them with one runtime.",
      openGraphTitle: "What AI Agents Can't Do — Capability Gaps and Fixes",
      openGraphDescription:
        "A practical map of what coding agents still cannot do without a capability runtime, and how to close the gaps with AnyCap.",
    },
  }),
  "pt-br": buildPageData({
    metadata: {
      title: "O que agentes de IA não conseguem fazer — lacunas e correções",
      description:
        "A maioria dos agentes não gera mídia, não inspeciona capturas, não busca a web ao vivo nem entrega links compartilháveis por padrão. Veja as lacunas comuns e como fechá-las.",
      openGraphTitle: "O que agentes de IA não conseguem fazer",
      openGraphDescription:
        "Mapa prático das lacunas de capability em agentes de codificação e como fechá-las com um runtime.",
    },
    heroTitle: ["O que agentes não conseguem fazer", "e como fechar as lacunas"],
    takeawaysTitle: "Pontos-chave",
    gapsTitle: "As lacunas de capability que aparecem primeiro",
    runtimeTitle: "Por que um runtime de capability importa",
    faqTitle: "FAQ",
    nextTitle: "Próximas páginas",
    ctas: [
      { label: "Instalar AnyCap", href: "/guides/install-anycap", primary: true },
      { label: "Ver capabilities", href: "/capabilities" },
      { label: "Começar", href: "/start" },
    ],
  }),
  id: buildPageData({
    metadata: {
      title: "Apa yang tidak bisa dilakukan agen AI — celah dan perbaikannya",
      description:
        "Kebanyakan agen AI tidak bisa menghasilkan media, memeriksa screenshot, mencari web langsung, atau menyerahkan output yang bisa dibagikan secara default.",
      openGraphTitle: "Apa yang tidak bisa dilakukan agen AI",
      openGraphDescription:
        "Peta praktis celah capability pada agen coding dan cara menutupnya dengan satu runtime.",
    },
    heroTitle: ["Apa yang tidak bisa dilakukan agen", "dan cara menutup celahnya"],
    ctas: [
      { label: "Instal AnyCap", href: "/guides/install-anycap", primary: true },
      { label: "Lihat capabilities", href: "/capabilities" },
      { label: "Mulai", href: "/start" },
    ],
  }),
  de: buildPageData({
    metadata: {
      title: "Was KI-Agenten nicht können — Capability-Lücken und Lösungen",
      description:
        "Die meisten KI-Agenten können standardmäßig keine Medien erzeugen, Screenshots prüfen, das Live-Web durchsuchen oder teilbare Ergebnisse liefern.",
      openGraphTitle: "Was KI-Agenten nicht können",
      openGraphDescription:
        "Praktische Übersicht über Capability-Lücken bei Coding-Agenten und wie man sie mit einem Runtime schließt.",
    },
    heroTitle: ["Was Agenten nicht können", "und wie Sie die Lücken schließen"],
    ctas: [
      { label: "AnyCap installieren", href: "/guides/install-anycap", primary: true },
      { label: "Capabilities ansehen", href: "/capabilities" },
      { label: "Jetzt starten", href: "/start" },
    ],
  }),
};

export function getWhatAgentsCantDoMetadata(locale: SiteLocale): Metadata {
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

export function getWhatAgentsCantDoPageData(locale: SiteLocale) {
  return contentByLocale[locale] ?? contentByLocale.en;
}
