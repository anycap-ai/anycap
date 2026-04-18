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
const PAGE_PATH = "/compare/claude-opus-4-7-vs-sonnet-4-6";
const PAGE_PUBLISHED_ISO = "2026-04-17";
const PAGE_LAST_MODIFIED_ISO = "2026-04-17";

type ComparisonRow = {
  dimension: string;
  opus47: string;
  sonnet46: string;
};

type PageContent = {
  breadcrumbItems: readonly { name: string; href?: string; unlinkable?: boolean }[];
  eyebrow: string;
  lastUpdatedLabel: string;
  heroTitle: [string, string];
  heroIntro: string;
  quickAnswerLabel: string;
  quickAnswerTitle: string;
  quickAnswerBody: string;
  tableTitle: string;
  tableNote: string;
  tableHeaders: readonly [string, string, string];
  comparisons: readonly ComparisonRow[];
  whenOpusTitle: string;
  whenOpusBullets: readonly string[];
  whenSonnetTitle: string;
  whenSonnetBullets: readonly string[];
  capabilityCalloutTitle: string;
  capabilityCalloutBody: string;
  ctaTitle: string;
  ctaCards: readonly { title: string; href: string; body: string }[];
  faqTitle: string;
  faqItems: readonly { question: string; answer: string }[];
  articleJsonLd: Record<string, unknown>;
};

