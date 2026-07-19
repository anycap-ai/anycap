import type { Metadata } from "next";
import Image from "next/image";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { createLocalizedMetadataForPath } from "@/lib/localized-metadata";
import { defaultLocale, type SiteLocale } from "@/lib/site";
import { EarlyAccessBanner } from "@/components/landing/EarlyAccessBanner";
import { FadeIn } from "@/components/ui/FadeIn";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { pricingGenerationGroups, type PricingGenerationGroup } from "@/lib/capability-inventory";
import { createFaqPageJsonLd, createTechArticleJsonLd } from "@/lib/schema";
import { getRequestLocale } from "@/lib/request-locale";
import { catalogModels } from "@/lib/seo/model-catalog";
import { sortModelHubModels } from "@/lib/model-hub";
import { getModelsMetadata, MODELS_PATH } from "./metadata";

export const runtime = "edge";

const CDN_BASE = "https://cdn.anycap.ai/page_resource/models";
const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;
const lastUpdatedIso = "2026-07-19";

type ModelGroupCard = {
  category: string;
  items: {
    name: string;
    href: string;
    description: string;
  }[];
};

type ModelGuideLookup = Record<string, { href: string; bestFor: string }>;

const catalogModelByDisplayName = Object.fromEntries(
  catalogModels.map((model) => [model.displayName, model]),
);

type PageContent = {
  breadcrumbItems: readonly { name: string; href: string }[];
  eyebrow: string;
  lastUpdatedLabel: string;
  latestTitle: string;
  latestIntro: string;
  updatedLabel: string;
  heroTitle: [string, string];
  heroIntro: string;
  summaryEyebrow: string;
  summaryBody: string;
  chooseTitle: string;
  chooseItems: readonly string[];
  visualGuideTitle: string;
  visualGuideAlt: string;
  visualGuideBody: string;
  comparisonTitle: string;
  comparisonIntro: string;
  modelGroups: readonly ModelGroupCard[];
  pricingGroups: readonly PricingGenerationGroup[];
  guideLookup: ModelGuideLookup;
  faqTitle: string;
  faqItems: readonly { question: string; answer: string }[];
  footerCtas: { capability: string; context: string };
  articleJsonLd: Record<string, unknown>;
};

const modelGroupsEn: ModelGroupCard[] = [
  {
    category: "Image generation",
    items: [
      {
        name: "Seedream 5",
        href: "/models/seedream-5",
        description: "A strong default for polished first-pass image generation tasks.",
      },
      {
        name: "Nano Banana Pro",
        href: "/models/nano-banana-pro",
        description: "A better fit for revision loops and prompt-based image editing.",
      },
      {
        name: "Nano Banana 2",
        href: "/models/nano-banana-2",
        description: "A faster fit for scalable image generation and high-volume iteration loops.",
      },
    ],
  },
  {
    category: "Video generation",
    items: [
      {
        name: "Veo 3.1",
        href: "/models/veo-3-1",
        description: "The current video generation model for text-to-video workflows through AnyCap.",
      },
      {
        name: "Kling 3.0",
        href: "/models/kling-3-0",
        description: "A strong fit for realistic motion and cinematic image-to-video workflows.",
      },
      {
        name: "Seedance 1.5 Pro",
        href: "/models/seedance-1-5-pro",
        description: "A dependable default for production-friendly text-to-video and image-to-video work.",
      },
    ],
  },
  {
    category: "Music generation",
    items: [
      {
        name: "ElevenLabs Music",
        href: "/models/elevenlabs-music",
        description: "A prompt-based music model for soundtrack drafts inside the same agent runtime.",
      },
    ],
  },
];

const modelGroupsPtBr: ModelGroupCard[] = [
  {
    category: "Geração de imagem",
    items: [
      {
        name: "Seedream 5",
        href: "/models/seedream-5",
        description: "Um default forte para tarefas de geração de imagem com primeira saída mais refinada.",
      },
      {
        name: "Nano Banana Pro",
        href: "/models/nano-banana-pro",
        description: "Melhor ajuste para ciclos de revisão e edição de imagem guiada por prompt.",
      },
      {
        name: "Nano Banana 2",
        href: "/models/nano-banana-2",
        description: "Mais rápido para geração de imagem escalável e ciclos de iteração em alto volume.",
      },
    ],
  },
  {
    category: "Geração de vídeo",
    items: [
      {
        name: "Veo 3.1",
        href: "/models/veo-3-1",
        description: "O modelo atual de geração de vídeo para fluxos de texto para vídeo via AnyCap.",
      },
      {
        name: "Kling 3.0",
        href: "/models/kling-3-0",
        description: "Um ajuste forte para movimento realista e fluxos cinematográficos de imagem para vídeo.",
      },
      {
        name: "Seedance 1.5 Pro",
        href: "/models/seedance-1-5-pro",
        description: "Um default confiável para trabalho de texto para vídeo e imagem para vídeo com perfil mais produtivo.",
      },
    ],
  },
  {
    category: "Geração de música",
    items: [
      {
        name: "ElevenLabs Music",
        href: "/models/elevenlabs-music",
        description: "Um modelo de música por prompt para rascunhos de trilha sonora dentro do mesmo runtime de agente.",
      },
    ],
  },
];

const guideLookupEn: ModelGuideLookup = {
  "Seedream 5": {
    href: "/models/seedream-5",
    bestFor: "Polished first-pass image generation from a text prompt.",
  },
  "Nano Banana Pro": {
    href: "/models/nano-banana-pro",
    bestFor: "Targeted image editing and revision loops from an existing visual.",
  },
  "Nano Banana 2": {
    href: "/models/nano-banana-2",
    bestFor: "Fast, scalable image generation and high-volume iteration.",
  },
  "Veo 3.1": {
    href: "/models/veo-3-1",
    bestFor: "Premium text-to-video output when the first pass needs to look stronger.",
  },
  "Kling 3.0": {
    href: "/models/kling-3-0",
    bestFor: "Cinematic motion and flexible image-to-video workflows.",
  },
  "Seedance 1.5 Pro": {
    href: "/models/seedance-1-5-pro",
    bestFor: "Steady production-friendly video workflows and repeatable image-to-video jobs.",
  },
  "ElevenLabs Music": {
    href: "/models/elevenlabs-music",
    bestFor: "Prompt-based soundtrack drafts inside the same agent runtime.",
  },
  "Nano Banana 2 Lite": {
    href: "/capabilities/image-generation",
    bestFor: "Fast, cost-efficient drafts, variants, and high-volume visual iteration.",
  },
  "Kling 3.0 Omni": {
    href: "/capabilities/video-generation",
    bestFor: "Flexible text, image, and multi-shot video generation.",
  },
  "Seedance 2.0": {
    href: "/models/seedance-2",
    bestFor: "High-quality video with first/last-frame and multimodal-reference control.",
  },
  "Seedance 2.0 Mini": {
    href: "/capabilities/video-generation",
    bestFor: "Efficient video drafts with text, image, first/last-frame, or multimodal references.",
  },
  "Gemini Omni Flash Preview": {
    href: "/models/gemini-omni-flash-preview",
    bestFor: "Natural-language editing and refinement of existing footage.",
  },
  "Doubao Seed Audio 1.0": {
    href: "/capabilities",
    bestFor: "Speech, dialogue, sound effects, and complete audio scenes from text, audio, or image input.",
  },
};

