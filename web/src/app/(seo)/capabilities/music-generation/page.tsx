import type { Metadata } from "next";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { EarlyAccessBanner } from "@/components/landing/EarlyAccessBanner";
import { FadeIn } from "@/components/ui/FadeIn";
import { MusicGenDemo } from "@/components/landing/MusicGenDemo";
import { createFaqPageJsonLd, createTechArticleJsonLd, hasJsonLdContent } from "@/lib/schema";
import { getRequestLocale } from "@/lib/request-locale";
import { defaultLocale, getLocaleConfig, siteConfig, type SiteLocale } from "@/lib/site";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;
const lastUpdatedIso = "2026-04-05";

type MusicGenerationPageContent = {
  breadcrumbItems: readonly { name: string; href?: string }[];
  lastUpdatedLabel: string;
  eyebrow: string;
  title: string;
  intro: string;
  summaryEyebrow: string;
  summaryBody: string;
  modelSectionTitle: string;
  tableHeaders: readonly string[];
  usageTitle: string;
  usageExamples: readonly {
    title: string;
    code: string;
  }[];
  useCasesTitle: string;
  useCases: readonly string[];
  relatedPagesTitle: string;
  relatedPages: readonly {
    href: string;
    eyebrow: string;
    title: string;
    body: string;
  }[];
  faqTitle: string;
  faqItems: readonly {
    question: string;
    answer: string;
  }[];
  modelBestFor: string;
  capabilityGuide: {
    headline: string;
    description: string;
    about: string[];
    keywords: string[];
  };
};

type MusicGenerationModel = {
  name: string;
  href: string;
  modelId: string;
  modes: string;
  bestFor: string;
};

const models: Record<SiteLocale, readonly MusicGenerationModel[]> = {
  en: [
    {
      name: "ElevenLabs Music",
      href: "/models/elevenlabs-music",
      modelId: "elevanlabs-music",
      modes: "text-to-music",
      bestFor: "Prompt-based soundtrack drafts and background music inside the same agent runtime",
    },
  ],
  "pt-br": [
    {
      name: "ElevenLabs Music",
      href: "/models/elevenlabs-music",
      modelId: "elevanlabs-music",
      modes: "texto para música",
      bestFor: "Rascunhos de trilha sonora por prompt e música de fundo dentro do mesmo runtime de agente",
    },
  ],
  id: [
    {
      name: "ElevenLabs Music",
      href: "/models/elevenlabs-music",
      modelId: "elevanlabs-music",
      modes: "teks-ke-musik",
      bestFor: "Draf soundtrack berbasis prompt dan musik latar di runtime agen yang sama",
    },
  ],
  de: [
    {
      name: "ElevenLabs Music",
      href: "/models/elevenlabs-music",
      modelId: "elevanlabs-music",
      modes: "text-to-music",
      bestFor: "Prompt-basierte Soundtrack-Entwürfe und Hintergrundmusik in derselben Agenten-Runtime",
    },
  ],
};

