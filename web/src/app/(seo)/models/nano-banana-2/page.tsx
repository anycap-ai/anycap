import type { Metadata } from "next";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { siteConfig } from "@/lib/site";
import { EarlyAccessBanner } from "@/components/landing/EarlyAccessBanner";
import { FadeIn } from "@/components/ui/FadeIn";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { createFaqPageJsonLd, createTechArticleJsonLd } from "@/lib/schema";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;
const lastUpdatedLabel = "April 5, 2026";
const lastUpdatedIso = "2026-04-05";

export const metadata: Metadata = {
  title: "Nano Banana 2 for AI agents — Fast image generation through AnyCap",
  description:
    "Use Nano Banana 2 through AnyCap when AI agents need fast text-to-image generation, scalable image editing, and high-volume visual iteration through one CLI.",
  alternates: { canonical: "/models/nano-banana-2" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/models/nano-banana-2",
    siteName: siteConfig.siteName,
    title: "Nano Banana 2 for AI agents — Fast image generation through AnyCap",
    description:
      "Use Nano Banana 2 through AnyCap for fast text-to-image and image-to-image workflows inside agent runtimes.",
  },
};

const fitItems = [
  "Fast text-to-image generation for high-volume visual workflows",
  "Image-to-image iteration loops where latency matters as much as quality",
  "Marketing assets, product mockups, storyboards, and repeatable content generation",
  "Teams comparing Seedream 5 vs Nano Banana 2 or Nano Banana Pro vs Nano Banana 2 for throughput",
];

const comparisonRows = [
  {
    dimension: "Best fit",
    nanoBanana2:
      "Fast, scalable image generation and iterative editing across larger prompt volumes",
    alternative:
      "Choose Seedream 5 for a more polished first pass or Nano Banana Pro for higher-end revision loops",
  },
  {
    dimension: "Workflow role",
    nanoBanana2: "High-efficiency default for repeated generation and editing tasks",
    alternative:
      "Use a sibling model when the workflow is more quality-sensitive than speed-sensitive",
  },
  {
    dimension: "Typical agent task",
    nanoBanana2: "Turn a prompt into a usable draft asset fast, then iterate or batch variants",
    alternative:
      "Move to Nano Banana Pro or Seedream 5 when the draft needs a more polished finishing pass",
  },
];

const faqItems = [
  {
    question: "What is Nano Banana 2 best for?",
    answer:
      "Nano Banana 2 is best for fast, scalable image generation and image-to-image iteration when agents need more speed and throughput across many visual tasks.",
  },
  {
    question: "How do agents call Nano Banana 2 through AnyCap?",
    answer:
      "Agents can call it with the AnyCap CLI using anycap image generate --model nano-banana-2 and either a text prompt or image-to-image mode.",
  },
  {
    question: "Should I use Seedream 5 or Nano Banana 2?",
    answer:
      "Use Seedream 5 when the main goal is a polished first-pass visual. Use Nano Banana 2 when the workflow needs faster iteration, more variants, or lower-latency image generation at scale.",
  },
];

const modelGuideJsonLd = createTechArticleJsonLd({
  headline: "Nano Banana 2 for AI agents — Fast image generation through AnyCap",
  description:
    "Guide to using Nano Banana 2 through AnyCap for fast text-to-image and image-to-image workflows inside AI agent runtimes.",
  path: "/models/nano-banana-2",
  about: ["Nano Banana 2", "Image generation", "AnyCap", "AI agents"],
  keywords: [
    "nano banana 2",
    "nano banana 2 api",
    "seedream 5 vs nano banana 2",
    "image generation api",
    "anycap",
  ],
  dateModified: lastUpdatedIso,
});

const faqJsonLd = createFaqPageJsonLd(faqItems);

