import type { Metadata } from "next";
import type { CapabilityGapRow } from "@/components/landing/CapabilityGapTable";
import { buildHostedPagePath } from "@/lib/seo/hosted-pages";
import { createTechArticleJsonLd } from "@/lib/schema";
import { getLocaleConfig, siteConfig, type SiteLocale } from "@/lib/site";

export const CAPABILITIES_PATH = "/capabilities";

interface Capability {
  name: string;
  category: string;
  status: "available" | "coming_soon";
  description: string;
  models?: string;
  href: string | null;
}

interface RelatedCard {
  eyebrow: string;
  title: string;
  href: string;
  summary: string;
}

interface ModelGuideCard {
  eyebrow: string;
  title: string;
  href: string;
  body: string;
}

type CapabilitiesPageContent = {
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
  breadcrumbItems: readonly { name: string; href: string }[];
  heroEyebrow: string;
  heroTitleLine1: string;
  heroTitleLine2: string;
  heroParagraph: string;
  overviewTitle: string;
  overviewParagraphs: string[];
  gapTable: {
    eyebrow: string;
    title: string;
    description: string;
    addWithAnycapLabel: string;
    footnote: string;
  };
  gapCellLabels: {
    builtIn: string;
    notBuiltIn: string;
    noUnifiedRuntime: string;
    noUnifiedAudioRuntime: string;
    available: string;
    externalTooling: string;
    noGroundedFlow: string;
    noReusableCrawlRuntime: string;
    noSharedAssetLayer: string;
    comingSoon: string;
  };
  capabilityNames: {
    imageGeneration: string;
    videoGeneration: string;
    musicGeneration: string;
    imageUnderstanding: string;
    videoAnalysis: string;
    audioUnderstanding: string;
    webSearch: string;
    groundedWebSearch: string;
    webCrawl: string;
    drive: string;
    speech: string;
  };
  capabilityDescriptions: {
    imageGeneration: string;
    videoGeneration: string;
    musicGeneration: string;
    imageUnderstanding: string;
    videoAnalysis: string;
    audioUnderstanding: string;
    webSearch: string;
    groundedWebSearch: string;
    webCrawl: string;
    drive: string;
    speech: string;
  };
  sectionTitles: {
    browseInventory: string;
    modelsBehind: string;
    relatedEntryPages: string;
    comingSoon: string;
    getStarted: string;
  };
  modelGuideCards: readonly ModelGuideCard[];
  relatedCards: readonly RelatedCard[];
  buttonLabels: {
    getStarted: string;
    whatAgentsCantDo: string;
    forClaudeCode: string;
  };
  itemListJsonLd: {
    name: string;
    description: string;
  };
};

