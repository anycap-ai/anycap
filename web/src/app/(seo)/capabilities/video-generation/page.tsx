import type { Metadata } from "next";
import { LocalizedLink as Link } from "@/components/ui/LocalizedLink";
import { siteConfig } from "@/lib/site";
import { FadeIn } from "@/components/ui/FadeIn";
import { EarlyAccessBanner } from "@/components/landing/EarlyAccessBanner";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace", fontWeight: 500 } as const;

export const metadata: Metadata = {
  title: "Video Generation — Generate videos through AI agents",
  description:
    "Give AI agents video generation capabilities through AnyCap. Generate videos from text prompts using Veo 3.1 with a single CLI command across Claude Code, Cursor, and other agent products.",
  alternates: { canonical: "/capabilities/video-generation" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/capabilities/video-generation",
    siteName: siteConfig.siteName,
    title: "Video Generation — Generate videos through AI agents",
    description:
      "Give AI agents video generation capabilities through AnyCap. Generate videos from text prompts using Veo 3.1 with a single CLI command across Claude Code, Cursor, and other agent products.",
  },
};

const models = [
  {
    name: "Veo 3.1",
    status: "Early Access",
  },
];

export default function VideoGenerationPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: "Home", href: "/" },
        { name: "Capabilities", href: "/capabilities" },
        { name: "Video Generation" },
      ]} />
      <article className="px-6 md:px-12 lg:px-20">
      <div className="mx-auto max-w-[1280px] py-12 md:py-20 lg:py-24">
        {/* Hero */}
        <FadeIn>
          <p
            className="text-[11px] text-[#6b7d3a] tracking-[0.8px] mb-4"
            style={mono}
          >
            Capability
          </p>
          <h1
            className="leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
            style={{ ...pixel, fontSize: "clamp(32px, 6vw, 72px)" }}
          >
            Video Generation
          </h1>
          <p className="mt-6 max-w-[700px] text-base leading-7 text-[#4d5145] md:text-lg">
            AnyCap video generation lets AI agents create videos from text prompts using
            Veo 3.1 through one CLI interface. Agents can generate video content as part of
            automated workflows without managing separate API integrations. The capability
            works across agent products like Claude Code, Cursor, and Codex — one command to
            generate, consistent output format, same auth flow as every other AnyCap capability.
          </p>
        </FadeIn>
        <FadeIn className="mt-8">
          <EarlyAccessBanner />
        </FadeIn>

        <div className="mt-16 md:mt-24">
          <hr className="border-t border-[#d4dbb8]" />
        </div>

        {/* Supported Models */}
        <FadeIn>
          <section className="mt-16 md:mt-24">
            <h2
              className="text-lg md:text-xl text-[#1c1f17] mb-8"
              style={{ ...pixel }}
            >
              Supported Models
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[#d4dbb8]">
                    <th className="pb-3 pr-6 text-[11px] text-[#5a5e52] tracking-[0.5px]" style={mono}>Model</th>
                    <th className="pb-3 text-[11px] text-[#5a5e52] tracking-[0.5px]" style={mono}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {models.map((model) => (
                    <tr key={model.name} className="border-b border-[#d4dbb8]/50">
                      <td className="py-4 pr-6 text-sm font-medium text-[#1c1f17]">{model.name}</td>
                      <td className="py-4">
                        <span className="inline-flex items-center gap-1.5 text-[11px] text-[#6b7d3a] tracking-[1px]" style={mono}>
                          <span className="w-1.5 h-1.5 rounded-full bg-[#6b7d3a]" />
                          {model.status}
                        </span>
                      </td>
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

        {/* Usage */}
        <FadeIn>
          <section className="mt-16 md:mt-24">
            <h2
              className="text-lg md:text-xl text-[#1c1f17] mb-6"
              style={{ ...pixel }}
            >
              Usage
            </h2>
            <div className="space-y-6 max-w-[800px]">
              <div>
                <p className="text-[11px] text-[#5a5e52] tracking-[0.5px] mb-3" style={mono}>
                  Text to Video
                </p>
                <div className="bg-[#1c1f17] px-5 py-4">
                  <p className="text-[13px] text-[#d4e0a4]" style={mono}>
                    anycap video generate --model veo3.1 --prompt &quot;a drone shot flying over a mountain range at sunset&quot;
                  </p>
                </div>
              </div>

              <div>
                <p className="text-[11px] text-[#5a5e52] tracking-[0.5px] mb-3" style={mono}>
                  List available models
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

        {/* Use Cases */}
        <FadeIn>
          <section className="mt-16 md:mt-24">
            <h2
              className="text-lg md:text-xl text-[#1c1f17] mb-6"
              style={{ ...pixel }}
            >
              When Agents Need Video Generation
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 max-w-[900px]">
              <div className="border-l-[3px] border-[#6b7d3a] pl-5">
                <p className="text-sm font-medium text-[#1c1f17] mb-1">Demo videos</p>
                <p className="text-sm text-[#4d5145] leading-6">
                  Generate product demos and walkthroughs as part of automated content pipelines.
                </p>
              </div>
              <div className="border-l-[3px] border-[#6b7d3a] pl-5">
                <p className="text-sm font-medium text-[#1c1f17] mb-1">Visual storytelling</p>
                <p className="text-sm text-[#4d5145] leading-6">
                  Create narrative video content from text descriptions within agent workflows.
                </p>
              </div>
              <div className="border-l-[3px] border-[#6b7d3a] pl-5">
                <p className="text-sm font-medium text-[#1c1f17] mb-1">Social content</p>
                <p className="text-sm text-[#4d5145] leading-6">
                  Produce short-form video clips for social media as part of content automation.
                </p>
              </div>
              <div className="border-l-[3px] border-[#6b7d3a] pl-5">
                <p className="text-sm font-medium text-[#1c1f17] mb-1">Prototyping</p>
                <p className="text-sm text-[#4d5145] leading-6">
                  Rapidly iterate on video concepts without leaving the agent environment.
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
            <h2
              className="text-lg md:text-xl text-[#1c1f17] mb-8"
              style={{ ...pixel }}
            >
              Related Models and Guides
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 max-w-[960px]">
              <Link
                href="/models/veo-3-1"
                className="border border-[#d4dbb8] p-5 hover:border-[#6b7d3a] transition-colors"
              >
                <p className="text-[11px] text-[#6b7d3a] tracking-[0.5px] mb-2" style={mono}>
                  Model
                </p>
                <h3 className="text-[15px] font-bold text-[#1c1f17] mb-2" style={mono}>
                  Veo 3.1
                </h3>
                <p className="text-sm text-[#4d5145] leading-6">
                  See when Veo 3.1 is the right choice for agent-led video generation tasks.
                </p>
              </Link>
              <Link
                href="/guides/agent-skills-for-developer-tools"
                className="border border-[#d4dbb8] p-5 hover:border-[#6b7d3a] transition-colors"
              >
                <p className="text-[11px] text-[#6b7d3a] tracking-[0.5px] mb-2" style={mono}>
                  Guide
                </p>
                <h3 className="text-[15px] font-bold text-[#1c1f17] mb-2" style={mono}>
                  Agent Skills for Developer Tools
                </h3>
                <p className="text-sm text-[#4d5145] leading-6">
                  Learn how skills make video generation capabilities portable across agent products.
                </p>
              </Link>
            </div>
          </section>
        </FadeIn>

        <div className="mt-16 md:mt-24">
          <hr className="border-t border-[#d4dbb8]" />
        </div>

        {/* CTA */}
        <FadeIn>
          <section className="mt-16 md:mt-24 mb-8">
            <div className="flex flex-wrap gap-4">
              <a
                href="https://github.com/anycap-ai/anycap"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#f4f5f0] bg-[#6b7d3a] hover:bg-[#1c1f17] transition-colors rounded-lg"
                style={mono}
              >
                Request Early Access
              </a>
              <Link
                href="/capabilities"
                className="inline-block px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] border border-[#1c1f17] hover:bg-[#1c1f17] hover:text-[#f4f5f0] transition-colors rounded-lg"
                style={mono}
              >
                All Capabilities
              </Link>
              <Link
                href="/capabilities/image-generation"
                className="inline-block px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] border border-[#1c1f17] hover:bg-[#1c1f17] hover:text-[#f4f5f0] transition-colors rounded-lg"
                style={mono}
              >
                Image Generation
              </Link>
            </div>
          </section>
        </FadeIn>
      </div>
    </article>
    </>
  );
}
