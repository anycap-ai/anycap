import type { Metadata } from "next";
import { createFaqPageJsonLd, createTechArticleJsonLd } from "@/lib/schema";
import { getLocaleConfig, siteConfig, type SiteLocale } from "@/lib/site";
import { type DemoLine } from "@/components/landing/CapabilityDemo";
import { getCatalogModelsByCapability } from "@/lib/seo/model-catalog";

export const VIDEO_GENERATION_PATH = "/capabilities/video-generation";

const LAST_UPDATED_ISO = "2026-07-11";
const ARTICLE_PUBLISHED_ISO = "2026-04-05";
const VARIABLE_CATALOG_COST = "Varies by catalog pricing";

type VideoGenerationDemoLabels = {
  header: string;
  name: string;
  size: string;
  date: string;
  link: string;
};

type VideoGenerationCard = {
  modelId:
    | "gemini-omni-flash-preview"
    | "seedance-2"
    | "kling-3.0"
    | "veo-3.1";
  eyebrow: string;
  title: string;
  href: string;
  body: string;
  tradeoff: string;
};

type VideoGenerationModel = {
  modelId: string;
  name: string;
  href: string;
  modes: string;
  cost: string;
  bestFor: string;
  tradeoff: string;
};

type VideoGenerationFitSignal = { label: string; body: string };
type VideoGenerationFailure = { title: string; body: string };
type VideoGenerationInputMode = {
  title: string;
  body: string;
  mode: "text-to-video" | "image-to-video" | "edit-video";
  limitation: string;
};

type VideoGenerationFaqItem = {
  question: string;
  answer: string;
};

type VideoGenerationUseCase = {
  title: string;
  description: string;
};

type VideoGenerationRelatedCard = {
  eyebrow: string;
  title: string;
  href: string;
  description: string;
};

type VideoGenerationNextAction = {
  label: string;
  href: string;
  external?: boolean;
  primary?: boolean;
};

type VideoGenerationPageContent = {
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
  breadcrumbItems: readonly { name: string; href?: string }[];
  eyebrow: string;
  lastUpdatedLabel: string;
  hero: {
    title: string;
    accentTitle: string;
    modeLines: readonly [string, string];
    intro: string;
    summaryLabel: string;
    summaryText: string;
  };
  heroActions: readonly VideoGenerationNextAction[];
  demo: {
    labels: VideoGenerationDemoLabels;
    lines: readonly DemoLine[];
  };
  demoCallout: { title: string; body: string };
  positioning: { lines: readonly [string, string]; summary: string };
  contrast: { before: string; after: string };
  proofPoints: readonly string[];
  inputModesTitle: string;
  inputModes: readonly VideoGenerationInputMode[];
  variableCostLabel: string;
  decisionTitle: string;
  decisionCardCta: string;
  decisionCardAriaLabelTemplate: string;
  decisionCards: readonly VideoGenerationCard[];
  supportedModelsTitle: string;
  tableHeaders: {
    model: string;
    modes: string;
    cost: string;
    bestFit: string;
    tradeoff: string;
  };
  timingNote: string;
  usageTitle: string;
  usageIntro: string;
  usageExamples: readonly { title: string; code: string }[];
  workflowStatement: string;
  useCasesTitle: string;
  useCases: readonly VideoGenerationUseCase[];
  fitSignalsTitle: string;
  fitSignals: readonly VideoGenerationFitSignal[];
  failuresTitle: string;
  failureItems: readonly VideoGenerationFailure[];
  relatedTitle: string;
  relatedCards: readonly VideoGenerationRelatedCard[];
  faqTitle: string;
  faqItems: readonly VideoGenerationFaqItem[];
  nextStepsTitle: string;
  nextActions: readonly VideoGenerationNextAction[];
  final: { title: string; body: string };
};

