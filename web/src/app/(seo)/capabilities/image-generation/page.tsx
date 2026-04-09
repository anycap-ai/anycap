import type { Metadata } from "next";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { siteConfig } from "@/lib/site";
import { FadeIn } from "@/components/ui/FadeIn";
import { EarlyAccessBanner } from "@/components/landing/EarlyAccessBanner";
import { ImageGenDemo } from "@/components/landing/ImageGenDemo";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { createFaqPageJsonLd, createTechArticleJsonLd } from "@/lib/schema";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;
const lastUpdatedLabel = "April 5, 2026";
const lastUpdatedIso = "2026-04-05";

export const metadata: Metadata = {
  title: "Image Generation API for AI agents - Text-to-image and image editing",
  description:
    "Give AI agents image generation through AnyCap. Use Seedream 5, Nano Banana Pro, and Nano Banana 2 for text-to-image, image-to-image, and image editing workflows through one CLI.",
  alternates: { canonical: "/capabilities/image-generation" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/capabilities/image-generation",
    siteName: siteConfig.siteName,
    title: "Image Generation API for AI agents - Text-to-image and image editing",
    description:
      "Give AI agents image generation through AnyCap. Use Seedream 5, Nano Banana Pro, and Nano Banana 2 for text-to-image, image-to-image, and image editing workflows through one CLI.",
  },
};

const models = [
  {
    name: "Seedream 5",
    href: "/models/seedream-5",
    modes: "text-to-image, image-to-image",
    bestFor: "Polished first-pass image generation and visual refinement",
  },
  {
    name: "Nano Banana Pro",
    href: "/models/nano-banana-pro",
    modes: "text-to-image, image-to-image",
    bestFor: "Higher-quality editing loops and stronger commercial output",
  },
  {
    name: "Nano Banana 2",
    href: "/models/nano-banana-2",
    modes: "text-to-image, image-to-image",
    bestFor: "Fast iteration and scalable image generation workflows",
  },
] as const;

const decisionCards = [
  {
    eyebrow: "First-pass quality",
    title: "Seedream 5",
    href: "/models/seedream-5",
    body: "Best when the workflow starts from a prompt and the first image needs to look closer to final.",
  },
  {
    eyebrow: "Revision loops",
    title: "Nano Banana Pro",
    href: "/models/nano-banana-pro",
    body: "Best when the agent already has an image and needs prompt-based edits or more controlled visual revisions.",
  },
  {
    eyebrow: "Speed and scale",
    title: "Nano Banana 2",
    href: "/models/nano-banana-2",
    body: "Best when the agent needs many variants, quicker drafts, or a more scalable generation loop.",
  },
] as const;

const usageExamples = [
  {
    title: "Text-to-image",
    code:
      'anycap image generate --prompt "a minimalist product hero image on a cream background" --model seedream-5 -o hero.png',
  },
  {
    title: "Image-to-image editing",
    code:
      'anycap image generate --prompt "turn this into a warm editorial product shot" --model nano-banana-pro --mode image-to-image --param reference_image_urls=\'["https://example.com/source.png"]\' -o variation.png',
  },
  {
    title: "Discover models",
    code: "anycap image models",
  },
] as const;

const faqItems = [
  {
    question: "What does AnyCap image generation let agents do?",
    answer:
      "It gives agents one command surface for text-to-image and image-to-image workflows. That means the same CLI can handle first-pass generation, creative iteration, and image editing without separate provider integrations.",
  },
  {
    question: "Which image models are available through AnyCap today?",
    answer:
      "The current public image generation surface includes Seedream 5, Nano Banana Pro, and Nano Banana 2. Each model supports text-to-image and image-to-image modes through the same AnyCap image generation API and CLI interface.",
  },
  {
    question: "Why does this page mention image editing as well as image generation?",
    answer:
      "Market language often splits text-to-image, image editing, and image generation. AnyCap groups those workflows under one image generation capability because agents frequently need both creation and revision in the same loop.",
  },
  {
    question: "Is this page about an image generation API or a CLI?",
    answer:
      "Both. Teams often search for an image generation API, a text-to-image API, or an image editing API, while implementation inside agent workflows often happens through the AnyCap CLI.",
  },
] as const;

