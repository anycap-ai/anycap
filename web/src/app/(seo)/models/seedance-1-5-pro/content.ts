import type { Metadata } from "next";
import { createFaqPageJsonLd, createTechArticleJsonLd } from "@/lib/schema";
import { getLocaleConfig, siteConfig, type SiteLocale } from "@/lib/site";

export const SEEDANCE_15_PRO_PATH = "/models/seedance-1-5-pro";

const LAST_UPDATED_ISO = "2026-04-05";
const SEEDANCE_SHOWCASE_IMAGE_SRC =
  "https://cdn.anycap.ai/page_resource/models/seedance-1-5-pro-keyframe.jpg";

type Seedance15ProComparisonRow = {
  dimension: string;
  primary: string;
  alternative: string;
};

type Seedance15ProFaqItem = {
  question: string;
  answer: string;
};

type Seedance15ProCallExample = {
  label: string;
  code: string;
};

type Seedance15ProWorkflowCard = {
  eyebrow: string;
  body: string;
};

type Seedance15ProPageContent = {
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
  showcase: {
    modelName: string;
    href: string;
    sectionTitle: string;
    intro: string;
    promptLabel: string;
    prompt: string;
    caption: string;
    note?: string;
    signals: readonly string[];
    images: readonly {
      src: string;
      alt: string;
      width: number;
      height: number;
      label: string;
    }[];
  };
  useCasesTitle: string;
  useCases: readonly string[];
  callSectionTitle: string;
  callExamples: readonly Seedance15ProCallExample[];
  workflowTitle: string;
  workflowParagraph: string;
  workflowCards: readonly Seedance15ProWorkflowCard[];
  comparisonTitle: string;
  comparisonHeaders: {
    dimension: string;
    primary: string;
    alternative: string;
  };
  comparisonRows: readonly Seedance15ProComparisonRow[];
  faqTitle: string;
  faqItems: readonly Seedance15ProFaqItem[];
  nextActions: readonly { label: string; href: string; primary?: boolean }[];
};