const enContent: PageContent = {
  breadcrumbItems: [
    { name: "Home", href: "/" },
    { name: "Compare", href: "/compare", unlinkable: true },
    { name: "Claude Opus 4.7 vs Sonnet 4.6" },
  ],
  eyebrow: "Compare x Claude models",
  lastUpdatedLabel: "Updated April 17, 2026",
  heroTitle: [
    "Claude Opus 4.7 vs Sonnet 4.6",
    "for Claude Code — which one, and why.",
  ],
  heroIntro:
    "Claude Opus 4.7 is Anthropic's strongest reasoning and coding model. Claude Sonnet 4.6 is the fast, cost-efficient default that handles most everyday agent work. Inside Claude Code, both can drive the agent — but they are tuned for different jobs. This page is a practical comparison: when Opus 4.7 is genuinely worth it, when Sonnet 4.6 is the better default, and how the Opus 4.7 + AnyCap combo changes the picture once image, video, and visual analysis enter the workflow.",
  quickAnswerLabel: "Quick answer",
  quickAnswerTitle: "Default to Sonnet 4.6 for speed and cost. Switch to Opus 4.7 the moment the run gets long, ambiguous, or visual.",
  quickAnswerBody:
    "Sonnet 4.6 wins on latency, cost, and high-volume coding loops. Opus 4.7 wins on long agentic runs, hard refactors, and any workflow where reasoning depth or tool-use recovery matters. Pair Opus 4.7 with AnyCap and the same agent surface also reaches image generation, video generation, and visual analysis — the combo is borderline insane for product teams shipping multimodal work from the terminal.",
  tableTitle: "Side-by-side: Opus 4.7 vs Sonnet 4.6",
  tableNote: "Practical differences for teams running Claude Code on either model.",
  tableHeaders: ["Dimension", "Claude Opus 4.7", "Claude Sonnet 4.6"],
  comparisons: [
    {
      dimension: "Best for",
      opus47: "Long agentic runs, hard reasoning, multi-file refactors, decision-dense work.",
      sonnet46: "Fast everyday coding, high-volume edits, latency-sensitive flows.",
    },
    {
      dimension: "Reasoning depth",
      opus47: "Strongest in the Claude line — holds plans across many tool calls.",
      sonnet46: "Strong, but tuned more for breadth and speed than maximum depth.",
    },
    {
      dimension: "Latency",
      opus47: "Slower — pays cost in time for the deeper plan.",
      sonnet46: "Fast — better for tight feedback loops.",
    },
    {
      dimension: "Cost per token",
      opus47: "Higher per-token rate, justified for high-stakes runs.",
      sonnet46: "Lower per-token rate, fits high-volume use.",
    },
    {
      dimension: "Tool-use recovery",
      opus47: "Recovers from failed shell or test runs more reliably.",
      sonnet46: "Recovers, but more sensitive to noisy tool output.",
    },
    {
      dimension: "Vision (read)",
      opus47: "Strong screenshot, diagram, and document interpretation.",
      sonnet46: "Strong vision, generally faster on bulk inputs.",
    },
    {
      dimension: "Image generation (native)",
      opus47: "Not native — needs AnyCap for Seedream 5, Nano Banana Pro.",
      sonnet46: "Not native — needs AnyCap for Seedream 5, Nano Banana Pro.",
    },
    {
      dimension: "Video generation (native)",
      opus47: "Not native — needs AnyCap for Veo 3.1, Seedance, Kling.",
      sonnet46: "Not native — needs AnyCap for Veo 3.1, Seedance, Kling.",
    },
    {
      dimension: "Best paired with",
      opus47: "AnyCap — closes the multimodal gap so the strongest agent can actually ship media.",
      sonnet46: "AnyCap — same install path; Sonnet just runs the loop faster.",
    },
  ],
  whenOpusTitle: "When Opus 4.7 is worth the cost",
  whenOpusBullets: [
    "Multi-file refactors and migrations that span many tool calls.",
    "Long-horizon planning where the agent must hold the brief across hours of work.",
    "Test-failure loops that require deep root-cause analysis.",
    "Workflows that combine code with visual generation (Opus 4.7 + AnyCap is the strongest combo).",
    "Anything where a wrong answer costs more than a few extra dollars of inference.",
  ],
  whenSonnetTitle: "When Sonnet 4.6 is the better default",
  whenSonnetBullets: [
    "High-volume routine coding with tight latency budgets.",
    "Bulk vision passes — reading many screenshots or documents quickly.",
    "Cost-sensitive batch jobs and CI-driven agent runs.",
    "Pair-programming-style sessions where speed beats depth.",
    "Triaging — let Sonnet do the first pass, escalate to Opus 4.7 only when needed.",
  ],
  capabilityCalloutTitle: "Either model + AnyCap = every modality, one CLI",
  capabilityCalloutBody:
    "Neither Opus 4.7 nor Sonnet 4.6 ships with image generation, video generation, or video analysis. AnyCap closes that gap for both. The same skill file and CLI work whichever Claude model is driving Claude Code today — so you can switch models freely without rewiring the multimodal stack. The Opus 4.7 + AnyCap combo is the recommended default for high-stakes multimodal work; Sonnet 4.6 + AnyCap is the high-throughput counterpart.",
  ctaTitle: "Best next moves",
  ctaCards: [
    {
      title: "Claude Code on Opus 4.7 hub",
      href: "/for/claude-code",
      body: "Opus 4.7 + AnyCap = one agent, every modality, zero glue code.",
    },
    {
      title: "Claude Opus 4.7 capabilities",
      href: "/learn/claude-opus-4-7-capabilities",
      body: "What Opus 4.7 does, what it doesn't, and what AnyCap unlocks.",
    },
    {
      title: "Claude Opus 4.7 image + video workflow",
      href: "/guides/claude-opus-4-7-image-video-workflow",
      body: "End-to-end image and video workflow with one CLI.",
    },
    {
      title: "Best AI tools for Claude Code (Opus 4.7 Edition)",
      href: "/learn/best-ai-for-claude-code",
      body: "Buyer guide for teams choosing how to extend Claude Code.",
    },
  ],
  faqTitle: "FAQ",
  faqItems: [
    {
      question: "Is Claude Opus 4.7 always better than Sonnet 4.6?",
      answer:
        "No. Opus 4.7 is stronger on long, hard, decision-dense runs. Sonnet 4.6 is faster and cheaper for high-volume routine work. Most production setups use Sonnet 4.6 as the default and Opus 4.7 for the runs that matter most.",
    },
    {
      question: "Can I switch between Opus 4.7 and Sonnet 4.6 inside Claude Code?",
      answer:
        "Yes. Claude Code lets you pick the underlying model. The AnyCap install path is the same for both, so you can switch models without rewiring image, video, or visual analysis.",
    },
    {
      question: "Does Opus 4.7 generate images or video natively?",
      answer:
        "No. Neither Opus 4.7 nor Sonnet 4.6 ships with image generation, video generation, or video analysis. AnyCap adds those through one CLI for both models.",
    },
    {
      question: "Why is the Opus 4.7 + AnyCap combo described as insane?",
      answer:
        "Because the strongest reasoning agent Anthropic has shipped suddenly reaches Seedream 5, Nano Banana Pro, Veo 3.1, Seedance, Kling, image understanding, and video analysis through one terminal — with no second SDK and no second login.",
    },
    {
      question: "What is the recommended setup for a small product team?",
      answer:
        "Default to Sonnet 4.6 + AnyCap for daily work. Escalate to Opus 4.7 + AnyCap when the run is long, ambiguous, or has to ship a multimodal asset end-to-end.",
    },
  ],
  articleJsonLd: createTechArticleJsonLd({
    headline: "Claude Opus 4.7 vs Claude Sonnet 4.6 for Claude Code — which model, and when",
    description:
      "Practical comparison of Claude Opus 4.7 and Claude Sonnet 4.6 inside Claude Code. When each model is worth it, where they differ, and how the Opus 4.7 + AnyCap combo unlocks image, video, and visual analysis for both.",
    path: PAGE_PATH,
    about: ["Claude Opus 4.7", "Claude Sonnet 4.6", "Claude Code", "AI capabilities", "AnyCap"],
    keywords: [
      "claude opus 4.7 vs sonnet 4.6",
      "opus 4.7 vs sonnet 4.6",
      "claude code opus 4.7",
      "claude code sonnet 4.6",
      "claude opus 4.7 vs sonnet",
      "best claude model for claude code",
    ],
    datePublished: PAGE_PUBLISHED_ISO,
    dateModified: PAGE_LAST_MODIFIED_ISO,
  }),
};

