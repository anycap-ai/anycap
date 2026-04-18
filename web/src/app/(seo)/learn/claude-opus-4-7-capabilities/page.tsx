import type { Metadata } from "next";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { FadeIn } from "@/components/ui/FadeIn";
import { createFaqPageJsonLd, createTechArticleJsonLd } from "@/lib/schema";
import { getRequestLocale } from "@/lib/request-locale";
import { createLocalizedMetadataForPath } from "@/lib/localized-metadata";
import { defaultLocale, type SiteLocale } from "@/lib/site";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;
const PAGE_PATH = "/learn/claude-opus-4-7-capabilities";
const PAGE_PUBLISHED_ISO = "2026-04-17";
const PAGE_LAST_MODIFIED_ISO = "2026-04-17";

type PageContent = {
  breadcrumbItems: readonly { name: string; href?: string; unlinkable?: boolean }[];
  eyebrow: string;
  lastUpdatedLabel: string;
  heroTitle: [string, string];
  heroIntro: string;
  pillarSections: readonly {
    label: string;
    title: string;
    body: string;
    bullets: readonly string[];
  }[];
  capabilityTableTitle: string;
  capabilityTableNote: string;
  capabilityRows: readonly {
    capability: string;
    opus47: string;
    opus47AnyCap: string;
  }[];
  workflowTitle: string;
  workflowSteps: readonly { title: string; body: string }[];
  ctaTitle: string;
  ctaCards: readonly { title: string; href: string; body: string }[];
  faqTitle: string;
  faqItems: readonly { question: string; answer: string }[];
  articleJsonLd: Record<string, unknown>;
};