const guideLookupPtBr: ModelGuideLookup = {
  "Seedream 5": {
    href: "/models/seedream-5",
    bestFor: "Geração de imagem com primeira saída mais refinada a partir de um prompt de texto.",
  },
  "Nano Banana Pro": {
    href: "/models/nano-banana-pro",
    bestFor: "Edição de imagem direcionada e ciclos de revisão a partir de um visual existente.",
  },
  "Nano Banana 2": {
    href: "/models/nano-banana-2",
    bestFor: "Geração de imagem rápida e escalável com iteração em alto volume.",
  },
  "Veo 3.1": {
    href: "/models/veo-3-1",
    bestFor: "Saída premium de texto para vídeo quando a primeira versão precisa parecer mais forte.",
  },
  "Kling 3.0": {
    href: "/models/kling-3-0",
    bestFor: "Movimento cinematográfico e fluxos flexíveis de imagem para vídeo.",
  },
  "Seedance 1.5 Pro": {
    href: "/models/seedance-1-5-pro",
    bestFor: "Fluxos de vídeo estáveis, orientados à produção, e trabalhos repetíveis de imagem para vídeo.",
  },
  "ElevenLabs Music": {
    href: "/models/elevenlabs-music",
    bestFor: "Rascunhos de trilha sonora por prompt dentro do mesmo runtime de agente.",
  },
  "Nano Banana 2 Lite": {
    href: "/capabilities/image-generation",
    bestFor: "Rascunhos rápidos e econômicos, variantes e iteração visual em alto volume.",
  },
  "Kling 3.0 Omni": {
    href: "/capabilities/video-generation",
    bestFor: "Geração flexível de vídeo por texto, imagem e múltiplas tomadas.",
  },
  "Seedance 2.0": {
    href: "/models/seedance-2",
    bestFor: "Vídeo de alta qualidade com controle por quadro inicial e final e referências multimodais.",
  },
  "Seedance 2.0 Mini": {
    href: "/capabilities/video-generation",
    bestFor: "Rascunhos eficientes de vídeo com texto, imagem, quadros inicial e final ou referências multimodais.",
  },
  "Gemini Omni Flash Preview": {
    href: "/models/gemini-omni-flash-preview",
    bestFor: "Edição e refinamento de vídeos existentes com linguagem natural.",
  },
  "Doubao Seed Audio 1.0": {
    href: "/capabilities",
    bestFor: "Fala, diálogo, efeitos sonoros e cenas de áudio completas a partir de texto, áudio ou imagem.",
  },
};

const modelGroupsDe: ModelGroupCard[] = [
  {
    category: "Bildgenerierung",
    items: [
      {
        name: "Seedream 5",
        href: "/models/seedream-5",
        description: "Ein starker Standard für polierte Erstdurchläufe der Bildgenerierung.",
      },
      {
        name: "Nano Banana Pro",
        href: "/models/nano-banana-pro",
        description: "Besser geeignet für Überarbeitungsschleifen und prompt-basierte Bildbearbeitung.",
      },
      {
        name: "Nano Banana 2",
        href: "/models/nano-banana-2",
        description: "Schneller geeignet für skalierbare Bildgenerierung und Iterationsschleifen in hohem Volumen.",
      },
    ],
  },
  {
    category: "Videogenerierung",
    items: [
      {
        name: "Veo 3.1",
        href: "/models/veo-3-1",
        description: "Das aktuelle Videogenerierungsmodell für Text-zu-Video-Workflows über AnyCap.",
      },
      {
        name: "Kling 3.0",
        href: "/models/kling-3-0",
        description: "Eine starke Wahl für realistische Bewegung und cineastische Bild-zu-Video-Workflows.",
      },
      {
        name: "Seedance 1.5 Pro",
        href: "/models/seedance-1-5-pro",
        description: "Ein verlässlicher Standard für produktionsfreundliche Text-zu-Video- und Bild-zu-Video-Arbeit.",
      },
    ],
  },
  {
    category: "Musikgenerierung",
    items: [
      {
        name: "ElevenLabs Music",
        href: "/models/elevenlabs-music",
        description: "Ein prompt-basiertes Musikmodell für Soundtrack-Entwürfe in derselben Agenten-Runtime.",
      },
    ],
  },
];

const guideLookupDe: ModelGuideLookup = {
  "Seedream 5": {
    href: "/models/seedream-5",
    bestFor: "Polierter Erstdurchlauf der Bildgenerierung aus einem Text-Prompt.",
  },
  "Nano Banana Pro": {
    href: "/models/nano-banana-pro",
    bestFor: "Gezielte Bildbearbeitung und Überarbeitungsschleifen aus einem bestehenden Visual.",
  },
  "Nano Banana 2": {
    href: "/models/nano-banana-2",
    bestFor: "Schnelle, skalierbare Bildgenerierung und Iteration in hohem Volumen.",
  },
  "Veo 3.1": {
    href: "/models/veo-3-1",
    bestFor: "Hochwertiger Text-zu-Video-Output, wenn der Erstdurchlauf stärker wirken soll.",
  },
  "Kling 3.0": {
    href: "/models/kling-3-0",
    bestFor: "Cineastische Bewegung und flexible Bild-zu-Video-Workflows.",
  },
  "Seedance 1.5 Pro": {
    href: "/models/seedance-1-5-pro",
    bestFor: "Stabile, produktionsfreundliche Video-Workflows und wiederholbare Bild-zu-Video-Jobs.",
  },
  "ElevenLabs Music": {
    href: "/models/elevenlabs-music",
    bestFor: "Prompt-basierte Soundtrack-Entwürfe in derselben Agenten-Runtime.",
  },
  "Nano Banana 2 Lite": {
    href: "/capabilities/image-generation",
    bestFor: "Schnelle, kosteneffiziente Entwürfe, Varianten und visuelle Iteration in hohem Volumen.",
  },
  "Kling 3.0 Omni": {
    href: "/capabilities/video-generation",
    bestFor: "Flexible Videogenerierung aus Text, Bild und mehreren Einstellungen.",
  },
  "Seedance 2.0": {
    href: "/models/seedance-2",
    bestFor: "Hochwertige Videos mit Start-/Endbild- und multimodaler Referenzsteuerung.",
  },
  "Seedance 2.0 Mini": {
    href: "/capabilities/video-generation",
    bestFor: "Effiziente Videoentwürfe aus Text, Bild, Start-/Endbild oder multimodalen Referenzen.",
  },
  "Gemini Omni Flash Preview": {
    href: "/models/gemini-omni-flash-preview",
    bestFor: "Natürlichsprachige Bearbeitung und Verfeinerung bestehenden Videomaterials.",
  },
  "Doubao Seed Audio 1.0": {
    href: "/capabilities",
    bestFor: "Sprache, Dialog, Soundeffekte und vollständige Audioszenen aus Text-, Audio- oder Bildeingaben.",
  },
};

