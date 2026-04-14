import type { Metadata } from "next";
import Image from "next/image";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { siteConfig, type SiteLocale } from "@/lib/site";
import { EarlyAccessBanner } from "@/components/landing/EarlyAccessBanner";
import { FadeIn } from "@/components/ui/FadeIn";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { pricingGenerationGroups, type PricingGenerationGroup } from "@/lib/capability-inventory";
import { createFaqPageJsonLd, createTechArticleJsonLd } from "@/lib/schema";
import { getRequestLocale } from "@/lib/request-locale";

export const runtime = "edge";

const CDN_BASE = "https://cdn.anycap.ai/page_resource/models";
const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;
const lastUpdatedIso = "2026-04-05";

type ModelGroupCard = {
  category: string;
  items: {
    name: string;
    href: string;
    description: string;
  }[];
};

type ModelGuideLookup = Record<string, { href: string; bestFor: string }>;

type PageContent = {
  breadcrumbItems: readonly { name: string; href: string }[];
  eyebrow: string;
  lastUpdatedLabel: string;
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
};

function localizePricingGroups(locale: SiteLocale): PricingGenerationGroup[] {
  if (locale !== "pt-br") {
    return pricingGenerationGroups;
  }

  return pricingGenerationGroups.map((group) => {
    if (group.title === "Image generation") {
      return {
        ...group,
        title: "Geração de imagem",
        description: "Cobrado por chamada. Suporta modos de texto para imagem e imagem para imagem.",
        headers: ["Modelo", "Modos", "Créditos / chamada"],
        models: group.models.map((model) => ({
          ...model,
          modes: model.modes.map((mode) => (mode === "text-to-image" ? "texto para imagem" : "imagem para imagem")),
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
          modes: model.modes.map((mode) => (mode === "text-to-video" ? "texto para vídeo" : "imagem para vídeo")),
        })),
      };
    }

    return {
      ...group,
      title: "Geração de música",
      description: "Cobrado por segundo de áudio gerado.",
      headers: ["Modelo", "Modos", "Créditos / seg"],
      models: group.models.map((model) => ({
        ...model,
        modes: ["texto para música"],
      })),
    };
  });
}

