import type { Metadata } from "next";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { FadeIn } from "@/components/ui/FadeIn";
import { DriveDemo } from "@/components/landing/DriveDemo";
import { createTechArticleJsonLd } from "@/lib/schema";
import { getRequestLocale } from "@/lib/request-locale";
import { siteConfig } from "@/lib/site";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;
const PAGE_LAST_MODIFIED_ISO = "2026-04-13";

export const metadata: Metadata = {
  title: "Drive for AI agents - Shared storage, file organization, and public URLs",
  description:
    "Give AI agents a shared drive through AnyCap. Store generated outputs, organize assets, and create public URLs through one interface instead of stitching storage into each workflow.",
  alternates: { canonical: "/capabilities/drive" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/capabilities/drive",
    siteName: siteConfig.siteName,
    title: "Drive for AI agents - Shared storage, file organization, and public URLs",
    description:
      "Add shared storage and file delivery to AI agent workflows with AnyCap Drive.",
  },
};

type PageContent = {
  breadcrumb: { name: string; href?: string }[];
  eyebrow: string;
  title: string;
  intro: string;
  usageHeading: string;
  usageExamples: readonly { title: string; code: string }[];
  useCasesHeading: string;
  useCases: readonly string[];
  relatedHeading: string;
  relatedPages: readonly { href: string; eyebrow: string; title: string; body: string }[];
  faqHeading: string;
  faqItems: readonly { question: string; answer: string }[];
  jsonLdHeadline: string;
  jsonLdDescription: string;
  jsonLdAbout: readonly string[];
  jsonLdKeywords: readonly string[];
};

