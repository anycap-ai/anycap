import type { Metadata } from "next";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import {
  CapabilityGapTable,
  type CapabilityGapRow,
} from "@/components/landing/CapabilityGapTable";
import { EarlyAccessBanner } from "@/components/landing/EarlyAccessBanner";
import { FadeIn } from "@/components/ui/FadeIn";
import { buildAgentCapabilityGapRows } from "@/lib/capability-inventory";
import { createLocalizedMetadataForPath } from "@/lib/localized-metadata";
import { createFaqPageJsonLd, createTechArticleJsonLd } from "@/lib/schema";
import { getRequestLocale } from "@/lib/request-locale";
import { defaultLocale, type SiteLocale } from "@/lib/site";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;
const PAGE_LAST_MODIFIED_ISO = "2026-04-13";

export const metadata: Metadata = createLocalizedMetadataForPath(defaultLocale, "/for/manus", {
  title: "Manus tools and capabilities - Add image, video, and vision with AnyCap",
  description:
    "Manus is strong at autonomous workflows, but teams still need a dedicated runtime for image generation, video generation, image understanding, and video analysis. AnyCap adds those capabilities through one skill, one login, and one CLI.",
  openGraph: {
    type: "website",
    title: "Manus tools and capabilities - Add image, video, and vision with AnyCap",
    description:
      "Add a dedicated image, video, and vision runtime to Manus without replacing the agent workflow you already use.",
  },
});

const gapRowsEn = buildAgentCapabilityGapRows("manus");

const gapRowsPtBr: CapabilityGapRow[] = [
  {
    capability: "Geração de imagem",
    cells: [
      { label: "Fluxo geral", tone: "muted" },
      { label: "Gere visuais e mockups com anycap image generate", tone: "accent" },
      { label: "Página de geração de imagem", href: "/capabilities/image-generation" },
    ],
  },
  {
    capability: "Geração de vídeo",
    cells: [
      { label: "Configuração tarefa por tarefa", tone: "muted" },
      { label: "Crie walkthroughs e clipes com anycap video generate", tone: "accent" },
      { label: "Página de geração de vídeo", href: "/capabilities/video-generation" },
    ],
  },
  {
    capability: "Geração de música",
    cells: [
      { label: "Configuração de provedor por tarefa", tone: "muted" },
      { label: "Crie trilhas de fundo pelo runtime de música do AnyCap", tone: "accent" },
      { label: "Página de geração de música", href: "/capabilities/music-generation" },
    ],
  },
  {
    capability: "Entendimento de imagem",
    cells: [
      { label: "Raciocínio visual ad hoc", tone: "muted" },
      { label: "Leia capturas de tela, diagramas e referências visuais", tone: "accent" },
      { label: "Página de entendimento de imagem", href: "/capabilities/image-understanding" },
    ],
  },
  {
    capability: "Análise de vídeo",
    cells: [
      { label: "Fluxo de revisão ad hoc", tone: "muted" },
      { label: "Inspecione gravações pela mesma CLI", tone: "accent" },
      { label: "Página de análise de vídeo", href: "/capabilities/video-analysis" },
    ],
  },
  {
    capability: "Entendimento de áudio",
    cells: [
      { label: "Revisão de áudio ad hoc", tone: "muted" },
      { label: "Transcreva e analise áudio por um único runtime", tone: "accent" },
      { label: "Página de entendimento de áudio", href: "/capabilities/audio-understanding" },
    ],
  },
  {
    capability: "Busca na web",
    cells: [
      { label: "O comportamento varia por tarefa", tone: "muted" },
      { label: "Pesquise a web pela mesma camada de capacidades", tone: "accent" },
      { label: "Página de busca na web", href: "/capabilities/web-search" },
    ],
  },
  {
    capability: "Busca web com grounding",
    cells: [
      { label: "A busca com grounding varia por tarefa", tone: "muted" },
      { label: "Execute busca com grounding quando a resposta precisar de citações", tone: "accent" },
      { label: "Página de grounded web search", href: "/capabilities/grounded-web-search" },
    ],
  },
  {
    capability: "Web crawl",
    cells: [
      { label: "A configuração do crawl varia por tarefa", tone: "muted" },
      { label: "Faça crawl de páginas e extraia conteúdo por uma única CLI", tone: "accent" },
      { label: "Página de web crawl", href: "/capabilities/web-crawl" },
    ],
  },
  {
    capability: "Armazenamento Drive",
    cells: [
      { label: "O armazenamento depende de cada fluxo", tone: "muted" },
      { label: "Guarde saídas com URLs públicas no AnyCap Drive", tone: "accent" },
      { label: "Página de preços", href: "/pricing" },
    ],
  },
  {
    capability: "Hospedagem de páginas",
    cells: [
      { label: "A publicação varia por tarefa", tone: "muted" },
      { label: "Publique páginas simples pelo AnyCap Page", tone: "accent" },
      { label: "Página de preços", href: "/pricing" },
    ],
  },
  {
    capability: "Um fluxo de autenticação",
    cells: [
      { label: "O acesso às capacidades varia por tarefa", tone: "muted" },
      { label: "Um login para toda a stack de capacidades", tone: "accent" },
      { label: "Página Começar", href: "/start" },
    ],
  },
];

