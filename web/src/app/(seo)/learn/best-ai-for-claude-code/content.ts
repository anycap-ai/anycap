import type { Metadata } from "next";
import { createFaqPageJsonLd, createTechArticleJsonLd } from "@/lib/schema";
import { getLocaleConfig, siteConfig, type SiteLocale } from "@/lib/site";

export const BEST_AI_FOR_CLAUDE_CODE_PATH = "/learn/best-ai-for-claude-code";

type BestAIForClaudeCodePageData = {
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
  heroTitle: [string, string];
  heroIntro: string;
  quickAnswerLabel: string;
  quickAnswerTitle: string;
  quickAnswerBody: string;
  quickTakeawaysLabel: string;
  quickTakeaways: readonly string[];
  evaluationLabel: string;
  evaluationTitle: string;
  evaluationCards: readonly { title: string; body: string }[];
  stackLabel: string;
  stackTitle: string;
  stackCards: readonly { title: string; label: string; body: string }[];
  capabilityLabel: string;
  capabilityTitle: string;
  capabilityCards: readonly { title: string; href: string; body: string }[];
  decisionLabel: string;
  decisionTitle: string;
  decisionRows: readonly { question: string; answer: string }[];
  nextMoveLabel: string;
  nextMoveTitle: string;
  nextMoveCards: readonly { title: string; href: string; body: string }[];
  faqLabel: string;
  faqTitle: string;
  faqItems: readonly { question: string; answer: string }[];
};

const lastUpdatedIso = "2026-04-07";

