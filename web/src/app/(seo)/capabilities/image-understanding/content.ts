import type { Metadata } from "next";
import { createFaqPageJsonLd, createTechArticleJsonLd } from "@/lib/schema";
import { getLocaleConfig, siteConfig, type SiteLocale } from "@/lib/site";

export const IMAGE_UNDERSTANDING_PATH = "/capabilities/image-understanding";

const LAST_UPDATED_ISO = "2026-04-11";

type BreadcrumbItem = {
  name: string;
  href?: string;
};

type FaqItem = {
  question: string;
  answer: string;
};

type UsageExample = {
  title: string;
  code: string;
};

type RelatedCard = {
  eyebrow: string;
  title: string;
  href: string;
  description: string;
};

type NextAction = {
  label: string;
  href: string;
  external?: boolean;
  primary?: boolean;
};

type ImageUnderstandingPageContent = {
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
  breadcrumbItems: readonly BreadcrumbItem[];
  eyebrow: string;
  lastUpdatedLabel: string;
  hero: {
    title: string;
    intro: string;
    summaryLabel: string;
    summaryText: string;
  };
  namingNote: {
    label: string;
    text: string;
  };
  usageTitle: string;
  usageExamples: readonly UsageExample[];
  useCasesTitle: string;
  useCases: readonly string[];
  relatedTitle: string;
  relatedCards: readonly RelatedCard[];
  faqTitle: string;
  faqItems: readonly FaqItem[];
  nextStepsTitle: string;
  nextActions: readonly NextAction[];
};

const enContent: ImageUnderstandingPageContent = {
  metadata: {
    title: "Image Understanding API for AI agents - Vision, OCR, and image analysis",
    description:
      "Give AI agents image understanding through AnyCap. Analyze screenshots, diagrams, photos, charts, and OCR-heavy visuals through one CLI command without wiring a separate vision or image analysis stack.",
    openGraphTitle: "Image Understanding API for AI agents - Vision, OCR, and image analysis",
    openGraphDescription:
      "Add image understanding, OCR, and image analysis to AI agents with one CLI and one capability runtime.",
    articleHeadline: "Image Understanding API for AI agents - Vision, OCR, and image analysis",
    articleDescription:
      "Capability guide for adding image understanding to AI agents through AnyCap, including screenshots, diagrams, OCR, and chart analysis.",
    articleAbout: ["Image understanding", "Vision for AI agents", "OCR", "AnyCap"],
    articleKeywords: [
      "image understanding for ai agents",
      "vision api for agents",
      "image analysis api",
      "image recognition api",
      "ocr api",
    ],
  },
  breadcrumbItems: [
    { name: "Home", href: "/" },
    { name: "Capabilities", href: "/capabilities" },
    { name: "Image Understanding", href: IMAGE_UNDERSTANDING_PATH },
  ],
  eyebrow: "Capabilities",
  lastUpdatedLabel: "Last updated April 11, 2026",
  hero: {
    title: "Image Understanding",
    intro:
      "AnyCap gives agents a consistent image understanding layer for screenshots, diagrams, charts, and visual references. Instead of wiring a different vision API or image analysis API for each workflow, the agent gets one command surface for visual analysis, OCR, and context extraction across Claude Code, Cursor, Codex, and the rest of your stack.",
    summaryLabel: "Answer-first summary",
    summaryText:
      "Use image understanding when the agent needs to describe, classify, or reason about an image before acting. The same flow works for screenshots, design references, charts, and text-heavy visuals.",
  },
  namingNote: {
    label: "Naming note",
    text:
      "The page uses market language that matches search intent. The CLI command stays `anycap actions image-read`.",
  },
  usageTitle: "CLI usage",
  usageExamples: [
    {
      title: "Analyze a remote screenshot",
      code: "anycap actions image-read --url https://example.com/screenshot.png",
    },
    {
      title: "Inspect a local diagram",
      code: "anycap actions image-read --file ./architecture-diagram.png",
    },
    {
      title: "Ask a focused question",
      code:
        'anycap actions image-read --url https://example.com/chart.png --instruction "What trend changes after Q2?"',
    },
  ],
  useCasesTitle: "When agents need image understanding",
  useCases: [
    "Understand UI states and bug screenshots without leaving the agent workflow.",
    "Read architecture diagrams and flowcharts before generating code or docs.",
    "Extract structured detail from charts, tables, or screenshots with embedded text.",
    "Review visual assets, product images, and design references through one runtime.",
  ],
  relatedTitle: "Related pages",
  relatedCards: [
    {
      eyebrow: "Capability",
      title: "Image Generation",
      href: "/capabilities/image-generation",
      description:
        "Pair image understanding with image generation when the workflow needs both analysis and output creation.",
    },
    {
      eyebrow: "Capability",
      title: "Video Analysis",
      href: "/capabilities/video-analysis",
      description:
        "Use this when the workflow spans screenshots and recordings and the agent needs both visual modes.",
    },
    {
      eyebrow: "Agent page",
      title: "For Claude Code",
      href: "/for/claude-code",
      description:
        "See how image understanding fits into the broader Claude Code capability story.",
    },
  ],
  faqTitle: "FAQ",
  faqItems: [
    {
      question: "What does AnyCap image understanding let agents do?",
      answer:
        "It gives agents one interface for visual analysis across screenshots, diagrams, product images, charts, and scanned text. In practice that means one vision API surface for description, OCR, comparison, and focused question answering.",
    },
    {
      question: "Can this act like an image description AI?",
      answer:
        "Yes. The same runtime can describe screenshots, diagrams, product photos, charts, and other visual references in plain language before the agent decides what to do next.",
    },
    {
      question: "Why is the page called image understanding when the CLI command is image-read?",
      answer:
        "The page uses search-friendly language that matches how teams describe the problem, while the CLI keeps the more compact command name `anycap actions image-read`.",
    },
    {
      question: "When should teams think of this as a vision API or image analysis API?",
      answer:
        "Both phrases are valid. Image understanding is the capability name, while vision API and image analysis API are the market terms people often use when they want OCR, screenshot interpretation, chart reading, or visual reasoning in agent workflows.",
    },
    {
      question: "Does this also work as an OCR API for agent workflows?",
      answer:
        "Yes. OCR is one of the practical jobs inside the image understanding capability, especially for screenshots, scanned text, diagrams, dashboards, and charts that agents need to read before acting.",
    },
  ],
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
    { label: "What agents can't do", href: "/learn/what-is-the-most-advanced-ai" },
  ],
};

