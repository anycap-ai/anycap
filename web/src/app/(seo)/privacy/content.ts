import type { Metadata } from "next";
import { getLocaleConfig, siteConfig, type SiteLocale } from "@/lib/site";

export const PRIVACY_PATH = "/privacy";

type PrivacyPageData = {
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
  sections: {
    infoTitle: string;
    infoIntro: string;
    infoCategories: readonly string[];
    useTitle: string;
    useCases: readonly string[];
    sharingTitle: string;
    sharingCategories: readonly string[];
    retentionText: string;
    securityText: string;
    requestTitle: string;
    requestText1: string;
    requestText2: string;
  };
  privacyPageJsonLd: Record<string, unknown>;
};

const contentByLocale: Record<SiteLocale, PrivacyPageData> = {
  en: {
    metadata: {
      title: "Privacy Policy | AnyCap",
      description:
        "Read how AnyCap handles account data, usage logs, submitted content, analytics, third-party providers, and privacy requests.",
      openGraphTitle: "Privacy Policy | AnyCap",
      openGraphDescription:
        "Read how AnyCap handles account data, billing and usage records, submitted content, analytics, and privacy requests.",
    },
    breadcrumbItems: [
      { name: "Home", href: "/" },
      { name: "Privacy", href: "/privacy" },
    ],
    eyebrow: "Privacy",
    heroTitle: "Privacy policy for AnyCap",
    heroIntro:
      "This policy explains what data AnyCap handles, why it is used, when it may be shared with service providers, and how to reach the team about privacy questions.",
    lastUpdatedLabel: "April 9, 2026",
    sections: {
      infoTitle: "Information AnyCap may collect",
      infoIntro:
        "Depending on the workflow and product surface you use, AnyCap may handle the following categories of information:",
      infoCategories: [
        "Account and authentication details, such as identifiers needed to sign in and manage access.",
        "Billing, credit, and usage records needed to operate pay-as-you-go workflows and transaction history.",
        "Prompts, files, URLs, outputs, and workflow data you submit when you use generation, retrieval, storage, or publishing features.",
        "Device, browser, and request metadata used for security, abuse prevention, reliability, and troubleshooting.",
        "Communications you send to AnyCap, including support requests, issue reports, and feedback.",
      ],
      useTitle: "How the information is used",
      useCases: [
        "Authenticate users and operate the product surfaces you ask us to run.",
        "Route requests to AnyCap systems and relevant third-party model or infrastructure providers.",
        "Measure usage, credits, billing events, and operational health.",
        "Investigate outages, abuse, fraud, bugs, and security incidents.",
        "Improve product quality, support, and documentation.",
        "Meet legal obligations and enforce platform rules.",
      ],
      sharingTitle: "Sharing, retention, and security",
      sharingCategories: [
        "Infrastructure, authentication, hosting, analytics, and payment providers that help run the service.",
        "Model or capability providers when a workflow requires AnyCap to send prompts, files, or related request data upstream to fulfill your request.",
        "Advisers, affiliates, or authorities when required for compliance, legal process, or security response.",
      ],
      retentionText:
        "AnyCap keeps data only as long as reasonably necessary for product operation, security, support, billing, compliance, and legitimate business record-keeping. Retention can vary by data type, environment, and legal obligation.",
      securityText:
        "We use administrative, technical, and organizational measures intended to reduce unauthorized access, misuse, or disclosure. No system can guarantee perfect security, so avoid submitting information that you would not want processed by the requested workflow.",
      requestTitle: "Privacy questions and requests",
      requestText1:
        "If you need to ask about account data, submitted content, deletion requests, or another privacy matter, email the AnyCap team or use the contact page.",
      requestText2:
        "This policy should be read together with the Terms of Service, the pricing page, and the about page.",
    },
    privacyPageJsonLd: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "AnyCap Privacy Policy",
      description:
        "Privacy policy for AnyCap, including account data, submitted content, analytics, third-party providers, and contact details.",
      url: "https://anycap.ai/privacy",
      dateModified: "2026-04-09",
    },
  },
  "pt-br": {
    metadata: {
      title: "Política de Privacidade | AnyCap",
      description:
        "Veja como o AnyCap trata dados de conta, logs de uso, conteúdo enviado, analytics, provedores terceiros e pedidos de privacidade.",
      openGraphTitle: "Política de Privacidade | AnyCap",
      openGraphDescription:
        "Veja como o AnyCap trata dados de conta, registros de faturamento e uso, conteúdo enviado, analytics e pedidos de privacidade.",
    },
    breadcrumbItems: [
      { name: "Início", href: "/" },
      { name: "Privacidade", href: "/privacy" },
    ],
    eyebrow: "Privacidade",
    heroTitle: "Política de privacidade do AnyCap",
    heroIntro:
      "Esta política explica quais dados o AnyCap trata, por que eles são usados, quando podem ser compartilhados com provedores de serviço e como falar com o time sobre dúvidas de privacidade.",
    lastUpdatedLabel: "9 de abril de 2026",
    sections: {
      infoTitle: "Informações que o AnyCap pode coletar",
      infoIntro:
        "Dependendo do fluxo e da superfície do produto que você usa, o AnyCap pode tratar as seguintes categorias de informação:",
      infoCategories: [
        "Detalhes de conta e autenticação, como identificadores necessários para entrar e gerenciar acesso.",
        "Registros de faturamento, créditos e uso necessários para operar fluxos pay-as-you-go e histórico de transações.",
        "Prompts, arquivos, URLs, outputs e dados de fluxo que você envia quando usa recursos de geração, recuperação, armazenamento ou publicação.",
        "Metadados de dispositivo, navegador e requisição usados para segurança, prevenção de abuso, confiabilidade e troubleshooting.",
        "Comunicações que você envia ao AnyCap, incluindo pedidos de suporte, reports de issue e feedback.",
      ],
      useTitle: "Como a informação é usada",
      useCases: [
        "Autenticar usuários e operar as superfícies do produto que você pede para rodar.",
        "Encaminhar requisições para sistemas do AnyCap e provedores terceiros de modelos ou infraestrutura.",
        "Medir uso, créditos, eventos de faturamento e saúde operacional.",
        "Investigar quedas, abuso, fraude, bugs e incidentes de segurança.",
        "Melhorar qualidade do produto, suporte e documentação.",
        "Cumprir obrigações legais e aplicar regras da plataforma.",
      ],
      sharingTitle: "Compartilhamento, retenção e segurança",
      sharingCategories: [
        "Provedores de infraestrutura, autenticação, hosting, analytics e pagamento que ajudam a operar o serviço.",
        "Provedores de modelos ou capacidades quando um fluxo exige que o AnyCap envie prompts, arquivos ou dados relacionados upstream para cumprir sua solicitação.",
        "Assessores, afiliadas ou autoridades quando necessário para compliance, processo legal ou resposta de segurança.",
      ],
      retentionText:
        "O AnyCap mantém dados apenas pelo tempo razoavelmente necessário para operação do produto, segurança, suporte, faturamento, compliance e registro legítimo de negócios. A retenção pode variar por tipo de dado, ambiente e obrigação legal.",
      securityText:
        "Usamos medidas administrativas, técnicas e organizacionais para reduzir acesso não autorizado, uso indevido ou divulgação. Nenhum sistema garante segurança perfeita, então evite enviar informações que você não gostaria que fossem processadas pelo fluxo solicitado.",
      requestTitle: "Dúvidas e pedidos de privacidade",
      requestText1:
        "Se você precisar perguntar sobre dados de conta, conteúdo enviado, pedidos de exclusão ou outro assunto de privacidade, envie email ao time do AnyCap ou use a página de contato.",
      requestText2:
        "Esta política deve ser lida junto com os Termos de Serviço, a página de preços e a página sobre.",
    },
    privacyPageJsonLd: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Política de Privacidade do AnyCap",
      description:
        "Política de privacidade do AnyCap, incluindo dados de conta, conteúdo enviado, analytics, provedores terceiros e contato.",
      url: "https://anycap.ai/privacy",
      dateModified: "2026-04-09",
    },
  },
  id: {} as PrivacyPageData,
};

contentByLocale.id = contentByLocale.en;

export function getPrivacyMetadata(locale: SiteLocale): Metadata {
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

export function getPrivacyPageData(locale: SiteLocale) {
  return contentByLocale[locale] ?? contentByLocale.en;
}
