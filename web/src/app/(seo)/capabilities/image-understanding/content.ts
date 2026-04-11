import type { Metadata } from "next";
import { createFaqPageJsonLd, createTechArticleJsonLd } from "@/lib/schema";
import { getLocaleConfig, siteConfig, type SiteLocale } from "@/lib/site";

export const IMAGE_UNDERSTANDING_PATH = "/capabilities/image-understanding";

const LAST_UPDATED_ISO = "2026-04-11";

type BreadcrumbItem = {
  name: string;
  href?: string;
};

type FaqItem = {
  question: string;
  answer: string;
};

type UsageExample = {
  title: string;
  code: string;
};

type RelatedCard = {
  eyebrow: string;
  title: string;
  href: string;
  description: string;
};

type NextAction = {
  label: string;
  href: string;
  external?: boolean;
  primary?: boolean;
};

type ImageUnderstandingPageContent = {
  metadata: {
    title: string;
    description: string;
    openGraphTitle: string;
    openGraphDescription: string;
    articleHeadline: string;
    articleDescription: string;
    articleAbout: readonly string[];
    articleKeywords: readonly string[];
  };
  breadcrumbItems: readonly BreadcrumbItem[];
  eyebrow: string;
  lastUpdatedLabel: string;
  hero: {
    title: string;
    intro: string;
    summaryLabel: string;
    summaryText: string;
  };
  namingNote: {
    label: string;
    text: string;
  };
  usageTitle: string;
  usageExamples: readonly UsageExample[];
  useCasesTitle: string;
  useCases: readonly string[];
  relatedTitle: string;
  relatedCards: readonly RelatedCard[];
  faqTitle: string;
  faqItems: readonly FaqItem[];
  nextStepsTitle: string;
  nextActions: readonly NextAction[];
};

const enContent: ImageUnderstandingPageContent = {
  metadata: {
    title: "Image Understanding API for AI agents - Vision, OCR, and image analysis",
    description:
      "Give AI agents image understanding through AnyCap. Analyze screenshots, diagrams, photos, charts, and OCR-heavy visuals through one CLI command without wiring a separate vision or image analysis stack.",
    openGraphTitle: "Image Understanding API for AI agents - Vision, OCR, and image analysis",
    openGraphDescription:
      "Add image understanding, OCR, and image analysis to AI agents with one CLI and one capability runtime.",
    articleHeadline: "Image Understanding API for AI agents - Vision, OCR, and image analysis",
    articleDescription:
      "Capability guide for adding image understanding to AI agents through AnyCap, including screenshots, diagrams, OCR, and chart analysis.",
    articleAbout: ["Image understanding", "Vision for AI agents", "OCR", "AnyCap"],
    articleKeywords: [
      "image understanding for ai agents",
      "vision api for agents",
      "image analysis api",
      "image recognition api",
      "ocr api",
    ],
  },
  breadcrumbItems: [
    { name: "Home", href: "/" },
    { name: "Capabilities", href: "/capabilities" },
    { name: "Image Understanding", href: IMAGE_UNDERSTANDING_PATH },
  ],
  eyebrow: "Capabilities",
  lastUpdatedLabel: "Last updated April 11, 2026",
  hero: {
    title: "Image Understanding",
    intro:
      "AnyCap gives agents a consistent image understanding layer for screenshots, diagrams, charts, and visual references. Instead of wiring a different vision API or image analysis API for each workflow, the agent gets one command surface for visual analysis, OCR, and context extraction across Claude Code, Cursor, Codex, and the rest of your stack.",
    summaryLabel: "Answer-first summary",
    summaryText:
      "Use image understanding when the agent needs to describe, classify, or reason about an image before acting. The same flow works for screenshots, design references, charts, and text-heavy visuals.",
  },
  namingNote: {
    label: "Naming note",
    text:
      "The page uses market language that matches search intent. The CLI command stays `anycap actions image-read`.",
  },
  usageTitle: "CLI usage",
  usageExamples: [
    {
      title: "Analyze a remote screenshot",
      code: "anycap actions image-read --url https://example.com/screenshot.png",
    },
    {
      title: "Inspect a local diagram",
      code: "anycap actions image-read --file ./architecture-diagram.png",
    },
    {
      title: "Ask a focused question",
      code:
        'anycap actions image-read --url https://example.com/chart.png --instruction "What trend changes after Q2?"',
    },
  ],
  useCasesTitle: "When agents need image understanding",
  useCases: [
    "Understand UI states and bug screenshots without leaving the agent workflow.",
    "Read architecture diagrams and flowcharts before generating code or docs.",
    "Extract structured detail from charts, tables, or screenshots with embedded text.",
    "Review visual assets, product images, and design references through one runtime.",
  ],
  relatedTitle: "Related pages",
  relatedCards: [
    {
      eyebrow: "Capability",
      title: "Image Generation",
      href: "/capabilities/image-generation",
      description:
        "Pair image understanding with image generation when the workflow needs both analysis and output creation.",
    },
    {
      eyebrow: "Capability",
      title: "Video Analysis",
      href: "/capabilities/video-analysis",
      description:
        "Use this when the workflow spans screenshots and recordings and the agent needs both visual modes.",
    },
    {
      eyebrow: "Agent page",
      title: "For Claude Code",
      href: "/for/claude-code",
      description:
        "See how image understanding fits into the broader Claude Code capability story.",
    },
  ],
  faqTitle: "FAQ",
  faqItems: [
    {
      question: "What does AnyCap image understanding let agents do?",
      answer:
        "It gives agents one interface for visual analysis across screenshots, diagrams, product images, charts, and scanned text. In practice that means one vision API surface for description, OCR, comparison, and focused question answering.",
    },
    {
      question: "Can this act like an image description AI?",
      answer:
        "Yes. The same runtime can describe screenshots, diagrams, product photos, charts, and other visual references in plain language before the agent decides what to do next.",
    },
    {
      question: "Why is the page called image understanding when the CLI command is image-read?",
      answer:
        "The page uses search-friendly language that matches how teams describe the problem, while the CLI keeps the more compact command name `anycap actions image-read`.",
    },
    {
      question: "When should teams think of this as a vision API or image analysis API?",
      answer:
        "Both phrases are valid. Image understanding is the capability name, while vision API and image analysis API are the market terms people often use when they want OCR, screenshot interpretation, chart reading, or visual reasoning in agent workflows.",
    },
    {
      question: "Does this also work as an OCR API for agent workflows?",
      answer:
        "Yes. OCR is one of the practical jobs inside the image understanding capability, especially for screenshots, scanned text, diagrams, dashboards, and charts that agents need to read before acting.",
    },
  ],
  nextStepsTitle: "Next steps",
  nextActions: [
    {
      label: "View on GitHub",
      href: "https://github.com/anycap-ai/anycap",
      external: true,
      primary: true,
    },
    { label: "Explore capabilities", href: "/capabilities" },
    { label: "Explore the CLI", href: "/cli" },
    { label: "What agents can't do", href: "/learn/what-agents-cant-do" },
  ],
};

