import type { Metadata } from "next";
import { createFaqPageJsonLd, createTechArticleJsonLd } from "@/lib/schema";
import { getLocaleConfig, siteConfig, type SiteLocale } from "@/lib/site";

export const WHAT_IS_THE_MOST_ADVANCED_AI_PATH = "/learn/what-is-the-most-advanced-ai";

type WhatIsTheMostAdvancedAIPageData = {
  breadcrumbItems: readonly { name: string; href?: string; unlinkable?: boolean }[];
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
  heroTitle: [string, string, string];
  heroIntro: string;
  quickTakeawaysLabel: string;
  quickTakeaways: readonly string[];
  evaluationLabel: string;
  evaluationTitle: string;
  evaluationCards: readonly { title: string; body: string }[];
  stackLabel: string;
  stackTitle: string;
  stackIntro: string;
  stackLayers: readonly { title: string; body: string }[];
  capabilityLabel: string;
  capabilityTitle: string;
  capabilityIntro: string;
  capabilityCards: readonly { title: string; href: string; body: string }[];
  selectionLabel: string;
  selectionTitle: string;
  selectionRows: readonly { question: string; answer: string }[];
  nextMoveLabel: string;
  nextMoveTitle: string;
  nextMoveCards: readonly { title: string; href: string; body: string }[];
  faqLabel: string;
  faqTitle: string;
  faqItems: readonly { question: string; answer: string }[];
};

const lastUpdatedIso = "2026-04-07";

