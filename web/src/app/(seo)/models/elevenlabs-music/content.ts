import type { Metadata } from "next";
import type { ModelDetailPageContent } from "@/app/(seo)/models/veo-3-1/Veo31PageView";
import type { ModelVisualShowcaseEntry } from "@/components/seo/ModelVisualShowcase";
import { createFaqPageJsonLd, createTechArticleJsonLd } from "@/lib/schema";
import { getLocaleConfig, siteConfig, type SiteLocale } from "@/lib/site";

export const ELEVENLABS_MUSIC_PATH = "/models/elevenlabs-music";

const LAST_UPDATED_ISO = "2026-04-05";
const SHOWCASE_IMAGE_SRC =
  "https://cdn.anycap.ai/page_resource/models/elevenlabs-music-cover.jpg";

type LocaleContent = ModelDetailPageContent & {
  showcase: ModelVisualShowcaseEntry;
};

const contentByLocale = {
  en: {
    metadata: {
      title: "ElevenLabs Music for AI agents — Text-to-music through AnyCap",
      description:
        "Use ElevenLabs Music through AnyCap when AI agents need prompt-based soundtrack generation inside the same CLI and capability runtime as image and video workflows.",
      openGraphTitle: "ElevenLabs Music for AI agents — Text-to-music through AnyCap",
      openGraphDescription:
        "Use ElevenLabs Music through AnyCap for prompt-based music generation inside agent workflows.",
      articleHeadline: "ElevenLabs Music for AI agents — Text-to-music through AnyCap",
      articleDescription:
        "Guide to using ElevenLabs Music through AnyCap for prompt-based soundtrack generation inside AI agent workflows.",
      articleAbout: ["ElevenLabs Music", "Music generation", "AnyCap", "AI agents"],
      articleKeywords: [
        "elevenlabs music",
        "elevenlabs music api",
        "text to music api",
        "music generation",
        "anycap",
      ],
    },
    breadcrumbItems: [
      { name: "Home", href: "/" },
      { name: "Models", href: "/models" },
      { name: "ElevenLabs Music", href: ELEVENLABS_MUSIC_PATH },
    ],
    eyebrow: "Model",
    lastUpdatedLabel: "Last updated April 5, 2026",
    hero: {
      titleLine1: "ElevenLabs Music",
      titleLine2: "for AI agents",
      intro:
        "ElevenLabs Music is a practical choice when an agent needs to turn a prompt into a usable soundtrack draft without leaving the rest of the AnyCap workflow. It keeps text-to-music generation in the same runtime as image generation, video generation, and downstream media review tasks.",
    },
    showcaseLabels: {
      generatedExampleLabel: "Generated example",
      signalsLabel: "Why it helps this page",
    },
    showcase: {
      modelName: "ElevenLabs Music",
      href: ELEVENLABS_MUSIC_PATH,
      sectionTitle: "Illustrative cover art for a soundtrack-first workflow",
      intro:
        "Music generation pages can feel especially thin because the output is audio, not something a crawler can see. This companion cover visual gives the page a stronger mood anchor around the soundtrack brief.",
      promptLabel: "Illustrative cover prompt",
      prompt:
        "ambient electronic soundtrack cover art, glowing waveform ribbon over warm paper grain with soft green-blue haze, elegant abstract motion, premium album-art composition, no readable text, no watermark",
      caption:
        "This abstract cover visual was generated through AnyCap to give the ElevenLabs Music page a first-party multimedia asset tied to the soundtrack prompt.",
      note:
        "The image is a companion mood visual for the audio workflow. It is not presented as music output, but it helps the page communicate tone and use case faster.",
      signals: [
        "Adds an original visual anchor to an otherwise text-heavy audio page.",
        "Matches the soundtrack-draft positioning better than a generic stock music icon would.",
        "Improves scanability and AI citation readiness by pairing the prompt with a concrete artifact.",
      ],
      images: [
        {
          src: SHOWCASE_IMAGE_SRC,
          alt: "Abstract ambient music cover art with a glowing waveform ribbon over warm paper grain and soft green-blue haze.",
          width: 2560,
          height: 1440,
          label: "Companion cover visual",
        },
      ],
    },
    useCasesTitle: "When agents should choose ElevenLabs Music",
    useCases: [
      "Background tracks for demo videos, launch clips, and changelog content",
      "Prompt-based soundtrack generation inside the same runtime as image and video tasks",
      "Fast first-pass music drafts before a higher-touch production handoff",
      "Teams that want music generation discoverable from anycap music models instead of a separate integration",
    ],
    callSectionTitle: "Call ElevenLabs Music through AnyCap",
    callExamples: [
      {
        label: "Discover the exact model entry",
        code: "anycap music models",
      },
      {
        label: "Generate a soundtrack draft",
        code:
          'anycap music generate --model elevanlabs-music --prompt "uplifting ambient soundtrack with soft synths and a steady pulse" -o soundtrack.mp3',
      },
    ],
    workflowTitle: "Catalog note",
    workflowCards: [
      {
        eyebrow: "Current AnyCap model ID",
        body: "This page uses the market-facing name ElevenLabs Music because that matches how teams search. In the current AnyCap catalog, the model ID is elevanlabs-music.",
      },
    ],
    faqTitle: "FAQ",
    faqItems: [
      {
        question: "What is ElevenLabs Music best for?",
        answer:
          "ElevenLabs Music is a strong fit for prompt-based soundtrack generation when an agent needs a fast original track inside the same workflow as visual asset generation.",
      },
      {
        question: "How do agents discover the ElevenLabs Music model in AnyCap?",
        answer:
          "Start with anycap music models. In the current catalog, the public label is ElevenLabs Music and the model ID appears as elevanlabs-music.",
      },
      {
        question: "Why mention the model ID separately from the page title?",
        answer:
          "The page title uses the market-facing model name people search for, while the CLI example highlights the current catalog ID so the command is reproducible inside AnyCap.",
      },
    ],
    nextActions: [
      { label: "Music Generation", href: "/capabilities/music-generation", primary: true },
      { label: "Pricing", href: "/pricing" },
      { label: "AnyCap CLI", href: "/cli" },
    ],
  },
  "pt-br": {
    metadata: {
      title: "ElevenLabs Music para agentes de IA — texto para música pelo AnyCap",
      description:
        "Use o ElevenLabs Music pelo AnyCap quando agentes de IA precisarem de geração de trilha sonora baseada em prompt dentro da mesma CLI e runtime de capability usados para fluxos de imagem e vídeo.",
      openGraphTitle: "ElevenLabs Music para agentes de IA — texto para música pelo AnyCap",
      openGraphDescription:
        "Use o ElevenLabs Music pelo AnyCap para geração de música baseada em prompt dentro de fluxos de agentes.",
      articleHeadline: "ElevenLabs Music para agentes de IA — texto para música pelo AnyCap",
      articleDescription:
        "Guia para usar o ElevenLabs Music pelo AnyCap para geração de trilha sonora baseada em prompt dentro de fluxos de agentes de IA.",
      articleAbout: ["ElevenLabs Music", "Geração de música", "AnyCap", "agentes de IA"],
      articleKeywords: [
        "elevenlabs music",
        "api elevenlabs music",
        "api texto para música",
        "geração de música",
        "anycap",
      ],
    },
    breadcrumbItems: [
      { name: "Início", href: "/" },
      { name: "Modelos", href: "/models" },
      { name: "ElevenLabs Music", href: ELEVENLABS_MUSIC_PATH },
    ],
    eyebrow: "Modelo",
    lastUpdatedLabel: "Atualizado em 5 de abril de 2026",
    hero: {
      titleLine1: "ElevenLabs Music",
      titleLine2: "para agentes de IA",
      intro:
        "O ElevenLabs Music é uma escolha prática quando um agente precisa transformar um prompt em um rascunho de trilha sonora utilizável sem sair do restante do workflow do AnyCap. Ele mantém a geração de texto para música no mesmo runtime que geração de imagem, geração de vídeo e tarefas de revisão de mídia posterior.",
    },
    showcaseLabels: {
      generatedExampleLabel: "Exemplo gerado",
      signalsLabel: "Por que isso ajuda esta página",
    },
    showcase: {
      modelName: "ElevenLabs Music",
      href: ELEVENLABS_MUSIC_PATH,
      sectionTitle: "Arte de capa ilustrativa para um workflow que começa pela trilha",
      intro:
        "Páginas de geração de música podem parecer especialmente finas porque a saída é áudio, não algo que um crawler possa ver. Este visual de capa dá à página uma âncora de clima mais forte ao redor do briefing da trilha sonora.",
      promptLabel: "Prompt ilustrativo da capa",
      prompt:
        "arte de capa de trilha eletrônica ambiente, faixa de waveform brilhante sobre textura de papel quente com leve névoa verde-azulada, movimento abstrato elegante, composição premium de álbum, sem texto legível, sem marca d'água",
      caption:
        "Este visual abstrato de capa foi gerado pelo AnyCap para dar à página do ElevenLabs Music um asset multimídia de primeira mão ligado ao prompt da trilha.",
      note:
        "A imagem é um visual de clima de apoio para o workflow de áudio. Ela não é apresentada como saída musical, mas ajuda a página a comunicar tom e caso de uso mais rápido.",
      signals: [
        "Adiciona uma âncora visual original a uma página de áudio que, de outra forma, seria muito textual.",
        "Combina melhor com o posicionamento de draft de trilha do que um ícone genérico de música.",
        "Melhora a escaneabilidade e a prontidão para citação por IA ao ligar o prompt a um artefato concreto.",
      ],
      images: [
        {
          src: SHOWCASE_IMAGE_SRC,
          alt: "Arte abstrata de capa de música ambiente com faixa de waveform brilhante sobre textura de papel quente e névoa suave verde-azulada.",
          width: 2560,
          height: 1440,
          label: "Visual de capa de apoio",
        },
      ],
    },
    useCasesTitle: "Quando os agentes devem escolher ElevenLabs Music",
    useCases: [
      "Trilhas de fundo para vídeos demo, clipes de lançamento e conteúdo de changelog",
      "Geração de trilha sonora baseada em prompt no mesmo runtime usado para tarefas de imagem e vídeo",
      "Rascunhos rápidos de música antes de um handoff de produção mais cuidadoso",
      "Equipes que querem descobrir geração de música via anycap music models em vez de integração separada",
    ],
    callSectionTitle: "Chame o ElevenLabs Music pelo AnyCap",
    callExamples: [
      {
        label: "Descobrir a entrada exata do modelo",
        code: "anycap music models",
      },
      {
        label: "Gerar um rascunho de trilha sonora",
        code:
          'anycap music generate --model elevanlabs-music --prompt "trilha ambiente inspiradora com sintetizadores suaves e pulso constante" -o soundtrack.mp3',
      },
    ],
    workflowTitle: "Nota de catálogo",
    workflowCards: [
      {
        eyebrow: "ID atual no AnyCap",
        body: "Esta página usa o nome de mercado ElevenLabs Music porque é assim que as equipes pesquisam. No catálogo atual do AnyCap, o model ID é elevanlabs-music.",
      },
    ],
    faqTitle: "Perguntas frequentes",
    faqItems: [
      {
        question: "Para que o ElevenLabs Music é melhor?",
        answer:
          "O ElevenLabs Music é uma boa escolha para geração de trilha sonora baseada em prompt quando um agente precisa de uma faixa original rápida dentro do mesmo workflow da geração de assets visuais.",
      },
      {
        question: "Como os agentes descobrem o modelo ElevenLabs Music no AnyCap?",
        answer:
          "Comece com anycap music models. No catálogo atual, o rótulo público é ElevenLabs Music e o model ID aparece como elevanlabs-music.",
      },
      {
        question: "Por que mencionar o ID do modelo separadamente do título da página?",
        answer:
          "O título da página usa o nome de mercado que as pessoas pesquisam, enquanto o exemplo de CLI destaca o ID atual do catálogo para que o comando seja reproduzível dentro do AnyCap.",
      },
    ],
    nextActions: [
      { label: "Geração de música", href: "/capabilities/music-generation", primary: true },
      { label: "Preços", href: "/pricing" },
      { label: "CLI do AnyCap", href: "/cli" },
    ],
  },
  id: {
    metadata: {
      title: "ElevenLabs Music untuk agen AI — text-to-music melalui AnyCap",
      description:
        "Gunakan ElevenLabs Music melalui AnyCap saat agen AI membutuhkan generasi soundtrack berbasis prompt di dalam CLI dan runtime capability yang sama dengan alur gambar dan video.",
      openGraphTitle: "ElevenLabs Music untuk agen AI — text-to-music melalui AnyCap",
      openGraphDescription:
        "Gunakan ElevenLabs Music melalui AnyCap untuk generasi musik berbasis prompt di dalam workflow agen.",
      articleHeadline: "ElevenLabs Music untuk agen AI — text-to-music melalui AnyCap",
      articleDescription:
        "Panduan menggunakan ElevenLabs Music melalui AnyCap untuk generasi soundtrack berbasis prompt di dalam workflow agen AI.",
      articleAbout: ["ElevenLabs Music", "Generasi musik", "AnyCap", "agen AI"],
      articleKeywords: [
        "elevenlabs music",
        "api elevenlabs music",
        "api text to music",
        "generasi musik",
        "anycap",
      ],
    },
    breadcrumbItems: [
      { name: "Beranda", href: "/" },
      { name: "Model", href: "/models" },
      { name: "ElevenLabs Music", href: ELEVENLABS_MUSIC_PATH },
    ],
    eyebrow: "Model",
    lastUpdatedLabel: "Diperbarui 5 April 2026",
    hero: {
      titleLine1: "ElevenLabs Music",
      titleLine2: "untuk agen AI",
      intro:
        "ElevenLabs Music adalah pilihan praktis saat agen perlu mengubah prompt menjadi draft soundtrack yang bisa dipakai tanpa keluar dari workflow AnyCap lainnya. Model ini menjaga generasi text-to-music tetap di runtime yang sama dengan generasi gambar, generasi video, dan tugas review media lanjutan.",
    },
    showcaseLabels: {
      generatedExampleLabel: "Contoh hasil generasi",
      signalsLabel: "Mengapa ini membantu halaman ini",
    },
    showcase: {
      modelName: "ElevenLabs Music",
      href: ELEVENLABS_MUSIC_PATH,
      sectionTitle: "Cover art ilustratif untuk workflow yang dimulai dari soundtrack",
      intro:
        "Halaman generasi musik bisa terasa sangat tipis karena outputnya audio, bukan sesuatu yang bisa dilihat crawler. Visual cover pendamping ini memberi halaman jangkar suasana yang lebih kuat di sekitar brief soundtrack.",
      promptLabel: "Prompt cover ilustratif",
      prompt:
        "cover art soundtrack elektronik ambient, pita waveform bercahaya di atas tekstur kertas hangat dengan haze hijau-biru lembut, gerakan abstrak elegan, komposisi album-art premium, tanpa teks terbaca, tanpa watermark",
      caption:
        "Visual cover abstrak ini dihasilkan melalui AnyCap untuk memberi halaman ElevenLabs Music asset multimedia first-party yang terikat pada prompt soundtrack.",
      note:
        "Gambar ini adalah visual suasana pendamping untuk workflow audio. Ini bukan output musik, tetapi membantu halaman menyampaikan tone dan use case lebih cepat.",
      signals: [
        "Menambahkan jangkar visual asli pada halaman audio yang kalau tidak akan sangat text-heavy.",
        "Lebih cocok dengan positioning draft soundtrack dibanding ikon musik stok generik.",
        "Meningkatkan scanability dan kesiapan sitasi AI dengan memasangkan prompt ke artefak konkret.",
      ],
      images: [
        {
          src: SHOWCASE_IMAGE_SRC,
          alt: "Cover art musik ambient abstrak dengan pita waveform bercahaya di atas tekstur kertas hangat dan haze hijau-biru lembut.",
          width: 2560,
          height: 1440,
          label: "Visual cover pendamping",
        },
      ],
    },
    useCasesTitle: "Saat agen harus memilih ElevenLabs Music",
    useCases: [
      "Track latar untuk demo video, klip peluncuran, dan konten changelog",
      "Generasi soundtrack berbasis prompt di runtime yang sama dengan tugas gambar dan video",
      "Draft musik cepat sebelum handoff ke produksi yang lebih detail",
      "Tim yang ingin menemukan generasi musik lewat anycap music models alih-alih integrasi terpisah",
    ],
    callSectionTitle: "Panggil ElevenLabs Music lewat AnyCap",
    callExamples: [
      {
        label: "Temukan entri model yang tepat",
        code: "anycap music models",
      },
      {
        label: "Hasilkan draft soundtrack",
        code:
          'anycap music generate --model elevanlabs-music --prompt "soundtrack ambient yang membangkitkan semangat dengan synth lembut dan pulse stabil" -o soundtrack.mp3',
      },
    ],
    workflowTitle: "Catatan katalog",
    workflowCards: [
      {
        eyebrow: "ID model saat ini di AnyCap",
        body: "Halaman ini memakai nama pasar ElevenLabs Music karena itulah yang dicari tim. Di katalog AnyCap saat ini, model ID-nya adalah elevanlabs-music.",
      },
    ],
    faqTitle: "FAQ",
    faqItems: [
      {
        question: "Untuk apa ElevenLabs Music paling bagus?",
        answer:
          "ElevenLabs Music cocok untuk generasi soundtrack berbasis prompt ketika agen membutuhkan track orisinal yang cepat di dalam workflow yang sama dengan pembuatan aset visual.",
      },
      {
        question: "Bagaimana agen menemukan model ElevenLabs Music di AnyCap?",
        answer:
          "Mulailah dengan anycap music models. Di katalog saat ini, label publiknya adalah ElevenLabs Music dan model ID-nya muncul sebagai elevanlabs-music.",
      },
      {
        question: "Mengapa menyebut model ID terpisah dari judul halaman?",
        answer:
          "Judul halaman memakai nama pasar yang dicari orang, sedangkan contoh CLI menyorot ID katalog saat ini agar perintahnya bisa direproduksi di dalam AnyCap.",
      },
    ],
    nextActions: [
      { label: "Generasi musik", href: "/capabilities/music-generation", primary: true },
      { label: "Harga", href: "/pricing" },
      { label: "CLI AnyCap", href: "/cli" },
    ],
  },
} as const satisfies Record<SiteLocale, LocaleContent>;