const contentByLocale: Record<SiteLocale, CapabilitiesPageContent> = {
  en: {
    metadata: {
      title: "AI Agent Capabilities | AnyCap",
      description:
        "Browse the AI agent capability runtime that adds image, video, audio, web, storage, and publishing workflows through one install path, one auth flow, and one CLI.",
      openGraphTitle: "AI Agent Capabilities — Image, video, audio, web, storage, and publishing",
      openGraphDescription:
        "Start with the live capability inventory for coding agents, then expand into storage and publishing workflows through the same runtime.",
      articleHeadline: "AI Agent Capabilities — Image, video, audio, web, storage, and publishing",
      articleDescription:
        "Hub page for the live AnyCap capability inventory across media, web retrieval, storage, and publishing workflows.",
      articleAbout: ["AI agent capabilities", "Media generation", "Web retrieval", "Drive storage"],
      articleKeywords: [
        "ai agent capabilities",
        "image generation for ai agents",
        "video generation for ai agents",
        "audio understanding for ai agents",
        "web search api for ai agents",
        "web crawl for ai agents",
        "drive for ai agents",
        "page publishing for ai agents",
      ],
    },
    breadcrumbItems: [
      { name: "Home", href: "/" },
      { name: "Capabilities", href: "/capabilities" },
    ],
    heroEyebrow: "AI agent capabilities",
    heroTitleLine1: "Keep the agent you use.",
    heroTitleLine2: "Add the capabilities it lacks.",
    heroParagraph:
      "AnyCap is an AI agent capability runtime for coding agents. Start with the public capability inventory through one CLI, one auth flow, and one install path across Claude Code, Cursor, Codex, and the rest of your agent stack. The same runtime also extends into adjacent workflows as your workflows grow.",
    overviewTitle: "How to use the capability inventory",
    overviewParagraphs: [
      "The capability hub is useful when the workflow gap is clear but the exact page choice is not. It gives teams one place to scan the available runtime surface before they branch into image generation, video generation, understanding, retrieval, storage, or adjacent capability pages.",
      "That makes the inventory page more than a feature list. It is the routing layer that helps operators connect a missing outcome in the agent workflow to the right capability page, model page, or product-specific install path.",
    ],
    gapTable: {
      eyebrow: "Comparison",
      title: "What the common coding agents still miss",
      description:
        "This table shows the capability gap across the current agent ecosystem and the layer AnyCap adds on top.",
      addWithAnycapLabel: "Add with AnyCap",
      footnote:
        "This is the fastest way to show the narrative: keep the agent, add the missing capability layer.",
    },
    gapCellLabels: {
      builtIn: "Built in",
      notBuiltIn: "Not built in",
      noUnifiedRuntime: "No unified runtime",
      noUnifiedAudioRuntime: "No unified audio runtime",
      available: "Available",
      externalTooling: "External tooling",
      noGroundedFlow: "No grounded flow",
      noReusableCrawlRuntime: "No reusable crawl runtime",
      noSharedAssetLayer: "No shared asset layer",
      comingSoon: "Coming soon",
    },
    capabilityNames: {
      imageGeneration: "Image Generation",
      videoGeneration: "Video Generation",
      musicGeneration: "Music Generation",
      imageUnderstanding: "Image Understanding",
      videoAnalysis: "Video Analysis",
      audioUnderstanding: "Audio Understanding",
      webSearch: "Web Search",
      groundedWebSearch: "Grounded Web Search",
      webCrawl: "Web Crawl",
      drive: "Drive",
      speech: "Speech",
    },
    capabilityDescriptions: {
      imageGeneration:
        "Generate and edit images through Seedream 5, Seedream 4.5, Nano Banana Pro, and Nano Banana 2.",
      videoGeneration:
        "Generate videos from text prompts and images through Veo 3.1, Seedance 1.5 Pro, and Kling 3.0.",
      musicGeneration:
        "Generate music tracks and instrumental audio through one music runtime.",
      imageUnderstanding:
        "Analyze screenshots, diagrams, photos, and charts through one vision runtime.",
      videoAnalysis:
        "Inspect recordings and extract structured information from video content.",
      audioUnderstanding:
        "Transcribe and analyze meetings, podcasts, and voice clips through one runtime.",
      webSearch: "Search the web for structured results with optional full-page content.",
      groundedWebSearch:
        "Get synthesized answers with citations grounded in live web search.",
      webCrawl: "Convert web pages into clean Markdown for downstream agent workflows.",
      drive: "Store outputs, organize assets, and share public URLs through AnyCap Drive.",
      speech: "Text-to-speech and voice generation.",
    },
    sectionTitles: {
      browseInventory: "Browse the live capability inventory",
      modelsBehind: "Models behind the capabilities",
      relatedEntryPages: "Related entry pages",
      comingSoon: "Coming soon",
      getStarted: "Get Started",
    },
    modelGuideCards: [
      {
        eyebrow: "Hub",
        title: "Model Guide",
        href: "/models",
        body: "Browse the multimodal models available through AnyCap and map them to the right agent workflow.",
      },
      {
        eyebrow: "Guide",
        title: "Context Engineering for Agents",
        href: "/guides/context-engineering-for-agents",
        body: "Understand how agents decide when image, video, and analysis capabilities belong in the workflow.",
      },
    ],
    relatedCards: [
      {
        eyebrow: "Published content",
        title: "AnyCap Page hub",
        href: buildHostedPagePath("en", "/blog"),
        summary:
          "Browse hosted guides, blog posts, and news published through AnyCap Page from the same domain.",
      },
      {
        eyebrow: "Deficiency hub",
        title: "What agents can't do",
        href: "/learn/what-agents-cant-do",
        summary:
          "Start here if you are diagnosing the missing capability before choosing a specific page.",
      },
      {
        eyebrow: "Agent path",
        title: "For Claude Code",
        href: "/for/claude-code",
        summary:
          "Start here if Claude Code is your primary agent and you want the ecosystem-specific install path.",
      },
      {
        eyebrow: "Install path",
        title: "Install AnyCap",
        href: "/guides/install-anycap",
        summary:
          "Step-by-step install guide for the CLI, auth, verification, and first command.",
      },
    ],
    buttonLabels: {
      getStarted: "Get Started",
      whatAgentsCantDo: "What agents can\u2019t do",
      forClaudeCode: "For Claude Code",
    },
    itemListJsonLd: {
      name: "AnyCap Capabilities",
      description:
        "Capability hub for the live AnyCap inventory across media, web retrieval, storage, and publishing workflows.",
    },
  },
  "pt-br": {
    metadata: {
      title: "Capacidades para agentes de IA — Imagem, vídeo, áudio, web, armazenamento e publicação",
      description:
        "Navegue pelo runtime de capacidades para agentes de IA que adiciona fluxos de imagem, vídeo, áudio, web, armazenamento e publicação em um único caminho de instalação, um fluxo de autenticação e uma CLI.",
      openGraphTitle: "Capacidades para agentes de IA — Imagem, vídeo, áudio, web, armazenamento e publicação",
      openGraphDescription:
        "Comece com o inventário de capacidades disponíveis para agentes de código e expanda para fluxos de armazenamento e publicação pelo mesmo runtime.",
      articleHeadline: "Capacidades para agentes de IA — Imagem, vídeo, áudio, web, armazenamento e publicação",
      articleDescription:
        "Página hub do inventário de capacidades do AnyCap para mídia, busca na web, armazenamento e fluxos de publicação.",
      articleAbout: ["Capacidades para agentes de IA", "Geração de mídia", "Busca na web", "Armazenamento Drive"],
      articleKeywords: [
        "capacidades para agentes de ia",
        "geração de imagem para agentes de ia",
        "geração de vídeo para agentes de ia",
        "compreensão de áudio para agentes de ia",
        "api de busca na web para agentes de ia",
        "crawl na web para agentes de ia",
        "drive para agentes de ia",
        "publicação para agentes de ia",
      ],
    },
    breadcrumbItems: [
      { name: "Início", href: "/" },
      { name: "Capacidades", href: "/capabilities" },
    ],
    heroEyebrow: "Capacidades para agentes de IA",
    heroTitleLine1: "Mantenha o agente que você usa.",
    heroTitleLine2: "Adicione as capacidades que faltam.",
    heroParagraph:
      "O AnyCap é um runtime de capacidades para agentes de IA voltados a código. Comece com o inventário público de capacidades em uma única CLI, um fluxo de autenticação e um caminho de instalação para Claude Code, Cursor, Codex e o restante da sua stack de agentes. O mesmo runtime também se estende para fluxos adjacentes conforme seus fluxos de trabalho crescem.",
    overviewTitle: "Como usar o inventário de capacidades",
    overviewParagraphs: [
      "O hub de capacidades é útil quando a lacuna do workflow está clara, mas a escolha exata da página ainda não. Ele dá às equipes um lugar único para revisar a superfície do runtime antes de seguir para geração, entendimento, recuperação, armazenamento ou páginas mais específicas.",
      "Isso faz do inventário algo maior que uma lista de features. Ele funciona como camada de roteamento para conectar um resultado que está faltando no workflow do agente à capability certa, à página de modelo certa ou ao caminho de instalação mais adequado.",
    ],
    gapTable: {
      eyebrow: "Comparação",
      title: "O que os agentes de código mais usados ainda não têm",
      description:
        "Esta tabela mostra a lacuna de capacidades no ecossistema atual de agentes e a camada que o AnyCap adiciona por cima.",
      addWithAnycapLabel: "Adicionar com AnyCap",
      footnote:
        "Essa é a forma mais rápida de mostrar a narrativa: mantenha o agente, adicione a camada de capacidade que falta.",
    },
    gapCellLabels: {
      builtIn: "Integrado",
      notBuiltIn: "Não integrado",
      noUnifiedRuntime: "Sem runtime unificado",
      noUnifiedAudioRuntime: "Sem runtime de áudio unificado",
      available: "Disponível",
      externalTooling: "Ferramenta externa",
      noGroundedFlow: "Sem fluxo fundamentado",
      noReusableCrawlRuntime: "Sem runtime de crawl reutilizável",
      noSharedAssetLayer: "Sem camada de ativos compartilhada",
      comingSoon: "Em breve",
    },
    capabilityNames: {
      imageGeneration: "Geração de imagem",
      videoGeneration: "Geração de vídeo",
      musicGeneration: "Geração de música",
      imageUnderstanding: "Compreensão de imagem",
      videoAnalysis: "Análise de vídeo",
      audioUnderstanding: "Compreensão de áudio",
      webSearch: "Busca na web",
      groundedWebSearch: "Busca na web fundamentada",
      webCrawl: "Crawl na web",
      drive: "Drive",
      speech: "Fala",
    },
    capabilityDescriptions: {
      imageGeneration:
        "Gere e edite imagens por meio do Seedream 5, Seedream 4.5, Nano Banana Pro e Nano Banana 2.",
      videoGeneration:
        "Gere vídeos a partir de prompts de texto e imagens por meio do Veo 3.1, Seedance 1.5 Pro e Kling 3.0.",
      musicGeneration:
        "Gere faixas musicais e áudio instrumental em um único runtime de música.",
      imageUnderstanding:
        "Analise screenshots, diagramas, fotos e gráficos em um único runtime de visão.",
      videoAnalysis:
        "Inspecione gravações e extraia informações estruturadas de conteúdo em vídeo.",
      audioUnderstanding:
        "Transcreva e analise reuniões, podcasts e clipes de voz em um único runtime.",
      webSearch: "Busque na web por resultados estruturados com conteúdo opcional de página completa.",
      groundedWebSearch:
        "Obtenha respostas sintetizadas com citações fundamentadas em busca na web em tempo real.",
      webCrawl: "Converta páginas web em Markdown limpo para fluxos de agentes downstream.",
      drive: "Armazene saídas, organize ativos e compartilhe URLs públicas pelo AnyCap Drive.",
      speech: "Conversão de texto em fala e geração de voz.",
    },
    sectionTitles: {
      browseInventory: "Navegue pelo inventário de capacidades disponíveis",
      modelsBehind: "Modelos por trás das capacidades",
      relatedEntryPages: "Páginas de entrada relacionadas",
      comingSoon: "Em breve",
      getStarted: "Comece agora",
    },
    modelGuideCards: [
      {
        eyebrow: "Hub",
        title: "Guia de modelos",
        href: "/models",
        body: "Navegue pelos modelos multimodais disponíveis no AnyCap e mapeie-os para o fluxo de agente certo.",
      },
      {
        eyebrow: "Guia",
        title: "Engenharia de contexto para agentes",
        href: "/guides/context-engineering-for-agents",
        body: "Entenda como os agentes decidem quando as capacidades de imagem, vídeo e análise devem fazer parte do fluxo.",
      },
    ],
    relatedCards: [
      {
        eyebrow: "Conteúdo publicado",
        title: "Hub AnyCap Page",
        href: buildHostedPagePath("pt-br", "/blog"),
        summary:
          "Explore guias, posts e notícias hospedados no mesmo domínio por meio do AnyCap Page.",
      },
      {
        eyebrow: "Hub de deficiências",
        title: "O que os agentes não conseguem fazer",
        href: "/learn/what-agents-cant-do",
        summary:
          "Comece aqui se você está diagnosticando a capacidade ausente antes de escolher uma página específica.",
      },
      {
        eyebrow: "Caminho do agente",
        title: "Para Claude Code",
        href: "/for/claude-code",
        summary:
          "Comece aqui se o Claude Code é o seu agente principal e você quer o caminho de instalação específico do ecossistema.",
      },
      {
        eyebrow: "Caminho de instalação",
        title: "Instalar AnyCap",
        href: "/guides/install-anycap",
        summary:
          "Guia passo a passo para instalar a CLI, autenticar, verificar e executar o primeiro comando.",
      },
    ],
    buttonLabels: {
      getStarted: "Comece agora",
      whatAgentsCantDo: "O que os agentes não conseguem fazer",
      forClaudeCode: "Para Claude Code",
    },
    itemListJsonLd: {
      name: "Capacidades AnyCap",
      description:
        "Hub de capacidades do inventário AnyCap para mídia, busca na web, armazenamento e fluxos de publicação.",
    },
  },
  id: {
    metadata: {
      title: "Kapabilitas Agen AI — Gambar, video, audio, web, penyimpanan, dan publikasi",
      description:
        "Jelajahi runtime kapabilitas agen AI yang menambahkan alur gambar, video, audio, web, penyimpanan, dan publikasi melalui satu jalur instalasi, satu alur autentikasi, dan satu CLI.",
      openGraphTitle: "Kapabilitas Agen AI — Gambar, video, audio, web, penyimpanan, dan publikasi",
      openGraphDescription:
        "Mulai dari inventaris kapabilitas langsung untuk agen coding, lalu lanjutkan ke alur penyimpanan dan publikasi melalui runtime yang sama.",
      articleHeadline: "Kapabilitas Agen AI — Gambar, video, audio, web, penyimpanan, dan publikasi",
      articleDescription:
        "Halaman hub untuk inventaris kapabilitas AnyCap yang aktif, mencakup media, pengambilan web, penyimpanan, dan alur publikasi.",
      articleAbout: ["Kapabilitas agen AI", "Pembuatan media", "Pengambilan web", "Penyimpanan Drive"],
      articleKeywords: [
        "kapabilitas agen ai",
        "pembuatan gambar untuk agen ai",
        "pembuatan video untuk agen ai",
        "pemahaman audio untuk agen ai",
        "api pencarian web untuk agen ai",
        "crawl web untuk agen ai",
        "drive untuk agen ai",
        "publikasi halaman untuk agen ai",
      ],
    },
    breadcrumbItems: [
      { name: "Home", href: "/" },
      { name: "Kapabilitas", href: "/capabilities" },
    ],
    heroEyebrow: "Kapabilitas agen AI",
    heroTitleLine1: "Pertahankan agen yang Anda pakai.",
    heroTitleLine2: "Tambahkan kapabilitas yang belum dimiliki.",
    heroParagraph:
      "AnyCap adalah runtime kapabilitas agen AI untuk agen coding. Mulailah dari inventaris kapabilitas publik melalui satu CLI, satu alur autentikasi, dan satu jalur instalasi di Claude Code, Cursor, Codex, dan stack agen Anda yang lain. Runtime yang sama juga berkembang ke alur kerja yang berdekatan seiring kebutuhan Anda bertambah.",
    overviewTitle: "Cara memakai inventaris kapabilitas",
    overviewParagraphs: [
      "Hub kapabilitas berguna saat celah workflow sudah jelas tetapi pilihan halaman yang tepat belum pasti. Ini memberi tim satu tempat untuk meninjau surface runtime yang tersedia sebelum mereka bercabang ke halaman pembuatan gambar, pembuatan video, pemahaman, pengambilan data, penyimpanan, atau kapabilitas terkait lainnya.",
      "Itu membuat halaman inventaris lebih dari sekadar daftar fitur. Halaman ini menjadi lapisan routing yang membantu operator menghubungkan hasil yang hilang dalam workflow agen ke halaman kapabilitas yang tepat, halaman model yang tepat, atau jalur instalasi yang spesifik untuk produk tertentu.",
    ],
    gapTable: {
      eyebrow: "Perbandingan",
      title: "Apa yang masih belum dimiliki oleh agen coding umum",
      description:
        "Tabel ini menunjukkan celah kapabilitas di ekosistem agen saat ini dan lapisan yang ditambahkan AnyCap di atasnya.",
      addWithAnycapLabel: "Tambahkan dengan AnyCap",
      footnote:
        "Ini adalah cara tercepat untuk menunjukkan narasinya: pertahankan agennya, tambahkan lapisan kapabilitas yang hilang.",
    },
    gapCellLabels: {
      builtIn: "Sudah ada",
      notBuiltIn: "Belum ada",
      noUnifiedRuntime: "Tidak ada runtime terpadu",
      noUnifiedAudioRuntime: "Tidak ada runtime audio terpadu",
      available: "Tersedia",
      externalTooling: "Peralatan eksternal",
      noGroundedFlow: "Tidak ada alur grounded",
      noReusableCrawlRuntime: "Tidak ada runtime crawl yang bisa dipakai ulang",
      noSharedAssetLayer: "Tidak ada lapisan aset bersama",
      comingSoon: "Segera hadir",
    },
    capabilityNames: {
      imageGeneration: "Pembuatan Gambar",
      videoGeneration: "Pembuatan Video",
      musicGeneration: "Pembuatan Musik",
      imageUnderstanding: "Pemahaman Gambar",
      videoAnalysis: "Analisis Video",
      audioUnderstanding: "Pemahaman Audio",
      webSearch: "Pencarian Web",
      groundedWebSearch: "Pencarian Web Ter-grounding",
      webCrawl: "Crawl Web",
      drive: "Drive",
      speech: "Ucapan",
    },
    capabilityDescriptions: {
      imageGeneration:
        "Hasilkan dan edit gambar melalui Seedream 5, Seedream 4.5, Nano Banana Pro, dan Nano Banana 2.",
      videoGeneration:
        "Hasilkan video dari prompt teks dan gambar melalui Veo 3.1, Seedance 1.5 Pro, dan Kling 3.0.",
      musicGeneration:
        "Hasilkan trek musik dan audio instrumental melalui satu runtime musik.",
      imageUnderstanding:
        "Analisis tangkapan layar, diagram, foto, dan grafik melalui satu runtime penglihatan.",
      videoAnalysis:
        "Periksa rekaman dan ekstrak informasi terstruktur dari konten video.",
      audioUnderstanding:
        "Transkripsi dan analisis rapat, podcast, dan klip suara melalui satu runtime.",
      webSearch: "Cari web untuk hasil terstruktur dengan konten halaman penuh opsional.",
      groundedWebSearch:
        "Dapatkan jawaban sintetis dengan kutipan yang ter-grounding pada pencarian web langsung.",
      webCrawl: "Ubah halaman web menjadi Markdown bersih untuk alur agen lanjutan.",
      drive: "Simpan output, atur aset, dan bagikan URL publik melalui AnyCap Drive.",
      speech: "Text-to-speech dan pembuatan suara.",
    },
    sectionTitles: {
      browseInventory: "Telusuri inventaris kapabilitas langsung",
      modelsBehind: "Model di balik kapabilitas",
      relatedEntryPages: "Halaman masuk terkait",
      comingSoon: "Segera hadir",
      getStarted: "Mulai",
    },
    modelGuideCards: [
      {
        eyebrow: "Hub",
        title: "Panduan Model",
        href: "/models",
        body: "Telusuri model multimodal yang tersedia melalui AnyCap dan petakan ke workflow agen yang tepat.",
      },
      {
        eyebrow: "Panduan",
        title: "Engineering Konteks untuk Agen",
        href: "/guides/context-engineering-for-agents",
        body: "Pahami bagaimana agen memutuskan kapan kapabilitas gambar, video, dan analisis perlu masuk ke workflow.",
      },
    ],
    relatedCards: [
      {
        eyebrow: "Konten terpublikasi",
        title: "Hub AnyCap Page",
        href: buildHostedPagePath("id", "/blog"),
        summary:
          "Telusuri panduan, posting blog, dan berita yang dihosting di domain yang sama melalui AnyCap Page.",
      },
      {
        eyebrow: "Hub kekurangan",
        title: "Apa yang tidak bisa dilakukan agen",
        href: "/learn/what-agents-cant-do",
        summary:
          "Mulai di sini jika Anda sedang mendiagnosis kemampuan yang hilang sebelum memilih halaman tertentu.",
      },
      {
        eyebrow: "Jalur agen",
        title: "Untuk Claude Code",
        href: "/for/claude-code",
        summary:
          "Mulai di sini jika Claude Code adalah agen utama Anda dan Anda menginginkan jalur instalasi khusus ekosistem.",
      },
      {
        eyebrow: "Jalur instalasi",
        title: "Instal AnyCap",
        href: "/guides/install-anycap",
        summary:
          "Panduan langkah demi langkah untuk menginstal CLI, autentikasi, verifikasi, dan perintah pertama.",
      },
    ],
    buttonLabels: {
      getStarted: "Mulai",
      whatAgentsCantDo: "Apa yang tidak bisa dilakukan agen",
      forClaudeCode: "Untuk Claude Code",
    },
    itemListJsonLd: {
      name: "Kapabilitas AnyCap",
      description:
        "Hub kapabilitas untuk inventaris AnyCap yang aktif di seluruh alur media, pengambilan web, penyimpanan, dan publikasi.",
    },
  },
  de: {
    metadata: {
      title: "KI-Agent-Capabilities — Bild, Video, Audio, Web, Speicher und Publishing",
      description:
        "Durchsuchen Sie den KI-Agent-Capability-Runtime, der Bild-, Video-, Audio-, Web-, Speicher- und Publishing-Workflows über einen Installationspfad, einen Auth-Flow und eine CLI hinzufügt.",
      openGraphTitle: "KI-Agent-Capabilities — Bild, Video, Audio, Web, Speicher und Publishing",
      openGraphDescription:
        "Starten Sie mit dem aktiven Capability-Inventar für Coding-Agenten und erweitern Sie es über denselben Runtime in Speicher- und Publishing-Workflows.",
      articleHeadline: "KI-Agent-Capabilities — Bild, Video, Audio, Web, Speicher und Publishing",
      articleDescription:
        "Hub-Seite für das aktive AnyCap-Capability-Inventar über Medien, Web-Retrieval, Speicher und Publishing-Workflows hinweg.",
      articleAbout: ["KI-Agent-Capabilities", "Mediengenerierung", "Web-Retrieval", "Drive-Speicher"],
      articleKeywords: [
        "ki-agent capabilities",
        "image generation für ki-agenten",
        "video generation für ki-agenten",
        "audio understanding für ki-agenten",
        "web search api für ki-agenten",
        "web crawl für ki-agenten",
        "drive für ki-agenten",
        "page publishing für ki-agenten",
      ],
    },
    breadcrumbItems: [
      { name: "Start", href: "/" },
      { name: "Capabilities", href: "/capabilities" },
    ],
    heroEyebrow: "KI-Agent-Capabilities",
    heroTitleLine1: "Behalten Sie den Agenten, den Sie nutzen.",
    heroTitleLine2: "Ergänzen Sie die fehlenden Capabilities.",
    heroParagraph:
      "AnyCap ist ein KI-Agent-Capability-Runtime für Coding-Agenten. Starten Sie mit dem öffentlichen Capability-Inventar über eine CLI, einen Auth-Flow und einen Installationspfad für Claude Code, Cursor, Codex und den Rest Ihres Agent-Stacks. Derselbe Runtime erweitert sich in benachbarte Workflows, wenn Ihre Anforderungen wachsen.",
    overviewTitle: "Wie Sie das Capability-Inventar nutzen",
    overviewParagraphs: [
      "Der Capability-Hub ist nützlich, wenn die Workflow-Lücke klar ist, die genaue Seitenwahl aber nicht. Er gibt Teams einen Ort, an dem sie die verfügbare Runtime-Oberfläche überblicken können, bevor sie zu Image Generation, Video Generation, Understanding, Retrieval, Speicher oder benachbarten Capability-Seiten verzweigen.",
      "Damit ist die Inventarseite mehr als eine Feature-Liste. Sie ist die Routing-Schicht, die Operatoren hilft, ein fehlendes Ergebnis im Agent-Workflow mit der richtigen Capability-Seite, Modell-Seite oder produktspezifischem Installationspfad zu verbinden.",
    ],
    gapTable: {
      eyebrow: "Vergleich",
      title: "Was den gängigen Coding-Agenten noch fehlt",
      description:
        "Diese Tabelle zeigt die Capability-Lücke im aktuellen Agent-Ökosystem und die Schicht, die AnyCap darüberlegt.",
      addWithAnycapLabel: "Mit AnyCap hinzufügen",
      footnote:
        "Das ist der schnellste Weg, die Erzählung zu zeigen: den Agenten behalten, die fehlende Capability-Schicht ergänzen.",
    },
    gapCellLabels: {
      builtIn: "Eingebaut",
      notBuiltIn: "Nicht eingebaut",
      noUnifiedRuntime: "Kein einheitlicher Runtime",
      noUnifiedAudioRuntime: "Kein einheitlicher Audio-Runtime",
      available: "Verfügbar",
      externalTooling: "Externe Tools",
      noGroundedFlow: "Kein grounded Flow",
      noReusableCrawlRuntime: "Kein wiederverwendbarer Crawl-Runtime",
      noSharedAssetLayer: "Keine gemeinsame Asset-Schicht",
      comingSoon: "Demnächst",
    },
    capabilityNames: {
      imageGeneration: "Image Generation",
      videoGeneration: "Video Generation",
      musicGeneration: "Music Generation",
      imageUnderstanding: "Image Understanding",
      videoAnalysis: "Video Analysis",
      audioUnderstanding: "Audio Understanding",
      webSearch: "Web Search",
      groundedWebSearch: "Grounded Web Search",
      webCrawl: "Web Crawl",
      drive: "Drive",
      speech: "Speech",
    },
    capabilityDescriptions: {
      imageGeneration:
        "Bilder generieren und bearbeiten über Seedream 5, Seedream 4.5, Nano Banana Pro und Nano Banana 2.",
      videoGeneration:
        "Videos aus Text-Prompts und Bildern generieren über Veo 3.1, Seedance 1.5 Pro und Kling 3.0.",
      musicGeneration:
        "Musiktracks und instrumentales Audio über einen einzigen Music-Runtime generieren.",
      imageUnderstanding:
        "Screenshots, Diagramme, Fotos und Charts über einen einheitlichen Vision-Runtime analysieren.",
      videoAnalysis:
        "Aufnahmen prüfen und strukturierte Informationen aus Videoinhalten extrahieren.",
      audioUnderstanding:
        "Meetings, Podcasts und Sprachclips über einen einzigen Runtime transkribieren und analysieren.",
      webSearch: "Das Web nach strukturierten Ergebnissen durchsuchen, optional mit Volltextinhalt der Seite.",
      groundedWebSearch:
        "Synthetisierte Antworten mit Zitaten erhalten, gegroundet in Live-Web-Search.",
      webCrawl: "Webseiten in sauberes Markdown für nachgelagerte Agent-Workflows konvertieren.",
      drive: "Outputs speichern, Assets organisieren und öffentliche URLs über AnyCap Drive teilen.",
      speech: "Text-to-Speech und Sprachgenerierung.",
    },
    sectionTitles: {
      browseInventory: "Aktives Capability-Inventar durchsuchen",
      modelsBehind: "Modelle hinter den Capabilities",
      relatedEntryPages: "Verwandte Einstiegsseiten",
      comingSoon: "Demnächst",
      getStarted: "Loslegen",
    },
    modelGuideCards: [
      {
        eyebrow: "Hub",
        title: "Modell-Guide",
        href: "/models",
        body: "Durchsuchen Sie die multimodalen Modelle, die über AnyCap verfügbar sind, und ordnen Sie sie dem richtigen Agent-Workflow zu.",
      },
      {
        eyebrow: "Guide",
        title: "Context Engineering für Agenten",
        href: "/guides/context-engineering-for-agents",
        body: "Verstehen Sie, wie Agenten entscheiden, wann Image-, Video- und Analyse-Capabilities in den Workflow gehören.",
      },
    ],
    relatedCards: [
      {
        eyebrow: "Veröffentlichte Inhalte",
        title: "AnyCap Page Hub",
        href: buildHostedPagePath("de", "/blog"),
        summary:
          "Durchsuchen Sie gehostete Leitfäden, Blogposts und News auf derselben Domain über AnyCap Page.",
      },
      {
        eyebrow: "Defizit-Hub",
        title: "Was Agenten nicht können",
        href: "/learn/what-agents-cant-do",
        summary:
          "Beginnen Sie hier, wenn Sie die fehlende Capability diagnostizieren, bevor Sie eine spezifische Seite wählen.",
      },
      {
        eyebrow: "Agent-Pfad",
        title: "Für Claude Code",
        href: "/for/claude-code",
        summary:
          "Beginnen Sie hier, wenn Claude Code Ihr primärer Agent ist und Sie den ökosystem-spezifischen Installationspfad wollen.",
      },
      {
        eyebrow: "Installationspfad",
        title: "AnyCap installieren",
        href: "/guides/install-anycap",
        summary:
          "Schritt-für-Schritt-Anleitung zur Installation der CLI, Authentifizierung, Verifizierung und des ersten Befehls.",
      },
    ],
    buttonLabels: {
      getStarted: "Loslegen",
      whatAgentsCantDo: "Was Agenten nicht können",
      forClaudeCode: "Für Claude Code",
    },
    itemListJsonLd: {
      name: "AnyCap Capabilities",
      description:
        "Capability-Hub für das aktive AnyCap-Inventar über Medien, Web-Retrieval, Speicher und Publishing-Workflows hinweg.",
    },
  },
};

