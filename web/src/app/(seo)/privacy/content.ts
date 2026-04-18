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
  id: {
      metadata: {
        title: "Kebijakan Privasi | AnyCap",
        description:
          "Pelajari bagaimana AnyCap menangani data akun, log penggunaan, konten yang dikirim, analytics, penyedia pihak ketiga, dan permintaan privasi.",
        openGraphTitle: "Kebijakan Privasi | AnyCap",
        openGraphDescription:
          "Pelajari bagaimana AnyCap menangani data akun, catatan penggunaan dan penagihan, konten yang dikirim, analytics, dan permintaan privasi.",
      },
      breadcrumbItems: [
        { name: "Home", href: "/" },
        { name: "Privasi", href: "/privacy" },
      ],
      eyebrow: "Privasi",
      heroTitle: "Kebijakan privasi untuk AnyCap",
      heroIntro:
        "Kebijakan ini menjelaskan data apa yang ditangani AnyCap, mengapa data tersebut digunakan, kapan data dapat dibagikan ke penyedia layanan, dan bagaimana menghubungi tim untuk pertanyaan privasi.",
      lastUpdatedLabel: "9 April 2026",
      sections: {
        infoTitle: "Informasi yang mungkin dikumpulkan AnyCap",
        infoIntro:
          "Tergantung pada alur kerja dan surface produk yang Anda gunakan, AnyCap dapat menangani kategori informasi berikut:",
        infoCategories: [
          "Detail akun dan autentikasi, seperti identitas yang diperlukan untuk masuk dan mengelola akses.",
          "Catatan penagihan, kredit, dan penggunaan yang dibutuhkan untuk menjalankan alur pay-as-you-go dan riwayat transaksi.",
          "Prompt, file, URL, output, dan data workflow yang Anda kirim saat menggunakan fitur generasi, pengambilan data, penyimpanan, atau publikasi.",
          "Metadata perangkat, browser, dan permintaan yang dipakai untuk keamanan, pencegahan penyalahgunaan, keandalan, dan troubleshooting.",
          "Komunikasi yang Anda kirim ke AnyCap, termasuk permintaan dukungan, laporan issue, dan feedback.",
        ],
        useTitle: "Bagaimana informasi digunakan",
        useCases: [
          "Mengautentikasi pengguna dan menjalankan surface produk yang Anda minta untuk dipakai.",
          "Meneruskan permintaan ke sistem AnyCap dan penyedia model atau infrastruktur pihak ketiga yang relevan.",
          "Mengukur penggunaan, kredit, peristiwa penagihan, dan kesehatan operasional.",
          "Menyelidiki gangguan, penyalahgunaan, penipuan, bug, dan insiden keamanan.",
          "Meningkatkan kualitas produk, dukungan, dan dokumentasi.",
          "Memenuhi kewajiban hukum dan menegakkan aturan platform.",
        ],
        sharingTitle: "Berbagi, retensi, dan keamanan",
        sharingCategories: [
          "Penyedia infrastruktur, autentikasi, hosting, analytics, dan pembayaran yang membantu menjalankan layanan.",
          "Penyedia model atau kapabilitas ketika suatu workflow mengharuskan AnyCap mengirim prompt, file, atau data permintaan terkait ke upstream untuk memenuhi permintaan Anda.",
          "Penasihat, afiliasi, atau otoritas ketika diperlukan untuk kepatuhan, proses hukum, atau respons keamanan.",
        ],
        retentionText:
          "AnyCap menyimpan data hanya selama yang secara wajar diperlukan untuk operasi produk, keamanan, dukungan, penagihan, kepatuhan, dan pencatatan bisnis yang sah. Retensi dapat bervariasi menurut jenis data, lingkungan, dan kewajiban hukum.",
        securityText:
          "Kami menggunakan langkah administratif, teknis, dan organisasional untuk mengurangi akses tidak sah, penyalahgunaan, atau pengungkapan. Tidak ada sistem yang bisa menjamin keamanan sempurna, jadi hindari mengirim informasi yang tidak ingin Anda proses melalui workflow yang diminta.",
        requestTitle: "Pertanyaan dan permintaan privasi",
        requestText1:
          "Jika Anda perlu bertanya tentang data akun, konten yang dikirim, permintaan penghapusan, atau hal privasi lain, email tim AnyCap atau gunakan halaman kontak.",
        requestText2:
          "Kebijakan ini sebaiknya dibaca bersama dengan Terms of Service, halaman harga, dan halaman about.",
      },
      privacyPageJsonLd: {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "Kebijakan Privasi AnyCap",
        description:
          "Kebijakan privasi untuk AnyCap, termasuk data akun, konten yang dikirim, analytics, penyedia pihak ketiga, dan kontak.",
        url: "https://anycap.ai/privacy",
        dateModified: "2026-04-09",
      },
  },
  de: {
    metadata: {
      title: "Datenschutzerklärung | AnyCap",
      description:
        "Lesen Sie, wie AnyCap mit Account-Daten, Nutzungs-Logs, eingereichten Inhalten, Analytics, Drittanbietern und Datenschutz-Anfragen umgeht.",
      openGraphTitle: "Datenschutzerklärung | AnyCap",
      openGraphDescription:
        "Lesen Sie, wie AnyCap mit Account-Daten, Abrechnungs- und Nutzungsdaten, eingereichten Inhalten, Analytics und Datenschutz-Anfragen umgeht.",
    },
    breadcrumbItems: [
      { name: "Startseite", href: "/" },
      { name: "Datenschutz", href: "/privacy" },
    ],
    eyebrow: "Datenschutz",
    heroTitle: "Datenschutzerklärung für AnyCap",
    heroIntro:
      "Diese Erklärung beschreibt, welche Daten AnyCap verarbeitet, warum sie genutzt werden, wann sie an Dienstleister weitergegeben werden können und wie Sie das Team bei Datenschutz-Fragen erreichen.",
    lastUpdatedLabel: "9. April 2026",
    sections: {
      infoTitle: "Informationen, die AnyCap erfassen kann",
      infoIntro:
        "Abhängig vom Workflow und der Produkt-Surface, die Sie nutzen, kann AnyCap die folgenden Informations-Kategorien verarbeiten:",
      infoCategories: [
        "Account- und Authentifizierungsdetails, etwa Identifier, die zur Anmeldung und zur Verwaltung des Zugriffs nötig sind.",
        "Abrechnungs-, Credit- und Nutzungsdaten, die für den Betrieb von Pay-as-you-go-Workflows und die Transaktionshistorie erforderlich sind.",
        "Prompts, Dateien, URLs, Outputs und Workflow-Daten, die Sie übermitteln, wenn Sie Generierungs-, Retrieval-, Speicher- oder Veröffentlichungs-Funktionen nutzen.",
        "Geräte-, Browser- und Request-Metadaten, die für Sicherheit, Missbrauchsprävention, Zuverlässigkeit und Troubleshooting verwendet werden.",
        "Kommunikation, die Sie an AnyCap senden, einschließlich Support-Anfragen, Issue-Reports und Feedback.",
      ],
      useTitle: "Wie die Informationen genutzt werden",
      useCases: [
        "Nutzer authentifizieren und die Produkt-Surfaces betreiben, deren Ausführung Sie anfragen.",
        "Requests an AnyCap-Systeme und relevante Drittanbieter für Modelle oder Infrastruktur weiterleiten.",
        "Nutzung, Credits, Abrechnungsereignisse und betriebliche Stabilität messen.",
        "Ausfälle, Missbrauch, Betrug, Bugs und Sicherheitsvorfälle untersuchen.",
        "Produktqualität, Support und Dokumentation verbessern.",
        "Gesetzliche Pflichten erfüllen und Plattform-Regeln durchsetzen.",
      ],
      sharingTitle: "Weitergabe, Aufbewahrung und Sicherheit",
      sharingCategories: [
        "Anbieter für Infrastruktur, Authentifizierung, Hosting, Analytics und Zahlung, die den Service betreiben helfen.",
        "Anbieter von Modellen oder Capabilities, wenn ein Workflow erfordert, dass AnyCap Prompts, Dateien oder zugehörige Request-Daten upstream sendet, um Ihre Anfrage zu erfüllen.",
        "Berater, verbundene Unternehmen oder Behörden, sofern dies für Compliance, rechtliche Verfahren oder Sicherheitsreaktionen erforderlich ist.",
      ],
      retentionText:
        "AnyCap speichert Daten nur so lange, wie es für Produktbetrieb, Sicherheit, Support, Abrechnung, Compliance und ordnungsgemäße Geschäftsdokumentation vernünftig nötig ist. Die Aufbewahrungsdauer kann je nach Datentyp, Umgebung und gesetzlicher Pflicht variieren.",
      securityText:
        "Wir setzen administrative, technische und organisatorische Maßnahmen ein, um unbefugten Zugriff, Missbrauch oder Offenlegung zu reduzieren. Kein System kann perfekte Sicherheit garantieren, daher übermitteln Sie keine Informationen, die der angeforderte Workflow nicht verarbeiten soll.",
      requestTitle: "Datenschutz-Fragen und Anfragen",
      requestText1:
        "Wenn Sie zu Account-Daten, eingereichten Inhalten, Löschanfragen oder einem anderen Datenschutz-Thema Fragen haben, schreiben Sie dem AnyCap-Team eine E-Mail oder nutzen Sie die Kontaktseite.",
      requestText2:
        "Diese Erklärung sollte zusammen mit den Nutzungsbedingungen, der Preisseite und der Über-Seite gelesen werden.",
    },
    privacyPageJsonLd: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "AnyCap Datenschutzerklärung",
      description:
        "Datenschutzerklärung für AnyCap, einschließlich Account-Daten, eingereichten Inhalten, Analytics, Drittanbietern und Kontaktdetails.",
      url: "https://anycap.ai/privacy",
      dateModified: "2026-04-09",
    },
  },
};

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
