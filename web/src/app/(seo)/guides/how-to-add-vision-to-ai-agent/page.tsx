import type { Metadata } from "next";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { EarlyAccessBanner } from "@/components/landing/EarlyAccessBanner";
import { FadeIn } from "@/components/ui/FadeIn";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { ArticleByline } from "@/components/seo/ArticleByline";
import { createTechArticleJsonLd, createFaqPageJsonLd } from "@/lib/schema";
import { getPageMetadata } from "./metadata";
import { getRequestLocale } from "@/lib/request-locale";
import { defaultLocale } from "@/lib/site";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

type PageContent = {
  eyebrow: string;
  title: [string, string];
  intro: string[];
  neededTitle: string;
  neededItems: string[];
  callout: string;
  steps: {
    skill: string;
    cli: string;
    login: string;
    image: string;
    video: string;
    combine: string;
  };
  useCasesTitle: string;
  useCases: { title: string; body: string }[];
  interpretationTitle: string;
  interpretationBody: string[];
  mistakesTitle: string;
  mistakes: { title: string; body: string }[];
  faqTitle: string;
  ctas: {
    claude: string;
    capability: string;
    start: string;
  };
  breadcrumbLabel: string;
};

const contentByLocale: Record<"en" | "pt-br", PageContent> = {
  en: {
    eyebrow: "Guides",
    title: ["How to add vision capabilities", "to an AI agent"],
    intro: [
      "Most AI agents work with text and code, but they cannot see unless you give them a visual capability surface. AnyCap adds image understanding and video analysis so the agent can inspect screenshots, review designs, summarize demos, and reason about visual evidence inside the same workflow.",
      "This guide covers both image read and video read setup for agents such as Claude Code, Cursor, and Codex. The setup is straightforward, but the value comes from what happens after installation: the agent can move from text-only reasoning to visual inspection, extraction, and QA tasks.",
      "Once configured, your agent can treat a screenshot, a UI mockup, or a recorded demo as structured input. That opens up new workflows for bug triage, accessibility review, competitor research, release-note drafting, and design validation.",
    ],
    neededTitle: "What you need",
    neededItems: [
      "An AI agent that can run shell commands, such as Claude Code, Cursor, or Codex",
      "Node.js 18+ for skills.sh and npm install support",
      "A browser for the one-time login flow",
      "Images or videos to analyze, either as URLs or local files that can be uploaded first",
    ],
    callout:
      "Vision capabilities usually show up as two commands: image read for still images and video read for temporal analysis. Both return structured text that an agent can reason over, summarize, or feed into follow-up actions.",
    steps: {
      skill: "Install the AnyCap skill",
      cli: "Install the AnyCap CLI",
      login: "Log in",
      image: "Use image understanding",
      video: "Use video analysis",
      combine: "Combine vision in agent workflows",
    },
    useCasesTitle: "Where vision adds the most value",
    useCases: [
      {
        title: "UI and QA review",
        body: "Have the agent inspect screenshots for layout regressions, accessibility problems, text overflow, or visual bugs before a release.",
      },
      {
        title: "Design and brand review",
        body: "Ask the agent to compare a mockup against brand guidelines, extract visible text, or summarize the hierarchy and composition of a layout.",
      },
      {
        title: "Video understanding",
        body: "Feed a product demo, user recording, or ad creative into the agent so it can summarize scenes, extract key moments, and turn the analysis into notes or tickets.",
      },
    ],
    interpretationTitle: "How agents use vision output well",
    interpretationBody: [
      "Vision features are most useful when the analysis becomes part of a larger workflow rather than a one-off caption. For example, an agent can read a screenshot, identify accessibility issues, and then open code files to propose a fix based on what it found.",
      "The same applies to video. A scene-by-scene summary becomes more valuable when the agent turns it into release notes, a QA checklist, or a list of missing product explanations. The capability is not just about describing visuals. It is about helping the agent make decisions with visual evidence.",
      "In practice, focused prompts produce better results than generic ones. Asking 'What is in this image?' is useful, but asking 'What onboarding issues would block a first-time user in this screenshot?' gives the model a sharper evaluation frame.",
    ],
    mistakesTitle: "Common setup and usage mistakes",
    mistakes: [
      {
        title: "Forgetting the upload step for local files",
        body: "If the input is not already reachable by URL, the agent needs to upload it first and then pass the resulting URL to the read command.",
      },
      {
        title: "Using generic prompts for complex reviews",
        body: "Broad prompts get broad answers. A targeted question about accessibility, information hierarchy, or feature order produces more actionable output.",
      },
      {
        title: "Treating vision as a standalone task",
        body: "The highest leverage comes when the agent uses the visual analysis to drive the next step, such as drafting notes, filing bugs, or making code changes.",
      },
    ],
    faqTitle: "FAQ",
    ctas: {
      claude: "AnyCap for Claude Code",
      capability: "All Capabilities",
      start: "Get Started",
    },
    breadcrumbLabel: "Add Vision to AI Agent",
  },
  "pt-br": {
    eyebrow: "Guias",
    title: ["Como adicionar capacidades de visao", "a um agente de IA"],
    intro: [
      "A maioria dos agentes de IA trabalha com texto e codigo, mas nao enxerga ate voce dar uma superficie visual para eles. O AnyCap adiciona entendimento de imagem e analise de video para que o agente examine screenshots, revise designs, resuma demos e raciocine com evidencias visuais no mesmo workflow.",
      "Este guia cobre o setup de image read e video read para agentes como Claude Code, Cursor e Codex. A instalacao e simples, mas o valor real aparece depois: o agente sai de um raciocinio so em texto e passa a inspecionar, extrair e validar informacao visual.",
      "Depois de configurado, seu agente pode tratar um screenshot, um mockup ou um video de produto como entrada estruturada. Isso abre workflows de triagem de bugs, revisao de acessibilidade, pesquisa competitiva, release notes e validacao de design.",
    ],
    neededTitle: "O que voce precisa",
    neededItems: [
      "Um agente de IA que consiga executar comandos de shell, como Claude Code, Cursor ou Codex",
      "Node.js 18+ para compatibilidade com skills.sh e npm install",
      "Um navegador para o login unico",
      "Imagens ou videos para analisar, por URL ou como arquivo local que possa ser enviado antes",
    ],
    callout:
      "As capacidades de visao normalmente aparecem em dois comandos: image read para imagens estaticas e video read para analise temporal. Ambos retornam texto estruturado que o agente pode interpretar, resumir ou usar em acao seguinte.",
    steps: {
      skill: "Instale a skill do AnyCap",
      cli: "Instale a CLI do AnyCap",
      login: "Faca login",
      image: "Use entendimento de imagem",
      video: "Use analise de video",
      combine: "Combine visao nos workflows do agente",
    },
    useCasesTitle: "Onde visao agrega mais valor",
    useCases: [
      {
        title: "Revisao de UI e QA",
        body: "Peca ao agente para inspecionar screenshots em busca de regressos visuais, problemas de acessibilidade, overflow de texto ou bugs antes do release.",
      },
      {
        title: "Revisao de design e marca",
        body: "Peca ao agente para comparar um mockup com guidelines de marca, extrair textos visiveis ou resumir hierarquia e composicao do layout.",
      },
      {
        title: "Entendimento de video",
        body: "Passe um demo de produto, gravacao de usuario ou criativo de anuncio para o agente resumir cenas, extrair momentos importantes e transformar isso em notas ou tickets.",
      },
    ],
    interpretationTitle: "Como agentes usam bem a saida visual",
    interpretationBody: [
      "Recursos de visao sao mais uteis quando a analise entra em um workflow maior em vez de virar apenas uma legenda. Por exemplo, o agente pode ler um screenshot, identificar problemas de acessibilidade e depois abrir arquivos de codigo para propor um ajuste.",
      "O mesmo vale para video. Um resumo cena a cena fica mais valioso quando o agente o transforma em release notes, checklist de QA ou lista de features mostradas. O ponto nao e apenas descrever a imagem. E permitir decisoes com evidencia visual.",
      "Na pratica, prompts focados produzem resultados melhores do que prompts genericos. Perguntar 'o que tem nessa imagem?' ajuda, mas perguntar 'quais problemas de onboarding aparecem neste screenshot?' da um quadro de avaliacao mais util.",
    ],
    mistakesTitle: "Erros comuns de setup e uso",
    mistakes: [
      {
        title: "Esquecer o upload de arquivos locais",
        body: "Se a entrada ainda nao estiver disponivel por URL, o agente precisa enviar o arquivo primeiro e depois passar a URL resultante ao comando de leitura.",
      },
      {
        title: "Usar prompts genericos em revisoes complexas",
        body: "Prompts amplos geram respostas amplas. Perguntas focadas em acessibilidade, hierarquia ou ordem de features produzem saidas mais acionaveis.",
      },
      {
        title: "Tratar visao como tarefa isolada",
        body: "O maior ganho aparece quando o agente usa a analise visual para conduzir o proximo passo, como abrir bug, redigir notas ou sugerir mudancas no codigo.",
      },
    ],
    faqTitle: "FAQ",
    ctas: {
      claude: "AnyCap para Claude Code",
      capability: "Todas as capabilities",
      start: "Comecar",
    },
    breadcrumbLabel: "Adicionar visao ao agente de IA",
  },
};