function buildCapabilities(content: CapabilitiesPageContent): Capability[] {
  const n = content.capabilityNames;
  const d = content.capabilityDescriptions;
  return [
    { name: n.imageGeneration, category: "Image", status: "available", description: d.imageGeneration, models: "Seedream 5, Seedream 4.5, Nano Banana Pro, Nano Banana 2", href: "/capabilities/image-generation" },
    { name: n.videoGeneration, category: "Video", status: "available", description: d.videoGeneration, models: "Veo 3.1, Seedance 1.5 Pro, Kling 3.0", href: "/capabilities/video-generation" },
    { name: n.musicGeneration, category: "Audio", status: "available", description: d.musicGeneration, models: "ElevenLabs Music, Mureka V8, Suno V5, Suno V5.5", href: "/capabilities/music-generation" },
    { name: n.imageUnderstanding, category: "Vision", status: "available", description: d.imageUnderstanding, models: "Vision models", href: "/capabilities/image-understanding" },
    { name: n.videoAnalysis, category: "Video", status: "available", description: d.videoAnalysis, models: "Vision models", href: "/capabilities/video-analysis" },
    { name: n.audioUnderstanding, category: "Audio", status: "available", description: d.audioUnderstanding, models: "Audio models", href: "/capabilities/audio-understanding" },
    { name: n.webSearch, category: "Web", status: "available", description: d.webSearch, href: "/capabilities/web-search" },
    { name: n.groundedWebSearch, category: "Web", status: "available", description: d.groundedWebSearch, href: "/capabilities/grounded-web-search" },
    { name: n.webCrawl, category: "Web", status: "available", description: d.webCrawl, href: "/capabilities/web-crawl" },
    { name: n.drive, category: "Storage", status: "available", description: d.drive, href: "/capabilities/drive" },
    { name: n.speech, category: "Audio", status: "coming_soon", description: d.speech, href: null },
  ];
}