const enContent: PageContent = {
  breadcrumbItems: [
    { name: "Home", href: "/" },
    { name: "Learn", href: "/learn", unlinkable: true },
    { name: "Claude Opus 4.7 Capabilities" },
  ],
  eyebrow: "Learn x Claude Opus 4.7",
  lastUpdatedLabel: "Updated April 17, 2026",
  heroTitle: [
    "Claude Opus 4.7 capabilities,",
    "and the one combo that makes it insane.",
  ],
  heroIntro:
    "Claude Opus 4.7 is the strongest reasoning and coding agent Anthropic has shipped. It plans further, writes longer, and uses tools more reliably than any prior Claude model. It still does not generate images, render video, or analyze recordings on its own. Pair Opus 4.7 with AnyCap and the same agent surface reaches Seedream 5, Nano Banana Pro, Veo 3.1, Seedance 1.5 Pro, Kling 3.0, image understanding, and video analysis — through one CLI, one login, and zero glue code. This is a capability map of Opus 4.7 alone, and the realistic upgrade once AnyCap is added.",
  pillarSections: [
    {
      label: "Pillar 1",
      title: "Reasoning, planning, and coding — Opus 4.7's native strengths",
      body:
        "Opus 4.7 is built for long agentic runs. It holds plans across many tool calls, recovers from failed actions, and produces working code that fits an existing codebase rather than a generic snippet. In Claude Code on Opus 4.7, this shows up as longer multi-step refactors, fewer dead-end tool calls, and stronger judgment when picking which file to touch.",
      bullets: [
        "Multi-step refactors and migrations across files without losing the plan.",
        "Test fixing loops that hold the failure context across iterations.",
        "Codebase-aware edits that respect existing patterns rather than inventing new ones.",
        "Tool use that recovers when a shell command or test run fails.",
      ],
    },
    {
      label: "Pillar 2",
      title: "Vision and document reasoning — strong, but read-only",
      body:
        "Opus 4.7 can interpret screenshots, diagrams, and document images you provide. It cannot create new visuals, video, or audio. The moment a workflow needs a generated mockup, a launch teaser, a product walkthrough, or a clip iteration on an existing reference, Opus 4.7 alone runs out of room.",
      bullets: [
        "Screenshot reading for UI bugs, dashboards, and design QA.",
        "Document and diagram interpretation for spec review and design handoff.",
        "No native image generation, video generation, or audio output.",
        "No native video analysis of recordings or screen captures.",
      ],
    },
    {
      label: "Pillar 3",
      title: "The capability gap that AnyCap closes",
      body:
        "AnyCap is an AI agent capability runtime. It plugs into Claude Code on Opus 4.7 through one skill file and one CLI. Once installed, Opus 4.7 can call image generation, video generation, image understanding, and video analysis as if they were native tools. The combo is genuinely insane: the strongest Claude agent ever shipped, plus production-grade media, with no second SDK, no second login, and no extra agent surface.",
      bullets: [
        "Image generation through Seedream 5, Seedream 4.5, Nano Banana Pro, Nano Banana 2.",
        "Video generation through Veo 3.1, Seedance 1.5 Pro, Kling 3.0.",
        "Image understanding for screenshots, references, and visual QA.",
        "Video analysis for bug recordings, demo reviews, and walkthrough QA.",
      ],
    },
  ],
  capabilityTableTitle: "Opus 4.7 alone vs. Opus 4.7 + AnyCap",
  capabilityTableNote:
    "Side-by-side view of what Opus 4.7 ships natively versus what the same agent can do once AnyCap is installed.",
  capabilityRows: [
    {
      capability: "Long-form code reasoning",
      opus47: "Strong — multi-file plans, refactors, and test fixing.",
      opus47AnyCap: "Same. AnyCap does not change the coding loop.",
    },
    {
      capability: "Image generation",
      opus47: "Not available natively.",
      opus47AnyCap: "Seedream 5, Seedream 4.5, Nano Banana Pro, Nano Banana 2.",
    },
    {
      capability: "Video generation",
      opus47: "Not available natively.",
      opus47AnyCap: "Veo 3.1, Seedance 1.5 Pro, Kling 3.0.",
    },
    {
      capability: "Image understanding",
      opus47: "Strong for inputs you provide directly.",
      opus47AnyCap: "Same, plus an agent-callable command for batch and pipeline use.",
    },
    {
      capability: "Video analysis",
      opus47: "Not available natively.",
      opus47AnyCap: "Agent-callable video analysis for recordings and walkthroughs.",
    },
    {
      capability: "Setup overhead",
      opus47: "Single agent surface (Claude Code).",
      opus47AnyCap: "Same agent surface. One skill install, one CLI login.",
    },
  ],
  workflowTitle: "What an Opus 4.7 + AnyCap workflow actually looks like",
  workflowSteps: [
    {
      title: "1. Install once",
      body:
        "Run the AnyCap skill install and CLI login inside the same terminal session Claude Code already uses. No new agent. No new dashboard. No second auth flow.",
    },
    {
      title: "2. Ask Opus 4.7 normally",
      body:
        "Talk to Claude Code the way you already do. \"Generate a launch visual for this product page\" or \"render a 6-second walkthrough from this mockup\" — Opus 4.7 picks the right model and runs the right AnyCap command.",
    },
    {
      title: "3. Iterate inside the same loop",
      body:
        "Outputs come back into the conversation. Opus 4.7 can reason about the result, refine the prompt, switch models, or chain into image-to-video. The full loop stays in one terminal session.",
    },
    {
      title: "4. Ship from the same agent",
      body:
        "When the asset is ready, Claude Code on Opus 4.7 can write the file, update the page, commit the change, and move on — no context switch out of the agent that produced the work.",
    },
  ],
  ctaTitle: "Best next moves",
  ctaCards: [
    {
      title: "Claude Code on Opus 4.7 hub",
      href: "/for/claude-code",
      body: "The primary landing page for the Opus 4.7 + AnyCap combo and the install path.",
    },
    {
      title: "Claude Code image generation",
      href: "/for/claude-code/image-generation",
      body: "Add Seedream 5 and Nano Banana Pro to Opus 4.7 in one CLI.",
    },
    {
      title: "Claude Code video generation",
      href: "/for/claude-code/video-generation",
      body: "Add Veo 3.1, Seedance, and Kling to Opus 4.7 in one CLI.",
    },
    {
      title: "Add tools to Claude Code",
      href: "/guides/add-tools-to-claude-code",
      body: "Step-by-step setup for Opus 4.7 + AnyCap, end to end.",
    },
  ],
  faqTitle: "FAQ",
  faqItems: [
    {
      question: "What is Claude Opus 4.7 best at?",
      answer:
        "Long-horizon reasoning and coding inside Claude Code. Multi-file refactors, test loops, and tool-use that recovers from failures are where Opus 4.7 stands out the most.",
    },
    {
      question: "Can Claude Opus 4.7 generate images or video on its own?",
      answer:
        "No. Opus 4.7 can interpret images you provide, but it does not natively generate images, video, or audio. AnyCap adds those capabilities through one CLI.",
    },
    {
      question: "Why pair Opus 4.7 with AnyCap instead of separate APIs?",
      answer:
        "Because the same Claude Code session can reach image generation, video generation, image understanding, and video analysis through one runtime — no extra SDK, no second login, no separate agent.",
    },
    {
      question: "Which models does AnyCap expose to Opus 4.7?",
      answer:
        "Image: Seedream 5, Seedream 4.5, Nano Banana Pro, Nano Banana 2. Video: Veo 3.1, Seedance 1.5 Pro, Kling 3.0. Plus image understanding and video analysis.",
    },
    {
      question: "Is the Opus 4.7 + AnyCap combo production-ready?",
      answer:
        "Yes. AnyCap runs the same install path and CLI used in production agent workflows today. Claude Code on Opus 4.7 calls AnyCap commands the same way it calls any other tool.",
    },
  ],
  articleJsonLd: createTechArticleJsonLd({
    headline: "Claude Opus 4.7 capabilities — what Opus 4.7 does, what it doesn't, and what Opus 4.7 + AnyCap unlocks",
    description:
      "A capability map of Claude Opus 4.7 — its native strengths, the modalities it does not ship with, and the upgrade once AnyCap adds image generation, video generation, image understanding, and video analysis through one CLI.",
    path: PAGE_PATH,
    about: ["Claude Opus 4.7", "Claude Code", "AI capabilities", "Image generation", "Video generation", "AnyCap"],
    keywords: [
      "claude opus 4.7 capabilities",
      "claude opus 4.7",
      "claude opus 4.7 features",
      "what can claude opus 4.7 do",
      "claude opus 4.7 image generation",
      "claude opus 4.7 video generation",
      "claude code opus 4.7",
    ],
    datePublished: PAGE_PUBLISHED_ISO,
    dateModified: PAGE_LAST_MODIFIED_ISO,
  }),
};