const contentByLocale: Record<SiteLocale, MusicGenerationPageContent> = {
  en: {
    breadcrumbItems: [
      { name: "Home", href: "/" },
      { name: "Capabilities", href: "/capabilities" },
      { name: "Music Generation", href: "/capabilities/music-generation" },
    ],
    lastUpdatedLabel: "April 5, 2026",
    eyebrow: "Capabilities",
    title: "Music Generation",
    intro:
      "AnyCap music generation gives agents one CLI for prompt-based music workflows. Agents can create background tracks, instrumental drafts, and soundtrack concepts through one interface instead of wiring a separate text-to-music API. That makes music generation easier to plug into the same agent workflow that already handles image generation, video generation, and media analysis.",
    summaryEyebrow: "Answer-first summary",
    summaryBody:
      "AnyCap currently exposes prompt-based music generation through ElevenLabs Music. Use it when the same agent that already creates visuals or clips also needs a fast soundtrack draft without switching to a separate audio toolchain.",
    modelSectionTitle: "Supported model",
    tableHeaders: ["Model", "Model ID", "Modes", "Best fit"],
    usageTitle: "CLI usage",
    usageExamples: [
      {
        title: "Prompt-based music generation",
        code: 'anycap music generate --prompt "lofi night drive with soft synths and a steady pulse" --model elevanlabs-music -o track.mp3',
      },
      {
        title: "Instrumental generation",
        code: 'anycap music generate --prompt "minimal ambient soundtrack with no vocals" --model elevanlabs-music -o ambient.mp3',
      },
      {
        title: "Discover music models",
        code: "anycap music models",
      },
    ],
    useCasesTitle: "When agents need music generation",
    useCases: [
      "Generate background tracks for product demos, launch videos, and changelog content.",
      "Create instrumental loops for prototypes, trailers, and lightweight marketing workflows.",
      "Keep music generation inside the same CLI workflow as image, video, and analysis tasks.",
      "Produce draft audio quickly before deciding whether a project needs a higher-touch production pass.",
    ],
    relatedPagesTitle: "Related pages",
    relatedPages: [
      {
        href: "/pricing",
        eyebrow: "Pricing",
        title: "Pricing",
        body: "See credit usage for music generation alongside the rest of the capability stack.",
      },
      {
        href: "/models/elevenlabs-music",
        eyebrow: "Model",
        title: "ElevenLabs Music",
        body: "Read the model guide for prompt-based soundtrack generation through AnyCap.",
      },
      {
        href: "/capabilities/video-generation",
        eyebrow: "Related capability",
        title: "Video Generation",
        body: "Pair soundtrack generation with video workflows when the agent is creating short clips.",
      },
      {
        href: "/cli",
        eyebrow: "CLI",
        title: "AnyCap CLI",
        body: "Explore the broader command surface that keeps music, image, video, and analysis in one runtime.",
      },
    ],
    faqTitle: "FAQ",
    faqItems: [
      {
        question: "What does AnyCap music generation let agents do?",
        answer:
          "It gives agents one command surface for prompt-based music generation. Teams can create draft tracks, instrumental backgrounds, and style-based audio outputs without integrating a separate music generation API.",
      },
      {
        question: "Is this page about a music generation API or a CLI workflow?",
        answer:
          "It is both. Teams often search for a music generation API or text-to-music API, while agent execution usually happens through the AnyCap CLI.",
      },
      {
        question: "Which market language fits this capability best?",
        answer:
          "The best supporting phrases are music generation API, text-to-music API, and AI music API. Music generation is the cleanest capability label, while the API phrasing matches the way teams usually search.",
      },
      {
        question: "When should music generation live in the same runtime as other capabilities?",
        answer:
          "When the same agent is already creating visuals, demos, or product assets. Keeping music generation in the same runtime makes it easier to move from image and video creation into soundtrack generation without changing tools.",
      },
    ],
    modelBestFor: "Prompt-based soundtrack drafts and background music inside the same agent runtime",
    capabilityGuide: {
      headline: "Music Generation API for AI agents - Text-to-music through one CLI",
      description:
        "Capability guide for adding music generation to AI agents through AnyCap, including prompt-based track generation and instrumental workflows.",
      about: ["Music generation", "Text-to-music API", "AI music API", "AnyCap"],
      keywords: [
        "music generation api",
        "text to music api",
        "music generation for ai agents",
        "ai music api",
      ],
    },
  },
  "pt-br": {
    breadcrumbItems: [
      { name: "Início", href: "/" },
      { name: "Capacidades", href: "/capabilities" },
      { name: "Geração de Música", href: "/capabilities/music-generation" },
    ],
    lastUpdatedLabel: "5 de abril de 2026",
    eyebrow: "Capacidades",
    title: "Geração de Música",
    intro:
      "A geração de música do AnyCap dá aos agentes uma única CLI para fluxos musicais baseados em prompt. Os agentes podem criar trilhas de fundo, rascunhos instrumentais e conceitos de trilha sonora por uma única interface, em vez de integrar uma API separada de texto para música. Isso facilita encaixar geração de música no mesmo fluxo de agente que já cuida de geração de imagem, geração de vídeo e análise de mídia.",
    summaryEyebrow: "Resumo direto",
    summaryBody:
      "Hoje o AnyCap expõe geração de música por prompt via ElevenLabs Music. Use isso quando o mesmo agente que já cria visuais ou clipes também precisar de um rascunho rápido de trilha sonora sem mudar para outra cadeia de ferramentas de áudio.",
    modelSectionTitle: "Modelo compatível",
    tableHeaders: ["Modelo", "ID do modelo", "Modos", "Melhor uso"],
    usageTitle: "Uso pela CLI",
    usageExamples: [
      {
        title: "Geração de música por prompt",
        code: 'anycap music generate --prompt "lofi night drive with soft synths and a steady pulse" --model elevanlabs-music -o track.mp3',
      },
      {
        title: "Geração instrumental",
        code: 'anycap music generate --prompt "minimal ambient soundtrack with no vocals" --model elevanlabs-music -o ambient.mp3',
      },
      {
        title: "Descobrir modelos de música",
        code: "anycap music models",
      },
    ],
    useCasesTitle: "Quando agentes precisam de geração de música",
    useCases: [
      "Gerar trilhas de fundo para demos de produto, vídeos de lançamento e conteúdo de changelog.",
      "Criar loops instrumentais para protótipos, trailers e fluxos leves de marketing.",
      "Manter a geração de música dentro do mesmo fluxo de CLI usado para imagem, vídeo e análise.",
      "Produzir rascunhos de áudio rapidamente antes de decidir se o projeto precisa de uma produção mais elaborada.",
    ],
    relatedPagesTitle: "Páginas relacionadas",
    relatedPages: [
      {
        href: "/pricing",
        eyebrow: "Preços",
        title: "Preços",
        body: "Veja o uso de créditos para geração de música junto com o restante da stack de capacidades.",
      },
      {
        href: "/models/elevenlabs-music",
        eyebrow: "Modelo",
        title: "ElevenLabs Music",
        body: "Leia o guia do modelo para geração de trilha sonora por prompt via AnyCap.",
      },
      {
        href: "/capabilities/video-generation",
        eyebrow: "Capacidade relacionada",
        title: "Geração de Vídeo",
        body: "Combine trilha sonora com fluxos de vídeo quando o agente estiver criando clipes curtos.",
      },
      {
        href: "/cli",
        eyebrow: "CLI",
        title: "AnyCap CLI",
        body: "Explore a superfície de comandos mais ampla que mantém música, imagem, vídeo e análise em um único runtime.",
      },
    ],
    faqTitle: "FAQ",
    faqItems: [
      {
        question: "O que a geração de música do AnyCap permite que agentes façam?",
        answer:
          "Ela dá aos agentes uma única superfície de comando para geração de música por prompt. Times podem criar faixas de rascunho, fundos instrumentais e saídas de áudio baseadas em estilo sem integrar uma API separada de geração de música.",
      },
      {
        question: "Esta página é sobre API de geração de música ou sobre fluxo em CLI?",
        answer:
          "Os dois. Times costumam buscar por API de geração de música ou API de texto para música, enquanto a execução do agente geralmente acontece pela CLI do AnyCap.",
      },
      {
        question: "Qual linguagem de mercado descreve melhor essa capacidade?",
        answer:
          "As melhores expressões de apoio são API de geração de música, API de texto para música e API de música com IA. Geração de música é o rótulo de capacidade mais limpo, enquanto a linguagem de API combina melhor com a forma como times costumam pesquisar.",
      },
      {
        question: "Quando a geração de música deve ficar no mesmo runtime que outras capacidades?",
        answer:
          "Quando o mesmo agente já está criando visuais, demos ou ativos de produto. Manter geração de música no mesmo runtime facilita passar da criação de imagem e vídeo para geração de trilha sonora sem trocar de ferramenta.",
      },
    ],
    modelBestFor: "Rascunhos de trilha sonora por prompt e música de fundo dentro do mesmo runtime de agente",
    capabilityGuide: {
      headline: "API de geração de música para agentes de IA - Texto para música em uma única CLI",
      description:
        "Guia de capacidade para adicionar geração de música a agentes de IA com AnyCap, incluindo geração de faixas por prompt e fluxos instrumentais.",
      about: ["Geração de música", "API de texto para música", "API de música com IA", "AnyCap"],
      keywords: [
        "api de geração de música",
        "api de texto para música",
        "geração de música para agentes de ia",
        "api de música com ia",
      ],
    },
  },
  id: {
    breadcrumbItems: [
      { name: "Beranda", href: "/" },
      { name: "Kapabilitas", href: "/capabilities" },
      { name: "Generasi Musik", href: "/capabilities/music-generation" },
    ],
    lastUpdatedLabel: "5 April 2026",
    eyebrow: "Kapabilitas",
    title: "Generasi Musik",
    intro:
      "Fitur generasi musik di AnyCap memberi agen satu CLI untuk workflow musik berbasis prompt. Agen bisa membuat musik latar, draf instrumental, dan konsep soundtrack lewat satu antarmuka, tanpa merangkai API teks-ke-musik terpisah. Ini memudahkan tim menjaga workflow musik tetap satu alur dengan generasi gambar, generasi video, dan analisis media.",
    summaryEyebrow: "Ringkasan cepat",
    summaryBody:
      "Saat ini AnyCap menyediakan generasi musik berbasis prompt melalui ElevenLabs Music. Gunakan saat agen yang sama sudah membuat visual atau klip dan juga butuh draf soundtrack cepat tanpa pindah ke toolchain audio lain.",
    modelSectionTitle: "Model yang didukung",
    tableHeaders: ["Model", "ID Model", "Mode", "Cocok untuk"],
    usageTitle: "Penggunaan CLI",
    usageExamples: [
      {
        title: "Generasi musik berbasis prompt",
        code: 'anycap music generate --prompt "lofi night drive with soft synths and a steady pulse" --model elevanlabs-music -o track.mp3',
      },
      {
        title: "Generasi instrumental",
        code: 'anycap music generate --prompt "minimal ambient soundtrack with no vocals" --model elevanlabs-music -o ambient.mp3',
      },
      {
        title: "Lihat model musik yang tersedia",
        code: "anycap music models",
      },
    ],
    useCasesTitle: "Kapan agen butuh generasi musik",
    useCases: [
      "Membuat musik latar untuk demo produk, video rilis, dan konten changelog.",
      "Membuat loop instrumental untuk prototipe, trailer, dan workflow marketing ringan.",
      "Menjaga generasi musik tetap di workflow CLI yang sama dengan tugas gambar, video, dan analisis.",
      "Membuat draf audio dengan cepat sebelum memutuskan apakah proyek perlu produksi tingkat lanjut.",
    ],
    relatedPagesTitle: "Halaman terkait",
    relatedPages: [
      {
        href: "/pricing",
        eyebrow: "Pricing",
        title: "Pricing",
        body: "Lihat penggunaan kredit untuk generasi musik bersama seluruh stack kapabilitas lainnya.",
      },
      {
        href: "/models/elevenlabs-music",
        eyebrow: "Model",
        title: "ElevenLabs Music",
        body: "Pelajari panduan model untuk workflow soundtrack berbasis prompt lewat AnyCap.",
      },
      {
        href: "/capabilities/video-generation",
        eyebrow: "Kapabilitas terkait",
        title: "Generasi Video",
        body: "Padukan pembuatan soundtrack dengan workflow video saat agen membuat klip pendek.",
      },
      {
        href: "/cli",
        eyebrow: "CLI",
        title: "AnyCap CLI",
        body: "Lihat surface perintah yang menyatukan musik, gambar, video, dan analisis dalam satu runtime.",
      },
    ],
    faqTitle: "FAQ",
    faqItems: [
      {
        question: "Apa yang bisa dilakukan agen dengan generasi musik AnyCap?",
        answer:
          "Agen mendapat satu surface perintah untuk generasi musik berbasis prompt. Tim bisa membuat track draf, latar instrumental, dan output audio berbasis style tanpa integrasi API generasi musik terpisah.",
      },
      {
        question: "Halaman ini membahas API generasi musik atau workflow CLI?",
        answer:
          "Keduanya. Tim sering mencari kata kunci API generasi musik atau API teks-ke-musik, sementara eksekusi agen biasanya berjalan lewat AnyCap CLI.",
      },
      {
        question: "Istilah pasar apa yang paling cocok untuk kapabilitas ini?",
        answer:
          "Istilah pendukung yang paling relevan adalah API generasi musik, API teks-ke-musik, dan AI music API. Label kapabilitas yang paling jelas tetap generasi musik, sementara frasa API sesuai pola pencarian tim.",
      },
      {
        question: "Kapan generasi musik sebaiknya tetap di runtime yang sama dengan kapabilitas lain?",
        answer:
          "Saat agen yang sama sudah menangani visual, demo, atau aset produk. Menjaga generasi musik di runtime yang sama membuat transisi dari gambar dan video ke soundtrack lebih cepat tanpa ganti alat.",
      },
    ],
    modelBestFor: "Draf soundtrack berbasis prompt dan musik latar di runtime agen yang sama",
    capabilityGuide: {
      headline: "API generasi musik untuk agen AI - teks-ke-musik lewat satu CLI",
      description:
        "Panduan kapabilitas untuk menambahkan generasi musik ke agen AI melalui AnyCap, termasuk pembuatan track berbasis prompt dan workflow instrumental.",
      about: ["Generasi musik", "API teks-ke-musik", "AI music API", "AnyCap"],
      keywords: [
        "api generasi musik",
        "api teks ke musik",
        "generasi musik untuk agen ai",
        "ai music api",
      ],
    },
  },
  de: {
    breadcrumbItems: [
      { name: "Startseite", href: "/" },
      { name: "Capabilities", href: "/capabilities" },
      { name: "Musikgenerierung", href: "/capabilities/music-generation" },
    ],
    lastUpdatedLabel: "5. April 2026",
    eyebrow: "Capabilities",
    title: "Musikgenerierung",
    intro:
      "Mit der AnyCap-Musikgenerierung erhalten Agenten eine CLI für Prompt-basierte Musik-Workflows. Agenten können Hintergrund-Tracks, Instrumental-Entwürfe und Soundtrack-Konzepte über eine Schnittstelle erstellen, statt eine separate Text-to-Music-API zu verdrahten. So lässt sich Musikgenerierung in denselben Agenten-Workflow integrieren, der bereits Bildgenerierung, Videogenerierung und Medienanalyse abdeckt.",
    summaryEyebrow: "Kurz vorab",
    summaryBody:
      "AnyCap stellt aktuell Prompt-basierte Musikgenerierung über ElevenLabs Music bereit. Setzen Sie sie ein, wenn derselbe Agent, der bereits Visuals oder Clips erzeugt, auch einen schnellen Soundtrack-Entwurf braucht, ohne in eine separate Audio-Toolchain zu wechseln.",
    modelSectionTitle: "Unterstütztes Modell",
    tableHeaders: ["Modell", "Modell-ID", "Modi", "Geeignet für"],
    usageTitle: "CLI-Nutzung",
    usageExamples: [
      {
        title: "Prompt-basierte Musikgenerierung",
        code: 'anycap music generate --prompt "lofi night drive with soft synths and a steady pulse" --model elevanlabs-music -o track.mp3',
      },
      {
        title: "Instrumental-Generierung",
        code: 'anycap music generate --prompt "minimal ambient soundtrack with no vocals" --model elevanlabs-music -o ambient.mp3',
      },
      {
        title: "Musikmodelle entdecken",
        code: "anycap music models",
      },
    ],
    useCasesTitle: "Wann Agenten Musikgenerierung brauchen",
    useCases: [
      "Hintergrund-Tracks für Produkt-Demos, Launch-Videos und Changelog-Inhalte erzeugen.",
      "Instrumental-Loops für Prototypen, Trailer und schlanke Marketing-Workflows erstellen.",
      "Musikgenerierung im selben CLI-Workflow halten wie Bild-, Video- und Analyseaufgaben.",
      "Schnell Audio-Entwürfe produzieren, bevor entschieden wird, ob ein Projekt eine aufwendigere Produktion benötigt.",
    ],
    relatedPagesTitle: "Verwandte Seiten",
    relatedPages: [
      {
        href: "/pricing",
        eyebrow: "Pricing",
        title: "Preise",
        body: "Sehen Sie den Credit-Verbrauch für Musikgenerierung neben dem Rest des Capability-Stacks.",
      },
      {
        href: "/models/elevenlabs-music",
        eyebrow: "Modell",
        title: "ElevenLabs Music",
        body: "Lesen Sie den Modell-Leitfaden für Prompt-basierte Soundtrack-Generierung über AnyCap.",
      },
      {
        href: "/capabilities/video-generation",
        eyebrow: "Verwandte Capability",
        title: "Videogenerierung",
        body: "Kombinieren Sie Soundtrack-Generierung mit Video-Workflows, wenn der Agent kurze Clips erstellt.",
      },
      {
        href: "/cli",
        eyebrow: "CLI",
        title: "AnyCap CLI",
        body: "Erkunden Sie die breitere Befehlsoberfläche, die Musik, Bild, Video und Analyse in einer Runtime hält.",
      },
    ],
    faqTitle: "FAQ",
    faqItems: [
      {
        question: "Was ermöglicht die AnyCap-Musikgenerierung Agenten?",
        answer:
          "Sie gibt Agenten eine einzige Befehlsoberfläche für Prompt-basierte Musikgenerierung. Teams können Track-Entwürfe, Instrumental-Hintergründe und stilbasierte Audio-Outputs erstellen, ohne eine separate Musikgenerierungs-API zu integrieren.",
      },
      {
        question: "Geht es auf dieser Seite um eine Musikgenerierungs-API oder einen CLI-Workflow?",
        answer:
          "Beides. Teams suchen oft nach einer Musikgenerierungs-API oder Text-to-Music-API, während die Agenten-Ausführung meist über die AnyCap-CLI läuft.",
      },
      {
        question: "Welche Marktbegriffe passen am besten zu dieser Capability?",
        answer:
          "Die besten unterstützenden Begriffe sind Musikgenerierungs-API, Text-to-Music-API und AI-Music-API. Musikgenerierung ist das klarste Capability-Label, während die API-Formulierung dem Suchverhalten von Teams entspricht.",
      },
      {
        question: "Wann sollte Musikgenerierung in derselben Runtime wie andere Capabilities laufen?",
        answer:
          "Wenn derselbe Agent bereits Visuals, Demos oder Produkt-Assets erstellt. Musikgenerierung in derselben Runtime zu halten erleichtert den Übergang von Bild- und Videogenerierung zur Soundtrack-Generierung, ohne das Tool zu wechseln.",
      },
    ],
    modelBestFor: "Prompt-basierte Soundtrack-Entwürfe und Hintergrundmusik in derselben Agenten-Runtime",
    capabilityGuide: {
      headline: "Musikgenerierungs-API für KI-Agenten – Text-to-Music über eine CLI",
      description:
        "Capability-Leitfaden zum Hinzufügen von Musikgenerierung zu KI-Agenten über AnyCap, einschließlich Prompt-basierter Track-Generierung und Instrumental-Workflows.",
      about: ["Musikgenerierung", "Text-to-music API", "AI music API", "AnyCap"],
      keywords: [
        "music generation api",
        "text to music api",
        "musikgenerierung für ki-agenten",
        "ai music api",
      ],
    },
  },
};

