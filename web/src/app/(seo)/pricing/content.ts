import type { Metadata } from "next";
import { createFaqPageJsonLd } from "@/lib/schema";
import { getLocaleConfig, getLocalizedRouteUrl, siteConfig, type SiteLocale } from "@/lib/site";

export const PRICING_PATH = "/pricing";

type PricingCreditPackage = {
  name: string;
  packQuery: string;
  price: number;
  credits: number;
  bonus: number | null;
  bonusLabel: string | null;
  highlight: boolean;
  bestFor: string;
  description: string;
};

type PricingPrinciple = {
  title: string;
  description: string;
};

type PricingChecklistItem = {
  title: string;
  description: string;
};

type PricingFaqItem = {
  question: string;
  answer: string;
};

const pricingCapabilitySummaryTextEn =
  "Image generation, Video generation, Music generation, Image understanding, Video analysis, Audio understanding, Web search, Grounded web search, Web crawl";

const pricingCapabilitySummaryTextPtBr =
  "Geração de imagens, Geração de vídeo, Geração de música, Entendimento de imagens, Análise de vídeo, Entendimento de áudio, Busca na web, Busca na web fundamentada, Crawl de web";

const pricingCapabilitySummaryTextId =
  "Generasi gambar, Generasi video, Generasi musik, Pemahaman gambar, Analisis video, Pemahaman audio, Pencarian web, Pencarian web ter-grounding, Crawl web";

type PricingPageContent = {
  metadata: {
    title: string;
    description: string;
    openGraphTitle: string;
    openGraphDescription: string;
    pageName: string;
    pageDescription: string;
  };
  breadcrumbItems: readonly { name: string; href: string }[];
  hero: {
    eyebrow: string;
    titleLine1: string;
    titleLine2: string;
    intro: string;
    factsLabel: string;
    factsText: string;
    lastUpdatedLabel: string;
  };
  sectionTitles: {
    pricingPrinciples: string;
    creditPackages: string;
    estimateTopUp: string;
    generationModels: string;
    actions: string;
    drivePage: string;
    faq: string;
  };
  pricingPrinciplesIntro: string;
  pricingPrinciples: readonly PricingPrinciple[];
  creditPackages: readonly PricingCreditPackage[];
  creditPackagesIntro: string;
  packageStatusLabels: {
    popular: string;
    recommendedPack: string;
    continueToCheckout: string;
  };
  enterprisePackage: {
    name: string;
    headline: string;
    description: string;
    highlights: readonly string[];
    ctaLabel: string;
    ctaSubject: string;
  };
  enterpriseFootnote: string;
  estimateTopUp: {
    intro: string;
    checklist: readonly PricingChecklistItem[];
  };
  generationModels: {
    intro: string;
    creditsNotice: string;
  };
  actions: {
    intro: string;
    includedCapabilitiesLabel: string;
    includedCapabilitiesSummary: string;
    tableHeaders: readonly [string, string, string];
  };
  drivePage: {
    intro: string;
    driveLabel: string;
    driveDescription: string;
    pageLabel: string;
    pageDescription: string;
    limitNotice: string;
    driveQuotas: readonly { label: string; value: string }[];
    pageQuotas: readonly { label: string; value: string }[];
  };
  faqItems: readonly PricingFaqItem[];
  cta: {
    buyCredits: string;
    viewCapabilities: string;
  };
  pricingPageJsonLd: {
    "@context": "https://schema.org";
    "@type": "WebPage";
    name: string;
    description: string;
    url: string;
    dateModified: string;
    mainEntity: {
      "@type": "Product";
      name: string;
      url: string;
      description: string;
      offers: Array<{
        "@type": "Offer";
        name: string;
        url: string;
        price: string;
        priceCurrency: string;
        availability: string;
        description: string;
      }>;
    };
  };
  faqJsonLd: ReturnType<typeof createFaqPageJsonLd>;
};

const creditPackages: readonly Omit<PricingCreditPackage, "bestFor" | "description" | "bonusLabel">[] = [
  { name: "Starter", packQuery: "starter", price: 10, credits: 500, bonus: null, highlight: false },
  { name: "Standard", packQuery: "standard", price: 30, credits: 1575, bonus: 75, highlight: true },
  { name: "Pro", packQuery: "pro", price: 100, credits: 5500, bonus: 500, highlight: false },
] as const;

const pricingPrinciplesEn: readonly PricingPrinciple[] = [
  {
    title: "Start free, then buy only when the workflow proves out",
    description:
      "Every new account starts with $5 free credit, so teams can test real image, video, audio, and web workflows before committing to a larger prepaid pack.",
  },
  {
    title: "Keep one balance across the workflows agents actually need",
    description:
      "The same AnyCap balance can be spent across generation, analysis, search, storage, and publishing workflows instead of splitting spend across multiple provider dashboards.",
  },
  {
    title: "Pay official provider rates through one consolidated billing flow",
    description:
      "AnyCap passes through the official model rate with no markup, then adds one purchase flow, one balance, and one transaction history for the whole runtime.",
  },
];

