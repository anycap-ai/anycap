import type { Metadata } from "next";
import { LocalizedLink as Link } from "@/components/LocalizedLink";
import { siteConfig } from "@/lib/site";
import { FadeIn } from "@/components/FadeIn";
import { EarlyAccessBanner } from "@/components/EarlyAccessBanner";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { createTechArticleJsonLd } from "@/lib/schema";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

export const metadata: Metadata = {
  title: "Image Generation — Generate images through AI agents",
  description:
    "Give AI agents image generation capabilities through AnyCap. Support for Seedream 5, Seedream 4.5, Nano Banana Pro, and Nano Banana 2 with text-to-image and image-to-image operations.",
  alternates: { canonical: "/capabilities/image-generation" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/capabilities/image-generation",
    siteName: siteConfig.siteName,
    title: "Image Generation — Generate images through AI agents",
    description:
      "Give AI agents image generation capabilities through AnyCap. Support for Seedream 5, Seedream 4.5, Nano Banana Pro, and Nano Banana 2 with text-to-image and image-to-image operations.",
  },
};

const models = [
  {
    name: "Seedream 5",
    status: "Early Access",
  },
  {
    name: "Seedream 4.5",
    status: "Early Access",
  },
  {
    name: "Nano Banana Pro",
    status: "Early Access",
  },
  {
    name: "Nano Banana 2",
    status: "Early Access",
  },
];

const faqItems = [
  {
    question: "What does AnyCap image generation let agents do?",
    answer:
      "It lets agents generate new images from text prompts and edit existing images through one CLI and one capability runtime.",
  },
  {
    question: "Which image models are available through AnyCap?",
    answer:
      "The current image generation page covers Seedream 5, Seedream 4.5, Nano Banana Pro, and Nano Banana 2.",
  },
  {
    question: "When should an agent choose Nano Banana Pro instead of Seedream 5?",
    answer:
      "Choose Nano Banana Pro when the workflow starts from an existing image and the agent needs editing or revision loops. Choose Seedream 5 when the agent needs a polished first-pass generation from text.",
  },
];

const capabilityGuideJsonLd = createTechArticleJsonLd({
  headline: "Image Generation — Generate images through AI agents",
  description:
    "Capability guide for using AnyCap image generation across AI agent workflows with models like Seedream 5 and Nano Banana Pro.",
  path: "/capabilities/image-generation",
  about: ["Image generation", "AnyCap", "Seedream 5", "Nano Banana Pro"],
  keywords: ["image generation for ai agents", "anycap", "seedream 5", "nano banana pro"],
});