const contentByLocale = {
  en: {
    metadata: {
      title: "Seedance 1.5 Pro for AI agents — Video generation through AnyCap",
      description:
        "Use Seedance 1.5 Pro through AnyCap when AI agents need reliable text-to-video and image-to-video workflows through one CLI and one capability runtime.",
      openGraphTitle: "Seedance 1.5 Pro for AI agents — Video generation through AnyCap",
      openGraphDescription:
        "Use Seedance 1.5 Pro through AnyCap for production-friendly text-to-video and image-to-video workflows.",
      articleHeadline: "Seedance 1.5 Pro for AI agents — Video generation through AnyCap",
      articleDescription:
        "Guide to using Seedance 1.5 Pro through AnyCap for repeatable text-to-video and image-to-video workflows inside AI agent runtimes.",
      articleAbout: ["Seedance 1.5 Pro", "Video generation", "AnyCap", "AI agents"],
      articleKeywords: ["seedance 1.5 pro", "seedance 1.5 pro api", "image to video", "text to video", "anycap"],
    },
    breadcrumbItems: [
      { name: "Home", href: "/" },
      { name: "Models", href: "/models" },
      { name: "Seedance 1.5 Pro", href: SEEDANCE_15_PRO_PATH },
    ],
    eyebrow: "Model",
    lastUpdatedLabel: "Last updated April 5, 2026",
    hero: {
      titleLine1: "Seedance 1.5 Pro",
      titleLine2: "for AI agents",
      intro:
        "Seedance 1.5 Pro is a practical default when an agent needs reliable video generation without branching into a separate provider workflow. Through AnyCap, teams can use Seedance 1.5 Pro through the same CLI they already use for Veo 3.1, Kling 3.0, image generation, and follow-up review tasks.",
    },
    showcaseLabels: {
      generatedExampleLabel: "Generated example",
      signalsLabel: "Why it helps this page",
    },
    showcase: {
      modelName: "Seedance 1.5 Pro",
      href: SEEDANCE_15_PRO_PATH,
      sectionTitle: "Illustrative still for a steadier production workflow",
      intro:
        "Seedance 1.5 Pro is described on this page as a dependable default for repeatable team work. This still uses a cleaner commercial storyboard setup to match that production-friendly positioning.",
      promptLabel: "Illustrative still prompt",
      prompt:
        "clean product reveal stage with a smartphone floating above layered cards, parallax-friendly composition, soft studio lighting, steady commercial storyboard still, off-white and charcoal palette, no text, no watermark",
      caption:
        "This companion still was generated through AnyCap to show the kind of stable product-visual brief that fits Seedance 1.5 Pro's role in a team workflow.",
      note:
        "The image acts as a planning artifact, not as a claim about the final video itself. It is there to make the page's image-to-video use cases more concrete.",
      signals: [
        "Visually supports the page's message about repeatable, production-friendly motion briefs.",
        "Makes the screenshot-to-video and product-demo use cases easier to understand at a glance.",
        "Adds original multimedia without over-claiming what a static frame can prove about motion quality.",
      ],
      images: [
        {
          src: SEEDANCE_SHOWCASE_IMAGE_SRC,
          alt: "Clean product reveal still with a floating smartphone above layered cards in soft studio lighting.",
          width: 1376,
          height: 768,
          label: "Companion keyframe",
        },
      ],
    },
    useCasesTitle: "When agents should choose Seedance 1.5 Pro",
    useCases: [
      "Production-friendly image-to-video workflows that need steady visual continuity",
      "Text-to-video tasks where the agent needs a dependable default instead of a style experiment",
      "Product demos, launch visuals, and explainers built from screenshots or reference frames",
      "Teams that want one repeatable model across planning, generation, and review loops",
    ],
    callSectionTitle: "Call Seedance 1.5 Pro through AnyCap",
    callExamples: [
      {
        label: "Generate from a text prompt",
        code:
          'anycap video generate --model seedance-1.5-pro --prompt "a clean product reveal with subtle camera motion" -o seedance-demo.mp4',
      },
      {
        label: "Animate a reference image",
        code:
          'anycap video generate --model seedance-1.5-pro --mode image-to-video --prompt "turn this still into a soft parallax movement" --param images=\'["./mockup.jpg"]\' -o seedance-animated.mp4',
      },
    ],
    workflowTitle: "Workflow placement",
    workflowParagraph:
      "In an agent workflow, Seedance 1.5 Pro is usually the default production model for short clips generated from prompts or still frames. The result can then continue into video analysis, documentation, or asset packaging without changing provider context.",
    workflowCards: [
      {
        eyebrow: "Upstream",
        body: "Planning, prompt engineering, reference-frame selection, and storyboard preparation.",
      },
      {
        eyebrow: "Downstream",
        body: "Review, follow-up edits, packaging, and analysis inside the rest of the agent stack.",
      },
    ],
    comparisonTitle: "Seedance 1.5 Pro vs nearby choices",
    comparisonHeaders: {
      dimension: "Dimension",
      primary: "Seedance 1.5 Pro",
      alternative: "Alternative",
    },
    comparisonRows: [
      {
        dimension: "Best fit",
        primary: "Dependable video generation and strong image-to-video output for repeatable team workflows",
        alternative: "Choose Kling 3.0 for stronger cinematic motion style or Veo 3.1 for premium first-pass output",
      },
      {
        dimension: "Workflow role",
        primary: "Default production model for short videos generated from prompts or still frames",
        alternative: "Use a sibling model when the task is more experimental or style-led",
      },
      {
        dimension: "Typical agent task",
        primary: "Animate a still frame, mockup, or screenshot into a short reviewable clip",
        alternative: "Send the result into video analysis, documentation, or asset packaging after generation",
      },
    ],
    faqTitle: "FAQ",
    faqItems: [
      {
        question: "What is Seedance 1.5 Pro best for?",
        answer:
          "Seedance 1.5 Pro is a strong fit for dependable image-to-video and text-to-video workflows where agents need repeatable output and solid motion quality.",
      },
      {
        question: "How do agents call Seedance 1.5 Pro through AnyCap?",
        answer:
          "Agents can call it with the AnyCap CLI using anycap video generate --model seedance-1.5-pro for text-to-video or image-to-video mode.",
      },
      {
        question: "Should I use Seedance 1.5 Pro or Kling 3.0?",
        answer:
          "Use Seedance 1.5 Pro when the priority is a steady production workflow and strong image-to-video output. Use Kling 3.0 when the workflow wants more cinematic motion style or more exploratory generation.",
      },
    ],
    nextActions: [
      { label: "Video Generation", href: "/capabilities/video-generation", primary: true },
      { label: "Kling 3.0", href: "/models/kling-3-0" },
      { label: "Veo 3.1", href: "/models/veo-3-1" },
    ],
  },
  "pt-br": {
    metadata: {
      title: "Seedance 1.5 Pro para agentes de IA — geração de vídeo pelo AnyCap",
      description:
        "Use o Seedance 1.5 Pro pelo AnyCap quando agentes de IA precisarem de fluxos confiáveis de texto para vídeo e imagem para vídeo em uma única CLI e um único runtime de capability.",
      openGraphTitle: "Seedance 1.5 Pro para agentes de IA — geração de vídeo pelo AnyCap",
      openGraphDescription:
        "Use o Seedance 1.5 Pro pelo AnyCap para fluxos de texto para vídeo e imagem para vídeo amigáveis à produção.",
      articleHeadline: "Seedance 1.5 Pro para agentes de IA — geração de vídeo pelo AnyCap",
      articleDescription:
        "Guia para usar o Seedance 1.5 Pro pelo AnyCap em fluxos repetíveis de texto para vídeo e imagem para vídeo dentro de runtimes de agentes de IA.",
      articleAbout: ["Seedance 1.5 Pro", "Geração de vídeo", "AnyCap", "agentes de IA"],
      articleKeywords: ["seedance 1.5 pro", "api seedance 1.5 pro", "imagem para vídeo", "texto para vídeo", "anycap"],
    },
    breadcrumbItems: [
      { name: "Início", href: "/" },
      { name: "Modelos", href: "/models" },
      { name: "Seedance 1.5 Pro", href: SEEDANCE_15_PRO_PATH },
    ],
    eyebrow: "Modelo",
    lastUpdatedLabel: "Atualizado em 5 de abril de 2026",
    hero: {
      titleLine1: "Seedance 1.5 Pro",
      titleLine2: "para agentes de IA",
      intro:
        "O Seedance 1.5 Pro é um default prático quando um agente precisa de geração de vídeo confiável sem abrir um fluxo separado com outro provedor. Pelo AnyCap, equipes podem usar o Seedance 1.5 Pro na mesma CLI que já usam para Veo 3.1, Kling 3.0, geração de imagens e tarefas de revisão posterior.",
    },
    showcaseLabels: {
      generatedExampleLabel: "Exemplo gerado",
      signalsLabel: "Por que isso ajuda esta página",
    },
    showcase: {
      modelName: "Seedance 1.5 Pro",
      href: SEEDANCE_15_PRO_PATH,
      sectionTitle: "Still ilustrativo para um fluxo de produção mais estável",
      intro:
        "O Seedance 1.5 Pro é apresentado nesta página como um default confiável para trabalho repetível em equipe. Este still usa uma configuração de storyboard comercial mais limpa para combinar com esse posicionamento amigável à produção.",
      promptLabel: "Prompt do still ilustrativo",
      prompt:
        "palco limpo de revelação de produto com um smartphone flutuando acima de cards empilhados, composição amigável a parallax, iluminação suave de estúdio, still de storyboard comercial estável, paleta off-white e carvão, sem texto, sem marca d'água",
      caption:
        "Este still de apoio foi gerado pelo AnyCap para mostrar o tipo de briefing visual de produto estável que combina com o papel do Seedance 1.5 Pro no fluxo de uma equipe.",
      note:
        "A imagem funciona como artefato de planejamento, não como afirmação sobre o vídeo final em si. Ela existe para tornar os casos de uso de imagem para vídeo mais concretos.",
      signals: [
        "Sustenta visualmente a mensagem da página sobre briefs de motion repetíveis e amigáveis à produção.",
        "Torna os casos de uso de screenshot para vídeo e demo de produto mais fáceis de entender de imediato.",
        "Adiciona mídia original sem exagerar no que um frame estático consegue provar sobre qualidade de motion.",
      ],
      images: [
        {
          src: SEEDANCE_SHOWCASE_IMAGE_SRC,
          alt: "Still limpo de revelação de produto com um smartphone flutuando acima de cards empilhados em iluminação suave de estúdio.",
          width: 1376,
          height: 768,
          label: "Keyframe de apoio",
        },
      ],
    },
    useCasesTitle: "Quando os agentes devem escolher Seedance 1.5 Pro",
    useCases: [
      "Fluxos de imagem para vídeo amigáveis à produção que precisam de continuidade visual estável",
      "Tarefas de texto para vídeo quando o agente precisa de um default confiável em vez de um experimento de estilo",
      "Demos de produto, visuais de lançamento e explicadores construídos a partir de screenshots ou frames de referência",
      "Equipes que querem um único modelo repetível em loops de planejamento, geração e revisão",
    ],
    callSectionTitle: "Chame o Seedance 1.5 Pro pelo AnyCap",
    callExamples: [
      {
        label: "Gerar a partir de um prompt textual",
        code:
          'anycap video generate --model seedance-1.5-pro --prompt "uma revelação limpa de produto com movimento sutil de câmera" -o seedance-demo.mp4',
      },
      {
        label: "Animar uma imagem de referência",
        code:
          'anycap video generate --model seedance-1.5-pro --mode image-to-video --prompt "transforme este still em um movimento de parallax suave" --param images=\'["./mockup.jpg"]\' -o seedance-animated.mp4',
      },
    ],
    workflowTitle: "Posição no fluxo",
    workflowParagraph:
      "Em um fluxo de agente, o Seedance 1.5 Pro normalmente é o modelo de produção padrão para clipes curtos gerados a partir de prompts ou frames estáticos. O resultado pode então seguir para análise de vídeo, documentação ou empacotamento de assets sem mudar o contexto do provedor.",
    workflowCards: [
      {
        eyebrow: "Antes da geração",
        body: "Planejamento, engenharia de prompt, seleção de frame de referência e preparação de storyboard.",
      },
      {
        eyebrow: "Depois da geração",
        body: "Revisão, ajustes posteriores, empacotamento e análise no restante da stack de agentes.",
      },
    ],
    comparisonTitle: "Seedance 1.5 Pro vs escolhas próximas",
    comparisonHeaders: {
      dimension: "Dimensão",
      primary: "Seedance 1.5 Pro",
      alternative: "Alternativa",
    },
    comparisonRows: [
      {
        dimension: "Melhor ajuste",
        primary: "Geração de vídeo confiável e saída forte de imagem para vídeo para fluxos repetíveis de equipe",
        alternative: "Escolha o Kling 3.0 para estilo de motion cinematográfico mais forte ou o Veo 3.1 para output premium de primeira passagem",
      },
      {
        dimension: "Papel no fluxo",
        primary: "Modelo de produção padrão para vídeos curtos gerados a partir de prompts ou frames estáticos",
        alternative: "Use um modelo irmão quando a tarefa for mais experimental ou guiada por estilo",
      },
      {
        dimension: "Tarefa típica do agente",
        primary: "Animar um frame estático, mockup ou screenshot em um clipe curto revisável",
        alternative: "Enviar o resultado para análise de vídeo, documentação ou empacotamento de assets após a geração",
      },
    ],
    faqTitle: "Perguntas frequentes",
    faqItems: [
      {
        question: "Para que o Seedance 1.5 Pro é melhor?",
        answer:
          "O Seedance 1.5 Pro é uma boa escolha para fluxos confiáveis de imagem para vídeo e texto para vídeo quando os agentes precisam de saída repetível e boa qualidade de movimento.",
      },
      {
        question: "Como os agentes chamam o Seedance 1.5 Pro pelo AnyCap?",
        answer:
          "Os agentes podem chamá-lo com a CLI do AnyCap usando anycap video generate --model seedance-1.5-pro para modo texto para vídeo ou imagem para vídeo.",
      },
      {
        question: "Devo usar Seedance 1.5 Pro ou Kling 3.0?",
        answer:
          "Use o Seedance 1.5 Pro quando a prioridade for um fluxo de produção estável e uma saída forte de imagem para vídeo. Use o Kling 3.0 quando o fluxo quiser um estilo de motion cinematográfico mais forte ou uma geração mais exploratória.",
      },
    ],
    nextActions: [
      { label: "Geração de vídeo", href: "/capabilities/video-generation", primary: true },
      { label: "Kling 3.0", href: "/models/kling-3-0" },
      { label: "Veo 3.1", href: "/models/veo-3-1" },
    ],
  },
  id: {
    metadata: {
      title: "Seedance 1.5 Pro untuk agen AI — generasi video melalui AnyCap",
      description:
        "Gunakan Seedance 1.5 Pro melalui AnyCap saat agen AI membutuhkan alur text-to-video dan image-to-video yang andal lewat satu CLI dan satu runtime capability.",
      openGraphTitle: "Seedance 1.5 Pro untuk agen AI — generasi video melalui AnyCap",
      openGraphDescription:
        "Gunakan Seedance 1.5 Pro melalui AnyCap untuk alur text-to-video dan image-to-video yang ramah produksi.",
      articleHeadline: "Seedance 1.5 Pro untuk agen AI — generasi video melalui AnyCap",
      articleDescription:
        "Panduan menggunakan Seedance 1.5 Pro melalui AnyCap untuk alur text-to-video dan image-to-video yang dapat diulang di dalam runtime agen AI.",
      articleAbout: ["Seedance 1.5 Pro", "Generasi video", "AnyCap", "agen AI"],
      articleKeywords: ["seedance 1.5 pro", "api seedance 1.5 pro", "image to video", "text to video", "anycap"],
    },
    breadcrumbItems: [
      { name: "Beranda", href: "/" },
      { name: "Model", href: "/models" },
      { name: "Seedance 1.5 Pro", href: SEEDANCE_15_PRO_PATH },
    ],
    eyebrow: "Model",
    lastUpdatedLabel: "Diperbarui 5 April 2026",
    hero: {
      titleLine1: "Seedance 1.5 Pro",
      titleLine2: "untuk agen AI",
      intro:
        "Seedance 1.5 Pro adalah default yang praktis saat agen membutuhkan generasi video yang andal tanpa berpindah ke workflow provider terpisah. Melalui AnyCap, tim bisa memakai Seedance 1.5 Pro di CLI yang sama yang sudah dipakai untuk Veo 3.1, Kling 3.0, generasi gambar, dan tugas review lanjutan.",
    },
    showcaseLabels: {
      generatedExampleLabel: "Contoh hasil generasi",
      signalsLabel: "Mengapa ini membantu halaman ini",
    },
    showcase: {
      modelName: "Seedance 1.5 Pro",
      href: SEEDANCE_15_PRO_PATH,
      sectionTitle: "Still ilustratif untuk workflow produksi yang lebih stabil",
      intro:
        "Seedance 1.5 Pro dijelaskan di halaman ini sebagai default yang andal untuk kerja tim yang berulang. Still ini memakai setup storyboard komersial yang lebih bersih agar selaras dengan positioning ramah produksi tersebut.",
      promptLabel: "Prompt still ilustratif",
      prompt:
        "panggung reveal produk yang bersih dengan smartphone melayang di atas kartu bertumpuk, komposisi ramah parallax, pencahayaan studio lembut, still storyboard komersial yang stabil, palet off-white dan charcoal, tanpa teks, tanpa watermark",
      caption:
        "Still pendamping ini dihasilkan melalui AnyCap untuk menunjukkan jenis briefing visual produk yang stabil dan cocok dengan peran Seedance 1.5 Pro dalam workflow tim.",
      note:
        "Gambar ini berfungsi sebagai artefak perencanaan, bukan klaim tentang video akhirnya sendiri. Fungsinya untuk membuat use case image-to-video lebih konkret.",
      signals: [
        "Mendukung pesan halaman tentang briefing motion yang bisa diulang dan ramah produksi.",
        "Membuat use case screenshot-to-video dan demo produk lebih mudah dipahami secara sekilas.",
        "Menambahkan media asli tanpa melebih-lebihkan apa yang bisa dibuktikan frame statis tentang kualitas motion.",
      ],
      images: [
        {
          src: SEEDANCE_SHOWCASE_IMAGE_SRC,
          alt: "Still reveal produk yang bersih dengan smartphone melayang di atas kartu bertumpuk dalam pencahayaan studio lembut.",
          width: 1376,
          height: 768,
          label: "Keyframe pendamping",
        },
      ],
    },
    useCasesTitle: "Saat agen harus memilih Seedance 1.5 Pro",
    useCases: [
      "Workflow image-to-video yang ramah produksi dan butuh kesinambungan visual yang stabil",
      "Tugas text-to-video ketika agen memerlukan default yang andal alih-alih eksperimen gaya",
      "Demo produk, visual peluncuran, dan penjelas yang dibangun dari screenshot atau frame referensi",
      "Tim yang ingin satu model yang bisa diulang dalam loop perencanaan, generasi, dan review",
    ],
    callSectionTitle: "Panggil Seedance 1.5 Pro lewat AnyCap",
    callExamples: [
      {
        label: "Hasilkan dari prompt teks",
        code:
          'anycap video generate --model seedance-1.5-pro --prompt "reveal produk yang bersih dengan gerakan kamera halus" -o seedance-demo.mp4',
      },
      {
        label: "Animasikan gambar referensi",
        code:
          'anycap video generate --model seedance-1.5-pro --mode image-to-video --prompt "ubah still ini menjadi gerakan parallax yang lembut" --param images=\'["./mockup.jpg"]\' -o seedance-animated.mp4',
      },
    ],
    workflowTitle: "Posisi dalam alur kerja",
    workflowParagraph:
      "Dalam alur agen, Seedance 1.5 Pro biasanya menjadi model produksi default untuk klip pendek yang dibuat dari prompt atau frame diam. Hasilnya kemudian bisa dilanjutkan ke analisis video, dokumentasi, atau packaging aset tanpa mengubah konteks provider.",
    workflowCards: [
      {
        eyebrow: "Hulu",
        body: "Perencanaan, engineering prompt, pemilihan frame referensi, dan persiapan storyboard.",
      },
      {
        eyebrow: "Hilir",
        body: "Review, revisi lanjutan, packaging, dan analisis di stack agen berikutnya.",
      },
    ],
    comparisonTitle: "Seedance 1.5 Pro vs pilihan terdekat",
    comparisonHeaders: {
      dimension: "Dimensi",
      primary: "Seedance 1.5 Pro",
      alternative: "Alternatif",
    },
    comparisonRows: [
      {
        dimension: "Paling cocok",
        primary: "Generasi video yang andal dan output image-to-video yang kuat untuk workflow tim yang bisa diulang",
        alternative: "Pilih Kling 3.0 untuk gaya motion sinematik yang lebih kuat atau Veo 3.1 untuk output premium first-pass",
      },
      {
        dimension: "Peran dalam workflow",
        primary: "Model produksi default untuk video pendek yang dihasilkan dari prompt atau frame diam",
        alternative: "Gunakan model saudara saat tugasnya lebih eksperimental atau lebih dipandu gaya",
      },
      {
        dimension: "Tugas tipikal agen",
        primary: "Menganimasikan frame diam, mockup, atau screenshot menjadi klip pendek yang bisa direview",
        alternative: "Mengirim hasil ke analisis video, dokumentasi, atau packaging aset setelah generasi",
      },
    ],
    faqTitle: "FAQ",
    faqItems: [
      {
        question: "Untuk apa Seedance 1.5 Pro paling bagus?",
        answer:
          "Seedance 1.5 Pro cocok untuk workflow image-to-video dan text-to-video yang andal, ketika agen membutuhkan output yang bisa diulang dan kualitas motion yang solid.",
      },
      {
        question: "Bagaimana agen memanggil Seedance 1.5 Pro lewat AnyCap?",
        answer:
          "Agen bisa memanggilnya dengan CLI AnyCap menggunakan anycap video generate --model seedance-1.5-pro untuk mode text-to-video atau image-to-video.",
      },
      {
        question: "Harus pakai Seedance 1.5 Pro atau Kling 3.0?",
        answer:
          "Gunakan Seedance 1.5 Pro saat prioritasnya adalah workflow produksi yang stabil dan output image-to-video yang kuat. Gunakan Kling 3.0 saat workflow membutuhkan gaya motion sinematik yang lebih kuat atau generasi yang lebih eksploratif.",
      },
    ],
    nextActions: [
      { label: "Generasi video", href: "/capabilities/video-generation", primary: true },
      { label: "Kling 3.0", href: "/models/kling-3-0" },
      { label: "Veo 3.1", href: "/models/veo-3-1" },
    ],
  },
} as const satisfies Record<SiteLocale, Seedance15ProPageContent>;