const en: BestAIForClaudeCodePageData = {
  breadcrumbItems: [
    { name: "Home", href: "/" },
    { name: "Learn", href: "/learn", unlinkable: true },
    { name: "Best AI for Claude Code" },
  ],
  eyebrow: "Learn",
  metadata: {
    title: "Best AI for Claude Code | Claude Code + Capabilities",
    description:
      "The best AI for Claude Code is usually the setup that keeps Claude Code's terminal-native workflow intact while adding the image, video, and vision capabilities it lacks.",
    openGraphTitle: "Best AI for Claude Code | Claude Code + Capabilities",
    openGraphDescription:
      "A buyer guide for teams deciding whether the best Claude Code setup is Claude Code alone, Claude Code plus ad hoc tools, or Claude Code plus one capability runtime.",
  },
  articleJsonLd: createTechArticleJsonLd({
    headline: "Best AI for Claude Code: the right setup is usually Claude Code plus capabilities",
    description:
      "A buyer guide for teams deciding whether the best Claude Code setup is Claude Code alone, Claude Code plus ad hoc tools, or Claude Code plus one capability runtime.",
    path: BEST_AI_FOR_CLAUDE_CODE_PATH,
    about: ["Claude Code", "Coding agents", "AI capabilities", "Image generation", "Video generation", "Agent capability runtime"],
    keywords: [
      "best ai for claude code",
      "best ai tools for claude code",
      "claude code capabilities",
      "add tools to claude code",
      "claude code terminal workflow",
    ],
    datePublished: lastUpdatedIso,
    dateModified: lastUpdatedIso,
  }),
  faqJsonLd: createFaqPageJsonLd([
    {
      question: "What is the best AI for Claude Code right now?",
      answer:
        "If you mean terminal-native coding work, Claude Code may already be the right foundation. If you mean the full workflow around coding, the best setup is often Claude Code plus the capabilities it still lacks.",
    },
    {
      question: "Is the best AI for Claude Code always a different model?",
      answer:
        "Not always. Sometimes the bigger gain comes from adding media and vision capabilities around Claude Code rather than changing the core agent itself.",
    },
    {
      question: "What usually breaks first in a Claude Code workflow?",
      answer:
        "The first breakpoint is usually not reasoning quality. It is when the workflow must inspect screenshots, analyze recordings, or generate images and video that Claude Code does not provide as a built-in runtime.",
    },
    {
      question: "Does AnyCap replace Claude Code?",
      answer:
        "No. AnyCap extends Claude Code. Its role is to add image generation, video generation, image understanding, and video analysis around the agent you already use.",
    },
    {
      question: "What is the fastest way to try Claude Code plus capabilities?",
      answer:
        "Start with the Add Tools to Claude Code guide, then test one concrete path like Claude Code image generation or Claude Code video generation. That gives you a real workflow check without switching agents.",
    },
  ]),
  lastUpdatedLabel: "April 7, 2026",
  heroTitle: ["Best AI for", "Claude Code"],
  heroIntro:
    "The best AI for Claude Code is usually not a question about replacing Claude Code at all. It is a question about whether your workflow still fits a terminal-native loop or whether the job has started to depend on screenshots, recordings, media output, and artifacts that Claude Code does not provide on its own.",
  quickAnswerLabel: "Quick answer",
  quickAnswerTitle: "The best Claude Code setup usually keeps Claude Code as the terminal-native core.",
  quickAnswerBody:
    "This keeps the reasoning and coding loop intact while expanding what the workflow can actually finish. For many teams, that is more practical than introducing a new agent surface just because the task briefly leaves the terminal and becomes multimodal.",
  quickTakeawaysLabel: "Key points",
  quickTakeaways: [
    "Claude Code already covers the core terminal loop for planning, editing, shell execution, and repo work.",
    "The first real breakpoint is usually not coding quality. It is when the workflow must produce or inspect images, video, screenshots, or recordings.",
    "For most teams, the best move is to keep Claude Code and add one capability runtime instead of replacing the agent.",
  ],
  evaluationLabel: "What to evaluate",
  evaluationTitle: "Start by asking whether the workflow still fits a terminal-native loop",
  evaluationCards: [
    {
      title: "How terminal-native the work still is",
      body:
        "If the workflow is mostly code planning, diffing, debugging, test fixing, and shell execution, the core question is whether Claude Code is already strong enough for your team. Often it is.",
    },
    {
      title: "How often visual inputs show up",
      body:
        "The shape changes when software work starts from screenshots, diagrams, recordings, or visual QA evidence. That is where the best AI for Claude Code stops being only a model question.",
    },
    {
      title: "How often the result must leave the terminal",
      body:
        "A stack that only edits code is not enough when the final result must become an artifact a human can review, share, publish, or hand to another team.",
    },
    {
      title: "How much setup sprawl you can tolerate",
      body:
        "The best theoretical stack is not always the best practical stack. Separate providers, credentials, and helper scripts can turn into a maintenance burden around Claude Code very quickly.",
    },
  ],
  stackLabel: "Three setup patterns",
  stackTitle: "Most teams evaluating Claude Code are really choosing how much to extend the terminal",
  stackCards: [
    {
      title: "Claude Code only",
      label: "Best when the work stays terminal-native",
      body:
        "This is the simplest path when the work stays close to code, tests, logs, files, and shell commands. The value comes from strong reasoning inside the terminal-driven coding loop.",
    },
    {
      title: "Claude Code plus ad hoc provider scripts",
      label: "Works, but operational debt grows",
      body:
        "You can bolt on an image API here, a video API there, and a visual analysis script later. The problem is that the workflow starts to fragment across keys, providers, and setup surfaces.",
    },
    {
      title: "Claude Code plus a capability runtime",
      label: "Best when the terminal needs outside capabilities",
      body:
        "This is the setup AnyCap is built for. You keep Claude Code for code, planning, and terminal execution, then add image generation, video generation, image understanding, and video analysis through one runtime.",
    },
  ],
  capabilityLabel: "First capabilities to add",
  capabilityTitle: "These are usually the first gaps that appear after pure repo work",
  capabilityCards: [
    {
      title: "Claude Code image generation",
      href: "/for/claude-code/image-generation",
      body:
        "Use this path when Claude Code needs to produce visuals, product mockups, or launch assets instead of only describing them.",
    },
    {
      title: "Claude Code video generation",
      href: "/for/claude-code/video-generation",
      body:
        "Use this path when the workflow needs demos, walkthroughs, or short motion assets inside the same agent setup.",
    },
    {
      title: "Image understanding",
      href: "/capabilities/image-understanding",
      body:
        "Use this when Claude Code needs to inspect screenshots, diagrams, references, or visual QA inputs.",
    },
    {
      title: "Video analysis",
      href: "/capabilities/video-analysis",
      body:
        "Use this when the bug, product issue, or workflow evidence lives in a recording rather than a text log.",
    },
  ],
  decisionLabel: "How to decide",
  decisionTitle: "Ask these questions before replacing a workflow you already like",
  decisionRows: [
    {
      question: "When is Claude Code already enough on its own?",
      answer:
        "Claude Code is often enough when the workflow stays inside the codebase and the main job is reasoning, editing, testing, and terminal execution.",
    },
    {
      question: "When do I need more than Claude Code?",
      answer:
        "You need more than Claude Code when the task requires image output, video output, screenshot interpretation, visual QA, recording analysis, or a result that needs to leave the terminal as an artifact.",
    },
    {
      question: "Should I replace Claude Code or extend it?",
      answer:
        "Usually extend it. For many teams, the better move is to keep Claude Code and add the capabilities it does not ship with rather than introducing a new agent surface and retraining the workflow.",
    },
    {
      question: "What is the fastest way to test the better setup?",
      answer:
        "Start with the Add Tools to Claude Code guide or jump straight into Claude Code image generation or video generation. That lets you test the capability gap without changing your core agent.",
    },
  ],
  nextMoveLabel: "Best next moves",
  nextMoveTitle: "Move from this buyer guide into the exact Claude Code path you need",
  nextMoveCards: [
    {
      title: "Add tools to Claude Code",
      href: "/guides/add-tools-to-claude-code",
      body: "Use this when you are ready to test the shorter setup path instead of reading another explainer.",
    },
    {
      title: "Start with image generation",
      href: "/for/claude-code/image-generation",
      body: "Best next move when the first missing output is visuals, concept images, or product mockups.",
    },
    {
      title: "Start with video generation",
      href: "/for/claude-code/video-generation",
      body: "Best next move when the first missing output is a demo clip, walkthrough, or motion asset.",
    },
    {
      title: "What is the most advanced AI?",
      href: "/learn/what-is-the-most-advanced-ai",
      body: "Go here when the question is about the frontier overall, not just Claude Code specifically.",
    },
    {
      title: "See the Claude Code hub",
      href: "/for/claude-code",
      body: "Move here when you want the primary Claude Code landing page instead of a Learn-style buyer guide.",
    },
  ],
  faqLabel: "FAQ",
  faqTitle: "Questions behind the keyword",
  faqItems: [
    {
      question: "What is the best AI for Claude Code right now?",
      answer:
        "If you mean terminal-native coding work, Claude Code may already be the right foundation. If you mean the full workflow around coding, the best setup is often Claude Code plus the capabilities it still lacks.",
    },
    {
      question: "Is the best AI for Claude Code always a different model?",
      answer:
        "Not always. Sometimes the bigger gain comes from adding media and vision capabilities around Claude Code rather than changing the core agent itself.",
    },
    {
      question: "What usually breaks first in a Claude Code workflow?",
      answer:
        "The first breakpoint is usually not reasoning quality. It is when the workflow must inspect screenshots, analyze recordings, or generate images and video that Claude Code does not provide as a built-in runtime.",
    },
    {
      question: "Does AnyCap replace Claude Code?",
      answer:
        "No. AnyCap extends Claude Code. Its role is to add image generation, video generation, image understanding, and video analysis around the agent you already use.",
    },
    {
      question: "What is the fastest way to try Claude Code plus capabilities?",
      answer:
        "Start with the Add Tools to Claude Code guide, then test one concrete path like Claude Code image generation or Claude Code video generation. That gives you a real workflow check without switching agents.",
    },
  ],
};