const contentByLocale = {
  en: {
    metadata: {
      title: "Video Generation API for AI Agents - Text-to-video and image-to-video",
      description:
        "Give AI agents one video generation API surface for text-to-video, image-to-video, model discovery, review, and publishing workflows through the AnyCap CLI.",
      openGraphTitle: "Video Generation API for AI Agents - Text-to-video and image-to-video",
      openGraphDescription:
        "Give AI agents one video generation API surface for text-to-video, image-to-video, model discovery, review, and publishing workflows through the AnyCap CLI.",
      articleHeadline: "Video Generation API for AI Agents - Text-to-video and image-to-video",
      articleDescription:
        "Product guide for using AnyCap video generation across AI agent workflows, including model discovery, text-to-video, image-to-video, CLI execution, and related publishing steps.",
      articleAbout: ["Video generation", "Video generation API", "Text-to-video API", "Image-to-video", "AI agents", "AnyCap"],
      articleKeywords: [
        "video generation for ai agents",
        "video generation api",
        "text to video api",
        "gemini omni flash preview",
        "edit video api",
        "video creation api",
        "image to video",
        "veo 3.1",
      ],
    },
    breadcrumbItems: [
      { name: "Home", href: "/" },
      { name: "Capabilities", href: "/capabilities" },
      { name: "Video Generation", href: VIDEO_GENERATION_PATH },
    ],
    eyebrow: "Capabilities",
    lastUpdatedLabel: "Last updated July 11, 2026",
    hero: {
      title: "Video generation",
      accentTitle: "for AI agents.",
      modeLines: ["Text to video.", "Image to video."],
      intro:
        "AnyCap gives agents one command surface for text-to-video, image-to-video, model discovery, and generated video delivery. Instead of hard-wiring one provider API into every agent, teams can let Claude Code, Codex, Cursor, and other agents choose a video model, generate the clip, inspect the result, and publish or share it from the same workflow.",
      summaryLabel: "The short answer",
      summaryText:
        "Use AnyCap when an agent must create, edit, review, and route video output through one CLI. Choose a mode and model from the live catalog, then keep the returned result in the same workflow.",
    },
    heroActions: [
      { label: "Equip your agent", href: "/start", primary: true },
      { label: "Codex workflow", href: "/for/codex" },
      { label: "Compare models", href: "#models" },
    ] as const,
    demo: {
      labels: {
        header: "agent with anycap",
        name: "Name",
        size: "Size",
        date: "Date",
        link: "Link",
      },
      lines: [
        { type: "header", delay: 0 },
        {
          type: "prompt",
          content: "Create a 5-second drone shot flying over mountains at sunset",
          delay: 500,
        },
        {
          type: "text",
          content: "I'll generate a video clip using AnyCap.",
          delay: 800,
        },
        {
          type: "tool",
          content:
            'run("anycap video generate --prompt \'drone shot flying over mountain range at golden hour sunset\' --model veo-3.1 -o mountains.mp4")',
          delay: 600,
        },
        {
          type: "text",
          content: "Video generated — mountains.mp4 (5s, 1080p, 4.2 MB)",
          sub: "✓",
          delay: 2000,
        },
        { type: "video", delay: 400 },
        {
          type: "text",
          content: "Here's the clip. Smooth camera movement with warm sunset tones.",
          delay: 600,
        },
        { type: "cursor", delay: 500 },
      ] as const,
    },
    demoCallout: {
      title: "See the workflow, not just the claim.",
      body: "Prompt, model call, generated clip, and next step stay in one agent flow.",
    },
    positioning: {
      lines: ["A video API exposes a model.", "An agent workflow carries the result forward."],
      summary: "AnyCap turns model access into agent action.",
    },
    contrast: {
      before: "Pick one model, wire one API, rebuild the workflow.",
      after: "One CLI, multiple video models, agent-ready outputs.",
    },
    proofPoints: [
      "Text-to-video, image-to-video, and edit-video use one command surface.",
      "Live catalog modes and credit estimates stay visible before an agent chooses.",
      "Featured decisions explain both best fit and the practical trade-off.",
      "Returned clips stay available for review, delivery, and the next agent step.",
    ] as const,
    inputModesTitle: "Start from the input you actually have",
    inputModes: [
      {
        title: "Text brief",
        body: "Start from a written scene, subject, motion, camera, and output brief.",
        mode: "text-to-video",
        limitation: "Not appropriate when an exact source frame must be preserved.",
      },
      {
        title: "Reference image",
        body: "Animate a prepared still while using the prompt to direct motion and camera behavior.",
        mode: "image-to-video",
        limitation: "Requires a supported model and a prepared source still.",
      },
      {
        title: "Existing footage",
        body: "Refine a source clip with instructions instead of generating a new clip from scratch.",
        mode: "edit-video",
        limitation: "Available only when the selected live model exposes that mode.",
      },
    ] as const,
    variableCostLabel: "Varies by catalog pricing",
    decisionTitle: "Choose the right video model at runtime",
    decisionCardCta: "Open model guide →",
    decisionCardAriaLabelTemplate: "Read the {title} model guide",
    decisionCards: [
      {
        modelId: "gemini-omni-flash-preview",
        eyebrow: "Existing-footage editing",
        title: "Gemini Omni Flash Preview",
        href: "/models/gemini-omni-flash-preview",
        body: "Use it when the agent starts with an existing clip and needs natural-language video edits, refinements, or review loops without leaving the AnyCap workflow.",
        tradeoff: "It edits existing footage only; use a generation model for a new clip.",
      },
      {
        modelId: "seedance-2",
        eyebrow: "Newer Seedance default",
        title: "Seedance 2.0",
        href: "/models/seedance-2",
        body: "Use it when the agent needs a modern default for product clips, social motion, and image-to-video drafts without leaving the AnyCap workflow.",
        tradeoff: "Choose the Fast variant when turnaround matters more than peak quality.",
      },
      {
        modelId: "kling-3.0",
        eyebrow: "Cinematic motion",
        title: "Kling 3.0",
        href: "/models/kling-3-0",
        body: "Use it when the brief depends on camera movement, character motion, or exploratory image-to-video iteration.",
        tradeoff: "Choose a lower-cost or faster model when preview speed matters more than cinematic motion.",
      },
      {
        modelId: "veo-3.1",
        eyebrow: "Premium first pass",
        title: "Veo 3.1",
        href: "/models/veo-3-1",
        body: "Use it when the first pass needs to feel more polished from a text brief, especially for branded teasers and concept clips.",
        tradeoff: "Choose Veo 3.1 Fast when iteration speed matters more than maximum polish.",
      },
    ] as const,
    supportedModelsTitle: "Four featured model decisions",
    tableHeaders: {
      model: "Model",
      modes: "Modes",
      cost: "Cost",
      bestFit: "Best fit",
      tradeoff: "Trade-off",
    },
    timingNote:
      "Generation time varies by model, queue state, duration, and settings. The CLI waits for server-side completion and returns the result when the command finishes; no fixed latency is promised.",
    usageTitle: "CLI usage",
    usageIntro:
      "Run anycap video models for the full live inventory, then inspect the selected model schema before supplying local references. These examples show the current command shape for each input path.",
    usageExamples: [
      {
        title: "Text-to-video",
        code:
          'anycap video generate --prompt "a drone shot flying over a mountain range at sunset" --model veo-3.1 -o hero.mp4',
      },
      {
        title: "Image-to-video",
        code:
          'anycap video generate --prompt "animate this still into a subtle camera move" --model seedance-1.5-pro --mode image-to-video --param images=./frame.jpg -o animated.mp4',
      },
      {
        title: "Edit existing video",
        code:
          'anycap video generate --prompt "brighten the lighting and add a subtle slow zoom" --model gemini-omni-flash-preview --mode edit-video --param videos=./source.mp4 -o refined.mp4',
      },
      {
        title: "Discover models",
        code: "anycap video models",
      },
    ] as const,
    workflowStatement:
      "The useful unit is the whole agent loop: inspect live capability, choose a supported mode, generate or edit, review the returned clip, and deliver it without switching integration surfaces.",
    useCasesTitle: "When agents need video generation",
    useCases: [
      {
        title: "Launch and demo clips",
        description: "Turn product briefs, changelog notes, or storyboard prompts into short launch clips from the agent session.",
      },
      {
        title: "Reference frame to motion",
        description: "Animate design stills, screenshots, generated images, or product frames without changing providers or auth flows.",
      },
      {
        title: "Agent-led social content",
        description:
          "Generate short-form clips for campaigns, creator workflows, and product announcements, then hand off the asset through Drive or Page.",
      },
      {
        title: "Video workflow prototyping",
        description:
          "Test model fit, prompt structure, duration, aspect ratio, and reference-image behavior before building a deeper integration.",
      },
    ] as const,
    fitSignalsTitle: "Workflow fit signals",
    fitSignals: [
      {
        label: "Best fit",
        body: "Agents that need repeatable video creation or editing inside coding, research, or content workflows.",
      },
      {
        label: "Not a fit",
        body: "Teams that only need a consumer editor with a manual, timeline-first interface.",
      },
      {
        label: "Operational check",
        body: "The agent can inspect the live model schema, retain request context, and handle delivery separately from generation.",
      },
    ] as const,
    failuresTitle: "What common failures mean",
    failureItems: [
      {
        title: "The selected model does not expose the requested mode",
        body: "Run anycap video models <model-id> schema --operation generate --mode <mode> and choose a mode the live model declares.",
      },
      {
        title: "A local reference is missing or uses the wrong schema key",
        body: "Inspect the live schema and use --param images=... or --param videos=... only when that parameter is declared.",
      },
      {
        title: "The automatic download fails after generation",
        body: "Generation may already have succeeded, but the CLI reports the automatic-download error before the normal result. Do not assume a URL or request ID was returned. Fix the local path or connection, retain trace_id for support, and rerun deliberately because another clip may be created.",
      },
      {
        title: "The output does not match the brief",
        body: "Review the clip, tighten motion, camera, and subject instructions, then retry without claiming deterministic frames.",
      },
    ] as const,
    relatedTitle: "Continue the agent workflow",
    relatedCards: [
      {
        eyebrow: "Agent page",
        title: "Video workflows for Codex",
        href: "/for/codex",
        description:
          "See how Codex discovers capabilities, runs AnyCap commands, and carries structured results forward.",
      },
      {
        eyebrow: "Related capability",
        title: "Video analysis",
        href: "/capabilities/video-analysis",
        description: "Inspect a generated or source clip before the next edit, delivery, or publishing step.",
      },
      {
        eyebrow: "Implementation guide",
        title: "Add video generation to an AI agent",
        href: "/guides/how-to-add-video-generation-to-ai-agent",
        description:
          "Follow the schema-first flow from model discovery through generation, result handling, and retries.",
      },
    ] as const,
    faqTitle: "FAQ",
    faqItems: [
      {
        question: "What does AnyCap video generation let agents do?",
        answer:
          "It gives agents one command surface for text-to-video, image-to-video, model discovery, generated asset handling, and downstream sharing. Teams can generate new clips, animate reference images, and keep video creation inside the same agent workflow.",
      },
      {
        question: "Which video models are available through AnyCap today?",
        answer:
          "Run anycap video models for the full live inventory. This page highlights four useful decisions, but availability, modes, schemas, and catalog pricing remain authoritative in the CLI.",
      },
      {
        question: "Why highlight Gemini Omni Flash Preview on a video generation page?",
        answer:
          "The current AnyCap catalog exposes Gemini Omni Flash Preview as an edit-video model. Use it after an agent has a source clip to refine, and choose a text-to-video or image-to-video model when the workflow needs a new clip.",
      },
      {
        question: "Why does this page include image-to-video as well as text-to-video?",
        answer:
          "Agent workflows often start from a screenshot, design frame, or product still rather than a prompt alone. AnyCap treats both text-to-video and image-to-video as one video generation capability so the workflow stays consistent.",
      },
      {
        question: "Is this page about a video generation API or a CLI workflow?",
        answer:
          "It covers both the video generation capability and the CLI workflow agents use to operate it. AnyCap provides model discovery, live schemas, generation commands, and result delivery through one CLI-first surface over multiple video models.",
      },
      {
        question: "Why use AnyCap instead of wiring one video provider directly?",
        answer:
          "A direct provider integration can work when the agent always uses one model. AnyCap is better when the agent needs model choice, shared auth, CLI execution, video review, file handling, and a path to publish or share outputs without rebuilding every workflow per provider.",
      },
    ] as const,
    nextStepsTitle: "Next steps",
    nextActions: [
      { label: "Install AnyCap", href: "/start", primary: true },
      { label: "Codex workflow", href: "/for/codex" },
      {
        label: "View on GitHub",
        href: "https://github.com/anycap-ai/anycap",
        external: true,
      },
    ] as const,
    final: {
      title: "Let your agent generate the clip.",
      body: "Start with the CLI, choose a live model and supported mode at runtime, then keep generation, review, and delivery in the same agent workflow.",
    },
  },
  "pt-br": {
    metadata: {
      title: "Geração de vídeo para agentes de IA | AnyCap",
      description:
        "Dê aos agentes de IA geração de vídeo por meio do AnyCap. Use Veo 3.1, Kling 3.0 e Seedance 1.5 Pro para fluxos de texto para vídeo, imagem para vídeo e criação de vídeo em uma única CLI.",
      openGraphTitle: "Geração de vídeo para agentes de IA | AnyCap",
      openGraphDescription:
        "Dê aos agentes de IA geração de vídeo por meio do AnyCap. Use Veo 3.1, Kling 3.0 e Seedance 1.5 Pro para fluxos de texto para vídeo, imagem para vídeo e criação de vídeo em uma única CLI.",
      articleHeadline:
        "Geração de vídeo para agentes de IA - texto para vídeo e imagem para vídeo via AnyCap",
      articleDescription:
        "Guia de capability para usar a geração de vídeo do AnyCap em fluxos de agentes de IA com Veo 3.1, Kling 3.0 e Seedance 1.5 Pro.",
      articleAbout: ["Geração de vídeo", "API de texto para vídeo", "Imagem para vídeo", "AnyCap"],
      articleKeywords: [
        "geração de vídeo para agentes de ia",
        "texto para vídeo api",
        "api de criação de vídeo",
        "imagem para vídeo",
        "veo 3.1",
      ],
    },
    breadcrumbItems: [
      { name: "Início", href: "/" },
      { name: "Capacidades", href: "/capabilities" },
      { name: "Geração de vídeo", href: VIDEO_GENERATION_PATH },
    ],
    eyebrow: "Capacidades",
    lastUpdatedLabel: "Atualizado em 11 de julho de 2026",
    hero: {
      title: "Geração de vídeo",
      accentTitle: "para agentes de IA.",
      modeLines: ["Texto para vídeo.", "Imagem para vídeo."],
      intro:
        "A geração de vídeo do AnyCap dá aos agentes uma única CLI para fluxos de texto para vídeo e imagem para vídeo. Os agentes podem gerar clipes cinematográficos curtos a partir de prompts, animar imagens estáticas em movimento e executar tarefas de criação de vídeo por meio de uma interface consistente, em vez de integrar APIs separadas para cada modelo ou provedor. O resultado é uma camada de geração de vídeo mais limpa para Claude Code, Cursor, Codex e produtos de agente semelhantes.",
      summaryLabel: "Resumo direto",
      summaryText:
        "Use o AnyCap quando um agente precisar criar, editar, revisar e encaminhar vídeos por uma única CLI. Escolha um modo e um modelo no catálogo ao vivo e mantenha o resultado no mesmo fluxo.",
    },
    heroActions: [
      { label: "Equipar seu agente", href: "/start", primary: true },
      { label: "Fluxo do Codex", href: "/for/codex" },
      { label: "Comparar modelos", href: "#models" },
    ] as const,
    demo: {
      labels: {
        header: "agente com AnyCap",
        name: "Nome",
        size: "Tamanho",
        date: "Data",
        link: "Link",
      },
      lines: [
        { type: "header", delay: 0 },
        {
          type: "prompt",
          content: "Crie um plano de drone de 5 segundos voando sobre montanhas ao pôr do sol",
          delay: 500,
        },
        {
          type: "text",
          content: "Vou gerar esse clipe de vídeo usando o AnyCap.",
          delay: 800,
        },
        {
          type: "tool",
          content:
            "run(\"anycap video generate --prompt 'plano de drone sobre uma cadeia de montanhas ao pôr do sol com luz dourada' --model veo-3.1 -o mountains.mp4\")",
          delay: 600,
        },
        {
          type: "text",
          content: "Vídeo gerado — mountains.mp4 (5s, 1080p, 4.2 MB)",
          sub: "✓",
          delay: 2000,
        },
        { type: "video", delay: 400 },
        {
          type: "text",
          content: "Aqui está o clipe. Movimento de câmera suave com tons quentes de pôr do sol.",
          delay: 600,
        },
        { type: "cursor", delay: 500 },
      ] as const,
    },
    demoCallout: {
      title: "Veja o fluxo, não apenas a promessa.",
      body: "Prompt, chamada do modelo, clipe gerado e próxima etapa ficam no mesmo fluxo do agente.",
    },
    positioning: {
      lines: ["Uma API de vídeo expõe um modelo.", "Um fluxo de agente leva o resultado adiante."],
      summary: "O AnyCap transforma acesso a modelos em ação do agente.",
    },
    contrast: {
      before: "Escolher um modelo, integrar uma API e refazer o fluxo.",
      after: "Uma CLI, vários modelos de vídeo e resultados prontos para agentes.",
    },
    proofPoints: [
      "Texto para vídeo, imagem para vídeo e edição de vídeo usam uma única superfície de comando.",
      "Os modos e as estimativas de créditos do catálogo ao vivo ficam visíveis antes da escolha.",
      "As decisões em destaque explicam o melhor uso e a contrapartida prática.",
      "Os clipes retornados continuam disponíveis para revisão, entrega e a próxima etapa do agente.",
    ] as const,
    inputModesTitle: "Comece pela entrada que você realmente tem",
    inputModes: [
      {
        title: "Briefing textual",
        body: "Comece com uma descrição escrita da cena, do sujeito, do movimento, da câmera e do resultado.",
        mode: "text-to-video",
        limitation: "Não é adequado quando um frame de origem exato precisa ser preservado.",
      },
      {
        title: "Imagem de referência",
        body: "Anime uma imagem preparada e use o prompt para orientar movimento e comportamento da câmera.",
        mode: "image-to-video",
        limitation: "Exige um modelo compatível e uma imagem de origem preparada.",
      },
      {
        title: "Vídeo existente",
        body: "Refine um clipe de origem com instruções em vez de gerar um novo clipe do zero.",
        mode: "edit-video",
        limitation: "Disponível apenas quando o modelo ao vivo selecionado expõe esse modo.",
      },
    ] as const,
    variableCostLabel: "Varia conforme a precificação do catálogo",
    decisionTitle: "Como escolher entre os modelos de vídeo",
    decisionCardCta: "Abrir guia do modelo →",
    decisionCardAriaLabelTemplate: "Ler o guia do modelo {title}",
    decisionCards: [
      {
        modelId: "gemini-omni-flash-preview",
        eyebrow: "Edição de vídeo existente",
        title: "Gemini Omni Flash Preview",
        href: "/models/gemini-omni-flash-preview",
        body: "Use quando o agente parte de um clipe existente e precisa de edições ou refinamentos em linguagem natural no mesmo fluxo do AnyCap.",
        tradeoff: "Ele apenas edita vídeos existentes; use um modelo de geração para criar um novo clipe.",
      },
      {
        modelId: "seedance-2",
        eyebrow: "Novo padrão Seedance",
        title: "Seedance 2.0",
        href: "/models/seedance-2",
        body: "Melhor quando o agente precisa da entrada mais nova da família Seedance para vídeos de produto cinematográficos e fluxos imagem para vídeo mais polidos.",
        tradeoff: "Escolha a variante Fast quando o tempo de resposta for mais importante que a qualidade máxima.",
      },
      {
        modelId: "kling-3.0",
        eyebrow: "Movimento cinematográfico",
        title: "Kling 3.0",
        href: "/models/kling-3-0",
        body: "Melhor quando o fluxo quer um estilo de movimento mais forte ou uma iteração de imagem para vídeo mais flexível.",
        tradeoff: "Escolha um modelo mais barato ou rápido quando a velocidade de prévia for mais importante que o movimento cinematográfico.",
      },
      {
        modelId: "veo-3.1",
        eyebrow: "Primeira versão premium",
        title: "Veo 3.1",
        href: "/models/veo-3-1",
        body: "Melhor quando o briefing textual precisa virar um teaser ou clipe conceitual mais polido na primeira geração.",
        tradeoff: "Escolha o Veo 3.1 Fast quando a velocidade de iteração for mais importante que o acabamento máximo.",
      },
    ] as const,
    supportedModelsTitle: "Quatro decisões de modelo em destaque",
    tableHeaders: {
      model: "Modelo",
      modes: "Modos",
      cost: "Custo",
      bestFit: "Melhor ajuste",
      tradeoff: "Contrapartida",
    },
    timingNote:
      "O tempo de geração varia conforme o modelo, o estado da fila, a duração e as configurações. A CLI aguarda a conclusão no servidor e retorna o resultado quando o comando termina; não há promessa de latência fixa.",
    usageTitle: "Uso na CLI",
    usageIntro:
      "Execute anycap video models para ver o inventário completo e ao vivo e inspecione o schema do modelo escolhido antes de enviar referências locais. Estes exemplos mostram o formato atual dos comandos para cada tipo de entrada.",
    usageExamples: [
      {
        title: "Texto para vídeo",
        code:
          'anycap video generate --prompt "um plano de drone voando sobre uma cadeia de montanhas ao pôr do sol" --model veo-3.1 -o hero.mp4',
      },
      {
        title: "Imagem para vídeo",
        code:
          'anycap video generate --prompt "anime este frame em um movimento sutil de câmera" --model seedance-1.5-pro --mode image-to-video --param images=./frame.jpg -o animated.mp4',
      },
      {
        title: "Editar vídeo existente",
        code:
          'anycap video generate --prompt "clareie a iluminação e adicione um zoom lento sutil" --model gemini-omni-flash-preview --mode edit-video --param videos=./source.mp4 -o refined.mp4',
      },
      {
        title: "Descobrir modelos",
        code: "anycap video models",
      },
    ] as const,
    workflowStatement:
      "A unidade útil é o ciclo completo do agente: inspecionar a capability ao vivo, escolher um modo compatível, gerar ou editar, revisar o clipe retornado e entregá-lo sem trocar de superfície de integração.",
    useCasesTitle: "Quando os agentes precisam de geração de vídeo",
    useCases: [
      {
        title: "Vídeos de demonstração",
        description:
          "Gere clipes de lançamento, walkthroughs e demos de produto com um único comando.",
      },
      {
        title: "Do storyboard ao movimento",
        description:
          "Transforme imagens de design, screenshots ou frames de referência em rascunhos animados.",
      },
      {
        title: "Conteúdo social",
        description:
          "Produza clipes curtos para campanhas, anúncios de changelog e fluxos de criadores.",
      },
      {
        title: "Protótipo rápido",
        description:
          "Explore conceitos visuais em movimento antes de partir para uma produção maior.",
      },
    ] as const,
    fitSignalsTitle: "Sinais de adequação ao fluxo",
    fitSignals: [
      {
        label: "Melhor ajuste",
        body: "Agentes que precisam criar ou editar vídeos de forma repetível em fluxos de código, pesquisa ou conteúdo.",
      },
      {
        label: "Não é o melhor ajuste",
        body: "Equipes que precisam apenas de um editor de consumo com interface manual baseada em timeline.",
      },
      {
        label: "Verificação operacional",
        body: "O agente consegue inspecionar o schema ao vivo, preservar o contexto da solicitação e tratar a entrega separadamente da geração.",
      },
    ] as const,
    failuresTitle: "O que significam as falhas comuns",
    failureItems: [
      {
        title: "O modelo selecionado não expõe o modo solicitado",
        body: "Execute anycap video models <model-id> schema --operation generate --mode <mode> e escolha um modo declarado pelo modelo ao vivo.",
      },
      {
        title: "Uma referência local está ausente ou usa a chave errada",
        body: "Inspecione o schema ao vivo e use --param images=... ou --param videos=... somente quando esse parâmetro estiver declarado.",
      },
      {
        title: "O download automático falha depois da geração",
        body: "A geração pode já ter sido concluída, mas a CLI informa o erro do download automático antes do resultado normal. Não presuma que uma URL ou um ID da solicitação foi retornado. Corrija o caminho local ou a conexão, guarde o trace_id para suporte e execute novamente de forma deliberada, pois outro clipe pode ser criado.",
      },
      {
        title: "O resultado não corresponde ao briefing",
        body: "Revise o clipe, refine as instruções de movimento, câmera e sujeito e tente novamente sem prometer frames determinísticos.",
      },
    ] as const,
    relatedTitle: "Continue o fluxo do agente",
    relatedCards: [
      {
        eyebrow: "Página de agente",
        title: "Fluxos de vídeo para Codex",
        href: "/for/codex",
        description:
          "Veja como o Codex descobre capabilities, executa comandos do AnyCap e leva resultados estruturados adiante.",
      },
      {
        eyebrow: "Capability relacionada",
        title: "Análise de vídeo",
        href: "/capabilities/video-analysis",
        description:
          "Inspecione um clipe gerado ou de origem antes da próxima edição, entrega ou publicação.",
      },
      {
        eyebrow: "Guia de implementação",
        title: "Adicionar geração de vídeo a um agente de IA",
        href: "/guides/how-to-add-video-generation-to-ai-agent",
        description:
          "Siga o fluxo orientado por schema, da descoberta de modelos à geração, ao tratamento do resultado e às novas tentativas.",
      },
    ] as const,
    faqTitle: "Perguntas frequentes",
    faqItems: [
      {
        question: "O que a geração de vídeo do AnyCap permite que os agentes façam?",
        answer:
          "Ela dá aos agentes uma única superfície de comando para fluxos de texto para vídeo e imagem para vídeo. As equipes podem gerar novos clipes, animar imagens de referência e executar tarefas repetíveis de criação de vídeo sem integrações separadas por provedor.",
      },
      {
        question: "Quais modelos de vídeo estão disponíveis no AnyCap hoje?",
        answer:
          "Execute anycap video models para consultar o inventário completo e ao vivo. Esta página destaca quatro decisões úteis, mas a disponibilidade, os modos, os schemas e a precificação do catálogo são autoritativos na CLI.",
      },
      {
        question: "Por que esta página inclui imagem para vídeo além de texto para vídeo?",
        answer:
          "Os fluxos de agente costumam começar de uma captura de tela, um frame de design ou um still de produto, em vez de um prompt isolado. O AnyCap trata texto para vídeo e imagem para vídeo como uma capability só para manter o fluxo consistente.",
      },
      {
        question: "Esta página fala de uma API de geração de vídeo ou de um fluxo CLI?",
        answer:
          "Das duas coisas. As equipes costumam procurar uma API de texto para vídeo ou de geração de vídeo, enquanto a execução em agentes normalmente acontece pela CLI do AnyCap.",
      },
    ] as const,
    nextStepsTitle: "Próximos passos",
    nextActions: [
      { label: "Instalar o AnyCap", href: "/start", primary: true },
      { label: "Fluxo do Codex", href: "/for/codex" },
      { label: "Ver no GitHub", href: "https://github.com/anycap-ai/anycap", external: true },
    ] as const,
    final: {
      title: "Deixe seu agente gerar o clipe.",
      body: "Comece pela CLI, escolha um modelo ao vivo e um modo compatível e mantenha geração, revisão e entrega no mesmo fluxo do agente.",
    },
  },
  id: {
    metadata: {
      title: "API generasi video untuk agen AI - text-to-video dan image-to-video",
      description:
        "Berikan generasi video ke agen AI melalui AnyCap. Gunakan Veo 3.1, Kling 3.0, dan Seedance 1.5 Pro untuk alur text-to-video, image-to-video, dan pembuatan video dalam satu CLI.",
      openGraphTitle: "API generasi video untuk agen AI - text-to-video dan image-to-video",
      openGraphDescription:
        "Berikan generasi video ke agen AI melalui AnyCap. Gunakan Veo 3.1, Kling 3.0, dan Seedance 1.5 Pro untuk alur text-to-video, image-to-video, dan pembuatan video dalam satu CLI.",
      articleHeadline: "API generasi video untuk agen AI - text-to-video dan image-to-video",
      articleDescription:
        "Panduan capability untuk menggunakan generasi video AnyCap dalam alur kerja agen AI dengan Veo 3.1, Kling 3.0, dan Seedance 1.5 Pro.",
      articleAbout: ["Generasi video", "API text-to-video", "Image-to-video", "AnyCap"],
      articleKeywords: [
        "generasi video untuk agen ai",
        "text to video api",
        "video creation api",
        "image to video",
        "veo 3.1",
      ],
    },
    breadcrumbItems: [
      { name: "Beranda", href: "/" },
      { name: "Capabilities", href: "/capabilities" },
      { name: "Generasi video", href: VIDEO_GENERATION_PATH },
    ],
    eyebrow: "Capabilities",
    lastUpdatedLabel: "Diperbarui 11 Juli 2026",
    hero: {
      title: "Generasi video",
      accentTitle: "untuk agen AI.",
      modeLines: ["Teks ke video.", "Gambar ke video."],
      intro:
        "Generasi video AnyCap memberi agen satu CLI untuk alur text-to-video dan image-to-video. Agen dapat menghasilkan klip sinematik singkat dari prompt, menganimasikan gambar diam menjadi gerak, dan menjalankan tugas pembuatan video lewat satu antarmuka yang konsisten, alih-alih merangkai API generasi video terpisah untuk setiap model atau penyedia. Hasilnya adalah lapisan generasi video yang lebih bersih untuk Claude Code, Cursor, Codex, dan produk agen serupa.",
      summaryLabel: "Ringkasan langsung",
      summaryText:
        "Gunakan AnyCap saat agen perlu membuat, mengedit, meninjau, dan meneruskan video melalui satu CLI. Pilih mode dan model dari katalog aktif, lalu pertahankan hasilnya dalam alur yang sama.",
    },
    heroActions: [
      { label: "Lengkapi agen Anda", href: "/start", primary: true },
      { label: "Alur Codex", href: "/for/codex" },
      { label: "Bandingkan model", href: "#models" },
    ] as const,
    demo: {
      labels: {
        header: "agen dengan AnyCap",
        name: "Nama",
        size: "Ukuran",
        date: "Tanggal",
        link: "Tautan",
      },
      lines: [
        { type: "header", delay: 0 },
        {
          type: "prompt",
          content: "Buat shot drone 5 detik melayang di atas pegunungan saat matahari terbenam",
          delay: 500,
        },
        {
          type: "text",
          content: "Saya akan membuat klip video itu menggunakan AnyCap.",
          delay: 800,
        },
        {
          type: "tool",
          content:
            "run(\"anycap video generate --prompt 'shot drone melintas di atas rangkaian pegunungan saat golden hour sunset' --model veo-3.1 -o mountains.mp4\")",
          delay: 600,
        },
        {
          type: "text",
          content: "Video dibuat — mountains.mp4 (5s, 1080p, 4.2 MB)",
          sub: "✓",
          delay: 2000,
        },
        { type: "video", delay: 400 },
        {
          type: "text",
          content: "Ini klipnya. Gerakan kamera mulus dengan nuansa hangat matahari terbenam.",
          delay: 600,
        },
        { type: "cursor", delay: 500 },
      ] as const,
    },
    demoCallout: {
      title: "Lihat alurnya, bukan hanya klaimnya.",
      body: "Prompt, panggilan model, klip yang dihasilkan, dan langkah berikutnya tetap dalam satu alur agen.",
    },
    positioning: {
      lines: ["API video mengekspos sebuah model.", "Alur agen membawa hasilnya ke langkah berikutnya."],
      summary: "AnyCap mengubah akses model menjadi tindakan agen.",
    },
    contrast: {
      before: "Pilih satu model, hubungkan satu API, lalu bangun ulang alurnya.",
      after: "Satu CLI, beberapa model video, dan output siap pakai untuk agen.",
    },
    proofPoints: [
      "Text-to-video, image-to-video, dan edit-video memakai satu permukaan perintah.",
      "Mode dan estimasi kredit katalog aktif terlihat sebelum agen memilih.",
      "Keputusan unggulan menjelaskan kecocokan terbaik dan kompromi praktisnya.",
      "Klip yang dikembalikan tetap tersedia untuk ditinjau, dikirim, dan dipakai pada langkah agen berikutnya.",
    ] as const,
    inputModesTitle: "Mulai dari input yang benar-benar Anda miliki",
    inputModes: [
      {
        title: "Brief teks",
        body: "Mulai dari uraian tertulis tentang scene, subjek, gerakan, kamera, dan output.",
        mode: "text-to-video",
        limitation: "Tidak tepat ketika frame sumber yang persis harus dipertahankan.",
      },
      {
        title: "Gambar referensi",
        body: "Animasikan gambar diam yang sudah disiapkan dan arahkan gerakan serta kamera melalui prompt.",
        mode: "image-to-video",
        limitation: "Memerlukan model yang mendukung dan gambar sumber yang sudah disiapkan.",
      },
      {
        title: "Footage yang sudah ada",
        body: "Sempurnakan klip sumber dengan instruksi alih-alih membuat klip baru dari awal.",
        mode: "edit-video",
        limitation: "Tersedia hanya ketika model aktif yang dipilih mengekspos mode tersebut.",
      },
    ] as const,
    variableCostLabel: "Bervariasi sesuai harga katalog",
    decisionTitle: "Cara memilih model video",
    decisionCardCta: "Buka panduan model →",
    decisionCardAriaLabelTemplate: "Baca panduan model {title}",
    decisionCards: [
      {
        modelId: "gemini-omni-flash-preview",
        eyebrow: "Edit footage yang sudah ada",
        title: "Gemini Omni Flash Preview",
        href: "/models/gemini-omni-flash-preview",
        body: "Gunakan saat agen memulai dari klip yang sudah ada dan membutuhkan edit atau penyempurnaan bahasa natural dalam alur AnyCap yang sama.",
        tradeoff: "Model ini hanya mengedit footage yang sudah ada; gunakan model generasi untuk membuat klip baru.",
      },
      {
        modelId: "seedance-2",
        eyebrow: "Default Seedance terbaru",
        title: "Seedance 2.0",
        href: "/models/seedance-2",
        body: "Terbaik saat agen membutuhkan entri Seedance yang lebih baru untuk video produk sinematik dan workflow image-to-video yang lebih rapi.",
        tradeoff: "Pilih varian Fast ketika waktu penyelesaian lebih penting daripada kualitas puncak.",
      },
      {
        modelId: "kling-3.0",
        eyebrow: "Gerakan sinematik",
        title: "Kling 3.0",
        href: "/models/kling-3-0",
        body: "Terbaik saat alur membutuhkan gaya gerakan yang lebih kuat atau iterasi image-to-video yang lebih fleksibel.",
        tradeoff: "Pilih model yang lebih murah atau lebih cepat ketika kecepatan pratinjau lebih penting daripada gerakan sinematik.",
      },
      {
        modelId: "veo-3.1",
        eyebrow: "First pass premium",
        title: "Veo 3.1",
        href: "/models/veo-3-1",
        body: "Terbaik saat briefing teks perlu menjadi teaser atau konsep klip yang lebih rapi pada generasi pertama.",
        tradeoff: "Pilih Veo 3.1 Fast ketika kecepatan iterasi lebih penting daripada hasil akhir maksimum.",
      },
    ] as const,
    supportedModelsTitle: "Empat keputusan model unggulan",
    tableHeaders: {
      model: "Model",
      modes: "Mode",
      cost: "Biaya",
      bestFit: "Paling cocok",
      tradeoff: "Kompromi",
    },
    timingNote:
      "Waktu generasi bervariasi menurut model, keadaan antrean, durasi, dan pengaturan. CLI menunggu penyelesaian di sisi server dan mengembalikan hasil saat perintah selesai; tidak ada janji latensi tetap.",
    usageTitle: "Penggunaan CLI",
    usageIntro:
      "Jalankan anycap video models untuk melihat inventaris aktif lengkap, lalu periksa schema model yang dipilih sebelum memberikan referensi lokal. Contoh ini menunjukkan bentuk perintah saat ini untuk setiap jalur input.",
    usageExamples: [
      {
        title: "Text-to-video",
        code:
          'anycap video generate --prompt "shot drone terbang di atas rangkaian pegunungan saat matahari terbenam" --model veo-3.1 -o hero.mp4',
      },
      {
        title: "Image-to-video",
        code:
          'anycap video generate --prompt "animasikan still ini menjadi gerakan kamera yang halus" --model seedance-1.5-pro --mode image-to-video --param images=./frame.jpg -o animated.mp4',
      },
      {
        title: "Edit video yang sudah ada",
        code:
          'anycap video generate --prompt "terangkan pencahayaan dan tambahkan slow zoom halus" --model gemini-omni-flash-preview --mode edit-video --param videos=./source.mp4 -o refined.mp4',
      },
      {
        title: "Temukan model",
        code: "anycap video models",
      },
    ] as const,
    workflowStatement:
      "Unit yang berguna adalah seluruh siklus agen: periksa capability aktif, pilih mode yang didukung, buat atau edit, tinjau klip yang dikembalikan, lalu kirim tanpa berpindah permukaan integrasi.",
    useCasesTitle: "Saat agen membutuhkan generasi video",
    useCases: [
      {
        title: "Video demo",
        description:
          "Hasilkan klip peluncuran, walkthrough, dan demo produk lewat satu command.",
      },
      {
        title: "Storyboard ke motion",
        description:
          "Ubah still desain, screenshot, atau frame referensi menjadi draft video animasi.",
      },
      {
        title: "Konten sosial",
        description:
          "Buat klip pendek untuk kampanye, pengumuman changelog, dan workflow kreator.",
      },
      {
        title: "Prototipe cepat",
        description:
          "Jelajahi konsep visual dalam motion sebelum masuk ke fase produksi yang lebih besar.",
      },
    ] as const,
    fitSignalsTitle: "Sinyal kecocokan alur",
    fitSignals: [
      {
        label: "Paling cocok",
        body: "Agen yang membutuhkan pembuatan atau pengeditan video berulang dalam alur coding, riset, atau konten.",
      },
      {
        label: "Tidak cocok",
        body: "Tim yang hanya memerlukan editor konsumen dengan antarmuka manual berbasis timeline.",
      },
      {
        label: "Pemeriksaan operasional",
        body: "Agen dapat memeriksa schema aktif, mempertahankan konteks permintaan, dan menangani pengiriman secara terpisah dari generasi.",
      },
    ] as const,
    failuresTitle: "Arti kegagalan yang umum",
    failureItems: [
      {
        title: "Model yang dipilih tidak mengekspos mode yang diminta",
        body: "Jalankan anycap video models <model-id> schema --operation generate --mode <mode> dan pilih mode yang dinyatakan oleh model aktif.",
      },
      {
        title: "Referensi lokal tidak ada atau memakai kunci schema yang salah",
        body: "Periksa schema aktif dan gunakan --param images=... atau --param videos=... hanya ketika parameter tersebut dinyatakan.",
      },
      {
        title: "Unduhan otomatis gagal setelah generasi",
        body: "Generasi mungkin sudah berhasil, tetapi CLI melaporkan error unduhan otomatis sebelum hasil normal. Jangan berasumsi bahwa URL atau ID permintaan telah dikembalikan. Perbaiki path lokal atau koneksi, simpan trace_id untuk dukungan, dan jalankan ulang dengan sengaja karena tindakan itu dapat membuat klip lain.",
      },
      {
        title: "Output tidak sesuai dengan brief",
        body: "Tinjau klip, perketat instruksi gerakan, kamera, dan subjek, lalu coba lagi tanpa mengklaim frame deterministik.",
      },
    ] as const,
    relatedTitle: "Lanjutkan alur agen",
    relatedCards: [
      {
        eyebrow: "Halaman agen",
        title: "Alur video untuk Codex",
        href: "/for/codex",
        description:
          "Lihat bagaimana Codex menemukan capability, menjalankan perintah AnyCap, dan meneruskan hasil terstruktur.",
      },
      {
        eyebrow: "Capability terkait",
        title: "Analisis video",
        href: "/capabilities/video-analysis",
        description:
          "Periksa klip hasil atau sumber sebelum langkah edit, pengiriman, atau publikasi berikutnya.",
      },
      {
        eyebrow: "Panduan implementasi",
        title: "Tambahkan generasi video ke agen AI",
        href: "/guides/how-to-add-video-generation-to-ai-agent",
        description:
          "Ikuti alur berbasis schema dari penemuan model hingga generasi, penanganan hasil, dan percobaan ulang.",
      },
    ] as const,
    faqTitle: "FAQ",
    faqItems: [
      {
        question: "Apa yang bisa dilakukan agen dengan generasi video AnyCap?",
        answer:
          "Itu memberi agen satu surface perintah untuk alur text-to-video dan image-to-video. Tim dapat menghasilkan klip baru, menganimasikan gambar referensi, dan menjalankan tugas pembuatan video yang berulang tanpa integrasi penyedia terpisah.",
      },
      {
        question: "Model video apa saja yang tersedia di AnyCap sekarang?",
        answer:
          "Jalankan anycap video models untuk inventaris aktif lengkap. Halaman ini menyoroti empat keputusan yang berguna, tetapi ketersediaan, mode, schema, dan harga katalog tetap bersumber dari CLI.",
      },
      {
        question: "Mengapa halaman ini menyertakan image-to-video selain text-to-video?",
        answer:
          "Alur agen sering dimulai dari screenshot, frame desain, atau still produk, bukan dari prompt saja. AnyCap memperlakukan text-to-video dan image-to-video sebagai satu capability agar alurnya tetap konsisten.",
      },
      {
        question: "Apakah halaman ini tentang API generasi video atau workflow CLI?",
        answer:
          "Keduanya. Tim sering mencari API text-to-video atau API generasi video, sementara eksekusi agen biasanya berjalan lewat CLI AnyCap.",
      },
    ] as const,
    nextStepsTitle: "Langkah berikutnya",
    nextActions: [
      { label: "Instal AnyCap", href: "/start", primary: true },
      { label: "Alur Codex", href: "/for/codex" },
      { label: "Lihat di GitHub", href: "https://github.com/anycap-ai/anycap", external: true },
    ] as const,
    final: {
      title: "Biarkan agen Anda membuat klipnya.",
      body: "Mulai dari CLI, pilih model aktif dan mode yang didukung saat runtime, lalu pertahankan generasi, peninjauan, dan pengiriman dalam alur agen yang sama.",
    },
  },
  de: {
    metadata: {
      title: "Videogenerierungs-API für KI-Agenten – Text-to-Video und Image-to-Video",
      description:
        "Geben Sie KI-Agenten Videogenerierung über AnyCap. Nutzen Sie Veo 3.1, Kling 3.0 und Seedance 1.5 Pro für Text-to-Video, Image-to-Video und Video-Erstellungs-Workflows über eine einzige CLI.",
      openGraphTitle: "Videogenerierungs-API für KI-Agenten – Text-to-Video und Image-to-Video",
      openGraphDescription:
        "Geben Sie KI-Agenten Videogenerierung über AnyCap. Nutzen Sie Veo 3.1, Kling 3.0 und Seedance 1.5 Pro für Text-to-Video, Image-to-Video und Video-Erstellungs-Workflows über eine einzige CLI.",
      articleHeadline: "Videogenerierungs-API für KI-Agenten – Text-to-Video und Image-to-Video",
      articleDescription:
        "Praxisleitfaden zur Nutzung der AnyCap-Videogenerierung in Workflows von KI-Agenten mit Veo 3.1, Kling 3.0 und Seedance 1.5 Pro.",
      articleAbout: ["Videogenerierung", "Text-to-Video-API", "Image-to-Video", "AnyCap"],
      articleKeywords: [
        "videogenerierung für ki-agenten",
        "text to video api",
        "video creation api",
        "image to video",
        "veo 3.1",
      ],
    },
    breadcrumbItems: [
      { name: "Startseite", href: "/" },
      { name: "Capabilities", href: "/capabilities" },
      { name: "Videogenerierung", href: VIDEO_GENERATION_PATH },
    ],
    eyebrow: "Capabilities",
    lastUpdatedLabel: "Zuletzt aktualisiert am 11. Juli 2026",
    hero: {
      title: "Videogenerierung",
      accentTitle: "für KI-Agenten.",
      modeLines: ["Text zu Video.", "Bild zu Video."],
      intro:
        "Mit der AnyCap-Videogenerierung erhalten Agenten eine CLI für Text-to-Video- und Image-to-Video-Workflows. Agenten generieren kurze cinematische Clips aus Prompts, animieren Standbilder und führen Video-Erstellungs-Aufgaben über eine einzige Schnittstelle aus, statt separate Videogenerierungs-APIs zusammenzustückeln. Daraus entsteht eine sauberere Videogenerierungs-Schicht für Claude Code, Cursor, Codex und ähnliche Agenten-Produkte.",
      summaryLabel: "Kurz vorab",
      summaryText:
        "Nutzen Sie AnyCap, wenn ein Agent Videos über eine einzige CLI erstellen, bearbeiten, prüfen und weiterleiten soll. Wählen Sie Modus und Modell aus dem Live-Katalog und behalten Sie das Ergebnis im selben Workflow.",
    },
    heroActions: [
      { label: "Agent ausstatten", href: "/start", primary: true },
      { label: "Codex-Workflow", href: "/for/codex" },
      { label: "Modelle vergleichen", href: "#models" },
    ] as const,
    demo: {
      labels: {
        header: "Agent mit AnyCap",
        name: "Name",
        size: "Größe",
        date: "Datum",
        link: "Link",
      },
      lines: [
        { type: "header", delay: 0 },
        {
          type: "prompt",
          content: "Erstelle eine 5-sekündige Drohnenaufnahme über Bergen bei Sonnenuntergang",
          delay: 500,
        },
        {
          type: "text",
          content: "Ich generiere einen Video-Clip mit AnyCap.",
          delay: 800,
        },
        {
          type: "tool",
          content:
            "run(\"anycap video generate --prompt 'drone shot flying over mountain range at golden hour sunset' --model veo-3.1 -o mountains.mp4\")",
          delay: 600,
        },
        {
          type: "text",
          content: "Video fertig – mountains.mp4 (5s, 1080p, 4.2 MB)",
          sub: "✓",
          delay: 2000,
        },
        { type: "video", delay: 400 },
        {
          type: "text",
          content: "Hier ist der Clip. Sanfte Kamerabewegung mit warmen Sonnenuntergangstönen.",
          delay: 600,
        },
        { type: "cursor", delay: 500 },
      ] as const,
    },
    demoCallout: {
      title: "Zeigen Sie den Workflow, nicht nur das Versprechen.",
      body: "Prompt, Modellaufruf, generierter Clip und nächster Schritt bleiben in einem Agenten-Workflow.",
    },
    positioning: {
      lines: ["Eine Video-API stellt ein Modell bereit.", "Ein Agenten-Workflow führt das Ergebnis weiter."],
      summary: "AnyCap macht aus Modellzugriff eine Agenten-Aktion.",
    },
    contrast: {
      before: "Ein Modell wählen, eine API anbinden und den Workflow neu bauen.",
      after: "Eine CLI, mehrere Videomodelle und agentenfähige Ergebnisse.",
    },
    proofPoints: [
      "Text-to-Video, Image-to-Video und Edit-Video nutzen eine gemeinsame Befehlsoberfläche.",
      "Modi und Credit-Schätzungen des Live-Katalogs sind vor der Auswahl sichtbar.",
      "Die vorgestellten Entscheidungen erklären Eignung und praktischen Kompromiss.",
      "Zurückgegebene Clips bleiben für Prüfung, Auslieferung und den nächsten Agenten-Schritt verfügbar.",
    ] as const,
    inputModesTitle: "Starten Sie mit dem Eingangsmaterial, das wirklich vorliegt",
    inputModes: [
      {
        title: "Text-Briefing",
        body: "Beginnen Sie mit einer Beschreibung von Szene, Motiv, Bewegung, Kamera und gewünschtem Ergebnis.",
        mode: "text-to-video",
        limitation: "Nicht geeignet, wenn ein exakter Ausgangsframe erhalten bleiben muss.",
      },
      {
        title: "Referenzbild",
        body: "Animieren Sie ein vorbereitetes Standbild und steuern Sie Bewegung und Kamera über den Prompt.",
        mode: "image-to-video",
        limitation: "Erfordert ein unterstütztes Modell und ein vorbereitetes Ausgangsbild.",
      },
      {
        title: "Bestehendes Videomaterial",
        body: "Verfeinern Sie einen Quellclip mit Anweisungen, statt einen neuen Clip von Grund auf zu erzeugen.",
        mode: "edit-video",
        limitation: "Nur verfügbar, wenn das ausgewählte Live-Modell diesen Modus anbietet.",
      },
    ] as const,
    variableCostLabel: "Variiert je nach Katalogpreis",
    decisionTitle: "So wählen Sie zwischen den Video-Modellen",
    decisionCardCta: "Modell-Leitfaden öffnen →",
    decisionCardAriaLabelTemplate: "Modell-Leitfaden zu {title} lesen",
    decisionCards: [
      {
        modelId: "gemini-omni-flash-preview",
        eyebrow: "Bearbeitung bestehenden Materials",
        title: "Gemini Omni Flash Preview",
        href: "/models/gemini-omni-flash-preview",
        body: "Geeignet, wenn der Agent mit einem bestehenden Clip startet und natürlichsprachliche Bearbeitungen oder Verfeinerungen im selben AnyCap-Workflow benötigt.",
        tradeoff: "Das Modell bearbeitet nur bestehendes Videomaterial; verwenden Sie für einen neuen Clip ein Generierungsmodell.",
      },
      {
        modelId: "seedance-2",
        eyebrow: "Neuerer Seedance-Standard",
        title: "Seedance 2.0",
        href: "/models/seedance-2",
        body: "Geeignet, wenn der Agent den neueren Seedance-Eintrag für cinematische Produktvideos und poliertere Image-to-Video-Workflows braucht.",
        tradeoff: "Wählen Sie die Fast-Variante, wenn kurze Durchlaufzeit wichtiger ist als Spitzenqualität.",
      },
      {
        modelId: "kling-3.0",
        eyebrow: "Cinematische Bewegung",
        title: "Kling 3.0",
        href: "/models/kling-3-0",
        body: "Geeignet, wenn der Workflow stärkere Bewegungsstile oder flexiblere Image-to-Video-Iteration braucht.",
        tradeoff: "Wählen Sie ein günstigeres oder schnelleres Modell, wenn Vorschaugeschwindigkeit wichtiger ist als cinematische Bewegung.",
      },
      {
        modelId: "veo-3.1",
        eyebrow: "Premium-Erstpass",
        title: "Veo 3.1",
        href: "/models/veo-3-1",
        body: "Geeignet, wenn das Text-Briefing schon beim ersten Lauf zu einem polierten Teaser oder Konzept-Clip werden soll.",
        tradeoff: "Wählen Sie Veo 3.1 Fast, wenn Iterationsgeschwindigkeit wichtiger ist als maximale Ausarbeitung.",
      },
    ] as const,
    supportedModelsTitle: "Vier vorgestellte Modellentscheidungen",
    tableHeaders: {
      model: "Modell",
      modes: "Modi",
      cost: "Kosten",
      bestFit: "Geeignet für",
      tradeoff: "Kompromiss",
    },
    timingNote:
      "Die Generierungszeit variiert je nach Modell, Warteschlangenstatus, Dauer und Einstellungen. Die CLI wartet auf den serverseitigen Abschluss und gibt das Ergebnis zurück, wenn der Befehl endet; eine feste Latenz wird nicht versprochen.",
    usageTitle: "CLI-Nutzung",
    usageIntro:
      "Führen Sie anycap video models für den vollständigen Live-Bestand aus und prüfen Sie vor lokalen Referenzen das Schema des gewählten Modells. Diese Beispiele zeigen die aktuelle Befehlsform für jeden Eingangsweg.",
    usageExamples: [
      {
        title: "Text-to-Video",
        code:
          'anycap video generate --prompt "a drone shot flying over a mountain range at sunset" --model veo-3.1 -o hero.mp4',
      },
      {
        title: "Image-to-Video",
        code:
          'anycap video generate --prompt "animate this still into a subtle camera move" --model seedance-1.5-pro --mode image-to-video --param images=./frame.jpg -o animated.mp4',
      },
      {
        title: "Bestehendes Video bearbeiten",
        code:
          'anycap video generate --prompt "brighten the lighting and add a subtle slow zoom" --model gemini-omni-flash-preview --mode edit-video --param videos=./source.mp4 -o refined.mp4',
      },
      {
        title: "Modelle entdecken",
        code: "anycap video models",
      },
    ] as const,
    workflowStatement:
      "Die nützliche Einheit ist der gesamte Agenten-Zyklus: Live-Capability prüfen, einen unterstützten Modus wählen, generieren oder bearbeiten, den zurückgegebenen Clip prüfen und ohne Wechsel der Integrationsoberfläche ausliefern.",
    useCasesTitle: "Wann Agenten Videogenerierung brauchen",
    useCases: [
      {
        title: "Demo-Videos",
        description: "Launch-Clips, Walkthroughs und Produkt-Demos über einen einzigen Befehl generieren.",
      },
      {
        title: "Storyboards in Bewegung",
        description: "Design-Stills, Screenshots oder Referenz-Frames in animierte Video-Entwürfe verwandeln.",
      },
      {
        title: "Social Content",
        description:
          "Kurzform-Clips für Kampagnen, Changelog-Ankündigungen und Creator-Workflows produzieren.",
      },
      {
        title: "Schnelles Prototyping",
        description:
          "Visuelle Konzepte in Bewegung erkunden, bevor ein größerer Produktions-Pass committed wird.",
      },
    ] as const,
    fitSignalsTitle: "Signale für die Workflow-Eignung",
    fitSignals: [
      {
        label: "Geeignet",
        body: "Agenten, die Videos wiederholbar in Coding-, Recherche- oder Content-Workflows erstellen oder bearbeiten müssen.",
      },
      {
        label: "Nicht geeignet",
        body: "Teams, die nur einen Consumer-Editor mit manueller, Timeline-basierter Oberfläche benötigen.",
      },
      {
        label: "Operative Prüfung",
        body: "Der Agent kann das Live-Schema prüfen, Anfragekontext behalten und die Auslieferung getrennt von der Generierung behandeln.",
      },
    ] as const,
    failuresTitle: "Was häufige Fehler bedeuten",
    failureItems: [
      {
        title: "Das gewählte Modell bietet den angeforderten Modus nicht an",
        body: "Führen Sie anycap video models <model-id> schema --operation generate --mode <mode> aus und wählen Sie einen Modus, den das Live-Modell deklariert.",
      },
      {
        title: "Eine lokale Referenz fehlt oder nutzt den falschen Schema-Schlüssel",
        body: "Prüfen Sie das Live-Schema und verwenden Sie --param images=... oder --param videos=... nur, wenn der Parameter deklariert ist.",
      },
      {
        title: "Der automatische Download schlägt nach der Generierung fehl",
        body: "Die Generierung kann bereits erfolgreich gewesen sein, aber die CLI meldet den Fehler des automatischen Downloads vor dem normalen Ergebnis. Gehen Sie nicht davon aus, dass eine URL oder Anfrage-ID zurückgegeben wurde. Beheben Sie den lokalen Pfad oder die Verbindung, bewahren Sie die trace_id für den Support auf und führen Sie den Befehl bewusst erneut aus, da dabei ein weiterer Clip entstehen kann.",
      },
      {
        title: "Das Ergebnis entspricht nicht dem Briefing",
        body: "Prüfen Sie den Clip, präzisieren Sie Bewegung, Kamera und Motiv und versuchen Sie es erneut, ohne deterministische Frames zu versprechen.",
      },
    ] as const,
    relatedTitle: "Agenten-Workflow fortsetzen",
    relatedCards: [
      {
        eyebrow: "Agenten-Seite",
        title: "Video-Workflows für Codex",
        href: "/for/codex",
        description: "So entdeckt Codex Capabilities, führt AnyCap-Befehle aus und verarbeitet strukturierte Ergebnisse weiter.",
      },
      {
        eyebrow: "Verwandte Capability",
        title: "Videoanalyse",
        href: "/capabilities/video-analysis",
        description: "Prüfen Sie einen generierten oder vorhandenen Clip vor Bearbeitung, Auslieferung oder Veröffentlichung.",
      },
      {
        eyebrow: "Implementierungsleitfaden",
        title: "Videogenerierung zu einem KI-Agenten hinzufügen",
        href: "/guides/how-to-add-video-generation-to-ai-agent",
        description:
          "Folgen Sie dem Schema-basierten Ablauf von der Modellsuche über Generierung und Ergebnisbehandlung bis zu Wiederholungen.",
      },
    ] as const,
    faqTitle: "FAQ",
    faqItems: [
      {
        question: "Was ermöglicht die AnyCap-Videogenerierung Agenten?",
        answer:
          "Sie gibt Agenten eine einzige Befehlsoberfläche für Text-to-Video- und Image-to-Video-Workflows. Teams können neue Clips generieren, Referenzbilder animieren und wiederholbare Video-Erstellungs-Aufgaben ohne separate anbieterspezifische Integrationen ausführen.",
      },
      {
        question: "Welche Video-Modelle sind heute über AnyCap verfügbar?",
        answer:
          "Führen Sie anycap video models für den vollständigen Live-Bestand aus. Diese Seite hebt vier nützliche Entscheidungen hervor; Verfügbarkeit, Modi, Schemas und Katalogpreise bleiben in der CLI maßgeblich.",
      },
      {
        question: "Warum behandelt diese Seite Image-to-Video sowie Text-to-Video?",
        answer:
          "Agenten-Workflows starten oft von einem Screenshot, Design-Frame oder Produkt-Still anstatt von einem Prompt allein. AnyCap führt sowohl Text-to-Video als auch Image-to-Video unter einer Videogenerierungs-Capability zusammen, damit der Workflow konsistent bleibt.",
      },
      {
        question: "Geht es auf dieser Seite um eine Videogenerierungs-API oder einen CLI-Workflow?",
        answer:
          "Beides. Teams suchen häufig nach einer Text-to-Video-API oder Videogenerierungs-API, während die Agenten-Ausführung meist über die AnyCap-CLI läuft.",
      },
    ] as const,
    nextStepsTitle: "Nächste Schritte",
    nextActions: [
      { label: "AnyCap installieren", href: "/start", primary: true },
      { label: "Codex-Workflow", href: "/for/codex" },
      { label: "Auf GitHub ansehen", href: "https://github.com/anycap-ai/anycap", external: true },
    ] as const,
    final: {
      title: "Lassen Sie Ihren Agenten den Clip erzeugen.",
      body: "Starten Sie mit der CLI, wählen Sie zur Laufzeit ein Live-Modell und einen unterstützten Modus und behalten Sie Generierung, Prüfung und Auslieferung im selben Agenten-Workflow.",
    },
  },
} as const satisfies Record<SiteLocale, VideoGenerationPageContent>;

