import type { Metadata } from "next";
import { organizationId, organizationSameAs } from "@/lib/organization";
import { createFaqPageJsonLd } from "@/lib/schema";
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
  faqTitle: string;
  faqItems: { question: string; answer: string }[];
  faqJsonLd: Record<string, unknown>;
  contactTitle: string;
  contactPaths: { label: string; href: string; detail: string }[];
  trustTitle: string;
  trustSignals: { label: string; detail: string }[];
  aboutPageJsonLd: Record<string, unknown>;
  organizationJsonLd: Record<string, unknown>;
};

const aboutFaqItemsEn = [
  {
    question: "What does AnyCap add if my agent already writes code?",
    answer:
      "Code generation solves planning and implementation, but many production workflows still fail at capability execution. An agent may produce correct code and still fail when it needs to render images, generate videos, inspect visual output, or move artifacts between tools with stable authentication. AnyCap adds that missing execution layer with one install path, one auth flow, and one command surface. Teams keep the agent they already trust while reducing provider-specific glue code. In practice, this lowers setup time, reduces brittle integrations, and keeps multimodal workflows reproducible across environments.",
  },
  {
    question: "Is AnyCap an agent framework, or a runtime around existing agents?",
    answer:
      "AnyCap is a runtime around existing agents, not a replacement framework. You still use Claude Code, Cursor, Codex, or another planning layer for reasoning and task decomposition. AnyCap focuses on capabilities that sit outside base model reasoning, such as media generation and multimodal analysis. This separation keeps responsibilities clear: the agent decides what to do, and AnyCap provides a stable way to execute that decision through capabilities. The result is a cleaner architecture where teams can upgrade models, prompts, or providers without rewriting every integration from scratch.",
  },
  {
    question: "How should teams evaluate AnyCap before production rollout?",
    answer:
      "Start with one real workflow that currently breaks because capability setup is fragmented. Install AnyCap through the public guide, run auth once, and execute the same workflow end to end through the CLI. Compare three things: setup time, failure modes, and reproducibility across teammates. During evaluation, keep request logs, errors, and screenshots so the team can review where the runtime removed friction and where gaps remain. A good pilot is usually small but representative: one agent, one capability chain, one measurable output. If that path becomes predictable, rollout decisions become much clearer.",
  },
];

const aboutFaqItemsPtBr = [
  {
    question: "O que o AnyCap adiciona se meu agente ja escreve codigo?",
    answer:
      "Geracao de codigo resolve planejamento e implementacao, mas muitos workflows reais ainda quebram na execucao de capabilities. Um agente pode produzir codigo correto e mesmo assim falhar quando precisa renderizar imagens, gerar videos, inspecionar saidas visuais ou mover artefatos entre ferramentas com autenticacao estavel. O AnyCap adiciona essa camada de execucao com um unico caminho de instalacao, um unico fluxo de auth e uma unica superficie de comando. O time mantem o agente que ja usa, reduz cola especifica por provedor e torna workflows multimodais mais previsiveis.",
  },
  {
    question: "AnyCap e um framework de agente ou um runtime ao redor de agentes existentes?",
    answer:
      "AnyCap e um runtime ao redor de agentes existentes, nao um framework que substitui seu stack atual. Voce continua com Claude Code, Cursor, Codex ou outro agente para raciocinio e planejamento. O foco do AnyCap fica na camada de capabilities fora do modelo base, como geracao de midia e analise multimodal. Essa separacao deixa responsabilidades claras: o agente decide o que fazer e o AnyCap fornece um caminho estavel para executar essa decisao. O resultado e uma arquitetura mais limpa, em que trocar modelo ou provedor nao exige reescrever toda a integracao.",
  },
  {
    question: "Como avaliar o AnyCap antes de levar para producao?",
    answer:
      "Comece por um workflow real que hoje quebra por causa de setup fragmentado de capabilities. Instale o AnyCap pelo guia publico, autentique uma vez e rode o mesmo fluxo ponta a ponta pela CLI. Compare tres indicadores: tempo de setup, tipos de falha e reproducibilidade entre membros do time. Durante o teste, registre logs, erros e screenshots para revisar onde o runtime reduziu atrito e onde ainda existem lacunas. Um bom piloto e pequeno, mas representativo: um agente, uma cadeia de capability e uma saida mensuravel. Se esse caminho ficar previsivel, a decisao de rollout fica objetiva.",
  },
];

