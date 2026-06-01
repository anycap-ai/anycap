import type { Metadata } from "next";
import { createTechArticleJsonLd } from "@/lib/schema";
import { getLocaleConfig, getLocalizedRouteUrl, siteConfig, type SiteLocale } from "@/lib/site";

export const START_PATH = "/start";

type StartAgentOption = {
  name: string;
  href: string;
  command: string;
  description: string;
};

type StartStep = {
  title: string;
  code: string;
  note: string;
};

type StartGapEntrance = {
  eyebrow: string;
  title: string;
  href: string;
  summary: string;
};

type StartPageContent = {
  metadata: {
    title: string;
    description: string;
    openGraphTitle: string;
    openGraphDescription: string;
    pageName: string;
    pageDescription: string;
  };
  breadcrumbItems: readonly { name: string; href: string }[];
  hero: {
    eyebrow: string;
    titleLine1: string;
    titleLine2: string;
    intro: string;
    lastUpdatedLabel: string;
    naturalLanguageEyebrow: string;
    naturalLanguageLead: string;
    naturalLanguageNote: string;
  };
  video: {
    sectionEyebrow: string;
    title: string;
    description: string;
    alt: string;
  };
  overviewTitle: string;
  overviewParagraphs: string[];
  sectionTitles: {
    agents: string;
    naturalLanguageStartPath: string;
    gapEntrances: string;
    watch: string;
  };
  cardEyebrow: string;
  agentOptions: readonly StartAgentOption[];
  universalSteps: readonly StartStep[];
  gapEntrances: readonly StartGapEntrance[];
  ctas: {
    startWithClaudeCode: string;
    universalInstallGuide: string;
    seeCapabilityGaps: string;
    installAnycap: string;
    viewCapabilities: string;
    forClaudeCode: string;
  };
  pageJsonLd: ReturnType<typeof createTechArticleJsonLd>;
  videoJsonLd: {
    "@context": "https://schema.org";
    "@type": "VideoObject";
    name: string;
    description: string;
    contentUrl: string;
    uploadDate: string;
    duration: string;
    thumbnailUrl: string;
  };
};

const CDN_BASE = "https://cdn.anycap.ai/page_resource/start";
const START_VIDEO_SRC = `${CDN_BASE}/start-hero.mp4`;
const START_VIDEO_POSTER = `${CDN_BASE}/start-hero-poster.jpg`;
const START_VIDEO_THUMBNAIL_URL = START_VIDEO_POSTER;
const lastUpdatedIso = "2026-04-10";

const agentOptions: readonly Omit<StartAgentOption, "description">[] = [
  {
    name: "Claude Code",
    href: "/for/claude-code",
    command: "npx -y skills add anycap-ai/anycap -a claude-code -y",
  },
  {
    name: "Cursor",
    href: "/for/cursor",
    command: "npx -y skills add anycap-ai/anycap -a cursor -y",
  },
  {
    name: "Codex",
    href: "/for/codex",
    command: "npx -y skills add anycap-ai/anycap -a codex -y",
  },
];

const universalSteps: readonly Omit<StartStep, "note">[] = [
  {
    title: "Ask your agent to get you started",
    code: "help me install AnyCap and generate a launch image",
  },
  {
    title: "Install the CLI",
    code: "curl -fsSL https://anycap.ai/install.sh | sh",
  },
  {
    title: "Log in once",
    code: "anycap login",
  },
];

const gapEntrances: readonly Omit<StartGapEntrance, "summary">[] = [
  {
    eyebrow: "Claude Code",
    title: "Add image generation to Claude Code",
    href: "/for/claude-code/image-generation",
  },
  {
    eyebrow: "Claude Code",
    title: "Add video generation to Claude Code",
    href: "/for/claude-code/video-generation",
  },
  {
    eyebrow: "Problem intent",
    title: "What agents still can't do",
    href: "/learn/what-agents-cant-do",
  },
  {
    eyebrow: "Capability hub",
    title: "Browse any capability",
    href: "/capabilities",
  },
];