const modelGroupsId: ModelGroupCard[] = [
  {
    category: "Pembuatan gambar",
    items: [
      {
        name: "Seedream 5",
        href: "/models/seedream-5",
        description: "Pilihan default yang kuat untuk tugas pembuatan gambar pertama yang rapi.",
      },
      {
        name: "Nano Banana Pro",
        href: "/models/nano-banana-pro",
        description: "Lebih cocok untuk putaran revisi dan pengeditan gambar berbasis prompt.",
      },
      {
        name: "Nano Banana 2",
        href: "/models/nano-banana-2",
        description: "Lebih cepat untuk pembuatan gambar skala besar dan iterasi volume tinggi.",
      },
    ],
  },
  {
    category: "Pembuatan video",
    items: [
      {
        name: "Veo 3.1",
        href: "/models/veo-3-1",
        description: "Model pembuatan video saat ini untuk alur teks ke video melalui AnyCap.",
      },
      {
        name: "Kling 3.0",
        href: "/models/kling-3-0",
        description: "Pilihan kuat untuk gerakan realistis dan alur gambar ke video yang sinematik.",
      },
      {
        name: "Seedance 1.5 Pro",
        href: "/models/seedance-1-5-pro",
        description: "Pilihan andal untuk kerja video yang ramah produksi dan image-to-video yang konsisten.",
      },
    ],
  },
  {
    category: "Pembuatan musik",
    items: [
      {
        name: "ElevenLabs Music",
        href: "/models/elevenlabs-music",
        description: "Model musik berbasis prompt untuk draf soundtrack di dalam runtime agen yang sama.",
      },
    ],
  },
];

const guideLookupId: ModelGuideLookup = {
  "Seedream 5": {
    href: "/models/seedream-5",
    bestFor: "Pembuatan gambar pertama yang rapi dari prompt teks.",
  },
  "Nano Banana Pro": {
    href: "/models/nano-banana-pro",
    bestFor: "Pengeditan gambar yang terarah dan putaran revisi dari visual yang sudah ada.",
  },
  "Nano Banana 2": {
    href: "/models/nano-banana-2",
    bestFor: "Pembuatan gambar yang cepat, skala besar, dan iterasi berulang dalam volume tinggi.",
  },
  "Veo 3.1": {
    href: "/models/veo-3-1",
    bestFor: "Output text-to-video premium saat versi pertama perlu terlihat lebih kuat.",
  },
  "Kling 3.0": {
    href: "/models/kling-3-0",
    bestFor: "Gerakan sinematik dan alur image-to-video yang fleksibel.",
  },
  "Seedance 1.5 Pro": {
    href: "/models/seedance-1-5-pro",
    bestFor: "Alur video yang stabil, ramah produksi, dan pekerjaan image-to-video yang berulang.",
  },
  "ElevenLabs Music": {
    href: "/models/elevenlabs-music",
    bestFor: "Draf soundtrack berbasis prompt di dalam runtime agen yang sama.",
  },
  "Nano Banana 2 Lite": {
    href: "/capabilities/image-generation",
    bestFor: "Draft cepat dan hemat biaya, varian, serta iterasi visual bervolume tinggi.",
  },
  "Kling 3.0 Omni": {
    href: "/capabilities/video-generation",
    bestFor: "Generasi video fleksibel dari teks, gambar, dan beberapa shot.",
  },
  "Seedance 2.0": {
    href: "/models/seedance-2",
    bestFor: "Video berkualitas tinggi dengan kontrol frame awal-akhir dan referensi multimodal.",
  },
  "Seedance 2.0 Mini": {
    href: "/capabilities/video-generation",
    bestFor: "Draft video efisien dengan teks, gambar, frame awal-akhir, atau referensi multimodal.",
  },
  "Gemini Omni Flash Preview": {
    href: "/models/gemini-omni-flash-preview",
    bestFor: "Pengeditan dan penyempurnaan footage yang ada dengan bahasa natural.",
  },
  "Doubao Seed Audio 1.0": {
    href: "/capabilities",
    bestFor: "Ucapan, dialog, efek suara, dan adegan audio lengkap dari input teks, audio, atau gambar.",
  },
};

