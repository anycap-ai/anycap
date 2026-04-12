import type { Metadata } from "next";
import { createTechArticleJsonLd } from "@/lib/schema";
import { getLocaleConfig, siteConfig, type SiteLocale } from "@/lib/site";

export const WEB_SEARCH_PATH = "/capabilities/web-search";

type WebSearchPageData = {
  metadata: {
    title: string;
    description: string;
    openGraphTitle: string;
    openGraphDescription: string;
  };
  breadcrumbItems: { name: string; href?: string }[];
  eyebrow: string;
  heroTitle: string;
  heroIntro: string;
  heroImageAlt: string;
  usageTitle: string;
  usageExamples: { title: string; code: string }[];
  useCasesTitle: string;
  useCases: string[];
  workflowTitle: string;
  workflowSteps: { title: string; body: string }[];
  strengthsTitle: string;
  strengthCards: { title: string; body: string }[];
  relatedTitle: string;
  relatedPages: { eyebrow: string; title: string; href: string; body: string }[];
  faqTitle: string;
  faqItems: { question: string; answer: string }[];
  capabilityGuideJsonLd: Record<string, unknown>;
};

const usageExamples = [
  { code: 'anycap search --query "AI agent framework"' },
  { code: 'anycap search --query "AI agent framework" --no-crawl' },
  { code: 'anycap search --query "Go context" --include github.com --include go.dev' },
  { code: 'anycap search --query "Claude Code release" --time-range month' },
] as const;

