import type { Metadata } from "next";
import type { ModelDetailPageContent } from "@/app/(seo)/models/veo-3-1/Veo31PageView";
import type { ModelVisualShowcaseEntry } from "@/components/seo/ModelVisualShowcase";
import { createModelPageData, createModelPageMetadata } from "@/lib/seo/model-pages";
import { type SiteLocale } from "@/lib/site";

export const NANO_BANANA_2_PATH = "/models/nano-banana-2";

const LAST_UPDATED_ISO = "2026-04-05";
const SHOWCASE_IMAGE_SRC =
  "https://cdn.anycap.ai/page_resource/models/nano-banana-2-showcase.jpg";

type FaqItem = {
  question: string;
  answer: string;
};

type CallExample = {
  label: string;
  code: string;
};

type ComparisonRow = {
  dimension: string;
  primary: string;
  alternative: string;
};

type LocaleContent = ModelDetailPageContent & {
  showcase: ModelVisualShowcaseEntry;
};

const contentByLocale = {
  en: {
    metadata: {
      title: "Nano Banana 2 for AI agents — Fast image generation through AnyCap",
      description:
        "Use Nano Banana 2 through AnyCap when AI agents need fast text-to-image generation, scalable image editing, and high-volume visual iteration through one CLI.",
      openGraphTitle: "Nano Banana 2 for AI agents — Fast image generation through AnyCap",
      openGraphDescription:
        "Use Nano Banana 2 through AnyCap for fast text-to-image and image-to-image workflows inside agent runtimes.",
      articleHeadline: "Nano Banana 2 for AI agents — Fast image generation through AnyCap",
      articleDescription:
        "Guide to using Nano Banana 2 through AnyCap for fast text-to-image and image-to-image workflows inside AI agent runtimes.",
      articleAbout: ["Nano Banana 2", "Image generation", "AnyCap", "AI agents"],
      articleKeywords: [
        "nano banana 2",
        "nano banana 2 api",
        "seedream 5 vs nano banana 2",
        "image generation api",
        "anycap",
      ],
    },
    breadcrumbItems: [
      { name: "Home", href: "/" },
      { name: "Models", href: "/models" },
      { name: "Nano Banana 2", href: NANO_BANANA_2_PATH },
    ],
    eyebrow: "Model",
    lastUpdatedLabel: "Last updated April 5, 2026",
    hero: {
      titleLine1: "Nano Banana 2",
      titleLine2: "for AI agents",
      intro:
        "Nano Banana 2 is the faster, more scalable image model in the current AnyCap image stack. It is a strong fit when an agent needs to generate or revise many visual drafts quickly instead of optimizing for a single polished first pass. Through AnyCap, it stays in the same CLI and runtime as Seedream 5, Nano Banana Pro, video generation, and downstream analysis steps.",
    },
    showcaseLabels: {
      generatedExampleLabel: "Generated example",
      signalsLabel: "Why it helps this page",
    },
    showcase: {
      modelName: "Nano Banana 2",
      href: NANO_BANANA_2_PATH,
      sectionTitle: "Generated example for high-volume iteration",
      intro:
        "The example below leans into Nano Banana 2's speed story. Instead of a single hero shot, it shows a multi-variant board that feels closer to how teams review fast batches of marketing concepts.",
      promptLabel: "Prompt used with AnyCap",
      prompt:
        "triptych of the same matte graphite laptop product hero in three visual directions, off-white studio background, three side-by-side panels, clear variation in accent lighting and card styling, clean review board layout, no labels, no sticky notes, no text, no typography, no watermark",
      caption:
        "This three-variant review board was generated with Nano Banana 2 through AnyCap to show how the model fits fast variation and review loops.",
      signals: [
        "Reinforces throughput and ideation speed in one glance rather than only as copy.",
        "Matches the model's role in real workflows where multiple usable drafts matter more than one perfect frame.",
        "Adds a more distinctive multimedia asset than a generic stock illustration would.",
      ],
      images: [
        {
          src: SHOWCASE_IMAGE_SRC,
          alt: "Clean three-panel review board showing a matte graphite laptop in three visual directions on an off-white studio background.",
          width: 1376,
          height: 768,
          label: "Nano Banana 2 output",
        },
      ],
    },
    useCasesTitle: "When agents should choose Nano Banana 2",
    useCases: [
      "Fast text-to-image generation for high-volume visual workflows",
      "Image-to-image iteration loops where latency matters as much as quality",
      "Marketing assets, product mockups, storyboards, and repeatable content generation",
      "Teams comparing Seedream 5 vs Nano Banana 2 or Nano Banana Pro vs Nano Banana 2 for throughput",
    ],
    callSectionTitle: "Call Nano Banana 2 through AnyCap",
    callExamples: [
      {
        label: "Generate a draft image fast",
        code:
          'anycap image generate --model nano-banana-2 --prompt "clean product hero illustration on an off-white background" -o draft.png',
      },
      {
        label: "Iterate from a reference image",
        code:
          'anycap image generate --model nano-banana-2 --mode image-to-image --prompt "turn this into a cleaner launch visual with softer shadows" --param reference_image_urls=\'["./input.png"]\' -o variant.png',
      },
      {
        label: "Inspect the model schema",
        code: "anycap image models nano-banana-2 schema --operation generate --mode text-to-image",
      },
    ],
    comparisonTitle: "Nano Banana 2 vs nearby choices",
    comparisonHeaders: {
      dimension: "Dimension",
      primary: "Nano Banana 2",
      alternative: "Alternative",
    },
    comparisonRows: [
      {
        dimension: "Best fit",
        primary: "Fast, scalable image generation and iterative editing across larger prompt volumes",
        alternative:
          "Choose Seedream 5 for a more polished first pass or Nano Banana Pro for higher-end revision loops",
      },
      {
        dimension: "Workflow role",
        primary: "High-efficiency default for repeated generation and editing tasks",
        alternative:
          "Use a sibling model when the workflow is more quality-sensitive than speed-sensitive",
      },
      {
        dimension: "Typical agent task",
        primary: "Turn a prompt into a usable draft asset fast, then iterate or batch variants",
        alternative:
          "Move to Nano Banana Pro or Seedream 5 when the draft needs a more polished finishing pass",
      },
    ],
    faqTitle: "FAQ",
    faqItems: [
      {
        question: "What is Nano Banana 2 best for?",
        answer:
          "Nano Banana 2 is best for fast, scalable image generation and image-to-image iteration when agents need more speed and throughput across many visual tasks.",
      },
      {
        question: "How do agents call Nano Banana 2 through AnyCap?",
        answer:
          "Agents can call it with the AnyCap CLI using anycap image generate --model nano-banana-2 and either a text prompt or image-to-image mode.",
      },
      {
        question: "Should I use Seedream 5 or Nano Banana 2?",
        answer:
          "Use Seedream 5 when the main goal is a polished first-pass visual. Use Nano Banana 2 when the workflow needs faster iteration, more variants, or lower-latency image generation at scale.",
      },
    ],
    nextActions: [
      { label: "Image Generation", href: "/capabilities/image-generation", primary: true },
      { label: "Seedream 5", href: "/models/seedream-5" },
      { label: "Nano Banana Pro", href: "/models/nano-banana-pro" },
    ],
  },
  "pt-br": {
    metadata: {
      title: "Nano Banana 2 para agentes de IA — geração de imagem rápida pelo AnyCap",
      description:
        "Use o Nano Banana 2 pelo AnyCap quando agentes de IA precisarem de geração rápida de imagem a partir de texto, edição escalável e iteração visual em alto volume com uma única CLI.",
      openGraphTitle: "Nano Banana 2 para agentes de IA — geração de imagem rápida pelo AnyCap",
      openGraphDescription:
        "Use o Nano Banana 2 pelo AnyCap para fluxos rápidos de texto para imagem e imagem para imagem dentro de runtimes de agentes.",
      articleHeadline: "Nano Banana 2 para agentes de IA — geração de imagem rápida pelo AnyCap",
      articleDescription:
        "Guia para usar o Nano Banana 2 pelo AnyCap em fluxos rápidos de texto para imagem e imagem para imagem dentro de runtimes de agentes de IA.",
      articleAbout: ["Nano Banana 2", "Geração de imagem", "AnyCap", "agentes de IA"],
      articleKeywords: [
        "nano banana 2",
        "api nano banana 2",
        "seedream 5 vs nano banana 2",
        "api de geração de imagem",
        "anycap",
      ],
    },
    breadcrumbItems: [
      { name: "Início", href: "/" },
      { name: "Modelos", href: "/models" },
      { name: "Nano Banana 2", href: NANO_BANANA_2_PATH },
    ],
    eyebrow: "Modelo",
    lastUpdatedLabel: "Atualizado em 5 de abril de 2026",
    hero: {
      titleLine1: "Nano Banana 2",
      titleLine2: "para agentes de IA",
      intro:
        "O Nano Banana 2 é o modelo de imagem mais rápido e escalável da stack atual do AnyCap. Ele faz sentido quando um agente precisa gerar ou revisar muitos rascunhos visuais rapidamente, em vez de otimizar uma única primeira passagem polida. Pelo AnyCap, ele permanece na mesma CLI e no mesmo runtime que Seedream 5, Nano Banana Pro, geração de vídeo e etapas de análise posterior.",
    },
    showcaseLabels: {
      generatedExampleLabel: "Exemplo gerado",
      signalsLabel: "Por que isso ajuda esta página",
    },
    showcase: {
      modelName: "Nano Banana 2",
      href: NANO_BANANA_2_PATH,
      sectionTitle: "Exemplo gerado para iteração em alto volume",
      intro:
        "O exemplo abaixo enfatiza a velocidade do Nano Banana 2. Em vez de uma única imagem principal, ele mostra um board com várias variantes, mais próximo de como equipes revisam lotes rápidos de conceitos de marketing.",
      promptLabel: "Prompt usado com AnyCap",
      prompt:
        "tríptico do mesmo laptop hero em grafite fosco em três direções visuais, fundo de estúdio off-white, três painéis lado a lado, variação clara na luz de destaque e no estilo dos cards, layout limpo de revisão, sem rótulos, sem post-its, sem texto, sem tipografia, sem marca d'água",
      caption:
        "Este board de revisão com três variantes foi gerado com o Nano Banana 2 pelo AnyCap para mostrar como o modelo se encaixa em loops rápidos de variação e revisão.",
      signals: [
        "Reforça throughput e velocidade de ideação em uma única leitura visual, não só no texto.",
        "Combina com o papel do modelo em fluxos reais em que várias opções úteis valem mais do que um frame perfeito.",
        "Adiciona um ativo multimídia mais distintivo do que uma ilustração genérica de estoque.",
      ],
      images: [
        {
          src: SHOWCASE_IMAGE_SRC,
          alt: "Board limpo de revisão com um laptop em grafite fosco em três direções visuais sobre fundo de estúdio off-white.",
          width: 1376,
          height: 768,
          label: "Saída do Nano Banana 2",
        },
      ],
    },
    useCasesTitle: "Quando os agentes devem escolher Nano Banana 2",
    useCases: [
      "Geração rápida de texto para imagem para fluxos visuais em alto volume",
      "Loops de iteração imagem para imagem em que latência importa tanto quanto qualidade",
      "Assets de marketing, mockups de produto, storyboards e geração repetível de conteúdo",
      "Equipes comparando Seedream 5 vs Nano Banana 2 ou Nano Banana Pro vs Nano Banana 2 para throughput",
    ],
    callSectionTitle: "Chame o Nano Banana 2 pelo AnyCap",
    callExamples: [
      {
        label: "Gerar um rascunho de imagem rápido",
        code:
          'anycap image generate --model nano-banana-2 --prompt "ilustração limpa de hero de produto em fundo off-white" -o draft.png',
      },
      {
        label: "Iterar a partir de uma imagem de referência",
        code:
          'anycap image generate --model nano-banana-2 --mode image-to-image --prompt "transforme isto em um visual de lançamento mais limpo com sombras mais suaves" --param reference_image_urls=\'["./input.png"]\' -o variant.png',
      },
      {
        label: "Inspecionar o schema do modelo",
        code: "anycap image models nano-banana-2 schema --operation generate --mode text-to-image",
      },
    ],
    comparisonTitle: "Nano Banana 2 vs escolhas próximas",
    comparisonHeaders: {
      dimension: "Dimensão",
      primary: "Nano Banana 2",
      alternative: "Alternativa",
    },
    comparisonRows: [
      {
        dimension: "Melhor ajuste",
        primary: "Geração de imagem rápida e escalável, além de edição iterativa em volumes maiores de prompt",
        alternative:
          "Escolha Seedream 5 para uma primeira passagem mais polida ou Nano Banana Pro para loops de revisão mais sofisticados",
      },
      {
        dimension: "Papel no fluxo",
        primary: "Default de alta eficiência para tarefas repetidas de geração e edição",
        alternative:
          "Use um modelo irmão quando o fluxo for mais sensível à qualidade do que à velocidade",
      },
      {
        dimension: "Tarefa típica do agente",
        primary: "Transformar um prompt em um rascunho útil rapidamente, depois iterar ou gerar variantes em lote",
        alternative:
          "Mude para Nano Banana Pro ou Seedream 5 quando o rascunho precisar de um acabamento mais polido",
      },
    ],
    faqTitle: "Perguntas frequentes",
    faqItems: [
      {
        question: "Para que o Nano Banana 2 é melhor?",
        answer:
          "O Nano Banana 2 é ideal para geração rápida e escalável de imagens e para iteração imagem para imagem quando os agentes precisam de mais velocidade e throughput em muitas tarefas visuais.",
      },
      {
        question: "Como os agentes chamam o Nano Banana 2 pelo AnyCap?",
        answer:
          "Os agentes podem chamá-lo com a CLI do AnyCap usando anycap image generate --model nano-banana-2 e um prompt textual ou modo image-to-image.",
      },
      {
        question: "Devo usar Seedream 5 ou Nano Banana 2?",
        answer:
          "Use Seedream 5 quando o objetivo principal for um visual polido de primeira passagem. Use Nano Banana 2 quando o fluxo precisar de iteração mais rápida, mais variantes ou geração de imagem com menor latência em escala.",
      },
    ],
    nextActions: [
      { label: "Geração de imagem", href: "/capabilities/image-generation", primary: true },
      { label: "Seedream 5", href: "/models/seedream-5" },
      { label: "Nano Banana Pro", href: "/models/nano-banana-pro" },
    ],
  },
  id: {
    metadata: {
      title: "Nano Banana 2 untuk agen AI — generasi gambar cepat melalui AnyCap",
      description:
        "Gunakan Nano Banana 2 melalui AnyCap saat agen AI membutuhkan generasi gambar cepat dari teks, editing yang skalabel, dan iterasi visual ber-volume tinggi lewat satu CLI.",
      openGraphTitle: "Nano Banana 2 untuk agen AI — generasi gambar cepat melalui AnyCap",
      openGraphDescription:
        "Gunakan Nano Banana 2 melalui AnyCap untuk alur text-to-image dan image-to-image yang cepat di dalam runtime agen.",
      articleHeadline: "Nano Banana 2 untuk agen AI — generasi gambar cepat melalui AnyCap",
      articleDescription:
        "Panduan menggunakan Nano Banana 2 melalui AnyCap untuk alur text-to-image dan image-to-image yang cepat di dalam runtime agen AI.",
      articleAbout: ["Nano Banana 2", "Generasi gambar", "AnyCap", "agen AI"],
      articleKeywords: [
        "nano banana 2",
        "api nano banana 2",
        "seedream 5 vs nano banana 2",
        "api generasi gambar",
        "anycap",
      ],
    },
    breadcrumbItems: [
      { name: "Beranda", href: "/" },
      { name: "Model", href: "/models" },
      { name: "Nano Banana 2", href: NANO_BANANA_2_PATH },
    ],
    eyebrow: "Model",
    lastUpdatedLabel: "Diperbarui 5 April 2026",
    hero: {
      titleLine1: "Nano Banana 2",
      titleLine2: "untuk agen AI",
      intro:
        "Nano Banana 2 adalah model gambar yang paling cepat dan paling skalabel di stack gambar AnyCap saat ini. Model ini cocok saat agen perlu menghasilkan atau merevisi banyak draft visual dengan cepat, bukan mengoptimalkan satu first pass yang sangat dipoles. Melalui AnyCap, model ini tetap berada di CLI dan runtime yang sama dengan Seedream 5, Nano Banana Pro, generasi video, dan langkah analisis lanjutan.",
    },
    showcaseLabels: {
      generatedExampleLabel: "Contoh hasil generasi",
      signalsLabel: "Mengapa ini membantu halaman ini",
    },
    showcase: {
      modelName: "Nano Banana 2",
      href: NANO_BANANA_2_PATH,
      sectionTitle: "Contoh hasil generasi untuk iterasi volume tinggi",
      intro:
        "Contoh di bawah menonjolkan cerita kecepatan Nano Banana 2. Alih-alih satu hero shot, ia menampilkan board multi-variant yang lebih mirip cara tim meninjau batch cepat konsep marketing.",
      promptLabel: "Prompt yang dipakai dengan AnyCap",
      prompt:
        "triptych dari hero laptop grafit matte yang sama dalam tiga arah visual, latar studio off-white, tiga panel berdampingan, variasi jelas pada aksen cahaya dan styling kartu, layout board review yang bersih, tanpa label, tanpa sticky note, tanpa teks, tanpa tipografi, tanpa watermark",
      caption:
        "Board review tiga varian ini dihasilkan dengan Nano Banana 2 melalui AnyCap untuk menunjukkan bagaimana model ini cocok dengan loop variasi dan review yang cepat.",
      signals: [
        "Menegaskan throughput dan kecepatan ideasi dalam satu pandangan, bukan hanya lewat copy.",
        "Selaras dengan peran model di workflow nyata saat beberapa draft yang layak lebih berguna daripada satu frame sempurna.",
        "Menambah aset multimedia yang lebih khas daripada ilustrasi stok generik.",
      ],
      images: [
        {
          src: SHOWCASE_IMAGE_SRC,
          alt: "Board review bersih dengan laptop grafit matte dalam tiga arah visual di atas latar studio off-white.",
          width: 1376,
          height: 768,
          label: "Output Nano Banana 2",
        },
      ],
    },
    useCasesTitle: "Saat agen harus memilih Nano Banana 2",
    useCases: [
      "Generasi text-to-image cepat untuk workflow visual ber-volume tinggi",
      "Loop iterasi image-to-image ketika latensi sama pentingnya dengan kualitas",
      "Aset marketing, mockup produk, storyboard, dan generasi konten yang bisa diulang",
      "Tim yang membandingkan Seedream 5 vs Nano Banana 2 atau Nano Banana Pro vs Nano Banana 2 untuk throughput",
    ],
    callSectionTitle: "Panggil Nano Banana 2 lewat AnyCap",
    callExamples: [
      {
        label: "Hasilkan draft gambar dengan cepat",
        code:
          'anycap image generate --model nano-banana-2 --prompt "ilustrasi hero produk yang bersih di latar off-white" -o draft.png',
      },
      {
        label: "Iterasi dari gambar referensi",
        code:
          'anycap image generate --model nano-banana-2 --mode image-to-image --prompt "ubah ini menjadi visual peluncuran yang lebih bersih dengan bayangan lebih lembut" --param reference_image_urls=\'["./input.png"]\' -o variant.png',
      },
      {
        label: "Periksa schema model",
        code: "anycap image models nano-banana-2 schema --operation generate --mode text-to-image",
      },
    ],
    comparisonTitle: "Nano Banana 2 vs pilihan terdekat",
    comparisonHeaders: {
      dimension: "Dimensi",
      primary: "Nano Banana 2",
      alternative: "Alternatif",
    },
    comparisonRows: [
      {
        dimension: "Paling cocok",
        primary: "Generasi gambar cepat dan skalabel, plus editing iteratif pada volume prompt yang lebih besar",
        alternative:
          "Pilih Seedream 5 untuk first pass yang lebih rapi atau Nano Banana Pro untuk loop revisi kelas atas",
      },
      {
        dimension: "Peran dalam workflow",
        primary: "Default efisiensi tinggi untuk tugas generasi dan editing yang berulang",
        alternative:
          "Gunakan model saudara ketika workflow lebih sensitif pada kualitas daripada kecepatan",
      },
      {
        dimension: "Tugas tipikal agen",
        primary: "Mengubah prompt menjadi draft aset yang berguna dengan cepat, lalu iterasi atau batch variasi",
        alternative:
          "Pindah ke Nano Banana Pro atau Seedream 5 ketika draft perlu finishing yang lebih rapi",
      },
    ],
    faqTitle: "FAQ",
    faqItems: [
      {
        question: "Untuk apa Nano Banana 2 paling bagus?",
        answer:
          "Nano Banana 2 paling cocok untuk generasi gambar yang cepat dan skalabel serta iterasi image-to-image saat agen membutuhkan lebih banyak kecepatan dan throughput untuk banyak tugas visual.",
      },
      {
        question: "Bagaimana agen memanggil Nano Banana 2 lewat AnyCap?",
        answer:
          "Agen bisa memanggilnya dengan CLI AnyCap menggunakan anycap image generate --model nano-banana-2 dan prompt teks atau mode image-to-image.",
      },
      {
        question: "Harus pakai Seedream 5 atau Nano Banana 2?",
        answer:
          "Gunakan Seedream 5 saat tujuan utamanya adalah visual first pass yang lebih rapi. Gunakan Nano Banana 2 saat workflow membutuhkan iterasi lebih cepat, lebih banyak variasi, atau generasi gambar dengan latensi lebih rendah pada skala besar.",
      },
    ],
    nextActions: [
      { label: "Generasi gambar", href: "/capabilities/image-generation", primary: true },
      { label: "Seedream 5", href: "/models/seedream-5" },
      { label: "Nano Banana Pro", href: "/models/nano-banana-pro" },
    ],
  },
} as const satisfies Record<SiteLocale, LocaleContent>;

export function getNanoBanana2Metadata(locale: SiteLocale): Metadata {
  const content = contentByLocale[locale] ?? contentByLocale.en;

  return createModelPageMetadata(locale, NANO_BANANA_2_PATH, content.metadata);
}

export function getNanoBanana2PageData(locale: SiteLocale) {
  return createModelPageData(locale, NANO_BANANA_2_PATH, contentByLocale, LAST_UPDATED_ISO);
}

export type NanoBanana2PageData = ReturnType<typeof getNanoBanana2PageData>;
