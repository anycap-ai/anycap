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
  id: {
    metadata: {
      title: "API Pencarian Web untuk agen AI, peneliti, dan tim - Pencarian terstruktur lewat satu CLI",
      description:
        "Berikan pencarian web kepada agen AI, peneliti, dan tim lewat AnyCap. Jalankan pencarian web terstruktur dengan filter domain, kontrol kebaruan, dan crawl halaman opsional melalui satu CLI, tanpa perlu merangkai API pencarian terpisah.",
      openGraphTitle:
        "API Pencarian Web untuk agen AI, peneliti, dan tim - Pencarian terstruktur lewat satu CLI",
      openGraphDescription:
        "Tambahkan pencarian web ke agen AI dengan satu CLI, satu alur autentikasi, dan satu runtime kapabilitas.",
    },
    breadcrumbItems: [
      { name: "Beranda", href: "/" },
      { name: "Kapabilitas", href: "/capabilities" },
      { name: "Pencarian Web" },
    ],
    eyebrow: "Kapabilitas",
    heroTitle: "Pencarian Web",
    heroIntro:
      "Pencarian web AnyCap memberi agen, peneliti, dan tim API pencarian web terstruktur melalui satu CLI. Workflow ini bisa mengambil kumpulan hasil, membatasi domain tepercaya, memfilter berdasarkan kebaruan, dan menarik isi halaman ke dalam workflow tanpa bergantung pada ekstensi browser terpisah atau integrasi pencarian khusus vendor. Itu membuat pencarian web jauh lebih mudah dipadukan dengan runtime AnyCap lainnya.",
    heroImageAlt:
      "Ilustrasi editorial yang menunjukkan hasil pencarian web mengalir ke jawaban berbasis bukti dan langkah crawl",
    usageTitle: "Penggunaan CLI",
    usageExamples: [
      { title: "Pencarian web umum", code: usageExamples[0].code },
      { title: "Cepat, hanya judul dan URL", code: usageExamples[1].code },
      { title: "Batasi domain", code: usageExamples[2].code },
      { title: "Hanya hasil terbaru", code: usageExamples[3].code },
    ],
    useCasesTitle: "Saat agen membutuhkan pencarian web",
    useCases: [
      "Temukan halaman, dokumentasi, atau referensi yang relevan sebelum agen menulis atau memperbarui kode.",
      "Cari web dengan hasil terstruktur, bukan membuka workflow pencarian berbasis browser.",
      "Batasi pencarian ke domain tepercaya saat tim membutuhkan retrieval yang lebih dapat diprediksi.",
      "Tarik isi halaman langsung ke workflow ketika yang dibutuhkan lebih dari sekadar URL dan cuplikan.",
      "Dukung workflow riset, konten, dan operasional yang membutuhkan daftar sumber, bukan jawaban akhir.",
    ],
    workflowTitle: "Biasanya workflow berjalan seperti ini",
    workflowSteps: [
      {
        title: "Langkah 1",
        body: "Mulai dengan pencarian terstruktur ketika agen belum tahu sumbernya. Ini memberi Anda kumpulan hasil, bukan jawaban spekulatif, dan biasanya itulah langkah awal terbaik untuk riset, pemindaian kompetitif, dan pelacakan rilis.",
      },
      {
        title: "Langkah 2",
        body: "Gunakan pencarian berbasis bukti ketika agen perlu mengubah bukti menjadi jawaban dengan sitasi. Gunakan crawl ketika URL exact sudah diketahui dan Anda hanya perlu isi halaman tanpa fase discovery tambahan.",
      },
      {
        title: "Langkah 3",
        body: "Serahkan kumpulan hasil kembali ke agen atau tim sebagai catatan sumber, sitasi, atau paket bukti singkat. Itu membuat pencarian web menjadi input untuk pekerjaan berikutnya, bukan fitur buntu yang berhenti di hasil pencarian.",
      },
    ],
    strengthsTitle: "Di mana ia unggul dan di mana tidak",
    strengthCards: [
      {
        title: "Discovery",
        body: 'Pencarian web unggul ketika jawabannya dimulai dengan "carikan sumbernya" alih-alih "beri saya jawabannya". Ini langkah awal yang tepat ketika agen butuh opsi.',
      },
      {
        title: "Verifikasi",
        body: "Pencarian web juga unggul ketika tim peduli pada kebaruan, kepercayaan domain, atau daftar sumber yang terbatas. Itu biasanya kasus-kasus yang membuat pencarian browser generik terasa terlalu longgar untuk kerja produksi.",
      },
      {
        title: "Serah terima",
        body: "Nilainya berkurang jika Anda berhenti di hasil pencarian. Hasil yang berguna adalah paket sumber yang bisa diteruskan oleh agen, editor, atau manusia lain tanpa mengulang pekerjaan yang sama.",
      },
    ],
    relatedTitle: "Halaman terkait",
    relatedPages: [
      {
        eyebrow: "Kapabilitas terkait",
        title: "Pencarian Web Berbasis Bukti",
        href: "/capabilities/grounded-web-search",
        body: "Naik ke jawaban dengan sitasi ketika workflow membutuhkan sintesis, bukan sekadar retrieval.",
      },
      {
        eyebrow: "Kapabilitas terkait",
        title: "Crawl Web",
        href: "/capabilities/web-crawl",
        body: "Gunakan crawl ketika URL sudah diketahui dan workflow hanya membutuhkan isi halaman.",
      },
      {
        eyebrow: "Harga",
        title: "Harga",
        href: "/pricing",
        body: "Lihat model kredit untuk pencarian web, jawaban berbasis bukti, dan permintaan crawl.",
      },
    ],
    faqTitle: "FAQ",
    faqItems: [
      {
        question: "Apa yang memungkinkan agen lakukan dengan pencarian web AnyCap?",
        answer:
          "Ini memberi agen API pencarian web terstruktur melalui CLI. Tim bisa mencari berdasarkan kueri, memfilter menurut domain atau tanggal, dan opsional mengambil isi halaman penuh tanpa merangkai tool browser atau penyedia pencarian terpisah.",
      },
      {
        question: "Mengapa pencarian web punya halaman kapabilitas sendiri?",
        answer:
          "Karena bahasa pasar di area ini berbentuk API. Permintaan biasanya muncul sebagai web search API, search API for AI agents, atau real-time web search API, bukan istilah kapabilitas generik.",
      },
      {
        question: "Apa bedanya dengan pencarian web berbasis bukti?",
        answer:
          "Pencarian web mengembalikan hasil pencarian terstruktur. Pencarian berbasis bukti mensintesis jawaban dengan sitasi. Keduanya memakai keluarga perintah yang sama, tetapi menyelesaikan pekerjaan yang berbeda.",
      },
      {
        question: "Kapan tim sebaiknya memakai pencarian standar terlebih dulu?",
        answer:
          "Saat tujuannya adalah discovery, retrieval, atau mengumpulkan kumpulan hasil. Kalau agen perlu memeriksa halaman kandidat sendiri, pencarian standar adalah titik awal yang lebih bersih.",
      },
      {
        question: "Apakah ini hanya untuk developer?",
        answer:
          "Tidak. Pencarian web berguna untuk peneliti, tim konten, operator, dan workflow support yang butuh daftar sumber tepercaya, pemindaian kompetitif, atau pengumpulan referensi live dengan cepat.",
      },
    ],
    capabilityGuideJsonLd: createTechArticleJsonLd({
      headline:
        "API Pencarian Web untuk agen AI, peneliti, dan tim - Pencarian terstruktur lewat satu CLI",
      description:
        "Panduan kapabilitas untuk menambahkan pencarian web ke agen AI melalui AnyCap, termasuk pencarian umum, filter domain, filter kebaruan, dan crawl opsional.",
      path: WEB_SEARCH_PATH,
      about: [
        "API pencarian web",
        "Search API untuk agen AI",
        "Pencarian web real-time",
        "AnyCap",
        "Workflow riset",
      ],
      keywords: [
        "api pencarian web",
        "search api untuk agen ai",
        "real time web search api",
        "web search api ai agents",
      ],
    }),
  },
  de: {
    metadata: {
      title: "Websuche-API für KI-Agenten, Forschende und Teams – Strukturierte Suche über eine CLI",
      description:
        "Geben Sie KI-Agenten, Forschenden und Teams Websuche über AnyCap. Führen Sie strukturierte Websuche mit Domain-Filtern, Aktualitäts-Kontrollen und optionalem Page-Crawling über eine CLI aus, statt eine separate Such-API zu verdrahten.",
      openGraphTitle:
        "Websuche-API für KI-Agenten, Forschende und Teams – Strukturierte Suche über eine CLI",
      openGraphDescription:
        "Statten Sie KI-Agenten mit Websuche über eine CLI, einen Auth-Flow und eine Capability-Runtime aus.",
    },
    breadcrumbItems: [
      { name: "Startseite", href: "/" },
      { name: "Capabilities", href: "/capabilities" },
      { name: "Websuche" },
    ],
    eyebrow: "Capabilities",
    heroTitle: "Websuche",
    heroIntro:
      "Die AnyCap-Websuche gibt Agenten, Forschenden und Teams eine strukturierte Websuche-API über eine CLI. Der Workflow kann Ergebnis-Sets abrufen, vertrauenswürdige Domains einschränken, nach Aktualität filtern und Seiteninhalte direkt in den Workflow ziehen, ohne sich auf eine separate Browser-Erweiterung oder anbieterspezifische Such-Integration zu verlassen. Das macht Websuche deutlich einfacher mit dem Rest der AnyCap-Runtime kombinierbar.",
    heroImageAlt:
      "Editorial-Illustration, die Websuche-Ergebnisse zeigt, die in fundierte Antworten und Crawl-Schritte fließen",
    usageTitle: "CLI-Nutzung",
    usageExamples: [
      { title: "Allgemeine Websuche", code: usageExamples[0].code },
      { title: "Schnell, nur Titel und URLs", code: usageExamples[1].code },
      { title: "Domains einschränken", code: usageExamples[2].code },
      { title: "Nur aktuelle Ergebnisse", code: usageExamples[3].code },
    ],
    useCasesTitle: "Wann Agenten Websuche brauchen",
    useCases: [
      "Relevante Seiten, Docs oder Referenzen finden, bevor ein Agent Code schreibt oder aktualisiert.",
      "Das Web mit strukturierten Ergebnissen durchsuchen, statt einen browserbasierten Such-Workflow zu öffnen.",
      "Suchen auf vertrauenswürdige Domains einschränken, wenn Teams vorhersehbarere Retrieval-Ergebnisse brauchen.",
      "Seiteninhalte direkt in den Workflow ziehen, wenn der Workflow mehr als nur URLs und Snippets braucht.",
      "Recherche-, Content- und Operations-Workflows unterstützen, die Quellenlisten statt einer endgültigen Antwort brauchen.",
    ],
    workflowTitle: "Wie der Workflow normalerweise läuft",
    workflowSteps: [
      {
        title: "Schritt 1",
        body: "Beginnen Sie mit strukturierter Suche, wenn der Agent die Quelle noch nicht kennt. Das liefert ein Ergebnis-Set statt einer spekulativen Antwort und ist meist der richtige erste Schritt für Recherche, Wettbewerbs-Scans und Release-Tracking.",
      },
      {
        title: "Schritt 2",
        body: "Verwenden Sie Grounded Search, wenn der Agent Belege in eine Antwort mit Zitaten verwandeln muss. Verwenden Sie Crawl, wenn die exakte URL bereits bekannt ist und Sie nur den Seiteninhalt ohne weiteren Discovery-Durchgang brauchen.",
      },
      {
        title: "Schritt 3",
        body: "Geben Sie das Ergebnis-Set an den Agenten oder das Team als Quellen-Notizen, Zitate oder ein kurzes Evidenz-Bundle zurück. So wird Websuche zum Input für nachfolgende Arbeit, statt zu einem Sackgassen-Feature, das bei Suchergebnissen aufhört.",
      },
    ],
    strengthsTitle: "Wo sie überzeugt und wo nicht",
    strengthCards: [
      {
        title: "Discovery",
        body: "Websuche überzeugt, wenn die Antwort mit „finde mir die Quellen“ beginnt statt mit „sag mir die Antwort“. Sie ist der richtige erste Schritt, wenn der Agent Optionen braucht.",
      },
      {
        title: "Verifikation",
        body: "Sie überzeugt auch, wenn dem Team Aktualität, Domain-Vertrauen oder eine eingeschränkte Quellenliste wichtig ist. Das sind meist die Fälle, in denen sich eine generische Browser-Suche zu locker für Produktionsarbeit anfühlt.",
      },
      {
        title: "Übergabe",
        body: "Sie verliert an Wert, wenn Sie beim Suchergebnis aufhören. Das nützliche Ergebnis ist ein Quellen-Bundle, mit dem ein anderer Agent, Editor oder Mensch fortfahren kann, ohne dieselbe Such-Arbeit zu wiederholen.",
      },
    ],
    relatedTitle: "Verwandte Seiten",
    relatedPages: [
      {
        eyebrow: "Verwandte Capability",
        title: "Grounded Web Search",
        href: "/capabilities/grounded-web-search",
        body: "Wechseln Sie zu zitatbasierten Antworten, wenn der Workflow Synthese statt Retrieval braucht.",
      },
      {
        eyebrow: "Verwandte Capability",
        title: "Web Crawl",
        href: "/capabilities/web-crawl",
        body: "Verwenden Sie Crawl, wenn die URL bereits bekannt ist und der Workflow nur den Seiteninhalt braucht.",
      },
      {
        eyebrow: "Preise",
        title: "Preise",
        href: "/pricing",
        body: "Sehen Sie das Credit-Modell für Websuche, fundierte Antworten und Crawl-Anfragen.",
      },
    ],
    faqTitle: "FAQ",
    faqItems: [
      {
        question: "Was können Agenten mit der AnyCap-Websuche tun?",
        answer:
          "Sie gibt Agenten eine strukturierte Websuche-API über die CLI. Teams können nach Query suchen, nach Domain oder Datum filtern und optional vollständige Seiteninhalte abrufen, ohne separate Browser-Tools oder Such-Anbieter zusammenzustückeln.",
      },
      {
        question: "Warum ist Websuche eine eigene Capability-Seite?",
        answer:
          "Weil die Marktsprache hier API-förmig ist. Such-Nachfrage wird meist als Web Search API, Search API for AI agents oder Real-time Web Search API formuliert, statt als generischer Capability-Begriff.",
      },
      {
        question: "Wie unterscheidet sich das von Grounded Web Search?",
        answer:
          "Websuche liefert strukturierte Suchergebnisse zurück. Grounded Web Search synthetisiert eine Antwort mit Zitaten. Beide Capabilities teilen dieselbe Befehlsfamilie, lösen aber verschiedene Aufgaben.",
      },
      {
        question: "Wann sollten Teams zuerst die Standard-Websuche verwenden?",
        answer:
          "Wenn das Ziel Discovery, Retrieval oder das Sammeln eines Ergebnis-Sets ist. Wenn der Agent Kandidatenseiten selbst inspizieren muss, ist Standardsuche der saubere Startpunkt.",
      },
      {
        question: "Ist das nur für Entwickler?",
        answer:
          "Nein. Websuche ist nützlich für Forschende, Content-Teams, Operatoren und Support-Workflows, die vertrauenswürdige Quellenlisten, Wettbewerbs-Scans oder schnelles Sammeln von Live-Referenzen brauchen.",
      },
    ],
    capabilityGuideJsonLd: createTechArticleJsonLd({
      headline:
        "Websuche-API für KI-Agenten, Forschende und Teams – Strukturierte Suche über eine CLI",
      description:
        "Capability-Leitfaden zum Hinzufügen von Websuche zu KI-Agenten über AnyCap, einschließlich allgemeiner Suche, Domain-Filter, Aktualitäts-Filter und optionalem Crawling.",
      path: WEB_SEARCH_PATH,
      about: ["Websuche-API", "Search API für KI-Agenten", "Echtzeit-Websuche", "AnyCap", "Recherche-Workflows"],
      keywords: [
        "websuche api",
        "search api für ki-agenten",
        "echtzeit websuche api",
        "web search api ki agenten",
      ],
    }),
  },
};

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
