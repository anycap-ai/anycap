import type { Metadata } from "next";
import { capabilitySummary, getLocaleConfig, getLocalizedRouteUrl, roadmapCapabilitySummary, siteConfig, type SiteLocale } from "@/lib/site";

export const ABOUT_PATH = "/about";

type AboutPageData = {
  metadata: {
    title: string;
    description: string;
    openGraphTitle: string;
    openGraphDescription: string;
  };
  breadcrumbItems: { name: string; href: string }[];
  eyebrow: string;
  heroTitle: [string, string];
  heroIntro: string;
  companyFactsTitle: string;
  companyFacts: { label: string; value: string }[];
  teamTitle: string;
  teamCards: { title: string; body: string }[];
  timelineTitle: string;
  timelineItems: { label: string; detail: string }[];
  referencesTitle: string;
  publicReferences: { label: string; href: string; detail: string }[];
  whatIsTitle: string;
  whatIsBody1: string;
  whatIsBody2: string;
  whyTitle: string;
  whyCards: { title: string; body: string }[];
  notTitle: string;
  notCards: { title: string; body: string }[];
  principlesTitle: string;
  principles: string[];
  contactTitle: string;
  contactPaths: { label: string; href: string; detail: string }[];
  trustTitle: string;
  trustSignals: { label: string; detail: string }[];
  aboutPageJsonLd: Record<string, unknown>;
  organizationJsonLd: Record<string, unknown>;
};

const organizationSameAs = [
  "https://github.com/anycap-ai/anycap",
  "https://github.com/anycap-ai/anycap/releases",
  "https://skills.sh/anycap-ai/anycap",
] as const;

