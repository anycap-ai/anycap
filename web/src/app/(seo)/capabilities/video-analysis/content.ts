import type { Metadata } from "next";
import { getLocaleConfig, siteConfig, type SiteLocale } from "@/lib/site";

export const VIDEO_ANALYSIS_PATH = "/capabilities/video-analysis";

type VideoAnalysisPageData = {
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
  usageTitle: string;
  usageExamples: readonly { title: string; code: string }[];
  scenariosTitle: string;
  scenarios: readonly { title: string; body: string }[];
  relatedTitle: string;
  relatedPages: readonly { label: string; title: string; body: string; href: string }[];
  faqTitle: string;
  faqItems: readonly { question: string; answer: string }[];
  cta: readonly { label: string; href: string }[];
};

const en: VideoAnalysisPageData = {
  metadata: {
    title: "Video Analysis API for AI Agents | AnyCap",
    description:
      "Give AI agents video analysis through AnyCap. Analyze recordings, summarize scenes, and extract video intelligence through one CLI command across Claude Code, Cursor, and more.",
    openGraphTitle: "Video Analysis API for AI Agents | AnyCap",
    openGraphDescription:
      "Give AI agents video analysis through AnyCap. Analyze recordings, summarize scenes, and extract video intelligence through one CLI command across Claude Code, Cursor, and more.",
  },
  breadcrumbItems: [
    { name: "Home", href: "/" },
    { name: "Capabilities", href: "/capabilities" },
    { name: "Video Analysis" },
  ],
  eyebrow: "Capabilities",
  heroTitle: "Video Analysis",
  heroIntro:
    "AnyCap video analysis lets AI agents understand video content through one CLI command. Agents can summarize recordings, extract key events, identify visual context, and run video understanding tasks without managing a separate video intelligence stack. The capability works across Claude Code, Cursor, Codex, and other agent products through the same auth flow and command surface as the rest of AnyCap.",
  usageTitle: "CLI usage",
  usageExamples: [
    { title: "Analyze a remote video", code: "anycap actions video-read --url https://example.com/demo.mp4" },
    { title: "Analyze a local video", code: "anycap actions video-read --file ./recording.mp4" },
    {
      title: "Ask for a focused summary",
      code: 'anycap actions video-read --url https://example.com/demo.mp4 --instruction "Summarize the key events and UI transitions"',
    },
  ],
  scenariosTitle: "When agents need video analysis",
  scenarios: [
    { title: "Bug reproduction", body: "Analyze screen recordings to understand bug reports and reproduction steps." },
    { title: "Demo review", body: "Summarize product demos and walkthrough recordings for docs and handoffs." },
    { title: "Content analysis", body: "Extract key moments, transitions, and visual context from recorded material." },
    { title: "QA automation", body: "Verify UI behavior in recorded test sessions as part of agent-driven QA." },
  ],
  relatedTitle: "Related pages",
  relatedPages: [
    {
      label: "Related capability",
      title: "Image Understanding",
      body: "Pair image and video understanding when workflows span screenshots and recorded sessions.",
      href: "/capabilities/image-understanding",
    },
    {
      label: "Agent page",
      title: "For Claude Code",
      body: "See how video analysis fits into the broader Claude Code capability story.",
      href: "/for/claude-code",
    },
    {
      label: "CLI",
      title: "AnyCap CLI",
      body: "Explore how the same CLI surface handles analysis and generation workflows.",
      href: "/cli",
    },
  ],
  faqTitle: "FAQ",
  faqItems: [
    {
      question: "What does AnyCap video analysis let agents do?",
      answer:
        "It gives agents one interface for video understanding across screen recordings, product demos, and visual walkthroughs. That includes scene summaries, key event extraction, and focused video intelligence tasks through the same CLI surface.",
    },
    {
      question: "Why does the CLI command use video-read while the page says video analysis?",
      answer:
        "The page uses the market language teams search for, while the CLI uses the concise command name `anycap actions video-read`. Both refer to the same capability surface.",
    },
    {
      question: "When should teams think of this as video understanding or video intelligence?",
      answer:
        "Those phrases describe the same practical need: turning video content into usable context for an agent. Video analysis is the page name, while video understanding and video intelligence are common search and evaluation terms.",
    },
    {
      question: "Is this effectively a video analysis API for agent workflows?",
      answer:
        "Yes. Teams can think of it as a video analysis API exposed through the AnyCap CLI, which makes it easier to use inside agent workflows than wiring a separate provider-specific stack.",
    },
  ],
  cta: [
    { label: "View on GitHub", href: "https://github.com/anycap-ai/anycap" },
    { label: "Any Capability", href: "/capabilities" },
    { label: "Explore the CLI", href: "/cli" },
  ],
};

