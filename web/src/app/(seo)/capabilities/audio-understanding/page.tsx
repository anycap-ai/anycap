import type { Metadata } from "next";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { FadeIn } from "@/components/ui/FadeIn";
import { AudioReadDemo } from "@/components/landing/AudioReadDemo";
import { createTechArticleJsonLd } from "@/lib/schema";
import { getRequestLocale } from "@/lib/request-locale";
import { siteConfig } from "@/lib/site";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

export const metadata: Metadata = {
  title: "Audio Analysis API for AI agents - Audio understanding and transcription",
  description:
    "Give AI agents audio understanding through AnyCap. Analyze recordings, transcribe spoken content, and extract audio context through one CLI command instead of wiring a separate audio analysis stack.",
  alternates: { canonical: "/capabilities/audio-understanding" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/capabilities/audio-understanding",
    siteName: siteConfig.siteName,
    title: "Audio Analysis API for AI agents - Audio understanding and transcription",
    description:
      "Add audio understanding, transcription, and audio analysis to AI agents with one CLI.",
  },
};

type PageContent = {
  breadcrumb: { name: string; href?: string }[];
  eyebrow: string;
  title: string;
  intro: string;
  usageHeading: string;
  usageExamples: readonly { title: string; code: string }[];
  useCasesHeading: string;
  useCases: readonly string[];
  relatedHeading: string;
  relatedPages: readonly {
    href: string;
    eyebrow: string;
    title: string;
    body: string;
  }[];
  faqHeading: string;
  faqItems: readonly { question: string; answer: string }[];
  jsonLdHeadline: string;
  jsonLdDescription: string;
  jsonLdAbout: readonly string[];
  jsonLdKeywords: readonly string[];
};

