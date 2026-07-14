import type { Metadata } from "next";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { createLocalizedMetadataForPath } from "@/lib/localized-metadata";
import { createTechArticleJsonLd } from "@/lib/schema";
import { EarlyAccessBanner } from "@/components/landing/EarlyAccessBanner";
import { FadeIn } from "@/components/ui/FadeIn";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { getRequestLocale } from "@/lib/request-locale";
import { defaultLocale, type SiteLocale } from "@/lib/site";
import {
  ANYCAP_VS_COMPOSIO_PATH,
  getAnyCapVsComposioMetadata,
} from "./metadata";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

export const metadata: Metadata = createLocalizedMetadataForPath(
  defaultLocale,
  ANYCAP_VS_COMPOSIO_PATH,
  getAnyCapVsComposioMetadata(defaultLocale),
);

type ComparisonRow = {
  dimension: string;
  anycap: string;
  composio: string;
};

type PageContent = {
  breadcrumbItems: readonly { name: string; href?: string; unlinkable?: boolean }[];
  heroEyebrow: string;
  intro: string;
  tableTitle: string;
  tableHeaders: readonly [string, string, string];
  comparisons: readonly ComparisonRow[];
  setupTitle: string;
  setupIntro: string;
  setupCards: readonly {
    title: string;
    steps: readonly string[];
    summary: string;
    accent?: boolean;
  }[];
  chooseAnyCapTitle: string;
  chooseAnyCapItems: readonly string[];
  relatedTitle: string;
  relatedCards: readonly { eyebrow: string; title: string; href: string; body: string }[];
  faqTitle: string;
  faqItems: readonly { question: string; answer: string }[];
  footerCtas: { github: string; capability: string };
  articleJsonLd: Record<string, unknown>;
};

