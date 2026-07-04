import type { Metadata } from "next";
import { AudioReadDemo } from "@/components/landing/AudioReadDemo";
import { CapabilityDetailPage } from "@/components/seo/CapabilityDetailPage";
import { createFaqPageJsonLd, createTechArticleJsonLd } from "@/lib/schema";
import { getRequestLocale } from "@/lib/request-locale";
import { defaultLocale, getLocaleConfig, siteConfig, type SiteLocale } from "@/lib/site";

export const runtime = "edge";

const PAGE_LAST_MODIFIED_ISO = "2026-04-13";

const metadataByLocale: Record<
  SiteLocale,
  { title: string; description: string; openGraphTitle: string; openGraphDescription: string }
> = {
  en: {
    title: "Audio Analysis API for AI agents - Audio understanding and transcription",
    description:
      "Give AI agents audio understanding through AnyCap. Analyze recordings, transcribe spoken content, and extract audio context through one CLI command instead of wiring a separate audio analysis stack.",
    openGraphTitle: "Audio Analysis API for AI agents - Audio understanding and transcription",
    openGraphDescription:
      "Add audio understanding, transcription, and audio analysis to AI agents with one CLI.",
  },
  "pt-br": {
    title: "API de analise de audio para agentes de IA - entendimento de audio e transcricao",
    description:
      "Dê entendimento de audio para agentes de IA com AnyCap. Analise gravacoes, transcreva conteudo falado e extraia contexto por um unico comando de CLI, sem montar uma stack separada.",
    openGraphTitle: "API de analise de audio para agentes de IA - entendimento de audio e transcricao",
    openGraphDescription:
      "Adicione entendimento de audio, transcricao e analise de audio a agentes de IA com uma unica CLI.",
  },
  id: {
    title: "API analisis audio untuk agen AI - pemahaman audio dan transkripsi",
    description:
      "Berikan pemahaman audio ke agen AI melalui AnyCap. Analisis rekaman, transkripsikan percakapan, dan ambil konteks audio lewat satu perintah CLI tanpa merangkai stack analisis audio terpisah.",
    openGraphTitle: "API analisis audio untuk agen AI - pemahaman audio dan transkripsi",
    openGraphDescription:
      "Tambahkan pemahaman audio, transkripsi, dan analisis audio ke agen AI lewat satu CLI.",
  },
  de: {
    title: "Audioanalyse-API für KI-Agenten – Audioverständnis und Transkription",
    description:
      "Geben Sie KI-Agenten Audioverständnis über AnyCap. Analysieren Sie Aufnahmen, transkribieren Sie gesprochene Inhalte und extrahieren Sie Audio-Kontext über einen einzigen CLI-Befehl, statt einen separaten Audio-Analyse-Stack zu verdrahten.",
    openGraphTitle: "Audioanalyse-API für KI-Agenten – Audioverständnis und Transkription",
    openGraphDescription:
      "Statten Sie KI-Agenten mit Audioverständnis, Transkription und Audioanalyse über eine einzige CLI aus.",
  },
};

function getPageMetadata(locale: SiteLocale): Metadata {
  const localizedMetadata = metadataByLocale[locale] ?? metadataByLocale[defaultLocale];
  return {
    title: localizedMetadata.title,
    description: localizedMetadata.description,
    alternates: { canonical: "/capabilities/audio-understanding" },
    openGraph: {
      type: "website",
      locale: getLocaleConfig(locale).ogLocale,
      url: "/capabilities/audio-understanding",
      siteName: siteConfig.siteName,
      title: localizedMetadata.openGraphTitle,
      description: localizedMetadata.openGraphDescription,
    },
  };
}

export const metadata: Metadata = getPageMetadata(defaultLocale);

type PageContent = {
  breadcrumb: { name: string; href?: string }[];
  eyebrow: string;
  title: string;
  intro: string;
  usageHeading: string;
  usageExamples: readonly { title: string; code: string }[];
  useCasesHeading: string;
  useCases: readonly string[];
  relatedHeading: string;
  relatedPages: readonly {
    href: string;
    eyebrow: string;
    title: string;
    body: string;
  }[];
  faqHeading: string;
  faqItems: readonly { question: string; answer: string }[];
  jsonLdHeadline: string;
  jsonLdDescription: string;
  jsonLdAbout: readonly string[];
  jsonLdKeywords: readonly string[];
};

