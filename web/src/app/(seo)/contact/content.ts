import type { Metadata } from "next";
import { getLocaleConfig, siteConfig, type SiteLocale } from "@/lib/site";

export const CONTACT_PATH = "/contact";

type ContactRoute =
  | {
      title: string;
      detail: string;
      ctaLabel: string;
      ctaKind: "link";
      ctaHref: string;
    }
  | {
      title: string;
      detail: string;
      ctaLabel: string;
      ctaKind: "email";
      ctaSubject?: string;
    };

type ContactPageData = {
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
  routesTitle: string;
  contactRoutes: readonly ContactRoute[];
  checklistTitle: string;
  supportChecklist: readonly string[];
  directTitle: string;
  directBody1: string;
  directBody2: string;
  directBody3: string;
  contactPageJsonLd: Record<string, unknown>;
};

const contactRoutesEn: readonly ContactRoute[] = [
  {
    title: "Product support and install help",
    detail:
      "If you are trying to get your first workflow running, start with the install guide and include the agent, capability, and exact step that failed.",
    ctaLabel: "Open install guide",
    ctaKind: "link",
    ctaHref: "/guides/install-anycap",
  },
  {
    title: "Bug reports and regressions",
    detail:
      "For reproducible bugs, GitHub issues are the best path because they keep stack traces, environment details, and screenshots in one public thread.",
    ctaLabel: "Open GitHub issues",
    ctaKind: "link",
    ctaHref: "https://github.com/anycap-ai/anycap/issues",
  },
  {
    title: "Pricing and enterprise questions",
    detail:
      "If you need larger credit volume, invoiced billing, or product fit clarification, contact the team directly by email.",
    ctaLabel: "Email the team",
    ctaKind: "email",
    ctaSubject: "AnyCap Enterprise pricing",
  },
];

const checklistEn = [
  "Which agent you are using, such as Claude Code, Cursor, Codex, or Manus",
  "Which capability or page you were trying to use",
  "The expected output and the actual result",
  "Any relevant error message, request ID, or screenshot",
  "Whether the problem is blocking production, evaluation, or a one-off test",
] as const;