const contentByLocale: Record<SiteLocale, PageContent> = {
  en: {
    breadcrumbItems: [
      { name: "Home", href: "/" },
      { name: "Compare", href: "/compare", unlinkable: true },
      { name: "AnyCap vs Composio" },
    ],
    heroEyebrow: "Compare",
    intro:
      "AnyCap and Composio both help AI agents do more, but they take fundamentally different approaches. AnyCap is an agent-native capability runtime that gives agents one CLI and one auth flow for multimodal capabilities like image generation and video analysis. Composio is a tool integration platform that connects agents to hundreds of third-party services through SDK integrations. The right choice depends on whether you need deep multimodal capabilities through a consistent agent interface, or broad third-party tool access through a developer SDK.",
    tableTitle: "Side-by-Side Comparison",
    tableHeaders: ["Dimension", "AnyCap", "Composio"],
    comparisons: [
      {
        dimension: "Core concept",
        anycap: "Agent-native capability runtime — one CLI, one auth, every capability",
        composio: "Tool integration platform — connect agents to 250+ third-party tools and APIs",
      },
      {
        dimension: "Install experience",
        anycap: "One skill file + one CLI binary. Install in under 5 minutes.",
        composio: "SDK integration into your application code. Requires API key management per tool.",
      },
      {
        dimension: "Multimodal capabilities",
        anycap: "Built-in image generation, video generation, image read, and video analysis",
        composio: "Connects to external multimodal APIs as tool integrations",
      },
      {
        dimension: "Agent compatibility",
        anycap: "Works across Claude Code, Cursor, Codex, OpenCode, and OpenClaw via skill files",
        composio: "Works with various LLM frameworks via SDK",
      },
      {
        dimension: "Auth model",
        anycap: "Single login for any capability",
        composio: "Per-tool OAuth and API key management",
      },
      {
        dimension: "Design philosophy",
        anycap: "Built for agents from day one. CLI-first and agent-native.",
        composio: "Integration platform designed for developers building agent applications",
      },
    ],
    setupTitle: "Setup experience comparison",
    setupIntro:
      "The difference is clearest during initial setup. Here is what each path looks like from zero to first capability invocation.",
    setupCards: [
      {
        title: "AnyCap setup",
        accent: true,
        steps: [
          "Install skill + CLI (2 commands)",
          "Login once (1 command)",
          "Use any capability immediately",
        ],
        summary: "3 commands · 1 auth flow · all capabilities available",
      },
      {
        title: "Composio setup",
        steps: [
          "Install Composio SDK in your project",
          "Configure API key for the Composio platform",
          "Connect each tool individually via OAuth or API key",
          "Wire tool invocations into your agent framework",
        ],
        summary: "SDK integration · per-tool auth · tools added incrementally",
      },
    ],
    chooseAnyCapTitle: "When to choose AnyCap",
    chooseAnyCapItems: [
      "You want agents to generate images, create videos, or analyze visual content.",
      "You use Claude Code, Cursor, or similar agent products and want one install for any capability.",
      "You prefer a CLI-first, agent-native interface over SDK integration.",
      "You want single auth for any capability instead of per-tool OAuth.",
    ],
    relatedTitle: "Related Comparisons and Guides",
    relatedCards: [
      {
        eyebrow: "Compare",
        title: "AnyCap vs OpenAI Agent Builder",
        href: "/compare/anycap-vs-openai-agent-builder",
        body: "See how a capability runtime differs from a builder platform inside the agent stack.",
      },
      {
        eyebrow: "Guide",
        title: "What is an Agent Harness?",
        href: "/guides/what-is-agent-harness",
        body: "Understand where AnyCap fits between the model, the harness, and the capability layer.",
      },
    ],
    faqTitle: "FAQ",
    faqItems: [
      {
        question: "What is the main difference between AnyCap and Composio?",
        answer:
          "AnyCap is a capability runtime that gives agents multimodal capabilities through one CLI and one auth flow. Composio is a tool integration platform that connects agents to hundreds of third-party services through SDK-level integrations. AnyCap focuses on depth of multimodal capabilities; Composio focuses on breadth of service integrations.",
      },
      {
        question: "Can I use both AnyCap and Composio together?",
        answer:
          "Yes. They solve different problems and do not conflict. You can use AnyCap for multimodal capabilities and Composio for SaaS tool integrations in the same agent workflow.",
      },
      {
        question: "Which is better for image and video generation?",
        answer:
          "AnyCap. Image and video generation are built-in capabilities with curated models. Composio can connect to external image APIs as tool integrations, but each integration requires separate configuration.",
      },
      {
        question: "Which is better for connecting to SaaS tools like Gmail or Slack?",
        answer:
          "Composio. It specializes in connecting agents to hundreds of third-party services with managed OAuth. AnyCap does not provide SaaS tool integrations; it focuses on multimodal capabilities and web retrieval.",
      },
      {
        question: "How does authentication differ between AnyCap and Composio?",
        answer:
          "AnyCap uses a single login that covers every capability. Composio manages per-tool OAuth flows and API keys, which gives fine-grained control over each integration but requires more setup as the number of connected tools grows.",
      },
    ],
    footerCtas: {
      github: "View on GitHub",
      capability: "Any Capability",
    },
    articleJsonLd: createTechArticleJsonLd({
      headline: "AnyCap vs Composio — Agent capability comparison",
      description:
        "Compare AnyCap and Composio for giving AI agents capabilities. AnyCap is an agent-native capability runtime with one CLI; Composio is a tool integration platform.",
      path: ANYCAP_VS_COMPOSIO_PATH,
      locale: "en",
      about: ["AnyCap", "Composio", "AI agent capabilities", "Tool integration"],
      keywords: [
        "anycap vs composio",
        "composio alternative",
        "ai agent tools comparison",
        "agent capability runtime vs tool platform",
      ],
      datePublished: "2026-04-03",
      dateModified: "2026-04-10",
    }),
  },
  "pt-br": {
    breadcrumbItems: [
      { name: "Início", href: "/" },
      { name: "Comparar", href: "/compare", unlinkable: true },
      { name: "AnyCap vs Composio" },
    ],
    heroEyebrow: "Comparar",
    intro:
      "AnyCap e Composio ajudam agentes de IA a fazer mais, mas seguem abordagens fundamentalmente diferentes. AnyCap é um runtime de capacidades nativo para agentes que oferece uma CLI e um único fluxo de autenticação para capacidades multimodais como geração de imagem e análise de vídeo. Composio é uma plataforma de integração de ferramentas que conecta agentes a centenas de serviços de terceiros por integrações em nível de SDK. A escolha certa depende de você precisar de capacidades multimodais profundas por uma interface consistente de agente, ou de acesso amplo a ferramentas de terceiros por um SDK para desenvolvedores.",
    tableTitle: "Comparação lado a lado",
    tableHeaders: ["Dimensão", "AnyCap", "Composio"],
    comparisons: [
      {
        dimension: "Conceito central",
        anycap: "Runtime de capacidades nativo para agentes — uma CLI, uma autenticação, toda capacidade",
        composio: "Plataforma de integração de ferramentas — conecta agentes a mais de 250 ferramentas e APIs de terceiros",
      },
      {
        dimension: "Experiência de instalação",
        anycap: "Um arquivo de skill + um binário de CLI. Instala em menos de 5 minutos.",
        composio: "Integração de SDK no código da sua aplicação. Exige gestão de chaves por ferramenta.",
      },
      {
        dimension: "Capacidades multimodais",
        anycap: "Geração de imagem, geração de vídeo, leitura de imagem e análise de vídeo embutidas",
        composio: "Conecta a APIs multimodais externas como integrações de ferramenta",
      },
      {
        dimension: "Compatibilidade com agentes",
        anycap: "Funciona com Claude Code, Cursor, Codex, OpenCode e OpenClaw via arquivos de skill",
        composio: "Funciona com vários frameworks de LLM via SDK",
      },
      {
        dimension: "Modelo de autenticação",
        anycap: "Um único login para qualquer capacidade",
        composio: "OAuth e chaves de API por ferramenta",
      },
      {
        dimension: "Filosofia de design",
        anycap: "Construído para agentes desde o primeiro dia. CLI-first e nativo para agentes.",
        composio: "Plataforma de integração desenhada para desenvolvedores que constroem aplicações com agentes",
      },
    ],
    setupTitle: "Comparação da experiência de setup",
    setupIntro:
      "A diferença fica mais clara durante a configuração inicial. Veja como cada caminho parece do zero até a primeira invocação de capacidade.",
    setupCards: [
      {
        title: "Setup do AnyCap",
        accent: true,
        steps: [
          "Instale skill + CLI (2 comandos)",
          "Faça login uma vez (1 comando)",
          "Use qualquer capacidade imediatamente",
        ],
        summary: "3 comandos · 1 fluxo de autenticação · todas as capacidades disponíveis",
      },
      {
        title: "Setup do Composio",
        steps: [
          "Instale o SDK do Composio no seu projeto",
          "Configure a chave de API da plataforma Composio",
          "Conecte cada ferramenta individualmente por OAuth ou chave",
          "Ligue as invocações das ferramentas ao framework do seu agente",
        ],
        summary: "Integração de SDK · autenticação por ferramenta · ferramentas adicionadas de forma incremental",
      },
    ],
    chooseAnyCapTitle: "Quando escolher AnyCap",
    chooseAnyCapItems: [
      "Você quer que agentes gerem imagens, criem vídeos ou analisem conteúdo visual.",
      "Você usa Claude Code, Cursor ou produtos de agente semelhantes e quer uma única instalação para qualquer capacidade.",
      "Você prefere uma interface CLI-first e nativa para agentes em vez de integração por SDK.",
      "Você quer uma autenticação única para qualquer capacidade em vez de OAuth por ferramenta.",
    ],
    relatedTitle: "Comparações e guias relacionados",
    relatedCards: [
      {
        eyebrow: "Comparar",
        title: "AnyCap vs OpenAI Agent Builder",
        href: "/compare/anycap-vs-openai-agent-builder",
        body: "Veja como um runtime de capacidades difere de uma plataforma builder dentro da stack de agentes.",
      },
      {
        eyebrow: "Guia",
        title: "O que é um Agent Harness?",
        href: "/guides/what-is-agent-harness",
        body: "Entenda onde o AnyCap entra entre o modelo, o harness e a camada de capacidades.",
      },
    ],
    faqTitle: "FAQ",
    faqItems: [
      {
        question: "Qual é a principal diferença entre AnyCap e Composio?",
        answer:
          "AnyCap é um runtime de capacidades que oferece capacidades multimodais a agentes por uma CLI e um único fluxo de autenticação. Composio é uma plataforma de integração de ferramentas que conecta agentes a centenas de serviços de terceiros por integrações em nível de SDK. O AnyCap foca em profundidade de capacidades multimodais; o Composio foca em amplitude de integrações de serviço.",
      },
      {
        question: "Posso usar AnyCap e Composio juntos?",
        answer:
          "Sim. Eles resolvem problemas diferentes e não entram em conflito. Você pode usar AnyCap para capacidades multimodais e Composio para integrações com ferramentas SaaS no mesmo fluxo de agente.",
      },
      {
        question: "Qual é melhor para geração de imagem e vídeo?",
        answer:
          "AnyCap. Geração de imagem e vídeo são capacidades nativas com modelos curados. O Composio pode conectar a APIs externas de imagem como integrações de ferramenta, mas cada integração exige configuração separada.",
      },
      {
        question: "Qual é melhor para conectar a ferramentas SaaS como Gmail ou Slack?",
        answer:
          "Composio. Ele é especializado em conectar agentes a centenas de serviços de terceiros com OAuth gerenciado. O AnyCap não oferece integrações com ferramentas SaaS; ele foca em capacidades multimodais e recuperação na web.",
      },
      {
        question: "Como a autenticação difere entre AnyCap e Composio?",
        answer:
          "O AnyCap usa um único login que cobre toda capacidade. O Composio gerencia fluxos de OAuth e chaves por ferramenta, o que dá controle mais fino sobre cada integração, mas exige mais setup à medida que o número de ferramentas conectadas cresce.",
      },
    ],
    footerCtas: {
      github: "Ver no GitHub",
      capability: "Qualquer capacidade",
    },
    articleJsonLd: createTechArticleJsonLd({
      headline: "AnyCap vs Composio — Comparação de capacidades para agentes",
      description:
        "Compare AnyCap e Composio para dar capacidades a agentes de IA. AnyCap é um runtime de capacidades nativo para agentes com uma CLI; Composio é uma plataforma de integração de ferramentas.",
      path: ANYCAP_VS_COMPOSIO_PATH,
      locale: "pt-br",
      about: ["AnyCap", "Composio", "Capacidades de agentes de IA", "Integração de ferramentas"],
      keywords: [
        "anycap vs composio",
        "alternativa ao composio",
        "comparação de ferramentas para agentes de ia",
        "runtime de capacidades vs plataforma de ferramentas",
      ],
      datePublished: "2026-04-03",
      dateModified: "2026-04-10",
    }),
  },
  id: {
    breadcrumbItems: [
      { name: "Beranda", href: "/" },
      { name: "Bandingkan", href: "/compare", unlinkable: true },
      { name: "AnyCap vs Composio" },
    ],
    heroEyebrow: "Bandingkan",
    intro:
      "AnyCap dan Composio sama-sama membantu agen AI berbuat lebih banyak, tapi pendekatannya berbeda secara fundamental. AnyCap adalah capability runtime yang agent-native — satu CLI, satu auth flow untuk kapabilitas multimodal seperti image generation dan video analysis. Composio adalah platform integrasi tools yang menyambungkan agen ke ratusan layanan pihak ketiga lewat integrasi level SDK. Pilihannya tergantung: butuh kapabilitas multimodal yang dalam lewat satu antarmuka agen yang konsisten, atau akses luas ke tools pihak ketiga lewat SDK developer.",
    tableTitle: "Perbandingan berdampingan",
    tableHeaders: ["Dimensi", "AnyCap", "Composio"],
    comparisons: [
      {
        dimension: "Konsep inti",
        anycap: "Capability runtime agent-native — satu CLI, satu auth, semua kapabilitas",
        composio: "Platform integrasi tools — menyambungkan agen ke 250+ tools dan API pihak ketiga",
      },
      {
        dimension: "Pengalaman instalasi",
        anycap: "Satu skill file + satu binary CLI. Terpasang di bawah 5 menit.",
        composio: "Integrasi SDK ke kode aplikasi kamu. Butuh manajemen API key per tool.",
      },
      {
        dimension: "Kapabilitas multimodal",
        anycap: "Image generation, video generation, image read, dan video analysis bawaan",
        composio: "Menyambung ke API multimodal eksternal sebagai integrasi tool",
      },
      {
        dimension: "Kompatibilitas agen",
        anycap: "Jalan di Claude Code, Cursor, Codex, OpenCode, dan OpenClaw lewat skill file",
        composio: "Jalan dengan berbagai framework LLM lewat SDK",
      },
      {
        dimension: "Model autentikasi",
        anycap: "Satu login untuk semua kapabilitas",
        composio: "Manajemen OAuth dan API key per tool",
      },
      {
        dimension: "Filosofi desain",
        anycap: "Dibangun untuk agen sejak hari pertama. CLI-first dan agent-native.",
        composio: "Platform integrasi yang dirancang untuk developer yang membangun aplikasi agen",
      },
    ],
    setupTitle: "Perbandingan pengalaman setup",
    setupIntro:
      "Perbedaannya paling jelas saat setup awal. Begini bentuk tiap jalur dari nol sampai pemanggilan kapabilitas pertama.",
    setupCards: [
      {
        title: "Setup AnyCap",
        accent: true,
        steps: [
          "Pasang skill + CLI (2 perintah)",
          "Login sekali (1 perintah)",
          "Pakai kapabilitas apa pun langsung",
        ],
        summary: "3 perintah · 1 auth flow · semua kapabilitas siap pakai",
      },
      {
        title: "Setup Composio",
        steps: [
          "Pasang Composio SDK di project",
          "Konfigurasikan API key untuk platform Composio",
          "Sambungkan tiap tool secara terpisah lewat OAuth atau API key",
          "Hubungkan pemanggilan tool ke framework agen kamu",
        ],
        summary: "Integrasi SDK · auth per tool · tools ditambahkan inkremental",
      },
    ],
    chooseAnyCapTitle: "Kapan memilih AnyCap",
    chooseAnyCapItems: [
      "Kamu ingin agen membuat gambar, membuat video, atau menganalisis konten visual.",
      "Kamu pakai Claude Code, Cursor, atau produk agen sejenis dan ingin sekali install untuk semua kapabilitas.",
      "Kamu lebih suka antarmuka CLI-first yang agent-native dibanding integrasi SDK.",
      "Kamu mau satu auth untuk semua kapabilitas alih-alih OAuth per tool.",
    ],
    relatedTitle: "Perbandingan dan panduan terkait",
    relatedCards: [
      {
        eyebrow: "Bandingkan",
        title: "AnyCap vs OpenAI Agent Builder",
        href: "/compare/anycap-vs-openai-agent-builder",
        body: "Lihat bedanya capability runtime dengan platform builder di dalam stack agen.",
      },
      {
        eyebrow: "Panduan",
        title: "Apa itu Agent Harness?",
        href: "/guides/what-is-agent-harness",
        body: "Pahami posisi AnyCap di antara model, harness, dan lapisan kapabilitas.",
      },
    ],
    faqTitle: "FAQ",
    faqItems: [
      {
        question: "Apa beda utama AnyCap dan Composio?",
        answer:
          "AnyCap adalah capability runtime yang memberi agen kapabilitas multimodal lewat satu CLI dan satu auth flow. Composio adalah platform integrasi tools yang menyambungkan agen ke ratusan layanan pihak ketiga lewat integrasi level SDK. AnyCap fokus pada kedalaman kapabilitas multimodal; Composio fokus pada keluasan integrasi layanan.",
      },
      {
        question: "Bisa pakai AnyCap dan Composio bersamaan?",
        answer:
          "Bisa. Keduanya memecahkan masalah yang berbeda dan tidak tabrakan. Kamu bisa pakai AnyCap untuk kapabilitas multimodal dan Composio untuk integrasi tool SaaS dalam workflow agen yang sama.",
      },
      {
        question: "Mana yang lebih baik untuk image dan video generation?",
        answer:
          "AnyCap. Image dan video generation adalah kapabilitas bawaan dengan model yang sudah dikurasi. Composio bisa menyambung ke API gambar eksternal sebagai integrasi tool, tapi tiap integrasi butuh konfigurasi terpisah.",
      },
      {
        question: "Mana yang lebih baik untuk menyambung ke tools SaaS seperti Gmail atau Slack?",
        answer:
          "Composio. Spesialisasinya menyambungkan agen ke ratusan layanan pihak ketiga dengan OAuth terkelola. AnyCap tidak menyediakan integrasi tool SaaS; fokusnya kapabilitas multimodal dan web retrieval.",
      },
      {
        question: "Bagaimana autentikasi AnyCap dan Composio berbeda?",
        answer:
          "AnyCap pakai satu login yang menutup semua kapabilitas. Composio mengelola OAuth dan API key per tool, memberi kontrol detail tiap integrasi tapi butuh setup lebih banyak saat jumlah tool tersambung bertambah.",
      },
    ],
    footerCtas: {
      github: "Lihat di GitHub",
      capability: "Semua Kapabilitas",
    },
    articleJsonLd: createTechArticleJsonLd({
      headline: "AnyCap vs Composio — Perbandingan kapabilitas agen",
      description:
        "Bandingkan AnyCap dan Composio untuk memberi kapabilitas ke agen AI. AnyCap adalah capability runtime agent-native dengan satu CLI; Composio adalah platform integrasi tools.",
      path: ANYCAP_VS_COMPOSIO_PATH,
      locale: "id",
      about: ["AnyCap", "Composio", "Kapabilitas agen AI", "Integrasi tools"],
      keywords: [
        "anycap vs composio",
        "alternatif composio",
        "perbandingan tools agen ai",
        "capability runtime vs platform tools",
      ],
      datePublished: "2026-04-03",
      dateModified: "2026-04-10",
    }),
  },
  de: {
    breadcrumbItems: [
      { name: "Startseite", href: "/" },
      { name: "Vergleich", href: "/compare", unlinkable: true },
      { name: "AnyCap vs Composio" },
    ],
    heroEyebrow: "Vergleich",
    intro:
      "AnyCap und Composio helfen beide KI-Agenten, mehr zu erreichen, verfolgen aber grundlegend unterschiedliche Ansätze. AnyCap ist eine agent-native Capability-Runtime, die Agenten eine CLI und einen Auth-Flow für multimodale Capabilities wie Bildgenerierung und Videoanalyse bietet. Composio ist eine Tool-Integrationsplattform, die Agenten über SDK-Integrationen mit Hunderten von Drittanbieterdiensten verbindet. Die richtige Wahl hängt davon ab, ob Sie tiefe multimodale Capabilities über eine konsistente Agent-Oberfläche oder breiten Zugriff auf Drittanbieter-Tools über ein Entwickler-SDK benötigen.",
    tableTitle: "Direkter Vergleich",
    tableHeaders: ["Dimension", "AnyCap", "Composio"],
    comparisons: [
      {
        dimension: "Kernkonzept",
        anycap: "Agent-native Capability-Runtime – eine CLI, ein Auth, jede Capability",
        composio: "Tool-Integrationsplattform – verbindet Agenten mit über 250 Drittanbieter-Tools und APIs",
      },
      {
        dimension: "Installationserlebnis",
        anycap: "Eine Skill-Datei + ein CLI-Binary. In unter 5 Minuten installiert.",
        composio: "SDK-Integration in Ihren Anwendungscode. Erfordert API-Key-Verwaltung pro Tool.",
      },
      {
        dimension: "Multimodale Capabilities",
        anycap: "Bildgenerierung, Videogenerierung, Bildverständnis und Videoanalyse eingebaut",
        composio: "Verbindet sich mit externen multimodalen APIs als Tool-Integrationen",
      },
      {
        dimension: "Agent-Kompatibilität",
        anycap: "Funktioniert mit Claude Code, Cursor, Codex, OpenCode und OpenClaw über Skill-Dateien",
        composio: "Funktioniert mit verschiedenen LLM-Frameworks über SDK",
      },
      {
        dimension: "Auth-Modell",
        anycap: "Ein einziges Login für jede Capability",
        composio: "OAuth- und API-Key-Verwaltung pro Tool",
      },
      {
        dimension: "Designphilosophie",
        anycap: "Vom ersten Tag an für Agenten gebaut. CLI-first und agent-native.",
        composio: "Integrationsplattform für Entwickler, die Agent-Anwendungen bauen",
      },
    ],
    setupTitle: "Vergleich des Setup-Erlebnisses",
    setupIntro:
      "Der Unterschied wird beim initialen Setup am deutlichsten. So sieht jeder Pfad von null bis zum ersten Capability-Aufruf aus.",
    setupCards: [
      {
        title: "AnyCap-Setup",
        accent: true,
        steps: [
          "Skill + CLI installieren (2 Befehle)",
          "Einmal anmelden (1 Befehl)",
          "Jede Capability sofort nutzen",
        ],
        summary: "3 Befehle · 1 Auth-Flow · alle Capabilities verfügbar",
      },
      {
        title: "Composio-Setup",
        steps: [
          "Composio-SDK in Ihrem Projekt installieren",
          "API-Key für die Composio-Plattform konfigurieren",
          "Jedes Tool einzeln über OAuth oder API-Key verbinden",
          "Tool-Aufrufe in Ihr Agent-Framework einbinden",
        ],
        summary: "SDK-Integration · Auth pro Tool · Tools werden inkrementell hinzugefügt",
      },
    ],
    chooseAnyCapTitle: "Wann AnyCap wählen",
    chooseAnyCapItems: [
      "Sie möchten, dass Agenten Bilder generieren, Videos erstellen oder visuelle Inhalte analysieren.",
      "Sie nutzen Claude Code, Cursor oder ähnliche Agent-Produkte und wollen eine Installation für jede Capability.",
      "Sie bevorzugen eine CLI-first, agent-native Oberfläche statt SDK-Integration.",
      "Sie wollen ein einziges Auth für jede Capability statt OAuth pro Tool.",
    ],
    relatedTitle: "Verwandte Vergleiche und Leitfäden",
    relatedCards: [
      {
        eyebrow: "Vergleich",
        title: "AnyCap vs OpenAI Agent Builder",
        href: "/compare/anycap-vs-openai-agent-builder",
        body: "Sehen Sie, wie sich eine Capability-Runtime von einer Builder-Plattform innerhalb des Agent-Stacks unterscheidet.",
      },
      {
        eyebrow: "Leitfaden",
        title: "Was ist ein Agent Harness?",
        href: "/guides/what-is-agent-harness",
        body: "Verstehen Sie, wo AnyCap zwischen Modell, Harness und Capability-Schicht liegt.",
      },
    ],
    faqTitle: "FAQ",
    faqItems: [
      {
        question: "Was ist der Hauptunterschied zwischen AnyCap und Composio?",
        answer:
          "AnyCap ist eine Capability-Runtime, die Agenten multimodale Capabilities über eine CLI und einen Auth-Flow gibt. Composio ist eine Tool-Integrationsplattform, die Agenten über SDK-Integrationen mit Hunderten von Drittanbieterdiensten verbindet. AnyCap fokussiert auf Tiefe der multimodalen Capabilities; Composio auf Breite der Service-Integrationen.",
      },
      {
        question: "Kann ich AnyCap und Composio zusammen nutzen?",
        answer:
          "Ja. Beide lösen unterschiedliche Probleme und konfligieren nicht. Sie können AnyCap für multimodale Capabilities und Composio für SaaS-Tool-Integrationen im selben Agent-Workflow verwenden.",
      },
      {
        question: "Was ist besser für Bild- und Videogenerierung?",
        answer:
          "AnyCap. Bild- und Videogenerierung sind eingebaute Capabilities mit kuratierten Modellen. Composio kann externe Bild-APIs als Tool-Integrationen anbinden, jede Integration erfordert jedoch separate Konfiguration.",
      },
      {
        question: "Was ist besser für die Anbindung an SaaS-Tools wie Gmail oder Slack?",
        answer:
          "Composio. Es spezialisiert sich darauf, Agenten mit Hunderten von Drittanbieterdiensten über verwaltetes OAuth zu verbinden. AnyCap bietet keine SaaS-Tool-Integrationen; es fokussiert auf multimodale Capabilities und Web-Retrieval.",
      },
      {
        question: "Wie unterscheidet sich die Authentifizierung zwischen AnyCap und Composio?",
        answer:
          "AnyCap verwendet ein einziges Login, das jede Capability abdeckt. Composio verwaltet OAuth-Flows und API-Keys pro Tool, was feinkörnige Kontrolle über jede Integration gibt, aber mit wachsender Anzahl verbundener Tools mehr Setup erfordert.",
      },
    ],
    footerCtas: {
      github: "Auf GitHub ansehen",
      capability: "Alle Capabilities",
    },
    articleJsonLd: createTechArticleJsonLd({
      headline: "AnyCap vs Composio – Vergleich der Agent-Capabilities",
      description:
        "Vergleichen Sie AnyCap und Composio, um KI-Agenten Capabilities zu geben. AnyCap ist eine agent-native Capability-Runtime mit einer CLI; Composio ist eine Tool-Integrationsplattform.",
      path: ANYCAP_VS_COMPOSIO_PATH,
      locale: "de",
      about: ["AnyCap", "Composio", "KI-Agent-Capabilities", "Tool-Integration"],
      keywords: [
        "anycap vs composio",
        "composio alternative",
        "vergleich ki-agent-tools",
        "capability runtime vs tool-plattform",
      ],
      datePublished: "2026-04-03",
      dateModified: "2026-04-10",
    }),
  },
};

