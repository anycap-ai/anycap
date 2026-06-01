import type { Metadata } from "next";
import { createFaqPageJsonLd, createTechArticleJsonLd } from "@/lib/schema";
import { getLocaleConfig, siteConfig, type SiteLocale } from "@/lib/site";

export const INSTALL_ANYCAP_PATH = "/guides/install-anycap";

type InstallStep = {
  title: string;
  code: string;
  note: string;
};

type InstallAnycapPageData = {
  metadata: {
    title: string;
    description: string;
    openGraphTitle: string;
    openGraphDescription: string;
  };
  eyebrow: string;
  heroTitle: [string, string];
  heroIntro: string;
  lastUpdatedLabel: string;
  neededTitle: string;
  neededItems: string[];
  stepsTitle: string;
  steps: InstallStep[];
  verifyTitle: string;
  verifyIntro: string;
  verifyCommands: string[];
  agentsTitle: string;
  agents: { name: string; href: string; command: string; body: string }[];
  faqTitle: string;
  faqItems: { question: string; answer: string }[];
  nextTitle: string;
  nextPages: { eyebrow: string; title: string; href: string; body: string }[];
  ctas: { label: string; href: string; primary?: boolean }[];
  guideJsonLd: Record<string, unknown>;
  faqJsonLd: Record<string, unknown>;
};

const lastUpdatedIso = "2026-06-01";

const enSteps: InstallStep[] = [
  {
    title: "Install the AnyCap skill for your agent",
    code: "npx -y skills add anycap-ai/anycap -a claude-code -y",
    note:
      "Use claude-code, cursor, or codex as the agent target. The skill teaches your agent how to install, authenticate, and call AnyCap without guessing from docs.",
  },
  {
    title: "Install the AnyCap CLI",
    code: "curl -fsSL https://anycap.ai/install.sh | sh",
    note:
      "Or run npm install -g @anycap/cli if you prefer a package-manager install path. The CLI is the execution surface for every capability.",
  },
  {
    title: "Log in once",
    code: "anycap login",
    note:
      "Authentication happens once in the browser and covers image, video, vision, search, storage, and publishing workflows.",
  },
  {
    title: "Verify the install",
    code: "anycap status",
    note:
      "Confirm the CLI is authenticated and can reach the AnyCap server before you run your first generation command.",
  },
  {
    title: "Run your first capability command",
    code: 'anycap image generate --prompt "A minimal product icon on a soft green background"',
    note:
      "Swap image for video, actions image-read, or web search once you know which capability gap you are closing first.",
  },
];

const enAgents = [
  {
    name: "Claude Code",
    href: "/for/claude-code",
    command: "npx -y skills add anycap-ai/anycap -a claude-code -y",
    body: "Best default when Claude Code is your primary coding agent and you want the deepest capability onboarding path.",
  },
  {
    name: "Cursor",
    href: "/for/cursor",
    command: "npx -y skills add anycap-ai/anycap -a cursor -y",
    body: "Use this when your workflows already live inside Cursor and you want the same capability layer there.",
  },
  {
    name: "Codex",
    href: "/for/codex",
    command: "npx -y skills add anycap-ai/anycap -a codex -y",
    body: "Good fit when you want image, video, and vision commands inside Codex without wiring provider SDKs by hand.",
  },
];

const enFaqItems = [
  {
    question: "How do I install AnyCap CLI?",
    answer:
      "Run curl -fsSL https://anycap.ai/install.sh | sh or npm install -g @anycap/cli, then run anycap login. Add the AnyCap skill to your agent so setup can happen in natural language.",
  },
  {
    question: "Does AnyCap work with Claude Code and Cursor?",
    answer:
      "Yes. Install the AnyCap skill for claude-code, cursor, or codex. The same CLI and auth flow work across supported agent environments.",
  },
  {
    question: "Do I need a separate login for each capability?",
    answer:
      "No. One anycap login covers image generation, video generation, vision, web search, Drive storage, and Page publishing.",
  },
  {
    question: "What command should I run first after install?",
    answer:
      "Run anycap status to verify auth, then anycap image models or anycap video models to see what is available before your first generation request.",
  },
];

const enNextPages = [
  {
    eyebrow: "Start",
    title: "Get Started",
    href: "/start",
    body: "Natural-language onboarding if you prefer to ask your agent to handle setup for you.",
  },
  {
    eyebrow: "CLI",
    title: "AnyCap CLI reference",
    href: "/cli",
    body: "See the full command surface after install is complete.",
  },
  {
    eyebrow: "Capabilities",
    title: "Capability inventory",
    href: "/capabilities",
    body: "Pick the first capability gap you want to close after install.",
  },
];