const contentByLocale = {
  en: {
    breadcrumb: [
      { name: "Home", href: "/" },
      { name: "Capabilities", href: "/capabilities" },
      { name: "Drive" },
    ],
    eyebrow: "Capabilities",
    title: "Drive",
    intro:
      "AnyCap Drive gives agents a shared place to store outputs, organize assets, and hand off public URLs. Instead of treating storage as a separate product that each workflow has to rewire, drive makes persistence part of the same capability layer as generation, analysis, and retrieval.",
    usageHeading: "CLI usage",
    usageExamples: [
      { title: "Upload an output file", code: "anycap drive upload launch.mp4" },
      { title: "Share a stored asset", code: "anycap drive share dn_xKmP123" },
      { title: "List files in drive", code: "anycap drive list" },
    ],
    useCasesHeading: "When agents need drive",
    useCases: [
      "Keep generated images, videos, audio, and docs in one shared agent-accessible place.",
      "Create public URLs for outputs without bolting on a separate storage product per workflow.",
      "Organize reusable assets so different agents and sessions can work from the same file set.",
      "Make delivery part of the same runtime as generation, analysis, and retrieval.",
    ],
    relatedHeading: "Related pages",
    relatedPages: [
      {
        href: "/capabilities/video-generation",
        eyebrow: "Related capability",
        title: "Video Generation",
        body: "Generated videos become more useful when the workflow can persist and share them.",
      },
      {
        href: "/capabilities/image-generation",
        eyebrow: "Related capability",
        title: "Image Generation",
        body: "Save generated visuals and reference images into a reusable asset library.",
      },
      {
        href: "/pricing",
        eyebrow: "Pricing",
        title: "Pricing",
        body: "See how drive storage fits alongside the rest of the AnyCap product stack.",
      },
    ],
    faqHeading: "FAQ",
    faqItems: [
      {
        question: "Why include drive as an agent capability?",
        answer:
          "Because generation is only half the workflow. Agents also need a place to store outputs, retrieve them later, and hand off links to users or downstream systems without rebuilding storage on every project.",
      },
      {
        question: "What does AnyCap Drive give teams?",
        answer:
          "It gives teams a shared storage layer for generated outputs and reference assets, plus public links when files need to leave the agent runtime and reach people or other systems.",
      },
      {
        question: "How is drive different from generation or search?",
        answer:
          "Generation creates assets, search finds information, and drive keeps artifacts available after the action completes. It is the storage and delivery layer that lets agent workflows persist useful outputs.",
      },
      {
        question: "When should teams use drive?",
        answer:
          "Use drive when an agent needs to save artifacts, organize inputs and outputs, or return stable file links instead of ephemeral local files.",
      },
    ],
    jsonLdHeadline: "Drive for AI agents - Shared storage, file organization, and public URLs",
    jsonLdDescription:
      "Capability guide for adding shared storage to AI agents through AnyCap Drive, including file organization and public delivery workflows.",
    jsonLdAbout: ["Drive for AI agents", "Agent storage", "File sharing", "AnyCap Drive"],
    jsonLdKeywords: [
      "drive for ai agents",
      "agent storage",
      "file storage for ai agents",
      "public urls for agent outputs",
    ],
  },
  "pt-br": {
    breadcrumb: [
      { name: "Inicio", href: "/" },
      { name: "Capacidades", href: "/capabilities" },
      { name: "Drive" },
    ],
    eyebrow: "Capacidades",
    title: "Drive",
    intro:
      "O AnyCap Drive da aos agentes um lugar compartilhado para armazenar resultados, organizar ativos e entregar URLs publicas. Em vez de tratar armazenamento como um produto separado que cada fluxo precisa reintegrar, o Drive transforma persistencia em parte da mesma camada de capabilities usada para geracao, analise e recuperacao.",
    usageHeading: "Uso via CLI",
    usageExamples: [
      { title: "Envie um arquivo de saida", code: "anycap drive upload launch.mp4" },
      { title: "Compartilhe um ativo armazenado", code: "anycap drive share dn_xKmP123" },
      { title: "Liste os arquivos no drive", code: "anycap drive list" },
    ],
    useCasesHeading: "Quando agentes precisam de drive",
    useCases: [
      "Mantenha imagens, videos, audios e documentos gerados em um unico lugar acessivel para agentes.",
      "Crie URLs publicas para resultados sem acoplar um produto de armazenamento separado em cada fluxo.",
      "Organize ativos reutilizaveis para que agentes e sessoes diferentes trabalhem a partir do mesmo conjunto de arquivos.",
      "Torne a entrega parte do mesmo runtime usado para geracao, analise e recuperacao.",
    ],
    relatedHeading: "Paginas relacionadas",
    relatedPages: [
      {
        href: "/capabilities/video-generation",
        eyebrow: "Capability relacionada",
        title: "Geracao de video",
        body: "Videos gerados ficam mais uteis quando o fluxo consegue persisti-los e compartilha-los.",
      },
      {
        href: "/capabilities/image-generation",
        eyebrow: "Capability relacionada",
        title: "Geracao de imagem",
        body: "Salve visuais gerados e imagens de referencia em uma biblioteca de ativos reutilizavel.",
      },
      {
        href: "/pricing",
        eyebrow: "Precos",
        title: "Precos",
        body: "Veja como o armazenamento no Drive se encaixa no restante da stack de produto do AnyCap.",
      },
    ],
    faqHeading: "FAQ",
    faqItems: [
      {
        question: "Por que incluir drive como uma capability para agentes?",
        answer:
          "Porque geracao e apenas metade do fluxo. Os agentes tambem precisam de um lugar para guardar resultados, recupera-los depois e entregar links para usuarios ou sistemas downstream sem reconstruir o armazenamento em cada projeto.",
      },
      {
        question: "O que o AnyCap Drive entrega para equipes?",
        answer:
          "Ele entrega uma camada compartilhada de armazenamento para resultados gerados e ativos de referencia, alem de links publicos quando os arquivos precisam sair do runtime do agente e chegar a pessoas ou outros sistemas.",
      },
      {
        question: "Como drive difere de geracao ou busca?",
        answer:
          "Geracao cria ativos, busca encontra informacao, e drive mantem os artefatos disponiveis depois que a acao termina. Ele e a camada de armazenamento e entrega que permite aos fluxos de agentes persistirem resultados uteis.",
      },
      {
        question: "Quando as equipes devem usar drive?",
        answer:
          "Use drive quando um agente precisar salvar artefatos, organizar entradas e saidas, ou devolver links estaveis de arquivo em vez de arquivos locais efemeros.",
      },
    ],
    jsonLdHeadline: "Drive para agentes de IA - armazenamento compartilhado, organizacao de arquivos e URLs publicas",
    jsonLdDescription:
      "Guia de capability para adicionar armazenamento compartilhado a agentes de IA por meio do AnyCap Drive, incluindo organizacao de arquivos e fluxos de entrega publica.",
    jsonLdAbout: ["Drive para agentes de IA", "Armazenamento para agentes", "Compartilhamento de arquivos", "AnyCap Drive"],
    jsonLdKeywords: [
      "drive para agentes de ia",
      "armazenamento para agentes",
      "armazenamento de arquivos para agentes de ia",
      "urls publicas para resultados de agentes",
    ],
  },
} as const;

