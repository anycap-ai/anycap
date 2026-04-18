import type { Metadata } from "next";
import { getLocaleConfig, siteConfig, type SiteLocale } from "@/lib/site";

export const CONTEXT_ENGINEERING_FOR_AGENTS_PATH = "/guides/context-engineering-for-agents";

type ContextEngineeringForAgentsPageData = {
  metadata: {
    title: string;
    description: string;
    openGraphTitle: string;
    openGraphDescription: string;
  };
  breadcrumbItems: readonly { name: string; href?: string; unlinkable?: boolean }[];
  eyebrow: string;
  heroTitle: string;
  heroIntro: string;
  pillarsTitle: string;
  pillars: readonly { title: string; body: string }[];
  whyItMattersTitle: string;
  whyItMatters: readonly string[];
  patternTitle: string;
  patternSteps: readonly string[];
  cta: readonly { label: string; href: string }[];
};

const en: ContextEngineeringForAgentsPageData = {
  metadata: {
    title: "Context engineering for agents — How capability calls are decided",
    description:
      "Context engineering shapes what an AI agent sees, remembers, and decides to do. Learn how it affects capability calls, multimodal workflows, and why AnyCap fits as the runtime layer for agent execution.",
    openGraphTitle: "Context engineering for agents — How capability calls are decided",
    openGraphDescription:
      "Learn how context engineering affects capability calls, multimodal workflows, and why AnyCap fits as the runtime layer for agent execution.",
  },
  breadcrumbItems: [
    { name: "Home", href: "/" },
    { name: "Guides", href: "/guides", unlinkable: true },
    { name: "Context Engineering for Agents" },
  ],
  eyebrow: "Guide",
  heroTitle: "Context engineering for agents",
  heroIntro:
    "Context engineering is the practice of shaping what an AI agent can see, what it can trust, and what it should do next during a live task. It is not only prompt wording. The agent also depends on workspace state, tool definitions, capability availability, previous steps, permission boundaries, and runtime policies that control execution. Those inputs determine whether the agent should keep reasoning in text, ask for missing data, or call a concrete capability at the right moment. In multimodal workflows, this decision quality matters more than style. A strong model can still fail if context is noisy, incomplete, or contradictory. Good context engineering keeps decision signals explicit so the agent can move from intent to action through a stable runtime such as AnyCap. When teams formalize this layer, they usually see fewer retries, cleaner tool selection, and faster completion on complex cross-modal tasks.",
  pillarsTitle: "The three practical layers",
  pillars: [
    {
      title: "What the agent can see",
      body: "The system prompt, workspace files, prior messages, tool definitions, and execution constraints all shape the action space.",
    },
    {
      title: "What the agent can do",
      body: "Capabilities are only useful when they are exposed in a way the agent can discover and trust during execution.",
    },
    {
      title: "When the agent should switch from text to action",
      body: "Good context engineering helps the agent decide when reasoning is enough and when it should call image generation, video analysis, or another capability.",
    },
  ],
  whyItMattersTitle: "Why it matters for multimodal agents",
  whyItMatters: [
    "A multimodal agent does not only need a good prompt. It needs enough context to decide when visual inspection is necessary, when generation is required, and when text reasoning is sufficient. Without that decision context, the agent either over-calls tools and wastes budget, or stays in text too long and misses the action needed to complete the task. The quality of outputs depends on this routing step.",
    "This is where AnyCap fits in practice. Instead of exposing many unrelated APIs with different credentials and response shapes, a capability runtime gives the agent one execution surface for image generation, video generation, image understanding, and video analysis. With a consistent runtime and clearer context signals, the agent can choose the right capability faster and produce workflows that are easier for teams to debug and repeat.",
  ],
  patternTitle: "A simple decision pattern",
  patternSteps: [
    "Need text only? stay in prompt",
    "Need a new image? anycap image generate",
    "Need to inspect a screenshot? anycap image read",
    "Need to review a recording? anycap video read",
  ],
  cta: [
    { label: "Capability Runtime", href: "/glossary/agent-capability-runtime" },
    { label: "Image Generation", href: "/capabilities/image-generation" },
    { label: "Video Analysis", href: "/capabilities/video-analysis" },
  ],
};

