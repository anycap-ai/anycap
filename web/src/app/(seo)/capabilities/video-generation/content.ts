import type { Metadata } from "next";
import { createFaqPageJsonLd, createTechArticleJsonLd } from "@/lib/schema";
import { getLocaleConfig, siteConfig, type SiteLocale } from "@/lib/site";
import { type DemoLine } from "@/components/landing/CapabilityDemo";
import { getCatalogModelsByCapability } from "@/lib/seo/model-catalog";

export const VIDEO_GENERATION_PATH = "/capabilities/video-generation";

const LAST_UPDATED_ISO = "2026-04-05";

type VideoGenerationDemoLabels = {
  header: string;
  name: string;
  size: string;
  date: string;
  link: string;
};

type VideoGenerationCard = {
  eyebrow: string;
  title: string;
  href: string;
  body: string;
};

type VideoGenerationModel = {
  name: string;
  href: string;
  modes: string;
  bestFor: string;
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

type VideoGenerationOpusCallout = {
  eyebrow: string;
  title: string;
  body: string;
  ctas: readonly { label: string; href: string }[];
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
    intro: string;
    summaryLabel: string;
    summaryText: string;
  };
  opusCallout: VideoGenerationOpusCallout;
  demo: {
    labels: VideoGenerationDemoLabels;
    lines: readonly DemoLine[];
  };
  decisionTitle: string;
  decisionCardCta: string;
  decisionCardAriaLabelTemplate: string;
  decisionCards: readonly VideoGenerationCard[];
  supportedModelsTitle: string;
  tableHeaders: {
    model: string;
    modes: string;
    bestFit: string;
  };
  models: readonly VideoGenerationModel[];
  usageTitle: string;
  usageExamples: readonly { title: string; code: string }[];
  useCasesTitle: string;
  useCases: readonly VideoGenerationUseCase[];
  relatedTitle: string;
  relatedCards: readonly VideoGenerationRelatedCard[];
  faqTitle: string;
  faqItems: readonly VideoGenerationFaqItem[];
  nextStepsTitle: string;
  nextActions: readonly VideoGenerationNextAction[];
};