function buildGapRows(content: CapabilitiesPageContent): CapabilityGapRow[] {
  const c = content.gapCellLabels;
  const n = content.capabilityNames;
  return [
    {
      capability: "Code generation",
      cells: [c.builtIn, c.builtIn, c.builtIn, { label: c.builtIn, tone: "accent" }],
    },
    {
      capability: n.imageGeneration.toLowerCase(),
      cells: [
        { label: c.notBuiltIn, tone: "muted" },
        { label: c.notBuiltIn, tone: "muted" },
        { label: c.notBuiltIn, tone: "muted" },
        { label: c.available, tone: "accent" },
      ],
    },
    {
      capability: n.videoGeneration.toLowerCase(),
      cells: [
        { label: c.notBuiltIn, tone: "muted" },
        { label: c.notBuiltIn, tone: "muted" },
        { label: c.notBuiltIn, tone: "muted" },
        { label: c.available, tone: "accent" },
      ],
    },
    {
      capability: n.musicGeneration.toLowerCase(),
      cells: [
        { label: c.notBuiltIn, tone: "muted" },
        { label: c.notBuiltIn, tone: "muted" },
        { label: c.notBuiltIn, tone: "muted" },
        { label: c.available, tone: "accent" },
      ],
    },
    {
      capability: n.imageUnderstanding.toLowerCase(),
      cells: [
        { label: c.noUnifiedRuntime, tone: "muted" },
        { label: c.noUnifiedRuntime, tone: "muted" },
        { label: c.noUnifiedRuntime, tone: "muted" },
        { label: c.available, tone: "accent" },
      ],
    },
    {
      capability: n.videoAnalysis.toLowerCase(),
      cells: [
        { label: c.noUnifiedRuntime, tone: "muted" },
        { label: c.noUnifiedRuntime, tone: "muted" },
        { label: c.noUnifiedRuntime, tone: "muted" },
        { label: c.available, tone: "accent" },
      ],
    },
    {
      capability: n.audioUnderstanding.toLowerCase(),
      cells: [
        { label: c.noUnifiedAudioRuntime, tone: "muted" },
        { label: c.noUnifiedAudioRuntime, tone: "muted" },
        { label: c.noUnifiedAudioRuntime, tone: "muted" },
        { label: c.available, tone: "accent" },
      ],
    },
    {
      capability: n.webSearch.toLowerCase(),
      cells: [
        { label: c.externalTooling, tone: "muted" },
        { label: c.externalTooling, tone: "muted" },
        { label: c.externalTooling, tone: "muted" },
        { label: c.available, tone: "accent" },
      ],
    },
    {
      capability: n.groundedWebSearch.toLowerCase(),
      cells: [
        { label: c.noGroundedFlow, tone: "muted" },
        { label: c.noGroundedFlow, tone: "muted" },
        { label: c.noGroundedFlow, tone: "muted" },
        { label: c.available, tone: "accent" },
      ],
    },
    {
      capability: n.webCrawl.toLowerCase(),
      cells: [
        { label: c.noReusableCrawlRuntime, tone: "muted" },
        { label: c.noReusableCrawlRuntime, tone: "muted" },
        { label: c.noReusableCrawlRuntime, tone: "muted" },
        { label: c.available, tone: "accent" },
      ],
    },
    {
      capability: "Drive storage",
      cells: [
        { label: c.noSharedAssetLayer, tone: "muted" },
        { label: c.noSharedAssetLayer, tone: "muted" },
        { label: c.noSharedAssetLayer, tone: "muted" },
        { label: c.available, tone: "accent" },
      ],
    },
    {
      capability: n.speech,
      cells: [
        { label: c.notBuiltIn, tone: "muted" },
        { label: c.notBuiltIn, tone: "muted" },
        { label: c.notBuiltIn, tone: "muted" },
        { label: c.comingSoon, tone: "accent" },
      ],
    },
  ];
}

