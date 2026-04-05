import type { Metadata } from "next";
import Image from "next/image";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { siteConfig } from "@/lib/site";
import { EarlyAccessBanner } from "@/components/landing/EarlyAccessBanner";
import { FadeIn } from "@/components/ui/FadeIn";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { pricingGenerationGroups } from "@/lib/capability-inventory";
import { createFaqPageJsonLd, createTechArticleJsonLd } from "@/lib/schema";

export const runtime = "edge";

const CDN_BASE = "https://cdn.anycap.ai/page_resource/models";
const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;
const lastUpdatedLabel = "April 5, 2026";
const lastUpdatedIso = "2026-04-05";

const modelGroups = [
  {
    category: "Image generation",
    items: [
      {
        name: "Seedream 5",
        href: "/models/seedream-5",
        description: "A strong default for polished first-pass image generation tasks.",
      },
      {
        name: "Nano Banana Pro",
        href: "/models/nano-banana-pro",
        description: "A better fit for revision loops and prompt-based image editing.",
      },
      {
        name: "Nano Banana 2",
        href: "/models/nano-banana-2",
        description: "A faster fit for scalable image generation and high-volume iteration loops.",
      },
    ],
  },
  {
    category: "Video generation",
    items: [
      {
        name: "Veo 3.1",
        href: "/models/veo-3-1",
        description: "The current video generation model for text-to-video workflows through AnyCap.",
      },
      {
        name: "Kling 3.0",
        href: "/models/kling-3-0",
        description: "A strong fit for realistic motion and cinematic image-to-video workflows.",
      },
      {
        name: "Seedance 1.5 Pro",
        href: "/models/seedance-1-5-pro",
        description: "A dependable default for production-friendly text-to-video and image-to-video work.",
      },
    ],
  },
  {
    category: "Music generation",
    items: [
      {
        name: "ElevenLabs Music",
        href: "/models/elevenlabs-music",
        description: "A prompt-based music model for soundtrack drafts inside the same agent runtime.",
      },
    ],
  },
];

const modelGuideLookup = {
  "Seedream 5": {
    href: "/models/seedream-5",
    bestFor: "Polished first-pass image generation from a text prompt.",
  },
  "Nano Banana Pro": {
    href: "/models/nano-banana-pro",
    bestFor: "Targeted image editing and revision loops from an existing visual.",
  },
  "Nano Banana 2": {
    href: "/models/nano-banana-2",
    bestFor: "Fast, scalable image generation and high-volume iteration.",
  },
  "Veo 3.1": {
    href: "/models/veo-3-1",
    bestFor: "Premium text-to-video output when the first pass needs to look stronger.",
  },
  "Kling 3.0": {
    href: "/models/kling-3-0",
    bestFor: "Cinematic motion and flexible image-to-video workflows.",
  },
  "Seedance 1.5 Pro": {
    href: "/models/seedance-1-5-pro",
    bestFor: "Steady production-friendly video workflows and repeatable image-to-video jobs.",
  },
  "ElevenLabs Music": {
    href: "/models/elevenlabs-music",
    bestFor: "Prompt-based soundtrack drafts inside the same agent runtime.",
  },
} as const;

const howToChooseItems = [
  "Start with the output type: image, video, or music.",
  "Then decide whether the task needs a polished first pass, faster iteration, or revision from an existing asset.",
  "Use the model guide pages when the choice depends on motion style, editing workflow, or cost tradeoffs.",
];

const faqItems = [
  {
    question: "How do I choose between Seedream 5, Nano Banana Pro, and Nano Banana 2?",
    answer:
      "Use Seedream 5 when the workflow needs a stronger first-pass image from a prompt, Nano Banana Pro when the job starts from an existing image and needs revisions, and Nano Banana 2 when speed, throughput, or repeated iteration matters more.",
  },
  {
    question: "How do I choose between Veo 3.1, Kling 3.0, and Seedance 1.5 Pro?",
    answer:
      "Use Veo 3.1 when the first video pass needs to look more premium from a text brief, Kling 3.0 when the workflow leans more on cinematic motion or flexible image-to-video work, and Seedance 1.5 Pro when the team wants a steadier production-oriented default.",
  },
  {
    question: "Do all AnyCap models use the same CLI and auth flow?",
    answer:
      "Yes. AnyCap exposes these models through the same capability runtime, CLI, and auth flow, so teams do not need a separate provider integration path for each model page listed here.",
  },
];

