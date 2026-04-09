import type { Metadata } from "next";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { siteConfig } from "@/lib/site";
import { EarlyAccessBanner } from "@/components/landing/EarlyAccessBanner";
import { FadeIn } from "@/components/ui/FadeIn";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { ModelVisualShowcase } from "@/components/seo/ModelVisualShowcase";
import { modelShowcaseEntries } from "@/lib/model-showcase";
import { createFaqPageJsonLd, createTechArticleJsonLd } from "@/lib/schema";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;
const lastUpdatedLabel = "April 5, 2026";
const lastUpdatedIso = "2026-04-05";

export const metadata: Metadata = {
  title: "Veo 3.1 for AI agents — Video generation through AnyCap",
  description:
    "Use Veo 3.1 through AnyCap when AI agents need text-to-video generation inside a consistent capability runtime. Learn when to choose Veo 3.1, how to call it, and how it fits video workflows.",
  alternates: { canonical: "/models/veo-3-1" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/models/veo-3-1",
    siteName: siteConfig.siteName,
    title: "Veo 3.1 for AI agents — Video generation through AnyCap",
    description:
      "Use Veo 3.1 through AnyCap when AI agents need text-to-video generation inside a consistent capability runtime.",
  },
};

const useCases = [
  "Generate short product demos from a written concept",
  "Create motion prototypes during agent-led content workflows",
  "Turn a text brief into an explainer or teaser draft",
  "Keep video generation inside the same agent runtime used for image and analysis tasks",
];

const comparisonRows = [
  {
    dimension: "Best fit",
    veo: "Higher-end cinematic first-pass video output from a text brief",
    alternative:
      "Choose Kling 3.0 for more exploratory cinematic motion or Seedance 1.5 Pro for steadier production-friendly workflows",
  },
  {
    dimension: "Workflow role",
    veo: "Premium generation model when the first result needs to land closer to final quality",
    alternative:
      "Use a sibling model when the workflow is optimizing more for budget, iteration volume, or image-to-video continuity",
  },
  {
    dimension: "Typical agent task",
    veo: "Turn a written concept into a more polished teaser, demo, or concept clip",
    alternative:
      "Route the output into review, packaging, or follow-up analysis after the initial generation step",
  },
];

const faqItems = [
  {
    question: "What is Veo 3.1 best for?",
    answer:
      "Veo 3.1 is best for premium text-to-video generation when an agent needs a stronger cinematic first pass from a written brief.",
  },
  {
    question: "How do agents call Veo 3.1 through AnyCap?",
    answer:
      "Agents can call it with the AnyCap CLI using anycap video generate --model veo-3.1 and a prompt, then keep the rest of the workflow in the same AnyCap runtime.",
  },
  {
    question: "Should I use Veo 3.1 or Kling 3.0?",
    answer:
      "Use Veo 3.1 when the first-pass result needs to look more premium from a text brief. Use Kling 3.0 when the workflow leans more on image-to-video iteration or a different motion style.",
  },
];

const modelGuideJsonLd = createTechArticleJsonLd({
  headline: "Veo 3.1 for AI agents — Video generation through AnyCap",
  description:
    "Guide to using Veo 3.1 through AnyCap for premium text-to-video generation inside AI agent runtimes.",
  path: "/models/veo-3-1",
  about: ["Veo 3.1", "Video generation", "AnyCap", "AI agents"],
  keywords: ["veo 3.1", "veo 3.1 api", "text to video", "video generation", "anycap"],
  dateModified: lastUpdatedIso,
});

const faqJsonLd = createFaqPageJsonLd(faqItems);