const ptBr: ContextEngineeringForAgentsPageData = {
  metadata: {
    title: "Engenharia de contexto para agentes — Como as chamadas de capacidade são decididas",
    description:
      "A engenharia de contexto molda o que um agente de IA vê, lembra e decide fazer. Entenda como ela afeta chamadas de capacidade, fluxos multimodais e por que o AnyCap funciona como a camada de runtime para execução de agentes.",
    openGraphTitle: "Engenharia de contexto para agentes — Como as chamadas de capacidade são decididas",
    openGraphDescription:
      "Entenda como a engenharia de contexto afeta chamadas de capacidade, fluxos multimodais e por que o AnyCap funciona como a camada de runtime para execução de agentes.",
  },
  breadcrumbItems: [
    { name: "Início", href: "/" },
    { name: "Guias", href: "/guides", unlinkable: true },
    { name: "Engenharia de Contexto para Agentes" },
  ],
  eyebrow: "Guia",
  heroTitle: "Engenharia de contexto para agentes",
  heroIntro:
    "Engenharia de contexto é a prática de moldar o que um agente de IA consegue ver, no que ele pode confiar e qual ação deve tomar em cada etapa da execução. Isso vai além do texto do prompt. O agente também depende do estado do workspace, das definições de ferramenta, da disponibilidade de capacidades, dos passos anteriores, dos limites de permissão e das regras de runtime. Esses sinais determinam se ele deve continuar raciocinando em texto, pedir dados adicionais ou chamar uma capacidade no momento certo. Em fluxos multimodais, esse ponto decide qualidade e custo. Um modelo forte ainda falha quando o contexto está ruidoso ou incompleto. Boa engenharia de contexto mantém os sinais claros para transformar intenção em execução estável com um runtime como o AnyCap.",
  pillarsTitle: "As três camadas práticas",
  pillars: [
    {
      title: "O que o agente consegue ver",
      body: "O system prompt, os arquivos do workspace, as mensagens anteriores, as definições de ferramenta e as restrições de execução moldam o espaço de ação.",
    },
    {
      title: "O que o agente consegue fazer",
      body: "Capacidades só são úteis quando são expostas de um jeito que o agente consiga descobrir e confiar durante a execução.",
    },
    {
      title: "Quando o agente deve sair do texto para a ação",
      body: "Boa engenharia de contexto ajuda o agente a decidir quando raciocinar basta e quando ele deve chamar geração de imagem, análise de vídeo ou outra capacidade.",
    },
  ],
  whyItMattersTitle: "Por que isso importa para agentes multimodais",
  whyItMatters: [
    "Um agente multimodal não precisa só de um bom prompt. Ele precisa de contexto suficiente para decidir quando deve inspecionar uma imagem, quando precisa gerar um mockup, quando um vídeo deve ser analisado e quando basta continuar no texto. Sem esse contexto de decisão, o agente pode chamar ferramentas demais e aumentar custo, ou ficar tempo demais no texto e não concluir o trabalho.",
    "É aqui que o AnyCap entra na operação real. Em vez de expor várias APIs isoladas, com credenciais e formatos diferentes, um runtime de capacidades oferece uma superfície única para geração de imagem, geração de vídeo, entendimento de imagem e análise de vídeo. Com runtime consistente e sinais de contexto melhores, o agente escolhe a ação certa com mais previsibilidade e o time consegue reproduzir e depurar o fluxo com menos fricção.",
  ],
  patternTitle: "Um padrão simples de decisão",
  patternSteps: [
    "Precisa só de texto? continue no prompt",
    "Precisa de uma imagem nova? anycap image generate",
    "Precisa inspecionar uma captura de tela? anycap image read",
    "Precisa revisar uma gravação? anycap video read",
  ],
  cta: [
    { label: "Runtime de capacidade", href: "/glossary/agent-capability-runtime" },
    { label: "Geração de imagem", href: "/capabilities/image-generation" },
    { label: "Análise de vídeo", href: "/capabilities/video-analysis" },
  ],
};

