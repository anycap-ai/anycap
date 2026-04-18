import type { Metadata } from "next";
import type { ModelDetailPageContent } from "@/app/(seo)/models/veo-3-1/Veo31PageView";
import type { ModelVisualShowcaseEntry } from "@/components/seo/ModelVisualShowcase";
import { createModelPageData, createModelPageMetadata } from "@/lib/seo/model-pages";
import { type SiteLocale } from "@/lib/site";

export const SEEDREAM_5_PATH = "/models/seedream-5";

const LAST_UPDATED_ISO = "2026-04-05";
const SHOWCASE_IMAGE_SRC =
  "https://cdn.anycap.ai/page_resource/models/seedream-5-showcase.jpg";

type LocaleContent = ModelDetailPageContent & {
  showcase: ModelVisualShowcaseEntry;
};

const contentByLocale = {
  en: {
    metadata: {
      title: "Seedream 5 for AI agents — Image generation through AnyCap",
      description:
        "Use Seedream 5 through AnyCap when AI agents need polished image generation with one CLI and one capability runtime. Learn when to choose Seedream 5, how to call it, and how it fits image workflows.",
      openGraphTitle: "Seedream 5 for AI agents — Image generation through AnyCap",
      openGraphDescription:
        "Use Seedream 5 through AnyCap when AI agents need polished image generation with one CLI and one capability runtime.",
      articleHeadline: "Seedream 5 for AI agents — Image generation through AnyCap",
      articleDescription:
        "Guide to using Seedream 5 through AnyCap when AI agents need polished first-pass image generation in a capability runtime.",
      articleAbout: ["Seedream 5", "Image generation", "AnyCap", "AI agents"],
      articleKeywords: ["seedream 5", "image generation", "anycap", "ai agent model guide"],
    },
    breadcrumbItems: [
      { name: "Home", href: "/" },
      { name: "Models", href: "/models" },
      { name: "Seedream 5", href: SEEDREAM_5_PATH },
    ],
    eyebrow: "Model",
    lastUpdatedLabel: "Last updated April 5, 2026",
    hero: {
      titleLine1: "Seedream 5",
      titleLine2: "for AI agents",
      intro:
        "Seedream 5 is a strong default when an agent needs image generation through AnyCap. It fits workflows where the agent starts from a text prompt and needs a polished visual result without custom provider integration. With AnyCap, agents can call Seedream 5 through the same CLI they use for other multimodal capabilities.",
    },
    showcaseLabels: {
      generatedExampleLabel: "Generated example",
      signalsLabel: "Why it helps this page",
    },
    showcase: {
      modelName: "Seedream 5",
      href: SEEDREAM_5_PATH,
      sectionTitle: "Generated example for a polished first pass",
      intro:
        "This page now shows a real Seedream 5 output generated through AnyCap. The brief aims for the kind of launch-ready product framing teams usually want before revision loops start.",
      promptLabel: "Prompt used with AnyCap",
      prompt:
        "premium SaaS product hero scene, matte graphite laptop on a warm off-white pedestal, floating translucent interface cards, subtle olive green accents, soft studio shadows, editorial lighting, crisp composition, premium marketing art, no readable text, no watermark",
      caption:
        "This visual was generated with Seedream 5 through AnyCap for this page, giving the guide a first-party example instead of stock art.",
      signals: [
        "Shows the cleaner first-pass composition Seedream 5 is meant to deliver from a prompt alone.",
        "Makes the page's main claim visually testable: polished output without a separate provider workflow.",
        "Adds original multimedia that supports E-E-A-T and makes the page easier for readers to scan.",
      ],
      images: [
        {
          src: SHOWCASE_IMAGE_SRC,
          alt: "Premium product hero scene with a graphite laptop on an off-white pedestal and floating translucent interface cards in soft studio lighting.",
          width: 2560,
          height: 1440,
          label: "Seedream 5 output",
        },
      ],
    },
    useCasesTitle: "When agents should choose Seedream 5",
    useCases: [
      "Marketing graphics and launch assets",
      "Product mockups and concept frames",
      "Editorial visuals and social thumbnails",
      "Agent workflows that need a polished image output on the first pass",
    ],
    callSectionTitle: "Call Seedream 5 through AnyCap",
    callExamples: [
      {
        label: "Generate a new image",
        code:
          'anycap image generate --model seedream-5 --prompt "a product hero shot on a neutral background"',
      },
      {
        label: "List available image models",
        code: "anycap image models",
      },
    ],
    comparisonTitle: "Seedream 5 vs nearby choices",
    comparisonHeaders: {
      dimension: "Dimension",
      primary: "Seedream 5",
      alternative: "Alternative",
    },
    comparisonRows: [
      {
        dimension: "Best fit",
        primary: "Polished first-pass generation for marketing, UI, and clean visual concepts",
        alternative: "Nano Banana Pro is a stronger fit when the workflow needs iterative image editing",
      },
      {
        dimension: "Workflow role",
        primary: "Primary generation model",
        alternative: "Use Nano Banana Pro after generation when the agent needs targeted edits",
      },
      {
        dimension: "Typical agent task",
        primary: "Turn a prompt into a finished visual asset",
        alternative: "Use a sibling model when the task starts from an existing image",
      },
    ],
    faqTitle: "FAQ",
    faqItems: [
      {
        question: "What is Seedream 5 best for?",
        answer:
          "Seedream 5 is best for first-pass image generation when an agent needs a polished result directly from a text prompt.",
      },
      {
        question: "How do agents call Seedream 5 through AnyCap?",
        answer:
          "Agents can call it with the AnyCap CLI using anycap image generate --model seedream-5 and a text prompt.",
      },
      {
        question: "Should I use Seedream 5 or Nano Banana Pro?",
        answer:
          "Use Seedream 5 for new image generation and Nano Banana Pro when the workflow starts from an existing image and needs editing.",
      },
    ],
    nextActions: [
      { label: "Image Generation", href: "/capabilities/image-generation", primary: true },
      { label: "Nano Banana Pro", href: "/models/nano-banana-pro" },
      { label: "Context Guide", href: "/guides/context-engineering-for-agents" },
    ],
  },
  "pt-br": {
    metadata: {
      title: "Seedream 5 para agentes de IA — geração de imagem pelo AnyCap",
      description:
        "Use o Seedream 5 pelo AnyCap quando agentes de IA precisarem de geração de imagem polida com uma única CLI e um único runtime de capability. Veja quando escolher o Seedream 5, como chamá-lo e como ele se encaixa em fluxos de imagem.",
      openGraphTitle: "Seedream 5 para agentes de IA — geração de imagem pelo AnyCap",
      openGraphDescription:
        "Use o Seedream 5 pelo AnyCap quando agentes de IA precisarem de geração de imagem polida com uma única CLI e um único runtime de capability.",
      articleHeadline: "Seedream 5 para agentes de IA — geração de imagem pelo AnyCap",
      articleDescription:
        "Guia para usar o Seedream 5 pelo AnyCap quando agentes de IA precisam de geração de imagem polida de primeira passagem em um runtime de capability.",
      articleAbout: ["Seedream 5", "Geração de imagem", "AnyCap", "agentes de IA"],
      articleKeywords: ["seedream 5", "geração de imagem", "anycap", "guia de modelo para agentes"],
    },
    breadcrumbItems: [
      { name: "Início", href: "/" },
      { name: "Modelos", href: "/models" },
      { name: "Seedream 5", href: SEEDREAM_5_PATH },
    ],
    eyebrow: "Modelo",
    lastUpdatedLabel: "Atualizado em 5 de abril de 2026",
    hero: {
      titleLine1: "Seedream 5",
      titleLine2: "para agentes de IA",
      intro:
        "O Seedream 5 é um default forte quando um agente precisa de geração de imagem pelo AnyCap. Ele se encaixa em fluxos em que o agente começa a partir de um prompt textual e precisa de um resultado visual polido sem integração customizada com outro provedor. Com o AnyCap, os agentes podem chamar o Seedream 5 pela mesma CLI usada para outras capabilities multimodais.",
    },
    showcaseLabels: {
      generatedExampleLabel: "Exemplo gerado",
      signalsLabel: "Por que isso ajuda esta página",
    },
    showcase: {
      modelName: "Seedream 5",
      href: SEEDREAM_5_PATH,
      sectionTitle: "Exemplo gerado para uma primeira passagem polida",
      intro:
        "Esta página agora mostra uma saída real do Seedream 5 gerada pelo AnyCap. O briefing busca o tipo de framing de produto pronto para lançamento que equipes normalmente querem antes dos loops de revisão começarem.",
      promptLabel: "Prompt usado com AnyCap",
      prompt:
        "cena hero premium de SaaS, laptop grafite fosco sobre pedestal off-white quente, cards de interface translúcidos flutuando, acentos sutis em verde oliva, sombras suaves de estúdio, iluminação editorial, composição nítida, arte de marketing premium, sem texto legível, sem marca d'água",
      caption:
        "Este visual foi gerado com Seedream 5 pelo AnyCap para esta página, dando ao guia um exemplo de primeira mão em vez de arte de estoque.",
      signals: [
        "Mostra a composição de primeira passagem mais limpa que o Seedream 5 foi feito para entregar a partir de um prompt sozinho.",
        "Torna a claim principal da página verificável visualmente: saída polida sem um workflow separado de provedor.",
        "Adiciona mídia original que sustenta E-E-A-T e deixa a página mais fácil de escanear.",
      ],
      images: [
        {
          src: SHOWCASE_IMAGE_SRC,
          alt: "Cena hero premium de produto com um laptop grafite sobre pedestal off-white e cards de interface translúcidos flutuando em iluminação suave de estúdio.",
          width: 2560,
          height: 1440,
          label: "Saída do Seedream 5",
        },
      ],
    },
    useCasesTitle: "Quando os agentes devem escolher Seedream 5",
    useCases: [
      "Gráficos de marketing e assets de lançamento",
      "Mockups de produto e frames de conceito",
      "Visuais editoriais e thumbnails sociais",
      "Workflows de agente que precisam de um resultado visual polido na primeira passagem",
    ],
    callSectionTitle: "Chame o Seedream 5 pelo AnyCap",
    callExamples: [
      {
        label: "Gerar uma nova imagem",
        code:
          'anycap image generate --model seedream-5 --prompt "uma foto hero de produto em fundo neutro"',
      },
      {
        label: "Listar os modelos de imagem disponíveis",
        code: "anycap image models",
      },
    ],
    comparisonTitle: "Seedream 5 vs escolhas próximas",
    comparisonHeaders: {
      dimension: "Dimensão",
      primary: "Seedream 5",
      alternative: "Alternativa",
    },
    comparisonRows: [
      {
        dimension: "Melhor ajuste",
        primary: "Geração de primeira passagem polida para marketing, UI e conceitos visuais limpos",
        alternative:
          "Nano Banana Pro é mais forte quando o workflow precisa de edição iterativa de imagem",
      },
      {
        dimension: "Papel no fluxo",
        primary: "Modelo principal de geração",
        alternative: "Use Nano Banana Pro depois da geração quando o agente precisar de edições pontuais",
      },
      {
        dimension: "Tarefa típica do agente",
        primary: "Transformar um prompt em um asset visual finalizado",
        alternative: "Use um modelo irmão quando a tarefa começar de uma imagem já existente",
      },
    ],
    faqTitle: "FAQ",
    faqItems: [
      {
        question: "Para que o Seedream 5 é melhor?",
        answer:
          "Seedream 5 é melhor para geração de imagem de primeira passagem quando um agente precisa de um resultado polido diretamente de um prompt textual.",
      },
      {
        question: "Como os agentes chamam o Seedream 5 pelo AnyCap?",
        answer:
          "Os agentes podem chamá-lo com a CLI do AnyCap usando anycap image generate --model seedream-5 e um prompt textual.",
      },
      {
        question: "Devo usar Seedream 5 ou Nano Banana Pro?",
        answer:
          "Use Seedream 5 para gerar imagens novas e Nano Banana Pro quando o fluxo começa de uma imagem existente e precisa de edição.",
      },
    ],
    nextActions: [
      { label: "Geração de imagem", href: "/capabilities/image-generation", primary: true },
      { label: "Nano Banana Pro", href: "/models/nano-banana-pro" },
      { label: "Guia de contexto", href: "/guides/context-engineering-for-agents" },
    ],
  },
  id: {
    metadata: {
      title: "Seedream 5 untuk agen AI — generasi gambar melalui AnyCap",
      description:
        "Gunakan Seedream 5 melalui AnyCap saat agen AI membutuhkan generasi gambar yang rapi lewat satu CLI dan satu runtime capability. Pelajari kapan memilih Seedream 5, cara memanggilnya, dan bagaimana ia cocok ke workflow gambar.",
      openGraphTitle: "Seedream 5 untuk agen AI — generasi gambar melalui AnyCap",
      openGraphDescription:
        "Gunakan Seedream 5 melalui AnyCap saat agen AI membutuhkan generasi gambar yang rapi lewat satu CLI dan satu runtime capability.",
      articleHeadline: "Seedream 5 untuk agen AI — generasi gambar melalui AnyCap",
      articleDescription:
        "Panduan menggunakan Seedream 5 melalui AnyCap saat agen AI membutuhkan generasi gambar first-pass yang rapi di dalam runtime capability.",
      articleAbout: ["Seedream 5", "Generasi gambar", "AnyCap", "agen AI"],
      articleKeywords: ["seedream 5", "generasi gambar", "anycap", "panduan model untuk agen"],
    },
    breadcrumbItems: [
      { name: "Beranda", href: "/" },
      { name: "Model", href: "/models" },
      { name: "Seedream 5", href: SEEDREAM_5_PATH },
    ],
    eyebrow: "Model",
    lastUpdatedLabel: "Diperbarui 5 April 2026",
    hero: {
      titleLine1: "Seedream 5",
      titleLine2: "untuk agen AI",
      intro:
        "Seedream 5 adalah default yang kuat saat agen membutuhkan generasi gambar melalui AnyCap. Model ini cocok untuk workflow yang dimulai dari prompt teks dan membutuhkan hasil visual yang rapi tanpa integrasi custom ke provider lain. Dengan AnyCap, agen dapat memanggil Seedream 5 lewat CLI yang sama yang dipakai untuk capability multimodal lainnya.",
    },
    showcaseLabels: {
      generatedExampleLabel: "Contoh hasil generasi",
      signalsLabel: "Mengapa ini membantu halaman ini",
    },
    showcase: {
      modelName: "Seedream 5",
      href: SEEDREAM_5_PATH,
      sectionTitle: "Contoh hasil generasi untuk first pass yang rapi",
      intro:
        "Halaman ini sekarang menampilkan output Seedream 5 yang nyata dan dihasilkan melalui AnyCap. Brief-nya mengarah ke framing produk siap rilis yang biasanya diinginkan tim sebelum loop revisi dimulai.",
      promptLabel: "Prompt yang dipakai dengan AnyCap",
      prompt:
        "scene hero SaaS premium, laptop grafit matte di atas pedestal off-white hangat, kartu antarmuka transparan melayang, aksen hijau zaitun yang halus, bayangan studio lembut, pencahayaan editorial, komposisi tajam, karya marketing premium, tanpa teks terbaca, tanpa watermark",
      caption:
        "Visual ini dihasilkan dengan Seedream 5 melalui AnyCap untuk halaman ini, sehingga panduannya memakai contoh first-party alih-alih stock art.",
      signals: [
        "Menunjukkan komposisi first-pass yang lebih bersih yang memang ditargetkan Seedream 5 dari sebuah prompt saja.",
        "Membuat klaim utama halaman ini bisa diverifikasi secara visual: output rapi tanpa workflow provider terpisah.",
        "Menambahkan media asli yang mendukung E-E-A-T dan membuat halaman lebih mudah dipindai.",
      ],
      images: [
        {
          src: SHOWCASE_IMAGE_SRC,
          alt: "Scene hero produk premium dengan laptop grafit di atas pedestal off-white dan kartu antarmuka transparan yang melayang dalam pencahayaan studio lembut.",
          width: 2560,
          height: 1440,
          label: "Output Seedream 5",
        },
      ],
    },
    useCasesTitle: "Saat agen harus memilih Seedream 5",
    useCases: [
      "Grafik marketing dan aset peluncuran",
      "Mockup produk dan frame konsep",
      "Visual editorial dan thumbnail sosial",
      "Workflow agen yang membutuhkan output visual rapi di first pass",
    ],
    callSectionTitle: "Panggil Seedream 5 lewat AnyCap",
    callExamples: [
      {
        label: "Hasilkan gambar baru",
        code:
          'anycap image generate --model seedream-5 --prompt "foto hero produk di latar netral"',
      },
      {
        label: "Lihat model gambar yang tersedia",
        code: "anycap image models",
      },
    ],
    comparisonTitle: "Seedream 5 vs pilihan terdekat",
    comparisonHeaders: {
      dimension: "Dimensi",
      primary: "Seedream 5",
      alternative: "Alternatif",
    },
    comparisonRows: [
      {
        dimension: "Paling cocok",
        primary: "Generasi first-pass yang rapi untuk marketing, UI, dan konsep visual bersih",
        alternative:
          "Nano Banana Pro lebih kuat saat workflow membutuhkan editing gambar iteratif",
      },
      {
        dimension: "Peran dalam workflow",
        primary: "Model generasi utama",
        alternative: "Gunakan Nano Banana Pro setelah generasi ketika agen perlu edit terarah",
      },
      {
        dimension: "Tugas tipikal agen",
        primary: "Mengubah prompt menjadi asset visual yang selesai",
        alternative: "Gunakan model saudara ketika tugasnya dimulai dari gambar yang sudah ada",
      },
    ],
    faqTitle: "FAQ",
    faqItems: [
      {
        question: "Untuk apa Seedream 5 paling bagus?",
        answer:
          "Seedream 5 paling bagus untuk generasi gambar first-pass ketika agen membutuhkan hasil yang rapi langsung dari prompt teks.",
      },
      {
        question: "Bagaimana agen memanggil Seedream 5 lewat AnyCap?",
        answer:
          "Agen dapat memanggilnya dengan CLI AnyCap menggunakan anycap image generate --model seedream-5 dan prompt teks.",
      },
      {
        question: "Harus pakai Seedream 5 atau Nano Banana Pro?",
        answer:
          "Gunakan Seedream 5 untuk menghasilkan gambar baru dan Nano Banana Pro saat workflow dimulai dari gambar yang sudah ada dan butuh editing.",
      },
    ],
    nextActions: [
      { label: "Generasi gambar", href: "/capabilities/image-generation", primary: true },
      { label: "Nano Banana Pro", href: "/models/nano-banana-pro" },
      { label: "Panduan konteks", href: "/guides/context-engineering-for-agents" },
    ],
  },
  de: {
    metadata: {
      title: "Seedream 5 für KI-Agenten – Bildgenerierung über AnyCap",
      description:
        "Nutzen Sie Seedream 5 über AnyCap, wenn KI-Agenten polierte Bildgenerierung mit einer einzigen CLI und einer Capability-Runtime benötigen. Erfahren Sie, wann Sie Seedream 5 wählen, wie Sie es aufrufen und wie es in Bild-Workflows passt.",
      openGraphTitle: "Seedream 5 für KI-Agenten – Bildgenerierung über AnyCap",
      openGraphDescription:
        "Nutzen Sie Seedream 5 über AnyCap, wenn KI-Agenten polierte Bildgenerierung mit einer einzigen CLI und einer Capability-Runtime benötigen.",
      articleHeadline: "Seedream 5 für KI-Agenten – Bildgenerierung über AnyCap",
      articleDescription:
        "Leitfaden zur Nutzung von Seedream 5 über AnyCap, wenn KI-Agenten polierte Erstdurchlauf-Bildgenerierung in einer Capability-Runtime benötigen.",
      articleAbout: ["Seedream 5", "Bildgenerierung", "AnyCap", "KI-Agenten"],
      articleKeywords: ["seedream 5", "bildgenerierung", "anycap", "modell-leitfaden für ki-agenten"],
    },
    breadcrumbItems: [
      { name: "Startseite", href: "/" },
      { name: "Modelle", href: "/models" },
      { name: "Seedream 5", href: SEEDREAM_5_PATH },
    ],
    eyebrow: "Modell",
    lastUpdatedLabel: "Aktualisiert am 5. April 2026",
    hero: {
      titleLine1: "Seedream 5",
      titleLine2: "für KI-Agenten",
      intro:
        "Seedream 5 ist ein starker Standard, wenn ein Agent Bildgenerierung über AnyCap benötigt. Es passt zu Workflows, in denen der Agent von einem Text-Prompt aus startet und ein poliertes visuelles Ergebnis ohne benutzerdefinierte Provider-Integration benötigt. Mit AnyCap können Agenten Seedream 5 über dieselbe CLI aufrufen, die sie für andere multimodale Capabilities nutzen.",
    },
    showcaseLabels: {
      generatedExampleLabel: "Generiertes Beispiel",
      signalsLabel: "Warum das dieser Seite hilft",
    },
    showcase: {
      modelName: "Seedream 5",
      href: SEEDREAM_5_PATH,
      sectionTitle: "Generiertes Beispiel für einen polierten Erstdurchlauf",
      intro:
        "Diese Seite zeigt jetzt einen echten Seedream 5-Output, generiert über AnyCap. Das Briefing zielt auf die Art launchbereiter Produkt-Framings ab, die Teams üblicherweise vor dem Start von Überarbeitungsschleifen haben möchten.",
      promptLabel: "Mit AnyCap verwendeter Prompt",
      prompt:
        "Premium-SaaS-Produkt-Hero-Szene, matter Graphit-Laptop auf einem warmen, cremeweißen Sockel, schwebende, transluzente Interface-Karten, dezente olivgrüne Akzente, weiche Studioschatten, editoriales Licht, scharfe Komposition, hochwertige Marketing-Kunst, kein lesbarer Text, kein Wasserzeichen",
      caption:
        "Dieses Visual wurde mit Seedream 5 über AnyCap für diese Seite generiert und gibt dem Leitfaden ein eigenes Beispiel statt Stockfoto-Material.",
      signals: [
        "Zeigt die sauberere Erstdurchlauf-Komposition, die Seedream 5 allein aus einem Prompt liefern soll.",
        "Macht die Hauptaussage der Seite visuell überprüfbar: polierter Output ohne separaten Provider-Workflow.",
        "Fügt eigenes Multimedia hinzu, das E-E-A-T unterstützt und die Seite leichter scanbar macht.",
      ],
      images: [
        {
          src: SHOWCASE_IMAGE_SRC,
          alt: "Premium-Produkt-Hero-Szene mit einem Graphit-Laptop auf einem cremeweißen Sockel und schwebenden, transluzenten Interface-Karten in weichem Studiolicht.",
          width: 2560,
          height: 1440,
          label: "Seedream 5-Output",
        },
      ],
    },
    useCasesTitle: "Wann Agenten Seedream 5 wählen sollten",
    useCases: [
      "Marketing-Grafiken und Launch-Assets",
      "Produkt-Mockups und Konzept-Frames",
      "Editorial-Visuals und Social-Thumbnails",
      "Agenten-Workflows, die im Erstdurchlauf einen polierten Bild-Output benötigen",
    ],
    callSectionTitle: "Seedream 5 über AnyCap aufrufen",
    callExamples: [
      {
        label: "Ein neues Bild generieren",
        code:
          'anycap image generate --model seedream-5 --prompt "a product hero shot on a neutral background"',
      },
      {
        label: "Verfügbare Bildmodelle auflisten",
        code: "anycap image models",
      },
    ],
    comparisonTitle: "Seedream 5 vs. nahe Alternativen",
    comparisonHeaders: {
      dimension: "Dimension",
      primary: "Seedream 5",
      alternative: "Alternative",
    },
    comparisonRows: [
      {
        dimension: "Bester Einsatz",
        primary: "Polierte Erstdurchlauf-Generierung für Marketing, UI und saubere visuelle Konzepte",
        alternative: "Nano Banana Pro passt besser, wenn der Workflow iterative Bildbearbeitung benötigt",
      },
      {
        dimension: "Rolle im Workflow",
        primary: "Primäres Generierungsmodell",
        alternative: "Nutzen Sie Nano Banana Pro nach der Generierung, wenn der Agent gezielte Bearbeitungen benötigt",
      },
      {
        dimension: "Typische Agenten-Aufgabe",
        primary: "Einen Prompt in ein fertiges visuelles Asset verwandeln",
        alternative: "Nutzen Sie ein Schwestermodell, wenn die Aufgabe von einem bestehenden Bild ausgeht",
      },
    ],
    faqTitle: "FAQ",
    faqItems: [
      {
        question: "Wofür eignet sich Seedream 5 am besten?",
        answer:
          "Seedream 5 eignet sich am besten für Erstdurchlauf-Bildgenerierung, wenn ein Agent direkt aus einem Text-Prompt ein poliertes Ergebnis benötigt.",
      },
      {
        question: "Wie rufen Agenten Seedream 5 über AnyCap auf?",
        answer:
          "Agenten können es mit der AnyCap CLI über anycap image generate --model seedream-5 mit einem Text-Prompt aufrufen.",
      },
      {
        question: "Soll ich Seedream 5 oder Nano Banana Pro verwenden?",
        answer:
          "Verwenden Sie Seedream 5 für neue Bildgenerierung und Nano Banana Pro, wenn der Workflow von einem bestehenden Bild ausgeht und Bearbeitung benötigt.",
      },
    ],
    nextActions: [
      { label: "Bildgenerierung", href: "/capabilities/image-generation", primary: true },
      { label: "Nano Banana Pro", href: "/models/nano-banana-pro" },
      { label: "Kontext-Leitfaden", href: "/guides/context-engineering-for-agents" },
    ],
  },
} as const satisfies Record<SiteLocale, LocaleContent>;

export function getSeedream5Metadata(locale: SiteLocale): Metadata {
  const content = contentByLocale[locale] ?? contentByLocale.en;

  return createModelPageMetadata(locale, SEEDREAM_5_PATH, content.metadata);
}

export function getSeedream5PageData(locale: SiteLocale) {
  return createModelPageData(locale, SEEDREAM_5_PATH, contentByLocale, LAST_UPDATED_ISO);
}

export type Seedream5PageData = ReturnType<typeof getSeedream5PageData>;
