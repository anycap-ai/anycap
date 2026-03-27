import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/site";
import { EarlyAccessBanner } from "@/components/EarlyAccessBanner";
import { FadeIn } from "@/components/FadeIn";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";

export const runtime = "edge";

const pixel = { fontFamily: "var(--font-geist-pixel-square), monospace" } as const;
const mono = { fontFamily: "var(--font-mono), monospace" } as const;

export const metadata: Metadata = {
  title: "Video Analysis — Analyze videos through AI agents",
  description:
    "Give AI agents the ability to analyze video content using AnyCap. Extract information, summarize scenes, and understand video context through one CLI command across Claude Code, Cursor, and more.",
  alternates: { canonical: "/capabilities/video-analysis" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/capabilities/video-analysis",
    siteName: siteConfig.siteName,
    title: "Video Analysis — Analyze videos through AI agents",
    description:
      "Give AI agents the ability to analyze video content using AnyCap. Extract information, summarize scenes, and understand video context through one CLI command across Claude Code, Cursor, and more.",
  },
};

export default function VideoAnalysisPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: "Home", href: "/" },
        { name: "Capabilities", href: "/capabilities" },
        { name: "Video Analysis" },
      ]} />
      <article className="px-6 md:px-12 lg:px-20">
      <div className="mx-auto max-w-[1280px] py-12 md:py-20 lg:py-24">
        <FadeIn>
          <p className="text-[11px] text-[#6b7d3a] tracking-[3px] uppercase mb-4" style={mono}>
            Capability
          </p>
          <h1
            className="leading-[1.1] tracking-[-0.02em] text-[#1c1f17]"
            style={{ ...pixel, fontSize: "clamp(32px, 6vw, 72px)" }}
          >
            Video Analysis
          </h1>
          <p className="mt-6 max-w-[700px] text-base leading-7 text-[#4d5145] md:text-lg">
            AnyCap video analysis lets AI agents understand video content through one CLI
            command. Agents can summarize video scenes, extract key information, identify
            visual elements, and analyze video context without managing separate video
            processing pipelines. The capability works across Claude Code, Cursor, Codex,
            and other agent products — same auth, same interface as every other AnyCap capability.
          </p>
        </FadeIn>

        <FadeIn className="mt-8">
          <EarlyAccessBanner />
        </FadeIn>

        <div className="mt-16 md:mt-24"><hr className="border-t border-[#d4dbb8]" /></div>

        <FadeIn>
          <section className="mt-16 md:mt-24">
            <h2 className="text-lg md:text-xl text-[#1c1f17] mb-6" style={{ ...pixel }}>
              CLI Usage
            </h2>
            <div className="space-y-6 max-w-[800px]">
              <div>
                <p className="text-[11px] text-[#5a5e52] tracking-[2px] uppercase mb-3" style={mono}>Analyze a remote video</p>
                <div className="bg-[#1c1f17] px-5 py-4">
                  <p className="text-[13px] text-[#d4e0a4]" style={mono}>
                    anycap video read --url https://example.com/demo.mp4
                  </p>
                </div>
              </div>
              <div>
                <p className="text-[11px] text-[#5a5e52] tracking-[2px] uppercase mb-3" style={mono}>Analyze a local video</p>
                <div className="bg-[#1c1f17] px-5 py-4">
                  <p className="text-[13px] text-[#d4e0a4]" style={mono}>
                    anycap video read --file ./recording.mp4
                  </p>
                </div>
              </div>
            </div>
          </section>
        </FadeIn>

        <div className="mt-16 md:mt-24"><hr className="border-t border-[#d4dbb8]" /></div>

        <FadeIn>
          <section className="mt-16 md:mt-24">
            <h2 className="text-lg md:text-xl text-[#1c1f17] mb-6" style={{ ...pixel }}>
              When Agents Need Video Analysis
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 max-w-[900px]">
              <div className="border-l-[3px] border-[#6b7d3a] pl-5">
                <p className="text-sm font-medium text-[#1c1f17] mb-1">Bug reproduction</p>
                <p className="text-sm text-[#4d5145] leading-6">Analyze screen recordings to understand bug reports and reproduction steps.</p>
              </div>
              <div className="border-l-[3px] border-[#6b7d3a] pl-5">
                <p className="text-sm font-medium text-[#1c1f17] mb-1">Demo review</p>
                <p className="text-sm text-[#4d5145] leading-6">Summarize product demos and walkthrough recordings for documentation.</p>
              </div>
              <div className="border-l-[3px] border-[#6b7d3a] pl-5">
                <p className="text-sm font-medium text-[#1c1f17] mb-1">Content analysis</p>
                <p className="text-sm text-[#4d5145] leading-6">Extract key moments, transitions, and visual content from video files.</p>
              </div>
              <div className="border-l-[3px] border-[#6b7d3a] pl-5">
                <p className="text-sm font-medium text-[#1c1f17] mb-1">QA automation</p>
                <p className="text-sm text-[#4d5145] leading-6">Verify UI behavior in recorded test sessions as part of agent-driven QA.</p>
              </div>
            </div>
          </section>
        </FadeIn>

        <div className="mt-16 md:mt-24"><hr className="border-t border-[#d4dbb8]" /></div>

        <FadeIn>
          <section className="mt-16 md:mt-24 mb-8">
            <div className="flex flex-wrap gap-4">
              <a
                href="https://github.com/anycap-ai/anycap"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-8 py-3 text-[11px] font-bold tracking-[3px] uppercase text-[#f4f5f0] bg-[#6b7d3a] hover:bg-[#1c1f17] transition-colors"
                style={mono}
              >
                Request Early Access
              </a>
              <Link href="/capabilities" className="inline-block px-8 py-3 text-[11px] font-bold tracking-[3px] uppercase text-[#1c1f17] border border-[#1c1f17] hover:bg-[#1c1f17] hover:text-[#f4f5f0] transition-colors" style={mono}>All Capabilities</Link>
            </div>
          </section>
        </FadeIn>
      </div>
    </article>
    </>
  );
}
