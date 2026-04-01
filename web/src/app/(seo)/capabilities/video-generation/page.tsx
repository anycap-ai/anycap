import type { Metadata } from "next";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { siteConfig } from "@/lib/site";
import { FadeIn } from "@/components/ui/FadeIn";
import { EarlyAccessBanner } from "@/components/landing/EarlyAccessBanner";
import { VideoGenDemo } from "@/components/landing/VideoGenDemo";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { createTechArticleJsonLd } from "@/lib/schema";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

export const metadata: Metadata = {
  title: "Video Generation API for AI agents - Text-to-video and image-to-video",
  description:
    "Give AI agents video generation through AnyCap. Use Veo 3.1, Kling 3.0, and Seedance 1.5 Pro for text-to-video, image-to-video, and video creation workflows through one CLI.",
  alternates: { canonical: "/capabilities/video-generation" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/capabilities/video-generation",
    siteName: siteConfig.siteName,
    title: "Video Generation API for AI agents - Text-to-video and image-to-video",
    description:
      "Give AI agents video generation through AnyCap. Use Veo 3.1, Kling 3.0, and Seedance 1.5 Pro for text-to-video, image-to-video, and video creation workflows through one CLI.",
  },
};

const models = [
  {
    name: "Veo 3.1",
    modes: "text-to-video, image-to-video",
    bestFor: "High-end cinematic output and premium video generation workflows",
  },
  {
    name: "Kling 3.0",
    modes: "text-to-video, image-to-video",
    bestFor: "Realistic motion and cinematic scene generation",
  },
  {
    name: "Seedance 1.5 Pro",
    modes: "text-to-video, image-to-video",
    bestFor: "Reliable image-to-video output and production-friendly motion quality",
  },
] as const;

const usageExamples = [
  {
    title: "Text-to-video",
    code:
      'anycap video generate --prompt "a drone shot flying over a mountain range at sunset" --model veo-3.1 -o hero.mp4',
  },
  {
    title: "Image-to-video",
    code:
      'anycap video generate --prompt "animate this still into a subtle camera move" --model seedance-1.5-pro --mode image-to-video --param reference_image_urls=\'["https://example.com/frame.jpg"]\' -o animated.mp4',
  },
  {
    title: "Discover models",
    code: "anycap video models",
  },
] as const;

const faqItems = [
  {
    question: "What does AnyCap video generation let agents do?",
    answer:
      "It gives agents one command surface for text-to-video and image-to-video workflows. Teams can generate new clips, animate reference images, and run repeatable video creation tasks without separate provider-specific integrations.",
  },
  {
    question: "Which video models are available through AnyCap today?",
    answer:
      "The current public video generation surface includes Veo 3.1, Kling 3.0, and Seedance 1.5 Pro. Each model is available through the same AnyCap video generation API, CLI, and auth flow.",
  },
  {
    question: "Why does this page include image-to-video as well as text-to-video?",
    answer:
      "Agent workflows often start from a screenshot, design frame, or product still rather than a prompt alone. AnyCap treats both text-to-video and image-to-video as one video generation capability so the workflow stays consistent.",
  },
  {
    question: "Is this page about a video generation API or a CLI workflow?",
    answer:
      "It is both. Teams often search for a text-to-video API or video generation API, while agent execution usually happens through the AnyCap CLI.",
  },
] as const;

const capabilityGuideJsonLd = createTechArticleJsonLd({
  headline: "Video Generation API for AI agents - Text-to-video and image-to-video",
  description:
    "Capability guide for using AnyCap video generation across AI agent workflows with Veo 3.1, Kling 3.0, and Seedance 1.5 Pro.",
  path: "/capabilities/video-generation",
  about: ["Video generation", "Text-to-video API", "Image-to-video", "AnyCap"],
  keywords: [
    "video generation for ai agents",
    "text to video api",
    "video creation api",
    "image to video",
    "veo 3.1",
  ],
});

export default function VideoGenerationPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Capabilities", href: "/capabilities" },
          { name: "Video Generation" },
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
              Video Generation
            </h1>
            <p className="mt-6 max-w-[760px] text-base leading-7 text-[#4d5145] md:text-lg">
              AnyCap video generation gives agents one CLI for text-to-video and image-to-video
              workflows. Agents can generate short cinematic clips from prompts, animate still
              images into motion, and run video creation tasks through one interface instead of
              stitching together separate video generation APIs. The result is a cleaner video
              generation layer for Claude Code, Cursor, Codex, and similar agent products.
            </p>
          </FadeIn>
          <FadeIn className="mt-8">
            <EarlyAccessBanner />
          </FadeIn>

          <FadeIn className="mt-10">
            <VideoGenDemo />
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
                          {model.name}
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
                When agents need video generation
              </h2>
              <div className="grid max-w-[920px] gap-4 sm:grid-cols-2">
                <div className="border-l-[3px] border-[#6b7d3a] pl-5">
                  <p className="mb-1 text-sm font-medium text-[#1c1f17]">Demo videos</p>
                  <p className="text-sm leading-6 text-[#4d5145]">
                    Generate launch clips, walkthroughs, and product demos through one command.
                  </p>
                </div>
                <div className="border-l-[3px] border-[#6b7d3a] pl-5">
                  <p className="mb-1 text-sm font-medium text-[#1c1f17]">Storyboards to motion</p>
                  <p className="text-sm leading-6 text-[#4d5145]">
                    Turn design stills, screenshots, or reference frames into animated video drafts.
                  </p>
                </div>
                <div className="border-l-[3px] border-[#6b7d3a] pl-5">
                  <p className="mb-1 text-sm font-medium text-[#1c1f17]">Social content</p>
                  <p className="text-sm leading-6 text-[#4d5145]">
                    Produce short-form clips for campaigns, changelog announcements, and creator
                    workflows.
                  </p>
                </div>
                <div className="border-l-[3px] border-[#6b7d3a] pl-5">
                  <p className="mb-1 text-sm font-medium text-[#1c1f17]">Rapid prototyping</p>
                  <p className="text-sm leading-6 text-[#4d5145]">
                    Explore visual concepts in motion before committing to a larger production pass.
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
                  href="/models/veo-3-1"
                  className="rounded-xl border border-[#d4dbb8] p-5 transition-colors hover:border-[#6b7d3a]"
                >
                  <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                    Model
                  </p>
                  <h3 className="mb-2 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                    Veo 3.1
                  </h3>
                  <p className="text-sm leading-6 text-[#4d5145]">
                    See when Veo 3.1 is the right choice for premium agent-led video generation.
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
                    See how video generation fits into the broader Claude Code capability story.
                  </p>
                </Link>
                <Link
                  href="/capabilities/image-generation"
                  className="rounded-xl border border-[#d4dbb8] p-5 transition-colors hover:border-[#6b7d3a]"
                >
                  <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                    Related capability
                  </p>
                  <h3 className="mb-2 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                    Image Generation
                  </h3>
                  <p className="text-sm leading-6 text-[#4d5145]">
                    Pair image generation with video workflows when the agent starts from stills or
                    concept frames.
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
