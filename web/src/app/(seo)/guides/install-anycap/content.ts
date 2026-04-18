import type { Metadata } from "next";
import { createFaqPageJsonLd, createTechArticleJsonLd } from "@/lib/schema";
import { getLocaleConfig, siteConfig, type SiteLocale } from "@/lib/site";

export const INSTALL_ANYCAP_GUIDE_PATH = "/guides/install-anycap";

export type RichPart =
  | { type: "text"; text: string }
  | { type: "link"; text: string; href: string; external?: boolean }
  | { type: "code"; text: string };

type CodeBlock = {
  label: string;
  code: string;
};

type InstallStep = {
  number: string;
  title: string;
  description: readonly RichPart[];
  codeBlocks: readonly CodeBlock[];
};

type TroubleshootingItem = {
  title: string;
  description: readonly RichPart[];
};

type NextAction = {
  label: string;
  href: string;
  external?: boolean;
  primary?: boolean;
};

const contentByLocale = {
  en: {
    metadata: {
      title: "Install AnyCap — Natural language and CLI setup guide",
      description:
        "Install AnyCap with a natural-language prompt in supported AI agents, or follow the manual CLI and skill setup. Works with Claude Code, Cursor, Codex, and more.",
      openGraphTitle: "Install AnyCap — Natural language and CLI setup guide",
      openGraphDescription:
        "Install AnyCap with a natural-language prompt in supported AI agents, or follow the manual CLI and skill setup. Works with Claude Code, Cursor, Codex, and more.",
      articleHeadline: "Install AnyCap — Natural language and CLI setup guide",
      articleDescription:
        "Guide to installing AnyCap through natural language on supported agents or through the manual CLI and skill path.",
      articleAbout: [
        "AnyCap CLI",
        "AI agents",
        "Agent skills",
        "Natural language install",
      ],
      articleKeywords: [
        "install anycap",
        "anycap cli",
        "agent skills",
        "ai agent setup",
        "natural language install",
        "help me install anycap.ai",
      ],
    },
    howTo: {
      name: "Install AnyCap for AI agents",
      description:
        "Install AnyCap with a natural-language prompt on supported agents, or use the manual CLI and skill commands.",
      steps: [
        {
          name: "Ask your agent to install AnyCap",
          text: "In supported agents such as Claude Code or Cursor, say 'help me install anycap.ai'. The agent can discover the skill, install the CLI, authenticate, and verify the setup automatically.",
        },
        {
          name: "Use the manual setup path if needed",
          text: "If you want direct control, install the CLI with curl -fsSL https://anycap.ai/install.sh | sh or npm install -g @anycap/cli, install the skill with npx -y skills add anycap-ai/anycap -y, then run anycap login and anycap status.",
        },
        {
          name: "Use your first capability",
          text: "After setup, either ask your agent in natural language or call AnyCap directly with commands such as anycap image generate or anycap image read.",
        },
      ],
    },
    faqItems: [
      {
        question: "Can I install AnyCap with natural language?",
        answer:
          "Yes. In supported coding agents such as Claude Code and Cursor, you can say 'help me install anycap.ai' and let the agent handle skill discovery, CLI setup, authentication, and verification. If you prefer direct command control, the manual path is still available on this page.",
      },
      {
        question: "Do I still need the AnyCap CLI if I use natural language?",
        answer:
          "Yes. Natural language is the control surface, but the AnyCap CLI is still the runtime that installs locally, stores authentication, and executes capabilities such as image generation, video generation, image understanding, and video analysis.",
      },
      {
        question: "Which skill install command should I use?",
        answer:
          "Use npx -y skills add anycap-ai/anycap -a <agent> -y when you know the host agent, such as claude-code, cursor, or codex. Use the generic npx -y skills add anycap-ai/anycap -y when you want a broader default path, or use anycap skill install --target when you need manual control over the destination.",
      },
    ],
    breadcrumbItems: [
      { name: "Home", href: "/" },
      { name: "Guides", href: "/guides" },
      { name: "Install AnyCap", href: INSTALL_ANYCAP_GUIDE_PATH },
    ],
    eyebrow: "Guide",
    lastUpdatedLabel: "Last updated April 9, 2026",
    hero: {
      title: "Install AnyCap",
      fastestPathIntro: "Fastest current path: ask your agent to",
      prompt: "help me install anycap.ai",
      intro: [
        { type: "text", text: "The fastest AnyCap setup flow today is natural language. In supported agents such as " },
        { type: "link", text: "Claude Code", href: "/for/claude-code" },
        { type: "text", text: " or " },
        { type: "link", text: "Cursor", href: "/for/cursor" },
        {
          type: "text",
          text: ", you can ask the agent to install AnyCap and let it handle skill discovery, CLI setup, authentication, and verification. If you prefer direct command control, this page also includes the complete manual install path from CLI binary to first capability call.",
        },
      ] as const,
    },
    prerequisitesTitle: "Prerequisites",
    prerequisites: [
      "A compatible coding agent if you want the natural-language install path",
      "macOS, Linux, or Windows (Git Bash)",
      "Node.js 18+ (if installing via npm or skills.sh)",
      "A browser for the login flow",
    ],
    setupNotice:
      "Natural language is the fastest current setup path on supported agents. Manual CLI and skill commands remain below for direct control or unsupported environments.",
    steps: [
      {
        number: "1",
        title: "Fastest path: ask your agent to install AnyCap",
        description: [
          { type: "text", text: "On supported agents, this can trigger skill discovery, CLI install, authentication, verification, and your first capability call without memorizing commands. Start here if you use " },
          { type: "link", text: "Claude Code", href: "/for/claude-code" },
          { type: "text", text: " or " },
          { type: "link", text: "Cursor", href: "/for/cursor" },
          { type: "text", text: ". If you want explicit terminal control, continue with the manual steps below." },
        ],
        codeBlocks: [
          {
            label: "# Example prompt",
            code: "help me install anycap.ai",
          },
        ],
      },
      {
        number: "2",
        title: "Install the CLI manually",
        description: [
          { type: "text", text: "Binaries are also available on " },
          {
            type: "link",
            text: "GitHub Releases",
            href: "https://github.com/anycap-ai/anycap/releases",
            external: true,
          },
          { type: "text", text: "." },
        ],
        codeBlocks: [
          {
            label: "# Install script (recommended)",
            code: "curl -fsSL https://anycap.ai/install.sh | sh",
          },
          {
            label: "# Or via npm",
            code: "npm install -g @anycap/cli",
          },
        ],
      },
      {
        number: "3",
        title: "Log in",
        description: [
          {
            type: "text",
            text: "This opens a browser for authentication. After login, credentials are stored securely on your machine.",
          },
        ],
        codeBlocks: [
          {
            label: "# Login",
            code: "anycap login",
          },
        ],
      },
      {
        number: "4",
        title: "Install the skill file manually",
        description: [
          {
            type: "text",
            text: "Skills teach AI agents how to discover and invoke AnyCap capabilities. Use the agent-specific ",
          },
          { type: "code", text: "skills add" },
          {
            type: "text",
            text: " command when you know the host agent. Use the generic target path when you need manual control over where the skill file lives.",
          },
        ],
        codeBlocks: [
          {
            label: "# skills.sh (generic)",
            code: "npx -y skills add anycap-ai/anycap -y",
          },
          {
            label: "# skills.sh (agent-specific)",
            code: [
              "npx -y skills add anycap-ai/anycap -a claude-code -y",
              "npx -y skills add anycap-ai/anycap -a cursor -y",
              "npx -y skills add anycap-ai/anycap -a codex -y",
            ].join("\n"),
          },
          {
            label: "# Or via AnyCap CLI",
            code: "anycap skill install --target ~/.agents/skills/anycap-cli/",
          },
          {
            label: "# Or manually",
            code: "curl -fsSL https://raw.githubusercontent.com/anycap-ai/anycap/main/skills/anycap-cli/SKILL.md --create-dirs -o ~/.agents/skills/anycap-cli/SKILL.md",
          },
        ],
      },
      {
        number: "5",
        title: "Verify",
        description: [
          {
            type: "text",
            text: "This confirms CLI version, authentication state, server connection, and skill installation.",
          },
        ],
        codeBlocks: [
          {
            label: "# Verify setup",
            code: ["anycap status", "npx -y skills check"].join("\n"),
          },
        ],
      },
      {
        number: "6",
        title: "Use your first capability",
        description: [],
        codeBlocks: [
          {
            label: "# Or ask your agent",
            code: "generate a product mockup image with AnyCap",
          },
          {
            label: "# Understand an image",
            code: "anycap image read --url https://example.com/photo.jpg",
          },
          {
            label: "# Generate an image",
            code: 'anycap image generate --model seedream-5 --prompt "a sunset over mountains"',
          },
        ],
      },
    ] as const satisfies readonly InstallStep[],
    troubleshootingTitle: "Common Issues",
    troubleshootingItems: [
      {
        title: "Natural-language install does not work in my agent",
        description: [
          { type: "text", text: "Use the manual CLI and skill steps on this page, or follow an agent-specific guide for " },
          { type: "link", text: "Claude Code", href: "/for/claude-code" },
          { type: "text", text: ", " },
          { type: "link", text: "Cursor", href: "/for/cursor" },
          { type: "text", text: ", or " },
          { type: "link", text: "Codex", href: "/for/codex" },
          { type: "text", text: "." },
        ],
      },
      {
        title: "Install script fails on macOS",
        description: [
          { type: "text", text: "Try installing via npm instead: " },
          { type: "code", text: "npm install -g @anycap/cli" },
        ],
      },
      {
        title: "Login does not open a browser",
        description: [
          { type: "text", text: "Use device code flow: " },
          { type: "code", text: "anycap login --headless" },
        ],
      },
      {
        title: "Permission denied",
        description: [
          {
            type: "text",
            text: "Ensure the install directory is writable, or use npm with a user-level global prefix.",
          },
        ],
      },
    ] as const satisfies readonly TroubleshootingItem[],
    faqTitle: "Common Questions",
    nextStepsTitle: "Next Steps",
    nextActions: [
      {
        label: "View on GitHub",
        href: "https://github.com/anycap-ai/anycap",
        external: true,
        primary: true,
      },
      { label: "For Claude Code", href: "/for/claude-code" },
      { label: "Any Capability", href: "/capabilities" },
      { label: "CLI Overview", href: "/cli" },
    ] as const satisfies readonly NextAction[],
  },
  "pt-br": {
    metadata: {
      title: "Instalar AnyCap — Guia de setup por linguagem natural e CLI",
      description:
        "Instale o AnyCap com um prompt em linguagem natural em agentes compatíveis, ou siga o setup manual de CLI e skill. Funciona com Claude Code, Cursor, Codex e mais.",
      openGraphTitle: "Instalar AnyCap — Guia de setup por linguagem natural e CLI",
      openGraphDescription:
        "Instale o AnyCap com um prompt em linguagem natural em agentes compatíveis, ou siga o setup manual de CLI e skill. Funciona com Claude Code, Cursor, Codex e mais.",
      articleHeadline: "Instalar AnyCap — Guia de setup por linguagem natural e CLI",
      articleDescription:
        "Guia para instalar o AnyCap por linguagem natural em agentes compatíveis ou pelo caminho manual com CLI e skill.",
      articleAbout: [
        "AnyCap CLI",
        "agentes de IA",
        "skills para agentes",
        "instalação por linguagem natural",
      ],
      articleKeywords: [
        "instalar anycap",
        "anycap cli",
        "skills para agentes",
        "setup de agente ia",
        "instalação por linguagem natural",
        "help me install anycap.ai",
      ],
    },
    howTo: {
      name: "Instalar AnyCap para agentes de IA",
      description:
        "Instale o AnyCap com um prompt em linguagem natural em agentes compatíveis, ou use o caminho manual com CLI e comandos de skill.",
      steps: [
        {
          name: "Peça ao seu agente para instalar o AnyCap",
          text: "Em agentes compatíveis, como Claude Code ou Cursor, diga 'help me install anycap.ai'. O agente pode descobrir a skill, instalar a CLI, autenticar e verificar o setup automaticamente.",
        },
        {
          name: "Use o caminho manual se precisar",
          text: "Se quiser controle direto, instale a CLI com curl -fsSL https://anycap.ai/install.sh | sh ou npm install -g @anycap/cli, instale a skill com npx -y skills add anycap-ai/anycap -y e depois rode anycap login e anycap status.",
        },
        {
          name: "Use a sua primeira capability",
          text: "Depois do setup, ou peça ao agente em linguagem natural, ou chame o AnyCap diretamente com comandos como anycap image generate ou anycap image read.",
        },
      ],
    },
    faqItems: [
      {
        question: "Posso instalar o AnyCap com linguagem natural?",
        answer:
          "Sim. Em agentes de código compatíveis, como Claude Code e Cursor, você pode dizer 'help me install anycap.ai' e deixar o agente cuidar da descoberta da skill, do setup da CLI, da autenticação e da verificação. Se preferir controle direto por comandos, o caminho manual continua disponível nesta página.",
      },
      {
        question: "Eu ainda preciso da CLI do AnyCap se usar linguagem natural?",
        answer:
          "Sim. A linguagem natural é a superfície de controle, mas a CLI do AnyCap continua sendo o runtime instalado localmente, que armazena autenticação e executa capabilities como geração de imagem, geração de vídeo, entendimento de imagem e análise de vídeo.",
      },
      {
        question: "Qual comando de instalação de skill devo usar?",
        answer:
          "Use npx -y skills add anycap-ai/anycap -a <agent> -y quando souber o agente hospedeiro, como claude-code, cursor ou codex. Use o comando genérico npx -y skills add anycap-ai/anycap -y quando quiser um caminho padrão mais amplo, ou use anycap skill install --target quando precisar de controle manual sobre o destino.",
      },
    ],
    breadcrumbItems: [
      { name: "Início", href: "/" },
      { name: "Guias", href: "/guides" },
      { name: "Instalar AnyCap", href: INSTALL_ANYCAP_GUIDE_PATH },
    ],
    eyebrow: "Guia",
    lastUpdatedLabel: "Atualizado em 9 de abril de 2026",
    hero: {
      title: "Instalar AnyCap",
      fastestPathIntro: "Caminho mais rápido hoje: peça ao seu agente para",
      prompt: "help me install anycap.ai",
      intro: [
        { type: "text", text: "O fluxo mais rápido para configurar o AnyCap hoje é por linguagem natural. Em agentes compatíveis, como " },
        { type: "link", text: "Claude Code", href: "/for/claude-code" },
        { type: "text", text: " ou " },
        { type: "link", text: "Cursor", href: "/for/cursor" },
        {
          type: "text",
          text: ", você pode pedir ao agente para instalar o AnyCap e deixar que ele cuide da descoberta da skill, do setup da CLI, da autenticação e da verificação. Se preferir controle direto por comandos, esta página também traz o caminho manual completo, da CLI à primeira capability.",
        },
      ] as const,
    },
    prerequisitesTitle: "Pré-requisitos",
    prerequisites: [
      "Um agente de código compatível se você quiser o caminho de instalação por linguagem natural",
      "macOS, Linux ou Windows (Git Bash)",
      "Node.js 18+ (se instalar via npm ou skills.sh)",
      "Um navegador para o fluxo de login",
    ],
    setupNotice:
      "A linguagem natural é o caminho mais rápido hoje em agentes compatíveis. Os comandos manuais de CLI e skill continuam abaixo para controle direto ou ambientes não compatíveis.",
    steps: [
      {
        number: "1",
        title: "Caminho mais rápido: peça ao agente para instalar o AnyCap",
        description: [
          { type: "text", text: "Em agentes compatíveis, isso pode acionar descoberta da skill, instalação da CLI, autenticação, verificação e até a primeira capability sem que você precise decorar comandos. Comece por aqui se usar " },
          { type: "link", text: "Claude Code", href: "/for/claude-code" },
          { type: "text", text: " ou " },
          { type: "link", text: "Cursor", href: "/for/cursor" },
          { type: "text", text: ". Se quiser controle explícito pelo terminal, siga com os passos manuais abaixo." },
        ],
        codeBlocks: [
          {
            label: "# Prompt de exemplo",
            code: "help me install anycap.ai",
          },
        ],
      },
      {
        number: "2",
        title: "Instale a CLI manualmente",
        description: [
          { type: "text", text: "Os binários também estão disponíveis em " },
          {
            type: "link",
            text: "GitHub Releases",
            href: "https://github.com/anycap-ai/anycap/releases",
            external: true,
          },
          { type: "text", text: "." },
        ],
        codeBlocks: [
          {
            label: "# Script de instalação (recomendado)",
            code: "curl -fsSL https://anycap.ai/install.sh | sh",
          },
          {
            label: "# Ou via npm",
            code: "npm install -g @anycap/cli",
          },
        ],
      },
      {
        number: "3",
        title: "Faça login",
        description: [
          {
            type: "text",
            text: "Isso abre um navegador para autenticação. Depois do login, as credenciais ficam armazenadas com segurança na sua máquina.",
          },
        ],
        codeBlocks: [
          {
            label: "# Login",
            code: "anycap login",
          },
        ],
      },
      {
        number: "4",
        title: "Instale o arquivo de skill manualmente",
        description: [
          {
            type: "text",
            text: "As skills ensinam agentes de IA a descobrir e invocar as capabilities do AnyCap. Use o comando específico de ",
          },
          { type: "code", text: "skills add" },
          {
            type: "text",
            text: " quando souber qual é o agente hospedeiro. Use o caminho genérico quando precisar de controle manual sobre onde o arquivo da skill vai ficar.",
          },
        ],
        codeBlocks: [
          {
            label: "# skills.sh (genérico)",
            code: "npx -y skills add anycap-ai/anycap -y",
          },
          {
            label: "# skills.sh (específico por agente)",
            code: [
              "npx -y skills add anycap-ai/anycap -a claude-code -y",
              "npx -y skills add anycap-ai/anycap -a cursor -y",
              "npx -y skills add anycap-ai/anycap -a codex -y",
            ].join("\n"),
          },
          {
            label: "# Ou via AnyCap CLI",
            code: "anycap skill install --target ~/.agents/skills/anycap-cli/",
          },
          {
            label: "# Ou manualmente",
            code: "curl -fsSL https://raw.githubusercontent.com/anycap-ai/anycap/main/skills/anycap-cli/SKILL.md --create-dirs -o ~/.agents/skills/anycap-cli/SKILL.md",
          },
        ],
      },
      {
        number: "5",
        title: "Verifique",
        description: [
          {
            type: "text",
            text: "Isso confirma a versão da CLI, o estado da autenticação, a conexão com o servidor e a instalação da skill.",
          },
        ],
        codeBlocks: [
          {
            label: "# Verificar setup",
            code: ["anycap status", "npx -y skills check"].join("\n"),
          },
        ],
      },
      {
        number: "6",
        title: "Use a sua primeira capability",
        description: [],
        codeBlocks: [
          {
            label: "# Ou peça ao agente",
            code: "generate a product mockup image with AnyCap",
          },
          {
            label: "# Entender uma imagem",
            code: "anycap image read --url https://example.com/photo.jpg",
          },
          {
            label: "# Gerar uma imagem",
            code: 'anycap image generate --model seedream-5 --prompt "a sunset over mountains"',
          },
        ],
      },
    ] as const satisfies readonly InstallStep[],
    troubleshootingTitle: "Problemas comuns",
    troubleshootingItems: [
      {
        title: "A instalação por linguagem natural não funciona no meu agente",
        description: [
          { type: "text", text: "Use os passos manuais de CLI e skill desta página, ou siga um guia específico para " },
          { type: "link", text: "Claude Code", href: "/for/claude-code" },
          { type: "text", text: ", " },
          { type: "link", text: "Cursor", href: "/for/cursor" },
          { type: "text", text: " ou " },
          { type: "link", text: "Codex", href: "/for/codex" },
          { type: "text", text: "." },
        ],
      },
      {
        title: "O script de instalação falha no macOS",
        description: [
          { type: "text", text: "Tente instalar via npm: " },
          { type: "code", text: "npm install -g @anycap/cli" },
        ],
      },
      {
        title: "O login não abre um navegador",
        description: [
          { type: "text", text: "Use o fluxo por código de dispositivo: " },
          { type: "code", text: "anycap login --headless" },
        ],
      },
      {
        title: "Permissão negada",
        description: [
          {
            type: "text",
            text: "Verifique se o diretório de instalação é gravável ou use npm com um prefixo global em nível de usuário.",
          },
        ],
      },
    ] as const satisfies readonly TroubleshootingItem[],
    faqTitle: "Perguntas comuns",
    nextStepsTitle: "Próximos passos",
    nextActions: [
      {
        label: "Ver no GitHub",
        href: "https://github.com/anycap-ai/anycap",
        external: true,
        primary: true,
      },
      { label: "Para Claude Code", href: "/for/claude-code" },
      { label: "Ver capabilities", href: "/capabilities" },
      { label: "Visão geral da CLI", href: "/cli" },
    ] as const satisfies readonly NextAction[],
  },
  id: {
    metadata: {
      title: "Install AnyCap — Panduan setup dengan bahasa natural dan CLI",
      description:
        "Pasang AnyCap dengan prompt bahasa natural di agen AI yang kompatibel, atau ikuti setup CLI dan skill secara manual. Bekerja dengan Claude Code, Cursor, Codex, dan lainnya.",
      openGraphTitle: "Install AnyCap — Panduan setup dengan bahasa natural dan CLI",
      openGraphDescription:
        "Pasang AnyCap dengan prompt bahasa natural di agen AI yang kompatibel, atau ikuti setup CLI dan skill secara manual. Bekerja dengan Claude Code, Cursor, Codex, dan lainnya.",
      articleHeadline: "Install AnyCap — Panduan setup dengan bahasa natural dan CLI",
      articleDescription:
        "Panduan memasang AnyCap melalui bahasa natural di agen yang kompatibel atau melalui jalur manual CLI dan skill.",
      articleAbout: [
        "AnyCap CLI",
        "agen AI",
        "skill agen",
        "instalasi bahasa natural",
      ],
      articleKeywords: [
        "install anycap",
        "anycap cli",
        "skill agen",
        "setup agen ai",
        "instalasi bahasa natural",
        "help me install anycap.ai",
      ],
    },
    howTo: {
      name: "Install AnyCap untuk agen AI",
      description:
        "Pasang AnyCap dengan prompt bahasa natural pada agen yang kompatibel, atau gunakan jalur manual dengan CLI dan perintah skill.",
      steps: [
        {
          name: "Minta agenmu memasang AnyCap",
          text: "Di agen yang kompatibel seperti Claude Code atau Cursor, katakan 'help me install anycap.ai'. Agen dapat menemukan skill, memasang CLI, melakukan autentikasi, dan memverifikasi setup secara otomatis.",
        },
        {
          name: "Gunakan jalur manual bila diperlukan",
          text: "Jika kamu ingin kontrol langsung, pasang CLI dengan curl -fsSL https://anycap.ai/install.sh | sh atau npm install -g @anycap/cli, pasang skill dengan npx -y skills add anycap-ai/anycap -y, lalu jalankan anycap login dan anycap status.",
        },
        {
          name: "Gunakan capability pertamamu",
          text: "Setelah setup, kamu bisa meminta agen dengan bahasa natural atau memanggil AnyCap langsung dengan command seperti anycap image generate atau anycap image read.",
        },
      ],
    },
    faqItems: [
      {
        question: "Bisakah saya menginstal AnyCap dengan bahasa natural?",
        answer:
          "Ya. Di agen coding yang kompatibel seperti Claude Code dan Cursor, kamu bisa mengatakan 'help me install anycap.ai' dan membiarkan agen menangani penemuan skill, setup CLI, autentikasi, serta verifikasi. Jika kamu lebih suka kontrol langsung lewat command, jalur manual tetap tersedia di halaman ini.",
      },
      {
        question: "Apakah saya tetap membutuhkan AnyCap CLI jika memakai bahasa natural?",
        answer:
          "Ya. Bahasa natural adalah control surface, tetapi AnyCap CLI tetap merupakan runtime yang dipasang secara lokal, menyimpan autentikasi, dan menjalankan capabilities seperti image generation, video generation, image understanding, dan video analysis.",
      },
      {
        question: "Perintah instalasi skill mana yang sebaiknya saya pakai?",
        answer:
          "Gunakan npx -y skills add anycap-ai/anycap -a <agent> -y ketika kamu tahu host agent-nya, seperti claude-code, cursor, atau codex. Gunakan perintah generik npx -y skills add anycap-ai/anycap -y ketika kamu menginginkan jalur default yang lebih luas, atau gunakan anycap skill install --target ketika kamu perlu kontrol manual atas lokasi tujuan.",
      },
    ],
    breadcrumbItems: [
      { name: "Beranda", href: "/" },
      { name: "Panduan", href: "/guides" },
      { name: "Install AnyCap", href: INSTALL_ANYCAP_GUIDE_PATH },
    ],
    eyebrow: "Panduan",
    lastUpdatedLabel: "Diperbarui 9 April 2026",
    hero: {
      title: "Install AnyCap",
      fastestPathIntro: "Jalur tercepat saat ini: minta agenmu untuk",
      prompt: "help me install anycap.ai",
      intro: [
        { type: "text", text: "Alur setup AnyCap yang paling cepat saat ini adalah dengan bahasa natural. Di agen yang kompatibel seperti " },
        { type: "link", text: "Claude Code", href: "/for/claude-code" },
        { type: "text", text: " atau " },
        { type: "link", text: "Cursor", href: "/for/cursor" },
        {
          type: "text",
          text: ", kamu bisa meminta agen untuk memasang AnyCap dan membiarkannya menangani penemuan skill, setup CLI, autentikasi, serta verifikasi. Jika kamu lebih suka kontrol command langsung, halaman ini juga memuat jalur manual lengkap dari binary CLI hingga capability pertama.",
        },
      ] as const,
    },
    prerequisitesTitle: "Prasyarat",
    prerequisites: [
      "Agen coding yang kompatibel jika kamu ingin menggunakan jalur instalasi bahasa natural",
      "macOS, Linux, atau Windows (Git Bash)",
      "Node.js 18+ (jika memasang lewat npm atau skills.sh)",
      "Browser untuk alur login",
    ],
    setupNotice:
      "Bahasa natural adalah jalur setup tercepat saat ini pada agen yang kompatibel. Perintah CLI dan skill manual tetap ada di bawah untuk kontrol langsung atau lingkungan yang belum kompatibel.",
    steps: [
      {
        number: "1",
        title: "Jalur tercepat: minta agenmu memasang AnyCap",
        description: [
          { type: "text", text: "Di agen yang kompatibel, ini bisa memicu penemuan skill, instalasi CLI, autentikasi, verifikasi, dan capability pertama tanpa perlu menghafal command. Mulailah dari sini jika kamu memakai " },
          { type: "link", text: "Claude Code", href: "/for/claude-code" },
          { type: "text", text: " atau " },
          { type: "link", text: "Cursor", href: "/for/cursor" },
          { type: "text", text: ". Jika kamu ingin kontrol terminal yang eksplisit, lanjutkan ke langkah manual di bawah." },
        ],
        codeBlocks: [
          {
            label: "# Prompt contoh",
            code: "help me install anycap.ai",
          },
        ],
      },
      {
        number: "2",
        title: "Pasang CLI secara manual",
        description: [
          { type: "text", text: "Binary juga tersedia di " },
          {
            type: "link",
            text: "GitHub Releases",
            href: "https://github.com/anycap-ai/anycap/releases",
            external: true,
          },
          { type: "text", text: "." },
        ],
        codeBlocks: [
          {
            label: "# Script instalasi (direkomendasikan)",
            code: "curl -fsSL https://anycap.ai/install.sh | sh",
          },
          {
            label: "# Atau via npm",
            code: "npm install -g @anycap/cli",
          },
        ],
      },
      {
        number: "3",
        title: "Login",
        description: [
          {
            type: "text",
            text: "Ini akan membuka browser untuk autentikasi. Setelah login, kredensial akan tersimpan dengan aman di mesinmu.",
          },
        ],
        codeBlocks: [
          {
            label: "# Login",
            code: "anycap login",
          },
        ],
      },
      {
        number: "4",
        title: "Pasang file skill secara manual",
        description: [
          {
            type: "text",
            text: "Skill mengajarkan agen AI cara menemukan dan memanggil capabilities AnyCap. Gunakan perintah khusus ",
          },
          { type: "code", text: "skills add" },
          {
            type: "text",
            text: " ketika kamu tahu host agent-nya. Gunakan target path generik ketika kamu membutuhkan kontrol manual atas lokasi file skill disimpan.",
          },
        ],
        codeBlocks: [
          {
            label: "# skills.sh (generik)",
            code: "npx -y skills add anycap-ai/anycap -y",
          },
          {
            label: "# skills.sh (khusus agen)",
            code: [
              "npx -y skills add anycap-ai/anycap -a claude-code -y",
              "npx -y skills add anycap-ai/anycap -a cursor -y",
              "npx -y skills add anycap-ai/anycap -a codex -y",
            ].join("\n"),
          },
          {
            label: "# Atau via AnyCap CLI",
            code: "anycap skill install --target ~/.agents/skills/anycap-cli/",
          },
          {
            label: "# Atau manual",
            code: "curl -fsSL https://raw.githubusercontent.com/anycap-ai/anycap/main/skills/anycap-cli/SKILL.md --create-dirs -o ~/.agents/skills/anycap-cli/SKILL.md",
          },
        ],
      },
      {
        number: "5",
        title: "Verifikasi",
        description: [
          {
            type: "text",
            text: "Langkah ini memastikan versi CLI, status autentikasi, koneksi server, dan instalasi skill sudah benar.",
          },
        ],
        codeBlocks: [
          {
            label: "# Verifikasi setup",
            code: ["anycap status", "npx -y skills check"].join("\n"),
          },
        ],
      },
      {
        number: "6",
        title: "Gunakan capability pertamamu",
        description: [],
        codeBlocks: [
          {
            label: "# Atau minta agenmu",
            code: "generate a product mockup image with AnyCap",
          },
          {
            label: "# Pahami sebuah gambar",
            code: "anycap image read --url https://example.com/photo.jpg",
          },
          {
            label: "# Hasilkan sebuah gambar",
            code: 'anycap image generate --model seedream-5 --prompt "a sunset over mountains"',
          },
        ],
      },
    ] as const satisfies readonly InstallStep[],
    troubleshootingTitle: "Masalah umum",
    troubleshootingItems: [
      {
        title: "Instalasi bahasa natural tidak bekerja di agen saya",
        description: [
          { type: "text", text: "Gunakan langkah CLI dan skill manual di halaman ini, atau ikuti panduan khusus agen untuk " },
          { type: "link", text: "Claude Code", href: "/for/claude-code" },
          { type: "text", text: ", " },
          { type: "link", text: "Cursor", href: "/for/cursor" },
          { type: "text", text: ", atau " },
          { type: "link", text: "Codex", href: "/for/codex" },
          { type: "text", text: "." },
        ],
      },
      {
        title: "Script instalasi gagal di macOS",
        description: [
          { type: "text", text: "Coba pasang lewat npm: " },
          { type: "code", text: "npm install -g @anycap/cli" },
        ],
      },
      {
        title: "Login tidak membuka browser",
        description: [
          { type: "text", text: "Gunakan device code flow: " },
          { type: "code", text: "anycap login --headless" },
        ],
      },
      {
        title: "Permission denied",
        description: [
          {
            type: "text",
            text: "Pastikan direktori instalasi dapat ditulisi, atau gunakan npm dengan user-level global prefix.",
          },
        ],
      },
    ] as const satisfies readonly TroubleshootingItem[],
    faqTitle: "Pertanyaan umum",
    nextStepsTitle: "Langkah berikutnya",
    nextActions: [
      {
        label: "Lihat di GitHub",
        href: "https://github.com/anycap-ai/anycap",
        external: true,
        primary: true,
      },
      { label: "Untuk Claude Code", href: "/for/claude-code" },
      { label: "Lihat capabilities", href: "/capabilities" },
      { label: "Ringkasan CLI", href: "/cli" },
    ] as const satisfies readonly NextAction[],
  },
  de: {
    metadata: {
      title: "AnyCap installieren — Setup-Anleitung mit natürlicher Sprache und CLI",
      description:
        "Installieren Sie AnyCap mit einem Prompt in natürlicher Sprache in unterstützten KI-Agenten oder folgen Sie dem manuellen CLI- und Skill-Setup. Funktioniert mit Claude Code, Cursor, Codex und mehr.",
      openGraphTitle: "AnyCap installieren — Setup-Anleitung mit natürlicher Sprache und CLI",
      openGraphDescription:
        "Installieren Sie AnyCap mit einem Prompt in natürlicher Sprache in unterstützten KI-Agenten oder folgen Sie dem manuellen CLI- und Skill-Setup. Funktioniert mit Claude Code, Cursor, Codex und mehr.",
      articleHeadline: "AnyCap installieren — Setup-Anleitung mit natürlicher Sprache und CLI",
      articleDescription:
        "Anleitung zur Installation von AnyCap über natürliche Sprache in unterstützten Agenten oder über den manuellen Pfad mit CLI und Skill.",
      articleAbout: [
        "AnyCap CLI",
        "KI-Agenten",
        "Agent-Skills",
        "Installation in natürlicher Sprache",
      ],
      articleKeywords: [
        "anycap installieren",
        "anycap cli",
        "agent skills",
        "ki-agent setup",
        "installation in natürlicher sprache",
        "help me install anycap.ai",
      ],
    },
    howTo: {
      name: "AnyCap für KI-Agenten installieren",
      description:
        "Installieren Sie AnyCap mit einem Prompt in natürlicher Sprache in unterstützten Agenten oder nutzen Sie den manuellen Pfad mit CLI- und Skill-Befehlen.",
      steps: [
        {
          name: "Bitten Sie Ihren Agenten, AnyCap zu installieren",
          text: "Sagen Sie in unterstützten Agenten wie Claude Code oder Cursor „help me install anycap.ai“. Der Agent kann den Skill entdecken, die CLI installieren, sich authentifizieren und das Setup automatisch verifizieren.",
        },
        {
          name: "Nutzen Sie bei Bedarf den manuellen Setup-Pfad",
          text: "Wenn Sie direkte Kontrolle wünschen, installieren Sie die CLI mit curl -fsSL https://anycap.ai/install.sh | sh oder npm install -g @anycap/cli, installieren Sie den Skill mit npx -y skills add anycap-ai/anycap -y und führen Sie dann anycap login und anycap status aus.",
        },
        {
          name: "Nutzen Sie Ihre erste Capability",
          text: "Nach dem Setup können Sie entweder Ihren Agenten in natürlicher Sprache fragen oder AnyCap direkt mit Befehlen wie anycap image generate oder anycap image read aufrufen.",
        },
      ],
    },
    faqItems: [
      {
        question: "Kann ich AnyCap mit natürlicher Sprache installieren?",
        answer:
          "Ja. In unterstützten Coding-Agenten wie Claude Code und Cursor können Sie „help me install anycap.ai“ sagen und den Agenten die Skill-Erkennung, das CLI-Setup, die Authentifizierung und die Verifizierung übernehmen lassen. Wenn Sie direkte Befehlskontrolle bevorzugen, ist der manuelle Pfad auf dieser Seite weiterhin verfügbar.",
      },
      {
        question: "Brauche ich die AnyCap CLI weiterhin, wenn ich natürliche Sprache verwende?",
        answer:
          "Ja. Natürliche Sprache ist die Steuerungsoberfläche, aber die AnyCap CLI bleibt die Runtime, die lokal installiert wird, die Authentifizierung speichert und Capabilities wie Bildgenerierung, Videogenerierung, Bildverständnis und Videoanalyse ausführt.",
      },
      {
        question: "Welchen Skill-Installationsbefehl sollte ich verwenden?",
        answer:
          "Verwenden Sie npx -y skills add anycap-ai/anycap -a <agent> -y, wenn Sie den Host-Agenten kennen, etwa claude-code, cursor oder codex. Verwenden Sie den generischen Befehl npx -y skills add anycap-ai/anycap -y, wenn Sie einen breiteren Standardpfad wünschen, oder anycap skill install --target, wenn Sie manuelle Kontrolle über das Ziel benötigen.",
      },
    ],
    breadcrumbItems: [
      { name: "Startseite", href: "/" },
      { name: "Anleitungen", href: "/guides" },
      { name: "AnyCap installieren", href: INSTALL_ANYCAP_GUIDE_PATH },
    ],
    eyebrow: "Anleitung",
    lastUpdatedLabel: "Zuletzt aktualisiert am 9. April 2026",
    hero: {
      title: "AnyCap installieren",
      fastestPathIntro: "Schnellster aktueller Pfad: Bitten Sie Ihren Agent um",
      prompt: "help me install anycap.ai",
      intro: [
        { type: "text", text: "Der schnellste AnyCap-Setup-Flow heute ist natürliche Sprache. In unterstützten Agenten wie " },
        { type: "link", text: "Claude Code", href: "/for/claude-code" },
        { type: "text", text: " oder " },
        { type: "link", text: "Cursor", href: "/for/cursor" },
        {
          type: "text",
          text: " können Sie den Agenten bitten, AnyCap zu installieren, und ihn die Skill-Erkennung, das CLI-Setup, die Authentifizierung und die Verifizierung übernehmen lassen. Wenn Sie direkte Befehlskontrolle bevorzugen, enthält diese Seite auch den vollständigen manuellen Installationspfad vom CLI-Binary bis zum ersten Capability-Aufruf.",
        },
      ] as const,
    },
    prerequisitesTitle: "Voraussetzungen",
    prerequisites: [
      "Ein kompatibler Coding-Agent, falls Sie den Installationspfad mit natürlicher Sprache nutzen möchten",
      "macOS, Linux oder Windows (Git Bash)",
      "Node.js 18+ (bei Installation über npm oder skills.sh)",
      "Ein Browser für den Login-Flow",
    ],
    setupNotice:
      "Natürliche Sprache ist der schnellste aktuelle Setup-Pfad in unterstützten Agenten. Manuelle CLI- und Skill-Befehle bleiben unten für direkte Kontrolle oder nicht unterstützte Umgebungen verfügbar.",
    steps: [
      {
        number: "1",
        title: "Schnellster Pfad: Bitten Sie Ihren Agenten, AnyCap zu installieren",
        description: [
          { type: "text", text: "In unterstützten Agenten kann dies Skill-Erkennung, CLI-Installation, Authentifizierung, Verifizierung und Ihren ersten Capability-Aufruf auslösen, ohne dass Sie sich Befehle merken müssen. Beginnen Sie hier, wenn Sie " },
          { type: "link", text: "Claude Code", href: "/for/claude-code" },
          { type: "text", text: " oder " },
          { type: "link", text: "Cursor", href: "/for/cursor" },
          { type: "text", text: " verwenden. Wenn Sie explizite Terminal-Kontrolle wünschen, fahren Sie mit den manuellen Schritten unten fort." },
        ],
        codeBlocks: [
          {
            label: "# Beispiel-Prompt",
            code: "help me install anycap.ai",
          },
        ],
      },
      {
        number: "2",
        title: "CLI manuell installieren",
        description: [
          { type: "text", text: "Binaries sind auch verfügbar auf " },
          {
            type: "link",
            text: "GitHub Releases",
            href: "https://github.com/anycap-ai/anycap/releases",
            external: true,
          },
          { type: "text", text: "." },
        ],
        codeBlocks: [
          {
            label: "# Installationsskript (empfohlen)",
            code: "curl -fsSL https://anycap.ai/install.sh | sh",
          },
          {
            label: "# Oder über npm",
            code: "npm install -g @anycap/cli",
          },
        ],
      },
      {
        number: "3",
        title: "Anmelden",
        description: [
          {
            type: "text",
            text: "Dies öffnet einen Browser zur Authentifizierung. Nach dem Login werden die Anmeldedaten sicher auf Ihrem Rechner gespeichert.",
          },
        ],
        codeBlocks: [
          {
            label: "# Login",
            code: "anycap login",
          },
        ],
      },
      {
        number: "4",
        title: "Skill-Datei manuell installieren",
        description: [
          {
            type: "text",
            text: "Skills bringen KI-Agenten bei, AnyCap-Capabilities zu entdecken und aufzurufen. Verwenden Sie den agent-spezifischen ",
          },
          { type: "code", text: "skills add" },
          {
            type: "text",
            text: "-Befehl, wenn Sie den Host-Agenten kennen. Verwenden Sie den generischen Zielpfad, wenn Sie manuelle Kontrolle über den Speicherort der Skill-Datei benötigen.",
          },
        ],
        codeBlocks: [
          {
            label: "# skills.sh (generisch)",
            code: "npx -y skills add anycap-ai/anycap -y",
          },
          {
            label: "# skills.sh (agent-spezifisch)",
            code: [
              "npx -y skills add anycap-ai/anycap -a claude-code -y",
              "npx -y skills add anycap-ai/anycap -a cursor -y",
              "npx -y skills add anycap-ai/anycap -a codex -y",
            ].join("\n"),
          },
          {
            label: "# Oder über AnyCap CLI",
            code: "anycap skill install --target ~/.agents/skills/anycap-cli/",
          },
          {
            label: "# Oder manuell",
            code: "curl -fsSL https://raw.githubusercontent.com/anycap-ai/anycap/main/skills/anycap-cli/SKILL.md --create-dirs -o ~/.agents/skills/anycap-cli/SKILL.md",
          },
        ],
      },
      {
        number: "5",
        title: "Verifizieren",
        description: [
          {
            type: "text",
            text: "Dies bestätigt CLI-Version, Authentifizierungsstatus, Serververbindung und Skill-Installation.",
          },
        ],
        codeBlocks: [
          {
            label: "# Setup verifizieren",
            code: ["anycap status", "npx -y skills check"].join("\n"),
          },
        ],
      },
      {
        number: "6",
        title: "Nutzen Sie Ihre erste Capability",
        description: [],
        codeBlocks: [
          {
            label: "# Oder fragen Sie Ihren Agenten",
            code: "generate a product mockup image with AnyCap",
          },
          {
            label: "# Ein Bild verstehen",
            code: "anycap image read --url https://example.com/photo.jpg",
          },
          {
            label: "# Ein Bild generieren",
            code: 'anycap image generate --model seedream-5 --prompt "a sunset over mountains"',
          },
        ],
      },
    ] as const satisfies readonly InstallStep[],
    troubleshootingTitle: "Häufige Probleme",
    troubleshootingItems: [
      {
        title: "Installation in natürlicher Sprache funktioniert in meinem Agenten nicht",
        description: [
          { type: "text", text: "Verwenden Sie die manuellen CLI- und Skill-Schritte auf dieser Seite oder folgen Sie einer agent-spezifischen Anleitung für " },
          { type: "link", text: "Claude Code", href: "/for/claude-code" },
          { type: "text", text: ", " },
          { type: "link", text: "Cursor", href: "/for/cursor" },
          { type: "text", text: " oder " },
          { type: "link", text: "Codex", href: "/for/codex" },
          { type: "text", text: "." },
        ],
      },
      {
        title: "Installationsskript schlägt unter macOS fehl",
        description: [
          { type: "text", text: "Versuchen Sie die Installation über npm: " },
          { type: "code", text: "npm install -g @anycap/cli" },
        ],
      },
      {
        title: "Login öffnet keinen Browser",
        description: [
          { type: "text", text: "Verwenden Sie den Device-Code-Flow: " },
          { type: "code", text: "anycap login --headless" },
        ],
      },
      {
        title: "Berechtigung verweigert",
        description: [
          {
            type: "text",
            text: "Stellen Sie sicher, dass das Installationsverzeichnis beschreibbar ist, oder verwenden Sie npm mit einem nutzerseitigen globalen Präfix.",
          },
        ],
      },
    ] as const satisfies readonly TroubleshootingItem[],
    faqTitle: "Häufige Fragen",
    nextStepsTitle: "Nächste Schritte",
    nextActions: [
      {
        label: "Auf GitHub ansehen",
        href: "https://github.com/anycap-ai/anycap",
        external: true,
        primary: true,
      },
      { label: "Für Claude Code", href: "/for/claude-code" },
      { label: "Alle Capabilities", href: "/capabilities" },
      { label: "CLI-Übersicht", href: "/cli" },
    ] as const satisfies readonly NextAction[],
  },
} as const;

