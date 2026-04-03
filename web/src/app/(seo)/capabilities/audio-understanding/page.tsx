import type { Metadata } from "next";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { FadeIn } from "@/components/ui/FadeIn";
import { AudioReadDemo } from "@/components/landing/AudioReadDemo";
import { createTechArticleJsonLd } from "@/lib/schema";
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

const usageExamples = [
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
] as const;

const useCases = [
  "Transcribe meetings, interviews, and podcast clips inside an agent workflow.",
  "Extract action items and summaries from spoken content before creating follow-up docs.",
  "Review support calls or voice notes through the same capability runtime used for image and video analysis.",
  "Turn audio files into structured context an agent can reuse in research, planning, or reporting tasks.",
] as const;

const faqItems = [
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
] as const;

const capabilityGuideJsonLd = createTechArticleJsonLd({
  headline: "Audio Analysis API for AI agents - Audio understanding and transcription",
  description:
    "Capability guide for adding audio understanding to AI agents through AnyCap, including recordings, transcripts, summaries, and audio analysis workflows.",
  path: "/capabilities/audio-understanding",
  about: ["Audio analysis", "Audio understanding", "Transcription API", "AnyCap"],
  keywords: [
    "audio analysis api",
    "audio understanding for ai agents",
    "audio transcription api",
    "speech to text api",
  ],
});

export default function AudioUnderstandingPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Capabilities", href: "/capabilities" },
          { name: "Audio Understanding" },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(capabilityGuideJsonLd) }}
      />

      <article className="px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-[1280px] py-12 md:py-20 lg:py-24">
          <FadeIn>
            <p className="mb-4 text-[11px] tracking-[0.8px] text-[#6b7d3a]" style={mono}>
              Capability
            </p>
            <h1
              className="leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(32px, 6vw, 72px)" }}
            >
              Audio Understanding
            </h1>
            <p className="mt-6 max-w-[780px] text-base leading-7 text-[#4d5145] md:text-lg">
              AnyCap gives agents a consistent audio understanding layer for meetings, podcasts,
              interviews, and voice notes. Instead of wiring a separate audio analysis API or
              transcription stack for each workflow, the agent gets one command surface for
              extracting spoken context, summaries, and structured takeaways through the same
              runtime used for the rest of the capability stack.
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
                CLI usage
              </h2>
              <div className="max-w-[860px] space-y-6">
                {usageExamples.map((example) => (
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
                When agents need audio understanding
              </h2>
              <div className="grid max-w-[920px] gap-4 sm:grid-cols-2">
                {useCases.map((useCase) => (
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
                Related pages
              </h2>
              <div className="grid max-w-[1100px] gap-4 sm:grid-cols-3">
                <Link
                  href="/pricing"
                  className="rounded-xl border border-[#d4dbb8] p-5 transition-colors hover:border-[#6b7d3a]"
                >
                  <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                    Pricing
                  </p>
                  <h3 className="mb-2 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                    Pricing
                  </h3>
                  <p className="text-sm leading-6 text-[#4d5145]">
                    See how audio understanding is priced alongside image, video, search, and crawl.
                  </p>
                </Link>
                <Link
                  href="/capabilities/video-analysis"
                  className="rounded-xl border border-[#d4dbb8] p-5 transition-colors hover:border-[#6b7d3a]"
                >
                  <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                    Related capability
                  </p>
                  <h3 className="mb-2 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                    Video Analysis
                  </h3>
                  <p className="text-sm leading-6 text-[#4d5145]">
                    Pair audio and video analysis when recordings contain both visual and spoken context.
                  </p>
                </Link>
                <Link
                  href="/cli"
                  className="rounded-xl border border-[#d4dbb8] p-5 transition-colors hover:border-[#6b7d3a]"
                >
                  <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                    CLI
                  </p>
                  <h3 className="mb-2 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                    AnyCap CLI
                  </h3>
                  <p className="text-sm leading-6 text-[#4d5145]">
                    Explore the command surface that keeps transcription and analysis in one runtime.
                  </p>
                </Link>
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-8 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                FAQ
              </h2>
              <div className="max-w-[860px] space-y-6">
                {faqItems.map((item) => (
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
