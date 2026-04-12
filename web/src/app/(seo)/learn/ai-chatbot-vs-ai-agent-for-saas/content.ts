import type { Metadata } from "next";
import { createFaqPageJsonLd, createTechArticleJsonLd } from "@/lib/schema";
import { getLocaleConfig, siteConfig, type SiteLocale } from "@/lib/site";

export const AI_CHATBOT_VS_AI_AGENT_FOR_SAAS_PATH = "/learn/ai-chatbot-vs-ai-agent-for-saas";

type PageData = {
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
  quickAnswerLabel: string;
  quickAnswerTitle: string;
  quickAnswerBody: string;
  quickTakeawaysLabel: string;
  quickTakeaways: readonly string[];
  comparisonLabel: string;
  comparisonTitle: string;
  comparisonIntro: string;
  comparisonHeaders: {
    dimension: string;
    chatbot: string;
    agent: string;
  };
  comparisonRows: readonly { dimension: string; chatbot: string; agent: string }[];
  chatbotLabel: string;
  chatbotTitle: string;
  chatbotCards: readonly { title: string; body: string }[];
  triggerLabel: string;
  triggerTitle: string;
  triggerIntro: string;
  triggerCards: readonly { title: string; body: string }[];
  capabilityLabel: string;
  capabilityTitle: string;
  capabilityIntro: string;
  capabilityCards: readonly { title: string; href: string; body: string }[];
  architectureLabel: string;
  architectureTitle: string;
  architectureCards: readonly { title: string; label: string; body: string }[];
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

const en: PageData = {
  breadcrumbItems: [
    { name: "Home", href: "/" },
    { name: "Learn", href: "/learn", unlinkable: true },
    { name: "AI Chatbot SaaS vs AI Agent for SaaS" },
  ],
  eyebrow: "Learn",
  metadata: {
    title: "AI chatbot SaaS vs AI agent for SaaS - when a chatbot stops being enough",
    description:
      "Compare AI chatbot SaaS products with agent-style SaaS systems. Learn where chat is enough, where multimodal and web tasks break it, and how a capability runtime changes the stack.",
    openGraphTitle: "AI chatbot SaaS vs AI agent for SaaS - when a chatbot stops being enough",
    openGraphDescription:
      "An architecture-level guide for SaaS teams deciding between a chatbot product and an agent system with real capabilities around it.",
  },
  articleJsonLd: createTechArticleJsonLd({
    headline: "AI chatbot SaaS vs AI agent for SaaS - when a chatbot stops being enough",
    description:
      "A practical explainer for SaaS teams deciding whether they need a chatbot product, an agent system, or a capability runtime around the agent stack.",
    path: AI_CHATBOT_VS_AI_AGENT_FOR_SAAS_PATH,
    about: ["AI chatbot SaaS", "AI agents", "SaaS architecture", "Multimodal workflows", "Agent capability runtime"],
    keywords: [
      "ai chatbot saas",
      "chatbot saas",
      "ai agent for saas",
      "chatbot vs ai agent",
      "multimodal chatbot saas",
    ],
    datePublished: lastUpdatedIso,
    dateModified: lastUpdatedIso,
  }),
  faqJsonLd: createFaqPageJsonLd([
    {
      question: "Is an AI chatbot SaaS the same thing as an AI agent for SaaS?",
      answer:
        "No. They overlap, but they solve different layers of the problem. A chatbot SaaS centers the conversation. An agent system centers task completion across tools, context, and outputs.",
    },
    {
      question: "Can a chatbot call tools and still be a chatbot?",
      answer:
        "Yes, up to a point. But once tool use becomes the main way the product succeeds, the architecture is behaving more like an agent system than a plain chatbot.",
    },
    {
      question: "When does a SaaS chatbot need multimodal capabilities?",
      answer:
        "It usually happens when users start bringing screenshots, diagrams, or recordings into the workflow, or when the system needs to create images and videos instead of only replying with text.",
    },
    {
      question: "Is AnyCap the chatbot layer in this comparison?",
      answer:
        "No. AnyCap is the capability runtime around the assistant or agent. It helps the system generate, inspect, search, crawl, and deliver outputs, while the chatbot or agent experience can stay in the interface you already use.",
    },
  ]),
  lastUpdatedLabel: "April 7, 2026",
  heroTitle: ["AI chatbot SaaS", "vs AI agent for", "SaaS"],
  heroIntro:
    "If you search for AI chatbot SaaS, the real product question is usually bigger than chat. Do you only need a conversational layer that answers well, or do you need a system that can inspect screenshots, research the live web, generate media, and hand back something a user can actually use? The first is a chatbot product. The second is much closer to an agent stack.",
  quickAnswerLabel: "Quick answer",
  quickAnswerTitle: "A chatbot is enough until the product has to do real work outside the conversation.",
  quickAnswerBody:
    "That is the cleanest way to read this keyword. A chatbot SaaS is a strong answer for support, onboarding, and bounded assistance. But when the user expects the system to inspect files, search external sources, create media, or return outputs that live beyond the chat thread, you are already making agent architecture decisions whether you call it that or not.",
  quickTakeawaysLabel: "Key points",
  quickTakeaways: [
    "An AI chatbot SaaS is a strong fit when the product mainly needs conversation, retrieval, and lightweight actions.",
    "The moment the workflow must inspect screenshots, search the live web, generate media, or hand back files, you are designing an agent system instead of a plain chatbot.",
    "AnyCap fits around that agent stack as the capability runtime. It is not the chatbot product itself.",
  ],
  comparisonLabel: "Side-by-side view",
  comparisonTitle: "The difference is not branding. It is what the system must finish for the user.",
  comparisonIntro:
    "This is an architecture comparison, not a vendor ranking. The point is to choose the right system shape for the job rather than stretching a chatbot label across workflows that really need capabilities and task execution.",
  comparisonHeaders: {
    dimension: "Dimension",
    chatbot: "AI chatbot SaaS",
    agent: "AI agent for SaaS",
  },
  comparisonRows: [
    { dimension: "Primary promise", chatbot: "Answer the user well inside a chat interface.", agent: "Finish a task that may involve reasoning, tools, files, research, and deliverable outputs." },
    { dimension: "Typical inputs", chatbot: "Text prompts, a knowledge base, and a narrow product context.", agent: "Text plus screenshots, URLs, structured state, uploaded files, and intermediate results." },
    { dimension: "Success metric", chatbot: "The response is helpful, fast, and on-brand.", agent: "The system returns a finished artifact, recommendation, or completed workflow." },
    { dimension: "Tool use", chatbot: "Optional and usually limited to a few bounded calls.", agent: "Core to the architecture. Tool execution is how the task gets completed." },
    { dimension: "Media and web tasks", chatbot: "Often bolted on as exceptions, which makes the product fragile.", agent: "Handled as normal parts of the workflow, including generation, analysis, and retrieval." },
    { dimension: "Output expectations", chatbot: "The answer mostly stays inside the conversation thread.", agent: "The result often needs to be saved, shared, published, or passed to another system." },
    { dimension: "Best fit", chatbot: "Support, onboarding, FAQ, and narrow in-app assistance.", agent: "Research, multimodal product work, content operations, and multi-step internal workflows." },
  ],
  chatbotLabel: "Good chatbot territory",
  chatbotTitle: "A chatbot SaaS still makes sense when the product wins through conversation itself",
  chatbotCards: [
    {
      title: "Support and knowledge retrieval",
      body:
        "If the assistant mostly answers product questions, summarizes documentation, and routes a user to the next help step, a chatbot SaaS can be the correct architecture. The job is still conversational.",
    },
    {
      title: "In-app onboarding and guidance",
      body:
        "When the product needs a helpful UI layer that explains where to click, how to configure settings, or what feature to use next, a strong chatbot experience can carry most of the value.",
    },
    {
      title: "Bounded workflows with a tiny action set",
      body:
        "A chatbot is still viable when the action surface is narrow, such as fetching account details or kicking off a single predictable backend call. The key is that the system still behaves like guided conversation, not open-ended task execution.",
    },
  ],
  triggerLabel: "Where the line moves",
  triggerTitle: "Most SaaS teams outgrow a plain chatbot at the moment the work becomes multimodal or external",
  triggerIntro:
    "This is the practical transition point behind a lot of AI product confusion. Teams still say \"chatbot\" because that is the visible interface. But the system beneath it now has to analyze, generate, retrieve, and deliver. At that point, the product behaves more like an agent with a capability layer around it.",
  triggerCards: [
    {
      title: "The assistant must inspect what the user sees",
      body:
        "The line moves quickly once screenshots, diagrams, or recorded flows enter the task. Now the system needs image understanding or video analysis, not just text generation.",
    },
    {
      title: "The task depends on live web context",
      body:
        "A chatbot SaaS can answer from a static knowledge layer. An agent-style system needs web search, web crawl, and evidence gathering when the answer depends on current external information.",
    },
    {
      title: "The workflow has to create media",
      body:
        "If the assistant needs to generate launch visuals, demo clips, or creative assets, the product is no longer just conversational. It needs media generation as a first-class capability.",
    },
    {
      title: "The output has to leave the chat",
      body:
        "Teams feel the architecture change when the result must become a file, a share link, or a published page. At that point, the chat thread is only one layer of the system.",
    },
  ],
  capabilityLabel: "Where AnyCap fits",
  capabilityTitle: "AnyCap is the capability runtime around the assistant stack, not the chatbot product",
  capabilityIntro:
    "That distinction is what makes this keyword usable for AnyCap without forcing the wrong positioning. AnyCap is relevant when the SaaS team keeps its chosen agent or assistant surface but needs a consistent way to add image, video, vision, web, and artifact workflows around it.",
  capabilityCards: [
    { title: "Image understanding", href: "/capabilities/image-understanding", body: "Read screenshots, references, and visual QA inputs when a plain chatbot can only guess." },
    { title: "Video generation", href: "/capabilities/video-generation", body: "Create product clips and short demos instead of stopping at text instructions about what to make." },
    { title: "Web search", href: "/capabilities/web-search", body: "Pull in live external context when the answer cannot come only from your internal docs." },
    { title: "Web crawl", href: "/capabilities/web-crawl", body: "Turn pages into usable markdown or structured inputs for agent workflows." },
    { title: "Drive", href: "/capabilities/drive", body: "Move the result from an internal workflow into a shareable artifact a human can actually open." },
  ],
  architectureLabel: "Practical read",
  architectureTitle: "Three common SaaS architectures behind the keyword",
  architectureCards: [
    {
      title: "Customer support assistant",
      label: "Still a chatbot",
      body:
        "The product answers known questions, cites help-center content, and maybe opens a ticket. That is a classic chatbot SaaS pattern because the output is still a conversation plus routing.",
    },
    {
      title: "Product copilot for operators",
      label: "Crossing into agent territory",
      body:
        "Now the system must read screenshots, compare workflows, search live docs, and explain what changed. That is no longer just chat. It is an agent workflow with tool execution and evidence gathering.",
    },
    {
      title: "Growth or content assistant",
      label: "Needs a capability runtime",
      body:
        "If the product turns requests into images, videos, research notes, and shareable outputs, the winning architecture is usually a chat or command layer plus a runtime that can generate, inspect, and deliver results.",
    },
  ],
  selectionLabel: "How to choose",
  selectionTitle: 'Ask a better question than "Should I build a chatbot SaaS?"',
  selectionRows: [
    {
      question: "When should I stay with an AI chatbot SaaS?",
      answer:
        "Stay with the chatbot model when the main job is conversation, retrieval, and bounded support. If the product wins by being fast, friendly, and reliable inside a single chat surface, do not over-engineer it into an agent too early.",
    },
    {
      question: "When should I move toward an AI agent for SaaS?",
      answer:
        "Move toward an agent architecture when the workflow needs tools, files, live web context, multimodal analysis, or deliverables outside the conversation. Those are signals that the product has shifted from answering to doing.",
    },
    {
      question: "Where does AnyCap fit in that stack?",
      answer:
        "AnyCap is the capability runtime around the agent or assistant layer. Its role is to help the system generate media, understand media, use web capabilities, and deliver outputs through one CLI and one capability surface.",
    },
  ],
  nextMoveLabel: "Best next moves",
  nextMoveTitle: "Continue from this bridge page into the rest of the site",
  nextMoveCards: [
    {
      title: "See the capability gap first",
      href: "/learn/what-agents-cant-do",
      body: "Use this page if the real question is what breaks first when an assistant needs to do more than chat.",
    },
    {
      title: "See the coding-agent version",
      href: "/learn/best-ai-for-coding-agents",
      body: "Use this page if the same stack question is showing up inside coding agents rather than a SaaS assistant surface.",
    },
    {
      title: "Add multimodal capabilities",
      href: "/learn/add-multimodal-capabilities-to-saas-chatbot",
      body: "Use this page if you are past the definition stage and want the implementation pattern for a richer SaaS assistant.",
    },
    {
      title: "Browse the capability hub",
      href: "/capabilities",
      body: "Use Capabilities when you want the concrete product surfaces that sit around the agent workflow.",
    },
    {
      title: "Take the shortest setup path",
      href: "/guides/install-anycap",
      body: "Use the install guide when you are past the architecture question and want the fastest path into a real runtime.",
    },
  ],
  faqLabel: "FAQ",
  faqTitle: "Questions behind the keyword",
  faqItems: [
    {
      question: "Is an AI chatbot SaaS the same thing as an AI agent for SaaS?",
      answer:
        "No. They overlap, but they solve different layers of the problem. A chatbot SaaS centers the conversation. An agent system centers task completion across tools, context, and outputs.",
    },
    {
      question: "Can a chatbot call tools and still be a chatbot?",
      answer:
        "Yes, up to a point. But once tool use becomes the main way the product succeeds, the architecture is behaving more like an agent system than a plain chatbot.",
    },
    {
      question: "When does a SaaS chatbot need multimodal capabilities?",
      answer:
        "It usually happens when users start bringing screenshots, diagrams, or recordings into the workflow, or when the system needs to create images and videos instead of only replying with text.",
    },
    {
      question: "Is AnyCap the chatbot layer in this comparison?",
      answer:
        "No. AnyCap is the capability runtime around the assistant or agent. It helps the system generate, inspect, search, crawl, and deliver outputs, while the chatbot or agent experience can stay in the interface you already use.",
    },
  ],
};

const ptBr: PageData = {
  breadcrumbItems: [
    { name: "Início", href: "/" },
    { name: "Aprender", href: "/learn", unlinkable: true },
    { name: "Chatbot de IA SaaS vs agente de IA para SaaS" },
  ],
  eyebrow: "Aprender",
  metadata: {
    title: "Chatbot de IA SaaS vs agente de IA para SaaS - quando um chatbot deixa de ser suficiente",
    description:
      "Compare produtos de chatbot de IA SaaS com sistemas SaaS em estilo agente. Veja quando chat basta, quando tarefas multimodais e de web quebram esse modelo e como um runtime de capacidades muda a stack.",
    openGraphTitle: "Chatbot de IA SaaS vs agente de IA para SaaS - quando um chatbot deixa de ser suficiente",
    openGraphDescription:
      "Um guia de arquitetura para times SaaS decidindo entre um produto de chatbot e um sistema de agente com capacidades reais ao redor dele.",
  },
  articleJsonLd: createTechArticleJsonLd({
    headline: "Chatbot de IA SaaS vs agente de IA para SaaS - quando um chatbot deixa de ser suficiente",
    description:
      "Um explicador prático para times SaaS decidindo se precisam de um produto chatbot, de um sistema de agente ou de um runtime de capacidades ao redor da stack de agente.",
    path: AI_CHATBOT_VS_AI_AGENT_FOR_SAAS_PATH,
    about: ["chatbot de IA SaaS", "agentes de IA", "arquitetura SaaS", "fluxos multimodais", "runtime de capacidades de agente"],
    keywords: [
      "chatbot de ia saas",
      "chatbot saas",
      "agente de ia para saas",
      "chatbot vs agente de ia",
      "chatbot multimodal saas",
    ],
    datePublished: lastUpdatedIso,
    dateModified: lastUpdatedIso,
  }),
  faqJsonLd: createFaqPageJsonLd([
    {
      question: "Um chatbot de IA SaaS é a mesma coisa que um agente de IA para SaaS?",
      answer:
        "Não. Eles se sobrepõem, mas resolvem camadas diferentes do problema. Um chatbot SaaS centraliza a conversa. Um sistema de agente centraliza a conclusão de tarefas por meio de ferramentas, contexto e saídas.",
    },
    {
      question: "Um chatbot pode chamar ferramentas e ainda ser chatbot?",
      answer:
        "Sim, até certo ponto. Mas quando o uso de ferramentas vira a principal forma de sucesso do produto, a arquitetura já está agindo mais como um sistema de agente do que como um chatbot simples.",
    },
    {
      question: "Quando um chatbot SaaS precisa de capacidades multimodais?",
      answer:
        "Normalmente acontece quando usuários começam a trazer capturas de tela, diagramas ou gravações para o fluxo, ou quando o sistema precisa criar imagens e vídeos em vez de apenas responder com texto.",
    },
    {
      question: "O AnyCap é a camada de chatbot nesta comparação?",
      answer:
        "Não. O AnyCap é o runtime de capacidades ao redor do assistente ou agente. Ele ajuda o sistema a gerar, inspecionar, pesquisar, rastrear e entregar saídas, enquanto a experiência de chatbot ou agente pode continuar na interface que você já usa.",
    },
  ]),
  lastUpdatedLabel: "7 de abril de 2026",
  heroTitle: ["Chatbot de IA SaaS", "vs agente de IA para", "SaaS"],
  heroIntro:
    "Se você procura por chatbot de IA SaaS, a pergunta real do produto normalmente é maior do que chat. Você só precisa de uma camada conversacional que responde bem, ou precisa de um sistema que consiga inspecionar capturas de tela, pesquisar a web ao vivo, gerar mídia e devolver algo que o usuário realmente possa usar? O primeiro é um produto chatbot. O segundo já se parece muito mais com uma stack de agente.",
  quickAnswerLabel: "Resposta rápida",
  quickAnswerTitle: "Um chatbot basta até o momento em que o produto precisa fazer trabalho real fora da conversa.",
  quickAnswerBody:
    "Essa é a leitura mais clara desta busca. Um chatbot SaaS é uma boa resposta para suporte, onboarding e assistência limitada. Mas quando o usuário espera que o sistema inspecione arquivos, pesquise fontes externas, crie mídia ou devolva saídas que vivam além da conversa, você já está tomando decisões de arquitetura de agente, mesmo que não chame assim.",
  quickTakeawaysLabel: "Pontos principais",
  quickTakeaways: [
    "Um chatbot de IA SaaS é uma boa escolha quando o produto precisa principalmente de conversa, recuperação de conteúdo e ações leves.",
    "No momento em que o fluxo precisa inspecionar capturas, pesquisar a web ao vivo, gerar mídia ou devolver arquivos, você está desenhando um sistema de agente e não um chatbot simples.",
    "O AnyCap entra ao redor dessa stack de agente como o runtime de capacidades. Ele não é o produto chatbot em si.",
  ],
  comparisonLabel: "Visão lado a lado",
  comparisonTitle: "A diferença não é marca. É o que o sistema precisa terminar para o usuário.",
  comparisonIntro:
    "Esta é uma comparação de arquitetura, não um ranking de fornecedor. O objetivo é escolher a forma certa de sistema para a tarefa, em vez de esticar a etiqueta \"chatbot\" para fluxos que realmente exigem capacidades e execução.",
  comparisonHeaders: {
    dimension: "Dimensão",
    chatbot: "Chatbot de IA SaaS",
    agent: "Agente de IA para SaaS",
  },
  comparisonRows: [
    { dimension: "Promessa principal", chatbot: "Responder bem ao usuário dentro de uma interface de chat.", agent: "Concluir uma tarefa que pode envolver raciocínio, ferramentas, arquivos, pesquisa e saídas entregáveis." },
    { dimension: "Inputs típicos", chatbot: "Prompts de texto, uma base de conhecimento e um contexto de produto estreito.", agent: "Texto mais capturas, URLs, estado estruturado, arquivos enviados e resultados intermediários." },
    { dimension: "Métrica de sucesso", chatbot: "A resposta é útil, rápida e consistente com a marca.", agent: "O sistema devolve um artefato final, uma recomendação ou um fluxo concluído." },
    { dimension: "Uso de ferramentas", chatbot: "Opcional e normalmente limitado a poucas chamadas contidas.", agent: "Parte central da arquitetura. A execução de ferramentas é como a tarefa termina." },
    { dimension: "Tarefas de mídia e web", chatbot: "Muitas vezes acopladas como exceções, o que deixa o produto frágil.", agent: "Tratadas como partes normais do fluxo, incluindo geração, análise e recuperação." },
    { dimension: "Expectativa de saída", chatbot: "A resposta fica principalmente dentro da conversa.", agent: "O resultado muitas vezes precisa ser salvo, compartilhado, publicado ou passado para outro sistema." },
    { dimension: "Melhor encaixe", chatbot: "Suporte, onboarding, FAQ e assistência limitada dentro do app.", agent: "Pesquisa, trabalho multimodal de produto, operações de conteúdo e fluxos internos em múltiplos passos." },
  ],
  chatbotLabel: "Território bom para chatbot",
  chatbotTitle: "Um chatbot SaaS ainda faz sentido quando o produto vence pela própria conversa",
  chatbotCards: [
    {
      title: "Suporte e recuperação de conhecimento",
      body:
        "Se o assistente responde principalmente perguntas do produto, resume documentação e encaminha o usuário para o próximo passo de ajuda, um chatbot SaaS pode ser a arquitetura correta. O trabalho ainda é conversacional.",
    },
    {
      title: "Onboarding e orientação dentro do app",
      body:
        "Quando o produto precisa de uma camada útil que explica onde clicar, como configurar opções ou qual recurso usar em seguida, uma boa experiência de chatbot pode carregar a maior parte do valor.",
    },
    {
      title: "Fluxos limitados com um conjunto minúsculo de ações",
      body:
        "Um chatbot ainda é viável quando a superfície de ações é estreita, como buscar detalhes de conta ou disparar uma única chamada previsível de backend. O ponto é que o sistema ainda se comporta como conversa guiada, não como execução de tarefa aberta.",
    },
  ],
  triggerLabel: "Onde a linha muda",
  triggerTitle: "A maioria dos times SaaS ultrapassa um chatbot simples no momento em que o trabalho vira multimodal ou externo",
  triggerIntro:
    "Esse é o ponto de transição prático por trás de muita confusão em produto de IA. Os times continuam dizendo \"chatbot\" porque essa é a interface visível. Mas o sistema por baixo agora precisa analisar, gerar, recuperar e entregar. Nesse ponto, o produto já se comporta mais como um agente com uma camada de capacidades ao redor.",
  triggerCards: [
    {
      title: "O assistente precisa inspecionar o que o usuário vê",
      body:
        "A linha muda rapidamente quando capturas de tela, diagramas ou fluxos gravados entram na tarefa. Agora o sistema precisa de entendimento de imagem ou análise de vídeo, não só de geração de texto.",
    },
    {
      title: "A tarefa depende de contexto web ao vivo",
      body:
        "Um chatbot SaaS pode responder a partir de uma camada estática de conhecimento. Um sistema de agente precisa de busca web, crawl e coleta de evidências quando a resposta depende de informação externa atual.",
    },
    {
      title: "O fluxo precisa criar mídia",
      body:
        "Se o assistente precisa gerar visuais de lançamento, clipes demo ou assets criativos, o produto já não é apenas conversacional. Ele precisa de geração de mídia como capacidade de primeira classe.",
    },
    {
      title: "A saída precisa sair do chat",
      body:
        "Os times sentem a mudança de arquitetura quando o resultado precisa virar um arquivo, um link compartilhável ou uma página publicada. Nesse ponto, a conversa é só uma camada do sistema.",
    },
  ],
  capabilityLabel: "Onde o AnyCap entra",
  capabilityTitle: "O AnyCap é o runtime de capacidades ao redor da stack de assistente, não o produto chatbot",
  capabilityIntro:
    "Essa distinção é o que torna essa busca útil para o AnyCap sem forçar um posicionamento errado. O AnyCap é relevante quando o time SaaS mantém a superfície de agente ou assistente que já escolheu, mas precisa de uma forma consistente de adicionar fluxos de imagem, vídeo, visão, web e artefatos ao redor dela.",
  capabilityCards: [
    { title: "Entendimento de imagem", href: "/capabilities/image-understanding", body: "Leia capturas de tela, referências e inputs de QA visual quando um chatbot simples só poderia adivinhar." },
    { title: "Geração de vídeo", href: "/capabilities/video-generation", body: "Crie clipes de produto e demos curtos em vez de parar em instruções de texto sobre o que fazer." },
    { title: "Busca web", href: "/capabilities/web-search", body: "Puxe contexto externo ao vivo quando a resposta não pode vir só dos docs internos." },
    { title: "Crawl web", href: "/capabilities/web-crawl", body: "Transforme páginas em markdown útil ou entradas estruturadas para fluxos de agente." },
    { title: "Drive", href: "/capabilities/drive", body: "Leve o resultado de um fluxo interno para um artefato compartilhável que uma pessoa consiga abrir." },
  ],
  architectureLabel: "Leitura prática",
  architectureTitle: "Três arquiteturas SaaS comuns por trás da busca",
  architectureCards: [
    {
      title: "Assistente de suporte ao cliente",
      label: "Ainda um chatbot",
      body:
        "O produto responde perguntas conhecidas, cita conteúdo da central de ajuda e talvez abre um ticket. Esse é um padrão clássico de chatbot SaaS porque a saída ainda é conversa mais roteamento.",
    },
    {
      title: "Copilot de produto para operadores",
      label: "Entrando em território de agente",
      body:
        "Agora o sistema precisa ler capturas, comparar fluxos, pesquisar docs ao vivo e explicar o que mudou. Isso já não é só chat. É um fluxo de agente com execução de ferramentas e coleta de evidências.",
    },
    {
      title: "Assistente de growth ou conteúdo",
      label: "Precisa de runtime de capacidades",
      body:
        "Se o produto transforma pedidos em imagens, vídeos, notas de pesquisa e saídas compartilháveis, a arquitetura vencedora normalmente é uma camada de chat ou comando mais um runtime capaz de gerar, inspecionar e entregar resultados.",
    },
  ],
  selectionLabel: "Como escolher",
  selectionTitle: 'Faça uma pergunta melhor do que "devo construir um chatbot SaaS?"',
  selectionRows: [
    {
      question: "Quando devo ficar com um chatbot de IA SaaS?",
      answer:
        "Fique com o modelo de chatbot quando o trabalho principal for conversa, recuperação e suporte limitado. Se o produto vence por ser rápido, amigável e confiável dentro de uma única superfície de chat, não complique demais cedo demais.",
    },
    {
      question: "Quando devo migrar para um agente de IA para SaaS?",
      answer:
        "Migre para uma arquitetura de agente quando o fluxo precisa de ferramentas, arquivos, contexto web ao vivo, análise multimodal ou entregáveis fora da conversa. Esses são sinais de que o produto saiu de responder para fazer.",
    },
    {
      question: "Onde o AnyCap entra nessa stack?",
      answer:
        "O AnyCap é o runtime de capacidades ao redor da camada de assistente ou agente. O papel dele é ajudar o sistema a gerar mídia, entender mídia, usar capacidades web e entregar saídas por meio de uma única CLI e uma única superfície de capacidades.",
    },
  ],
  nextMoveLabel: "Próximos melhores passos",
  nextMoveTitle: "Continue desta página-ponte para o restante do site",
  nextMoveCards: [
    {
      title: "Veja primeiro a lacuna de capacidade",
      href: "/learn/what-agents-cant-do",
      body: "Use esta página se a pergunta real é o que quebra primeiro quando um assistente precisa fazer mais do que conversar.",
    },
    {
      title: "Veja a versão de agente de código",
      href: "/learn/best-ai-for-coding-agents",
      body: "Use esta página se a mesma pergunta de stack está aparecendo dentro de agentes de código e não em uma superfície SaaS.",
    },
    {
      title: "Adicionar capacidades multimodais",
      href: "/learn/add-multimodal-capabilities-to-saas-chatbot",
      body: "Use esta página se você já passou da fase de definição e quer o padrão de implementação para um assistente SaaS mais rico.",
    },
    {
      title: "Navegar pelo hub de capacidades",
      href: "/capabilities",
      body: "Use Capacidades quando quiser as superfícies concretas de produto que ficam ao redor do fluxo do agente.",
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
      question: "Um chatbot de IA SaaS é a mesma coisa que um agente de IA para SaaS?",
      answer:
        "Não. Eles se sobrepõem, mas resolvem camadas diferentes do problema. Um chatbot SaaS centraliza a conversa. Um sistema de agente centraliza a conclusão de tarefas por meio de ferramentas, contexto e saídas.",
    },
    {
      question: "Um chatbot pode chamar ferramentas e ainda ser chatbot?",
      answer:
        "Sim, até certo ponto. Mas quando o uso de ferramentas vira a principal forma de sucesso do produto, a arquitetura já está agindo mais como um sistema de agente do que como um chatbot simples.",
    },
    {
      question: "Quando um chatbot SaaS precisa de capacidades multimodais?",
      answer:
        "Normalmente acontece quando usuários começam a trazer capturas de tela, diagramas ou gravações para o fluxo, ou quando o sistema precisa criar imagens e vídeos em vez de apenas responder com texto.",
    },
    {
      question: "O AnyCap é a camada de chatbot nesta comparação?",
      answer:
        "Não. O AnyCap é o runtime de capacidades ao redor do assistente ou agente. Ele ajuda o sistema a gerar, inspecionar, pesquisar, rastrear e entregar saídas, enquanto a experiência de chatbot ou agente pode continuar na interface que você já usa.",
    },
  ],
};

const id = en;

const contentByLocale: Record<SiteLocale, PageData> = {
  en,
  "pt-br": ptBr,
  id,
};

export function getAIChatbotVsAIAgentForSaaSMetadata(locale: SiteLocale): Metadata {
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

export function getAIChatbotVsAIAgentForSaaSPageData(locale: SiteLocale) {
  return contentByLocale[locale] ?? contentByLocale.en;
}
