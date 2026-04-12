import type { Metadata } from "next";
import { createFaqPageJsonLd, createTechArticleJsonLd } from "@/lib/schema";
import { getLocaleConfig, siteConfig, type SiteLocale } from "@/lib/site";

export const ANYCAP_VS_REPLICATE_PATH = "/compare/anycap-vs-replicate";

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
  heroTitle: [string, string];
  heroIntro: string;
  answerFirstSummaryLabel: string;
  answerFirstSummaryBody: string;
  comparisonTitle: string;
  comparisonHeaders: { dimension: string; anycap: string; replicate: string };
  comparisonRows: readonly { dimension: string; anycap: string; replicate: string }[];
  benchmarkTitle: string;
  benchmarkIntro: string;
  benchmarkHeaders: { metric: string; anycap: string; replicate: string };
  benchmarkRows: readonly { metric: string; anycap: string; replicate: string }[];
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

const lastUpdatedIso = "2026-04-08";

const en: ComparePageData = {
  breadcrumbItems: [
    { name: "Home", href: "/" },
    { name: "Compare", href: "/compare", unlinkable: true },
    { name: "AnyCap vs Replicate" },
  ],
  eyebrow: "Compare",
  metadata: {
    title: "AnyCap vs Replicate — agent capability runtime vs model API platform",
    description:
      "Compare AnyCap and Replicate. Replicate is a model inference and deployment platform built around predictions, webhooks, and app backends. AnyCap is a cross-agent capability runtime for Codex, Cursor, Claude Code, and similar agent workflows.",
    openGraphTitle: "AnyCap vs Replicate — agent capability runtime vs model API platform",
    openGraphDescription:
      "See when Replicate is the right model API layer and when AnyCap is the cleaner capability layer around existing agents.",
  },
  articleJsonLd: createTechArticleJsonLd({
    headline: "AnyCap vs Replicate — agent capability runtime vs model API platform",
    description:
      "Comparison guide for teams deciding whether they need Replicate's model inference platform or AnyCap's cross-agent capability runtime.",
    path: ANYCAP_VS_REPLICATE_PATH,
    about: [
      "AnyCap",
      "Replicate",
      "Agent capability runtime",
      "Model inference API",
      "Webhook workflows",
    ],
    keywords: [
      "anycap vs replicate",
      "replicate alternative for agents",
      "replicate vs anycap",
      "model api vs capability runtime",
      "replicate for coding agents",
    ],
    datePublished: lastUpdatedIso,
    dateModified: lastUpdatedIso,
  }),
  faqJsonLd: createFaqPageJsonLd([
    {
      question: "Is Replicate a direct replacement for AnyCap?",
      answer:
        "No. Replicate is a model API platform. AnyCap is a capability runtime for existing agents. Teams compare them when they are deciding whether the missing layer is app-level inference infrastructure or agent-level capability access.",
    },
    {
      question: "What is the biggest workflow difference between AnyCap and Replicate?",
      answer:
        "Replicate expects your application or script to own the prediction lifecycle. AnyCap expects the agent workflow to stay in one CLI-first runtime that already includes capability access plus artifact delivery paths.",
    },
    {
      question: "Does Replicate support async jobs and webhooks?",
      answer:
        "Yes. Replicate's public docs describe synchronous and asynchronous prediction modes, prediction IDs, and webhook notifications for completed outputs. That is one of its clearest strengths as a backend inference layer.",
    },
    {
      question: "When is AnyCap the cleaner choice?",
      answer:
        "When the team already has agents in Codex, Cursor, Claude Code, or similar environments and wants those agents to gain a broader capability surface quickly without building a separate inference and artifact pipeline.",
    },
    {
      question: "What is the simplest rule of thumb?",
      answer:
        "If your product backend needs model APIs, choose Replicate. If your agents need a shared runtime so they can actually finish multimodal work, choose AnyCap.",
    },
  ]),
  lastUpdatedLabel: "April 8, 2026",
  heroTitle: ["AnyCap vs", "Replicate"],
  heroIntro:
    "AnyCap vs Replicate is a stack-layer decision, not a same-category fight. Replicate is a strong fit when your application backend needs direct control over model inference, prediction lifecycles, deployments, and webhooks. AnyCap is the stronger fit when your agents already exist and the missing layer is capability access across image, video, search, storage, and publishing.",
  answerFirstSummaryLabel: "Answer-first summary",
  answerFirstSummaryBody:
    "Choose Replicate when the product needs model APIs, prediction objects, sync or async execution, and webhook-driven backend workflows. Choose AnyCap when the agent is already chosen and you want one runtime that equips it with multimodal capabilities plus artifact delivery instead of another provider integration project.",
  comparisonTitle: "Side-by-side comparison",
  comparisonHeaders: { dimension: "Dimension", anycap: "AnyCap", replicate: "Replicate" },
  comparisonRows: [
    {
      dimension: "Primary job",
      anycap:
        "Agent capability runtime that gives existing agents a shared execution layer across media, web, storage, and publishing.",
      replicate:
        "Model API and deployment platform for running community models, official models, and dedicated deployments through predictions.",
    },
    {
      dimension: "Integration target",
      anycap:
        "Claude Code, Cursor, Codex, OpenClaw, Manus, and similar agent shells that need one shared capability layer.",
      replicate:
        "Your own backend, product workflow, or script that directly calls an inference API and manages the request lifecycle itself.",
    },
    {
      dimension: "Execution model",
      anycap:
        "One CLI, one auth flow, and one command surface across image, video, music, understanding, search, storage, and publishing.",
      replicate:
        "Predictions API with sync and async modes, status polling, prediction IDs, and webhook-driven completion for longer jobs.",
    },
    {
      dimension: "Model surface",
      anycap: "Curated capability layer that keeps the agent interface consistent across supported capabilities.",
      replicate:
        "Broad inference platform where teams choose specific models, versions, or private deployments and wire those APIs into their own stack.",
    },
    {
      dimension: "Artifact handling",
      anycap:
        "Drive and Page keep outputs shareable from the same product surface, so generation can flow into storage and publishing without another service.",
      replicate:
        "Prediction objects and web URLs are available, but durable asset storage, sharing, and publishing are decisions your product stack still owns.",
    },
    {
      dimension: "Best fit",
      anycap:
        "Best when the agent shell is already chosen and the missing layer is capability access plus delivery workflows.",
      replicate:
        "Best when the team is building a custom application backend around model inference, deployments, and webhook orchestration.",
    },
  ],
  benchmarkTitle: "Practical benchmark: zero to first image",
  benchmarkIntro:
    "The table below compares what it takes to go from zero setup to generating the first image in a Claude Code, Cursor, or Codex agent workflow.",
  benchmarkHeaders: { metric: "Metric", anycap: "AnyCap", replicate: "Replicate" },
  benchmarkRows: [
    {
      metric: "Commands to first image",
      anycap: "3 (install + login + generate)",
      replicate: "pip install + API key setup + Python script + model version lookup",
    },
    {
      metric: "Auth flows required",
      anycap: "1 (AnyCap login)",
      replicate: "1 API token, but model versioning and input schema differ per model",
    },
    {
      metric: "Agent integration required",
      anycap: "Skill file auto-discovery",
      replicate: "Custom Python script or API wrapper",
    },
    {
      metric: "Adding video after image",
      anycap: "Same CLI, same auth: `anycap video generate`",
      replicate: "Find a video model, learn its input schema, add new prediction code",
    },
    {
      metric: "Free credit to start",
      anycap: "$5 free credit, no card required",
      replicate: "Pay-per-prediction, pricing varies by model and hardware tier",
    },
  ],
  strengthsTitleLeft: "Why teams choose AnyCap",
  strengthsTitleRight: "Why teams choose Replicate",
  strengthsLeft: [
    "One runtime surface can equip multiple agent environments without rebuilding media integrations from scratch in each one.",
    "The public capability inventory goes beyond generation into understanding, web retrieval, storage, and publishing, which is useful when an agent must complete the whole task.",
    "That makes AnyCap a better fit for operator simplicity and cross-agent reuse than a media API alone.",
  ],
  strengthsRight: [
    "Replicate's docs explicitly support both synchronous and asynchronous prediction flows, which is useful when the product team needs request-level control.",
    "The public docs distinguish community models, official models, and dedicated deployments, which is a strong fit for teams building product infrastructure around model choice.",
    "Webhook support makes Replicate a clean backend building block for applications that already have their own job system and asset pipeline.",
  ],
  useCasesTitle: "Best fit by use case",
  useCases: [
    {
      eyebrow: "Choose AnyCap if",
      title: "The runtime needs to travel with the team across agent products.",
      body:
        "AnyCap is stronger when the same capability layer should work in Codex, Cursor, Claude Code, or another agent shell without rebuilding the stack for each environment.",
    },
    {
      eyebrow: "Choose Replicate if",
      title: "Your product backend wants explicit control over media jobs.",
      body:
        "Replicate is the better fit when queue state, webhook handling, and direct endpoint integration are part of your own product architecture and you do not need a broader agent runtime layer.",
    },
    {
      eyebrow: "Choose AnyCap if",
      title: "The workflow includes delivery, not just generation.",
      body:
        "AnyCap is stronger when the artifact must become a share link, a hosted page, or another agent input right after generation instead of stopping at one API response.",
    },
    {
      eyebrow: "Choose Replicate if",
      title: "The work is mostly model infrastructure.",
      body:
        "Replicate is a clean choice when your team mainly cares about direct model access, async execution reliability, and media-focused backend primitives rather than search, storage, or publishing workflows.",
    },
  ],
  methodTitle: "How this comparison was reviewed",
  methodBody: [
    "The Replicate side of this page was reviewed against the public docs available on April 8, 2026. The claims here are intentionally narrow and verifiable: Replicate supports create-prediction flows, synchronous and asynchronous request handling, webhooks, and custom deployments.",
    "The AnyCap side of the comparison is based on published AnyCap pages for the CLI, installation flow, capability runtime, Drive, and pricing. The page only uses public claims that are already visible in the product surface.",
  ],
  methodologyNoteLabel: "Methodology note",
  methodologyNoteBody:
    "This page compares layer fit, not total product breadth. If Replicate changes prediction or deployment behavior later, or AnyCap changes its capability inventory, the page should be updated to stay tied to current public documentation.",
  sourceTitle: "Source notes",
  sourceLinks: [
    {
      label: "Replicate create a prediction",
      href: "https://replicate.com/docs/topics/predictions/create-a-prediction",
      note: "Prediction endpoints, sync vs async modes, prediction IDs, and web URLs.",
    },
    {
      label: "Replicate receive webhooks",
      href: "https://replicate.com/docs/topics/webhooks/receive-webhook/",
      note: "Webhook behavior for completed predictions and output events.",
    },
    {
      label: "Replicate custom deployments",
      href: "https://replicate.com/docs/guides/deploy-a-custom-model",
      note: "Dedicated deployment path when teams want production-grade model control.",
    },
    {
      label: "AnyCap CLI overview",
      href: "/cli",
      note: "One CLI and one auth flow across multiple agent environments.",
    },
    {
      label: "AnyCap Drive",
      href: "/capabilities/drive",
      note: "Storage and share-link workflows for artifacts that need to survive beyond one run.",
    },
    {
      label: "Install AnyCap",
      href: "/guides/install-anycap",
      note: "Published setup path for Codex, Cursor, Claude Code, and adjacent agent products.",
    },
  ],
  relatedTitle: "Related pages",
  relatedPages: [
    {
      href: "/glossary/agent-capability-runtime",
      eyebrow: "Glossary",
      title: "Agent Capability Runtime",
      body: "Read the category definition that explains why AnyCap and Replicate are not the same layer.",
    },
    {
      href: "/compare/anycap-vs-fal-ai",
      eyebrow: "Compare",
      title: "AnyCap vs fal.ai",
      body: "Compare AnyCap to another media API platform that is stronger on queue-backed generation workflows.",
    },
    {
      href: "/capabilities/drive",
      eyebrow: "Product",
      title: "AnyCap Drive",
      body: "See the storage and sharing layer that makes AnyCap more than a direct API wrapper.",
    },
    {
      href: "/guides/install-anycap",
      eyebrow: "Start here",
      title: "Install AnyCap",
      body: "Validate the runtime directly in your own agent workflow instead of staying in comparison mode.",
    },
  ],
  faqTitle: "FAQ",
  faqItems: [
    {
      question: "Is Replicate a direct replacement for AnyCap?",
      answer:
        "No. Replicate is a model API platform. AnyCap is a capability runtime for existing agents. Teams compare them when they are deciding whether the missing layer is app-level inference infrastructure or agent-level capability access.",
    },
    {
      question: "What is the biggest workflow difference between AnyCap and Replicate?",
      answer:
        "Replicate expects your application or script to own the prediction lifecycle. AnyCap expects the agent workflow to stay in one CLI-first runtime that already includes capability access plus artifact delivery paths.",
    },
    {
      question: "Does Replicate support async jobs and webhooks?",
      answer:
        "Yes. Replicate's public docs describe synchronous and asynchronous prediction modes, prediction IDs, and webhook notifications for completed outputs. That is one of its clearest strengths as a backend inference layer.",
    },
    {
      question: "When is AnyCap the cleaner choice?",
      answer:
        "When the team already has agents in Codex, Cursor, Claude Code, or similar environments and wants those agents to gain a broader capability surface quickly without building a separate inference and artifact pipeline.",
    },
    {
      question: "What is the simplest rule of thumb?",
      answer:
        "If your product backend needs model APIs, choose Replicate. If your agents need a shared runtime so they can actually finish multimodal work, choose AnyCap.",
    },
  ],
  ctas: [
    { href: "/guides/install-anycap", label: "Install AnyCap", variant: "primary" },
    { href: "/cli", label: "CLI Overview", variant: "secondary" },
    { href: "/for/codex", label: "See Agent Use Cases", variant: "secondary" },
  ],
};

