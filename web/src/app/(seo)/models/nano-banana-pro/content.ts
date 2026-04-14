import type { Metadata } from "next";
import type { ModelDetailPageContent } from "@/app/(seo)/models/veo-3-1/Veo31PageView";
import type { ModelVisualShowcaseEntry } from "@/components/seo/ModelVisualShowcase";
import { createModelPageData, createModelPageMetadata } from "@/lib/seo/model-pages";
import { type SiteLocale } from "@/lib/site";

export const NANO_BANANA_PRO_PATH = "/models/nano-banana-pro";

const LAST_UPDATED_ISO = "2026-04-05";
const SHOWCASE_IMAGE_SRC =
  "https://cdn.anycap.ai/page_resource/models/nano-banana-pro-before.jpg";
const SHOWCASE_AFTER_IMAGE_SRC =
  "https://cdn.anycap.ai/page_resource/models/nano-banana-pro-after.jpg";

type LocaleContent = ModelDetailPageContent & {
  showcase: ModelVisualShowcaseEntry;
};

const contentByLocale = {
  en: {
    metadata: {
      title: "Nano Banana Pro for AI agents — Image editing through AnyCap",
      description:
        "Use Nano Banana Pro through AnyCap when AI agents need image editing, revision loops, and prompt-based updates to an existing visual. Learn how it fits agent workflows and when to choose it over a pure generation model.",
      openGraphTitle: "Nano Banana Pro for AI agents — Image editing through AnyCap",
      openGraphDescription:
        "Use Nano Banana Pro through AnyCap when AI agents need image editing, revision loops, and prompt-based updates to an existing visual.",
      articleHeadline: "Nano Banana Pro for AI agents — Image editing through AnyCap",
      articleDescription:
        "Guide to using Nano Banana Pro through AnyCap for image editing, revision loops, and prompt-based updates to an existing visual inside AI agent workflows.",
      articleAbout: ["Nano Banana Pro", "Image editing", "AnyCap", "AI agents"],
      articleKeywords: [
        "nano banana pro",
        "nano banana pro api",
        "image editing model",
        "image to image",
        "anycap",
      ],
    },
    breadcrumbItems: [
      { name: "Home", href: "/" },
      { name: "Models", href: "/models" },
      { name: "Nano Banana Pro", href: NANO_BANANA_PRO_PATH },
    ],
    eyebrow: "Model",
    lastUpdatedLabel: "Last updated April 5, 2026",
    hero: {
      titleLine1: "Nano Banana Pro",
      titleLine2: "for AI agents",
      intro:
        "Nano Banana Pro is a better fit when an agent needs to edit an existing image instead of generating from scratch. Through AnyCap, the model becomes part of the same capability runtime and CLI used for other image and video tasks, so agents can move from generation to revision without changing tools.",
    },
    showcaseLabels: {
      generatedExampleLabel: "Generated example",
      signalsLabel: "Why it helps this page",
    },
    showcase: {
      modelName: "Nano Banana Pro",
      href: NANO_BANANA_PRO_PATH,
      sectionTitle: "Before-and-after proof for the revision workflow",
      intro:
        "Nano Banana Pro makes the most sense after a draft already exists. This pair shows that idea directly: a rough base image first, then a cleaner launch-ready revision through an image-to-image edit.",
      promptLabel: "Edit prompt used with AnyCap",
      prompt:
        "replace the cluttered desk with a warm cream studio gradient and a minimal pedestal, center the wearable device, add soft rim light and cleaner composition, preserve the device shape, make it look launch-ready, premium product marketing photo, no text, no watermark",
      caption:
        "The left image is a rough Nano Banana 2 draft. The right image is the Nano Banana Pro revision generated through AnyCap from that source asset.",
      signals: [
        "Turns the abstract idea of a revision loop into a visual before-and-after sequence.",
        "Demonstrates background cleanup, subject centering, and lighting improvements without swapping the product itself.",
        "Creates a stronger experience signal than a page that only says the model is good at editing.",
      ],
      images: [
        {
          src: SHOWCASE_IMAGE_SRC,
          alt: "Rough tabletop product shot of a wearable device on a cluttered desk with mixed lighting.",
          width: 1376,
          height: 768,
          label: "Before",
        },
        {
          src: SHOWCASE_AFTER_IMAGE_SRC,
          alt: "Refined product marketing shot of the same wearable device centered on a minimal pedestal with a warm cream studio background.",
          width: 1376,
          height: 768,
          label: "After",
        },
      ],
    },
    useCasesTitle: "When agents should choose Nano Banana Pro",
    useCases: [
      "Revise an existing image with a text instruction",
      "Adjust lighting, composition, or background without rebuilding the asset",
      "Run fast agent iteration loops on visual drafts",
      "Start from an input image instead of a blank prompt",
    ],
    callSectionTitle: "Call Nano Banana Pro through AnyCap",
    callExamples: [
      {
        label: "Edit an existing image",
        code:
          'anycap image generate --model nano-banana-pro --mode image-to-image --prompt "replace the background with a warm studio light" --param reference_image_urls=\'["./input.png"]\' -o revised.png',
      },
      {
        label: "Use the result in a review loop",
        code:
          "The model is a strong fit when the agent has already inspected a draft and is applying feedback inside a larger workflow.",
      },
    ],
    workflowTitle: "Workflow tradeoffs",
    workflowCards: [
      {
        eyebrow: "Choose Nano Banana Pro",
        body: "When the agent already has an image and needs targeted changes, multiple revisions, or prompt-based editing.",
      },
      {
        eyebrow: "Choose Seedream 5 instead",
        body: "When the workflow begins from a text prompt and the agent needs a polished fresh image rather than an edit pass.",
      },
    ],
    comparisonTitle: "Nano Banana Pro vs nearby choices",
    comparisonHeaders: {
      dimension: "Dimension",
      primary: "Nano Banana Pro",
      alternative: "Alternative",
    },
    comparisonRows: [
      {
        dimension: "Best fit",
        primary:
          "Prompt-based image editing, revision loops, and targeted visual updates after a draft already exists",
        alternative:
          "Choose Seedream 5 for polished first-pass generation or Nano Banana 2 for faster high-volume iteration",
      },
      {
        dimension: "Workflow role",
        primary: "Revision model that follows generation, review, or visual feedback",
        alternative:
          "Use a sibling model when the workflow needs to create a fresh asset from a blank prompt",
      },
      {
        dimension: "Typical agent task",
        primary:
          "Take an existing asset, apply a change request, and return a more usable revision quickly",
        alternative:
          "Move back to Seedream 5 or Nano Banana 2 if the workflow becomes more about generation throughput than editing precision",
      },
    ],
    faqTitle: "FAQ",
    faqItems: [
      {
        question: "What is Nano Banana Pro best for?",
        answer:
          "Nano Banana Pro is best for targeted image edits, revision loops, and prompt-based updates when an agent already has a draft image to work from.",
      },
      {
        question: "How do agents call Nano Banana Pro through AnyCap?",
        answer:
          "Agents can call it with the AnyCap CLI using anycap image generate --model nano-banana-pro in image-to-image mode with a reference image and an edit prompt.",
      },
      {
        question: "Should I use Nano Banana Pro or Seedream 5?",
        answer:
          "Use Nano Banana Pro when the job starts from an existing image and needs revisions. Use Seedream 5 when the workflow starts from a blank prompt and needs a stronger first-pass visual.",
      },
    ],
    nextActions: [
      { label: "Image Generation", href: "/capabilities/image-generation", primary: true },
      { label: "Seedream 5", href: "/models/seedream-5" },
      { label: "Context Guide", href: "/guides/context-engineering-for-agents" },
    ],
  },
  "pt-br": {
    metadata: {
      title: "Nano Banana Pro para agentes de IA — edição de imagem pelo AnyCap",
      description:
        "Use o Nano Banana Pro pelo AnyCap quando agentes de IA precisarem de edição de imagem, loops de revisão e atualizações guiadas por prompt em um visual já existente. Veja como ele se encaixa nos fluxos e quando escolhê-lo em vez de um modelo puro de geração.",
      openGraphTitle: "Nano Banana Pro para agentes de IA — edição de imagem pelo AnyCap",
      openGraphDescription:
        "Use o Nano Banana Pro pelo AnyCap quando agentes de IA precisarem de edição de imagem, loops de revisão e atualizações guiadas por prompt em um visual já existente.",
      articleHeadline: "Nano Banana Pro para agentes de IA — edição de imagem pelo AnyCap",
      articleDescription:
        "Guia para usar o Nano Banana Pro pelo AnyCap em edição de imagem, loops de revisão e atualizações guiadas por prompt dentro de fluxos de agentes de IA.",
      articleAbout: ["Nano Banana Pro", "Edição de imagem", "AnyCap", "agentes de IA"],
      articleKeywords: [
        "nano banana pro",
        "api nano banana pro",
        "modelo de edição de imagem",
        "image to image",
        "anycap",
      ],
    },
    breadcrumbItems: [
      { name: "Início", href: "/" },
      { name: "Modelos", href: "/models" },
      { name: "Nano Banana Pro", href: NANO_BANANA_PRO_PATH },
    ],
    eyebrow: "Modelo",
    lastUpdatedLabel: "Atualizado em 5 de abril de 2026",
    hero: {
      titleLine1: "Nano Banana Pro",
      titleLine2: "para agentes de IA",
      intro:
        "O Nano Banana Pro é a melhor escolha quando um agente precisa editar uma imagem existente em vez de gerar do zero. Pelo AnyCap, o modelo passa a fazer parte do mesmo runtime de capability e da mesma CLI usados para outras tarefas de imagem e vídeo, então os agentes podem ir da geração à revisão sem trocar de ferramenta.",
    },
    showcaseLabels: {
      generatedExampleLabel: "Exemplo gerado",
      signalsLabel: "Por que isso ajuda esta página",
    },
    showcase: {
      modelName: "Nano Banana Pro",
      href: NANO_BANANA_PRO_PATH,
      sectionTitle: "Prova de antes e depois para o fluxo de revisão",
      intro:
        "O Nano Banana Pro faz mais sentido depois que um draft já existe. Este par mostra essa ideia diretamente: primeiro uma imagem base mais bruta, depois uma revisão mais limpa e pronta para lançamento via edição image-to-image.",
      promptLabel: "Prompt de edição usado com AnyCap",
      prompt:
        "substitua a mesa bagunçada por um gradiente de estúdio creme e um pedestal minimalista, centralize o dispositivo vestível, adicione rim light suave e composição mais limpa, preserve o formato do produto, faça parecer pronto para lançamento, foto premium de marketing de produto, sem texto, sem marca d'água",
      caption:
        "A imagem da esquerda é um rascunho bruto do Nano Banana 2. A imagem da direita é a revisão do Nano Banana Pro gerada pelo AnyCap a partir desse asset de origem.",
      signals: [
        "Transforma a ideia abstrata de um loop de revisão em uma sequência visual de antes e depois.",
        "Demonstra limpeza de fundo, centralização do assunto e melhoria de iluminação sem trocar o produto.",
        "Cria um sinal de experiência mais forte do que uma página que apenas diz que o modelo edita bem.",
      ],
      images: [
        {
          src: SHOWCASE_IMAGE_SRC,
          alt: "Foto bruta de produto sobre uma mesa bagunçada com um dispositivo vestível e iluminação mista.",
          width: 1376,
          height: 768,
          label: "Antes",
        },
        {
          src: SHOWCASE_AFTER_IMAGE_SRC,
          alt: "Foto refinada de marketing do mesmo dispositivo vestível centralizado em um pedestal minimalista com fundo creme de estúdio.",
          width: 1376,
          height: 768,
          label: "Depois",
        },
      ],
    },
    useCasesTitle: "Quando os agentes devem escolher Nano Banana Pro",
    useCases: [
      "Revisar uma imagem existente com uma instrução textual",
      "Ajustar iluminação, composição ou fundo sem reconstruir o asset",
      "Executar loops rápidos de iteração de agentes sobre rascunhos visuais",
      "Começar a partir de uma imagem de entrada em vez de um prompt em branco",
    ],
    callSectionTitle: "Chame o Nano Banana Pro pelo AnyCap",
    callExamples: [
      {
        label: "Editar uma imagem existente",
        code:
          'anycap image generate --model nano-banana-pro --mode image-to-image --prompt "substitua o fundo por uma luz de estúdio quente" --param reference_image_urls=\'["./input.png"]\' -o revised.png',
      },
      {
        label: "Usar o resultado em um loop de revisão",
        code:
          "O modelo é ideal quando o agente já inspecionou um draft e está aplicando feedback dentro de um fluxo maior.",
      },
    ],
    workflowTitle: "Tradeoffs de workflow",
    workflowCards: [
      {
        eyebrow: "Escolha Nano Banana Pro",
        body: "Quando o agente já tem uma imagem e precisa de mudanças pontuais, múltiplas revisões ou edição guiada por prompt.",
      },
      {
        eyebrow: "Escolha Seedream 5",
        body: "Quando o fluxo começa em um prompt textual e o agente precisa de uma imagem nova e polida, não de uma passada de edição.",
      },
    ],
    comparisonTitle: "Nano Banana Pro vs escolhas próximas",
    comparisonHeaders: {
      dimension: "Dimensão",
      primary: "Nano Banana Pro",
      alternative: "Alternativa",
    },
    comparisonRows: [
      {
        dimension: "Melhor ajuste",
        primary:
          "Edição de imagem guiada por prompt, loops de revisão e atualizações pontuais depois que um draft já existe",
        alternative:
          "Escolha Seedream 5 para geração polida de primeira passagem ou Nano Banana 2 para iteração rápida em alto volume",
      },
      {
        dimension: "Papel no fluxo",
        primary: "Modelo de revisão que vem depois da geração, da revisão humana ou do feedback visual",
        alternative:
          "Use um modelo irmão quando o fluxo precisa criar um asset novo a partir de um prompt em branco",
      },
      {
        dimension: "Tarefa típica do agente",
        primary:
          "Pegar um asset existente, aplicar um pedido de mudança e devolver rapidamente uma revisão mais útil",
        alternative:
          "Volte para Seedream 5 ou Nano Banana 2 se o fluxo ficar mais focado em throughput de geração do que em precisão de edição",
      },
    ],
    faqTitle: "Perguntas frequentes",
    faqItems: [
      {
        question: "Para que o Nano Banana Pro é melhor?",
        answer:
          "O Nano Banana Pro é ideal para edições pontuais, loops de revisão e atualizações guiadas por prompt quando o agente já tem uma imagem de rascunho para trabalhar.",
      },
      {
        question: "Como os agentes chamam o Nano Banana Pro pelo AnyCap?",
        answer:
          "Os agentes podem chamá-lo com a CLI do AnyCap usando anycap image generate --model nano-banana-pro no modo image-to-image, com uma imagem de referência e um prompt de edição.",
      },
      {
        question: "Devo usar Nano Banana Pro ou Seedream 5?",
        answer:
          "Use Nano Banana Pro quando o trabalho começa de uma imagem existente e precisa de revisão. Use Seedream 5 quando o fluxo começa de um prompt em branco e precisa de um visual mais forte na primeira passagem.",
      },
    ],
    nextActions: [
      { label: "Geração de imagem", href: "/capabilities/image-generation", primary: true },
      { label: "Seedream 5", href: "/models/seedream-5" },
      { label: "Guia de contexto", href: "/guides/context-engineering-for-agents" },
    ],
  },
  id: {
    metadata: {
      title: "Nano Banana Pro untuk agen AI — editing gambar melalui AnyCap",
      description:
        "Gunakan Nano Banana Pro melalui AnyCap saat agen AI membutuhkan editing gambar, loop revisi, dan pembaruan berbasis prompt pada visual yang sudah ada. Pelajari bagaimana ia cocok ke alur kerja agen dan kapan memilihnya dibanding model generasi murni.",
      openGraphTitle: "Nano Banana Pro untuk agen AI — editing gambar melalui AnyCap",
      openGraphDescription:
        "Gunakan Nano Banana Pro melalui AnyCap saat agen AI membutuhkan editing gambar, loop revisi, dan pembaruan berbasis prompt pada visual yang sudah ada.",
      articleHeadline: "Nano Banana Pro untuk agen AI — editing gambar melalui AnyCap",
      articleDescription:
        "Panduan menggunakan Nano Banana Pro melalui AnyCap untuk editing gambar, loop revisi, dan pembaruan berbasis prompt di dalam workflow agen AI.",
      articleAbout: ["Nano Banana Pro", "Editing gambar", "AnyCap", "agen AI"],
      articleKeywords: [
        "nano banana pro",
        "api nano banana pro",
        "model editing gambar",
        "image to image",
        "anycap",
      ],
    },
    breadcrumbItems: [
      { name: "Beranda", href: "/" },
      { name: "Model", href: "/models" },
      { name: "Nano Banana Pro", href: NANO_BANANA_PRO_PATH },
    ],
    eyebrow: "Model",
    lastUpdatedLabel: "Diperbarui 5 April 2026",
    hero: {
      titleLine1: "Nano Banana Pro",
      titleLine2: "untuk agen AI",
      intro:
        "Nano Banana Pro lebih cocok saat agen perlu mengedit gambar yang sudah ada daripada menghasilkan dari nol. Melalui AnyCap, model ini menjadi bagian dari runtime capability dan CLI yang sama dengan tugas gambar dan video lainnya, sehingga agen bisa berpindah dari generasi ke revisi tanpa berganti alat.",
    },
    showcaseLabels: {
      generatedExampleLabel: "Contoh hasil generasi",
      signalsLabel: "Mengapa ini membantu halaman ini",
    },
    showcase: {
      modelName: "Nano Banana Pro",
      href: NANO_BANANA_PRO_PATH,
      sectionTitle: "Bukti before-and-after untuk workflow revisi",
      intro:
        "Nano Banana Pro paling masuk akal setelah draft sudah ada. Pair ini menunjukkan idenya secara langsung: pertama gambar dasar yang masih kasar, lalu revisi yang lebih bersih dan siap peluncuran lewat edit image-to-image.",
      promptLabel: "Prompt edit yang dipakai dengan AnyCap",
      prompt:
        "ganti meja yang berantakan dengan gradien studio krem yang hangat dan pedestal minimalis, pusatkan perangkat wearable, tambahkan rim light lembut dan komposisi yang lebih bersih, pertahankan bentuk produknya, buat terlihat siap diluncurkan, foto marketing produk premium, tanpa teks, tanpa watermark",
      caption:
        "Gambar kiri adalah draft kasar Nano Banana 2. Gambar kanan adalah revisi Nano Banana Pro yang dihasilkan melalui AnyCap dari aset sumber tersebut.",
      signals: [
        "Mengubah ide abstrak loop revisi menjadi sequence visual before-and-after.",
        "Menunjukkan pembersihan background, pemusatan objek, dan perbaikan pencahayaan tanpa mengganti produknya.",
        "Memberi sinyal pengalaman yang lebih kuat daripada halaman yang hanya bilang model ini bagus untuk editing.",
      ],
      images: [
        {
          src: SHOWCASE_IMAGE_SRC,
          alt: "Foto produk kasar di atas meja berantakan dengan perangkat wearable dan pencahayaan campuran.",
          width: 1376,
          height: 768,
          label: "Sebelum",
        },
        {
          src: SHOWCASE_AFTER_IMAGE_SRC,
          alt: "Foto marketing yang telah direvisi dari perangkat wearable yang sama, dipusatkan di atas pedestal minimalis dengan latar studio krem hangat.",
          width: 1376,
          height: 768,
          label: "Sesudah",
        },
      ],
    },
    useCasesTitle: "Saat agen harus memilih Nano Banana Pro",
    useCases: [
      "Merevisi gambar yang sudah ada dengan instruksi teks",
      "Menyesuaikan pencahayaan, komposisi, atau background tanpa membangun ulang aset",
      "Menjalankan loop iterasi cepat agen pada draft visual",
      "Memulai dari image input, bukan prompt kosong",
    ],
    callSectionTitle: "Panggil Nano Banana Pro lewat AnyCap",
    callExamples: [
      {
        label: "Edit gambar yang sudah ada",
        code:
          'anycap image generate --model nano-banana-pro --mode image-to-image --prompt "ganti background dengan cahaya studio yang hangat" --param reference_image_urls=\'["./input.png"]\' -o revised.png',
      },
      {
        label: "Gunakan hasilnya dalam loop review",
        code:
          "Model ini ideal saat agen sudah meninjau draft dan sedang menerapkan feedback di dalam workflow yang lebih besar.",
      },
    ],
    workflowTitle: "Tradeoff workflow",
    workflowCards: [
      {
        eyebrow: "Pilih Nano Banana Pro",
        body: "Saat agen sudah punya gambar dan membutuhkan perubahan terarah, beberapa revisi, atau editing berbasis prompt.",
      },
      {
        eyebrow: "Pilih Seedream 5",
        body: "Saat workflow dimulai dari prompt teks dan agen membutuhkan gambar baru yang rapi, bukan tahap revisi.",
      },
    ],
    comparisonTitle: "Nano Banana Pro vs pilihan terdekat",
    comparisonHeaders: {
      dimension: "Dimensi",
      primary: "Nano Banana Pro",
      alternative: "Alternatif",
    },
    comparisonRows: [
      {
        dimension: "Paling cocok",
        primary:
          "Editing gambar berbasis prompt, loop revisi, dan update visual yang ditargetkan setelah draft sudah ada",
        alternative:
          "Pilih Seedream 5 untuk generasi first-pass yang rapi atau Nano Banana 2 untuk iterasi cepat ber-volume tinggi",
      },
      {
        dimension: "Peran dalam workflow",
        primary: "Model revisi yang mengikuti generasi, review, atau feedback visual",
        alternative:
          "Gunakan model saudara saat workflow perlu membuat asset baru dari prompt kosong",
      },
      {
        dimension: "Tugas tipikal agen",
        primary:
          "Mengambil aset yang sudah ada, menerapkan request perubahan, dan mengembalikan revisi yang lebih berguna dengan cepat",
        alternative:
          "Kembali ke Seedream 5 atau Nano Banana 2 jika workflow lebih fokus ke throughput generasi daripada ketepatan editing",
      },
    ],
    faqTitle: "FAQ",
    faqItems: [
      {
        question: "Untuk apa Nano Banana Pro paling bagus?",
        answer:
          "Nano Banana Pro paling cocok untuk edit gambar terarah, loop revisi, dan pembaruan berbasis prompt saat agen sudah memiliki draft gambar untuk dikerjakan.",
      },
      {
        question: "Bagaimana agen memanggil Nano Banana Pro lewat AnyCap?",
        answer:
          "Agen bisa memanggilnya dengan CLI AnyCap menggunakan anycap image generate --model nano-banana-pro dalam mode image-to-image dengan gambar referensi dan prompt edit.",
      },
      {
        question: "Harus pakai Nano Banana Pro atau Seedream 5?",
        answer:
          "Gunakan Nano Banana Pro saat pekerjaan dimulai dari gambar yang sudah ada dan perlu revisi. Gunakan Seedream 5 saat workflow dimulai dari prompt kosong dan membutuhkan visual first-pass yang lebih kuat.",
      },
    ],
    nextActions: [
      { label: "Generasi gambar", href: "/capabilities/image-generation", primary: true },
      { label: "Seedream 5", href: "/models/seedream-5" },
      { label: "Panduan konteks", href: "/guides/context-engineering-for-agents" },
    ],
  },
} as const satisfies Record<SiteLocale, LocaleContent>;

export function getNanoBananaProMetadata(locale: SiteLocale): Metadata {
  const content = contentByLocale[locale] ?? contentByLocale.en;

  return createModelPageMetadata(locale, NANO_BANANA_PRO_PATH, content.metadata);
}

export function getNanoBananaProPageData(locale: SiteLocale) {
  return createModelPageData(locale, NANO_BANANA_PRO_PATH, contentByLocale, LAST_UPDATED_ISO);
}

export type NanoBananaProPageData = ReturnType<typeof getNanoBananaProPageData>;
