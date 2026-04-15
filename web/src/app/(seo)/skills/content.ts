import type { Metadata } from "next";
import { getLocalizedRouteUrl, getLocaleConfig, siteConfig, type SiteLocale } from "@/lib/site";

export const SKILLS_PATH = "/skills";

type SkillsCard = {
  label?: string;
  title: string;
  href: string;
  summary: string;
  eyebrow?: string;
};

type SkillsPageData = {
  metadata: {
    title: string;
    description: string;
    openGraphTitle: string;
    openGraphDescription: string;
  };
  eyebrow: string;
  heroTitle: [string, string];
  heroIntro: string;
  heroTagline: string;
  overviewTitle: string;
  overviewParagraphs: string[];
  relationshipTitle: string;
  relationshipRows: { label: string; summary: string }[];
  relatedTitle: string;
  supportedTitle: string;
  supportedLabel: string;
  plannedLabel: string;
  supportedTargets: { name: string; href: string | null }[];
  installTitle: string;
  installPatterns: { title: string; note: string; code: string }[];
  notTitle: string;
  notParagraphs: string[];
  nextTitle: string;
  nextPages: SkillsCard[];
  ctas: { label: string; href: string }[];
  skillsHubJsonLd: Record<string, unknown>;
};

const supportedTargets = [
  { name: "Claude Code", href: "/for/claude-code" },
  { name: "Cursor", href: "/for/cursor" },
  { name: "Codex", href: "/for/codex" },
  { name: "OpenCode", href: null },
  { name: "OpenClaw", href: null },
] as const;

const installPatterns = [
  {
    code: "npx -y skills add anycap-ai/anycap -a claude-code -y",
  },
  {
    code: "anycap skill install --target ~/.claude/skills/anycap-cli/",
  },
  {
    code: "curl -fsSL https://raw.githubusercontent.com/anycap-ai/anycap/main/skills/anycap-cli/SKILL.md --create-dirs -o ~/.claude/skills/anycap-cli/SKILL.md",
  },
] as const;

function buildSkillsHubJsonLd(locale: SiteLocale, label: string, description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: label,
    description,
    url: getLocalizedRouteUrl(locale, SKILLS_PATH),
    hasPart: [
      {
        "@type": "WebPage",
        name: "AnyCap for Claude Code",
        url: getLocalizedRouteUrl(locale, "/for/claude-code"),
      },
      {
        "@type": "WebPage",
        name: "AnyCap for Cursor",
        url: getLocalizedRouteUrl(locale, "/for/cursor"),
      },
      { "@type": "WebPage", name: "AnyCap CLI", url: getLocalizedRouteUrl(locale, "/cli") },
      {
        "@type": "WebPage",
        name: "Install AnyCap",
        url: getLocalizedRouteUrl(locale, "/guides/install-anycap"),
      },
    ],
  };
}