const contentByLocale: Record<SiteLocale, PageContent> = {
  en: {
    breadcrumb: [
      { name: "Home", href: "/" },
      { name: "Capabilities", href: "/capabilities" },
      { name: "Audio Understanding" },
    ],
    eyebrow: "Capabilities",
    title: "Audio Understanding",
    intro:
      "AnyCap gives agents a consistent audio understanding layer for meetings, podcasts, interviews, and voice notes. Instead of wiring a separate audio analysis API or transcription stack for each workflow, the agent gets one command surface for extracting spoken context, summaries, and structured takeaways through the same runtime used for the rest of the capability stack.",
    usageHeading: "CLI usage",
    usageExamples: [
      {
        title: "Analyze a local recording",
        code: "anycap actions audio-read --file ./meeting.mp3",
      },
      {
        title: "Summarize a podcast clip",
        code:
          'anycap actions audio-read --url https://example.com/podcast.mp3 --instruction "Summarize the main topics and action items"',
      },
      {
        title: "Extract spoken content",
        code:
          'anycap actions audio-read --file ./interview.wav --instruction "Transcribe the key quotes and speaker claims"',
      },
    ],
    useCasesHeading: "When agents need audio understanding",
    useCases: [
      "Transcribe meetings, interviews, and podcast clips inside an agent workflow.",
      "Extract action items and summaries from spoken content before creating follow-up docs.",
      "Review support calls or voice notes through the same capability runtime used for image and video analysis.",
      "Turn audio files into structured context an agent can reuse in research, planning, or reporting tasks.",
    ],
    relatedHeading: "Related pages",
    relatedPages: [
      {
        href: "/pricing",
        eyebrow: "Pricing",
        title: "Pricing",
        body: "See how audio understanding is priced alongside image, video, search, and crawl.",
      },
      {
        href: "/capabilities/video-analysis",
        eyebrow: "Related capability",
        title: "Video Analysis",
        body: "Pair audio and video analysis when recordings contain both visual and spoken context.",
      },
      {
        href: "/cli",
        eyebrow: "CLI",
        title: "AnyCap CLI",
        body: "Explore the command surface that keeps transcription and analysis in one runtime.",
      },
    ],
    faqHeading: "FAQ",
    faqItems: [
      {
        question: "What does AnyCap audio understanding let agents do?",
        answer:
          "It gives agents one interface for audio analysis across meetings, podcasts, interviews, and voice notes. In practice that means one CLI surface for transcription, summary, and targeted audio question answering.",
      },
      {
        question: "Is this page really about an audio analysis API?",
        answer:
          "Yes. Audio understanding is the capability label, while audio analysis API, audio transcription API, and speech-to-text API are the adjacent market phrases teams often use during evaluation.",
      },
      {
        question: "Why use audio understanding through the same runtime as image and video analysis?",
        answer:
          "Because many workflows mix media types. A single runtime makes it easier for an agent to move from screenshots to recordings to audio files without switching tools or auth flows.",
      },
      {
        question: "Does this replace text-to-speech?",
        answer:
          "No. Audio understanding is about reading and analyzing audio. Text-to-speech is a separate speech output capability and still belongs to a different SEO theme.",
      },
    ],
    jsonLdHeadline: "Audio Analysis API for AI agents - Audio understanding and transcription",
    jsonLdDescription:
      "Capability guide for adding audio understanding to AI agents through AnyCap, including recordings, transcripts, summaries, and audio analysis workflows.",
    jsonLdAbout: ["Audio analysis", "Audio understanding", "Transcription API", "AnyCap"],
    jsonLdKeywords: [
      "audio analysis api",
      "audio understanding for ai agents",
      "audio transcription api",
      "speech to text api",
    ],
  },
  "pt-br": {
    breadcrumb: [
      { name: "Inicio", href: "/" },
      { name: "Capacidades", href: "/capabilities" },
      { name: "Entendimento de audio" },
    ],
    eyebrow: "Capacidades",
    title: "Entendimento de audio",
    intro:
      "O AnyCap da aos agentes uma camada consistente de entendimento de audio para reunioes, podcasts, entrevistas e notas de voz. Em vez de integrar uma API separada de analise de audio ou uma stack propria de transcricao para cada fluxo, o agente recebe uma unica superficie de comando para extrair contexto falado, resumos e conclusoes estruturadas dentro do mesmo runtime usado no resto da stack de capabilities.",
    usageHeading: "Uso via CLI",
    usageExamples: [
      {
        title: "Analise uma gravacao local",
        code: "anycap actions audio-read --file ./meeting.mp3",
      },
      {
        title: "Resuma um trecho de podcast",
        code:
          'anycap actions audio-read --url https://example.com/podcast.mp3 --instruction "Summarize the main topics and action items"',
      },
      {
        title: "Extraia o conteudo falado",
        code:
          'anycap actions audio-read --file ./interview.wav --instruction "Transcribe the key quotes and speaker claims"',
      },
    ],
    useCasesHeading: "Quando agentes precisam de entendimento de audio",
    useCases: [
      "Transcrever reunioes, entrevistas e trechos de podcast dentro de um fluxo de agente.",
      "Extrair acoes e resumos de conteudo falado antes de gerar documentos de acompanhamento.",
      "Revisar chamadas de suporte ou notas de voz no mesmo runtime usado para analise de imagem e video.",
      "Transformar arquivos de audio em contexto estruturado que o agente possa reutilizar em pesquisa, planejamento ou relatorios.",
    ],
    relatedHeading: "Paginas relacionadas",
    relatedPages: [
      {
        href: "/pricing",
        eyebrow: "Precos",
        title: "Precos",
        body: "Veja como o entendimento de audio e cobrado junto com imagem, video, busca e crawl.",
      },
      {
        href: "/capabilities/video-analysis",
        eyebrow: "Capability relacionada",
        title: "Analise de video",
        body: "Combine analise de audio e video quando gravacoes tiverem contexto visual e falado.",
      },
      {
        href: "/cli",
        eyebrow: "CLI",
        title: "CLI do AnyCap",
        body: "Explore a superficie de comandos que mantem transcricao e analise dentro do mesmo runtime.",
      },
    ],
    faqHeading: "FAQ",
    faqItems: [
      {
        question: "O que o entendimento de audio do AnyCap permite aos agentes fazer?",
        answer:
          "Ele da aos agentes uma unica interface para analise de audio em reunioes, podcasts, entrevistas e notas de voz. Na pratica, isso significa uma unica superficie de CLI para transcricao, resumo e perguntas direcionadas sobre o audio.",
      },
      {
        question: "Esta pagina e mesmo sobre uma API de analise de audio?",
        answer:
          "Sim. Entendimento de audio e o nome da capability, enquanto API de analise de audio, API de transcricao e speech-to-text API sao as expressoes de mercado proximas que equipes costumam usar durante a avaliacao.",
      },
      {
        question: "Por que usar entendimento de audio no mesmo runtime de imagem e video?",
        answer:
          "Porque muitos fluxos misturam diferentes tipos de midia. Um unico runtime facilita para o agente passar de screenshots para gravacoes e depois para arquivos de audio sem trocar de ferramenta nem de autenticacao.",
      },
      {
        question: "Isso substitui text-to-speech?",
        answer:
          "Nao. Entendimento de audio serve para ler e analisar audio. Text-to-speech e uma capability separada de fala e pertence a outro tema de SEO.",
      },
    ],
    jsonLdHeadline: "API de analise de audio para agentes de IA - entendimento de audio e transcricao",
    jsonLdDescription:
      "Guia de capability para adicionar entendimento de audio a agentes de IA com o AnyCap, incluindo gravacoes, transcricoes, resumos e fluxos de analise de audio.",
    jsonLdAbout: ["Analise de audio", "Entendimento de audio", "API de transcricao", "AnyCap"],
    jsonLdKeywords: [
      "api de analise de audio",
      "entendimento de audio para agentes de ia",
      "api de transcricao de audio",
      "speech to text api",
    ],
  },
  id: {
    breadcrumb: [
      { name: "Beranda", href: "/" },
      { name: "Kapabilitas", href: "/capabilities" },
      { name: "Pemahaman Audio" },
    ],
    eyebrow: "Kapabilitas",
    title: "Pemahaman Audio",
    intro:
      "AnyCap memberi agen lapisan pemahaman audio yang konsisten untuk meeting, podcast, wawancara, dan voice note. Daripada merangkai API analisis audio atau stack transkripsi terpisah untuk setiap workflow, agen mendapat satu surface perintah untuk mengekstrak konteks percakapan, ringkasan, dan poin terstruktur melalui runtime yang sama dengan kapabilitas lain.",
    usageHeading: "Penggunaan CLI",
    usageExamples: [
      {
        title: "Analisis rekaman lokal",
        code: "anycap actions audio-read --file ./meeting.mp3",
      },
      {
        title: "Ringkas cuplikan podcast",
        code:
          'anycap actions audio-read --url https://example.com/podcast.mp3 --instruction "Ringkas topik utama dan action item"',
      },
      {
        title: "Ekstrak isi percakapan",
        code:
          'anycap actions audio-read --file ./interview.wav --instruction "Transkripsikan kutipan penting dan klaim narasumber"',
      },
    ],
    useCasesHeading: "Kapan agen butuh pemahaman audio",
    useCases: [
      "Mentranskripsikan meeting, wawancara, dan cuplikan podcast langsung di workflow agen.",
      "Mengambil action item dan ringkasan dari percakapan sebelum membuat dokumen tindak lanjut.",
      "Meninjau panggilan support atau voice note di runtime yang sama dengan analisis gambar dan video.",
      "Mengubah file audio menjadi konteks terstruktur yang bisa dipakai ulang untuk riset, perencanaan, atau pelaporan.",
    ],
    relatedHeading: "Halaman terkait",
    relatedPages: [
      {
        href: "/pricing",
        eyebrow: "Pricing",
        title: "Pricing",
        body: "Lihat harga pemahaman audio bersama gambar, video, search, dan crawl.",
      },
      {
        href: "/capabilities/video-analysis",
        eyebrow: "Kapabilitas terkait",
        title: "Analisis Video",
        body: "Gabungkan analisis audio dan video saat rekaman memuat konteks visual sekaligus percakapan.",
      },
      {
        href: "/cli",
        eyebrow: "CLI",
        title: "AnyCap CLI",
        body: "Lihat surface perintah yang menjaga transkripsi dan analisis tetap dalam satu runtime.",
      },
    ],
    faqHeading: "FAQ",
    faqItems: [
      {
        question: "Apa yang bisa dilakukan agen dengan pemahaman audio AnyCap?",
        answer:
          "Agen mendapat satu antarmuka untuk analisis audio dari meeting, podcast, wawancara, dan voice note. Secara praktik, ini berarti satu surface CLI untuk transkripsi, ringkasan, dan tanya-jawab terarah dari konten audio.",
      },
      {
        question: "Apakah halaman ini memang membahas API analisis audio?",
        answer:
          "Ya. Pemahaman audio adalah label kapabilitasnya, sementara API analisis audio, API transkripsi audio, dan speech-to-text API adalah istilah pasar yang biasanya dipakai tim saat evaluasi.",
      },
      {
        question: "Kenapa pemahaman audio sebaiknya satu runtime dengan analisis gambar dan video?",
        answer:
          "Karena banyak workflow menggabungkan beberapa tipe media. Runtime tunggal memudahkan agen berpindah dari screenshot ke rekaman lalu ke file audio tanpa ganti tools atau alur autentikasi.",
      },
      {
        question: "Apakah ini menggantikan text-to-speech?",
        answer:
          "Tidak. Pemahaman audio fokus pada membaca dan menganalisis audio. Text-to-speech adalah kapabilitas output suara yang berbeda dan berada pada tema SEO lain.",
      },
    ],
    jsonLdHeadline: "API analisis audio untuk agen AI - pemahaman audio dan transkripsi",
    jsonLdDescription:
      "Panduan kapabilitas untuk menambahkan pemahaman audio ke agen AI melalui AnyCap, termasuk rekaman, transkripsi, ringkasan, dan workflow analisis audio.",
    jsonLdAbout: ["Analisis audio", "Pemahaman audio", "API transkripsi", "AnyCap"],
    jsonLdKeywords: [
      "api analisis audio",
      "pemahaman audio untuk agen ai",
      "api transkripsi audio",
      "speech to text api",
    ],
  },
  de: {
    breadcrumb: [
      { name: "Startseite", href: "/" },
      { name: "Capabilities", href: "/capabilities" },
      { name: "Audioverständnis" },
    ],
    eyebrow: "Capabilities",
    title: "Audioverständnis",
    intro:
      "AnyCap gibt Agenten eine konsistente Audioverständnis-Schicht für Meetings, Podcasts, Interviews und Sprachnotizen. Statt für jeden Workflow eine separate Audioanalyse-API oder einen Transkriptions-Stack zu verdrahten, erhält der Agent eine einheitliche Befehlsoberfläche, um gesprochenen Kontext, Zusammenfassungen und strukturierte Erkenntnisse über dieselbe Runtime zu extrahieren, die auch für den restlichen Capability-Stack verwendet wird.",
    usageHeading: "CLI-Nutzung",
    usageExamples: [
      {
        title: "Lokale Aufnahme analysieren",
        code: "anycap actions audio-read --file ./meeting.mp3",
      },
      {
        title: "Podcast-Ausschnitt zusammenfassen",
        code:
          'anycap actions audio-read --url https://example.com/podcast.mp3 --instruction "Summarize the main topics and action items"',
      },
      {
        title: "Gesprochenen Inhalt extrahieren",
        code:
          'anycap actions audio-read --file ./interview.wav --instruction "Transcribe the key quotes and speaker claims"',
      },
    ],
    useCasesHeading: "Wann Agenten Audioverständnis benötigen",
    useCases: [
      "Meetings, Interviews und Podcast-Ausschnitte direkt im Agenten-Workflow transkribieren.",
      "Action Items und Zusammenfassungen aus gesprochenen Inhalten extrahieren, bevor Folgedokumente erstellt werden.",
      "Support-Calls oder Sprachnotizen über dieselbe Capability-Runtime prüfen, die auch für Bild- und Videoanalyse genutzt wird.",
      "Audio-Dateien in strukturierten Kontext verwandeln, den ein Agent für Recherche, Planung oder Reporting wiederverwenden kann.",
    ],
    relatedHeading: "Verwandte Seiten",
    relatedPages: [
      {
        href: "/pricing",
        eyebrow: "Pricing",
        title: "Preise",
        body: "So wird Audioverständnis zusammen mit Bild, Video, Suche und Crawl bepreist.",
      },
      {
        href: "/capabilities/video-analysis",
        eyebrow: "Verwandte Capability",
        title: "Videoanalyse",
        body: "Kombinieren Sie Audio- und Videoanalyse, wenn Aufnahmen sowohl visuellen als auch gesprochenen Kontext enthalten.",
      },
      {
        href: "/cli",
        eyebrow: "CLI",
        title: "AnyCap CLI",
        body: "Erkunden Sie die Befehlsoberfläche, die Transkription und Analyse in einer Runtime zusammenhält.",
      },
    ],
    faqHeading: "FAQ",
    faqItems: [
      {
        question: "Was ermöglicht das Audioverständnis von AnyCap Agenten?",
        answer:
          "Es gibt Agenten eine einheitliche Schnittstelle für Audioanalyse über Meetings, Podcasts, Interviews und Sprachnotizen hinweg. In der Praxis bedeutet das eine CLI-Oberfläche für Transkription, Zusammenfassung und gezielte Audio-Frage-Antwort.",
      },
      {
        question: "Geht es auf dieser Seite wirklich um eine Audioanalyse-API?",
        answer:
          "Ja. Audioverständnis ist die Capability-Bezeichnung, während Audio Analysis API, Audio Transcription API und Speech-to-Text API die angrenzenden Marktbegriffe sind, die Teams in der Evaluierung häufig verwenden.",
      },
      {
        question: "Warum Audioverständnis über dieselbe Runtime wie Bild- und Videoanalyse nutzen?",
        answer:
          "Weil viele Workflows Medientypen mischen. Eine einzige Runtime erleichtert es einem Agenten, von Screenshots zu Aufnahmen und Audio-Dateien zu wechseln, ohne Tools oder Auth-Flows zu wechseln.",
      },
      {
        question: "Ersetzt das Text-to-Speech?",
        answer:
          "Nein. Audioverständnis dient dem Lesen und Analysieren von Audio. Text-to-Speech ist eine separate Sprachausgabe-Capability und gehört weiterhin zu einem anderen SEO-Thema.",
      },
    ],
    jsonLdHeadline: "Audioanalyse-API für KI-Agenten – Audioverständnis und Transkription",
    jsonLdDescription:
      "Capability-Leitfaden zum Hinzufügen von Audioverständnis zu KI-Agenten über AnyCap, inklusive Aufnahmen, Transkripten, Zusammenfassungen und Audioanalyse-Workflows.",
    jsonLdAbout: ["Audioanalyse", "Audioverständnis", "Transcription API", "AnyCap"],
    jsonLdKeywords: [
      "audio analysis api",
      "audio understanding for ai agents",
      "audio transcription api",
      "speech to text api",
    ],
  },
} as const;