const contentByLocale: Record<SiteLocale, AboutPageData> = {
  en: {
    metadata: {
      title: "About AnyCap - AI agent capability infrastructure",
      description:
        "AnyCap builds AI agent capability infrastructure: one runtime for image generation, video, vision, web search, and web crawl.",
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
    heroIntro: `AnyCap is focused on the execution layer between a reasoning agent and the capabilities needed to finish real work: ${capabilitySummary}. Most agents can plan and write, but still break when a workflow crosses media generation, visual inspection, or multi-step capability handoff. Our approach is simple: keep the agent you already trust, then add one capability runtime around it so install, auth, and command behavior stay predictable across tasks. This gives teams a stable integration surface instead of provider-specific glue code, while leaving room to expand as ${roadmapCapabilitySummary} move from roadmap to production.`,
    companyFactsTitle: "Company facts",
    companyFacts: [
      { label: "Company", value: "AnyCap" },
      { label: "Product", value: "AI agent capability runtime" },
      { label: "Primary interface", value: "CLI + skill files" },
      { label: "Public repo history", value: "Since March 2026" },
      { label: "Shipping surfaces", value: "CLI, web app, edge delivery, skill distribution" },
      { label: "Official repository", value: "github.com/anycap-ai/anycap" },
      { label: "License", value: "MIT" },
      { label: "Last updated", value: "2026-04-15" },
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
        label: "GitHub organization",
        href: "https://github.com/anycap-ai",
        detail: "Primary organization profile for repositories, releases, and public issue tracking.",
      },
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
        href: "/start",
        detail: "The shortest path from evaluation to a working local setup.",
      },
      {
        label: "Pricing",
        href: "/pricing",
        detail: "Public explanation of credit packs and pay-as-you-go positioning.",
      },
    ],
    whatIsTitle: "What AnyCap is",
    whatIsBody1:
      "AnyCap is an agent-native capability runtime that gives AI agents a consistent way to install, authenticate, and execute capabilities that do not belong inside base model reasoning. Instead of wiring a different SDK and credential flow for every missing capability, teams can expose one stable execution surface to the agent. That surface is intentionally practical: the same runtime works for setup, invocation, and handoff, so operators can trace what happened when workflows succeed or fail.",
    whatIsBody2:
      "We focus on the capability layer because this is where production workflows usually break. The agent may decide what to do correctly, but still fail when it needs to render an image, generate a video, inspect a screenshot, or move outputs between tools through one reliable interface. AnyCap turns those fragmented steps into a coherent runtime path. Teams can evaluate workflows end to end with fewer hidden dependencies, fewer one-off adapters, and a clearer operating model for shipping multimodal work.",
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
    faqTitle: "FAQ",
    faqItems: [...aboutFaqItemsEn],
    faqJsonLd: createFaqPageJsonLd(aboutFaqItemsEn),
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
      "@id": getLocalizedRouteUrl("en", "/about"),
      name: "About AnyCap",
      description:
        `About page for AnyCap, an AI agent capability runtime that adds ${capabilitySummary} through one interface.`,
      url: getLocalizedRouteUrl("en", "/about"),
      inLanguage: "en",
      isPartOf: {
        "@id": `${siteConfig.url}#website`,
      },
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
            url: getLocalizedRouteUrl("en", "/contact"),
          },
        ],
      },
    },
    organizationJsonLd: {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": organizationId,
      name: siteConfig.siteName,
      url: siteConfig.url,
      sameAs: organizationSameAs,
      logo: {
        "@type": "ImageObject",
        url: `${siteConfig.url}/anycap-mark.svg`,
      },
      description:
        `AnyCap builds agent-native capability infrastructure that lets AI agents use ${capabilitySummary} through one runtime.`,
      contactPoint: [
        {
          "@type": "ContactPoint",
          contactType: "customer support",
          url: getLocalizedRouteUrl("en", "/contact"),
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
    heroIntro: `O AnyCap foca na camada de execucao entre um agente de raciocinio e as capabilities necessarias para concluir trabalho real: ${capabilitySummary}. Muitos agentes planejam e codam bem, mas ainda quebram quando um fluxo cruza geracao de midia, analise visual e handoff entre etapas. A proposta e direta: mantenha o agente que voce ja usa e adicione um runtime de capabilities ao redor dele para estabilizar instalacao, auth e execucao. Assim, o time ganha uma superficie previsivel em vez de cola especifica por provedor, enquanto ${roadmapCapabilitySummary} avancam do roadmap para uso pratico.`,
    companyFactsTitle: "Fatos da empresa",
    companyFacts: [
      { label: "Empresa", value: "AnyCap" },
      { label: "Produto", value: "Runtime de capacidades para agentes de IA" },
      { label: "Interface principal", value: "CLI + arquivos de skill" },
      { label: "Histórico público do repositório", value: "Desde março de 2026" },
      { label: "Superfícies de entrega", value: "CLI, app web, edge delivery, distribuição de skills" },
      { label: "Repositório oficial", value: "github.com/anycap-ai/anycap" },
      { label: "Licença", value: "MIT" },
      { label: "Atualizado em", value: "2026-04-15" },
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
        label: "Organização no GitHub",
        href: "https://github.com/anycap-ai",
        detail: "Perfil principal da organização com repositórios, releases e trilhas públicas de issues.",
      },
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
        href: "/start",
        detail: "O caminho mais curto da avaliação até um setup local funcionando.",
      },
      {
        label: "Preços",
        href: "/pricing",
        detail: "Explicação pública do posicionamento com pacotes de crédito e pay-as-you-go.",
      },
    ],
    whatIsTitle: "O que o AnyCap é",
    whatIsBody1:
      "O AnyCap e um runtime de capabilities nativo para agentes que oferece um caminho consistente para instalar, autenticar e executar recursos que nao pertencem ao modelo base de raciocinio. Em vez de conectar um SDK e um fluxo de credencial diferente para cada capability faltante, o time expoe uma unica superficie de execucao ao agente. Essa superficie foi desenhada para operacao real: setup, invocacao e handoff no mesmo runtime, com trilhas de verificacao quando um workflow acerta ou falha.",
    whatIsBody2:
      "A gente prioriza a camada de capabilities porque e nela que workflows reais costumam quebrar. O agente pode decidir corretamente o que fazer, mas ainda falhar ao renderizar imagem, gerar video, inspecionar screenshot ou mover resultados entre ferramentas por uma interface estavel. O AnyCap transforma esses passos fragmentados em um caminho unico de runtime. Isso reduz adaptadores one-off, encurta o tempo de setup e deixa mais claro como operar fluxos multimodais com previsibilidade.",
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
    faqTitle: "FAQ",
    faqItems: [...aboutFaqItemsPtBr],
    faqJsonLd: createFaqPageJsonLd(aboutFaqItemsPtBr),
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
      "@id": getLocalizedRouteUrl("pt-br", "/about"),
      name: "Sobre o AnyCap",
      description:
        `Página sobre o AnyCap, um runtime de capacidades para agentes de IA que adiciona ${capabilitySummary} por meio de uma única interface.`,
      url: getLocalizedRouteUrl("pt-br", "/about"),
      inLanguage: "pt-BR",
      isPartOf: {
        "@id": `${siteConfig.url}#website`,
      },
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
            url: getLocalizedRouteUrl("pt-br", "/contact"),
          },
        ],
      },
    },
    organizationJsonLd: {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": organizationId,
      name: siteConfig.siteName,
      url: siteConfig.url,
      sameAs: organizationSameAs,
      logo: {
        "@type": "ImageObject",
        url: `${siteConfig.url}/anycap-mark.svg`,
      },
      description:
        `O AnyCap constrói infraestrutura de capacidades nativa para agentes que permite que agentes de IA usem ${capabilitySummary} por meio de um único runtime.`,
      contactPoint: [
        {
          "@type": "ContactPoint",
          contactType: "customer support",
          url: getLocalizedRouteUrl("pt-br", "/contact"),
        },
      ],
    },
  },
  id: {} as AboutPageData,
  de: {} as AboutPageData,
};