const modelHubJsonLd = createTechArticleJsonLd({
  headline: "Models — Multimodal models available through AnyCap",
  description:
    "Comparison hub for the multimodal models available through AnyCap, including image, video, and music models, with workflow guidance and current credit ranges.",
  path: "/models",
  about: ["AnyCap models", "Image generation", "Video generation", "Music generation"],
  keywords: [
    "anycap models",
    "image generation models",
    "video generation models",
    "music generation models",
    "seedream 5 vs nano banana 2",
    "veo 3.1 vs kling 3.0",
  ],
  dateModified: lastUpdatedIso,
});

const faqJsonLd = createFaqPageJsonLd(faqItems);

export const metadata: Metadata = {
  title: "Models — Multimodal models available through AnyCap",
  description:
    "Explore the multimodal models available through AnyCap, including Seedream 5, Nano Banana Pro, Nano Banana 2, Veo 3.1, Kling 3.0, Seedance 1.5 Pro, and ElevenLabs Music.",
  alternates: { canonical: "/models" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/models",
    siteName: siteConfig.siteName,
    title: "Models — Multimodal models available through AnyCap",
    description:
      "Explore the multimodal models available through AnyCap and learn which model fits each agent workflow.",
  },
};

export default function ModelsPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Home", href: "/" }, { name: "Models" }]} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(modelHubJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <article className="px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-[1280px] py-12 md:py-20 lg:py-24">
          <FadeIn>
            <p className="text-[11px] text-[#6b7d3a] tracking-[0.8px] mb-4" style={mono}>
              Models
            </p>
            <p className="text-[11px] text-[#5a5e52] tracking-[0.5px] mb-3" style={mono}>
              Last updated {lastUpdatedLabel}
            </p>
            <h1
              className="leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(32px, 6vw, 72px)" }}
            >
              Choose the right
              <br />
              model for the agent job.
            </h1>
            <p className="mt-6 max-w-[760px] text-base leading-7 text-[#4d5145] md:text-lg">
              AnyCap exposes multimodal models through one capability runtime and one CLI.
              This page helps teams choose the right model for a given agent workflow instead of
              treating every image or video request the same way.
            </p>
            <div className="mt-8 max-w-[860px] border border-[#d4dbb8] bg-[#f9faf5]/80 p-6">
              <p className="text-[11px] text-[#6b7d3a] tracking-[0.5px] mb-3" style={mono}>
                Answer-first summary
              </p>
              <p className="text-sm leading-6 text-[#4d5145]">
                The current public AnyCap model catalog includes image generation models
                for first-pass output and revision loops, video generation models for
                premium or production-friendly motion work, and a prompt-based music
                model for soundtrack drafts. The right choice usually depends on whether
                the job starts from a blank prompt or an existing asset, how much polish
                the first pass needs, and how much speed or cost efficiency matters in
                the workflow.
              </p>
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
              <h2 className="text-lg md:text-xl text-[#1c1f17] mb-6" style={{ ...pixel }}>
                How to choose the right model
              </h2>
              <ul className="space-y-3 max-w-[760px]">
                {howToChooseItems.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-[#4d5145] leading-6">
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

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="text-lg md:text-xl text-[#1c1f17] mb-6" style={{ ...pixel }}>
                Visual guide
              </h2>
              <div className="overflow-hidden rounded-2xl border border-[#d4dbb8] bg-[#f9faf5]/80">
                <Image
                  src={`${CDN_BASE}/model-selection-visual.png`}
                  alt="Illustrated overview of image, video, and music model categories inside the AnyCap model hub."
                  width={2752}
                  height={1536}
                  unoptimized
                  className="h-auto w-full"
                />
              </div>
              <p className="mt-4 max-w-[760px] text-sm leading-6 text-[#4d5145]">
                This illustration is a quick visual map of the current catalog: image models on
                one side, video models on another, and music generation as a separate capability
                lane inside the same agent runtime. It was generated with Nano Banana 2 to keep
                the page&apos;s visual language aligned with the model catalog itself.
              </p>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="text-lg md:text-xl text-[#1c1f17] mb-3" style={{ ...pixel }}>
                Current model comparison
              </h2>
              <p className="mb-10 max-w-[760px] text-sm leading-6 text-[#4d5145]">
                These are the current public models exposed through AnyCap. Credit ranges
                come from the same pricing inventory used on the pricing page, so the hub
                and pricing page stay aligned.
              </p>

              <div className="space-y-12">
                {pricingGenerationGroups.map((group) => (
                  <div key={group.title}>
                    <h3 className="mb-2 text-base text-[#1c1f17]" style={pixel}>
                      {group.title}
                    </h3>
                    <p className="mb-5 text-sm leading-6 text-[#4d5145]">{group.description}</p>
                    <div className="overflow-x-auto rounded-xl border border-[#d4dbb8] bg-[#f9faf5]/80">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-[#d4dbb8]">
                            {["Model", "Modes", group.headers[2], "Best for"].map((header) => (
                              <th
                                key={header}
                                className="bg-[#f4f5f0] px-5 py-4 text-[11px] tracking-[0.5px] text-[#5a5e52]"
                                style={mono}
                              >
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {group.models.map((model) => {
                            const guide = modelGuideLookup[model.model as keyof typeof modelGuideLookup];

                            return (
                              <tr
                                key={model.model}
                                className="border-b border-[#d4dbb8]/60 last:border-b-0 bg-[#fffffc]/70"
                              >
                                <td className="px-5 py-4 text-sm font-medium text-[#1c1f17]">
                                  <Link
                                    href={guide.href}
                                    className="transition-colors hover:text-[#6b7d3a]"
                                  >
                                    {model.model}
                                  </Link>
                                </td>
                                <td className="px-5 py-4 text-sm text-[#4d5145]" style={mono}>
                                  {model.modes.join(", ")}
                                </td>
                                <td className="px-5 py-4 text-sm text-[#1c1f17]" style={mono}>
                                  {model.credits}
                                </td>
                                <td className="px-5 py-4 text-sm leading-6 text-[#4d5145]">
                                  {guide.bestFor}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </FadeIn>

          {modelGroups.map((group) => (
            <FadeIn key={group.category}>
              <section className="mt-16 md:mt-24">
                <h2 className="text-lg md:text-xl text-[#1c1f17] mb-8" style={{ ...pixel }}>
                  {group.category}
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 max-w-[1040px]">
                  {group.items.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="border border-[#d4dbb8] p-5 hover:border-[#6b7d3a] transition-colors"
                    >
                      <h3 className="text-[15px] font-bold text-[#1c1f17] mb-2" style={mono}>
                        {item.name}
                      </h3>
                      <p className="text-sm text-[#4d5145] leading-6">{item.description}</p>
                    </Link>
                  ))}
                </div>
              </section>
            </FadeIn>
          ))}

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
                  href="/capabilities"
                  className="inline-block px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#f4f5f0] bg-[#6b7d3a] hover:bg-[#1c1f17] transition-colors rounded-lg"
                  style={mono}
                >
                  Any Capability
                </Link>
                <Link
                  href="/guides/context-engineering-for-agents"
                  className="inline-block px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] border border-[#1c1f17] hover:bg-[#1c1f17] hover:text-[#f4f5f0] transition-colors rounded-lg"
                  style={mono}
                >
                  Context Guide
                </Link>
              </div>
            </section>
          </FadeIn>
        </div>
      </article>
    </>
  );
}
