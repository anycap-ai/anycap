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
    "AnyCap vs Replicate is a stack-layer decision, not a same-category fight. Replicate is strongest when your application backend needs explicit control over model inference, prediction lifecycles, hardware-backed deployments, request IDs, and webhook-driven completion events. That is the right pattern when your product team owns queue orchestration, retry policy, and downstream asset routing inside application code. AnyCap is stronger when agents already exist in tools such as Codex, Cursor, or Claude Code and the missing layer is operational capability access. Instead of adding another provider-specific integration project, teams install one runtime and give agents a shared interface for generation, understanding, retrieval, storage, and publishing so multimodal work can actually finish end to end. The architectural choice is mainly about execution ownership: backend-managed prediction pipelines versus runtime-managed agent capabilities. Once ownership is clear, tool selection usually becomes straightforward and faster to defend in technical review.",
  answerFirstSummaryLabel: "Answer-first summary",
  answerFirstSummaryBody:
    "Choose Replicate when your product architecture is centered on backend-owned model jobs: direct API calls, prediction objects, synchronous and asynchronous execution modes, webhook callbacks, and deployment-level control. Choose AnyCap when the agent shell is already chosen and your bottleneck is capability execution inside agent workflows rather than backend inference plumbing. In that case, one runtime usually beats multiple ad hoc integrations because it standardizes auth, commands, and artifact handoff across image, video, search, storage, and publishing. The practical rule is simple: backend-centric inference platform needs Replicate; agent-centric execution layer needs AnyCap. If one architecture review cannot clearly pick a side, the team is usually mixing two different layers of responsibility. Separate those layers first, then reassess cost, speed, and operational risk with each option, including who owns monitoring, incident response, and long-term integration maintenance after launch.",
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
        "No. Replicate is a model API platform built for backend-managed inference flows, while AnyCap is a capability runtime designed for agents that already exist in developer environments. Teams compare them because both can appear in multimodal roadmaps, but they solve different architectural gaps. If your missing layer is application-level prediction infrastructure, Replicate is usually the fit. If your missing layer is agent-level capability access and delivery, AnyCap is usually the fit.",
    },
    {
      question: "What is the biggest workflow difference between AnyCap and Replicate?",
      answer:
        "Replicate expects your application stack to own the prediction lifecycle directly: create requests, track status, handle async callbacks, and decide what happens after outputs arrive. AnyCap keeps the workflow centered in one CLI-first runtime that agents can call during execution without rewriting each capability as a separate provider integration. In practice, the difference is where complexity lives: backend orchestration in your app with Replicate, or standardized agent execution with AnyCap.",
    },
    {
      question: "Does Replicate support async jobs and webhooks?",
      answer:
        "Yes. Replicate's public documentation describes synchronous and asynchronous prediction modes, prediction IDs, status polling, and webhook notifications for completed outputs. That feature set is a major reason teams choose it as an inference layer when they need queue-aware processing and explicit backend ownership. It is especially useful when workloads are long-running and application logic depends on completion events instead of blocking calls.",
    },
    {
      question: "When is AnyCap the cleaner choice?",
      answer:
        "AnyCap is usually cleaner when your team already operates through agents in environments like Codex, Cursor, or Claude Code and wants those agents to gain capabilities quickly without building a separate inference and artifact pipeline per provider. One runtime can standardize install, auth, invocation, and delivery paths across multimodal actions. That reduces integration drift and makes cross-agent operations easier to maintain as workflows expand.",
    },
    {
      question: "What is the simplest rule of thumb?",
      answer:
        "If your product backend needs model APIs and explicit control over prediction jobs, choose Replicate. If your agents need a shared runtime so they can execute and deliver multimodal work without repeated provider glue code, choose AnyCap. When teams are unsure, mapping where execution complexity should live, backend code or agent runtime, usually makes the decision obvious within one architecture review.",
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
    "AnyCap vs Replicate é uma decisão de camada de stack, não um duelo entre produtos equivalentes. O Replicate é mais forte quando o backend da aplicação precisa controlar inferência de modelos de forma explícita, incluindo ciclo de vida de predictions, deployments, IDs de execução e conclusão por webhook. Esse caminho funciona bem quando o time de produto já opera filas, retries e roteamento de artefatos dentro do próprio código. O AnyCap é mais forte quando os agentes já existem em ferramentas como Codex, Cursor ou Claude Code e a lacuna principal é acesso operacional a capacidades. Em vez de abrir outro projeto de integração por provedor, a equipe instala um runtime único e equipa os agentes com geração, entendimento, retrieval, armazenamento e publicação por uma interface compartilhada.",
  answerFirstSummaryBody:
    "Escolha o Replicate quando a arquitetura do produto é centrada em jobs de inferência controlados pelo backend: chamadas diretas de API, objetos de prediction, execução síncrona e assíncrona, callbacks por webhook e controle de deployment. Escolha o AnyCap quando a shell do agente já foi definida e o gargalo está na execução de capacidades dentro do workflow do agente, não na infraestrutura de inferência da aplicação. Nesse cenário, um runtime único costuma ser melhor do que várias integrações ad hoc porque padroniza autenticação, comandos e entrega de artefatos entre imagem, vídeo, busca, armazenamento e publicação.",
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
        "Não. O Replicate é uma plataforma de API de modelos para fluxos de inferência controlados no backend, enquanto o AnyCap é um runtime de capacidades para agentes que já estão em uso nas ferramentas de desenvolvimento. As equipes comparam os dois porque ambos aparecem em roadmaps multimodais, mas cada um resolve uma lacuna diferente. Se falta infraestrutura de prediction no app, Replicate tende a ser o encaixe. Se falta execução de capacidades no agente, AnyCap tende a ser mais direto.",
    },
    {
      question: "Qual é a maior diferença de workflow entre AnyCap e Replicate?",
      answer:
        "O Replicate espera que sua aplicação assuma o ciclo de vida completo da prediction: criar requisições, acompanhar status, tratar callbacks e decidir o destino dos outputs. O AnyCap mantém o fluxo dentro de um runtime CLI-first que o agente pode chamar durante a execução, sem transformar cada capability em uma integração separada de provedor. Na prática, a diferença principal é onde a complexidade operacional fica: backend da aplicação com Replicate, runtime compartilhado de agente com AnyCap.",
    },
    {
      question: "O Replicate suporta jobs assíncronos e webhooks?",
      answer:
        "Sim. A documentação pública do Replicate descreve modos síncrono e assíncrono, IDs de prediction, polling de status e notificações por webhook para outputs concluídos. Esse conjunto é um dos motivos centrais para adotá-lo como camada de inferência quando a equipe precisa de processamento orientado a fila e controle explícito de backend. O valor aumenta em workloads longos, nos quais eventos de conclusão são melhores que chamadas bloqueantes.",
    },
    {
      question: "Quando o AnyCap é a escolha mais simples?",
      answer:
        "O AnyCap costuma ser mais simples quando a equipe já opera agentes em ferramentas de desenvolvimento e quer ampliar capacidades sem abrir um projeto novo de integração por API. Um runtime compartilhado padroniza instalação, autenticação, invocação e entrega entre ações multimodais. Isso reduz deriva de integração, melhora previsibilidade entre agentes e acelera rollout para fluxos que precisam ir além de geração isolada.",
    },
    {
      question: "Qual é a regra mais simples de decisão?",
      answer:
        "Se o backend do produto precisa de APIs de modelo e controle explícito de jobs, escolha o Replicate. Se seus agentes precisam de um runtime compartilhado para executar e entregar trabalho multimodal sem multiplicar glue code por provedor, escolha o AnyCap. Quando há dúvida, mapear onde a complexidade deve morar, backend da aplicação ou runtime de agente, normalmente resolve a decisão rapidamente.",
    },
  ],
};