const checklistEn: readonly PricingChecklistItem[] = [
  {
    title: "1. Start from the workflow, not the model list",
    description:
      "Estimate the path your agent will actually run: generation, analysis, search, storage, or a mix of several steps in one job.",
  },
  {
    title: "2. Price the most expensive step first",
    description:
      "Use the tables below to estimate the generation output or action type that will consume the largest share of credits, then treat the rest as margin.",
  },
  {
    title: "3. Leave room for retries and iteration",
    description:
      "If the workflow will need prompt tuning, QA passes, or teammate handoffs, choose the pack that gives enough headroom to keep moving without topping up every day.",
  },
];

const pricingPrinciplesId: readonly PricingPrinciple[] = [
  {
    title: "Mulai gratis, lalu beli hanya ketika alur kerja sudah terbukti",
    description:
      "Setiap akun baru dimulai dengan kredit gratis $5, sehingga tim dapat menguji alur gambar, video, audio, dan web nyata sebelum berkomitmen pada paket prabayar yang lebih besar.",
  },
  {
    title: "Pertahankan satu saldo untuk semua alur kerja yang benar-benar dibutuhkan agen",
    description:
      "Saldo AnyCap yang sama dapat dipakai untuk generasi, analisis, pencarian, penyimpanan, dan alur publikasi, tanpa harus membagi pengeluaran di banyak dasbor penyedia.",
  },
  {
    title: "Bayar tarif resmi penyedia melalui satu alur penagihan terpusat",
    description:
      "AnyCap meneruskan tarif model resmi tanpa markup, lalu menambahkan satu alur pembelian, satu saldo, dan satu riwayat transaksi untuk seluruh runtime.",
  },
];

const checklistId: readonly PricingChecklistItem[] = [
  {
    title: "1. Mulai dari alur kerja, bukan daftar model",
    description:
      "Perkirakan jalur yang benar-benar akan dijalankan agen Anda: generasi, analisis, pencarian, penyimpanan, atau gabungan beberapa langkah dalam satu pekerjaan.",
  },
  {
    title: "2. Hargai langkah termahal lebih dulu",
    description:
      "Gunakan tabel di bawah untuk memperkirakan keluaran generasi atau jenis aksi yang akan memakan porsi kredit terbesar, lalu anggap sisanya sebagai cadangan.",
  },
  {
    title: "3. Sisakan ruang untuk percobaan ulang dan iterasi",
    description:
      "Jika alur kerja membutuhkan penyesuaian prompt, QA, atau serah terima antar rekan, pilih paket yang memberi cukup ruang agar tetap jalan tanpa isi ulang setiap hari.",
  },
];

const faqItemsEn: readonly PricingFaqItem[] = [
  {
    question: "Is there a free tier?",
    answer:
      "Every account starts with $5 free credit, which is 250 credits at the current base conversion, and no payment information is required to begin testing workflows.",
  },
  {
    question: "Do credits expire?",
    answer: "No. Purchased credits do not expire.",
  },
  {
    question: "Is there a markup on model pricing?",
    answer:
      "No. AnyCap passes through the official provider rate for every model and capability, then consolidates usage into one balance and one billing flow.",
  },
  {
    question: "Can I use the same balance across generation and actions?",
    answer:
      "Yes. The same AnyCap balance can be used across generation models, analysis tools, web actions, Drive storage, and Page publishing workflows.",
  },
  {
    question: "How should I choose my first credit pack?",
    answer:
      "Starter is a good fit for first live tests, Standard is the default for recurring weekly usage, and Pro is the better fit when a team expects heavier or more continuous production workloads.",
  },
  {
    question: "What capabilities are included?",
    answer: `${pricingCapabilitySummaryTextEn}. Drive storage and Page hosting are included at no additional credit cost.`,
  },
];

const faqItemsId: readonly PricingFaqItem[] = [
  {
    question: "Apakah ada tingkat gratis?",
    answer:
      "Setiap akun dimulai dengan kredit gratis $5, setara 250 kredit pada konversi dasar saat ini, dan tidak perlu informasi pembayaran untuk mulai menguji alur kerja.",
  },
  {
    question: "Apakah kredit kedaluwarsa?",
    answer: "Tidak. Kredit yang dibeli tidak kedaluwarsa.",
  },
  {
    question: "Apakah ada markup pada harga model?",
    answer:
      "Tidak. AnyCap meneruskan tarif resmi penyedia untuk setiap model dan kapabilitas, lalu menggabungkan pemakaian ke dalam satu saldo dan satu alur penagihan.",
  },
  {
    question: "Bisakah saya memakai saldo yang sama untuk generasi dan aksi?",
    answer:
      "Ya. Saldo AnyCap yang sama dapat dipakai untuk model generasi, alat analisis, aksi web, penyimpanan Drive, dan alur publikasi Page.",
  },
  {
    question: "Bagaimana memilih paket kredit pertama?",
    answer:
      "Starter cocok untuk uji langsung pertama, Standard menjadi pilihan default untuk pemakaian mingguan berulang, dan Pro lebih pas bila tim mengharapkan beban produksi yang lebih berat atau lebih berkelanjutan.",
  },
  {
    question: "Kapabilitas apa saja yang termasuk?",
    answer: `${pricingCapabilitySummaryTextId}. Penyimpanan Drive dan hosting Page disertakan tanpa biaya kredit tambahan.`,
  },
];