const en: WhatIsTheMostAdvancedAIPageData = {
  breadcrumbItems: [
    { name: "Home", href: "/" },
    { name: "Learn", href: "/learn", unlinkable: true },
    { name: "What is the most advanced AI?" },
  ],
  eyebrow: "Learn",
  metadata: {
    title: "What Is the Most Advanced AI? Why the real answer is not one model",
    description:
      "There is no single most advanced AI for every job. Compare model intelligence, multimodal systems, and real-world task execution before choosing a stack.",
    openGraphTitle: "What Is the Most Advanced AI? Why the real answer is not one model",
    openGraphDescription:
      "The most advanced AI depends on the task. See why real-world execution depends on both model quality and the system around it.",
  },
  articleJsonLd: createTechArticleJsonLd({
    headline: "What Is the Most Advanced AI? Why the real answer is not one model",
    description:
      "A practical explainer on why the most advanced AI depends on reasoning, multimodal output, and execution - and why the real answer is usually a system, not one model.",
    path: WHAT_IS_THE_MOST_ADVANCED_AI_PATH,
    about: ["AI models", "AI agents", "Multimodal AI", "Agent capability runtime", "Coding agents"],
    keywords: [
      "what is the most advanced ai",
      "most advanced ai",
      "most advanced ai model",
      "advanced ai systems",
      "multimodal ai tools",
    ],
    datePublished: lastUpdatedIso,
    dateModified: lastUpdatedIso,
  }),
  faqJsonLd: createFaqPageJsonLd([
    {
      question: "What is the most advanced AI right now?",
      answer:
        "There is no single permanent answer. The leader for reasoning may differ from the best system for media generation, visual understanding, or agent execution.",
    },
    {
      question: "Is the most advanced AI always the best AI for work?",
      answer:
        "Not necessarily. For real work, the most useful AI usually combines model quality with access to the right capabilities around the model.",
    },
    {
      question: "Is AnyCap itself the AI model?",
      answer:
        "No. AnyCap is the capability runtime around agents and assistants. Its role is to help them generate, inspect, and deliver outputs through one install path and one CLI surface.",
    },
    {
      question: "What should I optimize for if I use AI inside an agent workflow?",
      answer:
        "Optimize for task completion, not just benchmark prestige. A strong model with no usable capability layer will often lose to a slightly weaker model that can actually finish the job.",
    },
  ]),
  lastUpdatedLabel: "April 7, 2026",
  heroTitle: ["What is the most", "advanced", "AI?"],
  heroIntro:
    "The honest answer is that there is no single winner for every kind of work. If you mean raw reasoning, one frontier model may lead. If you mean image or video output, another system may be stronger. If you mean work that actually gets finished, the most advanced AI is usually a strong model connected to the runtime, tools, and delivery layers around it.",
  quickTakeawaysLabel: "Key points",
  quickTakeaways: [
    "There is no permanent single winner across every AI task.",
    "The strongest reasoning model is not always the strongest system for image, video, or agent execution.",
    "For real work, the most advanced setup is usually a strong model plus the runtime and delivery layers that let it act.",
  ],
  evaluationLabel: "Why one answer fails",
  evaluationTitle: '"Most advanced" changes depending on what you need the AI to do',
  evaluationCards: [
    {
      title: "Reasoning and planning",
      body:
        "If you mean chain-of-thought quality, coding help, or long-form analysis, the shortlist usually comes from the latest frontier models from major labs. That is one definition of advanced AI, but not the only one.",
    },
    {
      title: "Multimodal creation",
      body:
        "If you need image or video output, specialized generation systems matter more than a pure text benchmark. The most advanced AI for media work may be different from the most advanced AI for reasoning.",
    },
    {
      title: "Visual understanding",
      body:
        "A model can be excellent at writing and still weak at reading screenshots, diagrams, or recordings. Advanced AI for production work often means stronger vision and analysis workflows, not just text intelligence.",
    },
    {
      title: "Task completion",
      body:
        "The model is only part of the system. To finish real work, an agent often needs tools to create assets, inspect files, and return outputs in a form humans can use.",
    },
  ],
  stackLabel: "A more useful framework",
  stackTitle: "In practice, advanced AI is a stack, not a single benchmark score",
  stackIntro:
    "This is the gap between AI headlines and production reality. People compare model intelligence first, but teams usually feel the pain later: the agent can explain the task, yet it cannot create the image, inspect the recording, or hand off something usable. That is why the real conversation has to include the system around the model.",
  stackLayers: [
    {
      title: "Base model",
      body:
        "This is the part people usually compare first: raw reasoning quality, coding performance, knowledge breadth, and multimodal capability.",
    },
    {
      title: "Capability runtime",
      body:
        "This is the layer that gives the agent usable powers around the model, such as image generation, video generation, image understanding, and video analysis.",
    },
    {
      title: "Delivery layer",
      body:
        "Even strong AI needs a way to deliver results. The most useful systems can move from reasoning into an output someone can review, share, or publish.",
    },
  ],
  capabilityLabel: "Where AnyCap fits",
  capabilityTitle: "AnyCap is not the frontier model. It is the capability runtime around the system.",
  capabilityIntro:
    "That distinction matters. AnyCap does not try to win the \"best model\" race by itself. Its role is to help agents and assistants move from reasoning into action through one install path, one auth flow, and one CLI surface. For teams that already use a workflow they like, that is often more useful than switching platforms just to chase whichever model looks strongest this month.",
  capabilityCards: [
    {
      title: "Image generation",
      href: "/capabilities/image-generation",
      body: "Create mockups, concepts, and visual assets instead of stopping at text instructions about what to make.",
    },
    {
      title: "Video generation",
      href: "/capabilities/video-generation",
      body: "Turn prompts into demos, motion assets, or short explainers when a static answer is not enough.",
    },
    {
      title: "Image understanding",
      href: "/capabilities/image-understanding",
      body: "Read screenshots, diagrams, references, and visual QA inputs through the same agent workflow.",
    },
    {
      title: "Video analysis",
      href: "/capabilities/video-analysis",
      body: "Inspect recordings and explain what happened instead of treating video as an opaque blob outside the workflow.",
    },
  ],
  selectionLabel: "How to choose",
  selectionTitle: 'Ask a better question than "which AI is number one?"',
  selectionRows: [
    {
      question: "Who has the strongest reasoning model right now?",
      answer:
        "Look at the latest frontier model comparisons, but expect the answer to change often. This is a model-ranking question, not a full workflow question.",
    },
    {
      question: "What is the most advanced AI for real work?",
      answer:
        "A better answer is a stack: strong model intelligence plus the capabilities needed to generate, inspect, and deliver outputs.",
    },
    {
      question: "What matters most for real-world agent workflows?",
      answer:
        "What matters most is whether the system can finish the task, not whether one model tops a benchmark. That usually means model quality plus the right capability and delivery layers around it.",
    },
  ],
  nextMoveLabel: "Best next moves",
  nextMoveTitle: "Continue from this explainer into higher-intent pages",
  nextMoveCards: [
    {
      title: "Start with the capability gap",
      href: "/learn/what-agents-cant-do",
      body: "Use this page if the real question is what agents can and cannot do before you add external capabilities.",
    },
    {
      title: "See the capability hub",
      href: "/capabilities",
      body: "Browse the practical workflows AnyCap is built to add around coding agents.",
    },
    {
      title: "Equip your current agent",
      href: "/for",
      body: "See how the capability layer fits around the agent you already use instead of forcing a platform switch.",
    },
    {
      title: "Take the shortest product path",
      href: "/start",
      body: "When you are past the research phase, use the quick-start path to move from reading into setup.",
    },
  ],
  faqLabel: "FAQ",
  faqTitle: "Questions behind the keyword",
  faqItems: [
    {
      question: "What is the most advanced AI right now?",
      answer:
        "There is no single permanent answer. The leader for reasoning may differ from the best system for media generation, visual understanding, or agent execution.",
    },
    {
      question: "Is the most advanced AI always the best AI for work?",
      answer:
        "Not necessarily. For real work, the most useful AI usually combines model quality with access to the right capabilities around the model.",
    },
    {
      question: "Is AnyCap itself the AI model?",
      answer:
        "No. AnyCap is the capability runtime around agents and assistants. Its role is to help them generate, inspect, and deliver outputs through one install path and one CLI surface.",
    },
    {
      question: "What should I optimize for if I use AI inside an agent workflow?",
      answer:
        "Optimize for task completion, not just benchmark prestige. A strong model with no usable capability layer will often lose to a slightly weaker model that can actually finish the job.",
    },
  ],
};