export default async function AnycapVsComposioPage() {
  const locale = await getRequestLocale();
  const content = contentByLocale[locale] ?? contentByLocale.en;
  return (
    <>
      <BreadcrumbJsonLd items={content.breadcrumbItems} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(content.articleJsonLd) }} />
      <article className="px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-[1280px] py-12 md:py-20 lg:py-24">
          <FadeIn>
            <p className="text-[11px] text-[#6b7d3a] tracking-[0.8px] mb-4" style={mono}>{content.heroEyebrow}</p>
            <h1
              className="leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(28px, 5vw, 60px)" }}
            >
              AnyCap vs Composio
            </h1>
            <p className="mt-6 max-w-[700px] text-base leading-7 text-[#4d5145] md:text-lg">
              {content.intro}
            </p>
          </FadeIn>

          <FadeIn className="mt-8">
            <EarlyAccessBanner />
          </FadeIn>

          <div className="mt-16 md:mt-24"><hr className="border-t border-[#d4dbb8]" /></div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="text-lg md:text-xl text-[#1c1f17] mb-8" style={pixel}>
                {content.tableTitle}
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[#d4dbb8]">
                      {content.tableHeaders.map((header, index) => (
                        <th
                          key={header}
                          className={`pb-3 ${index < 2 ? "pr-6" : ""} text-[11px] tracking-[0.5px] ${index === 1 ? "text-[#6b7d3a]" : "text-[#5a5e52]"} ${index === 0 ? "w-[160px]" : ""}`}
                          style={mono}
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {content.comparisons.map((row) => (
                      <tr key={row.dimension} className="border-b border-[#d4dbb8]/50">
                        <td className="py-4 pr-6 text-sm font-medium text-[#1c1f17] align-top">{row.dimension}</td>
                        <td className="py-4 pr-6 text-sm text-[#4d5145] leading-6 align-top">{row.anycap}</td>
                        <td className="py-4 text-sm text-[#4d5145] leading-6 align-top">{row.composio}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24"><hr className="border-t border-[#d4dbb8]" /></div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="text-lg md:text-xl text-[#1c1f17] mb-4" style={pixel}>
                {content.setupTitle}
              </h2>
              <p className="max-w-[700px] text-base leading-7 text-[#4d5145] mb-8">
                {content.setupIntro}
              </p>
              <div className="grid gap-6 md:grid-cols-2 max-w-[960px]">
                {content.setupCards.map((card) => (
                  <div
                    key={card.title}
                    className={`rounded-xl border p-6 ${card.accent ? "border-[#6b7d3a] bg-[#f7f8ef]/80" : "border-[#d4dbb8] bg-[#fffffc]/70"}`}
                  >
                    <p className={`text-[11px] tracking-[0.5px] mb-3 ${card.accent ? "text-[#6b7d3a]" : "text-[#5a5e52]"}`} style={mono}>{card.title}</p>
                    <div className="space-y-3">
                      {card.steps.map((step, index) => (
                        <div key={step} className="flex items-start gap-3">
                          <span className={`mt-0.5 text-[11px] font-bold w-4 shrink-0 ${card.accent ? "text-[#6b7d3a]" : "text-[#5a5e52]"}`} style={mono}>{index + 1}</span>
                          <p className="text-sm text-[#4d5145] leading-6">{step}</p>
                        </div>
                      ))}
                    </div>
                    <p className={`mt-4 text-[11px] tracking-[0.5px] ${card.accent ? "text-[#6b7d3a]" : "text-[#5a5e52]"}`} style={mono}>
                      {card.summary}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24"><hr className="border-t border-[#d4dbb8]" /></div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="text-lg md:text-xl text-[#1c1f17] mb-6" style={pixel}>
                {content.chooseAnyCapTitle}
              </h2>
              <ul className="space-y-3 max-w-[700px]">
                {content.chooseAnyCapItems.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-[#4d5145] leading-6">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#6b7d3a] shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24"><hr className="border-t border-[#d4dbb8]" /></div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="text-lg md:text-xl text-[#1c1f17] mb-8" style={pixel}>
                {content.relatedTitle}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 max-w-[960px]">
                {content.relatedCards.map((card) => (
                  <Link
                    key={card.href}
                    href={card.href}
                    className="border border-[#d4dbb8] p-5 hover:border-[#6b7d3a] transition-colors"
                  >
                    <p className="text-[11px] text-[#6b7d3a] tracking-[0.5px] mb-2" style={mono}>
                      {card.eyebrow}
                    </p>
                    <h3 className="text-[15px] font-bold text-[#1c1f17] mb-2" style={mono}>
                      {card.title}
                    </h3>
                    <p className="text-sm text-[#4d5145] leading-6">
                      {card.body}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24"><hr className="border-t border-[#d4dbb8]" /></div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="text-lg md:text-xl text-[#1c1f17] mb-8" style={pixel}>
                {content.faqTitle}
              </h2>
              <div className="max-w-[860px] space-y-4">
                {content.faqItems.map((item) => (
                  <div key={item.question} className="rounded-xl border border-[#d4dbb8] bg-[#fffffc]/70 p-5">
                    <h3 className="mb-2 text-[14px] font-bold text-[#1c1f17]" style={mono}>
                      {item.question}
                    </h3>
                    <p className="text-sm leading-6 text-[#4d5145]">{item.answer}</p>
                  </div>
                ))}
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24"><hr className="border-t border-[#d4dbb8]" /></div>

          <FadeIn>
            <section className="mt-16 md:mt-24 mb-8">
              <div className="flex flex-wrap gap-4">
                <a
                  href="https://github.com/anycap-ai/anycap"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#f4f5f0] bg-[#6b7d3a] hover:bg-[#1c1f17] transition-colors rounded-lg"
                  style={mono}
                >
                  {content.footerCtas.github}
                </a>
                <Link href="/capabilities" className="inline-block px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] border border-[#1c1f17] hover:bg-[#1c1f17] hover:text-[#f4f5f0] transition-colors rounded-lg" style={mono}>{content.footerCtas.capability}</Link>
              </div>
            </section>
          </FadeIn>
        </div>
      </article>
    </>
  );
}
