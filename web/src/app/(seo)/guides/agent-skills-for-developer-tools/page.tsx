import type { Metadata } from "next";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { EarlyAccessBanner } from "@/components/landing/EarlyAccessBanner";
import { FadeIn } from "@/components/ui/FadeIn";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { ArticleByline } from "@/components/seo/ArticleByline";
import { createFaqPageJsonLd, createTechArticleJsonLd, hasJsonLdContent } from "@/lib/schema";
import { getSeoPageChrome } from "@/lib/seo/ia";
import { getPageMetadata } from "./metadata";
import { getRequestLocale } from "@/lib/request-locale";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

const agentTargets = ["Claude Code", "Cursor", "Codex", "OpenCode", "OpenClaw"];

const pageChrome = getSeoPageChrome("/guides/agent-skills-for-developer-tools");

type PageContent = {
  breadcrumbItems: { name: string; href?: string }[];
  authorLabel: string;
  eyebrow: string;
  title: [string, string];
  intro: string[];
  whyTitle: string;
  whyCards: { title: string; body: string }[];
  whatTitle: string;
  whatBody: string[];
  anatomyTitle: string;
  anatomyItems: { title: string; body: string }[];
  fitTitle: string;
  fitCards: { title: string; body: string }[];
  compareTitle: string;
  compareHeaders: { topic: string; skills: string; native: string; mcp: string };
  compareRows: { label: string; skills: string; native: string; mcp: string }[];
  workflowTitle: string;
  workflowBody: string[];
  examplesTitle: string;
  examples: { title: string; body: string }[];
  faqTitle: string;
  patternTitle: string;
  installLabel: string;
  switchLabel: string;
  patternBody: string;
  ctas: {
    install: string;
    claude: string;
    codex: string;
  };
};