const ptBrContent: PageContent = {
  breadcrumbItems: [
    { name: "Início", href: "/" },
    { name: "Aprender", href: "/learn", unlinkable: true },
    { name: "Capacidades do Claude Opus 4.7" },
  ],
  eyebrow: "Aprender x Claude Opus 4.7",
  lastUpdatedLabel: "Atualizado em 17 de abril de 2026",
  heroTitle: [
    "Capacidades do Claude Opus 4.7,",
    "e a combinação que torna tudo absurdo.",
  ],
  heroIntro:
    "O Claude Opus 4.7 é o agente de raciocínio e código mais forte que a Anthropic já lançou. Ele planeja por mais tempo, escreve mais e usa ferramentas com mais confiabilidade. Mesmo assim, não gera imagens, não renderiza vídeo e não analisa gravações sozinho. Combine o Opus 4.7 com o AnyCap e a mesma superfície de agente alcança Seedream 5, Nano Banana Pro, Veo 3.1, Seedance 1.5 Pro, Kling 3.0, entendimento de imagem e análise de vídeo — por uma única CLI, um único login e sem nenhuma cola.",
  pillarSections: [
    {
      label: "Pilar 1",
      title: "Raciocínio, planejamento e código — pontos fortes nativos do Opus 4.7",
      body:
        "O Opus 4.7 foi construído para execuções agentic longas. Ele mantém planos ao longo de muitas chamadas de ferramenta, se recupera de ações falhas e produz código que se encaixa em uma base existente, em vez de um snippet genérico.",
      bullets: [
        "Refactors e migrações multiarquivo sem perder o plano.",
        "Loops de correção de testes que mantêm o contexto da falha.",
        "Edições que respeitam padrões já existentes na codebase.",
        "Uso de ferramentas que se recupera quando shell ou teste falha.",
      ],
    },
    {
      label: "Pilar 2",
      title: "Visão e leitura de documentos — fortes, mas só de leitura",
      body:
        "O Opus 4.7 interpreta capturas de tela, diagramas e imagens de documentos que você fornece. Mas não cria visuais novos, vídeos ou áudio. Quando o fluxo precisa de um mockup gerado, um teaser de lançamento ou uma iteração image-to-video, o Opus 4.7 sozinho fica sem espaço.",
      bullets: [
        "Leitura de capturas para bugs de UI, dashboards e QA de design.",
        "Interpretação de documentos e diagramas para revisão de specs.",
        "Sem geração nativa de imagem, vídeo ou áudio.",
        "Sem análise nativa de vídeos e screen captures.",
      ],
    },
    {
      label: "Pilar 3",
      title: "A lacuna que o AnyCap fecha",
      body:
        "O AnyCap é um runtime de capacidades para agentes de IA. Ele se conecta ao Claude Code no Opus 4.7 por um arquivo de skill e uma CLI. Depois de instalado, o Opus 4.7 chama geração de imagem, geração de vídeo, entendimento de imagem e análise de vídeo como se fossem ferramentas nativas. A combinação é absurda.",
      bullets: [
        "Geração de imagem com Seedream 5, Seedream 4.5, Nano Banana Pro e Nano Banana 2.",
        "Geração de vídeo com Veo 3.1, Seedance 1.5 Pro e Kling 3.0.",
        "Entendimento de imagem para capturas, referências e QA visual.",
        "Análise de vídeo para gravações de bug, revisões de demo e walkthroughs.",
      ],
    },
  ],
  capabilityTableTitle: "Opus 4.7 sozinho vs. Opus 4.7 + AnyCap",
  capabilityTableNote:
    "Visão lado a lado do que o Opus 4.7 entrega nativamente e do que o mesmo agente faz com o AnyCap instalado.",
  capabilityRows: [
    {
      capability: "Raciocínio de código de longo prazo",
      opus47: "Forte — planos multiarquivo, refactors e correção de testes.",
      opus47AnyCap: "Igual. O AnyCap não muda o loop de código.",
    },
    {
      capability: "Geração de imagem",
      opus47: "Não disponível nativamente.",
      opus47AnyCap: "Seedream 5, Seedream 4.5, Nano Banana Pro, Nano Banana 2.",
    },
    {
      capability: "Geração de vídeo",
      opus47: "Não disponível nativamente.",
      opus47AnyCap: "Veo 3.1, Seedance 1.5 Pro, Kling 3.0.",
    },
    {
      capability: "Entendimento de imagem",
      opus47: "Forte para entradas que você fornece diretamente.",
      opus47AnyCap: "Igual, com comando agent-callable para uso em batch e pipeline.",
    },
    {
      capability: "Análise de vídeo",
      opus47: "Não disponível nativamente.",
      opus47AnyCap: "Análise de vídeo agent-callable para gravações e walkthroughs.",
    },
    {
      capability: "Overhead de setup",
      opus47: "Uma única superfície de agente (Claude Code).",
      opus47AnyCap: "Mesma superfície. Um install de skill, um login da CLI.",
    },
  ],
  workflowTitle: "Como é, na prática, um fluxo Opus 4.7 + AnyCap",
  workflowSteps: [
    {
      title: "1. Instale uma vez",
      body:
        "Rode o install da skill e o login da CLI do AnyCap na mesma sessão de terminal que o Claude Code já usa. Sem novo agente, sem novo dashboard, sem segundo fluxo de auth.",
    },
    {
      title: "2. Fale com o Opus 4.7 normalmente",
      body:
        "Converse com o Claude Code do jeito que você já fala. \"Gere um visual de lançamento\" ou \"renderize um clipe de 6 segundos a partir deste mockup\" — o Opus 4.7 escolhe o modelo certo e roda o comando AnyCap correto.",
    },
    {
      title: "3. Itere dentro do mesmo loop",
      body:
        "As saídas voltam para a conversa. O Opus 4.7 raciocina sobre o resultado, refina o prompt, troca de modelo ou encadeia em image-to-video — tudo na mesma sessão.",
    },
    {
      title: "4. Entregue pelo mesmo agente",
      body:
        "Quando o asset está pronto, o Claude Code no Opus 4.7 escreve o arquivo, atualiza a página, faz commit e segue — sem trocar de contexto em relação ao agente que produziu o trabalho.",
    },
  ],
  ctaTitle: "Próximos melhores passos",
  ctaCards: [
    {
      title: "Hub do Claude Code no Opus 4.7",
      href: "/for/claude-code",
      body: "A landing principal da combinação Opus 4.7 + AnyCap e do caminho de instalação.",
    },
    {
      title: "Geração de imagem no Claude Code",
      href: "/for/claude-code/image-generation",
      body: "Adicione Seedream 5 e Nano Banana Pro ao Opus 4.7 por uma CLI.",
    },
    {
      title: "Geração de vídeo no Claude Code",
      href: "/for/claude-code/video-generation",
      body: "Adicione Veo 3.1, Seedance e Kling ao Opus 4.7 por uma CLI.",
    },
    {
      title: "Adicionar ferramentas ao Claude Code",
      href: "/guides/add-tools-to-claude-code",
      body: "Setup ponta a ponta do Opus 4.7 + AnyCap.",
    },
  ],
  faqTitle: "FAQ",
  faqItems: [
    {
      question: "No que o Claude Opus 4.7 é melhor?",
      answer:
        "Em raciocínio de longo horizonte e código dentro do Claude Code. Refactors multiarquivo, loops de testes e uso de ferramentas com recuperação de falhas são onde o Opus 4.7 mais se destaca.",
    },
    {
      question: "O Claude Opus 4.7 gera imagens ou vídeo sozinho?",
      answer:
        "Não. O Opus 4.7 interpreta imagens fornecidas, mas não gera imagem, vídeo ou áudio nativamente. O AnyCap adiciona essas capacidades por uma CLI.",
    },
    {
      question: "Por que combinar Opus 4.7 com AnyCap em vez de APIs separadas?",
      answer:
        "Porque a mesma sessão do Claude Code alcança geração de imagem, geração de vídeo, entendimento de imagem e análise de vídeo por um runtime único — sem SDK extra, sem segundo login, sem outro agente.",
    },
    {
      question: "Quais modelos o AnyCap expõe para o Opus 4.7?",
      answer:
        "Imagem: Seedream 5, Seedream 4.5, Nano Banana Pro, Nano Banana 2. Vídeo: Veo 3.1, Seedance 1.5 Pro, Kling 3.0. Mais entendimento de imagem e análise de vídeo.",
    },
    {
      question: "A combinação Opus 4.7 + AnyCap é production-ready?",
      answer:
        "Sim. O AnyCap roda no mesmo caminho de install e CLI já usado em fluxos de agente em produção. O Claude Code no Opus 4.7 chama comandos do AnyCap como qualquer outra ferramenta.",
    },
  ],
  articleJsonLd: createTechArticleJsonLd({
    headline: "Capacidades do Claude Opus 4.7 — o que ele faz, o que não faz, e o que Opus 4.7 + AnyCap libera",
    description:
      "Mapa de capacidades do Claude Opus 4.7 — pontos fortes nativos, modalidades que ele não traz e o upgrade quando o AnyCap adiciona geração de imagem, geração de vídeo, entendimento de imagem e análise de vídeo por uma CLI.",
    path: PAGE_PATH,
    about: ["Claude Opus 4.7", "Claude Code", "Capacidades de IA", "Geração de imagem", "Geração de vídeo", "AnyCap"],
    keywords: [
      "capacidades do claude opus 4.7",
      "claude opus 4.7",
      "o que o claude opus 4.7 faz",
      "claude opus 4.7 geração de imagem",
      "claude opus 4.7 geração de vídeo",
      "claude code opus 4.7",
    ],
    datePublished: PAGE_PUBLISHED_ISO,
    dateModified: PAGE_LAST_MODIFIED_ISO,
  }),
};

