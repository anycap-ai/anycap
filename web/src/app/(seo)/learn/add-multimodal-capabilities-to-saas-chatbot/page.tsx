import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { FadeIn } from "@/components/ui/FadeIn";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { createFaqPageJsonLd, createTechArticleJsonLd } from "@/lib/schema";
import { createLocalizedMetadataForPath } from "@/lib/localized-metadata";
import { getRequestLocale } from "@/lib/request-locale";
import { defaultLocale, type SiteLocale } from "@/lib/site";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;
const PATH = "/learn/add-multimodal-capabilities-to-saas-chatbot";
const lastUpdatedIso = "2026-04-07";

type FaqItem = {
  question: string;
  answer: string;
};

type ListCard = {
  title: string;
  body: string;
};

type StackStep = {
  title: string;
  body: string;
};

type RolloutStep = {
  step: string;
  title: string;
  body: string;
};

type TradeoffRow = {
  dimension: string;
  boltOn: string;
  runtime: string;
};

type LinkCard = {
  title: string;
  href: string;
  body: string;
};

type PageContent = {
  eyebrow: string;
  title: [string, string];
  intro: string;
  updatedPrefix: string;
  updatedLabel: string;
  summaryEyebrow: string;
  summaryTitle: string;
  summaryBody: string;
  quickTakeawaysEyebrow: string;
  quickTakeaways: readonly string[];
  multimodalEyebrow: string;
  multimodalTitle: string;
  modalityCards: readonly ListCard[];
  stackEyebrow: string;
  stackTitle: string;
  stackIntro: string;
  stackLayers: readonly StackStep[];
  rolloutEyebrow: string;
  rolloutTitle: string;
  rolloutSteps: readonly RolloutStep[];
  avoidEyebrow: string;
  avoidTitle: string;
  tradeoffHeaders: [string, string, string];
  tradeoffRows: readonly TradeoffRow[];
  productEyebrow: string;
  productTitle: string;
  useCaseCards: readonly ListCard[];
  fitEyebrow: string;
  fitTitle: string;
  fitBody: string;
  capabilityCards: readonly LinkCard[];
  nextMoveEyebrow: string;
  nextMoveTitle: string;
  nextMoveCards: readonly LinkCard[];
  faqEyebrow: string;
  faqTitle: string;
  faqItems: readonly FaqItem[];
  breadcrumbHome: string;
  breadcrumbSection: string;
  breadcrumbLabel: string;
  articleHeadline: string;
  articleDescription: string;
  articleAbout: readonly string[];
  articleKeywords: readonly string[];
};