export default function ImageGenerationPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: "Home", href: "/" },
        { name: "Capabilities", href: "/capabilities" },
        { name: "Image Generation" },
      ]} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(capabilityGuideJsonLd) }}
      />
      <article className="px-6 md:px-12 lg:px-20">
      <div className="mx-auto max-w-[1280px] py-12 md:py-20 lg:py-24">
        {/* Hero */}
        <FadeIn>
          <p
            className="text-[11px] text-[#6b7d3a] tracking-[0.8px] mb-4"
            style={mono}
          >
            Capability
          </p>
          <h1
            className="leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
            style={{ ...pixel, fontSize: "clamp(32px, 6vw, 72px)" }}
          >
            Image Generation
          </h1>
          <p className="mt-6 max-w-[700px] text-base leading-7 text-[#4d5145] md:text-lg">
            AnyCap image generation lets AI agents create and edit images through one CLI
            interface. Agents can generate images from text prompts using models like Seedream 5
            and Nano Banana Pro, or edit existing images with image-to-image operations. The
            capability works across agent products like Claude Code, Cursor, and Codex without
            requiring separate API integrations for each model or provider. One command, multiple
            models, consistent output.
          </p>
        </FadeIn>
        <FadeIn className="mt-8">
          <EarlyAccessBanner />
        </FadeIn>

        <div className="mt-16 md:mt-24">
          <hr className="border-t border-[#d4dbb8]" />
        </div>

        {/* Supported Models */}
        <FadeIn>
          <section className="mt-16 md:mt-24">
            <h2
              className="text-lg md:text-xl text-[#1c1f17] mb-8"
              style={{ ...pixel }}
            >
              Supported Models
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[#d4dbb8]">
                    <th className="pb-3 pr-6 text-[11px] text-[#5a5e52] tracking-[0.5px]" style={mono}>Model</th>
                    <th className="pb-3 text-[11px] text-[#5a5e52] tracking-[0.5px]" style={mono}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {models.map((model) => (
                    <tr key={model.name} className="border-b border-[#d4dbb8]/50">
                      <td className="py-4 pr-6 text-sm font-medium text-[#1c1f17]">{model.name}</td>
                      <td className="py-4">
                        <span className="inline-flex items-center gap-1.5 text-[11px] text-[#6b7d3a] tracking-[1px]" style={mono}>
                          <span className="w-1.5 h-1.5 rounded-full bg-[#6b7d3a]" />
                          {model.status}
                        </span>
                      </td>
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

        {/* Usage */}
        <FadeIn>
          <section className="mt-16 md:mt-24">
            <h2
              className="text-lg md:text-xl text-[#1c1f17] mb-6"
              style={{ ...pixel }}
            >
              CLI Usage
            </h2>

            <div className="space-y-6 max-w-[800px]">
              <div>
                <p className="text-[11px] text-[#5a5e52] tracking-[0.5px] mb-3" style={mono}>
                  Text to Image
                </p>
                <div className="bg-[#1c1f17] px-5 py-4">
                  <p className="text-[13px] text-[#d4e0a4]" style={mono}>
                    anycap image generate --model seedream_5 --prompt &quot;a minimalist logo on white background&quot;
                  </p>
                </div>
              </div>

              <div>
                <p className="text-[11px] text-[#5a5e52] tracking-[0.5px] mb-3" style={mono}>
                  Image to Image (edit)
                </p>
                <div className="bg-[#1c1f17] px-5 py-4">
                  <p className="text-[13px] text-[#d4e0a4]" style={mono}>
                    anycap image generate --model nano_banana_pro --prompt &quot;add warm lighting&quot; --image ./input.png
                  </p>
                </div>
              </div>

              <div>
                <p className="text-[11px] text-[#5a5e52] tracking-[0.5px] mb-3" style={mono}>
                  List available models
                </p>
                <div className="bg-[#1c1f17] px-5 py-4">
                  <p className="text-[13px] text-[#d4e0a4]" style={mono}>
                    anycap image models
                  </p>
                </div>
              </div>
            </div>
          </section>
        </FadeIn>

        <div className="mt-16 md:mt-24">
          <hr className="border-t border-[#d4dbb8]" />
        </div>

        {/* Use Cases */}
        <FadeIn>
          <section className="mt-16 md:mt-24">
            <h2
              className="text-lg md:text-xl text-[#1c1f17] mb-6"
              style={{ ...pixel }}
            >
              When Agents Need Image Generation
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 max-w-[900px]">
              <div className="border-l-[3px] border-[#6b7d3a] pl-5">
                <p className="text-sm font-medium text-[#1c1f17] mb-1">Product mockups</p>
                <p className="text-sm text-[#4d5145] leading-6">
                  Generate visual assets during development workflows without leaving the agent environment.
                </p>
              </div>
              <div className="border-l-[3px] border-[#6b7d3a] pl-5">
                <p className="text-sm font-medium text-[#1c1f17] mb-1">Content creation</p>
                <p className="text-sm text-[#4d5145] leading-6">
                  Create illustrations, thumbnails, and visual content as part of automated pipelines.
                </p>
              </div>
              <div className="border-l-[3px] border-[#6b7d3a] pl-5">
                <p className="text-sm font-medium text-[#1c1f17] mb-1">Image editing</p>
                <p className="text-sm text-[#4d5145] leading-6">
                  Modify existing images with text prompts — adjust lighting, style transfer, background changes.
                </p>
              </div>
              <div className="border-l-[3px] border-[#6b7d3a] pl-5">
                <p className="text-sm font-medium text-[#1c1f17] mb-1">Prototyping</p>
                <p className="text-sm text-[#4d5145] leading-6">
                  Rapidly iterate on visual concepts within agent-driven design workflows.
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
            <h2
              className="text-lg md:text-xl text-[#1c1f17] mb-8"
              style={{ ...pixel }}
            >
              Related Models and Guides
            </h2>
            <div className="grid gap-4 sm:grid-cols-3 max-w-[1100px]">
              <Link
                href="/models/seedream-5"
                className="border border-[#d4dbb8] p-5 hover:border-[#6b7d3a] transition-colors"
              >
                <p className="text-[11px] text-[#6b7d3a] tracking-[0.5px] mb-2" style={mono}>
                  Model
                </p>
                <h3 className="text-[15px] font-bold text-[#1c1f17] mb-2" style={mono}>
                  Seedream 5
                </h3>
                <p className="text-sm text-[#4d5145] leading-6">
                  Learn when agents should choose Seedream 5 for polished image generation workflows.
                </p>
              </Link>
              <Link
                href="/models/nano-banana-pro"
                className="border border-[#d4dbb8] p-5 hover:border-[#6b7d3a] transition-colors"
              >
                <p className="text-[11px] text-[#6b7d3a] tracking-[0.5px] mb-2" style={mono}>
                  Model
                </p>
                <h3 className="text-[15px] font-bold text-[#1c1f17] mb-2" style={mono}>
                  Nano Banana Pro
                </h3>
                <p className="text-sm text-[#4d5145] leading-6">
                  Explore a stronger fit for agent-driven image editing and iteration loops.
                </p>
              </Link>
              <Link
                href="/guides/context-engineering-for-agents"
                className="border border-[#d4dbb8] p-5 hover:border-[#6b7d3a] transition-colors"
              >
                <p className="text-[11px] text-[#6b7d3a] tracking-[0.5px] mb-2" style={mono}>
                  Guide
                </p>
                <h3 className="text-[15px] font-bold text-[#1c1f17] mb-2" style={mono}>
                  Context Engineering for Agents
                </h3>
                <p className="text-sm text-[#4d5145] leading-6">
                  Understand how agents decide when image generation belongs in the workflow.
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
            <h2
              className="text-lg md:text-xl text-[#1c1f17] mb-8"
              style={{ ...pixel }}
            >
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

        {/* CTA */}
        <FadeIn>
          <section className="mt-16 md:mt-24 mb-8">
            <div className="flex flex-wrap gap-4">
              <a
                href="https://github.com/anycap-ai/anycap"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#f4f5f0] bg-[#6b7d3a] hover:bg-[#1c1f17] transition-colors rounded-lg"
                style={mono}
              >
                Request Early Access
              </a>
              <Link
                href="/capabilities"
                className="inline-block px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] border border-[#1c1f17] hover:bg-[#1c1f17] hover:text-[#f4f5f0] transition-colors rounded-lg"
                style={mono}
              >
                All Capabilities
              </Link>
              <Link
                href="/for/claude-code"
                className="inline-block px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] border border-[#1c1f17] hover:bg-[#1c1f17] hover:text-[#f4f5f0] transition-colors rounded-lg"
                style={mono}
              >
                For Claude Code
              </Link>
            </div>
          </section>
        </FadeIn>
      </div>
    </article>
    </>
  );
}
