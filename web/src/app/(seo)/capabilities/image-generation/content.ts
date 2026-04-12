import type { Metadata } from "next";
import { createFaqPageJsonLd, createTechArticleJsonLd } from "@/lib/schema";
import { getLocaleConfig, siteConfig, type SiteLocale } from "@/lib/site";
import { type DemoLine } from "@/components/landing/CapabilityDemo";

export const IMAGE_GENERATION_PATH = "/capabilities/image-generation";

const LAST_UPDATED_ISO = "2026-04-05";

type ImageGenerationDemoLabels = {
  header: string;
  name: string;
  size: string;
  date: string;
  link: string;
};

type ImageGenerationCard = {
  eyebrow: string;
  title: string;
  href: string;
  body: string;
};

type ImageGenerationModel = {
  name: string;
  href: string;
  modes: string;
  bestFor: string;
};

type ImageGenerationFaqItem = {
  question: string;
  answer: string;
};

type ImageGenerationUseCase = {
  title: string;
  description: string;
};

type ImageGenerationRelatedCard = {
  eyebrow: string;
  title: string;
  href: string;
  description: string;
};

type ImageGenerationNextAction = {
  label: string;
  href: string;
  external?: boolean;
  primary?: boolean;
};

type ImageGenerationPageContent = {
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
  demo: {
    labels: ImageGenerationDemoLabels;
    lines: readonly DemoLine[];
  };
  decisionTitle: string;
  decisionCardCta: string;
  decisionCardAriaLabelTemplate: string;
  decisionCards: readonly ImageGenerationCard[];
  supportedModelsTitle: string;
  tableHeaders: {
    model: string;
    modes: string;
    bestFit: string;
  };
  models: readonly ImageGenerationModel[];
  usageTitle: string;
  usageExamples: readonly { title: string; code: string }[];
  useCasesTitle: string;
  useCases: readonly ImageGenerationUseCase[];
  relatedTitle: string;
  relatedCards: readonly ImageGenerationRelatedCard[];
  faqTitle: string;
  faqItems: readonly ImageGenerationFaqItem[];
  nextStepsTitle: string;
  nextActions: readonly ImageGenerationNextAction[];
};

