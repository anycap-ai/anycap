import type { Metadata } from "next";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { EarlyAccessBanner } from "@/components/landing/EarlyAccessBanner";
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
  modelTitle: string;
  commandTitle: string;
  textToImageLabel: string;
  imageEditingLabel: string;
  faqTitle: string;
  footerCtas: { back: string; capability: string; video: string };
  faqItems: readonly { question: string; answer: string }[];
  modelCards: readonly { name: string; summary: string }[];
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
      { name: "Image Generation" },
    ],
    eyebrow: "Claude Code x Image Generation Skill",
    titleLines: [
      "Add the AnyCap image generation skill to Claude Code.",
      "One install. One login. Opus 4.7 picks the model.",
    ],
    intro:
      "Claude Code on Opus 4.7 reasons better than ever, but it still ships with no image model. The AnyCap image generation skill plugs that gap: install once, log in once, and Opus 4.7 can call Seedream 5, Seedream 4.5, Nano Banana Pro, and Nano Banana 2 from the same terminal session. Ask Opus 4.7 for a launch visual, a product mockup, a thumbnail, or an iteration on an existing reference, and the skill picks the right model and runs it. The combo is borderline insane: the strongest coding agent Anthropic has shipped, plus image generation, with zero glue code between them.",
    ctas: {
      primary: "Get Started",
      secondary: "Add Tools to Claude Code",
    },
    installTitle: "Install path",
    installStepPrefix: "Step",
    modelTitle: "Pick the right image model",
    commandTitle: "First commands to try",
    textToImageLabel: "Text to image",
    imageEditingLabel: "Image editing",
    faqTitle: "FAQ",
    footerCtas: {
      back: "Back to Claude Code hub",
      capability: "Image Generation capability",
      video: "Claude Code video generation",
    },
    faqItems: [
      {
        question: "Is this a Claude Code skill?",
        answer:
          "Yes. AnyCap ships an image generation skill for Claude Code. Step 1 of the install path adds the skill via the official skills CLI; after that Opus 4.7 discovers and invokes image generation the same way it invokes any other skill.",
      },
      {
        question: "How do I install the AnyCap image generation skill in Claude Code?",
        answer:
          "Three commands. Run npx -y skills add anycap-ai/anycap -a claude-code -y to add the skill, curl -fsSL https://anycap.ai/install.sh | sh to install the AnyCap CLI binary, then anycap login. After that the skill is ready inside any Claude Code session.",
      },
      {
        question: "Can Claude Code generate images on its own?",
        answer:
          "Not as a built-in capability. The AnyCap skill adds image generation to Claude Code through one install path and one CLI.",
      },
      {
        question: "Which image models does the skill expose?",
        answer:
          "The current image generation stack includes Seedream 5, Seedream 4.5, Nano Banana Pro, and Nano Banana 2.",
      },
      {
        question: "Do I need a different workflow for image editing?",
        answer:
          "No. The same anycap image command in the skill covers both text-to-image and image-to-image workflows depending on the model and flags you use.",
      },
    ],
    modelCards: [
      {
        name: "Seedream 5",
        summary: "Best first pick for polished text-to-image outputs.",
      },
      {
        name: "Seedream 4.5",
        summary: "A strong alternate path when you want another text-first image generation option.",
      },
      {
        name: "Nano Banana Pro",
        summary: "Best fit when Claude Code starts from an existing image and needs iterative editing.",
      },
      {
        name: "Nano Banana 2",
        summary: "Another editing-oriented option for image-to-image workflows.",
      },
    ],
    articleJsonLd: createTechArticleJsonLd({
      headline: "Claude Code image generation skill — Seedream 5 + Nano Banana via AnyCap",
      description:
        "How to install the AnyCap image generation skill in Claude Code on Opus 4.7, and call Seedream 5, Nano Banana Pro, and other current image models from the same agent session.",
      path: "/for/claude-code/image-generation",
      about: ["Claude Code skill", "Claude Code image generation", "Claude Opus 4.7", "Image generation", "Seedream 5", "Nano Banana Pro", "AnyCap"],
      keywords: [
        "claude code image generation skill",
        "claude code image skill",
        "anycap image generation skill",
        "install image generation skill claude code",
        "claude code opus 4.7 image generation",
        "claude opus 4.7 image generation",
        "claude code image generation",
        "add image generation to claude code",
        "claude code generate images",
        "image generation for claude code",
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
      { name: "Geração de Imagem" },
    ],
    eyebrow: "Claude Code x Geração de Imagem",
    titleLines: [
      "Opus 4.7 + AnyCap = geração de imagem dentro do Claude Code.",
      "A um prompt de distância. Sem novo SDK. Sem trocar de contexto.",
    ],
    intro:
      "O Claude Code no Opus 4.7 raciocina melhor do que nunca — mas ainda não traz nenhum modelo de imagem. Combine com o AnyCap e você ganha Seedream 5, Seedream 4.5, Nano Banana Pro e Nano Banana 2 atrás da mesma superfície de agente, na mesma sessão de terminal, no mesmo login. Peça ao Opus 4.7 um visual de lançamento, um mockup de produto, uma thumbnail ou uma iteração sobre uma referência existente — ele escolhe o modelo certo e roda. A combinação chega a ser absurda: o agente de código mais forte que a Anthropic já lançou, com geração de imagem, sem nenhuma cola entre eles.",
    ctas: {
      primary: "Começar",
      secondary: "Adicionar ferramentas ao Claude Code",
    },
    installTitle: "Caminho de instalação",
    installStepPrefix: "Passo",
    modelTitle: "Escolha o modelo de imagem certo",
    commandTitle: "Primeiros comandos para testar",
    textToImageLabel: "Texto para imagem",
    imageEditingLabel: "Edição de imagem",
    faqTitle: "FAQ",
    footerCtas: {
      back: "Voltar ao hub do Claude Code",
      capability: "Capacidade de geração de imagem",
      video: "Geração de vídeo no Claude Code",
    },
    faqItems: [
      {
        question: "Claude Code consegue gerar imagens sozinho?",
        answer:
          "Não como uma capacidade nativa. O AnyCap adiciona geração de imagem ao Claude Code por um único caminho de instalação e uma única CLI.",
      },
      {
        question: "Quais modelos de imagem estão disponíveis pelo AnyCap?",
        answer:
          "A stack atual de geração de imagem inclui Seedream 5, Seedream 4.5, Nano Banana Pro e Nano Banana 2.",
      },
      {
        question: "Preciso de um fluxo diferente para edição de imagem?",
        answer:
          "Não. O mesmo comando de imagem do AnyCap cobre tanto texto para imagem quanto imagem para imagem, dependendo do modelo e das flags usadas.",
      },
    ],
    modelCards: [
      {
        name: "Seedream 5",
        summary: "Melhor primeira escolha para saídas refinadas de texto para imagem.",
      },
      {
        name: "Seedream 4.5",
        summary: "Uma boa alternativa quando você quer outra opção forte focada em texto para imagem.",
      },
      {
        name: "Nano Banana Pro",
        summary: "Melhor ajuste quando o Claude Code parte de uma imagem existente e precisa de edição iterativa.",
      },
      {
        name: "Nano Banana 2",
        summary: "Outra opção orientada a edição para fluxos de imagem para imagem.",
      },
    ],
    articleJsonLd: createTechArticleJsonLd({
      headline: "Geração de imagem no Claude Code — Adicione geração de imagem ao Claude Code",
      description:
        "Página focada em adicionar geração de imagem ao Claude Code com AnyCap e modelos como Seedream 5 e Nano Banana Pro.",
      path: "/for/claude-code/image-generation",
      about: ["Claude Code", "Geração de imagem", "Seedream 5", "Nano Banana Pro"],
      keywords: [
        "geração de imagem claude code",
        "adicionar geração de imagem ao claude code",
        "claude code gerar imagens",
        "geração de imagem para claude code",
      ],
      dateModified: PAGE_LAST_MODIFIED_ISO,
    }),
  },
  id: undefined as never,
  de: {
    breadcrumbItems: [
      { name: "Startseite", href: "/" },
      { name: "Agenten ausstatten", href: "/for", unlinkable: true },
      { name: "Claude Code", href: "/for/claude-code" },
      { name: "Bildgenerierung" },
    ],
    eyebrow: "Claude Code x Bildgenerierung",
    titleLines: [
      "Opus 4.7 + AnyCap = Bildgenerierung in Claude Code.",
      "Einen Prompt entfernt. Kein neues SDK. Kein Kontextwechsel.",
    ],
    intro:
      "Claude Code auf Opus 4.7 reasoniert besser als je zuvor – aber es liefert noch immer kein Bildmodell mit. Kombinieren Sie es mit AnyCap und Sie erhalten Seedream 5, Seedream 4.5, Nano Banana Pro und Nano Banana 2 hinter derselben Agent-Oberfläche, in derselben Terminal-Sitzung, mit demselben Login. Bitten Sie Opus 4.7 um ein Launch-Visual, ein Produkt-Mockup, ein Thumbnail oder eine Iteration auf einer bestehenden Referenz, und es wählt das richtige Modell aus und führt es aus. Die Kombination ist beeindruckend: der stärkste Coding-Agent, den Anthropic je veröffentlicht hat, kombiniert mit Bildgenerierung – ohne Glue-Code dazwischen.",
    ctas: {
      primary: "Loslegen",
      secondary: "Tools zu Claude Code hinzufügen",
    },
    installTitle: "Installationspfad",
    installStepPrefix: "Schritt",
    modelTitle: "Wählen Sie das richtige Bildmodell",
    commandTitle: "Erste Befehle zum Ausprobieren",
    textToImageLabel: "Text zu Bild",
    imageEditingLabel: "Bildbearbeitung",
    faqTitle: "FAQ",
    footerCtas: {
      back: "Zurück zum Claude-Code-Hub",
      capability: "Capability Bildgenerierung",
      video: "Videogenerierung in Claude Code",
    },
    faqItems: [
      {
        question: "Kann Claude Code von sich aus Bilder generieren?",
        answer:
          "Nicht als eingebaute Capability. AnyCap fügt Claude Code Bildgenerierung über einen Installationspfad und eine CLI hinzu.",
      },
      {
        question: "Welche Bildmodelle sind über AnyCap verfügbar?",
        answer:
          "Der aktuelle Bildgenerierungs-Stack umfasst Seedream 5, Seedream 4.5, Nano Banana Pro und Nano Banana 2.",
      },
      {
        question: "Brauche ich für Bildbearbeitung einen anderen Workflow?",
        answer:
          "Nein. Derselbe AnyCap-Bildbefehl deckt sowohl Text-zu-Bild- als auch Bild-zu-Bild-Workflows ab, je nach Modell und verwendeten Flags.",
      },
    ],
    modelCards: [
      {
        name: "Seedream 5",
        summary: "Beste erste Wahl für polierte Text-zu-Bild-Ergebnisse.",
      },
      {
        name: "Seedream 4.5",
        summary: "Eine starke Alternative, wenn Sie eine weitere text-zentrierte Bildgenerierungs-Option möchten.",
      },
      {
        name: "Nano Banana Pro",
        summary: "Beste Wahl, wenn Claude Code von einem bestehenden Bild ausgeht und iterative Bearbeitung benötigt.",
      },
      {
        name: "Nano Banana 2",
        summary: "Eine weitere bearbeitungsorientierte Option für Bild-zu-Bild-Workflows.",
      },
    ],
    articleJsonLd: createTechArticleJsonLd({
      headline: "Claude Code Opus 4.7 Bildgenerierung – Seedream 5 + Nano Banana via AnyCap",
      description:
        "Wie man Claude Code auf Claude Opus 4.7 Bildgenerierung über AnyCap mit Seedream 5, Nano Banana Pro und anderen aktuellen Bildmodellen hinzufügt.",
      path: "/for/claude-code/image-generation",
      about: ["Claude Code", "Claude Opus 4.7", "Bildgenerierung", "Seedream 5", "Nano Banana Pro"],
      keywords: [
        "claude code opus 4.7 bildgenerierung",
        "claude opus 4.7 bildgenerierung",
        "claude code bildgenerierung",
        "bildgenerierung zu claude code hinzufügen",
        "claude code bilder generieren",
        "bildgenerierung für claude code",
      ],
      datePublished: PAGE_PUBLISHED_ISO,
      dateModified: PAGE_LAST_MODIFIED_ISO,
    }),
  },
};
contentByLocale.id = contentByLocale.en;