const aboutFaqItemsId = [
  {
    question: "Apa yang ditambahkan AnyCap kalau agen saya sudah bisa menulis kode?",
    answer:
      "Code generation menyelesaikan perencanaan dan implementasi, tapi banyak workflow produksi tetap gagal di sisi eksekusi capability. Sebuah agen bisa menghasilkan kode yang benar dan tetap gagal saat harus merender gambar, membuat video, memeriksa output visual, atau memindahkan artifact antar tool dengan autentikasi yang stabil. AnyCap menambahkan lapisan eksekusi yang hilang itu lewat satu jalur instalasi, satu alur auth, dan satu command surface. Tim tetap memakai agen yang sudah mereka percaya, sambil mengurangi glue code khusus per provider. Hasilnya, waktu setup turun, integrasi yang rapuh berkurang, dan workflow multimodal tetap reproducible di berbagai environment.",
  },
  {
    question: "AnyCap itu agent framework atau runtime di sekitar agen yang sudah ada?",
    answer:
      "AnyCap adalah runtime di sekitar agen yang sudah ada, bukan framework pengganti. Anda tetap memakai Claude Code, Cursor, Codex, atau planning layer lain untuk reasoning dan task decomposition. AnyCap fokus pada capability di luar reasoning model dasar, seperti pembuatan media dan analisis multimodal. Pemisahan ini membuat tanggung jawab tetap jelas: agen memutuskan apa yang harus dilakukan, dan AnyCap menyediakan jalur stabil untuk mengeksekusi keputusan itu lewat capability. Hasilnya arsitektur yang lebih bersih — tim bisa upgrade model, prompt, atau provider tanpa menulis ulang setiap integrasi dari nol.",
  },
  {
    question: "Bagaimana sebaiknya tim mengevaluasi AnyCap sebelum dipakai di produksi?",
    answer:
      "Mulai dari satu workflow nyata yang saat ini patah karena setup capability-nya terpotong-potong. Install AnyCap lewat panduan publik, jalankan auth sekali, lalu eksekusi workflow yang sama dari ujung ke ujung lewat CLI. Bandingkan tiga hal: waktu setup, jenis kegagalan, dan reproducibility antar anggota tim. Selama evaluasi, simpan log request, error, dan screenshot supaya tim bisa meninjau bagian mana yang dipermudah runtime dan bagian mana yang masih kurang. Pilot yang baik biasanya kecil tapi representatif: satu agen, satu rangkaian capability, satu output yang bisa diukur. Kalau jalur itu jadi predictable, keputusan rollout jadi jauh lebih jelas.",
  },
];

