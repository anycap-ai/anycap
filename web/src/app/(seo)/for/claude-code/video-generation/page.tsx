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
const PAGE_LAST_MODIFIED_ISO = "2026-04-17";
const PAGE_PUBLISHED_ISO = "2026-04-13";

type PageContent = {
  breadcrumbItems: readonly { name: string; href?: string; unlinkable?: boolean }[];
  eyebrow: string;
  titleLines: [string, string];
  intro: string;
  ctas: { primary: string; secondary: string };
  installTitle: string;
  installStepPrefix: string;
  commandTitle: string;
  commandBody: string;
  useCasesTitle: string;
  useCases: readonly string[];
  faqTitle: string;
  footerCtas: { back: string; capability: string; image: string };
  faqItems: readonly { question: string; answer: string }[];
  articleJsonLd: Record<string, unknown>;
};

const installSteps = [
  "npx -y skills add anycap-ai/anycap -a claude-code -y",
  "curl -fsSL https://anycap.ai/install.sh | sh",
  "anycap login",
] as const;

const contentByLocale: Record<SiteLocale, PageContent> = {
  en: {
    breadcrumbItems: [
      { name: "Home", href: "/" },
      { name: "Equip Agents", href: "/for", unlinkable: true },
      { name: "Claude Code", href: "/for/claude-code" },
      { name: "Video Generation" },
    ],
    eyebrow: "Claude Code x Video Generation",
    titleLines: [
      "Opus 4.7 + AnyCap = video generation inside Claude Code.",
      "Veo 3.1, Seedance, Kling — same agent, same CLI, no glue code.",
    ],
    intro:
      "Claude Code on Opus 4.7 can plan and execute long, multi-step work — but it cannot render a single frame of video. Pair it with AnyCap and the same agent surface reaches Veo 3.1, Seedance 1.5 Pro, and Kling 3.0 directly. Ask Opus 4.7 for a launch teaser, a product walkthrough, a social clip, or an image-to-video iteration on an existing visual, and it picks the right model, calls it, and hands the result back into the conversation. The combo is genuinely insane: the strongest reasoning agent Anthropic has shipped, plus production-grade video, with zero new SDKs to wire up.",
    ctas: {
      primary: "Get Started",
      secondary: "Add Tools to Claude Code",
    },
    installTitle: "Install path",
    installStepPrefix: "Step",
    commandTitle: "First command to try",
    commandBody:
      "The point is not only the video call itself. It is that the agent can reach video generation through the same runtime it already uses for image and vision tasks.",
    useCasesTitle: "When this capability matters",
    useCases: [
      "Product walkthroughs and demo clips generated directly from Claude Code workflows.",
      "Launch or social visuals that need motion rather than a single frame.",
      "Concept validation when the agent needs to show a flow, not just describe it.",
      "A consistent expansion path from image generation into video generation without another SDK.",
    ],
    faqTitle: "FAQ",
    footerCtas: {
      back: "Back to Claude Code hub",
      capability: "Video Generation capability",
      image: "Claude Code image generation",
    },
    faqItems: [
      {
        question: "Can Claude Code generate video on its own?",
        answer:
          "Not as a built-in capability layer. AnyCap adds video generation to Claude Code through one install path and one CLI.",
      },
      {
        question: "Which video model is available today?",
        answer:
          "The current video generation page highlights Veo 3.1, and AnyCap pricing also lists Seedance 1.5 Pro and Kling 3.0.",
      },
      {
        question: "Why route video generation through AnyCap instead of a separate SDK?",
        answer:
          "Because the same runtime and auth flow can also cover image generation, image understanding, and video analysis without changing the way the agent works.",
      },
    ],
    articleJsonLd: createTechArticleJsonLd({
      headline: "Claude Code Opus 4.7 video generation — Veo 3.1, Seedance, Kling via AnyCap",
      description:
        "How to add video generation to Claude Code on Claude Opus 4.7 through AnyCap with Veo 3.1, Seedance 1.5 Pro, and Kling 3.0 — one CLI, one login, no extra SDK.",
      path: "/for/claude-code/video-generation",
      about: ["Claude Code", "Claude Opus 4.7", "Video generation", "Veo 3.1", "Seedance", "Kling", "AnyCap"],
      keywords: [
        "claude code opus 4.7 video generation",
        "claude opus 4.7 video generation",
        "claude code video generation",
        "add video generation to claude code",
        "claude code generate video",
        "video generation for claude code",
      ],
      datePublished: PAGE_PUBLISHED_ISO,
      dateModified: PAGE_LAST_MODIFIED_ISO,
    }),
  },
  "pt-br": {
    breadcrumbItems: [
      { name: "Início", href: "/" },
      { name: "Equipar Agentes", href: "/for", unlinkable: true },
      { name: "Claude Code", href: "/for/claude-code" },
      { name: "Geração de Vídeo" },
    ],
    eyebrow: "Claude Code x Geração de Vídeo",
    titleLines: [
      "Opus 4.7 + AnyCap = geração de vídeo dentro do Claude Code.",
      "Veo 3.1, Seedance, Kling — mesmo agente, mesma CLI, sem cola.",
    ],
    intro:
      "O Claude Code no Opus 4.7 planeja e executa trabalho longo, em vários passos — mas não renderiza um único frame de vídeo. Combine com o AnyCap e a mesma superfície de agente alcança Veo 3.1, Seedance 1.5 Pro e Kling 3.0 diretamente. Peça ao Opus 4.7 um teaser de lançamento, um walkthrough de produto, um clipe social ou uma iteração image-to-video sobre um visual existente — ele escolhe o modelo certo, chama e devolve o resultado para a conversa. A combinação é absurda: o agente de raciocínio mais forte que a Anthropic já lançou, somado a vídeo de produção, sem nenhum SDK novo para fiar.",
    ctas: {
      primary: "Começar",
      secondary: "Adicionar ferramentas ao Claude Code",
    },
    installTitle: "Caminho de instalação",
    installStepPrefix: "Passo",
    commandTitle: "Primeiro comando para testar",
    commandBody:
      "O ponto não é só a chamada de vídeo em si. É que o agente alcança geração de vídeo pelo mesmo runtime que já usa para tarefas de imagem e visão.",
    useCasesTitle: "Quando essa capacidade importa",
    useCases: [
      "Walkthroughs de produto e clipes de demo gerados diretamente a partir de fluxos do Claude Code.",
      "Visuais de lançamento ou sociais que precisam de movimento em vez de um quadro único.",
      "Validação de conceito quando o agente precisa mostrar um fluxo, não apenas descrevê-lo.",
      "Um caminho consistente para expandir de geração de imagem para geração de vídeo sem outro SDK.",
    ],
    faqTitle: "FAQ",
    footerCtas: {
      back: "Voltar ao hub do Claude Code",
      capability: "Capacidade de geração de vídeo",
      image: "Geração de imagem no Claude Code",
    },
    faqItems: [
      {
        question: "Claude Code consegue gerar vídeo sozinho?",
        answer:
          "Não como uma camada de capacidade nativa. O AnyCap adiciona geração de vídeo ao Claude Code por um único caminho de instalação e uma única CLI.",
      },
      {
        question: "Qual modelo de vídeo está disponível hoje?",
        answer:
          "A página atual de geração de vídeo destaca Veo 3.1, e a precificação do AnyCap também lista Seedance 1.5 Pro e Kling 3.0.",
      },
      {
        question: "Por que passar geração de vídeo pelo AnyCap em vez de um SDK separado?",
        answer:
          "Porque o mesmo runtime e o mesmo fluxo de autenticação também cobrem geração de imagem, entendimento de imagem e análise de vídeo sem mudar a forma como o agente trabalha.",
      },
    ],
    articleJsonLd: createTechArticleJsonLd({
      headline: "Geração de vídeo no Claude Code Opus 4.7 — Veo 3.1, Seedance e Kling via AnyCap",
      description:
        "Como adicionar geração de vídeo ao Claude Code no Opus 4.7 via AnyCap com Veo 3.1, Seedance 1.5 Pro e Kling 3.0 — uma CLI, um login, sem SDK extra.",
      path: "/for/claude-code/video-generation",
      about: ["Claude Code", "Claude Opus 4.7", "Geração de vídeo", "Veo 3.1", "Seedance", "Kling", "AnyCap"],
      keywords: [
        "claude code opus 4.7 geração de vídeo",
        "claude opus 4.7 geração de vídeo",
        "geração de vídeo claude code",
        "adicionar geração de vídeo ao claude code",
        "claude code gerar vídeo",
        "geração de vídeo para claude code",
      ],
      datePublished: PAGE_PUBLISHED_ISO,
      dateModified: PAGE_LAST_MODIFIED_ISO,
    }),
  },
  id: undefined as never,
  de: {
    breadcrumbItems: [
      { name: "Startseite", href: "/" },
      { name: "Agenten ausstatten", href: "/for", unlinkable: true },
      { name: "Claude Code", href: "/for/claude-code" },
      { name: "Videogenerierung" },
    ],
    eyebrow: "Claude Code x Videogenerierung",
    titleLines: [
      "Opus 4.7 + AnyCap = Videogenerierung in Claude Code.",
      "Veo 3.1, Seedance, Kling – derselbe Agent, dieselbe CLI, kein Glue-Code.",
    ],
    intro:
      "Claude Code auf Opus 4.7 kann lange, mehrstufige Arbeit planen und ausführen – aber es kann kein einziges Videoframe rendern. Kombinieren Sie es mit AnyCap und dieselbe Agent-Oberfläche erreicht Veo 3.1, Seedance 1.5 Pro und Kling 3.0 direkt. Bitten Sie Opus 4.7 um einen Launch-Teaser, ein Produkt-Walkthrough, einen Social-Clip oder eine Bild-zu-Video-Iteration eines bestehenden Visuals, und es wählt das richtige Modell, ruft es auf und liefert das Ergebnis zurück in die Konversation. Die Kombination ist beeindruckend: der stärkste Reasoning-Agent, den Anthropic je veröffentlicht hat, kombiniert mit produktionsreifem Video – ohne neue SDKs zu verkabeln.",
    ctas: {
      primary: "Loslegen",
      secondary: "Tools zu Claude Code hinzufügen",
    },
    installTitle: "Installationspfad",
    installStepPrefix: "Schritt",
    commandTitle: "Erster Befehl zum Ausprobieren",
    commandBody:
      "Es geht nicht nur um den Video-Aufruf selbst. Es geht darum, dass der Agent Videogenerierung über dieselbe Runtime erreicht, die er bereits für Bild- und Vision-Aufgaben nutzt.",
    useCasesTitle: "Wann diese Capability zählt",
    useCases: [
      "Produkt-Walkthroughs und Demo-Clips, die direkt aus Claude-Code-Workflows generiert werden.",
      "Launch- oder Social-Visuals, die Bewegung statt eines einzelnen Frames brauchen.",
      "Konzeptvalidierung, wenn der Agent einen Ablauf zeigen muss, nicht nur beschreiben.",
      "Ein konsistenter Erweiterungspfad von Bildgenerierung zu Videogenerierung ohne ein weiteres SDK.",
    ],
    faqTitle: "FAQ",
    footerCtas: {
      back: "Zurück zum Claude-Code-Hub",
      capability: "Capability Videogenerierung",
      image: "Bildgenerierung in Claude Code",
    },
    faqItems: [
      {
        question: "Kann Claude Code von sich aus Videos generieren?",
        answer:
          "Nicht als eingebaute Capability-Schicht. AnyCap fügt Claude Code Videogenerierung über einen Installationspfad und eine CLI hinzu.",
      },
      {
        question: "Welches Videomodell ist heute verfügbar?",
        answer:
          "Die aktuelle Videogenerierungs-Seite hebt Veo 3.1 hervor, und das AnyCap-Pricing listet auch Seedance 1.5 Pro und Kling 3.0.",
      },
      {
        question: "Warum Videogenerierung über AnyCap statt über ein separates SDK?",
        answer:
          "Weil dieselbe Runtime und derselbe Auth-Flow auch Bildgenerierung, Bildverständnis und Videoanalyse abdecken können, ohne die Arbeitsweise des Agenten zu ändern.",
      },
    ],
    articleJsonLd: createTechArticleJsonLd({
      headline: "Claude Code Opus 4.7 Videogenerierung – Veo 3.1, Seedance, Kling via AnyCap",
      description:
        "Wie man Claude Code auf Claude Opus 4.7 Videogenerierung über AnyCap mit Veo 3.1, Seedance 1.5 Pro und Kling 3.0 hinzufügt – eine CLI, ein Login, kein zusätzliches SDK.",
      path: "/for/claude-code/video-generation",
      about: ["Claude Code", "Claude Opus 4.7", "Videogenerierung", "Veo 3.1", "Seedance", "Kling", "AnyCap"],
      keywords: [
        "claude code opus 4.7 videogenerierung",
        "claude opus 4.7 videogenerierung",
        "claude code videogenerierung",
        "videogenerierung zu claude code hinzufügen",
        "claude code video generieren",
        "videogenerierung für claude code",
      ],
      datePublished: PAGE_PUBLISHED_ISO,
      dateModified: PAGE_LAST_MODIFIED_ISO,
    }),
  },
};
contentByLocale.id = contentByLocale.en;