function buildInstallPageData(
  overrides: Partial<InstallAnycapPageData> & Pick<InstallAnycapPageData, "metadata">,
): InstallAnycapPageData {
  const page: InstallAnycapPageData = {
    eyebrow: "Guides",
    heroTitle: ["Install AnyCap", "One skill, one CLI, one login"],
    heroIntro:
      "This guide is the canonical install path for AnyCap on the main site. It covers the agent skill, CLI install, authentication, verification, and the first capability command.",
    lastUpdatedLabel: "Last updated June 1, 2026",
    neededTitle: "Before you start",
    neededItems: [
      "An AI agent that can run shell commands (Claude Code, Cursor, Codex, or similar)",
      "Node.js 18+ for skills.sh and npm installs",
      "A browser for the one-time login flow",
      "A terminal session where you can paste commands or ask the agent to run them",
    ],
    stepsTitle: "Install in five steps",
    steps: enSteps,
    verifyTitle: "Verify everything works",
    verifyIntro:
      "After login, run a quick status check and list available models before your first generation job.",
    verifyCommands: ["anycap status", "anycap image models", "anycap video models"],
    agentsTitle: "Agent-specific install commands",
    agents: enAgents,
    faqTitle: "Install FAQ",
    faqItems: enFaqItems,
    nextTitle: "Next pages",
    nextPages: enNextPages,
    ctas: [
      { label: "Get Started", href: "/start", primary: true },
      { label: "View CLI", href: "/cli" },
      { label: "For Claude Code", href: "/for/claude-code" },
    ],
    guideJsonLd: createTechArticleJsonLd({
      headline: overrides.metadata.openGraphTitle,
      description: overrides.metadata.description,
      path: INSTALL_ANYCAP_PATH,
      about: ["AnyCap CLI", "Agent skills", "Claude Code", "Cursor", "Codex"],
      keywords: ["install anycap", "install anycap cli", "anycap setup"],
      datePublished: lastUpdatedIso,
      dateModified: lastUpdatedIso,
    }),
    faqJsonLd: createFaqPageJsonLd([]),
    ...overrides,
  };
  page.faqJsonLd = createFaqPageJsonLd(page.faqItems);
  return page;
}

