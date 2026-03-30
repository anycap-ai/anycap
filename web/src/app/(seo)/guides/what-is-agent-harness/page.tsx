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
  title: "What is an agent harness? The runtime layer around the agent",
  description:
    "An agent harness is the surrounding execution layer that gives an AI agent tools, workspace state, permissions, and runtime controls. Learn how it differs from the model itself and where AnyCap fits in the stack.",
  alternates: { canonical: "/guides/what-is-agent-harness" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/guides/what-is-agent-harness",
    siteName: siteConfig.siteName,
    title: "What is an agent harness? The runtime layer around the agent",
    description:
      "Learn what an agent harness is, how it differs from the model itself, and where AnyCap fits in the stack.",
  },
};

export default function WhatIsAgentHarnessPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Home", href: "/" }, { name: "What is Agent Harness?" }]} />
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
              What is an
              <br />
              agent harness?
            </h1>
            <p className="mt-6 max-w-[760px] text-base leading-7 text-[#4d5145] md:text-lg">
              An agent harness is the execution layer around an AI model. It gives the agent
              access to files, terminals, tools, browser actions, permissions, and runtime
              policies. The model may decide what to do, but the harness defines what it can
              actually do in the real world.
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
                Agent model vs agent harness
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[#d4dbb8]">
                      <th className="pb-3 pr-6 text-[11px] text-[#5a5e52] tracking-[0.5px]" style={mono}>Layer</th>
                      <th className="pb-3 pr-6 text-[11px] text-[#5a5e52] tracking-[0.5px]" style={mono}>Role</th>
                      <th className="pb-3 text-[11px] text-[#5a5e52] tracking-[0.5px]" style={mono}>Example</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-[#d4dbb8]/50">
                      <td className="py-4 pr-6 text-sm font-medium text-[#1c1f17] align-top">Model</td>
                      <td className="py-4 pr-6 text-sm text-[#4d5145] leading-6 align-top">Reasoning, planning, language generation</td>
                      <td className="py-4 text-sm text-[#4d5145] leading-6 align-top">The LLM decides whether to read a file, ask a question, or call a capability</td>
                    </tr>
                    <tr className="border-b border-[#d4dbb8]/50">
                      <td className="py-4 pr-6 text-sm font-medium text-[#1c1f17] align-top">Harness</td>
                      <td className="py-4 pr-6 text-sm text-[#4d5145] leading-6 align-top">Execution surface and safety boundaries</td>
                      <td className="py-4 text-sm text-[#4d5145] leading-6 align-top">Files, shell, browser, permissions, tool contracts, and workflow policies</td>
                    </tr>
                    <tr className="border-b border-[#d4dbb8]/50">
                      <td className="py-4 pr-6 text-sm font-medium text-[#6b7d3a] align-top">Capability runtime</td>
                      <td className="py-4 pr-6 text-sm text-[#4d5145] leading-6 align-top">Curated capability layer the harness can expose</td>
                      <td className="py-4 text-sm text-[#4d5145] leading-6 align-top">AnyCap provides image generation, video generation, image read, and video analysis through one interface</td>
                    </tr>
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
              <h2 className="text-lg md:text-xl text-[#1c1f17] mb-6" style={{ ...pixel }}>
                Where AnyCap fits
              </h2>
              <div className="space-y-6 max-w-[780px]">
                <p className="text-base leading-7 text-[#4d5145]">
                  AnyCap is not the model itself and not the entire harness. It sits inside the
                  harness as a capability runtime. That means it gives the harness a consistent
                  way to expose multimodal actions to the agent.
                </p>
                <p className="text-base leading-7 text-[#4d5145]">
                  This is an important distinction. The harness provides the execution
                  environment. AnyCap provides the multimodal capability layer the harness can
                  surface to the agent with one CLI, one auth flow, and one interface.
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
                  href="/guides/workspace-context-engineering"
                  className="inline-block px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] border border-[#1c1f17] hover:bg-[#1c1f17] hover:text-[#f4f5f0] transition-colors rounded-lg"
                  style={mono}
                >
                  Workspace Context
                </Link>
                <Link
                  href="/compare/anycap-vs-openai-agent-builder"
                  className="inline-block px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] border border-[#1c1f17] hover:bg-[#1c1f17] hover:text-[#f4f5f0] transition-colors rounded-lg"
                  style={mono}
                >
                  Compare Page
                </Link>
              </div>
            </section>
          </FadeIn>
        </div>
      </article>
    </>
  );
}