export default async function AudioUnderstandingPage() {
  const locale = await getRequestLocale();
  const content = contentByLocale[locale] ?? contentByLocale.en;
  const capabilityGuideJsonLd = createTechArticleJsonLd({
    headline: content.jsonLdHeadline,
    description: content.jsonLdDescription,
    path: "/capabilities/audio-understanding",
    locale,
    about: [...content.jsonLdAbout],
    keywords: [...content.jsonLdKeywords],
    datePublished: PAGE_LAST_MODIFIED_ISO,
    dateModified: PAGE_LAST_MODIFIED_ISO,
  });
  const faqJsonLd = createFaqPageJsonLd(content.faqItems);
  const useCases = content.useCases.map((useCase, index) => {
    const [title, ...rest] = useCase.split(".");
    return {
      title: title.length > 70 ? `Use case ${index + 1}` : title,
      description: rest.join(".").trim() || useCase,
    };
  });

  return (
    <CapabilityDetailPage
      breadcrumbItems={content.breadcrumb}
      jsonLd={capabilityGuideJsonLd}
      faqJsonLd={faqJsonLd}
      eyebrow={content.eyebrow}
      lastUpdatedLabel="Last updated April 13, 2026"
      title={content.title}
      accentTitle="for AI agents"
      intro={content.intro}
      searchIntents={content.jsonLdKeywords}
      actions={[
        { label: "Equip your Agent", href: "/start", primary: true },
        { label: "Video analysis", href: "/capabilities/video-analysis" },
        { label: "AnyCap CLI", href: "/cli" },
      ]}
      demo={<AudioReadDemo />}
      demoTitle="Hear the context"
      demoBody="A recording becomes transcript, summary, and structured notes in one agent flow."
      proofPoints={[
        "Meetings, interviews, podcasts, and voice notes move through one AnyCap command surface.",
        "Agents can ask targeted questions about spoken content instead of only producing a transcript.",
        "Audio understanding pairs naturally with video analysis, web research, and follow-up document workflows.",
      ]}
      summaryLabel="The short answer"
      summaryText="Use AnyCap audio understanding when an agent needs to turn recorded speech into reusable context, summaries, quotes, and action items without adding a separate transcription stack."
      workflowTitle="How audio understanding fits an AnyCap workflow"
      workflowSteps={[
        {
          title: "Read",
          body: "The agent receives a local file or URL and sends it through the AnyCap audio-read action.",
        },
        {
          title: "Structure",
          body: "The result can become a transcript, summary, quote list, action item set, or answer to a specific question.",
        },
        {
          title: "Route",
          body: "The agent can reuse the audio context in a report, research brief, support review, or multimedia analysis workflow.",
        },
      ]}
      usageTitle={content.usageHeading}
      usageExamples={content.usageExamples}
      useCasesTitle={content.useCasesHeading}
      useCases={useCases}
      relatedTitle={content.relatedHeading}
      relatedCards={content.relatedPages}
      faqTitle={content.faqHeading}
      faqItems={content.faqItems}
      finalTitle="Let your agent understand audio."
      finalBody="Start with AnyCap, point the agent at a recording, and keep transcript, summary, and follow-up work inside the same capability runtime."
    />
  );
}
