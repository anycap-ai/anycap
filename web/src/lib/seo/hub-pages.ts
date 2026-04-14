import { getSeoIaNodeByPath, getSeoIaNodes } from "@/lib/seo/ia";
import type { SiteLocale } from "@/lib/site";

export type HubPageKey = "for" | "guides" | "glossary" | "compare";
export type HubPagePath = "/for" | "/guides" | "/glossary" | "/compare";

export type HubPageItem = {
  title: string;
  href: string;
  description: string;
};

export type HubPageDefinition = {
  key: HubPageKey;
  path: HubPagePath;
  title: string;
  description: string;
  eyebrow: string;
  heroLines: [string, string];
  intro: string;
  overviewTitle: string;
  overviewParagraphs: string[];
  usageTitle: string;
  usagePoints: string[];
  items: HubPageItem[];
};

type HubPageBaseDefinition = Omit<HubPageDefinition, "items">;
type HubItemCopy = {
  title: string;
  description: string;
};
type HubItemCopyByPath = Record<string, HubItemCopy>;
type HubItemCopyByHubPath = Record<HubPagePath, HubItemCopyByPath>;
type HubBaseDefinitionsByKey = Record<HubPageKey, HubPageBaseDefinition>;

const hubBaseDefinitionsEn: HubBaseDefinitionsByKey = {
  for: {
    key: "for",
    path: "/for",
    title: "Equip Agents | Add Missing Capabilities to AI Agents",
    description:
      "Choose your agent and add the capability layer it does not ship with. Equip Claude Code, Cursor, Codex, and Manus with image, video, vision, and retrieval workflows through AnyCap.",
    eyebrow: "Equip Agents",
    heroLines: ["Keep the agent you use.", "Add the capabilities it lacks."],
    intro:
      "These pages show the shortest path to equip Claude Code, Cursor, Codex, and Manus with image generation, video generation, image understanding, video analysis, and related capability workflows through one runtime.",
    overviewTitle: "How to use this hub",
    overviewParagraphs: [
      "This hub is useful when the user already knows which agent they want to keep and only needs the missing capability layer. Instead of replacing the coding environment, the page family focuses on extending the existing agent with image, video, vision, and retrieval workflows.",
      "That makes the /for section a routing layer as much as an index. Each child page translates the same AnyCap runtime into the install path, workflow examples, and next steps that make sense for that specific agent ecosystem.",
    ],
    usageTitle: "What you will find here",
    usagePoints: [
      "Agent-specific setup paths for Claude Code, Cursor, Codex, and Manus.",
      "Capability routing patterns that explain which page to visit first based on the workflow gap.",
      "A cleaner transition from agent-native tooling into AnyCap without rebuilding the workflow around a different product.",
    ],
  },
  guides: {
    key: "guides",
    path: "/guides",
    title: "Guides — Practical setup and implementation help for AnyCap",
    description:
      "Browse AnyCap guides for installation, agent context engineering, tool wiring, and implementation patterns for agent users, creators, and builders.",
    eyebrow: "Guides",
    heroLines: ["Practical guides", "for agent teams and creators."],
    intro:
      "These guides cover setup, context design, tool integration, and working patterns for teams and creators using agents with AnyCap.",
    overviewTitle: "What these guides are for",
    overviewParagraphs: [
      "The guides section is where implementation intent turns into repeatable operator knowledge. It covers installation, context design, capability routing, and the patterns that help teams move from one-off experiments to stable agent workflows.",
      "In practice, these pages work best when the user already knows the capability gap and needs an execution path, not just a feature description. That is why the guides emphasize decisions, setup order, and workflow fit rather than only product messaging.",
    ],
    usageTitle: "What you will find here",
    usagePoints: [
      "Installation and onboarding guides for AnyCap and supported agent environments.",
      "Architecture explainers that clarify how skills, MCP, context engineering, and runtime layers fit together.",
      "Workflow-oriented pages that show how to add generation and vision capabilities to real agents step by step.",
    ],
  },
  glossary: {
    key: "glossary",
    path: "/glossary",
    title: "Glossary — Core concepts behind AnyCap and agent tooling",
    description:
      "Read concise definitions for core AnyCap and agent-tooling concepts such as context engineering, agent harnesses, and capability runtimes.",
    eyebrow: "Glossary",
    heroLines: ["Shared language", "for agent systems."],
    intro:
      "Use these glossary entries to align teams on the terms behind capability runtimes, harnesses, and context design.",
    overviewTitle: "Why this glossary exists",
    overviewParagraphs: [
      "Agent systems often fail at the language layer before they fail at the tooling layer. Teams use the same words to mean different things, which turns design discussions into confusion around the model, harness, runtime, or protocol layer.",
      "The glossary gives AnyCap pages a shared reference frame. It helps readers connect conceptual terms such as context engineering, agent harnesses, and capability runtimes to the more practical pages elsewhere in the site.",
    ],
    usageTitle: "What you will find here",
    usagePoints: [
      "Concise definitions for recurring agent-system concepts.",
      "Terminology that links conceptual pages to setup guides and comparison pages.",
      "A cleaner vocabulary for deciding where AnyCap fits in the broader agent stack.",
    ],
  },
  compare: {
    key: "compare",
    path: "/compare",
    title: "Compare — AnyCap vs agent tooling and media API platforms",
    description:
      "Compare AnyCap with adjacent agent tooling, model APIs, and media platforms so teams can choose the right layer of the stack.",
    eyebrow: "Compare",
    heroLines: ["Compare AnyCap", "to the right stack layer."],
    intro:
      "These comparisons help teams decide when a capability runtime is a better fit than stitching together model APIs, hosted builders, or human-oriented tool surfaces.",
    overviewTitle: "How to read these comparisons",
    overviewParagraphs: [
      "The comparison pages are designed for buyers and builders who are choosing between adjacent layers of the stack, not only between brands. In many cases the real decision is whether the workflow needs a model API, a hosted agent builder, or a reusable capability runtime.",
      "That is why the compare section focuses on fit, operating model, and workflow consequences. A page here should help the reader understand what problem each layer solves before they decide which product belongs in the architecture.",
    ],
    usageTitle: "What you will find here",
    usagePoints: [
      "Direct product comparisons against adjacent media APIs and agent tooling layers.",
      "Alternative pages for teams searching for replacements that work better in agent-driven workflows.",
      "A clearer explanation of where AnyCap belongs relative to APIs, builders, and human-facing creative tools.",
    ],
  },
};

