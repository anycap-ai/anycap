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
  title: "Kling 3.0 for AI agents — Video generation through AnyCap",
  description:
    "Use Kling 3.0 through AnyCap when AI agents need realistic motion, cinematic scene generation, and image-to-video workflows through one CLI.",
  alternates: { canonical: "/models/kling-3-0" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/models/kling-3-0",
    siteName: siteConfig.siteName,
    title: "Kling 3.0 for AI agents — Video generation through AnyCap",
    description:
      "Use Kling 3.0 through AnyCap for text-to-video and image-to-video workflows inside one agent runtime.",
  },
};

const fitItems = [
  "Realistic motion and cinematic scene generation",
  "Image-to-video workflows that need stronger visual continuity",
  "Agent-driven video drafts for demos, ads, and short product clips",
  "Teams that want Kling 3.0 in the same runtime as Veo 3.1 and Seedance 1.5 Pro",
];

const comparisonRows = [
  {
    dimension: "Best fit",
    kling: "Realistic motion, cinematic scenes, and flexible image-to-video output",
    alternative: "Choose Veo 3.1 for premium cinematic output or Seedance 1.5 Pro for steadier production workflows",
  },
  {
    dimension: "Workflow role",
    kling: "Creative generation model for new clips and animated stills",
    alternative: "Use a sibling model when the workflow is optimized for a different motion style or budget target",
  },
  {
    dimension: "Typical agent task",
    kling: "Turn a prompt or reference frame into a moving scene draft",
    alternative: "Route downstream into video analysis, review, or packaging once the clip is generated",
  },
];

const faqItems = [
  {
    question: "What is Kling 3.0 best for?",
    answer:
      "Kling 3.0 is a strong fit for realistic motion, cinematic visual style, and image-to-video workflows where agents need more than a basic draft clip.",
  },
  {
    question: "How do agents call Kling 3.0 through AnyCap?",
    answer:
      "Agents can call it with the AnyCap CLI using anycap video generate --model kling-3.0 and a prompt or image-to-video mode.",
  },
  {
    question: "Should I use Kling 3.0 or Veo 3.1?",
    answer:
      "Use Kling 3.0 when the workflow leans toward realistic motion and flexible image-to-video iteration. Use Veo 3.1 when the priority is a premium cinematic first pass.",
  },
];

const modelGuideJsonLd = createTechArticleJsonLd({
  headline: "Kling 3.0 for AI agents — Video generation through AnyCap",
  description:
    "Guide to using Kling 3.0 through AnyCap for text-to-video and image-to-video workflows inside AI agent runtimes.",
  path: "/models/kling-3-0",
  about: ["Kling 3.0", "Video generation", "AnyCap", "AI agents"],
  keywords: ["kling 3.0", "kling 3.0 api", "image to video", "video generation", "anycap"],
  dateModified: lastUpdatedIso,
});

const faqJsonLd = createFaqPageJsonLd(faqItems);

export default function Kling30Page() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Models", href: "/models" },
          { name: "Kling 3.0" },
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
              Kling 3.0
              <br />
              for AI agents
            </h1>
            <p className="mt-6 max-w-[760px] text-base leading-7 text-[#4d5145] md:text-lg">
              Kling 3.0 is a strong fit when an agent needs realistic motion and cinematic
              scene generation through one video runtime. Through AnyCap, teams can keep Kling
              3.0 in the same CLI and auth flow they already use for Veo 3.1, Seedance 1.5
              Pro, image generation, and downstream analysis tasks.
            </p>
          </FadeIn>

          <FadeIn className="mt-8">
            <EarlyAccessBanner />
          </FadeIn>

          <FadeIn className="mt-10">
            <ModelVisualShowcase entry={modelShowcaseEntries["kling-3-0"]} />
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="text-lg md:text-xl text-[#1c1f17] mb-6" style={{ ...pixel }}>
                When agents should choose Kling 3.0
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
                Call Kling 3.0 through AnyCap
              </h2>
              <div className="space-y-6 max-w-[820px]">
                <div>
                  <p className="text-[11px] text-[#5a5e52] tracking-[0.5px] mb-3" style={mono}>
                    Generate a new clip
                  </p>
                  <div className="bg-[#1c1f17] px-5 py-4">
                    <p className="text-[13px] text-[#d4e0a4]" style={mono}>
                      anycap video generate --model kling-3.0 --prompt &quot;a cinematic street scene in the rain with neon reflections&quot; -o kling-scene.mp4
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-[11px] text-[#5a5e52] tracking-[0.5px] mb-3" style={mono}>
                    Animate a reference image
                  </p>
                  <div className="bg-[#1c1f17] px-5 py-4">
                    <p className="text-[13px] text-[#d4e0a4]" style={mono}>
                      anycap video generate --model kling-3.0 --mode image-to-video --prompt &quot;slow push-in with subtle environmental motion&quot; --param images=&#39;[&quot;./frame.jpg&quot;]&#39; -o kling-animated.mp4
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
                Kling 3.0 vs nearby choices
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[#d4dbb8]">
                      <th className="pb-3 pr-6 text-[11px] text-[#5a5e52] tracking-[0.5px]" style={mono}>Dimension</th>
                      <th className="pb-3 pr-6 text-[11px] text-[#6b7d3a] tracking-[0.5px]" style={mono}>Kling 3.0</th>
                      <th className="pb-3 text-[11px] text-[#5a5e52] tracking-[0.5px]" style={mono}>Alternative</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonRows.map((row) => (
                      <tr key={row.dimension} className="border-b border-[#d4dbb8]/50">
                        <td className="py-4 pr-6 text-sm font-medium text-[#1c1f17] align-top">{row.dimension}</td>
                        <td className="py-4 pr-6 text-sm text-[#4d5145] leading-6 align-top">{row.kling}</td>
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
                  href="/models/veo-3-1"
                  className="inline-block px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] border border-[#1c1f17] hover:bg-[#1c1f17] hover:text-[#f4f5f0] transition-colors rounded-lg"
                  style={mono}
                >
                  Veo 3.1
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