export default async function DriveCapabilityPage() {
  const locale = await getRequestLocale();
  const content = contentByLocale[locale as keyof typeof contentByLocale] ?? contentByLocale.en;
  const capabilityGuideJsonLd = createTechArticleJsonLd({
    headline: content.jsonLdHeadline,
    description: content.jsonLdDescription,
    path: "/capabilities/drive",
    locale,
    about: [...content.jsonLdAbout],
    keywords: [...content.jsonLdKeywords],
    datePublished: PAGE_LAST_MODIFIED_ISO,
    dateModified: PAGE_LAST_MODIFIED_ISO,
  });

  return (
    <>
      <BreadcrumbJsonLd items={content.breadcrumb} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(capabilityGuideJsonLd) }}
      />

      <article className="px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-[1280px] py-12 md:py-20 lg:py-24">
          <FadeIn>
            <p className="mb-4 text-[11px] tracking-[0.8px] text-[#6b7d3a]" style={mono}>
              {content.eyebrow}
            </p>
            <h1
              className="leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(32px, 6vw, 72px)" }}
            >
              {content.title}
            </h1>
            <p className="mt-6 max-w-[780px] text-base leading-7 text-[#4d5145] md:text-lg">
              {content.intro}
            </p>
          </FadeIn>

          <FadeIn className="mt-10">
            <DriveDemo />
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-6 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {content.usageHeading}
              </h2>
              <div className="max-w-[860px] space-y-6">
                {content.usageExamples.map((example) => (
                  <div key={example.title}>
                    <p className="mb-3 text-[11px] tracking-[0.5px] text-[#5a5e52]" style={mono}>
                      {example.title}
                    </p>
                    <div className="bg-[#1c1f17] px-5 py-4">
                      <p className="break-all text-[13px] text-[#d4e0a4]" style={mono}>
                        {example.code}
                      </p>
                    </div>
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
              <h2 className="mb-6 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {content.useCasesHeading}
              </h2>
              <div className="grid max-w-[920px] gap-4 sm:grid-cols-2">
                {content.useCases.map((useCase) => (
                  <div key={useCase} className="border-l-[3px] border-[#6b7d3a] pl-5">
                    <p className="text-sm leading-6 text-[#4d5145]">{useCase}</p>
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
                {content.relatedHeading}
              </h2>
              <div className="grid max-w-[1100px] gap-4 sm:grid-cols-3">
                {content.relatedPages.map((page) => (
                  <Link
                    key={page.href}
                    href={page.href}
                    className="rounded-xl border border-[#d4dbb8] p-5 transition-colors hover:border-[#6b7d3a]"
                  >
                    <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                      {page.eyebrow}
                    </p>
                    <h3 className="mb-2 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                      {page.title}
                    </h3>
                    <p className="text-sm leading-6 text-[#4d5145]">{page.body}</p>
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
                {content.faqHeading}
              </h2>
              <div className="max-w-[860px] space-y-6">
                {content.faqItems.map((item) => (
                  <div key={item.question} className="rounded-xl border border-[#d4dbb8] p-5">
                    <h3 className="mb-2 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                      {item.question}
                    </h3>
                    <p className="text-sm leading-6 text-[#4d5145]">{item.answer}</p>
                  </div>
                ))}
              </div>
            </section>
          </FadeIn>
        </div>
      </article>
    </>
  );
}
