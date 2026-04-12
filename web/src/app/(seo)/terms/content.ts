import type { Metadata } from "next";
import { getLocaleConfig, siteConfig, type SiteLocale } from "@/lib/site";

export const TERMS_PATH = "/terms";

type TermsSection = {
  kicker: string;
  title: string;
  bullets: readonly string[];
};

type TermsPageData = {
  metadata: {
    title: string;
    description: string;
    openGraphTitle: string;
    openGraphDescription: string;
  };
  breadcrumbItems: { name: string; href: string }[];
  eyebrow: string;
  heroTitle: string;
  heroIntro: string;
  lastUpdatedLabel: string;
  keyTermsTitle: string;
  keyTerms: readonly { title: string; body: string }[];
  coreTermsTitle: string;
  coreTerms: readonly TermsSection[];
  footerTitle: string;
  footerIntro: string;
  footerBody1: string;
  footerBody2: string;
  footerBody3: string;
  termsPageJsonLd: Record<string, unknown>;
};

const coreTermsEn: readonly TermsSection[] = [
  {
    kicker: "Scope",
    title: "What these terms cover",
    bullets: [
      "AnyCap provides an AI agent capability runtime, related web surfaces, installation paths, billing surfaces, and support materials for agent-led workflows.",
      "Using any part of the service means you agree to these baseline public terms and to the pricing or product notices shown when a workflow, plan, or paid surface is used.",
      "If you have a separate signed agreement with AnyCap, that written agreement controls to the extent it conflicts with this public page.",
    ],
  },
  {
    kicker: "Access",
    title: "Accounts, credentials, and local environments",
    bullets: [
      "Keep accounts, API keys, agent credentials, and connected local environments secure and reasonably controlled.",
      "You are responsible for activity occurring through your account or credentials unless caused directly by AnyCap.",
      "Do not bypass quota controls, access restrictions, plan limits, billing logic, or security safeguards.",
    ],
  },
  {
    kicker: "Inputs",
    title: "Prompts, files, URLs, and authority to use them",
    bullets: [
      "You remain responsible for the prompts, files, URLs, instructions, and third-party data you submit through AnyCap.",
      "Only submit content you are authorized to process and that is lawful to send through the requested workflow.",
      "Before sending production data, confirm that using AnyCap fits your own internal policies, customer commitments, and regulatory obligations.",
    ],
  },
  {
    kicker: "Outputs",
    title: "Review, verification, and downstream use",
    bullets: [
      "Outputs may be incomplete, inaccurate, offensive, delayed, unavailable, or unsuitable for a given use without human review and validation.",
      "You are responsible for how outputs are used, stored, published, shared, or relied on in downstream systems.",
      "AnyCap does not guarantee that the same prompt, route, provider, or model choice will remain available or produce identical results over time.",
    ],
  },
  {
    kicker: "Providers",
    title: "Third-party routing and capability changes",
    bullets: [
      "AnyCap may rely on third-party model, hosting, storage, authentication, analytics, payment, or other infrastructure providers to fulfill requests.",
      "To run a workflow, relevant request data may be sent to those upstream providers when needed for processing, delivery, or service operations.",
      "Capabilities may be added, removed, revised, paused, or deprecated, including changes to models, routes, limits, UI surfaces, and availability.",
    ],
  },
  {
    kicker: "Billing",
    title: "Credits, pricing, and usage controls",
    bullets: [
      "Paid usage is governed by the pricing, credit-pack, and plan information shown at the time of purchase or access.",
      "Promotional credits, free usage, feature availability, and packaging may change over time and may be subject to plan-specific limits or eligibility rules.",
      "AnyCap may meter, throttle, queue, cap, or reject requests based on credits, plan level, provider constraints, operational load, or abuse and risk signals.",
    ],
  },
  {
    kicker: "Protection",
    title: "Acceptable use and enforcement",
    bullets: [
      "You may not use AnyCap to violate law, abuse third-party services, interfere with platform stability, probe for weaknesses without authorization, or support clearly harmful, deceptive, or unauthorized activity.",
      "AnyCap may investigate suspected misuse and may limit, suspend, or terminate access when reasonably necessary for service protection, abuse prevention, legal compliance, or security response.",
      "We may remove or decline workflows, accounts, or access paths that create disproportionate operational, legal, financial, or trust risk for the platform.",
    ],
  },
  {
    kicker: "Limits",
    title: "Disclaimers and liability boundaries",
    bullets: [
      "AnyCap is provided on an as-available and as-evolving basis, without a guarantee of uninterrupted operation, provider continuity, or fitness for a specific workflow.",
      "To the maximum extent permitted by law, AnyCap disclaims implied warranties and is not responsible for indirect, incidental, special, consequential, or exemplary damages arising from use of the service.",
      "Nothing on this page is legal advice, and teams with procurement, contractual, or regulated-use requirements should complete their own review before scaling production use.",
    ],
  },
] as const;

