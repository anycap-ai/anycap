import type { Metadata } from "next";
import { WebCrawlDemo } from "@/components/landing/WebCrawlDemo";
import { CapabilityDetailPage } from "@/components/seo/CapabilityDetailPage";
import { createFaqPageJsonLd, createTechArticleJsonLd } from "@/lib/schema";
import { createLocalizedMetadataForPath } from "@/lib/localized-metadata";
import { getRequestLocale } from "@/lib/request-locale";
import { defaultLocale } from "@/lib/site";
import { getWebCrawlMetadata, WEB_CRAWL_PATH } from "./content";

export const runtime = "edge";

const PAGE_LAST_MODIFIED_ISO = "2026-04-13";

export const metadata: Metadata = createLocalizedMetadataForPath(
  defaultLocale,
  WEB_CRAWL_PATH,
  getWebCrawlMetadata(defaultLocale),
);

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
      { name: "Web Crawl" },
    ],
    eyebrow: "Capabilities",
    title: "Web Crawl",
    intro:
      "AnyCap web crawl gives agents a direct URL-to-Markdown extraction path through one CLI. Instead of wiring a separate crawling, scraping, or content extraction API, the agent can fetch a known page, normalize the content, and move it into the rest of the workflow through the same capability runtime used for search, generation, and analysis.",
    usageHeading: "CLI usage",
    usageExamples: [
      { title: "Read a known URL", code: "anycap crawl https://example.com" },
      { title: "Get the page title only", code: "anycap crawl https://go.dev | jq -r '.data.title'" },
      { title: "Extract Markdown content", code: "anycap crawl https://docs.go.dev/ref/spec | jq -r '.data.markdown'" },
    ],
    useCasesHeading: "When agents need web crawl",
    useCases: [
      "Convert known URLs into clean Markdown for downstream summarization or analysis.",
      "Extract documentation pages without maintaining a separate scraping stack.",
      "Fetch content directly when search has already identified the right source page.",
      "Normalize web page content before feeding it into a research, writing, or coding workflow.",
    ],
    relatedHeading: "Related pages",
    relatedPages: [
      {
        href: "/capabilities/web-search",
        eyebrow: "Related capability",
        title: "Web Search",
        body: "Search helps discover candidate pages before crawl extracts the content of the chosen URL.",
      },
      {
        href: "/capabilities/grounded-web-search",
        eyebrow: "Related capability",
        title: "Grounded Web Search",
        body: "Use grounded search when the workflow needs a synthesized answer with citations.",
      },
      {
        href: "/pricing",
        eyebrow: "Pricing",
        title: "Pricing",
        body: "See crawl pricing alongside search and the rest of the capability stack.",
      },
    ],
    faqHeading: "FAQ",
    faqItems: [
      {
        question: "What does AnyCap web crawl let agents do?",
        answer:
          "It lets agents take a known URL and convert the page into clean Markdown through one CLI command. That makes web crawl a practical content extraction layer for documentation, articles, and reference pages.",
      },
      {
        question: "Why not just call this scraping?",
        answer:
          "Scraping, crawl API, web data API, and content extraction API are all adjacent market terms. Web crawl is the capability label, but the page should also serve the broader content extraction intent because that is how demand usually appears.",
      },
      {
        question: "When should teams use crawl instead of search?",
        answer:
          "Use crawl when the target URL is already known and the agent needs the page content itself. Use search when the workflow still needs discovery or source selection.",
      },
      {
        question: "Why is Markdown conversion useful for AI agents?",
        answer:
          "Because Markdown is easier for downstream tools and models to process consistently. It reduces the amount of HTML cleanup or extraction logic teams need to maintain on their own.",
      },
    ],
    jsonLdHeadline: "Web Crawl API for AI agents - Content extraction and Markdown conversion",
    jsonLdDescription:
      "Capability guide for adding web crawl to AI agents through AnyCap, including URL-to-Markdown extraction and content retrieval workflows.",
    jsonLdAbout: ["Web crawl", "Content extraction API", "Crawl API", "AnyCap"],
    jsonLdKeywords: [
      "web crawl api",
      "content extraction api",
      "crawl api ai agents",
      "web scraping api ai agents",
    ],
  },
  "pt-br": {
    breadcrumb: [
      { name: "Inicio", href: "/" },
      { name: "Capacidades", href: "/capabilities" },
      { name: "Web crawl" },
    ],
    eyebrow: "Capacidades",
    title: "Web crawl",
    intro:
      "O web crawl do AnyCap da aos agentes um caminho direto de extracao de URL para Markdown por meio de uma unica CLI. Em vez de integrar uma API separada de crawling, scraping ou extracao de conteudo, o agente pode buscar uma pagina conhecida, normalizar o conteudo e leva-lo para o restante do fluxo dentro do mesmo runtime usado para busca, geracao e analise.",
    usageHeading: "Uso via CLI",
    usageExamples: [
      { title: "Leia uma URL conhecida", code: "anycap crawl https://example.com" },
      { title: "Pegue apenas o titulo da pagina", code: "anycap crawl https://go.dev | jq -r '.data.title'" },
      { title: "Extraia o conteudo em Markdown", code: "anycap crawl https://docs.go.dev/ref/spec | jq -r '.data.markdown'" },
    ],
    useCasesHeading: "Quando agentes precisam de web crawl",
    useCases: [
      "Converter URLs conhecidas em Markdown limpo para sumarizacao ou analise posterior.",
      "Extrair paginas de documentacao sem manter uma stack separada de scraping.",
      "Buscar conteudo diretamente quando a busca ja identificou a pagina-fonte correta.",
      "Normalizar o conteudo de paginas web antes de enviá-lo para um fluxo de pesquisa, escrita ou codigo.",
    ],
    relatedHeading: "Paginas relacionadas",
    relatedPages: [
      {
        href: "/capabilities/web-search",
        eyebrow: "Capability relacionada",
        title: "Busca na web",
        body: "A busca ajuda a descobrir paginas candidatas antes de o crawl extrair o conteudo da URL escolhida.",
      },
      {
        href: "/capabilities/grounded-web-search",
        eyebrow: "Capability relacionada",
        title: "Busca na web com grounding",
        body: "Use grounded search quando o fluxo precisar de uma resposta sintetizada com citacoes.",
      },
      {
        href: "/pricing",
        eyebrow: "Precos",
        title: "Precos",
        body: "Veja o preco do crawl ao lado da busca e do restante da stack de capabilities.",
      },
    ],
    faqHeading: "FAQ",
    faqItems: [
      {
        question: "O que o web crawl do AnyCap permite que os agentes facam?",
        answer:
          "Ele permite que os agentes peguem uma URL conhecida e convertam a pagina em Markdown limpo por meio de um unico comando de CLI. Isso torna web crawl uma camada pratica de extracao de conteudo para documentacao, artigos e paginas de referencia.",
      },
      {
        question: "Por que nao chamar isso simplesmente de scraping?",
        answer:
          "Scraping, crawl API, web data API e content extraction API sao todos termos de mercado proximos. Web crawl e o nome da capability, mas a pagina tambem precisa atender a intencao mais ampla de extracao de conteudo, porque e assim que a demanda costuma aparecer.",
      },
      {
        question: "Quando as equipes devem usar crawl em vez de busca?",
        answer:
          "Use crawl quando a URL de destino ja for conhecida e o agente precisar do proprio conteudo da pagina. Use busca quando o fluxo ainda precisar de descoberta ou selecao de fontes.",
      },
      {
        question: "Por que a conversao para Markdown e util para agentes de IA?",
        answer:
          "Porque Markdown e mais facil para ferramentas e modelos processarem de forma consistente. Isso reduz a quantidade de limpeza de HTML ou logica de extracao que a equipe precisa manter por conta propria.",
      },
    ],
    jsonLdHeadline: "API de web crawl para agentes de IA - extracao de conteudo e conversao para Markdown",
    jsonLdDescription:
      "Guia de capability para adicionar web crawl a agentes de IA com o AnyCap, incluindo extracao de URL para Markdown e fluxos de recuperacao de conteudo.",
    jsonLdAbout: ["Web crawl", "API de extracao de conteudo", "Crawl API", "AnyCap"],
    jsonLdKeywords: [
      "web crawl api",
      "content extraction api",
      "crawl api ai agents",
      "web scraping api ai agents",
    ],
  },
} as const;