export function getInstallAnyCapMetadata(locale: SiteLocale): Metadata {
  const content = contentByLocale[locale] ?? contentByLocale.en;

  return {
    title: content.metadata.title,
    description: content.metadata.description,
    alternates: { canonical: INSTALL_ANYCAP_GUIDE_PATH },
    openGraph: {
      type: "website",
      locale: getLocaleConfig(locale).ogLocale,
      url: INSTALL_ANYCAP_GUIDE_PATH,
      siteName: siteConfig.siteName,
      title: content.metadata.openGraphTitle,
      description: content.metadata.openGraphDescription,
    },
  };
}

export function getInstallAnyCapPageData(locale: SiteLocale) {
  const content = contentByLocale[locale] ?? contentByLocale.en;

  const guideJsonLd = createTechArticleJsonLd({
    headline: content.metadata.articleHeadline,
    description: content.metadata.articleDescription,
    path: INSTALL_ANYCAP_GUIDE_PATH,
    locale,
    about: [...content.metadata.articleAbout],
    keywords: [...content.metadata.articleKeywords],
  });

  const howToJsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: content.howTo.name,
    description: content.howTo.description,
    step: content.howTo.steps.map((step) => ({
      "@type": "HowToStep",
      name: step.name,
      text: step.text,
    })),
  };

  return {
    ...content,
    guideJsonLd,
    howToJsonLd,
    faqJsonLd: createFaqPageJsonLd(content.faqItems),
  };
}