const ptBr: ComparePageData = {
  ...en,
  breadcrumbItems: [
    { name: "Início", href: "/" },
    { name: "Comparar", href: "/compare", unlinkable: true },
    { name: "AnyCap vs Replicate" },
  ],
  eyebrow: "Comparar",
  metadata: {
    title: "AnyCap vs Replicate — runtime de capacidades para agentes vs plataforma de API de modelos",
    description:
      "Compare o AnyCap e o Replicate. O Replicate é uma plataforma de inferência e deploy de modelos, baseada em predictions, webhooks e backends de aplicação. O AnyCap é um runtime de capacidades para múltiplos agentes, como Codex, Cursor e Claude Code.",
    openGraphTitle: "AnyCap vs Replicate — runtime de capacidades para agentes vs plataforma de API de modelos",
    openGraphDescription:
      "Veja quando o Replicate é a camada certa de API de modelos e quando o AnyCap é a camada de capacidades mais simples sobre agentes já existentes.",
  },
  lastUpdatedLabel: "8 de abril de 2026",
  heroIntro:
    "AnyCap vs Replicate é uma decisão de camada de stack, não um duelo entre produtos equivalentes. O Replicate funciona melhor quando o backend da aplicação precisa de controle direto sobre inferência de modelos, ciclo de vida de predictions, deployments e webhooks. O AnyCap é a escolha mais forte quando os agentes já existem e a camada que falta é acesso a capacidades como imagem, vídeo, busca, armazenamento e publicação.",
  answerFirstSummaryBody:
    "Escolha o Replicate quando o produto precisa de APIs de modelos, objetos de prediction, execução síncrona ou assíncrona e workflows de backend guiados por webhook. Escolha o AnyCap quando o agente já foi definido e você quer um runtime único que o equipa com capacidades multimodais e entrega de artefatos, em vez de mais um projeto de integração com provedor.",
  comparisonRows: [
    {
      dimension: "Função principal",
      anycap:
        "Runtime de capacidades para agentes que adiciona uma camada compartilhada de execução para mídia, web, armazenamento e publicação.",
      replicate:
        "Plataforma de API de modelos e deploy para executar modelos da comunidade, modelos oficiais e deployments dedicados por meio de predictions.",
    },
    {
      dimension: "Destino de integração",
      anycap:
        "Claude Code, Cursor, Codex, OpenClaw, Manus e outras shells de agente que precisam de uma camada compartilhada de capacidades.",
      replicate:
        "Seu próprio backend, fluxo de produto ou script que chama uma API de inferência diretamente e controla o ciclo de vida da requisição.",
    },
    {
      dimension: "Modelo de execução",
      anycap:
        "Um CLI, um fluxo de autenticação e uma interface única para imagem, vídeo, música, entendimento, busca, armazenamento e publicação.",
      replicate:
        "API de predictions com modos síncrono e assíncrono, polling de status, IDs de prediction e finalização via webhook para jobs mais longos.",
    },
    {
      dimension: "Superfície de modelos",
      anycap:
        "Camada de capacidades curada, mantendo a interface do agente consistente entre as capacidades suportadas.",
      replicate:
        "Plataforma ampla de inferência em que a equipe escolhe modelos, versões ou deployments privados e conecta essas APIs ao próprio stack.",
    },
    {
      dimension: "Tratamento de artefatos",
      anycap:
        "Drive e Page mantêm os resultados compartilháveis na mesma superfície do produto, então geração pode seguir para armazenamento e publicação sem outro serviço.",
      replicate:
        "Os objetos de prediction e as URLs web existem, mas armazenamento durável, compartilhamento e publicação continuam sendo decisões do stack da aplicação.",
    },
    {
      dimension: "Melhor encaixe",
      anycap:
        "Melhor quando a shell do agente já foi escolhida e o que falta é acesso a capacidades e fluxos de entrega.",
      replicate:
        "Melhor quando a equipe está construindo um backend customizado em torno de inferência de modelos, deployments e orquestração por webhook.",
    },
  ],
  benchmarkIntro:
    "A tabela abaixo compara o que é necessário para sair do zero até gerar a primeira imagem em um fluxo de agente no Claude Code, Cursor ou Codex.",
  benchmarkRows: [
    {
      metric: "Comandos até a primeira imagem",
      anycap: "3 (instalar + login + gerar)",
      replicate: "pip install + configuração de API key + script Python + busca da versão do modelo",
    },
    {
      metric: "Fluxos de auth necessários",
      anycap: "1 (login no AnyCap)",
      replicate: "1 token de API, mas versionamento e schema de input variam por modelo",
    },
    {
      metric: "Integração com agente exigida",
      anycap: "Descoberta automática via arquivo de skill",
      replicate: "Script Python próprio ou wrapper de API",
    },
    {
      metric: "Adicionar vídeo depois da imagem",
      anycap: "Mesmo CLI, mesma autenticação: `anycap video generate`",
      replicate: "Encontrar um modelo de vídeo, aprender o schema de input e adicionar novo código de prediction",
    },
    {
      metric: "Crédito inicial grátis",
      anycap: "US$ 5 de crédito grátis, sem cartão",
      replicate: "Pay-per-prediction, com preço variando por modelo e hardware",
    },
  ],
  strengthsTitleLeft: "Por que as equipes escolhem o AnyCap",
  strengthsTitleRight: "Por que as equipes escolhem o Replicate",
  strengthsLeft: [
    "Uma única superfície de runtime consegue equipar vários ambientes de agente sem reescrever integrações de mídia em cada um.",
    "O inventário público de capacidades vai além de geração e inclui entendimento, web retrieval, armazenamento e publicação, o que ajuda quando o agente precisa concluir a tarefa inteira.",
    "Isso torna o AnyCap mais adequado para simplicidade operacional e reaproveitamento entre agentes do que uma API de mídia isolada.",
  ],
  strengthsRight: [
    "A documentação do Replicate suporta explicitamente fluxos síncronos e assíncronos de prediction, o que é útil quando a equipe de produto precisa de controle no nível da requisição.",
    "A documentação pública separa modelos da comunidade, modelos oficiais e deployments dedicados, algo forte para quem está construindo infraestrutura de produto em torno da escolha de modelos.",
    "O suporte a webhooks faz do Replicate um bloco limpo de backend para aplicações que já possuem seu próprio sistema de jobs e pipeline de artefatos.",
  ],
  useCases: [
    {
      eyebrow: "Escolha o AnyCap se",
      title: "O runtime precisa acompanhar a equipe entre produtos de agente.",
      body:
        "O AnyCap é mais forte quando a mesma camada de capacidades deve funcionar no Codex, Cursor, Claude Code ou outra shell sem reescrever o stack para cada ambiente.",
    },
    {
      eyebrow: "Escolha o Replicate se",
      title: "Seu backend quer controle explícito sobre jobs de mídia.",
      body:
        "O Replicate é o melhor encaixe quando estado de fila, tratamento de webhook e integração direta com endpoints fazem parte da arquitetura do produto e você não precisa de uma camada mais ampla de runtime de agente.",
    },
    {
      eyebrow: "Escolha o AnyCap se",
      title: "O fluxo inclui entrega, não só geração.",
      body:
        "O AnyCap é mais forte quando o artefato precisa virar link compartilhável, página hospedada ou outro input para agente logo depois da geração, em vez de parar em uma única resposta de API.",
    },
    {
      eyebrow: "Escolha o Replicate se",
      title: "O trabalho é principalmente infraestrutura de modelo.",
      body:
        "O Replicate é uma escolha limpa quando a equipe se importa principalmente com acesso direto a modelos, confiabilidade de execução assíncrona e primitives de backend focadas em mídia, e não com busca, armazenamento ou publicação.",
    },
  ],
  methodBody: [
    "O lado do Replicate nesta página foi revisado com base na documentação pública disponível em 8 de abril de 2026. As alegações aqui são intencionalmente estreitas e verificáveis: o Replicate oferece fluxos create-prediction, tratamento síncrono e assíncrono, webhooks e custom deployments.",
    "O lado do AnyCap se baseia nas páginas públicas do produto sobre CLI, instalação, runtime de capacidades, Drive e pricing. A página usa apenas alegações já visíveis publicamente na superfície do produto.",
  ],
  methodologyNoteBody:
    "Esta página compara encaixe de camada, não a amplitude total de produto. Se o Replicate mudar o comportamento de predictions ou deployments mais tarde, ou se o AnyCap mudar seu inventário de capacidades, a página deve ser atualizada para permanecer alinhada à documentação pública atual.",
  sourceLinks: [
    {
      label: "Replicate create a prediction",
      href: "https://replicate.com/docs/topics/predictions/create-a-prediction",
      note: "Endpoints de prediction, modos sync e async, IDs de prediction e URLs web.",
    },
    {
      label: "Replicate receive webhooks",
      href: "https://replicate.com/docs/topics/webhooks/receive-webhook/",
      note: "Comportamento de webhook para predictions concluídas e eventos de saída.",
    },
    {
      label: "Replicate custom deployments",
      href: "https://replicate.com/docs/guides/deploy-a-custom-model",
      note: "Caminho de deployment dedicado quando a equipe quer controle de modelo em produção.",
    },
    {
      label: "Visão geral do AnyCap CLI",
      href: "/cli",
      note: "Um CLI e um fluxo de autenticação para vários ambientes de agente.",
    },
    {
      label: "AnyCap Drive",
      href: "/capabilities/drive",
      note: "Fluxos de armazenamento e links compartilháveis para artefatos que precisam sobreviver além de uma execução.",
    },
    {
      label: "Instalar o AnyCap",
      href: "/guides/install-anycap",
      note: "Fluxo de setup publicado para Codex, Cursor, Claude Code e produtos de agente próximos.",
    },
  ],
  relatedPages: [
    {
      href: "/glossary/agent-capability-runtime",
      eyebrow: "Glossário",
      title: "Agent Capability Runtime",
      body: "Leia a definição da categoria para entender por que AnyCap e Replicate não são a mesma camada.",
    },
    {
      href: "/compare/anycap-vs-fal-ai",
      eyebrow: "Comparar",
      title: "AnyCap vs fal.ai",
      body: "Compare o AnyCap com outra plataforma de API de mídia mais forte em fluxos de geração orientados por fila.",
    },
    {
      href: "/capabilities/drive",
      eyebrow: "Produto",
      title: "AnyCap Drive",
      body: "Veja a camada de armazenamento e compartilhamento que faz o AnyCap ir além de um wrapper de API direta.",
    },
    {
      href: "/guides/install-anycap",
      eyebrow: "Comece aqui",
      title: "Instalar o AnyCap",
      body: "Valide o runtime diretamente no seu próprio fluxo de agente em vez de ficar só na comparação.",
    },
  ],
  faqItems: [
    {
      question: "O Replicate substitui o AnyCap diretamente?",
      answer:
        "Não. O Replicate é uma plataforma de API de modelos. O AnyCap é um runtime de capacidades para agentes já existentes. As equipes comparam os dois quando precisam decidir se a camada que falta é infraestrutura de inferência da aplicação ou acesso a capacidades no nível do agente.",
    },
    {
      question: "Qual é a maior diferença de workflow entre AnyCap e Replicate?",
      answer:
        "O Replicate espera que sua aplicação ou script assuma o ciclo de vida da prediction. O AnyCap espera que o fluxo do agente permaneça em um runtime CLI-first que já inclui acesso a capacidades e caminhos de entrega de artefatos.",
    },
    {
      question: "O Replicate suporta jobs assíncronos e webhooks?",
      answer:
        "Sim. A documentação pública do Replicate descreve modos de prediction síncronos e assíncronos, IDs de prediction e notificações por webhook para outputs concluídos. Esse é um dos pontos fortes mais claros da plataforma como camada de inferência de backend.",
    },
    {
      question: "Quando o AnyCap é a escolha mais simples?",
      answer:
        "Quando a equipe já usa agentes em ferramentas de desenvolvimento e quer que esses agentes ganhem capacidade multimodal e entrega de artefatos por meio de um runtime único, sem outro projeto de integração com API.",
    },
    {
      question: "Qual é a regra mais simples de decisão?",
      answer:
        "Se o backend do produto precisa de APIs de modelo, escolha o Replicate. Se seus agentes precisam de um runtime compartilhado para realmente concluir trabalho multimodal, escolha o AnyCap.",
    },
  ],
};

const contentByLocale: Record<SiteLocale, ComparePageData> = {
  en,
  "pt-br": ptBr,
  id: en,
};

export function getAnyCapVsReplicateMetadata(locale: SiteLocale): Metadata {
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

export function getAnyCapVsReplicatePageData(locale: SiteLocale) {
  return contentByLocale[locale] ?? contentByLocale.en;
}
