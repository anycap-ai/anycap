import type { Metadata } from "next";
import type { ModelShowcaseEntry } from "@/lib/model-showcase";
import { createFaqPageJsonLd, createTechArticleJsonLd } from "@/lib/schema";
import { getLocaleConfig, siteConfig, type SiteLocale } from "@/lib/site";

export const VEO_31_PATH = "/models/veo-3-1";

const LAST_UPDATED_ISO = "2026-04-05";
const VEO_SHOWCASE_IMAGE_SRC = "https://cdn.anycap.ai/page_resource/models/veo-3-1-keyframe.jpg";

type Veo31ComparisonRow = {
  dimension: string;
  primary: string;
  alternative: string;
};

type Veo31FaqItem = {
  question: string;
  answer: string;
};

type Veo31UseCase = string;

type Veo31WorkflowCard = {
  eyebrow: string;
  body: string;
};

type Veo31CallExample = {
  label: string;
  code: string;
};

type Veo31PageContent = {
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
  breadcrumbItems: readonly { name: string; href?: string }[];
  eyebrow: string;
  lastUpdatedLabel: string;
  hero: {
    titleLine1: string;
    titleLine2: string;
    intro: string;
  };
  showcaseLabels: {
    generatedExampleLabel: string;
    signalsLabel: string;
  };
  showcase: ModelShowcaseEntry;
  useCasesTitle: string;
  useCases: readonly Veo31UseCase[];
  callSectionTitle: string;
  callExamples: readonly Veo31CallExample[];
  workflowTitle: string;
  workflowParagraph: string;
  workflowCards: readonly Veo31WorkflowCard[];
  comparisonTitle: string;
  comparisonHeaders: {
    dimension: string;
    primary: string;
    alternative: string;
  };
  comparisonRows: readonly Veo31ComparisonRow[];
  faqTitle: string;
  faqItems: readonly Veo31FaqItem[];
  nextActions: readonly { label: string; href: string; primary?: boolean }[];
};