function localizePricingGroups(locale: SiteLocale): PricingGenerationGroup[] {
  if (locale !== "pt-br" && locale !== "id" && locale !== "de") {
    return pricingGenerationGroups;
  }

  return pricingGenerationGroups.map((group) => {
    if (locale === "de") {
      if (group.title === "Image generation") {
        return {
          ...group,
          title: "Bildgenerierung",
          description: "Abrechnung pro Aufruf. Unterstützt Text-zu-Bild- und Bild-zu-Bild-Modi.",
          headers: ["Modell", "Modus", "Credits / Aufruf"],
          models: group.models.map((model) => ({
            ...model,
            modes: model.modes,
          })),
        };
      }

      if (group.title === "Video generation") {
        return {
          ...group,
          title: "Videogenerierung",
          description: "Abrechnung pro Sekunde generierter Ausgabe. Unterstützt Text-zu-Video- und Bild-zu-Video-Modi.",
          headers: ["Modell", "Modus", "Credits / Sek."],
          models: group.models.map((model) => ({
            ...model,
            modes: model.modes,
          })),
        };
      }

      if (group.title === "Audio generation") {
        return {
          ...group,
          title: "Audiogenerierung",
          description: "Abrechnung pro erfolgreich generierter Ausgabe aus Text-, Audio- oder Bildeingaben.",
          headers: ["Modell", "Modi", "Credits / Aufruf"],
          models: group.models.map((model) => ({ ...model, modes: model.modes })),
        };
      }

      if (group.title === "Music generation") {
        return {
          ...group,
          title: "Musikgenerierung",
          description: "Abrechnung pro Sekunde generiertem Audio.",
          headers: ["Modell", "Modus", "Credits / Sek."],
          models: group.models.map((model) => ({
            ...model,
            modes: model.modes,
          })),
        };
      }

      return group;
    }

    if (locale === "id") {
      if (group.title === "Image generation") {
        return {
          ...group,
          title: "Pembuatan gambar",
          description: "Dikenakan per panggilan. Mendukung mode text-to-image dan image-to-image.",
          headers: ["Model", "Mode", "Kredit / panggilan"],
          models: group.models.map((model) => ({
            ...model,
            modes: model.modes,
          })),
        };
      }

      if (group.title === "Video generation") {
        return {
          ...group,
          title: "Pembuatan video",
          description: "Dikenakan per detik output yang dihasilkan. Mendukung mode text-to-video dan image-to-video.",
          headers: ["Model", "Mode", "Kredit / dtk"],
          models: group.models.map((model) => ({
            ...model,
            modes: model.modes,
          })),
        };
      }

      if (group.title === "Audio generation") {
        return {
          ...group,
          title: "Pembuatan audio",
          description: "Dikenakan biaya per output yang berhasil dibuat dari input teks, audio, atau gambar.",
          headers: ["Model", "Mode", "Kredit / panggilan"],
          models: group.models.map((model) => ({ ...model, modes: model.modes })),
        };
      }

      if (group.title === "Music generation") {
        return {
          ...group,
          title: "Pembuatan musik",
          description: "Dikenakan per detik audio yang dihasilkan.",
          headers: ["Model", "Mode", "Kredit / dtk"],
          models: group.models.map((model) => ({
            ...model,
            modes: model.modes,
          })),
        };
      }

      return group;
    }

    if (group.title === "Image generation") {
      return {
        ...group,
        title: "Geração de imagem",
        description: "Cobrado por chamada. Suporta modos de texto para imagem e imagem para imagem.",
        headers: ["Modelo", "Modos", "Créditos / chamada"],
        models: group.models.map((model) => ({
          ...model,
          modes: model.modes,
        })),
      };
    }

    if (group.title === "Video generation") {
      return {
        ...group,
        title: "Geração de vídeo",
        description: "Cobrado por segundo de saída gerada. Suporta modos de texto para vídeo e imagem para vídeo.",
        headers: ["Modelo", "Modos", "Créditos / seg"],
        models: group.models.map((model) => ({
          ...model,
          modes: model.modes,
        })),
      };
    }

    if (group.title === "Audio generation") {
      return {
        ...group,
        title: "Geração de áudio",
        description: "Cobrado por saída gerada com sucesso a partir de texto, áudio ou imagem.",
        headers: ["Modelo", "Modos", "Créditos / chamada"],
        models: group.models.map((model) => ({ ...model, modes: model.modes })),
      };
    }

    if (group.title === "Music generation") {
      return {
        ...group,
        title: "Geração de música",
        description: "Cobrado por segundo de áudio gerado.",
        headers: ["Modelo", "Modos", "Créditos / seg"],
        models: group.models.map((model) => ({
          ...model,
          modes: model.modes,
        })),
      };
    }

    return group;
  });
}