const ptBrContent: ImageUnderstandingPageContent = {
  metadata: {
    title: "API de compreensão de imagem para agentes de IA - visão, OCR e análise",
    description:
      "Dê aos agentes de IA compreensão de imagem por meio do AnyCap. Analise screenshots, diagramas, fotos, gráficos e visuais com muito texto em um único comando de CLI, sem precisar integrar uma stack separada de visão ou análise de imagem.",
    openGraphTitle: "API de compreensão de imagem para agentes de IA - visão, OCR e análise",
    openGraphDescription:
      "Adicione compreensão de imagem, OCR e análise visual aos agentes de IA com uma única CLI e um único runtime de capability.",
    articleHeadline: "API de compreensão de imagem para agentes de IA - visão, OCR e análise",
    articleDescription:
      "Guia de capability para adicionar compreensão de imagem aos agentes de IA por meio do AnyCap, incluindo screenshots, diagramas, OCR e leitura de gráficos.",
    articleAbout: ["Compreensão de imagem", "Visão para agentes de IA", "OCR", "AnyCap"],
    articleKeywords: [
      "compreensão de imagem para agentes de ia",
      "ia que descreve imagens grátis",
      "api de visão para agentes",
      "api de análise de imagem",
      "api de ocr",
    ],
  },
  breadcrumbItems: [
    { name: "Início", href: "/" },
    { name: "Capacidades", href: "/capabilities" },
    { name: "Compreensão de imagem", href: IMAGE_UNDERSTANDING_PATH },
  ],
  eyebrow: "Capacidades",
  lastUpdatedLabel: "Atualizado em 11 de abril de 2026",
  hero: {
    title: "Compreensão de imagem",
    intro:
      "O AnyCap dá aos agentes uma camada consistente de compreensão de imagem para screenshots, diagramas, gráficos e referências visuais. Em vez de ligar uma API de visão diferente para cada fluxo, o agente ganha uma superfície única para análise visual, OCR e extração de contexto em Claude Code, Cursor, Codex e o restante da sua stack.",
    summaryLabel: "Resumo direto",
    summaryText:
      "Use compreensão de imagem quando o agente precisa descrever, classificar ou raciocinar sobre uma imagem antes de agir. O mesmo fluxo funciona para screenshots, referências de design, gráficos e visuais com muito texto.",
  },
  namingNote: {
    label: "Nota de nomenclatura",
    text:
      "A página usa a linguagem de mercado que corresponde à busca. O comando da CLI continua `anycap actions image-read`.",
  },
  usageTitle: "Uso na CLI",
  usageExamples: [
    {
      title: "Analisar um screenshot remoto",
      code: "anycap actions image-read --url https://example.com/screenshot.png",
    },
    {
      title: "Inspecionar um diagrama local",
      code: "anycap actions image-read --file ./architecture-diagram.png",
    },
    {
      title: "Fazer uma pergunta focada",
      code:
        'anycap actions image-read --url https://example.com/chart.png --instruction "O que muda na tendência depois do Q2?"',
    },
  ],
  useCasesTitle: "Quando os agentes precisam de compreensão de imagem",
  useCases: [
    "Entender estados de UI e screenshots de bug sem sair do fluxo do agente.",
    "Ler diagramas de arquitetura e fluxogramas antes de gerar código ou documentação.",
    "Extrair detalhes estruturados de gráficos, tabelas ou screenshots com texto embutido.",
    "Revisar assets visuais, imagens de produto e referências de design em um único runtime.",
  ],
  relatedTitle: "Páginas relacionadas",
  relatedCards: [
    {
      eyebrow: "Capacidade",
      title: "Geração de imagem",
      href: "/capabilities/image-generation",
      description:
        "Combine compreensão de imagem com geração de imagem quando o fluxo precisar analisar e também produzir o resultado.",
    },
    {
      eyebrow: "Capacidade",
      title: "Análise de vídeo",
      href: "/capabilities/video-analysis",
      description:
        "Use este caminho quando o fluxo atravessar screenshots e gravações e o agente precisar dos dois modos visuais.",
    },
    {
      eyebrow: "Página de agente",
      title: "Para Claude Code",
      href: "/for/claude-code",
      description:
        "Veja como a compreensão de imagem entra na história mais ampla de capabilities do Claude Code.",
    },
  ],
  faqTitle: "Perguntas frequentes",
  faqItems: [
    {
      question: "O que a compreensão de imagem do AnyCap permite que os agentes façam?",
      answer:
        "Ela dá aos agentes uma interface única para análise visual em screenshots, diagramas, imagens de produto, gráficos e texto digitalizado. Na prática, isso significa uma superfície única de visão para descrição, OCR, comparação e resposta a perguntas focadas.",
    },
    {
      question: "Isso funciona como uma ia que descreve imagens?",
      answer:
        "Sim. O mesmo runtime consegue descrever screenshots, diagramas, fotos de produto, gráficos e outras referências visuais em linguagem simples antes de o agente decidir o que fazer em seguida.",
    },
    {
      question: "Por que a página se chama compreensão de imagem se o comando da CLI é image-read?",
      answer:
        "A página usa a linguagem de busca que as equipes realmente digitam quando procuram a solução, enquanto a CLI mantém o nome mais compacto `anycap actions image-read`.",
    },
    {
      question: "Quando devo pensar nisso como uma API de visão ou de análise de imagem?",
      answer:
        "Os dois termos são válidos. Compreensão de imagem é o nome da capability, enquanto API de visão e API de análise de imagem são os termos de mercado usados quando a pessoa quer OCR, interpretação de screenshots, leitura de gráficos ou raciocínio visual em fluxos de agente.",
    },
    {
      question: "Isso também funciona como uma API de OCR para agentes?",
      answer:
        "Sim. OCR é uma das tarefas práticas dentro da capability de compreensão de imagem, especialmente para screenshots, texto digitalizado, diagramas, dashboards e gráficos que o agente precisa ler antes de agir.",
    },
  ],
  nextStepsTitle: "Próximos passos",
  nextActions: [
    {
      label: "Ver no GitHub",
      href: "https://github.com/anycap-ai/anycap",
      external: true,
      primary: true,
    },
    { label: "Explorar capacidades", href: "/capabilities" },
    { label: "Explorar a CLI", href: "/cli" },
    { label: "O que os agentes não conseguem fazer", href: "/learn/what-is-the-most-advanced-ai" },
  ],
};