const contentByLocale: Record<SiteLocale, WebSearchPageData> = {
  en: {
    metadata: {
      title: "Web Search API for AI agents, researchers, and teams - Structured search through one CLI",
      description:
        "Give AI agents, researchers, and teams web search through AnyCap. Run structured web search with domain filters, recency controls, and optional page crawling through one CLI instead of wiring a separate search API.",
      openGraphTitle:
        "Web Search API for AI agents, researchers, and teams - Structured search through one CLI",
      openGraphDescription:
        "Add web search to AI agents with one CLI, one auth flow, and one capability runtime.",
    },
    breadcrumbItems: [
      { name: "Home", href: "/" },
      { name: "Capabilities", href: "/capabilities" },
      { name: "Web Search" },
    ],
    eyebrow: "Capabilities",
    heroTitle: "Web Search",
    heroIntro:
      "AnyCap web search gives agents, researchers, and teams a structured web search API through one CLI. The workflow can retrieve result sets, constrain trusted domains, filter by recency, and pull page content into the workflow without relying on a separate browser extension or provider-specific search integration. That makes web search easier to combine with the rest of the AnyCap runtime.",
    heroImageAlt:
      "Editorial illustration showing web search results flowing into grounded answers and crawl steps",
    usageTitle: "CLI usage",
    usageExamples: [
      { title: "General web search", code: usageExamples[0].code },
      { title: "Fast titles and URLs only", code: usageExamples[1].code },
      { title: "Constrain domains", code: usageExamples[2].code },
      { title: "Recent results only", code: usageExamples[3].code },
    ],
    useCasesTitle: "When agents need web search",
    useCases: [
      "Find relevant pages, docs, or references before an agent writes or updates code.",
      "Search the web with structured results instead of opening a browser-based search workflow.",
      "Constrain searches to trusted domains when teams need more predictable retrieval.",
      "Pull page content directly into the workflow when the workflow needs more than just URLs and snippets.",
      "Support research, content, and operations workflows that need source lists instead of a final answer.",
    ],
    workflowTitle: "How the workflow usually runs",
    workflowSteps: [
      {
        title: "Step 1",
        body: "Start with structured search when the agent does not know the source yet. This gives you a result set instead of a speculative answer, which is usually the right first move for research, competitive scans, and release tracking.",
      },
      {
        title: "Step 2",
        body: "Use grounded search when the agent needs to turn evidence into an answer with citations. Use crawl when the exact URL is already known and you just need the page content without another discovery pass.",
      },
      {
        title: "Step 3",
        body: "Hand the result set back to the agent or team as source notes, citations, or a short evidence bundle. That makes web search an input to later work instead of a dead-end feature that stops at search results.",
      },
    ],
    strengthsTitle: "Where it wins and where it does not",
    strengthCards: [
      {
        title: "Discovery",
        body: 'Web search wins when the answer starts with "find me the sources" rather than "tell me the answer." It is the right first step when the agent needs options.',
      },
      {
        title: "Verification",
        body: "It also wins when the team cares about recency, domain trust, or a constrained source list. Those are usually the cases where a generic browser search feels too loose for production work.",
      },
      {
        title: "Handoff",
        body: "It loses value if you stop at the search result. The useful outcome is a source bundle that another agent, editor, or human can continue from without repeating the same search work.",
      },
    ],
    relatedTitle: "Related pages",
    relatedPages: [
      {
        eyebrow: "Related capability",
        title: "Grounded Web Search",
        href: "/capabilities/grounded-web-search",
        body: "Move up to citation-backed answers when the workflow needs synthesis instead of retrieval.",
      },
      {
        eyebrow: "Related capability",
        title: "Web Crawl",
        href: "/capabilities/web-crawl",
        body: "Use crawl when the URL is already known and the workflow just needs the page content.",
      },
      {
        eyebrow: "Pricing",
        title: "Pricing",
        href: "/pricing",
        body: "See the credit model for web search, grounded answers, and crawl requests.",
      },
    ],
    faqTitle: "FAQ",
    faqItems: [
      {
        question: "What does AnyCap web search let agents do?",
        answer:
          "It gives agents a structured web search API through the CLI. Teams can search by query, filter by domain or date, and optionally fetch full page content without stitching together separate browser tools or search providers.",
      },
      {
        question: "Why is web search its own capability page?",
        answer:
          "Because the market language here is API-shaped. Search demand is usually phrased as web search API, search API for AI agents, or real-time web search API rather than a generic capability term.",
      },
      {
        question: "How is this different from grounded web search?",
        answer:
          "Web search returns structured search results. Grounded web search synthesizes an answer with citations. The two capabilities share the same command family but solve different jobs.",
      },
      {
        question: "When should teams use standard web search first?",
        answer:
          "When the goal is discovery, retrieval, or collecting a result set. If the agent needs to inspect candidate pages itself, standard search is the cleaner starting point.",
      },
      {
        question: "Is this only for developers?",
        answer:
          "No. Web search is useful for researchers, content teams, operators, and support workflows that need trusted source lists, competitive scans, or fast collection of live references.",
      },
    ],
    capabilityGuideJsonLd: createTechArticleJsonLd({
      headline:
        "Web Search API for AI agents, researchers, and teams - Structured search through one CLI",
      description:
        "Capability guide for adding web search to AI agents through AnyCap, including general search, domain filters, recency filters, and optional crawling.",
      path: WEB_SEARCH_PATH,
      about: ["Web search API", "Search API for AI agents", "Real-time web search", "AnyCap", "Research workflows"],
      keywords: [
        "web search api",
        "search api for ai agents",
        "real time web search api",
        "web search api ai agents",
      ],
    }),
  },
  "pt-br": {
    metadata: {
      title: "API de busca na web para agentes de IA, pesquisadores e equipes - Busca estruturada por uma única CLI",
      description:
        "Dê busca na web a agentes de IA, pesquisadores e equipes com o AnyCap. Rode buscas estruturadas com filtros de domínio, controles de recência e crawl opcional de páginas por uma única CLI, sem precisar integrar uma API de busca separada.",
      openGraphTitle:
        "API de busca na web para agentes de IA, pesquisadores e equipes - Busca estruturada por uma única CLI",
      openGraphDescription:
        "Adicione busca na web a agentes de IA com uma única CLI, um único fluxo de autenticação e um único runtime de capacidades.",
    },
    breadcrumbItems: [
      { name: "Início", href: "/" },
      { name: "Capacidades", href: "/capabilities" },
      { name: "Busca na Web" },
    ],
    eyebrow: "Capacidades",
    heroTitle: "Busca na Web",
    heroIntro:
      "A busca na web do AnyCap oferece a agentes, pesquisadores e equipes uma API estruturada de busca através de uma única CLI. O fluxo pode recuperar conjuntos de resultados, restringir domínios confiáveis, filtrar por recência e trazer o conteúdo da página para dentro do trabalho sem depender de uma extensão de navegador separada ou de uma integração de busca específica de provedor. Isso torna a busca na web muito mais fácil de combinar com o restante do runtime do AnyCap.",
    heroImageAlt:
      "Ilustração editorial mostrando resultados de busca na web fluindo para respostas fundamentadas e etapas de crawl",
    usageTitle: "Uso da CLI",
    usageExamples: [
      { title: "Busca geral na web", code: usageExamples[0].code },
      { title: "Só títulos e URLs, mais rápido", code: usageExamples[1].code },
      { title: "Restringir domínios", code: usageExamples[2].code },
      { title: "Somente resultados recentes", code: usageExamples[3].code },
    ],
    useCasesTitle: "Quando agentes precisam de busca na web",
    useCases: [
      "Encontre páginas, documentos ou referências relevantes antes que um agente escreva ou atualize código.",
      "Pesquise a web com resultados estruturados em vez de abrir um fluxo de busca baseado em navegador.",
      "Restrinja buscas a domínios confiáveis quando a equipe precisar de recuperação mais previsível.",
      "Traga o conteúdo da página diretamente para o fluxo quando ele precisar de mais do que URLs e snippets.",
      "Dê suporte a fluxos de pesquisa, conteúdo e operações que precisam de listas de fontes em vez de uma resposta final.",
    ],
    workflowTitle: "Como o fluxo normalmente acontece",
    workflowSteps: [
      {
        title: "Etapa 1",
        body: "Comece com busca estruturada quando o agente ainda não conhece a fonte. Isso entrega um conjunto de resultados em vez de uma resposta especulativa, o que costuma ser o melhor primeiro passo para pesquisa, varreduras competitivas e acompanhamento de lançamentos.",
      },
      {
        title: "Etapa 2",
        body: "Use busca fundamentada quando o agente precisar transformar evidências em uma resposta com citações. Use crawl quando a URL exata já for conhecida e você só precisar do conteúdo da página, sem outra etapa de descoberta.",
      },
      {
        title: "Etapa 3",
        body: "Entregue o conjunto de resultados de volta ao agente ou à equipe como notas de fonte, citações ou um pequeno pacote de evidências. Isso faz da busca na web uma entrada para trabalho posterior, e não um recurso sem saída que para nos resultados.",
      },
    ],
    strengthsTitle: "Onde ela vence e onde não vence",
    strengthCards: [
      {
        title: "Descoberta",
        body: 'A busca na web vence quando a pergunta começa com "encontre as fontes" em vez de "me diga a resposta". É o primeiro passo certo quando o agente precisa de opções.',
      },
      {
        title: "Verificação",
        body: "Ela também vence quando a equipe se importa com recência, confiança no domínio ou uma lista de fontes restrita. Esses costumam ser os casos em que uma busca genérica de navegador é solta demais para trabalho de produção.",
      },
      {
        title: "Repasse",
        body: "Ela perde valor se você parar no resultado de busca. O resultado útil é um pacote de fontes que outro agente, editor ou humano possa continuar usando sem repetir o mesmo trabalho.",
      },
    ],
    relatedTitle: "Páginas relacionadas",
    relatedPages: [
      {
        eyebrow: "Capacidade relacionada",
        title: "Busca na Web Fundamentada",
        href: "/capabilities/grounded-web-search",
        body: "Suba para respostas com citações quando o fluxo precisar de síntese em vez de simples recuperação.",
      },
      {
        eyebrow: "Capacidade relacionada",
        title: "Crawl da Web",
        href: "/capabilities/web-crawl",
        body: "Use crawl quando a URL já é conhecida e o fluxo só precisa do conteúdo da página.",
      },
      {
        eyebrow: "Preços",
        title: "Preços",
        href: "/pricing",
        body: "Veja o modelo de créditos para busca na web, respostas fundamentadas e requisições de crawl.",
      },
    ],
    faqTitle: "FAQ",
    faqItems: [
      {
        question: "O que a busca na web do AnyCap permite que agentes façam?",
        answer:
          "Ela dá aos agentes uma API estruturada de busca na web através da CLI. As equipes podem buscar por consulta, filtrar por domínio ou data e, opcionalmente, obter o conteúdo completo das páginas sem costurar ferramentas de navegador ou provedores de busca separados.",
      },
      {
        question: "Por que a busca na web tem uma página própria de capacidade?",
        answer:
          "Porque a linguagem de mercado aqui é moldada como API. A demanda por busca costuma aparecer como web search API, search API for AI agents ou real-time web search API, e não como um termo genérico de capacidade.",
      },
      {
        question: "Como isso é diferente de busca na web fundamentada?",
        answer:
          "A busca na web retorna resultados estruturados. A busca fundamentada sintetiza uma resposta com citações. As duas capacidades compartilham a mesma família de comandos, mas resolvem trabalhos diferentes.",
      },
      {
        question: "Quando as equipes devem usar a busca padrão primeiro?",
        answer:
          "Quando o objetivo é descoberta, recuperação ou coleta de um conjunto de resultados. Se o agente precisa inspecionar páginas candidatas por conta própria, a busca padrão é o ponto de partida mais limpo.",
      },
      {
        question: "Isso é só para desenvolvedores?",
        answer:
          "Não. Busca na web é útil para pesquisadores, equipes de conteúdo, operações e suporte que precisam de listas de fontes confiáveis, varreduras competitivas ou coleta rápida de referências ao vivo.",
      },
    ],
    capabilityGuideJsonLd: createTechArticleJsonLd({
      headline:
        "API de busca na web para agentes de IA, pesquisadores e equipes - Busca estruturada por uma única CLI",
      description:
        "Guia de capacidade para adicionar busca na web a agentes de IA com o AnyCap, incluindo busca geral, filtros de domínio, filtros de recência e crawl opcional.",
      path: WEB_SEARCH_PATH,
      about: ["API de busca na web", "Search API para agentes de IA", "Busca na web em tempo real", "AnyCap"],
      keywords: [
        "api de busca na web",
        "search api para agentes de ia",
        "busca na web em tempo real",
        "busca na web para agentes",
      ],
    }),
  },
  id: {} as WebSearchPageData,
};

contentByLocale.id = contentByLocale.en;

export function getWebSearchMetadata(locale: SiteLocale): Metadata {
  const content = contentByLocale[locale] ?? contentByLocale.en;
  return {
    title: content.metadata.title,
    description: content.metadata.description,
    openGraph: {
      title: content.metadata.openGraphTitle,
      description: content.metadata.openGraphDescription,
      locale: getLocaleConfig(locale).ogLocale,
      siteName: siteConfig.siteName,
    },
  };
}

export function getWebSearchPageData(locale: SiteLocale) {
  return contentByLocale[locale] ?? contentByLocale.en;
}
