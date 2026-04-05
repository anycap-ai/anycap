import type { Metadata } from "next";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { siteConfig } from "@/lib/site";
import { FadeIn } from "@/components/ui/FadeIn";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { createFaqPageJsonLd, createTechArticleJsonLd } from "@/lib/schema";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;
const lastUpdatedLabel = "April 5, 2026";
const lastUpdatedIso = "2026-04-05";

export const metadata: Metadata = {
  title: "ElevenLabs Music for AI agents — Text-to-music through AnyCap",
  description:
    "Use ElevenLabs Music through AnyCap when AI agents need prompt-based soundtrack generation inside the same CLI and capability runtime as image and video workflows.",
  alternates: { canonical: "/models/elevenlabs-music" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/models/elevenlabs-music",
    siteName: siteConfig.siteName,
    title: "ElevenLabs Music for AI agents — Text-to-music through AnyCap",
    description:
      "Use ElevenLabs Music through AnyCap for prompt-based music generation inside agent workflows.",
  },
};

const fitItems = [
  "Background tracks for demo videos, launch clips, and changelog content",
  "Prompt-based soundtrack generation inside the same runtime as image and video tasks",
  "Fast first-pass music drafts before a higher-touch production handoff",
  "Teams that want music generation discoverable from anycap music models instead of a separate integration",
];

const faqItems = [
  {
    question: "What is ElevenLabs Music best for?",
    answer:
      "ElevenLabs Music is a strong fit for prompt-based soundtrack generation when an agent needs a fast original track inside the same workflow as visual asset generation.",
  },
  {
    question: "How do agents discover the ElevenLabs Music model in AnyCap?",
    answer:
      "Start with anycap music models. In the current catalog, the public label is ElevenLabs Music and the model ID appears as elevanlabs-music.",
  },
  {
    question: "Why mention the model ID separately from the page title?",
    answer:
      "The page title uses the market-facing model name people search for, while the CLI example highlights the current catalog ID so the command is reproducible inside AnyCap.",
  },
];

const modelGuideJsonLd = createTechArticleJsonLd({
  headline: "ElevenLabs Music for AI agents — Text-to-music through AnyCap",
  description:
    "Guide to using ElevenLabs Music through AnyCap for prompt-based soundtrack generation inside AI agent workflows.",
  path: "/models/elevenlabs-music",
  about: ["ElevenLabs Music", "Music generation", "AnyCap", "AI agents"],
  keywords: [
    "elevenlabs music",
    "elevenlabs music api",
    "text to music api",
    "music generation",
    "anycap",
  ],
  dateModified: lastUpdatedIso,
});

const faqJsonLd = createFaqPageJsonLd(faqItems);

export default function ElevenLabsMusicPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Models", href: "/models" },
          { name: "ElevenLabs Music" },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(modelGuideJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <article className="px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-[1280px] py-12 md:py-20 lg:py-24">
          <FadeIn>
            <p className="text-[11px] text-[#6b7d3a] tracking-[0.8px] mb-4" style={mono}>
              Model
            </p>
            <p className="text-[11px] text-[#5a5e52] tracking-[0.5px] mb-3" style={mono}>
              Last updated {lastUpdatedLabel}
            </p>
            <h1
              className="leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(32px, 6vw, 72px)" }}
            >
              ElevenLabs Music
              <br />
              for AI agents
            </h1>
            <p className="mt-6 max-w-[760px] text-base leading-7 text-[#4d5145] md:text-lg">
              ElevenLabs Music is a practical choice when an agent needs to turn a prompt into
              a usable soundtrack draft without leaving the rest of the AnyCap workflow. It
              keeps text-to-music generation in the same runtime as image generation, video
              generation, and downstream media review tasks.
            </p>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="text-lg md:text-xl text-[#1c1f17] mb-6" style={{ ...pixel }}>
                When agents should choose ElevenLabs Music
              </h2>
              <ul className="space-y-3 max-w-[760px]">
                {fitItems.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-[#4d5145] leading-6">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#6b7d3a] shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="text-lg md:text-xl text-[#1c1f17] mb-6" style={{ ...pixel }}>
                Call ElevenLabs Music through AnyCap
              </h2>
              <div className="space-y-6 max-w-[820px]">
                <div>
                  <p className="text-[11px] text-[#5a5e52] tracking-[0.5px] mb-3" style={mono}>
                    Discover the exact model entry
                  </p>
                  <div className="bg-[#1c1f17] px-5 py-4">
                    <p className="text-[13px] text-[#d4e0a4]" style={mono}>
                      anycap music models
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-[11px] text-[#5a5e52] tracking-[0.5px] mb-3" style={mono}>
                    Generate a soundtrack draft
                  </p>
                  <div className="bg-[#1c1f17] px-5 py-4">
                    <p className="text-[13px] text-[#d4e0a4]" style={mono}>
                      anycap music generate --model elevanlabs-music --prompt &quot;uplifting ambient soundtrack with soft synths and a steady pulse&quot; -o soundtrack.mp3
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
              <h2 className="text-lg md:text-xl text-[#1c1f17] mb-6" style={{ ...pixel }}>
                Catalog note
              </h2>
              <div className="max-w-[860px] border border-[#d4dbb8] p-5">
                <p className="text-[11px] text-[#6b7d3a] tracking-[0.5px] mb-2" style={mono}>
                  Current AnyCap model ID
                </p>
                <p className="text-sm text-[#4d5145] leading-6">
                  This page uses the market-facing name <strong>ElevenLabs Music</strong> because
                  that matches how teams search. In the current AnyCap catalog, the model ID is{" "}
                  <span style={mono}>elevanlabs-music</span>.
                </p>
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="text-lg md:text-xl text-[#1c1f17] mb-8" style={{ ...pixel }}>
                FAQ
              </h2>
              <div className="space-y-6 max-w-[860px]">
                {faqItems.map((item) => (
                  <div key={item.question} className="border border-[#d4dbb8] p-5">
                    <h3 className="text-[14px] font-bold text-[#1c1f17] mb-2" style={mono}>
                      {item.question}
                    </h3>
                    <p className="text-sm text-[#4d5145] leading-6">{item.answer}</p>
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
                  href="/capabilities/music-generation"
                  className="inline-block px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#f4f5f0] bg-[#6b7d3a] hover:bg-[#1c1f17] transition-colors rounded-lg"
                  style={mono}
                >
                  Music Generation
                </Link>
                <Link
                  href="/pricing"
                  className="inline-block px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] border border-[#1c1f17] hover:bg-[#1c1f17] hover:text-[#f4f5f0] transition-colors rounded-lg"
                  style={mono}
                >
                  Pricing
                </Link>
                <Link
                  href="/cli"
                  className="inline-block px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] border border-[#1c1f17] hover:bg-[#1c1f17] hover:text-[#f4f5f0] transition-colors rounded-lg"
                  style={mono}
                >
                  AnyCap CLI
                </Link>
              </div>
            </section>
          </FadeIn>
        </div>
      </article>
    </>
  );
}
