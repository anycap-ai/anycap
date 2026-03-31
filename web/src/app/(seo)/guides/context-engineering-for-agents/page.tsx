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
  title: "Context engineering for agents — How capability calls are decided",
  description:
    "Context engineering shapes what an AI agent sees, remembers, and decides to do. Learn how it affects capability calls, multimodal workflows, and why AnyCap fits as the runtime layer for agent execution.",
  alternates: { canonical: "/guides/context-engineering-for-agents" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/guides/context-engineering-for-agents",
    siteName: siteConfig.siteName,
    title: "Context engineering for agents — How capability calls are decided",
    description:
      "Learn how context engineering affects capability calls, multimodal workflows, and why AnyCap fits as the runtime layer for agent execution.",
  },
};

const pillars = [
  {
    title: "What the agent can see",
    body: "The system prompt, workspace files, prior messages, tool definitions, and execution constraints all shape the action space.",
  },
  {
    title: "What the agent can do",
    body: "Capabilities are only useful when they are exposed in a way the agent can discover and trust during execution.",
  },
  {
    title: "When the agent should switch from text to action",
    body: "Good context engineering helps the agent decide when reasoning is enough and when it should call image generation, video analysis, or another capability.",
  },
];

export default function ContextEngineeringForAgentsPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Context Engineering for Agents" },
        ]}
      />
      <article className="px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-[1280px] py-12 md:py-20 lg:py-24">
          <FadeIn>
            <p className="text-[11px] text-[#6b7d3a] tracking-[0.8px] mb-4" style={mono}>
              Guide
            </p>
            <h1
              className="leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(32px, 6vw, 72px)" }}
            >
              Context engineering
              <br />
              for agents
            </h1>
            <p className="mt-6 max-w-[760px] text-base leading-7 text-[#4d5145] md:text-lg">
              Context engineering is the practice of shaping what an AI agent sees and how it
              interprets its environment. It goes beyond prompt wording. The agent also depends
              on workspace state, tool definitions, capability availability, prior steps, and
              execution rules. That is what determines whether it stays in text or calls a
              capability through a runtime like AnyCap.
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
              <h2 className="text-lg md:text-xl text-[#1c1f17] mb-8" style={{ ...pixel }}>
                The three practical layers
              </h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {pillars.map((pillar) => (
                  <div key={pillar.title} className="border border-[#d4dbb8] p-5">
                    <h3 className="text-[14px] font-bold text-[#1c1f17] mb-2" style={mono}>
                      {pillar.title}
                    </h3>
                    <p className="text-sm text-[#4d5145] leading-6">{pillar.body}</p>
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
              <h2 className="text-lg md:text-xl text-[#1c1f17] mb-6" style={{ ...pixel }}>
                Why it matters for multimodal agents
              </h2>
              <div className="space-y-6 max-w-[780px]">
                <p className="text-base leading-7 text-[#4d5145]">
                  A multimodal agent does not just need a good prompt. It needs enough context
                  to know when to inspect an image, generate a mockup, read a video, or keep
                  reasoning in text. If the context is weak, the agent may overuse tools, skip
                  the right capability, or call the wrong model.
                </p>
                <p className="text-base leading-7 text-[#4d5145]">
                  This is where AnyCap fits. Instead of giving the agent many unrelated APIs, a
                  capability runtime exposes image generation, video generation, image
                  understanding, and video analysis through one interface. That reduces the
                  number of decisions the agent must make at execution time.
                </p>
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="text-lg md:text-xl text-[#1c1f17] mb-6" style={{ ...pixel }}>
                A simple decision pattern
              </h2>
              <div className="bg-[#1c1f17] px-6 py-5 md:px-8 md:py-6 max-w-[820px]">
                <p className="text-[13px] text-[#6b7d3a] mb-1" style={mono}>
                  # Agent reasoning pattern
                </p>
                <p className="text-[13px] text-[#d4e0a4] mb-3" style={mono}>
                  Need text only? stay in prompt
                </p>
                <p className="text-[13px] text-[#d4e0a4] mb-3" style={mono}>
                  Need a new image? anycap image generate
                </p>
                <p className="text-[13px] text-[#d4e0a4] mb-3" style={mono}>
                  Need to inspect a screenshot? anycap image read
                </p>
                <p className="text-[13px] text-[#d4e0a4]" style={mono}>
                  Need to review a recording? anycap video read
                </p>
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
                  href="/glossary/agent-capability-runtime"
                  className="inline-block px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#f4f5f0] bg-[#6b7d3a] hover:bg-[#1c1f17] transition-colors rounded-lg"
                  style={mono}
                >
                  Capability Runtime
                </Link>
                <Link
                  href="/capabilities/image-generation"
                  className="inline-block px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] border border-[#1c1f17] hover:bg-[#1c1f17] hover:text-[#f4f5f0] transition-colors rounded-lg"
                  style={mono}
                >
                  Image Generation
                </Link>
                <Link
                  href="/capabilities/video-analysis"
                  className="inline-block px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] border border-[#1c1f17] hover:bg-[#1c1f17] hover:text-[#f4f5f0] transition-colors rounded-lg"
                  style={mono}
                >
                  Video Analysis
                </Link>
              </div>
            </section>
          </FadeIn>
        </div>
      </article>
    </>
  );
}