const contentByLocale: Record<SiteLocale, TermsPageData> = {
  en: {
    metadata: {
      title: "Terms of Service | AnyCap",
      description:
        "Read the baseline AnyCap terms covering product access, acceptable use, third-party providers, billing surfaces, and service changes.",
      openGraphTitle: "Terms of Service | AnyCap",
      openGraphDescription:
        "Read the baseline AnyCap terms covering access, acceptable use, third-party providers, and service changes.",
    },
    breadcrumbItems: [
      { name: "Home", href: "/" },
      { name: "Terms", href: "/terms" },
    ],
    eyebrow: "Terms",
    heroTitle: "Service terms for AnyCap",
    heroIntro:
      "These baseline terms explain what AnyCap provides, what you remain responsible for in agent workflows, and when AnyCap may change, limit, or protect the service.",
    lastUpdatedLabel: "April 9, 2026",
    keyTermsTitle: "The practical baseline",
    keyTerms: [
      {
        title: "Authorized workflows only",
        body: "Use AnyCap only with prompts, files, URLs, and instructions you are authorized to process through the requested agent workflow.",
      },
      {
        title: "You own the decisions",
        body: "You remain responsible for submitted inputs, downstream use of outputs, and whether the workflow fits your policies, contracts, and compliance needs.",
      },
      {
        title: "Capabilities can evolve",
        body: "Models, routes, limits, interfaces, and provider availability may change as AnyCap and upstream systems evolve.",
      },
      {
        title: "We may protect the service",
        body: "AnyCap may meter, rate-limit, queue, reject, or suspend use when needed for abuse prevention, billing enforcement, legal compliance, platform stability, or security.",
      },
    ],
    coreTermsTitle: "The operating rules around AnyCap",
    coreTerms: coreTermsEn,
    footerTitle: "Make sure the workflow fits your team",
    footerIntro:
      "AnyCap is built for agent workflows, not as a guarantee that every model, provider, or route will remain fixed forever. Teams using the platform in production should review their data handling assumptions, output review standards, billing expectations, and any procurement or compliance requirements before they scale usage.",
    footerBody1:
      "Read this page together with the privacy policy, pricing, and about pages so the legal baseline matches the product and operating context.",
    footerBody2:
      "If your team needs clarification before broader rollout, email the AnyCap team or use the contact page.",
    footerBody3: "",
    termsPageJsonLd: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "AnyCap Terms of Service",
      description:
        "Terms of service for AnyCap, covering access, acceptable use, third-party providers, billing surfaces, and service changes.",
      url: "https://anycap.ai/terms",
      dateModified: "2026-04-09",
    },
  },
  "pt-br": {
    metadata: {
      title: "Termos de Serviço | AnyCap",
      description:
        "Leia os termos base do AnyCap cobrindo acesso ao produto, uso aceitável, provedores terceiros, superfícies de cobrança e mudanças no serviço.",
      openGraphTitle: "Termos de Serviço | AnyCap",
      openGraphDescription:
        "Leia os termos base do AnyCap cobrindo acesso, uso aceitável, provedores terceiros e mudanças no serviço.",
    },
    breadcrumbItems: [
      { name: "Início", href: "/" },
      { name: "Termos", href: "/terms" },
    ],
    eyebrow: "Termos",
    heroTitle: "Termos de serviço do AnyCap",
    heroIntro:
      "Estes termos base explicam o que o AnyCap fornece, do que você continua responsável em fluxos com agentes e quando o AnyCap pode mudar, limitar ou proteger o serviço.",
    lastUpdatedLabel: "9 de abril de 2026",
    keyTermsTitle: "A base prática",
    keyTerms: [
      {
        title: "Somente fluxos autorizados",
        body: "Use o AnyCap apenas com prompts, arquivos, URLs e instruções que você está autorizado a processar pelo fluxo de agente solicitado.",
      },
      {
        title: "As decisões são suas",
        body: "Você continua responsável pelos inputs enviados, pelo uso downstream dos outputs e por saber se o fluxo se encaixa nas suas políticas, contratos e necessidades de compliance.",
      },
      {
        title: "As capacidades podem evoluir",
        body: "Modelos, rotas, limites, interfaces e disponibilidade de provedores podem mudar conforme o AnyCap e os sistemas upstream evoluem.",
      },
      {
        title: "Podemos proteger o serviço",
        body: "O AnyCap pode medir, limitar, enfileirar, rejeitar ou suspender uso quando isso for necessário para prevenção de abuso, enforcement de cobrança, compliance legal, estabilidade da plataforma ou segurança.",
      },
    ],
    coreTermsTitle: "As regras operacionais do AnyCap",
    coreTerms: [
      {
        kicker: "Escopo",
        title: "O que estes termos cobrem",
        bullets: [
          "O AnyCap fornece um runtime de capacidades para agentes de IA, superfícies web relacionadas, caminhos de instalação, superfícies de cobrança e materiais de suporte para fluxos guiados por agentes.",
          "Usar qualquer parte do serviço significa concordar com estes termos públicos base e com os avisos de preço ou produto mostrados quando um fluxo, plano ou superfície paga for usado.",
          "Se você tiver um acordo assinado separado com o AnyCap, esse acordo escrito prevalece no que conflitar com esta página pública.",
        ],
      },
      {
        kicker: "Acesso",
        title: "Contas, credenciais e ambientes locais",
        bullets: [
          "Mantenha contas, chaves de API, credenciais de agente e ambientes locais conectados seguros e razoavelmente controlados.",
          "Você é responsável pela atividade que ocorrer por meio da sua conta ou credenciais, exceto quando causada diretamente pelo AnyCap.",
          "Não tente burlar controles de quota, restrições de acesso, limites de plano, lógica de cobrança ou salvaguardas de segurança.",
        ],
      },
      {
        kicker: "Inputs",
        title: "Prompts, arquivos, URLs e autorização para usá-los",
        bullets: [
          "Você continua responsável pelos prompts, arquivos, URLs, instruções e dados de terceiros que enviar pelo AnyCap.",
          "Envie somente conteúdo que você está autorizado a processar e que seja legal enviar pelo fluxo solicitado.",
          "Antes de enviar dados de produção, confirme que usar o AnyCap está alinhado com suas políticas internas, compromissos com clientes e obrigações regulatórias.",
        ],
      },
      {
        kicker: "Outputs",
        title: "Revisão, verificação e uso downstream",
        bullets: [
          "Outputs podem ser incompletos, imprecisos, ofensivos, atrasados, indisponíveis ou inadequados para um uso específico sem revisão humana e validação.",
          "Você é responsável por como os outputs são usados, armazenados, publicados, compartilhados ou considerados confiáveis em sistemas downstream.",
          "O AnyCap não garante que o mesmo prompt, rota, provedor ou escolha de modelo continue disponível ou produza resultados idênticos ao longo do tempo.",
        ],
      },
      {
        kicker: "Provedores",
        title: "Roteamento de terceiros e mudanças de capacidade",
        bullets: [
          "O AnyCap pode depender de provedores terceiros de modelo, hosting, armazenamento, autenticação, analytics, pagamento ou outra infraestrutura para cumprir requisições.",
          "Para executar um fluxo, os dados relevantes da requisição podem ser enviados a esses provedores upstream quando necessário para processamento, entrega ou operação do serviço.",
          "Capacidades podem ser adicionadas, removidas, revisadas, pausadas ou descontinuadas, incluindo mudanças em modelos, rotas, limites, superfícies de UI e disponibilidade.",
        ],
      },
      {
        kicker: "Cobrança",
        title: "Créditos, preço e controles de uso",
        bullets: [
          "O uso pago é governado pelas informações de preço, pacotes de crédito e planos exibidos no momento da compra ou acesso.",
          "Créditos promocionais, uso gratuito, disponibilidade de recursos e embalagem podem mudar ao longo do tempo e podem estar sujeitos a limites ou regras de elegibilidade específicas de plano.",
          "O AnyCap pode medir, limitar, enfileirar, impor teto ou rejeitar requisições com base em créditos, nível de plano, restrições de provedores, carga operacional ou sinais de abuso e risco.",
        ],
      },
      {
        kicker: "Proteção",
        title: "Uso aceitável e enforcement",
        bullets: [
          "Você não pode usar o AnyCap para violar leis, abusar de serviços de terceiros, interferir na estabilidade da plataforma, procurar fraquezas sem autorização ou apoiar atividade claramente nociva, enganosa ou não autorizada.",
          "O AnyCap pode investigar uso suspeito e pode limitar, suspender ou encerrar acesso quando isso for razoavelmente necessário para proteção do serviço, prevenção de abuso, compliance legal ou resposta de segurança.",
          "Podemos remover ou negar fluxos, contas ou caminhos de acesso que criem risco operacional, legal, financeiro ou de confiança desproporcional para a plataforma.",
        ],
      },
      {
        kicker: "Limites",
        title: "Isenções e fronteiras de responsabilidade",
        bullets: [
          "O AnyCap é fornecido no estado em que se encontra e em evolução, sem garantia de operação ininterrupta, continuidade de provedores ou adequação para um fluxo específico.",
          "Na extensão máxima permitida por lei, o AnyCap renuncia garantias implícitas e não é responsável por danos indiretos, incidentais, especiais, consequenciais ou exemplares decorrentes do uso do serviço.",
          "Nada nesta página é aconselhamento jurídico, e equipes com requisitos de procurement, contrato ou uso regulado devem fazer sua própria revisão antes de ampliar o uso em produção.",
        ],
      },
    ],
    footerTitle: "Garanta que o fluxo faz sentido para seu time",
    footerIntro:
      "O AnyCap foi construído para fluxos com agentes, não como garantia de que todo modelo, provedor ou rota permanecerá fixo para sempre. Times que usam a plataforma em produção devem revisar suas suposições de tratamento de dados, padrões de revisão de outputs, expectativas de cobrança e requisitos de procurement ou compliance antes de escalar o uso.",
    footerBody1:
      "Leia esta página junto com a política de privacidade, a página de preços e a página sobre para que a base legal combine com o produto e o contexto operacional.",
    footerBody2:
      "Se seu time precisar de esclarecimento antes de ampliar o rollout, envie email ao time do AnyCap ou use a página de contato.",
    footerBody3: "",
    termsPageJsonLd: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Termos de Serviço do AnyCap",
      description:
        "Termos de serviço do AnyCap, cobrindo acesso, uso aceitável, provedores terceiros, superfícies de cobrança e mudanças no serviço.",
      url: "https://anycap.ai/terms",
      dateModified: "2026-04-09",
    },
  },
  id: {} as TermsPageData,
};

contentByLocale.id = contentByLocale.en;

export function getTermsMetadata(locale: SiteLocale): Metadata {
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

export function getTermsPageData(locale: SiteLocale) {
  return contentByLocale[locale] ?? contentByLocale.en;
}