export const metadata: Metadata = createLocalizedMetadataForPath(
  defaultLocale,
  "/for/claude-code/image-generation",
  {
    title: "Claude Code Image Generation Skill | AnyCap",
    description:
      "Install the AnyCap image generation skill in Claude Code. Opus 4.7 calls Seedream 5, Nano Banana Pro, and more through one CLI and one login.",
    openGraph: {
      type: "website",
      title: "Claude Code image generation skill — Seedream 5 + Nano Banana via AnyCap",
      description:
        "Install the AnyCap image generation skill in Claude Code on Opus 4.7. One install, one login, no separate image API to wire.",
    },
  }
);

export default async function ClaudeCodeImageGenerationPage() {
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

          <FadeIn className="mt-8">
            <EarlyAccessBanner />
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

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
              <h2 className="mb-8 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {content.modelTitle}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {content.modelCards.map((card) => (
                  <div key={card.name} className="rounded-xl border border-[#d4dbb8] p-5">
                    <h3 className="mb-2 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                      {card.name}
                    </h3>
                    <p className="text-sm leading-6 text-[#4d5145]">{card.summary}</p>
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
              <div className="space-y-6 max-w-[820px]">
                <div>
                  <p className="mb-3 text-[11px] tracking-[0.5px] text-[#5a5e52]" style={mono}>
                    {content.textToImageLabel}
                  </p>
                  <div className="bg-[#1c1f17] px-5 py-4">
                    <p className="break-all text-[13px] text-[#d4e0a4]" style={mono}>
                      anycap image generate --model seedream-5 --prompt &quot;launch announcement visual on off-white background&quot;
                    </p>
                  </div>
                </div>
                <div>
                  <p className="mb-3 text-[11px] tracking-[0.5px] text-[#5a5e52]" style={mono}>
                    {content.imageEditingLabel}
                  </p>
                  <div className="bg-[#1c1f17] px-5 py-4">
                    <p className="break-all text-[13px] text-[#d4e0a4]" style={mono}>
                      anycap image generate --model nano-banana-pro --mode image-to-image --prompt &quot;add olive highlight accents and softer shadows&quot; --param reference_image_urls=&#39;[&quot;./mockup.png&quot;]&#39;
                    </p>
                  </div>
                </div>
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
                  href="/capabilities/image-generation"
                  className="inline-block rounded-lg border border-[#1c1f17] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] transition-colors hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
                  style={mono}
                >
                  {content.footerCtas.capability}
                </Link>
                <Link
                  href="/for/claude-code/video-generation"
                  className="inline-block rounded-lg border border-[#1c1f17] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] transition-colors hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
                  style={mono}
                >
                  {content.footerCtas.video}
                </Link>
              </div>
            </section>
          </FadeIn>
        </div>
      </article>
    </>
  );
}