const ptBr: BestAIForClaudeCodePageData = {
  breadcrumbItems: [
    { name: "Início", href: "/" },
    { name: "Aprender", href: "/learn", unlinkable: true },
    { name: "Melhor IA para Claude Code" },
  ],
  eyebrow: "Aprender",
  metadata: {
    title: "Melhor IA para Claude Code | Claude Code + Capacidades",
    description:
      "A melhor IA para Claude Code normalmente é a configuração que mantém o fluxo nativo de terminal do Claude Code intacto, enquanto adiciona as capacidades de imagem, vídeo e visão que ele ainda não traz.",
    openGraphTitle: "Melhor IA para Claude Code | Claude Code + Capacidades",
    openGraphDescription:
      "Um guia de compra para times decidindo se a melhor configuração de Claude Code é só o Claude Code, o Claude Code com ferramentas avulsas ou o Claude Code com um runtime de capacidades.",
  },
  articleJsonLd: createTechArticleJsonLd({
    headline: "Melhor IA para Claude Code: a configuração certa normalmente é Claude Code + capacidades",
    description:
      "Um guia de compra para times decidindo se a melhor configuração de Claude Code é só o Claude Code, o Claude Code com ferramentas avulsas ou o Claude Code com um runtime de capacidades.",
    path: BEST_AI_FOR_CLAUDE_CODE_PATH,
    about: ["Claude Code", "agentes de código", "capacidades de IA", "geração de imagem", "geração de vídeo", "runtime de capacidades"],
    keywords: [
      "melhor ia para claude code",
      "ferramentas para claude code",
      "capacidades do claude code",
      "adicionar ferramentas ao claude code",
      "fluxo terminal do claude code",
    ],
    datePublished: lastUpdatedIso,
    dateModified: lastUpdatedIso,
  }),
  faqJsonLd: createFaqPageJsonLd([
    {
      question: "Qual é a melhor IA para Claude Code agora?",
      answer:
        "Se você quer dizer trabalho de código nativo de terminal, o Claude Code talvez já seja a base certa. Se você quer dizer o fluxo completo ao redor do código, a melhor configuração costuma ser Claude Code mais as capacidades que ele ainda não tem.",
    },
    {
      question: "A melhor IA para Claude Code é sempre outro modelo?",
      answer:
        "Não necessariamente. Às vezes o ganho maior vem de adicionar capacidades de mídia e visão ao redor do Claude Code, em vez de trocar o agente central.",
    },
    {
      question: "O que costuma quebrar primeiro em um fluxo com Claude Code?",
      answer:
        "O primeiro ponto de ruptura geralmente não é a qualidade de raciocínio. É quando o fluxo precisa inspecionar capturas de tela, analisar gravações ou gerar imagens e vídeo que o Claude Code não oferece como runtime nativo.",
    },
    {
      question: "O AnyCap substitui o Claude Code?",
      answer:
        "Não. O AnyCap estende o Claude Code. O papel dele é adicionar geração de imagem, geração de vídeo, entendimento de imagem e análise de vídeo ao redor do agente que você já usa.",
    },
    {
      question: "Qual é a forma mais rápida de testar Claude Code com capacidades?",
      answer:
        "Comece com o guia de adicionar ferramentas ao Claude Code e teste um caminho concreto, como geração de imagem ou geração de vídeo. Isso valida a lacuna de capacidade sem trocar de agente.",
    },
  ]),
  lastUpdatedLabel: "7 de abril de 2026",
  heroTitle: ["Melhor IA para", "Claude Code"],
  heroIntro:
    "A melhor IA para Claude Code normalmente não é uma pergunta sobre substituir o Claude Code. É uma pergunta sobre se o seu fluxo ainda cabe em um loop nativo de terminal ou se o trabalho passou a depender de capturas de tela, gravações, saída multimídia e artefatos que o Claude Code não produz sozinho.",
  quickAnswerLabel: "Resposta rápida",
  quickAnswerTitle: "A melhor configuração de Claude Code normalmente mantém o Claude Code como núcleo nativo de terminal.",
  quickAnswerBody:
    "Isso preserva o loop de raciocínio e código enquanto amplia o que o fluxo consegue realmente entregar. Para muitos times, isso é mais prático do que introduzir uma nova superfície de agente só porque a tarefa saiu brevemente do terminal e virou multimodal.",
  quickTakeawaysLabel: "Pontos principais",
  quickTakeaways: [
    "O Claude Code já cobre o loop principal de terminal para planejamento, edição, execução de shell e trabalho no repositório.",
    "O primeiro ponto de ruptura real normalmente não é a qualidade do código, e sim quando o fluxo precisa produzir ou inspecionar imagens, vídeo, capturas de tela ou gravações.",
    "Para a maioria dos times, o melhor passo é manter o Claude Code e adicionar um runtime de capacidades em vez de trocar o agente.",
  ],
  evaluationLabel: "O que avaliar",
  evaluationTitle: "Comece perguntando se o fluxo ainda cabe em um loop nativo de terminal",
  evaluationCards: [
    {
      title: "Quão nativo do terminal ainda é o trabalho",
      body:
        "Se o fluxo é principalmente planejamento de código, diffs, debug, correção de testes e execução de shell, a pergunta central é se o Claude Code já é forte o suficiente para o time. Muitas vezes é.",
    },
    {
      title: "Com que frequência entram inputs visuais",
      body:
        "A configuração muda quando o trabalho de software começa em capturas de tela, diagramas, gravações ou evidências de QA visual. É aí que a melhor IA para Claude Code deixa de ser só uma questão de modelo.",
    },
    {
      title: "Com que frequência o resultado precisa sair do terminal",
      body:
        "Uma stack que só edita código não basta quando o resultado final precisa virar um artefato que alguém possa revisar, compartilhar, publicar ou passar para outro time.",
    },
    {
      title: "Quanto de sprawl de setup você tolera",
      body:
        "A melhor stack teórica nem sempre é a melhor stack prática. Provedores separados, credenciais separadas e scripts auxiliares podem virar um custo de manutenção grande ao redor do Claude Code.",
    },
  ],
  stackLabel: "Três padrões de configuração",
  stackTitle: "A maioria dos times avaliando Claude Code está, na prática, decidindo quanto quer estender o terminal",
  stackCards: [
    {
      title: "Só Claude Code",
      label: "Melhor quando o trabalho continua nativo de terminal",
      body:
        "Esse é o caminho mais simples quando o trabalho fica perto de código, testes, logs, arquivos e comandos de shell. O valor vem de raciocínio forte dentro do loop de código conduzido pelo terminal.",
    },
    {
      title: "Claude Code com scripts avulsos de provedores",
      label: "Funciona, mas a dívida operacional cresce",
      body:
        "Você pode acoplar uma API de imagem aqui, uma API de vídeo ali e um script de análise visual depois. O problema é que o fluxo começa a fragmentar entre chaves, provedores e superfícies de setup.",
    },
    {
      title: "Claude Code com um runtime de capacidades",
      label: "Melhor quando o terminal precisa de capacidades externas",
      body:
        "É exatamente para isso que o AnyCap foi criado. Você mantém Claude Code para código, planejamento e execução no terminal, e adiciona geração de imagem, geração de vídeo, entendimento de imagem e análise de vídeo por um único runtime.",
    },
  ],
  capabilityLabel: "Primeiras capacidades para adicionar",
  capabilityTitle: "Essas costumam ser as primeiras lacunas que aparecem depois do trabalho puro no repositório",
  capabilityCards: [
    {
      title: "Geração de imagem para Claude Code",
      href: "/for/claude-code/image-generation",
      body:
        "Use este caminho quando o Claude Code precisar produzir visuais, mockups de produto ou assets de lançamento em vez de apenas descrevê-los.",
    },
    {
      title: "Geração de vídeo para Claude Code",
      href: "/for/claude-code/video-generation",
      body:
        "Use este caminho quando o fluxo precisar de demos, walkthroughs ou motion assets curtos dentro da mesma configuração de agente.",
    },
    {
      title: "Entendimento de imagem",
      href: "/capabilities/image-understanding",
      body:
        "Use isto quando o Claude Code precisar inspecionar capturas de tela, diagramas, referências ou entradas de QA visual.",
    },
    {
      title: "Análise de vídeo",
      href: "/capabilities/video-analysis",
      body:
        "Use isto quando o bug, o problema de produto ou a evidência do fluxo estiver em uma gravação em vez de um log de texto.",
    },
  ],
  decisionLabel: "Como decidir",
  decisionTitle: "Faça estas perguntas antes de substituir um fluxo que você já gosta",
  decisionRows: [
    {
      question: "Quando o Claude Code já é suficiente sozinho?",
      answer:
        "O Claude Code muitas vezes é suficiente quando o fluxo fica dentro da base de código e a principal tarefa é raciocinar, editar, testar e executar comandos de terminal.",
    },
    {
      question: "Quando eu preciso de mais do que o Claude Code?",
      answer:
        "Você precisa de mais do que o Claude Code quando a tarefa exige saída de imagem, saída de vídeo, interpretação de capturas de tela, QA visual, análise de gravações ou um resultado que precise sair do terminal como artefato.",
    },
    {
      question: "Devo substituir o Claude Code ou estendê-lo?",
      answer:
        "Geralmente estenda. Para muitos times, a melhor decisão é manter o Claude Code e adicionar as capacidades que ele não traz, em vez de introduzir uma nova superfície de agente e reaprender o fluxo.",
    },
    {
      question: "Qual é a forma mais rápida de testar a configuração melhor?",
      answer:
        "Comece com o guia de adicionar ferramentas ao Claude Code ou vá direto para geração de imagem ou vídeo no Claude Code. Isso permite testar a lacuna de capacidade sem trocar o agente central.",
    },
  ],
  nextMoveLabel: "Próximos melhores passos",
  nextMoveTitle: "Passe deste guia de compra para o caminho exato de Claude Code que você precisa",
  nextMoveCards: [
    {
      title: "Adicionar ferramentas ao Claude Code",
      href: "/guides/add-tools-to-claude-code",
      body: "Use isto quando estiver pronto para testar o caminho de configuração mais curto em vez de ler mais uma explicação.",
    },
    {
      title: "Começar com geração de imagem",
      href: "/for/claude-code/image-generation",
      body: "Próximo passo ideal quando a primeira saída que está faltando são visuais, imagens de conceito ou mockups.",
    },
    {
      title: "Começar com geração de vídeo",
      href: "/for/claude-code/video-generation",
      body: "Próximo passo ideal quando a primeira saída que está faltando é um clipe demo, walkthrough ou asset em movimento.",
    },
    {
      title: "Qual é a IA mais avançada?",
      href: "/learn/what-is-the-most-advanced-ai",
      body: "Vá aqui quando a pergunta for sobre a fronteira no geral, e não apenas sobre o Claude Code.",
    },
    {
      title: "Ver o hub do Claude Code",
      href: "/for/claude-code",
      body: "Vá aqui quando quiser a landing page principal do Claude Code em vez de um guia de compra no estilo Learn.",
    },
  ],
  faqLabel: "FAQ",
  faqTitle: "Perguntas por trás da busca",
  faqItems: [
    {
      question: "Qual é a melhor IA para Claude Code agora?",
      answer:
        "Se você quer dizer trabalho de código nativo de terminal, o Claude Code talvez já seja a base certa. Se você quer dizer o fluxo completo ao redor do código, a melhor configuração costuma ser Claude Code mais as capacidades que ele ainda não tem.",
    },
    {
      question: "A melhor IA para Claude Code é sempre outro modelo?",
      answer:
        "Não necessariamente. Às vezes o ganho maior vem de adicionar capacidades de mídia e visão ao redor do Claude Code, em vez de trocar o agente central.",
    },
    {
      question: "O que costuma quebrar primeiro em um fluxo com Claude Code?",
      answer:
        "O primeiro ponto de ruptura geralmente não é a qualidade de raciocínio. É quando o fluxo precisa inspecionar capturas de tela, analisar gravações ou gerar imagens e vídeo que o Claude Code não oferece como runtime nativo.",
    },
    {
      question: "O AnyCap substitui o Claude Code?",
      answer:
        "Não. O AnyCap estende o Claude Code. O papel dele é adicionar geração de imagem, geração de vídeo, entendimento de imagem e análise de vídeo ao redor do agente que você já usa.",
    },
    {
      question: "Qual é a forma mais rápida de testar Claude Code com capacidades?",
      answer:
        "Comece com o guia de adicionar ferramentas ao Claude Code e teste um caminho concreto, como geração de imagem ou geração de vídeo. Isso valida a lacuna de capacidade sem trocar de agente.",
    },
  ],
};