const contentByLocale: Record<SiteLocale, ContextEngineeringForAgentsPageData> = {
  en,
  "pt-br": ptBr,
  id: {
    metadata: {
      title: "Rekayasa konteks untuk agen — Bagaimana panggilan kapabilitas ditentukan",
      description:
        "Rekayasa konteks membentuk apa yang dilihat agen AI, apa yang diingat, dan apa yang diputuskan untuk dilakukan. Pelajari bagaimana hal ini memengaruhi panggilan kapabilitas, workflow multimodal, dan mengapa AnyCap cocok sebagai layer runtime untuk eksekusi agen.",
      openGraphTitle: "Rekayasa konteks untuk agen — Bagaimana panggilan kapabilitas ditentukan",
      openGraphDescription:
        "Pelajari bagaimana rekayasa konteks memengaruhi panggilan kapabilitas, workflow multimodal, dan mengapa AnyCap cocok sebagai layer runtime untuk eksekusi agen.",
    },
    breadcrumbItems: [
      { name: "Beranda", href: "/" },
      { name: "Panduan", href: "/guides", unlinkable: true },
      { name: "Rekayasa Konteks untuk Agen" },
    ],
    eyebrow: "Panduan",
    heroTitle: "Rekayasa konteks untuk agen",
    heroIntro:
      "Rekayasa konteks adalah praktik membentuk apa yang bisa dilihat agen AI, sinyal mana yang harus dipercaya, dan aksi apa yang harus diambil pada setiap langkah eksekusi. Ini bukan cuma soal kalimat prompt. Agen juga bergantung pada status workspace, definisi tool, ketersediaan kapabilitas, langkah sebelumnya, batas izin, dan aturan runtime yang mengontrol eksekusi. Dari sinilah agen memutuskan apakah tetap bernalar di teks, meminta data tambahan, atau memanggil kapabilitas pada waktu yang tepat. Dalam workflow multimodal, kualitas keputusan ini menentukan hasil akhir. Model yang kuat tetap bisa gagal kalau konteks berantakan atau tidak lengkap. Rekayasa konteks yang baik menjaga sinyal tetap jelas agar intent bisa berubah menjadi eksekusi stabil lewat runtime seperti AnyCap.",
    pillarsTitle: "Tiga lapisan praktis",
    pillars: [
      {
        title: "Apa yang bisa dilihat agen",
        body: "System prompt, file workspace, pesan sebelumnya, definisi tool, dan batasan eksekusi semuanya membentuk ruang aksi.",
      },
      {
        title: "Apa yang bisa dilakukan agen",
        body: "Kapabilitas hanya berguna kalau disajikan dengan cara yang bisa ditemukan dan dipercaya agen saat eksekusi.",
      },
      {
        title: "Kapan agen harus berpindah dari teks ke aksi",
        body: "Rekayasa konteks yang baik membantu agen memutuskan kapan cukup berpikir dan kapan harus memanggil pembuatan gambar, analisis video, atau kapabilitas lain.",
      },
    ],
    whyItMattersTitle: "Mengapa ini penting untuk agen multimodal",
    whyItMatters: [
      "Agen multimodal bukan cuma butuh prompt yang bagus. Ia butuh konteks yang cukup untuk memutuskan kapan harus memeriksa gambar, kapan perlu membuat mockup, kapan video harus dianalisis, dan kapan cukup lanjut bernalar dalam teks. Tanpa konteks keputusan ini, agen bisa terlalu sering memanggil tool dan membuang biaya, atau terlalu lama di teks sehingga tugas tidak selesai.",
      "Di sinilah AnyCap menjadi penting untuk eksekusi nyata. Alih-alih memberi agen banyak API terpisah dengan kredensial dan format respons berbeda, runtime kapabilitas menyediakan satu surface untuk pembuatan gambar, pembuatan video, pemahaman gambar, dan analisis video. Dengan runtime yang konsisten dan sinyal konteks yang lebih jelas, agen memilih aksi yang tepat lebih cepat dan workflow menjadi lebih mudah diulang serta di-debug oleh tim.",
    ],
    patternTitle: "Pola keputusan sederhana",
    patternSteps: [
      "Hanya butuh teks? tetap di prompt",
      "Butuh gambar baru? anycap image generate",
      "Butuh memeriksa screenshot? anycap image read",
      "Butuh meninjau rekaman? anycap video read",
    ],
    cta: [
      { label: "Runtime Kapabilitas", href: "/glossary/agent-capability-runtime" },
      { label: "Pembuatan Gambar", href: "/capabilities/image-generation" },
      { label: "Analisis Video", href: "/capabilities/video-analysis" },
    ],
  },
  de: {
    metadata: {
      title: "Context Engineering für KI-Agenten — Wie Capability-Aufrufe entschieden werden",
      description:
        "Context Engineering bestimmt, was ein KI-Agent sieht, sich merkt und tut. Erfahren Sie, wie es Capability-Aufrufe und multimodale Workflows beeinflusst und warum AnyCap als Runtime-Schicht für die Agentenausführung passt.",
      openGraphTitle: "Context Engineering für KI-Agenten — Wie Capability-Aufrufe entschieden werden",
      openGraphDescription:
        "Erfahren Sie, wie Context Engineering Capability-Aufrufe und multimodale Workflows beeinflusst und warum AnyCap als Runtime-Schicht für die Agentenausführung passt.",
    },
    breadcrumbItems: [
      { name: "Startseite", href: "/" },
      { name: "Anleitungen", href: "/guides", unlinkable: true },
      { name: "Context Engineering für KI-Agenten" },
    ],
    eyebrow: "Anleitung",
    heroTitle: "Context Engineering für KI-Agenten",
    heroIntro:
      "Context Engineering ist die Praxis, zu gestalten, was ein KI-Agent sehen, was er vertrauen und was er als Nächstes tun soll, während eine Aufgabe live läuft. Es geht nicht nur um Prompt-Formulierungen. Der Agent hängt auch von Workspace-Status, Tool-Definitionen, Capability-Verfügbarkeit, vorherigen Schritten, Berechtigungsgrenzen und Runtime-Richtlinien ab, die die Ausführung steuern. Diese Eingaben bestimmen, ob der Agent weiter im Text reasonen, fehlende Daten anfordern oder im richtigen Moment eine konkrete Capability aufrufen soll. In multimodalen Workflows zählt diese Entscheidungsqualität mehr als der Stil. Ein starkes Modell kann scheitern, wenn der Kontext verrauscht, unvollständig oder widersprüchlich ist. Gutes Context Engineering hält Entscheidungssignale explizit, sodass der Agent über eine stabile Runtime wie AnyCap von Intent zu Action übergehen kann. Wenn Teams diese Schicht formalisieren, sehen sie meist weniger Retries, sauberere Tool-Auswahl und schnellere Fertigstellung bei komplexen cross-modalen Aufgaben.",
    pillarsTitle: "Die drei praktischen Schichten",
    pillars: [
      {
        title: "Was der Agent sehen kann",
        body: "System-Prompt, Workspace-Dateien, vorherige Nachrichten, Tool-Definitionen und Ausführungsbeschränkungen formen den Aktionsraum.",
      },
      {
        title: "Was der Agent tun kann",
        body: "Capabilities sind nur dann nützlich, wenn sie so verfügbar gemacht werden, dass der Agent sie während der Ausführung entdecken und ihnen vertrauen kann.",
      },
      {
        title: "Wann der Agent von Text zu Action wechseln soll",
        body: "Gutes Context Engineering hilft dem Agenten zu entscheiden, wann Reasoning ausreicht und wann er Bildgenerierung, Videoanalyse oder eine andere Capability aufrufen sollte.",
      },
    ],
    whyItMattersTitle: "Warum es für multimodale Agenten wichtig ist",
    whyItMatters: [
      "Ein multimodaler Agent braucht nicht nur einen guten Prompt. Er braucht genug Kontext, um zu entscheiden, wann visuelle Inspektion notwendig ist, wann Generierung erforderlich ist und wann Text-Reasoning ausreicht. Ohne diesen Entscheidungskontext ruft der Agent entweder zu oft Tools auf und verschwendet Budget, oder bleibt zu lange im Text und verpasst die nötige Action. Die Output-Qualität hängt von diesem Routing-Schritt ab.",
      "Genau hier passt AnyCap in der Praxis. Statt vieler unverbundener APIs mit unterschiedlichen Credentials und Response-Formaten gibt eine Capability-Runtime dem Agenten eine einheitliche Ausführungsoberfläche für Bildgenerierung, Videogenerierung, Bildverständnis und Videoanalyse. Mit konsistenter Runtime und klareren Kontextsignalen wählt der Agent die richtige Capability schneller aus und erzeugt Workflows, die für Teams leichter zu debuggen und zu wiederholen sind.",
    ],
    patternTitle: "Ein einfaches Entscheidungsmuster",
    patternSteps: [
      "Nur Text nötig? Bleiben Sie im Prompt",
      "Neues Bild nötig? anycap image generate",
      "Screenshot prüfen? anycap image read",
      "Aufnahme analysieren? anycap video read",
    ],
    cta: [
      { label: "Capability-Runtime", href: "/glossary/agent-capability-runtime" },
      { label: "Bildgenerierung", href: "/capabilities/image-generation" },
      { label: "Videoanalyse", href: "/capabilities/video-analysis" },
    ],
  },
};

export function getContextEngineeringForAgentsMetadata(locale: SiteLocale): Metadata {
  const content = contentByLocale[locale] ?? contentByLocale.en;
  return {
    title: content.metadata.title,
    description: content.metadata.description,
    openGraph: {
      type: "website",
      locale: getLocaleConfig(locale).ogLocale,
      url: CONTEXT_ENGINEERING_FOR_AGENTS_PATH,
      siteName: siteConfig.siteName,
      title: content.metadata.openGraphTitle,
      description: content.metadata.openGraphDescription,
    },
  };
}

export function getContextEngineeringForAgentsPageData(locale: SiteLocale) {
  return contentByLocale[locale] ?? contentByLocale.en;
}