const hubBaseDefinitionsPtBr: HubBaseDefinitionsByKey = {
  for: {
    key: "for",
    path: "/for",
    title: "Equipar agentes | Adicione capacidades ausentes aos agentes de IA",
    description:
      "Escolha seu agente e adicione a camada de capacidades que ele não traz de fábrica. Equipe Claude Code, Cursor, Codex e Manus com fluxos de imagem, vídeo, visão e recuperação por meio do AnyCap.",
    eyebrow: "Equipar agentes",
    heroLines: ["Mantenha o agente que você já usa.", "Adicione as capacidades que faltam."],
    intro:
      "Estas páginas mostram o caminho mais curto para equipar Claude Code, Cursor, Codex e Manus com geração de imagem, geração de vídeo, entendimento de imagem, análise de vídeo e fluxos de capacidades relacionadas por meio de um único runtime.",
    overviewTitle: "Como usar este hub",
    overviewParagraphs: [
      "Este hub é útil quando a pessoa já sabe qual agente quer manter e só precisa adicionar a camada de capacidades que está faltando. Em vez de trocar de ambiente, a família /for mostra como estender o agente atual com fluxos de imagem, vídeo, visão e recuperação.",
      "Na prática, a seção /for funciona tanto como índice quanto como camada de roteamento. Cada página filha traduz o mesmo runtime do AnyCap para o caminho de instalação, os exemplos de workflow e os próximos passos que fazem sentido para aquele ecossistema de agente.",
    ],
    usageTitle: "O que você encontra aqui",
    usagePoints: [
      "Caminhos de setup específicos por agente para Claude Code, Cursor, Codex e Manus.",
      "Padrões de roteamento de capacidade que ajudam a escolher a primeira página certa conforme a lacuna do workflow.",
      "Uma transição mais limpa das ferramentas nativas do agente para o AnyCap sem reconstruir o fluxo em outro produto.",
    ],
  },
  guides: {
    key: "guides",
    path: "/guides",
    title: "Guias — ajuda prática de configuração e implementação para o AnyCap",
    description:
      "Explore os guias do AnyCap para instalação, engenharia de contexto para agentes, integração de ferramentas e padrões de implementação para usuários, criadores e builders.",
    eyebrow: "Guias",
    heroLines: ["Guias práticos", "para equipes e criadores com agentes."],
    intro:
      "Estes guias cobrem configuração, desenho de contexto, integração de ferramentas e padrões de trabalho para equipes e criadores que usam agentes com o AnyCap.",
    overviewTitle: "Para que servem estes guias",
    overviewParagraphs: [
      "A seção de guias é onde intenção de implementação vira conhecimento operacional repetível. Ela cobre instalação, desenho de contexto, roteamento de capacidades e padrões que ajudam equipes a sair de experimentos pontuais para fluxos de agente mais estáveis.",
      "Na prática, estas páginas funcionam melhor quando a pessoa já conhece a lacuna de capacidade e precisa de um caminho de execução, não apenas de uma descrição de produto. Por isso os guias enfatizam decisões, ordem de setup e encaixe no workflow.",
    ],
    usageTitle: "O que você encontra aqui",
    usagePoints: [
      "Guias de instalação e onboarding do AnyCap e dos ambientes de agente compatíveis.",
      "Explicações de arquitetura que mostram como skills, MCP, engenharia de contexto e runtime se relacionam.",
      "Páginas orientadas a workflow que mostram como adicionar geração e visão a agentes reais passo a passo.",
    ],
  },
  glossary: {
    key: "glossary",
    path: "/glossary",
    title: "Glossário — conceitos centrais por trás do AnyCap e de ferramentas para agentes",
    description:
      "Leia definições concisas de conceitos centrais do AnyCap e de ferramentas para agentes, como engenharia de contexto, agent harness e runtimes de capacidades.",
    eyebrow: "Glossário",
    heroLines: ["Linguagem compartilhada", "para sistemas de agentes."],
    intro:
      "Use estas entradas do glossário para alinhar equipes sobre os termos por trás de runtimes de capacidades, harnesses e desenho de contexto.",
    overviewTitle: "Por que este glossário existe",
    overviewParagraphs: [
      "Sistemas de agentes costumam falhar na camada de linguagem antes de falhar na camada de tooling. Equipes usam as mesmas palavras para significados diferentes, e isso cria confusão sobre modelo, harness, runtime ou protocolo.",
      "O glossário dá às páginas do AnyCap um quadro de referência compartilhado. Ele ajuda a conectar termos como engenharia de contexto, agent harness e runtime de capacidades com as páginas práticas do restante do site.",
    ],
    usageTitle: "O que você encontra aqui",
    usagePoints: [
      "Definições concisas para conceitos recorrentes em sistemas de agentes.",
      "Terminologia que conecta páginas conceituais a guias de setup e páginas de comparação.",
      "Um vocabulário mais limpo para decidir onde o AnyCap entra na stack de agentes.",
    ],
  },
  compare: {
    key: "compare",
    path: "/compare",
    title: "Comparar — AnyCap vs ferramentas de agente e plataformas de API de mídia",
    description:
      "Compare o AnyCap com ferramentas de agente adjacentes, APIs de modelos e plataformas de mídia para que as equipes escolham a camada certa da stack.",
    eyebrow: "Comparar",
    heroLines: ["Compare o AnyCap", "com a camada certa da stack."],
    intro:
      "Estas comparações ajudam as equipes a decidir quando um runtime de capacidades é uma opção melhor do que juntar APIs de modelos, construtores hospedados ou superfícies de ferramentas voltadas para humanos.",
    overviewTitle: "Como ler estas comparações",
    overviewParagraphs: [
      "As páginas de comparação foram feitas para pessoas que estão escolhendo entre camadas adjacentes da stack, não apenas entre marcas. Em muitos casos a decisão real é entre usar uma API de modelo, um builder hospedado ou um runtime de capacidades reutilizável.",
      "Por isso a seção de comparação foca em encaixe, modelo operacional e consequências no workflow. Cada página deve ajudar a entender qual problema cada camada resolve antes de decidir qual produto entra na arquitetura.",
    ],
    usageTitle: "O que você encontra aqui",
    usagePoints: [
      "Comparações diretas com APIs de mídia e camadas adjacentes de tooling para agentes.",
      "Páginas de alternativas para equipes que procuram substitutos melhores para workflows dirigidos por agentes.",
      "Uma explicação mais clara de onde o AnyCap entra em relação a APIs, builders e ferramentas criativas voltadas a humanos.",
    ],
  },
};

