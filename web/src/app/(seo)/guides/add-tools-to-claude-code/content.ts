import type { Metadata } from "next";
import { getLocaleConfig, siteConfig, type SiteLocale } from "@/lib/site";

export const ADD_TOOLS_TO_CLAUDE_CODE_PATH = "/guides/add-tools-to-claude-code";

type AddToolsToClaudeCodePageData = {
  metadata: {
    title: string;
    description: string;
    openGraphTitle: string;
    openGraphDescription: string;
  };
  breadcrumbItems: readonly { name: string; href?: string; unlinkable?: boolean }[];
  eyebrow: string;
  heroTitle: string;
  heroIntro: string;
  needTitle: string;
  needItems: readonly string[];
  note: string;
  steps: readonly {
    title: string;
    command: string;
    body?: string;
    bodyCommand?: string;
  }[];
  faqTitle: string;
  faqItems: readonly { question: string; answer: string }[];
  cta: readonly { label: string; href: string }[];
};

const en: AddToolsToClaudeCodePageData = {
  metadata: {
    title: "Add tools to Claude Code — Install agent capabilities",
    description:
      "Step-by-step guide to adding image generation, video generation, image read, and video analysis tools to Claude Code using AnyCap skills and CLI.",
    openGraphTitle: "Add tools to Claude Code — Install agent capabilities",
    openGraphDescription:
      "Step-by-step guide to adding image generation, video generation, image read, and video analysis tools to Claude Code using AnyCap skills and CLI.",
  },
  breadcrumbItems: [
    { name: "Home", href: "/" },
    { name: "Guides", href: "/guides", unlinkable: true },
    { name: "Add Tools to Claude Code" },
  ],
  eyebrow: "Guides",
  heroTitle: "Add tools to Claude Code",
  heroIntro:
    "Claude Code is a powerful coding agent, but it cannot generate images, create videos, or analyze visual content on its own. AnyCap adds these capabilities through a skill file and CLI. This guide walks through the full setup — from installing the skill to generating your first image — so Claude Code can access image generation with models like Seedream 5 and Nano Banana Pro, video generation with Veo 3.1, image understanding, and video analysis through one interface.",
  needTitle: "What you need",
  needItems: [
    "Claude Code installed and working",
    "Node.js 18+ (for skills.sh and npm install)",
    "A browser for the login flow",
  ],
  note: "The following steps reflect the current install flow for adding AnyCap tools to Claude Code.",
  steps: [
    {
      title: "Install the AnyCap skill",
      command: "npx -y skills add anycap-ai/anycap -a claude-code -y",
      body:
        "This places the AnyCap SKILL.md file into Claude Code's skills directory so it can discover available capabilities.",
    },
    {
      title: "Install the AnyCap CLI",
      command: "curl -fsSL https://anycap.ai/install.sh | sh",
      body: "Or:",
      bodyCommand: "npm install -g @anycap/cli",
    },
    {
      title: "Log in",
      command: "anycap login",
    },
    {
      title: "Discover available models",
      command: "anycap image models",
      body: "Lists available image models: Seedream 5, Seedream 4.5, Nano Banana Pro, Nano Banana 2.",
    },
    {
      title: "Generate your first image",
      command: "anycap image generate --model seedream-5 --prompt \"a minimalist product mockup\"",
    },
    {
      title: "Try more capabilities",
      command: "anycap image read --url https://example.com/screenshot.png",
      body: "Image read / video analysis",
      bodyCommand: "anycap video read --url https://example.com/demo.mp4",
    },
  ],
  faqTitle: "FAQ",
  faqItems: [
    {
      question: "Do I need to install anything besides the skill and CLI?",
      answer:
        "No. The AnyCap CLI is a single binary with no runtime dependencies. The skill file teaches Claude Code how to discover it. No additional SDKs, Docker containers, or language runtimes are required.",
    },
    {
      question: "Does this work with Claude Code on all operating systems?",
      answer:
        "Yes. The AnyCap CLI supports macOS, Linux, and Windows. It runs in the same terminal session Claude Code uses.",
    },
    {
      question: "How much does it cost to generate an image?",
      answer:
        "AnyCap uses pay-as-you-go pricing with no monthly fee. New users receive $5 in free credit. See the pricing page for per-model rates.",
    },
    {
      question: "Can Claude Code call AnyCap automatically without my intervention?",
      answer:
        "Yes. Once the skill is installed and the CLI is authenticated, Claude Code can invoke any AnyCap capability in response to natural-language prompts. You can say 'generate a product mockup' and Claude Code will call the right AnyCap command.",
    },
  ],
  cta: [
    { label: "AnyCap for Claude Code", href: "/for/claude-code" },
    { label: "Any Capability", href: "/capabilities" },
  ],
};

