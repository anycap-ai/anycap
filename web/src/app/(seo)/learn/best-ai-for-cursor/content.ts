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

const id = en;

const contentByLocale: Record<SiteLocale, BestAIForCursorPageData> = {
  en,
  "pt-br": ptBr,
  id,
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
