import type { Metadata } from "next";
import { createFaqPageJsonLd, createTechArticleJsonLd } from "@/lib/schema";
import { getLocaleConfig, siteConfig, type SiteLocale } from "@/lib/site";

export const BEST_AI_FOR_CODING_AGENTS_PATH = "/learn/best-ai-for-coding-agents";

type BestAICodingAgentsPageData = {
  breadcrumbItems: readonly { name: string; href?: string }[];
  eyebrow: string;
  metadata: {
    title: string;
    description: string;
    openGraphTitle: string;
    openGraphDescription: string;
  };
  articleJsonLd: Record<string, unknown>;
  faqJsonLd: Record<string, unknown>;
  lastUpdatedLabel: string;
  heroTitle: [string, string];
  heroIntro: string;
  quickTakeawaysTitle: string;
  quickTakeaways: readonly string[];
  evaluationTitle: string;
  evaluationIntro: string;
  evaluationCards: readonly { title: string; body: string }[];
  stackTitle: string;
  stackCards: readonly { title: string; label: string; body: string }[];
  drillDownTitle: string;
  drillDownCards: readonly { label: string; title: string; href: string; body: string }[];
  capabilityTitle: string;
  capabilityCards: readonly { title: string; href: string; body: string }[];
  selectionTitle: string;
  selectionRows: readonly { question: string; answer: string }[];
  nextMoveTitle: string;
  nextMoveCards: readonly { title: string; href: string; body: string }[];
  faqTitle: string;
  faqItems: readonly { question: string; answer: string }[];
  ctas: readonly { href: string; label: string; variant: "primary" | "secondary" }[];
};

const quickTakeawaysEn = [
  "Most teams mix up three decisions: the best base model, the best platform-specific workflow, and the best capability layer around the agent.",
  "If the job stays inside code, model quality and editing experience matter most.",
  "If the work crosses into screenshots, recordings, media generation, or deliverables, the best setup becomes a stack decision instead of a simple ranking question.",
] as const;

const quickTakeawaysPtBr = [
  "A maioria dos times confunde três decisões: o melhor modelo base, o melhor fluxo específico da plataforma e a melhor camada de capacidades ao redor do agente.",
  "Se o trabalho continua dentro do código, qualidade do modelo e experiência de edição são o que mais importam.",
  "Se o fluxo cruza capturas de tela, gravações, geração de mídia ou entregáveis, a melhor configuração vira uma decisão de stack, não uma simples classificação.",
] as const;

