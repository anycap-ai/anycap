import type { Metadata } from "next";
import { createFaqPageJsonLd, createTechArticleJsonLd } from "@/lib/schema";
import { getLocaleConfig, siteConfig, type SiteLocale } from "@/lib/site";

export const ANYCAP_VS_FAL_AI_PATH = "/compare/anycap-vs-fal-ai";

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
  comparisonHeaders: { dimension: string; anycap: string; fal: string };
  comparisonRows: readonly { dimension: string; anycap: string; fal: string }[];
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
    { name: "AnyCap vs fal.ai" },
  ],
  eyebrow: "Compare",
  metadata: {
    title: "AnyCap vs fal.ai — cross-agent runtime vs generative media API stack",
    description:
      "Compare AnyCap and fal.ai. fal.ai is a generative media API platform with synchronous calls, queue-backed async inference, webhooks, and API-key auth. AnyCap is a cross-agent capability runtime that packages multimodal workflows for Codex, Cursor, Claude Code, and similar agent environments.",
    openGraphTitle: "AnyCap vs fal.ai — cross-agent runtime vs generative media API stack",
    openGraphDescription:
      "See when fal.ai is the right media API layer and when AnyCap is the stronger runtime around existing agents.",
  },
  articleJsonLd: createTechArticleJsonLd({
    headline: "AnyCap vs fal.ai — cross-agent runtime vs generative media API stack",
    description:
      "Comparison guide for teams deciding whether they need fal.ai's media API platform or AnyCap's cross-agent capability runtime.",
    path: ANYCAP_VS_FAL_AI_PATH,
    about: [
      "AnyCap",
      "fal.ai",
      "Agent capability runtime",
      "Generative media API",
      "Webhook workflows",
    ],
    keywords: [
      "anycap vs fal ai",
      "fal ai alternative for agents",
      "fal ai vs anycap",
      "media api vs capability runtime",
      "fal ai for coding agents",
    ],
    datePublished: lastUpdatedIso,
    dateModified: lastUpdatedIso,
  }),
  faqJsonLd: createFaqPageJsonLd([
    {
      question: "Is fal.ai a direct AnyCap replacement?",
      answer:
        "No. fal.ai is a generative media API platform. AnyCap is a broader capability runtime for existing agents. The overlap is mainly around image and video generation, but the product category is different.",
    },
    {
      question: "What is the biggest workflow difference between AnyCap and fal.ai?",
      answer:
        "fal.ai expects your application stack to own the request lifecycle, webhook handling, and artifact pipeline. AnyCap packages that capability access into a CLI-first runtime for agents and adds storage and publishing workflows around the result.",
    },
    {
      question: "Does fal.ai support both sync and async inference?",
      answer:
        "Yes. fal's public docs describe direct synchronous requests, queue-backed async inference, and webhooks for completion notifications. That is one of the clearest reasons to pick fal when backend control matters.",
    },
    {
      question: "When is AnyCap the cleaner choice?",
      answer:
        "When the team already uses agents in developer tools and wants those agents to gain multimodal execution plus artifact delivery through one runtime rather than another direct API integration project.",
    },
    {
      question: "What is the simplest rule of thumb?",
      answer:
        "If you need a media API, choose fal.ai. If you need your agents to complete cross-modal work in one runtime, choose AnyCap.",
    },
  ]),
  lastUpdatedLabel: "April 8, 2026",
  heroTitle: ["AnyCap vs", "fal.ai"],
  heroIntro:
    "AnyCap vs fal.ai is a question about which layer your team wants to own. fal.ai is strongest when your backend needs queue-backed media APIs, direct endpoint control, webhook verification, and explicit job-state handling in application code. That model is ideal for product teams that already run their own orchestration, retries, and asset pipelines. AnyCap is stronger when agents already exist and the missing layer is operational capability access inside those agent workflows. Instead of rebuilding media integrations for each shell, teams use one runtime that packages multimodal execution with storage and publishing paths. The decision is less about raw model quality and more about where integration complexity should live in your architecture. In most cases, this decision also determines which team owns incident response for failed media tasks. Clarifying that ownership early prevents expensive rework when workflows scale.",
  answerFirstSummaryLabel: "Answer-first summary",
  answerFirstSummaryBody:
    "Choose fal.ai when your product stack needs direct media endpoints, queue-backed asynchronous execution, webhook-driven lifecycle control, and backend ownership of request orchestration. Choose AnyCap when your developers already work through agents and want those agents to gain media, web, storage, and publishing capabilities through one shared runtime. In that scenario, runtime standardization usually beats another low-level API integration because auth, commands, and artifact handling stay consistent across environments. The practical rule is simple: backend-centric media infrastructure points to fal.ai, agent-centric execution portability points to AnyCap. If the team cannot map ownership cleanly, the architecture is probably mixing both layers in one workflow. Split responsibilities first, then compare implementation cost, delivery speed, and incident complexity, including operational burden for retries, artifact retention, and post-failure recovery paths. This sequence prevents teams from optimizing the wrong layer.",
  comparisonTitle: "Side-by-side comparison",
  comparisonHeaders: { dimension: "Dimension", anycap: "AnyCap", fal: "fal.ai" },
  comparisonRows: [
    {
      dimension: "Primary job",
      anycap:
        "Agent capability runtime that gives existing agents a shared execution layer across media, web, storage, and publishing.",
      fal:
        "Generative media API platform centered on model endpoints, queue-backed async inference, webhooks, and developer-controlled integration.",
    },
    {
      dimension: "Request lifecycle",
      anycap:
        "One CLI and one auth flow abstract the request lifecycle so the agent can stay inside a stable capability surface.",
      fal:
        "fal supports direct synchronous calls, queue-backed async requests, and webhook completion, which is ideal when your backend wants explicit control over the lifecycle.",
    },
    {
      dimension: "Integration target",
      anycap:
        "Codex, Cursor, Claude Code, Manus, OpenClaw, and other agent surfaces that need a portable runtime instead of another SDK project.",
      fal:
        "Your product backend, workflow runner, or custom application code that will call model endpoints directly with `FAL_KEY` authentication.",
    },
    {
      dimension: "Capability scope",
      anycap:
        "Image, video, music, media understanding, grounded web retrieval, Drive storage, and Page publishing through one interface.",
      fal:
        "State-of-the-art generative media endpoints with strong async primitives, but artifact storage, search, and publishing still belong to the rest of your stack.",
    },
    {
      dimension: "Artifact workflow",
      anycap:
        "Generation can move directly into hosted storage, share links, and static pages without leaving the product surface.",
      fal:
        "The API returns outputs and queue status, but durable asset management and public delivery are still application responsibilities.",
    },
    {
      dimension: "Best fit",
      anycap: "Best when the team wants an agent-first operator experience and cross-agent portability.",
      fal:
        "Best when the team wants a media-focused API building block with queue visibility, webhook verification, and direct backend ownership.",
    },
  ],
  strengthsTitleLeft: "Why teams choose AnyCap",
  strengthsTitleRight: "Why teams choose fal.ai",
  strengthsLeft: [
    "One runtime surface can equip multiple agent environments without rebuilding media integrations from scratch in each one.",
    "The public capability inventory goes beyond generation into understanding, web retrieval, storage, and publishing, which is useful when an agent must complete the whole task.",
    "That makes AnyCap a better fit for operator simplicity and cross-agent reuse than a media API alone.",
  ],
  strengthsRight: [
    "fal's docs explicitly recommend queue-backed async inference for reliable production use and reserve synchronous calls for quick blocking workloads.",
    "Webhook support is detailed, including retry behavior and signature verification guidance, which is valuable for teams building their own media job pipelines.",
    "Key-based authentication and team-scoped API keys make fal a strong media infrastructure building block when your stack already owns the rest of the workflow.",
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
      eyebrow: "Choose fal.ai if",
      title: "Your product backend wants explicit control over media jobs.",
      body:
        "fal is the better fit when queue state, webhook handling, and direct endpoint integration are part of your own product architecture and you do not need a broader agent runtime layer.",
    },
    {
      eyebrow: "Choose AnyCap if",
      title: "The workflow includes delivery, not just generation.",
      body:
        "AnyCap is stronger when the artifact must become a share link, a hosted page, or another agent input right after generation instead of stopping at one API response.",
    },
    {
      eyebrow: "Choose fal.ai if",
      title: "The work is mostly media infrastructure.",
      body:
        "fal is a clean choice when your team mainly cares about direct model access, async execution reliability, and media-focused backend primitives rather than search, storage, or publishing workflows.",
    },
  ],
  methodTitle: "How this comparison was reviewed",
  methodBody: [
    "The fal.ai side of this page was reviewed against the public docs available on April 8, 2026. The claims here are intentionally narrow and verifiable: fal supports synchronous requests, queue-backed async inference, webhooks, and API-key authentication.",
    "The AnyCap side of the comparison is based on published AnyCap pages for the CLI, installation flow, capability runtime, Drive, and pricing. The page only uses public claims that are already visible in the product surface.",
  ],
  methodologyNoteLabel: "Methodology note",
  methodologyNoteBody:
    "This page compares layer fit, not total product breadth. If fal.ai changes model endpoint behavior later, or AnyCap changes its capability inventory, the page should be updated to stay tied to current public documentation.",
  sourceTitle: "Source notes",
  sourceLinks: [
    {
      label: "fal synchronous inference",
      href: "https://fal.ai/docs/model-apis/model-endpoints/synchronous-requests",
      note: "Direct `run` calls, `subscribe`, and when blocking requests make sense.",
    },
    {
      label: "fal async inference",
      href: "https://fal.ai/docs/model-apis/model-endpoints/queue",
      note: "Queue-backed request handling for production workloads.",
    },
    {
      label: "fal webhooks",
      href: "https://fal.ai/docs/model-endpoints/webhooks",
      note: "Webhook delivery, retries, and signature verification guidance.",
    },
    {
      label: "fal authentication",
      href: "https://fal.ai/docs/documentation/setting-up/authentication",
      note: "API key setup, team-scoped keys, and auth expectations.",
    },
    {
      label: "AnyCap image generation",
      href: "/capabilities/image-generation",
      note: "The public image-generation surface exposed through the AnyCap runtime.",
    },
    {
      label: "AnyCap Drive",
      href: "/capabilities/drive",
      note: "Storage and share-link workflows that extend beyond media generation alone.",
    },
    {
      label: "Install AnyCap",
      href: "/guides/install-anycap",
      note: "Published setup flow for agent environments that need a portable runtime.",
    },
  ],
  relatedTitle: "Related pages",
  relatedPages: [
    {
      href: "/compare/anycap-vs-replicate",
      eyebrow: "Compare",
      title: "AnyCap vs Replicate",
      body: "Compare AnyCap to a model inference and deployment platform with similar media job semantics.",
    },
    {
      href: "/capabilities/video-generation",
      eyebrow: "Product",
      title: "Video Generation",
      body: "See the public video workflow that an agent gets through AnyCap today.",
    },
    {
      href: "/capabilities/image-generation",
      eyebrow: "Product",
      title: "Image Generation",
      body: "Go deeper on how the AnyCap runtime exposes image models through one command surface.",
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
      question: "Is fal.ai a direct AnyCap replacement?",
      answer:
        "No. fal.ai is a generative media API platform optimized for backend-controlled inference jobs, while AnyCap is a broader capability runtime for agents already operating in developer tools. The overlap is mainly image and video generation, but the category is different: one is media infrastructure, the other is agent execution infrastructure. Choosing between them depends on whether your bottleneck is API orchestration in app code or capability access in agent workflows.",
    },
    {
      question: "What is the biggest workflow difference between AnyCap and fal.ai?",
      answer:
        "fal.ai expects your application stack to own request lifecycle management, webhook handling, retries, and artifact routing after generation. AnyCap packages capability access into a CLI-first runtime that agents can invoke directly, then extends the workflow with storage and publishing paths in the same operational surface. The core difference is where workflow complexity is implemented: custom backend code with fal.ai, shared runtime semantics with AnyCap.",
    },
    {
      question: "Does fal.ai support both sync and async inference?",
      answer:
        "Yes. fal's public docs describe direct synchronous requests, queue-backed asynchronous inference, and webhook notifications for completion. That combination is one of the clearest reasons teams choose fal.ai when backend control matters and workloads cannot rely on blocking calls. It is particularly valuable when product systems need queue visibility, callback integrity, and predictable post-processing behavior.",
    },
    {
      question: "When is AnyCap the cleaner choice?",
      answer:
        "AnyCap is cleaner when the team already uses agents in developer tools and wants multimodal execution plus artifact delivery without launching another direct API integration project. One runtime can standardize install, auth, invocation, and handoff across multiple agent shells. That reduces integration drift and makes it easier to keep workflows consistent as teams add more capabilities over time.",
    },
    {
      question: "What is the simplest rule of thumb?",
      answer:
        "If you need a media API layer with queue and webhook control in backend code, choose fal.ai. If you need existing agents to complete cross-modal work inside one execution runtime, choose AnyCap. When teams are undecided, mapping where lifecycle ownership should live, backend application or agent runtime, usually clarifies the choice quickly.",
    },
  ],
  ctas: [
    { href: "/guides/install-anycap", label: "Install AnyCap", variant: "primary" },
    { href: "/capabilities/image-generation", label: "Image Generation", variant: "secondary" },
    { href: "/capabilities/video-generation", label: "Video Generation", variant: "secondary" },
  ],
};