export function getElevenLabsMusicMetadata(locale: SiteLocale): Metadata {
  const content = contentByLocale[locale] ?? contentByLocale.en;

  return {
    title: content.metadata.title,
    description: content.metadata.description,
    alternates: { canonical: ELEVENLABS_MUSIC_PATH },
    openGraph: {
      type: "website",
      locale: getLocaleConfig(locale).ogLocale,
      url: ELEVENLABS_MUSIC_PATH,
      siteName: siteConfig.siteName,
      title: content.metadata.openGraphTitle,
      description: content.metadata.openGraphDescription,
    },
  };
}

export function getElevenLabsMusicPageData(locale: SiteLocale) {
  const content = contentByLocale[locale] ?? contentByLocale.en;

  return {
    ...content,
    modelGuideJsonLd: createTechArticleJsonLd({
      headline: content.metadata.articleHeadline,
      description: content.metadata.articleDescription,
      path: ELEVENLABS_MUSIC_PATH,
      locale,
      about: [...content.metadata.articleAbout],
      keywords: [...content.metadata.articleKeywords],
      dateModified: LAST_UPDATED_ISO,
    }),
    faqJsonLd: createFaqPageJsonLd(content.faqItems),
  };
}

export type ElevenLabsMusicPageData = ReturnType<typeof getElevenLabsMusicPageData>;