const ptBr: AddToolsToClaudeCodePageData = {
  metadata: {
    title: "Adicionar ferramentas ao Claude Code — Instalar capacidades do agente",
    description:
      "Guia passo a passo para adicionar ferramentas de geração de imagem, geração de vídeo, leitura de imagem e análise de vídeo ao Claude Code usando skills e CLI do AnyCap.",
    openGraphTitle: "Adicionar ferramentas ao Claude Code — Instalar capacidades do agente",
    openGraphDescription:
      "Guia passo a passo para adicionar ferramentas de geração de imagem, geração de vídeo, leitura de imagem e análise de vídeo ao Claude Code usando skills e CLI do AnyCap.",
  },
  breadcrumbItems: [
    { name: "Início", href: "/" },
    { name: "Guias", href: "/guides", unlinkable: true },
    { name: "Adicionar ferramentas ao Claude Code" },
  ],
  eyebrow: "Guias",
  heroTitle: "Adicionar ferramentas ao Claude Code",
  heroIntro:
    "O Claude Code é um agente de código poderoso, mas não gera imagens, não cria vídeos e não analisa conteúdo visual sozinho. O AnyCap adiciona essas capacidades por meio de um arquivo de skill e da CLI. Este guia mostra todo o setup, da instalação da skill até a geração da primeira imagem, para que o Claude Code acesse geração de imagem com modelos como Seedream 5 e Nano Banana Pro, geração de vídeo com Veo 3.1, entendimento de imagem e análise de vídeo por uma única interface.",
  needTitle: "O que você precisa",
  needItems: [
    "Claude Code instalado e funcionando",
    "Node.js 18+ (para skills.sh e npm install)",
    "Um navegador para o fluxo de login",
  ],
  note: "Os passos abaixo refletem o fluxo atual de instalação para adicionar as ferramentas do AnyCap ao Claude Code.",
  steps: [
    {
      title: "Instale a skill do AnyCap",
      command: "npx -y skills add anycap-ai/anycap -a claude-code -y",
      body:
        "Isso coloca o arquivo SKILL.md do AnyCap no diretório de skills do Claude Code para que ele descubra as capacidades disponíveis.",
    },
    {
      title: "Instale a CLI do AnyCap",
      command: "curl -fsSL https://anycap.ai/install.sh | sh",
      body: "Ou:",
      bodyCommand: "npm install -g @anycap/cli",
    },
    {
      title: "Faça login",
      command: "anycap login",
    },
    {
      title: "Descubra os modelos disponíveis",
      command: "anycap image models",
      body: "Lista os modelos de imagem disponíveis: Seedream 5, Seedream 4.5, Nano Banana Pro e Nano Banana 2.",
    },
    {
      title: "Gere sua primeira imagem",
      command: "anycap image generate --model seedream-5 --prompt \"a minimalist product mockup\"",
    },
    {
      title: "Teste mais capacidades",
      command: "anycap image read --url https://example.com/screenshot.png",
      body: "Leitura de imagem / análise de vídeo",
      bodyCommand: "anycap video read --url https://example.com/demo.mp4",
    },
  ],
  faqTitle: "FAQ",
  faqItems: [
    {
      question: "Preciso instalar algo além da skill e da CLI?",
      answer:
        "Não. A CLI do AnyCap é um binário único, sem dependências de runtime. O arquivo de skill ensina o Claude Code a encontrá-la. Não são necessários SDKs extras, containers Docker ou runtimes de linguagem.",
    },
    {
      question: "Isso funciona com o Claude Code em todos os sistemas operacionais?",
      answer:
        "Sim. A CLI do AnyCap suporta macOS, Linux e Windows. Ela roda na mesma sessão de terminal que o Claude Code usa.",
    },
    {
      question: "Quanto custa gerar uma imagem?",
      answer:
        "O AnyCap usa preço sob demanda, sem mensalidade. Novos usuários recebem US$ 5 em crédito grátis. Veja a página de preços para os valores por modelo.",
    },
    {
      question: "O Claude Code pode chamar o AnyCap automaticamente sem minha intervenção?",
      answer:
        "Sim. Depois que a skill estiver instalada e a CLI autenticada, o Claude Code pode invocar qualquer capacidade do AnyCap em resposta a prompts em linguagem natural. Você pode dizer \"gere um mockup de produto\" e o Claude Code chamará o comando certo.",
    },
  ],
  cta: [
    { label: "AnyCap para Claude Code", href: "/for/claude-code" },
    { label: "Ver capacidades", href: "/capabilities" },
  ],
};

const contentByLocale: Record<SiteLocale, AddToolsToClaudeCodePageData> = {
  en,
  "pt-br": ptBr,
  id: en,
};

export function getAddToolsToClaudeCodeMetadata(locale: SiteLocale): Metadata {
  const content = contentByLocale[locale] ?? contentByLocale.en;
  return {
    title: content.metadata.title,
    description: content.metadata.description,
    openGraph: {
      type: "website",
      locale: getLocaleConfig(locale).ogLocale,
      url: ADD_TOOLS_TO_CLAUDE_CODE_PATH,
      siteName: siteConfig.siteName,
      title: content.metadata.openGraphTitle,
      description: content.metadata.openGraphDescription,
    },
  };
}

export function getAddToolsToClaudeCodePageData(locale: SiteLocale) {
  return contentByLocale[locale] ?? contentByLocale.en;
}