const hubBaseDefinitionsByLocale: Partial<Record<SiteLocale, HubBaseDefinitionsByKey>> = {
  en: hubBaseDefinitionsEn,
  "pt-br": hubBaseDefinitionsPtBr,
};

const hubItemCopyEn: HubItemCopyByHubPath = {
  "/for": {
    "/for/claude-code": {
      title: "Claude Code",
      description: "Add image, video, and vision workflows to Claude Code through one install path.",
    },
    "/for/cursor": {
      title: "Cursor",
      description: "Equip Cursor with image generation, video generation, and visual analysis capabilities.",
    },
    "/for/codex": {
      title: "Codex",
      description: "Add multimodal capabilities to Codex without wiring separate provider SDKs.",
    },
    "/for/manus": {
      title: "Manus",
      description: "Give Manus a unified capability runtime for image, video, and vision tasks.",
    },
  },
  "/guides": {
    "/guides/install-anycap": {
      title: "Install AnyCap",
      description: "Install the CLI, authenticate once, and verify the capability runtime is ready.",
    },
    "/guides/mcp-vs-skills": {
      title: "MCP vs Skills",
      description: "Understand when you need the protocol layer, the instruction layer, or both for an agent workflow.",
    },
    "/guides/add-tools-to-claude-code": {
      title: "Add Tools to Claude Code",
      description: "Wire AnyCap into Claude Code so agents can call multimodal tools directly.",
    },
    "/guides/context-engineering-for-agents": {
      title: "Context Engineering for Agents",
      description: "Structure prompts, files, and working context so agents stay grounded and useful.",
    },
    "/guides/agent-skills-for-developer-tools": {
      title: "Agent Skills for Developer Tools",
      description: "Use reusable skills to keep agent workflows consistent across projects.",
    },
    "/guides/workspace-context-engineering": {
      title: "Workspace Context Engineering",
      description: "Design workspace-level context so long-running coding agents stay oriented.",
    },
    "/guides/what-is-agent-harness": {
      title: "What Is Agent Harness?",
      description: "Understand the execution layer that turns tool access into dependable agent behavior.",
    },
    "/guides/how-to-add-image-generation-to-ai-agent": {
      title: "How to Add Image Generation to AI Agent",
      description: "Add image-generation workflows to an AI agent without stitching together separate provider SDKs by hand.",
    },
    "/guides/how-to-add-video-generation-to-ai-agent": {
      title: "How to Add Video Generation to AI Agent",
      description: "Add video-generation workflows to an AI agent through one capability layer instead of one-off media API wiring.",
    },
    "/guides/how-to-add-vision-to-ai-agent": {
      title: "How to Add Vision to AI Agent",
      description: "Add image-reading and visual analysis workflows to an AI agent through a stable capability surface.",
    },
  },
  "/glossary": {
    "/glossary/context-engineering": {
      title: "Context Engineering",
      description: "The practice of shaping inputs, files, and memory so an agent can work reliably.",
    },
    "/glossary/agent-harness": {
      title: "Agent Harness",
      description: "The execution environment that manages tools, files, prompts, and agent safety rails.",
    },
    "/glossary/agent-capability-runtime": {
      title: "Agent Capability Runtime",
      description: "A runtime layer that gives agents a stable way to call capabilities across providers.",
    },
  },
  "/compare": {
    "/compare/anycap-vs-composio": {
      title: "AnyCap vs Composio",
      description: "Compare capability-runtime design with app-connector style integrations.",
    },
    "/compare/anycap-vs-openai-agent-builder": {
      title: "AnyCap vs OpenAI Agent Builder",
      description: "See where AnyCap fits alongside hosted agent-building workflows.",
    },
    "/compare/anycap-vs-replicate": {
      title: "AnyCap vs Replicate",
      description: "Compare an agent capability runtime with a model-inference API and deployment platform.",
    },
    "/compare/anycap-vs-fal-ai": {
      title: "AnyCap vs fal.ai",
      description: "Compare cross-agent capability access with a queue-first generative media API stack.",
    },
    "/compare/anycap-vs-openclaw-image-generation": {
      title: "AnyCap vs OpenClaw (Image)",
      description: "Compare agent-native image generation with a human-facing AI image editing interface.",
    },
    "/compare/anycap-vs-openclaw-video-generation": {
      title: "AnyCap vs OpenClaw (Video)",
      description: "Compare agent-native video generation with a human-facing AI video creation interface.",
    },
    "/compare/replicate-alternatives-for-agents": {
      title: "Replicate Alternatives for Agents",
      description: "Compare alternatives to Replicate when the goal is agent-usable capabilities rather than only model inference endpoints.",
    },
    "/compare/fal-ai-alternatives-for-agents": {
      title: "fal.ai Alternatives for Agents",
      description: "Compare alternatives to fal.ai when the workflow needs a capability runtime that agents can use directly.",
    },
  },
};

