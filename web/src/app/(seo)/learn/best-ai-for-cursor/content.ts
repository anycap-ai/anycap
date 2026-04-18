import type { Metadata } from "next";
import { createFaqPageJsonLd, createTechArticleJsonLd } from "@/lib/schema";
import { getLocaleConfig, siteConfig, type SiteLocale } from "@/lib/site";

export const BEST_AI_FOR_CURSOR_PATH = "/learn/best-ai-for-cursor";

type BestAIForCursorPageData = {
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
  modelLabel: string;
  modelTitle: string;
  modelIntro: string;
  modelCards: readonly { title: string; href: string; body: string }[];
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

const en: BestAIForCursorPageData = {
  breadcrumbItems: [
    { name: "Home", href: "/" },
    { name: "Learn", href: "/learn", unlinkable: true },
    { name: "Best AI for Cursor" },
  ],
  eyebrow: "Learn",
  metadata: {
    title: "Best AI for Cursor: the right setup is usually Cursor plus capabilities",
    description:
      "The best AI for Cursor is usually the setup that keeps Cursor's editor-native workflow intact while adding the visual, video, and model-choice layer it lacks.",
    openGraphTitle: "Best AI for Cursor: the right setup is usually Cursor plus capabilities",
    openGraphDescription:
      "A buyer guide for teams deciding whether the best Cursor setup is Cursor alone, Cursor plus scattered provider tabs, or Cursor plus one capability runtime with model choice.",
  },
  articleJsonLd: createTechArticleJsonLd({
    headline: "Best AI for Cursor: the right setup is usually Cursor plus capabilities",
    description:
      "A buyer guide for teams deciding whether the best Cursor setup is Cursor alone, Cursor plus scattered provider tabs, or Cursor plus one capability runtime with model choice.",
    path: BEST_AI_FOR_CURSOR_PATH,
    about: ["Cursor", "Coding agents", "AI capabilities", "Image generation", "Video generation", "Agent capability runtime"],
    keywords: [
      "best ai for cursor",
      "best ai tools for cursor",
      "cursor capabilities",
      "cursor visual workflow",
      "cursor mockup generation",
    ],
    datePublished: lastUpdatedIso,
    dateModified: lastUpdatedIso,
  }),
  faqJsonLd: createFaqPageJsonLd([
    {
      question: "What is the best AI for Cursor right now?",
      answer:
        "If you mean core coding work, Cursor may already be the right foundation for your team. If you mean the full workflow around coding, the best setup is often Cursor plus the capabilities and model options it still lacks.",
    },
    {
      question: "Is the best AI for Cursor always a different model?",
      answer:
        "Not always. Sometimes the bigger gain comes from adding media and vision capabilities around Cursor rather than changing the core coding environment itself.",
    },
    {
      question: "What usually breaks first around Cursor?",
      answer:
        "The first breakpoint is usually visual product work: mockups, launch visuals, screenshot debugging, demos, or recording analysis. Those are the tasks that pull the workflow beyond what Cursor provides by itself.",
    },
    {
      question: "Does AnyCap replace Cursor?",
      answer:
        "No. AnyCap extends Cursor. Its role is to add image generation, video generation, image understanding, and video analysis around the coding environment you already use.",
    },
  ]),
  lastUpdatedLabel: "April 7, 2026",
  heroTitle: ["Best AI for", "Cursor"],
  heroIntro:
    "The best AI for Cursor is usually not a question about leaving Cursor. It is a question about whether the editor-native workflow is still enough or whether the work has become visual, shareable, and model-sensitive in ways that require a capability layer around the editor.",
  quickAnswerLabel: "Quick answer",
  quickAnswerTitle: "The best Cursor setup usually keeps Cursor as the editor-native core and adds the missing visual layer around it.",
  quickAnswerBody:
    "This keeps the coding loop intact while expanding what the workflow can actually finish. For many teams, that is more useful than changing the core environment just because the task briefly leaves the editor and becomes visual or multimodal.",
  quickTakeawaysLabel: "Key points",
  quickTakeaways: [
    "Cursor is already strong when the work stays inside the edit-run-review loop.",
    "The first breakpoint usually shows up in visual product work: mockups, screenshots, demos, and recordings.",
    "For Cursor users, the next decision is often which capability or model to add, not which new agent to adopt.",
  ],
  evaluationLabel: "What to evaluate",
  evaluationTitle: "Start by asking how much of the work still fits the editor loop",
  evaluationCards: [
    {
      title: "How much of the work stays in the editor",
      body:
        "When the job is mostly code navigation, edits, diffs, debugging, and local execution, the main question is whether Cursor already gives your team the right coding loop. Often it does.",
    },
    {
      title: "How visual the workflow has become",
      body:
        "The answer changes when the work needs product mockups, launch visuals, demo clips, screenshot inspection, or recording analysis. At that point, the best AI for Cursor is not only a coding-model question.",
    },
    {
      title: "How often the output becomes a shareable artifact",
      body:
        "A stack that only edits code is not enough when the result must turn into an artifact a teammate or stakeholder can review, share, or publish.",
    },
    {
      title: "How much model choice and tooling control matters",
      body:
        "The best practical setup is often the one that avoids provider sprawl while still giving you the right image and video model for the task. Separate services can turn into integration debt around Cursor surprisingly fast.",
    },
  ],
  stackLabel: "Three setup patterns",
  stackTitle: "Most teams evaluating Cursor are really choosing how far the editor loop can stretch",
  stackCards: [
    {
      title: "Cursor only",
      label: "Best when code and local execution are the job",
      body:
        "This is the simplest path when the workflow stays inside repository work, local execution, and code iteration. The value comes from the coding environment itself, not from external media or analysis tasks.",
    },
    {
      title: "Cursor plus scattered provider tabs",
      label: "Works, but the workflow leaves the editor",
      body:
        "You can wire image, video, and analysis providers separately, but each added task increases credential sprawl, prompt drift, and maintenance around the editor workflow.",
    },
    {
      title: "Cursor plus a capability runtime",
      label: "Best when the workflow becomes visual or multimedia",
      body:
        "This is where AnyCap fits. You keep Cursor for code, editing, and integrated-terminal workflows, then add image generation, video generation, image understanding, and video analysis through one runtime.",
    },
  ],
  capabilityLabel: "First workflows to add",
  capabilityTitle: "These are usually the first visual workflows that appear around Cursor",
  capabilityCards: [
    {
      title: "Launch visuals and mockups",
      href: "/capabilities/image-generation",
      body:
        "Use this path when Cursor needs polished product visuals, landing-page concepts, or mockups instead of only describing what a designer should make.",
    },
    {
      title: "Demo clips and walkthroughs",
      href: "/capabilities/video-generation",
      body:
        "Use this path when the workflow needs demos, walkthroughs, or short motion assets from the same editor-centered process.",
    },
    {
      title: "Screenshot debugging and visual QA",
      href: "/capabilities/image-understanding",
      body:
        "Use this when Cursor needs to interpret screenshots, diagrams, OCR inputs, or visual QA evidence inside the same debugging loop.",
    },
    {
      title: "Recording review and issue analysis",
      href: "/capabilities/video-analysis",
      body:
        "Use this when the bug, usability issue, or workflow evidence lives in a recording rather than a text log.",
    },
  ],
  modelLabel: "Model choices",
  modelTitle: "If you are keeping Cursor, the next question is often which model fits the workflow",
  modelIntro:
    "Cursor users often hit a second decision after adding capabilities: which image or video model actually fits the work. That is a different problem from choosing the editor itself.",
  modelCards: [
    {
      title: "Seedream 5",
      href: "/models/seedream-5",
      body: "Best first-pass image model when Cursor needs polished mockups, launch visuals, or cleaner visual concepts.",
    },
    {
      title: "Nano Banana 2",
      href: "/models/nano-banana-2",
      body: "Best when Cursor needs faster iteration across many visual variants and lighter-weight creative loops.",
    },
    {
      title: "Veo 3.1",
      href: "/models/veo-3-1",
      body: "Best premium video model for Cursor when the workflow needs polished demo clips or cinematic motion output.",
    },
    {
      title: "Kling 3.0",
      href: "/models/kling-3-0",
      body: "Best when the motion needs to feel more stylized or cinematic than a standard product walkthrough.",
    },
  ],
  decisionLabel: "How to decide",
  decisionTitle: "Ask these questions before rebuilding a workflow Cursor already handles well",
  decisionRows: [
    {
      question: "When is Cursor already enough on its own?",
      answer:
        "Cursor is often enough when the workflow stays centered on code, terminal execution, and local repo reasoning. In that case, the main value is inside the editor and coding loop.",
    },
    {
      question: "When should I add capabilities instead of switching environments?",
      answer:
        "Add capabilities when the work needs image output, video output, screenshot interpretation, visual QA, or recording analysis. Those are capability-layer problems, not reasons to abandon the editor loop entirely.",
    },
    {
      question: "When does model choice inside the capability layer matter?",
      answer:
        "Model choice matters once the workflow becomes visual. At that point, you may want one image model for polished mockups, another for fast iteration, and a separate video model for demos or walkthroughs.",
    },
    {
      question: "Should I replace Cursor to solve that gap?",
      answer:
        "Usually not. For many teams, the better move is to keep Cursor and add the capabilities it does not ship with instead of introducing a new agent surface and retraining the workflow.",
    },
  ],
  nextMoveLabel: "Best next moves",
  nextMoveTitle: "Move from this buyer guide into the most relevant Cursor workflow or model page",
  nextMoveCards: [
    {
      title: "See the Cursor hub",
      href: "/for/cursor",
      body: "Move here when you want the primary Cursor landing page instead of a Learn-style evaluation guide.",
    },
    {
      title: "Start with screenshot understanding",
      href: "/capabilities/image-understanding",
      body: "Best next move when the first broken workflow is screenshot debugging, visual QA, or design feedback.",
    },
    {
      title: "Compare image models",
      href: "/models/seedream-5",
      body: "Best next move when the real question is which image model fits Cursor mockups and launch visuals.",
    },
    {
      title: "Compare video models",
      href: "/models/veo-3-1",
      body: "Best next move when the real question is which video model fits demos, walkthroughs, or cinematic product motion.",
    },
    {
      title: "What is the most advanced AI?",
      href: "/learn/what-is-the-most-advanced-ai",
      body: "Go here when the question is about the frontier overall, not just Cursor specifically.",
    },
    {
      title: "Install the runtime",
      href: "/guides/install-anycap",
      body: "Use the install guide when you are ready to move from evaluation into actual setup steps.",
    },
  ],
  faqLabel: "FAQ",
  faqTitle: "Questions behind the keyword",
  faqItems: [
    {
      question: "What is the best AI for Cursor right now?",
      answer:
        "If you mean core coding work, Cursor may already be the right foundation for your team. If you mean the full workflow around coding, the best setup is often Cursor plus the capabilities and model options it still lacks.",
    },
    {
      question: "Is the best AI for Cursor always a different model?",
      answer:
        "Not always. Sometimes the bigger gain comes from adding media and vision capabilities around Cursor rather than changing the core coding environment itself.",
    },
    {
      question: "What usually breaks first around Cursor?",
      answer:
        "The first breakpoint is usually visual product work: mockups, launch visuals, screenshot debugging, demos, or recording analysis. Those are the tasks that pull the workflow beyond what Cursor provides by itself.",
    },
    {
      question: "Which model should I add first for Cursor?",
      answer:
        "If the work starts with polished visuals, start with Seedream 5. If you need faster visual iteration, start with Nano Banana 2. If the work starts with product demos or motion, look at Veo 3.1 or Kling 3.0 first.",
    },
    {
      question: "Does AnyCap replace Cursor?",
      answer:
        "No. AnyCap extends Cursor. Its role is to add image generation, video generation, image understanding, and video analysis around the coding environment you already use.",
    },
  ],
};

const ptBr: BestAIForCursorPageData = {
  breadcrumbItems: [
    { name: "Início", href: "/" },
    { name: "Aprender", href: "/learn", unlinkable: true },
    { name: "Melhor IA para Cursor" },
  ],
  eyebrow: "Aprender",
  metadata: {
    title: "Melhor IA para Cursor: a configuração certa normalmente é Cursor + capacidades",
    description:
      "A melhor IA para Cursor normalmente é a configuração que mantém o fluxo nativo de edição do Cursor intacto, enquanto adiciona a camada visual, de vídeo e de escolha de modelos que ele não traz.",
    openGraphTitle: "Melhor IA para Cursor: a configuração certa normalmente é Cursor + capacidades",
    openGraphDescription:
      "Um guia de compra para times decidindo se a melhor configuração de Cursor é só o Cursor, o Cursor com abas de provedores avulsos ou o Cursor com um runtime de capacidades e escolha de modelos.",
  },
  articleJsonLd: createTechArticleJsonLd({
    headline: "Melhor IA para Cursor: a configuração certa normalmente é Cursor + capacidades",
    description:
      "Um guia de compra para times decidindo se a melhor configuração de Cursor é só o Cursor, o Cursor com abas de provedores avulsos ou o Cursor com um runtime de capacidades e escolha de modelos.",
    path: BEST_AI_FOR_CURSOR_PATH,
    about: ["Cursor", "agentes de código", "capacidades de IA", "geração de imagem", "geração de vídeo", "runtime de capacidades"],
    keywords: [
      "melhor ia para cursor",
      "ferramentas para cursor",
      "capacidades do cursor",
      "fluxo visual do cursor",
      "geração de mockups no cursor",
    ],
    datePublished: lastUpdatedIso,
    dateModified: lastUpdatedIso,
  }),
  faqJsonLd: createFaqPageJsonLd([
    {
      question: "Qual é a melhor IA para Cursor agora?",
      answer:
        "Se você quer dizer trabalho de código principal, o Cursor talvez já seja a base certa para o time. Se você quer dizer o fluxo completo ao redor do código, a melhor configuração costuma ser Cursor mais as capacidades e opções de modelo que ele ainda não tem.",
    },
    {
      question: "A melhor IA para Cursor é sempre outro modelo?",
      answer:
        "Não necessariamente. Às vezes o ganho maior vem de adicionar capacidades de mídia e visão ao redor do Cursor, em vez de trocar o ambiente de edição central.",
    },
    {
      question: "O que costuma quebrar primeiro ao redor do Cursor?",
      answer:
        "O primeiro ponto de ruptura geralmente é o trabalho visual de produto: mockups, visuais de lançamento, debug de capturas de tela, demos ou análise de gravações. São essas tarefas que empurram o fluxo além do que o Cursor entrega sozinho.",
    },
    {
      question: "Qual modelo devo adicionar primeiro para Cursor?",
      answer:
        "Se o trabalho começa com visuais polidos, comece com Seedream 5. Se você precisa iterar mais rápido em visuais, comece com Nano Banana 2. Se o trabalho começa com demos ou motion de produto, olhe primeiro para Veo 3.1 ou Kling 3.0.",
    },
    {
      question: "O AnyCap substitui o Cursor?",
      answer:
        "Não. O AnyCap estende o Cursor. O papel dele é adicionar geração de imagem, geração de vídeo, entendimento de imagem e análise de vídeo ao redor do ambiente de código que você já usa.",
    },
  ]),
  lastUpdatedLabel: "7 de abril de 2026",
  heroTitle: ["Melhor IA para", "Cursor"],
  heroIntro:
    "A melhor IA para Cursor normalmente não é uma pergunta sobre sair do Cursor. É uma pergunta sobre se o fluxo nativo do editor ainda basta ou se o trabalho virou visual, compartilhável e sensível a modelos de um jeito que pede uma camada de capacidades ao redor do editor.",
  quickAnswerLabel: "Resposta rápida",
  quickAnswerTitle: "A melhor configuração de Cursor normalmente mantém o Cursor como núcleo nativo do editor e adiciona a camada visual que está faltando ao redor dele.",
  quickAnswerBody:
    "Isso mantém o loop de código intacto enquanto amplia o que o fluxo realmente consegue entregar. Para muitos times, isso é mais útil do que trocar o ambiente central só porque a tarefa saiu brevemente do editor e ficou visual ou multimodal.",
  quickTakeawaysLabel: "Pontos principais",
  quickTakeaways: [
    "O Cursor já é forte quando o trabalho fica dentro do loop editar-executar-revisar.",
    "O primeiro ponto de ruptura normalmente aparece no trabalho visual de produto: mockups, capturas, demos e gravações.",
    "Para usuários de Cursor, a próxima decisão costuma ser qual capacidade ou modelo adicionar, não qual novo agente adotar.",
  ],
  evaluationLabel: "O que avaliar",
  evaluationTitle: "Comece perguntando quanto do trabalho ainda cabe no loop do editor",
  evaluationCards: [
    {
      title: "Quanto do trabalho fica no editor",
      body:
        "Quando a tarefa é principalmente navegação de código, edições, diffs, debug e execução local, a pergunta principal é se o Cursor já oferece o loop de código certo para o time. Muitas vezes oferece.",
    },
    {
      title: "Quão visual o fluxo se tornou",
      body:
        "A resposta muda quando o trabalho precisa de mockups de produto, visuais de lançamento, clipes de demonstração, inspeção de capturas ou análise de gravações. Nesse ponto, a melhor IA para Cursor já não é só uma questão de modelo de código.",
    },
    {
      title: "Com que frequência a saída vira um artefato compartilhável",
      body:
        "Uma stack que só edita código não é suficiente quando o resultado precisa virar um artefato que um colega ou stakeholder possa revisar, compartilhar ou publicar.",
    },
    {
      title: "Quanto importam escolha de modelo e controle de ferramentas",
      body:
        "A melhor configuração prática costuma ser aquela que evita sprawl de provedores e ainda assim entrega o modelo de imagem e vídeo certo para a tarefa. Serviços separados podem virar dívida de integração ao redor do Cursor bem rápido.",
    },
  ],
  stackLabel: "Três padrões de configuração",
  stackTitle: "A maioria dos times avaliando Cursor está, na prática, decidindo até onde o loop do editor consegue se esticar",
  stackCards: [
    {
      title: "Só Cursor",
      label: "Melhor quando código e execução local são o trabalho",
      body:
        "Esse é o caminho mais simples quando o fluxo fica dentro de trabalho de repositório, execução local e iteração de código. O valor vem do ambiente de código em si, não de tarefas externas de mídia ou análise.",
    },
    {
      title: "Cursor com abas avulsas de provedores",
      label: "Funciona, mas o fluxo sai do editor",
      body:
        "Você pode conectar provedores de imagem, vídeo e análise separadamente, mas cada tarefa adicionada aumenta o sprawl de credenciais, o drift de prompts e a manutenção em torno do fluxo do editor.",
    },
    {
      title: "Cursor com um runtime de capacidades",
      label: "Melhor quando o fluxo fica visual ou multimídia",
      body:
        "É aqui que o AnyCap entra. Você mantém o Cursor para código, edição e fluxos com terminal integrado, e adiciona geração de imagem, geração de vídeo, entendimento de imagem e análise de vídeo por um único runtime.",
    },
  ],
  capabilityLabel: "Primeiros fluxos para adicionar",
  capabilityTitle: "Esses costumam ser os primeiros fluxos visuais que aparecem ao redor do Cursor",
  capabilityCards: [
    {
      title: "Visuais de lançamento e mockups",
      href: "/capabilities/image-generation",
      body:
        "Use este caminho quando o Cursor precisar de visuais de produto refinados, conceitos de landing page ou mockups em vez de apenas descrever o que um designer deveria fazer.",
    },
    {
      title: "Clipes de demo e walkthroughs",
      href: "/capabilities/video-generation",
      body:
        "Use este caminho quando o fluxo precisar de demos, walkthroughs ou motion assets curtos a partir do mesmo processo centrado no editor.",
    },
    {
      title: "Debug de capturas e QA visual",
      href: "/capabilities/image-understanding",
      body:
        "Use isto quando o Cursor precisar interpretar capturas de tela, diagramas, OCR ou evidências de QA visual dentro do mesmo loop de debug.",
    },
    {
      title: "Revisão de gravações e análise de issues",
      href: "/capabilities/video-analysis",
      body:
        "Use isto quando o bug, problema de usabilidade ou evidência do fluxo viver em uma gravação em vez de um log de texto.",
    },
  ],
  modelLabel: "Escolhas de modelo",
  modelTitle: "Se você vai manter o Cursor, a próxima pergunta costuma ser qual modelo se encaixa no fluxo",
  modelIntro:
    "Usuários de Cursor costumam bater numa segunda decisão depois de adicionar capacidades: qual modelo de imagem ou vídeo realmente encaixa no trabalho. Isso é um problema diferente de escolher o editor.",
  modelCards: [
    {
      title: "Seedream 5",
      href: "/models/seedream-5",
      body: "Melhor modelo de imagem para o primeiro rascunho quando o Cursor precisa de mockups refinados, visuais de lançamento ou conceitos visuais mais limpos.",
    },
    {
      title: "Nano Banana 2",
      href: "/models/nano-banana-2",
      body: "Melhor quando o Cursor precisa iterar mais rápido em muitos variantes visuais e em loops criativos mais leves.",
    },
    {
      title: "Veo 3.1",
      href: "/models/veo-3-1",
      body: "Melhor modelo premium de vídeo para Cursor quando o fluxo precisa de clipes demo refinados ou motion cinematográfico.",
    },
    {
      title: "Kling 3.0",
      href: "/models/kling-3-0",
      body: "Melhor quando o movimento precisa parecer mais estilizado ou cinematográfico do que um walkthrough de produto padrão.",
    },
  ],
  decisionLabel: "Como decidir",
  decisionTitle: "Faça estas perguntas antes de reconstruir um fluxo que o Cursor já atende bem",
  decisionRows: [
    {
      question: "Quando o Cursor já é suficiente sozinho?",
      answer:
        "O Cursor costuma ser suficiente quando o fluxo fica centrado em código, execução de terminal e raciocínio local no repositório. Nesse caso, o valor principal está dentro do editor e do loop de código.",
    },
    {
      question: "Quando devo adicionar capacidades em vez de trocar de ambiente?",
      answer:
        "Adicione capacidades quando o trabalho precisa de saída de imagem, saída de vídeo, interpretação de capturas, QA visual ou análise de gravações. São problemas de camada de capacidade, não motivos para abandonar o loop do editor.",
    },
    {
      question: "Quando a escolha de modelo dentro da camada de capacidades importa?",
      answer:
        "A escolha de modelo importa quando o fluxo fica visual. Nesse ponto, você pode querer um modelo de imagem para mockups polidos, outro para iteração rápida e um modelo de vídeo separado para demos ou walkthroughs.",
    },
    {
      question: "Devo substituir o Cursor para resolver essa lacuna?",
      answer:
        "Normalmente não. Para muitos times, a melhor decisão é manter o Cursor e adicionar as capacidades que ele não traz, em vez de introduzir uma nova superfície de agente e reaprender o fluxo.",
    },
  ],
  nextMoveLabel: "Próximos melhores passos",
  nextMoveTitle: "Passe deste guia de compra para a página de workflow ou modelo mais relevante do Cursor",
  nextMoveCards: [
    {
      title: "Ver o hub do Cursor",
      href: "/for/cursor",
      body: "Vá aqui quando quiser a landing page principal do Cursor em vez de um guia de avaliação no estilo Learn.",
    },
    {
      title: "Começar com entendimento de captura",
      href: "/capabilities/image-understanding",
      body: "Próximo passo ideal quando o primeiro fluxo quebrado é debug de capturas, QA visual ou feedback de design.",
    },
    {
      title: "Comparar modelos de imagem",
      href: "/models/seedream-5",
      body: "Próximo passo ideal quando a pergunta real é qual modelo de imagem se encaixa em mockups e visuais de lançamento.",
    },
    {
      title: "Comparar modelos de vídeo",
      href: "/models/veo-3-1",
      body: "Próximo passo ideal quando a pergunta real é qual modelo de vídeo se encaixa em demos, walkthroughs ou motion de produto.",
    },
    {
      title: "Qual é a IA mais avançada?",
      href: "/learn/what-is-the-most-advanced-ai",
      body: "Vá aqui quando a pergunta for sobre a fronteira no geral, e não apenas sobre o Cursor.",
    },
    {
      title: "Instalar o runtime",
      href: "/guides/install-anycap",
      body: "Use o guia de instalação quando estiver pronto para sair da avaliação e entrar nos passos reais de setup.",
    },
  ],
  faqLabel: "FAQ",
  faqTitle: "Perguntas por trás da busca",
  faqItems: [
    {
      question: "Qual é a melhor IA para Cursor agora?",
      answer:
        "Se você quer dizer trabalho de código principal, o Cursor talvez já seja a base certa para o time. Se você quer dizer o fluxo completo ao redor do código, a melhor configuração costuma ser Cursor mais as capacidades e opções de modelo que ele ainda não tem.",
    },
    {
      question: "A melhor IA para Cursor é sempre outro modelo?",
      answer:
        "Não necessariamente. Às vezes o ganho maior vem de adicionar capacidades de mídia e visão ao redor do Cursor, em vez de trocar o ambiente de edição central.",
    },
    {
      question: "O que costuma quebrar primeiro ao redor do Cursor?",
      answer:
        "O primeiro ponto de ruptura geralmente é o trabalho visual de produto: mockups, visuais de lançamento, debug de capturas de tela, demos ou análise de gravações. São essas tarefas que empurram o fluxo além do que o Cursor entrega sozinho.",
    },
    {
      question: "Qual modelo devo adicionar primeiro para Cursor?",
      answer:
        "Se o trabalho começa com visuais polidos, comece com Seedream 5. Se você precisa iterar mais rápido em visuais, comece com Nano Banana 2. Se o trabalho começa com demos ou motion de produto, olhe primeiro para Veo 3.1 ou Kling 3.0.",
    },
    {
      question: "O AnyCap substitui o Cursor?",
      answer:
        "Não. O AnyCap estende o Cursor. O papel dele é adicionar geração de imagem, geração de vídeo, entendimento de imagem e análise de vídeo ao redor do ambiente de código que você já usa.",
    },
  ],
};

const id: BestAIForCursorPageData = {
  breadcrumbItems: [
    { name: "Beranda", href: "/" },
    { name: "Belajar", href: "/learn", unlinkable: true },
    { name: "AI terbaik untuk Cursor" },
  ],
  eyebrow: "Belajar",
  metadata: {
    title: "AI terbaik untuk Cursor: pengaturan yang tepat biasanya Cursor ditambah kemampuan",
    description:
      "AI terbaik untuk Cursor biasanya adalah pengaturan yang menjaga alur kerja asli editor Cursor tetap utuh sambil menambahkan lapisan visual, video, dan pilihan model yang belum dimilikinya.",
    openGraphTitle: "AI terbaik untuk Cursor: pengaturan yang tepat biasanya Cursor ditambah kemampuan",
    openGraphDescription:
      "Panduan pembelian bagi tim yang memutuskan apakah pengaturan Cursor terbaik adalah Cursor saja, Cursor ditambah tab penyedia terpisah, atau Cursor ditambah satu runtime kemampuan dengan pilihan model.",
  },
  articleJsonLd: createTechArticleJsonLd({
    headline: "AI terbaik untuk Cursor: pengaturan yang tepat biasanya Cursor ditambah kemampuan",
    description:
      "Panduan pembelian bagi tim yang memutuskan apakah pengaturan Cursor terbaik adalah Cursor saja, Cursor ditambah tab penyedia terpisah, atau Cursor ditambah satu runtime kemampuan dengan pilihan model.",
    path: BEST_AI_FOR_CURSOR_PATH,
    about: ["Cursor", "Agen pengkodean", "Kemampuan AI", "Generasi gambar", "Generasi video", "Runtime kemampuan agen"],
    keywords: [
      "ai terbaik untuk cursor",
      "alat ai terbaik untuk cursor",
      "kemampuan cursor",
      "alur kerja visual cursor",
      "generasi mockup cursor",
    ],
    datePublished: lastUpdatedIso,
    dateModified: lastUpdatedIso,
  }),
  faqJsonLd: createFaqPageJsonLd([
    {
      question: "Apa AI terbaik untuk Cursor saat ini?",
      answer:
        "Jika yang dimaksud pekerjaan pengkodean inti, Cursor mungkin sudah menjadi fondasi yang tepat untuk tim Anda. Jika yang dimaksud alur kerja lengkap di sekitar pengkodean, pengaturan terbaik seringkali Cursor ditambah kemampuan dan opsi model yang masih kurang.",
    },
    {
      question: "Apakah AI terbaik untuk Cursor selalu model yang berbeda?",
      answer:
        "Tidak selalu. Terkadang keuntungan lebih besar datang dari menambahkan kemampuan media dan visi di sekitar Cursor daripada mengganti lingkungan pengkodean inti itu sendiri.",
    },
    {
      question: "Apa yang biasanya patah lebih dulu di sekitar Cursor?",
      answer:
        "Titik patahan pertama biasanya pekerjaan produk visual: mockup, visual peluncuran, debugging tangkapan layar, demo, atau analisis rekaman. Itulah tugas yang menarik alur kerja melampaui apa yang Cursor berikan sendiri.",
    },
    {
      question: "Apakah AnyCap menggantikan Cursor?",
      answer:
        "Tidak. AnyCap memperluas Cursor. Perannya adalah menambahkan generasi gambar, generasi video, pemahaman gambar, dan analisis video di sekitar lingkungan pengkodean yang sudah Anda gunakan.",
    },
  ]),
  lastUpdatedLabel: "7 April 2026",
  heroTitle: ["AI terbaik untuk", "Cursor"],
  heroIntro:
    "AI terbaik untuk Cursor biasanya bukan pertanyaan tentang meninggalkan Cursor. Ini pertanyaan apakah alur kerja asli editor masih cukup atau pekerjaan telah menjadi visual, dapat dibagikan, dan sensitif terhadap model dengan cara yang memerlukan lapisan kemampuan di sekitar editor.",
  quickAnswerLabel: "Jawaban singkat",
  quickAnswerTitle:
    "Pengaturan Cursor terbaik biasanya mempertahankan Cursor sebagai inti asli editor dan menambahkan lapisan visual yang hilang di sekitarnya.",
  quickAnswerBody:
    "Ini menjaga siklus pengkodean tetap utuh sambil memperluas apa yang benar-benar dapat diselesaikan alur kerja. Bagi banyak tim, itu lebih berguna daripada mengganti lingkungan inti hanya karena tugas sebentar keluar dari editor dan menjadi visual atau multimodal.",
  quickTakeawaysLabel: "Poin utama",
  quickTakeaways: [
    "Cursor sudah kuat ketika pekerjaan tetap dalam siklus edit-jalankan-tinjau.",
    "Titik patahan pertama biasanya muncul pada pekerjaan produk visual: mockup, tangkapan layar, demo, dan rekaman.",
    "Bagi pengguna Cursor, keputusan berikutnya sering model atau kemampuan mana yang ditambahkan, bukan agen baru mana yang diadopsi.",
  ],
  evaluationLabel: "Yang perlu dievaluasi",
  evaluationTitle: "Mulai dengan bertanya seberapa besar pekerjaan yang masih cocok dengan siklus editor",
  evaluationCards: [
    {
      title: "Seberapa besar pekerjaan yang tetap di editor",
      body:
        "Ketika tugas utamanya navigasi kode, pengeditan, diff, debugging, dan eksekusi lokal, pertanyaan utamanya adalah apakah Cursor sudah memberi tim Anda siklus pengkodean yang tepat. Seringkali sudah.",
    },
    {
      title: "Seberapa visual alur kerja menjadi",
      body:
        "Jawabannya berubah ketika pekerjaan memerlukan mockup produk, visual peluncuran, klip demo, inspeksi tangkapan layar, atau analisis rekaman. Pada titik itu, AI terbaik untuk Cursor bukan hanya pertanyaan model pengkodean.",
    },
    {
      title: "Seberapa sering keluaran menjadi artefak yang dapat dibagikan",
      body:
        "Stack yang hanya mengedit kode tidak cukup ketika hasil harus menjadi artefak yang dapat ditinjau, dibagikan, atau dipublikasikan oleh rekan kerja atau pemangku kepentingan.",
    },
    {
      title: "Seberapa penting pilihan model dan kontrol peralatan",
      body:
        "Pengaturan praktis terbaik seringkali yang menghindari penyebaran penyedia sambil tetap memberi model gambar dan video yang tepat untuk tugas. Layanan terpisah dapat dengan cepat menjadi utang integrasi di sekitar Cursor.",
    },
  ],
  stackLabel: "Tiga pola pengaturan",
  stackTitle: "Sebagian besar tim yang mengevaluasi Cursor sebenarnya memilih seberapa jauh siklus editor dapat diregangkan",
  stackCards: [
    {
      title: "Hanya Cursor",
      label: "Terbaik ketika kode dan eksekusi lokal adalah tugasnya",
      body:
        "Ini jalur paling sederhana ketika alur kerja tetap di dalam pekerjaan repositori, eksekusi lokal, dan iterasi kode. Nilainya datang dari lingkungan pengkodean itu sendiri, bukan dari tugas media atau analisis eksternal.",
    },
    {
      title: "Cursor ditambah tab penyedia terpisah",
      label: "Berfungsi, tetapi alur kerja keluar dari editor",
      body:
        "Anda dapat menghubungkan penyedia gambar, video, dan analisis secara terpisah, tetapi setiap tugas tambahan meningkatkan penyebaran kredensial, drift prompt, dan pemeliharaan di sekitar alur kerja editor.",
    },
    {
      title: "Cursor ditambah runtime kemampuan",
      label: "Terbaik ketika alur kerja menjadi visual atau multimedia",
      body:
        "Di sinilah AnyCap cocok. Anda mempertahankan Cursor untuk kode, pengeditan, dan alur kerja terminal terintegrasi, lalu menambahkan generasi gambar, generasi video, pemahaman gambar, dan analisis video melalui satu runtime.",
    },
  ],
  capabilityLabel: "Alur kerja pertama untuk ditambahkan",
  capabilityTitle: "Ini biasanya alur kerja visual pertama yang muncul di sekitar Cursor",
  capabilityCards: [
    {
      title: "Visual peluncuran dan mockup",
      href: "/capabilities/image-generation",
      body:
        "Gunakan jalur ini ketika Cursor memerlukan visual produk yang halus, konsep halaman arahan, atau mockup alih-alih hanya menjelaskan apa yang harus dibuat desainer.",
    },
    {
      title: "Klip demo dan walkthrough",
      href: "/capabilities/video-generation",
      body:
        "Gunakan jalur ini ketika alur kerja memerlukan demo, walkthrough, atau aset gerak pendek dari proses yang sama yang berpusat pada editor.",
    },
    {
      title: "Debugging tangkapan layar dan QA visual",
      href: "/capabilities/image-understanding",
      body:
        "Gunakan ini ketika Cursor perlu menafsirkan tangkapan layar, diagram, masukan OCR, atau bukti QA visual dalam siklus debugging yang sama.",
    },
    {
      title: "Tinjauan rekaman dan analisis isu",
      href: "/capabilities/video-analysis",
      body:
        "Gunakan ini ketika bug, isu kegunaan, atau bukti alur kerja ada dalam rekaman alih-alih log teks.",
    },
  ],
  modelLabel: "Pilihan model",
  modelTitle: "Jika Anda mempertahankan Cursor, pertanyaan berikutnya sering model mana yang cocok dengan alur kerja",
  modelIntro:
    "Pengguna Cursor sering menghadapi keputusan kedua setelah menambahkan kemampuan: model gambar atau video mana yang benar-benar cocok dengan pekerjaan. Itu masalah berbeda dari memilih editor itu sendiri.",
  modelCards: [
    {
      title: "Seedream 5",
      href: "/models/seedream-5",
      body: "Model gambar babak pertama terbaik ketika Cursor memerlukan mockup halus, visual peluncuran, atau konsep visual yang lebih bersih.",
    },
    {
      title: "Nano Banana 2",
      href: "/models/nano-banana-2",
      body: "Terbaik ketika Cursor memerlukan iterasi lebih cepat di banyak varian visual dan siklus kreatif yang lebih ringan.",
    },
    {
      title: "Veo 3.1",
      href: "/models/veo-3-1",
      body: "Model video premium terbaik untuk Cursor ketika alur kerja memerlukan klip demo halus atau keluaran gerak sinematik.",
    },
    {
      title: "Kling 3.0",
      href: "/models/kling-3-0",
      body: "Terbaik ketika gerak perlu terasa lebih bergaya atau sinematik daripada walkthrough produk standar.",
    },
  ],
  decisionLabel: "Cara memutuskan",
  decisionTitle: "Tanyakan hal ini sebelum membangun ulang alur kerja yang sudah ditangani Cursor dengan baik",
  decisionRows: [
    {
      question: "Kapan Cursor saja sudah cukup?",
      answer:
        "Cursor sering cukup ketika alur kerja berpusat pada kode, eksekusi terminal, dan penalaran repositori lokal. Dalam kasus itu, nilai utama ada di dalam editor dan siklus pengkodean.",
    },
    {
      question: "Kapan saya harus menambahkan kemampuan alih-alih mengganti lingkungan?",
      answer:
        "Tambahkan kemampuan ketika pekerjaan memerlukan keluaran gambar, keluaran video, interpretasi tangkapan layar, QA visual, atau analisis rekaman. Itu masalah lapisan kemampuan, bukan alasan untuk meninggalkan siklus editor sepenuhnya.",
    },
    {
      question: "Kapan pilihan model di dalam lapisan kemampuan penting?",
      answer:
        "Pilihan model penting setelah alur kerja menjadi visual. Pada titik itu, Anda mungkin menginginkan satu model gambar untuk mockup halus, lainnya untuk iterasi cepat, dan model video terpisah untuk demo atau walkthrough.",
    },
    {
      question: "Haruskah saya mengganti Cursor untuk menutup celah itu?",
      answer:
        "Biasanya tidak. Bagi banyak tim, langkah yang lebih baik adalah mempertahankan Cursor dan menambahkan kemampuan yang tidak disertakan alih-alih memperkenalkan permukaan agen baru dan melatih ulang alur kerja.",
    },
  ],
  nextMoveLabel: "Langkah berikutnya",
  nextMoveTitle: "Lanjutkan dari panduan pembelian ini ke halaman alur kerja atau model Cursor yang paling relevan",
  nextMoveCards: [
    {
      title: "Lihat pusat Cursor",
      href: "/for/cursor",
      body: "Pergi ke sini ketika Anda ingin halaman utama Cursor alih-alih panduan evaluasi gaya Belajar.",
    },
    {
      title: "Mulai dengan pemahaman tangkapan layar",
      href: "/capabilities/image-understanding",
      body: "Langkah berikut terbaik ketika alur kerja pertama yang patah adalah debugging tangkapan layar, QA visual, atau umpan balik desain.",
    },
    {
      title: "Bandingkan model gambar",
      href: "/models/seedream-5",
      body: "Langkah berikut terbaik ketika pertanyaan sebenarnya adalah model gambar mana yang cocok untuk mockup dan visual peluncuran Cursor.",
    },
    {
      title: "Bandingkan model video",
      href: "/models/veo-3-1",
      body: "Langkah berikut terbaik ketika pertanyaan sebenarnya adalah model video mana yang cocok untuk demo, walkthrough, atau gerak produk sinematik.",
    },
    {
      title: "Apa AI paling canggih?",
      href: "/learn/what-is-the-most-advanced-ai",
      body: "Pergi ke sini ketika pertanyaannya tentang frontier secara keseluruhan, bukan hanya Cursor secara khusus.",
    },
    {
      title: "Pasang runtime",
      href: "/guides/install-anycap",
      body: "Gunakan panduan instalasi ketika Anda siap beralih dari evaluasi ke langkah pengaturan nyata.",
    },
  ],
  faqLabel: "FAQ",
  faqTitle: "Pertanyaan di balik kata kunci",
  faqItems: [
    {
      question: "Apa AI terbaik untuk Cursor saat ini?",
      answer:
        "Jika yang dimaksud pekerjaan pengkodean inti, Cursor mungkin sudah menjadi fondasi yang tepat untuk tim Anda. Jika yang dimaksud alur kerja lengkap di sekitar pengkodean, pengaturan terbaik seringkali Cursor ditambah kemampuan dan opsi model yang masih kurang.",
    },
    {
      question: "Apakah AI terbaik untuk Cursor selalu model yang berbeda?",
      answer:
        "Tidak selalu. Terkadang keuntungan lebih besar datang dari menambahkan kemampuan media dan visi di sekitar Cursor daripada mengganti lingkungan pengkodean inti itu sendiri.",
    },
    {
      question: "Apa yang biasanya patah lebih dulu di sekitar Cursor?",
      answer:
        "Titik patahan pertama biasanya pekerjaan produk visual: mockup, visual peluncuran, debugging tangkapan layar, demo, atau analisis rekaman. Itulah tugas yang menarik alur kerja melampaui apa yang Cursor berikan sendiri.",
    },
    {
      question: "Model mana yang harus saya tambahkan lebih dulu untuk Cursor?",
      answer:
        "Jika pekerjaan dimulai dengan visual halus, mulai dengan Seedream 5. Jika Anda memerlukan iterasi visual lebih cepat, mulai dengan Nano Banana 2. Jika pekerjaan dimulai dengan demo produk atau gerak, lihat Veo 3.1 atau Kling 3.0 terlebih dahulu.",
    },
    {
      question: "Apakah AnyCap menggantikan Cursor?",
      answer:
        "Tidak. AnyCap memperluas Cursor. Perannya adalah menambahkan generasi gambar, generasi video, pemahaman gambar, dan analisis video di sekitar lingkungan pengkodean yang sudah Anda gunakan.",
    },
  ],
};

const de: BestAIForCursorPageData = {
  breadcrumbItems: [
    { name: "Startseite", href: "/" },
    { name: "Lernen", href: "/learn", unlinkable: true },
    { name: "Beste KI für Cursor" },
  ],
  eyebrow: "Lernen",
  metadata: {
    title: "Beste KI für Cursor: das richtige Setup ist meist Cursor plus Kapazitäten",
    description:
      "Die beste KI für Cursor ist meist das Setup, das den editor-nativen Workflow von Cursor intakt hält und die fehlende visuelle, Video- und Modellauswahl-Schicht ergänzt.",
    openGraphTitle: "Beste KI für Cursor: das richtige Setup ist meist Cursor plus Kapazitäten",
    openGraphDescription:
      "Ein Käufer-Leitfaden für Teams, die entscheiden, ob das beste Cursor-Setup Cursor allein, Cursor plus verstreute Provider-Tabs oder Cursor plus eine Capability Runtime mit Modellauswahl ist.",
  },
  articleJsonLd: createTechArticleJsonLd({
    headline: "Beste KI für Cursor: das richtige Setup ist meist Cursor plus Kapazitäten",
    description:
      "Ein Käufer-Leitfaden für Teams, die entscheiden, ob das beste Cursor-Setup Cursor allein, Cursor plus verstreute Provider-Tabs oder Cursor plus eine Capability Runtime mit Modellauswahl ist.",
    path: BEST_AI_FOR_CURSOR_PATH,
    about: ["Cursor", "Coding-Agenten", "KI-Kapazitäten", "Bildgenerierung", "Videogenerierung", "Agent Capability Runtime"],
    keywords: [
      "beste ki für cursor",
      "beste ki-tools für cursor",
      "cursor kapazitäten",
      "cursor visueller workflow",
      "cursor mockup-generierung",
    ],
    datePublished: lastUpdatedIso,
    dateModified: lastUpdatedIso,
  }),
  faqJsonLd: createFaqPageJsonLd([
    {
      question: "Was ist aktuell die beste KI für Cursor?",
      answer:
        "Wenn Sie die Kern-Coding-Arbeit meinen, ist Cursor möglicherweise bereits die richtige Grundlage für Ihr Team. Wenn Sie den gesamten Workflow rund ums Coding meinen, ist das beste Setup oft Cursor plus die Kapazitäten und Modelloptionen, die ihm noch fehlen.",
    },
    {
      question: "Ist die beste KI für Cursor immer ein anderes Modell?",
      answer:
        "Nicht immer. Manchmal kommt der größere Gewinn daher, Medien- und Vision-Kapazitäten rund um Cursor zu ergänzen, statt die Kern-Coding-Umgebung zu wechseln.",
    },
    {
      question: "Was bricht rund um Cursor meist zuerst?",
      answer:
        "Der erste Bruchpunkt ist meist visuelle Produktarbeit: Mockups, Launch-Visuals, Screenshot-Debugging, Demos oder Aufzeichnungsanalyse. Diese Aufgaben ziehen den Workflow über das hinaus, was Cursor allein bietet.",
    },
    {
      question: "Ersetzt AnyCap Cursor?",
      answer:
        "Nein. AnyCap erweitert Cursor. Seine Rolle ist es, Bildgenerierung, Videogenerierung, Bildverständnis und Videoanalyse rund um die Coding-Umgebung zu ergänzen, die Sie bereits nutzen.",
    },
  ]),
  lastUpdatedLabel: "7. April 2026",
  heroTitle: ["Beste KI für", "Cursor"],
  heroIntro:
    "Die beste KI für Cursor ist meist keine Frage des Verlassens von Cursor. Es ist die Frage, ob der editor-native Workflow noch ausreicht oder ob die Arbeit so visuell, teilbar und modellsensitiv geworden ist, dass eine Capability-Schicht rund um den Editor nötig wird.",
  quickAnswerLabel: "Kurzantwort",
  quickAnswerTitle: "Das beste Cursor-Setup behält Cursor meist als editor-nativen Kern und ergänzt die fehlende visuelle Schicht drumherum.",
  quickAnswerBody:
    "Das hält den Coding-Loop intakt und erweitert, was der Workflow tatsächlich abschließen kann. Für viele Teams ist das nützlicher, als die Kern-Umgebung zu wechseln, nur weil die Aufgabe kurz den Editor verlässt und visuell oder multimodal wird.",
  quickTakeawaysLabel: "Kernpunkte",
  quickTakeaways: [
    "Cursor ist bereits stark, wenn die Arbeit innerhalb des Edit-Run-Review-Loops bleibt.",
    "Der erste Bruchpunkt zeigt sich meist in visueller Produktarbeit: Mockups, Screenshots, Demos und Aufzeichnungen.",
    "Für Cursor-Nutzer ist die nächste Entscheidung oft, welche Kapazität oder welches Modell ergänzt wird, nicht welcher neue Agent übernommen wird.",
  ],
  evaluationLabel: "Was zu evaluieren ist",
  evaluationTitle: "Beginnen Sie mit der Frage, wie viel der Arbeit noch in den Editor-Loop passt",
  evaluationCards: [
    {
      title: "Wie viel der Arbeit im Editor bleibt",
      body:
        "Wenn die Aufgabe überwiegend Code-Navigation, Edits, Diffs, Debugging und lokale Ausführung ist, lautet die Hauptfrage, ob Cursor Ihrem Team bereits den richtigen Coding-Loop gibt. Oft tut es das.",
    },
    {
      title: "Wie visuell der Workflow geworden ist",
      body:
        "Die Antwort ändert sich, wenn die Arbeit Produkt-Mockups, Launch-Visuals, Demo-Clips, Screenshot-Inspektion oder Aufzeichnungsanalyse benötigt. An diesem Punkt ist die beste KI für Cursor nicht mehr nur eine Frage des Coding-Modells.",
    },
    {
      title: "Wie oft der Output ein teilbares Artefakt wird",
      body:
        "Ein Stack, der nur Code editiert, reicht nicht aus, wenn das Ergebnis zu einem Artefakt werden muss, das ein Teammitglied oder Stakeholder reviewen, teilen oder veröffentlichen kann.",
    },
    {
      title: "Wie wichtig Modellauswahl und Tool-Kontrolle sind",
      body:
        "Das beste praktische Setup ist oft jenes, das Provider-Wildwuchs vermeidet und gleichzeitig das richtige Bild- und Video-Modell für die Aufgabe bietet. Separate Services können überraschend schnell zu Integrations-Schulden rund um Cursor werden.",
    },
  ],
  stackLabel: "Drei Setup-Muster",
  stackTitle: "Die meisten Teams, die Cursor evaluieren, entscheiden in Wahrheit, wie weit der Editor-Loop dehnbar ist",
  stackCards: [
    {
      title: "Nur Cursor",
      label: "Beste Wahl, wenn Code und lokale Ausführung die Aufgabe sind",
      body:
        "Das ist der einfachste Pfad, wenn der Workflow innerhalb von Repository-Arbeit, lokaler Ausführung und Code-Iteration bleibt. Der Wert kommt aus der Coding-Umgebung selbst, nicht aus externen Medien- oder Analyseaufgaben.",
    },
    {
      title: "Cursor plus verstreute Provider-Tabs",
      label: "Funktioniert, doch der Workflow verlässt den Editor",
      body:
        "Sie können Bild-, Video- und Analyse-Provider separat anbinden, doch jede zusätzliche Aufgabe erhöht Credential-Wildwuchs, Prompt-Drift und Wartung rund um den Editor-Workflow.",
    },
    {
      title: "Cursor plus eine Capability Runtime",
      label: "Beste Wahl, wenn der Workflow visuell oder multimedial wird",
      body:
        "Hier passt AnyCap. Sie behalten Cursor für Code, Editing und Workflows mit integriertem Terminal und ergänzen Bildgenerierung, Videogenerierung, Bildverständnis und Videoanalyse über eine einzige Runtime.",
    },
  ],
  capabilityLabel: "Erste Workflows, die ergänzt werden",
  capabilityTitle: "Das sind meist die ersten visuellen Workflows, die rund um Cursor auftauchen",
  capabilityCards: [
    {
      title: "Launch-Visuals und Mockups",
      href: "/capabilities/image-generation",
      body:
        "Geeignet, wenn Cursor polierte Produkt-Visuals, Landingpage-Konzepte oder Mockups braucht, statt nur zu beschreiben, was ein Designer erstellen soll.",
    },
    {
      title: "Demo-Clips und Walkthroughs",
      href: "/capabilities/video-generation",
      body:
        "Geeignet, wenn der Workflow Demos, Walkthroughs oder kurze Motion-Assets aus demselben editor-zentrierten Prozess benötigt.",
    },
    {
      title: "Screenshot-Debugging und visuelle QA",
      href: "/capabilities/image-understanding",
      body:
        "Geeignet, wenn Cursor Screenshots, Diagramme, OCR-Inputs oder visuelle QA-Beweise im selben Debugging-Loop interpretieren muss.",
    },
    {
      title: "Aufzeichnungsreview und Issue-Analyse",
      href: "/capabilities/video-analysis",
      body:
        "Geeignet, wenn der Bug, das Usability-Problem oder der Workflow-Beweis in einer Aufzeichnung lebt statt in einem Text-Log.",
    },
  ],
  modelLabel: "Modellauswahl",
  modelTitle: "Wenn Sie Cursor behalten, ist die nächste Frage oft, welches Modell zum Workflow passt",
  modelIntro:
    "Cursor-Nutzer treffen nach dem Hinzufügen von Kapazitäten oft eine zweite Entscheidung: welches Bild- oder Video-Modell tatsächlich zur Arbeit passt. Das ist ein anderes Problem als die Wahl des Editors.",
  modelCards: [
    {
      title: "Seedream 5",
      href: "/models/seedream-5",
      body: "Bestes Bildmodell für den ersten Pass, wenn Cursor polierte Mockups, Launch-Visuals oder klarere visuelle Konzepte benötigt.",
    },
    {
      title: "Nano Banana 2",
      href: "/models/nano-banana-2",
      body: "Beste Wahl, wenn Cursor schnellere Iteration über viele visuelle Varianten und leichtere Kreativ-Loops braucht.",
    },
    {
      title: "Veo 3.1",
      href: "/models/veo-3-1",
      body: "Bestes Premium-Videomodell für Cursor, wenn der Workflow polierte Demo-Clips oder cinematischen Motion-Output benötigt.",
    },
    {
      title: "Kling 3.0",
      href: "/models/kling-3-0",
      body: "Beste Wahl, wenn die Bewegung stilisierter oder cinematischer wirken soll als ein Standard-Produkt-Walkthrough.",
    },
  ],
  decisionLabel: "Wie Sie entscheiden",
  decisionTitle: "Stellen Sie diese Fragen, bevor Sie einen Workflow neu bauen, den Cursor bereits gut handhabt",
  decisionRows: [
    {
      question: "Wann reicht Cursor allein bereits aus?",
      answer:
        "Cursor reicht oft aus, wenn der Workflow auf Code, Terminal-Ausführung und lokales Repo-Reasoning zentriert bleibt. Dann liegt der Hauptwert im Editor- und Coding-Loop.",
    },
    {
      question: "Wann sollte ich Kapazitäten hinzufügen, statt die Umgebung zu wechseln?",
      answer:
        "Ergänzen Sie Kapazitäten, wenn die Arbeit Bildoutput, Videooutput, Screenshot-Interpretation, visuelle QA oder Aufzeichnungsanalyse benötigt. Das sind Probleme der Capability-Schicht, kein Grund, den Editor-Loop ganz aufzugeben.",
    },
    {
      question: "Wann zählt Modellauswahl innerhalb der Capability-Schicht?",
      answer:
        "Modellauswahl zählt, sobald der Workflow visuell wird. Dann möchten Sie eventuell ein Bildmodell für polierte Mockups, ein anderes für schnelle Iteration und ein separates Videomodell für Demos oder Walkthroughs.",
    },
    {
      question: "Soll ich Cursor ersetzen, um diese Lücke zu schließen?",
      answer:
        "Meist nicht. Für viele Teams ist es besser, Cursor zu behalten und die fehlenden Kapazitäten zu ergänzen, statt eine neue Agent-Oberfläche einzuführen und den Workflow neu zu lernen.",
    },
  ],
  nextMoveLabel: "Beste nächste Schritte",
  nextMoveTitle: "Wechseln Sie von diesem Käufer-Leitfaden zur relevantesten Cursor-Workflow- oder Modellseite",
  nextMoveCards: [
    {
      title: "Den Cursor-Hub ansehen",
      href: "/for/cursor",
      body: "Hierhin, wenn Sie die zentrale Cursor-Landingpage wollen statt eines Evaluations-Leitfadens im Lernen-Stil.",
    },
    {
      title: "Mit Screenshot-Verständnis starten",
      href: "/capabilities/image-understanding",
      body: "Bester nächster Schritt, wenn der erste gebrochene Workflow Screenshot-Debugging, visuelle QA oder Design-Feedback ist.",
    },
    {
      title: "Bildmodelle vergleichen",
      href: "/models/seedream-5",
      body: "Bester nächster Schritt, wenn die echte Frage lautet, welches Bildmodell zu Cursor-Mockups und Launch-Visuals passt.",
    },
    {
      title: "Videomodelle vergleichen",
      href: "/models/veo-3-1",
      body: "Bester nächster Schritt, wenn die echte Frage lautet, welches Videomodell zu Demos, Walkthroughs oder cinematischer Produktbewegung passt.",
    },
    {
      title: "Was ist die fortschrittlichste KI?",
      href: "/learn/what-is-the-most-advanced-ai",
      body: "Hierhin, wenn die Frage die Frontier insgesamt betrifft, nicht nur Cursor.",
    },
    {
      title: "Die Runtime installieren",
      href: "/guides/install-anycap",
      body: "Nutzen Sie den Installationsleitfaden, wenn Sie von der Evaluation zu echten Setup-Schritten übergehen wollen.",
    },
  ],
  faqLabel: "FAQ",
  faqTitle: "Fragen hinter dem Keyword",
  faqItems: [
    {
      question: "Was ist aktuell die beste KI für Cursor?",
      answer:
        "Wenn Sie die Kern-Coding-Arbeit meinen, ist Cursor möglicherweise bereits die richtige Grundlage für Ihr Team. Wenn Sie den gesamten Workflow rund ums Coding meinen, ist das beste Setup oft Cursor plus die Kapazitäten und Modelloptionen, die ihm noch fehlen.",
    },
    {
      question: "Ist die beste KI für Cursor immer ein anderes Modell?",
      answer:
        "Nicht immer. Manchmal kommt der größere Gewinn daher, Medien- und Vision-Kapazitäten rund um Cursor zu ergänzen, statt die Kern-Coding-Umgebung zu wechseln.",
    },
    {
      question: "Was bricht rund um Cursor meist zuerst?",
      answer:
        "Der erste Bruchpunkt ist meist visuelle Produktarbeit: Mockups, Launch-Visuals, Screenshot-Debugging, Demos oder Aufzeichnungsanalyse. Diese Aufgaben ziehen den Workflow über das hinaus, was Cursor allein bietet.",
    },
    {
      question: "Welches Modell sollte ich für Cursor zuerst hinzufügen?",
      answer:
        "Wenn die Arbeit mit polierten Visuals beginnt, starten Sie mit Seedream 5. Wenn Sie schnellere visuelle Iteration brauchen, starten Sie mit Nano Banana 2. Wenn die Arbeit mit Produktdemos oder Motion beginnt, sehen Sie sich zuerst Veo 3.1 oder Kling 3.0 an.",
    },
    {
      question: "Ersetzt AnyCap Cursor?",
      answer:
        "Nein. AnyCap erweitert Cursor. Seine Rolle ist es, Bildgenerierung, Videogenerierung, Bildverständnis und Videoanalyse rund um die Coding-Umgebung zu ergänzen, die Sie bereits nutzen.",
    },
  ],
};

const contentByLocale: Record<SiteLocale, BestAIForCursorPageData> = {
  en,
  "pt-br": ptBr,
  id,
  de,
};

export function getBestAICursorMetadata(locale: SiteLocale): Metadata {
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

export function getBestAICursorPageData(locale: SiteLocale) {
  return contentByLocale[locale] ?? contentByLocale.en;
}
