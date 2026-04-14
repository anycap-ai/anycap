import type { Metadata } from "next";
import { getLocaleConfig, siteConfig, type SiteLocale } from "@/lib/site";

export const FAL_AI_ALTERNATIVES_PATH = "/compare/fal-ai-alternatives-for-agents";

type AlternativeCard = {
  name: string;
  category: string;
  focus: string;
  strengths: readonly string[];
  considerations: readonly string[];
  bestFor: string;
  href?: string;
  cta?: string;
};

type ComparisonDimension = { dimension: string; falai: string; anycap: string };

type FalAiAlternativesPageData = {
  metadata: {
    title: string;
    description: string;
    openGraphTitle: string;
    openGraphDescription: string;
  };
  breadcrumbItems: readonly { name: string; href?: string; unlinkable?: boolean }[];
  eyebrow: string;
  lastUpdatedLabel: string;
  heroTitle: [string, string];
  heroIntro: string;
  tableTitle: string;
  tableColumns: { dimension: string; falai: string; anycap: string };
  comparisonDimensions: readonly ComparisonDimension[];
  alternativesTitle: string;
  alternatives: readonly AlternativeCard[];
  faqTitle: string;
  faqItems: readonly { question: string; answer: string }[];
  relatedTitle: string;
  relatedComparisons: readonly { href: string; eyebrow: string; title: string; body: string }[];
  cta: readonly { href: string; label: string }[];
};