const localizedContentByLocale: Record<SiteLocale, MusicGenerationPageContent> =
  contentByLocale as Record<SiteLocale, MusicGenerationPageContent>;

const metadataByLocale: Record<
  SiteLocale,
  { title: string; description: string; openGraphTitle: string; openGraphDescription: string }
> = {
  en: {
    title: "Music Generation API for AI agents - Text-to-music through one CLI",
    description:
      "Give AI agents music generation through AnyCap. Generate instrumental tracks and custom music prompts through one CLI instead of wiring a separate music generation API.",
    openGraphTitle: "Music Generation API for AI agents - Text-to-music through one CLI",
    openGraphDescription:
      "Add music generation to AI agents with one CLI, one auth flow, and one capability runtime.",
  },
  "pt-br": {
    title: "API de geração de música para agentes de IA - Texto para música em uma única CLI",
    description:
      "Dê geração de música para agentes de IA com AnyCap. Gere faixas instrumentais e prompts musicais personalizados por uma única CLI, sem integrar uma API separada de geração de música.",
    openGraphTitle: "API de geração de música para agentes de IA - Texto para música em uma única CLI",
    openGraphDescription:
      "Adicione geração de música a agentes de IA com uma CLI, um fluxo de autenticação e um runtime de capacidades.",
  },
  id: {
    title: "API generasi musik untuk agen AI - teks-ke-musik lewat satu CLI",
    description:
      "Tambahkan generasi musik ke agen AI lewat AnyCap. Buat track instrumental dan prompt musik kustom melalui satu CLI tanpa perlu merangkai API generasi musik terpisah.",
    openGraphTitle: "API generasi musik untuk agen AI - teks-ke-musik lewat satu CLI",
    openGraphDescription:
      "Tambahkan generasi musik ke agen AI dengan satu CLI, satu alur autentikasi, dan satu runtime kapabilitas.",
  },
  de: {
    title: "Musikgenerierungs-API für KI-Agenten – Text-to-Music über eine CLI",
    description:
      "Geben Sie KI-Agenten Musikgenerierung über AnyCap. Erzeugen Sie Instrumental-Tracks und individuelle Musik-Prompts über eine einzige CLI, statt eine separate Musikgenerierungs-API zu verdrahten.",
    openGraphTitle: "Musikgenerierungs-API für KI-Agenten – Text-to-Music über eine CLI",
    openGraphDescription:
      "Statten Sie KI-Agenten mit Musikgenerierung über eine CLI, einen Auth-Flow und eine Capability-Runtime aus.",
  },
};