const deContent: PageContent = {
  breadcrumbItems: [
    { name: "Startseite", href: "/" },
    { name: "Lernen", href: "/learn", unlinkable: true },
    { name: "Capabilities von Claude Opus 4.7" },
  ],
  eyebrow: "Lernen x Claude Opus 4.7",
  lastUpdatedLabel: "Aktualisiert am 17. April 2026",
  heroTitle: [
    "Capabilities von Claude Opus 4.7,",
    "und die eine Kombination, die alles entfesselt.",
  ],
  heroIntro:
    "Claude Opus 4.7 ist der stärkste Reasoning- und Coding-Agent, den Anthropic je veröffentlicht hat. Er plant weiter, schreibt länger und nutzt Werkzeuge zuverlässiger als jedes vorherige Claude-Modell. Bilder generiert er allerdings ebenso wenig nativ wie Videos oder Aufzeichnungsanalysen. Kombinieren Sie Opus 4.7 mit AnyCap, und dieselbe Agentenoberfläche erreicht Seedream 5, Nano Banana Pro, Veo 3.1, Seedance 1.5 Pro, Kling 3.0, Bildverständnis und Videoanalyse – über eine CLI, ein Login und null Glue-Code. Dies ist eine Capability-Karte von Opus 4.7 allein und das realistische Upgrade, sobald AnyCap dazukommt.",
  pillarSections: [
    {
      label: "Pfeiler 1",
      title: "Reasoning, Planung und Coding – die nativen Stärken von Opus 4.7",
      body:
        "Opus 4.7 ist für lange agentische Läufe gebaut. Er hält Pläne über viele Tool-Aufrufe hinweg, erholt sich von gescheiterten Aktionen und produziert funktionierenden Code, der zur bestehenden Codebase passt – statt eines generischen Snippets. In Claude Code auf Opus 4.7 zeigt sich das in längeren mehrstufigen Refactors, weniger Sackgassen-Tool-Aufrufen und besserem Urteilsvermögen, welche Datei zu bearbeiten ist.",
      bullets: [
        "Mehrstufige Refactors und Migrationen über Dateien hinweg, ohne den Plan zu verlieren.",
        "Test-Fixing-Schleifen, die den Fehlerkontext über Iterationen halten.",
        "Codebase-bewusste Edits, die bestehende Muster respektieren statt neue zu erfinden.",
        "Tool-Einsatz, der sich erholt, wenn ein Shell-Befehl oder Test fehlschlägt.",
      ],
    },
    {
      label: "Pfeiler 2",
      title: "Vision und Dokument-Reasoning – stark, aber nur lesend",
      body:
        "Opus 4.7 kann Screenshots, Diagramme und Dokumentbilder interpretieren, die Sie bereitstellen. Er kann aber keine neuen Visuals, Videos oder Audios erzeugen. Sobald ein Workflow ein generiertes Mockup, einen Launch-Teaser, einen Produkt-Walkthrough oder eine Clip-Iteration auf eine bestehende Referenz braucht, stößt Opus 4.7 allein an seine Grenzen.",
      bullets: [
        "Screenshot-Lesen für UI-Bugs, Dashboards und Design-QA.",
        "Dokument- und Diagramm-Interpretation für Spec-Review und Design-Handoff.",
        "Keine native Bildgenerierung, Videogenerierung oder Audioausgabe.",
        "Keine native Videoanalyse von Aufzeichnungen oder Screen Captures.",
      ],
    },
    {
      label: "Pfeiler 3",
      title: "Die Capability-Lücke, die AnyCap schließt",
      body:
        "AnyCap ist eine KI-Agent Capability Runtime. Sie bindet sich über eine Skill-Datei und eine CLI an Claude Code auf Opus 4.7 an. Nach der Installation kann Opus 4.7 Bildgenerierung, Videogenerierung, Bildverständnis und Videoanalyse aufrufen, als wären sie native Werkzeuge. Die Kombination ist beeindruckend: der stärkste Claude-Agent aller Zeiten plus produktionsreife Medien – ohne zweites SDK, ohne zweites Login und ohne zusätzliche Agentenoberfläche.",
      bullets: [
        "Bildgenerierung über Seedream 5, Seedream 4.5, Nano Banana Pro, Nano Banana 2.",
        "Videogenerierung über Veo 3.1, Seedance 1.5 Pro, Kling 3.0.",
        "Bildverständnis für Screenshots, Referenzen und visuelle QA.",
        "Videoanalyse für Bug-Aufzeichnungen, Demo-Reviews und Walkthrough-QA.",
      ],
    },
  ],
  capabilityTableTitle: "Opus 4.7 allein vs. Opus 4.7 + AnyCap",
  capabilityTableNote:
    "Direkter Vergleich, was Opus 4.7 nativ liefert und was derselbe Agent kann, sobald AnyCap installiert ist.",
  capabilityRows: [
    {
      capability: "Langfristiges Code-Reasoning",
      opus47: "Stark – mehrdateibasierte Pläne, Refactors und Test-Fixing.",
      opus47AnyCap: "Identisch. AnyCap verändert die Coding-Schleife nicht.",
    },
    {
      capability: "Bildgenerierung",
      opus47: "Nativ nicht verfügbar.",
      opus47AnyCap: "Seedream 5, Seedream 4.5, Nano Banana Pro, Nano Banana 2.",
    },
    {
      capability: "Videogenerierung",
      opus47: "Nativ nicht verfügbar.",
      opus47AnyCap: "Veo 3.1, Seedance 1.5 Pro, Kling 3.0.",
    },
    {
      capability: "Bildverständnis",
      opus47: "Stark für direkt bereitgestellte Eingaben.",
      opus47AnyCap: "Identisch, plus ein vom Agenten aufrufbarer Befehl für Batch- und Pipeline-Nutzung.",
    },
    {
      capability: "Videoanalyse",
      opus47: "Nativ nicht verfügbar.",
      opus47AnyCap: "Vom Agenten aufrufbare Videoanalyse für Aufzeichnungen und Walkthroughs.",
    },
    {
      capability: "Setup-Aufwand",
      opus47: "Eine einzige Agentenoberfläche (Claude Code).",
      opus47AnyCap: "Dieselbe Agentenoberfläche. Eine Skill-Installation, ein CLI-Login.",
    },
  ],
  workflowTitle: "Wie ein Opus-4.7-+-AnyCap-Workflow tatsächlich aussieht",
  workflowSteps: [
    {
      title: "1. Einmal installieren",
      body:
        "Führen Sie die AnyCap-Skill-Installation und das CLI-Login in derselben Terminal-Sitzung aus, die Claude Code bereits nutzt. Kein neuer Agent. Kein neues Dashboard. Kein zweiter Auth-Flow.",
    },
    {
      title: "2. Opus 4.7 normal ansprechen",
      body:
        "Sprechen Sie mit Claude Code wie gewohnt. „Generiere ein Launch-Visual für diese Produktseite“ oder „rendere einen 6-sekündigen Walkthrough aus diesem Mockup“ – Opus 4.7 wählt das richtige Modell und führt den richtigen AnyCap-Befehl aus.",
    },
    {
      title: "3. In derselben Schleife iterieren",
      body:
        "Outputs kehren ins Gespräch zurück. Opus 4.7 kann das Ergebnis durchdenken, den Prompt verfeinern, Modelle wechseln oder per Image-to-Video verketten. Die gesamte Schleife bleibt in einer Terminal-Sitzung.",
    },
    {
      title: "4. Aus demselben Agenten ausliefern",
      body:
        "Wenn das Asset fertig ist, kann Claude Code auf Opus 4.7 die Datei schreiben, die Seite aktualisieren, die Änderung committen und weitermachen – ohne Kontextwechsel weg vom Agenten, der die Arbeit produziert hat.",
    },
  ],
  ctaTitle: "Beste nächste Schritte",
  ctaCards: [
    {
      title: "Claude Code auf Opus 4.7 – Hub",
      href: "/for/claude-code",
      body: "Die zentrale Landing-Page für die Opus-4.7-+-AnyCap-Kombination und den Installationspfad.",
    },
    {
      title: "Bildgenerierung in Claude Code",
      href: "/for/claude-code/image-generation",
      body: "Seedream 5 und Nano Banana Pro per CLI zu Opus 4.7 hinzufügen.",
    },
    {
      title: "Videogenerierung in Claude Code",
      href: "/for/claude-code/video-generation",
      body: "Veo 3.1, Seedance und Kling per CLI zu Opus 4.7 hinzufügen.",
    },
    {
      title: "Tools zu Claude Code hinzufügen",
      href: "/guides/add-tools-to-claude-code",
      body: "Schritt-für-Schritt-Setup für Opus 4.7 + AnyCap, von Anfang bis Ende.",
    },
  ],
  faqTitle: "FAQ",
  faqItems: [
    {
      question: "Worin ist Claude Opus 4.7 am stärksten?",
      answer:
        "Reasoning und Coding über lange Zeiträume innerhalb von Claude Code. Mehrdateibasierte Refactors, Test-Schleifen und Werkzeugeinsatz, der sich von Fehlern erholt, sind die Bereiche, in denen Opus 4.7 am stärksten heraussticht.",
    },
    {
      question: "Kann Claude Opus 4.7 eigenständig Bilder oder Videos generieren?",
      answer:
        "Nein. Opus 4.7 kann Bilder interpretieren, die Sie bereitstellen, generiert aber nicht nativ Bilder, Videos oder Audio. AnyCap ergänzt diese Kapazitäten über eine CLI.",
    },
    {
      question: "Warum Opus 4.7 mit AnyCap kombinieren statt mit separaten APIs?",
      answer:
        "Weil dieselbe Claude-Code-Sitzung Bildgenerierung, Videogenerierung, Bildverständnis und Videoanalyse über eine Runtime erreicht – ohne extra SDK, ohne zweites Login, ohne separaten Agenten.",
    },
    {
      question: "Welche Modelle stellt AnyCap Opus 4.7 zur Verfügung?",
      answer:
        "Bild: Seedream 5, Seedream 4.5, Nano Banana Pro, Nano Banana 2. Video: Veo 3.1, Seedance 1.5 Pro, Kling 3.0. Plus Bildverständnis und Videoanalyse.",
    },
    {
      question: "Ist die Opus-4.7-+-AnyCap-Kombination produktionsreif?",
      answer:
        "Ja. AnyCap nutzt denselben Installationspfad und dieselbe CLI, die heute in produktiven Agenten-Workflows eingesetzt werden. Claude Code auf Opus 4.7 ruft AnyCap-Befehle wie jedes andere Werkzeug auf.",
    },
  ],
  articleJsonLd: createTechArticleJsonLd({
    headline: "Capabilities von Claude Opus 4.7 – was Opus 4.7 leistet, was nicht und was Opus 4.7 + AnyCap freischaltet",
    description:
      "Eine Capability-Karte von Claude Opus 4.7 – seine nativen Stärken, die Modalitäten, die er nicht mitbringt, und das Upgrade, sobald AnyCap Bildgenerierung, Videogenerierung, Bildverständnis und Videoanalyse über eine CLI ergänzt.",
    path: PAGE_PATH,
    about: ["Claude Opus 4.7", "Claude Code", "AI capabilities", "Image generation", "Video generation", "AnyCap"],
    keywords: [
      "claude opus 4.7 capabilities",
      "claude opus 4.7",
      "claude opus 4.7 features",
      "what can claude opus 4.7 do",
      "claude opus 4.7 image generation",
      "claude opus 4.7 video generation",
      "claude code opus 4.7",
    ],
    datePublished: PAGE_PUBLISHED_ISO,
    dateModified: PAGE_LAST_MODIFIED_ISO,
  }),
};