contentByLocale.id = {
  metadata: {
    title: "Tentang AnyCap - Infrastruktur capability untuk agen AI",
    description:
      `Tentang AnyCap, tim yang membangun runtime capability untuk agen AI dengan repository publik, riwayat release, dan jalur instalasi untuk ${capabilitySummary}.`,
    openGraphTitle: "Tentang AnyCap - Infrastruktur capability untuk agen AI",
    openGraphDescription:
      "Mengapa AnyCap ada, apa yang AnyCap lakukan, apa yang bukan ranahnya, dan prinsip di balik runtime capability yang agent-native.",
  },
  breadcrumbItems: [
    { name: "Beranda", href: "/" },
    { name: "Tentang", href: "/about" },
  ],
  eyebrow: "Tentang",
  heroTitle: ["AnyCap membangun infrastruktur", "capability untuk agen."],
  heroIntro: `AnyCap fokus pada lapisan eksekusi antara agen reasoning dan capability yang dibutuhkan untuk menyelesaikan kerja nyata: ${capabilitySummary}. Kebanyakan agen sudah bisa merencanakan dan menulis, tapi tetap patah saat workflow menyentuh pembuatan media, inspeksi visual, atau handoff capability multi-langkah. Pendekatannya sederhana: tetap pakai agen yang sudah Anda percaya, lalu tambahkan satu runtime capability di sekitarnya supaya install, auth, dan perilaku command tetap predictable lintas tugas. Tim mendapat surface integrasi yang stabil, bukan glue code khusus per provider, dan tetap punya ruang untuk berkembang seiring ${roadmapCapabilitySummary} pindah dari roadmap ke produksi.`,
  companyFactsTitle: "Fakta perusahaan",
  companyFacts: [
    { label: "Perusahaan", value: "AnyCap" },
    { label: "Produk", value: "Runtime capability untuk agen AI" },
    { label: "Antarmuka utama", value: "CLI + skill files" },
    { label: "Riwayat repo publik", value: "Sejak Maret 2026" },
    { label: "Surface pengiriman", value: "CLI, web app, edge delivery, distribusi skill" },
    { label: "Repository resmi", value: "github.com/anycap-ai/anycap" },
    { label: "Lisensi", value: "MIT" },
    { label: "Terakhir diperbarui", value: "2026-04-15" },
  ],
  teamTitle: "Cara tim mengirim",
  teamCards: [
    {
      title: "Produk dan engineering",
      body:
        "AnyCap dikirim sebagai satu surface produk lintas CLI, situs publik, dashboard, dan lapisan edge delivery. Itu bikin runtime, dokumentasi, dan jalur distribusi bisa diverifikasi langsung apakah benar-benar nyambung.",
    },
    {
      title: "Distribusi dan release",
      body:
        "Repository publik mendokumentasikan release GitHub, packaging npm, sinkronisasi skill, dan deploy Cloudflare Pages. Jalur pengirimannya terlihat — bukan disembunyikan di balik halaman peluncuran tertutup.",
    },
    {
      title: "Feedback dan iterasi",
      body:
        "Operator bisa melaporkan masalah lewat GitHub dan lewat alur `anycap feedback` bawaan. Itu bikin ada jalur nyata dari request yang gagal atau capability yang kurang kembali ke tim.",
    },
  ],
  timelineTitle: "Timeline pembangunan publik",
  timelineItems: [
    {
      label: "Maret 2026",
      detail:
        "Riwayat repository publik saat ini dimulai, dengan CLI, server, fondasi dashboard, dan situs semuanya dikirim dari codebase yang sama.",
    },
    {
      label: "Awal April 2026",
      detail:
        "Penyelarasan inventaris capability, halaman compare, dan konten SEO berbasis workflow diperluas supaya pembeli bisa mengevaluasi produk lewat use case konkret, bukan sekadar copy brand.",
    },
    {
      label: "Model operasi saat ini",
      detail:
        "AnyCap dikembangkan sebagai produk agent-first dengan satu runtime, satu jalur instalasi, satu alur auth, dan dokumentasi publik untuk release, panduan, serta skill.",
    },
  ],
  referencesTitle: "Referensi publik",
  publicReferences: [
    {
      label: "Organisasi GitHub",
      href: "https://github.com/anycap-ai",
      detail: "Profil organisasi utama untuk repository, release, dan issue tracking publik.",
    },
    {
      label: "Repository GitHub",
      href: "https://github.com/anycap-ai/anycap",
      detail: "Codebase publik utama untuk runtime, situs, dan skill files.",
    },
    {
      label: "Release GitHub",
      href: "https://github.com/anycap-ai/anycap/releases",
      detail: "Artifact release publik dan catatan versi CLI yang sudah dirilis.",
    },
    {
      label: "Listing skills.sh",
      href: "https://skills.sh/anycap-ai/anycap",
      detail: "Surface distribusi skill publik untuk install di agen.",
    },
    {
      label: "Panduan instalasi",
      href: "/start",
      detail: "Jalur paling singkat dari evaluasi sampai setup lokal yang berfungsi.",
    },
    {
      label: "Harga",
      href: "/pricing",
      detail: "Penjelasan publik soal paket kredit dan positioning pay-as-you-go.",
    },
  ],
  whatIsTitle: "Apa itu AnyCap",
  whatIsBody1:
    "AnyCap adalah runtime capability yang agent-native, memberi agen AI cara konsisten untuk install, autentikasi, dan eksekusi capability yang tidak masuk ke reasoning model dasar. Daripada menyambungkan SDK dan alur kredensial yang berbeda untuk setiap capability yang hilang, tim cukup memaparkan satu surface eksekusi yang stabil ke agen. Surface itu dibuat untuk operasi nyata: setup, invocation, dan handoff jalan di runtime yang sama, jadi operator bisa menelusuri apa yang terjadi saat workflow berhasil maupun gagal.",
  whatIsBody2:
    "Kami fokus di lapisan capability karena di situlah workflow produksi biasanya patah. Agen mungkin memutuskan dengan benar apa yang harus dilakukan, tapi tetap gagal saat harus merender gambar, membuat video, memeriksa screenshot, atau memindahkan output antar tool lewat satu antarmuka yang reliable. AnyCap mengubah langkah-langkah yang terpotong itu jadi satu jalur runtime yang utuh. Tim bisa mengevaluasi workflow ujung ke ujung dengan dependency tersembunyi yang lebih sedikit, adapter one-off yang lebih sedikit, dan model operasi yang lebih jelas untuk mengirim kerja multimodal.",
  whyTitle: "Mengapa AnyCap ada",
  whyCards: [
    {
      title: "Reasoning saja tidak cukup",
      body:
        "Agen modern bisa merencanakan dan ngoding, tapi tetap gagal begitu workflow butuh image generation, video generation, atau lapisan vision yang konsisten.",
    },
    {
      title: "Tooling-nya terlalu terpotong",
      body:
        "Setiap capability yang hilang biasanya berarti SDK lain, alur auth lain, integrasi spesifik provider lain, dan satu cara baru lagi buat agen gagal.",
    },
    {
      title: "Agen pantas dapat produk first-class",
      body:
        "Kami percaya lapisan capability seharusnya dibangun untuk agen sejak awal — bukan diadaptasi dari dashboard manusia atau dijahit setelah faktanya.",
    },
  ],
  notTitle: "Apa yang bukan AnyCap",
  notCards: [
    {
      title: "Bukan produk dashboard untuk manusia",
      body:
        "AnyCap tidak dirancang buat klik-klik di panel admin. Antarmuka utamanya adalah runtime, CLI, dan jalur instalasi yang benar-benar bisa dipakai agen.",
    },
    {
      title: "Bukan glue code antar provider",
      body:
        "Kami tidak mengoptimalkan integrasi one-off per vendor model. Targetnya adalah satu surface capability yang tetap konsisten lintas provider.",
    },
    {
      title: "Bukan pengganti agen Anda",
      body:
        "Anda tetap pakai Claude Code, Cursor, Codex, atau agen lain. AnyCap ada untuk menambahkan lapisan capability yang masih mereka butuhkan.",
    },
  ],
  principlesTitle: "Prinsip di balik produk",
  principles: [
    "Satu jalur instalasi, bukan satu install per provider",
    "Satu alur auth, bukan kredensial yang terpotong-potong di seluruh stack",
    "Satu command surface, bukan antarmuka spesifik per capability",
    "Dibangun untuk agen lebih dulu, lalu dibikin bisa dipahami manusia",
  ],
  faqTitle: "FAQ",
  faqItems: [...aboutFaqItemsId],
  faqJsonLd: createFaqPageJsonLd(aboutFaqItemsId),
  contactTitle: "Jalur kontak dan pelaporan",
  contactPaths: [
    {
      label: "Issue GitHub",
      href: "https://github.com/anycap-ai/anycap/issues",
      detail: "Jalur publik terbaik untuk laporan bug, regresi, atau permintaan roadmap.",
    },
    {
      label: "Command feedback CLI",
      href: "/cli",
      detail: "Pakai `anycap feedback` saat masalahnya datang dari request yang sedang berjalan atau capability yang kurang.",
    },
    {
      label: "Mulai dari sini",
      href: "/start",
      detail: "Langkah berikut yang paling tepat kalau tujuannya verifikasi runtime langsung.",
    },
  ],
  trustTitle: "Sinyal kepercayaan",
  trustSignals: [
    {
      label: "Distribusi terbuka",
      detail: "Skill files, artifact release, dan codebase utama dipublikasikan lewat jalur GitHub publik.",
    },
    {
      label: "Runtime portabel",
      detail: "Lapisan capability yang sama dirancang untuk jalan di Claude Code, Cursor, Codex, dan produk agen sejenis.",
    },
    {
      label: "Model capability yang eksplisit",
      detail: "Kami memisahkan runtime, CLI, skill file, dan capability supaya tim bisa berpikir jernih soal stack-nya.",
    },
  ],
  aboutPageJsonLd: {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "@id": getLocalizedRouteUrl("id", "/about"),
    name: "Tentang AnyCap",
    description:
      `Halaman tentang AnyCap, runtime capability untuk agen AI yang menambahkan ${capabilitySummary} lewat satu antarmuka.`,
    url: getLocalizedRouteUrl("id", "/about"),
    inLanguage: "id",
    isPartOf: {
      "@id": `${siteConfig.url}#website`,
    },
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
          url: getLocalizedRouteUrl("id", "/contact"),
        },
      ],
    },
  },
  organizationJsonLd: {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": organizationId,
    name: siteConfig.siteName,
    url: siteConfig.url,
    sameAs: organizationSameAs,
    logo: {
      "@type": "ImageObject",
      url: `${siteConfig.url}/anycap-mark.svg`,
    },
    description:
      `AnyCap membangun infrastruktur capability yang agent-native sehingga agen AI bisa memakai ${capabilitySummary} lewat satu runtime.`,
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        url: getLocalizedRouteUrl("id", "/contact"),
      },
    ],
  },
};