const ptBr: VideoAnalysisPageData = {
  metadata: {
    title: "API de análise de vídeo para agentes de IA | AnyCap",
    description:
      "Dê análise de vídeo aos agentes de IA através do AnyCap. Analise gravações, resuma cenas e extraia inteligência de vídeo com um único comando CLI no Claude Code, Cursor e outros.",
    openGraphTitle: "API de análise de vídeo para agentes de IA | AnyCap",
    openGraphDescription:
      "Dê análise de vídeo aos agentes de IA através do AnyCap. Analise gravações, resuma cenas e extraia inteligência de vídeo com um único comando CLI no Claude Code, Cursor e outros.",
  },
  breadcrumbItems: [
    { name: "Início", href: "/" },
    { name: "Capacidades", href: "/capabilities" },
    { name: "Análise de Vídeo" },
  ],
  eyebrow: "Capacidades",
  heroTitle: "Análise de Vídeo",
  heroIntro:
    "A análise de vídeo do AnyCap permite que agentes de IA entendam conteúdo de vídeo por meio de um único comando CLI. Os agentes podem resumir gravações, extrair eventos-chave, identificar contexto visual e executar tarefas de entendimento de vídeo sem administrar uma stack separada de inteligência de vídeo. A capacidade funciona em Claude Code, Cursor, Codex e outros produtos de agente com o mesmo fluxo de autenticação e superfície de comando do restante do AnyCap.",
  usageTitle: "Uso na CLI",
  usageExamples: [
    { title: "Analise um vídeo remoto", code: "anycap actions video-read --url https://example.com/demo.mp4" },
    { title: "Analise um vídeo local", code: "anycap actions video-read --file ./recording.mp4" },
    {
      title: "Peça um resumo focado",
      code: 'anycap actions video-read --url https://example.com/demo.mp4 --instruction "Resuma os principais eventos e transições da interface"',
    },
  ],
  scenariosTitle: "Quando os agentes precisam de análise de vídeo",
  scenarios: [
    { title: "Reprodução de bug", body: "Analise gravações de tela para entender relatórios de bug e passos de reprodução." },
    { title: "Revisão de demo", body: "Resuma demos de produto e gravações de walkthrough para docs e handoff." },
    { title: "Análise de conteúdo", body: "Extraia momentos-chave, transições e contexto visual de material gravado." },
    { title: "Automação de QA", body: "Verifique o comportamento da interface em sessões gravadas como parte do QA guiado por agente." },
  ],
  relatedTitle: "Páginas relacionadas",
  relatedPages: [
    {
      label: "Capacidade relacionada",
      title: "Entendimento de Imagem",
      body: "Combine entendimento de imagem e vídeo quando o fluxo envolver capturas de tela e sessões gravadas.",
      href: "/capabilities/image-understanding",
    },
    {
      label: "Página de agente",
      title: "Para Claude Code",
      body: "Veja como a análise de vídeo entra na história mais ampla de capacidades do Claude Code.",
      href: "/for/claude-code",
    },
    {
      label: "CLI",
      title: "CLI do AnyCap",
      body: "Explore como a mesma superfície da CLI lida com fluxos de análise e geração.",
      href: "/cli",
    },
  ],
  faqTitle: "FAQ",
  faqItems: [
    {
      question: "O que a análise de vídeo do AnyCap permite que os agentes façam?",
      answer:
        "Ela dá aos agentes uma única interface para entendimento de vídeo em gravações de tela, demos de produto e walkthroughs visuais. Isso inclui resumo de cenas, extração de eventos-chave e tarefas focadas de inteligência de vídeo pela mesma superfície de CLI.",
    },
    {
      question: "Por que o comando da CLI usa video-read enquanto a página fala em análise de vídeo?",
      answer:
        "A página usa a linguagem de mercado que os times procuram, enquanto a CLI usa o nome conciso `anycap actions video-read`. Ambos se referem à mesma superfície de capacidade.",
    },
    {
      question: "Quando devo pensar nisso como entendimento de vídeo ou inteligência de vídeo?",
      answer:
        "Essas frases descrevem a mesma necessidade prática: transformar conteúdo de vídeo em contexto útil para um agente. Análise de vídeo é o nome da página, enquanto entendimento de vídeo e inteligência de vídeo são termos comuns de busca e avaliação.",
    },
    {
      question: "Isso é efetivamente uma API de análise de vídeo para fluxos de agente?",
      answer:
        "Sim. Você pode pensar nisso como uma API de análise de vídeo exposta pela CLI do AnyCap, o que facilita o uso dentro de fluxos de agente sem montar uma stack separada por provedor.",
    },
  ],
  cta: [
    { label: "Ver no GitHub", href: "https://github.com/anycap-ai/anycap" },
    { label: "Ver capacidades", href: "/capabilities" },
    { label: "Explorar a CLI", href: "/cli" },
  ],
};

