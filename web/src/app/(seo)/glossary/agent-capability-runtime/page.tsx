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
  title: "What is an agent capability runtime?",
  description:
    "An agent capability runtime is a layer that gives AI agents installable capabilities like image generation, video generation, and web actions through one interface. AnyCap is an example of an agent-native capability runtime.",
  alternates: { canonical: "/glossary/agent-capability-runtime" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/glossary/agent-capability-runtime",
    siteName: siteConfig.siteName,
    title: "What is an agent capability runtime?",
    description:
      "An agent capability runtime is a layer that gives AI agents installable capabilities like image generation, video generation, and web actions through one interface.",
  },
};

const definitionJsonLd = {
  "@context": "https://schema.org",
  "@type": "DefinedTerm",
  name: "Agent Capability Runtime",
  description:
    "A software layer that gives AI agents installable capabilities such as image generation, video generation, image read, and web actions through a single interface, rather than requiring separate integrations for each capability.",
  url: `${siteConfig.url}/glossary/agent-capability-runtime`,
};

export default function AgentCapabilityRuntimePage() {
  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: "Home", href: "/" },
        { name: "Agent Capability Runtime" },
      ]} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(definitionJsonLd) }} />

      <article className="px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-[1280px] py-12 md:py-20 lg:py-24">
          <FadeIn>
            <p className="text-[11px] text-[#6b7d3a] tracking-[0.8px] mb-4" style={mono}>Glossary</p>
            <h1
              className="leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
              style={{ ...pixel, fontSize: "clamp(28px, 5vw, 60px)" }}
            >
              What is an agent
              <br />
              capability runtime?
            </h1>
          </FadeIn>

          <FadeIn>
            <div className="mt-8 border-l-[3px] border-[#6b7d3a] pl-6 max-w-[700px]">
              <p className="text-base leading-7 text-[#4d5145] md:text-lg">
                An agent capability runtime is a software layer that gives AI agents installable
                capabilities — such as image generation, video generation, image read,
                video analysis, web search, and web crawling — through a single interface. Instead
                of requiring agents to integrate separate SDKs, manage multiple auth flows, and
                learn different APIs for each capability, a capability runtime provides one install
                path, one auth flow, and one interface for everything. It sits between the agent
                and the capabilities it needs, abstracting away provider differences and letting
                agents focus on using capabilities rather than configuring them.
              </p>
            </div>
          </FadeIn>

          <FadeIn className="mt-8">
            <EarlyAccessBanner />
          </FadeIn>

          <div className="mt-16 md:mt-24"><hr className="border-t border-[#d4dbb8]" /></div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="text-lg md:text-xl text-[#1c1f17] mb-6" style={{ ...pixel }}>
                Why it matters
              </h2>
              <div className="space-y-6 max-w-[700px]">
                <p className="text-base leading-7 text-[#4d5145]">
                  AI agents are increasingly expected to do more than reason and generate text.
                  They need to create images, produce videos, understand screenshots, analyze
                  recordings, search the web, and interact with external systems. Each of these
                  capabilities traditionally requires its own API integration, authentication,
                  and error handling.
                </p>
                <p className="text-base leading-7 text-[#4d5145]">
                  A capability runtime eliminates this fragmentation. Teams install one runtime,
                  authenticate once, and every capability becomes available through the same
                  interface — whether the agent runs in Claude Code, Cursor, Codex, or any other
                  agent product.
                </p>
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24"><hr className="border-t border-[#d4dbb8]" /></div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="text-lg md:text-xl text-[#1c1f17] mb-6" style={{ ...pixel }}>
                How it differs from other approaches
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[#d4dbb8]">
                      <th className="pb-3 pr-6 text-[11px] text-[#5a5e52] tracking-[0.5px]" style={mono}>Approach</th>
                      <th className="pb-3 pr-6 text-[11px] text-[#5a5e52] tracking-[0.5px]" style={mono}>What it does</th>
                      <th className="pb-3 text-[11px] text-[#5a5e52] tracking-[0.5px]" style={mono}>Trade-off</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-[#d4dbb8]/50">
                      <td className="py-4 pr-6 text-sm font-medium text-[#1c1f17] align-top">Direct API integration</td>
                      <td className="py-4 pr-6 text-sm text-[#4d5145] leading-6 align-top">Call each provider&apos;s API directly</td>
                      <td className="py-4 text-sm text-[#4d5145] leading-6 align-top">Full control, but requires separate auth, error handling, and interface per provider</td>
                    </tr>
                    <tr className="border-b border-[#d4dbb8]/50">
                      <td className="py-4 pr-6 text-sm font-medium text-[#1c1f17] align-top">Tool integration platform</td>
                      <td className="py-4 pr-6 text-sm text-[#4d5145] leading-6 align-top">Connect to many third-party tools via SDK</td>
                      <td className="py-4 text-sm text-[#4d5145] leading-6 align-top">Broad coverage, but still requires per-tool OAuth and SDK-level integration</td>
                    </tr>
                    <tr className="border-b border-[#d4dbb8]/50">
                      <td className="py-4 pr-6 text-sm font-medium text-[#6b7d3a] align-top">Capability runtime</td>
                      <td className="py-4 pr-6 text-sm text-[#4d5145] leading-6 align-top">One install, one auth, every capability through a consistent interface</td>
                      <td className="py-4 text-sm text-[#4d5145] leading-6 align-top">Agent-native, but capabilities are curated rather than open-ended</td>
                    </tr>
                    <tr className="border-b border-[#d4dbb8]/50">
                      <td className="py-4 pr-6 text-sm font-medium text-[#1c1f17] align-top">MCP (Model Context Protocol)</td>
                      <td className="py-4 pr-6 text-sm text-[#4d5145] leading-6 align-top">Standard protocol for agent-tool communication</td>
                      <td className="py-4 text-sm text-[#4d5145] leading-6 align-top">Protocol-level standard, but each tool still needs its own MCP server</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24"><hr className="border-t border-[#d4dbb8]" /></div>

          <FadeIn>
            <section className="mt-16 md:mt-24">
              <h2 className="text-lg md:text-xl text-[#1c1f17] mb-6" style={{ ...pixel }}>
                AnyCap as a capability runtime
              </h2>
              <p className="max-w-[700px] text-base leading-7 text-[#4d5145] mb-6">
                AnyCap is an agent-native capability runtime built from day one for agent
                workflows. It gives AI agents installable capabilities including image generation
                (Seedream 5, Nano Banana Pro), video generation (Veo 3.1), image read,
                and video analysis through one CLI and one interface. It works across Claude Code,
                Cursor, Codex, OpenCode, and OpenClaw.
              </p>
            </section>
          </FadeIn>

          <div className="mt-16 md:mt-24"><hr className="border-t border-[#d4dbb8]" /></div>

          <FadeIn>
            <section className="mt-16 md:mt-24 mb-8">
              <div className="flex flex-wrap gap-4">
                <Link href="/capabilities" className="inline-block px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#f4f5f0] bg-[#6b7d3a] hover:bg-[#1c1f17] transition-colors rounded-lg" style={mono}>See Capabilities</Link>
                <Link href="/cli" className="inline-block px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] border border-[#1c1f17] hover:bg-[#1c1f17] hover:text-[#f4f5f0] transition-colors rounded-lg" style={mono}>CLI Overview</Link>
                <a
                  href="https://github.com/anycap-ai/anycap"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-8 py-3 text-[11px] font-bold tracking-[0.8px] text-[#1c1f17] border border-[#1c1f17] hover:bg-[#1c1f17] hover:text-[#f4f5f0] transition-colors rounded-lg"
                  style={mono}
                >
                  Request Early Access
                </a>
              </div>
            </section>
          </FadeIn>
        </div>
      </article>
    </>
  );
}