const aboutFaqItemsDe = [
  {
    question: "Was bringt AnyCap, wenn mein Agent bereits Code schreibt?",
    answer:
      "Code-Generierung löst Planung und Implementierung, aber viele produktive Workflows scheitern weiterhin an der Capability-Ausführung. Ein Agent kann korrekten Code produzieren und trotzdem fehlschlagen, wenn er Bilder rendern, Videos generieren, visuelle Ergebnisse prüfen oder Artefakte mit stabiler Authentifizierung zwischen Tools verschieben muss. AnyCap ergänzt diese fehlende Ausführungsschicht mit einem Installationspfad, einem Auth-Flow und einer Command-Surface. Teams behalten den Agent, dem sie bereits vertrauen, und reduzieren gleichzeitig provider-spezifischen Glue-Code. In der Praxis senkt das die Setup-Zeit, reduziert brüchige Integrationen und hält multimodale Workflows reproduzierbar über Umgebungen hinweg.",
  },
  {
    question: "Ist AnyCap ein Agent-Framework oder ein Runtime um bestehende Agents?",
    answer:
      "AnyCap ist ein Runtime um bestehende Agents, kein ersetzendes Framework. Sie nutzen weiterhin Claude Code, Cursor, Codex oder eine andere Planungsschicht für Reasoning und Aufgabenzerlegung. AnyCap konzentriert sich auf Capabilities, die außerhalb des Reasonings des Basismodells liegen, etwa Mediengenerierung und multimodale Analyse. Diese Trennung hält die Verantwortlichkeiten klar: Der Agent entscheidet, was zu tun ist, und AnyCap bietet einen stabilen Weg, diese Entscheidung über Capabilities auszuführen. Das Ergebnis ist eine sauberere Architektur, in der Teams Modelle, Prompts oder Provider aktualisieren können, ohne jede Integration von Grund auf neu zu schreiben.",
  },
  {
    question: "Wie sollten Teams AnyCap vor dem Produktiv-Rollout evaluieren?",
    answer:
      "Beginnen Sie mit einem realen Workflow, der aktuell scheitert, weil das Capability-Setup fragmentiert ist. Installieren Sie AnyCap über den öffentlichen Guide, führen Sie die Authentifizierung einmalig durch und führen Sie denselben Workflow Ende-zu-Ende über die CLI aus. Vergleichen Sie drei Dinge: Setup-Zeit, Fehlerbilder und Reproduzierbarkeit zwischen Teammitgliedern. Halten Sie während der Evaluierung Request-Logs, Fehler und Screenshots fest, damit das Team prüfen kann, wo der Runtime Reibung beseitigt hat und wo Lücken bleiben. Ein guter Pilot ist meist klein, aber repräsentativ: ein Agent, eine Capability-Kette, ein messbares Ergebnis. Wenn dieser Pfad vorhersehbar wird, werden Rollout-Entscheidungen deutlich klarer.",
  },
];