const id: BestAIForClaudeCodePageData = {
  breadcrumbItems: [
    { name: "Beranda", href: "/" },
    { name: "Belajar", href: "/learn", unlinkable: true },
    { name: "AI terbaik untuk Claude Code" },
  ],
  eyebrow: "Belajar",
  metadata: {
    title: "AI terbaik untuk Claude Code | Claude Code + kemampuan",
    description:
      "AI terbaik untuk Claude Code biasanya adalah setup yang menjaga alur kerja native-terminal Claude Code tetap utuh, sambil menambahkan kemampuan gambar, video, dan visi yang belum dimilikinya.",
    openGraphTitle: "AI terbaik untuk Claude Code | Claude Code + kemampuan",
    openGraphDescription:
      "Panduan pemilihan untuk tim yang memutuskan apakah setup Claude Code terbaik adalah Claude Code saja, Claude Code plus alat ad hoc, atau Claude Code plus satu capability runtime.",
  },
  articleJsonLd: createTechArticleJsonLd({
    headline: "AI terbaik untuk Claude Code: setup yang tepat biasanya Claude Code ditambah kemampuan",
    description:
      "Panduan pemilihan untuk tim yang memutuskan apakah setup Claude Code terbaik adalah Claude Code saja, Claude Code plus alat ad hoc, atau Claude Code plus satu capability runtime.",
    path: BEST_AI_FOR_CLAUDE_CODE_PATH,
    about: ["Claude Code", "Agen coding", "Kemampuan AI", "Image generation", "Video generation", "Agent capability runtime"],
    keywords: [
      "ai terbaik untuk claude code",
      "tools terbaik untuk claude code",
      "kemampuan claude code",
      "menambahkan tools ke claude code",
      "alur terminal claude code",
    ],
    datePublished: lastUpdatedIso,
    dateModified: lastUpdatedIso,
  }),
  faqJsonLd: createFaqPageJsonLd([
    {
      question: "Apa AI terbaik untuk Claude Code saat ini?",
      answer:
        "Jika yang dimaksud pekerjaan coding native-terminal, Claude Code mungkin sudah menjadi fondasi yang tepat. Jika yang dimaksud alur kerja lengkap di sekitar coding, setup terbaik sering kali adalah Claude Code ditambah kemampuan yang masih kurang.",
    },
    {
      question: "Apakah AI terbaik untuk Claude Code selalu model yang berbeda?",
      answer:
        "Tidak selalu. Terkadang keuntungan lebih besar datang dari menambahkan kemampuan media dan visi di sekitar Claude Code, bukan mengganti agen intinya.",
    },
    {
      question: "Apa yang biasanya pecah lebih dulu dalam alur Claude Code?",
      answer:
        "Titik putus pertama biasanya bukan kualitas reasoning. Melainkan saat alur kerja harus memeriksa screenshot, menganalisis rekaman, atau menghasilkan gambar dan video yang tidak disediakan Claude Code sebagai built-in runtime.",
    },
    {
      question: "Apakah AnyCap menggantikan Claude Code?",
      answer:
        "Tidak. AnyCap memperluas Claude Code. Perannya menambahkan image generation, video generation, image understanding, dan video analysis di sekitar agen yang sudah Anda gunakan.",
    },
    {
      question: "Apa cara tercepat mencoba Claude Code ditambah kemampuan?",
      answer:
        "Mulai dari panduan Add Tools to Claude Code, lalu uji satu jalur konkret seperti Claude Code image generation atau Claude Code video generation. Itu memberi pemeriksaan alur nyata tanpa mengganti agen.",
    },
  ]),
  lastUpdatedLabel: "7 April 2026",
  heroTitle: ["AI terbaik untuk", "Claude Code"],
  heroIntro:
    "AI terbaik untuk Claude Code biasanya bukan pertanyaan tentang mengganti Claude Code sama sekali. Ini pertanyaan apakah alur kerja Anda masih cocok dengan loop native-terminal atau pekerjaan sudah bergantung pada screenshot, rekaman, output media, dan artefak yang tidak disediakan Claude Code sendiri.",
  quickAnswerLabel: "Jawaban singkat",
  quickAnswerTitle: "Setup Claude Code terbaik biasanya menjaga Claude Code sebagai inti native-terminal.",
  quickAnswerBody:
    "Ini menjaga loop reasoning dan coding tetap utuh sambil memperluas apa yang benar-benar bisa diselesaikan alur kerja. Bagi banyak tim, ini lebih praktis daripada memperkenalkan permukaan agen baru hanya karena tugas sebentar keluar dari terminal dan menjadi multimodal.",
  quickTakeawaysLabel: "Poin utama",
  quickTakeaways: [
    "Claude Code sudah mencakup loop terminal inti untuk perencanaan, pengeditan, eksekusi shell, dan pekerjaan repo.",
    "Titik putus nyata pertama biasanya bukan kualitas coding. Melainkan saat alur kerja harus menghasilkan atau memeriksa gambar, video, screenshot, atau rekaman.",
    "Bagi banyak tim, langkah terbaik adalah mempertahankan Claude Code dan menambahkan satu capability runtime alih-alih mengganti agen.",
  ],
  evaluationLabel: "Yang perlu dievaluasi",
  evaluationTitle: "Mulai dengan bertanya apakah alur kerja masih cocok dengan loop native-terminal",
  evaluationCards: [
    {
      title: "Seberapa native-terminal pekerjaannya",
      body:
        "Jika alur kerja sebagian besar perencanaan kode, diff, debugging, perbaikan tes, dan eksekusi shell, pertanyaan intinya apakah Claude Code sudah cukup kuat untuk tim Anda. Sering kali memang sudah.",
    },
    {
      title: "Seberapa sering input visual muncul",
      body:
        "Bentuknya berubah saat pekerjaan software berawal dari screenshot, diagram, rekaman, atau bukti QA visual. Di situlah AI terbaik untuk Claude Code berhenti menjadi sekadar pertanyaan model.",
    },
    {
      title: "Seberapa sering hasil harus keluar dari terminal",
      body:
        "Stack yang hanya mengedit kode tidak cukup saat hasil akhir harus menjadi artefak yang bisa direview, dibagikan, dipublikasikan, atau diserahkan ke tim lain.",
    },
    {
      title: "Seberapa besar sprawl setup yang bisa Anda toleransi",
      body:
        "Stack teoritis terbaik belum tentu stack praktis terbaik. Provider terpisah, kredensial, dan skrip pembantu bisa dengan cepat menjadi beban pemeliharaan di sekitar Claude Code.",
    },
  ],
  stackLabel: "Tiga pola setup",
  stackTitle: "Kebanyakan tim yang mengevaluasi Claude Code sebenarnya memilih seberapa jauh memperluas terminal",
  stackCards: [
    {
      title: "Hanya Claude Code",
      label: "Terbaik saat pekerjaan tetap native-terminal",
      body:
        "Ini jalur paling sederhana saat pekerjaan tetap dekat dengan kode, tes, log, file, dan perintah shell. Nilainya datang dari reasoning kuat di dalam loop coding yang digerakkan terminal.",
    },
    {
      title: "Claude Code plus skrip provider ad hoc",
      label: "Bisa jalan, tetapi utang operasional bertambah",
      body:
        "Anda bisa menambel image API di sini, video API di sana, dan skrip analisis visual nanti. Masalahnya alur kerja mulai terpecah antar key, provider, dan permukaan setup.",
    },
    {
      title: "Claude Code plus capability runtime",
      label: "Terbaik saat terminal butuh kemampuan di luar",
      body:
        "Ini setup yang dibuat AnyCap. Anda mempertahankan Claude Code untuk kode, perencanaan, dan eksekusi terminal, lalu menambahkan image generation, video generation, image understanding, dan video analysis lewat satu runtime.",
    },
  ],
  capabilityLabel: "Kemampuan pertama untuk ditambahkan",
  capabilityTitle: "Ini biasanya celah pertama yang muncul setelah pekerjaan repo murni",
  capabilityCards: [
    {
      title: "Pembuatan gambar untuk Claude Code",
      href: "/for/claude-code/image-generation",
      body:
        "Gunakan jalur ini saat Claude Code perlu menghasilkan visual, mockup produk, atau aset peluncuran, bukan hanya mendeskripsikannya.",
    },
    {
      title: "Pembuatan video untuk Claude Code",
      href: "/for/claude-code/video-generation",
      body:
        "Gunakan jalur ini saat alur kerja butuh demo, walkthrough, atau motion asset pendek dalam setup agen yang sama.",
    },
    {
      title: "Pemahaman gambar (image understanding)",
      href: "/capabilities/image-understanding",
      body:
        "Gunakan ini saat Claude Code perlu memeriksa screenshot, diagram, referensi, atau input QA visual.",
    },
    {
      title: "Analisis video (video analysis)",
      href: "/capabilities/video-analysis",
      body:
        "Gunakan ini saat bug, masalah produk, atau bukti alur hidup di rekaman, bukan di log teks.",
    },
  ],
  decisionLabel: "Cara memutuskan",
  decisionTitle: "Tanyakan hal ini sebelum mengganti alur kerja yang sudah Anda sukai",
  decisionRows: [
    {
      question: "Kapan Claude Code saja sudah cukup?",
      answer:
        "Claude Code sering cukup saat alur kerja tetap di dalam codebase dan tugas utama adalah reasoning, pengeditan, pengujian, dan eksekusi terminal.",
    },
    {
      question: "Kapan saya butuh lebih dari Claude Code?",
      answer:
        "Anda butuh lebih dari Claude Code saat tugas memerlukan output gambar, output video, interpretasi screenshot, QA visual, analisis rekaman, atau hasil yang harus keluar dari terminal sebagai artefak.",
    },
    {
      question: "Haruskah saya mengganti Claude Code atau memperluasnya?",
      answer:
        "Biasanya perluas. Bagi banyak tim, langkah lebih baik adalah mempertahankan Claude Code dan menambahkan kemampuan yang tidak dibawa default, daripada memperkenalkan permukaan agen baru dan melatih ulang alur kerja.",
    },
    {
      question: "Apa cara tercepat menguji setup yang lebih baik?",
      answer:
        "Mulai dari panduan Add Tools to Claude Code atau langsung ke Claude Code image generation atau video generation. Itu memungkinkan Anda menguji gap kemampuan tanpa mengganti agen inti.",
    },
  ],
  nextMoveLabel: "Langkah berikutnya",
  nextMoveTitle: "Dari panduan pemilihan ini menuju jalur Claude Code yang Anda butuhkan",
  nextMoveCards: [
    {
      title: "Menambahkan tools ke Claude Code",
      href: "/guides/add-tools-to-claude-code",
      body: "Gunakan ini saat Anda siap menguji jalur setup yang lebih pendek daripada membaca penjelasan lain.",
    },
    {
      title: "Mulai dari pembuatan gambar",
      href: "/for/claude-code/image-generation",
      body: "Langkah berikut terbaik saat output pertama yang hilang adalah visual, gambar konsep, atau mockup produk.",
    },
    {
      title: "Mulai dari pembuatan video",
      href: "/for/claude-code/video-generation",
      body: "Langkah berikut terbaik saat output pertama yang hilang adalah klip demo, walkthrough, atau motion asset.",
    },
    {
      title: "Apa AI paling canggih saat ini?",
      href: "/learn/what-is-the-most-advanced-ai",
      body: "Buka di sini saat pertanyaannya tentang frontier secara keseluruhan, bukan khusus Claude Code.",
    },
    {
      title: "Lihat hub Claude Code",
      href: "/for/claude-code",
      body: "Pindah ke sini saat Anda ingin landing page utama Claude Code, bukan panduan pemilihan bergaya Learn.",
    },
  ],
  faqLabel: "FAQ",
  faqTitle: "Pertanyaan di balik kata kunci",
  faqItems: [
    {
      question: "Apa AI terbaik untuk Claude Code saat ini?",
      answer:
        "Jika yang dimaksud pekerjaan coding native-terminal, Claude Code mungkin sudah menjadi fondasi yang tepat. Jika yang dimaksud alur kerja lengkap di sekitar coding, setup terbaik sering kali adalah Claude Code ditambah kemampuan yang masih kurang.",
    },
    {
      question: "Apakah AI terbaik untuk Claude Code selalu model yang berbeda?",
      answer:
        "Tidak selalu. Terkadang keuntungan lebih besar datang dari menambahkan kemampuan media dan visi di sekitar Claude Code, bukan mengganti agen intinya.",
    },
    {
      question: "Apa yang biasanya pecah lebih dulu dalam alur Claude Code?",
      answer:
        "Titik putus pertama biasanya bukan kualitas reasoning. Melainkan saat alur kerja harus memeriksa screenshot, menganalisis rekaman, atau menghasilkan gambar dan video yang tidak disediakan Claude Code sebagai built-in runtime.",
    },
    {
      question: "Apakah AnyCap menggantikan Claude Code?",
      answer:
        "Tidak. AnyCap memperluas Claude Code. Perannya menambahkan image generation, video generation, image understanding, dan video analysis di sekitar agen yang sudah Anda gunakan.",
    },
    {
      question: "Apa cara tercepat mencoba Claude Code ditambah kemampuan?",
      answer:
        "Mulai dari panduan Add Tools to Claude Code, lalu uji satu jalur konkret seperti Claude Code image generation atau Claude Code video generation. Itu memberi pemeriksaan alur nyata tanpa mengganti agen.",
    },
  ],
};

const contentByLocale: Record<SiteLocale, BestAIForClaudeCodePageData> = {
  en,
  "pt-br": ptBr,
  id,
};

export function getBestAIForClaudeCodeMetadata(locale: SiteLocale): Metadata {
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

export function getBestAIForClaudeCodePageData(locale: SiteLocale) {
  return contentByLocale[locale] ?? contentByLocale.en;
}