const hubItemCopyPtBr: HubItemCopyByHubPath = {
  "/for": {
    "/for/claude-code": {
      title: "Claude Code",
      description: "Adicione fluxos de imagem, vídeo e visão ao Claude Code por meio de um único caminho de instalação.",
    },
    "/for/cursor": {
      title: "Cursor",
      description: "Equipe o Cursor com geração de imagem, geração de vídeo e capacidades de análise visual.",
    },
    "/for/codex": {
      title: "Codex",
      description: "Adicione capacidades multimodais ao Codex sem conectar SDKs de provedor separados.",
    },
    "/for/manus": {
      title: "Manus",
      description: "Dê ao Manus um runtime de capacidades unificado para tarefas de imagem, vídeo e visão.",
    },
  },
  "/guides": {
    "/guides/install-anycap": {
      title: "Instalar o AnyCap",
      description: "Instale a CLI, autentique uma vez e confirme que o runtime de capacidades está pronto.",
    },
    "/guides/mcp-vs-skills": {
      title: "MCP vs Skills",
      description: "Entenda quando você precisa da camada de protocolo, da camada de instrução, ou das duas em um fluxo com agentes.",
    },
    "/guides/add-tools-to-claude-code": {
      title: "Adicionar Ferramentas ao Claude Code",
      description: "Conecte o AnyCap ao Claude Code para que agentes possam chamar ferramentas multimodais diretamente.",
    },
    "/guides/context-engineering-for-agents": {
      title: "Engenharia de Contexto para Agentes",
      description: "Estruture prompts, arquivos e contexto de trabalho para que agentes permaneçam úteis e bem ancorados.",
    },
    "/guides/agent-skills-for-developer-tools": {
      title: "Skills de Agente para Ferramentas de Desenvolvimento",
      description: "Use skills reutilizáveis para manter fluxos com agentes consistentes entre projetos.",
    },
    "/guides/workspace-context-engineering": {
      title: "Engenharia de Contexto do Workspace",
      description: "Projete contexto no nível do workspace para que agentes de código de longa duração não percam a orientação.",
    },
    "/guides/what-is-agent-harness": {
      title: "O que é Agent Harness?",
      description: "Entenda a camada de execução que transforma acesso a ferramentas em comportamento confiável do agente.",
    },
    "/guides/how-to-add-image-generation-to-ai-agent": {
      title: "Como adicionar geração de imagem a um agente de IA",
      description: "Adicione fluxos de geração de imagem a um agente de IA sem costurar manualmente SDKs separados de provedores.",
    },
    "/guides/how-to-add-video-generation-to-ai-agent": {
      title: "Como adicionar geração de vídeo a um agente de IA",
      description: "Adicione fluxos de geração de vídeo a um agente de IA por meio de uma camada de capacidades em vez de integrações isoladas de mídia.",
    },
    "/guides/how-to-add-vision-to-ai-agent": {
      title: "Como adicionar visão a um agente de IA",
      description: "Adicione leitura de imagem e análise visual a um agente de IA por meio de uma superfície de capacidades estável.",
    },
  },
  "/glossary": {
    "/glossary/context-engineering": {
      title: "Engenharia de Contexto",
      description: "A prática de moldar entradas, arquivos e memória para que um agente trabalhe com confiabilidade.",
    },
    "/glossary/agent-harness": {
      title: "Agent Harness",
      description: "O ambiente de execução que gerencia ferramentas, arquivos, prompts e travas de segurança do agente.",
    },
    "/glossary/agent-capability-runtime": {
      title: "Runtime de Capacidade do Agente",
      description: "Uma camada de runtime que dá aos agentes uma forma estável de chamar capacidades entre provedores.",
    },
  },
  "/compare": {
    "/compare/anycap-vs-composio": {
      title: "AnyCap vs Composio",
      description: "Compare o design de runtime de capacidades com integrações no estilo conectores de aplicativos.",
    },
    "/compare/anycap-vs-openai-agent-builder": {
      title: "AnyCap vs OpenAI Agent Builder",
      description: "Veja onde o AnyCap se encaixa ao lado de fluxos hospedados de construção de agentes.",
    },
    "/compare/anycap-vs-replicate": {
      title: "AnyCap vs Replicate",
      description: "Compare um runtime de capacidades para agentes com uma API de inferência de modelos e uma plataforma de deploy.",
    },
    "/compare/anycap-vs-fal-ai": {
      title: "AnyCap vs fal.ai",
      description: "Compare acesso a capacidades entre agentes com uma stack de API generativa de mídia orientada a fila.",
    },
    "/compare/anycap-vs-openclaw-image-generation": {
      title: "AnyCap vs OpenClaw (Imagem)",
      description: "Compare geração de imagem nativa de agente com uma interface de edição de imagem de IA voltada para humanos.",
    },
    "/compare/anycap-vs-openclaw-video-generation": {
      title: "AnyCap vs OpenClaw (Vídeo)",
      description: "Compare geração de vídeo nativa de agente com uma interface de criação de vídeo de IA voltada para humanos.",
    },
    "/compare/replicate-alternatives-for-agents": {
      title: "Alternativas ao Replicate para agentes",
      description: "Compare alternativas ao Replicate quando o objetivo é oferecer capacidades utilizáveis por agentes, e não apenas endpoints de inferência de modelos.",
    },
    "/compare/fal-ai-alternatives-for-agents": {
      title: "Alternativas ao fal.ai para agentes",
      description: "Compare alternativas ao fal.ai quando o fluxo precisa de um runtime de capacidades que agentes possam usar diretamente.",
    },
  },
};

