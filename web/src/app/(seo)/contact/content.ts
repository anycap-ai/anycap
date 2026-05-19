import type { Metadata } from "next";
import { organizationId, organizationSameAs } from "@/lib/organization";
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
    ctaHref: "/start",
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
        "@id": organizationId,
        name: siteConfig.siteName,
        url: siteConfig.url,
        sameAs: organizationSameAs,
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
        ctaHref: "/start",
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
      url: "https://anycap.ai/pt-br/contact",
      mainEntity: {
        "@type": "Organization",
        "@id": organizationId,
        name: siteConfig.siteName,
        url: siteConfig.url,
        sameAs: organizationSameAs,
        contactPoint: [
          {
            "@type": "ContactPoint",
            contactType: "customer support",
            url: "https://anycap.ai/pt-br/contact",
          },
        ],
      },
    },
  },
  id: {} as ContactPageData,
  de: {} as ContactPageData,
};

const contactRoutesId: readonly ContactRoute[] = [
  {
    title: "Dukungan produk dan bantuan instalasi",
    detail:
      "Kalau Anda sedang mencoba menjalankan workflow pertama, mulai dari panduan instalasi dan sertakan agen, capability, serta langkah persis yang gagal.",
    ctaLabel: "Buka panduan instalasi",
    ctaKind: "link",
    ctaHref: "/start",
  },
  {
    title: "Laporan bug dan regresi",
    detail:
      "Untuk bug yang bisa direproduksi, issue GitHub adalah jalur terbaik karena stack trace, detail lingkungan, dan screenshot tetap berada di satu thread publik.",
    ctaLabel: "Buka issue GitHub",
    ctaKind: "link",
    ctaHref: "https://github.com/anycap-ai/anycap/issues",
  },
  {
    title: "Pertanyaan harga dan enterprise",
    detail:
      "Kalau Anda membutuhkan volume kredit yang lebih besar, penagihan invois, atau klarifikasi kecocokan produk, hubungi tim secara langsung lewat email.",
    ctaLabel: "Kirim email ke tim",
    ctaKind: "email",
    ctaSubject: "AnyCap Enterprise pricing",
  },
];

const checklistId = [
  "Agen yang Anda gunakan, misalnya Claude Code, Cursor, Codex, atau Manus",
  "Capability atau halaman yang sedang Anda coba gunakan",
  "Hasil yang diharapkan dan hasil yang benar-benar terjadi",
  "Pesan error, request ID, atau screenshot yang relevan",
  "Apakah masalahnya menghambat produksi, evaluasi, atau uji coba sekali pakai",
] as const;

contentByLocale.id = {
  metadata: {
    title: "Hubungi AnyCap - Dukungan, harga, dan pelaporan masalah",
    description:
      "Hubungi AnyCap untuk bantuan instalasi, pertanyaan harga, laporan bug, pertanyaan keamanan atau privasi, dan masukan produk.",
    openGraphTitle: "Hubungi AnyCap - Dukungan, harga, dan pelaporan masalah",
    openGraphDescription:
      "Temukan jalur terbaik untuk dukungan AnyCap, pertanyaan harga, laporan bug, serta permintaan keamanan atau privasi.",
  },
  breadcrumbItems: [
    { name: "Beranda", href: "/" },
    { name: "Kontak", href: "/contact" },
  ],
  eyebrow: "Kontak",
  heroTitle: "Hubungi tim AnyCap.",
  heroIntro:
    "Gunakan halaman ini ketika Anda membutuhkan bantuan instalasi, penjelasan harga, pertanyaan kecocokan produk, jalur pelaporan bug, atau rute yang jelas untuk permintaan keamanan dan privasi.",
  lastUpdatedLabel: "9 April 2026",
  routesTitle: "Jalur terbaik berdasarkan pertanyaan",
  contactRoutes: contactRoutesId,
  checklistTitle: "Sertakan ini saat menghubungi kami",
  supportChecklist: checklistId,
  directTitle: "Kontak langsung",
  directBody1:
    "Kirim email ke tim AnyCap untuk percakapan harga, permintaan privasi, atau masalah apa pun yang sebaiknya tidak dibahas di thread GitHub publik.",
  directBody2:
    "Kalau masalahnya berasal dari workflow yang sedang berjalan, Anda juga bisa memakai surface CLI atau mencatat detailnya di issue tracker GitHub publik.",
  directBody3:
    "Untuk bantuan instalasi, mulai dari panduan instalasi. Untuk konteks produk dan paket, tinjau halaman harga.",
  contactPageJsonLd: {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Hubungi AnyCap",
    description:
      "Hubungi AnyCap untuk dukungan, harga, pertanyaan produk, laporan keamanan, dan permintaan privasi.",
    url: "https://anycap.ai/id/contact",
    mainEntity: {
      "@type": "Organization",
      "@id": organizationId,
      name: siteConfig.siteName,
      url: siteConfig.url,
      sameAs: organizationSameAs,
      contactPoint: [
        {
          "@type": "ContactPoint",
          contactType: "customer support",
          url: "https://anycap.ai/id/contact",
        },
      ],
    },
  },
};