const contentByLocale: Record<SiteLocale, BestAICodingAgentsPageData> = {
  en: {
    breadcrumbItems: [
      { name: "Home", href: "/" },
      { name: "Learn", href: "/learn" },
      { name: "Best AI for coding agents" },
    ],
    eyebrow: "Learn",
    metadata: {
      title: "Best AI for Coding Agents: choose the right model and capability stack",
      description:
        "Use this page as the category guide for choosing a coding-agent stack, then drill into model quality, platform-specific workflows, and the capability layer around the agent.",
      openGraphTitle: "Best AI for Coding Agents: choose the right model and capability stack",
      openGraphDescription:
        "A category guide for teams deciding whether the best coding-agent setup is a model choice, a platform-specific workflow choice, or a capability-layer choice.",
    },
    articleJsonLd: createTechArticleJsonLd({
      headline: "Best AI for Coding Agents: choose the right model and capability stack",
      description:
        "A category guide for teams deciding whether the best coding-agent setup is a model choice, a platform-specific workflow choice, or a capability-layer choice.",
      path: BEST_AI_FOR_CODING_AGENTS_PATH,
      about: ["Coding agents", "AI models", "Claude Code", "Cursor", "Codex", "Agent capability runtime"],
      keywords: [
        "best ai for coding agents",
        "best ai coding agent",
        "coding agent stack",
        "coding agent capabilities",
        "ai tools for coding teams",
      ],
      datePublished: "2026-04-07",
      dateModified: "2026-04-07",
    }),
    faqJsonLd: createFaqPageJsonLd([
      {
        question: "What is the best AI for coding agents right now?",
        answer:
          "There is no single permanent answer for every team. The best choice depends on whether your real question is model quality, platform-specific workflow fit, or the capability layer around the agent.",
      },
      {
        question: "When is the best coding agent mostly a benchmark question?",
        answer:
          "It is mostly a benchmark question when the work stays inside code and the main goal is reasoning, editing, debugging, and repository comprehension.",
      },
      {
        question: "When should I jump to the Claude Code or Cursor specific guide?",
        answer:
          "Jump to the narrower guide once you already know which agent surface you want to keep. This page is best used as the category guide before the workflow gets more specific.",
      },
      {
        question: "Does AnyCap replace Claude Code, Cursor, or Codex?",
        answer:
          "No. AnyCap is the capability runtime around those agents. Its role is to expand what they can actually do, especially across image, video, and vision workflows.",
      },
    ]),
    lastUpdatedLabel: "April 7, 2026",
    heroTitle: ["Best AI for", "coding agents"],
    heroIntro:
      "The best AI for coding agents is usually not one single model ranking. It is the combination of the base model, the platform-specific workflow, and the capability layer around the agent. Once the task leaves code and starts to touch screenshots, recordings, media, or deliverables, the decision becomes a stack question.",
    quickTakeawaysTitle: "Quick takeaways",
    quickTakeaways: quickTakeawaysEn,
    evaluationTitle: "How to evaluate a coding-agent setup",
    evaluationIntro:
      "Use these four questions to separate pure model choice from platform workflow fit and capability overhead.",
    evaluationCards: [
      { title: "Base model quality", body: "Start here when the work is mostly planning, reading code, writing diffs, debugging, and staying coherent inside a real repository." },
      { title: "Platform-specific workflow fit", body: "If you already know you are on Claude Code or Cursor, the better question is often what the best setup looks like inside that environment rather than across the whole market." },
      { title: "How much of the task leaves code", body: "Many software workflows spill into screenshots, launch assets, demos, recordings, and visual QA. That is where the best setup stops being only a coding-model question." },
      { title: "Capability and integration overhead", body: "A theoretically strong stack loses value when every new workflow requires separate providers, credentials, and brittle glue code around the agent." },
    ],
    stackTitle: "What the best setup usually looks like",
    stackCards: [
      { title: "Best model inside a coding loop", label: "Use when the work is mostly code", body: "This is the right frame when the workflow mostly stays inside prompts, diffs, tests, and files. The main question is which model reasons best inside the coding environment you already trust." },
      { title: "Platform-specific setup guide", label: "Use when you are already on Claude Code or Cursor", body: "Once the agent surface is already chosen, the best answer usually becomes narrower. You need the page that explains what the strongest setup looks like inside that specific workflow." },
      { title: "Agent plus capability runtime", label: "Best when tasks cross media and output layers", body: "This is where AnyCap fits. You keep Claude Code, Cursor, or Codex, and add the missing capability layer for image generation, video generation, image understanding, and video analysis through one surface." },
    ],
    drillDownTitle: "Drill down from the category page",
    drillDownCards: [
      { label: "Platform-specific buyer guide", title: "Best AI for Claude Code", href: "/learn/best-ai-for-claude-code", body: "Use this when you already know Claude Code is the core workflow and want the narrower recommendation inside that environment." },
      { label: "Platform-specific buyer guide", title: "Best AI for Cursor", href: "/learn/best-ai-for-cursor", body: "Use this when Cursor is the main environment and the question is how far the editor loop can go before capability gaps matter." },
      { label: "Agent-specific path", title: "Codex workflows", href: "/for/codex", body: "Use this when the category question is already settled and you want the Codex specific path into AnyCap." },
      { label: "Capability-gap path", title: "What agents still cannot do", href: "/learn/what-agents-cant-do", body: "Use this when the real blocker is not choosing an agent at all, but identifying the missing capabilities around one you already like." },
    ],
    capabilityTitle: "Capability pages to open next",
    capabilityCards: [
      { title: "Image generation", href: "/capabilities/image-generation", body: "Generate product visuals, concepts, and launch assets instead of only drafting instructions for a human designer." },
      { title: "Video generation", href: "/capabilities/video-generation", body: "Create short demos and motion assets when a coding task needs an actual artifact instead of another paragraph." },
      { title: "Image understanding", href: "/capabilities/image-understanding", body: "Read screenshots, references, and visual QA inputs through the same workflow as code reasoning." },
      { title: "Video analysis", href: "/capabilities/video-analysis", body: "Inspect recordings and explain what happened when the bug or workflow issue lives inside a video." },
    ],
    selectionTitle: "How to decide fast",
    selectionRows: [
      { question: "When is this mostly a model comparison?", answer: "It is mostly a model comparison when the work stays close to code: planning changes, writing diffs, debugging, reading logs, and updating files. In that case, reasoning quality and editing ergonomics dominate the decision." },
      { question: "When should I open the Claude Code or Cursor specific page instead?", answer: "Open the narrower page once you already know which agent surface you want to keep. At that point, the problem is no longer the whole category. It is the best setup inside a specific workflow." },
      { question: "When does capability runtime matter more than another benchmark?", answer: "Capability runtime matters more once the task must generate visuals, inspect screenshots, analyze recordings, or turn the result into something a human can use outside the code editor." },
    ],
    nextMoveTitle: "Next moves",
    nextMoveCards: [
      { title: "Best AI for Claude Code", href: "/learn/best-ai-for-claude-code", body: "Go here when the category question has narrowed to Claude Code specifically." },
      { title: "Best AI for Cursor", href: "/learn/best-ai-for-cursor", body: "Go here when the category question has narrowed to Cursor specifically." },
      { title: "What agents still cannot do", href: "/learn/what-agents-cant-do", body: "Go here when the real issue is capability gaps rather than picking a new agent." },
      { title: "See the SaaS assistant version", href: "/learn/ai-chatbot-vs-ai-agent-for-saas", body: "Go here if the same stack decision is showing up in a SaaS chatbot or copilot instead of a coding workflow." },
      { title: "What is the most advanced AI?", href: "/learn/what-is-the-most-advanced-ai", body: "Go here when the question is really about the frontier: which AI system is the most advanced overall, and why the answer changes depending on the task." },
      { title: "Browse the capability hub", href: "/capabilities", body: "Go here when you already know the problem and want the exact AnyCap surface that solves it." },
    ],
    faqTitle: "FAQ",
    faqItems: [
      { question: "What is the best AI for coding agents right now?", answer: "There is no single permanent answer for every team. The best choice depends on whether your real question is model quality, platform-specific workflow fit, or the capability layer around the agent." },
      { question: "When is the best coding agent mostly a benchmark question?", answer: "It is mostly a benchmark question when the work stays inside code and the main goal is reasoning, editing, debugging, and repository comprehension." },
      { question: "When should I jump to the Claude Code or Cursor specific guide?", answer: "Jump to the narrower guide once you already know which agent surface you want to keep. This page is best used as the category guide before the workflow gets more specific." },
      { question: "Does AnyCap replace Claude Code, Cursor, or Codex?", answer: "No. AnyCap is the capability runtime around those agents. Its role is to expand what they can actually do, especially across image, video, and vision workflows." },
    ],
    ctas: [
      { href: "/learn/best-ai-for-claude-code", label: "Claude Code Guide", variant: "primary" },
      { href: "/learn/best-ai-for-cursor", label: "Cursor Guide", variant: "secondary" },
      { href: "/capabilities", label: "Browse Capabilities", variant: "secondary" },
    ],
  },
  "pt-br": {
    breadcrumbItems: [
      { name: "Início", href: "/" },
      { name: "Aprender", href: "/learn" },
      { name: "Melhor IA para agentes de código", href: BEST_AI_FOR_CODING_AGENTS_PATH },
    ],
    eyebrow: "Aprender",
    metadata: {
      title: "Melhor IA para agentes de código: escolha o modelo certo e a stack de capacidades",
      description:
        "Use esta página como guia de categoria para escolher uma stack de agente de código, e depois aprofunde em qualidade de modelo, fluxos específicos de plataforma e a camada de capacidades ao redor do agente.",
      openGraphTitle: "Melhor IA para agentes de código: escolha o modelo certo e a stack de capacidades",
      openGraphDescription:
        "Um guia de categoria para times que estão decidindo se a melhor configuração de agente de código é uma escolha de modelo, de fluxo específico da plataforma ou de camada de capacidades.",
    },
    articleJsonLd: createTechArticleJsonLd({
      headline: "Melhor IA para agentes de código: escolha o modelo certo e a stack de capacidades",
      description:
        "Um guia de categoria para times que estão decidindo se a melhor configuração de agente de código é uma escolha de modelo, de fluxo específico da plataforma ou de camada de capacidades.",
      path: BEST_AI_FOR_CODING_AGENTS_PATH,
      about: ["agentes de código", "modelos de IA", "Claude Code", "Cursor", "Codex", "runtime de capacidades"],
      keywords: [
        "melhor ia para agentes de código",
        "melhor ia para coding agents",
        "stack de agente de código",
        "capacidades de agente de código",
        "ferramentas de ia para times de código",
      ],
      datePublished: "2026-04-07",
      dateModified: "2026-04-07",
    }),
    faqJsonLd: createFaqPageJsonLd([
      {
        question: "Qual é a melhor IA para agentes de código hoje?",
        answer:
          "Não existe uma única resposta permanente para todos os times. A melhor escolha depende de a sua pergunta real ser qualidade do modelo, aderência ao fluxo específico da plataforma ou a camada de capacidades ao redor do agente.",
      },
      {
        question: "Quando a melhor IA para agentes de código é mais uma questão de benchmark?",
        answer:
          "Isso é mais uma questão de benchmark quando o trabalho fica dentro do código e o objetivo principal é raciocínio, edição, debug e compreensão do repositório.",
      },
      {
        question: "Quando devo abrir o guia específico de Claude Code ou Cursor?",
        answer:
          "Abra a página mais estreita quando você já souber qual superfície de agente quer manter. A partir daí, o problema já não é mais a categoria inteira.",
      },
      {
        question: "O AnyCap substitui Claude Code, Cursor ou Codex?",
        answer:
          "Não. O AnyCap é o runtime de capacidades ao redor desses agentes. O papel dele é expandir o que eles conseguem fazer, especialmente em fluxos de imagem, vídeo e visão.",
      },
    ]),
    lastUpdatedLabel: "7 de abril de 2026",
    heroTitle: ["Melhor IA para", "agentes de código"],
    heroIntro:
      "A melhor IA para agentes de código normalmente não é uma única classificação de modelo. É a combinação do modelo base, do fluxo específico da plataforma e da camada de capacidades ao redor do agente. Quando a tarefa sai do código e passa a tocar capturas de tela, gravações, mídia ou entregáveis, a decisão vira uma decisão de stack.",
    quickTakeawaysTitle: "Principais pontos",
    quickTakeaways: quickTakeawaysPtBr,
    evaluationTitle: "Como avaliar uma configuração de agente de código",
    evaluationIntro:
      "Use estas quatro perguntas para separar a escolha de modelo puro da aderência ao fluxo da plataforma e do overhead de capacidades.",
    evaluationCards: [
      { title: "Qualidade do modelo base", body: "Comece aqui quando o trabalho é majoritariamente planejamento, leitura de código, escrita de diffs, debug e coerência dentro de um repositório real." },
      { title: "Aderência ao fluxo da plataforma", body: "Se você já sabe que está em Claude Code ou Cursor, a melhor pergunta costuma ser como fica a melhor configuração dentro daquele ambiente, e não no mercado inteiro." },
      { title: "Quanto da tarefa sai do código", body: "Muitos fluxos de software vazam para capturas de tela, assets de lançamento, demos, gravações e QA visual. É aí que a melhor configuração deixa de ser só uma questão de modelo de código." },
      { title: "Overhead de capacidade e integração", body: "Uma stack teoricamente forte perde valor quando cada novo fluxo exige provedores separados, credenciais separadas e glue code frágil ao redor do agente." },
    ],
    stackTitle: "Como a melhor configuração costuma parecer",
    stackCards: [
      { title: "Melhor modelo dentro do loop de código", label: "Use quando o trabalho é majoritariamente código", body: "Este é o enquadramento certo quando o fluxo fica quase todo em prompts, diffs, testes e arquivos. A pergunta principal é qual modelo raciocina melhor no ambiente de código que você já confia." },
      { title: "Guia específico da plataforma", label: "Use quando você já está em Claude Code ou Cursor", body: "Quando a superfície do agente já foi escolhida, a melhor resposta costuma ficar mais estreita. Você precisa da página que explica a configuração mais forte dentro daquele fluxo específico." },
      { title: "Agente mais runtime de capacidades", label: "Melhor quando a tarefa cruza mídia e saída", body: "É aqui que o AnyCap entra. Você mantém Claude Code, Cursor ou Codex, e adiciona a camada de capacidades que falta para geração de imagem, vídeo, entendimento de imagem e análise de vídeo por meio de uma única superfície." },
    ],
    drillDownTitle: "Aprofunde a partir da página de categoria",
    drillDownCards: [
      { label: "Guia de compra específico da plataforma", title: "Melhor IA para Claude Code", href: "/learn/best-ai-for-claude-code", body: "Use isto quando você já sabe que Claude Code é o fluxo principal e quer uma recomendação mais estreita para aquele ambiente." },
      { label: "Guia de compra específico da plataforma", title: "Melhor IA para Cursor", href: "/learn/best-ai-for-cursor", body: "Use isto quando Cursor é o ambiente principal e a pergunta é até onde o loop do editor consegue ir antes de as lacunas de capacidade ficarem importantes." },
      { label: "Caminho específico do agente", title: "Fluxos de Codex", href: "/for/codex", body: "Use isto quando a pergunta de categoria já está resolvida e você quer o caminho do Codex para o AnyCap." },
      { label: "Caminho de lacuna de capacidade", title: "O que os agentes ainda não conseguem fazer", href: "/learn/what-agents-cant-do", body: "Use isto quando o bloqueio real não é escolher um agente, e sim identificar as capacidades ausentes ao redor do que você já gosta de usar." },
    ],
    capabilityTitle: "Páginas de capacidade para abrir em seguida",
    capabilityCards: [
      { title: "Geração de imagem", href: "/capabilities/image-generation", body: "Gere visuais de produto, conceitos e assets de lançamento em vez de apenas escrever instruções para um designer humano." },
      { title: "Geração de vídeo", href: "/capabilities/video-generation", body: "Crie demos curtos e motion assets quando uma tarefa de código precisa de um artefato de verdade em vez de mais um parágrafo." },
      { title: "Entendimento de imagem", href: "/capabilities/image-understanding", body: "Leia capturas de tela, referências e inputs de QA visual pelo mesmo fluxo de raciocínio de código." },
      { title: "Análise de vídeo", href: "/capabilities/video-analysis", body: "Inspecione gravações e explique o que aconteceu quando o bug ou problema de fluxo vive em um vídeo." },
    ],
    selectionTitle: "Como decidir rápido",
    selectionRows: [
      { question: "Quando isso é mais uma comparação de modelo?", answer: "Isso é mais uma comparação de modelo quando o trabalho fica perto do código: planejar mudanças, escrever diffs, depurar, ler logs e atualizar arquivos. Nesse caso, qualidade de raciocínio e ergonomia de edição dominam a decisão." },
      { question: "Quando devo abrir o guia específico de Claude Code ou Cursor?", answer: "Abra a página mais estreita quando você já souber qual superfície de agente quer manter. A partir daí, o problema não é mais a categoria inteira. É a melhor configuração dentro de um fluxo específico." },
      { question: "Quando o runtime de capacidades importa mais do que outro benchmark?", answer: "O runtime de capacidades importa mais quando a tarefa precisa gerar visuais, inspecionar capturas de tela, analisar gravações ou transformar o resultado em algo que uma pessoa possa usar fora do editor de código." },
    ],
    nextMoveTitle: "Próximos passos",
    nextMoveCards: [
      { title: "Melhor IA para Claude Code", href: "/learn/best-ai-for-claude-code", body: "Vá aqui quando a pergunta de categoria se estreitar especificamente para Claude Code." },
      { title: "Melhor IA para Cursor", href: "/learn/best-ai-for-cursor", body: "Vá aqui quando a pergunta de categoria se estreitar especificamente para Cursor." },
      { title: "O que os agentes ainda não conseguem fazer", href: "/learn/what-agents-cant-do", body: "Vá aqui quando o problema real for lacuna de capacidade, e não escolher um novo agente." },
      { title: "Ver a versão para assistente SaaS", href: "/learn/ai-chatbot-vs-ai-agent-for-saas", body: "Vá aqui se a mesma decisão de stack estiver aparecendo em um chatbot ou copilot SaaS em vez de um fluxo de código." },
      { title: "Qual é a IA mais avançada?", href: "/learn/what-is-the-most-advanced-ai", body: "Vá aqui quando a pergunta for sobre a fronteira no geral: qual sistema de IA é o mais avançado e por que a resposta muda dependendo da tarefa." },
      { title: "Navegar pelo hub de capacidades", href: "/capabilities", body: "Vá aqui quando você já souber o problema e quiser a superfície exata do AnyCap que resolve isso." },
    ],
    faqTitle: "FAQ",
    faqItems: [
      { question: "Qual é a melhor IA para agentes de código hoje?", answer: "Não existe uma única resposta permanente para todos os times. A melhor escolha depende de a sua pergunta real ser qualidade do modelo, aderência ao fluxo específico da plataforma ou a camada de capacidades ao redor do agente." },
      { question: "Quando a melhor IA para agentes de código é mais uma questão de benchmark?", answer: "Isso é mais uma questão de benchmark quando o trabalho fica dentro do código e o objetivo principal é raciocínio, edição, debug e compreensão do repositório." },
      { question: "Quando devo abrir o guia específico de Claude Code ou Cursor?", answer: "Abra a página mais estreita quando você já souber qual superfície de agente quer manter. A partir daí, o problema já não é mais a categoria inteira." },
      { question: "O AnyCap substitui Claude Code, Cursor ou Codex?", answer: "Não. O AnyCap é o runtime de capacidades ao redor desses agentes. O papel dele é expandir o que eles conseguem fazer, especialmente em fluxos de imagem, vídeo e visão." },
    ],
    ctas: [
      { href: "/learn/best-ai-for-claude-code", label: "Guia de Claude Code", variant: "primary" },
      { href: "/learn/best-ai-for-cursor", label: "Guia de Cursor", variant: "secondary" },
      { href: "/capabilities", label: "Navegar Capacidades", variant: "secondary" },
    ],
  },
  id: {
    breadcrumbItems: [
      { name: "Home", href: "/" },
      { name: "Learn", href: "/learn" },
      { name: "Best AI for coding agents" },
    ],
    eyebrow: "Learn",
    metadata: {
      title: "Best AI for Coding Agents: choose the right model and capability stack",
      description:
        "Use this page as the category guide for choosing a coding-agent stack, then drill into model quality, platform-specific workflows, and the capability layer around the agent.",
      openGraphTitle: "Best AI for Coding Agents: choose the right model and capability stack",
      openGraphDescription:
        "A category guide for teams deciding whether the best coding-agent setup is a model choice, a platform-specific workflow choice, or a capability-layer choice.",
    },
    articleJsonLd: createTechArticleJsonLd({
      headline: "Best AI for Coding Agents: choose the right model and capability stack",
      description:
        "A category guide for teams deciding whether the best coding-agent setup is a model choice, a platform-specific workflow choice, or a capability-layer choice.",
      path: BEST_AI_FOR_CODING_AGENTS_PATH,
      about: ["Coding agents", "AI models", "Claude Code", "Cursor", "Codex", "Agent capability runtime"],
      keywords: [
        "best ai for coding agents",
        "best ai coding agent",
        "coding agent stack",
        "coding agent capabilities",
        "ai tools for coding teams",
      ],
      datePublished: "2026-04-07",
      dateModified: "2026-04-07",
    }),
    faqJsonLd: createFaqPageJsonLd([
      {
        question: "What is the best AI for coding agents right now?",
        answer:
          "There is no single permanent answer for every team. The best choice depends on whether your real question is model quality, platform-specific workflow fit, or the capability layer around the agent.",
      },
      {
        question: "When is the best coding agent mostly a benchmark question?",
        answer:
          "It is mostly a benchmark question when the work stays inside code and the main goal is reasoning, editing, debugging, and repository comprehension.",
      },
      {
        question: "When should I jump to the Claude Code or Cursor specific guide?",
        answer:
          "Jump to the narrower guide once you already know which agent surface you want to keep. This page is best used as the category guide before the workflow gets more specific.",
      },
      {
        question: "Does AnyCap replace Claude Code, Cursor, or Codex?",
        answer:
          "No. AnyCap is the capability runtime around those agents. Its role is to expand what they can actually do, especially across image, video, and vision workflows.",
      },
    ]),
    lastUpdatedLabel: "April 7, 2026",
    heroTitle: ["Best AI for", "coding agents"],
    heroIntro:
      "The best AI for coding agents is usually not one single model ranking. It is the combination of the base model, the platform-specific workflow, and the capability layer around the agent. Once the task leaves code and starts to touch screenshots, recordings, media, or deliverables, the decision becomes a stack question.",
    quickTakeawaysTitle: "Quick takeaways",
    quickTakeaways: quickTakeawaysEn,
    evaluationTitle: "How to evaluate a coding-agent setup",
    evaluationIntro:
      "Use these four questions to separate pure model choice from platform workflow fit and capability overhead.",
    evaluationCards: [
      { title: "Base model quality", body: "Start here when the work is mostly planning, reading code, writing diffs, debugging, and staying coherent inside a real repository." },
      { title: "Platform-specific workflow fit", body: "If you already know you are on Claude Code or Cursor, the better question is often what the best setup looks like inside that environment rather than across the whole market." },
      { title: "How much of the task leaves code", body: "Many software workflows spill into screenshots, launch assets, demos, recordings, and visual QA. That is where the best setup stops being only a coding-model question." },
      { title: "Capability and integration overhead", body: "A theoretically strong stack loses value when every new workflow requires separate providers, credentials, and brittle glue code around the agent." },
    ],
    stackTitle: "What the best setup usually looks like",
    stackCards: [
      { title: "Best model inside a coding loop", label: "Use when the work is mostly code", body: "This is the right frame when the workflow mostly stays inside prompts, diffs, tests, and files. The main question is which model reasons best inside the coding environment you already trust." },
      { title: "Platform-specific setup guide", label: "Use when you are already on Claude Code or Cursor", body: "Once the agent surface is already chosen, the best answer usually becomes narrower. You need the page that explains what the strongest setup looks like inside that specific workflow." },
      { title: "Agent plus capability runtime", label: "Best when tasks cross media and output layers", body: "This is where AnyCap fits. You keep Claude Code, Cursor, or Codex, and add the missing capability layer for image generation, video generation, image understanding, and video analysis through one surface." },
    ],
    drillDownTitle: "Drill down from the category page",
    drillDownCards: [
      { label: "Platform-specific buyer guide", title: "Best AI for Claude Code", href: "/learn/best-ai-for-claude-code", body: "Use this when you already know Claude Code is the core workflow and want the narrower recommendation inside that environment." },
      { label: "Platform-specific buyer guide", title: "Best AI for Cursor", href: "/learn/best-ai-for-cursor", body: "Use this when Cursor is the main environment and the question is how far the editor loop can go before capability gaps matter." },
      { label: "Agent-specific path", title: "Codex workflows", href: "/for/codex", body: "Use this when the category question is already settled and you want the Codex specific path into AnyCap." },
      { label: "Capability-gap path", title: "What agents still cannot do", href: "/learn/what-agents-cant-do", body: "Use this when the real blocker is not choosing an agent at all, but identifying the missing capabilities around one you already like." },
    ],
    capabilityTitle: "Capability pages to open next",
    capabilityCards: [
      { title: "Image generation", href: "/capabilities/image-generation", body: "Generate product visuals, concepts, and launch assets instead of only drafting instructions for a human designer." },
      { title: "Video generation", href: "/capabilities/video-generation", body: "Create short demos and motion assets when a coding task needs an actual artifact instead of another paragraph." },
      { title: "Image understanding", href: "/capabilities/image-understanding", body: "Read screenshots, references, and visual QA inputs through the same workflow as code reasoning." },
      { title: "Video analysis", href: "/capabilities/video-analysis", body: "Inspect recordings and explain what happened when the bug or workflow issue lives inside a video." },
    ],
    selectionTitle: "How to decide fast",
    selectionRows: [
      { question: "When is this mostly a model comparison?", answer: "It is mostly a model comparison when the work stays close to code: planning changes, writing diffs, debugging, reading logs, and updating files. In that case, reasoning quality and editing ergonomics dominate the decision." },
      { question: "When should I open the Claude Code or Cursor specific page instead?", answer: "Open the narrower page once you already know which agent surface you want to keep. At that point, the problem is no longer the whole category. It is the best setup inside a specific workflow." },
      { question: "When does capability runtime matter more than another benchmark?", answer: "Capability runtime matters more once the task must generate visuals, inspect screenshots, analyze recordings, or turn the result into something a human can use outside the code editor." },
    ],
    nextMoveTitle: "Next moves",
    nextMoveCards: [
      { title: "Best AI for Claude Code", href: "/learn/best-ai-for-claude-code", body: "Go here when the category question has narrowed to Claude Code specifically." },
      { title: "Best AI for Cursor", href: "/learn/best-ai-for-cursor", body: "Go here when the category question has narrowed to Cursor specifically." },
      { title: "What agents still cannot do", href: "/learn/what-agents-cant-do", body: "Go here when the real issue is capability gaps rather than picking a new agent." },
      { title: "See the SaaS assistant version", href: "/learn/ai-chatbot-vs-ai-agent-for-saas", body: "Go here if the same stack decision is showing up in a SaaS chatbot or copilot instead of a coding workflow." },
      { title: "What is the most advanced AI?", href: "/learn/what-is-the-most-advanced-ai", body: "Go here when the question is really about the frontier: which AI system is the most advanced overall, and why the answer changes depending on the task." },
      { title: "Browse the capability hub", href: "/capabilities", body: "Go here when you already know the problem and want the exact AnyCap surface that solves it." },
    ],
    faqTitle: "FAQ",
    faqItems: [
      { question: "What is the best AI for coding agents right now?", answer: "There is no single permanent answer for every team. The best choice depends on whether your real question is model quality, platform-specific workflow fit, or the capability layer around the agent." },
      { question: "When is the best coding agent mostly a benchmark question?", answer: "It is mostly a benchmark question when the work stays inside code and the main goal is reasoning, editing, debugging, and repository comprehension." },
      { question: "When should I jump to the Claude Code or Cursor specific guide?", answer: "Jump to the narrower guide once you already know which agent surface you want to keep. This page is best used as the category guide before the workflow gets more specific." },
      { question: "Does AnyCap replace Claude Code, Cursor, or Codex?", answer: "No. AnyCap is the capability runtime around those agents. Its role is to expand what they can actually do, especially across image, video, and vision workflows." },
    ],
    ctas: [
      { href: "/learn/best-ai-for-claude-code", label: "Claude Code Guide", variant: "primary" },
      { href: "/learn/best-ai-for-cursor", label: "Cursor Guide", variant: "secondary" },
      { href: "/capabilities", label: "Browse Capabilities", variant: "secondary" },
    ],
  },
};

export function getBestAICodingAgentsMetadata(locale: SiteLocale): Metadata {
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

export function getBestAICodingAgentsPageData(locale: SiteLocale) {
  return contentByLocale[locale] ?? contentByLocale.en;
}