export default function NanoBanana2Page() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Models", href: "/models" },
          { name: "Nano Banana 2" },
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
              Nano Banana 2
              <br />
              for AI agents
            </h1>
            <p className="mt-6 max-w-[760px] text-base leading-7 text-[#4d5145] md:text-lg">
              Nano Banana 2 is the faster, more scalable image model in the current AnyCap
              image stack. It is a strong fit when an agent needs to generate or revise many
              visual drafts quickly instead of optimizing for a single polished first pass.
              Through AnyCap, it stays in the same CLI and runtime as Seedream 5, Nano Banana
              Pro, video generation, and downstream analysis steps.
            </p>
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
                When agents should choose Nano Banana 2
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
                Call Nano Banana 2 through AnyCap
              </h2>
              <div className="space-y-6 max-w-[820px]">
                <div>
                  <p className="text-[11px] text-[#5a5e52] tracking-[0.5px] mb-3" style={mono}>
                    Generate a draft image fast
                  </p>
                  <div className="bg-[#1c1f17] px-5 py-4">
                    <p className="text-[13px] text-[#d4e0a4]" style={mono}>
                      anycap image generate --model nano-banana-2 --prompt &quot;clean product hero illustration on an off-white background&quot; -o draft.png
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-[11px] text-[#5a5e52] tracking-[0.5px] mb-3" style={mono}>
                    Iterate from a reference image
                  </p>
                  <div className="bg-[#1c1f17] px-5 py-4">
                    <p className="text-[13px] text-[#d4e0a4]" style={mono}>
                      anycap image generate --model nano-banana-2 --mode image-to-image --prompt &quot;turn this into a cleaner launch visual with softer shadows&quot; --param reference_image_urls=&#39;[&quot;./input.png&quot;]&#39; -o variant.png
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-[11px] text-[#5a5e52] tracking-[0.5px] mb-3" style={mono}>
                    Inspect the model schema
                  </p>
                  <div className="bg-[#1c1f17] px-5 py-4">
                    <p className="text-[13px] text-[#d4e0a4]" style={mono}>
                      anycap image models nano-banana-2 schema --operation generate --mode text-to-image
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
              <h2 className="text-lg md:text-xl text-[#1c1f17] mb-8" style={{ ...pixel }}>
                Nano Banana 2 vs nearby choices
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[#d4dbb8]">
                      <th className="pb-3 pr-6 text-[11px] text-[#5a5e52] tracking-[0.5px]" style={mono}>Dimension</th>
                      <th className="pb-3 pr-6 text-[11px] text-[#6b7d3a] tracking-[0.5px]" style={mono}>Nano Banana 2</th>
                      <th className="pb-3 text-[11px] text-[#5a5e52] tracking-[0.5px]" style={mono}>Alternative</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonRows.map((row) => (
                      <tr key={row.dimension} className="border-b border-[#d4dbb8]/50">
                        <td className="py-4 pr-6 text-sm font-medium text-[#1c1f17] align-top">{row.dimension}</td>
                        <td className="py-4 pr-6 text-sm text-[#4d5145] leading-6 align-top">{row.nanoBanana2}</td>
                        <td className="py-4 text-sm text-[#4d5145] leading-6 align-top">{row.alternative}</td>
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
                  href="/capabilities/image-generation"
                  className="inline-block px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#f4f5f0] bg-[#6b7d3a] hover:bg-[#1c1f17] transition-colors rounded-lg"
                  style={mono}
                >
                  Image Generation
                </Link>
                <Link
                  href="/models/seedream-5"
                  className="inline-block px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] border border-[#1c1f17] hover:bg-[#1c1f17] hover:text-[#f4f5f0] transition-colors rounded-lg"
                  style={mono}
                >
                  Seedream 5
                </Link>
                <Link
                  href="/models/nano-banana-pro"
                  className="inline-block px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] border border-[#1c1f17] hover:bg-[#1c1f17] hover:text-[#f4f5f0] transition-colors rounded-lg"
                  style={mono}
                >
                  Nano Banana Pro
                </Link>
              </div>
            </section>
          </FadeIn>
        </div>
      </article>
    </>
  );
}