const contentByLocale: Record<"en" | "pt-br" | "id", PageContent> = {
  en: {
    eyebrow: "Learn",
    title: ["Add multimodal capabilities", "to a SaaS chatbot"],
    intro:
      "Many SaaS chatbots feel useful until the user drops in a screenshot, asks for live external context, or expects the system to return an actual asset instead of a text answer. That is the point where prompt tuning stops being enough. You need a cleaner capability layer around the chatbot workflow.",
    updatedPrefix: "Last updated",
    updatedLabel: "April 7, 2026",
    summaryEyebrow: "Answer-first summary",
    summaryTitle:
      "The cleanest path is not more prompt complexity. It is a runtime that adds the missing powers.",
    summaryBody:
      "In practice, most teams should keep the chat experience they already have and add capabilities around it in a sane order: visual understanding first, live web retrieval second, media generation only when the product truly needs it, and a delivery layer so outputs can leave the chat thread. That is where a capability runtime becomes more useful than another patchwork provider integration.",
    quickTakeawaysEyebrow: "Key points",
    quickTakeaways: [
      "Add multimodal capability in layers, not as random one-off provider calls.",
      "Start with the user inputs and outputs that create the most friction: screenshots, web context, media generation, and shareable deliverables.",
      "The clean pattern is chat interface plus orchestration plus a capability runtime plus an output layer.",
    ],
    multimodalEyebrow: "What multimodal means",
    multimodalTitle: "A multimodal chatbot does not just talk. It can inspect, retrieve, create, and deliver.",
    modalityCards: [
      {
        title: "Image understanding",
        body: "The chatbot can inspect screenshots, diagrams, product UI states, and visual references instead of forcing the user to describe everything in text.",
      },
      {
        title: "Video understanding",
        body: "The system can reason over screen recordings, demos, and short clips when the problem is temporal rather than static.",
      },
      {
        title: "Media generation",
        body: "The workflow can return images or videos as outputs when the user wants assets, not only written advice about what to create.",
      },
      {
        title: "Web context",
        body: "The assistant can pull in live external information through search and crawl instead of relying only on your internal knowledge layer.",
      },
    ],
    stackEyebrow: "Stack pattern",
    stackTitle: "The implementation pattern is simple: keep the chat layer and upgrade the system around it",
    stackIntro:
      "SaaS teams often over-focus on the interface and under-plan the execution path. A cleaner system separates the visible conversation from the orchestration logic, the capability runtime, and the output layer. That gives you a product that can grow without turning every new modality into another exception branch.",
    stackLayers: [
      {
        title: "Chat surface",
        body: "Keep the interface your users already understand. The chat layer gathers the request, clarifies intent, and shows progress and outputs.",
      },
      {
        title: "Orchestration layer",
        body: "This is where you decide which tool or capability to call, how to keep state, and when to ask follow-up questions before the task runs.",
      },
      {
        title: "Capability runtime",
        body: "This layer handles the actual powers around the model: image and video generation, image and video understanding, web search, crawl, and output delivery.",
      },
      {
        title: "Delivery layer",
        body: "The final output often needs to leave the chat thread as a file, a share link, or a published page. Plan for that from the start instead of treating it as an afterthought.",
      },
    ],
    rolloutEyebrow: "Rollout order",
    rolloutTitle: "Add capabilities in the order that removes the most user friction",
    rolloutSteps: [
      {
        step: "Step 1",
        title: "Start with the highest-friction user input",
        body: "For many SaaS assistants, the first broken experience is a screenshot. Users upload a UI image or error screen, and the chatbot cannot see what they mean. That makes image understanding the cleanest first capability to add.",
      },
      {
        step: "Step 2",
        title: "Add live web retrieval for changing information",
        body: "If the answer depends on current docs, pricing, competitor pages, or external references, static retrieval is not enough. Add search and crawl before you add more prompt engineering.",
      },
      {
        step: "Step 3",
        title: "Add generation only when the product must return assets",
        body: "Image and video generation are powerful, but they should come after you know the user really expects media output. Otherwise you add cost and complexity before the product needs it.",
      },
      {
        step: "Step 4",
        title: "Add a real output path",
        body: "Once the assistant returns richer results, users need links, files, or hosted pages. Plan the delivery layer early so the workflow can end in something usable instead of a long chat transcript.",
      },
    ],
    avoidEyebrow: "What to avoid",
    avoidTitle: "Random bolt-on integrations create product debt faster than they create value",
    tradeoffHeaders: ["Dimension", "Bolt-on pattern", "Capability runtime pattern"],
    tradeoffRows: [
      {
        dimension: "Integration pattern",
        boltOn: "Each new modality becomes its own provider-specific exception.",
        runtime: "Capabilities sit behind one consistent runtime surface.",
      },
      {
        dimension: "Prompt design",
        boltOn: "Prompts keep absorbing system complexity and edge cases.",
        runtime: "Prompts stay focused on intent while the runtime handles tool execution.",
      },
      {
        dimension: "Operational overhead",
        boltOn: "Teams manage separate APIs, auth flows, and response formats.",
        runtime: "The assistant can reuse one capability layer across workflows.",
      },
      {
        dimension: "Product consistency",
        boltOn: "The user experience feels different every time a new tool path appears.",
        runtime: "The assistant behaves like one system even as capabilities expand.",
      },
      {
        dimension: "Output delivery",
        boltOn: "Results often die inside the chat thread.",
        runtime: "Results can move into files, links, or publishable artifacts.",
      },
    ],
    productEyebrow: "Product examples",
    productTitle: "Three common places the feature request becomes an architecture change",
    useCaseCards: [
      {
        title: "Support screenshot triage",
        body: "Users send screenshots of broken UI states. The assistant reads the image, matches it to known product patterns, and returns a grounded answer instead of generic troubleshooting text.",
      },
      {
        title: "Customer success research assistant",
        body: "The workflow searches live help docs or external resources, crawls the useful pages, and summarizes what changed for the operator who asked the question.",
      },
      {
        title: "Growth or launch assistant",
        body: "The product turns requests into launch visuals, demo clips, and shareable deliverables rather than stopping at a list of recommendations.",
      },
    ],
    fitEyebrow: "Where AnyCap fits",
    fitTitle: "AnyCap gives the chatbot or agent the capability layer around the model",
    fitBody:
      "That is the practical implementation point for this page. You do not need to rename your product or rebuild the interface just to add richer behavior. You need a runtime that can handle multimodal input, multimodal output, live web tasks, and delivery workflows through one consistent surface.",
    capabilityCards: [
      {
        title: "Image understanding",
        href: "/capabilities/image-understanding",
        body: "Read screenshots, diagrams, and visual references through the same workflow.",
      },
      {
        title: "Video analysis",
        href: "/capabilities/video-analysis",
        body: "Inspect recordings when the problem depends on sequence and motion.",
      },
      {
        title: "Web search",
        href: "/capabilities/web-search",
        body: "Pull in live information when the knowledge layer alone is not enough.",
      },
      {
        title: "Web crawl",
        href: "/capabilities/web-crawl",
        body: "Convert web pages into usable markdown or structured agent context.",
      },
      {
        title: "Image generation",
        href: "/capabilities/image-generation",
        body: "Return visual assets when the product must create rather than only explain.",
      },
      {
        title: "Drive",
        href: "/capabilities/drive",
        body: "Turn rich outputs into shareable files and links a human can actually use.",
      },
    ],
    nextMoveEyebrow: "Best next moves",
    nextMoveTitle: "Keep moving from architecture into product pages and setup",
    nextMoveCards: [
      {
        title: "See the architecture decision first",
        href: "/learn/ai-chatbot-vs-ai-agent-for-saas",
        body: "Use this page if you still need to clarify whether the product is really a chatbot or an agent workflow.",
      },
      {
        title: "Map the capability gap",
        href: "/learn/what-agents-cant-do",
        body: "Use this page if you want the shortest explanation of what breaks first when chat alone is not enough.",
      },
      {
        title: "Browse capability surfaces",
        href: "/capabilities",
        body: "Use Capabilities when you want the concrete product pages behind the stack pattern described here.",
      },
      {
        title: "Take the install path",
        href: "/guides/install-anycap",
        body: "Use the install guide when you are ready to move from architecture planning into setup.",
      },
    ],
    faqEyebrow: "FAQ",
    faqTitle: "Common implementation questions",
    faqItems: [
      {
        question: "What does multimodal mean for a SaaS chatbot?",
        answer:
          "It means the system can work with more than text. In practice that usually includes screenshots, images, videos, live web pages, and richer output formats such as files or shared links.",
      },
      {
        question: "Should I add every modality at once?",
        answer:
          "No. Start with the input or output that creates the most user friction. For many SaaS products that means screenshot understanding first, then live web context, then media generation if the product truly needs it.",
      },
      {
        question: "Can I keep my current chatbot experience and still add these capabilities?",
        answer:
          "Yes. That is usually the best route. Keep the interface and orchestration you already like, then add a runtime that gives the system the missing capabilities around it.",
      },
      {
        question: "Where does AnyCap fit in this implementation pattern?",
        answer:
          "AnyCap fits as the capability runtime. It gives the assistant image, video, web, storage, and delivery workflows through one capability surface instead of many unrelated integrations.",
      },
    ],
    breadcrumbHome: "Home",
    breadcrumbSection: "Learn",
    breadcrumbLabel: "Add multimodal capabilities to a SaaS chatbot",
    articleHeadline: "How to add multimodal capabilities to a SaaS chatbot",
    articleDescription:
      "Implementation-focused guide for SaaS teams extending a chatbot with image, video, web, and delivery workflows through a capability runtime.",
    articleAbout: [
      "Multimodal AI",
      "AI chatbot SaaS",
      "SaaS architecture",
      "AI agents",
      "Agent capability runtime",
    ],
    articleKeywords: [
      "multimodal chatbot",
      "saas chatbot",
      "add multimodal capabilities to chatbot",
      "multimodal ai chatbot saas",
      "chatbot with image and video support",
    ],
  },
  "pt-br": {
    eyebrow: "Guias",
    title: ["Adicione capacidades multimodais", "a um chatbot SaaS"],
    intro:
      "Muitos chatbots SaaS parecem uteis ate o usuario enviar uma captura de tela, pedir contexto web em tempo real, ou esperar que o sistema devolva um arquivo real em vez de uma resposta de texto. Nesse ponto, ajustar o prompt deixa de ser suficiente. Voce precisa de uma camada de capacidades mais limpa ao redor do fluxo do chatbot.",
    updatedPrefix: "Ultima atualizacao em",
    updatedLabel: "7 de abril de 2026",
    summaryEyebrow: "Resumo direto",
    summaryTitle:
      "O caminho mais limpo nao e aumentar a complexidade do prompt. E usar um runtime que acrescente as capacidades que faltam.",
    summaryBody:
      "Na pratica, a maioria das equipes deve manter a experiencia de chat que ja possui e adicionar capacidades ao redor dela em uma ordem sensata: primeiro entendimento visual, depois recuperacao web ao vivo, geracao de midia somente quando o produto realmente precisar disso, e uma camada de entrega para que os resultados saiam da conversa. E ai que um runtime de capabilities passa a ser mais util do que outra integracao improvisada de fornecedor.",
    quickTakeawaysEyebrow: "Pontos-chave",
    quickTakeaways: [
      "Adicione capacidade multimodal em camadas, nao como chamadas soltas e aleatorias de fornecedores.",
      "Comece pelas entradas e saidas do usuario que criam mais friccao: capturas de tela, contexto web, geracao de midia e entregas compartilhaveis.",
      "O padrao limpo e interface de chat + orquestracao + runtime de capacidades + camada de saida.",
    ],
    multimodalEyebrow: "O que multimodal significa",
    multimodalTitle: "Um chatbot multimodal nao apenas conversa. Ele pode inspecionar, recuperar, criar e entregar.",
    modalityCards: [
      {
        title: "Entendimento de imagem",
        body: "O chatbot pode inspecionar capturas de tela, diagramas, estados de UI do produto e referencias visuais em vez de obrigar o usuario a descrever tudo em texto.",
      },
      {
        title: "Entendimento de video",
        body: "O sistema pode raciocinar sobre gravacoes de tela, demos e clipes curtos quando o problema e temporal, nao estatistico.",
      },
      {
        title: "Geracao de midia",
        body: "O fluxo pode devolver imagens ou videos como saida quando o usuario quer assets, e nao apenas orientacao escrita sobre o que criar.",
      },
      {
        title: "Contexto web",
        body: "O assistente pode puxar informacao externa ao vivo via search e crawl em vez de depender apenas da camada interna de conhecimento.",
      },
    ],
    stackEyebrow: "Padrao de stack",
    stackTitle: "A implementacao e simples: mantenha a camada de chat e evolua o sistema ao redor dela",
    stackIntro:
      "Times de SaaS costumam focar demais na interface e planejar de menos o caminho de execucao. Um sistema mais limpo separa a conversa visivel da logica de orquestracao, do runtime de capacidades e da camada de entrega. Isso cria um produto que pode crescer sem transformar cada nova modalidade em outro ramo de excecao.",
    stackLayers: [
      {
        title: "Superficie de chat",
        body: "Mantenha a interface que seus usuarios ja entendem. A camada de chat coleta a solicitacao, esclarece a intencao e mostra progresso e saidas.",
      },
      {
        title: "Camada de orquestracao",
        body: "Aqui voce decide qual ferramenta ou capability chamar, como manter o estado e quando fazer perguntas de acompanhamento antes da tarefa rodar.",
      },
      {
        title: "Runtime de capacidades",
        body: "Essa camada lida com os poderes reais ao redor do modelo: geracao de imagem e video, entendimento de imagem e video, search web, crawl e entrega de saida.",
      },
      {
        title: "Camada de entrega",
        body: "A saida final muitas vezes precisa sair do chat como arquivo, link compartilhavel ou pagina publicada. Planeje isso desde o inicio em vez de tratar como algo secundario.",
      },
    ],
    rolloutEyebrow: "Ordem de rollout",
    rolloutTitle: "Adicione capacidades na ordem que remove mais friccao do usuario",
    rolloutSteps: [
      {
        step: "Etapa 1",
        title: "Comece pela entrada de usuario com maior friccao",
        body: "Para muitos assistentes SaaS, a primeira experiencia quebrada e uma captura de tela. O usuario envia uma imagem da interface ou uma tela de erro, e o chatbot nao consegue ver o que ele quer dizer. Isso faz do entendimento de imagem a primeira capability mais limpa para adicionar.",
      },
      {
        step: "Etapa 2",
        title: "Adicione recuperacao web ao vivo para informacoes que mudam",
        body: "Se a resposta depende de docs atuais, precos, paginas de concorrentes ou referencias externas, a recuperacao estatica nao basta. Adicione search e crawl antes de adicionar mais engenharia de prompt.",
      },
      {
        step: "Etapa 3",
        title: "Adicione geracao apenas quando o produto precisar devolver assets",
        body: "Geracao de imagem e video e poderosa, mas deve vir depois de voce saber que o usuario realmente espera saida de midia. Caso contrario, voce adiciona custo e complexidade antes de o produto precisar disso.",
      },
      {
        step: "Etapa 4",
        title: "Adicione um caminho real de saida",
        body: "Quando o assistente retorna resultados mais ricos, os usuarios precisam de links, arquivos ou paginas hospedadas. Planeje a camada de entrega cedo para que o fluxo termine em algo utilizavel, e nao em um transcript longo de chat.",
      },
    ],
    avoidEyebrow: "O que evitar",
    avoidTitle: "Integracoes improvisadas criam divida de produto mais rapido do que geram valor",
    tradeoffHeaders: ["Dimensao", "Padrao bolt-on", "Padrao runtime de capacidades"],
    tradeoffRows: [
      {
        dimension: "Padrao de integracao",
        boltOn: "Cada nova modalidade vira sua propria excecao especifica de fornecedor.",
        runtime: "As capacidades ficam atras de uma superficie de runtime consistente.",
      },
      {
        dimension: "Design de prompt",
        boltOn: "Os prompts continuam absorvendo a complexidade do sistema e os casos de borda.",
        runtime: "Os prompts ficam focados na intencao enquanto o runtime cuida da execucao das ferramentas.",
      },
      {
        dimension: "Overhead operacional",
        boltOn: "Os times gerenciam APIs, fluxos de auth e formatos de resposta separados.",
        runtime: "O assistente consegue reutilizar uma unica camada de capacidades em varios fluxos.",
      },
      {
        dimension: "Consistencia do produto",
        boltOn: "A experiencia parece diferente toda vez que surge um novo caminho de ferramenta.",
        runtime: "O assistente se comporta como um unico sistema mesmo quando as capacidades aumentam.",
      },
      {
        dimension: "Entrega de saida",
        boltOn: "Os resultados muitas vezes morrem dentro do chat.",
        runtime: "Os resultados podem ir para arquivos, links ou artefatos publicaveis.",
      },
    ],
    productEyebrow: "Exemplos de produto",
    productTitle: "Tres lugares comuns em que a feature request vira uma mudanca de arquitetura",
    useCaseCards: [
      {
        title: "Triagem de capturas de tela do suporte",
        body: "Usuarios enviam capturas de tela de estados de UI quebrados. O assistente le a imagem, compara com padroes conhecidos do produto e devolve uma resposta fundamentada em vez de um texto generico de troubleshooting.",
      },
      {
        title: "Assistente de pesquisa para customer success",
        body: "O fluxo pesquisa docs de ajuda ao vivo ou recursos externos, faz crawl das paginas uteis e resume o que mudou para o operador que fez a pergunta.",
      },
      {
        title: "Assistente de crescimento ou lancamento",
        body: "O produto transforma pedidos em visuais de lancamento, clipes de demo e entregas compartilhaveis, em vez de parar em uma lista de recomendacoes.",
      },
    ],
    fitEyebrow: "Onde o AnyCap entra",
    fitTitle: "O AnyCap oferece ao chatbot ou ao agente a camada de capacidades ao redor do modelo",
    fitBody:
      "Esse e o ponto pratico de implementacao desta pagina. Voce nao precisa renomear o produto nem reconstruir a interface so para adicionar comportamento mais rico. Voce precisa de um runtime que consiga lidar com entrada multimodal, saida multimodal, tarefas web ao vivo e fluxos de entrega por uma superficie consistente.",
    capabilityCards: [
      {
        title: "Entendimento de imagem",
        href: "/capabilities/image-understanding",
        body: "Leia capturas de tela, diagramas e referencias visuais no mesmo fluxo.",
      },
      {
        title: "Analise de video",
        href: "/capabilities/video-analysis",
        body: "Inspecione gravacoes quando o problema depender de sequencia e movimento.",
      },
      {
        title: "Search web",
        href: "/capabilities/web-search",
        body: "Puxe informacao ao vivo quando a camada de conhecimento sozinha nao for suficiente.",
      },
      {
        title: "Crawl web",
        href: "/capabilities/web-crawl",
        body: "Converta paginas web em markdown util ou em contexto estruturado para o agente.",
      },
      {
        title: "Geracao de imagem",
        href: "/capabilities/image-generation",
        body: "Entregue assets visuais quando o produto precisar criar, e nao apenas explicar.",
      },
      {
        title: "Drive",
        href: "/capabilities/drive",
        body: "Transforme saidas ricas em arquivos e links compartilhaveis que uma pessoa realmente possa usar.",
      },
    ],
    nextMoveEyebrow: "Proximos passos",
    nextMoveTitle: "Continue da arquitetura para as paginas de produto e para a configuracao",
    nextMoveCards: [
      {
        title: "Veja a decisao de arquitetura primeiro",
        href: "/learn/ai-chatbot-vs-ai-agent-for-saas",
        body: "Use esta pagina se ainda precisar esclarecer se o produto e realmente um chatbot ou um workflow de agente.",
      },
      {
        title: "Mapeie a lacuna de capacidades",
        href: "/learn/what-agents-cant-do",
        body: "Use esta pagina se quiser a explicacao mais curta sobre o que quebra primeiro quando o chat sozinho nao basta.",
      },
      {
        title: "Explore as capabilities",
        href: "/capabilities",
        body: "Use Capabilities quando quiser ver as paginas concretas de produto por tras do padrao de stack descrito aqui.",
      },
      {
        title: "Siga o caminho de instalacao",
        href: "/guides/install-anycap",
        body: "Use o guia de instalacao quando estiver pronto para sair do planejamento de arquitetura e partir para a configuracao.",
      },
    ],
    faqEyebrow: "FAQ",
    faqTitle: "Perguntas comuns de implementacao",
    faqItems: [
      {
        question: "O que multimodal significa para um chatbot SaaS?",
        answer:
          "Significa que o sistema pode trabalhar com mais do que texto. Na pratica, isso normalmente inclui capturas de tela, imagens, videos, paginas web ao vivo e formatos de saida mais ricos, como arquivos ou links compartilhados.",
      },
      {
        question: "Devo adicionar todas as modalidades de uma vez?",
        answer:
          "Nao. Comece pela entrada ou saida que cria mais friccao para o usuario. Para muitos produtos SaaS isso significa entender capturas de tela primeiro, depois contexto web ao vivo, e so entao geracao de midia se o produto realmente precisar disso.",
      },
      {
        question: "Posso manter a experiencia atual do chatbot e ainda adicionar essas capacidades?",
        answer:
          "Sim. Normalmente esse e o melhor caminho. Mantenha a interface e a orquestracao que ja fazem sentido para voce e depois adicione um runtime que entregue ao sistema as capacidades que faltam ao redor dele.",
      },
      {
        question: "Onde o AnyCap entra nesse padrao de implementacao?",
        answer:
          "O AnyCap entra como o runtime de capacidades. Ele oferece ao assistente fluxos de imagem, video, web, storage e entrega por uma unica superficie de capabilities, em vez de muitas integracoes sem relacao entre si.",
      },
    ],
    breadcrumbHome: "Inicio",
    breadcrumbSection: "Guias",
    breadcrumbLabel: "Adicionar capacidades multimodais a um chatbot SaaS",
    articleHeadline: "Como adicionar capacidades multimodais a um chatbot SaaS",
    articleDescription:
      "Guia pratico para equipes SaaS que estendem um chatbot com fluxos de imagem, video, web e entrega por meio de um runtime de capacidades.",
    articleAbout: [
      "IA multimodal",
      "Chatbot SaaS de IA",
      "Arquitetura SaaS",
      "Agentes de IA",
      "Runtime de capabilities",
    ],
    articleKeywords: [
      "multimodal chatbot",
      "saas chatbot",
      "adicionar capacidades multimodais ao chatbot",
      "chatbot ia multimodal saas",
      "chatbot com suporte a imagem e video",
    ],
  },
  id: {
    eyebrow: "Panduan",
    title: ["Tambahkan kapabilitas multimodal", "ke chatbot SaaS"],
    intro:
      "Banyak chatbot SaaS terasa cukup berguna sampai pengguna mengirim screenshot, meminta konteks web terkini, atau berharap sistem mengembalikan aset nyata alih-alih jawaban teks. Di titik itu, prompt tuning saja tidak cukup. Anda butuh lapisan kapabilitas yang lebih rapi di sekitar workflow chatbot.",
    updatedPrefix: "Terakhir diperbarui",
    updatedLabel: "7 April 2026",
    summaryEyebrow: "Ringkasan cepat",
    summaryTitle:
      "Jalan paling bersih bukan menambah kompleksitas prompt, melainkan menambahkan runtime untuk kemampuan yang belum ada.",
    summaryBody:
      "Dalam praktik, sebagian besar tim sebaiknya mempertahankan pengalaman chat yang sudah ada lalu menambahkan kapabilitas secara bertahap: mulai dari pemahaman visual, lanjutkan ke web retrieval live, tambah media generation hanya jika produk benar-benar membutuhkannya, lalu siapkan lapisan delivery agar output bisa keluar dari chat thread. Di titik ini capability runtime biasanya jauh lebih berguna daripada menempelkan integrasi provider satu per satu.",
    quickTakeawaysEyebrow: "Poin penting",
    quickTakeaways: [
      "Tambahkan kapabilitas multimodal secara berlapis, bukan lewat panggilan provider acak yang terpisah.",
      "Mulai dari input dan output yang paling sering bikin friksi: screenshot, konteks web, generasi media, dan hasil yang bisa dibagikan.",
      "Pola paling rapi adalah chat interface + orchestration + capability runtime + output layer.",
    ],
    multimodalEyebrow: "Arti multimodal",
    multimodalTitle: "Chatbot multimodal tidak hanya menjawab. Ia bisa membaca, mengambil, membuat, dan mengirim hasil.",
    modalityCards: [
      {
        title: "Pemahaman gambar",
        body: "Chatbot dapat memeriksa screenshot, diagram, state UI produk, dan referensi visual tanpa memaksa pengguna menjelaskan semuanya lewat teks.",
      },
      {
        title: "Pemahaman video",
        body: "Sistem dapat bernalar dari rekaman layar, demo, dan klip singkat saat masalahnya bergantung pada urutan waktu, bukan frame statis.",
      },
      {
        title: "Generasi media",
        body: "Workflow dapat mengembalikan gambar atau video sebagai output saat pengguna butuh aset, bukan sekadar saran tertulis.",
      },
      {
        title: "Konteks web",
        body: "Asisten dapat menarik informasi eksternal terbaru lewat search dan crawl, bukan hanya mengandalkan knowledge layer internal.",
      },
    ],
    stackEyebrow: "Pola stack",
    stackTitle: "Pola implementasinya sederhana: pertahankan chat layer, lalu upgrade sistem di sekelilingnya",
    stackIntro:
      "Tim SaaS sering terlalu fokus ke interface dan kurang merancang jalur eksekusi. Sistem yang lebih rapi memisahkan percakapan yang terlihat pengguna dari orchestration logic, capability runtime, dan output layer. Dengan begitu produk bisa tumbuh tanpa mengubah setiap modalitas baru menjadi cabang pengecualian.",
    stackLayers: [
      {
        title: "Permukaan chat",
        body: "Pertahankan interface yang sudah dipahami pengguna. Chat layer mengumpulkan permintaan, memperjelas intent, serta menampilkan progres dan hasil.",
      },
      {
        title: "Lapisan orkestrasi",
        body: "Di sini Anda menentukan tool atau kapabilitas mana yang dipanggil, bagaimana state disimpan, dan kapan perlu bertanya lanjutan sebelum task dijalankan.",
      },
      {
        title: "Capability runtime",
        body: "Lapisan ini menangani kemampuan inti di sekitar model: generasi gambar/video, pemahaman gambar/video, web search, web crawl, dan output delivery.",
      },
      {
        title: "Lapisan delivery",
        body: "Output akhir sering perlu keluar dari chat thread sebagai file, tautan share, atau halaman terbit. Rencanakan dari awal, jangan jadi tambahan belakangan.",
      },
    ],
    rolloutEyebrow: "Urutan rollout",
    rolloutTitle: "Tambahkan kapabilitas dalam urutan yang paling cepat menghilangkan friksi pengguna",
    rolloutSteps: [
      {
        step: "Langkah 1",
        title: "Mulai dari input pengguna yang paling bermasalah",
        body: "Untuk banyak asisten SaaS, kegagalan pertama muncul saat pengguna mengirim screenshot. Pengguna menunjukkan layar error atau UI, tetapi chatbot tidak bisa melihat konteksnya. Karena itu, pemahaman gambar biasanya jadi kapabilitas pertama yang paling tepat ditambahkan.",
      },
      {
        step: "Langkah 2",
        title: "Tambahkan web retrieval live untuk informasi yang cepat berubah",
        body: "Jika jawaban bergantung pada dokumentasi terbaru, harga, halaman kompetitor, atau referensi eksternal, retrieval statis tidak cukup. Tambahkan search dan crawl sebelum menambah prompt engineering.",
      },
      {
        step: "Langkah 3",
        title: "Tambahkan generation hanya jika produk memang perlu mengembalikan aset",
        body: "Image dan video generation sangat kuat, tetapi sebaiknya menyusul setelah jelas bahwa pengguna benar-benar mengharapkan output media. Kalau terlalu cepat, Anda menambah biaya dan kompleksitas sebelum dibutuhkan.",
      },
      {
        step: "Langkah 4",
        title: "Siapkan jalur output yang nyata",
        body: "Saat asisten mulai mengembalikan hasil yang lebih kaya, pengguna butuh link, file, atau halaman host. Rancang output layer lebih awal agar alur berakhir pada hasil yang benar-benar bisa dipakai.",
      },
    ],
    avoidEyebrow: "Yang perlu dihindari",
    avoidTitle: "Integrasi tempelan acak lebih cepat menambah utang produk daripada menambah nilai",
    tradeoffHeaders: ["Dimensi", "Pola bolt-on", "Pola capability runtime"],
    tradeoffRows: [
      {
        dimension: "Pola integrasi",
        boltOn: "Setiap modalitas baru menjadi pengecualian spesifik provider.",
        runtime: "Semua kapabilitas berada di belakang satu runtime surface yang konsisten.",
      },
      {
        dimension: "Desain prompt",
        boltOn: "Prompt terus menanggung kompleksitas sistem dan edge case.",
        runtime: "Prompt tetap fokus ke intent, sementara runtime menangani eksekusi tool.",
      },
      {
        dimension: "Overhead operasional",
        boltOn: "Tim harus mengelola API, auth flow, dan format respons yang terpisah.",
        runtime: "Asisten dapat memakai ulang satu lapisan kapabilitas di banyak workflow.",
      },
      {
        dimension: "Konsistensi produk",
        boltOn: "Pengalaman pengguna terasa berbeda setiap kali jalur tool baru ditambahkan.",
        runtime: "Asisten tetap terasa sebagai satu sistem walau kapabilitas terus bertambah.",
      },
      {
        dimension: "Delivery output",
        boltOn: "Hasil sering berhenti di chat thread.",
        runtime: "Hasil bisa bergerak ke file, link, atau artefak terbit.",
      },
    ],
    productEyebrow: "Contoh produk",
    productTitle: "Tiga kasus umum saat request fitur berubah menjadi keputusan arsitektur",
    useCaseCards: [
      {
        title: "Triase screenshot untuk support",
        body: "Pengguna mengirim screenshot UI yang bermasalah. Asisten membaca gambar, mencocokkan dengan pola produk, lalu memberi jawaban yang lebih relevan dibanding troubleshooting generik.",
      },
      {
        title: "Asisten riset untuk customer success",
        body: "Workflow melakukan pencarian ke docs bantuan live atau sumber eksternal, crawl halaman penting, lalu merangkum perubahan untuk operator.",
      },
      {
        title: "Asisten growth atau launch",
        body: "Produk mengubah permintaan menjadi visual launch, klip demo, dan output yang bisa dibagikan, bukan berhenti di daftar rekomendasi.",
      },
    ],
    fitEyebrow: "Posisi AnyCap",
    fitTitle: "AnyCap memberi chatbot atau agen lapisan kapabilitas di sekitar model",
    fitBody:
      "Inilah titik implementasi praktis dari halaman ini. Anda tidak perlu mengganti nama produk atau membangun ulang interface hanya untuk menambah perilaku yang lebih kaya. Anda butuh runtime yang mampu menangani input multimodal, output multimodal, tugas web live, dan workflow delivery lewat satu surface yang konsisten.",
    capabilityCards: [
      {
        title: "Pemahaman gambar",
        href: "/capabilities/image-understanding",
        body: "Baca screenshot, diagram, dan referensi visual dalam workflow yang sama.",
      },
      {
        title: "Analisis video",
        href: "/capabilities/video-analysis",
        body: "Periksa rekaman saat masalah bergantung pada urutan dan pergerakan.",
      },
      {
        title: "Web search",
        href: "/capabilities/web-search",
        body: "Tarik informasi live saat knowledge layer internal saja belum cukup.",
      },
      {
        title: "Web crawl",
        href: "/capabilities/web-crawl",
        body: "Ubah halaman web menjadi markdown yang bisa dipakai atau konteks agen terstruktur.",
      },
      {
        title: "Generasi gambar",
        href: "/capabilities/image-generation",
        body: "Kembalikan aset visual saat produk harus membuat, bukan hanya menjelaskan.",
      },
      {
        title: "Drive",
        href: "/capabilities/drive",
        body: "Ubah output kaya menjadi file dan link shareable yang benar-benar bisa dipakai manusia.",
      },
    ],
    nextMoveEyebrow: "Langkah lanjutan",
    nextMoveTitle: "Lanjutkan dari arsitektur ke halaman produk dan setup implementasi",
    nextMoveCards: [
      {
        title: "Cek keputusan arsitektur dulu",
        href: "/learn/ai-chatbot-vs-ai-agent-for-saas",
        body: "Gunakan halaman ini jika Anda masih perlu memastikan apakah produk Anda seharusnya chatbot biasa atau workflow agen.",
      },
      {
        title: "Petakan gap kapabilitas",
        href: "/learn/what-agents-cant-do",
        body: "Gunakan halaman ini untuk memahami dengan cepat titik kegagalan saat chat saja tidak lagi cukup.",
      },
      {
        title: "Lihat surface kapabilitas",
        href: "/capabilities",
        body: "Buka Capabilities saat Anda ingin melihat halaman produk konkret di balik pola stack pada panduan ini.",
      },
      {
        title: "Masuk ke jalur instalasi",
        href: "/guides/install-anycap",
        body: "Gunakan panduan instalasi saat Anda siap beralih dari keputusan arsitektur ke implementasi.",
      },
    ],
    faqEyebrow: "FAQ",
    faqTitle: "Pertanyaan implementasi yang sering muncul",
    faqItems: [
      {
        question: "Apa arti multimodal untuk chatbot SaaS?",
        answer:
          "Artinya sistem dapat bekerja dengan lebih dari teks. Biasanya ini mencakup screenshot, gambar, video, halaman web live, serta format output yang lebih kaya seperti file atau link share.",
      },
      {
        question: "Apakah semua modalitas harus ditambahkan sekaligus?",
        answer:
          "Tidak. Mulai dari input atau output yang paling menimbulkan friksi. Untuk banyak produk SaaS, urutannya biasanya pemahaman screenshot dulu, lalu konteks web live, lalu media generation jika memang dibutuhkan.",
      },
      {
        question: "Bisakah saya mempertahankan pengalaman chatbot sekarang sambil menambah kapabilitas ini?",
        answer:
          "Bisa, dan biasanya itu jalur terbaik. Pertahankan interface dan orkestrasi yang sudah cocok, lalu tambahkan runtime untuk mengisi kapabilitas yang masih kurang.",
      },
      {
        question: "Di pola implementasi ini, AnyCap berada di bagian mana?",
        answer:
          "AnyCap berada di capability runtime layer. Ia memberi alur gambar, video, web, storage, dan delivery lewat satu surface kapabilitas, bukan melalui banyak integrasi yang tidak saling terhubung.",
      },
    ],
    breadcrumbHome: "Beranda",
    breadcrumbSection: "Panduan",
    breadcrumbLabel: "Tambahkan kapabilitas multimodal ke chatbot SaaS",
    articleHeadline: "Cara menambahkan kapabilitas multimodal ke chatbot SaaS",
    articleDescription:
      "Panduan implementasi untuk tim SaaS yang ingin memperluas chatbot dengan workflow gambar, video, web, dan delivery melalui capability runtime.",
    articleAbout: [
      "AI multimodal",
      "Chatbot SaaS AI",
      "Arsitektur SaaS",
      "Agen AI",
      "Agent capability runtime",
    ],
    articleKeywords: [
      "multimodal chatbot",
      "chatbot saas",
      "menambahkan kapabilitas multimodal ke chatbot",
      "chatbot ai multimodal saas",
      "chatbot dengan dukungan gambar dan video",
    ],
  },
};

