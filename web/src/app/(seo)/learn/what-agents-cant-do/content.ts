import type { Metadata } from "next";
import { createFaqPageJsonLd, createTechArticleJsonLd } from "@/lib/schema";
import { getLocaleConfig, siteConfig, type SiteLocale } from "@/lib/site";

export const WHAT_AGENTS_CANT_DO_PATH = "/learn/what-agents-cant-do";

type WhatAgentsCantDoPageData = {
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
  heroTitle: [string, string];
  heroIntro: string;
  table: {
    eyebrow: string;
    title: string;
    description: string;
    columns: readonly { label: string; accent?: boolean }[];
    footnote: string;
    rows: readonly {
      capability: string;
      cells: readonly (
        | string
        | {
            label: string;
            tone: "muted" | "accent";
          }
      )[];
    }[];
  };
  intentTitle: string;
  intentCards: readonly {
    eyebrow: string;
    title: string;
    href: string;
    summary: string;
  }[];
  faqTitle: string;
  faqItems: readonly { question: string; answer: string }[];
  ctas: readonly { href: string; label: string; variant: "primary" | "secondary" }[];
};

const faqItemsEn = [
  {
    question: "What do AI agents usually miss first?",
    answer:
      "The first missing pieces are usually image generation, video generation, screenshot understanding, and recording analysis. The agent can plan the work, but it cannot finish those tasks through a consistent runtime.",
  },
  {
    question: "Can coding agents generate images or videos on their own?",
    answer:
      "Not as a built-in capability layer. Some agents can call custom tools, but most teams still need to add a consistent runtime for image generation, video generation, and media understanding.",
  },
  {
    question: "Do I need to switch agents to get those capabilities?",
    answer:
      "No. The point of AnyCap is to keep the agent you already use and add the missing capability layer around it.",
  },
  {
    question: "Where should I start if I already like my current agent?",
    answer:
      "Start with the capability page that matches the missing task, such as image generation, video generation, image understanding, or video analysis. If you need the agent-specific entry first, use the Equip Agents pages.",
  },
] as const;

const faqItemsPtBr = [
  {
    question: "O que os agentes de IA normalmente não conseguem fazer primeiro?",
    answer:
      "As primeiras lacunas costumam ser geração de imagem, geração de vídeo, entendimento de capturas de tela e análise de gravações. O agente consegue planejar o trabalho, mas não consegue concluir essas tarefas por meio de um runtime consistente.",
  },
  {
    question: "Agentes de código conseguem gerar imagens ou vídeos sozinhos?",
    answer:
      "Não como uma camada de capacidade nativa. Alguns agentes conseguem chamar ferramentas customizadas, mas a maioria dos times ainda precisa adicionar um runtime consistente para geração de imagem, geração de vídeo e entendimento de mídia.",
  },
  {
    question: "Preciso trocar de agente para ter essas capacidades?",
    answer:
      "Não. A ideia do AnyCap é manter o agente que você já usa e adicionar a camada de capacidade que falta ao redor dele.",
  },
  {
    question: "Por onde começar se eu já gosto do meu agente atual?",
    answer:
      "Comece pela página de capacidade que corresponde à tarefa ausente, como geração de imagem, geração de vídeo, entendimento de imagem ou análise de vídeo. Se você precisar primeiro da entrada específica do agente, use as páginas de Equipe Agentes.",
  },
] as const;

const faqItemsDe = [
  {
    question: "Was fehlt KI-Agenten meist zuerst?",
    answer:
      "Die ersten fehlenden Stücke sind meist Bildgenerierung, Videogenerierung, Screenshot-Verständnis und Aufzeichnungsanalyse. Der Agent kann die Arbeit planen, aber diese Aufgaben nicht über eine konsistente Runtime abschließen.",
  },
  {
    question: "Können Coding-Agenten eigenständig Bilder oder Videos erzeugen?",
    answer:
      "Nicht als integrierte Capability-Schicht. Manche Agenten können Custom-Tools aufrufen, doch die meisten Teams müssen weiterhin eine konsistente Runtime für Bildgenerierung, Videogenerierung und Medienverständnis ergänzen.",
  },
  {
    question: "Muss ich den Agenten wechseln, um diese Kapazitäten zu erhalten?",
    answer:
      "Nein. Der Sinn von AnyCap ist es, den Agenten, den Sie bereits nutzen, zu behalten und die fehlende Capability-Schicht drumherum zu ergänzen.",
  },
  {
    question: "Wo sollte ich beginnen, wenn mir mein aktueller Agent schon gefällt?",
    answer:
      "Beginnen Sie mit der Kapazitätenseite, die zur fehlenden Aufgabe passt – etwa Bildgenerierung, Videogenerierung, Bildverständnis oder Videoanalyse. Wenn Sie zuerst den agent-spezifischen Einstieg brauchen, nutzen Sie die Seiten unter „Agenten ausstatten“.",
  },
] as const;