const ptBrContent: ImageUnderstandingPageContent = {
  metadata: {
    title: "API de compreensão de imagem para agentes de IA - visão, OCR e análise",
    description:
      "Dê aos agentes de IA compreensão de imagem por meio do AnyCap. Analise screenshots, diagramas, fotos, gráficos e visuais com muito texto em um único comando de CLI, sem precisar integrar uma stack separada de visão ou análise de imagem.",
    openGraphTitle: "API de compreensão de imagem para agentes de IA - visão, OCR e análise",
    openGraphDescription:
      "Adicione compreensão de imagem, OCR e análise visual aos agentes de IA com uma única CLI e um único runtime de capability.",
    articleHeadline: "API de compreensão de imagem para agentes de IA - visão, OCR e análise",
    articleDescription:
      "Guia de capability para adicionar compreensão de imagem aos agentes de IA por meio do AnyCap, incluindo screenshots, diagramas, OCR e leitura de gráficos.",
    articleAbout: ["Compreensão de imagem", "Visão para agentes de IA", "OCR", "AnyCap"],
    articleKeywords: [
      "compreensão de imagem para agentes de ia",
      "ia que descreve imagens grátis",
      "api de visão para agentes",
      "api de análise de imagem",
      "api de ocr",
    ],
  },
  breadcrumbItems: [
    { name: "Início", href: "/" },
    { name: "Capacidades", href: "/capabilities" },
    { name: "Compreensão de imagem", href: IMAGE_UNDERSTANDING_PATH },
  ],
  eyebrow: "Capacidades",
  lastUpdatedLabel: "Atualizado em 11 de abril de 2026",
  hero: {
    title: "Compreensão de imagem",
    intro:
      "O AnyCap dá aos agentes uma camada consistente de compreensão de imagem para screenshots, diagramas, gráficos e referências visuais. Em vez de ligar uma API de visão diferente para cada fluxo, o agente ganha uma superfície única para análise visual, OCR e extração de contexto em Claude Code, Cursor, Codex e o restante da sua stack.",
    summaryLabel: "Resumo direto",
    summaryText:
      "Use compreensão de imagem quando o agente precisa descrever, classificar ou raciocinar sobre uma imagem antes de agir. O mesmo fluxo funciona para screenshots, referências de design, gráficos e visuais com muito texto.",
  },
  namingNote: {
    label: "Nota de nomenclatura",
    text:
      "A página usa a linguagem de mercado que corresponde à busca. O comando da CLI continua `anycap actions image-read`.",
  },
  usageTitle: "Uso na CLI",
  usageExamples: [
    {
      title: "Analisar um screenshot remoto",
      code: "anycap actions image-read --url https://example.com/screenshot.png",
    },
    {
      title: "Inspecionar um diagrama local",
      code: "anycap actions image-read --file ./architecture-diagram.png",
    },
    {
      title: "Fazer uma pergunta focada",
      code:
        'anycap actions image-read --url https://example.com/chart.png --instruction "O que muda na tendência depois do Q2?"',
    },
  ],
  useCasesTitle: "Quando os agentes precisam de compreensão de imagem",
  useCases: [
    "Entender estados de UI e screenshots de bug sem sair do fluxo do agente.",
    "Ler diagramas de arquitetura e fluxogramas antes de gerar código ou documentação.",
    "Extrair detalhes estruturados de gráficos, tabelas ou screenshots com texto embutido.",
    "Revisar assets visuais, imagens de produto e referências de design em um único runtime.",
  ],
  relatedTitle: "Páginas relacionadas",
  relatedCards: [
    {
      eyebrow: "Capacidade",
      title: "Geração de imagem",
      href: "/capabilities/image-generation",
      description:
        "Combine compreensão de imagem com geração de imagem quando o fluxo precisar analisar e também produzir o resultado.",
    },
    {
      eyebrow: "Capacidade",
      title: "Análise de vídeo",
      href: "/capabilities/video-analysis",
      description:
        "Use este caminho quando o fluxo atravessar screenshots e gravações e o agente precisar dos dois modos visuais.",
    },
    {
      eyebrow: "Página de agente",
      title: "Para Claude Code",
      href: "/for/claude-code",
      description:
        "Veja como a compreensão de imagem entra na história mais ampla de capabilities do Claude Code.",
    },
  ],
  faqTitle: "Perguntas frequentes",
  faqItems: [
    {
      question: "O que a compreensão de imagem do AnyCap permite que os agentes façam?",
      answer:
        "Ela dá aos agentes uma interface única para análise visual em screenshots, diagramas, imagens de produto, gráficos e texto digitalizado. Na prática, isso significa uma superfície única de visão para descrição, OCR, comparação e resposta a perguntas focadas.",
    },
    {
      question: "Isso funciona como uma ia que descreve imagens?",
      answer:
        "Sim. O mesmo runtime consegue descrever screenshots, diagramas, fotos de produto, gráficos e outras referências visuais em linguagem simples antes de o agente decidir o que fazer em seguida.",
    },
    {
      question: "Por que a página se chama compreensão de imagem se o comando da CLI é image-read?",
      answer:
        "A página usa a linguagem de busca que as equipes realmente digitam quando procuram a solução, enquanto a CLI mantém o nome mais compacto `anycap actions image-read`.",
    },
    {
      question: "Quando devo pensar nisso como uma API de visão ou de análise de imagem?",
      answer:
        "Os dois termos são válidos. Compreensão de imagem é o nome da capability, enquanto API de visão e API de análise de imagem são os termos de mercado usados quando a pessoa quer OCR, interpretação de screenshots, leitura de gráficos ou raciocínio visual em fluxos de agente.",
    },
    {
      question: "Isso também funciona como uma API de OCR para agentes?",
      answer:
        "Sim. OCR é uma das tarefas práticas dentro da capability de compreensão de imagem, especialmente para screenshots, texto digitalizado, diagramas, dashboards e gráficos que o agente precisa ler antes de agir.",
    },
  ],
  nextStepsTitle: "Próximos passos",
  nextActions: [
    {
      label: "Ver no GitHub",
      href: "https://github.com/anycap-ai/anycap",
      external: true,
      primary: true,
    },
    { label: "Explorar capacidades", href: "/capabilities" },
    { label: "Explorar a CLI", href: "/cli" },
    { label: "O que os agentes não conseguem fazer", href: "/learn/what-agents-cant-do" },
  ],
};