const contentByLocale: Record<SiteLocale, PageContent> = {
  en: {
    breadcrumbItems: [
      { name: "Home", href: "/" },
      { name: "Models", href: "/models" },
    ],
    eyebrow: "Models",
    lastUpdatedLabel: "April 5, 2026",
    heroTitle: ["Choose the right", "model for the agent job."],
    heroIntro:
      "AnyCap exposes multimodal models through one capability runtime and one CLI. This page helps teams choose the right model for a given agent workflow instead of treating every image or video request the same way.",
    summaryEyebrow: "Answer-first summary",
    summaryBody:
      "The current public AnyCap model catalog includes image generation models for first-pass output and revision loops, video generation models for premium or production-friendly motion work, and a prompt-based music model for soundtrack drafts. The right choice usually depends on whether the job starts from a blank prompt or an existing asset, how much polish the first pass needs, and how much speed or cost efficiency matters in the workflow.",
    chooseTitle: "How to choose the right model",
    chooseItems: [
      "Start with the output type: image, video, or music.",
      "Then decide whether the task needs a polished first pass, faster iteration, or revision from an existing asset.",
      "Use the model guide pages when the choice depends on motion style, editing workflow, or cost tradeoffs.",
    ],
    visualGuideTitle: "Visual guide",
    visualGuideAlt: "Illustrated overview of image, video, and music model categories inside the AnyCap model hub.",
    visualGuideBody:
      "This illustration is a quick visual map of the current catalog: image models on one side, video models on another, and music generation as a separate capability lane inside the same agent runtime. It was generated with Nano Banana 2 to keep the page's visual language aligned with the model catalog itself.",
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
      dateModified: lastUpdatedIso,
    }),
  },
  "pt-br": {
    breadcrumbItems: [
      { name: "Início", href: "/" },
      { name: "Modelos", href: "/models" },
    ],
    eyebrow: "Modelos",
    lastUpdatedLabel: "5 de abril de 2026",
    heroTitle: ["Escolha o modelo certo", "para o trabalho do agente."],
    heroIntro:
      "O AnyCap expõe modelos multimodais por um único runtime de capacidades e uma única CLI. Esta página ajuda times a escolher o modelo certo para um fluxo específico de agente em vez de tratar todo pedido de imagem ou vídeo da mesma forma.",
    summaryEyebrow: "Resumo direto",
    summaryBody:
      "O catálogo público atual de modelos do AnyCap inclui modelos de geração de imagem para primeira saída e ciclos de revisão, modelos de geração de vídeo para trabalho mais premium ou orientado à produção, e um modelo de música por prompt para rascunhos de trilha sonora. A escolha certa normalmente depende de o trabalho começar de um prompt em branco ou de um ativo existente, de quanto refinamento a primeira versão precisa e de quanto velocidade ou eficiência de custo importa no fluxo.",
    chooseTitle: "Como escolher o modelo certo",
    chooseItems: [
      "Comece pelo tipo de saída: imagem, vídeo ou música.",
      "Depois decida se a tarefa precisa de uma primeira versão mais refinada, iteração mais rápida ou revisão a partir de um ativo existente.",
      "Use as páginas-guia de modelos quando a escolha depender do estilo de movimento, do fluxo de edição ou de tradeoffs de custo.",
    ],
    visualGuideTitle: "Guia visual",
    visualGuideAlt: "Visão ilustrada das categorias de modelos de imagem, vídeo e música dentro do hub de modelos do AnyCap.",
    visualGuideBody:
      "Esta ilustração é um mapa visual rápido do catálogo atual: modelos de imagem de um lado, modelos de vídeo de outro, e geração de música como uma trilha separada de capacidade dentro do mesmo runtime de agente. Ela foi gerada com Nano Banana 2 para manter a linguagem visual da página alinhada ao próprio catálogo de modelos.",
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
      dateModified: lastUpdatedIso,
    }),
  },
  id: undefined as never,
};
contentByLocale.id = contentByLocale.en;

export const metadata: Metadata = {
  title: "Models — Multimodal models available through AnyCap",
  description:
    "Explore the multimodal models available through AnyCap, including Seedream 5, Nano Banana Pro, Nano Banana 2, Veo 3.1, Kling 3.0, Seedance 1.5 Pro, and ElevenLabs Music.",
  alternates: { canonical: "/models" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/models",
    siteName: siteConfig.siteName,
    title: "Models — Multimodal models available through AnyCap",
    description:
      "Explore the multimodal models available through AnyCap and learn which model fits each agent workflow.",
  },
};

export default async function ModelsPage() {
  const locale = await getRequestLocale();
  const content = contentByLocale[locale] ?? contentByLocale.en;
  const faqJsonLd = createFaqPageJsonLd(content.faqItems);

  return (
    <>
      <BreadcrumbJsonLd items={content.breadcrumbItems} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(content.articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <article className="px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-[1280px] py-12 md:py-20 lg:py-24">
          <FadeIn>
            <p className="text-[11px] text-[#6b7d3a] tracking-[0.8px] mb-4" style={mono}>
              {content.eyebrow}
            </p>
            <p className="text-[11px] text-[#5a5e52] tracking-[0.5px] mb-3" style={mono}>
              {locale === "pt-br" ? "Atualizado em" : "Last updated"} {content.lastUpdatedLabel}
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
                            {[group.headers[0], group.headers[1], group.headers[2], locale === "pt-br" ? "Melhor uso" : "Best for"].map((header) => (
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

                            return (
                              <tr
                                key={model.model}
                                className="border-b border-[#d4dbb8]/60 last:border-b-0 bg-[#fffffc]/70"
                              >
                                <td className="px-5 py-4 text-sm font-medium text-[#1c1f17]">
                                  <Link
                                    href={guide.href}
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
                                  {guide.bestFor}
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
