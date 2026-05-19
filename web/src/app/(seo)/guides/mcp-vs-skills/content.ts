import type { Metadata } from "next";
import { createFaqPageJsonLd, createTechArticleJsonLd } from "@/lib/schema";
import { getLocaleConfig, siteConfig, type SiteLocale } from "@/lib/site";

export const MCP_VS_SKILLS_PATH = "/guides/mcp-vs-skills";

type McpVsSkillsPageData = {
  metadata: {
    title: string;
    description: string;
    openGraphTitle: string;
    openGraphDescription: string;
  };
  eyebrow: string;
  heroTitle: [string, string];
  heroIntro: string;
  heroImageAlt: string;
  comparisonTitle: string;
  comparisonRows: { layer: string; summary: string; bestFor: string; anyCap: string }[];
  changeTitle: string;
  changeCards: { title: string; paragraphs: string[] }[];
  decisionTitle: string;
  decisionIntro: string;
  decisionCards: { title: string; body: string }[];
  exampleTitle: string;
  exampleCards: { title: string; body: string }[];
  mistakesTitle: string;
  mistakes: string[];
  ruleTitle: string;
  ruleBody: string;
  scenariosTitle: string;
  scenarios: { title: string; body: string }[];
  nextTitle: string;
  nextPages: { eyebrow: string; title: string; href: string; body: string }[];
  faqTitle: string;
  faqItems: { question: string; answer: string }[];
  guideJsonLd: Record<string, unknown>;
  faqJsonLd: Record<string, unknown>;
};