const ptBrContent: PageContent = {
  breadcrumbItems: [
    { name: "Início", href: "/" },
    { name: "Comparar", href: "/compare", unlinkable: true },
    { name: "Claude Opus 4.7 vs Sonnet 4.6" },
  ],
  eyebrow: "Comparar x modelos Claude",
  lastUpdatedLabel: "Atualizado em 17 de abril de 2026",
  heroTitle: [
    "Claude Opus 4.7 vs Sonnet 4.6",
    "para Claude Code — qual usar e quando.",
  ],
  heroIntro:
    "O Claude Opus 4.7 é o modelo de raciocínio e código mais forte da Anthropic. O Claude Sonnet 4.6 é o default rápido e custo-eficiente para a maior parte do dia a dia. Dentro do Claude Code, ambos rodam o agente — mas para trabalhos diferentes. Aqui vai uma comparação prática: quando o Opus 4.7 vale a pena, quando o Sonnet 4.6 é o default certo e como a combinação Opus 4.7 + AnyCap muda o jogo quando entra imagem, vídeo e análise visual.",
  quickAnswerLabel: "Resposta rápida",
  quickAnswerTitle: "Use Sonnet 4.6 como default por velocidade e custo. Suba para Opus 4.7 quando o run fica longo, ambíguo ou visual.",
  quickAnswerBody:
    "Sonnet 4.6 vence em latência, custo e loops de código de alto volume. Opus 4.7 vence em runs agentic longos, refactors difíceis e qualquer fluxo onde profundidade de raciocínio importa. Combine Opus 4.7 com AnyCap e a mesma superfície de agente alcança geração de imagem, geração de vídeo e análise visual — a combinação é absurda para times de produto que entregam trabalho multimodal a partir do terminal.",
  tableTitle: "Lado a lado: Opus 4.7 vs Sonnet 4.6",
  tableNote: "Diferenças práticas para times rodando Claude Code em qualquer dos dois modelos.",
  tableHeaders: ["Dimensão", "Claude Opus 4.7", "Claude Sonnet 4.6"],
  comparisons: [
    {
      dimension: "Melhor para",
      opus47: "Runs agentic longos, raciocínio difícil, refactors multiarquivo.",
      sonnet46: "Código rápido do dia a dia, edições em volume, fluxos sensíveis a latência.",
    },
    {
      dimension: "Profundidade de raciocínio",
      opus47: "Mais forte da linha Claude — mantém planos por muitas chamadas.",
      sonnet46: "Forte, mas ajustado para amplitude e velocidade.",
    },
    {
      dimension: "Latência",
      opus47: "Mais lento — paga em tempo pelo plano mais profundo.",
      sonnet46: "Rápido — melhor para loops de feedback curtos.",
    },
    {
      dimension: "Custo por token",
      opus47: "Mais alto, justificado em runs de alto risco.",
      sonnet46: "Mais baixo, encaixa em alto volume.",
    },
    {
      dimension: "Recuperação no uso de ferramentas",
      opus47: "Se recupera melhor de falhas de shell ou teste.",
      sonnet46: "Se recupera, mas é mais sensível a output ruidoso.",
    },
    {
      dimension: "Visão (leitura)",
      opus47: "Forte em capturas, diagramas e documentos.",
      sonnet46: "Forte em visão, mais rápido em batches.",
    },
    {
      dimension: "Geração de imagem (nativa)",
      opus47: "Não nativa — precisa do AnyCap para Seedream 5 e Nano Banana Pro.",
      sonnet46: "Não nativa — precisa do AnyCap para Seedream 5 e Nano Banana Pro.",
    },
    {
      dimension: "Geração de vídeo (nativa)",
      opus47: "Não nativa — precisa do AnyCap para Veo 3.1, Seedance e Kling.",
      sonnet46: "Não nativa — precisa do AnyCap para Veo 3.1, Seedance e Kling.",
    },
    {
      dimension: "Melhor combinação",
      opus47: "AnyCap — fecha a lacuna multimodal para o agente mais forte entregar mídia.",
      sonnet46: "AnyCap — mesmo install; Sonnet apenas roda o loop mais rápido.",
    },
  ],
  whenOpusTitle: "Quando o Opus 4.7 vale o custo",
  whenOpusBullets: [
    "Refactors e migrações multiarquivo com muitas chamadas de ferramenta.",
    "Planejamento de longo horizonte em que o agente precisa segurar o brief por horas.",
    "Loops de falha de teste que pedem análise de causa raiz profunda.",
    "Fluxos que combinam código com geração visual (Opus 4.7 + AnyCap é a combinação mais forte).",
    "Qualquer caso em que uma resposta errada custa mais do que alguns dólares de inferência.",
  ],
  whenSonnetTitle: "Quando o Sonnet 4.6 é o default melhor",
  whenSonnetBullets: [
    "Código rotineiro de alto volume com latência apertada.",
    "Passadas de visão em massa — ler muitas capturas ou documentos rápido.",
    "Jobs em batch sensíveis a custo e runs agentic em CI.",
    "Sessões de pair-programming onde velocidade ganha de profundidade.",
    "Triagem — Sonnet faz a primeira passada, Opus 4.7 entra só quando precisa.",
  ],
  capabilityCalloutTitle: "Qualquer um dos dois + AnyCap = todas as modalidades, uma CLI",
  capabilityCalloutBody:
    "Nem Opus 4.7 nem Sonnet 4.6 trazem geração de imagem, geração de vídeo ou análise de vídeo nativas. O AnyCap fecha essa lacuna para os dois. A mesma skill e CLI funcionam para qualquer modelo Claude rodando o Claude Code, então você troca de modelo sem refazer a stack multimodal. Opus 4.7 + AnyCap é o default para trabalho multimodal de alto risco; Sonnet 4.6 + AnyCap é a contraparte de alto throughput.",
  ctaTitle: "Próximos melhores passos",
  ctaCards: [
    { title: "Hub do Claude Code no Opus 4.7", href: "/for/claude-code", body: "Opus 4.7 + AnyCap = um agente, todas as modalidades, sem cola." },
    { title: "Capacidades do Claude Opus 4.7", href: "/learn/claude-opus-4-7-capabilities", body: "O que o Opus 4.7 faz e o que o AnyCap libera." },
    { title: "Workflow de imagem + vídeo no Opus 4.7", href: "/guides/claude-opus-4-7-image-video-workflow", body: "Workflow ponta a ponta com uma CLI." },
    { title: "Melhores ferramentas para Claude Code", href: "/learn/best-ai-for-claude-code", body: "Guia para escolher como estender o Claude Code." },
  ],
  faqTitle: "FAQ",
  faqItems: [
    {
      question: "O Opus 4.7 é sempre melhor que o Sonnet 4.6?",
      answer:
        "Não. Opus 4.7 é mais forte em runs longos, difíceis e densos em decisão. Sonnet 4.6 é mais rápido e barato para volume rotineiro. A maioria das stacks usa Sonnet 4.6 como default e Opus 4.7 para os runs que mais importam.",
    },
    {
      question: "Posso alternar entre Opus 4.7 e Sonnet 4.6 dentro do Claude Code?",
      answer:
        "Sim. O Claude Code permite escolher o modelo. O caminho de instalação do AnyCap é o mesmo para ambos, então você troca de modelo sem refazer imagem, vídeo ou análise visual.",
    },
    {
      question: "O Opus 4.7 gera imagem ou vídeo nativamente?",
      answer:
        "Não. Nem Opus 4.7 nem Sonnet 4.6 trazem geração de imagem, geração de vídeo ou análise de vídeo nativas. O AnyCap adiciona essas capacidades por uma CLI nos dois.",
    },
    {
      question: "Por que a combinação Opus 4.7 + AnyCap é descrita como absurda?",
      answer:
        "Porque o agente de raciocínio mais forte da Anthropic passa a alcançar Seedream 5, Nano Banana Pro, Veo 3.1, Seedance, Kling, entendimento de imagem e análise de vídeo por um terminal — sem segundo SDK, sem segundo login.",
    },
    {
      question: "Qual é a configuração recomendada para um time pequeno?",
      answer:
        "Default Sonnet 4.6 + AnyCap no dia a dia. Suba para Opus 4.7 + AnyCap quando o run é longo, ambíguo ou precisa entregar um asset multimodal ponta a ponta.",
    },
  ],
  articleJsonLd: createTechArticleJsonLd({
    headline: "Claude Opus 4.7 vs Claude Sonnet 4.6 para Claude Code — qual modelo e quando",
    description:
      "Comparação prática entre Claude Opus 4.7 e Claude Sonnet 4.6 dentro do Claude Code. Quando cada um vale, onde diferem e como a combinação Opus 4.7 + AnyCap libera imagem, vídeo e análise visual nos dois.",
    path: PAGE_PATH,
    about: ["Claude Opus 4.7", "Claude Sonnet 4.6", "Claude Code", "Capacidades de IA", "AnyCap"],
    keywords: [
      "claude opus 4.7 vs sonnet 4.6",
      "opus 4.7 vs sonnet 4.6",
      "claude code opus 4.7",
      "claude code sonnet 4.6",
      "melhor modelo claude para claude code",
    ],
    datePublished: PAGE_PUBLISHED_ISO,
    dateModified: PAGE_LAST_MODIFIED_ISO,
  }),
};