const contentByLocale: Partial<Record<SiteLocale, StartPageContent>> = {
  en: {
    metadata: {
      title: "Get Started with AnyCap — Install CLI, Auth & First Command",
      description:
        "Install AnyCap in minutes: add the agent skill, install the CLI, log in once, and run your first image or video command in Claude Code, Cursor, or Codex without switching agents.",
      openGraphTitle: "Get Started with AnyCap — Install CLI, Auth & First Command",
      openGraphDescription:
        "Pick your agent, install one skill and one CLI, then add image, video, and vision capabilities through a single command surface.",
      pageName: "Get started with AnyCap",
      pageDescription:
        "Quick start page for installing AnyCap by asking your agent in natural language and choosing the right onboarding path for Claude Code, Cursor, or Codex.",
    },
    breadcrumbItems: [
      { name: "Home", href: "/" },
      { name: "Get Started", href: START_PATH },
    ],
    hero: {
      eyebrow: "Start",
      titleLine1: "Don't switch agents.",
      titleLine2: "Add capabilities immediately.",
      intro:
        "AnyCap is the fastest path from a capable coding agent to a capable multimodal agent. Pick the agent you already use, then tell it what you want in natural language. It can install one skill and one CLI for you, then add image generation, video generation, image understanding, and video analysis through the same command surface.",
      lastUpdatedLabel: "Last updated April 10, 2026",
      naturalLanguageEyebrow: "Natural language first",
      naturalLanguageLead: "Just say what you want, like",
      naturalLanguageNote:
        "The smoother path is to ask in plain language and let the agent carry the setup, login, and capability call from there.",
    },
    video: {
      sectionEyebrow: "Watch",
      title: "See the natural-language workflow in motion",
      description:
        "A short brand video for the start page. It pairs the 'don't switch agents' message with the idea that you can start by describing what you need in natural language.",
      alt: "A short brand video showing the AnyCap start page and natural-language setup path.",
    },
    overviewTitle: "Why this page exists",
    overviewParagraphs: [
      "The start page is designed for the shortest route from intent to working capability. Instead of asking the user to study the whole product structure first, it gives them a natural-language starting point, a simple install path, and clear follow-on pages for the most common gaps.",
      "That makes this page useful both for first-time operators and for teams sending someone else a clean onboarding link. The goal is not only to explain AnyCap. It is to reduce the friction between the first question and the first successful capability call.",
    ],
    sectionTitles: {
      agents: "Pick your agent",
      naturalLanguageStartPath: "Natural-language start path",
      gapEntrances: "Start from the gap you need to close",
      watch: "See the natural-language workflow in motion",
    },
    cardEyebrow: "Agent path",
    agentOptions: agentOptions.map((option) => ({
      ...option,
      description:
        option.name === "Claude Code"
          ? "Best first path if you want the strongest install intent page and the deepest capability onboarding."
          : option.name === "Cursor"
            ? "Use this if your agent workflows already live in Cursor and you want the same capability layer there."
            : "Good fit when you want to add image, video, and vision capabilities to Codex without wiring provider SDKs.",
    })),
    universalSteps: universalSteps.map((step) => ({
      ...step,
      note:
        step.title === "Ask your agent to get you started"
          ? "Claude Code, Cursor, or Codex can take a plain-language request and turn it into the setup flow for you."
          : step.title === "Install the CLI"
            ? "Or install via npm if you prefer a package manager path."
            : "Authentication happens once and carries across every capability, so you can keep asking in natural language after setup.",
    })),
    gapEntrances: gapEntrances.map((entry) => ({
      ...entry,
      summary:
        entry.title === "Add image generation to Claude Code"
          ? "Best next page if the gap is visuals, mockups, or creative assets."
          : entry.title === "Add video generation to Claude Code"
            ? "Best next page if the gap is demos, walkthroughs, or social clips."
            : entry.title === "What agents still can't do"
              ? "Use this when you want the deficiency narrative and the right landing page for each missing capability."
              : "Use this when you already know you want image, video, or vision APIs for your agent.",
    })),
    ctas: {
      startWithClaudeCode: "Start with Claude Code",
      universalInstallGuide: "Universal install guide",
      seeCapabilityGaps: "See capability gaps",
      installAnycap: "Install AnyCap",
      viewCapabilities: "View capabilities",
      forClaudeCode: "For Claude Code",
    },
    pageJsonLd: createTechArticleJsonLd({
      headline: "Get started with AnyCap, Don't switch agents, add capabilities immediately",
      description:
        "Quick start page for installing AnyCap by asking your agent in natural language and choosing the right onboarding path for Claude Code, Cursor, or Codex.",
      path: START_PATH,
      about: ["AnyCap CLI", "AI agents", "Claude Code", "Cursor", "Codex"],
      keywords: [
        "get started with anycap",
        "install anycap",
        "add capabilities to claude code",
        "cursor tools",
        "codex tools",
      ],
      dateModified: lastUpdatedIso,
    }),
    videoJsonLd: {
      "@context": "https://schema.org",
      "@type": "VideoObject",
      name: "Get started with AnyCap",
      description:
        "A 25-second brand video for the start page, showing AnyCap's 'don't switch agents' positioning and the idea that you can get started by asking in natural language.",
      contentUrl: START_VIDEO_SRC,
      uploadDate: lastUpdatedIso,
      duration: "PT25S",
      thumbnailUrl: START_VIDEO_THUMBNAIL_URL,
    },
  },
  "pt-br": {
    metadata: {
      title: "Comece com o AnyCap — Não troque de agente, adicione capacidades na hora",
      description:
        "Comece com o AnyCap em minutos. Escolha Claude Code, Cursor ou Codex e peça em linguagem natural para instalar um skill e um CLI e adicionar capacidades de imagem, vídeo e visão sem trocar de agente.",
      openGraphTitle: "Comece com o AnyCap — Não troque de agente, adicione capacidades na hora",
      openGraphDescription:
        "Escolha seu agente, peça em linguagem natural e adicione capacidades de imagem, vídeo e visão por meio de um único CLI.",
      pageName: "Comece com o AnyCap",
      pageDescription:
        "Página de início rápido para instalar o AnyCap pedindo ao seu agente em linguagem natural e escolhendo o caminho certo de onboarding para Claude Code, Cursor ou Codex.",
    },
    breadcrumbItems: [
      { name: "Início", href: "/" },
      { name: "Comece", href: START_PATH },
    ],
    hero: {
      eyebrow: "Início",
      titleLine1: "Não troque de agente.",
      titleLine2: "Adicione capacidades na hora.",
      intro:
        "O AnyCap é o caminho mais rápido de um agente de código capaz para um agente multimodal capaz. Escolha o agente que você já usa e diga em linguagem natural o que você quer. Ele pode instalar um skill e um CLI para você e depois adicionar geração de imagem, geração de vídeo, entendimento de imagem e análise de vídeo pelo mesmo ponto de comando.",
      lastUpdatedLabel: "Atualizado em 10 de abril de 2026",
      naturalLanguageEyebrow: "Linguagem natural primeiro",
      naturalLanguageLead: "Basta dizer o que você quer, como",
      naturalLanguageNote:
        "O caminho mais fluido é pedir em linguagem simples e deixar o agente cuidar da instalação, do login e da chamada de capacidade.",
    },
    video: {
      sectionEyebrow: "Assistir",
      title: "Veja o fluxo em linguagem natural em movimento",
      description:
        "Um vídeo curto da marca para a página inicial. Ele combina a mensagem de não trocar de agente com a ideia de começar descrevendo o que você precisa em linguagem natural.",
      alt: "Vídeo curto mostrando a página inicial do AnyCap e o caminho de configuração em linguagem natural.",
    },
    overviewTitle: "Por que esta página existe",
    overviewParagraphs: [
      "A página de início foi desenhada para o caminho mais curto entre intenção e capacidade funcionando. Em vez de pedir que a pessoa estude toda a estrutura do produto primeiro, ela oferece um ponto de partida em linguagem natural, um caminho simples de instalação e páginas seguintes para as lacunas mais comuns.",
      "Isso torna a página útil tanto para quem está começando quanto para equipes que querem enviar um link de onboarding mais limpo para outra pessoa. O objetivo não é apenas explicar o AnyCap. É reduzir o atrito entre a primeira pergunta e a primeira chamada de capacidade com sucesso.",
    ],
    sectionTitles: {
      agents: "Escolha seu agente",
      naturalLanguageStartPath: "Caminho de início em linguagem natural",
      gapEntrances: "Comece pela lacuna que você quer fechar",
      watch: "Veja o fluxo em linguagem natural em movimento",
    },
    cardEyebrow: "Caminho do agente",
    agentOptions: agentOptions.map((option) => ({
      ...option,
      description:
        option.name === "Claude Code"
          ? "Melhor caminho inicial se você quer a página de instalação mais forte e o onboarding de capacidades mais profundo."
          : option.name === "Cursor"
            ? "Use este caminho se seus fluxos de agente já vivem no Cursor e você quer a mesma camada de capacidades lá."
            : "Boa opção quando você quer adicionar capacidades de imagem, vídeo e visão ao Codex sem conectar SDKs de provedor.",
    })),
    universalSteps: universalSteps.map((step) => ({
      ...step,
      title:
        step.title === "Ask your agent to get you started"
          ? "Peça ao seu agente para começar"
          : step.title === "Install the CLI"
            ? "Instale o CLI"
            : "Faça login uma vez",
      note:
        step.title === "Ask your agent to get you started"
          ? "Claude Code, Cursor ou Codex podem receber um pedido em linguagem simples e transformá-lo no fluxo de configuração."
          : step.title === "Install the CLI"
            ? "Ou instale via npm se você preferir o caminho por gerenciador de pacotes."
            : "A autenticação acontece uma vez e vale para todas as capacidades, então você pode continuar pedindo em linguagem natural depois da configuração.",
    })),
    gapEntrances: gapEntrances.map((entry) => ({
      ...entry,
      eyebrow:
        entry.eyebrow === "Claude Code"
          ? "Claude Code"
          : entry.eyebrow === "Problem intent"
            ? "Intenção do problema"
            : "Hub de capacidades",
      title:
        entry.title === "Add image generation to Claude Code"
          ? "Adicionar geração de imagem ao Claude Code"
          : entry.title === "Add video generation to Claude Code"
            ? "Adicionar geração de vídeo ao Claude Code"
            : entry.title === "What agents still can't do"
              ? "O que os agentes ainda não conseguem fazer"
              : "Explorar qualquer capacidade",
      summary:
        entry.title === "Add image generation to Claude Code"
          ? "Melhor próxima página se a lacuna for visual, mockup ou material criativo."
          : entry.title === "Add video generation to Claude Code"
            ? "Melhor próxima página se a lacuna for demo, walkthrough ou clipe social."
            : entry.title === "What agents still can't do"
              ? "Use esta página quando quiser a narrativa de lacunas e a landing page certa para cada capacidade ausente."
              : "Use esta página quando você já sabe que quer APIs de imagem, vídeo ou visão para o seu agente.",
    })),
    ctas: {
      startWithClaudeCode: "Começar com Claude Code",
      universalInstallGuide: "Guia de instalação universal",
      seeCapabilityGaps: "Ver lacunas de capacidade",
      installAnycap: "Instalar AnyCap",
      viewCapabilities: "Ver capacidades",
      forClaudeCode: "Para Claude Code",
    },
    pageJsonLd: createTechArticleJsonLd({
      headline: "Comece com o AnyCap — Não troque de agente, adicione capacidades na hora",
      description:
        "Página de início rápido para instalar o AnyCap pedindo ao seu agente em linguagem natural e escolhendo o caminho certo de onboarding para Claude Code, Cursor ou Codex.",
      path: START_PATH,
      about: ["AnyCap CLI", "agentes de IA", "Claude Code", "Cursor", "Codex"],
      keywords: [
        "comece com anycap",
        "instalar anycap",
        "adicionar capacidades ao claude code",
        "ferramentas do cursor",
        "ferramentas do codex",
      ],
      dateModified: lastUpdatedIso,
    }),
    videoJsonLd: {
      "@context": "https://schema.org",
      "@type": "VideoObject",
      name: "Comece com o AnyCap",
      description:
        "Um vídeo de marca de 25 segundos para a página inicial, mostrando o posicionamento de 'não troque de agente' e a ideia de começar pedindo em linguagem natural.",
      contentUrl: START_VIDEO_SRC,
      uploadDate: lastUpdatedIso,
      duration: "PT25S",
      thumbnailUrl: START_VIDEO_THUMBNAIL_URL,
    },
  },
  id: {
    metadata: {
      title: "Mulai dengan AnyCap — Jangan ganti agen, tambahkan kemampuan sekarang",
      description:
        "Mulai dengan AnyCap dalam hitungan menit. Pilih Claude Code, Cursor, atau Codex, lalu minta dengan bahasa alami untuk memasang satu skill dan satu CLI serta menambahkan kemampuan gambar, video, dan penglihatan tanpa mengganti agen.",
      openGraphTitle: "Mulai dengan AnyCap — Jangan ganti agen, tambahkan kemampuan sekarang",
      openGraphDescription:
        "Pilih agen Anda, minta dengan bahasa alami, lalu tambahkan kemampuan gambar, video, dan penglihatan melalui satu CLI.",
      pageName: "Mulai dengan AnyCap",
      pageDescription:
        "Halaman mulai cepat untuk memasang AnyCap dengan meminta agen Anda dalam bahasa alami dan memilih jalur onboarding yang tepat untuk Claude Code, Cursor, atau Codex.",
    },
    breadcrumbItems: [
      { name: "Home", href: "/" },
      { name: "Mulai", href: START_PATH },
    ],
    hero: {
      eyebrow: "Mulai",
      titleLine1: "Jangan ganti agen.",
      titleLine2: "Tambahkan kemampuan sekarang.",
      intro:
        "AnyCap adalah jalur tercepat dari agen coding yang sudah mampu menjadi agen multimodal yang mampu. Pilih agen yang sudah Anda pakai, lalu beri tahu apa yang Anda butuhkan dalam bahasa alami. Agen dapat memasang satu skill dan satu CLI untuk Anda, lalu menambahkan pembuatan gambar, pembuatan video, pemahaman gambar, dan analisis video melalui antarmuka perintah yang sama.",
      lastUpdatedLabel: "Terakhir diperbarui 10 April 2026",
      naturalLanguageEyebrow: "Bahasa alami dulu",
      naturalLanguageLead: "Cukup katakan apa yang Anda inginkan, misalnya",
      naturalLanguageNote:
        "Jalur yang paling mulus adalah meminta dengan bahasa sederhana dan membiarkan agen menangani setup, login, dan panggilan kemampuan dari sana.",
    },
    video: {
      sectionEyebrow: "Tonton",
      title: "Lihat alur kerja bahasa alami secara langsung",
      description:
        "Video singkat merek untuk halaman mulai. Video ini menggabungkan pesan 'jangan ganti agen' dengan gagasan bahwa Anda bisa mulai dengan menjelaskan apa yang Anda butuhkan dalam bahasa alami.",
      alt: "Video singkat yang menampilkan halaman mulai AnyCap dan jalur setup bahasa alami.",
    },
    overviewTitle: "Mengapa halaman ini ada",
    overviewParagraphs: [
      "Halaman mulai dirancang untuk jalur tercepat dari niat ke kemampuan yang benar-benar berjalan. Alih-alih meminta pengguna mempelajari seluruh struktur produk terlebih dahulu, halaman ini memberi titik awal bahasa alami, jalur instalasi yang sederhana, dan halaman lanjutan yang jelas untuk celah yang paling umum.",
      "Itu membuat halaman ini berguna baik untuk operator baru maupun untuk tim yang ingin mengirim tautan onboarding yang rapi kepada orang lain. Tujuannya bukan hanya menjelaskan AnyCap, tetapi juga mengurangi gesekan antara pertanyaan pertama dan panggilan kemampuan pertama yang berhasil.",
    ],
    sectionTitles: {
      agents: "Pilih agen Anda",
      naturalLanguageStartPath: "Jalur awal bahasa alami",
      gapEntrances: "Mulai dari celah yang perlu Anda tutup",
      watch: "Lihat alur bahasa alami secara langsung",
    },
    cardEyebrow: "Jalur agen",
    agentOptions: agentOptions.map((option) => ({
      ...option,
      description:
        option.name === "Claude Code"
          ? "Jalur awal terbaik jika Anda ingin halaman instalasi yang paling kuat dan onboarding kemampuan yang paling dalam."
          : option.name === "Cursor"
            ? "Gunakan ini jika alur kerja agen Anda sudah berada di Cursor dan Anda ingin lapisan kemampuan yang sama di sana."
            : "Cocok saat Anda ingin menambahkan kemampuan gambar, video, dan penglihatan ke Codex tanpa menghubungkan SDK penyedia secara manual.",
    })),
    universalSteps: universalSteps.map((step) => ({
      ...step,
      title:
        step.title === "Ask your agent to get you started"
          ? "Minta agen Anda untuk memulai"
          : step.title === "Install the CLI"
            ? "Pasang CLI"
            : "Masuk sekali",
      note:
        step.title === "Ask your agent to get you started"
          ? "Claude Code, Cursor, atau Codex dapat menerima permintaan bahasa sederhana dan mengubahnya menjadi alur setup untuk Anda."
          : step.title === "Install the CLI"
            ? "Atau pasang lewat npm jika Anda lebih suka jalur manajer paket."
            : "Autentikasi hanya dilakukan sekali dan berlaku untuk semua kemampuan, jadi Anda bisa terus bertanya dalam bahasa alami setelah setup.",
    })),
    gapEntrances: gapEntrances.map((entry) => ({
      ...entry,
      eyebrow:
        entry.eyebrow === "Claude Code"
          ? "Claude Code"
          : entry.eyebrow === "Problem intent"
            ? "Intensi masalah"
            : "Hub kemampuan",
      title:
        entry.title === "Add image generation to Claude Code"
          ? "Tambahkan pembuatan gambar ke Claude Code"
          : entry.title === "Add video generation to Claude Code"
            ? "Tambahkan pembuatan video ke Claude Code"
            : entry.title === "What agents still can't do"
              ? "Apa yang masih belum bisa dilakukan agen"
              : "Jelajahi kemampuan apa pun",
      summary:
        entry.title === "Add image generation to Claude Code"
          ? "Halaman berikutnya terbaik jika celahnya adalah visual, mockup, atau aset kreatif."
          : entry.title === "Add video generation to Claude Code"
            ? "Halaman berikutnya terbaik jika celahnya adalah demo, walkthrough, atau klip sosial."
            : entry.title === "What agents still can't do"
              ? "Gunakan ini saat Anda ingin narasi kekurangan dan landing page yang tepat untuk setiap kemampuan yang hilang."
              : "Gunakan ini saat Anda sudah tahu ingin API gambar, video, atau penglihatan untuk agen Anda.",
    })),
    ctas: {
      startWithClaudeCode: "Mulai dengan Claude Code",
      universalInstallGuide: "Panduan instalasi universal",
      seeCapabilityGaps: "Lihat celah kemampuan",
      installAnycap: "Pasang AnyCap",
      viewCapabilities: "Lihat kemampuan",
      forClaudeCode: "Untuk Claude Code",
    },
    pageJsonLd: createTechArticleJsonLd({
      headline: "Mulai dengan AnyCap — Jangan ganti agen, tambahkan kemampuan sekarang",
      description:
        "Halaman mulai cepat untuk memasang AnyCap dengan meminta agen Anda dalam bahasa alami dan memilih jalur onboarding yang tepat untuk Claude Code, Cursor, atau Codex.",
      path: START_PATH,
      about: ["AnyCap CLI", "agen AI", "Claude Code", "Cursor", "Codex"],
      keywords: [
        "mulai dengan anycap",
        "pasang anycap",
        "tambahkan kemampuan ke claude code",
        "alat cursor",
        "alat codex",
      ],
      dateModified: lastUpdatedIso,
    }),
    videoJsonLd: {
      "@context": "https://schema.org",
      "@type": "VideoObject",
      name: "Mulai dengan AnyCap",
      description:
        "Video merek berdurasi 25 detik untuk halaman mulai, menampilkan posisi 'jangan ganti agen' dan gagasan bahwa Anda bisa mulai dengan meminta dalam bahasa alami.",
      contentUrl: START_VIDEO_SRC,
      uploadDate: lastUpdatedIso,
      duration: "PT25S",
      thumbnailUrl: START_VIDEO_THUMBNAIL_URL,
    },
  },
  de: {
    metadata: {
      title: "Einstieg mit AnyCap — Agenten nicht wechseln, Fähigkeiten sofort hinzufügen",
      description:
        "Starte mit AnyCap in Minuten. Wähle Claude Code, Cursor oder Codex und bitte in natürlicher Sprache, ein Skill und eine CLI zu installieren und Bild-, Video- und Vision-Fähigkeiten hinzuzufügen — ohne den Agenten zu wechseln.",
      openGraphTitle: "Einstieg mit AnyCap — Agenten nicht wechseln, Fähigkeiten sofort hinzufügen",
      openGraphDescription:
        "Wähle deinen Agenten, bitte in natürlicher Sprache und füge Bild-, Video- und Vision-Fähigkeiten über eine CLI hinzu.",
      pageName: "Einstieg mit AnyCap",
      pageDescription:
        "Schnellstart-Seite für die AnyCap-Installation: deinen Agenten in natürlicher Sprache bitten und den richtigen Onboarding-Pfad für Claude Code, Cursor oder Codex wählen.",
    },
    breadcrumbItems: [
      { name: "Startseite", href: "/" },
      { name: "Einstieg", href: START_PATH },
    ],
    hero: {
      eyebrow: "Einstieg",
      titleLine1: "Den Agenten nicht wechseln.",
      titleLine2: "Fähigkeiten sofort hinzufügen.",
      intro:
        "AnyCap ist der schnellste Weg von einem leistungsfähigen Coding-Agenten zu einem leistungsfähigen multimodalen Agenten. Wähle den Agenten, den du bereits nutzt, und sage in natürlicher Sprache, was du möchtest. Er kann für dich ein Skill und eine CLI installieren und danach Bildgenerierung, Videogenerierung, Bildverständnis und Videoanalyse über dieselbe Befehlsoberfläche hinzufügen.",
      lastUpdatedLabel: "Zuletzt aktualisiert am 10. April 2026",
      naturalLanguageEyebrow: "Natürliche Sprache zuerst",
      naturalLanguageLead: "Sag einfach, was du möchtest, z. B.",
      naturalLanguageNote:
        "Der einfachste Weg ist, in einfacher Sprache zu fragen und den Agenten Setup, Login und Capability-Aufruf von dort übernehmen zu lassen.",
    },
    video: {
      sectionEyebrow: "Ansehen",
      title: "Den natürlichsprachigen Workflow in Aktion sehen",
      description:
        "Ein kurzes Markenvideo für die Start-Seite. Es verbindet die Botschaft 'Agenten nicht wechseln' mit dem Gedanken, mit einer natürlichsprachigen Beschreibung zu beginnen.",
      alt: "Kurzes Markenvideo, das die AnyCap-Startseite und den natürlichsprachigen Setup-Pfad zeigt.",
    },
    overviewTitle: "Warum diese Seite existiert",
    overviewParagraphs: [
      "Die Start-Seite ist für den kürzesten Weg von der Absicht zur funktionierenden Fähigkeit konzipiert. Anstatt den Nutzer zuerst die gesamte Produktstruktur studieren zu lassen, bietet sie einen natürlichsprachigen Ausgangspunkt, einen einfachen Installationspfad und klare Folgeseiten für die häufigsten Lücken.",
      "Das macht die Seite sowohl für Erstanwender als auch für Teams nützlich, die anderen einen sauberen Onboarding-Link schicken möchten. Das Ziel ist nicht nur, AnyCap zu erklären — es ist, die Reibung zwischen der ersten Frage und dem ersten erfolgreichen Capability-Aufruf zu reduzieren.",
    ],
    sectionTitles: {
      agents: "Agenten wählen",
      naturalLanguageStartPath: "Natürlichsprachiger Startpfad",
      gapEntrances: "Von der Lücke starten, die du schließen musst",
      watch: "Den natürlichsprachigen Workflow in Aktion sehen",
    },
    cardEyebrow: "Agentenpfad",
    agentOptions: agentOptions.map((option) => ({
      ...option,
      description:
        option.name === "Claude Code"
          ? "Bester erster Pfad, wenn du die stärkste Install-Intent-Seite und das tiefste Capability-Onboarding möchtest."
          : option.name === "Cursor"
            ? "Nutze diesen Pfad, wenn deine Agenten-Workflows bereits in Cursor laufen und du dieselbe Capability-Schicht dort möchtest."
            : "Gut geeignet, wenn du Bild-, Video- und Vision-Fähigkeiten zu Codex hinzufügen möchtest, ohne Provider-SDKs zu integrieren.",
    })),
    universalSteps: universalSteps.map((step) => ({
      ...step,
      title:
        step.title === "Ask your agent to get you started"
          ? "Agent bitten, loszulegen"
          : step.title === "Install the CLI"
            ? "CLI installieren"
            : "Einmal einloggen",
      note:
        step.title === "Ask your agent to get you started"
          ? "Claude Code, Cursor oder Codex können eine einfachsprachige Anfrage in den Setup-Flow umwandeln."
          : step.title === "Install the CLI"
            ? "Oder per npm installieren, wenn du den Paketmanager-Pfad bevorzugst."
            : "Die Authentifizierung erfolgt einmal und gilt für alle Fähigkeiten, sodass du nach dem Setup weiter in natürlicher Sprache fragen kannst.",
    })),
    gapEntrances: gapEntrances.map((entry) => ({
      ...entry,
      eyebrow:
        entry.eyebrow === "Claude Code"
          ? "Claude Code"
          : entry.eyebrow === "Problem intent"
            ? "Problemabsicht"
            : "Fähigkeiten-Hub",
      title:
        entry.title === "Add image generation to Claude Code"
          ? "Bildgenerierung zu Claude Code hinzufügen"
          : entry.title === "Add video generation to Claude Code"
            ? "Videogenerierung zu Claude Code hinzufügen"
            : entry.title === "What agents still can't do"
              ? "Was Agenten noch nicht können"
              : "Beliebige Fähigkeit erkunden",
      summary:
        entry.title === "Add image generation to Claude Code"
          ? "Beste nächste Seite, wenn die Lücke Visuals, Mockups oder kreative Assets betrifft."
          : entry.title === "Add video generation to Claude Code"
            ? "Beste nächste Seite, wenn die Lücke Demos, Walkthroughs oder Social-Clips betrifft."
            : entry.title === "What agents still can't do"
              ? "Nutze dies, wenn du die Defizit-Narration und die richtige Landing Page für jede fehlende Fähigkeit möchtest."
              : "Nutze dies, wenn du bereits weißt, dass du Bild-, Video- oder Vision-APIs für deinen Agenten möchtest.",
    })),
    ctas: {
      startWithClaudeCode: "Mit Claude Code starten",
      universalInstallGuide: "Universeller Installationsleitfaden",
      seeCapabilityGaps: "Fähigkeitslücken ansehen",
      installAnycap: "AnyCap installieren",
      viewCapabilities: "Fähigkeiten ansehen",
      forClaudeCode: "Für Claude Code",
    },
    pageJsonLd: createTechArticleJsonLd({
      headline: "Einstieg mit AnyCap — Agenten nicht wechseln, Fähigkeiten sofort hinzufügen",
      description:
        "Schnellstart-Seite für die AnyCap-Installation: deinen Agenten in natürlicher Sprache bitten und den richtigen Onboarding-Pfad für Claude Code, Cursor oder Codex wählen.",
      path: START_PATH,
      about: ["AnyCap CLI", "KI-Agenten", "Claude Code", "Cursor", "Codex"],
      keywords: [
        "anycap starten",
        "anycap installieren",
        "fähigkeiten zu claude code hinzufügen",
        "cursor tools",
        "codex tools",
      ],
      dateModified: lastUpdatedIso,
    }),
    videoJsonLd: {
      "@context": "https://schema.org",
      "@type": "VideoObject",
      name: "Einstieg mit AnyCap",
      description:
        "Ein 25-sekündiges Markenvideo für die Start-Seite, das AnyCap's 'Agenten nicht wechseln'-Positionierung und die Idee zeigt, mit einer natürlichsprachigen Anfrage zu beginnen.",
      contentUrl: START_VIDEO_SRC,
      uploadDate: lastUpdatedIso,
      duration: "PT25S",
      thumbnailUrl: START_VIDEO_THUMBNAIL_URL,
    },
  },
};

export function getStartMetadata(locale: SiteLocale): Metadata {
  const content = contentByLocale[locale] ?? contentByLocale.en!;

  return {
    title: content.metadata.title,
    description: content.metadata.description,
    alternates: { canonical: START_PATH },
    openGraph: {
      type: "website",
      locale: getLocaleConfig(locale).ogLocale,
      url: getLocalizedRouteUrl(locale, START_PATH),
      siteName: siteConfig.siteName,
      title: content.metadata.openGraphTitle,
      description: content.metadata.openGraphDescription,
    },
  };
}

export function getStartPageData(locale: SiteLocale) {
  return contentByLocale[locale] ?? contentByLocale.en!;
}