const contentByLocale: Record<SiteLocale, AboutPageData> = {
  en: {
    metadata: {
      title: "About AnyCap - AI agent capability infrastructure",
      description:
        `About AnyCap, the team shipping an AI agent capability runtime with a public repository, release history, and one install path for ${capabilitySummary}.`,
      openGraphTitle: "About AnyCap - AI agent capability infrastructure",
      openGraphDescription:
        "Why AnyCap exists, what it is, what it is not, and the principles behind an agent-native capability runtime.",
    },
    breadcrumbItems: [
      { name: "Home", href: "/" },
      { name: "About", href: "/about" },
    ],
    eyebrow: "About",
    heroTitle: ["AnyCap builds capability", "infrastructure for agents."],
    heroIntro: `We focus on the layer between a reasoning agent and the capabilities it still needs to do real work: ${capabilitySummary}. The idea is simple. Keep the agent you already use. Add the missing capability runtime around it. ${roadmapCapabilitySummary} remain on the roadmap.`,
    companyFactsTitle: "Company facts",
    companyFacts: [
      { label: "Company", value: "AnyCap" },
      { label: "Product", value: "AI agent capability runtime" },
      { label: "Primary interface", value: "CLI + skill files" },
      { label: "Public repo history", value: "Since March 2026" },
      { label: "Shipping surfaces", value: "CLI, web app, edge delivery, skill distribution" },
      { label: "Official repository", value: "github.com/anycap-ai/anycap" },
      { label: "License", value: "MIT" },
      { label: "Last updated", value: "2026-04-08" },
    ],
    teamTitle: "How the team ships",
    teamCards: [
      {
        title: "Product and engineering",
        body:
          "AnyCap is shipped as one product surface across the CLI, the public website, the dashboard, and the edge delivery layer. That makes it possible to verify how the runtime, the docs, and the distribution path fit together.",
      },
      {
        title: "Distribution and releases",
        body:
          "The public repository documents GitHub releases, npm packaging, skill sync, and Cloudflare Pages deployment. The delivery path is visible instead of hidden behind a closed launch page.",
      },
      {
        title: "Feedback and iteration",
        body:
          "Operators can report issues through GitHub and through the built-in `anycap feedback` flow. That creates a real path from failed requests or missing capabilities back to the team.",
      },
    ],
    timelineTitle: "Public build timeline",
    timelineItems: [
      {
        label: "March 2026",
        detail:
          "Current public repository history begins, with the CLI, server, dashboard foundations, and website all shipping from the same codebase.",
      },
      {
        label: "Early April 2026",
        detail:
          "Capability inventory alignment, compare pages, and workflow-led SEO content were expanded so buyers can evaluate the product through concrete use cases instead of brand copy alone.",
      },
      {
        label: "Current operating model",
        detail:
          "AnyCap is being developed as an agent-first product with one runtime, one install path, one auth flow, and public documentation around releases, guides, and skills.",
      },
    ],
    referencesTitle: "Public references",
    publicReferences: [
      {
        label: "GitHub repository",
        href: "https://github.com/anycap-ai/anycap",
        detail: "Primary public codebase for the runtime, website, and skill files.",
      },
      {
        label: "GitHub releases",
        href: "https://github.com/anycap-ai/anycap/releases",
        detail: "Public release artifacts and notes for shipped CLI versions.",
      },
      {
        label: "skills.sh listing",
        href: "https://skills.sh/anycap-ai/anycap",
        detail: "Public skill distribution surface for agent installs.",
      },
      {
        label: "Install guide",
        href: "/guides/install-anycap",
        detail: "The shortest path from evaluation to a working local setup.",
      },
      {
        label: "Pricing",
        href: "/pricing",
        detail: "Public explanation of free credit and pay-as-you-go positioning.",
      },
    ],
    whatIsTitle: "What AnyCap is",
    whatIsBody1:
      "AnyCap is an agent-native capability runtime. It gives AI agents a consistent way to install, authenticate, and use capabilities that do not belong inside the base reasoning model.",
    whatIsBody2:
      "We care about the capability layer because that is where real workflows usually break. The agent can decide what to do, but it still cannot render the image, generate the video, inspect the screenshot, or move between those workflows through one stable interface.",
    whyTitle: "Why it exists",
    whyCards: [
      {
        title: "Reasoning is not enough",
        body:
          "Modern agents can plan and code, but they still fail the moment a workflow needs image generation, video generation, or a consistent vision layer.",
      },
      {
        title: "Tooling is too fragmented",
        body:
          "Every missing capability usually means another SDK, another auth flow, another provider-specific integration, and another way for the agent to fail.",
      },
      {
        title: "Agents deserve first-class products",
        body:
          "We think the capability layer should be built for agents from the start, not adapted from human dashboards or stitched together after the fact.",
      },
    ],
    notTitle: "What AnyCap is not",
    notCards: [
      {
        title: "Not a human dashboard product",
        body:
          "AnyCap is not built around clicking through admin panels. The primary interface is the runtime, the CLI, and the install path the agent can actually use.",
      },
      {
        title: "Not provider glue code",
        body:
          "We are not optimizing for custom one-off integrations per model vendor. The goal is one capability surface that stays consistent across providers.",
      },
      {
        title: "Not a replacement for your agent",
        body:
          "You keep Claude Code, Cursor, Codex, or another agent. AnyCap exists to add the capability layer they still need.",
      },
    ],
    principlesTitle: "Principles behind the product",
    principles: [
      "One install path instead of one install per provider",
      "One auth flow instead of fragmented credentials across the stack",
      "One command surface instead of capability-specific interfaces",
      "Built for agents first, then made understandable for humans",
    ],
    contactTitle: "Contact and reporting paths",
    contactPaths: [
      {
        label: "GitHub issues",
        href: "https://github.com/anycap-ai/anycap/issues",
        detail: "Best public path for bug reports, regressions, or roadmap requests.",
      },
      {
        label: "CLI feedback command",
        href: "/cli",
        detail: "Use `anycap feedback` when the issue comes from a live request or capability gap.",
      },
      {
        label: "Start here",
        href: "/start",
        detail: "Best next step when the goal is to verify the runtime directly.",
      },
    ],
    trustTitle: "Trust signals",
    trustSignals: [
      {
        label: "Open distribution",
        detail: "Skill files, release artifacts, and the main codebase are published through public GitHub paths.",
      },
      {
        label: "Portable runtime",
        detail: "The same capability layer is designed to work across Claude Code, Cursor, Codex, and adjacent agent products.",
      },
      {
        label: "Explicit capability model",
        detail: "We separate the runtime, the CLI, the skill file, and the capabilities so teams can reason about the stack clearly.",
      },
    ],
    aboutPageJsonLd: {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      name: "About AnyCap",
      description:
        `About page for AnyCap, an AI agent capability runtime that adds ${capabilitySummary} through one interface.`,
      url: getLocalizedRouteUrl(siteConfig.defaultLocale, "/about"),
      mainEntity: {
        "@type": "Organization",
        name: siteConfig.siteName,
        url: siteConfig.url,
        sameAs: organizationSameAs,
        contactPoint: [
          {
            "@type": "ContactPoint",
            contactType: "customer support",
            url: getLocalizedRouteUrl(siteConfig.defaultLocale, "/contact"),
          },
        ],
      },
    },
    organizationJsonLd: {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: siteConfig.siteName,
      url: siteConfig.url,
      sameAs: organizationSameAs,
      description:
        `AnyCap builds agent-native capability infrastructure that lets AI agents use ${capabilitySummary} through one runtime.`,
      contactPoint: [
        {
          "@type": "ContactPoint",
          contactType: "customer support",
          url: getLocalizedRouteUrl(siteConfig.defaultLocale, "/contact"),
        },
      ],
    },
  },
  "pt-br": {
    metadata: {
      title: "Sobre o AnyCap - Infraestrutura de capacidades para agentes de IA",
      description:
        `Sobre o AnyCap, o time que está entregando um runtime de capacidades para agentes de IA com repositório público, histórico de releases e um caminho de instalação para ${capabilitySummary}.`,
      openGraphTitle: "Sobre o AnyCap - Infraestrutura de capacidades para agentes de IA",
      openGraphDescription:
        "Por que o AnyCap existe, o que ele é, o que ele não é e os princípios por trás de um runtime de capacidades nativo para agentes.",
    },
    breadcrumbItems: [
      { name: "Início", href: "/" },
      { name: "Sobre", href: "/about" },
    ],
    eyebrow: "Sobre",
    heroTitle: ["O AnyCap constrói", "infraestrutura de capacidades para agentes."],
    heroIntro: `Nós focamos na camada entre um agente de raciocínio e as capacidades que ele ainda precisa para fazer trabalho real: ${capabilitySummary}. A ideia é simples. Mantenha o agente que você já usa. Adicione o runtime de capacidades faltante em volta dele. ${roadmapCapabilitySummary} continuam no roadmap.`,
    companyFactsTitle: "Fatos da empresa",
    companyFacts: [
      { label: "Empresa", value: "AnyCap" },
      { label: "Produto", value: "Runtime de capacidades para agentes de IA" },
      { label: "Interface principal", value: "CLI + arquivos de skill" },
      { label: "Histórico público do repositório", value: "Desde março de 2026" },
      { label: "Superfícies de entrega", value: "CLI, app web, edge delivery, distribuição de skills" },
      { label: "Repositório oficial", value: "github.com/anycap-ai/anycap" },
      { label: "Licença", value: "MIT" },
      { label: "Atualizado em", value: "2026-04-08" },
    ],
    teamTitle: "Como o time entrega",
    teamCards: [
      {
        title: "Produto e engenharia",
        body:
          "O AnyCap é entregue como uma única superfície de produto em CLI, site público, dashboard e camada de delivery na edge. Isso permite verificar como o runtime, a documentação e o caminho de distribuição se encaixam.",
      },
      {
        title: "Distribuição e releases",
        body:
          "O repositório público documenta releases do GitHub, empacotamento npm, sincronização de skills e deploy no Cloudflare Pages. O caminho de entrega é visível em vez de ficar escondido atrás de uma página fechada de lançamento.",
      },
      {
        title: "Feedback e iteração",
        body:
          "Operadores podem reportar issues via GitHub e pelo fluxo embutido `anycap feedback`. Isso cria um caminho real entre requisições com falha ou capacidades faltantes e o time.",
      },
    ],
    timelineTitle: "Linha do tempo pública",
    timelineItems: [
      {
        label: "Março de 2026",
        detail:
          "Começa o histórico público atual do repositório, com CLI, servidor, base do dashboard e website sendo entregues a partir do mesmo codebase.",
      },
      {
        label: "Início de abril de 2026",
        detail:
          "O alinhamento do inventário de capacidades, as páginas de comparação e o conteúdo SEO guiado por workflows foram ampliados para que compradores avaliem o produto por casos concretos, e não só por copy de marca.",
      },
      {
        label: "Modelo operacional atual",
        detail:
          "O AnyCap está sendo desenvolvido como um produto first-party para agentes, com um runtime, um caminho de instalação, um fluxo de auth e documentação pública sobre releases, guias e skills.",
      },
    ],
    referencesTitle: "Referências públicas",
    publicReferences: [
      {
        label: "Repositório GitHub",
        href: "https://github.com/anycap-ai/anycap",
        detail: "Base pública principal para runtime, website e arquivos de skill.",
      },
      {
        label: "Releases do GitHub",
        href: "https://github.com/anycap-ai/anycap/releases",
        detail: "Artefatos públicos e notas de versões da CLI já entregues.",
      },
      {
        label: "Listagem no skills.sh",
        href: "https://skills.sh/anycap-ai/anycap",
        detail: "Superfície pública de distribuição de skill para installs em agentes.",
      },
      {
        label: "Guia de instalação",
        href: "/guides/install-anycap",
        detail: "O caminho mais curto da avaliação até um setup local funcionando.",
      },
      {
        label: "Preços",
        href: "/pricing",
        detail: "Explicação pública do posicionamento com créditos grátis e pay-as-you-go.",
      },
    ],
    whatIsTitle: "O que o AnyCap é",
    whatIsBody1:
      "O AnyCap é um runtime de capacidades nativo para agentes. Ele dá aos agentes de IA uma forma consistente de instalar, autenticar e usar capacidades que não pertencem ao modelo base de raciocínio.",
    whatIsBody2:
      "A gente se importa com a camada de capacidades porque é aí que os fluxos reais costumam quebrar. O agente pode decidir o que fazer, mas ainda não consegue renderizar a imagem, gerar o vídeo, inspecionar a screenshot ou alternar entre esses fluxos por meio de uma interface estável.",
    whyTitle: "Por que ele existe",
    whyCards: [
      {
        title: "Raciocínio não basta",
        body:
          "Agentes modernos conseguem planejar e programar, mas ainda falham no momento em que um fluxo precisa de geração de imagem, geração de vídeo ou uma camada consistente de visão.",
      },
      {
        title: "As ferramentas são fragmentadas demais",
        body:
          "Cada capacidade faltante normalmente significa outro SDK, outro fluxo de auth, outra integração específica de provedor e outro jeito de o agente falhar.",
      },
      {
        title: "Agentes merecem produtos de primeira classe",
        body:
          "A gente acredita que a camada de capacidades deve ser construída para agentes desde o início, e não adaptada de dashboards humanos ou montada depois do fato.",
      },
    ],
    notTitle: "O que o AnyCap não é",
    notCards: [
      {
        title: "Não é um dashboard para humanos",
        body:
          "O AnyCap não foi feito para navegar em painéis administrativos. A interface principal é o runtime, a CLI e o caminho de instalação que o agente realmente pode usar.",
      },
      {
        title: "Não é cola entre provedores",
        body:
          "A gente não está otimizando para integrações one-off por fornecedor de modelo. O objetivo é uma superfície de capacidades que permaneça consistente entre provedores.",
      },
      {
        title: "Não substitui seu agente",
        body:
          "Você continua com Claude Code, Cursor, Codex ou outro agente. O AnyCap existe para adicionar a camada de capacidades que eles ainda precisam.",
      },
    ],
    principlesTitle: "Princípios por trás do produto",
    principles: [
      "Um caminho de instalação em vez de um install por provedor",
      "Um fluxo de auth em vez de credenciais fragmentadas na stack",
      "Uma superfície de comando em vez de interfaces específicas de capacidade",
      "Feito primeiro para agentes, depois tornado compreensível para humanos",
    ],
    contactTitle: "Canais de contato e reporte",
    contactPaths: [
      {
        label: "Issues do GitHub",
        href: "https://github.com/anycap-ai/anycap/issues",
        detail: "Melhor caminho público para bugs, regressões ou pedidos de roadmap.",
      },
      {
        label: "Comando de feedback da CLI",
        href: "/cli",
        detail: "Use `anycap feedback` quando o problema vier de uma requisição real ou de uma lacuna de capacidade.",
      },
      {
        label: "Comece aqui",
        href: "/start",
        detail: "Melhor próximo passo quando o objetivo é verificar o runtime diretamente.",
      },
    ],
    trustTitle: "Sinais de confiança",
    trustSignals: [
      {
        label: "Distribuição aberta",
        detail: "Arquivos de skill, artefatos de release e o codebase principal são publicados por caminhos públicos no GitHub.",
      },
      {
        label: "Runtime portátil",
        detail: "A mesma camada de capacidades foi desenhada para funcionar em Claude Code, Cursor, Codex e produtos adjacentes para agentes.",
      },
      {
        label: "Modelo explícito de capacidades",
        detail: "Separar runtime, CLI, arquivo de skill e capacidades ajuda equipes a raciocinar claramente sobre a stack.",
      },
    ],
    aboutPageJsonLd: {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      name: "Sobre o AnyCap",
      description:
        `Página sobre o AnyCap, um runtime de capacidades para agentes de IA que adiciona ${capabilitySummary} por meio de uma única interface.`,
      url: getLocalizedRouteUrl(siteConfig.defaultLocale, "/about"),
      mainEntity: {
        "@type": "Organization",
        name: siteConfig.siteName,
        url: siteConfig.url,
        sameAs: organizationSameAs,
        contactPoint: [
          {
            "@type": "ContactPoint",
            contactType: "customer support",
            url: getLocalizedRouteUrl(siteConfig.defaultLocale, "/contact"),
          },
        ],
      },
    },
    organizationJsonLd: {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: siteConfig.siteName,
      url: siteConfig.url,
      sameAs: organizationSameAs,
      description:
        `O AnyCap constrói infraestrutura de capacidades nativa para agentes que permite que agentes de IA usem ${capabilitySummary} por meio de um único runtime.`,
      contactPoint: [
        {
          "@type": "ContactPoint",
          contactType: "customer support",
          url: getLocalizedRouteUrl(siteConfig.defaultLocale, "/contact"),
        },
      ],
    },
  },
  id: {} as AboutPageData,
};

contentByLocale.id = contentByLocale.en;

export function getAboutMetadata(locale: SiteLocale): Metadata {
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

export function getAboutPageData(locale: SiteLocale) {
  return contentByLocale[locale] ?? contentByLocale.en;
}