type PageContent = {
  breadcrumbItems: readonly { name: string; href?: string; unlinkable?: boolean }[];
  heroEyebrow: string;
  heroTitle: [string, string];
  heroIntro: string;
  heroMicrocopy: string;
  heroCtas: { primary: string; image: string; video: string };
  table: {
    eyebrow: string;
    title: string;
    description: string;
    capabilityLabel: string;
    columns: readonly { label: string; accent?: boolean }[];
    footnote: string;
    rows: readonly CapabilityGapRow[];
  };
  installTitle: string;
  installSteps: readonly { title: string; subtitle: string; code: string; note: string }[];
  capabilityCardsTitle: string;
  capabilityCards: readonly { eyebrow: string; title: string; href: string; summary: string; command: string }[];
  faqTitle: string;
  faqItems: readonly { question: string; answer: string }[];
  footerCtas: { primary: string; cli: string; skills: string };
  integrationGuideJsonLd: Record<string, unknown>;
};

const contentByLocale: Record<SiteLocale, PageContent> = {
  en: {
    breadcrumbItems: [
      { name: "Home", href: "/" },
      { name: "Equip Agents", href: "/for", unlinkable: true },
      { name: "Manus" },
    ],
    heroEyebrow: "For Manus",
    heroTitle: [
      "Manus can plan, browse, and deliver work.",
      "It still needs a dedicated capability runtime.",
    ],
    heroIntro:
      "Manus is excellent at autonomous, browser-driven, multi-step execution. The gap appears when a workflow needs repeatable image generation, video generation, image understanding, or video analysis without turning every task into fresh provider setup. AnyCap adds that missing runtime through one skill, one login, and one CLI, so you keep Manus and expand what it can reliably deliver.",
    heroMicrocopy: "Keep Manus. Standardize the capability layer.",
    heroCtas: {
      primary: "Get Started",
      image: "Image Generation",
      video: "Video Analysis",
    },
    table: {
      eyebrow: "Capability gap",
      title: "Where Manus still benefits from a dedicated runtime",
      description:
        "Manus can stay focused on autonomous execution while AnyCap standardizes generation, analysis, search, storage, and publishing across tasks.",
      capabilityLabel: "Capability",
      columns: [
        { label: "Manus alone" },
        { label: "Add with AnyCap", accent: true },
        { label: "Best next step" },
      ],
      footnote:
        "This page is the Manus hub. Until more Manus-specific deep pages exist, the next steps route to the capability pages or pricing page that closes each gap fastest.",
      rows: gapRowsEn,
    },
    installTitle: "Install in 3 steps",
    installSteps: [
      {
        title: "Install the skill",
        subtitle: "Step 1",
        code: "npx -y skills add anycap-ai/anycap -y",
        note: "Manus supports reusable skills. This gives Manus a durable entry point into the AnyCap runtime instead of re-explaining the same capability stack in every task.",
      },
      {
        title: "Install the CLI",
        subtitle: "Step 2",
        code: "curl -fsSL https://anycap.ai/install.sh | sh",
        note: "The CLI becomes the stable execution surface for image, video, and vision workloads across Manus tasks.",
      },
      {
        title: "Log in and verify",
        subtitle: "Step 3",
        code: "anycap login && anycap status",
        note: "After authentication, Manus can reuse the same capability runtime without fresh provider setup every time a task expands.",
      },
    ],
    capabilityCardsTitle: "Start with the first missing capability",
    capabilityCards: [
      {
        eyebrow: "Creative output",
        title: "Image Generation",
        href: "/capabilities/image-generation",
        summary: "Best next page when Manus needs visuals, mockups, launch assets, or other repeatable image output.",
        command: "anycap image generate",
      },
      {
        eyebrow: "Motion output",
        title: "Video Generation",
        href: "/capabilities/video-generation",
        summary: "Best next page when the workflow needs demos, explainers, walkthrough clips, or motion output.",
        command: "anycap video generate",
      },
      {
        eyebrow: "Vision",
        title: "Image Understanding",
        href: "/capabilities/image-understanding",
        summary: "Best next page when Manus needs to inspect screenshots, diagrams, OCR, or visual QA inputs.",
        command: "anycap image read",
      },
      {
        eyebrow: "Analysis",
        title: "Video Analysis",
        href: "/capabilities/video-analysis",
        summary: "Best next page when Manus needs to review recordings and extract structured detail from video.",
        command: "anycap video read",
      },
    ],
    faqTitle: "FAQ",
    faqItems: [
      {
        question: "Why add AnyCap to Manus?",
        answer:
          "Manus is strong at autonomous, end-to-end execution. AnyCap adds a dedicated runtime for image, video, and vision workloads so those capabilities stay reusable, predictable, and easier to route across tasks.",
      },
      {
        question: "Does AnyCap replace Manus?",
        answer:
          "No. The point is to keep Manus and add a stable capability layer for image generation, video generation, image understanding, and video analysis.",
      },
      {
        question: "Can Manus use AnyCap through a skill?",
        answer:
          "Yes. Install the AnyCap skill, install the CLI, log in once, and then Manus can invoke the same capability layer across multiple workflows.",
      },
      {
        question: "What should I start with for Manus workflows?",
        answer:
          "Most teams start with the first missing capability in the workflow: image generation for assets, image understanding for screenshots, video generation for demos, or video analysis for recordings.",
      },
    ],
    footerCtas: {
      primary: "Get Started",
      cli: "Why One CLI Matters",
      skills: "How Skills Fit",
    },
    integrationGuideJsonLd: createTechArticleJsonLd({
      headline: "Manus tools and capabilities - Add image, video, and vision with AnyCap",
      description:
        "Guide to adding image generation, video generation, image understanding, and video analysis to Manus through one capability runtime.",
      path: "/for/manus",
      about: ["Manus", "AnyCap CLI", "Agent skills", "Capability runtime"],
      keywords: [
        "manus tools",
        "manus skills",
        "manus capabilities",
        "manus image generation",
        "manus agent skills",
      ],
      datePublished: PAGE_LAST_MODIFIED_ISO,
      dateModified: PAGE_LAST_MODIFIED_ISO,
    }),
  },
  "pt-br": {
    breadcrumbItems: [
      { name: "Início", href: "/" },
      { name: "Equipar Agentes", href: "/for", unlinkable: true },
      { name: "Manus" },
    ],
    heroEyebrow: "Para Manus",
    heroTitle: [
      "Manus pode planejar, navegar e entregar trabalho.",
      "Ainda precisa de um runtime dedicado de capacidades.",
    ],
    heroIntro:
      "Manus é excelente em execução autônoma, orientada por navegador e em múltiplas etapas. A lacuna aparece quando um fluxo precisa de geração de imagem repetível, geração de vídeo, entendimento de imagem ou análise de vídeo sem transformar cada tarefa em uma nova configuração de provedor. O AnyCap adiciona esse runtime que falta por meio de uma skill, um login e uma CLI, para que você mantenha o Manus e amplie o que ele consegue entregar com confiabilidade.",
    heroMicrocopy: "Mantenha o Manus. Padronize a camada de capacidades.",
    heroCtas: {
      primary: "Começar",
      image: "Geração de Imagem",
      video: "Análise de Vídeo",
    },
    table: {
      eyebrow: "Lacuna de capacidade",
      title: "Onde o Manus ainda se beneficia de um runtime dedicado",
      description:
        "O Manus pode continuar focado na execução autônoma enquanto o AnyCap padroniza geração, análise, busca, armazenamento e publicação em todas as tarefas.",
      capabilityLabel: "Capacidade",
      columns: [
        { label: "Manus sozinho" },
        { label: "Adicionar com AnyCap", accent: true },
        { label: "Melhor próximo passo" },
      ],
      footnote:
        "Esta página é o hub do Manus. Até existirem mais páginas profundas específicas para Manus, os próximos passos apontam para as páginas de capacidade ou para a página de preços que fecha cada lacuna mais rápido.",
      rows: gapRowsPtBr,
    },
    installTitle: "Instale em 3 passos",
    installSteps: [
      {
        title: "Instale a skill",
        subtitle: "Passo 1",
        code: "npx -y skills add anycap-ai/anycap -y",
        note: "O Manus oferece suporte a skills reutilizáveis. Isso dá ao Manus uma entrada durável para o runtime do AnyCap, em vez de reexplicar a mesma stack de capacidades em toda tarefa.",
      },
      {
        title: "Instale a CLI",
        subtitle: "Passo 2",
        code: "curl -fsSL https://anycap.ai/install.sh | sh",
        note: "A CLI se torna a superfície de execução estável para cargas de trabalho de imagem, vídeo e visão em todas as tarefas do Manus.",
      },
      {
        title: "Faça login e verifique",
        subtitle: "Passo 3",
        code: "anycap login && anycap status",
        note: "Depois da autenticação, o Manus pode reutilizar o mesmo runtime de capacidades sem uma nova configuração de provedor sempre que a tarefa crescer.",
      },
    ],
    capabilityCardsTitle: "Comece pela primeira capacidade que está faltando",
    capabilityCards: [
      {
        eyebrow: "Saída criativa",
        title: "Geração de Imagem",
        href: "/capabilities/image-generation",
        summary: "Melhor próxima página quando o Manus precisa de visuais, mockups, ativos de lançamento ou outra saída de imagem repetível.",
        command: "anycap image generate",
      },
      {
        eyebrow: "Saída em movimento",
        title: "Geração de Vídeo",
        href: "/capabilities/video-generation",
        summary: "Melhor próxima página quando o fluxo precisa de demos, explicadores, clips de walkthrough ou saída em movimento.",
        command: "anycap video generate",
      },
      {
        eyebrow: "Visão",
        title: "Entendimento de Imagem",
        href: "/capabilities/image-understanding",
        summary: "Melhor próxima página quando o Manus precisa inspecionar capturas de tela, diagramas, OCR ou entradas de QA visual.",
        command: "anycap image read",
      },
      {
        eyebrow: "Análise",
        title: "Análise de Vídeo",
        href: "/capabilities/video-analysis",
        summary: "Melhor próxima página quando o Manus precisa revisar gravações e extrair detalhes estruturados de vídeo.",
        command: "anycap video read",
      },
    ],
    faqTitle: "FAQ",
    faqItems: [
      {
        question: "Por que adicionar AnyCap ao Manus?",
        answer:
          "O Manus é forte em execução autônoma de ponta a ponta. O AnyCap adiciona um runtime dedicado para cargas de imagem, vídeo e visão, para que essas capacidades permaneçam reutilizáveis, previsíveis e mais fáceis de rotear entre tarefas.",
      },
      {
        question: "O AnyCap substitui o Manus?",
        answer:
          "Não. A ideia é manter o Manus e adicionar uma camada estável de capacidades para geração de imagem, geração de vídeo, entendimento de imagem e análise de vídeo.",
      },
      {
        question: "O Manus pode usar o AnyCap por uma skill?",
        answer:
          "Sim. Instale a skill do AnyCap, instale a CLI, faça login uma vez e então o Manus poderá invocar a mesma camada de capacidades em vários fluxos.",
      },
      {
        question: "Por onde eu começo em fluxos do Manus?",
        answer:
          "A maioria dos times começa pela primeira capacidade ausente no fluxo: geração de imagem para ativos, entendimento de imagem para screenshots, geração de vídeo para demos ou análise de vídeo para gravações.",
      },
    ],
    footerCtas: {
      primary: "Começar",
      cli: "Por que uma CLI única importa",
      skills: "Como as skills se encaixam",
    },
    integrationGuideJsonLd: createTechArticleJsonLd({
      headline: "Ferramentas e capacidades do Manus - Adicione imagem, vídeo e visão com AnyCap",
      description:
        "Guia para adicionar geração de imagem, geração de vídeo, entendimento de imagem e análise de vídeo ao Manus por um único runtime de capacidades.",
      path: "/for/manus",
      about: ["Manus", "AnyCap CLI", "Skills de agente", "Runtime de capacidades"],
      keywords: [
        "ferramentas manus",
        "skills manus",
        "capacidades manus",
        "geração de imagem manus",
        "skills de agente manus",
      ],
      dateModified: PAGE_LAST_MODIFIED_ISO,
    }),
  },
  id: undefined as never,
};
contentByLocale.id = contentByLocale.en;