const contentByLocale: Record<SiteLocale, ContactPageData> = {
  en: {
    metadata: {
      title: "Contact AnyCap - Support, pricing, and issue reporting",
      description:
        "Contact AnyCap for install help, pricing questions, bug reports, security or privacy questions, and product feedback.",
      openGraphTitle: "Contact AnyCap - Support, pricing, and issue reporting",
      openGraphDescription:
        "Find the best path for AnyCap support, pricing questions, bug reports, and security or privacy requests.",
    },
    breadcrumbItems: [
      { name: "Home", href: "/" },
      { name: "Contact", href: "/contact" },
    ],
    eyebrow: "Contact",
    heroTitle: "Get in touch with the AnyCap team.",
    heroIntro:
      "Use this page when you need install help, pricing clarification, product fit questions, bug reporting paths, or a clear route for security and privacy requests.",
    lastUpdatedLabel: "April 9, 2026",
    routesTitle: "Best route by question",
    contactRoutes: contactRoutesEn,
    checklistTitle: "Include this when you reach out",
    supportChecklist: checklistEn,
    directTitle: "Direct contact",
    directBody1:
      "Email the AnyCap team for pricing conversations, privacy requests, or any issue that should not live in a public GitHub thread.",
    directBody2:
      "If the issue comes from a live workflow, you can also use the CLI surface or route details through the public GitHub issue tracker.",
    directBody3:
      "For install help, start with the install guide. For product and plan context, review the pricing page.",
    contactPageJsonLd: {
      "@context": "https://schema.org",
      "@type": "ContactPage",
      name: "Contact AnyCap",
      description:
        "Contact AnyCap for support, pricing, product questions, security reporting, and privacy requests.",
      url: "https://anycap.ai/contact",
      mainEntity: {
        "@type": "Organization",
        name: siteConfig.siteName,
        url: siteConfig.url,
        contactPoint: [
          {
            "@type": "ContactPoint",
            contactType: "customer support",
            url: "https://anycap.ai/contact",
          },
        ],
      },
    },
  },
  "pt-br": {
    metadata: {
      title: "Contate o AnyCap - Suporte, preços e reporte de problemas",
      description:
        "Fale com o AnyCap para ajuda de instalação, dúvidas de preço, reporte de bugs, questões de segurança ou privacidade e feedback de produto.",
      openGraphTitle: "Contate o AnyCap - Suporte, preços e reporte de problemas",
      openGraphDescription:
        "Encontre o melhor caminho para suporte do AnyCap, dúvidas de preço, reporte de bugs e pedidos de segurança ou privacidade.",
    },
    breadcrumbItems: [
      { name: "Início", href: "/" },
      { name: "Contato", href: "/contact" },
    ],
    eyebrow: "Contato",
    heroTitle: "Fale com o time do AnyCap.",
    heroIntro:
      "Use esta página quando precisar de ajuda de instalação, esclarecimento de preços, dúvidas de encaixe do produto, caminhos para reportar bugs ou um caminho claro para pedidos de segurança e privacidade.",
    lastUpdatedLabel: "9 de abril de 2026",
    routesTitle: "Melhor caminho por tipo de dúvida",
    contactRoutes: [
      {
        title: "Suporte ao produto e ajuda de instalação",
        detail:
          "Se você está tentando fazer seu primeiro fluxo funcionar, comece pelo guia de instalação e inclua o agente, a capacidade e a etapa exata que falhou.",
        ctaLabel: "Abrir guia de instalação",
        ctaKind: "link",
        ctaHref: "/guides/install-anycap",
      },
      {
        title: "Reporte de bugs e regressões",
        detail:
          "Para bugs reproduzíveis, issues no GitHub são o melhor caminho porque mantêm stack traces, detalhes do ambiente e screenshots em um único thread público.",
        ctaLabel: "Abrir issues no GitHub",
        ctaKind: "link",
        ctaHref: "https://github.com/anycap-ai/anycap/issues",
      },
      {
        title: "Dúvidas de preço e enterprise",
        detail:
          "Se você precisa de mais volume de créditos, cobrança faturada ou esclarecimento de encaixe do produto, fale diretamente com o time por email.",
        ctaLabel: "Enviar email ao time",
        ctaKind: "email",
        ctaSubject: "AnyCap Enterprise pricing",
      },
    ],
    checklistTitle: "Inclua isto quando entrar em contato",
    supportChecklist: [
      "Qual agente você está usando, como Claude Code, Cursor, Codex ou Manus",
      "Qual capacidade ou página você estava tentando usar",
      "O resultado esperado e o resultado real",
      "Qualquer mensagem de erro, request ID ou screenshot relevante",
      "Se o problema está bloqueando produção, avaliação ou um teste pontual",
    ],
    directTitle: "Contato direto",
    directBody1:
      "Envie email ao time do AnyCap para conversas de preço, pedidos de privacidade ou qualquer issue que não deva viver em um thread público do GitHub.",
    directBody2:
      "Se o problema vier de um fluxo ao vivo, você também pode usar a superfície da CLI ou registrar os detalhes no issue tracker público do GitHub.",
    directBody3:
      "Para ajuda de instalação, comece pelo guia de instalação. Para contexto de produto e plano, revise a página de preços.",
    contactPageJsonLd: {
      "@context": "https://schema.org",
      "@type": "ContactPage",
      name: "Contate o AnyCap",
      description:
        "Contato do AnyCap para suporte, preço, dúvidas de produto, reporte de segurança e pedidos de privacidade.",
      url: "https://anycap.ai/contact",
      mainEntity: {
        "@type": "Organization",
        name: siteConfig.siteName,
        url: siteConfig.url,
        contactPoint: [
          {
            "@type": "ContactPoint",
            contactType: "customer support",
            url: "https://anycap.ai/contact",
          },
        ],
      },
    },
  },
  id: {} as ContactPageData,
};

contentByLocale.id = contentByLocale.en;

export function getContactMetadata(locale: SiteLocale): Metadata {
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

export function getContactPageData(locale: SiteLocale) {
  return contentByLocale[locale] ?? contentByLocale.en;
}