const en: FalAiAlternativesPageData = {
  metadata: {
    title: "Top fal.ai Alternatives for AI Agents (2026) — Image, Video, and Vision",
    description:
      "Compare the best fal.ai alternatives for AI agent workflows. See how AnyCap, Replicate, Hugging Face, and others handle image generation, video generation, and vision for Claude Code, Cursor, and Codex.",
    openGraphTitle: "Top fal.ai Alternatives for AI Agents (2026)",
    openGraphDescription:
      "Compare fal.ai alternatives for agent-native image, video, and vision workflows. Evaluate install experience, auth model, and agent compatibility.",
  },
  breadcrumbItems: [
    { name: "Home", href: "/" },
    { name: "Compare", href: "/compare", unlinkable: true },
    { name: "fal.ai Alternatives for Agents" },
  ],
  eyebrow: "Compare",
  lastUpdatedLabel: "April 10, 2026",
  heroTitle: ["Top fal.ai alternatives", "for AI agent workflows"],
  heroIntro:
    "fal.ai is a fast serverless inference platform for generative media models. But if your workflow runs inside an AI agent like Claude Code, Cursor, or Codex, you may need a different kind of tool — one that installs into the agent, authenticates once, and provides capabilities through the same interface the agent already uses.",
  tableTitle: "fal.ai vs AnyCap at a glance",
  tableColumns: { dimension: "Dimension", falai: "fal.ai", anycap: "AnyCap" },
  comparisonDimensions: [
    {
      dimension: "Agent compatibility",
      falai: "Python SDK and REST API; requires custom integration per agent",
      anycap: "Works across Claude Code, Cursor, Codex via skill files and one CLI",
    },
    {
      dimension: "Install experience",
      falai: "pip install fal-client + API key setup",
      anycap: "One skill file + one CLI binary + one login",
    },
    {
      dimension: "Primary strength",
      falai: "Very fast cold starts and serverless GPU inference",
      anycap: "Agent-native interface with one auth across all capabilities",
    },
    {
      dimension: "Capability scope",
      falai: "Image generation, video generation, audio (model-dependent)",
      anycap: "Image, video, music, vision, search, crawl, storage, page publishing",
    },
    {
      dimension: "Pricing model",
      falai: "Per-second GPU billing, varies by model and hardware",
      anycap: "Pay-as-you-go with $5 free credit, no monthly fee",
    },
  ],
  alternativesTitle: "Alternatives compared",
  alternatives: [
    {
      name: "AnyCap",
      category: "Agent capability runtime",
      focus: "Built for AI agents. One CLI, one auth, every capability.",
      strengths: [
        "Single install path for image, video, vision, search, storage, and publishing",
        "Works across Claude Code, Cursor, Codex via skill files",
        "One login covers the full capability stack",
        "CLI-first interface designed for terminal-native agent workflows",
      ],
      considerations: [
        "Curated model selection rather than open model library",
        "Agent-native design — not built for custom backend inference pipelines",
      ],
      bestFor: "Teams using coding agents that need multimodal capabilities without per-provider integration",
      href: "/start",
      cta: "Get started with AnyCap",
    },
    {
      name: "Replicate",
      category: "Model API and deployment platform",
      focus: "Run community and official models through predictions and webhooks.",
      strengths: [
        "Thousands of community and official models",
        "Dedicated deployments for production workloads",
        "Strong model discovery and community ecosystem",
      ],
      considerations: [
        "Each model has its own versioning and input schema",
        "No agent-native interface or skill-based install",
        "Cold starts on community models can be slow",
      ],
      bestFor: "Developers building custom backends that need access to a broad model library",
      href: "/compare/anycap-vs-replicate",
      cta: "See AnyCap vs Replicate",
    },
    {
      name: "Hugging Face Inference API",
      category: "Model hub + inference endpoints",
      focus: "Access to the largest open-model ecosystem with managed inference.",
      strengths: [
        "Largest open-model library available",
        "Free tier for experimentation",
        "Dedicated inference endpoints for production",
      ],
      considerations: [
        "Cold starts on free tier can be significant",
        "Quality varies across community models",
        "Requires per-model integration work",
      ],
      bestFor: "Researchers and teams that want the broadest possible model selection",
    },
    {
      name: "WaveSpeed AI",
      category: "Fast inference API",
      focus: "Optimized inference speeds with exclusive model access.",
      strengths: [
        "Claims fastest inference times in certain benchmarks",
        "Exclusive access to some optimized model variants",
        "Simple REST API",
      ],
      considerations: [
        "Narrower model selection than Replicate or Hugging Face",
        "No agent-native integration path",
        "Newer platform with less community validation",
      ],
      bestFor: "Teams that prioritize inference speed above all other factors",
    },
    {
      name: "Leonardo.Ai API",
      category: "Visual-first media generation API",
      focus: "Image and video generation API with creative tooling focus.",
      strengths: [
        "Strong creative and design-oriented models",
        "Both image and video generation through one API",
        "Good documentation for developers",
      ],
      considerations: [
        "Focused on visual media — no vision, search, or storage capabilities",
        "Requires API key management and custom integration",
        "No agent-native interface",
      ],
      bestFor: "Creative teams and products that need high-quality visual media generation APIs",
    },
  ],
  faqTitle: "FAQ",
  faqItems: [
    {
      question: "Is AnyCap a direct replacement for fal.ai?",
      answer:
        "They serve different use cases. fal.ai is a serverless inference platform for developers calling model APIs from custom code. AnyCap is a capability runtime for AI agents. If you need fast GPU inference for custom pipelines, fal.ai is strong. If you need agents like Claude Code or Cursor to generate images and videos through one interface, AnyCap is the better fit.",
    },
    {
      question: "Which is faster for image generation?",
      answer:
        "fal.ai is specifically optimized for inference speed and claims very fast cold-start times. AnyCap optimizes for the agent workflow experience — install once, auth once, use any capability. For agent-native workflows, the total time from zero to first image includes setup, not just inference.",
    },
    {
      question: "Can I switch from fal.ai to AnyCap without changing my agent?",
      answer:
        "Yes. AnyCap installs as a skill file and CLI binary that works alongside your existing agent. You do not need to modify the agent itself — just install the skill and CLI, authenticate, and the agent can invoke capabilities through the new interface.",
    },
  ],
  relatedTitle: "Related comparisons",
  relatedComparisons: [
    {
      href: "/compare/anycap-vs-replicate",
      eyebrow: "Compare",
      title: "AnyCap vs Replicate",
      body: "Deep 1:1 comparison of AnyCap and Replicate.",
    },
    {
      href: "/compare/anycap-vs-fal-ai",
      eyebrow: "Compare",
      title: "AnyCap vs fal.ai",
      body: "Compare an agent capability runtime with a serverless inference platform.",
    },
  ],
  cta: [
    { href: "/start", label: "Get Started" },
    { href: "/capabilities", label: "See Capabilities" },
  ],
};