const contactRoutesDe: readonly ContactRoute[] = [
  {
    title: "Produkt-Support und Installations-Hilfe",
    detail:
      "Wenn Sie Ihren ersten Workflow zum Laufen bringen wollen, beginnen Sie mit dem Installations-Guide und nennen Sie Agent, Capability sowie den genauen Schritt, der fehlgeschlagen ist.",
    ctaLabel: "Installations-Guide öffnen",
    ctaKind: "link",
    ctaHref: "/start",
  },
  {
    title: "Bug-Reports und Regressionen",
    detail:
      "Für reproduzierbare Bugs sind GitHub-Issues der beste Weg, weil Stack-Traces, Umgebungsdetails und Screenshots in einem öffentlichen Thread bleiben.",
    ctaLabel: "GitHub-Issues öffnen",
    ctaKind: "link",
    ctaHref: "https://github.com/anycap-ai/anycap/issues",
  },
  {
    title: "Preis- und Enterprise-Fragen",
    detail:
      "Wenn Sie größere Credit-Volumen, Rechnungsstellung oder Klärung zur Produktpassung brauchen, kontaktieren Sie das Team direkt per E-Mail.",
    ctaLabel: "Team per E-Mail kontaktieren",
    ctaKind: "email",
    ctaSubject: "AnyCap Enterprise pricing",
  },
];

const checklistDe = [
  "Welchen Agent Sie nutzen, etwa Claude Code, Cursor, Codex oder Manus",
  "Welche Capability oder Seite Sie verwenden wollten",
  "Den erwarteten Output und das tatsächliche Ergebnis",
  "Relevante Fehlermeldung, Request-ID oder Screenshot",
  "Ob das Problem Produktion, Evaluierung oder einen Einmal-Test blockiert",
] as const;

contentByLocale.de = {
  metadata: {
    title: "AnyCap kontaktieren - Support, Preise und Issue-Reporting",
    description:
      "Kontaktieren Sie AnyCap für Installations-Hilfe, Preisanfragen, Bug-Reports, Sicherheits- oder Datenschutz-Fragen und Produkt-Feedback.",
    openGraphTitle: "AnyCap kontaktieren - Support, Preise und Issue-Reporting",
    openGraphDescription:
      "Finden Sie den besten Weg für AnyCap-Support, Preisanfragen, Bug-Reports und Sicherheits- oder Datenschutz-Anfragen.",
  },
  breadcrumbItems: [
    { name: "Startseite", href: "/" },
    { name: "Kontakt", href: "/contact" },
  ],
  eyebrow: "Kontakt",
  heroTitle: "Kontaktieren Sie das AnyCap-Team.",
  heroIntro:
    "Nutzen Sie diese Seite, wenn Sie Installations-Hilfe, Preisklärung, Fragen zur Produktpassung, Bug-Reporting-Pfade oder einen klaren Weg für Sicherheits- und Datenschutz-Anfragen benötigen.",
  lastUpdatedLabel: "9. April 2026",
  routesTitle: "Bester Weg pro Frage",
  contactRoutes: contactRoutesDe,
  checklistTitle: "Bitte fügen Sie das hinzu, wenn Sie uns kontaktieren",
  supportChecklist: checklistDe,
  directTitle: "Direktkontakt",
  directBody1:
    "Schreiben Sie dem AnyCap-Team eine E-Mail für Preisgespräche, Datenschutz-Anfragen oder jedes Anliegen, das nicht in einem öffentlichen GitHub-Thread stehen sollte.",
  directBody2:
    "Wenn das Problem aus einem Live-Workflow stammt, können Sie auch die CLI-Surface nutzen oder Details über den öffentlichen GitHub-Issue-Tracker einreichen.",
  directBody3:
    "Für Installations-Hilfe starten Sie mit dem Installations-Guide. Für Produkt- und Plan-Kontext prüfen Sie die Preisseite.",
  contactPageJsonLd: {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "AnyCap kontaktieren",
    description:
      "Kontaktieren Sie AnyCap für Support, Preise, Produktfragen, Sicherheits-Reports und Datenschutz-Anfragen.",
    url: "https://anycap.ai/de/contact",
    mainEntity: {
      "@type": "Organization",
      "@id": organizationId,
      name: siteConfig.siteName,
      url: siteConfig.url,
      sameAs: organizationSameAs,
      contactPoint: [
        {
          "@type": "ContactPoint",
          contactType: "customer support",
          url: "https://anycap.ai/de/contact",
        },
      ],
    },
  },
};

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