const contentByLocale = {
  en: {
    breadcrumb: [
      { name: "Home", href: "/" },
      { name: "Capabilities", href: "/capabilities" },
      { name: "Audio Understanding" },
    ],
    eyebrow: "Capabilities",
    title: "Audio Understanding",
    intro:
      "AnyCap gives agents a consistent audio understanding layer for meetings, podcasts, interviews, and voice notes. Instead of wiring a separate audio analysis API or transcription stack for each workflow, the agent gets one command surface for extracting spoken context, summaries, and structured takeaways through the same runtime used for the rest of the capability stack.",
    usageHeading: "CLI usage",
    usageExamples: [
      {
        title: "Analyze a local recording",
        code: "anycap actions audio-read --file ./meeting.mp3",
      },
      {
        title: "Summarize a podcast clip",
        code:
          'anycap actions audio-read --url https://example.com/podcast.mp3 --instruction "Summarize the main topics and action items"',
      },
      {
        title: "Extract spoken content",
        code:
          'anycap actions audio-read --file ./interview.wav --instruction "Transcribe the key quotes and speaker claims"',
      },
    ],
    useCasesHeading: "When agents need audio understanding",
    useCases: [
      "Transcribe meetings, interviews, and podcast clips inside an agent workflow.",
      "Extract action items and summaries from spoken content before creating follow-up docs.",
      "Review support calls or voice notes through the same capability runtime used for image and video analysis.",
      "Turn audio files into structured context an agent can reuse in research, planning, or reporting tasks.",
    ],
    relatedHeading: "Related pages",
    relatedPages: [
      {
        href: "/pricing",
        eyebrow: "Pricing",
        title: "Pricing",
        body: "See how audio understanding is priced alongside image, video, search, and crawl.",
      },
      {
        href: "/capabilities/video-analysis",
        eyebrow: "Related capability",
        title: "Video Analysis",
        body: "Pair audio and video analysis when recordings contain both visual and spoken context.",
      },
      {
        href: "/cli",
        eyebrow: "CLI",
        title: "AnyCap CLI",
        body: "Explore the command surface that keeps transcription and analysis in one runtime.",
      },
    ],
    faqHeading: "FAQ",
    faqItems: [
      {
        question: "What does AnyCap audio understanding let agents do?",
        answer:
          "It gives agents one interface for audio analysis across meetings, podcasts, interviews, and voice notes. In practice that means one CLI surface for transcription, summary, and targeted audio question answering.",
      },
      {
        question: "Is this page really about an audio analysis API?",
        answer:
          "Yes. Audio understanding is the capability label, while audio analysis API, audio transcription API, and speech-to-text API are the adjacent market phrases teams often use during evaluation.",
      },
      {
        question: "Why use audio understanding through the same runtime as image and video analysis?",
        answer:
          "Because many workflows mix media types. A single runtime makes it easier for an agent to move from screenshots to recordings to audio files without switching tools or auth flows.",
      },
      {
        question: "Does this replace text-to-speech?",
        answer:
          "No. Audio understanding is about reading and analyzing audio. Text-to-speech is a separate speech output capability and still belongs to a different SEO theme.",
      },
    ],
    jsonLdHeadline: "Audio Analysis API for AI agents - Audio understanding and transcription",
    jsonLdDescription:
      "Capability guide for adding audio understanding to AI agents through AnyCap, including recordings, transcripts, summaries, and audio analysis workflows.",
    jsonLdAbout: ["Audio analysis", "Audio understanding", "Transcription API", "AnyCap"],
    jsonLdKeywords: [
      "audio analysis api",
      "audio understanding for ai agents",
      "audio transcription api",
      "speech to text api",
    ],
  },
  "pt-br": {
    breadcrumb: [
      { name: "Inicio", href: "/" },
      { name: "Capacidades", href: "/capabilities" },
      { name: "Entendimento de audio" },
    ],
    eyebrow: "Capacidades",
    title: "Entendimento de audio",
    intro:
      "O AnyCap da aos agentes uma camada consistente de entendimento de audio para reunioes, podcasts, entrevistas e notas de voz. Em vez de integrar uma API separada de analise de audio ou uma stack propria de transcricao para cada fluxo, o agente recebe uma unica superficie de comando para extrair contexto falado, resumos e conclusoes estruturadas dentro do mesmo runtime usado no resto da stack de capabilities.",
    usageHeading: "Uso via CLI",
    usageExamples: [
      {
        title: "Analise uma gravacao local",
        code: "anycap actions audio-read --file ./meeting.mp3",
      },
      {
        title: "Resuma um trecho de podcast",
        code:
          'anycap actions audio-read --url https://example.com/podcast.mp3 --instruction "Summarize the main topics and action items"',
      },
      {
        title: "Extraia o conteudo falado",
        code:
          'anycap actions audio-read --file ./interview.wav --instruction "Transcribe the key quotes and speaker claims"',
      },
    ],
    useCasesHeading: "Quando agentes precisam de entendimento de audio",
    useCases: [
      "Transcrever reunioes, entrevistas e trechos de podcast dentro de um fluxo de agente.",
      "Extrair acoes e resumos de conteudo falado antes de gerar documentos de acompanhamento.",
      "Revisar chamadas de suporte ou notas de voz no mesmo runtime usado para analise de imagem e video.",
      "Transformar arquivos de audio em contexto estruturado que o agente possa reutilizar em pesquisa, planejamento ou relatorios.",
    ],
    relatedHeading: "Paginas relacionadas",
    relatedPages: [
      {
        href: "/pricing",
        eyebrow: "Precos",
        title: "Precos",
        body: "Veja como o entendimento de audio e cobrado junto com imagem, video, busca e crawl.",
      },
      {
        href: "/capabilities/video-analysis",
        eyebrow: "Capability relacionada",
        title: "Analise de video",
        body: "Combine analise de audio e video quando gravacoes tiverem contexto visual e falado.",
      },
      {
        href: "/cli",
        eyebrow: "CLI",
        title: "CLI do AnyCap",
        body: "Explore a superficie de comandos que mantem transcricao e analise dentro do mesmo runtime.",
      },
    ],
    faqHeading: "FAQ",
    faqItems: [
      {
        question: "O que o entendimento de audio do AnyCap permite aos agentes fazer?",
        answer:
          "Ele da aos agentes uma unica interface para analise de audio em reunioes, podcasts, entrevistas e notas de voz. Na pratica, isso significa uma unica superficie de CLI para transcricao, resumo e perguntas direcionadas sobre o audio.",
      },
      {
        question: "Esta pagina e mesmo sobre uma API de analise de audio?",
        answer:
          "Sim. Entendimento de audio e o nome da capability, enquanto API de analise de audio, API de transcricao e speech-to-text API sao as expressoes de mercado proximas que equipes costumam usar durante a avaliacao.",
      },
      {
        question: "Por que usar entendimento de audio no mesmo runtime de imagem e video?",
        answer:
          "Porque muitos fluxos misturam diferentes tipos de midia. Um unico runtime facilita para o agente passar de screenshots para gravacoes e depois para arquivos de audio sem trocar de ferramenta nem de autenticacao.",
      },
      {
        question: "Isso substitui text-to-speech?",
        answer:
          "Nao. Entendimento de audio serve para ler e analisar audio. Text-to-speech e uma capability separada de fala e pertence a outro tema de SEO.",
      },
    ],
    jsonLdHeadline: "API de analise de audio para agentes de IA - entendimento de audio e transcricao",
    jsonLdDescription:
      "Guia de capability para adicionar entendimento de audio a agentes de IA com o AnyCap, incluindo gravacoes, transcricoes, resumos e fluxos de analise de audio.",
    jsonLdAbout: ["Analise de audio", "Entendimento de audio", "API de transcricao", "AnyCap"],
    jsonLdKeywords: [
      "api de analise de audio",
      "entendimento de audio para agentes de ia",
      "api de transcricao de audio",
      "speech to text api",
    ],
  },
} as const;