const id: ComparePageData = {
  breadcrumbItems: [
    { name: "Beranda", href: "/" },
    { name: "Bandingkan", href: "/compare", unlinkable: true },
    { name: "AnyCap vs Replicate" },
  ],
  eyebrow: "Bandingkan",
  metadata: {
    title: "AnyCap vs Replicate — runtime kemampuan agen vs platform API model",
    description:
      "Bandingkan AnyCap dan Replicate. Replicate adalah platform inferensi dan deployment model yang dibangun di sekitar prediksi, webhook, dan backend aplikasi. AnyCap adalah runtime kemampuan lintas-agen untuk Codex, Cursor, Claude Code, dan alur kerja agen serupa.",
    openGraphTitle: "AnyCap vs Replicate — runtime kemampuan agen vs platform API model",
    openGraphDescription:
      "Lihat kapan Replicate menjadi lapisan API model yang tepat dan kapan AnyCap menjadi lapisan kemampuan yang lebih ringkas di sekitar agen yang sudah ada.",
  },
  articleJsonLd: createTechArticleJsonLd({
    headline: "AnyCap vs Replicate — runtime kemampuan agen vs platform API model",
    description:
      "Panduan perbandingan bagi tim yang memutuskan apakah mereka memerlukan platform inferensi model Replicate atau runtime kemampuan lintas-agen AnyCap.",
    path: ANYCAP_VS_REPLICATE_PATH,
    locale: "id",
    about: [
      "AnyCap",
      "Replicate",
      "Runtime kemampuan agen",
      "API inferensi model",
      "Alur kerja webhook",
    ],
    keywords: [
      "anycap vs replicate",
      "alternatif replicate untuk agen",
      "replicate vs anycap",
      "api model vs runtime kemampuan",
      "replicate untuk agen coding",
    ],
    datePublished: lastUpdatedIso,
    dateModified: lastUpdatedIso,
  }),
  faqJsonLd: createFaqPageJsonLd([
    {
      question: "Apakah Replicate pengganti langsung untuk AnyCap?",
      answer:
        "Tidak. Replicate adalah platform API model. AnyCap adalah runtime kemampuan untuk agen yang sudah ada. Tim membandingkannya ketika memutuskan apakah lapisan yang hilang adalah infrastruktur inferensi tingkat aplikasi atau akses kemampuan tingkat agen.",
    },
    {
      question: "Apa perbedaan alur kerja terbesar antara AnyCap dan Replicate?",
      answer:
        "Replicate mengharapkan aplikasi atau skrip Anda memiliki siklus hidup prediksi. AnyCap mengharapkan alur kerja agen tetap dalam satu runtime berbasis CLI yang sudah mencakup akses kemampuan ditambah jalur pengiriman artefak.",
    },
    {
      question: "Apakah Replicate mendukung pekerjaan async dan webhook?",
      answer:
        "Ya. Dokumentasi publik Replicate menjelaskan mode prediksi sinkron dan asinkron, ID prediksi, serta notifikasi webhook untuk output yang selesai. Itu salah satu kekuatan terjelasnya sebagai lapisan inferensi backend.",
    },
    {
      question: "Kapan AnyCap menjadi pilihan yang lebih ringkas?",
      answer:
        "Ketika tim sudah memiliki agen di Codex, Cursor, Claude Code, atau lingkungan serupa dan ingin agen tersebut memperoleh permukaan kemampuan yang lebih luas dengan cepat tanpa membangun pipeline inferensi dan artefak terpisah.",
    },
    {
      question: "Apa aturan praktis paling sederhana?",
      answer:
        "Jika backend produk Anda memerlukan API model, pilih Replicate. Jika agen Anda memerlukan runtime bersama agar benar-benar menyelesaikan pekerjaan multimodal, pilih AnyCap.",
    },
  ]),
  lastUpdatedLabel: "8 April 2026",
  heroTitle: ["AnyCap vs", "Replicate"],
  heroIntro:
    "AnyCap vs Replicate adalah keputusan lapisan stack, bukan pertarungan kategori yang sama. Replicate paling kuat ketika backend aplikasi Anda memerlukan kontrol eksplisit atas inferensi model, siklus hidup prediksi, deployment berbasis perangkat keras, ID permintaan, dan peristiwa penyelesaian yang didorong webhook. Itu pola yang tepat ketika tim produk Anda memiliki orkestrasi antrean, kebijakan coba ulang, dan perutean aset hilir di dalam kode aplikasi. AnyCap lebih kuat ketika agen sudah ada di alat seperti Codex, Cursor, atau Claude Code dan lapisan yang hilang adalah akses kemampuan operasional. Alih-alih menambahkan proyek integrasi khusus penyedia lain, tim memasang satu runtime dan memberi agen antarmuka bersama untuk generasi, pemahaman, pengambilan, penyimpanan, dan publikasi sehingga pekerjaan multimodal benar-benar bisa selesai dari ujung ke ujung. Pilihan arsitektur utamanya tentang kepemilikan eksekusi: pipeline prediksi yang dikelola backend versus kemampuan agen yang dikelola runtime. Setelah kepemilikan jelas, pemilihan alat biasanya menjadi lugas dan lebih mudah dipertahankan dalam tinjauan teknis.",
  answerFirstSummaryLabel: "Ringkasan jawaban dulu",
  answerFirstSummaryBody:
    "Pilih Replicate ketika arsitektur produk Anda berpusat pada tugas model yang dimiliki backend: panggilan API langsung, objek prediksi, mode eksekusi sinkron dan asinkron, callback webhook, serta kontrol tingkat deployment. Pilih AnyCap ketika shell agen sudah dipilih dan hambatan Anda adalah eksekusi kemampuan di dalam alur kerja agen, bukan perpipaan inferensi backend. Dalam kasus itu, satu runtime biasanya mengalahkan beberapa integrasi ad hoc karena menstandarkan autentikasi, perintah, dan serah terima artefak untuk gambar, video, pencarian, penyimpanan, dan publikasi. Aturan praktisnya sederhana: platform inferensi berpusat backend memerlukan Replicate; lapisan eksekusi berpusat agen memerlukan AnyCap. Jika satu tinjauan arsitektur tidak bisa memilih sisi dengan jelas, tim biasanya mencampur dua lapisan tanggung jawab berbeda. Pisahkan lapisan itu dulu, lalu tinjau ulang biaya, kecepatan, dan risiko operasional untuk setiap opsi, termasuk siapa yang memiliki pemantauan, respons insiden, dan pemeliharaan integrasi jangka panjang setelah peluncuran.",
  comparisonTitle: "Perbandingan berdampingan",
  comparisonHeaders: { dimension: "Dimensi", anycap: "AnyCap", replicate: "Replicate" },
  comparisonRows: [
    {
      dimension: "Tugas utama",
      anycap:
        "Runtime kemampuan agen yang memberi agen yang sudah ada lapisan eksekusi bersama untuk media, web, penyimpanan, dan publikasi.",
      replicate:
        "Platform API model dan deployment untuk menjalankan model komunitas, model resmi, dan deployment khusus melalui prediksi.",
    },
    {
      dimension: "Target integrasi",
      anycap:
        "Claude Code, Cursor, Codex, OpenClaw, Manus, dan shell agen serupa yang memerlukan satu lapisan kemampuan bersama.",
      replicate:
        "Backend Anda sendiri, alur kerja produk, atau skrip yang memanggil API inferensi secara langsung dan mengelola siklus hidup permintaan sendiri.",
    },
    {
      dimension: "Model eksekusi",
      anycap:
        "Satu CLI, satu alur autentikasi, dan satu permukaan perintah untuk gambar, video, musik, pemahaman, pencarian, penyimpanan, dan publikasi.",
      replicate:
        "API prediksi dengan mode sinkron dan asinkron, polling status, ID prediksi, dan penyelesaian berbasis webhook untuk pekerjaan yang lebih panjang.",
    },
    {
      dimension: "Permukaan model",
      anycap: "Lapisan kemampuan kurasi yang menjaga antarmuka agen konsisten di seluruh kemampuan yang didukung.",
      replicate:
        "Platform inferensi luas di mana tim memilih model, versi, atau deployment pribadi tertentu dan menghubungkan API tersebut ke stack mereka sendiri.",
    },
    {
      dimension: "Penanganan artefak",
      anycap:
        "Drive dan Page menjaga output dapat dibagikan dari permukaan produk yang sama, sehingga generasi dapat mengalir ke penyimpanan dan publikasi tanpa layanan lain.",
      replicate:
        "Objek prediksi dan URL web tersedia, tetapi penyimpanan aset permanen, berbagi, dan publikasi tetap menjadi keputusan stack produk Anda.",
    },
    {
      dimension: "Paling cocok",
      anycap:
        "Terbaik ketika shell agen sudah dipilih dan lapisan yang hilang adalah akses kemampuan ditambah alur kerja pengiriman.",
      replicate:
        "Terbaik ketika tim membangun backend aplikasi kustom di sekitar inferensi model, deployment, dan orkestrasi webhook.",
    },
  ],
  benchmarkTitle: "Tolok ukur praktis: nol hingga gambar pertama",
  benchmarkIntro:
    "Tabel di bawah membandingkan apa yang diperlukan untuk beralih dari pengaturan nol hingga menghasilkan gambar pertama dalam alur kerja agen Claude Code, Cursor, atau Codex.",
  benchmarkHeaders: { metric: "Metrik", anycap: "AnyCap", replicate: "Replicate" },
  benchmarkRows: [
    {
      metric: "Perintah hingga gambar pertama",
      anycap: "3 (pasang + login + generate)",
      replicate: "pip install + pengaturan kunci API + skrip Python + pencarian versi model",
    },
    {
      metric: "Alur autentikasi yang diperlukan",
      anycap: "1 (login AnyCap)",
      replicate: "1 token API, tetapi versioning model dan skema input berbeda per model",
    },
    {
      metric: "Integrasi agen yang diperlukan",
      anycap: "Penemuan otomatis file skill",
      replicate: "Skrip Python kustom atau pembungkus API",
    },
    {
      metric: "Menambahkan video setelah gambar",
      anycap: "CLI yang sama, autentikasi yang sama: `anycap video generate`",
      replicate: "Temukan model video, pelajari skema inputnya, tambahkan kode prediksi baru",
    },
    {
      metric: "Kredit gratis untuk memulai",
      anycap: "$5 kredit gratis, tanpa kartu",
      replicate: "Bayar per prediksi, harga bervariasi menurut model dan tingkat perangkat keras",
    },
  ],
  strengthsTitleLeft: "Mengapa tim memilih AnyCap",
  strengthsTitleRight: "Mengapa tim memilih Replicate",
  strengthsLeft: [
    "Satu permukaan runtime dapat melengkapi beberapa lingkungan agen tanpa membangun ulang integrasi media dari awal di masing-masing.",
    "Inventaris kemampuan publik melampaui generasi menjadi pemahaman, pengambilan web, penyimpanan, dan publikasi, yang berguna ketika agen harus menyelesaikan seluruh tugas.",
    "Itu membuat AnyCap lebih cocok untuk kesederhanaan operasional dan penggunaan ulang lintas agen daripada sekadar API media.",
  ],
  strengthsRight: [
    "Dokumentasi Replicate secara eksplisit mendukung alur prediksi sinkron dan asinkron, yang berguna ketika tim produk memerlukan kontrol tingkat permintaan.",
    "Dokumentasi publik membedakan model komunitas, model resmi, dan deployment khusus, cocok kuat untuk tim yang membangun infrastruktur produk di sekitar pilihan model.",
    "Dukungan webhook menjadikan Replicate blok bangunan backend yang rapi untuk aplikasi yang sudah memiliki sistem tugas dan pipeline artefak sendiri.",
  ],
  useCasesTitle: "Paling cocok menurut kasus penggunaan",
  useCases: [
    {
      eyebrow: "Pilih AnyCap jika",
      title: "Runtime perlu mengikuti tim di berbagai produk agen.",
      body:
        "AnyCap lebih kuat ketika lapisan kemampuan yang sama harus berfungsi di Codex, Cursor, Claude Code, atau shell agen lain tanpa membangun ulang stack untuk setiap lingkungan.",
    },
    {
      eyebrow: "Pilih Replicate jika",
      title: "Backend produk Anda ingin kontrol eksplisit atas tugas media.",
      body:
        "Replicate lebih cocok ketika status antrean, penanganan webhook, dan integrasi endpoint langsung menjadi bagian dari arsitektur produk Anda sendiri dan Anda tidak memerlukan lapisan runtime agen yang lebih luas.",
    },
    {
      eyebrow: "Pilih AnyCap jika",
      title: "Alur kerja mencakup pengiriman, bukan hanya generasi.",
      body:
        "AnyCap lebih kuat ketika artefak harus menjadi tautan berbagi, halaman yang dihosting, atau input agen lain tepat setelah generasi, alih-alih berhenti pada satu respons API.",
    },
    {
      eyebrow: "Pilih Replicate jika",
      title: "Pekerjaan utamanya infrastruktur model.",
      body:
        "Replicate adalah pilihan yang rapi ketika tim Anda terutama peduli pada akses model langsung, keandalan eksekusi asinkron, dan primitif backend berfokus media, bukan alur pencarian, penyimpanan, atau publikasi.",
    },
  ],
  methodTitle: "Bagaimana perbandingan ini ditinjau",
  methodBody: [
    "Sisi Replicate pada halaman ini ditinjau terhadap dokumentasi publik yang tersedia pada 8 April 2026. Klaim di sini sengaja sempit dan dapat diverifikasi: Replicate mendukung alur create-prediction, penanganan permintaan sinkron dan asinkron, webhook, dan deployment khusus.",
    "Sisi AnyCap didasarkan pada halaman AnyCap yang dipublikasikan untuk CLI, alur instalasi, runtime kemampuan, Drive, dan harga. Halaman ini hanya menggunakan klaim publik yang sudah terlihat di permukaan produk.",
  ],
  methodologyNoteLabel: "Catatan metodologi",
  methodologyNoteBody:
    "Halaman ini membandingkan kecocokan lapisan, bukan keluasan produk total. Jika Replicate mengubah perilaku prediksi atau deployment nanti, atau AnyCap mengubah inventaris kemampuannya, halaman harus diperbarui agar tetap mengacu pada dokumentasi publik terkini.",
  sourceTitle: "Catatan sumber",
  sourceLinks: [
    {
      label: "Replicate create a prediction",
      href: "https://replicate.com/docs/topics/predictions/create-a-prediction",
      note: "Endpoint prediksi, mode sinkron vs asinkron, ID prediksi, dan URL web.",
    },
    {
      label: "Replicate receive webhooks",
      href: "https://replicate.com/docs/topics/webhooks/receive-webhook/",
      note: "Perilaku webhook untuk prediksi yang selesai dan peristiwa output.",
    },
    {
      label: "Replicate custom deployments",
      href: "https://replicate.com/docs/guides/deploy-a-custom-model",
      note: "Jalur deployment khusus ketika tim menginginkan kontrol model tingkat produksi.",
    },
    {
      label: "Ringkasan CLI AnyCap",
      href: "/cli",
      note: "Satu CLI dan satu alur autentikasi di berbagai lingkungan agen.",
    },
    {
      label: "AnyCap Drive",
      href: "/capabilities/drive",
      note: "Alur penyimpanan dan tautan berbagi untuk artefak yang perlu bertahan lebih dari satu eksekusi.",
    },
    {
      label: "Pasang AnyCap",
      href: "/guides/install-anycap",
      note: "Jalur pengaturan yang dipublikasikan untuk Codex, Cursor, Claude Code, dan produk agen terkait.",
    },
  ],
  relatedTitle: "Halaman terkait",
  relatedPages: [
    {
      href: "/glossary/agent-capability-runtime",
      eyebrow: "Glosarium",
      title: "Runtime kemampuan agen",
      body: "Baca definisi kategori yang menjelaskan mengapa AnyCap dan Replicate bukan lapisan yang sama.",
    },
    {
      href: "/compare/anycap-vs-fal-ai",
      eyebrow: "Bandingkan",
      title: "AnyCap vs fal.ai",
      body: "Bandingkan AnyCap dengan platform API media lain yang lebih kuat pada alur generasi berbasis antrean.",
    },
    {
      href: "/capabilities/drive",
      eyebrow: "Produk",
      title: "AnyCap Drive",
      body: "Lihat lapisan penyimpanan dan berbagi yang membuat AnyCap lebih dari pembungkus API langsung.",
    },
    {
      href: "/guides/install-anycap",
      eyebrow: "Mulai di sini",
      title: "Pasang AnyCap",
      body: "Validasi runtime langsung di alur kerja agen Anda sendiri alih-alih tetap dalam mode perbandingan.",
    },
  ],
  faqTitle: "FAQ",
  faqItems: [
    {
      question: "Apakah Replicate pengganti langsung untuk AnyCap?",
      answer:
        "Tidak. Replicate adalah platform API model yang dibangun untuk alur inferensi yang dikelola backend, sementara AnyCap adalah runtime kemampuan untuk agen yang sudah ada di lingkungan pengembang. Tim membandingkannya karena keduanya bisa muncul dalam peta jalan multimodal, tetapi mereka menutup celah arsitektur yang berbeda. Jika lapisan yang hilang adalah infrastruktur prediksi tingkat aplikasi, Replicate biasanya cocok. Jika lapisan yang hilang adalah akses kemampuan tingkat agen dan pengiriman, AnyCap biasanya cocok.",
    },
    {
      question: "Apa perbedaan alur kerja terbesar antara AnyCap dan Replicate?",
      answer:
        "Replicate mengharapkan stack aplikasi Anda memiliki siklus hidup prediksi secara langsung: membuat permintaan, melacak status, menangani callback asinkron, dan memutuskan apa yang terjadi setelah output tiba. AnyCap menjaga alur kerja berpusat pada satu runtime berbasis CLI yang dapat dipanggil agen selama eksekusi tanpa menulis ulang setiap kemampuan sebagai integrasi penyedia terpisah. Dalam praktik, perbedaannya adalah di mana kompleksitas berada: orkestrasi backend di aplikasi Anda dengan Replicate, atau eksekusi agen yang distandarkan dengan AnyCap.",
    },
    {
      question: "Apakah Replicate mendukung pekerjaan async dan webhook?",
      answer:
        "Ya. Dokumentasi publik Replicate menjelaskan mode prediksi sinkron dan asinkron, ID prediksi, polling status, dan notifikasi webhook untuk output yang selesai. Set fitur itu adalah alasan utama tim memilihnya sebagai lapisan inferensi ketika mereka memerlukan pemrosesan sadar antrean dan kepemilikan backend eksplisit. Ini terutama berguna ketika beban kerja berjalan lama dan logika aplikasi bergantung pada peristiwa penyelesaian alih-alih panggilan yang memblokir.",
    },
    {
      question: "Kapan AnyCap menjadi pilihan yang lebih ringkas?",
      answer:
        "AnyCap biasanya lebih ringkas ketika tim Anda sudah beroperasi melalui agen di lingkungan seperti Codex, Cursor, atau Claude Code dan ingin agen tersebut memperoleh kemampuan dengan cepat tanpa membangun pipeline inferensi dan artefak terpisah per penyedia. Satu runtime dapat menstandarkan pemasangan, autentikasi, pemanggilan, dan jalur pengiriman di berbagai tindakan multimodal. Itu mengurangi drift integrasi dan membuat operasi lintas agen lebih mudah dipelihara seiring berkembangnya alur kerja.",
    },
    {
      question: "Apa aturan praktis paling sederhana?",
      answer:
        "Jika backend produk Anda memerlukan API model dan kontrol eksplisit atas tugas prediksi, pilih Replicate. Jika agen Anda memerlukan runtime bersama agar dapat mengeksekusi dan mengirimkan pekerjaan multimodal tanpa mengulang kode perantara penyedia, pilih AnyCap. Ketika tim tidak yakin, memetakan di mana kompleksitas eksekusi seharusnya berada, kode backend atau runtime agen, biasanya membuat keputusan jelas dalam satu tinjauan arsitektur.",
    },
  ],
  ctas: [
    { href: "/guides/install-anycap", label: "Pasang AnyCap", variant: "primary" },
    { href: "/cli", label: "Ringkasan CLI", variant: "secondary" },
    { href: "/for/codex", label: "Lihat kasus penggunaan agen", variant: "secondary" },
  ],
};

const contentByLocale: Record<SiteLocale, ComparePageData> = {
  en,
  "pt-br": ptBr,
  id,
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