function getDecisionModels(
  cards: readonly VideoGenerationCard[],
  variableCostLabel: string,
): VideoGenerationModel[] {
  const catalogById = new Map(
    getCatalogModelsByCapability("video").map((model) => [model.modelId, model]),
  );

  return cards.map((card) => {
    const model = catalogById.get(card.modelId);
    if (!model) throw new Error(`Missing active video catalog model: ${card.modelId}`);

    return {
      modelId: model.modelId,
      name: model.displayName,
      href: model.path,
      modes: model.modes.join(", "),
      cost:
        model.creditEstimate === VARIABLE_CATALOG_COST
          ? variableCostLabel
          : model.creditEstimate,
      bestFor: card.body,
      tradeoff: card.tradeoff,
    };
  });
}

function getAvailableInputModes(
  inputModes: readonly VideoGenerationInputMode[],
): readonly VideoGenerationInputMode[] {
  const availableModes = new Set(
    getCatalogModelsByCapability("video").flatMap((model) => model.modes),
  );
  return inputModes.filter((item) => availableModes.has(item.mode));
}

export function getVideoGenerationMetadata(locale: SiteLocale): Metadata {
  const content = contentByLocale[locale] ?? contentByLocale.en;

  return {
    title: content.metadata.title,
    description: content.metadata.description,
    alternates: { canonical: VIDEO_GENERATION_PATH },
    openGraph: {
      type: "website",
      locale: getLocaleConfig(locale).ogLocale,
      url: VIDEO_GENERATION_PATH,
      siteName: siteConfig.siteName,
      title: content.metadata.openGraphTitle,
      description: content.metadata.openGraphDescription,
    },
  };
}

export function getVideoGenerationPageData(locale: SiteLocale) {
  const content: VideoGenerationPageContent = contentByLocale[locale] ?? contentByLocale.en;

  const capabilityGuideJsonLd = createTechArticleJsonLd({
    headline: content.metadata.articleHeadline,
    description: content.metadata.articleDescription,
    path: VIDEO_GENERATION_PATH,
    locale,
    about: [...content.metadata.articleAbout],
    keywords: [...content.metadata.articleKeywords],
    datePublished: ARTICLE_PUBLISHED_ISO,
    dateModified: LAST_UPDATED_ISO,
  });

  return {
    ...content,
    models: getDecisionModels(content.decisionCards, content.variableCostLabel),
    inputModes: getAvailableInputModes(content.inputModes),
    capabilityGuideJsonLd,
    faqJsonLd: createFaqPageJsonLd(content.faqItems),
  };
}

export type VideoGenerationPageData = ReturnType<typeof getVideoGenerationPageData>;