const idContent: ImageUnderstandingPageContent = {
  metadata: {
    title: "API pemahaman gambar untuk agen AI - visi, OCR, dan analisis gambar",
    description:
      "Berikan agen AI kemampuan memahami gambar lewat AnyCap. Analisis tangkapan layar, diagram, foto, grafik, dan visual berat teks dengan satu perintah CLI tanpa menyambungkan stack visi atau analisis gambar terpisah.",
    openGraphTitle: "API pemahaman gambar untuk agen AI - visi, OCR, dan analisis gambar",
    openGraphDescription:
      "Tambahkan pemahaman gambar, OCR, dan analisis gambar ke agen AI dengan satu CLI dan satu runtime kemampuan.",
    articleHeadline: "API pemahaman gambar untuk agen AI - visi, OCR, dan analisis gambar",
    articleDescription:
      "Panduan kemampuan untuk menambahkan pemahaman gambar ke agen AI melalui AnyCap, termasuk tangkapan layar, diagram, OCR, dan analisis grafik.",
    articleAbout: ["Pemahaman gambar", "Visi untuk agen AI", "OCR", "AnyCap"],
    articleKeywords: [
      "pemahaman gambar untuk agen ai",
      "api visi untuk agen",
      "api analisis gambar",
      "api pengenalan gambar",
      "api ocr",
    ],
  },
  breadcrumbItems: [
    { name: "Beranda", href: "/" },
    { name: "Kemampuan", href: "/capabilities" },
    { name: "Pemahaman gambar", href: IMAGE_UNDERSTANDING_PATH },
  ],
  eyebrow: "Kemampuan",
  lastUpdatedLabel: "Terakhir diperbarui 11 April 2026",
  hero: {
    title: "Pemahaman gambar",
    intro:
      "AnyCap memberi agen lapisan pemahaman gambar yang konsisten untuk tangkapan layar, diagram, grafik, dan referensi visual. Alih-alih menyambungkan API visi atau analisis gambar yang berbeda untuk setiap alur kerja, agen mendapat satu permukaan perintah untuk analisis visual, OCR, dan ekstraksi konteks di Claude Code, Cursor, Codex, dan sisa stack Anda.",
    summaryLabel: "Ringkasan jawaban dulu",
    summaryText:
      "Gunakan pemahaman gambar ketika agen perlu mendeskripsikan, mengklasifikasi, atau bernalar tentang gambar sebelum bertindak. Alur yang sama berlaku untuk tangkapan layar, referensi desain, grafik, dan visual yang banyak teksnya.",
  },
  namingNote: {
    label: "Catatan penamaan",
    text:
      "Halaman memakai bahasa pasar yang selaras dengan niat pencarian. Perintah CLI tetap `anycap actions image-read`.",
  },
  usageTitle: "Penggunaan CLI",
  usageExamples: [
    {
      title: "Menganalisis tangkapan layar jarak jauh",
      code: "anycap actions image-read --url https://example.com/screenshot.png",
    },
    {
      title: "Memeriksa diagram lokal",
      code: "anycap actions image-read --file ./architecture-diagram.png",
    },
    {
      title: "Mengajukan pertanyaan terfokus",
      code:
        'anycap actions image-read --url https://example.com/chart.png --instruction "Tren apa yang berubah setelah Q2?"',
    },
  ],
  useCasesTitle: "Kapan agen membutuhkan pemahaman gambar",
  useCases: [
    "Memahami status UI dan tangkapan layar bug tanpa keluar dari alur kerja agen.",
    "Membaca diagram arsitektur dan bagan alir sebelum menghasilkan kode atau dokumentasi.",
    "Mengekstrak detail terstruktur dari grafik, tabel, atau tangkapan layar dengan teks tertanam.",
    "Mereview aset visual, gambar produk, dan referensi desain lewat satu runtime.",
  ],
  relatedTitle: "Halaman terkait",
  relatedCards: [
    {
      eyebrow: "Kemampuan",
      title: "Generasi gambar",
      href: "/capabilities/image-generation",
      description:
        "Padukan pemahaman gambar dengan generasi gambar ketika alur kerja membutuhkan analisis sekaligus pembuatan keluaran.",
    },
    {
      eyebrow: "Kemampuan",
      title: "Analisis video",
      href: "/capabilities/video-analysis",
      description:
        "Gunakan ini ketika alur kerja mencakup tangkapan layar dan rekaman serta agen membutuhkan kedua mode visual.",
    },
    {
      eyebrow: "Halaman agen",
      title: "Untuk Claude Code",
      href: "/for/claude-code",
      description:
        "Lihat bagaimana pemahaman gambar masuk ke narasi kemampuan Claude Code secara keseluruhan.",
    },
  ],
  faqTitle: "Pertanyaan yang sering diajukan",
  faqItems: [
    {
      question: "Apa yang bisa dilakukan agen dengan pemahaman gambar AnyCap?",
      answer:
        "Ini memberi agen satu antarmuka untuk analisis visual pada tangkapan layar, diagram, gambar produk, grafik, dan teks hasil pindaian. Dalam praktiknya berarti satu permukaan API visi untuk deskripsi, OCR, perbandingan, dan menjawab pertanyaan terfokus.",
    },
    {
      question: "Apakah ini bisa berperan seperti AI yang mendeskripsikan gambar?",
      answer:
        "Ya. Runtime yang sama dapat mendeskripsikan tangkapan layar, diagram, foto produk, grafik, dan referensi visual lainnya dalam bahasa sederhana sebelum agen memutuskan langkah berikutnya.",
    },
    {
      question: "Mengapa halaman ini bernama pemahaman gambar sementara perintah CLI-nya image-read?",
      answer:
        "Halaman memakai bahasa yang ramah pencarian dan selaras dengan cara tim mendeskripsikan masalahnya, sementara CLI mempertahankan nama perintah yang lebih ringkas `anycap actions image-read`.",
    },
    {
      question: "Kapan tim sebaiknya memikirkannya sebagai API visi atau API analisis gambar?",
      answer:
        "Keduanya valid. Pemahaman gambar adalah nama kemampuan, sementara API visi dan API analisis gambar adalah istilah pasar yang sering dipakai ketika orang ingin OCR, interpretasi tangkapan layar, pembacaan grafik, atau penalaran visual dalam alur kerja agen.",
    },
    {
      question: "Apakah ini juga berfungsi sebagai API OCR untuk alur kerja agen?",
      answer:
        "Ya. OCR adalah salah satu tugas praktis di dalam kemampuan pemahaman gambar, terutama untuk tangkapan layar, teks hasil pindaian, diagram, dasbor, dan grafik yang perlu dibaca agen sebelum bertindak.",
    },
  ],
  nextStepsTitle: "Langkah berikutnya",
  nextActions: [
    {
      label: "Lihat di GitHub",
      href: "https://github.com/anycap-ai/anycap",
      external: true,
      primary: true,
    },
    { label: "Jelajahi kemampuan", href: "/capabilities" },
    { label: "Jelajahi CLI", href: "/cli" },
    { label: "Apa yang tidak bisa dilakukan agen", href: "/learn/what-is-the-most-advanced-ai" },
  ],
};