export default function Veo31Page() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Models", href: "/models" },
          { name: "Veo 3.1" },
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
              Veo 3.1
              <br />
              for AI agents
            </h1>
            <p className="mt-6 max-w-[740px] text-base leading-7 text-[#4d5145] md:text-lg">
              Veo 3.1 is the current video generation model exposed through AnyCap. It is a
              good fit when an agent needs to turn a text brief into a video draft without
              branching into a separate integration path. The same CLI can then continue into
              image generation, video analysis, or other multimodal steps.
            </p>
          </FadeIn>

          <FadeIn className="mt-8">
            <EarlyAccessBanner />
          </FadeIn>

          <FadeIn className="mt-10">
            <ModelVisualShowcase entry={modelShowcaseEntries["veo-3-1"]} />
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="text-lg md:text-xl text-[#1c1f17] mb-6" style={{ ...pixel }}>
                When agents should use Veo 3.1
              </h2>
              <ul className="space-y-3 max-w-[760px]">
                {useCases.map((item) => (
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
                Call Veo 3.1 through AnyCap
              </h2>
              <div className="space-y-6 max-w-[820px]">
                <div>
                  <p className="text-[11px] text-[#5a5e52] tracking-[0.5px] mb-3" style={mono}>
                    Generate a video
                  </p>
                  <div className="bg-[#1c1f17] px-5 py-4">
                    <p className="text-[13px] text-[#d4e0a4]" style={mono}>
                      anycap video generate --model veo-3.1 --prompt &quot;a cinematic flyover of a futuristic city at dawn&quot; -o city.mp4
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-[11px] text-[#5a5e52] tracking-[0.5px] mb-3" style={mono}>
                    List available video models
                  </p>
                  <div className="bg-[#1c1f17] px-5 py-4">
                    <p className="text-[13px] text-[#d4e0a4]" style={mono}>
                      anycap video models
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
                Workflow placement
              </h2>
              <p className="max-w-[760px] text-base leading-7 text-[#4d5145] mb-6">
                In an agent workflow, Veo 3.1 is usually the generation step that follows
                planning and precedes review. A coding or automation agent may draft the concept,
                call Veo 3.1 for the video output, then route the result into review, asset
                packaging, or documentation.
              </p>
              <div className="grid gap-6 sm:grid-cols-2 max-w-[960px]">
                <div className="border border-[#d4dbb8] p-5">
                  <p className="text-[11px] text-[#6b7d3a] tracking-[0.5px] mb-2" style={mono}>
                    Upstream
                  </p>
                  <p className="text-sm text-[#4d5145] leading-6">
                    Context engineering, prompt preparation, story framing, and asset selection.
                  </p>
                </div>
                <div className="border border-[#d4dbb8] p-5">
                  <p className="text-[11px] text-[#6b7d3a] tracking-[0.5px] mb-2" style={mono}>
                    Downstream
                  </p>
                  <p className="text-sm text-[#4d5145] leading-6">
                    Review, editing notes, video analysis, and distribution inside the rest of the agent stack.
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
              <h2 className="text-lg md:text-xl text-[#1c1f17] mb-8" style={{ ...pixel }}>
                Veo 3.1 vs nearby choices
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[#d4dbb8]">
                      <th className="pb-3 pr-6 text-[11px] text-[#5a5e52] tracking-[0.5px]" style={mono}>Dimension</th>
                      <th className="pb-3 pr-6 text-[11px] text-[#6b7d3a] tracking-[0.5px]" style={mono}>Veo 3.1</th>
                      <th className="pb-3 text-[11px] text-[#5a5e52] tracking-[0.5px]" style={mono}>Alternative</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonRows.map((row) => (
                      <tr key={row.dimension} className="border-b border-[#d4dbb8]/50">
                        <td className="py-4 pr-6 text-sm font-medium text-[#1c1f17] align-top">{row.dimension}</td>
                        <td className="py-4 pr-6 text-sm text-[#4d5145] leading-6 align-top">{row.veo}</td>
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
                  href="/capabilities/video-generation"
                  className="inline-block px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#f4f5f0] bg-[#6b7d3a] hover:bg-[#1c1f17] transition-colors rounded-lg"
                  style={mono}
                >
                  Video Generation
                </Link>
                <Link
                  href="/models/kling-3-0"
                  className="inline-block px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] border border-[#1c1f17] hover:bg-[#1c1f17] hover:text-[#f4f5f0] transition-colors rounded-lg"
                  style={mono}
                >
                  Kling 3.0
                </Link>
                <Link
                  href="/models/seedance-1-5-pro"
                  className="inline-block px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] border border-[#1c1f17] hover:bg-[#1c1f17] hover:text-[#f4f5f0] transition-colors rounded-lg"
                  style={mono}
                >
                  Seedance 1.5 Pro
                </Link>
              </div>
            </section>
          </FadeIn>
        </div>
      </article>
    </>
  );
}