const pricingPackagesByLocale: Record<SiteLocale, readonly PricingCreditPackage[]> = {
  en: creditPackages.map((pkg) => ({
    ...pkg,
    bonusLabel: pkg.bonus ? `+${pkg.bonus / 10}% bonus` : null,
    bestFor:
      pkg.name === "Starter"
        ? "Best for first live workflow tests"
        : pkg.name === "Standard"
          ? "Best for recurring weekly usage"
          : "Best for heavier team or production workloads",
    description:
      pkg.name === "Starter"
        ? "A low-risk starting point for solo builders validating prompts, tool calls, and a first production-near agent path."
        : pkg.name === "Standard"
          ? "A balanced default when you expect repeated image, video, audio, or web runs and want fewer top-ups while iterating."
          : "More headroom for shared agent sessions, larger media batches, and longer-running workflows where throughput matters.",
  })),
  "pt-br": creditPackages.map((pkg) => ({
    ...pkg,
    bonusLabel: pkg.bonus ? `+${pkg.bonus / 10}% de bônus` : null,
    bestFor:
      pkg.name === "Starter"
        ? "Ideal para os primeiros testes de fluxo de trabalho"
        : pkg.name === "Standard"
          ? "Ideal para uso semanal recorrente"
          : "Ideal para cargas de trabalho mais pesadas de equipe ou produção",
    description:
      pkg.name === "Starter"
        ? "Um ponto de partida de baixo risco para builders solo validarem prompts, chamadas de ferramenta e um primeiro caminho de agente próximo da produção."
        : pkg.name === "Standard"
          ? "Uma opção equilibrada quando você espera execuções recorrentes de imagem, vídeo, áudio ou web e quer menos recargas enquanto itera."
          : "Mais folga para sessões de agente compartilhadas, lotes maiores de mídia e fluxos de trabalho mais longos em que throughput importa.",
  })),
  id: creditPackages.map((pkg) => ({
    ...pkg,
    bonusLabel: pkg.bonus ? `+${pkg.bonus / 10}% kredit bonus` : null,
    bestFor:
      pkg.name === "Starter"
        ? "Cocok untuk uji alur kerja langsung pertama"
        : pkg.name === "Standard"
          ? "Cocok untuk pemakaian mingguan berulang"
          : "Cocok untuk beban kerja tim atau produksi yang lebih berat",
    description:
      pkg.name === "Starter"
        ? "Titik awal berisiko rendah bagi pengembang solo untuk memvalidasi prompt, panggilan alat, dan jalur agen pertama yang mendekati produksi."
        : pkg.name === "Standard"
          ? "Pilihan seimbang saat Anda mengharapkan banyak eksekusi gambar, video, audio, atau web berulang dan ingin lebih jarang isi ulang saat beriterasi."
          : "Lebih banyak ruang untuk sesi agen bersama, batch media lebih besar, dan alur kerja berjalan lebih lama di mana throughput penting.",
  })),
};