const deContent: ImageUnderstandingPageContent = {
  metadata: {
    title: "Bildverständnis-API für KI-Agenten – Vision, OCR und Bildanalyse",
    description:
      "Geben Sie KI-Agenten Bildverständnis über AnyCap. Analysieren Sie Screenshots, Diagramme, Fotos, Charts und textlastige Visuals über einen CLI-Befehl, ohne einen separaten Vision- oder Bildanalyse-Stack zu verdrahten.",
    openGraphTitle: "Bildverständnis-API für KI-Agenten – Vision, OCR und Bildanalyse",
    openGraphDescription:
      "Statten Sie KI-Agenten mit Bildverständnis, OCR und Bildanalyse über eine CLI und eine Capability-Runtime aus.",
    articleHeadline: "Bildverständnis-API für KI-Agenten – Vision, OCR und Bildanalyse",
    articleDescription:
      "Capability-Leitfaden zum Hinzufügen von Bildverständnis zu KI-Agenten über AnyCap, einschließlich Screenshots, Diagrammen, OCR und Chart-Analyse.",
    articleAbout: ["Bildverständnis", "Vision für KI-Agenten", "OCR", "AnyCap"],
    articleKeywords: [
      "bildverständnis für ki-agenten",
      "vision api für agenten",
      "image analysis api",
      "image recognition api",
      "ocr api",
    ],
  },
  breadcrumbItems: [
    { name: "Startseite", href: "/" },
    { name: "Capabilities", href: "/capabilities" },
    { name: "Bildverständnis", href: IMAGE_UNDERSTANDING_PATH },
  ],
  eyebrow: "Capabilities",
  lastUpdatedLabel: "Zuletzt aktualisiert am 11. April 2026",
  hero: {
    title: "Bildverständnis",
    intro:
      "AnyCap gibt Agenten eine konsistente Bildverständnis-Schicht für Screenshots, Diagramme, Charts und visuelle Referenzen. Statt für jeden Workflow eine andere Vision-API oder Bildanalyse-API zu verdrahten, erhält der Agent eine einzige Befehlsoberfläche für visuelle Analyse, OCR und Kontextextraktion über Claude Code, Cursor, Codex und den Rest Ihres Stacks hinweg.",
    summaryLabel: "Kurz vorab",
    summaryText:
      "Setzen Sie auf Bildverständnis, wenn der Agent ein Bild beschreiben, klassifizieren oder darüber argumentieren muss, bevor er handelt. Derselbe Flow funktioniert für Screenshots, Designreferenzen, Charts und textlastige Visuals.",
  },
  namingNote: {
    label: "Hinweis zur Benennung",
    text:
      "Die Seite verwendet Marktsprache, die zur Suchintention passt. Der CLI-Befehl bleibt `anycap actions image-read`.",
  },
  usageTitle: "CLI-Nutzung",
  usageExamples: [
    {
      title: "Einen Remote-Screenshot analysieren",
      code: "anycap actions image-read --url https://example.com/screenshot.png",
    },
    {
      title: "Ein lokales Diagramm prüfen",
      code: "anycap actions image-read --file ./architecture-diagram.png",
    },
    {
      title: "Eine fokussierte Frage stellen",
      code:
        'anycap actions image-read --url https://example.com/chart.png --instruction "Welche Trendänderungen gibt es nach Q2?"',
    },
  ],
  useCasesTitle: "Wann Agenten Bildverständnis brauchen",
  useCases: [
    "UI-Zustände und Bug-Screenshots verstehen, ohne den Agenten-Workflow zu verlassen.",
    "Architektur-Diagramme und Flowcharts lesen, bevor Code oder Docs generiert werden.",
    "Strukturierte Details aus Charts, Tabellen oder Screenshots mit eingebettetem Text extrahieren.",
    "Visuelle Assets, Produktbilder und Designreferenzen über eine einzige Runtime prüfen.",
  ],
  relatedTitle: "Verwandte Seiten",
  relatedCards: [
    {
      eyebrow: "Capability",
      title: "Bildgenerierung",
      href: "/capabilities/image-generation",
      description:
        "Kombinieren Sie Bildverständnis mit Bildgenerierung, wenn der Workflow sowohl Analyse als auch Output-Erstellung benötigt.",
    },
    {
      eyebrow: "Capability",
      title: "Videoanalyse",
      href: "/capabilities/video-analysis",
      description:
        "Verwenden Sie das, wenn der Workflow Screenshots und Aufnahmen umfasst und der Agent beide visuellen Modi braucht.",
    },
    {
      eyebrow: "Agenten-Seite",
      title: "Für Claude Code",
      href: "/for/claude-code",
      description:
        "So fügt sich Bildverständnis in die umfassende Capability-Story von Claude Code ein.",
    },
  ],
  faqTitle: "FAQ",
  faqItems: [
    {
      question: "Was können Agenten mit dem Bildverständnis von AnyCap tun?",
      answer:
        "Es gibt Agenten eine einzige Schnittstelle für visuelle Analyse über Screenshots, Diagramme, Produktbilder, Charts und gescannten Text. In der Praxis bedeutet das eine einzige Vision-API-Oberfläche für Beschreibung, OCR, Vergleich und fokussierte Beantwortung von Fragen.",
    },
    {
      question: "Kann das wie eine Bildbeschreibungs-KI funktionieren?",
      answer:
        "Ja. Dieselbe Runtime kann Screenshots, Diagramme, Produktfotos, Charts und andere visuelle Referenzen in einfacher Sprache beschreiben, bevor der Agent entscheidet, was als Nächstes zu tun ist.",
    },
    {
      question: "Warum heißt die Seite Bildverständnis, wenn der CLI-Befehl image-read ist?",
      answer:
        "Die Seite verwendet suchfreundliche Sprache, die zur Beschreibung des Problems durch Teams passt, während die CLI den kompakteren Befehlsnamen `anycap actions image-read` behält.",
    },
    {
      question: "Wann sollten Teams das als Vision-API oder Bildanalyse-API verstehen?",
      answer:
        "Beide Begriffe sind gültig. Bildverständnis ist der Capability-Name, während Vision-API und Bildanalyse-API die Marktbegriffe sind, die Menschen oft verwenden, wenn sie OCR, Screenshot-Interpretation, Chart-Lesen oder visuelle Argumentation in Agenten-Workflows wollen.",
    },
    {
      question: "Funktioniert das auch als OCR-API für Agenten-Workflows?",
      answer:
        "Ja. OCR ist eine der praktischen Aufgaben innerhalb der Bildverständnis-Capability, besonders für Screenshots, gescannten Text, Diagramme, Dashboards und Charts, die Agenten vor dem Handeln lesen müssen.",
    },
  ],
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
    { label: "Was Agenten nicht können", href: "/learn/what-is-the-most-advanced-ai" },
  ],
};