const contentByLocale: Record<SiteLocale, PageContent> = {
  en: enContent,
  "pt-br": ptBrContent,
  id: enContent,
  de: deContent,
};

export const metadata: Metadata = createLocalizedMetadataForPath(
  defaultLocale,
  PAGE_PATH,
  {
    title: "Claude Opus 4.7 capabilities — what Opus 4.7 does (and what Opus 4.7 + AnyCap unlocks)",
    description:
      "A capability map of Claude Opus 4.7. What it does natively, what it doesn't, and the insane combo when paired with AnyCap for image generation, video generation, and visual understanding.",
    openGraph: {
      type: "website",
      title: "Claude Opus 4.7 capabilities — what Opus 4.7 does (and what Opus 4.7 + AnyCap unlocks)",
      description:
        "Opus 4.7 reasoning and coding plus AnyCap image, video, and vision — one CLI, one login, no glue code.",
    },
  }
);

export default async function ClaudeOpus47CapabilitiesPage() {
  const locale = await getRequestLocale();
  const content = contentByLocale[locale] ?? contentByLocale.en;
  const faqJsonLd = createFaqPageJsonLd(content.faqItems);

  return (
    <>
      <BreadcrumbJsonLd items={content.breadcrumbItems} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(content.articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <article className="px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-[1280px] py-12 md:py-20 lg:py-24">
          <FadeIn>
            <p className="mb-3 text-[11px] tracking-[0.8px] text-[#6b7d3a]" style={mono}>
              {content.eyebrow}
            </p>
            <p className="mb-3 text-[11px] tracking-[0.5px] text-[#5a5e52]" style={mono}>
              {content.lastUpdatedLabel}
            </p>
            <h1
              className="leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(32px, 6vw, 72px)" }}
            >
              {content.heroTitle[0]}
              <br />
              {content.heroTitle[1]}
            </h1>
            <p className="mt-6 max-w-[820px] text-base leading-7 text-[#4d5145] md:text-lg">
              {content.heroIntro}
            </p>
          </FadeIn>

          {content.pillarSections.map((section, index) => (
            <FadeIn key={section.title}>
              <section className={index === 0 ? "mt-16 md:mt-24" : "mt-16 md:mt-24"}>
                {index > 0 && (
                  <div className="mb-16 md:mb-24">
                    <hr className="border-t border-[#d4dbb8]" />
                  </div>
                )}
                <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                  {section.label}
                </p>
                <h2 className="mt-3 max-w-[820px] text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                  {section.title}
                </h2>
                <p className="mt-5 max-w-[820px] text-sm leading-6 text-[#4d5145] md:text-[15px]">
                  {section.body}
                </p>
                <ul className="mt-6 max-w-[820px] space-y-3">
                  {section.bullets.map((bullet) => (
                    <li key={bullet} className="flex gap-3 text-sm leading-6 text-[#4d5145] md:text-[15px]">
                      <span className="mt-[8px] h-1.5 w-1.5 rounded-full bg-[#6b7d3a]" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </FadeIn>
          ))}

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                {content.capabilityTableTitle}
              </h2>
              <p className="mt-3 max-w-[820px] text-sm leading-6 text-[#4d5145] md:text-[15px]">
                {content.capabilityTableNote}
              </p>
              <div className="mt-8 overflow-hidden rounded-[24px] border border-[#d4dbb8]">
                <table className="w-full border-collapse text-left text-sm text-[#1c1f17]">
                  <thead className="bg-[#f7f8ef]">
                    <tr>
                      <th className="px-5 py-4 text-[12px] font-bold tracking-[0.5px] text-[#1c1f17]" style={mono}>
                        Capability
                      </th>
                      <th className="px-5 py-4 text-[12px] font-bold tracking-[0.5px] text-[#1c1f17]" style={mono}>
                        Opus 4.7 alone
                      </th>
                      <th className="px-5 py-4 text-[12px] font-bold tracking-[0.5px] text-[#1c1f17]" style={mono}>
                        Opus 4.7 + AnyCap
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {content.capabilityRows.map((row) => (
                      <tr key={row.capability} className="border-t border-[#d4dbb8] align-top">
                        <td className="px-5 py-4 text-[14px] leading-6 text-[#1c1f17]" style={mono}>
                          {row.capability}
                        </td>
                        <td className="px-5 py-4 text-[14px] leading-6 text-[#4d5145]">{row.opus47}</td>
                        <td className="px-5 py-4 text-[14px] leading-6 text-[#4d5145]">{row.opus47AnyCap}</td>
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
              <h2 className="text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                {content.workflowTitle}
              </h2>
              <div className="mt-8 grid gap-4 md:grid-cols-2">
                {content.workflowSteps.map((step) => (
                  <div key={step.title} className="rounded-[24px] border border-[#d4dbb8] bg-[#fffffc]/70 p-6">
                    <h3 className="text-[18px] leading-7 text-[#1c1f17]" style={mono}>
                      {step.title}
                    </h3>
                    <p className="mt-4 text-sm leading-6 text-[#4d5145] md:text-[15px]">{step.body}</p>
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
              <h2 className="text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                {content.ctaTitle}
              </h2>
              <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {content.ctaCards.map((card) => (
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
              <h2 className="text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                {content.faqTitle}
              </h2>
              <div className="mt-8 space-y-4">
                {content.faqItems.map((item) => (
                  <div key={item.question} className="rounded-[24px] border border-[#d4dbb8] bg-[#fffffc]/70 p-6">
                    <h3 className="text-base text-[#1c1f17]" style={mono}>
                      {item.question}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-[#4d5145] md:text-[15px]">{item.answer}</p>
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
