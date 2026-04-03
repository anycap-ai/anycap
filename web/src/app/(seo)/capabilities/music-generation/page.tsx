import type { Metadata } from "next";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { FadeIn } from "@/components/ui/FadeIn";
import { MusicGenDemo } from "@/components/landing/MusicGenDemo";
import { createTechArticleJsonLd } from "@/lib/schema";
import { siteConfig } from "@/lib/site";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

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
    code: 'anycap music generate --prompt "lofi night drive" --model suno-v5 -o track.mp3',
  },
  {
    title: "Instrumental generation",
    code:
      'anycap music generate --prompt "minimal ambient soundtrack" --model suno-v5 --instrumental -o ambient.mp3',
  },
  {
    title: "Tag-driven generation",
    code: 'anycap music generate --tags "electronic,upbeat,clean" --model suno-v5 -o loop.mp3',
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
});

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
              Music Generation
            </h1>
            <p className="mt-6 max-w-[780px] text-base leading-7 text-[#4d5145] md:text-lg">
              AnyCap music generation gives agents one CLI for prompt-based music workflows.
              Agents can create background tracks, instrumental drafts, and soundtrack concepts
              through one interface instead of wiring a separate text-to-music API. That makes
              music generation easier to plug into the same agent workflow that already handles
              image generation, video generation, and media analysis.
            </p>
          </FadeIn>

          <FadeIn className="mt-10">
            <MusicGenDemo />
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
                    See credit usage for music generation alongside the rest of the capability stack.
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