const contentByLocale = {
  en: enContent,
  "pt-br": ptBrContent,
  id: idContent,
  de: deContent,
} satisfies Record<SiteLocale, ImageUnderstandingPageContent>;

function getContent(locale: SiteLocale): ImageUnderstandingPageContent {
  return contentByLocale[locale] ?? contentByLocale.en;
}

export function getImageUnderstandingMetadata(locale: SiteLocale): Metadata {
  const content = getContent(locale);

  return {
    title: content.metadata.title,
    description: content.metadata.description,
    alternates: { canonical: IMAGE_UNDERSTANDING_PATH },
    openGraph: {
      type: "website",
      locale: getLocaleConfig(locale).ogLocale,
      url: IMAGE_UNDERSTANDING_PATH,
      siteName: siteConfig.siteName,
      title: content.metadata.openGraphTitle,
      description: content.metadata.openGraphDescription,
    },
  };
}

export function getImageUnderstandingPageData(locale: SiteLocale) {
  const content = getContent(locale);

  return {
    ...content,
    articleJsonLd: createTechArticleJsonLd({
      headline: content.metadata.articleHeadline,
      description: content.metadata.articleDescription,
      path: IMAGE_UNDERSTANDING_PATH,
      locale,
      about: [...content.metadata.articleAbout],
      keywords: [...content.metadata.articleKeywords],
      datePublished: LAST_UPDATED_ISO,
      dateModified: LAST_UPDATED_ISO,
    }),
    faqJsonLd: createFaqPageJsonLd(content.faqItems),
  };
}