const contentByLocale = {
  en: {
    metadata: {
      title: "Video Generation API for AI agents - Text-to-video and image-to-video",
      description:
        "Give AI agents video generation through AnyCap. Use active models such as Veo 3.1, Veo 3.1 Fast, Sora 2 Pro, Kling 3.0, Kling O1, Hailuo 2.3, Seedance 2.0, and Seedance 1.5 Pro for text-to-video, image-to-video, and video creation workflows through one CLI.",
      openGraphTitle: "Video Generation API for AI agents - Text-to-video and image-to-video",
      openGraphDescription:
        "Give AI agents video generation through AnyCap. Use active models such as Veo 3.1, Veo 3.1 Fast, Sora 2 Pro, Kling 3.0, Kling O1, Hailuo 2.3, Seedance 2.0, and Seedance 1.5 Pro for text-to-video, image-to-video, and video creation workflows through one CLI.",
      articleHeadline: "Video Generation API for AI agents - Text-to-video and image-to-video",
      articleDescription:
        "Capability guide for using AnyCap video generation across AI agent workflows with active video models including Veo 3.1, Veo 3.1 Fast, Sora 2 Pro, Kling 3.0, Kling O1, Hailuo 2.3, Seedance 2.0, and Seedance 1.5 Pro.",
      articleAbout: ["Video generation", "Text-to-video API", "Image-to-video", "AnyCap"],
      articleKeywords: [
        "video generation for ai agents",
        "text to video api",
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
    lastUpdatedLabel: "Last updated April 5, 2026",
    hero: {
      title: "Video Generation",
      intro:
        "AnyCap video generation gives agents one CLI for text-to-video and image-to-video workflows. Agents can generate short cinematic clips from prompts, animate still images into motion, and run video creation tasks through one interface instead of stitching together separate video generation APIs. The result is a cleaner video generation layer for Claude Code, Cursor, Codex, and similar agent products.",
      summaryLabel: "Answer-first summary",
      summaryText:
        "Use Veo 3.1 when the first-pass clip needs to look more premium from a text brief, Kling 3.0 when the workflow leans on cinematic motion or more exploratory image-to-video work, and Seedance 1.5 Pro when the team wants a steadier production-friendly default.",
    },
    opusCallout: {
      eyebrow: "Used with Claude Opus 4.7",
      title: "Claude Code on Opus 4.7 + AnyCap video generation = insane",
      body:
        "Claude Code now runs on Claude Opus 4.7 — the strongest reasoning and coding agent Anthropic has shipped. Opus 4.7 still does not natively generate video. Pair it with AnyCap and the same terminal session reaches Veo 3.1, Seedance 1.5 Pro, and Kling 3.0 through one CLI and one login. The Opus 4.7 + AnyCap combo is the recommended default for video-heavy agent workflows in 2026.",
      ctas: [
        { label: "Claude Code video generation →", href: "/for/claude-code/video-generation" },
        { label: "Opus 4.7 image + video workflow →", href: "/guides/claude-opus-4-7-image-video-workflow" },
      ],
    },
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
    decisionTitle: "How to choose among video models",
    decisionCardCta: "Open model guide →",
    decisionCardAriaLabelTemplate: "Read the {title} model guide",
    decisionCards: [
      {
        eyebrow: "Newer Seedance default",
        title: "Seedance 2.0",
        href: "/models/seedance-2",
        body: "Best when the agent needs the newer Seedance entry for cinematic product videos and polished image-to-video workflows.",
      },
      {
        eyebrow: "Cinematic motion",
        title: "Kling 3.0",
        href: "/models/kling-3-0",
        body: "Best when the workflow wants stronger motion style or more flexible image-to-video iteration.",
      },
      {
        eyebrow: "Premium first pass",
        title: "Veo 3.1",
        href: "/models/veo-3-1",
        body: "Best when the text brief needs to become a more polished teaser or concept clip on the first generation.",
      },
    ] as const,
    supportedModelsTitle: "Supported models",
    tableHeaders: {
      model: "Model",
      modes: "Modes",
      bestFit: "Best fit",
    },
    models: [
      {
        name: "Veo 3.1",
        href: "/models/veo-3-1",
        modes: "text-to-video, image-to-video",
        bestFor: "High-end cinematic output and premium video generation workflows",
      },
      {
        name: "Kling 3.0",
        href: "/models/kling-3-0",
        modes: "text-to-video, image-to-video",
        bestFor: "Realistic motion and cinematic scene generation",
      },
      {
        name: "Seedance 1.5 Pro",
        href: "/models/seedance-1-5-pro",
        modes: "text-to-video, image-to-video",
        bestFor: "Reliable image-to-video output and production-friendly motion quality",
      },
    ] as const,
    usageTitle: "CLI usage",
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
        title: "Discover models",
        code: "anycap video models",
      },
    ] as const,
    useCasesTitle: "When agents need video generation",
    useCases: [
      {
        title: "Demo videos",
        description: "Generate launch clips, walkthroughs, and product demos through one command.",
      },
      {
        title: "Storyboards to motion",
        description: "Turn design stills, screenshots, or reference frames into animated video drafts.",
      },
      {
        title: "Social content",
        description:
          "Produce short-form clips for campaigns, changelog announcements, and creator workflows.",
      },
      {
        title: "Rapid prototyping",
        description:
          "Explore visual concepts in motion before committing to a larger production pass.",
      },
    ] as const,
    relatedTitle: "Related models and guides",
    relatedCards: [
      {
        eyebrow: "Model",
        title: "Veo 3.1",
        href: "/models/veo-3-1",
        description: "See when Veo 3.1 is the right choice for premium agent-led video generation.",
      },
      {
        eyebrow: "Agent page",
        title: "For Claude Code",
        href: "/for/claude-code",
        description: "See how video generation fits into the broader Claude Code capability story.",
      },
      {
        eyebrow: "Related capability",
        title: "Image Generation",
        href: "/capabilities/image-generation",
        description:
          "Pair image generation with video workflows when the agent starts from stills or concept frames.",
      },
    ] as const,
    faqTitle: "FAQ",
    faqItems: [
      {
        question: "What does AnyCap video generation let agents do?",
        answer:
          "It gives agents one command surface for text-to-video and image-to-video workflows. Teams can generate new clips, animate reference images, and run repeatable video creation tasks without separate provider-specific integrations.",
      },
      {
        question: "Which video models are available through AnyCap today?",
        answer:
          "The current AnyCap video generation catalog includes Veo 3.1, Veo 3.1 Fast, Sora 2 Pro, Kling 3.0, Kling O1, Hailuo 2.3, Seedance 2.0, Seedance 2.0 Fast, and Seedance 1.5 Pro. Each listed model is available through the same AnyCap video generation API, CLI, and auth flow.",
      },
      {
        question: "Why does this page include image-to-video as well as text-to-video?",
        answer:
          "Agent workflows often start from a screenshot, design frame, or product still rather than a prompt alone. AnyCap treats both text-to-video and image-to-video as one video generation capability so the workflow stays consistent.",
      },
      {
        question: "Is this page about a video generation API or a CLI workflow?",
        answer:
          "It is both. Teams often search for a text-to-video API or video generation API, while agent execution usually happens through the AnyCap CLI.",
      },
    ] as const,
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
    ] as const,
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
    lastUpdatedLabel: "Atualizado em 5 de abril de 2026",
    hero: {
      title: "Geração de vídeo",
      intro:
        "A geração de vídeo do AnyCap dá aos agentes uma única CLI para fluxos de texto para vídeo e imagem para vídeo. Os agentes podem gerar clipes cinematográficos curtos a partir de prompts, animar imagens estáticas em movimento e executar tarefas de criação de vídeo por meio de uma interface consistente, em vez de integrar APIs separadas para cada modelo ou provedor. O resultado é uma camada de geração de vídeo mais limpa para Claude Code, Cursor, Codex e produtos de agente semelhantes.",
      summaryLabel: "Resumo direto",
      summaryText:
        "Use o Veo 3.1 quando o primeiro clipe precisar parecer mais premium a partir de um briefing textual, o Kling 3.0 quando o fluxo depender mais de movimento cinematográfico ou de uma exploração mais flexível de imagem para vídeo, e o Seedance 1.5 Pro quando a equipe quiser um padrão mais estável e amigável para produção.",
    },
    opusCallout: {
      eyebrow: "Usado com Claude Opus 4.7",
      title: "Claude Code no Opus 4.7 + AnyCap geração de vídeo = absurdo",
      body:
        "O Claude Code agora roda no Claude Opus 4.7 — o agente de raciocínio e código mais forte que a Anthropic já lançou. O Opus 4.7 ainda não gera vídeo nativamente. Combine com o AnyCap e a mesma sessão de terminal alcança Veo 3.1, Seedance 1.5 Pro e Kling 3.0 com uma CLI e um login. O combo Opus 4.7 + AnyCap é o default recomendado para fluxos de agente focados em vídeo em 2026.",
      ctas: [
        { label: "Claude Code geração de vídeo →", href: "/for/claude-code/video-generation" },
        { label: "Workflow de imagem + vídeo no Opus 4.7 →", href: "/guides/claude-opus-4-7-image-video-workflow" },
      ],
    },
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
    decisionTitle: "Como escolher entre os modelos de vídeo",
    decisionCardCta: "Abrir guia do modelo →",
    decisionCardAriaLabelTemplate: "Ler o guia do modelo {title}",
    decisionCards: [
      {
        eyebrow: "Novo padrão Seedance",
        title: "Seedance 2.0",
        href: "/models/seedance-2",
        body: "Melhor quando o agente precisa da entrada mais nova da família Seedance para vídeos de produto cinematográficos e fluxos imagem para vídeo mais polidos.",
      },
      {
        eyebrow: "Movimento cinematográfico",
        title: "Kling 3.0",
        href: "/models/kling-3-0",
        body: "Melhor quando o fluxo quer um estilo de movimento mais forte ou uma iteração de imagem para vídeo mais flexível.",
      },
      {
        eyebrow: "Primeira versão premium",
        title: "Veo 3.1",
        href: "/models/veo-3-1",
        body: "Melhor quando o briefing textual precisa virar um teaser ou clipe conceitual mais polido na primeira geração.",
      },
    ] as const,
    supportedModelsTitle: "Modelos suportados",
    tableHeaders: {
      model: "Modelo",
      modes: "Modos",
      bestFit: "Melhor ajuste",
    },
    models: [
      {
        name: "Veo 3.1",
        href: "/models/veo-3-1",
        modes: "texto para vídeo, imagem para vídeo",
        bestFor: "Saída cinematográfica premium e fluxos de geração de vídeo de alto nível",
      },
      {
        name: "Kling 3.0",
        href: "/models/kling-3-0",
        modes: "texto para vídeo, imagem para vídeo",
        bestFor: "Movimento realista e geração de cenas cinematográficas",
      },
      {
        name: "Seedance 1.5 Pro",
        href: "/models/seedance-1-5-pro",
        modes: "texto para vídeo, imagem para vídeo",
        bestFor: "Saída confiável de imagem para vídeo e qualidade de movimento amigável para produção",
      },
    ] as const,
    usageTitle: "Uso na CLI",
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
        title: "Descobrir modelos",
        code: "anycap video models",
      },
    ] as const,
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
    relatedTitle: "Modelos e guias relacionados",
    relatedCards: [
      {
        eyebrow: "Modelo",
        title: "Veo 3.1",
        href: "/models/veo-3-1",
        description:
          "Veja quando o Veo 3.1 é a melhor escolha para geração de vídeo premium orientada por agentes.",
      },
      {
        eyebrow: "Página de agente",
        title: "Para Claude Code",
        href: "/for/claude-code",
        description:
          "Veja como a geração de vídeo entra na história mais ampla de capabilities do Claude Code.",
      },
      {
        eyebrow: "Capability relacionada",
        title: "Geração de imagem",
        href: "/capabilities/image-generation",
        description:
          "Combine geração de imagem com fluxos de vídeo quando o agente parte de stills ou frames de conceito.",
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
          "O catálogo atual de geração de vídeo do AnyCap inclui Veo 3.1, Veo 3.1 Fast, Sora 2 Pro, Kling 3.0, Kling O1, Hailuo 2.3, Seedance 2.0, Seedance 2.0 Fast e Seedance 1.5 Pro. Cada modelo listado está disponível pela mesma API de geração de vídeo, CLI e fluxo de autenticação do AnyCap.",
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
      {
        label: "Ver no GitHub",
        href: "https://github.com/anycap-ai/anycap",
        external: true,
        primary: true,
      },
      { label: "Explorar capabilities", href: "/capabilities" },
      { label: "Explorar a CLI", href: "/cli" },
    ] as const,
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
    lastUpdatedLabel: "Diperbarui 5 April 2026",
    hero: {
      title: "Generasi video",
      intro:
        "Generasi video AnyCap memberi agen satu CLI untuk alur text-to-video dan image-to-video. Agen dapat menghasilkan klip sinematik singkat dari prompt, menganimasikan gambar diam menjadi gerak, dan menjalankan tugas pembuatan video lewat satu antarmuka yang konsisten, alih-alih merangkai API generasi video terpisah untuk setiap model atau penyedia. Hasilnya adalah lapisan generasi video yang lebih bersih untuk Claude Code, Cursor, Codex, dan produk agen serupa.",
      summaryLabel: "Ringkasan langsung",
      summaryText:
        "Gunakan Veo 3.1 saat klip first-pass perlu terlihat lebih premium dari briefing teks, Kling 3.0 saat alur lebih bergantung pada gerakan sinematik atau iterasi image-to-video yang lebih fleksibel, dan Seedance 1.5 Pro saat tim menginginkan default yang lebih stabil dan ramah produksi.",
    },
    opusCallout: {
      eyebrow: "Digunakan dengan Claude Opus 4.7",
      title: "Claude Code di Opus 4.7 + AnyCap generasi video = gila",
      body:
        "Claude Code kini menjalankan Claude Opus 4.7 — agen reasoning dan coding terkuat dari Anthropic. Opus 4.7 belum bisa menghasilkan video secara native. Pasangkan dengan AnyCap dan sesi terminal yang sama menjangkau Veo 3.1, Seedance 1.5 Pro, dan Kling 3.0 melalui satu CLI dan satu login. Kombinasi Opus 4.7 + AnyCap adalah default yang direkomendasikan untuk alur agen berbasis video di 2026.",
      ctas: [
        { label: "Claude Code generasi video →", href: "/for/claude-code/video-generation" },
        { label: "Workflow gambar + video Opus 4.7 →", href: "/guides/claude-opus-4-7-image-video-workflow" },
      ],
    },
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
    decisionTitle: "Cara memilih model video",
    decisionCardCta: "Buka panduan model →",
    decisionCardAriaLabelTemplate: "Baca panduan model {title}",
    decisionCards: [
      {
        eyebrow: "Default Seedance terbaru",
        title: "Seedance 2.0",
        href: "/models/seedance-2",
        body: "Terbaik saat agen membutuhkan entri Seedance yang lebih baru untuk video produk sinematik dan workflow image-to-video yang lebih rapi.",
      },
      {
        eyebrow: "Gerakan sinematik",
        title: "Kling 3.0",
        href: "/models/kling-3-0",
        body: "Terbaik saat alur membutuhkan gaya gerakan yang lebih kuat atau iterasi image-to-video yang lebih fleksibel.",
      },
      {
        eyebrow: "First pass premium",
        title: "Veo 3.1",
        href: "/models/veo-3-1",
        body: "Terbaik saat briefing teks perlu menjadi teaser atau konsep klip yang lebih rapi pada generasi pertama.",
      },
    ] as const,
    supportedModelsTitle: "Model yang didukung",
    tableHeaders: {
      model: "Model",
      modes: "Mode",
      bestFit: "Paling cocok",
    },
    models: [
      {
        name: "Veo 3.1",
        href: "/models/veo-3-1",
        modes: "text-to-video, image-to-video",
        bestFor: "Output sinematik kelas atas dan alur generasi video premium",
      },
      {
        name: "Kling 3.0",
        href: "/models/kling-3-0",
        modes: "text-to-video, image-to-video",
        bestFor: "Gerakan realistis dan generasi adegan sinematik",
      },
      {
        name: "Seedance 1.5 Pro",
        href: "/models/seedance-1-5-pro",
        modes: "text-to-video, image-to-video",
        bestFor: "Output image-to-video yang andal dan kualitas gerakan yang ramah produksi",
      },
    ] as const,
    usageTitle: "Penggunaan CLI",
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
        title: "Temukan model",
        code: "anycap video models",
      },
    ] as const,
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
    relatedTitle: "Model dan panduan terkait",
    relatedCards: [
      {
        eyebrow: "Model",
        title: "Veo 3.1",
        href: "/models/veo-3-1",
        description:
          "Lihat kapan Veo 3.1 menjadi pilihan yang tepat untuk generasi video premium yang digerakkan agen.",
      },
      {
        eyebrow: "Halaman agen",
        title: "Untuk Claude Code",
        href: "/for/claude-code",
        description:
          "Lihat bagaimana generasi video masuk ke cerita capability Claude Code yang lebih luas.",
      },
      {
        eyebrow: "Capability terkait",
        title: "Generasi gambar",
        href: "/capabilities/image-generation",
        description:
          "Padukan generasi gambar dengan alur video saat agen berawal dari still atau frame konsep.",
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
          "Katalog generasi video AnyCap saat ini mencakup Veo 3.1, Veo 3.1 Fast, Sora 2 Pro, Kling 3.0, Kling O1, Hailuo 2.3, Seedance 2.0, Seedance 2.0 Fast, dan Seedance 1.5 Pro. Setiap model yang tercantum tersedia lewat API generasi video, CLI, dan alur autentikasi AnyCap yang sama.",
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
      {
        label: "Lihat di GitHub",
        href: "https://github.com/anycap-ai/anycap",
        external: true,
        primary: true,
      },
      { label: "Jelajahi capabilities", href: "/capabilities" },
      { label: "Jelajahi CLI", href: "/cli" },
    ] as const,
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
    lastUpdatedLabel: "Zuletzt aktualisiert am 5. April 2026",
    hero: {
      title: "Videogenerierung",
      intro:
        "Mit der AnyCap-Videogenerierung erhalten Agenten eine CLI für Text-to-Video- und Image-to-Video-Workflows. Agenten generieren kurze cinematische Clips aus Prompts, animieren Standbilder und führen Video-Erstellungs-Aufgaben über eine einzige Schnittstelle aus, statt separate Videogenerierungs-APIs zusammenzustückeln. Daraus entsteht eine sauberere Videogenerierungs-Schicht für Claude Code, Cursor, Codex und ähnliche Agenten-Produkte.",
      summaryLabel: "Kurz vorab",
      summaryText:
        "Setzen Sie auf Veo 3.1, wenn der erste Clip aus einem Text-Briefing premium aussehen soll, auf Kling 3.0, wenn der Workflow auf cinematische Bewegung oder explorativere Image-to-Video-Arbeit setzt, und auf Seedance 1.5 Pro, wenn das Team einen stabileren produktionsfreundlichen Standard möchte.",
    },
    opusCallout: {
      eyebrow: "Im Einsatz mit Claude Opus 4.7",
      title: "Claude Code auf Opus 4.7 + AnyCap-Videogenerierung – die starke Kombination",
      body:
        "Claude Code läuft jetzt auf Claude Opus 4.7 – dem stärksten Reasoning- und Coding-Agenten, den Anthropic je veröffentlicht hat. Videos generiert Opus 4.7 nach wie vor nicht selbst. In Kombination mit AnyCap erreicht dieselbe Terminal-Sitzung Veo 3.1, Seedance 1.5 Pro und Kling 3.0 über eine CLI und ein einziges Login. Opus 4.7 + AnyCap ist 2026 die empfohlene Standardkonfiguration für videolastige Agenten-Workflows.",
      ctas: [
        { label: "Videogenerierung in Claude Code →", href: "/for/claude-code/video-generation" },
        { label: "Opus 4.7 Bild- und Video-Workflow →", href: "/guides/claude-opus-4-7-image-video-workflow" },
      ],
    },
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
    decisionTitle: "So wählen Sie zwischen den Video-Modellen",
    decisionCardCta: "Modell-Leitfaden öffnen →",
    decisionCardAriaLabelTemplate: "Modell-Leitfaden zu {title} lesen",
    decisionCards: [
      {
        eyebrow: "Neuerer Seedance-Standard",
        title: "Seedance 2.0",
        href: "/models/seedance-2",
        body: "Geeignet, wenn der Agent den neueren Seedance-Eintrag für cinematische Produktvideos und poliertere Image-to-Video-Workflows braucht.",
      },
      {
        eyebrow: "Cinematische Bewegung",
        title: "Kling 3.0",
        href: "/models/kling-3-0",
        body: "Geeignet, wenn der Workflow stärkere Bewegungsstile oder flexiblere Image-to-Video-Iteration braucht.",
      },
      {
        eyebrow: "Premium-Erstpass",
        title: "Veo 3.1",
        href: "/models/veo-3-1",
        body: "Geeignet, wenn das Text-Briefing schon beim ersten Lauf zu einem polierten Teaser oder Konzept-Clip werden soll.",
      },
    ] as const,
    supportedModelsTitle: "Unterstützte Modelle",
    tableHeaders: {
      model: "Modell",
      modes: "Modi",
      bestFit: "Geeignet für",
    },
    models: [
      {
        name: "Veo 3.1",
        href: "/models/veo-3-1",
        modes: "Text-to-Video, Image-to-Video",
        bestFor: "High-End-cinematischer Output und Premium-Videogenerierungs-Workflows",
      },
      {
        name: "Kling 3.0",
        href: "/models/kling-3-0",
        modes: "Text-to-Video, Image-to-Video",
        bestFor: "Realistische Bewegung und cinematische Szenen-Generierung",
      },
      {
        name: "Seedance 1.5 Pro",
        href: "/models/seedance-1-5-pro",
        modes: "Text-to-Video, Image-to-Video",
        bestFor: "Zuverlässiger Image-to-Video-Output und produktionsfreundliche Bewegungsqualität",
      },
    ] as const,
    usageTitle: "CLI-Nutzung",
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
        title: "Modelle entdecken",
        code: "anycap video models",
      },
    ] as const,
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
    relatedTitle: "Verwandte Modelle und Leitfäden",
    relatedCards: [
      {
        eyebrow: "Modell",
        title: "Veo 3.1",
        href: "/models/veo-3-1",
        description: "Wann Veo 3.1 die richtige Wahl für premium agentengeführte Videogenerierung ist.",
      },
      {
        eyebrow: "Agenten-Seite",
        title: "Für Claude Code",
        href: "/for/claude-code",
        description: "So fügt sich Videogenerierung in die umfassende Capability-Story von Claude Code ein.",
      },
      {
        eyebrow: "Verwandte Capability",
        title: "Bildgenerierung",
        href: "/capabilities/image-generation",
        description:
          "Kombinieren Sie Bildgenerierung mit Video-Workflows, wenn der Agent von Stills oder Konzept-Frames startet.",
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
          "Der aktuelle AnyCap-Katalog für Videogenerierung umfasst Veo 3.1, Veo 3.1 Fast, Sora 2 Pro, Kling 3.0, Kling O1, Hailuo 2.3, Seedance 2.0, Seedance 2.0 Fast und Seedance 1.5 Pro. Jedes gelistete Modell ist über dieselbe AnyCap-Videogenerierungs-API, dieselbe CLI und denselben Auth-Flow erreichbar.",
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
      {
        label: "Auf GitHub ansehen",
        href: "https://github.com/anycap-ai/anycap",
        external: true,
        primary: true,
      },
      { label: "Capabilities erkunden", href: "/capabilities" },
      { label: "CLI erkunden", href: "/cli" },
    ] as const,
  },
} as const satisfies Record<SiteLocale, VideoGenerationPageContent>;