const contentByLocale: Record<SiteLocale, InstallAnycapPageData> = {
  en: buildInstallPageData({
    metadata: {
      title: "Install AnyCap — CLI, Auth, and First Command (2026 Guide)",
      description:
        "Install AnyCap in minutes: add the agent skill, install the CLI, log in once, verify with anycap status, and run your first image or video command in Claude Code, Cursor, or Codex.",
      openGraphTitle: "Install AnyCap — CLI, Auth, and First Command",
      openGraphDescription:
        "Step-by-step install guide for AnyCap CLI and agent skills. One auth flow, one command surface for image, video, vision, search, and publishing.",
    },
  }),
  "pt-br": buildInstallPageData({
    metadata: {
      title: "Instalar AnyCap — CLI, autenticação e primeiro comando",
      description:
        "Instale o AnyCap em minutos: adicione a skill do agente, instale a CLI, faça login uma vez, verifique com anycap status e execute o primeiro comando de imagem ou vídeo.",
      openGraphTitle: "Instalar AnyCap — CLI, autenticação e primeiro comando",
      openGraphDescription:
        "Guia passo a passo para instalar a CLI e skills do AnyCap em Claude Code, Cursor ou Codex.",
    },
    eyebrow: "Guias",
    heroTitle: ["Instalar AnyCap", "Uma skill, uma CLI, um login"],
    heroIntro:
      "Este guia é o caminho canônico de instalação do AnyCap no site principal.",
    lastUpdatedLabel: "Atualizado em 1 de junho de 2026",
    neededTitle: "Antes de começar",
    neededItems: [
      "Um agente de IA que execute comandos shell (Claude Code, Cursor, Codex ou similar)",
      "Node.js 18+ para skills.sh e instalações npm",
      "Um navegador para o login único",
      "Um terminal onde você possa colar comandos ou pedir ao agente para executá-los",
    ],
    stepsTitle: "Instale em cinco passos",
    steps: enSteps.map((step, index) => ({
      ...step,
      title:
        [
          "Instale a skill do AnyCap para seu agente",
          "Instale a CLI do AnyCap",
          "Faça login uma vez",
          "Verifique a instalação",
          "Execute o primeiro comando de capability",
        ][index] ?? step.title,
    })),
    verifyTitle: "Verifique se tudo funciona",
    verifyIntro:
      "Depois do login, rode um status rápido e liste os modelos disponíveis antes do primeiro job de geração.",
    agentsTitle: "Comandos de instalação por agente",
    faqTitle: "FAQ de instalação",
    faqItems: [
      {
        question: "Como instalar a CLI do AnyCap?",
        answer:
          "Execute curl -fsSL https://anycap.ai/install.sh | sh ou npm install -g @anycap/cli, depois anycap login.",
      },
      {
        question: "O AnyCap funciona com Claude Code e Cursor?",
        answer:
          "Sim. Instale a skill do AnyCap para claude-code, cursor ou codex. A mesma CLI e o mesmo fluxo de auth funcionam nos ambientes suportados.",
      },
      {
        question: "Preciso de login separado para cada capability?",
        answer: "Não. Um anycap login cobre geração de imagem, vídeo, visão, busca web, Drive e publicação.",
      },
      {
        question: "Qual comando devo rodar primeiro?",
        answer:
          "Rode anycap status para verificar auth e depois anycap image models ou anycap video models antes da primeira geração.",
      },
    ],
    nextTitle: "Próximas páginas",
    nextPages: [
      {
        eyebrow: "Start",
        title: "Começar",
        href: "/start",
        body: "Onboarding em linguagem natural se você preferir pedir ao agente para fazer o setup.",
      },
      {
        eyebrow: "CLI",
        title: "Referência da CLI",
        href: "/cli",
        body: "Veja a superfície completa de comandos depois da instalação.",
      },
      {
        eyebrow: "Capabilities",
        title: "Inventário de capabilities",
        href: "/capabilities",
        body: "Escolha a primeira lacuna de capability a fechar após a instalação.",
      },
    ],
    ctas: [
      { label: "Começar", href: "/start", primary: true },
      { label: "Ver CLI", href: "/cli" },
      { label: "Para Claude Code", href: "/for/claude-code" },
    ],
  }),
  id: buildInstallPageData({
    metadata: {
      title: "Instal AnyCap — CLI, auth, dan perintah pertama",
      description:
        "Instal AnyCap dalam hitungan menit: tambahkan skill agen, instal CLI, login sekali, verifikasi dengan anycap status, lalu jalankan perintah gambar atau video pertama.",
      openGraphTitle: "Instal AnyCap — CLI, auth, dan perintah pertama",
      openGraphDescription:
        "Panduan langkah demi langkah untuk menginstal AnyCap CLI dan skill agen di Claude Code, Cursor, atau Codex.",
    },
    eyebrow: "Panduan",
    heroTitle: ["Instal AnyCap", "Satu skill, satu CLI, satu login"],
    lastUpdatedLabel: "Diperbarui 1 Juni 2026",
    ctas: [
      { label: "Mulai", href: "/start", primary: true },
      { label: "Lihat CLI", href: "/cli" },
      { label: "Untuk Claude Code", href: "/for/claude-code" },
    ],
  }),
  de: buildInstallPageData({
    metadata: {
      title: "AnyCap installieren — CLI, Auth und erster Befehl",
      description:
        "AnyCap in Minuten installieren: Skill hinzufügen, CLI installieren, einmal anmelden, mit anycap status prüfen und den ersten Bild- oder Video-Befehl ausführen.",
      openGraphTitle: "AnyCap installieren — CLI, Auth und erster Befehl",
      openGraphDescription:
        "Schritt-für-Schritt-Anleitung zur Installation von AnyCap CLI und Agent-Skills für Claude Code, Cursor oder Codex.",
    },
    eyebrow: "Anleitungen",
    heroTitle: ["AnyCap installieren", "Ein Skill, eine CLI, ein Login"],
    lastUpdatedLabel: "Aktualisiert am 1. Juni 2026",
    stepsTitle: "In fünf Schritten installieren",
    steps: enSteps.map((step, index) => ({
      ...step,
      title:
        [
          "AnyCap-Skill für Ihren Agenten installieren",
          "AnyCap CLI installieren",
          "Einmal anmelden",
          "Installation verifizieren",
          "Ersten Capability-Befehl ausführen",
        ][index] ?? step.title,
    })),
    faqTitle: "Installations-FAQ",
    verifyTitle: "Alles verifizieren",
    agentsTitle: "Agent-spezifische Installationsbefehle",
    nextTitle: "Nächste Seiten",
    ctas: [
      { label: "Jetzt starten", href: "/start", primary: true },
      { label: "CLI ansehen", href: "/cli" },
      { label: "Für Claude Code", href: "/for/claude-code" },
    ],
  }),
};

export function getInstallAnycapMetadata(locale: SiteLocale): Metadata {
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

export function getInstallAnycapPageData(locale: SiteLocale) {
  return contentByLocale[locale] ?? contentByLocale.en;
}