const ptBr: WhatIsTheMostAdvancedAIPageData = {
  breadcrumbItems: [
    { name: "Início", href: "/" },
    { name: "Aprender", href: "/learn", unlinkable: true },
    { name: "Qual é a IA mais avançada?" },
  ],
  eyebrow: "Aprender",
  metadata: {
    title: "Qual é a IA mais avançada? Por que a resposta real não é um único modelo",
    description:
      "Não existe uma única IA mais avançada para todos os trabalhos. Compare inteligência do modelo, sistemas multimodais e execução no mundo real antes de escolher uma stack.",
    openGraphTitle: "Qual é a IA mais avançada? Por que a resposta real não é um único modelo",
    openGraphDescription:
      "A IA mais avançada depende da tarefa. Veja por que a execução no mundo real depende tanto da qualidade do modelo quanto do sistema ao redor dele.",
  },
  articleJsonLd: createTechArticleJsonLd({
    headline: "Qual é a IA mais avançada? Por que a resposta real não é um único modelo",
    description:
      "Um explicador prático sobre por que a IA mais avançada depende de raciocínio, saída multimodal e execução - e por que a resposta real costuma ser um sistema, não um único modelo.",
    path: WHAT_IS_THE_MOST_ADVANCED_AI_PATH,
    about: ["modelos de IA", "agentes de IA", "IA multimodal", "runtime de capacidades", "agentes de código"],
    keywords: [
      "qual é a ia mais avançada",
      "ia mais avançada",
      "modelo de ia mais avançado",
      "sistemas avançados de ia",
      "ferramentas de ia multimodal",
    ],
    datePublished: lastUpdatedIso,
    dateModified: lastUpdatedIso,
  }),
  faqJsonLd: createFaqPageJsonLd([
    {
      question: "Qual é a IA mais avançada agora?",
      answer:
        "Não existe uma única resposta permanente. A líder em raciocínio pode ser diferente do melhor sistema para geração de mídia, entendimento visual ou execução de agentes.",
    },
    {
      question: "A IA mais avançada é sempre a melhor IA para trabalho?",
      answer:
        "Não necessariamente. Para trabalho real, a IA mais útil normalmente combina qualidade de modelo com acesso às capacidades certas ao redor dele.",
    },
    {
      question: "O AnyCap é o próprio modelo de IA?",
      answer:
        "Não. O AnyCap é o runtime de capacidades ao redor de agentes e assistentes. O papel dele é ajudá-los a gerar, inspecionar e entregar saídas através de um único caminho de instalação e uma única superfície de CLI.",
    },
    {
      question: "No que devo otimizar se uso IA dentro de um fluxo de agente?",
      answer:
        "Otimizar para conclusão de tarefa, não para prestígio de benchmark. Um modelo forte sem uma camada de capacidades utilizável muitas vezes perde para um modelo um pouco mais fraco que consegue realmente terminar o trabalho.",
    },
  ]),
  lastUpdatedLabel: "7 de abril de 2026",
  heroTitle: ["Qual é a IA mais", "avançada", "?"],
  heroIntro:
    "A resposta honesta é que não existe um único vencedor para todo tipo de trabalho. Se você quer dizer raciocínio bruto, um modelo de fronteira pode liderar. Se você quer dizer saída de imagem ou vídeo, outro sistema pode ser melhor. Se você quer dizer trabalho que realmente termina, a IA mais avançada costuma ser um modelo forte conectado às camadas de runtime, ferramentas e entrega ao redor dele.",
  quickTakeawaysLabel: "Pontos principais",
  quickTakeaways: [
    "Não existe um vencedor permanente para todas as tarefas de IA.",
    "O modelo de raciocínio mais forte nem sempre é o sistema mais forte para imagem, vídeo ou execução de agentes.",
    "Para trabalho real, a configuração mais avançada normalmente é um modelo forte mais o runtime e as camadas de entrega que permitem que ele aja.",
  ],
  evaluationLabel: "Por que uma resposta única falha",
  evaluationTitle: '"Mais avançada" muda conforme o que você precisa que a IA faça',
  evaluationCards: [
    {
      title: "Raciocínio e planejamento",
      body:
        "Se você quer dizer qualidade de cadeia de pensamento, ajuda com código ou análise de longo formato, a lista normalmente vem dos modelos de fronteira mais recentes dos grandes laboratórios. Essa é uma definição de IA avançada, mas não a única.",
    },
    {
      title: "Criação multimodal",
      body:
        "Se você precisa de saída de imagem ou vídeo, sistemas especializados de geração importam mais do que um benchmark puro de texto. A IA mais avançada para mídia pode ser diferente da IA mais avançada para raciocínio.",
    },
    {
      title: "Entendimento visual",
      body:
        "Um modelo pode ser excelente em escrita e ainda ser fraco para ler capturas de tela, diagramas ou gravações. IA avançada para produção costuma significar fluxos de visão e análise mais fortes, não só inteligência textual.",
    },
    {
      title: "Conclusão de tarefa",
      body:
        "O modelo é só uma parte do sistema. Para terminar trabalho real, um agente muitas vezes precisa de ferramentas para criar ativos, inspecionar arquivos e devolver resultados em um formato que humanos possam usar.",
    },
  ],
  stackLabel: "Uma estrutura mais útil",
  stackTitle: "Na prática, IA avançada é uma stack, não uma única pontuação de benchmark",
  stackIntro:
    "Essa é a diferença entre manchetes de IA e realidade de produção. As pessoas comparam inteligência de modelo primeiro, mas os times normalmente sentem a dor depois: o agente explica a tarefa, mas não consegue criar a imagem, inspecionar a gravação ou entregar algo útil. É por isso que a conversa real precisa incluir o sistema em volta do modelo.",
  stackLayers: [
    {
      title: "Modelo base",
      body:
        "É a parte que as pessoas normalmente comparam primeiro: qualidade bruta de raciocínio, desempenho em código, amplitude de conhecimento e capacidade multimodal.",
    },
    {
      title: "Runtime de capacidades",
      body:
        "É a camada que dá ao agente poderes utilizáveis ao redor do modelo, como geração de imagem, geração de vídeo, entendimento de imagem e análise de vídeo.",
    },
    {
      title: "Camada de entrega",
      body:
        "Mesmo a IA forte precisa de uma forma de entregar resultados. Os sistemas mais úteis conseguem sair do raciocínio e chegar em uma saída que alguém possa revisar, compartilhar ou publicar.",
    },
  ],
  capabilityLabel: "Onde o AnyCap entra",
  capabilityTitle: "O AnyCap não é o modelo de fronteira. É o runtime de capacidades ao redor do sistema.",
  capabilityIntro:
    "Essa distinção importa. O AnyCap não tenta vencer sozinho a corrida de \"melhor modelo\". O papel dele é ajudar agentes e assistentes a sair do raciocínio para a ação por meio de um único caminho de instalação, um único fluxo de autenticação e uma única superfície de CLI. Para times que já usam um fluxo de trabalho de que gostam, isso costuma ser mais útil do que trocar de plataforma só para perseguir o modelo que parece mais forte neste mês.",
  capabilityCards: [
    {
      title: "Geração de imagem",
      href: "/capabilities/image-generation",
      body: "Crie mockups, conceitos e assets visuais em vez de parar em instruções de texto sobre o que fazer.",
    },
    {
      title: "Geração de vídeo",
      href: "/capabilities/video-generation",
      body: "Transforme prompts em demos, motion assets ou explicações curtas quando uma resposta estática não basta.",
    },
    {
      title: "Entendimento de imagem",
      href: "/capabilities/image-understanding",
      body: "Leia capturas de tela, diagramas, referências e inputs de QA visual pelo mesmo fluxo de agente.",
    },
    {
      title: "Análise de vídeo",
      href: "/capabilities/video-analysis",
      body: "Inspecione gravações e explique o que aconteceu em vez de tratar vídeo como uma caixa-preta fora do fluxo.",
    },
  ],
  selectionLabel: "Como escolher",
  selectionTitle: 'Faça uma pergunta melhor do que "qual IA é número 1?"',
  selectionRows: [
    {
      question: "Quem tem o modelo de raciocínio mais forte agora?",
      answer:
        "Olhe as comparações mais recentes de modelos de fronteira, mas espere que a resposta mude com frequência. Essa é uma pergunta de ranking de modelo, não uma pergunta de fluxo completo.",
    },
    {
      question: "Qual é a IA mais avançada para trabalho real?",
      answer:
        "Uma resposta melhor é uma stack: inteligência forte de modelo mais as capacidades necessárias para gerar, inspecionar e entregar saídas.",
    },
    {
      question: "O que mais importa para fluxos de agentes no mundo real?",
      answer:
        "O que mais importa é se o sistema consegue terminar a tarefa, não se um modelo lidera um benchmark. Isso normalmente significa qualidade do modelo mais as camadas certas de capacidade e entrega ao redor dele.",
    },
  ],
  nextMoveLabel: "Próximos passos",
  nextMoveTitle: "Continue deste explicador para páginas de maior intenção",
  nextMoveCards: [
    {
      title: "Comece pela lacuna de capacidade",
      href: "/learn/what-agents-cant-do",
      body: "Use esta página se a pergunta real é o que agentes conseguem ou não fazer antes de adicionar capacidades externas.",
    },
    {
      title: "Veja o hub de capacidades",
      href: "/capabilities",
      body: "Navegue pelos fluxos práticos que o AnyCap foi construído para adicionar ao redor de agentes de código.",
    },
    {
      title: "Equipe seu agente atual",
      href: "/for",
      body: "Veja como a camada de capacidades se encaixa no agente que você já usa em vez de forçar uma troca de plataforma.",
    },
    {
      title: "Vá pelo caminho mais curto",
      href: "/start",
      body: "Quando passar da pesquisa para a execução, use o caminho rápido para sair da leitura e entrar no setup.",
    },
  ],
  faqLabel: "FAQ",
  faqTitle: "Perguntas por trás da busca",
  faqItems: [
    {
      question: "Qual é a IA mais avançada agora?",
      answer:
        "Não existe uma única resposta permanente. A líder em raciocínio pode ser diferente do melhor sistema para geração de mídia, entendimento visual ou execução de agentes.",
    },
    {
      question: "A IA mais avançada é sempre a melhor IA para trabalho?",
      answer:
        "Não necessariamente. Para trabalho real, a IA mais útil normalmente combina qualidade de modelo com acesso às capacidades certas ao redor dele.",
    },
    {
      question: "O AnyCap é o próprio modelo de IA?",
      answer:
        "Não. O AnyCap é o runtime de capacidades ao redor de agentes e assistentes. O papel dele é ajudá-los a gerar, inspecionar e entregar saídas através de um único caminho de instalação e uma única superfície de CLI.",
    },
    {
      question: "No que devo otimizar se uso IA dentro de um fluxo de agente?",
      answer:
        "Otimizar para conclusão de tarefa, não para prestígio de benchmark. Um modelo forte sem uma camada de capacidades utilizável muitas vezes perde para um modelo um pouco mais fraco que consegue realmente terminar o trabalho.",
    },
  ],
};

const id = en;

const contentByLocale: Record<SiteLocale, WhatIsTheMostAdvancedAIPageData> = {
  en,
  "pt-br": ptBr,
  id,
};

export function getWhatIsTheMostAdvancedAIMetadata(locale: SiteLocale): Metadata {
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

export function getWhatIsTheMostAdvancedAIPageData(locale: SiteLocale) {
  return contentByLocale[locale] ?? contentByLocale.en;
}