function getCatalogVideoModels(): VideoGenerationModel[] {
  const priority = new Map(
    [
      "seedance-2",
      "kling-3.0",
      "seedance-2-fast",
      "veo-3.1",
      "veo-3.1-fast",
      "sora-2-pro",
      "seedance-1.5-pro",
      "kling-o1",
    ].map((modelId, index) => [modelId, index]),
  );

  return getCatalogModelsByCapability("video")
    .filter((model) => model.modelId !== "hailuo-2.3")
    .sort(
      (left, right) =>
        (priority.get(left.modelId) ?? 99) - (priority.get(right.modelId) ?? 99),
    )
    .map((model) => ({
      name: model.displayName,
      href: model.path,
      modes: model.modes.join(", "),
      bestFor: model.bestFor,
    }));
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
  const content = contentByLocale[locale] ?? contentByLocale.en;

  const capabilityGuideJsonLd = createTechArticleJsonLd({
    headline: content.metadata.articleHeadline,
    description: content.metadata.articleDescription,
    path: VIDEO_GENERATION_PATH,
    locale,
    about: [...content.metadata.articleAbout],
    keywords: [...content.metadata.articleKeywords],
    dateModified: LAST_UPDATED_ISO,
  });

  return {
    ...content,
    models: getCatalogVideoModels(),
    capabilityGuideJsonLd,
    faqJsonLd: createFaqPageJsonLd(content.faqItems),
  };
}

export type VideoGenerationPageData = ReturnType<typeof getVideoGenerationPageData>;