const contentByLocale: Record<SiteLocale, PageContent> = {
  en: {
    breadcrumbItems: [
      { name: "Home", href: "/" },
      { name: "Models", href: "/models" },
    ],
    eyebrow: "Models",
    lastUpdatedLabel: "July 19, 2026",
    latestTitle: "Latest additions",
    latestIntro: "The newest AnyCap model additions and material capability updates, ordered by when they became usable through AnyCap.",
    updatedLabel: "Updated",
    heroTitle: ["Choose the right", "model for the agent job."],
    heroIntro:
      "AnyCap exposes multimodal models through one capability runtime and one CLI. This page helps teams choose the right model for a given agent workflow instead of treating every image or video request the same way.",
    summaryEyebrow: "Answer-first summary",
    summaryBody:
      "The current public AnyCap generation catalog spans image, video, music, and audio. Recent additions include Doubao Seed Audio 1.0 and Seedance 2.0 Mini, while Kling 3.0 and Seedance 2.0 now expose additional control modes. Choose by output type, input and reference requirements, first-pass quality, iteration speed, and the live model schema.",
    chooseTitle: "How to choose the right model",
    chooseItems: [
      "Start with the output type: image, video, music, or audio.",
      "Then decide whether the task needs a polished first pass, faster iteration, or revision from an existing asset.",
      "Use the model guide pages when the choice depends on motion style, editing workflow, or cost tradeoffs.",
    ],
    visualGuideTitle: "Visual guide",
    visualGuideAlt: "Illustrated overview of image, video, and music model categories inside the AnyCap model hub.",
    visualGuideBody:
      "This illustration remains a quick map of the catalog's media lanes. The live hub below now covers image, video, music, and audio generation, with the newest AnyCap additions shown before the full capability comparison.",
    comparisonTitle: "Current model comparison",
    comparisonIntro:
      "These are the current public models exposed through AnyCap. Credit ranges come from the same pricing inventory used on the pricing page, so the hub and pricing page stay aligned.",
    modelGroups: modelGroupsEn,
    pricingGroups: localizePricingGroups("en"),
    guideLookup: guideLookupEn,
    faqTitle: "FAQ",
    faqItems: [
      {
        question: "How do I choose between Seedream 5, Nano Banana Pro, and Nano Banana 2?",
        answer:
          "Use Seedream 5 when the workflow needs a stronger first-pass image from a prompt, Nano Banana Pro when the job starts from an existing image and needs revisions, and Nano Banana 2 when speed, throughput, or repeated iteration matters more.",
      },
      {
        question: "How do I choose between Veo 3.1, Kling 3.0, and Seedance 1.5 Pro?",
        answer:
          "Use Veo 3.1 when the first video pass needs to look more premium from a text brief, Kling 3.0 when the workflow leans more on cinematic motion or flexible image-to-video work, and Seedance 1.5 Pro when the team wants a steadier production-oriented default.",
      },
      {
        question: "Do all AnyCap models use the same CLI and auth flow?",
        answer:
          "Yes. AnyCap exposes these models through the same capability runtime, CLI, and auth flow, so teams do not need a separate provider integration path for each model page listed here.",
      },
      {
        question: "What are the newest model updates in AnyCap?",
        answer:
          "As of July 19, 2026, the newest additions are Doubao Seed Audio 1.0 and Seedance 2.0 Mini. Kling 3.0 and Seedance 2.0 also gained additional control modes. This hub orders updates by AnyCap availability or material capability change, not provider announcement date.",
      },
    ],
    footerCtas: {
      capability: "Any Capability",
      context: "Context Guide",
    },
    articleJsonLd: createTechArticleJsonLd({
      headline: "Models — Multimodal models available through AnyCap",
      description:
        "Comparison hub for the multimodal models available through AnyCap, including image, video, and music models, with workflow guidance and current credit ranges.",
      path: "/models",
      about: ["AnyCap models", "Image generation", "Video generation", "Music generation"],
      keywords: [
        "anycap models",
        "image generation models",
        "video generation models",
        "music generation models",
        "seedream 5 vs nano banana 2",
        "veo 3.1 vs kling 3.0",
      ],
      datePublished: lastUpdatedIso,
      dateModified: lastUpdatedIso,
    }),
  },
  "pt-br": {
    breadcrumbItems: [
      { name: "Início", href: "/" },
      { name: "Modelos", href: "/models" },
    ],
    eyebrow: "Modelos",
    lastUpdatedLabel: "19 de julho de 2026",
    latestTitle: "Adições mais recentes",
    latestIntro: "As adições mais recentes ao catálogo AnyCap e as atualizações materiais de capability, ordenadas pela data em que passaram a ser utilizáveis pelo AnyCap.",
    updatedLabel: "Atualizado",
    heroTitle: ["Escolha o modelo certo", "para o trabalho do agente."],
    heroIntro:
      "O AnyCap expõe modelos multimodais por um único runtime de capacidades e uma única CLI. Esta página ajuda times a escolher o modelo certo para um fluxo específico de agente em vez de tratar todo pedido de imagem ou vídeo da mesma forma.",
    summaryEyebrow: "Resumo direto",
    summaryBody:
      "O catálogo público atual de geração do AnyCap cobre imagem, vídeo, música e áudio. As adições recentes incluem Doubao Seed Audio 1.0 e Seedance 2.0 Mini, enquanto Kling 3.0 e Seedance 2.0 agora expõem modos adicionais de controle. Escolha pelo tipo de saída, requisitos de entrada e referência, qualidade da primeira versão, velocidade de iteração e schema atual do modelo.",
    chooseTitle: "Como escolher o modelo certo",
    chooseItems: [
      "Comece pelo tipo de saída: imagem, vídeo, música ou áudio.",
      "Depois decida se a tarefa precisa de uma primeira versão mais refinada, iteração mais rápida ou revisão a partir de um ativo existente.",
      "Use as páginas-guia de modelos quando a escolha depender do estilo de movimento, do fluxo de edição ou de tradeoffs de custo.",
    ],
    visualGuideTitle: "Guia visual",
    visualGuideAlt: "Visão ilustrada das categorias de modelos de imagem, vídeo e música dentro do hub de modelos do AnyCap.",
    visualGuideBody:
      "Esta ilustração continua sendo um mapa rápido das trilhas de mídia do catálogo. O hub abaixo agora cobre geração de imagem, vídeo, música e áudio, com as adições mais recentes do AnyCap antes da comparação completa por capability.",
    comparisonTitle: "Comparação atual de modelos",
    comparisonIntro:
      "Estes são os modelos públicos atuais expostos pelo AnyCap. As faixas de créditos vêm do mesmo inventário de preços usado na página de preços, então o hub e a página de preços permanecem alinhados.",
    modelGroups: modelGroupsPtBr,
    pricingGroups: localizePricingGroups("pt-br"),
    guideLookup: guideLookupPtBr,
    faqTitle: "FAQ",
    faqItems: [
      {
        question: "Como escolher entre Seedream 5, Nano Banana Pro e Nano Banana 2?",
        answer:
          "Use Seedream 5 quando o fluxo precisar de uma primeira imagem mais forte a partir de um prompt, Nano Banana Pro quando o trabalho começar de uma imagem existente e precisar de revisões, e Nano Banana 2 quando velocidade, volume ou iteração repetida importarem mais.",
      },
      {
        question: "Como escolher entre Veo 3.1, Kling 3.0 e Seedance 1.5 Pro?",
        answer:
          "Use Veo 3.1 quando a primeira versão de vídeo precisar parecer mais premium a partir de um briefing de texto, Kling 3.0 quando o fluxo pender mais para movimento cinematográfico ou trabalho flexível de imagem para vídeo, e Seedance 1.5 Pro quando o time quiser um default mais estável e orientado à produção.",
      },
      {
        question: "Todos os modelos do AnyCap usam a mesma CLI e o mesmo fluxo de autenticação?",
        answer:
          "Sim. O AnyCap expõe esses modelos pelo mesmo runtime de capacidades, pela mesma CLI e pelo mesmo fluxo de autenticação, então os times não precisam de um caminho de integração separado para cada página de modelo listada aqui.",
      },
      {
        question: "Quais são as atualizações de modelos mais recentes no AnyCap?",
        answer:
          "Em 19 de julho de 2026, as adições mais recentes são Doubao Seed Audio 1.0 e Seedance 2.0 Mini. Kling 3.0 e Seedance 2.0 também ganharam modos adicionais de controle. Este hub ordena as atualizações pela disponibilidade no AnyCap ou por mudanças materiais de capability, não pela data do anúncio do provedor.",
      },
    ],
    footerCtas: {
      capability: "Qualquer capacidade",
      context: "Guia de contexto",
    },
    articleJsonLd: createTechArticleJsonLd({
      headline: "Modelos — Modelos multimodais disponíveis no AnyCap",
      description:
        "Hub de comparação para os modelos multimodais disponíveis no AnyCap, incluindo modelos de imagem, vídeo e música, com orientação de fluxo e faixas atuais de crédito.",
      path: "/models",
      about: ["Modelos AnyCap", "Geração de imagem", "Geração de vídeo", "Geração de música"],
      keywords: [
        "modelos anycap",
        "modelos de geração de imagem",
        "modelos de geração de vídeo",
        "modelos de geração de música",
        "seedream 5 vs nano banana 2",
        "veo 3.1 vs kling 3.0",
      ],
      datePublished: lastUpdatedIso,
      dateModified: lastUpdatedIso,
    }),
  },
  id: undefined as never,
  de: undefined as never,
};
contentByLocale.id = {
  breadcrumbItems: [
    { name: "Home", href: "/" },
    { name: "Model", href: "/models" },
  ],
  eyebrow: "Model",
  lastUpdatedLabel: "19 Juli 2026",
  latestTitle: "Pembaruan terbaru",
  latestIntro: "Model AnyCap terbaru dan pembaruan kapabilitas yang penting, diurutkan berdasarkan waktu mulai dapat digunakan melalui AnyCap.",
  updatedLabel: "Diperbarui",
  heroTitle: ["Pilih model yang tepat", "untuk pekerjaan agen."],
  heroIntro:
    "AnyCap menampilkan model multimodal melalui satu runtime kapabilitas dan satu CLI. Halaman ini membantu tim memilih model yang tepat untuk alur kerja agen tertentu, bukan memperlakukan setiap permintaan gambar atau video dengan cara yang sama.",
  summaryEyebrow: "Ringkasan langsung ke inti",
  summaryBody:
    "Katalog generasi publik AnyCap saat ini mencakup gambar, video, musik, dan audio. Penambahan terbaru termasuk Doubao Seed Audio 1.0 dan Seedance 2.0 Mini, sementara Kling 3.0 dan Seedance 2.0 kini menyediakan mode kontrol tambahan. Pilih berdasarkan jenis output, kebutuhan input dan referensi, kualitas hasil awal, kecepatan iterasi, dan schema model langsung.",
  chooseTitle: "Cara memilih model yang tepat",
  chooseItems: [
    "Mulai dari jenis output: gambar, video, musik, atau audio.",
    "Lalu tentukan apakah tugas membutuhkan hasil awal yang lebih rapi, iterasi yang lebih cepat, atau revisi dari aset yang sudah ada.",
    "Gunakan halaman panduan model saat pilihannya bergantung pada gaya gerak, alur pengeditan, atau tradeoff biaya.",
  ],
  visualGuideTitle: "Panduan visual",
  visualGuideAlt: "Ikhtisar ilustratif kategori model gambar, video, dan musik di dalam hub model AnyCap.",
  visualGuideBody:
    "Ilustrasi ini tetap menjadi peta singkat jalur media dalam katalog. Hub di bawah kini mencakup generasi gambar, video, musik, dan audio, dengan penambahan AnyCap terbaru sebelum perbandingan kapabilitas lengkap.",
  comparisonTitle: "Perbandingan model saat ini",
  comparisonIntro:
    "Ini adalah model publik saat ini yang diekspos melalui AnyCap. Rentang kredit berasal dari inventaris harga yang sama yang dipakai di halaman harga, sehingga hub dan halaman harga tetap selaras.",
  modelGroups: modelGroupsId,
  pricingGroups: localizePricingGroups("id"),
  guideLookup: guideLookupId,
  faqTitle: "FAQ",
  faqItems: [
    {
      question: "Bagaimana memilih antara Seedream 5, Nano Banana Pro, dan Nano Banana 2?",
      answer:
        "Gunakan Seedream 5 ketika alurnya membutuhkan gambar awal yang lebih kuat dari prompt, Nano Banana Pro ketika pekerjaan dimulai dari gambar yang sudah ada dan perlu revisi, dan Nano Banana 2 ketika kecepatan, throughput, atau iterasi berulang lebih penting.",
    },
    {
      question: "Bagaimana memilih antara Veo 3.1, Kling 3.0, dan Seedance 1.5 Pro?",
      answer:
        "Gunakan Veo 3.1 ketika versi video pertama perlu terlihat lebih premium dari brief teks, Kling 3.0 ketika alurnya lebih menekankan gerakan sinematik atau kerja image-to-video yang fleksibel, dan Seedance 1.5 Pro ketika tim menginginkan default yang lebih stabil dan berorientasi produksi.",
    },
    {
      question: "Apakah semua model AnyCap memakai CLI dan alur autentikasi yang sama?",
      answer:
        "Ya. AnyCap menampilkan model-model ini melalui runtime kapabilitas, CLI, dan alur autentikasi yang sama, jadi tim tidak perlu jalur integrasi penyedia yang terpisah untuk setiap halaman model di sini.",
    },
    {
      question: "Apa pembaruan model terbaru di AnyCap?",
      answer:
        "Per 19 Juli 2026, penambahan terbaru adalah Doubao Seed Audio 1.0 dan Seedance 2.0 Mini. Kling 3.0 dan Seedance 2.0 juga mendapatkan mode kontrol tambahan. Hub ini mengurutkan pembaruan berdasarkan ketersediaan di AnyCap atau perubahan kapabilitas yang penting, bukan tanggal pengumuman penyedia.",
    },
  ],
  footerCtas: {
    capability: "Kapabilitas apa pun",
    context: "Panduan konteks",
  },
  articleJsonLd: createTechArticleJsonLd({
    headline: "Model — Model multimodal yang tersedia melalui AnyCap",
    description:
      "Hub perbandingan untuk model multimodal yang tersedia melalui AnyCap, termasuk model gambar, video, dan musik, dengan panduan alur kerja dan rentang kredit saat ini.",
    path: "/models",
    about: ["Model AnyCap", "Pembuatan gambar", "Pembuatan video", "Pembuatan musik"],
    keywords: [
      "model anycap",
      "model pembuatan gambar",
      "model pembuatan video",
      "model pembuatan musik",
      "seedream 5 vs nano banana 2",
      "veo 3.1 vs kling 3.0",
    ],
    datePublished: lastUpdatedIso,
    dateModified: lastUpdatedIso,
  }),
};
contentByLocale.de = {
  breadcrumbItems: [
    { name: "Startseite", href: "/" },
    { name: "Modelle", href: "/models" },
  ],
  eyebrow: "Modelle",
  lastUpdatedLabel: "19. Juli 2026",
  latestTitle: "Neueste Ergänzungen",
  latestIntro: "Die neuesten AnyCap-Modelle und wesentlichen Capability-Updates, sortiert nach ihrer tatsächlichen Verfügbarkeit über AnyCap.",
  updatedLabel: "Aktualisiert",
  heroTitle: ["Wählen Sie das richtige", "Modell für die Agenten-Aufgabe."],
  heroIntro:
    "AnyCap stellt multimodale Modelle über eine einzige Capability-Runtime und eine einzige CLI bereit. Diese Seite hilft Teams dabei, das passende Modell für einen bestimmten Agenten-Workflow auszuwählen, statt jede Bild- oder Videoanfrage gleich zu behandeln.",
  summaryEyebrow: "Kurz vorab",
  summaryBody:
    "Der aktuelle öffentliche AnyCap-Generierungskatalog umfasst Bild, Video, Musik und Audio. Zu den neuesten Ergänzungen gehören Doubao Seed Audio 1.0 und Seedance 2.0 Mini; Kling 3.0 und Seedance 2.0 bieten inzwischen zusätzliche Steuerungsmodi. Entscheidend sind Ausgabetyp, Eingabe- und Referenzanforderungen, Qualität des ersten Ergebnisses, Iterationsgeschwindigkeit und das aktuelle Modellschema.",
  chooseTitle: "So wählen Sie das richtige Modell",
  chooseItems: [
    "Beginnen Sie mit dem Output-Typ: Bild, Video, Musik oder Audio.",
    "Entscheiden Sie dann, ob die Aufgabe einen polierten Erstdurchlauf, schnellere Iteration oder eine Überarbeitung aus einem bestehenden Asset braucht.",
    "Nutzen Sie die Modell-Leitfadenseiten, wenn die Wahl von Bewegungsstil, Bearbeitungs-Workflow oder Kostenabwägung abhängt.",
  ],
  visualGuideTitle: "Visueller Leitfaden",
  visualGuideAlt: "Illustrierte Übersicht der Bild-, Video- und Musikmodellkategorien im AnyCap-Modellhub.",
  visualGuideBody:
    "Die Illustration bleibt eine schnelle Karte der Medienbereiche im Katalog. Der Hub darunter umfasst jetzt Bild-, Video-, Musik- und Audiogenerierung und zeigt die neuesten AnyCap-Ergänzungen vor dem vollständigen Capability-Vergleich.",
  comparisonTitle: "Aktueller Modellvergleich",
  comparisonIntro:
    "Dies sind die aktuell öffentlich verfügbaren Modelle über AnyCap. Die Credit-Bereiche stammen aus demselben Pricing-Inventar, das auch auf der Preisseite verwendet wird, sodass Hub und Preisseite konsistent bleiben.",
  modelGroups: modelGroupsDe,
  pricingGroups: localizePricingGroups("de"),
  guideLookup: guideLookupDe,
  faqTitle: "FAQ",
  faqItems: [
    {
      question: "Wie wähle ich zwischen Seedream 5, Nano Banana Pro und Nano Banana 2?",
      answer:
        "Setzen Sie auf Seedream 5, wenn der Workflow ein stärkeres Erstbild aus einem Prompt braucht, auf Nano Banana Pro, wenn die Aufgabe von einem bestehenden Bild ausgeht und Überarbeitungen verlangt, und auf Nano Banana 2, wenn Geschwindigkeit, Durchsatz oder wiederholte Iteration wichtiger sind.",
    },
    {
      question: "Wie wähle ich zwischen Veo 3.1, Kling 3.0 und Seedance 1.5 Pro?",
      answer:
        "Setzen Sie auf Veo 3.1, wenn der erste Video-Durchlauf aus einem Text-Briefing besonders hochwertig wirken soll, auf Kling 3.0, wenn der Workflow stärker auf cineastische Bewegung oder flexible Bild-zu-Video-Arbeit setzt, und auf Seedance 1.5 Pro, wenn das Team einen stabileren, produktionsorientierten Standard bevorzugt.",
    },
    {
      question: "Nutzen alle AnyCap-Modelle dieselbe CLI und denselben Auth-Flow?",
      answer:
        "Ja. AnyCap stellt diese Modelle über dieselbe Capability-Runtime, CLI und denselben Auth-Flow bereit, sodass Teams keinen separaten Anbieter-Integrationspfad für jede hier aufgeführte Modellseite brauchen.",
    },
    {
      question: "Welche Modell-Updates sind in AnyCap am neuesten?",
      answer:
        "Am 19. Juli 2026 sind Doubao Seed Audio 1.0 und Seedance 2.0 Mini die neuesten Ergänzungen. Kling 3.0 und Seedance 2.0 haben außerdem zusätzliche Steuerungsmodi erhalten. Der Hub sortiert nach AnyCap-Verfügbarkeit oder wesentlichen Capability-Änderungen, nicht nach dem Ankündigungsdatum des Anbieters.",
    },
  ],
  footerCtas: {
    capability: "Beliebige Capability",
    context: "Kontext-Leitfaden",
  },
  articleJsonLd: createTechArticleJsonLd({
    headline: "Modelle – Multimodale Modelle, verfügbar über AnyCap",
    description:
      "Vergleichshub für die multimodalen Modelle, die über AnyCap verfügbar sind, einschließlich Bild-, Video- und Musikmodelle, mit Workflow-Anleitung und aktuellen Credit-Bereichen.",
    path: "/models",
    about: ["AnyCap-Modelle", "Bildgenerierung", "Videogenerierung", "Musikgenerierung"],
    keywords: [
      "anycap modelle",
      "bildgenerierungsmodelle",
      "videogenerierungsmodelle",
      "musikgenerierungsmodelle",
      "seedream 5 vs nano banana 2",
      "veo 3.1 vs kling 3.0",
    ],
    datePublished: lastUpdatedIso,
    dateModified: lastUpdatedIso,
  }),
};

