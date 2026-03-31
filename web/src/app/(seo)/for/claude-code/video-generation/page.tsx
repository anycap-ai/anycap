import type { Metadata } from "next";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { EarlyAccessBanner } from "@/components/landing/EarlyAccessBanner";
import { FadeIn } from "@/components/ui/FadeIn";
import { createTechArticleJsonLd } from "@/lib/schema";
import { siteConfig } from "@/lib/site";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

export const metadata: Metadata = {
  title: "Claude Code video generation — Add video generation to Claude Code",
  description:
    "Claude Code does not ship with video generation. AnyCap adds video generation through one skill, one CLI, and Veo 3.1 as the current early access model.",
  alternates: { canonical: "/for/claude-code/video-generation" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/for/claude-code/video-generation",
    siteName: siteConfig.siteName,
    title: "Claude Code video generation — Add video generation to Claude Code",
    description:
      "Add video generation to Claude Code without leaving the agent workflow or wiring another provider stack.",
  },
};

const articleJsonLd = createTechArticleJsonLd({
  headline: "Claude Code video generation — Add video generation to Claude Code",
  description:
    "Targeted landing page for adding video generation to Claude Code through AnyCap and Veo 3.1.",
  path: "/for/claude-code/video-generation",
  about: ["Claude Code", "Video generation", "Veo 3.1", "AnyCap"],
  keywords: ["claude code video generation", "add video generation to claude code", "claude code generate video", "video generation for claude code"],
});

const faqItems = [
  {
    question: "Can Claude Code generate video on its own?",
    answer:
      "Not as a built-in capability layer. AnyCap adds video generation to Claude Code through one install path and one CLI.",
  },
  {
    question: "Which video model is available today?",
    answer: "The current early access video generation page is built around Veo 3.1.",
  },
  {
    question: "Why route video generation through AnyCap instead of a separate SDK?",
    answer:
      "Because the same runtime and auth flow can also cover image generation, image understanding, and video analysis without changing the way the agent works.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

const installSteps = [
  "npx -y skills add anycap-ai/anycap -a claude-code -y",
  "curl -fsSL https://anycap.ai/install.sh | sh",
  "anycap login",
];

const useCases = [
  "Product walkthroughs and demo clips generated directly from Claude Code workflows.",
  "Launch or social visuals that need motion rather than a single frame.",
  "Concept validation when the agent needs to show a flow, not just describe it.",
  "A consistent expansion path from image generation into video generation without another SDK.",
];

export default function ClaudeCodeVideoGenerationPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "AnyCap for Claude Code", href: "/for/claude-code" },
          { name: "Claude Code video generation" },
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
              Claude Code x Video Generation
            </p>
            <h1
              className="leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(32px, 6vw, 72px)" }}
            >
              Claude Code can&apos;t generate video by itself.
              <br />
              AnyCap adds video generation.
            </h1>
            <p className="mt-6 max-w-[760px] text-base leading-7 text-[#4d5145] md:text-lg">
              If the missing workflow is demos, walkthroughs, social clips, or motion prototypes,
              this is the shortest path. Keep Claude Code for the reasoning and build steps. Add
              Veo 3.1 through the same capability runtime that already handles image and vision
              workflows.
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
              <h2 className="mb-6 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                First command to try
              </h2>
              <div className="max-w-[820px] bg-[#1c1f17] px-5 py-4">
                <p className="break-all text-[13px] text-[#d4e0a4]" style={mono}>
                  anycap video generate --model veo3.1 --prompt &quot;slow camera move over a new product launch scene with soft studio lighting&quot;
                </p>
              </div>
              <p className="mt-4 max-w-[760px] text-sm leading-6 text-[#4d5145]">
                The point is not only the video call itself. It is that the agent can reach video
                generation through the same runtime it already uses for image and vision tasks.
              </p>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="mb-8 text-lg text-[#1c1f17] md:text-xl" style={pixel}>
                When this capability matters
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 max-w-[920px]">
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
                  href="/capabilities/video-generation"
                  className="inline-block rounded-lg border border-[#1c1f17] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] transition-colors hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
                  style={mono}
                >
                  Video Generation capability
                </Link>
                <Link
                  href="/for/claude-code/image-generation"
                  className="inline-block rounded-lg border border-[#1c1f17] px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] transition-colors hover:bg-[#1c1f17] hover:text-[#f4f5f0]"
                  style={mono}
                >
                  Claude Code image generation
                </Link>
              </div>
            </section>
          </FadeIn>
        </div>
      </article>
    </>
  );
}
