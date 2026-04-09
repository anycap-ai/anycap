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
  title: "Seedance 1.5 Pro for AI agents — Video generation through AnyCap",
  description:
    "Use Seedance 1.5 Pro through AnyCap when AI agents need reliable text-to-video and image-to-video workflows through one CLI and one capability runtime.",
  alternates: { canonical: "/models/seedance-1-5-pro" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/models/seedance-1-5-pro",
    siteName: siteConfig.siteName,
    title: "Seedance 1.5 Pro for AI agents — Video generation through AnyCap",
    description:
      "Use Seedance 1.5 Pro through AnyCap for production-friendly text-to-video and image-to-video workflows.",
  },
};

const fitItems = [
  "Production-friendly image-to-video workflows that need steady visual continuity",
  "Text-to-video tasks where the agent needs a dependable default instead of a style experiment",
  "Product demos, launch visuals, and explainers built from screenshots or reference frames",
  "Teams that want one repeatable model across planning, generation, and review loops",
];

const comparisonRows = [
  {
    dimension: "Best fit",
    seedance:
      "Dependable video generation and strong image-to-video output for repeatable team workflows",
    alternative: "Choose Kling 3.0 for stronger cinematic motion style or Veo 3.1 for premium first-pass output",
  },
  {
    dimension: "Workflow role",
    seedance: "Default production model for short videos generated from prompts or still frames",
    alternative: "Use a sibling model when the task is more experimental or style-led",
  },
  {
    dimension: "Typical agent task",
    seedance: "Animate a still frame, mockup, or screenshot into a short reviewable clip",
    alternative: "Send the result into video analysis, documentation, or asset packaging after generation",
  },
];

const faqItems = [
  {
    question: "What is Seedance 1.5 Pro best for?",
    answer:
      "Seedance 1.5 Pro is a strong fit for dependable image-to-video and text-to-video workflows where agents need repeatable output and solid motion quality.",
  },
  {
    question: "How do agents call Seedance 1.5 Pro through AnyCap?",
    answer:
      "Agents can call it with the AnyCap CLI using anycap video generate --model seedance-1.5-pro for text-to-video or image-to-video mode.",
  },
  {
    question: "Should I use Seedance 1.5 Pro or Kling 3.0?",
    answer:
      "Use Seedance 1.5 Pro when the priority is a steady production workflow and strong image-to-video output. Use Kling 3.0 when the workflow wants more cinematic motion style or more exploratory generation.",
  },
];

const modelGuideJsonLd = createTechArticleJsonLd({
  headline: "Seedance 1.5 Pro for AI agents — Video generation through AnyCap",
  description:
    "Guide to using Seedance 1.5 Pro through AnyCap for repeatable text-to-video and image-to-video workflows inside AI agent runtimes.",
  path: "/models/seedance-1-5-pro",
  about: ["Seedance 1.5 Pro", "Video generation", "AnyCap", "AI agents"],
  keywords: [
    "seedance 1.5 pro",
    "seedance 1.5 pro api",
    "image to video",
    "text to video",
    "anycap",
  ],
  dateModified: lastUpdatedIso,
});

const faqJsonLd = createFaqPageJsonLd(faqItems);

export default function Seedance15ProPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Models", href: "/models" },
          { name: "Seedance 1.5 Pro" },
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
              Seedance 1.5 Pro
              <br />
              for AI agents
            </h1>
            <p className="mt-6 max-w-[760px] text-base leading-7 text-[#4d5145] md:text-lg">
              Seedance 1.5 Pro is a practical default when an agent needs reliable video
              generation without branching into a separate provider workflow. Through AnyCap,
              teams can use Seedance 1.5 Pro through the same CLI they already use for Veo
              3.1, Kling 3.0, image generation, and follow-up review tasks.
            </p>
          </FadeIn>

          <FadeIn className="mt-8">
            <EarlyAccessBanner />
          </FadeIn>

          <FadeIn className="mt-10">
            <ModelVisualShowcase entry={modelShowcaseEntries["seedance-1-5-pro"]} />
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="text-lg md:text-xl text-[#1c1f17] mb-6" style={{ ...pixel }}>
                When agents should choose Seedance 1.5 Pro
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
                Call Seedance 1.5 Pro through AnyCap
              </h2>
              <div className="space-y-6 max-w-[820px]">
                <div>
                  <p className="text-[11px] text-[#5a5e52] tracking-[0.5px] mb-3" style={mono}>
                    Generate from a text prompt
                  </p>
                  <div className="bg-[#1c1f17] px-5 py-4">
                    <p className="text-[13px] text-[#d4e0a4]" style={mono}>
                      anycap video generate --model seedance-1.5-pro --prompt &quot;a clean product reveal with subtle camera motion&quot; -o seedance-demo.mp4
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-[11px] text-[#5a5e52] tracking-[0.5px] mb-3" style={mono}>
                    Animate a reference image
                  </p>
                  <div className="bg-[#1c1f17] px-5 py-4">
                    <p className="text-[13px] text-[#d4e0a4]" style={mono}>
                      anycap video generate --model seedance-1.5-pro --mode image-to-video --prompt &quot;turn this still into a soft parallax movement&quot; --param images=&#39;[&quot;./mockup.jpg&quot;]&#39; -o seedance-animated.mp4
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
                Seedance 1.5 Pro vs nearby choices
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[#d4dbb8]">
                      <th className="pb-3 pr-6 text-[11px] text-[#5a5e52] tracking-[0.5px]" style={mono}>Dimension</th>
                      <th className="pb-3 pr-6 text-[11px] text-[#6b7d3a] tracking-[0.5px]" style={mono}>Seedance 1.5 Pro</th>
                      <th className="pb-3 text-[11px] text-[#5a5e52] tracking-[0.5px]" style={mono}>Alternative</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonRows.map((row) => (
                      <tr key={row.dimension} className="border-b border-[#d4dbb8]/50">
                        <td className="py-4 pr-6 text-sm font-medium text-[#1c1f17] align-top">{row.dimension}</td>
                        <td className="py-4 pr-6 text-sm text-[#4d5145] leading-6 align-top">{row.seedance}</td>
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
                  href="/models/veo-3-1"
                  className="inline-block px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] border border-[#1c1f17] hover:bg-[#1c1f17] hover:text-[#f4f5f0] transition-colors rounded-lg"
                  style={mono}
                >
                  Veo 3.1
                </Link>
              </div>
            </section>
          </FadeIn>
        </div>
      </article>
    </>
  );
}
