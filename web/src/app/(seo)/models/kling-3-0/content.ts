import type { Metadata } from "next";
import { createModelPageData, createModelPageMetadata } from "@/lib/seo/model-pages";
import { type SiteLocale } from "@/lib/site";

export const KLING_30_PATH = "/models/kling-3-0";

const LAST_UPDATED_ISO = "2026-04-05";
const KLING_SHOWCASE_IMAGE_SRC = "https://cdn.anycap.ai/page_resource/models/kling-3-0-keyframe.jpg";

type Kling30ComparisonRow = {
  dimension: string;
  primary: string;
  alternative: string;
};

type Kling30FaqItem = {
  question: string;
  answer: string;
};

type Kling30CallExample = {
  label: string;
  code: string;
};

type Kling30WorkflowCard = {
  eyebrow: string;
  body: string;
};

type Kling30SpecRow = {
  spec: string;
  value: string;
};

type Kling30MultiModelRow = {
  dimension: string;
  kling: string;
  veo: string;
  seedance: string;
};

type Kling30PageContent = {
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
  specsTitle?: string;
  specRows?: readonly Kling30SpecRow[];
  useCasesTitle: string;
  useCases: readonly string[];
  callSectionTitle: string;
  callExamples: readonly Kling30CallExample[];
  workflowTitle: string;
  workflowParagraph: string;
  workflowCards: readonly Kling30WorkflowCard[];
  multiModelTitle?: string;
  multiModelIntro?: string;
  multiModelHeaders?: {
    dimension: string;
    kling: string;
    veo: string;
    seedance: string;
  };
  multiModelRows?: readonly Kling30MultiModelRow[];
  comparisonTitle: string;
  comparisonHeaders: {
    dimension: string;
    primary: string;
    alternative: string;
  };
  comparisonRows: readonly Kling30ComparisonRow[];
  faqTitle: string;
  faqItems: readonly Kling30FaqItem[];
  nextActions: readonly { label: string; href: string; primary?: boolean }[];
};