export function getSeedance15ProMetadata(locale: SiteLocale): Metadata {
  const content = contentByLocale[locale] ?? contentByLocale.en;

  return {
    title: content.metadata.title,
    description: content.metadata.description,
    alternates: { canonical: SEEDANCE_15_PRO_PATH },
    openGraph: {
      type: "website",
      locale: getLocaleConfig(locale).ogLocale,
      url: SEEDANCE_15_PRO_PATH,
      siteName: siteConfig.siteName,
      title: content.metadata.openGraphTitle,
      description: content.metadata.openGraphDescription,
    },
  };
}

export function getSeedance15ProPageData(locale: SiteLocale) {
  const content = contentByLocale[locale] ?? contentByLocale.en;

  return {
    ...content,
    modelGuideJsonLd: createTechArticleJsonLd({
      headline: content.metadata.articleHeadline,
      description: content.metadata.articleDescription,
      path: SEEDANCE_15_PRO_PATH,
      locale,
      about: [...content.metadata.articleAbout],
      keywords: [...content.metadata.articleKeywords],
      dateModified: LAST_UPDATED_ISO,
    }),
    faqJsonLd: createFaqPageJsonLd(content.faqItems),
  };
}

export type Seedance15ProPageData = ReturnType<typeof getSeedance15ProPageData>;
