import type { Metadata } from "next";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { EarlyAccessBanner } from "@/components/landing/EarlyAccessBanner";
import { FadeIn } from "@/components/ui/FadeIn";
import { MusicGenDemo } from "@/components/landing/MusicGenDemo";
import { createFaqPageJsonLd, createTechArticleJsonLd } from "@/lib/schema";
import { siteConfig } from "@/lib/site";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;
const lastUpdatedLabel = "April 5, 2026";
const lastUpdatedIso = "2026-04-05";

const models = [
  {
    name: "ElevenLabs Music",
    href: "/models/elevenlabs-music",
    modelId: "elevanlabs-music",
    modes: "text-to-music",
    bestFor: "Prompt-based soundtrack drafts and background music inside the same agent runtime",
  },
] as const;

export const metadata: Metadata = {
  title: "Music Generation API for AI agents - Text-to-music through one CLI",
  description:
    "Give AI agents music generation through AnyCap. Generate instrumental tracks and custom music prompts through one CLI instead of wiring a separate music generation API.",
  alternates: { canonical: "/capabilities/music-generation" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/capabilities/music-generation",
    siteName: siteConfig.siteName,
    title: "Music Generation API for AI agents - Text-to-music through one CLI",
    description:
      "Add music generation to AI agents with one CLI, one auth flow, and one capability runtime.",
  },
};

const usageExamples = [
  {
    title: "Prompt-based music generation",
    code:
      'anycap music generate --prompt "lofi night drive with soft synths and a steady pulse" --model elevanlabs-music -o track.mp3',
  },
  {
    title: "Instrumental generation",
    code:
      'anycap music generate --prompt "minimal ambient soundtrack with no vocals" --model elevanlabs-music -o ambient.mp3',
  },
  {
    title: "Discover music models",
    code: "anycap music models",
  },
] as const;

const useCases = [
  "Generate background tracks for product demos, launch videos, and changelog content.",
  "Create instrumental loops for prototypes, trailers, and lightweight marketing workflows.",
  "Keep music generation inside the same CLI workflow as image, video, and analysis tasks.",
  "Produce draft audio quickly before deciding whether a project needs a higher-touch production pass.",
] as const;

const faqItems = [
  {
    question: "What does AnyCap music generation let agents do?",
    answer:
      "It gives agents one command surface for prompt-based music generation. Teams can create draft tracks, instrumental backgrounds, and style-based audio outputs without integrating a separate music generation API.",
  },
  {
    question: "Is this page about a music generation API or a CLI workflow?",
    answer:
      "It is both. Teams often search for a music generation API or text-to-music API, while agent execution usually happens through the AnyCap CLI.",
  },
  {
    question: "Which market language fits this capability best?",
    answer:
      "The best supporting phrases are music generation API, text-to-music API, and AI music API. Music generation is the cleanest capability label, while the API phrasing matches the way teams usually search.",
  },
  {
    question: "When should music generation live in the same runtime as other capabilities?",
    answer:
      "When the same agent is already creating visuals, demos, or product assets. Keeping music generation in the same runtime makes it easier to move from image and video creation into soundtrack generation without changing tools.",
  },
] as const;

const capabilityGuideJsonLd = createTechArticleJsonLd({
  headline: "Music Generation API for AI agents - Text-to-music through one CLI",
  description:
    "Capability guide for adding music generation to AI agents through AnyCap, including prompt-based track generation and instrumental workflows.",
  path: "/capabilities/music-generation",
  about: ["Music generation", "Text-to-music API", "AI music API", "AnyCap"],
  keywords: [
    "music generation api",
    "text to music api",
    "music generation for ai agents",
    "ai music api",
  ],
  dateModified: lastUpdatedIso,
});

const faqJsonLd = createFaqPageJsonLd(faqItems);