export default async function WebCrawlPage() {
  const locale = await getRequestLocale();
  const content = contentByLocale[locale as keyof typeof contentByLocale] ?? contentByLocale.en;
  const capabilityGuideJsonLd = createTechArticleJsonLd({
    headline: content.jsonLdHeadline,
    description: content.jsonLdDescription,
    path: "/capabilities/web-crawl",
    locale,
    about: [...content.jsonLdAbout],
    keywords: [...content.jsonLdKeywords],
    datePublished: PAGE_LAST_MODIFIED_ISO,
    dateModified: PAGE_LAST_MODIFIED_ISO,
  });
  const faqJsonLd = createFaqPageJsonLd(content.faqItems);
  const useCases = content.useCases.map((useCase, index) => {
    const [title, ...rest] = useCase.split(".");
    return {
      title: title.length > 70 ? `Use case ${index + 1}` : title,
      description: rest.join(".").trim() || useCase,
    };
  });

  return (
    <CapabilityDetailPage
      breadcrumbItems={content.breadcrumb}
      jsonLd={capabilityGuideJsonLd}
      faqJsonLd={faqJsonLd}
      eyebrow={content.eyebrow}
      lastUpdatedLabel="Last updated April 13, 2026"
      title={content.title}
      accentTitle="for AI agents"
      intro={content.intro}
      searchIntents={content.jsonLdKeywords}
      actions={[
        { label: "Equip your Agent", href: "/start", primary: true },
        { label: "Web Search", href: "/capabilities/web-search" },
        { label: "Grounded Search", href: "/capabilities/grounded-web-search" },
      ]}
      demo={<WebCrawlDemo />}
      demoTitle="Read the source"
      demoBody="A known URL turns into clean Markdown the agent can reason over."
      proofPoints={[
        "Known URLs become normalized Markdown without a separate scraping stack.",
        "Crawl complements search: search discovers candidates, crawl extracts the chosen page.",
        "Extracted content can flow into research, writing, coding, and citation workflows.",
      ]}
      summaryLabel="The short answer"
      summaryText="Use AnyCap web crawl when the agent already knows the URL and needs clean page content, not a result list."
      workflowTitle="How web crawl fits an AnyCap workflow"
      workflowSteps={[
        {
          title: "Select",
          body: "The agent starts from a known URL, or receives one after a web search step has identified the right source.",
        },
        {
          title: "Extract",
          body: "AnyCap fetches the page and returns clean content that is easier for models and downstream tools to process.",
        },
        {
          title: "Reuse",
          body: "The agent can summarize, compare, quote, transform, or feed the extracted content into a larger workflow.",
        },
      ]}
      usageTitle={content.usageHeading}
      usageExamples={content.usageExamples}
      useCasesTitle={content.useCasesHeading}
      useCases={useCases}
      relatedTitle={content.relatedHeading}
      relatedCards={content.relatedPages}
      faqTitle={content.faqHeading}
      faqItems={content.faqItems}
      finalTitle="Let your agent read the page."
      finalBody="Use crawl when the source is already known and the agent needs clean content it can reuse without rebuilding extraction logic."
    />
  );
}