const contentByLocale: Record<SiteLocale, ImageGenerationPageContent> = {
  en: {
    metadata: {
      title: "Image Generation API for AI agents, creators, and teams - Text-to-image and image editing",
      description:
        "Give AI agents and creators image generation through AnyCap. Use Seedream 5, Nano Banana Pro, and Nano Banana 2 for text-to-image, image-to-image, and image editing workflows through one CLI.",
      openGraphTitle: "Image Generation API for AI agents, creators, and teams - Text-to-image and image editing",
      openGraphDescription:
        "Give AI agents and creators image generation through AnyCap. Use Seedream 5, Nano Banana Pro, and Nano Banana 2 for text-to-image, image-to-image, and image editing workflows through one CLI.",
      articleHeadline: "Image Generation API for AI agents, creators, and teams - Text-to-image and image editing",
      articleDescription:
        "Capability guide for using AnyCap image generation across AI agent, creator, and product workflows with Seedream 5, Nano Banana Pro, and Nano Banana 2.",
      articleAbout: ["Image generation", "Text-to-image API", "Image editing API", "AnyCap", "Creators"],
      articleKeywords: [
        "image generation for ai agents",
        "text to image api",
        "image editing api",
        "ai image generator",
        "seedream 5",
        "nano banana pro",
      ],
    },
    breadcrumbItems: [
      { name: "Home", href: "/" },
      { name: "Capabilities", href: "/capabilities" },
      { name: "Image Generation", href: IMAGE_GENERATION_PATH },
    ],
    eyebrow: "Capabilities",
    lastUpdatedLabel: "Last updated April 5, 2026",
    hero: {
      title: "Image Generation",
      intro:
        "AnyCap image generation gives agents, creators, and product teams one CLI for text-to-image and image-to-image workflows. You can create net-new visuals, revise existing assets, and run image editing loops through a consistent interface instead of wiring a separate image generation API for every model or provider. That makes it a practical image generation layer for Claude Code, Cursor, Codex, and anyone using agents to ship visual work faster.",
      summaryLabel: "Answer-first summary",
      summaryText:
        "Use Seedream 5 when the agent needs a stronger first-pass image, Nano Banana Pro when the workflow starts from an existing asset and needs targeted revisions, and Nano Banana 2 when speed and throughput matter more than maximizing polish on the first result.",
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
          content: "Generate a minimalist product hero image on a cream background",
          delay: 500,
        },
        {
          type: "text",
          content: "I’ll generate that image using AnyCap.",
          delay: 800,
        },
        {
          type: "tool",
          content:
            "run(\"anycap image generate --prompt 'minimalist product hero, cream background' --model seedream-5 -o hero.png\")",
          delay: 600,
        },
        {
          type: "text",
          content: "Image generated — hero.png (1024 × 1024)",
          sub: "✓",
          delay: 1400,
        },
        { type: "image", delay: 400 },
        {
          type: "text",
          content: "Here’s the product hero. Clean and ready for your landing page.",
          delay: 600,
        },
        { type: "cursor", delay: 500 },
      ] as const,
    },
    decisionTitle: "How to choose among image models",
    decisionCardCta: "Open model guide →",
    decisionCardAriaLabelTemplate: "Read the {title} model guide",
    decisionCards: [
      {
        eyebrow: "First-pass quality",
        title: "Seedream 5",
        href: "/models/seedream-5",
        body: "Best when the workflow starts from a prompt and the first image needs to look closer to final.",
      },
      {
        eyebrow: "Revision loops",
        title: "Nano Banana Pro",
        href: "/models/nano-banana-pro",
        body: "Best when the agent already has an image and needs prompt-based edits or more controlled visual revisions.",
      },
      {
        eyebrow: "Speed and scale",
        title: "Nano Banana 2",
        href: "/models/nano-banana-2",
        body: "Best when the agent needs many variants, quicker drafts, or a more scalable generation loop.",
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
        name: "Seedream 5",
        href: "/models/seedream-5",
        modes: "text-to-image, image-to-image",
        bestFor: "Polished first-pass image generation and visual refinement",
      },
      {
        name: "Nano Banana Pro",
        href: "/models/nano-banana-pro",
        modes: "text-to-image, image-to-image",
        bestFor: "Higher-quality editing loops and stronger commercial output",
      },
      {
        name: "Nano Banana 2",
        href: "/models/nano-banana-2",
        modes: "text-to-image, image-to-image",
        bestFor: "Fast iteration and scalable image generation workflows",
      },
    ] as const,
    usageTitle: "CLI usage",
    usageExamples: [
      {
        title: "Text-to-image",
        code:
          'anycap image generate --prompt "a minimalist product hero image on a cream background" --model seedream-5 -o hero.png',
      },
      {
        title: "Image-to-image editing",
        code:
          'anycap image generate --prompt "turn this into a warm editorial product shot" --model nano-banana-pro --mode image-to-image --param reference_image_urls=\'["https://example.com/source.png"]\' -o variation.png',
      },
      {
        title: "Discover models",
        code: "anycap image models",
      },
    ] as const,
    useCasesTitle: "When agents and creators need image generation",
    useCases: [
      {
        title: "Product mockups",
        description: "Generate polished visuals for launch pages, changelogs, and internal demos.",
      },
      {
        title: "Creative iteration",
        description: "Run text-to-image and image editing loops without leaving the agent workflow.",
      },
      {
        title: "Creators and marketers",
        description:
          "Create illustrations, thumbnails, social posts, and marketing assets through one repeatable command surface.",
      },
      {
        title: "Everyday edits",
        description:
          "Turn briefs, screenshots, and references into first-pass visual directions, background swaps, and simple photo edits.",
      },
    ] as const,
    relatedTitle: "Related models, guides, and workflows",
    relatedCards: [
      {
        eyebrow: "Model",
        title: "Seedream 5",
        href: "/models/seedream-5",
        description: "Learn when agents should choose Seedream 5 for polished text-to-image output.",
      },
      {
        eyebrow: "Model",
        title: "Nano Banana Pro",
        href: "/models/nano-banana-pro",
        description: "Explore a stronger fit for image editing and iterative visual refinement.",
      },
      {
        eyebrow: "Workflow",
        title: "Create AI Influencer for Free",
        href: "/learn/create-ai-influencer-for-free",
        description: "See how image generation fits creator workflows beyond technical agent setup.",
      },
      {
        eyebrow: "Workflow",
        title: "How to Change Photo Background",
        href: "/learn/how-to-change-photo-background",
        description: "See how the same capability supports everyday photo edits and faster content production.",
      },
    ] as const,
    faqTitle: "FAQ",
    faqItems: [
      {
        question: "What does AnyCap image generation let agents do?",
        answer:
          "It gives agents one command surface for text-to-image and image-to-image workflows. That means the same CLI can handle first-pass generation, creative iteration, and image editing without separate provider integrations.",
      },
      {
        question: "Which image models are available through AnyCap today?",
        answer:
          "The current public image generation surface includes Seedream 5, Nano Banana Pro, and Nano Banana 2. Each model supports text-to-image and image-to-image modes through the same AnyCap image generation API and CLI interface.",
      },
      {
        question: "Why does this page mention image editing as well as image generation?",
        answer:
          "Market language often splits text-to-image, image editing, and image generation. AnyCap groups those workflows under one image generation capability because agents frequently need both creation and revision in the same loop.",
      },
      {
        question: "Is this page about an image generation API or a CLI?",
        answer:
          "Both. Teams often search for an image generation API, a text-to-image API, or an image editing API, while implementation inside agent workflows often happens through the AnyCap CLI.",
      },
      {
        question: "Is this only for developers?",
        answer:
          "No. The same capability supports creators, marketers, operators, and everyday users who need product visuals, social content, thumbnails, or quick photo edits. The agent workflow is just one of the ways to reach it.",
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
      { label: "For creators", href: "/learn/create-ai-influencer-for-free" },
    ] as const,
  },
  "pt-br": {
    metadata: {
      title: "API de geração de imagem para agentes de IA - texto para imagem e edição",
      description:
        "Dê aos agentes de IA geração de imagem por meio do AnyCap. Use Seedream 5, Nano Banana Pro e Nano Banana 2 para fluxos de texto para imagem, imagem para imagem e edição de imagem em uma única CLI.",
      openGraphTitle: "API de geração de imagem para agentes de IA - texto para imagem e edição",
      openGraphDescription:
        "Dê aos agentes de IA geração de imagem por meio do AnyCap. Use Seedream 5, Nano Banana Pro e Nano Banana 2 para fluxos de texto para imagem, imagem para imagem e edição de imagem em uma única CLI.",
      articleHeadline: "API de geração de imagem para agentes de IA - texto para imagem e edição",
      articleDescription:
        "Guia de capability para usar a geração de imagem do AnyCap em fluxos de agentes de IA com Seedream 5, Nano Banana Pro e Nano Banana 2.",
      articleAbout: [
        "Geração de imagem",
        "API de texto para imagem",
        "API de edição de imagem",
        "AnyCap",
      ],
      articleKeywords: [
        "geração de imagem para agentes de ia",
        "texto para imagem api",
        "api de edição de imagem",
        "seedream 5",
        "nano banana pro",
      ],
    },
    breadcrumbItems: [
      { name: "Início", href: "/" },
      { name: "Capacidades", href: "/capabilities" },
      { name: "Geração de imagem", href: IMAGE_GENERATION_PATH },
    ],
    eyebrow: "Capacidades",
    lastUpdatedLabel: "Atualizado em 5 de abril de 2026",
    hero: {
      title: "Geração de imagem",
      intro:
        "A geração de imagem do AnyCap dá aos agentes uma única CLI para fluxos de texto para imagem e imagem para imagem. Os agentes podem criar visuais totalmente novos, revisar ativos existentes e executar ciclos de edição de imagem por meio de uma interface consistente, em vez de integrar uma API separada para cada modelo ou provedor. Isso torna a camada de geração de imagem prática para Claude Code, Cursor, Codex e produtos de agentes semelhantes.",
      summaryLabel: "Resumo direto",
      summaryText:
        "Use o Seedream 5 quando o agente precisar de uma primeira imagem mais forte, o Nano Banana Pro quando o fluxo começar de um ativo existente e exigir revisões direcionadas, e o Nano Banana 2 quando velocidade e volume importarem mais do que o acabamento máximo no primeiro resultado.",
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
          content: "Gere uma imagem hero minimalista de produto com fundo creme",
          delay: 500,
        },
        {
          type: "text",
          content: "Vou gerar essa imagem usando o AnyCap.",
          delay: 800,
        },
        {
          type: "tool",
          content:
            "run(\"anycap image generate --prompt 'minimalist product hero, cream background' --model seedream-5 -o hero.png\")",
          delay: 600,
        },
        {
          type: "text",
          content: "Imagem gerada — hero.png (1024 × 1024)",
          sub: "✓",
          delay: 1400,
        },
        { type: "image", delay: 400 },
        {
          type: "text",
          content: "Aqui está o hero do produto. Limpo e pronto para a sua landing page.",
          delay: 600,
        },
        { type: "cursor", delay: 500 },
      ] as const,
    },
    decisionTitle: "Como escolher entre os modelos de imagem",
    decisionCardCta: "Abrir guia do modelo →",
    decisionCardAriaLabelTemplate: "Ler o guia do modelo {title}",
    decisionCards: [
      {
        eyebrow: "Primeira versão forte",
        title: "Seedream 5",
        href: "/models/seedream-5",
        body: "Melhor quando o fluxo começa com um prompt e a primeira imagem precisa ficar mais próxima do resultado final.",
      },
      {
        eyebrow: "Ciclos de revisão",
        title: "Nano Banana Pro",
        href: "/models/nano-banana-pro",
        body: "Melhor quando o agente já tem uma imagem e precisa de edições guiadas por prompt ou revisões visuais mais controladas.",
      },
      {
        eyebrow: "Velocidade e escala",
        title: "Nano Banana 2",
        href: "/models/nano-banana-2",
        body: "Melhor quando o agente precisa de muitas variações, rascunhos mais rápidos ou um loop de geração mais escalável.",
      },
    ] as const,
    supportedModelsTitle: "Modelos compatíveis",
    tableHeaders: {
      model: "Modelo",
      modes: "Modos",
      bestFit: "Melhor ajuste",
    },
    models: [
      {
        name: "Seedream 5",
        href: "/models/seedream-5",
        modes: "texto para imagem, imagem para imagem",
        bestFor: "Geração de imagem refinada na primeira passagem e refinamento visual",
      },
      {
        name: "Nano Banana Pro",
        href: "/models/nano-banana-pro",
        modes: "texto para imagem, imagem para imagem",
        bestFor: "Loops de edição com mais qualidade e saída comercial mais forte",
      },
      {
        name: "Nano Banana 2",
        href: "/models/nano-banana-2",
        modes: "texto para imagem, imagem para imagem",
        bestFor: "Iteração rápida e fluxos de geração de imagem mais escaláveis",
      },
    ] as const,
    usageTitle: "Uso na CLI",
    usageExamples: [
      {
        title: "Texto para imagem",
        code:
          'anycap image generate --prompt "uma imagem hero minimalista de produto em fundo creme" --model seedream-5 -o hero.png',
      },
      {
        title: "Edição de imagem para imagem",
        code:
          'anycap image generate --prompt "transforme isso em uma foto editorial quente de produto" --model nano-banana-pro --mode image-to-image --param reference_image_urls=\'["https://example.com/source.png"]\' -o variation.png',
      },
      {
        title: "Descobrir modelos",
        code: "anycap image models",
      },
    ] as const,
    useCasesTitle: "Quando os agentes precisam de geração de imagem",
    useCases: [
      {
        title: "Mockups de produto",
        description: "Gere visuais refinados para páginas de lançamento, changelogs e demos internas.",
      },
      {
        title: "Iteração criativa",
        description:
          "Execute ciclos de texto para imagem e edição de imagem sem sair do fluxo do agente.",
      },
      {
        title: "Pipelines de conteúdo",
        description:
          "Crie ilustrações, miniaturas e assets de marketing em uma superfície única e repetível.",
      },
      {
        title: "Apoio de design",
        description:
          "Transforme briefs, screenshots e referências em direções visuais de primeira passagem para equipes que constroem com agentes.",
      },
    ] as const,
    relatedTitle: "Modelos e guias relacionados",
    relatedCards: [
      {
        eyebrow: "Modelo",
        title: "Seedream 5",
        href: "/models/seedream-5",
        description:
          "Saiba quando os agentes devem escolher o Seedream 5 para uma saída refinada de texto para imagem.",
      },
      {
        eyebrow: "Modelo",
        title: "Nano Banana Pro",
        href: "/models/nano-banana-pro",
        description:
          "Veja por que ele é uma opção mais forte para edição de imagem e refinamento visual iterativo.",
      },
      {
        eyebrow: "Página de agente",
        title: "Para Claude Code",
        href: "/for/claude-code",
        description:
          "Veja como a geração de imagem entra na história mais ampla de capabilities do Claude Code.",
      },
    ] as const,
    faqTitle: "Perguntas frequentes",
    faqItems: [
      {
        question: "O que a geração de imagem do AnyCap permite que os agentes façam?",
        answer:
          "Ela dá aos agentes uma única superfície de comando para fluxos de texto para imagem e imagem para imagem. Isso significa que a mesma CLI pode lidar com geração inicial, iteração criativa e edição de imagem sem integrações separadas por provedor.",
      },
      {
        question: "Quais modelos de imagem estão disponíveis no AnyCap hoje?",
        answer:
          "A superfície pública atual de geração de imagem inclui Seedream 5, Nano Banana Pro e Nano Banana 2. Cada modelo suporta modos de texto para imagem e imagem para imagem pela mesma API e CLI do AnyCap.",
      },
      {
        question: "Por que esta página fala de edição de imagem além de geração de imagem?",
        answer:
          "O vocabulário de mercado costuma separar texto para imagem, edição de imagem e geração de imagem. O AnyCap agrupa esses fluxos em uma capability só porque os agentes frequentemente precisam criar e revisar na mesma sequência.",
      },
      {
        question: "Esta página fala de uma API de geração de imagem ou de uma CLI?",
        answer:
          "Das duas coisas. As equipes costumam procurar uma API de geração de imagem, uma API de texto para imagem ou uma API de edição de imagem, enquanto a execução dentro dos fluxos de agente normalmente acontece pela CLI do AnyCap.",
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
      title: "API generasi gambar untuk agen AI - text-to-image dan image editing",
      description:
        "Berikan generasi gambar ke agen AI melalui AnyCap. Gunakan Seedream 5, Nano Banana Pro, dan Nano Banana 2 untuk alur text-to-image, image-to-image, dan pengeditan gambar dalam satu CLI.",
      openGraphTitle: "API generasi gambar untuk agen AI - text-to-image dan image editing",
      openGraphDescription:
        "Berikan generasi gambar ke agen AI melalui AnyCap. Gunakan Seedream 5, Nano Banana Pro, dan Nano Banana 2 untuk alur text-to-image, image-to-image, dan pengeditan gambar dalam satu CLI.",
      articleHeadline: "API generasi gambar untuk agen AI - text-to-image dan image editing",
      articleDescription:
        "Panduan capability untuk menggunakan generasi gambar AnyCap dalam alur kerja agen AI dengan Seedream 5, Nano Banana Pro, dan Nano Banana 2.",
      articleAbout: ["Generasi gambar", "API text-to-image", "API image editing", "AnyCap"],
      articleKeywords: [
        "generasi gambar untuk agen ai",
        "text to image api",
        "image editing api",
        "seedream 5",
        "nano banana pro",
      ],
    },
    breadcrumbItems: [
      { name: "Beranda", href: "/" },
      { name: "Capabilities", href: "/capabilities" },
      { name: "Generasi gambar", href: IMAGE_GENERATION_PATH },
    ],
    eyebrow: "Capabilities",
    lastUpdatedLabel: "Diperbarui 5 April 2026",
    hero: {
      title: "Generasi gambar",
      intro:
        "Generasi gambar AnyCap memberi agen satu CLI untuk alur text-to-image dan image-to-image. Agen dapat membuat visual baru, merevisi aset yang sudah ada, dan menjalankan loop pengeditan gambar lewat antarmuka yang konsisten, alih-alih menghubungkan API terpisah untuk setiap model atau penyedia. Ini menjadikannya lapisan generasi gambar yang praktis untuk Claude Code, Cursor, Codex, dan produk agen serupa.",
      summaryLabel: "Ringkasan langsung",
      summaryText:
        "Gunakan Seedream 5 saat agen membutuhkan gambar awal yang lebih kuat, Nano Banana Pro saat alur dimulai dari aset yang sudah ada dan perlu revisi terarah, dan Nano Banana 2 saat kecepatan serta throughput lebih penting daripada hasil paling rapi pada percobaan pertama.",
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
          content: "Buat gambar hero produk minimalis dengan latar krem",
          delay: 500,
        },
        {
          type: "text",
          content: "Saya akan membuat gambar itu menggunakan AnyCap.",
          delay: 800,
        },
        {
          type: "tool",
          content:
            "run(\"anycap image generate --prompt 'minimalist product hero, cream background' --model seedream-5 -o hero.png\")",
          delay: 600,
        },
        {
          type: "text",
          content: "Gambar dibuat — hero.png (1024 × 1024)",
          sub: "✓",
          delay: 1400,
        },
        { type: "image", delay: 400 },
        {
          type: "text",
          content: "Ini hero produknya. Bersih dan siap untuk landing page-mu.",
          delay: 600,
        },
        { type: "cursor", delay: 500 },
      ] as const,
    },
    decisionTitle: "Cara memilih model gambar",
    decisionCardCta: "Buka panduan model →",
    decisionCardAriaLabelTemplate: "Baca panduan model {title}",
    decisionCards: [
      {
        eyebrow: "Kualitas first pass",
        title: "Seedream 5",
        href: "/models/seedream-5",
        body: "Terbaik saat alur dimulai dari prompt dan gambar pertama perlu terlihat mendekati hasil akhir.",
      },
      {
        eyebrow: "Loop revisi",
        title: "Nano Banana Pro",
        href: "/models/nano-banana-pro",
        body: "Terbaik saat agen sudah punya gambar dan membutuhkan edit berbasis prompt atau revisi visual yang lebih terkontrol.",
      },
      {
        eyebrow: "Kecepatan dan skala",
        title: "Nano Banana 2",
        href: "/models/nano-banana-2",
        body: "Terbaik saat agen membutuhkan banyak varian, draft yang lebih cepat, atau loop generasi yang lebih skalabel.",
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
        name: "Seedream 5",
        href: "/models/seedream-5",
        modes: "text-to-image, image-to-image",
        bestFor: "Generasi gambar yang rapi pada percobaan pertama dan penyempurnaan visual",
      },
      {
        name: "Nano Banana Pro",
        href: "/models/nano-banana-pro",
        modes: "text-to-image, image-to-image",
        bestFor: "Loop pengeditan berkualitas lebih tinggi dan hasil komersial yang lebih kuat",
      },
      {
        name: "Nano Banana 2",
        href: "/models/nano-banana-2",
        modes: "text-to-image, image-to-image",
        bestFor: "Iterasi cepat dan alur generasi gambar yang lebih skalabel",
      },
    ] as const,
    usageTitle: "Penggunaan CLI",
    usageExamples: [
      {
        title: "Text-to-image",
        code:
          'anycap image generate --prompt "gambar hero produk minimalis dengan latar krem" --model seedream-5 -o hero.png',
      },
      {
        title: "Pengeditan image-to-image",
        code:
          'anycap image generate --prompt "ubah ini menjadi foto produk editorial yang hangat" --model nano-banana-pro --mode image-to-image --param reference_image_urls=\'["https://example.com/source.png"]\' -o variation.png',
      },
      {
        title: "Temukan model",
        code: "anycap image models",
      },
    ] as const,
    useCasesTitle: "Saat agen membutuhkan generasi gambar",
    useCases: [
      {
        title: "Mockup produk",
        description: "Hasilkan visual rapi untuk halaman peluncuran, changelog, dan demo internal.",
      },
      {
        title: "Iterasi kreatif",
        description: "Jalankan loop text-to-image dan image editing tanpa keluar dari alur agen.",
      },
      {
        title: "Pipeline konten",
        description:
          "Buat ilustrasi, thumbnail, dan aset pemasaran melalui satu surface perintah yang dapat diulang.",
      },
      {
        title: "Dukungan desain",
        description:
          "Ubah brief, screenshot, dan referensi menjadi arah visual first-pass untuk tim yang membangun dengan agen.",
      },
    ] as const,
    relatedTitle: "Model dan panduan terkait",
    relatedCards: [
      {
        eyebrow: "Model",
        title: "Seedream 5",
        href: "/models/seedream-5",
        description: "Pelajari kapan agen harus memilih Seedream 5 untuk hasil text-to-image yang rapi.",
      },
      {
        eyebrow: "Model",
        title: "Nano Banana Pro",
        href: "/models/nano-banana-pro",
        description:
          "Lihat mengapa model ini lebih cocok untuk image editing dan penyempurnaan visual iteratif.",
      },
      {
        eyebrow: "Halaman agen",
        title: "Untuk Claude Code",
        href: "/for/claude-code",
        description:
          "Lihat bagaimana generasi gambar masuk ke cerita capability Claude Code yang lebih luas.",
      },
    ] as const,
    faqTitle: "FAQ",
    faqItems: [
      {
        question: "Apa yang bisa dilakukan agen dengan generasi gambar AnyCap?",
        answer:
          "Ia memberi agen satu surface perintah untuk alur text-to-image dan image-to-image. Artinya CLI yang sama bisa menangani generasi awal, iterasi kreatif, dan pengeditan gambar tanpa integrasi penyedia terpisah.",
      },
      {
        question: "Model gambar apa saja yang tersedia di AnyCap sekarang?",
        answer:
          "Surface generasi gambar publik saat ini mencakup Seedream 5, Nano Banana Pro, dan Nano Banana 2. Setiap model mendukung mode text-to-image dan image-to-image lewat API dan CLI AnyCap yang sama.",
      },
      {
        question: "Mengapa halaman ini membahas image editing selain generasi gambar?",
        answer:
          "Istilah pasar sering memisahkan text-to-image, image editing, dan generasi gambar. AnyCap menggabungkan alur-alur itu dalam satu capability karena agen sering membutuhkan pembuatan dan revisi dalam loop yang sama.",
      },
      {
        question: "Apakah halaman ini tentang API generasi gambar atau CLI?",
        answer:
          "Keduanya. Tim sering mencari API generasi gambar, API text-to-image, atau API image editing, sementara eksekusi di dalam alur kerja agen biasanya terjadi lewat CLI AnyCap.",
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
};

export function getImageGenerationMetadata(locale: SiteLocale): Metadata {
  const content = contentByLocale[locale] ?? contentByLocale.en;

  return {
    title: content.metadata.title,
    description: content.metadata.description,
    alternates: { canonical: IMAGE_GENERATION_PATH },
    openGraph: {
      type: "website",
      locale: getLocaleConfig(locale).ogLocale,
      url: IMAGE_GENERATION_PATH,
      siteName: siteConfig.siteName,
      title: content.metadata.openGraphTitle,
      description: content.metadata.openGraphDescription,
    },
  };
}

export function getImageGenerationPageData(locale: SiteLocale) {
  const content = contentByLocale[locale] ?? contentByLocale.en;

  const capabilityGuideJsonLd = createTechArticleJsonLd({
    headline: content.metadata.articleHeadline,
    description: content.metadata.articleDescription,
    path: IMAGE_GENERATION_PATH,
    locale,
    about: [...content.metadata.articleAbout],
    keywords: [...content.metadata.articleKeywords],
    dateModified: LAST_UPDATED_ISO,
  });

  return {
    ...content,
    capabilityGuideJsonLd,
    faqJsonLd: createFaqPageJsonLd(content.faqItems),
  };
}