export const metadata: Metadata = getPageMetadata(defaultLocale);

const guideJsonLd = createTechArticleJsonLd({
  headline: "How to Add Vision Capabilities to an AI Agent — Image and Video Understanding Guide",
  description:
    "Guide to adding image understanding and video analysis to AI agents like Claude Code, Cursor, and Codex using AnyCap CLI, with setup steps, use cases, and workflow patterns.",
  path: "/guides/how-to-add-vision-to-ai-agent",
  about: ["AI agent vision", "Image understanding", "Video analysis", "AnyCap CLI"],
  keywords: [
    "how to add vision to ai agent",
    "ai agent vision capabilities",
    "image understanding for agents",
    "video analysis for ai agents",
  ],
  datePublished: "2026-04-14",
  dateModified: "2026-04-14",
});

const howToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "Add Vision Capabilities to an AI Agent",
  description:
    "Step-by-step guide to adding image understanding and video analysis capabilities to any AI agent using AnyCap CLI.",
  totalTime: "PT5M",
  step: [
    {
      "@type": "HowToStep",
      name: "Install the AnyCap skill",
      text: "Run the skills installer to place the AnyCap skill into your agent's skills directory. For Claude Code: npx -y skills add anycap-ai/anycap -a claude-code -y",
    },
    {
      "@type": "HowToStep",
      name: "Install the AnyCap CLI",
      text: "Run curl -fsSL https://anycap.ai/install.sh | sh to install the CLI binary, or use npm install -g @anycap/cli.",
    },
    {
      "@type": "HowToStep",
      name: "Log in",
      text: "Run anycap login to authenticate. The one-time login covers image understanding and video analysis together with the rest of AnyCap.",
    },
    {
      "@type": "HowToStep",
      name: "Use image understanding",
      text: "Run anycap image read --url https://example.com/screenshot.png to analyze an image and return structured visual output.",
    },
    {
      "@type": "HowToStep",
      name: "Use video analysis",
      text: "Run anycap video read --url https://example.com/demo.mp4 to analyze a video and return a scene-by-scene summary and key moments.",
    },
    {
      "@type": "HowToStep",
      name: "Combine vision in agent workflows",
      text: "Ask your agent to review screenshots or videos naturally so it can combine visual analysis with coding, writing, or QA tasks.",
    },
  ],
};