const contentByLocale: Record<SiteLocale, VideoAnalysisPageData> = {
  en,
  "pt-br": ptBr,
  id: {
    metadata: {
      title: "API Analisis Video untuk Agen AI | AnyCap",
      description:
        "Berikan analisis video kepada agen AI lewat AnyCap. Analisis rekaman, rangkum adegan, dan ekstrak intelijen video melalui satu perintah CLI di Claude Code, Cursor, dan lainnya.",
      openGraphTitle: "API Analisis Video untuk Agen AI | AnyCap",
      openGraphDescription:
        "Berikan analisis video kepada agen AI lewat AnyCap. Analisis rekaman, rangkum adegan, dan ekstrak intelijen video melalui satu perintah CLI di Claude Code, Cursor, dan lainnya.",
    },
    breadcrumbItems: [
      { name: "Beranda", href: "/" },
      { name: "Kapabilitas", href: "/capabilities" },
      { name: "Analisis Video" },
    ],
    eyebrow: "Kapabilitas",
    heroTitle: "Analisis Video",
    heroIntro:
      "Analisis video AnyCap memungkinkan agen AI memahami konten video melalui satu perintah CLI. Agen dapat merangkum rekaman, mengekstrak peristiwa penting, mengidentifikasi konteks visual, dan menjalankan tugas pemahaman video tanpa harus mengelola stack intelijen video terpisah. Kapabilitas ini bekerja di Claude Code, Cursor, Codex, dan produk agen lainnya melalui alur autentikasi dan surface perintah yang sama dengan bagian AnyCap lainnya.",
    usageTitle: "Penggunaan CLI",
    usageExamples: [
      { title: "Analisis video remote", code: "anycap actions video-read --url https://example.com/demo.mp4" },
      { title: "Analisis video lokal", code: "anycap actions video-read --file ./recording.mp4" },
      {
        title: "Minta ringkasan yang fokus",
        code: 'anycap actions video-read --url https://example.com/demo.mp4 --instruction "Ringkas peristiwa utama dan transisi UI"',
      },
    ],
    scenariosTitle: "Saat agen membutuhkan analisis video",
    scenarios: [
      { title: "Reproduksi bug", body: "Analisis rekaman layar untuk memahami laporan bug dan langkah reproduksinya." },
      { title: "Tinjau demo", body: "Rangkum demo produk dan rekaman walkthrough untuk dokumentasi dan handoff." },
      { title: "Analisis konten", body: "Ekstrak momen penting, transisi, dan konteks visual dari materi rekaman." },
      { title: "Otomatisasi QA", body: "Verifikasi perilaku UI dalam sesi pengujian yang direkam sebagai bagian dari QA berbasis agen." },
    ],
    relatedTitle: "Halaman terkait",
    relatedPages: [
      {
        label: "Kapabilitas terkait",
        title: "Pemahaman Gambar",
        body: "Padukan pemahaman gambar dan video ketika workflow mencakup screenshot dan sesi rekaman.",
        href: "/capabilities/image-understanding",
      },
      {
        label: "Halaman agen",
        title: "Untuk Claude Code",
        body: "Lihat bagaimana analisis video masuk ke cerita kapabilitas Claude Code yang lebih luas.",
        href: "/for/claude-code",
      },
      {
        label: "CLI",
        title: "AnyCap CLI",
        body: "Jelajahi bagaimana surface CLI yang sama menangani workflow analisis dan generasi.",
        href: "/cli",
      },
    ],
    faqTitle: "FAQ",
    faqItems: [
      {
        question: "Apa yang memungkinkan agen lakukan dengan analisis video AnyCap?",
        answer:
          "Ini memberi agen satu interface untuk pemahaman video di rekaman layar, demo produk, dan walkthrough visual. Itu mencakup ringkasan adegan, ekstraksi peristiwa penting, dan tugas intelijen video yang terfokus melalui surface CLI yang sama.",
      },
      {
        question: "Kenapa perintah CLI memakai video-read sementara halaman ini menyebut analisis video?",
        answer:
          "Halaman ini memakai bahasa pasar yang dicari tim, sedangkan CLI memakai nama perintah yang singkat, `anycap actions video-read`. Keduanya merujuk pada surface kapabilitas yang sama.",
      },
      {
        question: "Kapan sebaiknya ini dipandang sebagai pemahaman video atau intelijen video?",
        answer:
          "Istilah-istilah itu menggambarkan kebutuhan praktis yang sama: mengubah konten video menjadi konteks yang bisa dipakai agen. Analisis video adalah nama halaman, sedangkan pemahaman video dan intelijen video adalah istilah pencarian dan evaluasi yang umum.",
      },
      {
        question: "Apakah ini pada dasarnya API analisis video untuk workflow agen?",
        answer:
          "Ya. Tim bisa memikirkannya sebagai API analisis video yang diekspos melalui CLI AnyCap, sehingga lebih mudah dipakai di workflow agen dibanding merangkai stack khusus vendor yang terpisah.",
      },
    ],
    cta: [
      { label: "Lihat di GitHub", href: "https://github.com/anycap-ai/anycap" },
      { label: "Lihat Kapabilitas", href: "/capabilities" },
      { label: "Jelajahi CLI", href: "/cli" },
    ],
  },
};

export function getVideoAnalysisMetadata(locale: SiteLocale): Metadata {
  const content = contentByLocale[locale] ?? contentByLocale.en;
  return {
    title: content.metadata.title,
    description: content.metadata.description,
    openGraph: {
      type: "website",
      locale: getLocaleConfig(locale).ogLocale,
      url: VIDEO_ANALYSIS_PATH,
      siteName: siteConfig.siteName,
      title: content.metadata.openGraphTitle,
      description: content.metadata.openGraphDescription,
    },
  };
}

export function getVideoAnalysisPageData(locale: SiteLocale) {
  return contentByLocale[locale] ?? contentByLocale.en;
}