export default async function AudioUnderstandingPage() {
  const locale = await getRequestLocale();
  const content = contentByLocale[locale as keyof typeof contentByLocale] ?? contentByLocale.en;
  const capabilityGuideJsonLd = createTechArticleJsonLd({
    headline: content.jsonLdHeadline,
    description: content.jsonLdDescription,
    path: "/capabilities/audio-understanding",
    locale,
    about: [...content.jsonLdAbout],
    keywords: [...content.jsonLdKeywords],
  });

  return (
    <>
      <BreadcrumbJsonLd items={content.breadcrumb} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(capabilityGuideJsonLd) }}
      />

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
              {content.title}
            </h1>
            <p className="mt-6 max-w-[780px] text-base leading-7 text-[#4d5145] md:text-lg">
              {content.intro}
            </p>
          </FadeIn>

          <FadeIn className="mt-10">
            <AudioReadDemo />
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-6 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {content.usageHeading}
              </h2>
              <div className="max-w-[860px] space-y-6">
                {content.usageExamples.map((example) => (
                  <div key={example.title}>
                    <p className="mb-3 text-[11px] tracking-[0.5px] text-[#5a5e52]" style={mono}>
                      {example.title}
                    </p>
                    <div className="bg-[#1c1f17] px-5 py-4">
                      <p className="break-all text-[13px] text-[#d4e0a4]" style={mono}>
                        {example.code}
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
                {content.useCasesHeading}
              </h2>
              <div className="grid max-w-[920px] gap-4 sm:grid-cols-2">
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
                {content.relatedHeading}
              </h2>
              <div className="grid max-w-[1100px] gap-4 sm:grid-cols-3">
                {content.relatedPages.map((page) => (
                  <Link
                    key={page.href}
                    href={page.href}
                    className="rounded-xl border border-[#d4dbb8] p-5 transition-colors hover:border-[#6b7d3a]"
                  >
                    <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                      {page.eyebrow}
                    </p>
                    <h3 className="mb-2 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                      {page.title}
                    </h3>
                    <p className="text-sm leading-6 text-[#4d5145]">{page.body}</p>
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
              <h2 className="mb-8 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                {content.faqHeading}
              </h2>
              <div className="max-w-[860px] space-y-6">
                {content.faqItems.map((item) => (
                  <div key={item.question} className="rounded-xl border border-[#d4dbb8] p-5">
                    <h3 className="mb-2 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                      {item.question}
                    </h3>
                    <p className="text-sm leading-6 text-[#4d5145]">{item.answer}</p>
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