const contentByLocale = {
  en: enContent,
  "pt-br": ptBrContent,
  id: enContent,
} satisfies Record<SiteLocale, ImageUnderstandingPageContent>;

function getContent(locale: SiteLocale): ImageUnderstandingPageContent {
  return contentByLocale[locale] ?? contentByLocale.en;
}

export function getImageUnderstandingMetadata(locale: SiteLocale): Metadata {
  const content = getContent(locale);

  return {
    title: content.metadata.title,
    description: content.metadata.description,
    alternates: { canonical: IMAGE_UNDERSTANDING_PATH },
    openGraph: {
      type: "website",
      locale: getLocaleConfig(locale).ogLocale,
      url: IMAGE_UNDERSTANDING_PATH,
      siteName: siteConfig.siteName,
      title: content.metadata.openGraphTitle,
      description: content.metadata.openGraphDescription,
    },
  };
}

export function getImageUnderstandingPageData(locale: SiteLocale) {
  const content = getContent(locale);

  return {
    ...content,
    articleJsonLd: createTechArticleJsonLd({
      headline: content.metadata.articleHeadline,
      description: content.metadata.articleDescription,
      path: IMAGE_UNDERSTANDING_PATH,
      locale,
      about: [...content.metadata.articleAbout],
      keywords: [...content.metadata.articleKeywords],
      datePublished: LAST_UPDATED_ISO,
      dateModified: LAST_UPDATED_ISO,
    }),
    faqJsonLd: createFaqPageJsonLd(content.faqItems),
  };
}