const contentByLocale: Record<SiteLocale, PricingPageContent> = {
  en: {
    metadata: {
      title: "AnyCap Pricing — Pay-as-you-go, No Markup, $5 Free Credit",
      description:
        "Get $5 free credit, then pay as you go with no subscription and no markup. Use one balance across image, video, audio, web, storage, and publishing workflows in AnyCap.",
      openGraphTitle: "AnyCap Pricing — Pay-as-you-go, No Markup, $5 Free Credit",
      openGraphDescription:
        "One balance across image, video, audio, web, storage, and publishing workflows. $5 free credit, pay as you go, no subscription.",
      pageName: "AnyCap Pricing",
      pageDescription:
        "AnyCap pricing page. Pay-as-you-go credits across image, video, audio, web, storage, and publishing workflows.",
    },
    breadcrumbItems: [
      { name: "Home", href: "/" },
      { name: "Pricing", href: "/pricing" },
    ],
    hero: {
      eyebrow: "Pricing",
      titleLine1: "Simple, transparent",
      titleLine2: "pricing.",
      intro:
        "Start with the AI agent capabilities coding agents miss most often. AnyCap gives you one prepaid balance for those workflows, then lets that same balance extend across the broader runtime as your stack grows. No markup over official rates. No subscription. Every new account starts with $5 free credit.",
      factsLabel: "Pricing facts",
      factsText:
        "AnyCap uses prepaid credits. New accounts receive $5 in free credit. After that, the public AnyCap capability inventory is billed at the same rate as the official model provider, with no subscription fee and no platform markup. The same balance can also be used across image, video, audio, web, storage, and publishing workflows. Credit packages are one-time purchases, and larger packages include bonus credits.",
      lastUpdatedLabel: "Last updated April 8, 2026",
    },
    sectionTitles: {
      pricingPrinciples: "How AnyCap pricing works",
      creditPackages: "Credit packages",
      estimateTopUp: "How to estimate your first top-up",
      generationModels: "Generation models",
      actions: "Actions",
      drivePage: "Drive & Page",
      faq: "Common questions",
    },
    pricingPrinciplesIntro:
      "The pricing model is intentionally simple: start free, buy one-time credit packs when you need more balance, and keep that same balance available across the workflows your agents already run.",
    pricingPrinciples: pricingPrinciplesEn,
    creditPackages: pricingPackagesByLocale.en,
    creditPackagesIntro:
      "Purchase credits to use across all capabilities. Larger packages include bonus credits.",
    packageStatusLabels: {
      popular: "Popular",
      recommendedPack: "Recommended pack",
      continueToCheckout: "Continue to checkout",
    },
    enterprisePackage: {
      name: "Enterprise",
      headline: "Custom volume for teams and larger workflows",
      description:
        "For teams that need larger purchases, consolidated billing, procurement support, or invoiced billing.",
      highlights: ["Custom credit volume", "Volume pricing", "Invoiced billing"],
      ctaLabel: "Contact us",
      ctaSubject: "AnyCap Enterprise pricing",
    },
    enterpriseFootnote:
      "1 credit = $0.02. All packages are one-time purchases, not subscriptions. Need a larger volume or invoiced billing? Contact us for enterprise pricing.",
    estimateTopUp: {
      intro:
        "Most teams do not need a perfect forecast before buying credits. A better approach is to map the workflow, price the expensive step, then pick the pack that leaves room for iteration.",
      checklist: checklistEn,
    },
    generationModels: {
      intro: "Credit rates for each generation model. We pass through the official provider rate with no markup.",
      creditsNotice:
        "Credits shown are approximate. Actual cost may vary based on resolution, duration, or quality settings.",
    },
    actions: {
      intro:
        "Analyze images, videos, and audio, search the web, crawl pages, and run AI-grounded web search — all at a flat per-request rate.",
      includedCapabilitiesLabel: "Included capabilities",
      includedCapabilitiesSummary: pricingCapabilitySummaryTextEn,
      tableHeaders: ["Action", "Unit", "Credits"],
    },
    drivePage: {
      intro:
        "Cloud storage and static site hosting included with every account at no additional credit cost. Storage quotas are enforced per account.",
      driveLabel: "Drive",
      driveDescription: "Cloud file storage with public URLs and sharing.",
      pageLabel: "Page",
      pageDescription: "Static site deployment and web publishing.",
      limitNotice: "Current limits reflect early-access preview defaults and may change.",
      driveQuotas: [
        { label: "Files per account", value: "5,000" },
        { label: "Max file size", value: "1 GB" },
      ],
      pageQuotas: [
        { label: "Sites per account", value: "100" },
        { label: "Versions per site", value: "500" },
      ],
    },
    faqItems: faqItemsEn,
    cta: {
      buyCredits: "Buy credits",
      viewCapabilities: "View capabilities",
    },
    pricingPageJsonLd: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "AnyCap Pricing",
      description:
        "AnyCap pricing page. Pay-as-you-go credits across image, video, audio, web, storage, and publishing workflows.",
      url: getLocalizedRouteUrl(siteConfig.defaultLocale, PRICING_PATH),
      dateModified: "2026-04-08",
      mainEntity: {
        "@type": "Product",
        name: "AnyCap Credits",
        url: getLocalizedRouteUrl(siteConfig.defaultLocale, PRICING_PATH),
        description:
          "Pay-as-you-go credits for the AI agent capabilities coding agents miss most often, with one balance across the wider AnyCap runtime.",
        offers: pricingPackagesByLocale.en.map((pkg) => ({
          "@type": "Offer",
          name: `${pkg.name} credit pack`,
          url: `${getLocalizedRouteUrl(siteConfig.defaultLocale, PRICING_PATH)}#pack-${pkg.packQuery}`,
          price: pkg.price.toFixed(2),
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          description: pkg.bonusLabel
            ? `${pkg.credits.toLocaleString()} credits (${pkg.bonusLabel})`
            : `${pkg.credits.toLocaleString()} credits`,
        })),
      },
    },
    faqJsonLd: createFaqPageJsonLd(faqItemsEn),
  },
  "pt-br": {
    metadata: {
      title: "Preços do AnyCap — Pague conforme usa, sem markup",
      description:
        "Receba US$ 5 em crédito grátis e depois pague conforme usa, sem assinatura e sem markup. Use um único saldo em fluxos de imagem, vídeo, áudio, web, armazenamento e publicação no AnyCap.",
      openGraphTitle: "Preços do AnyCap — Pague conforme usa, sem markup",
      openGraphDescription:
        "Um único saldo para fluxos de imagem, vídeo, áudio, web, armazenamento e publicação. US$ 5 em crédito grátis, pague conforme usa, sem assinatura.",
      pageName: "Preços do AnyCap",
      pageDescription:
        "Página de preços do AnyCap. Créditos pagos por uso em fluxos de imagem, vídeo, áudio, web, armazenamento e publicação.",
    },
    breadcrumbItems: [
      { name: "Início", href: "/" },
      { name: "Preços", href: "/pricing" },
    ],
    hero: {
      eyebrow: "Preços",
      titleLine1: "Preços simples e",
      titleLine2: "transparentes.",
      intro:
        "Comece pelas capacidades para agentes de IA que os agentes de código mais sentem falta. O AnyCap dá a você um saldo pré-pago para esses fluxos e permite que esse mesmo saldo se estenda pelo runtime mais amplo conforme sua stack cresce. Sem markup sobre as taxas oficiais. Sem assinatura. Toda nova conta começa com US$ 5 em crédito grátis.",
      factsLabel: "Dados sobre os preços",
      factsText:
        "O AnyCap usa créditos pré-pagos. Novas contas recebem US$ 5 em crédito grátis. Depois disso, o inventário público de capacidades do AnyCap é cobrado pela mesma taxa do provedor oficial, sem mensalidade e sem markup da plataforma. O mesmo saldo também pode ser usado em fluxos de imagem, vídeo, áudio, web, armazenamento e publicação. Os pacotes de crédito são compras únicas, e pacotes maiores incluem créditos bônus.",
      lastUpdatedLabel: "Atualizado em 8 de abril de 2026",
    },
    sectionTitles: {
      pricingPrinciples: "Como funciona o preço do AnyCap",
      creditPackages: "Pacotes de créditos",
      estimateTopUp: "Como estimar sua primeira recarga",
      generationModels: "Modelos de geração",
      actions: "Ações",
      drivePage: "Drive & Page",
      faq: "Perguntas frequentes",
    },
    pricingPrinciplesIntro:
      "O modelo de preços é intencionalmente simples: comece grátis, compre pacotes de créditos únicos quando precisar de mais saldo e mantenha esse mesmo saldo disponível nos fluxos que seus agentes já executam.",
    pricingPrinciples: [
      {
        title: "Comece grátis e só compre quando o fluxo provar valor",
        description:
          "Toda nova conta começa com US$ 5 em crédito grátis, então equipes podem testar fluxos reais de imagem, vídeo, áudio e web antes de se comprometer com um pacote pré-pago maior.",
      },
      {
        title: "Mantenha um único saldo para os fluxos que os agentes realmente precisam",
        description:
          "O mesmo saldo do AnyCap pode ser usado em fluxos de geração, análise, busca, armazenamento e publicação, em vez de dividir gastos entre vários painéis de fornecedores.",
      },
      {
        title: "Pague as taxas oficiais do provedor por meio de um fluxo de cobrança consolidado",
        description:
          "O AnyCap repassa a taxa oficial do modelo sem markup e adiciona um único fluxo de compra, um único saldo e um único histórico de transações para o runtime inteiro.",
      },
    ],
    creditPackages: pricingPackagesByLocale["pt-br"],
    creditPackagesIntro:
      "Compre créditos para usar em todas as capacidades. Pacotes maiores incluem créditos bônus.",
    packageStatusLabels: {
      popular: "Popular",
      recommendedPack: "Pacote recomendado",
      continueToCheckout: "Continuar para o checkout",
    },
    enterprisePackage: {
      name: "Enterprise",
      headline: "Volume customizado para equipes e fluxos maiores",
      description:
        "Para equipes que precisam de compras maiores, cobrança consolidada, suporte de procurement ou faturamento por invoice.",
      highlights: ["Volume customizado de créditos", "Preço por volume", "Cobrança por invoice"],
      ctaLabel: "Fale conosco",
      ctaSubject: "Preços Enterprise do AnyCap",
    },
    enterpriseFootnote:
      "1 crédito = US$ 0,02. Todos os pacotes são compras únicas, não assinaturas. Precisa de volume maior ou faturamento por invoice? Fale conosco para preços Enterprise.",
    estimateTopUp: {
      intro:
        "A maioria das equipes não precisa de uma previsão perfeita antes de comprar créditos. Uma abordagem melhor é mapear o fluxo, precificar a etapa mais cara e então escolher o pacote que deixa margem para iteração.",
      checklist: [
        {
          title: "1. Comece pelo fluxo, não pela lista de modelos",
          description:
            "Estime o caminho que o agente realmente vai seguir: geração, análise, busca, armazenamento ou uma mistura de várias etapas em um único job.",
        },
        {
          title: "2. Precifique primeiro a etapa mais cara",
          description:
            "Use as tabelas abaixo para estimar a saída de geração ou o tipo de ação que vai consumir a maior parte dos créditos e trate o restante como margem.",
        },
        {
          title: "3. Deixe espaço para retries e iteração",
          description:
            "Se o fluxo precisar de ajustes de prompt, QA ou handoff entre colegas, escolha o pacote que dá folga suficiente para continuar sem recarregar todo dia.",
        },
      ],
    },
    generationModels: {
      intro:
        "Taxas em créditos para cada modelo de geração. Repassamos a taxa oficial do provedor sem markup.",
      creditsNotice:
        "Os créditos mostrados são aproximados. O custo real pode variar conforme resolução, duração ou configurações de qualidade.",
    },
    actions: {
      intro:
        "Analise imagens, vídeos e áudio, pesquise na web, faça crawl de páginas e execute busca na web fundamentada por IA, tudo com uma taxa fixa por requisição.",
      includedCapabilitiesLabel: "Capacidades incluídas",
      includedCapabilitiesSummary: pricingCapabilitySummaryTextPtBr,
      tableHeaders: ["Ação", "Unidade", "Créditos"],
    },
    drivePage: {
      intro:
        "Armazenamento em nuvem e publicação de sites estáticos incluídos em toda conta sem custo adicional de crédito. As cotas de armazenamento são aplicadas por conta.",
      driveLabel: "Drive",
      driveDescription: "Armazenamento de arquivos na nuvem com URLs públicas e compartilhamento.",
      pageLabel: "Page",
      pageDescription: "Deploy de site estático e publicação web.",
      limitNotice: "Os limites atuais refletem padrões de prévia de early access e podem mudar.",
      driveQuotas: [
        { label: "Arquivos por conta", value: "5.000" },
        { label: "Tamanho máximo de arquivo", value: "1 GB" },
      ],
      pageQuotas: [
        { label: "Sites por conta", value: "100" },
        { label: "Versões por site", value: "500" },
      ],
    },
    faqItems: [
      {
        question: "Existe um plano gratuito?",
        answer:
          "Toda conta começa com US$ 5 em crédito grátis, o que equivale a 250 créditos na conversão base atual, e não é necessário informar dados de pagamento para começar a testar fluxos.",
      },
      {
        question: "Os créditos expiram?",
        answer: "Não. Os créditos comprados não expiram.",
      },
      {
        question: "Há markup nos preços dos modelos?",
        answer:
          "Não. O AnyCap repassa a taxa oficial do provedor para cada modelo e capacidade, e depois consolida o uso em um único saldo e um único fluxo de cobrança.",
      },
      {
        question: "Posso usar o mesmo saldo para geração e ações?",
        answer:
          "Sim. O mesmo saldo do AnyCap pode ser usado em modelos de geração, ferramentas de análise, ações na web, armazenamento no Drive e fluxos de publicação no Page.",
      },
      {
        question: "Como devo escolher meu primeiro pacote de créditos?",
        answer:
          "Starter é uma boa opção para os primeiros testes ao vivo, Standard é o padrão para uso semanal recorrente e Pro é o melhor ajuste quando a equipe espera cargas de produção mais pesadas ou contínuas.",
      },
      {
        question: "Quais capacidades estão incluídas?",
        answer: `${pricingCapabilitySummaryTextPtBr}. O armazenamento no Drive e a hospedagem no Page estão incluídos sem custo adicional de crédito.`,
      },
    ],
    cta: {
      buyCredits: "Comprar créditos",
      viewCapabilities: "Ver capacidades",
    },
    pricingPageJsonLd: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Preços do AnyCap",
      description:
        "Página de preços do AnyCap. Créditos pagos por uso em fluxos de imagem, vídeo, áudio, web, armazenamento e publicação.",
      url: getLocalizedRouteUrl(siteConfig.defaultLocale, PRICING_PATH),
      dateModified: "2026-04-08",
      mainEntity: {
        "@type": "Product",
        name: "Créditos do AnyCap",
        url: getLocalizedRouteUrl(siteConfig.defaultLocale, PRICING_PATH),
        description:
          "Créditos pagos por uso para as capacidades para agentes de IA que os agentes de código mais sentem falta, com um único saldo no runtime mais amplo do AnyCap.",
        offers: pricingPackagesByLocale["pt-br"].map((pkg) => ({
          "@type": "Offer",
          name: `${pkg.name} pacote de créditos`,
          url: `${getLocalizedRouteUrl(siteConfig.defaultLocale, PRICING_PATH)}#pack-${pkg.packQuery}`,
          price: pkg.price.toFixed(2),
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          description: pkg.bonusLabel
            ? `${pkg.credits.toLocaleString()} créditos (${pkg.bonusLabel})`
            : `${pkg.credits.toLocaleString()} créditos`,
        })),
      },
    },
    faqJsonLd: createFaqPageJsonLd([
      {
        question: "Existe um plano gratuito?",
        answer:
          "Toda conta começa com US$ 5 em crédito grátis, o que equivale a 250 créditos na conversão base atual, e não é necessário informar dados de pagamento para começar a testar fluxos.",
      },
      {
        question: "Os créditos expiram?",
        answer: "Não. Os créditos comprados não expiram.",
      },
      {
        question: "Há markup nos preços dos modelos?",
        answer:
          "Não. O AnyCap repassa a taxa oficial do provedor para cada modelo e capacidade, e depois consolida o uso em um único saldo e um único fluxo de cobrança.",
      },
      {
        question: "Posso usar o mesmo saldo para geração e ações?",
        answer:
          "Sim. O mesmo saldo do AnyCap pode ser usado em modelos de geração, ferramentas de análise, ações na web, armazenamento no Drive e fluxos de publicação no Page.",
      },
      {
        question: "Como devo escolher meu primeiro pacote de créditos?",
        answer:
          "Starter é uma boa opção para os primeiros testes ao vivo, Standard é o padrão para uso semanal recorrente e Pro é o melhor ajuste quando a equipe espera cargas de produção mais pesadas ou contínuas.",
      },
      {
        question: "Quais capacidades estão incluídas?",
        answer: `${pricingCapabilitySummaryTextEn}. O armazenamento no Drive e a hospedagem no Page estão incluídos sem custo adicional de crédito.`,
      },
    ]),
  },
  id: {
    metadata: {
      title: "Harga AnyCap — bayar sesuai pemakaian, tanpa markup, kredit gratis $5",
      description:
        "Dapatkan kredit gratis $5, lalu bayar sesuai pemakaian tanpa langganan dan tanpa markup. Gunakan satu saldo untuk alur gambar, video, audio, web, penyimpanan, dan publikasi di AnyCap.",
      openGraphTitle: "Harga AnyCap — bayar sesuai pemakaian, tanpa markup, kredit gratis $5",
      openGraphDescription:
        "Satu saldo untuk alur gambar, video, audio, web, penyimpanan, dan publikasi. Kredit gratis $5, bayar sesuai pemakaian, tanpa langganan.",
      pageName: "Harga AnyCap",
      pageDescription:
        "Halaman harga AnyCap. Kredit bayar sesuai pemakaian untuk alur gambar, video, audio, web, penyimpanan, dan publikasi.",
    },
    breadcrumbItems: [
      { name: "Beranda", href: "/" },
      { name: "Harga", href: "/pricing" },
    ],
    hero: {
      eyebrow: "Harga",
      titleLine1: "Harga sederhana dan",
      titleLine2: "transparan.",
      intro:
        "Mulailah dari kapabilitas agen AI yang paling sering tidak dimiliki agen coding. AnyCap memberi Anda satu saldo prabayar untuk alur kerja tersebut, lalu membiarkan saldo yang sama dipakai di runtime yang lebih luas saat stack Anda bertumbuh. Tanpa markup di atas tarif resmi. Tanpa langganan. Setiap akun baru dimulai dengan kredit gratis $5.",
      factsLabel: "Fakta harga",
      factsText:
        "AnyCap memakai kredit prabayar. Akun baru menerima kredit gratis $5. Setelah itu, inventaris kapabilitas publik AnyCap ditagih dengan tarif yang sama seperti penyedia model resmi, tanpa biaya langganan dan tanpa markup platform. Saldo yang sama juga dapat digunakan di alur gambar, video, audio, web, penyimpanan, dan publikasi. Paket kredit dibeli satu kali, dan paket yang lebih besar mencakup kredit bonus.",
      lastUpdatedLabel: "Terakhir diperbarui 8 April 2026",
    },
    sectionTitles: {
      pricingPrinciples: "Cara kerja harga AnyCap",
      creditPackages: "Paket kredit",
      estimateTopUp: "Cara memperkirakan isi ulang pertama",
      generationModels: "Model generasi",
      actions: "Aksi",
      drivePage: "Drive & Page",
      faq: "Pertanyaan umum",
    },
    pricingPrinciplesIntro:
      "Model harga ini sengaja dibuat sederhana: mulai gratis, beli paket kredit satu kali saat Anda butuh saldo lebih, dan pertahankan saldo yang sama untuk alur kerja yang sudah dijalankan agen Anda.",
    pricingPrinciples: pricingPrinciplesId,
    creditPackages: pricingPackagesByLocale.id,
    creditPackagesIntro:
      "Beli kredit untuk dipakai di semua kapabilitas. Paket yang lebih besar menyertakan kredit bonus.",
    packageStatusLabels: {
      popular: "Populer",
      recommendedPack: "Paket yang direkomendasikan",
      continueToCheckout: "Lanjut ke checkout",
    },
    enterprisePackage: {
      name: "Enterprise",
      headline: "Volume khusus untuk tim dan alur kerja yang lebih besar",
      description:
        "Untuk tim yang butuh pembelian lebih besar, billing terpusat, dukungan procurement, atau penagihan invoice.",
      highlights: ["Volume kredit khusus", "Harga per volume", "Penagihan invoice"],
      ctaLabel: "Hubungi kami",
      ctaSubject: "Harga Enterprise AnyCap",
    },
    enterpriseFootnote:
      "1 kredit = $0,02. Semua paket dibeli satu kali, bukan langganan. Butuh volume lebih besar atau billing invoice? Hubungi kami untuk harga enterprise.",
    estimateTopUp: {
      intro:
        "Kebanyakan tim tidak butuh prakiraan yang sempurna sebelum membeli kredit. Cara yang lebih baik adalah memetakan alurnya, menghitung bagian yang paling mahal, lalu memilih paket yang memberi ruang untuk iterasi.",
      checklist: checklistId,
    },
    generationModels: {
      intro:
        "Tarif kredit untuk setiap model generasi. Kami meneruskan tarif resmi penyedia tanpa markup.",
      creditsNotice:
        "Kredit yang ditampilkan bersifat perkiraan. Biaya aktual dapat berubah tergantung resolusi, durasi, atau pengaturan kualitas.",
    },
    actions: {
      intro:
        "Analisis gambar, video, dan audio, cari web, crawl halaman, dan jalankan pencarian web yang di-grounding AI, semuanya dengan tarif tetap per permintaan.",
      includedCapabilitiesLabel: "Kapabilitas yang termasuk",
      includedCapabilitiesSummary: pricingCapabilitySummaryTextId,
      tableHeaders: ["Aksi", "Unit", "Kredit"],
    },
    drivePage: {
      intro:
        "Penyimpanan cloud dan hosting situs statis disertakan di setiap akun tanpa biaya kredit tambahan. Kuota penyimpanan diterapkan per akun.",
      driveLabel: "Drive",
      driveDescription: "Penyimpanan file cloud dengan URL publik dan berbagi.",
      pageLabel: "Page",
      pageDescription: "Deploy situs statis dan publikasi web.",
      limitNotice: "Batas saat ini mengikuti default pratinjau early access dan dapat berubah.",
      driveQuotas: [
        { label: "File per akun", value: "5.000" },
        { label: "Ukuran file maks", value: "1 GB" },
      ],
      pageQuotas: [
        { label: "Situs per akun", value: "100" },
        { label: "Versi per situs", value: "500" },
      ],
    },
    faqItems: faqItemsId,
    cta: {
      buyCredits: "Beli kredit",
      viewCapabilities: "Lihat kapabilitas",
    },
    pricingPageJsonLd: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Harga AnyCap",
      description:
        "Halaman harga AnyCap. Kredit bayar sesuai pemakaian untuk alur gambar, video, audio, web, penyimpanan, dan publikasi.",
      url: getLocalizedRouteUrl(siteConfig.defaultLocale, PRICING_PATH),
      dateModified: "2026-04-08",
      mainEntity: {
        "@type": "Product",
        name: "Kredit AnyCap",
        url: getLocalizedRouteUrl(siteConfig.defaultLocale, PRICING_PATH),
        description:
          "Kredit bayar sesuai pemakaian untuk kapabilitas agen AI yang paling sering tidak dimiliki agen coding, dengan satu saldo di runtime AnyCap yang lebih luas.",
        offers: pricingPackagesByLocale.id.map((pkg) => ({
          "@type": "Offer",
          name: `${pkg.name} paket kredit`,
          url: `${getLocalizedRouteUrl(siteConfig.defaultLocale, PRICING_PATH)}#pack-${pkg.packQuery}`,
          price: pkg.price.toFixed(2),
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          description: pkg.bonusLabel
            ? `${pkg.credits.toLocaleString()} kredit (${pkg.bonusLabel})`
            : `${pkg.credits.toLocaleString()} kredit`,
        })),
      },
    },
    faqJsonLd: createFaqPageJsonLd(faqItemsId),
  },
};

export function getPricingMetadata(locale: SiteLocale): Metadata {
  const content = contentByLocale[locale] ?? contentByLocale.en;

  return {
    title: content.metadata.title,
    description: content.metadata.description,
    alternates: { canonical: PRICING_PATH },
    openGraph: {
      type: "website",
      locale: getLocaleConfig(locale).ogLocale,
      url: PRICING_PATH,
      siteName: siteConfig.siteName,
      title: content.metadata.openGraphTitle,
      description: content.metadata.openGraphDescription,
    },
  };
}

export function getPricingPageData(locale: SiteLocale) {
  return contentByLocale[locale] ?? contentByLocale.en;
}