const contentByLocale: Record<SiteLocale, SkillsPageData> = {
  en: {
    metadata: {
      title: "AnyCap Skills | Teach AI agents how to use capabilities",
      description:
        "A skill teaches Claude Code, Cursor, Codex, and similar agent users how to discover, install, authenticate, and invoke AnyCap. It is the instruction layer that turns an agent into a multimodal workflow runner.",
      openGraphTitle: "AnyCap Skills | Teach AI agents how to use capabilities",
      openGraphDescription:
        "Learn how AnyCap skills connect agent users to the CLI, runtime, and capability stack.",
    },
    eyebrow: "Learn",
    heroTitle: [
      "Skills teach your agent",
      "how to use the capabilities it doesn't ship with.",
    ],
    heroIntro:
      "The agent may know how to code, but it does not automatically know how to discover, install, authenticate, and invoke your capability runtime. A skill is the instruction layer that closes that gap. It tells Claude Code, Cursor, Codex, and similar agent users how to connect to AnyCap without turning every setup into a manual integration job.",
    heroTagline: "Keep the agent. Teach it the missing runtime.",
    overviewTitle: "Why skills matter in practice",
    overviewParagraphs: [
      "Skills matter because agents need more than raw tool access. They need an explicit description of how a capability fits into the workflow, when it should be used, and which install or auth steps have to happen first.",
      "For AnyCap, skills are also a distribution strategy. They let the same capability runtime appear consistently across multiple agent products without rebuilding the entire operator experience every time a new environment is added.",
    ],
    relationshipTitle: "What a skill adds to the workflow",
    relationshipRows: [
      {
        label: "Skill",
        summary: "Instruction layer that teaches the agent what missing capabilities exist and how to install and invoke them.",
      },
      {
        label: "CLI",
        summary: "Executable surface the agent or operator actually runs, like `anycap image generate`.",
      },
      {
        label: "Capability",
        summary: "Concrete action exposed through the runtime, such as image generation, image understanding, or video analysis.",
      },
      {
        label: "Tool",
        summary: "Generic execution surface. A skill can describe a tool, but it is not the same thing as the capability runtime itself.",
      },
    ],
    relatedTitle: "Related reading",
    supportedTitle: "Where skills plug in",
    supportedLabel: "Supported",
    plannedLabel: "Planned",
    supportedTargets: [...supportedTargets],
    installTitle: "Three ways to install the skill",
    installPatterns: [
      {
        title: "Install through skills.sh",
        note: "Best when the agent ecosystem already supports skills as a distribution format.",
        code: installPatterns[0].code,
      },
      {
        title: "Install through AnyCap CLI",
        note: "Useful when you want the runtime to place the skill file in a known target directory.",
        code: installPatterns[1].code,
      },
      {
        title: "Install manually",
        note: "Fallback path when you want direct control over the skill file location.",
        code: installPatterns[2].code,
      },
    ],
    notTitle: "What skills are not",
    notParagraphs: [
      "A skill is not the same as MCP, A2A, or another agent protocol. Those protocols describe how systems communicate. A skill describes how the agent should install and use a capability runtime inside its execution environment.",
      "A skill is also not the capability itself. It is the instruction layer that points the agent toward the runtime, the CLI, and the concrete commands it can call once the install path is complete.",
    ],
    nextTitle: "Where to go next",
    nextPages: [
      {
        eyebrow: "Guides",
        title: "MCP vs Skills",
        href: "/guides/mcp-vs-skills",
        summary: "Compare the protocol layer with the instruction layer before you decide how to wire AnyCap into your agent stack.",
      },
      {
        eyebrow: "Learn",
        title: "Why one CLI matters",
        href: "/cli",
        summary: "Use this when you want to see how the command surface stays stable across image, video, and vision workflows.",
      },
      {
        eyebrow: "Learn",
        title: "What agents can't do",
        href: "/learn/what-agents-cant-do",
        summary: "Use this when you want the capability-gap narrative before choosing the next product or capability page.",
      },
      {
        eyebrow: "Guides",
        title: "Install AnyCap",
        href: "/guides/install-anycap",
        summary: "Use this when you want the shortest install path after you understand how the instruction layer works.",
      },
    ],
    ctas: [
      { label: "Install AnyCap", href: "/guides/install-anycap" },
      { label: "Why One CLI Matters", href: "/cli" },
      { label: "See Capability Gaps", href: "/learn/what-agents-cant-do" },
    ],
    skillsHubJsonLd: buildSkillsHubJsonLd(
      "en",
      "AnyCap Skills",
      "Hub page for installable AnyCap skills that teach AI agents how to discover and use capabilities through one runtime.",
    ),
  },
  "pt-br": {
    metadata: {
      title: "Skills do AnyCap | Ensine agentes de IA a usar capacidades",
      description:
        "Uma skill ensina Claude Code, Cursor, Codex e usuários de agentes semelhantes a descobrir, instalar, autenticar e invocar o AnyCap. É a camada de instrução que transforma um agente em um executor de fluxos multimodais.",
      openGraphTitle: "Skills do AnyCap | Ensine agentes de IA a usar capacidades",
      openGraphDescription:
        "Entenda como as skills do AnyCap conectam usuários de agentes à CLI, ao runtime e à stack de capacidades.",
    },
    eyebrow: "Aprender",
    heroTitle: [
      "Skills ensinam seu agente",
      "a usar as capacidades que ele não traz por padrão.",
    ],
    heroIntro:
      "O agente pode saber programar, mas não sabe automaticamente como descobrir, instalar, autenticar e invocar o seu runtime de capacidades. Uma skill é a camada de instrução que fecha essa lacuna. Ela mostra ao Claude Code, Cursor, Codex e usuários de agentes semelhantes como se conectar ao AnyCap sem transformar cada setup em um trabalho manual de integração.",
    heroTagline: "Mantenha o agente. Ensine o runtime que está faltando.",
    overviewTitle: "Por que skills importam na prática",
    overviewParagraphs: [
      "Skills importam porque agentes precisam de mais do que acesso bruto a ferramentas. Eles precisam de uma descrição explícita de como a capability entra no workflow, quando ela deve ser usada e quais passos de instalação ou autenticação precisam acontecer primeiro.",
      "Para o AnyCap, skills também são uma estratégia de distribuição. Elas permitem que o mesmo runtime de capacidades apareça de forma consistente em vários produtos de agente sem reconstruir toda a experiência operacional sempre que um novo ambiente é adicionado.",
    ],
    relationshipTitle: "O que uma skill adiciona ao fluxo",
    relationshipRows: [
      {
        label: "Skill",
        summary: "Camada de instrução que ensina o agente quais capacidades faltantes existem e como instalá-las e invocá-las.",
      },
      {
        label: "CLI",
        summary: "Superfície executável que o agente ou operador realmente roda, como `anycap image generate`.",
      },
      {
        label: "Capacidade",
        summary: "Ação concreta exposta pelo runtime, como geração de imagem, entendimento de imagem ou análise de vídeo.",
      },
      {
        label: "Ferramenta",
        summary: "Superfície genérica de execução. Uma skill pode descrever uma ferramenta, mas não é a mesma coisa que o runtime de capacidades em si.",
      },
    ],
    relatedTitle: "Leitura relacionada",
    supportedTitle: "Onde as skills entram",
    supportedLabel: "Compatível",
    plannedLabel: "Planejado",
    supportedTargets: [...supportedTargets],
    installTitle: "Três formas de instalar a skill",
    installPatterns: [
      {
        title: "Instalar via skills.sh",
        note: "Melhor quando o ecossistema de agentes já suporta skills como formato de distribuição.",
        code: installPatterns[0].code,
      },
      {
        title: "Instalar via CLI do AnyCap",
        note: "Útil quando você quer que o runtime coloque o arquivo da skill em um diretório-alvo conhecido.",
        code: installPatterns[1].code,
      },
      {
        title: "Instalar manualmente",
        note: "Caminho de fallback quando você quer controle direto sobre a localização do arquivo da skill.",
        code: installPatterns[2].code,
      },
    ],
    notTitle: "O que skills não são",
    notParagraphs: [
      "Uma skill não é a mesma coisa que MCP, A2A ou outro protocolo de agentes. Esses protocolos descrevem como sistemas se comunicam. Uma skill descreve como o agente deve instalar e usar um runtime de capacidades dentro do seu ambiente de execução.",
      "Uma skill também não é a própria capacidade. Ela é a camada de instrução que aponta o agente para o runtime, para a CLI e para os comandos concretos que ele pode chamar quando o caminho de instalação estiver concluído.",
    ],
    nextTitle: "Para onde ir em seguida",
    nextPages: [
      {
        eyebrow: "Guias",
        title: "MCP vs Skills",
        href: "/guides/mcp-vs-skills",
        summary: "Compare a camada de protocolo com a camada de instrução antes de decidir como conectar o AnyCap à sua stack de agentes.",
      },
      {
        eyebrow: "Aprender",
        title: "Por que uma CLI importa",
        href: "/cli",
        summary: "Veja como a superfície de comando permanece estável entre fluxos de imagem, vídeo e visão.",
      },
      {
        eyebrow: "Aprender",
        title: "O que agentes não conseguem fazer",
        href: "/learn/what-agents-cant-do",
        summary: "Comece aqui se você quiser a narrativa sobre lacunas de capacidade antes de escolher a próxima página de produto ou capacidade.",
      },
      {
        eyebrow: "Guias",
        title: "Instalar o AnyCap",
        href: "/guides/install-anycap",
        summary: "Use isto quando quiser o caminho mais curto de instalação depois de entender como a camada de instrução funciona.",
      },
    ],
    ctas: [
      { label: "Instalar o AnyCap", href: "/guides/install-anycap" },
      { label: "Por que uma CLI importa", href: "/cli" },
      { label: "Ver lacunas de capacidade", href: "/learn/what-agents-cant-do" },
    ],
    skillsHubJsonLd: buildSkillsHubJsonLd(
      "pt-br",
      "Skills do AnyCap",
      "Página central para skills instaláveis do AnyCap que ensinam agentes de IA a descobrir e usar capacidades por meio de um único runtime.",
    ),
  },
  id: {
    metadata: {
      title: "AnyCap Skills | Ajari agen AI cara memakai kapabilitas",
      description:
        "Skill mengajarkan Claude Code, Cursor, Codex, dan pengguna agen serupa cara menemukan, memasang, mengautentikasi, dan memanggil AnyCap. Ini adalah layer instruksi yang mengubah agen menjadi runner workflow multimodal.",
      openGraphTitle: "AnyCap Skills | Ajari agen AI cara memakai kapabilitas",
      openGraphDescription:
        "Pelajari bagaimana AnyCap skills menghubungkan pengguna agen ke CLI, runtime, dan stack kapabilitas.",
    },
    eyebrow: "Pelajari",
    heroTitle: [
      "Skills mengajarkan agen Anda",
      "cara memakai kapabilitas yang tidak dibawanya sejak awal.",
    ],
    heroIntro:
      "Agen mungkin tahu cara menulis kode, tetapi ia tidak otomatis tahu cara menemukan, memasang, mengautentikasi, dan memanggil runtime kapabilitas Anda. Skill adalah layer instruksi yang menutup celah itu. Ia memberi tahu Claude Code, Cursor, Codex, dan pengguna agen serupa cara terhubung ke AnyCap tanpa mengubah setiap setup menjadi pekerjaan integrasi manual.",
    heroTagline: "Pertahankan agennya. Ajari runtime yang hilang.",
    overviewTitle: "Mengapa skills penting dalam praktik",
    overviewParagraphs: [
      "Skills penting karena agen butuh lebih dari sekadar akses tool mentah. Mereka butuh deskripsi eksplisit tentang bagaimana sebuah kapabilitas masuk ke workflow, kapan ia harus dipakai, dan langkah instalasi atau autentikasi apa yang harus dilakukan dulu.",
      "Bagi AnyCap, skills juga merupakan strategi distribusi. Mereka membuat runtime kapabilitas yang sama muncul secara konsisten di banyak produk agen tanpa harus membangun ulang pengalaman operator setiap kali lingkungan baru ditambahkan.",
    ],
    relationshipTitle: "Apa yang ditambahkan skill ke workflow",
    relationshipRows: [
      {
        label: "Skill",
        summary: "Layer instruksi yang mengajari agen kapabilitas apa yang hilang dan bagaimana memasang serta memanggilnya.",
      },
      {
        label: "CLI",
        summary: "Surface eksekusi yang benar-benar dijalankan agen atau operator, seperti `anycap image generate`.",
      },
      {
        label: "Kapabilitas",
        summary: "Aksi konkret yang diekspos lewat runtime, misalnya pembuatan gambar, pemahaman gambar, atau analisis video.",
      },
      {
        label: "Tool",
        summary: "Surface eksekusi generik. Skill bisa mendeskripsikan tool, tetapi itu bukan runtime kapabilitas itu sendiri.",
      },
    ],
    relatedTitle: "Bacaan terkait",
    supportedTitle: "Di mana skills masuk",
    supportedLabel: "Didukung",
    plannedLabel: "Direncanakan",
    supportedTargets: [...supportedTargets],
    installTitle: "Tiga cara memasang skill",
    installPatterns: [
      {
        title: "Pasang lewat skills.sh",
        note: "Paling cocok ketika ekosistem agen sudah mendukung skills sebagai format distribusi.",
        code: installPatterns[0].code,
      },
      {
        title: "Pasang lewat CLI AnyCap",
        note: "Berguna ketika Anda ingin runtime meletakkan file skill di target directory yang jelas.",
        code: installPatterns[1].code,
      },
      {
        title: "Pasang manual",
        note: "Jalur fallback ketika Anda ingin kontrol langsung atas lokasi file skill.",
        code: installPatterns[2].code,
      },
    ],
    notTitle: "Apa yang bukan skills",
    notParagraphs: [
      "Skill bukan hal yang sama dengan MCP, A2A, atau protokol agen lain. Protokol itu menjelaskan bagaimana sistem berkomunikasi. Skill menjelaskan bagaimana agen harus memasang dan memakai runtime kapabilitas di dalam lingkungan eksekusinya.",
      "Skill juga bukan kapabilitas itu sendiri. Ia adalah layer instruksi yang mengarahkan agen ke runtime, CLI, dan perintah konkret yang bisa dipanggil setelah jalur instalasi selesai.",
    ],
    nextTitle: "Ke mana selanjutnya",
    nextPages: [
      {
        eyebrow: "Panduan",
        title: "MCP vs Skills",
        href: "/guides/mcp-vs-skills",
        summary: "Bandingkan layer protokol dengan layer instruksi sebelum Anda memutuskan cara menghubungkan AnyCap ke stack agen Anda.",
      },
      {
        eyebrow: "Pelajari",
        title: "Mengapa satu CLI itu penting",
        href: "/cli",
        summary: "Gunakan ini ketika Anda ingin melihat bagaimana surface perintah tetap stabil di workflow gambar, video, dan visi.",
      },
      {
        eyebrow: "Pelajari",
        title: "Apa yang tidak bisa dilakukan agen",
        href: "/learn/what-agents-cant-do",
        summary: "Gunakan ini ketika Anda ingin narasi celah kapabilitas sebelum memilih halaman produk atau kapabilitas berikutnya.",
      },
      {
        eyebrow: "Panduan",
        title: "Pasang AnyCap",
        href: "/guides/install-anycap",
        summary: "Gunakan ini ketika Anda ingin jalur instalasi paling singkat setelah memahami cara kerja layer instruksi.",
      },
    ],
    ctas: [
      { label: "Pasang AnyCap", href: "/guides/install-anycap" },
      { label: "Mengapa Satu CLI Penting", href: "/cli" },
      { label: "Lihat Celah Kapabilitas", href: "/learn/what-agents-cant-do" },
    ],
    skillsHubJsonLd: buildSkillsHubJsonLd(
      "id",
      "AnyCap Skills",
      "Halaman hub untuk AnyCap skills yang bisa dipasang dan mengajarkan agen AI cara menemukan serta memakai kapabilitas melalui satu runtime.",
    ),
  },
};

export function getSkillsMetadata(locale: SiteLocale): Metadata {
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

export function getSkillsPageData(locale: SiteLocale) {
  return contentByLocale[locale] ?? contentByLocale.en;
}