const faqItems = [
  {
    question: "What is the difference between image read and video read?",
    answer:
      "Image read analyzes a single visual frame and returns structured details such as objects, visible text, layout, and context. Video read adds temporal understanding, so the output includes scenes, actions, sequence, and key moments over time.",
  },
  {
    question: "What image and video formats are supported?",
    answer:
      "Image workflows commonly support formats such as JPEG, PNG, WebP, and GIF, while video workflows commonly support MP4, WebM, and MOV. The easiest pattern is to provide a stable URL or let the agent upload the local file first.",
  },
  {
    question: "Can vision capabilities work with locally stored files?",
    answer:
      "Yes. If the file is local, the agent can upload it first and then pass the resulting hosted URL to the image read or video read command. That upload-then-analyze pattern is exactly the kind of operational detail a skill helps automate.",
  },
  {
    question: "What are good first use cases for vision in an agent?",
    answer:
      "Strong early use cases include screenshot QA, accessibility review, extracting information from UI mockups, summarizing product demos, and comparing visuals against design or brand expectations.",
  },
] as const;

const faqJsonLd = createFaqPageJsonLd(faqItems);

export default async function HowToAddVisionPage() {
  const locale = await getRequestLocale();
  const content = contentByLocale[locale === "pt-br" ? "pt-br" : "en"];

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Guides", href: "/guides", unlinkable: true },
          { name: content.breadcrumbLabel },
        ]}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(guideJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <article className="px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-[1280px] py-12 md:py-20 lg:py-24">
          <FadeIn>
            <p className="mb-4 text-[11px] tracking-[0.8px] text-[#6b7d3a]" style={mono}>
              {content.eyebrow}
            </p>
            <ArticleByline className="mb-3" />
            <h1
              className="leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(28px, 5vw, 60px)" }}
            >
              {content.title[0]}
              <br />
              {content.title[1]}
            </h1>
            <div className="mt-6 max-w-[800px] space-y-4">
              {content.intro.map((paragraph) => (
                <p key={paragraph} className="text-base leading-7 text-[#4d5145] md:text-lg">
                  {paragraph}
                </p>
              ))}
            </div>
          </FadeIn>

          <FadeIn className="mt-8">
            <EarlyAccessBanner />
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-6 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {content.neededTitle}
              </h2>
              <ul className="max-w-[760px] space-y-3">
                {content.neededItems.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm leading-6 text-[#4d5145]">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#6b7d3a]" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <div className="mt-16 max-w-[820px] space-y-10 md:mt-24">
            <FadeIn>
              <p className="max-w-[800px] border border-[#d4dbb8] bg-[#f4f5f0]/50 px-5 py-4 text-sm leading-6 text-[#4d5145]">
                {content.callout}
              </p>
            </FadeIn>

            <FadeIn>
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center bg-[#6b7d3a] text-[13px] font-bold text-[#f4f5f0]" style={mono}>
                  1
                </span>
                <h2 className="text-lg text-[#1c1f17]" style={pixel}>
                  {content.steps.skill}
                </h2>
              </div>
              <div className="bg-[#1c1f17] px-5 py-4">
                <p className="mb-1 text-[13px] text-[#6b7d3a]" style={mono}>
                  # For Claude Code
                </p>
                <p className="mb-3 text-[13px] text-[#d4e0a4]" style={mono}>
                  npx -y skills add anycap-ai/anycap -a claude-code -y
                </p>
                <p className="mb-1 text-[13px] text-[#6b7d3a]" style={mono}>
                  # For Cursor
                </p>
                <p className="text-[13px] text-[#d4e0a4]" style={mono}>
                  npx -y skills add anycap-ai/anycap -a cursor -y
                </p>
              </div>
              <p className="mt-3 text-sm leading-6 text-[#4d5145]">
                This installs the AnyCap skill so your agent can discover image and video analysis
                without improvising the workflow from scratch. The skill explains commands, setup,
                and the situations where vision should be used.
              </p>
            </FadeIn>

            <FadeIn>
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center bg-[#6b7d3a] text-[13px] font-bold text-[#f4f5f0]" style={mono}>
                  2
                </span>
                <h2 className="text-lg text-[#1c1f17]" style={pixel}>
                  {content.steps.cli}
                </h2>
              </div>
              <div className="mb-3 bg-[#1c1f17] px-5 py-4">
                <p className="text-[13px] text-[#d4e0a4]" style={mono}>
                  curl -fsSL https://anycap.ai/install.sh | sh
                </p>
              </div>
              <p className="text-sm leading-6 text-[#4d5145]">
                Or use <code className="text-[12px] text-[#6b7d3a]" style={mono}>npm install -g @anycap/cli</code>.
                The CLI is the runtime surface that executes image and video reads after the skill tells
                the agent how to call them.
              </p>
            </FadeIn>

            <FadeIn>
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center bg-[#6b7d3a] text-[13px] font-bold text-[#f4f5f0]" style={mono}>
                  3
                </span>
                <h2 className="text-lg text-[#1c1f17]" style={pixel}>
                  {content.steps.login}
                </h2>
              </div>
              <div className="bg-[#1c1f17] px-5 py-4">
                <p className="text-[13px] text-[#d4e0a4]" style={mono}>
                  anycap login
                </p>
              </div>
              <p className="mt-3 text-sm leading-6 text-[#4d5145]">
                This authenticates the CLI once so the agent can use visual understanding together
                with other AnyCap capabilities in the same session.
              </p>
            </FadeIn>

            <FadeIn>
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center bg-[#6b7d3a] text-[13px] font-bold text-[#f4f5f0]" style={mono}>
                  4
                </span>
                <h2 className="text-lg text-[#1c1f17]" style={pixel}>
                  {content.steps.image}
                </h2>
              </div>
              <div className="bg-[#1c1f17] px-5 py-4">
                <p className="mb-1 text-[13px] text-[#6b7d3a]" style={mono}>
                  # Analyze an image from a URL
                </p>
                <p className="mb-3 text-[13px] text-[#d4e0a4]" style={mono}>
                  anycap image read --url https://example.com/screenshot.png
                </p>
                <p className="mb-1 text-[13px] text-[#6b7d3a]" style={mono}>
                  # Analyze with a specific question
                </p>
                <p className="text-[13px] text-[#d4e0a4]" style={mono}>
                  anycap image read --url https://example.com/ui.png --prompt &quot;What accessibility issues do you see?&quot;
                </p>
              </div>
              <p className="mt-3 text-sm leading-6 text-[#4d5145]">
                The command returns structured details about visible text, objects, layout, and context.
                Focused prompts usually make the output much more useful for real product work.
              </p>
            </FadeIn>

            <FadeIn>
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center bg-[#6b7d3a] text-[13px] font-bold text-[#f4f5f0]" style={mono}>
                  5
                </span>
                <h2 className="text-lg text-[#1c1f17]" style={pixel}>
                  {content.steps.video}
                </h2>
              </div>
              <div className="bg-[#1c1f17] px-5 py-4">
                <p className="mb-1 text-[13px] text-[#6b7d3a]" style={mono}>
                  # Analyze a video
                </p>
                <p className="mb-3 text-[13px] text-[#d4e0a4]" style={mono}>
                  anycap video read --url https://example.com/demo.mp4
                </p>
                <p className="mb-1 text-[13px] text-[#6b7d3a]" style={mono}>
                  # Analyze with a focused prompt
                </p>
                <p className="text-[13px] text-[#d4e0a4]" style={mono}>
                  anycap video read --url https://example.com/demo.mp4 --prompt &quot;List each feature shown in order&quot;
                </p>
              </div>
              <p className="mt-3 text-sm leading-6 text-[#4d5145]">
                Video analysis returns scene-level structure, key moments, and temporal relationships,
                which makes it useful for demos, user recordings, and competitive analysis.
              </p>
            </FadeIn>

            <FadeIn>
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center bg-[#6b7d3a] text-[13px] font-bold text-[#f4f5f0]" style={mono}>
                  6
                </span>
                <h2 className="text-lg text-[#1c1f17]" style={pixel}>
                  {content.steps.combine}
                </h2>
              </div>
              <p className="max-w-[760px] text-sm leading-6 text-[#4d5145]">
                With vision installed, your agent can combine visual input with writing, coding, and
                planning tasks. That is where the capability becomes more than a captioning tool.
              </p>
              <div className="mt-3 bg-[#1c1f17] px-5 py-4">
                <p className="mb-1 text-[13px] text-[#6b7d3a]" style={mono}>
                  # UI review workflow
                </p>
                <p className="mb-3 text-[13px] text-[#d4e0a4]" style={mono}>
                  &quot;Look at this screenshot and identify any UI issues&quot;
                </p>
                <p className="mb-1 text-[13px] text-[#6b7d3a]" style={mono}>
                  # Video summary workflow
                </p>
                <p className="mb-3 text-[13px] text-[#d4e0a4]" style={mono}>
                  &quot;Watch this demo video and write release notes&quot;
                </p>
                <p className="mb-1 text-[13px] text-[#6b7d3a]" style={mono}>
                  # Combined generation plus vision
                </p>
                <p className="text-[13px] text-[#d4e0a4]" style={mono}>
                  &quot;Generate a hero image, then analyze it for brand consistency&quot;
                </p>
              </div>
              <p className="mt-3 text-sm leading-6 text-[#4d5145]">
                The agent can orchestrate upload, analysis, interpretation, and follow-up actions
                without forcing the user to manage each step manually.
              </p>
            </FadeIn>
          </div>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-8 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {content.useCasesTitle}
              </h2>
              <div className="grid gap-4 md:grid-cols-3">
                {content.useCases.map((item) => (
                  <div key={item.title} className="rounded-xl border border-[#d4dbb8] bg-[#fffffc]/70 p-5">
                    <h3 className="mb-2 text-[14px] font-bold text-[#1c1f17]" style={mono}>
                      {item.title}
                    </h3>
                    <p className="text-sm leading-6 text-[#4d5145]">{item.body}</p>
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
              <h2 className="mb-6 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {content.interpretationTitle}
              </h2>
              <div className="max-w-[820px] space-y-4">
                {content.interpretationBody.map((paragraph) => (
                  <p key={paragraph} className="text-base leading-7 text-[#4d5145]">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-8 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {content.mistakesTitle}
              </h2>
              <div className="grid gap-4 md:grid-cols-3">
                {content.mistakes.map((item) => (
                  <div key={item.title} className="rounded-xl border border-[#d4dbb8] bg-[#fffffc]/70 p-5">
                    <h3 className="mb-2 text-[14px] font-bold text-[#1c1f17]" style={mono}>
                      {item.title}
                    </h3>
                    <p className="text-sm leading-6 text-[#4d5145]">{item.body}</p>
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
              <h2 className="mb-8 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {content.faqTitle}
              </h2>
              <div className="max-w-[860px] space-y-4">
                {faqItems.map((item) => (
                  <div key={item.question} className="rounded-xl border border-[#d4dbb8] bg-[#fffffc]/70 p-5">
                    <h3 className="mb-2 text-[14px] font-bold text-[#1c1f17]" style={mono}>
                      {item.question}
                    </h3>
                    <p className="text-sm leading-6 text-[#4d5145]">{item.answer}</p>
                  </div>
                ))}
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24 mb-8">
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/for/claude-code"
                  className="inline-block rounded-lg bg-[#6b7d3a] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#f4f5f0] transition-colors hover:bg-[#1c1f17]"
                  style={mono}
                >
                  {content.ctas.claude}
                </Link>
                <Link
                  href="/capabilities"
                  className="inline-block rounded-lg border border-[#1c1f17] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] transition-colors hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
                  style={mono}
                >
                  {content.ctas.capability}
                </Link>
                <Link
                  href="/start"
                  className="inline-block rounded-lg border border-[#1c1f17] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] transition-colors hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
                  style={mono}
                >
                  {content.ctas.start}
                </Link>
              </div>
            </section>
          </FadeIn>
        </div>
      </article>
    </>
  );
}