const contentByLocale: Record<"en" | "pt-br" | "id", PageContent> = {
  en: {
    breadcrumbItems: pageChrome?.breadcrumbItems ?? [
      { name: "Home", href: "/" },
      { name: "Guides", href: "/guides" },
      { name: "Agent skills for developer tools" },
    ],
    authorLabel: pageChrome?.authorLabel ?? "By AnyCap Team",
    eyebrow: pageChrome?.eyebrow ?? "Guide",
    title: ["Agent skills", "for developer tools"],
    intro: [
      "Agent skills are instruction files that teach an AI agent how to discover, install, authenticate, and invoke a capability. They matter because developer agents do not just need tools. They need a reliable description of how to use those tools inside the execution environment.",
      "A good skill closes the gap between capability availability and capability usage. Instead of forcing the agent to infer commands from scattered documentation, the skill tells it what the capability does, when to call it, what arguments to pass, and what setup has to happen first.",
      "That is why AnyCap uses skills as a distribution layer across Claude Code, Cursor, Codex, and similar products. One capability runtime can be installed once, then exposed consistently to multiple developer agents through product-specific skill files.",
    ],
    whyTitle: "Why skills matter",
    whyCards: [
      {
        title: "Clear discovery",
        body: "The agent can tell a capability exists without reverse-engineering a product-specific docs page or guessing from package names.",
      },
      {
        title: "Repeatable setup",
        body: "Installation and auth stay in one file, so the workflow remains stable across machines, repos, and agent products.",
      },
      {
        title: "Safer invocation",
        body: "Examples show the agent when to call the capability, what command shape to reuse, and which prompts or flags are expected.",
      },
    ],
    whatTitle: "What a skill actually does",
    whatBody: [
      "A skill is not only metadata. It gives the agent a working model of how a capability fits into its workflow. That usually includes installation steps, authentication, command examples, trigger situations, input constraints, and the expected output shape.",
      "This matters because modern coding agents are good at reasoning, but they still need operational scaffolding. When a capability is described only in prose documentation, agents often miss edge cases, skip auth, or choose the wrong command. Skills reduce that failure rate by making the intended workflow explicit.",
      "For AnyCap, that means the same multimodal runtime can be reused for image generation, video generation, music, or vision tasks while each agent product gets the instructions it needs in the format it already understands.",
    ],
    anatomyTitle: "What a useful skill file contains",
    anatomyItems: [
      {
        title: "Capability summary",
        body: "A short explanation of what the capability does, the outcomes it enables, and the request patterns that should trigger it.",
      },
      {
        title: "Install and auth steps",
        body: "Commands for installation, one-time authentication, environment requirements, and any account prerequisites.",
      },
      {
        title: "Invocation examples",
        body: "Concrete commands the agent can copy or adapt, including model names, flags, URL handling, and common prompt structures.",
      },
      {
        title: "Decision rules",
        body: "Guidance for when to use the capability instead of staying in text, when to ask for clarification, and when not to call it.",
      },
    ],
    fitTitle: "Where skills fit",
    fitCards: [
      {
        title: "Discovery",
        body: "The agent learns that a capability exists and what outcomes it enables for coding, design, and research workflows.",
      },
      {
        title: "Installation",
        body: "The skill explains how to install the runtime, how authentication works, and which dependencies must exist first.",
      },
      {
        title: "Invocation",
        body: "The agent sees examples and usage patterns it can reuse during execution instead of inventing command syntax.",
      },
    ],
    compareTitle: "Skills vs native tools vs MCP",
    compareHeaders: { topic: "Topic", skills: "Skills", native: "Native tools", mcp: "MCP" },
    compareRows: [
      {
        label: "Primary job",
        skills: "Teach an agent how to use a capability end to end.",
        native: "Expose built-in product actions such as search, edit, or terminal.",
        mcp: "Expose live APIs or data sources over a standard protocol.",
      },
      {
        label: "Best for",
        skills: "Installation flows, auth, usage patterns, and tool-selection guidance.",
        native: "Core operations the product already ships with and manages directly.",
        mcp: "Dynamic integrations that need structured requests and responses at runtime.",
      },
      {
        label: "Main limitation",
        skills: "They describe usage, but they do not replace the underlying runtime.",
        native: "They are product-specific and usually cannot be redistributed across agents.",
        mcp: "It solves transport, not onboarding. Agents still need guidance on when to use it.",
      },
    ],
    workflowTitle: "How AnyCap uses skills as a distribution layer",
    workflowBody: [
      "AnyCap separates capability execution from capability discovery. The CLI and runtime handle the actual multimodal work, while the skill tells the agent how to reach that runtime inside its own environment.",
      "That design keeps distribution lightweight. Instead of building a separate integration surface for every agent product, AnyCap ships a consistent runtime plus a thin layer of agent-specific instructions. The result is faster rollout, less duplicated integration code, and more predictable behavior inside real agent workflows.",
      "It also makes maintenance simpler. When a new capability is added, the runtime can stay stable while the skill file is updated with new examples, trigger rules, and model choices.",
    ],
    examplesTitle: "Practical examples",
    examples: [
      {
        title: "Image generation",
        body: "A coding agent creating launch assets can read the skill, install the AnyCap runtime, authenticate once, and then call image generation when a user asks for hero art or product illustrations.",
      },
      {
        title: "Video generation",
        body: "An agent preparing a release can switch from writing release notes to generating a short product demo video because the skill explains which command to call and how async polling works.",
      },
      {
        title: "Vision analysis",
        body: "A UI-review agent can upload a screenshot, run image analysis, and use the structured output to identify accessibility issues or summarize layout regressions.",
      },
    ],
    faqTitle: "FAQ",
    patternTitle: "AnyCap distribution pattern",
    installLabel: "# Install through skills.sh",
    switchLabel: "# Or switch the agent target",
    patternBody:
      "In practice, the only thing that changes across targets is the installation surface. The underlying AnyCap runtime stays the same, which is what makes skills an efficient packaging and distribution mechanism for multimodal agent capabilities.",
    ctas: {
      install: "Install AnyCap",
      claude: "For Claude Code",
      codex: "For Codex",
    },
  },
  "pt-br": {
    breadcrumbItems: [
      { name: "Inicio", href: "/" },
      { name: "Guias", href: "/guides" },
      { name: "Skills de agentes para ferramentas de desenvolvimento" },
    ],
    authorLabel: "Por equipe AnyCap",
    eyebrow: "Guia",
    title: ["Skills de agentes", "para ferramentas de desenvolvimento"],
    intro: [
      "Skills de agentes sao arquivos de instrucoes que ensinam um agente de IA a descobrir, instalar, autenticar e invocar uma capability. Elas importam porque agentes de desenvolvimento nao precisam apenas de ferramentas. Eles precisam de uma descricao confiavel de como usar essas ferramentas dentro do ambiente de execucao.",
      "Uma boa skill fecha a lacuna entre a capability existir e o agente realmente saber usa-la. Em vez de obrigar o agente a inferir comandos a partir de documentacao espalhada, a skill explica o que a capability faz, quando chama-la, quais argumentos usar e que configuracao precisa acontecer antes.",
      "E por isso que o AnyCap usa skills como camada de distribuicao entre Claude Code, Cursor, Codex e produtos semelhantes. Um unico runtime de capabilities pode ser instalado uma vez e exposto de forma consistente a varios agentes de desenvolvimento.",
    ],
    whyTitle: "Por que skills importam",
    whyCards: [
      {
        title: "Descoberta clara",
        body: "O agente entende que a capability existe sem precisar decifrar uma pagina de docs especifica de cada produto ou adivinhar pelos nomes dos pacotes.",
      },
      {
        title: "Configuracao repetivel",
        body: "Instalacao e autenticacao ficam em um unico arquivo, entao o fluxo continua estavel entre maquinas, repositorios e produtos de agente.",
      },
      {
        title: "Invocacao segura",
        body: "Os exemplos mostram quando chamar a capability, qual formato de comando reutilizar e quais prompts ou flags sao esperados.",
      },
    ],
    whatTitle: "O que uma skill realmente faz",
    whatBody: [
      "Uma skill nao e apenas metadado. Ela da ao agente um modelo funcional de como uma capability entra no workflow. Isso costuma incluir instalacao, autenticacao, exemplos de comando, situacoes de disparo, restricoes de entrada e o formato de saida esperado.",
      "Isso importa porque agentes modernos de codigo raciocinam bem, mas ainda precisam de um trilho operacional. Quando uma capability e descrita apenas em documentacao em prosa, o agente pode errar autenticacao, pular etapas ou escolher o comando errado. Skills reduzem essa taxa de erro ao tornar o fluxo explicito.",
      "Para o AnyCap, isso significa reutilizar o mesmo runtime multimodal para imagem, video, musica e visao enquanto cada produto de agente recebe as instrucoes no formato que ja entende.",
    ],
    anatomyTitle: "O que uma skill util precisa conter",
    anatomyItems: [
      {
        title: "Resumo da capability",
        body: "Uma explicacao curta do que a capability faz, quais resultados ela habilita e que tipos de pedido devem aciona-la.",
      },
      {
        title: "Passos de instalacao e auth",
        body: "Comandos de instalacao, autenticacao unica, requisitos de ambiente e eventuais pre-condicoes de conta.",
      },
      {
        title: "Exemplos de invocacao",
        body: "Comandos concretos que o agente pode copiar ou adaptar, incluindo nomes de modelo, flags, URLs e estruturas comuns de prompt.",
      },
      {
        title: "Regras de decisao",
        body: "Orientacao sobre quando usar a capability em vez de ficar no texto, quando pedir clarificacao e quando nao chama-la.",
      },
    ],
    fitTitle: "Onde as skills entram",
    fitCards: [
      {
        title: "Descoberta",
        body: "O agente aprende que a capability existe e que tipos de resultado ela viabiliza em workflows de codigo, design e pesquisa.",
      },
      {
        title: "Instalacao",
        body: "A skill explica como instalar o runtime, como a autenticacao funciona e quais dependencias precisam existir primeiro.",
      },
      {
        title: "Invocacao",
        body: "O agente ve exemplos e padroes de uso que pode reutilizar durante a execucao em vez de inventar a sintaxe do comando.",
      },
    ],
    compareTitle: "Skills vs ferramentas nativas vs MCP",
    compareHeaders: { topic: "Topico", skills: "Skills", native: "Ferramentas nativas", mcp: "MCP" },
    compareRows: [
      {
        label: "Papel principal",
        skills: "Ensinar o agente a usar uma capability de ponta a ponta.",
        native: "Expor acoes nativas do produto como busca, edicao ou terminal.",
        mcp: "Expor APIs ou fontes de dados vivas por um protocolo padrao.",
      },
      {
        label: "Melhor uso",
        skills: "Fluxos de instalacao, auth, padroes de uso e orientacao de selecao de ferramenta.",
        native: "Operacoes centrais que o produto ja entrega e gerencia diretamente.",
        mcp: "Integracoes dinamicas que precisam de requests e responses estruturados em tempo real.",
      },
      {
        label: "Limitacao principal",
        skills: "Elas descrevem o uso, mas nao substituem o runtime subjacente.",
        native: "Sao especificas do produto e normalmente nao podem ser redistribuidas entre agentes.",
        mcp: "Resolve o transporte, nao o onboarding. O agente ainda precisa saber quando usar.",
      },
    ],
    workflowTitle: "Como o AnyCap usa skills como camada de distribuicao",
    workflowBody: [
      "O AnyCap separa execucao de capability e descoberta de capability. A CLI e o runtime cuidam do trabalho multimodal, enquanto a skill explica ao agente como chegar a esse runtime dentro do proprio ambiente.",
      "Esse desenho deixa a distribuicao mais leve. Em vez de criar uma superficie de integracao separada para cada produto de agente, o AnyCap envia um runtime consistente com uma camada fina de instrucoes especificas por agente. O resultado e rollout mais rapido, menos codigo duplicado e comportamento mais previsivel nos workflows reais.",
      "Tambem simplifica a manutencao. Quando uma nova capability entra, o runtime pode continuar estavel enquanto a skill e atualizada com novos exemplos, regras de disparo e escolhas de modelo.",
    ],
    examplesTitle: "Exemplos praticos",
    examples: [
      {
        title: "Geracao de imagem",
        body: "Um agente de codigo que cria assets de lancamento pode ler a skill, instalar o runtime do AnyCap, autenticar uma vez e chamar geracao de imagem quando o usuario pedir hero art ou ilustracoes de produto.",
      },
      {
        title: "Geracao de video",
        body: "Um agente preparando um release pode sair da escrita de release notes para gerar um video curto de demo porque a skill explica qual comando usar e como o polling assincrono funciona.",
      },
      {
        title: "Analise visual",
        body: "Um agente de revisao de UI pode subir um screenshot, rodar analise de imagem e usar a saida estruturada para identificar problemas de acessibilidade ou resumir regressos de layout.",
      },
    ],
    faqTitle: "FAQ",
    patternTitle: "Padrao de distribuicao do AnyCap",
    installLabel: "# Instale via skills.sh",
    switchLabel: "# Ou troque o alvo do agente",
    patternBody:
      "Na pratica, a unica mudanca entre os alvos e a superficie de instalacao. O runtime do AnyCap permanece o mesmo, o que torna skills um mecanismo eficiente de empacotamento e distribuicao para capabilities multimodais de agentes.",
    ctas: {
      install: "Instalar AnyCap",
      claude: "Para Claude Code",
      codex: "Para Codex",
    },
  },
  id: {
    breadcrumbItems: [
      { name: "Beranda", href: "/" },
      { name: "Panduan", href: "/guides" },
      { name: "Skill agent untuk developer tools" },
    ],
    authorLabel: "Oleh tim AnyCap",
    eyebrow: "Panduan",
    title: ["Skill agent", "untuk developer tools"],
    intro: [
      "Skill agent adalah berkas instruksi yang mengajarkan agen AI cara menemukan, menginstal, mengautentikasi, dan memanggil kapabilitas. Skill penting karena agen developer tidak hanya butuh tool. Mereka butuh panduan yang konsisten untuk menjalankan tool di lingkungan eksekusi nyata.",
      "Skill yang baik menutup celah antara kapabilitas yang tersedia dan kapabilitas yang benar-benar dipakai. Daripada memaksa agen menebak command dari dokumentasi yang tersebar, skill menjelaskan fungsi kapabilitas, kapan dipanggil, argumen apa yang dipakai, dan setup apa yang wajib dilakukan lebih dulu.",
      "Itulah kenapa AnyCap memakai skill sebagai lapisan distribusi di Claude Code, Cursor, Codex, dan produk sejenis. Satu runtime kapabilitas cukup dipasang sekali, lalu diekspos secara konsisten ke banyak agen developer melalui file skill yang spesifik per produk.",
    ],
    whyTitle: "Kenapa skill penting",
    whyCards: [
      {
        title: "Discovery lebih jelas",
        body: "Agen bisa tahu kapabilitas tersedia tanpa harus membongkar docs khusus produk atau menebak dari nama paket.",
      },
      {
        title: "Setup bisa diulang",
        body: "Instalasi dan autentikasi tersimpan dalam satu file, jadi workflow tetap stabil di mesin, repo, dan produk agen yang berbeda.",
      },
      {
        title: "Pemanggilan lebih aman",
        body: "Contoh di skill menunjukkan kapan kapabilitas dipakai, bentuk command yang bisa diulang, serta prompt atau flag yang diharapkan.",
      },
    ],
    whatTitle: "Apa fungsi nyata skill",
    whatBody: [
      "Skill bukan sekadar metadata. Skill memberi agen model kerja tentang posisi kapabilitas di dalam workflow. Biasanya ini mencakup langkah instalasi, autentikasi, contoh command, kondisi pemicu, batas input, dan bentuk output yang diharapkan.",
      "Ini penting karena agen coding modern memang kuat di reasoning, tetapi tetap butuh rel operasional. Saat kapabilitas hanya ditulis dalam dokumentasi panjang, agen sering melewatkan edge case, skip auth, atau memilih command yang salah. Skill menurunkan tingkat gagal itu dengan membuat alur pemakaian menjadi eksplisit.",
      "Di AnyCap, artinya runtime multimodal yang sama bisa dipakai ulang untuk image generation, video generation, music, atau vision, sementara tiap produk agen mendapat instruksi dalam format yang sudah dipahami produk tersebut.",
    ],
    anatomyTitle: "Isi file skill yang benar-benar berguna",
    anatomyItems: [
      {
        title: "Ringkasan kapabilitas",
        body: "Penjelasan singkat tentang fungsi kapabilitas, hasil yang diaktifkan, dan pola request yang seharusnya memicu kapabilitas.",
      },
      {
        title: "Langkah instalasi dan auth",
        body: "Command instalasi, autentikasi sekali pakai, kebutuhan environment, dan prasyarat akun bila ada.",
      },
      {
        title: "Contoh pemanggilan",
        body: "Command konkret yang bisa langsung disalin atau diadaptasi agen, termasuk nama model, flag, handling URL, dan pola prompt umum.",
      },
      {
        title: "Aturan pengambilan keputusan",
        body: "Panduan kapan memakai kapabilitas dibanding tetap di teks, kapan perlu minta klarifikasi, dan kapan kapabilitas sebaiknya tidak dipanggil.",
      },
    ],
    fitTitle: "Posisi skill dalam alur kerja",
    fitCards: [
      {
        title: "Discovery",
        body: "Agen memahami kapabilitas apa yang tersedia dan hasil apa yang bisa dibawa ke workflow coding, desain, dan riset.",
      },
      {
        title: "Instalasi",
        body: "Skill menjelaskan cara pasang runtime, cara autentikasi, dan dependency yang harus siap dulu.",
      },
      {
        title: "Invocation",
        body: "Agen mendapatkan contoh dan pola penggunaan yang bisa dipakai ulang saat eksekusi, bukan mengarang sintaks command dari nol.",
      },
    ],
    compareTitle: "Skill vs tool native vs MCP",
    compareHeaders: { topic: "Topik", skills: "Skill", native: "Tool native", mcp: "MCP" },
    compareRows: [
      {
        label: "Peran utama",
        skills: "Mengajarkan agen cara memakai kapabilitas secara end to end.",
        native: "Menyediakan aksi bawaan produk seperti search, edit, atau terminal.",
        mcp: "Menyediakan API live atau sumber data lewat protokol standar.",
      },
      {
        label: "Paling cocok untuk",
        skills: "Alur instalasi, auth, pola pemakaian, dan panduan pemilihan tool.",
        native: "Operasi inti yang sudah disediakan dan dikelola langsung oleh produk.",
        mcp: "Integrasi dinamis yang perlu request/response terstruktur saat runtime.",
      },
      {
        label: "Batas utama",
        skills: "Skill mendeskripsikan penggunaan, tetapi tidak menggantikan runtime dasarnya.",
        native: "Biasanya spesifik ke satu produk dan sulit dibagikan lintas agen.",
        mcp: "MCP menyelesaikan transport, bukan onboarding. Agen tetap butuh panduan kapan memakainya.",
      },
    ],
    workflowTitle: "Bagaimana AnyCap memakai skill sebagai lapisan distribusi",
    workflowBody: [
      "AnyCap memisahkan eksekusi kapabilitas dari discovery kapabilitas. CLI dan runtime menangani kerja multimodal yang sesungguhnya, sementara skill menjelaskan ke agen cara mengakses runtime itu di lingkungannya sendiri.",
      "Desain ini membuat distribusi jauh lebih ringan. Daripada membangun permukaan integrasi terpisah untuk setiap produk agen, AnyCap mengirim runtime yang konsisten plus lapisan tipis instruksi khusus agen. Hasilnya rollout lebih cepat, duplikasi kode lebih sedikit, dan perilaku agen lebih prediktif di workflow nyata.",
      "Perawatan juga lebih sederhana. Saat kapabilitas baru ditambahkan, runtime bisa tetap stabil sementara file skill diperbarui dengan contoh baru, aturan pemicu, dan pilihan model terbaru.",
    ],
    examplesTitle: "Contoh praktis",
    examples: [
      {
        title: "Image generation",
        body: "Agen coding yang menyiapkan aset peluncuran bisa membaca skill, memasang runtime AnyCap, autentikasi sekali, lalu memanggil image generation saat user meminta hero art atau ilustrasi produk.",
      },
      {
        title: "Video generation",
        body: "Agen yang menyiapkan rilis dapat berpindah dari menulis release notes ke membuat demo video singkat karena skill menjelaskan command yang dipakai dan cara polling async berjalan.",
      },
      {
        title: "Vision analysis",
        body: "Agen review UI bisa mengunggah screenshot, menjalankan analisis gambar, lalu memakai output terstruktur untuk menemukan masalah aksesibilitas atau merangkum regresi layout.",
      },
    ],
    faqTitle: "FAQ",
    patternTitle: "Pola distribusi AnyCap",
    installLabel: "# Instal lewat skills.sh",
    switchLabel: "# Atau ganti target agen",
    patternBody:
      "Dalam praktiknya, yang berubah antar target hanya permukaan instalasi. Runtime AnyCap di bawahnya tetap sama. Itu yang membuat skill efisien sebagai mekanisme packaging dan distribusi untuk kapabilitas agen multimodal.",
    ctas: {
      install: "Instal AnyCap",
      claude: "Untuk Claude Code",
      codex: "Untuk Codex",
    },
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return getPageMetadata(locale);
}

const guideJsonLdByLocale = {
  en: createTechArticleJsonLd({
    headline: "Agent skills for developer tools — How agent capabilities are distributed",
    description:
      "Learn how agent skills work in Claude Code, Cursor, and Codex, what skill files contain, and how AnyCap distributes multimodal capabilities across developer agents.",
    path: "/guides/agent-skills-for-developer-tools",
    about: ["Agent skills", "Developer tools", "Claude Code", "Cursor", "Codex", "AnyCap"],
    keywords: [
      "agent skills for developer tools",
      "what are agent skills",
      "claude code skills",
      "codex skills",
      "cursor skills",
    ],
    datePublished: "2026-04-14",
    dateModified: "2026-04-14",
  }),
  id: createTechArticleJsonLd({
    headline: "Skill agent untuk developer tools — Cara kapabilitas agent didistribusikan",
    description:
      "Pelajari cara kerja skill agent di Claude Code, Cursor, dan Codex, isi file skill yang penting, serta bagaimana AnyCap mendistribusikan kapabilitas multimodal lintas agen developer.",
    path: "/guides/agent-skills-for-developer-tools",
    about: ["Skill agent", "Developer tools", "Claude Code", "Cursor", "Codex", "AnyCap"],
    keywords: [
      "skill agent untuk developer tools",
      "apa itu skill agent",
      "skill claude code",
      "skill codex",
      "skill cursor",
    ],
    datePublished: "2026-04-14",
    dateModified: "2026-04-14",
  }),
} as const;

const faqItems = [
  {
    question: "What is an agent skill?",
    answer:
      "An agent skill is an instruction file that tells an AI agent what a capability does, how to install it, how to authenticate, when to call it, and which commands or examples to reuse during execution.",
  },
  {
    question: "How are skills different from MCP?",
    answer:
      "Skills explain workflow and tool selection. MCP exposes live tools and data over a protocol. In practice, MCP can provide the capability surface, while the skill teaches the agent when and how to use that surface correctly.",
  },
  {
    question: "Why do developer agents need skills if they can already use shell commands?",
    answer:
      "Shell access gives an agent raw execution power, but not reliable operating instructions. Skills reduce mistakes by packaging install steps, authentication, trigger rules, and command examples in a form the agent can follow repeatedly.",
  },
  {
    question: "Why does AnyCap distribute capabilities through skills?",
    answer:
      "Because skills let AnyCap expose one multimodal runtime to several agent products without rebuilding the integration for each one. The runtime stays consistent while the instructions are adapted to the target agent.",
  },
] as const;

const idFaqItems = [
  {
    question: "Apa itu skill agent?",
    answer:
      "Skill agent adalah berkas instruksi yang memberi tahu agen AI fungsi kapabilitas, cara instalasi, cara autentikasi, kapan harus dipanggil, dan contoh command yang bisa dipakai ulang saat eksekusi.",
  },
  {
    question: "Apa bedanya skill dan MCP?",
    answer:
      "Skill menjelaskan workflow dan pemilihan tool. MCP mengekspos tool serta data live lewat protokol. Dalam praktiknya, MCP menyediakan permukaan kapabilitas, sedangkan skill mengajari agen kapan dan bagaimana permukaan itu dipakai dengan benar.",
  },
  {
    question: "Kenapa agen developer masih butuh skill kalau sudah bisa menjalankan command shell?",
    answer:
      "Akses shell memberi kekuatan eksekusi mentah, tetapi tidak memberi instruksi operasional yang andal. Skill mengurangi kesalahan dengan mengemas langkah instalasi, autentikasi, aturan pemicu, dan contoh command dalam format yang bisa diikuti berulang kali.",
  },
  {
    question: "Kenapa AnyCap mendistribusikan kapabilitas lewat skill?",
    answer:
      "Karena skill memungkinkan AnyCap mengekspos satu runtime multimodal ke banyak produk agen tanpa membangun ulang integrasi untuk tiap produk. Runtime tetap konsisten, sementara instruksi disesuaikan dengan target agen.",
  },
] as const;

export default async function AgentSkillsForDeveloperToolsPage() {
  const locale = await getRequestLocale();
  const normalizedLocale = locale === "pt-br" ? "pt-br" : locale === "id" ? "id" : "en";
  const content = contentByLocale[normalizedLocale];
  const localizedFaqItems = normalizedLocale === "id" ? idFaqItems : faqItems;
  const faqJsonLd = createFaqPageJsonLd(localizedFaqItems);
  const guideJsonLd = normalizedLocale === "id" ? guideJsonLdByLocale.id : guideJsonLdByLocale.en;

  return (
    <>
      <BreadcrumbJsonLd items={content.breadcrumbItems} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(guideJsonLd) }} />
      {hasJsonLdContent(faqJsonLd) ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      ) : null}

      <article className="px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-[1280px] py-12 md:py-20 lg:py-24">
          <FadeIn>
            <p className="mb-4 text-[11px] tracking-[0.8px] text-[#6b7d3a]" style={mono}>
              {content.eyebrow}
            </p>
            <ArticleByline className="mb-3" author={content.authorLabel} />
            <h1
              className="leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(32px, 6vw, 72px)" }}
            >
              {content.title[0]}
              <br />
              {content.title[1]}
            </h1>
            <div className="mt-6 max-w-[820px] space-y-4">
              {content.intro.map((paragraph) => (
                <p key={paragraph} className="text-base leading-7 text-[#4d5145] md:text-lg">
                  {paragraph}
                </p>
              ))}
            </div>
          </FadeIn>

          <FadeIn className="mt-8">
            <EarlyAccessBanner />
          </FadeIn>

          <FadeIn className="mt-12">
            <section>
              <h2 className="mb-6 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {content.whyTitle}
              </h2>
              <div className="grid gap-4 md:grid-cols-3">
                {content.whyCards.map((card) => (
                  <div key={card.title} className="border border-[#d4dbb8] bg-[#fffffc]/80 p-5">
                    <h3 className="mb-2 text-[14px] font-bold text-[#1c1f17]" style={mono}>
                      {card.title}
                    </h3>
                    <p className="text-sm leading-6 text-[#4d5145]">{card.body}</p>
                  </div>
                ))}
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-6 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {content.whatTitle}
              </h2>
              <div className="max-w-[820px] space-y-4">
                {content.whatBody.map((paragraph) => (
                  <p key={paragraph} className="text-base leading-7 text-[#4d5145]">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-8 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {content.anatomyTitle}
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {content.anatomyItems.map((item) => (
                  <div key={item.title} className="rounded-xl border border-[#d4dbb8] bg-[#fffffc]/70 p-5">
                    <h3 className="mb-2 text-[14px] font-bold text-[#1c1f17]" style={mono}>
                      {item.title}
                    </h3>
                    <p className="text-sm leading-6 text-[#4d5145]">{item.body}</p>
                  </div>
                ))}
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-8 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {content.fitTitle}
              </h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {content.fitCards.map((card) => (
                  <div key={card.title} className="border border-[#d4dbb8] p-5">
                    <h3 className="mb-2 text-[14px] font-bold text-[#1c1f17]" style={mono}>
                      {card.title}
                    </h3>
                    <p className="text-sm leading-6 text-[#4d5145]">{card.body}</p>
                  </div>
                ))}
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-6 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {content.compareTitle}
              </h2>
              <div className="overflow-x-auto border border-[#d4dbb8] bg-[#fffffc]/70">
                <table className="min-w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-[#d4dbb8] bg-[#f4f5f0]/70">
                      <th className="px-4 py-3 text-[12px] text-[#1c1f17]" style={mono}>
                        {content.compareHeaders.topic}
                      </th>
                      <th className="px-4 py-3 text-[12px] text-[#1c1f17]" style={mono}>
                        {content.compareHeaders.skills}
                      </th>
                      <th className="px-4 py-3 text-[12px] text-[#1c1f17]" style={mono}>
                        {content.compareHeaders.native}
                      </th>
                      <th className="px-4 py-3 text-[12px] text-[#1c1f17]" style={mono}>
                        {content.compareHeaders.mcp}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {content.compareRows.map((row) => (
                      <tr key={row.label} className="border-b border-[#e5e9d4] last:border-b-0">
                        <th className="px-4 py-4 align-top text-[12px] text-[#1c1f17]" style={mono}>
                          {row.label}
                        </th>
                        <td className="px-4 py-4 text-sm leading-6 text-[#4d5145]">{row.skills}</td>
                        <td className="px-4 py-4 text-sm leading-6 text-[#4d5145]">{row.native}</td>
                        <td className="px-4 py-4 text-sm leading-6 text-[#4d5145]">{row.mcp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-6 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {content.workflowTitle}
              </h2>
              <div className="max-w-[820px] space-y-4">
                {content.workflowBody.map((paragraph) => (
                  <p key={paragraph} className="text-base leading-7 text-[#4d5145]">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-8 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {content.examplesTitle}
              </h2>
              <div className="grid gap-4 md:grid-cols-3">
                {content.examples.map((example) => (
                  <div key={example.title} className="rounded-xl border border-[#d4dbb8] bg-[#fffffc]/70 p-5">
                    <h3 className="mb-2 text-[14px] font-bold text-[#1c1f17]" style={mono}>
                      {example.title}
                    </h3>
                    <p className="text-sm leading-6 text-[#4d5145]">{example.body}</p>
                  </div>
                ))}
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-8 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {content.patternTitle}
              </h2>
              <div className="max-w-[820px] bg-[#1c1f17] px-6 py-5 md:px-8 md:py-6">
                <p className="mb-1 text-[13px] text-[#6b7d3a]" style={mono}>
                  {content.installLabel}
                </p>
                <p className="mb-4 text-[13px] text-[#d4e0a4]" style={mono}>
                  npx -y skills add anycap-ai/anycap -a claude-code -y
                </p>
                <p className="mb-1 text-[13px] text-[#6b7d3a]" style={mono}>
                  {content.switchLabel}
                </p>
                <p className="text-[13px] text-[#d4e0a4]" style={mono}>
                  npx -y skills add anycap-ai/anycap -a codex -y
                </p>
              </div>
              <p className="mt-4 max-w-[820px] text-sm leading-6 text-[#4d5145]">
                {content.patternBody}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                {agentTargets.map((target) => (
                  <span
                    key={target}
                    className="border border-[#d4dbb8] px-4 py-2 text-[12px] tracking-[1px] text-[#1c1f17]"
                    style={mono}
                  >
                    {target}
                  </span>
                ))}
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-8 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {content.faqTitle}
              </h2>
              <div className="max-w-[860px] space-y-4">
                {localizedFaqItems.map((item) => (
                  <div key={item.question} className="rounded-xl border border-[#d4dbb8] bg-[#fffffc]/70 p-5">
                    <h3 className="mb-2 text-[14px] font-bold text-[#1c1f17]" style={mono}>
                      {item.question}
                    </h3>
                    <p className="text-sm leading-6 text-[#4d5145]">{item.answer}</p>
                  </div>
                ))}
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24 mb-8">
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/guides/install-anycap"
                  className="inline-block rounded-lg bg-[#6b7d3a] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#f4f5f0] transition-colors hover:bg-[#1c1f17]"
                  style={mono}
                >
                  {content.ctas.install}
                </Link>
                <Link
                  href="/for/claude-code"
                  className="inline-block rounded-lg border border-[#1c1f17] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] transition-colors hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
                  style={mono}
                >
                  {content.ctas.claude}
                </Link>
                <Link
                  href="/for/codex"
                  className="inline-block rounded-lg border border-[#1c1f17] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] transition-colors hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
                  style={mono}
                >
                  {content.ctas.codex}
                </Link>
              </div>
            </section>
          </FadeIn>
        </div>
      </article>
    </>
  );
}