const contentByLocale: Record<SiteLocale, PageContent> = {
  en: enContent,
  "pt-br": ptBrContent,
  id: enContent,
  de: enContent,
};

export const metadata: Metadata = createLocalizedMetadataForPath(
  defaultLocale,
  PAGE_PATH,
  {
    title: "Claude Opus 4.7 vs Sonnet 4.6 — which Claude model for Claude Code",
    description:
      "Practical comparison of Claude Opus 4.7 vs Sonnet 4.6 inside Claude Code. When each model is worth it, and how the Opus 4.7 + AnyCap combo unlocks image, video, and visual analysis.",
    openGraph: {
      type: "website",
      title: "Claude Opus 4.7 vs Sonnet 4.6 — which Claude model for Claude Code",
      description:
        "When to default to Sonnet 4.6 and when to escalate to Opus 4.7 — plus how AnyCap closes the multimodal gap for both.",
    },
  }
);

export default async function ClaudeOpus47VsSonnet46Page() {
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

          <FadeIn className="mt-10">
            <section className="rounded-[28px] border border-[#d4dbb8] bg-[#fffffc]/80 p-8 md:p-10">
              <p className="text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                {content.quickAnswerLabel}
              </p>
              <h2 className="mt-4 text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                {content.quickAnswerTitle}
              </h2>
              <p className="mt-5 max-w-[820px] text-sm leading-6 text-[#4d5145] md:text-[15px]">
                {content.quickAnswerBody}
              </p>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                {content.tableTitle}
              </h2>
              <p className="mt-3 max-w-[820px] text-sm leading-6 text-[#4d5145] md:text-[15px]">
                {content.tableNote}
              </p>
              <div className="mt-8 overflow-hidden rounded-[24px] border border-[#d4dbb8]">
                <table className="w-full border-collapse text-left text-sm text-[#1c1f17]">
                  <thead className="bg-[#f7f8ef]">
                    <tr>
                      {content.tableHeaders.map((header) => (
                        <th
                          key={header}
                          className="px-5 py-4 text-[12px] font-bold tracking-[0.5px] text-[#1c1f17]"
                          style={mono}
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {content.comparisons.map((row) => (
                      <tr key={row.dimension} className="border-t border-[#d4dbb8] align-top">
                        <td className="px-5 py-4 text-[14px] leading-6 text-[#1c1f17]" style={mono}>
                          {row.dimension}
                        </td>
                        <td className="px-5 py-4 text-[14px] leading-6 text-[#4d5145]">{row.opus47}</td>
                        <td className="px-5 py-4 text-[14px] leading-6 text-[#4d5145]">{row.sonnet46}</td>
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
            <section className="mt-16 md:mt-24 grid gap-6 md:grid-cols-2">
              <div className="rounded-[24px] border border-[#d4dbb8] bg-[#fffffc]/70 p-6">
                <h2 className="text-[20px] leading-7 text-[#1c1f17] md:text-[22px]" style={pixel}>
                  {content.whenOpusTitle}
                </h2>
                <ul className="mt-5 space-y-3">
                  {content.whenOpusBullets.map((bullet) => (
                    <li key={bullet} className="flex gap-3 text-sm leading-6 text-[#4d5145] md:text-[15px]">
                      <span className="mt-[8px] h-1.5 w-1.5 rounded-full bg-[#6b7d3a]" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-[24px] border border-[#d4dbb8] bg-[#f7f8ef]/70 p-6">
                <h2 className="text-[20px] leading-7 text-[#1c1f17] md:text-[22px]" style={pixel}>
                  {content.whenSonnetTitle}
                </h2>
                <ul className="mt-5 space-y-3">
                  {content.whenSonnetBullets.map((bullet) => (
                    <li key={bullet} className="flex gap-3 text-sm leading-6 text-[#4d5145] md:text-[15px]">
                      <span className="mt-[8px] h-1.5 w-1.5 rounded-full bg-[#6b7d3a]" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24 rounded-[28px] border border-[#d4dbb8] bg-[#fffffc]/80 p-8 md:p-10">
              <h2 className="text-[24px] leading-8 text-[#1c1f17] md:text-[30px]" style={pixel}>
                {content.capabilityCalloutTitle}
              </h2>
              <p className="mt-5 max-w-[820px] text-sm leading-6 text-[#4d5145] md:text-[15px]">
                {content.capabilityCalloutBody}
              </p>
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
