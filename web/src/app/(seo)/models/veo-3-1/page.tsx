import type { Metadata } from "next";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { siteConfig } from "@/lib/site";
import { EarlyAccessBanner } from "@/components/landing/EarlyAccessBanner";
import { FadeIn } from "@/components/ui/FadeIn";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

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

export default function Veo31Page() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Veo 3.1" },
        ]}
      />
      <article className="px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-[1280px] py-12 md:py-20 lg:py-24">
          <FadeIn>
            <p className="text-[11px] text-[#6b7d3a] tracking-[0.8px] mb-4" style={mono}>
              Model
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
                      anycap video generate --model veo3.1 --prompt &quot;a cinematic flyover of a futuristic city at dawn&quot;
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
                  href="/guides/agent-skills-for-developer-tools"
                  className="inline-block px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] border border-[#1c1f17] hover:bg-[#1c1f17] hover:text-[#f4f5f0] transition-colors rounded-lg"
                  style={mono}
                >
                  Agent Skills Guide
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