contentByLocale.de = {
    metadata: {
      title: "Über AnyCap - Capability-Infrastruktur für KI-Agents",
      description:
        `Über AnyCap, das Team hinter einem Capability-Runtime für KI-Agents mit öffentlichem Repository, Release-Historie und einem Installationspfad für ${capabilitySummary}.`,
      openGraphTitle: "Über AnyCap - Capability-Infrastruktur für KI-Agents",
      openGraphDescription:
        "Warum AnyCap existiert, was es ist, was es nicht ist und welche Prinzipien hinter einem agent-nativen Capability-Runtime stehen.",
    },
    breadcrumbItems: [
      { name: "Startseite", href: "/" },
      { name: "Über uns", href: "/about" },
    ],
    eyebrow: "Über uns",
    heroTitle: ["AnyCap baut Capability-", "Infrastruktur für Agents."],
    heroIntro: `AnyCap konzentriert sich auf die Ausführungsschicht zwischen einem Reasoning-Agent und den Capabilities, die zur Erledigung echter Arbeit nötig sind: ${capabilitySummary}. Die meisten Agents können planen und schreiben, scheitern aber weiterhin, wenn ein Workflow Mediengenerierung, visuelle Inspektion oder mehrstufige Capability-Übergaben kreuzt. Unser Ansatz ist einfach: Behalten Sie den Agent, dem Sie bereits vertrauen, und ergänzen Sie ihn um einen Capability-Runtime, sodass Installation, Authentifizierung und Command-Verhalten über Aufgaben hinweg vorhersehbar bleiben. Das gibt Teams eine stabile Integrations-Surface statt provider-spezifischen Glue-Codes und lässt Raum für Erweiterungen, während ${roadmapCapabilitySummary} von der Roadmap in die Produktion wandern.`,
    companyFactsTitle: "Unternehmensfakten",
    companyFacts: [
      { label: "Unternehmen", value: "AnyCap" },
      { label: "Produkt", value: "Capability-Runtime für KI-Agents" },
      { label: "Primäre Schnittstelle", value: "CLI + Skill-Dateien" },
      { label: "Öffentliche Repo-Historie", value: "Seit März 2026" },
      { label: "Auslieferungs-Surfaces", value: "CLI, Web-App, Edge-Delivery, Skill-Distribution" },
      { label: "Offizielles Repository", value: "github.com/anycap-ai/anycap" },
      { label: "Lizenz", value: "MIT" },
      { label: "Zuletzt aktualisiert", value: "2026-04-15" },
    ],
    teamTitle: "Wie das Team ausliefert",
    teamCards: [
      {
        title: "Produkt und Engineering",
        body:
          "AnyCap wird als eine Produkt-Surface über CLI, öffentliche Website, Dashboard und Edge-Delivery-Schicht ausgeliefert. Das macht es möglich zu prüfen, wie Runtime, Docs und Distributionspfad zusammenspielen.",
      },
      {
        title: "Distribution und Releases",
        body:
          "Das öffentliche Repository dokumentiert GitHub-Releases, npm-Packaging, Skill-Sync und das Cloudflare-Pages-Deployment. Der Auslieferungspfad ist sichtbar statt hinter einer geschlossenen Launch-Page versteckt.",
      },
      {
        title: "Feedback und Iteration",
        body:
          "Operatoren können Probleme über GitHub und über den eingebauten `anycap feedback`-Flow melden. Das schafft einen echten Pfad von fehlgeschlagenen Requests oder fehlenden Capabilities zurück zum Team.",
      },
    ],
    timelineTitle: "Öffentliche Build-Timeline",
    timelineItems: [
      {
        label: "März 2026",
        detail:
          "Die aktuelle öffentliche Repository-Historie beginnt, mit CLI, Server, Dashboard-Foundations und Website, die alle aus derselben Codebase ausgeliefert werden.",
      },
      {
        label: "Anfang April 2026",
        detail:
          "Capability-Inventar-Abgleich, Compare-Pages und workflow-getriebener SEO-Content wurden erweitert, damit Käufer das Produkt anhand konkreter Use Cases und nicht nur über Markencopy bewerten können.",
      },
      {
        label: "Aktuelles Operating-Modell",
        detail:
          "AnyCap wird als agent-first Produkt mit einem Runtime, einem Installationspfad, einem Auth-Flow und öffentlicher Dokumentation zu Releases, Guides und Skills entwickelt.",
      },
    ],
    referencesTitle: "Öffentliche Referenzen",
    publicReferences: [
      {
        label: "GitHub-Organisation",
        href: "https://github.com/anycap-ai",
        detail: "Primäres Organisationsprofil für Repositories, Releases und öffentliches Issue-Tracking.",
      },
      {
        label: "GitHub-Repository",
        href: "https://github.com/anycap-ai/anycap",
        detail: "Primäre öffentliche Codebase für Runtime, Website und Skill-Dateien.",
      },
      {
        label: "GitHub-Releases",
        href: "https://github.com/anycap-ai/anycap/releases",
        detail: "Öffentliche Release-Artefakte und Notes für ausgelieferte CLI-Versionen.",
      },
      {
        label: "skills.sh-Listing",
        href: "https://skills.sh/anycap-ai/anycap",
        detail: "Öffentliche Skill-Distribution-Surface für Agent-Installationen.",
      },
      {
        label: "Installations-Guide",
        href: "/start",
        detail: "Der kürzeste Pfad von der Evaluierung zu einem funktionierenden lokalen Setup.",
      },
      {
        label: "Preise",
        href: "/pricing",
        detail: "Öffentliche Erläuterung von Credit-Paketen und Pay-as-you-go-Positioning.",
      },
    ],
    whatIsTitle: "Was AnyCap ist",
    whatIsBody1:
      "AnyCap ist ein agent-nativer Capability-Runtime, der KI-Agents einen konsistenten Weg bietet, Capabilities zu installieren, zu authentifizieren und auszuführen, die nicht in das Reasoning des Basismodells gehören. Statt für jede fehlende Capability einen anderen SDK und Credential-Flow zu verdrahten, exponieren Teams eine stabile Ausführungs-Surface gegenüber dem Agent. Diese Surface ist bewusst praxisnah: Derselbe Runtime funktioniert für Setup, Aufruf und Übergabe, sodass Operatoren nachvollziehen können, was passiert ist, wenn Workflows erfolgreich sind oder fehlschlagen.",
    whatIsBody2:
      "Wir konzentrieren uns auf die Capability-Schicht, weil hier produktive Workflows üblicherweise scheitern. Der Agent entscheidet möglicherweise korrekt, was zu tun ist, scheitert aber dennoch, wenn er ein Bild rendern, ein Video generieren, einen Screenshot inspizieren oder Outputs zwischen Tools über eine zuverlässige Schnittstelle bewegen muss. AnyCap verwandelt diese fragmentierten Schritte in einen kohärenten Runtime-Pfad. Teams können Workflows Ende-zu-Ende mit weniger versteckten Abhängigkeiten, weniger Einmal-Adaptern und einem klareren Operating-Modell für die Auslieferung multimodaler Arbeit evaluieren.",
    whyTitle: "Warum es existiert",
    whyCards: [
      {
        title: "Reasoning reicht nicht",
        body:
          "Moderne Agents können planen und coden, scheitern aber genau in dem Moment, in dem ein Workflow Bildgenerierung, Videogenerierung oder eine konsistente Vision-Schicht braucht.",
      },
      {
        title: "Tooling ist zu fragmentiert",
        body:
          "Jede fehlende Capability bedeutet meist einen weiteren SDK, einen weiteren Auth-Flow, eine weitere provider-spezifische Integration und einen weiteren Weg, auf dem der Agent scheitern kann.",
      },
      {
        title: "Agents verdienen First-Class-Produkte",
        body:
          "Wir denken, dass die Capability-Schicht von Anfang an für Agents gebaut werden sollte, nicht aus menschlichen Dashboards adaptiert oder im Nachhinein zusammengesetzt.",
      },
    ],
    notTitle: "Was AnyCap nicht ist",
    notCards: [
      {
        title: "Kein Dashboard-Produkt für Menschen",
        body:
          "AnyCap ist nicht darauf ausgelegt, sich durch Admin-Panels zu klicken. Die primäre Schnittstelle ist der Runtime, die CLI und der Installationspfad, den der Agent tatsächlich nutzen kann.",
      },
      {
        title: "Kein Provider-Glue-Code",
        body:
          "Wir optimieren nicht für individuelle Einmal-Integrationen pro Modellanbieter. Das Ziel ist eine Capability-Surface, die über Provider hinweg konsistent bleibt.",
      },
      {
        title: "Kein Ersatz für Ihren Agent",
        body:
          "Sie behalten Claude Code, Cursor, Codex oder einen anderen Agent. AnyCap existiert, um die Capability-Schicht zu ergänzen, die diese weiterhin brauchen.",
      },
    ],
    principlesTitle: "Prinzipien hinter dem Produkt",
    principles: [
      "Ein Installationspfad statt einer Installation pro Provider",
      "Ein Auth-Flow statt fragmentierter Credentials über den Stack",
      "Eine Command-Surface statt capability-spezifischer Schnittstellen",
      "Zuerst für Agents gebaut, dann für Menschen verständlich gemacht",
    ],
    faqTitle: "FAQ",
    faqItems: [...aboutFaqItemsDe],
    faqJsonLd: createFaqPageJsonLd(aboutFaqItemsDe),
    contactTitle: "Kontakt- und Reporting-Pfade",
    contactPaths: [
      {
        label: "GitHub-Issues",
        href: "https://github.com/anycap-ai/anycap/issues",
        detail: "Bester öffentlicher Pfad für Bug-Reports, Regressionen oder Roadmap-Wünsche.",
      },
      {
        label: "CLI-Feedback-Command",
        href: "/cli",
        detail: "Nutzen Sie `anycap feedback`, wenn das Problem aus einem Live-Request oder einer Capability-Lücke stammt.",
      },
      {
        label: "Hier starten",
        href: "/start",
        detail: "Bester nächster Schritt, wenn das Ziel ist, den Runtime direkt zu verifizieren.",
      },
    ],
    trustTitle: "Vertrauenssignale",
    trustSignals: [
      {
        label: "Offene Distribution",
        detail: "Skill-Dateien, Release-Artefakte und die Haupt-Codebase werden über öffentliche GitHub-Pfade veröffentlicht.",
      },
      {
        label: "Portabler Runtime",
        detail: "Dieselbe Capability-Schicht ist darauf ausgelegt, über Claude Code, Cursor, Codex und benachbarte Agent-Produkte zu funktionieren.",
      },
      {
        label: "Explizites Capability-Modell",
        detail: "Wir trennen Runtime, CLI, Skill-Datei und Capabilities, damit Teams klar über den Stack räsonieren können.",
      },
    ],
    aboutPageJsonLd: {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      "@id": getLocalizedRouteUrl("de", "/about"),
      name: "Über AnyCap",
      description:
        `Über-Seite für AnyCap, einen Capability-Runtime für KI-Agents, der ${capabilitySummary} über eine Schnittstelle ergänzt.`,
      url: getLocalizedRouteUrl("de", "/about"),
      inLanguage: "de",
      isPartOf: {
        "@id": `${siteConfig.url}#website`,
      },
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
            url: getLocalizedRouteUrl("de", "/contact"),
          },
        ],
      },
    },
    organizationJsonLd: {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": organizationId,
      name: siteConfig.siteName,
      url: siteConfig.url,
      sameAs: organizationSameAs,
      logo: {
        "@type": "ImageObject",
        url: `${siteConfig.url}/anycap-mark.svg`,
      },
      description:
        `AnyCap baut agent-native Capability-Infrastruktur, die es KI-Agents erlaubt, ${capabilitySummary} über einen Runtime zu nutzen.`,
      contactPoint: [
        {
          "@type": "ContactPoint",
          contactType: "customer support",
          url: getLocalizedRouteUrl("de", "/contact"),
        },
      ],
    },
};

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