const contentByLocale = {
  en: {
    metadata: {
      title: "Kling 3.0 for AI agents — Video generation through AnyCap",
      description:
        "Kling 3.0 generates realistic motion, cinematic scenes, and image-to-video clips up to 15s with native audio sync. Call it from any AI agent through AnyCap.",
      openGraphTitle: "Kling 3.0 for AI agents — Video generation through AnyCap",
      openGraphDescription:
        "Use Kling 3.0 through AnyCap for text-to-video and image-to-video workflows inside one agent runtime.",
      articleHeadline: "Kling 3.0 for AI agents — Video generation through AnyCap",
      articleDescription:
        "Guide to using Kling 3.0 through AnyCap for realistic text-to-video and image-to-video workflows inside AI agent runtimes.",
      articleAbout: ["Kling 3.0", "Video generation", "AnyCap", "AI agents"],
      articleKeywords: [
        "kling 3.0",
        "kling 3.0 api",
        "kling 3.0 vs veo",
        "kling 3.0 vs sora",
        "image to video",
        "video generation api",
        "ai agent video generation",
        "anycap",
      ],
    },
    breadcrumbItems: [
      { name: "Home", href: "/" },
      { name: "Models", href: "/models" },
      { name: "Kling 3.0", href: KLING_30_PATH },
    ],
    eyebrow: "Model",
    lastUpdatedLabel: "Last updated April 5, 2026",
    hero: {
      titleLine1: "Kling 3.0",
      titleLine2: "for AI agents",
      intro:
        "Kling 3.0 is a strong fit when an agent needs realistic motion and cinematic scene generation through one video runtime. Through AnyCap, teams can keep Kling 3.0 in the same CLI and auth flow they already use for Veo 3.1, Seedance 1.5 Pro, image generation, and downstream analysis tasks.",
    },
    showcaseLabels: {
      generatedExampleLabel: "Generated example",
      signalsLabel: "Why it helps this page",
    },
    showcase: {
      modelName: "Kling 3.0",
      href: KLING_30_PATH,
      sectionTitle: "Illustrative keyframe for realistic motion and scene continuity",
      intro:
        "Kling 3.0 is often chosen for realistic motion and cinematic image-to-video work. This still is there to show the kind of moody, motion-ready scene brief that fits that job.",
      promptLabel: "Illustrative still prompt",
      prompt:
        "rain-soaked cinematic street scene at night, lone person under a transparent umbrella, reflective pavement, abstract light streaks, realistic moody still with strong motion implication, no storefront signs, no billboards, no text, no watermark",
      caption:
        "This companion still was generated through AnyCap to make the Kling 3.0 page feel more grounded in a real scene brief instead of only listing features.",
      note:
        "Kling 3.0 produces video, not a single frame. The image below works as a visual proxy for the kind of cinematic source scene teams may animate.",
      signals: [
        "Makes the realistic-motion positioning more tangible than text alone.",
        "Helps the image-to-video explanation land by starting from a scene that already implies movement.",
        "Adds first-party multimedia that separates the page from thinner model roundups.",
      ],
      images: [
        {
          src: KLING_SHOWCASE_IMAGE_SRC,
          alt: "Rainy neon street scene at night with a lone person under a transparent umbrella and reflections on wet pavement.",
          width: 1376,
          height: 768,
          label: "Companion keyframe",
        },
      ],
    },
    specsTitle: "Kling 3.0 specs at a glance",
    specRows: [
      { spec: "Output", value: "Video clips, 5–15 seconds, up to 1080p" },
      { spec: "Modes", value: "Text-to-video, image-to-video, multi-shot scene continuation" },
      { spec: "Audio", value: "Native audio-visual sync (dialogue, ambient, sound effects)" },
      { spec: "Character consistency", value: "Maintains subject across shots within a scene" },
      { spec: "Storyboard", value: "Multi-shot planning from a single prompt" },
      { spec: "Strengths", value: "Realistic motion, cinematic lighting, image-to-video continuity" },
      { spec: "AnyCap CLI", value: "anycap video generate --model kling-3.0" },
    ],
    useCasesTitle: "When agents should choose Kling 3.0",
    useCases: [
      "Realistic motion and cinematic scene generation",
      "Image-to-video workflows that need stronger visual continuity",
      "Multi-shot drafts where character consistency matters across cuts",
      "Clips that need native audio-visual sync without a separate audio pass",
      "Agent-driven video drafts for demos, ads, and short product clips up to 15 seconds",
      "Teams that want Kling 3.0 in the same runtime as Veo 3.1 and Seedance 1.5 Pro",
    ],
    callSectionTitle: "Call Kling 3.0 through AnyCap",
    callExamples: [
      {
        label: "Generate a new clip",
        code:
          'anycap video generate --model kling-3.0 --prompt "a cinematic street scene in the rain with neon reflections" -o kling-scene.mp4',
      },
      {
        label: "Animate a reference image",
        code:
          'anycap video generate --model kling-3.0 --mode image-to-video --prompt "slow push-in with subtle environmental motion" --param images=\'["./frame.jpg"]\' -o kling-animated.mp4',
      },
    ],
    workflowTitle: "Workflow placement",
    workflowParagraph:
      "In an agent workflow, Kling 3.0 often serves as the generation step that turns a prompt or reference frame into a motion-rich draft. The result can then flow into review, packaging, or follow-up analysis without leaving the AnyCap runtime.",
    workflowCards: [
      {
        eyebrow: "Upstream",
        body: "Context engineering, prompt shaping, reference-frame selection, and scene planning.",
      },
      {
        eyebrow: "Downstream",
        body: "Review, clip packaging, video analysis, and distribution across the rest of the agent stack.",
      },
    ],
    multiModelTitle: "Kling 3.0 vs Veo 3.1 vs Seedance 1.5 Pro",
    multiModelIntro:
      "All three are first-class video models in AnyCap. Pick the one that matches the workflow — agents can switch between them with one CLI flag.",
    multiModelHeaders: {
      dimension: "Dimension",
      kling: "Kling 3.0",
      veo: "Veo 3.1",
      seedance: "Seedance 1.5 Pro",
    },
    multiModelRows: [
      {
        dimension: "Best fit",
        kling: "Realistic motion, cinematic image-to-video",
        veo: "Premium cinematic first pass, prompt fidelity",
        seedance: "Steady production runs, consistent style",
      },
      {
        dimension: "Max duration",
        kling: "Up to 15 seconds",
        veo: "Up to 8 seconds",
        seedance: "Up to 10 seconds",
      },
      {
        dimension: "Native audio",
        kling: "Yes — dialogue, ambient, SFX",
        veo: "Yes — synced ambient + speech",
        seedance: "Audio added downstream",
      },
      {
        dimension: "Image-to-video",
        kling: "Strong — preserves source frame style",
        veo: "Supported, leans toward reinterpretation",
        seedance: "Supported, optimized for product shots",
      },
      {
        dimension: "Character consistency",
        kling: "Strong within a scene",
        veo: "Strong, especially with reference image",
        seedance: "Steady across batch runs",
      },
      {
        dimension: "AnyCap CLI",
        kling: "--model kling-3.0",
        veo: "--model veo-3.1",
        seedance: "--model seedance-1.5-pro",
      },
    ],
    comparisonTitle: "Kling 3.0 vs nearby choices",
    comparisonHeaders: {
      dimension: "Dimension",
      primary: "Kling 3.0",
      alternative: "Alternative",
    },
    comparisonRows: [
      {
        dimension: "Best fit",
        primary: "Realistic motion, cinematic scenes, and flexible image-to-video output",
        alternative: "Choose Veo 3.1 for premium cinematic output or Seedance 1.5 Pro for steadier production workflows",
      },
      {
        dimension: "Workflow role",
        primary: "Creative generation model for new clips and animated stills",
        alternative: "Use a sibling model when the workflow is optimized for a different motion style or budget target",
      },
      {
        dimension: "Typical agent task",
        primary: "Turn a prompt or reference frame into a moving scene draft",
        alternative: "Route downstream into video analysis, review, or packaging once the clip is generated",
      },
    ],
    faqTitle: "FAQ",
    faqItems: [
      {
        question: "What is Kling 3.0 best for?",
        answer:
          "Kling 3.0 is a strong fit for realistic motion, cinematic visual style, and image-to-video workflows where agents need more than a basic draft clip.",
      },
      {
        question: "How do agents call Kling 3.0 through AnyCap?",
        answer:
          "Agents can call it with the AnyCap CLI using anycap video generate --model kling-3.0 and a prompt or image-to-video mode.",
      },
      {
        question: "Should I use Kling 3.0 or Veo 3.1?",
        answer:
          "Use Kling 3.0 when the workflow leans toward realistic motion and flexible image-to-video iteration. Use Veo 3.1 when the priority is a premium cinematic first pass.",
      },
      {
        question: "How long can a Kling 3.0 clip be?",
        answer:
          "Kling 3.0 generates clips up to 15 seconds, with multi-shot scene continuation that maintains character consistency across cuts within a scene.",
      },
      {
        question: "Does Kling 3.0 support native audio?",
        answer:
          "Yes. Kling 3.0 produces audio-visual synced output including dialogue, ambient sound, and effects in the same generation pass — no separate audio model required.",
      },
      {
        question: "Can Kling 3.0 animate a reference image?",
        answer:
          "Yes. Image-to-video mode takes a source frame and a motion prompt, then preserves the source style while adding motion. In AnyCap, pass --mode image-to-video and reference images via --param.",
      },
    ],
    nextActions: [
      { label: "Video Generation", href: "/capabilities/video-generation", primary: true },
      { label: "Veo 3.1", href: "/models/veo-3-1" },
      { label: "Seedance 1.5 Pro", href: "/models/seedance-1-5-pro" },
    ],
  },
  "pt-br": {
    metadata: {
      title: "Kling 3.0 para agentes de IA — geração de vídeo pelo AnyCap",
      description:
        "Use o Kling 3.0 pelo AnyCap quando agentes de IA precisarem de movimento realista, geração de cenas cinematográficas e fluxos de imagem para vídeo em uma única CLI.",
      openGraphTitle: "Kling 3.0 para agentes de IA — geração de vídeo pelo AnyCap",
      openGraphDescription:
        "Use o Kling 3.0 pelo AnyCap para fluxos de texto para vídeo e imagem para vídeo dentro de um único runtime de agente.",
      articleHeadline: "Kling 3.0 para agentes de IA — geração de vídeo pelo AnyCap",
      articleDescription:
        "Guia para usar o Kling 3.0 pelo AnyCap em fluxos realistas de texto para vídeo e imagem para vídeo dentro de runtimes de agentes de IA.",
      articleAbout: ["Kling 3.0", "Geração de vídeo", "AnyCap", "agentes de IA"],
      articleKeywords: ["kling 3.0", "api kling 3.0", "imagem para vídeo", "geração de vídeo", "anycap"],
    },
    breadcrumbItems: [
      { name: "Início", href: "/" },
      { name: "Modelos", href: "/models" },
      { name: "Kling 3.0", href: KLING_30_PATH },
    ],
    eyebrow: "Modelo",
    lastUpdatedLabel: "Atualizado em 5 de abril de 2026",
    hero: {
      titleLine1: "Kling 3.0",
      titleLine2: "para agentes de IA",
      intro:
        "O Kling 3.0 é uma boa escolha quando um agente precisa de movimento realista e geração de cenas cinematográficas em um único runtime de vídeo. Pelo AnyCap, equipes podem manter o Kling 3.0 no mesmo fluxo de CLI e autenticação já usado para Veo 3.1, Seedance 1.5 Pro, geração de imagens e tarefas de análise posterior.",
    },
    showcaseLabels: {
      generatedExampleLabel: "Exemplo gerado",
      signalsLabel: "Por que isso ajuda esta página",
    },
    showcase: {
      modelName: "Kling 3.0",
      href: KLING_30_PATH,
      sectionTitle: "Keyframe ilustrativo para movimento realista e continuidade de cena",
      intro:
        "O Kling 3.0 costuma ser escolhido para movimento realista e trabalho cinematográfico de imagem para vídeo. Este still serve para mostrar o tipo de briefing de cena sombrio e pronto para movimento que combina com essa função.",
      promptLabel: "Prompt do still ilustrativo",
      prompt:
        "cena cinematográfica de rua encharcada de chuva à noite, uma pessoa sob um guarda-chuva transparente, pavimento refletivo, faixas de luz abstratas, still realista e sombrio com forte sugestão de movimento, sem placas de loja, sem outdoors, sem texto, sem marca d'água",
      caption:
        "Este still de apoio foi gerado pelo AnyCap para deixar a página do Kling 3.0 mais conectada a um briefing real de cena, em vez de apenas listar recursos.",
      note:
        "O Kling 3.0 gera vídeo, não um único frame. A imagem abaixo funciona como proxy visual para o tipo de cena cinematográfica que as equipes podem animar.",
      signals: [
        "Torna a proposta de movimento realista mais tangível do que o texto sozinho.",
        "Ajuda a explicar imagem para vídeo partindo de uma cena que já sugere movimento.",
        "Adiciona mídia original que diferencia a página de resumos mais rasos de modelos.",
      ],
      images: [
        {
          src: KLING_SHOWCASE_IMAGE_SRC,
          alt: "Cena de rua neon chuvosa à noite com uma pessoa sob um guarda-chuva transparente e reflexos no asfalto molhado.",
          width: 1376,
          height: 768,
          label: "Keyframe de apoio",
        },
      ],
    },
    useCasesTitle: "Quando os agentes devem escolher Kling 3.0",
    useCases: [
      "Movimento realista e geração de cenas cinematográficas",
      "Fluxos de imagem para vídeo que precisam de continuidade visual mais forte",
      "Rascunhos de vídeo conduzidos por agentes para demos, anúncios e clipes curtos de produto",
      "Equipes que querem o Kling 3.0 no mesmo runtime do Veo 3.1 e do Seedance 1.5 Pro",
    ],
    callSectionTitle: "Chame o Kling 3.0 pelo AnyCap",
    callExamples: [
      {
        label: "Gerar um novo clipe",
        code:
          'anycap video generate --model kling-3.0 --prompt "uma cena cinematográfica de rua na chuva com reflexos neon" -o kling-scene.mp4',
      },
      {
        label: "Animar uma imagem de referência",
        code:
          'anycap video generate --model kling-3.0 --mode image-to-video --prompt "zoom lento com movimento ambiental sutil" --param images=\'["./frame.jpg"]\' -o kling-animated.mp4',
      },
    ],
    workflowTitle: "Posição no fluxo",
    workflowParagraph:
      "Em um fluxo de agente, o Kling 3.0 costuma atuar como a etapa de geração que transforma um prompt ou frame de referência em um draft com bastante movimento. O resultado pode então seguir para revisão, empacotamento ou análise posterior sem sair do runtime do AnyCap.",
    workflowCards: [
      {
        eyebrow: "Antes da geração",
        body: "Engenharia de contexto, estruturação de prompt, seleção de frame de referência e planejamento de cena.",
      },
      {
        eyebrow: "Depois da geração",
        body: "Revisão, empacotamento do clipe, análise de vídeo e distribuição no restante da stack de agentes.",
      },
    ],
    comparisonTitle: "Kling 3.0 vs escolhas próximas",
    comparisonHeaders: {
      dimension: "Dimensão",
      primary: "Kling 3.0",
      alternative: "Alternativa",
    },
    comparisonRows: [
      {
        dimension: "Melhor ajuste",
        primary: "Movimento realista, cenas cinematográficas e saída flexível de imagem para vídeo",
        alternative: "Escolha o Veo 3.1 para saída cinematográfica premium ou o Seedance 1.5 Pro para fluxos de produção mais estáveis",
      },
      {
        dimension: "Papel no fluxo",
        primary: "Modelo criativo de geração para novos clipes e stills animados",
        alternative: "Use um modelo irmão quando o fluxo estiver otimizado para outro estilo de movimento ou alvo de custo",
      },
      {
        dimension: "Tarefa típica do agente",
        primary: "Transformar um prompt ou frame de referência em um draft de cena em movimento",
        alternative: "Encaminhar para análise de vídeo, revisão ou empacotamento depois que o clipe for gerado",
      },
    ],
    faqTitle: "Perguntas frequentes",
    faqItems: [
      {
        question: "Para que o Kling 3.0 é melhor?",
        answer:
          "O Kling 3.0 é uma boa escolha para movimento realista, estilo visual cinematográfico e fluxos de imagem para vídeo em que os agentes precisam de algo além de um rascunho básico de clipe.",
      },
      {
        question: "Como os agentes chamam o Kling 3.0 pelo AnyCap?",
        answer:
          "Os agentes podem chamá-lo com a CLI do AnyCap usando anycap video generate --model kling-3.0 e um prompt ou modo image-to-video.",
      },
      {
        question: "Devo usar Kling 3.0 ou Veo 3.1?",
        answer:
          "Use o Kling 3.0 quando o fluxo favorecer movimento realista e iteração flexível de imagem para vídeo. Use o Veo 3.1 quando a prioridade for uma primeira passagem cinematográfica mais premium.",
      },
    ],
    nextActions: [
      { label: "Geração de vídeo", href: "/capabilities/video-generation", primary: true },
      { label: "Veo 3.1", href: "/models/veo-3-1" },
      { label: "Seedance 1.5 Pro", href: "/models/seedance-1-5-pro" },
    ],
  },
  id: {
    metadata: {
      title: "Kling 3.0 untuk agen AI — generasi video melalui AnyCap",
      description:
        "Gunakan Kling 3.0 melalui AnyCap saat agen AI membutuhkan motion realistis, generasi scene sinematik, dan alur image-to-video lewat satu CLI.",
      openGraphTitle: "Kling 3.0 untuk agen AI — generasi video melalui AnyCap",
      openGraphDescription:
        "Gunakan Kling 3.0 melalui AnyCap untuk alur text-to-video dan image-to-video di dalam satu runtime agen.",
      articleHeadline: "Kling 3.0 untuk agen AI — generasi video melalui AnyCap",
      articleDescription:
        "Panduan menggunakan Kling 3.0 melalui AnyCap untuk alur text-to-video dan image-to-video realistis di dalam runtime agen AI.",
      articleAbout: ["Kling 3.0", "Generasi video", "AnyCap", "agen AI"],
      articleKeywords: ["kling 3.0", "api kling 3.0", "image to video", "generasi video", "anycap"],
    },
    breadcrumbItems: [
      { name: "Beranda", href: "/" },
      { name: "Model", href: "/models" },
      { name: "Kling 3.0", href: KLING_30_PATH },
    ],
    eyebrow: "Model",
    lastUpdatedLabel: "Diperbarui 5 April 2026",
    hero: {
      titleLine1: "Kling 3.0",
      titleLine2: "untuk agen AI",
      intro:
        "Kling 3.0 cocok saat agen membutuhkan motion realistis dan generasi scene sinematik lewat satu runtime video. Melalui AnyCap, tim bisa tetap memakai Kling 3.0 di CLI dan alur autentikasi yang sama seperti Veo 3.1, Seedance 1.5 Pro, generasi gambar, dan tugas analisis lanjutan.",
    },
    showcaseLabels: {
      generatedExampleLabel: "Contoh hasil generasi",
      signalsLabel: "Mengapa ini membantu halaman ini",
    },
    showcase: {
      modelName: "Kling 3.0",
      href: KLING_30_PATH,
      sectionTitle: "Keyframe ilustratif untuk motion realistis dan kesinambungan scene",
      intro:
        "Kling 3.0 sering dipilih untuk motion realistis dan pekerjaan image-to-video sinematik. Still ini menunjukkan jenis briefing scene gelap dan siap gerak yang cocok untuk tugas tersebut.",
      promptLabel: "Prompt still ilustratif",
      prompt:
        "scene jalan sinematik yang basah oleh hujan di malam hari, satu orang di bawah payung transparan, trotoar reflektif, streak cahaya abstrak, still realistis dan muram dengan kesan gerak yang kuat, tanpa papan toko, tanpa papan iklan, tanpa teks, tanpa watermark",
      caption:
        "Still pendamping ini dihasilkan melalui AnyCap agar halaman Kling 3.0 terasa lebih dekat ke briefing scene nyata, bukan hanya daftar fitur.",
      note:
        "Kling 3.0 menghasilkan video, bukan satu frame. Gambar di bawah berfungsi sebagai proksi visual untuk jenis scene sinematik yang mungkin dianimasikan tim.",
      signals: [
        "Membuat positioning motion realistis lebih konkret daripada teks saja.",
        "Membantu penjelasan image-to-video dengan memulai dari scene yang sudah mengisyaratkan gerak.",
        "Menambahkan media asli yang membedakan halaman ini dari roundup model yang lebih tipis.",
      ],
      images: [
        {
          src: KLING_SHOWCASE_IMAGE_SRC,
          alt: "Scene jalan neon yang basah hujan pada malam hari dengan satu orang di bawah payung transparan dan pantulan di aspal basah.",
          width: 1376,
          height: 768,
          label: "Keyframe pendamping",
        },
      ],
    },
    useCasesTitle: "Saat agen harus memilih Kling 3.0",
    useCases: [
      "Motion realistis dan generasi scene sinematik",
      "Alur image-to-video yang butuh kesinambungan visual lebih kuat",
      "Draft video yang dipandu agen untuk demo, iklan, dan klip produk pendek",
      "Tim yang ingin Kling 3.0 di runtime yang sama dengan Veo 3.1 dan Seedance 1.5 Pro",
    ],
    callSectionTitle: "Panggil Kling 3.0 lewat AnyCap",
    callExamples: [
      {
        label: "Hasilkan klip baru",
        code:
          'anycap video generate --model kling-3.0 --prompt "scene jalan sinematik saat hujan dengan pantulan neon" -o kling-scene.mp4',
      },
      {
        label: "Animasikan gambar referensi",
        code:
          'anycap video generate --model kling-3.0 --mode image-to-video --prompt "push-in lambat dengan gerakan lingkungan yang halus" --param images=\'["./frame.jpg"]\' -o kling-animated.mp4',
      },
    ],
    workflowTitle: "Posisi dalam alur kerja",
    workflowParagraph:
      "Dalam alur agen, Kling 3.0 biasanya berperan sebagai langkah generasi yang mengubah prompt atau frame referensi menjadi draft yang kaya motion. Hasilnya lalu bisa mengalir ke review, packaging, atau analisis lanjutan tanpa keluar dari runtime AnyCap.",
    workflowCards: [
      {
        eyebrow: "Hulu",
        body: "Context engineering, penyusunan prompt, pemilihan frame referensi, dan perencanaan scene.",
      },
      {
        eyebrow: "Hilir",
        body: "Review, packaging klip, analisis video, dan distribusi di stack agen berikutnya.",
      },
    ],
    comparisonTitle: "Kling 3.0 vs pilihan terdekat",
    comparisonHeaders: {
      dimension: "Dimensi",
      primary: "Kling 3.0",
      alternative: "Alternatif",
    },
    comparisonRows: [
      {
        dimension: "Paling cocok",
        primary: "Motion realistis, scene sinematik, dan output image-to-video yang fleksibel",
        alternative: "Pilih Veo 3.1 untuk output sinematik premium atau Seedance 1.5 Pro untuk workflow produksi yang lebih stabil",
      },
      {
        dimension: "Peran dalam workflow",
        primary: "Model generatif kreatif untuk klip baru dan still yang dianimasikan",
        alternative: "Gunakan model saudara saat workflow dioptimalkan untuk gaya motion lain atau target biaya berbeda",
      },
      {
        dimension: "Tugas tipikal agen",
        primary: "Mengubah prompt atau frame referensi menjadi draft scene yang bergerak",
        alternative: "Meneruskan ke analisis video, review, atau packaging setelah klip dihasilkan",
      },
    ],
    faqTitle: "FAQ",
    faqItems: [
      {
        question: "Untuk apa Kling 3.0 paling bagus?",
        answer:
          "Kling 3.0 cocok untuk motion realistis, gaya visual sinematik, dan alur image-to-video ketika agen butuh lebih dari sekadar klip draft dasar.",
      },
      {
        question: "Bagaimana agen memanggil Kling 3.0 lewat AnyCap?",
        answer:
          "Agen bisa memanggilnya dengan CLI AnyCap menggunakan anycap video generate --model kling-3.0 dan prompt atau mode image-to-video.",
      },
      {
        question: "Harus pakai Kling 3.0 atau Veo 3.1?",
        answer:
          "Gunakan Kling 3.0 saat alur kerja lebih condong ke motion realistis dan iterasi image-to-video yang fleksibel. Gunakan Veo 3.1 saat prioritasnya adalah first pass sinematik yang lebih premium.",
      },
    ],
    nextActions: [
      { label: "Generasi video", href: "/capabilities/video-generation", primary: true },
      { label: "Veo 3.1", href: "/models/veo-3-1" },
      { label: "Seedance 1.5 Pro", href: "/models/seedance-1-5-pro" },
    ],
  },
  de: {
    metadata: {
      title: "Kling 3.0 für KI-Agenten – Videogenerierung über AnyCap",
      description:
        "Nutzen Sie Kling 3.0 über AnyCap, wenn KI-Agenten realistische Bewegung, cineastische Szenengenerierung und Bild-zu-Video-Workflows über eine einzige CLI brauchen.",
      openGraphTitle: "Kling 3.0 für KI-Agenten – Videogenerierung über AnyCap",
      openGraphDescription:
        "Nutzen Sie Kling 3.0 über AnyCap für Text-zu-Video- und Bild-zu-Video-Workflows in einer einzigen Agenten-Runtime.",
      articleHeadline: "Kling 3.0 für KI-Agenten – Videogenerierung über AnyCap",
      articleDescription:
        "Leitfaden zur Nutzung von Kling 3.0 über AnyCap für realistische Text-zu-Video- und Bild-zu-Video-Workflows in KI-Agenten-Runtimes.",
      articleAbout: ["Kling 3.0", "Videogenerierung", "AnyCap", "KI-Agenten"],
      articleKeywords: ["kling 3.0", "kling 3.0 api", "bild zu video", "videogenerierung", "anycap"],
    },
    breadcrumbItems: [
      { name: "Startseite", href: "/" },
      { name: "Modelle", href: "/models" },
      { name: "Kling 3.0", href: KLING_30_PATH },
    ],
    eyebrow: "Modell",
    lastUpdatedLabel: "Aktualisiert am 5. April 2026",
    hero: {
      titleLine1: "Kling 3.0",
      titleLine2: "für KI-Agenten",
      intro:
        "Kling 3.0 passt gut, wenn ein Agent realistische Bewegung und cineastische Szenengenerierung über eine einzige Video-Runtime braucht. Über AnyCap können Teams Kling 3.0 in derselben CLI und im selben Auth-Flow verwenden, den sie bereits für Veo 3.1, Seedance 1.5 Pro, Bildgenerierung und nachgelagerte Analyseaufgaben einsetzen.",
    },
    showcaseLabels: {
      generatedExampleLabel: "Generiertes Beispiel",
      signalsLabel: "Warum das dieser Seite hilft",
    },
    showcase: {
      modelName: "Kling 3.0",
      href: KLING_30_PATH,
      sectionTitle: "Illustratives Keyframe für realistische Bewegung und Szenenkontinuität",
      intro:
        "Kling 3.0 wird oft für realistische Bewegung und cineastische Bild-zu-Video-Arbeit gewählt. Dieses Standbild zeigt, wie ein stimmungsvolles, bewegungsfähiges Szenen-Briefing für genau diese Aufgabe aussieht.",
      promptLabel: "Illustrativer Standbild-Prompt",
      prompt:
        "Cineastische, regennasse Straßenszene bei Nacht, einzelne Person unter einem transparenten Regenschirm, spiegelndes Pflaster, abstrakte Lichtspuren, realistisches, stimmungsvolles Standbild mit deutlicher Bewegungsandeutung, keine Ladenschilder, keine Plakatwände, kein Text, kein Wasserzeichen",
      caption:
        "Dieses begleitende Standbild wurde über AnyCap generiert, damit sich die Kling-3.0-Seite stärker an einem realen Szenen-Briefing orientiert, statt nur Funktionen aufzuzählen.",
      note:
        "Kling 3.0 erzeugt Video, nicht ein einzelnes Frame. Das Bild unten dient als visueller Stellvertreter für die Art cineastischer Quellszenen, die Teams animieren können.",
      signals: [
        "Macht die Positionierung als Modell für realistische Bewegung greifbarer als reiner Text.",
        "Stützt die Erklärung von Bild-zu-Video, indem sie von einer Szene ausgeht, die bereits Bewegung andeutet.",
        "Bringt eigene Multimedia-Inhalte ein, die diese Seite von dünneren Modell-Übersichten abheben.",
      ],
      images: [
        {
          src: KLING_SHOWCASE_IMAGE_SRC,
          alt: "Regnerische Neon-Straßenszene bei Nacht mit einer einzelnen Person unter einem transparenten Regenschirm und Spiegelungen auf nassem Pflaster.",
          width: 1376,
          height: 768,
          label: "Begleitendes Keyframe",
        },
      ],
    },
    useCasesTitle: "Wann Agenten Kling 3.0 wählen sollten",
    useCases: [
      "Realistische Bewegung und cineastische Szenengenerierung",
      "Bild-zu-Video-Workflows, die stärkere visuelle Kontinuität brauchen",
      "Agenten-gesteuerte Video-Entwürfe für Demos, Anzeigen und kurze Produkt-Clips",
      "Teams, die Kling 3.0 in derselben Runtime wie Veo 3.1 und Seedance 1.5 Pro nutzen wollen",
    ],
    callSectionTitle: "Kling 3.0 über AnyCap aufrufen",
    callExamples: [
      {
        label: "Einen neuen Clip generieren",
        code:
          'anycap video generate --model kling-3.0 --prompt "a cinematic street scene in the rain with neon reflections" -o kling-scene.mp4',
      },
      {
        label: "Ein Referenzbild animieren",
        code:
          'anycap video generate --model kling-3.0 --mode image-to-video --prompt "slow push-in with subtle environmental motion" --param images=\'["./frame.jpg"]\' -o kling-animated.mp4',
      },
    ],
    workflowTitle: "Position im Workflow",
    workflowParagraph:
      "In einem Agenten-Workflow dient Kling 3.0 oft als Generierungsschritt, der einen Prompt oder ein Referenz-Frame in einen bewegungsreichen Entwurf verwandelt. Das Ergebnis kann anschließend in Review, Packaging oder Folgeanalyse fließen, ohne die AnyCap-Runtime zu verlassen.",
    workflowCards: [
      {
        eyebrow: "Vorgelagert",
        body: "Kontextgestaltung, Prompt-Aufbau, Auswahl von Referenz-Frames und Szenenplanung.",
      },
      {
        eyebrow: "Nachgelagert",
        body: "Review, Clip-Packaging, Videoanalyse und Distribution im restlichen Agenten-Stack.",
      },
    ],
    comparisonTitle: "Kling 3.0 vs. nahe Alternativen",
    comparisonHeaders: {
      dimension: "Dimension",
      primary: "Kling 3.0",
      alternative: "Alternative",
    },
    comparisonRows: [
      {
        dimension: "Bester Einsatz",
        primary: "Realistische Bewegung, cineastische Szenen und flexibler Bild-zu-Video-Output",
        alternative: "Wählen Sie Veo 3.1 für Premium-Cineastik oder Seedance 1.5 Pro für stabilere Produktions-Workflows",
      },
      {
        dimension: "Rolle im Workflow",
        primary: "Kreatives Generierungsmodell für neue Clips und animierte Standbilder",
        alternative: "Greifen Sie zu einem Schwestermodell, wenn der Workflow auf einen anderen Bewegungsstil oder ein anderes Kostenziel ausgerichtet ist",
      },
      {
        dimension: "Typische Agenten-Aufgabe",
        primary: "Einen Prompt oder ein Referenz-Frame in einen bewegten Szenen-Entwurf verwandeln",
        alternative: "Den Output nach der Generierung in Videoanalyse, Review oder Packaging weiterleiten",
      },
    ],
    faqTitle: "FAQ",
    faqItems: [
      {
        question: "Wofür eignet sich Kling 3.0 am besten?",
        answer:
          "Kling 3.0 ist eine starke Wahl für realistische Bewegung, cineastischen visuellen Stil und Bild-zu-Video-Workflows, in denen Agenten mehr als einen einfachen Clip-Entwurf brauchen.",
      },
      {
        question: "Wie rufen Agenten Kling 3.0 über AnyCap auf?",
        answer:
          "Agenten rufen es mit der AnyCap-CLI über anycap video generate --model kling-3.0 mit einem Prompt oder im Bild-zu-Video-Modus auf.",
      },
      {
        question: "Soll ich Kling 3.0 oder Veo 3.1 verwenden?",
        answer:
          "Setzen Sie auf Kling 3.0, wenn der Workflow auf realistische Bewegung und flexible Bild-zu-Video-Iteration zielt. Setzen Sie auf Veo 3.1, wenn ein cineastischer Premium-Erstdurchlauf Priorität hat.",
      },
    ],
    nextActions: [
      { label: "Videogenerierung", href: "/capabilities/video-generation", primary: true },
      { label: "Veo 3.1", href: "/models/veo-3-1" },
      { label: "Seedance 1.5 Pro", href: "/models/seedance-1-5-pro" },
    ],
  },
} as const satisfies Record<SiteLocale, Kling30PageContent>;

export function getKling30Metadata(locale: SiteLocale): Metadata {
  const content = contentByLocale[locale] ?? contentByLocale.en;

  return createModelPageMetadata(locale, KLING_30_PATH, content.metadata);
}

export function getKling30PageData(locale: SiteLocale) {
  return createModelPageData(locale, KLING_30_PATH, contentByLocale, LAST_UPDATED_ISO);
}

export type Kling30PageData = ReturnType<typeof getKling30PageData>;