const contentByLocale: Record<SiteLocale, McpVsSkillsPageData> = {
  en: {
    metadata: {
      title: "MCP vs Skills: which layer should your AI agent use?",
      description:
        "Compare MCP and skills for AI agents. MCP standardizes tool discovery and invocation, while skills teach agents how to install, authenticate, and use a runtime like AnyCap.",
      openGraphTitle: "MCP vs Skills: which layer should your AI agent use?",
      openGraphDescription:
        "Compare MCP and skills for AI agents. MCP standardizes tool discovery and invocation, while skills teach agents how to install, authenticate, and use a runtime like AnyCap.",
    },
    eyebrow: "Guides",
    heroTitle: ["MCP vs Skills", "Which layer should your agent use?"],
    heroIntro:
      "MCP standardizes how agents discover and invoke tools. Skills teach the agent how to install, authenticate, and use a capability runtime inside its workflow. If setup friction is the problem, skills usually win. If discovery and interoperability are the problem, MCP usually wins. If you want both distribution and transport, AnyCap fits cleanly into either story.",
    heroImageAlt:
      "Editorial illustration showing MCP, Skills, and Both as layered agent stack patterns",
    comparisonTitle: "The practical difference",
    comparisonRows: [
      {
        layer: "MCP",
        summary: "A protocol for exposing tools, resources, and prompts in a standard way.",
        bestFor: "Connecting an agent to tools with predictable discovery and invocation.",
        anyCap: "Use it when AnyCap should sit behind a clean protocol boundary.",
      },
      {
        layer: "Skills",
        summary: "An instruction layer that teaches the agent how to install and use a capability.",
        bestFor: "Distributing capability setup across Claude Code, Cursor, Codex, and similar agents.",
        anyCap: "Use it when you want AnyCap to feel native inside the agent workflow.",
      },
      {
        layer: "Both",
        summary: "The protocol handles wiring and the skill handles adoption.",
        bestFor: "Teams that want a stable transport layer and a low-friction onboarding path.",
        anyCap: "Use both when you want AnyCap to be easy to distribute and easy to operate.",
      },
    ],
    changeTitle: "What each layer changes",
    changeCards: [
      {
        title: "MCP changes the transport",
        paragraphs: [
          "MCP gives the agent a standard way to discover what a tool can do and how to call it. That makes integrations easier to reason about, especially when the same capability needs to work across multiple clients, runtimes, or providers.",
          "In practice, MCP is most useful when your team is trying to reduce integration drift. The interface becomes explicit, and each client can talk to the same capability without inventing its own ad hoc contract.",
        ],
      },
      {
        title: "Skills change adoption",
        paragraphs: [
          "Skills teach the agent how to discover, install, authenticate, and use a capability in the real world. They are especially valuable when the challenge is not the protocol itself, but the amount of setup a user has to remember.",
          "That is why skills are such a strong distribution layer for AnyCap. They make the capability feel like part of the agent instead of a separate system the user has to keep in sync manually.",
        ],
      },
    ],
    decisionTitle: "A practical decision rule",
    decisionIntro:
      "If you are deciding in a hurry, start with the problem you are actually solving. When the bottleneck is onboarding, skills usually win. When the bottleneck is standardized discovery or transport, MCP usually wins. When the bottleneck is adoption across several agents or teams, using both is often the least painful path. That is especially true when you want AnyCap to feel like part of the agent workflow instead of a sidecar integration someone has to remember to maintain.",
    decisionCards: [
      {
        title: "Start with skills",
        body: "Choose skills when you want the agent to learn the setup path in plain language. This is the cleaner choice for Claude Code, Cursor, Codex, or any environment where the user expects the agent to discover the right workflow without reading a protocol spec first.",
      },
      {
        title: "Start with MCP",
        body: "Choose MCP when the problem is tool transport, discovery, or interoperability. If your stack already standardizes on MCP, using it first keeps the integration layer predictable and lets AnyCap sit behind an established interface.",
      },
      {
        title: "Use both",
        body: "Use both when you want the broadest compatibility and the smoothest onboarding. MCP handles the wiring, while skills make the capability legible to the person actually using the agent.",
      },
    ],
    exampleTitle: "Example playbooks",
    exampleCards: [
      {
        title: "Prototype fast",
        body: "If you are validating a new workflow, start with skills. You will get faster onboarding and a clearer story for the person trying the capability for the first time.",
      },
      {
        title: "Standardize the interface",
        body: "If the same capability needs to work across several products, start with MCP. It gives you one transport contract and keeps the tool surface more predictable as the integration grows.",
      },
      {
        title: "Scale adoption",
        body: "If the goal is to roll out AnyCap across teams and agents, use both. MCP keeps the protocol consistent while skills make the rollout easy to understand and easier to repeat.",
      },
    ],
    mistakesTitle: "What teams usually get wrong",
    mistakes: [
      "The first mistake is treating MCP and skills like competing products. They are not. They solve adjacent layers of the same problem: one is about protocol, the other is about instruction and onboarding.",
      "The second mistake is over-engineering transport before anyone has a clear user workflow. If the team cannot explain the day-to-day job the agent should do, protocol work usually arrives too early and slows down adoption.",
      "The third mistake is making the agent memorize a manual setup process. A skill can package the path once and keep it consistent across Claude Code, Cursor, Codex, and other environments that need the same runtime.",
    ],
    ruleTitle: "Rule of thumb",
    ruleBody:
      "If your team keeps saying, “we need a clean way to expose this capability,” start with MCP. If they keep saying, “we need a way for the agent to actually use this without a long setup doc,” start with skills. If both statements are true, the best answer is usually to design the capability once and present it through both layers.",
    scenariosTitle: "Common scenarios",
    scenarios: [
      {
        title: "Choose MCP first",
        body: "Pick MCP when the main problem is tool wiring. This is the better fit when you already have multiple clients or providers and want one clean contract for discovery, invocation, and interoperability.",
      },
      {
        title: "Choose skills first",
        body: "Pick skills when the biggest problem is onboarding. You want Claude Code, Cursor, Codex, or another agent to understand how to install and use the runtime without extra orchestration or a separate protocol spec.",
      },
      {
        title: "Use both when possible",
        body: "Use both when you need standardized transport and a strong instruction story. MCP keeps the interface predictable while skills make the setup and operator experience obvious to the person actually using the agent.",
      },
    ],
    nextTitle: "Where to go next",
    nextPages: [
      {
        eyebrow: "Product",
        title: "Skills",
        href: "/skills",
        body: "See how the instruction layer fits into the AnyCap distribution story.",
      },
      {
        eyebrow: "Product",
        title: "CLI",
        href: "/cli",
        body: "See the command surface that both MCP and skills ultimately point toward.",
      },
      {
        eyebrow: "Guide",
        title: "Add Tools to Claude Code",
        href: "/guides/agent-skills-for-developer-tools",
        body: "Move from concept to setup with a concrete installation flow.",
      },
    ],
    faqTitle: "FAQ",
    faqItems: [
      {
        question: "Is MCP better than skills?",
        answer:
          "Not by default. MCP is better when you need standardized tool wiring. Skills are better when you need the agent to understand how to install, authenticate, and use the capability in day-to-day work. They solve different layers of the stack, so the right answer depends on the bottleneck you are trying to remove.",
      },
      {
        question: "Can AnyCap work with MCP and skills?",
        answer:
          "Yes. AnyCap can be described through skills for agent onboarding and can also sit behind protocol-based integrations when a workflow needs that layer. The right choice depends on whether you need distribution, transport, or both.",
      },
      {
        question: "When should I choose skills first?",
        answer:
          "Choose skills first when you want a fast path for Claude Code, Cursor, Codex, or similar agents to discover and use AnyCap without additional orchestration work. If setup friction is the main problem, skills usually get you to value faster.",
      },
      {
        question: "When should I choose MCP first?",
        answer:
          "Choose MCP first when your environment already standardizes on MCP and you mainly need a clean protocol for tool discovery and invocation. If interoperability is the goal, MCP is usually the better starting point.",
      },
      {
        question: "Do I need both MCP and skills?",
        answer:
          "Not always. If you are shipping to one agent surface and the setup flow is already clear, one layer may be enough. Use both when you need protocol compatibility and human-friendly onboarding at the same time.",
      },
      {
        question: "Which layer should I build first?",
        answer:
          "Build the layer that removes your biggest current bottleneck. If users cannot get started, start with skills. If your integration surface is the bigger problem, start with MCP. If adoption is spread across multiple agents, plan for both from the beginning.",
      },
    ],
    guideJsonLd: createTechArticleJsonLd({
      headline: "MCP vs Skills: which layer should your agent use?",
      description:
        "Practical guide to choosing between MCP and skills when wiring AnyCap into an agent workflow.",
      path: MCP_VS_SKILLS_PATH,
      about: ["MCP", "skills", "AnyCap", "AI agents"],
      keywords: ["mcp vs skills", "agent skills vs mcp", "mcp skills", "anycap"],
      datePublished: "2026-04-12",
      dateModified: "2026-04-12",
    }),
    faqJsonLd: createFaqPageJsonLd([
      {
        question: "Is MCP better than skills?",
        answer:
          "Not by default. MCP is better when you need standardized tool wiring. Skills are better when you need the agent to understand how to install, authenticate, and use the capability in day-to-day work. They solve different layers of the stack, so the right answer depends on the bottleneck you are trying to remove.",
      },
    ]),
  },
  "pt-br": {
    metadata: {
      title: "MCP vs Skills: qual camada seu agente de IA deve usar?",
      description:
        "Compare MCP e skills para agentes de IA. MCP padroniza descoberta e invocação de ferramentas, enquanto skills ensinam agentes a instalar, autenticar e usar um runtime como o AnyCap.",
      openGraphTitle: "MCP vs Skills: qual camada seu agente de IA deve usar?",
      openGraphDescription:
        "Compare MCP e skills para agentes de IA. MCP padroniza descoberta e invocação de ferramentas, enquanto skills ensinam agentes a instalar, autenticar e usar um runtime como o AnyCap.",
    },
    eyebrow: "Guias",
    heroTitle: ["MCP vs Skills", "Qual camada o seu agente deve usar?"],
    heroIntro:
      "MCP padroniza como agentes descobrem e invocam ferramentas. Skills ensinam o agente a instalar, autenticar e usar um runtime de capacidades dentro do seu fluxo. Se o problema é fricção no setup, skills normalmente vencem. Se o problema é descoberta e interoperabilidade, MCP normalmente vence. Se você quer distribuição e transporte ao mesmo tempo, o AnyCap se encaixa de forma limpa nas duas histórias.",
    heroImageAlt:
      "Ilustração editorial mostrando MCP, Skills e Ambos como padrões em camadas na stack de agentes",
    comparisonTitle: "A diferença prática",
    comparisonRows: [
      {
        layer: "MCP",
        summary: "Um protocolo para expor ferramentas, recursos e prompts de maneira padronizada.",
        bestFor: "Conectar um agente a ferramentas com descoberta e invocação previsíveis.",
        anyCap: "Use quando o AnyCap deve ficar atrás de uma fronteira de protocolo bem definida.",
      },
      {
        layer: "Skills",
        summary: "Uma camada de instrução que ensina o agente a instalar e usar uma capacidade.",
        bestFor: "Distribuir o setup de capacidades entre Claude Code, Cursor, Codex e agentes semelhantes.",
        anyCap: "Use quando você quiser que o AnyCap pareça nativo dentro do fluxo do agente.",
      },
      {
        layer: "Ambos",
        summary: "O protocolo cuida da integração e a skill cuida da adoção.",
        bestFor: "Equipes que querem uma camada de transporte estável e um caminho de onboarding com pouca fricção.",
        anyCap: "Use os dois quando quiser que o AnyCap seja fácil de distribuir e fácil de operar.",
      },
    ],
    changeTitle: "O que cada camada muda",
    changeCards: [
      {
        title: "MCP muda o transporte",
        paragraphs: [
          "MCP dá ao agente uma forma padrão de descobrir o que uma ferramenta pode fazer e como chamá-la. Isso torna as integrações mais fáceis de entender, especialmente quando a mesma capacidade precisa funcionar em vários clientes, runtimes ou provedores.",
          "Na prática, MCP é mais útil quando sua equipe está tentando reduzir o desvio entre integrações. A interface fica explícita, e cada cliente pode falar com a mesma capacidade sem inventar seu próprio contrato ad hoc.",
        ],
      },
      {
        title: "Skills mudam a adoção",
        paragraphs: [
          "Skills ensinam o agente a descobrir, instalar, autenticar e usar uma capacidade no mundo real. Elas são especialmente valiosas quando o desafio não é o protocolo em si, mas a quantidade de setup que um usuário precisa lembrar.",
          "É por isso que skills são uma camada de distribuição tão forte para o AnyCap. Elas fazem a capacidade parecer parte do agente em vez de um sistema separado que o usuário precisa manter em sincronia manualmente.",
        ],
      },
    ],
    decisionTitle: "Uma regra prática de decisão",
    decisionIntro:
      "Se você precisa decidir rápido, comece pelo problema que está realmente tentando resolver. Quando o gargalo é onboarding, skills normalmente vencem. Quando o gargalo é descoberta padronizada ou transporte, MCP normalmente vence. Quando o gargalo é adoção em vários agentes ou equipes, usar ambos costuma ser o caminho menos doloroso.",
    decisionCards: [
      {
        title: "Comece com skills",
        body: "Escolha skills quando quiser que o agente aprenda o caminho de setup em linguagem natural. Esta é a escolha mais limpa para Claude Code, Cursor, Codex ou qualquer ambiente em que o usuário espera que o agente descubra o fluxo certo sem ler uma especificação de protocolo primeiro.",
      },
      {
        title: "Comece com MCP",
        body: "Escolha MCP quando o problema for transporte, descoberta ou interoperabilidade de ferramentas. Se a sua stack já padroniza em MCP, começar por ele mantém a camada de integração previsível e deixa o AnyCap atrás de uma interface estabelecida.",
      },
      {
        title: "Use ambos",
        body: "Use ambos quando quiser a compatibilidade mais ampla e o onboarding mais suave. MCP cuida da integração, enquanto skills tornam a capacidade legível para a pessoa que realmente está usando o agente.",
      },
    ],
    exampleTitle: "Playbooks de exemplo",
    exampleCards: [
      {
        title: "Prototipe rápido",
        body: "Se você está validando um novo fluxo, comece com skills. Você terá onboarding mais rápido e uma história mais clara para a pessoa que está testando a capacidade pela primeira vez.",
      },
      {
        title: "Padronize a interface",
        body: "Se a mesma capacidade precisa funcionar em vários produtos, comece com MCP. Ele dá um contrato único de transporte e mantém a superfície de ferramentas mais previsível conforme a integração cresce.",
      },
      {
        title: "Escalone a adoção",
        body: "Se o objetivo é levar o AnyCap para várias equipes e agentes, use ambos. MCP mantém o protocolo consistente, enquanto skills tornam o rollout fácil de entender e repetir.",
      },
    ],
    mistakesTitle: "Onde as equipes costumam errar",
    mistakes: [
      "O primeiro erro é tratar MCP e skills como produtos concorrentes. Eles não são. Eles resolvem camadas adjacentes do mesmo problema: uma fala de protocolo, a outra fala de instrução e onboarding.",
      "O segundo erro é sofisticar demais o transporte antes que exista um fluxo de usuário claro. Se a equipe não consegue explicar o trabalho do dia a dia que o agente deve fazer, o trabalho de protocolo geralmente chega cedo demais e atrasa a adoção.",
      "O terceiro erro é fazer o agente memorizar um processo manual de setup. Uma skill pode empacotar esse caminho uma vez e mantê-lo consistente em Claude Code, Cursor, Codex e outros ambientes que precisam do mesmo runtime.",
    ],
    ruleTitle: "Regra de bolso",
    ruleBody:
      "Se sua equipe vive dizendo “precisamos de uma forma limpa de expor essa capacidade”, comece com MCP. Se ela vive dizendo “precisamos de uma forma de o agente realmente usar isso sem um documento enorme de setup”, comece com skills. Se as duas frases forem verdadeiras, a melhor resposta costuma ser desenhar a capacidade uma vez e apresentá-la pelas duas camadas.",
    scenariosTitle: "Cenários comuns",
    scenarios: [
      {
        title: "Escolha MCP primeiro",
        body: "Escolha MCP quando o principal problema for a integração de ferramentas. Esse é o melhor encaixe quando você já tem vários clientes ou provedores e quer um contrato limpo para descoberta, invocação e interoperabilidade.",
      },
      {
        title: "Escolha skills primeiro",
        body: "Escolha skills quando o maior problema for onboarding. Você quer que Claude Code, Cursor, Codex ou outro agente entenda como instalar e usar o runtime sem orquestração extra ou uma especificação de protocolo separada.",
      },
      {
        title: "Use ambos quando possível",
        body: "Use ambos quando você precisar de transporte padronizado e uma boa história de instrução. MCP mantém a interface previsível, enquanto skills deixam a experiência de setup e operação mais óbvia para quem realmente usa o agente.",
      },
    ],
    nextTitle: "Para onde ir em seguida",
    nextPages: [
      {
        eyebrow: "Produto",
        title: "Skills",
        href: "/skills",
        body: "Veja como a camada de instrução entra na história de distribuição do AnyCap.",
      },
      {
        eyebrow: "Produto",
        title: "CLI",
        href: "/cli",
        body: "Veja a superfície de comandos para a qual MCP e skills acabam apontando.",
      },
      {
        eyebrow: "Guia",
        title: "Adicionar Ferramentas ao Claude Code",
        href: "/guides/agent-skills-for-developer-tools",
        body: "Saia do conceito e vá para o setup com um fluxo concreto de instalação.",
      },
    ],
    faqTitle: "FAQ",
    faqItems: [
      {
        question: "MCP é melhor do que skills?",
        answer:
          "Não por padrão. MCP é melhor quando você precisa padronizar a integração de ferramentas. Skills são melhores quando você precisa que o agente entenda como instalar, autenticar e usar a capacidade no trabalho do dia a dia. Eles resolvem camadas diferentes da stack.",
      },
      {
        question: "O AnyCap pode funcionar com MCP e skills?",
        answer:
          "Sim. O AnyCap pode ser descrito por skills para onboarding de agentes e também ficar atrás de integrações baseadas em protocolo quando o fluxo precisar dessa camada.",
      },
      {
        question: "Quando eu devo escolher skills primeiro?",
        answer:
          "Escolha skills primeiro quando quiser um caminho rápido para Claude Code, Cursor, Codex ou agentes semelhantes descobrirem e usarem o AnyCap sem trabalho extra de orquestração.",
      },
      {
        question: "Quando eu devo escolher MCP primeiro?",
        answer:
          "Escolha MCP primeiro quando o seu ambiente já padroniza em MCP e você precisa principalmente de um protocolo limpo para descoberta e invocação de ferramentas.",
      },
      {
        question: "Eu preciso dos dois, MCP e skills?",
        answer:
          "Nem sempre. Se você está entregando para uma única superfície de agente e o fluxo de setup já está claro, uma camada pode bastar. Use ambos quando precisar de compatibilidade de protocolo e onboarding amigável ao mesmo tempo.",
      },
      {
        question: "Qual camada eu devo construir primeiro?",
        answer:
          "Construa a camada que remove seu maior gargalo atual. Se os usuários não conseguem começar, comece com skills. Se a superfície de integração é o maior problema, comece com MCP.",
      },
    ],
    guideJsonLd: createTechArticleJsonLd({
      headline: "MCP vs Skills: qual camada seu agente deve usar?",
      description:
        "Guia prático para escolher entre MCP e skills ao conectar o AnyCap a um fluxo com agentes.",
      path: MCP_VS_SKILLS_PATH,
      about: ["MCP", "skills", "AnyCap", "agentes de IA"],
      keywords: ["mcp vs skills", "skills vs mcp", "mcp anycap"],
      datePublished: "2026-04-12",
      dateModified: "2026-04-12",
    }),
    faqJsonLd: createFaqPageJsonLd([
      {
        question: "MCP é melhor do que skills?",
        answer:
          "Não por padrão. MCP é melhor quando você precisa padronizar a integração de ferramentas. Skills são melhores quando você precisa que o agente entenda como instalar, autenticar e usar a capacidade no trabalho do dia a dia.",
      },
    ]),
  },
  id: {
    metadata: {
      title: "MCP vs Skills: lapisan mana yang harus dipakai agen AI Anda?",
      description:
        "Bandingkan MCP dan skills untuk agen AI. MCP menstandarkan penemuan dan pemanggilan alat, sementara skills mengajarkan agen cara menginstal, mengautentikasi, dan memakai runtime seperti AnyCap.",
      openGraphTitle: "MCP vs Skills: lapisan mana yang harus dipakai agen AI Anda?",
      openGraphDescription:
        "Bandingkan MCP dan skills untuk agen AI. MCP menstandarkan penemuan dan pemanggilan alat, sementara skills mengajarkan agen cara menginstal, mengautentikasi, dan memakai runtime seperti AnyCap.",
    },
    eyebrow: "Panduan",
    heroTitle: ["MCP vs Skills", "Lapisan mana yang harus dipakai agen Anda?"],
    heroIntro:
      "MCP menstandarkan cara agen menemukan dan memanggil alat. Skills mengajarkan agen cara menginstal, mengautentikasi, dan memakai runtime kemampuan di dalam alur kerjanya. Jika masalahnya adalah gesekan saat setup, biasanya skills menang. Jika masalahnya adalah penemuan dan interoperabilitas, biasanya MCP menang. Jika Anda ingin distribusi dan transport sekaligus, AnyCap cocok dengan kedua pendekatan.",
    heroImageAlt:
      "Ilustrasi editorial yang menampilkan MCP, Skills, dan Keduanya sebagai pola lapisan pada tumpukan agen",
    comparisonTitle: "Perbedaan praktisnya",
    comparisonRows: [
      {
        layer: "MCP",
        summary: "Protokol untuk mengekspos alat, sumber daya, dan prompt dengan cara yang standar.",
        bestFor: "Menghubungkan agen ke alat dengan penemuan dan pemanggilan yang dapat diprediksi.",
        anyCap: "Pakai saat AnyCap harus berada di balik batas protokol yang jelas.",
      },
      {
        layer: "Skills",
        summary: "Lapisan instruksi yang mengajarkan agen cara menginstal dan memakai suatu kemampuan.",
        bestFor: "Mendistribusikan setup kemampuan ke Claude Code, Cursor, Codex, dan agen serupa.",
        anyCap: "Pakai saat Anda ingin AnyCap terasa asli di dalam alur kerja agen.",
      },
      {
        layer: "Keduanya",
        summary: "Protokol menangani sambungan; skill menangani adopsi.",
        bestFor: "Tim yang ingin lapisan transport stabil dan jalur onboarding yang mulus.",
        anyCap: "Pakai keduanya saat Anda ingin AnyCap mudah didistribusikan dan mudah dioperasikan.",
      },
    ],
    changeTitle: "Apa yang berubah di tiap lapisan",
    changeCards: [
      {
        title: "MCP mengubah transport",
        paragraphs: [
          "MCP memberi agen cara standar untuk mengetahui kemampuan alat dan cara memanggilnya. Integrasi jadi lebih mudah dipahami, terutama saat kemampuan yang sama harus jalan di banyak klien, runtime, atau penyedia.",
          "Secara praktis, MCP paling berguna saat tim ingin mengurangi penyimpangan integrasi. Antarmuka jadi eksplisit, dan tiap klien bisa berbicara ke kemampuan yang sama tanpa membuat kontrak ad hoc sendiri.",
        ],
      },
      {
        title: "Skills mengubah adopsi",
        paragraphs: [
          "Skills mengajarkan agen cara menemukan, menginstal, mengautentikasi, dan memakai kemampuan di dunia nyata. Nilainya besar saat tantangannya bukan protokolnya, melainkan banyaknya setup yang harus diingat pengguna.",
          "Itulah sebabnya skills menjadi lapisan distribusi yang kuat untuk AnyCap. Kemampuan terasa bagian dari agen, bukan sistem terpisah yang harus diselaraskan pengguna secara manual.",
        ],
      },
    ],
    decisionTitle: "Aturan praktis untuk memutuskan",
    decisionIntro:
      "Jika harus memutuskan dengan cepat, mulai dari masalah yang benar-benar Anda selesaikan. Saat bottleneck-nya onboarding, biasanya skills menang. Saat bottleneck-nya penemuan atau transport yang distandarkan, biasanya MCP menang. Saat bottleneck-nya adopsi di banyak agen atau tim, memakai keduanya sering jadi jalan paling tidak menyakitkan. Ini terutama benar bila Anda ingin AnyCap terasa bagian dari alur kerja agen, bukan integrasi sampingan yang harus diingat untuk dipelihara.",
    decisionCards: [
      {
        title: "Mulai dari skills",
        body: "Pilih skills saat Anda ingin agen mempelajari jalur setup dalam bahasa natural. Ini pilihan yang lebih rapi untuk Claude Code, Cursor, Codex, atau lingkungan di mana pengguna mengharapkan agen menemukan alur yang tepat tanpa membaca spesifikasi protokol dulu.",
      },
      {
        title: "Mulai dari MCP",
        body: "Pilih MCP saat masalahnya adalah transport alat, penemuan, atau interoperabilitas. Jika stack Anda sudah menstandarkan MCP, memulai dari situ menjaga lapisan integrasi tetap dapat diprediksi dan menempatkan AnyCap di balik antarmuka yang mapan.",
      },
      {
        title: "Pakai keduanya",
        body: "Pakai keduanya saat Anda ingin kompatibilitas selebar mungkin dan onboarding semulus mungkin. MCP menangani sambungan, sementara skills membuat kemampuan mudah dipahami oleh orang yang benar-benar memakai agen.",
      },
    ],
    exampleTitle: "Contoh playbook",
    exampleCards: [
      {
        title: "Prototipe cepat",
        body: "Jika Anda memvalidasi alur baru, mulai dari skills. Onboarding lebih cepat dan cerita untuk orang yang pertama kali mencoba kemampuan lebih jelas.",
      },
      {
        title: "Standarkan antarmuka",
        body: "Jika kemampuan yang sama harus jalan di banyak produk, mulai dari MCP. Anda mendapat satu kontrak transport dan permukaan alat lebih dapat diprediksi seiring pertumbuhan integrasi.",
      },
      {
        title: "Skalakan adopsi",
        body: "Jika tujuannya meluncurkan AnyCap ke banyak tim dan agen, pakai keduanya. MCP menjaga protokol konsisten sementara skills membuat peluncuran mudah dipahami dan diulang.",
      },
    ],
    mistakesTitle: "Kesalahan yang sering dilakukan tim",
    mistakes: [
      "Kesalahan pertama memperlakukan MCP dan skills seperti produk yang bersaing. Bukan begitu. Keduanya menyelesaikan lapisan berdekatan dari masalah yang sama: satu soal protokol, satu soal instruksi dan onboarding.",
      "Kesalahan kedua merekayasa transport berlebihan sebelum alur kerja pengguna jelas. Jika tim tidak bisa menjelaskan pekerjaan harian yang harus dilakukan agen, pekerjaan protokol biasanya datang terlalu dini dan memperlambat adopsi.",
      "Kesalahan ketiga membuat agen menghafal proses setup manual. Skill bisa membungkus jalur itu sekali dan menjaganya konsisten di Claude Code, Cursor, Codex, dan lingkungan lain yang membutuhkan runtime yang sama.",
    ],
    ruleTitle: "Kaidah praktis",
    ruleBody:
      "Jika tim sering berkata, “kami butuh cara bersih mengekspos kemampuan ini,” mulai dari MCP. Jika mereka sering berkata, “kami butuh cara agar agen benar-benar memakai ini tanpa dokumen setup panjang,” mulai dari skills. Jika kedua pernyataan benar, jawaban terbaik biasanya merancang kemampuan sekali lalu menyajikannya lewat kedua lapisan.",
    scenariosTitle: "Skenario umum",
    scenarios: [
      {
        title: "Pilih MCP dulu",
        body: "Pilih MCP saat masalah utama penyambungan alat. Ini lebih cocok bila Anda sudah punya banyak klien atau penyedia dan ingin satu kontrak bersih untuk penemuan, pemanggilan, dan interoperabilitas.",
      },
      {
        title: "Pilih skills dulu",
        body: "Pilih skills saat masalah terbesar adalah onboarding. Anda ingin Claude Code, Cursor, Codex, atau agen lain memahami cara menginstal dan memakai runtime tanpa orkestrasi ekstra atau spesifikasi protokol terpisah.",
      },
      {
        title: "Pakai keduanya jika memungkinkan",
        body: "Pakai keduanya saat Anda butuh transport yang distandarkan dan narasi instruksi yang kuat. MCP menjaga antarmuka tetap dapat diprediksi sementara skills membuat setup dan pengalaman operator jelas bagi orang yang memakai agen.",
      },
    ],
    nextTitle: "Langkah berikutnya",
    nextPages: [
      {
        eyebrow: "Produk",
        title: "Skills",
        href: "/skills",
        body: "Lihat bagaimana lapisan instruksi masuk ke cerita distribusi AnyCap.",
      },
      {
        eyebrow: "Produk",
        title: "CLI",
        href: "/cli",
        body: "Lihat permukaan perintah yang pada akhirnya dituju MCP dan skills.",
      },
      {
        eyebrow: "Panduan",
        title: "Menambahkan alat ke Claude Code",
        href: "/guides/agent-skills-for-developer-tools",
        body: "Dari konsep ke setup dengan alur instalasi yang konkret.",
      },
    ],
    faqTitle: "FAQ",
    faqItems: [
      {
        question: "Apakah MCP lebih baik daripada skills?",
        answer:
          "Tidak otomatis. MCP lebih baik saat Anda butuh penyambungan alat yang distandarkan. Skills lebih baik saat Anda butuh agen memahami cara menginstal, mengautentikasi, dan memakai kemampuan dalam pekerjaan sehari-hari. Keduanya menyelesaikan lapisan berbeda di stack, jadi jawaban yang tepat bergantung pada bottleneck yang ingin Anda hilangkan.",
      },
      {
        question: "Bisakah AnyCap bekerja dengan MCP dan skills?",
        answer:
          "Ya. AnyCap bisa dijelaskan lewat skills untuk onboarding agen dan juga berada di balik integrasi berbasis protokol saat alur membutuhkan lapisan itu. Pilihan yang tepat bergantung pada apakah Anda butuh distribusi, transport, atau keduanya.",
      },
      {
        question: "Kapan saya harus memilih skills dulu?",
        answer:
          "Pilih skills dulu saat Anda ingin jalur cepat bagi Claude Code, Cursor, Codex, atau agen serupa untuk menemukan dan memakai AnyCap tanpa pekerjaan orkestrasi tambahan. Jika gesekan setup masalah utamanya, skills biasanya membawa nilai lebih cepat.",
      },
      {
        question: "Kapan saya harus memilih MCP dulu?",
        answer:
          "Pilih MCP dulu saat lingkungan Anda sudah menstandarkan MCP dan Anda terutama butuh protokol bersih untuk penemuan dan pemanggilan alat. Jika interoperabilitas adalah tujuan, MCP biasanya titik awal yang lebih baik.",
      },
      {
        question: "Apakah saya perlu MCP dan skills sekaligus?",
        answer:
          "Tidak selalu. Jika Anda hanya mengirim ke satu permukaan agen dan alur setup sudah jelas, satu lapisan mungkin cukup. Pakai keduanya saat Anda butuh kompatibilitas protokol dan onboarding yang ramah manusia pada saat yang sama.",
      },
      {
        question: "Lapisan mana yang harus saya bangun dulu?",
        answer:
          "Bangun lapisan yang menghilangkan bottleneck terbesar Anda saat ini. Jika pengguna tidak bisa memulai, mulai dari skills. Jika permukaan integrasi masalah lebih besar, mulai dari MCP. Jika adopsi tersebar di banyak agen, rencanakan keduanya sejak awal.",
      },
    ],
    guideJsonLd: createTechArticleJsonLd({
      headline: "MCP vs Skills: lapisan mana yang harus dipakai agen Anda?",
      description:
        "Panduan praktis memilih antara MCP dan skills saat menghubungkan AnyCap ke alur kerja agen.",
      path: MCP_VS_SKILLS_PATH,
      about: ["MCP", "skills", "AnyCap", "agen AI"],
      keywords: ["mcp vs skills", "skills vs mcp", "mcp skills", "anycap"],
      datePublished: "2026-04-12",
      dateModified: "2026-04-12",
    }),
    faqJsonLd: createFaqPageJsonLd([
      {
        question: "Apakah MCP lebih baik daripada skills?",
        answer:
          "Tidak otomatis. MCP lebih baik saat Anda butuh penyambungan alat yang distandarkan. Skills lebih baik saat Anda butuh agen memahami cara menginstal, mengautentikasi, dan memakai kemampuan dalam pekerjaan sehari-hari. Keduanya menyelesaikan lapisan berbeda di stack, jadi jawaban yang tepat bergantung pada bottleneck yang ingin Anda hilangkan.",
      },
    ]),
  },
  de: {
    metadata: {
      title: "MCP vs. Skills: Welche Schicht sollte Ihr KI-Agent nutzen?",
      description:
        "Vergleichen Sie MCP und Skills für KI-Agenten. MCP standardisiert Tool-Discovery und -Aufruf, während Skills Agenten beibringen, eine Runtime wie AnyCap zu installieren, zu authentifizieren und zu nutzen.",
      openGraphTitle: "MCP vs. Skills: Welche Schicht sollte Ihr KI-Agent nutzen?",
      openGraphDescription:
        "Vergleichen Sie MCP und Skills für KI-Agenten. MCP standardisiert Tool-Discovery und -Aufruf, während Skills Agenten beibringen, eine Runtime wie AnyCap zu installieren, zu authentifizieren und zu nutzen.",
    },
    eyebrow: "Anleitungen",
    heroTitle: ["MCP vs. Skills", "Welche Schicht sollte Ihr Agent nutzen?"],
    heroIntro:
      "MCP standardisiert, wie Agenten Tools entdecken und aufrufen. Skills bringen dem Agenten bei, wie er eine Capability-Runtime in seinem Workflow installiert, authentifiziert und nutzt. Wenn Setup-Reibung das Problem ist, gewinnen meist Skills. Wenn Discovery und Interoperabilität das Problem sind, gewinnt meist MCP. Wenn Sie sowohl Distribution als auch Transport möchten, passt AnyCap sauber in beide Geschichten.",
    heroImageAlt:
      "Editorial-Illustration, die MCP, Skills und beide als geschichtete Agenten-Stack-Muster zeigt",
    comparisonTitle: "Der praktische Unterschied",
    comparisonRows: [
      {
        layer: "MCP",
        summary: "Ein Protokoll, um Tools, Ressourcen und Prompts auf standardisierte Weise bereitzustellen.",
        bestFor: "Einen Agenten mit Tools verbinden, mit vorhersagbarer Discovery und Invocation.",
        anyCap: "Nutzen Sie es, wenn AnyCap hinter einer sauberen Protokollgrenze sitzen soll.",
      },
      {
        layer: "Skills",
        summary: "Eine Instruktionsschicht, die dem Agenten beibringt, eine Capability zu installieren und zu nutzen.",
        bestFor: "Capability-Setup über Claude Code, Cursor, Codex und ähnliche Agenten verteilen.",
        anyCap: "Nutzen Sie es, wenn AnyCap sich nativ im Agenten-Workflow anfühlen soll.",
      },
      {
        layer: "Beide",
        summary: "Das Protokoll übernimmt das Wiring, der Skill übernimmt die Adoption.",
        bestFor: "Teams, die eine stabile Transport-Schicht und einen reibungsarmen Onboarding-Pfad wollen.",
        anyCap: "Nutzen Sie beide, wenn AnyCap leicht zu verteilen und leicht zu betreiben sein soll.",
      },
    ],
    changeTitle: "Was jede Schicht verändert",
    changeCards: [
      {
        title: "MCP verändert den Transport",
        paragraphs: [
          "MCP gibt dem Agenten eine standardisierte Möglichkeit zu erkennen, was ein Tool kann und wie es aufgerufen wird. Das macht Integrationen leichter nachvollziehbar, besonders wenn dieselbe Capability über mehrere Clients, Runtimes oder Provider hinweg funktionieren muss.",
          "In der Praxis ist MCP am nützlichsten, wenn Ihr Team Integrationsdrift reduzieren will. Die Schnittstelle wird explizit, und jeder Client kann mit derselben Capability sprechen, ohne einen eigenen Ad-hoc-Vertrag zu erfinden.",
        ],
      },
      {
        title: "Skills verändern die Adoption",
        paragraphs: [
          "Skills bringen dem Agenten bei, wie er eine Capability in der echten Welt entdeckt, installiert, authentifiziert und nutzt. Sie sind besonders wertvoll, wenn die Herausforderung nicht das Protokoll selbst ist, sondern die Menge an Setup, die ein Nutzer sich merken muss.",
          "Deshalb sind Skills eine so starke Distributionsschicht für AnyCap. Sie lassen die Capability wie einen Teil des Agenten wirken, statt wie ein separates System, das der Nutzer manuell synchron halten muss.",
        ],
      },
    ],
    decisionTitle: "Eine praktische Entscheidungsregel",
    decisionIntro:
      "Wenn Sie schnell entscheiden müssen, beginnen Sie mit dem tatsächlichen Problem. Wenn der Engpass Onboarding ist, gewinnen meist Skills. Wenn der Engpass standardisierte Discovery oder Transport ist, gewinnt meist MCP. Wenn der Engpass Adoption über mehrere Agenten oder Teams ist, ist beides oft der schmerzärmste Weg. Das gilt besonders, wenn AnyCap Teil des Agenten-Workflows sein soll, statt einer Sidecar-Integration, die jemand manuell pflegen muss.",
    decisionCards: [
      {
        title: "Mit Skills beginnen",
        body: "Wählen Sie Skills, wenn der Agent den Setup-Pfad in einfacher Sprache lernen soll. Das ist die sauberere Wahl für Claude Code, Cursor, Codex oder jede Umgebung, in der der Nutzer erwartet, dass der Agent den richtigen Workflow findet, ohne erst eine Protokoll-Spezifikation zu lesen.",
      },
      {
        title: "Mit MCP beginnen",
        body: "Wählen Sie MCP, wenn das Problem Tool-Transport, Discovery oder Interoperabilität ist. Wenn Ihr Stack bereits auf MCP standardisiert, hält ein MCP-First-Ansatz die Integrationsschicht vorhersagbar und lässt AnyCap hinter einer etablierten Schnittstelle sitzen.",
      },
      {
        title: "Beide nutzen",
        body: "Nutzen Sie beide, wenn Sie maximale Kompatibilität und reibungsärmstes Onboarding wollen. MCP übernimmt das Wiring, während Skills die Capability für die Person, die den Agenten tatsächlich nutzt, lesbar macht.",
      },
    ],
    exampleTitle: "Beispiel-Playbooks",
    exampleCards: [
      {
        title: "Schnell prototypen",
        body: "Wenn Sie einen neuen Workflow validieren, beginnen Sie mit Skills. Sie bekommen schnelleres Onboarding und eine klarere Geschichte für den Erstnutzer der Capability.",
      },
      {
        title: "Schnittstelle standardisieren",
        body: "Wenn dieselbe Capability über mehrere Produkte funktionieren muss, beginnen Sie mit MCP. Es gibt Ihnen einen Transport-Vertrag und hält die Tool-Oberfläche vorhersagbarer, während die Integration wächst.",
      },
      {
        title: "Adoption skalieren",
        body: "Wenn das Ziel ist, AnyCap über Teams und Agenten auszurollen, nutzen Sie beide. MCP hält das Protokoll konsistent, während Skills den Rollout leichter verständlich und wiederholbar machen.",
      },
    ],
    mistakesTitle: "Was Teams meist falsch machen",
    mistakes: [
      "Der erste Fehler ist, MCP und Skills wie konkurrierende Produkte zu behandeln. Sind sie nicht. Sie lösen benachbarte Schichten desselben Problems: eine ist Protokoll, die andere ist Instruktion und Onboarding.",
      "Der zweite Fehler ist, Transport zu überengineeren, bevor jemand einen klaren Nutzer-Workflow hat. Wenn das Team nicht erklären kann, welche tägliche Aufgabe der Agent erledigen soll, kommt Protokoll-Arbeit meist zu früh und bremst die Adoption.",
      "Der dritte Fehler ist, den Agenten einen manuellen Setup-Prozess auswendig lernen zu lassen. Ein Skill kann den Pfad einmal verpacken und konsistent über Claude Code, Cursor, Codex und andere Umgebungen halten, die dieselbe Runtime brauchen.",
    ],
    ruleTitle: "Faustregel",
    ruleBody:
      "Wenn Ihr Team ständig sagt: „Wir brauchen einen sauberen Weg, diese Capability bereitzustellen“, beginnen Sie mit MCP. Wenn es ständig sagt: „Wir brauchen einen Weg, dass der Agent das tatsächlich nutzt, ohne lange Setup-Doku“, beginnen Sie mit Skills. Wenn beide Aussagen zutreffen, ist die beste Antwort meist, die Capability einmal zu entwerfen und über beide Schichten zu präsentieren.",
    scenariosTitle: "Häufige Szenarien",
    scenarios: [
      {
        title: "MCP zuerst wählen",
        body: "Wählen Sie MCP, wenn das Hauptproblem Tool-Wiring ist. Das passt besser, wenn Sie bereits mehrere Clients oder Provider haben und einen sauberen Vertrag für Discovery, Invocation und Interoperabilität wollen.",
      },
      {
        title: "Skills zuerst wählen",
        body: "Wählen Sie Skills, wenn das größte Problem Onboarding ist. Sie wollen, dass Claude Code, Cursor, Codex oder ein anderer Agent versteht, wie die Runtime installiert und genutzt wird, ohne zusätzliche Orchestrierung oder eine separate Protokoll-Spezifikation.",
      },
      {
        title: "Beide nutzen, wenn möglich",
        body: "Nutzen Sie beide, wenn Sie standardisierten Transport und eine starke Instruktionsgeschichte brauchen. MCP hält die Schnittstelle vorhersagbar, während Skills das Setup und die Operator-Erfahrung für die Person, die den Agenten nutzt, offensichtlich machen.",
      },
    ],
    nextTitle: "Nächste Schritte",
    nextPages: [
      {
        eyebrow: "Produkt",
        title: "Skills",
        href: "/skills",
        body: "Sehen Sie, wie die Instruktionsschicht in die AnyCap-Distributionsgeschichte passt.",
      },
      {
        eyebrow: "Produkt",
        title: "CLI",
        href: "/cli",
        body: "Sehen Sie die Befehlsoberfläche, auf die MCP und Skills letztlich zeigen.",
      },
      {
        eyebrow: "Anleitung",
        title: "Tools zu Claude Code hinzufügen",
        href: "/guides/agent-skills-for-developer-tools",
        body: "Vom Konzept zum Setup mit einem konkreten Installationsfluss.",
      },
    ],
    faqTitle: "FAQ",
    faqItems: [
      {
        question: "Ist MCP besser als Skills?",
        answer:
          "Nicht standardmäßig. MCP ist besser, wenn Sie standardisiertes Tool-Wiring brauchen. Skills sind besser, wenn der Agent verstehen soll, wie er die Capability im Alltag installiert, authentifiziert und nutzt. Sie lösen unterschiedliche Schichten des Stacks, die richtige Antwort hängt also vom Engpass ab, den Sie beseitigen wollen.",
      },
      {
        question: "Kann AnyCap mit MCP und Skills arbeiten?",
        answer:
          "Ja. AnyCap kann über Skills für das Agenten-Onboarding beschrieben werden und auch hinter protokollbasierten Integrationen sitzen, wenn ein Workflow diese Schicht braucht. Die richtige Wahl hängt davon ab, ob Sie Distribution, Transport oder beides brauchen.",
      },
      {
        question: "Wann sollte ich zuerst Skills wählen?",
        answer:
          "Wählen Sie zuerst Skills, wenn Sie einen schnellen Pfad für Claude Code, Cursor, Codex oder ähnliche Agenten wollen, AnyCap ohne zusätzliche Orchestrierungsarbeit zu entdecken und zu nutzen. Wenn Setup-Reibung das Hauptproblem ist, bringen Skills meist schneller Wert.",
      },
      {
        question: "Wann sollte ich zuerst MCP wählen?",
        answer:
          "Wählen Sie zuerst MCP, wenn Ihre Umgebung bereits auf MCP standardisiert und Sie hauptsächlich ein sauberes Protokoll für Tool-Discovery und -Aufruf brauchen. Wenn Interoperabilität das Ziel ist, ist MCP meist der bessere Ausgangspunkt.",
      },
      {
        question: "Brauche ich beides, MCP und Skills?",
        answer:
          "Nicht immer. Wenn Sie auf eine Agentenoberfläche ausliefern und der Setup-Flow bereits klar ist, kann eine Schicht ausreichen. Nutzen Sie beide, wenn Sie Protokollkompatibilität und benutzerfreundliches Onboarding gleichzeitig brauchen.",
      },
      {
        question: "Welche Schicht sollte ich zuerst bauen?",
        answer:
          "Bauen Sie die Schicht, die Ihren größten aktuellen Engpass beseitigt. Wenn Nutzer nicht starten können, beginnen Sie mit Skills. Wenn die Integrationsoberfläche das größere Problem ist, beginnen Sie mit MCP. Wenn Adoption über mehrere Agenten verteilt ist, planen Sie beide von Anfang an.",
      },
    ],
    guideJsonLd: createTechArticleJsonLd({
      headline: "MCP vs. Skills: Welche Schicht sollte Ihr Agent nutzen?",
      description:
        "Praktische Anleitung zur Wahl zwischen MCP und Skills beim Anbinden von AnyCap an einen Agenten-Workflow.",
      path: MCP_VS_SKILLS_PATH,
      about: ["MCP", "skills", "AnyCap", "KI-Agenten"],
      keywords: ["mcp vs skills", "agent skills vs mcp", "mcp skills", "anycap"],
      datePublished: "2026-04-12",
      dateModified: "2026-04-12",
    }),
    faqJsonLd: createFaqPageJsonLd([
      {
        question: "Ist MCP besser als Skills?",
        answer:
          "Nicht standardmäßig. MCP ist besser, wenn Sie standardisiertes Tool-Wiring brauchen. Skills sind besser, wenn der Agent verstehen soll, wie er die Capability im Alltag installiert, authentifiziert und nutzt.",
      },
    ]),
  },
};

contentByLocale.en.faqJsonLd = createFaqPageJsonLd(contentByLocale.en.faqItems);
contentByLocale["pt-br"].faqJsonLd = createFaqPageJsonLd(contentByLocale["pt-br"].faqItems);
contentByLocale.id.faqJsonLd = createFaqPageJsonLd(contentByLocale.id.faqItems);
contentByLocale.de.faqJsonLd = createFaqPageJsonLd(contentByLocale.de.faqItems);

export function getMcpVsSkillsMetadata(locale: SiteLocale): Metadata {
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

export function getMcpVsSkillsPageData(locale: SiteLocale) {
  return contentByLocale[locale] ?? contentByLocale.en;
}