const baseRows = [
  {
    capability: "Image generation",
    cells: [
      { label: "Not built in", tone: "muted" },
      { label: "Generate mockups, thumbnails, and creative assets", tone: "accent" },
      "Use the Image Generation capability page",
    ],
  },
  {
    capability: "Video generation",
    cells: [
      { label: "Not built in", tone: "muted" },
      { label: "Create demos, walkthroughs, and short clips", tone: "accent" },
      "Use the Video Generation capability page",
    ],
  },
  {
    capability: "Image understanding",
    cells: [
      { label: "No consistent agent runtime", tone: "muted" },
      { label: "Read screenshots, diagrams, and visual references", tone: "accent" },
      "Use the Image Understanding capability page",
    ],
  },
  {
    capability: "Video analysis",
    cells: [
      { label: "Separate provider work", tone: "muted" },
      { label: "Analyze recordings through the same CLI", tone: "accent" },
      "Use the Video Analysis capability page",
    ],
  },
] as const satisfies readonly {
  capability: string;
  cells: readonly (
    | string
    | {
        label: string;
        tone: "muted" | "accent";
      }
  )[];
}[];

const contentByLocale: Record<SiteLocale, WhatAgentsCantDoPageData> = {
  en: {
    breadcrumbItems: [
      { name: "Home", href: "/" },
      { name: "Learn", href: "/learn" },
      { name: "What Agents Can't Do", href: WHAT_AGENTS_CANT_DO_PATH },
    ],
    eyebrow: "Learn",
    metadata: {
      title: "What AI Agents Can't Do — And How to Fix It",
      description:
        "AI agents can reason, but out of the box they still struggle with image generation, video generation, screenshot understanding, recording analysis, and shareable output workflows.",
      openGraphTitle: "What AI agents can't do out of the box - and how to add capabilities",
      openGraphDescription:
        "See the most common capability gaps in modern AI agents and the shortest AnyCap path to close each one.",
    },
    articleJsonLd: createTechArticleJsonLd({
      headline: "What AI agents can't do out of the box - and how to add capabilities",
      description:
        "Problem-intent guide covering the capability gaps that appear when coding agents need image, video, and vision workflows.",
      path: WHAT_AGENTS_CANT_DO_PATH,
      about: ["AI agents", "Coding agents", "Image generation", "Video generation", "Image understanding", "Video analysis"],
      keywords: [
        "what ai agents can't do",
        "coding agent limitations",
        "ai agent capability gaps",
        "ai agent can't generate video",
        "extend ai agent capabilities",
      ],
      datePublished: "2026-04-07",
      dateModified: "2026-04-07",
    }),
    faqJsonLd: createFaqPageJsonLd(faqItemsEn),
    heroTitle: ["AI agents can reason.", "They still need capabilities."],
    heroIntro:
      "The gap usually appears the same way every time: the agent can plan the work, but it cannot generate the image, create the video, read the screenshot, or inspect the recording through a consistent runtime. Whether you use Claude Code, Cursor, Codex, or another assistant shell, the fix is usually not a brand-new agent. It is the missing capability layer around the one you already like.",
    table: {
      eyebrow: "Common breakpoints",
      title: "Where agents hit the wall first",
      description:
        "These are the common workflows where coding agents hit a hard boundary and need an external capability layer.",
      columns: [
        { label: "Without AnyCap" },
        { label: "Add with AnyCap", accent: true },
        { label: "Best next move" },
      ],
      footnote: "Use the rightmost column to jump to the shortest next page for the exact missing capability.",
      rows: baseRows,
    },
    intentTitle: "Choose the shortest page for the missing capability",
    intentCards: [
      {
        eyebrow: "Image gap",
        title: "Image Generation",
        href: "/capabilities/image-generation",
        summary: "Best page when the missing capability is product visuals, marketing assets, mockups, or creative output.",
      },
      {
        eyebrow: "Video gap",
        title: "Video Generation",
        href: "/capabilities/video-generation",
        summary: "Best page when the missing capability is demos, walkthroughs, motion assets, or short clips.",
      },
      {
        eyebrow: "Vision gap",
        title: "Image Understanding",
        href: "/capabilities/image-understanding",
        summary: "Best page when the workflow starts from screenshots, diagrams, OCR, or visual QA.",
      },
      {
        eyebrow: "Analysis gap",
        title: "Video Analysis",
        href: "/capabilities/video-analysis",
        summary: "Best page when the problem lives in a recording instead of a text log or static screenshot.",
      },
    ],
    faqTitle: "FAQ",
    faqItems: faqItemsEn,
    ctas: [
      { href: "/start", label: "Get Started", variant: "primary" },
      { href: "/for", label: "Equip Agents", variant: "secondary" },
      { href: "/capabilities", label: "Browse Capabilities", variant: "secondary" },
    ],
  },
  "pt-br": {
    breadcrumbItems: [
      { name: "Início", href: "/" },
      { name: "Aprender", href: "/learn" },
      { name: "O que os agentes não conseguem fazer", href: WHAT_AGENTS_CANT_DO_PATH },
    ],
    eyebrow: "Aprender",
    metadata: {
      title: "O que os agentes de IA não conseguem fazer de fábrica - e como adicionar capacidades",
      description:
        "Agentes de IA conseguem raciocinar, mas de fábrica ainda têm dificuldade com geração de imagem, geração de vídeo, entendimento de capturas de tela, análise de gravações e fluxos de saída compartilháveis.",
      openGraphTitle: "O que os agentes de IA não conseguem fazer de fábrica - e como adicionar capacidades",
      openGraphDescription:
        "Veja as lacunas de capacidade mais comuns em agentes de IA modernos e o caminho mais curto do AnyCap para fechar cada uma.",
    },
    articleJsonLd: createTechArticleJsonLd({
      headline: "O que os agentes de IA não conseguem fazer de fábrica - e como adicionar capacidades",
      description:
        "Guia de intenção de problema cobrindo as lacunas de capacidade que aparecem quando agentes de código precisam de fluxos de imagem, vídeo e visão.",
      path: WHAT_AGENTS_CANT_DO_PATH,
      about: ["agentes de IA", "agentes de código", "geração de imagem", "geração de vídeo", "entendimento de imagem", "análise de vídeo"],
      keywords: [
        "o que agentes de ia não conseguem fazer",
        "limitações de agente de código",
        "lacunas de capacidade de agentes de ia",
        "agente de ia não consegue gerar video",
        "expandir capacidades de agentes de ia",
      ],
      datePublished: "2026-04-07",
      dateModified: "2026-04-07",
    }),
    faqJsonLd: createFaqPageJsonLd(faqItemsPtBr),
    heroTitle: ["Agentes de IA conseguem raciocinar.", "Ainda assim precisam de capacidades."],
    heroIntro:
      "A lacuna costuma aparecer do mesmo jeito toda vez: o agente consegue planejar o trabalho, mas não consegue gerar a imagem, criar o vídeo, ler a captura de tela ou inspecionar a gravação por meio de um runtime consistente. Seja no Claude Code, Cursor, Codex ou em outro shell de assistente, a correção normalmente não é trocar de agente. É adicionar a camada de capacidade que falta ao redor do que você já usa.",
    table: {
      eyebrow: "Pontos de quebra",
      title: "Onde os agentes batem no limite primeiro",
      description:
        "Esses são os fluxos mais comuns em que agentes de código encontram um limite duro e precisam de uma camada externa de capacidade.",
      columns: [
        { label: "Sem AnyCap" },
        { label: "Adicionar com AnyCap", accent: true },
        { label: "Próxima ação" },
      ],
      footnote: "Use a coluna da direita para ir direto à página mais curta para a capacidade ausente exata.",
      rows: [
        {
          capability: "Geração de imagem",
          cells: [
            { label: "Não vem nativo", tone: "muted" },
            { label: "Gerar mockups, thumbnails e ativos criativos", tone: "accent" },
            "Use a página de capacidade de Geração de Imagem",
          ],
        },
        {
          capability: "Geração de vídeo",
          cells: [
            { label: "Não vem nativo", tone: "muted" },
            { label: "Criar demos, walkthroughs e clipes curtos", tone: "accent" },
            "Use a página de capacidade de Geração de Vídeo",
          ],
        },
        {
          capability: "Entendimento de imagem",
          cells: [
            { label: "Sem runtime consistente", tone: "muted" },
            { label: "Ler capturas de tela, diagramas e referências visuais", tone: "accent" },
            "Use a página de capacidade de Entendimento de Imagem",
          ],
        },
        {
          capability: "Análise de vídeo",
          cells: [
            { label: "Trabalho separado por provedor", tone: "muted" },
            { label: "Analisar gravações pelo mesmo CLI", tone: "accent" },
            "Use a página de capacidade de Análise de Vídeo",
          ],
        },
      ] as const satisfies readonly {
        capability: string;
        cells: readonly (
          | string
          | {
              label: string;
              tone: "muted" | "accent";
            }
        )[];
      }[],
    },
    intentTitle: "Escolha a página mais curta para a capacidade ausente",
    intentCards: [
      {
        eyebrow: "Lacuna de imagem",
        title: "Geração de Imagem",
        href: "/capabilities/image-generation",
        summary: "Melhor página quando a capacidade ausente é visual de produto, ativos de marketing, mockups ou output criativo.",
      },
      {
        eyebrow: "Lacuna de vídeo",
        title: "Geração de Vídeo",
        href: "/capabilities/video-generation",
        summary: "Melhor página quando a capacidade ausente é demo, walkthrough, motion asset ou clipe curto.",
      },
      {
        eyebrow: "Lacuna de visão",
        title: "Entendimento de Imagem",
        href: "/capabilities/image-understanding",
        summary: "Melhor página quando o fluxo começa em capturas de tela, diagramas, OCR ou QA visual.",
      },
      {
        eyebrow: "Lacuna de análise",
        title: "Análise de Vídeo",
        href: "/capabilities/video-analysis",
        summary: "Melhor página quando o problema mora em uma gravação, e não em um log de texto ou captura estática.",
      },
    ],
    faqTitle: "FAQ",
    faqItems: faqItemsPtBr,
    ctas: [
      { href: "/start", label: "Começar", variant: "primary" },
      { href: "/for", label: "Equipe Agentes", variant: "secondary" },
      { href: "/capabilities", label: "Navegar Capacidades", variant: "secondary" },
    ],
  },
  id: {
    breadcrumbItems: [
      { name: "Home", href: "/" },
      { name: "Learn", href: "/learn" },
      { name: "What Agents Can't Do", href: WHAT_AGENTS_CANT_DO_PATH },
    ],
    eyebrow: "Learn",
    metadata: {
      title: "What AI Agents Can't Do — And How to Fix It",
      description:
        "AI agents can reason, but out of the box they still struggle with image generation, video generation, screenshot understanding, recording analysis, and shareable output workflows.",
      openGraphTitle: "What AI agents can't do out of the box - and how to add capabilities",
      openGraphDescription:
        "See the most common capability gaps in modern AI agents and the shortest AnyCap path to close each one.",
    },
    articleJsonLd: createTechArticleJsonLd({
      headline: "What AI agents can't do out of the box - and how to add capabilities",
      description:
        "Problem-intent guide covering the capability gaps that appear when coding agents need image, video, and vision workflows.",
      path: WHAT_AGENTS_CANT_DO_PATH,
      about: ["AI agents", "Coding agents", "Image generation", "Video generation", "Image understanding", "Video analysis"],
      keywords: [
        "what ai agents can't do",
        "coding agent limitations",
        "ai agent capability gaps",
        "ai agent can't generate video",
        "extend ai agent capabilities",
      ],
      datePublished: "2026-04-07",
      dateModified: "2026-04-07",
    }),
    faqJsonLd: createFaqPageJsonLd(faqItemsEn),
    heroTitle: ["AI agents can reason.", "They still need capabilities."],
    heroIntro:
      "The gap usually appears the same way every time: the agent can plan the work, but it cannot generate the image, create the video, read the screenshot, or inspect the recording through a consistent runtime. Whether you use Claude Code, Cursor, Codex, or another assistant shell, the fix is usually not a brand-new agent. It is the missing capability layer around the one you already like.",
    table: {
      eyebrow: "Common breakpoints",
      title: "Where agents hit the wall first",
      description:
        "These are the common workflows where coding agents hit a hard boundary and need an external capability layer.",
      columns: [
        { label: "Without AnyCap" },
        { label: "Add with AnyCap", accent: true },
        { label: "Best next move" },
      ],
      footnote: "Use the rightmost column to jump to the shortest next page for the exact missing capability.",
      rows: baseRows,
    },
    intentTitle: "Choose the shortest page for the missing capability",
    intentCards: [
      {
        eyebrow: "Image gap",
        title: "Image Generation",
        href: "/capabilities/image-generation",
        summary: "Best page when the missing capability is product visuals, marketing assets, mockups, or creative output.",
      },
      {
        eyebrow: "Video gap",
        title: "Video Generation",
        href: "/capabilities/video-generation",
        summary: "Best page when the missing capability is demos, walkthroughs, motion assets, or short clips.",
      },
      {
        eyebrow: "Vision gap",
        title: "Image Understanding",
        href: "/capabilities/image-understanding",
        summary: "Best page when the workflow starts from screenshots, diagrams, OCR, or visual QA.",
      },
      {
        eyebrow: "Analysis gap",
        title: "Video Analysis",
        href: "/capabilities/video-analysis",
        summary: "Best page when the problem lives in a recording instead of a text log or static screenshot.",
      },
    ],
    faqTitle: "FAQ",
    faqItems: faqItemsEn,
    ctas: [
      { href: "/start", label: "Get Started", variant: "primary" },
      { href: "/for", label: "Equip Agents", variant: "secondary" },
      { href: "/capabilities", label: "Browse Capabilities", variant: "secondary" },
    ],
  },
  de: {
    breadcrumbItems: [
      { name: "Start", href: "/" },
      { name: "Lernen", href: "/learn" },
      { name: "Was Agenten nicht können", href: WHAT_AGENTS_CANT_DO_PATH },
    ],
    eyebrow: "Lernen",
    metadata: {
      title: "Was KI-Agenten out of the box nicht können – und wie Sie Kapazitäten ergänzen",
      description:
        "KI-Agenten können planen, aber out of the box scheitern sie weiterhin an Bildgenerierung, Videogenerierung, Screenshot-Verständnis, Aufzeichnungsanalyse und teilbaren Output-Workflows.",
      openGraphTitle: "Was KI-Agenten out of the box nicht können – und wie Sie Kapazitäten ergänzen",
      openGraphDescription:
        "Sehen Sie die häufigsten Kapazitätslücken moderner KI-Agenten und den kürzesten AnyCap-Weg, jede einzelne zu schließen.",
    },
    articleJsonLd: createTechArticleJsonLd({
      headline: "Was KI-Agenten out of the box nicht können – und wie Sie Kapazitäten ergänzen",
      description:
        "Problem-Intent-Leitfaden zu den Kapazitätslücken, die auftreten, wenn Coding-Agenten Bild-, Video- und Vision-Workflows benötigen.",
      path: WHAT_AGENTS_CANT_DO_PATH,
      about: ["KI-Agenten", "Coding-Agenten", "Bildgenerierung", "Videogenerierung", "Bildverständnis", "Videoanalyse"],
      keywords: [
        "was ki-agenten nicht können",
        "coding-agent limitierungen",
        "ki-agent kapazitätslücken",
        "ki-agent kann kein video erzeugen",
        "ki-agent kapazitäten erweitern",
      ],
      datePublished: "2026-04-07",
      dateModified: "2026-04-07",
    }),
    faqJsonLd: createFaqPageJsonLd(faqItemsDe),
    heroTitle: ["KI-Agenten können denken.", "Sie brauchen trotzdem Kapazitäten."],
    heroIntro:
      "Die Lücke zeigt sich meist auf dieselbe Weise: Der Agent kann die Arbeit planen, aber er kann das Bild nicht erzeugen, das Video nicht erstellen, den Screenshot nicht lesen oder die Aufzeichnung nicht über eine konsistente Runtime auswerten. Egal ob Sie Claude Code, Cursor, Codex oder eine andere Assistant-Shell nutzen – die Lösung ist meist kein neuer Agent, sondern die fehlende Capability-Schicht um den, den Sie bereits mögen.",
    table: {
      eyebrow: "Häufige Bruchstellen",
      title: "Wo Agenten zuerst an die Wand fahren",
      description:
        "Das sind die typischen Workflows, in denen Coding-Agenten an eine harte Grenze stoßen und eine externe Capability-Schicht benötigen.",
      columns: [
        { label: "Ohne AnyCap" },
        { label: "Mit AnyCap ergänzen", accent: true },
        { label: "Bester nächster Schritt" },
      ],
      footnote: "Nutzen Sie die rechte Spalte, um direkt zur passenden Seite für die fehlende Kapazität zu springen.",
      rows: [
        {
          capability: "Bildgenerierung",
          cells: [
            { label: "Nicht eingebaut", tone: "muted" },
            { label: "Mockups, Thumbnails und Creative-Assets erzeugen", tone: "accent" },
            "Zur Seite Bildgenerierung",
          ],
        },
        {
          capability: "Videogenerierung",
          cells: [
            { label: "Nicht eingebaut", tone: "muted" },
            { label: "Demos, Walkthroughs und kurze Clips erstellen", tone: "accent" },
            "Zur Seite Videogenerierung",
          ],
        },
        {
          capability: "Bildverständnis",
          cells: [
            { label: "Keine konsistente Agent-Runtime", tone: "muted" },
            { label: "Screenshots, Diagramme und visuelle Referenzen lesen", tone: "accent" },
            "Zur Seite Bildverständnis",
          ],
        },
        {
          capability: "Videoanalyse",
          cells: [
            { label: "Separate Provider-Arbeit", tone: "muted" },
            { label: "Aufzeichnungen über dieselbe CLI analysieren", tone: "accent" },
            "Zur Seite Videoanalyse",
          ],
        },
      ],
    },
    intentTitle: "Wählen Sie die kürzeste Seite für die fehlende Kapazität",
    intentCards: [
      {
        eyebrow: "Bild-Lücke",
        title: "Bildgenerierung",
        href: "/capabilities/image-generation",
        summary: "Beste Seite, wenn die fehlende Kapazität Produktvisuals, Marketing-Assets, Mockups oder Creative-Output sind.",
      },
      {
        eyebrow: "Video-Lücke",
        title: "Videogenerierung",
        href: "/capabilities/video-generation",
        summary: "Beste Seite, wenn die fehlende Kapazität Demos, Walkthroughs, Motion-Assets oder kurze Clips sind.",
      },
      {
        eyebrow: "Vision-Lücke",
        title: "Bildverständnis",
        href: "/capabilities/image-understanding",
        summary: "Beste Seite, wenn der Workflow bei Screenshots, Diagrammen, OCR oder visuellem QA startet.",
      },
      {
        eyebrow: "Analyse-Lücke",
        title: "Videoanalyse",
        href: "/capabilities/video-analysis",
        summary: "Beste Seite, wenn das Problem in einer Aufzeichnung liegt statt in einem Textlog oder statischen Screenshot.",
      },
    ],
    faqTitle: "FAQ",
    faqItems: faqItemsDe,
    ctas: [
      { href: "/start", label: "Loslegen", variant: "primary" },
      { href: "/for", label: "Agenten ausstatten", variant: "secondary" },
      { href: "/capabilities", label: "Kapazitäten entdecken", variant: "secondary" },
    ],
  },
};

export function getWhatAgentsCantDoMetadata(locale: SiteLocale): Metadata {
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

export function getWhatAgentsCantDoPageData(locale: SiteLocale) {
  return contentByLocale[locale] ?? contentByLocale.en;
}