const ptBr: FalAiAlternativesPageData = {
  metadata: {
    title: "Principais alternativas ao fal.ai para agentes de IA (2026) — imagem, vídeo e visão",
    description:
      "Compare as melhores alternativas ao fal.ai para fluxos de agentes de IA. Veja como AnyCap, Replicate, Hugging Face e outras lidam com geração de imagem, geração de vídeo e visão para Claude Code, Cursor e Codex.",
    openGraphTitle: "Principais alternativas ao fal.ai para agentes de IA (2026)",
    openGraphDescription:
      "Compare alternativas ao fal.ai para fluxos nativos de agente em imagem, vídeo e visão. Avalie instalação, autenticação e compatibilidade com agentes.",
  },
  breadcrumbItems: [
    { name: "Início", href: "/" },
    { name: "Comparar", href: "/compare", unlinkable: true },
    { name: "Alternativas ao fal.ai para agentes" },
  ],
  eyebrow: "Comparar",
  lastUpdatedLabel: "10 de abril de 2026",
  heroTitle: ["Principais alternativas ao fal.ai", "para fluxos de agentes de IA"],
  heroIntro:
    "O fal.ai é uma plataforma de inferência serverless rápida para modelos de mídia generativa. Mas, se o seu fluxo roda dentro de um agente de IA como Claude Code, Cursor ou Codex, você pode precisar de outro tipo de ferramenta — uma que se instala no agente, autentica uma vez e entrega capacidades pela mesma interface que o agente já usa.",
  tableTitle: "fal.ai vs AnyCap em resumo",
  tableColumns: { dimension: "Dimensão", falai: "fal.ai", anycap: "AnyCap" },
  comparisonDimensions: [
    {
      dimension: "Compatibilidade com agente",
      falai: "SDK Python e REST API; requer integração personalizada por agente",
      anycap: "Funciona em Claude Code, Cursor e Codex via arquivos de skill e uma única CLI",
    },
    {
      dimension: "Experiência de instalação",
      falai: "pip install fal-client + configuração de API key",
      anycap: "Um arquivo de skill + um binário de CLI + um login",
    },
    {
      dimension: "Força principal",
      falai: "Cold starts muito rápidos e inferência serverless em GPU",
      anycap: "Interface nativa para agente com uma autenticação para todas as capacidades",
    },
    {
      dimension: "Escopo de capacidades",
      falai: "Geração de imagem, geração de vídeo, áudio (depende do modelo)",
      anycap: "Imagem, vídeo, música, visão, busca, crawl, armazenamento e publicação de páginas",
    },
    {
      dimension: "Modelo de preço",
      falai: "Cobrança por segundo de GPU, varia por modelo e hardware",
      anycap: "Pay-as-you-go com US$ 5 de crédito grátis, sem mensalidade",
    },
  ],
  alternativesTitle: "Alternativas comparadas",
  alternatives: [
    {
      name: "AnyCap",
      category: "Runtime de capacidades para agentes",
      focus: "Feito para agentes de IA. Uma CLI, uma autenticação, todas as capacidades.",
      strengths: [
        "Caminho único de instalação para imagem, vídeo, visão, busca, armazenamento e publicação",
        "Funciona em Claude Code, Cursor e Codex via arquivos de skill",
        "Um login cobre toda a stack de capacidades",
        "Interface CLI-first pensada para fluxos nativos de terminal",
      ],
      considerations: [
        "Seleção de modelos curada em vez de biblioteca aberta",
        "Projeto nativo para agente, não para pipelines customizados de backend",
      ],
      bestFor: "Times que usam agentes de código e precisam de capacidades multimodais sem integração por provedor",
      href: "/start",
      cta: "Comece com o AnyCap",
    },
    {
      name: "Replicate",
      category: "Plataforma de APIs de modelo e deployment",
      focus: "Execute modelos da comunidade e oficiais por meio de predictions e webhooks.",
      strengths: [
        "Milhares de modelos da comunidade e oficiais",
        "Deployments dedicados para workloads de produção",
        "Boa descoberta de modelos e ecossistema comunitário",
      ],
      considerations: [
        "Cada modelo tem seu próprio versionamento e schema de entrada",
        "Sem interface nativa para agente ou instalação por skill",
        "Cold starts em modelos da comunidade podem ser lentos",
      ],
      bestFor: "Desenvolvedores construindo backends customizados que precisam de uma biblioteca ampla de modelos",
      href: "/compare/anycap-vs-replicate",
      cta: "Ver AnyCap vs Replicate",
    },
    {
      name: "Hugging Face Inference API",
      category: "Hub de modelos + endpoints de inferência",
      focus: "Acesso ao maior ecossistema de modelos abertos com inferência gerenciada.",
      strengths: [
        "Maior biblioteca de modelos abertos disponível",
        "Plano grátis para experimentação",
        "Endpoints dedicados de inferência para produção",
      ],
      considerations: [
        "Cold starts no plano grátis podem ser significativos",
        "A qualidade varia bastante entre modelos da comunidade",
        "Exige integração por modelo",
      ],
      bestFor: "Pesquisadores e equipes que querem a seleção de modelos mais ampla possível",
    },
    {
      name: "WaveSpeed AI",
      category: "API de inferência rápida",
      focus: "Velocidades de inferência otimizadas com acesso exclusivo a alguns modelos.",
      strengths: [
        "Alega tempos de inferência muito rápidos em certos benchmarks",
        "Acesso exclusivo a algumas variantes de modelos otimizados",
        "REST API simples",
      ],
      considerations: [
        "Seleção de modelos menor que Replicate ou Hugging Face",
        "Sem caminho de integração nativo para agentes",
        "Plataforma mais nova e com menos validação comunitária",
      ],
      bestFor: "Times que priorizam velocidade de inferência acima de qualquer outro fator",
    },
    {
      name: "Leonardo.Ai API",
      category: "API de mídia visual-first",
      focus: "API de geração de imagem e vídeo com foco em ferramentas criativas.",
      strengths: [
        "Modelos fortes com foco criativo e de design",
        "Geração de imagem e vídeo por uma única API",
        "Boa documentação para desenvolvedores",
      ],
      considerations: [
        "Focada em mídia visual — sem capacidades de visão, busca ou armazenamento",
        "Exige gestão de API key e integração personalizada",
        "Sem interface nativa para agente",
      ],
      bestFor: "Times criativos e produtos que precisam de APIs de geração de mídia visual de alta qualidade",
    },
  ],
  faqTitle: "FAQ",
  faqItems: [
    {
      question: "O AnyCap substitui o fal.ai diretamente?",
      answer:
        "Eles servem a usos diferentes. O fal.ai é uma plataforma de inferência serverless para desenvolvedores que chamam APIs de modelo a partir de código próprio. O AnyCap é um runtime de capacidades para agentes de IA. Se você precisa de inferência rápida em GPU para pipelines customizados, o fal.ai é forte. Se você precisa que agentes como Claude Code ou Cursor gerem imagens e vídeos por uma única interface, o AnyCap encaixa melhor.",
    },
    {
      question: "Qual é mais rápido para geração de imagem?",
      answer:
        "O fal.ai é otimizado especificamente para velocidade de inferência e promete cold starts muito rápidos. O AnyCap otimiza a experiência do fluxo de trabalho do agente — instala uma vez, autentica uma vez, usa qualquer capacidade. Em fluxos nativos de agente, o tempo total até a primeira imagem inclui setup, não só inferência.",
    },
    {
      question: "Posso trocar do fal.ai para o AnyCap sem mudar o meu agente?",
      answer:
        "Sim. O AnyCap instala como um arquivo de skill e um binário de CLI que funciona junto do agente que você já usa. Você não precisa modificar o agente — basta instalar a skill e a CLI, autenticar, e o agente pode invocar capacidades pela nova interface.",
    },
  ],
  relatedTitle: "Comparações relacionadas",
  relatedComparisons: [
    {
      href: "/compare/anycap-vs-replicate",
      eyebrow: "Comparar",
      title: "AnyCap vs Replicate",
      body: "Comparação 1:1 detalhada entre AnyCap e Replicate.",
    },
    {
      href: "/compare/anycap-vs-fal-ai",
      eyebrow: "Comparar",
      title: "AnyCap vs fal.ai",
      body: "Compare um runtime de capacidades para agentes com uma plataforma serverless de inferência.",
    },
  ],
  cta: [
    { href: "/start", label: "Começar" },
    { href: "/capabilities", label: "Ver capacidades" },
  ],
};

const contentByLocale: Record<SiteLocale, FalAiAlternativesPageData> = {
  en,
  "pt-br": ptBr,
  id: en,
};

export function getFalAiAlternativesMetadata(locale: SiteLocale): Metadata {
  const content = contentByLocale[locale] ?? contentByLocale.en;
  return {
    title: content.metadata.title,
    description: content.metadata.description,
    openGraph: {
      type: "website",
      locale: getLocaleConfig(locale).ogLocale,
      url: FAL_AI_ALTERNATIVES_PATH,
      siteName: siteConfig.siteName,
      title: content.metadata.openGraphTitle,
      description: content.metadata.openGraphDescription,
    },
  };
}

export function getFalAiAlternativesPageData(locale: SiteLocale) {
  return contentByLocale[locale] ?? contentByLocale.en;
}