const capabilityGuideJsonLd = createTechArticleJsonLd({
  headline: "Image Generation API for AI agents - Text-to-image and image editing",
  description:
    "Capability guide for using AnyCap image generation across AI agent workflows with Seedream 5, Nano Banana Pro, and Nano Banana 2.",
  path: "/capabilities/image-generation",
  about: ["Image generation", "Text-to-image API", "Image editing API", "AnyCap"],
  keywords: [
    "image generation for ai agents",
    "text to image api",
    "image editing api",
    "seedream 5",
    "nano banana pro",
  ],
  dateModified: lastUpdatedIso,
});

const faqJsonLd = createFaqPageJsonLd(faqItems);

export default function ImageGenerationPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Capabilities", href: "/capabilities" },
          { name: "Image Generation" },
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
              Image Generation
            </h1>
            <p className="mt-6 max-w-[760px] text-base leading-7 text-[#4d5145] md:text-lg">
              AnyCap image generation gives agents one CLI for text-to-image and image-to-image
              workflows. Agents can create net-new visuals, revise existing assets, and run image
              editing loops through a consistent interface instead of wiring a separate image
              generation API for every model or provider. That makes it a practical image
              generation layer for Claude Code, Cursor, Codex, and similar agent products.
            </p>
            <div className="mt-8 max-w-[860px] border border-[#d4dbb8] bg-[#f9faf5]/80 p-6">
              <p className="mb-3 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                Answer-first summary
              </p>
              <p className="text-sm leading-6 text-[#4d5145]">
                Use Seedream 5 when the agent needs a stronger first-pass image, Nano Banana Pro
                when the workflow starts from an existing asset and needs targeted revisions, and
                Nano Banana 2 when speed and throughput matter more than maximizing polish on the
                first result.
              </p>
            </div>
          </FadeIn>
          <FadeIn className="mt-8">
            <EarlyAccessBanner />
          </FadeIn>

          <FadeIn className="mt-10">
            <ImageGenDemo />
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-8 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                How to choose among image models
              </h2>
              <div className="grid max-w-[1040px] gap-4 sm:grid-cols-3">
                {decisionCards.map((card) => (
                  <Link
                    key={card.title}
                    href={card.href}
                    aria-label={`Read the ${card.title} model guide`}
                    className="group flex h-full flex-col rounded-xl border border-[#d4dbb8] p-5 transition-all hover:-translate-y-0.5 hover:border-[#6b7d3a] hover:shadow-[0_10px_24px_rgba(28,31,23,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6b7d3a] focus-visible:ring-offset-2"
                  >
                    <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                      {card.eyebrow}
                    </p>
                    <h3
                      className="mb-2 text-[15px] font-bold text-[#1c1f17] transition-colors group-hover:text-[#6b7d3a]"
                      style={mono}
                    >
                      {card.title}
                    </h3>
                    <p className="text-sm leading-6 text-[#4d5145]">{card.body}</p>
                    <span
                      className="mt-4 text-[11px] tracking-[0.5px] text-[#5a5e52] transition-colors group-hover:text-[#6b7d3a]"
                      style={mono}
                    >
                      Open model guide &rarr;
                    </span>
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
                Supported models
              </h2>
              <div className="overflow-x-auto rounded-xl border border-[#d4dbb8]">
                <table className="w-full text-left">
                  <thead className="bg-[#f9faf5]">
                    <tr className="border-b border-[#d4dbb8]">
                      <th
                        className="px-5 py-3 pr-6 text-[11px] tracking-[0.5px] text-[#5a5e52]"
                        style={mono}
                      >
                        Model
                      </th>
                      <th
                        className="px-5 py-3 pr-6 text-[11px] tracking-[0.5px] text-[#5a5e52]"
                        style={mono}
                      >
                        Modes
                      </th>
                      <th
                        className="px-5 py-3 text-[11px] tracking-[0.5px] text-[#5a5e52]"
                        style={mono}
                      >
                        Best fit
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {models.map((model) => (
                      <tr key={model.name} className="border-b border-[#d4dbb8]/50 last:border-b-0">
                        <td className="px-5 py-4 pr-6 text-sm font-medium text-[#1c1f17]">
                          <Link href={model.href} className="hover:text-[#6b7d3a] transition-colors">
                            {model.name}
                          </Link>
                        </td>
                        <td className="px-5 py-4 pr-6 text-sm text-[#4d5145]">{model.modes}</td>
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
                When agents need image generation
              </h2>
              <div className="grid max-w-[920px] gap-4 sm:grid-cols-2">
                <div className="border-l-[3px] border-[#6b7d3a] pl-5">
                  <p className="mb-1 text-sm font-medium text-[#1c1f17]">Product mockups</p>
                  <p className="text-sm leading-6 text-[#4d5145]">
                    Generate polished visuals for launch pages, changelogs, and internal demos.
                  </p>
                </div>
                <div className="border-l-[3px] border-[#6b7d3a] pl-5">
                  <p className="mb-1 text-sm font-medium text-[#1c1f17]">Creative iteration</p>
                  <p className="text-sm leading-6 text-[#4d5145]">
                    Run text-to-image and image editing loops without leaving the agent workflow.
                  </p>
                </div>
                <div className="border-l-[3px] border-[#6b7d3a] pl-5">
                  <p className="mb-1 text-sm font-medium text-[#1c1f17]">Content pipelines</p>
                  <p className="text-sm leading-6 text-[#4d5145]">
                    Create illustrations, thumbnails, and marketing assets through one repeatable
                    command surface.
                  </p>
                </div>
                <div className="border-l-[3px] border-[#6b7d3a] pl-5">
                  <p className="mb-1 text-sm font-medium text-[#1c1f17]">Design support</p>
                  <p className="text-sm leading-6 text-[#4d5145]">
                    Turn briefs, screenshots, and references into first-pass visual directions for
                    teams building with agents.
                  </p>
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
                Related models and guides
              </h2>
              <div className="grid max-w-[1100px] gap-4 sm:grid-cols-3">
                <Link
                  href="/models/seedream-5"
                  className="rounded-xl border border-[#d4dbb8] p-5 transition-colors hover:border-[#6b7d3a]"
                >
                  <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                    Model
                  </p>
                  <h3 className="mb-2 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                    Seedream 5
                  </h3>
                  <p className="text-sm leading-6 text-[#4d5145]">
                    Learn when agents should choose Seedream 5 for polished text-to-image output.
                  </p>
                </Link>
                <Link
                  href="/models/nano-banana-pro"
                  className="rounded-xl border border-[#d4dbb8] p-5 transition-colors hover:border-[#6b7d3a]"
                >
                  <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                    Model
                  </p>
                  <h3 className="mb-2 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                    Nano Banana Pro
                  </h3>
                  <p className="text-sm leading-6 text-[#4d5145]">
                    Explore a stronger fit for image editing and iterative visual refinement.
                  </p>
                </Link>
                <Link
                  href="/for/claude-code"
                  className="rounded-xl border border-[#d4dbb8] p-5 transition-colors hover:border-[#6b7d3a]"
                >
                  <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                    Agent page
                  </p>
                  <h3 className="mb-2 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                    For Claude Code
                  </h3>
                  <p className="text-sm leading-6 text-[#4d5145]">
                    See how image generation fits into the broader Claude Code capability story.
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
                <a
                  href="https://github.com/anycap-ai/anycap"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block rounded-lg bg-[#6b7d3a] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#f4f5f0] transition-colors hover:bg-[#1c1f17]"
                  style={mono}
                >
                  View on GitHub
                </a>
                <Link
                  href="/capabilities"
                  className="inline-block rounded-lg border border-[#1c1f17] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] transition-colors hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
                  style={mono}
                >
                  Any Capability
                </Link>
                <Link
                  href="/cli"
                  className="inline-block rounded-lg border border-[#1c1f17] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] transition-colors hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
                  style={mono}
                >
                  Explore the CLI
                </Link>
              </div>
            </section>
          </FadeIn>
        </div>
      </article>
    </>
  );
}
