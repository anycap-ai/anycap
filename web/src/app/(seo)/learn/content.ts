import type { Metadata } from "next";
import { getLocaleConfig, siteConfig, type SiteLocale } from "@/lib/site";

export const LEARN_PATH = "/learn";

type LearnPageData = {
  breadcrumbItems: readonly { name: string; href: string }[];
  eyebrow: string;
  metadata: {
    title: string;
    description: string;
    openGraphTitle: string;
    openGraphDescription: string;
  };
  hero: {
    eyebrow: string;
    titleLines: [string, string];
    intro: string;
    statsPrefix: string;
    statsSuffix: string;
  };
  orientation: {
    eyebrow: string;
    title: string;
    description: string;
    steps: readonly {
      step: string;
      title: string;
      description: string;
    }[];
  };
  pathSectionIntro: {
    eyebrow: string;
    title: string;
    description: string;
  };
  sectionLabels: {
    startHere: string;
    shortcuts: string;
    goDeeper: string;
    alsoUseful: string;
    needDifferentType: string;
    differentTypeTitle: string;
    differentTypeBody: string;
    faqEyebrow: string;
    faqTitle: string;
  };
  adjacentHubs: readonly {
    title: string;
    href: string;
    description: string;
  }[];
  faqItems: readonly {
    question: string;
    answer: string;
  }[];
};

