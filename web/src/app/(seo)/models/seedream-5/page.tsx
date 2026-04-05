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
  title: "Seedream 5 for AI agents — Image generation through AnyCap",
  description:
    "Use Seedream 5 through AnyCap when AI agents need polished image generation with one CLI and one capability runtime. Learn when to choose Seedream 5, how to call it, and how it fits image workflows.",
  alternates: { canonical: "/models/seedream-5" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/models/seedream-5",
    siteName: siteConfig.siteName,
    title: "Seedream 5 for AI agents — Image generation through AnyCap",
    description:
      "Use Seedream 5 through AnyCap when AI agents need polished image generation with one CLI and one capability runtime.",
  },
};

const fitItems = [
  "Marketing graphics and launch assets",
  "Product mockups and concept frames",
  "Editorial visuals and social thumbnails",
  "Agent workflows that need a polished image output on the first pass",
];

const comparisonRows = [
  {
    dimension: "Best fit",
    seedream: "Polished first-pass generation for marketing, UI, and clean visual concepts",
    alternative: "Nano Banana Pro is a stronger fit when the workflow needs iterative image editing",
  },
  {
    dimension: "Workflow role",
    seedream: "Primary generation model",
    alternative: "Use Nano Banana Pro after generation when the agent needs targeted edits",
  },
  {
    dimension: "Typical agent task",
    seedream: "Turn a prompt into a finished visual asset",
    alternative: "Use a sibling model when the task starts from an existing image",
  },
];

const faqItems = [
  {
    question: "What is Seedream 5 best for?",
    answer:
      "Seedream 5 is best for first-pass image generation when an agent needs a polished result directly from a text prompt.",
  },
  {
    question: "How do agents call Seedream 5 through AnyCap?",
    answer:
      "Agents can call it with the AnyCap CLI using anycap image generate --model seedream-5 and a text prompt.",
  },
  {
    question: "Should I use Seedream 5 or Nano Banana Pro?",
    answer:
      "Use Seedream 5 for new image generation and Nano Banana Pro when the workflow starts from an existing image and needs editing.",
  },
];

const modelGuideJsonLd = createTechArticleJsonLd({
  headline: "Seedream 5 for AI agents — Image generation through AnyCap",
  description:
    "Guide to using Seedream 5 through AnyCap when AI agents need polished first-pass image generation in a capability runtime.",
  path: "/models/seedream-5",
  about: ["Seedream 5", "Image generation", "AnyCap", "AI agents"],
  keywords: ["seedream 5", "image generation", "anycap", "ai agent model guide"],
  dateModified: lastUpdatedIso,
});

const faqJsonLd = createFaqPageJsonLd(faqItems);

export default function Seedream5Page() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Models", href: "/models" },
          { name: "Seedream 5" },
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
              Seedream 5
              <br />
              for AI agents
            </h1>
            <p className="mt-6 max-w-[740px] text-base leading-7 text-[#4d5145] md:text-lg">
              Seedream 5 is a strong default when an agent needs image generation through
              AnyCap. It fits workflows where the agent starts from a text prompt and needs
              a polished visual result without custom provider integration. With AnyCap,
              agents can call Seedream 5 through the same CLI they use for other multimodal
              capabilities.
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
                When agents should choose Seedream 5
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
                Call Seedream 5 through AnyCap
              </h2>
              <div className="space-y-6 max-w-[820px]">
                <div>
                  <p className="text-[11px] text-[#5a5e52] tracking-[0.5px] mb-3" style={mono}>
                    Generate a new image
                  </p>
                  <div className="bg-[#1c1f17] px-5 py-4">
                    <p className="text-[13px] text-[#d4e0a4]" style={mono}>
                      anycap image generate --model seedream-5 --prompt &quot;a product hero shot on a neutral background&quot;
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-[11px] text-[#5a5e52] tracking-[0.5px] mb-3" style={mono}>
                    List available image models
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

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="text-lg md:text-xl text-[#1c1f17] mb-8" style={{ ...pixel }}>
                Seedream 5 vs nearby choices
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[#d4dbb8]">
                      <th className="pb-3 pr-6 text-[11px] text-[#5a5e52] tracking-[0.5px]" style={mono}>Dimension</th>
                      <th className="pb-3 pr-6 text-[11px] text-[#6b7d3a] tracking-[0.5px]" style={mono}>Seedream 5</th>
                      <th className="pb-3 text-[11px] text-[#5a5e52] tracking-[0.5px]" style={mono}>Alternative</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonRows.map((row) => (
                      <tr key={row.dimension} className="border-b border-[#d4dbb8]/50">
                        <td className="py-4 pr-6 text-sm font-medium text-[#1c1f17] align-top">{row.dimension}</td>
                        <td className="py-4 pr-6 text-sm text-[#4d5145] leading-6 align-top">{row.seedream}</td>
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
                  href="/models/nano-banana-pro"
                  className="inline-block px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] border border-[#1c1f17] hover:bg-[#1c1f17] hover:text-[#f4f5f0] transition-colors rounded-lg"
                  style={mono}
                >
                  Nano Banana Pro
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