const hubItemCopyByLocale: Partial<Record<SiteLocale, HubItemCopyByHubPath>> = {
  en: hubItemCopyEn,
  "pt-br": hubItemCopyPtBr,
};

function getHubBaseDefinition(locale: SiteLocale, key: HubPageKey): HubPageBaseDefinition {
  return hubBaseDefinitionsByLocale[locale]?.[key] ?? hubBaseDefinitionsEn[key];
}

function getDirectHubRoutePaths(hubPath: HubPagePath): string[] {
  const hubNode = getSeoIaNodeByPath(hubPath);
  if (!hubNode) {
    throw new Error(`Missing IA hub node for path: ${hubPath}`);
  }

  return getSeoIaNodes()
    .filter((node): node is typeof node & { path: string } => {
      return node.parentId === hubNode.id && typeof node.path === "string";
    })
    .map((node) => node.path);
}

function getItemCopy(locale: SiteLocale, hubPath: HubPagePath, routePath: string): HubItemCopy {
  const localizedCopy = hubItemCopyByLocale[locale]?.[hubPath]?.[routePath];
  if (localizedCopy) {
    return localizedCopy;
  }

  const fallbackCopy = hubItemCopyEn[hubPath][routePath];
  if (!fallbackCopy) {
    throw new Error(`Missing hub item copy for ${hubPath} -> ${routePath}`);
  }

  return fallbackCopy;
}

