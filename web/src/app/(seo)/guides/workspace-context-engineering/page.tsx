import type { Metadata } from "next";
import { LocalizedLink as Link } from "@/components/LocalizedLink";
import { siteConfig } from "@/lib/site";
import { EarlyAccessBanner } from "@/components/EarlyAccessBanner";
import { FadeIn } from "@/components/FadeIn";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

export const metadata: Metadata = {
  title: "Workspace context engineering — How agents use files, tools, and state",
  description:
    "Workspace context engineering explains how files, terminals, tool definitions, and execution state shape what an AI agent decides to do. Learn how it affects tool routing and multimodal capability calls through AnyCap.",
  alternates: { canonical: "/guides/workspace-context-engineering" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/guides/workspace-context-engineering",
    siteName: siteConfig.siteName,
    title: "Workspace context engineering — How agents use files, tools, and state",
    description:
      "Learn how files, tools, and execution state shape what an AI agent decides to do and how that affects capability calls through AnyCap.",
  },
};

export default function WorkspaceContextEngineeringPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[{ name: "Home", href: "/" }, { name: "Workspace Context Engineering" }]}
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
              Workspace context
              <br />
              engineering
            </h1>
            <p className="mt-6 max-w-[760px] text-base leading-7 text-[#4d5145] md:text-lg">
              In real developer agents, context is not just prompt text. The workspace includes
              files, terminals, prior edits, tool permissions, and project rules. That context
              determines whether the agent should read code, run a command, inspect an image,
              or call a multimodal capability through AnyCap.
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
                What counts as workspace context
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 max-w-[980px]">
                <div className="border border-[#d4dbb8] p-5">
                  <h3 className="text-[14px] font-bold text-[#1c1f17] mb-2" style={mono}>Project files</h3>
                  <p className="text-sm text-[#4d5145] leading-6">
                    Source files, docs, configs, and generated artifacts tell the agent what kind of task it is in.
                  </p>
                </div>
                <div className="border border-[#d4dbb8] p-5">
                  <h3 className="text-[14px] font-bold text-[#1c1f17] mb-2" style={mono}>Execution state</h3>
                  <p className="text-sm text-[#4d5145] leading-6">
                    Open terminals, running processes, and prior commands change what is safe and useful to do next.
                  </p>
                </div>
                <div className="border border-[#d4dbb8] p-5">
                  <h3 className="text-[14px] font-bold text-[#1c1f17] mb-2" style={mono}>Tool affordances</h3>
                  <p className="text-sm text-[#4d5145] leading-6">
                    Available tools and permissions shape whether the agent can read, edit, browse, or invoke capabilities.
                  </p>
                </div>
                <div className="border border-[#d4dbb8] p-5">
                  <h3 className="text-[14px] font-bold text-[#1c1f17] mb-2" style={mono}>Task history</h3>
                  <p className="text-sm text-[#4d5145] leading-6">
                    Previous decisions and feedback help the agent avoid repetition and pick a better next action.
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
              <h2 className="text-lg md:text-xl text-[#1c1f17] mb-6" style={{ ...pixel }}>
                Why this matters for capability routing
              </h2>
              <p className="max-w-[780px] text-base leading-7 text-[#4d5145] mb-6">
                If the workspace shows a screenshot, a design review note, and an existing image
                asset, the agent should probably call an image understanding or editing
                capability. If the task history shows the team is preparing a product launch, an
                image generation or video generation capability may be the right next step.
              </p>
              <p className="max-w-[780px] text-base leading-7 text-[#4d5145]">
                AnyCap helps reduce routing complexity because multiple multimodal actions are
                exposed through one consistent runtime instead of many unrelated providers.
              </p>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24">
            <hr className="border-t border-[#d4dbb8]" />
          </div>

          <FadeIn>
            <section className="mt-16 md:mt-24 mb-8">
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/guides/context-engineering-for-agents"
                  className="inline-block px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#f4f5f0] bg-[#6b7d3a] hover:bg-[#1c1f17] transition-colors rounded-lg"
                  style={mono}
                >
                  Context Engineering
                </Link>
                <Link
                  href="/capabilities/image-understanding"
                  className="inline-block px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] border border-[#1c1f17] hover:bg-[#1c1f17] hover:text-[#f4f5f0] transition-colors rounded-lg"
                  style={mono}
                >
                  Image Understanding
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