const learnPageByLocale: Record<SiteLocale, LearnPageData> = {
  en: {
    breadcrumbItems: [
      { name: "Home", href: "/" },
      { name: "Learn", href: LEARN_PATH },
    ],
    eyebrow: "Learn",
    metadata: {
      title: "Learn | AI Agent Guides, Workflows, and Explainers",
      description:
        "Start with coding-agent stack guides, AI product explainers, capability-gap primers, and real workflows that lead into AnyCap capabilities.",
      openGraphTitle: "Learn | AI Agent Guides, Workflows, and Explainers",
      openGraphDescription:
        "Use Learn when you are choosing a coding-agent stack, extending an AI product, mapping capability gaps, or browsing a real workflow example.",
    },
    hero: {
      eyebrow: "Learn",
      titleLines: ["Start with the question", "you are actually asking"],
      intro:
        "Use Learn when you are choosing a coding-agent stack, extending an AI product, mapping capability gaps, or looking for a real workflow example. Each path is grouped by intent so you can move from explanation into the next step without sorting through unrelated page types first.",
      statsPrefix: "",
      statsSuffix: "Open one category below and ignore the rest for now.",
    },
    orientation: {
      eyebrow: "How to use this page",
      title: "Pick one path, start with the featured page, then only go narrower if you need it",
      description:
        "This page is designed to reduce choice overload. Treat each section like a curated route instead of a list of everything we have published.",
      steps: [
        {
          step: "01",
          title: "Match the question",
          description: "Choose the path that fits what you are deciding right now, not every question you might have later.",
        },
        {
          step: "02",
          title: "Open the featured page",
          description: "Start with the main guide or workflow before branching into narrower pages, variants, or agent-specific follow-ons.",
        },
        {
          step: "03",
          title: "Switch page type when needed",
          description: "Move to Guides or Capabilities once the question becomes operational and you are ready to implement.",
        },
      ],
    },
    pathSectionIntro: {
      eyebrow: "Browse by path",
      title: "Start with the main page, then go narrower only if needed",
      description:
        "The structure below is generated from the same information architecture that powers breadcrumbs, so new pages can slot into the right path without turning the hub into a manual link dump.",
    },
    sectionLabels: {
      startHere: "Start here",
      shortcuts: "Shortcuts",
      goDeeper: "Go deeper",
      alsoUseful: "Also useful",
      needDifferentType: "Need a different page type?",
      differentTypeTitle: "Switch to setup, vocabulary, capabilities, or comparison",
      differentTypeBody:
        "If the question is no longer exploratory, move to the page type that matches the next step instead of scanning more Learn articles.",
      faqEyebrow: "FAQ",
      faqTitle: "Common questions before you pick a path",
    },
    adjacentHubs: [
      {
        title: "Guides",
        href: "/guides",
        description: "Use Guides when you already know what you want to set up and need step-by-step implementation.",
      },
      {
        title: "Glossary",
        href: "/glossary",
        description: "Use Glossary when the main blocker is vocabulary and you need shared language for harnesses, context, and runtimes.",
      },
      {
        title: "Capabilities",
        href: "/capabilities",
        description: "Use Capabilities when you are past the explainer stage and want the exact product surfaces AnyCap adds.",
      },
      {
        title: "Compare",
        href: "/compare",
        description: "Use Compare when the question starts from an alternative vendor, adjacent product, or replacement decision.",
      },
    ],
    faqItems: [
      {
        question: "Which page should I start with if I am choosing a coding-agent setup?",
        answer:
          "Start with Best AI for Coding Agents if you are still framing the category question. From there, move into the Claude Code or Cursor specific page once you know which workflow you care about.",
      },
      {
        question: "What if I am building a SaaS assistant instead of using a coding agent?",
        answer:
          "Start with AI Chatbot SaaS vs AI Agent for SaaS if you are deciding what kind of system you need. Then move into Add Multimodal Capabilities to a SaaS Chatbot when the question becomes implementation.",
      },
      {
        question: "Why are some pages grouped under a main workflow instead of listed flat?",
        answer:
          "Because some pages make more sense as a narrower follow-on after the main workflow already fits. The hub keeps those variants visually attached to the parent path so the page stays easier to scan.",
      },
      {
        question: "When should I move from Learn into Guides or Capabilities?",
        answer:
          "Move into Guides when you are ready to set something up step by step. Move into Capabilities when you already understand the problem and want the exact surface, such as image generation, video analysis, or web crawl.",
      },
    ],
  },
  "pt-br": {
    breadcrumbItems: [
      { name: "Início", href: "/" },
      { name: "Aprender", href: LEARN_PATH },
    ],
    eyebrow: "Aprender",
    metadata: {
      title: "Aprender | Guias, fluxos e explicações sobre agentes de IA",
      description:
        "Comece com guias de stack para agentes de código, explicações sobre produtos de IA, primers de lacunas de capacidade e fluxos reais que levam às capacidades do AnyCap.",
      openGraphTitle: "Aprender | Guias, fluxos e explicações sobre agentes de IA",
      openGraphDescription:
        "Use Aprender quando estiver escolhendo uma stack de agente de código, estendendo um produto de IA, mapeando lacunas de capacidade ou explorando um fluxo real.",
    },
    hero: {
      eyebrow: "Aprender",
      titleLines: ["Comece pela pergunta", "que você realmente está fazendo"],
      intro:
        "Use Aprender quando estiver escolhendo uma stack de agente de código, estendendo um produto de IA, mapeando lacunas de capacidade ou procurando um exemplo de fluxo real. Cada caminho é agrupado por intenção para que você vá da explicação para a próxima etapa sem precisar filtrar tipos de página que não interessam.",
      statsPrefix: "",
      statsSuffix: "Abra uma categoria abaixo e ignore o resto por enquanto.",
    },
    orientation: {
      eyebrow: "Como usar esta página",
      title: "Escolha um caminho, comece pela página principal e só vá mais fundo se precisar",
      description:
        "Esta página foi desenhada para reduzir a sobrecarga de escolhas. Trate cada seção como uma rota curada, e não como uma lista de tudo o que já publicamos.",
      steps: [
        {
          step: "01",
          title: "Combine com a pergunta",
          description: "Escolha o caminho que combina com a decisão que você está tomando agora, e não com todas as dúvidas que pode ter depois.",
        },
        {
          step: "02",
          title: "Abra a página principal",
          description: "Comece pelo guia ou fluxo principal antes de seguir para páginas mais estreitas, variantes ou desdobramentos específicos de agente.",
        },
        {
          step: "03",
          title: "Troque o tipo de página quando precisar",
          description: "Vá para Guias ou Capacidades quando a pergunta virar operacional e você estiver pronto para implementar.",
        },
      ],
    },
    pathSectionIntro: {
      eyebrow: "Navegar por caminho",
      title: "Comece pela página principal e só vá mais fundo se precisar",
      description:
        "A estrutura abaixo é gerada a partir da mesma arquitetura de informação que alimenta os breadcrumbs, então novas páginas entram no caminho certo sem transformar o hub em uma lista manual de links.",
    },
    sectionLabels: {
      startHere: "Comece aqui",
      shortcuts: "Atalhos",
      goDeeper: "Aprofunde",
      alsoUseful: "Também útil",
      needDifferentType: "Precisa de outro tipo de página?",
      differentTypeTitle: "Mude para configuração, vocabulário, capacidades ou comparação",
      differentTypeBody:
        "Se a pergunta já não é exploratória, vá para o tipo de página que corresponde à próxima etapa em vez de continuar varrendo mais artigos de Aprender.",
      faqEyebrow: "FAQ",
      faqTitle: "Perguntas comuns antes de escolher um caminho",
    },
    adjacentHubs: [
      {
        title: "Guias",
        href: "/guides",
        description: "Use Guias quando você já sabe o que quer configurar e precisa de implementação passo a passo.",
      },
      {
        title: "Glossário",
        href: "/glossary",
        description: "Use Glossário quando o principal bloqueio for vocabulário e você precisar de linguagem comum para harnesses, contexto e runtimes.",
      },
      {
        title: "Capacidades",
        href: "/capabilities",
        description: "Use Capacidades quando você já passou da fase explicativa e quer as superfícies de produto exatas que o AnyCap adiciona.",
      },
      {
        title: "Comparar",
        href: "/compare",
        description: "Use Comparar quando a pergunta começar a partir de um fornecedor alternativo, produto adjacente ou decisão de substituição.",
      },
    ],
    faqItems: [
      {
        question: "Com qual página eu devo começar se estiver escolhendo uma stack para agente de código?",
        answer:
          "Comece com Best AI for Coding Agents se ainda estiver enquadrando a categoria. Depois, vá para a página específica de Claude Code ou Cursor quando souber qual fluxo importa.",
      },
      {
        question: "E se eu estiver construindo um assistente SaaS em vez de usar um agente de código?",
        answer:
          "Comece com AI Chatbot SaaS vs AI Agent for SaaS se estiver decidindo que tipo de sistema precisa. Depois vá para Add Multimodal Capabilities to a SaaS Chatbot quando a pergunta virar implementação.",
      },
      {
        question: "Por que algumas páginas ficam agrupadas sob um fluxo principal em vez de aparecerem em lista simples?",
        answer:
          "Porque algumas páginas fazem mais sentido como um desdobramento mais estreito depois que o fluxo principal já faz sentido. O hub mantém essas variantes visualmente ligadas ao caminho pai para ficar mais fácil de escanear.",
      },
      {
        question: "Quando devo sair de Aprender e ir para Guias ou Capacidades?",
        answer:
          "Vá para Guias quando estiver pronto para configurar algo passo a passo. Vá para Capacidades quando já entender o problema e quiser a superfície exata, como geração de imagem, análise de vídeo ou web crawl.",
      },
    ],
  },
  id: {
    breadcrumbItems: [
      { name: "Home", href: "/" },
      { name: "Pelajari", href: LEARN_PATH },
    ],
    eyebrow: "Pelajari",
    metadata: {
      title: "Pelajari | Panduan agen AI, alur kerja, dan penjelasan",
      description:
        "Mulai dengan panduan stack agen coding, penjelasan produk AI, pengantar celah kemampuan, dan alur kerja nyata yang mengarah ke kemampuan AnyCap.",
      openGraphTitle: "Pelajari | Panduan agen AI, alur kerja, dan penjelasan",
      openGraphDescription:
        "Gunakan Pelajari saat Anda memilih stack agen coding, memperluas produk AI, memetakan celah kemampuan, atau melihat contoh alur kerja nyata.",
    },
    hero: {
      eyebrow: "Pelajari",
      titleLines: ["Mulai dari pertanyaan", "yang benar-benar Anda ajukan"],
      intro:
        "Gunakan Pelajari saat Anda memilih stack agen coding, memperluas produk AI, memetakan celah kemampuan, atau mencari contoh alur kerja nyata. Setiap jalur dikelompokkan berdasarkan niat agar Anda bisa berpindah dari penjelasan ke langkah berikutnya tanpa harus memilah jenis halaman yang tidak relevan terlebih dahulu.",
      statsPrefix: "",
      statsSuffix: "Buka satu kategori di bawah ini dan abaikan yang lain untuk saat ini.",
    },
    orientation: {
      eyebrow: "Cara memakai halaman ini",
      title: "Pilih satu jalur, mulai dari halaman unggulan, lalu persempit hanya jika perlu",
      description:
        "Halaman ini dirancang untuk mengurangi kebingungan memilih. Anggap setiap bagian sebagai rute yang dikurasi, bukan daftar semua yang pernah kami terbitkan.",
      steps: [
        {
          step: "01",
          title: "Cocokkan dengan pertanyaan",
          description: "Pilih jalur yang sesuai dengan keputusan yang sedang Anda ambil sekarang, bukan semua pertanyaan yang mungkin muncul nanti.",
        },
        {
          step: "02",
          title: "Buka halaman unggulan",
          description: "Mulai dari panduan atau alur utama sebelum bercabang ke halaman yang lebih sempit, variasi, atau tindak lanjut khusus agen.",
        },
        {
          step: "03",
          title: "Ganti jenis halaman saat perlu",
          description: "Pindah ke Panduan atau Kapabilitas ketika pertanyaannya sudah operasional dan Anda siap menerapkan.",
        },
      ],
    },
    pathSectionIntro: {
      eyebrow: "Telusuri berdasarkan jalur",
      title: "Mulai dari halaman utama, lalu persempit hanya bila perlu",
      description:
        "Struktur di bawah ini dihasilkan dari arsitektur informasi yang sama yang dipakai breadcrumb, sehingga halaman baru bisa masuk ke jalur yang tepat tanpa mengubah hub menjadi daftar tautan manual.",
    },
    sectionLabels: {
      startHere: "Mulai di sini",
      shortcuts: "Pintasan",
      goDeeper: "Lebih dalam",
      alsoUseful: "Juga berguna",
      needDifferentType: "Butuh tipe halaman yang berbeda?",
      differentTypeTitle: "Beralih ke setup, istilah, kapabilitas, atau perbandingan",
      differentTypeBody:
        "Jika pertanyaannya sudah tidak lagi eksploratif, pindah ke tipe halaman yang sesuai dengan langkah berikutnya alih-alih terus menelusuri artikel Pelajari.",
      faqEyebrow: "FAQ",
      faqTitle: "Pertanyaan umum sebelum Anda memilih jalur",
    },
    adjacentHubs: [
      {
        title: "Panduan",
        href: "/guides",
        description: "Gunakan Panduan saat Anda sudah tahu apa yang ingin disiapkan dan butuh implementasi langkah demi langkah.",
      },
      {
        title: "Glosarium",
        href: "/glossary",
        description: "Gunakan Glosarium saat hambatan utamanya adalah istilah dan Anda butuh bahasa yang sama untuk harness, konteks, dan runtime.",
      },
      {
        title: "Kapabilitas",
        href: "/capabilities",
        description: "Gunakan Kapabilitas saat Anda sudah melewati tahap penjelasan dan ingin surface produk yang tepat yang ditambahkan AnyCap.",
      },
      {
        title: "Bandingkan",
        href: "/compare",
        description: "Gunakan Bandingkan saat pertanyaan dimulai dari vendor alternatif, produk yang berdekatan, atau keputusan pengganti.",
      },
    ],
    faqItems: [
      {
        question: "Halaman mana yang harus saya buka dulu jika sedang memilih stack agen coding?",
        answer:
          "Mulailah dari Best AI for Coding Agents jika Anda masih merumuskan kategori. Setelah itu, pindah ke halaman khusus Claude Code atau Cursor ketika Anda sudah tahu alur kerja mana yang penting.",
      },
      {
        question: "Bagaimana kalau saya membangun asisten SaaS, bukan memakai agen coding?",
        answer:
          "Mulailah dari AI Chatbot SaaS vs AI Agent for SaaS jika Anda sedang memutuskan jenis sistem yang dibutuhkan. Lalu lanjut ke Add Multimodal Capabilities to a SaaS Chatbot ketika pertanyaannya sudah menjadi implementasi.",
      },
      {
        question: "Mengapa beberapa halaman dikelompokkan di bawah alur utama, bukan ditampilkan datar?",
        answer:
          "Karena beberapa halaman lebih masuk akal sebagai tindak lanjut yang lebih sempit setelah alur utamanya cocok. Hub menjaga variasi itu tetap terhubung secara visual dengan jalur induknya agar lebih mudah dipindai.",
      },
      {
        question: "Kapan saya harus pindah dari Pelajari ke Panduan atau Kapabilitas?",
        answer:
          "Pindah ke Panduan saat Anda siap menyiapkan sesuatu langkah demi langkah. Pindah ke Kapabilitas saat Anda sudah memahami masalahnya dan ingin surface yang tepat, seperti pembuatan gambar, analisis video, atau web crawl.",
      },
    ],
  },
};

export function getLearnMetadata(locale: SiteLocale): Metadata {
  const content = learnPageByLocale[locale] ?? learnPageByLocale.en;

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

export function getLearnPageData(locale: SiteLocale) {
  return learnPageByLocale[locale] ?? learnPageByLocale.en;
}