export const metadata: Metadata = createLocalizedMetadataForPath(
  defaultLocale,
  "/for/claude-code/video-generation",
  {
    title: "Claude Code Video Generation — Veo, Kling & Seedance",
    description:
      "Add video generation to Claude Code via AnyCap. Access Veo 3.1, Seedance 1.5 Pro, and Kling 3.0 — one CLI, one login, no extra SDK.",
    openGraph: {
      type: "website",
      title: "Claude Code Opus 4.7 video generation — Veo 3.1 + Seedance + Kling via AnyCap",
      description:
        "Add video generation to Claude Code on Opus 4.7 without switching agents or wiring separate video APIs.",
    },
  }
);

export default async function ClaudeCodeVideoGenerationPage() {
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
      {faqJsonLd['@type'] ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      ) : null}

      <article className="px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-[1280px] py-12 md:py-20 lg:py-24">
          <FadeIn>
            <p className="mb-4 text-[11px] tracking-[0.8px] text-[#6b7d3a]" style={mono}>
              {content.eyebrow}
            </p>
            <h1
              className="leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(32px, 6vw, 72px)" }}
            >
              {content.titleLines[0]}
              <br />
              {content.titleLines[1]}
            </h1>
            <p className="mt-6 max-w-[760px] text-base leading-7 text-[#4d5145] md:text-lg">
              {content.intro}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/start"
                className="inline-block rounded-lg bg-[#6b7d3a] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#f4f5f0] transition-colors hover:bg-[#1c1f17]"
                style={mono}
              >
                {content.ctas.primary}
              </Link>
              <Link
                href="/guides/add-tools-to-claude-code"
                className="inline-block rounded-lg border border-[#1c1f17] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] transition-colors hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
                style={mono}
              >
                {content.ctas.secondary}
              </Link>
            </div>
          </FadeIn>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-8 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {content.installTitle}
              </h2>
              <div className="grid gap-6 lg:grid-cols-3">
                {installSteps.map((step, index) => (
                  <div key={step} className="border-l-[3px] border-[#6b7d3a] pl-6">
                    <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                      {content.installStepPrefix} {index + 1}
                    </p>
                    <div className="bg-[#1c1f17] px-5 py-4">
                      <p className="break-all text-[13px] text-[#d4e0a4]" style={mono}>
                        {step}
                      </p>
                    </div>
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
                {content.commandTitle}
              </h2>
              <div className="max-w-[820px] bg-[#1c1f17] px-5 py-4">
                <p className="break-all text-[13px] text-[#d4e0a4]" style={mono}>
                  anycap video generate --model veo-3.1 --prompt &quot;slow camera move over a new product launch scene with soft studio lighting&quot;
                </p>
              </div>
              <p className="mt-4 max-w-[760px] text-sm leading-6 text-[#4d5145]">
                {content.commandBody}
              </p>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-8 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {content.useCasesTitle}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 max-w-[920px]">
                {content.useCases.map((useCase) => (
                  <div key={useCase} className="border-l-[3px] border-[#6b7d3a] pl-5">
                    <p className="text-sm leading-6 text-[#4d5145]">{useCase}</p>
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
              <div className="space-y-6 max-w-[860px]">
                {content.faqItems.map((item) => (
                  <div key={item.question} className="rounded-xl border border-[#d4dbb8] p-5">
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
                  {content.footerCtas.back}
                </Link>
                <Link
                  href="/capabilities/video-generation"
                  className="inline-block rounded-lg border border-[#1c1f17] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] transition-colors hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
                  style={mono}
                >
                  {content.footerCtas.capability}
                </Link>
                <Link
                  href="/for/claude-code/image-generation"
                  className="inline-block rounded-lg border border-[#1c1f17] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] transition-colors hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
                  style={mono}
                >
                  {content.footerCtas.image}
                </Link>
              </div>
            </section>
          </FadeIn>
        </div>
      </article>
    </>
  );
}