function getPageMetadata(locale: SiteLocale): Metadata {
  const localizedMetadata = metadataByLocale[locale] ?? metadataByLocale[defaultLocale];

  return {
    title: localizedMetadata.title,
    description: localizedMetadata.description,
    alternates: { canonical: "/capabilities/music-generation" },
    openGraph: {
      type: "website",
      locale: getLocaleConfig(locale).ogLocale,
      url: "/capabilities/music-generation",
      siteName: siteConfig.siteName,
      title: localizedMetadata.openGraphTitle,
      description: localizedMetadata.openGraphDescription,
    },
  };
}

export const metadata: Metadata = getPageMetadata(defaultLocale);

export default async function MusicGenerationPage() {
  const locale = await getRequestLocale();
  const content = localizedContentByLocale[locale] ?? localizedContentByLocale.en;
  const capabilityGuideJsonLd = createTechArticleJsonLd({
    headline: content.capabilityGuide.headline,
    description: content.capabilityGuide.description,
    path: "/capabilities/music-generation",
    about: content.capabilityGuide.about,
    keywords: content.capabilityGuide.keywords,
    dateModified: lastUpdatedIso,
  });
  const faqJsonLd = createFaqPageJsonLd(content.faqItems);
  const localizedModels = models[locale].length > 0 ? models[locale] : models.en;

  return (
    <>
      <BreadcrumbJsonLd items={content.breadcrumbItems} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(capabilityGuideJsonLd) }}
      />
      {hasJsonLdContent(faqJsonLd) ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      ) : null}

      <article className="px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-[1280px] py-12 md:py-20 lg:py-24">
          <FadeIn>
            <p className="mb-4 text-[11px] tracking-[0.8px] text-[#6b7d3a]" style={mono}>
              {content.eyebrow}
            </p>
            <p className="text-[11px] text-[#5a5e52] tracking-[0.5px] mb-3" style={mono}>
              {locale === "pt-br"
                ? "Atualizado em"
                : locale === "id"
                  ? "Diperbarui"
                  : locale === "de"
                    ? "Zuletzt aktualisiert"
                    : "Last updated"}{" "}
              {content.lastUpdatedLabel}
            </p>
            <h1
              className="leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(32px, 6vw, 72px)" }}
            >
              {content.title}
            </h1>
            <p className="mt-6 max-w-[780px] text-base leading-7 text-[#4d5145] md:text-lg">
              {content.intro}
            </p>
            <div className="mt-8 max-w-[860px] border border-[#d4dbb8] bg-[#f9faf5]/80 p-6">
              <p className="mb-3 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                {content.summaryEyebrow}
              </p>
              <p className="text-sm leading-6 text-[#4d5145]">{content.summaryBody}</p>
            </div>
          </FadeIn>

          <FadeIn className="mt-8">
            <EarlyAccessBanner />
          </FadeIn>

          <FadeIn className="mt-10">
            <MusicGenDemo />
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-8 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {content.modelSectionTitle}
              </h2>
              <div className="overflow-x-auto rounded-xl border border-[#d4dbb8]">
                <table className="w-full text-left">
                  <thead className="bg-[#f9faf5]">
                    <tr className="border-b border-[#d4dbb8]">
                      {content.tableHeaders.map((header) => (
                        <th
                          key={header}
                          className="px-5 py-3 text-[11px] tracking-[0.5px] text-[#5a5e52]"
                          style={mono}
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {localizedModels.map((model) => (
                      <tr key={model.modelId} className="border-b border-[#d4dbb8]/50 last:border-b-0">
                        <td className="px-5 py-4 text-sm font-medium text-[#1c1f17]">
                          <Link href={model.href} className="transition-colors hover:text-[#6b7d3a]">
                            {model.name}
                          </Link>
                        </td>
                        <td className="px-5 py-4 text-sm text-[#4d5145]" style={mono}>
                          {model.modelId}
                        </td>
                        <td className="px-5 py-4 text-sm text-[#4d5145]">{model.modes}</td>
                        <td className="px-5 py-4 text-sm text-[#4d5145]">{model.bestFor}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-6 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {content.usageTitle}
              </h2>
              <div className="max-w-[860px] space-y-6">
                {content.usageExamples.map((example) => (
                  <div key={example.title}>
                    <p className="mb-3 text-[11px] tracking-[0.5px] text-[#5a5e52]" style={mono}>
                      {example.title}
                    </p>
                    <div className="bg-[#1c1f17] px-5 py-4">
                      <p className="break-all text-[13px] text-[#d4e0a4]" style={mono}>
                        {example.code}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-6 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {content.useCasesTitle}
              </h2>
              <div className="grid max-w-[920px] gap-4 sm:grid-cols-2">
                {content.useCases.map((useCase) => (
                  <div key={useCase} className="border-l-[3px] border-[#6b7d3a] pl-5">
                    <p className="text-sm leading-6 text-[#4d5145]">{useCase}</p>
                  </div>
                ))}
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-8 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {content.relatedPagesTitle}
              </h2>
              <div className="grid max-w-[1100px] gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {content.relatedPages.map((page) => (
                  <Link
                    key={page.href}
                    href={page.href}
                    className="rounded-xl border border-[#d4dbb8] p-5 transition-colors hover:border-[#6b7d3a]"
                  >
                    <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                      {page.eyebrow}
                    </p>
                    <h3 className="mb-2 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                      {page.title}
                    </h3>
                    <p className="text-sm leading-6 text-[#4d5145]">{page.body}</p>
                  </Link>
                ))}
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-8 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {content.faqTitle}
              </h2>
              <div className="max-w-[860px] space-y-6">
                {content.faqItems.map((item) => (
                  <div key={item.question} className="rounded-xl border border-[#d4dbb8] p-5">
                    <h3 className="mb-2 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                      {item.question}
                    </h3>
                    <p className="text-sm leading-6 text-[#4d5145]">{item.answer}</p>
                  </div>
                ))}
              </div>
            </section>
          </FadeIn>
        </div>
      </article>
    </>
  );
}