function buildHubItems(hubPath: HubPagePath, locale: SiteLocale): HubPageItem[] {
  return getDirectHubRoutePaths(hubPath).map((routePath) => {
    const copy = getItemCopy(locale, hubPath, routePath);
    return {
      title: copy.title,
      href: routePath,
      description: copy.description,
    };
  });
}

function validateHubItemCoverage() {
  const hubPaths = Object.keys(hubItemCopyEn) as HubPagePath[];

  for (const hubPath of hubPaths) {
    const expectedPaths = getDirectHubRoutePaths(hubPath);
    const configuredPaths = Object.keys(hubItemCopyEn[hubPath]).sort();
    const expectedSorted = [...expectedPaths].sort();

    if (configuredPaths.length !== expectedSorted.length) {
      throw new Error(
        `Hub item copy count mismatch for ${hubPath}: expected ${expectedSorted.length}, got ${configuredPaths.length}`,
      );
    }

    for (const routePath of expectedSorted) {
      if (!configuredPaths.includes(routePath)) {
        throw new Error(`Missing hub item copy for ${hubPath} -> ${routePath}`);
      }
    }

    for (const routePath of configuredPaths) {
      if (!expectedSorted.includes(routePath)) {
        throw new Error(`Orphan hub item copy for ${hubPath} -> ${routePath}`);
      }
    }
  }
}

validateHubItemCoverage();

export function getHubPageDefinition(
  locale: SiteLocale,
  key: HubPageKey,
): HubPageDefinition {
  const base = getHubBaseDefinition(locale, key);

  return {
    ...base,
    items: buildHubItems(base.path, locale),
  };
}