const ptBr: ComparePageData = {
  ...en,
  breadcrumbItems: [
    { name: "Início", href: "/" },
    { name: "Comparar", href: "/compare", unlinkable: true },
    { name: "AnyCap vs fal.ai" },
  ],
  eyebrow: "Comparar",
  metadata: {
    title: "AnyCap vs fal.ai — runtime entre agentes vs stack de API generativa de mídia",
    description:
      "Compare o AnyCap e o fal.ai. O fal.ai é uma plataforma de API generativa de mídia com chamadas síncronas, inferência assíncrona orientada por fila, webhooks e autenticação por API key. O AnyCap é um runtime de capacidades entre agentes para Codex, Cursor, Claude Code e fluxos similares.",
    openGraphTitle: "AnyCap vs fal.ai — runtime entre agentes vs stack de API generativa de mídia",
    openGraphDescription:
      "Veja quando o fal.ai é a camada certa para APIs de mídia e quando o AnyCap é o runtime mais simples sobre agentes já existentes.",
  },
  lastUpdatedLabel: "8 de abril de 2026",
  heroIntro:
    "AnyCap vs fal.ai é uma decisão sobre qual camada seu time quer controlar. O fal.ai é mais forte quando o backend precisa de APIs de mídia com fila, integração direta com endpoints, verificação de webhook e controle explícito de estado dos jobs no código da aplicação. Esse modelo é ideal para times que já operam sua própria orquestração, retries e pipeline de ativos. O AnyCap é mais forte quando os agentes já existem e a lacuna principal está no acesso operacional a capacidades dentro desses workflows. Em vez de reconstruir integrações por shell, a equipe usa um runtime único que combina execução multimodal com armazenamento e publicação na mesma superfície operacional.",
  answerFirstSummaryBody:
    "Escolha o fal.ai quando o stack do produto precisa de endpoints diretos de mídia, execução assíncrona com fila, controle de ciclo de vida por webhook e propriedade de backend sobre a orquestração. Escolha o AnyCap quando seus desenvolvedores já operam por agentes e querem que esses agentes ganhem capacidades de mídia, web, armazenamento e publicação por meio de um runtime compartilhado. Nesse cenário, padronizar runtime costuma ser melhor do que abrir outro projeto de API de baixo nível, porque autenticação, comandos e entrega de artefatos ficam consistentes entre ambientes.",
  comparisonRows: [
    {
      dimension: "Função principal",
      anycap:
        "Runtime de capacidades para agentes que oferece uma camada de execução compartilhada para mídia, web, armazenamento e publicação.",
      fal:
        "Plataforma de API generativa de mídia centrada em endpoints de modelo, inferência assíncrona com fila, webhooks e integração controlada pelo desenvolvedor.",
    },
    {
      dimension: "Ciclo da requisição",
      anycap:
        "Um CLI e um fluxo de autenticação abstraem o ciclo da requisição para que o agente permaneça dentro de uma superfície estável de capacidades.",
      fal:
        "O fal suporta chamadas síncronas diretas, requisições assíncronas com fila e conclusão por webhook, o que é ideal quando o backend quer controle explícito.",
    },
    {
      dimension: "Destino de integração",
      anycap:
        "Superfícies de agente como Codex, Cursor, Claude Code, Manus, OpenClaw e outras que precisam de um runtime portátil em vez de outro projeto de SDK.",
      fal:
        "O backend do produto, o runner de workflow ou o código customizado da aplicação que chamará endpoints de modelo diretamente com autenticação `FAL_KEY`.",
    },
    {
      dimension: "Escopo de capacidades",
      anycap:
        "Imagem, vídeo, música, entendimento de mídia, recuperação web orientada, armazenamento no Drive e publicação no Page em uma única interface.",
      fal:
        "Endpoints de mídia generativa de alto nível com primitives assíncronas fortes, mas armazenamento de artefatos, busca e publicação ainda ficam no resto do stack.",
    },
    {
      dimension: "Fluxo de artefatos",
      anycap:
        "A geração pode ir direto para armazenamento hospedado, links compartilháveis e páginas estáticas sem sair da superfície do produto.",
      fal:
        "A API retorna outputs e status de fila, mas o gerenciamento durável de ativos e a entrega pública continuam sendo responsabilidade da aplicação.",
    },
    {
      dimension: "Melhor encaixe",
      anycap: "Melhor quando a equipe quer uma experiência de operação first-party entre agentes e portabilidade.",
      fal:
        "Melhor quando a equipe quer um bloco de construção de API de mídia com visibilidade de fila, verificação de webhook e propriedade direta do backend.",
    },
  ],
  strengthsTitleLeft: "Por que as equipes escolhem o AnyCap",
  strengthsTitleRight: "Por que as equipes escolhem o fal.ai",
  strengthsLeft: [
    "Uma única superfície de runtime consegue equipar vários ambientes de agente sem reescrever integrações de mídia do zero em cada um.",
    "O inventário público de capacidades vai além de geração e inclui entendimento, recuperação web, armazenamento e publicação, o que é útil quando o agente precisa concluir a tarefa inteira.",
    "Isso torna o AnyCap mais adequado para simplicidade operacional e reaproveitamento entre agentes do que uma API de mídia isolada.",
  ],
  strengthsRight: [
    "A documentação do fal recomenda explicitamente inferência assíncrona baseada em fila para uso confiável em produção e reserva chamadas síncronas para workloads curtos.",
    "O suporte a webhook é detalhado, incluindo comportamento de retry e verificação de assinatura, o que ajuda equipes que constroem seus próprios pipelines de mídia.",
    "Autenticação por chave e chaves em nível de time fazem do fal um bom bloco de infraestrutura de mídia quando o restante do workflow já é responsabilidade do stack.",
  ],
  useCases: [
    {
      eyebrow: "Escolha o AnyCap se",
      title: "O runtime precisa acompanhar a equipe entre produtos de agente.",
      body:
        "O AnyCap é mais forte quando a mesma camada de capacidades precisa funcionar no Codex, Cursor, Claude Code ou outra shell sem reconstruir o stack para cada ambiente.",
    },
    {
      eyebrow: "Escolha o fal.ai se",
      title: "Seu backend quer controle explícito sobre jobs de mídia.",
      body:
        "O fal é o melhor encaixe quando estado de fila, tratamento de webhook e integração direta com endpoints fazem parte da arquitetura do produto e você não precisa de uma camada de runtime mais ampla.",
    },
    {
      eyebrow: "Escolha o AnyCap se",
      title: "O fluxo inclui entrega, não só geração.",
      body:
        "O AnyCap é mais forte quando o artefato precisa virar link compartilhável, página hospedada ou outro input para agente logo após a geração, em vez de parar em uma resposta de API.",
    },
    {
      eyebrow: "Escolha o fal.ai se",
      title: "O trabalho é principalmente infraestrutura de mídia.",
      body:
        "O fal é uma escolha limpa quando a equipe se importa principalmente com acesso direto a modelos, confiabilidade de execução assíncrona e primitives de backend focadas em mídia, em vez de busca, armazenamento ou publicação.",
    },
  ],
  methodBody: [
    "O lado do fal.ai nesta página foi revisado com base na documentação pública disponível em 8 de abril de 2026. As alegações aqui são intencionalmente estreitas e verificáveis: o fal suporta requisições síncronas, inferência assíncrona com fila, webhooks e autenticação por API key.",
    "O lado do AnyCap se baseia nas páginas públicas do produto sobre CLI, instalação, runtime de capacidades, Drive e pricing. A página usa apenas alegações que já estão visíveis publicamente na superfície do produto.",
  ],
  methodologyNoteBody:
    "Esta página compara encaixe de camada, não a amplitude total de produto. Se o fal.ai mudar o comportamento de endpoints ou o AnyCap mudar o inventário de capacidades, a página deve ser atualizada para continuar alinhada à documentação pública atual.",
  sourceLinks: [
    {
      label: "fal synchronous inference",
      href: "https://fal.ai/docs/model-apis/model-endpoints/synchronous-requests",
      note: "Chamadas `run`, `subscribe` e quando faz sentido bloquear.",
    },
    {
      label: "fal async inference",
      href: "https://fal.ai/docs/model-apis/model-endpoints/queue",
      note: "Tratamento de requisições com fila para workloads de produção.",
    },
    {
      label: "fal webhooks",
      href: "https://fal.ai/docs/model-endpoints/webhooks",
      note: "Entrega de webhooks, retries e verificação de assinatura.",
    },
    {
      label: "fal authentication",
      href: "https://fal.ai/docs/documentation/setting-up/authentication",
      note: "Configuração de API key, chaves por time e expectativas de auth.",
    },
    {
      label: "AnyCap image generation",
      href: "/capabilities/image-generation",
      note: "A superfície pública de geração de imagem exposta pelo runtime.",
    },
    {
      label: "AnyCap Drive",
      href: "/capabilities/drive",
      note: "Fluxos de armazenamento e links compartilháveis que vão além da geração.",
    },
    {
      label: "Instalar o AnyCap",
      href: "/guides/install-anycap",
      note: "Fluxo publicado de setup para ambientes de agente que precisam de runtime portátil.",
    },
  ],
  relatedPages: [
    {
      href: "/compare/anycap-vs-replicate",
      eyebrow: "Comparar",
      title: "AnyCap vs Replicate",
      body: "Compare o AnyCap com outra plataforma de inferência e deploy de modelos com semântica parecida de jobs de mídia.",
    },
    {
      href: "/capabilities/video-generation",
      eyebrow: "Produto",
      title: "Video Generation",
      body: "Veja o fluxo público de vídeo que um agente obtém pelo AnyCap hoje.",
    },
    {
      href: "/capabilities/image-generation",
      eyebrow: "Produto",
      title: "Image Generation",
      body: "Aprofunde como o AnyCap expõe modelos de imagem por uma interface única.",
    },
    {
      href: "/guides/install-anycap",
      eyebrow: "Comece aqui",
      title: "Instalar o AnyCap",
      body: "Valide o runtime diretamente no seu fluxo de agente em vez de ficar só na comparação.",
    },
  ],
  faqItems: [
    {
      question: "O fal.ai substitui o AnyCap diretamente?",
      answer:
        "Não. O fal.ai é uma plataforma de API generativa de mídia focada em jobs controlados pelo backend, enquanto o AnyCap é um runtime de capacidades mais amplo para agentes já existentes. Existe sobreposição em imagem e vídeo, mas a categoria é diferente: infraestrutura de mídia versus infraestrutura de execução para agentes. A escolha depende de onde está o gargalo principal do seu stack.",
    },
    {
      question: "Qual é a maior diferença de workflow entre AnyCap e fal.ai?",
      answer:
        "O fal.ai espera que o stack da aplicação assuma ciclo de vida da requisição, tratamento de webhook, retries e pipeline de artefatos após a geração. O AnyCap empacota acesso a capabilities em um runtime CLI-first que o agente invoca diretamente e ainda adiciona fluxos de armazenamento e publicação no mesmo ambiente operacional. A diferenca central é onde a complexidade fica: backend customizado com fal.ai ou runtime compartilhado com AnyCap.",
    },
    {
      question: "O fal.ai suporta inferência síncrona e assíncrona?",
      answer:
        "Sim. A documentação pública do fal.ai descreve requisições síncronas diretas, inferência assíncrona com fila e webhooks para notificações de conclusão. Esse conjunto é um dos motivos mais claros para adotá-lo quando controle de backend realmente importa e o produto depende de jobs longos com eventos de finalização confiáveis.",
    },
    {
      question: "Quando o AnyCap é a escolha mais simples?",
      answer:
        "O AnyCap costuma ser a escolha mais simples quando a equipe já usa agentes em ferramentas de desenvolvimento e quer ampliar execução multimodal sem abrir outro projeto de integração direta por API. Um runtime único padroniza instalação, autenticação, invocação e handoff de artefatos entre shells de agente. Isso reduz fricção operacional e acelera rollout de novos fluxos.",
    },
    {
      question: "Qual é a regra mais simples de decisão?",
      answer:
        "Se você precisa de uma API de mídia com controle de fila e webhook no backend, escolha o fal.ai. Se você precisa que seus agentes concluam trabalho cross-modal em um runtime único e portátil, escolha o AnyCap. Quando houver dúvida, mapear onde a responsabilidade de ciclo de vida deve morar, aplicação ou runtime de agente, costuma resolver a decisão com rapidez.",
    },
  ],
  ctas: [
    { href: "/guides/install-anycap", label: "Instalar o AnyCap", variant: "primary" },
    { href: "/capabilities/image-generation", label: "Geração de imagem", variant: "secondary" },
    { href: "/capabilities/video-generation", label: "Geração de vídeo", variant: "secondary" },
  ],
};

const contentByLocale: Record<SiteLocale, ComparePageData> = {
  en,
  "pt-br": ptBr,
  id: en,
};

export function getAnyCapVsFalAiMetadata(locale: SiteLocale): Metadata {
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

export function getAnyCapVsFalAiPageData(locale: SiteLocale) {
  return contentByLocale[locale] ?? contentByLocale.en;
}