export default function MusicGenerationPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Capabilities", href: "/capabilities" },
          { name: "Music Generation" },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(capabilityGuideJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <article className="px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-[1280px] py-12 md:py-20 lg:py-24">
          <FadeIn>
            <p className="mb-4 text-[11px] tracking-[0.8px] text-[#6b7d3a]" style={mono}>
              Capabilities
            </p>
            <p className="text-[11px] text-[#5a5e52] tracking-[0.5px] mb-3" style={mono}>
              Last updated {lastUpdatedLabel}
            </p>
            <h1
              className="leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(32px, 6vw, 72px)" }}
            >
              Music Generation
            </h1>
            <p className="mt-6 max-w-[780px] text-base leading-7 text-[#4d5145] md:text-lg">
              AnyCap music generation gives agents one CLI for prompt-based music workflows.
              Agents can create background tracks, instrumental drafts, and soundtrack concepts
              through one interface instead of wiring a separate text-to-music API. That makes
              music generation easier to plug into the same agent workflow that already handles
              image generation, video generation, and media analysis.
            </p>
            <div className="mt-8 max-w-[860px] border border-[#d4dbb8] bg-[#f9faf5]/80 p-6">
              <p className="mb-3 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                Answer-first summary
              </p>
              <p className="text-sm leading-6 text-[#4d5145]">
                AnyCap currently exposes prompt-based music generation through ElevenLabs Music.
                Use it when the same agent that already creates visuals or clips also needs a fast
                soundtrack draft without switching to a separate audio toolchain.
              </p>
            </div>
          </FadeIn>

          <FadeIn className="mt-8">
            <EarlyAccessBanner />
          </FadeIn>

          <FadeIn className="mt-10">
            <MusicGenDemo />
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-8 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                Supported model
              </h2>
              <div className="overflow-x-auto rounded-xl border border-[#d4dbb8]">
                <table className="w-full text-left">
                  <thead className="bg-[#f9faf5]">
                    <tr className="border-b border-[#d4dbb8]">
                      {["Model", "Model ID", "Modes", "Best fit"].map((header) => (
                        <th
                          key={header}
                          className="px-5 py-3 text-[11px] tracking-[0.5px] text-[#5a5e52]"
                          style={mono}
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {models.map((model) => (
                      <tr key={model.modelId} className="border-b border-[#d4dbb8]/50 last:border-b-0">
                        <td className="px-5 py-4 text-sm font-medium text-[#1c1f17]">
                          <Link href={model.href} className="transition-colors hover:text-[#6b7d3a]">
                            {model.name}
                          </Link>
                        </td>
                        <td className="px-5 py-4 text-sm text-[#4d5145]" style={mono}>
                          {model.modelId}
                        </td>
                        <td className="px-5 py-4 text-sm text-[#4d5145]">{model.modes}</td>
                        <td className="px-5 py-4 text-sm text-[#4d5145]">{model.bestFor}</td>
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
                When agents need music generation
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
              <div className="grid max-w-[1100px] gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                    See credit usage for music generation alongside the rest of the capability stack.
                  </p>
                </Link>
                <Link
                  href="/models/elevenlabs-music"
                  className="rounded-xl border border-[#d4dbb8] p-5 transition-colors hover:border-[#6b7d3a]"
                >
                  <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                    Model
                  </p>
                  <h3 className="mb-2 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                    ElevenLabs Music
                  </h3>
                  <p className="text-sm leading-6 text-[#4d5145]">
                    Read the model guide for prompt-based soundtrack generation through AnyCap.
                  </p>
                </Link>
                <Link
                  href="/capabilities/video-generation"
                  className="rounded-xl border border-[#d4dbb8] p-5 transition-colors hover:border-[#6b7d3a]"
                >
                  <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                    Related capability
                  </p>
                  <h3 className="mb-2 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                    Video Generation
                  </h3>
                  <p className="text-sm leading-6 text-[#4d5145]">
                    Pair soundtrack generation with video workflows when the agent is creating short clips.
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
                    Explore the broader command surface that keeps music, image, video, and analysis in one runtime.
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