export default async function ForManusPage() {
  const locale = await getRequestLocale();
  const content = contentByLocale[locale] ?? contentByLocale.en;
  const faqJsonLd = createFaqPageJsonLd(content.faqItems);

  return (
    <>
      <BreadcrumbJsonLd items={content.breadcrumbItems} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(content.integrationGuideJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <article className="px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-[1280px] py-12 md:py-20 lg:py-24">
          <FadeIn>
            <p className="mb-4 text-[11px] tracking-[0.8px] text-[#6b7d3a]" style={mono}>
              {content.heroEyebrow}
            </p>
            <h1
              className="max-w-[960px] leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(32px, 5vw, 64px)", textWrap: "balance" } as React.CSSProperties}
            >
              {content.heroTitle[0]}
              <br />
              {content.heroTitle[1]}
            </h1>
            <p className="mt-6 max-w-[800px] text-base leading-7 text-[#4d5145] md:text-lg">
              {content.heroIntro}
            </p>
            <p className="mt-4 text-sm leading-6 text-[#6b7d3a]" style={mono}>
              {content.heroMicrocopy}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/start"
                className="inline-block rounded-lg bg-[#6b7d3a] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#f4f5f0] transition-colors hover:bg-[#1c1f17]"
                style={mono}
              >
                {content.heroCtas.primary}
              </Link>
              <Link
                href="/capabilities/image-generation"
                className="inline-block rounded-lg border border-[#1c1f17] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] transition-colors hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
                style={mono}
              >
                {content.heroCtas.image}
              </Link>
              <Link
                href="/capabilities/video-analysis"
                className="inline-block rounded-lg border border-[#1c1f17] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] transition-colors hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
                style={mono}
              >
                {content.heroCtas.video}
              </Link>
            </div>
          </FadeIn>

          <FadeIn className="mt-8">
            <EarlyAccessBanner />
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <div className="mt-16 md:mt-24">
              <CapabilityGapTable
                eyebrow={content.table.eyebrow}
                title={content.table.title}
                description={content.table.description}
                capabilityLabel={content.table.capabilityLabel}
                columns={content.table.columns}
                rows={content.table.rows}
                footnote={content.table.footnote}
              />
            </div>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-8 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {content.installTitle}
              </h2>
              <div className="grid gap-6 lg:grid-cols-3">
                {content.installSteps.map((step) => (
                  <div key={step.title} className="border-l-[3px] border-[#6b7d3a] pl-6">
                    <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                      {step.subtitle}
                    </p>
                    <h3 className="mb-3 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                      {step.title}
                    </h3>
                    <div className="bg-[#1c1f17] px-5 py-4">
                      <p className="break-all text-[13px] text-[#d4e0a4]" style={mono}>
                        {step.code}
                      </p>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-[#4d5145]">{step.note}</p>
                  </div>
                ))}
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-8 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {content.capabilityCardsTitle}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {content.capabilityCards.map((card) => (
                  <Link
                    key={card.href}
                    href={card.href}
                    className="rounded-xl border border-[#d4dbb8] bg-[#fffffc]/70 p-6 transition-colors hover:border-[#6b7d3a]"
                  >
                    <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                      {card.eyebrow}
                    </p>
                    <h3 className="mb-3 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                      {card.title}
                    </h3>
                    <p className="text-sm leading-6 text-[#4d5145]">{card.summary}</p>
                    <p className="mt-4 text-[12px] text-[#6b7d3a]" style={mono}>
                      {card.command}
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
              <h2 className="mb-8 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {content.faqTitle}
              </h2>
              <div className="max-w-[860px] space-y-6">
                {content.faqItems.map((item) => (
                  <div key={item.question} className="rounded-xl border border-[#d4dbb8] p-5">
                    <h3 className="mb-2 text-[14px] font-bold text-[#1c1f17]" style={mono}>
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
            <section className="mb-8 mt-16 md:mt-24">
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/start"
                  className="inline-block rounded-lg bg-[#6b7d3a] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#f4f5f0] transition-colors hover:bg-[#1c1f17]"
                  style={mono}
                >
                  {content.footerCtas.primary}
                </Link>
                <Link
                  href="/cli"
                  className="inline-block rounded-lg border border-[#1c1f17] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] transition-colors hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
                  style={mono}
                >
                  {content.footerCtas.cli}
                </Link>
                <Link
                  href="/skills"
                  className="inline-block rounded-lg border border-[#1c1f17] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] transition-colors hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
                  style={mono}
                >
                  {content.footerCtas.skills}
                </Link>
              </div>
            </section>
          </FadeIn>
        </div>
      </article>
    </>
  );
}
