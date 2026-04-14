import type { Metadata } from "next";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { FadeIn } from "@/components/ui/FadeIn";
import { GroundedSearchDemo } from "@/components/landing/GroundedSearchDemo";
import { createTechArticleJsonLd } from "@/lib/schema";
import { getRequestLocale } from "@/lib/request-locale";
import { siteConfig } from "@/lib/site";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;
const PAGE_LAST_MODIFIED_ISO = "2026-04-13";

export const metadata: Metadata = {
  title: "Grounded Web Search for AI agents - Answers with citations through one CLI",
  description:
    "Give AI agents grounded web search through AnyCap. Get synthesized answers with citations from live web search through one CLI instead of building a separate grounded search flow.",
  alternates: { canonical: "/capabilities/grounded-web-search" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/capabilities/grounded-web-search",
    siteName: siteConfig.siteName,
    title: "Grounded Web Search for AI agents - Answers with citations through one CLI",
    description:
      "Add citation-backed grounded web search to AI agents with one CLI and one capability runtime.",
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
      { name: "Grounded Web Search" },
    ],
    eyebrow: "Capabilities",
    title: "Grounded Web Search",
    intro:
      "AnyCap grounded web search gives agents citation-backed answers through one CLI. Instead of assembling a separate retrieval pipeline and answer layer, teams can ask a question, get a synthesized response, and preserve source attribution in the same runtime. That makes grounded search especially useful for research, audit, and freshness-sensitive agent workflows.",
    usageHeading: "CLI usage",
    usageExamples: [
      {
        title: "Grounded question answering",
        code: 'anycap search --prompt "What are the latest changes in Go 1.25?"',
      },
      {
        title: "Comparison with citations",
        code: 'anycap search --prompt "Compare React vs Vue in terms of performance"',
      },
      {
        title: "Extract the answer text",
        code: 'anycap search --prompt "What is context engineering?" | jq -r \'\.data.content\'',
      },
      {
        title: "List cited sources",
        code:
          'anycap search --prompt "latest Go releases" | jq -r \'\.data.search_metadata.sources[] | "\\(.title): \\(.uri)"\'',
      },
    ],
    useCasesHeading: "When agents need grounded web search",
    useCases: [
      "Answer research questions when the workflow needs synthesized output instead of a raw result list.",
      "Return citations and source attribution for research, reporting, and high-trust workflows.",
      "Use grounded search inside an agent loop without hand-building retrieval plus answer synthesis.",
      "Handle freshness-sensitive questions where teams need both an answer and visible source backing.",
    ],
    relatedHeading: "Related pages",
    relatedPages: [
      {
        href: "/capabilities/web-search",
        eyebrow: "Related capability",
        title: "Web Search",
        body: "Start there when the workflow needs retrieval and result selection before synthesis.",
      },
      {
        href: "/capabilities/web-crawl",
        eyebrow: "Related capability",
        title: "Web Crawl",
        body: "Use crawl when the source URL is known and the workflow only needs the page content.",
      },
      {
        href: "/pricing",
        eyebrow: "Pricing",
        title: "Pricing",
        body: "Compare standard search and grounded search credit costs on the pricing page.",
      },
    ],
    faqHeading: "FAQ",
    faqItems: [
      {
        question: "What does grounded web search let agents do?",
        answer:
          "It lets agents ask a question and receive a synthesized answer grounded in live web search results with citations. That is different from standard search, which returns a list of pages for the agent to inspect itself.",
      },
      {
        question: "What search language should this page target?",
        answer:
          "The best supporting language is grounded web search, AI grounded search, search with citations, and grounded search API. These phrases map better to the actual job than a generic search label.",
      },
      {
        question: "When should teams prefer grounded search over standard web search?",
        answer:
          "Use grounded search when the agent needs a direct answer with citations. Use standard web search when the agent needs to inspect a result set, choose sources, or perform downstream extraction itself.",
      },
      {
        question: "Why is this valuable for AI agents specifically?",
        answer:
          "Because grounded search collapses retrieval and answer generation into a single runtime step while preserving source attribution. That is a strong fit for research, audit, and decision-support workflows.",
      },
    ],
    jsonLdHeadline: "Grounded Web Search for AI agents - Answers with citations through one CLI",
    jsonLdDescription:
      "Capability guide for adding grounded web search to AI agents through AnyCap, including citation-backed answers and live web search synthesis.",
    jsonLdAbout: ["Grounded search", "Search with citations", "AI grounded search", "AnyCap"],
    jsonLdKeywords: [
      "grounded web search",
      "ai grounded search",
      "search with citations",
      "grounded search api",
    ],
  },
  "pt-br": {
    breadcrumb: [
      { name: "Inicio", href: "/" },
      { name: "Capacidades", href: "/capabilities" },
      { name: "Busca na web com grounding" },
    ],
    eyebrow: "Capacidades",
    title: "Busca na web com grounding",
    intro:
      "A busca na web com grounding do AnyCap da aos agentes respostas com citacoes por meio de uma unica CLI. Em vez de montar uma pipeline separada de recuperacao e outra camada de resposta, a equipe pode fazer uma pergunta, receber uma resposta sintetizada e preservar a atribuicao da fonte no mesmo runtime. Isso torna grounded search especialmente util para pesquisa, auditoria e fluxos sensiveis a atualidade.",
    usageHeading: "Uso via CLI",
    usageExamples: [
      {
        title: "Pergunta com grounding",
        code: 'anycap search --prompt "What are the latest changes in Go 1.25?"',
      },
      {
        title: "Comparacao com citacoes",
        code: 'anycap search --prompt "Compare React vs Vue in terms of performance"',
      },
      {
        title: "Extraia apenas o texto da resposta",
        code: 'anycap search --prompt "What is context engineering?" | jq -r \'\.data.content\'',
      },
      {
        title: "Liste as fontes citadas",
        code:
          'anycap search --prompt "latest Go releases" | jq -r \'\.data.search_metadata.sources[] | "\\(.title): \\(.uri)"\'',
      },
    ],
    useCasesHeading: "Quando agentes precisam de busca na web com grounding",
    useCases: [
      "Responder perguntas de pesquisa quando o fluxo precisa de uma saida sintetizada em vez de uma lista bruta de resultados.",
      "Devolver citacoes e atribuicao de fonte para pesquisa, relatorios e fluxos de alta confianca.",
      "Usar grounded search dentro do loop do agente sem montar manualmente recuperacao mais sintese da resposta.",
      "Lidar com perguntas sensiveis a atualidade quando a equipe precisa tanto da resposta quanto do respaldo visivel das fontes.",
    ],
    relatedHeading: "Paginas relacionadas",
    relatedPages: [
      {
        href: "/capabilities/web-search",
        eyebrow: "Capability relacionada",
        title: "Busca na web",
        body: "Comece por la quando o fluxo precisar de recuperacao e selecao de resultados antes da sintese.",
      },
      {
        href: "/capabilities/web-crawl",
        eyebrow: "Capability relacionada",
        title: "Web crawl",
        body: "Use crawl quando a URL da fonte ja for conhecida e o fluxo precisar apenas do conteudo da pagina.",
      },
      {
        href: "/pricing",
        eyebrow: "Precos",
        title: "Precos",
        body: "Compare os custos de creditos entre busca padrao e busca com grounding na pagina de precos.",
      },
    ],
    faqHeading: "FAQ",
    faqItems: [
      {
        question: "O que a busca na web com grounding permite que os agentes facam?",
        answer:
          "Ela permite que os agentes facam uma pergunta e recebam uma resposta sintetizada com base em resultados de busca na web em tempo real, incluindo citacoes. Isso e diferente da busca padrao, que devolve uma lista de paginas para o agente inspecionar por conta propria.",
      },
      {
        question: "Que linguagem de busca esta pagina deve atacar?",
        answer:
          "Os melhores termos de apoio sao grounded web search, AI grounded search, search with citations e grounded search API. Essas expressoes se aproximam mais do trabalho real do que um rotulo generico de busca.",
      },
      {
        question: "Quando as equipes devem preferir grounded search a busca padrao?",
        answer:
          "Use grounded search quando o agente precisar de uma resposta direta com citacoes. Use busca padrao quando o agente precisar inspecionar o conjunto de resultados, escolher fontes ou fazer extracao posterior por conta propria.",
      },
      {
        question: "Por que isso e valioso especificamente para agentes de IA?",
        answer:
          "Porque grounded search junta recuperacao e geracao de resposta em um unico passo do runtime, preservando a atribuicao das fontes. Isso se encaixa muito bem em fluxos de pesquisa, auditoria e suporte a decisao.",
      },
    ],
    jsonLdHeadline: "Busca na web com grounding para agentes de IA - respostas com citacoes em uma unica CLI",
    jsonLdDescription:
      "Guia de capability para adicionar busca na web com grounding a agentes de IA com o AnyCap, incluindo respostas com citacoes e sintese sobre busca ao vivo.",
    jsonLdAbout: ["Grounded search", "Busca com citacoes", "Busca com grounding para IA", "AnyCap"],
    jsonLdKeywords: [
      "grounded web search",
      "ai grounded search",
      "search with citations",
      "grounded search api",
    ],
  },
} as const;

export default async function GroundedWebSearchPage() {
  const locale = await getRequestLocale();
  const content = contentByLocale[locale as keyof typeof contentByLocale] ?? contentByLocale.en;
  const capabilityGuideJsonLd = createTechArticleJsonLd({
    headline: content.jsonLdHeadline,
    description: content.jsonLdDescription,
    path: "/capabilities/grounded-web-search",
    locale,
    about: [...content.jsonLdAbout],
    keywords: [...content.jsonLdKeywords],
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
            <GroundedSearchDemo />
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
