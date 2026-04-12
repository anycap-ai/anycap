import type { Metadata } from "next";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { EarlyAccessBanner } from "@/components/landing/EarlyAccessBanner";
import { FadeIn } from "@/components/ui/FadeIn";
import { createFaqPageJsonLd, createTechArticleJsonLd } from "@/lib/schema";
import { siteConfig } from "@/lib/site";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

export const metadata: Metadata = {
  title: "Claude Code image generation — Add image generation to Claude Code",
  description:
    "Claude Code does not ship with image generation. AnyCap adds image generation through one skill, one CLI, and models like Seedream 5 and Nano Banana Pro.",
  alternates: { canonical: "/for/claude-code/image-generation" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/for/claude-code/image-generation",
    siteName: siteConfig.siteName,
    title: "Claude Code image generation — Add image generation to Claude Code",
    description:
      "Add image generation to Claude Code without switching agents or wiring separate image APIs.",
  },
};

const articleJsonLd = createTechArticleJsonLd({
  headline: "Claude Code image generation — Add image generation to Claude Code",
  description:
    "Targeted landing page for adding image generation to Claude Code through AnyCap and models like Seedream 5 and Nano Banana Pro.",
  path: "/for/claude-code/image-generation",
  about: ["Claude Code", "Image generation", "Seedream 5", "Nano Banana Pro"],
  keywords: ["claude code image generation", "add image generation to claude code", "claude code generate images", "image generation for claude code"],
});

const faqItems = [
  {
    question: "Can Claude Code generate images on its own?",
    answer:
      "Not as a built-in capability. AnyCap adds image generation to Claude Code through one install path and one CLI.",
  },
  {
    question: "Which image models are available through AnyCap?",
    answer:
      "The current image generation stack includes Seedream 5, Seedream 4.5, Nano Banana Pro, and Nano Banana 2.",
  },
  {
    question: "Do I need a different workflow for image editing?",
    answer:
      "No. The same AnyCap image command can cover both text-to-image and image-to-image workflows depending on the model and flags you use.",
  },
];

const faqJsonLd = createFaqPageJsonLd(faqItems);

const installSteps = [
  "npx -y skills add anycap-ai/anycap -a claude-code -y",
  "curl -fsSL https://anycap.ai/install.sh | sh",
  "anycap login",
];

const modelCards = [
  {
    name: "Seedream 5",
    summary: "Best first pick for polished text-to-image outputs.",
  },
  {
    name: "Seedream 4.5",
    summary: "A strong alternate path when you want another text-first image generation option.",
  },
  {
    name: "Nano Banana Pro",
    summary: "Best fit when Claude Code starts from an existing image and needs iterative editing.",
  },
  {
    name: "Nano Banana 2",
    summary: "Another editing-oriented option for image-to-image workflows.",
  },
];

export default function ClaudeCodeImageGenerationPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Equip Agents", href: "/for", unlinkable: true },
          { name: "Claude Code", href: "/for/claude-code" },
          { name: "Image Generation" },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <article className="px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-[1280px] py-12 md:py-20 lg:py-24">
          <FadeIn>
            <p className="mb-4 text-[11px] tracking-[0.8px] text-[#6b7d3a]" style={mono}>
              Claude Code x Image Generation
            </p>
            <h1
              className="leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(32px, 6vw, 72px)" }}
            >
              Claude Code can&apos;t generate images by itself.
              <br />
              AnyCap adds image generation.
            </h1>
            <p className="mt-6 max-w-[760px] text-base leading-7 text-[#4d5145] md:text-lg">
              If the missing workflow is product visuals, mockups, thumbnails, or creative assets,
              this is the shortest path. Keep Claude Code for the reasoning and code. Add Seedream
              5, Seedream 4.5, Nano Banana Pro, and Nano Banana 2 through one capability runtime.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/start"
                className="inline-block rounded-lg bg-[#6b7d3a] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#f4f5f0] transition-colors hover:bg-[#1c1f17]"
                style={mono}
              >
                Get Started
              </Link>
              <Link
                href="/guides/add-tools-to-claude-code"
                className="inline-block rounded-lg border border-[#1c1f17] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] transition-colors hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
                style={mono}
              >
                Add Tools to Claude Code
              </Link>
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
              <h2 className="mb-8 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                Install path
              </h2>
              <div className="grid gap-6 lg:grid-cols-3">
                {installSteps.map((step, index) => (
                  <div key={step} className="border-l-[3px] border-[#6b7d3a] pl-6">
                    <p className="mb-2 text-[11px] tracking-[0.5px] text-[#6b7d3a]" style={mono}>
                      Step {index + 1}
                    </p>
                    <div className="bg-[#1c1f17] px-5 py-4">
                      <p className="break-all text-[13px] text-[#d4e0a4]" style={mono}>
                        {step}
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
              <h2 className="mb-8 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                Pick the right image model
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {modelCards.map((card) => (
                  <div key={card.name} className="rounded-xl border border-[#d4dbb8] p-5">
                    <h3 className="mb-2 text-[15px] font-bold text-[#1c1f17]" style={mono}>
                      {card.name}
                    </h3>
                    <p className="text-sm leading-6 text-[#4d5145]">{card.summary}</p>
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
                First commands to try
              </h2>
              <div className="space-y-6 max-w-[820px]">
                <div>
                  <p className="mb-3 text-[11px] tracking-[0.5px] text-[#5a5e52]" style={mono}>
                    Text to image
                  </p>
                  <div className="bg-[#1c1f17] px-5 py-4">
                    <p className="break-all text-[13px] text-[#d4e0a4]" style={mono}>
                      anycap image generate --model seedream-5 --prompt &quot;launch announcement visual on off-white background&quot;
                    </p>
                  </div>
                </div>
                <div>
                  <p className="mb-3 text-[11px] tracking-[0.5px] text-[#5a5e52]" style={mono}>
                    Image editing
                  </p>
                  <div className="bg-[#1c1f17] px-5 py-4">
                    <p className="break-all text-[13px] text-[#d4e0a4]" style={mono}>
                      anycap image generate --model nano-banana-pro --mode image-to-image --prompt &quot;add olive highlight accents and softer shadows&quot; --param reference_image_urls=&#39;[&quot;./mockup.png&quot;]&#39;
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
              <h2 className="mb-8 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                FAQ
              </h2>
              <div className="space-y-6 max-w-[860px]">
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
                <Link
                  href="/for/claude-code"
                  className="inline-block rounded-lg bg-[#6b7d3a] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#f4f5f0] transition-colors hover:bg-[#1c1f17]"
                  style={mono}
                >
                  Back to Claude Code hub
                </Link>
                <Link
                  href="/capabilities/image-generation"
                  className="inline-block rounded-lg border border-[#1c1f17] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] transition-colors hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
                  style={mono}
                >
                  Image Generation capability
                </Link>
                <Link
                  href="/for/claude-code/video-generation"
                  className="inline-block rounded-lg border border-[#1c1f17] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] transition-colors hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
                  style={mono}
                >
                  Claude Code video generation
                </Link>
              </div>
            </section>
          </FadeIn>
        </div>
      </article>
    </>
  );
}