export const metadata: Metadata = createLocalizedMetadataForPath(
  defaultLocale,
  MODELS_PATH,
  getModelsMetadata(defaultLocale),
);

export default async function ModelsPage() {
  const locale = await getRequestLocale();
  const content = contentByLocale[locale] ?? contentByLocale.en;
  const latestModels = sortModelHubModels(
    content.pricingGroups.flatMap((group) =>
      group.models.map((model) => ({ ...model, capabilityLabel: group.title })),
    ),
  )
    .slice(0, 6)
    .map((model) => ({
      ...model,
      ...(content.guideLookup[model.model] ?? {}),
    }));
  const dateLocaleBySiteLocale: Record<SiteLocale, string> = {
    en: "en-US",
    "pt-br": "pt-BR",
    id: "id-ID",
    de: "de-DE",
  };
  const faqJsonLd = createFaqPageJsonLd(content.faqItems);

  return (
    <>
      <BreadcrumbJsonLd items={content.breadcrumbItems} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(content.articleJsonLd) }}
      />
      <article className="px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-[1280px] py-12 md:py-20 lg:py-24">
          <FadeIn>
            <p className="text-[11px] text-[#6b7d3a] tracking-[0.8px] mb-4" style={mono}>
              {content.eyebrow}
            </p>
            <p className="text-[11px] text-[#5a5e52] tracking-[0.5px] mb-3" style={mono}>
              {locale === "id" ? "Terakhir diperbarui" : locale === "pt-br" ? "Atualizado em" : locale === "de" ? "Aktualisiert am" : "Last updated"} {content.lastUpdatedLabel}
            </p>
            <h1
              className="leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(32px, 6vw, 72px)" }}
            >
              {content.heroTitle[0]}
              <br />
              {content.heroTitle[1]}
            </h1>
            <p className="mt-6 max-w-[760px] text-base leading-7 text-[#4d5145] md:text-lg">
              {content.heroIntro}
            </p>
            <div className="mt-8 max-w-[860px] border border-[#d4dbb8] bg-[#f9faf5]/80 p-6">
              <p className="text-[11px] text-[#6b7d3a] tracking-[0.5px] mb-3" style={mono}>
                {content.summaryEyebrow}
              </p>
              <p className="text-sm leading-6 text-[#4d5145]">{content.summaryBody}</p>
            </div>
          </FadeIn>

          <FadeIn className="mt-8">
            <EarlyAccessBanner />
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="text-lg md:text-xl text-[#1c1f17] mb-6" style={pixel}>
                {content.chooseTitle}
              </h2>
              <ul className="space-y-3 max-w-[760px]">
                {content.chooseItems.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-[#4d5145] leading-6">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#6b7d3a]" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="text-lg md:text-xl text-[#1c1f17] mb-6" style={pixel}>
                {content.visualGuideTitle}
              </h2>
              <div className="overflow-hidden rounded-2xl border border-[#d4dbb8] bg-[#f9faf5]/80">
                <Image
                  src={`${CDN_BASE}/model-selection-visual.png`}
                  alt={content.visualGuideAlt}
                  width={2752}
                  height={1536}
                  unoptimized
                  className="h-auto w-full"
                />
              </div>
              <p className="mt-4 max-w-[760px] text-sm leading-6 text-[#4d5145]">
                {content.visualGuideBody}
              </p>
            </section>
          </FadeIn>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-3 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {content.latestTitle}
              </h2>
              <p className="mb-8 max-w-[760px] text-sm leading-6 text-[#4d5145]">
                {content.latestIntro}
              </p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {latestModels.map((model) => (
                  <Link
                    key={model.modelId}
                    href={model.href}
                    className="rounded-xl border border-[#d4dbb8] bg-[#f9faf5]/80 p-5 transition-colors hover:border-[#6b7d3a]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-[15px] font-bold text-[#1c1f17]" style={mono}>
                        {model.model}
                      </h3>
                      <span className="text-[10px] text-[#6b7d3a]" style={mono}>
                        {model.capabilityLabel}
                      </span>
                    </div>
                    <p className="mt-3 text-[11px] text-[#5a5e52]" style={mono}>
                      {content.updatedLabel}{" "}
                      {new Intl.DateTimeFormat(dateLocaleBySiteLocale[locale], {
                        dateStyle: "medium",
                        timeZone: "UTC",
                      }).format(new Date(`${model.updatedAt}T00:00:00Z`))}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-[#4d5145]">{model.bestFor}</p>
                    <p className="mt-4 text-[11px] leading-5 text-[#5a5e52]" style={mono}>
                      {model.modes.join(", ")}
                    </p>
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
              <h2 className="text-lg md:text-xl text-[#1c1f17] mb-3" style={pixel}>
                {content.comparisonTitle}
              </h2>
              <p className="mb-10 max-w-[760px] text-sm leading-6 text-[#4d5145]">
                {content.comparisonIntro}
              </p>

              <div className="space-y-12">
                {content.pricingGroups.map((group) => (
                  <div key={group.title}>
                    <h3 className="mb-2 text-base text-[#1c1f17]" style={pixel}>
                      {group.title}
                    </h3>
                    <p className="mb-5 text-sm leading-6 text-[#4d5145]">{group.description}</p>
                    <div className="overflow-x-auto rounded-xl border border-[#d4dbb8] bg-[#f9faf5]/80">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-[#d4dbb8]">
                            {[group.headers[0], group.headers[1], group.headers[2], locale === "id" ? "Paling cocok untuk" : locale === "pt-br" ? "Melhor uso" : locale === "de" ? "Am besten geeignet für" : "Best for"].map((header) => (
                              <th
                                key={header}
                                className="bg-[#f4f5f0] px-5 py-4 text-[11px] tracking-[0.5px] text-[#5a5e52]"
                                style={mono}
                              >
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {group.models.map((model) => {
                            const guide = content.guideLookup[model.model];
                            const catalogModel = catalogModelByDisplayName[model.model];
                            const modelGuide = guide ?? {
                              href: catalogModel?.path ?? model.href,
                              bestFor: catalogModel?.bestFor ?? model.bestFor,
                            };

                            return (
                              <tr
                                key={model.model}
                                className="border-b border-[#d4dbb8]/60 last:border-b-0 bg-[#fffffc]/70"
                              >
                                <td className="px-5 py-4 text-sm font-medium text-[#1c1f17]">
                                  <Link
                                    href={modelGuide.href}
                                    className="transition-colors hover:text-[#6b7d3a]"
                                  >
                                    {model.model}
                                  </Link>
                                </td>
                                <td className="px-5 py-4 text-sm text-[#4d5145]" style={mono}>
                                  {model.modes.join(", ")}
                                </td>
                                <td className="px-5 py-4 text-sm text-[#1c1f17]" style={mono}>
                                  {model.credits}
                                </td>
                                <td className="px-5 py-4 text-sm leading-6 text-[#4d5145]">
                                  {modelGuide.bestFor}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </FadeIn>

          {content.modelGroups.map((group) => (
            <FadeIn key={group.category}>
              <section className="mt-16 md:mt-24">
                <h2 className="text-lg md:text-xl text-[#1c1f17] mb-8" style={pixel}>
                  {group.category}
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 max-w-[1040px]">
                  {group.items.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="border border-[#d4dbb8] p-5 hover:border-[#6b7d3a] transition-colors"
                    >
                      <h3 className="text-[15px] font-bold text-[#1c1f17] mb-2" style={mono}>
                        {item.name}
                      </h3>
                      <p className="text-sm text-[#4d5145] leading-6">{item.description}</p>
                    </Link>
                  ))}
                </div>
              </section>
            </FadeIn>
          ))}

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="text-lg md:text-xl text-[#1c1f17] mb-8" style={pixel}>
                {content.faqTitle}
              </h2>
              <div className="space-y-6 max-w-[860px]">
                {content.faqItems.map((item) => (
                  <div key={item.question} className="border border-[#d4dbb8] p-5">
                    <h3 className="text-[14px] font-bold text-[#1c1f17] mb-2" style={mono}>
                      {item.question}
                    </h3>
                    <p className="text-sm leading-6 text-[#4d5145]">{item.answer}</p>
                  </div>
                ))}
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24 mb-8">
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/capabilities"
                  className="inline-block px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#f4f5f0] bg-[#6b7d3a] hover:bg-[#1c1f17] transition-colors rounded-lg"
                  style={mono}
                >
                  {content.footerCtas.capability}
                </Link>
                <Link
                  href="/guides/context-engineering-for-agents"
                  className="inline-block px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] border border-[#1c1f17] hover:bg-[#1c1f17] hover:text-[#f4f5f0] transition-colors rounded-lg"
                  style={mono}
                >
                  {content.footerCtas.context}
                </Link>
              </div>
            </section>
          </FadeIn>
        </div>
      </article>
    </>
  );
}