export function getCapabilitiesMetadata(locale: SiteLocale): Metadata {
  const content = contentByLocale[locale] ?? contentByLocale.en;

  return {
    title: content.metadata.title,
    description: content.metadata.description,
    openGraph: {
      type: "website",
      locale: getLocaleConfig(locale).ogLocale,
      url: CAPABILITIES_PATH,
      siteName: siteConfig.siteName,
      title: content.metadata.openGraphTitle,
      description: content.metadata.openGraphDescription,
    },
  };
}

export function getCapabilitiesPageData(locale: SiteLocale) {
  const content = contentByLocale[locale] ?? contentByLocale.en;
  const capabilities = buildCapabilities(content);
  const gapRows = buildGapRows(content);

  const hubArticleJsonLd = createTechArticleJsonLd({
    headline: content.metadata.articleHeadline,
    description: content.metadata.articleDescription,
    path: CAPABILITIES_PATH,
    locale,
    about: [...content.metadata.articleAbout],
    keywords: [...content.metadata.articleKeywords],
  });

  const availableCapabilities = capabilities.filter((cap) => cap.status === "available");

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: content.itemListJsonLd.name,
    description: content.itemListJsonLd.description,
    numberOfItems: availableCapabilities.length,
    itemListElement: availableCapabilities.map((cap, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: cap.name,
      description: cap.description,
      ...(cap.href ? { url: `${siteConfig.url}${cap.href}` } : {}),
    })),
  };

  return {
    ...content,
    capabilities,
    gapRows,
    hubArticleJsonLd,
    itemListJsonLd,
  };
}