function getPageMetadata(locale: SiteLocale): Metadata {
  const content = contentByLocale[locale === "pt-br" ? "pt-br" : locale === "id" ? "id" : "en"];
  return createLocalizedMetadataForPath(locale, PATH, {
    title: content.articleHeadline,
    description: content.articleDescription,
  });
}

export const metadata: Metadata = getPageMetadata(defaultLocale);

function getArticleJsonLd(content: PageContent) {
  return createTechArticleJsonLd({
    headline: content.articleHeadline,
    description: content.articleDescription,
    path: PATH,
    about: [...content.articleAbout],
    keywords: [...content.articleKeywords],
    datePublished: lastUpdatedIso,
    dateModified: lastUpdatedIso,
  });
}

function BulletList({ items }: { items: readonly string[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-sm leading-6 text-[#4d5145] md:text-[15px]">
          <span className="mt-[8px] h-1.5 w-1.5 rounded-full bg-[#6b7d3a]" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default async function AddMultimodalCapabilitiesToSaaSChatbotPage() {
  const locale = await getRequestLocale();
  const content = contentByLocale[locale === "pt-br" ? "pt-br" : locale === "id" ? "id" : "en"];
  const articleJsonLd = getArticleJsonLd(content);
  const faqJsonLd = createFaqPageJsonLd([...content.faqItems]);

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: content.breadcrumbHome, href: "/" },
          { name: content.breadcrumbSection, href: "/learn", unlinkable: true },
          { name: content.breadcrumbLabel },
        ]}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <article className="px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-[1280px] py-12 md:py-20 lg:py-24">
          <FadeIn>
            <p className="mb-4 text-[11px] tracking-[0.8px] text-[#6b7d3a]" style={mono}>
              {content.eyebrow}
            </p>
            <p className="mb-3 text-[11px] tracking-[0.5px] text-[#5a5e52]" style={mono}>
              {content.updatedPrefix} {content.updatedLabel}
            </p>
            <h1 className="leading-[1.1] tracking-[-0.02em] text-[#1c1f17]" style={{ ...pixel, fontSize: "clamp(30px, 5.4vw, 68px)" }}>
              {content.title[0]}
              <br />
              {content.title[1]}
            </h1>
            <p className="mt-6 max-w-[860px] text-base leading-7 text-[#4d5145] md:text-lg">
              {content.intro}
            </p>
          </FadeIn>

          <FadeIn className="mt-10">
            <section className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.9fr)]">
              <div className="rounded-[28px] border border-[#d4dbb8] bg-[#fffffc]/80 p-8 md:p-10">
                <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                  {content.summaryEyebrow}
                </p>
                <h2 className="mt-4 text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                  {content.summaryTitle}
                </h2>
                <p className="mt-5 max-w-[740px] text-sm leading-6 text-[#4d5145] md:text-[15px]">
                  {content.summaryBody}
                </p>
              </div>

              <div className="rounded-[28px] border border-[#d4dbb8] bg-[#f7f8ef]/80 p-6 md:p-8">
                <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                  {content.quickTakeawaysEyebrow}
                </p>
                <div className="mt-5">
                  <BulletList items={content.quickTakeaways} />
                </div>
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                {content.multimodalEyebrow}
              </p>
              <h2 className="mt-3 max-w-[860px] text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                {content.multimodalTitle}
              </h2>
              <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {content.modalityCards.map((card) => (
                  <div key={card.title} className="rounded-[24px] border border-[#d4dbb8] bg-[#fffffc]/70 p-6">
                    <h3 className="text-[18px] leading-7 text-[#1c1f17]" style={mono}>
                      {card.title}
                    </h3>
                    <p className="mt-4 text-sm leading-6 text-[#4d5145] md:text-[15px]">
                      {card.body}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                {content.stackEyebrow}
              </p>
              <h2 className="mt-3 max-w-[860px] text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                {content.stackTitle}
              </h2>
              <p className="mt-5 max-w-[840px] text-sm leading-6 text-[#4d5145] md:text-[15px]">
                {content.stackIntro}
              </p>
              <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {content.stackLayers.map((layer) => (
                  <div key={layer.title} className="rounded-[24px] border border-[#d4dbb8] bg-[#f7f8ef]/70 p-6">
                    <h3 className="text-[18px] leading-7 text-[#1c1f17]" style={mono}>
                      {layer.title}
                    </h3>
                    <p className="mt-4 text-sm leading-6 text-[#4d5145] md:text-[15px]">
                      {layer.body}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                {content.rolloutEyebrow}
              </p>
              <h2 className="mt-3 max-w-[860px] text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                {content.rolloutTitle}
              </h2>
              <div className="mt-8 space-y-4">
                {content.rolloutSteps.map((item) => (
                  <div key={item.title} className="rounded-[24px] border border-[#d4dbb8] bg-[#fffffc]/70 p-6">
                    <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                      {item.step}
                    </p>
                    <h3 className="mt-3 text-base text-[#1c1f17]" style={mono}>
                      {item.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-[#4d5145] md:text-[15px]">
                      {item.body}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                {content.avoidEyebrow}
              </p>
              <h2 className="mt-3 max-w-[860px] text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                {content.avoidTitle}
              </h2>
              <div className="mt-8 overflow-x-auto rounded-xl border border-[#d4dbb8]">
                <table className="w-full text-left">
                  <thead className="bg-[#f9faf5]">
                    <tr className="border-b border-[#d4dbb8]">
                      <th className="px-5 py-3 pr-6 text-[11px] tracking-[0.5px] text-[#5a5e52]" style={mono}>
                        {content.tradeoffHeaders[0]}
                      </th>
                      <th className="px-5 py-3 pr-6 text-[11px] tracking-[0.5px] text-[#5a5e52]" style={mono}>
                        {content.tradeoffHeaders[1]}
                      </th>
                      <th className="px-5 py-3 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                        {content.tradeoffHeaders[2]}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {content.tradeoffRows.map((row) => (
                      <tr key={row.dimension} className="border-b border-[#d4dbb8]/50 last:border-b-0">
                        <td className="px-5 py-4 pr-6 align-top text-sm font-medium text-[#1c1f17]">
                          {row.dimension}
                        </td>
                        <td className="px-5 py-4 pr-6 align-top text-sm leading-6 text-[#4d5145]">
                          {row.boltOn}
                        </td>
                        <td className="px-5 py-4 align-top text-sm leading-6 text-[#4d5145]">
                          {row.runtime}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                {content.productEyebrow}
              </p>
              <h2 className="mt-3 max-w-[860px] text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                {content.productTitle}
              </h2>
              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {content.useCaseCards.map((card) => (
                  <div key={card.title} className="rounded-[24px] border border-[#d4dbb8] bg-[#fffffc]/70 p-6">
                    <h3 className="text-[18px] leading-7 text-[#1c1f17]" style={mono}>
                      {card.title}
                    </h3>
                    <p className="mt-4 text-sm leading-6 text-[#4d5145] md:text-[15px]">
                      {card.body}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                {content.fitEyebrow}
              </p>
              <h2 className="mt-3 max-w-[860px] text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                {content.fitTitle}
              </h2>
              <p className="mt-5 max-w-[840px] text-sm leading-6 text-[#4d5145] md:text-[15px]">
                {content.fitBody}
              </p>
              <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {content.capabilityCards.map((card) => (
                  <Link
                    key={card.href}
                    href={card.href}
                    className="rounded-[24px] border border-[#d4dbb8] bg-[#f7f8ef]/70 p-5 transition-colors hover:border-[#6b7d3a]"
                  >
                    <h3 className="text-base text-[#1c1f17]" style={mono}>
                      {card.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-[#4d5145]">{card.body}</p>
                  </Link>
                ))}
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                {content.nextMoveEyebrow}
              </p>
              <h2 className="mt-3 max-w-[860px] text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                {content.nextMoveTitle}
              </h2>
              <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {content.nextMoveCards.map((card) => (
                  <Link
                    key={card.href}
                    href={card.href}
                    className="rounded-[24px] border border-[#d4dbb8] bg-[#fffffc]/70 p-5 transition-colors hover:border-[#6b7d3a]"
                  >
                    <h3 className="text-base text-[#1c1f17]" style={mono}>
                      {card.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-[#4d5145]">{card.body}</p>
                  </Link>
                ))}
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                {content.faqEyebrow}
              </p>
              <h2 className="mt-3 text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                {content.faqTitle}
              </h2>
              <div className="mt-8 space-y-4">
                {content.faqItems.map((item) => (
                  <div key={item.question} className="rounded-[24px] border border-[#d4dbb8] bg-[#fffffc]/70 p-6">
                    <h3 className="text-base text-[#1c1f17]" style={mono}>
                      {item.question}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-[#4d5145] md:text-[15px]">
                      {item.answer}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </FadeIn>
        </div>
      </article>
    </>
  );
}