const contentByLocale = {
  en: {
    metadata: {
      title: "Veo 3.1 for AI agents — Video generation through AnyCap",
      description:
        "Use Veo 3.1 through AnyCap when AI agents need text-to-video generation inside a consistent capability runtime. Learn when to choose Veo 3.1, how to call it, and how it fits video workflows.",
      openGraphTitle: "Veo 3.1 for AI agents — Video generation through AnyCap",
      openGraphDescription:
        "Use Veo 3.1 through AnyCap when AI agents need text-to-video generation inside a consistent capability runtime.",
      articleHeadline: "Veo 3.1 for AI agents — Video generation through AnyCap",
      articleDescription:
        "Guide to using Veo 3.1 through AnyCap for premium text-to-video generation inside AI agent runtimes.",
      articleAbout: ["Veo 3.1", "Video generation", "AnyCap", "AI agents"],
      articleKeywords: ["veo 3.1", "veo 3.1 api", "text to video", "video generation", "anycap"],
    },
    breadcrumbItems: [
      { name: "Home", href: "/" },
      { name: "Models", href: "/models" },
      { name: "Veo 3.1", href: VEO_31_PATH },
    ],
    eyebrow: "Model",
    lastUpdatedLabel: "Last updated April 5, 2026",
    hero: {
      titleLine1: "Veo 3.1",
      titleLine2: "for AI agents",
      intro:
        "Veo 3.1 is the current video generation model exposed through AnyCap. It is a good fit when an agent needs to turn a text brief into a video draft without branching into a separate integration path. The same CLI can then continue into image generation, video analysis, or other multimodal steps.",
    },
    showcaseLabels: {
      generatedExampleLabel: "Generated example",
      signalsLabel: "Why it helps this page",
    },
    showcase: {
      modelName: "Veo 3.1",
      href: VEO_31_PATH,
      sectionTitle: "Illustrative keyframe for a premium text-to-video brief",
      intro:
        "Video output is time-based, so this page uses a companion still to anchor the brief visually. The image reflects the kind of cinematic scene planning teams often do before sending a premium text-to-video request.",
      promptLabel: "Illustrative still prompt",
      prompt:
        "cinematic aerial keyframe of a futuristic city at dawn, a drone gliding between towers, soft haze, warm sunrise rim light, premium sci-fi film still, no text, no watermark",
      caption:
        "This still was generated through AnyCap as a visual proxy for the kind of premium scene brief that pairs well with Veo 3.1.",
      signals: [
        "Gives readers a concrete visual anchor next to the CLI example and workflow explanation.",
        "Supports the page's positioning of Veo 3.1 as the premium first-pass lane in the current video stack.",
        "Improves multimedia coverage without pretending a static image is the full video output.",
      ],
      images: [
        {
          src: VEO_SHOWCASE_IMAGE_SRC,
          alt: "Cinematic aerial still of a futuristic city at dawn with a drone moving between tall towers in warm sunrise light.",
          width: 2560,
          height: 1440,
          label: "Companion keyframe",
        },
      ],
    },
    useCasesTitle: "When agents should use Veo 3.1",
    useCases: [
      "Generate short product demos from a written concept",
      "Create motion prototypes during agent-led content workflows",
      "Turn a text brief into an explainer or teaser draft",
      "Keep video generation inside the same agent runtime used for image and analysis tasks",
    ],
    callSectionTitle: "Call Veo 3.1 through AnyCap",
    callExamples: [
      {
        label: "Generate a video",
        code:
          'anycap video generate --model veo-3.1 --prompt "a cinematic flyover of a futuristic city at dawn" -o city.mp4',
      },
      {
        label: "List available video models",
        code: "anycap video models",
      },
    ],
    workflowTitle: "Workflow placement",
    workflowParagraph:
      "In an agent workflow, Veo 3.1 is usually the generation step that follows planning and precedes review. A coding or automation agent may draft the concept, call Veo 3.1 for the video output, then route the result into review, asset packaging, or documentation.",
    workflowCards: [
      {
        eyebrow: "Upstream",
        body: "Context engineering, prompt preparation, story framing, and asset selection.",
      },
      {
        eyebrow: "Downstream",
        body: "Review, editing notes, video analysis, and distribution inside the rest of the agent stack.",
      },
    ],
    comparisonTitle: "Veo 3.1 vs nearby choices",
    comparisonHeaders: {
      dimension: "Dimension",
      primary: "Veo 3.1",
      alternative: "Alternative",
    },
    comparisonRows: [
      {
        dimension: "Best fit",
        primary: "Higher-end cinematic first-pass video output from a text brief",
        alternative:
          "Choose Kling 3.0 for more exploratory cinematic motion or Seedance 1.5 Pro for steadier production-friendly workflows",
      },
      {
        dimension: "Workflow role",
        primary: "Premium generation model when the first result needs to land closer to final quality",
        alternative:
          "Use a sibling model when the workflow is optimizing more for budget, iteration volume, or image-to-video continuity",
      },
      {
        dimension: "Typical agent task",
        primary: "Turn a written concept into a more polished teaser, demo, or concept clip",
        alternative:
          "Route the output into review, packaging, or follow-up analysis after the initial generation step",
      },
    ],
    faqTitle: "FAQ",
    faqItems: [
      {
        question: "What is Veo 3.1 best for?",
        answer:
          "Veo 3.1 is best for premium text-to-video generation when an agent needs a stronger cinematic first pass from a written brief.",
      },
      {
        question: "How do agents call Veo 3.1 through AnyCap?",
        answer:
          "Agents can call it with the AnyCap CLI using anycap video generate --model veo-3.1 and a prompt, then keep the rest of the workflow in the same AnyCap runtime.",
      },
      {
        question: "Should I use Veo 3.1 or Kling 3.0?",
        answer:
          "Use Veo 3.1 when the first-pass result needs to look more premium from a text brief. Use Kling 3.0 when the workflow leans more on image-to-video iteration or a different motion style.",
      },
    ],
    nextActions: [
      { label: "Video Generation", href: "/capabilities/video-generation", primary: true },
      { label: "Kling 3.0", href: "/models/kling-3-0" },
      { label: "Seedance 1.5 Pro", href: "/models/seedance-1-5-pro" },
    ],
  },
  "pt-br": {
    metadata: {
      title: "Veo 3.1 para agentes de IA — geração de vídeo pelo AnyCap",
      description:
        "Use o Veo 3.1 pelo AnyCap quando agentes de IA precisarem de geração de vídeo a partir de texto dentro de um runtime de capability consistente. Veja quando escolher o Veo 3.1, como chamá-lo e como ele se encaixa em fluxos de vídeo.",
      openGraphTitle: "Veo 3.1 para agentes de IA — geração de vídeo pelo AnyCap",
      openGraphDescription:
        "Use o Veo 3.1 pelo AnyCap quando agentes de IA precisarem de geração de vídeo a partir de texto dentro de um runtime de capability consistente.",
      articleHeadline: "Veo 3.1 para agentes de IA — geração de vídeo pelo AnyCap",
      articleDescription:
        "Guia para usar o Veo 3.1 pelo AnyCap para geração premium de vídeo a partir de texto em runtimes de agentes de IA.",
      articleAbout: ["Veo 3.1", "Geração de vídeo", "AnyCap", "agentes de IA"],
      articleKeywords: ["veo 3.1", "api veo 3.1", "texto para vídeo", "geração de vídeo", "anycap"],
    },
    breadcrumbItems: [
      { name: "Início", href: "/" },
      { name: "Modelos", href: "/models" },
      { name: "Veo 3.1", href: VEO_31_PATH },
    ],
    eyebrow: "Modelo",
    lastUpdatedLabel: "Atualizado em 5 de abril de 2026",
    hero: {
      titleLine1: "Veo 3.1",
      titleLine2: "para agentes de IA",
      intro:
        "O Veo 3.1 é o modelo de geração de vídeo atualmente exposto pelo AnyCap. Ele é uma boa escolha quando um agente precisa transformar um briefing textual em um rascunho de vídeo sem abrir um caminho de integração separado. A mesma CLI pode então continuar para geração de imagem, análise de vídeo ou outras etapas multimodais.",
    },
    showcaseLabels: {
      generatedExampleLabel: "Exemplo gerado",
      signalsLabel: "Por que isso ajuda esta página",
    },
    showcase: {
      modelName: "Veo 3.1",
      href: VEO_31_PATH,
      sectionTitle: "Keyframe ilustrativo para um briefing premium de texto para vídeo",
      intro:
        "A saída de vídeo acontece no tempo, então esta página usa um still de apoio para ancorar o briefing visualmente. A imagem reflete o tipo de planejamento de cena cinematográfica que equipes costumam fazer antes de enviar um pedido premium de texto para vídeo.",
      promptLabel: "Prompt do still ilustrativo",
      prompt:
        "keyframe aéreo cinematográfico de uma cidade futurista ao amanhecer, um drone deslizando entre torres, leve neblina, luz de contorno quente do nascer do sol, still de filme sci-fi premium, sem texto, sem marca d'água",
      caption:
        "Este still foi gerado pelo AnyCap como um proxy visual do tipo de briefing premium de cena que combina bem com o Veo 3.1.",
      signals: [
        "Dá ao leitor uma âncora visual concreta ao lado do exemplo de CLI e da explicação do fluxo.",
        "Sustenta o posicionamento do Veo 3.1 como a trilha premium de primeira passagem na stack de vídeo atual.",
        "Melhora a cobertura multimídia sem fingir que uma imagem estática é o output final do vídeo.",
      ],
      images: [
        {
          src: VEO_SHOWCASE_IMAGE_SRC,
          alt: "Still cinematográfico aéreo de uma cidade futurista ao amanhecer com um drone passando entre torres altas sob luz quente do nascer do sol.",
          width: 2560,
          height: 1440,
          label: "Keyframe de apoio",
        },
      ],
    },
    useCasesTitle: "Quando os agentes devem usar o Veo 3.1",
    useCases: [
      "Gerar demos curtas de produto a partir de um conceito escrito",
      "Criar protótipos de movimento em fluxos de conteúdo conduzidos por agentes",
      "Transformar um briefing textual em um rascunho de explicação ou teaser",
      "Manter a geração de vídeo dentro do mesmo runtime de agente usado para tarefas de imagem e análise",
    ],
    callSectionTitle: "Chame o Veo 3.1 pelo AnyCap",
    callExamples: [
      {
        label: "Gerar um vídeo",
        code:
          'anycap video generate --model veo-3.1 --prompt "um voo cinematográfico sobre uma cidade futurista ao amanhecer" -o city.mp4',
      },
      {
        label: "Listar modelos de vídeo disponíveis",
        code: "anycap video models",
      },
    ],
    workflowTitle: "Posição no fluxo",
    workflowParagraph:
      "Em um fluxo de agente, o Veo 3.1 normalmente é a etapa de geração que vem depois do planejamento e antes da revisão. Um agente de código ou automação pode rascunhar o conceito, chamar o Veo 3.1 para gerar o vídeo e então encaminhar o resultado para revisão, empacotamento de assets ou documentação.",
    workflowCards: [
      {
        eyebrow: "Antes da geração",
        body: "Engenharia de contexto, preparação de prompt, estruturação da história e seleção de assets.",
      },
      {
        eyebrow: "Depois da geração",
        body: "Revisão, notas de edição, análise de vídeo e distribuição no restante da stack de agentes.",
      },
    ],
    comparisonTitle: "Veo 3.1 vs escolhas próximas",
    comparisonHeaders: {
      dimension: "Dimensão",
      primary: "Veo 3.1",
      alternative: "Alternativa",
    },
    comparisonRows: [
      {
        dimension: "Melhor ajuste",
        primary: "Saída de vídeo cinematográfica de primeira passagem mais refinada a partir de um briefing textual",
        alternative:
          "Escolha o Kling 3.0 para movimento cinematográfico mais exploratório ou o Seedance 1.5 Pro para fluxos de produção mais estáveis e amigáveis",
      },
      {
        dimension: "Papel no fluxo",
        primary: "Modelo premium quando o primeiro resultado precisa ficar mais próximo da qualidade final",
        alternative:
          "Use um modelo irmão quando o fluxo estiver mais focado em orçamento, volume de iteração ou continuidade de imagem para vídeo",
      },
      {
        dimension: "Tarefa típica do agente",
        primary: "Transformar um conceito escrito em um teaser, demo ou clipe conceitual mais polido",
        alternative:
          "Encaminhar o resultado para revisão, empacotamento ou análise posterior após a geração inicial",
      },
    ],
    faqTitle: "Perguntas frequentes",
    faqItems: [
      {
        question: "Para que o Veo 3.1 é melhor?",
        answer:
          "O Veo 3.1 é ideal para geração premium de texto para vídeo quando um agente precisa de uma primeira passagem cinematográfica mais forte a partir de um briefing escrito.",
      },
      {
        question: "Como os agentes chamam o Veo 3.1 pelo AnyCap?",
        answer:
          "Os agentes podem chamá-lo com a CLI do AnyCap usando anycap video generate --model veo-3.1 e um prompt, mantendo o restante do fluxo no mesmo runtime do AnyCap.",
      },
      {
        question: "Devo usar Veo 3.1 ou Kling 3.0?",
        answer:
          "Use o Veo 3.1 quando o resultado da primeira passagem precisar parecer mais premium a partir de um briefing textual. Use o Kling 3.0 quando o fluxo depender mais de iteração de imagem para vídeo ou de outro estilo de movimento.",
      },
    ],
    nextActions: [
      { label: "Geração de vídeo", href: "/capabilities/video-generation", primary: true },
      { label: "Kling 3.0", href: "/models/kling-3-0" },
      { label: "Seedance 1.5 Pro", href: "/models/seedance-1-5-pro" },
    ],
  },
  id: {
    metadata: {
      title: "Veo 3.1 untuk agen AI — generasi video melalui AnyCap",
      description:
        "Gunakan Veo 3.1 melalui AnyCap saat agen AI membutuhkan generasi video dari teks di dalam runtime capability yang konsisten. Pelajari kapan memilih Veo 3.1, cara memanggilnya, dan bagaimana ia cocok ke dalam alur kerja video.",
      openGraphTitle: "Veo 3.1 untuk agen AI — generasi video melalui AnyCap",
      openGraphDescription:
        "Gunakan Veo 3.1 melalui AnyCap saat agen AI membutuhkan generasi video dari teks di dalam runtime capability yang konsisten.",
      articleHeadline: "Veo 3.1 untuk agen AI — generasi video melalui AnyCap",
      articleDescription:
        "Panduan menggunakan Veo 3.1 melalui AnyCap untuk generasi video premium dari teks di dalam runtime agen AI.",
      articleAbout: ["Veo 3.1", "Generasi video", "AnyCap", "agen AI"],
      articleKeywords: ["veo 3.1", "api veo 3.1", "text to video", "generasi video", "anycap"],
    },
    breadcrumbItems: [
      { name: "Beranda", href: "/" },
      { name: "Model", href: "/models" },
      { name: "Veo 3.1", href: VEO_31_PATH },
    ],
    eyebrow: "Model",
    lastUpdatedLabel: "Diperbarui 5 April 2026",
    hero: {
      titleLine1: "Veo 3.1",
      titleLine2: "untuk agen AI",
      intro:
        "Veo 3.1 adalah model generasi video yang saat ini diekspos melalui AnyCap. Model ini cocok saat agen perlu mengubah briefing teks menjadi draft video tanpa berpindah ke jalur integrasi terpisah. CLI yang sama kemudian bisa lanjut ke generasi gambar, analisis video, atau langkah multimodal lainnya.",
    },
    showcaseLabels: {
      generatedExampleLabel: "Contoh hasil generasi",
      signalsLabel: "Mengapa ini membantu halaman ini",
    },
    showcase: {
      modelName: "Veo 3.1",
      href: VEO_31_PATH,
      sectionTitle: "Keyframe ilustratif untuk briefing text-to-video premium",
      intro:
        "Output video bersifat berbasis waktu, jadi halaman ini memakai still pendamping untuk mengikat briefing secara visual. Gambar ini mencerminkan jenis perencanaan adegan sinematik yang sering dilakukan tim sebelum mengirim permintaan text-to-video premium.",
      promptLabel: "Prompt still ilustratif",
      prompt:
        "keyframe sinematik aerial sebuah kota futuristik saat fajar, drone melayang di antara menara, kabut lembut, rim light hangat dari matahari terbit, still film sci-fi premium, tanpa teks, tanpa watermark",
      caption:
        "Still ini dihasilkan melalui AnyCap sebagai proksi visual untuk jenis briefing adegan premium yang cocok dengan Veo 3.1.",
      signals: [
        "Memberi pembaca jangkar visual yang konkret di samping contoh CLI dan penjelasan alur kerja.",
        "Mendukung positioning Veo 3.1 sebagai jalur first-pass premium di stack video saat ini.",
        "Menambah cakupan multimedia tanpa berpura-pura bahwa gambar statis adalah output video penuh.",
      ],
      images: [
        {
          src: VEO_SHOWCASE_IMAGE_SRC,
          alt: "Still aerial sinematik sebuah kota futuristik saat fajar dengan drone bergerak di antara menara tinggi dalam cahaya matahari terbit yang hangat.",
          width: 2560,
          height: 1440,
          label: "Keyframe pendamping",
        },
      ],
    },
    useCasesTitle: "Saat agen harus memakai Veo 3.1",
    useCases: [
      "Menghasilkan demo produk singkat dari konsep tertulis",
      "Membuat prototipe motion dalam alur konten yang dipandu agen",
      "Mengubah briefing teks menjadi draft penjelasan atau teaser",
      "Menjaga generasi video tetap di runtime agen yang sama dengan tugas gambar dan analisis",
    ],
    callSectionTitle: "Panggil Veo 3.1 lewat AnyCap",
    callExamples: [
      {
        label: "Hasilkan video",
        code:
          'anycap video generate --model veo-3.1 --prompt "flyover sinematik sebuah kota futuristik saat fajar" -o city.mp4',
      },
      {
        label: "Daftar model video yang tersedia",
        code: "anycap video models",
      },
    ],
    workflowTitle: "Posisi dalam alur kerja",
    workflowParagraph:
      "Dalam alur agen, Veo 3.1 biasanya adalah langkah generasi yang datang setelah perencanaan dan sebelum review. Agen coding atau automasi bisa merancang konsep, memanggil Veo 3.1 untuk output video, lalu meneruskan hasilnya ke review, packaging aset, atau dokumentasi.",
    workflowCards: [
      {
        eyebrow: "Hulu",
        body: "Context engineering, persiapan prompt, framing cerita, dan pemilihan aset.",
      },
      {
        eyebrow: "Hilir",
        body: "Review, catatan edit, analisis video, dan distribusi di stack agen berikutnya.",
      },
    ],
    comparisonTitle: "Veo 3.1 vs pilihan terdekat",
    comparisonHeaders: {
      dimension: "Dimensi",
      primary: "Veo 3.1",
      alternative: "Alternatif",
    },
    comparisonRows: [
      {
        dimension: "Paling cocok",
        primary: "Output video sinematik first-pass yang lebih premium dari briefing teks",
        alternative:
          "Pilih Kling 3.0 untuk motion sinematik yang lebih eksploratif atau Seedance 1.5 Pro untuk alur produksi yang lebih stabil dan ramah tim",
      },
      {
        dimension: "Peran dalam workflow",
        primary: "Model premium saat hasil pertama perlu mendekati kualitas final",
        alternative:
          "Gunakan model saudara ketika workflow lebih dioptimalkan untuk budget, volume iterasi, atau kesinambungan image-to-video",
      },
      {
        dimension: "Tugas tipikal agen",
        primary: "Mengubah konsep tertulis menjadi teaser, demo, atau klip konsep yang lebih rapi",
        alternative:
          "Meneruskan hasil ke review, packaging, atau analisis lanjutan setelah generasi awal",
      },
    ],
    faqTitle: "FAQ",
    faqItems: [
      {
        question: "Untuk apa Veo 3.1 paling bagus?",
        answer:
          "Veo 3.1 paling cocok untuk generasi text-to-video premium saat agen membutuhkan first pass sinematik yang lebih kuat dari briefing tertulis.",
      },
      {
        question: "Bagaimana agen memanggil Veo 3.1 lewat AnyCap?",
        answer:
          "Agen bisa memanggilnya dengan CLI AnyCap menggunakan anycap video generate --model veo-3.1 dan sebuah prompt, lalu tetap melanjutkan workflow di runtime AnyCap yang sama.",
      },
      {
        question: "Harus pakai Veo 3.1 atau Kling 3.0?",
        answer:
          "Gunakan Veo 3.1 saat hasil first pass perlu terlihat lebih premium dari briefing teks. Gunakan Kling 3.0 saat workflow lebih bergantung pada iterasi image-to-video atau gaya motion yang berbeda.",
      },
    ],
    nextActions: [
      { label: "Generasi video", href: "/capabilities/video-generation", primary: true },
      { label: "Kling 3.0", href: "/models/kling-3-0" },
      { label: "Seedance 1.5 Pro", href: "/models/seedance-1-5-pro" },
    ],
  },
} as const satisfies Record<SiteLocale, Veo31PageContent>;

export function getVeo31Metadata(locale: SiteLocale): Metadata {
  const content = contentByLocale[locale] ?? contentByLocale.en;

  return {
    title: content.metadata.title,
    description: content.metadata.description,
    alternates: { canonical: VEO_31_PATH },
    openGraph: {
      type: "website",
      locale: getLocaleConfig(locale).ogLocale,
      url: VEO_31_PATH,
      siteName: siteConfig.siteName,
      title: content.metadata.openGraphTitle,
      description: content.metadata.openGraphDescription,
    },
  };
}

export function getVeo31PageData(locale: SiteLocale) {
  const content = contentByLocale[locale] ?? contentByLocale.en;

  const modelGuideJsonLd = createTechArticleJsonLd({
    headline: content.metadata.articleHeadline,
    description: content.metadata.articleDescription,
    path: VEO_31_PATH,
    locale,
    about: [...content.metadata.articleAbout],
    keywords: [...content.metadata.articleKeywords],
    dateModified: LAST_UPDATED_ISO,
  });

  return {
    ...content,
    modelGuideJsonLd,
    faqJsonLd: createFaqPageJsonLd(content.faqItems),
  };
}

export type Veo31PageData = ReturnType<typeof getVeo31PageData>;
